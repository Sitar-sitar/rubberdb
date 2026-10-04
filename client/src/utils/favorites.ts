/**
 * お気に入りとカタログの整合（純粋関数）。修正設計書 2026-10-01 BUG-02 / BUG-03。
 */
import type { Rubber } from "@/lib/rubberData";
import type { SavedSet } from "@/types/favorites";

export type PinnedSet = { foreId: string; backId: string };

/** カタログに無い ID を指す保存データを取り除く。ラバー ID の重複は先勝ちで 1 件にする。 */
export function pruneFavorites(
  rubberIds: string[],
  sets: SavedSet[],
  catalogIds: ReadonlySet<string>
): { rubberIds: string[]; sets: SavedSet[] } {
  return {
    rubberIds: Array.from(new Set(rubberIds)).filter(id => catalogIds.has(id)),
    sets: sets.filter(
      set => catalogIds.has(set.foreId) && catalogIds.has(set.backId)
    ),
  };
}

/**
 * 画面に出す 2 枚を決める。
 * 保存セットを再確認している間（pinnedSet あり）は、現在の提案ではなく保存時の 2 枚を表示する。
 */
export function resolveDisplayedSet(
  suggestion: { fore: Rubber; back: Rubber } | null,
  pinnedSet: PinnedSet | null,
  catalog: Rubber[]
): { fore: Rubber; back: Rubber; pinned: boolean } | null {
  if (pinnedSet) {
    const fore = catalog.find(rubber => rubber.id === pinnedSet.foreId);
    const back = catalog.find(rubber => rubber.id === pinnedSet.backId);
    if (fore && back) return { fore, back, pinned: true };
  }
  return suggestion
    ? { fore: suggestion.fore, back: suggestion.back, pinned: false }
    : null;
}
