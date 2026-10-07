import { describe, expect, it } from "vitest";
import { rubbers, type Rubber } from "@/lib/rubberData";
import type { Budget } from "@/types/favorites";
import {
  BUDGET_LIMITS,
  beginnerPricePenalty,
  suggestSet,
  withinBudget,
  sideScore,
  suggestOppositeSide,
  type SetSuggestion,
  type ReadySetSuggestion,
} from "@/utils/recommend";

function ready(result: SetSuggestion): asserts result is ReadySetSuggestion {
  expect(result.status).toBe("ready");
  if (result.status !== "ready") throw new Error("Expected two candidates");
}

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

describe("片面指定・反対面推薦", () => {
  it("未選択と不存在IDを区別し、代替品を固定しない", () => {
    for (const rubberId of [null, ""])
      expect(
        suggestOppositeSide([], conditions, { side: "fore", rubberId })
      ).toEqual({ status: "awaitingSelection", fixedSide: "fore" });
    expect(
      suggestOppositeSide([], conditions, { side: "back", rubberId: "missing" })
    ).toEqual({
      status: "invalidFixed",
      fixedSide: "back",
      fixedRubberId: "missing",
    });
  });

  it.each(["fore", "back"] as const)(
    "%s固定では反対面1件でも推薦し、固定品だけなら不足",
    side => {
      const fixed = fixture("fixed", "Butterfly", {
        price: 9000,
        discontinued: true,
      });
      const catalog = [fixed, fixture("candidate")];
      const result = suggestOppositeSide(catalog, conditions, {
        side,
        rubberId: fixed.id,
      });
      expect(result.status).toBe("ready");
      if (result.status !== "ready") throw new Error("Expected ready");
      expect(result[side]).toBe(fixed);
      expect(result[result.recommendedSide].id).toBe("candidate");
      expect(result.fixedDiscontinued).toBe(true);
      expect(result.fixedOverBudget).toBe(true);
      expect(result.recommendedAlternatives).toEqual([]);
      expect(result.recommendedTopTieCount).toBe(1);
      const insufficient = suggestOppositeSide([fixed], conditions, {
        side,
        rubberId: fixed.id,
      });
      expect(insufficient.status).toBe("insufficient");
      expect(insufficient).toMatchObject({
        fixedRubber: fixed,
        candidateCount: 0,
      });
      expect("fore" in insufficient).toBe(false);
    }
  );

  it("指定品を除外件数に含めず廃番を先に除外する", () => {
    const catalog = [
      fixture("fixed", "Butterfly", { price: null, discontinued: true }),
      fixture("old", "Nittaku", { price: null, discontinued: true }),
      fixture("unknown", "Nittaku", { price: null }),
      fixture("expensive", "Butterfly", { price: 8001 }),
    ];
    const limited = suggestOppositeSide(catalog, conditions, {
      side: "fore",
      rubberId: "fixed",
    });
    expect(limited).toMatchObject({
      status: "insufficient",
      fixedDiscontinued: true,
      fixedPriceUnknown: true,
      fixedOverBudget: false,
      excludedDiscontinuedCount: 1,
      excludedUnknownPriceCount: 1,
    });
    const free = suggestOppositeSide(
      catalog,
      { ...conditions, budget: "free" },
      { side: "fore", rubberId: "fixed" }
    );
    expect(free).toMatchObject({
      status: "ready",
      fixedOverBudget: false,
      excludedUnknownPriceCount: 0,
      excludedDiscontinuedCount: 1,
    });
  });

  it.each([
    ["easy", 6000],
    ["standard", 8000],
  ] as const)("%sの上限価格ちょうどを含み1円超過を除く", (budget, limit) => {
    const catalog = [
      fixture("fixed", "Butterfly", { price: null }),
      fixture("limit", "Nittaku", { price: limit }),
      fixture("over", "Nittaku", { price: limit + 1 }),
    ];
    const result = suggestOppositeSide(
      catalog,
      { ...conditions, budget },
      { side: "back", rubberId: "fixed" }
    );
    expect(result.status).toBe("ready");
    if (result.status !== "ready") throw new Error("Expected ready");
    expect(result.fore.id).toBe("limit");
    expect(result.recommendedList.map(r => r.id)).toEqual(["limit"]);
  });

  it("同点はID順で採用し、比較のみ同点内ブランドを巡回し、配列を変更しない", () => {
    const catalog = [
      fixture("fixed"),
      fixture("e", "Nittaku"),
      fixture("d"),
      fixture("c"),
      fixture("b"),
      fixture("a"),
      fixture("z", "VICTAS", { control: 1, spin: 1 }),
    ];
    const before = structuredClone(catalog);
    const fixed = { side: "fore", rubberId: "fixed" } as const;
    const result = suggestOppositeSide(catalog, conditions, fixed);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") throw new Error("Expected ready");
    expect(result.back.id).toBe("a");
    expect(result.recommendedTopTieCount).toBe(5);
    expect(result.recommendedAlternatives.map(r => r.id)).toEqual([
      "b",
      "e",
      "c",
    ]);
    for (const permutation of [
      catalog.toReversed(),
      [...catalog.slice(3), ...catalog.slice(0, 3)],
    ])
      expect(suggestOppositeSide(permutation, conditions, fixed)).toEqual(
        result
      );
    expect(catalog).toEqual(before);
    expect(
      suggestOppositeSide(
        catalog,
        { ...conditions, foreRole: "counter" },
        fixed
      )
    ).toEqual(result);
    const backFixed = { side: "back", rubberId: "fixed" } as const;
    expect(
      suggestOppositeSide(
        catalog,
        { ...conditions, backRole: "spin" },
        backFixed
      )
    ).toEqual(suggestOppositeSide(catalog, conditions, backFixed));
  });

  it("反対面の役割・経験・予算で候補順位が変わる", () => {
    const catalog = [
      fixture("fixed"),
      fixture("spin", "Butterfly", {
        spin: 5,
        speed: 1,
        control: 1,
        styles: ["spin"],
        price: 8000,
      }),
      fixture("control", "Nittaku", {
        spin: 1,
        speed: 1,
        control: 5,
        styles: ["control", "beginner"],
      }),
    ];
    const fixed = { side: "back", rubberId: "fixed" } as const;
    const spin = suggestOppositeSide(
      catalog,
      { ...conditions, foreRole: "spin", level: "middle", budget: "standard" },
      fixed
    );
    const control = suggestOppositeSide(
      catalog,
      { ...conditions, foreRole: "control", budget: "standard" },
      fixed
    );
    const limited = suggestOppositeSide(
      catalog,
      { ...conditions, foreRole: "spin", budget: "easy" },
      fixed
    );
    expect(spin.status === "ready" && spin.fore.id).toBe("spin");
    expect(control.status === "ready" && control.fore.id).toBe("control");
    expect(limited.status === "ready" && limited.fore.id).toBe("control");
  });

  it("全公開ID・両方向・反対面役割・経験・予算で固定と推薦の不変条件を守る", () => {
    for (const fixedRubber of rubbers)
      for (const side of ["fore", "back"] as const)
        for (const role of ["spin", "counter", "control"] as const)
          for (const level of ["beginner", "middle"] as const)
            for (const budget of ["easy", "standard", "free"] as const) {
              const result = suggestOppositeSide(
                rubbers,
                {
                  foreRole: side === "back" ? role : "spin",
                  backRole: side === "fore" ? role : "control",
                  level,
                  budget,
                },
                { side, rubberId: fixedRubber.id }
              );
              if (result.status !== "ready" && result.status !== "insufficient")
                throw new Error("Published ID missing");
              expect(result.fixedRubber.id).toBe(fixedRubber.id);
              if (result.status === "insufficient") {
                expect(
                  rubbers.filter(
                    r =>
                      r.id !== fixedRubber.id &&
                      !r.discontinued &&
                      withinBudget(r, budget)
                  )
                ).toHaveLength(0);
                continue;
              }
              const selected = result[result.recommendedSide];
              expect(result[side].id).toBe(fixedRubber.id);
              expect(selected.id).not.toBe(fixedRubber.id);
              expect(selected.discontinued).not.toBe(true);
              expect(withinBudget(selected, budget)).toBe(true);
              expect(sideScore(selected, role, level)).toBe(
                Math.max(
                  ...result.recommendedList.map(r => sideScore(r, role, level))
                )
              );
              expect(result.recommendedAlternatives.length).toBeLessThanOrEqual(
                3
              );
              expect(
                new Set(result.recommendedAlternatives.map(r => r.id)).size
              ).toBe(result.recommendedAlternatives.length);
              expect(
                result.recommendedAlternatives.some(r =>
                  [fixedRubber.id, selected.id].includes(r.id)
                )
              ).toBe(false);
            }
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
    ready(suggestion);
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
      ready(suggestion);
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
    ready(suggestion);
    expect(suggestion.foreList).toHaveLength(
      rubbers.filter(item => !item.discontinued).length
    );
  });
});

// 公開データは全予算で2件以上。任意の小さなcatalogでは不足状態を明示する。
describe("予算と候補数の不変条件", () => {
  it("全予算で予算内の候補が 2 件以上ある", () => {
    for (const budget of Object.keys(BUDGET_LIMITS) as Budget[]) {
      const count = rubbers.filter(
        rubber => !rubber.discontinued && withinBudget(rubber, budget)
      ).length;
      expect(count, budget).toBeGreaterThanOrEqual(2);
    }
  });
});

const conditions = {
  foreRole: "spin",
  backRole: "control",
  level: "middle",
  budget: "easy",
} as const;
const fixture = (
  id: string,
  brand: Rubber["brand"] = "Butterfly",
  changes: Partial<Rubber> = {}
): Rubber => ({
  ...rubbers[0],
  id,
  brand,
  price: 5000,
  speed: 3,
  spin: 3,
  control: 3,
  styles: ["spin", "control"],
  ...changes,
});

describe("順位と比較の契約", () => {
  it("同点はIDで決着し、配列順やブランド定義順に依存しない", () => {
    const catalog = [
      fixture("e", "Nittaku"),
      fixture("a"),
      fixture("d", "Nittaku"),
      fixture("c"),
      fixture("b"),
    ];
    const expected = suggestSet(catalog, conditions);
    ready(expected);
    expect([expected.fore.id, expected.back.id]).toEqual(["a", "b"]);
    expect(expected.foreTopTieCount).toBe(5);
    expect(expected.backTopTieCount).toBe(4);
    // 同点群はキューc / d,eを巡回する。採用したa,bは除く。
    expect(expected.foreAlternatives.map(r => r.id)).toEqual(["c", "d", "e"]);
    for (const permutation of [
      catalog.toReversed(),
      [...catalog.slice(2), ...catalog.slice(0, 2)],
      [catalog[3], catalog[1], catalog[4], catalog[0], catalog[2]],
    ]) {
      expect(suggestSet(permutation, conditions)).toEqual(expected);
    }
  });

  it("同点群でブランドを巡回し、低得点群は後に置く", () => {
    const catalog = [
      fixture("a"),
      fixture("b"),
      fixture("c"),
      fixture("d"),
      fixture("e", "Nittaku"),
      fixture("f", "Nittaku"),
      fixture("g", "VICTAS", { spin: 1, control: 1 }),
    ];
    const result = suggestSet(catalog, conditions);
    ready(result);
    expect(result.foreAlternatives.map(r => r.id)).toEqual(["c", "e", "d"]);
    expect(result.backAlternatives.map(r => r.id)).toEqual(["c", "e", "d"]);
    expect(result.fore.id).toBe("a");
  });

  it("全54条件で最高得点と予算・廃番制約を守る", () => {
    for (const level of ["beginner", "middle"] as const)
      for (const budget of ["easy", "standard", "free"] as const)
        for (const foreRole of ["spin", "counter", "control"] as const)
          for (const backRole of ["spin", "counter", "control"] as const) {
            const result = suggestSet(rubbers, {
              level,
              budget,
              foreRole,
              backRole,
            });
            ready(result);
            for (const [selected, list, role] of [
              [result.fore, result.foreList, foreRole],
              [result.back, result.backList, backRole],
            ] as const) {
              expect(selected.discontinued).not.toBe(true);
              expect(withinBudget(selected, budget)).toBe(true);
              expect(sideScore(selected, role, level)).toBe(
                Math.max(...list.map(r => sideScore(r, role, level)))
              );
            }
            for (const alternatives of [
              result.foreAlternatives,
              result.backAlternatives,
            ]) {
              expect(alternatives.length).toBeLessThanOrEqual(3);
              expect(new Set(alternatives.map(r => r.id)).size).toBe(
                alternatives.length
              );
              expect(
                alternatives.some(r =>
                  [result.fore.id, result.back.id].includes(r.id)
                )
              ).toBe(false);
            }
            expect(
              suggestSet(rubbers.toReversed(), {
                level,
                budget,
                foreRole,
                backRole,
              })
            ).toEqual(result);
          }
  });
});

describe("不足と除外", () => {
  it.each([0, 1])("%i件では予算外へフォールバックしない", count => {
    const result = suggestSet(
      [
        fixture("expensive", "Butterfly", { price: 9000 }),
        ...Array.from({ length: count }, (_, i) => fixture(`valid-${i}`)),
      ],
      conditions
    );
    expect(result).toEqual({
      status: "insufficient",
      candidateCount: count,
      excludedUnknownPriceCount: 0,
      excludedDiscontinuedCount: 0,
    });
    expect("fore" in result).toBe(false);
  });
  it("空catalog・全廃番・価格不明を明示的に扱う", () => {
    expect(suggestSet([], conditions).status).toBe("insufficient");
    const catalog = [
      fixture("old", "Butterfly", { discontinued: true, price: null }),
      fixture("unknown", "Nittaku", { price: null }),
      fixture("current"),
    ];
    expect(suggestSet(catalog, conditions)).toEqual({
      status: "insufficient",
      candidateCount: 1,
      excludedUnknownPriceCount: 1,
      excludedDiscontinuedCount: 1,
    });
    const result = suggestSet(catalog, { ...conditions, budget: "free" });
    ready(result);
    expect(result.excludedUnknownPriceCount).toBe(0);
    expect(result.foreList.map(r => r.id).sort()).toEqual([
      "current",
      "unknown",
    ]);
  });
  it("2件なら比較候補なしで2枚を返す", () => {
    const result = suggestSet([fixture("a"), fixture("b")], conditions);
    ready(result);
    expect(result.foreAlternatives).toEqual([]);
    expect(result.backAlternatives).toEqual([]);
  });
});
