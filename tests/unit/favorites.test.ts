import { describe, expect, it } from "vitest";
import type { Rubber } from "@/lib/rubberData";
import type { SavedSet } from "@/types/favorites";
import { pruneFavorites, resolveDisplayedSet } from "@/utils/favorites";

function rubber(id: string): Rubber {
  return {
    id,
    brand: "Butterfly",
    name: id,
    type: "裏ソフト",
    price: 5000,
    hardness: "中",
    speed: 3,
    spin: 3,
    control: 3,
    styles: ["control"],
    suitableFor: "",
    source: "https://www.butterfly.co.jp/",
    officialNote: "",
    verifiedAt: "2026-10-01",
  };
}

function savedSet(id: string, foreId: string, backId: string): SavedSet {
  return {
    id,
    foreId,
    backId,
    handedness: "right",
    foreRole: "spin",
    backRole: "control",
    level: "beginner",
    budget: "standard",
    createdAt: "2026-10-01T00:00:00.000Z",
  };
}

const catalog = [rubber("a"), rubber("b"), rubber("c"), rubber("d")];
const catalogIds = new Set(catalog.map(item => item.id));

describe("pruneFavorites（BUG-03）", () => {
  it("カタログに無いラバー ID を取り除き、順序を保つ", () => {
    const result = pruneFavorites(["c", "gone", "a"], [], catalogIds);
    expect(result.rubberIds).toEqual(["c", "a"]);
  });

  it("重複したラバー ID は先勝ちで 1 件にする", () => {
    const result = pruneFavorites(["a", "b", "a"], [], catalogIds);
    expect(result.rubberIds).toEqual(["a", "b"]);
  });

  it("片面でもカタログに無い ID を含むセットを取り除く", () => {
    const sets = [
      savedSet("1", "a", "b"),
      savedSet("2", "gone", "b"),
      savedSet("3", "a", "gone"),
      savedSet("4", "c", "d"),
    ];
    const result = pruneFavorites([], sets, catalogIds);
    expect(result.sets.map(set => set.id)).toEqual(["1", "4"]);
  });
});

describe("resolveDisplayedSet（BUG-02）", () => {
  const suggestion = { fore: catalog[0], back: catalog[1] };

  it("pinnedSet が無ければ現在の提案を返す", () => {
    const result = resolveDisplayedSet(suggestion, null, catalog);
    expect([result.fore.id, result.back.id, result.pinned]).toEqual([
      "a",
      "b",
      false,
    ]);
  });

  it("提案と違っても、保存時の 2 枚を返す", () => {
    const result = resolveDisplayedSet(
      suggestion,
      { foreId: "c", backId: "d" },
      catalog
    );
    expect([result.fore.id, result.back.id, result.pinned]).toEqual([
      "c",
      "d",
      true,
    ]);
  });

  it("保存時の ID がカタログに無ければ現在の提案へ戻る", () => {
    const result = resolveDisplayedSet(
      suggestion,
      { foreId: "gone", backId: "d" },
      catalog
    );
    expect([result.fore.id, result.back.id, result.pinned]).toEqual([
      "a",
      "b",
      false,
    ]);
  });
});
