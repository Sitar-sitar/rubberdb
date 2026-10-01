import { describe, expect, it } from "vitest";
import { rubbers, type Rubber } from "@/lib/rubberData";
import type { Budget } from "@/types/favorites";
import {
  BUDGET_LIMITS,
  beginnerPricePenalty,
  suggestSet,
  withinBudget,
} from "@/utils/recommend";

function rubberWithPrice(price: number | null): Rubber {
  const base = rubbers[0];
  return { ...base, id: `test-${price}`, price };
}

describe("withinBudget", () => {
  it("予算内の価格は候補に含める", () => {
    expect(withinBudget(rubberWithPrice(5500), "easy")).toBe(true);
    expect(withinBudget(rubberWithPrice(7000), "easy")).toBe(false);
    expect(withinBudget(rubberWithPrice(7000), "standard")).toBe(true);
  });

  it("予算指定時はオープン価格を候補から除外する", () => {
    expect(withinBudget(rubberWithPrice(null), "easy")).toBe(false);
    expect(withinBudget(rubberWithPrice(null), "standard")).toBe(false);
  });

  it("こだわらない場合はオープン価格も候補に含める", () => {
    expect(withinBudget(rubberWithPrice(null), "free")).toBe(true);
  });
});

describe("beginnerPricePenalty", () => {
  it("価格不明にダミー価格を割り当てず、固定の減点で扱う", () => {
    expect(beginnerPricePenalty(rubberWithPrice(null))).toBe(12.5);
    expect(beginnerPricePenalty(rubberWithPrice(6000))).toBe(0);
    expect(beginnerPricePenalty(rubberWithPrice(9000))).toBe(5);
  });
});

describe("suggestSet", () => {
  it("フォアとバックに別のラバーを提案する", () => {
    const suggestion = suggestSet(rubbers, {
      foreRole: "spin",
      backRole: "control",
      level: "beginner",
      budget: "standard",
    });
    expect(suggestion.fore.id).not.toBe(suggestion.back.id);
  });

  it("予算を指定した候補は全て価格が判明している", () => {
    for (const budget of ["easy", "standard"] as const) {
      const suggestion = suggestSet(rubbers, {
        foreRole: "counter",
        backRole: "counter",
        level: "middle",
        budget,
      });
      expect(suggestion.fore.price).not.toBeNull();
      expect(suggestion.back.price).not.toBeNull();
      expect(suggestion.foreList.every(item => item.price !== null)).toBe(true);
    }
  });

  it("こだわらない場合は全モデルが候補になる", () => {
    const suggestion = suggestSet(rubbers, {
      foreRole: "spin",
      backRole: "spin",
      level: "middle",
      budget: "free",
    });
    expect(suggestion.foreList).toHaveLength(rubbers.length);
  });
});

// suggestSet は候補が足りないと予算外の catalog へフォールバックする。
// そこへ到達しないことをデータ側の不変条件として保証する（修正設計書 2026-10-01 BUG-07）。
describe("予算と候補数の不変条件", () => {
  it("全予算で予算内の候補が 2 件以上ある", () => {
    for (const budget of Object.keys(BUDGET_LIMITS) as Budget[]) {
      const count = rubbers.filter(rubber =>
        withinBudget(rubber, budget)
      ).length;
      expect(count, budget).toBeGreaterThanOrEqual(2);
    }
  });
});
