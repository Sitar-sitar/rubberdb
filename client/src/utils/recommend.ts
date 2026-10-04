/**
 * 両面セットの推薦ロジック（純粋関数）。
 * 予算判定では `price: null`（オープン価格）にダミー価格を割り当てない（修正設計書 APP-02）。
 */
import type { Rubber } from "@/lib/rubberData";
import type { Budget, Level, Role } from "@/types/favorites";

/** 片面あたりの上限価格。null は「こだわらない」。 */
export const BUDGET_LIMITS: Record<Budget, number | null> = {
  easy: 6000,
  standard: 8000,
  free: null,
};

/**
 * 初心者向けスコアの価格ペナルティ。
 * オープン価格帯は各社の上位モデルが中心のため、価格不明でも高価格帯と同等に減点する。
 * 価格そのものをダミー値で埋めず、減点値としてだけ扱う。
 */
const UNKNOWN_PRICE_PENALTY = 12.5;
const PRICE_PENALTY_THRESHOLD = 7000;
const PRICE_PENALTY_DIVISOR = 400;

/** 予算を指定した場合、価格不明（オープン価格）の商品は候補から除外する。 */
export function withinBudget(rubber: Rubber, budget: Budget): boolean {
  const limit = BUDGET_LIMITS[budget];
  if (limit === null) return true;
  if (rubber.price === null) return false;
  return rubber.price <= limit;
}

export function beginnerPricePenalty(rubber: Rubber): number {
  if (rubber.price === null) return UNKNOWN_PRICE_PENALTY;
  return (
    Math.max(0, rubber.price - PRICE_PENALTY_THRESHOLD) / PRICE_PENALTY_DIVISOR
  );
}

export function sideScore(rubber: Rubber, role: Role, level: Level): number {
  const base =
    role === "spin"
      ? rubber.spin * 8 + rubber.speed * 2 + rubber.control * 2
      : role === "counter"
        ? rubber.speed * 8 + rubber.control * 4 + rubber.spin * 2
        : rubber.control * 9 + rubber.spin * 3 + rubber.speed;
  const roleFit = rubber.styles.includes(role) ? 22 : 0;
  const levelFit =
    level === "beginner"
      ? rubber.control * 5 +
        (rubber.styles.includes("beginner") ? 12 : 0) -
        beginnerPricePenalty(rubber)
      : rubber.control * 2 + rubber.speed + rubber.spin;

  return base + roleFit + levelFit;
}

export type SetConditions = {
  foreRole: Role;
  backRole: Role;
  level: Level;
  budget: Budget;
};

export type DiagnosisMode = "both" | "fixedFore" | "fixedBack";
export type Side = "fore" | "back";

type ValidFixedSuggestion = ExcludedCounts & {
  fixedSide: Side;
  fixedRubber: Rubber;
  recommendedSide: Side;
  fixedDiscontinued: boolean;
  fixedPriceUnknown: boolean;
  fixedOverBudget: boolean;
};

export type OppositeSideSuggestion =
  | { status: "awaitingSelection"; fixedSide: Side }
  | { status: "invalidFixed"; fixedSide: Side; fixedRubberId: string }
  | (ValidFixedSuggestion & { status: "insufficient"; candidateCount: 0 })
  | (ValidFixedSuggestion & {
      status: "ready";
      fore: Rubber;
      back: Rubber;
      recommendedList: Rubber[];
      recommendedAlternatives: Rubber[];
      recommendedTopTieCount: number;
    });

type ExcludedCounts = {
  excludedUnknownPriceCount: number;
  excludedDiscontinuedCount: number;
};

export type ReadySetSuggestion = ExcludedCounts & {
  status: "ready";
  fore: Rubber;
  back: Rubber;
  foreList: Rubber[];
  backList: Rubber[];
  foreAlternatives: Rubber[];
  backAlternatives: Rubber[];
  foreTopTieCount: number;
  backTopTieCount: number;
};

export type SetSuggestion =
  | ReadySetSuggestion
  | (ExcludedCounts & {
      status: "insufficient";
      candidateCount: number;
    });

function rank(candidates: Rubber[], role: Role, level: Level): Rubber[] {
  return [...candidates].sort((a, b) => {
    const difference = sideScore(b, role, level) - sideScore(a, role, level);
    return difference || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  });
}

/** 同点群の中だけブランドを巡回する。得点順と主推薦は変更しない。 */
export function comparisonAlternatives(
  ranked: Rubber[],
  role: Role,
  level: Level,
  selectedIds: ReadonlySet<string>
): Rubber[] {
  const groups = new Map<number, Map<string, Rubber[]>>();
  for (const rubber of ranked) {
    if (selectedIds.has(rubber.id)) continue;
    const score = sideScore(rubber, role, level);
    if (!groups.has(score)) groups.set(score, new Map());
    const group = groups.get(score)!;
    if (!group.has(rubber.brand)) group.set(rubber.brand, []);
    group.get(rubber.brand)!.push(rubber);
  }
  const alternatives: Rubber[] = [];
  for (const group of groups.values()) {
    const queues = Array.from(group.values());
    for (let round = 0; queues.some(queue => queue.length > round); round++) {
      for (const queue of queues) {
        if (queue[round]) alternatives.push(queue[round]);
        if (alternatives.length === 3) return alternatives;
      }
    }
  }
  return alternatives;
}

export function suggestSet(
  catalog: Rubber[],
  conditions: SetConditions
): SetSuggestion {
  const { foreRole, backRole, level, budget } = conditions;
  const available = catalog.filter(rubber => rubber.discontinued !== true);
  const candidates = available.filter(rubber => withinBudget(rubber, budget));
  const excludedUnknownPriceCount =
    BUDGET_LIMITS[budget] === null
      ? 0
      : available.filter(rubber => rubber.price === null).length;
  const excludedDiscontinuedCount = catalog.length - available.length;
  const counts = { excludedUnknownPriceCount, excludedDiscontinuedCount };
  if (candidates.length < 2) {
    return {
      status: "insufficient",
      candidateCount: candidates.length,
      ...counts,
    };
  }
  const foreList = rank(candidates, foreRole, level);
  const fore = foreList[0];
  const backList = rank(
    candidates.filter(rubber => rubber.id !== fore.id),
    backRole,
    level
  );
  const back = backList[0];
  const selectedIds = new Set([fore.id, back.id]);
  return {
    status: "ready",
    fore,
    back,
    foreList,
    backList,
    ...counts,
    foreAlternatives: comparisonAlternatives(
      foreList,
      foreRole,
      level,
      selectedIds
    ),
    backAlternatives: comparisonAlternatives(
      backList,
      backRole,
      level,
      selectedIds
    ),
    foreTopTieCount: foreList.filter(
      rubber =>
        sideScore(rubber, foreRole, level) === sideScore(fore, foreRole, level)
    ).length,
    backTopTieCount: backList.filter(
      rubber =>
        sideScore(rubber, backRole, level) === sideScore(back, backRole, level)
    ).length,
  };
}

/** 手持ちの指定品を保持し、反対面だけを既存基準で推薦する。 */
export function suggestOppositeSide(
  catalog: Rubber[],
  conditions: SetConditions,
  fixed: { side: Side; rubberId: string | null }
): OppositeSideSuggestion {
  const { side: fixedSide, rubberId } = fixed;
  if (!rubberId) return { status: "awaitingSelection", fixedSide };
  const fixedRubber = catalog.find(rubber => rubber.id === rubberId);
  if (!fixedRubber)
    return { status: "invalidFixed", fixedSide, fixedRubberId: rubberId };

  const { foreRole, backRole, level, budget } = conditions;
  const recommendedSide = fixedSide === "fore" ? "back" : "fore";
  const role = recommendedSide === "fore" ? foreRole : backRole;
  const population = catalog.filter(rubber => rubber.id !== rubberId);
  const available = population.filter(rubber => rubber.discontinued !== true);
  const limit = BUDGET_LIMITS[budget];
  const info: ValidFixedSuggestion = {
    fixedSide,
    fixedRubber,
    recommendedSide,
    fixedDiscontinued: fixedRubber.discontinued === true,
    fixedPriceUnknown: fixedRubber.price === null,
    fixedOverBudget:
      limit !== null && fixedRubber.price !== null && fixedRubber.price > limit,
    excludedDiscontinuedCount: population.length - available.length,
    excludedUnknownPriceCount:
      limit === null
        ? 0
        : available.filter(rubber => rubber.price === null).length,
  };
  const candidates = available.filter(rubber => withinBudget(rubber, budget));
  if (candidates.length === 0)
    return { status: "insufficient", candidateCount: 0, ...info };

  const recommendedList = rank(candidates, role, level);
  const recommended = recommendedList[0];
  return {
    status: "ready",
    ...info,
    fore: fixedSide === "fore" ? fixedRubber : recommended,
    back: fixedSide === "back" ? fixedRubber : recommended,
    recommendedList,
    recommendedAlternatives: comparisonAlternatives(
      recommendedList,
      role,
      level,
      new Set([rubberId, recommended.id])
    ),
    recommendedTopTieCount: recommendedList.filter(
      rubber =>
        sideScore(rubber, role, level) === sideScore(recommended, role, level)
    ).length,
  };
}
