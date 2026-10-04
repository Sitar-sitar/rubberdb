# RubberDB

卓球ラバー図鑑。

- Production: https://sitar-sitar.github.io/rubberdb/

## Deployment architecture

- `main` push → `.github/workflows/deploy-pages.yml` が typecheck/test/audit(warning)/build/artifact検証を実行し、GitHub Pages (Actions deploy) へ公開
- PR / push → `.github/workflows/ci.yml` が同等の検査を実施（deployはしない）

## ラバーデータの更新

データは `client/src/lib/` にあります。

- `brands.ts` — ブランド定義（バッジ配色・公式ソース・許可ホスト）。配列の順序が表示順
- `rubbers/<ブランド>.ts` — 製品データ（ブランドごとに 1 ファイル）
- `rubberData.ts` — 入口。ブランド別ファイルを連結するだけ

### 製品を追加する

1. `client/src/lib/rubbers/<ブランド>.ts` の末尾に 1 件追記する。
2. `tests/unit/publishedIds.json` に ID を追記する。
   同時に `docs/data/product-verification.json` に原産国・廃番の調査結果を追記する（全IDと1対1）。
3. `pnpm test` を実行する。診断スナップショットが変わって落ちた場合は差分を確認し、意図どおりなら `pnpm test -u` で更新して、スナップショットの差分もコミットに含める。
4. `pnpm check`、`pnpm build`、`pnpm verify:artifact` を通す。

### ブランドを追加する

1. `client/src/lib/brands.ts` に 1 要素追加する。
2. `client/src/lib/rubbers/<ブランド>.ts` を作り、`rubberData.ts` に import と連結を 1 行ずつ足す（`brands.ts` と同じ順）。
3. 以降は製品の追加と同じ。

### 入力ルール

- **公開済みの `id` は変更・削除しない。** `id` はお気に入りのキーで、カタログから消えた ID の保存データは利用者の端末で読み込み時に削除される。変更するとテスト（公開済み ID の台帳）が落ちる。
- `id` は英小文字・数字・ハイフンのみ。
- `price` はメーカー公式の税込価格（円）。オープン価格は `null`。表示用の文字列は自動生成されるので書かない。
- `verifiedAt` は公式ページを確認した日（`YYYY-MM-DD`）。
- `country` は製品単位の公式製造国を確認できた場合のみ記載する。部材・比較対象・ブランド本社所在地から推測しない。確認できない場合は省略し、画面では「未確認」と表示する。
- `discontinued` は公式の製品単位の生産終了告知を確認した場合のみ `true`。製品と公開IDを削除しない。未指定は現行品の保証ではない。廃番は新規推薦から除外し、保存済みデータは保持する。
- 調査台帳には項目ごとの `confirmed` / `unconfirmed`、値（未確認は `null`）、実際の確認日（JST）、ブランドの許可ホスト内の公式HTTPS出典、根拠または未確認理由を記録する。原産国だけの調査で既存 `verifiedAt` を更新しない。
- `source` は、そのブランドの公式ドメイン（`brands.ts` の `hosts`）の https URL。
- `speed` / `spin` / `control` は 1〜5 の整数。サイト内比較用の目安。
- JS の合計サイズ上限は 400 kB（`scripts/verify-build-artifact.mjs`）。近づいたら、上限を上げる前にデータの分割読み込みを検討する。

### 診断の変更を検証する

`pnpm report:recommendations` は全54条件・108面の得点、同点数、比較候補、採用分布をJSON出力する。同点はASCII ID順で決め、比較候補だけ同点内でブランドを巡回する。スナップショットを更新する前に新旧差分の理由と最高得点・予算・廃番制約を確認する。v1.2.0の比較記録は `docs/research/recommendation-v1.2.0-comparison.md`。本バッチの公開基準はJS 390 KiB以下・CSS 60 KiB以下。

## ドキュメント

- 設計書・実装ログ: `docs/`（索引は `docs/設計書インデックス.md`）
- 2026-09-05 以前の仕様メモ・調査メモ: `docs/research/`

## 移行元

このリポジトリは `Sitar-sitar/Web` の `RubberDB` ブランチを履歴ごと分離したものです。旧URL (`https://sitar-sitar.github.io/Web/rubber/`) は `Sitar-sitar/Web` 側で本リポジトリへリダイレクトされます。
