# Cordivestium — Notion 改修（2026-10-03 納品）

ご依頼の 9 点について、機能ごとに 1 本ずつ（全文の JavaScript）でお渡しします。
各ファイルを ScriptCat に「全文貼り付け」で入れてください。

## 納品物

| # | ご依頼 | ファイル | スクリプト名 | 版 |
|---|---|---|---|---|
| 1・9 | Font など見た目の一元化・次世代版／フルDBヘッダーの書体統一 | `scripts/atelier.user.js` | « No »　²⁶ _ Atelier（旧 Text Styles） | 13.0.0 → **23.0.0**（大幅 +10） |
| 2 | タイトルの改行（テーブルビュー） | `scripts/table-title-linebreak.user.js` | « No »　³⁰ _ Table Title Line Break | 新規 **1.0.0** |
| 3 | Icons の色選択で動く | `icon-library.user.js` | « No »　²⁹ _ Icon Library | 5.0.0 → **5.1.0**（軽度 +0.1） |
| 4 | リレーション内グルーピング（DB） | `scripts/relation-show-all.user.js` | « No »　¹⁴ _ Relation Show All | 0.47.0 → **1.47.0**（中程度 +1） |
| 4 | 同（ページ） | `scripts/page-relation-show-all.user.js` | « No »　²³ _ Page Relation Show All | 1.8.0 → **2.8.0**（中程度 +1） |
| 5 | 新規ビュー | `scripts/atlas-views.user.js` | « No »　³¹ _ Atlas Views | 新規 **1.0.0** |
| 6 | エクセル機能 | `scripts/sheet-engine.user.js` | « No »　³² _ Sheet Engine | 新規 **1.0.0** |
| 7 | サイドバーのグルーピング（Unsorted・編集） | `scripts/sidebar-workspace-grouper.user.js` | « No »　¹⁶ _ Sidebar Workspace Grouper | 15.5.0 → **15.6.0**（軽度 +0.1） |
| 8 | サイドバーの大幅見直し（デザイン・階層） | `scripts/sidebar-constellation.user.js` | « No »　³³ _ Sidebar Constellation | 新規 **1.0.0** |

## 廃止してよいもの（1 の統合に伴って）

### ScriptCat — 無効にしてください

| スクリプト | 理由 |
|---|---|
| ²⁶ Text Styles | **²⁶ Atelier に置き換え**。両方動くとメニューが二重に出ます。本文の書式は IndexedDB から自動で引き継ぎます |
| ¹² Group Header Typography | Atelier が内蔵（変数 `--c12g-*`・互換の印 `cordivestium-group-*`・見出しクリックの開閉）。¹² が動いている間は Atelier 側は手を出しません |
| ⁰⁶ Full Database Description Typography | Atelier「フルDBの説明」の行の高さ・両端揃えに統合。**残すと Atelier の行の高さが効きません**（⁰⁶ はインラインの !important で書くため） |

### Stylus — 無効にしてください（Atelier の「基礎の層」に同じ CSS を内蔵）

| Stylus | 中身 |
|---|---|
| ⁰⁰ Foundation | 変数の土台 |
| ⁰¹ Font Family | 書体の変数 |
| ¹³ Full Database Title | フルDBのタイトル・アイコン |
| ¹⁴ Full Database Description Format | 説明の位置・左線 |
| ¹⁵ Full Database Description Typography | 説明の書体 |
| ¹⁶ Relation Typography | 表のリレーションのセル |
| ¹⁷ Primary Column Typography | 表の題字列 |
| ¹⁶ Page Title Typography | （名前と違い、中身は View Tab Divider＝タブの区切り線） |
| ²¹ Group Header Layout | DB のグループ見出し |
| ²⁵ Row Page Title Layout | 行ページのタイトル |

止めても見た目は変わりません（同じ規則を Atelier が描画前に入れます）。両方動いていても害はありません。
Atelier の「基礎の層（旧 Stylus）」で層ごとに入切できます。

### そのまま残すもの

- 位置合わせ・実測系: ⁰⁴ Align Full DB Description／⁰⁵ Full Database Body Alignment／⁰⁸ Description Right Edge Aligner／¹³ Left-Edge Unifier／¹⁴ Page Jitter Stopper
- 印を付けるもの: ⁰⁹ Primary Column Marker・¹⁵ Primary Column Tagger（題字列の層が使います）／¹⁹ View Tab Marker（タブの区切り線が使います）
- サイドバー・画面: Stylus ⁰²〜¹²（ワークスペース・サイドバーの配置）／¹⁹ Sidebar Workspace Grouper（★見出しの絵と色）／¹⁸ Screen Curtain／²² Render Veil／²³ Details／²⁴ Page Chrome Hide ほか

## 使い方（要点）

### 1・9 Atelier（⌃⌥A／右下「Aa」を右クリック）
- **場所ごとの書式**: 既定の書体・フルDBタイトル・フルDBの説明・**フルDBヘッダー**・テーブルの題字列・リレーション・グループ見出し・行ページ・通常ページ・サイドバー。変えるとすぐ反映、自動保存。
- **フルDBヘッダー（⁹）**: ビューのタブ（Books・Light…）と表の列見出し（Aa Name…）を、既定でグループ見出しと同じ Serif（Baskerville＋ヒラギノ明朝）に統一。大きさ・太さ・字間・色も変えられます。
- **どこでも書式**: 「画面でクリックして選ぶ」→ リレーション・プロパティ名・ボタン・ツールバーなど、Notion では編集できない所に書体・大きさ・太さ・字間・行の高さ・色・揃えを当てられます。範囲は「同じ形の所すべて／広く同じ種類／このブロックだけ」から。
- **テーマ**: 今の書式に名前を付けて保存・切り替え。書き出し・読み込み（本文の書式も一緒に）。
- 本文の書式（旧 Text Styles）は今までどおり：文字を選ぶ／⌃⌥F、本文の設定 ⌃⌥S。

### 2 テーブルのタイトル改行
題字のセルを編集中に **⇧Enter** または **⌥Enter**（Excel と同じ）。改行を含むタイトルはテーブル・リストでも折り返して表示します。

### 3 Icon Library
色を選ぶ・乗せる・タブを替える時にパネルが動かないように（行は場所を取ったまま見えなくする／見本の拡大をやめる／見本の欄の高さを固定）。

### 4 リレーション内グルーピング
- DB（¹⁴）: シリーズ見出しを**クリック**で題名・アイコンの編集。
- ページ（²³）: 見出しに乗せると出る **✎**、または見出しの**右クリック**で編集（クリックは従来どおり畳む／開く）。
- 「単行」にも既定で本のアイコン。題名・アイコンも変えられます。
- 本を**右クリック**で好きなグループへ移す（自分で作ったグループも可）。Notion のデータは書き換えません。DB とページで設定は共通です。

### 5 Atlas Views
「Add a new view」の空いている枠（Form の右）に **Atlas**。書架（背表紙・縦書き・棚ごと）／年表（日付で年・月）／集計（ピボット）を切り替え。既存のビューは ⌃⌥V で Atlas に。

### 6 Sheet Engine
セル右下の ■ をドラッグで連続データ（2026.01.01 → 2026.01.02…、1 → 2、Vol.1 → Vol.2、月 → 火、Jan → Feb、2 つ選べば歩幅も）。⌥ でコピー、■ のダブルクリックで最後の行まで。書き込み後に「元に戻す／コピーにする」。⇧クリックで範囲を選ぶと右下に個数・合計・平均・最小・最大。⌃D（上をコピー）、⌃;（今日の日付）、⌃⇧;（時刻）。

### 7 Sidebar Workspace Grouper
- 紐づけたのに Unsorted へ行く件を修正（原因は、チームスペースを名前の文字列だけで覚えていたことと、読み込み時に見出し名・旧ページ名と同じ名前を捨てていたこと。ID で覚える・名前の揺れを吸収・未知のものは表示だけで保存しない、に変更）。
- ★見出しの**文字をクリック**で題名・アイコン（²⁹ Icon Library・絵文字・SVG／画像・色）の編集。アイコン・余白のクリックは従来どおり開閉。グループの追加・削除も。

### 8 Sidebar Constellation
- 階層: ★グループ ／ ■ワークスペース（小さな見出し）／ ●フルDB（ワークスペースと同じ左端）／ ▲各種ビュー（DB の下・種類のアイコン・細い導線）。
- 明朝の行・選択中は左に色の印・グループ間の細い線。書体・大きさは Atelier の「サイドバー」から。
- 元の段（DB を一段下げる）に戻すには `__c33.set({ flat: false })`。
