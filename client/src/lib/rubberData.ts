/**
 * 卓球ラバー図鑑 / ラボ・アーカイブ（データの入口）
 * Design reminder: 仕様を同じ基準で比較できる、精密で率直なデータ設計を保つ。
 * 製品データはブランド別に `lib/rubbers/<ブランド>.ts`、ブランド定義は `lib/brands.ts` にある。
 * 追加手順は README の「ラバーデータの更新」を参照する。
 */
import type { BrandId } from "@/lib/brands";
import butterfly from "@/lib/rubbers/butterfly";
import nittaku from "@/lib/rubbers/nittaku";
import victas from "@/lib/rubbers/victas";
import yasaka from "@/lib/rubbers/yasaka";
import tibhar from "@/lib/rubbers/tibhar";
import xiom from "@/lib/rubbers/xiom";
import stiga from "@/lib/rubbers/stiga";
import donic from "@/lib/rubbers/donic";
import andro from "@/lib/rubbers/andro";
import joola from "@/lib/rubbers/joola";
import juic from "@/lib/rubbers/juic";
import type { Rubber, RubberEntry } from "@/types/rubber";

export { sources } from "@/lib/brands";
export type { PlayStyle, Rubber, RubberType } from "@/types/rubber";

function withBrand(brand: BrandId, entries: RubberEntry[]): Rubber[] {
  return entries.map(entry => ({ ...entry, brand }));
}

/** 連結順は lib/brands.ts と同じ。カタログ表示順に使用し、診断の同点はID順で決める。 */
export const rubbers: Rubber[] = [
  ...withBrand("Butterfly", butterfly),
  ...withBrand("Nittaku", nittaku),
  ...withBrand("VICTAS", victas),
  ...withBrand("Yasaka", yasaka),
  ...withBrand("TIBHAR", tibhar),
  ...withBrand("XIOM", xiom),
  ...withBrand("STIGA", stiga),
  ...withBrand("DONIC", donic),
  ...withBrand("andro", andro),
  ...withBrand("JOOLA", joola),
  ...withBrand("JUIC", juic),
];

/** 中国製ラバーガイドで固定表示する製品ID。実在チェックは tests/unit/rubberData.test.ts で担保する。 */
export const chinaGuideRubberIds: { beginner: string[]; advanced: string[] } = {
  beginner: ["triple-regular", "shining-dragon-2"],
  advanced: ["rising-dragon-2", "triple-double-extra"],
};
