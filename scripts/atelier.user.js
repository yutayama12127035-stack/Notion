// ==UserScript==
// @name         « No »　²⁶ _ Atelier
// @namespace    https://cordivestium.local/text-styles
// @version      24.0.0
// @description  見た目を、ひとつの場所で — 旧 Text Styles の統合版。v24: ²⁶ のメニューに Atelier と道具（どこでも書式・目次・フォーカスモード・文字数と読了時間）を統合。①本文を Word のように（文字を選ぶと ²⁶ のメニュー: 書体・サイズ・太さ・字間・段落・コールアウト・引用・テンプレート） ②Atelier（⌃⌥A・「Aa」の右クリック）: 旧 Stylus の Typography 系（⁰⁰ ⁰¹ ¹³ ¹⁴ ¹⁵ ¹⁶ ¹⁷ ²¹ ²⁵）と ¹² ⁰⁶ を内蔵し、フルDBタイトル・説明・ヘッダー（タブ・列見出しは既定で Serif に統一）・題字列・リレーション・グループ見出し・行ページ・通常ページ・サイドバーの書式を一か所で ③どこでも書式: Notion では変えられない所（リレーション・プロパティ名・ボタン・ツールバー…）も、画面でクリックして書体・大きさ・色などを当てる ④テーマの保存・切り替え・書き出し。設定はこのブラウザだけ。メニュー: 文字を選ぶ／⌃⌥F ／ 本文の設定: ⌃⌥S ／ Atelier: ⌃⌥A。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      www.notion.so
// @connect      notion.so
// @connect      www.notion.com
// @connect      notion.com
// @noframes
// ==/UserScript==

/*
 * v24.0.0（2026-10-03）— ²⁶ のメニューに Atelier を統合＋次世代の道具
 *   ・文字を選ぶと出る ²⁶ のメニュー（本文・ブロックの両方）に「Atelier」の段を追加:
 *       [Atelier] 見た目の全体の設定 ／ [どこでも書式] 画面の要素をクリックして書式 ／ [目次] ／ [フォーカス] ／ [文字数]
 *     Atelier の左の一覧にも「道具」。右下「Aa」の右クリック・本文のパネルの「Atelier」・⌃⌥A でも開く。
 *   ・目次: ページの見出し（見出し 1〜3）を右に浮かぶ目次に。押すとそこへ移動、今読んでいる所を示す。
 *   ・フォーカスモード: サイドバーと上の帯は消え（カーソルを寄せると出る）、書いている段落以外を淡く。
 *   ・文字数: 左下に ページの文字数・読了時間（1 分 500 字）、文字を選んでいる時は選んだ文字数。
 *   ・道具の入切はこのブラウザに保存（次に開いた時もそのまま）。
 *   ・旧 Text Styles が先に動いていると Atelier は起動できない（同じ窓口のため黙って止まっていた）→ 右下に案内を出す。
 *
 * v23.0.0（2026-10-03）— 名前を「Atelier」に。Text Styles（本文の書式）はそのまま全部入っています
 *   ・Atelier（⌃⌥A／右下「Aa」を右クリック／本文のパネルの「Atelier」）: 見た目の設定を一か所に集めた。
 *     場所ごとの書式: 既定の書体・フルDBタイトル・フルDBの説明・フルDBヘッダー・テーブルの題字列・リレーション・
 *     グループ見出し・行ページのタイトル・通常ページのタイトル・サイドバー。変えるとすぐ反映・自動で保存。
 *     値は各スタイルの CSS 変数を :root:root:root で上書き（Stylus が残っていても必ず勝つ）。変数の無い所は規則を書く。
 *   ・基礎の層: 旧 Stylus の Typography 系（⁰⁰ Foundation・⁰¹ Font Family・¹³ Full Database Title・¹⁴ ¹⁵ Description・
 *     ¹⁶ Relation Typography・¹⁷ Primary Column Typography・¹⁶ Page Title Typography（View Tab Divider）・
 *     ²¹ Group Header Layout・²⁵ Row Page Title Layout）を内蔵。Stylus 側は止めてよい（層ごとに入切もできる）。
 *   ・¹² Group Header Typography の印（cordivestium-group-*）と見出しクリックの開閉、⁰⁶ Full Database Description
 *     Typography の両端揃えも内蔵（¹² が動いている間は Atelier 側は何もしない）。
 *   ・フルDBヘッダー（ビューのタブ・表の列見出し）を既定で Serif（グループ見出しと同じ書体）に統一。大きさ・太さ・字間・色も。
 *   ・どこでも書式: 画面の要素をクリックして選ぶと、その形の所すべて／広く同じ種類／そのブロックだけ に書式を当てられる。
 *     書体（このセットの全書体）・大きさ・太さ・字間・行の高さ・色・濃さ・大文字小文字・揃え・斜体。指定は自分で書き換えも可。
 *   ・テーマ: 今の書式に名前を付けて保存・適用。書き出し／読み込み（本文の書式も一緒に）。
 *   ・保存は Text Styles と同じく ScriptCat の保存領域＋IndexedDB。新しいスクリプトとして入れても、本文の書式は
 *     IndexedDB から自動で引き継ぐ（Text Styles は無効にしてください。両方動くとメニューが二重に出ます）。
 *   ・__atelier.open() ／ __atelier.set(変数, 値) ／ __atelier.pick() ／ __atelier.css()
 *
 * v13.0.0
 *   ・コールアウト: 「スタイル／面と枠／アイコン／文字」のタブに整理。
 *     形を 15 種に（見出し・下線見出し・グラデ左線・グラデ面・メッシュ・グラデ枠・すりガラス・光彩・ピル・付箋・カード ほか）。
 *     2 色目（グラデーション）・グラデの向き（横・斜め・縦・光・メッシュ）と濃さ・影（ふんわり・浮く・光彩）・すりガラス・
 *     枠（グラデ枠・グラデ左線）と太さ・余白を上下／左右に分けて・下線（消える・全幅・短い・点線）・文字の色（アクセント・グラデ・淡く）。
 *     アイコン: 大きさを px で（v12 の % は自動で読み替え）・上下左右の移動（十字ボタン・数値）・縦の揃え・
 *     タイル（タイル・輪・色タイル＝白抜き・グラデ・ガラス）とタイルの余白・角丸。既定の余白をゆったりに。
 *   ・引用: 線の開始位置（左右 = 線ごと移動、上下 = 線の端を縮める）・線の端を丸く・破線・斜体・背景（線の色から消える）。
 *     形に「丸い線」「グラデ帯」「余白メモ」を追加。
 *   ・段落: 罫線（ノート風の 罫線・ドット・方眼）を段落／ページ／全ページで。
 *   ・ブロックのメニュー: Notion の「Quote size」は ²⁶ の「引用」と重なるので出さない。
 *   ・メニューの下に「アイコン」ボタン（²⁹ Icon Library を開く）。
 *
 * v12.0.0
 *   ・コールアウトを ²⁶ だけで（²⁷ Callout Heading の CSS は不要に）。「コールアウト」パネル:
 *     形（標準・カード・見出し・左線の帯・色の枠・飾りなし）／背景（Notion の色のまま・透明・9 色）／アクセント色／
 *     枠（なし・細線・色の線・左線）／角の丸み・内側の余白・上下の余白・グラデーションの下線／
 *     アイコン（そのまま・タイル・隠す）と大きさ・アイコンと文字の間隔・上下位置／見出しとして詰める。
 *     これだけ／このページ／全ページ、段落スタイルにも入る。
 *   ・引用: 形（標準・細く淡く・線＋背景・引用符・ぼかし線・カード）／線（実線・淡く・ぼかし・二重・なし）と色・太さ・
 *     線と文字の間・上下の余白・角の丸み・背景・引用符の飾り・文字を淡く。
 *   ・コールアウト・引用の中で「段落」を開くと、一番上に「全体の見た目」への入口（中の文字の段落設定と区別）。
 *   ・メニューの位置: 本文の列の外（左右の空いている広い方）に出す。サイドピークなら、ピークの本文の左。
 *     横のパネルも本文から離れる側へ。透かしは既定でオフ（検索「透かす」でオンにできる）。
 *
 * v11.1.0
 *   ・段落単位の書体・大きさ・太さ・字間（「段落」パネルの「段落の文字」）。この段落／このページ／全ページで。
 *     文字ごとに変えた所（²⁶ の文字の書式）はそちらが優先（Word の直接書式と同じ）。段落スタイルにも入る。
 *   ・行の高さが効かないことがあった: 文字欄の中の要素（リンク・色・書式の枠など）が独自の行の高さを持つと、
 *     段落の値が負けていた。中の要素も段落の値に揃えるようにした。数値の表示も、ブロックのメニューから開いた時に
 *     実際の値を読むようにした。
 *   ・検索: 「段落の書体: ○○」「段落のサイズ 14px」も。
 *
 * v11.0.0
 *   ・検索: メニューの一番上で、命令・書体・色・段落スタイル・テンプレートを日本語でも英語でも、読み（ふとじ）や
 *     あいまいな打ち方（ひらみん → ヒラギノ明朝）でも探せる。数字を打つと「サイズ 12px／行の高さ／段落の後 12px …」。
 *     ↑↓ で選んで Enter。
 *   ・ブロックのメニュー（⋮⋮ を押す・ブロックを選ぶ・「…」）も ²⁶ に統合。Notion の項目（種類の変更・色・リンクのコピー・
 *     複製・移動・削除・コメント・編集の提案・AI・スキル）を日本語で並べ、段落・段落スタイル・コールアウトも同じ所に。
 *     続きの画面がある項目は Notion の画面をそのまま出す。
 *   ・「…」を押すと ²⁶ が二度と出なくなる不具合を修正（Notion の元のメニューに切り替える方式をやめた）。
 *   ・透かし: 本文が変わる操作をすると、メニューが薄くなって下の文字が見える。続けて操作している間は薄いまま、
 *     5 秒何もしないかマウスを動かすと元に戻る（検索で「透かす」からオフにもできる）。
 *
 * v10.0.0
 *   ・段落の「前」と「後」を別々に（上の段落との間・次の段落との間）。これまでの「段落の間隔」は半分ずつ前と後に引き継ぐ。
 *   ・インデント: 字下げ（1 行目）・左・右（字単位）。ぶら下げ（-1 字）も。
 *   ・段落スタイル（Word のスタイル）: 段落・見出し・コールアウト・引用の見た目（行の高さ・前後・インデント・揃え・飾り・
 *     コールアウトの枠・中の文字の書体など）を名前を付けて登録 → ほかのブロックに 1 回で付ける。直すと全部が変わる。
 *     コールアウトで登録すれば、同じ形のコールアウトが何個でも作れる（中身と色を変えるだけで別物に）。
 *   ・段落の飾り: 左線／背景／線＋背景／下線／枠／ぼかし（Notion の 9 色）。
 *   ・組版: ドロップキャップ（頭文字 2・3 行）、約物を詰める（palt）。
 *   ・文字の飾り: 傍点（ゴマ・黒丸・白丸・三角）、下線の形（実線・二重・点線・破線・波線）、上付き・下付き、スモールキャップ。
 *   ・背景色の形: 塗り／マーカー（下半分だけの蛍光ペン）。
 *   ・書式のコピー（🖌）: 押してから別の文字を選ぶと、文字の書式・段落の設定・段落スタイルをそのまま貼る。
 *
 * v9.0.0
 *   ・Notion の選択メニューと ²⁶ を 1 つに。本文・タイトルの文字を選ぶと、Notion のメニューの代わりに ²⁶ のメニューが同じ場所に出る。
 *     1 段目（Notion と同じ）: ブロックの種類／文字色・背景色／太字・斜体・下線・書式を消す／リンク・取り消し線・コード・数式／「…」
 *       太字などは Notion 自身のボタンを（見えないまま）押すので、動きは Notion 本来のまま。「…」で Notion の元のメニュー（AI など）。
 *     2 段目（²⁶）: 書体／サイズ（その場で数値も）／段落／コールアウト・引用／テンプレート。行を押すと横に詳しいパネルが開く。
 *   ・メニューの外を押すと閉じる。文字を入力し始めても閉じる。Esc: 横のパネル → メニュー。
 *   ・操作した時だけ反映（自動で保存、リロード後もそのまま）。開いただけでは何も変えない。
 *   ・色のパネル（Notion と同じ見た目）。文字色は Notion 本来の色（どの端末でも見える）。書体などを変えた文字は、色も書式の中に持つので両立する。
 *     背景色の 9 色は ²⁶ の目印なので、背景色はこのブラウザで描く。
 *   ・書式の目印は背景色の 9 色だけに（文字色 9 色は本来の色付け用に空けた）。今ある書式はそのまま。
 *
 * v8.2.0
 *   ・「大きさを変えても戻る」不具合を修正。原因は色の目印の取り違え。
 *     Notion が描き直す前の古い色を読んで「茶 = オレンジの目印」のように覚えてしまい、1 つの色の文字に
 *     複数の書式（例: 茶 13px とオレンジ 11px）が同時に当たって、後ろの書式の大きさが勝っていた。
 *     書体は同じだったので書体だけ反映されたように見えていた。
 *   ・色の目印は Notion の決まった描き方（data-notion-highlight と var(--c-○○TexSec) / var(--ca-○○BacSecTra)）
 *     から最初から確定させる。読み取りで覚える目印は、ほかの色のものなら受け付けない。
 *   ・保存済みの取り違えた目印は、起動時に自動で掃除する。
 *   ・今の書式の判定（どの書式の文字か）も同じ目印を使うので、テンプレート保存後の編集が別の書式を元にしなくなった。
 *   ・テンプレート名の入力欄が開いている間、画面を描き直すたびに名前欄がカーソルを奪い、名前も初期値に戻っていた。
 *     大きさの欄で ↑↓ を押すと 2 回目以降が名前欄に入り、大きさが変わらない／表示が古いままになっていた。
 *     名前欄は開いた時だけカーソルを置き、以後は作り直さない。
 *
 * v8.1.0
 *   ・誤作動の防止: パネル・メニュー・通知・「Aa」に data-no-passthrough を付けた。²³（ページのリレーション）が
 *     「押した位置の真下」を調べて、パネル越しに見出しを畳んだり本を開いたりしていた（²³ v1.8.0 側で無視する）。
 *   ・数値は矢印キーで細かく: ↑↓ = 1 目盛り、⇧ = 10 目盛り、⌥（Option）= 0.1 目盛り。欄にマウスを乗せると ▴▾ も出る。
 *     大きさ 0.1px・字間 0.1%・行高 0.01・段落の間隔 0.1px まで。書体・太さの一覧も ↑↓ と Enter で選べる。
 *
 * v8.0.0
 *   ・パネルが勝手に閉じないように。一度開いたら、閉じるのは「×」「保存して閉じる」「Aa」の時だけ。
 *     何かを決めても、カーソルが外れても、Notion が描き直しても、Esc を押しても閉じない（Esc はメニューだけ閉じる）。
 *   ・対象は「最後に選んだ文字」。別の文字を選ぶと対象が替わる。クリックしただけでは前の対象のまま
 *     （見出しに「対象 ○文字」と出る）。続けて何度でも変えられる。
 *   ・下に「保存して閉じる」: 保存できたことを確かめてから閉じる。
 *
 * v7.0.0（パネルを作り直し）
 *   ・Figma の右パネルのような「テキスト」パネル。文字を選ぶと画面の右上に出る（見出しをドラッグで移動・位置を記憶、
 *     📌 で常に表示、× で閉じる）。上から 見本／文字（書体・太さ・大きさ・字間・斜体・書式を消す）／
 *     段落（左・中央・右・両端揃え、英語のハイフネーション、行高、段落の間隔。範囲 = この段落／ページ／全体）／
 *     コールアウト・引用（中にいる時だけ）／テンプレート。数値は直接入力・↑↓・アイコンを左右にドラッグ。
 *   ・保存は自動。変更はクリックした瞬間に本文へ反映され、そのまま残る（保存ボタン・破棄は無し。↶ で元に戻す）。
 *     テンプレートは「今の書式をテンプレートに保存」を押した時だけ作る。削除しても文字の見た目は残る。
 *     使われなくなった書式の色は自動で回収する。
 *   ・両端揃え: 日本語は字と字の間（inter-character）、英語は単語の間＋ハイフネーション（hyphens:auto）。禁則は strict。
 *   ・パネルのボタンは window の捕捉段階で受ける（Notion に横取りされて × が効かない、を防ぐ）。
 *
 * v6.0.0
 *   ・Word と同じく、書式バーでの変更は「選んだ文字だけ」に効く（v5 は選んだ先頭の文字のテンプレート全体を
 *     変えていたため、選んだのに大きさが変わらない部分があった）。1 回目の変更で選んだ文字全体を
 *     「下書き」にそろえ、以後はその場で反映。保存 = 新しいテンプレート／既存テンプレートを上書き。
 *     破棄 = 書き込む前の状態にそっくり戻す。
 *   ・テンプレートの管理（右下「Aa」またはテンプレート ⌄ → 管理…）: 大きなポップアップ。左に一覧（その書体の見本）、
 *     右で名前・書体（検索付き一覧）・大きさ・太さ・斜体・字間を編集（本文にその場で反映 → 保存／取り消し）。
 *     選んだ文字に付ける・複製・削除（確認付き）もここ。削除したテンプレートの文字は普通の見た目に戻る。
 *   ・書式バーが出ている間は「Aa」ボタンを隠す（保存ボタンに重なっていた）。
 *
 * v5.0.0（Word のスタイルの操作感に作り直し）
 *   ・テンプレート（= Word のスタイル）: 文字を選んで書体・大きさなどを変える → その場で本文に反映
 *     → 「保存」で名前を付けてテンプレートとして固定。テンプレートは ⌄ の一覧からほかの文字に付けられる。
 *   ・保存するまでは仮: 「破棄」で元に戻る。保存も破棄もしないまま別の文字を選ぶと、バーが赤く知らせて止まる。
 *   ・テンプレートの付いた文字を変えた時は「上書き保存（そのテンプレートの文字すべて）」か
 *     「別名で保存（選んだ文字だけ新しいテンプレート）」を選ぶ。もう勝手に「書式 7」などは増えない。
 *   ・バーは 2 段・幅固定。上段 = 選んだ文字の見本・状態・破棄・保存、下段 = テンプレート・書体・大きさ・
 *     太さ・斜体・行高・段落の間隔・ブロック・⋯。中身が変わってもボタンの位置は動かない。
 *   ・複数の段落・複数行: 全部の段落を 1 回の読み込み＋1 回の書き込みでまとめて処理（速く、途中で崩れない）。
 *     読み取れない段落があっても、ほかの段落は付ける。
 *
 * v4.0.0（操作まわりを作り直し）
 *   ・書式バー: 文字を選ぶと、その列（全面ページ／サイドピーク／センターピーク）の下端中央に、ガラス状の
 *     細いバーが出る。選んだ文字の近くには出ないので、Notion 標準のツールバーやメニューと重ならない。
 *     下の本文が透けて見え、バー以外の場所の操作は一切ふさがない。メニューは上に開く。
 *   ・バー左端に「選んだ文字の今の見た目」（その書体で表示）と、書式名・書体・大きさ・状態
 *     （反映中… など）。何がどう変わるかがその場で分かる。
 *   ・反映: 1 回目だけ Notion に色を書き込む（0.3〜1 秒）。以後の書体・大きさ等の変更は即時（CSS だけ）。
 *   ・修正: サイドピークで書式が効かず Notion の色がそのまま見えていた問題。色の目印の覚え方を作り直し、
 *     Notion のデータ（どの文字に何色）と画面を突き合わせて、色付きの文字を選ぶたびに確かめ直す。
 *     効く範囲を「文字欄の中」全体にした（ページの種類に依らない）。
 *
 * v3.0.0（仕組みを作り直し）
 *   原因: Notion には「DOMLock」があり、本文の中の要素を外から書き換えると即座に元へ戻す
 *   （コンソールの "NOTION WARNING Reverting mutation of childList…"）。v2 は本文に目印を差し込んで
 *   いたため、Notion と取り合いになり「元に戻る」「重い」が起きていた。
 *   v3: 本文には一切手を触れない。
 *     ・選んだ文字に Notion 標準の「文字色」を 1 つ付ける（Notion 自身のデータに保存＝恒久的・どの操作でも消えない）。
 *     ・その色を、このブラウザでは CSS で書体・大きさ・太さ・斜体・字間に置き換えて見せる（色は見せない）。
 *     ・色 1 つ = 「書式」1 つ（書式 1、書式 2…）。最大 18（文字色 9＋背景色 9）。同じ中身の書式は使い回す。
 *     ・ほかの端末・Notion アプリでは、その部分は色付きの文字として見える。
 *     ・ふだん自分で色付けに使っている色は、パネルで「書式に使わない」にできる。
 *   書き込みは Notion の API（/api/v3/saveTransactions）で「文字色」だけを変える。文章そのものは変えない。
 *   書き込む前に Notion のデータと画面の文章が一致しているか確かめ、違えば書き込まない。↶ で元に戻せる。
 *   行高・段落の間隔・ブロック・タイトルの書式は、これまでどおり（CSS だけ）。
 *
 * v2.6.0
 *   ・恒久的に反映: 付けた書式は、カーソルが段落から離れても・フォーカスが外れても・Notion が後から
 *     描き直しても、必ず付け直す（離れた直後に 3 回確かめる＋0.7 秒ごとに画面内を見張る）。
 *   ・メニューで項目にマウスを乗せただけで本文が変わる「仮の反映」をやめた（マウスを外すと戻るため）。
 *     見本はメニュー上部の欄だけ。クリックした瞬間に本文へ恒久的に反映。
 *   ・変更のたびに自動で保存（押し忘れても消えない）。保存ボタンは「保存中… → 保存済み」を表示し、
 *     押すと読み戻して確かめる。
 *
 * v2.5.0
 *   ・表示の安定化: Notion が文字を描き直して目印が外れた時は、原則すぐ（画面に出る前に）付け直す。
 *     v2.3〜2.4 は「選択・クリック」に伴う描き直しまで取り合いと数えて付け直しを休んでいたため、
 *     選ぶと書体が元に戻っていた。休むのは「²⁶ が付けた直後に、誰も操作していないのに外される」が
 *     1 秒に 6 回以上続く本物の無限往復だけ。「編集中は外す」設定も既定オフに戻した。
 *   ・行高・段落の間隔をポップアップに（別々の機能）。
 *     行高 = 行と行の間（文字の大きさの何倍か）／段落の間隔 = 段落と段落の間（px）。
 *     効く範囲: 選んだ段落だけ／このページ全体／全ページ。タイトルでも使える。
 *   ・リアルタイム反映: 書体・大きさ・太さ・字間・行高・段落の間隔のメニューで、カーソルを乗せた項目が
 *     その場で本文に反映される（外すと戻る。クリックで確定）。
 *   ・パネル／ブロック設定にも「段落の間隔」、種類に「本文すべて」を追加。
 *
 * v2.4.0
 *   ・ポップアップ右端に「保存」ボタン。押すと 3 か所（ScriptCat の保存領域・IndexedDB・（必要なら）localStorage）へ
 *     すぐ書き込み、読み戻して確かめ、「✓ 保存しました」と出る。未保存の変更がある間は青いボタン。
 *     閉じた時・ページを離れる時も自動で保存（押し忘れ対策）。読み込み時は 3 か所のうち一番新しいものを使う。
 *   ・「最近」を削除。
 *   ・Notion 標準のツールバーを邪魔しない: 文字を選ぶと、選んだ範囲の右下に小さな「Aa」だけが出る
 *     （押すとポップアップ）。重なり順も Notion の浮きメニューより下にした（Notion のメニューが必ず上に来る）。
 *     パネルで「すぐにポップアップ」「何も出さない（⌃⌥F だけ）」にも変えられる。
 *
 * v2.3.0
 *   ・保存されない問題を修正。保存先を notion.so の localStorage（Notion 自身がほぼ使い切っていて、
 *     書き込みが黙って失敗していた）から ScriptCat の保存領域（GM_setValue）へ移した。初回に自動で引っ越し。
 *     保存に失敗した時は画面下に知らせる。
 *   ・読み込み時に Notion が何度か描き直すのを「取り合い」と誤認して書式を消していた問題を修正
 *     （取り合いの判定は編集中の段落だけ。見つけても消さずに少し待って付け直す）。
 *   ・書式の指定の強さを ID 6 つ分に上げた（他の Stylus・スクリプトの書体指定に負けて「効かない書体」があった）。
 *   ・ポップアップ・メニューを Notion と同じ見た目に（影・角丸・28px の行・アイコン・ダーク対応）。
 *   ・書体メニューの上に見本: 選んでいる文字を、カーソルを乗せた書体で大きく表示。
 *     「欧文」の印 = 日本語の字形を持たない書体（日本語部分はヒラギノ明朝で出る）。
 *
 * v2.2.0
 *   ・「このページが Zen の動作を遅くしています」への対策。
 *     Notion が付けた目印を外す → ²⁶ が付け直す → また外す…の往復（無限ループ）を見つけたら、
 *     その時点で「編集中（カーソル・選択のある）段落では付け直さない」方式に自動で切り替え、以後も覚えておく。
 *     カーソルが別の段落へ移ると、元の段落に書式が戻る。
 *     さらに、1 秒に 120 回を超えて付け直しが起きたら 2.5 秒まるごと休む（ブラウザが固まらない保険）。
 *     選択の付け直しも、文字位置が同じなら行わない（これが往復の引き金になっていた可能性が高い）。
 *   ・ページタイトルの書体・大きさ・太さ・斜体・字間・行の高さ・色（このページ／全ページ）。
 *     タイトルの文字をドラッグで選ぶ、またはタイトルにカーソルを置いて ⌃⌥F → ポップアップ。²⁵ より優先。
 *   ・__c26.log() で直近の出来事（取り合いの検出・休止）を表示。
 *
 * v2.1.0
 *   ・軽量化: 書式を 1 つも付けていない間は、描き直しの監視も入力の保護も何もしない。
 *     コールアウト・トグル・リストの中をクリック／入力しても、中身全体を数え直さない
 *     （そのブロック自身の文字欄だけを見る。入れ子のブロックには最初から入らない）。
 *     カーソル移動のたびに行っていたブロックの調べ直しをやめ、パネル等を開いた時に 1 回だけに。
 *   ・ポップアップに「ブロック▾」を追加。選んだ文字のあるブロック（段落・見出し・引用・コールアウト・
 *     リスト・トグル）の見た目を、その場で「このブロックだけ／このページの同じ種類全部／全ページ」で変えられる。
 *     コールアウトは 枠の背景・枠線・角の丸み・余白・アイコン、引用は 左線の太さ・色・間隔 も。
 *     コールアウトの中の段落を選んだ時は「段落 › コールアウト」と外側も選べる。
 *   ・文字を選ばずに ⌃⌥F → ブロックの設定だけのポップアップ（クリックだけでは何も出ない＝重くならない）。
 *
 * v2.0.0
 *   ・「色を目印にする」方式をやめ、Word と同じく「選んだ文字そのもの」に書式を付ける方式へ。
 *   ・書式は Notion には保存されない（Notion にその機能が無い）。このブラウザの localStorage に
 *     「どのブロックの・何文字目から何文字目に・どんな書式か」を保存し、表示のたびに付け直す。
 *   ・文章を書き足す・消す・変換する・Enter で分ける・Backspace でつなぐ と、書式の範囲も一緒にずれる
 *     （書式の付いた文字の直後に打った文字は、Word と同じく同じ書式が続く）。
 *   ・Notion が本文を読み書きする瞬間（入力・貼り付け・Enter など）は、付けた書式の目印を一瞬外して
 *     Notion 本来の形に戻してから渡す（Notion の本文データを壊さないための保護）。
 *   ・書体の一覧は Apple 公式「macOS Tahoe に含まれるフォント」から Serif・明朝体・宋体・명조を全部拾い、
 *     このブラウザで実際に使えるものだけを出す（Font Book で未ダウンロードのものは隠す／表示切替あり）。
 *
 * 使い方
 *   文字をドラッグで選ぶ → 下にポップアップ
 *     [書体▾] [− 16 ＋ ▾] [B 太さ▾] [I] [字間▾] [↶ 元に戻す] [⌫ 書式を消す]
 *     下の段 = 最近使った組み合わせ（ワンクリックで同じ書式に）
 *   キーボードで選んだ時は ⌃⌥F
 *   右下「Aa」/ ⌃⌥S = パネル（文字書式の設定・ブロック単位の書式・書き出し/読み込み）
 *
 * できないこと
 *   ・別のブラウザ／別の端末／Notion アプリ／共有相手には出ない（このブラウザだけの見た目）
 *   ・ブロックの複製（⌘D）・別ページへのコピーには書式は付いていかない
 *   ・別の端末で文章を書き換えた場合、書式の位置がずれることがある（同じ文字列を探して付け直す）
 *
 * コンソール: __c26.status() / __c26.export() / __c26.import(json) / __c26.off() / __c26.on()
 */

(() => {
  'use strict';

  const VERSION = '24.0.0';
  const API = '__c26';
  if (window[API] && window[API].version) {
    /* v24.0.0: 旧 Text Styles（同じ窓口 __c26）が先に起きていると、Atelier は起動できない（メニューが二重になるため）。
       黙って止まらず、画面に案内を出す */
    const old = String(window[API].version || '');
    if (parseInt(old, 10) < 23) {
      const note = () => {
        if (document.getElementById('atelier-legacy-note')) return;
        const d = document.createElement('div');
        d.id = 'atelier-legacy-note';
        d.style.cssText = 'position:fixed;z-index:2147483646;right:20px;bottom:20px;max-width:360px;padding:12px 14px;border-radius:10px;background:#fff;color:#37352f;box-shadow:0 0 0 .5px rgba(15,15,15,.12),0 10px 30px rgba(15,15,15,.18);font:12.5px/1.6 -apple-system,BlinkMacSystemFont,"Hiragino Sans",sans-serif';
        d.innerHTML = '<b style="font-family:Baskerville,serif;letter-spacing:.06em">Atelier を起動できません</b><br>旧「²⁶ Text Styles」（v' + old.replace(/[<>&]/g, '') + '）が動いています。ScriptCat で Text Styles を無効にして、ページを再読み込みしてください（本文の書式は Atelier が引き継ぎます）。<div style="text-align:right;margin-top:6px"><button style="border:0;border-radius:6px;padding:4px 10px;background:rgba(55,53,47,.08);cursor:pointer">閉じる</button></div>';
        d.querySelector('button').onclick = () => d.remove();
        document.body.appendChild(d);
      };
      if (document.body) note(); else document.addEventListener('DOMContentLoaded', note, { once: true });
      console.warn('[²⁶ Atelier] 旧 Text Styles v' + old + ' が動いているため起動しません。Text Styles を無効にしてください。');
    }
    return;
  }

  const LS_KEY = 'c26-styles-v1';     // ブロック単位の書式（v1 から続く）
  const LS_PREFS = 'c26-prefs-v1';    // ポップアップなどの設定
  const STYLE_ID = 'c26-rules';
  const MARK_STYLE_ID = 'c26-marks';
  const UI_STYLE_ID = 'c26-ui';
  const BOOST = ':not(#c26a):not(#c26b):not(#c26c):not(#c26d):not(#c26e):not(#c26f)';   // 他の Stylus / スクリプトの書体指定に必ず勝つ
  const CONTENT = '.notion-page-content';
  const LEAF = '[data-content-editable-leaf="true"]';
  const LS_SLOTS = 'c26-slots-v1';   // 文字の書式の枠（Notion の色 → 書体）
  const LS_SELS = 'c26-colorsel-v1'; // Notion の色の描き方（自動で覚える）
  const TITLE = 'h1[aria-roledescription="page title"]';
  const BOOST_T = BOOST;   // ²⁵（ID 3 つ分）より強く

  /* ============================================================
   *  書体（macOS に入っている／ダウンロードできる Serif・明朝体を網羅）
   *    出典: Apple「Fonts included with macOS Tahoe」
   * ============================================================ */
  const LATIN_FB = '"Hiragino Mincho ProN", "YuMincho", serif';
  const CJK_FB = '"Hiragino Mincho ProN", serif';
  const SAMPLE = { ja: '永あア 花鳥風月', zh: '永 宋體 書法', ko: '한글 명조', la: 'Aa Gg Rr & 1234' };
  const CATALOG = [
    { g: 'このセットの書体', s: 'la', items: [
      ['canela13', 'フルDBタイトルと同じ（¹³）', null, 'var(--constellucentia-full-db-title-font-family, "Canela Deck", "Hoefler Text", "Hiragino Mincho ProN", serif)'],
      ['group12', 'グループ見出しと同じ（¹²）', null, '"Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", "YuMincho", serif']
    ] },
    { g: '明朝体（和文）', s: 'ja', items: [
      ['hiramin', 'ヒラギノ明朝 ProN', ['Hiragino Mincho ProN', 'ヒラギノ明朝 ProN', 'Hiragino Mincho Pro']],
      ['yumin', '游明朝', ['YuMincho', 'Yu Mincho', '游明朝', '游明朝体']],
      ['yumin36', '游明朝 +36ポかな', ['YuMincho +36p Kana', '游明朝体+36ポかな']],
      ['bunkyumin', '凸版文久明朝', ['Toppan Bunkyu Mincho', '凸版文久明朝']],
      ['bunkyumidashi', '凸版文久見出し明朝', ['Toppan Bunkyu Midashi Mincho', '凸版文久見出し明朝']],
      ['bizudmin', 'BIZ UD明朝', ['BIZ UDMincho', 'BIZ UD明朝']],
      ['bizudpmin', 'BIZ UDP明朝', ['BIZ UDPMincho', 'BIZ UDP明朝']]
    ] },
    { g: '教科書体・筆書き（和文）', s: 'ja', items: [
      ['yukyo', '游教科書体', ['YuKyokasho', 'Yu Kyokasho', '游教科書体']],
      ['yukyoyoko', '游教科書体 横用', ['YuKyokasho Yoko', 'Yu Kyokasho Yoko', '游教科書体 横用']],
      ['klee', 'クレー', ['Klee', 'クレー']]
    ] },
    { g: 'Serif 本文向き（欧文）', s: 'la', items: [
      'Athelas', 'Baskerville', 'Big Caslon', 'Book Antiqua', 'Bookman Old Style', 'Brill', 'Century Schoolbook',
      'Charter', 'Cochin', 'Garamond', 'Georgia', 'Hoefler Text', 'Iowan Old Style', 'Marion', 'New York', 'Palatino',
      'Plantagenet Cherokee', 'PT Serif', 'PT Serif Caption', 'Publico Text', 'STIX Two Text', 'STIXGeneral',
      'Times', 'Times New Roman'
    ] },
    { g: 'Serif 見出し向き（欧文）', s: 'la', items: [
      'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Canela', 'Canela Deck', 'Canela Text', 'Didot',
      'Domaine Display', 'Domaine Display Narrow', 'Domaine Display Condensed', 'Publico Headline', 'Publico Banner',
      'Bordeaux Roman', 'Copperplate', 'Academy Engraved LET', 'Mona Lisa Solid ITC TT', 'Trattatello', 'Luminari',
      'Blackmoor LET'
    ] },
    { g: 'Slab Serif（欧文）', s: 'la', items: [
      'American Typewriter', 'Rockwell', 'Superclarendon', 'Fakt Slab Stencil Pro', 'Courier', 'Courier New'
    ] },
    { g: '宋体・明體・楷書（中国語）', s: 'zh', items: [
      ['songsc', '宋体 SC（Songti SC）', ['Songti SC']],
      ['songtc', '宋體 TC（Songti TC）', ['Songti TC']],
      ['stsong', '华文宋体（STSong）', ['STSong']],
      ['simsong', 'SimSong', ['SimSong']],
      ['lisong', '儷宋 Pro（LiSong Pro）', ['LiSong Pro']],
      ['applelisung', '蘋果儷細宋（Apple LiSung）', ['Apple LiSung']],
      ['stfang', '华文仿宋（STFangsong）', ['STFangsong']],
      ['kaisc', '楷体 SC（Kaiti SC）', ['Kaiti SC']],
      ['kaitc', '楷體 TC（Kaiti TC）', ['Kaiti TC']],
      ['stkai', '华文楷体（STKaiti）', ['STKaiti']],
      ['biaukai', '標楷體（BiauKai）', ['BiauKaiTC', 'BiauKaiHK', 'BiauKai']],
      ['weibei', '魏碑（Weibei）', ['Weibei SC', 'Weibei TC']],
      ['libian', '隶变（Libian）', ['Libian SC', 'Libian TC']],
      ['xingkai', '行楷（Xingkai）', ['Xingkai SC', 'Xingkai TC']],
      ['baoli', '报隶（Baoli）', ['Baoli SC', 'Baoli TC']]
    ] },
    { g: '명조（韓国語）', s: 'ko', items: [
      ['applemyungjo', 'AppleMyungjo', ['AppleMyungjo']],
      ['nanummyeongjo', '나눔명조（NanumMyeongjo）', ['NanumMyeongjo', 'Nanum Myeongjo']],
      ['pcmyungjo', 'PCMyungjo', ['PCMyungjo']],
      ['gungseo', '궁서（GungSeo）', ['GungSeo']]
    ] }
  ];
  const FONT_LIST = [];
  const FONT_BY_ID = {};
  for (const grp of CATALOG) {
    for (const it of grp.items) {
      const a = typeof it === 'string' ? [it.toLowerCase().replace(/[^a-z0-9]+/g, ''), it, [it]] : it;
      const f = { id: a[0], name: a[1], fams: a[2], group: grp.g, s: grp.s };
      f.css = a[3] || (f.fams.map((x) => '"' + x + '"').join(', ') + ', ' + (grp.s === 'la' ? LATIN_FB : CJK_FB));
      FONT_LIST.push(f);
      FONT_BY_ID[f.id] = f;
    }
  }
  /* v1 の書体名 → v2 */
  const LEGACY_FONT = { mincho: 'hiramin', yumincho: 'yumin', serif: 'baskerville', garamond: 'garamond', canela: 'canela13', group: 'group12' };
  const fontOf = (id) => FONT_BY_ID[id] || FONT_BY_ID[LEGACY_FONT[id]] || null;
  const fontCss = (id) => { const f = fontOf(id); return f ? f.css : ''; };

  /* このブラウザで本当に使える書体か（幅を測って判定） */
  let AVAIL = null;
  function detectFonts() {
    if (AVAIL) return AVAIL;
    AVAIL = new Map();
    let ctx = null;
    try { ctx = document.createElement('canvas').getContext('2d'); } catch (e) { /* noop */ }
    if (!ctx) { for (const f of FONT_LIST) AVAIL.set(f.id, true); return AVAIL; }
    const str = 'mmmmmmmmmwwwwwlliIQg ABCDEFGH 永あア漢字한글宋 0123456789';
    const ja = 'あいうえおアイウエオ永東京漢字の花鳥風月';
    const bases = ['monospace', 'serif', 'sans-serif'];
    const bw = bases.map((b) => { ctx.font = '40px ' + b; return ctx.measureText(str).width; });
    const bj = bases.map((b) => { ctx.font = '40px ' + b; return ctx.measureText(ja).width; });
    const has = (fam) => bases.some((b, i) => { ctx.font = '40px "' + fam + '", ' + b; return Math.abs(ctx.measureText(str).width - bw[i]) > 0.05; });
    const hasJa = (fam) => bases.some((b, i) => { ctx.font = '40px "' + fam + '", ' + b; return Math.abs(ctx.measureText(ja).width - bj[i]) > 0.05; });
    for (const f of FONT_LIST) {
      const ok = f.fams ? f.fams.some(has) : true;
      AVAIL.set(f.id, ok);
      f.ja = f.fams ? (ok && f.fams.some(hasJa)) : true;
    }
    return AVAIL;
  }

  const WEIGHTS = [[100, '極細'], [200, '特細'], [300, '細'], [400, '標準'], [500, '中'], [600, 'やや太'], [700, '太'], [800, '特太'], [900, '極太']];
  const SIZES = [9, 10, 10.5, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72];
  const SPACINGS = [-0.05, -0.02, 0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3];

  /* ============================================================
   *  保存（このブラウザだけ）
   * ============================================================ */
  /* 保存先: ScriptCat の保存領域（GM_setValue）が本命。
   *   v2.2 まで使っていた notion.so の localStorage は、Notion 自身が大量に使っていて容量（約 5MB）が
   *   いっぱいになりやすく、書き込みが黙って失敗していた（＝保存されない）。
   *   GM の領域は Notion と関係なく、容量も大きい。初回だけ localStorage から引っ越す。 */
  const HAS_GM = typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
  const parseJ = (v) => { if (v == null) return null; if (typeof v === 'string') { try { return JSON.parse(v); } catch (e) { return null; } } return v; };
  const gmRead = (k) => { if (!HAS_GM) return null; try { return parseJ(GM_getValue(k, null)); } catch (e) { return null; } };
  const lsRead = (k) => { try { return parseJ(localStorage.getItem(k)); } catch (e) { return null; } };
  const tsOf = (o) => (o && o.ts) || 0;
  /* 保存先を 3 か所に（どれか 1 つでも残れば復元できる）。読む時は一番新しいものを使う。
   *   ① ScriptCat の保存領域（GM_setValue）… 本命。Notion の容量と無関係
   *   ② IndexedDB（notion.so の中の ²⁶ 専用の箱）… 容量が大きい
   *   ③ localStorage … Notion が使い切っていると失敗するので、おまけ */
  let IDBP = null;
  function idbOpen() {
    if (IDBP) return IDBP;
    IDBP = new Promise((res) => {
      try {
        const r = indexedDB.open('c26-text-styles', 1);
        r.onupgradeneeded = () => { try { r.result.createObjectStore('kv'); } catch (e) { /* noop */ } };
        r.onsuccess = () => res(r.result);
        r.onerror = () => res(null);
        r.onblocked = () => res(null);
      } catch (e) { res(null); }
    });
    return IDBP;
  }
  const idbPut = (k, j) => idbOpen().then((db) => new Promise((res) => {
    if (!db) return res(false);
    try { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(j, k); tx.oncomplete = () => res(true); tx.onerror = () => res(false); tx.onabort = () => res(false); } catch (e) { res(false); }
  }));
  const idbGet = (k) => idbOpen().then((db) => new Promise((res) => {
    if (!db) return res(null);
    try { const rq = db.transaction('kv', 'readonly').objectStore('kv').get(k); rq.onsuccess = () => res(parseJ(rq.result)); rq.onerror = () => res(null); } catch (e) { res(null); }
  }));
  function lsGet(k) {
    const a = gmRead(k), b = lsRead(k);
    return tsOf(b) > tsOf(a) ? b : (a || b);
  }
  const SAVE_STATE = { t: 0, gm: null, idb: null, ls: null };
  function lsSet(k, v) {
    if (v && typeof v === 'object') v.ts = Date.now();
    const j = JSON.stringify(v);
    let gm = false, ls = false;
    if (HAS_GM) { try { GM_setValue(k, j); gm = true; } catch (e) { console.warn('[²⁶] GM_setValue', e); } }
    /* localStorage は ScriptCat の保存が使えない時だけ（Notion 自身の容量を圧迫しないため） */
    if (!gm) { try { localStorage.setItem(k, j); ls = true; } catch (e) { /* Notion が容量を使い切っている時は失敗する */ } }
    SAVE_STATE.t = Date.now(); SAVE_STATE.gm = HAS_GM ? gm : null; SAVE_STATE.ls = ls;
    return idbPut(k, j).then((ok) => {
      SAVE_STATE.idb = ok;
      if (!gm && !ls && !ok) toast('保存できませんでした');
      return { gm, ls, idb: ok };
    });
  }
  function toast(msg) {
    try {
      installUiCss();
      const t = document.createElement('div');
      t.className = 'c26-toast c26-ui';
      t.setAttribute('data-no-passthrough', '1');
      t.textContent = msg;
      (document.body || document.documentElement).appendChild(t);
      setTimeout(() => t.remove(), 4200);
    } catch (e) { /* noop */ }
  }

  /* ブロック単位（v1 と同じ形。colors は v2 では使わない） */
  const blank = () => ({ colors: {}, blocks: {}, only: {} });
  let DB = { v: 1, global: blank(), pages: {}, names: {} };
  { const o = lsGet(LS_KEY); if (o && typeof o === 'object' && o.global) DB = Object.assign(DB, o); }
  if (!DB.pstyles) DB.pstyles = {};   // 段落スタイル { id: { name, type, st, inner } }
  if (!DB.passign) DB.passign = {};   // ブロック → 段落スタイル { blockId: styleId }
  const save = () => lsSet(LS_KEY, DB);
  const pageStore = (id, make) => {
    if (!id) return null;
    if (!DB.pages[id] && make) DB.pages[id] = blank();
    return DB.pages[id] || null;
  };
  const clean = (o) => { for (const k of Object.keys(o)) if (o[k] === '' || o[k] == null) delete o[k]; return o; };

  let PREFS = { mode: 'chip', show: true, guard: true, showMissing: false };
  { const o = lsGet(LS_PREFS); if (o && typeof o === 'object') PREFS = Object.assign(PREFS, o); }
  if (PREFS.pop === false && !PREFS.v4) PREFS.mode = 'off';
  if (!PREFS.v4) { PREFS.v4 = 1; if (PREFS.pop !== false) PREFS.mode = 'chip'; delete PREFS.recent; }
  if (!PREFS.v5) { PREFS.v5 = 1; PREFS.reverts = false; }   // 「編集中は外す」を既定でオフに戻す（選択すると書体が戻る原因）
  if (!PREFS.v3) { PREFS.reverts = false; PREFS.v3 = 1; }   // v2.2 が読み込み時の描き直しを「取り合い」と誤認して勝手に入れていたのを戻す
  const savePrefs = () => lsSet(LS_PREFS, PREFS);
  if (!PREFS.v6) { PREFS.v6 = 1; if (PREFS.show === undefined) PREFS.show = true; }
  if (!PREFS.v7) { PREFS.v7 = 1; PREFS.mode = PREFS.mode === 'off' ? 'off' : 'dock'; }
  /* v9: 文字色 9 色は Notion 本来の色付け用に空ける（書式の目印は背景色 9 色だけ。今ある書式はそのまま使える） */
  if (!PREFS.v12) { PREFS.v12 = 1; PREFS.ghost = false; setTimeout(savePrefs, 0); }
  if (!PREFS.v9) { PREFS.v9 = 1; PREFS.noReserve = [...new Set([...(PREFS.noReserve || []), 'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'])]; PREFS.mode = PREFS.mode === 'off' ? 'off' : 'dock'; setTimeout(savePrefs, 0); }
  /* 保存ボタン: 全部を今すぐ書き込み、読み戻して確かめる */
  function saveAll() {
    return Promise.all([lsSet(LS_SLOTS, { v: 1, slots: SLOTS }), lsSet(LS_KEY, DB), lsSet(LS_PREFS, PREFS)]).then((rs) => {
      const gmOk = !HAS_GM || rs.every((r) => r.gm);
      const idbOk = rs.every((r) => r.idb);
      const lsOk = rs.every((r) => r.ls || r.gm);
      const back = gmRead(LS_SLOTS) || lsRead(LS_SLOTS);
      const verified = !!back && JSON.stringify(back.slots) === JSON.stringify(SLOTS);
      return { gm: HAS_GM ? gmOk : null, idb: idbOk, ls: lsOk, verified: verified || idbOk };
    });
  }
  /* IndexedDB の方が新しければ（ScriptCat・localStorage が失敗していた時）そちらを採用 */
  function adoptNewer() {
    Promise.all([idbGet(LS_SLOTS), idbGet(LS_KEY), idbGet(LS_PREFS)]).then(([m, d, pf]) => {
      if (m && m.slots && tsOf(m) > tsOf(lsGet(LS_SLOTS))) { SLOTS = m.slots; writeSlotCss(); }
      if (d && d.global && tsOf(d) > tsOf(DB)) { DB = d; writeCss(); }
      if (pf && tsOf(pf) > tsOf(PREFS)) PREFS = Object.assign(PREFS, pf);
    });
  }

  /* ============================================================
   *  書式 → CSS（文字の書式 = Notion の文字色 1 つ = 「書式の枠」1 つ）
   *    Notion には「DOMLock」があり、本文の中の要素を書き換えると即座に元へ戻される（警告
   *    "NOTION WARNING Reverting mutation"）。だから本文には一切手を触れない。
   *    代わりに Notion 自身のデータに「文字色」を付け、Notion が描く色付きの文字を CSS で
   *    書体・大きさ・太さ・斜体・字間に置き換える。色はこのブラウザでは見せない。
   * ============================================================ */
  const ST_KEYS = ['ff', 'fs', 'fw', 'it', 'ls', 'col', 'hl', 'hlm', 'em', 'ud', 'va', 'sc'];   // col = 文字色・hl = 背景色・hlm = 背景の形・em = 傍点・ud = 下線の形・va = 上付き／下付き・sc = スモールキャップ
  function normSt(st) {
    const o = {};
    for (const k of ST_KEYS) if (st && st[k] !== undefined && st[k] !== null && st[k] !== '') o[k] = st[k];
    return o;
  }
  const isEmptySt = (st) => !st || !ST_KEYS.some((k) => st[k] !== undefined);
  function mergeSt(st, patch) {
    const o = Object.assign({}, st);
    for (const k of Object.keys(patch)) { if (patch[k] === null || patch[k] === undefined || patch[k] === '') delete o[k]; else o[k] = patch[k]; }
    return normSt(o);
  }
  const sameSt = (a, b) => JSON.stringify(normSt(a)) === JSON.stringify(normSt(b));
  function styleDecl(st) {
    const d = [];
    if (st.ff && fontCss(st.ff)) d.push('font-family:' + fontCss(st.ff));
    if (st.fs) d.push('font-size:' + st.fs + 'px');
    if (st.fw) d.push('font-weight:' + st.fw);
    if (st.it) d.push('font-style:' + st.it);
    if (st.ls !== undefined) d.push('letter-spacing:' + st.ls + 'em');
    /* 傍点（日本語の圏点）: ﹅ ゴマ・• 黒丸・◦ 白丸 */
    if (st.em) d.push('text-emphasis:' + ({ sesame: 'filled sesame', dot: 'filled dot', circle: 'open circle', tri: 'filled triangle' }[st.em] || 'filled sesame'), 'text-emphasis-position:over right', '-webkit-text-emphasis:' + ({ sesame: 'filled sesame', dot: 'filled dot', circle: 'open circle', tri: 'filled triangle' }[st.em] || 'filled sesame'));
    /* 下線の形（色は文字と同じ） */
    if (st.ud) d.push('text-decoration-line:underline', 'text-decoration-style:' + st.ud, 'text-decoration-thickness:' + (st.ud === 'wavy' ? '1px' : st.ud === 'double' ? '1px' : '1.5px'), 'text-underline-offset:' + (st.ud === 'wavy' ? '.22em' : '.18em'), 'text-decoration-skip-ink:auto');
    /* 上付き・下付き（注の番号など） */
    if (st.va) d.push('vertical-align:' + st.va, 'font-size:.68em', 'line-height:0');
    if (st.sc) d.push('font-variant-caps:' + (st.sc === 'all' ? 'all-small-caps' : 'small-caps'), 'letter-spacing:' + (st.ls !== undefined ? st.ls : 0.04) + 'em');
    return d.map((x) => x + ' !important').join(';');
  }

  /* Notion の色（書式の枠）。上から順に使う。文字色のほうが他の端末で目立たない */
  const COLORS = [
    ['brown', '茶'], ['orange', 'オレンジ'], ['yellow', '黄'], ['green', '緑'], ['blue', '青'],
    ['purple', '紫'], ['pink', 'ピンク'], ['red', '赤'], ['gray', 'グレー'],
    ['brown_background', '茶の背景'], ['orange_background', 'オレンジの背景'], ['yellow_background', '黄の背景'],
    ['green_background', '緑の背景'], ['blue_background', '青の背景'], ['purple_background', '紫の背景'],
    ['pink_background', 'ピンクの背景'], ['red_background', '赤の背景'], ['gray_background', 'グレーの背景']
  ];
  const COLOR_LABEL = Object.fromEntries(COLORS);
  const isBg = (c) => /_background$/.test(c);
  /* 色の描き方（Notion の変数を使う＝ライト／ダークで Notion と同じ色。無ければ既定の色） */
  const TXT_HEX = { gray: '#787774', brown: '#9F6B53', orange: '#D9730D', yellow: '#CB912F', green: '#448361', blue: '#337EA9', purple: '#9065B0', pink: '#C14C8A', red: '#D44C47' };
  const BG_HEX = { gray: '#F1F1EF', brown: '#F4EEEE', orange: '#FBECDD', yellow: '#FBF3DB', green: '#EDF3EC', blue: '#E7F3F8', purple: '#F6F3F9', pink: '#FAF1F5', red: '#FDEBEC' };
  const AB2 = { gray: 'gra', brown: 'bro', orange: 'ora', yellow: 'yel', green: 'gre', blue: 'blu', purple: 'pur', pink: 'pin', red: 'red' };
  const tVar = (c) => 'var(--c-' + AB2[c] + 'TexSec, ' + TXT_HEX[c] + ')';
  const bVar = (c) => 'var(--ca-' + AB2[c] + 'BacSecTra, ' + BG_HEX[c] + ')';
  /* SLOTS[color] = { name, st, sel }  sel = Notion がその色を描く時の目印（初回に自動で覚える） */
  let SLOTS = {};
  { const o = lsGet(LS_SLOTS); if (o && o.slots) SLOTS = o.slots; }
  const saveSlots = () => lsSet(LS_SLOTS, { v: 1, slots: SLOTS });
  const reserved = () => COLORS.map((c) => c[0]).filter((c) => !(PREFS.noReserve || []).includes(c));
  /* 空いている色: 一度も使っていない色から先に（削除したテンプレートの色は、その文字が残っている可能性があるので後回し） */
  function freeColor() {
    const free = reserved().filter((c) => !SLOTS[c]);
    const used = PREFS.usedColors || [];
    return free.find((c) => !used.includes(c)) || free[0] || null;
  }
  function markUsed(c, on) {
    const set = new Set(PREFS.usedColors || []);
    if (on) set.add(c); else set.delete(c);
    PREFS.usedColors = [...set];
    savePrefs();
  }
  /* 色の目印（Notion がその色を描く形）。色ごとに覚え、書式を外しても残す */
  /* Notion の決まった描き方（色名 → 変数の略号）。これで目印は最初から確定する */
  const ABBR = { gray: 'gra', brown: 'bro', orange: 'ora', yellow: 'yel', green: 'gre', blue: 'blu', purple: 'pur', pink: 'pin', red: 'red' };
  const ABBR_REV = Object.fromEntries(Object.entries(ABBR).map(([k, v]) => [v, k]));
  function canonSels(c) {
    const ab = ABBR[c.replace(/_background$/, '')];
    if (!ab) return [];
    return isBg(c)
      ? ['[data-notion-highlight="' + c + '"]', '[style*="background:var(--ca-' + ab + 'Bac"]', '[style*="background:var(--c-' + ab + 'Bac"]', '[style*="background-color:var(--ca-' + ab + 'Bac"]']
      : ['[data-notion-highlight="' + c + '"]', '[style*="color:var(--c-' + ab + 'Tex"]'];
  }
  /* 目印の文字列から、それが何色の目印かを読む（読めなければ null） */
  function colorOfSel(sel) {
    const h = /data-notion-highlight="([a-z_]+)"/.exec(sel);
    if (h) return h[1];
    const m = /--ca?-(gra|bro|ora|yel|gre|blu|pur|pin|red)(Tex|Bac)/.exec(sel);
    if (m) return ABBR_REV[m[1]] + (m[2] === 'Bac' ? '_background' : '');
    return null;
  }
  /* その色の目印として正しいか（ほかの色の目印・ほかの色に付いている目印は不可） */
  function selOk(c, sel) {
    if (!sel) return false;
    const k = colorOfSel(sel);
    if (k) return k === c;
    return !Object.entries(SELS).some(([o, arr]) => o !== c && (arr || []).includes(sel));
  }
  let SELS = {};
  { const o = lsGet(LS_SELS); if (o && o.sels) SELS = o.sels; }
  for (const [c, sl] of Object.entries(SLOTS)) if (sl && sl.sel && !(SELS[c] || []).includes(sl.sel)) (SELS[c] = SELS[c] || []).push(sl.sel);
  /* 起動時の掃除: 取り違えて覚えた目印（ほかの色の変数を含むもの・2 色以上に付いているもの）を外す */
  {
    const count = new Map();
    for (const arr of Object.values(SELS)) for (const x of new Set(arr || [])) count.set(x, (count.get(x) || 0) + 1);
    let changed = false;
    for (const [c, arr] of Object.entries(SELS)) {
      const keep = [...new Set(arr || [])].filter((x) => { const k = colorOfSel(x); return k ? k === c : count.get(x) === 1; });
      if (keep.length !== (arr || []).length) { SELS[c] = keep; changed = true; }
    }
    if (changed) { try { lsSet(LS_SELS, { v: 1, sels: SELS }); } catch (e) { /* noop */ } }
  }
  const saveSels = () => lsSet(LS_SELS, { v: 1, sels: SELS });
  const selsOf = (c) => [...new Set([...canonSels(c), ...(SELS[c] || []).filter((x) => { const k = colorOfSel(x); return k ? k === c : true; })])];
  function addSel(c, sel) {
    if (!selOk(c, sel)) { log('ほかの色の目印なので覚えません', { c, sel }); return false; }
    const a = SELS[c] = SELS[c] || [];
    /* 1 つの目印は 1 つの色だけ（ほかの色に付いていたら外す） */
    for (const [k, arr] of Object.entries(SELS)) if (k !== c && arr.includes(sel)) SELS[k] = arr.filter((x) => x !== sel);
    if (a.includes(sel)) return false;
    a.unshift(sel); if (a.length > 4) a.length = 4;
    saveSels(); writeSlotCss();
    if (snap && pop && !pop.hidden) refreshPop();
    log('色の目印を覚えました', { c, sel });
    return true;
  }
  const TEXT_ROOT = ':is(' + LEAF + ',' + TITLE + ')';
  function writeSlotCss() {
    let el = document.getElementById(MARK_STYLE_ID);
    if (!el) { el = document.createElement('style'); el.id = MARK_STYLE_ID; (document.head || document.documentElement).appendChild(el); }
    const out = ['/* ²⁶ 文字の書式（Notion の文字色 → 書体） */'];
    if (PREFS.show !== false) {
      for (const [c, sl] of Object.entries(SLOTS)) {
        const sels = selsOf(c);
        if (!sl || !sels.length) continue;
        const sel = TEXT_ROOT + ' :is(' + sels.join(',') + ')' + BOOST;
        const d = [styleDecl(sl.st || {})];
        const s0 = sl.st || {};
        if (!sl.showColor) {
          /* 目印の色は見せない。書式の中の文字色・背景色（col / hl）があれば、それで描く */
          if (isBg(c)) {
            if (s0.hl && AB2[s0.hl] && s0.hlm === 'marker') d.push('background:linear-gradient(transparent 58%, color-mix(in srgb, ' + tVar(s0.hl) + ' 26%, transparent) 58%) !important', 'background-color:transparent !important', 'box-shadow:none !important', 'padding:0 1px !important');
            else if (s0.hl && AB2[s0.hl]) d.push('background:' + bVar(s0.hl) + ' !important', 'background-color:' + bVar(s0.hl) + ' !important');
            else d.push('background:transparent !important', 'background-color:transparent !important', 'box-shadow:none !important', 'padding:0 !important');
            if (s0.col && AB2[s0.col]) d.push('color:' + tVar(s0.col) + ' !important', 'fill:' + tVar(s0.col) + ' !important');
          } else {
            if (s0.col && AB2[s0.col]) d.push('color:' + tVar(s0.col) + ' !important', 'fill:' + tVar(s0.col) + ' !important');
            else d.push('color:inherit !important', 'fill:currentColor !important');
            if (s0.hl && AB2[s0.hl] && s0.hlm === 'marker') d.push('background:linear-gradient(transparent 58%, color-mix(in srgb, ' + tVar(s0.hl) + ' 26%, transparent) 58%) !important');
            else if (s0.hl && AB2[s0.hl]) d.push('background:' + bVar(s0.hl) + ' !important');
          }
        }
        out.push(sel + '{' + d.filter(Boolean).join(';') + '}');
        markUsedSilently(c);
        const inh = [];
        const st = sl.st || {};
        if (st.ff) inh.push('font-family:inherit !important');
        if (st.fs) inh.push('font-size:inherit !important');
        if (st.fw) inh.push('font-weight:inherit !important');
        if (st.it) inh.push('font-style:inherit !important');
        if (st.ls !== undefined) inh.push('letter-spacing:inherit !important');
        if (inh.length) out.push(TEXT_ROOT + ' :is(' + sels.join(',') + ') *' + BOOST + '{' + inh.join(';') + '}');
      }
    }
    /* 削除したテンプレートの色（使ったことがあり、今は枠が空き）は、色だけ消して普通の文字に見せる */
    if (PREFS.show !== false) {
      for (const c of reserved()) {
        if (SLOTS[c] || !(PREFS.usedColors || []).includes(c)) continue;
        const sels = selsOf(c);
        if (!sels.length) continue;
        out.push(TEXT_ROOT + ' :is(' + sels.join(',') + ')' + BOOST + '{' + (isBg(c) ? 'background:transparent !important;background-color:transparent !important' : 'color:inherit !important;fill:currentColor !important') + '}');
      }
    }
    const css = out.join('\n');
    if (el.textContent !== css) el.textContent = css;
  }
  function markUsedSilently(c) { const u = PREFS.usedColors || (PREFS.usedColors = []); if (!u.includes(c)) { u.push(c); setTimeout(savePrefs, 0); } }

  /* ============================================================
   *  本文の文字欄と文字位置（Notion のデータと同じ数え方: メンション等は 1 文字）
   * ============================================================ */
  const PH = '￼';
  const blockOf = (leaf) => leaf.closest('[data-block-id]');
  const OWN_FILTER = {
    acceptNode(n) {
      if (n.hasAttribute('data-block-id')) return NodeFilter.FILTER_REJECT;
      return n.getAttribute('data-content-editable-leaf') === 'true' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  };
  function leavesOfBlock(b, stopAt) {
    const out = [];
    const w = document.createTreeWalker(b, NodeFilter.SHOW_ELEMENT, OWN_FILTER);
    let n;
    while ((n = w.nextNode())) { out.push(n); if (n === stopAt) break; }
    return out;
  }
  function modelUnits(leaf) {
    const out = [];
    (function walk(el) {
      for (let c = el.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) out.push({ node: c, len: c.data.length });
        else if (c.nodeType === 1) {
          if (c.getAttribute('contenteditable') === 'false') out.push({ node: c, len: 1, atom: true });
          else walk(c);
        }
      }
    })(leaf);
    return out;
  }
  const modelTextOf = (leaf) => modelUnits(leaf).map((u) => (u.atom ? PH : u.node.data)).join('');
  function modelOffset(leaf, node, off) {
    const units = modelUnits(leaf);
    const r = document.createRange();
    try { r.setStart(node, off); } catch (e) { return 0; }
    r.collapse(true);
    let n = 0;
    for (const u of units) {
      if (u.node === node) return n + (u.atom ? (off > 0 ? 1 : 0) : Math.min(off, u.len));
      if (u.atom && u.node.contains(node)) return n + 1;
      let c;
      try { c = r.comparePoint(u.node, 0); } catch (e) { c = 1; }
      if (c >= 0) return n;
      n += u.len;
    }
    return n;
  }
  function unitAt(leaf, off) {
    let n = 0;
    for (const u of modelUnits(leaf)) { if (off < n + u.len) return u; n += u.len; }
    return null;
  }
  function caretLeaf() {
    const sel = document.getSelection();
    const n = sel && sel.anchorNode;
    const el = n ? (n.nodeType === 1 ? n : n.parentElement) : null;
    const lf = el && el.closest(LEAF);
    return lf && (lf.closest(CONTENT) || lf.closest(TITLE)) ? lf : null;
  }
  function leavesInSelection() {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount) return [];
    if (sel.isCollapsed) { const lf = caretLeaf(); return lf ? [lf] : []; }
    const r = sel.getRangeAt(0);
    const anc = r.commonAncestorContainer;
    const el = anc.nodeType === 1 ? anc : anc.parentElement;
    if (!el) return [];
    const lf = el.closest(LEAF);
    if (lf) return (lf.closest(CONTENT) || lf.closest(TITLE)) ? [lf] : [];
    const root = el.closest('.layout') || el;
    return [...root.querySelectorAll(LEAF)].filter((l) => (l.closest(CONTENT) || l.closest(TITLE)) && (() => { try { return r.intersectsNode(l); } catch (e) { return false; } })());
  }
  const LOG = [];
  const log = (msg, x) => { LOG.push({ t: new Date().toISOString().slice(11, 23), msg, x }); if (LOG.length > 60) LOG.shift(); };

  /* 今その位置に付いている「書式の枠」（Notion の色） */
  function slotAt(leaf, off) {
    const u = unitAt(leaf, off);
    if (!u) return null;
    let el = u.node.nodeType === 1 ? u.node : u.node.parentElement;
    for (; el && el !== leaf && leaf.contains(el); el = el.parentElement) {
      for (const c of Object.keys(SLOTS)) for (const sel of selsOf(c)) { try { if (el.matches(sel)) return c; } catch (e) { /* noop */ } }
    }
    return null;
  }

  /* ============================================================
   *  Notion の API（文字色を付ける／外す）
   * ============================================================ */
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
  function activeUser() { const m = /(?:^|;\s*)notion_user_id=([^;]+)/.exec(document.cookie || ''); return m ? decodeURIComponent(m[1]) : ''; }
  async function apiPost(path, body, spaceId) {
    const url = location.origin + path;
    const headers = { 'Content-Type': 'application/json' };
    const u = activeUser();
    if (u) headers['x-notion-active-user-header'] = u;
    if (spaceId) headers['x-notion-space-id'] = spaceId;
    const text = JSON.stringify(body);
    let lastErr = '';
    const tries = [];
    const UW = typeof unsafeWindow !== 'undefined' ? unsafeWindow : null;
    if (UW && UW !== window && typeof UW.fetch === 'function') {
      tries.push(() => { let init = { method: 'POST', credentials: 'same-origin', headers, body: text }; if (typeof cloneInto === 'function') init = cloneInto(init, UW); return UW.fetch(url, init); });
    }
    tries.push(() => fetch(url, { method: 'POST', credentials: 'same-origin', headers, body: text }));
    for (const t of tries) {
      try {
        const r = await t();
        const s = await r.text();
        if (r.ok) return s ? JSON.parse(s) : {};
        lastErr = 'HTTP ' + r.status + ' ' + String(s).slice(0, 160);
      } catch (e) { lastErr = String(e && e.message || e); }
    }
    if (typeof GM_xmlhttpRequest === 'function') {
      return new Promise((res, rej) => {
        GM_xmlhttpRequest({
          method: 'POST', url, headers, data: text, anonymous: false,
          onload: (r) => { if (r.status >= 200 && r.status < 300) { try { res(r.responseText ? JSON.parse(r.responseText) : {}); } catch (e) { rej(e); } } else rej(new Error('HTTP ' + r.status + ' ' + String(r.responseText).slice(0, 160))); },
          onerror: () => rej(new Error(lastErr || 'network'))
        });
      });
    }
    throw new Error(lastErr || 'API に届きませんでした');
  }
  async function getBlock(id) {
    const j = await apiPost('/api/v3/syncRecordValues', { requests: [{ table: 'block', id, version: -1 }] });
    const node = j && j.recordMap && j.recordMap.block && j.recordMap.block[id];
    if (!node) return null;
    return node.value && node.value.value ? node.value.value : (node.value || null);
  }
  const titleText = (title) => (title || []).map((s) => String(s[0])).join('').replace(/[‣⁍]/g, PH);
  /* title（Notion の文字データ）の [s, e) の文字色を color に（null = 外す）。onlyOurs = ²⁶ の枠の色だけ外す */
  function recolor(title, s, e, color, onlyOurs) {
    const out = [];
    let pos = 0;
    for (const seg of title || []) {
      const text = String(seg[0]);
      const ann = Array.isArray(seg[1]) ? seg[1] : [];
      const a = pos, b = pos + text.length;
      pos = b;
      const cl = (x) => Math.max(a, Math.min(b, x));
      const cuts = [a, cl(s), cl(e), b];
      for (let i = 0; i < 3; i++) {
        const x = cuts[i], y = cuts[i + 1];
        if (y <= x) continue;
        let an = ann.map((q) => q.slice());
        if (i === 1) {
          const cur = an.find((q) => q[0] === 'h');
          if (!(onlyOurs && cur && !SLOTS[cur[1]])) {
            an = an.filter((q) => q[0] !== 'h');
            if (color) an.push(['h', color]);
          }
        }
        out.push(an.length ? [text.slice(x - a, y - a), an] : [text.slice(x - a, y - a)]);
      }
    }
    /* 同じ飾りが続く所はまとめる（メンション等の 1 文字は別） */
    const merged = [];
    for (const seg of out) {
      const p = merged[merged.length - 1];
      const atom = (t) => /^[‣⁍]$/.test(t);
      if (p && !atom(p[0]) && !atom(seg[0]) && JSON.stringify(p[1] || []) === JSON.stringify(seg[1] || [])) p[0] += seg[0];
      else merged.push(seg.slice());
    }
    return merged;
  }
  const HIST = [];
  let busy = 0;
  /* parts: [{ bid, leaf, s, e }] */
  async function getBlocks(ids) {
    const j = await apiPost('/api/v3/syncRecordValues', { requests: ids.map((id) => ({ table: 'block', id, version: -1 })) });
    const map = new Map();
    for (const id of ids) {
      const node = j && j.recordMap && j.recordMap.block && j.recordMap.block[id];
      const v = node ? (node.value && node.value.value ? node.value.value : node.value) : null;
      if (v) map.set(id, v);
    }
    return map;
  }
  /* 選んだ範囲（何段落でも）に、1 回の書き込みでまとめて色を付ける／外す */
  async function writeColor(parts, color, onlyOurs) {
    const byBlock = new Map();
    for (const p of parts) { if (!byBlock.has(p.bid)) byBlock.set(p.bid, []); byBlock.get(p.bid).push(p); }
    const ids = [...byBlock.keys()];
    const ops = [];
    const step = [];
    let spaceId = '';
    busy++;
    if (snap && pop) refreshPop();
    try {
      /* 画面の文章と Notion のデータが一致する段落だけ書き込む（入力直後の未送信分があれば少し待つ） */
      let recs = new Map(), bad = ids;
      for (let tries = 0; tries < 5 && bad.length; tries++) {
        if (tries) await new Promise((r) => setTimeout(r, 350));
        const got = await getBlocks(bad);
        for (const [id, v] of got) recs.set(id, v);
        bad = ids.filter((id) => {
          const v = recs.get(id);
          const leaf = byBlock.get(id)[0].leaf;
          return !v || (leaf && leaf.isConnected && titleText(v.properties && v.properties.title) !== modelTextOf(leaf));
        });
      }
      for (const id of ids) {
        if (bad.includes(id)) continue;
        const rec = recs.get(id);
        spaceId = rec.space_id || spaceId;
        const before = (rec.properties && rec.properties.title) || [];
        let after = before;
        for (const p of byBlock.get(id)) after = recolor(after, p.s, p.e, color, onlyOurs);
        if (JSON.stringify(after) === JSON.stringify(before)) continue;
        const ptr = { table: 'block', id, spaceId: rec.space_id };
        ops.push({ pointer: ptr, path: ['properties', 'title'], command: 'set', args: after });
        ops.push({ pointer: ptr, path: [], command: 'update', args: { last_edited_time: Date.now() } });
        step.push({ bid: id, spaceId: rec.space_id, before, after });
      }
      const preSel = parts.length ? anySelAt(parts.find((p) => !bad.includes(p.bid)) || parts[0]) : '';
      if (bad.length === ids.length) throw new Error('この部分の中身を Notion から読み取れませんでした（入力直後なら少し待ってもう一度）');
      if (bad.length) toast(bad.length + ' 段落は読み取れなかったので飛ばしました');
      if (ops.length) {
        await apiPost('/api/v3/saveTransactions', { requestId: uuid(), transactions: [{ id: uuid(), spaceId, debug: { userAction: 'c26.textStyle' }, operations: ops }] }, spaceId);
        HIST.push({ kind: 'api', step });
        if (HIST.length > 30) HIST.shift();
        log('文字色を書き込み', { color, blocks: step.length });
      }
      if (color) learnSelector(color, parts.filter((p) => !bad.includes(p.bid)), preSel);
      return step;
    } catch (e) {
      console.warn('[²⁶]', e);
      toast('付けられませんでした: ' + (e && e.message ? e.message : e));
      log('失敗', String(e && e.message || e));
      return null;
    } finally { busy--; if (snap && pop) refreshPop(); else refreshSave(); }
  }
  /* Notion がその色をどんな形で描くかを覚える。
   *   Notion のデータ（どの文字に何色が付いているか）と画面の文字を突き合わせ、色付きの文字を包む要素の
   *   style（例: color:rgba(…)）や class を目印にする。書き込んだ直後と、色付きの文字を選んだ時に毎回確かめる。 */
  function selectorFor(el, color, leaf) {
    for (; el && el !== leaf && leaf.contains(el); el = el.parentElement) {
      const st = el.getAttribute('style') || '';
      const decl = st.split(';').map((x) => x.trim()).find((x) => isBg(color) ? /^background(-color)?\s*:/i.test(x) : /^color\s*:/i.test(x));
      if (decl) return '[style*="' + decl.replace(/"/g, '\\"') + '"]';
      const key = color.split('_')[0];
      const cls = [...el.classList].find((k) => k.toLowerCase().includes(key));
      if (cls) return '.' + CSS.escape(cls);
    }
    return '';
  }
  function learnFromTitle(leaf, title) {
    if (!leaf || !title) return 0;
    if (titleText(title) !== modelTextOf(leaf)) return 0;
    let pos = 0, n = 0;
    for (const seg of title) {
      const t = String(seg[0]);
      const h = (Array.isArray(seg[1]) ? seg[1] : []).find((q) => q[0] === 'h');
      if (h && t.length) {
        const u = unitAt(leaf, pos);
        const el = u ? (u.node.nodeType === 1 ? u.node : u.node.parentElement) : null;
        const sel = el ? selectorFor(el, h[1], leaf) : '';
        if (sel && selOk(h[1], sel) && addSel(h[1], sel)) n++;
      }
      pos += t.length;
    }
    return n;
  }
  /* その位置で今どんな色の目印が見えているか（書き込む前に控えておく） */
  function anySelAt(p) {
    const leaf = p.leaf && p.leaf.isConnected ? p.leaf : findLeafOf(p.bid);
    if (!leaf) return '';
    const u = unitAt(leaf, p.s);
    let el = u ? (u.node.nodeType === 1 ? u.node : u.node.parentElement) : null;
    for (; el && el !== leaf && leaf.contains(el); el = el.parentElement) {
      const st = el.getAttribute('style') || '';
      const decl = st.split(';').map((x) => x.trim()).find((x) => /^(color|background(-color)?)\s*:/i.test(x));
      if (decl) return '[style*="' + decl.replace(/"/g, '\\"') + '"]';
    }
    return '';
  }
  function matchesColor(el, color, leaf) {
    const sels = selsOf(color);
    for (; el && el !== leaf && leaf.contains(el); el = el.parentElement) {
      for (const x of sels) { try { if (el.matches(x)) return true; } catch (e) { /* noop */ } }
    }
    return false;
  }
  function learnSelector(color, parts, preSel) {
    const p = parts[0];
    if (!p) return;
    const t0 = Date.now();
    const known = (sel) => Object.entries(SELS).some(([k, arr]) => k !== color && arr.includes(sel));
    const tick = async () => {
      const leaf = p.leaf && p.leaf.isConnected ? p.leaf : findLeafOf(p.bid);
      if (leaf) {
        const u = unitAt(leaf, p.s);
        const el = u ? (u.node.nodeType === 1 ? u.node : u.node.parentElement) : null;
        const sel = el ? selectorFor(el, color, leaf) : '';
        /* 決まった目印ですでに描けていれば何もしない */
        if (el && matchesColor(el, color, leaf)) return;
        if (sel && (selsOf(color).includes(sel) || (SELS[color] || []).includes(sel))) return;
        /* 書き込む前と同じ見た目（Notion がまだ描き直していない）や、ほかの色の目印なら待つ */
        if (sel && sel !== preSel && !known(sel) && selOk(color, sel)) { addSel(color, sel); return; }
      }
      if (Date.now() - t0 < 12000) setTimeout(tick, 150);
      else if (!canonSels(color).length) toast('Notion の色の描き方を読み取れませんでした（その文字の HTML を教えてください）');
    };
    setTimeout(tick, 100);
  }
  /* 選んだ段落に色付きの文字があれば、その場で目印を確かめる（5 秒に 1 回まで） */
  const learnedAt = new Map();
  function learnFromLeaf(leaf, bid) {
    if (!leaf || !bid) return;
    if (!modelUnits(leaf).some((u) => !u.atom && u.node.parentElement && u.node.parentElement !== leaf && (u.node.parentElement.getAttribute('style') || u.node.parentElement.className))) return;
    const t = learnedAt.get(bid) || 0;
    if (Date.now() - t < 5000) return;
    learnedAt.set(bid, Date.now());
    getBlock(bid).then((rec) => { if (rec) learnFromTitle(leaf, rec.properties && rec.properties.title); if (snap) refreshPop(); }).catch(() => {});
  }
  function findLeafOf(bid) {
    const b = document.querySelector('[data-block-id="' + bid + '"]');
    return b ? leavesOfBlock(b)[0] || null : null;
  }
  /* 書き込み前の状態に戻す（その後に文章が変わっていなければ） */
  async function revertStep(step) {
    if (!step || !step.length) return true;
    const ops = [];
    let spaceId = '';
    const recs = await getBlocks(step.map((x) => x.bid));
    for (const x of step) {
      const rec = recs.get(x.bid);
      if (!rec || JSON.stringify((rec.properties && rec.properties.title) || []) !== JSON.stringify(x.after)) { toast('その後に文章が変わったので、元に戻せませんでした'); return false; }
      spaceId = x.spaceId;
      const ptr = { table: 'block', id: x.bid, spaceId: x.spaceId };
      ops.push({ pointer: ptr, path: ['properties', 'title'], command: 'set', args: x.before });
      ops.push({ pointer: ptr, path: [], command: 'update', args: { last_edited_time: Date.now() } });
    }
    try { await apiPost('/api/v3/saveTransactions', { requestId: uuid(), transactions: [{ id: uuid(), spaceId, operations: ops }] }, spaceId); return true; }
    catch (e) { toast('元に戻せませんでした: ' + e.message); return false; }
  }
  async function undoLast() {
    const h = HIST.pop();
    if (!h) return;
    if (h.kind === 'slot') { SLOTS[h.color] = h.before; if (!h.before) delete SLOTS[h.color]; saveSlots(); writeSlotCss(); return; }
    busy++; refreshSave();
    try { await revertStep(h.step); } finally { busy--; refreshSave(); }
  }

  /* ============================================================
   *  選んだ文字（スナップショット）
   * ============================================================ */
  function titleAt() {
    const sel = document.getSelection();
    const n = sel && sel.anchorNode;
    const el = n ? (n.nodeType === 1 ? n : n.parentElement) : null;
    const t = el && el.closest(TITLE);
    return t && layoutOf(t) ? t : null;
  }
  const titleLeaf = (tt) => (tt.matches(LEAF) ? tt : tt.querySelector(LEAF) || tt);
  const hereOf = () => caretLeaf() || titleAt();
  /* その文字欄が属するブロックの id（段落の本文 = ブロック自身の 1 番目の文字欄だけが対象） */
  function bidOf(lf) {
    const tt = lf.closest(TITLE);
    if (tt) return pageIdOf(layoutOf(tt));
    const b = blockOf(lf);
    if (!b) return '';
    return leavesOfBlock(b, lf)[0] === lf ? b.getAttribute('data-block-id') : '';
  }
  function snapshot(allowCaret) {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const r = sel.getRangeAt(0);
    const tt = titleAt();
    if (sel.isCollapsed) {
      if (!allowCaret) return null;
      const lf = tt ? titleLeaf(tt) : caretLeaf();
      if (!lf) return null;
      let rect = r.getBoundingClientRect();
      if (!rect.width && !rect.height) rect = lf.getBoundingClientRect();
      return { parts: [], leaf: lf, rect };
    }
    let leaves = leavesInSelection();
    if (tt && !leaves.length) leaves = [titleLeaf(tt)];
    if (!leaves.length) return null;
    const parts = [];
    for (const lf of leaves) {
      const bid = bidOf(lf);
      if (!bid) continue;
      const len = modelTextOf(lf).length;
      const s = lf.contains(r.startContainer) ? modelOffset(lf, r.startContainer, r.startOffset) : 0;
      const e = lf.contains(r.endContainer) ? modelOffset(lf, r.endContainer, r.endOffset) : len;
      if (e > s) parts.push({ bid, leaf: lf, s, e });
    }
    return parts.length ? { parts, leaf: parts[0].leaf, rect: r.getBoundingClientRect() } : null;
  }
  const partLeaf = (p) => (p.leaf && p.leaf.isConnected ? p.leaf : (p.leaf = findLeafOf(p.bid)));
  const curSlot = () => (snap && snap.parts.length ? slotAt(partLeaf(snap.parts[0]) || snap.parts[0].leaf, snap.parts[0].s) : null);

  /* ---------- 書式を変える ----------
   *   ・選んだ文字にまだ書式が無い → 空いている Notion の色を 1 つ「書式の枠」にして、その色を文字に付ける
   *   ・このポップアップで作った枠の文字 → 枠の中身（書体など）を書き換えるだけ（Notion への書き込み無し・即反映）
   *   ・前から有る枠の文字 → 「同じ書式の文字をまとめて変える」がオンなら枠を書き換え、
   *     オフなら新しい枠に写して選んだ文字だけ変える（同じ中身の枠が既に有ればそれを使う）
   */
  /* ============================================================
   *  直接書式（Word と同じ: 選んだ文字にそのまま効き、自動で残る。テンプレートは必要な時だけ）
   *   SLOTS[color] = { st, tpl: テンプレートか, name: テンプレート名, blocks: 使った段落 }
   *   ・選んだ文字を変える → 同じ見た目の書式があればそれを、無ければ空いている色を 1 つ使い、選んだ文字に付ける
   *     （Notion への書き込みは選択ごとに 1 回。同じ選択のまま続けて変える分は、その場で反映するだけ）
   *   ・テンプレートは「保存」した時だけできる。使わなくなった直接書式の色は自動で回収する。
   * ============================================================ */
  for (const [c, sl] of Object.entries(SLOTS)) {
    if (!sl) { delete SLOTS[c]; continue; }
    if (sl.saved) sl.st = normSt(sl.saved);
    if (sl.tpl === undefined) sl.tpl = !!(sl.name && !/^(下書き|未保存の書式)$/.test(sl.name) && !/^書式 \d+$/.test(sl.name));
    delete sl.draft; delete sl.saved;
    if (!sl.tpl) delete sl.name;
  }
  let pop = null, snap = null, menuKind = '';
  let SESSION = null;   // { key, color, created, parts }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function fontShort(f) { return f ? f.name.replace(/（.*?）/g, '') : '書体'; }
  const keyOfSnap = (sn) => (sn && sn.parts ? sn.parts.map((p) => p.bid + ':' + p.s + '-' + p.e).join('|') : '');
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function noteBlocks(color, parts) {
    const sl = SLOTS[color];
    if (!sl) return;
    const set = new Set(sl.blocks || []);
    for (const p of parts) set.add(p.bid);
    sl.blocks = [...set].slice(-500);
  }
  function selText(sn, max) {
    if (!sn || !sn.parts || !sn.parts.length) return '';
    const out = [];
    for (const p of sn.parts) { const lf = partLeaf(p); if (lf) out.push(modelTextOf(lf).slice(p.s, p.e).replace(/￼/g, '')); }
    const t = out.join(' ').replace(/\s+/g, ' ').trim();
    return max && t.length > max ? t.slice(0, max) + '…' : t;
  }
  function curSt() {
    const c = SESSION && SESSION.key === keyOfSnap(snap) ? SESSION.color : curSlot();
    return { color: c, st: c && SLOTS[c] ? SLOTS[c].st : {} };
  }
  function computedAt() {
    const p = snap && snap.parts[0];
    const lf = p && partLeaf(p);
    if (!lf) return null;
    const u = unitAt(lf, p.s);
    const el = u ? (u.node.nodeType === 1 ? u.node : u.node.parentElement) : lf;
    return el ? getComputedStyle(el) : null;
  }

  async function applyStyle(patch) {
    if (!snap || !snap.parts.length) return;
    const k = keyOfSnap(snap);
    /* この選択のために作った書式 → その場で変えるだけ */
    if (SESSION && SESSION.key === k && SESSION.created && SLOTS[SESSION.color]) {
      const sl = SLOTS[SESSION.color];
      pushUndo({ kind: 'slot', color: SESSION.color, before: clone(sl) });
      sl.st = mergeSt(sl.st, patch);
      saveSlots(); writeSlotCss(); refreshPop(); ghost();
      return;
    }
    if (busy) return;
    const from = SESSION && SESSION.key === k ? SESSION.color : curSlot();
    /* 書式が無い文字なら、Notion 本来の文字色・背景色を引き継ぐ（書体を変えても色が消えない） */
    const st = mergeSt(from && SLOTS[from] ? SLOTS[from].st : nativeColorAt(), patch);
    let c = Object.keys(SLOTS).find((x) => SLOTS[x] && !SLOTS[x].tpl && sameSt(SLOTS[x].st, st));
    let created = false;
    if (!c) {
      c = freeColor();
      if (!c) { await gcSlots(); c = freeColor(); }
      if (!c) { toast('Notion の色（18 個）を全部使っています。テンプレートを減らすか、パネル設定で使える色を増やしてください'); return; }
      SLOTS[c] = { st, tpl: false, blocks: [] };
      created = true;
      markUsed(c, true);
      saveSlots(); writeSlotCss();
    }
    SESSION = { key: k, color: c, created, parts: snap.parts };
    refreshPop();
    const step = await writeColor(snap.parts, c);
    if (!step) { if (created) { delete SLOTS[c]; saveSlots(); writeSlotCss(); } SESSION = null; refreshPop(); return; }
    if (step.length) pushUndo({ kind: 'api', step, created: created ? c : null });
    if (HIST.length > 1 && HIST[HIST.length - 2].step === step) HIST.splice(HIST.length - 2, 1);
    noteBlocks(c, snap.parts);
    saveSlots();
    refreshPop(); ghost();
    if (freeCount() < 4) gcSlots();
  }
  function pushUndo(h) { HIST.push(h); if (HIST.length > 40) HIST.shift(); }
  const freeCount = () => reserved().filter((c) => !SLOTS[c]).length;
  /* 選択が終わった時: この選択で作った書式が、ほかの直接書式と同じ見た目になっていたら、そちらにまとめる */
  async function endSession() {
    const s = SESSION;
    SESSION = null;
    if (!s || !s.created || !SLOTS[s.color]) return;
    const twin = Object.keys(SLOTS).find((x) => x !== s.color && SLOTS[x] && !SLOTS[x].tpl && sameSt(SLOTS[x].st, SLOTS[s.color].st));
    if (!twin) return;
    const step = await writeColor(s.parts, twin);
    if (step) { noteBlocks(twin, s.parts); delete SLOTS[s.color]; saveSlots(); writeSlotCss(); }
  }
  /* 使われなくなった直接書式の色を回収（記録してある段落を Notion から読み、その色がもう無ければ空ける） */
  let gcAt = 0;
  async function gcSlots() {
    if (Date.now() - gcAt < 4000) return;
    gcAt = Date.now();
    const cand = Object.entries(SLOTS).filter(([c, sl]) => sl && !sl.tpl && (sl.blocks || []).length && !(SESSION && SESSION.color === c));
    const ids = [...new Set(cand.flatMap(([, sl]) => sl.blocks))];
    if (!ids.length) return;
    const recs = new Map();
    try { for (let i = 0; i < ids.length; i += 80) for (const [k, v] of await getBlocks(ids.slice(i, i + 80))) recs.set(k, v); } catch (e) { return; }
    let n = 0;
    for (const [c, sl] of cand) {
      const still = sl.blocks.filter((id) => { const r = recs.get(id); return r && ((r.properties && r.properties.title) || []).some((seg) => Array.isArray(seg[1]) && seg[1].some((q) => q[0] === 'h' && q[1] === c)); });
      if (!still.length) { delete SLOTS[c]; n++; } else sl.blocks = still;
    }
    if (n) { saveSlots(); writeSlotCss(); log('使われていない書式を回収', n); }
  }
  async function applyTemplate(color) {
    if (!snap || !snap.parts.length || !SLOTS[color]) return;
    await endSession();
    const step = await writeColor(snap.parts, color);
    if (step) { if (step.length) pushUndo({ kind: 'api', step }); noteBlocks(color, snap.parts); saveSlots(); SESSION = { key: keyOfSnap(snap), color, created: false, parts: snap.parts }; }
    refreshPop();
  }
  async function clearStyle() {
    if (!snap || !snap.parts.length) return;
    const step = await writeColor(snap.parts, null, true);
    if (step && step.length) pushUndo({ kind: 'api', step });
    SESSION = null;
    refreshPop();
  }
  function saveAsTemplate(name) {
    const { color, st } = curSt();
    if (!snap || !snap.parts.length || !color || !SLOTS[color]) { toast('先に文字の書式を変えてから保存してください'); return; }
    const sl = SLOTS[color];
    if (sl.tpl) { toast('もうテンプレート「' + sl.name + '」です'); return; }
    sl.tpl = true; sl.name = name || nextName(); sl.st = normSt(st);
    saveSlots(); writeSlotCss(); doSave(true);
    if (SESSION) SESSION.created = false;
    toast('テンプレート「' + sl.name + '」を保存しました');
    refreshPop();
  }
  function nextName() {
    const used = new Set(Object.values(SLOTS).map((s) => s && s.name));
    for (let i = 1; ; i++) if (!used.has('テンプレート ' + i)) return 'テンプレート ' + i;
  }
  async function undo() {
    const h = HIST.pop();
    if (!h) return;
    if (h.kind === 'slot') { if (h.before) SLOTS[h.color] = h.before; else delete SLOTS[h.color]; saveSlots(); writeSlotCss(); refreshPop(); return; }
    busy++; refreshPop();
    try { if (await revertStep(h.step) && h.created) { delete SLOTS[h.created]; saveSlots(); writeSlotCss(); } } finally { busy--; }
    SESSION = null;
    refreshPop();
  }

  /* ---------- 保存（このブラウザの保存領域へ。押さなくても自動） ---------- */
  let saveFlash = 0;
  function refreshSave() { if (pop && !pop.hidden) refreshPop(); }
  function autoSave() { clearTimeout(autoSave.t); autoSave.t = setTimeout(() => doSave(true), 250); }
  function doSave(quiet) {
    return saveAll().then((r) => {
      if (r.verified && !quiet) { saveFlash = Date.now() + 1600; setTimeout(refreshSave, 1650); }
      else if (!r.verified && !quiet) toast('保存を確かめられませんでした');
      refreshSave();
      return r;
    });
  }

  /* ---------- 行高・段落の間隔・揃え（段落単位。CSS だけ） ---------- */
  const LSC = { scope: 'only' };
  function blockTargets() {
    const out = [], seen = new Set();
    /* ブロックのメニュー（⋮⋮）から開いた時は、選んだブロックそのもの */
    if (snap && snap.blockEls && snap.blockEls.length) {
      for (const el of snap.blockEls) { const id = el.getAttribute('data-block-id'); const type = typeOfBlock(el); if (id && type && !seen.has(id)) { seen.add(id); out.push({ el, id, type }); } }
      return out;
    }
    const leaves = snap ? (snap.parts.length ? snap.parts.map((p) => partLeaf(p)).filter(Boolean) : [snap.leaf]) : [];
    for (const lf of leaves) {
      const c = blockChain(lf)[0];
      if (c && !seen.has(c.id)) { seen.add(c.id); out.push(c); }
    }
    return out;
  }
  function blockPropHolders(make) {
    const ts = blockTargets();
    if (!ts.length) return [];
    const pid = ts[0].type === 'title' ? ts[0].id : pageIdOf(layoutOf(ts[0].el));
    const scope = !pid ? 'global' : LSC.scope;
    if (ts[0].type === 'title') {
      if (scope === 'global') { if (make) DB.global.blocks.title = DB.global.blocks.title || {}; return [DB.global.blocks.title].filter(Boolean); }
      const s = pageStore(pid, make); if (!s) return [];
      if (make) s.blocks.title = s.blocks.title || {};
      return [s.blocks.title].filter(Boolean);
    }
    if (scope === 'global') { if (make) DB.global.blocks.all = DB.global.blocks.all || {}; return [DB.global.blocks.all].filter(Boolean); }
    const s = pageStore(pid, make); if (!s) return [];
    if (scope === 'page') { if (make) s.blocks.all = s.blocks.all || {}; return [s.blocks.all].filter(Boolean); }
    return ts.map((t) => { if (make && !s.only[t.id]) s.only[t.id] = { __type: t.type }; return s.only[t.id]; }).filter(Boolean);
  }
  function blockPropNow(k) {
    const hs = blockPropHolders(false);
    return hs.length && hs[0][k] !== undefined ? hs[0][k] : undefined;
  }
  function setBlockProp(k, v) {
    for (const h of blockPropHolders(true)) {
      /* 前・後を別々に変える時、これまでの「段落の間隔」は半分ずつ前と後に分けて残す */
      if ((k === 'mt' || k === 'mb') && h.sp !== undefined) { if (h.mt === undefined) h.mt = Number(h.sp) / 2; if (h.mb === undefined) h.mb = Number(h.sp) / 2; delete h.sp; }
      if (v === null || v === undefined || v === '') delete h[k]; else h[k] = v;
    }
    changed(); autoSave(); ensureLang(); refreshPop(); ghost();
  }
  /* 英語のハイフネーションには言語の指定が要る。Notion の言語が英語でない時だけ、本文の入れ物に lang="en" を付ける */
  function ensureLang() {
    const need = JSON.stringify(DB).includes('"hy":true') && !/^en/i.test(document.documentElement.lang || '');
    for (const el of document.querySelectorAll(CONTENT)) {
      if (need && el.getAttribute('lang') !== 'en') el.setAttribute('lang', 'en');
    }
  }

  /* ---------- ブロック（コールアウト・引用）の見た目 ---------- */
  const BSEL = { i: 0, scope: 'only' };
  function blockTarget(make) {
    const chain = blockChain(snap && snap.leaf).filter((x) => x.type === 'callout' || x.type === 'quote');
    const c = chain[0];
    if (!c) return null;
    const pid = pageIdOf(layoutOf(c.el));
    let scope = !pid ? 'global' : BSEL.scope;
    let holder, key;
    if (scope === 'global') { holder = DB.global.blocks; key = c.type; }
    else {
      const s = pageStore(pid, make);
      if (!s) return { c, scope, target: null };
      if (scope === 'page') { holder = s.blocks; key = c.type; } else { holder = s.only; key = c.id; }
    }
    if (make && !holder[key]) holder[key] = scope === 'only' ? { __type: c.type } : {};
    return { c, pid, scope, holder, key, target: holder[key] || null };
  }

  /* ============================================================
   *  メニュー（v9: Notion の選択メニューと入れ替わる）
   *   ・文字を選ぶと、Notion の選択メニューの代わりにこのメニューが選択のすぐ上（下）に出る。大きさも Notion と同じくらい。
   *   ・1 段目は Notion と同じ: ブロックの種類／文字色／太字・斜体・下線・取り消し線／リンク・コード・数式・書式を消す／元のメニュー。
   *     太字などは Notion 自身のボタンを（隠したまま）押すので、動きは Notion 本来のまま。
   *   ・2 段目は ²⁶: 書体／サイズ・太さ・字間／段落／コールアウト・引用／テンプレート。行を押すと横に詳しいパネルが開く。
   *   ・何か操作した時だけ反映（自動で保存・リロード後も同じ）。何もしなければ何も変えない。
   *   ・メニューの外を押すと閉じる（本文で別の文字を選べば、そこへ付いていく）。Esc: 横のパネル → メニューの順に閉じる。
   * ============================================================ */
  /* v24.0.0: Atelier の道具の絵 */
  const ICO_AT = {
    atelier: '<svg viewBox="0 0 20 20"><path d="M10 2.6l1.5 4.3 4.3 1.5-4.3 1.5L10 14.2l-1.5-4.3-4.3-1.5 4.3-1.5z" fill="currentColor"/><path d="M15.4 12.6l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" fill="currentColor"/></svg>',
    pick: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 4.5l4 10.5 1.6-4.4 4.4-1.6z"/><path d="M11 11l4.2 4.2"/><path d="M3 9.5V3h6.5" stroke-dasharray="1.6 1.8"/></svg>',
    toc: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><path d="M4 5h12M7 9h9M7 13h9M4 17h12"/></svg>',
    focus: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><path d="M3 7V4.5A1.5 1.5 0 0 1 4.5 3H7M13 3h2.5A1.5 1.5 0 0 1 17 4.5V7M17 13v2.5a1.5 1.5 0 0 1-1.5 1.5H13M7 17H4.5A1.5 1.5 0 0 1 3 15.5V13"/><circle cx="10" cy="10" r="2.2"/></svg>',
    count: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4.5h2.5v11M3.8 15.5h5"/><path d="M11 7.5a2.2 2.2 0 0 1 4.4 0c0 2.6-4.4 4.4-4.4 8h4.6"/></svg>'
  };
  const ICO = {
    chev: '<svg class="i-chev" viewBox="0 0 16 16"><path d="M6.722 3.238a.625.625 0 1 0-.884.884L9.716 8l-3.878 3.878a.625.625 0 0 0 .884.884l4.32-4.32a.625.625 0 0 0 0-.884z" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    turn: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M4.875 4.825c0-.345.28-.625.625-.625h9c.345 0 .625.28.625.625v1.8a.625.625 0 1 1-1.25 0V5.45h-3.25v9.1h.725a.625.625 0 1 1 0 1.25h-2.7a.625.625 0 1 1 0-1.25h.725v-9.1h-3.25v1.175a.625.625 0 1 1-1.25 0z"/></svg>',
    bold: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M6.428 3.95a.875.875 0 0 0-.875.875v10.35c0 .483.392.875.875.875h3.81c1.377 0 2.461-.298 3.203-.963.763-.682 1.006-1.607 1.006-2.5 0-1.199-.582-2.18-1.483-2.788.704-.64 1.007-1.494 1.007-2.386 0-2.145-2.08-3.463-4.086-3.463zm.875 6.925h3.359c1.303 0 2.035.805 2.035 1.713 0 .586-.153.954-.423 1.196-.29.26-.873.516-2.036.516H7.303zm2.165-1.75H7.303V5.7h2.582c1.452 0 2.336.9 2.336 1.713 0 .515-.172.89-.516 1.16-.373.294-1.057.55-2.237.552"/></svg>',
    italic: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="m10.541 5.45-2.374 9.1H6.4a.625.625 0 1 0 0 1.25h4.5a.625.625 0 1 0 0-1.25H9.46l2.374-9.1H13.6a.625.625 0 1 0 0-1.25H9.1a.625.625 0 1 0 0 1.25z"/></svg>',
    underline: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M15.4 5.45a.625.625 0 1 0 0-1.25h-2.7a.625.625 0 0 0 0 1.25h.725v5.54c0 1.743-1.434 3.335-3.425 3.335-1.235 0-2.07-.414-2.602-.996-.541-.594-.823-1.423-.823-2.339V5.45H7.3a.625.625 0 1 0 0-1.25H4.6a.625.625 0 1 0 0 1.25h.725v5.54c0 1.163.358 2.314 1.15 3.181.8.877 1.989 1.404 3.525 1.404 2.699 0 4.675-2.17 4.675-4.585V5.45zm1.525 12.2c0 .345-.28.625-.625.625H3.7a.625.625 0 1 1 0-1.25h12.6c.345 0 .625.28.625.625"/></svg>',
    strike: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M10.065 9.373H16.3a.627.627 0 1 1 0 1.255h-3.233l.122.107c.723.665 1.038 1.505 1.038 2.456 0 1.024-.503 1.868-1.288 2.436-.772.56-1.81.85-2.939.85s-2.167-.29-2.94-.85c-.784-.568-1.288-1.412-1.288-2.436a.628.628 0 0 1 1.255 0c0 .571.268 1.057.77 1.42.513.37 1.276.611 2.203.611.928 0 1.69-.24 2.204-.612.5-.362.768-.848.768-1.42 0-.644-.199-1.133-.632-1.531-.452-.416-1.207-.777-2.405-1.032H3.7a.627.627 0 1 1 0-1.255h3.233l-.122-.107C6.088 8.6 5.773 7.76 5.773 6.81c0-1.024.503-1.868 1.288-2.436.772-.56 1.81-.85 2.94-.85s2.166.29 2.938.85c.785.568 1.289 1.412 1.289 2.436a.628.628 0 0 1-1.255 0c0-.571-.268-1.057-.77-1.42-.513-.37-1.275-.612-2.203-.612s-1.69.241-2.203.613c-.502.362-.77.848-.77 1.42 0 .644.2 1.133.633 1.531.452.416 1.207.777 2.405 1.032"/></svg>',
    code: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M11.971 3.1c.332.094.525.44.43.772l-3.6 12.6a.625.625 0 0 1-1.202-.343l3.6-12.6a.625.625 0 0 1 .772-.43M5.417 5.598a.626.626 0 0 1 .885.884L2.784 10l3.518 3.519a.625.625 0 0 1-.885.883l-3.96-3.96a.626.626 0 0 1 0-.884zm8.281 0a.626.626 0 0 1 .884 0l3.96 3.96a.626.626 0 0 1 0 .884l-3.96 3.96a.626.626 0 0 1-.884-.883L17.215 10l-3.517-3.518a.626.626 0 0 1 0-.884"/></svg>',
    link: '<svg viewBox="2.5 0 14.92 20"><path fill="currentColor" d="M10.61 3.61a3.776 3.776 0 0 1 5.34 0l.367.368a3.776 3.776 0 0 1 0 5.34l-1.852 1.853a.625.625 0 1 1-.884-.884l1.853-1.853a2.526 2.526 0 0 0 0-3.572l-.368-.367a2.526 2.526 0 0 0-3.572 0L9.641 6.347a.625.625 0 1 1-.883-.883z"/><path fill="currentColor" d="M12.98 6.949a.625.625 0 0 1 0 .884L7.53 13.28a.625.625 0 0 1-.884-.884l5.448-5.448a.625.625 0 0 1 .884 0"/><path fill="currentColor" d="M6.348 8.757a.625.625 0 0 1 0 .884l-1.853 1.853a2.526 2.526 0 0 0 0 3.572l.367.367a2.525 2.525 0 0 0 3.572 0l1.853-1.852a.625.625 0 1 1 .884.883l-1.853 1.853a3.776 3.776 0 0 1-5.34 0l-.367-.367a3.776 3.776 0 0 1 0-5.34l1.853-1.853a.625.625 0 0 1 .884 0"/></svg>',
    eq: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M19.125 4.25c0 .345-.28.625-.625.625H9.07l-4.745 11.12a.626.626 0 0 1-1.07.137l-.049-.073-2.25-3.97-.05-.115a.626.626 0 0 1 1.065-.604l.073.103 1.626 2.869L8.081 4.005l.043-.083a.63.63 0 0 1 .532-.297H18.5c.345 0 .625.28.625.625"/><path fill="currentColor" d="M17.405 15.476a.625.625 0 0 1-.968.748l-.087-.092-2.694-3.487-2.693 3.487-.087.092a.624.624 0 0 1-.969-.748l.068-.108 2.892-3.743-2.892-3.743-.068-.108a.625.625 0 0 1 .97-.748l.086.092 2.693 3.486 2.694-3.486.087-.092a.624.624 0 0 1 .968.748l-.067.108-2.892 3.743 2.892 3.743z"/></svg>',
    clear: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M12.75 4.2c.345 0 .625.28.625.625v1.8a.625.625 0 0 1-1.25 0V5.45h-3.25v9.1h.726a.626.626 0 0 1 0 1.25H6.9a.625.625 0 1 1 0-1.25h.724v-9.1h-3.25v1.175a.625.625 0 0 1-1.25 0v-1.8c0-.345.28-.625.625-.625z"/><path fill="currentColor" d="M16.176 9.558a.626.626 0 0 1 .884.884l-1.68 1.68 1.68 1.679a.625.625 0 0 1-.884.884l-1.68-1.68-1.679 1.68a.626.626 0 0 1-.884-.884l1.678-1.68-1.678-1.679a.626.626 0 0 1 .884-.884l1.68 1.678z"/></svg>',
    more: '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M3.2 6.725a1.275 1.275 0 1 0 0 2.55 1.275 1.275 0 0 0 0-2.55m4.8 0a1.275 1.275 0 1 0 0 2.55 1.275 1.275 0 0 0 0-2.55m4.8 0a1.275 1.275 0 1 0 0 2.55 1.275 1.275 0 0 0 0-2.55"/></svg>',
    comment: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M5.875 7.505c0-.345.28-.625.625-.625h7a.625.625 0 1 1 0 1.25h-7a.625.625 0 0 1-.625-.625m0 3c0-.345.28-.625.625-.625h5a.625.625 0 1 1 0 1.25h-5a.625.625 0 0 1-.625-.625"/><path fill="currentColor" d="M17.625 5.255A2.125 2.125 0 0 0 15.5 3.13h-11a2.125 2.125 0 0 0-2.125 2.125v7.5c0 1.173.951 2.125 2.125 2.125h1.188v2.482a.625.625 0 0 0 1.006.496l3.87-2.978H15.5a2.125 2.125 0 0 0 2.125-2.125zM15.5 4.38c.483 0 .875.392.875.875v7.5a.875.875 0 0 1-.875.875h-5.148a.63.63 0 0 0-.38.13l-3.034 2.333v-1.838a.625.625 0 0 0-.625-.625H4.5a.875.875 0 0 1-.875-.875v-7.5c0-.483.392-.875.875-.875z"/></svg>',
    size: '<svg viewBox="0 0 16 16"><path d="M2 4V2.8h7V4M5.5 2.8v10M9 8.2V7.2h5v1M11.5 7.2v5.6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    ls: '<svg viewBox="0 0 16 16"><path d="M2 2.5v11M14 2.5v11M5 11l3-7 3 7M6.1 8.6h3.8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lh: '<svg viewBox="0 0 16 16"><path d="M2 2.5h12M2 13.5h12M5.5 11l2.5-6 2.5 6M6.4 9h3.2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sp: '<svg viewBox="0 0 16 16"><path d="M3 2.5h10M3 5h7M3 11h10M3 13.5h7" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M13 6.3v3.4M11.8 7.4 13 6.2l1.2 1.2M11.8 8.6 13 9.8l1.2-1.2" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    para: '<svg viewBox="0 0 16 16"><path d="M2.5 3.5h11M2.5 6.5h11M2.5 9.5h11M2.5 12.5h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    al: '<svg viewBox="0 0 16 16"><path d="M2.5 3.5h11M2.5 6.5h7M2.5 9.5h11M2.5 12.5h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    ac: '<svg viewBox="0 0 16 16"><path d="M2.5 3.5h11M4.5 6.5h7M2.5 9.5h11M4.5 12.5h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    ar: '<svg viewBox="0 0 16 16"><path d="M2.5 3.5h11M6.5 6.5h7M2.5 9.5h11M6.5 12.5h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    aj: '<svg viewBox="0 0 16 16"><path d="M2.5 3.5h11M2.5 6.5h11M2.5 9.5h11M2.5 12.5h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    blk: '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="5.2" cy="6.4" r="1" fill="currentColor"/><path d="M7.5 6.4h4M5 9.6h6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    tpl: '<svg viewBox="0 0 16 16"><path d="M4 2.5h8a1 1 0 0 1 1 1v10l-5-2.8-5 2.8v-10a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    undo: '<svg viewBox="0 0 16 16"><path d="M5.5 3.5 2.5 6.5l3 3M2.8 6.5h6.7a3.5 3.5 0 0 1 0 7H7" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gear: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7 3.6 3.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    edit: '<svg viewBox="0 0 16 16"><path d="M10.5 2.8 13.2 5.5 6 12.7l-3.3.6.6-3.3z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 16 16"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    deco: '<svg viewBox="0 0 16 16"><path d="M4 12.5h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="1.2 1.6"/><path d="M5 10 8 3l3 7M6 7.8h4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="1.6" r=".8" fill="currentColor"/></svg>',
    pstyle: '<svg viewBox="0 0 16 16"><path d="M9.5 2.5v11M12 2.5v11M13.5 2.5H7.2a3 3 0 0 0 0 6h2.3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shapes: '<svg viewBox="0 0 16 16"><path d="M8 1.9l1.55 3.13 3.45.5-2.5 2.44.59 3.44L8 9.79l-3.09 1.62.59-3.44L3 5.53l3.45-.5z" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/><circle cx="12.6" cy="12.6" r="1" fill="currentColor"/><circle cx="3.2" cy="12.9" r=".7" fill="currentColor"/></svg>',
    brush: '<svg viewBox="0 0 16 16"><path d="M3 2.5h8.5v3H3zM11.5 4H13v3.5H7.8V9" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M7 9h1.6v4.2a.8.8 0 0 1-1.6 0z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    refresh: '<svg viewBox="0 0 16 16"><path d="M12.8 6.2A5 5 0 1 0 13 9.5M13 3v3.3H9.7" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    mt: '<svg viewBox="0 0 16 16"><path d="M2.5 2.5h11M4 9.5h8M4 12.5h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M8 7.5V4.5M6.8 5.7 8 4.5l1.2 1.2" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    mb: '<svg viewBox="0 0 16 16"><path d="M2.5 13.5h11M4 3.5h8M4 6.5h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M8 8.5v3M6.8 10.3 8 11.5l1.2-1.2" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ti: '<svg viewBox="0 0 16 16"><path d="M6.5 3.5h7M2.5 6.5h11M2.5 9.5h11M2.5 12.5h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M2.5 2v3l2-1.5z" fill="currentColor"/></svg>',
    il: '<svg viewBox="0 0 16 16"><path d="M6.5 3.5h7M6.5 6.5h7M6.5 9.5h7M6.5 12.5h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M2 6.2v3.6L4.6 8z" fill="currentColor"/></svg>',
    ir: '<svg viewBox="0 0 16 16"><path d="M2.5 3.5h7M2.5 6.5h7M2.5 9.5h7M2.5 12.5h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M14 6.2v3.6L11.4 8z" fill="currentColor"/></svg>'
  };
  const WEIGHT_NAME = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' };

  /* ---------- 色（Notion と同じ 9 色） ---------- */
  const TCOL = { gray: '#787774', brown: '#9F6B53', orange: '#D9730D', yellow: '#CB912F', green: '#448361', blue: '#337EA9', purple: '#9065B0', pink: '#C14C8A', red: '#D44C47' };
  const BCOL = { gray: '#F1F1EF', brown: '#F4EEEE', orange: '#FBECDD', yellow: '#FBF3DB', green: '#EDF3EC', blue: '#E7F3F8', purple: '#F6F3F9', pink: '#FAF1F5', red: '#FDEBEC' };
  const COLOR_JA = { gray: 'グレー', brown: '茶', orange: 'オレンジ', yellow: '黄', green: '緑', blue: '青', purple: '紫', pink: 'ピンク', red: '赤' };
  const BASE9 = Object.keys(TCOL);
  /* その位置に付いている Notion 本来の色（²⁶ の目印の色は除く） */
  function nativeColorAt() {
    const p = snap && snap.parts[0];
    const lf = p && partLeaf(p);
    if (!lf) return {};
    const u = unitAt(lf, p.s);
    let el = u ? (u.node.nodeType === 1 ? u.node : u.node.parentElement) : null;
    for (; el && el !== lf && lf.contains(el); el = el.parentElement) {
      const h = el.getAttribute('data-notion-highlight');
      let c = h || null;
      if (!c) { const m = /--ca?-(gra|bro|ora|yel|gre|blu|pur|pin|red)(Tex|Bac)/.exec(el.getAttribute('style') || ''); if (m) c = ABBR_REV[m[1]] + (m[2] === 'Bac' ? '_background' : ''); }
      if (!c) continue;
      if (SLOTS[c]) return {};
      return isBg(c) ? { hl: c.replace(/_background$/, '') } : { col: c };
    }
    return {};
  }
  /* 今の文字色・背景色（²⁶ の書式の中の色 → Notion 本来の色の順） */
  function colorNow() {
    const { st } = curSt();
    const n = nativeColorAt();
    return { col: st.col || n.col || '', hl: st.hl || n.hl || '' };
  }
  function rememberColor(kind, c) {
    const key = kind + ':' + (c || '');
    const a = (PREFS.recentColors || []).filter((x) => x !== key);
    a.unshift(key);
    PREFS.recentColors = a.slice(0, 5);
    savePrefs();
  }
  /* 文字色: ²⁶ の書式が付いた文字なら書式の中に（書体と両立）、付いていなければ Notion 本来の文字色（どの端末でも見える） */
  async function applyTextColor(c) {
    if (!snap || !snap.parts.length) return;
    rememberColor('t', c);
    const { color } = curSt();
    if ((color && SLOTS[color]) || (c && SLOTS[c])) { await applyStyle({ col: c || null }); return; }
    if (busy) return;
    await endSession();
    const step = await writeColor(snap.parts, c || null, false);
    if (step && step.length) pushUndo({ kind: 'api', step });
    SESSION = null;
    refreshPop(); ghost();
  }
  /* 背景色: 背景の 9 色は ²⁶ の目印なので、書式の中に持たせて描く（このブラウザで表示） */
  async function applyHighlight(c) {
    if (!snap || !snap.parts.length) return;
    rememberColor('b', c);
    await applyStyle({ hl: c || null });
  }

  /* ---------- Notion 本来の選択メニューを（隠したまま）使う ---------- */
  const UWIN = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  function mkEvent(Ctor, type, init) {
    try {
      const C = UWIN[Ctor] || window[Ctor];
      const i = typeof cloneInto === 'function' && UWIN !== window ? cloneInto(Object.assign({}, init, { view: UWIN }), UWIN) : Object.assign({}, init, { view: window });
      return new C(type, i);
    } catch (e) { return new window[Ctor](type, init); }
  }
  let PRESSING = 0;
  function press(el) {
    const r = el.getBoundingClientRect();
    const o = { bubbles: true, cancelable: true, composed: true, button: 0, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    const po = Object.assign({ pointerId: 1, pointerType: 'mouse', isPrimary: true }, o);
    PRESSING++;
    try {
      el.dispatchEvent(mkEvent('PointerEvent', 'pointerdown', Object.assign({ buttons: 1 }, po)));
      el.dispatchEvent(mkEvent('MouseEvent', 'mousedown', Object.assign({ buttons: 1 }, o)));
      el.dispatchEvent(mkEvent('PointerEvent', 'pointerup', Object.assign({ buttons: 0 }, po)));
      el.dispatchEvent(mkEvent('MouseEvent', 'mouseup', Object.assign({ buttons: 0 }, o)));
      el.dispatchEvent(mkEvent('MouseEvent', 'click', Object.assign({ buttons: 0 }, o)));
    } finally { PRESSING--; }
  }
  /* Notion の選択メニュー（太字・斜体のボタンを持つポップアップ） */
  function nativeBar() {
    const all = [...document.querySelectorAll('[style*="--c-popBac"]')].filter((e) => !e.closest('.c26-ui') && e.querySelector('svg.textBold') && e.querySelector('svg.textItalic'));
    return all[all.length - 1] || null;
  }
  const btnBy = (bar, sel) => { const s = bar.querySelector(sel); return s ? s.closest('[role="button"]') : null; };
  const NATIVE = {
    turn: { find: (b) => { const x = b.querySelector('.arrowChevronSingleRightSmall'); return x ? x.closest('[role="button"]') : null; }, dialog: true },
    bold: { find: (b) => btnBy(b, 'svg.textBold'), key: ['b'] },
    italic: { find: (b) => btnBy(b, 'svg.textItalic'), key: ['i'] },
    underline: { find: (b) => btnBy(b, 'svg.textUnderline'), key: ['u'] },
    strike: { find: (b) => btnBy(b, 'svg.textStrikethrough'), key: ['s', 1] },
    code: { find: (b) => btnBy(b, 'svg.code'), key: ['e'] },
    link: { find: (b) => btnBy(b, 'svg.link'), key: ['k'], dialog: true },
    equation: { find: (b) => btnBy(b, 'svg.squareRoot'), key: ['e', 1], dialog: true },
    clear: { find: (b) => b.querySelector('[aria-label="Clear format"]') },
    more: { find: (b) => b.querySelector('.notion-block-action-menu') },
    comment: { find: (b) => b.querySelector('[aria-label="Write a comment"]'), key: ['m', 1], dialog: true }
  };
  /* 本文の選択を、覚えておいた範囲に戻す（入力欄を触った後など） */
  function pointAt(leaf, off) {
    let n = 0;
    for (const u of modelUnits(leaf)) {
      if (off <= n + u.len) {
        if (u.atom) { const pa = u.node.parentNode; const i = [...pa.childNodes].indexOf(u.node); return { node: pa, off: i + (off > n ? 1 : 0) }; }
        return { node: u.node, off: off - n };
      }
      n += u.len;
    }
    return { node: leaf, off: leaf.childNodes.length };
  }
  function snapRange() {
    if (!snap || !snap.parts.length) return null;
    const a = snap.parts[0], b = snap.parts[snap.parts.length - 1];
    const la = partLeaf(a), lb = partLeaf(b);
    if (!la || !lb) return null;
    try {
      const pa = pointAt(la, a.s), pb = pointAt(lb, b.e);
      const r = document.createRange();
      r.setStart(pa.node, pa.off); r.setEnd(pb.node, pb.off);
      return r;
    } catch (e) { return null; }
  }
  function restoreSelection() {
    const r = snapRange();
    if (!r) return false;
    const sel = document.getSelection();
    const la = partLeaf(snap.parts[0]);
    if (sel && sel.rangeCount && !sel.isCollapsed && la && la.contains(sel.anchorNode)) return true;
    try { la.focus({ preventScroll: true }); } catch (e) { /* noop */ }
    sel.removeAllRanges(); sel.addRange(r);
    return true;
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function sendKey(k, shift) {
    const t = document.activeElement || document.body;
    const o = { key: k, code: 'Key' + k.toUpperCase(), bubbles: true, cancelable: true, composed: true, metaKey: /Mac/.test(navigator.platform), ctrlKey: !/Mac/.test(navigator.platform), shiftKey: !!shift };
    PRESSING++;
    try { t.dispatchEvent(mkEvent('KeyboardEvent', 'keydown', o)); t.dispatchEvent(mkEvent('KeyboardEvent', 'keyup', o)); } finally { PRESSING--; }
  }
  async function native(name) {
    const spec = NATIVE[name];
    if (!spec) return;
    restoreSelection();
    let bar = nativeBar();
    for (let i = 0; !bar && i < 8; i++) { await sleep(60); bar = nativeBar(); }
    const el = bar && spec.find(bar);
    if (spec.dialog) hidePop();
    if (el) press(el);
    else if (spec.key) sendKey(spec.key[0], spec.key[1]);
    else if (name === 'clear') { await clearStyle(); return; }
    else if (name === 'more') { openBlockMode(null); return; }
    else { toast('Notion のメニューが見つかりませんでした（文字を選び直してください）'); return; }
    if (!spec.dialog && name !== 'more') { ghost(); setTimeout(refreshPop, 160); }
  }

  function nativeState() {
    const bar = nativeBar();
    const out = {};
    if (!bar) return out;
    for (const k of ['bold', 'italic', 'underline', 'strike', 'code']) {
      const el = NATIVE[k].find(bar);
      if (el) out[k] = el.getAttribute('aria-pressed') === 'true';
    }
    const t = NATIVE.turn.find(bar);
    if (t) out.turn = (t.textContent || '').trim();
    return out;
  }
  /* Notion の選択メニューを隠す（本文・ページタイトルを選んでいる時だけ。ほかの所の選択メニューはそのまま） */
  function markSelection() {
    const de = document.documentElement;
    let on = false;
    if ((PREFS.mode || 'dock') !== 'off' && !de.classList.contains('c26-native')) {
      const sel = document.getSelection();
      if (sel && sel.rangeCount && !sel.isCollapsed) {
        const n = sel.anchorNode;
        const el = n ? (n.nodeType === 1 ? n : n.parentElement) : null;
        const lf = el && el.closest && el.closest(LEAF);
        on = !!(lf && (lf.closest(CONTENT) || lf.closest(TITLE)));
      }
      if (popOpen()) on = true;
    }
    if (on !== de.hasAttribute('data-c26-sel')) { if (on) de.setAttribute('data-c26-sel', '1'); else de.removeAttribute('data-c26-sel'); }
  }
  document.addEventListener('selectionchange', markSelection);

  /* ---------- 組み立て ---------- */
  let sub = null, subKind = '';
  function numHtml(k, ico, title) {
    return '<label class="m9-num" data-k="' + k + '" title="' + esc(title) + '"><span class="m9-nic" data-scrub="' + k + '">' + ico + '</span>' +
      '<input data-num="' + k + '" inputmode="decimal" spellcheck="false" autocomplete="off"><span class="m9-stp"><button data-stp="' + k + ':1" tabindex="-1">▴</button><button data-stp="' + k + ':-1" tabindex="-1">▾</button></span></label>';
  }
  function buildPop() {
    installUiCss(); installMenuCss();
    pop = document.createElement('div');
    pop.id = 'c26-menu';
    pop.className = 'c26-ui m9';
    pop.setAttribute('data-no-passthrough', '1');
    pop.hidden = true;
    pop.innerHTML =
      '<div class="m9-search"><input class="m9-q" placeholder="検索 · Search（太字・bold・12…）" spellcheck="false" autocomplete="off"></div>' +
      '<div class="m9-results" hidden></div>' +
      '<div class="m9-body m9-body-blk" hidden><div class="m9-bopts"></div><div class="m9-div"></div>' +
        '<button class="m9-row" data-sub="para"><span class="m9-ic">' + ICO.para + '</span><span class="m9-lab">段落</span><span class="m9-val m9-paraval"></span>' + ICO.chev + '</button>' +
        '<button class="m9-row" data-sub="pstyle"><span class="m9-ic">' + ICO.pstyle + '</span><span class="m9-lab">段落スタイル</span><span class="m9-val m9-psval"></span>' + ICO.chev + '</button>' +
        '<button class="m9-row m9-blkrow" data-sub="blk" hidden><span class="m9-ic">' + ICO.blk + '</span><span class="m9-lab m9-blkname">コールアウト</span>' + ICO.chev + '</button>' +
        '<div class="m9-div"></div><div class="m9-attools">' +
        '<button class="m9-tb m9-atb" data-a="atelier" title="Atelier — 見た目の全体（⌃⌥A）">' + ICO_AT.atelier + '<span>Atelier</span></button>' +
        '<button class="m9-tb" data-a="atpick" title="どこでも書式 — 画面の要素をクリックして書式">' + ICO_AT.pick + '</button>' +
        '<button class="m9-tb" data-a="attoc" title="目次">' + ICO_AT.toc + '</button>' +
        '<button class="m9-tb" data-a="atfocus" title="フォーカスモード">' + ICO_AT.focus + '</button>' +
        '<button class="m9-tb" data-a="atcount" title="文字数・読了時間">' + ICO_AT.count + '</button>' +
      '</div>' +
        '<div class="m9-meta"></div></div>' +
      '<div class="m9-body m9-body-text">' +
      '<button class="m9-row m9-turn" data-n="turn" title="ブロックの種類を変える（Notion）"><span class="m9-ic">' + ICO.turn + '</span><span class="m9-lab">Text</span>' + ICO.chev + '</button>' +
      '<div class="m9-div"></div>' +
      '<div class="m9-tools">' +
        '<button class="m9-tb m9-color" data-sub="color" title="文字色・背景色"><span class="m9-A">A</span></button>' +
        '<button class="m9-tb" data-n="bold" title="太字 ⌘B">' + ICO.bold + '</button>' +
        '<button class="m9-tb" data-n="italic" title="斜体 ⌘I">' + ICO.italic + '</button>' +
        '<button class="m9-tb" data-n="underline" title="下線 ⌘U">' + ICO.underline + '</button>' +
        '<button class="m9-tb" data-n="clear" title="書式をすべて消す">' + ICO.clear + '</button>' +
      '</div>' +
      '<div class="m9-tools">' +
        '<button class="m9-tb" data-n="link" title="リンク ⌘K">' + ICO.link + '</button>' +
        '<button class="m9-tb" data-n="strike" title="取り消し線 ⌘⇧S">' + ICO.strike + '</button>' +
        '<button class="m9-tb" data-n="code" title="コード ⌘E">' + ICO.code + '</button>' +
        '<button class="m9-tb" data-n="equation" title="数式 ⌘⇧E">' + ICO.eq + '</button>' +
        '<button class="m9-tb" data-n="more" title="ブロックのメニュー（複製・移動・削除・AI など）">' + ICO.more + '</button>' +
      '</div>' +
      '<div class="m9-div"></div>' +
      '<button class="m9-row" data-sub="font"><span class="m9-ic m9-aa">Aa</span><span class="m9-lab m9-fontname">書体</span>' + ICO.chev + '</button>' +
      '<div class="m9-row m9-sizerow" data-sub="size"><span class="m9-ic">' + ICO.size + '</span><span class="m9-lab">サイズ</span>' +
        '<span class="m9-mini"><input data-num="fs" inputmode="decimal" spellcheck="false" autocomplete="off" title="大きさ（px）— ↑↓ 1 ／ ⇧ 10 ／ ⌥ 0.1"></span>' + ICO.chev + '</div>' +
      '<button class="m9-row" data-sub="deco"><span class="m9-ic">' + ICO.deco + '</span><span class="m9-lab">文字の飾り</span><span class="m9-val m9-decoval"></span>' + ICO.chev + '</button>' +
      '<div class="m9-div"></div>' +
      '<button class="m9-row" data-sub="para"><span class="m9-ic">' + ICO.para + '</span><span class="m9-lab">段落</span><span class="m9-val m9-paraval"></span>' + ICO.chev + '</button>' +
      '<button class="m9-row" data-sub="pstyle"><span class="m9-ic">' + ICO.pstyle + '</span><span class="m9-lab">段落スタイル</span><span class="m9-val m9-psval"></span>' + ICO.chev + '</button>' +
      '<button class="m9-row m9-blkrow" data-sub="blk" hidden><span class="m9-ic">' + ICO.blk + '</span><span class="m9-lab m9-blkname">コールアウト</span>' + ICO.chev + '</button>' +
      '<button class="m9-row" data-sub="tpl"><span class="m9-ic">' + ICO.tpl + '</span><span class="m9-lab">文字テンプレート</span><span class="m9-val m9-tplval"></span>' + ICO.chev + '</button>' +
      '<div class="m9-div"></div><div class="m9-attools">' +
        '<button class="m9-tb m9-atb" data-a="atelier" title="Atelier — 見た目の全体（⌃⌥A）">' + ICO_AT.atelier + '<span>Atelier</span></button>' +
        '<button class="m9-tb" data-a="atpick" title="どこでも書式 — 画面の要素をクリックして書式">' + ICO_AT.pick + '</button>' +
        '<button class="m9-tb" data-a="attoc" title="目次">' + ICO_AT.toc + '</button>' +
        '<button class="m9-tb" data-a="atfocus" title="フォーカスモード">' + ICO_AT.focus + '</button>' +
        '<button class="m9-tb" data-a="atcount" title="文字数・読了時間">' + ICO_AT.count + '</button>' +
      '</div>' +
      '</div>' +
      '<div class="m9-div"></div>' +
      '<div class="m9-foot"><button class="m9-row m9-cmt" data-n="comment">' + '<span class="m9-ic">' + ICO.comment + '</span><span class="m9-lab">コメント</span></button>' +
        '<span class="m9-busy" hidden></span>' +
        '<button class="m9-tb sm" data-a="icons" title="アイコン（²⁹ Icon Library）">' + ICO.shapes + '</button>' +
        '<button class="m9-tb sm" data-a="paint" title="書式のコピー（押してから、貼り付けたい文字を選ぶ）">' + ICO.brush + '</button>' +
        '<button class="m9-tb sm" data-a="undo" title="元に戻す">' + ICO.undo + '</button>' +
        '<button class="m9-tb sm" data-a="settings" title="設定（⌃⌥S）">' + ICO.gear + '</button></div>';
    document.body.appendChild(pop);
    const qi = pop.querySelector('.m9-q');
    qi.addEventListener('input', () => { closeSub(); renderResults(); });
    sub = document.createElement('div');
    sub.id = 'c26-sub';
    sub.className = 'c26-ui m9 m9-sub';
    sub.setAttribute('data-no-passthrough', '1');
    sub.hidden = true;
    document.body.appendChild(sub);
    for (const el of [pop, sub]) isolate(el);
  }
  function isolate(el) {
    for (const ev of ['keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'paste', 'copy', 'cut', 'mouseup', 'mousedown', 'pointerdown', 'pointerup']) el.addEventListener(ev, (e) => e.stopPropagation());
  }

  /* ---------- 数値（直接入力・↑↓・⇧×10・⌥×0.1・アイコンを左右ドラッグ） ---------- */
  const NUM = {
    fs: { step: 1, min: 4, max: 400, get: () => curSt().st.fs || (computedAt() ? Math.round(parseFloat(computedAt().fontSize) * 10) / 10 : 16), set: (v) => applyStyle({ fs: Math.round(v * 10) / 10 }), fmt: (v) => String(v), isSet: () => !!curSt().st.fs },
    ls: { step: 1, min: -20, max: 100, get: () => { const st = curSt().st; return st.ls !== undefined ? Math.round(st.ls * 1000) / 10 : 0; }, set: (v) => applyStyle({ ls: Math.round(v * 10) / 1000 }), fmt: (v) => v + '%', isSet: () => curSt().st.ls !== undefined },
    lh: { step: 0.1, min: 0.8, max: 4, get: () => { const v = blockPropNow('lh'); if (v) return v; const c = leafCs(); const r = c ? parseFloat(c.lineHeight) / parseFloat(c.fontSize) : NaN; return isFinite(r) ? Math.round(r * 100) / 100 : 1.5; }, set: (v) => setBlockProp('lh', Math.round(v * 100) / 100), fmt: (v) => String(v), isSet: () => blockPropNow('lh') !== undefined },
    sp: { step: 1, min: 0, max: 120, get: () => (blockPropNow('sp') !== undefined ? blockPropNow('sp') : 2), set: (v) => setBlockProp('sp', Math.round(v * 10) / 10), fmt: (v) => v + 'px', isSet: () => blockPropNow('sp') !== undefined },
    pfs: { step: 1, min: 6, max: 160, get: () => { const v = blockPropNow('fs'); if (v !== undefined) return v; const c = leafCs(); return c ? Math.round(parseFloat(c.fontSize) * 10) / 10 : 16; }, set: (v) => setBlockProp('fs', Math.round(v * 10) / 10), fmt: (v) => v + 'px', isSet: () => blockPropNow('fs') !== undefined },
    pls: { step: 1, min: -20, max: 100, get: () => { const v = blockPropNow('ls'); return v !== undefined ? Math.round(v * 1000) / 10 : 0; }, set: (v) => setBlockProp('ls', v ? Math.round(v * 10) / 1000 : null), fmt: (v) => v + '%', isSet: () => blockPropNow('ls') !== undefined },
    mt: { step: 1, min: -40, max: 160, get: () => marginNow('mt'), set: (v) => setBlockProp('mt', Math.round(v * 10) / 10), fmt: (v) => v + 'px', isSet: () => blockPropNow('mt') !== undefined },
    mb: { step: 1, min: -40, max: 160, get: () => marginNow('mb'), set: (v) => setBlockProp('mb', Math.round(v * 10) / 10), fmt: (v) => v + 'px', isSet: () => blockPropNow('mb') !== undefined },
    ti: { step: 0.5, min: -4, max: 10, get: () => blockPropNow('ti') || 0, set: (v) => setBlockProp('ti', v ? Math.round(v * 100) / 100 : null), fmt: (v) => v + '字', isSet: () => blockPropNow('ti') !== undefined },
    il: { step: 0.5, min: 0, max: 20, get: () => blockPropNow('il') || 0, set: (v) => setBlockProp('il', v ? Math.round(v * 100) / 100 : null), fmt: (v) => v + '字', isSet: () => blockPropNow('il') !== undefined },
    ir: { step: 0.5, min: 0, max: 20, get: () => blockPropNow('ir') || 0, set: (v) => setBlockProp('ir', v ? Math.round(v * 100) / 100 : null), fmt: (v) => v + '字', isSet: () => blockPropNow('ir') !== undefined }
  };
  /* ---------- コールアウト・引用の設定（BSEL の範囲: これだけ／このページ／全ページ） ---------- */
  const CALLOUT_KEYS = ['cbg', 'cbgHex', 'cacc', 'cgc2', 'cgrad', 'cgi', 'cglass', 'csh', 'cbd', 'cbw', 'crad', 'cpad', 'cpx', 'cpy', 'cline', 'cls', 'cicon', 'ctile', 'ctpad', 'ctrad', 'cisz', 'cipx', 'cix', 'ciy', 'cgap', 'calign', 'chead', 'ctext'];
  const QUOTE_KEYS = ['qbar', 'qbarc', 'qbarcHex', 'qst', 'qx', 'qin', 'qcap', 'qpad', 'qpy', 'qbg', 'qrad', 'qmark', 'qcol', 'qit'];
  const CALLOUT_PRESETS = {
    std: {},
    head: { cbd: 'hair', crad: 12, cgrad: 'h', cgi: 16, ctile: 'tint', chead: true, cpad: 10, cpx: 14, cgap: 12, cipx: 20, ctpad: 5 },
    uline: { cbg: 'none', cbd: 'none', ctile: 'tint', chead: true, cline: 2, cls: 'full', cpad: 10, cpx: 4, cgap: 12, cipx: 20, ctpad: 5 },
    gbar: { cbd: 'gleft', cbw: 3, cgrad: 'h', cgi: 14, chead: true, cpad: 10, cpx: 16, cgap: 12, crad: 10 },
    grad: { cbd: 'none', cgrad: 'd', cgi: 24, crad: 14, ctile: 'glass', ctpad: 5, cpad: 14, cpx: 16, cgap: 12 },
    mesh: { cbd: 'hair', cgrad: 'mesh', cgi: 24, crad: 16, ctile: 'glass', ctpad: 5, cpad: 14, cpx: 16, cgap: 12 },
    gborder: { cbd: 'grad', cbw: 1.5, crad: 12, ctile: 'tint', cgap: 12, cpad: 12, cpx: 14 },
    glass: { cglass: true, cgrad: 'r', cgi: 16, crad: 14, ctile: 'glass', cpad: 12, cpx: 14, cgap: 12 },
    glow: { cbd: 'ring', csh: 'glow', crad: 12, ctile: 'grad', cipx: 18, ctpad: 6, cgap: 12, cpad: 12, cpx: 14 },
    pill: { cbd: 'none', crad: 99, chead: true, cpad: 6, cpx: 8, ctile: 'solid', ctrad: 99, cipx: 16, ctpad: 5, cgap: 10 },
    sticky: { cbg: 'yellow', cbd: 'none', csh: 'float', crad: 3, cpad: 16, cpx: 16, cgrad: 'v', cgi: 10 },
    card: { cbd: 'hair', csh: 'soft', crad: 12, ctile: 'tint', cpad: 14, cpx: 16, cgap: 12 },
    band: { cbg: 'none', cbd: 'left', cpad: 8, cpx: 14, chead: true, cgap: 12, cipx: 20 },
    ring: { cbg: 'none', cbd: 'ring', crad: 10, ctile: 'tint', cpad: 12, cpx: 14 },
    plain: { cbg: 'none', cbd: 'none', cpad: 4, cpx: 2, cgap: 10, cipx: 20 }
  };
  const CALLOUT_PRESETS_UI = [['std', '標準'], ['head', '見出し'], ['uline', '下線見出し'], ['gbar', 'グラデ左線'], ['grad', 'グラデ面'], ['mesh', 'メッシュ'], ['gborder', 'グラデ枠'], ['glass', 'すりガラス'], ['glow', '光彩'], ['pill', 'ピル'], ['sticky', '付箋'], ['card', 'カード'], ['band', '左線の帯'], ['ring', '色の枠'], ['plain', '飾りなし']];
  const CALLOUT_PRESET_TIP = {
    head: '見出し: 背景から右へ消えるグラデーション＋細い枠＋アイコンのタイル。1 行で縦の中央に',
    uline: '下線見出し: 背景なし。文字の下にアクセント → 2 色目の線',
    gbar: 'グラデ左線: 左に色が流れる線＋淡いグラデーション',
    grad: 'グラデ面: 斜めのグラデーション。2 色目を選ぶと 2 色に',
    mesh: 'メッシュ: 2 色が角からにじむ、Figma 風の面',
    gborder: 'グラデ枠: 枠だけ 2 色のグラデーション',
    glass: 'すりガラス: 半透明＋ぼかし＋光の差し込み',
    glow: '光彩: 色の付いた影でふわっと光る。アイコンはグラデのタイルで白抜き',
    pill: 'ピル: 丸い 1 行のラベル。アイコンは色の丸に白抜き',
    sticky: '付箋: 影で浮かせたメモ（背景は黄。好きな色に）',
    card: 'カード: 細い枠＋ふんわりした影'
  };
  const QUOTE_PRESETS = {
    std: {},
    soft: { qbar: 2, qst: 'soft', qcol: 'sec' },
    tint: { qbar: 3, qbg: 'tint', qpy: 6, qpad: 16 },
    mark: { qst: 'none', qmark: true, qcol: 'sec', qpad: 36 },
    grad: { qbar: 3, qst: 'grad', qpad: 16 },
    card: { qst: 'none', qbg: 'gray', qrad: 10, qpy: 10, qpad: 18, qmark: true },
    round: { qbar: 3, qin: 3, qcap: true, qpad: 16 },
    gbar: { qbar: 4, qst: 'grad', qin: 2, qcap: true, qpad: 16, qbg: 'grad', qpy: 4 },
    note: { qbar: 2, qst: 'soft', qx: 14, qin: 4, qcap: true, qcol: 'sec', qit: true }
  };
  const QUOTE_PRESETS_UI = [['std', '標準'], ['soft', '細く淡く'], ['tint', '線＋背景'], ['mark', '引用符'], ['grad', 'ぼかし線'], ['card', 'カード'], ['round', '丸い線'], ['gbar', 'グラデ帯'], ['note', '余白メモ']];
  const BTAB = { callout: 'style', quote: 'style' };
  function blkGet(k) { const tt = blockTarget(false); return tt && tt.target ? tt.target[k] : undefined; }
  function blkWrite(fn) {
    const tt = blockTarget(true);
    if (!tt || !tt.target) return;
    fn(tt.target);
    clean(tt.target);
    if (tt.scope === 'only') tt.target.__type = tt.c.type;
    changed(); autoSave(); refreshPop();
  }
  function blkSet(k, v) { blkWrite((t) => { if (v === null || v === undefined || v === '') delete t[k]; else t[k] = v; }); }
  function blkPreset(type, key) {
    const P = (type === 'callout' ? CALLOUT_PRESETS : QUOTE_PRESETS)[key];
    if (!P) return;
    blkWrite((t) => { for (const k of type === 'callout' ? CALLOUT_KEYS : QUOTE_KEYS) delete t[k]; Object.assign(t, clone(P)); });
  }
  const BNUM = { crad: [1, 0, 99, 'px', 10], cpad: [1, 0, 60, 'px', 12], cpx: [1, 0, 60, 'px', 12], cpy: [1, 0, 80, 'px', 8], cline: [0.5, 0, 6, 'px', 0], cgi: [1, 0, 60, '%', 16], cbw: [0.5, 0.5, 8, 'px', 1],
    cipx: [1, 10, 96, 'px', 24], ctpad: [0.5, 0, 20, 'px', 5], ctrad: [1, 0, 99, 'px', 8], cix: [0.5, -40, 80, 'px', 0], ciy: [0.5, -40, 40, 'px', 0], cgap: [1, -8, 80, 'px', 8],
    qbar: [0.5, 0, 12, 'px', 3], qx: [1, -40, 120, 'px', 0], qin: [0.5, 0, 40, 'px', 0], qpad: [1, 0, 80, 'px', 14], qpy: [1, 0, 60, 'px', 0], qrad: [1, 0, 30, 'px', 0] };
  /* 書体の一覧: 文字（²⁶ の書式）か段落全体か */
  const fontNow = (kind) => (kind === 'pfont' ? blockPropNow('ff') || '' : curSt().st.ff || '');
  function setFont(v) { if (subKind === 'pfont') setBlockProp('ff', v || null); else applyStyle({ ff: v || null }); }
  /* 段落の文字欄の、画面上の実際の値 */
  function leafCs() {
    const t = blockTargets()[0];
    const lf = t && t.el && t.el.isConnected ? (t.type === 'title' ? t.el.querySelector(LEAF) || t.el : leavesOfBlock(t.el)[0]) : null;
    return lf ? getComputedStyle(lf) : null;
  }
  /* 今の段落の前・後の余白（設定 → 段落の間隔の半分 → 画面の実際の値） */
  function marginNow(k) {
    const v = blockPropNow(k);
    if (v !== undefined) return v;
    const sp = blockPropNow('sp');
    if (sp !== undefined) return Number(sp) / 2;
    const t = blockTargets()[0];
    if (!t || !t.el || !t.el.isConnected) return 0;
    return Math.round(parseFloat(getComputedStyle(t.el)[k === 'mt' ? 'marginTop' : 'marginBottom']) * 10) / 10 || 0;
  }
  for (const [k, [step, min, max, unit, def]] of Object.entries(BNUM)) {
    NUM[k] = { step, min, max, get: () => { const v = blkGet(k); return v !== undefined ? Number(v) : def; }, set: (v) => blkSet(k, Math.round(v * 100) / 100), fmt: (v) => v + unit, isSet: () => blkGet(k) !== undefined };
  }
  /* アイコンの大きさは px。v12 の %（cisz）が残っていれば読み替えて、書き込む時に px へ移す */
  NUM.cipx.get = () => { const v = blkGet('cipx'); if (v !== undefined) return Number(v); const p = blkGet('cisz'); return p !== undefined ? Math.round(24 * Number(p) / 100) : 24; };
  NUM.cipx.set = (v) => blkWrite((t) => { delete t.cisz; t.cipx = Math.round(v * 100) / 100; });
  NUM.cipx.isSet = () => blkGet('cipx') !== undefined || blkGet('cisz') !== undefined;
  function commitNum(k, raw) {
    const n = NUM[k];
    const v = parseFloat(String(raw).replace(/[^\d.\-]/g, ''));
    if (!isFinite(v)) { refreshPop(); return; }
    n.set(Math.max(n.min, Math.min(n.max, v)));
  }
  function stepNum(k, mult) {
    const n = NUM[k];
    const cur = Number(n.get()) || 0;
    n.set(Math.max(n.min, Math.min(n.max, Math.round((cur + n.step * mult) * 1000) / 1000)));
  }
  function onNumKey(e) {
    const inp = e.target.closest && e.target.closest('input[data-num]');
    if (!inp) return false;
    const k = inp.dataset.num;
    if (e.key === 'Enter') { e.preventDefault(); delete inp.dataset.typing; commitNum(k, inp.value); inp.blur(); return true; }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      delete inp.dataset.typing;
      stepNum(k, (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : e.altKey ? 0.1 : 1));
      setTimeout(() => { if (document.activeElement === inp) { inp.value = NUM[k].fmt(NUM[k].get()); inp.select(); } }, 0);
      return true;
    }
    if (e.key === 'Escape') { e.preventDefault(); delete inp.dataset.typing; inp.blur(); refreshPop(); return true; }
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') inp.dataset.typing = '1';
    return false;
  }
  let scrub = null;
  window.addEventListener('pointerdown', (e) => {
    const ic = e.target.closest && e.target.closest('.m9 [data-scrub]');
    if (!ic || e.button !== 0) return;
    e.preventDefault();
    const k = ic.dataset.scrub;
    scrub = { k, x: e.clientX, base: Number(NUM[k].get()) || 0, last: null, el: ic };
    try { ic.setPointerCapture(e.pointerId); } catch (er) { /* noop */ }
    document.documentElement.classList.add('c26-scrubbing');
  }, true);
  window.addEventListener('pointermove', (e) => {
    if (!scrub) return;
    const n = NUM[scrub.k];
    const d = Math.round((e.clientX - scrub.x) / 4) * (e.altKey ? 0.1 : e.shiftKey ? 10 : 1);
    const v = Math.max(n.min, Math.min(n.max, Math.round((scrub.base + d * n.step) * 100) / 100));
    if (v !== scrub.last) { scrub.last = v; n.set(v); }
  }, true);
  const endScrub = () => { if (scrub) { scrub = null; document.documentElement.classList.remove('c26-scrubbing'); refreshPop(); } };
  window.addEventListener('pointerup', endScrub, true);
  window.addEventListener('pointercancel', endScrub, true);

  /* ---------- 置き場所: 選んだ文字のすぐ上（入らなければ下）。横のパネルはメニューの右（入らなければ左） ---------- */
  function placePop() {
    if (!pop || pop.hidden) return;
    const w = pop.offsetWidth || 232, h = pop.offsetHeight || 360;
    let rect = null;
    const r = snapRange();
    if (r) rect = r.getBoundingClientRect();
    if ((!rect || (!rect.width && !rect.height)) && snap && snap.leaf && snap.leaf.isConnected) rect = snap.leaf.getBoundingClientRect();
    let x, y, side = '';
    /* 本文の列の外（左右の空いている広い方）に出す。サイドピークなら、ピークの本文の左（元のページの上）へ */
    const col = textColumnRect();
    if (col && rect && (rect.width || rect.height)) {
      const leftRoom = col.left - 8, rightRoom = innerWidth - col.right - 8;
      const need = w + 18;
      if (rightRoom >= need && rightRoom >= leftRoom) { x = col.right + 14; side = 'right'; }
      else if (leftRoom >= need) { x = col.left - 14 - w; side = 'left'; }
      if (side) y = Math.max(8, Math.min(rect.top - 10, innerHeight - h - 8));
    }
    if (!side) {
      if (rect && (rect.width || rect.height)) {
        x = rect.left;
        y = rect.top - h - 8;
        if (y < 8) y = rect.bottom + 8;
        if (y + h > innerHeight - 8) y = Math.max(8, innerHeight - h - 8);
      } else { x = innerWidth - w - 24; y = innerHeight - h - 72; }
    }
    pop.dataset.side = side;
    x = Math.max(8, Math.min(x, innerWidth - w - 8));
    pop.style.left = Math.round(x) + 'px';
    pop.style.top = Math.round(y) + 'px';
    placeSub();
  }
  /* 対象の本文の列（ページの中身の幅） */
  function textColumnRect() {
    const el = snap ? (snap.leaf || (snap.blockEls && snap.blockEls[0])) : null;
    if (!el || !el.isConnected) return null;
    let col = el.closest(CONTENT);
    if (!col) { const lay = layoutOf(el); col = lay && lay.querySelector(CONTENT); }
    if (!col) return null;
    const r = col.getBoundingClientRect();
    /* 中身の文字がある範囲（左右の余白を除く） */
    const lf = el.closest('[data-block-id]') || el;
    const lr = lf.getBoundingClientRect();
    return { left: Math.max(r.left, Math.min(lr.left, r.left + 200)), right: Math.min(r.right, Math.max(lr.right, r.right - 200)), top: r.top, bottom: r.bottom };
  }
  function placeSub() {
    if (!sub || sub.hidden || !pop || pop.hidden) return;
    const pr = pop.getBoundingClientRect();
    const sw = sub.offsetWidth, sh = sub.offsetHeight;
    const row = [...pop.querySelectorAll('[data-sub="' + subKind + '"]')].find((r) => r.offsetParent);
    const rr = row ? row.getBoundingClientRect() : pr;
    /* 本文から離れる側へ（メニューが本文の左なら、さらに左） */
    const side = pop.dataset.side;
    const col = side ? textColumnRect() : null;
    let x = side === 'left' ? pr.left - sw - 6 : pr.right + 6;
    if (side === 'left' && x < 8) x = col ? Math.max(8, col.left - 14 - sw) : pr.right + 6;   // 本文にかからないよう、メニューの上に重ねる
    else if (side === 'right' && x + sw > innerWidth - 8) x = col ? Math.min(innerWidth - sw - 8, Math.max(col.right + 14, innerWidth - sw - 8)) : pr.left - sw - 6;
    else if (!side && x + sw > innerWidth - 8) x = pr.left - sw - 6;
    sub.classList.toggle('m9-over', side && x < pr.right && x + sw > pr.left);
    if (x < 8) x = Math.max(8, Math.min(pr.left, innerWidth - sw - 8));
    let y = rr.top - 8;
    y = Math.max(8, Math.min(y, innerHeight - sh - 8));
    sub.style.left = Math.round(x) + 'px';
    sub.style.top = Math.round(y) + 'px';
  }
  window.addEventListener('resize', () => placePop());
  document.addEventListener('scroll', () => { if (popOpen()) placePop(); }, true);

  /* ---------- 表示を今の状態に合わせる ---------- */
  const setAll = (sel, t) => { for (const el of pop.querySelectorAll(sel)) el.textContent = t; };
  function refreshPop() {
    if (!pop || pop.hidden) return;
    const has = !!(snap && snap.parts.length);
    pop.classList.toggle('m9-nochar', !has);
    const { color, st } = snap ? curSt() : { color: null, st: {} };
    const cs = has ? computedAt() : null;
    const ns = has ? nativeState() : {};
    /* ブロックの種類 */
    const chain0 = snap ? blockChain(snap.leaf)[0] : null;
    pop.querySelector('.m9-turn .m9-lab').textContent = ns.turn || (chain0 && chain0.type !== 'text' ? TYPE_LABEL[chain0.type] || 'テキスト' : 'テキスト');
    /* 文字色 */
    const cn = has ? colorNow() : { col: '', hl: '' };
    const A = pop.querySelector('.m9-A');
    A.style.color = cn.col ? tVar(cn.col) : '';
    A.style.background = cn.hl ? bVar(cn.hl) : '';
    for (const k of ['bold', 'italic', 'underline', 'strike', 'code']) { const b = pop.querySelector('[data-n="' + k + '"]'); if (b) b.setAttribute('aria-pressed', String(!!ns[k])); }
    /* 書体 */
    const f = fontOf(st.ff);
    const fn = pop.querySelector('.m9-fontname');
    fn.textContent = f ? fontShort(f) : (cs ? cs.fontFamily.split(',')[0].replace(/["']/g, '').trim() : '書体');
    fn.classList.toggle('set', !!f);
    pop.querySelector('.m9-aa').style.fontFamily = f ? f.css : '';
    /* 数値 */
    for (const root of [pop, sub]) {
      if (!root || root.hidden) continue;
      for (const inp of root.querySelectorAll('input[data-num]')) {
        if (document.activeElement === inp && inp.dataset.typing) continue;
        const k = inp.dataset.num;
        const keep = document.activeElement === inp;
        inp.value = snap ? NUM[k].fmt(NUM[k].get()) : '';
        const host = inp.closest('.m9-num, .m9-mini');
        if (host) host.classList.toggle('set', !!(snap && NUM[k].isSet()));
        if (keep) inp.select();
      }
    }
    /* 段落 */
    const ta = snap ? blockPropNow('ta') : undefined;
    const lh = snap ? blockPropNow('lh') : undefined;
    const pff = snap ? fontOf(blockPropNow('ff')) : null, pfsz = snap ? blockPropNow('fs') : undefined;
    setAll('.m9-paraval', [pff ? fontShort(pff) : '', pfsz ? pfsz + 'px' : '', { left: '左', center: '中央', right: '右', justify: '両端' }[ta], lh ? lh + '行' : ''].filter(Boolean).join('・'));
    /* コールアウト・引用 */
    const chain = snap ? blockChain(snap.leaf).filter((x) => x.type === 'callout' || x.type === 'quote') : [];
    for (const br of pop.querySelectorAll('.m9-blkrow')) br.hidden = !chain.length;
    if (chain.length) setAll('.m9-blkname', TYPE_LABEL[chain[0].type]);
    /* 文字の飾り・段落スタイル */
    pop.querySelector('.m9-decoval').textContent = snap ? [st.em ? '傍点' : '', st.ud ? '下線' : '', st.va ? (st.va === 'super' ? '上付き' : '下付き') : '', st.sc ? 'Caps' : ''].filter(Boolean).join('・') : '';
    const pst = snap ? styleTarget() : null;
    const psid = pst && DB.passign[pst.id];
    setAll('.m9-psval', psid && DB.pstyles[psid] ? DB.pstyles[psid].name : '');
    pop.querySelector('[data-a="paint"]').setAttribute('aria-pressed', String(!!PAINT));
    /* テンプレート */
    pop.querySelector('.m9-tplval').textContent = color && SLOTS[color] && SLOTS[color].tpl ? SLOTS[color].name : '';
    /* 状態 */
    const bz = pop.querySelector('.m9-busy');
    bz.hidden = !busy; bz.textContent = busy ? '反映中…' : '';
    pop.querySelector('[data-a="undo"]').disabled = !HIST.length;
    for (const r of pop.querySelectorAll('[data-sub]')) r.classList.toggle('open', !sub.hidden && r.dataset.sub === subKind);
    if (!sub.hidden) refreshSub();
  }

  /* ---------- 横のパネル ---------- */
  function openSub(kind) {
    if (!pop) return;
    if (!kind || (subKind === kind && !sub.hidden)) { closeSub(); return; }
    subKind = kind;
    menuKind = kind === 'font' || kind === 'pfont' ? 'font' : '';
    sub.className = 'c26-ui m9 m9-sub m9-sub-' + (kind === 'pfont' ? 'font' : kind);
    sub.dataset.key = '';
    sub.innerHTML = renderSub(kind);
    sub.hidden = false;
    afterSub(kind);
    placeSub();
    refreshPop();
  }
  function closeSub() {
    if (!sub) return;
    sub.hidden = true; sub.innerHTML = ''; subKind = ''; menuKind = '';
    TPL_NAMING = false; PS_NAMING = false; PS_NAME = '';
    if (pop) for (const r of pop.querySelectorAll('[data-sub]')) r.classList.remove('open');
  }
  const sw = (kind, c, on, title) => {
    const t = kind === 't';
    const style = t ? (c ? 'color:' + tVar(c) + ';--sw-b:' + tVar(c) : '') : (c ? 'background:' + bVar(c) + ';--sw-b:' + tVar(c) : '');
    return '<button class="m9-sw ' + (t ? 'm9-sw-t' : 'm9-sw-b') + (c ? '' : ' m9-sw-def') + (on ? ' on' : '') + '" data-col="' + kind + ':' + (c || '') + '" title="' + esc(title) + '" style="' + style + '">' + (t ? 'A' : '') + '</button>';
  };
  function renderSub(kind) {
    let { st } = curSt();
    const has = !!(snap && snap.parts.length);
    if (kind === 'color') {
      const cn = has ? colorNow() : { col: '', hl: '' };
      let h = '';
      const rec = (PREFS.recentColors || []).filter((x) => /^[tb]:/.test(x));
      if (rec.length) {
        h += '<div class="m9-h">最近使った色</div><div class="m9-grid">';
        for (const x of rec) { const [k, c] = x.split(':'); h += sw(k, c, false, (k === 't' ? '文字色: ' : '背景色: ') + (COLOR_JA[c] || '標準')); }
        h += '</div>';
      }
      h += '<div class="m9-h">文字色</div><div class="m9-grid">' + sw('t', '', !cn.col, '標準の文字色');
      for (const c of BASE9) h += sw('t', c, cn.col === c, COLOR_JA[c]);
      h += '</div><div class="m9-h">背景色</div><div class="m9-grid">' + sw('b', '', !cn.hl, '背景なし');
      for (const c of BASE9) h += sw('b', c, cn.hl === c, COLOR_JA[c] + 'の背景');
      const hlm = (curSt().st || {}).hlm || '';
      h += '</div><div class="m9-h">背景の形</div><div class="m9-seg"><button data-hlm="" aria-pressed="' + (!hlm) + '">塗り</button><button data-hlm="marker" aria-pressed="' + (hlm === 'marker') + '"><span style="background:linear-gradient(transparent 58%, color-mix(in srgb, ' + tVar('yellow') + ' 35%, transparent) 58%)">マーカー</span></button></div><div class="m9-note">文字色は Notion 本来の色（どの端末でも見える）。書体などを変えた文字の色と背景色は、このブラウザで表示します。</div>';
      return h;
    }
    if (kind === 'font' || kind === 'pfont') {
      const av = detectFonts();
      const cur = fontNow(kind);
      st = Object.assign({}, st, { ff: cur });
      let h = kind === 'pfont' ? '<button class="m9-row m9-back" data-sub="para"><span class="m9-ic">‹</span><span class="m9-lab">段落の書体（段落全体）</span></button>' : '';
      h += '<div class="c26-pv"><div class="c26-pv-t"></div><div class="c26-pv-m"><span class="c26-pv-n"></span><span class="c26-pv-b"></span></div></div>';
      h += '<div class="m9-q"><input class="c26-m-q" placeholder="書体を探す（明朝・Garamond・宋…）" spellcheck="false"></div>';
      h += '<div class="c26-m-list"><div class="c26-m-item' + (st.ff ? '' : ' on') + '" data-v=""><span class="n">元の書体に戻す</span></div>';
      for (const grp of CATALOG) {
        const items = FONT_LIST.filter((f) => f.group === grp.g && (PREFS.showMissing || av.get(f.id) || f.id === st.ff));
        if (!items.length) continue;
        h += '<div class="c26-m-g">' + esc(grp.g) + '</div>';
        for (const f of items) {
          const miss = !av.get(f.id);
          const badge = miss ? '<em class="c26-bd miss">未導入</em>' : (f.s === 'la' && !f.ja ? '<em class="c26-bd">欧文</em>' : '');
          h += '<div class="c26-m-item' + (f.id === st.ff ? ' on' : '') + (miss ? ' miss' : '') + '" data-v="' + esc(f.id) + '" data-q="' + esc((f.name + ' ' + (f.fams || []).join(' ') + ' ' + grp.g).toLowerCase()) + '"><span class="n" style="font-family:' + esc(f.css) + '">' + esc(f.name) + '</span>' + badge + '</div>';
        }
      }
      h += '</div><label class="m9-chk"><input type="checkbox" class="c26-m-miss"' + (PREFS.showMissing ? ' checked' : '') + '> 使えない書体も出す</label>';
      return h;
    }
    if (kind === 'size') {
      const fs = Number(NUM.fs.get());
      const fw = st.fw || 0;
      const ff = fontCss(st.ff);
      let h = '<div class="m9-h">大きさ</div><div class="m9-line">' + numHtml('fs', ICO.size, '大きさ（px）— ↑↓ 1 ／ ⇧ 10 ／ ⌥ 0.1') + '<button class="m9-link" data-a="fsreset">元に戻す</button></div>';
      h += '<div class="m9-chips">';
      for (const v of [10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 40, 48, 64]) h += '<button class="m9-chip' + (st.fs === v ? ' on' : '') + '" data-fs="' + v + '">' + v + '</button>';
      h += '</div><div class="m9-h">太さ</div><div class="m9-wts"><button class="m9-wt' + (fw ? '' : ' on') + '" data-fw=""><b>Aa</b><span>元のまま</span></button>';
      for (const [w] of WEIGHTS) h += '<button class="m9-wt' + (fw === w ? ' on' : '') + '" data-fw="' + w + '"><b style="font-weight:' + w + (ff ? ';font-family:' + esc(ff) : '') + '">Aa</b><span>' + (WEIGHT_NAME[w] || w) + '</span></button>';
      h += '</div><div class="m9-h">字間</div><div class="m9-line">' + numHtml('ls', ICO.ls, '字間（%）— ↑↓ 1 ／ ⇧ 10 ／ ⌥ 0.1') + '</div><div class="m9-chips">';
      for (const v of [-2, 0, 2, 4, 6, 8, 10, 15]) h += '<button class="m9-chip' + (st.ls !== undefined && Math.round(st.ls * 1000) / 10 === v ? ' on' : '') + '" data-ls="' + v + '">' + v + '%</button>';
      h += '</div><button class="m9-row m9-danger" data-a="clearst"><span class="m9-ic">' + ICO.clear + '</span><span class="m9-lab">書体・大きさ・字間を消す</span></button>';
      void fs;
      return h;
    }
    if (kind === 'para') {
      const bp = blockPropNow;
      const ta = bp('ta');
      const sc = (k, l) => '<button data-sc="' + k + '" aria-pressed="' + (LSC.scope === k) + '">' + l + '</button>';
      const al = (k, ic, l) => '<button data-al="' + k + '" aria-pressed="' + (ta === k) + '" title="' + l + '">' + ic + '</button>';
      let h = '';
      const boxc = snap ? blockChain(snap.leaf).find((x) => x.type === 'callout' || x.type === 'quote') : null;
      if (boxc) h += '<button class="m9-row m9-jump" data-sub="blk"><span class="m9-ic">' + ICO.blk + '</span><span class="m9-lab">' + esc(TYPE_LABEL[boxc.type]) + '全体の見た目（形・背景・枠・アイコン）</span>' + ICO.chev + '</button>';
      h += '<div class="m9-h">対象</div><div class="m9-seg">' + sc('only', 'この段落') + sc('page', 'このページ') + sc('global', '全ページ') + '</div>';
      const pf = fontOf(bp('ff'));
      h += '<div class="m9-h">段落の文字<span class="m9-hint">段落全体の書体・大きさ（文字ごとに変えた所はそちらが優先）</span></div>';
      h += '<button class="m9-row m9-pfont" data-sub="pfont"><span class="m9-ic m9-aa"' + (pf ? ' style="font-family:' + esc(pf.css) + '"' : '') + '>Aa</span><span class="m9-lab' + (pf ? ' set' : '') + '">' + esc(pf ? fontShort(pf) : '書体（Notion 標準）') + '</span>' + ICO.chev + '</button>';
      h += '<div class="m9-g2">' + numHtml('pfs', ICO.size, '段落の文字の大きさ（px）— ↑↓ 1 ／ ⇧ 10 ／ ⌥ 0.1') + numHtml('pls', ICO.ls, '段落の字間（%）— ↑↓ 1 ／ ⇧ 10 ／ ⌥ 0.1') + '</div>';
      h += '<div class="m9-chips m9-chips-sp"><span class="m9-cl">大きさ</span>';
      for (const v of [12, 14, 15, 16, 18]) h += '<button class="m9-chip' + (bp('fs') === v ? ' on' : '') + '" data-pfs="' + v + '">' + v + '</button>';
      h += '</div><div class="m9-chips m9-chips-sp"><span class="m9-cl">太さ</span>';
      for (const [v, l] of [['', '標準'], [300, '細'], [500, '中'], [600, 'やや太'], [700, '太']]) h += '<button class="m9-chip' + ((bp('fw') || '') === v ? ' on' : '') + '" data-pfw="' + v + '" style="font-weight:' + (v || 400) + '">' + l + '</button>';
      h += '</div>';
      h += '<div class="m9-h">揃え</div><div class="m9-seg m9-seg-ic">' + al('left', ICO.al, '左揃え') + al('center', ICO.ac, '中央揃え') + al('right', ICO.ar, '右揃え') + al('justify', ICO.aj, '両端揃え（日本語は字間、英語は単語間＋ハイフネーション）') + '</div>';
      h += '<div class="m9-h">行の高さ</div><div class="m9-line">' + numHtml('lh', ICO.lh, '行高（倍）— ↑↓ 0.1 ／ ⇧ 1 ／ ⌥ 0.01') + '</div><div class="m9-chips">';
      for (const v of [1, 1.2, 1.5, 1.75, 2]) h += '<button class="m9-chip' + (bp('lh') === v ? ' on' : '') + '" data-lh="' + v + '">' + v + '</button>';
      h += '</div><div class="m9-h">段落の前と後<span class="m9-hint">前 = 上の段落との間 ／ 後 = 次の段落との間</span></div>';
      h += '<div class="m9-g2">' + numHtml('mt', ICO.mt, '段落の前（px）— ↑↓ 1 ／ ⇧ 10 ／ ⌥ 0.1') + numHtml('mb', ICO.mb, '段落の後（px）— ↑↓ 1 ／ ⇧ 10 ／ ⌥ 0.1') + '</div>';
      h += '<div class="m9-chips m9-chips-sp"><span class="m9-cl">後</span>';
      for (const v of [0, 4, 8, 16, 24]) h += '<button class="m9-chip' + (bp('mb') === v ? ' on' : '') + '" data-mb="' + v + '">' + v + '</button>';
      h += '</div>';
      h += '<div class="m9-h">インデント<span class="m9-hint">1 字 = 本文の文字 1 つ分</span></div><div class="m9-g3">' +
        numHtml('ti', ICO.ti, '字下げ（1 行目だけ・字）') + numHtml('il', ICO.il, '左のインデント（字）') + numHtml('ir', ICO.ir, '右のインデント（字）') + '</div>';
      h += '<div class="m9-chips m9-chips-sp"><span class="m9-cl">字下げ</span>';
      for (const v of [0, 1, 2]) h += '<button class="m9-chip' + ((bp('ti') || 0) === v ? ' on' : '') + '" data-ti="' + v + '">' + v + '字</button>';
      h += '<button class="m9-chip' + (bp('ti') === -1 ? ' on' : '') + '" data-ti="-1" title="ぶら下げ（2 行目以降を下げる時は左のインデントと組み合わせ）">-1字</button></div>';
      const dk = bp('dk') || '';
      const dks = [['', 'なし'], ['bar', '左線'], ['fill', '背景'], ['barfill', '線＋背景'], ['under', '下線'], ['box', '枠'], ['grad', 'ぼかし']];
      h += '<div class="m9-h">段落の飾り</div><div class="m9-dks">';
      for (const [k, l] of dks) h += '<button class="m9-dk m9-dk-' + (k || 'none') + (dk === k ? ' on' : '') + '" data-dk="' + k + '"><i></i><span>' + l + '</span></button>';
      h += '</div><div class="m9-dots' + (dk ? '' : ' off') + '">';
      const dc0 = bp('dcol') || '';
      h += '<button class="m9-dot m9-dot-def' + (dc0 ? '' : ' on') + '" data-dcol="" title="標準（グレー）"></button>';
      for (const c of BASE9) h += '<button class="m9-dot' + (dc0 === c ? ' on' : '') + '" data-dcol="' + c + '" title="' + COLOR_JA[c] + '" style="--dot:' + tVar(c) + '"></button>';
      h += '</div>';
      const rule = bp('rule') || '';
      h += '<div class="m9-h">罫線<span class="m9-hint">ノートのように、行の高さに合わせて敷く</span></div><div class="m9-rl">';
      for (const [k, l] of [['', 'なし'], ['line', '罫線'], ['dot', 'ドット'], ['grid', '方眼']]) h += '<button class="m9-rl-' + (k || 'none') + (rule === k ? ' on' : '') + '" data-rule="' + k + '"><i></i><span>' + l + '</span></button>';
      h += '</div><div class="m9-dots' + (rule ? '' : ' off') + '">';
      const rc0 = bp('rulec') || '';
      h += '<button class="m9-dot m9-dot-def' + (rc0 ? '' : ' on') + '" data-rulec="" title="標準（文字の色を薄く）"></button>';
      for (const c of BASE9) h += '<button class="m9-dot' + (rc0 === c ? ' on' : '') + '" data-rulec="' + c + '" title="' + COLOR_JA[c] + '" style="--dot:' + tVar(c) + '"></button>';
      h += '</div>';
      const dc = Number(bp('dc') || 0);
      h += '<div class="m9-h">組版</div><div class="m9-seg">' +
        '<button data-dc="0" aria-pressed="' + (!dc) + '">頭文字 なし</button><button data-dc="2" aria-pressed="' + (dc === 2) + '">2 行</button><button data-dc="3" aria-pressed="' + (dc === 3) + '">3 行</button></div>';
      h += '<label class="m9-chk"><input type="checkbox" data-palt="1"' + (bp('palt') ? ' checked' : '') + '> 約物を詰める（、。「」の余白）</label>';
      h += '<label class="m9-chk"><input type="checkbox" data-hy="1"' + (bp('hy') ? ' checked' : '') + '> 英語はハイフネーション</label>';
      h += '<button class="m9-row m9-danger" data-a="parareset"><span class="m9-ic">' + ICO.clear + '</span><span class="m9-lab">段落の設定を消す</span></button>';
      return h;
    }
    if (kind === 'deco') {
      const { st } = curSt();
      const seg = (attr, cur, items) => '<div class="m9-seg m9-seg-g">' + items.map(([v, lab, sty, tt]) => '<button data-' + attr + '="' + v + '" aria-pressed="' + ((cur || '') === v) + '" title="' + esc(tt || '') + '"><span style="' + (sty || '') + '">' + lab + '</span></button>').join('') + '</div>';
      let h = '<div class="m9-h">傍点</div>' + seg('em', st.em, [['', 'なし'], ['sesame', 'あ', 'text-emphasis:filled sesame;-webkit-text-emphasis:filled sesame', 'ゴマ（﹅）'], ['dot', 'あ', 'text-emphasis:filled dot;-webkit-text-emphasis:filled dot', '黒丸（•）'], ['circle', 'あ', 'text-emphasis:open circle;-webkit-text-emphasis:open circle', '白丸（◦）'], ['tri', 'あ', 'text-emphasis:filled triangle;-webkit-text-emphasis:filled triangle', '三角（▲）']]);
      h += '<div class="m9-h">下線</div>' + seg('ud', st.ud, [['', 'なし'], ['solid', 'あa', 'text-decoration:underline solid;text-underline-offset:.18em', '実線'], ['double', 'あa', 'text-decoration:underline double;text-underline-offset:.18em', '二重線'], ['dotted', 'あa', 'text-decoration:underline dotted 1.5px;text-underline-offset:.18em', '点線'], ['dashed', 'あa', 'text-decoration:underline dashed;text-underline-offset:.18em', '破線'], ['wavy', 'あa', 'text-decoration:underline wavy 1px;text-underline-offset:.2em', '波線']]);
      h += '<div class="m9-h">位置</div>' + seg('va', st.va, [['', '通常'], ['super', 'x<sup style="font-size:.7em">2</sup>', '', '上付き（注の番号など）'], ['sub', 'x<sub style="font-size:.7em">2</sub>', '', '下付き']]);
      h += '<div class="m9-h">欧文</div>' + seg('sc', st.sc, [['', '通常'], ['on', 'Small', 'font-variant-caps:small-caps', 'スモールキャップ（頭文字は大文字のまま）'], ['all', 'Caps', 'font-variant-caps:all-small-caps', 'すべて小さな大文字']]);
      h += '<button class="m9-row m9-danger" data-a="decoreset"><span class="m9-ic">' + ICO.clear + '</span><span class="m9-lab">飾りを消す</span></button>';
      h += '<div class="m9-note">文字色・背景色・マーカーは「A」から。</div>';
      return h;
    }
    if (kind === 'pstyle') {
      const t = styleTarget();
      const cur = t ? DB.passign[t.id] : '';
      const list = Object.entries(DB.pstyles || {});
      let h = '<div class="m9-h">段落スタイル<span class="m9-hint">直すと、同じスタイルの段落がすべて変わる</span></div>';
      if (!list.length) h += '<div class="m9-note" style="margin-top:0">段落やコールアウトの見た目（行の高さ・前後の間隔・飾り・枠・書体）をまとめて登録し、ほかのブロックに 1 回で付けられます。</div>';
      for (const [id, ps] of list) {
        const sty = ps.st && ps.st.ff ? 'font-family:' + esc(fontCss(ps.st.ff) || 'inherit') : (ps.inner && ps.inner.ff ? 'font-family:' + esc(fontCss(ps.inner.ff) || 'inherit') : '');
        h += '<div class="m9-tp m9-ps' + (cur === id ? ' on' : '') + '" data-ps="' + id + '"><span class="m9-pst">' + esc(TYPE_LABEL[ps.type] || '段落') + '</span><div class="m9-tpt"><span class="n" style="' + sty + '">' + esc(ps.name) + '</span><span class="m">' + esc(summaryOf(Object.assign({}, ps.inner || {}, ps.st || {})) || '—') + '</span></div>' +
          '<button class="m9-tb sm" data-psupd="' + id + '" title="今のブロックの見た目でこのスタイルを更新">' + ICO.refresh + '</button><button class="m9-tb sm" data-psren="' + id + '" title="名前を変える">' + ICO.edit + '</button><button class="m9-tb sm" data-psdel="' + id + '" title="削除">' + ICO.trash + '</button></div>';
      }
      if (cur && DB.pstyles[cur]) h += '<button class="m9-row" data-a="psoff"><span class="m9-ic">' + ICO.clear + '</span><span class="m9-lab">このブロックのスタイルを外す</span></button>';
      if (PS_NAMING) h += '<div class="m9-tpnew"><input class="m9-psname" value="' + esc(PS_NAME || nextPsName(t)) + '" spellcheck="false"><button class="m9-btn pri" data-a="pssave">保存</button></div>';
      else h += '<button class="m9-row" data-a="psnew"' + (t ? '' : ' disabled') + '><span class="m9-ic">' + ICO.plus + '</span><span class="m9-lab">この' + esc(t ? (TYPE_LABEL[t.type] || '段落') : '段落') + 'の見た目を登録</span></button>';
      return h;
    }
    if (kind === 'blk') {
      const chain = snap ? blockChain(snap.leaf).filter((x) => x.type === 'callout' || x.type === 'quote') : [];
      if (!chain.length) return '<div class="m9-note">コールアウト・引用の中を選んでください</div>';
      const type = chain[0].type;
      const g = (k) => blkGet(k);
      const bs = (k, l) => '<button data-bs="' + k + '" aria-pressed="' + (BSEL.scope === k) + '">' + l + '</button>';
      /* data-bk = キー、data-bv = 値（同じ値をもう一度押すと外す…はしない。「標準」で外す） */
      const dots = (key, extra, bgLike) => { const cur = g(key) || ''; return '<div class="m9-dots">' + extra.map(([v, t, sty, cls]) => '<button class="m9-dot ' + (cls || '') + (cur === v ? ' on' : '') + '" data-bk="' + key + '" data-bv="' + v + '" title="' + esc(t) + '" style="' + (sty || '') + '"></button>').join('') + BASE9.map((c) => '<button class="m9-dot' + (cur === c ? ' on' : '') + '" data-bk="' + key + '" data-bv="' + c + '" title="' + COLOR_JA[c] + '" style="--dot:' + (bgLike ? bPri(c) : tVar(c)) + '"></button>').join('') + '</div>'; };
      const seg = (key, items, curOverride) => { const cur = curOverride !== undefined ? curOverride : String(g(key) ?? ''); return '<div class="m9-seg">' + items.map(([v, l, tt]) => '<button data-bk="' + key + '" data-bv="' + v + '" aria-pressed="' + (cur === v) + '"' + (tt ? ' title="' + esc(tt) + '"' : '') + '>' + l + '</button>').join('') + '</div>'; };
      const chips = (key, items) => { const cur = String(g(key) ?? ''); return '<div class="m9-chips m9-bchips">' + items.map(([v, l, tt]) => '<button class="m9-chip' + (cur === v ? ' on' : '') + '" data-bk="' + key + '" data-bv="' + v + '"' + (tt ? ' title="' + esc(tt) + '"' : '') + '>' + l + '</button>').join('') + '</div>'; };
      const chk = (key, on, label) => '<label class="m9-chk"><input type="checkbox" data-bkc="' + key + '" data-on="' + on + '"' + (g(key) ? ' checked' : '') + '> ' + label + '</label>';
      const lnum = (k, ic, title, lab) => '<div class="m9-ln">' + numHtml(k, ic, title) + '<span>' + lab + '</span></div>';
      const tabs = type === 'callout' ? [['style', 'スタイル'], ['surf', '面と枠'], ['icon', 'アイコン'], ['text', '文字']] : [['style', 'スタイル'], ['line', '線'], ['box', '余白と背景']];
      if (!tabs.some(([k]) => k === BTAB[type])) BTAB[type] = 'style';
      const tab = BTAB[type];
      let h = '<div class="m9-h">' + esc(TYPE_LABEL[type]) + 'の見た目</div><div class="m9-seg">' + bs('only', 'これだけ') + bs('page', 'このページ') + bs('global', '全ページ') + '</div>';
      h += '<div class="m9-tabs">' + tabs.map(([k, l]) => '<button data-btab="' + k + '" aria-pressed="' + (tab === k) + '">' + l + '</button>').join('') + '</div>';
      if (type === 'callout') {
        if (tab === 'style') {
          h += '<div class="m9-pre m9-pre-c">';
          for (const [k, l] of CALLOUT_PRESETS_UI) h += '<button class="m9-pv m9-pv-c-' + k + '" data-cpre="' + k + '" title="' + esc(CALLOUT_PRESET_TIP[k] || l) + '"><i><b></b><s></s><u></u></i><span>' + l + '</span></button>';
          h += '</div><div class="m9-note">形を選んでから「面と枠」「アイコン」で細かく。色はアクセントと 2 色目で変わります。</div>';
          h += '<div class="m9-h">アクセント</div>' + dots('cacc', [['', '背景から自動', '', 'm9-dot-def']]);
          h += '<div class="m9-h">2 色目（グラデーション）</div>' + dots('cgc2', [['', 'アクセントと同じ', '', 'm9-dot-def']]);
        } else if (tab === 'surf') {
          h += '<div class="m9-h">背景</div>' + dots('cbg', [['', 'Notion の色のまま', '', 'm9-dot-def'], ['none', '透明', '--dot:transparent', 'm9-dot-none']], true);
          h += '<div class="m9-h">グラデーション<span class="m9-hint">アクセント → 2 色目</span></div>' + seg('cgrad', [['', 'なし'], ['h', '横'], ['d', '斜め'], ['v', '縦'], ['r', '光'], ['mesh', 'メッシュ']]);
          h += '<div class="m9-g3" style="margin-top:6px">' + lnum('cgi', ICO.deco, 'グラデーションの濃さ（%）', '濃さ') + '</div>';
          h += '<div class="m9-h">枠</div>' + chips('cbd', [['', '標準'], ['none', 'なし'], ['hair', '細線'], ['ring', '色の線'], ['left', '左線'], ['gleft', 'グラデ左線'], ['grad', 'グラデ枠']]);
          h += '<div class="m9-g3" style="margin-top:6px">' + lnum('cbw', ICO.al, '枠・左線の太さ（px）', '太さ') + lnum('crad', ICO.blk, '角の丸み（px）', '角丸') + '</div>';
          h += '<div class="m9-h">影</div>' + seg('csh', [['', 'なし'], ['soft', 'ふんわり'], ['float', '浮く'], ['glow', '光彩']]);
          h += chk('cglass', 'true', 'すりガラス（後ろをぼかして半透明に）');
          h += '<div class="m9-h">余白</div><div class="m9-g3">' + lnum('cpad', ICO.mt, '内側の余白・上下（px）', '内・上下') + lnum('cpx', ICO.il, '内側の余白・左右（px）', '内・左右') + lnum('cpy', ICO.sp, '外側の余白・上下（px）', '外・上下') + '</div>';
          h += '<div class="m9-h">下線</div>' + seg('cls', [['', '消える'], ['full', '全幅'], ['short', '短い'], ['dot', '点線']]);
          h += '<div class="m9-g3" style="margin-top:6px">' + lnum('cline', ICO.deco, '下線の太さ（px・0 で無し）', '太さ') + '</div>';
        } else if (tab === 'icon') {
          h += '<div class="m9-h">見せ方</div>' + chips('ctile', [['', 'そのまま'], ['tint', 'タイル'], ['ring', '輪'], ['solid', '色タイル'], ['grad', 'グラデ'], ['glass', 'ガラス']]);
          h += '<label class="m9-chk"><input type="checkbox" data-bkc="cicon" data-on="hide"' + (g('cicon') === 'hide' ? ' checked' : '') + '> アイコンを隠す</label>';
          h += '<div class="m9-h">大きさ<span class="m9-hint">px（Notion の標準は 24）</span></div><div class="m9-g3">' + lnum('cipx', ICO.size, 'アイコンの大きさ（px）', 'アイコン') + lnum('ctpad', ICO.sp, 'タイルの内側の余白（px）', 'タイル余白') + lnum('ctrad', ICO.blk, 'タイルの角の丸み（px）', 'タイル角') + '</div>';
          h += '<div class="m9-chips m9-chips-sp" style="grid-template-columns:auto repeat(8, 1fr)"><span class="m9-cl">px</span>';
          const cp = NUM.cipx.get();
          for (const v of [16, 18, 20, 22, 24, 28, 32, 40]) h += '<button class="m9-chip' + (NUM.cipx.isSet() && cp === v ? ' on' : '') + '" data-bk="cipx" data-bv="' + v + '">' + v + '</button>';
          h += '</div>';
          h += '<div class="m9-h">位置<span class="m9-hint">矢印 1px ／ ⇧ 4px</span></div><div class="m9-pos"><div class="m9-pad">' +
            '<button data-nudge="ciy:1" title="上へ">▲</button><button data-nudge="cix:-1" title="左へ">◀</button><button data-a="iconpos0" title="位置を戻す">●</button><button data-nudge="cix:1" title="右へ">▶</button><button data-nudge="ciy:-1" title="下へ">▼</button></div>' +
            '<div class="m9-g1">' + lnum('cix', ICO.il, 'アイコンの左右の位置（px・＋で右）', '左右') + lnum('ciy', ICO.mt, 'アイコンの上下の位置（px・＋で上）', '上下') + lnum('cgap', ICO.ls, 'アイコンと文字の間隔（px）', '文字との間') + '</div></div>';
          h += '<div class="m9-h">縦の揃え</div>' + seg('calign', [['', '標準'], ['start', '上'], ['center', '中央'], ['end', '下']], g('chead') && !g('calign') ? 'center' : undefined);
        } else {
          h += chk('chead', 'true', '見出しとして詰める（1 行・縦の中央揃え）');
          h += '<div class="m9-h">文字の色</div>' + seg('ctext', [['', 'そのまま'], ['acc', 'アクセント'], ['grad', 'グラデ'], ['sec', '淡く']]);
          h += '<div class="m9-note">中の文字の書体・大きさ・太さ・行の高さは「段落」から（段落スタイルに登録すると、他のコールアウトにも一発で）。</div>';
        }
      } else {
        if (tab === 'style') {
          h += '<div class="m9-pre">';
          for (const [k, l] of QUOTE_PRESETS_UI) h += '<button class="m9-pv m9-pv-q-' + k + '" data-qpre="' + k + '"><i><b></b><s></s></i><span>' + l + '</span></button>';
          h += '</div>';
          h += chk('qmark', 'true', '引用符（“）を飾る') + chk('qcol', 'sec', '文字を少し淡く') + chk('qit', 'true', '斜体にする');
        } else if (tab === 'line') {
          h += '<div class="m9-h">線</div>' + seg('qst', [['', '実線'], ['soft', '淡く'], ['grad', 'ぼかし'], ['double', '二重'], ['dash', '破線'], ['none', 'なし']]);
          h += '<div class="m9-h">線の色</div>' + dots('qbarc', [['', '文字の色', '', 'm9-dot-def'], ['sec', '薄い灰色', '--dot:var(--c-texTer, #aaa)']]);
          h += '<div class="m9-h">線の位置<span class="m9-hint">左右 ＝ 線ごと動く ／ 上下 ＝ 線の端を縮める</span></div><div class="m9-g3">' + lnum('qx', ICO.il, '線の左右の位置（px・＋で右）', '左右') + lnum('qin', ICO.mt, '線の上と下を縮める（px）', '上下') + lnum('qbar', ICO.al, '線の太さ（px）', '太さ') + '</div>';
          h += chk('qcap', 'true', '線の端を丸く');
        } else {
          h += '<div class="m9-g3">' + lnum('qpad', ICO.il, '線と文字の間（px）', '線と文字') + lnum('qpy', ICO.mt, '上下の余白（px）', '上下') + lnum('qrad', ICO.blk, '角の丸み（px）', '角丸') + '</div>';
          h += '<div class="m9-h">背景</div>' + dots('qbg', [['', 'なし', '', 'm9-dot-def'], ['tint', '線の色をうっすら', '--dot:color-mix(in srgb, currentColor 10%, transparent)'], ['grad', '線の色から消える', '--dot:linear-gradient(90deg, color-mix(in srgb, currentColor 22%, transparent), transparent)']], true);
        }
      }
      h += '<button class="m9-row m9-danger" data-a="blkreset"><span class="m9-ic">' + ICO.clear + '</span><span class="m9-lab">' + esc(TYPE_LABEL[type]) + 'の設定を消す</span></button>';
      return h;
    }
    if (kind === 'tpl') return '<div class="m9-h">テンプレート</div><div class="m9-tpls"></div>';
    return '';
  }
  /* 開いた後の配線・中身の差し替え */
  function afterSub(kind) {
    if (kind === 'font' || kind === 'pfont') {
      const m = sub;
      const q = m.querySelector('.c26-m-q');
      q.addEventListener('input', () => {
        const w = q.value.trim().toLowerCase();
        for (const it of m.querySelectorAll('.c26-m-item[data-q]')) it.hidden = !!w && !it.dataset.q.includes(w);
        for (const g of m.querySelectorAll('.c26-m-g')) {
          let n = g.nextElementSibling, any = false;
          while (n && !n.classList.contains('c26-m-g')) { if (!n.hidden) any = true; n = n.nextElementSibling; }
          g.hidden = !any;
        }
      });
      setTimeout(() => q.focus(), 0);
      const miss = m.querySelector('.c26-m-miss');
      miss.addEventListener('change', () => { PREFS.showMissing = miss.checked; savePrefs(); subKind = ''; openSub(kind); });
      const pv = m.querySelector('.c26-pv');
      const st = Object.assign({}, curSt().st, { ff: fontNow(kind) });
      const sampleText = selText(snap, 40) || '吾輩は猫である。Aa Gg 1234';
      const show = (id) => {
        const f = fontOf(id);
        const tt = pv.querySelector('.c26-pv-t');
        tt.textContent = sampleText;
        tt.style.fontFamily = f ? f.css : '';
        tt.style.fontWeight = st.fw || '';
        pv.querySelector('.c26-pv-n').textContent = f ? f.name : '元の書体';
        pv.querySelector('.c26-pv-b').textContent = !f ? '' : !detectFonts().get(f.id) ? 'この Mac では使えません' : (f.s === 'la' && !f.ja) ? '欧文専用 — 日本語はヒラギノ明朝' : (f.s === 'la' ? '' : '和文対応');
      };
      show(st.ff);
      m.addEventListener('mouseover', (e) => { const it = e.target.closest('.c26-m-item[data-v]'); if (it) show(it.dataset.v); });
      m.querySelector('.c26-m-list').addEventListener('mouseleave', () => show(fontNow(kind)));
      const on = m.querySelector('.c26-m-item.on');
      const list = m.querySelector('.c26-m-list');
      if (on && list) setTimeout(() => { list.scrollTop = Math.max(0, on.offsetTop - list.offsetTop - list.clientHeight / 2); }, 0);
    }
    if (kind === 'pstyle') {
      const nm = sub.querySelector('.m9-psname');
      if (nm) {
        if (PS_FOCUS) { PS_FOCUS = false; setTimeout(() => { nm.focus(); nm.select(); }, 0); }
        nm.addEventListener('input', () => { PS_NAME = nm.value; });
        nm.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); savePStyle(nm.value.trim()); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); PS_NAMING = false; PS_NAME = ''; refreshSub(true); } });
      }
    }
    if (kind === 'para') {
      const pa = sub.querySelector('[data-palt]');
      if (pa) pa.addEventListener('change', () => setBlockProp('palt', pa.checked ? true : null));
      const hy = sub.querySelector('[data-hy]');
      if (hy) hy.addEventListener('change', () => setBlockProp('hy', hy.checked ? true : null));
    }
    if (kind === 'blk') {
      for (const el of sub.querySelectorAll('input[data-bkc]')) {
        const on = el.dataset.on === 'true' ? true : el.dataset.on;
        el.addEventListener('change', () => blkSet(el.dataset.bkc, el.checked ? on : null));
      }
    }
    if (kind === 'para') {
      for (const el of sub.querySelectorAll('input[data-pkc]')) el.addEventListener('change', () => setBlockProp(el.dataset.pkc, el.checked ? true : null));
    }
    if (kind === 'tpl') renderTpls();
  }
  /* 中身を最新に（入力中・選択中は邪魔しない） */
  function refreshSub(force) {
    if (!sub || sub.hidden) return;
    const kind = subKind;
    if (kind === 'font' || kind === 'pfont') {
      const ff = fontNow(kind) || '';
      for (const it of sub.querySelectorAll('.c26-m-item[data-v]')) it.classList.toggle('on', it.dataset.v === ff);
      return;
    }
    if (kind === 'tpl') { renderTpls(); return; }
    const a = document.activeElement;
    const inSub = a && sub.contains(a) && a.matches('input');
    /* 名前の入力中・数値の打ち込み中は作り直さない。数値欄にカーソルがあるだけなら作り直してカーソルを戻す */
    if (!force && inSub && (!a.dataset.num || a.dataset.typing)) return;
    const refocus = inSub && a.dataset.num ? a.dataset.num : '';
    const top = sub.scrollTop;
    sub.innerHTML = renderSub(kind);
    afterSub(kind);
    if (refocus) { const el = sub.querySelector('input[data-num="' + refocus + '"]'); if (el) { el.value = NUM[refocus].fmt(NUM[refocus].get()); el.focus({ preventScroll: true }); el.select(); } }
    for (const inp of sub.querySelectorAll('input[data-num]')) { const k = inp.dataset.num; inp.value = snap ? NUM[k].fmt(NUM[k].get()) : ''; const host = inp.closest('.m9-num'); if (host) host.classList.toggle('set', !!(snap && NUM[k].isSet())); }
    sub.scrollTop = top;
    placeSub();
  }
  function renderBlkBody() {
    const body = sub.querySelector('.m9-blkbody');
    if (!body) return;
    const chain = snap ? blockChain(snap.leaf).filter((x) => x.type === 'callout' || x.type === 'quote') : [];
    if (!chain.length) return;
    const type = chain[0].type;
    const key = type + '|' + BSEL.scope + '|' + chain[0].id;
    if (body.dataset.key === key) return;
    body.dataset.key = key;
    body.textContent = '';
    const tt = blockTarget(true);
    if (!tt || !tt.target) return;
    const target = tt.target;
    body.appendChild(fieldsUI(target, type === 'callout' ? CALLOUT_FIELDS : QUOTE_FIELDS, () => { clean(target); if (tt.scope === 'only') target.__type = type; changed(); autoSave(); }));
  }
  let TPL_NAMING = false;
  let TPL_FOCUS = false;
  function renderTpls() {
    const box = sub.querySelector('.m9-tpls');
    if (!box) return;
    const { color } = snap ? curSt() : { color: null };
    /* 名前の入力中は作り直さない（打った名前とカーソルを保つ） */
    const prevNm = box.querySelector('.f-tpname');
    if (prevNm && TPL_NAMING && document.activeElement === prevNm) return;
    const nmVal = prevNm ? prevNm.value : nextName();
    const list = COLORS.map((x) => x[0]).filter((c) => SLOTS[c] && SLOTS[c].tpl);
    let h = '';
    if (!list.length) h += '<div class="m9-note">まだありません。文字の書式を整えてから「今の書式を保存」を押すと、ここに並びます。</div>';
    for (const c of list) {
      const sl = SLOTS[c];
      const sty = 'font-family:' + esc(fontCss(sl.st.ff) || 'inherit') + ';font-weight:' + (sl.st.fw || 'normal') + (sl.st.col ? ';color:' + tVar(sl.st.col) : '') + (sl.st.hl ? ';background:' + bVar(sl.st.hl) : '');
      h += '<div class="m9-tp' + (c === color ? ' on' : '') + '" data-tp="' + c + '"><div class="m9-tpt"><span class="n" style="' + sty + '">' + esc(sl.name) + '</span><span class="m">' + esc(summaryOf(sl.st)) + '</span></div>' +
        '<button class="m9-tb sm" data-tpren="' + c + '" title="名前を変える">' + ICO.edit + '</button><button class="m9-tb sm" data-tpdel="' + c + '" title="削除（文字の見た目はそのまま残る）">' + ICO.trash + '</button></div>';
    }
    if (TPL_NAMING) h += '<div class="m9-tpnew"><input class="f-tpname" value="' + esc(nmVal) + '" spellcheck="false"><button class="m9-btn pri" data-a="tplsave">保存</button></div>';
    else h += '<button class="m9-row" data-a="tplnew"' + (snap && snap.parts.length ? '' : ' disabled') + '><span class="m9-ic">' + ICO.plus + '</span><span class="m9-lab">今の書式を保存</span></button>';
    box.innerHTML = h;
    const nm = box.querySelector('.f-tpname');
    if (nm) {
      if (TPL_FOCUS) { TPL_FOCUS = false; setTimeout(() => { nm.focus(); nm.select(); }, 0); }
      nm.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); TPL_NAMING = false; saveAsTemplate(nm.value.trim()); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); TPL_NAMING = false; renderTpls(); } });
    }
    placeSub();
  }

  /* ---------- 段落スタイル（Word のスタイルと同じ。ブロックに名前付きの見た目を付ける） ----------
   *   DB.pstyles[id] = { name, type, st: ブロックの設定, inner: コールアウトの中の文字の設定 }
   *   DB.passign[ブロック id] = id     （ブロックの id は Notion 全体で 1 つなので、ページをまたいで使える）
   *   付けると、そのブロックの「この段落だけ」の設定は外れてスタイルどおりになる。スタイルを直すと全部が変わる。 */
  const PARA_KEYS = ['ff', 'fs', 'fw', 'ls', 'ta', 'hy', 'lh', 'sp', 'mt', 'mb', 'ti', 'il', 'ir', 'dk', 'dcol', 'dc', 'palt', 'rule', 'rulec'];
  const INNER_SEL = '.notion-text-block, .notion-header-block, .notion-sub_header-block, .notion-sub_sub_header-block';
  let PS_NAMING = false, PS_FOCUS = false, PS_NAME = '';
  /* 段落スタイルの対象: コールアウト・引用の中ならそのブロック、そうでなければ段落そのもの */
  function styleTarget() {
    if (!DB.pstyles) DB.pstyles = {}; if (!DB.passign) DB.passign = {};
    if (snap && snap.blockEls && snap.blockEls.length) { const el = snap.blockEls[0]; const t = typeOfBlock(el); return t ? { el, id: el.getAttribute('data-block-id'), type: t } : null; }
    const chain = snap ? blockChain(snap.leaf) : [];
    const box = chain.find((x) => x.type === 'callout' || x.type === 'quote');
    const t = box || chain[0] || null;
    return t && t.type !== 'title' ? t : null;
  }
  function styleTargets() {
    if (!snap) return [];
    if (snap.blockEls && snap.blockEls.length) return snap.blockEls.map((el) => ({ el, id: el.getAttribute('data-block-id'), type: typeOfBlock(el) })).filter((t) => t.type && t.type !== 'title');
    const leaves = snap.parts.length ? snap.parts.map((p) => partLeaf(p)).filter(Boolean) : [snap.leaf];
    const out = [], seen = new Set();
    for (const lf of leaves) {
      const ch = blockChain(lf);
      const t = ch.find((x) => x.type === 'callout' || x.type === 'quote') || ch[0];
      if (t && t.type !== 'title' && !seen.has(t.id)) { seen.add(t.id); out.push(t); }
    }
    return out;
  }
  function onlyOf(id, el) {
    const s = pageStore(pageIdOf(layoutOf(el)), false);
    return s && s.only && s.only[id] ? s.only[id] : null;
  }
  function dropOnly(id, el) {
    const s = pageStore(pageIdOf(layoutOf(el)), false);
    if (s && s.only) delete s.only[id];
  }
  /* そのブロックの今の見た目（スタイル → この段落だけ の順に重ねる） */
  function propsOf(id, el, inner) {
    const ps = DB.passign[id] && DB.pstyles[DB.passign[id]];
    const o = Object.assign({}, ps ? clone(inner ? (ps.inner || {}) : (ps.st || {})) : {}, clone(onlyOf(id, el) || {}));
    delete o.__type;
    return clean(o);
  }
  /* 文字全体に ²⁶ の書式が付いていれば、その書体なども段落スタイルに含める */
  function fontFromText(st, blockEl) {
    const lf = leavesOfBlock(blockEl)[0];
    if (!lf) return;
    const len = modelTextOf(lf).length;
    if (!len) return;
    const c = slotAt(lf, 0);
    const s = c && SLOTS[c] && SLOTS[c].st;
    if (!s || slotAt(lf, len - 1) !== c) return;
    for (const k of ['ff', 'fs', 'fw', 'it', 'ls']) if (s[k] !== undefined && st[k] === undefined) st[k] = s[k];
  }
  function captureStyle(t) {
    const st = propsOf(t.id, t.el, false);
    let inner = null;
    if (t.type === 'callout') {
      const child = t.el.querySelector(INNER_SEL);
      if (child) {
        const cid = child.getAttribute('data-block-id');
        inner = propsOf(cid, child, false);
        const ps = DB.passign[t.id] && DB.pstyles[DB.passign[t.id]];
        if (ps && ps.inner) inner = Object.assign(clone(ps.inner), inner);
        fontFromText(inner, child);
      }
    } else fontFromText(st, t.el);
    return { type: t.type, st, inner };
  }
  function nextPsName(t) {
    const base = t ? (TYPE_LABEL[t.type] || '段落') : '段落';
    const used = new Set(Object.values(DB.pstyles || {}).map((s) => s.name));
    for (let i = 1; ; i++) if (!used.has(base + ' ' + i)) return base + ' ' + i;
  }
  function clearDirect(t) {
    dropOnly(t.id, t.el);
    if (t.type === 'callout') for (const ch of t.el.querySelectorAll(INNER_SEL)) dropOnly(ch.getAttribute('data-block-id'), ch);
  }
  function savePStyle(name) {
    if (!DB.pstyles) DB.pstyles = {}; if (!DB.passign) DB.passign = {};
    const t = styleTarget();
    if (!t) { toast('段落・見出し・コールアウト・引用の中を選んでください'); return; }
    const cap = captureStyle(t);
    const id = 'ps' + Date.now().toString(36);
    DB.pstyles[id] = { name: name || nextPsName(t), type: cap.type, st: cap.st, inner: cap.inner };
    DB.passign[t.id] = id;
    clearDirect(t);
    PS_NAMING = false; PS_NAME = '';
    changed(); autoSave();
    toast('段落スタイル「' + DB.pstyles[id].name + '」を登録しました');
    refreshPop(); refreshSub(true);
  }
  function applyPStyle(id) {
    if (!DB.pstyles) DB.pstyles = {}; if (!DB.passign) DB.passign = {};
    const ps = DB.pstyles[id];
    if (!ps) return;
    const ts = styleTargets();
    if (!ts.length) { toast('付けたいブロックの中を選んでください'); return; }
    let n = 0;
    for (const t of ts) {
      if (ps.type === 'callout' && t.type !== 'callout') continue;
      DB.passign[t.id] = id; clearDirect(t); n++;
    }
    if (!n) { toast('このスタイルはコールアウト用です'); return; }
    changed(); autoSave(); ensureLang();
    refreshPop(); refreshSub(true);
  }
  function updatePStyle(id) {
    if (!DB.pstyles) DB.pstyles = {}; if (!DB.passign) DB.passign = {};
    const ps = DB.pstyles[id];
    const t = styleTarget();
    if (!ps || !t) return;
    if (!confirm('段落スタイル「' + ps.name + '」を、今のブロックの見た目で更新しますか？\n（このスタイルの段落がすべて変わります）')) return;
    const cap = captureStyle(t);
    ps.st = cap.st; ps.inner = cap.inner; ps.type = cap.type;
    DB.passign[t.id] = id; clearDirect(t);
    changed(); autoSave(); refreshPop(); refreshSub(true);
  }
  function deletePStyle(id) {
    if (!DB.pstyles) DB.pstyles = {}; if (!DB.passign) DB.passign = {};
    const ps = DB.pstyles[id];
    if (!ps) return;
    const used = Object.values(DB.passign).filter((x) => x === id).length;
    if (!confirm('段落スタイル「' + ps.name + '」を削除しますか？' + (used ? '\n（使っている ' + used + ' ブロックは Notion 標準の見た目に戻ります）' : ''))) return;
    delete DB.pstyles[id];
    for (const [b, s] of Object.entries(DB.passign)) if (s === id) delete DB.passign[b];
    changed(); autoSave(); refreshPop(); refreshSub(true);
  }

  /* ---------- 書式のコピー（Word の書式のコピー／貼り付け） ----------
   *   🖌 を押す → 今の文字の書式と段落の設定を覚える → 次に選んだ文字・段落にそのまま貼る（Esc でやめる） */
  let PAINT = null;
  function startPaint() {
    if (PAINT) { endPaint(); refreshPop(); return; }
    const { st } = curSt();
    const holders = blockPropHolders(false);
    const props = {};
    if (holders[0]) for (const k of PARA_KEYS) if (holders[0][k] !== undefined) props[k] = holders[0][k];
    const t = styleTarget();
    PAINT = { st: clone(normSt(st)), props, ps: t ? DB.passign[t.id] || '' : '' };
    document.documentElement.classList.add('c26-painting');
    hidePop();
    toast('書式をコピーしました。貼り付けたい文字を選んでください（Esc でやめる）');
  }
  function endPaint() { PAINT = null; document.documentElement.classList.remove('c26-painting'); }
  async function pastePaint() {
    const P = PAINT;
    endPaint();
    if (!P || !snap) return;
    if (snap.parts.length) {
      const patch = {};
      for (const k of ST_KEYS) patch[k] = P.st[k] !== undefined ? P.st[k] : null;
      if (!isEmptySt(P.st) || curSlot()) await applyStyle(patch);
    }
    const scope = LSC.scope;
    LSC.scope = 'only';
    try {
      if (P.ps && DB.pstyles[P.ps]) applyPStyle(P.ps);
      for (const k of PARA_KEYS) { const cur = blockPropNow(k); if (P.props[k] !== undefined || cur !== undefined) setBlockProp(k, P.props[k] !== undefined ? P.props[k] : null); }
    } finally { LSC.scope = scope; }
    toast('書式を貼り付けました');
    refreshPop();
  }

  /* ---------- クリック（window の捕捉段階で受ける＝Notion に横取りされない） ---------- */
  function onMenuClick(e) {
    const t = e.target;
    const rr = t.closest('[data-ri]');
    if (rr) { runResult(Number(rr.dataset.ri)); return; }
    const bo = t.closest('[data-bo]');
    if (bo) { runBlockOpt(BM.opts[Number(bo.dataset.bo)]); return; }
    if (t.closest('.m9-search')) return;
    const it = t.closest('.c26-m-item[data-v]');
    if (it && (subKind === 'font' || subKind === 'pfont')) { setFont(it.dataset.v); return; }
    const sw0 = t.closest('[data-col]');
    if (sw0) { const [k, c] = sw0.dataset.col.split(':'); if (k === 't') applyTextColor(c || null); else applyHighlight(c || null); return; }
    const stp = t.closest('[data-stp]');
    if (stp) { const [k, d] = stp.dataset.stp.split(':'); stepNum(k, Number(d) * (e.shiftKey ? 10 : e.altKey ? 0.1 : 1)); return; }
    const x = t.closest('[data-em],[data-ud],[data-va],[data-sc]');
    if (x && subKind === 'deco') {
      const d = x.dataset;
      if (d.em !== undefined) applyStyle({ em: d.em || null });
      else if (d.ud !== undefined) applyStyle({ ud: d.ud || null });
      else if (d.va !== undefined) applyStyle({ va: d.va || null });
      else if (d.sc !== undefined) applyStyle({ sc: d.sc || null });
      return;
    }
    const hm = t.closest('[data-hlm]');
    if (hm) { applyStyle({ hlm: hm.dataset.hlm || null, hl: colorNow().hl || 'yellow' }); return; }
    const dk = t.closest('[data-dk]');
    if (dk) { setBlockProp('dk', dk.dataset.dk || null); return; }
    const dcol = t.closest('[data-dcol]');
    if (dcol) { if (!blockPropNow('dk')) setBlockProp('dk', 'bar'); setBlockProp('dcol', dcol.dataset.dcol || null); return; }
    const dcap = t.closest('[data-dc]');
    if (dcap) { setBlockProp('dc', Number(dcap.dataset.dc) || null); return; }
    const btab = t.closest('[data-btab]');
    if (btab && subKind === 'blk') { const tt = blockTarget(false); const ty = tt && tt.c ? tt.c.type : 'callout'; BTAB[ty] = btab.dataset.btab; refreshSub(true); return; }
    const bk = t.closest('[data-bk]');
    if (bk && subKind === 'blk') {
      const k = bk.dataset.bk, raw = bk.dataset.bv;
      if (k === 'cipx') { NUM.cipx.set(Number(raw)); return; }
      const v = raw === '' ? null : (/^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw);
      blkSet(k, v);
      return;
    }
    const ndg = t.closest('[data-nudge]');
    if (ndg) { const [k, d] = ndg.dataset.nudge.split(':'); stepNum(k, Number(d) * (e.shiftKey ? 4 : 1) / NUM[k].step); return; }
    const rl = t.closest('[data-rule]');
    if (rl) { setBlockProp('rule', rl.dataset.rule || null); return; }
    const rlc = t.closest('[data-rulec]');
    if (rlc) { if (!blockPropNow('rule')) setBlockProp('rule', 'line'); setBlockProp('rulec', rlc.dataset.rulec || null); return; }
    const cpre = t.closest('[data-cpre]');
    if (cpre) { blkPreset('callout', cpre.dataset.cpre); return; }
    const qpre = t.closest('[data-qpre]');
    if (qpre) { blkPreset('quote', qpre.dataset.qpre); return; }
    const bset = t.closest('[data-cbg],[data-cacc],[data-cbd],[data-qst],[data-qbarc],[data-qbg]');
    if (bset && subKind === 'blk') { const k = ['cbg', 'cacc', 'cbd', 'qst', 'qbarc', 'qbg'].find((x) => bset.dataset[x] !== undefined); blkSet(k, bset.dataset[k] || null); return; }
    const cic = t.closest('[data-cic]');
    if (cic) { const v = cic.dataset.cic; blkWrite((tg) => { delete tg.cicon; delete tg.ctile; if (v === 'hide') tg.cicon = 'hide'; if (v === 'tile') tg.ctile = 'tint'; }); return; }
    const pfs = t.closest('[data-pfs]');
    if (pfs) { const v = Number(pfs.dataset.pfs); setBlockProp('fs', blockPropNow('fs') === v ? null : v); return; }
    const pfw = t.closest('[data-pfw]');
    if (pfw) { setBlockProp('fw', pfw.dataset.pfw ? Number(pfw.dataset.pfw) : null); return; }
    const pmb = t.closest('[data-mb]');
    if (pmb) { setBlockProp('mb', Number(pmb.dataset.mb)); return; }
    const pti = t.closest('[data-ti]');
    if (pti) { const v = Number(pti.dataset.ti); setBlockProp('ti', v || null); if (v < 0 && !blockPropNow('il')) setBlockProp('il', -v); return; }
    const pu = t.closest('[data-psupd]');
    if (pu) { updatePStyle(pu.dataset.psupd); return; }
    const pr = t.closest('[data-psren]');
    if (pr) { const id = pr.dataset.psren; const nm = prompt('段落スタイルの名前', DB.pstyles[id].name); if (nm && nm.trim()) { DB.pstyles[id].name = nm.trim(); changed(); autoSave(); refreshPop(); } return; }
    const pd = t.closest('[data-psdel]');
    if (pd) { deletePStyle(pd.dataset.psdel); return; }
    const ps = t.closest('[data-ps]');
    if (ps) { applyPStyle(ps.dataset.ps); return; }
    const chip = t.closest('[data-fs],[data-ls],[data-lh],[data-sp],[data-fw]');
    if (chip) {
      const d = chip.dataset;
      if (d.fs !== undefined) applyStyle({ fs: Number(d.fs) });
      else if (d.ls !== undefined) applyStyle({ ls: Number(d.ls) / 100 });
      else if (d.fw !== undefined) applyStyle({ fw: d.fw === '' ? null : Number(d.fw) });
      else if (d.lh !== undefined) setBlockProp('lh', blockPropNow('lh') === Number(d.lh) ? null : Number(d.lh));
      else if (d.sp !== undefined) setBlockProp('sp', blockPropNow('sp') === Number(d.sp) ? null : Number(d.sp));
      return;
    }
    const sc = t.closest('[data-sc]');
    if (sc) { LSC.scope = sc.dataset.sc; refreshPop(); return; }
    const bs = t.closest('[data-bs]');
    if (bs) { BSEL.scope = bs.dataset.bs; subKind = ''; openSub('blk'); return; }
    const al = t.closest('[data-al]');
    if (al) { setBlockProp('ta', blockPropNow('ta') === al.dataset.al ? null : al.dataset.al); if (al.dataset.al === 'justify' && blockPropNow('hy') === undefined && blockPropNow('ta') === 'justify') setBlockProp('hy', true); return; }
    const tr = t.closest('[data-tpren]');
    if (tr) { const c = tr.dataset.tpren; const nm = prompt('テンプレートの名前', SLOTS[c].name); if (nm && nm.trim()) { SLOTS[c].name = nm.trim(); saveSlots(); refreshPop(); } return; }
    const td = t.closest('[data-tpdel]');
    if (td) {
      const c = td.dataset.tpdel;
      if (!confirm('テンプレート「' + SLOTS[c].name + '」を削除しますか？\n（このテンプレートの文字の見た目はそのまま残ります）')) return;
      SLOTS[c].tpl = false; delete SLOTS[c].name;
      saveSlots(); writeSlotCss(); refreshPop();
      return;
    }
    const tp = t.closest('[data-tp]');
    if (tp) { applyTemplate(tp.dataset.tp); return; }
    const sb = t.closest('[data-sub]');
    if (sb && !t.closest('input')) { openSub(sb.dataset.sub); return; }
    const n = t.closest('[data-n]');
    if (n) { native(n.dataset.n); return; }
    const b = t.closest('button[data-a]');
    if (!b || b.disabled) return;
    const a = b.dataset.a;
    if (a === 'undo') undo();
    else if (a === 'settings') { hidePop(); openPanel(); }
    else if (a === 'atelier') { hidePop(); openAtelier(); }
    else if (a === 'atpick') { hidePop(); atPickFromMenu(); }
    else if (a === 'attoc' || a === 'atfocus' || a === 'atcount') { atTool(a.slice(2)); syncToolButtons(); }
    else if (a === 'iconpos0') blkWrite((tg) => { delete tg.cix; delete tg.ciy; })
    else if (a === 'icons') openIconLibrary(b);
    else if (a === 'fsreset') applyStyle({ fs: null });
    else if (a === 'clearst') applyStyle({ ff: null, fs: null, fw: null, ls: null, it: null });
    else if (a === 'parareset') { for (const k of PARA_KEYS) for (const hh of blockPropHolders(false)) delete hh[k]; changed(); autoSave(); refreshPop(); }
    else if (a === 'blkreset') { const tt = blockTarget(false); if (tt && tt.target) blkWrite((tg) => { for (const k of tt.c.type === 'callout' ? CALLOUT_KEYS : QUOTE_KEYS) delete tg[k]; }); }
    else if (a === 'decoreset') applyStyle({ em: null, ud: null, va: null, sc: null });
    else if (a === 'paint') startPaint();
    else if (a === 'psnew') { PS_NAMING = true; PS_FOCUS = true; PS_NAME = ''; refreshSub(true); }
    else if (a === 'pssave') { const nm = sub.querySelector('.m9-psname'); savePStyle(nm ? nm.value.trim() : ''); }
    else if (a === 'psoff') { const tt = styleTarget(); if (tt) { delete DB.passign[tt.id]; changed(); autoSave(); refreshPop(); } }
    else if (a === 'tplnew') { TPL_NAMING = true; TPL_FOCUS = true; renderTpls(); }
    else if (a === 'tplsave') { const nm = sub.querySelector('.f-tpname'); TPL_NAMING = false; saveAsTemplate(nm ? nm.value.trim() : ''); }
  }
  const inMenu = (el) => !!(el && el.closest && el.closest('#c26-menu, #c26-sub'));
  window.addEventListener('click', (e) => {
    if (!inMenu(e.target)) return;
    if (e.target.closest('.c26-fields')) return;
    e.stopPropagation();
    if (e.target.closest('label') && !e.target.closest('button') && !e.target.closest('[data-scrub]')) return;
    onMenuClick(e);
  }, true);
  /* メニュー内の押下: 本文の選択を失わない（入力欄以外）。メニューの外を押したら閉じる */
  for (const ev of ['mousedown', 'pointerdown']) {
    window.addEventListener(ev, (e) => {
      if (PRESSING) return;
      if (inMenu(e.target)) {
        if (!e.target.closest('input, select, textarea, label.m9-chk, .c26-fields')) e.preventDefault();
        return;
      }
      if (ev === 'pointerdown' && popOpen() && !(e.target.closest && e.target.closest('#c26-fab, .c26-panel, .c26-toast, .c26-mgr-back'))) hidePop();
    }, true);
  }
  window.addEventListener('keydown', (e) => {
    if (PRESSING || !inMenu(e.target)) return;
    if (onNumKey(e) || onSearchKey(e)) { e.stopImmediatePropagation(); return; }
  }, true);

  /* ---------- 透かし（本文が変わる操作をしたら、メニューを透かして下の文字を見せる） ----------
   *   ・操作した瞬間にメニューと横のパネルが薄くなる（クリックはそのまま効く）
   *   ・続けて操作している間は薄いまま。5 秒何もしないか、マウスを別の所へ動かすと元に戻る */
  let ghostT = 0, ghostAt = null, lastPtr = null;
  function ghost() {
    if (PREFS.ghost !== true || !popOpen()) return;
    for (const el of [pop, sub]) if (el) el.classList.add('m9-ghost');
    ghostAt = lastPtr ? { x: lastPtr.x, y: lastPtr.y } : { x: -1e4, y: -1e4 };
    clearTimeout(ghostT);
    ghostT = setTimeout(unghost, 5000);
  }
  function unghost() {
    clearTimeout(ghostT); ghostAt = null;
    for (const el of [pop, sub]) if (el) el.classList.remove('m9-ghost');
  }
  window.addEventListener('pointermove', (e) => {
    lastPtr = { x: e.clientX, y: e.clientY };
    if (ghostAt && !scrub && Math.hypot(e.clientX - ghostAt.x, e.clientY - ghostAt.y) > 28) unghost();
  }, true);

  /* ---------- 検索（日本語・英語・読み・あいまい） ---------- */
  const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const norm = (s) => toHira(String(s || '').normalize('NFKC').toLowerCase()).replace(/[\s・\-_/()（）「」『』、。.,:：]/g, '');
  function fuzzy(q, t) {
    if (!q || !t) return -1;
    const i = t.indexOf(q);
    if (i === 0) return 100 - t.length * 0.2;
    if (i > 0) return 80 - i * 0.5 - t.length * 0.1;
    let from = 0, last = -1, gaps = 0;
    for (const ch of q) { const j = t.indexOf(ch, from); if (j < 0) return -1; if (last >= 0) gaps += j - last - 1; last = j; from = j + 1; }
    /* 飛び飛びすぎる一致は捨てる（関係ない項目が混ざらないように） */
    if (q.length < 2 || gaps > q.length + 2) return -1;
    return 45 - gaps * 3 - t.length * 0.05;
  }
  /* 書体名の読み（ひらみん・ゆうみん など、よく使う呼び方でも見つかるように） */
  function yomi(name) {
    let y = String(name);
    const R = [['ヒラギノ明朝', 'ひらぎのみんちょう ひらみん'], ['ヒラギノ角ゴ', 'ひらぎのかくご ひらかく'], ['ヒラギノ丸ゴ', 'ひらぎのまるご ひらまる'], ['游明朝', 'ゆうみんちょう ゆうみん'], ['游ゴシック', 'ゆうごしっく ゆうご'], ['明朝', 'みんちょう'], ['教科書', 'きょうかしょ'], ['筑紫', 'つくし'], ['秀英', 'しゅうえい'], ['宋', 'そう'], ['楷', 'かい'], ['行書', 'ぎょうしょ'], ['丸', 'まる'], ['角', 'かく'], ['黒', 'くろ']];
    const add = [];
    for (const [k, v] of R) if (y.includes(k)) add.push(v);
    return add.join(' ');
  }
  const C = (label, cat, words, run, extra) => Object.assign({ label, cat, keys: [label].concat(words || []).map(norm), run }, extra || {});
  /* 命令の一覧（今の状態に合わせて毎回作る） */
  function commands(qRaw) {
    const out = [];
    const hasText = !!(snap && snap.parts.length);
    const hasBlock = !!(snap && (snap.leaf || (snap.blockEls && snap.blockEls.length)));
    const bm = pop.classList.contains('m9-bmode');
    if (bm && BM.opts) for (const o of BM.opts) out.push(C(o.ja, 'Notion', [o.en, o.kw], () => runBlockOpt(o), { hint: o.sc, svg: o.svg }));
    if (hasText) {
      const N = [['bold', '太字', 'ふとじ bold ぼーるど b', '⌘B'], ['italic', '斜体', 'しゃたい いたりっく italic', '⌘I'], ['underline', '下線', 'かせん あんだーらいん underline', '⌘U'], ['strike', '取り消し線', 'とりけしせん strikethrough strike', '⌘⇧S'],
        ['code', 'コード', 'code いんらいんこーど', '⌘E'], ['link', 'リンク', 'link りんく url', '⌘K'], ['equation', '数式', 'すうしき equation math tex', '⌘⇧E'], ['clear', '書式をすべて消す', 'しょしきをけす clear format くりあ', ''], ['comment', 'コメント', 'こめんと comment', '⌘⇧M'], ['turn', 'ブロックの種類を変える', 'てんかん turn into へんかん みだし', ''], ['more', 'ブロックのメニュー', 'ふくせい いどう さくじょ duplicate move delete ai もっと more', '']];
      for (const [k, l, w, sc] of N) out.push(C(l, 'Notion', w.split(' '), () => native(k), { hint: sc }));
      out.push(C('文字色: 標準', '色', ['もじいろ ひょうじゅん text color default'], () => applyTextColor(null)));
      out.push(C('背景色: なし', '色', ['はいけいいろ なし background none'], () => applyHighlight(null)));
      for (const c of BASE9) {
        out.push(C('文字色: ' + COLOR_JA[c], '色', ['もじいろ', 'text color ' + c, c], () => applyTextColor(c), { sw: 't:' + c }));
        out.push(C('背景色: ' + COLOR_JA[c], '色', ['はいけい', 'background ' + c, 'highlight ' + c, 'はいらいと'], () => applyHighlight(c), { sw: 'b:' + c }));
      }
      out.push(C('マーカー（蛍光ペン）', '色', ['まーかー けいこうぺん marker highlighter'], () => applyStyle({ hlm: 'marker', hl: colorNow().hl || 'yellow' })));
      const av = detectFonts();
      for (const f of FONT_LIST) if (av.get(f.id)) out.push(C(f.name, '書体', [f.group, 'font', 'しょたい', yomi(f.name)].concat(f.fams || []), () => applyStyle({ ff: f.id }), { font: f.css }));
      out.push(C('元の書体に戻す', '書体', ['しょたい もどす reset font'], () => applyStyle({ ff: null })));
      for (const [w] of WEIGHTS) out.push(C('太さ ' + w + '（' + (WEIGHT_NAME[w] || w) + '）', '文字', ['ふとさ weight', String(WEIGHT_NAME[w] || '')], () => applyStyle({ fw: w })));
      out.push(C('文字を大きく', '文字', ['おおきく larger bigger size up'], () => stepNum('fs', 1)));
      out.push(C('文字を小さく', '文字', ['ちいさく smaller size down'], () => stepNum('fs', -1)));
      const E = [['sesame', '傍点（ゴマ）', 'ぼうてん けんてん ごま sesame emphasis'], ['dot', '傍点（黒丸）', 'ぼうてん くろまる dot'], ['circle', '傍点（白丸）', 'ぼうてん しろまる circle'], ['tri', '傍点（三角）', 'ぼうてん さんかく triangle']];
      for (const [v, l, w] of E) out.push(C(l, '飾り', w.split(' '), () => applyStyle({ em: v })));
      const U = [['solid', '下線（実線）'], ['double', '二重線'], ['dotted', '点線の下線'], ['dashed', '破線の下線'], ['wavy', '波線']];
      for (const [v, l] of U) out.push(C(l, '飾り', ['かせん underline ' + v, 'なみせん にじゅうせん てんせん はせん'], () => applyStyle({ ud: v })));
      out.push(C('上付き', '飾り', ['うわつき superscript sup ちゅう'], () => applyStyle({ va: 'super' })));
      out.push(C('下付き', '飾り', ['したつき subscript sub'], () => applyStyle({ va: 'sub' })));
      out.push(C('スモールキャップ', '飾り', ['small caps すもーるきゃっぷ'], () => applyStyle({ sc: 'on' })));
      out.push(C('飾りを消す', '飾り', ['かざり けす clear decoration'], () => applyStyle({ em: null, ud: null, va: null, sc: null })));
      for (const c of COLORS.map((x) => x[0]).filter((c) => SLOTS[c] && SLOTS[c].tpl)) out.push(C(SLOTS[c].name, '文字テンプレート', ['てんぷれーと template'], () => applyTemplate(c), { font: fontCss(SLOTS[c].st.ff) }));
      out.push(C('書式のコピー', 'Notion', ['しょしきのこぴー format painter brush ぶらし'], () => startPaint()));
    }
    const av2 = detectFonts();
    if (hasBlock) {
      const A = [['left', '左揃え', 'ひだりぞろえ align left'], ['center', '中央揃え', 'ちゅうおう せんたー center'], ['right', '右揃え', 'みぎぞろえ align right'], ['justify', '両端揃え', 'りょうたん じゃすてぃふぁい justify']];
      for (const [v, l, w] of A) out.push(C(l, '段落', w.split(' '), () => setBlockProp('ta', v)));
      for (const v of [1, 1.2, 1.5, 1.75, 2]) out.push(C('行の高さ ' + v, '段落', ['ぎょうかん ぎょうのたかさ line height'], () => setBlockProp('lh', v)));
      const D = [['bar', '段落の飾り: 左線'], ['fill', '段落の飾り: 背景'], ['barfill', '段落の飾り: 線＋背景'], ['under', '段落の飾り: 下線'], ['box', '段落の飾り: 枠'], ['grad', '段落の飾り: ぼかし'], ['', '段落の飾り: なし']];
      for (const [v, l] of D) out.push(C(l, '段落', ['かざり decoration border box ' + v, 'ひだりせん わく'], () => setBlockProp('dk', v || null)));
      for (const f of FONT_LIST) if (av2.get(f.id)) out.push(C('段落の書体: ' + f.name, '段落', ['だんらく しょたい paragraph font', yomi(f.name)].concat(f.fams || []), () => setBlockProp('ff', f.id), { font: f.css }));
      out.push(C('段落の書体を元に戻す', '段落', ['だんらく しょたい もどす reset paragraph font'], () => setBlockProp('ff', null)));
      const bx = snap && snap.leaf ? blockChain(snap.leaf).find((x) => x.type === 'callout' || x.type === 'quote') : null;
      if (bx && bx.type === 'callout') for (const [k, l] of CALLOUT_PRESETS_UI) out.push(C('コールアウト: ' + l, 'コールアウト', ['こーるあうと callout', 'かたち'], () => blkPreset('callout', k)));
      if (bx && bx.type === 'quote') for (const [k, l] of QUOTE_PRESETS_UI) out.push(C('引用: ' + l, '引用', ['いんよう quote', 'かたち'], () => blkPreset('quote', k)));
      out.push(C('字下げ 1字', '段落', ['じさげ いんでんと indent first line'], () => setBlockProp('ti', 1)));
      out.push(C('字下げなし', '段落', ['じさげ なし no indent'], () => setBlockProp('ti', null)));
      out.push(C('ドロップキャップ（2 行）', '段落', ['どろっぷきゃっぷ かしらもじ drop cap'], () => setBlockProp('dc', 2)));
      out.push(C('ドロップキャップ（3 行）', '段落', ['どろっぷきゃっぷ かしらもじ drop cap'], () => setBlockProp('dc', 3)));
      out.push(C('約物を詰める', '段落', ['やくもの つめる palt kerning'], () => setBlockProp('palt', !blockPropNow('palt') || null)));
      out.push(C('英語のハイフネーション', '段落', ['はいふねーしょん hyphenation'], () => setBlockProp('hy', !blockPropNow('hy') || null)));
      out.push(C('段落の設定を消す', '段落', ['だんらく りせっと reset paragraph'], () => { for (const k of PARA_KEYS) for (const hh of blockPropHolders(false)) delete hh[k]; changed(); autoSave(); refreshPop(); ghost(); }));
      for (const [id, ps] of Object.entries(DB.pstyles || {})) out.push(C(ps.name, '段落スタイル', ['すたいる style', TYPE_LABEL[ps.type] || ''], () => applyPStyle(id)));
      out.push(C('段落スタイルを登録', '段落スタイル', ['とうろく すたいる save style'], () => { openSub('pstyle'); PS_NAMING = true; PS_FOCUS = true; refreshSub(true); }, { keep: 1 }));
    }
    /* パネルを開く */
    const P = [['color', '色…', 'いろ からー color'], ['font', '書体…', 'しょたい ふぉんと font'], ['size', 'サイズ・太さ・字間…', 'さいず ふとさ じかん size weight spacing'], ['deco', '文字の飾り…', 'かざり decoration'], ['para', '段落…', 'だんらく paragraph'], ['pstyle', '段落スタイル…', 'すたいる style'], ['tpl', '文字テンプレート…', 'てんぷれーと template']];
    for (const [k, l, w] of P) if ((hasText || k === 'para' || k === 'pstyle') && hasBlock) out.push(C(l, 'パネル', w.split(' '), () => openSub(k), { keep: 1 }));
    out.push(C('元に戻す', '²⁶', ['もとにもどす undo'], () => undo()));
    out.push(C(PREFS.ghost !== true ? '操作した時に透かす: オンにする' : '操作した時に透かす: オフにする', '²⁶', ['すかし とうか ghost transparent'], () => { PREFS.ghost = PREFS.ghost !== true; savePrefs(); toast(PREFS.ghost ? '操作した時にメニューを透かします' : 'メニューを透かさないようにしました'); }));
    out.push(C('設定', '²⁶', ['せってい settings'], () => { hidePop(); openPanel(); }));
    out.push(C('アイコンライブラリを開く', '²⁹', ['あいこん icon library らいぶらり せいざ star ほし'], () => openIconLibrary(null)));
    if (hasBlock) for (const [v, l] of [['', '罫線なし'], ['line', '罫線（ノート）'], ['dot', 'ドットの罫線'], ['grid', '方眼']]) out.push(C('段落: ' + l, '段落', ['けいせん のーと rule ruled notebook ' + (v || 'none'), 'ほうがん どっと grid dot'], () => setBlockProp('rule', v || null)));
    /* 数字を打った時: サイズ・行の高さ・前後・字下げ・字間 */
    const m = /(-?\d+(?:\.\d+)?)/.exec(String(qRaw).normalize('NFKC'));
    if (m) {
      const n = Number(m[1]);
      if (hasText) {
        out.push(C('サイズ ' + n + 'px', '数値', ['さいず おおきさ size fontsize もじ'], () => applyStyle({ fs: n }), { num: 1 }));
        out.push(C('字間 ' + n + '%', '数値', ['じかん もじかん letter spacing tracking'], () => applyStyle({ ls: n / 100 }), { num: 1 }));
        if (n % 100 === 0 && n >= 100 && n <= 900) out.push(C('太さ ' + n, '数値', ['ふとさ weight'], () => applyStyle({ fw: n }), { num: 1 }));
      }
      if (hasBlock) {
        if (n > 0 && n <= 4) out.push(C('行の高さ ' + n, '数値', ['ぎょうかん ぎょうのたかさ line height'], () => setBlockProp('lh', n), { num: 1 }));
        out.push(C('段落のサイズ ' + n + 'px', '数値', ['だんらく さいず おおきさ paragraph size'], () => setBlockProp('fs', n), { num: 1 }));
        out.push(C('段落の前 ' + n + 'px', '数値', ['まえ うえ ぜん before above margin top'], () => setBlockProp('mt', n), { num: 1 }));
        out.push(C('段落の後 ' + n + 'px', '数値', ['あと した ご after below margin bottom'], () => setBlockProp('mb', n), { num: 1 }));
        out.push(C('字下げ ' + n + '字', '数値', ['じさげ indent'], () => setBlockProp('ti', n || null), { num: 1 }));
        out.push(C('左インデント ' + n + '字', '数値', ['ひだり いんでんと indent left'], () => setBlockProp('il', n || null), { num: 1 }));
      }
    }
    return out;
  }
  let RES = [], resI = 0;
  function searchQuery() { const q = pop && pop.querySelector('.m9-q'); return q ? q.value : ''; }
  function clearSearch() { const q = pop && pop.querySelector('.m9-q'); if (q && q.value) { q.value = ''; renderResults(); } }
  function renderResults() {
    const raw = searchQuery();
    const box = pop.querySelector('.m9-results');
    const bodies = pop.querySelectorAll('.m9-body');
    const qn = norm(raw);
    if (!qn) {
      box.hidden = true; box.innerHTML = ''; RES = [];
      pop.classList.remove('m9-searching');
      placePop();
      return;
    }
    pop.classList.add('m9-searching');
    void bodies;
    const numQ = /\d/.test(raw);
    const words = norm(raw.replace(/-?\d+(?:\.\d+)?/g, ''));
    const scored = [];
    for (const c of commands(raw)) {
      let s;
      if (c.num) { s = words ? Math.max(...c.keys.map((k) => fuzzy(words, k))) : 0; s = s < 0 ? -1 : s + 120; }
      else { s = Math.max(...c.keys.map((k) => fuzzy(qn, k))); if (numQ && s < 0) continue; }
      if (s >= 0) scored.push([s, c]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    RES = scored.slice(0, 14).map((x) => x[1]);
    resI = 0;
    let h = '';
    if (!RES.length) h = '<div class="m9-empty">見つかりません</div>';
    RES.forEach((c, i) => {
      const ic = c.svg ? '<span class="m9-ic m9-ic-n">' + c.svg + '</span>' : c.sw ? '<span class="m9-ic"><i class="m9-mini-sw" style="' + (c.sw[0] === 't' ? 'color:' + tVar(c.sw.slice(2)) : 'background:' + bVar(c.sw.slice(2))) + '">' + (c.sw[0] === 't' ? 'A' : '') + '</i></span>' : '';
      h += '<button class="m9-row m9-res' + (i === 0 ? ' kb' : '') + '" data-ri="' + i + '">' + ic + '<span class="m9-lab"' + (c.font ? ' style="font-family:' + esc(c.font) + '"' : '') + '>' + esc(c.label) + '</span>' + (c.hint ? '<span class="m9-sc">' + esc(c.hint) + '</span>' : '') + '<span class="m9-cat">' + esc(c.cat) + '</span></button>';
    });
    box.innerHTML = h;
    box.hidden = false;
    placePop();
  }
  function runResult(i) {
    const c = RES[i];
    if (!c) return;
    if (c.keep) { clearSearch(); }
    Promise.resolve(c.run()).then(() => { if (popOpen() && searchQuery()) renderResults(); });
  }
  function onSearchKey(e) {
    const q = e.target.closest && e.target.closest('.m9-q');
    if (!q) return false;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!RES.length) return true;
      resI = (resI + (e.key === 'ArrowDown' ? 1 : -1) + RES.length) % RES.length;
      for (const r of pop.querySelectorAll('.m9-res')) r.classList.toggle('kb', Number(r.dataset.ri) === resI);
      const el = pop.querySelector('.m9-res.kb'); if (el) el.scrollIntoView({ block: 'nearest' });
      return true;
    }
    if (e.key === 'Enter') { e.preventDefault(); runResult(resI); return true; }
    if (e.key === 'Escape') { e.preventDefault(); if (sub && !sub.hidden) closeSub(); else if (q.value) { q.value = ''; renderResults(); } else hidePop(); return true; }
    return false;
  }

  /* ---------- ブロックのメニュー（Notion の ⋮⋮ メニューを ²⁶ に統合） ----------
   *   ブロックの左の ⋮⋮ を押す・ブロックを選ぶ・「…」を押すと出る Notion のメニューを見えなくして、
   *   同じ場所に ²⁶ のメニューを出す。Notion の項目（複製・移動・削除・AI など）は ²⁶ から押せる。
   *   種類の変更・色・移動・AI のように続きの画面がある項目は、Notion の画面をそのまま出す。 */
  const BLK_JA = {
    arrowSquarePathUpDown: ['ブロックの種類を変える', 'てんかん へんかん しゅるい みだし turn into'],
    blockColor: ['ブロックの色', 'いろ からー color ぶろっくのいろ'],
    link: ['ブロックへのリンクをコピー', 'りんく こぴー copy link url'],
    duplicate: ['複製', 'ふくせい こぴー ふたつ duplicate'],
    arrowTurnUpRight: ['別のページへ移動', 'いどう move to'],
    trash: ['削除', 'さくじょ けす delete remove'],
    commentFilled: ['コメント', 'こめんと comment'],
    commentPencil: ['編集を提案', 'ていあん へんしゅう suggest edits'],
    aiFace: ['AI に質問', 'えーあい しつもん ask ai'],
    paperBolt: ['スキル（AI）', 'すきる skills えーあい']
  };
  const BM = { dialog: null, opts: [] };
  function nativeBlockMenu() {
    const ds = [...document.querySelectorAll('[role="dialog"]')].filter((d) => !d.closest('.c26-ui') && d.querySelector('[role="option"] svg.duplicate') && d.querySelector('[role="option"] svg.trash'));
    return ds[ds.length - 1] || null;
  }
  function readBlockOptions(d) {
    const out = [];
    let lastGroup = null;
    for (const o of d.querySelectorAll('[role="option"]')) {
      const svg = o.querySelector('svg');
      const cls = svg ? ([...svg.classList].find((c) => !/^x[0-9a-z]{4,}$/.test(c) && c !== 'directional-icon') || '') : '';
      const labEl = o.querySelector('[role="presentation"]') || o;
      const en = (labEl.textContent || '').trim();
      if (!en) continue;
      /* Notion の「Quote size」は ²⁶ の「引用」パネルと重なるので出さない */
      if (/quote\s*size|引用.{0,4}(サイズ|大きさ)/i.test(en) || /quote\s*size/i.test(o.textContent || '')) continue;
      const scEl = [...o.querySelectorAll('span')].find((s) => /[⌘⌃⇧⌥]|Del/.test(s.textContent || ''));
      const ja = BLK_JA[cls];
      const grp = o.closest('[role="listbox"] > div') || o.parentElement;
      out.push({ el: o, cls, en, ja: ja ? ja[0] : en, kw: ja ? ja[1] : '', sc: scEl ? scEl.textContent.trim() : '', svg: svg ? svg.outerHTML : '', dialog: o.getAttribute('aria-haspopup') === 'dialog' || /^(commentFilled|commentPencil|aiFace|paperBolt|arrowTurnUpRight)$/.test(cls), sep: !!(lastGroup && grp !== lastGroup) });
      lastGroup = grp;
    }
    return out;
  }
  function readMeta(d) {
    return [...d.querySelectorAll('div[style*="margin-top: 4px"][style*="margin-bottom: 4px"]')].map((x) => (x.textContent || '').trim()).filter(Boolean);
  }
  /* どのブロックが選ばれているか（Notion の青い枠 → 最後にマウスを乗せたブロック） */
  let hoverBlock = null;
  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    if (!t || !t.closest || t.closest('.c26-ui')) return;
    const b = t.closest(CONTENT + ' [data-block-id]');
    if (b) hoverBlock = b;
  }, true);
  function selectedBlocks() {
    const out = [];
    for (const h of document.querySelectorAll('.notion-selectable-halo')) {
      const b = h.closest('[data-block-id]');
      if (b && b.closest(CONTENT) && !out.includes(b)) out.push(b);
    }
    if (!out.length && hoverBlock && hoverBlock.isConnected) {
      let b = hoverBlock;
      while (b && !typeOfBlock(b)) b = b.parentElement && b.parentElement.closest('[data-block-id]');
      if (b) out.push(b);
    }
    return out.filter((b) => !out.some((o) => o !== b && o.contains(b)));
  }
  function setMode(m) {
    if (!pop) return;
    const bm = m === 'block';
    pop.classList.toggle('m9-bmode', bm);
    pop.querySelector('.m9-body-blk').hidden = !bm;
    pop.querySelector('.m9-body-text').hidden = bm;
    for (const el of pop.querySelectorAll('.m9-foot [data-n="comment"], .m9-foot [data-a="paint"]')) el.hidden = bm;
    if (!bm) { BM.opts = []; document.documentElement.removeAttribute('data-c26-bm'); }
  }
  function renderBlockOpts() {
    const box = pop.querySelector('.m9-bopts');
    let h = '';
    if (!BM.opts.length) h = '<div class="m9-note" style="margin:4px 6px 6px">Notion のブロックのメニューが見つかりませんでした。段落の設定はここから使えます。</div>';
    BM.opts.forEach((o, i) => {
      if (o.sep) h += '<div class="m9-div"></div>';
      h += '<button class="m9-row m9-bo" data-bo="' + i + '" title="' + esc(o.en) + '"><span class="m9-ic m9-ic-n">' + o.svg + '</span><span class="m9-lab">' + esc(o.ja) + '</span>' + (o.sc ? '<span class="m9-sc">' + esc(o.sc) + '</span>' : (o.dialog ? ICO.chev : '')) + '</button>';
    });
    box.innerHTML = h;
    const meta = BM.dialog ? readMeta(BM.dialog) : [];
    const me = pop.querySelector('.m9-meta');
    me.innerHTML = meta.map((t) => '<div>' + esc(t.replace(/^Last edited by/, '最終編集:').replace(/^Today at/, '今日').replace(/(\d+) words, (\d+) characters/, '$1 語・$2 文字')) + '</div>').join('');
    me.hidden = !meta.length;
  }
  function openBlockMode(d) {
    if (!pop) buildPop();
    const fromText = popOpen() && snap && snap.parts.length && !pop.classList.contains('m9-bmode');
    closeSub(); clearSearch(); unghost();
    BM.dialog = d;
    BM.opts = d ? readBlockOptions(d) : [];
    if (d) document.documentElement.setAttribute('data-c26-bm', '1');
    if (!fromText) {
      const blocks = selectedBlocks();
      if (blocks.length) {
        const lf = leavesOfBlock(blocks[0])[0] || blocks[0].querySelector(LEAF);
        snap = { parts: [], leaf: lf || null, rect: blocks[0].getBoundingClientRect(), blockEls: blocks };
      } else if (!snap) snap = { parts: [], leaf: null, rect: null };
    } else {
      /* 文字を選んでいた時は、その文字の段落（コールアウトの中ならコールアウト）を対象に */
      const t = styleTarget();
      snap = Object.assign({}, snap, { blockEls: t ? [t.el] : null });
    }
    pop.hidden = false;
    setMode('block');
    renderBlockOpts();
    document.documentElement.setAttribute('data-c26-bar', '1');
    refreshPop();
    /* 置き場所: Notion のメニューがあった所 */
    const r = d ? d.getBoundingClientRect() : null;
    if (r && (r.width || r.height)) {
      const w = pop.offsetWidth, h = pop.offsetHeight;
      pop.style.left = Math.round(Math.max(8, Math.min(r.left, innerWidth - w - 8))) + 'px';
      pop.style.top = Math.round(Math.max(8, Math.min(r.top, innerHeight - h - 8))) + 'px';
    } else placePop();
    for (const ms of [0, 80, 220]) setTimeout(() => { const q = pop.querySelector('.m9-q'); if (q && popOpen() && pop.classList.contains('m9-bmode') && document.activeElement !== q) q.focus({ preventScroll: true }); }, ms);
  }
  function runBlockOpt(o) {
    if (!o || !o.el || !o.el.isConnected) { toast('Notion のメニューが閉じています。もう一度開いてください'); hidePop(); return; }
    if (o.dialog) {
      /* 続きの画面がある項目: Notion のメニューを見せて、その項目を押す（²⁶ は下がる） */
      document.documentElement.classList.add('c26-native');
      hidePop(true);
      press(o.el);
      return;
    }
    hidePop(true);
    press(o.el);
  }
  function closeNativeBlockMenu(d) {
    const t = d.querySelector('input') || d;
    const o = { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true, cancelable: true, composed: true };
    PRESSING++;
    try { t.dispatchEvent(mkEvent('KeyboardEvent', 'keydown', o)); } catch (e) { /* noop */ } finally { PRESSING--; }
  }
  /* Notion のメニューの出入りを見張る（重くならないよう、ポップアップの入れ物だけを見る） */
  function onOverlay() {
    const d = nativeBlockMenu();
    const de = document.documentElement;
    if (d && d !== BM.dialog) {
      if ((PREFS.mode || 'dock') === 'off' || de.classList.contains('c26-native')) return;
      openBlockMode(d);
    } else if (d && d === BM.dialog && popOpen() && pop.classList.contains('m9-bmode')) {
      const n = d.querySelectorAll('[role="option"]').length;
      if (n !== BM.opts.length) { BM.opts = readBlockOptions(d); renderBlockOpts(); }
    } else if (!d && BM.dialog) {
      BM.dialog = null;
      de.classList.remove('c26-native');
      de.removeAttribute('data-c26-bm');
      if (popOpen() && pop.classList.contains('m9-bmode')) hidePop(true);
    }
  }
  let ovObs = null, ovRoot = null, ovRaf = 0;
  function watchOverlay() {
    const root = document.querySelector('.notion-overlay-container') || document.body;
    if (!root || root === ovRoot) return;
    if (ovObs) ovObs.disconnect();
    ovRoot = root;
    ovObs = new MutationObserver(() => {
      /* 出た瞬間（描かれる前）に隠す。中身の更新はまとめて */
      const d = nativeBlockMenu();
      if (d && d !== BM.dialog) { onOverlay(); return; }
      if (!ovRaf) ovRaf = requestAnimationFrame(() => { ovRaf = 0; onOverlay(); });
    });
    ovObs.observe(root, { childList: true, subtree: true });
  }
  setInterval(() => { if (document.body && (!ovRoot || ovRoot === document.body || !ovRoot.isConnected)) watchOverlay(); }, 1500);

  /* ---------- ²⁹ Icon Library を開く（別のスクリプト。入っていなければ案内） ---------- */
  function openIconLibrary(btn) {
    const r = btn && btn.getBoundingClientRect ? btn.getBoundingClientRect() : null;
    const detail = { x: r ? Math.round(r.left) : null, y: r ? Math.round(r.bottom) : null };
    let ok = false;
    const onAck = () => { ok = true; };
    document.addEventListener('c29:ack', onAck, { once: true });
    document.dispatchEvent(new CustomEvent('c29:open', { detail: JSON.stringify(detail) }));
    setTimeout(() => { document.removeEventListener('c29:ack', onAck); if (!ok) toast('アイコンライブラリは「« No »　²⁹ _ Icon Library」を入れると使えます'); }, 250);
    if (popOpen()) hidePop(true);
  }

  /* ---------- 出し入れ ---------- */
  const popOpen = () => !!(pop && !pop.hidden);
  function showPop(s) {
    if (!pop) buildPop();
    try { syncToolButtons(); } catch (e) { /* noop */ }
    if (pop.classList.contains('m9-bmode')) setMode('text');
    if (s) {
      if (SESSION && keyOfSnap(s) !== SESSION.key) endSession();
      const changedTarget = !snap || keyOfSnap(s) !== keyOfSnap(snap) || s.leaf !== snap.leaf;
      snap = s;
      for (const p of s.parts) learnFromLeaf(p.leaf, p.bid);
      if (changedTarget) closeSub();
    }
    pop.hidden = false;
    document.documentElement.setAttribute('data-c26-bar', '1');
    markSelection();
    refreshPop();
    placePop();
    setTimeout(() => { if (popOpen()) { refreshPop(); placePop(); } }, 140);   // Notion の選択メニューが出てから状態（太字など）を読む
  }
  function hidePop(keepNative) {
    if (!pop || pop.hidden) return;
    closeSub();
    endSession();
    unghost();
    clearSearch();
    /* ブロックのメニューから開いていたら、隠してある Notion のメニューも閉じる */
    if (pop.classList.contains('m9-bmode')) {
      setMode('text');
      if (!keepNative && BM.dialog && BM.dialog.isConnected) closeNativeBlockMenu(BM.dialog);
    }
    pop.hidden = true;
    document.documentElement.removeAttribute('data-c26-bar');
    snap = null;
    markSelection();
  }
  function checkSelection(force) {
    const s = snapshot(true);
    if (!s) { if (force) showPop({ parts: [], leaf: null, rect: null }); return; }
    if (!s.parts.length && !force) return;
    if ((PREFS.mode || 'dock') === 'off' && !force) return;
    /* ブロックのメニューが開いている間は、文字のメニューに切り替えない */
    if (!force && (BM.dialog || nativeBlockMenu())) return;
    document.documentElement.classList.remove('c26-native');
    showPop(s);
    if (PAINT && s.parts.length) pastePaint();
  }
  document.addEventListener('mouseup', (e) => {
    if (e.button !== 0 || scrub || PRESSING) return;
    if (e.target && e.target.closest && e.target.closest('.c26-ui, .c26-panel, [style*="--c-popBac"], [role="dialog"], [role="menu"]')) return;
    setTimeout(() => checkSelection(false), 0);
  }, true);
  window.addEventListener('keydown', (e) => {
    if (PRESSING) return;   // ²⁶ 自身が Notion に送ったキー
    if (e.ctrlKey && e.altKey && !e.metaKey && e.code === 'KeyF') { e.preventDefault(); e.stopPropagation(); if (popOpen()) hidePop(); else checkSelection(true); return; }
    if (e.ctrlKey && e.altKey && !e.metaKey && e.code === 'KeyS') { e.preventDefault(); e.stopPropagation(); hidePop(); openPanel(); return; }
    if (e.key === 'Escape' && PAINT) { endPaint(); toast('書式のコピーをやめました'); }
    if (e.key === 'Escape') {
      if (popOpen()) {
        e.stopPropagation(); e.preventDefault();
        if (!sub.hidden) closeSub(); else hidePop();
        return;
      }
      if (panel) closePanel();
      return;
    }
    if (popOpen() && (subKind === 'font' || subKind === 'pfont') && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      const items = [...sub.querySelectorAll('.c26-m-item[data-v]')].filter((x) => !x.hidden);
      if (items.length) {
        e.preventDefault(); e.stopPropagation();
        let i = items.findIndex((x) => x.classList.contains('kb'));
        if (i < 0) i = items.findIndex((x) => x.classList.contains('on'));
        if (e.key === 'Enter') { const it = items[Math.max(0, i)]; if (it) setFont(it.dataset.v); return; }
        i = Math.max(0, Math.min(items.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)));
        for (const x of items) x.classList.remove('kb');
        items[i].classList.add('kb');
        items[i].scrollIntoView({ block: 'nearest' });
        items[i].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        return;
      }
    }
    if (popOpen() && (inMenu(e.target) || (e.target && e.target.isConnected === false))) return;
    if (['Shift', 'Meta', 'Control', 'Alt', 'CapsLock'].includes(e.key)) return;
    /* ⇧＋矢印で選択を広げた時は付いていく。それ以外のキー（入力など）では閉じる */
    if (e.shiftKey && /^Arrow|^Home$|^End$/.test(e.key)) { setTimeout(() => checkSelection(false), 0); return; }
    if (popOpen() && !e.metaKey && !e.ctrlKey) hidePop();
    else if (popOpen() && (e.metaKey || e.ctrlKey)) setTimeout(refreshPop, 160);
  }, true);

  /* ============================================================
   *  ブロック単位の書式（段落・見出し・引用・コールアウト…）
   * ============================================================ */
  const FIELDS = [
    { k: 'ff', label: '書体', type: 'font' },
    { k: 'fs', label: '大きさ', type: 'num', min: 8, max: 96, step: 0.5, unit: 'px' },
    { k: 'fw', label: '太さ', type: 'select', opts: [['', '変えない']].concat(WEIGHTS.map(([w, t]) => [String(w), w + ' ' + t])) },
    { k: 'it', label: '斜体', type: 'select', opts: [['', '変えない'], ['italic', '斜体'], ['normal', '立体']] },
    { k: 'ls', label: '字間', type: 'num', min: -0.1, max: 0.5, step: 0.01, unit: 'em' },
    { k: 'lh', label: '行高', type: 'num', min: 1, max: 3.5, step: 0.05, unit: '' },
    { k: 'sp', label: '段落の間隔', type: 'num', min: 0, max: 48, step: 1, unit: 'px' },
    { k: 'col', label: '文字の色', type: 'color', opts: [['', '変えない'], ['text', '本文の色'], ['sec', '薄い本文色'], ['custom', '指定…']] },
    { k: 'bg', label: '背景', type: 'color', opts: [['', '変えない'], ['none', 'なし'], ['custom', '指定…']] },
    { k: 'ul', label: '下線', type: 'select', opts: [['', '変えない'], ['none', '消す'], ['underline', '付ける']] }
  ];
  const CALLOUT_FIELDS = [
    { k: 'cbg', label: '枠の背景', type: 'color', opts: [['', '変えない'], ['none', 'なし'], ['custom', '指定…']] },
    { k: 'cbd', label: '枠線', type: 'select', opts: [['', '変えない'], ['none', 'なし'], ['hair', '細線'], ['left', '左線だけ']] },
    { k: 'crad', label: '角の丸み', type: 'num', min: 0, max: 24, step: 1, unit: 'px' },
    { k: 'cpad', label: '内側の余白', type: 'num', min: 0, max: 40, step: 1, unit: 'px' },
    { k: 'cicon', label: 'アイコン', type: 'select', opts: [['', '変えない'], ['hide', '隠す']] }
  ];
  const QUOTE_FIELDS = [
    { k: 'qbar', label: '左線の太さ', type: 'num', min: 0, max: 8, step: 0.5, unit: 'px' },
    { k: 'qbarc', label: '左線の色', type: 'color', opts: [['', '変えない'], ['sec', '薄い本文色'], ['custom', '指定…']] },
    { k: 'qpad', label: '線と文字の間', type: 'num', min: 0, max: 40, step: 1, unit: 'px' }
  ];
  const BLOCK_TYPES = [
    ['all', '本文すべて', ''],
    ['text', '段落', '.notion-text-block'],
    ['h1', '見出し1', '.notion-header-block'],
    ['h2', '見出し2', '.notion-sub_header-block'],
    ['h3', '見出し3', '.notion-sub_sub_header-block'],
    ['quote', '引用', '.notion-quote-block'],
    ['callout', 'コールアウト', '.notion-callout-block'],
    ['bullet', '箇条書き', '.notion-bulleted_list-block'],
    ['number', '番号付き', '.notion-numbered_list-block'],
    ['toggle', 'トグル', '.notion-toggle-block'],
    ['todo', 'チェックボックス', '.notion-to_do-block'],
    ['title', 'ページタイトル', TITLE]
  ];
  const TYPE_SEL = Object.fromEntries(BLOCK_TYPES.map((b) => [b[0], b[2]]));
  const TYPE_LABEL = Object.fromEntries(BLOCK_TYPES.map((b) => [b[0], b[1]]));

  const q = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const colorOf = (v, hex) => v === 'text' ? 'var(--c-texPri, rgb(55,53,47))'
    : v === 'sec' ? 'var(--c-texSec, rgba(55,53,47,.65))'
    : v === 'custom' ? (hex || 'inherit') : '';
  function textDecl(st) {
    const d = [];
    if (st.ff && fontCss(st.ff)) d.push('font-family:' + fontCss(st.ff));
    if (st.fs !== undefined && st.fs !== '') d.push('font-size:' + st.fs + 'px');
    if (st.fw) d.push('font-weight:' + st.fw);
    if (st.it) d.push('font-style:' + st.it);
    if (st.ls !== undefined && st.ls !== '') d.push('letter-spacing:' + st.ls + 'em');
    if (st.lh !== undefined && st.lh !== '') d.push('line-height:' + st.lh);
    const c = colorOf(st.col, st.colHex);
    if (c) { d.push('color:' + c); d.push('fill:' + c); }
    if (st.bg === 'none') d.push('background:transparent', 'background-color:transparent', 'padding:0', 'box-shadow:none');
    else if (st.bg === 'custom' && st.bgHex) d.push('background:' + st.bgHex, 'background-color:' + st.bgHex);
    if (st.ul) d.push('text-decoration-line:' + st.ul, 'text-decoration:' + st.ul);
    /* 揃え: 両端揃えは、日本語 = 字と字の間で、英語 = 単語の間で揃える。行末の空白が邪魔をしないよう折り返し方も合わせる */
    if (st.ta) d.push('text-align:' + st.ta);
    if (st.ta === 'justify') d.push('text-justify:inter-character', 'white-space:pre-wrap', 'line-break:strict', 'text-align-last:start');
    if (st.hy) d.push('hyphens:auto', '-webkit-hyphens:auto', 'hyphenate-limit-chars:6 3 3', 'overflow-wrap:break-word', 'word-break:normal');
    /* 字下げ（1 行目）・左右のインデント（em = 本文の文字 1 つ分） */
    if (st.ti !== undefined && st.ti !== '') d.push('text-indent:' + st.ti + 'em');
    if (st.il !== undefined && st.il !== '') d.push('margin-inline-start:' + st.il + 'em');
    if (st.ir !== undefined && st.ir !== '') d.push('margin-inline-end:' + st.ir + 'em');
    /* 約物（、。「」など）の余白を詰める */
    if (st.palt) d.push('font-feature-settings:"palt" 1', 'font-kerning:normal', 'text-spacing-trim:trim-start');
    return d.map((x) => x + ' !important').join(';');
  }
  const ROOTS = ':is(.layout, .notion-peek-renderer, .notion-frame)';
  const pageScope = (id) => ROOTS + ':has([data-block-id="' + q(id) + '"] h1[aria-roledescription="page title"])';
  function blockRules(scope, blocks) {
    const out = [];
    for (const [type, st] of Object.entries(blocks || {})) {
      const sel = TYPE_SEL[type];
      if (type === 'title') out.push(...titleRules(scope + ' ' + TITLE, st));
      else if (type === 'all') {
        /* 本文すべて: 文字は全部の文字欄に、段落の間隔は全部のブロックに */
        out.push(...oneBlock(scope + ' ' + CONTENT, Object.assign({}, st, { sp: undefined, mt: undefined, mb: undefined, dk: undefined, dc: undefined }), 'all'));
        out.push(...marginRule(scope + ' ' + CONTENT + ' [data-block-id]', st));
      } else if (sel) out.push(...oneBlock(scope + ' ' + CONTENT + ' ' + sel, st, type));
    }
    return out;
  }
  function titleRules(base, st) {
    const decl = textDecl(st);
    if (!decl) return [];
    const inh = [];
    if (st.ff) inh.push('font-family:inherit !important');
    if (st.fs !== undefined && st.fs !== '') inh.push('font-size:inherit !important');
    if (st.fw) inh.push('font-weight:inherit !important');
    if (st.it) inh.push('font-style:inherit !important');
    if (st.ls !== undefined && st.ls !== '') inh.push('letter-spacing:inherit !important');
    if (st.lh !== undefined && st.lh !== '') inh.push('line-height:inherit !important');
    const out = [base + BOOST_T + '{' + decl + '}'];
    if (inh.length) out.push(base + ' *' + BOOST_T + '{' + inh.join(';') + '}');
    return out;
  }
  /* 段落の間隔 = ブロックの上下の余白（前後の合計が指定の値になる）。行高とは別 */
  const spRule = (sel, sp) => sel + BOOST + '{margin-top:' + (Number(sp) / 2) + 'px !important;margin-bottom:' + (Number(sp) / 2) + 'px !important;}';
  /* 段落の前・後を別々に（mt = 前、mb = 後。無ければ sp の半分ずつ） */
  const has = (v) => v !== undefined && v !== null && v !== '';
  function marginRule(sel, st) {
    const half = has(st.sp) ? Number(st.sp) / 2 : undefined;
    const mt = has(st.mt) ? Number(st.mt) : half, mb = has(st.mb) ? Number(st.mb) : half;
    const d = [];
    if (mt !== undefined) d.push('margin-top:' + mt + 'px !important');
    if (mb !== undefined) d.push('margin-bottom:' + mb + 'px !important');
    return d.length ? [sel + BOOST + '{' + d.join(';') + '}'] : [];
  }
  /* 段落の飾り（左線・背景・下線・枠）。色は Notion の 9 色 */
  function decoRules(base, st) {
    if (!st.dk) return [];
    const c = st.dcol && AB2[st.dcol] ? tVar(st.dcol) : 'var(--c-texSec, rgba(55,53,47,.65))';
    const bg = st.dcol && AB2[st.dcol] ? bVar(st.dcol) : 'var(--ca-graBacSecTra, rgba(55,53,47,.06))';
    const d = [];
    if (st.dk === 'bar') d.push('border-inline-start:3px solid ' + c, 'padding-inline-start:12px', 'border-radius:0');
    else if (st.dk === 'fill') d.push('background:' + bg, 'padding:4px 12px', 'border-radius:8px');
    else if (st.dk === 'barfill') d.push('border-inline-start:3px solid ' + c, 'background:' + bg, 'padding:4px 12px', 'border-radius:0 8px 8px 0');
    else if (st.dk === 'under') d.push('border-bottom:1px solid color-mix(in srgb, ' + c + ' 45%, transparent)', 'padding-bottom:4px');
    else if (st.dk === 'box') d.push('border:1px solid color-mix(in srgb, ' + c + ' 40%, transparent)', 'padding:6px 12px', 'border-radius:8px');
    else if (st.dk === 'grad') d.push('background:linear-gradient(90deg, ' + bg + ', transparent 85%)', 'padding:4px 12px', 'border-radius:8px 0 0 8px');
    return d.length ? [base + BOOST + '{' + d.map((x) => x + ' !important').join(';') + '}'] : [];
  }
  /* ドロップキャップ（段落の最初の 1 文字を n 行分の大きさに） */
  function dropCapRule(base, st) {
    const n = Number(st.dc);
    if (!n) return [];
    const lh = has(st.lh) ? Number(st.lh) : 1.5;
    const fs = Math.round((n * lh - (lh - 1) * 0.9) * 100) / 100;
    return [base + ' ' + LEAF + BOOST + '{display:flow-root !important;}', base + ' ' + LEAF + BOOST + '::first-letter{float:left !important;font-size:' + fs + 'em !important;line-height:1 !important;margin:.04em .12em 0 0 !important;font-weight:inherit;}'];
  }
  function oneBlock(base, st, type) {
    const out = [];
    if (type !== 'all') { out.push(...marginRule(base, st)); out.push(...decoRules(base, st)); out.push(...dropCapRule(base, st)); }
    const decl = textDecl(Object.assign({}, st, { bg: '' }));
    if (decl) out.push(base + ' ' + LEAF + BOOST + '{' + decl + '}');
    /* 行の高さ: 文字欄の中の飾りの要素（リンク・色・書式の枠など）が独自の行の高さを持っていても、段落の値に揃える */
    if (has(st.lh)) out.push(base + ' ' + LEAF + ' :not(sup):not(sub)' + BOOST + '{line-height:inherit !important}');
    if (st.bg === 'none' || (st.bg === 'custom' && st.bgHex)) out.push(base + ' ' + LEAF + BOOST + '{' + textDecl({ bg: st.bg, bgHex: st.bgHex }) + '}');
    out.push(...ruleRules(base, st));
    if (type === 'callout') out.push(...calloutRules(base, st));
    if (type === 'quote') out.push(...quoteRules(base, st));
    return out;
  }
  /* ---------- コールアウト（面・枠・グラデーション・影・すりガラス・下線・アイコンのタイル／大きさ(px)／上下左右・見出しとして詰める） ----------
   *   DOM: .notion-callout-block > [role=note] > div（面） > [div（アイコン）, div（文字の列）] */
  const has2 = (v) => v !== undefined && v !== null && v !== '';
  const bPri = (c) => 'var(--c-' + AB2[c] + 'BacPri, ' + BG_HEX[c] + ')';
  const mix = (c, p) => 'color-mix(in srgb, ' + c + ' ' + p + '%, transparent)';
  /* アイコンの大きさ（px）。v12 までの % の設定は 24px を 100% として読み替える */
  function calloutIconPx(st) {
    if (has2(st.cipx)) return Number(st.cipx);
    if (has2(st.cisz)) return Math.round(24 * Number(st.cisz) / 100 * 10) / 10;
    return null;
  }
  function calloutRules(base, st) {
    const out = [];
    const B = base + ' > div > div:first-child';
    const IC = B + ' > div:first-child';
    const TX = B + ' > div:last-child';
    const imp = (arr) => arr.filter(Boolean).map((x) => x + ' !important').join(';');
    const d = [];
    if (st.cacc && AB2[st.cacc]) d.push('--c26-acc:' + tVar(st.cacc));
    if (st.cgc2 && AB2[st.cgc2]) d.push('--c26-acc2:' + tVar(st.cgc2));
    const acc = 'var(--c26-acc, var(--c26-cacc-auto, var(--c-texSec, #787774)))';
    const acc2 = 'var(--c26-acc2, ' + acc + ')';
    /* 背景色（下地） */
    if (st.cbg === 'none') d.push('background-color:transparent');
    else if (st.cbg === 'custom' && st.cbgHex) d.push('background-color:' + st.cbgHex);
    else if (st.cbg && AB2[st.cbg]) d.push('background-color:' + bPri(st.cbg));
    /* 重ねる層（グラデーション・すりガラスの光） */
    const gi = has2(st.cgi) ? Number(st.cgi) : 16;
    const layers = [];
    if (st.cglass) layers.push('linear-gradient(135deg, rgba(255,255,255,.55), rgba(255,255,255,.08) 60%)');
    if (st.cgrad === 'h') layers.push('linear-gradient(90deg, ' + mix(acc, gi) + ', ' + mix(acc2, gi / 2) + ' 55%, transparent 100%)');
    else if (st.cgrad === 'd') layers.push('linear-gradient(135deg, ' + mix(acc, gi) + ', ' + mix(acc2, gi * 0.6) + ' 50%, transparent 100%)');
    else if (st.cgrad === 'v') layers.push('linear-gradient(180deg, ' + mix(acc, gi) + ', transparent 100%)');
    else if (st.cgrad === 'r') layers.push('radial-gradient(120% 160% at 0% 0%, ' + mix(acc, gi * 1.2) + ', transparent 62%)');
    else if (st.cgrad === 'mesh') layers.push('radial-gradient(70% 140% at 0% 0%, ' + mix(acc, gi * 1.25) + ', transparent 60%)', 'radial-gradient(60% 140% at 100% 100%, ' + mix(acc2, gi * 1.1) + ', transparent 62%)', 'radial-gradient(50% 90% at 70% 0%, ' + mix(acc2, gi * 0.5) + ', transparent 70%)');
    if (layers.length) d.push('background-image:' + layers.join(', '));
    else if (st.cbg) d.push('background-image:none');
    if (st.cglass) d.push('backdrop-filter:blur(14px) saturate(1.4)', '-webkit-backdrop-filter:blur(14px) saturate(1.4)');
    /* 枠 */
    const bw = has2(st.cbw) ? Number(st.cbw) : null;
    const rad = has2(st.crad) ? Number(st.crad) : null;
    const pseudo = st.cbd === 'grad' || st.cbd === 'gleft';
    if (st.cbd === 'none') d.push('border-color:transparent');
    else if (st.cbd === 'hair') d.push('border:' + (bw || 1) + 'px solid ' + mix('currentColor', 12));
    else if (st.cbd === 'ring') d.push('border:' + (bw || 1) + 'px solid ' + mix(acc, 42));
    else if (st.cbd === 'left') d.push('border:0', 'border-inline-start:' + (bw || 3) + 'px solid ' + acc, 'border-radius:0 ' + (rad ?? 10) + 'px ' + (rad ?? 10) + 'px 0');
    else if (pseudo) d.push('border-color:transparent', 'position:relative');
    else if (st.cglass) d.push('border:1px solid rgba(255,255,255,.55)');
    if (has2(st.crad) && st.cbd !== 'left') d.push('border-radius:' + st.crad + 'px');
    if (st.cbd === 'gleft' && !has2(st.crad)) d.push('border-radius:0 10px 10px 0');
    /* 影 */
    const sh = [];
    if (st.cglass) sh.push('inset 0 1px 0 rgba(255,255,255,.6)', '0 8px 28px -14px rgba(15,15,15,.28)');
    if (st.csh === 'soft') sh.push('0 1px 2px rgba(15,15,15,.05)', '0 6px 18px -8px rgba(15,15,15,.16)');
    else if (st.csh === 'float') sh.push('0 2px 4px rgba(15,15,15,.05)', '0 14px 30px -12px rgba(15,15,15,.30)');
    else if (st.csh === 'glow') sh.push('0 0 0 1px ' + mix(acc, 16), '0 10px 30px -10px ' + mix(acc, 60));
    if (sh.length) d.push('box-shadow:' + sh.join(', '));
    else if (st.cbd) d.push('box-shadow:none');
    /* 余白（上下 = cpad・左右 = cpx） */
    const pv = has2(st.cpad) ? Number(st.cpad) : (st.chead ? 10 : null);
    const ph = has2(st.cpx) ? Number(st.cpx) : (has2(st.cpad) ? Number(st.cpad) : (st.chead ? 12 : null));
    if (pv !== null || ph !== null) {
      const v = pv !== null ? pv : 12, h = ph !== null ? ph : 12;
      d.push('padding:' + v + 'px ' + (st.chead ? Math.max(h, 16) : h) + 'px ' + v + 'px ' + h + 'px');
    }
    if (st.chead) d.push('align-items:center');
    else if (st.calign === 'center') d.push('align-items:center');
    if (Number(st.cline) > 0) d.push('position:relative');
    if (d.length) out.push(B + BOOST + '{' + imp(d) + '}');
    /* グラデーションの枠・左線（::before） */
    if (st.cbd === 'grad') out.push(B + BOOST + '::before{content:"" !important;position:absolute !important;inset:-1px !important;border-radius:inherit !important;padding:' + (bw || 1.25) + 'px !important;background:linear-gradient(135deg, ' + acc + ', ' + mix(acc2, 70) + ' 45%, ' + mix(acc, 20) + ') !important;-webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;-webkit-mask-composite:xor !important;mask-composite:exclude !important;pointer-events:none !important}');
    if (st.cbd === 'gleft') out.push(B + BOOST + '::before{content:"" !important;position:absolute !important;left:-1px !important;top:-1px !important;bottom:-1px !important;width:' + (bw || 3) + 'px !important;border-radius:' + (bw || 3) + 'px !important;background:linear-gradient(180deg, ' + acc + ', ' + mix(acc2, 55) + ' 60%, ' + mix(acc2, 10) + ') !important;pointer-events:none !important}');
    /* アイコンの大きさ・位置 */
    const sz = calloutIconPx(st);
    const tile = st.cicon !== 'hide' && st.ctile ? st.ctile : '';
    const tp = has2(st.ctpad) ? Number(st.ctpad) : 5;
    const gap = has2(st.cgap) ? Number(st.cgap) : (st.chead ? 12 : null);
    /* 下線（文字の頭から） */
    if (Number(st.cline) > 0) {
      const pad = ph !== null ? ph : 12;
      const vb = pv !== null ? pv : 12;
      const iw = st.cicon === 'hide' ? 0 : (sz || 24) + (tile ? tp * 2 : 0) + (Number(st.cix) || 0);
      const left = Math.round(pad + iw + (gap !== null ? gap : 8) + (st.chead ? 0 : 8));
      const lw = Number(st.cline);
      let bg;
      if (st.cls === 'full') bg = 'linear-gradient(90deg, ' + acc + ', ' + acc2 + ')';
      else if (st.cls === 'short') bg = 'linear-gradient(90deg, ' + acc + ', ' + acc2 + ') 0 0 / 44px 100% no-repeat';
      else if (st.cls === 'dot') bg = 'radial-gradient(circle, ' + mix(acc, 70) + ' ' + (lw / 2) + 'px, transparent ' + (lw / 2 + 0.6) + 'px) 0 50% / ' + (lw * 3.5) + 'px 100% repeat-x';
      else bg = 'linear-gradient(90deg, ' + mix(acc, 65) + ' 0%, ' + mix(acc2, 22) + ' 55%, transparent 100%)';
      out.push(B + BOOST + '::after{content:"" !important;position:absolute !important;left:' + left + 'px !important;right:' + (st.cls === 'short' ? 'auto' : Math.max(pad, 8) + 'px') + ' !important;' + (st.cls === 'short' ? 'width:44px !important;' : '') + 'bottom:' + Math.max(2, vb - 3) + 'px !important;height:' + lw + 'px !important;border-radius:' + lw + 'px !important;pointer-events:none !important;background:' + bg + ' !important}');
    }
    if (has2(st.cpy)) out.push(base + BOOST + '{' + imp(['padding-top:' + st.cpy + 'px', 'padding-bottom:' + st.cpy + 'px']) + '}');
    if (st.cicon === 'hide') out.push(IC + BOOST + '{display:none !important}');
    else {
      const ic = [];
      if (gap !== null) ic.push('margin-inline-end:' + (st.chead ? gap : gap - 8) + 'px');
      if (has2(st.cix)) ic.push('margin-inline-start:' + Number(st.cix) + 'px');
      if (st.chead) ic.push('margin-top:0', 'display:flex', 'align-items:center');
      if (st.calign === 'center' || st.calign === 'end') ic.push('margin-top:0', 'align-self:' + (st.calign === 'end' ? 'flex-end' : 'center'));
      else if (st.calign === 'start') ic.push('align-self:flex-start');
      if (has2(st.ciy) && Number(st.ciy)) ic.push('translate:0 ' + (-Number(st.ciy)) + 'px');
      if (ic.length) out.push(IC + BOOST + '{' + imp(ic) + '}');
      const RI = IC + ' .notion-record-icon';
      if (sz) {
        out.push(RI + BOOST + '{' + imp(['width:' + sz + 'px', 'height:' + sz + 'px', 'min-width:' + sz + 'px', 'font-size:' + Math.round(sz * 0.85 * 10) / 10 + 'px', 'line-height:' + sz + 'px']) + '}');
        out.push(RI + ' > div, ' + RI + ' > div > div' + BOOST + '{' + imp(['width:' + sz + 'px', 'height:' + sz + 'px', 'display:flex', 'align-items:center', 'justify-content:center']) + '}');
        out.push(RI + ' :is(img, svg)' + BOOST + '{' + imp(['width:' + Math.round(sz * 0.888 * 10) / 10 + 'px', 'height:' + Math.round(sz * 0.888 * 10) / 10 + 'px', 'max-width:none']) + '}');
        out.push(RI + ' :is([role="img"], .notion-emoji)' + BOOST + '{' + imp(['font-size:' + Math.round(sz * 0.85 * 10) / 10 + 'px', 'line-height:1']) + '}');
      }
      if (tile) {
        const tr = has2(st.ctrad) ? Number(st.ctrad) : Math.max(4, Math.min(12, (rad ?? 10) - 2));
        const t = ['padding:' + tp + 'px', 'box-sizing:content-box', 'border-radius:' + tr + 'px'];
        if (tile === 'tint') t.push('background:' + mix(acc, 15));
        else if (tile === 'ring') t.push('background:' + mix(acc, 6), 'box-shadow:inset 0 0 0 1px ' + mix(acc, 38));
        else if (tile === 'solid') t.push('background:' + acc, 'box-shadow:0 1px 2px ' + mix(acc, 40));
        else if (tile === 'grad') t.push('background:linear-gradient(135deg, ' + acc + ', ' + acc2 + ')', 'box-shadow:0 2px 6px -1px ' + mix(acc, 45));
        else if (tile === 'glass') t.push('background:rgba(255,255,255,.6)', 'box-shadow:inset 0 0 0 1px rgba(255,255,255,.8), 0 2px 8px -2px rgba(15,15,15,.18)');
        out.push(RI + BOOST + '{' + imp(t) + '}');
        /* 色の付いたタイルでは、アイコン（Notion のアイコン・画像）を白く抜く */
        if (tile === 'solid' || tile === 'grad') out.push(RI + ' :is(img, svg)' + BOOST + '{filter:brightness(0) invert(1) !important}');
      }
    }
    /* 文字の色 */
    if (st.ctext === 'acc') out.push(TX + ' ' + LEAF + BOOST + '{color:' + acc + ' !important}');
    else if (st.ctext === 'sec') out.push(TX + ' ' + LEAF + BOOST + '{color:var(--c-texSec, rgba(55,53,47,.65)) !important}');
    else if (st.ctext === 'grad') out.push(TX + ' ' + LEAF + BOOST + '{background-image:linear-gradient(90deg, ' + acc + ', ' + acc2 + ') !important;-webkit-background-clip:text !important;background-clip:text !important;-webkit-text-fill-color:transparent !important;caret-color:' + acc + ' !important}');
    if (st.chead) {
      out.push(TX + BOOST + '{min-height:0 !important}');
      out.push(TX + ' > .notion-selectable > div' + BOOST + '{padding-top:0 !important;padding-bottom:0 !important;padding-inline:0 !important}');
    }
    return out;
  }
  /* ---------- 引用 ----------
   *   DOM: .notion-quote-block > blockquote > div（左線: border-inline-start） > 文字欄
   *   線の開始位置: 左右 = qx（線ごと動く）、上下 = qin（線の上と下を縮める。線は ::after で描き直す） */
  function quoteRules(base, st) {
    const out = [];
    const BAR = base + ' > blockquote > div:first-child';
    const imp = (arr) => arr.filter(Boolean).map((x) => x + ' !important').join(';');
    const c = st.qbarc && AB2[st.qbarc] ? tVar(st.qbarc) : (colorOf(st.qbarc, st.qbarcHex) || 'currentColor');
    const d = [];
    const w = has2(st.qbar) ? Number(st.qbar) : 3;
    const qs = st.qst || '';
    const drawn = (Number(st.qin) > 0 || st.qcap) && qs !== 'none';
    if (has2(st.qbar)) d.push('border-inline-start-width:' + st.qbar + 'px', 'border-left-width:' + st.qbar + 'px');
    if (qs === 'none' || drawn) d.push('border-inline-start-color:transparent', 'border-left-color:transparent', 'border-image:none');
    else if (qs === 'soft') d.push('border-inline-start-color:' + mix(c, 35), 'border-left-color:' + mix(c, 35));
    else if (qs === 'grad') d.push('border-image:linear-gradient(180deg, ' + c + ', ' + mix(c, 8) + ') 1');
    else if (qs === 'double') d.push('border-inline-start-style:double', 'border-left-style:double', 'border-inline-start-width:' + Math.max(4, w) + 'px');
    else if (qs === 'dash') d.push('border-inline-start-style:dashed', 'border-left-style:dashed');
    else if (st.qbarc) d.push('border-inline-start-color:' + c, 'border-left-color:' + c);
    if (has2(st.qx)) d.push('margin-inline-start:' + Number(st.qx) + 'px', 'width:calc(100% - ' + Number(st.qx) + 'px)');
    if (has2(st.qpad)) d.push('padding-inline-start:' + st.qpad + 'px');
    else if (st.qmark) d.push('padding-inline-start:34px');
    if (has2(st.qpy)) d.push('padding-top:' + st.qpy + 'px', 'padding-bottom:' + st.qpy + 'px');
    if (st.qbg === 'tint') d.push('background:' + mix(c, 7));
    else if (st.qbg === 'grad') d.push('background:linear-gradient(90deg, ' + mix(c, 10) + ', transparent 80%)');
    else if (st.qbg && AB2[st.qbg]) d.push('background:' + bPri(st.qbg));
    if (has2(st.qrad)) d.push('border-radius:' + st.qrad + 'px');
    else if (st.qbg) d.push('border-radius:' + (qs === 'none' ? 8 : 0) + 'px 8px 8px ' + (qs === 'none' ? 8 : 0) + 'px');
    if (st.qmark || drawn) d.push('position:relative');
    if (d.length) out.push(BAR + BOOST + '{' + imp(d) + '}');
    if (drawn) {
      const inset = Number(st.qin) || 0;
      let bg = c;
      if (qs === 'soft') bg = mix(c, 35);
      else if (qs === 'grad') bg = 'linear-gradient(180deg, ' + c + ', ' + mix(c, 10) + ')';
      else if (qs === 'double') bg = 'linear-gradient(90deg, ' + c + ' 0 30%, transparent 30% 70%, ' + c + ' 70%)';
      else if (qs === 'dash') bg = 'repeating-linear-gradient(180deg, ' + c + ' 0 6px, transparent 6px 10px)';
      const ww = qs === 'double' ? Math.max(4, w) : w;
      out.push(BAR + BOOST + '::after{content:"" !important;position:absolute !important;left:' + (-ww) + 'px !important;top:' + inset + 'px !important;bottom:' + inset + 'px !important;width:' + ww + 'px !important;border-radius:' + (st.qcap ? ww : 0) + 'px !important;background:' + bg + ' !important;pointer-events:none !important}');
    }
    if (st.qmark) out.push(BAR + BOOST + '::before{content:"\\201C" !important;position:absolute !important;left:' + (qs === 'none' ? 2 : 8) + 'px !important;top:-.08em !important;font:400 2.6em/1 Georgia, "Times New Roman", serif !important;color:' + mix(c, 32) + ' !important;pointer-events:none !important}');
    if (st.qcol === 'sec') out.push(base + ' ' + LEAF + BOOST + '{color:var(--c-texSec, rgba(55,53,47,.65)) !important}');
    if (st.qit) out.push(base + ' ' + LEAF + BOOST + '{font-style:italic !important}');
    return out;
  }
  /* ---------- 罫線（ノート風）: 行の高さに合わせて線・点・方眼を敷く ---------- */
  function ruleRules(base, st) {
    if (!st.rule) return [];
    const c = st.rulec && AB2[st.rulec] ? mix(tVar(st.rulec), 34) : mix('currentColor', 14);
    let img, size = '';
    if (st.rule === 'line') img = 'repeating-linear-gradient(180deg, transparent 0 calc(1lh - 1px), ' + c + ' calc(1lh - 1px) 1lh)';
    else if (st.rule === 'dot') { img = 'radial-gradient(circle at 1px calc(1lh - 1px), ' + c + ' 0.9px, transparent 1.4px)'; size = 'background-size:7px 1lh !important;'; }
    else if (st.rule === 'grid') { img = 'repeating-linear-gradient(180deg, transparent 0 calc(1lh - 1px), ' + c + ' calc(1lh - 1px) 1lh), repeating-linear-gradient(90deg, transparent 0 calc(1lh - 1px), ' + c + ' calc(1lh - 1px) 1lh)'; }
    else return [];
    return [base + ' ' + LEAF + BOOST + '{background-image:' + img + ' !important;background-origin:content-box !important;background-clip:border-box !important;' + size + 'background-attachment:local !important}'];
  }
  function buildCss() {
    const out = ['/* ²⁶ Text Styles v' + VERSION + ' — ブロック単位（自動生成） */'];
    /* コールアウトの背景色からアクセント色（線・タイル）を自動で */
    for (const c of Object.keys(AB2)) out.push('.notion-callout-block > [role="note"] > div[style*="--c-' + AB2[c] + 'Bac"]{--c26-cacc-auto:' + tVar(c) + '}');
    out.push(...blockRules(ROOTS, DB.global.blocks));
    /* 段落スタイル: 種類ごとの設定より強く、「この段落だけ」より弱い */
    for (const [bid, sid] of Object.entries(DB.passign || {})) {
      const ps = DB.pstyles && DB.pstyles[sid];
      if (!ps) continue;
      const base = ROOTS + ' ' + CONTENT + ' ' + ('[data-block-id="' + q(bid) + '"]').repeat(4);
      out.push(...oneBlock(base, ps.st || {}, ps.type || ''));
      if (ps.inner) out.push(...oneBlock(base + ' :is(.notion-text-block, .notion-header-block, .notion-sub_header-block, .notion-sub_sub_header-block)', ps.inner, 'text'));
    }
    for (const [id, p] of Object.entries(DB.pages)) {
      const sc = pageScope(id);
      out.push(...blockRules(sc, p.blocks));
      /* 「この段落だけ」: 段落スタイルより強く（属性を 2 回重ねる） */
      for (const [bid, st] of Object.entries(p.only || {})) out.push(...oneBlock(sc + ' ' + CONTENT + ' ' + ('[data-block-id="' + q(bid) + '"]').repeat(2), st, st.__type || ''));
    }
    return out.join('\n');
  }
  function writeCss() {
    let st = document.getElementById(STYLE_ID);
    if (!st) { st = document.createElement('style'); st.id = STYLE_ID; (document.head || document.documentElement).appendChild(st); }
    const css = buildCss();
    if (st.textContent !== css) st.textContent = css;
  }

  /* 今のページ・今のブロック */
  const layoutOf = (el) => (el && el.closest ? (el.closest('.layout') || el.closest('.notion-peek-renderer') || el.closest('.notion-frame')) : null);
  function pageIdOf(layout) {
    const h = layout && layout.querySelector('h1[aria-roledescription="page title"]');
    const b = h && h.closest('[data-block-id]');
    return b ? b.getAttribute('data-block-id') : '';
  }
  function pageTitleOf(layout) {
    const h = layout && layout.querySelector('h1[aria-roledescription="page title"]');
    return h ? String(h.textContent || '').trim() : '';
  }
  function activeLayout() {
    const lf = caretLeaf();
    const fromSel = lf ? layoutOf(lf) : null;
    if (fromSel) return fromSel;
    const peek = document.querySelector('.notion-peek-renderer .layout');
    if (peek && peek.querySelector(CONTENT)) return peek;
    for (const l of document.querySelectorAll('.notion-frame .layout')) if (l.querySelector(CONTENT)) return l;
    return null;
  }
  const typeOfBlock = (b) => { for (const [t, , sel] of BLOCK_TYPES) if (sel && t !== 'title' && b.matches(sel)) return t; return ''; };
  /* カーソルを置いた文字欄を覚えるだけ（重い計算は、パネルやブロック設定を開いた時に 1 回だけ） */
  let lastLeaf = null;
  document.addEventListener('selectionchange', () => { const lf = caretLeaf(); if (lf) lastLeaf = lf; });
  /* その文字欄を含むブロックを内側から順に（段落 → コールアウト → トグル…） */
  function blockChain(leaf) {
    const out = [];
    if (!leaf || !leaf.isConnected) return out;
    const tt = leaf.closest(TITLE);
    if (tt) { const pid = pageIdOf(layoutOf(tt)); return pid ? [{ el: tt, id: pid, type: 'title' }] : out; }
    const content = leaf.closest(CONTENT);
    let b = leaf.closest('[data-block-id]');
    while (b && content && content.contains(b) && out.length < 4) {
      const t = typeOfBlock(b);
      if (t) out.push({ el: b, id: b.getAttribute('data-block-id'), type: t });
      b = b.parentElement ? b.parentElement.closest('[data-block-id]') : null;
    }
    return out;
  }
  function blockInfo(leaf) {
    const c = blockChain(leaf)[0];
    if (!c) return null;
    const own = leavesOfBlock(c.el)[0];
    return { id: c.id, type: c.type, pageId: pageIdOf(layoutOf(c.el)), text: String((own && own.textContent) || '').trim().slice(0, 24) };
  }

  /* ============================================================
   *  見た目（ポップアップ・パネル）
   * ============================================================ */
  /* メニューの見た目（Notion の色の変数をそのまま使う＝ライト／ダークに自動で合う） */
  function installMenuCss() {
    if (document.getElementById('c26-ui9')) return;
    const st = document.createElement('style');
    st.id = 'c26-ui9';
    st.textContent = `
/* Notion 本来の選択メニュー: 本文・タイトルを選んでいる間だけ見えなくする（「…」を押した時は見せる） */
html[data-c26-sel]:not(.c26-native) [style*="--c-popBac"]:has(svg.textBold):has(svg.textItalic) { opacity: 0 !important; pointer-events: none !important; }
.m9 {
  --m9-bg: var(--c-popBac, #fff); --m9-fg: var(--c-texPri, rgb(44,44,43)); --m9-sub: var(--c-texSec, rgba(55,53,47,.65));
  --m9-ter: var(--c-texTer, rgba(55,53,47,.45)); --m9-ico: var(--c-icoPri, rgba(55,53,47,.85)); --m9-ico2: var(--c-icoSec, rgba(55,53,47,.45));
  --m9-line: var(--ca-borSecTra, rgba(55,53,47,.09)); --m9-hov: color-mix(in srgb, var(--m9-fg) 6%, transparent);
  --m9-press: color-mix(in srgb, var(--m9-fg) 11%, transparent); --m9-field: color-mix(in srgb, var(--m9-fg) 4.5%, transparent);
  --m9-acc: var(--c-bluIcoAccPri, rgb(35,131,226)); --m9-acc-bg: color-mix(in srgb, var(--m9-acc) 11%, transparent);
  position: fixed; z-index: 2147483000; box-sizing: border-box; display: flex; flex-direction: column;
  background: var(--m9-bg); color: var(--m9-fg); border-radius: 14px; padding: 8px;
  box-shadow: var(--c-shaOutLg, 0 0 0 1px rgba(15,15,15,.05), 0 3px 6px rgba(15,15,15,.1), 0 9px 24px rgba(15,15,15,.2));
  font: 14px/1.2 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased; user-select: none; text-align: left;
}
.m9[hidden], .m9 [hidden] { display: none !important; }
.m9 * { box-sizing: border-box; }
.m9 svg { display: block; flex: 0 0 auto; }
#c26-menu { width: 224px; animation: m9in .12s ease-out; }
@keyframes m9in { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
.m9-search { padding: 0 0 6px; }
.m9-q { width: 100%; height: 28px; border: 0; border-radius: 6px; padding: 0 8px; outline: none; font: inherit; font-size: 13px; color: var(--m9-fg); background: var(--ca-bacSecTra, var(--m9-field)); box-shadow: var(--ca-borPriTra, rgba(55,53,47,.16)) 0 0 0 1px; user-select: text; }
.m9-q::placeholder { color: var(--m9-ter); }
.m9-q:focus { box-shadow: 0 0 0 1.5px var(--m9-acc); background: var(--m9-bg); }
.m9-results { max-height: 360px; overflow: auto; overscroll-behavior: contain; margin: 0 -2px; padding: 0 2px; }
.m9-searching .m9-body { display: none !important; }
.m9-searching > .m9-div { display: none; }
.m9-res.kb { background: var(--m9-hov); }
.m9-cat { flex: none; font-size: 10.5px; color: var(--m9-ter); background: var(--m9-field); border-radius: 4px; padding: 1px 5px; }
.m9-sc { flex: none; font-size: 12px; color: var(--m9-ter); white-space: nowrap; }
.m9-empty { font-size: 12.5px; color: var(--m9-ter); padding: 8px 6px; }
.m9-ic-n svg { width: 18px !important; height: 18px !important; fill: currentColor !important; }
.m9-mini-sw { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 5px; font-style: normal; font-size: 11px; font-weight: 600; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--m9-fg) 15%, transparent); }
#c26-menu.m9-bmode { width: 256px; }
.m9-meta { margin: 6px 6px 2px; font-size: 11.5px; line-height: 1.6; color: var(--m9-ter); }
.m9-meta[hidden] { display: none; }
.m9-body[hidden] { display: none; }
.m9, .m9-sub { transition: opacity .22s ease; }
.m9.m9-ghost { opacity: .14; transition: opacity .12s ease; }
.m9.m9-ghost:hover { opacity: .3; }
/* Notion のブロックのメニュー: ²⁶ が代わりに出ている間は見えなくする（続きの画面を出す時は見せる） */
html[data-c26-bm]:not(.c26-native) [role="dialog"]:has([role="option"] svg.duplicate):has([role="option"] svg.trash) { opacity: 0 !important; pointer-events: none !important; }
.m9-div { height: 1px; margin: 4px 8px; background: var(--m9-line); flex: none; }
.m9-row { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 8px; width: 100%; height: 28px; padding: 0 6px; border-radius: 6px; cursor: pointer; color: var(--m9-fg); font-size: 14px; white-space: nowrap; }
.m9-row:hover, .m9-row.open { background: var(--m9-hov); }
.m9-row:active { background: var(--m9-press); }
.m9-row[disabled] { opacity: .4; cursor: default; background: transparent; }
.m9-row[hidden] { display: none; }
.m9-ic { width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; color: var(--m9-ico); flex: none; }
.m9-ic svg { width: 18px; height: 18px; }
.m9-aa { font: 500 14px/1 "Hiragino Mincho ProN", Georgia, serif; }
.m9-lab { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.m9-lab.set { color: var(--m9-fg); }
.m9-val { flex: 0 1 auto; max-width: 84px; overflow: hidden; text-overflow: ellipsis; color: var(--m9-ter); font-size: 12px; }
.m9 .i-chev { width: 16px; height: 16px; color: var(--m9-ico2); flex: none; }
.m9-tools { display: flex; align-items: center; justify-content: space-between; padding: 0 2px; }
.m9-tools + .m9-tools { margin-top: 4px; }
.m9-tb { all: unset; box-sizing: border-box; width: 32px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--m9-ico); flex: none; }
.m9-tb svg { width: 20px; height: 20px; }
.m9-tb:hover { background: var(--m9-hov); }
.m9-tb:active { background: var(--m9-press); }
.m9-tb[aria-pressed="true"] { color: var(--m9-acc); background: var(--m9-acc-bg); }
.m9-tb:disabled { opacity: .3; cursor: default; background: transparent; }
.m9-tb.sm { width: 28px; }
.m9-tb.sm svg { width: 16px; height: 16px; }
.m9-tb.open { background: var(--m9-hov); }
.m9-A { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; font-size: 12px; font-weight: 500; box-shadow: inset 0 0 0 1px var(--ca-graBorPriTra, rgba(55,53,47,.16)); }
.m9-color.open { background: var(--m9-hov); }
.m9-mini input { width: 46px; height: 22px; border: 0; border-radius: 5px; outline: none; text-align: center; font: inherit; font-size: 13px; font-variant-numeric: tabular-nums; color: var(--m9-fg); background: var(--m9-field); cursor: text; user-select: text; }
.m9-mini input:focus { box-shadow: 0 0 0 1.5px var(--m9-acc); background: var(--m9-bg); }
.m9-mini.set input, .m9-num.set input { color: var(--m9-acc); }
.m9-foot { display: flex; align-items: center; gap: 2px; }
.m9-attools { display: flex; align-items: center; gap: 2px; padding: 0 2px; }
.m9-attools .m9-tb:not(.m9-atb) { width: 28px; }
.m9-attools .m9-atb { width: auto; padding: 0 10px 0 6px; gap: 6px; margin-right: auto; font-size: 13px; letter-spacing: .04em; font-family: "Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", serif; color: var(--m9-fg); }
.m9-attools .m9-atb svg { width: 16px; height: 16px; color: #2383e2; }
.m9-attools .m9-tb[aria-pressed="true"] { background: rgba(35,131,226,.12); color: #2383e2; }
.m9-foot .m9-cmt { flex: 1 1 auto; width: auto; }
.m9-busy { font-size: 11px; color: var(--m9-acc); white-space: nowrap; padding: 0 4px; }
#c26-menu.m9-nochar .m9-tools, #c26-menu.m9-nochar [data-sub="font"], #c26-menu.m9-nochar .m9-sizerow, #c26-menu.m9-nochar [data-sub="deco"], #c26-menu.m9-nochar [data-sub="tpl"], #c26-menu.m9-nochar .m9-cmt { opacity: .35; pointer-events: none; }

/* 横のパネル */
.m9-sub { width: 256px; padding: 6px 12px 12px; max-height: calc(100vh - 16px); overflow: auto; overscroll-behavior: contain; animation: m9in .12s ease-out; }
.m9-sub-color { width: 236px; }
.m9-sub-font { width: 300px; padding: 10px 6px 8px; display: flex; flex-direction: column; overflow: hidden; }
.m9-sub-blk, .m9-sub-pstyle { width: 300px; }
.m9-sub-para { width: 272px; }
.m9-h { font-size: 12px; font-weight: 500; color: var(--m9-sub); margin: 14px 2px 8px; }
.m9-sub > .m9-h:first-child { margin-top: 8px; }
.m9-grid { display: grid; grid-template-columns: repeat(5, 36px); gap: 8px; }
.m9-sw { all: unset; box-sizing: border-box; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer;
  font-size: 17px; font-weight: 500; background: var(--m9-bg); color: var(--m9-fg);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--sw-b, var(--m9-fg)) 26%, transparent); transition: transform .08s ease, box-shadow .08s ease; }
.m9-sw-b { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--sw-b, var(--m9-fg)) 20%, transparent); }
.m9-sw-b.m9-sw-def { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--m9-fg) 22%, transparent); }
.m9-sw:hover { transform: scale(1.06); }
.m9-sw.on { box-shadow: inset 0 0 0 2px var(--m9-fg); }
.m9-note { font-size: 11.5px; line-height: 1.55; color: var(--m9-ter); margin: 12px 2px 0; }
.m9-line { display: flex; align-items: center; gap: 8px; }
.m9-num { flex: 1 1 auto; display: flex; align-items: center; height: 28px; border-radius: 6px; background: var(--m9-field); padding: 0 2px 0 2px; cursor: text; }
.m9-num:focus-within { box-shadow: 0 0 0 1.5px var(--m9-acc); background: var(--m9-bg); }
.m9-nic { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--m9-ico2); cursor: ew-resize; flex: none; }
.m9-nic svg { width: 16px; height: 16px; }
.m9-num input { flex: 1 1 auto; min-width: 0; width: 0; border: 0; outline: none; background: transparent; font: inherit; font-size: 13px; font-variant-numeric: tabular-nums; color: var(--m9-fg); user-select: text; }
.m9-stp { display: flex; flex-direction: column; opacity: 0; transition: opacity .1s; }
.m9-num:hover .m9-stp, .m9-num:focus-within .m9-stp { opacity: 1; }
.m9-stp button { all: unset; width: 16px; height: 11px; line-height: 11px; font-size: 8px; text-align: center; color: var(--m9-ico2); cursor: pointer; border-radius: 3px; }
.m9-stp button:hover { color: var(--m9-fg); background: var(--m9-hov); }
.m9-link { all: unset; font-size: 12px; color: var(--m9-sub); cursor: pointer; padding: 5px 6px; border-radius: 5px; white-space: nowrap; }
.m9-link:hover { background: var(--m9-hov); color: var(--m9-fg); }
.m9-chips { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-top: 6px; }
.m9-chip { all: unset; box-sizing: border-box; height: 26px; border-radius: 6px; text-align: center; line-height: 26px; font-size: 12.5px; font-variant-numeric: tabular-nums; cursor: pointer; background: var(--m9-field); color: var(--m9-fg); }
.m9-chip:hover { background: var(--m9-hov); }
.m9-chip.on { background: var(--m9-acc-bg); color: var(--m9-acc); font-weight: 500; }
.m9-wts { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 4px; }
.m9-wt { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 8px; border-radius: 6px; cursor: pointer; }
.m9-wt:hover { background: var(--m9-hov); }
.m9-wt.on { background: var(--m9-acc-bg); }
.m9-wt b { width: 26px; font-size: 16px; font-weight: 400; }
.m9-wt span { font-size: 12px; color: var(--m9-sub); }
.m9-wt.on span { color: var(--m9-acc); }
.m9-seg { display: flex; gap: 2px; padding: 2px; border-radius: 8px; background: var(--m9-field); }
.m9-seg button { all: unset; flex: 1 1 0; height: 24px; line-height: 24px; text-align: center; border-radius: 6px; font-size: 12.5px; color: var(--m9-sub); cursor: pointer; white-space: nowrap; }
.m9-seg button:hover { color: var(--m9-fg); }
.m9-seg button[aria-pressed="true"] { background: var(--m9-bg); color: var(--m9-fg); box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 0 0 .5px rgba(0,0,0,.04); }
.m9-seg-ic button { display: flex; align-items: center; justify-content: center; }
.m9-seg-ic svg { width: 16px; height: 16px; }
.m9-chk { display: flex; align-items: center; gap: 6px; margin: 10px 2px 0; font-size: 12.5px; color: var(--m9-sub); cursor: pointer; }
.m9-chk input { margin: 0; accent-color: var(--m9-acc); }
.m9-pre { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.m9-pv { all: unset; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 7px 0 6px; border-radius: 8px; cursor: pointer; font-size: 11px; color: var(--m9-sub); }
.m9-pv:hover { background: var(--m9-hov); color: var(--m9-fg); }
.m9-pv i { position: relative; display: block; width: 58px; height: 26px; border-radius: 6px; background: var(--c-graBacPri, #f1f1ef); }
.m9-pv b { position: absolute; left: 6px; top: 8px; width: 10px; height: 10px; border-radius: 3px; background: color-mix(in srgb, var(--m9-fg) 55%, transparent); }
.m9-pv s { position: absolute; left: 21px; top: 11px; width: 28px; height: 4px; border-radius: 2px; background: color-mix(in srgb, var(--m9-fg) 30%, transparent); }
.m9-pv[class*="m9-pv-q-"] i { background: transparent; border-radius: 0; }
.m9-pv[class*="m9-pv-q-"] b { display: none; }
.m9-pv[class*="m9-pv-q-"] s { left: 10px; width: 40px; top: 11px; }
.m9-pv-q-std i { box-shadow: inset 3px 0 0 var(--m9-fg); }
.m9-pv-q-soft i { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--m9-fg) 30%, transparent); }
.m9-pv-q-tint i { box-shadow: inset 3px 0 0 var(--m9-fg); background: color-mix(in srgb, var(--m9-fg) 7%, transparent); border-radius: 0 6px 6px 0; }
.m9-pv-q-grad i { box-shadow: none; background: linear-gradient(180deg, var(--m9-fg), transparent) 0 0 / 3px 100% no-repeat; }
.m9-pv-q-mark i::before, .m9-pv-q-card i::before { content: "\\201C"; position: absolute; left: 1px; top: -4px; font: 22px/1 Georgia, serif; color: color-mix(in srgb, var(--m9-fg) 40%, transparent); }
.m9-pv-q-mark s, .m9-pv-q-card s { left: 16px; width: 34px; }
.m9-dot-none { background: repeating-conic-gradient(color-mix(in srgb, var(--m9-fg) 14%, transparent) 0 25%, transparent 0 50%) 0 0 / 8px 8px; }
.m9-cl3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; font-size: 10.5px; color: var(--m9-ter); text-align: center; margin-top: 3px; }
/* v13: コールアウト・引用のパネル */
.m9-sub-blk { width: 316px; }
.m9-tabs { display: flex; gap: 0; margin: 10px 0 2px; border-bottom: 1px solid color-mix(in srgb, var(--m9-fg) 9%, transparent); }
.m9-tabs button { all: unset; flex: 1 1 0; text-align: center; font-size: 12.5px; padding: 7px 0 6px; color: var(--m9-sub); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.m9-tabs button:hover { color: var(--m9-fg); }
.m9-tabs button[aria-pressed="true"] { color: var(--m9-fg); font-weight: 500; border-bottom-color: var(--m9-fg); }
.m9-bchips { grid-template-columns: repeat(4, 1fr); }
.m9-bchips .m9-chip { font-size: 12px; }
.m9-ln { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.m9-ln > span { font-size: 10.5px; color: var(--m9-ter); text-align: center; white-space: nowrap; }
.m9-g1 { display: grid; gap: 5px; }
.m9-g1 .m9-ln { flex-direction: row; align-items: center; }
.m9-g1 .m9-ln > span { order: -1; width: 62px; flex: 0 0 62px; text-align: left; font-size: 11.5px; color: var(--m9-sub); }
.m9-pos { display: grid; grid-template-columns: 84px 1fr; gap: 12px; align-items: center; }
.m9-pad { display: grid; grid-template-columns: repeat(3, 26px); grid-template-rows: repeat(3, 26px); gap: 2px; }
.m9-pad button { all: unset; box-sizing: border-box; display: grid; place-items: center; border-radius: 6px; font-size: 10px; color: var(--m9-sub); background: var(--m9-field); cursor: pointer; }
.m9-pad button:hover { background: var(--m9-hov); color: var(--m9-fg); }
.m9-pad button:active { background: var(--m9-press); }
.m9-pad button:nth-child(1) { grid-column: 2; grid-row: 1; }
.m9-pad button:nth-child(2) { grid-column: 1; grid-row: 2; }
.m9-pad button:nth-child(3) { grid-column: 2; grid-row: 2; font-size: 8px; color: var(--m9-ter); }
.m9-pad button:nth-child(4) { grid-column: 3; grid-row: 2; }
.m9-pad button:nth-child(5) { grid-column: 2; grid-row: 3; }
.m9-pre-c { grid-template-columns: repeat(3, 1fr); margin-top: 10px; }
/* プリセットの見本（--pa = アクセント、--pb = 2 色目） */
.m9-pv i { --pa: var(--c-bluTexSec, #337EA9); --pb: var(--c-purTexSec, #9065B0); overflow: hidden; }
.m9-pv u { display: none; position: absolute; left: 21px; right: 6px; bottom: 4px; height: 2px; border-radius: 2px; }
.m9-pv-c-head i { height: 20px; margin: 3px 0; border-radius: 7px; background: linear-gradient(90deg, color-mix(in srgb, var(--pa) 20%, var(--c-graBacPri, #f1f1ef)), var(--c-graBacPri, #f1f1ef)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--m9-fg) 10%, transparent); }
.m9-pv-c-head b { top: 4px; background: color-mix(in srgb, var(--pa) 70%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--pa) 18%, transparent); } .m9-pv-c-head s { top: 8px; }
.m9-pv-c-uline i { background: transparent; border-radius: 0; }
.m9-pv-c-uline b { background: color-mix(in srgb, var(--pa) 70%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--pa) 18%, transparent); }
.m9-pv-c-uline u { display: block; background: linear-gradient(90deg, var(--pa), var(--pb)); height: 1.5px; }
.m9-pv-c-gbar i { border-radius: 0 6px 6px 0; background: linear-gradient(90deg, color-mix(in srgb, var(--pa) 18%, transparent), transparent); }
.m9-pv-c-gbar i::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 3px; background: linear-gradient(180deg, var(--pa), color-mix(in srgb, var(--pb) 25%, transparent)); }
.m9-pv-c-grad i { border-radius: 8px; background: linear-gradient(135deg, color-mix(in srgb, var(--pa) 30%, transparent), color-mix(in srgb, var(--pb) 14%, transparent) 55%, transparent); }
.m9-pv-c-grad b, .m9-pv-c-mesh b { background: rgba(255,255,255,.85); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.m9-pv-c-mesh i { border-radius: 9px; background: radial-gradient(70% 140% at 0 0, color-mix(in srgb, var(--pa) 32%, transparent), transparent 60%), radial-gradient(60% 140% at 100% 100%, color-mix(in srgb, var(--pb) 30%, transparent), transparent 62%), var(--c-graBacPri, #f1f1ef); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--m9-fg) 8%, transparent); }
.m9-pv-c-gborder i { border-radius: 8px; background: linear-gradient(var(--m9-bg), var(--m9-bg)) padding-box, linear-gradient(135deg, var(--pa), var(--pb)) border-box; border: 1.5px solid transparent; box-sizing: border-box; }
.m9-pv-c-gborder b { left: 5px; top: 6.5px; background: color-mix(in srgb, var(--pa) 70%, transparent); } .m9-pv-c-gborder s { top: 9.5px; left: 20px; }
.m9-pv-c-glass i { border-radius: 8px; background: radial-gradient(120% 160% at 0 0, color-mix(in srgb, var(--pa) 26%, transparent), transparent 60%), linear-gradient(135deg, rgba(255,255,255,.7), rgba(255,255,255,.2)), var(--c-graBacPri, #f1f1ef); box-shadow: inset 0 1px 0 rgba(255,255,255,.8), inset 0 0 0 1px rgba(255,255,255,.6), 0 4px 10px -6px rgba(0,0,0,.3); }
.m9-pv-c-glass b { background: rgba(255,255,255,.9); box-shadow: 0 1px 3px rgba(0,0,0,.15); }
.m9-pv-c-glow i { border-radius: 8px; background: var(--m9-bg); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pa) 40%, transparent), 0 3px 10px -3px color-mix(in srgb, var(--pa) 60%, transparent); overflow: visible; }
.m9-pv-c-glow b { background: linear-gradient(135deg, var(--pa), var(--pb)); }
.m9-pv-c-pill i { height: 16px; margin: 5px 0; border-radius: 99px; }
.m9-pv-c-pill b { left: 3px; top: 3px; border-radius: 50%; background: var(--pa); } .m9-pv-c-pill s { top: 6px; left: 17px; width: 30px; }
.m9-pv-c-sticky i { border-radius: 2px; background: linear-gradient(180deg, color-mix(in srgb, var(--c-yelTexSec, #CB912F) 14%, var(--c-yelBacPri, #FBF3DB)), var(--c-yelBacPri, #FBF3DB)); box-shadow: 0 4px 8px -4px rgba(0,0,0,.35); overflow: visible; }
.m9-pv-c-card i { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--m9-fg) 10%, transparent), 0 3px 8px -4px rgba(0,0,0,.25); border-radius: 8px; background: var(--m9-bg); overflow: visible; }
.m9-pv-c-card b, .m9-pv-c-ring b { box-shadow: 0 0 0 2px color-mix(in srgb, var(--m9-fg) 12%, transparent); }
.m9-pv-c-band i { background: transparent; border-radius: 0; box-shadow: inset 2px 0 0 color-mix(in srgb, var(--m9-fg) 55%, transparent); }
.m9-pv-c-ring i { background: transparent; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pa) 55%, transparent); }
.m9-pv-c-plain i { background: transparent; }
.m9-pv-q-card i { background: var(--c-graBacPri, #f1f1ef); border-radius: 6px; }
.m9-pv-q-round i::after, .m9-pv-q-gbar i::after, .m9-pv-q-note i::after { content: ""; position: absolute; left: 0; top: 4px; bottom: 4px; width: 3px; border-radius: 3px; background: var(--m9-fg); }
.m9-pv-q-gbar i { background: linear-gradient(90deg, color-mix(in srgb, var(--m9-fg) 9%, transparent), transparent 80%); border-radius: 0 6px 6px 0; }
.m9-pv-q-gbar i::after { top: 2px; bottom: 2px; width: 4px; background: linear-gradient(180deg, var(--m9-fg), color-mix(in srgb, var(--m9-fg) 12%, transparent)); }
.m9-pv-q-note i::after { left: 10px; width: 2px; background: color-mix(in srgb, var(--m9-fg) 35%, transparent); }
.m9-pv-q-note s { left: 18px !important; width: 32px !important; opacity: .6; }
/* 罫線の見本 */
.m9-rl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.m9-rl button { all: unset; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 0 5px; border-radius: 7px; cursor: pointer; font-size: 11px; color: var(--m9-sub); }
.m9-rl button:hover { background: var(--m9-hov); }
.m9-rl button.on { background: var(--m9-acc-bg); color: var(--m9-acc); }
.m9-rl i { display: block; width: 34px; height: 20px; border-radius: 3px; background-color: var(--m9-field); }
.m9-rl-line i { background-image: repeating-linear-gradient(180deg, transparent 0 4px, color-mix(in srgb, var(--m9-fg) 30%, transparent) 4px 5px); }
.m9-rl-dot i { background-image: radial-gradient(circle at 1px 4px, color-mix(in srgb, var(--m9-fg) 45%, transparent) .8px, transparent 1.2px); background-size: 4px 5px; }
.m9-rl-grid i { background-image: repeating-linear-gradient(180deg, transparent 0 4px, color-mix(in srgb, var(--m9-fg) 26%, transparent) 4px 5px), repeating-linear-gradient(90deg, transparent 0 4px, color-mix(in srgb, var(--m9-fg) 26%, transparent) 4px 5px); }
.m9-jump { background: var(--m9-acc-bg); color: var(--m9-acc); margin: 6px 0 2px; white-space: normal; height: auto; min-height: 30px; padding: 4px 6px; }
.m9-jump .m9-ic { color: var(--m9-acc); }
.m9-jump .m9-lab { white-space: normal; font-size: 12.5px; line-height: 1.35; }
.m9-sub-blk { width: 290px; }
.m9-sub.m9-over { box-shadow: var(--c-shaOutLg, 0 0 0 1px rgba(15,15,15,.05), 0 3px 6px rgba(15,15,15,.1), 0 9px 24px rgba(15,15,15,.2)), 0 0 0 100vmax transparent; }
.m9-back { color: var(--m9-sub); margin: 0 6px 6px; width: auto; }
.m9-back .m9-ic { font-size: 18px; }
.m9-pfont { background: var(--m9-field); margin-bottom: 6px; }
.m9-pfont:hover { background: var(--m9-hov); }
.m9-hint { display: block; font-weight: 400; font-size: 11px; color: var(--m9-ter); margin-top: 3px; }
.m9-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.m9-g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; }
.m9-g3 .m9-nic { width: 20px; }
.m9-g3 .m9-stp { display: none; }
.m9-chips-sp { grid-template-columns: auto repeat(5, 1fr); align-items: center; }
.m9-cl { font-size: 11px; color: var(--m9-ter); padding-right: 4px; white-space: nowrap; }
.m9-dks { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.m9-dk { all: unset; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 0 5px; border-radius: 7px; cursor: pointer; font-size: 11px; color: var(--m9-sub); }
.m9-dk:hover { background: var(--m9-hov); }
.m9-dk.on { background: var(--m9-acc-bg); color: var(--m9-acc); }
.m9-dk i { display: block; width: 34px; height: 18px; border-radius: 3px; background: repeating-linear-gradient(180deg, color-mix(in srgb, var(--m9-fg) 28%, transparent) 0 2px, transparent 2px 5px) 5px 4px / 24px 11px no-repeat; }
.m9-dk-bar i { box-shadow: inset 2px 0 0 currentColor; }
.m9-dk-fill i { background-color: color-mix(in srgb, currentColor 14%, transparent); border-radius: 4px; }
.m9-dk-barfill i { box-shadow: inset 2px 0 0 currentColor; background-color: color-mix(in srgb, currentColor 14%, transparent); }
.m9-dk-under i { box-shadow: inset 0 -1px 0 currentColor; border-radius: 0; }
.m9-dk-box i { box-shadow: inset 0 0 0 1px currentColor; border-radius: 4px; }
.m9-dk-grad i { background-image: repeating-linear-gradient(180deg, color-mix(in srgb, var(--m9-fg) 28%, transparent) 0 2px, transparent 2px 5px), linear-gradient(90deg, color-mix(in srgb, currentColor 22%, transparent), transparent); background-size: 24px 11px, 100% 100%; background-position: 5px 4px, 0 0; background-repeat: no-repeat; }
.m9-dots { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; padding: 0 2px; }
.m9-dots.off { opacity: .45; }
.m9-dot { all: unset; box-sizing: border-box; width: 18px; height: 18px; border-radius: 50%; cursor: pointer; background: var(--dot, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--m9-fg) 18%, transparent); }
.m9-dot-def { background: linear-gradient(135deg, transparent 45%, color-mix(in srgb, var(--m9-fg) 30%, transparent) 45% 55%, transparent 55%); }
.m9-dot:hover { transform: scale(1.12); }
.m9-dot.on { box-shadow: 0 0 0 2px var(--m9-bg), 0 0 0 3.5px var(--m9-fg); }
.m9-seg-g button { font-size: 14px; }
.m9-seg-g button span { display: inline-block; line-height: 1.2; }
.m9-ps { gap: 6px; }
.m9-pst { flex: none; font-size: 10px; color: var(--m9-sub); background: var(--m9-field); padding: 2px 5px; border-radius: 4px; }
.m9-tpnew .m9-psname { flex: 1 1 auto; min-width: 0; height: 28px; border: 0; border-radius: 6px; padding: 0 8px; outline: none; font: inherit; font-size: 13px; color: var(--m9-fg); background: var(--m9-bg); box-shadow: inset 0 0 0 1.5px var(--m9-acc); user-select: text; }
html.c26-painting .notion-page-content, html.c26-painting .notion-page-content * { cursor: copy !important; }
.m9-danger { margin-top: 12px; color: var(--m9-sub); font-size: 13px; }
.m9-danger .m9-ic { color: var(--m9-ico2); }
/* 書体 */
.m9-sub-font .c26-pv { margin: 0 6px 8px; padding: 12px 12px 10px; border-radius: 10px; background: var(--m9-field); }
.m9-sub-font .c26-pv-t { font-size: 20px; line-height: 1.35; max-height: 54px; overflow: hidden; word-break: break-all; color: var(--m9-fg); }
.m9-sub-font .c26-pv-m { display: flex; gap: 8px; margin-top: 6px; font-size: 11.5px; color: var(--m9-sub); }
.m9-sub-font .c26-pv-n { color: var(--m9-fg); font-weight: 500; }
.m9-q { padding: 0 6px 6px; }
.m9-q input { width: 100%; height: 28px; border: 0; border-radius: 6px; padding: 0 8px; outline: none; font: inherit; font-size: 13px; color: var(--m9-fg); background: var(--m9-field); user-select: text; }
.m9-q input:focus { box-shadow: 0 0 0 1.5px var(--m9-acc); background: var(--m9-bg); }
.m9-sub-font .c26-m-list { flex: 1 1 auto; max-height: 340px; overflow: auto; overscroll-behavior: contain; padding: 0 2px; }
.m9-sub-font .c26-m-g { font-size: 11.5px; font-weight: 500; color: var(--m9-ter); padding: 12px 8px 4px; }
.m9-sub-font .c26-m-g[hidden], .m9-sub-font .c26-m-item[hidden] { display: none; }
.m9-sub-font .c26-m-item { display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 8px; border-radius: 6px; cursor: pointer; white-space: nowrap; }
.m9-sub-font .c26-m-item .n { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 15px; }
.m9-sub-font .c26-m-item:hover, .m9-sub-font .c26-m-item.kb { background: var(--m9-hov); }
.m9-sub-font .c26-m-item.on { background: var(--m9-acc-bg); color: var(--m9-acc); }
.m9-sub-font .c26-m-item.miss { opacity: .5; }
.m9-sub-font .c26-bd { font-style: normal; font-size: 10.5px; color: var(--m9-ter); padding: 1px 5px; border-radius: 4px; background: var(--m9-field); }
.m9-sub-font .m9-chk { margin: 8px 8px 2px; }
/* テンプレート */
.m9-tp { display: flex; align-items: center; gap: 2px; padding: 4px 2px 4px 8px; border-radius: 8px; cursor: pointer; }
.m9-tp:hover { background: var(--m9-hov); }
.m9-tp.on { background: var(--m9-acc-bg); }
.m9-tpt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.m9-tpt .n { font-size: 15px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; align-self: flex-start; max-width: 100%; border-radius: 3px; }
.m9-tpt .m { font-size: 11px; color: var(--m9-ter); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m9-tp .m9-tb { opacity: 0; }
.m9-tp:hover .m9-tb { opacity: 1; }
.m9-tpnew { display: flex; gap: 6px; margin-top: 6px; }
.m9-tpnew input { flex: 1 1 auto; min-width: 0; height: 28px; border: 0; border-radius: 6px; padding: 0 8px; outline: none; font: inherit; font-size: 13px; color: var(--m9-fg); background: var(--m9-bg); box-shadow: inset 0 0 0 1.5px var(--m9-acc); user-select: text; }
.m9-btn { all: unset; box-sizing: border-box; height: 28px; padding: 0 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; }
.m9-btn.pri { background: var(--m9-acc); color: #fff; }
.m9-btn.pri:hover { filter: brightness(.95); }
.m9-tpls > .m9-row { margin-top: 4px; color: var(--m9-sub); }
/* コールアウト・引用（細かい項目） */
.m9-sub .c26-fields { margin-top: 4px; }
.m9-sub .c26-fields .c26-row { display: grid; grid-template-columns: 80px 1fr 40px; gap: 6px; align-items: center; margin-top: 8px; font-size: 12.5px; color: var(--m9-sub); }
.m9-sub .c26-fields select { width: 100%; height: 26px; border: 0; border-radius: 6px; padding: 0 4px; font: inherit; font-size: 12.5px; color: var(--m9-fg); background: var(--m9-field); }
.m9-sub .c26-fields input[type="range"] { width: 100%; accent-color: var(--m9-acc); }
.m9-sub .c26-fields input[type="color"] { width: 36px; height: 24px; border: 0; padding: 0; background: transparent; }
.m9-sub .c26-fields output { font-size: 11.5px; color: var(--m9-sub); text-align: right; cursor: pointer; font-variant-numeric: tabular-nums; }
`;
    (document.head || document.documentElement).appendChild(st);
  }

  function installUiCss() {
    if (document.getElementById(UI_STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = UI_STYLE_ID;
    st.textContent = `
#c26-pop, .c26-panel, #c26-fab, .c26-toast, #c26-trigger {
  --c26-bg: #fff; --c26-fg: rgb(55,53,47); --c26-sub: rgba(55,53,47,.5); --c26-faint: rgba(55,53,47,.35);
  --c26-line: rgba(55,53,47,.09); --c26-hover: rgba(55,53,47,.08); --c26-press: rgba(55,53,47,.16);
  --c26-acc: rgb(35,131,226); --c26-acc-bg: rgba(35,131,226,.1); --c26-field: rgba(242,241,238,.6);
  --c26-shadow: rgba(15,15,15,.05) 0 0 0 1px, rgba(15,15,15,.1) 0 3px 6px, rgba(15,15,15,.2) 0 9px 24px;
  --c26-ui: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", Helvetica, sans-serif;
}
html.dark #c26-pop, html.dark .c26-panel, html.dark #c26-fab, html.dark .c26-toast, html.dark #c26-trigger,
html[data-theme="dark"] #c26-pop, html[data-theme="dark"] .c26-panel, html[data-theme="dark"] #c26-fab,
html:has(> body.dark) #c26-pop, html:has(> body.dark) .c26-panel, html:has(> body.dark) #c26-fab {
  --c26-bg: rgb(37,37,37); --c26-fg: rgba(255,255,255,.81); --c26-sub: rgba(255,255,255,.46); --c26-faint: rgba(255,255,255,.28);
  --c26-line: rgba(255,255,255,.094); --c26-hover: rgba(255,255,255,.055); --c26-press: rgba(255,255,255,.1);
  --c26-acc-bg: rgba(35,131,226,.18); --c26-field: rgba(255,255,255,.055);
  --c26-shadow: rgba(15,15,15,.1) 0 0 0 1px, rgba(15,15,15,.2) 0 3px 6px, rgba(15,15,15,.4) 0 9px 24px;
}
#c26-pop svg, .c26-panel svg { width: 16px; height: 16px; fill: currentColor; flex: 0 0 auto; display: block; }
#c26-pop svg.c26-chev { width: 9px; height: 9px; opacity: .45; margin-left: 2px; }
#c26-pop svg.c26-check { width: 12px; height: 12px; margin-left: 8px; color: var(--c26-fg); }
/* ---------- 書式バー（列の下端に浮かぶ。ガラス状） ---------- */
#c26-pop {
  position: fixed; z-index: 2147482500; box-sizing: border-box; max-width: calc(100vw - 24px);
  color: var(--c26-fg); border-radius: 12px;
  background: color-mix(in srgb, var(--c26-bg) 82%, transparent);
  -webkit-backdrop-filter: saturate(1.6) blur(14px); backdrop-filter: saturate(1.6) blur(14px);
  box-shadow: rgba(15,15,15,.06) 0 0 0 1px, rgba(15,15,15,.08) 0 4px 10px, rgba(15,15,15,.14) 0 14px 34px;
  font: 14px/1.2 var(--c26-ui); padding: 5px 6px; user-select: none; -webkit-font-smoothing: antialiased;
  animation: c26-up .16s cubic-bezier(.2,0,0,1);
}
@keyframes c26-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.c26-prev { display: inline-flex; flex-direction: column; justify-content: center; min-width: 84px; max-width: 128px; padding: 0 8px 0 6px; height: 30px; overflow: hidden; }
.c26-prev .pt { font-size: 15px; line-height: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.c26-prev .pm { font-size: 10.5px; line-height: 13px; color: var(--c26-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.c26-prev.busy .pm { color: var(--c26-acc); }
.c26-prev.busy .pt { opacity: .55; }
#c26-pop .c26-save { font-size: 12px !important; }
@keyframes c26-in { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: none; } }
#c26-pop[hidden] { display: none; }
.c26-p-row { display: flex; align-items: center; gap: 1px; white-space: nowrap; height: 30px; }
.c26-char { display: inline-flex; align-items: center; gap: 1px; height: 28px; }
#c26-pop.c26-caret .c26-char { display: none; }
#c26-pop button {
  font: inherit; color: inherit; background: transparent; border: 0; border-radius: 4px; height: 28px; min-width: 28px;
  padding: 0 7px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  transition: background 20ms ease-in;
}
#c26-pop button:hover { background: var(--c26-hover); }
#c26-pop button:active { background: var(--c26-press); }
#c26-pop button:disabled { opacity: .3; cursor: default; background: transparent; }
#c26-pop button.set, #c26-pop button[aria-pressed="true"] { color: var(--c26-acc); }
#c26-pop .c26-p-ic { padding: 0; width: 28px; }
.c26-p-sep { width: 1px; align-self: stretch; margin: 2px 3px; background: var(--c26-line); }
.c26-p-font { max-width: 200px; }
.c26-p-font .aa { font: 17px/1 "Hiragino Mincho ProN", Georgia, serif; }
.c26-p-font .nm { overflow: hidden; text-overflow: ellipsis; max-width: 96px; }
.c26-p-step { display: inline-flex; align-items: center; }
#c26-pop .c26-p-step .c26-p-ic { width: 22px; min-width: 22px; color: var(--c26-sub); }
#c26-pop .c26-p-step .c26-p-ic:hover { color: var(--c26-fg); }
.c26-p-size {
  width: 36px; height: 24px; box-sizing: border-box; text-align: center; font: inherit; font-size: 13.5px; font-variant-numeric: tabular-nums;
  color: inherit; background: var(--c26-field); border: 0; border-radius: 4px; padding: 0 2px; outline: none;
  box-shadow: inset 0 0 0 1px var(--c26-line);
}
.c26-p-size:focus { box-shadow: inset 0 0 0 1px rgba(35,131,226,.57), 0 0 0 2px rgba(35,131,226,.35); }
.c26-p-size.set { color: var(--c26-acc); }
#c26-pop .c26-p-mini { min-width: 18px; width: 18px; padding: 0; }
.c26-p-w b { font-weight: 700; font-size: 15px; }
.c26-p-w .wv { font-size: 12px; color: var(--c26-sub); font-variant-numeric: tabular-nums; }
.c26-p-w.set .wv { color: var(--c26-acc); }
.c26-p-i .ii { font: italic 17px/1 Georgia, "Times New Roman", serif; }
.c26-hide { display: none !important; }
#c26-pop .c26-p-ic2 { padding: 0 5px; }
.c26-p-blk .bl { max-width: 80px; overflow: hidden; text-overflow: ellipsis; font-size: 13.5px; }
.c26-p-blk[hidden] { display: none !important; }
/* ---------- v5: 2 段・幅固定の書式バー ---------- */
#c26-pop { width: 640px; height: 92px; padding: 6px 8px 5px; }
#c26-pop .c26-r1 { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 2px 6px 4px; margin-bottom: 4px; border-bottom: 1px solid var(--c26-line); }
#c26-pop .c26-prev { flex: 1 1 auto; min-width: 0; max-width: none; height: 38px; padding: 0; display: flex; flex-direction: column; justify-content: center; }
#c26-pop .c26-prev .pt { font-size: 18px; line-height: 22px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#c26-pop .c26-prev .pm { font-size: 11px; line-height: 14px; }
#c26-pop .c26-state { flex: 0 0 auto; max-width: 230px; font-size: 11.5px; color: var(--c26-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#c26-pop .c26-state.dirty { color: rgb(217,115,13); font-weight: 500; }
#c26-pop .c26-state.warn { color: rgb(212,76,71); font-weight: 600; animation: c26-shake .3s; }
#c26-pop .c26-state.busy { color: var(--c26-acc); }
@keyframes c26-shake { 0%,100% { transform: none; } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
#c26-pop .c26-discard { flex: 0 0 52px; width: 52px; height: 28px; font-size: 12.5px; color: var(--c26-sub); box-shadow: inset 0 0 0 1px var(--c26-line); }
#c26-pop .c26-discard[hidden] { display: none; }
#c26-pop .c26-save { flex: 0 0 88px; width: 88px; height: 28px; font-size: 13px !important; font-weight: 500; color: var(--c26-sub); box-shadow: inset 0 0 0 1px var(--c26-line); }
#c26-pop .c26-save.dirty { background: rgb(35,131,226); color: #fff; box-shadow: none; }
#c26-pop .c26-save.dirty:hover { background: rgb(0,117,211); }
#c26-pop.c26-dirty { box-shadow: rgba(217,115,13,.55) 0 0 0 1.5px, rgba(15,15,15,.08) 0 4px 10px, rgba(15,15,15,.14) 0 14px 34px; }
#c26-pop .c26-p-row { height: 30px; overflow: hidden; }
#c26-pop .c26-p-slot { flex: 0 0 120px; width: 120px; justify-content: flex-start; padding: 0 6px; }
#c26-pop .c26-p-slot .sn { flex: 1 1 auto; min-width: 0; max-width: none; text-align: left; overflow: hidden; text-overflow: ellipsis; font-size: 13px; }
#c26-pop .c26-p-font { flex: 0 0 118px; width: 118px; max-width: none; justify-content: flex-start; padding: 0 6px; }
#c26-pop .c26-p-font .nm { flex: 1 1 auto; min-width: 0; max-width: none; text-align: left; font-size: 13px; }
#c26-pop .c26-p-w { flex: 0 0 64px; width: 64px; }
#c26-pop .c26-p-ic2 { flex: 0 0 40px; width: 40px; padding: 0; }
#c26-pop .c26-p-blk { flex: 0 0 86px; width: 86px; justify-content: flex-start; padding: 0 6px; }
#c26-pop .c26-p-blk .bl { flex: 1 1 auto; min-width: 0; max-width: none; text-align: left; font-size: 13px; }
#c26-pop .c26-p-size { flex: 0 0 36px; }
#c26-pop.c26-caret .c26-char { display: none; }
/* 保存メニュー */
.c26-svbox { padding: 4px 12px 8px; width: 320px; box-sizing: border-box; }
.c26-svrow { display: flex; gap: 6px; margin-top: 6px; }
.c26-svname { flex: 1 1 auto; min-width: 0; height: 30px; box-sizing: border-box; font: inherit; font-size: 14px; padding: 0 8px; border: 0; border-radius: 4px; outline: none; color: inherit; background: var(--c26-field); box-shadow: inset 0 0 0 1px var(--c26-line); }
.c26-svname:focus { box-shadow: inset 0 0 0 1px rgba(35,131,226,.57), 0 0 0 2px rgba(35,131,226,.35); }
#c26-pop .c26-svbtn { height: 30px; padding: 0 12px; font-size: 13px; box-shadow: inset 0 0 0 1px var(--c26-line); flex: 0 0 auto; }
#c26-pop .c26-svbtn.pri { background: rgb(35,131,226); color: #fff; box-shadow: none; }

#c26-pop .c26-svbtn small { font-size: 11px; opacity: .8; font-weight: 400; }
.c26-svlab { font-size: 12px; color: var(--c26-sub); margin-top: 6px; }
#c26-pop .c26-svrow select.c26-svtarget { flex: 1 1 auto; min-width: 0; width: auto; height: 30px; }
.c26-svsep { font-size: 11.5px; color: var(--c26-sub); margin: 12px 0 0; }
.c26-gal .c26-gi { min-height: 36px; }
/* ---------- テンプレートの管理（大きなポップアップ） ---------- */
html[data-c26-bar] #c26-fab { display: none !important; }
.c26-mgr-back {
  position: fixed; inset: 0; z-index: 2147482800; background: rgba(15,15,15,.32); display: flex; align-items: center; justify-content: center;
  animation: c26-fade .14s ease-out;
  --c26-bg: #fff; --c26-fg: rgb(55,53,47); --c26-sub: rgba(55,53,47,.55); --c26-line: rgba(55,53,47,.1); --c26-hover: rgba(55,53,47,.06);
  --c26-acc: rgb(35,131,226); --c26-acc-bg: rgba(35,131,226,.1); --c26-field: rgba(242,241,238,.7);
  --c26-ui: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", Helvetica, sans-serif;
}
html.dark .c26-mgr-back, html[data-theme="dark"] .c26-mgr-back, html:has(> body.dark) .c26-mgr-back {
  --c26-bg: rgb(32,32,32); --c26-fg: rgba(255,255,255,.85); --c26-sub: rgba(255,255,255,.5); --c26-line: rgba(255,255,255,.09); --c26-hover: rgba(255,255,255,.055); --c26-field: rgba(255,255,255,.06);
}
@keyframes c26-fade { from { opacity: 0; } to { opacity: 1; } }
.c26-mgr {
  width: min(880px, 94vw); height: min(620px, 88vh); display: flex; flex-direction: column; overflow: hidden;
  background: var(--c26-bg); color: var(--c26-fg); border-radius: 14px; font: 14px/1.45 var(--c26-ui); -webkit-font-smoothing: antialiased;
  box-shadow: rgba(15,15,15,.08) 0 0 0 1px, rgba(15,15,15,.16) 0 12px 30px, rgba(15,15,15,.24) 0 30px 80px;
  animation: c26-up .18s cubic-bezier(.2,0,0,1);
}
.c26-mgr-h { display: flex; align-items: baseline; gap: 12px; padding: 16px 20px 12px; border-bottom: 1px solid var(--c26-line); }
.c26-mgr-h b { font-size: 17px; font-weight: 600; }
.c26-mgr-sub { font-size: 12px; color: var(--c26-sub); }
.c26-mgr-x { margin-left: auto; border: 0; background: transparent; color: var(--c26-sub); font-size: 20px; cursor: pointer; border-radius: 6px; width: 30px; height: 30px; }
.c26-mgr-x:hover { background: var(--c26-hover); color: var(--c26-fg); }
.c26-mgr-b { flex: 1 1 auto; display: flex; min-height: 0; }
.c26-mgr-list { flex: 0 0 270px; overflow: auto; padding: 10px; border-right: 1px solid var(--c26-line); display: flex; flex-direction: column; gap: 6px; background: color-mix(in srgb, var(--c26-field) 45%, transparent); }
.c26-card { all: unset; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: 10px; cursor: pointer; background: var(--c26-bg); box-shadow: inset 0 0 0 1px var(--c26-line); transition: box-shadow .12s, transform .12s; }
.c26-card:hover { box-shadow: inset 0 0 0 1px rgba(35,131,226,.35); }
.c26-card.on { box-shadow: inset 0 0 0 2px var(--c26-acc); }
.c26-card-s { color: var(--c26-fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
.c26-card-m { display: flex; align-items: center; gap: 6px; font: 11.5px var(--c26-ui); color: var(--c26-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.c26-card-add { align-items: center; color: var(--c26-acc); font: 500 13.5px var(--c26-ui); background: transparent; box-shadow: inset 0 0 0 1px dashed; border: 1px dashed rgba(35,131,226,.45); }
.c26-mgr-empty { color: var(--c26-sub); font-size: 13px; padding: 14px 6px; line-height: 1.7; }
.c26-mgr-ed { flex: 1 1 auto; overflow: auto; padding: 18px 22px 16px; display: flex; flex-direction: column; min-width: 0; }
.c26-ed-prev { min-height: 64px; max-height: 120px; overflow: hidden; padding: 16px 18px; border-radius: 10px; background: var(--c26-field); color: var(--c26-fg); line-height: 1.6; word-break: break-all; }
.c26-ed-meta { display: flex; align-items: center; gap: 6px; margin: 8px 2px 14px; font-size: 11.5px; color: var(--c26-sub); }
.c26-ed-grid { display: grid; grid-template-columns: 64px 1fr; gap: 10px 12px; align-items: center; }
.c26-ed-grid > label { font-size: 12.5px; color: var(--c26-sub); align-self: start; padding-top: 6px; }
.c26-ed-name, .c26-ed-q, .c26-ed-fs { font: inherit; font-size: 14px; height: 32px; box-sizing: border-box; border: 0; border-radius: 6px; padding: 0 10px; outline: none; color: inherit; background: var(--c26-field); box-shadow: inset 0 0 0 1px var(--c26-line); }
.c26-ed-name:focus, .c26-ed-q:focus, .c26-ed-fs:focus { box-shadow: inset 0 0 0 1px rgba(35,131,226,.57), 0 0 0 3px rgba(35,131,226,.25); }
.c26-ed-font { display: flex; flex-direction: column; gap: 6px; }
.c26-fl { height: 168px; overflow: auto; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--c26-line); padding: 4px; overscroll-behavior: contain; }
.c26-fl-g { font: 500 11px var(--c26-ui); color: var(--c26-sub); padding: 8px 8px 2px; }
.c26-fl-item { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 6px; font-size: 15px; cursor: pointer; white-space: nowrap; }
.c26-fl-item[hidden] { display: none; }
.c26-fl-item:hover { background: var(--c26-hover); }
.c26-fl-item.on { background: var(--c26-acc-bg); color: var(--c26-acc); }
.c26-ed-size { display: flex; align-items: center; gap: 6px; }
.c26-ed-size button, .c26-seg2 button { all: unset; box-sizing: border-box; height: 30px; min-width: 30px; padding: 0 10px; border-radius: 6px; text-align: center; cursor: pointer; font: 14px var(--c26-ui); color: var(--c26-fg); box-shadow: inset 0 0 0 1px var(--c26-line); }
.c26-ed-size button:hover, .c26-seg2 button:hover { background: var(--c26-hover); }
.c26-ed-fs { width: 64px; text-align: center; padding: 0 4px; }
.c26-ed-size input[type="range"] { flex: 1 1 auto; accent-color: var(--c26-acc); }
.c26-ed-clr { color: var(--c26-sub) !important; font-size: 12px !important; }
.c26-ed-lsv { min-width: 46px; font-size: 12.5px; color: var(--c26-sub); font-variant-numeric: tabular-nums; }
.c26-seg2 { display: flex; gap: 4px; flex-wrap: wrap; }
.c26-seg2 button.on { background: var(--c26-acc-bg); color: var(--c26-acc); box-shadow: inset 0 0 0 1px rgba(35,131,226,.4); }
.c26-ed-tog { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.c26-ed-foot { margin-top: auto; position: sticky; bottom: -16px; background: var(--c26-bg); padding: 14px 0 16px; margin-bottom: -16px; z-index: 1; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; border-top: 1px solid var(--c26-line); }
.c26-btn2 { all: unset; box-sizing: border-box; height: 32px; padding: 0 14px; border-radius: 7px; cursor: pointer; font: 500 13.5px var(--c26-ui); color: var(--c26-fg); box-shadow: inset 0 0 0 1px var(--c26-line); }
.c26-btn2:hover { background: var(--c26-hover); }
.c26-btn2.pri { background: var(--c26-acc); color: #fff; box-shadow: none; }
.c26-btn2.pri:hover { background: rgb(0,117,211); }
.c26-btn2[disabled] { opacity: .4; cursor: default; }
.c26-btn2.danger { background: rgb(212,76,71); color: #fff; box-shadow: none; }
.c26-btn2.danger-ghost { color: rgb(212,76,71); margin-left: auto; }
.c26-ed-del { margin-left: auto; font-size: 12.5px; color: rgb(212,76,71); }
.c26-ed-dirty { margin-right: auto; font-size: 12.5px; color: rgb(217,115,13); }
/* ================= v7: Figma 風のテキストパネル ================= */
#c26-pop.c26-fig {
  width: 268px; height: auto; padding: 0; display: flex; flex-direction: column; border-radius: 12px; overflow: visible;
  background: var(--c26-bg); color: var(--c26-fg); font: 12px/1.4 var(--c26-ui); -webkit-backdrop-filter: none; backdrop-filter: none;
  box-shadow: rgba(15,15,15,.06) 0 0 0 1px, rgba(15,15,15,.08) 0 2px 6px, rgba(15,15,15,.14) 0 12px 32px;
  animation: c26-fin .16s cubic-bezier(.2,0,0,1); z-index: 2147482400 !important;
}
@keyframes c26-fin { from { opacity: 0; transform: translateY(-4px) scale(.98); } to { opacity: 1; transform: none; } }
#c26-pop.c26-fig[hidden] { display: none; }
.c26-fig svg { width: 16px; height: 16px; fill: none; display: block; flex: 0 0 auto; }
.c26-fig .i-chev { width: 12px; height: 12px; opacity: .5; margin-left: auto; }
.c26-fig .f-head { display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 6px 0 14px; cursor: grab; border-bottom: 1px solid var(--c26-line); user-select: none; }
.c26-fig .f-head:active { cursor: grabbing; }
.c26-fig .f-title { font-weight: 600; font-size: 12.5px; }
.c26-fig .f-sel { color: var(--c26-sub); font-size: 11.5px; margin-right: auto; }
.c26-fig button { font: inherit; color: inherit; background: transparent; border: 0; padding: 0; cursor: pointer; }
.c26-fig .f-ib { width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: var(--c26-sub); }
.c26-fig .f-ib:hover { background: var(--c26-hover); color: var(--c26-fg); }
.c26-fig .f-ib[aria-pressed="true"] { color: var(--c26-acc); background: var(--c26-acc-bg); }
.c26-fig .f-ib:disabled { opacity: .35; cursor: default; background: transparent; }
.c26-fig .f-ib.sm { width: 24px; height: 24px; }
.c26-fig .f-body { overflow: auto; overscroll-behavior: contain; flex: 1 1 auto; min-height: 0; }
.c26-fig .f-prev { padding: 12px 14px 10px; border-bottom: 1px solid var(--c26-line); }
.c26-fig .f-prev .pt { max-height: 4.4em; overflow: hidden; line-height: 1.45; color: var(--c26-fg); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; word-break: break-word; }
.c26-fig.f-none .f-prev .pt { color: var(--c26-sub); font-size: 12px !important; }
.c26-fig .f-sec { padding: 10px 12px 12px; border-bottom: 1px solid var(--c26-line); display: flex; flex-direction: column; gap: 8px; }
.c26-fig .f-sec[hidden] { display: none; }
.c26-fig h6 { margin: 0; font-size: 11.5px; font-weight: 600; display: flex; align-items: center; gap: 6px; height: 22px; }
.c26-fig .f-hint { font-weight: 400; color: var(--c26-sub); margin-left: auto; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
.c26-fig .f-scope { margin-left: auto; display: inline-flex; background: var(--c26-field); border-radius: 6px; padding: 2px; gap: 1px; }
.c26-fig .f-scope button { height: 20px; padding: 0 7px; border-radius: 4px; font-size: 10.5px; font-weight: 500; color: var(--c26-sub); }
.c26-fig .f-scope button[aria-pressed="true"] { background: var(--c26-bg); color: var(--c26-fg); box-shadow: 0 0 0 1px var(--c26-line), 0 1px 2px rgba(15,15,15,.08); }
.c26-fig .f-dd { display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 8px; border-radius: 6px; width: 100%; box-sizing: border-box; background: var(--c26-field); text-align: left; }
.c26-fig .f-dd:hover { box-shadow: inset 0 0 0 1px var(--c26-line); }
.c26-fig .f-dd .nm { flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
.c26-fig .f-dd.set .nm { color: var(--c26-acc); }
.c26-fig .f-font .aa { font: 15px/1 "Hiragino Mincho ProN", Georgia, serif; width: 20px; text-align: center; }
.c26-fig .f-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.c26-fig .f-num { display: flex; align-items: center; height: 30px; border-radius: 6px; background: var(--c26-field); padding: 0 8px 0 4px; gap: 4px; box-sizing: border-box; }
.c26-fig .f-num:focus-within { box-shadow: inset 0 0 0 1px var(--c26-acc); background: var(--c26-bg); }
.c26-fig .f-num .ic { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; color: var(--c26-sub); cursor: ew-resize; border-radius: 4px; }
.c26-fig .f-num .ic:hover { color: var(--c26-fg); background: var(--c26-hover); }
.c26-fig .f-num input { flex: 1 1 auto; min-width: 0; width: 100%; border: 0; outline: none; background: transparent; color: inherit; font: inherit; font-size: 12px; font-variant-numeric: tabular-nums; padding: 0; }
.c26-fig .f-num.set input { color: var(--c26-acc); }
.c26-fig .f-stp { display: flex; flex-direction: column; margin-right: -4px; opacity: 0; transition: opacity .1s; }
.c26-fig .f-num:hover .f-stp, .c26-fig .f-num:focus-within .f-stp { opacity: 1; }
.c26-fig .f-stp button { height: 12px; width: 16px; font-size: 8px; line-height: 12px; color: var(--c26-sub); border-radius: 3px; }
.c26-fig .f-stp button:hover { background: var(--c26-hover); color: var(--c26-fg); }
.c26-fig .c26-m-item.kb { background: var(--c26-hover); box-shadow: inset 2px 0 0 var(--c26-acc); }
html.c26-scrubbing, html.c26-scrubbing * { cursor: ew-resize !important; user-select: none !important; }
.c26-fig .f-seg { display: flex; background: var(--c26-field); border-radius: 6px; padding: 2px; gap: 2px; height: 30px; box-sizing: border-box; }
.c26-fig .f-seg button { flex: 1 1 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; color: var(--c26-sub); }
.c26-fig .f-seg button:hover { color: var(--c26-fg); }
.c26-fig .f-seg button[aria-pressed="true"] { background: var(--c26-bg); color: var(--c26-acc); box-shadow: 0 0 0 1px var(--c26-line), 0 1px 2px rgba(15,15,15,.08); }
.c26-fig .f-seg .ii { font: italic 15px/1 Georgia, serif; }
.c26-fig .f-chk { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--c26-sub); cursor: pointer; }
.c26-fig .f-chk input { margin: 0; accent-color: var(--c26-acc); }
.c26-fig.f-nochar .f-char { opacity: .4; pointer-events: none; }
.c26-fig.f-none .f-para, .c26-fig.f-none .f-blk { opacity: .4; pointer-events: none; }
.c26-fig .f-tpls { display: flex; flex-direction: column; gap: 4px; }
.c26-fig .f-tp { display: flex; align-items: center; gap: 4px; padding: 4px 4px 4px 10px; border-radius: 8px; cursor: pointer; box-shadow: inset 0 0 0 1px var(--c26-line); min-height: 34px; }
.c26-fig .f-tp:hover { box-shadow: inset 0 0 0 1px rgba(35,131,226,.4); }
.c26-fig .f-tp.on { box-shadow: inset 0 0 0 1.5px var(--c26-acc); }
.c26-fig .f-tp .n { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 0 1 auto; }
.c26-fig .f-tp .m { font-size: 10.5px; color: var(--c26-sub); margin-left: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; }
.c26-fig .f-tp .f-ib { opacity: 0; }
.c26-fig .f-tp:hover .f-ib { opacity: 1; }
.c26-fig .f-addtp { display: flex; align-items: center; gap: 6px; height: 30px; padding: 0 8px; border-radius: 6px; color: var(--c26-acc); font-weight: 500; }
.c26-fig .f-addtp:hover { background: var(--c26-acc-bg); }
.c26-fig .f-addtp:disabled { color: var(--c26-sub); opacity: .6; cursor: default; background: transparent; }
.c26-fig .f-tpnew { display: flex; gap: 4px; }
.c26-fig .f-tpname { flex: 1 1 auto; min-width: 0; height: 30px; box-sizing: border-box; border: 0; border-radius: 6px; padding: 0 8px; font: inherit; color: inherit; background: var(--c26-field); outline: none; box-shadow: inset 0 0 0 1px var(--c26-acc); }
.c26-fig .f-btn { height: 30px; padding: 0 10px; border-radius: 6px; font-weight: 500; box-shadow: inset 0 0 0 1px var(--c26-line); }
.c26-fig .f-btn.pri { background: var(--c26-acc); color: #fff; box-shadow: none; }
.c26-fig .f-blkbody .c26-fields { padding: 0; }
.c26-fig .f-blkbody .c26-row { grid-template-columns: 72px 1fr 40px; font-size: 11.5px; }
.c26-fig .f-foot { display: flex; align-items: center; gap: 6px; height: 46px; padding: 0 8px 0 6px; border-top: 1px solid var(--c26-line); }
.c26-fig .f-done { height: 30px; padding: 0 12px; font-size: 12px; }
.c26-fig .f-done:hover { background: rgb(0,117,211); }
.c26-fig .f-done:disabled { opacity: .6; }
.c26-fig .f-status { display: inline-flex; align-items: center; gap: 4px; color: var(--c26-sub); font-size: 11px; margin-right: auto; white-space: nowrap; }
.c26-fig .f-status svg { width: 13px; height: 13px; color: rgb(68,131,97); }
.c26-fig .f-status.busy { color: var(--c26-acc); }
.c26-fig .f-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c26-acc); animation: c26-pulse 1s infinite; }
@keyframes c26-pulse { 50% { opacity: .3; } }
.c26-fig .f-pop { position: absolute; top: 0; max-width: none; padding: 6px 0; border-radius: 10px; }
.c26-fig .f-pop-font .c26-m-list { max-height: 300px; }
/* Notion の色の見本 */
.c26-sw { display: inline-block; width: 12px; height: 12px; border-radius: 3px; flex: 0 0 auto; box-shadow: inset 0 0 0 1px rgba(15,15,15,.12); background: transparent; }
.c26-sw-brown { background: rgb(159,107,83); } .c26-sw-orange { background: rgb(217,115,13); } .c26-sw-yellow { background: rgb(203,145,47); }
.c26-sw-green { background: rgb(68,131,97); } .c26-sw-blue { background: rgb(51,126,169); } .c26-sw-purple { background: rgb(144,101,176); }
.c26-sw-pink { background: rgb(193,76,138); } .c26-sw-red { background: rgb(212,76,71); } .c26-sw-gray { background: rgb(120,119,116); }
.c26-sw-brown_background { background: rgb(244,238,238); } .c26-sw-orange_background { background: rgb(251,236,221); } .c26-sw-yellow_background { background: rgb(251,243,219); }
.c26-sw-green_background { background: rgb(237,243,236); } .c26-sw-blue_background { background: rgb(231,243,248); } .c26-sw-purple_background { background: rgba(244,240,247,.8); }
.c26-sw-pink_background { background: rgba(249,238,243,.8); } .c26-sw-red_background { background: rgb(253,235,236); } .c26-sw-gray_background { background: rgb(241,241,239); }
.c26-p-slot .sn { max-width: 90px; overflow: hidden; text-overflow: ellipsis; font-size: 13.5px; }
/* 保存ボタン */
#c26-pop .c26-save { font-size: 13px; padding: 0 10px; color: var(--c26-sub); }
#c26-pop .c26-save.dirty { background: rgb(35,131,226); color: #fff; font-weight: 500; }
#c26-pop .c26-save.dirty:hover { background: rgb(0,117,211); }
#c26-pop .c26-save.done { color: rgb(68,131,97); }
#c26-pop .c26-save.done::before { content: '✓'; margin-right: 2px; }
/* Notion の浮きメニュー（z-index 999）より下に置く＝Notion 標準のツールバーやメニューを隠さない */
#c26-pop, #c26-trigger { z-index: 998 !important; }
#c26-pop.c26-top, #c26-trigger.c26-top { z-index: 2147482500 !important; }
#c26-trigger {
  position: fixed; width: 26px; height: 26px; border-radius: 6px; border: 0; padding: 0; cursor: pointer;
  background: var(--c26-bg); color: var(--c26-fg); box-shadow: var(--c26-shadow); display: flex; align-items: center; justify-content: center;
  opacity: .9; animation: c26-in .12s ease-out;
}
#c26-trigger:hover { opacity: 1; background: var(--c26-bg); filter: brightness(.97); }
#c26-trigger[hidden] { display: none; }
#c26-trigger span { font: 14px/1 "Hiragino Mincho ProN", Georgia, serif; }
/* ---------- メニュー ---------- */
.c26-p-menu {
  position: absolute; top: calc(100% + 6px); left: 0; min-width: 200px; max-width: 380px; box-sizing: border-box;
  background: var(--c26-bg); color: var(--c26-fg); border-radius: 6px; box-shadow: var(--c26-shadow); padding: 6px 0;
  font-size: 14px; animation: c26-in .1s ease-out;
}
.c26-p-menu.up { top: auto; bottom: calc(100% + 6px); }
.c26-p-menu[hidden] { display: none; }
.c26-m-qw { padding: 0 10px 6px; }
.c26-m-q {
  width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; height: 28px; padding: 0 8px; border: 0; border-radius: 4px; outline: none;
  background: var(--c26-field); color: inherit; box-shadow: inset 0 0 0 1px var(--c26-line);
}
.c26-m-q:focus { box-shadow: inset 0 0 0 1px rgba(35,131,226,.57), 0 0 0 2px rgba(35,131,226,.35); }
.c26-m-list { max-height: 280px; overflow: auto; overscroll-behavior: contain; padding: 0 4px; }
.c26-m-cols { display: grid; grid-template-columns: repeat(4, 1fr); max-height: 260px; }
.c26-m-cols .c26-m-item:first-child { grid-column: 1 / -1; }
.c26-m-g { font-size: 11.5px; font-weight: 500; color: var(--c26-sub); padding: 12px 10px 4px; }
.c26-m-g:first-child { padding-top: 4px; }
.c26-m-g[hidden], .c26-m-item[hidden] { display: none; }
.c26-m-item {
  min-height: 28px; padding: 0 10px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;
  font-variant-numeric: tabular-nums; transition: background 20ms ease-in;
}
.c26-m-item:hover { background: var(--c26-hover); }
.c26-m-item.on { font-weight: 500; }
.c26-m-item.miss { opacity: .45; }
.c26-m-item .n { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 0 1 auto; }
.c26-m-item .smp { font-size: 13px; color: var(--c26-sub); white-space: nowrap; margin-left: auto; overflow: hidden; }
.c26-bd { font: normal 10px/16px var(--c26-ui); color: var(--c26-sub); background: var(--c26-field); border-radius: 3px; padding: 0 5px; flex: 0 0 auto; }
.c26-m-foot, .c26-m-note { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--c26-sub); padding: 8px 14px 2px; border-top: 1px solid var(--c26-line); margin-top: 6px; white-space: normal; }
.c26-m-note { display: block; }
.c26-m-head { padding: 2px 14px 6px; font-weight: 500; font-size: 13px; }
.c26-m-head span { font-weight: 400; color: var(--c26-sub); font-size: 11.5px; margin-left: 8px; }
.c26-mscope { padding: 0 10px 8px; margin-bottom: 4px; border-bottom: 1px solid var(--c26-line); }
#c26-pop .c26-mscope button { height: 24px; font-size: 12.5px; padding: 0 8px; box-shadow: inset 0 0 0 1px var(--c26-line); }
#c26-pop .c26-mscope button[aria-pressed="true"] { color: var(--c26-acc); background: var(--c26-acc-bg); box-shadow: inset 0 0 0 1px rgba(35,131,226,.35); }
.c26-m-item small { font-size: 10px; color: var(--c26-sub); margin-left: 2px; }
/* 書体の見本 */
.c26-pv { margin: -6px 0 8px; padding: 14px 16px 10px; border-bottom: 1px solid var(--c26-line); border-radius: 6px 6px 0 0; background: var(--c26-field); }
.c26-pv-t { font-size: 24px; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 32px; }
.c26-pv-m { display: flex; gap: 8px; align-items: baseline; margin-top: 6px; font-size: 12px; }
.c26-pv-n { font-weight: 500; }
.c26-pv-b { color: var(--c26-sub); }
.c26-p-menu:has(.c26-pv) { width: 380px; }
/* ブロック設定 */
.c26-p-menu.c26-m-block { width: 340px; max-width: 340px; max-height: 460px; overflow: auto; overscroll-behavior: contain; padding: 8px 0 6px; }
.c26-b-head { padding: 0 10px 8px; border-bottom: 1px solid var(--c26-line); }
.c26-b-chips, .c26-b-scope { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.c26-b-chips { margin-bottom: 6px; }
.c26-b-chips span { color: var(--c26-faint); }
#c26-pop .c26-b-head button, #c26-pop .c26-b-x { height: 24px; font-size: 12.5px; padding: 0 8px; box-shadow: inset 0 0 0 1px var(--c26-line); }
#c26-pop .c26-b-head button[aria-pressed="true"] { color: var(--c26-acc); background: var(--c26-acc-bg); box-shadow: inset 0 0 0 1px rgba(35,131,226,.35); }
.c26-b-body { padding: 4px 4px 0; }
#c26-pop select, .c26-panel select {
  -moz-appearance: none; appearance: none; font: inherit; font-size: 13px; color: inherit; height: 26px; border: 0; border-radius: 4px;
  padding: 0 24px 0 8px; background: var(--c26-field) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpolygon fill='%23999' points='15,17.4 4.8,7 2,9.8 15,23 28,9.8 25.2,7'/%3E%3C/svg%3E") no-repeat right 8px center / 9px;
  box-shadow: inset 0 0 0 1px var(--c26-line); cursor: pointer; outline: none; width: 100%;
}
#c26-pop select:focus, .c26-panel select:focus { box-shadow: inset 0 0 0 1px rgba(35,131,226,.57), 0 0 0 2px rgba(35,131,226,.35); }
#c26-pop select option, .c26-panel select option { color: rgb(55,53,47); background: #fff; }
#c26-pop input[type="range"], .c26-panel input[type="range"] { accent-color: var(--c26-acc); height: 16px; }
#c26-pop .c26-row output, .c26-panel .c26-row output { font-size: 12px; color: var(--c26-sub); }
#c26-pop .c26-row label, .c26-panel .c26-row label { color: var(--c26-sub); opacity: 1; }
#c26-pop input[type="color"], .c26-panel input[type="color"] { width: 28px; height: 22px; border: 0; padding: 0; background: none; border-radius: 4px; }
#c26-pop .c26-b-body .c26-row { grid-template-columns: 84px 1fr 46px; font-size: 13px; }
#c26-pop .c26-b-body select { font: inherit; font-size: 13px; max-width: 100%; }
/* 通知 */
.c26-toast {
  position: fixed; left: 50%; bottom: 32px; transform: translateX(-50%); z-index: 2147483000; background: var(--c26-bg); color: var(--c26-fg);
  box-shadow: var(--c26-shadow); border-radius: 6px; padding: 9px 14px; font: 13.5px/1.4 var(--c26-ui); animation: c26-in .15s ease-out;
}
#c26-fab {
  position: fixed; right: 20px; bottom: 80px; z-index: 2147481000;
  width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(55,53,47,.16);
  background: var(--c26-bg); color: var(--c-texSec, rgba(55,53,47,.65));
  font: 600 12px/28px "Hiragino Mincho ProN", serif; text-align: center; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,.08); opacity: .55; transition: opacity .12s;
}
#c26-fab:hover { opacity: 1; }
html:not([data-c26-content]) #c26-fab { display: none; }
.c26-panel {
  position: fixed; right: 16px; top: 64px; bottom: 16px; z-index: 2147482000; width: 340px;
  display: flex; flex-direction: column; box-sizing: border-box;
  background: var(--c26-bg); color: var(--c26-fg);
  border-radius: 8px; box-shadow: var(--c26-shadow);
  font: 13px/1.5 var(--c26-ui); -webkit-font-smoothing: antialiased;
}
.c26-top { padding: 10px 12px 8px; border-bottom: 1px solid var(--c26-line); }
.c26-top h4 { margin: 0 0 6px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
.c26-top h4 span { font-weight: 400; opacity: .55; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c26-x { margin-left: auto; border: 0; background: transparent; font-size: 16px; cursor: pointer; color: inherit; opacity: .6; }
.c26-seg, .c26-tabs { display: flex; gap: 4px; }
.c26-tabs { margin-top: 8px; }
.c26-seg[hidden] { display: none; }
.c26-seg button, .c26-tabs button, .c26-btn { font: inherit; padding: 3px 9px; border-radius: 6px; border: 1px solid var(--c26-line); background: transparent; color: inherit; cursor: pointer; white-space: nowrap; }
.c26-seg button[aria-pressed="true"], .c26-tabs button[aria-pressed="true"] { background: var(--c26-acc-bg); border-color: rgba(35,131,226,.5); color: var(--c26-acc); }
.c26-body { flex: 1 1 auto; overflow: auto; padding: 8px 12px 12px; }
.c26-note { opacity: .6; margin: 4px 0 8px; }
.c26-item { border: 1px solid var(--c26-line); border-radius: 8px; margin: 6px 0; }
.c26-item > summary { list-style: none; cursor: pointer; padding: 7px 9px; display: flex; align-items: center; gap: 8px; }
.c26-item > summary::-webkit-details-marker { display: none; }
.c26-item[open] > summary { border-bottom: 1px solid var(--c26-line); }
.c26-sum { margin-left: auto; opacity: .55; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; }
.c26-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c26-acc); flex: 0 0 auto; }
.c26-fields { padding: 6px 9px 9px; }
.c26-row { display: grid; grid-template-columns: 86px 1fr 52px; gap: 6px; align-items: center; margin: 4px 0; }
.c26-row label { opacity: .72; }
.c26-row select { width: 100%; font: inherit; }
.c26-row input[type="range"] { width: 100%; }
.c26-row output { text-align: right; opacity: .7; font-variant-numeric: tabular-nums; cursor: pointer; }
.c26-row input[type="color"] { width: 100%; height: 22px; padding: 0; border: 0; background: transparent; }
.c26-check { display: flex; gap: 8px; align-items: flex-start; margin: 8px 0; }
.c26-check small { display: block; opacity: .6; }
.c26-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.c26-btn-pri { background: rgb(35,131,226) !important; color: #fff !important; border-color: transparent !important; font-weight: 500; }
.c26-savest { flex-basis: 100%; font-size: 11px; color: var(--c26-sub); }
.c26-foot { padding: 8px 12px; border-top: 1px solid var(--c26-line); display: flex; gap: 6px; flex-wrap: wrap; }
`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ============================================================
   *  パネル
   * ============================================================ */
  let panel = null;
  const ui = { scope: 'page', tab: 'chars' };
  function summaryOf(st) {
    const s = [];
    if (!st) return '';
    if (st.ff) s.push(fontShort(fontOf(st.ff)));
    if (st.fs) s.push(st.fs + 'px');
    if (st.fw) s.push('太さ' + st.fw);
    if (st.it === 'italic') s.push('斜体');
    if (st.ls !== undefined && st.ls !== '') s.push('字間' + st.ls);
    if (st.lh !== undefined && st.lh !== '') s.push('行' + st.lh);
    if (st.col) s.push('文字色: ' + (COLOR_LABEL[st.col] || st.col));
    if (st.hl) s.push((st.hlm === 'marker' ? 'マーカー: ' : '背景: ') + (COLOR_LABEL[st.hl] || st.hl));
    if (st.em) s.push('傍点');
    if (st.ud) s.push({ solid: '下線', double: '二重線', dotted: '点線', dashed: '破線', wavy: '波線' }[st.ud] || '下線');
    if (st.va) s.push(st.va === 'super' ? '上付き' : '下付き');
    if (st.sc) s.push('スモールキャップ');
    if (st.mt !== undefined) s.push('前' + st.mt);
    if (st.mb !== undefined) s.push('後' + st.mb);
    if (st.ti) s.push('字下げ' + st.ti);
    if (st.dk) s.push('飾り');
    if (st.cbg || st.cbd || st.crad !== undefined || st.cpad !== undefined) s.push('枠');
    return s.join('・');
  }
  function fontSelect(cur) {
    const sel = document.createElement('select');
    const av = detectFonts();
    const o0 = document.createElement('option'); o0.value = ''; o0.textContent = '変えない'; sel.appendChild(o0);
    const curId = fontOf(cur) ? fontOf(cur).id : '';
    for (const grp of CATALOG) {
      const items = FONT_LIST.filter((f) => f.group === grp.g && (av.get(f.id) || f.id === curId || PREFS.showMissing));
      if (!items.length) continue;
      const og = document.createElement('optgroup'); og.label = grp.g;
      for (const f of items) { const o = document.createElement('option'); o.value = f.id; o.textContent = f.name + (av.get(f.id) ? '' : '（未導入）'); o.style.fontFamily = f.css; og.appendChild(o); }
      sel.appendChild(og);
    }
    sel.value = curId;
    return sel;
  }
  function fieldsUI(target, specs, onChange) {
    const box = document.createElement('div');
    box.className = 'c26-fields';
    for (const f of specs) {
      const row = document.createElement('div');
      row.className = 'c26-row';
      const lb = document.createElement('label');
      lb.textContent = f.label;
      row.appendChild(lb);
      if (f.type === 'font') {
        const sel = fontSelect(target[f.k]);
        sel.addEventListener('change', () => { target[f.k] = sel.value; onChange(); });
        row.appendChild(sel);
        row.appendChild(document.createElement('span'));
      } else if (f.type === 'select' || f.type === 'color') {
        const sel = document.createElement('select');
        for (const [v, t] of f.opts) { const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); }
        sel.value = target[f.k] === undefined ? '' : String(target[f.k]);
        row.appendChild(sel);
        if (f.type === 'color') {
          const pick = document.createElement('input');
          pick.type = 'color';
          pick.value = target[f.k + 'Hex'] || '#37352f';
          pick.style.visibility = sel.value === 'custom' ? 'visible' : 'hidden';
          pick.addEventListener('input', () => { target[f.k + 'Hex'] = pick.value; onChange(); });
          sel.addEventListener('change', () => {
            target[f.k] = sel.value;
            pick.style.visibility = sel.value === 'custom' ? 'visible' : 'hidden';
            if (sel.value === 'custom' && !target[f.k + 'Hex']) target[f.k + 'Hex'] = pick.value;
            onChange();
          });
          row.appendChild(pick);
        } else {
          sel.addEventListener('change', () => { target[f.k] = sel.value; onChange(); });
          row.appendChild(document.createElement('span'));
        }
      } else if (f.type === 'num') {
        const inp = document.createElement('input');
        inp.type = 'range'; inp.min = f.min; inp.max = f.max; inp.step = f.step;
        const has = target[f.k] !== undefined && target[f.k] !== '';
        inp.value = has ? target[f.k] : f.min;
        inp.style.opacity = has ? '1' : '.35';
        const out = document.createElement('output');
        out.textContent = has ? target[f.k] + f.unit : '―';
        out.title = 'クリックで「変えない」に戻す';
        inp.addEventListener('input', () => { target[f.k] = Number(inp.value); out.textContent = inp.value + f.unit; inp.style.opacity = '1'; onChange(); });
        out.addEventListener('click', () => { delete target[f.k]; out.textContent = '―'; inp.style.opacity = '.35'; onChange(); });
        row.appendChild(inp);
        row.appendChild(out);
      }
      box.appendChild(row);
    }
    return box;
  }
  function store(make) {
    if (ui.scope === 'global') return DB.global;
    return pageStore(pageIdOf(activeLayout()), make);
  }
  function changed() { save(); writeCss(); }
  function renderPanel() {
    if (!panel) return;
    const layout = activeLayout();
    const pid = pageIdOf(layout);
    panel.querySelector('.c26-top h4 span').textContent = pid ? (pageTitleOf(layout) || '（無題）') : 'ページが見つかりません';
    panel.querySelector('.c26-seg').hidden = ui.tab !== 'blocks';
    for (const b of panel.querySelectorAll('.c26-seg button')) b.setAttribute('aria-pressed', String(b.dataset.v === ui.scope));
    for (const b of panel.querySelectorAll('.c26-tabs button')) b.setAttribute('aria-pressed', String(b.dataset.v === ui.tab));
    const body = panel.querySelector('.c26-body');
    body.textContent = '';
    const note = (t) => { const p = document.createElement('div'); p.className = 'c26-note'; p.textContent = t; body.appendChild(p); };
    const check = (key, label, sub, after) => {
      const l = document.createElement('label'); l.className = 'c26-check';
      const c = document.createElement('input'); c.type = 'checkbox'; c.checked = !!PREFS[key];
      c.addEventListener('change', () => { PREFS[key] = c.checked; savePrefs(); if (after) after(); });
      const d = document.createElement('div'); d.innerHTML = esc(label) + (sub ? '<small>' + esc(sub) + '</small>' : '');
      l.appendChild(c); l.appendChild(d); body.appendChild(l);
    };
    const btn = (parent, label, fn) => { const b = document.createElement('button'); b.className = 'c26-btn'; b.textContent = label; b.addEventListener('click', fn); parent.appendChild(b); return b; };

    if (ui.tab === 'chars') {
      note('本文の文字を選ぶと、画面（その列）の下に書式バーが出ます。左端に「選んだ文字がどう見えるか」の見本、書体・大きさ・太さ・斜体・字間・行高・段落の間隔・ブロック。クリックした瞬間に本文へ反映されます。');
      {
        const row = document.createElement('div'); row.className = 'c26-row'; row.style.gridTemplateColumns = '120px 1fr';
        row.innerHTML = '<label>文字を選んだ時</label>';
        const sel = document.createElement('select');
        for (const [v, t] of [['dock', '下の書式バーを出す'], ['off', '出さない（⌃⌥F の時だけ）']]) { const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); }
        sel.value = PREFS.mode === 'off' ? 'off' : 'dock';
        sel.addEventListener('change', () => { PREFS.mode = sel.value; savePrefs(); });
        row.appendChild(sel); body.appendChild(row);
      }
      check('show', '文字の書式を表示する', 'オフにすると一時的に全部元の見た目に（Notion の色が見える）', () => writeSlotCss());
      check('editAll', 'ポップアップで変える時、同じ書式の文字をまとめて変える', 'オフ（標準）: 選んだ文字だけ変わる（必要なら新しい書式の枠を使う）');
      note('しくみ: 選んだ文字に Notion の「文字色」を 1 つ付け、その色をこのブラウザでは書体・大きさなどに置き換えて見せます（色は見せない）。Notion の本文そのものには手を触れないので、Notion が元に戻すことはありません。書式の枠は Notion の色の数（18）まで。ほかの端末・Notion アプリでは、その部分が色付きの文字として見えます。');
      const list = document.createElement('div'); body.appendChild(list);
      const used = Object.keys(SLOTS);
      if (!used.length) note('まだ書式はありません。');
      for (const c of COLORS.map((x) => x[0]).filter((x) => SLOTS[x])) {
        const sl = SLOTS[c];
        const det = document.createElement('details'); det.className = 'c26-item';
        const sum = document.createElement('summary');
        const sw = document.createElement('span'); sw.className = 'c26-sw c26-sw-' + c; sw.title = 'Notion の色: ' + COLOR_LABEL[c]; sum.appendChild(sw);
        const nm = document.createElement('span'); nm.textContent = sl.name || c; nm.style.fontFamily = fontCss(sl.st && sl.st.ff); nm.style.fontStyle = (sl.st && sl.st.it) || ''; nm.style.fontWeight = (sl.st && sl.st.fw) || ''; sum.appendChild(nm);
        const s2 = document.createElement('span'); s2.className = 'c26-sum'; s2.textContent = summaryOf(sl.st) + (selsOf(c).length ? '' : '（色の目印を未取得）'); sum.appendChild(s2);
        det.appendChild(sum);
        det.addEventListener('toggle', () => {
          if (!det.open || det.querySelector('.c26-fields')) return;
          const wrap = document.createElement('div'); wrap.style.padding = '6px 9px 0';
          const name = document.createElement('input'); name.type = 'text'; name.className = 'c26-name'; name.value = sl.name || ''; name.placeholder = '名前';
          name.addEventListener('change', () => { sl.name = name.value.trim() || sl.name; saveSlots(); nm.textContent = sl.name; });
          wrap.appendChild(name); det.appendChild(wrap);
          const target = Object.assign({}, sl.st);
          det.appendChild(fieldsUI(target, FIELDS.filter((f) => ST_KEYS.includes(f.k)), () => { clean(target); sl.st = normSt(target); sl.saved = normSt(target); saveSlots(); writeSlotCss(); s2.textContent = summaryOf(sl.st); }));
          const act = document.createElement('div'); act.className = 'c26-actions'; act.style.padding = '0 9px 9px';
          const vis = document.createElement('label'); vis.className = 'c26-check'; vis.style.margin = '0';
          vis.innerHTML = '<input type="checkbox"' + (sl.showColor ? ' checked' : '') + '> 色も見せる';
          vis.querySelector('input').addEventListener('change', (e) => { sl.showColor = e.target.checked; saveSlots(); writeSlotCss(); });
          act.appendChild(vis);
          btn(act, 'この書式を外す', () => {
            if (!confirm('テンプレート「' + (sl.name || c) + '」を外します。文字に付いた Notion の色（' + COLOR_LABEL[c] + '）はそのまま残り、このブラウザでも色付き文字に戻ります。')) return;
            delete SLOTS[c]; saveSlots(); writeSlotCss(); renderPanel();
          });
          det.appendChild(act);
        });
        list.appendChild(det);
      }
      const free = reserved().filter((c) => !SLOTS[c]).length;
      note('空いている枠: ' + free + ' 個');
      /* 使わせない色（自分で普通に色付けに使っている色） */
      const det = document.createElement('details'); det.className = 'c26-item';
      det.innerHTML = '<summary><span>書式に使わない Notion の色</span><span class="c26-sum">' + ((PREFS.noReserve || []).length ? (PREFS.noReserve || []).map((c) => COLOR_LABEL[c]).join('・') : 'なし') + '</span></summary>';
      const box = document.createElement('div'); box.style.padding = '6px 9px 9px'; box.style.display = 'grid'; box.style.gridTemplateColumns = '1fr 1fr'; box.style.gap = '2px 10px';
      for (const [c, lab] of COLORS) {
        const l = document.createElement('label'); l.className = 'c26-check'; l.style.margin = '0';
        l.innerHTML = '<input type="checkbox"' + ((PREFS.noReserve || []).includes(c) ? ' checked' : '') + (SLOTS[c] ? ' disabled' : '') + '> <span class="c26-sw c26-sw-' + c + '"></span>' + esc(lab);
        l.querySelector('input').addEventListener('change', (e) => { const set = new Set(PREFS.noReserve || []); if (e.target.checked) set.add(c); else set.delete(c); PREFS.noReserve = [...set]; savePrefs(); });
        box.appendChild(l);
      }
      det.appendChild(box); body.appendChild(det);
      note('ふだん文字の色付けに使っている Notion の色は、ここでチェックしておくと書式の枠に使われません。');
    }

    if (ui.tab === 'blocks') {
      note(ui.scope === 'global' ? 'ブロックの種類ごとの見た目（全ページ共通）。ページごとの指定があればそちらが優先。' : 'ブロックの種類ごとの見た目（このページだけ）。');
      const st = store(false) || { blocks: {} };
      for (const [type, label] of BLOCK_TYPES) {
        const det = document.createElement('details');
        det.className = 'c26-item';
        const sum = document.createElement('summary');
        const t = document.createElement('span'); t.textContent = label; sum.appendChild(t);
        const cur = (st.blocks || {})[type];
        if (cur && Object.keys(cur).length) { const d = document.createElement('span'); d.className = 'c26-dot'; sum.appendChild(d); }
        const s2 = document.createElement('span'); s2.className = 'c26-sum'; s2.textContent = summaryOf(cur); sum.appendChild(s2);
        det.appendChild(sum);
        det.addEventListener('toggle', () => {
          if (!det.open || det.querySelector('.c26-fields')) return;
          const s = store(true);
          if (!s) return;
          s.blocks[type] = s.blocks[type] || {};
          const target = s.blocks[type];
          const specs = FIELDS.concat(type === 'callout' ? CALLOUT_FIELDS : type === 'quote' ? QUOTE_FIELDS : []);
          det.appendChild(fieldsUI(target, specs, () => { clean(target); changed(); s2.textContent = summaryOf(target); }));
          const act = document.createElement('div'); act.className = 'c26-actions'; act.style.padding = '0 9px 9px';
          btn(act, '変えない（消す）', () => { delete s.blocks[type]; changed(); renderPanel(); });
          det.appendChild(act);
        });
        body.appendChild(det);
      }
    }

    if (ui.tab === 'only') {
      const b = blockInfo(lastLeaf);
      if (!b || !b.id || b.pageId !== pid) {
        note('パネルを開く前に、変えたいブロックの中をクリック（カーソルを置く）してください。');
      } else {
        note('このブロックだけ: ' + (TYPE_LABEL[b.type] || 'ブロック') + '「' + (b.text || '…') + '」');
        const s = pageStore(pid, true);
        s.only[b.id] = s.only[b.id] || { __type: b.type };
        const target = s.only[b.id];
        const specs = FIELDS.concat(b.type === 'callout' ? CALLOUT_FIELDS : b.type === 'quote' ? QUOTE_FIELDS : []);
        body.appendChild(fieldsUI(target, specs, () => { clean(target); target.__type = b.type; changed(); }));
        const act = document.createElement('div'); act.className = 'c26-actions'; body.appendChild(act);
        btn(act, 'このブロックの指定を消す', () => { delete s.only[b.id]; changed(); renderPanel(); });
      }
    }
  }
  function exportAll() { return JSON.stringify({ v: 3, styles: DB, slots: SLOTS, prefs: PREFS }); }
  function importAll(o) {
    if (typeof o === 'string') o = JSON.parse(o);
    if (!o) throw new Error('空です');
    if (o.global) DB = o;                       // v1 の書き出し
    else if (o.styles || o.slots) {
      if (o.styles && o.styles.global) DB = o.styles;
      if (o.slots) { SLOTS = o.slots; saveSlots(); writeSlotCss(); }
      if (o.prefs) { PREFS = Object.assign(PREFS, o.prefs); savePrefs(); }
    } else throw new Error('形式が違います');
    changed();
  }
  function openPanel() {
    if (panel) { closePanel(); return; }
    installUiCss();
    hidePop();
    panel = document.createElement('div');
    panel.className = 'c26-panel';
    panel.setAttribute('data-no-passthrough', '1');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '本文の書式');
    panel.innerHTML =
      '<div class="c26-top"><h4>本文の書式 <span></span><button class="c26-x" title="閉じる（Esc）">×</button></h4>' +
      '<div class="c26-tabs"><button data-v="chars">文字</button><button data-v="blocks">ブロック</button><button data-v="only">このブロックだけ</button></div>' +
      '<div class="c26-seg" style="margin-top:6px"><button data-v="page">このページ</button><button data-v="global">全ページ共通</button></div></div>' +
      '<div class="c26-body"></div>' +
      '<div class="c26-foot"><button class="c26-btn" data-a="atelier" title="見た目の全体の設定（⌃⌥A）">Atelier</button><button class="c26-btn c26-btn-pri" data-a="save">保存</button><button class="c26-btn" data-a="refresh">読み直す</button><button class="c26-btn" data-a="export">書き出し</button><button class="c26-btn" data-a="import">読み込み</button><span class="c26-savest"></span></div>';
    panel.querySelector('.c26-x').addEventListener('click', closePanel);
    for (const b of panel.querySelectorAll('.c26-seg button')) b.addEventListener('click', () => { ui.scope = b.dataset.v; renderPanel(); });
    for (const b of panel.querySelectorAll('.c26-tabs button')) b.addEventListener('click', () => { ui.tab = b.dataset.v; renderPanel(); });
    panel.querySelector('[data-a="refresh"]').addEventListener('click', renderPanel);
    panel.querySelector('[data-a="atelier"]').addEventListener('click', () => { closePanel(); openAtelier(); });
    const pst = () => {
      const el = panel && panel.querySelector('.c26-savest');
      if (!el) return;
      const f = (v) => (v === null ? '―' : v ? '○' : '×');
      el.textContent = SAVE_STATE.t ? '最終保存 ' + new Date(SAVE_STATE.t).toLocaleTimeString() + '（ScriptCat ' + f(SAVE_STATE.gm) + ' / IndexedDB ' + f(SAVE_STATE.idb) + '）' : '';
    };
    pst();
    panel.querySelector('[data-a="save"]').addEventListener('click', () => { doSave().then((r) => { pst(); if (r.verified) toast('保存しました'); }); });
    panel.querySelector('[data-a="export"]').addEventListener('click', () => {
      const t = exportAll();
      try { navigator.clipboard.writeText(t); alert('設定をクリップボードに写しました（' + t.length + ' 文字）'); } catch (e) { prompt('設定（コピーしてください）', t); }
    });
    panel.querySelector('[data-a="import"]').addEventListener('click', () => {
      const t = prompt('書き出した設定を貼り付けてください（今の設定は置き換わります）');
      if (!t) return;
      try { importAll(t); renderPanel(); } catch (e) { alert('読み込めませんでした: ' + e.message); }
    });
    for (const ev of ['pointerdown', 'mousedown', 'keydown', 'click', 'beforeinput', 'input']) panel.addEventListener(ev, (e) => { e.stopPropagation(); }, false);
    document.body.appendChild(panel);
    renderPanel();
  }
  function closePanel() { if (panel) panel.remove(); panel = null; }

  let fabT = 0;
  function ensureFabSoon() { if (!fabT) fabT = setTimeout(() => { fabT = 0; ensureFab(); }, 400); }
  function ensureFab() {
    if (!document.body) return;
    try { ensureLang(); } catch (e) { /* noop */ }
    let fab = document.getElementById('c26-fab');
    if (!fab) {
      installUiCss();
      fab = document.createElement('button');
      fab.id = 'c26-fab';
      fab.setAttribute('data-no-passthrough', '1');
      fab.type = 'button';
      fab.title = 'テキストのパネル（⌃⌥F）／本文の設定は ⌃⌥S／右クリックで Atelier（⌃⌥A）';
      fab.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); openAtelier(); });
      fab.textContent = 'Aa';
      fab.addEventListener('mousedown', (e) => e.preventDefault());
      fab.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (popOpen()) hidePop(); else showPop(snapshot(true) || { parts: [], leaf: null, rect: null }); });
      document.body.appendChild(fab);
    }
    const has = !!document.querySelector('.layout ' + CONTENT);
    const de = document.documentElement;
    if (has && !de.hasAttribute('data-c26-content')) de.setAttribute('data-c26-content', '1');
    else if (!has && de.hasAttribute('data-c26-content')) de.removeAttribute('data-c26-content');
  }

  /* 別のタブで変えた時 */
  function reloadKey(key) {
    if (key === LS_SLOTS) {
      const o = lsGet(LS_SLOTS);
      if (o && o.slots) { SLOTS = o.slots; writeSlotCss(); }
    } else if (key === LS_KEY) {
      const o = lsGet(LS_KEY);
      if (o && o.global) { DB = o; writeCss(); }
    } else if (key === LS_PREFS) {
      const o = lsGet(LS_PREFS);
      if (o) PREFS = Object.assign(PREFS, o);
    }
  }
  if (HAS_GM && typeof GM_addValueChangeListener === 'function') {
    for (const k of [LS_SLOTS, LS_KEY, LS_PREFS]) {
      try { GM_addValueChangeListener(k, (name, oldV, newV, remote) => { if (remote) reloadKey(k); }); } catch (e) { /* noop */ }
    }
  } else {
    window.addEventListener('storage', (e) => reloadKey(e.key));
  }

  /* ============================================================
   *  起動
   * ============================================================ */
  const start = () => {
    installMenuCss();
    writeCss();
    writeSlotCss();
    /* 本文には手を触れない。見張るのは「Aa」ボタンの出し入れだけ */
    new MutationObserver(() => ensureFabSoon()).observe(document.documentElement, { childList: true, subtree: true });
    const boot = () => { ensureFab(); adoptNewer(); watchOverlay(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  };
  if (document.documentElement) start();
  else {
    const w = new MutationObserver(() => { if (document.documentElement) { w.disconnect(); start(); } });
    w.observe(document, { childList: true });
  }


  /* ============================================================
   *  v23.0.0  Atelier — 見た目を一か所で（旧 Stylus の Typography 系を内蔵）
   *   ・基礎の層: 旧 Stylus（⁰⁰ ⁰¹ ¹³ ¹⁴ ¹⁵ ¹⁶ ¹⁷ ¹⁶' ²¹ ²⁵）の CSS をそのまま内蔵。層ごとに入切できる。
   *   ・場所ごとの書式: CSS 変数（--constellucentia-* / --cordi-* / --c12g-* / --c16-* / --c33-* …）を
   *     :root:root:root で上書き（Stylus が残っていても必ず勝つ）。変数の無い所は Atelier が規則を書く。
   *   ・どこでも書式: 画面の要素をクリックして選び、その種類すべて（またはそのブロックだけ）に書式を当てる。
   *   ・テーマ: 今の書式に名前を付けて保存・切り替え。書き出し／読み込み（Text Styles の分も一緒に）。
   * ============================================================ */
  const AT_KEY = 'atelier-v1';
  const AT_IDS = { base: 'atelier-base', tokens: 'atelier-tokens', rules: 'atelier-rules', ui: 'atelier-ui' };
  const AT_BASE = {
    foundation: `/**
   * Constellucentia CSS Foundation
   *
   * This release defines only isolated design tokens and safety boundaries.
   * It intentionally does not alter Notion's existing appearance.
   */

  :root {
    /* ----------------------------------------
       Identity
       ---------------------------------------- */

    --constellucentia-version: "0.1.0";

    /* ----------------------------------------
       Typography
       ---------------------------------------- */

    --constellucentia-font-sans:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;

    --constellucentia-font-serif:
      "Iowan Old Style",
      "Palatino Linotype",
      Palatino,
      "Times New Roman",
      serif;

    --constellucentia-font-mono:
      "SFMono-Regular",
      Consolas,
      "Liberation Mono",
      Menlo,
      monospace;

    /* ----------------------------------------
       Spacing
       ---------------------------------------- */

    --constellucentia-space-1: 0.25rem;
    --constellucentia-space-2: 0.5rem;
    --constellucentia-space-3: 0.75rem;
    --constellucentia-space-4: 1rem;
    --constellucentia-space-5: 1.5rem;
    --constellucentia-space-6: 2rem;
    --constellucentia-space-7: 3rem;

    /* ----------------------------------------
       Shape
       ---------------------------------------- */

    --constellucentia-radius-small: 0.375rem;
    --constellucentia-radius-medium: 0.625rem;
    --constellucentia-radius-large: 1rem;
    --constellucentia-radius-round: 9999px;

    /* ----------------------------------------
       Motion
       ---------------------------------------- */

    --constellucentia-duration-fast: 120ms;
    --constellucentia-duration-normal: 200ms;
    --constellucentia-duration-slow: 320ms;

    --constellucentia-ease-standard:
      cubic-bezier(0.2, 0, 0, 1);

    --constellucentia-ease-emphasized:
      cubic-bezier(0.2, 0, 0, 1.2);

    /* ----------------------------------------
       Layering
       ---------------------------------------- */

    --constellucentia-layer-inline: 1;
    --constellucentia-layer-panel: 10;
    --constellucentia-layer-overlay: 100;

    /* ----------------------------------------
       Neutral fallback colors

       These variables are not applied to Notion.
       Future Constellucentia-owned UI may use them.
       ---------------------------------------- */

    --constellucentia-color-text: #25231f;
    --constellucentia-color-text-muted: #6f6a61;
    --constellucentia-color-surface: #faf9f6;
    --constellucentia-color-surface-raised: #ffffff;
    --constellucentia-color-border: #dedbd4;
    --constellucentia-color-accent: #7668a8;
    --constellucentia-color-focus: #6757a3;
    --constellucentia-color-shadow: rgb(23 20 31 / 14%);
  }

  /**
   * Safety boundary
   *
   * Only elements explicitly owned by Constellucentia receive these basic
   * layout rules. There is no global reset for Notion elements.
   */

  :where(
    [data-constellucentia-root],
    [data-constellucentia-root] *,
    [data-constellucentia-component],
    [data-constellucentia-component] *
  ) {
    box-sizing: border-box;
  }

  /**
   * Constellucentia-owned interactive elements inherit typography.
   *
   * This does not target Notion's own buttons, inputs, or editable blocks.
   */

  :where(
    [data-constellucentia-root] button,
    [data-constellucentia-root] input,
    [data-constellucentia-root] select,
    [data-constellucentia-root] textarea
  ) {
    font: inherit;
  }

  /**
   * Accessible focus treatment for Constellucentia-owned controls only.
   */

  :where(
    [data-constellucentia-root] button,
    [data-constellucentia-root] input,
    [data-constellucentia-root] select,
    [data-constellucentia-root] textarea,
    [data-constellucentia-root] a[href],
    [data-constellucentia-root] [tabindex]:not([tabindex="-1"])
  ):focus-visible {
    outline: 2px solid var(--constellucentia-color-focus);
    outline-offset: 2px;
  }

  /**
   * Reduced-motion support
   *
   * Only Constellucentia-owned elements are affected.
   * Notion's own animations are not modified.
   */

  @media (prefers-reduced-motion: reduce) {
    :root {
      --constellucentia-duration-fast: 0ms;
      --constellucentia-duration-normal: 0ms;
      --constellucentia-duration-slow: 0ms;
    }

    :where(
      [data-constellucentia-root],
      [data-constellucentia-root] *,
      [data-constellucentia-component],
      [data-constellucentia-component] *
    ) {
      scroll-behavior: auto !important;
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }

/**
   * Constellucentia — Font Families
   *
   * Purpose:
   * Define reusable local macOS font-family variables.
   *
   * This file:
   * - does not apply fonts to Notion;
   * - does not modify Notion elements;
   * - does not download external fonts;
   * - does not declare @font-face;
   * - does not replace the foundation UserCSS;
   * - can be enabled or disabled independently in Stylus.
   */

  :root {
    /* ========================================
       Japanese Mincho — Hiragino
       ======================================== */

    --constellucentia-font-jp-hiragino-mincho:
      "Hiragino Mincho ProN",
      "Hiragino Mincho Pro",
      serif;

    /* ========================================
       Japanese Mincho — Yu Mincho
       ======================================== */

    --constellucentia-font-jp-yu-mincho:
      "YuMincho",
      "Yu Mincho",
      "Hiragino Mincho ProN",
      serif;

    --constellucentia-font-jp-yu-mincho-kana:
      "YuMincho +36p Kana",
      "YuMincho",
      "Yu Mincho",
      "Hiragino Mincho ProN",
      serif;

    /* ========================================
       Japanese Mincho — Toppan Bunkyu
       ======================================== */

    --constellucentia-font-jp-toppan-mincho:
      "Toppan Bunkyu Mincho",
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      serif;

    /* ========================================
       Japanese Mincho — BIZ UD
       ======================================== */

    --constellucentia-font-jp-biz-ud-mincho:
      "BIZ UDMincho",
      "YuMincho",
      "Hiragino Mincho ProN",
      serif;

    /* ========================================
       Japanese literary — Klee
       ======================================== */

    --constellucentia-font-jp-klee:
      "Klee",
      "Klee Medium",
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      serif;

    /* ========================================
       Japanese literary — Yu Kyokasho
       ======================================== */

    --constellucentia-font-jp-yu-kyokasho:
      "YuKyokasho",
      "Yu Kyokasho",
      "YuMincho",
      "Hiragino Mincho ProN",
      serif;

    --constellucentia-font-jp-yu-kyokasho-yoko:
      "YuKyokasho Yoko",
      "Yu Kyokasho Yoko",
      "YuKyokasho",
      "YuMincho",
      "Hiragino Mincho ProN",
      serif;

    /* ========================================
       Japanese general Mincho
       ======================================== */

    --constellucentia-font-jp-mincho:
      "YuMincho +36p Kana",
      "YuMincho",
      "Yu Mincho",
      "Hiragino Mincho ProN",
      "Hiragino Mincho Pro",
      "Toppan Bunkyu Mincho",
      "BIZ UDMincho",
      serif;

    /* ========================================
       Latin serif — New York
       ======================================== */

    --constellucentia-font-latin-new-york:
      "New York",
      "Iowan Old Style",
      Charter,
      Baskerville,
      Georgia,
      serif;

    /* ========================================
       Latin serif — Iowan Old Style
       ======================================== */

    --constellucentia-font-latin-iowan:
      "Iowan Old Style",
      Charter,
      "Palatino Linotype",
      Palatino,
      Georgia,
      serif;

    /* ========================================
       Latin serif — Hoefler Text
       ======================================== */

    --constellucentia-font-latin-hoefler:
      "Hoefler Text",
      "Iowan Old Style",
      Baskerville,
      Georgia,
      serif;

    /* ========================================
       Latin serif — Baskerville
       ======================================== */

    --constellucentia-font-latin-baskerville:
      Baskerville,
      "Baskerville Old Face",
      "Iowan Old Style",
      Georgia,
      serif;

    /* ========================================
       Latin serif — Charter
       ======================================== */

    --constellucentia-font-latin-charter:
      Charter,
      "Iowan Old Style",
      Georgia,
      serif;

    /* ========================================
       Latin serif — Cochin
       ======================================== */

    --constellucentia-font-latin-cochin:
      Cochin,
      "Iowan Old Style",
      Baskerville,
      Georgia,
      serif;

    /* ========================================
       Latin serif — Palatino
       ======================================== */

    --constellucentia-font-latin-palatino:
      Palatino,
      "Palatino Linotype",
      "Book Antiqua",
      Georgia,
      serif;

    /* ========================================
       Latin serif — Big Caslon
       ======================================== */

    --constellucentia-font-latin-big-caslon:
      "Big Caslon",
      "Adobe Caslon Pro",
      "Hoefler Text",
      Baskerville,
      Georgia,
      serif;

    /* ========================================
       Latin serif — Didot
       ======================================== */

    --constellucentia-font-latin-didot:
      Didot,
      "Bodoni 72",
      "Bodoni MT",
      "Times New Roman",
      serif;

    /* ========================================
       Latin serif — Bodoni
       ======================================== */

    --constellucentia-font-latin-bodoni:
      "Bodoni 72",
      "Bodoni 72 Oldstyle",
      "Bodoni 72 Smallcaps",
      "Bodoni 72 Poster",
      "Bodoni MT",
      Didot,
      "Times New Roman",
      serif;

    /* ========================================
       Latin serif — Canela
       ======================================== */

    --constellucentia-font-latin-canela:
      Canela,
      "Canela Text",
      "Canela Deck",
      "Iowan Old Style",
      Baskerville,
      Georgia,
      serif;

    /* ========================================
       Latin serif — Domaine
       ======================================== */

    --constellucentia-font-latin-domaine:
      "Domaine Display",
      "Domaine Text",
      Canela,
      Didot,
      "Bodoni 72",
      Georgia,
      serif;

    /* ========================================
       Latin serif — Brill
       ======================================== */

    --constellucentia-font-latin-brill:
      "Brill Roman",
      Brill,
      "Iowan Old Style",
      Charter,
      Georgia,
      serif;

    /* ========================================
       Latin serif — Georgia
       ======================================== */

    --constellucentia-font-latin-georgia:
      Georgia,
      "Times New Roman",
      Times,
      serif;

    /* ========================================
       Latin serif — Times
       ======================================== */

    --constellucentia-font-latin-times:
      "Times New Roman",
      Times,
      serif;

    /* ========================================
       Latin serif — General
       ======================================== */

    --constellucentia-font-latin-serif:
      "Iowan Old Style",
      Charter,
      Baskerville,
      "Hoefler Text",
      Palatino,
      Georgia,
      "Times New Roman",
      serif;

    /* ========================================
       Combined serif — Apple
       ======================================== */

    --constellucentia-font-serif-apple:
      "New York",
      "YuMincho +36p Kana",
      "YuMincho",
      "Yu Mincho",
      "Hiragino Mincho ProN",
      "Iowan Old Style",
      Charter,
      Georgia,
      serif;

    /* ========================================
       Combined serif — Editorial
       ======================================== */

    --constellucentia-font-serif-editorial:
      "Iowan Old Style",
      "YuMincho +36p Kana",
      "YuMincho",
      "Yu Mincho",
      "Hiragino Mincho ProN",
      "Toppan Bunkyu Mincho",
      "BIZ UDMincho",
      Georgia,
      serif;

    /* ========================================
       Combined serif — Literary
       ======================================== */

    --constellucentia-font-serif-literary:
      "Hoefler Text",
      "Toppan Bunkyu Mincho",
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      Baskerville,
      Georgia,
      serif;

    /* ========================================
       Combined serif — Classical
       ======================================== */

    --constellucentia-font-serif-classical:
      Baskerville,
      "Hiragino Mincho ProN",
      "YuMincho",
      "Toppan Bunkyu Mincho",
      "Iowan Old Style",
      Georgia,
      serif;

    /* ========================================
       Combined serif — Book
       ======================================== */

    --constellucentia-font-serif-book:
      Charter,
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      "BIZ UDMincho",
      "Iowan Old Style",
      Georgia,
      serif;

    /* ========================================
       Combined serif — Contemporary
       ======================================== */

    --constellucentia-font-serif-contemporary:
      Canela,
      "Canela Text",
      "Toppan Bunkyu Mincho",
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      "Iowan Old Style",
      Georgia,
      serif;

    /* ========================================
       Combined serif — Scholarly
       ======================================== */

    --constellucentia-font-serif-scholarly:
      "Brill Roman",
      Brill,
      "BIZ UDMincho",
      "YuMincho",
      "Hiragino Mincho ProN",
      Charter,
      Georgia,
      serif;

    /* ========================================
       Combined serif — Personal
       ======================================== */

    --constellucentia-font-serif-personal:
      Cochin,
      Klee,
      "Klee Medium",
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      "Iowan Old Style",
      Georgia,
      serif;

    /* ========================================
       Combined serif — Textbook
       ======================================== */

    --constellucentia-font-serif-textbook:
      "Iowan Old Style",
      "YuKyokasho",
      "Yu Kyokasho",
      "YuMincho",
      "Hiragino Mincho ProN",
      Charter,
      Georgia,
      serif;

    /* ========================================
       Combined display — Elegant
       ======================================== */

    --constellucentia-font-display-elegant:
      Didot,
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      "Bodoni 72",
      "Times New Roman",
      serif;

    /* ========================================
       Combined display — Dramatic
       ======================================== */

    --constellucentia-font-display-dramatic:
      "Bodoni 72",
      "Bodoni 72 Poster",
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      Didot,
      "Times New Roman",
      serif;

    /* ========================================
       Combined display — Classical
       ======================================== */

    --constellucentia-font-display-classical:
      "Big Caslon",
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      "Hoefler Text",
      Baskerville,
      Georgia,
      serif;

    /* ========================================
       Combined display — Contemporary
       ======================================== */

    --constellucentia-font-display-contemporary:
      "Domaine Display",
      Canela,
      "Canela Deck",
      "Toppan Bunkyu Mincho",
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      Didot,
      Georgia,
      serif;

    /* ========================================
       Combined display — Apple
       ======================================== */

    --constellucentia-font-display-apple:
      "New York",
      "YuMincho +36p Kana",
      "YuMincho",
      "Hiragino Mincho ProN",
      "Iowan Old Style",
      Charter,
      Georgia,
      serif;

    /* ========================================
       Japanese sans-serif
       ======================================== */

    --constellucentia-font-jp-sans:
      "Hiragino Sans",
      "BIZ UDGothic",
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;

    /* ========================================
       Latin sans-serif — Apple UI
       ======================================== */

    --constellucentia-font-sans-apple:
      -apple-system,
      BlinkMacSystemFont,
      "SF Pro Text",
      "SF Pro Display",
      "Helvetica Neue",
      Arial,
      sans-serif;

    /* ========================================
       Combined sans-serif — UI
       ======================================== */

    --constellucentia-font-sans-ui:
      -apple-system,
      BlinkMacSystemFont,
      "SF Pro Text",
      "SF Pro Display",
      "Hiragino Sans",
      "BIZ UDGothic",
      "Helvetica Neue",
      Arial,
      sans-serif;

    /* ========================================
       Combined sans-serif — Humanist
       ======================================== */

    --constellucentia-font-sans-humanist:
      Avenir,
      "Avenir Next",
      "Hiragino Sans",
      "BIZ UDGothic",
      "Helvetica Neue",
      Arial,
      sans-serif;

    /* ========================================
       Combined sans-serif — Editorial
       ======================================== */

    --constellucentia-font-sans-editorial:
      Graphik,
      "Founders Grotesk",
      Avenir,
      "Avenir Next",
      "Hiragino Sans",
      "BIZ UDGothic",
      "Helvetica Neue",
      Arial,
      sans-serif;

    /* ========================================
       Monospace
       ======================================== */

    --constellucentia-font-mono:
      "SFMono-Regular",
      "SF Mono",
      Menlo,
      Monaco,
      Consolas,
      "Liberation Mono",
      monospace;
  }`,
    dbTitle: `:root {
    /*
     * ────────────────────────────────────────
     * フルDBタイトル：フォント
     * ────────────────────────────────────────
     *
     * Latin：
     *   Canela Deck
     *
     * 日本語：
     *   Hiragino Mincho ProN
     *
     * Canela Deckが利用できない場合は、
     * Hoefler Textへフォールバックする。
     */

    --constellucentia-full-db-title-font-family:
      "Canela Deck",
      "Hoefler Text",
      "Iowan Old Style",
      "Hiragino Mincho ProN",
      "Hiragino Mincho Pro",
      "Yu Mincho",
      "YuMincho",
      serif;

    /*
     * 日本語部分を明示的に指定する場合の書体。
     */
    --constellucentia-full-db-title-japanese-font-family:
      "Hiragino Mincho ProN",
      "Hiragino Mincho Pro",
      "Yu Mincho",
      "YuMincho",
      serif;

    /*
     * 27px：控えめ
     * 28px：推奨
     * 30px：タイトル感を強める
     */
    --constellucentia-full-db-title-size: 20px;

    /*
     * Canela Deck Medium。
     *
     * 700では黒みが強く詰まって見えるため、
     * 500を初期値とする。
     */
    --constellucentia-full-db-title-weight: 500;

    /*
     * 旧設定の1.05から余裕を持たせる。
     *
     * 1.12：やや詰める
     * 1.16：推奨
     * 1.20：ゆったり
     */
    --constellucentia-full-db-title-line-height: 1.16;

    /*
     * 0.012em：控えめ
     * 0.018em：推奨
     * 0.022em：余韻を強める
     */
    --constellucentia-full-db-title-letter-spacing: 0.085em;

    /*
     * ────────────────────────────────────────
     * アイコン
     * ────────────────────────────────────────
     */

    --constellucentia-full-db-icon-size: 36px;

    /*
     * アイコンとタイトルの間隔
     *
     * 狭くする：6px〜8px
     * 推奨値：  10px〜12px
     * 広くする：14px
     */
    --constellucentia-full-db-icon-title-gap: 12px;

    /*
     * ────────────────────────────────────────
     * 水平位置
     * ────────────────────────────────────────
     *
     * タイトル行全体の左側余白。
     *
     * 左へ：数値を小さくする
     * 右へ：数値を大きくする
     */
    --constellucentia-full-db-row-inset: 8px;

    /*
     * 行全体の追加水平移動。
     *
     * 左へ：-1px、-2px
     * 右へ： 1px、 2px
     */
    --constellucentia-full-db-row-x: 0px;

    /*
     * ────────────────────────────────────────
     * 垂直位置
     * ────────────────────────────────────────
     */

    /*
     * アイコンを上へ：-1px
     * アイコンを下へ： 1px
     */
    --constellucentia-full-db-icon-y: 1px;

    /*
     * Canela DeckはCormorant Garamondより字面が安定するため、
     * 初期値は1pxとする。
     *
     * タイトルを上へ：-1px、0px
     * タイトルを下へ：1px、2px
     */
    --constellucentia-full-db-title-y: 1px;
  }

  /*
   * ─────────────────────────────────────────
   * フルDBのタイトル行
   * ─────────────────────────────────────────
   *
   * 直接の子に「Change page icon」を持ち、
   * その隣にcollection_view_pageのh1を持つ行だけを対象にする。
   */

  div:has(
    > .notion-record-icon[role="button"][aria-label="Change page icon"]
    + div
    h1[aria-roledescription="page title"]
  ) {
    box-sizing: border-box !important;

    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;

    column-gap:
      var(--constellucentia-full-db-icon-title-gap) !important;

    /*
     * 元のアイコンにあるmargin-inline-start: 8pxは、
     * アイコン側で調整可能な変数へ置き換える。
     */
    transform:
      translateX(
        var(--constellucentia-full-db-row-x)
      ) !important;
  }

  /*
   * タイトルを収める右側領域。
   */

  div:has(
    > .notion-record-icon[role="button"][aria-label="Change page icon"]
    + div
    h1[aria-roledescription="page title"]
  )
    > .notion-record-icon
    + div {
    min-width: 0 !important;
    flex: 1 1 auto !important;
  }

  /*
   * ─────────────────────────────────────────
   * フルDBアイコン
   * ─────────────────────────────────────────
   */

  div:has(
    > .notion-record-icon[role="button"][aria-label="Change page icon"]
    + div
    h1[aria-roledescription="page title"]
  )
    > .notion-record-icon[role="button"][aria-label="Change page icon"] {
    box-sizing: border-box !important;

    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    flex:
      0 0 var(--constellucentia-full-db-icon-size) !important;

    width:
      var(--constellucentia-full-db-icon-size) !important;

    min-width:
      var(--constellucentia-full-db-icon-size) !important;

    max-width:
      var(--constellucentia-full-db-icon-size) !important;

    height:
      var(--constellucentia-full-db-icon-size) !important;

    min-height:
      var(--constellucentia-full-db-icon-size) !important;

    max-height:
      var(--constellucentia-full-db-icon-size) !important;

    /*
     * 元の8pxを調整可能な変数へ置き換える。
     */
    margin-inline-start:
      var(--constellucentia-full-db-row-inset) !important;

    margin-inline-end: 0 !important;
    margin-bottom: 0 !important;

    border-radius: 4px !important;

    transform:
      translateY(
        var(--constellucentia-full-db-icon-y)
      ) !important;
  }

  /*
   * アイコン内部のラッパー。
   */

  div:has(
    > .notion-record-icon[role="button"][aria-label="Change page icon"]
    + div
    h1[aria-roledescription="page title"]
  )
    > .notion-record-icon
    > div,
  div:has(
    > .notion-record-icon[role="button"][aria-label="Change page icon"]
    + div
    h1[aria-roledescription="page title"]
  )
    > .notion-record-icon
    > div
    > div {
    box-sizing: border-box !important;

    width:
      var(--constellucentia-full-db-icon-size) !important;

    height:
      var(--constellucentia-full-db-icon-size) !important;
  }

  /*
   * 画像形式のアイコン。
   *
   * /icons/butterfly_gray.svg?mode=light
   * /icons/gem_gray.svg?mode=light
   *
   * など、Notionが設定している元のsrcは変更しない。
   */

  div:has(
    > .notion-record-icon[role="button"][aria-label="Change page icon"]
    + div
    h1[aria-roledescription="page title"]
  )
    > .notion-record-icon
    img {
    display: block !important;

    width:
      var(--constellucentia-full-db-icon-size) !important;

    min-width:
      var(--constellucentia-full-db-icon-size) !important;

    max-width:
      var(--constellucentia-full-db-icon-size) !important;

    height:
      var(--constellucentia-full-db-icon-size) !important;

    min-height:
      var(--constellucentia-full-db-icon-size) !important;

    max-height:
      var(--constellucentia-full-db-icon-size) !important;

    object-fit: contain !important;
    border-radius: 4px !important;
  }

  /*
   * SVG形式のアイコンにも対応。
   */

  div:has(
    > .notion-record-icon[role="button"][aria-label="Change page icon"]
    + div
    h1[aria-roledescription="page title"]
  )
    > .notion-record-icon
    svg {
    display: block !important;

    width:
      var(--constellucentia-full-db-icon-size) !important;

    min-width:
      var(--constellucentia-full-db-icon-size) !important;

    max-width:
      var(--constellucentia-full-db-icon-size) !important;

    height:
      var(--constellucentia-full-db-icon-size) !important;

    min-height:
      var(--constellucentia-full-db-icon-size) !important;

    max-height:
      var(--constellucentia-full-db-icon-size) !important;
  }

  /*
   * Emojiアイコンが使われた場合にも対応する。
   */

  div:has(
    > .notion-record-icon[role="button"][aria-label="Change page icon"]
    + div
    h1[aria-roledescription="page title"]
  )
    > .notion-record-icon {
    font-size:
      var(--constellucentia-full-db-icon-size) !important;

    line-height: 1 !important;
  }

  /*
   * ─────────────────────────────────────────
   * フルDBタイトルの外側ブロック
   * ─────────────────────────────────────────
   */

  div.notion-selectable.notion-collection_view_page-block:has(
    > h1[aria-roledescription="page title"]
  ) {
    min-width: 0 !important;

    display: flex !important;
    align-items: center !important;

    color: var(--c-texPri) !important;

    font-family:
      var(--constellucentia-full-db-title-font-family) !important;

    font-size:
      var(--constellucentia-full-db-title-size) !important;

    font-weight:
      var(--constellucentia-full-db-title-weight) !important;

    line-height:
      var(--constellucentia-full-db-title-line-height) !important;

    letter-spacing:
      var(--constellucentia-full-db-title-letter-spacing) !important;

    font-synthesis: none !important;
    font-kerning: normal !important;

    font-variant-ligatures:
      common-ligatures contextual !important;

    text-rendering: optimizeLegibility !important;
    -webkit-font-smoothing: antialiased !important;

    transform:
      translateY(
        var(--constellucentia-full-db-title-y)
      ) !important;
  }

  /*
   * ─────────────────────────────────────────
   * h1本体
   * ─────────────────────────────────────────
   */

  div.notion-selectable.notion-collection_view_page-block
    > h1[aria-roledescription="page title"] {
    box-sizing: border-box !important;

    max-width: 100% !important;
    width: 100% !important;

    /*
     * 元のpadding-inline: 8pxを解除し、
     * アイコンとの距離は親のcolumn-gapで管理する。
     */
    padding-inline-start: 0 !important;
    padding-inline-end: 8px !important;

    padding-top: 0 !important;
    padding-bottom: 0 !important;

    margin: 0 !important;

    color: var(--c-texPri) !important;

    font-family:
      var(--constellucentia-full-db-title-font-family) !important;

    font-size:
      var(--constellucentia-full-db-title-size) !important;

    font-weight:
      var(--constellucentia-full-db-title-weight) !important;

    line-height:
      var(--constellucentia-full-db-title-line-height) !important;

    letter-spacing:
      var(--constellucentia-full-db-title-letter-spacing) !important;

    font-synthesis: none !important;
    font-kerning: normal !important;

    font-variant-ligatures:
      common-ligatures contextual !important;

    text-rendering: optimizeLegibility !important;
    -webkit-font-smoothing: antialiased !important;

    white-space: break-spaces !important;
    overflow-wrap: anywhere !important;
  }

  /*
   * Notionがタイトルをspanへ分割した場合にも、
   * フォントとサイズを確実に継承させる。
   */

  div.notion-selectable.notion-collection_view_page-block
    > h1[aria-roledescription="page title"]
    > span {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    letter-spacing: inherit !important;

    font-synthesis: none !important;
    font-kerning: normal !important;

    font-variant-ligatures:
      common-ligatures contextual !important;
  }

  /*
   * spanより深い要素へ分割された場合にも継承する。
   */

  div.notion-selectable.notion-collection_view_page-block
    > h1[aria-roledescription="page title"]
    span
    span {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    letter-spacing: inherit !important;
  }

  /*
   * 日本語文字はCanela Deckに収録されていないため、
   * 自動的にヒラギノ明朝へフォールバックする。
   *
   * lang属性が付いた場合にも明示的に固定する。
   */

  div.notion-selectable.notion-collection_view_page-block
    > h1[aria-roledescription="page title"]
    :lang(ja) {
    font-family:
      var(
        --constellucentia-full-db-title-japanese-font-family
      ) !important;
  }`,
    dbDesc: `:root {
    --constellucentia-full-db-description-gap: 15px;
    --constellucentia-full-db-description-right-inset: 120px;
    --constellucentia-full-db-description-y: 0px;
    --constellucentia-full-db-description-line-height: 25px;
    --constellucentia-full-db-quote-line-width: 2px;
    --constellucentia-full-db-quote-line-gap: 10px;
    --constellucentia-full-db-quote-line-block-inset: 3px;
    --constellucentia-full-db-quote-line-x: 0px;
    --constellucentia-full-db-quote-line-y: 0px;
    --constellucentia-full-db-quote-line-opacity: 0.55;
    --constellucentia-full-db-quote-line-color: var(--c-texTer, #787774);
  }

  html body div[contenteditable="true"][data-content-editable-leaf="true"][data-constellucentia-full-db-description-aligned="true"] {
    box-sizing: border-box !important;
    position: relative !important;
    margin-block-start: var(--constellucentia-full-db-description-gap) !important;
    line-height: var(--constellucentia-full-db-description-line-height) !important;
    padding-inline-start: calc(var(--constellucentia-full-db-description-inset, 12px) + var(--constellucentia-full-db-quote-line-width) + var(--constellucentia-full-db-quote-line-gap)) !important;
    padding-inline-end: var(--constellucentia-full-db-description-right-inset) !important;
    transform: translateY(var(--constellucentia-full-db-description-y)) !important;
    overflow: visible !important;
  }

  html body div[contenteditable="true"][data-content-editable-leaf="true"][data-constellucentia-full-db-description-aligned="true"]::before {
    content: "" !important;
    position: absolute !important;
    inset-inline-start: calc(var(--constellucentia-full-db-description-inset, 12px) + var(--constellucentia-full-db-quote-line-x)) !important;
    inset-block-start: calc(var(--constellucentia-full-db-quote-line-block-inset) + var(--constellucentia-full-db-quote-line-y)) !important;
    inset-block-end: calc(var(--constellucentia-full-db-quote-line-block-inset) - var(--constellucentia-full-db-quote-line-y)) !important;
    width: var(--constellucentia-full-db-quote-line-width) !important;
    min-width: var(--constellucentia-full-db-quote-line-width) !important;
    max-width: var(--constellucentia-full-db-quote-line-width) !important;
    background-color: var(--constellucentia-full-db-quote-line-color) !important;
    opacity: var(--constellucentia-full-db-quote-line-opacity) !important;
    border-radius: 999px !important;
    pointer-events: none !important;
    user-select: none !important;
    z-index: 1 !important;
  }

  html body div.content-editable-leaf-rtl.notranslate[contenteditable="true"][data-content-editable-leaf="true"][data-constellucentia-full-db-description-aligned="true"],
  html body div.notranslate[contenteditable="true"][data-content-editable-leaf="true"][data-constellucentia-full-db-description-aligned="true"],
  html body div[contenteditable="true"][data-content-editable-leaf="true"][data-constellucentia-full-db-description-aligned="true"] {
    line-height: var(--constellucentia-full-db-description-line-height) !important;
  }

:root {
    /*
     * ────────────────────────────────────────
     * 説明文のタイポグラフィ
     * ────────────────────────────────────────
     */
    /*
     * フォントサイズ
     *
     * 控えめ：14px
     * 推奨：  15px
     * 大きめ：16px
     */
    --constellucentia-full-db-description-font-size: 12px;

    /*
     * フォントウェイト
     *
     * 本文としては400を推奨。
     */
    --constellucentia-full-db-description-font-weight: 400;

    /*
     * 行間
     *
     * コンパクト：1.5
     * 推奨：      1.65
     * ゆったり：  1.75
     */
    --constellucentia-full-db-description-line-height: 1.65;

    /*
     * 字間
     *
     * Source Serif 4とヒラギノ明朝の双方に
     * 控えめな余白を与える。
     */
    --constellucentia-full-db-description-letter-spacing: 0.070em;

    /*
     * 英語・ラテン文字
     */
    --constellucentia-full-db-description-serif: "Source Serif 4";

    /*
     * 日本語
     */
    --constellucentia-full-db-description-mincho: "Hiragino Mincho ProN";
}

/*
   * ─────────────────────────────────────────
   * フルDB説明文
   * ─────────────────────────────────────────
   *
   * 位置合わせ用ScriptCatが付与する属性を使用する。
   * 印が「説明文そのもの」に付いても「外側の枠」に付いても当たる。
   *
   * 揺れ防止：
   * ページタイトル(h1)を含む要素・h1の中身には絶対に当てない。
   * （通常ページの編集領域全体に印が付いても無視される）
   */
:is(
    div[contenteditable="true"][data-constellucentia-full-db-description-aligned="true"],
    [data-constellucentia-full-db-description-aligned="true"]:not(:has(h1)) div[contenteditable="true"]
):not(:has(h1)):not(h1 *) {
    color: var(--c-texPri) !important;

    font-family: var(--constellucentia-full-db-description-serif),
    var(--constellucentia-full-db-description-mincho),
    "Hiragino Mincho Pro",
    "Yu Mincho",
    "YuMincho",
    serif !important;

    font-size: var(--constellucentia-full-db-description-font-size) !important;

    font-weight: var(--constellucentia-full-db-description-font-weight) !important;

    line-height: var(--constellucentia-full-db-description-line-height) !important;

    letter-spacing: var(--constellucentia-full-db-description-letter-spacing) !important;

    /*
     * ブラウザによる疑似太字・疑似斜体を防ぐ。
     */
    font-synthesis: none !important;

    /*
     * 欧文のカーニングと合字を有効化。
     */
    font-kerning: normal !important;

    font-variant-ligatures: common-ligatures contextual !important;

    font-feature-settings: "kern" 1,
    "liga" 1,
    "clig" 1 !important;

    /*
     * Macでの文字描画を整える。
     */
    -webkit-font-smoothing: antialiased !important;

    text-rendering: optimizeLegibility !important;
}

/*
   * Notionが説明文内部をspanなどに分割した場合にも、
   * 親のタイポグラフィを確実に継承させる。
   */
:is(
    div[contenteditable="true"][data-constellucentia-full-db-description-aligned="true"],
    [data-constellucentia-full-db-description-aligned="true"]:not(:has(h1)) div[contenteditable="true"]
):not(:has(h1)):not(h1 *) > :is(span, div, p) {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    letter-spacing: inherit !important;
}

/*
   * lang="ja"が付与された場合は、
   * 日本語部分をヒラギノ明朝へ明示的に固定する。
   */
:is(
    div[contenteditable="true"][data-constellucentia-full-db-description-aligned="true"],
    [data-constellucentia-full-db-description-aligned="true"]:not(:has(h1)) div[contenteditable="true"]
):not(:has(h1)):not(h1 *) :lang(ja) {
    font-family: var(--constellucentia-full-db-description-mincho),
    "Hiragino Mincho Pro",
    "Yu Mincho",
    "YuMincho",
    serif !important;
}

/*
   * lang="en"が付与された場合は、
   * Source Serif 4へ明示的に固定する。
   */
:is(
    div[contenteditable="true"][data-constellucentia-full-db-description-aligned="true"],
    [data-constellucentia-full-db-description-aligned="true"]:not(:has(h1)) div[contenteditable="true"]
):not(:has(h1)):not(h1 *) :lang(en) {
    font-family: var(--constellucentia-full-db-description-serif),
    "Times New Roman",
    serif !important;
}`,
    relation: `/* ==========================================================================
   Cordivestium Relation Display — v0.3.0（13番 Stage 1.5: 双子セレクタ追加）
   --------------------------------------------------------------------------
   v0.2.0 までの全ルールは一字一句不変。v0.3.0 は末尾に「双子」を足しただけ:
   実測（Probe v0.2.0）で、テーブルビューのセルには xjp7ctv の包みが差し込まれて
   flex-wrap が4段目に居る形がある（+N の付いたセルで確認・恒常的）。
   既存ルールの鎖は「property-value > div > div[flex-wrap]」の2段前提なので、
   その形では全部外れる。双子は同じルールを「> div > div > div > div[flex-wrap]」
   の4段形でも当て直す。包みが一時物なら双子は単に無反応で害なし。
   ========================================================================== */

:root {
  --cordi-relation-font-size: 11px;
  --cordi-relation-line-height: 2.5;
  --cordi-relation-font-weight: 500;

  --cordi-relation-icon-size: 20px;
  --cordi-relation-icon-gap: 8px;
  --cordi-relation-icon-left: 0px;
  --cordi-relation-icon-top: 0px;
  --cordi-relation-icon-first-line-offset: 4px;

  --cordi-relation-multi-gap: 3px;
  --cordi-relation-text-top: 0px;
}

@font-face {
  font-family: "Cordivestium Relation";
  src: local("Hiragino Mincho ProN"), local("Hiragino Mincho Pro"), local("Yu Mincho"), local("YuMincho"), local("Noto Serif CJK JP"), local("Noto Serif JP");
  unicode-range: U+3000-30FF, U+31F0-31FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}

@font-face {
  font-family: "Cordivestium Relation";
  src:
    local("Charter"), local("Charter-Roman"), local("Bitstream Charter"), local("Charis SIL"),
    local("Athelas"),
    local("Cambria"), local("Sitka Text"),
    local("Palatino"), local("Palatino-Roman"), local("Palatino Linotype"), local("Book Antiqua"),
    local("Literata"), local("Source Serif 4"),
    local("Noto Serif"), local("Noto Serif JP"),
    local("Hiragino Mincho ProN"), local("Hiragino Mincho Pro"),
    local("Yu Mincho"), local("YuMincho"), local("Noto Serif CJK JP"),
    local("Times New Roman"), local("TimesNewRomanPSMT"), local("Times New Roman Regular"), local("Times");
  unicode-range: U+0030-0039;
}

@font-face {
  font-family: "Cordivestium Relation";
  src: local("Baskerville"), local("Libre Baskerville"), local("Times New Roman"), local("Times");
  unicode-range: U+0020-002F, U+003A-024F;
}

/* 実DOM限定: relation 実体を含む property-value だけをセル内縦中央へ */
[data-testid="property-value"]:has(> div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) {
  display: flex !important;
  align-items: center !important;
}

[data-testid="property-value"]:has(> div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) > div {
  width: 100% !important;
}

/* 実DOM限定: property-value > div(width:100%) > div(flex-wrap:wrap)
   かつ、その中に relation 実体がある場合だけ触る。
   既存の display / overflow は極力いじらず、scroll阻害を避ける。 */
[data-testid="property-value"] > div > div[style*="flex-wrap: wrap"]:has(> div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) {
  row-gap: var(--cordi-relation-multi-gap) !important;
  column-gap: 0 !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
}

/* (1) v0.2.0: 関係実体の包みだけを全幅の行に。+N チップは対象外。 */
[data-testid="property-value"] > div > div[style*="flex-wrap: wrap"]:has(> div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) > div:has(> div[style*="display: inline"]) {
  flex: 0 0 100% !important;
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
}

/* relation 1件本体だけを変える */
[data-testid="property-value"] > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) {
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
  font-family: "Cordivestium Relation", "Hiragino Mincho ProN", "Yu Mincho", serif !important;
  font-size: var(--cordi-relation-font-size) !important;
  line-height: var(--cordi-relation-line-height) !important;
}

[data-testid="property-value"] > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) > .notion-record-icon {
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 var(--cordi-relation-icon-size) !important;
  width: var(--cordi-relation-icon-size) !important;
  height: var(--cordi-relation-icon-size) !important;
  min-width: var(--cordi-relation-icon-size) !important;
  min-height: var(--cordi-relation-icon-size) !important;
  max-width: var(--cordi-relation-icon-size) !important;
  max-height: var(--cordi-relation-icon-size) !important;
  margin-inline-start: 0 !important;
  margin-inline-end: var(--cordi-relation-icon-gap) !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  vertical-align: top !important;
  align-self: flex-start !important;
  position: relative !important;
  left: var(--cordi-relation-icon-left) !important;
  top: calc(var(--cordi-relation-icon-first-line-offset) + var(--cordi-relation-icon-top)) !important;
}

[data-testid="property-value"] > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) > .notion-record-icon * {
  box-sizing: border-box !important;
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
}

[data-testid="property-value"] > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) > .notion-record-icon img {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  object-fit: contain !important;
}

[data-testid="property-value"] > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) > span.notranslate:not([data-token-index]) {
  box-sizing: border-box !important;
  display: block !important;
  flex: 1 1 auto !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
  top: var(--cordi-relation-text-top) !important;
  font-family: "Cordivestium Relation", "Hiragino Mincho ProN", "Yu Mincho", serif !important;
  font-size: var(--cordi-relation-font-size) !important;
  font-weight: var(--cordi-relation-font-weight) !important;
  line-height: var(--cordi-relation-line-height) !important;
  white-space: break-spaces !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
  line-break: auto !important;
  text-decoration: none !important;
  font-variant-numeric: lining-nums proportional-nums !important;
  font-feature-settings: "lnum" 1, "pnum" 1 !important;
  background-image: none !important;
  background: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

/* gap が hover 時の差し込み DOM で負けても保険をかける */
[data-testid="property-value"] > div > div[style*="flex-wrap: wrap"]:has(> div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) > div + div {
  margin-top: var(--cordi-relation-multi-gap) !important;
}

/* (2) v0.2.0: +N チップ（10件超のときだけNotionが差す「+ 11」の箱）。
   全幅にせず最後の行の下に小さく添える。中身（色・文字）はNotion由来のまま。
   10件以下のセルには +N チップが存在しないので、このルールは何も触らない。 */
[data-testid="property-value"] > div > div[style*="flex-wrap: wrap"]:has(> div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) > div:not(:has(> div[style*="display: inline"])) {
  box-sizing: border-box !important;
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: var(--cordi-relation-multi-gap) 0 0 0 !important;
  font-size: var(--cordi-relation-font-size) !important;
  line-height: var(--cordi-relation-line-height) !important;
}

  /* ====== v0.3.0: 双子セレクタ（xjp7ctv 包みで flex-wrap が4段目に居る形・中身は既存ルールと同じ）====== */

[data-testid="property-value"]:has(> div > div > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) {
  display: flex !important;
  align-items: center !important;
}

[data-testid="property-value"]:has(> div > div > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) > div {
  width: 100% !important;
}

[data-testid="property-value"] > div > div > div > div[style*="flex-wrap: wrap"]:has(> div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) {
  row-gap: var(--cordi-relation-multi-gap) !important;
  column-gap: 0 !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
}

[data-testid="property-value"] > div > div > div > div[style*="flex-wrap: wrap"]:has(> div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) > div:has(> div[style*="display: inline"]) {
  flex: 0 0 100% !important;
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
}

[data-testid="property-value"] > div > div > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) {
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
  font-family: "Cordivestium Relation", "Hiragino Mincho ProN", "Yu Mincho", serif !important;
  font-size: var(--cordi-relation-font-size) !important;
  line-height: var(--cordi-relation-line-height) !important;
}

[data-testid="property-value"] > div > div > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) > .notion-record-icon {
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 var(--cordi-relation-icon-size) !important;
  width: var(--cordi-relation-icon-size) !important;
  height: var(--cordi-relation-icon-size) !important;
  min-width: var(--cordi-relation-icon-size) !important;
  min-height: var(--cordi-relation-icon-size) !important;
  max-width: var(--cordi-relation-icon-size) !important;
  max-height: var(--cordi-relation-icon-size) !important;
  margin-inline-start: 0 !important;
  margin-inline-end: var(--cordi-relation-icon-gap) !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  vertical-align: top !important;
  align-self: flex-start !important;
  position: relative !important;
  left: var(--cordi-relation-icon-left) !important;
  top: calc(var(--cordi-relation-icon-first-line-offset) + var(--cordi-relation-icon-top)) !important;
}

[data-testid="property-value"] > div > div > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) > .notion-record-icon * {
  box-sizing: border-box !important;
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
}

[data-testid="property-value"] > div > div > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) > .notion-record-icon img {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  object-fit: contain !important;
}

[data-testid="property-value"] > div > div > div > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"]:has(> .notion-record-icon + span.notranslate:not([data-token-index])) > span.notranslate:not([data-token-index]) {
  box-sizing: border-box !important;
  display: block !important;
  flex: 1 1 auto !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
  top: var(--cordi-relation-text-top) !important;
  font-family: "Cordivestium Relation", "Hiragino Mincho ProN", "Yu Mincho", serif !important;
  font-size: var(--cordi-relation-font-size) !important;
  font-weight: var(--cordi-relation-font-weight) !important;
  line-height: var(--cordi-relation-line-height) !important;
  white-space: break-spaces !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
  line-break: auto !important;
  text-decoration: none !important;
  font-variant-numeric: lining-nums proportional-nums !important;
  font-feature-settings: "lnum" 1, "pnum" 1 !important;
  background-image: none !important;
  background: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

[data-testid="property-value"] > div > div > div > div[style*="flex-wrap: wrap"]:has(> div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) > div + div {
  margin-top: var(--cordi-relation-multi-gap) !important;
}

[data-testid="property-value"] > div > div > div > div[style*="flex-wrap: wrap"]:has(> div > div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])) > div:not(:has(> div[style*="display: inline"])) {
  box-sizing: border-box !important;
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: var(--cordi-relation-multi-gap) 0 0 0 !important;
  font-size: var(--cordi-relation-font-size) !important;
  line-height: var(--cordi-relation-line-height) !important;
}`,
    primary: `/* =============================================================================
   Cordivestium Primary Column Typography ─ v2.0 全文版
   -----------------------------------------------------------------------------
   このファイル1枚で完結します。Stylus の既存スタイルを「全選択 → 貼り付け」で
   置き換えてください。手作業での一部差し替えは不要です。

   元の全文からの変更:
     ① 数字の @font-face（unicode-range: U+0030-0039）の src を20候補に差し替え済み
     ② 末尾に「複数行の行のための救済ブロック」を追加
   それ以外（:root の変数群・.cordivestium-v1121-* の各ルール）は一字一句そのまま。

   v1.9 → v2.0 の変更点（恒久対策）:
     ★題字列を「列番号」で指すのをやめました。
       data-col-index は見えている順番なので、Date を1つ足しただけで Works が
       2→3 にずれ、救済ブロックが Series を題字と誤認して折り返す事故になりました。
       同じ事故は列の入れ替え・追加・削除のたびに起こります。

     新しい見印は data-c12-primary（属性）です。
       ¹⁵ Primary Column Tagger が、⁰⁹ Primary Column Marker の印
       （.cordivestium-v1121-title-value）から「いま題字は何番か」を毎回読み直し、
       その列の全セルへ data-c12-primary="1" を付けます。
       列を増やしても入れ替えても、次に⁰⁹が印を付けた瞬間に追従します。

     ★このCSSと¹⁵はセットです。¹⁵が動いていないと、この救済ブロックは
       どこにも当たりません（高い行の題字が上に浮く元の状態に戻ります）。
       確認: DevTools で __c12t.state() → index と tags が出れば動いています。

   v1.8 → v1.9 の変更点（今回の本題）:
     ★Date プロパティを1つ増やしたことで、列の並びが変わりました
       （Creators → Date → Series → Works → Synopsis）。
       data-col-index は「見えている順番」なので、題字(Works)は 2 → 3 にずれ、
       下の救済ブロックが 1列ぶん手前 ＝ Series列を題字と誤認していました。
       その結果、Series列だけが題字の服（padding-inline-end 8px / white-space:pre-wrap /
       line-height 2.5）を着てしまい、高い行で「ガリレ」＋「オ」に折り返す崩れが出ました。
       救済ブロックの data-col-index を 2 → 3 に直しただけです（他は v1.8 と一字一句同じ）。
     ＊このブロックは index 依存なので、今後また列を増減・並べ替えしたら同じ事故が起きます。
       恒久対策は「題字セルに見印を付けるスクリプト＋indexを使わないCSS」(v2.0) です。

   v1.7 → v1.8 の変更点:
     probe7 の実測で、縦の並びとアイコンの大きさは正規の行と一致しました
     （縦差 0.0px / アイコン箱 18x18 絵 18x18）。残ったのは横の2点だけだったので、
     その2点ぶんだけ足しました（それ以外は v1.7 と一字一句同じ）。

       実測（未適用の高い行 vs 正規の行）:
         アイコン左 0.8 ／ 文字左 28.8 ／ アイコンと文字の間隔 10   ← 未適用
         アイコン左 6.4 ／ 文字左 30.4 ／ アイコンと文字の間隔 6    ← 正規

       ① アイコン本体の左マージンを、⁰⁹ の変数そのものにしました。
          その変数は ¹³/C12 が 2px に上書きしています（＝正規の行が実際に受けている値）。
          未適用の行は inline の -2px のままだったので、間隔が 4px 広がっていました。
          → 間隔 10px → 6px（正規と同じ）／アイコン左 0.8 → 4.8
       ② アイコン箱の左マージンに 1.6px 足しました（アイコンと文字が一緒に右へ）。
          → アイコン左 4.8 → 6.4 ／ 文字左 28.8 → 30.4（正規と同じ）

     :has() と複合 :not() は一切使いません（環境でルールごと捨てられる事故を防ぐため、
     対象は属性と構造だけで特定します）。
     ★このブロックは .notion-table-view-cell[data-c12-primary] の中だけに当たります。
       タブバー・ヘッダー・他の列には 1 文字も当たりません。
    ============================================================================= */

@font-face {
  font-family: "Cordivestium Works Title";
  src:
    local("Charter"), local("Charter-Roman"), local("Bitstream Charter"), local("Charis SIL"),
    local("Athelas"),
    local("Cambria"), local("Sitka Text"),
    local("Palatino"), local("Palatino-Roman"), local("Palatino Linotype"), local("Book Antiqua"),
    local("Literata"), local("Source Serif 4"),
    local("Noto Serif"), local("Noto Serif JP"),
    local("Hiragino Mincho ProN"), local("Hiragino Mincho Pro"),
    local("Yu Mincho"), local("YuMincho"), local("Noto Serif CJK JP"),
    local("Times New Roman"), local("TimesNewRomanPSMT");
  unicode-range: U+0030-0039;
}

@font-face {
  font-family: "Cordivestium Works Title";
  src: local("Baskerville"), local("Baskerville-Regular"), local("Libre Baskerville");
  unicode-range: U+0000-002F, U+003A-00FF, U+2000-206F;
}

@font-face {
  font-family: "Cordivestium Works Title";
  src: local("Hiragino Mincho ProN"), local("Hiragino Mincho Pro"), local("YuMincho"), local("Yu Mincho"), local("Noto Serif CJK JP");
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}

:root {
  --cordivestium-title-wrap-hanging-mode: off;
  --cordivestium-title-wrap-hanging-extra-px: 0;
  --cordivestium-title-auto-align-to-header: false;
  --cordivestium-title-fallback-inset-px: 8;
  --cordivestium-title-horizontal-offset-px: 0;
  --cordivestium-title-header-align-tolerance-px: 0.5;
  --cordivestium-title-header-align-max-passes: 3;
  --cordivestium-title-font-size: 11px;
  --cordivestium-title-line-height: 2.5;
  --cordivestium-title-font-weight: 500;
  --cordivestium-title-icon-size: 20px;
  --cordivestium-title-gap: 8px;
  --cordivestium-title-inset: 4.4px;
  --cordivestium-title-padding-top: 4.5px;
  --cordivestium-title-padding-bottom: 4.5px;
  --cordivestium-title-padding-inline-end: 8px;
  --cordivestium-title-icon-margin-inline-start: -2px;
  --cordivestium-title-icon-margin-inline-end: 3px;
  --cordivestium-title-icon-margin-top: -2px;
  --cordivestium-title-icon-top: 0px;
  --cordivestium-title-icon-first-line-offset: 4px;
  --cordivestium-title-text-top: 0px;
  --cordivestium-title-shell-top: 0px;
  --cordivestium-title-icon-top: 5px;
    --cordivestium-title-text-padding-inline-end: 0px;
  }

.cordivestium-v1121-title-value {
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
  min-height: 47px !important;
  padding-top: var(--cordivestium-title-padding-top) !important;
  padding-bottom: var(--cordivestium-title-padding-bottom) !important;
  padding-inline-start: var(--cordivestium-title-inset, 8px) !important;
  padding-inline-end: var(--cordivestium-title-padding-inline-end) !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}

.cordivestium-v1121-title-shell {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  gap: var(--cordivestium-title-gap) !important;
  width: 100% !important;
  min-width: 0 !important;
  white-space: normal !important;
  overflow: visible !important;
  position: relative !important;
  top: var(--cordivestium-title-shell-top) !important;
}

.cordivestium-v1121-title-icon-container {
  flex: 0 0 var(--cordivestium-title-icon-size) !important;
  width: var(--cordivestium-title-icon-size) !important;
  min-width: var(--cordivestium-title-icon-size) !important;
  max-width: var(--cordivestium-title-icon-size) !important;
  height: var(--cordivestium-title-icon-size) !important;
  margin: 0 !important;
  padding: 0 !important;
  align-self: flex-start !important;
}

.cordivestium-v1121-title-icon-root {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 var(--cordivestium-title-icon-size) !important;
  width: var(--cordivestium-title-icon-size) !important;
  min-width: var(--cordivestium-title-icon-size) !important;
  max-width: var(--cordivestium-title-icon-size) !important;
  height: var(--cordivestium-title-icon-size) !important;
  min-height: var(--cordivestium-title-icon-size) !important;
  max-height: var(--cordivestium-title-icon-size) !important;
  margin-inline-start: var(--cordivestium-title-icon-margin-inline-start) !important;
  margin-inline-end: var(--cordivestium-title-icon-margin-inline-end) !important;
  margin-top: var(--cordivestium-title-icon-margin-top) !important;
  margin-bottom: 0 !important;
  padding: 0 !important;
  align-self: flex-start !important;
  vertical-align: text-top !important;
  position: relative !important;
  top: calc(var(--cordivestium-title-icon-first-line-offset) + var(--cordivestium-title-icon-top)) !important;
}

.cordivestium-v1121-title-icon-image {
  display: block !important;
  width: var(--cordivestium-title-icon-size) !important;
  height: var(--cordivestium-title-icon-size) !important;
  min-width: var(--cordivestium-title-icon-size) !important;
  min-height: var(--cordivestium-title-icon-size) !important;
  max-width: var(--cordivestium-title-icon-size) !important;
  max-height: var(--cordivestium-title-icon-size) !important;
  object-fit: contain !important;
}

.cordivestium-v1121-title-text-root {
  display: block !important;
  flex: 1 1 auto !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 var(--cordivestium-title-text-padding-inline-end) 0 0 !important;
  white-space: pre-wrap !important;
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
  text-overflow: clip !important;
  position: relative !important;
  top: var(--cordivestium-title-text-top) !important;
  line-height: var(--cordivestium-title-line-height) !important;
  padding-left: var(--cordivestium-hang, 0px) !important;
  text-indent: calc(-1 * var(--cordivestium-hang, 0px)) !important;
}

.cordivestium-v1121-title-wrapper {
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  flex-basis: auto !important;
  flex-grow: 0 !important;
  flex-shrink: 1 !important;
  display: contents !important;
  white-space: pre-wrap !important;
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
  text-overflow: clip !important;
}

.cordivestium-v1121-title-token {
  display: inline !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  margin: 0 !important;
  font-family: "Cordivestium Works Title", "Times New Roman", Baskerville, "Hiragino Mincho ProN", "Yu Mincho", serif !important;
  font-size: var(--cordivestium-title-font-size) !important;
  font-weight: var(--cordivestium-title-font-weight) !important;
  line-height: var(--cordivestium-title-line-height) !important;
  white-space: break-spaces !important;
  overflow-wrap: anywhere !important;
  word-break: break-word !important;
  line-break: auto !important;
  text-overflow: clip !important;
  text-decoration: none !important;
  background-image: none !important;
  background: none !important;
  box-shadow: none !important;
}

.cordivestium-v1121-title-value > .cordivestium-v1121-title-shell {
  width: 100% !important;
}



/* hover UI は Marker が識別だけ行い、位置や表示は Notion 既定に任せる */


/* ==========================================================================
   [v1.7 追加] 行が高くなった行の題字セルを、正規の行とまったく同じ見た目にする
   --------------------------------------------------------------------------
   他の列（あらすじ等）が折り返して行が高くなると、Notion は題字セルを描き直し、
   data-token-index が落ちる。その結果 ⁰⁹ Primary Column Marker はクラス付与を
   中止し、題字だけ CSS が丸ごと外れて アイコンが上に浮き・小さく・間隔が詰まる。

   ここは「クラスが付かなかったセル」だけを :not(...) で狙い、⁰⁹ が正規の行に
   当てている宣言と同じものを、同じ値で当てます（値はすべて上の :root 変数）。
   正規の行（⁰⁹のクラスが付いた行）には 1 文字も当たりません。

   特定方法（:has() も複合 :not() も使わない）:
     値箱   = [data-testid="property-value"] かつ ⁰⁹クラス無し
     シェル = その直下で position:absolute でない子（hover の OPEN ボタンは absolute）
     アイコン箱 = シェルの子で inline に flex-shrink を持つもの
     文字箱     = シェルの子で inline に flex-grow を持つもの

   [v2.0] 見印は data-c12-primary（¹⁵が付ける属性）。列番号はもう使いません。
   [v1.8] 横位置の実測合わせ（probe7）:
     ＊アイコン本体の左マージンは「⁰⁹ の変数」を使う（= ¹³/C12 が 2px に上書きして
       いる値そのもの）。未適用の行は inline の -2px のままだったため、間隔が 4px
       広く出ていた（未適用 10px / 正規 6px）。
     ＊アイコン箱に左マージン 1.6px。アイコンと文字が一緒に右へ 1.6px 動く
       （アイコン左 0.8 → 6.4 / 文字左 28.8 → 30.4 = 正規と同じ）。
   ========================================================================== */

/* ① 値箱（= .cordivestium-v1121-title-value） */
.notion-table-view-cell[data-c12-primary] [data-testid="property-value"]:not(.cordivestium-v1121-title-value) {
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
  min-height: 47px !important;
  padding-top: var(--cordivestium-title-padding-top) !important;
  padding-bottom: var(--cordivestium-title-padding-bottom) !important;
  padding-inline-start: var(--cordivestium-title-inset, 8px) !important;
  padding-inline-end: var(--cordivestium-title-padding-inline-end) !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}

/* ② シェル（= .cordivestium-v1121-title-shell） */
.notion-table-view-cell[data-c12-primary] [data-testid="property-value"]:not(.cordivestium-v1121-title-value) > div:not([style*="absolute"]) {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  gap: var(--cordivestium-title-gap) !important;
  width: 100% !important;
  min-width: 0 !important;
  white-space: normal !important;
  overflow: visible !important;
  position: relative !important;
  top: var(--cordivestium-title-shell-top) !important;
}

/* ③ アイコン箱（= .cordivestium-v1121-title-icon-container）
      ★v1.8: 左マージン 1.6px（実測合わせ）。アイコンと文字が一緒に右へ動く。 */
.notion-table-view-cell[data-c12-primary] [data-testid="property-value"]:not(.cordivestium-v1121-title-value) > div:not([style*="absolute"]) > div[style*="flex-shrink"] {
  flex: 0 0 var(--cordivestium-title-icon-size) !important;
  width: var(--cordivestium-title-icon-size) !important;
  min-width: var(--cordivestium-title-icon-size) !important;
  max-width: var(--cordivestium-title-icon-size) !important;
  height: var(--cordivestium-title-icon-size) !important;
  margin: 0 !important;
  margin-inline-start: 1.6px !important;
  padding: 0 !important;
  align-self: flex-start !important;
}

/* ④ アイコン本体（= .cordivestium-v1121-title-icon-root）
      ★縦位置の要：⁰⁹ は position:relative + top:(first-line-offset + icon-top) で
        アイコンを文字の1行目に合わせます。これが無いと複数行の行だけ上に浮きます。
      ★v1.8: 左マージンは ⁰⁹ の変数そのもの（¹³/C12 が 2px に上書きしている値）。
        inline の -2px のままにすると、アイコンと文字の間隔が 4px 広くなります。 */
.notion-table-view-cell[data-c12-primary] [data-testid="property-value"]:not(.cordivestium-v1121-title-value) > div:not([style*="absolute"]) > div[style*="flex-shrink"] > .notion-record-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 var(--cordivestium-title-icon-size) !important;
  width: var(--cordivestium-title-icon-size) !important;
  min-width: var(--cordivestium-title-icon-size) !important;
  max-width: var(--cordivestium-title-icon-size) !important;
  height: var(--cordivestium-title-icon-size) !important;
  min-height: var(--cordivestium-title-icon-size) !important;
  max-height: var(--cordivestium-title-icon-size) !important;
  margin-inline-start: var(--cordivestium-title-icon-margin-inline-start, -2px) !important;
  padding: 0 !important;
  align-self: flex-start !important;
  vertical-align: text-top !important;
  position: relative !important;
  top: calc(var(--cordivestium-title-icon-first-line-offset) + var(--cordivestium-title-icon-top)) !important;
}

/* ⑤ アイコン画像（= .cordivestium-v1121-title-icon-image） */
.notion-table-view-cell[data-c12-primary] [data-testid="property-value"]:not(.cordivestium-v1121-title-value) > div:not([style*="absolute"]) > div[style*="flex-shrink"] > .notion-record-icon img,
.notion-table-view-cell[data-c12-primary] [data-testid="property-value"]:not(.cordivestium-v1121-title-value) > div:not([style*="absolute"]) > div[style*="flex-shrink"] > .notion-record-icon svg {
  display: block !important;
  width: var(--cordivestium-title-icon-size) !important;
  height: var(--cordivestium-title-icon-size) !important;
  min-width: var(--cordivestium-title-icon-size) !important;
  min-height: var(--cordivestium-title-icon-size) !important;
  max-width: var(--cordivestium-title-icon-size) !important;
  max-height: var(--cordivestium-title-icon-size) !important;
  object-fit: contain !important;
}

/* ⑥ 文字箱（= .cordivestium-v1121-title-text-root） */
.notion-table-view-cell[data-c12-primary] [data-testid="property-value"]:not(.cordivestium-v1121-title-value) > div:not([style*="absolute"]) > div[style*="flex-grow"] {
  display: block !important;
  flex: 1 1 auto !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 var(--cordivestium-title-text-padding-inline-end) 0 0 !important;
  white-space: pre-wrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
  position: relative !important;
  top: var(--cordivestium-title-text-top) !important;
  line-height: var(--cordivestium-title-line-height) !important;
}

/* ⑦ 文字（= .cordivestium-v1121-title-token） */
.notion-table-view-cell[data-c12-primary] [data-testid="property-value"]:not(.cordivestium-v1121-title-value) > div:not([style*="absolute"]) > div[style*="flex-grow"] span {
  display: inline !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  margin: 0 !important;
  font-family: "Cordivestium Works Title", "Times New Roman", Baskerville, "Hiragino Mincho ProN", "Yu Mincho", serif !important;
  font-size: var(--cordivestium-title-font-size) !important;
  font-weight: var(--cordivestium-title-font-weight) !important;
  line-height: var(--cordivestium-title-line-height) !important;
  white-space: break-spaces !important;
  overflow-wrap: anywhere !important;
  word-break: break-word !important;
  line-break: auto !important;
  text-overflow: clip !important;
  text-decoration: none !important;
  background-image: none !important;
  background: none !important;
  box-shadow: none !important;
}`,
    tabs: `/*
 * « No » ¹⁷ _ View Tab Divider  v2.0.0
 * DBビューのタブ：区切り線＋背景OFF＋押下時の揺れ止め
 * v2.0.0: 区切り線は ¹⁹ が付ける目印 data-c19-tab で描く（DOMの深さに依存しない）。
 *         ¹⁹ が無い・止めている時だけ、従来の構造セレクタで描く（予備）。
 */
:root {
    --c17-divider-color: color-mix(in srgb, var(--c-texSec) 35%, transparent);
    --c17-divider-height: 14px;
    --c17-divider-width: 1px;
    --c17-divider-space: 2px;
}

/* スクロールバーの出入りによる横揺れ止め */
.notion-frame .notion-scroller.vertical,
.notion-frame > .notion-scroller {
    scrollbar-gutter: stable !important;
}

/* タブ列のアニメーションを無効化 */
[role="tablist"],
[role="tablist"] *,
[role="tablist"] *::before,
[role="tablist"] *::after {
    transition: none !important;
    animation: none !important;
}

/* 押した時の縮み・ずれを無効化（アイコンの拡大 scale(1.2) には触れない） */
[role="tablist"] [role="tab"].notion-collection-view-tab,
[role="tablist"] [role="tab"].notion-collection-view-tab:is(:hover, :active, :focus, :focus-visible, [aria-selected="true"]),
[role="tablist"] .notion-collection-view-tab-button,
[role="tablist"] .notion-collection-view-tab-button:active,
[role="tablist"] [data-popup-origin="true"],
[role="tablist"] [data-popup-origin="true"]:active,
[role="tablist"] [role="tab"] > span,
[role="tablist"] > div > div[style*="contents"] [role="button"],
[role="tablist"] > div > div[style*="contents"] [role="button"]:active {
    transform: none !important;
    translate: none !important;
    scale: none !important;
    outline-offset: 0 !important;
}

/* 選択中でも文字の太さ・余白を変えない（幅が変わらないように） */
[role="tablist"] [role="tab"].notion-collection-view-tab {
    font-weight: 500 !important;
    padding: 6px 12px !important;
    border: 0 !important;
}

/* 表・ボード・ギャラリー・リストの切り替えアニメーションを無効化 */
.notion-collection_view_page-block,
.notion-collection_view_page-block > div,
.notion-frame .notion-collection-view-body,
.notion-frame .notion-collection-view-body > div,
.notion-frame .notion-table-view,
.notion-frame .notion-board-view,
.notion-frame .notion-gallery-view,
.notion-frame .notion-list-view,
.notion-frame .notion-scroller.horizontal {
    transition: none !important;
    animation: none !important;
    scroll-behavior: auto !important;
}

/* 区切り線（本線）：¹⁹ の目印で描く。0番目のタブには付けない */
[role="tablist"] [data-c19-tab] {
    display: flex !important;
    align-items: center !important;
}
[role="tablist"] [data-c19-tab]:not([data-c19-tab="0"])::before {
    content: "";
    flex: 0 0 auto;
    width: var(--c17-divider-width);
    height: var(--c17-divider-height);
    margin-inline: var(--c17-divider-space);
    background: var(--c17-divider-color);
    border-radius: 1px;
    pointer-events: none;
}

/* 区切り線（予備）：目印が一つも無いタブ列だけ、従来の構造で描く */
[role="tablist"]:not(:has([data-c19-tab])) > div > div > div:has(> div > .notion-collection-view-tab-button) {
    align-items: center !important;
}
[role="tablist"]:not(:has([data-c19-tab])) > div > div > div:has(> div > .notion-collection-view-tab-button):not(:first-child)::before {
    content: "";
    flex: 0 0 auto;
    width: var(--c17-divider-width);
    height: var(--c17-divider-height);
    margin-inline: var(--c17-divider-space);
    background: var(--c17-divider-color);
    border-radius: 1px;
    pointer-events: none;
}

/* 背景OFF（全タブ・全状態） */
[role="tablist"] [role="tab"].notion-collection-view-tab,
[role="tablist"] [role="tab"].notion-collection-view-tab:is(:hover, :active, :focus, :focus-visible, [aria-selected="true"]),
[role="tablist"] .notion-collection-view-tab-button {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    --x-l5dkfo: transparent !important;
    --x-umghl: transparent !important;
    --x-ph3bdx: transparent !important;
    --x-13tdqfb: transparent !important;
}

/* 「N more…」ボタンも背景OFF */
[role="tablist"] > div > div[style*="contents"] [role="button"],
[role="tablist"] > div > div[style*="contents"] [role="button"]:is(:hover, :active, :focus, :focus-visible) {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    --x-umghl: transparent !important;
    --x-ph3bdx: transparent !important;
    --x-13tdqfb: transparent !important;
}

/* 任意：タブ幅をそろえる場合は、この下の開始行と終了行のコメント記号を消す */
/*
[role="tablist"] [role="tab"].notion-collection-view-tab {
    width: 112px !important;
    min-width: 112px !important;
    justify-content: center !important;
}
*/`,
    group: `/*
 * « No »　²¹ _ Group Header Layout  v1.0.0
 * 旧 ¹² が JS のインライン style で書いていた書式を、構造セレクタへ移したもの。
 * 見出しが作り直されても最初のフレームから整った状態で描かれる。
 * 数値は ¹² v1.0.0 が :root に書く変数（--c12g-*）。フルDBだけ・インラインDB・ピークは除外。
 */
@font-face {
  font-family: "Cordivestium Group Header";
  src: local("Hiragino Mincho ProN"), local("Hiragino Mincho Pro"), local("Yu Mincho"), local("YuMincho"), local("Noto Serif CJK JP"), local("Noto Serif JP");
  unicode-range: U+3000-30FF, U+31F0-31FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Cordivestium Group Header";
  src: local("Baskerville"), local("Libre Baskerville"), local("Times New Roman"), local("Times");
  unicode-range: U+0020-024F;
}

/* ブロック */
html[data-c05-full="1"] .notion-collection_view_page-block:has(> [role="button"][aria-expanded]):has(> a[role="link"] .notion-record-icon):not(.notion-collection_view-block *):not(.notion-peek-renderer *) {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  column-gap: 0 !important;
  height: auto !important;
  min-height: 0 !important;
  width: 100% !important;
}

/* 開閉ボタン（見えないが押せる状態のまま DOM に残す） */
html[data-c05-full="1"] .notion-collection_view_page-block:has(> a[role="link"] .notion-record-icon):not(.notion-collection_view-block *):not(.notion-peek-renderer *) > [role="button"][aria-expanded] {
  width: 0 !important; min-width: 0 !important; max-width: 0 !important;
  height: 0 !important; min-height: 0 !important; max-height: 0 !important;
  margin: 0 !important; padding: 0 !important; border: 0 !important;
  opacity: 0 !important; overflow: hidden !important;
  pointer-events: none !important; flex-shrink: 0 !important;
}

/* リンク */
html[data-c05-full="1"] .notion-collection_view_page-block:has(> [role="button"][aria-expanded]):not(.notion-collection_view-block *):not(.notion-peek-renderer *) > a[role="link"]:has(.notion-record-icon) {
  display: inline-flex !important;
  align-items: center !important;
  overflow: visible !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
  width: auto !important;
  max-width: 100% !important;
  min-width: 0 !important;
  cursor: pointer !important;
  text-decoration: none !important;
}

/* 見出し（アイコン＋文字の行） */
html[data-c05-full="1"] .notion-collection_view_page-block:has(> [role="button"][aria-expanded]):not(.notion-collection_view-block *):not(.notion-peek-renderer *) > a[role="link"] > div:has(.notion-record-icon) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  height: auto !important;
  min-height: 0 !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding: 0 0 0 var(--c12g-pad, 6.4px) !important;
  row-gap: 0 !important;
  column-gap: var(--c12g-gap, 8px) !important;
  font-size: var(--c12g-size, 12px) !important;
  font-weight: var(--c12g-weight, 700) !important;
  line-height: var(--c12g-lh, 1.35) !important;
}

/* アイコン */
html[data-c05-full="1"] .notion-collection_view_page-block:has(> [role="button"][aria-expanded]):not(.notion-collection_view-block *):not(.notion-peek-renderer *) > a[role="link"] > div:has(.notion-record-icon) > :is(.notion-record-icon, :has(.notion-record-icon)) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: var(--c12g-icon, 19.2px) !important; min-width: var(--c12g-icon, 19.2px) !important; max-width: var(--c12g-icon, 19.2px) !important;
  height: var(--c12g-icon, 19.2px) !important; min-height: var(--c12g-icon, 19.2px) !important; max-height: var(--c12g-icon, 19.2px) !important;
  margin: 0 !important;
  flex-shrink: 0 !important;
}
html[data-c05-full="1"] .notion-collection_view_page-block:has(> [role="button"][aria-expanded]):not(.notion-collection_view-block *):not(.notion-peek-renderer *) > a[role="link"] > div:has(.notion-record-icon) > :is(.notion-record-icon, :has(.notion-record-icon)) * {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
}

/* 文字（改行は1行に畳む。旧版の「文字の書き換え」はしない） */
html[data-c05-full="1"] .notion-collection_view_page-block:has(> [role="button"][aria-expanded]):not(.notion-collection_view-block *):not(.notion-peek-renderer *) > a[role="link"] > div:has(.notion-record-icon) > :not(.notion-record-icon):not(:has(.notion-record-icon)) {
  display: block !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  background-image: none !important;
  font-family: "Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", "Yu Mincho", serif !important;
  font-size: var(--c12g-size, 12px) !important;
  font-weight: var(--c12g-weight, 700) !important;
  line-height: var(--c12g-lh, 1.35) !important;
  word-break: normal !important;
  overflow-wrap: normal !important;
  min-width: 0 !important;
  max-width: 100% !important;
}`,
    rowTitle: `/* ---------------------------------------------------------------------------
     DB の中のページ（行ページ）のタイトルを、フルDBのタイトル（Stylus ¹³ Full Database Title）と同じ見せ方にする
       ・アイコンを上ではなく、タイトルの左に並べる（アイコン → 間 → タイトル）
       ・タイトルの書体・大きさ・太さ・行の高さ・字間は ¹³ の変数をそのまま使う（¹³ を変えれば両方変わる）
     対象: 「View details」（プロパティ）を持つページ＝DB の行ページ。サイドピーク・センターピーク・フルページ共通。
           通常のページにも当てたい時は、下の「.layout:has([aria-label="View/hide details"])」を「.layout」に置き換える。
     ※ ¹⁴ Page Jitter Stopper の「タイトル固定」に負けないよう、タイトルの指定は id 3つ分強くしてある。
     --------------------------------------------------------------------------- */

  :root {
    /* ここだけ変えれば行ページだけ大きさを変えられる（既定は ¹³ と同じ） */
    --c25-title-size: var(--constellucentia-full-db-title-size, 20px);
  }

  /* 並び：上段＝「Add cover」等の操作行（全幅）／下段＝アイコン｜タイトル｜余白 */
  .layout:has([aria-label="View/hide details"]) div:has(> div > .notion-record-icon[role="button"][aria-label="Change page icon"]):has(> div > .notion-page-block > h1[aria-roledescription="page title"]) {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) auto !important;
    align-items: center !important;
    column-gap: var(--constellucentia-full-db-icon-title-gap, 12px) !important;
    row-gap: 0 !important;
    transform: translateX(var(--constellucentia-full-db-row-x, 0px)) !important;
  }
  .layout:has([aria-label="View/hide details"]) div:has(> div > .notion-record-icon[role="button"][aria-label="Change page icon"]):has(> div > .notion-page-block > h1[aria-roledescription="page title"]) > * {
    grid-column: 1 / -1;
  }

  /* アイコン */
  .layout:has([aria-label="View/hide details"]) div:has(> div > .notion-record-icon[role="button"][aria-label="Change page icon"]):has(> div > .notion-page-block > h1[aria-roledescription="page title"]) > div:has(> .notion-record-icon[aria-label="Change page icon"]) {
    grid-column: 1 !important;
    display: flex !important;
    align-items: center !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .layout:has([aria-label="View/hide details"]) div:has(> div > .notion-record-icon[role="button"][aria-label="Change page icon"]):has(> div > .notion-page-block > h1[aria-roledescription="page title"]) > div:has(> .notion-record-icon[aria-label="Change page icon"]) > .notion-record-icon[aria-label="Change page icon"] {
    margin-inline-start: var(--constellucentia-full-db-row-inset, 8px) !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    transform: translateY(var(--constellucentia-full-db-icon-y, 1px)) !important;
  }

  /* タイトル */
  .layout:has([aria-label="View/hide details"]) div:has(> div > .notion-record-icon[role="button"][aria-label="Change page icon"]):has(> div > .notion-page-block > h1[aria-roledescription="page title"]) > div:has(> .notion-page-block > h1[aria-roledescription="page title"]) {
    grid-column: 2 !important;
    min-width: 0 !important;
  }
  .layout:has([aria-label="View/hide details"]) div:has(> div > .notion-record-icon[role="button"][aria-label="Change page icon"]):has(> div > .notion-page-block > h1[aria-roledescription="page title"]) > div[data-content-editable-void="true"]:not(:has(h1)):not(:has(.notion-record-icon)) {
    grid-column: 3 !important;
  }

  /* タイトルの書体（アイコンの有無にかかわらず） */
  .layout:has([aria-label="View/hide details"]) .notion-page-block:has(> h1[aria-roledescription="page title"]):not(#c25a):not(#c25b):not(#c25c) {
    min-width: 0 !important;
    display: flex !important;
    align-items: center !important;
    color: var(--c-texPri) !important;
    font-family: var(--constellucentia-full-db-title-font-family, "Canela Deck", "Hoefler Text", "Hiragino Mincho ProN", "Yu Mincho", serif) !important;
    font-size: var(--c25-title-size, var(--constellucentia-full-db-title-size, 20px)) !important;
    font-weight: var(--constellucentia-full-db-title-weight, 500) !important;
    line-height: var(--constellucentia-full-db-title-line-height, 1.16) !important;
    letter-spacing: var(--constellucentia-full-db-title-letter-spacing, .085em) !important;
    font-synthesis: none !important;
    font-kerning: normal !important;
    font-variant-ligatures: common-ligatures contextual !important;
    text-rendering: optimizeLegibility !important;
    -webkit-font-smoothing: antialiased !important;
    transform: translateY(var(--constellucentia-full-db-title-y, 1px)) !important;
  }
  .layout:has([aria-label="View/hide details"]) .notion-page-block > h1[aria-roledescription="page title"]:not(#c25a):not(#c25b):not(#c25c) {
    box-sizing: border-box !important;
    max-width: 100% !important;
    width: 100% !important;
    padding-inline-start: 0 !important;
    padding-inline-end: 8px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    margin: 0 !important;
    color: var(--c-texPri) !important;
    font-family: var(--constellucentia-full-db-title-font-family, "Canela Deck", "Hoefler Text", "Hiragino Mincho ProN", "Yu Mincho", serif) !important;
    font-size: var(--c25-title-size, var(--constellucentia-full-db-title-size, 20px)) !important;
    font-weight: var(--constellucentia-full-db-title-weight, 500) !important;
    line-height: var(--constellucentia-full-db-title-line-height, 1.16) !important;
    letter-spacing: var(--constellucentia-full-db-title-letter-spacing, .085em) !important;
    font-synthesis: none !important;
    font-kerning: normal !important;
    font-variant-ligatures: common-ligatures contextual !important;
    text-rendering: optimizeLegibility !important;
    -webkit-font-smoothing: antialiased !important;
    white-space: break-spaces !important;
    overflow-wrap: anywhere !important;
  }
  .layout:has([aria-label="View/hide details"]) .notion-page-block > h1[aria-roledescription="page title"]:not(#c25a):not(#c25b):not(#c25c) span {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    letter-spacing: inherit !important;
  }
  .layout:has([aria-label="View/hide details"]) .notion-page-block > h1[aria-roledescription="page title"]:not(#c25a):not(#c25b):not(#c25c) :lang(ja) {
    font-family: var(--constellucentia-full-db-title-japanese-font-family, "Hiragino Mincho ProN", "Yu Mincho", serif) !important;
  }

  /* アイコンが無いページは、タイトルの左端をアイコン付きと同じ位置に */
  .layout:has([aria-label="View/hide details"]) div:not(:has(> div > .notion-record-icon[aria-label="Change page icon"])) > div > .notion-page-block > h1[aria-roledescription="page title"]:not(#c25a):not(#c25b):not(#c25c) {
    padding-inline-start: var(--constellucentia-full-db-row-inset, 8px) !important;
  }`
  };
  const AT_LAYERS = [
    ['foundation', '基礎の変数', '⁰⁰ Foundation ＋ ⁰¹ Font Family'],
    ['dbTitle', 'フルDBタイトル', '¹³ Full Database Title'],
    ['dbDesc', 'フルDBの説明', '¹⁴ Description Format ＋ ¹⁵ Description Typography'],
    ['relation', 'リレーション', '¹⁶ Relation Typography'],
    ['primary', 'テーブルの題字列', '¹⁷ Primary Column Typography'],
    ['tabs', 'ビューのタブ', '¹⁶ Page Title Typography（中身は View Tab Divider）'],
    ['group', 'グループ見出し', '²¹ Group Header Layout ＋ ¹² の印と開閉'],
    ['rowTitle', '行ページのタイトル', '²⁵ Row Page Title Layout']
  ];
  /* 初回だけ入れる値（⁹: フルDBヘッダーを Serif で統一） */
  const AT_SEED = { hdrScope: 'full', hdrTabFont: 'group12', hdrTabSize: '12.5', hdrTabWeight: '500', hdrTabLs: '0.04', hdrColFont: 'group12', hdrColSize: '12', hdrColWeight: '500', hdrColLs: '0.03', hdrColor: '', descJustify: '1' };
  let AT = { v: 1, layers: {}, tokens: {}, rules: [], themes: {} };
  {
    const o = lsGet(AT_KEY);
    if (o && typeof o === 'object' && o.v === 1) AT = Object.assign(AT, o);
    if (!AT.seeded) { AT.tokens = Object.assign({}, AT_SEED, AT.tokens); AT.seeded = 1; }
    for (const [k] of AT_LAYERS) if (AT.layers[k] === undefined) AT.layers[k] = true;
    if (!Array.isArray(AT.rules)) AT.rules = [];
  }
  let atSaveT = 0;
  const atSave = () => { clearTimeout(atSaveT); atSaveT = setTimeout(() => lsSet(AT_KEY, AT), 300); };
  const atFamily = (v) => { if (!v) return ''; const f = fontOf(v); return f ? f.css : String(v).replace(/[;{}<>]/g, ''); };
  const atNum = (v) => (v === '' || v == null || !isFinite(+v) ? null : +v);

  /* ---------- 場所ごとの書式（コントロールの定義） ----------
   *   t: font | px | num | em | weight | color | toggle | select
   *   v: 上書きする CSS 変数 ／ p: Atelier が規則を書く（変数の無い所）
   *   d: 何も指定していない時の値（表示だけ。基礎の層の既定） */
  const AT_REGIONS = [
    { id: 'base', label: '既定の書体', note: 'Atelier 全体の基準になる書体。下の「書体」を空にした所はこの書体（--atelier-serif）を使えます。', ctl: [
      { p: 'baseSerif', t: 'font', l: '基準の Serif', d: 'グループ見出しと同じ' }
    ] },
    { id: 'dbTitle', label: 'フルDBタイトル', note: 'フルページの DB のタイトルとアイコン（旧 ¹³）。行ページのタイトルも同じ値を使います。', ctl: [
      { v: '--constellucentia-full-db-title-font-family', t: 'font', l: '書体', d: 'Canela Deck → 明朝' },
      { v: '--constellucentia-full-db-title-japanese-font-family', t: 'font', l: '和文の書体', d: 'ヒラギノ明朝' },
      { v: '--constellucentia-full-db-title-size', t: 'px', l: '大きさ', d: 20, min: 12, max: 48, s: 0.5 },
      { v: '--constellucentia-full-db-title-weight', t: 'weight', l: '太さ', d: 500 },
      { v: '--constellucentia-full-db-title-line-height', t: 'num', l: '行の高さ', d: 1.16, min: 0.9, max: 2, s: 0.01 },
      { v: '--constellucentia-full-db-title-letter-spacing', t: 'em', l: '字間', d: 0.085, min: -0.05, max: 0.3, s: 0.005 },
      { v: '--constellucentia-full-db-icon-size', t: 'px', l: 'アイコン', d: 36, min: 16, max: 72, s: 1 },
      { v: '--constellucentia-full-db-icon-title-gap', t: 'px', l: 'アイコンとの間', d: 12, min: 0, max: 40, s: 1 },
      { v: '--constellucentia-full-db-title-y', t: 'px', l: '文字の上下', d: 1, min: -10, max: 10, s: 0.5 },
      { v: '--constellucentia-full-db-icon-y', t: 'px', l: 'アイコンの上下', d: 1, min: -10, max: 10, s: 0.5 }
    ] },
    { id: 'dbDesc', label: 'フルDBの説明', note: 'タイトルの下の説明文（旧 ¹⁴ ¹⁵、両端揃えは旧 ⁰⁶ の代わり）。', ctl: [
      { v: '--constellucentia-full-db-description-serif', t: 'font', l: '欧文の書体', d: 'Source Serif 4' },
      { v: '--constellucentia-full-db-description-mincho', t: 'font', l: '和文の書体', d: 'ヒラギノ明朝' },
      { v: '--constellucentia-full-db-description-font-size', t: 'px', l: '大きさ', d: 12, min: 9, max: 24, s: 0.5 },
      { v: '--constellucentia-full-db-description-font-weight', t: 'weight', l: '太さ', d: 400 },
      { v: '--constellucentia-full-db-description-line-height', t: 'num', l: '行の高さ', d: 1.65, min: 1, max: 3, s: 0.05 },
      { v: '--constellucentia-full-db-description-letter-spacing', t: 'em', l: '字間', d: 0.07, min: -0.05, max: 0.3, s: 0.005 },
      { p: 'descJustify', t: 'toggle', l: '両端揃え（最終行は左）', d: true },
      { v: '--constellucentia-full-db-description-gap', t: 'px', l: 'タイトルとの間', d: 15, min: 0, max: 60, s: 1 },
      { v: '--constellucentia-full-db-description-right-inset', t: 'px', l: '右の余白', d: 120, min: 0, max: 400, s: 4 },
      { v: '--constellucentia-full-db-quote-line-width', t: 'px', l: '左線の太さ', d: 2, min: 0, max: 8, s: 0.5 },
      { v: '--constellucentia-full-db-quote-line-gap', t: 'px', l: '左線と文字の間', d: 10, min: 0, max: 40, s: 1 },
      { v: '--constellucentia-full-db-quote-line-opacity', t: 'num', l: '左線の濃さ', d: 0.55, min: 0, max: 1, s: 0.05 }
    ] },
    { id: 'hdr', label: 'フルDBヘッダー', note: 'ビューのタブ（Table・Books …）と表の列見出し（Aa Name …）。既定で Serif に統一（⁹）。', ctl: [
      { p: 'hdrScope', t: 'select', l: '当てる所', d: 'full', o: [['full', 'フルページの DB だけ'], ['all', 'インライン DB・ピークも']] },
      { p: 'hdrTabFont', t: 'font', l: 'タブの書体', d: '' },
      { p: 'hdrTabSize', t: 'px', l: 'タブの大きさ', d: 14, min: 9, max: 20, s: 0.5 },
      { p: 'hdrTabWeight', t: 'weight', l: 'タブの太さ', d: 500 },
      { p: 'hdrTabLs', t: 'em', l: 'タブの字間', d: 0, min: -0.05, max: 0.3, s: 0.005 },
      { p: 'hdrColFont', t: 'font', l: '列見出しの書体', d: '' },
      { p: 'hdrColSize', t: 'px', l: '列見出しの大きさ', d: 14, min: 9, max: 20, s: 0.5 },
      { p: 'hdrColWeight', t: 'weight', l: '列見出しの太さ', d: 400 },
      { p: 'hdrColLs', t: 'em', l: '列見出しの字間', d: 0, min: -0.05, max: 0.3, s: 0.005 },
      { p: 'hdrColor', t: 'color', l: '列見出しの色', d: '' },
      { v: '--c17-divider-height', t: 'px', l: 'タブの区切り線の高さ', d: 14, min: 0, max: 24, s: 1 },
      { v: '--c17-divider-space', t: 'px', l: 'タブの区切りの余白', d: 2, min: 0, max: 16, s: 1 }
    ] },
    { id: 'primary', label: 'テーブルの題字列', note: '表の題字（Name）の列（旧 ¹⁷）。', ctl: [
      { p: 'primFont', t: 'font', l: '書体', d: 'Charter・Baskerville → 明朝' },
      { v: '--cordivestium-title-font-size', t: 'px', l: '大きさ', d: 11, min: 9, max: 20, s: 0.5 },
      { v: '--cordivestium-title-font-weight', t: 'weight', l: '太さ', d: 500 },
      { v: '--cordivestium-title-line-height', t: 'num', l: '行の高さ', d: 2.5, min: 1, max: 4, s: 0.05 },
      { v: '--cordivestium-title-icon-size', t: 'px', l: 'アイコン', d: 20, min: 12, max: 32, s: 1 },
      { v: '--cordivestium-title-gap', t: 'px', l: 'アイコンとの間', d: 8, min: 0, max: 24, s: 1 }
    ] },
    { id: 'relation', label: 'リレーション', note: '表のリレーションのセル（旧 ¹⁶・¹⁴ Relation Show All の項目）。', ctl: [
      { p: 'relFont', t: 'font', l: '書体', d: 'Baskerville → 明朝' },
      { v: '--cordi-relation-font-size', t: 'px', l: '大きさ', d: 11, min: 9, max: 20, s: 0.5 },
      { v: '--cordi-relation-font-weight', t: 'weight', l: '太さ', d: 500 },
      { v: '--cordi-relation-line-height', t: 'num', l: '行の高さ', d: 2.5, min: 1, max: 4, s: 0.05 },
      { v: '--cordi-relation-icon-size', t: 'px', l: 'アイコン', d: 20, min: 12, max: 32, s: 1 },
      { v: '--cordi-relation-icon-gap', t: 'px', l: 'アイコンとの間', d: 8, min: 0, max: 24, s: 1 },
      { v: '--cordi-relation-multi-gap', t: 'px', l: '項目の間', d: 3, min: 0, max: 16, s: 1 },
      { p: 'relHeadFont', t: 'font', l: 'シリーズ見出しの書体', d: 'Baskerville → 明朝' },
      { p: 'relHeadSize', t: 'px', l: 'シリーズ見出しの大きさ', d: 11, min: 9, max: 18, s: 0.5 }
    ] },
    { id: 'group', label: 'グループ見出し', note: '表を「グループ」で分けた時の見出し（旧 ¹² ²¹）。', ctl: [
      { p: 'grpFont', t: 'font', l: '書体', d: 'Baskerville → 明朝' },
      { v: '--c12g-size', t: 'px', l: '大きさ', d: 12, min: 9, max: 24, s: 0.5 },
      { v: '--c12g-weight', t: 'weight', l: '太さ', d: 700 },
      { v: '--c12g-lh', t: 'num', l: '行の高さ', d: 1.35, min: 0.8, max: 3, s: 0.05 },
      { v: '--c12g-icon', t: 'px', l: 'アイコン', d: 19.2, min: 8, max: 40, s: 0.2 },
      { v: '--c12g-gap', t: 'px', l: 'アイコンとの間', d: 8, min: 0, max: 32, s: 0.5 },
      { v: '--c12g-pad', t: 'px', l: '左の余白', d: 6.4, min: 0, max: 32, s: 0.2 }
    ] },
    { id: 'rowTitle', label: '行ページのタイトル', note: 'DB の行を開いた時のタイトル（旧 ²⁵）。書体は「フルDBタイトル」と同じ。', ctl: [
      { v: '--c25-title-size', t: 'px', l: '大きさ', d: 20, min: 12, max: 48, s: 0.5 }
    ] },
    { id: 'page', label: '通常ページのタイトル', note: 'DB でない普通のページのタイトル。空のままなら Notion のまま（¹⁴ Page Jitter Stopper が書体を測るので、変えたら再読み込みを）。', ctl: [
      { p: 'pgFont', t: 'font', l: '書体', d: '' },
      { p: 'pgSize', t: 'px', l: '大きさ', d: 40, min: 16, max: 64, s: 1 },
      { p: 'pgWeight', t: 'weight', l: '太さ', d: 700 },
      { p: 'pgLs', t: 'em', l: '字間', d: 0, min: -0.05, max: 0.3, s: 0.005 }
    ] },
    { id: 'sidebar', label: 'サイドバー', note: '★グループ見出し（¹⁶）と、³³ Sidebar Constellation の行・ワークスペース・ビュー。', ctl: [
      { v: '--c16-head-font', t: 'font', l: '★見出しの書体', d: 'Baskerville → 明朝' },
      { v: '--c16-font-size', t: 'px', l: '★見出しの大きさ', d: 14, min: 10, max: 20, s: 0.5 },
      { v: '--c16-head-weight', t: 'weight', l: '★見出しの太さ', d: 700 },
      { v: '--c33-item-font', t: 'font', l: '行の書体', d: '★見出しと同じ' },
      { v: '--c33-item-size', t: 'px', l: '行の大きさ', d: 13, min: 10, max: 18, s: 0.5 },
      { v: '--c33-item-h', t: 'px', l: '行の高さ', d: 28, min: 22, max: 40, s: 1 },
      { v: '--c33-team-size', t: 'px', l: 'ワークスペースの大きさ', d: 10.5, min: 8, max: 16, s: 0.5 },
      { v: '--c33-view-size', t: 'px', l: 'ビューの大きさ', d: 12, min: 9, max: 16, s: 0.5 }
    ] }
  ];
  const AT_CTL = {};
  for (const r of AT_REGIONS) for (const c of r.ctl) AT_CTL[c.v || c.p] = c;
  const UNIT = { px: 'px', em: 'em', num: '', weight: '' };

  /* ---------- CSS を書く ---------- */
  function atStyle(id) {
    let st = document.getElementById(id);
    if (!st) { st = document.createElement('style'); st.id = id; (document.head || document.documentElement).appendChild(st); }
    else if (st.parentNode !== (document.head || document.documentElement) && document.head) document.head.appendChild(st);
    return st;
  }
  function atBaseCss() {
    return AT_LAYERS.filter(([k]) => AT.layers[k] !== false && AT_BASE[k]).map(([k, l]) => '/* ── Atelier 基礎の層: ' + l + ' ── */\n' + AT_BASE[k]).join('\n\n');
  }
  const DEEP = ':is(span, div, a, p, b, strong, em, i):not(:has(svg))';
  function atDecl(o) {
    const d = [];
    if (o.ff) d.push('font-family:' + o.ff + ' !important');
    if (o.fs != null) d.push('font-size:' + o.fs + 'px !important');
    if (o.fw != null) d.push('font-weight:' + o.fw + ' !important');
    if (o.ls != null) d.push('letter-spacing:' + o.ls + 'em !important');
    if (o.lh != null) d.push('line-height:' + o.lh + ' !important');
    if (o.col) d.push('color:' + o.col + ' !important');
    if (o.it) d.push('font-style:italic !important');
    if (o.tt) d.push('text-transform:' + o.tt + ' !important');
    if (o.ta) d.push('text-align:' + o.ta + ' !important');
    if (o.op != null) d.push('opacity:' + o.op + ' !important');
    return d.join(';');
  }
  function atInherit(o) {
    const d = [];
    for (const [k, p] of [['ff', 'font-family'], ['fs', 'font-size'], ['fw', 'font-weight'], ['ls', 'letter-spacing'], ['lh', 'line-height'], ['col', 'color'], ['it', 'font-style']]) if (o[k] != null && o[k] !== '' && o[k] !== false) d.push(p + ':inherit !important');
    return d.join(';');
  }
  /* いちばん外側のカンマだけで分ける（:is( … , … ) の中は分けない） */
  function atSplit(sel) {
    const out = []; let depth = 0, cur = '', q = '';
    for (const ch of sel) {
      if (q) { cur += ch; if (ch === q) q = ''; continue; }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
      if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') depth--;
      if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  const boostSel = (sel) => atSplit(sel).map((s) => s + BOOST).join(',\n');
  function atRule(sel, o, deep) {
    const d = atDecl(o);
    if (!d) return '';
    let css = boostSel(sel) + ' {' + d + '}\n';
    if (deep) { const i = atInherit(o); if (i) css += boostSel(atSplit(sel).map((s) => s + ' ' + DEEP).join(', ')) + ' {' + i + '}\n'; }
    return css;
  }
  function atTokensCss() {
    const T = AT.tokens;
    const vars = [];
    for (const [k, c] of Object.entries(AT_CTL)) {
      if (!c.v) continue;
      const v = T[k];
      if (v === undefined || v === '' || v === null) continue;
      if (c.t === 'font') { const f = atFamily(v); if (f) vars.push(c.v + ':' + f); }
      else if (c.t === 'color') vars.push(c.v + ':' + v);
      else if (atNum(v) != null) vars.push(c.v + ':' + atNum(v) + (UNIT[c.t] || ''));
    }
    let css = vars.length ? ':root:root:root {\n  ' + vars.join(';\n  ') + ';\n}\n' : '';
    const fam = (k) => (T[k] ? atFamily(T[k]) : '');
    const n = (k) => atNum(T[k]);
    if (T.baseSerif) css += ':root:root:root{--atelier-serif:' + atFamily(T.baseSerif) + ';}\n';
    if (fam('relFont')) css += ':root:root:root{--atelier-rel-font:' + fam('relFont') + ';}\n';   // ¹⁴ の項目（インライン指定）もこの変数を読む
    /* フルDBの説明: 両端揃え（旧 ⁰⁶） */
    if (T.descJustify === '1' || T.descJustify === true) {
      css += atRaw(':is(div[contenteditable="true"][data-constellucentia-full-db-description-aligned="true"], [data-constellucentia-full-db-description-aligned="true"]:not(:has(h1)) div[contenteditable="true"]):not(:has(h1)):not(h1 *)',
        'text-align:justify !important;text-justify:inter-character !important;text-align-last:start !important');
    }
    /* フルDBヘッダー（⁹） */
    const scope = T.hdrScope === 'all' ? ':is(.notion-frame, .notion-peek-renderer)' : 'html[data-c05-full="1"] .notion-frame';
    css += atRule(scope + ' [role="tablist"] :is(.notion-collection-view-tab, .notion-collection-view-tab-button, [role="tab"])', { ff: fam('hdrTabFont'), fs: n('hdrTabSize'), fw: n('hdrTabWeight'), ls: n('hdrTabLs') }, true);
    css += atRule(scope + ' .notion-table-view-header-cell', { ff: fam('hdrColFont'), fs: n('hdrColSize'), fw: n('hdrColWeight'), ls: n('hdrColLs'), col: T.hdrColor || '' }, true);
    /* 題字列・リレーション・グループ見出しの書体（変数の無い所） */
    if (fam('primFont')) css += atRule('.cordivestium-v1121-title-token, .notion-table-view-cell[data-c12-primary] [data-testid="property-value"] span.notranslate, .notion-table-view-cell[data-c12-primary] [data-testid="property-value"] > div > div[style*="flex-grow"] span', { ff: fam('primFont') }, false);
    if (fam('relFont')) css += atRule('[data-testid="property-value"] div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index]), .cordi13-item .cordi13-title, .cordi13-item span.notranslate', { ff: fam('relFont') }, false);
    if (fam('relHeadFont') || n('relHeadSize') != null) css += atRule('.cordi13-sec-head, .c23-head', { ff: fam('relHeadFont'), fs: n('relHeadSize') }, true);
    if (fam('grpFont')) css += atRule('html[data-c05-full="1"] .notion-collection_view_page-block > a[role="link"] > div:has(.notion-record-icon) > :not(.notion-record-icon):not(:has(.notion-record-icon))', { ff: fam('grpFont') }, true);
    /* 通常ページのタイトル */
    css += atRule('.layout:not(:has([aria-label="View/hide details"])) .notion-page-block > h1[aria-roledescription="page title"]', { ff: fam('pgFont'), fs: n('pgSize'), fw: n('pgWeight'), ls: n('pgLs') }, true);
    return css;
  }
  const atRaw = (sel, d) => boostSel(sel) + ' {' + d + '}\n';
  function atRulesCss() {
    let css = '';
    for (const r of AT.rules) {
      if (!r || r.on === false || !r.sel) continue;
      try { document.querySelector(r.sel); } catch (e) { continue; }
      const st = r.st || {};
      css += '/* ' + String(r.name || '').replace(/\*\//g, '') + ' */\n' + atRule(r.sel, { ff: st.ff ? atFamily(st.ff) : '', fs: atNum(st.fs), fw: atNum(st.fw), ls: atNum(st.ls), lh: atNum(st.lh), col: st.col || '', it: !!st.it, tt: st.tt || '', ta: st.ta || '', op: atNum(st.op) }, r.deep !== false);
    }
    return css;
  }
  function atWrite(which) {
    if (!which || which === 'base') { const s = atStyle(AT_IDS.base); const c = atBaseCss(); if (s.textContent !== c) s.textContent = c; }
    if (!which || which === 'tokens') { const s = atStyle(AT_IDS.tokens); const c = atTokensCss(); if (s.textContent !== c) s.textContent = c; }
    if (!which || which === 'rules') { const s = atStyle(AT_IDS.rules); const c = atRulesCss(); if (s.textContent !== c) s.textContent = c; }
  }
  /* <head> ができたら、Stylus より後ろへ（同じ強さの規則は後ろが勝つ） */
  function atKeepLast() {
    if (!document.head) return;
    for (const id of [AT_IDS.base, AT_IDS.tokens, AT_IDS.rules]) { const s = document.getElementById(id); if (s && s.nextElementSibling && s.parentNode === document.head) document.head.appendChild(s); else if (s && s.parentNode !== document.head) document.head.appendChild(s); }
  }

  /* ---------- 旧 ¹² Group Header Typography の印と開閉（¹² が動いている時は何もしない） ---------- */
  const G12_API = '__cordivestiumGroupHeaderTypography__';
  const G12_BLOCK = '.notion-collection_view_page-block:has(> [role="button"][aria-expanded]):has(> a[role="link"] .notion-record-icon)';
  const G12_CLASS = { block: 'cordivestium-group-block', toggle: 'cordivestium-group-toggle', link: 'cordivestium-group-link', header: 'cordivestium-group-header', icon: 'cordivestium-group-icon', text: 'cordivestium-group-text' };
  let g12Shim = null, g12Raf = 0;
  const g12Mine = () => !!g12Shim && window[G12_API] === g12Shim;
  const g12In = (b) => !b.closest('.notion-collection_view-block') && !b.closest('.notion-peek-renderer');
  const g12Add = (el, c) => { if (el && !el.classList.contains(c)) el.classList.add(c); };
  function g12Tag() {
    g12Raf = 0;
    if (!g12Mine() || AT.layers.group === false) return;
    for (const b of document.querySelectorAll(G12_BLOCK)) {
      if (!g12In(b)) continue;
      g12Add(b, G12_CLASS.block);
      g12Add(b.querySelector(':scope > [role="button"][aria-expanded]'), G12_CLASS.toggle);
      const link = b.querySelector(':scope > a[role="link"]');
      g12Add(link, G12_CLASS.link);
      const header = link && [...link.children].find((c) => c.querySelector('.notion-record-icon'));
      if (!header) continue;
      g12Add(header, G12_CLASS.header);
      for (const c of header.children) {
        if (c.matches('.notion-record-icon') || c.querySelector('.notion-record-icon')) g12Add(c, G12_CLASS.icon);
        else if (String(c.textContent || '').trim()) g12Add(c, G12_CLASS.text);
      }
    }
  }
  function g12Click(e) {
    if (!g12Mine() || AT.layers.group === false || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    const link = t.closest('a[role="link"]');
    const b = link && link.parentElement;
    if (!b || !b.matches(G12_BLOCK) || !g12In(b)) return;
    const toggle = b.querySelector(':scope > [role="button"][aria-expanded]');
    if (!toggle) return;
    e.preventDefault(); e.stopPropagation();
    toggle.click();
  }
  function g12Start() {
    if (window[G12_API]) return;   // 本物の ¹² が動いている
    g12Shim = {
      atelier: true,
      status: () => ({ by: 'Atelier', styledBlocks: document.querySelectorAll('.' + G12_CLASS.block).length }),
      set: (patch) => { const map = { HEADER_PAD_LEFT_PX: '--c12g-pad', ICON_TEXT_GAP_PX: '--c12g-gap', ICON_SIZE_PX: '--c12g-icon', FONT_SIZE_PX: '--c12g-size', LINE_HEIGHT: '--c12g-lh', FONT_WEIGHT: '--c12g-weight' }; for (const k of Object.keys(patch || {})) if (map[k]) AT.tokens[map[k]] = String(patch[k]); atSave(); atWrite('tokens'); return Object.assign({}, AT.tokens); },
      scan: () => { g12Tag(); return g12Shim.status(); }
    };
    window[G12_API] = g12Shim;
    new MutationObserver(() => { if (!g12Raf) g12Raf = requestAnimationFrame(g12Tag); }).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('click', g12Click, true);
    g12Tag();
  }

  /* ============================================================
   *  パネル
   * ============================================================ */
  let atPanel = null, atTab = 'hdr', atPick = null, atEditRule = null;
  const atEsc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function atFontSelect(cur, attr) {
    detectFonts();
    const groups = new Map();
    for (const f of FONT_LIST) { if (AVAIL && AVAIL.get(f.id) === false && !PREFS.showMissing) continue; if (!groups.has(f.group)) groups.set(f.group, []); groups.get(f.group).push(f); }
    const custom = cur && !fontOf(cur);
    let h = '<select class="at-sel" ' + attr + '><option value="">（既定のまま）</option>';
    for (const [g, list] of groups) h += '<optgroup label="' + atEsc(g) + '">' + list.map((f) => '<option value="' + f.id + '"' + (f.id === cur || (fontOf(cur) && fontOf(cur).id === f.id) ? ' selected' : '') + '>' + atEsc(f.name) + '</option>').join('') + '</optgroup>';
    h += '<option value="__custom"' + (custom ? ' selected' : '') + '>自由入力…</option></select>';
    if (custom) h += '<input class="at-in at-custom" ' + attr + ' value="' + atEsc(cur) + '" spellcheck="false" placeholder="&quot;Font&quot;, serif">';
    return h;
  }
  function atControl(c, val, attr) {
    const v = val === undefined ? '' : val;
    const ph = c.d === '' || c.d == null ? '' : String(c.d);
    if (c.t === 'font') return atFontSelect(v, attr) + (ph && !v ? '<span class="at-def">既定: ' + atEsc(ph) + '</span>' : '');
    if (c.t === 'weight') return '<select class="at-sel" ' + attr + '><option value="">（既定 ' + atEsc(ph) + '）</option>' + WEIGHTS.map(([w, l]) => '<option value="' + w + '"' + (String(w) === String(v) ? ' selected' : '') + '>' + w + ' ' + l + '</option>').join('') + '</select>';
    if (c.t === 'select') return '<select class="at-sel" ' + attr + '>' + c.o.map(([k, l]) => '<option value="' + k + '"' + ((v || c.d) === k ? ' selected' : '') + '>' + atEsc(l) + '</option>').join('') + '</select>';
    if (c.t === 'toggle') { const on = v === '' ? !!c.d : (v === '1' || v === true); return '<label class="at-tog"><input type="checkbox" ' + attr + (on ? ' checked' : '') + '><i></i></label>'; }
    if (c.t === 'color') return '<span class="at-color"><input type="color" ' + attr + ' value="' + (/^#[0-9a-f]{6}$/i.test(v) ? v : '#787774') + '"' + (v ? '' : ' data-empty="1"') + '><span class="at-def">' + (v ? atEsc(v) : '既定のまま') + '</span></span>';
    const num = v === '' ? '' : v;
    return '<span class="at-num"><input type="range" ' + attr + ' min="' + c.min + '" max="' + c.max + '" step="' + c.s + '" value="' + (num === '' ? ph : num) + '"' + (num === '' ? ' data-empty="1"' : '') + '>' +
      '<input class="at-in at-n" type="number" ' + attr + ' min="' + c.min + '" max="' + c.max + '" step="' + c.s + '" value="' + atEsc(num) + '" placeholder="' + atEsc(ph) + '"><small>' + (UNIT[c.t] || '') + '</small></span>';
  }
  function atNav() {
    const item = (id, l, extra) => '<button data-nav="' + id + '"' + (atTab === id ? ' data-on="1"' : '') + '>' + atEsc(l) + (extra || '') + '</button>';
    const set = (r) => r.ctl.some((c) => { const v = AT.tokens[c.v || c.p]; return v !== undefined && v !== '' && !(AT_SEED[c.p] !== undefined && AT_SEED[c.p] === v); });
    return '<div class="at-navh">場所</div>' + AT_REGIONS.map((r) => item(r.id, r.label, set(r) ? '<i class="at-dot"></i>' : '')).join('') +
      '<div class="at-navh">道具</div>' + item('any', 'どこでも書式', AT.rules.length ? '<b>' + AT.rules.length + '</b>' : '') + item('tools', '道具（目次・フォーカス…）') + item('layers', '基礎の層（旧 Stylus）') + item('themes', 'テーマ・書き出し') + item('body', '本文（Text Styles）');
  }
  function atRenderMain() {
    const main = atPanel.querySelector('.at-main');
    if (atTab === 'any') return atRenderAny(main);
    if (atTab === 'layers') return atRenderLayers(main);
    if (atTab === 'tools') {
      const row = (k, l, n) => '<div class="at-row"><label>' + l + '<small>' + n + '</small></label><div class="at-ctl"><label class="at-tog" data-tool="' + k + '"><input type="checkbox"' + (AT.tools[k] ? ' checked' : '') + '><i></i></label></div><span></span></div>';
      main.innerHTML = '<h3>道具</h3><p class="at-note">文字を選ぶと出る ²⁶ のメニューの下の段からも入切できます。</p>' +
        row('toc', '目次', '見出しを右に浮かぶ目次に') + row('focus', 'フォーカスモード', 'サイドバーと上の帯を隠し、書いている段落以外を淡く') + row('count', '文字数・読了時間', '左下に表示（選んだ文字数も）') +
        '<div class="at-row"><label>どこでも書式</label><div class="at-ctl"><button class="at-btn" data-a="pick">画面でクリックして選ぶ</button></div><span></span></div>';
      return;
    }
    if (atTab === 'themes') return atRenderThemes(main);
    if (atTab === 'body') {
      main.innerHTML = '<h3>本文（Text Styles）</h3><p class="at-note">本文の文字・段落・コールアウト・引用の書式は、文字を選ぶと出るメニュー（⌃⌥F）と、本文のパネル（⌃⌥S）で。ここからも開けます。</p><div class="at-row"><button class="at-btn at-pri" data-a="openText">本文のパネルを開く</button></div>';
      return;
    }
    const r = AT_REGIONS.find((x) => x.id === atTab) || AT_REGIONS[0];
    main.innerHTML = '<h3>' + atEsc(r.label) + '<button class="at-btn at-ghost" data-a="resetRegion" title="この場所の指定を全部消す">この場所を元に戻す</button></h3><p class="at-note">' + atEsc(r.note) + '</p>' +
      r.ctl.map((c) => { const k = c.v || c.p; const v = AT.tokens[k]; return '<div class="at-row' + (v !== undefined && v !== '' ? ' at-set' : '') + '"><label>' + atEsc(c.l) + '</label><div class="at-ctl">' + atControl(c, v, 'data-k="' + atEsc(k) + '"') + '</div><button class="at-x" data-reset="' + atEsc(k) + '" title="既定に戻す">↺</button></div>'; }).join('');
  }
  function atRenderLayers(main) {
    main.innerHTML = '<h3>基礎の層（旧 Stylus）</h3><p class="at-note">旧 Stylus の Typography 系 CSS を Atelier が内蔵しています。Stylus 側の同じスタイルは止めて大丈夫です（両方動いていても同じ規則なので見た目は変わりません）。層を切ると、その部分は Notion の素の見た目に戻ります。</p>' +
      AT_LAYERS.map(([k, l, src]) => '<div class="at-row"><label>' + atEsc(l) + '<small>' + atEsc(src) + '</small></label><div class="at-ctl"><label class="at-tog"><input type="checkbox" data-layer="' + k + '"' + (AT.layers[k] !== false ? ' checked' : '') + '><i></i></label><span class="at-def">' + Math.round((AT_BASE[k] || '').length / 100) / 10 + ' KB</span></div><span></span></div>').join('');
  }
  function atRenderThemes(main) {
    const names = Object.keys(AT.themes || {});
    main.innerHTML = '<h3>テーマ・書き出し</h3><p class="at-note">今の「場所ごとの書式」と「どこでも書式」に名前を付けて保存し、いつでも切り替えられます。</p>' +
      '<div class="at-row"><label>今の書式を</label><div class="at-ctl"><button class="at-btn at-pri" data-a="saveTheme">テーマとして保存</button></div><span></span></div>' +
      (names.length ? names.map((nm) => '<div class="at-row"><label>' + atEsc(nm) + '<small>' + new Date(AT.themes[nm].at || 0).toLocaleString() + '</small></label><div class="at-ctl"><button class="at-btn" data-theme="' + atEsc(nm) + '">適用</button><button class="at-btn at-ghost" data-deltheme="' + atEsc(nm) + '">削除</button></div><span></span></div>').join('') : '<p class="at-note">保存したテーマはまだありません。</p>') +
      '<div class="at-sep"></div><div class="at-row"><label>書き出し</label><div class="at-ctl"><button class="at-btn" data-a="exportAt">Atelier だけ</button><button class="at-btn" data-a="exportAll">本文の書式も一緒に</button></div><span></span></div>' +
      '<div class="at-row"><label>読み込み</label><div class="at-ctl"><button class="at-btn" data-a="importAt">貼り付けて読み込む</button></div><span></span></div>' +
      '<div class="at-row"><label>全部消す</label><div class="at-ctl"><button class="at-btn at-ghost" data-a="resetAll">場所ごとの書式を初期値へ</button></div><span></span></div>';
  }
  /* ---------- どこでも書式 ---------- */
  function atRenderAny(main) {
    const r = atEditRule && AT.rules.find((x) => x.id === atEditRule);
    let h = '<h3>どこでも書式</h3><p class="at-note">Notion では変えられない所（リレーション・プロパティ名・ボタン・ツールバー・サイドバー…）も、画面でクリックして選べば書式を当てられます。</p>' +
      '<div class="at-row"><label>要素を選ぶ</label><div class="at-ctl"><button class="at-btn at-pri" data-a="pick">画面でクリックして選ぶ</button><span class="at-def">Esc でやめる</span></div><span></span></div>';
    if (r) {
      const st = r.st || {};
      let cnt = 0; try { cnt = document.querySelectorAll(r.sel).length; } catch (e) { cnt = -1; }
      const fld = (k, c) => '<div class="at-row' + (st[k] !== undefined && st[k] !== '' ? ' at-set' : '') + '"><label>' + atEsc(c.l) + '</label><div class="at-ctl">' + atControl(c, st[k], 'data-rk="' + k + '"') + '</div><button class="at-x" data-rreset="' + k + '">↺</button></div>';
      h += '<div class="at-card"><div class="at-row"><label>名前</label><div class="at-ctl"><input class="at-in" data-rf="name" value="' + atEsc(r.name || '') + '"></div><span></span></div>' +
        '<div class="at-row"><label>当てる所<small>' + (cnt < 0 ? '指定が正しくありません' : cnt + ' 個が当たっています') + '</small></label><div class="at-ctl"><textarea class="at-in at-code" data-rf="sel" spellcheck="false">' + atEsc(r.sel) + '</textarea></div><span></span></div>' +
        (r.alt && r.alt.length ? '<div class="at-row"><label>範囲</label><div class="at-ctl at-chips">' + r.alt.map((a, i) => '<button class="at-chip' + (a.sel === r.sel ? ' on' : '') + '" data-alt="' + i + '">' + atEsc(a.l) + '<small>' + a.n + '</small></button>').join('') + '</div><span></span></div>' : '') +
        fld('ff', { t: 'font', l: '書体', d: '' }) + fld('fs', { t: 'px', l: '大きさ', d: '', min: 6, max: 72, s: 0.5 }) + fld('fw', { t: 'weight', l: '太さ', d: '' }) +
        fld('ls', { t: 'em', l: '字間', d: '', min: -0.1, max: 0.5, s: 0.005 }) + fld('lh', { t: 'num', l: '行の高さ', d: '', min: 0.8, max: 4, s: 0.05 }) + fld('col', { t: 'color', l: '色', d: '' }) +
        fld('op', { t: 'num', l: '濃さ', d: '', min: 0, max: 1, s: 0.05 }) +
        fld('tt', { t: 'select', l: '大文字・小文字', d: '', o: [['', 'そのまま'], ['uppercase', 'すべて大文字'], ['lowercase', 'すべて小文字'], ['capitalize', '頭だけ大文字']] }) +
        fld('ta', { t: 'select', l: '揃え', d: '', o: [['', 'そのまま'], ['left', '左'], ['center', '中央'], ['right', '右'], ['justify', '両端']] }) +
        fld('it', { t: 'toggle', l: '斜体', d: false }) +
        '<div class="at-row"><label>中の文字にも</label><div class="at-ctl"><label class="at-tog"><input type="checkbox" data-rf="deep"' + (r.deep !== false ? ' checked' : '') + '><i></i></label></div><span></span></div>' +
        '<div class="at-row"><label></label><div class="at-ctl"><button class="at-btn at-ghost" data-a="delRule">この書式を消す</button><button class="at-btn" data-a="doneRule">完了</button></div><span></span></div></div>';
    }
    if (AT.rules.length) {
      h += '<div class="at-navh" style="margin:14px 0 6px">作った書式</div>' + AT.rules.map((x) => '<div class="at-rule' + (x.id === atEditRule ? ' on' : '') + '"><label class="at-tog"><input type="checkbox" data-ron="' + x.id + '"' + (x.on !== false ? ' checked' : '') + '><i></i></label><button data-redit="' + x.id + '"><b>' + atEsc(x.name || '（名前なし）') + '</b><small>' + atEsc(x.sel.slice(0, 80)) + '</small></button></div>').join('');
    }
    main.innerHTML = h;
  }
  /* 選んだ要素 → 指定（Notion の固定の印・役割・data-testid などだけを使う。自動で付く記号の class は使わない） */
  const AT_ATTR = ['data-testid', 'role', 'aria-roledescription', 'data-inp-target', 'data-content-editable-leaf', 'data-c12-primary', 'data-c33-kind', 'data-c16-tier', 'aria-label'];
  function atDescr(el) {
    let s = el.tagName.toLowerCase();
    const cls = [...el.classList].filter((c) => /^(notion-|cordi|cordivestium|c\d{2}-|c16-|c23|c29-|c31-|c33-)/.test(c) && !/[0-9a-f]{6,}|selected|hover|focus|active/i.test(c));
    if (cls.length) s += '.' + cls.slice(0, 2).map((c) => CSS.escape(c)).join('.');
    for (const a of AT_ATTR) { const v = el.getAttribute(a); if (v != null && v.length && v.length < 50) { s += '[' + a + '="' + v.replace(/"/g, '\\"') + '"]'; break; } }
    return s;
  }
  const atStable = (d) => /[.[]/.test(d);
  function atSelectors(el) {
    const chain = [];
    for (let cur = el, n = 0; cur && cur.nodeType === 1 && cur !== document.body && n < 7; cur = cur.parentElement, n++) {
      const d = atDescr(cur);
      chain.unshift(d);
      if (n > 0 && atStable(d) && /notion-|data-testid|role=|data-inp-target|c16-|cordi/.test(d)) break;
    }
    const strict = chain.join(' > ');
    const loose = chain.length > 1 ? chain[0] + ' ' + chain[chain.length - 1] : chain[0];
    const out = [];
    const cnt = (s) => { try { return document.querySelectorAll(s).length; } catch (e) { return -1; } };
    const push = (l, sel) => { const n = cnt(sel); if (n > 0 && !out.some((o) => o.sel === sel)) out.push({ l, sel, n }); };
    push('同じ形の所すべて', strict);
    push('広く（同じ種類すべて）', loose);
    const blk = el.closest('[data-block-id]');
    if (blk) push('このブロックの中だけ', '[data-block-id="' + blk.getAttribute('data-block-id') + '"] ' + chain[chain.length - 1]);
    return out;
  }
  function atStartPick() {
    atStopPick();
    const box = document.createElement('div');
    box.className = 'at-pickbox';
    const tip = document.createElement('div');
    tip.className = 'at-picktip';
    document.body.appendChild(box); document.body.appendChild(tip);
    if (atPanel) atPanel.classList.add('at-picking');
    const ours = (el) => !!(el && el.closest && el.closest('.at-panel, .at-pickbox, .at-picktip'));
    const under = (e) => { for (const el of document.elementsFromPoint(e.clientX, e.clientY)) if (!ours(el)) return el; return null; };
    let cur = null;
    const move = (e) => {
      const el = under(e);
      if (!el || el === cur) return;
      cur = el;
      const r = el.getBoundingClientRect();
      Object.assign(box.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
      const s = atSelectors(el)[0];
      tip.textContent = (s ? s.sel.split(' > ').slice(-2).join(' › ') + '　' + s.n + ' 個' : el.tagName.toLowerCase());
      Object.assign(tip.style, { left: Math.min(innerWidth - 320, Math.max(4, r.left)) + 'px', top: (r.bottom + 6 > innerHeight - 30 ? r.top - 28 : r.bottom + 6) + 'px' });
    };
    const block = (e) => { if (ours(e.target)) return; e.preventDefault(); e.stopImmediatePropagation(); };
    const click = (e) => {
      if (ours(e.target)) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const el = under(e);
      atStopPick();
      if (el) atNewRule(el);
    };
    const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); atStopPick(); } };
    window.addEventListener('mousemove', move, true);
    for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup']) window.addEventListener(t, block, true);
    window.addEventListener('click', click, true);
    window.addEventListener('keydown', key, true);
    atPick = { box, tip, off: () => { window.removeEventListener('mousemove', move, true); for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup']) window.removeEventListener(t, block, true); window.removeEventListener('click', click, true); window.removeEventListener('keydown', key, true); } };
  }
  function atStopPick() {
    if (!atPick) return;
    atPick.off(); atPick.box.remove(); atPick.tip.remove(); atPick = null;
    if (atPanel) atPanel.classList.remove('at-picking');
  }
  function atNewRule(el) {
    const alt = atSelectors(el);
    if (!alt.length) { toast('この要素は指定できませんでした'); return; }
    const txt = atNorm(el.textContent || '').slice(0, 24);
    const r = { id: 'r' + Date.now().toString(36), name: txt || alt[0].sel.split(' > ').pop(), sel: alt[0].sel, alt, st: {}, on: true, deep: true };
    AT.rules.unshift(r);
    atEditRule = r.id; atTab = 'any';
    atSave(); atWrite('rules');
    if (!atPanel) openAtelier(); else atRefresh();
  }

  /* ---------- 入力 ---------- */
  function atReadVal(el, c) {
    if (el.type === 'checkbox') return el.checked ? '1' : '0';
    if (el.classList.contains('at-sel') && el.value === '__custom') return '__custom';
    return el.value;
  }
  function atOnInput(e) {
    const el = e.target;
    const k = el.getAttribute('data-k'), rk = el.getAttribute('data-rk');
    if (k) {
      const c = AT_CTL[k];
      let v = atReadVal(el, c);
      if (v === '__custom') { AT.tokens[k] = '"Hiragino Mincho ProN", serif'; atRefresh(); return; }
      if (el.type === 'range') { const n = el.parentElement.querySelector('.at-n'); if (n) n.value = v; el.removeAttribute('data-empty'); }
      if (el.classList.contains('at-n')) { const rg = el.parentElement.querySelector('input[type=range]'); if (rg && v !== '') rg.value = v; }
      if (el.type === 'color') { el.removeAttribute('data-empty'); const d = el.parentElement.querySelector('.at-def'); if (d) d.textContent = v; }
      if (v === '') delete AT.tokens[k]; else AT.tokens[k] = v;
      el.closest('.at-row') && el.closest('.at-row').classList.toggle('at-set', v !== '');
      atWrite('tokens'); atSave();
      if (e.type === 'change' && c && c.t === 'font') atRefresh();
      return;
    }
    const r = AT.rules.find((x) => x.id === atEditRule);
    if (!r) return;
    if (rk) {
      let v = atReadVal(el);
      if (v === '__custom') { r.st[rk] = '"Hiragino Mincho ProN", serif'; atRefresh(); return; }
      if (el.type === 'range') { const n = el.parentElement.querySelector('.at-n'); if (n) n.value = v; }
      if (el.classList.contains('at-n')) { const rg = el.parentElement.querySelector('input[type=range]'); if (rg && v !== '') rg.value = v; }
      if (rk === 'it') v = el.checked ? true : '';
      if (v === '' || v === '0') delete r.st[rk]; else r.st[rk] = v;
      atWrite('rules'); atSave();
      return;
    }
    const f = el.getAttribute('data-rf');
    if (f === 'name') { r.name = el.value; atSave(); }
    else if (f === 'sel') { r.sel = el.value.trim(); atWrite('rules'); atSave(); }
    else if (f === 'deep') { r.deep = el.checked; atWrite('rules'); atSave(); }
    const lay = el.getAttribute('data-layer');
    if (lay) { AT.layers[lay] = el.checked; atWrite('base'); atSave(); }
  }
  function atOnClick(e) {
    const t = e.target;
    const nav = t.closest('[data-nav]'); if (nav) { atTab = nav.dataset.nav; atRefresh(); return; }
    const tl = t.closest('[data-tool]'); if (tl && t.tagName === 'INPUT') { atTool(tl.dataset.tool, t.checked); return; }
    const rs = t.closest('[data-reset]'); if (rs) { delete AT.tokens[rs.dataset.reset]; atWrite('tokens'); atSave(); atRefresh(); return; }
    const rr = t.closest('[data-rreset]'); if (rr) { const r = AT.rules.find((x) => x.id === atEditRule); if (r) { delete r.st[rr.dataset.rreset]; atWrite('rules'); atSave(); atRefresh(); } return; }
    const ed = t.closest('[data-redit]'); if (ed) { atEditRule = atEditRule === ed.dataset.redit ? null : ed.dataset.redit; atRefresh(); return; }
    const on = t.closest('[data-ron]'); if (on) { const r = AT.rules.find((x) => x.id === on.dataset.ron); if (r) { r.on = on.checked; atWrite('rules'); atSave(); } return; }
    const alt = t.closest('[data-alt]'); if (alt) { const r = AT.rules.find((x) => x.id === atEditRule); if (r) { r.sel = r.alt[+alt.dataset.alt].sel; atWrite('rules'); atSave(); atRefresh(); } return; }
    const th = t.closest('[data-theme]'); if (th) { const o = AT.themes[th.dataset.theme]; if (o) { AT.tokens = JSON.parse(JSON.stringify(o.tokens || {})); AT.rules = JSON.parse(JSON.stringify(o.rules || [])); atWrite(); atSave(); atRefresh(); toast('テーマ「' + th.dataset.theme + '」を適用しました'); } return; }
    const dt = t.closest('[data-deltheme]'); if (dt) { if (confirm('テーマ「' + dt.dataset.deltheme + '」を削除しますか')) { delete AT.themes[dt.dataset.deltheme]; atSave(); atRefresh(); } return; }
    const a = t.closest('[data-a]'); if (!a) return;
    const act = a.dataset.a;
    if (act === 'close') closeAtelier();
    else if (act === 'pick') atStartPick();
    else if (act === 'openText') { closeAtelier(); openPanel(); }
    else if (act === 'resetRegion') { const r = AT_REGIONS.find((x) => x.id === atTab); if (r) { for (const c of r.ctl) delete AT.tokens[c.v || c.p]; atWrite('tokens'); atSave(); atRefresh(); } }
    else if (act === 'delRule') { AT.rules = AT.rules.filter((x) => x.id !== atEditRule); atEditRule = null; atWrite('rules'); atSave(); atRefresh(); }
    else if (act === 'doneRule') { atEditRule = null; atRefresh(); }
    else if (act === 'saveTheme') { const nm = prompt('テーマの名前', 'テーマ ' + (Object.keys(AT.themes).length + 1)); if (nm) { AT.themes[nm] = { at: Date.now(), tokens: JSON.parse(JSON.stringify(AT.tokens)), rules: JSON.parse(JSON.stringify(AT.rules)) }; atSave(); atRefresh(); } }
    else if (act === 'exportAt' || act === 'exportAll') {
      const o = { atelier: AT };
      if (act === 'exportAll') o.textStyles = JSON.parse(exportAll());
      const txt = JSON.stringify(o);
      try { navigator.clipboard.writeText(txt); toast('クリップボードに写しました（' + txt.length + ' 文字）'); } catch (err) { prompt('コピーしてください', txt); }
    } else if (act === 'importAt') {
      const txt = prompt('書き出した設定を貼り付けてください（今の Atelier の設定は置き換わります）');
      if (!txt) return;
      try {
        const o = JSON.parse(txt);
        if (o.atelier && o.atelier.v === 1) { AT = Object.assign({ v: 1, layers: {}, tokens: {}, rules: [], themes: {} }, o.atelier); }
        if (o.textStyles) importAll(o.textStyles);
        atWrite(); atSave(); atRefresh(); toast('読み込みました');
      } catch (err) { alert('読み込めませんでした: ' + err.message); }
    } else if (act === 'resetAll') { if (confirm('場所ごとの書式を初期値（⁹ の Serif 統一だけ入った状態）に戻します')) { AT.tokens = Object.assign({}, AT_SEED); atWrite('tokens'); atSave(); atRefresh(); } }
  }
  function atRefresh() {
    if (!atPanel) return;
    atPanel.querySelector('.at-nav').innerHTML = atNav();
    const main = atPanel.querySelector('.at-main');
    const y = main.scrollTop;
    atRenderMain();
    main.scrollTop = y;
  }
  function openAtelier() {
    if (atPanel) { closeAtelier(); return; }
    atInstallUi();
    try { hidePop(); } catch (e) { /* noop */ }
    atPanel = document.createElement('div');
    atPanel.className = 'at-panel c26-ui';
    atPanel.setAttribute('data-no-passthrough', '1');
    atPanel.setAttribute('role', 'dialog');
    atPanel.setAttribute('aria-label', 'Atelier');
    atPanel.innerHTML = '<div class="at-head"><div><b>Atelier</b><span>見た目を、ひとつの場所で</span></div><button class="at-x at-close" data-a="close" title="閉じる（Esc）">×</button></div><div class="at-body"><nav class="at-nav"></nav><div class="at-main"></div></div><div class="at-foot"><span>変えるとすぐ反映・自動で保存（このブラウザ）</span><span>⌃⌥A</span></div>';
    for (const ev of ['pointerdown', 'mousedown', 'keydown', 'click', 'beforeinput', 'input', 'change']) atPanel.addEventListener(ev, (e) => { if (ev === 'keydown' && e.key === 'Escape') { if (atPick) return; closeAtelier(); } e.stopPropagation(); }, false);
    atPanel.addEventListener('input', atOnInput);
    atPanel.addEventListener('change', atOnInput);
    atPanel.addEventListener('click', atOnClick);
    const head = atPanel.querySelector('.at-head');
    head.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      e.preventDefault();
      const r = atPanel.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
      const mv = (ev) => { atPanel.style.left = Math.max(0, Math.min(innerWidth - 120, ev.clientX - dx)) + 'px'; atPanel.style.top = Math.max(0, Math.min(innerHeight - 40, ev.clientY - dy)) + 'px'; atPanel.style.right = 'auto'; };
      const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    });
    document.body.appendChild(atPanel);
    atRefresh();
  }
  function closeAtelier() { atStopPick(); if (atPanel) atPanel.remove(); atPanel = null; }
  function atInstallUi() {
    if (document.getElementById(AT_IDS.ui)) return;
    const st = document.createElement('style');
    st.id = AT_IDS.ui;
    st.textContent = `
.at-panel { position: fixed; z-index: 2147483600; right: 24px; top: 64px; width: 620px; max-width: calc(100vw - 32px); height: min(720px, calc(100vh - 88px)); display: flex; flex-direction: column; border-radius: 14px; background: var(--c-bgPri, #fff); color: var(--c-texPri, #37352f); box-shadow: 0 0 0 .5px rgba(15,15,15,.12), 0 6px 16px rgba(15,15,15,.08), 0 24px 56px rgba(15,15,15,.18); font: 12.5px/1.45 -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Segoe UI", sans-serif; overflow: hidden; }
.at-panel * { box-sizing: border-box; }
.at-panel.at-picking { opacity: .18; pointer-events: none; transition: opacity .15s; }
.at-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 12px 18px; border-bottom: 1px solid var(--ca-borPriTra, rgba(55,53,47,.1)); cursor: move; user-select: none; }
.at-head b { font: 600 17px/1 "Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", serif; letter-spacing: .06em; margin-right: 10px; }
.at-head span { color: var(--c-texSec, #787774); font-size: 11.5px; letter-spacing: .04em; }
.at-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 176px 1fr; }
.at-nav { padding: 10px 8px; border-right: 1px solid var(--ca-borPriTra, rgba(55,53,47,.08)); overflow: auto; background: color-mix(in srgb, var(--c-texPri, #37352f) 2%, transparent); }
.at-navh { padding: 8px 10px 4px; font-size: 10.5px; font-weight: 600; letter-spacing: .08em; color: var(--c-texTer, #9b9a97); }
.at-nav button { display: flex; align-items: center; gap: 6px; width: 100%; height: 28px; padding: 0 10px; border: 0; border-radius: 6px; background: none; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.at-nav button:hover { background: var(--c-bacHov, rgba(55,53,47,.06)); }
.at-nav button[data-on="1"] { background: var(--c-bacHov2, rgba(55,53,47,.09)); font-weight: 600; }
.at-nav .at-dot { width: 5px; height: 5px; border-radius: 50%; background: #2383e2; margin-left: auto; }
.at-nav b { margin-left: auto; font-size: 10.5px; font-weight: 500; color: var(--c-texSec, #787774); }
.at-main { padding: 14px 18px 24px; overflow: auto; }
.at-main h3 { display: flex; align-items: center; justify-content: space-between; margin: 2px 0 4px; font: 600 15px/1.3 "Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", serif; letter-spacing: .04em; }
.at-note { margin: 0 0 12px; color: var(--c-texSec, #787774); font-size: 11.5px; }
.at-row { display: grid; grid-template-columns: 132px 1fr 22px; align-items: center; gap: 10px; min-height: 34px; padding: 2px 0; border-radius: 6px; }
.at-row > label { color: var(--c-texSec, #787774); font-size: 12px; display: flex; flex-direction: column; }
.at-row > label small { font-size: 10.5px; color: var(--c-texTer, #9b9a97); }
.at-row.at-set > label { color: var(--c-texPri, #37352f); font-weight: 500; }
.at-ctl { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; }
.at-sel, .at-in { height: 28px; min-width: 0; max-width: 100%; padding: 0 8px; border: 0; border-radius: 6px; background: var(--c-bacHov, rgba(55,53,47,.06)); color: inherit; font: inherit; outline: none; }
.at-sel { flex: 1 1 auto; max-width: 280px; }
.at-in:focus, .at-sel:focus { box-shadow: 0 0 0 2px rgba(35,131,226,.4); }
.at-custom { flex: 1 1 100%; font-family: ui-monospace, Menlo, monospace; font-size: 11px; }
.at-code { height: 54px; width: 100%; padding: 6px 8px; resize: vertical; font-family: ui-monospace, Menlo, monospace; font-size: 11px; line-height: 1.4; }
.at-def { font-size: 10.5px; color: var(--c-texTer, #9b9a97); }
.at-num { display: flex; align-items: center; gap: 8px; width: 100%; }
.at-num input[type=range] { flex: 1; accent-color: #2383e2; }
.at-num input[type=range][data-empty] { opacity: .45; }
.at-num .at-n { width: 72px; text-align: right; font-variant-numeric: tabular-nums; }
.at-num small { width: 18px; color: var(--c-texTer, #9b9a97); }
.at-color { display: flex; align-items: center; gap: 8px; }
.at-color input { width: 28px; height: 22px; padding: 0; border: 0; background: none; cursor: pointer; }
.at-color input[data-empty] { opacity: .4; }
.at-x { width: 22px; height: 22px; border: 0; border-radius: 5px; background: none; color: var(--c-texTer, #9b9a97); cursor: pointer; font-size: 13px; opacity: 0; }
.at-row:hover .at-x, .at-row.at-set .at-x { opacity: 1; }
.at-x:hover { background: var(--c-bacHov, rgba(55,53,47,.08)); color: var(--c-texPri, #37352f); }
.at-close { opacity: 1; font-size: 18px; width: 28px; height: 28px; }
.at-btn { height: 28px; padding: 0 12px; border: 0; border-radius: 6px; background: var(--c-bacHov, rgba(55,53,47,.06)); color: inherit; font: 500 12px/1 inherit; cursor: pointer; }
.at-btn:hover { background: var(--c-bacHov2, rgba(55,53,47,.1)); }
.at-pri { background: #2383e2; color: #fff; }
.at-pri:hover { background: #1f74c9; }
.at-ghost { background: none; color: var(--c-texSec, #787774); font-size: 11px; height: 24px; }
.at-tog { position: relative; display: inline-flex; cursor: pointer; }
.at-tog input { position: absolute; opacity: 0; pointer-events: none; }
.at-tog i { width: 30px; height: 17px; border-radius: 9px; background: var(--ca-borPriTra, rgba(55,53,47,.2)); position: relative; transition: background .15s; }
.at-tog i::after { content: ""; position: absolute; left: 2px; top: 2px; width: 13px; height: 13px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: transform .15s; }
.at-tog input:checked + i { background: #2383e2; }
.at-tog input:checked + i::after { transform: translateX(13px); }
.at-card { margin-top: 10px; padding: 10px 12px; border-radius: 10px; box-shadow: inset 0 0 0 1px var(--ca-borPriTra, rgba(55,53,47,.1)); }
.at-chips { gap: 4px; }
.at-chip { height: 24px; padding: 0 8px; border: 0; border-radius: 12px; background: var(--c-bacHov, rgba(55,53,47,.06)); color: inherit; font: 11.5px/1 inherit; cursor: pointer; }
.at-chip small { margin-left: 6px; color: var(--c-texTer, #9b9a97); }
.at-chip.on { background: rgba(35,131,226,.14); color: #2383e2; }
.at-rule { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 8px; }
.at-rule.on { background: rgba(35,131,226,.07); }
.at-rule button { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; padding: 4px 6px; border: 0; border-radius: 6px; background: none; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.at-rule button:hover { background: var(--c-bacHov, rgba(55,53,47,.06)); }
.at-rule small { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--c-texTer, #9b9a97); font: 10.5px/1.4 ui-monospace, Menlo, monospace; }
.at-sep { height: 1px; margin: 12px 0; background: var(--ca-borPriTra, rgba(55,53,47,.1)); }
.at-foot { display: flex; justify-content: space-between; padding: 8px 18px; border-top: 1px solid var(--ca-borPriTra, rgba(55,53,47,.08)); color: var(--c-texTer, #9b9a97); font-size: 11px; }
.at-pickbox { position: fixed; z-index: 2147483601; pointer-events: none; border: 2px solid #2383e2; border-radius: 3px; background: rgba(35,131,226,.08); transition: all .06s; }
.at-picktip { position: fixed; z-index: 2147483602; pointer-events: none; max-width: 320px; padding: 4px 8px; border-radius: 6px; background: rgba(15,15,15,.88); color: #fff; font: 11px/1.4 ui-monospace, Menlo, monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;
    (document.head || document.documentElement).appendChild(st);
  }
  const atNorm = (s) => String(s || '').replace(/\s+/g, ' ').trim();


  /* ============================================================
   *  v24.0.0  Atelier の道具（目次・フォーカスモード・文字数）
   * ============================================================ */
  if (!AT.tools || typeof AT.tools !== 'object') AT.tools = {};
  function syncToolButtons() {
    for (const b of document.querySelectorAll('#c26-menu [data-a="attoc"], #c26-menu [data-a="atfocus"], #c26-menu [data-a="atcount"], .at-panel [data-tool]')) {
      const k = b.dataset.a ? b.dataset.a.slice(2) : b.dataset.tool;
      b.setAttribute('aria-pressed', AT.tools[k] ? 'true' : 'false');
      if (b.dataset.tool) { const i = b.querySelector('input'); if (i) i.checked = !!AT.tools[k]; }
    }
  }
  function atTool(k, force) {
    AT.tools[k] = force === undefined ? !AT.tools[k] : !!force;
    atSave();
    atApplyTools();
    syncToolButtons();
    return AT.tools[k];
  }
  function atPickFromMenu() { if (!atPanel) openAtelier(); atTab = 'any'; atRefresh(); atStartPick(); }
  function atToolCss() {
    if (document.getElementById('atelier-tools-css')) return;
    const st = document.createElement('style');
    st.id = 'atelier-tools-css';
    st.textContent = `
#at-toc { position: fixed; z-index: 90; right: 22px; top: 120px; width: 220px; max-height: calc(100vh - 220px); overflow: auto; padding: 10px 6px 10px 8px; border-radius: 10px; color: var(--c-texSec, #787774); font: 12.5px/1.45 "Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", serif; background: color-mix(in srgb, var(--c-bgPri, #fff) 86%, transparent); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: 0 0 0 .5px rgba(15,15,15,.08); opacity: .55; transition: opacity .2s; scrollbar-width: none; }
#at-toc:hover { opacity: 1; }
#at-toc::-webkit-scrollbar { display: none; }
#at-toc .at-toch { padding: 0 8px 6px; font-size: 10.5px; letter-spacing: .14em; color: var(--c-texTer, #9b9a97); }
#at-toc a { display: block; padding: 3px 8px; border-radius: 5px; color: inherit; text-decoration: none; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 2px solid transparent; }
#at-toc a:hover { background: var(--c-bacHov, rgba(55,53,47,.06)); color: var(--c-texPri, #37352f); }
#at-toc a[data-l="2"] { padding-left: 20px; font-size: 12px; }
#at-toc a[data-l="3"] { padding-left: 32px; font-size: 11.5px; }
#at-toc a.on { color: var(--c-texPri, #37352f); border-left-color: #2383e2; font-weight: 600; }
html[data-at-focus] .notion-sidebar-container:not(:hover) { opacity: 0 !important; transition: opacity .25s !important; }
html[data-at-focus] .notion-topbar:not(:hover), html[data-at-focus] .notion-topbar-mobile:not(:hover) { opacity: 0 !important; transition: opacity .25s !important; }
html[data-at-focus] .layout .notion-page-content > [data-block-id] { transition: opacity .25s ease; }
html[data-at-focus][data-at-has-cur] .layout .notion-page-content > [data-block-id]:not([data-at-cur]) { opacity: .3; }
#at-count { position: fixed; z-index: 90; left: calc(var(--at-sbw, 0px) + 18px); bottom: 14px; padding: 4px 10px; border-radius: 999px; color: var(--c-texSec, #787774); font: 11px/1.4 -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif; font-variant-numeric: tabular-nums; background: color-mix(in srgb, var(--c-bgPri, #fff) 88%, transparent); box-shadow: 0 0 0 .5px rgba(15,15,15,.1); pointer-events: none; }
#at-count b { color: var(--c-texPri, #37352f); font-weight: 600; }
`;
    (document.head || document.documentElement).appendChild(st);
  }
  const mainContent = () => { const f = document.querySelector('.notion-frame'); return f ? f.querySelector('.notion-page-content') : null; };
  /* 目次 */
  let tocEl = null, tocT = 0, tocHeads = [];
  function tocBuild() {
    if (!AT.tools.toc) { if (tocEl) { tocEl.remove(); tocEl = null; } return; }
    const pc = mainContent();
    const hs = pc ? [...pc.querySelectorAll('.notion-header-block, .notion-sub_header-block, .notion-sub_sub_header-block')] : [];
    tocHeads = hs.map((h) => ({ el: h, l: h.classList.contains('notion-header-block') ? 1 : h.classList.contains('notion-sub_header-block') ? 2 : 3, t: atNorm(h.textContent).slice(0, 60) })).filter((x) => x.t);
    if (!tocHeads.length) { if (tocEl) tocEl.hidden = true; return; }
    atToolCss();
    if (!tocEl || !tocEl.isConnected) {
      tocEl = document.createElement('nav');
      tocEl.id = 'at-toc';
      tocEl.setAttribute('data-no-passthrough', '1');
      tocEl.addEventListener('click', (e) => { const a = e.target.closest('a[data-i]'); if (!a) return; e.preventDefault(); const h = tocHeads[+a.dataset.i]; if (h && h.el.isConnected) h.el.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
      document.body.appendChild(tocEl);
    }
    tocEl.hidden = false;
    tocEl.innerHTML = '<div class="at-toch">目次</div>' + tocHeads.map((h, i) => '<a data-i="' + i + '" data-l="' + h.l + '">' + atEsc(h.t) + '</a>').join('');
    tocMark();
  }
  function tocMark() {
    if (!tocEl || tocEl.hidden) return;
    let cur = 0;
    tocHeads.forEach((h, i) => { if (h.el.isConnected && h.el.getBoundingClientRect().top < 160) cur = i; });
    tocEl.querySelectorAll('a').forEach((a, i) => a.classList.toggle('on', i === cur));
  }
  /* フォーカス */
  function focusMark() {
    const de = document.documentElement;
    if (!AT.tools.focus) { de.removeAttribute('data-at-has-cur'); return; }
    const sel = document.getSelection();
    const n = sel && sel.anchorNode;
    const el = n ? (n.nodeType === 1 ? n : n.parentElement) : null;
    const pc = mainContent();
    let blk = null;
    if (el && pc && pc.contains(el)) { blk = el; while (blk && blk.parentElement !== pc) blk = blk.parentElement; }
    for (const x of document.querySelectorAll('[data-at-cur]')) if (x !== blk) x.removeAttribute('data-at-cur');
    if (blk) { blk.setAttribute('data-at-cur', '1'); de.setAttribute('data-at-has-cur', '1'); } else de.removeAttribute('data-at-has-cur');
  }
  /* 文字数 */
  let countEl = null;
  function countUpdate() {
    if (!AT.tools.count) { if (countEl) { countEl.remove(); countEl = null; } return; }
    const pc = mainContent();
    if (!pc) { if (countEl) countEl.hidden = true; return; }
    atToolCss();
    if (!countEl || !countEl.isConnected) { countEl = document.createElement('div'); countEl.id = 'at-count'; document.body.appendChild(countEl); }
    const sb = document.querySelector('.notion-sidebar-container');
    countEl.style.setProperty('--at-sbw', (sb ? Math.round(sb.getBoundingClientRect().width) : 0) + 'px');
    const chars = (s) => [...String(s).replace(/\s+/g, '')].length;
    const total = chars(pc.innerText || pc.textContent || '');
    const sel = document.getSelection();
    const picked = sel && !sel.isCollapsed && pc.contains(sel.anchorNode) ? chars(sel.toString()) : 0;
    countEl.hidden = false;
    countEl.innerHTML = (picked ? '選択 <b>' + picked.toLocaleString() + '</b> 字　·　' : '') + '<b>' + total.toLocaleString() + '</b> 字　·　約 ' + Math.max(1, Math.round(total / 500)) + ' 分';
  }
  function atApplyTools() {
    document.documentElement.toggleAttribute('data-at-focus', !!AT.tools.focus);
    if (AT.tools.focus) atToolCss();
    tocBuild(); focusMark(); countUpdate();
  }
  let toolT = 0;
  const toolSoon = () => { clearTimeout(toolT); toolT = setTimeout(() => { if (AT.tools.toc) tocBuild(); if (AT.tools.count) countUpdate(); }, 500); };
  document.addEventListener('selectionchange', () => { if (AT.tools.focus) focusMark(); if (AT.tools.count) toolSoon(); });
  window.addEventListener('scroll', () => { if (AT.tools.toc) { clearTimeout(tocT); tocT = setTimeout(tocMark, 60); } }, true);
  new MutationObserver((recs) => {
    if (!AT.tools.toc && !AT.tools.count) return;
    for (const r of recs) { const t = r.target; if (t.nodeType === 1 && t.closest && (t.closest('#at-toc, #at-count, .at-panel, #c26-menu'))) continue; toolSoon(); return; }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', () => setTimeout(atApplyTools, 800), { once: true });
  if (document.readyState !== 'loading') setTimeout(atApplyTools, 800);

  /* 起動（document-start: 基礎の層と変数は描画前に入れる） */
  atWrite();
  document.addEventListener('DOMContentLoaded', () => { atKeepLast(); g12Start(); }, { once: true });
  if (document.readyState !== 'loading') { atKeepLast(); g12Start(); }
  window.addEventListener('load', atKeepLast, { once: true });
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && !e.metaKey && e.code === 'KeyA') { e.preventDefault(); e.stopPropagation(); openAtelier(); }
  }, true);
  if (HAS_GM && typeof GM_addValueChangeListener === 'function') {
    try { GM_addValueChangeListener(AT_KEY, (name, oldV, newV, remote) => { if (!remote) return; const o = parseJ(newV); if (o && o.v === 1) { AT = Object.assign(AT, o); atWrite(); atRefresh(); } }); } catch (e) { /* noop */ }
  }
  const ATELIER_API = {
    version: VERSION, open: openAtelier, close: closeAtelier,
    tokens: () => Object.assign({}, AT.tokens),
    set: (k, v) => { if (v === undefined || v === null || v === '') delete AT.tokens[k]; else AT.tokens[k] = String(v); atWrite('tokens'); atSave(); return AT.tokens[k]; },
    layer: (k, on) => { AT.layers[k] = on !== false; atWrite('base'); atSave(); return AT.layers[k]; },
    rules: () => AT.rules.map((r) => ({ name: r.name, sel: r.sel, on: r.on !== false })),
    pick: () => { if (!atPanel) openAtelier(); atTab = 'any'; atRefresh(); atStartPick(); },
    tool: (k, on) => atTool(k, on),
    css: () => [atBaseCss().length + ' 文字（基礎の層）', atTokensCss(), atRulesCss()].join('\n'),
    export: () => JSON.stringify({ atelier: AT })
  };
  window.__atelier = ATELIER_API;
  try { if (typeof unsafeWindow !== 'undefined' && unsafeWindow !== window) unsafeWindow.__atelier = (typeof cloneInto === 'function') ? cloneInto(ATELIER_API, unsafeWindow, { cloneFunctions: true }) : ATELIER_API; } catch (e) { /* noop */ }


  const API_OBJ = {
    version: VERSION,
    open: openPanel,
    atelier: () => openAtelier(),
    pop: () => checkSelection(true),
    status: () => {
      const layout = activeLayout();
      return {
        version: VERSION,
        page: pageIdOf(layout),
        slots: Object.fromEntries(Object.entries(SLOTS).map(([c, v]) => [c, { name: v.name, st: v.st, sels: selsOf(c) }])),
        fontsAvailable: [...detectFonts()].filter(([, v]) => v).map(([k]) => fontOf(k).name),
        prefs: PREFS,
        lastSave: Object.assign({}, SAVE_STATE, { at: SAVE_STATE.t ? new Date(SAVE_STATE.t).toLocaleTimeString() : '' })
      };
    },
    log: () => { console.table(LOG); return LOG.length; },
    export: exportAll,
    import: (j) => { importAll(j); return 'ok'; },
    off: () => { PREFS.show = false; savePrefs(); writeSlotCss(); return '文字の書式を隠しました（__c26.on() で戻る）'; },
    on: () => { PREFS.show = true; savePrefs(); writeSlotCss(); return '表示しました'; },
    reset: () => { DB = { v: 1, global: blank(), pages: {}, names: {} }; SLOTS = {}; changed(); saveSlots(); writeSlotCss(); return '全部消しました（Notion に付いた色は残ります）'; },
    css: () => buildCss() + '\n' + (document.getElementById(MARK_STYLE_ID) || {}).textContent
  };
  window[API] = API_OBJ;
  try { if (typeof unsafeWindow !== 'undefined' && unsafeWindow !== window) unsafeWindow[API] = (typeof cloneInto === 'function') ? cloneInto(API_OBJ, unsafeWindow, { cloneFunctions: true }) : API_OBJ; } catch (e) { /* noop */ }
})();