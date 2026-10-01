import { describe, expect, it } from "vitest";
import {
  chinaGuideRubberIds,
  rubbers,
  sources,
  type Rubber,
} from "@/lib/rubberData";
import {
  allowedSourceHosts,
  brandHosts,
  brands,
  brandTint,
} from "@/lib/brands";
import publishedIds from "./publishedIds.json";

const SCORE_KEYS: Array<keyof Pick<Rubber, "speed" | "spin" | "control">> = [
  "speed",
  "spin",
  "control",
];

describe("ラバーデータの整合性", () => {
  it("1件以上のデータを持つ", () => {
    expect(rubbers.length).toBeGreaterThan(0);
  });

  it("id が全件ユニーク", () => {
    const ids = rubbers.map(rubber => rubber.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("speed / spin / control は 1〜5 の整数", () => {
    for (const rubber of rubbers) {
      for (const key of SCORE_KEYS) {
        const value = rubber[key];
        expect(
          Number.isInteger(value) && value >= 1 && value <= 5,
          `${rubber.id}.${key} = ${value}`
        ).toBe(true);
      }
    }
  });

  it("price は null または 0 より大きい有限数", () => {
    for (const rubber of rubbers) {
      if (rubber.price === null) continue;
      expect(
        Number.isFinite(rubber.price) && rubber.price > 0,
        `${rubber.id}.price = ${rubber.price}`
      ).toBe(true);
    }
  });

  it("source は許可済みメーカードメインの https URL", () => {
    for (const rubber of rubbers) {
      const url = new URL(rubber.source);
      expect(url.protocol, rubber.id).toBe("https:");
      expect(
        allowedSourceHosts.has(url.hostname),
        `${rubber.id} ${url.hostname}`
      ).toBe(true);
    }
  });

  it("公式ソース一覧も許可済みメーカードメインの https URL", () => {
    for (const source of sources) {
      const url = new URL(source.url);
      expect(url.protocol, source.name).toBe("https:");
      expect(
        allowedSourceHosts.has(url.hostname),
        `${source.name} ${url.hostname}`
      ).toBe(true);
    }
  });

  it("styles が空でない", () => {
    for (const rubber of rubbers) {
      expect(rubber.styles.length, rubber.id).toBeGreaterThan(0);
    }
  });

  it("brand が brandTint に網羅されている", () => {
    for (const rubber of rubbers) {
      expect(brandTint[rubber.brand], rubber.id).toBeTruthy();
    }
  });

  it("brands.ts の全ブランドに製品が 1 件以上ある", () => {
    const usedBrands = new Set(rubbers.map(rubber => rubber.brand));
    for (const brand of brands) {
      expect(usedBrands.has(brand.id), brand.id).toBe(true);
    }
  });

  it("source のホストが、その製品のブランドの公式ホストである", () => {
    for (const rubber of rubbers) {
      const host = new URL(rubber.source).hostname;
      expect(
        brandHosts[rubber.brand].includes(host),
        `${rubber.id} ${host}`
      ).toBe(true);
    }
  });

  it("id は英小文字・数字・ハイフンのみ", () => {
    for (const rubber of rubbers) {
      expect(rubber.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("ブランド＋製品名が重複しない", () => {
    const keys = rubbers.map(rubber => `${rubber.brand}|${rubber.name}`);
    const duplicated = keys.filter((key, index) => keys.indexOf(key) !== index);
    expect(duplicated).toEqual([]);
  });

  it("name / suitableFor / officialNote が空でない", () => {
    for (const rubber of rubbers) {
      expect(rubber.name.trim(), rubber.id).not.toBe("");
      expect(rubber.suitableFor.trim(), rubber.id).not.toBe("");
      expect(rubber.officialNote.trim(), rubber.id).not.toBe("");
    }
  });

  it("verifiedAt が未来日でない（タイムゾーン差の 1 日は許容）", () => {
    const limit = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    for (const rubber of rubbers) {
      expect(
        rubber.verifiedAt <= limit,
        `${rubber.id} ${rubber.verifiedAt}`
      ).toBe(true);
    }
  });

  it("verifiedAt が YYYY-MM-DD 形式の有効な日付", () => {
    for (const rubber of rubbers) {
      expect(rubber.verifiedAt, rubber.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const parsed = new Date(`${rubber.verifiedAt}T00:00:00Z`);
      expect(Number.isNaN(parsed.getTime()), rubber.id).toBe(false);
      expect(rubber.verifiedAt.slice(0, 10), rubber.id).toBe(
        parsed.toISOString().slice(0, 10)
      );
    }
  });

  it("中国製ガイドで固定参照する ID が実在する", () => {
    const ids = new Set(rubbers.map(rubber => rubber.id));
    for (const id of [
      ...chinaGuideRubberIds.beginner,
      ...chinaGuideRubberIds.advanced,
    ]) {
      expect(ids.has(id), id).toBe(true);
    }
  });
});

/**
 * 公開済み ID の台帳（修正設計書 2026-10-01 M-06）。
 * ID はお気に入りのキーで、カタログから消えた ID の保存データは読み込み時に削除される。
 */
describe("公開済み ID の台帳", () => {
  const catalogIds = new Set(rubbers.map(rubber => rubber.id));
  const ledger = new Set<string>(publishedIds);

  it("公開済み ID は変更・削除されていない（利用者のお気に入りが消えるため）", () => {
    const missing = publishedIds.filter(id => !catalogIds.has(id));
    expect(missing).toEqual([]);
  });

  it("カタログの ID はすべて tests/unit/publishedIds.json に載っている", () => {
    const unlisted = rubbers
      .map(rubber => rubber.id)
      .filter(id => !ledger.has(id));
    expect(unlisted).toEqual([]);
  });
});
