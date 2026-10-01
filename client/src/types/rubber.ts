/** ラバーデータの型定義。 */
import type { BrandId } from "@/lib/brands";

export type RubberType = "裏ソフト" | "表ソフト" | "粒高" | "アンチ";
export type PlayStyle =
  | "spin"
  | "counter"
  | "sticky"
  | "control"
  | "shortPips"
  | "defense"
  | "beginner";
export type Hardness = "軟" | "中" | "中硬" | "硬" | "—";

export type Rubber = {
  /** 公開後は変更・削除しない（利用者のお気に入りのキーになる）。 */
  id: string;
  brand: BrandId;
  name: string;
  type: RubberType;
  /** メーカー公式の税込価格（円）。オープン価格は null。 */
  price: number | null;
  hardness: Hardness;
  country?: string;
  speed: number;
  spin: number;
  control: number;
  styles: PlayStyle[];
  suitableFor: string;
  source: string;
  officialNote: string;
  /** メーカー公式情報を確認した日（YYYY-MM-DD） */
  verifiedAt: string;
};

/** ブランド別ファイルに書く 1 件分。brand は rubberData.ts が付ける。 */
export type RubberEntry = Omit<Rubber, "brand">;
