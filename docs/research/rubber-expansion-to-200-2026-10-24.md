# ラバー200製品への拡充 — 公式確認・実装記録

確認日・公開日: 2026-10-24（JST）。提示・承認済み37製品を追加し、11ブランド163製品から200製品へ拡充した。色・厚さ違いは別件に数えない。本番公開・受入済み（公開証拠は末尾）。既存のPhase 5 AC-08実機受入保留は維持する。

## 公式確認結果

価格は公式税込価格。オープン価格はnull。製造国を製品単位で確認できた34件だけcountryを設定した。TIBHARの3件は公式一覧に「原産国表示のないものは、すべてドイツ製」との共通注記があるが、製品単位の記載を確認できなかったため保守的に未確認とした。INFINITY 2件は硬度も未確認で「—」。未確認は推定値で埋めない。

インセプションの生産終了は「厚」サイズのみ（2025-02-28）。「中」が掲載されているため製品全体のdiscontinuedは設定しない。ほか36件も公式の製品全体の生産終了告知は確認できず、廃番状態は全37件unconfirmed。掲載継続を現行販売・在庫の保証とはしない。

| ブランド | ID・製品 | 種別 | 税込価格 | 原産国 | 公式仕様の要点・出典 |
|---|---|---|---:|---|---|
| butterfly | tenergy-19 / テナジー19 | 裏ソフト | オープン価格 | 日本 | [ハイテンション裏ラバー／硬度36](https://www.butterfly.co.jp/products/detail/06090.html) |
| butterfly | tenergy-05-hard / テナジー05ハード | 裏ソフト | オープン価格 | 日本 | [ハイテンション裏ラバー／硬度43](https://www.butterfly.co.jp/products/detail/06030.html) |
| butterfly | tenergy-80fx / テナジー80FX | 裏ソフト | オープン価格 | 日本 | [ハイテンション裏ラバー／硬度32](https://www.butterfly.co.jp/products/detail/05940.html) |
| butterfly | tenergy-64fx / テナジー64FX | 裏ソフト | オープン価格 | 日本 | [ハイテンション裏ラバー／硬度32](https://www.butterfly.co.jp/products/detail/05920.html) |
| butterfly | impartial-xb / インパーシャルXB | 表ソフト | 5,500円 | 日本 | [ハイテンション表ラバー／硬度30](https://www.butterfly.co.jp/products/detail/00410.html) |
| butterfly | ilius-s / イリウスS | 粒高 | 2,970円 | 日本 | [ツブ高／アブソーバー スポンジ ヘビー／硬度45](https://www.butterfly.co.jp/products/detail/00450.html) |
| butterfly | feint-long-2 / フェイント ロング2 | 粒高 | 2,530円 | 日本 | [ツブ高／硬度38／厚さ1.3・1.1](https://www.butterfly.co.jp/products/detail/00190.html) |
| nittaku | factive / ファクティブ | 裏ソフト | 4,950円 | ドイツ | [テンション系／硬度35.0（ドイツ基準45.0）](https://www.nittaku.com/products/rubbers/post-1) |
| nittaku | flyatt-spin / フライアット スピン | 裏ソフト | 4,620円 | 日本 | [AC系／硬度35.0](https://www.nittaku.com/products/rubbers/post-9) |
| nittaku | inception / インセプション | 裏ソフト | 3,300円 | ドイツ | [コントロール系／硬度32.5（ドイツ基準42.5）／厚さ中のみ。厚は生産終了](https://www.nittaku.com/products/rubbers/post-55) |
| nittaku | ultec / ウルテック | 裏ソフト | 3,520円 | 日本 | [コントロール系／硬度30.0](https://www.nittaku.com/products/rubbers/post-65) |
| nittaku | moristo-sp-ax / モリストSP AX | 表ソフト | 6,820円 | ドイツ | [テンション系表ソフト／硬度30.0（ドイツ基準40.0）／横目](https://www.nittaku.com/products/rubbers/post-29) |
| nittaku | hammond-fa / ハモンド FA | 表ソフト | 3,520円 | 日本 | [IE系表ソフト／硬度35.0／縦目](https://www.nittaku.com/products/rubbers/post-31) |
| nittaku | best-anti / ベスト アンチ | アンチ | 3,520円 | 日本 | [アンチ／硬度20.0](https://www.nittaku.com/products/rubbers/post-46) |
| andro | nuzn-45 / NUZN 45 | 裏ソフト | 9,350円 | ドイツ | [スピン系テンション／硬度45°](https://www.andro.de/ja/nuzn-45jp) |
| andro | nuzn-48 / NUZN 48 | 裏ソフト | 9,900円 | ドイツ | [スピン系テンション／硬度48°](https://www.andro.de/ja/nuzn-48jp) |
| andro | nuzn-50 / NUZN 50 | 裏ソフト | 11,000円 | ドイツ | [スピン系テンション／硬度50°](https://www.andro.de/ja/nuzn-50jp) |
| andro | nuzn-55 / NUZN 55 | 裏ソフト | 11,000円 | ドイツ | [テンション系／硬度55°](https://www.andro.de/ja/nuzn-55jp) |
| andro | rasanter-c45 / ラザンター C45 | 裏ソフト | 8,360円 | ドイツ | [UMテンション／エナジー・セル／硬度45°](https://www.andro.de/ja/rasanter-c45jp) |
| andro | rasanter-c48 / ラザンター C48 | 裏ソフト | 8,360円 | ドイツ | [UMテンション／エナジー・セル／硬度48°](https://www.andro.de/ja/rasanter-c48jp) |
| andro | rasanter-c53 / ラザンター C53 | 裏ソフト | 8,360円 | ドイツ | [UMテンション／エナジー・セル／硬度53°](https://www.andro.de/ja/rasanter-c53jp) |
| victas | xegna / ゼグナ | 裏ソフト | 6,820円 | 中国 | [粘着性裏ソフト／硬度47.5±3](https://www.victas.com/products/detail.html?id=728) |
| victas | xegna-spin / ゼグナスピン | 裏ソフト | 6,820円 | 中国 | [粘着性裏ソフト／硬度52.5±3](https://www.victas.com/products/detail.html?id=729) |
| victas | v11-extra / V>11 エキストラ | 裏ソフト | 6,050円 | ドイツ | [ライトニングテンション／硬度47.5±3](https://www.victas.com/products/detail.html?id=785) |
| victas | v03 / V>03 | 裏ソフト | 4,730円 | ドイツ | [ハイエナジーテンション／硬度42.5±3](https://www.victas.com/products/detail.html?id=786) |
| victas | vj07-stiff / VJ>07 スティフ | 裏ソフト | 4,840円 | 日本 | [スピン系テンション／硬度45.0±3](https://www.victas.com/products/detail.html?id=51) |
| victas | vj07-regular / VJ>07 レギュラー | 裏ソフト | 4,070円 | 日本 | [スピン系高弾性／硬度42.5±3](https://www.victas.com/products/detail.html?id=52) |
| victas | spinpips-d2 / スピンピップス D2 | 表ソフト | 5,170円 | 中国 | [スピン系テンション表ソフト／硬度37.5±3](https://www.victas.com/products/detail.html?id=72) |
| victas | spinpips-d3 / スピンピップス D3 | 表ソフト | 4,620円 | 日本 | [スピン系高弾性表ソフト／チョップスポンジ／硬度25.0±3](https://www.victas.com/products/detail.html?id=73) |
| victas | spectol-s3 / スペクトル S3 | 表ソフト | 5,170円 | 日本 | [スピード系テンション表ソフト／硬度37.5±3](https://www.victas.com/products/detail.html?id=70) |
| yasaka | mark-v-ad / マーク V AD | 裏ソフト | 3,520円 | 日本 | [高弾性硬摩擦裏ソフト／硬度35〜40°](https://www.yasakajp.com/items/markv_ad/) |
| yasaka | mark-v-30 / マーク V 30° | 裏ソフト | 3,520円 | 日本 | [高弾性硬摩擦裏ソフト／硬度30〜35°](https://www.yasakajp.com/items/markv_30-degree/) |
| yasaka | mark-v-hps / マーク V HPS | 裏ソフト | 4,400円 | 日本 | [高弾性硬摩擦裏ソフト／HPS／硬度40〜45°](https://www.yasakajp.com/items/markv_hps/) |
| yasaka | mark-v-hps-soft / マーク V HPS ソフト | 裏ソフト | 4,400円 | 日本 | [高弾性硬摩擦裏ソフト／HPS／硬度35〜40°](https://www.yasakajp.com/items/markv_hps_soft/) |
| tibhar | infinity-mx-s / INFINITY MX-S | 裏ソフト | 12,100円 | 未確認 | [ハイグリップモデル／厚さ2.05・2.15mm／硬度未確認](https://tibhar-japan.com/rubber/) |
| tibhar | infinity-mx-p / INFINITY MX-P | 裏ソフト | 11,000円 | 未確認 | [反発力重視モデル／厚さ2.05・2.15mm／硬度未確認](https://tibhar-japan.com/rubber/) |
| tibhar | hybrid-k3-pro / ハイブリッドK3 PRO | 裏ソフト | 8,910円 | 未確認 | [粘着系テンション／硬度55](https://tibhar-japan.com/rubber/) |

## サイト内の評価

speed/spin/controlの1〜5評価、硬度カテゴリ、stylesはサイト内の編集上の目安。メーカー間で異なる尺度をそのまま比較せず、既存製品・公式説明の用途と照合した。プレー適性や品質の実測順位ではない。公式の数値硬度はofficialNoteへ併記し、ブランド間の硬度カテゴリを共通物理尺度として扱わない。

入門・中級向けのファクティブ、フライアット スピン、インセプション、ウルテック、VJ>07 レギュラー、マークV派生は公式の扱いやすさ・基本技術重視の説明に合わせてcontrol/beginnerを設定。NUZNとラザンターCは硬度・安定性・カウンター用途に応じてspin/counter/controlを設定し、最硬度・上級向けはcontrolを低くした。表・粒高・アンチには裏ソフト向けのspin/counter/controlを付けず、shortPips/defenseを使用。

| ID | speed / spin / control | 硬度カテゴリ | styles |
|---|---|---|---|
| tenergy-19 | 4 / 5 / 4 | 中 | spin, counter |
| tenergy-05-hard | 5 / 5 / 2 | 硬 | spin |
| tenergy-80fx | 4 / 4 / 5 | 軟 | counter, control |
| tenergy-64fx | 5 / 3 / 4 | 軟 | counter |
| impartial-xb | 4 / 3 / 4 | 軟 | shortPips |
| ilius-s | 1 / 5 / 5 | 硬 | defense |
| feint-long-2 | 1 / 4 / 4 | 中硬 | defense |
| factive | 4 / 4 / 5 | 中 | spin, control, beginner |
| flyatt-spin | 3 / 4 / 5 | 中 | spin, control, beginner |
| inception | 2 / 3 / 5 | 軟 | control, beginner |
| ultec | 2 / 3 / 5 | 軟 | control, beginner |
| moristo-sp-ax | 5 / 4 / 4 | 中 | shortPips |
| hammond-fa | 4 / 3 / 4 | 中 | shortPips |
| best-anti | 1 / 1 / 5 | 軟 | defense |
| nuzn-45 | 4 / 5 / 5 | 中 | spin, control |
| nuzn-48 | 5 / 5 / 4 | 中硬 | spin, counter |
| nuzn-50 | 5 / 5 / 3 | 硬 | spin, counter |
| nuzn-55 | 5 / 5 / 2 | 硬 | spin |
| rasanter-c45 | 4 / 5 / 5 | 中 | spin, counter, control |
| rasanter-c48 | 5 / 5 / 4 | 中硬 | spin, counter |
| rasanter-c53 | 5 / 5 / 3 | 硬 | spin, counter |
| xegna | 4 / 5 / 3 | 中硬 | sticky, spin |
| xegna-spin | 5 / 5 / 2 | 硬 | sticky, spin |
| v11-extra | 4 / 5 / 4 | 中硬 | spin, counter |
| v03 | 4 / 4 / 5 | 中 | counter, control |
| vj07-stiff | 4 / 4 / 4 | 中 | spin |
| vj07-regular | 3 / 4 / 5 | 中 | control, beginner |
| spinpips-d2 | 5 / 4 / 3 | 中 | shortPips |
| spinpips-d3 | 2 / 4 / 5 | 軟 | shortPips, defense |
| spectol-s3 | 5 / 2 / 4 | 中 | shortPips |
| mark-v-ad | 3 / 3 / 5 | 軟 | control, beginner |
| mark-v-30 | 2 / 3 / 5 | 軟 | control, beginner |
| mark-v-hps | 4 / 3 / 4 | 中 | counter, beginner |
| mark-v-hps-soft | 3 / 3 / 5 | 軟 | control, beginner |
| infinity-mx-s | 5 / 5 / 3 | — | spin |
| infinity-mx-p | 5 / 4 / 3 | — | counter |
| hybrid-k3-pro | 5 / 5 / 2 | 硬 | sticky, spin |

## 診断の変更と受入

54条件・108面で第一候補19面、比較候補84面が変化。候補不足0を維持。第一候補の採用製品数は13→12、ブランド数は9→7、同点面数は39→52。製品数増加が第一候補のブランド数増加を意味するとは扱わない。

第一候補の変更はファクティブ12面、マーク V HPS 3面、NUZN 45 4面。ファクティブの回転役割は従来候補より1点高く、ほかは同点のASCII ID順で入れ替わる。既存の採点・予算・同点ルールを変更していない。

```text
beginner/easy/spin/spin back: triple-regular(108) -> factive(109)
beginner/easy/spin/control back: rozena(120) -> factive(120)
beginner/easy/counter/counter back: roundell(108) -> mark-v-hps(108)
beginner/easy/control/spin back: triple-regular(108) -> factive(109)
beginner/easy/control/control back: rozena(120) -> factive(120)
beginner/standard/spin/spin back: triple-regular(108) -> factive(109)
beginner/standard/spin/control back: rozena(120) -> factive(120)
beginner/standard/counter/counter back: roundell(108) -> mark-v-hps(108)
beginner/standard/control/spin back: triple-regular(108) -> factive(109)
beginner/standard/control/control back: rozena(120) -> factive(120)
beginner/free/spin/spin back: triple-regular(108) -> factive(109)
beginner/free/spin/control back: rozena(120) -> factive(120)
beginner/free/counter/counter back: roundell(108) -> mark-v-hps(108)
beginner/free/control/spin back: triple-regular(108) -> factive(109)
beginner/free/control/control back: rozena(120) -> factive(120)
middle/free/spin/spin back: rasanter-r45(99) -> nuzn-45(99)
middle/free/spin/control back: rasanter-r45(105) -> nuzn-45(105)
middle/free/control/spin back: rasanter-r45(99) -> nuzn-45(99)
middle/free/control/control back: rasanter-r45(105) -> nuzn-45(105)
```

新旧の各条件の得点・上位候補・同点・比較候補を確認してから54条件スナップショットを更新。既存の最高点・予算上限・不明価格/廃番除外・ID順不変性テストを維持し、200製品×両面指定×全役割/経験/予算を既存テストで走査（7,200条件）した。既存163製品の全フィールドは追加前のJSONと一致。公開ID・保存.v1スキーマを変更していない。

## 容量・検証・残課題

- 追加直後のJSは394.85 KiBで公開基準390 KiBを超過。同一URL・確認日をブランド別定数にまとめ、Butterfly/Nittaku/VICTAS/Yasakaの個別製品URLの共通部分を小さな関数へ集約した。最終JS389.44 KiB、CSS31.31 KiB。上限を引き上げず、依存・画面・保存・推薦ロジックの変更はない。データ分割読み込みも検討したが、今回の重複排除で収まるため追加の読込状態は導入していない。余裕は約0.56 KiBしかないため次回拡充時に再検討する。
- 型検査pass、9ファイル83テストpass、54条件スナップショット更新済み。/rubberdb/ buildと390 KiB上限を明示した成果物検査pass。
- Chromeで最終成果物の200件表示、追加全37件の検索・詳細・価格・原産国・確認日・閉じる動作pass。モーダルの連続切替では描画完了を待ち、キーボード操作も確認。console warning/error 0。
- 4173は古い成果物を表示したため受入証拠から除外。ユーザー側から参照可能な専用preview（127.0.0.1:4189/rubberdb/）で200製品版を確認した。
- ローカル実装時点では本番公開・CIは未実施。その後の公開結果は下記を参照。実読み上げ/OS動作軽減の実機受入は引き続き未実施。Obsidianは構成・運用手順の変更がないため更新なし。

## 本番公開の証拠

実装`845435d`、[PR #32](https://github.com/Sitar-sitar/rubberdb/pull/32)マージ`6fb95599fc5cd1f7566920580a5ca33f50e0e344`。PR CI `40049079404`、main CI `40049172486`、[Pages `40049172500`](https://github.com/Sitar-sitar/rubberdb/actions/runs/40049172500)がsuccess。公開URLは https://sitar-sitar.github.io/rubberdb/ 。

公開HTTP200、JS `index-C_hwI-qS.js` SHA-256 `7acd68df5b98fa450169e56529556c27daf816f5f1b869f9e2b377acbf545032`、CSS `index-BRqi67-a.css` SHA-256 `9181380268d95a37d4f78092dda7df30345420b6454f35d8b09f71faad83d03f`はローカル成果物と一致。

本番Chromeで200件表示、全37件の検索・詳細・価格・原産国（未確認表示を含む）・確認日・閉じる動作を確認。検索解除後200件、初期診断のバックはファクティブ、console warning/error 0。新IDは公開済みのため以後削除せず、修正や推薦除外で対応する。
- 切戻しは今回の追加37件・台帳/公開ID・スナップショットと容量削減の変更を一緒に戻す。163製品の公開基点はe74ff54。追加IDを公開した後は削除せず、以後の切戻し方針を再確認する。
