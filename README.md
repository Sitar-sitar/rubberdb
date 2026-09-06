# RubberDB

卓球ラバー図鑑。

- Production: https://sitar-sitar.github.io/rubberdb/

## Deployment architecture

- `main` push → `.github/workflows/deploy-pages.yml` が typecheck/test/audit(warning)/build/artifact検証を実行し、GitHub Pages (Actions deploy) へ公開
- PR / push → `.github/workflows/ci.yml` が同等の検査を実施（deployはしない）

## 移行元

このリポジトリは `Sitar-sitar/Web` の `RubberDB` ブランチを履歴ごと分離したものです。旧URL (`https://sitar-sitar.github.io/Web/rubber/`) は `Sitar-sitar/Web` 側で本リポジトリへリダイレクトされます。
