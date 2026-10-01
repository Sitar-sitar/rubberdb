/**
 * ブランド定義の正本（修正設計書 2026-10-01 M-01）。
 * ブランドを追加するときはここへ 1 要素足し、`lib/rubbers/<ブランド>.ts` を作る。
 * 配列の順序が、カタログとフッターの表示順になる。
 */
export const brands = [
  {
    id: "Butterfly",
    tint: "bg-[#fff0ec] text-[#a53d30]",
    sourceName: "Butterfly ラバー製品情報",
    sourceUrl: "https://www.butterfly.co.jp/products/rubber/",
    hosts: ["www.butterfly.co.jp"],
  },
  {
    id: "Nittaku",
    tint: "bg-[#fceded] text-[#a63d3d]",
    sourceName: "Nittaku 裏ソフト製品情報",
    sourceUrl: "https://www.nittaku.com/products/rubbers/pimples-in/",
    hosts: ["www.nittaku.com"],
  },
  {
    id: "VICTAS",
    tint: "bg-[#edf4ff] text-[#28588f]",
    sourceName: "VICTAS ラバー製品情報",
    sourceUrl: "https://www.victas.com/products/?cat=3",
    hosts: ["www.victas.com"],
  },
  {
    id: "Yasaka",
    tint: "bg-[#eff9fb] text-[#26718a]",
    sourceName: "Yasaka ラバー製品情報",
    sourceUrl: "https://www.yasakajp.com/goods/rub/",
    hosts: ["www.yasakajp.com"],
  },
  {
    id: "TIBHAR",
    tint: "bg-[#eef8f2] text-[#2e7554]",
    sourceName: "TIBHAR JAPAN ラバー製品情報",
    sourceUrl: "https://tibhar-japan.com/rubber/",
    hosts: ["tibhar-japan.com"],
  },
  {
    id: "XIOM",
    tint: "bg-[#fff6e8] text-[#805b20]",
    sourceName: "XIOM 日本向け公式ストア",
    sourceUrl: "https://m.xiom.jp/",
    hosts: ["m.xiom.jp"],
  },
  {
    id: "STIGA",
    tint: "bg-[#edf4ff] text-[#245aaa]",
    sourceName: "STIGA ラバー製品情報",
    sourceUrl: "https://stigasports.jp/products_cat/rubber",
    hosts: ["stigasports.jp"],
  },
  {
    id: "DONIC",
    tint: "bg-[#eef2ff] text-[#2e4d94]",
    sourceName: "DONIC-JAPAN ラバーカタログ",
    sourceUrl: "https://www.donic.jp/home/download.php?pg=Catalogue",
    hosts: ["www.donic.jp"],
  },
  {
    // 製品の出典は andro.jp、ソース一覧は www.andro.de。現状の値をそのまま保持している。
    id: "andro",
    tint: "bg-[#f6efff] text-[#704b9e]",
    sourceName: "andro ラバー製品情報",
    sourceUrl: "https://www.andro.de/ja/raha",
    hosts: ["andro.jp", "www.andro.de"],
  },
  {
    id: "JOOLA",
    tint: "bg-[#f2f4e9] text-[#4f6428]",
    sourceName: "JOOLA JAPAN ラバー製品情報",
    sourceUrl: "https://joola.co.jp/collections/table-tennis-rubbers-1",
    hosts: ["joola.co.jp"],
  },
  {
    id: "JUIC",
    tint: "bg-[#fff4df] text-[#8a5a18]",
    sourceName: "JUIC 粘着ラバー製品情報",
    sourceUrl: "https://www.juic.co.jp/view/category/ct65",
    hosts: ["www.juic.co.jp"],
  },
] as const;

export type BrandId = (typeof brands)[number]["id"];

/** ブランドごとのバッジ配色。 */
export const brandTint = Object.fromEntries(
  brands.map(brand => [brand.id, brand.tint])
) as Record<BrandId, string>;

/** ブランドごとに許可する出典ホスト。 */
export const brandHosts = Object.fromEntries(
  brands.map((brand): [BrandId, readonly string[]] => [brand.id, brand.hosts])
) as Record<BrandId, readonly string[]>;

/** フッターに出すメーカー公式ソース一覧。 */
export const sources: { name: string; url: string }[] = brands.map(brand => ({
  name: brand.sourceName,
  url: brand.sourceUrl,
}));

/** 出典として許可する全ホスト。 */
export const allowedSourceHosts: ReadonlySet<string> = new Set(
  brands.flatMap(brand => [...brand.hosts])
);
