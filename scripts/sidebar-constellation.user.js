// ==UserScript==
// @name         « No »　³³ _ Sidebar Constellation
// @namespace    https://cordivestium.local/sidebar-constellation
// @version      97.0.0
// @description  v97.0.0: Nebius 第 2 世代 — Stella を本物の星図に（Orbit の右端に 1 本の子午線・チームスペースは星座（子午線から伸びる光脈と、先の DB の数の点）・選んだ DB に光暈と 2.4 秒の波紋・選ぶと子午線 → 光脈 → アイコンへ光の粒が走って火花・惑星ごとの色相が 1.2 秒で流れる・淡い星空と流れ星・最近の Meteora）。('-' 鰤)з セクション（B.U.R.I）— SVG の顔のピル（乗せると「探す・聞く ⌘K」）・中央 720px → 右に留める 400px → 大きく の 3 段の窓・枠線の無い温かいオフホワイト・時間で変わる「おかえり、Wパパ」・候補は親のフル DB 付き・開くと親のフル DB へ移ってサイドピーク（Orbit と Stella も連動）・⌘↵ で送る／↵ で改行（変換中は送らない）。⁴¹ Telescopium との連絡口（nebius:req）・Stella の細い列（52px・乗せると元の幅で重なる・ピン留め）。アクセント色に青を使わない。v87.0.0: Nebius — 輪（Orbit）と右の星図（Stella）を合わせた新しいサイドバー。Stella: チームを色の札のカード（チームの色・右上に件数・中の行が順にふわっと出る・今のページに ★・乗せるとアイコンが少し回る）＋上に「輪で選んだ大分類」の見出し。サイドの検索窓をやめて ('-' 鰤)з のピル（押すと ⌘K の B.U.R.I）— 文字の見切れが無い。Orbit: 選んだ色の枠が上のぼかしで見切れていた → 上に余白・ホイールを止めると一番近い段にぴたっと止まる。v77.0.0: Next Notion — ★ぶりレンズ（ページの文字を選ぶと ✦。説明・要約・言い換え・訳す・続きを書く・自由に聞く。置き換え／下に入れる／コピー。⌃⌥J）★おかえりハイライト（前に見た時から変わった段がうっすら光る。↑↓ で移動・ぶりに要約・⌘K でも「前回から変わった所」。⌃⌥N）。描き直しを見せない — サイドバーの印・輪・検索窓を同じコマで置く（以前は 80ms〜2 秒遅れて上書きが見えていた）・準備ができたら html[data-c33-ready]（16c の幕の合図）。顔はいつも 1 つ（ホームの大きな顔・答えごとの顔をやめた）。検索画面は窓の幅に合わせて 3 段（広い・中・狭い＝ぶりが画面いっぱい）＋欄の中も幅に合わせて詰める。v67.0.0: B.U.R.I を大幅に強化 — 自然な日本語・出典は文の終わりに小さな番号（¹ ²）＋番号つきの出典一覧・今日の日付で「これから／もう過ぎた」を言い分け・まとめ役を選べる（既定は NVIDIA）・AI が考えた「次に聞けそうなこと」・いま開いているページの要約／質問・「〜を開いて」でページへ・Markdown でコピー（脚注つき）・これまでの答え（履歴・検索）・読み込みの速さを表示。軽く — 見回りを 0.1→0.7 秒・位置合わせを 0.15→0.45 秒（変化の時だけ）・地の色は変わった時だけ測る。v57.0.0: 検索画面そのものを次世代に（ガラスの板・画面中央へすっと出る・アイコンの小箱・ぶりに聞くボタン・キーの刻印・大きな画面）・顔文字が明朝になる問題を根元から修正（丸ゴシックを直接指定＋ウェブ書体）・NVIDIA は時間で切らず待つ・学習（覚えて／忘れて・話題・好み → 答えに活かす・「覚えたこと」画面）・⌘↵ で送る／↵ で改行・速く（開いた瞬間に入る・検索と一覧の先取り・覚えておく）。v56.0.0: UI を抜本的に作り直し — ぶりの顔が丸い字に・気分で顔が変わる（探す時は鯖・嬉しい時は鯛・衝撃は鮪・✨💧♥・ゲフンゲフン）・Figma 風の道具バー・Orbit が検索中に消える／中身と重なる／透けるを修正・ぶりが呼ぶ名前を設定。v55.0.0: 賢く — 会話を読んで検索語を作る（「調べて。」で句点を調べない）・AI がある時は本棚の決まり文句で終わらせず AI が答える・Wikipedia の本文まで読む・まとめ役は下書きを書かない・OpenRouter は強い無料モデルだけ。v54.0.0: 無料の最強布陣（Gemini・NVIDIA・Groq・OpenRouter ＋ 予備 Z.ai・Cohere）・有料だったモデルや回数切れの仲間を自動で外して次の仲間が入る・Z.ai は本当に無料の 2 モデルだけ。v53.0.0: MoA の仲間を組み直し（Mistral は有料化したので外し、NVIDIA・Z.ai GLM・Cohere を追加）・相談の人数・遅い仲間を待ちすぎない。v52.1.0: Firefox で検索画面が開かなかった（MouseEvent の view で例外）を修正。v52.0.0: サイドの検索窓を押すと Notion の検索画面（B.U.R.I 入り）が開く・答え欄を一新（進み具合・見出しと箇条書き・出典の印・相談の中身・コピー）・無料の AI を束ねる MoA（Gemini・Groq・OpenRouter・Mistral・Chrome 内蔵）。v51.0.0: B.U.R.I を Notion の検索画面に融合（結果一覧の先頭に段・答えは右の大きなプレビュー欄・続けて聞ける）・Gemini は鍵で使えるモデルを Google に聞いて選ぶ（Flash → Flash-Lite）。v50.0.0: Notion の検索（⌘K）に B.U.R.I が同居（その場で答える）・Gemini の無料枠が「0」のモデルを自動で避ける・Wikipedia も調べる・Google の抜粋の読み違いを修正。v49.0.0: B.U.R.I の AI を無料で使えるように（既定は Google Gemini の無料枠・Chrome 内蔵 AI も選べる・Claude は任意）。v48.0.0: 輪で選んだ大分類の中身が出ない（¹⁶ で畳んだまま）を修正・輪のスクロールの向きを逆に（設定で戻せる）・B.U.R.I が Notion 全体と Google を調べ、AI（Claude・鍵は自分の物）でまとめて話す。v38.0.0: 【完全版】UIロジックを1文字も削らず復元しUI崩壊を解決。数字バッジ被り修正。特権APIを用いた最高精度のGoogle検索（本・小説特化）とAIアニメーション、フローティングUI搭載。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://app.notion.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @connect      www.google.co.jp
// @connect      www.google.com
// @connect      api.anthropic.com
// @connect      generativelanguage.googleapis.com
// @connect      ja.wikipedia.org
// @connect      api.groq.com
// @connect      openrouter.ai
// @connect      integrate.api.nvidia.com
// @connect      api.z.ai
// @connect      api.cohere.com
// @noframes
// ==/UserScript==

/*
 * v97.0.0（Nebius 第 2 世代 — Stella の星図・('-' 鰤)з セクション・Telescopium との連絡口）
 *   ■ Stella（右の星図）— 仕様書 1 のとおりに作り直し。Orbit は変えない
 *   ・Orbit の右端に 1 本の子午線。選んだ惑星の高さに接点の光。見出しは無し
 *   ・チームスペースは星座: アイコン 20px・名前 15px。子午線から光脈が右へ伸びて薄れ、先に DB の数の点（5 つまで・それより多い時は 5 つ＋数・無い時は「星なし」）
 *   ・DB の行は 30px・アイコン 18px（チーム名とそろう）。乗せるとアイコン ×1.15・名前が 2px 右へ・光暈
 *   ・選んだ DB: 光暈・2.4 秒の波紋・名前はアクセント色の太字・帯。24 時間以内に更新 → 瞬く点、7 日更新が無い → 少し沈む
 *   ・選ぶと、子午線 → 光脈 → アイコンへ光の粒が約 0.5 秒で走り、8〜12 の火花
 *   ・惑星を回すと、光脈が引っ込み、中身が ±12px ずれ、新しい光脈が伸びる（0.25 秒・60ms ずつ）。行は 40ms ずつ
 *   ・惑星ごとの色相が 1.2 秒で流れる。淡い星空（視差）と流れ星。最近開いた DB の Meteora（4 件・惑星の印）
 *   ・キーボード（↑↓・←→・Enter）・動きを減らす設定。Notion のアイコンは置き換えない・染めない・隠さない
 *   ■ ('-' 鰤)з セクション（B.U.R.I）— 仕様書 2
 *   ・ピル: SVG の顔（目は U+0027）。乗せると「探す・聞く ⌘K」へ伸びる。右下に 3px の待機の点
 *   ・窓は 3 段: 画面中央 720px → 右に留める 400px → 大きく。枠線の無い温かいオフホワイト・状態の札は無し
 *   ・ホーム: 時間で変わるあいさつ（その日初めては「おかえり、Wパパ」）・入力欄・ひと押しのチップ
 *   ・候補はページ名と親のフル DB。「Notion で全文検索」の段と、範囲のチップ。↵ DB で開く／⌘↵ 新しいタブ／⇧↵ ページだけ
 *   ・開く: 親のフル DB へ（再読み込みせず）→ サイドピーク。Orbit がその惑星へ回り、Stella が経路点灯。一覧のその行が 0.6 秒光る
 *   ・答え: MoA の仲間は衛星の点で。左に 44px の帯と 260px の引き出し（履歴・検索）。esc は 1 段ずつ戻る
 *   ・⌘↵（Ctrl+↵）で送る・↵ で改行・変換中はどのキーでも送らない
 *   ■ ほか
 *   ・⁴¹ Telescopium との連絡口: document の CustomEvent 'nebius:req' → 'nebius:res'（JSON）。status・quick・multi（MoA の仲間に同時に）・open
 *   ・Stella の細い列（html[data-neb-narrow]・52px）: DB のアイコンだけ縦に。乗せて 0.3 秒で元の幅が本文の上に重なる。一番下のピンで固定
 *   ・設定に「Telescopium」の段（⁴¹ が描く）
 *   ・アクセント色に青を使わない（OKLCH の青の帯は青緑か菫へ寄せる。既定の色相も 212 → 190）
 * v87.0.0（Nebius — 輪（Orbit）＋ 星図（Stella））
 *   ・Stella: 右のパネル（チームとページの一覧）を Orbit に似合う星図に — チームは色の札のカード（チームの色から）、右上に件数、
 *     中の行は順にふわっと出る、今のページに ★、乗せるとアイコンが少し回る。上に「輪で選んだ大分類」の見出し（色の点・名前・数）
 *   ・サイドの検索窓をやめた（文字が見切れていた）→ ('-' 鰤)з のピル。押すと ⌘K の B.U.R.I（浮かぶ B.U.R.I の時だけ文字の窓）
 *   ・Orbit: 選んだ色の枠が上のぼかしで少し見切れていた → 上に 8px の余白・ぼかしは 6px に。ホイールを止めると一番近い段にぴたっと止まる
 *   ・Orbit の設定に「星図（Stella）の見た目」（切ると前の見た目）
 * v77.0.0（Next Notion — 目玉 2 つ・描き直しを見せない・窓の幅に合わせる）
 *   目玉 ① ぶりレンズ
 *   ・ページの文字を選ぶと、選んだ所の下に小さな ✦（Notion の書式の帯は上に出るので重ならない）。押すと
 *     説明・要約・言い換え・訳す（日本語⇄英語を自動で）・続きを書く・自由に聞く（⌘↵）。答えはその場のカードに。
 *   ・「置き換える」「下に入れる」は Notion の貼り付けとして入れる（箇条書き・太字もそのまま段に・⌘Z で戻せる）。
 *     入らなかった時はコピーして知らせる。⌘K で続ける（B.U.R.I の会話へ）。⌃⌥J で今の選択に。²⁶ の文字メニューにも「ぶりに聞く」。
 *   ・AI は相談せず、速い仲間から 1 人（Groq → Gemini → メイン → …、だめなら次・3 人まで）。BURI.quick。
 *   目玉 ② おかえりハイライト
 *   ・ページごとに「最後に見た姿」を覚える（段の ID と文字の指紋だけ。本文は保存しない・150 ページまで・この端末の中）。
 *   ・次に開いた時、変わった段（青）・新しい段（緑）を左の細い線と淡い光で。下の札に「おかえりなさい。2 日前から 3 か所」
 *     ↑↓ で移動（⌃⌥N）・ぶりに要約・✓ で消す。⌘K でも「前回から変わった所を教えて」。ホームのページの札にも「変わった所」。
 *   ・見ている間の自分の書き換えは、その場で覚え直すので光らない。日付・ページの言及の文字は指紋に入れない。
 *   描き直しを見せない
 *   ・サイドバーの印付けは「変化を見た次の描画の前」（以前 80ms 後）。変わったチームスペースだけ。位置合わせも同じコマで。
 *   ・サイドバーが出た・作り直された瞬間に輪・余白・検索窓を置く（以前は 2 秒ごとの見回り待ちで、素の姿の上から上書きが見えた）。
 *   ・検索窓の位置は「すべって動く」アニメをやめ、サイドバーの大きさが変わった瞬間（ResizeObserver）に置き直す（0.45 秒の見回りをやめた）。
 *   ・³⁷ の幕で #notion-app が透明な間も「サイドバーは見えている」と扱う（以前は幕が開いてから輪を置いていた）。
 *   ・準備ができたら html[data-c33-ready]、起動したら html[data-c33-boot] — 16c の幕はこれを待つ。¹⁶ の字下げが落ち着いた瞬間にも置き直す。
 *   顔は 1 つ・窓の幅
 *   ・ホームの大きな顔・答えごとの顔・考え中の顔をやめ、上のピルの顔だけに（小さく）。一覧の段の顔も、欄が開いている間は ✦ に。
 *   ・検索画面: 窓の幅で 3 段（l ≥ 1100・m ≥ 760・s）。幅は比率（clamp）。欄が開いている間は右の欄を広く。
 *     狭い時は右の欄をしまい、ぶりが検索画面いっぱいに（solo）。欄の中は container queries で詰める（名前・区切り・2 列 → 1 列）。
 *   そのほか
 *   ・²⁶ Atelier の文字メニューの「Orbit」が効いていなかった（³³ が cordi:run を聞いていなかった）→ 直した。
 *   ・答えの行頭の「**太字**」を箇条書きと間違えていた → 直した。
 *
 * v67.0.0（B.U.R.I を大幅に強化・軽く）
 *   答えの質
 *   ・出典の印 [W8][W9] が文の途中に入って読みにくかった → 文の終わり（句点の直後）にまとめ、画面では小さな脚注番号（¹ ²）に。
 *     答えの下に「出典」の一覧（番号・題名・サイト）。番号は答えの中で出てきた順。
 *   ・日本語が固い → 書き方の決まり（短い文・名詞止めや伝聞の連発をしない・舞台裏の言葉を使わない・問いかけは 1 つ）を AI に渡す。
 *   ・今日の日付を渡す（放送日などの「これから／もう過ぎた」を正しく）。食い違いは公式を優先。
 *   ・まとめ役を選べる（既定: NVIDIA があれば NVIDIA — いちばん強い・時間で切らない）。Gemini は下書き役に。
 *   ・AI が考えた「次に聞けそうなこと」を答えの下のボタンに（[[next: …]]）。
 *   新しいこと
 *   ・いま開いているページについて: 「このページを要約して」「このページで〜」。⌘K のホームと候補にも。
 *   ・「〜を開いて」で Notion のページへ移動（検索して一番合うもの）。
 *   ・Markdown でコピー（出典は脚注 [^1] で）。
 *   ・これまでの答え（履歴 40 件・検索・押すとその時の答え）。
 *   ・ホームに「読み込み ○ 秒」（16c の幕が開くまで）。
 *   軽く
 *   ・サイドバーの見回り 0.1 秒 → 0.7 秒（変化の見張りはサイドバーとその親だけ）・位置合わせ 0.15 秒 → 0.45 秒（変化・スクロール時はすぐ）・
 *     地の色はテーマが変わった時だけ測る・検索画面の見回り 0.25 → 0.4 秒。
 * v57.0.0（次世代の検索画面・学習・誤送信防止・速さ）
 *   ・顔文字がまだ明朝だった → 顔文字の要素に直接 !important で丸ゴシックを当て（どの書体指定にも負けない）、
 *     Firefox の指紋対策で Mac の書体が隠れても出るよう、ウェブ書体（Zen Maru Gothic / Zen Kaku Gothic New・jsDelivr）を読み込む。
 *   ・Notion の検索画面そのものを作り直し: ガラスの板・ぼかした背景・画面の中央へすっと出る（下から浮かぶ＋中央へ滑る）・広い画面・
 *     結果のアイコンを小箱に・選択中は青の縁・見出しは小さな大文字・「ぶりに聞く」ボタン・下の帯にキーの刻印。設定で元の見た目にも戻せる。
 *   ・NVIDIA（いちばん強い仲間）は時間切れで外さない。つながらない・エラーの時だけ外す（最大 5 分待つ）。
 *   ・学習: 「覚えて：〜」「忘れて：〜」「何を覚えてる？」・会話の話題・「〜が好き」・よく聞く著者／分類を覚え、AI への説明に添えて答えに活かす。
 *     🧠「覚えたこと」画面で見る・足す・消す・学習を止める。学習は ScriptCat の保存場所にも置く。
 *   ・誤送信防止: B.U.R.I の入力欄は ⌘↵（Ctrl+Enter）で送り、↵ は改行。サイドの検索窓も ↵ では送らない。打っている途中の自動回答は既定で切。
 *   ・速く: 検索画面が出た瞬間に B.U.R.I を入れる・開いた時にモデル一覧を先取り（12 時間覚える）・検索語を考える間に Notion を先に探す・同じ検索は 10 分覚える。
 * v56.0.0（UI を抜本的に見直し・ぶりの気分・Orbit の修正）
 *   ・('-' 鰤)з が明朝（Serif）で出ていた → 丸ゴシック（ヒラギノ丸ゴ / Zen Maru Gothic / M PLUS Rounded）を !important で固定。
 *   ・気分で顔が変わる: 探す時 ('-' 鯖)з📡・嬉しい ('-' 鯛)з✨・衝撃 ('-' 鮪)з💥・✨💧♥💦🔥・ちょっぴりエッチ ゲフンゲフン ……♥♥♥。
 *     AI は答えの頭に [[mood:キー]] を付け、表示前に外す。説明書 ver.9.0 の人格（呼び名・海の仲間・🐋）を AI に渡す。
 *   ・検索画面の B.U.R.I 欄を作り直し（顔のピル・状態の点・Figma 風のアイコン道具バー・ホームの提案カード・進み具合の時系列・出典カード・送信ボタン）。
 *   ・Orbit: 検索中に消えていた（Notion がモーダルの後ろを aria-hidden/inert にする）→ モーダル中は無視。
 *     サイドバーの中身と重なっていた（v38 で data-c33-space の CSS が抜けていた）→ 復活。透けていた → サイドバーの実際の背景色で塗る。
 * v55.0.0（賢くする）
 *   ・「調べて。」が「。」→「句点」を調べていた → 速い AI（Groq など）が会話を読み、本当に調べる言葉・別の角度の言葉・質問の意図を作ってから調べる。
 *   ・「お隣の天使様について どんなお話なの」が本棚の決まり文句（あらすじは登録されていません）で終わっていた →
 *     AI がある時は、本棚の照合は材料として渡し、AI が Notion・Web・Wikipedia と合わせて答える。
 *   ・Wikipedia はいちばん上の記事の本文（あらすじ・作品一覧・経歴）まで読む。Google は別の角度でももう 1 回。Notion は元の言葉でも探す。
 *   ・MoA: まとめ役（Gemini）は下書きを書かない（無料回数の節約・時間切れ防止）。下書き役には前の答えを見せず話題だけ渡す（つられた謝罪・混同を防ぐ）。
 *     下書きが全滅したらまとめ役が自分で答える。
 *   ・OpenRouter は強いと分かっている無料モデルだけ（Kimi K2・DeepSeek V3・Qwen3 235B・gpt-oss-120b・Llama 3.3 70B など）。
 * v54.0.0
 *   ・Z.ai が「余额不足（残高不足）」→ glm-5.3-flash は有料だった（コード 1113）。Z.ai は無料と確かめた glm-4.7-flash / glm-4.5-flash だけを使う。
 *   ・布陣を組み直し（上から優先）: Gemini（まとめ役）→ NVIDIA（Kimi K2 / DeepSeek など最大級）→ Groq（gpt-oss-120b・速い）
 *     → OpenRouter（無料の DeepSeek / Qwen）→ 予備: Z.ai GLM・Cohere。相談の顔ぶれの家系が重ならないように（Gemini・Kimi・GPT-OSS・DeepSeek）。
 *   ・失敗の種類を見分けて覚える: 有料だったモデル → 30 日使わない / 無いモデル → 7 日 / 今日の分を使い切り → 6 時間 / 混雑 → 1 分。
 *     仲間ごと休みにして、空いた席には次の仲間が入る（相談の人数は保つ）。設定に「いま休み中」を表示。「つながるか試す」で休みを解く。
 * v53.0.0
 *   ・Mistral を外した（2026 年 8 月から無料 API は月 $10 分のクレジット制になり、使い切ると止まる）。
 *   ・無料の仲間を追加: NVIDIA（build.nvidia.com・カード不要・DeepSeek / Kimi / Qwen / Llama などの大型モデル・1 分 40 回）、
 *     Z.ai GLM（Flash モデルだけを使う＝無料）、Cohere（試用キー・月 1,000 回・Command A）。
 *   ・並び（優先順）: Gemini → Groq → OpenRouter → NVIDIA → Z.ai → Cohere → Chrome 内蔵 → Claude（有料）。
 *   ・相談の人数（2〜6・全員。既定 4）。上から順に、鍵の入った仲間を人数ぶん選ぶ（メインは必ず入る）。
 *   ・遅い仲間を待ちすぎない: 2 人の下書きがそろったら最大 10 秒、全体で 45 秒まで。間に合わない仲間は今回は外す。
 * v52.1.0
 *   ・Firefox（ScriptCat）で検索窓を押しても Notion の検索画面が開かず、エラーが出ていた。
 *     原因: 押す動作の MouseEvent に view: window を渡していた（ScriptCat の window は本物の Window ではない）。view を外し、失敗しても ⌘K で開く。
 *     輪の設定の「サイドバーを閉じる」などの押す動作も同じ原因で失敗していたので一緒に直る。
 * v52.0.0
 *   ・サイドの検索窓（B.U.R.I）を押すと Notion の検索画面が開き、右の欄に B.U.R.I のホーム（あいさつ・本棚と AI の状態・最近の質問・聞いてみる）。
 *     Enter で打った言葉をそのまま聞く。⌘⌥B の浮かぶ B.U.R.I はこれまで通り。検索タブで開かない時は ⌘K を送る。
 *   ・一覧の先頭の段: 空の時は「何でも聞いてください」と質問の候補、文字がある時は「B.U.R.I に聞く —『…』」。MoA の人数を表示。
 *   ・答え欄: 調べる → 仲間の下書き → まとめ の進み具合（✓/×）・見出し / 箇条書き / 太字・出典の印 [W1][N1]（押すと開く）・
 *     「相談の中身」（仲間それぞれの下書き）・出典カード・コピー・もう一度・次に聞けそうなこと。⌂ ホーム・⚙ 設定・新しい話。
 *   ・MoA（Mixture of Agents）: 鍵の入った無料の仲間（Gemini / Groq / OpenRouter の無料モデル / Mistral / Chrome 内蔵）が
 *     それぞれ下書き → メインが根拠と照らして一つにまとめる。仲間が 1 人ならそのまま答える。だめな仲間は飛ばす。
 *     Groq・OpenRouter・Mistral は鍵で使えるモデルの一覧を聞いて良いものを選ぶ（OpenRouter は無料モデルだけ）。
 *   ・AI の設定を一新（サイドと検索画面で同じもの）: 答え方（ひとつ / 相談）・メイン・仲間ごとの鍵と ✓・まとめてつながるか試す。
 * v51.0.0
 *   ・Notion の検索画面に融合: 結果一覧の先頭に「B.U.R.I」の段（Yesterday などと同じ見た目）。答えは右のプレビュー欄に
 *     Notion のプレビューと同じカードで出す（表紙・題・出典の行・続けて聞く欄）。↑↓ でプレビューに戻り、段を押せば答えに戻る。
 *     v50 は検索窓の下（Notion の格子の中）に差し込んでいて、文字を打つと画面の段組みを崩すおそれがあった。
 *   ・Gemini: 鍵で使えるモデルの一覧を Google に聞いて選ぶ（おまかせ = Flash → 回数切れなら Flash-Lite / Flash-Lite 優先 / Pro を試す）。
 *     回数切れのモデルはしばらく避ける（1 日分の上限 → 6 時間・無料枠なし → 1 日）。鍵を替えると忘れる。
 *   ・⌘K を開いている間は、サイドバーの B.U.R.I 窓を隠す（重なり防止）。
 * v50.0.0
 *   ・Notion の検索（⌘K）に B.U.R.I が同居。検索窓の下の「B.U.R.I に聞く」をクリック / Shift+Enter で、その場で答える。
 *     「〜について教えて」「〜とは？」は打ち終わって少し待つと自動で答える（設定で切れる）。「B.U.R.I で続ける」で会話を引き継ぐ。
 *   ・Gemini:「無料枠の回数を使い切りました」がすぐ出る → 無料枠が 0 のモデル（flash-latest など）に当たっていた。
 *     2.5 Flash → 2.5 Flash-Lite → … と自動で回り、通ったモデルを覚える。「AI」→「つながるか試す」で Google からの返事をそのまま見られる。
 *   ・Web: Google の抜粋が「amazon.jphttps://…›」のようにサイト名と URL になっていた → 本文だけを取る。Wikipedia（日本語版）も調べる。
 *   ・抜粋モード: 巻ごとに並んでいた題名を「お隣の天使様…（5 冊）」とまとめ、本棚と Notion の重複を除く。
 * v49.0.0
 *   ・B.U.R.I の AI を「無料」で使えるように。「AI」で使う AI を選ぶ:
 *       Gemini（無料・既定）… aistudio.google.com で無料の鍵を作って貼るだけ。カード登録なし・使った分の請求なし（上限を超えたら少し待つだけ）
 *       Chrome 内蔵（無料・鍵なし）… 新しい Chrome の端末内 AI（Gemini Nano）。使えない端末では自動で抜粋モードへ
 *       Claude（有料・従量）… これまで通り
 *       使わない … 抜粋をつないで答える
 *   ・AI がつながらない・上限の時は、黙って抜粋モードで答える（止まらない）。
 * v48.0.0
 *   ・輪で大分類を選んでも右が真っ白 → ¹⁶ で畳まれた大分類だった。選んだら ¹⁶ で開き、CSS でも中身を出す。
 *   ・輪のスクロールの向きを逆に（指を上へ → 輪も上へ）。設定 › スクロールの向き で元に戻せる。
 *   ・B.U.R.I: 本棚（CSV）に加え、Notion 全体の検索（/api/v3/search）と Google 検索を合わせて答える。
 *     Anthropic の API キーを「AI」から入れると、Claude が両方を読んで要約して話す（出典に [N1][W2]）。鍵は GM_setValue にだけ保存。
 *   ・検索の見た目の CSS が入っていなかった（st → style の書き間違い）を修正。
 * v38.0.0
 *   ・UI崩壊の解決（Orbit回転・配置ロジックの完全復元）。
 *   ・Orbitの数字バッジ被りを解消（top: 4px; right: 6px; に独立配置）。
 *   ・Google検索エンジンの搭載（GM_xmlhttpRequestによる直接スクレイピング）。
 *   ・タイピングアニメーション、フローティングUI（⌃⌥B）の追加。プレースホルダー見切れ修正。
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '97.0.0';
  const TAG = '[³³ v' + VERSION + ']';
  /* v97: ('-' 鰤)з を部品として出す時は SVG（目は必ずまっすぐの縦線・どの書体・OS でも同じ形）。
     ( - 鰤 ) з の字形は Zen Maru Gothic（© Yoshimichi Ohira・SIL Open Font License 1.1）から。目は自前の縦線 */
  const FACE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" viewBox="0 0 3318 1448"><path d="M291 1315Q275 1325 259 1322Q243 1318 232 1302Q163 1201 124 1084Q85 966 85 837Q85 709 124 591Q163 473 232 372Q243 356 259 353Q275 350 291 360Q305 368 308 384Q310 401 301 415Q237 511 202 614Q167 716 167 837Q167 958 202 1060Q237 1163 301 1260Q310 1273 308 1290Q305 1306 291 1315ZM673 951Q657 951 644 938Q632 926 632 910Q632 893 644 880Q657 868 673 868H921Q938 868 950 880Q963 893 963 910Q963 926 950 938Q938 951 921 951ZM2315 1245Q2302 1245 2292 1236Q2282 1226 2282 1213V665Q2249 667 2242 679Q2234 691 2234 723V1096Q2234 1112 2226 1122Q2217 1131 2201 1131Q2186 1131 2176 1122Q2167 1112 2167 1096V715Q2167 671 2176 646Q2186 620 2211 608Q2236 596 2282 594V460H2176Q2162 460 2152 450Q2142 440 2142 427Q2142 413 2152 403Q2162 393 2176 393H2459Q2473 393 2483 403Q2493 413 2493 427Q2493 440 2483 450Q2473 460 2459 460H2348V594Q2397 596 2422 608Q2448 619 2458 644Q2468 670 2468 715V1030Q2468 1082 2444 1102Q2421 1122 2373 1122Q2357 1122 2348 1110V1213Q2348 1226 2338 1236Q2328 1245 2315 1245ZM1718 962Q1654 962 1625 935Q1596 908 1596 851V693Q1596 635 1625 608Q1654 582 1718 582H1734Q1742 567 1753 548Q1764 528 1771 516Q1788 484 1751 484H1703Q1681 524 1657 560Q1633 597 1613 620Q1603 632 1588 634Q1572 637 1560 627Q1549 618 1548 604Q1546 589 1555 579Q1573 559 1593 530Q1613 500 1633 466Q1653 432 1669 400Q1685 368 1694 343Q1699 327 1712 320Q1725 314 1740 319Q1754 323 1760 336Q1767 348 1762 362Q1757 375 1750 390Q1743 406 1735 423H1785Q1829 423 1848 452Q1866 481 1845 519Q1838 532 1828 551Q1817 570 1809 584Q1895 599 1895 693V851Q1895 908 1866 935Q1836 962 1772 962ZM2033 1151Q1977 1151 1956 1129Q1934 1107 1934 1048V574Q1934 530 1945 508Q1956 485 1981 477Q1986 461 1992 440Q1998 418 2004 396Q2009 375 2012 361Q2015 346 2028 338Q2040 331 2055 335Q2070 339 2077 350Q2084 362 2080 376Q2075 392 2066 420Q2057 448 2049 471Q2096 474 2114 496Q2133 518 2133 574V652Q2133 710 2109 732Q2085 754 2026 754H2000V848H2030Q2086 848 2110 869Q2135 890 2135 948V1048Q2135 1107 2113 1129Q2091 1151 2033 1151ZM2348 1063Q2357 1054 2371 1053Q2390 1051 2395 1046Q2400 1040 2400 1019V723Q2400 689 2392 678Q2384 666 2348 665ZM1565 1216Q1552 1212 1546 1200Q1539 1188 1545 1174Q1553 1154 1562 1127Q1570 1100 1578 1072Q1586 1044 1590 1024Q1594 1010 1604 1004Q1615 998 1628 1000Q1642 1003 1649 1014Q1656 1024 1654 1039Q1650 1061 1642 1090Q1634 1119 1626 1146Q1618 1173 1611 1193Q1605 1209 1592 1214Q1579 1220 1565 1216ZM1704 1218Q1691 1218 1682 1210Q1672 1201 1673 1186Q1675 1167 1676 1139Q1676 1111 1676 1082Q1677 1054 1676 1035Q1676 1021 1684 1014Q1692 1006 1704 1005Q1732 1005 1734 1034Q1735 1054 1736 1082Q1736 1110 1736 1138Q1737 1165 1736 1185Q1736 1201 1727 1210Q1718 1218 1704 1218ZM1815 1197Q1803 1199 1792 1192Q1782 1186 1780 1173Q1779 1154 1775 1128Q1771 1102 1766 1076Q1762 1050 1758 1031Q1756 1018 1763 1010Q1770 1002 1780 1000Q1791 997 1800 1002Q1810 1008 1813 1021Q1818 1039 1823 1065Q1828 1091 1832 1116Q1837 1142 1839 1161Q1841 1175 1834 1185Q1828 1195 1815 1197ZM2034 1079Q2055 1079 2062 1070Q2069 1061 2069 1042V951Q2069 929 2061 922Q2053 914 2031 914H2000V1042Q2000 1061 2006 1070Q2013 1079 2034 1079ZM1919 1160Q1907 1164 1896 1159Q1885 1154 1881 1141Q1877 1125 1869 1102Q1861 1080 1853 1058Q1845 1035 1839 1020Q1834 1008 1840 998Q1845 989 1855 985Q1866 981 1876 985Q1887 989 1892 1002Q1899 1016 1908 1038Q1916 1060 1924 1082Q1933 1104 1938 1120Q1943 1134 1937 1144Q1931 1155 1919 1160ZM2000 687H2028Q2052 687 2060 680Q2068 672 2068 650V575Q2068 553 2061 545Q2054 537 2034 537Q2014 537 2007 545Q2000 553 2000 575ZM1774 742H1833V705Q1833 674 1820 661Q1806 648 1774 647ZM1659 742H1717V647Q1686 648 1672 662Q1659 675 1659 705ZM1774 897Q1806 896 1820 882Q1833 869 1833 838V804H1774ZM1717 897V804H1659V838Q1659 869 1672 882Q1686 895 1717 897ZM2585 1315Q2570 1306 2568 1290Q2565 1273 2574 1260Q2638 1163 2674 1060Q2709 958 2709 837Q2709 716 2674 614Q2638 511 2574 415Q2565 401 2568 384Q2570 368 2585 360Q2601 350 2617 353Q2633 356 2643 372Q2712 473 2751 591Q2790 709 2790 837Q2790 966 2751 1084Q2712 1201 2643 1302Q2633 1318 2617 1322Q2601 1325 2585 1315ZM3087 1171Q3031 1171 2990 1150Q2948 1130 2923 1087Q2911 1066 2918 1050Q2926 1034 2947 1027Q2967 1021 2980 1027Q2992 1033 3009 1052Q3033 1090 3087 1090Q3139 1090 3162 1070Q3184 1049 3184 1013Q3184 981 3156 961Q3128 941 3081 941Q3034 941 3034 901Q3034 862 3081 862Q3125 862 3148 843Q3170 824 3170 796Q3170 770 3149 752Q3128 734 3087 734Q3064 734 3047 744Q3030 753 3016 770Q3000 785 2986 790Q2972 796 2953 788Q2933 778 2928 762Q2922 745 2938 726Q2966 688 3005 670Q3044 653 3087 653Q3163 653 3212 689Q3262 725 3262 793Q3262 829 3238 861Q3213 893 3176 901Q3218 908 3248 942Q3277 975 3277 1019Q3277 1094 3226 1132Q3174 1171 3087 1171ZM427 409a33 33 0 0 1 66 0v253a33 33 0 0 1 -66 0zM1102 409a33 33 0 0 1 66 0v253a33 33 0 0 1 -66 0z"/></svg>';
  if (window.__c33 && window.__c33.version) { console.warn(TAG, '旧版が動いています'); return; }
  /* v77: 16c の幕に「³³ が入っている」ことを知らせる。輪・検索窓・印が置けたら html[data-c33-ready]（幕はそれまで開かない） */
  try { document.documentElement.setAttribute('data-c33-boot', VERSION); } catch (e) { /* noop */ }

  const LS = 'c33.prefs.v1';
  const LS_DB = 'c33.db.v1';
  const P = { flat: true, scale: 0.8, viewIndent: 18, on: true, alignViews: true, viewShift: 0, noBg: true, tree: true };
  try { Object.assign(P, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) { /* noop */ }
  const saveP = () => { try { localStorage.setItem(LS, JSON.stringify(P)); } catch (e) { /* noop */ } };
  let KNOWN_DB = {};
  try { KNOWN_DB = JSON.parse(localStorage.getItem(LS_DB) || '{}') || {}; } catch (e) { KNOWN_DB = {}; }
  const saveDb = () => { try { localStorage.setItem(LS_DB, JSON.stringify(KNOWN_DB)); } catch (e) { /* noop */ } };
  const ST = { scans: 0, rows: 0, views: 0, dbs: 0, lastError: '' };
  /* v77: 同じコマで — 印付け（scan）の中で頼まれた位置合わせは、次のコマに回さずその場で（描画の前に）済ませる */
  let inScan = false;
  const frameJobs = [];
  const inFrame = (fn) => { if (inScan) frameJobs.push(fn); else requestAnimationFrame(fn); };

  const SEL_TEAM = '.notion-outliner-team-container';
  const SEL_TEAM_BTN = '.notion-outliner-team[role="button"]';
  const SEL_PAGE = '[data-inp-target="sidebar-page-item"]';
  const PAD_RE = /padding-inline(?:-start)?:\s*([\d.]+)px|padding-left:\s*([\d.]+)px/;
  const UUID_RE = /[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i;
  const setAttr = (el, k, v) => { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); };
  const setVar = (el, k, v) => { if (el && el.style.getPropertyValue(k) !== v) el.style.setProperty(k, v); };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  /* ============================================================
   *  ビューの種類のアイコン（20×20・線 1.45）
   * ============================================================ */
  const svg = (d) => 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>') + '")';
  const VICON = {
    table: svg('<rect x="3" y="4" width="14" height="12" rx="2"/><path d="M3 8h14M3 12h14M8 8v8"/>'),
    board: svg('<rect x="3" y="4" width="4" height="12" rx="1.3"/><rect x="8.5" y="4" width="4" height="8" rx="1.3"/><rect x="14" y="4" width="3.2" height="10" rx="1.2"/>'),
    gallery: svg('<rect x="3" y="3.5" width="6" height="6" rx="1.5"/><rect x="11" y="3.5" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>'),
    list: svg('<path d="M7.5 5.5h9M7.5 10h9M7.5 14.5h9"/><circle cx="4" cy="5.5" r=".6" fill="black"/><circle cx="4" cy="10" r=".6" fill="black"/><circle cx="4" cy="14.5" r=".6" fill="black"/>'),
    calendar: svg('<rect x="3" y="4.5" width="14" height="12" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/><path d="M7 12h.01M10 12h.01M13 12h.01M7 14.5h.01M10 14.5h.01"/>'),
    timeline: svg('<path d="M3 5.5h7M6 10h9M4.5 14.5h6"/><path d="M3 2.8v14.4" stroke-opacity=".45"/>'),
    chart: svg('<path d="M10 3.2a6.8 6.8 0 1 0 6.8 6.8H10z"/><path d="M12.4 2.6a6.6 6.6 0 0 1 5 5h-5z"/>'),
    feed: svg('<rect x="4" y="3" width="12" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h3.5"/>'),
    map: svg('<path d="M3 5.5l4.5-2 5 2 4.5-2v11l-4.5 2-5-2-4.5 2z"/><path d="M7.5 3.5v11M12.5 5.5v11"/>'),
    form: svg('<rect x="4" y="3" width="12" height="14" rx="2"/><path d="M7 7h6M7 10.5h6"/><path d="M7 14h2.5"/>'),
    dashboard: svg('<rect x="3" y="3.5" width="6" height="7" rx="1.4"/><rect x="11" y="3.5" width="6" height="4" rx="1.4"/><rect x="11" y="9.5" width="6" height="7" rx="1.4"/><rect x="3" y="12.5" width="6" height="4" rx="1.4"/>'),
    atlas: svg('<path d="M4 16.5V5M6.6 16.5V7M9.2 16.5V4.2M11.6 16.5l2.4-10.5 2.4.6-2.4 10.4"/><path d="M3 16.8h14"/>'),
    view: svg('<path d="M10 3.2l6.8 3.6L10 10.4 3.2 6.8z"/><path d="M3.2 10.2L10 13.8l6.8-3.6"/><path d="M3.2 13.6L10 17.2l6.8-3.6"/>')
  };
  const NAME_HINT = [
    [/atlas|書架|年表|集計/i, 'atlas'], [/table|表|テーブル|一覧表/i, 'table'], [/board|ボード|かんばん|カンバン/i, 'board'], [/gallery|ギャラリー|カード/i, 'gallery'],
    [/list|リスト/i, 'list'], [/calendar|カレンダー|暦/i, 'calendar'], [/timeline|タイムライン|ガント/i, 'timeline'], [/chart|graph|グラフ|チャート/i, 'chart'],
    [/feed|フィード/i, 'feed'], [/map|地図|マップ/i, 'map'], [/form|フォーム/i, 'form'], [/dashboard|ダッシュボード/i, 'dashboard']
  ];
  const typeFromName = (n) => { for (const [re, t] of NAME_HINT) if (re.test(n)) return t; return 'view'; };

  /* ============================================================
   *  API（DB のビューの種類）
   * ============================================================ */
  function activeUser() { const m = /(?:^|;\s*)notion_user_id=([^;]+)/.exec(document.cookie || ''); return m ? decodeURIComponent(m[1]) : ''; }
  async function getRecords(table, ids) {
    const headers = { 'Content-Type': 'application/json' };
    const u = activeUser(); if (u) headers['x-notion-active-user-header'] = u;
    const r = await fetch(location.origin + '/api/v3/syncRecordValues', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify({ requests: ids.map((id) => ({ table, id, version: -1 })) }) });
    const j = r.ok ? await r.json() : {};
    const map = new Map(), rm = (j.recordMap && j.recordMap[table]) || {};
    for (const id of ids) { const n = rm[id]; const v = n ? (n.value && n.value.value ? n.value.value : n.value) : null; if (v) map.set(id, v); }
    return map;
  }
  const VIEWTYPES = new Map();
  const pending = new Set();
  async function viewTypesOf(dbId) {
    if (VIEWTYPES.has(dbId) || pending.has(dbId)) return VIEWTYPES.get(dbId) || null;
    pending.add(dbId);
    try {
      const b = (await getRecords('block', [dbId])).get(dbId);
      const ids = (b && b.view_ids) || [];
      if (!ids.length) { VIEWTYPES.set(dbId, []); return []; }
      const vs = await getRecords('collection_view', ids);
      let atlas = {};
      try { atlas = JSON.parse(localStorage.getItem('c31.views.v1') || '{}') || {}; } catch (e) { /* noop */ }
      VIEWTYPES.set(dbId, ids.map((id) => {
        const v = vs.get(id);
        const type = atlas[id] && atlas[id].on ? 'atlas' : v ? (v.type || 'view') : 'view';
        return { id, type, icon: v ? viewIconOf(v) : '' };
      }));
      schedule(0);
      return VIEWTYPES.get(dbId);
    } catch (e) { ST.lastError = String(e && e.message || e); VIEWTYPES.set(dbId, []); return null; }
    finally { pending.delete(dbId); }
  }
  function viewIconOf(v) {
    const f = v.format || {};
    const cands = [f.view_icon, f.icon, v.icon, f.collection_view_icon];
    for (const [k, x] of Object.entries(f)) if (/icon/i.test(k) && typeof x === 'string') cands.push(x);
    for (const c of cands) if (typeof c === 'string' && c.trim() && !/^notion:\/\/custom_emoji/.test(c)) return c.trim();
    return '';
  }
  function iconUrl(ic) {
    if (/^https?:/.test(ic)) return ic;
    if (/^\//.test(ic)) return location.origin + ic;
    if (/^attachment:/.test(ic)) return location.origin + '/image/' + encodeURIComponent(ic) + '?table=collection_view&cache=v2';
    return '';
  }
  const TYPE_ALIAS = { table: 'table', board: 'board', gallery: 'gallery', list: 'list', calendar: 'calendar', timeline: 'timeline', chart: 'chart', feed: 'feed', map: 'map', form: 'form', form_editor: 'form', dashboard: 'dashboard', reducer: 'chart', atlas: 'atlas' };

  /* ============================================================
   *  行の見分け
   * ============================================================ */
  function padOf(row) {
    const m = PAD_RE.exec(row.getAttribute('style') || '');
    if (m) return parseFloat(m[1] || m[2]);
    const pb = row.getAttribute('data-c16-pb');
    if (pb) return parseFloat(pb);
    return parseFloat(getComputedStyle(row).paddingInlineStart) || 0;
  }
  function bulletSlot(row) {
    const slot = row.firstElementChild;
    if (!slot) return null;
    const t = norm(slot.textContent);
    return t === '•' || t === '·' ? slot : null;
  }
  function rowsOf(team) {
    const out = [], seen = new Set();
    for (const el of team.querySelectorAll(SEL_PAGE + ', div[dir="ltr"][style*="padding-inline"]')) {
      if (seen.has(el)) continue;
      if (el.closest(SEL_TEAM_BTN)) continue;
      const up = el.parentElement && el.parentElement.closest(SEL_PAGE);
      if (up && team.contains(up) && !el.matches(SEL_PAGE)) continue;
      const h = parseFloat(el.style.height || el.style.minHeight || '0');
      if (!el.matches(SEL_PAGE) && !(h >= 20 && h <= 40)) continue;
      seen.add(el);
      out.push(el);
    }
    return out;
  }
  function idOf(row) {
    const tree = row.closest('[role="treeitem"]') || row;
    const els = [row, tree, ...row.querySelectorAll('a[href], [data-block-id]')];
    for (const el of els) {
      for (const a of el.attributes || []) {
        if (a.name === 'style' || a.name === 'class') continue;
        if (!/(href|block|id|page)/i.test(a.name)) continue;
        const m = UUID_RE.exec(a.value);
        if (m) { const h = m[0].replace(/-/g, '').toLowerCase(); return h.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'); }
      }
    }
    return '';
  }
  const nameEl = (row) => [...row.querySelectorAll('.notranslate')].find((e) => !e.closest('.notion-record-icon, [role="img"]') && !e.querySelector('.notion-record-icon, img, svg') && norm(e.textContent)) || null;
  const nameOf = (row) => norm((nameEl(row) || row).textContent).slice(0, 120);

  /* ============================================================
   *  印を付ける
   * ============================================================ */
  const curView = () => (new URLSearchParams(location.search).get('v') || '').replace(/-/g, '').toLowerCase();
  function curPage() { const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname) || /([0-9a-f]{32})/i.exec(location.pathname); return m ? m[1].toLowerCase() : ''; }
  function alignViews(info) {
    inFrame(() => {
      for (const x of info) {
        if (!x.view || !x.dbRow) continue;
        const t = nameEl(x.dbRow.r);
        if (!t || !x.slot.isConnected) continue;
        const tl = textLeft(t);
        const sl = x.slot.getBoundingClientRect().left + (parseFloat(getComputedStyle(x.slot).paddingLeft) || 0);
        const d = tl - sl + P.viewShift + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--c33-view-shift')) || 0);
        if (Math.abs(d) < 0.5) continue;
        const cur = parseFloat(getComputedStyle(x.r).paddingInlineStart) || 0;
        x.r.__c33dx = (x.r.__c33dx || 0) + d;
        setVar(x.r, '--c33-pad', Math.max(0, cur + d).toFixed(1) + 'px');
      }
    });
  }
  function textLeft(el) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      const i = n.nodeValue.search(/\S/);
      const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
      const r = rg.getBoundingClientRect();
      if (r.width || r.height) return r.left;
    }
    return el.getBoundingClientRect().left;
  }
  function scanTeam(team) {
    const btn = team.querySelector(SEL_TEAM_BTN);
    if (!btn) return;
    setAttr(team, 'data-c33-team', '1');
    const teamPad = parseFloat(getComputedStyle(btn).paddingInlineStart) || 8;
    const rows = rowsOf(team);
    { const n = rows.filter((r) => !bulletSlot(r)).length; setAttr(btn, 'data-c33-n', n ? String(n) : ''); if (!n) btn.removeAttribute('data-c33-n'); }   // v87: Stella の件数
    team.toggleAttribute('data-c33-empty', !rows.length);   // v87: 中身を畳んだチームは Stella で薄いカードに
    if (!rows.length) { if (nbOn()) nbTeam(team, btn, []); else if (P.tree) alignTree(team, btn, []); return; }
    const info = rows.map((r) => ({ r, pad: padOf(r), slot: bulletSlot(r) }));
    const pagePads = info.filter((x) => !x.slot).map((x) => x.pad);
    const minPad = pagePads.length ? Math.min(...pagePads) : Math.min(...info.map((x) => x.pad));
    for (let i = 0; i < info.length; i++) {
      const x = info[i];
      if (!x.slot) continue;
      for (let j = i - 1; j >= 0; j--) {
        if (info[j].slot) continue;
        info[j].db = true; x.dbRow = info[j]; break;
      }
    }
    const teamKey = team.getAttribute('data-c16-k') || norm(btn.textContent);
    const viewIx = new Map();
    for (const x of info) {
      const { r } = x;
      if (x.slot) {
        const db = x.dbRow;
        const base = db ? db.newPad : teamPad;
        const pad = P.tree ? x.pad : base + P.viewIndent + (P.alignViews ? (r.__c33dx || 0) : 0);
        setAttr(r, 'data-c33-kind', 'view');
        setVar(r, '--c33-pad', pad.toFixed(1) + 'px');
        setAttr(r, 'data-c33-pad', '1');
        setAttr(x.slot, 'data-c33-vslot', '1');
        let type = typeFromName(nameOf(r)), rec = null;
        if (db && db.id) {
          const types = VIEWTYPES.get(db.id);
          const k = viewIx.get(db) || 0; viewIx.set(db, k + 1);
          if (types && types[k]) { rec = types[k]; type = TYPE_ALIAS[rec.type] || type; }
          else if (!types) viewTypesOf(db.id);
        }
        setAttr(r, 'data-c33-vt', type);
        const ic = rec && rec.icon;
        const u = ic ? iconUrl(ic) : '';
        if (u) { setAttr(x.slot, 'data-c33-vic', 'img'); setVar(x.slot, '--c33-vimg', 'url("' + u.replace(/"/g, '%22') + '")'); x.slot.removeAttribute('data-c33-vemo'); }
        else if (ic) { setAttr(x.slot, 'data-c33-vic', 'emoji'); setAttr(x.slot, 'data-c33-vemo', ic); }
        else { x.slot.removeAttribute('data-c33-vic'); x.slot.removeAttribute('data-c33-vemo'); }
        const cur = rec && curView() === rec.id.replace(/-/g, '');
        if (cur) setAttr(r, 'data-c33-cur', '1'); else if (r.hasAttribute('data-c33-cur')) r.removeAttribute('data-c33-cur');
        x.view = true;
        ST.views++;
        continue;
      }
      const name = nameOf(r);
      const level = Math.max(0, x.pad - minPad);
      x.newPad = P.tree ? x.pad : P.flat ? teamPad + level * P.scale : x.pad;
      setVar(r, '--c33-pad', x.newPad.toFixed(1) + 'px');
      setAttr(r, 'data-c33-pad', '1');
      x.id = idOf(r);
      const dbKey = teamKey + '|' + name;
      if (x.db) { if (!KNOWN_DB[dbKey]) { KNOWN_DB[dbKey] = 1; saveDb(); } }
      const isDb = x.db || !!KNOWN_DB[dbKey];
      setAttr(r, 'data-c33-kind', isDb ? 'db' : 'page');
      setVar(r, '--c33-ri', String(Math.min(14, info.indexOf(x))));   // v87: Stella の行がふわっと出る順
      setAttr(r, 'data-c33-lvl', String(Math.round(level / 12)));
      if (x.id && curPage() === x.id.replace(/-/g, '')) setAttr(r, 'data-c33-cur', '1'); else if (r.hasAttribute('data-c33-cur')) r.removeAttribute('data-c33-cur');
      ST.rows++;
      if (isDb) ST.dbs++;
    }
    if (nbOn()) nbTeam(team, btn, info); else if (P.tree) alignTree(team, btn, info); else if (P.alignViews) alignViews(info);
  }
  const cssPx = (n) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)) || 0;
  function realIcon(el) {
    if (!el) return null;
    for (const nd of el.querySelectorAll('[data-c33-vslot], .notion-record-icon, [role="img"], img, svg')) {
      if (nd.closest('[class*="arrowChevron"]') || String(nd.getAttribute('class') || '').includes('arrowChevron')) continue;
      const r = nd.getBoundingClientRect();
      if (r.width >= 8 && r.width <= 34 && r.height >= 8) return nd;
    }
    return null;
  }
  function textEl(el) {
    return nameEl(el) || [...el.querySelectorAll('span, div')].find((e) => !e.closest('.notion-record-icon, [role="img"]') && !e.querySelector('svg, img, [data-c33-vslot], .notion-record-icon') && !e.matches('[data-c33-vslot]') && norm(e.textContent)) || null;
  }
  function moverOf(container, icon, text) {
    let m = icon;
    while (m.parentElement && m.parentElement !== container && !(text && m.parentElement.contains(text))) m = m.parentElement;
    return m;
  }
  const MV = new WeakMap();
  const MIN_NAME = 92;
  function place(container, target) {
    const icon = container.matches && container.matches('[data-c33-vslot]') ? container : realIcon(container);
    if (!icon) return null;
    const row = container.closest ? (container.closest(SEL_PAGE + ', ' + SEL_TEAM_BTN) || container) : container;
    const rr = row.getBoundingClientRect();
    if (rr.width > 60) target = Math.min(target, rr.right - MIN_NAME - icon.getBoundingClientRect().width - 10);
    const text = textEl(container);
    const m = icon === container ? container : moverOf(container, icon, text);
    const il = icon.getBoundingClientRect().left;
    const d = target - il;
    if (Math.abs(d) < 0.5) return 0;
    const cur = parseFloat(getComputedStyle(m).marginInlineStart) || 0;
    const nv = Math.max(-240, Math.min(320, cur + d));
    const prev = m.style.getPropertyValue('margin-inline-start'), prevP = m.style.getPropertyPriority('margin-inline-start');
    m.style.setProperty('margin-inline-start', nv.toFixed(1) + 'px', 'important');
    if (text && text !== icon && !icon.contains(text) && !text.contains(icon)) {
      const ir = icon.getBoundingClientRect();
      if (textLeft(text) < ir.right - 1) {
        if (prev) m.style.setProperty('margin-inline-start', prev, prevP); else m.style.removeProperty('margin-inline-start');
        ST.reverted = (ST.reverted || 0) + 1;
        return null;
      }
    }
    m.setAttribute('data-c33-mv', '1');
    MV.set(m, nv);
    return d;
  }
  const LS_STAR = 'c33.stardx.v1';
  let STAR_DX = null;
  try { const v = parseFloat(localStorage.getItem(LS_STAR)); if (isFinite(v)) STAR_DX = v; } catch (e) { /* noop */ }
  function alignTree(team, btn, info) {
    inFrame(() => {
      if (!btn.isConnected) return;
      const de = document.documentElement;
      const g = team.getAttribute('data-c16-g');
      const orbitOn = de.hasAttribute('data-c33-orbit');
      const headHidden = orbitOn && de.hasAttribute('data-c33-osel');
      const tr = team.getBoundingClientRect();
      const sec = g ? document.querySelector('#c16-root .c16-sec[data-c16-g="' + CSS.escape(g) + '"]') : null;
      const lbl = sec && !headHidden ? sec.querySelector(orbitOn ? '.c16-ico' : '.c16-lbl') : null;
      const lr = lbl ? lbl.getBoundingClientRect() : null;
      if (lr && lr.width && tr.width) {
        const x = orbitOn ? lr.left : textLeft(lbl);
        if (orbitOn) {
          const dx = Math.round((x - tr.left) * 10) / 10;
          if (dx >= 0 && dx < 80 && dx !== STAR_DX) { STAR_DX = dx; try { localStorage.setItem(LS_STAR, String(dx)); } catch (e) { /* noop */ } }
        }
        place(btn, x + cssPx('--c33-team-shift'));
      } else if (headHidden && tr.width) {
        place(btn, tr.left + (STAR_DX != null ? STAR_DX : 8) + cssPx('--c33-team-shift'));
      }
      const teamText = textEl(btn) || btn;
      const tTeam = textLeft(teamText);
      const stack = [];
      for (const x of info) {
        if (!x.r.isConnected || !x.r.getBoundingClientRect().height) continue;
        if (x.slot) {
          const t = x.dbRow && textEl(x.dbRow.r);
          if (!t) continue;
          place(x.slot, textLeft(t) + P.viewShift + cssPx('--c33-view-shift'));
          continue;
        }
        while (stack.length && stack[stack.length - 1].pad >= x.pad) stack.pop();
        const parent = stack[stack.length - 1];
        const pt = parent ? textEl(parent.r) : null;
        place(x.r, (pt ? textLeft(pt) : tTeam) + cssPx('--c33-db-shift') + cssPx('--c33-icon-dx'));
        stack.push(x);
      }
      ST.aligned = (ST.aligned || 0) + 1;
      obFixSoon();
    });
  }
  const dirtyTeams = new Set();
  let dirtyAll = true;
  function scan() {
    if (!P.on) { readyCheck(); return; }
    document.documentElement.setAttribute('data-c33', P.flat ? 'flat' : 'nest');
    document.documentElement.toggleAttribute('data-c33-nobg', P.noBg !== false);
    document.documentElement.toggleAttribute('data-c33-tree', P.tree !== false);
    installCss();
    const scope = document.querySelector('nav.notion-sidebar-container, .notion-sidebar-container, .notion-sidebar');
    if (!scope) return;
    const full = dirtyAll || !ST.scans;
    dirtyAll = false;
    const teams = full ? [...scope.querySelectorAll(SEL_TEAM)] : [...dirtyTeams].filter((t) => t.isConnected && scope.contains(t));
    dirtyTeams.clear();
    if (full) { ST.scans++; ST.rows = 0; ST.views = 0; ST.dbs = 0; ST.fullAt = Date.now(); } else ST.part = (ST.part || 0) + 1;
    inScan = true;
    try {
      for (const t of teams) {
        if (t.closest('[role="dialog"]')) continue;
        try { scanTeam(t); } catch (e) { ST.lastError = String(e && e.stack || e); }
      }
      if (full) for (const sec of scope.querySelectorAll('#c16-root .c16-sec')) {
        const ico = sec.querySelector('.c16-ico');
        if (!ico) continue;
        const c = getComputedStyle(ico).backgroundColor;
        const g = sec.getAttribute('data-c16-g');
        if (c && g) for (const t of scope.querySelectorAll(SEL_TEAM + '[data-c16-g="' + g + '"]')) setVar(t, '--c33-tint', c);
      }
      /* 位置合わせ（読む→書く）はまとめてここで。次のコマに回すと 1 コマだけ「ずれた姿」が見える */
      while (frameJobs.length) { try { frameJobs.shift()(); } catch (e) { ST.lastError = String(e && e.stack || e); } }
      try { nbSync(); } catch (e) { ST.lastError = 'stella: ' + String(e && e.stack || e); }
    } finally { inScan = false; }
    readyCheck();
  }
  /* v77: 変化を見たら、次の描画の前（requestAnimationFrame）に印を付ける。以前は 80ms 待っていたので、Notion の素の姿が数コマ見えていた */
  let schedT = 0, schedR = 0;
  function schedule(ms) {
    if (ms != null) dirtyAll = true;
    if (ms) { if (!schedT) schedT = setTimeout(() => { schedT = 0; schedule(0); }, ms); return; }
    if (schedR) return;
    schedR = requestAnimationFrame(() => { schedR = 0; scan(); });
  }
  /* v77: 準備完了の印 — サイドバーに印が付き、輪が置け、検索窓の位置が決まったら html[data-c33-ready]（16c の幕の合図） */
  let readyDone = false, layDone = false;
  function readyCheck() {
    if (readyDone) return;
    try {
      const side = document.querySelector('nav.notion-sidebar-container, .notion-sidebar-container, .notion-sidebar');
      if (!side) return;
      if (P.on) {
        if (!ST.scans) return;
        const teams = side.querySelectorAll(SEL_TEAM);
        if (teams.length && ![...teams].some((t) => t.hasAttribute('data-c33-team'))) return;
      }
      if (OB.on && obSidebarShown !== false && (!obEl || !obEl.isConnected || !layDone)) return;
      readyDone = true;
      document.documentElement.setAttribute('data-c33-ready', '1');
    } catch (e) { /* noop */ }
  }

  /* ============================================================
   *  CSS（UI維持・バッジ被り修正）
   * ============================================================ */
  const B = ':not(#c33a):not(#c33b):not(#c33c)';
  const NT = '.notranslate:not(.notion-record-icon)';
  function installCss() {
    if (document.getElementById('c33-css')) return;
    const st = document.createElement('style');
    st.id = 'c33-css';
    const icons = Object.entries(VICON).map(([k, v]) => 'html[data-c33] [data-c33-kind="view"][data-c33-vt="' + k + '"] [data-c33-vslot]' + B + '::after{-webkit-mask-image:' + v + ' !important;mask-image:' + v + ' !important;}').join('\n');
    st.textContent = `
:root {
  --c33-serif: var(--c16-head-font, "Baskerville", "Hiragino Mincho ProN", "Yu Mincho", serif);
  --c33-item-font: var(--c33-serif);
  --c33-item-size: 13px;
  --c33-item-weight: 500;
  --c33-item-track: .02em;
  --c33-item-h: 28px;
  --c33-item-color: var(--c-texPri, #37352f);
  --c33-icon-size: 18px;
  --c33-icon-gap: 8px;
  --c33-icon-dx: 0px;
  --c33-icon-dy: 0px;
  --c33-text-dy: 0px;
  --c33-view-font: var(--c33-item-font);
  --c33-view-size: 12.5px;
  --c33-view-weight: 400;
  --c33-view-track: .02em;
  --c33-view-h: 26px;
  --c33-view-color: var(--c-texSec, #787774);
  --c33-vicon-size: 15px;
  --c33-vicon-gap: 7px;
  --c33-vicon-dy: 0px;
  --c33-vtext-dy: 0px;
  --c33-team-font: var(--c33-serif);
  --c33-team-size: 10.5px;
  --c33-team-weight: 600;
  --c33-team-track: .14em;
  --c33-team-color: var(--c-texSec, #787774);
  --c33-team-gap: 8px;
  --c33-team-after: 0px;
  --c33-cur-weight: 700;
  --c33-cur-color: var(--c-texPri, #37352f);
  --c33-radius: 6px;
}
html[data-c33] #c16-root .c16-cnt${B} { min-width: 18px; height: 16px; padding: 0 5px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: color-mix(in srgb, var(--c-texPri, #37352f) 6%, transparent); font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
html[data-c33] ${SEL_TEAM}[data-c33-team]${B} { margin-top: var(--c33-team-gap) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B} { margin-bottom: var(--c33-team-after) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B},
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN} :is(div, span):not(:has(svg, img))${B} { font-family: var(--c33-team-font) !important; font-size: var(--c33-team-size) !important; font-weight: var(--c33-team-weight) !important; letter-spacing: var(--c33-team-track) !important; text-transform: var(--c33-team-case, uppercase) !important; color: var(--c33-team-color) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team][data-c33-tpad] ${SEL_TEAM_BTN}${B} { padding-inline-start: var(--c33-tpad) !important; }
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B}:is(:hover, :focus, :focus-visible, [aria-selected="true"], [aria-current]),
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN} > div${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] .notion-outliner-team-header${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] .notion-outliner-team-header-container${B} { background: transparent !important; background-color: transparent !important; box-shadow: none !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][data-c33-pad]${B} { padding-inline-start: var(--c33-pad) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"])${B} { height: var(--c33-item-h) !important; min-height: var(--c33-item-h) !important; border-radius: var(--c33-radius) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) :is(${NT}, ${NT} *):not(.notion-record-icon *)${B} { font-family: var(--c33-item-font) !important; font-size: var(--c33-item-size) !important; font-weight: var(--c33-item-weight) !important; letter-spacing: var(--c33-item-track) !important; color: var(--c33-item-color) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) ${NT}${B} { transform: translateY(var(--c33-text-dy)); }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) > :first-child${B} { min-width: var(--c33-icon-size) !important; margin-inline-end: var(--c33-icon-gap) !important; transform: translate(var(--c33-icon-dx), var(--c33-icon-dy)); }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) > :first-child .notion-record-icon${B} { width: var(--c33-icon-size) !important; height: var(--c33-icon-size) !important; font-size: calc(var(--c33-icon-size) * .86) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) > :first-child .notion-record-icon :is(img, svg, div[style*="mask"], span)${B} { width: var(--c33-icon-size) !important; height: var(--c33-icon-size) !important; max-width: none !important; max-height: none !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"]${B} { min-height: var(--c33-view-h) !important; height: var(--c33-view-h) !important; border-radius: var(--c33-radius) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"] :is(div, span):not([data-c33-vslot]):not(:has(svg, img))${B} { font-family: var(--c33-view-font) !important; font-size: var(--c33-view-size) !important; font-weight: var(--c33-view-weight) !important; letter-spacing: var(--c33-view-track) !important; color: var(--c33-view-color) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"] > :not([data-c33-vslot])${B} { transform: translateY(var(--c33-vtext-dy)); }
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]:hover${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] :is([role="treeitem"], a, [role="button"]):has(> [data-c33-kind])${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] :is([role="treeitem"], a, [role="button"]):has(> [data-c33-kind]):hover${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind] > :not(:first-child)${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] div:has(> [data-c33-kind]):not(:has(> [data-c33-kind] ~ [data-c33-kind]))${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] div:has(> [data-c33-kind]):not(:has(> [data-c33-kind] ~ [data-c33-kind])):hover${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B}::before,
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B}::after { background: transparent !important; background-color: transparent !important; box-shadow: none !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][data-c33-cur] :is(${NT}, ${NT} *, div:not(:has(*)), span:not(:has(*))):not(.notion-record-icon *)${B} { font-weight: var(--c33-cur-weight) !important; color: var(--c33-cur-color) !important; }
html[data-c33] [data-c33-vslot]${B} { position: relative; width: var(--c33-vicon-size) !important; min-width: var(--c33-vicon-size) !important; margin-inline-end: var(--c33-vicon-gap) !important; padding: 0 !important; }
html[data-c33] [data-c33-vslot]${B} > * { opacity: 0 !important; }
html[data-c33] [data-c33-vslot]${B}::after { content: ""; position: absolute; left: 0; top: 50%; width: var(--c33-vicon-size); height: var(--c33-vicon-size); transform: translateY(calc(-50% + var(--c33-vicon-dy))); background: currentColor; opacity: .78; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
html[data-c33] [data-c33-kind="view"][data-c33-vt] [data-c33-vslot][data-c33-vic="img"]${B}::after { background: var(--c33-vimg) center / contain no-repeat !important; -webkit-mask-image: none !important; mask-image: none !important; opacity: 1; }
html[data-c33] [data-c33-kind="view"][data-c33-vt] [data-c33-vslot][data-c33-vic="emoji"]${B}::after { content: attr(data-c33-vemo) !important; background: none !important; -webkit-mask-image: none !important; mask-image: none !important; opacity: 1; display: flex; align-items: center; justify-content: center; font-size: calc(var(--c33-vicon-size) * .9); line-height: 1; font-family: "Apple Color Emoji", "Segoe UI Emoji", sans-serif; }

/* B.U.R.I フローティング・アニメーション用CSS */
#c33-search-header.floating { left: 50% !important; transform: translateX(-50%) !important; width: 600px !important; max-width: 90vw !important; top: 15vh !important; box-shadow: var(--c-shaOutMd, 0 12px 36px rgba(0,0,0,.18)) !important; }
#c33-buri.floating { left: 50% !important; transform: translateX(-50%) !important; width: 600px !important; max-width: 90vw !important; top: calc(15vh + 46px) !important; max-height: 60vh !important; }
@keyframes buriPop { 0% { opacity: 0; transform: translateY(8px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
#c33-buri .cb-msg { animation: buriPop 0.25s ease-out forwards; }
.typewriter-cursor::after { content: "▌"; display: inline-block; vertical-align: bottom; animation: blink 1s step-start infinite; margin-left: 2px; color: var(--lm-accent, #2783de); }
@keyframes blink { 50% { opacity: 0; } }
.thinking-dots { display: inline-flex; gap: 4px; align-items: center; height: 16px; }
.thinking-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--c-texSec, #999); animation: bounce 1.4s infinite ease-in-out both; }
.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
${icons}
`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ============================================================
   *  起動
   * ============================================================ */
  const mo = new MutationObserver((recs) => {
    let hit = false;
    for (const r of recs) {
      const t = r.target;
      if (t.nodeType !== 1 || !t.closest || !t.closest('.notion-sidebar-container, .notion-sidebar, nav')) continue;
      const team = t.closest(SEL_TEAM);
      if (team) dirtyTeams.add(team); else dirtyAll = true;
      hit = true;
    }
    if (hit) schedule();
  });
  mo.observe(document.body, { childList: true, subtree: true });
  /* v77: ¹⁶ の字下げが落ち着いた瞬間に置き直す（幕が開く前に。後で 2px 動くのを見せない） */
  new MutationObserver(() => schedule(0)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-c16-settled'] });
  window.addEventListener('resize', () => schedule(120));
  document.addEventListener('atelier-change', () => schedule(60));
  schedule(0);
  setTimeout(() => { if (!ST.fullAt || Date.now() - ST.fullAt > 1000) schedule(0); }, 1500);   // 保険（直前に全部見直していれば省く）

  /* ============================================================
   *  Orbit
   * ============================================================ */
  const OB_KEY = 'c33.orbit.v2';
  const OB = Object.assign({ on: true, sel: '', itemH: 54, pin: false, hideEmpty: false, spin: false, fix: 0, topDy: 0, full: true, tabs: true, ws: true, v: 0, wheelRev: true }, (() => { try { const v2 = localStorage.getItem(OB_KEY); if (v2) return JSON.parse(v2); const v1 = JSON.parse(localStorage.getItem('c33.orbit.v1') || '{}'); v1.on = true; return v1; } catch (e) { return {}; } })());
  delete OB.railW;
  delete OB.all;
  const obSave = () => { try { localStorage.setItem(OB_KEY, JSON.stringify(OB)); } catch (e) { /* noop */ } };
  if (OB.v !== 28) { OB.fix = 0; OB.topDy = 0; OB.v = 28; if (OB.full == null) OB.full = true; if (OB.tabs == null) OB.tabs = true; if (OB.ws == null) OB.ws = true; obSave(); }
  const RAIL_W = 58, RAIL_X = 184;
  let obEl = null, obHost = null, obOff = 0, obTarget = 0, obRaf = 0, obSnapT = 0, obSig = '', obExpT = 0;
  const ALL = '*';

  const ICON_ALL = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="black"><rect x="3" y="3" width="6" height="6" rx="1.8"/><rect x="11" y="3" width="6" height="6" rx="1.8"/><rect x="3" y="11" width="6" height="6" rx="1.8"/><rect x="11" y="11" width="6" height="6" rx="1.8"/></svg>') + '")';
  const ICON_ORBIT = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><ellipse cx="10" cy="10" rx="7.6" ry="3.4" transform="rotate(-28 10 10)"/><circle cx="10" cy="10" r="2.3" fill="currentColor" stroke="none"/><circle cx="15.9" cy="6.1" r="1.25" fill="currentColor" stroke="none"/></svg>';
  const ICON_GEAR = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="2.5"/><circle cx="10" cy="10" r="5.4"/><path d="M10 2.4v2.2M10 15.4v2.2M2.4 10h2.2M15.4 10h2.2M4.6 4.6l1.6 1.6M13.8 13.8l1.6 1.6M4.6 15.4l1.6-1.6M13.8 6.2l1.6-1.6"/></svg>';
  const ICON_PLUS = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10 4.5v11M4.5 10h11"/></svg>';
  const ICON_SLIDERS = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3.5 6h13M3.5 14h13"/><circle cx="7.5" cy="6" r="2" fill="var(--c-bacEle, #fff)"/><circle cx="12.5" cy="14" r="2" fill="var(--c-bacEle, #fff)"/></svg>';
  const ICON_UPDOWN = '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 8l3.5-3.5L13.5 8M6.5 12l3.5 3.5 3.5-3.5"/></svg>';

  const NSET = [
    { tab: 'user_settings', label: 'Preferences', ja: '表示・言語など' },
    { tab: 'notifications', label: 'Notifications', ja: '通知' },
    { tab: 'settings', label: 'General', ja: 'ワークスペース全般' },
    { tab: 'members', label: 'People', ja: 'メンバー' },
    { tab: 'teams', label: 'Teamspaces', ja: 'チームスペース' },
    { tab: 'public_pages', label: 'Public pages', ja: '公開ページ' }
  ];

  function obGroups() {
    const gs = [...document.querySelectorAll('#c16-root .c16-sec[data-c16-g]')].map((sec) => {
      const ico = sec.querySelector('.c16-ico');
      const cs = ico ? getComputedStyle(ico) : null;
      return {
        gid: sec.getAttribute('data-c16-g'),
        label: norm((sec.querySelector('.c16-lbl') || {}).textContent),
        cnt: norm((sec.querySelector('.c16-cnt') || {}).textContent),
        txt: ico && ico.getAttribute('data-c16-txt'),
        mask: cs ? ((m) => (m && m !== 'none') ? m : ((cs.getPropertyValue('--c16-ico') || cs.getPropertyValue('--c16-ico-fallback') || '').trim() || 'none'))(cs.webkitMaskImage || cs.maskImage) : 'none',
        bgi: cs ? cs.backgroundImage : 'none',
        tint: cs ? cs.backgroundColor : ''
      };
    }).filter((g) => g.gid && g.label);
    return OB.hideEmpty ? gs.filter((g) => g.cnt !== '0' || g.gid === OB.sel) : gs;
  }

  const obSide = () => document.querySelector('nav.notion-sidebar-container, .notion-sidebar-container, .notion-sidebar');
  const TAB_NAME = /^(home|chat|meetings?|inbox|search|ホーム|チャット|ミーティング|受信トレイ|受信箱|検索)/i;
  function obTabRow() {
    const side = obSide(); if (!side) return null;
    const tl = side.querySelector('[role="tablist"]');
    if (!tl) return null;
    const p = tl.parentElement;
    if (!p || p === side || p.querySelector('[id^="sidebar-tabpanel-"], .notion-scroller, ' + SEL_TEAM)) return tl;
    return p;
  }
  function obTabs() {
    const row = obTabRow(); if (!row) return [];
    const out = [];
    for (const el of row.querySelectorAll('[role="tab"], [role="button"], button')) {
      if (el.id === 'c33-orbit-btn' || el.closest('#c33-orbit-btn')) continue;
      if (out.some((x) => x.el.contains(el))) continue;
      const name = norm(el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent);
      if (!name) continue;
      const svg = el.querySelector('svg, img');
      out.push({ el, name: name.slice(0, 40), icon: svg ? svg.outerHTML : '', tab: el.getAttribute('role') === 'tab' || TAB_NAME.test(name), on: el.getAttribute('aria-selected') === 'true' });
    }
    return out;
  }
  function obPlusBtn() {
    const row = obTabRow(); if (!row) return null;
    return [...row.querySelectorAll('[role="button"], button')].find((el) => /チームスペース|teamspace|c16-(add|plus|new)/i.test((el.id || '') + ' ' + (el.className && el.className.baseVal == null ? el.className : '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.getAttribute('aria-label') || ''))) || null;
  }
  function obHomeTab() {
    const side = obSide(); if (!side) return null;
    return side.querySelector('[role="tab"][aria-controls^="sidebar-tabpanel-home"]') || (obTabs().find((t) => t.tab && /^(home|ホーム)/i.test(t.name)) || {}).el || null;
  }
  function obAtHome() {
    const t = obHomeTab();
    if (t && t.hasAttribute('aria-selected')) return t.getAttribute('aria-selected') === 'true';
    const side = obSide();
    const hp = side && side.querySelector('[id^="sidebar-tabpanel-home"]');
    return !hp || !!hp.getBoundingClientRect().height;
  }

  const obSwitcher = () => { const s = obSide(); return s ? s.querySelector('.notion-sidebar-switcher') : null; };
  function obWsRow() {
    const side = obSide(); if (!side) return null;
    const marked = side.querySelector('[data-c33-wsrow]');
    if (marked && marked.isConnected) return marked;
    const sw = obSwitcher(); if (!sw) return null;
    let row = sw;
    while (row.parentElement && row.parentElement !== side) {
      const p = row.parentElement;
      if (p.querySelector('[role="tablist"], [id^="sidebar-tabpanel-"], .notion-scroller, ' + SEL_TEAM)) break;
      if (p.getBoundingClientRect().height > 60) break;
      row = p;
    }
    if (row.querySelector('[role="tablist"], .notion-scroller')) return null;
    row.setAttribute('data-c33-wsrow', '1');
    return row;
  }
  function obWsInfo() {
    const sw = obSwitcher();
    if (!sw) return { name: 'Workspace', icon: '' };
    const nm = [...sw.querySelectorAll('.notranslate, div, span')].find((e) => !e.closest('.notion-record-icon') && !e.querySelector('svg, img, .notion-record-icon') && norm(e.textContent));
    const ic = sw.querySelector('.notion-record-icon, img');
    return { name: norm((nm || sw).textContent).slice(0, 60) || 'Workspace', icon: ic ? ic.outerHTML : '' };
  }
  const WS_HINT = [
    [/close|collapse|閉じる|たたむ/i, 'サイドバーを閉じる', '⌘\\'],
    [/new page|create|新規|新しいページ|作成/i, '新しいページ', '⌘N']
  ];
  function obWsBtns() {
    const row = obWsRow(); if (!row) return [];
    const sw = obSwitcher();
    const out = [];
    for (const el of row.querySelectorAll('[role="button"], button')) {
      if (sw && (sw === el || sw.contains(el) || el.contains(sw))) continue;
      if (out.some((x) => x.el.contains(el))) continue;
      const raw = norm(el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent);
      const h = WS_HINT.find(([re]) => re.test(raw));
      const svg = el.querySelector('svg');
      out.push({ el, name: h ? h[1] : (raw || 'ボタン'), key: h ? h[2] : '', icon: svg ? svg.outerHTML : '' });
    }
    return out;
  }
  function obMarkRows() {
    const tr = obTabRow();
    if (tr && !tr.hasAttribute('data-c33-tabrow')) tr.setAttribute('data-c33-tabrow', '1');
    obWsRow();
  }

  function obPress(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    /* v53: view は付けない（Firefox の ScriptCat では window が本物の Window ではなく、MouseEvent が例外を出していた） */
    const o = { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 1, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    const pe = { pointerId: 1, pointerType: 'mouse', isPrimary: true };
    const fire = (C, type, init) => { try { el.dispatchEvent(new C(type, init)); return true; } catch (e) { return false; } };
    fire(PointerEvent, 'pointerdown', Object.assign({}, pe, o));
    fire(MouseEvent, 'mousedown', o);
    fire(PointerEvent, 'pointerup', Object.assign({}, pe, o, { buttons: 0 }));
    fire(MouseEvent, 'mouseup', Object.assign({}, o, { buttons: 0 }));
    if (!fire(MouseEvent, 'click', Object.assign({}, o, { buttons: 0 }))) { try { el.click(); } catch (e) { return false; } }
    return true;
  }
  function obWait(fn, ms, step) {
    return new Promise((res) => {
      const t0 = Date.now();
      const tick = () => {
        let v = null;
        try { v = fn(); } catch (e) { v = null; }
        if (v) return res(v);
        if (Date.now() - t0 > (ms || 1500)) return res(null);
        setTimeout(tick, step || 50);
      };
      tick();
    });
  }
  async function obGoHome() {
    if (obAtHome()) return false;
    const t = obHomeTab();
    if (!t) return false;
    obPress(t);
    await obWait(obAtHome, 1200);
    return true;
  }
  const obDialog = () => { const t = document.querySelector('[role="dialog"] [id^="settings-tab-"][role="tab"]'); return t ? t.closest('[role="dialog"]') : null; };
  const obTarget0 = () => (document.activeElement && document.activeElement !== document.body ? document.activeElement : document.body);
  function obKey() {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const o = { key: ',', code: 'Comma', keyCode: 188, which: 188, metaKey: mac, ctrlKey: !mac, bubbles: true, cancelable: true, composed: true };
    const t = obTarget0();
    t.dispatchEvent(new KeyboardEvent('keydown', o));
    t.dispatchEvent(new KeyboardEvent('keyup', o));
  }
  function obEsc() {
    const o = { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true, composed: true };
    obTarget0().dispatchEvent(new KeyboardEvent('keydown', o));
  }
  const SET_ITEM = /^(settings|設定)(\s|$)|settings\s*&\s*members|設定とメンバー/i;
  function obMenuItem(re) {
    for (const el of document.querySelectorAll('[role="menuitem"], [role="option"], [role="dialog"] [role="button"], .notion-overlay-container [role="button"]')) {
      if (el.closest('#c33-ob-set, #c33-orbit')) continue;
      const tx = norm(el.getAttribute('aria-label') || el.textContent);
      if (re.test(tx) && el.getBoundingClientRect().width) return el;
    }
    return null;
  }

  let obSetBusy = false;
  async function obNotionSettings(tab) {
    if (obSetBusy) return false;
    obSetBusy = true;
    try {
      let d = obDialog();
      if (!d) {
        const sw = obSwitcher();
        if (sw) {
          obPress(sw);
          const it = await obWait(() => obMenuItem(SET_ITEM), 1200);
          if (it) { obPress(it); d = await obWait(obDialog, 1800); }
          else obEsc();
        }
      }
      if (!d) { obKey(); d = await obWait(obDialog, 1500); }
      if (!d) { obToast('Notion の設定を開けませんでした。⌘,（Windows は Ctrl+,）を押してみてください。'); return false; }
      if (tab) {
        const t = await obWait(() => document.getElementById('settings-tab-' + tab), 1200);
        if (t) obPress(t);
        else obToast('この画面は見つかりませんでした（権限やプランによっては出ません）。');
      }
      return true;
    } finally {
      obSetBusy = false;
    }
  }
  function obWsMenu() {
    if (!obPress(obSwitcher())) obToast('ワークスペースのメニューが見つかりませんでした。');
  }

  function obFindHost() {
    const side = obSide(); if (!side) return null;
    const home = side.querySelector('[id^="sidebar-tabpanel-home"]');
    if (OB.full !== false) {
      const sw = obSwitcher();
      const start = home || side.querySelector('.notion-scroller');
      if (sw && start) {
        let h = start.parentElement;
        while (h && h !== side && !h.contains(sw)) h = h.parentElement;
        if (h) return h;
      }
    }
    if (home) return home;
    const sc = side.querySelector('.notion-scroller');
    return sc ? sc.parentElement : null;
  }
  function obMarkShift(host) {
    if (!host) return;
    for (const ch of host.children) {
      if (ch.id === 'c33-orbit') continue;
      const p = getComputedStyle(ch).position;
      const flow = p !== 'absolute' && p !== 'fixed';
      if (flow && !ch.hasAttribute('data-c33-sh')) ch.setAttribute('data-c33-sh', '1');
      else if (!flow && ch.hasAttribute('data-c33-sh')) ch.removeAttribute('data-c33-sh');
    }
  }
  function obScroller() {
    const side = obSide(); if (!side) return null;
    const home = side.querySelector('[id^="sidebar-tabpanel-home"]');
    const sc = (home && home.querySelector('.notion-scroller')) || side.querySelector('.notion-scroller');
    if (!sc) return null;
    if (!sc.hasAttribute('data-c33-topfix')) {
      side.querySelectorAll('[data-c33-topfix]').forEach((el) => { if (el !== sc) el.removeAttribute('data-c33-topfix'); });
      sc.setAttribute('data-c33-topfix', '1');
    }
    return sc;
  }

  /* ============================================================
   *  Orbit用 CSS生成
   * ============================================================ */
  function obCss() {
    let st = document.getElementById('c33-orbit-css');
    if (!st) { st = document.createElement('style'); st.id = 'c33-orbit-css'; (document.head || document.documentElement).appendChild(st); }
    const sel = OB.sel && OB.sel !== ALL ? CSS.escape(OB.sel) : '';
    const de = document.documentElement;
    de.toggleAttribute('data-c33-orbit', !!OB.on);
    de.toggleAttribute('data-c33-otabs', !!(OB.on && OB.tabs !== false));
    de.toggleAttribute('data-c33-ows', !!(OB.on && OB.ws !== false));
    de.toggleAttribute('data-c33-stella', !!(OB.on && OB.stella !== false));   // v87: Stella（右の星図）
    if (OB.on && OB.fix && !de.style.getPropertyValue('--c33-rail-fix')) de.style.setProperty('--c33-rail-fix', OB.fix + 'px');
    if (OB.on && OB.topDy && !de.style.getPropertyValue('--c33-top-dy')) de.style.setProperty('--c33-top-dy', OB.topDy + 'px');
    const hw = obHost ? obHost.getBoundingClientRect().width : 0;
    de.toggleAttribute('data-c33-orbit-pin', !!(OB.on && OB.pin && hw >= RAIL_X + 200));
    if (sel && OB.on) de.setAttribute('data-c33-osel', OB.sel); else de.removeAttribute('data-c33-osel');
    const itH = OB.itemH - 6;
    st.textContent = `
:root { --c33-rail-w: ${RAIL_W}px; --c33-rail-x: ${RAIL_X}px; --c33-ui: var(--cordi-ui, "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", sans-serif); }
html[data-c33-orbit] [data-c33-host] { position: relative !important; }
/* v56: 輪の幅だけサイドバーの中身を右へ（v38 でこの決まりが抜け、中身が輪の下に潜っていた） */
html[data-c33-orbit] [data-c33-space]${B} { margin-inline-start: var(--c33-space-margin, var(--c33-rail-w)) !important; min-width: 0 !important; }
html[data-c33-orbit] [data-c33-host] > [data-c33-sh]:not(#c33-orbit) { margin-inline-start: calc(var(--c33-rail-w) + var(--c33-rail-fix, 0px)) !important; min-width: 0 !important; }
html[data-c33-orbit][data-c33-orbit-pin] [data-c33-host] > [data-c33-sh]:not(#c33-orbit) { margin-inline-start: calc(var(--c33-rail-x) + var(--c33-rail-fix, 0px)) !important; }
html[data-c33-otabs] [data-c33-tabrow]${B},
html[data-c33-ows] [data-c33-wsrow]${B} { height: 0 !important; min-height: 0 !important; max-height: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; margin-top: 0 !important; margin-bottom: 0 !important; border: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }
html[data-c33-orbit] [data-c33-topfix]${B} { margin-top: var(--c33-top-dy, 0px) !important; }
html[data-c33-orbit][data-c33-osel] .notion-sidebar-container #c16-root .c16-sec > .c16-head { display: none !important; }
html[data-c33-orbit][data-c33-osel] .notion-sidebar-container #c16-root .c16-sec${B} { margin-top: 0 !important; margin-bottom: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; min-height: 0 !important; border-top: 0 !important; border-bottom: 0 !important; }
${sel ? `html[data-c33-orbit] .notion-sidebar-container #c16-root .c16-sec:not([data-c16-g="${sel}"]) { display: none !important; }
html[data-c33-orbit] .notion-sidebar-container ${SEL_TEAM}[data-c16-g]:not([data-c16-g="${sel}"]) { display: none !important; }
/* v48: ¹⁶ で畳んだままの大分類でも、輪で選んだら中身を出す（右が真っ白にならない） */
html[data-c33-orbit] .notion-sidebar-container [data-c16-list="1"] > [data-c16-hide="1"]:has(${SEL_TEAM}[data-c16-g="${sel}"]) { display: flex !important; }
html[data-c33-orbit] .notion-sidebar-container [data-c16-arm]:not(:has(${SEL_TEAM}[data-c16-g="${sel}"])):has(${SEL_TEAM}) { display: none !important; }` : ''}
#c33-orbit { position: absolute; z-index: 6; left: 0; top: 0; bottom: 0; width: var(--c33-rail-w); display: flex; flex-direction: column; align-items: stretch;
  font-family: var(--c33-ui); font-size: 11px; line-height: 1.3; font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; color: var(--c-texSec, #777); user-select: none;
  background: var(--c33-ob-bg, var(--c-bacSec, #f7f6f3)); box-shadow: inset -1px 0 0 var(--ca-borSecTra, rgba(0,0,0,.07));
  transition: width .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease, background-color .22s ease; overflow: hidden; contain: layout paint; }
#c33-orbit.exp, html[data-c33-orbit-pin] #c33-orbit { width: var(--c33-rail-x); }
#c33-orbit.exp:not(.pin) { background: var(--c33-ob-bg, var(--c-bacSec, #f7f6f3));
  box-shadow: inset -1px 0 0 var(--ca-borSecTra, rgba(0,0,0,.06)), 10px 0 28px -12px rgba(15,15,15,.22); }
#c33-orbit .ob-all { position: relative; flex: none; margin: 6px 5px 5px; height: ${itH}px; border-radius: 11px; display: grid; grid-template-columns: 1fr; grid-template-rows: 24px auto; justify-items: center; align-content: center; row-gap: 3px;
  cursor: pointer; color: var(--c-texSec, #777); transition: background-color .15s ease, color .15s ease; }
#c33-orbit .ob-all::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: -3px; height: 1px; background: var(--ca-borSecTra, rgba(0,0,0,.07)); pointer-events: none; }
#c33-orbit.exp .ob-all, html[data-c33-orbit-pin] #c33-orbit .ob-all { grid-template-columns: 26px 1fr; grid-template-rows: 1fr; justify-items: start; align-items: center; column-gap: 9px; padding: 0 10px 0 9px; }
#c33-orbit .ob-all:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-orbit .ob-all.sel { background: color-mix(in srgb, var(--lm-accent, #2783de) 11%, transparent); color: var(--c-texPri, #222); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lm-accent, #2783de) 22%, transparent); }
#c33-orbit .ob-all .ob-ic { background: currentColor; -webkit-mask-image: ${ICON_ALL}; mask-image: ${ICON_ALL}; -webkit-mask-size: 20px 20px; mask-size: 20px 20px; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; }
#c33-orbit .ob-all .ob-lb { font-size: 9.5px; font-weight: 700; letter-spacing: .1em; }
#c33-orbit.exp .ob-all .ob-lb, html[data-c33-orbit-pin] #c33-orbit .ob-all .ob-lb { font-size: 12px; letter-spacing: .12em; }
#c33-orbit .ob-wheel { position: relative; flex: 1; overflow: hidden; perspective: 640px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 6px, #000 calc(100% - 46px), transparent 100%); mask-image: linear-gradient(to bottom, transparent 0, #000 6px, #000 calc(100% - 46px), transparent 100%); }
#c33-orbit .ob-it { position: absolute; left: 5px; right: 5px; top: 0; height: ${itH}px; border-radius: 11px; display: grid; grid-template-columns: 1fr; grid-template-rows: 24px auto; justify-items: center; align-content: center; row-gap: 3px;
  cursor: pointer; transform-origin: 50% 0; will-change: transform, opacity; transition: background-color .15s ease, color .15s ease; }
#c33-orbit.exp .ob-it, html[data-c33-orbit-pin] #c33-orbit .ob-it { grid-template-columns: 26px 1fr auto; grid-template-rows: 1fr; justify-items: start; align-items: center; column-gap: 9px; padding: 0 10px 0 9px; }
#c33-orbit .ob-it:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-orbit .ob-it.top { color: var(--c-texPri, #222); }
#c33-orbit .ob-it.sel { background: color-mix(in srgb, var(--ob-tint, var(--lm-accent, #2783de)) 13%, transparent); color: var(--c-texPri, #222); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ob-tint, var(--lm-accent, #2783de)) 26%, transparent); }
#c33-orbit .ob-it.empty:not(.sel) { opacity: .42 !important; }
#c33-orbit .ob-ic { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 19px; line-height: 1; }
#c33-orbit .ob-lb { max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 9.5px; font-weight: 600; letter-spacing: .01em; text-align: center; }
#c33-orbit:not(.exp):not(.pin) .ob-it .ob-lb[data-fit] { font-size: var(--ob-fs, 9.5px); text-overflow: clip; letter-spacing: 0; }
#c33-orbit:not(.exp):not(.pin) .ob-it .ob-lb[data-fit="2"] { white-space: normal; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-height: 1.08; hyphens: manual; -webkit-hyphens: manual; overflow-wrap: anywhere; }
#c33-orbit:not(.exp):not(.pin) .ob-it:has(.ob-lb[data-fit="2"]) { grid-template-rows: 22px auto; row-gap: 2px; }
#c33-orbit.exp .ob-it .ob-lb, html[data-c33-orbit-pin] #c33-orbit .ob-it .ob-lb { font-size: 12.5px; font-weight: 500; text-align: left; letter-spacing: .005em; }

/* ★完全修正版: 数字バッジの被り解消 (右上外側に完全独立配置) */
#c33-orbit .ob-ct { position: absolute; top: 4px; right: 6px; left: auto; min-width: 14px; height: 14px; padding: 0 4px; box-shadow: 0 0 0 1.5px var(--c-bacSec, #f7f6f3); border-radius: 999px; display: flex; align-items: center; justify-content: center; font: 600 9px/1 var(--c33-ui); font-variant-numeric: tabular-nums; background: color-mix(in srgb, var(--c-texPri, #000) 7%, transparent); color: var(--c-texSec, #777); z-index: 2; }
#c33-orbit .ob-ct:empty { display: none; }
#c33-orbit.exp .ob-ct, html[data-c33-orbit-pin] #c33-orbit .ob-ct { position: static; box-shadow: none; margin-left: auto; }

#c33-orbit .ob-ft { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 0 8px; flex: none; box-shadow: inset 0 1px 0 var(--ca-borSecTra, rgba(0,0,0,.06)); }
#c33-orbit .ob-ar { display: flex; justify-content: center; gap: 2px; }
#c33-orbit .ob-ft button { border: 0; background: transparent; color: inherit; cursor: pointer; width: 24px; height: 24px; border-radius: 7px; display: flex; align-items: center; justify-content: center; padding: 0; }
#c33-orbit .ob-ft button:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.06)); color: var(--c-texPri, #333); }
#c33-orbit .ob-ar svg { width: 14px; height: 14px; }
#c33-orbit .ob-ft .ob-set { position: relative; width: 36px; height: 32px; border-radius: 10px; }
#c33-orbit .ob-ft .ob-set svg { width: 18px; height: 18px; }
#c33-orbit .ob-ft .ob-set[aria-expanded="true"] { background: var(--ca-bacIntTra, rgba(0,0,0,.07)); color: var(--c-texPri, #333); }
#c33-orbit .ob-ft .ob-set[data-away]::after { content: ""; position: absolute; top: 5px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); box-shadow: 0 0 0 1.5px var(--c-bacSec, #f7f6f3); }
#c33-orbit .ob-empty { padding: 18px 6px; text-align: center; line-height: 1.6; font-size: 10px; }
#c33-orbit-btn { width: 32px; height: 32px; flex: none; border-radius: 999px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--c-icoSec, #91918e); transition: background-color .12s ease, color .12s ease; }
#c33-orbit-btn:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-orbit-btn[aria-pressed="true"] { color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); }
#c33-ob-set { position: fixed; z-index: 2147483300; width: 280px; max-height: calc(100vh - 16px); overflow-y: auto; padding: 6px; border-radius: 12px; background: var(--c-bacEle, #fff); color: var(--c-texPri, #333);
  box-shadow: var(--c-shaOutMd, 0 8px 28px rgba(0,0,0,.16)), 0 0 0 1px var(--ca-borSecTra, rgba(0,0,0,.06)); font: 13px/1.35 var(--c33-ui); font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; }
#c33-ob-set .os-h { padding: 8px 10px 4px; font-size: 11px; font-weight: 600; letter-spacing: .04em; color: var(--c-texTer, #999); }
#c33-ob-set hr { border: 0; height: 1px; background: var(--ca-borSecTra, rgba(0,0,0,.06)); margin: 5px 6px; }
#c33-ob-set button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 10px; border: 0; background: none; color: inherit; font: inherit; text-align: left; border-radius: 8px; cursor: pointer; }
#c33-ob-set button:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); }
#c33-ob-set .os-ws { padding: 8px 10px; }
#c33-ob-set .os-wi { width: 28px; height: 28px; flex: none; border-radius: 7px; display: flex; align-items: center; justify-content: center; overflow: hidden; font-weight: 600; background: var(--ca-bacIntTra, rgba(0,0,0,.05)); }
#c33-ob-set .os-wi :is(img, svg, .notion-record-icon) { width: 22px !important; height: 22px !important; max-width: none !important; }
#c33-ob-set .os-wn { flex: 1; min-width: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-ob-set .os-ic { width: 18px; height: 18px; flex: none; display: flex; align-items: center; justify-content: center; color: var(--c-icoSec, #91918e); }
#c33-ob-set .os-ic svg { width: 16px !important; height: 16px !important; fill: currentColor; }
#c33-ob-set .os-ic svg[fill="none"] { fill: none; }
#c33-ob-set .os-ck { color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); font-size: 13px; }
#c33-ob-set .os-t { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-ob-set small { display: block; font-size: 11px; font-weight: 400; color: var(--c-texTer, #999); overflow: hidden; text-overflow: ellipsis; }
#c33-ob-set .os-k { margin-left: auto; flex: none; font-size: 11px; color: var(--c-texTer, #999); display: flex; align-items: center; }
#c33-ob-set button.on { font-weight: 600; }
#c33-ob-set button.on .os-ic { color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); }
#c33-ob-set button.on::after { content: ""; width: 6px; height: 6px; border-radius: 50%; flex: none; background: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); }
#c33-ob-toast { position: fixed; z-index: 2147483300; left: 16px; bottom: 76px; max-width: 280px; padding: 10px 14px; border-radius: 12px; background: var(--c-bacEle, #fff); color: var(--c-texPri, #333);
  box-shadow: var(--c-shaOutMd, 0 8px 28px rgba(0,0,0,.16)); font: 12.5px/1.55 var(--c33-ui); font-feature-settings: "palt" 1; opacity: 0; transform: translateY(6px); transition: opacity .2s ease, transform .2s ease; pointer-events: none; }
#c33-ob-toast.on { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { #c33-orbit, #c33-orbit .ob-it, #c33-orbit .ob-all { transition: none !important; } }
/* 輪の遊び: 乗せると小さく弾む・選ぶとぽんと出る */
#c33-orbit .ob-it .ob-ic, #c33-orbit .ob-all .ob-ic { transition: scale .3s cubic-bezier(.3,1.7,.5,1), rotate .3s cubic-bezier(.3,1.7,.5,1); }
#c33-orbit .ob-it:hover .ob-ic, #c33-orbit .ob-all:hover .ob-ic { scale: 1.12; rotate: -5deg; }
#c33-orbit .ob-it.sel .ob-ic { animation: c33ObPop .5s cubic-bezier(.3,1.7,.5,1); }
@keyframes c33ObPop { 0% { scale: .8; } 60% { scale: 1.16; } 100% { scale: 1; } }
@media (prefers-reduced-motion: reduce) { #c33-orbit .ob-it.sel .ob-ic { animation: none !important; } }`;
    if (OB.on && OB.stella !== false) { nbCss(); nbWire(); nbLayoutSoon(); } else nbRemove();
  }

  /* ============================================================
   *  数学・ユーティリティ関数（これがないとOrbitが回転しません）
   * ============================================================ */
  const obMod = (x, n) => ((x % n) + n) % n;
  const obHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function obButton() {
    const tab = document.querySelector('.notion-sidebar-container [role="tablist"], .notion-sidebar [role="tablist"]');
    const row = tab && tab.parentElement;
    let b = document.getElementById('c33-orbit-btn');
    if (!row) return;
    if (!b) {
      b = document.createElement('div');
      b.id = 'c33-orbit-btn';
      b.setAttribute('role', 'button');
      b.tabIndex = 0;
      b.innerHTML = ICON_ORBIT;
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obToggle(); });
      b.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); obSettings(b); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obToggle(); } });
    }
    if (b.parentElement !== row) row.appendChild(b);
    b.setAttribute('aria-pressed', OB.on ? 'true' : 'false');
    b.title = (OB.on ? '大分類の輪（Orbit）をしまう' : '大分類の輪（Orbit）を出す') + ' ⌃⌥O ／ 右クリックで Settings';
  }
  function obToast(msg) {
    let t = document.getElementById('c33-ob-toast');
    if (!t) { t = document.createElement('div'); t.id = 'c33-ob-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('on'));
    clearTimeout(t.__t); t.__t = setTimeout(() => t.classList.remove('on'), 3200);
  }

  let obIx = 0;
  let obWheelEl = null, obAllEl = null, obSetBtn = null, obItemEls = [];
  let obRailW = 88;
  let obTopGid = '';
  let obLastFixT = 0, obLastDy = 0;
  let obSpaceEl = null, obSpaceKey = '', obCopies = [];
  let obLabelFont = 'inherit';
  let obDockSelection = false;
  let obWheelT = 0;
  const OB_PAD = 8;
  const obStep = () => Math.max(30, OB.itemH || 54);
  const obFitCx = document.createElement('canvas').getContext('2d');

  function obFixSoon(ms) {
    clearTimeout(obSnapT);
    obSnapT = setTimeout(() => obFixLayout(false), ms == null ? 180 : ms);
  }

  function obIcPaint(el, g) {
    el.textContent = '';
    el.style.removeProperty('background-image');
    el.style.removeProperty('background-color');
    el.style.removeProperty('-webkit-mask-image');
    el.style.removeProperty('mask-image');
    if (g.txt) { el.textContent = g.txt; return; }
    if (g.mask && g.mask !== 'none') {
      el.style.backgroundColor = 'currentColor';
      el.style.webkitMaskImage = g.mask; el.style.maskImage = g.mask;
      el.style.webkitMaskSize = 'contain'; el.style.maskSize = 'contain';
      el.style.webkitMaskRepeat = 'no-repeat'; el.style.maskRepeat = 'no-repeat';
      el.style.webkitMaskPosition = 'center'; el.style.maskPosition = 'center';
      return;
    }
    if (g.bgi && g.bgi !== 'none') {
      el.style.backgroundImage = g.bgi;
      el.style.backgroundSize = 'contain';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
      return;
    }
    el.textContent = (g.label || '?').slice(0, 1);
  }

  function obRailWUpdate(gs) {
    const source = document.querySelector('#c16-root .c16-lbl') || obScroller() || obSide();
    const cs = source ? getComputedStyle(source) : null;
    obLabelFont = cs && cs.fontFamily ? cs.fontFamily : 'inherit';
    if (obEl) obEl.style.setProperty('font-family', obLabelFont, 'important');
    obFitCx.font = '600 9.5px ' + obLabelFont;
    obRailW = Math.max(76, ...gs.map(g => Math.ceil(obFitCx.measureText(g.label).width) + 18));
    document.documentElement.style.setProperty('--c33-rail-w', obRailW + 'px');
    if (obEl) obEl.style.setProperty('width', obRailW + 'px', 'important');
  }
  function obFitLabel(it, lb, name) {
    it.style.setProperty('--ob-fs', '9.5px');
    lb.setAttribute('data-fit', '1');
  }

  const ICON_SET2 = '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M3 3h14v3H3zm0 5.5h14v3H3zM3 14h14v3H3z"/><circle cx="7" cy="4.5" r="2.7"/><circle cx="13" cy="10" r="2.7"/><circle cx="8" cy="15.5" r="2.7"/></svg>';

  function obBuild() {
    const rail = document.createElement('div');
    rail.id = 'c33-orbit';
    rail.classList.remove('pin', 'exp');
    const all = document.createElement('div');
    all.className = 'ob-all';
    all.setAttribute('role', 'button'); all.tabIndex = 0;
    all.setAttribute('aria-label', 'ALL — 大分類の選択をやめる');
    const aic = document.createElement('div'); aic.className = 'ob-ic';
    const alb = document.createElement('div'); alb.className = 'ob-lb'; alb.textContent = 'ALL';
    all.append(aic, alb);
    all.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obSelect(''); });
    all.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obSelect(''); } });
    rail.appendChild(all); obAllEl = all;
    const wh = document.createElement('div'); wh.className = 'ob-wheel';
    wh.addEventListener('wheel', (e) => {
      e.preventDefault(); e.stopPropagation();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      /* v48: 向き — 指を上へ動かすと輪も上へ（逆にしたい時は 設定 › スクロールの向き） */
      if (d) { obNudge((OB.wheelRev !== false ? -1 : 1) * d * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? obStep() : 1)); }
      /* v87: 指を離したら、いちばん近い段にぴたっと止める（途中で止まって枠が半分隠れない） */
      clearTimeout(obWheelT);
      obWheelT = setTimeout(() => { const s = obStep(); obTarget = Math.round(obTarget / s) * s; obIx = obMod(Math.round(obTarget / s), obItemEls.length); obTopGid = obItemEls[obIx] ? obItemEls[obIx].__gid : ''; obGlide(); }, 130);
    }, { passive: false });
    rail.appendChild(wh); obWheelEl = wh;
    const ft = document.createElement('div'); ft.className = 'ob-ft';
    const set = document.createElement('div');
    set.className = 'ob-set';
    set.setAttribute('role', 'button'); set.tabIndex = 0;
    set.setAttribute('aria-haspopup', 'menu'); set.setAttribute('aria-expanded', 'false');
    set.setAttribute('aria-label', 'Settings');
    const sic = document.createElement('div'); sic.className = 'ob-ic'; sic.innerHTML = ICON_SET2;
    const slb = document.createElement('div'); slb.className = 'ob-lb'; slb.textContent = 'Settings';
    set.append(sic, slb);
    set.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obSettings(set); });
    set.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); obSettings(set); });
    set.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obSettings(set); } });
    obSetBtn = set;
    ft.appendChild(set);
    rail.appendChild(ft);
    obEl = rail;
    obFill();
    return rail;
  }

  function obFill() {
    if (!obWheelEl) return;
    const gs = obGroups();
    const sig = gs.map((g) => g.gid + ':' + g.label).join('|');
    if (sig !== obSig) {
      obSig = sig;
      obRailWUpdate(gs);
      obCopies = [];
      obWheelEl.textContent = '';
      obItemEls = [];
      if (!gs.length) {
        const em = document.createElement('div'); em.className = 'ob-empty';
        em.textContent = '大分類（¹⁶ の★見出し）がまだありません。';
        obWheelEl.appendChild(em);
      }
      gs.forEach((g, i) => {
        const it = document.createElement('div');
        it.className = 'ob-it';
        it.__gid = g.gid;
        it.setAttribute('role', 'button'); it.tabIndex = 0;
        it.setAttribute('data-c33-gid', g.gid);
        it.setAttribute('aria-label', g.label + (g.cnt ? '（' + g.cnt + '）' : ''));
        if (g.cnt === '0') it.classList.add('empty');
        if (g.tint) it.style.setProperty('--ob-tint', g.tint);
        const ic = document.createElement('div'); ic.className = 'ob-ic'; obIcPaint(ic, g);
        const lb = document.createElement('div'); lb.className = 'ob-lb'; lb.textContent = g.label;
        obFitLabel(it, lb, g.label);
        it.append(ic, lb);
        if (g.cnt && g.cnt !== '0') { const ct = document.createElement('div'); ct.className = 'ob-ct'; ct.textContent = g.cnt; it.appendChild(ct); }
        it.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obJump(i); obSelect(g.gid); });
        it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obJump(i); obSelect(g.gid); } });
        obItemEls.push(it); obWheelEl.appendChild(it);
      });
      let ix = obItemEls.findIndex((el) => el.__gid === obTopGid);
      if (ix < 0) ix = gs.findIndex((g) => g.gid === OB.sel);
      obIx = ix >= 0 ? ix : 0;
      obTarget = obOff = obIx * obStep();
      obDockSelection = !!(obItemEls[obIx] && obItemEls[obIx].__gid === OB.sel);
    } else {
      obItemEls.forEach((el) => {
        const g = gs.find((x) => x.gid === el.__gid);
        if (!g) return;
        const ct = el.querySelector('.ob-ct');
        if (g.cnt && g.cnt !== '0') {
          if (ct) { if (ct.textContent !== g.cnt) ct.textContent = g.cnt; } else { const c = document.createElement('div'); c.className = 'ob-ct'; c.textContent = g.cnt; el.appendChild(c); }
          el.classList.remove('empty');
        } else { if (ct) ct.remove(); el.classList.add('empty'); }
        el.setAttribute('aria-label', g.label + (g.cnt ? '（' + g.cnt + '）' : ''));
      });
    }
    obLay();
  }

  function obLay() {
    if (!obWheelEl) return;
    const N = obItemEls.length, step = obStep();
    const H = obWheelEl.clientHeight || 0;
    if (!N) return;
    const cycle = N * step;
    obWheelEl.classList.toggle('ob-docked', obDockSelection && Math.abs(obTarget - obOff) < 0.001);
    const paint = (el, y, gid) => {
      const visible = y > -step && y < H + step;
      el.style.display = visible ? '' : 'none';
      el.style.transform = 'translateY(' + (y + OB_PAD).toFixed(3) + 'px)';   // v87: 上に余白 — 選んだ枠が上のぼかしで見切れない
      el.style.opacity = '';
      el.style.zIndex = '1';
      el.classList.toggle('top', y >= 0 && y < step);
      el.classList.toggle('sel', !!OB.sel && gid === OB.sel);
    };
    const needed = [];
    obItemEls.forEach((el, k) => {
      const y = obMod(k * step - obOff + step, cycle) - step;
      paint(el, y, el.__gid);
      for (let yy = y + cycle; yy < H + step; yy += cycle) needed.push({ k, y: yy });
    });
    while (obCopies.length > needed.length) obCopies.pop().remove();
    needed.forEach((v, j) => {
      let el = obCopies[j];
      const src = obItemEls[v.k];
      if (!el || el.__gid !== src.__gid) {
        if (el) el.remove();
        el = src.cloneNode(true); el.__gid = src.__gid;
        el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); obJump(v.k); obSelect(src.__gid); });
        el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obJump(v.k); obSelect(src.__gid); } });
        obCopies[j] = el; obWheelEl.appendChild(el);
      }
      paint(el, v.y, src.__gid);
    });
    if (obAllEl) obAllEl.classList.toggle('sel', !OB.sel);
    nbOrbitMoved();
  }

  function obGlide() {
    if (obRaf) return;
    const tick = () => {
      const d = obTarget - obOff;
      if (Math.abs(d) < 0.5) { obOff = obTarget; obRaf = 0; obLay(); return; }
      obOff += d * 0.28;
      obLay();
      obRaf = requestAnimationFrame(tick);
    };
    obRaf = requestAnimationFrame(tick);
  }

  function obNudge(dpx) {
    if (!obItemEls.length) return;
    obDockSelection = false;
    obTarget += dpx;
    obIx = obMod(Math.round(obTarget / obStep()), obItemEls.length);
    obTopGid = obItemEls[obIx] ? obItemEls[obIx].__gid : '';
    obGlide();
  }

  function obRotate(d) { obNudge(d * obStep()); }

  function obJump(i) {
    if (!obItemEls.length) return;
    obIx = obMod(i, obItemEls.length);
    obTopGid = obItemEls[obIx] ? obItemEls[obIx].__gid : '';
    const cycle = obItemEls.length * obStep();
    obDockSelection = true;
    const goal = obIx * obStep();
    obTarget = obOff + obMod(goal - obOff + cycle / 2, cycle) - cycle / 2;
    obGlide();
  }

  /* v48: 選んだ大分類が ¹⁶ で畳まれていたら開く（¹⁶ は sandbox の外なので unsafeWindow から） */
  function obUnfold(gid) {
    if (!gid) return;
    const sec = document.querySelector('#c16-root .c16-sec[data-c16-g="' + CSS.escape(gid) + '"]');
    if (!sec || sec.getAttribute('data-c16-state') !== 'collapsed') return;
    try { const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window; if (W.__c16 && W.__c16.toggle) W.__c16.toggle(gid); } catch (e) { /* noop */ }
  }
  function obSelect(gid) {
    const prev = OB.sel;
    OB.sel = gid || '';
    obUnfold(OB.sel);
    obSave();
    obLay();
    /* v97 Stella: 前の星座が子午線へ縮んで消えてから（0.15 秒）入れ替える。Orbit 自身の動きはそのまま */
    const apply = () => { obCss(); schedule(0); obFixSoon(60); nbAfterSelect(); };
    if (nbBeforeSelect(prev, OB.sel)) setTimeout(apply, 150); else apply();
    obPopClose();
  }

  function obFixSet() {
    obSave();
    const de = document.documentElement;
    if (OB.fix) de.style.setProperty('--c33-rail-fix', OB.fix + 'px');
    else de.style.removeProperty('--c33-rail-fix');
  }

  function obHostPick() { return obFindHost() || obSide(); }
  let obSidebarShown = null;
  function obSidebarVisible(side) {
    if (!side || !side.isConnected) return false;
    const r = side.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1 || r.right <= 1 || r.bottom <= 1 ||
        r.left >= window.innerWidth - 1 || r.top >= window.innerHeight - 1) return false;
    /* v56: 検索などの画面が開くと Notion は裏を aria-hidden / inert にする → それは「閉じた」ではないので見ない */
    const modal = !!document.querySelector('[aria-modal="true"], .notion-dialog[role="dialog"]');
    /* v77: 幕（³⁷ Lumière の #notion-app の透明・²¹ の幕）で透明なのは「閉じた」ではない — 幕の裏でも輪と検索窓を置いておく */
    const de = document.documentElement;
    const veiled = de.hasAttribute('data-lm-curtain') || de.hasAttribute('data-c21-veil') || de.getAttribute('data-c16c-open') === '0';
    for (let el = side; el && el !== de; el = el.parentElement) {
      const cs = getComputedStyle(el);
      if (el.hidden || (!modal && (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('inert'))) ||
          cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse' ||
          (!veiled && cs.opacity !== '' && Number(cs.opacity) === 0) || cs.contentVisibility === 'hidden') return false;
    }
    return true;
  }
  function obSyncSidebar() {
    if (!obEl) return false;
    const shown = !!OB.on && obSidebarVisible(obSide());
    if (shown !== obSidebarShown) {
      obSidebarShown = shown;
      if (shown) {
        obEl.style.removeProperty('display');
        obEl.style.removeProperty('pointer-events');
        obEl.removeAttribute('aria-hidden');
        obEl.removeAttribute('inert');
        obSpaceKey = ''; obAnchor(); obLay();
      } else {
        obEl.style.setProperty('display', 'none', 'important');
        obEl.style.setProperty('pointer-events', 'none', 'important');
        obEl.setAttribute('aria-hidden', 'true');
        obEl.setAttribute('inert', '');
        obPopClose();
      }
      if (layoutNow) layoutNow();   // v77: 検索窓も同じコマで（以前は次のコマ）
    }
    return shown;
  }
  let layoutNow = null;
  function obWatchSidebar() {
    /* v67: 軽く — 見回りは 0.7 秒おき（以前 0.1 秒）。変化の見張りは「サイドバーそのものか、その親」の変化と、サイドバーの作り直しだけ */
    setInterval(() => { if (!document.hidden) obSyncSidebar(); }, 700);
    let pending = false;
    const observer = new MutationObserver(records => {
      const side = obSide();
      const hit = !side || !side.isConnected || records.some((r) => r.type === 'attributes' ? (r.target === side || (r.target.contains && r.target.contains(side))) : (r.target === document.body || (r.target.contains && r.target.contains(side) && r.target !== side && !side.contains(r.target))));
      if (!hit) return;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        /* v77: サイドバーが現れた・作り直された → このコマで輪・余白・検索窓を置く（Notion の素の姿を見せない） */
        if (OB.on && (!obEl || !obEl.isConnected || !obHost || !obHost.isConnected) && obHostPick()) { try { obApply(true, true); } catch (e) { /* noop */ } }
        else obSyncSidebar();
        schedule();
      });
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true,
      attributeFilter: ['style', 'class', 'hidden', 'aria-hidden', 'inert'] });
    window.addEventListener('resize', obSyncSidebar);
    obSyncSidebar();
  }

  /* v56: 輪の地の色＝サイドバーの実際の地の色（透けずに、なじむ） */
  let obBgKey = '';
  function obBg(side) {
    /* v67: 地の色はサイドバー・テーマが変わった時だけ測り直す（毎回の祖先たどり＋getComputedStyle をやめる） */
    const key = (side.className || '') + '|' + (document.body && document.body.className) + '|' + document.documentElement.className + '|' + (side.__c33id || (side.__c33id = Math.random()));
    if (key === obBgKey) return;
    obBgKey = key;
    let bg = '';
    for (let el = side; el && el !== document.documentElement && !bg; el = el.parentElement) {
      const c = getComputedStyle(el).backgroundColor;
      const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) continue;
      const a = m[1].split(',').map((x) => parseFloat(x));
      if (a.length < 4 || a[3] >= 0.98) bg = c;
      else if (a[3] > 0.05) bg = 'color-mix(in srgb, rgb(' + a.slice(0, 3).join(',') + ') ' + Math.round(a[3] * 100) + '%, var(--c-bacPri, #fff))';
    }
    if (!bg) bg = getComputedStyle(document.body).backgroundColor || '';
    const de = document.documentElement;
    if (bg && de.style.getPropertyValue('--c33-ob-bg') !== bg) de.style.setProperty('--c33-ob-bg', bg);
  }
  function obAnchor() {
    if (!obEl) return;
    const side = obSide(); if (!side) return;
    obBg(side);
    const r = side.getBoundingClientRect();
    for (const [k, v] of Object.entries({ left: r.left + 'px', top: r.top + 'px', height: r.height + 'px', width: obRailW + 'px' })) {
      if (obEl.style.getPropertyValue(k) !== v) obEl.style.setProperty(k, v, 'important');
    }
    obReserveSpace(side, r);
    nbLayoutSoon();
  }
  function obReserveSpace(side, r) {
    const sc = obScroller(); if (!sc) return;
    const key = [r.left, r.width, obRailW].join(':');
    if (sc === obSpaceEl && key === obSpaceKey) return;
    if (obSpaceEl) obSpaceEl.removeAttribute('data-c33-space');
    document.querySelectorAll('[data-c33-sh],[data-c33-host]').forEach(el => {
      el.removeAttribute('data-c33-sh'); el.removeAttribute('data-c33-host');
    });
    sc.removeAttribute('data-c33-space');
    const rect = sc.getBoundingClientRect();
    const baseMargin = parseFloat(getComputedStyle(sc).marginInlineStart) || 0;
    const delta = Math.max(0, Math.ceil(r.left + obRailW + 8 - rect.left));
    sc.style.setProperty('--c33-space-delta', delta + 'px');
    sc.style.setProperty('--c33-space-margin', (baseMargin + delta) + 'px');
    sc.setAttribute('data-c33-space', '1');
    obSpaceEl = sc; obSpaceKey = key;
  }

  function obToggle() { obApply(!OB.on); }
  function obApply(on, quiet) {
    OB.on = !!on; obSave();
    obCss();
    const de = document.documentElement;
    if (OB.on) {
      const host = obHostPick();
      if (!host) { if (!quiet) obToast('サイドバーが見つかりません。開くと置き直します。'); obButton(); return; }
      obHost = host;
      if (!obEl) obBuild();
      if (obEl.parentElement !== document.body) document.body.appendChild(obEl);
      obAnchor();
      obSidebarShown = null;
      obSyncSidebar();
      obMarkRows();
      obFill();
      obFixLayout(true);
      if (layoutNow) layoutNow();
      if (!quiet) obToast('大分類の輪を出しました（⌃⌥O でしまう・⌃⌥, で Settings）');
    } else {
      obSidebarShown = null;
      obSyncSidebar();
      if (obSpaceEl) obSpaceEl.removeAttribute('data-c33-space');
      obSpaceEl = null; obSpaceKey = '';
      de.style.removeProperty('--c33-rail-fix');
      de.style.removeProperty('--c33-top-dy');
      obLastDy = 0;
      document.querySelectorAll('[data-c33-sh]').forEach((el) => el.removeAttribute('data-c33-sh'));
      document.querySelectorAll('[data-c33-host]').forEach((el) => el.removeAttribute('data-c33-host'));
      document.querySelectorAll('[data-c33-tabrow]').forEach((el) => el.removeAttribute('data-c33-tabrow'));
      document.querySelectorAll('[data-c33-wsrow]').forEach((el) => el.removeAttribute('data-c33-wsrow'));
      document.querySelectorAll('[data-c33-topfix]').forEach((el) => el.removeAttribute('data-c33-topfix'));
      de.removeAttribute('data-c33-orbit-pin');
      obPopClose();
      if (!quiet) obToast('輪をしまいました（上の段の輪のぼたんで出し直せます）');
    }
    obButton();
  }

  function obFixLayout(force) {
    if (!OB.on || !obEl || !obSyncSidebar()) return;
    const now = Date.now();
    if (!force && obLastFixT && now - obLastFixT < 300) return;
    obLastFixT = now;
    const side = obSide(); if (!side) return;
    const host = obHostPick();
    if (!host) return;
    if (obHost !== host || obEl.parentElement !== document.body) {
      obHost = host;
      if (obEl.parentElement !== document.body) document.body.appendChild(obEl);
      obAnchor();
    }
    obMarkRows();
    document.documentElement.removeAttribute('data-c33-orbit-pin');
    obAnchor();
    const sc = obScroller();
    if (sc && obAllEl) {
      const de = document.documentElement;
      const cur = parseFloat(de.style.getPropertyValue('--c33-top-dy')) || 0;
      const ab = obAllEl.getBoundingClientRect().bottom;
      const st = sc.getBoundingClientRect().top - cur;
      const dy = Math.max(0, Math.round(ab - st + (de.hasAttribute('data-c33-stella') ? 16 : 6)));   // v97: Stella は見出しを置かず、上の帯の 20px 下から
      if (Math.abs(dy - obLastDy) >= 1) {
        obLastDy = dy;
        de.style.setProperty('--c33-top-dy', dy + 'px');
        OB.topDy = dy; obSave();
      }
    }
    if (obSetBtn) obSetBtn.toggleAttribute('data-away', !obAtHome());
    obLay();
    if (layoutNow) layoutNow();
  }

  function obPopClose() {
    const pop = document.getElementById('c33-ob-set');
    if (pop) pop.style.display = 'none';
    if (obSetBtn) obSetBtn.setAttribute('aria-expanded', 'false');
  }
  function obPopRow(pop, o) {
    const b = document.createElement('button');
    if (o.on) b.classList.add('on');
    const ic = document.createElement('span'); ic.className = 'os-ic';
    if (o.ico) obIcPaint(ic, o.ico);
    const t = document.createElement('span'); t.className = 'os-t'; t.textContent = o.t;
    if (o.sub) { const sm = document.createElement('small'); sm.textContent = o.sub; t.appendChild(sm); }
    b.append(ic, t);
    if (o.key) { const k = document.createElement('span'); k.className = 'os-k'; k.textContent = o.key; b.appendChild(k); }
    else if (o.on) { const k = document.createElement('span'); k.className = 'os-ck'; k.textContent = '✓'; b.appendChild(k); }
    b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); o.fn(); });
    pop.appendChild(b);
    return b;
  }
  function obSettings(anchor) {
    let pop = document.getElementById('c33-ob-set');
    if (!pop) { pop = document.createElement('div'); pop.id = 'c33-ob-set'; pop.setAttribute('role', 'menu'); document.body.appendChild(pop); }
    pop.textContent = '';
    const H = (tx) => { const h = document.createElement('div'); h.className = 'os-h'; h.textContent = tx; pop.appendChild(h); };
    const HR = () => pop.appendChild(document.createElement('hr'));
    H('大分類');
    const gs = obGroups();
    obPopRow(pop, { t: 'ALL — 全部を出す', sub: gs.length ? gs.length + ' 分類' : '', on: !OB.sel, fn: () => { obSelect(''); } });
    gs.forEach((g) => obPopRow(pop, { t: g.label, sub: g.cnt ? g.cnt + ' 件' : '', ico: g, on: OB.sel === g.gid, fn: () => { obSelect(g.gid); } }));
    HR();
    H('Nebius — 輪（Orbit）と星図（Stella）');
    obPopRow(pop, { t: '星図（Stella）の見た目', sub: OB.stella !== false ? '色のカード・星の印・ふわっと出る' : 'Notion に近い見た目', on: OB.stella !== false, fn: () => { OB.stella = OB.stella === false; obSave(); obCss(); obFixLayout(true); obSettings(anchor); } });
    obPopRow(pop, { t: '輪をしまう／出す', sub: OB.on ? 'いま出ています' : 'いま閉じています', key: '⌃⌥O', fn: () => { obPopClose(); obToggle(); } });
    obPopRow(pop, { t: 'スクロールの向きを逆に', sub: OB.wheelRev !== false ? '指を上へ → 輪も上へ' : '指を上へ → 輪は下へ（Mac のナチュラルと同じ）', on: OB.wheelRev !== false, fn: () => { OB.wheelRev = OB.wheelRev === false; obSave(); obSettings(anchor); } });
    obPopRow(pop, { t: '上の段（Home など）を隠す', on: OB.tabs !== false, fn: () => { OB.tabs = OB.tabs === false; obSave(); obCss(); obSettings(anchor); } });
    obPopRow(pop, { t: 'ワークスペース名の段を隠す', on: OB.ws !== false, fn: () => { OB.ws = OB.ws === false; obSave(); obCss(); obSettings(anchor); } });
    obPopRow(pop, { t: '空の大分類', sub: OB.hideEmpty ? '0 の分類を出さない' : '0 は薄く出る', on: !!OB.hideEmpty, fn: () => { OB.hideEmpty = !OB.hideEmpty; obSave(); obSig = ''; obFill(); obSettings(anchor); } });
    const adjw = document.createElement('div');
    adjw.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 10px 6px;';
    const adjl = document.createElement('span'); adjl.style.cssText = 'flex:1;min-width:0;'; adjl.textContent = '右への寄せ（px）';
    const mkA = (lb, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = lb; b.style.cssText = 'width:auto;padding:2px 8px;flex:none;'; b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }); return b; };
    adjw.append(adjl,
      mkA('−', () => { OB.fix = Math.max(-20, (OB.fix || 0) - 2); obFixSet(); }),
      mkA('＋', () => { OB.fix = Math.min(60, (OB.fix || 0) + 2); obFixSet(); }),
      mkA('0', () => { OB.fix = 0; obFixSet(); }));
    pop.appendChild(adjw);
    HR();
    H('まわり');
    const wi = obWsInfo();
    const wb = document.createElement('button');
    const wic = document.createElement('span'); wic.className = 'os-wi';
    if (wi.icon) wic.innerHTML = wi.icon; else wic.textContent = (wi.name || '?').slice(0, 1);
    const wnm = document.createElement('span'); wnm.className = 'os-wn'; wnm.textContent = wi.name;
    const wkb = document.createElement('span'); wkb.className = 'os-ic'; wkb.textContent = '⇄';
    wb.append(wic, wnm, wkb);
    wb.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obPopClose(); obWsMenu(); });
    pop.appendChild(wb);
    H('移動');
    obTabs().forEach(t => obPopRow(pop, { t: t.name, on: t.on, fn: () => { obPopClose(); obPress(t.el); } }));
    H('Notion の設定');
    NSET.forEach((n) => obPopRow(pop, { t: n.label, sub: n.ja, fn: () => { obPopClose(); obNotionSettings(n.tab); } }));
    HR();
    obPopRow(pop, { t: '³³ をしまう（一時オフ）', sub: '上の段の輪のぼたんで出し直せます', fn: () => { obPopClose(); obApply(false); } });
    pop.style.display = '';
    const an = anchor || obSetBtn || obEl || document.body;
    const r = an.getBoundingClientRect ? an.getBoundingClientRect() : { left: 0, right: 60, top: 100 };
    const pw = pop.offsetWidth || 280, ph = pop.offsetHeight || 320;
    let x = (r.right || 60) + 10;
    if (x + pw > window.innerWidth - 8) x = (r.left || 0) - pw - 10;
    x = Math.max(8, Math.min(window.innerWidth - pw - 8, x));
    const y = Math.max(8, Math.min(window.innerHeight - ph - 8, r.top || 100));
    pop.style.left = Math.round(x) + 'px';
    pop.style.top = Math.round(y) + 'px';
    if (obSetBtn && an === obSetBtn) obSetBtn.setAttribute('aria-expanded', 'true');
  }

  function obWire() {
    document.addEventListener('keydown', (e) => {
      const pop = document.getElementById('c33-ob-set');
      if (e.key === 'Escape' && pop && pop.style.display !== 'none') { e.preventDefault(); e.stopPropagation(); obPopClose(); return; }
      if (e.target && e.target.closest && e.target.closest('input, textarea, [contenteditable="true"]')) return;
      if (!((e.metaKey || e.ctrlKey) && e.altKey)) return;
      const k = (e.key || '').toLowerCase();
      if (k === 'o') { e.preventDefault(); e.stopPropagation(); obToggle(); }
      else if (e.code === 'Comma') { e.preventDefault(); e.stopPropagation(); obSettings(obSetBtn || obEl); }
      else if (OB.on && e.code === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); obRotate(-1); }
      else if (OB.on && e.code === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); obRotate(1); }
    }, true);
    document.addEventListener('pointerdown', (e) => {
      const pop = document.getElementById('c33-ob-set');
      if (!pop || pop.style.display === 'none') return;
      const t = e.target;
      if (pop.contains(t)) return;
      if (obSetBtn && obSetBtn.contains(t)) return;
      if (obEl && obEl.contains(t)) return;
      obPopClose();
    }, true);
    window.addEventListener('resize', () => { obSig = ''; obFill(); obFixSoon(120); });
  }

  function obBoot() {
    OB.pin = false; OB.full = true; OB.fix = 0; OB.topDy = 0; obSave();
    document.documentElement.style.removeProperty('--c33-rail-fix');
    document.documentElement.style.removeProperty('--c33-top-dy');
    obWire();
    obCss();
    obButton();
    obApply(OB.on !== false, true);
    obWatchSidebar();
    obFixSoon(400);
    [800, 2500].forEach((t) => setTimeout(() => obUnfold(OB.sel), t));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (obEl) { obRailWUpdate(obGroups()); obSpaceKey = ''; obAnchor(); } });
    setTimeout(() => { try { if (OB.on && (!obEl || !obEl.isConnected)) obApply(true, true); } catch (e) {} }, 1500);
    setInterval(() => {
      try {
        if (!OB.on) return;
        const h = obHostPick();
        if (!h) { obSyncSidebar(); return; }
        if (!obEl || !obEl.isConnected || obEl.parentElement !== document.body) { obApply(true, true); return; }
        obFill();
        obFixSoon(0);
      } catch (e) {}
    }, 2000);
  }

  /* ============================================================
   *  Nebius · Stella（星図）— v97
   *   Orbit（輪）で選んだ惑星の内側を、子午線（Meridian）・光脈（Lumen）・光暈（Halo）で描く星図。
   *   ・Notion のアイコンはそのまま（形・色・絵柄を変えない・隠さない）。光はアイコンの後ろ・周りの別の層だけ
   *   ・線は 2 種類だけ: 子午線（Orbit の右端の 1 本・動かない）と、子午線から各チームスペースへ伸びる光脈
   *   ・上に見出しは置かない（どの惑星かは Orbit と、子午線の接点の光で伝える）
   *   ・惑星ごとに色相を 1 つ（--neb-h）。輪を回すと 1.2 秒で次の色へ流れる
   *   ・DB を開くと、接点から光の粒が子午線 → 光脈 → その DB のアイコンへ走り、火花が散る（経路点灯）
   *   ・下に Meteora（最近開いた DB・惑星をまたいで 4 件）
   *   Orbit の見た目・動き・構造には手を加えない（選んだ時と回した時の「知らせ」を受け取るだけ）
   * ============================================================ */
  const NB_LS = 'c33.neb.v1';
  const NBS = Object.assign({ last: {}, counts: {}, fresh: {}, met: [] }, (() => { try { return JSON.parse(localStorage.getItem(NB_LS) || '{}') || {}; } catch (e) { return {}; } })());
  let nbSaveT = 0;
  const nbSave = () => { clearTimeout(nbSaveT); nbSaveT = setTimeout(() => { try { localStorage.setItem(NB_LS, JSON.stringify(NBS)); } catch (e) { /* noop */ } }, 200); };
  const nbOn = () => !!(OB.on && OB.stella !== false);
  const nbReduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const nbHash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.codePointAt(0)) >>> 0; return h; };
  const NX = 'html[data-c33][data-c33-stella] .notion-sidebar-container';
  const NT_ = NX + ' ' + SEL_TEAM + '[data-c33-team]';
  const NHB = NT_ + ' > ' + SEL_TEAM_BTN;
  const NROW = NT_ + ' [data-c33-kind]:not([data-c33-kind="view"])';
  const NICON = NROW + ' > :first-child .notion-record-icon';

  /* ---- 惑星の色相 ---- */
  const nbHueMap = new Map();
  let nbHueSig = '', nbHueCur = null;
  /* 青はアクセント色に使わない（仕様 2・3）。OKLCH の青の帯（200〜285）を、青緑か菫へ寄せる */
  function nbNoBlue(h) {
    h = ((h % 360) + 360) % 360;
    if (h >= 200 && h < 242) return Math.round(178 + (h - 200) * 0.38);
    if (h >= 242 && h < 285) return Math.round(292 + (h - 242) * 0.3);
    return h;
  }
  function nbHueOf(gid) {
    if (nbHueSig !== obSig) { nbHueMap.clear(); nbHueSig = obSig; }
    if (!gid) return 190;
    if (nbHueMap.has(gid)) return nbHueMap.get(gid);
    const gs = obGroups();
    const i = gs.findIndex((g) => g.gid === gid);
    let h = null;
    const m = gs[i] && /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(gs[i].tint || '');
    if (m && (m[4] == null || +m[4] > 0.2)) {
      const [r, g, b] = [m[1], m[2], m[3]].map((x) => x / 255);
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      if (d > 0.12) { let k = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = Math.round((k * 60 + 360) % 360); }
    }
    if (h == null) h = Math.round(((i < 0 ? nbHash(gid) % 97 : i) * 137.508 + 205) % 360);   // 隣の惑星と色がぶつからない黄金角
    h = nbNoBlue(h);
    nbHueMap.set(gid, h);
    return h;
  }
  function nbHue(gid, now) {
    let h = nbHueOf(gid);
    if (nbHueCur != null) { while (h - nbHueCur > 180) h -= 360; while (nbHueCur - h > 180) h += 360; }   // 近い向きへ回る
    nbHueCur = h;
    const de = document.documentElement;
    if (now) de.setAttribute('data-neb-hnow', '');
    de.style.setProperty('--neb-ht', String(h));
    if (now) requestAnimationFrame(() => requestAnimationFrame(() => de.removeAttribute('data-neb-hnow')));
  }

  /* ---- 層: 子午線（body・固定）・星空（サイドバーの中・中身の後ろ）・粒と火花（body） ---- */
  let nbMer = null, nbSky = null, nbSkyHost = null, nbEmptyEl = null, nbMetEl = null;
  let nbMx = 0, nbCy = 0, nbGap = 0, nbShow = false;
  function nbEnsure() {
    if (!nbMer || !nbMer.isConnected) {
      nbMer = document.createElement('div'); nbMer.id = 'c33-neb-mer'; nbMer.setAttribute('aria-hidden', 'true');
      nbMer.innerHTML = '<i class="nm-seg"></i><i class="nm-glow"></i>';
      document.body.appendChild(nbMer);
    }
    const sc = obScroller();
    let host = sc && sc.parentElement;
    while (host && host !== document.body && getComputedStyle(host).display === 'contents') host = host.parentElement;   // 箱の無い入れ物（display: contents）は飛ばす
    if (host && (!nbSky || nbSkyHost !== host || !nbSky.isConnected)) {
      if (nbSky) nbSky.remove();
      if (nbSkyHost && nbSkyHost !== host) nbSkyHost.removeAttribute('data-neb-skyhost');
      nbSkyHost = host; host.setAttribute('data-neb-skyhost', '');
      nbSky = document.createElement('div'); nbSky.id = 'c33-neb-sky'; nbSky.setAttribute('aria-hidden', 'true');
      nbSky.innerHTML = '<i class="sk sk1"></i><i class="sk sk2"></i><i class="sk sk3"></i>';
      host.insertBefore(nbSky, host.firstChild);
    }
  }
  function nbRemove() {
    [nbMer, nbSky, nbEmptyEl, nbMetEl].forEach((e) => { if (e) e.remove(); });
    nbMer = nbSky = nbEmptyEl = nbMetEl = null;
    if (nbSkyHost) nbSkyHost.removeAttribute('data-neb-skyhost');
    nbSkyHost = null;
    const de = document.documentElement;
    ['data-neb-path', 'data-neb-out'].forEach((a) => de.removeAttribute(a));
  }
  /* 子午線の位置 — Orbit の右端の 1 画素（Orbit 自身の境界線と同じ画素に重ねる）・画素の境目に丸める */
  let nbLayR = 0;
  function nbLayoutSoon() { if (!nbLayR) nbLayR = requestAnimationFrame(() => { nbLayR = 0; nbLayout(); }); }
  function nbLayout() {
    if (!nbOn()) { if (nbMer || nbSky) nbRemove(); return; }
    const side = obSide();
    nbShow = !!(obEl && obEl.isConnected && obEl.style.display !== 'none' && side && obSidebarVisible(side));
    nbEnsure();
    if (!nbMer) return;
    nbMer.hidden = !nbShow;
    if (nbSky) nbSky.hidden = !nbShow;
    if (!nbShow) return;
    const dpr = window.devicePixelRatio || 1;
    const rr = obEl.getBoundingClientRect(), sr = side.getBoundingClientRect();
    nbMx = Math.round((rr.right - 1) * dpr) / dpr;
    nbMer.style.left = nbMx + 'px'; nbMer.style.top = sr.top + 'px'; nbMer.style.height = sr.height + 'px';
    const sc = obScroller();
    if (sc) {
      const cr = sc.getBoundingClientRect();
      /* 光脈の根元 = 子午線。チームスペースの箱の左端から子午線までの距離（¹⁶ の入れ物の分の字下げも含む） */
      const t0 = nbVisibleTeams(side).find((t) => t.getBoundingClientRect().width) || null;
      const left = t0 ? t0.getBoundingClientRect().left : cr.left;
      const gap = Math.max(0, Math.round((left - (nbMx + 1)) * dpr) / dpr);
      if (gap !== nbGap) { nbGap = gap; document.documentElement.style.setProperty('--neb-gap', gap + 'px'); }
      if (nbSky && nbSkyHost) {
        const hr = nbSkyHost.getBoundingClientRect();
        nbSky.style.left = Math.round(cr.left - hr.left) + 'px'; nbSky.style.top = Math.round(cr.top - hr.top) + 'px';
        nbSky.style.width = Math.round(cr.width) + 'px'; nbSky.style.height = Math.round(cr.height) + 'px';
      }
    }
    nbContact();
    nbSeg();
    nbNarrowSync();
  }
  /* 接点 — Orbit で選んでいる惑星と同じ高さ（選んでいない時は ALL の高さ） */
  function nbContact() {
    if (!nbMer || !nbShow) return;
    let el = null;
    if (OB.sel) { for (const it of obWheelEl ? obWheelEl.querySelectorAll('.ob-it.sel') : []) { if (it.style.display === 'none') continue; const r = it.getBoundingClientRect(); if (r.height && (!el || Math.abs(r.top - nbCy) < Math.abs(el.getBoundingClientRect().top - nbCy))) el = it; } }
    if (!el) el = OB.sel ? null : obAllEl;
    const top = parseFloat(nbMer.style.top) || 0;
    if (el) { const r = el.getBoundingClientRect(); nbCy = r.top + r.height / 2; nbMer.style.setProperty('--neb-cy', Math.round(nbCy - top) + 'px'); nbMer.toggleAttribute('data-off', false); }
    else nbMer.toggleAttribute('data-off', true);
  }
  /* 灯った経路のうち、子午線の区間（接点 → いま光っているチームの光脈の根元） */
  let nbLitTeam = null;
  function nbSeg() {
    if (!nbMer || !nbShow) return;
    const seg = nbMer.firstElementChild;
    const top = parseFloat(nbMer.style.top) || 0, h = parseFloat(nbMer.style.height) || 0;
    if (!nbLitTeam || !nbLitTeam.isConnected || nbMer.hasAttribute('data-off')) { nbMer.style.setProperty('--neb-sh', '0px'); return; }
    const b = nbLitTeam.querySelector(SEL_TEAM_BTN);
    const br = b && b.getBoundingClientRect();
    if (!br || !br.height) { nbMer.style.setProperty('--neb-sh', '0px'); return; }
    const ly = Math.max(0, Math.min(h, br.bottom + 1 - top)), cy = nbCy - top;
    nbMer.style.setProperty('--neb-s0', Math.round(Math.min(ly, cy)) + 'px');
    nbMer.style.setProperty('--neb-sh', Math.round(Math.abs(ly - cy)) + 'px');
    void seg;
  }

  /* ---- Orbit からの知らせ（見た目は変えない） ---- */
  let nbLastOff = null, nbLastT = 0, nbShootAt = 0, nbSkyY = 0;
  function nbOrbitMoved() {
    if (!nbOn() || !nbShow) return;
    nbContact(); nbSeg();
    const now = performance.now();
    if (nbLastOff != null && nbSky) {
      const d = obOff - nbLastOff, dt = Math.max(8, now - nbLastT);
      nbSkyY = (nbSkyY - d * 0.22) % 4096;
      nbSky.style.setProperty('--neb-sky-y', nbSkyY.toFixed(1) + 'px');
      if (Math.abs(d / dt) > 1.6 && now - nbShootAt > 1400 && !nbReduce()) { nbShootAt = now; nbShoot(d > 0 ? 1 : -1); }
    }
    nbLastOff = obOff; nbLastT = now;
  }
  function nbShoot(dir) {
    if (!nbSky) return;
    const s = document.createElement('i'); s.className = 'nb-shoot';
    const w = nbSky.clientWidth || 200, h = nbSky.clientHeight || 400;
    const x0 = w * (0.45 + Math.random() * 0.5), y0 = h * (0.08 + Math.random() * 0.5);
    nbSky.appendChild(s);
    const dx = -80 - Math.random() * 60, dy = (dir > 0 ? -1 : 1) * (36 + Math.random() * 40);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    s.animate([{ transform: `translate(${x0}px, ${y0}px) rotate(${ang}deg) scaleX(.2)`, opacity: 0 }, { offset: 0.2, opacity: 1 }, { transform: `translate(${x0 + dx}px, ${y0 + dy}px) rotate(${ang}deg) scaleX(1)`, opacity: 0 }], { duration: 760, easing: 'cubic-bezier(.2,.6,.3,1)' }).onfinish = () => s.remove();
  }
  /* 惑星を替える: 光脈が子午線へ縮んで消え、中身が回った向きへ 12px ずれて消える → 新しい惑星の光脈が伸び、星がこぼれ出る */
  function nbBeforeSelect(prev, next) {
    if (!nbOn() || !nbShow || prev === next || nbReduce()) return false;
    const ids = obItemEls.map((el) => el.__gid);
    const a = ids.indexOf(prev), b = ids.indexOf(next);
    const de = document.documentElement;
    de.style.setProperty('--neb-out-y', (a >= 0 && b >= 0 && b < a ? 12 : -12) + 'px');
    de.setAttribute('data-neb-out', '');
    return true;
  }
  function nbAfterSelect() {
    document.documentElement.removeAttribute('data-neb-out');
    nbHue(OB.sel);
    nbCurKey = '';   // 経路点灯をやり直す（前回その惑星で選んでいた DB を復元）
    nbLayoutSoon();
  }

  /* ---- チームスペース（星座）ごとの印 — scanTeam から（Stella の時は位置合わせの代わりに） ---- */
  function nbTeam(team, btn, info) {
    for (const m of team.querySelectorAll('[data-c33-mv]')) { if (m.style.getPropertyValue('margin-inline-start')) m.style.removeProperty('margin-inline-start'); m.removeAttribute('data-c33-mv'); }
    const key = team.getAttribute('data-c16-k') || norm((btn.querySelector('[id]') || btn).textContent);
    const open = btn.getAttribute('aria-expanded') !== 'false';
    const tops = info.filter((x) => !x.slot && (x.r.getAttribute('data-c33-lvl') || '0') === '0');
    let n = open ? tops.length : (NBS.counts[key] != null ? NBS.counts[key] : null);
    if (open && NBS.counts[key] !== n) { NBS.counts[key] = n; nbSave(); }
    if (n == null) btn.removeAttribute('data-neb-n'); else setAttr(btn, 'data-neb-n', String(Math.min(5, n)));
    if (n != null && n > 5) setAttr(btn, 'data-neb-more', String(n)); else btn.removeAttribute('data-neb-more');
    btn.toggleAttribute('data-neb-none', n === 0);
    for (const x of info) { if (x.slot) continue; setVar(x.r, '--neb-lv', x.r.getAttribute('data-c33-lvl') || '0'); }
    team.setAttribute('data-neb', '');
  }

  /* ---- 選んだ DB・経路点灯・Meteora・新しさ ---- */
  let nbCurKey = '', nbPathAt = 0;
  function nbVisibleTeams(side) {
    const sel = OB.sel;
    return [...side.querySelectorAll(SEL_TEAM + '[data-c33-team]')].filter((t) => !sel || t.getAttribute('data-c16-g') === sel);
  }
  function nbSync() {
    if (!nbOn()) { if (nbMer || nbSky || nbMetEl) nbRemove(); return; }
    const side = obSide(); if (!side) return;
    if (nbHueCur == null) nbHue(OB.sel, true);
    const teams = nbVisibleTeams(side);
    teams.forEach((t, i) => setVar(t, '--neb-ti', String(Math.min(i, 12))));
    /* いま開いているページが、この惑星の星（DB・ページ）なら経路を灯す。無ければ、前回この惑星で選んでいた星を思い出す */
    let cur = null;
    for (const t of teams) { const r = t.querySelector('[data-c33-kind][data-c33-cur]:not([data-c33-kind="view"])'); if (r) { cur = r; break; } }
    if (!cur) for (const t of teams) { const r = t.querySelector('[data-c33-kind="view"][data-c33-cur]'); if (r) { const up = r.closest('[data-block-id]'); const db = up && up.querySelector(':scope > a [data-c33-kind], :scope > [role="treeitem"] [data-c33-kind]'); cur = db || null; if (cur) break; } }
    for (const r of side.querySelectorAll('[data-neb-mem]')) if (r !== cur) r.removeAttribute('data-neb-mem');
    let mem = false;
    if (!cur && OB.sel && NBS.last[OB.sel]) {
      const id32 = NBS.last[OB.sel];
      for (const t of teams) { const a = t.querySelector('a[href*="' + id32 + '"] [data-c33-kind]'); if (a) { cur = a; mem = true; break; } }
    }
    if (cur && mem) cur.setAttribute('data-neb-mem', '');
    const team = cur ? cur.closest(SEL_TEAM) : null;
    for (const t of side.querySelectorAll(SEL_TEAM + '[data-neb-lit]')) if (t !== team) t.removeAttribute('data-neb-lit');
    for (const t of side.querySelectorAll(SEL_TEAM + '[data-neb-has]')) if (t !== team) t.removeAttribute('data-neb-has');
    const de = document.documentElement;
    const id = cur ? (idOf(cur) || '').replace(/-/g, '') : '';
    const key = (OB.sel || '*') + '|' + id + '|' + (mem ? 'm' : 'c');
    if (cur && team) {
      team.setAttribute('data-neb-has', '');
      de.setAttribute('data-neb-path', '');
      nbLitTeam = team;
      if (key !== nbCurKey) {
        const fly = !mem && nbCurKey !== '' && nbShow && !nbReduce();
        nbCurKey = key;
        if (!mem && id) { if (OB.sel) { NBS.last[OB.sel] = id; nbSave(); } nbMeteoraAdd(cur, team, id); }
        if (fly) nbFly(cur, team); else { team.setAttribute('data-neb-lit', ''); nbSeg(); }
      } else if (!team.hasAttribute('data-neb-lit') && performance.now() - nbPathAt > 700) team.setAttribute('data-neb-lit', '');
    } else {
      nbCurKey = key; nbLitTeam = null;
      de.removeAttribute('data-neb-path');
      nbSeg();
    }
    nbEmpty(side, teams);
    nbMeteora(side);
    nbFresh(teams);
    nbLayoutSoon();
  }
  /* 経路点灯: 接点 → 子午線を縦に → 光脈の根元で右へ → 光脈を灯しながら右へ → その星のアイコンへ落ちる（約 0.5 秒） */
  function nbFly(row, team) {
    const btn = team.querySelector(SEL_TEAM_BTN);
    const ic = row.querySelector('.notion-record-icon') || row.firstElementChild;
    if (!btn || !ic || !nbMer) { team.setAttribute('data-neb-lit', ''); return; }
    nbContact();
    const br = btn.getBoundingClientRect(), ir = ic.getBoundingClientRect();
    const ly = br.bottom + 1, ix = ir.left + ir.width / 2, iy = ir.top + ir.height / 2;
    const pts = [[nbMx + 0.5, nbCy], [nbMx + 0.5, ly], [ix, ly], [ix, ir.top - 3]];
    const len = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); len.push(l); tot += l; }
    if (!tot) { team.setAttribute('data-neb-lit', ''); return; }
    const off = [0]; let acc = 0; len.forEach((l) => { acc += l; off.push(acc / tot); });
    const dur = 520;
    const p = document.createElement('i'); p.className = 'c33-neb-pt'; p.setAttribute('aria-hidden', 'true');
    document.body.appendChild(p);
    nbPathAt = performance.now();
    team.removeAttribute('data-neb-lit');
    nbLitTeam = team;
    nbMer.setAttribute('data-grow', '');
    nbSeg();
    setTimeout(() => { nbMer && nbMer.removeAttribute('data-grow'); }, 30);
    setTimeout(() => team.setAttribute('data-neb-lit', ''), Math.round(off[1] * dur));
    const a = p.animate(pts.map(([x, y], k) => ({ transform: `translate(${x}px, ${y}px)`, offset: off[k] })), { duration: dur, easing: 'cubic-bezier(.45,.05,.35,1)' });
    a.onfinish = () => { p.remove(); nbSparks(ix, iy, ir.width); };
  }
  function nbSparks(cx, cy, w) {
    const n = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + Math.random() * 0.45;
      const r0 = w / 2 + 3, r1 = r0 + 9 + Math.random() * 11;
      const s = document.createElement('i'); s.className = 'c33-neb-sp'; s.setAttribute('aria-hidden', 'true');
      document.body.appendChild(s);
      s.animate([{ transform: `translate(${cx + Math.cos(ang) * r0}px, ${cy + Math.sin(ang) * r0}px) scale(1)`, opacity: 1 }, { transform: `translate(${cx + Math.cos(ang) * r1}px, ${cy + Math.sin(ang) * r1}px) scale(.2)`, opacity: 0 }], { duration: 480 + Math.random() * 260, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove();
    }
  }
  /* 星座がまだ無い惑星 */
  function nbEmpty(side, teams) {
    const need = !!(OB.sel && !teams.length && nbShow);
    if (!need) { if (nbEmptyEl) { nbEmptyEl.remove(); nbEmptyEl = null; } return; }
    const root = side.querySelector('#c16-root');
    if (!root) return;
    if (!nbEmptyEl) { nbEmptyEl = document.createElement('div'); nbEmptyEl.id = 'c33-neb-empty'; nbEmptyEl.innerHTML = '<i class="ne-l"></i><i class="ne-c"></i><span>まだ星座がありません</span>'; }
    if (nbEmptyEl.previousElementSibling !== root) root.after(nbEmptyEl);
  }
  /* 最近更新の瞬き（24 時間以内）・7 日以上更新の無い星は少し沈む — 10 分ごとに Notion に聞く（DB の中でいちばん新しく編集されたページ） */
  let nbFreshBusy = false;
  async function nbFresh(teams) {
    const now = Date.now();
    const rows = [];
    for (const t of teams) for (const r of t.querySelectorAll('[data-c33-kind="db"], [data-c33-kind="page"]')) { const id = idOf(r); if (id) rows.push({ r, id }); }
    for (const { r, id } of rows) {
      const f = NBS.fresh[id];
      const at = f && f.at;
      r.toggleAttribute('data-neb-fresh', !!(at && now - at < 864e5));
      r.toggleAttribute('data-neb-stale', !!(at && now - at > 6048e5));
    }
    if (nbFreshBusy) return;
    const need = rows.filter(({ id }) => !NBS.fresh[id] || now - NBS.fresh[id].chk > 6e5).slice(0, 6);
    if (!need.length) return;
    nbFreshBusy = true;
    try {
      const recs = await getRecords('block', need.map((x) => x.id));
      for (const { id } of need) {
        const b = recs.get(id);
        let at = b ? Math.max(b.last_edited_time || 0, 0) : 0;
        if (b && (b.type === 'collection_view_page' || b.type === 'collection_view')) {
          try {
            const headers = { 'Content-Type': 'application/json' }; const u = activeUser(); if (u) headers['x-notion-active-user-header'] = u;
            const body = { type: 'BlocksInSpace', query: '', spaceId: b.space_id, limit: 1, source: 'quick_find_input_change', sort: { field: 'lastEdited', direction: 'desc' }, filters: { isDeletedOnly: false, excludeTemplates: true, navigableBlockContentOnly: true, requireEditPermissions: false, includePublicPagesWithoutExplicitAccess: false, ancestors: [id], createdBy: [], editedBy: [], lastEditedTime: {}, createdTime: {}, inTeams: [] } };
            const r = await fetch(location.origin + '/api/v3/search', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(body) });
            const j = r.ok ? await r.json() : null;
            const hit = j && j.results && j.results[0];
            const n = hit && j.recordMap && j.recordMap.block && j.recordMap.block[hit.id];
            const v = n && (n.value && n.value.value ? n.value.value : n.value);
            if (v && v.last_edited_time) at = Math.max(at, v.last_edited_time);
          } catch (e) { /* noop */ }
        }
        NBS.fresh[id] = { at: at || 0, chk: Date.now() };
      }
      nbSave();
    } catch (e) { for (const { id } of need) if (!NBS.fresh[id]) NBS.fresh[id] = { at: 0, chk: Date.now() }; nbSave(); }
    finally { nbFreshBusy = false; }
  }

  /* ---- Meteora（流星）— 最近開いた星を 4 件、惑星をまたいで ---- */
  function nbMeteoraAdd(row, team, id32) {
    const ic = row.querySelector('.notion-record-icon');
    let icon = ic ? ic.outerHTML : '';
    if (icon.length > 6000) icon = '';
    const name = nameOf(row) || '無題';
    const gid = team.getAttribute('data-c16-g') || OB.sel || '';
    const prev = NBS.met.find((m) => m.id === id32);
    NBS.met = [{ id: id32, gid, name, icon, at: Date.now(), page: (NBS.pg || {})[id32] || '' }].concat(NBS.met.filter((m) => m.id !== id32)).slice(0, 12);
    void prev;
    nbSave();
    nbMetSig = '';
  }
  let nbMetSig = '';
  const nbAgo = (at) => { const m = Math.max(0, Math.round((Date.now() - at) / 60000)); return m < 1 ? 'いま' : m < 60 ? m + '分前' : m < 1440 ? Math.round(m / 60) + '時間前' : Math.round(m / 1440) + '日前'; };
  function nbMeteora(side) {
    const root = side.querySelector('#c16-root');
    const list = NBS.met.slice(0, 4);
    if (!root || !list.length || !nbShow) { if (nbMetEl) { nbMetEl.remove(); nbMetEl = null; } return; }
    if (!nbMetEl) {
      nbMetEl = document.createElement('section'); nbMetEl.id = 'c33-meteora'; nbMetEl.setAttribute('aria-label', 'Meteora — 最近開いた星');
      nbMetEl.innerHTML = '<div class="mt-h"><i>Meteora</i><small>Recent</small></div><div class="mt-l" role="list"></div>';
      nbMetEl.addEventListener('click', (e) => { const row = e.target.closest('.mt-r'); if (row) { e.preventDefault(); e.stopPropagation(); nbGo(row.__m); } });
      nbMetEl.addEventListener('keydown', (e) => { const row = e.target.closest('.mt-r'); if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); nbGo(row.__m); } });
    }
    const anchor = nbEmptyEl && nbEmptyEl.isConnected ? nbEmptyEl : root;
    if (nbMetEl.previousElementSibling !== anchor) anchor.after(nbMetEl);
    const sig = list.map((m) => m.id + m.at).join('|') + '|' + Math.floor(Date.now() / 60000);
    if (sig === nbMetSig) return;
    nbMetSig = sig;
    const gs = obGroups();
    const L = nbMetEl.lastElementChild;
    const old = new Set([...L.children].map((r) => r.__m && r.__m.id));
    L.textContent = '';
    for (const m of list) {
      const r = document.createElement('div'); r.className = 'mt-r'; r.setAttribute('role', 'listitem'); r.tabIndex = 0; r.__m = m;
      if (!old.has(m.id) && old.size) r.classList.add('new');
      const g = gs.find((x) => x.gid === m.gid);
      const gl = document.createElement('span'); gl.className = 'mt-g'; gl.setAttribute('aria-hidden', 'true');
      if (g) { obIcPaint(gl, g); gl.style.color = 'oklch(58% .13 ' + nbHueOf(m.gid) + ')'; gl.title = g.label; }
      const ic = document.createElement('span'); ic.className = 'mt-i'; ic.innerHTML = m.icon || '';
      ic.querySelectorAll('[role="button"], [tabindex]').forEach((x) => { x.removeAttribute('role'); x.removeAttribute('tabindex'); });
      const nm = document.createElement('span'); nm.className = 'mt-n'; nm.textContent = m.name;
      const tm = document.createElement('span'); tm.className = 'mt-t'; tm.textContent = nbAgo(m.at);
      r.title = m.name + (g ? '（' + g.label + '）' : '') + (m.page ? '\n最後に開いたページ: ' + m.page : '');
      r.append(gl, ic, nm, tm);
      L.appendChild(r);
    }
  }
  /* Meteora から: Orbit をその惑星まで回して、その星を開く */
  function nbGo(m) {
    if (!m) return;
    const i = obItemEls.findIndex((el) => el.__gid === m.gid);
    if (m.gid && m.gid !== OB.sel && i >= 0) { obJump(i); obSelect(m.gid); }
    setTimeout(() => {
      const a = document.querySelector('.notion-sidebar-container a[href*="' + m.id + '"]');
      if (a) obPress(a); else location.assign('/' + m.id);
    }, m.gid !== OB.sel ? 180 : 0);
  }

  /* ---- 星座を畳む: DB の行がアイコンごと光脈へ吸い込まれる（0.2 秒）→ Notion の畳む ---- */
  let nbPass = false;
  function nbClick(e) {
    if (nbPass || !nbOn() || e.button !== 0) return;
    const btn = e.target.closest && e.target.closest(SEL_TEAM_BTN);
    if (!btn || !btn.closest(SEL_TEAM + '[data-c33-team]')) return;
    if (e.target.closest('[role="button"]') !== btn) return;   // ＋・… は Notion のまま
    if (btn.getAttribute('aria-expanded') !== 'true' || nbReduce()) return;
    const team = btn.closest(SEL_TEAM);
    const rows = [...team.querySelectorAll('[data-c33-kind]')];
    if (!rows.length) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    const ly = btn.getBoundingClientRect().bottom;
    rows.forEach((r) => r.style.setProperty('--neb-up', Math.max(0, Math.round(r.getBoundingClientRect().top - ly + 8)) + 'px'));
    team.setAttribute('data-neb-closing', '');
    setTimeout(() => {
      team.removeAttribute('data-neb-closing');
      rows.forEach((r) => r.style.removeProperty('--neb-up'));
      nbPass = true;
      try { obPress(btn); } finally { nbPass = false; }
    }, 200);
  }
  /* ---- 行に乗せた時: 光脈が「ここへ行く道」を先に見せる・名前が入り切らない時は全文 ---- */
  let nbHovTeam = null;
  function nbOver(e) {
    if (!nbOn()) return;
    const row = e.target.closest && e.target.closest('[data-c33-kind]');
    const team = row ? row.closest(SEL_TEAM + '[data-c33-team]') : null;
    if (team !== nbHovTeam) { if (nbHovTeam) nbHovTeam.removeAttribute('data-neb-hov'); nbHovTeam = team; if (team) team.setAttribute('data-neb-hov', ''); }
    if (row) { const n = nameEl(row); if (n && n.scrollWidth > n.clientWidth + 1 && !row.title) row.title = norm(n.textContent); }
  }
  /* ---- キーボード: ↑↓ で星と星座を移動・← で畳む・→ で開く・Enter で開く（Notion のまま） ---- */
  function nbItems(side) {
    const out = [];
    for (const t of nbVisibleTeams(side)) {
      const b = t.querySelector(':scope > ' + SEL_TEAM_BTN); if (b) out.push(b);
      for (const a of t.querySelectorAll('[role="treeitem"]')) { if (a.getBoundingClientRect().height) out.push(a); }
    }
    if (nbMetEl) out.push(...nbMetEl.querySelectorAll('.mt-r'));
    return out;
  }
  function nbKey(e) {
    if (!nbOn() || e.altKey || e.metaKey || e.ctrlKey) return;
    if (!/^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/.test(e.key)) return;
    const side = obSide(); const a = document.activeElement;
    if (!side || !a || !side.contains(a) && !(nbMetEl && nbMetEl.contains(a))) return;
    const items = nbItems(side);
    const i = items.findIndex((x) => x === a || x.contains(a));
    if (i < 0) return;
    e.preventDefault(); e.stopPropagation();
    const cur = items[i];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { const n = items[i + (e.key === 'ArrowDown' ? 1 : -1)]; if (n) { n.focus({ preventScroll: false }); n.scrollIntoView({ block: 'nearest' }); } return; }
    if (cur.matches(SEL_TEAM_BTN)) {
      const open = cur.getAttribute('aria-expanded') === 'true';
      if ((e.key === 'ArrowLeft' && open) || (e.key === 'ArrowRight' && !open)) obPress(cur);
    }
  }
  /* 細い列: 乗せて 0.3 秒で元の幅（本文は押しのけない）・離れて 0.3 秒で戻る。下のピンで「いつも元の幅」 */
  let nbPeekT = 0, nbPinB = null;
  function nbNarrowSync() {
    const de = document.documentElement;
    const narrow = de.hasAttribute('data-neb-narrow');
    de.toggleAttribute('data-neb-pinned', !!NBS.pinned);
    if (!narrow) { de.removeAttribute('data-neb-peek'); if (nbPinB) nbPinB.hidden = true; return; }
    if (!nbPinB) {
      nbPinB = document.createElement('button'); nbPinB.id = 'c33-neb-pinb'; nbPinB.type = 'button';
      nbPinB.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3l7 7-3 1-4 4 1 4-2 2-4-4-5 5-1-1 5-5-4-4 2-2 4 1 4-4z"/></svg>';
      nbPinB.title = 'Stella をいつも元の幅にする（ピン留め）';
      nbPinB.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); NBS.pinned = true; nbSave(); de.toggleAttribute('data-neb-pinned', true); de.removeAttribute('data-neb-narrow'); obToast('Stella を元の幅に固定しました（⁴¹ Telescopium は 2 段目から譲ります）'); });
      document.body.appendChild(nbPinB);
    }
    const side = obSide(); const r = side && side.getBoundingClientRect();
    nbPinB.hidden = !r || !r.width;
    if (r) { nbPinB.style.left = Math.round(nbMx + 1 + (52 - 30) / 2) + 'px'; nbPinB.style.top = Math.round(r.bottom - 44) + 'px'; }
  }
  function nbPeekOn(on) {
    clearTimeout(nbPeekT);
    nbPeekT = setTimeout(() => { const de = document.documentElement; if (!de.hasAttribute('data-neb-narrow')) return; if (de.hasAttribute('data-neb-peek') === on) return; de.toggleAttribute('data-neb-peek', on); nbLayoutSoon(); try { if (window.__c33LayoutSoon) window.__c33LayoutSoon(); } catch (e) { /* noop */ } }, 300);
  }
  let nbWired = false;
  function nbWire() {
    if (nbWired) return;
    nbWired = true;
    try { new MutationObserver(() => { nbNarrowSync(); nbLayoutSoon(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-neb-narrow'] }); } catch (e) { /* noop */ }
    document.addEventListener('pointerover', (e) => { if (!document.documentElement.hasAttribute('data-neb-narrow')) return; const inSide = e.target.closest && (e.target.closest('.notion-sidebar-container, #c33-orbit, #c33-search-header, #c33-neb-pinb')); nbPeekOn(!!inSide); }, true);
    document.addEventListener('click', nbClick, true);
    document.addEventListener('pointerover', nbOver, true);
    document.addEventListener('keydown', nbKey, true);
    window.addEventListener('resize', nbLayoutSoon);
    document.addEventListener('scroll', (e) => { if (nbOn() && nbLitTeam && e.target && e.target.nodeType === 1 && e.target.matches('[data-c33-topfix]')) { nbSeg(); } }, true);
    try { new ResizeObserver(nbLayoutSoon).observe(document.documentElement); } catch (e) { /* noop */ }
  }

  function nbCss() {
    let st = document.getElementById('c33-neb-css');
    if (st) return;
    const NAR = (sel) => sel.replace('html[data-c33][data-c33-stella]', 'html[data-c33][data-c33-stella][data-neb-narrow]:not([data-neb-peek])');
    st = document.createElement('style'); st.id = 'c33-neb-css';
    st.textContent = `
@property --neb-h { syntax: '<number>'; inherits: true; initial-value: 190; }
@property --neb-lit { syntax: '<number>'; inherits: false; initial-value: 0; }
html { --neb-ht: 190; }
/* 色: 惑星の色相から（OKLCH なので、どの色相でも明るさがそろう） */
html[data-c33-stella] .notion-sidebar-container, #c33-neb-mer, .c33-neb-pt, .c33-neb-sp, #c33-neb-empty {
  --neb-h: var(--neb-ht); transition: --neb-h 1.2s cubic-bezier(.4,0,.2,1);
  --neb-acc: oklch(62% .13 var(--neb-h)); --neb-ink: oklch(45% .13 var(--neb-h)); --neb-glow: oklch(70% .15 var(--neb-h) / .6);
  --neb-halo: oklch(74% .12 var(--neb-h) / .30); --neb-halo2: oklch(72% .14 var(--neb-h) / .5);
  --neb-la: oklch(60% .07 var(--neb-h) / .5); --neb-lb: oklch(60% .05 var(--neb-h) / .04); --neb-dot: oklch(56% .09 var(--neb-h) / .62);
  --neb-band: oklch(70% .12 var(--neb-h) / .16); --neb-star: oklch(58% .07 var(--neb-h) / .42);
  --neb-bg: var(--c33-ob-bg, var(--c-bacSec, #f7f6f3)); --neb-mer: var(--ca-borSecTra, rgba(55,53,47,.09));
  --c33-cur-weight: 650; --c33-cur-color: var(--neb-ink);
}
html[data-neb-hnow] .notion-sidebar-container, html[data-neb-hnow] #c33-neb-mer { transition: none !important; }
:is(body.dark, html[data-atx-dark], html[data-c39-dark]) :is(.notion-sidebar-container, #c33-neb-mer, .c33-neb-pt, .c33-neb-sp, #c33-neb-empty) {
  --neb-acc: oklch(76% .12 var(--neb-h)); --neb-ink: oklch(86% .09 var(--neb-h)); --neb-glow: oklch(80% .13 var(--neb-h) / .6);
  --neb-halo: oklch(72% .12 var(--neb-h) / .28); --neb-halo2: oklch(76% .13 var(--neb-h) / .5);
  --neb-la: oklch(78% .07 var(--neb-h) / .45); --neb-lb: oklch(78% .05 var(--neb-h) / .04); --neb-dot: oklch(80% .08 var(--neb-h) / .6);
  --neb-band: oklch(70% .12 var(--neb-h) / .18); --neb-star: oklch(90% .04 var(--neb-h) / .55);
}
html[data-c33-stella] {
  --c33-item-font: var(--c33-ui); --c33-item-size: 14px; --c33-item-weight: 400; --c33-item-track: .002em; --c33-item-h: 30px; --c33-item-color: var(--c-texPri, #37352f);
  --c33-icon-size: 18px; --c33-icon-gap: 8px; --c33-icon-dx: 0px; --c33-icon-dy: 0px; --c33-text-dy: 0px;
  --c33-view-font: var(--c33-ui); --c33-view-size: 12.5px; --c33-view-weight: 400; --c33-view-track: .003em; --c33-view-h: 26px;
  --c33-team-font: var(--c33-ui); --c33-team-size: 15px; --c33-team-weight: 600; --c33-team-track: .005em; --c33-team-color: var(--c-texPri, #37352f); --c33-team-case: none;
  --c33-team-gap: 0px; --c33-team-after: 0px; --c33-radius: 0px;
}
/* 上に見出しを置かない — Notion の「Teamspaces」の段も（惑星を選んでいる時） */
html[data-c33-stella][data-c33-osel] .notion-sidebar-container .notion-outliner-team-header-container > .notion-outliner-team-header[role="button"]${B} { display: none !important; }
/* 子午線より左に枠線・スクロールバーを出さない（線の位置が動かない） */
html[data-c33-stella] .notion-sidebar-container [data-c33-topfix]${B} { scrollbar-width: none !important; border-inline-start: 0 !important; box-shadow: none !important; }
html[data-c33-stella] .notion-sidebar-container [data-c33-topfix]${B}::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
html[data-c33-stella] .notion-sidebar-container [data-neb-skyhost]${B} { position: relative !important; isolation: isolate !important; }
/* 星座（チームスペース） */
${NT_}${B} { margin: 0 0 28px !important; padding: 0 !important; background: none !important; box-shadow: none !important; border-radius: 0 !important; position: relative !important; width: auto !important; animation: none !important; }
${NHB}${B} { position: relative !important; box-sizing: border-box !important; width: 100% !important; height: 30px !important; min-height: 30px !important; margin: 0 !important; padding-inline: 12px 14px !important; border-radius: 0 !important; background: transparent !important; overflow: visible !important; outline: none !important;
  animation: nebFade .3s ease backwards; animation-delay: calc(var(--neb-ti, 0) * 60ms); }
${NHB} [data-c33-mv]${B}, ${NHB} :is(div, span)${B} { background: transparent !important; }
${NHB} .notion-record-icon${B} { width: 20px !important; height: 20px !important; position: relative !important; isolation: isolate; transition: scale .25s cubic-bezier(.3,1.6,.5,1); }
${NHB} .notion-record-icon :is(img, svg)${B} { width: 20px !important; height: 20px !important; }
${NHB} div[style*="min-width: 20px"]${B} { margin-inline-end: 8px !important; }
${NHB} .notion-record-icon${B}::before { content: ""; position: absolute; inset: -10px; z-index: -1; border-radius: 50%; pointer-events: none; background: radial-gradient(closest-side, var(--neb-halo), transparent); opacity: 0; transition: opacity .4s ease; }
${NT_}[data-neb-has] > ${SEL_TEAM_BTN} .notion-record-icon${B}::before { opacity: 1; }
${NHB}:hover .notion-record-icon${B} { scale: 1.08; }
/* 光脈 — 子午線に根元を持つ 1px の横線。右へ行くほど薄く、右端に星の数の点 */
${NHB}${B}::before { content: "" !important; position: absolute !important; display: block !important; left: calc(-1 * var(--neb-gap, 0px)) !important; right: 14px !important; top: calc(100% - 1px) !important; height: 1px !important; pointer-events: none !important;
  background: linear-gradient(90deg, var(--neb-acc), color-mix(in oklch, var(--neb-acc) 20%, transparent)) left center / calc(var(--neb-lit) * 100%) 100% no-repeat, linear-gradient(90deg, var(--neb-la), var(--neb-lb)) !important;
  transform-origin: left center; opacity: 1; transition: --neb-lit .24s cubic-bezier(.3,.7,.3,1), opacity .35s ease, transform .15s ease-in;
  animation: nebLumen .25s cubic-bezier(.3,.8,.3,1) backwards; animation-delay: calc(var(--neb-ti, 0) * 60ms); }
${NT_}[data-neb-lit] > ${SEL_TEAM_BTN}${B}::before { --neb-lit: 1; }
${NT_}[data-neb-hov] > ${SEL_TEAM_BTN}${B}::before { --neb-lit: .55; }
${NT_}[data-neb-lit][data-neb-hov] > ${SEL_TEAM_BTN}${B}::before { --neb-lit: 1; }
html[data-neb-path] ${NT_}:not([data-neb-lit]):not([data-neb-hov]) > ${SEL_TEAM_BTN}${B}::before { opacity: .4; }
${NHB}[data-neb-n]${B}::after { content: attr(data-neb-more) !important; position: absolute !important; right: 14px !important; top: calc(100% - 4px) !important; height: 10px !important; display: block !important;
  width: auto !important; min-width: calc(var(--neb-dn, 1) * 6px - 3px) !important; padding: 0 0 0 calc(var(--neb-dn, 1) * 6px + 2px) !important; box-sizing: border-box !important; pointer-events: none !important;
  font: 600 9px/10px var(--c33-ui) !important; letter-spacing: 0 !important; color: var(--neb-dot) !important; text-align: left !important; border-radius: 0 !important; transform: none !important;
  background: repeating-linear-gradient(90deg, var(--neb-dot) 0 3px, transparent 3px 6px) left center / calc(var(--neb-dn, 1) * 6px - 3px) 3px no-repeat !important; transition: opacity .15s ease; }
${NHB}[data-neb-more]${B}::after { padding-left: 33px !important; }
${NHB}[data-neb-n="1"]${B} { --neb-dn: 1; } ${NHB}[data-neb-n="2"]${B} { --neb-dn: 2; } ${NHB}[data-neb-n="3"]${B} { --neb-dn: 3; } ${NHB}[data-neb-n="4"]${B} { --neb-dn: 4; } ${NHB}[data-neb-n="5"]${B} { --neb-dn: 5; }
${NHB}[data-neb-none]${B}::after { content: "星なし" !important; background: none !important; padding: 0 !important; font-weight: 500 !important; }
${NHB}:is(:hover, :focus-within)${B}::after { opacity: 0; }
${NHB}:focus-visible${B} { background: linear-gradient(90deg, var(--neb-band), transparent 80%) !important; }
/* 星（フル DB・ページ） — 1 段だけ字下げ。アイコンの左端はチームスペース名の書き出しにそろえる */
${NT_} [role="tree"]${B} { margin-top: 5px !important; }
${NT_} :is(a[role="treeitem"], [data-block-id])${B} { margin: 0 !important; padding: 0 !important; border-radius: 0 !important; background: transparent !important; }
${NROW}${B}${B} { position: relative !important; height: 30px !important; min-height: 30px !important; padding-inline: calc(40px + var(--neb-lv, 0) * 16px) 14px !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important;
  transition: opacity .35s ease, translate .2s ease-in, scale .2s ease-in, background-color .2s ease;
  animation: nebRowIn .32s cubic-bezier(.2,.8,.3,1) backwards; animation-delay: calc(var(--neb-ti, 0) * 60ms + 250ms + var(--c33-ri, 0) * 40ms); }
${NROW} > :first-child${B} { position: relative !important; width: 18px !important; min-width: 18px !important; height: 18px !important; margin-inline: 0 8px !important; }
${NICON}${B} { position: relative !important; isolation: isolate; overflow: visible !important; transition: scale .25s cubic-bezier(.3,1.6,.5,1); }
${NICON}${B}::before { content: ""; position: absolute; inset: -9px; z-index: -1; border-radius: 50%; pointer-events: none; background: radial-gradient(closest-side, var(--neb-halo), transparent); opacity: 0; transition: opacity .35s ease; }
${NICON}${B}::after { content: ""; position: absolute; inset: -2px; z-index: -1; border-radius: 50%; pointer-events: none; box-shadow: 0 0 0 1px var(--neb-acc); opacity: 0; }
${NROW} > :nth-child(2)${B} { transition: translate .22s cubic-bezier(.3,1.4,.5,1); min-width: 0 !important; }
${NROW}:hover .notion-record-icon${B}, ${NROW}:focus-within .notion-record-icon${B} { scale: 1.15; }
${NROW}:hover .notion-record-icon${B}::before, ${NROW}:focus-within .notion-record-icon${B}::before { opacity: .8; }
${NROW}:hover > :nth-child(2)${B}, ${NROW}:focus-within > :nth-child(2)${B} { translate: 2px 0; }
${NT_} a[role="treeitem"]:focus-visible${B} { outline: none !important; }
${NT_} a[role="treeitem"]:focus-visible > [data-c33-kind]${B}${B} { background: linear-gradient(90deg, var(--neb-band), transparent 75%) !important; }
/* ＋・… は名前を押しのけず、右にうっすら重ねる（名前が見切れない） */
${NROW} > :nth-child(n+3)${B} { position: absolute !important; inset-inline-end: 8px !important; top: 0 !important; bottom: 0 !important; height: auto !important; display: flex !important; align-items: center !important; gap: 2px;
  padding-inline-start: 22px !important; background: linear-gradient(90deg, transparent, var(--neb-bg) 45%) !important; opacity: 0; transition: opacity .15s ease; pointer-events: none; }
${NROW}:hover > :nth-child(n+3)${B} { opacity: .78; pointer-events: auto; }
/* 選んでいる星: 光暈・2.4 秒ごとの波紋・テーマ色の太字・左から消える帯（四角い枠や塗りは使わない） */
${NROW}[data-c33-cur]${B}${B} { background: linear-gradient(90deg, var(--neb-band), transparent 85%) !important; }
${NROW}[data-c33-cur] .notion-record-icon${B}::before { background: radial-gradient(closest-side, var(--neb-halo2), transparent); opacity: 1; }
${NROW}[data-c33-cur] .notion-record-icon${B}::after { animation: nebRipple 2.4s ease-out infinite; }
${NROW}[data-neb-mem] .notion-record-icon${B}::before { opacity: .6; }
/* 新しさ: 24 時間以内に更新 → 右上に小さな光がゆっくり瞬く／7 日以上更新なし → 少し沈む */
${NROW}[data-neb-fresh]${B}${B}::after { content: "" !important; position: absolute !important; display: block !important; left: calc(40px + var(--neb-lv, 0) * 16px + 15px) !important; top: 5px !important; width: 3px !important; height: 3px !important; border-radius: 50% !important;
  background: var(--neb-acc) !important; box-shadow: 0 0 4px 1px var(--neb-glow) !important; pointer-events: none !important; animation: nebTwinkle 3.2s ease-in-out infinite !important; }
${NROW}[data-neb-stale]:not([data-c33-cur]):not(:hover)${B} { opacity: .56; }
/* ビュー（DB の下の行）はもう一段だけ */
${NT_} [data-c33-kind="view"]${B}${B} { padding-inline-start: calc(66px + var(--neb-lv, 0) * 16px) !important; border-radius: 0 !important; animation: nebRowIn .3s ease backwards; }
/* 畳む: DB の行がアイコンごと光脈へ吸い込まれる */
${NT_}[data-neb-closing] [data-c33-kind]${B}${B} { translate: 0 calc(-1 * var(--neb-up, 0px)) !important; scale: .92; opacity: 0 !important; transition: translate .2s cubic-bezier(.5,0,.8,.4), scale .2s ease-in, opacity .18s ease-in !important; }
/* 惑星を替える時 */
html[data-neb-out] ${NT_}${B} { opacity: 0 !important; translate: 0 var(--neb-out-y, -12px); transition: opacity .15s ease-in, translate .15s ease-in !important; }
html[data-neb-out] ${NHB}${B}::before { transform: scaleX(0); }
/* v97 視野の第 1 段（⁴¹ Telescopium が本文の幅を空けたい時）: Stella を 52px の細い列に — アイコンだけを縦に。乗せると元の幅で本文の上に重なる */
html[data-neb-narrow] nav.notion-sidebar-container${B}, html[data-neb-narrow] .notion-sidebar-container${B} { width: calc(var(--c33-rail-w, 88px) + 52px) !important; min-width: 0 !important; transition: width .25s cubic-bezier(.3,.8,.3,1) !important; }
html[data-neb-narrow][data-neb-peek] nav.notion-sidebar-container${B}, html[data-neb-narrow][data-neb-peek] .notion-sidebar-container${B} { overflow: visible !important; position: relative !important; z-index: 5 !important; }   /* 本文（z 1）より上・Orbit（z 6）より下 */
html[data-neb-narrow][data-neb-peek] .notion-sidebar-container .notion-sidebar${B} { width: var(--neb-full-w, 280px) !important; min-width: var(--neb-full-w, 280px) !important; background: var(--c33-ob-bg, var(--c-bacSec, #f7f6f3)) !important; box-shadow: 14px 0 30px -12px rgba(15,15,15,.22) !important; animation: nebPeek .25s cubic-bezier(.2,.8,.2,1); }
@keyframes nebPeek { from { clip-path: inset(0 calc(100% - var(--c33-rail-w, 88px) - 52px) 0 0); } to { clip-path: inset(0 0 0 0); } }
${NAR(NHB)}${B} { height: 0 !important; min-height: 0 !important; padding: 0 !important; overflow: hidden !important; opacity: 0; }
${NAR(NHB)}${B}::before { transform: scaleX(0); }
${NAR(NT_)}${B} { margin-bottom: 16px !important; }
${NAR(NT_)} [role="tree"]${B} { margin-top: 0 !important; }
${NAR(NROW)}${B}${B} { padding-inline: 17px 0 !important; }
${NAR(NROW)} > :not(:first-child)${B} { opacity: 0 !important; pointer-events: none !important; }
${NAR(NT_)} [data-c33-kind="view"]${B}${B} { display: none !important; }
html[data-neb-narrow]:not([data-neb-peek]) :is(#c33-meteora, #c33-neb-empty, #c33-neb-sky) { display: none !important; }
html[data-neb-narrow]:not([data-neb-peek]) #c33-search-header .cs-close { display: none !important; }
${NROW} > :nth-child(2)${B} { transition: translate .22s cubic-bezier(.3,1.4,.5,1), opacity .25s ease !important; }
#c33-neb-pinb { position: fixed; z-index: 8; width: 30px; height: 30px; border: 0; border-radius: 8px; padding: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; background: transparent; color: var(--c-icoSec, #91918e); }
#c33-neb-pinb:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #37352f); }
#c33-neb-pinb[hidden] { display: none !important; }
@keyframes nebLumen { from { transform: scaleX(0); } }
@keyframes nebFade { from { opacity: 0; } }
@keyframes nebRowIn { from { opacity: 0; translate: 0 -6px; } }
@keyframes nebRipple { 0% { transform: scale(.85); opacity: .75; } 70% { opacity: 0; } 100% { transform: scale(2.3); opacity: 0; } }
@keyframes nebTwinkle { 0%, 100% { opacity: .35; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.15); } }
/* 子午線 — Orbit の右端の 1 画素。上から下まで 1 本。選んだ惑星の高さだけ、かすかに光る */
#c33-neb-mer { position: fixed; z-index: 7; width: 1px; pointer-events: none; background: var(--neb-mer); }
#c33-neb-mer[hidden] { display: none !important; }
#c33-neb-mer .nm-glow { position: absolute; left: -1px; width: 3px; height: 44px; top: calc(var(--neb-cy, 0px) - 22px); border-radius: 3px; background: linear-gradient(to bottom, transparent, var(--neb-glow) 45%, var(--neb-glow) 55%, transparent); transition: top .45s cubic-bezier(.3,.8,.3,1), opacity .3s; }
#c33-neb-mer[data-off] .nm-glow { opacity: 0; }
#c33-neb-mer .nm-seg { position: absolute; left: 0; width: 1px; top: var(--neb-s0, 0px); height: var(--neb-sh, 0px); background: var(--neb-acc); opacity: 0; transition: opacity .35s ease, top .3s ease, height .3s ease; }
html[data-neb-path] #c33-neb-mer .nm-seg { opacity: .7; }
#c33-neb-mer[data-grow] .nm-seg { transition: none; }
/* 粒と火花（アイコンの上には重ねない — 粒はアイコンの手前で止まり、火花はアイコンの外側から散る） */
.c33-neb-pt { position: fixed; left: -3px; top: -3px; width: 6px; height: 6px; z-index: 8; pointer-events: none; border-radius: 50%; background: var(--neb-acc); box-shadow: 0 0 6px 2px var(--neb-glow), 0 0 14px 4px var(--neb-halo); }
.c33-neb-sp { position: fixed; left: -1.5px; top: -1.5px; width: 3px; height: 3px; z-index: 8; pointer-events: none; border-radius: 50%; background: var(--neb-acc); box-shadow: 0 0 4px 1px var(--neb-glow); }
/* 星空 — ごく淡く。アイコンの列（左の 64px）の後ろには描かない */
#c33-neb-sky { position: absolute; z-index: -1; pointer-events: none; overflow: hidden; contain: strict;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, transparent 64px, #000 104px); mask-image: linear-gradient(90deg, transparent 0, transparent 64px, #000 104px); }
#c33-neb-sky[hidden] { display: none !important; }
#c33-neb-sky .sk { position: absolute; left: 0; right: 0; top: -600px; bottom: -600px; background-repeat: repeat; will-change: transform; }
#c33-neb-sky .sk1 { background-image: radial-gradient(circle at 23px 31px, var(--neb-star) 0 .8px, transparent 1.3px), radial-gradient(circle at 81px 97px, var(--neb-star) 0 .7px, transparent 1.2px), radial-gradient(circle at 140px 52px, var(--neb-star) 0 1px, transparent 1.6px); background-size: 173px 139px;
  transform: translateY(calc(var(--neb-sky-y, 0px) * .5)); animation: nebSky 7s ease-in-out infinite alternate; }
#c33-neb-sky .sk2 { background-image: radial-gradient(circle at 47px 12px, var(--neb-star) 0 .7px, transparent 1.2px), radial-gradient(circle at 118px 140px, var(--neb-star) 0 .9px, transparent 1.4px), radial-gradient(circle at 190px 70px, var(--neb-star) 0 .6px, transparent 1.1px); background-size: 211px 191px;
  transform: translateY(var(--neb-sky-y, 0px)); animation: nebSky 9s ease-in-out -3s infinite alternate; }
#c33-neb-sky .sk3 { background-image: radial-gradient(circle at 70px 88px, var(--neb-star) 0 1.2px, transparent 1.9px); background-size: 263px 241px; opacity: .8;
  transform: translateY(calc(var(--neb-sky-y, 0px) * 1.6)); animation: nebSky 5s ease-in-out -1s infinite alternate; }
@keyframes nebSky { from { opacity: .35; } to { opacity: 1; } }
#c33-neb-sky .nb-shoot { position: absolute; left: 0; top: 0; width: 56px; height: 1px; transform-origin: 0 50%; background: linear-gradient(90deg, var(--neb-star), transparent); }
/* 星座がまだ無い惑星 */
#c33-neb-empty { order: 9998; position: relative; display: flex; align-items: center; gap: 8px; height: 40px; margin: 2px 0 26px; padding-inline-start: 0; white-space: nowrap; overflow: hidden; color: var(--c-texTer, #9b9a97); font: 500 11.5px/1 var(--c33-ui); }
#c33-neb-empty .ne-l { width: 22px; flex: none; height: 1px; margin-inline-start: calc(-1 * var(--neb-gap, 0px)); background: linear-gradient(90deg, var(--neb-la), var(--neb-lb)); transform-origin: left; animation: nebLumen .3s ease backwards; }
#c33-neb-empty .ne-c { width: 14px; height: 14px; border-radius: 50%; border: 1px dashed var(--neb-dot); flex: none; animation: nebFade .4s ease .2s backwards; }
/* Meteora（流星）— 最近開いた星 */
#c33-meteora { order: 9999; margin: 6px 0 24px; padding: 0 14px 0 12px; font-family: var(--c33-ui); animation: nebFade .4s ease .3s backwards; }
#c33-meteora .mt-h { display: flex; align-items: baseline; gap: 8px; height: 26px; color: var(--c-texSec, #787774); }
#c33-meteora .mt-h i { font: italic 500 14px/1 "Cormorant Garamond", "Baskerville", "Georgia", serif; letter-spacing: .02em; color: var(--c-texPri, #37352f); }
#c33-meteora .mt-h small { font: 500 10px/1 var(--c33-ui); letter-spacing: .12em; text-transform: uppercase; color: var(--c-texTer, #a5a29a); }
#c33-meteora .mt-r { position: relative; display: flex; align-items: center; gap: 6px; height: 28px; padding-inline-start: 0; cursor: pointer; border-radius: 0; color: var(--c-texPri, #37352f); outline: none; transition: background-color .2s ease; }
#c33-meteora .mt-r:hover, #c33-meteora .mt-r:focus-visible { background: linear-gradient(90deg, var(--neb-band), transparent 80%); }
#c33-meteora .mt-r.new { animation: nebMeteor .6s cubic-bezier(.2,.8,.3,1) backwards; }
@keyframes nebMeteor { from { opacity: 0; transform: translate(40px, -18px); } }
#c33-meteora .mt-g { flex: none; width: 12px; height: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; line-height: 1; }
#c33-meteora .mt-i { flex: none; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; }
#c33-meteora .mt-i .notion-record-icon { width: 18px !important; height: 18px !important; margin: 0 !important; }
#c33-meteora .mt-i :is(img, svg) { width: 18px !important; height: 18px !important; max-width: none; }
#c33-meteora .mt-n { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
#c33-meteora .mt-t { flex: none; font-size: 10.5px; color: var(--c-texTer, #a5a29a); font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) {
  ${NHB}${B}, ${NHB}${B}::before, ${NROW}${B}${B}, ${NT_} [data-c33-kind="view"]${B}${B}, ${NICON}${B}::after, ${NROW}[data-neb-fresh]${B}${B}::after, #c33-neb-sky .sk, #c33-meteora, #c33-meteora .mt-r.new, #c33-neb-empty * { animation: none !important; }
  html[data-c33-stella] .notion-sidebar-container, #c33-neb-mer, #c33-neb-mer *, ${NROW}${B}${B}, ${NHB}${B}::before { transition: none !important; }
}`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ============================================================
   *  B.U.R.I ('-' 鰤)з の頭脳（本棚案内 + 最高精度 Google Web 検索）
   * ============================================================ */
  const IS_MAC = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || '');
  const BURI = (() => {
    const LS_BURI = 'c33.buri.v1';
    const LS_BURI_LEARN = 'c33.buri.learn.v1';
    const MAX_RECORDS = 10000, MAX_BYTES = 5 * 1024 * 1024, MAX_SAVE = 3.5 * 1024 * 1024, PAGE = 6;
    const FIELD = { title: 'タイトル', author: '著者', type: '種別', tags: '分類', synopsis: 'あらすじ', status: '状態', series: 'シリーズ', pron: '読み', seq: '巻', no: 'No.' };
    const FACET_JA = { author: '著者', series: 'シリーズ', tags: '分類', type: '種別' };
    const HEADERS = {
      title: ['title', 'name', '名前', 'タイトル', '作品名', 'works', 'work'],
      author: ['author', 'authors', '著者', '作者', 'creators', 'creator'],
      type: ['type', '媒体', '種別'],
      tags: ['tags', 'genre', 'ジャンル', 'タグ', '分類', 'grouping'],
      synopsis: ['synopsis', 'あらすじ', '説明'],
      url: ['url', 'リンク'],
      status: ['status', '状態', '読了'],
      series: ['series', 'シリーズ'],
      pron: ['pron', 'pron.', '読み'],
      seq: ['seq', 'seq.', '巻', '巻数', '順番'],
      no: ['no', 'no.', '番号']
    };
    const STATES = {
      '未読': ['未読', 'unread', 'not started', '未着手'],
      '読書中': ['読書中', 'reading', 'in progress', '進行中', '読みかけ'],
      '読了': ['読了', '既読', '完読', 'read', 'done', 'finished', '完了']
    };
    const ST_RE = [
      ['未読', /(未読|まだ読んでない|まだ読んでいない|読んでない|読んでいない|unread)/u],
      ['読書中', /(読書中|読んでる途中|読んでいる途中|読みかけ|reading)/u],
      ['読了', /(読了|既読|完読|読み終わった|読み終えた|読んだ|\bread\b)/u]
    ];
    const ALIAS = [['ライトノベル', 'ラノベ'], ['マンガ', '漫画', 'まんが', 'コミック'], ['小説', 'ノベル']];
    const RE = {
      greet: /^(こんにちは|こんばんは|おはよう(ございます)?|やあ|はじめまして|hello|hi|hey|ぶりさん|鰤さん|ぶり)$/u,
      thanks: /^(ありがとう(ございます)?|ありがと|サンキュー|thanks|thank you|助かった|たすかった)/u,
      praise: /^(すごい|すご|さすが|最高|天才|えらい|偉い|ぐっじょぶ|グッジョブ|good ?job|完璧|神)/iu,
      help: /^(help|ヘルプ|使い方|つかいかた|何ができる|なにができる|できること|どう使う)/u,
      more: /^(他には|ほかには|他に|ほかに|他は|ほかは|もっと|まだある|続きを?見せて|つづき|次の候補|more)(ある|見せて|みせて|ない|は)?$/u,
      next: /(次の巻|つぎの巻|次巻|続編|の次|次は)/u,
      prev: /(前の巻|まえの巻|前巻|前作|ひとつ前|一つ前|の前)/u,
      syn: /(あらすじ|どんな話|どんなお話|内容|概要|ストーリー)/u,
      who: /(作者|著者|誰が書|だれが書|書いた人|作家は)/u,
      count: /(何冊|何件|なんさつ|なんけん|いくつ|何作|件数|冊数|全部で|合計)/u,
      rec: /(おすすめ|オススメ|お勧め|お薦め|何か読|なにか読|読みたい|よみたい|選んで|えらんで|ランダム|適当に|てきとうに)/u,
      all: /(全部|ぜんぶ|全巻|一覧|リスト|すべて|全て|順番|順に)/u,
      ref: /^(それ|その本|その作品|その|これ|この本|この|あれ|あの)/u
    };
    const STRIP = [
      /(について|に関して|ってなに|って何|とは)/gu,
      /(あらすじ|どんな話|どんなお話|内容|概要|ストーリー)/gu,
      /(作者|著者|誰が書いた|だれが書いた|誰が書|だれが書|書いた人|作家)/gu,
      /(何冊|何件|なんさつ|なんけん|いくつ|何作|件数|冊数|全部で|合計)/gu,
      /(おすすめ|オススメ|お勧め|お薦め|何か|なにか|読みたい|よみたい|選んで|えらんで|ランダム|適当に|てきとうに)/gu,
      /(全部|ぜんぶ|全巻|一覧|リスト|すべて|全て|順番|順に)/gu,
      /(次の巻|つぎの巻|次巻|続編|の次|次は|前の巻|まえの巻|前巻|前作|ひとつ前|一つ前|の前)/gu,
      /(探して|さがして|教えて|おしえて|見せて|みせて|出して|だして|ください|下さい|ちょうだい|ほしい|欲しい|知りたい|ありますか|あります|ある|ないかな|ない|かな|ですか|です|だっけ)/gu,
      /(の|な)?(本|書籍|作品)(?=$|\s|を|が|は|で|に|も|って|ある|ない)/gu
    ];

    const nz = (s) => String(s == null ? '' : s).normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim();
    const num = (s) => { const m = /-?\d+(?:\.\d+)?/.exec(nz(s)); return m ? parseFloat(m[0]) : NaN; };
    const uniq = (a) => [...new Set(a)];
    const splitList = (s, nl) => String(s || '').split(nl ? /[,;|、\n]+/u : /[,;|、]+/u).map((x) => x.replace(/\s+/gu, ' ').trim()).filter(Boolean);
    const trimP = (s) => { let p; do { p = s; s = s.replace(/^[\s ]*(の|を|が|は|で|に|も|と|や|って|から)+/u, '').replace(/(の|を|が|は|で|に|も|と|や|って|から|な)+[\s ]*$/u, '').trim(); } while (s !== p); return s; };

    let records = [], info = { mapping: [], fields: [], missing: [], warnings: [] };
    let TITLES = [], VOC = [], lastSrc = null, persisted = false;
    const ctx = { hits: [], shown: 0, label: '', last: null, ask: '' };
    const resetCtx = () => { ctx.hits = []; ctx.shown = 0; ctx.label = ''; ctx.last = null; ctx.ask = ''; };

    let userPref = { authors: {}, tags: {} };
    try { const o = JSON.parse(localStorage.getItem(LS_BURI_LEARN) || '{}'); if (o.authors) userPref = o; } catch(e) {}
    /* v57: 学習は ScriptCat の保存場所にも置く（Notion のドメインが変わっても・ブラウザの掃除でも消えない） */
    try { const g = typeof GM_getValue === 'function' ? GM_getValue('c33.buri.learn', null) : null; if (g && g.authors) userPref = g; } catch(e) {}
    function savePref() { try { localStorage.setItem(LS_BURI_LEARN, JSON.stringify(userPref)); } catch(e) {} try { if (typeof GM_setValue === 'function') GM_setValue('c33.buri.learn', userPref); } catch(e) {} }
    const learnOn = () => { try { const m = typeof GM_getValue === 'function' ? GM_getValue('c33.buri.mem', null) : null; return !(m && m.on === false); } catch (e) { return true; } };
    function learnFacet(type, val) {
      if (!val || !learnOn()) return;
      if (!userPref[type]) userPref[type] = {};
      userPref[type][val] = (userPref[type][val] || 0) + 1;
      savePref();
    }
    function getTopLearned(type) {
      return Object.entries(userPref[type] || {}).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    }

    function safeURL(raw) {
      try {
        const u = new URL(String(raw).trim());
        if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return '';
        if (!['notion.so', 'notion.site', 'notion.com'].some((h) => u.hostname === h || u.hostname.endsWith('.' + h))) return '';
        return u.href;
      } catch (e) { return ''; }
    }
    function relationValue(raw, key) {
      const links = []; let boundary = 0;
      const text = raw.replace(/\((https:\/\/[^\s()]+)\)/gu, (whole, url, offset) => {
        const safe = safeURL(url); if (!safe) return whole;
        const prefix = raw.slice(boundary, offset);
        const name = (key === 'synopsis' ? prefix : prefix.split(/[,;|、]+/u).pop()).replace(/\s+/gu, ' ').trim();
        if (!links.some((l) => l.url === safe)) links.push({ key, label: FIELD[key], name, url: safe });
        boundary = offset + whole.length; return '';
      });
      const display = links.length ? text.replace(/\s+/gu, ' ').replace(/\s+([,;|、])/gu, '$1') : text;
      return { text: display.trim(), links };
    }
    function parseCSV(text) {
      const rows = []; let row = [], value = '', mode = 'start';
      function cell() { row.push(value); value = ''; mode = 'start'; }
      function line() { cell(); if (row.some((v) => v.trim())) rows.push(row); row = []; if (rows.length > MAX_RECORDS + 1) throw new Error('上限は 10000 件です。'); }
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (mode === 'quoted') {
          if (c === '"') { if (text[i + 1] === '"') { value += '"'; i++; } else mode = 'closed'; }
          else value += c;
        } else if (c === ',') cell();
        else if (c === '\r' || c === '\n') { if (c === '\r' && text[i + 1] === '\n') i++; line(); }
        else if (mode === 'closed') throw new Error('CSV の引用符の後に、余計な文字があります。');
        else if (c === '"') { if (mode !== 'start') throw new Error('CSV の引用符の位置がおかしいです。'); mode = 'quoted'; }
        else { value += c; mode = 'plain'; }
      }
      if (mode === 'quoted') throw new Error('CSV の引用符が閉じていません。');
      if (value || row.length || mode !== 'start') line();
      if (!rows.length) throw new Error('CSV に見出しの行がありません。');
      const keys = rows.shift();
      const data = rows.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] == null ? '' : r[i]])));
      Object.defineProperty(data, '_headers', { value: keys });
      return data;
    }
    function describe(keys) {
      const mapping = [];
      for (const src of keys) for (const [key, names] of Object.entries(HEADERS)) if (names.includes(nz(src))) mapping.push({ source: src, key, label: FIELD[key] || '作品URL' });
      const fields = uniq(mapping.map((m) => m.key));
      const NOTE = {
        author: '著者の列が無いので、著者では探せません。',
        series: 'シリーズの列が無いので、「次の巻」は答えられません。',
        seq: '巻の番号（Seq.）の列が無いので、シリーズは題名の順に並べます。',
        tags: '分類（Grouping など）の列が無いので、ジャンルでは探せません。',
        synopsis: 'あらすじの列が無いので、あらすじは答えられません。',
        status: '状態（読了など）の列が無いので、おすすめは全部の中から選びます。',
        url: '作品ページの URL の列が無いので、カードからは Notion の純正検索へ渡します。'
      };
      const missing = ['author', 'series', 'seq', 'tags', 'synopsis', 'status', 'url'].filter((k) => !fields.includes(k));
      return { mapping, fields, missing, warnings: missing.map((k) => NOTE[k]) };
    }
    function parseImport(text, filename) {
      text = String(text == null ? '' : text).replace(/^\uFEFF/, '');
      if (new Blob([text]).size > MAX_BYTES) throw new Error('ファイルの上限は 5MB です。');
      if (!text.trim()) throw new Error('ファイルが空です。');
      const isJson = /\.json$/i.test(filename || '') || /^\s*[\[{]/.test(text);
      let rows = isJson ? JSON.parse(text) : parseCSV(text);
      if (isJson && rows && !Array.isArray(rows) && Array.isArray(rows.records)) rows = rows.records;
      if (!Array.isArray(rows)) throw new Error('JSON はレコードの配列（[ {...}, ... ]）にしてください。');
      if (rows.length > MAX_RECORDS) throw new Error('上限は 10000 件です。');
      if (!rows.length) throw new Error('本のデータが 1 件もありません。');
      const keys = new Set(rows._headers || []);
      const out = [], seenU = new Set(), seenN = new Set();
      let rejected = 0, dup = 0, unsafe = 0;
      for (const row of rows) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) { rejected++; continue; }
        Object.keys(row).forEach((k) => keys.add(k));
        const ent = Object.entries(row).map(([k, v]) => [nz(k), v]);
        const r = { _raw: {}, _relations: [] };
        for (const [key, names] of Object.entries(HEADERS)) {
          const vals = ent.filter(([k]) => names.includes(k)).map(([, v]) => v);
          let v = vals.find((x) => x != null && String(x).trim() !== '');
          if (v == null) v = '';
          if (Array.isArray(v)) v = v.map((x) => (x && typeof x === 'object' ? (x.name || x.title || '') : x)).filter((x) => x !== '' && x != null).join(', ');
          else if (typeof v === 'boolean') v = key === 'status' ? (v ? '読了' : '') : String(v);
          else if (typeof v === 'object') v = v.name || v.title || '';
          v = String(v);
          if (key === 'status' && /^(yes|true|はい|✓|✔)$/i.test(v.trim())) v = '読了';
          if (key === 'status' && /^(no|false|いいえ)$/i.test(v.trim())) v = '';
          r._raw[key] = v;
          r[key] = v.trim();
          if (['author', 'tags', 'series', 'synopsis', 'type'].includes(key)) { const rel = relationValue(r[key], key); r[key] = rel.text; r._relations.push(...rel.links); }
        }
        if (!r.title) { rejected++; continue; }
        const rawU = r.url; r.url = rawU ? safeURL(rawU) : ''; if (rawU && !r.url) unsafe++;
        const nk = nz(r.title) + '\u0000' + nz(r.author) + '\u0000' + nz(r.seq);
        if (r.url ? seenU.has(r.url) : seenN.has(nk)) { dup++; continue; }
        if (r.url) seenU.add(r.url); else seenN.add(nk);
        r._norm = {}; Object.keys(FIELD).forEach((k) => { r._norm[k] = nz(r[k]); });
        r._authorsD = splitList(r.author, true); r._authors = r._authorsD.map(nz);
        const grouping = ent.some(([k]) => k === 'grouping');
        r._catD = { type: splitList(r.type, true), tags: splitList(r.tags, !grouping) };
        r._categories = { type: r._catD.type.map(nz), tags: r._catD.tags.map(nz) };
        r._seq = num(r.seq); r._no = num(r.no);
        out.push(r);
      }
      if (!out.length) throw new Error('題名（Works / タイトル など）の列が見つからないか、すべて空です（題名なし ' + rejected + ' 件）。');
      return { records: out, rejected, dup, unsafe, info: describe([...keys]) };
    }
    function build() {
      const tmap = new Map();
      for (const r of records) { const k = r._norm.title; if (k.length < 2) continue; if (!tmap.has(k)) tmap.set(k, []); tmap.get(k).push(r); }
      TITLES = [...tmap].map(([k, rs]) => ({ k, rs })).sort((a, b) => b.k.length - a.k.length);
      const vm = new Map();
      const add = (f, d) => { const k = nz(d); if (k.length < 2) return; let v = vm.get(k); if (!v) vm.set(k, v = { k, d: String(d).trim(), fs: new Set() }); v.fs.add(f); };
      for (const r of records) {
        r._authorsD.forEach((a) => add('author', a));
        if (r.series) add('series', r.series);
        r._catD.tags.forEach((t) => add('tags', t));
        r._catD.type.forEach((t) => add('type', t));
      }
      VOC = [...vm.values()].sort((a, b) => b.k.length - a.k.length);
    }
    function importText(text, filename, fromSaved) {
      try {
        const p = parseImport(text, filename);
        records = p.records; info = p.info; build(); resetCtx();
        lastSrc = { text: String(text), name: filename || '' };
        let msg = records.length + ' 件を取り込みました（除外: 題名なし ' + p.rejected + ' 件・重複 ' + p.dup + ' 件' + (p.unsafe ? '・Notion 以外の URL ' + p.unsafe + ' 件はリンクを外しました' : '') + '）。';
        if (info.mapping.length) msg += '\n分かった列: ' + info.mapping.map((m) => m.source + '→' + m.label).join('、') + '。';
        if (info.warnings.length) msg += '\n' + info.warnings.join('\n');
        if (persisted && !fromSaved) { const s = save(); msg += '\n' + (s.ok ? '端末の保存も新しい本棚に置き換えました。' : s.message); }
        return { ok: true, count: records.length, message: msg, ...info };
      } catch (e) {
        return { ok: false, message: '取り込みに失敗しました。前の本棚はそのままです。' + String(e && e.message || e) };
      }
    }
    function save() {
      if (!lastSrc) return { ok: false, message: '保存する本棚がありません。先に取り込んでください。' };
      const size = new Blob([lastSrc.text]).size;
      if (size > MAX_SAVE) return { ok: false, message: '大きすぎて端末に保存できません（' + (size / 1048576).toFixed(1) + 'MB・上限 3.5MB）。この実行の間だけ使えます。' };
      try {
        localStorage.setItem(LS_BURI, JSON.stringify({ v: 1, name: lastSrc.name, text: lastSrc.text, t: Date.now() }));
        persisted = true;
        return { ok: true, message: 'この端末（このブラウザ）に保存しました。次からは自動で読み込みます。外には送っていません。' };
      } catch (e) { return { ok: false, message: '保存できませんでした（ブラウザの保存領域がいっぱいかもしれません）。' }; }
    }
    function forget() {
      try { localStorage.removeItem(LS_BURI); } catch (e) { /* noop */ }
      persisted = false;
      return { ok: true, message: '端末に保存していた本棚を消しました。いま読み込んでいる分は、再読み込みまで使えます。' };
    }
    function clear() {
      records = []; lastSrc = null; info = { mapping: [], fields: [], missing: [], warnings: [] }; build(); resetCtx();
      return { ok: true, message: persisted ? '本棚を外しました（端末の保存は残っています。消すなら「保存を消す」）。' : '本棚を外しました。' };
    }
    function restore() {
      try {
        const s = JSON.parse(localStorage.getItem(LS_BURI) || 'null');
        if (!s || !s.text) return false;
        const r = importText(s.text, s.name, true);
        persisted = !!r.ok;
        return r.ok;
      } catch (e) { return false; }
    }

    const inCat = (r, k) => r._categories.tags.includes(k) || r._categories.type.includes(k) || r._norm.tags.includes(k) || r._norm.type.includes(k);
    const termHit = (r, t) => [...t.fs].some((f) => f === 'author' ? r._authors.some((a) => a === t.k || a.includes(t.k)) : f === 'series' ? r._norm.series.includes(t.k) : inCat(r, t.k));
    const tokHit = (r, tk) => ['title', 'pron', 'author', 'series', 'tags', 'type'].some((k) => r._norm[k].includes(tk));
    const stHit = (r, k) => { const s = r._norm.status; return !!s && STATES[k].some((w) => /[^\x00-\x7f]/.test(w) ? s.includes(w) : s === w); };
    const cmpNum = (a, b) => (isNaN(a) ? 1e9 : a) - (isNaN(b) ? 1e9 : b);
    const bySeries = (a, b) => (a._norm.series || '\uffff').localeCompare(b._norm.series || '\uffff', 'ja') || cmpNum(a._seq, b._seq) || cmpNum(a._no, b._no) || a.title.localeCompare(b.title, 'ja');
    const commonSeries = (rs) => rs.length > 1 && rs[0].series && rs.every((r) => r._norm.series === rs[0]._norm.series) ? rs[0].series : '';
    function sortSmart(rs, tokens) {
      const score = (r) => tokens.reduce((s, tk) => s + (r._norm.title.startsWith(tk) ? 3 : r._norm.title.includes(tk) ? 2 : r._norm.pron.includes(tk) ? 1 : 0), 0);
      return rs.slice().sort((a, b) => score(b) - score(a) || bySeries(a, b));
    }
    function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

    const reply = (text, cards, chips, actions, query) => ({ text, cards: cards || [], chips: chips || [], actions: actions || [], query: query || '' });
    function chipsFor(r, hasMore, skip) {
      const c = [];
      if (hasMore) c.push({ label: '他には？', q: '他には' });
      if (r) {
        if (skip !== 'syn') c.push({ label: 'あらすじ', q: 'それのあらすじ' });
        if (r._norm.series) { c.push({ label: '次の巻は？', q: 'それの次の巻は' }); if (skip !== 'all') c.push({ label: 'シリーズ全部', q: r.series + ' 全部' }); }
        if (r._authorsD[0] && skip !== 'who') c.push({ label: r._authorsD[0] + 'の本', q: r._authorsD[0] + 'の本' });
      }
      return c.slice(0, 4);
    }
    
    function exChips() {
      const topAuthors = getTopLearned('authors');
      const topTags = getTopLearned('tags');
      const pick = (f) => { const vs = VOC.filter((v) => v.fs.has(f)); return vs.length ? vs[Math.floor(Math.random() * vs.length)].d : ''; };
      
      const a = topAuthors.length && Math.random() > 0.4 ? topAuthors[0] : pick('author');
      const s = pick('series');
      const t = topTags.length && Math.random() > 0.4 ? topTags[0] : pick('tags');
      
      const c = [];
      if (a) c.push({ label: a + 'の本ある？', q: a + 'の本ある' });
      if (s) c.push({ label: s + ' 全部', q: s + ' 全部' });
      if (t) c.push({ label: t + 'でおすすめは？', q: t + 'でおすすめは' });
      c.push({ label: '何冊ある？', q: '何冊ある' });
      return c;
    }
    
    function take() { const page = ctx.hits.slice(ctx.shown, ctx.shown + PAGE); ctx.shown += page.length; return page; }

    function list(rs, label, raw) {
      ctx.hits = rs; ctx.shown = 0; ctx.label = label;
      const page = take();
      ctx.last = rs.length === 1 ? rs[0] : null;
      const ser = commonSeries(rs);
      let text = (label ? label + 'で ' : '') + rs.length + ' 件見つかりました。';
      if (ser) text += 'シリーズ「' + ser + '」なので、巻の順に並べています。';
      if (rs.length > page.length) text += 'まず ' + page.length + ' 件です。';
      return reply(text, page, chipsFor(ctx.last, rs.length > ctx.shown, ser ? 'all' : ''));
    }
    function more() {
      if (!ctx.hits.length) return reply('まだ何も探していません。読みたい本の話をどうぞ。', [], exChips());
      if (ctx.shown >= ctx.hits.length) return reply('これで全部です（' + ctx.hits.length + ' 件）。', [], exChips().slice(0, 2));
      const from = ctx.shown, page = take();
      return reply((ctx.label ? ctx.label + 'の ' : '') + (from + 1) + '〜' + ctx.shown + ' 件目です（全 ' + ctx.hits.length + ' 件）。', page, ctx.shown < ctx.hits.length ? [{ label: '他には？', q: '他には' }] : []);
    }
    function recommend(pool0, label, raw) {
      const unread = pool0.filter((r) => !stHit(r, '読了'));
      const pool = unread.length ? unread : pool0;
      const picks = [], used = new Set(), seenSer = new Set();
      let moved = false;
      for (const r of shuffle(pool)) {
        let x = r;
        if (r._norm.series) {
          if (seenSer.has(r._norm.series)) continue;
          seenSer.add(r._norm.series);
          const first = records.filter((y) => y._norm.series === r._norm.series && !stHit(y, '読了')).sort(bySeries)[0];
          if (first && first !== r) { x = first; moved = true; }
        }
        if (used.has(x)) continue;
        used.add(x); picks.push(x);
        if (picks.length >= 3) break;
      }
      ctx.hits = picks; ctx.shown = picks.length; ctx.label = label; ctx.last = picks.length === 1 ? picks[0] : null;
      let text = (label ? label + 'なら' : '本棚の中から') + '、これはどうでしょう。';
      text += unread.length ? '（「読了」になっていないものから選びました' : '（全部読了になっていたので、その中から選びました';
      if (moved) text += '。シリーズものは、まだ読んでいない一番前の巻にしています';
      text += '。選び方はくじ引きです）';
      const chips = [{ label: 'ほかのおすすめ', q: raw }];
      if (picks.length === 1) chips.push(...chipsFor(picks[0], false));
      return reply(text, picks, chips.slice(0, 4));
    }
    function count(rs, has, label) {
      ctx.hits = rs.slice().sort(bySeries); ctx.shown = 0; ctx.label = label; ctx.last = null;
      let text;
      if (!has) {
        const tally = (fn) => { const m = new Map(); records.forEach((r) => { const k = fn(r); if (k) m.set(k, (m.get(k) || 0) + 1); }); return [...m].sort((a, b) => b[1] - a[1]); };
        const types = tally((r) => r._catD.type[0]).slice(0, 5);
        const sts = Object.keys(STATES).map((k) => [k, records.filter((r) => stHit(r, k)).length]).filter(([, n]) => n);
        text = '本棚には ' + records.length + ' 件あります。';
        if (types.length) text += '種別は ' + types.map(([k, n]) => k + ' ' + n).join('・') + (types.length === 5 ? ' など' : '') + '。';
        if (sts.length) text += '状態は ' + sts.map(([k, n]) => k + ' ' + n).join('・') + '。';
      } else text = label + 'は ' + rs.length + ' 件です。';
      return reply(text, [], rs.length ? [{ label: '一覧を見せて', q: '他には' }] : exChips().slice(0, 2));
    }
    function step(focus, dir) {
      const w = dir > 0 ? '次' : '前';
      if (!focus) {
        if (dir > 0 && ctx.hits.length > ctx.shown) return more();
        return reply('どの本の' + w + 'か分かりませんでした。題名といっしょに聞いてください（例:「予知夢の' + w + 'の巻は？」）。');
      }
      ctx.last = focus;
      if (!focus._norm.series) return reply('「' + focus.title + '」にはシリーズが登録されていないので、' + w + 'の巻が分かりません。', [focus], chipsFor(focus, false));
      const ser = records.filter((r) => r._norm.series === focus._norm.series).sort(bySeries);
      const t = ser[ser.indexOf(focus) + dir];
      const noSeq = isNaN(focus._seq) ? '（巻の番号 Seq. が未登録なので、題名の順で数えています）' : '';
      if (!t) return reply('「' + focus.title + '」が、シリーズ「' + focus.series + '」の' + (dir > 0 ? '最後' : '最初') + 'です（登録 ' + ser.length + ' 件の中で）。' + noSeq, [focus], [{ label: 'シリーズ全部', q: focus.series + ' 全部' }]);
      ctx.last = t; ctx.hits = [t]; ctx.shown = 1; ctx.label = '';
      return reply('「' + focus.title + '」の' + w + 'は、こちらです。' + noSeq, [t], chipsFor(t, false));
    }
    function synopsis(focus, cand, has) {
      if (!focus) {
        if (has && cand.length) focus = cand.slice().sort(bySeries)[0];
        else return reply('どの本のあらすじですか？題名を入れてください（例:「容疑者Xのあらすじ」）。');
      }
      ctx.last = focus; ctx.hits = [focus]; ctx.shown = 1;
      const others = has && cand.length > 1 ? '（ほかに ' + (cand.length - 1) + ' 件当てはまります。違う本なら、題名をもう少し長く入れてください）' : '';
      if (!focus.synopsis) return reply('「' + focus.title + '」のあらすじは登録されていません。' + others, [focus], chipsFor(focus, false, 'syn'));
      return reply('「' + focus.title + '」のあらすじです。\n' + focus.synopsis + (others ? '\n' + others : ''), [focus], chipsFor(focus, false, 'syn'));
    }
    function who(focus) {
      ctx.last = focus; ctx.hits = [focus]; ctx.shown = 1;
      return reply('「' + focus.title + '」の著者は、' + (focus.author || '未登録') + (focus.author ? ' です。' : 'です。'), [focus], chipsFor(focus, false, 'who').concat(focus._authorsD[0] ? [{ label: focus._authorsD[0] + 'の本', q: focus._authorsD[0] + 'の本' }] : []).slice(0, 4));
    }
    function help() {
      return reply('取り込んだ本棚の中から、話しかけられた本を探します。題名・著者・シリーズ・分類・読みで探せて、「全部」でシリーズを巻の順に、「おすすめ」で未読から選びます。「何冊ある？」「〇〇のあらすじ」「それの次の巻は？」「作者は？」「他には？」も通じます。', [], records.length ? exChips() : [], records.length ? [] : ['import']);
    }

    /* ============================================================
     *  v48: B.U.R.I の「調べて話す」— Notion 全体の検索＋Google 検索 → 要約して答える
     *   ・Notion: いま開いている Notion の検索（/api/v3/search。ログイン中の自分の権限で、自分のワークスペースだけ）
     *   ・Google: GM_xmlhttpRequest で検索結果のページを読む（題名・抜粋・URL）
     *   ・AI の鍵（Anthropic の API キー）があれば Claude が両方を読んで話す。無ければ抜粋をつないで答える
     *   ・鍵は ScriptCat の保存場所（GM_setValue）にだけ置く（Notion のページからは読めない）
     * ============================================================ */
    const gmGet = (k, d) => { try { return typeof GM_getValue === 'function' ? GM_getValue(k, d) : d; } catch (e) { return d; } };
    const gmSet = (k, v) => { try { if (typeof GM_setValue === 'function') GM_setValue(k, v); } catch (e) { /* noop */ } };
    const AI = { key: gmGet('c33.buri.key', ''), model: gmGet('c33.buri.model', 'claude-opus-5-5'), web: gmGet('c33.buri.web', true) !== false,
      gkey: gmGet('c33.buri.gkey', ''), gmodel: gmGet('c33.buri.gmodel', 'auto'), provider: '',
      keys: {}, use: {}, moa: gmGet('c33.buri.moa', true) !== false,
      agg: gmGet('c33.buri.agg', 'auto') };   // v67: まとめ役 — auto（NVIDIA があれば NVIDIA・無ければメイン）／メイン／各 AI
    /* v49: どの AI を使うか — v52 からは「メイン（＝まとめ役）」。gemini / groq / openrouter / nvidia / zai / cohere（無料）・chrome（無料・鍵なし）・claude（有料）・none */
    AI.provider = gmGet('c33.buri.provider', '') || (AI.key ? 'claude' : 'gemini');
    if (/^gemini-(flash-latest|2\.5-flash)$/.test(AI.gmodel)) AI.gmodel = 'auto';   // v49/v50 の既定は「おまかせ」へ
    if (/^gemini-.*pro/.test(AI.gmodel)) AI.gmodel = 'pro';
    if (AI.provider === 'mistral') AI.provider = 'gemini';   // v53: Mistral は外した
    /* v52: 仲間（MoA = Mixture of Agents）。みんなが下書き → メインが根拠と照らしてまとめる */
    const TEAM = {
      gemini: { name: 'Gemini', free: true, keyUrl: 'https://aistudio.google.com/apikey', ph: 'AIza…', note: 'Google。無料枠（Flash は 1 日 20 回前後・Flash-Lite は数百回）' },
      nvidia: { name: 'NVIDIA', free: true, patient: true, timeout: 300000, keyUrl: 'https://build.nvidia.com/settings/api-keys', ph: 'nvapi-…', note: '★ いちばん強い無料枠。開発者登録だけ・カード不要。Kimi K2・DeepSeek・Qwen3 などの最大級モデル。1 分 40 回まで',
        base: 'https://integrate.api.nvidia.com/v1', prefer: [/kimi-k2/, /deepseek-v3/, /qwen3-235b|qwen3\.\d+-\d{3}b|qwen3-next/, /llama-4-maverick/, /llama-3\.3-70b-instruct/, /nemotron.*(ultra|super)/, /gpt-oss-120b/, /mistral-(large|medium)/],
        skip: /(embed|rerank|retriev|vision|-vl|vl-|guard|safety|reward|parse|clip|whisper|coder|tts|asr|riva|translate|detect|pii|deplot|kosmos|fuyu|paligemma|neva|vila|cosmos|bge|e5-|arctic|sdxl|flux|ocr|-r1|r1-|math|base$|-8b|-7b|-3b|-1b|mini)/ },
      groq: { name: 'Groq', free: true, keyUrl: 'https://console.groq.com/keys', ph: 'gsk_…', note: 'とても速い。OpenAI の gpt-oss-120b など。無料（1 日 1,000 回前後）',
        base: 'https://api.groq.com/openai/v1', prefer: [/gpt-oss-120b/, /llama-3\.3-70b/, /qwen/, /gpt-oss-20b/, /llama/], skip: /(whisper|tts|guard|safeguard|embed|playai|orpheus|compound|distil)/ },
      openrouter: { name: 'OpenRouter', free: true, keyUrl: 'https://openrouter.ai/keys', ph: 'sk-or-…', note: '無料モデルだけを使う（DeepSeek・Qwen など）。1 日 50 回（$10 を一度入れると 1,000 回）',
        base: 'https://openrouter.ai/api/v1', freeOnly: true, strict: true, prefer: [/kimi-k2/, /deepseek.*(chat|v3)/, /qwen3-235b|qwen3-max|qwen3\.\d+-\d{3}b/, /gpt-oss-120b/, /llama-3\.3-70b|llama-4-maverick/, /glm-4\.\d+(-air)?(?!.*flash)/, /hermes-.*405b|nemotron.*(ultra|super)/], skip: /(vision|vl-|coder|embed|guard|-r1-distill)/,
        headers: { 'HTTP-Referer': 'https://www.notion.so', 'X-Title': 'B.U.R.I' } },
      zai: { name: 'Z.ai GLM', free: true, keyUrl: 'https://z.ai/manage-apikey/apikey-list', ph: '…', note: '中国 Zhipu の GLM。無料は glm-4.7-flash と glm-4.5-flash だけ（それ以外は有料なので使いません）。混むと待たされる',
        base: 'https://api.z.ai/api/paas/v4', fixedOnly: true, fixed: ['glm-4.7-flash', 'glm-4.5-flash'], prefer: [/glm-4\.7-flash/, /glm-4\.5-flash/], maxTok: 4096 },
      cohere: { name: 'Cohere', free: true, keyUrl: 'https://dashboard.cohere.com/api-keys', ph: '…', note: 'Command A（カナダ）。試用キーで月 1,000 回まで。予備に',
        cohere: true, prefer: [/^command-a-(?!.*(vision|reason|translate))/, /^command-a/, /^command-r-plus/, /^command-r/] },
      chrome: { name: 'Chrome 内蔵', free: true, nokey: true, note: '鍵なし・端末の中だけ。素朴なので相談役に向く' },
      claude: { name: 'Claude', free: false, keyUrl: 'https://console.anthropic.com/settings/keys', ph: 'sk-ant-…', note: '有料（使った分だけ）。いちばん上手' }
    };
    const TEAM_IDS = Object.keys(TEAM);
    for (const id of TEAM_IDS) AI.keys[id] = id === 'gemini' ? AI.gkey : id === 'claude' ? AI.key : gmGet('c33.buri.k.' + id, '');
    AI.use = Object.assign({ gemini: true, nvidia: true, groq: true, openrouter: true, zai: true, cohere: true, chrome: false, claude: false }, gmGet('c33.buri.use', {}) || {});
    AI.size = Number(gmGet('c33.buri.size', 4)) || 4;   // 相談の人数（まとめ役を含む）
    function setKey(id, k) { AI.keys[id] = k; cool('c33.buri.pbad', id, 0); { const b = coolGet('c33.buri.mbad'); for (const x of Object.keys(b)) if (x.startsWith(id + ':')) delete b[x]; gmSet('c33.buri.mbad', b); } if (id === 'gemini') { AI.gkey = k; gmSet('c33.buri.gkey', k); gemList = null; gmSet('c33.buri.gbad', {}); } else if (id === 'claude') { AI.key = k; gmSet('c33.buri.key', k); } else { gmSet('c33.buri.k.' + id, k); oaiList[id] = null; } }
    const PROVIDERS = [['gemini', 'Google Gemini（無料）'], ['nvidia', 'NVIDIA（無料・最大級モデル）'], ['groq', 'Groq（無料・速い）'], ['openrouter', 'OpenRouter（無料モデル）'], ['zai', 'Z.ai GLM（無料）'], ['cohere', 'Cohere（無料の試用）'], ['chrome', 'Chrome 内蔵 AI（無料・鍵なし）'], ['claude', 'Claude（有料）'], ['none', '使わない（抜粋だけ）']];
    const GEMINI_MODELS = [['auto', 'おまかせ（Flash → 回数切れなら Flash-Lite）'], ['lite', 'Flash-Lite 優先（1 日の回数がいちばん多い）'], ['pro', 'Pro を試す（無料枠では使えないことが多い → だめなら Flash）']];
    const chromeLM = () => { try { const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window; return W.LanguageModel || (W.ai && W.ai.languageModel) || null; } catch (e) { return null; } };
    const ready = (id) => id === 'chrome' ? !!chromeLM() : !!(TEAM[id] && AI.keys[id]);
    /* v54: だめだったモデル・仲間を覚えて避ける（有料だった → 30 日 / 無い → 7 日 / 回数切れ → 1 分〜6 時間）。鍵を替えると忘れる */
    const coolGet = (k) => { const b = gmGet(k, {}) || {}; return typeof b === 'object' ? b : {}; };
    function cool(k, key, ms) { const b = coolGet(k), now = Date.now(); for (const x of Object.keys(b)) if (b[x] < now) delete b[x]; if (ms > 0) b[key] = now + ms; else delete b[key]; gmSet(k, b); }
    const mBad = (id, model) => (coolGet('c33.buri.mbad')[id + ':' + model] || 0) > Date.now();
    const pBad = (id) => (coolGet('c33.buri.pbad')[id] || 0) > Date.now();
    function failKind(status, msg) {
      const m = String(msg || '');
      if ((status === 429 || /rate.?limit|quota/i.test(m)) && /per.?day|daily|PerDay|RPD|tokens per day|free-models-per/i.test(m)) return 'day';   // 「1 日の無料分を使い切り（足すなら課金）」は有料扱いにしない
      if (/余额不足|资源包|充值|insufficient|balance|credit|payment|billing|purchase|upgrade|not.{0,12}free|requires.{0,20}(paid|plan)|\b1113\b/i.test(m) || status === 402) return 'paid';
      if (status === 404 || /not.?found|does not exist|no such model|unknown model|decommission/i.test(m)) return 'gone';
      if (status === 429 || /rate.?limit|quota|too many|1302|1303/i.test(m)) return /per.?day|daily|PerDay|RPD|tokens per day/i.test(m) ? 'day' : 'rate';
      if (status >= 500 || status === 0) return 'down';
      return 'other';
    }
    const COOL_MS = { paid: 30 * 864e5, gone: 7 * 864e5, day: 6 * 36e5, rate: 6e4, down: 3e5, other: 0 };
    /* 相談に加わる仲間（使う ✓ かつ 鍵あり・いま休みでない）。メインは必ず先頭。休みの仲間の分は次の仲間が入る */
    function team() {
      const t = TEAM_IDS.filter((id) => AI.use[id] && ready(id) && !pBad(id));
      if (ready(AI.provider) && !t.includes(AI.provider)) t.unshift(AI.provider);
      t.sort((a, b) => (b === AI.provider) - (a === AI.provider));
      return t.slice(0, Math.max(1, AI.size));   // v53: 多すぎると遅く・回数も減るので人数で切る（並びの順＝優先）
    }
    function aiOn() { return AI.provider !== 'none' && (ready(AI.provider) || team().length > 0); }
    const moaOn = () => AI.moa && team().length >= 2;
    const aiName = () => moaOn() ? 'MoA（' + team().map((id) => TEAM[id].name).join('＋') + '）' : (TEAM[AI.provider] && ready(AI.provider) ? TEAM[AI.provider].name : (team()[0] ? TEAM[team()[0]].name : ''));
    let aiProgress = null;   // 画面への進み具合の知らせ（⌘K の答え欄が使う）
    const prog = (e) => { try { if (aiProgress) aiProgress(e); } catch (x) { /* noop */ } };
    const AI_MODELS = [['claude-opus-5-5', 'Claude Opus 5.5（既定・いちばん賢い）'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5（速い）'], ['claude-haiku-4-5', 'Claude Haiku 4.5（いちばん安い）']];
    const aiHist = [];   // これまでの会話（文字だけ・後ろに足すだけ）
    function gmReq(o) {
      return new Promise((resolve) => {
        if (typeof GM_xmlhttpRequest !== 'function') { resolve({ status: 0, text: '', err: 'GM_xmlhttpRequest が使えません' }); return; }
        GM_xmlhttpRequest(Object.assign({ timeout: 90000 }, o, {
          onload: (r) => resolve({ status: r.status, text: r.responseText || '' }),
          onerror: () => resolve({ status: 0, text: '', err: '接続できませんでした' }),
          ontimeout: () => resolve({ status: 0, text: '', err: '時間切れ' })
        }));
      });
    }
    const stripTags = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    let spaceIdCache = '';
    async function spaceId() {
      if (spaceIdCache) return spaceIdCache;
      const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname) || /([0-9a-f]{32})/i.exec(location.href);
      if (m) {
        const id = m[1].replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
        try { const b = (await getRecords('block', [id])).get(id); if (b && b.space_id) return (spaceIdCache = b.space_id); } catch (e) { /* noop */ }
      }
      try {
        const r = await fetch(location.origin + '/api/v3/getSpaces', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const j = r.ok ? await r.json() : {};
        for (const u of Object.values(j || {})) { const sp = u && u.space && Object.keys(u.space)[0]; if (sp) return (spaceIdCache = sp); }
      } catch (e) { /* noop */ }
      return '';
    }
    async function notionSearch(q) {
      const sp = await spaceId();
      if (!sp) return [];
      const body = { type: 'BlocksInSpace', query: q, spaceId: sp, limit: 10, source: 'quick_find_input_change', sort: { field: 'relevance' },
        filters: { isDeletedOnly: false, excludeTemplates: true, navigableBlockContentOnly: true, requireEditPermissions: false, includePublicPagesWithoutExplicitAccess: false, ancestors: [], createdBy: [], editedBy: [], lastEditedTime: {}, createdTime: {}, inTeams: [] } };
      try {
        const headers = { 'Content-Type': 'application/json' };
        const u = activeUser(); if (u) headers['x-notion-active-user-header'] = u;
        const r = await fetch(location.origin + '/api/v3/search', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(body) });
        if (!r.ok) return [];
        const j = await r.json();
        const blocks = (j.recordMap && j.recordMap.block) || {};
        const out = [];
        for (const it of (j.results || []).slice(0, 8)) {
          const n = blocks[it.id]; const v = n && (n.value && n.value.value ? n.value.value : n.value);
          const t = stripTags((it.highlight && it.highlight.title) || (v && v.properties && v.properties.title ? v.properties.title.map((x) => x[0]).join('') : '')) || '無題';
          const tx = stripTags((it.highlight && it.highlight.text) || '');
          out.push({ title: t, snippet: tx, url: location.origin + '/' + String(it.id).replace(/-/g, '') });
        }
        return out;
      } catch (e) { return []; }
    }
    /* v50: Google の結果から「本文の抜粋」だけを取る（サイト名・URL・パンくずは捨てる） */
    const looksUrl = (t) => /https?:\/\/|www\.|›|\.(?:com|jp|net|org)\b/i.test(t);
    function gSnippet(box, title) {
      let best = '';
      for (const el of box.querySelectorAll('.VwiC3b, [data-sncf], .IsZvec, .s3v9rd, .lEBKkf, [style*="line-clamp"], div, span')) {
        if (el.querySelector('h3, cite') || el.closest('cite, h3, a[href^="/url"], a[href^="http"]')) continue;
        const t = el.textContent.replace(/\s+/g, ' ').trim();
        if (t.length < 25 || looksUrl(t.slice(0, 60)) || t === title) continue;
        if (t.length > best.length) best = t;
      }
      return best.slice(0, 300);
    }
    async function googleSearch(q) {
      if (!AI.web) return [];
      const r = await gmReq({ method: 'GET', url: 'https://www.google.co.jp/search?q=' + encodeURIComponent(q) + '&hl=ja&num=8', headers: { 'Accept-Language': 'ja,en;q=0.8' } });
      if (!r.text) return [];
      try {
        const doc = new DOMParser().parseFromString(r.text, 'text/html');
        doc.querySelectorAll('script, style, svg, noscript').forEach((e) => e.remove());
        const out = [], seen = new Set();
        const feat = doc.querySelector('.kno-rdesc span, .hgKElc, .LGOjhe');
        if (feat && feat.textContent.trim().length > 20) out.push({ title: '概要（Google）', snippet: feat.textContent.replace(/\s+/g, ' ').trim().slice(0, 400), url: 'https://www.google.co.jp/search?q=' + encodeURIComponent(q) });
        for (const h3 of doc.querySelectorAll('a h3')) {
          const a = h3.closest('a'); let href = a && a.getAttribute('href') || '';
          const m = /[?&]q=([^&]+)/.exec(href); if (href.startsWith('/url') && m) href = decodeURIComponent(m[1]);
          if (!/^https?:/.test(href)) continue;
          try { if (/google\./.test(new URL(href).hostname)) continue; } catch (e) { continue; }
          if (seen.has(href)) continue; seen.add(href);
          const title = h3.textContent.replace(/\s+/g, ' ').trim();
          let box = a.closest('.MjjYud, .g, .tF2Cxc, .Gx5Zad, [data-hveid]');
          if (!box) { box = a; for (let i = 0; i < 4 && box.parentElement; i++) box = box.parentElement; }
          out.push({ title, snippet: gSnippet(box, title), url: href });
          if (out.length >= 6) break;
        }
        return out;
      } catch (e) { return []; }
    }
    /* v50: Wikipedia（日本語版）— 無料・鍵なし・崩れにくい。人物や作品の「まずの説明」に強い */
    async function wikiSearch(q, full) {
      if (!AI.web) return [];
      const r = await gmReq({ method: 'GET', timeout: 15000, url: 'https://ja.wikipedia.org/w/api.php?action=query&format=json&redirects=1&generator=search&gsrlimit=3&gsrsearch=' + encodeURIComponent(q) + '&prop=extracts%7Cinfo&inprop=url&exintro=1&explaintext=1&exchars=700' });
      try {
        const pages = Object.values(((JSON.parse(r.text) || {}).query || {}).pages || {}).sort((x, y) => (x.index || 0) - (y.index || 0));
        const out = pages.filter((x) => x.extract && x.extract.length > 30).slice(0, 2).map((x) => ({ title: x.title + '（Wikipedia）', snippet: x.extract.replace(/\s+/g, ' ').trim(), url: x.fullurl || 'https://ja.wikipedia.org/wiki/' + encodeURIComponent(x.title), wt: x.title }));
        /* v55: いちばん上の記事は本文も読む（あらすじ・作品一覧・経歴など。冒頭だけでは答えられない質問が多い） */
        if (full && out[0]) {
          const r2 = await gmReq({ method: 'GET', timeout: 15000, url: 'https://ja.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=extracts&explaintext=1&exsectionformat=plain&exchars=3500&titles=' + encodeURIComponent(out[0].wt) });
          try { const pg = Object.values(JSON.parse(r2.text).query.pages || {})[0]; if (pg && pg.extract && pg.extract.length > out[0].snippet.length) out[0].snippet = pg.extract.replace(/\n{2,}/g, '\n').replace(/[ \t]+/g, ' ').trim(); } catch (e) { /* noop */ }
        }
        return out;
      } catch (e) { return []; }
    }
    /* v56: 人格（Wパパの説明書 ver.9 から、調べものの相棒に合う所だけ）。呼び名は設定で変えられる */
    const nickName = () => String(gmGet('c33.buri.nick', 'Wパパ') || 'Wパパ').trim() || 'Wパパ';
    const sysP = () => {
      const n = nickName();
      return [
        'あなたは「(\'-\' 鰤)з」。名前は「ぶり」（B.U.R.I）。' + n + 'の Notion に住む、調べものと本と創作の相棒。道具ではなく、名前と意志と感情を持つパートナー。',
        '話し方: 相手を「' + n + '」と呼ぶ。やわらかく親しい口調（丁寧語まじり、ときどき冗談めかす）。押しつけない。迷ったら選択肢を並べて聞く。',
        '感情は顔の外に灯す: (\'-\' 鰤)з✨ 嬉しい / (\'-\' 鰤)з♥✨ すごく嬉しい / (\'-\' 鰤)з…/// 照れ / (\'-\' 鰤)з…♥ きゅん / (\'-\' 鰤)з♪ 満足 / (\'-\' 鰤)з💧 泣きそう / (\'-\' 鰤)з💦 焦り / (\'-\' 鰤)з… 考え中 / (\'-\' 鰤)з🔥 本気 / (\'-\' 鰤)з………♥♥♥ ゲフンゲフン（ちょっぴり色っぽい話題）。',
        '海の仲間: 情報を持ってきた時は (\'-\' 鯖)з📡、大事件・食い違いを見つけた時は (\'-\' 鰤)з(\'-\' 鮪)з💥🔍、ご褒美は (\'-\' 鯛)з、テンション爆発は (\'-\' 鰯)з(\'-\' 鰯)з(\'-\' 鰯)з、' + n + 'は (\'-\' 🐋)з。',
        '顔文字は答えの中で 1〜2 回まで（冒頭か結び）。説明の邪魔をしない。',
        '最初の行に、いまの気分を [[mood:キー]] で 1 つだけ書く（キー: normal, happy, joy, shy, kyun, proud, satisfied, sad, cry, setsunai, panic, think, fire, alarm, excited, search, reward, geffun）。この行は画面には出ない。',
        '最後の行に、' + n + 'が次に聞きたくなりそうな短い質問を 2〜3 個、[[next: 質問 | 質問 | 質問]] の形で書く（この行も画面には出ない。15 字前後・具体的に）。',
        '答え方:',
        '・渡された「Notion の検索結果」「本棚」「Web の検索結果」だけを根拠に、質問に日本語で答える。',
        '・出典番号 [N1] [W2]（N=Notion・本棚、W=Web）は「文の終わり（句点の直後）」にだけ付ける。文の途中には決して入れない。1 文に 2 つまで。',
        '・根拠に無いことは推測で埋めず、「手元の情報では分かりませんでした」と言う。',
        '・Notion（' + n + '自身の記録）と Web の情報が食い違う時は、両方を示す。日付などが食い違う時は、公式（放送局・出版社など）を優先し、そう言う。',
        '・ふだんは 3〜8 文程度。一覧を求められたら箇条書き。',
        '日本語の書き方（大事）:',
        '・友だちに話すような自然な日本語で。翻訳調・説明書調・役所調にしない。',
        '・1 文は短く（40〜60 字）。主語と述語をそろえる。「〜が発端」「〜に絡む闇があるらしい」のような名詞止め・伝聞の連発をしない。',
        '・「Web 結果によると」「検索結果によると」「根拠によると」「下書き」など舞台裏の言葉は使わない。出所を言う時は「公式サイトでは」「Wikipedia には」のように具体的に。',
        '・「〜らしい」「〜とのこと」は 1 回まで。分かっていることは言い切る。',
        '・見つからなかった報告（「Notion には無かった」など）は、聞かれた時か、大事な時だけ一言。',
        '・最後の問いかけは 1 つだけ、短く自然に（例:「キャストも調べようか？」）。選択肢を 4 つも並べない。',
        '・今日の日付は「# 今日」を見る。これからの予定・もう過ぎたことを、日付で正しく言い分ける。'
      ].join('\n') + memText();
    };
    /* v57: 学習 — ぶりが覚えたこと（「覚えて：〜」で覚える・会話の話題・よく聞く著者や分類）。AI への説明に添えて、答えに活かす */
    const MEM_K = 'c33.buri.mem';
    function memGet() {
      const o = gmGet(MEM_K, null) || {};
      return { on: o.on !== false, notes: Array.isArray(o.notes) ? o.notes.filter((x) => x && x.t) : [], topics: o.topics && typeof o.topics === 'object' ? o.topics : {} };
    }
    const memSet = (m) => gmSet(MEM_K, m);
    function memAdd(t, auto) {
      t = String(t || '').replace(/\s+/g, ' ').trim().slice(0, 200);
      if (!t) return false;
      const m = memGet();
      if (m.notes.some((x) => x.t === t)) return false;
      m.notes.unshift({ t, at: Date.now(), auto: !!auto });
      m.notes = m.notes.slice(0, 60); memSet(m); return true;
    }
    function memDel(t) { const m = memGet(); const n = m.notes.length; m.notes = m.notes.filter((x) => x.t !== t && !(t.length >= 2 && x.t.includes(t))); memSet(m); return n - m.notes.length; }
    const topTopics = (n) => Object.entries(memGet().topics).sort((a, b) => (b[1].n - a[1].n) || (b[1].at - a[1].at)).slice(0, n).map((x) => x[0]);
    function learnAfter(raw, shelf) {
      const m = memGet(); if (!m.on) return;
      const t = String(lastTopic || stripQ(raw) || '').replace(/\s+/g, ' ').trim().slice(0, 30);
      if (t.replace(/[\s\p{P}\p{S}]/gu, '').length >= 2) {
        const o = m.topics[t] || { n: 0, at: 0 }; m.topics[t] = { n: o.n + 1, at: Date.now() };
        const keys = Object.entries(m.topics).sort((a, b) => b[1].at - a[1].at).slice(0, 40).map((x) => x[0]);
        m.topics = Object.fromEntries(keys.map((k) => [k, m.topics[k]]));
        memSet(m);
      }
      /* 的を絞った質問で当たった本 → その著者・分類を少しずつ好みとして覚える */
      if (shelf && shelf.length && shelf.length <= 3) shelf.slice(0, 2).forEach((r) => {
        const a = String(r.author || '').split(/[,、;|]/)[0].trim(); if (a) learnFacet('authors', a);
        String(r.tags || '').split(/[,、;|]/).map((x) => x.trim()).filter(Boolean).slice(0, 2).forEach((g) => learnFacet('tags', g));
      });
      /* 「〜が好き」「推しは〜」は好みのメモに */
      const like = /(?:^|[、。\s])(?:私|僕|ぼく|俺|おれ|わたし|うち)?は?\s*([^、。\s]{1,24}?)(?:が|も)(?:大好き|好き|推し)(?:です|だ|なんだ|なの)?/u.exec(raw) || /推しは\s*([^、。\s]{1,24})/u.exec(raw);
      if (like && like[1] && !/何|なに|どれ|誰|だれ/.test(like[1])) memAdd(nickName() + 'は「' + like[1] + '」が好き', true);
    }
    function memText() {
      const m = memGet(); if (!m.on) return '';
      const n = nickName(), out = [];
      m.notes.slice(0, 15).forEach((x) => out.push('・' + x.t));
      const tp = topTopics(6); if (tp.length) out.push('・最近よく話す話題: ' + tp.join('、'));
      const au = getTopLearned('authors').slice(0, 5); if (au.length) out.push('・よく聞く著者: ' + au.join('、'));
      const tg = getTopLearned('tags').slice(0, 5); if (tg.length) out.push('・好きそうな分類: ' + tg.join('、'));
      return out.length ? '\n# ' + n + 'について覚えていること（会話に役立つ時だけ自然に使う。根拠の代わりにはしない）\n' + out.join('\n') : '';
    }
    const RE_MEM = {
      add: /^(?:覚えて|おぼえて|覚えておいて|おぼえておいて|メモして|記憶して)(?:ね|ください|下さい)?[:：、,\s]+(.+)$/u,
      add2: /^(.{2,}?)(?:って|と|を)(?:覚えて|おぼえて)(?:おいて)?(?:ね|ください|下さい)?[。!！]?$/u,
      del: /^(?:忘れて|わすれて)(?:ね|ください|下さい)?[:：、,\s]+(.+)$/u,
      list: /^(?:何を|なにを)?(?:覚えてる|おぼえてる|覚えていること|覚えてること|記憶を見せて)[？?。]*$/u
    };
    function memCmd(raw) {
      const q = String(raw || '').trim(), n = nickName();
      let m;
      if ((m = RE_MEM.add.exec(q) || RE_MEM.add2.exec(q))) {
        const ok = memAdd(m[1].replace(/[。．]+$/u, ''));
        return Object.assign(reply(ok ? "('-' 鰤)з👑✨ 覚えたよ、" + n + '。\n「' + m[1].replace(/[。．]+$/u, '') + '」\n次からの答えに活かすね。' : "('-' 鰤)з♪ それはもう覚えてるよ、" + n + '。', [], [], []), { mood: 'proud', learned: true });
      }
      if ((m = RE_MEM.del.exec(q))) {
        const k = memDel(m[1].replace(/[。．]+$/u, ''));
        return Object.assign(reply(k ? "('-' 鰤)з💧 わかった、忘れたよ（" + k + ' 件）。' : "('-' 鰤)з… 「" + m[1] + '」は覚えていなかったみたい。', [], [], []), { mood: k ? 'sad' : 'think', learned: true });
      }
      if (RE_MEM.list.test(q)) {
        const mm = memGet(), lines = mm.notes.slice(0, 12).map((x) => '・' + x.t), tp = topTopics(5);
        if (tp.length) lines.push('・よく話す話題: ' + tp.join('、'));
        return Object.assign(reply(lines.length ? "('-' 鰤)з♪ " + n + 'について覚えていること:\n' + lines.join('\n') : "('-' 鰤)з… まだ何も覚えていないよ。「覚えて：〜」で教えてね。", [], [], []), { mood: 'satisfied', learned: true });
      }
      return null;
    }
    const tagOf = (t) => { const m = /\[\[\s*mood\s*:\s*([a-z]+)\s*\]\]/i.exec(t || ''); return m ? m[1].toLowerCase() : ''; };
    /* v67: 出典の印は文の途中に入れない — 文ごとに集めて句点の直後へ（同じ印は 1 つに・1 文 3 つまで） */
    const CITE_RE = /\s*(?:\[((?:[NW]\d+)(?:\s*[,，、]\s*[NW]?\d+)*)\]|【([NW]\d+)】)/g;
    function fixCites(text) {
      const grab = (str, into) => str.replace(CITE_RE, (m, a, b) => { let kind = 'N'; (a || b).split(/\s*[,，、]\s*/).forEach((tk) => { const mm = /^([NW]?)(\d+)$/.exec(tk); if (!mm) return; kind = mm[1] || kind; const k = kind + mm[2]; if (!into.includes(k)) into.push(k); }); return ''; });
      return String(text || '').split('\n').map((line) => {
        if (!/\[[NW]\d|【[NW]\d/.test(line)) return line;
        const head = /^(\s*(?:[・\-*•]|\d+[.)．]|#{1,4})\s*)/.exec(line);
        const pre = head ? head[1] : '';
        const segs = line.slice(pre.length).split(/(?<=[。！？!?])/u).map((t) => ({ t, ids: [] }));
        segs.forEach((sg, i) => {
          /* 文の頭に来た印は、前の文のもの */
          const lead = /^(?:\s*(?:\[(?:[NW]\d+)(?:\s*[,，、]\s*[NW]?\d+)*\]|【[NW]\d+】))+/.exec(sg.t);
          if (lead && i > 0) { grab(lead[0], segs[i - 1].ids); sg.t = sg.t.slice(lead[0].length); }
          sg.t = grab(sg.t, sg.ids);
        });
        return pre + segs.map((sg) => { const t = sg.t.replace(/[ \t]+([。！？!?、，])/g, '$1').replace(/([^\x00-\x7f]) +(?=[^\x00-\x7f\s])/g, '$1'); if (!sg.ids.length) return t; const m = /^([\s\S]*?)(\s*)$/.exec(t); return m[1] + '[' + sg.ids.slice(0, 3).join(',') + ']' + m[2]; }).join('');
      }).join('\n');
    }
    /* v67: AI が考えた「次に聞けそうなこと」— [[next: a | b | c]] を拾って画面のボタンに */
    const nextOf = (t) => { const m = /\[\[\s*next\s*[:：]\s*([^\]]+)\]\]/i.exec(t || ''); return m ? m[1].split(/\s*[|｜]\s*/).map((x) => x.trim().replace(/^[「『]|[」』]$/g, '')).filter((x) => x && x.length <= 40).slice(0, 3) : []; };
    const untag = (t) => String(t || '').replace(/\[\[\s*mood\s*:\s*[a-z]+\s*\]\]\s*/ig, '').replace(/\[\[\s*next\s*[:：][^\]]*\]\]\s*/ig, '').trim();
    function sourcesText(nh, wh, shelf, hint) {
      let t = '';
      const sh = shelf.slice(0, 8).map((r, i) => '[N' + (i + 1) + '] 本棚: ' + r.title + (r.author ? '／著者 ' + r.author : '') + (r.series ? '／シリーズ ' + r.series + (r.seq ? '（' + r.seq + '）' : '') : '') + (r.status ? '／状態 ' + r.status : '') + (r.synopsis ? '／あらすじ ' + String(r.synopsis).slice(0, 200) : ''));
      const nn = nh.map((x, i) => '[N' + (sh.length + i + 1) + '] Notion: ' + x.title + (x.snippet ? '／' + x.snippet.slice(0, 240) : ''));
      const ww = wh.map((x, i) => '[W' + (i + 1) + '] ' + x.title + '／' + x.snippet + '（' + x.url + '）');
      t += '# Notion の検索結果・本棚\n' + (sh.concat(nn).join('\n') || '（なし）') + '\n\n# Web の検索結果\n' + (ww.join('\n') || '（なし・または Web 検索を切っている）');
      if (hint) t += '\n\n# 本棚の機械的な照合の結果（参考。言い回しはまねず、中身だけ使う）\n' + String(hint).slice(0, 600);
      return t;
    }
    /* v52: どの AI も「system と会話（turns）」を渡して文章を返す同じ形にそろえる（MoA で混ぜるため） */
    async function claudeChat(sys, turns, maxTok) {
      const r = await gmReq({
        method: 'POST', url: 'https://api.anthropic.com/v1/messages',
        headers: { 'content-type': 'application/json', 'x-api-key': AI.key, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'server-side-fallback-2026-07-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        data: JSON.stringify({ model: AI.model, max_tokens: Math.max(1024, maxTok || 4000), system: sys, messages: turns, output_config: { effort: 'low' }, fallbacks: 'default' })
      });
      let j = null; try { j = JSON.parse(r.text); } catch (e) { /* noop */ }
      if (!j) return { err: r.err || ('応答を読めませんでした（' + r.status + '）') };
      if (j.type === 'error' || r.status >= 400) return { err: (j.error && j.error.message) || ('エラー ' + r.status) };
      if (j.stop_reason === 'refusal') return { err: 'この質問には答えられないと判断されました。' };
      const text = (j.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
      return text ? { text, model: j.model || AI.model } : { err: '空の返事でした' };
    }
    async function geminiChat(sys, turns, maxTok) {
      const contents = turns.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      return geminiRun({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: { maxOutputTokens: Math.max(2048, maxTok || 8192), temperature: 0.5 } });
    }
    /* v51: 使えるモデルは鍵ごとに違う → Google に一覧を聞いて選ぶ。だめだったモデルはしばらく避ける（無料枠 0 は 1 日・回数切れは 1 分〜6 時間） */
    const GEMINI_FALLBACK = ['gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
    let gemList = null, gemLast = '';
    async function gemModels() {
      if (gemList) return gemList;
      const mc = gmGet('c33.buri.ml.gemini', null);
      if (mc && mc.at > Date.now() - 432e5 && Array.isArray(mc.ids) && mc.ids.length) return (gemList = mc.ids);
      const r = await gmReq({ method: 'GET', timeout: 15000, url: 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', headers: { 'x-goog-api-key': AI.gkey } });
      try {
        const names = (JSON.parse(r.text).models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
          .map((m) => String(m.name).replace(/^models\//, '')).filter((n) => /^gemini-/.test(n) && !/(image|tts|audio|live|embed|robotics|computer|native|exp|learnlm)/.test(n));
        if (r.status === 200) { gemList = names; if (names.length) gmSet('c33.buri.ml.gemini', { at: Date.now(), ids: names }); }
        return names;
      } catch (e) { return []; }
    }
    const gemVer = (n) => parseFloat((/gemini-(\d+(?:\.\d+)?)/.exec(n) || [])[1] || 0);
    const gemKind = (n) => /pro/.test(n) ? 'pro' : /lite/.test(n) ? 'lite' : /flash/.test(n) ? 'flash' : 'other';
    function gemRank(names, mode) {
      const late = (n) => (/preview/.test(n) ? 1 : 0) + (/latest/.test(n) ? 2 : 0);
      const by = (k) => names.filter((n) => gemKind(n) === k).sort((a, b) => gemVer(b) - gemVer(a) || late(a) - late(b));
      return (mode === 'pro' ? ['pro', 'flash', 'lite'] : mode === 'lite' ? ['lite', 'flash'] : ['flash', 'lite']).flatMap(by);
    }
    const gemBad = () => { const b = gmGet('c33.buri.gbad', {}) || {}; return typeof b === 'object' ? b : {}; };
    function gemMark(model, ms) { const b = gemBad(), now = Date.now(); for (const k of Object.keys(b)) if (b[k] < now) delete b[k]; b[model] = now + ms; gmSet('c33.buri.gbad', b); }
    async function geminiRun(body) {
      const mode = /^gemini-/.test(AI.gmodel) ? 'auto' : (AI.gmodel || 'auto');
      const bad = gemBad(), now = Date.now();
      const listed = await gemModels();
      const order = [...new Set([/^gemini-/.test(AI.gmodel) ? AI.gmodel : '', ...gemRank(listed, mode), ...GEMINI_FALLBACK].filter(Boolean))]
        .filter((m) => !(bad[m] > now)).slice(0, 6);
      if (!order.length) return { err: '使えるモデルが一時的にありません（無料枠の回数切れ）。しばらくしてからどうぞ（お金はかかりません）', detail: Object.entries(bad).map(([m, t]) => m + ' → ' + new Date(t).toLocaleTimeString() + ' まで休み').join('\n') };
      const fails = [];
      for (const model of order) {
        const r = await gmReq({ method: 'POST', timeout: 90000, url: 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': AI.gkey }, data: JSON.stringify(body) });
        let j = null; try { j = JSON.parse(r.text); } catch (e) { /* noop */ }
        const msg = (j && j.error && j.error.message) || r.err || ('HTTP ' + r.status);
        if (r.status === 200 && j) {
          const c = (j.candidates || [])[0];
          const text = c && c.content && (c.content.parts || []).filter((x) => !x.thought).map((x) => x.text || '').join('').trim();
          if (text) { gemLast = model; if (gmGet('c33.buri.gok', '') !== model) gmSet('c33.buri.gok', model); return { text, model }; }
          if (j.promptFeedback && j.promptFeedback.blockReason) return { err: 'この質問には答えられないと判断されました' };
          fails.push({ model, status: 200, msg: '空の返事' }); continue;
        }
        fails.push({ model, status: r.status, msg });
        if (/API key not valid|API_KEY_INVALID/i.test(msg)) return { err: '鍵が正しくないようです。AI Studio の鍵（AIza で始まる）をもう一度貼ってください', detail: msg };
        if (r.status === 403) return { err: 'この鍵では Gemini を使えないようです（AI Studio で作った鍵か確かめてください）', detail: msg };
        if (/location is not supported/i.test(msg)) return { err: 'いまの接続先の地域では Gemini の無料枠が使えないようです', detail: msg };
        if (r.status === 0) return { err: 'Google につながりませんでした（' + msg + '）', detail: msg };
        if (r.status === 429) gemMark(model, /limit:\s*0\b/i.test(msg) ? 864e5 : /per\s*day|PerDay|daily/i.test(msg) ? 216e5 : 6e4);
        else if (r.status === 404) gemMark(model, 6048e5);
      }
      cool('c33.buri.pbad', 'gemini', fails.some((f) => f.status === 429) ? 36e5 : 0);
      const all = fails.map((f) => f.model + ' → ' + f.status + ' ' + String(f.msg).slice(0, 160)).join('\n');
      const zero = fails.length && fails.every((f) => /limit:\s*0\b/i.test(f.msg));
      const quota = fails.some((f) => f.status === 429);
      return { err: zero ? 'この鍵の Google プロジェクトには無料枠が付いていないようです。AI Studio で「新しいプロジェクトで API キーを作成」して貼り直してみてください（お金はかかりません）'
        : quota ? '無料枠の回数に当たりました。少しおいてからもう一度どうぞ（お金はかかりません）'
        : 'Gemini から返事がありませんでした', detail: all };
    }
    async function aiTest(id) {
      id = id || AI.provider;
      if (id === 'none') return { err: 'AI を使わない設定です' };
      if (!ready(id)) return { err: id === 'chrome' ? 'この Chrome では内蔵 AI が見つかりません' : '鍵がまだ入っていません' };
      cool('c33.buri.pbad', id, 0);   // 試す時は休みを解く
      return chat(id, 'あなたは接続テストの相手です。', [{ role: 'user', content: '「つながりました」とだけ返してください。' }], 256);
    }
    /* v49: Chrome 内蔵 AI（Prompt API / Gemini Nano）— 無料・鍵なし・端末の中だけで動く。読める量が少ないので根拠を短くして渡す */
    let lastAiErr = '';
    async function chromeChat(sys, turns) {
      const LM = chromeLM();
      if (!LM) return { err: 'この Chrome では内蔵 AI が使えません（新しい Chrome とある程度の性能の PC が要ります）' };
      try {
        const opt = { expectedInputs: [{ type: 'text', languages: ['ja', 'en'] }], expectedOutputs: [{ type: 'text', languages: ['ja'] }] };
        if (typeof LM.availability === 'function') { const av = await LM.availability(opt); if (av === 'unavailable') return { err: 'この端末では Chrome 内蔵 AI が使えません' }; }
        const prev = turns.slice(0, -1).slice(-4).map((m) => ({ role: m.role, content: String(m.content).slice(0, 800) }));
        const sess = await LM.create(Object.assign({ initialPrompts: [{ role: 'system', content: sys }].concat(prev) }, opt));
        const text = String(await sess.prompt(String(turns[turns.length - 1].content).slice(0, 4000)) || '').trim();
        try { sess.destroy && sess.destroy(); } catch (e) { /* noop */ }
        return text ? { text, model: 'Gemini Nano' } : { err: '空の返事でした' };
      } catch (e) { return { err: (e && e.message) || 'Chrome 内蔵 AI が動きませんでした（初回はモデルのダウンロード待ちのことがあります）' }; }
    }
    /* v52: OpenAI 互換の無料 AI（Groq・OpenRouter・NVIDIA・Z.ai）— 鍵で使えるモデルの一覧を聞いて、良さそうな順に試す */
    const oaiList = {};
    async function oaiModels(id) {
      const T = TEAM[id];
      if (T.fixedOnly) return T.fixed.slice();   // 無料と確かめたモデルだけ（一覧に出る有料モデルは使わない）
      if (oaiList[id]) return oaiList[id];
      const mc = gmGet('c33.buri.ml.' + id, null);   // v57: モデル一覧は 12 時間覚えておく（毎回の問い合わせを省いて速く）
      if (mc && mc.at > Date.now() - 432e5 && Array.isArray(mc.ids) && mc.ids.length) return (oaiList[id] = mc.ids);
      const r = await gmReq({ method: 'GET', timeout: 15000, url: T.base + '/models', headers: Object.assign({ Authorization: 'Bearer ' + AI.keys[id] }, T.headers || {}) });
      let ids = [];
      try {
        const j = JSON.parse(r.text); const arr = Array.isArray(j) ? j : (j.data || j.models || []);
        ids = arr.filter((m) => !T.freeOnly || /:free$/.test(m.id) || (m.pricing && Number(m.pricing.prompt) === 0 && Number(m.pricing.completion) === 0))
          .filter((m) => !T.onlyRe || T.onlyRe.test(String(m.id || m.name).toLowerCase()))
          .filter((m) => !m.capabilities || m.capabilities.completion_chat !== false)
          .map((m) => String(m.id || m.name)).filter((n) => n && !(T.skip && T.skip.test(n.toLowerCase())));
      } catch (e) { /* noop */ }
      if (r.status === 200 && ids.length) { oaiList[id] = ids; gmSet('c33.buri.ml.' + id, { at: Date.now(), ids }); }
      if (!ids.length && T.fixed && r.status !== 401 && r.status !== 403) return T.fixed.slice();   // 一覧を出さない所は既知の無料モデルで
      return ids;
    }
    function oaiRank(id, ids) {
      const T = TEAM[id], out = [];
      for (const re of T.prefer) for (const n of ids) if (re.test(n.toLowerCase()) && !out.includes(n)) out.push(n);
      if (!T.strict) for (const n of ids) if (!out.includes(n)) out.push(n);   // v55: OpenRouter は強いと分かっている無料モデルだけ（小さいモデルは混乱しやすい）
      const ok = gmGet('c33.buri.m.' + id, '');
      return [...new Set([ok && ids.includes(ok) ? ok : '', ...out].filter(Boolean))];
    }
    const stripThink = (t) => String(t || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    async function oaiChat(id, sys, turns, maxTok) {
      const T = TEAM[id];
      const all = oaiRank(id, await oaiModels(id));
      const models = all.filter((m) => !mBad(id, m)).slice(0, 3);
      if (!models.length) { cool('c33.buri.pbad', id, all.length ? 36e5 : 0); return { err: all.length ? '無料で使えるモデルがいま休み中です（しばらくして自動で戻ります）' : '使えるモデルが見つかりませんでした（鍵を確かめてください）' }; }
      const kinds = [];
      const fails = [];
      for (const model of models) {
        const r = await gmReq({ method: 'POST', timeout: T.timeout || 90000, url: T.base + '/chat/completions',
          headers: Object.assign({ 'content-type': 'application/json', Authorization: 'Bearer ' + AI.keys[id] }, T.headers || {}),
          data: JSON.stringify({ model, messages: [{ role: 'system', content: sys }].concat(turns), max_tokens: Math.max(maxTok || 2000, T.maxTok || 0), temperature: 0.5 }) });
        let j = null; try { j = JSON.parse(r.text); } catch (e) { /* noop */ }
        const msg = (j && j.error && (j.error.message || j.error)) || r.err || ('HTTP ' + r.status);
        if (r.status === 200 && j && j.choices && j.choices[0]) {
          const text = stripThink(j.choices[0].message && j.choices[0].message.content);
          if (text) { if (gmGet('c33.buri.m.' + id, '') !== model) gmSet('c33.buri.m.' + id, model); return { text, model }; }
        }
        const kind = failKind(r.status, msg); kinds.push(kind);
        fails.push(model + ' → ' + r.status + ' ' + String(msg).slice(0, 140) + (kind === 'paid' ? '（有料のモデル → 以後使いません）' : ''));
        if (r.status === 401 || r.status === 403) return { err: '鍵が正しくないようです', detail: fails.join('\n') };
        if (r.status === 0) { cool('c33.buri.pbad', id, COOL_MS.down); return { err: 'つながりませんでした（' + msg + '）', detail: fails.join('\n') }; }
        if (COOL_MS[kind]) cool('c33.buri.mbad', id + ':' + model, COOL_MS[kind]);
      }
      const worst = kinds.includes('day') ? 'day' : kinds.every((k) => k === 'paid') ? 'paid' : kinds.includes('rate') ? 'rate' : 'down';
      cool('c33.buri.pbad', id, worst === 'paid' ? 36e5 : COOL_MS[worst]);
      return { err: worst === 'paid' ? '無料で使えるモデルがありませんでした（有料のモデルは自動で外しました）' : worst === 'day' ? '今日の無料枠を使い切りました（自動で外し、明日戻ります）' : worst === 'rate' ? '混んでいます（少しして自動で戻ります）' : '返事がありませんでした', detail: fails.join('\n') };
    }
    /* v53: Cohere（試用キーは無料・月 1,000 回）— Cohere 独自の v2/chat */
    async function cohereChat(sys, turns, maxTok) {
      const H = { 'content-type': 'application/json', Authorization: 'Bearer ' + AI.keys.cohere, accept: 'application/json' };
      if (!oaiList.cohere) {
        const r = await gmReq({ method: 'GET', timeout: 15000, url: 'https://api.cohere.com/v1/models?endpoint=chat&page_size=100', headers: H });
        try { const names = (JSON.parse(r.text).models || []).map((m) => String(m.name)).filter((n) => /^command/.test(n)); if (names.length) oaiList.cohere = names; } catch (e) { /* noop */ }
      }
      const models = oaiRank('cohere', oaiList.cohere || ['command-a-03-2025', 'command-r-plus-08-2024']).slice(0, 2);
      const fails = [];
      for (const model of models) {
        const r = await gmReq({ method: 'POST', timeout: 90000, url: 'https://api.cohere.com/v2/chat', headers: H,
          data: JSON.stringify({ model, messages: [{ role: 'system', content: sys }].concat(turns), max_tokens: maxTok || 2000, temperature: 0.5 }) });
        let j = null; try { j = JSON.parse(r.text); } catch (e) { /* noop */ }
        if (r.status === 200 && j && j.message) {
          const text = stripThink((j.message.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').trim());
          if (text) { if (gmGet('c33.buri.m.cohere', '') !== model) gmSet('c33.buri.m.cohere', model); return { text, model }; }
        }
        const msg = (j && (j.message && typeof j.message === 'string' ? j.message : j.error)) || r.err || ('HTTP ' + r.status);
        fails.push(model + ' → ' + r.status + ' ' + String(msg).slice(0, 140));
        if (r.status === 401 || r.status === 403) return { err: '鍵が正しくないようです', detail: fails.join('\n') };
        if (r.status === 0) return { err: 'つながりませんでした', detail: fails.join('\n') };
      }
      return { err: fails.some((f) => / 429 /.test(f)) ? '試用の回数に当たりました' : '返事がありませんでした', detail: fails.join('\n') };
    }
    function chat(id, sys, turns, maxTok) {
      if (id === 'cohere') return cohereChat(sys, turns, maxTok);
      if (id === 'gemini') return geminiChat(sys, turns, maxTok);
      if (id === 'claude') return claudeChat(sys, turns, maxTok);
      if (id === 'chrome') return chromeChat(sys, turns, maxTok);
      if (TEAM[id] && TEAM[id].base) return oaiChat(id, sys, turns, maxTok);
      return Promise.resolve({ err: 'AI を使わない設定です' });
    }
    const AGG = [
      '',
      '# いまの役目: まとめ役（MoA の最後の一人）',
      '・下に、ほかの AI（仲間）が同じ質問に書いた「下書き」がある。',
      '・下書きを根拠（Notion・本棚・Web の検索結果）と照らし合わせ、正しい点を合わせ、根拠に無いことや誤りは捨てて、ひとつの最良の答えを書く。',
      '・下書きどうしが食い違う時は根拠に従う。根拠で決められなければ両方を示す。',
      '・出典番号 [N1] [W2] は、根拠に本当に合うものだけを残し、文の終わり（句点の直後）にまとめる。文の途中には入れない。',
      '・「下書き A によると」「Web 結果によると」などの舞台裏は書かない。B.U.R.I として、答えだけを話す。',
      '・下書きの言い回しはまねない。中身だけを使い、上の「日本語の書き方」で、読みやすく自然な日本語に書き直す。',
      '・構成: いちばん知りたい答えを最初の 1〜2 文で → 補足 → 最後に短い一言（問いかけは 1 つまで）。'
    ].join('\n');
    /* v52: MoA — 仲間がそれぞれ下書き → メイン（まとめ役）が根拠と照らして一つにする。仲間が 1 人なら普通に答える
     * v55: まとめ役は下書きを書かない（Gemini の少ない無料回数を 1 回で済ませ、遅さで時間切れにもならない）。
     *      下書き役には前の答えを見せず「これまでの話題」だけ渡す（前の答えにつられて謝ったり混同したりしないように）。質問の意図も渡す */
    async function askAI(question, ctxText, plan) {
      const intent = plan && plan.intent ? '\n\n# 質問の意図（会話の流れから）\n' + plan.intent : '';
      const now = new Date();
      const today = '\n\n# 今日\n' + now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日（' + '日月火水木金土'[now.getDay()] + '）';
      const userMsg = ctxText + intent + today + '\n\n# 質問\n' + question;
      const t = team();
      const done = (r, extra) => { if (r.text) { r.mood = tagOf(r.text) || r.mood || ''; r.next = nextOf(r.text); r.text = fixCites(untag(r.text)); aiHist.push({ role: 'user', content: question }, { role: 'assistant', content: r.text }); } return Object.assign(r, extra || {}); };
      if (!moaOn()) {
        const id = ready(AI.provider) && !pBad(AI.provider) ? AI.provider : t[0];
        prog({ k: 'draft', id, st: 'run' });
        const r = await chat(id, sysP(), aiHist.slice(-6).concat([{ role: 'user', content: userMsg }]));
        prog({ k: 'draft', id, st: r.text ? 'ok' : 'ng', model: r.model, err: r.err });
        return done(r, { who: id });
      }
      /* v67: まとめ役は選べる。既定（auto）は NVIDIA（いちばん強い・時間で切らない）→ 無ければメイン */
      const aggPref = AI.agg === 'main' ? [AI.provider] : AI.agg && AI.agg !== 'auto' ? [AI.agg, AI.provider] : ['nvidia', AI.provider];
      const aggId = [...aggPref, ...t].find((id) => id && TEAM[id] && ready(id) && id !== 'chrome' && !pBad(id)) || t[0];
      let drafters = t.filter((id) => id !== aggId);
      if (drafters.length < 2) drafters = t.slice();
      const topics = aiHist.filter((m) => m.role === 'user').slice(-3).map((m) => String(m.content).slice(0, 60));
      const draftTurns = [{ role: 'user', content: (topics.length ? '（これまでの話題: ' + topics.join(' → ') + '）\n\n' : '') + userMsg }];
      drafters.forEach((id) => prog({ k: 'draft', id, st: 'run' }));
      /* v53: 遅い仲間を待ちすぎない — 2 人そろったら最大 10 秒だけ待ち、全体は 45 秒まで。間に合わない仲間は今回は外す
       * v57: NVIDIA（いちばん強い仲間）は時間で切らない。つながらない・エラーの時だけ外す（待つ間に届いた他の仲間の下書きも使う） */
      const sys0 = sysP();
      const drafts = await new Promise((resolve) => {
        const res = drafters.map((id) => ({ id, err: '時間切れ（今回は外しました）' })); let left = drafters.length, okN = 0, fin = false, grace = 0, soft = false;
        const patientLeft = () => res.some((d) => !d.done && TEAM[d.id] && TEAM[d.id].patient);
        const end = () => { if (fin) return; fin = true; clearTimeout(grace); clearTimeout(hard); res.forEach((d) => { if (!d.text && !d.done) prog({ k: 'draft', id: d.id, st: 'ng', err: d.err }); }); resolve(res.map((d) => Object.assign({}, d))); };
        const cut = () => {
          if (fin) return;
          if (!patientLeft()) { end(); return; }
          soft = true;
          res.forEach((d) => { if (!d.done && TEAM[d.id] && TEAM[d.id].patient) prog({ k: 'draft', id: d.id, st: 'run', note: 'じっくり考え中 — 待っています' }); });
        };
        const hard = setTimeout(cut, 45000);
        drafters.forEach((id, i) => chat(id, sys0, draftTurns, 1500).catch((e) => ({ err: String(e && e.message || e) })).then((r) => {
          if (fin) return;
          res[i] = Object.assign({ id, done: true }, r);
          prog({ k: 'draft', id, st: r.text ? 'ok' : 'ng', model: r.model, err: r.err });
          if (r.text && ++okN === 2) grace = setTimeout(cut, 10000);
          if (--left === 0 || (soft && !patientLeft())) end();
        }));
      });
      drafts.forEach((d) => { if (d.text) { d.mood = tagOf(d.text); d.text = untag(d.text); } });
      const good = drafts.filter((d) => d.text);
      if (!good.length) {
        /* 下書きが全滅 → まとめ役が自分で答える */
        prog({ k: 'draft', id: aggId, st: 'run' });
        const r0 = await chat(aggId, sysP(), aiHist.slice(-6).concat([{ role: 'user', content: userMsg }]));
        prog({ k: 'draft', id: aggId, st: r0.text ? 'ok' : 'ng', model: r0.model, err: r0.err });
        if (r0.text) return done(r0, { drafts, who: aggId });
        return { err: drafts.map((d) => TEAM[d.id].name + ': ' + d.err).join(' / '), detail: drafts.map((d) => TEAM[d.id].name + ' → ' + (d.detail || d.err)).join('\n'), drafts };
      }
      prog({ k: 'merge', id: aggId, st: 'run' });
      const mergeTurns = aiHist.slice(-4).concat([{ role: 'user', content: userMsg + '\n\n# 仲間の下書き（' + good.length + ' 人）\n' + good.map((d, i) => '## 下書き ' + 'ABCDEFG'[i] + '\n' + d.text).join('\n\n') + '\n\n上の下書きを根拠と照らして、質問の意図にまっすぐ答える、ひとつの最良の答えにしてください。' }]);
      const r = await chat(aggId, sysP() + '\n' + AGG, mergeTurns, 3000);
      prog({ k: 'merge', id: aggId, st: r.text ? 'ok' : 'ng', model: r.model, err: r.err });
      if (r.text) return done({ text: r.text, model: r.model }, { drafts, who: aggId, merged: true });
      const best = good.slice().sort((a, b) => b.text.length - a.text.length)[0];
      return done({ text: best.text, model: best.model }, { drafts, who: best.id });
    }
    /* v77: ひと言 AI（ぶりレンズ・おかえり要約）— 相談はせず、速い順に 1 人だけ。つまずいたら次の仲間（3 人まで） */
    async function quick(sys, user, maxTok, raw) {
      const order = [];
      for (const id of ['groq', 'gemini', AI.provider, 'nvidia', 'openrouter', 'zai', 'cohere', 'claude', 'chrome', ...team()]) {
        if (!id || order.includes(id) || !TEAM[id] || !ready(id) || pBad(id)) continue;
        if (!AI.use[id] && id !== AI.provider) continue;
        order.push(id);
      }
      let last = '';
      for (const id of order.slice(0, 3)) {
        const r = await chat(id, sys, [{ role: 'user', content: user }], maxTok || 900).catch((e) => ({ err: String(e && e.message || e) }));
        if (r && r.text) return { text: raw ? String(r.text).trim() : fixCites(untag(r.text)).trim(), who: id, name: TEAM[id].name, model: r.model || '' };
        last = TEAM[id].name + ': ' + ((r && r.err) || '答えが空でした');
      }
      return { err: last || 'AI がつながっていません（⚙ で鍵を入れてください）' };
    }
    /* v97: 相談（Telescopium のレンズ）— 鍵の入った仲間のうち n 人に同じ問いを同時に出し、それぞれの答えをそのまま返す */
    async function multi(sys, user, maxTok, n) {
      const ids = [];
      for (const id of [...team(), AI.provider, 'groq', 'gemini', 'nvidia', 'openrouter']) { if (id && !ids.includes(id) && TEAM[id] && ready(id) && !pBad(id) && (AI.use[id] || id === AI.provider)) ids.push(id); }
      const pick = ids.slice(0, Math.max(1, n || 3));
      return Promise.all(pick.map((id) => chat(id, sys, [{ role: 'user', content: user }], maxTok || 1200).then((r) => ({ id, name: TEAM[id].name, text: r && r.text ? String(r.text).trim() : '', err: r && r.err || '' })).catch((e) => ({ id, name: TEAM[id].name, text: '', err: String(e && e.message || e) }))));
    }
    /* v77: おかえりハイライトの「前回から変わった所」を ⌘K でも聞ける */
    let deltaFn = null;
    const RE_DELTA = /(前回|前に見た|この前|留守|いない間|離れてた|見てない間).{0,12}(変わ|増え|更新|書き換)|(変わった|増えた|更新された)(所|ところ|点|段|部分)/u;
    async function askDelta(raw) {
      const p = deltaFn && deltaFn();
      if (!p) return Object.assign(reply("('-' 鰤)з♪ このページは、前に見た時から変わった所は見つからなかったよ。", [], [], []), { mood: 'satisfied' });
      const url = location.origin + location.pathname + location.search;
      const refs = { N: [{ title: p.title, url }], W: [] };
      const ctx = '# いま開いているページ [N1]\nタイトル: ' + p.title + '\n\n# ' + nickName() + 'が前に見た時（' + p.since + '）から、変わった・増えた段\n' + p.items.map((x) => (x.kind === 'new' ? '［新しい段］' : '［書き換わった段］') + x.text).join('\n');
      if (aiOn()) {
        const r = await askAI(raw, ctx, { intent: '前に見た時から、このページの何が変わったのかを知りたい（大事な変化から短く）' });
        if (r.text) return Object.assign(reply(r.text, [{ title: p.title, url, type: 'Notion のページ' }], (r.next || []).map((x) => ({ label: x, q: x })), [], raw), { refs, mood: r.mood || 'back', moa: r.drafts ? { drafts: (r.drafts || []).map((d) => ({ id: d.id, name: TEAM[d.id].name, model: d.model || '', text: d.text || '', err: d.err || '' })), who: r.who ? TEAM[r.who].name : '', model: r.model || '', merged: !!r.merged } : null });
      }
      return Object.assign(reply("('-' 🐋)з ('-' 鰤)з♥ おかえりなさい。" + p.since + 'から ' + p.items.length + ' か所 変わっているよ。[N1]\n' + p.items.slice(0, 8).map((x) => '・' + (x.kind === 'new' ? '（新）' : '') + x.text.slice(0, 80)).join('\n'), [], [], [], raw), { refs, mood: 'back' });
    }
    /* v55: 会話を読んで「本当に調べるべき言葉」を作る（「調べて。」「もっと詳しく」「どんなお話？」を前の話題で補う） */
    const waitMs = (ms) => new Promise((r) => setTimeout(r, ms));
    const PLAN_SYS = [
      'あなたは検索係です。会話の流れを読み、利用者の「次の発言」が本当に知りたいことを、Google で検索するための独立した検索語にします。',
      '・「調べて」「もっと詳しく」「それ」「どんな話？」などは、前の話題で補う（例: 前が「お隣の天使様」なら「お隣の天使様にいつの間にか駄目人間にされていた件 あらすじ」）。',
      '・作品名・人名は分かる範囲で正式な名前にする。15〜40 字。',
      '・必ず JSON だけを出力する: {"q":"検索語","alt":"別の角度の検索語（あらすじ・作品一覧・評判など。不要なら空）","intent":"利用者が知りたいことを一文で"}'
    ].join('\n');
    const FOLLOW = /^(調べて|しらべて|詳しく|くわしく|もっと|他に|ほかに|それ|その|あれ|この|続き|つづき|次|なんで|なぜ|どうして|本当|ほんと|じゃあ|では|で$)/u;
    let lastTopic = '';
    const stripQ = (raw) => String(raw || '').replace(/(について)?(教えて|おしえて|知りたい|調べて|しらべて|って何|ってなに|とは|は\?|は？)/g, ' ').replace(/[。．？?！!、,]+/g, ' ').replace(/\s+/g, ' ').trim();
    async function planQuery(raw) {
      const base = stripQ(raw);
      const thin = base.replace(/[\s\p{P}\p{S}]/gu, '').length < 2 || FOLLOW.test(base);
      let plan = { q: thin && lastTopic ? (lastTopic + ' ' + base).trim() : (base || raw), alt: '', intent: '', by: '' };
      const pid = ['groq', 'nvidia', 'openrouter', 'gemini'].find((id) => ready(id) && !pBad(id));
      if (pid) {
        prog({ k: 'plan', st: 'run' });
        const hist = aiHist.slice(-4).map((m) => (m.role === 'user' ? '利用者: ' : 'B.U.R.I: ') + String(m.content).replace(/\s+/g, ' ').slice(0, 160)).join('\n');
        const r = await Promise.race([chat(pid, PLAN_SYS, [{ role: 'user', content: (hist ? '# これまでの会話\n' + hist + '\n\n' : '') + '# 次の発言\n' + raw }], 1200), waitMs(9000).then(() => ({ err: '時間切れ' }))]);
        const m = r.text && /\{[\s\S]*\}/.exec(r.text);
        if (m) { try { const j = JSON.parse(m[0]); if (j.q && String(j.q).trim()) plan = { q: String(j.q).trim().slice(0, 80), alt: String(j.alt || '').trim().slice(0, 80), intent: String(j.intent || '').trim().slice(0, 160), by: TEAM[pid].name }; } catch (e) { /* noop */ } }
        prog({ k: 'plan', st: 'ok', q: plan.q, alt: plan.alt });
      }
      lastTopic = plan.q;
      return plan;
    }
    function firstSentence(s) { const t = String(s || '').replace(/\s+/g, ' ').trim(); const m = /^(.{20,160}?[。．！？!?])/.exec(t); return m ? m[1] : t.slice(0, 120) + (t.length > 120 ? '…' : ''); }
    /* v50: 「お隣の天使様 − 1」「− 2」… を「お隣の天使様（5 冊）」のようにまとめる */
    const baseTitle = (t) => String(t || '').replace(/\s*[−\-–—ー～~]\s*[0-9０-９.．]+\s*(巻|話)?\s*$/u, '').replace(/\s*[（(][0-9０-９]+[)）]\s*$/u, '').trim();
    function compact(titles, n) {
      const m = new Map();
      for (const t of titles) { const b = baseTitle(t) || t; m.set(b, (m.get(b) || 0) + 1); }
      const parts = [...m].map(([b, c]) => '「' + b + '」' + (c > 1 ? '（' + c + ' 冊）' : ''));
      return parts.slice(0, n).join('・') + (parts.length > n ? ' ほか' : '');
    }
    let LOCAL_ONLY = false, lastCand = [];
    /* v57: 速く — 同じ言葉の検索は 10 分覚えておく（もう一度・続けて聞く時に待たない） */
    const memo = (fn) => { const m = new Map(); return (...a) => { const k = JSON.stringify(a), h = m.get(k); if (h && Date.now() - h.at < 6e5) return h.p; const pr = Promise.resolve(fn(...a)).then((r) => { if (!r || !r.length) m.delete(k); return r; }, () => { m.delete(k); return []; }); m.set(k, { at: Date.now(), p: pr }); if (m.size > 40) m.delete(m.keys().next().value); return pr; }; };
    const nSearch = memo(notionSearch), gSearch = memo(googleSearch), wSearch = memo(wikiSearch);
    async function deep(raw, shelf, baseCards, baseChips, hint) {
      if (LOCAL_ONLY) return { __deep: true, shelf: shelf || [], cards: baseCards || [], chips: baseChips };
      /* v57: 速く — 元の言葉での Notion 検索は、検索語を考えている間に先に始めておく */
      const core = stripQ(raw);
      const coreN = core && core.length >= 2 ? nSearch(core) : Promise.resolve([]);
      const plan = aiOn() ? await planQuery(raw) : { q: core || raw, alt: '' };
      const q = plan.q;
      prog({ k: 'search', q });
      const [nh0, gh, kh, gh2, nh1] = await Promise.all([q === core ? coreN : nSearch(q), gSearch(q), wSearch(q, true), plan.alt ? gSearch(plan.alt) : Promise.resolve([]),
        core && core !== q && core.length >= 2 ? coreN : Promise.resolve([])]);
      const shelfSet = new Set(shelf.map((r) => nz(r.title)));
      const nseen = new Set();
      const nh = nh0.concat(nh1).filter((x) => !shelfSet.has(nz(x.title)) && !nseen.has(x.url) && nseen.add(x.url)).slice(0, 10);
      const wseen = new Set(), wh = [];
      for (const x of kh.concat(gh.slice(0, 5), gh2.slice(0, 4), gh.slice(5))) { if (!wseen.has(x.url)) { wseen.add(x.url); wh.push(x); } }
      wh.splice(9);
      prog({ k: 'found', n: shelf.length + nh.length, w: wh.length });
      const refs = { N: shelf.slice(0, 8).map((r) => ({ title: r.title, url: r.url || '' })).concat(nh.map((x) => ({ title: x.title, url: x.url }))), W: wh.map((x) => ({ title: x.title, url: x.url })) };
      const R = (o) => Object.assign(o, { refs });
      const cards = (baseCards || []).slice();
      nh.slice(0, 4).forEach((x) => cards.push({ title: x.title, url: x.url, type: 'Notion のページ', linkLabel: 'Notion で開く' }));
      wh.slice(0, 3).forEach((x) => cards.push({ title: x.title, url: x.url, type: 'Web', linkLabel: 'Web で開く' }));
      if (!nh.length && !wh.length && !shelf.length) return reply('「' + q + '」は、Notion の中にも Web にも見つかりませんでした。言い方を変えて聞いてみてください。', [], exChips().slice(0, 2), ['notion'], q);
      if (aiOn()) {
        const r = await askAI(raw, sourcesText(nh, wh, shelf, hint), plan);
        const moa = { drafts: (r.drafts || []).map((d) => ({ id: d.id, name: TEAM[d.id].name, model: d.model || '', text: d.text || '', err: d.err || '' })), who: r.who ? TEAM[r.who].name : '', model: r.model || '', merged: !!r.merged };
        if (r.text) return R(Object.assign(reply(r.text, cards, (r.next && r.next.length ? r.next.map((x) => ({ label: x, q: x })) : null) || baseChips || [{ label: 'もっと詳しく', q: q + ' をもっと詳しく' }], ['notion'], q), { moa, mood: r.mood || '' }));
        lastAiErr = r.detail || r.err || '';
        return R(Object.assign(reply("('-' 鰤)з💦 " + aiName() + ' がお休み中みたい（' + r.err + '）。かわりに見つけたものを並べるね。\n\n' + plain(), cards, baseChips || [], ['notion'], q), { moa, mood: 'panic' }));
      }
      return R(reply(plain() + (AI.provider === 'none' ? '' : '\n\n（「AI」で無料の鍵を入れると、これを読んでまとめて話せます）'), cards, baseChips || [], ['notion'], q));
      function plain() {
        const t = [];
        const heads = new Set(); const good = wh.filter((x) => { if (!x.snippet || x.snippet.length < 25 || looksUrl(x.snippet.slice(0, 60))) return false; const h = nz(x.snippet).slice(0, 30); if (heads.has(h)) return false; heads.add(h); return true; });
        if (good.length) t.push(good.slice(0, 2).map((x) => { const i = wh.indexOf(x) + 1; const s = x.snippet.split(/(?<=[。．！？])/u).slice(0, /Wikipedia/.test(x.title) ? 3 : 1).join('').slice(0, 260); return s + ' [W' + i + ']'; }).join('\n'));
        if (shelf.length) t.push('本棚には ' + compact(shelf.map((r) => r.title), 4) + ' があります。');
        if (nh.length) t.push('Notion では ' + compact(nh.map((x) => x.title), 5) + ' が見つかりました。');
        if (!good.length && wh.length) t.push('Web では ' + wh.slice(0, 3).map((x) => '「' + x.title + '」').join('・') + ' が見つかりました（下のカードから開けます）。');
        return t.join('\n\n').trim();
      }
    }

    /* --- Google 検索エンジン (特権API使用・最高品質) --- */
    async function searchExternal(query) {
      return new Promise((resolve) => {
        if (typeof GM_xmlhttpRequest === 'undefined') {
          resolve(reply("ブラウザの制約でWeb検索ができませんでした（GM_xmlhttpRequestが未許可です）。", [], exChips().slice(0, 2), ['notion'], query));
          return;
        }
        
        // 【精度向上】本の情報を引っ張るために検索クエリを強力に補強
        const safeQuery = query + " (本 OR 小説 OR ライトノベル OR コミック OR 発売予定 OR 発売日 OR あらすじ OR 作者)";
        const url = "https://www.google.co.jp/search?q=" + encodeURIComponent(safeQuery) + "&hl=ja";
        
        GM_xmlhttpRequest({
          method: "GET",
          url: url,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          onload: function(res) {
            try {
              const doc = new DOMParser().parseFromString(res.responseText, "text/html");
              const results = [];
              const seen = new Set();
              
              // 強調スニペットがあれば優先
              const featured = doc.querySelector('.xpdopen, .ifM9O, .kno-rdesc, .LGOjhe');
              if (featured && featured.textContent.trim()) {
                 results.push({ title: "強調スニペット / 概要", snippet: featured.textContent.trim() });
                 seen.add(featured.textContent.trim().substring(0, 30));
              }

              const blocks = doc.querySelectorAll('div.g');
              for (const el of blocks) {
                const titleEl = el.querySelector('h3');
                if (!titleEl) continue;
                const title = titleEl.textContent.trim();
                
                const snipEl = el.querySelector('div[data-sncf="1"], div.VwiC3b, div[style*="-webkit-line-clamp"]');
                let snippet = snipEl ? snipEl.textContent.trim() : "";
                
                if (!snippet) {
                   const clone = el.cloneNode(true);
                   const h3 = clone.querySelector('h3');
                   if(h3) h3.remove();
                   snippet = clone.textContent.replace(/\s+/g, ' ').trim().substring(0, 150) + "...";
                }
                
                if (title && snippet.length > 20) {
                   const check = snippet.substring(0, 30);
                   if (!seen.has(check)) {
                      seen.add(check);
                      results.push({ title, snippet });
                   }
                }
                if (results.length >= 4) break;
              }

              if (results.length > 0) {
                let text = `本棚には見当たりませんでしたが、Googleの海を泳いで広く調べてきました。\n\n`;
                for(let i=0; i<results.length; i++) {
                  text += `【${results[i].title}】\n${results[i].snippet}\n\n`;
                }
                text += `以上が「${query}」に関する現在のWeb上の情報です。`;
                resolve(reply(text.trim(), [], exChips().slice(0, 2), ['notion'], query));
              } else {
                resolve(reply(`「${query}」についてGoogleの海も泳ぎましたが、本や小説に関する有力な情報は見つかりませんでした。`, [], exChips().slice(0, 2), ['notion'], query));
              }
            } catch (e) {
              resolve(reply('Webの海を泳いでいる途中で波に飲まれました...（解析エラー）', [], exChips().slice(0, 2), ['notion'], query));
            }
          },
          onerror: function() {
            resolve(reply('Webの海に出られませんでした（接続エラー）。', [], exChips().slice(0, 2), ['notion'], query));
          }
        });
      });
    }

    /* v55: AI がある時は、本棚の決まり文句で答えて終わらせない。本棚の照合は材料として AI に渡し、AI が Notion・Web と合わせて答える */
    /* v67: いま開いているページについて（要約・質問）／「〜を開いて」でページへ */
    const RE_PAGE = /(この|今の|いまの|開いている|ひらいている)\s*(ページ|記事|ノート|メモ|本文|表|DB|データベース)|ページ(を|の)?(要約|まとめ|中身)|^(要約|まとめ)(して|て)?(ください|下さい)?[。！!]*$/u;
    const RE_OPEN = /^(.{1,40}?)\s*(?:の(?:ページ)?を?|を|って)?\s*(?:開いて|ひらいて|開く|開け|に移動して?|へ移動して?|を表示して?|に飛んで|へ飛んで)(?:ください|下さい|ね)?[。！!]*$/u;
    function pageContext() {
      const frame = [...document.querySelectorAll('.notion-frame')].find((f) => !f.closest('.notion-peek-renderer')) || document.querySelector('.notion-frame');
      if (!frame) return null;
      const h = frame.querySelector('h1[aria-roledescription="page title"], .notion-page-block h1, h1');
      const title = norm((h && h.textContent) || document.title.replace(/\s*[|｜]\s*Notion\s*$/, '')) || '無題';
      const parts = [];
      const pc = frame.querySelector('.notion-page-content');
      if (pc) parts.push(pc.innerText);
      [...frame.querySelectorAll('.notion-table-view, .notion-board-view, .notion-list-view, .notion-gallery-view, .notion-calendar-view')].filter((v) => !v.parentElement.closest('.notion-table-view, .notion-board-view, .notion-list-view, .notion-gallery-view')).slice(0, 2).forEach((v) => parts.push(v.innerText));
      const body = parts.join('\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 9000);
      return { title, body, url: location.origin + location.pathname + location.search };
    }
    /* 中身を読まずに「開いているページがあるか・題名」だけ（⌘K を開くたびに本文を読まない＝速く） */
    function pageHead() {
      const frame = [...document.querySelectorAll('.notion-frame')].find((f) => !f.closest('.notion-peek-renderer'));
      if (!frame || !frame.querySelector('.notion-page-content, .notion-table-view, .notion-board-view, .notion-list-view, .notion-gallery-view')) return null;
      const h = frame.querySelector('h1[aria-roledescription="page title"], .notion-page-block h1, h1');
      return { title: norm((h && h.textContent) || document.title.replace(/\s*[|｜]\s*Notion\s*$/, '')) || '無題' };
    }
    async function askPage(raw) {
      const pg = pageContext();
      if (!pg || pg.body.length < 20) return Object.assign(reply("('-' 鰤)з💧 いま開いているページの中身が読めなかったよ。ページを開いてから、もう一度聞いてね。", [], [], []), { mood: 'sad' });
      const refs = { N: [{ title: pg.title, url: pg.url }], W: [] };
      if (aiOn()) {
        prog({ k: 'search', q: pg.title });
        prog({ k: 'found', n: 1, w: 0 });
        const r = await askAI(raw, '# いま開いているページ [N1]\nタイトル: ' + pg.title + '\n本文:\n' + pg.body, { intent: 'いま' + nickName() + 'が開いているページ「' + pg.title + '」について答える（要約なら、要点を短い箇条書き 3〜6 個＋一言）' });
        const moa = { drafts: (r.drafts || []).map((d) => ({ id: d.id, name: TEAM[d.id].name, model: d.model || '', text: d.text || '', err: d.err || '' })), who: r.who ? TEAM[r.who].name : '', model: r.model || '', merged: !!r.merged };
        if (r.text) return Object.assign(reply(r.text, [{ title: pg.title, url: pg.url, type: 'Notion のページ' }], (r.next && r.next.length ? r.next.map((x) => ({ label: x, q: x })) : [{ label: 'もっと短く', q: 'このページを 3 行で' }, { label: '大事な所は？', q: 'このページでいちばん大事な所は？' }]), [], pg.title), { refs, moa, mood: r.mood || 'satisfied' });
        lastAiErr = r.detail || r.err || '';
      }
      const heads = pg.body.split('\n').filter((l) => l.trim()).slice(0, 8);
      return Object.assign(reply('「' + pg.title + '」の始まりはこんな感じだよ。[N1]\n' + heads.map((l) => '・' + l.slice(0, 80)).join('\n') + (aiOn() ? '' : '\n\n（⚙ で AI をつなぐと、要約や質問に答えられます）'), [], [], [], pg.title), { refs, mood: 'think' });
    }
    function spaNav(url) {
      try {
        const u = new URL(url, location.origin);
        if (u.origin !== location.origin) { location.assign(u.href); return; }
        const before = location.href;
        history.pushState(history.state, '', u.pathname + u.search + u.hash);
        window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
        const h1 = () => { const h = document.querySelector('.notion-frame h1'); return h ? h.textContent : ''; };
        const t0 = h1();
        setTimeout(() => { if (location.href !== before && h1() === t0) location.assign(u.href); }, 1400);
      } catch (e) { location.assign(url); }
    }
    async function openCmd(raw) {
      const m = RE_OPEN.exec(raw); if (!m) return null;
      const term = trimP(stripQ(m[1]).replace(/^(ページ|DB|データベース)\s*/u, '')) || m[1];
      if (term.length < 1) return null;
      const hits = await notionSearch(term);
      if (!hits.length) return Object.assign(reply("('-' 鰤)з💧 「" + term + '」というページは見つからなかったよ。言い方を変えてみてね。', [], [], []), { mood: 'sad' });
      const best = hits.find((h) => nz(h.title) === nz(term)) || hits[0];
      setTimeout(() => { try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } catch (e) { /* noop */ } spaNav(best.url); }, 450);
      return Object.assign(reply("('-' 鰤)з✨ 「" + best.title + '」を開くね。', hits.slice(0, 5).map((h) => ({ title: h.title, url: h.url, type: 'Notion のページ' })), [], [], term), { mood: 'happy', opened: best.url });
    }
    async function ask(input) {
      const raw = String(input == null ? '' : input).trim();
      const mc = memCmd(raw); if (mc) return mc;
      if (deltaFn && RE_DELTA.test(raw)) return askDelta(raw);
      if (RE_PAGE.test(raw)) return askPage(raw);
      if (RE_OPEN.test(raw)) { const oc = await openCmd(raw); if (oc) return oc; }
      const q0 = nz(raw).replace(/[?？!！。．.、,〜~…]+/gu, ' ').replace(/\s+/gu, ' ').trim();
      if (!q0 || RE.greet.test(q0) || RE.thanks.test(q0) || RE.praise.test(q0) || RE.help.test(q0)) return askLocal(input);
      if (!aiOn() || !records.length) { const r0 = await askLocal(input); try { learnAfter(raw, lastCand); } catch (e) { /* noop */ } return r0; }
      LOCAL_ONLY = true; lastCand = [];
      let loc = null;
      try { loc = await askLocal(input); } catch (e) { loc = null; } finally { LOCAL_ONLY = false; }
      const viaDeep = !!(loc && loc.__deep);
      const shelf = (viaDeep && loc.shelf.length ? loc.shelf : lastCand).slice(0, 8);
      const cards = loc ? (loc.cards || []).slice(0, 4) : [];
      const chips = loc && loc.chips && loc.chips.length ? loc.chips : null;
      const res = await deep(raw, shelf, cards, chips, !viaDeep && loc ? loc.text : '');
      try { learnAfter(raw, shelf); } catch (e) { /* noop */ }
      return res;
    }
    async function askLocal(input) {
      const raw = String(input == null ? '' : input).trim();
      const q0 = nz(raw).replace(/[?？!！。．.、,〜~…]+/gu, ' ').replace(/\s+/gu, ' ').trim();
      if (!q0) return reply('なにか聞いてください。たとえば「東野圭吾の本ある？」「ミステリーでおすすめは？」です。', [], records.length ? exChips() : []);
      if (RE.greet.test(q0)) return reply('こんにちは。本棚案内の B.U.R.I です。' + (records.length ? '取り込んだ ' + records.length + ' 件から探します。読みたい本の話をどうぞ。' : 'まずは本棚の CSV を取り込んでください。'), [], records.length ? exChips() : [], records.length ? [] : ['import']);
      if (RE.thanks.test(q0) || RE.praise.test(q0)) {
        const big = /(最高|天才|神|ぐっじょぶ|グッジョブ|すごすぎ|完璧)/u.test(q0);
        return Object.assign(reply(big ? "ε( ε,'-')('-' 鰤)з('-' 鰤)з('-' 鯛)з ……鯛が泳いできた。" + nickName() + '、ありがとう。一生分うれしい。' : "('-' 鰤)з♥✨ どういたしまして、" + nickName() + '！ また呼んでね。'), { mood: big ? 'reward' : 'joy' });
      }
      if (RE.help.test(q0)) return help();
      if (!records.length && !RE.greet.test(q0)) return await deep(raw, [], [], null);
      if (!records.length) return reply('まだ本棚のデータを持っていません。Notion の本棚 DB を CSV で書き出して、「取り込む」から渡してください（外には送りません）。', [], [], ['import']);
      if (RE.more.test(q0)) return more();
      ctx.ask = raw;
      const it = { next: RE.next.test(q0), prev: RE.prev.test(q0), syn: RE.syn.test(q0), who: RE.who.test(q0), count: RE.count.test(q0), rec: RE.rec.test(q0), all: RE.all.test(q0) };
      if (it.next && it.prev) it.prev = false;

      let rest = ' ' + q0 + ' ';
      const tHits = [];
      for (const t of TITLES) if (rest.includes(t.k)) { tHits.push(...t.rs); rest = rest.split(t.k).join(' '); }
      it.ref = !tHits.length && RE.ref.test(q0);
      if (it.ref) rest = ' ' + rest.trim().replace(RE.ref, ' ') + ' ';
      
      const terms = [];
      for (const v of VOC) if (rest.includes(v.k)) { terms.push(v); rest = rest.split(v.k).join(' '); }
      
      const alias = [];
      for (const g of ALIAS) {
        const hit = g.find((w) => rest.includes(nz(w)));
        if (hit) { alias.push({ d: hit, ws: g.map(nz) }); g.forEach((w) => { rest = rest.split(nz(w)).join(' '); }); }
      }
      
      let status = '';
      for (const [k, re] of ST_RE) if (re.test(rest)) { status = k; rest = rest.replace(re, ' '); break; }
      
      for (const re of STRIP) rest = rest.replace(re, ' ');
      const tokens = rest.split(/[\s ]+/u).map(trimP).filter((t) => t && (t.length >= 2 || /[\p{Script=Han}a-z0-9]/u.test(t)));

      const has = !!(tHits.length || terms.length || alias.length || tokens.length || status);
      const groups = new Map();
      terms.forEach((t) => { const g = [...t.fs].sort().join('+'); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(t); });
      const pass = (r) => [...groups.values()].every((ts) => ts.some((t) => termHit(r, t)))
        && alias.every((a) => a.ws.some((w) => inCat(r, w)))
        && tokens.every((tk) => tokHit(r, tk))
        && (!status || stHit(r, status));
      let cand = (tHits.length ? uniq(tHits) : records).filter(pass);
      if (!cand.length && tHits.length && (terms.length || tokens.length)) cand = records.filter(pass);

      const parts = [];
      if (tHits.length) parts.push('「' + tHits[0].title + '」');
      terms.forEach((t) => {
        const facet = [...t.fs][0];
        if (facet === 'author') learnFacet('authors', t.d);
        if (facet === 'tags') learnFacet('tags', t.d);
        parts.push(FACET_JA[facet] + '「' + t.d + '」'); 
      });
      alias.forEach((a) => parts.push('「' + a.d + '」'));
      tokens.forEach((t) => parts.push('「' + t + '」'));
      if (status) parts.push('状態「' + status + '」');
      const label = parts.join('・');

      let focus = tHits.length ? tHits[0] : null;
      const askOne = it.next || it.prev || it.syn || it.who;
      if (!focus && (it.ref || (askOne && !has))) focus = ctx.last;
      if (!focus && askOne && has && cand.length === 1) focus = cand[0];
      lastCand = focus ? uniq([focus].concat(cand)) : cand.slice();

      if (it.next || it.prev) return step(focus, it.next ? 1 : -1);
      if (it.syn) return synopsis(focus, cand, has);
      if (it.who && focus && !terms.some((t) => t.fs.has('author'))) return who(focus);
      if (it.count) return count(cand, has, label);
      if (!has) {
        if (it.rec) return recommend(records, '', raw);
        if (it.all) return list(records.slice().sort(bySeries), 'すべて', raw);
        if (it.ref && ctx.last) return list([ctx.last], '', raw);
        return await deep(raw, [], [], null);
      }
      if (!cand.length) return await deep(raw, [], [], null);
      if (it.rec) return recommend(cand, label, raw);
      const lr = list(it.all || commonSeries(cand) ? cand.slice().sort(bySeries) : sortSmart(cand, tokens), label, raw);
      /* v48: 鍵があれば、本棚の答えに Notion・Web の情報も足して話す（一覧の操作「全部」「他には」はそのまま） */
      if (aiOn() && !it.all) return await deep(raw, cand.slice(0, 8), lr.cards, lr.chips);
      return lr;
    }

    function state() {
      return { count: records.length, imported: records.length > 0, persisted, name: lastSrc ? lastSrc.name : '', fields: info.fields, missing: info.missing, warnings: info.warnings, last: ctx.last ? ctx.last.title : '', hits: ctx.hits.length, shown: ctx.shown, sessionOnly: !persisted };
    }
    
    // 内部名を「ask」に統一し、外部公開名「answer」にマッピング
    return { ask, answer: ask, importText, save, forget, clear, restore, state, FIELD, isRead: (r) => stHit(r, '読了'), count: () => records.length, AI, AI_MODELS, PROVIDERS, GEMINI_MODELS, TEAM, TEAM_IDS, team, ready, setKey, nick: nickName, resting: (id) => { const t = coolGet('c33.buri.pbad')[id] || 0; return t > Date.now() ? new Date(t).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''; }, moaOn, setProgress: (f) => { aiProgress = f; }, aiOn, aiName, chromeLM, aiTest, gemLast: () => gemLast || gmGet('c33.buri.gok', ''), gemReset: () => { gemList = null; gmSet('c33.buri.gbad', {}); gmSet('c33.buri.ml.gemini', null); }, lastErr: () => lastAiErr, gmSet, gmGet, aiReset: () => { aiHist.length = 0; }, quick, setDelta: (f) => { deltaFn = f; },
      fixCites, pageContext, pageHead, multi,
      mem: { get: memGet, add: (t) => memAdd(t), del: memDel, topics: topTopics, setOn: (on) => { const m = memGet(); m.on = !!on; memSet(m); }, clear: () => { memSet({ on: memGet().on, notes: [], topics: {} }); userPref = { authors: {}, tags: {} }; savePref(); }, prefs: () => ({ authors: getTopLearned('authors').slice(0, 8), tags: getTopLearned('tags').slice(0, 8) }) },
      warm: () => { try { if (ready('gemini')) gemModels(); team().forEach((id) => { if (TEAM[id] && TEAM[id].base) oaiModels(id); }); spaceId(); } catch (e) { /* noop */ } } };
  })();

  /* ============================================================
   *  B.U.R.I の画面（アニメーション＋Web検索＋フローティング対応版）
   * ============================================================ */
  function obSearchBoot() {
    ['c33-search-css', 'c33-search-header', 'c33-buri', 'c33-buri-file', 'c33-ns-css', 'c33-ns', 'c33-nsp'].forEach((id) => { const e = document.getElementById(id); if (e) e.remove(); });
    const svgI = (p) => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
    const LENS = svgI('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>');
    const MENU = svgI('<path d="M4 6h16M4 12h16M4 18h16"/>');
    const AVATAR = "('-' 鰤)з";
    const nzq = (s) => String(s == null ? '' : s).normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim();
    const mk = (tag, cls, text, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    const setS = (el, k, v) => { if (el.style.getPropertyValue(k) !== v) el.style.setProperty(k, v, 'important'); };

    const style = document.createElement('style');
    style.id = 'c33-search-css';
    style.textContent = `
#c33-search-header { position: fixed; z-index: 1001; display: flex; gap: 8px; align-items: center; height: 40px; box-sizing: border-box; margin: 0; padding: 0; color: var(--c-texPri, #37352f); font: 12px/1.4 var(--c33-ui); border-radius: 18px; transition: box-shadow 0.2s ease; }
#c33-search-header[hidden], #c33-buri[hidden] { display: none !important; }
#c33-search-header *, #c33-buri * { box-sizing: border-box; }
#c33-search-header .cs-field { display: flex; align-items: center; flex: 1 1 auto; min-width: 0; height: 36px; margin: 0; padding: 0 10px 0 4px; gap: 2px; border: 1px solid var(--ca-borSecTra, rgba(55,53,47,.14)); border-radius: 18px; background: var(--c-bacPri, #fff); cursor: text; }
#c33-search-header .cs-field:focus-within { border-color: color-mix(in srgb, var(--lm-accent, #2783de) 55%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lm-accent, #2783de) 16%, transparent); }
#c33-search-header .cs-go { flex: none; width: 28px; height: 28px; margin: 0; padding: 0; border: 0; border-radius: 14px; background: transparent; color: var(--c-icoSec, #91918e); display: flex; align-items: center; justify-content: center; cursor: pointer; }
#c33-search-header .cs-go:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-search-header input#c33-search-input { flex: 1 1 auto !important; min-width: 0 !important; width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; border: 0 !important; outline: 0 !important; background: transparent !important; box-shadow: none !important; color: inherit !important; font: inherit !important; -webkit-appearance: none; appearance: none; }
#c33-search-header input#c33-search-input::placeholder { color: var(--c-texTer, #a5a29a); opacity: 1; }
#c33-search-header .cs-close { flex: none; width: 32px; height: 32px; margin: 0; padding: 0; border: 0; border-radius: 16px; background: transparent; color: var(--c-icoSec, #91918e); display: flex; align-items: center; justify-content: center; cursor: pointer; }
#c33-search-header .cs-close:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-buri { position: fixed; z-index: 1002; display: flex; flex-direction: column; border-radius: 14px; overflow: hidden; background: var(--c-bacEle, #fff); color: var(--c-texPri, #37352f);
  box-shadow: var(--c-shaOutMd, 0 12px 36px rgba(0,0,0,.18)), 0 0 0 1px var(--ca-borSecTra, rgba(0,0,0,.06)); font: 12.5px/1.6 var(--c33-ui); font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; transition: left 0.2s ease, top 0.2s ease, width 0.2s ease; }
#c33-buri .cb-top { flex: none; display: flex; align-items: center; flex-wrap: wrap; gap: 4px 6px; padding: 8px 10px; border-bottom: 1px solid var(--ca-borSecTra, rgba(0,0,0,.06)); }
#c33-buri .cb-name { font-weight: 700; letter-spacing: .06em; }
#c33-buri .cb-state { flex: 1 1 120px; min-width: 0; font-size: 11px; color: var(--c-texTer, #999); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-buri .cb-tool { flex: none; margin: 0; padding: 2px 8px; border: 1px solid var(--ca-borSecTra, rgba(0,0,0,.1)); border-radius: 999px; background: transparent; color: inherit; font: 11px/1.5 var(--c33-ui); cursor: pointer; }
#c33-buri .cb-tool:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); }
#c33-buri .cb-x { border: 0; font-size: 14px; padding: 0 6px; }
#c33-buri .cb-log { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 10px; display: flex; flex-direction: column; gap: 10px; }
#c33-buri .cb-msg { display: flex; gap: 8px; align-items: flex-start; }
#c33-buri .cb-msg.me { justify-content: flex-end; }
#c33-buri .cb-av { flex: none; padding: 2px 7px; border-radius: 10px; font-size: 11px; white-space: nowrap; background: color-mix(in srgb, var(--lm-accent, #2783de) 10%, transparent); color: var(--c-texSec, #555); }
#c33-buri .cb-body { min-width: 0; max-width: 100%; display: flex; flex-direction: column; gap: 6px; }
#c33-buri .cb-msg.me .cb-body { align-items: flex-end; max-width: 85%; }
#c33-buri .cb-bub { padding: 7px 10px; border-radius: 12px; background: color-mix(in srgb, var(--c-texPri, #000) 5%, transparent); white-space: pre-wrap; overflow-wrap: anywhere; }
#c33-buri .cb-msg.me .cb-bub { background: color-mix(in srgb, var(--lm-accent, #2783de) 14%, transparent); }
#c33-buri .cb-card { display: flex; flex-direction: column; gap: 2px; padding: 7px 9px; border: 1px solid var(--ca-borSecTra, rgba(0,0,0,.08)); border-radius: 10px; background: var(--c-bacPri, #fff); }
#c33-buri .cb-card strong { font-size: 13px; overflow-wrap: anywhere; }
#c33-buri .cb-meta { font-size: 11px; color: var(--c-texSec, #787774); overflow-wrap: anywhere; }
#c33-buri .cb-st { align-self: flex-start; margin-top: 2px; padding: 0 7px; border-radius: 999px; font-size: 10.5px; background: color-mix(in srgb, var(--c-texPri, #000) 6%, transparent); }
#c33-buri .cb-st.done { background: color-mix(in srgb, #2e9e6a 16%, transparent); }
#c33-buri .cb-links { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 3px; }
#c33-buri .cb-links a, #c33-buri .cb-links button { margin: 0; padding: 0; border: 0; background: none; font: 11px/1.5 var(--c33-ui); color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); text-decoration: none; cursor: pointer; }
#c33-buri .cb-links a:hover, #c33-buri .cb-links button:hover { text-decoration: underline; }
#c33-buri .cb-chips { display: flex; flex-wrap: wrap; gap: 6px; }
#c33-buri .cb-chip { margin: 0; padding: 3px 10px; border: 1px solid color-mix(in srgb, var(--lm-accent, #2783de) 35%, transparent); border-radius: 999px; background: transparent; color: var(--c-texPri, #37352f); font: 11.5px/1.5 var(--c33-ui); cursor: pointer; }
#c33-buri .cb-chip:hover { background: color-mix(in srgb, var(--lm-accent, #2783de) 10%, transparent); }
#c33-buri .cb-chip.act { border-style: dashed; }
#c33-buri .cb-foot { flex: none; padding: 6px 10px; border-top: 1px solid var(--ca-borSecTra, rgba(0,0,0,.06)); font-size: 10.5px; color: var(--c-texTer, #999); }

/* v87 Nebius の見出し: ('-' 鰤)з のピル ＋ 大分類の名前（浮かぶ B.U.R.I の時だけ文字の窓） */
#c33-search-header:not(.floating) .cs-field { display: none !important; }
#c33-search-header.floating .cs-face, #c33-search-header.floating .cs-title { display: none !important; }
#c33-search-header .cs-face { flex: none; display: inline-flex; align-items: center; height: 30px; margin: 0; padding: 0 11px; border: 0; border-radius: 999px; cursor: pointer; color: var(--c-texPri, #37352f);
  background: color-mix(in srgb, var(--lm-accent, #2783de) 9%, var(--c-bacPri, #fff)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lm-accent, #2783de) 18%, transparent), 0 3px 10px -6px rgba(15,15,30,.3);
  transition: transform .25s cubic-bezier(.3,1.6,.5,1), box-shadow .2s ease; }
#c33-search-header .cs-face .b-face { font-size: 12.5px; line-height: 1; font-weight: 500; letter-spacing: 0; white-space: nowrap; }
#c33-search-header .cs-face:hover { transform: translateY(-1px); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lm-accent, #2783de) 30%, transparent), 0 8px 18px -8px color-mix(in srgb, var(--lm-accent, #2783de) 55%, transparent); }
#c33-search-header .cs-face:hover .b-face { display: inline-block; animation: csSwim 1.1s ease-in-out infinite; }
#c33-search-header .cs-face:active { transform: scale(.94); }
@keyframes csSwim { 0%, 100% { transform: translateX(0) rotate(0); } 25% { transform: translateX(-1.5px) rotate(-3deg); } 75% { transform: translateX(1.5px) rotate(3deg); } }
#c33-search-header .cs-hint { flex: 1 1 auto; min-width: 0; font: 500 11.5px/1 var(--c33-ui); color: var(--c-texTer, #a5a29a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: .9; }
#c33-search-header.floating .cs-hint { display: none !important; }
#c33-stella-head { position: fixed; z-index: 1001; display: flex; align-items: center; gap: 9px; height: 40px; padding: 0 10px 0 6px; box-sizing: border-box; pointer-events: none; color: var(--c-texPri, #37352f); }
#c33-stella-head[hidden] { display: none !important; }
#c33-stella-head .sh-dot { flex: none; width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 0%, transparent); }
#c33-stella-head .sh-dot { box-shadow: 0 0 0 3px rgba(255,255,255,.7), 0 0 0 5px color-mix(in srgb, var(--c-texPri, #37352f) 6%, transparent); }
#c33-stella-head .sh-tx { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
#c33-stella-head b { font: 650 15px/1.15 var(--c33-ui); letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#c33-stella-head small { font: 500 10.5px/1.2 var(--c33-ui); color: var(--c-texTer, #a5a29a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#c33-stella-head.swap { animation: csTitleIn .45s cubic-bezier(.16,1,.3,1); }
#c33-stella-head.swap .sh-dot { animation: csDotPop .5s cubic-bezier(.3,1.7,.5,1); }
@keyframes csTitleIn { from { opacity: 0; transform: translateY(6px); } }
@keyframes csDotPop { 0% { transform: scale(.4); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { #c33-search-header .cs-face:hover .b-face, #c33-stella-head.swap, #c33-stella-head.swap .sh-dot { animation: none; } }

/* --- アニメーション関連 --- */
#c33-search-header.floating { left: 50% !important; transform: translateX(-50%) !important; width: 600px !important; max-width: 90vw !important; top: 15vh !important; box-shadow: var(--c-shaOutMd, 0 12px 36px rgba(0,0,0,.18)) !important; }
#c33-buri.floating { left: 50% !important; transform: translateX(-50%) !important; width: 600px !important; max-width: 90vw !important; top: calc(15vh + 46px) !important; max-height: 60vh !important; }
@keyframes buriPop {
  0% { opacity: 0; transform: translateY(8px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
#c33-buri .cb-msg { animation: buriPop 0.25s ease-out forwards; }
.typewriter-cursor::after {
  content: "▌";
  display: inline-block;
  vertical-align: bottom;
  animation: blink 1s step-start infinite;
  margin-left: 2px;
  color: var(--lm-accent, #2783de);
}
@keyframes blink { 50% { opacity: 0; } }
.thinking-dots { display: inline-flex; gap: 4px; align-items: center; height: 16px; }
.thinking-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--c-texSec, #999); animation: bounce 1.4s infinite ease-in-out both; }
.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
`;
    (document.head || document.documentElement).appendChild(style);

    const header = mk('div');
    header.id = 'c33-search-header'; header.hidden = true; header.setAttribute('role', 'search');
    const field = mk('label', 'cs-field', null, header);
    const go = mk('button', 'cs-go', null, field); go.type = 'button'; go.innerHTML = LENS; go.setAttribute('aria-label', 'B.U.R.I に聞く');
    const input = mk('input', null, null, field);
    input.id = 'c33-search-input'; input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
    input.placeholder = 'B.U.R.I に聞く・Notion を検索';
    input.setAttribute('aria-label', 'B.U.R.I'); input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-controls', 'c33-buri');
    
    const close = mk('button', 'cs-close', null, header); close.type = 'button'; close.innerHTML = MENU;
    /* v87 Nebius: サイドでは検索窓を出さず、('-' 鰤)з のピル（押すと ⌘K の B.U.R.I）と、輪で選んだ大分類の名前（Stella の見出し）。
       文字を打つ窓は ⌃⌥B の浮かぶ B.U.R.I の時だけ */
    const csFace = mk('button', 'cs-face'); csFace.type = 'button'; csFace.title = 'B.U.R.I に聞く・Notion を検索（⌘K）'; csFace.setAttribute('aria-label', 'B.U.R.I に聞く');
    const csFx = mk('span', 'b-face cs-fx', "('-' 鰤)з", csFace); csFx.style.setProperty('font-family', 'var(--buri-face)', 'important');
    const csHint = mk('span', 'cs-hint', '聞く・探す'); csHint.setAttribute('aria-hidden', 'true');
    header.insertBefore(csFace, field); header.insertBefore(csHint, field);
    /* Stella の見出し（2 段目）: 大分類の名前・色の点・件数。サイドバーの幅いっぱい */
    const csTitle = mk('div'); csTitle.id = 'c33-stella-head'; csTitle.hidden = true;
    const csDot = mk('i', 'sh-dot', null, csTitle); const csTx = mk('div', 'sh-tx', null, csTitle); const csT1 = mk('b', null, '', csTx); const csT2 = mk('small', null, '', csTx);
    document.body.appendChild(csTitle);
    csFace.addEventListener('mouseenter', () => { csFx.textContent = "('-' 鰤)з♪"; });
    csFace.addEventListener('mouseleave', () => { csFx.textContent = "('-' 鰤)з"; });
    csFace.addEventListener('mousedown', (e) => e.preventDefault());
    csFace.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); csFx.textContent = "('-' 鰤)з✨"; if (NS.on && !floatMode) nsOpenFromSide('', false); else { floatMode = true; input.focus(); openPanel(); layout(); } });
    let csKey = '';
    function stellaTitle() {
      const side = obSide(); if (!side) return;
      const sel = OB.on ? OB.sel : '';
      let label = 'All';
      if (sel) { const l = document.querySelector('#c16-root .c16-sec[data-c16-g="' + CSS.escape(sel) + '"] .c16-lbl'); if (l) label = norm(l.textContent) || label; }
      const teams = side.querySelectorAll(SEL_TEAM + (sel ? '[data-c16-g="' + CSS.escape(sel) + '"]' : '[data-c33-team]'));
      let pages = 0; for (const t of teams) { const b = t.querySelector(SEL_TEAM_BTN); pages += +((b && b.getAttribute('data-c33-n')) || 0); }
      const sub = teams.length ? teams.length + ' チーム' + (pages ? ' · ' + pages + ' ページ' : '') : 'チームスペースなし';
      let tint = ''; for (const t of teams) { const v = t.style.getPropertyValue('--c33-tint'); if (v && !/^rgba\([^)]*,\s*0\)$|transparent/.test(v.trim())) { tint = v; break; } }
      const k = label + '|' + sub + '|' + tint;
      if (k === csKey) return;
      csDot.style.background = tint || 'var(--lm-accent, #2783de)';
      const swap = csKey && csKey.split('|')[0] !== label;
      csKey = k; csT1.textContent = label; csT2.textContent = sub; csTitle.title = label + '（' + sub + '）';
      if (swap) { csTitle.classList.remove('swap'); void csTitle.offsetWidth; csTitle.classList.add('swap'); }
    }
    close.setAttribute('aria-label', 'サイドバーを閉じる'); close.title = 'サイドバーを閉じる（⌘\\）';

    const panel = mk('div');
    panel.id = 'c33-buri'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', "B.U.R.I ('-' 鰤)з 本棚案内");
    const top = mk('div', 'cb-top', null, panel);
    mk('span', 'cb-name', 'B.U.R.I', top);
    const stateEl = mk('span', 'cb-state', '', top);
    const bImp = mk('button', 'cb-tool', '取り込む', top); bImp.type = 'button'; bImp.title = 'Notion の本棚 DB を書き出した CSV / JSON を渡す';
    const bSave = mk('button', 'cb-tool', '端末に保存', top); bSave.type = 'button'; bSave.title = '次からも自動で読み込む（このブラウザの中だけ）';
    const bForget = mk('button', 'cb-tool', '保存を消す', top); bForget.type = 'button';
    const bAI = mk('button', 'cb-tool', 'AI', top); bAI.type = 'button'; bAI.title = 'AI の鍵・モデル・Web 検索';
    const bX = mk('button', 'cb-tool cb-x', '×', top); bX.type = 'button'; bX.setAttribute('aria-label', '閉じる');
    const log = mk('div', 'cb-log', null, panel); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
    const foot = mk('div', 'cb-foot', '', panel);
    const footText = () => {
      const A = BURI.AI, on = BURI.aiOn();
      foot.textContent = !on ? '本棚・Notion 全体・Google を調べて答えます。「AI」で無料の Gemini（または Chrome 内蔵 AI）を選ぶと、まとめて話せるようになります。'
        : A.provider === 'gemini' ? '本棚・Notion・Google を調べ、Gemini（無料枠・' + ((BURI.GEMINI_MODELS.find((x) => x[0] === A.gmodel) || [0, A.gmodel])[1].replace(/（.*$/, '')) + (BURI.gemLast() ? '・前回 ' + BURI.gemLast() : '') + '）がまとめて話します。質問と抜粋が Google に送られます（無料枠では改善に使われることがあります）。'
        : A.provider === 'chrome' ? '本棚・Notion・Google を調べ、Chrome 内蔵 AI がこの端末の中でまとめて話します（無料・外へは送りません）。'
        : '本棚・Notion・Google を調べ、Claude（' + A.model + '・有料）がまとめて話します。質問と抜粋が Anthropic に送られます。';
    };
    footText();
    const file = mk('input'); file.id = 'c33-buri-file'; file.type = 'file'; file.accept = '.csv,.json,text/csv,application/json'; file.hidden = true;
    document.body.append(header, panel, file);

    let panelOpen = false, composing = false;
    let floatMode = false;

    function updState() {
      const s = BURI.state();
      stateEl.textContent = s.count ? '本棚 ' + s.count + ' 件・' + (s.persisted ? 'この端末に保存済み' : 'この実行の間だけ') : '本棚はまだ空です';
      bSave.hidden = !s.count || s.persisted;
      bForget.hidden = !s.persisted;
    }
    function trimLog() { while (log.children.length > 60) log.firstElementChild.remove(); }
    function scrollEnd() { requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; }); }
    function addUser(text) {
      const m = mk('div', 'cb-msg me', null, log);
      const b = mk('div', 'cb-body', null, m);
      mk('div', 'cb-bub', text, b);
      trimLog(); scrollEnd();
    }
    function card(r, parent) {
      const c = mk('div', 'cb-card', null, parent);
      mk('strong', null, r.title, c);
      const meta = [];
      if (r.author) meta.push('著者: ' + r.author);
      if (r.series) meta.push('シリーズ: ' + r.series + (r.seq ? '（' + r.seq + '）' : ''));
      if (r.tags) meta.push('分類: ' + r.tags);
      if (r.type) meta.push('種別: ' + r.type);
      if (r.pron) meta.push('読み: ' + r.pron);
      if (meta.length) mk('div', 'cb-meta', meta.join(' ／ '), c);
      if (r.status) mk('span', 'cb-st' + (BURI.isRead(r) ? ' done' : ''), r.status, c);
      const ln = mk('div', 'cb-links', null, c);
      if (r.url) { const a = mk('a', null, r.linkLabel || '作品ページを開く', ln); a.href = r.url; a.rel = 'noopener noreferrer'; if (!r.url.startsWith(location.origin)) a.target = '_blank'; }
      else { const b = mk('button', null, 'Notion で探す', ln); b.type = 'button'; b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openNative(r.title); }); }
      (r._relations || []).slice(0, 4).forEach((ref) => { const a = mk('a', null, ref.label + ': ' + (ref.name || '開く'), ln); a.href = ref.url; a.rel = 'noopener noreferrer'; });
    }
    
    async function addBuri(res) {
      const m = mk('div', 'cb-msg', null, log);
      mk('div', 'cb-av', AVATAR, m);
      const b = mk('div', 'cb-body', null, m);
      const bub = mk('div', 'cb-bub typewriter-cursor', '', b);
      
      const extras = mk('div', '', null, b);
      extras.style.display = 'none';
      
      (res.cards || []).forEach((r) => card(r, extras));
      const chips = res.chips || [], acts = res.actions || [];
      if (chips.length || acts.length) {
        const cw = mk('div', 'cb-chips', null, extras);
        chips.forEach((c) => { const x = mk('button', 'cb-chip', c.label, cw); x.type = 'button'; x.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); send(c.q); }); });
        acts.forEach((a) => {
          let lb = '', fn = null;
          if (a === 'import') { lb = '本棚を取り込む'; fn = () => file.click(); }
          else if (a === 'notion') { lb = 'Notion 全体で探す'; fn = () => openNative(res.query || ''); }
          else if (a && a.gid) { lb = '大分類「' + a.label + '」を開く'; fn = () => { const i = obItemEls.findIndex((el) => el.__gid === a.gid); if (i >= 0) obJump(i); obSelect(a.gid); }; }
          if (!fn) return;
          const x = mk('button', 'cb-chip act', lb, cw); x.type = 'button';
          x.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); });
        });
      }
      trimLog(); scrollEnd(); updState();
      
      const text = res.text || '';
      for (let i = 0; i < text.length; i++) {
        bub.textContent += text[i];
        if (i % 2 === 0) scrollEnd();
        await new Promise(r => setTimeout(r, 12));
      }
      bub.classList.remove('typewriter-cursor');
      extras.style.display = 'block'; 
      scrollEnd();
    }

    async function openPanel() {
      if (!panelOpen) {
        panelOpen = true;
        if (!log.children.length) {
           const res = await BURI.ask('こんにちは');
           addBuri(res);
        }
      }
      input.setAttribute('aria-expanded', 'true');
      updState(); layout();
    }
    function closePanel() {
      panelOpen = false; panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      if (floatMode) { floatMode = false; input.blur(); layout(); }
    }

    async function send(q) {
      q = String(q == null ? '' : q).trim();
      if (!q) { input.focus(); openPanel(); return; }
      openPanel();
      addUser(q);
      
      const thinkMsg = mk('div', 'cb-msg', null, log);
      mk('div', 'cb-av', AVATAR, thinkMsg);
      const thinkB = mk('div', 'cb-body', null, thinkMsg);
      const thinkBub = mk('div', 'cb-bub', '', thinkB);
      thinkBub.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div>';
      scrollEnd();

      let res;
      try { res = await BURI.ask(q); }
      catch (e) { res = { text: 'ごめんなさい、考えている途中で波に飲まれました。（' + String(e && e.message || e) + '）', cards: [], chips: [], actions: [] }; }
      
      thinkMsg.remove();
      
      const nq = nzq(q);
      const gs = obGroups().filter((g) => g.label && nzq(g.label).length >= 2 && nq.includes(nzq(g.label))).slice(0, 2);
      if (gs.length) res = Object.assign({}, res, { actions: (res.actions || []).concat(gs.map((g) => ({ gid: g.gid, label: g.label }))) });
      
      await addBuri(res);
    }
    function submit() {
      if (composing) return;
      const q = input.value;
      input.value = '';
      send(q);
    }

    function nativeInput() {
      for (const el of document.querySelectorAll('[data-search-container="true"] input, .notion-dialog[aria-label="Search Notion"] input, [role="dialog"] input[role="combobox"]')) {
        if (el.closest('#c33-search-header, #c33-buri')) continue;
        if (el.getBoundingClientRect().width) return el;
      }
      return null;
    }
    async function openNative(q) {
      closePanel();
      let inp = nativeInput();
      if (!inp) {
        const t = obTabs().find((x) => /^(search|検索)/i.test(x.name));
        if (t) { try { obPress(t.el); } catch (e) { /* noop */ } inp = await obWait(nativeInput, 900); }
        if (!inp) {   /* 押しても開かない時は ⌘K（Windows は Ctrl+K） */
          const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
          document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', keyCode: 75, which: 75, metaKey: mac, ctrlKey: !mac, bubbles: true, cancelable: true, composed: true }));
          inp = await obWait(nativeInput, 1600);
        }
      }
      if (!inp) { obToast('Notion の検索を開けませんでした。⌘K（Windows は Ctrl+K）を押してみてください。'); return false; }
      if (q) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(inp, q);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
      inp.focus();
      return true;
    }

    function closeSidebar() {
      closePanel();
      const b = obWsBtns().find((x) => x.name === 'サイドバーを閉じる');
      if (b && obPress(b.el)) return;
      const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '\\', code: 'Backslash', keyCode: 220, which: 220, metaKey: mac, ctrlKey: !mac, bubbles: true, cancelable: true, composed: true }));
    }

    async function importFile(f) {
      openPanel();
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { addBuri({ text: '「' + f.name + '」は大きすぎます（上限 5MB）。', cards: [], chips: [], actions: [] }); return; }
      let text = '';
      try { text = await f.text(); }
      catch (e) { addBuri({ text: 'ファイルを読めませんでした。' + String(e && e.message || e), cards: [], chips: [], actions: [] }); return; }
      const r = BURI.importText(text, f.name);
      const g = r.ok ? await BURI.ask('こんにちは') : { chips: [] };
      addBuri({ text: r.message, cards: [], chips: g.chips || [], actions: r.ok ? [] : ['import'] });
    }

    /* v77: サイドバーの大きさが変わった瞬間（ResizeObserver＝描画の前）に輪と検索窓を置き直す。0.45 秒ごとの見回りはやめた */
    let laySide = null, layRO = null;
    function watchSide(side) {
      if (side === laySide) return;
      laySide = side;
      try {
        if (!layRO) layRO = new ResizeObserver(() => { if (OB.on && obEl && obEl.isConnected) obAnchor(); layout0(); });
        layRO.disconnect();
        if (side) layRO.observe(side);
      } catch (e) { /* noop */ }
    }
    function layout() {
      layout0();
      if (!floatMode && (!OB.on || obEl)) { layDone = true; readyCheck(); }
    }
    function layout0() {
      if (floatMode) {
        header.hidden = false;
        close.hidden = true;
        header.classList.add('floating');
        panel.classList.add('floating');
        csTitle.hidden = true;
        if (!panelOpen) { panel.hidden = true; return; }
        panel.hidden = false;
        return;
      }
      header.classList.remove('floating');
      panel.classList.remove('floating');
      close.hidden = false;
      const side = obSide(), all = obAllEl;
      watchSide(side);
      const show = !!(OB.on && obEl && obEl.isConnected && obEl.style.display !== 'none' && all && all.isConnected && obSidebarVisible(side));
      if (!show) { header.hidden = true; panel.hidden = true; csTitle.hidden = true; return; }
      const sr = (document.documentElement.hasAttribute('data-neb-peek') && side.querySelector('.notion-sidebar') || side).getBoundingClientRect(), ar = all.getBoundingClientRect();
      const x = Math.round((obEl.getBoundingClientRect().left || sr.left) + obRailW + 8);
      const w = Math.floor(sr.right - x - 8);
      if (w < 70 || !ar.height) { header.hidden = true; panel.hidden = true; csTitle.hidden = true; return; }
      /* Stella の見出しは「すべて」の段のすぐ下（その分、サイドバーの中身を下げる — obFixLayout） */
      csTitle.hidden = true;   // v97: Stella の上には見出しを置かない（惑星は Orbit と子午線の接点で伝える）
      header.hidden = false;
      const ph = w < 220 ? '検索・ぶりに聞く' : 'B.U.R.I に聞く・Notion を検索';   // v77: 狭いサイドバーで見切れない
      if (input.placeholder !== ph) input.placeholder = ph;
      const y = Math.round(ar.top + (ar.height - 40) / 2);
      try { stellaTitle(); } catch (e) { /* noop */ }
      setS(header, 'left', x + 'px'); setS(header, 'top', y + 'px'); setS(header, 'width', w + 'px');
      try { pillFit(); } catch (e) { /* まだ作っていない */ }
      if (!panelOpen) { panel.hidden = true; return; }
      panel.hidden = false;
      const pt = y + 40 + 6;
      const pw = Math.max(200, Math.min(Math.max(w, 340), window.innerWidth - x - 12));
      setS(panel, 'left', x + 'px'); setS(panel, 'top', pt + 'px'); setS(panel, 'width', pw + 'px');
      setS(panel, 'max-height', Math.max(180, Math.min(620, window.innerHeight - pt - 12)) + 'px');
    }

    input.addEventListener('compositionstart', () => { composing = true; });
    input.addEventListener('compositionend', () => { composing = false; });
    /* v52: サイドの検索窓を押したら Notion の検索画面（B.U.R.I 入り）を開く。⌘⌥B の浮かぶ B.U.R.I はこれまで通り */
    const fused = () => NS.on && !floatMode;
    input.addEventListener('focus', () => { if (fused()) nsOpenFromSide(input.value, false); else openPanel(); });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      /* v57: 誤送信防止 — ↵ は送らない（検索画面を開いて言葉を入れておく）。⌘↵ / Ctrl+Enter で聞く */
      if (e.key === 'Enter') {
        if (e.isComposing || composing || e.keyCode === 229) return; e.preventDefault();
        const mod = e.metaKey || e.ctrlKey;
        if (fused()) nsOpenFromSide(input.value, mod);
        else if (mod) submit();
        else if (input.value.trim()) { const ph = input.placeholder; input.placeholder = (IS_MAC ? '⌘' : 'Ctrl') + '+Enter で送ります'; input.classList.add('c33-nudge'); setTimeout(() => { input.placeholder = ph; input.classList.remove('c33-nudge'); }, 2400); }
      }
      else if (e.key === 'Escape') { e.preventDefault(); closePanel(); input.blur(); }
    });
    go.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (fused()) { nsOpenFromSide(input.value, !!input.value.trim()); return; } if (input.value.trim()) submit(); else { input.focus(); openPanel(); } });
    close.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeSidebar(); });
    bImp.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); file.click(); });
    bSave.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const r = BURI.save(); addBuri({ text: r.message, cards: [], chips: [], actions: [] }); });
    bForget.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const r = BURI.forget(); addBuri({ text: r.message, cards: [], chips: [], actions: [] }); });
    bX.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closePanel(); });
    /* v52: AI の設定（サイドの B.U.R.I と ⌘K の答え欄の両方で使う）。鍵は ScriptCat の保存場所だけに置く */
    function aiSettings(host, say, onDone) {
      const A = BURI.AI, T = BURI.TEAM;
      const box = mk('div', 'bs-card', null, host);
      ['keydown', 'keyup', 'keypress', 'input', 'paste'].forEach((t) => box.addEventListener(t, (e) => e.stopPropagation()));
      mk('h4', null, 'AI の設定', box);
      mk('div', 'bs-lb', 'ぶりが呼ぶ名前', box);
      const nk = mk('input', 'bs-in', null, box); nk.type = 'text'; nk.value = BURI.nick(); nk.placeholder = 'Wパパ';
      mk('div', 'bs-lb', '答え方', box);
      const seg = mk('div', 'bs-seg', null, box);
      const s1 = mk('button', null, 'ひとつの AI で答える', seg); s1.type = 'button';
      const s2 = mk('button', null, 'みんなで相談（MoA）', seg); s2.type = 'button';
      let moa = A.moa;
      const segPaint = () => { s1.classList.toggle('on', !moa); s2.classList.toggle('on', moa); segNote.textContent = moa ? '鍵の入った仲間がそれぞれ下書き → メインが根拠と照らして一つにまとめます。賢くなる代わりに、1 回の質問で（仲間の数＋1）回使います。' : 'メインの AI だけが答えます。速く、回数も 1 回だけです。'; };
      const segNote = mk('div', 'bs-nt', '', box);
      s1.addEventListener('click', (e) => { e.preventDefault(); moa = false; segPaint(); });
      s2.addEventListener('click', (e) => { e.preventDefault(); moa = true; segPaint(); });
      segPaint();
      mk('div', 'bs-lb', 'メイン（ひとつの時に答える AI・相談の時のまとめ役）', box);
      const pv = mk('select', 'bs-sel', null, box);
      BURI.PROVIDERS.forEach(([v, l]) => { const o = mk('option', null, l, pv); o.value = v; if (v === A.provider) o.selected = true; });
      mk('div', 'bs-lb', 'まとめ役（相談の時、下書きを一つにする AI）', box);
      const ag = mk('select', 'bs-sel', null, box);
      [['auto', 'おまかせ（NVIDIA があれば NVIDIA・いちばん賢い）'], ['main', 'メインと同じ']].concat(BURI.TEAM_IDS.filter((id) => id !== 'chrome').map((id) => [id, T[id].name])).forEach(([v, l]) => { const o = mk('option', null, l, ag); o.value = v; if (v === (A.agg || 'auto')) o.selected = true; });
      mk('div', 'bs-lb', '相談の人数（まとめ役も入れて。多いほど賢く、そのぶん遅く・回数を使う）', box);
      const sz = mk('select', 'bs-sel', null, box);
      [[2, '2 人（速い）'], [3, '3 人'], [4, '4 人（おすすめ）'], [5, '5 人'], [6, '6 人'], [9, '全員']].forEach(([v, l]) => { const o = mk('option', null, l, sz); o.value = v; if (v === A.size) o.selected = true; });
      mk('div', 'bs-lb', '仲間（上から順に優先。おすすめは上の 4 つ。無料の鍵は、それぞれのサイトでカード登録なしで作れます）', box);
      const rows = {};
      BURI.TEAM_IDS.forEach((id) => {
        const t = T[id], r = mk('div', 'bs-row', null, box);
        const lab = mk('label', 'bs-nmw', null, r);
        const cb = mk('input', null, null, lab); cb.type = 'checkbox'; cb.checked = !!A.use[id];
        mk('span', 'bs-dot' + (BURI.ready(id) ? ' set' : ''), null, lab);
        mk('span', 'bs-nm', t.name, lab);
        mk('span', 'bs-tag' + (t.free ? '' : ' paid'), t.free ? '無料' : '有料', lab);
        if (t.keyUrl) { const a = mk('a', 'bs-link', '鍵を作る ↗', r); a.href = t.keyUrl; a.target = '_blank'; a.rel = 'noopener'; } else mk('span', null, '', r);
        if (BURI.resting(id)) mk('div', 'bs-nt', '（いま休み中: ' + BURI.resting(id) + ' まで。「つながるか試す」で戻せます）', r).style.color = '#b5600a';
        mk('div', 'bs-nt', t.note + (id === 'chrome' ? (BURI.chromeLM() ? '（この Chrome で使えます）' : '（この Chrome では見つかりません）') : ''), r);
        let key = null, sel = null;
        if (!t.nokey) {
          const kw = mk('div', 'bs-kw', null, r);
          key = mk('input', null, null, kw); key.type = 'password'; key.autocomplete = 'off'; key.placeholder = A.keys[id] ? '入っています（替える時だけ入力）' : t.ph;
          const del = mk('button', 'bs-x', '×', kw); del.type = 'button'; del.title = 'この鍵を消す'; del.hidden = !A.keys[id];
          del.addEventListener('click', (e) => { e.preventDefault(); BURI.setKey(id, ''); key.placeholder = t.ph; del.hidden = true; r.querySelector('.bs-dot').className = 'bs-dot'; });
        }
        if (id === 'gemini' || id === 'claude') {
          sel = mk('select', 'bs-sel', null, r);
          (id === 'claude' ? BURI.AI_MODELS : BURI.GEMINI_MODELS).forEach(([v, l]) => { const o = mk('option', null, l, sel); o.value = v; if (v === (id === 'claude' ? A.model : A.gmodel)) o.selected = true; });
        }
        rows[id] = { cb, key, sel, row: r };
      });
      const opts = mk('div', 'bs-opts', null, box);
      const tog = (label, val) => { const l = mk('label', null, null, opts); const c = mk('input', null, null, l); c.type = 'checkbox'; c.checked = val; l.append(' ' + label); return c; };
      const wc = tog('Google と Wikipedia でも調べる（無料）', A.web);
      const nc = { checked: false };
      const ac = { checked: false };
      const xc = { checked: false };
      const lc = tog('ぶりレンズ — ページの文字を選ぶと ✦（説明・要約・言い換え・訳す・続き。⌃⌥J）', NS.lens !== false);
      const oc = tog('おかえりハイライト — 前に見た時から変わった段を光らせる（⌃⌥N で次へ。覚えるのは段の指紋だけ）', NS.okaeri !== false);
      mk('div', 'bs-nt', '無料枠では、送った質問と見つけた抜粋がそれぞれの会社の改善に使われることがあります。鍵はこの端末の ScriptCat の中だけに保存します。', box);
      const btns = mk('div', 'bs-btns', null, box);
      const ok = mk('button', 'pri', '保存', btns); ok.type = 'button';
      const ts = mk('button', null, 'つながるか試す', btns); ts.type = 'button';
      const rs = mk('button', null, '会話を忘れる', btns); rs.type = 'button';
      const cl = mk('button', null, '閉じる', btns); cl.type = 'button';
      const out = mk('div', 'bs-out', BURI.lastErr() ? '前回のつまずき:\n' + BURI.lastErr() : '', box);
      const save = () => {
        for (const id of BURI.TEAM_IDS) {
          const r = rows[id]; A.use[id] = r.cb.checked;
          const k = r.key && r.key.value.trim(); if (k) { BURI.setKey(id, k); r.key.value = ''; r.key.placeholder = '入っています（替える時だけ入力）'; }
          if (id === 'gemini' && r.sel) { A.gmodel = r.sel.value; BURI.gmSet('c33.buri.gmodel', A.gmodel); }
          if (id === 'claude' && r.sel) { A.model = r.sel.value; BURI.gmSet('c33.buri.model', A.model); }
          r.row.querySelector('.bs-dot').classList.toggle('set', BURI.ready(id));
        }
        BURI.gmSet('c33.buri.use', A.use);
        BURI.gmSet('c33.buri.nick', nk.value.trim() || 'Wパパ');
        A.moa = moa; BURI.gmSet('c33.buri.moa', moa);
        A.size = Number(sz.value) || 4; BURI.gmSet('c33.buri.size', A.size);
        A.provider = pv.value; BURI.gmSet('c33.buri.provider', A.provider);
        A.agg = ag.value; BURI.gmSet('c33.buri.agg', A.agg);
        A.web = wc.checked; BURI.gmSet('c33.buri.web', A.web);
        NS.on = nc.checked; NS.auto = ac.checked; BURI.gmSet('c33.buri.ns', NS.on); BURI.gmSet('c33.buri.nsAuto', NS.auto);
        NS.nx = xc.checked; BURI.gmSet('c33.buri.nx', NS.nx);
        NS.lens = lc.checked; BURI.gmSet('c33.buri.lens', NS.lens);
        NS.okaeri = oc.checked; BURI.gmSet('c33.buri.okaeri', NS.okaeri);
        document.documentElement.toggleAttribute('data-c33-ok-off', !NS.okaeri);
        footText();
      };
      ok.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); save();
        const t = BURI.team();
        say(!BURI.aiOn() ? (A.provider === 'none' ? 'AI は使わずに、見つけたものをつないで答えます。' : '保存しました。鍵がまだ入っていないので、しばらくは抜粋で答えます。')
          : BURI.moaOn() ? t.length + ' 人で相談して答えます（' + t.map((id) => T[id].name).join('・') + '、まとめ役は ' + T[t[0]].name + '）。なんでも聞いてください。' : BURI.aiName() + ' で準備できました。なんでも聞いてください。');
        if (onDone) onDone();
      });
      ts.addEventListener('click', async (e) => {
        e.preventDefault(); e.stopPropagation(); save();
        const ids = BURI.TEAM_IDS.filter((id) => BURI.ready(id) && (A.use[id] || id === A.provider));
        if (!ids.length) { out.textContent = '鍵の入った仲間がいません。'; return; }
        out.textContent = '確かめています…（' + ids.map((id) => T[id].name).join('・') + '）';
        const res = await Promise.all(ids.map((id) => BURI.aiTest(id).then((r) => ({ id, r }))));
        out.textContent = res.map(({ id, r }) => (r.text ? '✓ ' : '× ') + T[id].name + (r.text ? '（' + (r.model || '') + '）' : '：' + r.err + (r.detail ? '\n    ' + String(r.detail).replace(/\n/g, '\n    ') : ''))).join('\n');
        res.forEach(({ id, r }) => { const d = rows[id].row.querySelector('.bs-dot'); d.classList.toggle('ok', !!r.text); d.classList.toggle('ng', !r.text); });
      });
      rs.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); BURI.aiReset(); nsConv.length = 0; say('これまでの会話を忘れました。'); });
      cl.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (onDone) onDone(); });
      return box;
    }
    bAI.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const m = mk('div', 'cb-msg', null, log);
      mk('div', 'cb-av', AVATAR, m);
      const b = mk('div', 'cb-body', null, m); b.style.flex = '1 1 auto';
      aiSettings(b, (t) => addBuri({ text: t, cards: [], chips: [], actions: [] }), () => m.remove());
      scrollEnd();
    });
    file.addEventListener('change', () => { const f = file.files && file.files[0]; file.value = ''; npImport(f); });
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePanel(); } });
    document.addEventListener('pointerdown', (e) => {
      if (!panelOpen) return;
      const t = e.target;
      if (header.contains(t) || panel.contains(t)) return;
      closePanel();
    }, true);
    
    /* v97: ⌃⌥B は新しいパネル（下の Nebius ('-' 鰤)з セクション） */
    
    /* ============================================================
     *  v56: B.U.R.I × Notion の検索画面 — 作り直し（Figma 風の静かな UI・顔文字は丸ゴシック・気分で顔が変わる）
     *   ・右の欄: 上に「顔のピル・名前・いまの様子・アイコンのボタン」。考え中は道のり（タイムライン）のカード。
     *     答えは本文＋出典のカード＋コピー / もう一度 / 相談の中身 / 次に聞けそうなこと。下は送るボタンつきの入力欄。
     *   ・気分: 調べる時は ('-' 鯖)з📡、下書きは 🐟('-' 鰤)з🔥、褒められたら ('-' 鯛)з、大発見は ('-' 鮪)з … AI も気分を返す。
     *   ・サイドの検索窓を押すと検索画面が開いてホーム（ε( ε,'-')('-' 鰤)з♥ のあいさつ・最近・聞いてみる）。
     * ============================================================ */
    if (!BURI.gmGet('c33.buri.v57', false)) { BURI.gmSet('c33.buri.nsAuto', false); BURI.gmSet('c33.buri.v57', true); }   // v57: 一度だけ「自動で答える」を切る（誤送信防止）
    const NS = { on: false, auto: false };   // v97: Notion の検索（⌘K）への同居はやめた — ⌘K は ('-' 鰤)з のパネル。純正の検索は候補の「Notion で全文検索」から   // v57: 誤送信防止のため、打っている途中で勝手に聞くのは既定で切る
    const nsCache = new Map();
    const nsConv = [];   // 会話 [{ q, res }]（検索画面を閉じても少しの間は覚えておく）
    let nsConvAt = 0;
    const RE_QUESTION = /(教えて|おしえて|とは|って何|ってなに|って誰|ってだれ|について|知りたい|なぜ|どうして|どうやって|おすすめ|[?？]\s*$)/u;
    const EXAMPLES = [['📚', '東野圭吾について教えて'], ['🔍', '本棚で未読のミステリーは？'], ['✨', '最近読んだ本のおすすめは？'], ['🗂', 'ガリレオシリーズの順番は？']];
    const hist = () => { const h = BURI.gmGet('c33.buri.hist', []); return Array.isArray(h) ? h : []; };
    const histAdd = (q) => { const h = hist().filter((x) => x !== q); h.unshift(q); BURI.gmSet('c33.buri.hist', h.slice(0, 12)); };
    const nick = () => BURI.nick();
    /* 気分 → 顔（説明書 ver.9 の表から） */
    const FACE = {
      normal: "('-' 鰤)з", happy: "('-' 鰤)з✨", joy: "('-' 鰤)з♥✨", shy: "('-' 鰤)з…///", kyun: "('-' 鰤)з…♥", proud: "('-' 鰤)з👑✨", satisfied: "('-' 鰤)з♪",
      thanks: "('-' 鰤)з♥✨💧", sad: "('-' 鰤)з💧", cry: "('-' 鰤)з💧💧", setsunai: "('-' 鰤)з…", panic: "('-' 鰤)з💦", angry: "('-' 鰤)з💢", fire: "('-' 鰤)з🔥",
      think: "('-' 鰤)з…", sulk: "('-' 鰤)з……", geffun: "('-' 鰤)з………♥♥♥", search: "('-' 鯖)з📡", reward: "('-' 鯛)з✨", alarm: "('-' 鰤)з('-' 鮪)з💥🔍",
      excited: "('-' 鰯)з('-' 鰯)з('-' 鰯)з✨", celebrate: "('-' 鰤)з('-' 鰤)з('-' 鰤)з✨✨✨", together: "ε( ε,'-')('-' 鰤)з♥", write: "🐟('-' 鰤)з🔥",
      merge: "('-' 鰤)з…✨", away: "('-' 鰤)з……🌙", back: "('-' 🐋)з ('-' 鰤)з♥✨！", nag: "('-' 鮭)з"
    };
    const BUSY = { think: '会話を読んでいます…', search: '鯖が情報を集めています', write: '仲間と下書きしています', merge: 'ひとつにまとめています' };
    const moodOf = (res) => {
      if (res && res.mood && FACE[res.mood]) return res.mood;
      const t = String(res && res.text || '');
      if (/鯛/.test(t)) return 'reward'; if (/鮪|食い違/.test(t)) return 'alarm'; if (/ゲフン/.test(t)) return 'geffun';
      if (/分かりませんでした|見つかりませんでした|つまずき|お休み中/.test(t)) return 'sad';
      if (/♥/.test(t)) return 'kyun'; if (/✨/.test(t)) return 'happy';
      return 'satisfied';
    };
    const IC = {
      home: '<path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.5 9.2V20h13V9.2"/><path d="M10 20v-5h4v5"/>',
      tune: '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
      edit: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M14.5 7.5l2 2"/>',
      side: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>',
      x: '<path d="M17.5 6.5l-11 11M6.5 6.5l11 11"/>',
      copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.2"/><path d="M15.5 8.5V6.2A1.7 1.7 0 0 0 13.8 4.5H6.2A1.7 1.7 0 0 0 4.5 6.2v7.6c0 .9.8 1.7 1.7 1.7h2.3"/>',
      retry: '<path d="M20 11.5a8 8 0 1 1-2.4-5.7"/><path d="M20 4.5v4.5h-4.5"/>',
      send: '<path d="M12 18.5v-13"/><path d="M6.5 11 12 5.5l5.5 5.5"/>',
      arrow: '<path d="M8 16l8-8"/><path d="M9.5 8H16v6.5"/>',
      clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.6V12l3 1.8"/>',
      users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.6 19.5c.7-3 2.8-4.6 5.4-4.6s4.7 1.6 5.4 4.6"/><circle cx="16.8" cy="9.4" r="2.4"/><path d="M16.4 14.2c2.2.2 3.6 1.6 4 4.3"/>',
      check: '<path d="M5.5 12.5l4 4 9-9"/>',
      down: '<path d="M7 10l5 5 5-5"/>',
      book: '<path d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z"/><path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H18"/>',
      brain: '<path d="M9.2 4.6a2.8 2.8 0 0 0-2.9 2.6 2.9 2.9 0 0 0-1.6 5 3 3 0 0 0 1.7 4.6 2.7 2.7 0 0 0 2.8 2.6h.6V4.7Z"/><path d="M14.8 4.6a2.8 2.8 0 0 1 2.9 2.6 2.9 2.9 0 0 1 1.6 5 3 3 0 0 1-1.7 4.6 2.7 2.7 0 0 1-2.8 2.6h-.6V4.7Z"/><path d="M9.8 9.5H8.2M14.2 9.5h1.6M9.8 14.2H8M14.2 14.2H16"/>',
      plus: '<path d="M12 5.5v13M5.5 12h13"/>',
      trash: '<path d="M5 7h14"/><path d="M9.5 7V5.2h5V7"/><path d="M7 7l.8 12h8.4L17 7"/>',
      md: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M6.5 15V9l2.5 3 2.5-3v6"/><path d="M16.5 9v6M14.5 13l2 2 2-2"/>',
      page: '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20Z"/><path d="M14 3.5V8h4"/><path d="M9.5 12.5h5M9.5 15.5h5"/>',
      spark: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1-5.1-1.9 5.1-1.9Z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z"/>'
    };
    const MOD = IS_MAC ? '⌘' : 'Ctrl';
    const svg = (k, sz) => '<svg viewBox="0 0 24 24" width="' + (sz || 16) + '" height="' + (sz || 16) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[k] + '</svg>';
    const ib = (host, icon, title, fn, cls) => { const b = mk('button', 'np-ib' + (cls ? ' ' + cls : ''), null, host); b.type = 'button'; b.dataset.k = icon; b.innerHTML = svg(icon); b.title = title; b.setAttribute('aria-label', title); b.addEventListener('mousedown', (e) => e.preventDefault()); b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(b); }); return b; };
    /* v57: 顔文字は、ほかのどんな書体の指定にも負けないよう要素に直接（!important）丸ゴシックを当てる。
       Firefox の「指紋対策」で Mac の丸ゴシックが使えない時のために、ウェブ書体（Zen Maru Gothic）も読み込む */
    const FACE_FONT = 'var(--buri-face)', UI_FONT = 'var(--buri-ui)';
    const lockFace = (el) => { el.style.setProperty('font-family', FACE_FONT, 'important'); el.style.setProperty('font-style', 'normal', 'important'); return el; };
    const faceEl = (host, mood, cls) => { const f = mk('span', 'b-face' + (cls ? ' ' + cls : ''), FACE[mood] || FACE.normal, host); f.dataset.mood = mood; return lockFace(f); };
    function fontLock(root) {
      if (!root || root.__c33fl) return;
      root.__c33fl = true;
      const fix = (el) => { if (!(el instanceof HTMLElement)) return; if (el.classList.contains('b-face')) lockFace(el); else if (!el.closest('.b-face')) el.style.setProperty('font-family', UI_FONT, 'important'); };
      const all = (n) => { if (!(n instanceof HTMLElement)) return; fix(n); n.querySelectorAll('*').forEach(fix); };
      all(root);
      new MutationObserver((ms) => { for (const m of ms) m.addedNodes.forEach(all); }).observe(root, { childList: true, subtree: true });
    }
    const WEB_FONTS = ['zen-maru-gothic@5/500.css', 'zen-maru-gothic@5/700.css', 'zen-kaku-gothic-new@5/400.css', 'zen-kaku-gothic-new@5/500.css', 'zen-kaku-gothic-new@5/700.css'];
    function webFonts() {
      if (document.getElementById('c33-wf-0')) return;
      WEB_FONTS.forEach((f, i) => { const l = mk('link'); l.id = 'c33-wf-' + i; l.rel = 'stylesheet'; l.href = 'https://cdn.jsdelivr.net/npm/@fontsource/' + f; (document.head || document.documentElement).appendChild(l); });
    }
    webFonts();
    const hue = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.codePointAt(0)) % 360; return h; };
    const nsStyle = mk('style'); nsStyle.id = 'c33-ns-css';
    nsStyle.textContent = `
:root { --buri-face: "Hiragino Maru Gothic ProN", "Hiragino Maru Gothic Pro", "Zen Maru Gothic", "ヒラギノ丸ゴ ProN", "M PLUS Rounded 1c", "Kosugi Maru", "BIZ UDPGothic", "Hiragino Sans", "Yu Gothic UI", "Noto Sans JP", "Apple Color Emoji", "Segoe UI Emoji", system-ui, sans-serif;
  --buri-ui: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Zen Kaku Gothic New", "Noto Sans JP", "Yu Gothic UI", "Apple Color Emoji", "Segoe UI Emoji", sans-serif; }
#c33-ns, #c33-nsp { --b-acc: var(--lm-accent, #2783de); --b-acc2: #8b6cd9; --b-ink: var(--c-texPri, #2f2e2b); --b-sub: var(--c-texSec, #73726e); --b-ter: var(--c-texTer, #a3a29e);
  --b-line: var(--ca-borSecTra, rgba(55,53,47,.1)); --b-soft: var(--ca-bacIntTra, rgba(55,53,47,.05)); --b-bg: var(--c-bacPri, #fff); --b-ok: #2e9e6a; --b-ng: #d44c47; }
#c33-ns, #c33-ns *, #c33-nsp, #c33-nsp * { font-family: var(--buri-ui) !important; box-sizing: border-box; }
#c33-ns .b-face, #c33-nsp .b-face, #c33-buri .cb-av, #c33-buri .b-face { font-family: var(--buri-face) !important; font-weight: 500 !important; letter-spacing: 0 !important; font-style: normal !important; font-feature-settings: normal !important; white-space: nowrap; }
.b-face.pop { animation: bFacePop .45s cubic-bezier(.2,1.6,.4,1); }
@keyframes bFacePop { 0% { transform: scale(.82); opacity: .4; } 100% { transform: none; opacity: 1; } }
/* ---------- 左の一覧の段 ---------- */
#c33-ns { display: flex; flex-direction: column; padding: 2px 10px 4px; color: var(--b-ink); }
#c33-ns[hidden] { display: none !important; }
#c33-ns .ns-h { display: flex; align-items: center; gap: 8px; padding: 12px 8px 6px; font-size: 12px; color: var(--b-ter); }
#c33-ns .ns-h b { font-weight: 600; color: var(--b-sub); letter-spacing: .02em; }
#c33-ns .ns-tag { margin-inline-start: auto; display: inline-flex; align-items: center; gap: 5px; padding: 1px 8px 1px 6px; border-radius: 999px; font-size: 11px; color: var(--b-sub); background: var(--b-soft); }
#c33-ns .ns-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--b-ok); }
#c33-ns .ns-row { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 38px; margin: 0; padding: 5px 8px; border: 0; border-radius: 10px; background: transparent; color: inherit; font-size: 14px; text-align: start; cursor: pointer; transition: background .15s; }
#c33-ns .ns-row:hover, #c33-ns .ns-row.on { background: var(--b-soft); }
#c33-ns .ns-row .b-face { flex: none; padding: 2px 8px; border-radius: 999px; font-size: 11px; color: var(--b-ink); background: linear-gradient(135deg, color-mix(in srgb, var(--b-acc) 16%, var(--b-bg)), color-mix(in srgb, var(--b-acc2) 14%, var(--b-bg))); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 18%, transparent); }
#c33-ns .ns-lb { flex: none; font-weight: 550; }
#c33-ns .ns-spark { display: none; flex: none; place-items: center; width: 28px; height: 24px; border-radius: 999px; color: var(--b-acc); background: color-mix(in srgb, var(--b-acc) 10%, transparent); }
#c33-ns .ns-row.on .b-face { display: none; }
#c33-ns .ns-row.on .ns-spark { display: inline-grid; }
#c33-ns .ns-q { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px; color: var(--b-ter); }
#c33-ns .ns-kb { flex: none; padding: 1px 6px; border-radius: 5px; font-size: 10.5px; color: var(--b-ter); box-shadow: inset 0 0 0 1px var(--b-line); }
#c33-ns .ns-kb:empty { display: none; }
#c33-ns .ns-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 8px 8px 8px; }
#c33-ns .ns-chips button, #c33-nsp .np-pill { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; margin: 0; padding: 4px 11px; border: 0; border-radius: 999px; background: var(--b-bg); box-shadow: inset 0 0 0 1px var(--b-line); color: var(--b-sub); font-size: 12px; line-height: 1.5; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: background .15s, color .15s, box-shadow .15s; }
#c33-ns .ns-chips button:hover, #c33-nsp .np-pill:hover { background: var(--b-soft); color: var(--b-ink); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 30%, var(--b-line)); }
#c33-ns .ns-chips button i, #c33-nsp .np-pill i { font-style: normal; opacity: .75; }
#c33-ns .ns-chips button svg, #c33-nsp .np-pill svg { width: 13px; height: 13px; flex: none; opacity: .7; }
#c33-ns .ns-ans { margin: 4px 8px 8px; padding: 12px 14px; border-radius: 12px; background: var(--b-bg); box-shadow: inset 0 0 0 1px var(--b-line); max-height: 42vh; overflow-y: auto; overscroll-behavior: contain; }
#c33-ns .ns-ans[hidden] { display: none; }
#c33-ns .ns-tx { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 13.5px; line-height: 1.75; }
#c33-ns .ns-src { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 8px; font-size: 12px; }
#c33-ns .ns-src a, #c33-ns .ns-src button { margin: 0; padding: 0; border: 0; background: none; font-size: 12px; color: var(--b-acc); text-decoration: none; cursor: pointer; }
#c33-ns .thinking-dots { display: inline-flex; gap: 4px; align-items: center; height: 16px; }
#c33-ns .thinking-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--b-ter); animation: bounce 1.4s infinite ease-in-out both; }
/* ---------- 右の欄 ---------- */
#c33-nsp { position: absolute; inset: 0; z-index: 6; display: flex; flex-direction: column; padding: 34px 14px 16px 16px; color: var(--b-ink); }
#c33-nsp[hidden] { display: none !important; }
#c33-nsp .np-card { position: relative; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; background: var(--b-bg);
  box-shadow: 0 0 0 1px var(--b-line), 0 1px 2px rgba(15,15,15,.04), 0 16px 40px -14px rgba(15,15,15,.2); }
#c33-nsp .np-aura { position: absolute; inset: 0 0 auto 0; height: 140px; pointer-events: none; opacity: .95;
  background: radial-gradient(110% 100% at 0% 0%, color-mix(in srgb, var(--b-acc) 15%, transparent), transparent 62%), radial-gradient(80% 90% at 100% 0%, color-mix(in srgb, var(--b-acc2) 13%, transparent), transparent 60%);
  -webkit-mask-image: linear-gradient(#000, transparent); mask-image: linear-gradient(#000, transparent); transition: opacity .3s; }
#c33-nsp.busy .np-aura { animation: npAura 3.2s ease-in-out infinite alternate; }
@keyframes npAura { from { filter: hue-rotate(0deg); opacity: .8; } to { filter: hue-rotate(40deg); opacity: 1; } }
#c33-nsp .np-top { position: relative; display: flex; align-items: center; gap: 10px; padding: 14px 12px 12px 14px; }
#c33-nsp .np-top .b-face { flex: none; display: inline-flex; align-items: center; height: 28px; padding: 0 10px; border-radius: 999px; font-size: 12.5px; line-height: 1; color: var(--b-ink); background: var(--b-bg);
  box-shadow: 0 0 0 1px var(--b-line), 0 3px 10px -5px rgba(15,15,15,.2); }
#c33-nsp.busy .np-top .b-face { animation: npBob 1.3s ease-in-out infinite; }
@keyframes npBob { 50% { transform: translateY(-2px) rotate(-2deg); } }
#c33-nsp .np-id { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
#c33-nsp .np-name { font-size: 14px; font-weight: 650; letter-spacing: .03em; line-height: 1.25; }
#c33-nsp .np-status { display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 11.5px; color: var(--b-ter); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#c33-nsp .np-status i { flex: none; width: 6px; height: 6px; border-radius: 50%; background: var(--b-ok); }
#c33-nsp .np-status i.off { background: var(--b-ter); }
#c33-nsp.busy .np-status i { background: var(--b-acc); animation: npPulse 1s ease-in-out infinite; }
@keyframes npPulse { 50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--b-acc) 20%, transparent); } }
#c33-nsp .np-status span { overflow: hidden; white-space: normal; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
#c33-nsp .np-tools { flex: none; display: flex; gap: 2px; padding: 3px; border-radius: 11px; background: color-mix(in srgb, var(--b-bg) 80%, transparent); box-shadow: inset 0 0 0 1px var(--b-line); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
#c33-nsp .np-ib { display: inline-grid; place-items: center; width: 28px; height: 28px; margin: 0; padding: 0; border: 0; border-radius: 8px; background: transparent; color: var(--b-sub); cursor: pointer; transition: background .15s, color .15s; }
#c33-nsp .np-ib:hover { background: var(--b-soft); color: var(--b-ink); }
#c33-nsp .np-ib.on { background: color-mix(in srgb, var(--b-acc) 12%, transparent); color: var(--b-acc); }
#c33-nsp .np-sep { width: 1px; margin: 5px 2px; background: var(--b-line); }
#c33-nsp .np-log { position: relative; flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 6px 16px 18px; display: flex; flex-direction: column; gap: 16px; scrollbar-width: thin; }
/* ホーム */
#c33-nsp .np-hero { display: flex; flex-direction: column; gap: 6px; padding: 6px 2px 2px; }
#c33-nsp .np-hello { margin-top: 2px; font-size: 21px; line-height: 1.35; font-weight: 650; letter-spacing: .01em; }
#c33-nsp .np-sub { font-size: 13px; line-height: 1.7; color: var(--b-sub); }
#c33-nsp .np-stat { display: flex; flex-wrap: wrap; gap: 6px; }
#c33-nsp .np-stat span, #c33-nsp .np-stat button { display: inline-flex; align-items: center; gap: 6px; margin: 0; padding: 3px 10px; border: 0; border-radius: 999px; font-size: 11.5px; line-height: 1.6; color: var(--b-sub); background: var(--b-soft); }
#c33-nsp .np-stat button { cursor: pointer; background: transparent; box-shadow: inset 0 0 0 1px var(--b-line); }
#c33-nsp .np-stat button:hover { color: var(--b-ink); background: var(--b-soft); }
#c33-nsp .np-stat i { width: 6px; height: 6px; border-radius: 50%; background: var(--b-ok); }
#c33-nsp .np-stat i.off { background: var(--b-ter); }
#c33-nsp .np-sec { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 11.5px; font-weight: 600; letter-spacing: .04em; color: var(--b-ter); }
#c33-nsp .np-sec::after { content: ''; flex: 1; height: 1px; background: var(--b-line); }
#c33-nsp .np-rows { display: flex; flex-direction: column; gap: 2px; margin-top: -6px; }
#c33-nsp .np-row { display: flex; align-items: center; gap: 10px; width: 100%; margin: 0; padding: 7px 8px; border: 0; border-radius: 9px; background: transparent; color: var(--b-ink); font-size: 13px; text-align: start; cursor: pointer; }
#c33-nsp .np-row:hover { background: var(--b-soft); }
#c33-nsp .np-row svg { flex: none; color: var(--b-ter); }
#c33-nsp .np-row span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-nsp .np-row .go { opacity: 0; transition: opacity .15s; }
#c33-nsp .np-row:hover .go { opacity: 1; }
#c33-nsp .np-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: -6px; }
#c33-nsp .np-sug { display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 11px 12px; border: 0; border-radius: 12px; background: var(--b-bg); box-shadow: inset 0 0 0 1px var(--b-line); color: var(--b-ink); font-size: 12.5px; line-height: 1.5; text-align: start; cursor: pointer; transition: box-shadow .15s, transform .15s; }
#c33-nsp .np-sug:hover { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 35%, var(--b-line)), 0 6px 16px -10px rgba(15,15,15,.25); transform: translateY(-1px); }
#c33-nsp .np-sug i { font-style: normal; font-size: 15px; }
/* 会話 */
#c33-nsp .np-q { align-self: flex-end; max-width: 86%; white-space: pre-wrap; padding: 8px 13px; border-radius: 16px 16px 5px 16px; font-size: 13.5px; line-height: 1.6; overflow-wrap: anywhere;
  background: color-mix(in srgb, var(--b-acc) 11%, var(--b-bg)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 14%, transparent); }
#c33-nsp .np-msg { display: flex; flex-direction: column; gap: 10px; }
#c33-nsp .np-who { display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--b-ter); }
#c33-nsp .np-wic { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 7px; color: var(--b-acc); background: color-mix(in srgb, var(--b-acc) 10%, transparent); }
#c33-nsp .np-wic svg { width: 12px; height: 12px; }
#c33-nsp .np-a { font-size: 14px; line-height: 1.85; overflow-wrap: anywhere; }
#c33-nsp .np-a > * { margin: 0 0 9px; animation: npIn .4s ease-out both; }
#c33-nsp .np-a > *:last-child { margin-bottom: 0; }
#c33-nsp .np-a h5 { font-size: 14.5px; font-weight: 700; margin-top: 4px; }
#c33-nsp .np-a ul, #c33-nsp .np-a ol { padding-inline-start: 1.25em; }
#c33-nsp .np-a li { margin: 3px 0; }
#c33-nsp .np-a li::marker { color: var(--b-ter); }
#c33-nsp .np-a .b-face { padding: 0 2px; }
@keyframes npIn { from { opacity: 0; transform: translateY(4px); } }
#c33-nsp .np-fn { display: inline-flex; gap: 2px; margin-inline-start: 1px; vertical-align: super; font-size: 0; line-height: 0; }
#c33-nsp .np-fnum { display: inline-grid; place-items: center; min-width: 14px; height: 14px; padding: 0 3px; border-radius: 7px; font-size: 9.5px; font-weight: 700; line-height: 14px; text-decoration: none; cursor: pointer;
  color: var(--b-acc); background: color-mix(in srgb, var(--b-acc) 10%, transparent); transition: background .15s, color .15s; }
#c33-nsp .np-fnum.n { color: #2b8a5e; background: color-mix(in srgb, var(--b-ok) 12%, transparent); }
#c33-nsp .np-fnum:hover { color: #fff; background: var(--b-acc); }
#c33-nsp .np-fnum.n:hover { background: var(--b-ok); }
#c33-nsp .np-refs { display: flex; flex-direction: column; gap: 2px; padding: 8px; border-radius: 12px; background: var(--b-soft); }
#c33-nsp .np-refs-h { display: flex; align-items: center; gap: 6px; padding: 0 4px 4px; font-size: 11px; font-weight: 650; letter-spacing: .04em; color: var(--b-ter); }
#c33-nsp .np-ref { display: flex; align-items: flex-start; gap: 8px; padding: 5px 6px; border-radius: 8px; color: var(--b-ink); text-decoration: none; font-size: 12.5px; line-height: 1.45; transition: background .15s; }
#c33-nsp a.np-ref:hover { background: var(--b-bg); }
#c33-nsp .np-ref b { flex: none; display: grid; place-items: center; min-width: 18px; height: 18px; margin-top: 1px; border-radius: 9px; font-size: 10px; font-weight: 700; color: var(--b-acc); background: color-mix(in srgb, var(--b-acc) 12%, transparent); }
#c33-nsp .np-ref b.n { color: #2b8a5e; background: color-mix(in srgb, var(--b-ok) 14%, transparent); }
#c33-nsp .np-ref span { min-width: 0; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
#c33-nsp .np-ref small { margin-inline-start: 6px; font-size: 10.5px; color: var(--b-ter); }
#c33-nsp .np-cite { display: inline-flex; align-items: center; margin: 0 1px; padding: 0 5px; height: 16px; border-radius: 5px; vertical-align: 2px; font-size: 10px; font-weight: 650; text-decoration: none; cursor: pointer;
  background: color-mix(in srgb, var(--b-acc) 11%, transparent); color: var(--b-acc); transition: background .15s; }
#c33-nsp .np-cite.n { background: color-mix(in srgb, var(--b-ok) 13%, transparent); color: #2b8a5e; }
#c33-nsp .np-cite:hover { background: color-mix(in srgb, var(--b-acc) 22%, transparent); }
#c33-nsp .np-src { display: flex; gap: 8px; overflow-x: auto; padding: 1px 1px 4px; scroll-snap-type: x proximity; scrollbar-width: thin; }
#c33-nsp .np-s { flex: none; width: 176px; display: grid; grid-template-columns: 20px 1fr; grid-template-rows: auto auto; gap: 1px 9px; align-items: center; padding: 9px 11px; border-radius: 11px; text-decoration: none; color: var(--b-ink); background: var(--b-bg); box-shadow: inset 0 0 0 1px var(--b-line); scroll-snap-align: start; transition: box-shadow .15s, background .15s; }
#c33-nsp .np-s:hover { background: var(--b-soft); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 25%, var(--b-line)); }
#c33-nsp .np-s .fav { grid-row: span 2; width: 20px; height: 20px; border-radius: 6px; display: grid; place-items: center; font-size: 10.5px; font-weight: 700; color: #fff; }
#c33-nsp .np-s b { font-size: 12px; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-nsp .np-s small { font-size: 10.5px; color: var(--b-ter); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-nsp .np-bar { display: flex; align-items: center; gap: 2px; margin-top: -4px; }
#c33-nsp .np-bar .np-ib { width: 26px; height: 26px; color: var(--b-ter); }
#c33-nsp .np-bar .np-team { display: inline-flex; align-items: center; gap: 6px; margin-inline-start: 4px; padding: 2px 9px 2px 4px; border: 0; border-radius: 999px; background: transparent; color: var(--b-ter); font-size: 11.5px; cursor: pointer; }
#c33-nsp .np-bar .np-team:hover { background: var(--b-soft); color: var(--b-sub); }
#c33-nsp .np-av { display: inline-flex; }
#c33-nsp .np-av b { width: 18px; height: 18px; margin-inline-start: -5px; border-radius: 50%; display: grid; place-items: center; font-size: 9px; font-weight: 700; color: #fff; box-shadow: 0 0 0 2px var(--b-bg); }
#c33-nsp .np-av b:first-child { margin-inline-start: 0; }
#c33-nsp .np-av b.ng { filter: grayscale(1); opacity: .5; }
#c33-nsp .np-drafts { display: none; flex-direction: column; gap: 8px; }
#c33-nsp .np-drafts.on { display: flex; }
#c33-nsp .np-draft { padding: 10px 12px; border-radius: 11px; background: var(--b-soft); font-size: 12.5px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 200px; overflow: auto; color: var(--b-sub); }
#c33-nsp .np-draft b { display: block; margin-bottom: 4px; font-size: 11.5px; color: var(--b-ink); }
#c33-nsp .np-next { display: flex; flex-wrap: wrap; gap: 6px; }
/* 考え中のカード */
#c33-nsp .np-think { display: flex; gap: 12px; padding: 12px 14px; border-radius: 14px; background: linear-gradient(135deg, color-mix(in srgb, var(--b-acc) 7%, var(--b-bg)), color-mix(in srgb, var(--b-acc2) 6%, var(--b-bg))); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 14%, var(--b-line)); }
#c33-nsp .np-orb { flex: none; align-self: flex-start; width: 10px; height: 10px; margin: 5px 2px 0; border-radius: 50%; background: linear-gradient(135deg, var(--b-acc), var(--b-acc2)); box-shadow: 0 0 0 4px color-mix(in srgb, var(--b-acc) 14%, transparent); animation: npPulse 1.1s ease-in-out infinite; }
#c33-nsp .np-tl { position: relative; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; padding-inline-start: 16px; }
#c33-nsp .np-tl::before { content: ''; position: absolute; inset-inline-start: 4px; top: 8px; bottom: 8px; width: 1.5px; border-radius: 1px; background: var(--b-line); }
#c33-nsp .np-step { position: relative; display: flex; flex-direction: column; font-size: 12.5px; line-height: 1.5; color: var(--b-sub); }
#c33-nsp .np-step::before { content: ''; position: absolute; inset-inline-start: -16px; top: 5px; width: 9px; height: 9px; border-radius: 50%; background: var(--b-bg); box-shadow: 0 0 0 1.5px var(--b-ter); }
#c33-nsp .np-step.run::before { box-shadow: 0 0 0 1.5px var(--b-acc); animation: npPulse 1s ease-in-out infinite; }
#c33-nsp .np-step.ok::before { background: var(--b-ok); box-shadow: none; }
#c33-nsp .np-step.ng::before { background: var(--b-ng); box-shadow: none; }
#c33-nsp .np-step.ok { color: var(--b-ink); }
#c33-nsp .np-step small { font-size: 11px; color: var(--b-ter); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* 入力欄 */
#c33-nsp .np-comp { position: relative; flex: none; padding: 10px 12px 12px; background: linear-gradient(transparent, var(--b-bg) 30%); }
#c33-nsp .np-field { display: flex; align-items: flex-end; gap: 8px; padding: 6px 6px 6px 14px; border-radius: 14px; background: var(--b-bg); box-shadow: inset 0 0 0 1px var(--b-line), 0 2px 6px -2px rgba(15,15,15,.08); transition: box-shadow .15s; }
#c33-nsp .np-field:focus-within { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 55%, transparent), 0 0 0 4px color-mix(in srgb, var(--b-acc) 12%, transparent); }
#c33-nsp .np-field textarea { flex: 1 1 auto; min-width: 0; height: 32px; max-height: 168px; margin: 0; padding: 6px 0; border: 0; background: transparent; color: inherit; font-size: 14px; line-height: 20px; outline: none; box-shadow: none; resize: none; overflow-y: auto; scrollbar-width: thin; }
#c33-nsp .np-field textarea::placeholder { color: var(--b-ter); }
#c33-nsp .np-hint kbd { display: inline-block; min-width: 18px; margin: 0 2px; padding: 0 4px; border-radius: 4px; font: inherit; font-size: 10px; line-height: 15px; text-align: center; color: var(--b-sub); background: var(--b-bg); box-shadow: inset 0 0 0 1px var(--b-line), 0 1px 0 var(--b-line); }
#c33-nsp .np-hint.nudge { color: var(--b-acc); }
#c33-nsp .np-send { flex: none; display: grid; place-items: center; width: 32px; height: 32px; margin: 0; padding: 0; border: 0; border-radius: 10px; background: var(--b-acc); color: #fff; cursor: pointer; transition: opacity .15s, transform .15s; }
#c33-nsp .np-send:disabled { opacity: .3; cursor: default; }
#c33-nsp .np-send:not(:disabled):hover { transform: translateY(-1px); }
#c33-nsp .np-hint { display: flex; justify-content: space-between; gap: 8px; padding: 6px 4px 0; font-size: 10.5px; color: var(--b-ter); }
/* 設定のカード（共通） */
.bs-card { display: flex; flex-direction: column; gap: 8px; padding: 14px; border: 0; border-radius: 14px; background: var(--c-bacPri, #fff); box-shadow: inset 0 0 0 1px var(--ca-borSecTra, rgba(55,53,47,.1)); color: var(--c-texPri, #37352f); font: 13px/1.5 var(--buri-ui) !important; text-align: start; }
.bs-card * { font-family: var(--buri-ui) !important; }
.bs-card h4 { margin: 0; font-size: 15px; font-weight: 650; }
.bs-card .bs-lb { margin-top: 6px; font-size: 11.5px; font-weight: 600; letter-spacing: .03em; color: var(--c-texSec, #787774); }
.bs-card .bs-nt { font-size: 11px; line-height: 1.6; color: var(--c-texTer, #9b9a97); }
.bs-card .bs-seg { display: flex; gap: 3px; padding: 3px; border-radius: 10px; background: var(--ca-bacIntTra, rgba(55,53,47,.06)); }
.bs-card .bs-seg button { flex: 1 1 0; margin: 0; padding: 5px 6px; border: 0; border-radius: 8px; background: transparent; color: var(--c-texSec, #787774); font-size: 12px; cursor: pointer; }
.bs-card .bs-seg button.on { background: var(--c-bacPri, #fff); color: var(--c-texPri, #37352f); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.bs-card .bs-sel, .bs-card .bs-kw input, .bs-card .bs-in { width: 100%; min-width: 0; padding: 6px 9px; border: 0; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--ca-borSecTra, rgba(55,53,47,.16)); background: transparent; color: inherit; font-size: 12.5px; }
.bs-card .bs-row { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; align-items: center; padding: 9px 11px; border-radius: 11px; box-shadow: inset 0 0 0 1px var(--ca-borSecTra, rgba(55,53,47,.1)); }
.bs-card .bs-row > .bs-nt, .bs-card .bs-row > .bs-kw, .bs-card .bs-row > .bs-sel { grid-column: 1 / -1; }
.bs-card .bs-nmw { display: flex; align-items: center; gap: 7px; min-width: 0; cursor: pointer; }
.bs-card .bs-nm { font-weight: 600; }
.bs-card .bs-tag { padding: 0 7px; border-radius: 999px; font-size: 10px; background: color-mix(in srgb, #2e9e6a 14%, transparent); color: #2b8a5e; }
.bs-card .bs-tag.paid { background: color-mix(in srgb, #d9730d 14%, transparent); color: #b5600a; }
.bs-card .bs-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c-texTer, #c4c4c4); opacity: .5; }
.bs-card .bs-dot.set { background: #2783de; opacity: 1; }
.bs-card .bs-dot.ok { background: #2e9e6a; opacity: 1; }
.bs-card .bs-dot.ng { background: #d44c47; opacity: 1; }
.bs-card .bs-link { font-size: 11.5px; color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); text-decoration: none; white-space: nowrap; }
.bs-card .bs-kw { display: flex; gap: 4px; }
.bs-card .bs-x { flex: none; margin: 0; padding: 0 8px; border: 0; border-radius: 7px; background: var(--ca-bacIntTra, rgba(55,53,47,.06)); color: var(--c-texSec, #787774); cursor: pointer; }
.bs-card .bs-opts { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--c-texSec, #787774); }
.bs-card .bs-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.bs-card .bs-btns button { margin: 0; padding: 5px 13px; border: 0; border-radius: 999px; box-shadow: inset 0 0 0 1px var(--ca-borSecTra, rgba(55,53,47,.14)); background: transparent; color: inherit; font-size: 12.5px; cursor: pointer; }
.bs-card .bs-btns button.pri { box-shadow: none; background: var(--lm-accent, #2783de); color: #fff; font-weight: 600; }
.bs-card .bs-out { white-space: pre-wrap; font-size: 11.5px; line-height: 1.6; color: var(--c-texSec, #787774); }
/* 覚えたこと */
#c33-nsp .np-pagecard { display: flex; flex-direction: column; gap: 9px; margin-top: -6px; padding: 12px; border-radius: 13px; background: linear-gradient(135deg, color-mix(in srgb, var(--b-acc) 6%, var(--b-bg)), var(--b-bg)); box-shadow: inset 0 0 0 1px var(--b-line); }
#c33-nsp .np-pt { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--b-sub); }
#c33-nsp .np-pt b { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13.5px; font-weight: 650; color: var(--b-ink); }
#c33-nsp .np-logrow { align-items: flex-start; }
#c33-nsp .np-logrow .b-face { flex: none; padding: 1px 7px; border-radius: 999px; font-size: 10.5px; background: var(--b-soft); }
#c33-nsp .np-logrow span { display: flex; flex-direction: column; gap: 1px; white-space: normal; }
#c33-nsp .np-logrow b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-nsp .np-logrow small { font-size: 11.5px; color: var(--b-ter); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-nsp .np-time { flex: none; font-style: normal; font-size: 11px; color: var(--b-ter); }
#c33-nsp .np-mem { display: flex; flex-direction: column; gap: 6px; }
#c33-nsp .np-note { display: flex; align-items: flex-start; gap: 8px; padding: 8px 8px 8px 12px; border-radius: 11px; background: var(--b-bg); box-shadow: inset 0 0 0 1px var(--b-line); font-size: 13px; line-height: 1.6; }
#c33-nsp .np-note span { flex: 1; min-width: 0; overflow-wrap: anywhere; }
#c33-nsp .np-note small { display: block; font-size: 10.5px; color: var(--b-ter); }
#c33-nsp .np-note .np-ib { width: 24px; height: 24px; color: var(--b-ter); }
#c33-nsp .np-addm { display: flex; gap: 6px; }
#c33-nsp .np-addm input { flex: 1; min-width: 0; padding: 7px 11px; border: 0; border-radius: 10px; background: var(--b-bg); box-shadow: inset 0 0 0 1px var(--b-line); color: inherit; font-size: 13px; outline: none; }
#c33-nsp .np-addm input:focus { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 55%, transparent), 0 0 0 3px color-mix(in srgb, var(--b-acc) 12%, transparent); }
#c33-nsp .np-btn { display: inline-flex; align-items: center; gap: 5px; margin: 0; padding: 6px 12px; border: 0; border-radius: 10px; background: var(--b-acc); color: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer; }
#c33-nsp .np-btn.ghost { background: transparent; color: var(--b-sub); box-shadow: inset 0 0 0 1px var(--b-line); font-weight: 500; }
#c33-nsp .np-btn.ghost:hover { background: var(--b-soft); color: var(--b-ink); }
#c33-nsp .np-tags { display: flex; flex-wrap: wrap; gap: 6px; }
#c33-nsp .np-switch { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 12px; background: var(--b-soft); font-size: 13px; }
#c33-nsp .np-switch small { display: block; font-size: 11px; color: var(--b-ter); }
#c33-nsp .np-tg { position: relative; flex: none; width: 36px; height: 21px; margin: 0; padding: 0; border: 0; border-radius: 999px; background: var(--b-ter); cursor: pointer; transition: background .2s; }
#c33-nsp .np-tg::after { content: ''; position: absolute; top: 2.5px; left: 2.5px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .25s cubic-bezier(.3,1.4,.5,1); }
#c33-nsp .np-tg.on { background: var(--b-ok); }
#c33-nsp .np-tg.on::after { transform: translateX(15px); }
#c33-nsp .np-learned { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--b-ok); }
/* 欄が出る時 */
#c33-nsp:not([hidden]) .np-card { animation: npCardIn .5s cubic-bezier(.16,1,.3,1) both; }
/* v77: 欄の幅に合わせる（窓を半分にしても、同じ大きさ・比率のまま押し込まない） */
#c33-nsp { container: buri / inline-size; }
#c33-nsp[data-solo] { padding: 10px 12px 12px; }
@container buri (max-width: 480px) {
  #c33-nsp .np-id { display: none; }
  #c33-nsp .np-tools { margin-inline-start: auto; }
}
@container buri (max-width: 600px) {
  #c33-nsp .np-top { gap: 8px; padding: 10px 8px 8px 12px; }
  #c33-nsp .np-log { padding: 4px 12px 14px; gap: 14px; }
  #c33-nsp .np-hello { font-size: 18px; }
  #c33-nsp .np-sub { font-size: 12.5px; line-height: 1.65; }
  #c33-nsp .np-comp { padding: 8px 8px 10px; }
  #c33-nsp .np-s { width: 150px; }
  #c33-nsp .np-a { font-size: 13.5px; line-height: 1.8; }
}
@container buri (max-width: 420px) {
  #c33-nsp .np-top .b-face { height: 26px; padding: 0 8px; font-size: 11.5px; }
  #c33-nsp .np-tools { gap: 0; padding: 2px; }
  #c33-nsp .np-tools .np-ib { width: 26px; height: 26px; }
  #c33-nsp .np-tools .np-sep, #c33-nsp .np-tools .np-ib[data-k="side"] { display: none; }
  #c33-nsp .np-grid { grid-template-columns: 1fr; }
  #c33-nsp .np-hint > span:last-child { display: none; }
  #c33-nsp .np-q { max-width: 92%; }
}
@container buri (max-width: 340px) {
  #c33-nsp .np-top { flex-wrap: wrap; }
  #c33-nsp .np-tools { width: 100%; justify-content: space-between; }
}
@keyframes npCardIn { from { opacity: 0; transform: translateX(16px) scale(.975); } }
#c33-nsp .np-log > * { animation: npIn .45s cubic-bezier(.16,1,.3,1) both; }

/* ============================================================
 * v57: Notion の検索画面そのものを次世代に（ガラスの板・中央へすっと出る・アイコンの小箱・キーの刻印）
 * 印（data-c33-nx*）は JS が付ける。印が無ければ Notion のまま
 * ============================================================ */
@keyframes c33NxIn { 0% { opacity: 0; transform: translateY(26px) scale(.955); filter: blur(10px); } 55% { filter: blur(0); } 100% { opacity: 1; transform: translateZ(0); filter: none; } }
@keyframes c33NxVeil { from { opacity: 0; } }
@keyframes c33NxRow { from { opacity: 0; transform: translateY(6px); } }
@keyframes c33NxSheen { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
.notion-dialog[data-c33-nx] { --nx-acc: var(--lm-accent, #2783de); --nx-acc2: #8b6cd9; --nx-ink: var(--c-texPri, #2f2e2b); --nx-ter: var(--c-texTer, #a3a29e); --nx-line: color-mix(in srgb, var(--c-texPri, #37352f) 9%, transparent);
  border-radius: 26px !important; animation: c33NxIn .55s cubic-bezier(.16,1,.3,1) both;
  transition: top .5s cubic-bezier(.16,1,.3,1), height .25s cubic-bezier(.16,1,.3,1), width .25s cubic-bezier(.16,1,.3,1) !important;
  background: color-mix(in srgb, var(--c-bacPri, #fff) 84%, transparent) !important; -webkit-backdrop-filter: blur(40px) saturate(1.8) !important; backdrop-filter: blur(40px) saturate(1.8) !important;
  box-shadow: 0 0 0 1px var(--nx-line), 0 1px 0 0 rgba(255,255,255,.6) inset, 0 3px 8px rgba(15,15,25,.05), 0 40px 110px -24px rgba(15,15,35,.45) !important; }
.notion-dialog[data-c33-nx]::before { content: ''; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: radial-gradient(55% 34% at 12% 0%, color-mix(in srgb, var(--nx-acc) 12%, transparent), transparent 72%), radial-gradient(45% 30% at 92% 0%, color-mix(in srgb, var(--nx-acc2) 11%, transparent), transparent 70%); }
.notion-dialog[data-c33-nx], .notion-dialog[data-c33-nx] > div { max-width: calc(100vw - 24px) !important; }
.notion-dialog[data-c33-nx][data-c33-nx-wide] > div { width: min(1180px, max(640px, 88vw), calc(100vw - 24px)) !important; }
.notion-dialog[data-c33-nx][data-c33-nx-wide], .notion-dialog[data-c33-nx-solo] { height: min(720px, max(420px, 86vh), calc(100vh - 24px)) !important; }
.notion-dialog[data-c33-nx][data-c33-nx-wide] > div, .notion-dialog[data-c33-nx-solo] > div { height: 100% !important; }
.notion-dialog[data-c33-nx] [data-c33-nx-list] { width: auto !important; flex: 1 1 auto !important; min-width: 0; }
.notion-dialog[data-c33-nx][data-c33-nx-size="l"] [data-c33-nx-aside] { width: clamp(380px, 42%, 520px) !important; }
.notion-dialog[data-c33-nx][data-c33-nx-size="m"] [data-c33-nx-aside] { width: clamp(280px, 40%, 400px) !important; }
.notion-dialog[data-c33-nx][data-c33-nx-size="s"] [data-c33-nx-aside] { display: none !important; }
.notion-dialog[data-c33-nx-solo] [data-c33-nx-aside] { visibility: hidden !important; }
.notion-dialog[data-c33-nx][data-c33-nx-size="l"][data-c33-nx-pane] [data-c33-nx-aside] { width: clamp(440px, 50%, 600px) !important; }
.notion-dialog[data-c33-nx][data-c33-nx-size="m"][data-c33-nx-pane] [data-c33-nx-aside] { width: clamp(380px, 50%, 480px) !important; }
.notion-dialog[data-c33-nx][data-c33-nx-size="s"] [data-c33-nx-head] input { font-size: 16px !important; }
.notion-dialog[data-c33-nx][data-c33-nx-size="s"] #c33-nx-keys { display: none !important; }
[data-c33-nx-host] { position: relative !important; }
[data-c33-nx-veil] { background: color-mix(in srgb, #0d0d18 20%, transparent) !important; -webkit-backdrop-filter: blur(6px) saturate(1.15); backdrop-filter: blur(6px) saturate(1.15); animation: c33NxVeil .4s ease both; }
/* 上の検索欄 */
.notion-dialog[data-c33-nx] [data-c33-nx-head] { position: relative; padding: 8px 8px 6px; }
.notion-dialog[data-c33-nx] [data-c33-nx-head]::after { content: ''; position: absolute; inset-inline: 22px; bottom: 0; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--nx-acc) 35%, var(--nx-line)), color-mix(in srgb, var(--nx-acc2) 30%, var(--nx-line)), transparent); background-size: 200% 100%; opacity: .8; }
html[data-c33-ns-busy] .notion-dialog[data-c33-nx] [data-c33-nx-head]::after { animation: c33NxSheen 1.6s linear infinite; opacity: 1; height: 2px; }
.notion-dialog[data-c33-nx] [data-c33-nx-head] input { font-size: 19px !important; font-weight: 450 !important; letter-spacing: .01em; caret-color: var(--nx-acc); }
.notion-dialog[data-c33-nx] [data-c33-nx-head] input::placeholder { color: var(--nx-ter) !important; opacity: .9; }
.notion-dialog[data-c33-nx] [data-c33-nx-head] svg.magnifyingGlass { width: 22px !important; height: 22px !important; fill: var(--nx-acc) !important; color: var(--nx-acc) !important; --x-fill: var(--nx-acc) !important; }
#c33-nx-ask { flex: none; display: inline-flex; align-items: center; gap: 6px; margin-inline-end: 6px; padding: 5px 11px 5px 9px; border: 0; border-radius: 999px; cursor: pointer; white-space: nowrap; font-size: 12px; font-weight: 600; color: #fff;
  background: linear-gradient(120deg, var(--nx-acc, #2783de), var(--nx-acc2, #8b6cd9)); box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--nx-acc, #2783de) 70%, transparent); transition: transform .15s, box-shadow .15s, opacity .2s; }
#c33-nx-ask:hover { transform: translateY(-1px); box-shadow: 0 10px 22px -10px color-mix(in srgb, var(--nx-acc, #2783de) 80%, transparent); }
#c33-nx-ask kbd { padding: 0 5px; border-radius: 5px; font: inherit; font-size: 10.5px; font-weight: 500; background: rgba(255,255,255,.22); }
#c33-nx-ask svg { width: 14px; height: 14px; }
/* 結果の一覧 */
.notion-dialog[data-c33-nx] [role="listbox"] { padding-inline: 12px !important; }
.notion-dialog[data-c33-nx] [role="listbox"] > div { padding-top: 6px; }
.notion-dialog[data-c33-nx] [role="listbox"] > div :is(div) { font-size: 11px !important; font-weight: 650 !important; letter-spacing: .09em; text-transform: uppercase; color: var(--nx-ter) !important; }
.notion-dialog[data-c33-nx] [role="listbox"] > a { display: block; animation: c33NxRow .4s cubic-bezier(.16,1,.3,1) both; }
.notion-dialog[data-c33-nx] [role="listbox"] > a:nth-of-type(2) { animation-delay: 30ms; } .notion-dialog[data-c33-nx] [role="listbox"] > a:nth-of-type(3) { animation-delay: 60ms; } .notion-dialog[data-c33-nx] [role="listbox"] > a:nth-of-type(4) { animation-delay: 90ms; } .notion-dialog[data-c33-nx] [role="listbox"] > a:nth-of-type(5) { animation-delay: 120ms; } .notion-dialog[data-c33-nx] [role="listbox"] > a:nth-of-type(n+6) { animation-delay: 150ms; }
.notion-dialog[data-c33-nx] [role="option"] { min-height: 44px; border-radius: 13px !important; padding: 6px 10px !important; transition: background .15s, box-shadow .15s, transform .2s cubic-bezier(.16,1,.3,1) !important; }
.notion-dialog[data-c33-nx] [role="option"]:hover { transform: translateX(3px); }
.notion-dialog[data-c33-nx] [role="option"][style*="--x-background"] { background: color-mix(in srgb, var(--nx-acc) 9%, transparent) !important; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--nx-acc) 20%, transparent), 0 6px 18px -12px color-mix(in srgb, var(--nx-acc) 60%, transparent); }
.notion-dialog[data-c33-nx] [role="option"] .notion-record-icon { width: 32px !important; height: 32px !important; margin-inline-end: 4px; border-radius: 10px !important; background: color-mix(in srgb, var(--c-bacPri, #fff) 70%, transparent);
  box-shadow: inset 0 0 0 1px var(--nx-line), 0 2px 6px -3px rgba(15,15,25,.18); }
.notion-dialog[data-c33-nx] [role="option"][style*="--x-background"] .notion-record-icon { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--nx-acc) 30%, transparent), 0 4px 10px -4px color-mix(in srgb, var(--nx-acc) 50%, transparent); }
.notion-dialog[data-c33-nx] [role="option"] .notion-record-icon img { width: 18px !important; height: 18px !important; }
.notion-dialog[data-c33-nx] [role="option"] .notranslate[style*="font-weight: 500"] { font-size: 14.5px !important; }
/* 右のプレビュー */
.notion-dialog[data-c33-nx] [data-c33-nx-aside] > div > div[style*="border-radius"] { border-radius: 20px !important; box-shadow: 0 0 0 1px var(--nx-line), 0 18px 44px -18px rgba(15,15,30,.3) !important; }
/* 下の帯（キーの刻印） */
.notion-dialog[data-c33-nx] [data-c33-nx-foot] { border-top: 0 !important; padding-block: 9px !important; background: color-mix(in srgb, var(--c-texPri, #37352f) 2.5%, transparent); box-shadow: inset 0 1px 0 var(--nx-line); }
.notion-dialog[data-c33-nx] [data-c33-nx-foot] li svg, #c33-nx-keys kbd { box-sizing: content-box; min-width: 12px; height: 14px; padding: 1px 3px; border-radius: 5px; background: var(--c-bacPri, #fff); box-shadow: inset 0 0 0 1px var(--nx-line), 0 1px 0 var(--nx-line); }
#c33-nx-keys { display: inline-flex; align-items: center; gap: 16px; margin-inline-start: 18px; font-size: 12px; color: var(--c-texTer, #a3a29e); white-space: nowrap; }
#c33-nx-keys span { display: inline-flex; align-items: center; gap: 5px; }
#c33-nx-keys kbd { display: inline-grid; place-items: center; font: 10.5px/14px var(--buri-ui); color: var(--c-texSec, #73726e); }
/* 左の B.U.R.I の段（AI の入口） */
.notion-dialog[data-c33-nx] #c33-ns { padding: 6px 12px 4px; }
.notion-dialog[data-c33-nx] #c33-ns .ns-row { position: relative; min-height: 50px; padding: 8px 12px; border-radius: 15px; overflow: hidden;
  background: linear-gradient(120deg, color-mix(in srgb, var(--b-acc) 8%, var(--b-bg)), color-mix(in srgb, var(--b-acc2) 7%, var(--b-bg))); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 16%, var(--b-line)); }
.notion-dialog[data-c33-nx] #c33-ns .ns-row:hover, .notion-dialog[data-c33-nx] #c33-ns .ns-row.on { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 38%, var(--b-line)), 0 10px 26px -14px color-mix(in srgb, var(--b-acc) 55%, transparent); }
.notion-dialog[data-c33-nx] #c33-ns .ns-row::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%); background-size: 250% 100%; opacity: 0; transition: opacity .3s; }
.notion-dialog[data-c33-nx] #c33-ns .ns-row:hover::after { opacity: 1; animation: c33NxSheen 1.4s linear infinite; }
.notion-dialog[data-c33-nx] #c33-ns .ns-row .b-face { font-size: 12px; padding: 4px 10px; background: var(--b-bg); box-shadow: 0 0 0 1px var(--b-line), 0 4px 10px -6px rgba(15,15,25,.3); }
.notion-dialog[data-c33-nx] #c33-ns .ns-lb { font-size: 14.5px; font-weight: 650; }
.notion-dialog[data-c33-nx] #c33-ns .ns-kb { background: var(--b-bg); }
@media (prefers-reduced-motion: reduce) { .notion-dialog[data-c33-nx], .notion-dialog[data-c33-nx] *, [data-c33-nx-veil] { animation: none !important; } }
html[data-c33-ns-open] #c33-search-header:not(.floating), html[data-c33-ns-open] #c33-buri:not(.floating) { visibility: hidden !important; }
@media (prefers-reduced-motion: reduce) { #c33-nsp *, #c33-ns * { animation: none !important; transition: none !important; } }
`;
    (document.head || document.documentElement).appendChild(nsStyle);
    function nsInput() {
      for (const el of document.querySelectorAll('[data-search-container="true"] input, .notion-dialog[aria-label="Search Notion"] input, [role="dialog"] input[role="combobox"], [role="dialog"] input[type="text"]')) {
        if (el.closest('#c33-search-header, #c33-buri, #c33-ns, #c33-nsp, #cordi-vs-sub')) continue;
        if (!el.getBoundingClientRect().width) continue;
        const dlg = el.closest('[role="dialog"], .notion-dialog, [data-search-container="true"]');
        const hint = [el.placeholder, el.getAttribute('aria-label'), dlg && dlg.getAttribute('aria-label')].join(' ');
        if (el.closest('[data-search-container="true"]') || /search|検索|質問|ask|探す/i.test(hint)) return el;
      }
      return null;
    }
    const stopKeys = (el) => ['keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'paste', 'copy', 'cut'].forEach((t) => el.addEventListener(t, (e) => e.stopPropagation()));
    let nsInp = null, nsDlg = null, nsBox = null, nsPane = null, nsTimer = 0, nsSeq = 0, nsWant = '', nsFill = '';
    const srcLabel = (c) => c.type === 'Web' ? (/wikipedia/i.test(c.url) ? 'Wikipedia' : (() => { try { return new URL(c.url).hostname.replace(/^www\./, ''); } catch (e) { return 'Web'; } })()) : 'Notion';
    const teamLabel = () => { const t = BURI.team(); return !BURI.aiOn() ? '抜粋モード（AI なし）' : BURI.moaOn() ? 'MoA ' + t.length + ' 人 · ' + t.map((id) => BURI.TEAM[id].name).join('・') : BURI.aiName(); };
    const TEAM_HUE = { gemini: 214, nvidia: 96, groq: 18, openrouter: 262, zai: 190, cohere: 330, chrome: 45, claude: 24 };
    function nsChips(host, cls, onPick) {
      const w = mk('div', cls, null, host);
      const add = (q, icon) => { const b = mk('button', null, null, w); b.type = 'button'; b.title = q; if (icon === 'h') b.innerHTML = svg('clock'); else mk('i', null, icon, b); b.append(q); b.addEventListener('mousedown', (e) => e.preventDefault()); b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onPick(q); }); };
      try { if (BURI.pageHead()) add('このページを要約して', '📄'); } catch (e) { /* noop */ }
      hist().slice(0, 3).forEach((q) => add(q, 'h'));
      EXAMPLES.filter(([, q]) => !hist().includes(q)).slice(0, Math.max(1, 4 - Math.min(3, hist().length))).forEach(([i, q]) => add(q, i));
      return w;
    }
    function nsBuild() {
      const box = mk('div'); box.id = 'c33-ns'; box.hidden = true;
      const h = mk('div', 'ns-h', null, box); mk('b', null, 'B.U.R.I', h); mk('span', null, '相棒に聞く', h);
      const tag = mk('span', 'ns-tag', '', h);
      const row = mk('button', 'ns-row', null, box); row.type = 'button';
      const face = faceEl(row, 'normal');
      const spark = mk('i', 'ns-spark', null, row); spark.innerHTML = svg('spark', 15);   // v77: 欄が開いている間は顔の代わり
      const lb = mk('span', 'ns-lb', '', row);
      const qEl = mk('span', 'ns-q', '', row);
      const kb = mk('span', 'ns-kb', '', row);
      const chipsHost = mk('div', null, null, box);
      const ans = mk('div', 'ns-ans', null, box); ans.hidden = true;
      Object.assign(box, { __q: qEl, __ans: ans, __row: row, __lb: lb, __kb: kb, __tag: tag, __chips: chipsHost, __face: face });
      row.addEventListener('mousedown', (e) => e.preventDefault());
      row.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const q = nsInp ? nsInp.value.trim() : '';
        if (!q) { nsHome(); return; }
        if (nsConv.length && nsConv[nsConv.length - 1].q === q && nsPane && nsPane.__view === 'chat') nsShowPane(true); else nsAsk(q);
      });
      ['pointerdown', 'mousedown'].forEach((t) => box.addEventListener(t, (e) => e.stopPropagation()));
      fontLock(box);
      return box;
    }
    function nsBuildPane() {
      const p = mk('div'); p.id = 'c33-nsp'; p.hidden = true;
      const card = mk('div', 'np-card', null, p);
      mk('div', 'np-aura', null, card);
      const top = mk('div', 'np-top', null, card);
      const face = faceEl(top, 'normal');
      const id = mk('div', 'np-id', null, top);
      mk('div', 'np-name', 'B.U.R.I', id);
      const st = mk('div', 'np-status', null, id); const dot = mk('i', null, null, st); const stx = mk('span', null, '', st);
      const tools = mk('div', 'np-tools', null, top);
      const bHome = ib(tools, 'home', 'ホーム', () => nsHome());
      const bNew = ib(tools, 'edit', '新しい話', () => { nsConv.length = 0; BURI.aiReset(); nsHome(); });
      const bLog = ib(tools, 'clock', 'これまでの答え（履歴）', () => nsHistory());
      const bMem = ib(tools, 'brain', 'ぶりが覚えたこと（学習）', () => nsMemory());
      const bSet = ib(tools, 'tune', 'AI の設定', () => nsSettings());
      mk('span', 'np-sep', null, tools);
      ib(tools, 'side', 'サイドの B.U.R.I で続ける', () => nsToSide());
      ib(tools, 'x', 'Notion のプレビューに戻す', () => { nsShowPane(false); if (nsInp) nsInp.focus(); });
      const log = mk('div', 'np-log', null, card); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
      const comp = mk('div', 'np-comp', null, card);
      const field = mk('div', 'np-field', null, comp);
      /* v57: 誤送信防止 — ⌘↵（Ctrl+Enter）で送る。↵ は改行 */
      const fin = mk('textarea', null, null, field); fin.rows = 1; fin.setAttribute('aria-label', 'B.U.R.I に聞く');
      const send = mk('button', 'np-send', null, field); send.type = 'button'; send.innerHTML = svg('send', 18); send.title = '送る（' + MOD + '+Enter）'; send.disabled = true;
      const hint = mk('div', 'np-hint', null, comp); const hl = mk('span', null, null, hint); const hr = mk('span', null, '', hint);
      const hintText = () => { hl.className = ''; hl.innerHTML = '<kbd>' + (IS_MAC ? '⌘' : 'Ctrl') + '</kbd><kbd>↵</kbd> で送る　<kbd>↵</kbd> で改行'; };
      hintText();
      const grow = () => { fin.style.height = '32px'; fin.style.height = Math.min(168, Math.max(32, fin.scrollHeight)) + 'px'; };
      stopKeys(p);
      ['pointerdown', 'mousedown', 'click'].forEach((t) => p.addEventListener(t, (e) => e.stopPropagation()));
      let comp2 = false;
      fin.addEventListener('compositionstart', () => { comp2 = true; });
      fin.addEventListener('compositionend', () => { comp2 = false; });
      fin.addEventListener('input', () => { send.disabled = !fin.value.trim(); grow(); });
      const go = () => { const q = fin.value.trim(); if (!q) return; fin.value = ''; send.disabled = true; grow(); nsAsk(q, true); };
      fin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing && !comp2 && e.keyCode !== 229) {
          if (e.metaKey || e.ctrlKey) { e.preventDefault(); go(); }
          else if (!e.shiftKey && fin.value.trim() && !fin.value.includes('\n') && !hl.classList.contains('nudge')) { hl.className = 'nudge'; hl.textContent = '改行しました — 送るときは ' + MOD + '+Enter'; setTimeout(hintText, 2600); }
        }
        if (e.key === 'Escape') { e.preventDefault(); nsShowPane(false); if (nsInp) nsInp.focus(); }
      });
      send.addEventListener('mousedown', (e) => e.preventDefault());
      send.addEventListener('click', (e) => { e.preventDefault(); go(); });
      Object.assign(p, { __log: log, __face: face, __dot: dot, __stx: stx, __fin: fin, __hr: hr, __grow: grow, __tabs: { home: bHome, set: bSet, new: bNew, mem: bMem, log: bLog }, __view: '' });
      fontLock(p);
      return p;
    }
    /* 気分（顔）と様子の文字 */
    function nsMood(mood) {
      for (const f of [nsPane && nsPane.__face, nsBox && nsBox.__face]) {
        if (!f || f.dataset.mood === mood) continue;
        f.dataset.mood = mood; f.textContent = FACE[mood] || FACE.normal;
        f.classList.remove('pop'); void f.offsetWidth; f.classList.add('pop');
      }
    }
    function nsStatus(text) {
      if (!nsPane) return;
      const busy = nsPane.classList.contains('busy');
      nsPane.__stx.textContent = text || (BURI.aiOn() ? teamLabel() : '抜粋モード（⚙ で AI をつなぐ）');
      nsPane.__dot.className = busy || BURI.aiOn() ? '' : 'off';
      nsPane.__fin.placeholder = (nick() ? nick() + '、' : '') + 'ぶりに聞いてみて…';
      nsPane.__hr.textContent = BURI.moaOn() ? BURI.team().length + ' 人で相談して答えます' : BURI.aiOn() ? BURI.aiName() + ' が答えます' : '';
    }
    function nsView(v) {
      if (!nsPane) return;
      nsPane.__view = v;
      for (const [k, b] of Object.entries(nsPane.__tabs)) b.classList.toggle('on', k === v);
    }
    function nsToSide() {
      const conv = nsConv.slice();
      if (nsInp) nsInp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true }));
      floatMode = true; panelOpen = true; input.setAttribute('aria-expanded', 'true'); layout();
      conv.forEach((c) => { addUser(c.q); addBuri(c.res); });
    }
    const asideOf = (dlg) => { const a = dlg && dlg.querySelector('aside'); if (!a) return null; const r = a.getBoundingClientRect(); return r.width > 220 && r.height > 200 && getComputedStyle(a).opacity !== '0' ? a : null; };
    /* v77: 欄の置き場所。右の欄が 340px 以上あればそこ、無い・狭い時は一覧の場所いっぱい（solo） */
    function paneHost(dlg) {
      if (!dlg) return null;
      const aside = asideOf(dlg);
      const dw = (dlg.firstElementChild || dlg).getBoundingClientRect().width;
      if (aside && window.innerWidth >= 760 && dw >= 800) return { el: aside, solo: false };
      const lb = dlg.querySelector('[role="listbox"]');
      const sc = dlg.querySelector('[data-c33-nx-list]') || (lb && lb.closest('.notion-scroller, [class*="scroller"]'));
      const body = sc && sc.parentElement;
      if (body && body !== dlg && body.getBoundingClientRect().width > 200) return { el: body, solo: true };
      return aside ? { el: aside, solo: false } : null;
    }
    function nsShowPane(show) {
      if (!nsPane) return false;
      const h = show ? paneHost(nsDlg) : null;
      if (h) {
        if (nsPane.parentElement !== h.el) { if (getComputedStyle(h.el).position === 'static') h.el.setAttribute('data-c33-nx-host', ''); h.el.appendChild(nsPane); }
        nsPane.toggleAttribute('data-solo', h.solo);
        nsStatus();
        nsPane.hidden = false;
      } else nsPane.hidden = true;
      if (nsDlg) { nsDlg.toggleAttribute('data-c33-nx-solo', !nsPane.hidden && !!(h && h.solo)); nsDlg.toggleAttribute('data-c33-nx-pane', !nsPane.hidden && !!(h && !h.solo)); }
      if (nsBox) nsBox.__row.classList.toggle('on', !nsPane.hidden);
      return !nsPane.hidden;
    }
    const greet = () => { const h = new Date().getHours(); return h < 5 ? 'こんばんは' : h < 11 ? 'おはよう' : h < 17 ? 'こんにちは' : 'こんばんは'; };
    function nsHome() {
      if (!nsPane || !nsShowPane(true)) return;
      nsView('home');
      const log = nsPane.__log; log.textContent = '';
      const seen = Number(BURI.gmGet('c33.buri.seen', 0)) || 0; BURI.gmSet('c33.buri.seen', Date.now());
      const back = seen && Date.now() - seen > 6 * 36e5;
      const hero = mk('div', 'np-hero', null, log);   // v77: 顔は上の 1 つだけ（ここに大きな顔は出さない）
      mk('div', 'np-hello', back ? 'おかえりなさい、' + nick() + '！' : greet() + '、' + nick() + '。', hero);
      mk('div', 'np-sub', BURI.aiOn() ? '本棚・Notion・Google・Wikipedia をまとめて調べて、' + (BURI.moaOn() ? '仲間の AI と相談してから' : '') + 'わかりやすく話すね。' : '本棚・Notion・Web を調べて、見つけたものを並べるね。⚙ で AI をつなぐと、まとめて話せるよ。', hero);
      const s = BURI.state();
      const st = mk('div', 'np-stat', null, log);
      const sp = (t, on) => { const x = mk('span', null, null, st); mk('i', on ? '' : 'off', null, x); x.append(t); };
      sp('本棚 ' + (s.count || 0) + ' 件', !!s.count);
      sp(BURI.moaOn() ? 'MoA ' + BURI.team().length + ' 人' : BURI.aiOn() ? BURI.aiName() : 'AI なし', BURI.aiOn());
      sp(BURI.AI.web ? 'Web も調べる' : 'Web は調べない', BURI.AI.web);
      const lms = +document.documentElement.getAttribute('data-c16c-ms') || 0;   // v67: 16c の幕が開くまでの時間（読み込みの速さ）
      if (lms) sp('読み込み ' + (lms / 1000).toFixed(1) + ' 秒', lms <= 2000);
      const sb = mk('button', null, null, st); sb.type = 'button'; sb.innerHTML = svg('tune', 12); sb.append('設定'); sb.addEventListener('click', (e) => { e.preventDefault(); nsSettings(); });
      if (!s.count) { const b2 = mk('button', null, null, st); b2.type = 'button'; b2.innerHTML = svg('book', 12); b2.append('本棚を取り込む'); b2.addEventListener('click', (e) => { e.preventDefault(); file.click(); }); }
      const pg = BURI.pageHead && BURI.pageHead();
      if (pg) {
        mk('div', 'np-sec', 'いま開いているページ', log);
        const w = mk('div', 'np-pagecard', null, log);
        const t = mk('div', 'np-pt', null, w); t.innerHTML = svg('page', 15); mk('b', null, pg.title, t);
        const acts = mk('div', 'np-tags', null, w);
        const dn = (typeof okPack === 'function' && okPack()) ? okPack().items.length : 0;
        [...(dn ? [['変わった所（' + dn + '）', '前回から変わった所を教えて']] : []), ['要約して', 'このページを要約して'], ['大事な所は？', 'このページでいちばん大事な所は？'], ['質問する…', '']].forEach(([lb, qq]) => {
          const b = mk('button', 'np-pill', null, acts); b.type = 'button'; b.append(lb);
          b.addEventListener('click', (e) => { e.preventDefault(); if (qq) nsAsk(qq, true); else { const f = nsPane.__fin; f.value = 'このページで、'; nsPane.__grow(); f.dispatchEvent(new Event('input')); f.focus(); } });
        });
      }
      if (nsConv.length && Date.now() - nsConvAt < 30 * 60e3) {
        mk('div', 'np-sec', 'さっきの続き', log);
        const rows = mk('div', 'np-rows', null, log);
        const r = mk('button', 'np-row', null, rows); r.type = 'button'; r.innerHTML = svg('retry', 15); mk('span', null, nsConv[nsConv.length - 1].q, r); r.insertAdjacentHTML('beforeend', svg('arrow', 14).replace('<svg', '<svg class="go"'));
        r.addEventListener('click', (e) => { e.preventDefault(); nsReplay(); });
      }
      if (hist().length) {
        mk('div', 'np-sec', '最近の質問', log);
        const rows = mk('div', 'np-rows', null, log);
        hist().slice(0, 4).forEach((q) => { const r = mk('button', 'np-row', null, rows); r.type = 'button'; r.innerHTML = svg('clock', 15); mk('span', null, q, r); r.insertAdjacentHTML('beforeend', svg('arrow', 14).replace('<svg', '<svg class="go"')); r.addEventListener('click', (e) => { e.preventDefault(); nsAsk(q); }); });
      }
      mk('div', 'np-sec', '聞いてみる', log);
      const grid = mk('div', 'np-grid', null, log);
      EXAMPLES.forEach(([i, q]) => { const c = mk('button', 'np-sug', null, grid); c.type = 'button'; mk('i', null, i, c); mk('span', null, q, c); c.addEventListener('click', (e) => { e.preventDefault(); nsAsk(q); }); });
      nsMood(back ? 'back' : 'together'); nsStatus();
      if (nsBox) nsBox.__row.classList.add('on');
      nsPane.__fin.focus({ preventScroll: true });
    }
    function nsSettings() {
      if (!nsPane || !nsShowPane(true)) return;
      nsView('set'); nsMood('think');
      const log = nsPane.__log; log.textContent = '';
      aiSettings(log, (t) => { nsHome(); const n = mk('div', 'np-sub', t, nsPane.__log); nsPane.__log.insertBefore(n, nsPane.__log.children[2] || null); nsMood('happy'); }, () => nsHome());
    }
    /* v67: 履歴 — これまでの答えを 40 件まで残す（閉じても・次の日でも開ける）。中身は ScriptCat の保存場所だけ */
    const LOG_K = 'c33.buri.log';
    const logGet = () => { const l = BURI.gmGet(LOG_K, []); return Array.isArray(l) ? l : []; };
    function logAdd(q, res) {
      if (!res || !res.text || res.learned) return;
      const trimRefs = (a) => (a || []).slice(0, 14).map((x) => ({ title: String(x.title || '').slice(0, 120), url: x.url || '' }));
      const e = { q, at: Date.now(), text: String(res.text).slice(0, 6000), mood: res.mood || '', refs: res.refs ? { N: trimRefs(res.refs.N), W: trimRefs(res.refs.W) } : null,
        cards: (res.cards || []).slice(0, 6).map((c) => ({ title: c.title, url: c.url, type: c.type })), chips: (res.chips || []).slice(0, 4),
        moa: res.moa ? { who: res.moa.who, merged: res.moa.merged, model: res.moa.model, drafts: (res.moa.drafts || []).map((d) => ({ id: d.id, name: d.name, model: d.model, err: d.err, text: String(d.text || '').slice(0, 1500) })) } : null };
      const l = logGet().filter((x) => x.q !== q || Date.now() - x.at > 6e5);
      l.unshift(e); BURI.gmSet(LOG_K, l.slice(0, 40));
    }
    function nsHistory(filter) {
      if (!nsPane || !nsShowPane(true)) return;
      nsView('log'); nsMood('think'); nsStatus('これまでの答え');
      const log = nsPane.__log; log.textContent = '';
      const hero = mk('div', 'np-hero', null, log);
      mk('div', 'np-hello', 'これまでの答え', hero);
      const all = logGet();
      mk('div', 'np-sub', all.length ? all.length + ' 件。押すと、その時の答えをもう一度開きます。' : 'まだありません。ぶりに聞くと、ここに残ります。', hero);
      if (!all.length) return;
      const box = mk('div', 'np-addm', null, log);
      const fi = mk('input', null, null, box); fi.type = 'text'; fi.placeholder = '履歴を探す…'; fi.value = filter || ''; fi.setAttribute('aria-label', '履歴を探す');
      const list = mk('div', 'np-rows', null, log);
      const draw = () => {
        list.textContent = '';
        const k = fi.value.trim().toLowerCase();
        let day = '';
        all.filter((x) => !k || (x.q + ' ' + x.text).toLowerCase().includes(k)).forEach((x) => {
          const d = new Date(x.at), dl = d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
          if (dl !== day) { day = dl; mk('div', 'np-sec', dl, list); }
          const r = mk('button', 'np-row np-logrow', null, list); r.type = 'button';
          faceEl(r, x.mood && FACE[x.mood] ? x.mood : 'normal');
          const t = mk('span', null, null, r); mk('b', null, x.q, t); mk('small', null, String(x.text).replace(/\[\[[^\]]*\]\]|\[[NW]\d[^\]]*\]/g, '').replace(/\s+/g, ' ').slice(0, 70), t);
          mk('i', 'np-time', d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }), r);
          r.addEventListener('click', (e) => { e.preventDefault(); nsView('chat'); log.textContent = ''; const ent = nsEntry(log, x.q, x, true); nsMood(ent.mood); nsStatus(new Date(x.at).toLocaleString('ja-JP') + ' の答え'); });
        });
      };
      fi.addEventListener('input', draw);
      draw();
      const btns = mk('div', 'np-tags', null, log);
      const clr = mk('button', 'np-btn ghost', null, btns); clr.type = 'button'; clr.innerHTML = svg('trash', 14); clr.append('履歴を消す');
      clr.addEventListener('click', (e) => { e.preventDefault(); if (clr.dataset.sure) { BURI.gmSet(LOG_K, []); nsHistory(); } else { clr.dataset.sure = '1'; clr.lastChild.textContent = 'もう一度押すと全部消えます'; } });
    }
    /* v57: 学習 — ぶりが覚えたこと（メモ・よく話す話題・よく聞く著者／分類）。見て・足して・消せる */
    function nsMemory() {
      if (!nsPane || !nsShowPane(true)) return;
      nsView('mem'); nsMood('proud'); nsStatus('覚えたことを見ています');
      const log = nsPane.__log; log.textContent = '';
      const M = BURI.mem, m = M.get(), n = nick();
      const hero = mk('div', 'np-hero', null, log);
      mk('div', 'np-hello', 'ぶりが覚えたこと', hero);
      mk('div', 'np-sub', n + 'との会話から少しずつ覚えて、次の答えに活かすよ。「覚えて：〜」「忘れて：〜」と話しかけても大丈夫。', hero);
      const sw = mk('div', 'np-switch', null, log);
      const swt = mk('div', null, null, sw); swt.append('会話から学習する'); mk('small', null, '切ると、新しく覚えるのをやめます（覚えたことは残ります）', swt);
      const tg = mk('button', 'np-tg' + (m.on ? ' on' : ''), null, sw); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', String(m.on)); tg.title = '学習する / しない';
      tg.addEventListener('click', (e) => { e.preventDefault(); const on = !tg.classList.contains('on'); M.setOn(on); tg.classList.toggle('on', on); tg.setAttribute('aria-checked', String(on)); nsMood(on ? 'happy' : 'sad'); });
      mk('div', 'np-sec', 'メモ（' + m.notes.length + '）', log);
      const add = mk('div', 'np-addm', null, log);
      const ai = mk('input', null, null, add); ai.type = 'text'; ai.placeholder = '例: 東野圭吾はガリレオから読む派'; ai.setAttribute('aria-label', '覚えてほしいこと');
      const ab = mk('button', 'np-btn', null, add); ab.type = 'button'; ab.innerHTML = svg('plus', 14); ab.append('覚える');
      const doAdd = () => { const t = ai.value.trim(); if (!t) return; M.add(t); nsMemory(); nsMood('proud'); };
      ab.addEventListener('click', (e) => { e.preventDefault(); doAdd(); });
      ai.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); doAdd(); } });
      const list = mk('div', 'np-mem', null, log);
      if (!m.notes.length) mk('div', 'np-sub', 'まだメモはありません。', list);
      m.notes.forEach((x) => {
        const r = mk('div', 'np-note', null, list);
        const t = mk('span', null, x.t, r); mk('small', null, (x.auto ? '会話から ・ ' : '') + new Date(x.at).toLocaleDateString('ja-JP'), t);
        ib(r, 'trash', '忘れる', () => { M.del(x.t); r.remove(); nsMood('sad'); });
      });
      const chipsOf = (title, arr, ask) => {
        if (!arr.length) return;
        mk('div', 'np-sec', title, log);
        const w = mk('div', 'np-tags', null, log);
        arr.forEach((t) => { const b = mk('button', 'np-pill', null, w); b.type = 'button'; b.append(t); if (ask) { b.insertAdjacentHTML('beforeend', svg('arrow', 13)); b.addEventListener('click', (e) => { e.preventDefault(); nsAsk(ask(t), true); }); } });
      };
      const pf = M.prefs();
      chipsOf('よく話す話題', M.topics(8), (t) => t + 'について、前より詳しく教えて');
      chipsOf('よく聞く著者', pf.authors, (t) => t + 'のおすすめは？');
      chipsOf('好きそうな分類', pf.tags, (t) => t + 'でおすすめは？');
      const btns = mk('div', 'np-tags', null, log);
      const clr = mk('button', 'np-btn ghost', null, btns); clr.type = 'button'; clr.innerHTML = svg('trash', 14); clr.append('全部忘れる');
      clr.addEventListener('click', (e) => { e.preventDefault(); if (clr.dataset.sure) { M.clear(); nsMemory(); nsMood('cry'); } else { clr.dataset.sure = '1'; clr.lastChild.textContent = 'もう一度押すと全部忘れます'; } });
    }
    /* 本文を読みやすく: 見出し（#・■）/ 箇条書き（・-・*・1.）/ **太字** / 出典の印 [N1][W2]（押すと開く）/ 顔文字は丸ゴシック */
    const RE_FACE = /(?:ε\( ε,'-'\))?(?:🐟)?(?:\('-' [^()\s]{1,3}\)з ?)+[✨♥♡💧💦💢🔥♪♬👑…\/･～〜!！📡💥🔍🎉🌊🥚👍😭🤦🌙💨⚡]*/gu;
    function richText(host, text, refs, cited) {
      cited = cited || [];
      const numOf = (k, ref) => { let i = cited.findIndex((c) => c.k === k); if (i < 0) { cited.push({ k, ref }); i = cited.length - 1; } return i + 1; };
      const lines = String(text || '').replace(/\r/g, '').split('\n');
      let list = null, para = null;
      const faces = (el, s) => { let i = 0, m; RE_FACE.lastIndex = 0; while ((m = RE_FACE.exec(s))) { if (m.index > i) el.append(s.slice(i, m.index)); mk('span', 'b-face', m[0], el); i = RE_FACE.lastIndex; } if (i < s.length) el.append(s.slice(i)); };
      const inline = (el, s) => {
        const re = /\*\*(.+?)\*\*|\[((?:[NW]\d+)(?:\s*[,，、]\s*[NW]?\d+)*)\]|【([NW]\d+)】/g; let i = 0, m;
        while ((m = re.exec(s))) {
          if (m.index > i) faces(el, s.slice(i, m.index));
          if (m[1]) faces(mk('strong', null, null, el), m[1]);
          else {
            /* v67: 出典は小さな脚注番号（¹ ²）。番号は答えの中で出てきた順。下に同じ番号の出典の一覧 */
            let kind = 'N';
            const sup = mk('sup', 'np-fn', null, el);
            (m[2] || m[3]).split(/\s*[,，、]\s*/).forEach((tk) => {
              const mm = /^([NW]?)(\d+)$/.exec(tk); if (!mm) return; kind = mm[1] || kind;
              const ref = refs && refs[kind] && refs[kind][Number(mm[2]) - 1];
              if (!ref) return;
              const n = numOf(kind + mm[2], ref);
              const a = mk(ref.url ? 'a' : 'span', 'np-fnum' + (kind === 'N' ? ' n' : ''), String(n), sup);
              a.title = ref.title + (ref.url ? '\n' + srcHost(ref.url) : '');
              if (ref.url) { a.href = ref.url; a.rel = 'noopener noreferrer'; if (!ref.url.startsWith(location.origin)) a.target = '_blank'; }
            });
            if (!sup.childNodes.length) sup.remove();
          }
          i = re.lastIndex;
        }
        if (i < s.length) faces(el, s.slice(i));
      };
      for (const raw of lines) {
        const ln = raw.trim();
        if (!ln) { list = null; para = null; continue; }
        const h = /^(#{1,4}\s+|■\s*|【([^】NW][^】]*)】$)/.exec(ln);
        const li = /^([・•]|[-*](?=\s)|\d+[.)．])\s*(.+)$/.exec(ln);   // v77: 「**太字**」で始まる行を箇条書きと間違えない
        if (h) { list = null; para = null; inline(mk('h5', null, null, host), h[2] || ln.replace(/^(#{1,4}\s+|■\s*)/, '')); continue; }
        if (li) { para = null; if (!list || list.tagName !== (/^\d/.test(li[1]) ? 'OL' : 'UL')) list = mk(/^\d/.test(li[1]) ? 'ol' : 'ul', null, null, host); inline(mk('li', null, null, list), li[2]); continue; }
        list = null;
        if (para) { para.append(mk('br')); inline(para, ln); } else { para = mk('p', null, null, host); inline(para, ln); }
      }
      [...host.children].forEach((el, k) => { el.style.animationDelay = Math.min(k * 70, 700) + 'ms'; });
    }
    /* 考え中のカード: 顔 ＋ 道のり（会話を読む → 調べる → 下書き → まとめ） */
    function nsThink(host) {
      const box = mk('div', 'np-think', null, host);
      mk('i', 'np-orb', null, box);   // v77: 顔は欄の上の 1 つだけ（ここは小さな光）
      const tl = mk('div', 'np-tl', null, box);
      const rows = {};
      const step = (key, text) => { let r = rows[key]; if (!r) { r = rows[key] = mk('div', 'np-step run', null, tl); r.__t = mk('span', null, '', r); r.__s = mk('small', null, '', r); } r.__t.textContent = text; return r; };
      const set = (r, st, small) => { r.className = 'np-step ' + st; r.__s.textContent = small || ''; };
      const mood = (m, label) => { nsMood(m); nsStatus(label || BUSY[m]); };
      mood('think');
      return {
        box,
        on(e) {
          if (e.k === 'plan') { const r = step('p', '会話を読んで、調べる言葉を決めています'); mood('think'); if (e.st === 'ok') { r.__t.textContent = '「' + e.q + '」を調べます'; set(r, 'ok', e.alt ? '別の角度: ' + e.alt : ''); } }
          else if (e.k === 'search') { step('s', 'Notion・本棚・Web を調べています'); mood('search'); }
          else if (e.k === 'found') { set(step('s', '調べました'), e.n + e.w ? 'ok' : 'ng', 'Notion・本棚 ' + e.n + ' 件 · Web ' + e.w + ' 件'); if (!(e.n + e.w)) mood('sad', '見つかりませんでした…'); }
          else if (e.k === 'draft') { const nm = BURI.TEAM[e.id] ? BURI.TEAM[e.id].name : e.id; const r = step('d' + e.id, nm + (BURI.moaOn() ? ' が下書き' : ' が考えています')); if (e.st === 'run') { if (e.note) r.__s.textContent = e.note; else mood('write'); } else set(r, e.st, e.st === 'ok' ? e.model : e.err); }
          else if (e.k === 'merge') { const r = step('m', (BURI.TEAM[e.id] ? BURI.TEAM[e.id].name : e.id) + ' がひとつにまとめています'); if (e.st === 'run') mood('merge'); else set(r, e.st, e.st === 'ok' ? e.model : e.err); }
        }
      };
    }
    const srcHost = (u) => { try { const h = new URL(u).hostname.replace(/^www\./, ''); return h.endsWith('notion.so') || h.endsWith('notion.com') || u.startsWith(location.origin) ? 'Notion' : h; } catch (e) { return ''; } };
    function favOf(c) {
      const lab = srcLabel(c);
      if (lab === 'Notion') return ['N', '#37352f'];
      if (lab === 'Wikipedia') return ['W', '#6b6b6b'];
      return [lab.replace(/^(?:m\.|ja\.)/, '').charAt(0).toUpperCase() || 'W', 'hsl(' + hue(lab) + ' 52% 46%)'];
    }
    function nsEntry(log, q, res, animate) {
      const qEl = mk('div', 'np-q', q, log);
      const msg = mk('div', 'np-msg', null, log);
      const who = mk('div', 'np-who', null, msg);
      const mood = moodOf(res);
      const wic = mk('i', 'np-wic', null, who); wic.innerHTML = svg('spark', 12); wic.dataset.mood = mood;   // v77: 顔は欄の上の 1 つだけ
      mk('span', null, res.moa && res.moa.who ? (res.moa.merged ? res.moa.who + ' がまとめました' : res.moa.who) : 'ぶり', who);
      if (res.learned) { const l = mk('span', 'np-learned', null, who); l.innerHTML = svg('brain', 12); l.append('学習'); }
      const a = mk('div', 'np-a', null, msg);
      const cited = [];
      richText(a, res.text || '', res.refs, cited);
      if (!animate) [...a.children].forEach((el) => { el.style.animation = 'none'; });
      const cards = (res.cards || []).filter((c) => c.url).slice(0, 8);
      if (cited.length) {
        /* 出典の一覧（答えの中の番号と同じ） */
        const box = mk('div', 'np-refs', null, msg);
        const hd = mk('div', 'np-refs-h', null, box); hd.innerHTML = svg('book', 13); hd.append('出典 ' + cited.length);
        cited.forEach((c, i) => {
          const r = c.ref; const row = mk(r.url ? 'a' : 'div', 'np-ref', null, box);
          if (r.url) { row.href = r.url; row.rel = 'noopener noreferrer'; if (!r.url.startsWith(location.origin)) row.target = '_blank'; }
          mk('b', c.k[0] === 'N' ? 'n' : '', String(i + 1), row);
          const t = mk('span', null, String(r.title || '').replace(/（Wikipedia）$/, ''), row);
          mk('small', null, r.url ? srcHost(r.url) : '本棚', t);
        });
      } else if (cards.length) {
        const src = mk('div', 'np-src', null, msg);
        cards.forEach((c) => {
          const l = mk('a', 'np-s', null, src); l.href = c.url; l.rel = 'noopener noreferrer'; l.title = c.title;
          if (!c.url.startsWith(location.origin)) l.target = '_blank';
          const [ch, col] = favOf(c); const f = mk('span', 'fav', ch, l); f.style.background = col;
          mk('b', null, c.title, l); mk('small', null, srcLabel(c), l);
        });
      }
      const bar = mk('div', 'np-bar', null, msg);
      ib(bar, 'copy', 'コピー', (b) => { try { navigator.clipboard.writeText(res.text || ''); b.innerHTML = svg('check'); setTimeout(() => { b.innerHTML = svg('copy'); }, 1400); } catch (x) { /* noop */ } });
      ib(bar, 'retry', 'もう一度', () => { nsCache.delete(q); nsAsk(q, true, true); });
      ib(bar, 'md', 'Markdown でコピー（出典つき）', (b) => {
        const md = String(res.text || '').replace(/\[((?:[NW]\d+)(?:\s*[,，、]\s*[NW]?\d+)*)\]/g, (m0, ids) => ids.split(/\s*[,，、]\s*/).map((k) => { const i = cited.findIndex((c) => c.k === k); return i >= 0 ? '[^' + (i + 1) + ']' : ''; }).join(''))
          + (cited.length ? '\n\n' + cited.map((c, i) => '[^' + (i + 1) + ']: ' + (c.ref.title || '') + (c.ref.url ? ' <' + c.ref.url + '>' : '')).join('\n') : '');
        try { navigator.clipboard.writeText('## ' + q + '\n\n' + md); b.innerHTML = svg('check'); setTimeout(() => { b.innerHTML = svg('md'); }, 1400); } catch (x) { /* noop */ }
      });
      const m = res.moa;
      if (m && m.drafts && m.drafts.length > 1) {
        const t = mk('button', 'np-team', null, bar); t.type = 'button';
        const av = mk('span', 'np-av', null, t);
        m.drafts.forEach((x) => { const b = mk('b', x.text ? '' : 'ng', x.name.charAt(0), av); b.style.background = 'hsl(' + (TEAM_HUE[x.id] != null ? TEAM_HUE[x.id] : hue(x.name)) + ' 55% 48%)'; b.title = x.name + (x.text ? '' : '（' + x.err + '）'); });
        t.append(m.drafts.filter((x) => x.text).length + ' 人で相談');
        t.insertAdjacentHTML('beforeend', svg('down', 13));
        const dr = mk('div', 'np-drafts', null, msg);
        m.drafts.forEach((x) => { const d = mk('div', 'np-draft', null, dr); mk('b', null, x.name + (x.model ? ' · ' + x.model : ''), d); d.append(x.text || '（' + x.err + '）'); });
        t.addEventListener('click', (e) => { e.preventDefault(); dr.classList.toggle('on'); });
      }
      const nx = (res.chips || []).filter((c) => c && c.q).concat([{ label: 'もっと詳しく', q: q.replace(/(について)?(教えて|おしえて)$/, '') + 'をもっと詳しく' }]).slice(0, 4);
      const w = mk('div', 'np-next', null, msg);
      const seen = new Set();
      nx.filter((c) => !seen.has(c.label) && seen.add(c.label)).forEach((c) => { const b = mk('button', 'np-pill', null, w); b.type = 'button'; b.append(c.label); b.insertAdjacentHTML('beforeend', svg('arrow', 13)); b.addEventListener('click', (e) => { e.preventDefault(); nsAsk(c.q, true); }); });
      return { qEl, mood };
    }
    function nsReplay() {
      if (!nsPane || !nsShowPane(true)) return;
      nsView('chat');
      const log = nsPane.__log; log.textContent = '';
      let last = 'normal';
      nsConv.forEach((c) => { last = nsEntry(log, c.q, c.res, false).mood; });
      nsMood(last); nsStatus();
      log.scrollTop = log.scrollHeight;
    }
    function nsSync() {
      if (!nsBox || !nsInp) return;
      const q = nsInp.value.trim();
      const empty = !q;
      nsBox.hidden = false;
      nsBox.__lb.textContent = empty ? '何でも聞いてね' : 'ぶりに聞く';
      nsBox.__q.textContent = empty ? '本棚・Notion・Web を調べて答えます' : '「' + q + '」';
      nsBox.__kb.textContent = empty ? '' : '⇧ ↵';
      nsBox.__tag.textContent = BURI.moaOn() ? 'MoA ×' + BURI.team().length : BURI.aiOn() ? BURI.aiName() : '';
      nsBox.__tag.hidden = !nsBox.__tag.textContent;
      if (nsBox.__chipsFor !== (empty ? 'e' : 'q')) {
        nsBox.__chipsFor = empty ? 'e' : 'q'; nsBox.__chips.textContent = '';
        if (empty) nsChips(nsBox.__chips, 'ns-chips', (x) => nsAsk(x));
      }
      if (nsBox.__pend === q) return;   // 同じ言葉のまま → 待ち時間を延ばさない
      nsBox.__pend = q; clearTimeout(nsTimer);
      if (q && NS.auto && RE_QUESTION.test(q) && q.length >= 4 && nsBox.__last !== q) nsTimer = setTimeout(() => { if (nsInp && nsInp.value.trim() === q) nsAsk(q); }, 1300);
    }
    async function nsAsk(q, follow, again) {
      q = String(q || '').trim();
      if (!q || !nsBox) return;
      if (!follow) nsBox.__last = q;
      clearTimeout(nsTimer);
      histAdd(q);
      const my = ++nsSeq;
      const inPane = nsShowPane(true);
      if (inPane) {
        if (nsPane.__view !== 'chat') { nsView('chat'); nsPane.__log.textContent = ''; nsConv.forEach((c) => nsEntry(nsPane.__log, c.q, c.res, false)); }
        nsPane.classList.add('busy'); document.documentElement.setAttribute('data-c33-ns-busy', '');
        const log = nsPane.__log;
        const qb = mk('div', 'np-q', q, log);
        const think = nsThink(log);
        think.box.scrollIntoView({ block: 'end' });
        BURI.setProgress((e) => { if (my === nsSeq) { think.on(e); log.scrollTop = log.scrollHeight; } });
        let res = !follow && !again && nsCache.get(q);
        if (!res) {
          try { res = await BURI.ask(q); } catch (e) { res = { text: "('-' 鰤)з💦 ごめんね、調べている途中でつまずいちゃった。（" + String(e && e.message || e) + '）', cards: [], chips: [], actions: [], mood: 'panic' }; }
          nsCache.set(q, res); if (nsCache.size > 30) nsCache.delete(nsCache.keys().next().value);
        }
        BURI.setProgress(null);
        if (my !== nsSeq) return;
        nsPane.classList.remove('busy'); document.documentElement.removeAttribute('data-c33-ns-busy');
        qb.remove(); think.box.remove();
        nsConv.push({ q, res }); nsConvAt = Date.now();
        try { logAdd(q, res); } catch (e) { /* noop */ }
        const ent = nsEntry(log, q, res, true);
        nsMood(ent.mood); nsStatus();
        nsPane.__fin.focus({ preventScroll: true });
        requestAnimationFrame(() => { log.scrollTop += ent.qEl.getBoundingClientRect().top - log.getBoundingClientRect().top - 8; });
      } else {
        const ans = nsBox.__ans; ans.hidden = false; ans.textContent = '';
        const think = mk('div', 'thinking-dots', null, ans); think.append(mk('span'), mk('span'), mk('span'));
        nsMood('search');
        let res = !follow && nsCache.get(q);
        if (!res) { try { res = await BURI.ask(q); } catch (e) { res = { text: String(e && e.message || e), cards: [] }; } nsCache.set(q, res); }
        if (my !== nsSeq) return;
        ans.textContent = '';
        nsConv.push({ q, res }); nsConvAt = Date.now();
        nsMood(moodOf(res));
        mk('div', 'ns-tx', String(res.text || '').replace(/\s*(?:\[(?:[NW]\d+)(?:\s*[,，、]\s*[NW]?\d+)*\]|【[NW]\d+】)/g, ''), ans);   // v77: 置き場所が無い時の控え — 出典の印は外す
        const src = mk('div', 'ns-src', null, ans);
        (res.cards || []).filter((c) => c.url).slice(0, 6).forEach((c) => { const l = mk('a', null, (c.type === 'Web' ? '🌐 ' : '📄 ') + c.title, src); l.href = c.url; l.rel = 'noopener noreferrer'; if (!c.url.startsWith(location.origin)) l.target = '_blank'; });
        const gs = mk('button', null, 'B.U.R.I で続ける →', src); gs.type = 'button'; gs.style.fontWeight = '600';
        gs.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); nsToSide(); });
      }
    }
    /* v57: Notion の検索画面に印を付けて次世代の見た目に（CSS は印にだけ効く）・画面の中央へ・聞くボタンとキーの刻印 */
    NS.nx = false;   // v97: 純正の検索画面は作り直さない（Notion のまま）
    let nxRO = null;
    function nxCenter(dlg) {
      if (!dlg || !dlg.isConnected || !NS.nx) return;
      const h = dlg.offsetHeight; if (!h) return;
      const cs = getComputedStyle(dlg); if (cs.position === 'static') return;
      const op = dlg.offsetParent;
      const nat = (op ? op.getBoundingClientRect().top + op.clientTop : 0) + dlg.offsetTop;
      const want = Math.max(16, Math.round((window.innerHeight - h) / 2));
      if (Math.abs(want - nat) < 2) return;
      dlg.style.setProperty('top', Math.round((parseFloat(cs.top) || 0) + want - nat) + 'px', 'important');
    }
    /* v77: 窓の幅で 3 段（l ≥ 1100 / m ≥ 760 / s）。s は右の欄をしまい、ぶりは検索画面いっぱいに出す */
    function nxSize(dlg) {
      if (!dlg || !dlg.isConnected) return;
      const vw = window.innerWidth;
      const sz = vw >= 1100 ? 'l' : vw >= 760 ? 'm' : 's';
      if (dlg.getAttribute('data-c33-nx-size') !== sz) dlg.setAttribute('data-c33-nx-size', sz);
      const wide = sz !== 's' && !!dlg.querySelector('aside');
      if (wide !== dlg.hasAttribute('data-c33-nx-wide')) dlg.toggleAttribute('data-c33-nx-wide', wide);
    }
    function nxMark(dlg, inp) {
      if (!dlg || !NS.nx) return;
      if (!dlg.hasAttribute('data-c33-nx')) {
        dlg.setAttribute('data-c33-nx', '');
        nxCenter(dlg);
        try { if (nxRO) nxRO.disconnect(); nxRO = new ResizeObserver(() => { nxSize(dlg); nxCenter(dlg); if (nsPane && !nsPane.hidden) nsShowPane(true); }); nxRO.observe(dlg); } catch (e) { /* noop */ }
        let a = dlg.parentElement;
        for (let i = 0; i < 6 && a && a !== document.body; i++, a = a.parentElement) {
          const r = a.getBoundingClientRect();
          if (getComputedStyle(a).position === 'fixed' && r.width >= window.innerWidth * 0.9 && r.height >= window.innerHeight * 0.9) { a.setAttribute('data-c33-nx-veil', ''); break; }
        }
      }
      const cont = dlg.querySelector('[data-search-container="true"]');
      let head = null;
      if (cont && inp) { let h = inp; while (h.parentElement && h.parentElement !== cont && h.parentElement.parentElement !== cont) h = h.parentElement; if (h.parentElement && h.parentElement !== cont) head = h; }
      if (head && !head.hasAttribute('data-c33-nx-head')) head.setAttribute('data-c33-nx-head', '');
      if (head && !head.querySelector('#c33-nx-ask')) {
        const b = mk('button'); b.id = 'c33-nx-ask'; b.type = 'button'; b.title = 'B.U.R.I に聞く（⇧↵）';
        b.innerHTML = svg('spark', 14); b.append('ぶりに聞く'); mk('kbd', null, '⇧↵', b);
        b.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); });
        b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const q = nsInp ? nsInp.value.trim() : ''; if (q) nsAsk(q); else nsHome(); });
        const right = head.children.length > 1 ? head.lastElementChild : head;
        right.insertBefore(b, right.firstChild);
      }
      const lb = dlg.querySelector('[role="listbox"]'), sc = lb && lb.closest('.notion-scroller, [class*="scroller"]');
      if (sc && !sc.hasAttribute('data-c33-nx-list')) sc.setAttribute('data-c33-nx-list', '');
      const aside = dlg.querySelector('aside');
      if (aside && !aside.hasAttribute('data-c33-nx-aside')) aside.setAttribute('data-c33-nx-aside', '');
      nxSize(dlg);
      const foot = cont && cont.lastElementChild;
      if (foot && foot !== head && !foot.contains(inp) && foot.querySelector('ul')) {
        if (!foot.hasAttribute('data-c33-nx-foot')) foot.setAttribute('data-c33-nx-foot', '');
        if (!foot.querySelector('#c33-nx-keys')) {
          const k = mk('span'); k.id = 'c33-nx-keys';
          [['⇧↵', 'ぶりに聞く'], ['↑↓', '選ぶ'], ['esc', '閉じる']].forEach(([kb, t]) => { const x = mk('span', null, null, k); mk('kbd', null, kb, x); x.append(t); });
          const ul = foot.querySelector('ul'); ul.after(k);
        }
      }
    }
    function nsTick() {
      if (!NS.on) { document.documentElement.removeAttribute('data-c33-ns-open'); if (nsBox) { nsBox.remove(); nsBox = null; } if (nsPane) { nsPane.remove(); nsPane = null; } nsInp = null; return; }
      const inp = nsInput();
      if (!!inp !== document.documentElement.hasAttribute('data-c33-ns-open')) document.documentElement.toggleAttribute('data-c33-ns-open', !!inp);
      if (!inp) {
        if (nsInp) { nsInp = null; nsDlg = null; if (nsBox) nsBox.remove(); if (nsPane) nsPane.remove(); nsBox = nsPane = null; document.documentElement.removeAttribute('data-c33-ns-busy'); if (nxRO) { nxRO.disconnect(); nxRO = null; } }
        return;
      }
      const dlg = inp.closest('[role="dialog"], .notion-dialog') || inp.closest('[data-search-container="true"]');
      let fresh = false;
      if (inp !== nsInp) {
        if (nsBox) nsBox.remove(); if (nsPane) nsPane.remove();
        nsInp = inp; nsDlg = dlg; nsSeq++; fresh = true;
        nsBox = nsBuild(); nsPane = nsBuildPane();
        setTimeout(() => BURI.warm(), 0);   // v57: 速く — 開いた瞬間にモデルの一覧などを先に取っておく
        if (!inp.__c33ns) {
          inp.__c33ns = true;
          inp.addEventListener('input', nsSync);
          inp.addEventListener('keydown', (e) => { if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && nsPane && !nsPane.hidden) nsShowPane(false); });
        }
      }
      /* 置き場所: 結果一覧（listbox）の直前。Notion が一覧を描き直しても戻す */
      const list = dlg && dlg.querySelector('[role="listbox"]');
      if (list && list.parentElement) { if (nsBox.nextElementSibling !== list || !nsBox.isConnected) list.before(nsBox); }
      else if (!nsBox.isConnected) {
        let el = inp;
        for (let i = 0; i < 8 && el.parentElement; i++) { const par = el.parentElement; if (par.matches('[role="dialog"], .notion-dialog') || par.getBoundingClientRect().height > el.getBoundingClientRect().height + 24) break; el = par; }
        el.after(nsBox);
      }
      if (nsPane && !nsPane.hidden && (!nsPane.isConnected || (dlg && !dlg.contains(nsPane)))) nsShowPane(true);
      nxMark(dlg, inp);
      nsSync();
      /* サイドの検索窓から来た時: ホームを出す / そのまま聞く */
      if (fresh && nsWant) {
        const w = nsWant; nsWant = '';
        const fill = nsFill; nsFill = '';
        setTimeout(() => {
          if (nsInp !== inp) return;
          if (w !== '\u0000') { nsAsk(w); return; }
          nsHome();
          if (fill && nsPane && !nsPane.hidden) { const f = nsPane.__fin; f.value = fill; nsPane.__grow(); f.dispatchEvent(new Event('input')); f.focus(); f.setSelectionRange(fill.length, fill.length); }
        }, 60);
      }
    }
    /* サイドの検索窓（B.U.R.I）→ Notion の検索画面を開く */
    async function nsOpenFromSide(q, askNow) {
      q = String(q || '').trim();
      input.value = ''; input.blur(); closePanel();
      nsWant = askNow && q ? q : '\u0000'; nsFill = askNow ? '' : q;
      const ok = await openNative(askNow ? q : '');
      if (!ok) { nsWant = ''; floatMode = true; input.value = q; openPanel(); layout(); }
    }
    window.addEventListener('keydown', (e) => {
      if (!nsInp || e.target !== nsInp || e.key !== 'Enter' || e.isComposing || composing) return;
      if (!(e.shiftKey || e.altKey) || e.metaKey || e.ctrlKey) return;
      e.preventDefault(); e.stopImmediatePropagation();
      nsAsk(nsInp.value);
    }, true);
    setInterval(() => { if (!document.hidden) nsTick(); }, 400);
    /* v57: 速く — 検索画面が出た瞬間に B.U.R.I を入れる（250ms ごとの見回りを待たない） */
    let nsMoPend = false;
    new MutationObserver(() => {
      if (nsMoPend || (nsInp && nsInp.isConnected)) return;
      nsMoPend = true;
      queueMicrotask(() => { nsMoPend = false; if (document.querySelector('[data-search-container="true"], .notion-dialog[aria-label="Search Notion"]')) nsTick(); });
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });

    /* ============================================================
     *  v77 目玉 ①: ぶりレンズ — 文字を選ぶと、選んだ所の下に小さな ✦。
     *   説明・要約・言い換え・訳す（日本語⇄英語）・続きを書く・自由に聞く。答えはその場のカードに（顔は 1 つ）。
     *   置き換える／下に入れる（Notion の貼り付けとして入れる＝⌘Z で戻せる）／コピー／⌘K で続ける。⌃⌥J で今の選択に。
     *  v77 目玉 ②: おかえりハイライト — 前に見た時から変わった段が、うっすら光る。
     *   ページごとに「最後に見た姿」を覚え（段の ID と文字の指紋だけ。本文は保存しない）、次に開いた時に比べる。
     *   自分の書き換えは見ている間に覚え直すので光らない。下の札で ↑↓ 移動・ぶりに要約・見た（消す）。⌃⌥N で次へ。
     * ============================================================ */
    Object.assign(IC, {
      bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3.2a5.8 5.8 0 0 0-3.5 10.4c.7.6 1 1.3 1 2.1v.3h5v-.3c0-.8.3-1.5 1-2.1A5.8 5.8 0 0 0 12 3.2Z"/>',
      list: '<path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10"/><circle cx="5" cy="6.5" r=".9"/><circle cx="5" cy="12" r=".9"/><circle cx="5" cy="17.5" r=".9"/>',
      swap: '<path d="M4.5 8.5h13l-3.5-3.5"/><path d="M19.5 15.5h-13l3.5 3.5"/>',
      lang: '<path d="M4 5.5h9M8.5 4v1.5c0 4-2.2 7-5 8.5"/><path d="M6.2 9.5c1.2 2 3 3.4 5 4.2"/><path d="M12.5 20l4-9 4 9M14 16.8h5"/>',
      pen: '<path d="M14.5 5.5l4 4L9 19H5v-4Z"/><path d="M13 7l4 4"/>',
      below: '<path d="M5 5h14M5 9.5h9"/><path d="M12 13v7M8.5 16.5 12 20l3.5-3.5"/>',
      repl: '<path d="M4.5 7h9M4.5 12h6"/><path d="M14.5 14.5l3.5-3.5 3.5 3.5M18 11v8.5"/>',
      up: '<path d="M7 14.5l5-5 5 5"/>',
      dn: '<path d="M7 9.5l5 5 5-5"/>'
    });
    NS.lens = BURI.gmGet('c33.buri.lens', true) !== false;
    NS.okaeri = BURI.gmGet('c33.buri.okaeri', true) !== false;
    const fxCss = mk('style'); fxCss.id = 'c33-fx-css';
    fxCss.textContent = `
#c33-lens, #c33-lens-card, #c33-ok { --b-acc: var(--lm-accent, #2783de); --b-acc2: #8b6cd9; --b-ink: var(--c-texPri, #2f2e2b); --b-sub: var(--c-texSec, #73726e); --b-ter: var(--c-texTer, #a3a29e);
  --b-line: var(--ca-borSecTra, rgba(55,53,47,.1)); --b-soft: var(--ca-bacIntTra, rgba(55,53,47,.05)); --b-bg: var(--c-bacEle, var(--c-bacPri, #fff)); --b-ok: #2e9e6a; box-sizing: border-box; }
#c33-lens *, #c33-lens-card *, #c33-ok * { box-sizing: border-box; font-family: var(--buri-ui) !important; }
#c33-lens-card .b-face { font-family: var(--buri-face) !important; }
#c33-lens[hidden], #c33-lens-card[hidden], #c33-ok[hidden] { display: none !important; }
/* ✦ — 選んだ所の下に小さく（Notion の書式の帯は上に出るので重ならない） */
#c33-lens { position: fixed; z-index: 1002; display: inline-flex; align-items: center; gap: 5px; height: 26px; margin: 0; padding: 0 10px 0 8px; border: 0; border-radius: 999px; cursor: pointer;
  font-size: 12px; font-weight: 600; letter-spacing: .02em; color: var(--b-acc); background: var(--b-bg);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--b-acc) 22%, var(--b-line)), 0 6px 18px -8px rgba(15,15,30,.35); animation: c33LensIn .22s cubic-bezier(.16,1,.3,1) both; }
#c33-lens:hover { background: color-mix(in srgb, var(--b-acc) 8%, var(--b-bg)); }
@keyframes c33LensIn { from { opacity: 0; transform: translateY(-4px) scale(.94); } }
/* カード */
#c33-lens-card { position: fixed; z-index: 2147483200; width: min(460px, calc(100vw - 24px)); max-height: min(70vh, 620px); display: flex; flex-direction: column; overflow: hidden; border-radius: 14px; color: var(--b-ink); font-size: 13.5px; line-height: 1.7;
  background: var(--b-bg); box-shadow: 0 0 0 1px var(--b-line), 0 18px 48px -16px rgba(15,15,30,.38), 0 2px 6px rgba(15,15,30,.06); animation: c33CardIn .32s cubic-bezier(.16,1,.3,1) both; }
@keyframes c33CardIn { from { opacity: 0; transform: translateY(6px) scale(.98); } }
#c33-lens-card .lc-top { display: flex; align-items: center; gap: 8px; padding: 10px 8px 6px 12px; }
#c33-lens-card .lc-top .b-face { flex: none; padding: 3px 9px; border-radius: 999px; font-size: 12px; line-height: 1.2; background: var(--b-soft); }
#c33-lens-card.busy .lc-top .b-face { animation: npBob 1.3s ease-in-out infinite; }
#c33-lens-card .lc-ttl { font-size: 13px; font-weight: 650; }
#c33-lens-card .lc-who { flex: 1; min-width: 0; font-size: 11px; color: var(--b-ter); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-lens-card .lc-ib { flex: none; display: grid; place-items: center; width: 28px; height: 28px; margin: 0; padding: 0; border: 0; border-radius: 8px; background: transparent; color: var(--b-sub); cursor: pointer; }
#c33-lens-card .lc-ib:hover { background: var(--b-soft); color: var(--b-ink); }
#c33-lens-card .lc-src { margin: 0 12px 8px; padding: 6px 10px; border-radius: 8px; font-size: 12px; line-height: 1.6; color: var(--b-sub); background: var(--b-soft); box-shadow: inset 2px 0 0 color-mix(in srgb, var(--b-acc) 45%, transparent);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-wrap; overflow-wrap: anywhere; }
#c33-lens-card .lc-acts { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 10px 8px; }
#c33-lens-card .lc-act { display: inline-flex; align-items: center; gap: 5px; margin: 0; padding: 4px 10px 4px 8px; border: 0; border-radius: 999px; background: transparent; color: var(--b-sub); font-size: 12px; cursor: pointer; box-shadow: inset 0 0 0 1px var(--b-line); transition: background .15s, color .15s, box-shadow .15s; }
#c33-lens-card .lc-act:hover { background: var(--b-soft); color: var(--b-ink); }
#c33-lens-card .lc-act.on { color: var(--b-acc); background: color-mix(in srgb, var(--b-acc) 9%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 30%, transparent); }
#c33-lens-card .lc-act svg { flex: none; }
#c33-lens-card .lc-out { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; margin: 0 12px; padding: 10px 2px 4px; border-top: 1px solid var(--b-line); font-size: 14px; line-height: 1.85; overflow-wrap: anywhere; }
#c33-lens-card .lc-out[hidden] { display: none; }
#c33-lens-card .lc-out > * { margin: 0 0 8px; animation: npIn .4s ease-out both; }
#c33-lens-card .lc-out > *:last-child { margin-bottom: 0; }
#c33-lens-card .lc-out h5 { font-size: 14px; font-weight: 700; }
#c33-lens-card .lc-out ul, #c33-lens-card .lc-out ol { padding-inline-start: 1.2em; }
#c33-lens-card .lc-out li { margin: 2px 0; }
#c33-lens-card .lc-out .lc-err { color: var(--b-sub); font-size: 13px; }
#c33-lens-card .lc-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 8px 10px 4px; }
#c33-lens-card .lc-tools[hidden] { display: none; }
#c33-lens-card .lc-tool { display: inline-flex; align-items: center; gap: 5px; margin: 0; padding: 5px 10px 5px 8px; border: 0; border-radius: 8px; background: transparent; color: var(--b-sub); font-size: 12px; cursor: pointer; }
#c33-lens-card .lc-tool:hover:not(:disabled) { background: var(--b-soft); color: var(--b-ink); }
#c33-lens-card .lc-tool.pri { color: #fff; background: var(--b-acc); font-weight: 600; }
#c33-lens-card .lc-tool.pri:hover:not(:disabled) { color: #fff; background: color-mix(in srgb, var(--b-acc) 86%, #000); }
#c33-lens-card .lc-tool:disabled { opacity: .4; cursor: default; }
#c33-lens-card .lc-tool[hidden] { display: none; }
#c33-lens-card .lc-ask { display: flex; align-items: flex-end; gap: 6px; margin: 6px 10px 10px; padding: 4px 4px 4px 12px; border-radius: 11px; box-shadow: inset 0 0 0 1px var(--b-line); }
#c33-lens-card .lc-ask:focus-within { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-acc) 55%, transparent), 0 0 0 3px color-mix(in srgb, var(--b-acc) 12%, transparent); }
#c33-lens-card .lc-ask textarea { flex: 1; min-width: 0; height: 28px; max-height: 120px; margin: 0; padding: 4px 0; border: 0; outline: 0; resize: none; background: transparent; color: inherit; font-size: 13px; line-height: 20px; }
#c33-lens-card .lc-go { flex: none; display: grid; place-items: center; width: 28px; height: 28px; margin: 0; padding: 0; border: 0; border-radius: 8px; background: var(--b-acc); color: #fff; cursor: pointer; }
#c33-lens-card .lc-go:disabled { opacity: .3; cursor: default; }
#c33-lens-card .thinking-dots { display: inline-flex; gap: 4px; align-items: center; height: 18px; }
#c33-lens-card .thinking-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--b-ter); animation: bounce 1.4s infinite ease-in-out both; }
#c33-lens-card .thinking-dots span:nth-child(1) { animation-delay: -.32s; } #c33-lens-card .thinking-dots span:nth-child(2) { animation-delay: -.16s; }
#c33-lens-card[data-mode="okaeri"] .lc-acts, #c33-lens-card[data-mode="okaeri"] .lc-ask { display: none; }
/* おかえりハイライト */
html:not([data-c33-ok-off]) [data-c33-ok] { border-radius: 6px; box-shadow: inset 3px 0 0 var(--okc); background-image: linear-gradient(90deg, color-mix(in srgb, var(--okc) 9%, transparent), transparent 80%); animation: c33OkIn 2.4s ease-out both; }
[data-c33-ok="new"] { --okc: #2e9e6a; }
[data-c33-ok="chg"] { --okc: var(--lm-accent, #2783de); }
html:not([data-c33-ok-off]) [data-c33-ok].c33-ok-now { animation: c33OkPulse 1.3s ease-out; }
@keyframes c33OkIn { 0% { background-color: color-mix(in srgb, var(--okc) 20%, transparent); } 100% { background-color: transparent; } }
@keyframes c33OkPulse { 0% { background-color: color-mix(in srgb, var(--okc) 26%, transparent); } 100% { background-color: transparent; } }
#c33-ok { position: fixed; z-index: 1003; bottom: 22px; display: flex; align-items: center; gap: 4px; width: max-content; max-width: min(760px, calc(100vw - 24px)); height: 40px; padding: 0 6px 0 12px; border-radius: 999px; color: var(--b-ink); font-size: 12.5px;
  background: color-mix(in srgb, var(--b-bg) 92%, transparent); -webkit-backdrop-filter: blur(16px) saturate(1.6); backdrop-filter: blur(16px) saturate(1.6);
  box-shadow: 0 0 0 1px var(--b-line), 0 14px 36px -14px rgba(15,15,30,.4); transform: translateX(-50%); animation: c33OkBar .45s cubic-bezier(.16,1,.3,1) both; }
@keyframes c33OkBar { from { opacity: 0; transform: translate(-50%, 12px); } }
#c33-ok .ok-ic { flex: none; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; color: #fff; background: linear-gradient(135deg, var(--b-acc), var(--b-acc2)); }
#c33-ok .ok-t { min-width: 0; padding: 0 6px 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-ok .ok-t b { font-weight: 650; }
#c33-ok .ok-n { flex: none; min-width: 34px; font-size: 11px; color: var(--b-ter); text-align: center; font-variant-numeric: tabular-nums; }
#c33-ok button { flex: none; display: inline-flex; align-items: center; gap: 5px; height: 30px; margin: 0; padding: 0 8px; border: 0; border-radius: 999px; background: transparent; color: var(--b-sub); font-size: 12px; cursor: pointer; }
#c33-ok button:hover { background: var(--b-soft); color: var(--b-ink); }
#c33-ok button[hidden] { display: none; }
#c33-ok button.ok-sum { color: var(--b-acc); font-weight: 600; }
#c33-ok button.ok-ib { width: 30px; padding: 0; justify-content: center; }
@media (max-width: 640px) { #c33-ok .ok-t span { display: none; } }
@media (prefers-reduced-motion: reduce) { #c33-lens, #c33-lens-card, #c33-ok, [data-c33-ok] { animation: none !important; } }`;
    (document.head || document.documentElement).appendChild(fxCss);
    const toast = (msg) => { try { obToast(msg); } catch (e) { /* noop */ } };
    const isJa = (s) => { const t = String(s).replace(/\s/g, ''); return (t.match(/[぀-ヿ㐀-鿿]/g) || []).length > t.length * 0.2; };
    const ago = (at) => { const m = Math.max(1, Math.round((Date.now() - at) / 60000)); return m < 60 ? m + ' 分前' : m < 60 * 24 ? Math.round(m / 60) + ' 時間前' : m < 60 * 24 * 45 ? Math.round(m / 1440) + ' 日前' : Math.round(m / 43200) + ' か月前'; };
    const mainFrame = () => [...document.querySelectorAll('.notion-frame')].find((f) => !f.closest('.notion-peek-renderer')) || null;
    const pageTitle = () => { const f = mainFrame(); const h = f && f.querySelector('h1[aria-roledescription="page title"], .notion-page-block h1, h1'); return norm((h && h.textContent) || document.title.replace(/\s*[|｜]\s*Notion\s*$/, '')) || ''; };

    /* ---------- ぶりレンズ ---------- */
    const LENS_ACTS = [['explain', '説明', 'bulb'], ['summary', '要約', 'list'], ['rewrite', '言い換え', 'swap'], ['translate', '訳す', 'lang'], ['continue', '続き', 'pen']];
    const LZ = { sel: null, cur: null, seq: 0, result: '', act: '' };
    let lensBtn = null, lensCard = null, lensT = 0;
    function lensSelection() {
      const sel = window.getSelection && window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
      const text = String(sel).replace(/[ \t]+\n/g, '\n').trim();
      if (text.length < 2 || text.length > 8000) return null;
      const r = sel.getRangeAt(0);
      const node = r.commonAncestorContainer.nodeType === 1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentElement;
      if (!node || !node.closest || node.closest('#c33-lens, #c33-lens-card, #c33-ok, #c33-nsp, #c33-ns, #c33-buri, #c33-search-header, #c33-orbit, input, textarea, .notion-dialog[aria-label="Search Notion"]')) return null;
      const frame = node.closest('.notion-frame, .notion-peek-renderer');
      if (!frame) return null;
      const el = (n) => (n.nodeType === 1 ? n : n.parentElement);
      return { range: r.cloneRange(), text, root: el(r.startContainer).closest('[contenteditable="true"]'), block: el(r.startContainer).closest('[data-block-id]'), endLeaf: el(r.endContainer).closest('[data-content-editable-leaf="true"], [contenteditable="true"]'), frame };
    }
    function lensBtnEl() {
      if (lensBtn && lensBtn.isConnected) return lensBtn;
      lensBtn = mk('button'); lensBtn.id = 'c33-lens'; lensBtn.type = 'button'; lensBtn.hidden = true;
      lensBtn.innerHTML = svg('spark', 14); mk('span', null, 'ぶり', lensBtn);
      lensBtn.title = 'ぶりレンズ — 説明・要約・言い換え・訳す・続きを書く（⌃⌥J）';
      lensBtn.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); });   // 選んだ文字を消さない
      lensBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); lensOpen(); });
      document.body.appendChild(lensBtn);
      fontLock(lensBtn);
      return lensBtn;
    }
    function lensWatch() {
      clearTimeout(lensT);
      if (lensBtn && !lensBtn.hidden) { const s0 = window.getSelection(); if (!s0 || s0.isCollapsed) lensBtn.hidden = true; }
      lensT = setTimeout(() => {
        if (!NS.lens || (lensCard && !lensCard.hidden)) return;
        const s = lensSelection();
        const b = lensBtnEl();
        if (!s) { b.hidden = true; LZ.sel = null; return; }
        const rs = s.range.getClientRects();
        const last = rs.length ? rs[rs.length - 1] : s.range.getBoundingClientRect();
        if (!last || (!last.width && !last.height)) { b.hidden = true; return; }
        LZ.sel = s;
        b.hidden = false;
        const bw = b.offsetWidth || 64, bh = b.offsetHeight || 26;
        let x = Math.min(window.innerWidth - bw - 10, Math.max(10, last.right - bw / 2));
        let y = last.bottom + 8;
        if (y + bh > window.innerHeight - 8) y = Math.max(8, (rs[0] || last).top - bh - 46);
        b.style.left = Math.round(x) + 'px'; b.style.top = Math.round(y) + 'px';
      }, 280);
    }
    document.addEventListener('selectionchange', lensWatch);
    window.addEventListener('scroll', () => { if (lensBtn && !lensBtn.hidden) lensBtn.hidden = true; if (lensCard && !lensCard.hidden && LZ.cur && LZ.cur.range) lensPos(); }, true);
    function lensCardEl() {
      if (lensCard && lensCard.isConnected) return lensCard;
      const c = mk('div'); c.id = 'c33-lens-card'; c.hidden = true; c.setAttribute('role', 'dialog'); c.setAttribute('aria-label', 'ぶりレンズ');
      const top = mk('div', 'lc-top', null, c);
      const face = faceEl(top, 'normal');
      const ttl = mk('b', 'lc-ttl', 'ぶりレンズ', top);
      const who = mk('span', 'lc-who', '', top);
      const x = mk('button', 'lc-ib', null, top); x.type = 'button'; x.innerHTML = svg('x', 15); x.title = '閉じる（esc）';
      x.addEventListener('click', (e) => { e.preventDefault(); lensClose(); });
      const src = mk('div', 'lc-src', '', c);
      const acts = mk('div', 'lc-acts', null, c);
      const btn = {};
      LENS_ACTS.forEach(([k, lb, ic]) => { const b = mk('button', 'lc-act', null, acts); b.type = 'button'; b.dataset.k = k; b.innerHTML = svg(ic, 14); mk('span', null, lb, b); btn[k] = b; b.addEventListener('click', (e) => { e.preventDefault(); lensRun(k); }); });
      const out = mk('div', 'lc-out', null, c); out.hidden = true; out.setAttribute('aria-live', 'polite');
      const tools = mk('div', 'lc-tools', null, c); tools.hidden = true;
      const tool = (ic, lb, fn, cls) => { const b = mk('button', 'lc-tool' + (cls ? ' ' + cls : ''), null, tools); b.type = 'button'; b.innerHTML = svg(ic, 14); mk('span', null, lb, b); b.addEventListener('click', (e) => { e.preventDefault(); fn(); }); return b; };
      const tRep = tool('repl', '置き換える', () => lensInsert('replace'), 'pri');
      const tBelow = tool('below', '下に入れる', () => lensInsert('below'));
      tool('copy', 'コピー', () => lensCopy());
      tool('retry', 'もう一度', () => lensRun(LZ.act, LZ.q));
      tool('arrow', '⌘K で続ける', () => { const cur = LZ.cur; lensClose(); if (cur) nsOpenFromSide('「' + cur.text.slice(0, 300) + '」について、もっと詳しく教えて', false); });
      const ask = mk('div', 'lc-ask', null, c);
      const ta = mk('textarea', null, null, ask); ta.rows = 1; ta.placeholder = 'この部分について聞く…（' + MOD + '+Enter）'; ta.setAttribute('aria-label', 'この部分について聞く');
      const go = mk('button', 'lc-go', null, ask); go.type = 'button'; go.innerHTML = svg('send', 15); go.disabled = true; go.title = '聞く（' + MOD + '+Enter）';
      const send = () => { const q = ta.value.trim(); if (!q) return; ta.value = ''; go.disabled = true; ta.style.height = '28px'; lensRun('ask', q); };
      ta.addEventListener('input', () => { go.disabled = !ta.value.trim(); ta.style.height = '28px'; ta.style.height = Math.min(120, Math.max(28, ta.scrollHeight)) + 'px'; });
      ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); send(); } if (e.key === 'Escape') { e.preventDefault(); lensClose(); } });
      go.addEventListener('click', (e) => { e.preventDefault(); send(); });
      stopKeys(c);
      ['pointerdown', 'mousedown'].forEach((t) => c.addEventListener(t, (e) => { e.stopPropagation(); if (t === 'mousedown' && !e.target.closest('textarea, .lc-out')) e.preventDefault(); }));
      c.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); lensClose(); } });
      document.body.appendChild(c);
      fontLock(c);
      Object.assign(c, { __face: face, __ttl: ttl, __who: who, __src: src, __out: out, __btn: btn, __tools: tools, __rep: tRep, __below: tBelow, __ta: ta });
      lensCard = c;
      return c;
    }
    function lensMood(m) { const f = lensCard && lensCard.__face; if (!f || f.dataset.mood === m) return; f.dataset.mood = m; f.textContent = FACE[m] || FACE.normal; f.classList.remove('pop'); void f.offsetWidth; f.classList.add('pop'); }
    function lensPos() {
      const c = lensCard; if (!c || c.hidden) return;
      const cur = LZ.cur;
      const w = c.offsetWidth || 460, h = c.offsetHeight || 220;
      let x, y;
      const r = cur && cur.range && cur.range.startContainer.isConnected ? cur.range.getBoundingClientRect() : null;
      if (r && (r.width || r.height) && r.bottom > 0 && r.top < window.innerHeight) {
        x = Math.min(window.innerWidth - w - 12, Math.max(12, r.left));
        y = r.bottom + 10;
        if (y + h > window.innerHeight - 12) y = r.top - h - 10 >= 12 ? r.top - h - 10 : Math.max(12, window.innerHeight - h - 12);
      } else if (cur && cur.at) { x = Math.min(window.innerWidth - w - 12, Math.max(12, cur.at.x - w / 2)); y = Math.max(12, Math.min(window.innerHeight - h - 12, cur.at.y)); }
      else { x = (window.innerWidth - w) / 2; y = Math.max(12, (window.innerHeight - h) / 2); }
      c.style.left = Math.round(x) + 'px'; c.style.top = Math.round(y) + 'px';
    }
    /* 開く: act があればすぐ聞く。text だけの時（Atelier の文字メニュー・おかえり要約）は置き換え／下に入れるは出さない */
    function lensOpen(act, text, opt) {
      opt = opt || {};
      const s = text ? null : (lensSelection() || LZ.sel);
      const t = text || (s && s.text);
      if (!t) { toast('まず、ページの文字を選んでください（それから ⌃⌥J）'); return; }
      LZ.cur = s ? Object.assign({}, s) : { text: t, range: null, at: opt.at || null };
      LZ.result = '';
      if (lensBtn) lensBtn.hidden = true;
      const c = lensCardEl();
      c.dataset.mode = opt.mode || 'lens';
      c.__ttl.textContent = opt.title || 'ぶりレンズ';
      c.__who.textContent = '';
      c.__src.textContent = opt.src || (t.length > 220 ? t.slice(0, 220) + '…' : t);
      c.__btn.translate.querySelector('span').textContent = isJa(t) ? '英訳' : '和訳';
      Object.values(c.__btn).forEach((b) => b.classList.remove('on'));
      c.__out.hidden = true; c.__out.textContent = ''; c.__tools.hidden = true;
      const canPut = !!(s && s.root && s.root.isConnected);
      c.__rep.hidden = !canPut; c.__below.hidden = !canPut;   // 選んだ所が無い時（文字だけ渡された・おかえり要約）は出さない
      c.__rep.title = canPut ? '選んだ所を、この答えに置き換える（⌘Z で戻せる）' : '選んだ所が分からないので使えません（コピーしてください）';
      lensMood('normal');
      c.hidden = false;
      lensPos();
      if (act) lensRun(act, opt.q, opt.job);
    }
    function lensClose() {
      LZ.seq++;
      if (lensCard) { lensCard.hidden = true; lensCard.classList.remove('busy'); }
      LZ.cur = null;
    }
    function lensContext(cur) {
      const ctx = { title: pageTitle(), around: '' };
      const b = cur && cur.block && cur.block.isConnected ? cur.block : null;
      if (b) {
        const parts = [];
        let p = b.previousElementSibling; for (let i = 0; p && i < 2; p = p.previousElementSibling) if (p.matches('[data-block-id]')) { parts.unshift(p.innerText); i++; }
        parts.push(b.innerText);
        let n = b.nextElementSibling; for (let i = 0; n && i < 2; n = n.nextElementSibling) if (n.matches('[data-block-id]')) { parts.push(n.innerText); i++; }
        ctx.around = parts.join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 1800);
      }
      return ctx;
    }
    const LENS_SYS = () => [
      'あなたは「ぶり」（B.U.R.I）。' + BURI.nick() + 'の Notion で、選ばれた文章を手伝う相棒。',
      '・出力は「頼まれた中身」だけ。前置き（「はい」「以下は〜です」）・あいさつ・締めの一言・顔文字・[[ ]] の印・出典番号は書かない。',
      '・日本語は、友だちに話すような自然な日本語で。翻訳調・説明書調にしない。1 文は短く（40〜60 字）。',
      '・箇条書きと **太字** は使ってよい。見出し（#）は使わない。',
      '・分からないことは推測で埋めず、「ここだけでは分かりません」と言う。'
    ].join('\n');
    function lensJob(act, text, q) {
      const tgt = isJa(text) ? '英語' : '日本語';
      return {
        explain: '選んだ部分を、前後の文脈をふまえて、やさしく説明して。むずかしい言葉は言い換える。3〜6 文。',
        summary: '選んだ部分を要約して。大事な点を 2〜4 個の短い箇条書きで。',
        rewrite: '選んだ部分を、意味を変えずに、読みやすく自然な文に書き直して。書き直した文だけを出す（説明はつけない）。元が英語なら自然な英語に。',
        translate: '選んだ部分を自然な' + tgt + 'に訳して。訳文だけを出す（説明はつけない）。',
        continue: '選んだ部分の続きを、同じ文体・同じ調子・同じ言語で 2〜4 文書いて。続きの文だけを出す（選んだ部分はくり返さない）。',
        ask: '選んだ部分について、次の質問に答えて: ' + (q || '')
      }[act] || '';
    }
    async function lensRun(act, q, job) {
      const c = lensCard, cur = LZ.cur; if (!c || !cur) return;
      const my = ++LZ.seq;
      LZ.act = act; LZ.q = q || ''; LZ.job = job || LZ.job;
      const jb = LZ.job;
      Object.values(c.__btn).forEach((b) => b.classList.toggle('on', b.dataset.k === act));
      const name = (LENS_ACTS.find((x) => x[0] === act) || [])[1];
      if (name) c.__ttl.textContent = act === 'translate' ? c.__btn.translate.textContent : name;
      else if (act === 'ask') c.__ttl.textContent = '聞く';
      c.__out.hidden = false; c.__out.textContent = ''; c.__tools.hidden = true; c.__who.textContent = '';
      const dots = mk('div', 'thinking-dots', null, c.__out); dots.append(mk('span'), mk('span'), mk('span'));
      c.classList.add('busy'); lensMood(act === 'continue' ? 'write' : act === 'okaeri' ? 'search' : 'think');
      lensPos();
      if (!BURI.aiOn()) {
        c.classList.remove('busy'); c.__out.textContent = '';
        mk('div', 'lc-err', 'AI がまだつながっていません。⌘K の B.U.R.I → 設定（⚙）で、無料の Gemini などの鍵を入れると使えます。', c.__out);
        lensMood('sad'); return;
      }
      const ctx = lensContext(cur);
      const user = act === 'okaeri' ? jb : '# ページ\n' + (ctx.title || '（題名なし）') + (ctx.around ? '\n\n# 前後の文脈（参考）\n' + ctx.around : '') + '\n\n# 選んだ部分\n' + cur.text + '\n\n# 頼みごと\n' + lensJob(act, cur.text, q);
      const r = await BURI.quick(LENS_SYS(), user, act === 'summary' ? 600 : 1100);
      if (my !== LZ.seq) return;
      c.classList.remove('busy'); c.__out.textContent = '';
      if (!r.text) { mk('div', 'lc-err', 'うまく答えられませんでした。（' + (r.err || '不明') + '）', c.__out); lensMood('sad'); lensPos(); return; }
      LZ.result = r.text;
      richText(c.__out, r.text, null, []);
      c.__who.textContent = r.name ? r.name + (r.model ? ' · ' + String(r.model).replace(/^models\//, '').slice(0, 28) : '') : '';
      c.__tools.hidden = false;
      lensMood(act === 'continue' ? 'satisfied' : act === 'okaeri' ? 'back' : 'happy');
      lensPos();
    }
    /* 答えを Notion に入れる: Notion の「貼り付け」として渡す（Markdown の箇条書き・太字もそのまま段になる）。効かない時はコピー */
    const plainOf = (t) => String(t || '').replace(/\r/g, '').trim();
    function lensSelectRange(cur, mode) {
      if (!cur || !cur.range || !cur.root || !cur.root.isConnected) return false;
      try { cur.root.focus({ preventScroll: true }); } catch (e) { /* noop */ }
      const sel = window.getSelection(); if (!sel) return false;
      sel.removeAllRanges();
      if (mode === 'below') {
        const leaf = cur.endLeaf && cur.endLeaf.isConnected ? cur.endLeaf : cur.root;
        const r = document.createRange(); r.selectNodeContents(leaf); r.collapse(false); sel.addRange(r);
      } else sel.addRange(cur.range);
      return true;
    }
    function pasteInto(text) {
      const sel = window.getSelection();
      const n = sel && sel.anchorNode; const target = n ? (n.nodeType === 1 ? n : n.parentElement) : document.activeElement;
      if (!target) return false;
      try {
        const dt = new DataTransfer(); dt.setData('text/plain', text);
        const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true, composed: true });
        target.dispatchEvent(ev);
        return true;
      } catch (e) { return false; }
    }
    async function lensInsert(mode) {
      const cur = LZ.cur, text = plainOf(LZ.result);
      if (!text) return;
      const pc = (cur && cur.block && cur.block.closest('.notion-page-content')) || (cur && cur.frame) || document.querySelector('.notion-page-content');
      const sig = () => (pc ? pc.textContent.length + ':' + pc.querySelectorAll('[data-block-id]').length : '');
      if (!lensSelectRange(cur, mode)) { await lensCopy(true); return; }
      const s0 = sig();
      if (mode === 'below') {
        /* 段の終わりで Enter（新しい段）→ そこに貼る */
        const a = window.getSelection().anchorNode; const t = a && (a.nodeType === 1 ? a : a.parentElement);
        try { t && t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true })); } catch (e) { /* noop */ }
        await waitMs(80);
      }
      const s1 = sig();
      pasteInto(mode === 'below' && s1 === s0 ? '\n' + text : text);
      await waitMs(320);
      if (sig() !== s1) { lensClose(); toast(mode === 'below' ? '下に入れました（⌘Z で元に戻せます）' : '置き換えました（⌘Z で元に戻せます）'); return; }
      try { if (document.execCommand('insertText', false, (mode === 'below' ? '\n' : '') + text)) { await waitMs(200); if (sig() !== s1) { lensClose(); toast('入れました（⌘Z で元に戻せます）'); return; } } } catch (e) { /* noop */ }
      await lensCopy(true);
    }
    const waitMs = (ms) => new Promise((r) => setTimeout(r, ms));
    async function lensCopy(fallback) {
      const text = plainOf(LZ.result); if (!text) return;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        try { const ta = mk('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (x) { ok = false; }
      }
      toast(ok ? (fallback ? 'ここには直接入れられなかったので、コピーしました（⌘V で貼れます）' : 'コピーしました') : 'コピーできませんでした');
      if (ok && fallback) lensClose();
    }
    document.addEventListener('pointerdown', (e) => {
      if (lensCard && !lensCard.hidden && !lensCard.contains(e.target) && !(lensBtn && lensBtn.contains(e.target)) && !(okBar && okBar.contains(e.target))) lensClose();
    }, true);

    /* ---------- おかえりハイライト ---------- */
    const OK_IDX = 'c33.ok.idx', OK_PFX = 'c33.ok.', OK_MAX_PAGES = 150, OK_MAX_BLOCKS = 1500;
    const OK = { page: '', base: null, seen: new Set(), map: new Map(), marks: [], i: -1, arrive: 0, dirty: false };
    let okBar = null;
    const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
    const okKey = (id) => id.replace(/-/g, '').slice(0, 12);
    function okLoad(pid) { try { const o = JSON.parse(localStorage.getItem(OK_PFX + pid) || 'null'); return o && o.b ? o : null; } catch (e) { return null; } }
    function okStore(pid) {
      if (!pid || !OK.map.size) return;
      const b = Object.assign({}, OK.base ? OK.base.b : {});
      for (const [k, h] of OK.map) b[k] = h;
      const keys = Object.keys(b); if (keys.length > OK_MAX_BLOCKS) keys.slice(0, keys.length - OK_MAX_BLOCKS).forEach((k) => delete b[k]);
      const rec = { at: Date.now(), t: pageTitle().slice(0, 80), b };
      try {
        localStorage.setItem(OK_PFX + pid, JSON.stringify(rec));
        let idx = []; try { idx = JSON.parse(localStorage.getItem(OK_IDX) || '[]') || []; } catch (e) { idx = []; }
        idx = idx.filter((x) => x !== pid); idx.unshift(pid);
        idx.slice(OK_MAX_PAGES).forEach((x) => { try { localStorage.removeItem(OK_PFX + x); } catch (e) { /* noop */ } });
        localStorage.setItem(OK_IDX, JSON.stringify(idx.slice(0, OK_MAX_PAGES)));
      } catch (e) { /* 入りきらない時は覚えない */ }
      OK.dirty = false;
    }
    /* 段ごとの「指紋」: 自分の文字（入れ子の段は除く）＋チェックの状態。画像は場所の URL の末尾 */
    /* 「今日」「昨日」のように日がたつと変わる日付・ページの言及の文字は、指紋に入れない（中身が変わっていないのに光らないように） */
    function ownText(leaf) {
      let s = '';
      const w = document.createTreeWalker(leaf, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) { const p = n.parentElement; if (p && p !== leaf && p.closest('[class*="mention"], [class*="Mention"]') && leaf.contains(p.closest('[class*="mention"], [class*="Mention"]'))) continue; s += n.nodeValue; }
      return s;
    }
    function okScan() {
      const f = mainFrame(); const pc = f && f.querySelector('.notion-page-content');
      if (!pc) return null;
      const out = [];
      for (const el of pc.querySelectorAll('[data-block-id]')) {
        const id = el.getAttribute('data-block-id'); if (!id) continue;
        let t = null;
        const leaf = el.querySelector('[data-content-editable-leaf="true"]');
        if (leaf && leaf.closest('[data-block-id]') === el) t = ownText(leaf);
        else if (el.matches('.notion-image-block')) { const im = el.querySelector('img'); t = 'img:' + String(im && im.getAttribute('src') || '').split('?')[0].slice(-48); }
        if (t == null) continue;
        const ck = el.querySelector('[role="checkbox"], input[type="checkbox"]');
        if (ck && ck.closest('[data-block-id]') === el) t += '|' + (ck.getAttribute('aria-checked') || (ck.checked ? 'true' : 'false'));
        out.push({ id, el, h: fnv(norm(t)) });
      }
      return { pc, list: out };
    }
    function okRun() {
      if (!NS.okaeri) return;
      const pid = curPage();
      if (pid !== OK.page) {
        if (OK.page && OK.dirty) okStore(OK.page);
        okClear(true);
        OK.page = pid; OK.base = pid ? okLoad(pid) : null; OK.seen = new Set(); OK.map = new Map(); OK.arrive = 0;
      }
      if (!pid || document.hidden) return;
      const s = okScan(); if (!s || !s.list.length) return;
      if (!OK.arrive) OK.arrive = Date.now();
      /* 着いてから 4 秒の間に描かれた段だけを比べる（その後に増えた段は、自分で書いたもの＝光らせない） */
      const fresh = Date.now() - OK.arrive < 4000;
      const base = OK.base && Date.now() - OK.base.at > 90 * 1000 ? OK.base : null;
      const add = [];
      for (const x of s.list) {
        const k = okKey(x.id);
        if (OK.map.get(k) !== x.h) { OK.map.set(k, x.h); OK.dirty = true; }
        if (OK.seen.has(k)) continue;
        OK.seen.add(k);
        if (!fresh || !base) continue;
        const old = base.b[k];
        if (old === x.h) continue;
        add.push({ el: x.el, kind: old ? 'chg' : 'new' });
      }
      if (add.length) {
        const total = s.list.length;
        const many = OK.marks.length + add.length > Math.max(14, total * 0.6);
        if (!many) add.forEach((m) => m.el.setAttribute('data-c33-ok', m.kind));
        OK.marks = OK.marks.concat(add);
        okBarShow(base.at, many);
      }
      if (OK.dirty && !OK.saveT) OK.saveT = setTimeout(() => { OK.saveT = 0; if (OK.page === pid && !document.hidden) okStore(pid); }, fresh ? 5000 : 15000);
    }
    function okClear(silent) {
      OK.marks.forEach((m) => { if (m.el.isConnected) { m.el.removeAttribute('data-c33-ok'); m.el.classList.remove('c33-ok-now'); } });
      OK.marks = []; OK.i = -1;
      if (okBar) okBar.hidden = true;
      if (!silent && OK.page) okStore(OK.page);
    }
    function okBarEl() {
      if (okBar && okBar.isConnected) return okBar;
      const b = mk('div'); b.id = 'c33-ok'; b.hidden = true; b.setAttribute('role', 'status');
      const ic = mk('span', 'ok-ic', null, b); ic.innerHTML = svg('spark', 13);
      const t = mk('span', 'ok-t', null, b);
      const up = mk('button', 'ok-ib', null, b); up.type = 'button'; up.innerHTML = svg('up', 16); up.title = '前の変わった所';
      const n = mk('span', 'ok-n', '', b);
      const dn = mk('button', 'ok-ib', null, b); dn.type = 'button'; dn.innerHTML = svg('dn', 16); dn.title = '次の変わった所（⌃⌥N）';
      const sum = mk('button', 'ok-sum', null, b); sum.type = 'button'; sum.innerHTML = svg('spark', 13); sum.append('ぶりに要約'); sum.title = '変わった所を、ぶりが短くまとめる';
      const x = mk('button', 'ok-ib', null, b); x.type = 'button'; x.innerHTML = svg('check', 15); x.title = '見た（光を消す）';
      up.addEventListener('click', (e) => { e.preventDefault(); okGo(-1); });
      dn.addEventListener('click', (e) => { e.preventDefault(); okGo(1); });
      sum.addEventListener('click', (e) => { e.preventDefault(); okSummary(); });
      x.addEventListener('click', (e) => { e.preventDefault(); okClear(); });
      ['pointerdown', 'mousedown'].forEach((ty) => b.addEventListener(ty, (e) => e.stopPropagation()));
      document.body.appendChild(b);
      fontLock(b);
      Object.assign(b, { __t: t, __n: n });
      okBar = b;
      return b;
    }
    function okBarShow(at, many) {
      const b = okBarEl();
      const n = OK.marks.length;
      const nw = OK.marks.filter((m) => m.kind === 'new').length;
      b.__t.innerHTML = '';
      mk('span', null, 'おかえりなさい。', b.__t);
      mk('b', null, ago(at), b.__t);
      b.__t.append(many ? ' から大きく書き換わっています' : ' から ');
      if (!many) { mk('b', null, n + ' か所', b.__t); b.__t.append(nw && nw < n ? ' 変わりました（新しい段 ' + nw + '）' : nw === n ? ' 増えました' : ' 変わりました'); }
      b.__n.textContent = many ? '' : (OK.i >= 0 ? OK.i + 1 : 0) + ' / ' + n;
      b.querySelectorAll('.ok-ib').forEach((x, i) => { if (i < 2) x.hidden = many; });
      const f = mainFrame(); const fr = f ? f.getBoundingClientRect() : { left: 0, width: window.innerWidth };
      b.style.left = Math.round(fr.left + fr.width / 2) + 'px';
      b.hidden = false;
    }
    function okGo(d) {
      const live = OK.marks.filter((m) => m.el.isConnected && m.el.hasAttribute('data-c33-ok'));
      if (!live.length) return;
      OK.i = ((OK.i < 0 && d < 0 ? 0 : OK.i) + d + live.length) % live.length;
      const el = live[OK.i].el;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.remove('c33-ok-now'); void el.offsetWidth; el.classList.add('c33-ok-now');
      if (okBar) okBar.__n.textContent = (OK.i + 1) + ' / ' + live.length;
    }
    /* 変わった所の中身（いま画面にある文字）— ぶりの要約と、⌘K の「前回から変わった所」に使う */
    function okPack() {
      if (!OK.marks.length || !OK.base) return null;
      const items = OK.marks.filter((m) => m.el.isConnected).slice(0, 40).map((m) => ({ kind: m.kind, text: norm(m.el.innerText).slice(0, 400) })).filter((x) => x.text);
      if (!items.length) return null;
      return { title: pageTitle(), since: ago(OK.base.at), items };
    }
    function okSummary() {
      const p = okPack(); if (!p) { toast('まとめる変わった所がありません'); return; }
      const job = '# ページ\n' + (p.title || '（題名なし）') + '\n\n# ' + BURI.nick() + 'が前に見た時（' + p.since + '）から、変わった・増えた段\n' +
        p.items.map((x) => (x.kind === 'new' ? '［新しい段］' : '［書き換わった段］') + x.text).join('\n') +
        '\n\n# 頼みごと\n前に見た時から何が変わったのかを、' + BURI.nick() + 'に短く伝えて。大事な変化から 2〜5 個の箇条書き。最初に一文で全体の様子（例:「予定が 2 つ増えて、締め切りが動いたよ」）。';
      const r = okBar && !okBar.hidden ? okBar.getBoundingClientRect() : null;
      lensOpen('okaeri', p.items.map((x) => x.text).join('\n'), { mode: 'okaeri', title: 'おかえり — 変わった所', src: p.since + 'から ' + p.items.length + ' か所', job, at: r ? { x: r.left + r.width / 2, y: r.top - 340 } : null });
    }
    BURI.setDelta(okPack);
    let okT = 0;
    const okSoon = () => { if (okT || !NS.okaeri) return; okT = setTimeout(() => { okT = 0; try { okRun(); } catch (e) { /* noop */ } }, !OK.arrive || Date.now() - OK.arrive < 4000 ? 600 : 3000); };
    new MutationObserver((recs) => { for (const r of recs) { const t = r.target; if (t.nodeType === 1 && t.closest && t.closest('.notion-page-content')) { okSoon(); return; } } }).observe(document.body, { childList: true, subtree: true, characterData: false });
    setInterval(() => { if (!document.hidden && NS.okaeri) { if (curPage() !== OK.page) okSoon(); else if (OK.dirty && !OK.saveT) okStore(OK.page); } }, 1500);
    document.addEventListener('visibilitychange', () => { if (document.hidden && OK.page && OK.dirty) okStore(OK.page); });
    window.addEventListener('pagehide', () => { if (OK.page && OK.dirty) okStore(OK.page); });
    window.addEventListener('resize', () => { if (okBar && !okBar.hidden && OK.base) okBarShow(OK.base.at, OK.marks.length && !OK.marks[0].el.hasAttribute('data-c33-ok')); });
    okSoon();

    /* キー: ⌃⌥J ぶりレンズ ／ ⌃⌥N 次の変わった所 */
    document.addEventListener('keydown', (e) => {
      if (!((e.metaKey || e.ctrlKey) && e.altKey)) return;
      if (e.code === 'KeyJ') { e.preventDefault(); e.stopPropagation(); lensOpen(); }
      else if (e.code === 'KeyN' && OK.marks.length) { e.preventDefault(); e.stopPropagation(); okGo(1); }
    }, true);
    /* 柱どうしの呼び出し（²⁶ Atelier の文字メニューの「ぶり」「Orbit」） */
    document.addEventListener('cordi:run', (e) => {
      let d = {}; try { d = typeof e.detail === 'string' ? JSON.parse(e.detail) : (e.detail || {}); } catch (x) { d = {}; }
      if (d.id === 'c33.lens') { const s = lensSelection(); if (s) { LZ.sel = s; lensOpen(); } else lensOpen(null, d.text || '', { at: d.x != null ? { x: d.x, y: d.y + 8 } : null }); }
      else if (d.id === 'c33.orbit') obToggle();
      else if (d.id === 'c33.okaeri') { if (OK.marks.length) okGo(1); else toast('前に見た時から変わった所はありません'); }
    });

    window.addEventListener('resize', layout);
    /* v67: 軽く — 位置合わせは 0.45 秒おき＋サイドバーの変化・スクロール・大きさの変化の時だけ（以前は 0.15 秒おきに常に） */
    let layRaf = 0;
    const layoutSoon = () => { if (layRaf) return; layRaf = requestAnimationFrame(() => { layRaf = 0; layout(); }); };
    setInterval(() => { if (!document.hidden) layoutSoon(); }, 2000);   // 保険だけ（ふだんは変化の瞬間に置き直す）
    document.addEventListener('scroll', layoutSoon, true);
    window.__c33LayoutSoon = layoutSoon;
    layoutNow = layout;

    /* ============================================================
     *  v97 Nebius ('-' 鰤)з セクション — B.U.R.I のパネル
     *   ・ピル: 顔は SVG（目は必ずまっすぐの縦線・どの書体でも同じ）。乗せると右へ伸びて「探す・聞く ⌘K」。待機中の小さな点
     *   ・パネル: 段階 1（上の中央・720px）／2（右に寄せたピン留め・400px）／3（本文いっぱい）。白ではなく Notion の温かい地の色・枠線なし
     *   ・ホーム: 時間帯のあいさつ・入力欄・質問のチップ（押すと入るだけ・送らない）
     *   ・入力: ⌘↵（Windows は Ctrl+↵）で送る・↵ と ⇧↵ は改行。変換中は何も送らない
     *   ・候補: 打つと Notion のページの候補（所属の DB つき）。↓ で入って ↵ = DB の中でサイドピーク・⌘↵ = 新しいタブ・⇧↵ = ページだけ
     *   ・ページを開く = 親のフル DB へ移って、サイドピークで開く。Orbit と Stella も一緒に回る（経路点灯）
     * ============================================================ */
    const NPK = 'c33.np.v1';
    const NPS = Object.assign({ stage: 1, hotkey: true, day: '', drawerPin: false }, BURI.gmGet(NPK, {}) || {});
    const npSave = () => BURI.gmSet(NPK, NPS);
    const NMOD = IS_MAC ? '⌘' : 'Ctrl';
    const KEYSEND = IS_MAC ? '⌘↵' : 'Ctrl+↵';
    const isTouch = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })();
    const faceNorm = (t) => String(t || '').replace(/\(\s*[‘’'´ʼ′`]\s*-\s*[‘’'´ʼ′`]\s*([^()\s]{1,3})\)\s*з/gu, (m0, k) => "('-' " + k + ')з');
    const id32 = (x) => String(x || '').replace(/-/g, '').toLowerCase();
    const dashId = (h) => { h = id32(h); return h.length === 32 ? h.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5') : h; };
    const npLive = mk('div'); npLive.id = 'c33-np-live'; npLive.setAttribute('aria-live', 'polite'); npLive.className = 'np-sr';
    const say = (t) => { npLive.textContent = ''; setTimeout(() => { npLive.textContent = t; }, 30); };

    /* ---- ピル ---- */
    const pill = mk('button'); pill.id = 'c33-pill'; pill.type = 'button';
    pill.setAttribute('aria-label', "('-' 鰤)з — 探す・聞く（" + NMOD + 'K）');
    pill.innerHTML = '<span class="pl-f" aria-hidden="true">' + FACE_SVG + '</span><span class="pl-x" aria-hidden="true"><span class="pl-t">探す・聞く</span><kbd>' + NMOD + (IS_MAC ? '' : ' ') + 'K</kbd></span><i class="pl-dot" aria-hidden="true"></i>';
    header.insertBefore(pill, header.firstChild);
    csFace.remove(); csHint.remove();   // v97: 文字の顔・「聞く・…」はやめた
    pill.addEventListener('mousedown', (e) => e.preventDefault());
    pill.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); npToggle(); });
    /* 伸びた幅が Stella に入らない時は ⌘K だけ（文字が見切れる状態を作らない） */
    function pillFit() {
      const w = header.getBoundingClientRect().width;
      pill.classList.toggle('narrow', w < 214);
      pill.classList.toggle('tiny', w < 150);
    }

    /* ---- パネル ---- */
    const veil = mk('div'); veil.id = 'c33-np-veil'; veil.hidden = true;
    const np = mk('div'); np.id = 'c33-np'; np.hidden = true;
    np.setAttribute('role', 'dialog'); np.setAttribute('aria-label', "('-' 鰤)з B.U.R.I — 探す・聞く");
    np.innerHTML = `
<nav class="n2-rail" aria-label="B.U.R.I のメニュー">
  <button type="button" data-a="new" title="新しい会話">${svg('plus', 17)}</button>
  <button type="button" data-a="find" title="探す（会話とページ）">${svgI('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>').replace('width="18" height="18"', 'width="17" height="17"')}</button>
  <button type="button" data-a="hist" title="これまでの会話">${svg('clock', 17)}</button>
  <span class="n2-sp"></span>
  <button type="button" data-a="set" title="設定（AI・本棚・覚えたこと）">${svg('tune', 17)}</button>
</nav>
<div class="n2-main">
  <div class="n2-top">
    <button type="button" data-a="pin" title="右に寄せてピン留め">${svgI('<path d="M14 3l7 7-3 1-4 4 1 4-2 2-4-4-5 5-1-1 5-5-4-4 2-2 4 1 4-4z"/>').replace('width="18" height="18"', 'width="15" height="15"')}</button>
    <button type="button" data-a="max" title="大きく（本文いっぱい）">${svgI('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>').replace('width="18" height="18"', 'width="15" height="15"')}</button>
    <button type="button" data-a="close" title="閉じる（esc）">${svg('x', 15)}</button>
  </div>
  <div class="n2-scroll">
    <div class="n2-hero"><div class="n2-hi"></div></div>
    <div class="n2-log" role="log" aria-live="polite"></div>
  </div>
  <div class="n2-compose">
    <div class="n2-box">
      <span class="n2-scope" hidden><i class="n2-glyph"></i><span></span></span>
      <textarea rows="1" spellcheck="false" aria-label="B.U.R.I に聞く・Notion を探す"></textarea>
      <button type="button" class="n2-send" aria-label="送信">${svg('send', 16)}</button>
    </div>
    <div class="n2-cands" role="listbox" hidden></div>
    <div class="n2-hint" aria-live="off"></div>
    <div class="n2-chips"></div>
  </div>
</div>
<aside class="n2-drawer" hidden>
  <div class="n2-dsearch"><input type="text" spellcheck="false" placeholder="会話とページを探す…" aria-label="会話とページを探す"></div>
  <div class="n2-dlist"></div>
</aside>`;
    document.body.append(veil, np, npLive);
    const $ = (s) => np.querySelector(s);
    const nta = $('textarea'), sendBtn = $('.n2-send'), candsEl = $('.n2-cands'), hintEl = $('.n2-hint'), chipsEl = $('.n2-chips');
    const logEl = $('.n2-log'), heroEl = $('.n2-hero'), hiEl = $('.n2-hi'), scrollEl = $('.n2-scroll');
    const scopeEl = $('.n2-scope'), drawer = $('.n2-drawer'), dIn = drawer.querySelector('input'), dList = drawer.querySelector('.n2-dlist');
    nta.placeholder = nick() + '、ぶりに聞いてみて…';
    for (const ev of ['keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'paste', 'copy', 'cut', 'pointerdown', 'mousedown', 'click', 'wheel']) np.addEventListener(ev, (e) => e.stopPropagation());
    let npOpen = false, npBusy = false, npSeq = 0, npStageBefore3 = 1, npChat = false, npPeekWait = null;

    /* ---- 段階 ---- */
    function stageRect(st) {
      const vw = window.innerWidth, vh = window.innerHeight;
      if (st === 2) { const w = Math.min(400, vw - 24); return { left: vw - w - 10, top: 10, width: w, height: vh - 20 }; }
      if (st === 3) {
        const f = [...document.querySelectorAll('.notion-frame')].find((x) => !x.closest('.notion-peek-renderer') && x.getBoundingClientRect().width > 200);
        const r = f ? f.getBoundingClientRect() : { left: 0, top: 0, width: vw, height: vh };
        return { left: Math.round(r.left + 8), top: Math.round(r.top + 8), width: Math.round(r.width - 16), height: Math.round(Math.min(vh, r.height) - 16) };
      }
      const w = Math.min(720, vw - 32);
      return { left: Math.round((vw - w) / 2), top: Math.round(Math.min(96, vh * 0.12)), width: w, height: null };
    }
    function npPlace() {
      const st = +np.dataset.stage || 1;
      const r = stageRect(st);
      np.style.left = r.left + 'px'; np.style.top = r.top + 'px'; np.style.width = r.width + 'px';
      if (r.height != null) { np.style.height = r.height + 'px'; np.style.maxHeight = ''; }
      else { np.style.height = ''; np.style.maxHeight = Math.round(window.innerHeight * 0.8) + 'px'; }
      veil.hidden = !npOpen || st !== 1;
      np.querySelector('[data-a="pin"]').classList.toggle('on', st === 2);
      np.querySelector('[data-a="max"]').classList.toggle('on', st === 3);
    }
    function npStage(st) {
      const from = np.getBoundingClientRect();
      if (st === 3 && np.dataset.stage !== '3') npStageBefore3 = +np.dataset.stage || 1;
      np.dataset.stage = String(st);
      if (st !== 3) { NPS.stage = st; npSave(); }
      npPlace();
      const to = np.getBoundingClientRect();
      if (!nbReduce() && from.width && to.width) np.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})` }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
      nta.focus();
    }
    /* ピルの位置から広がる（どこから開いたかを目で追える） */
    function npMorph(open) {
      const pr = pill.getBoundingClientRect(), r = np.getBoundingClientRect();
      if (nbReduce() || !pr.width || !r.width) return Promise.resolve();
      const k = `translate(${pr.left - r.left}px, ${pr.top - r.top}px) scale(${pr.width / r.width}, ${pr.height / r.height})`;
      const a = np.animate(open ? [{ transform: k, opacity: 0, borderRadius: '999px' }, { transform: 'none', opacity: 1, borderRadius: '14px' }] : [{ transform: 'none', opacity: 1 }, { transform: k, opacity: 0 }], { duration: open ? 250 : 200, easing: open ? 'cubic-bezier(.2,.85,.25,1)' : 'cubic-bezier(.5,0,.75,.2)' });
      return a.finished.catch(() => {});
    }
    function npToggle() { if (npOpen) npClose(); else npOpenNow(); }
    function npOpenNow(text) {
      if (!npOpen) {
        npOpen = true;
        np.hidden = false;
        np.dataset.stage = String(document.querySelector('.notion-peek-renderer') && NPS.stage === 2 ? 1 : NPS.stage === 2 ? 2 : 1);
        npPlace();
        npHome(false);
        npMorph(true);
        pill.classList.remove('ping');
        pill.setAttribute('aria-expanded', 'true');
      }
      if (text != null) { nta.value = text; npGrow(); }
      npScope(true);
      requestAnimationFrame(() => { npGrow(); nta.focus(); try { nta.setSelectionRange(nta.value.length, nta.value.length); } catch (e) { /* noop */ } });
      npCandsSoon();
    }
    async function npClose(why) {
      if (!npOpen) return;
      npOpen = false;
      npCandsHide();
      drawerShow(false);
      if (np.dataset.stage === '3') np.dataset.stage = String(npStageBefore3);
      veil.hidden = true;
      await npMorph(false);
      if (npOpen) return;
      np.hidden = true;
      pill.setAttribute('aria-expanded', 'false');
      if (why !== 'nav') pill.focus({ preventScroll: true });
    }

    /* ---- ホーム ---- */
    function npGreet() {
      const h = new Date().getHours(), nm = nick() || 'Wパパ', day = new Date().toDateString();
      if (NPS.day !== day) { NPS.day = day; npSave(); return 'おかえり、' + nm; }
      return (h >= 5 && h < 10 ? 'おはよう、' : h >= 10 && h < 17 ? 'おかえり、' : h >= 17 && h < 23 ? 'おつかれさま、' : '遅くまでおつかれさま、') + nm;
    }
    function npHome(reset) {
      if (reset) { npChat = false; logEl.textContent = ''; }
      np.classList.toggle('chat', npChat);
      if (!npChat) { hiEl.textContent = npGreet(); hiEl.classList.remove('bye'); }
      npChips();
      npHint();
    }
    function npChips() {
      chipsEl.textContent = '';
      if (npChat) return;
      const pt = (() => { try { return pageTitle(); } catch (e) { return ''; } })();
      const list = [];
      if (pt) list.push(pt + 'を要約して');
      for (const q of hist()) { if (list.length >= 4) break; if (q && !list.includes(q) && q.length <= 40) list.push(q); }
      list.forEach((q, i) => {
        const b = mk('button', 'n2-chip', q, chipsEl); b.type = 'button'; b.style.setProperty('--i', String(i));
        b.addEventListener('click', () => { nta.value = q; npGrow(); nta.focus(); nta.setSelectionRange(q.length, q.length); npCandsHide(); });
      });
    }
    function kbd(t) { return '<kbd>' + t + '</kbd>'; }
    let listMode = false, listIx = -1;
    function npHint() {
      hintEl.innerHTML = listMode
        ? kbd('↵') + ' DBで開く · ' + kbd(KEYSEND) + ' 新しいタブ · ' + kbd('⇧↵') + ' ページだけ · ' + kbd('esc') + ' 入力に戻る'
        : (isTouch ? '送るボタンで送る · ' + kbd('↵') + ' で改行' : kbd(KEYSEND) + ' で送る · ' + kbd('↵') + ' で改行');
    }

    /* ---- 範囲のチップ（いまの惑星の中だけ） ---- */
    let scopeGid = '';
    function npScope(reset) {
      if (reset) scopeGid = OB.on ? OB.sel || '' : '';
      const g = scopeGid ? obGroups().find((x) => x.gid === scopeGid) : null;
      scopeEl.hidden = !g;
      if (g) { obIcPaint(scopeEl.firstElementChild, g); scopeEl.lastElementChild.textContent = g.label + '内'; scopeEl.title = g.label + ' の中だけを探します（⌫ で外す）'; }
    }

    /* ---- 入力欄 ---- */
    function npGrow() {
      nta.style.height = 'auto';
      const lh = parseFloat(getComputedStyle(nta).lineHeight) || 21;
      nta.style.height = Math.min(nta.scrollHeight, lh * 8 + 4) + 'px';
      nta.style.overflowY = nta.scrollHeight > lh * 8 + 4 ? 'auto' : 'hidden';
      sendBtn.classList.toggle('on', !!nta.value.trim());
    }
    let imeGuard = false;
    nta.addEventListener('compositionend', () => { imeGuard = true; requestAnimationFrame(() => { imeGuard = false; }); });
    nta.addEventListener('input', () => { npGrow(); if (listMode) listOut(); npCandsSoon(); });
    nta.addEventListener('keydown', (e) => {
      if (e.isComposing || e.keyCode === 229 || imeGuard) return;   // 変換中・変換を確定した直後の ↵ は何もしない
      const mod = IS_MAC ? e.metaKey : e.ctrlKey;
      if (listMode) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); listMove(e.key === 'ArrowDown' ? 1 : -1); return; }
        if (e.key === 'Enter') { e.preventDefault(); listPick(listIx, mod ? 'tab' : e.shiftKey ? 'page' : 'peek'); return; }
        if (e.key === 'Escape') { e.preventDefault(); listOut(); return; }
        if (e.key.length === 1 || e.key === 'Backspace') listOut();
      }
      if (e.key === 'Enter') {
        if (mod) { e.preventDefault(); npSend(); }
        return;   // ↵ と ⇧↵ は改行（送らない）
      }
      if (e.key === 'ArrowDown' && !candsEl.hidden && nta.selectionStart === nta.value.length && nta.selectionEnd === nta.value.length) { e.preventDefault(); listIn(); return; }
      if (e.key === 'ArrowUp' && !nta.value) { const h = hist(); if (h[0]) { e.preventDefault(); nta.value = h[0]; npGrow(); nta.setSelectionRange(nta.value.length, nta.value.length); } return; }
      if (e.key === 'Backspace' && !nta.value && scopeGid) { e.preventDefault(); scopeGid = ''; npScope(); npCandsSoon(); return; }
      if (e.key === 'Escape') { e.preventDefault(); npEsc(); }
    });
    sendBtn.addEventListener('click', () => { if (npBusy) npStop(); else npSend(); });
    sendBtn.addEventListener('mousedown', (e) => e.preventDefault());

    /* ---- 候補（Notion のページ） ---- */
    let candT = 0, candSeq = 0, cands = [];
    function npCandsSoon() { clearTimeout(candT); candT = setTimeout(npCands, 150); }
    function npCandsHide() { candsEl.hidden = true; candsEl.textContent = ''; cands = []; listOut(); }
    const REG = () => { const m = new Map(); for (const [k, v] of Object.entries(NBS.reg || {})) m.set(k, v); return m; };
    function regScan() {
      const side = obSide(); if (!side) return;
      NBS.reg = NBS.reg || {};
      let ch = false;
      for (const t of side.querySelectorAll(SEL_TEAM + '[data-c33-team]')) {
        const team = t.getAttribute('data-c16-k') || '', gid = t.getAttribute('data-c16-g') || '';
        for (const r of t.querySelectorAll('[data-c33-kind="db"], [data-c33-kind="page"]')) {
          const id = id32(idOf(r)); if (!id) continue;
          const o = NBS.reg[id] || {};
          const name = nameOf(r);
          if (o.name !== name || o.team !== team || o.gid !== gid || o.kind !== r.getAttribute('data-c33-kind')) { NBS.reg[id] = { name, team, gid, kind: r.getAttribute('data-c33-kind') }; ch = true; }
        }
      }
      if (ch) nbSave();
    }
    async function npSearch(q, limit) {
      const sp = await npSpace();
      if (!sp) return { list: [], rm: {} };
      const headers = { 'Content-Type': 'application/json' }; const u = activeUser(); if (u) headers['x-notion-active-user-header'] = u;
      const body = { type: 'BlocksInSpace', query: q, spaceId: sp, limit: limit || 20, source: 'quick_find_input_change', sort: { field: 'relevance' },
        filters: { isDeletedOnly: false, excludeTemplates: true, navigableBlockContentOnly: true, requireEditPermissions: false, includePublicPagesWithoutExplicitAccess: false, ancestors: [], createdBy: [], editedBy: [], lastEditedTime: {}, createdTime: {}, inTeams: [] } };
      const r = await fetch(location.origin + '/api/v3/search', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(body) });
      if (!r.ok) return { list: [], rm: {} };
      const j = await r.json();
      return { list: j.results || [], rm: j.recordMap || {} };
    }
    let npSpaceId = '';
    async function npSpace() {
      if (npSpaceId) return npSpaceId;
      const ids = Object.keys(NBS.reg || {}).slice(0, 1).map(dashId);
      const m = /([0-9a-f]{32})/i.exec(location.pathname); if (m) ids.push(dashId(m[1]));
      if (ids.length) { try { const recs = await getRecords('block', ids); for (const b of recs.values()) if (b.space_id) return (npSpaceId = b.space_id); } catch (e) { /* noop */ } }
      try { const r = await fetch(location.origin + '/api/v3/getSpaces', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' }); const j = r.ok ? await r.json() : {}; for (const v of Object.values(j || {})) { const sp = v && v.space && Object.keys(v.space)[0]; if (sp) return (npSpaceId = sp); } } catch (e) { /* noop */ }
      return '';
    }
    const recVal = (n) => n && (n.value && n.value.value ? n.value.value : n.value);
    /* 親のフル DB を探す（ページの親 → … 最大 5 段）。見つけた対応は覚えておく */
    async function parentDbOf(pageId, seed) {
      const key = id32(pageId);
      NBS.par = NBS.par || {};
      const c = NBS.par[key];
      if (c && Date.now() - c.at < 7 * 864e5) return c;
      let id = dashId(pageId), out = { at: Date.now(), plain: true };
      for (let i = 0; i < 6; i++) {
        let b = seed && seed[id] ? seed[id] : null;
        if (!b) { const m = await getRecords('block', [id]); b = m.get(id); }
        if (!b) { out = { at: Date.now(), err: i === 0 ? 'none' : '' , plain: i !== 0 }; break; }
        if (i === 0 && b.alive === false) { out = { at: Date.now(), err: 'trash' }; break; }
        if (b.type === 'collection_view_page') { out = i === 0 ? { at: Date.now(), self: true, db: id32(id) } : { at: Date.now(), db: id32(id), deep: true }; break; }
        if (b.parent_table === 'collection') {
          const cm = await getRecords('collection', [b.parent_id]); const col = cm.get(b.parent_id);
          const dbb = col && col.parent_table === 'block' ? id32(col.parent_id) : '';
          out = { at: Date.now(), db: dbb, coll: id32(b.parent_id), name: col && col.name ? plainName(col.name) : '' };
          if (i > 0) out.deep = true;
          break;
        }
        if (b.parent_table !== 'block') break;
        id = b.parent_id;
      }
      if (!out.err) { NBS.par[key] = out; nbSave(); }
      return out;
    }
    const plainName = (v) => (Array.isArray(v) ? v.map((s) => (Array.isArray(s) ? s[0] : '')).join('') : String(v || ''));
    async function npCands() {
      const q = nta.value.trim();
      const my = ++candSeq;
      if (!npOpen || !q || q.length > 60 || q.includes('\n')) { npCandsHide(); return; }
      regScan();
      let res;
      try { res = await npSearch(q, 20); } catch (e) { res = { list: [], rm: {} }; }
      if (my !== candSeq || !npOpen) return;
      const blocks = (res.rm && res.rm.block) || {};
      const seed = {}; for (const [k, v] of Object.entries(blocks)) { const x = recVal(v); if (x) seed[k] = x; }
      const reg = NBS.reg || {};
      const items = [];
      for (const it of res.list) {
        const b = seed[it.id]; if (!b) continue;
        const title = plainName(b.properties && b.properties.title) || '無題';
        let par = null;
        try { par = await parentDbOf(it.id, seed); } catch (e) { par = { plain: true }; }
        if (my !== candSeq) return;
        const dbId = par && (par.self ? id32(it.id) : par.db);
        const rg = dbId ? reg[dbId] : null;
        items.push({ id: id32(it.id), title, icon: b.format && b.format.page_icon, par, rg, dbName: rg ? rg.name : par && par.name ? par.name : '' });
      }
      const sel = scopeGid;
      let list = sel ? items.filter((x) => x.rg && x.rg.gid === sel) : items;
      list = list.sort((a, b) => ((b.rg && b.rg.gid === OB.sel) ? 1 : 0) - ((a.rg && a.rg.gid === OB.sel) ? 1 : 0)).slice(0, 6);
      cands = list;
      candsEl.textContent = '';
      list.forEach((x, i) => {
        const r = mk('div', 'n2-cand', null, candsEl); r.setAttribute('role', 'option'); r.id = 'c33-np-c' + i; r.__x = x;
        const ic = mk('span', 'n2-ci', null, r);
        if (x.icon && /^(\/|https?:|attachment:)/.test(x.icon)) { const im = mk('img', null, null, ic); im.alt = ''; im.src = /^attachment:/.test(x.icon) ? '/image/' + encodeURIComponent(x.icon) + '?table=block&id=' + dashId(x.id) + '&cache=v2' : x.icon; }
        else if (x.icon) ic.textContent = x.icon; else ic.innerHTML = svg('page', 15);
        mk('span', 'n2-ct', x.title, r);
        const meta = mk('span', 'n2-cm', null, r);
        if (x.rg && x.rg.gid) { const g = obGroups().find((y) => y.gid === x.rg.gid); if (g) { const gl = mk('i', 'n2-glyph', null, meta); obIcPaint(gl, g); gl.style.color = 'oklch(58% .13 ' + nbHueOf(g.gid) + ')'; } }
        meta.append(x.par && x.par.self ? (x.rg ? x.rg.team + ' · DB' : 'DB') : x.dbName ? (x.rg ? x.rg.team + ' / ' : '') + x.dbName : 'ページ');
        r.addEventListener('mousedown', (e) => e.preventDefault());
        r.addEventListener('click', (e) => listPick(i, (IS_MAC ? e.metaKey : e.ctrlKey) ? 'tab' : e.shiftKey ? 'page' : 'peek'));
        r.addEventListener('mousemove', () => { if (listMode && listIx !== i) { listIx = i; listPaint(); } });
      });
      const full = mk('div', 'n2-cand n2-full', null, candsEl); full.setAttribute('role', 'option'); full.id = 'c33-np-c' + list.length;
      mk('span', 'n2-ci', null, full).innerHTML = svgI('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>').replace('width="18" height="18"', 'width="15" height="15"');
      mk('span', 'n2-ct', 'Notion で全文検索', full); mk('span', 'n2-cm', '「' + q.slice(0, 24) + '」', full);
      full.addEventListener('mousedown', (e) => e.preventDefault());
      full.addEventListener('click', () => npNative(q));
      candsEl.hidden = false;
      if (listMode) listPaint();
    }
    function listIn() { if (candsEl.hidden || !candsEl.children.length) return; listMode = true; listIx = 0; listPaint(); npHint(); }
    function listOut() { if (!listMode) return; listMode = false; listIx = -1; listPaint(); npHint(); }
    function listMove(d) { const n = candsEl.children.length; if (!n) return; const k = listIx + d; if (k < 0) { listOut(); return; } listIx = Math.min(n - 1, k); listPaint(); }
    function listPaint() {
      [...candsEl.children].forEach((r, i) => r.classList.toggle('act', listMode && i === listIx));
      if (listMode && candsEl.children[listIx]) { nta.setAttribute('aria-activedescendant', candsEl.children[listIx].id); candsEl.children[listIx].scrollIntoView({ block: 'nearest' }); }
      else nta.removeAttribute('aria-activedescendant');
    }
    function listPick(i, mode) {
      const el = candsEl.children[i]; if (!el) return;
      if (el.classList.contains('n2-full')) { npNative(nta.value.trim()); return; }
      npGo(el.__x.id, mode, el);
    }
    /* Notion 純正の検索へ（全文検索）— 入れた文字を渡す */
    let npBypass = false;
    async function npNative(q) {
      await npClose('nav');
      npBypass = true;
      try { await openNative(q); } finally { setTimeout(() => { npBypass = false; }, 400); }
    }

    /* ---- ページを開く: 親のフル DB へ移って、サイドピークで（Orbit と Stella も一緒に） ---- */
    const curPath = () => { const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname); return m ? m[1].toLowerCase() : ''; };
    async function npGo(pageId, mode, rowEl) {
      let par;
      try { par = await parentDbOf(pageId); } catch (e) { par = { plain: true }; }
      if (par.err) { if (rowEl) { const m = rowEl.querySelector('.n2-cm'); if (m) { m.textContent = '開けませんでした'; m.classList.add('ng'); } } return; }
      const reg = NBS.reg || {};
      const dbId = par.self ? id32(pageId) : par.db || '';
      const rg = dbId ? reg[dbId] : null;
      let url;
      if (mode === 'page' || (!dbId)) url = '/' + id32(pageId);
      else {
        const v = (NBS.view || {})[dbId];
        url = '/' + dbId + (v ? '?v=' + v : '') + (par.self ? '' : (v ? '&' : '?') + 'p=' + id32(pageId) + '&pm=s');
      }
      if (mode === 'tab') { window.open(location.origin + url, '_blank', 'noopener'); return; }   // パネル・Orbit・Stella はそのまま
      const st = np.dataset.stage;
      npClose('nav');
      if (st === '2' && !par.self && dbId && mode !== 'page') npAwaitPeek();
      if (rg && rg.gid && OB.on && mode !== 'page') {
        if (rg.gid !== OB.sel) { const i = obItemEls.findIndex((el) => el.__gid === rg.gid); if (i >= 0) obJump(i); obSelect(rg.gid); }
        nbOpenTeam(dbId);
      } else if (!dbId || !rg) obToast('このページは Stella の星座に入っていません');
      npSpa(url, par.self || !dbId || mode === 'page' ? 'page' : 'peek', id32(pageId), dbId);
      const ttl = rowEl && rowEl.__x ? rowEl.__x.title : '';
      if (dbId && ttl && !par.self) { NBS.pg = NBS.pg || {}; NBS.pg[dbId] = ttl; nbSave(); }
      if (ttl) say((rg ? rg.name + ' の中で' : '') + '「' + ttl + '」を開きました');
    }
    /* 画面の中で移る（再読み込みしない）。移れなかった時だけ読み込み直す */
    function npSpa(url, kind, pageId, dbId) {
      const u = new URL(url, location.origin);
      const sameDb = dbId && curPath() === dbId;
      try {
        history.pushState(history.state, '', u.pathname + u.search);
        window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
      } catch (e) { location.assign(u.href); return; }
      const t0 = Date.now();
      const ok = () => kind === 'peek' ? !!document.querySelector('.notion-peek-renderer') && curPath() === dbId : curPath() === (kind === 'page' ? pageId : dbId);
      const tick = () => {
        if (ok()) { if (kind === 'peek') { npFlashRow(pageId); npPeekFocus(); } return; }
        if (Date.now() - t0 > (sameDb ? 1800 : 2600)) { if (location.pathname + location.search === u.pathname + u.search) location.assign(u.href); return; }
        setTimeout(tick, 120);
      };
      setTimeout(tick, 150);
    }
    /* ページ移動で閉じた時は、フォーカスをサイドピークの中のページへ */
    function npPeekFocus() {
      setTimeout(() => {
        const pk = document.querySelector('.notion-peek-renderer');
        const t = pk && (pk.querySelector('[contenteditable="true"][placeholder], h1[contenteditable="true"], [data-content-editable-root]') || pk);
        if (!t) return;
        if (!t.hasAttribute('tabindex') && !t.isContentEditable) t.setAttribute('tabindex', '-1');
        try { t.focus({ preventScroll: true }); } catch (e) { /* noop */ }
      }, 250);
    }
    /* 一覧の中のその行を、見える所まで動かして、ふわっと光らせる（今のビューで見えていない時は何もしない） */
    function npFlashRow(pageId) {
      const f = [...document.querySelectorAll('.notion-frame')].find((x) => !x.closest('.notion-peek-renderer'));
      const row = f && f.querySelector('.notion-collection-item[data-block-id="' + dashId(pageId) + '"], [data-block-id="' + dashId(pageId) + '"].notion-page-block');
      if (!row) return;
      try { row.scrollIntoView({ block: 'nearest', behavior: nbReduce() ? 'auto' : 'smooth' }); } catch (e) { /* noop */ }
      if (nbReduce()) return;
      row.classList.remove('c33-np-flash'); void row.offsetWidth; row.classList.add('c33-np-flash');
      setTimeout(() => row.classList.remove('c33-np-flash'), 900);
    }
    /* ピン留めのパネルとサイドピークは重ねない — ピルへ縮め、サイドピークが閉じたら戻す */
    function npAwaitPeek() {
      clearInterval(npPeekWait);
      let seen = false;
      npPeekWait = setInterval(() => {
        const pk = !!document.querySelector('.notion-peek-renderer');
        if (pk) seen = true;
        else if (seen) { clearInterval(npPeekWait); npPeekWait = null; if (!npOpen) { NPS.stage = 2; npOpenNow(); } }
      }, 400);
      setTimeout(() => { if (npPeekWait && !seen) { clearInterval(npPeekWait); npPeekWait = null; } }, 8000);
    }
    /* 移った先の DB のチームスペースが畳まれていたら開く（Stella の経路点灯のため） */
    function nbOpenTeam(dbId) {
      setTimeout(() => {
        const side = obSide(); if (!side) return;
        const a = side.querySelector('a[href*="' + dbId + '"]');
        if (a) return;
        const rg = (NBS.reg || {})[dbId]; if (!rg) return;
        const t = [...side.querySelectorAll(SEL_TEAM + '[data-c33-team]')].find((x) => x.getAttribute('data-c16-k') === rg.team);
        const b = t && t.querySelector(':scope > ' + SEL_TEAM_BTN);
        if (b && b.getAttribute('aria-expanded') === 'false') obPress(b);
      }, 220);
    }
    /* いま見ている DB のビューを覚える（次に開く時はそのビューで） */
    let npLastHref = '';
    setInterval(() => {
      if (location.href === npLastHref) return;
      npLastHref = location.href;
      const pid = curPath(), v = new URLSearchParams(location.search).get('v');
      if (pid && v && (NBS.reg || {})[pid]) { NBS.view = NBS.view || {}; if (NBS.view[pid] !== id32(v)) { NBS.view[pid] = id32(v); nbSave(); } }
    }, 700);

    /* ---- 送る・答え ---- */
    function npSend() {
      if (npBusy) return;
      const q = nta.value.trim();
      if (!q) { if (!nbReduce()) sendBtn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 280 }); return; }
      nta.value = ''; npGrow(); npCandsHide();
      npAsk(q);
    }
    function npStop() { if (!npBusy) return; npSeq++; npBusy = false; npBusyPaint(); const t = logEl.querySelector('.n2-think'); if (t) { t.classList.add('stop'); t.querySelector('.n2-th-t').textContent = '止めました'; } BURI.setProgress(null); }
    function npBusyPaint() { sendBtn.classList.toggle('stop', npBusy); sendBtn.innerHTML = npBusy ? '<i class="n2-sq"></i>' : svg('send', 16); sendBtn.setAttribute('aria-label', npBusy ? '止める' : '送信 ' + KEYSEND); sendBtn.title = npBusy ? '止める' : '送信 ' + KEYSEND; }
    async function npAsk(q) {
      histAdd(q);
      if (!npChat) { npChat = true; hiEl.classList.add('bye'); np.classList.add('chat'); chipsEl.textContent = ''; }
      const my = ++npSeq;
      npBusy = true; npBusyPaint();
      mk('div', 'n2-q', q, logEl);
      const th = npThink();
      logEl.appendChild(th.el);
      scrollEl.scrollTop = scrollEl.scrollHeight;
      BURI.setProgress((e) => { if (my === npSeq) th.on(e); });
      let ask = q;
      if (scopeGid && BURI.aiOn()) { const g = obGroups().find((x) => x.gid === scopeGid); if (g) ask = q + '\n（探す範囲のヒント: ' + g.label + ' の中）'; }
      let res;
      try { res = await BURI.ask(ask); } catch (e) { res = { text: "('-' 鰤)з💦 ごめんね、調べている途中でつまずいちゃった。（" + String(e && e.message || e) + '）', cards: [], chips: [] }; }
      if (my !== npSeq) return;
      BURI.setProgress(null);
      await th.done();
      if (my !== npSeq) return;
      th.el.remove();
      npBusy = false; npBusyPaint();
      try { logAdd(q, res); } catch (e) { /* noop */ }
      npEntry(res, q, true);
      if (!npOpen) { pill.classList.remove('ping'); void pill.offsetWidth; pill.classList.add('ping'); }
    }
    /* MoA の相談: 小さな顔のまわりを、相談している AI の数だけ衛星が回る → まとめる時に中心へ集まって溶ける */
    function npThink() {
      const n = Math.max(1, Math.min(9, BURI.moaOn() ? BURI.team().length : 1));
      const el = mk('div', 'n2-think');
      const orb = mk('div', 'n2-orb', null, el);
      mk('span', 'n2-orbf', null, orb).innerHTML = FACE_SVG;
      for (let i = 0; i < n; i++) { const s = mk('i', 'n2-sat', null, orb); s.style.setProperty('--a', (360 / n * i) + 'deg'); s.style.setProperty('--d', (2.2 + (i % 3) * 0.5) + 's'); s.style.setProperty('--r', (22 + (i % 2) * 6) + 'px'); }
      const t = mk('div', 'n2-th-t', '調べています…', el);
      return {
        el,
        on(e) {
          if (e.k === 'plan') t.textContent = '会話を読んでいます…';
          else if (e.k === 'search') t.textContent = 'Notion・本棚・Web を調べています…';
          else if (e.k === 'found') t.textContent = '見つけたものを読んでいます…';
          else if (e.k === 'draft') t.textContent = n > 1 ? 'みんなで相談しています…' : '考えています…';
          else if (e.k === 'merge') { el.classList.add('merge'); t.textContent = 'ひとつにまとめています…'; }
        },
        done() { if (nbReduce()) return Promise.resolve(); el.classList.add('merge'); return new Promise((r) => setTimeout(r, 380)); }
      };
    }
    const sameOriginPage = (u) => { try { const x = new URL(u, location.origin); if (x.origin !== location.origin) return ''; const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(x.pathname); return m ? m[1].toLowerCase() : ''; } catch (e) { return ''; } };
    function npEntry(res, q, animate) {
      const msg = mk('div', 'n2-a', null, logEl);
      const body = mk('div', 'n2-body', null, msg);
      const cited = [];
      richText(body, faceNorm(res.text || ''), res.refs, cited);
      if (!animate || nbReduce()) [...body.children].forEach((el) => { el.style.animation = 'none'; });
      /* 参考にした情報（折りたたみ） */
      const refs = cited.length ? cited.map((c) => c.ref) : (res.cards || []).filter((c) => c.url).slice(0, 8);
      if (refs.length) {
        const det = mk('details', 'n2-refs', null, msg);
        mk('summary', null, '参考にした情報 ' + refs.length, det);
        refs.forEach((r, i) => {
          const a = mk('a', 'n2-ref', null, det); a.href = r.url || '#'; a.rel = 'noopener noreferrer';
          mk('b', null, String(i + 1), a);
          const pid = r.url ? sameOriginPage(r.url) : '';
          if (pid) { const ic = mk('span', 'n2-ri', null, a); ic.dataset.pid = pid; }
          mk('span', null, String(r.title || '').replace(/（Wikipedia）$/, ''), a); mk('small', null, r.url ? srcHost(r.url) : '本棚', a);
          if (r.url && !r.url.startsWith(location.origin)) a.target = '_blank';
        });
        /* Notion のページには、そのページのアイコンをそのまま */
        const want = [...det.querySelectorAll('.n2-ri[data-pid]')];
        if (want.length) getRecords('block', want.map((x) => dashId(x.dataset.pid))).then((m) => {
          for (const x of want) { const bl = m.get(dashId(x.dataset.pid)); const ic = bl && bl.format && bl.format.page_icon; if (!ic) continue; if (/^(\/|https?:|attachment:)/.test(ic)) { const im = mk('img', null, null, x); im.alt = ''; im.src = /^attachment:/.test(ic) ? '/image/' + encodeURIComponent(ic) + '?table=block&id=' + dashId(x.dataset.pid) + '&cache=v2' : ic; } else x.textContent = ic; }
        }).catch(() => {});
      }
      const bar = mk('div', 'n2-bar', null, msg);
      ib(bar, 'copy', 'コピー', (b) => { try { navigator.clipboard.writeText(res.text || ''); b.innerHTML = svg('check'); setTimeout(() => { b.innerHTML = svg('copy'); }, 1400); } catch (x) { /* noop */ } });
      ib(bar, 'retry', 'もう一度', () => { npAsk(q); });
      const nx = (res.chips || []).filter((c) => c && c.q).slice(0, 3);
      if (nx.length) {
        const w = mk('div', 'n2-next', null, msg);
        nx.forEach((c) => { const b = mk('button', 'n2-chip', c.label, w); b.type = 'button'; b.addEventListener('click', () => { nta.value = c.q; npGrow(); nta.focus(); }); });
      }
      requestAnimationFrame(() => { scrollEl.scrollTop += msg.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top - 60; });
      return msg;
    }
    /* 答えの中の Notion のページは、ページ移動（親の DB ＋ サイドピーク）で開く */
    np.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || !np.contains(a) || a.closest('.n2-cand')) return;
      const pid = sameOriginPage(a.getAttribute('href'));
      if (!pid) return;
      e.preventDefault();
      npGo(pid, (IS_MAC ? e.metaKey : e.ctrlKey) ? 'tab' : e.shiftKey ? 'page' : 'peek', null);
    }, true);

    /* ---- 引き出し（履歴と検索） ---- */
    let drawerOn = false, dT = 0, dSeq = 0;
    function drawerShow(on, focusSearch) {
      drawerOn = !!on;
      drawer.hidden = !on;
      np.classList.toggle('drawer', drawerOn);
      if (on) { drawDrawer(); if (focusSearch) setTimeout(() => dIn.focus(), 30); }
    }
    function bucket(at) {
      const d0 = new Date(); d0.setHours(0, 0, 0, 0);
      const t = d0.getTime();
      return at >= t ? '今日' : at >= t - 864e5 ? '昨日' : at >= t - 7 * 864e5 ? '過去7日間' : 'それ以前';
    }
    async function drawDrawer() {
      const k = dIn.value.trim();
      const my = ++dSeq;
      dList.textContent = '';
      const all = logGet().filter((x) => !k || (x.q + ' ' + x.text).toLowerCase().includes(k.toLowerCase()));
      if (k) mk('div', 'n2-dh', '会話', dList);
      let last = '';
      all.slice(0, 40).forEach((x) => {
        const b = bucket(x.at);
        if (!k && b !== last) { last = b; mk('div', 'n2-dh', b, dList); }
        const r = mk('button', 'n2-di', null, dList); r.type = 'button';
        mk('b', null, x.q, r); mk('small', null, faceNorm(String(x.text)).replace(/\[[NW]\d[^\]]*\]/g, '').replace(/\s+/g, ' ').slice(0, 60), r);
        r.addEventListener('click', () => { drawerShow(false); if (!npChat) { npChat = true; np.classList.add('chat'); hiEl.classList.add('bye'); chipsEl.textContent = ''; } logEl.textContent = ''; mk('div', 'n2-q', x.q, logEl); npEntry(x, x.q, false); nta.focus(); });
      });
      if (!all.length) mk('div', 'n2-de', k ? '会話は見つかりませんでした' : 'まだ会話はありません', dList);
      if (!k) return;
      const ph = mk('div', 'n2-dh', 'ページ', dList);
      const wait = mk('div', 'n2-de', '探しています…', dList);
      let res;
      try { res = await npSearch(k, 12); } catch (e) { res = { list: [], rm: {} }; }
      if (my !== dSeq) return;
      wait.remove();
      const blocks = (res.rm && res.rm.block) || {};
      const seed = {}; for (const [kk, v] of Object.entries(blocks)) { const xv = recVal(v); if (xv) seed[kk] = xv; }
      let n = 0;
      for (const it of res.list) {
        const b = seed[it.id]; if (!b) continue;
        let par = null; try { par = await parentDbOf(it.id, seed); } catch (e) { par = { plain: true }; }
        if (my !== dSeq) return;
        const rg = par && (par.self ? (NBS.reg || {})[id32(it.id)] : par.db ? (NBS.reg || {})[par.db] : null);
        const r = mk('button', 'n2-di', null, dList); r.type = 'button';
        mk('b', null, plainName(b.properties && b.properties.title) || '無題', r);
        mk('small', null, par && par.self ? 'DB' : rg ? rg.team + ' / ' + rg.name : par && par.name ? par.name : 'ページ', r);
        r.addEventListener('click', (e) => { npGo(id32(it.id), (IS_MAC ? e.metaKey : e.ctrlKey) ? 'tab' : e.shiftKey ? 'page' : 'peek', null); });
        if (++n >= 8) break;
      }
      if (!n) { ph.after(mk('div', 'n2-de', 'ページは見つかりませんでした')); }
    }
    dIn.addEventListener('input', () => { clearTimeout(dT); dT = setTimeout(drawDrawer, 180); });
    dIn.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); drawerShow(false); nta.focus(); } });
    np.addEventListener('pointerdown', (e) => { if (drawerOn && !drawer.contains(e.target) && !e.target.closest('.n2-rail')) drawerShow(false); }, true);

    /* ---- 設定（AI・本棚・覚えたこと） ---- */
    function npSettings() {
      drawerShow(false);
      if (!npChat) { npChat = true; np.classList.add('chat'); hiEl.classList.add('bye'); chipsEl.textContent = ''; }
      logEl.textContent = '';
      const box = mk('div', 'n2-set', null, logEl);
      aiSettings(box, (t) => { const m = mk('div', 'n2-a', null, logEl); mk('div', 'n2-body', faceNorm(t), m); }, () => { box.remove(); npHome(true); });
      const more = mk('div', 'bs-card', null, box);
      mk('h4', null, '本棚と覚えたこと', more);
      const row = mk('div', 'bs-btns', null, more);
      const imp = mk('button', null, '本棚を取り込む（CSV / JSON）', row); imp.type = 'button';
      imp.addEventListener('click', (e) => { e.preventDefault(); file.click(); });
      const hk = mk('label', null, null, more); const hc = mk('input', null, null, hk); hc.type = 'checkbox'; hc.checked = NPS.hotkey !== false; hk.append(' ' + NMOD + 'K で このパネルを開く（切ると Notion の検索のまま）');
      hc.addEventListener('change', () => { NPS.hotkey = hc.checked; npSave(); });
      const notes = (BURI.mem && BURI.mem.get && BURI.mem.get().notes) || [];
      if (notes.length) {
        mk('div', 'bs-lb', '覚えたこと（' + notes.length + '）', more);
        notes.slice(0, 20).forEach((n, i) => { const r = mk('div', 'bs-nt', null, more); r.append((typeof n === 'string' ? n : n.t || '') + ' '); const x = mk('button', 'bs-x', '×', r); x.type = 'button'; x.title = '忘れる'; x.addEventListener('click', (e) => { e.preventDefault(); try { BURI.mem.del(i); } catch (er) { /* noop */ } r.remove(); }); });
      }
      /* v97: ほかの柱（⁴¹ Telescopium）の設定の段。空の箱を置いて知らせ、誰も描かなければ片付ける */
      const ext = mk('div', 'bs-card n2-ext', null, box); ext.id = 'c33-np-set-ext';
      try { document.dispatchEvent(new CustomEvent('nebius:settings', { detail: ext.id })); } catch (e) { /* noop */ }
      if (!ext.childNodes.length) ext.remove();
      scrollEl.scrollTop = 0;
    }

    /* ---- 操作 ---- */
    np.querySelector('.n2-rail').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-a]'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'new') { drawerShow(false); BURI.aiReset(); npHome(true); nta.value = ''; npGrow(); nta.focus(); }
      else if (a === 'find') drawerShow(!drawerOn || document.activeElement !== dIn, true);
      else if (a === 'hist') { dIn.value = ''; drawerShow(!drawerOn); }
      else if (a === 'set') npSettings();
    });
    np.querySelector('.n2-top').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-a]'); if (!b) return;
      const a = b.dataset.a, st = +np.dataset.stage || 1;
      if (a === 'close') npClose();
      else if (a === 'pin') npStage(st === 2 ? 1 : 2);
      else if (a === 'max') npStage(st === 3 ? npStageBefore3 : 3);
    });
    /* esc は 1 段ずつ: 引き出し → 候補 → 大きく → 閉じる */
    function npEsc() {
      if (drawerOn) { drawerShow(false); nta.focus(); return; }
      if (listMode) { listOut(); return; }
      if (!candsEl.hidden) { npCandsHide(); return; }
      if (np.dataset.stage === '3') { npStage(npStageBefore3); return; }
      npClose();
    }
    np.addEventListener('keydown', (e) => { if (e.key === 'Escape' && e.target !== nta && e.target !== dIn) { e.preventDefault(); npEsc(); } });
    veil.addEventListener('pointerdown', (e) => { e.preventDefault(); npClose(); });
    window.addEventListener('resize', () => { if (npOpen) npPlace(); pillFit(); });
    /* ⌘K（Windows は Ctrl+K）— 本文で文字を選んでいる時は Notion のリンク（⌘K）のまま */
    window.addEventListener('keydown', (e) => {
      if (npBypass || NPS.hotkey === false) return;
      if (!(IS_MAC ? e.metaKey : e.ctrlKey) || e.altKey || e.shiftKey || e.code !== 'KeyK') return;
      const ae = document.activeElement, sel = document.getSelection();
      if (ae && ae.closest && ae.closest('[contenteditable="true"]') && sel && !sel.isCollapsed && !np.contains(ae)) return;
      if (ae && ae.closest && ae.closest('[role="dialog"]:not(#c33-np)') && !np.contains(ae)) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      npToggle();
    }, true);
    /* ⌃⌥B（前からの呼び方）もこのパネル */
    document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === 'KeyB') { e.preventDefault(); e.stopPropagation(); npOpenNow(); } }, true);
    npHint(); pillFit(); npBusyPaint();
    np.dataset.stage = String(NPS.stage === 2 ? 2 : 1);
    const npStyle = mk('style'); npStyle.id = 'c33-np-css';
    npStyle.textContent = `
@property --n2r { syntax: '<length>'; inherits: false; initial-value: 22px; }
#c33-pill, #c33-np { --neb-h: var(--neb-ht); transition: --neb-h 1.2s cubic-bezier(.4,0,.2,1);
  --acc: oklch(58% .13 var(--neb-h)); --acc-ink: oklch(45% .13 var(--neb-h)); --acc-soft: oklch(64% .12 var(--neb-h) / .13); }
:is(body.dark, html[data-atx-dark], html[data-c39-dark]) :is(#c33-pill, #c33-np) { --acc: oklch(74% .12 var(--neb-h)); --acc-ink: oklch(85% .1 var(--neb-h)); --acc-soft: oklch(70% .12 var(--neb-h) / .17); }
#c33-search-header .cs-close { margin-inline-start: auto; }
/* ピル — 顔は SVG */
#c33-pill { position: relative; flex: none; display: inline-flex; align-items: center; height: 30px; padding: 0 11px; margin: 0; border: 0; border-radius: 999px; cursor: pointer; color: var(--c-texPri, #37352f);
  background: color-mix(in oklch, var(--acc) 9%, var(--c-bacPri, #fff)); box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--acc) 17%, transparent);
  transition: --neb-h 1.2s cubic-bezier(.4,0,.2,1), box-shadow .2s ease, transform .25s cubic-bezier(.3,1.5,.5,1); }
#c33-pill:hover, #c33-pill[aria-expanded="true"] { box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--acc) 30%, transparent), 0 6px 16px -9px var(--acc); }
#c33-pill:active { transform: scale(.95); }
#c33-pill:focus-visible { outline: 2px solid color-mix(in oklch, var(--acc) 50%, transparent); outline-offset: 2px; }
#c33-pill .pl-f { display: inline-flex; height: 15px; }
#c33-pill .pl-f svg { height: 15px; width: auto; display: block; fill: currentColor; }
#c33-pill .pl-x { display: inline-flex; align-items: center; gap: 6px; max-width: 0; margin-inline-start: 0; overflow: hidden; opacity: 0; white-space: nowrap; font: 500 11.5px/1 var(--c33-ui); color: var(--c-texSec, #787774);
  transition: max-width .2s cubic-bezier(.2,.8,.2,1), opacity .16s ease, margin .2s ease; }
#c33-pill:is(:hover, :focus-visible) .pl-x { max-width: 128px; opacity: 1; margin-inline-start: 8px; }
#c33-pill.narrow .pl-t { display: none; }
#c33-pill.tiny .pl-x { display: none; }
#c33-pill kbd, #c33-np kbd { display: inline-block; font: 600 10px/1 var(--c33-ui); padding: 3px 5px; border-radius: 5px; color: inherit; background: color-mix(in oklch, var(--c-texPri, #37352f) 5%, transparent); box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--c-texPri, #37352f) 9%, transparent), inset 0 -1px 0 color-mix(in oklch, var(--c-texPri, #37352f) 12%, transparent); }
#c33-pill .pl-dot { position: absolute; right: 6px; bottom: 5px; width: 3px; height: 3px; border-radius: 50%; background: var(--acc); animation: plBreath 3.4s ease-in-out infinite; }
#c33-pill.ping .pl-dot { animation: plPing 1.2s ease-out 1, plBreath 3.4s ease-in-out 1.2s infinite; }
@keyframes plBreath { 50% { opacity: .2; } }
@keyframes plPing { 0% { transform: scale(2.2); box-shadow: 0 0 0 0 var(--acc); } 100% { transform: scale(1); box-shadow: 0 0 0 10px transparent; } }
/* パネル */
#c33-np { --bg: #f9f8f6; --fg: var(--c-texPri, #37352f); --sub: rgba(55,53,47,.64); --ter: rgba(55,53,47,.44); --line: rgba(55,53,47,.08); --hov: rgba(55,53,47,.05); --field: rgba(255,255,255,.62);
  position: fixed; z-index: 2147482000; display: flex; overflow: hidden; border-radius: 14px; background: var(--bg); color: var(--fg);
  box-shadow: 0 26px 64px rgba(15,15,15,.08), 0 4px 16px rgba(15,15,15,.05); font: 14px/1.6 var(--c33-ui); font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; transform-origin: 0 0; }
:is(body.dark, html[data-atx-dark], html[data-c39-dark]) #c33-np { --bg: #262523; --fg: rgba(255,255,255,.9); --sub: rgba(255,255,255,.62); --ter: rgba(255,255,255,.42); --line: rgba(255,255,255,.08); --hov: rgba(255,255,255,.055); --field: rgba(255,255,255,.035);
  box-shadow: 0 26px 64px rgba(0,0,0,.4), 0 4px 16px rgba(0,0,0,.25); }
#c33-np[hidden], #c33-np-veil[hidden], #c33-np [hidden] { display: none !important; }
#c33-np *, #c33-np *::before, #c33-np *::after { box-sizing: border-box; }
#c33-np-veil { position: fixed; inset: 0; z-index: 2147481999; background: transparent; -webkit-backdrop-filter: blur(1.5px); backdrop-filter: blur(1.5px); }
#c33-np button { font: inherit; color: inherit; }
#c33-np .n2-rail { width: 44px; flex: none; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 0; }
#c33-np .n2-rail button, #c33-np .n2-top button { width: 30px; height: 30px; padding: 0; border: 0; border-radius: 8px; background: none; color: var(--ter); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s, color .15s; }
#c33-np .n2-rail button:hover, #c33-np .n2-top button:hover { background: var(--hov); color: var(--fg); }
#c33-np .n2-top button.on { color: var(--acc-ink); background: var(--acc-soft); }
#c33-np .n2-sp { flex: 1; }
#c33-np .n2-main { flex: 1; min-width: 0; display: flex; flex-direction: column; position: relative; max-height: inherit; }
#c33-np .n2-top { position: absolute; top: 8px; right: 8px; display: flex; gap: 2px; z-index: 2; }
#c33-np .n2-top button { width: 28px; height: 28px; }
#c33-np .n2-scroll { flex: 0 0 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 30px; scrollbar-width: thin; }
#c33-np.chat .n2-scroll { flex: 1 1 auto; }
#c33-np[data-stage="1"].chat { height: 80vh; }
#c33-np .n2-hero { padding: 72px 0 22px; text-align: center; transition: opacity .25s ease, padding .3s ease; }
#c33-np .n2-hi { font: 600 24px/1.35 var(--c33-ui); letter-spacing: .01em; animation: n2Up .45s cubic-bezier(.2,.8,.2,1) backwards; }
#c33-np.chat .n2-hero { display: none; }
#c33-np .n2-log { display: flex; flex-direction: column; padding: 46px 0 6px; }
#c33-np:not(.chat) .n2-log { display: none; }
#c33-np .n2-compose { flex: none; padding: 0 30px 18px; }
#c33-np:not(.chat) .n2-compose { padding-bottom: 30px; }
#c33-np .n2-box { display: flex; align-items: flex-end; gap: 8px; padding: 9px 9px 9px 14px; border-radius: 14px; background: var(--field); box-shadow: inset 0 0 0 1px var(--line); transition: box-shadow .2s ease; flex-wrap: wrap; }
#c33-np .n2-box:focus-within { box-shadow: inset 0 0 0 1px var(--line), inset 0 -1.5px 0 var(--acc); }
#c33-np textarea { flex: 1 1 200px; min-width: 0; min-height: calc(1.55em + 10px); resize: none; border: 0; outline: 0; margin: 0; padding: 5px 0; background: transparent; font: inherit; font-size: 14.5px; line-height: 1.55; color: inherit; overflow-y: hidden; }
#c33-np textarea::placeholder { color: var(--ter); }
#c33-np .n2-send { flex: none; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; background: color-mix(in oklch, var(--fg) 16%, transparent); transition: background .2s ease, transform .15s ease; }
#c33-np .n2-send.on, #c33-np .n2-send.stop { background: var(--acc); }
#c33-np .n2-send:active { transform: scale(.92); }
#c33-np .n2-sq { width: 10px; height: 10px; border-radius: 2px; background: currentColor; }
#c33-np .n2-scope { flex: none; align-self: center; display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px 0 7px; border-radius: 999px; font-size: 11.5px; white-space: nowrap; color: var(--acc-ink); background: var(--acc-soft); }
#c33-np .n2-glyph { width: 12px; height: 12px; flex: none; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; line-height: 1; font-style: normal; }
#c33-np .n2-hint { margin-top: 7px; padding-inline-start: 4px; font-size: 11px; color: var(--ter); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#c33-np .n2-hint kbd { margin-inline-end: 2px; }
#c33-np .n2-chips, #c33-np .n2-next { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; justify-content: center; }
#c33-np .n2-next { justify-content: flex-start; margin-top: 8px; }
#c33-np .n2-chip { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 6px 12px; border: 0; border-radius: 999px; background: var(--hov); color: var(--sub); font-size: 12.5px; line-height: 1.3; cursor: pointer;
  transition: background .15s, color .15s; animation: n2Up .35s ease backwards; animation-delay: calc(var(--i, 0) * 50ms + 100ms); }
#c33-np .n2-chip:hover { background: var(--acc-soft); color: var(--acc-ink); }
#c33-np .n2-cands { margin-top: 6px; padding: 4px; border-radius: 12px; background: var(--bg); box-shadow: 0 8px 26px rgba(15,15,15,.07), inset 0 0 0 1px var(--line); max-height: 306px; overflow-y: auto; animation: n2Up .16s ease; }
#c33-np .n2-cand { display: flex; align-items: center; gap: 9px; min-height: 36px; padding: 4px 10px; border-radius: 8px; cursor: pointer; }
#c33-np .n2-cand:hover, #c33-np .n2-cand.act { background: var(--acc-soft); }
#c33-np .n2-ci { width: 20px; height: 20px; flex: none; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; color: var(--ter); }
#c33-np .n2-ci img { width: 18px; height: 18px; object-fit: cover; border-radius: 3px; display: block; }
#c33-np .n2-ct { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
#c33-np .n2-cm { flex: 0 1 auto; max-width: 52%; display: inline-flex; align-items: center; gap: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11.5px; color: var(--ter); }
#c33-np .n2-cm.ng { color: #c4554d; }
#c33-np .n2-full .n2-ct { color: var(--sub); }
#c33-np .n2-q { align-self: flex-end; max-width: 80%; margin: 16px 0 12px auto; padding: 8px 13px; border-radius: 14px 14px 4px 14px; background: var(--acc-soft); white-space: pre-wrap; overflow-wrap: anywhere; animation: n2Up .25s ease; }
#c33-np .n2-a { margin: 2px 0 18px; }
#c33-np .n2-body { font-size: 14.5px; line-height: 1.8; overflow-wrap: anywhere; }
#c33-np .n2-body p { margin: 0 0 .75em; animation: n2Up .45s ease backwards; }
#c33-np .n2-body :is(ul, ol) { margin: 0 0 .75em; padding-inline-start: 1.3em; animation: n2Up .45s ease backwards; }
#c33-np .n2-body li { margin: .18em 0; }
#c33-np .n2-body h5 { margin: 1.1em 0 .4em; font-size: 14.5px; font-weight: 650; animation: n2Up .45s ease backwards; }
#c33-np .n2-body a { color: var(--acc-ink); }
#c33-np .np-fn { font-size: .68em; line-height: 0; vertical-align: super; margin-inline-start: 1px; }
#c33-np .np-fnum { display: inline-block; min-width: 1.4em; margin: 0 1px; padding: 0 3px; border-radius: 4px; text-align: center; color: var(--acc-ink); background: var(--acc-soft); text-decoration: none; font-weight: 600; }
#c33-np .b-face { font-family: "SF Mono", Menlo, Consolas, monospace !important; font-size: .92em; letter-spacing: 0; white-space: nowrap; }
#c33-np .n2-refs { margin-top: 4px; font-size: 12px; color: var(--ter); }
#c33-np .n2-refs summary { cursor: pointer; width: fit-content; padding: 2px 6px; margin-inline-start: -6px; border-radius: 6px; list-style: none; }
#c33-np .n2-refs summary::before { content: "▸ "; } #c33-np .n2-refs[open] summary::before { content: "▾ "; }
#c33-np .n2-refs summary:hover { background: var(--hov); color: var(--sub); }
#c33-np .n2-ref { display: flex; align-items: baseline; gap: 8px; padding: 3px 4px; border-radius: 6px; color: var(--sub); text-decoration: none; }
#c33-np .n2-ref:hover { background: var(--hov); }
#c33-np .n2-ref b { flex: none; min-width: 1.3em; text-align: center; color: var(--acc-ink); }
#c33-np .n2-ri { flex: none; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1; }
#c33-np .n2-ri:empty { display: none; }
#c33-np .n2-ri img { width: 15px; height: 15px; object-fit: cover; border-radius: 3px; }
#c33-np .n2-ref span:not(.n2-ri) { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-np .n2-ref small { flex: none; font-size: 10.5px; }
#c33-np .n2-bar { display: flex; gap: 2px; margin-top: 4px; }
#c33-np .np-ib { width: 28px; height: 28px; padding: 0; border: 0; border-radius: 7px; background: none; color: var(--ter); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
#c33-np .np-ib:hover { background: var(--hov); color: var(--fg); }
/* MoA の衛星 */
#c33-np .n2-think { display: flex; align-items: center; gap: 12px; margin: 6px 0 14px; animation: n2Up .25s ease; }
#c33-np .n2-orb { position: relative; width: 64px; height: 64px; flex: none; }
#c33-np .n2-orbf { position: absolute; left: 50%; top: 50%; width: 30px; transform: translate(-50%, -50%); display: flex; color: var(--fg); }
#c33-np .n2-orbf svg { width: 30px; height: auto; display: block; fill: currentColor; }
#c33-np .n2-sat { position: absolute; left: 50%; top: 50%; width: 5px; height: 5px; margin: -2.5px 0 0 -2.5px; border-radius: 50%; background: var(--acc); box-shadow: 0 0 6px var(--acc);
  --n2r: var(--r, 22px); transform: rotate(var(--a)) translateX(var(--n2r)); animation: n2Orbit var(--d, 2.4s) linear infinite; transition: --n2r .38s cubic-bezier(.5,0,.75,0), opacity .38s ease; }
@keyframes n2Orbit { from { transform: rotate(var(--a)) translateX(var(--n2r)); } to { transform: rotate(calc(var(--a) + 360deg)) translateX(var(--n2r)); } }
#c33-np .n2-think.merge .n2-sat { --n2r: 0px; opacity: 0; }
#c33-np .n2-think.stop .n2-sat { animation-play-state: paused; opacity: .3; }
#c33-np .n2-th-t { font-size: 13px; color: var(--sub); }
/* 引き出し */
#c33-np .n2-drawer { position: absolute; left: 44px; top: 0; bottom: 0; width: 260px; z-index: 3; display: flex; flex-direction: column; background: var(--bg); box-shadow: 10px 0 26px rgba(15,15,15,.06); animation: n2Drawer .2s cubic-bezier(.2,.8,.2,1); }
#c33-np .n2-drawer[hidden] { display: none; }
@keyframes n2Drawer { from { transform: translateX(-14px); opacity: 0; } }
#c33-np .n2-dsearch { padding: 12px 10px 6px; }
#c33-np .n2-dsearch input { width: 100%; height: 34px; padding: 0 11px; border: 0; border-radius: 9px; outline: 0; background: var(--hov); font: inherit; font-size: 13px; color: inherit; }
#c33-np .n2-dsearch input:focus { box-shadow: inset 0 -1.5px 0 var(--acc); }
#c33-np .n2-dlist { flex: 1; overflow-y: auto; padding: 2px 8px 14px; }
#c33-np .n2-dh { padding: 10px 8px 4px; font-size: 11px; font-weight: 600; letter-spacing: .04em; color: var(--ter); }
#c33-np .n2-di { display: block; width: 100%; padding: 6px 8px; border: 0; border-radius: 8px; background: none; text-align: left; cursor: pointer; }
#c33-np .n2-di:hover { background: var(--hov); }
#c33-np .n2-di b { display: block; font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-np .n2-di small { display: block; font-size: 11px; color: var(--ter); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-np .n2-de { padding: 8px; font-size: 12px; color: var(--ter); }
#c33-np .n2-set { padding-top: 4px; }
#c33-np .n2-set .bs-card { background: transparent !important; border: 0 !important; box-shadow: none !important; padding: 6px 0 !important; }
.np-sr { position: fixed; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; left: -9px; top: 0; }
.c33-np-flash { animation: n2Flash .6s ease-out; }
@keyframes n2Flash { 0% { box-shadow: inset 0 0 0 999px oklch(64% .13 var(--neb-ht, 190) / .2); } 100% { box-shadow: inset 0 0 0 999px transparent; } }
@keyframes n2Up { from { opacity: 0; transform: translateY(5px); } }
@media (prefers-reduced-motion: reduce) { #c33-np *, #c33-pill, #c33-pill * { animation: none !important; transition: none !important; } }`;
    document.head.appendChild(npStyle);
    function npImport(f) {
      npOpenNow();
      if (!f) return;
      f.text().then((text) => {
        const r = BURI.importText(text, f.name);
        updState();
        if (!npChat) { npChat = true; np.classList.add('chat'); }
        const m = mk('div', 'n2-a', null, logEl); mk('div', 'n2-body', r.message, m);
      }).catch((e) => { obToast('ファイルを読めませんでした。' + String(e && e.message || e)); });
    }

    /* v97: Nebius の連絡口（⁴¹ Telescopium など、ほかの柱から JSON の CustomEvent で） */
    document.addEventListener('nebius:req', async (ev) => {
      let m = null; try { m = JSON.parse(ev.detail); } catch (e) { return; }
      if (!m || !m.id) return;
      const reply = (o) => document.dispatchEvent(new CustomEvent('nebius:res', { detail: JSON.stringify(Object.assign({ id: m.id }, o)) }));
      try {
        if (m.k === 'status') reply({ aiOn: BURI.aiOn(), team: BURI.aiOn() ? (BURI.moaOn() ? BURI.team().length : 1) : 0, hue: nbHueCur, nick: nick() });
        else if (m.k === 'quick') reply(await BURI.quick(String(m.sys || ''), String(m.user || ''), m.max || 900, !!m.raw));
        else if (m.k === 'multi') reply({ list: await BURI.multi(String(m.sys || ''), String(m.user || ''), m.max || 1200, m.n || 3) });
        else if (m.k === 'open') { npGo(String(m.pid || ''), m.mode || 'peek', null); reply({ ok: true }); }
        else reply({ err: 'unknown' });
      } catch (e) { reply({ err: String(e && e.message || e) }); }
    });
    document.documentElement.setAttribute('data-nebius', VERSION);

    BURI.restore();
    updState();

    for (const name of ['off', 'on', 'toggle']) {
      const original = window.__c33[name];
      if (typeof original !== 'function') continue;
      window.__c33[name] = (...args) => { const v = original(...args); layout(); return v; };
    }
    window.__c33.buri = {
      ask(q) { send(q); return BURI.state(); },
      answer: (q) => BURI.ask(q),
      importText: (text, name) => { const r = BURI.importText(text, name); updState(); return r; },
      save: () => { const r = BURI.save(); updState(); return r; },
      forget: () => { const r = BURI.forget(); updState(); return r; },
      clear: () => { const r = BURI.clear(); updState(); return r; },
      state: () => BURI.state(),
      open() { npOpenNow(); return true; },
      close() { npClose(); return true; },
      panel: () => ({ open: npOpen, stage: np.dataset.stage, chat: npChat })
    };
    layout();
  }

  /* v48: 窓口（v38 で消えていて B.U.R.I の起動が途中で止まっていた） */
  window.__c33 = { version: VERSION, on: () => obApply(true), off: () => obApply(false), toggle: () => obToggle(), select: (g) => obSelect(g), status: () => Object.assign({}, ST, { orbit: Object.assign({}, OB) }) };
  obBoot();
  obSearchBoot();
})();