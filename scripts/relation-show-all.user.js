// ==UserScript==
// @name         « No »　¹⁴ _ Relation Show All
// @namespace    https://cordivestium.local/
// @version      1.48.0
// @description  v1.48.0: シリーズ見出しの下線・区切り線が、項目の少ないセル（1列・1件など）で見出しの文字の幅までしか引かれていなかったのを、セルの端まで引くように。v1.47.0: グループ（シリーズ）見出しの題名とアイコンを個別に変えられるように — 見出しをクリックすると編集パネル（²⁹ Icon Library・絵文字・SVG／画像・アイコンなし・元に戻す）。シリーズの無い本の「単行」にも既定のアイコン（本）を付け、題名・アイコンを変えられる。本を右クリックすると好きなグループへ移せる（自分で作ったグループも可・Notion のデータは書き換えない）。設定は ²³ Page Relation Show All と共通（同じ見出しは DB とページで同じ見た目）。v0.47.0: アイコンの取り違えを修正 — 1冊だけアイコンを変えると同じセルの全部がそのアイコンになっていた。原因は ①雛形（先頭チップ）の画像を他の項目の予備に使っていた ②自己修復が「読み込み中の画像」を同じセルで先に描けた別の項目の画像で上書きしていた ③題名で対応が取れない実物チップ（並び順の当て推量）の画像も使っていた。v0.47.0 は、その項目自身のデータ（page_icon）→ 題名が一致する実物チップ、だけを使い、どちらも無ければ枠だけ残して空にする。attachment: 形式（アップロード画像）のアイコンは Notion の画像経由の URL に変換、notion:// 形式は絵文字扱いしない。v0.46.0: 「並べ直さない（ネイティブのまま）」と決まったセルが、カーソルを当てるたびに消えて出る不具合を修正 — ①不発の判定をセルの中身（行id＋関係の題名＋チップ有無）ごとに覚え、処理済みの印を消して判定し直すのをやめる ②Notion がセルを描き直した瞬間（描画前）に、覚えている「不発」を同期で付ける＝一度も透明にならない ③「関係が無い／表示できる関係が無い」も不発として扱う ④判定の記憶は localStorage に保存（再読み込み後も最初から出る）。v0.45.0: 描き直しを見せない — 表のリレーションセルは再構築が終わるまで透明にし（最長1.2秒で必ず見える）、終わったら短くフェードで出す（HOLD_UNTIL_READY）。スクロールで出てきた行も待ち時間を 300→120ms に短縮。リレーションセルを「作品の並び」として再描画する v0.34.0。発動ゲートは v0.30.0 と同一（チップ付き＝無条件 / チップ無し＝最長題名12字以上）。v0.34.0 は「旧版が残した注入DOMの掃除」を追加：起動時に data-cordi13-done / data-cordi13-cols の付いたセルから cordi13-* の要素を撤去し、隠していた元チップ（data-cordi13-native）を表示へ戻してから、新しいゲートで判定し直します。これで「もうゲートを通らないはずのセルに、古い再構築結果が残る」現象が消えます。__c13.reset() で手動実行もできます。
// @match        https://app.notion.com/*
// @match        https://www.notion.so/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*
 * v1.48.0（2026-10-03）
 *  - 見出しの下線・区切り線を必ずセルの端まで: 項目が少なくグリッドにならないセル（例: 1件だけのシリーズ）では、
 *    並べ直した入れ物（wrap）とその外側の包みが中身の幅に縮み、線が見出しの文字の所で止まっていた。
 *    → wrap と、セルの中で wrap を包む要素を全幅に。見出し・余白・区切り線はグリッドでも折返しでも全幅（1 / -1）。
 *
 * v1.47.0（2026-10-03）
 *  - グループ見出しの編集: 見出し（シリーズ名・単行）をクリック → 題名とアイコンの編集パネル。
 *    アイコンは ²⁹ Icon Library（色も選べる）・絵文字・SVG／画像 URL・アイコンなし。「元に戻す」で Notion のものへ。
 *    （旧版は見出しのクリックでリレーションの編集ポップアップが開いていた。編集ポップアップは余白・＋ボタンから）
 *  - 「単行」: 既定で本のアイコンを付ける。題名・アイコンは上と同じ編集パネルで変えられる。
 *  - 本を右クリック → 「◯◯を移す」: 一覧にあるグループ・自分で作ったグループ・単行へ移す／元に戻す／新しいグループ。
 *    Notion のデータ（Series）は書き換えない（このブラウザの表示だけ）。
 *  - 保存は localStorage「cordi.groups.v1」。²³ Page Relation Show All v2.8.0 と共通（どちらで変えても両方に出る）。
 *  - 項目の書体は ²⁶ Atelier の「リレーション › 書体」（--atelier-rel-font）が指定されていればそれを使う。
 *  - __cordiGroups.dump() で中身を確認。
 *
 * v0.38.0（2026-09-23）
 *  - 修正: 1行パイプの外側にネイティブのチップが1個だけ残って見えていた
 *    （貼っていただいたDOMの pipe の後ろの1個がこれ）。
 *    原因は、スイープが「処理済み(data-cordi13-done)」のセルを素通りしていたこと。
 *    React は関係セルを後から描き直すことがあり、そのとき自分の再構築の後ろに
 *    新しいネイティブチップが足される。v0.37 までは実体(.cordi13-item)がある限り
 *    何もしなかったので、その1個だけが隠されずに残っていた。
 *    → スイープのたびに enforceNatives(): 自分の要素(cordi13-*)以外の子は必ず隠す。
 *  - 修正: パイプの見切れ対策。1行(nowrap)は守ったまま、
 *    (a) セクション内で全項目に共通する接頭辞（例「マスカレード・」）を落として表示する。
 *        見出しが同じ語を出しているので、値は「違い」だけ見えればよい。
 *        落とした分は title 属性に残す（マウスを乗せると全部出る）。
 *        → PIPE_STRIP_PREFIX: false で従来どおり全部表示。
 *    (b) それでも入りきらない（scrollWidth > clientWidth）セルだけ、その行を折返しに
 *        落として見切れを無くす（1行に収まるセルは今までどおり1行）。
 *        → PIPE_FIT: false で常に1行（見切れ許容）。
 *        → v0.39.0: 入りきらないセルは題名を潰さず折返す（既定）。1件だけで枠より長い項目のみ … 省略。
 *  - 追加: __c13.inspect() — 最初のパイプセルの実寸（パイプ幅・高さ・見切れの有無・
 *    折返しへ落ちたか・子要素の一覧）を出す。見た目がおかしいときはこれ1発で分かる。
 *
 * v0.37.0（2026-09-23）
 *  - 修正: 1行パイプ表示で「セクション見出し（単行 など）」が消えていた。
 *    見出しを消すと『本来は単行って出るのにそれすら出ない』になる。
 *    → パイプでもセクション見出しを必ず出し、セクションごとに1行のパイプを作る。
 *      見出しを出したくないときは __c13.tune({ PIPE_SHOW_HEADERS: false })。
 *  - 修正: パイプの項目が細くなるとはみ出して「アイコンの下に文字が落ちる（上下2段）」状態に
 *    なっていた。→ 項目を inline-flex + nowrap にして、アイコンと文字を必ず同じ行に置く。
 *      収まらない分は右端で切れる（重ならない）。
 *
 * v0.36.0（2026-09-23）
 *  - 1行パイプ表示が、列が狭いページ（Name/Tactus 等）で潰れて重なっていたのを修正。
 *    (a) パイプは PIPE_MIN_ITEMS(3) 以上 PIPE_MAX_ITEMS(6) 以下のときだけ。
 *        7件以上は v0.30.0 と同じグリッド／折返しへ戻す（1行に30件は物理的に入らない）。
 *    (b) 行の作りを固くした: 行は overflow:hidden、各項目は overflow:hidden と min-width:0、
 *        アイコンは flex:0 0 auto、区切り線は align-self:center。
 *    → 端はきれいに切れる（はみ出して重ならない）。
 *  - 潰れを一時的に止めたいとき: __c13.tune({ PIPE_ONELINE: false }) / 件数上限を変える:
 *    __c13.tune({ PIPE_MAX_ITEMS: 10 })
 */


/*
 * ============================================================
 *  v0.35.0（2026-09-23）
 * ============================================================
 *  追加1: 1行パイプ表示 — 3件以上のセルは「〇〇〇〇｜〇〇〇〇｜〇〇〇〇」の
 *         1行表示にした（シリーズ見出し・グリッドは使わず、値だけを並べる）。
 *         PIPE_ONELINE / PIPE_MIN_ITEMS / PIPE_SEPARATOR('rule'=細い縦線 | 'text'=｜) / PIPE_GAP_PX。
 *  追加2: 発動判定に文字数（全角換算）を追加 — GATE_MODE 'either' を既定にし、
 *         「チップ付き」または「最長題名 >= 12字（v0.30.0 と同一の判定）」
 *         または「件数 >= 3」または「全角換算 >= 12」で発動。
 *         v0.30.0 の判定を包含するので退行しない（'legacy' に戻せば v0.30.0 と同一）。
 *  追加3: __c13.tune({...}) で再インストール無しにしきい値を変えて再判定できる。
 * ============================================================
 */


/*
 * 実測済み（Probe v0.3.0・2026-09-23 のダンプ + v0.1.0〜v0.6.0 運用の貼付DOM）:
 * - 経路B採用: POST /api/v3/syncRecordValues が HTTP 200。返り値は
 *   recordMap.block[id].value.value の二重入れ子。collection も同形で取れる。
 * - 関係は properties[<key>] = [["‣",[["p",<pageId>,<spaceId>]]], [","], …]（‣ は U+2023）。
 * - Medias DB（行の親コレクション）の schema は "Tactus"(relation) の1個だけ。
 *   一方、関係先ページ（本）の properties キーは a@pu, e[Ka, title の3個
 *   → 「シリーズ」プロパティは本側DBにある。これが実測。
 * - +N の数字は当てにならない（実測: 16件表示+チップでAPIは28件・うち12件が無題ゴースト）
 *   → 必ずAPIから全件取る。ゴースト（無題ページ）は HIDE_UNTITLED で表示しない。
 * - セルには xjp7ctv 包みの有る無い2形がある → wrap は flex-wrap で探すので両対応。
 * - 関係先ページ（本）の properties キーは実測 a@pu / e[Ka / title の3個
 *   （2026-09-23・Probe v0.3.0）。つまり本側DBに「シリーズ」という名前のプロパティが
 *   無い（または名前が違う）可能性が高い。
 * - Probe v0.6.0 で本側DB（booksDB 3e16c0ae-968e-807c-ab22-000bed94d7de）の schema を実測:
 *   "No."(number) / "Series"(relation, key "Hzj\") / "Grouping"(relation, a@pu・
 *   「青春」などグループ見出し) / "Creators"(relation, e[Ka・作者) / "Seq."(number) /
 *   "Works"(title)。→ シリーズは「Series」。日本語名「シリーズ」では一致しなかった。
 *
 * v0.29.0 -> v0.30.0 の変更（実機ログ 2026-09-23 06:48 の解析にもとづく）:
 *  - 実測（決定的な収穫）:
 *      [click] 第一経路の検証中: pushState(?p=<ID>&pm=s) → 「ピークにこのページが表示された（リロードなし）」
 *      [click] ネイティブチップ 10 件（wrap直下 11 要素）: "探偵ガリレオ" "予知夢" …
 *      [click] 対応できず（この項目はピークに開けない）: "永遠の記憶" / "卒業" / "眠りの森" …
 *      → 関係28件に対し、DOM上の元チップは **10件だけ**（Notionは10件＋「+N」しか描かない）。
 *        11件目以降は元チップが存在しないため、合成クリックでは原理的に開けない。
 *      → 一方 **pushState 経路はリロードなしでサイドピークが開く**ことが実測で確認できた。
 *  (1) 元チップの合成クリックは、Notion 側のリレーション編集ポップアップを誘発する
 *      （＝「クリックするとポップアップが出る」の残り火）。
 *  (2) 11件目以降は元チップが無いので、合成クリック経路では絶対に開けない。
 *  - -> v0.30.0:
 *      ・項目クリックの第一経路を **pushState(?p=<ID>&pm=s)** に変更（ポップアップなし・リロードなし）。
 *        開かなかったときだけ元チップの合成クリックへ進み、それも駄目ならフル遷移（位置は復元）。
 *      ・項目クリック後に編集ポップアップが残っていたら Esc で閉じる後始末を追加
 *        （＝ポップアップは「余白クリック／＋ボタン」のときだけ開く）。
 *
 * v0.28.0 -> v0.29.0 の変更（実機ログ 2026-09-23 06:43 の解析にもとづく・3つの確定バグを修正）:
 *  - 実測ログ:
 *      [click] 候補 1/1 を踏む: DIV
 *      [edit] 余白クリックで開く（セル本体を踏む）      ← ★合成クリックが自分に跳ね返っていた
 *      [edit] リレーション編集ポップアップを開いた      ← ★これが「ポップアップが出る」正体
 *      [click] 変化は検出できなかったが、ピークの器が存在する → 遷移しない（成功として終了） ← ★嘘の成功判定
 *      [click] 元チップ対応: 10/22 件（ネイティブ10件 / 全項目23件）
 *  (1) 元チップを踏む合成クリックは bubbles:true なので、自分が wrap に付けた
 *      「余白クリック＝編集ポップアップ」処理にも届いていた。→ ピークが開いても
 *      その上に編集ポップアップが被さり、「クリックするとポップアップが出る」状態だった。
 *  (2) peekRenderers() が「非表示の残骸の器」も数えていたため、クリック前から 器=1件。
 *      そのせいで「器が1つでもあれば成功」という最終ガードが常に成立し、実際には
 *      何も起きていないのに成功と記録して、フォールバックも抑止していた。
 *  (3) 元チップが10件しか無い一方で関係は23件 → 13件は pushState 経路。その成否判定も
 *      同じ理由で嘘になっていた。
 *  - -> v0.29.0:
 *      ・合成クリック中は SYNTH フラグで自分の余白クリック処理を止める。
 *      ・余白クリック処理は「自分の要素」か「本当の余白」だけに反応（項目・元チップ・アイコンは除外）。
 *      ・peekRenderers() を「見えている器」だけに限定し、成功判定を内容ベース（IDの出現）に変更。
 *      ・保険の pushState は、本当にピークが出たかを確認し、出なければピークURLへフル遷移。
 *      ・収集を広げ（.notion-record-icon または span.notranslate を持つ直下要素）、
 *        収集した題名と「対応できなかった題名」をログに出す（次版の判断材料）。
 *
 * v0.27.0 -> v0.28.0 の変更（実機ログ 2026-09-23 の解析にもとづく）:
 *  - 実測: `[click] 元チップ対応: 10/22`。題名でしか引いていなかったため、
 *    半分の項目が「元チップ無し」扱いになり、anchor/pushState 経路に落ちていた。
 *    そのうえ、生成した項目を踏むと **セルに伝播してリレーション編集ポップアップ**
 *    （22 selected / Link or create a page…）が開いてしまっていた。← これが「ポップアップが出る」の正体。
 *  - -> v0.28.0:
 *      ・ネイティブチップの収集を「.notion-record-icon を持つ直下要素」に広げ、
 *        題名一致 → 正規化一致 → **並び順一致** の順で対応付ける（＝全件を引けるようにする）。
 *      ・項目のクリックは必ず stopPropagation（セルへ伝播させない＝ポップアップを開かない）。
 *      ・セル右上にホバーで出る「＋」ボタンを追加し、それを押すとリレーション編集
 *        ポップアップを開けるようにした（項目以外の余白クリックでも開く）。
 *
 * v0.26.0 -> v0.27.0 の変更（★v0.26.0 の重大な不具合を修正。表示が全部デフォルトに戻っていた原因）:
 *  - v0.26.0 は収集処理の中で `visible` を参照していたが、`visible` は同じ関数の
 *    ずっと後（items を作った後）で宣言される `let visible` だった。
 *    → 一時的死領域（TDZ）で ReferenceError になり、rebuildWrap が
 *      【最初の await よりも前】で例外終了していた。DOM を1つも触らないまま落ちるので、
 *      グルーピング・全表示・カラム表示がすべて消えて「デフォルト表示」になっていた。
 *      （コンソールには `失敗: Cannot access 'visible' before initialization` が出ていたはず）
 *  - -> v0.27.0:
 *      ・並び順フォールバックを「実際に必要になった時に作る」遅延初期化に変更（TDZ を解消）。
 *      ・並び順で引けたときはログに出す（誤対応に気づけるように）。
 *      ・CLICK_NATIVE_INDEX_FALLBACK を TUNING に追加（件数が一致するときだけ使う）。
 *
 * v0.25.0 -> v0.26.0 の変更（★実測ログで確定した2つの欠陥を修正）:
 *  - 実測（v0.25.0 の稼働ログ・2026-09-23）:
 *      [click] 元チップ対応: 0/16 件 … 6/6 … 10/16 … 10/22
 *      [click] native: この項目は画面に出ていなかった分（元チップ無し）→ anchor 方式へ
 *      → anchor（本物の<a>）は target=_self の通常リンクなので **フルロード**になる。
 *        クリック後 32ms で beforeunload が記録されていた＝これが「プリロード」の正体。
 *  (1) 1回目の再構築で自分が非表示にした元チップ（display:none）は、
 *      `div[style*="display: inline"]` に一致しなくなる。そのため2回目以降の再構築では
 *      元チップを見失い「元チップ対応 0/16」になり、全部 anchor→フルロードに落ちていた。
 *  (2) 元チップが無い扱いになった項目は anchor 方式だったため、必ずフルロードしていた。
 *  - -> v0.26.0:
 *      ・非表示にした元チップに data-cordi13-native="1" を付け、収集時にそれを含める。
 *      ・対応表を wrap にキャッシュ（__cordi13natives）して再構築を跨いで維持。
 *      ・題名一致に加えて **正規化一致** と **並び順の一致** でフォールバック。
 *      ・元チップが無い項目は anchor ではなく pushState(?p=<ID>&pm=s) 方式にする
 *        （anchor はフルロードになるため使わない）。
 *
 * v0.24.0 -> v0.25.0 の変更（「クリックしたら直接開く」＝ピッカーを踏まない・押し切る）:
 *  - 実測（プローブJSON・2026-09-23）で分かった2つのこと:
 *      (1) ネイティブのチップをクリックすると、アプリは **pushState で
 *          /p/<DBID>?v=<viewID>&p=<pageID>&pm=s にURLだけ変えてサイドピークを開く**
 *          （リロードなし・実測 rel 60505→60516）。これが「本来のチップの開き方」。
 *      (2) セルや親要素をクリックすると、画像の「22 selected / Link or create a page...」の
 *          **リレーション編集ポップアップ（ピッカー）** が開いてしまい、そこから項目を
 *          選ばないとページが開かない。v0.23〜v0.24 の候補総当たりは親要素まで踏んでいたため、
 *          このピッカーを踏む経路が残っていた。
 *  - -> v0.25.0:
 *      ・クリック候補を **元チップそのものだけ** に限定（CLICK_CANDIDATES_EXTRA: false）。
 *        親要素・セルは踏まない＝ピッカーを開かせない。
 *      ・万一ピッカーが開いてしまったら Esc を送って閉じる（PICKER_GUARD: true）。
 *      ・最終保険を差し替え: フル遷移の前に、実測で確定した形式（?p=<ID>&pm=s）で
 *        history.pushState + popstate を投げ、ピークの出現を待つ。それでも出ないときだけ遷移。
 *
 * v0.23.0 -> v0.24.0 の変更（★v0.23の判定漏れを修正: 開いていたピークを「変化なし」と誤判定していた）:
 *  - 実測（プローブ v0.9.1 の previousSession・2026-09-23・v0.23.0 稼働時）:
 *       rel 13612 合成クリック（元チップ）→ rel 13618 click-after defaultPrevented=true（= rj() で開く成功経路）
 *       rel 13894（+282ms）**dom-added に div.notion-peek-renderer が出現**（rect x=1133）
 *       rel 14094 armed fetch /api/v3/search（ピークのページデータ取得）
 *       → **ピークはリロードなしで開いていた**。ところが…
 *       rel 14840 候補#? を追加でクリック → rel 16098 アンカーの合成クリック → beforeunload（フルロード）
 *     原因: v0.23 の判定は「器の数が増えたか」だけだった。クリック前に**別ページのピークが
 *     既に開いていた**（?p=3e36c…&pm=s）ため、クリック後は器が入れ替わって数が 1 のまま
 *     ＝増加を検出できず、60ms間隔のポーリングでは一瞬の 2 も拾えず、フォールバックが誤爆した。
 *  - -> v0.24.0 は判定を4系統のORに拡張し、**「器が1つでもあれば絶対に遷移しない」**ガードを追加:
 *      (1) 新しい器ノード（クリック前の集合に無いノードが現れた）
 *      (2) 器の数が増えた
 *      (3) 器の中身（HTML長＋テキスト頭）のシグネチャが変わった（＝別ページに差し替わった）
 *      (4) 器の中にクリックしたページのIDが現れた（＝そのページが表示されている）
 *    さらに、フォールバック直前にもう一度「器があるか／IDが入っているか」を確認し、
 *    どちらかが真なら**遷移せずに成功として終了**する（開いているものを壊さない）。
 *  - 候補ノードごとの待ち時間も 1500ms に延ばした（アニメーション＋ページ取得を待つ）。
 *
 * v0.22.0 -> v0.23.0 の変更（★症状の真因: フォールバックが自分でピークを潰していた）:
 *  - 実測（プローブ v0.9.1 の previousSession・2026-09-23）で真因が確定:
 *       rel 24601 手動クリック（.cordi13-item）→ rel 24608 合成クリック（元チップ）
 *       → rel 24897（+289ms）dom-added に **div.notion-peek-renderer が出現**（＝ピークの器が出た）
 *       → rel 25314（+706ms）アンカーの合成クリック → rel 25319 beforeunload（＝フルロード）
 *     つまり **合成クリックは効いていて、ピークはその場で開いていた**。
 *      ところがフォールバックの判定が「URLが変わったか」だったため、ネイティブのピークは
 *      URLを変えない（?p= を付けない）ので「効かなかった」と誤判定し、706ms 後に
 *      フル遷移を起こして自分で開いたピークを潰していた。
 *     さらに実測で、元チップの本物のハンドラ（role=button の div）の onClick は
 *      「処理できたら preventDefault しない / できなければ preventDefault して rj()（退避）」だった
 *      → ナビゲーションは最初から起きない設計で、URLの変化で判定するのは根本的に誤りだった。
 *  - -> v0.23.0 は判定を **ピークの器の出現** に変更:
 *      peekCount() = div.notion-peek-renderer / [role="region"][aria-label="Side Peek"] の数
 *      クリック前の数を記録し、60ms 間隔でポーリング。増えたら成功（フルロードせず終了）。
 *      増えないときだけ、候補ノード（元チップ本体 → その中の role=button → 親）を順に試し、
 *      それでもダメなときだけ CLICK_FALLBACK の有無でフル遷移に落とす。
 *  - CLICK_FALLBACK: true（既定・必ず開くための保険）/ false にすれば無反応でも遷移しない。
 *  - 成功時はログに「[click] ピークを検出（フルロードなし）」を出す（従来は URL 判定で誤爆していた）。
 *
 * v0.21.0 -> v0.22.0 の変更（「プリロード後、先頭に戻ってしまう」対応）:
 *  - 実測（プローブ v0.8.0 のJSON・2026-09-23）: クリックで ?p=…&pm=s への**フルロード**が走り
 *    （navEntry.duration≈7826ms・referrer が ?p= 無しのDB URL）、新しいページは scrollY=0 から
 *    始まる。つまり「読み込みが走る」こと自体は Notion 側のピーク表示の入口として起きており、
 *    本体側で消せるものではない。だが「元の位置に戻る」ことは本体側で直せる。
 *  - -> v0.22.0 は、クリックの直前に「いま見ていた位置（スクロールしている要素と、その scrollTop /
 *    window.scrollY）」を sessionStorage に記憶し、遷移後のページでアプリが立ち上がり次第
 *    その位置へ戻す（RESTORE_VIEW・複数回リトライ）。
 *    これで「プリロードはするが、戻ってきたとき元の場所にいて、右にページが開いている」状態になる。
 *  - 併せて、クリック時の記録をコンソールに出す（[view] 行）ので、復元が効いたかが分かる。
 *  - リロードなしで開く経路（native / anchor / pushstate）の試行はそのまま残置する。
 *
 * v0.20.0 -> v0.21.0 の変更（「元のチップを踏んで、リロードなしで横から出す」本命対応）:
 *  - コンソールログの実測（v0.20.0・2026-09-23）で分かったこと:
 *      起動 v0.20.0 / クリック: auto・同じタブ は出ているが、[click] の行が1本も無い
 *      = 合成 <a> のクリックは一度も検証できていない（クリック自体が未実施か、
 *        クリックが .cordi13-item に届いていない）。
 *      加えて、この環境では他のスクリプト（C12-Unifier / Constellucentia 系 / Typography）が
 *      同居していることもログで確認できた。
 *  - そこで v0.21.0 は「Notion自身のクリック経路をそのまま踏む」方式を既定にした:
 *      再構築のとき、セルに入っていた**本物のリレーション（チップ）のノードを消さずに
 *      非表示（display:none）で残し**、こちらで描いた項目をクリックしたら、対応する
 *      本物のチップの click を合成して踏ませる。React の管理下にあるノードなので
 *      ネイティブと同じ経路＝リロードなしでピークが開く（URL組み立て・404の心配も無い）。
 *      APIから取った「画面に出ていなかった分」だけは元チップが無いので、
 *      v0.20.0 の anchor → フル遷移 の順にフォールバックする。
 *  - CLICK_MODE 既定を 'native' に変更（'auto' / 'anchor' / 'pushstate' / 'peek' /
 *    'peek_center' / 'page' も残置）。CLICK_NATIVE_REUSE: false で元チップを隠さない旧挙動。
 *  - さらに本体側も掃除の取りこぼしを防ぐ: data-cordi13-done が付いていても
 *    実体（.cordi13-item / .cordi13-sec-head）が消えていたら作り直す
 *    （Reactが中身だけ差し替えたときに空セルで固まるのを防ぐ）。
 *
 * v0.19.0 -> v0.20.0 の変更（「リロードせず、その場で横からスッとサイドピーク」対応）:
 *  - v0.19.0 は location.assign でURLを書き換えていたため、フルロードが走って
 *    SPAが最初から立ち上がり直し、スクロール位置が先頭に戻っていた
 *    （＝サイドピークの利点＝「その場で覗く」が消えていた）。
 *  - v0.20.0 は「アプリ内リンクとして踏ませる」方式を第一候補にした:
 *    Notion のアプリ内リンクはクライアントサイドルーティングなので、非表示の <a href=…>
 *    を作って click を dispatch すると、ルータが拾って**リロードなしで**ピークが開く
 *    （URL は同じ ?p=<ID>&pm=s 形式。ネイティブのリンクと同じ経路）。
 *    一定時間（CLICK_FALLBACK_MS）経ってもURLが変わらなければ、v0.19.0 と同じ
 *    フル遷移に自動で落とす（＝必ず開く）。
 *  - 方式は TUNING.CLICK_MODE で固定できる:
 *      'auto'（既定）/ 'anchor'（リロードなし狙い・フォールバック無し）
 *      'pushstate'（history.pushState + popstate・検証用）
 *      'peek' / 'peek_center'（v0.19.0 挙動・フル遷移でピーク）
 *      'page'（ピーク無しでページへ直接）
 *  - 修飾キー（Ctrl/Cmd/Shift/Alt）付きクリックは従来どおり別タブ。
 *
 * v0.18.0 -> v0.19.0 の変更（「別タブではなく同じタブで・サイドピークで開きたい」対応）:
 *  - Notion には URL パラメータで任意のページをピーク表示する仕組みがある（公開ドキュメントで確認）:
 *      <ページURL>?p=<32桁ID>          → センターピーク（既定）
 *      <ページURL>?p=<32桁ID>&pm=s     → サイドピーク
 *    → v0.19.0 では、いま開いているビューのURL（location）に ?p=<ID>&pm=s を足したURLへ
 *      同じタブで遷移する（location.assign）。別タブは開かない。
 *      これで「いまのDB画面を背後に残したまま、右側にページが出る」＝ネイティブの
 *      リレーションクリックと同じ見え方になる。
 *  - モードは TUNING で切替:
 *      CLICK_MODE: 'peek'（既定・サイドピーク）/ 'peek_center'（センターピーク）/ 'page'（ページへ直接）
 *      CLICK_NEW_TAB: false（既定）— true にすると従来どおり別タブで開く
 *  - 修飾キー（Ctrl / Cmd / Shift / 中クリック）のときは従来どおり別タブで開く
 *    （ブラウザの標準挙動を壊さない）。
 *  - 'page' モード時の遷移先は v0.18.0 の PAGE_URL_MODE（/p/<ID> 形式）をそのまま使う。
 *
 * v0.17.0 -> v0.18.0 の変更（「項目をクリックすると 404: This page couldn't be found」対応）:
 *  - 原因: クリック時の遷移先を location.origin + '/' + <32桁ID> で組み立てていた。
 *    app.notion.com では素の /<ID> 形式が解決されず Notion の
 *    「This page couldn't be found（You may not have access, or it might have been
 *    deleted or moved.）」に落ちる（実測: v0.16.0 までの全バージョンで同じ）。
 *    アプリ自身は /p/<32桁ID> 形式を使っている（Probe v0.7.0 の url:
 *    https://app.notion.com/p/3e26c0ae968e8019893fc4892c5ca34a?v=… が実測値）。
 *  - -> v0.18.0 では遷移先を TUNING.PAGE_URL_MODE で組み立てる:
 *      'auto'（既定）= app.notion.com では /p/<ID>、www.notion.so では /<ID>
 *      'p'           = 常に <origin>/p/<ID>
 *      'bare'        = 常に <origin>/<ID>（旧挙動）
 *      'www'         = 常に https://www.notion.so/<ID>（保険・別ホスト経由）
 *    'auto' で 404 が続く場合は 'www' に変えるだけで切り替えられる。
 *  - クリック時の遷移（別タブで開く）以外の挙動は一切変えていない。
 *
 * v0.16.0 -> v0.17.0 の変更（「見出しの下線の下の余白が効かない」対応）:
 *  - SEC_HEAD_BODY_GAP が実際には効いていなかった。実装が .cordi13-sec-head の
 *    margin-bottom だったが、このセル（[data-testid="property-value"] 内の wrap）では
 *    margin が打ち消される環境で、8px でも 18px でも実測ギャップは約 6.7px のままだった。
 *    （2026-09-23 のスクショ実測: 見出しの下線 y=93 -> 最初の項目のインク上端 y=109 = 16px。
 *      行ピッチ実測 57px ≒ 24 CSS px（項目 21px + ROW_GAP 3px）から倍率 2.375 で割ると 6.7 CSS px。
 *      18px なら 43px の空白ができるはずで、実際は 16px＝ほぼ項目自身の行内リーディングぶんしかない。）
 *  - -> v0.17.0 では margin をやめ、見出しの直後に高さを持つスペーサ要素
 *    （.cordi13-sec-gap = SEC_HEAD_BODY_GAP）を挿入する方式に変更した。
 *    要素の height / min-height は margin と違って必ず効くので、つまみが必ず見た目に出る。
 *  - .cordi13-sec-head の margin-bottom は廃止（margin: 0）。
 *
 * v0.15.0 → v0.16.0 の変更（「見出しの下線のすぐ下にも空白が欲しい」対応）:
 *  - セクション見出しの下線 → 項目 の間を TUNING.SEC_HEAD_BODY_GAP で調整できるようにした。
 *    これは見出し要素の margin-bottom（線の外側の下）として効くので、
 *      ★ ガリレオ
 *      ーーーー
 *
 *      ■ 探偵ガリレオ｜■ 予知夢
 *    の形になる。first-child 特例や sec-div の上下余白とは独立。
 *
 *  - 区切り線（.cordi13-sec-div）の上下の余白を TUNING で調整できるようにした。
 *      SEC_DIV_PAD_TOP    = 前セクション最終項目 → 線 の間（旧4px → 既定10px）
 *      SEC_DIV_PAD_BOTTOM = 線 → 次セクション見出し の間（新設・既定10px）
 *    どちらも padding で取る（v0.13.0 と同じ方針・全セクションで同じ数式）。
 *
 *  - セクション見出しにシリーズページのアイコンを表示（relation 型のとき・第3ホップで
 *    シリーズページを取得する際に format.page_icon も一緒に覚える。select/text 型は
 *    アイコン無しのままで縮退）。アイコンは Series ページに設定されたもの
 *    （画像URL or 絵文字）をそのまま使う。
 *  - アイコン ←→ 文字 の間隔を TUNING.SEC_HEAD_ICON_GAP で調整。
 *    サイズは SEC_HEAD_ICON_SIZE・OFF は SEC_HEAD_ICON: false。
 *  - 見出しを flex にした（アイコン+文字を横並びにするため）。「単行」セクションには
 *    アイコンを付けない。
 *
 *  - 見出しと区切り線の余白を margin（外側）から padding（要素そのもの）に一本化。
 *    margin は first-child 特例（.cordi13-sec-head:first-child { margin-top: 0 }）との
 *    組み合わせで「2つ目以降だけ効かない/効り方違う」を起こしうる。padding は
 *    要素そのものに効くので全見出しが同じ数式で伸びる。
 *    構造: 区切り線 → [sec-head padding-top = SEC_HEAD_GAP_TOP] → 見出し文字 →
 *    [padding-bottom = SEC_HEAD_PAD_BOTTOM] → 下線 → 項目。
 *    先頭セクションだけ first-child で padding-top: 0（セル上端を揃える特例・他に影響なし）。
 *  - SEC_HEAD_PAD_TOP は廃止（SEC_HEAD_GAP_TOP に統合）。SEC_DIV_PAD_TOP を新設
 *    （前セクション最終項目 → 区切り線 の間・旧 margin 4px 相当）。
 *  - 二重有効検知: 別バージョンの C13 スクリプトが同時に走ると見た目が競合する
 *    （旧版を無効化し忘れると、掃除のたびに CSS が上書き合戦になる）ので起動時に検知。
 *
 *  - 見出しの帯の高さを TUNING で変えられるようにした。v0.11.x の見出しは
 *    「文字（11px × 行高1.6 ≒ 18px）+ 下2px」だけで、外側の余白（margin）を
 *    いじっても帯そのものは伸びなかった。→ 帯の内側の余白（padding）を新設:
 *      SEC_HEAD_PAD_TOP（帯の内側の上） / SEC_HEAD_PAD_BOTTOM（帯の内側の下）
 *      SEC_HEAD_FONT_SIZE / SEC_HEAD_LINE_HEIGHT（文字と行の高さ）
 *    構造は: 線 → SEC_HEAD_GAP_TOP（帯の外・上の余白）→ 帯[ PAD_TOP + 文字 + PAD_BOTTOM ]
 *    → 下線 → 項目。高さを伸ばすのは PAD_TOP / PAD_BOTTOM、線と帯の間は GAP_TOP。
 *  - スタイルの再注入を「内容が変わったときだけ」に変更。v0.11.x までは掃除のたびに
 *    スタイルを作り直していたため、DevTools での一時調整がすぐ元に戻っていた。
 *    （TUNING を変えてスクリプトを更新→リロードすれば、内容が変わるので確実に差し替わる）
 *
 *  (3) 10超リレーションの黒ポップアップ（ホバーチップ）を非表示にする。
 *      Probe v0.7.0 の自動キャプチャで構造を確定:
 *        div[data-portal="true"] > … > div[role="dialog"]
 *          style="width: max-content; max-width: 300px; …"（inline）
 *          中身 = .notion-record-icon 付きの行が題名ぶん並ぶ
 *      → 「role=dialog かつ inline で max-width:300px かつ .notion-record-icon を含む」
 *      の3条件でピンポイント指定（ページプレビュー等の別ポップアップは掛からない）。
 *      :has() は Firefox 121以降 / Chromium 105以降が対応（Zen は OK）。
 *      全件は既にセル内に表示しているので、このチップは冗長＝消して問題ない
 *      （セルの題名クリックで開くので OPEN 系の機能には触らない・掟④遵守）。
 *
 *  (1) 線の色を統一: セクション間の区切り線（.cordi13-sec-div）だけが濃い
 *      （--ca-borPri・0.35）ので浮いて見えた。見出しの下線と同じ
 *      SEPARATOR_COLOR（--ca-borPriTra・0.16）に統一する。
 *  (2) 見出しの上に間隔: 区切り線 → 空白（SEC_HEAD_GAP_TOP=14px）→ 見出し → 下線 →
 *      項目、の順に。先頭セクションの見出しは margin-top: 0 のまま（上に余計な
 *      空白を作らない）。区切り線自体の上マージンは4pxに縮小。
 *  (3)（次版対応）10超リレーションの黒ポップアップ非表示 — HTMLを
 *      Probe v0.7.0 の自動キャプチャで確定させてから CSS を当てる。
 *
 *  - SERIES_PROP_NAME を「シリーズ」→「Series」に修正（Probe v0.6.0 の実測に合わせる）。
 *    これで名前一致が必ず成功し、relation の第3ホップでシリーズページの題名を取得して
 *    見出しに使う。Grouping（グループ見出し）は掴まない。
 *
 * v0.7.0 → v0.8.0 の変更（「単行になる」第二段の修正）:
 *  (1) 自動検出: 本側DBに「シリーズ」という名前のプロパティが無くても、relation型の
 *      プロパティのうち「いま展開中の関係そのもの」（Mediasへの逆参照・値サンプルの
 *      指し先の親が Medias コレクション）を除外して、1本だけ残ればそれをシリーズと
 *      して自動使用する。ログに使用したプロパティ名（名前一致か自動検出か）を出すので、
 *      違うプロパティを掴んだら SERIES_PROP_NAME で名前固定すれば済む。
 *  (2) 使用ログを統一: [series] DB… のシリーズプロパティを使用: type=… / key=…（名前一致 / 自動検出）。
 *
 * v0.6.0 → v0.7.0 の変更（Probe v0.3.0 の実測で原因確定）:
 *  (1) ★根本修正: シリーズプロパティを探す場所が間違っていた。v0.6.0 までは行の親
 *      （Medias DB）の schema を見ていたが、Medias には "Tactus"(relation) しか無いので
 *      常に「見つからない」→ 全員「単行」になっていた（東野圭吾でシリーズを紐づけて
 *      いても単行表示になる原因）。v0.7.0 では関係先ページ（本）の親コレクション
 *      ＝本側DBの schema から「シリーズ」を探す（第2ホップの本来の形）。
 *      relation 型なら第3ホップでシリーズページの題名を取得、select/text ならそのまま。
 *      保険として、関係先に無いときだけ Medias 側も見る。
 *  (2) 見つからないときは、そのDBのプロパティ一覧（名前/型）を全部ログに出力する
 *      → プロパティ名のズレ・作り間違いが一目で分かる。
 *  (3) schema の検索結果はコレクションIDごとにキャッシュ（セルをまたいで1回だけ取得）。
 *      ※プロパティを追加・変更したときはページのリロードが必要。
 *  (4) parseSeriesValue を強化: select（["値"]）・装飾付きテキスト（["値", 装飾]）・
 *      複数セグメントのテキストに対応（セパレータ "," と ‣ は値と見なさない）。
 *
 * v0.6.0 の変更（再掲）:
 *  - 「入らない」最有力原因の撤廃: v0.5.0 の「セクション1つなら DOM 不触」を廃止し、
 *    ゲートを通ったセルはセクション1つ（全員「単行」含む）でも必ず見出し付きで再構築。
 *  - 発動ゲート: +Nチップ付きは無条件。チップ無しは最長題名 ≥ MIN_CHARS_GATE(12)字。
 *  - 切り分けログの強化（[series] / [gate] / 再構築サマリー）。
 *
 * v0.5.0 の変更（再掲）: シリーズ検出を型を問わず受付に・小セルの覗き見の導入。
 * v0.3.0 の変更（再掲）: シリーズ自動グループ化・COLS_RULES 階段。
 * v0.2.0 の修正（再掲）: アイコン opacity 修復・data-cordi13-cols フック化。
 */

(function () {
  'use strict';

  /* ── v2026-09-27 軽量化の番人（この1段だけ追加。本体の処理は1文字も変えていません）──
     このスクリプトの見張り（MutationObserver）に届く変化を、仕事の前にふるいます。
     ・入力中の文字の変化（編集中のブロックの中）→ 捨てる（1打鍵ごとの全画面走査を止める）
     ・サイドバー／¹⁶ の器の中の変化 → 捨てる（このスクリプトの担当外）
     ・サイドバーで行をつかんでいる間 → 溜めて、離したあとに1回だけ渡す
     ここで名前を上書きするのは、この関数の中だけです（他のスクリプトには影響しません）。 */
  const MutationObserver = (() => {
    const O = window.MutationObserver;
    const SKIP = '.notion-sidebar-container, .notion-sidebar, #c16-root, #c16-line, #c16-menu';
    const el = (n) => n && (n.nodeType === 1 ? n : n.parentElement);
    const inEdit = (e) => !!(e && e.closest('[contenteditable="true"]'));
    const textOnly = (list) => { for (const n of list) if (n.nodeType !== 3) return false; return true; };
    const drop = (r) => {
      const e = el(r.target);
      if (!e) return false;
      if (SKIP && e.closest(SKIP)) return true;
      if (r.type === 'characterData') return inEdit(e);
      if (r.type === 'childList' && inEdit(e) && textOnly(r.addedNodes) && textOnly(r.removedNodes)) return true;
      return false;
    };
    return class extends O {
      constructor(cb) {
        let pend = null, waitT = 0;
        const flush = (obs) => {
          waitT = 0;
          if (document.documentElement.hasAttribute('data-c16-dragging')) { waitT = setTimeout(() => flush(obs), 250); return; }
          const recs = pend; pend = null;
          if (recs && recs.length) cb.call(obs, recs, obs);
        };
        super(function (recs, obs) {
          const keep = [];
          for (const r of recs) if (!drop(r)) keep.push(r);
          if (!keep.length) return;
          if (document.documentElement.hasAttribute('data-c16-dragging')) {
            pend = (pend || []).concat(keep).slice(-200);
            if (!waitT) waitT = setTimeout(() => flush(obs), 250);
            return;
          }
          cb.call(obs, keep, obs);
        });
      }
    };
  })();


  /* ============================================================
   *  文字幅の計量（全角・半角・全角換算）
   * ============================================================
   *  判定の物差しを「文字数」から「幅」へ移すための計量器。
   *   全角（CJK・全角記号・全角かな等）= 1.0em
   *   半角（ASCII・ラテン・半角カナ等）  = 0.5em
   *  → 全角換算 = 全角 + 半角 × 0.5
   *
   *  これで
   *    「A . Horowitz」(半角・空白入り) と「A・Horowitz」(全角・中黒) のような
   *    表記揺れでも、同じ尺度で比較できる（海外作家は半角、邦人は全角が混ざる）。
   *  判定に使う値なので、閾値と一緒に必ずログへ出す。
   * ============================================================ */
  function charMetrics(text) {
    const s = String(text || '');
    let full = 0;
    let half = 0;
    for (const ch of s) {
      const cp = ch.codePointAt(0);
      const isFull =
        (cp >= 0x1100 && cp <= 0x115f) ||      // ハングル字母
        cp === 0x2329 || cp === 0x232a ||
        (cp >= 0x2e80 && cp <= 0xa4cf && cp !== 0x303f) ||  // CJK 部首〜Yi
        (cp >= 0xac00 && cp <= 0xd7a3) ||      // ハングル音節
        (cp >= 0xf900 && cp <= 0xfaff) ||      // CJK 互換
        (cp >= 0xfe10 && cp <= 0xfe19) ||      // 縦書き記号
        (cp >= 0xfe30 && cp <= 0xfe6f) ||      // CJK 互換形
        (cp >= 0xff00 && cp <= 0xff60) ||      // 全角形
        (cp >= 0xffe0 && cp <= 0xffe6) ||
        (cp >= 0x1f300 && cp <= 0x1f9ff) ||    // 絵文字
        (cp >= 0x20000 && cp <= 0x3fffd);      // CJK 拡張B〜
      if (isFull) full += 1; else half += 1;
    }
    return { full, half, equiv: full + half * 0.5 };
  }

  /* 全セルの実測を溜めて __c13.report() で表に出す（チューニング用） */
  const GATE_ROWS = new Map();

  /* ============================================================
   *  v0.30.0 -> v0.31.0 -> v0.32.0（発動ゲートの作り直し）
   * ============================================================
   *  問題:
   *    旧ゲートは「+Nチップが有る（=10件超）か、最長題名が12字以上」で発動を決めていた。
   *    → 10件以下で題名が短いセルは、中身が立派でも必ず不発
   *      （実機ログ: [gate] チップ=無 件数=1 最長題名=4字 → 不発）。
   *    → 逆に「長い名前が1件」あるだけで発動してしまう余地もあった。
   *    「文字数」は“並べる価値があるか”の代理指標になっていなかった。
   *
   *  変更（判定の根拠を件数へ）:
   *      gate = チップ付き（無条件） || 表示できる項目が MIN_ITEMS_GATE 件以上
   *    1件だけのセルは並べる意味が無いので不発 = 人名（作家）の誤爆はここで落ちる。
   *    作品名が短くても、2件以上あれば表示される（文字数を見ない）。
   *
   *  調整スイッチ（TUNING）:
   *    MIN_ITEMS_GATE   : 既定 2。1 にすると1件でも発動。
   *    USE_CHARS_GATE   : 既定 false。true で旧・文字数ゲートを併用（AND）。
   *    REQUIRE_SERIES_DB: 既定 false。true で関係先DBに Series(relation) があるセルだけ発動。
   * ============================================================
   */

  const TUNING = {
    MULTI_THRESHOLD: 2,        // v0.43.0: 3件以上で整列グリッド。7〜10件が「何も起きない」空白地帯だった   // 全件数がこれを超えたらグリッド化（それ以下はフレックス折返しのまま）
    GATE_MODE: 'either',   // v0.35.0: 既定。チップ付きは無条件、チップ無しは
                           //   legacy（最長 >= MIN_CHARS_GATE 字）or 件数 >= MIN_ITEMS_GATE or 全角換算 >= MIN_WIDTH_EQUIV。
                           //   v0.30.0 の判定を包含するので退行しない（'legacy' に戻せば v0.30.0 と完全同一）。
                           //   'legacy'（既定）= チップ付き || 最長題名 >= MIN_CHARS_GATE(12)。
                           //     v0.30.0 と同じゲート。短い題名・少件数のセルはネイティブのまま＝誤爆しない。
                           //   'count'           = 件数 >= MIN_ITEMS_GATE で発動。1件は常に不発。
                           //   'width'           = 全角換算 >= MIN_WIDTH_EQUIV で発動（件数を見ない）
                           //   'both'            = 件数 と 幅 の両方を満たすとき発動（最も慎重）
                           //   'either'          = どちらか満たせば発動（最も出す）
    MIN_ITEMS_GATE: 3,     // v0.35.0: 件数のしきい値。3件以上はパイプ表示（PIPE_MIN_ITEMS）で発動する。
                           //   ＝人名（作家）などの誤爆はここで落ちる。1 にすると1件でも発動。
    MIN_WIDTH_EQUIV: 12,   // v0.32.0: 幅のしきい値（全角換算）。全角1.0em/半角0.5emで数えた合計。
    /* ---- v0.35.0: 1行パイプ表示（3件以上を 〇〇〇〇｜〇〇〇〇｜〇〇〇〇 に） ---- */
    PIPE_ONELINE: false,       // v0.43.0: 1行パイプは使わない（3件以上は全部この整列グリッドで組む）        // 件数 >= PIPE_MIN_ITEMS のセルは値だけを1行に並べて縦線で区切る
    PIPE_MIN_ITEMS: 3,         // パイプ表示にする最低件数
    PIPE_MAX_ITEMS: 6,         // v0.36.0: これを超える件数はパイプにしない（グリッド／折返しへ）
PIPE_SHOW_HEADERS: true,   // v0.37.0: パイプ表示でもセクション見出し（単行 など）を出す
    PIPE_SEPARATOR: 'rule',    // 'rule' = 細い縦線 / 'text' = ｜の文字
    PIPE_SEPARATOR_TEXT: '｜', // 'text' のときに使う文字
    PIPE_GAP_PX: 6,            // 区切りの左右の余白（px）
    PIPE_STRIP_PREFIX: false,  // v0.43.0: 既定OFF（「マスカレード・ホテル」が「ホテル」になる事故をやめる）   // v0.38.0: セクション内の共通接頭辞を表示から落とす（見出しが同じ語を出しているため）
    PIPE_FIT: true,
    /* ---- v0.44.0: アイコンの自己修復（初回のリロードでアイコンが出ない競合への対策）---- */
    ICON_REPAIR: true,
    ICON_REPAIR_DELAYS_MS: [400, 1400, 3000],
    ICON_EMOJI: true,          // 絵文字アイコンは画像枠ではなく文字で出す（img の src に入れると必ず壊れる）

    /* ---- v0.43.0: リレーション項目の書体（セクション見出しと同じ体系）---- */
    ITEM_FONT: true,           // 文字を消したり縮めたりはしない。書体だけを当てる
    /* v0.43.0 訂正: 以前の '"Cordivestium Relation"' というフォントは存在しない（私の誤り）。
       ¹² Group Header Typography が @font-face で宣言している "Cordivestium Group Header" に合わせる。 */
    ITEM_FONT_FAMILY: '"Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", "Yu Mincho", serif',
    SEC_HEAD_FONT_FAMILY: '"Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", "Yu Mincho", serif',
    ITEM_FONT_SIZE: '',        // 空 = Notion のサイズのまま（例: '12px'）
    ITEM_FONT_WEIGHT: '',      // 空 = Notion の太さのまま（例: '500'）
    ITEM_FONT_LINE_HEIGHT: '', // 空 = 触らない（例: '1.6'）            // v0.39.0: 入りきらないセルは題名を潰さず折返す（false で1行固定・見切れ許容）

                           //   例: 全角12文字ぶん。海外作家の半角表記でも同じ尺度で判定できる。
    USE_CHARS_GATE: false, // v0.32.0: 旧・文字数ゲート（最長題名 >= MIN_CHARS_GATE）を併用するか。
    MIN_CHARS_GATE: 12,    // 旧・文字数ゲートの値（USE_CHARS_GATE が true のときだけ効く）
    REQUIRE_SERIES_DB: false, // v0.32.0: true にすると、関係先DBに Series(relation) があるセルだけ発動。
                           //   作品の並び（シリーズ分け）に意味があるセルに限定する最強の誤爆回避。
    COLS_RULES: [          // 最長題名の文字数で列数を決める階段（上から判定）
      { maxTitleLen: 20, cols: 3 },
      { maxTitleLen: 40, cols: 2 },
      { maxTitleLen: Infinity, cols: 1 },   // 縦積み（膨張より読みやすさ優先の長題名ケース）
    ],
    SERIES_PROP_NAME: 'Series',   // 本側DB（関係先）のプロパティ名（実測: "Series"/relation）。見つからなければ relation 型を自動検出
    STANDALONE_LABEL: '単行',        // シリーズ未設定の本のセクション名
    HIDE_UNTITLED: true,             // 題名の無いゴースト関係（無題ページ）を表示しない
    SECTION_DIVIDER: true,           // セクション間に横の区切り線を引く
    SECTION_DIVIDER_COLOR: 'var(--ca-borPriTra, rgba(55,53,47,0.16))', // 見出しの下線と同一色に統一（v0.10.0）
    ROW_GAP: '3px',        // 行間（アイテムの padding-bottom として効く）
    SEPARATOR_COLOR: 'var(--ca-borPriTra, rgba(55,53,47,0.16))', // 見出しの下線と同じトーン
    SEPARATOR_PAD: '8px',
    SEC_HEAD_GAP_TOP: '14px',  // 区切り線 → 見出し文字 の間（見出しの padding-top として効く・v0.13.0）
    SEC_HEAD_PAD_BOTTOM: '4px',    // 見出し文字 → 下線 の間（v0.12.0）
    SEC_HEAD_BODY_GAP: '18px',      // 見出しの下線 → 項目 の間（v0.16.0・v0.17.0からスペーサ実装で確実に効く）
    SEC_DIV_PAD_TOP: '10px',       // 前セクション最終項目 → 区切り線 の間（v0.15.0）
    SEC_DIV_PAD_BOTTOM: '0px',    // 区切り線 → 次セクション見出し の間（v0.15.0）
    SEC_HEAD_FONT_SIZE: '11px',    // 見出しの文字サイズ（v0.12.0）
    SEC_HEAD_LINE_HEIGHT: '1.6',   // 見出しの行の高さ（v0.12.0）
    SEC_HEAD_ICON: true,           // 見出しにシリーズページのアイコンを付ける（v0.14.0）
    SEC_HEAD_ICON_SIZE: '18px',    // 見出しアイコンのサイズ（v0.14.0）
    SEC_HEAD_ICON_GAP: '10px',      // 見出しアイコン ←→ 文字 の間隔（v0.14.0）
    HIDE_RELATION_POPUP: true, // 10超リレーションの黒いホバーチップ（全件ポップアップ）を隠す（v0.11.0）
    FALLBACK_TITLE: 'New page',
    DEBOUNCE_MS: 120,      // v0.45.0: 300 → 120（スクロールで出てきた行を早く仕上げる）
    HOLD_UNTIL_READY: true, // v0.45.0: 再構築が終わるまで表のリレーションセルを透明にし、終わったらフェードで出す
    HOLD_MAX_MS: 1200,      // v0.45.0: どんな時もこの時間で必ず見える（失敗・遅延の保険）
    HOLD_FADE_MS: 160,      // v0.45.0: 出る時のフェード
    RESCAN_DELAYS_MS: [200, 900, 2500],
    API_BATCH: 50,
    CLICK_NATIVE_REUSE: true, // 画面に出ていた本物のチップを非表示で残し、クリック時にそれを踏む（v0.21.0）
    CLICK_NATIVE_INDEX_FALLBACK: true,
    EDIT_BTN_LABEL: '＋',        // セル右上のホバー「＋」ボタンの文字（v0.28.0）
    CLICK_PRIMARY: 'pushstate', // v0.30.0: 項目クリックの第一経路 'pushstate'=pushState(?p&pm=s) / 'native'=元チップを合成クリック
    CLICK_MODE: 'native',   // 項目クリックの開き方（v0.21.0）:
                            //   'native'（既定）= 本物のチップを踏ませて「リロードなしのその場ピーク」を狙う。
                            //                    元チップが無い分は anchor → フル遷移 にフォールバック
                            //   'auto'        = まずアプリ内リンクとして踏ませて「リロードなしのサイドピーク」を狙い、
                            //                   遷移しなければフル遷移に自動で落とす
                            //   'anchor'      = アプリ内リンク扱いのクリックのみ（リロードなし狙い・フォールバック無し）
                            //   'pushstate'   = history.pushState + popstate（リロードなし狙い・検証用）
                            //   'peek'        = URL遷移でサイドピーク（v0.19.0 挙動・リロードあり）
                            //   'peek_center' = URL遷移でセンターピーク（v0.19.0 挙動・リロードあり）
                            //   'page'        = ページへ直接遷移（PAGE_URL_MODE の形式・ピーク無し）
    CLICK_FALLBACK_MS: 1500, // 候補ノードごとに「ピークが出るまで」待つ上限（v0.24.0）
    PEEK_POLL_MS: 60,        // ピークの器の出現を監視する間隔（v0.23.0）
    CLICK_FALLBACK: true,    // ピークがどうしても出ないときフル遷移に落とす（false=無反応でも遷移しない）
    CLICK_CANDIDATES_EXTRA: false, // true にすると親要素・セルも踏む（ピッカーが開くので既定は false・v0.25.0）
    PICKER_GUARD: true,      // リレーション編集ポップアップ（ピッカー）が開いたら Esc で閉じる（v0.25.0）
    RESTORE_VIEW: true,      // クリック前のスクロール位置を記憶し、遷移後に復元する（v0.22.0）
    RESTORE_KEY: 'cordi13-restore-v1',
    RESTORE_MAX_AGE_MS: 60000,          // この時間内の記録だけ復元に使う
    RESTORE_TRIES_MS: [300, 1200, 2500, 5000, 9000], // アプリの立ち上がりに合わせて何度か試す
    CLICK_NEW_TAB: false,   // true にすると別タブで開く（v0.18.0 までの挙動）
    PAGE_URL_MODE: 'auto',  // 'page' モード時の遷移先URL（v0.18.0）:
                            //   'auto' = app.notion.com は /p/<ID>、www.notion.so は /<ID>
                            //   'p'    = 常に <origin>/p/<ID>  / 'bare' = 常に <origin>/<ID>
                            //   'www'  = 常に https://www.notion.so/<ID>（auto で404が続く場合の保険）
    FAIL_COOLDOWN_MS: 60000,
    CLEANUP_ON_START: true,  // v0.34.0: 起動時に旧版の注入DOM/属性を掃除して元に戻す

    DEBUG: false,
  };

const VERSION = '1.48.0';
  const STYLE_ID = 'cordi13-style-v044';
  const TAG = '[C13 v' + VERSION + ']';

  function log(s) { console.info(TAG + ' ' + s); }

  /* ============================================================
   *  グループの編集（¹⁴ Relation Show All と ²³ Page Relation Show All で共通・同じ保存先）
   *   ・見出しの題名とアイコンを、グループごとに変える（Notion のデータは書き換えない・このブラウザだけ）
   *   ・シリーズの無い本（単行）にもアイコンと題名を付けられる
   *   ・本を好きなグループへ移す（自分で作ったグループも可）
   *   window.__cordiGroups を先に起きた方が作り、もう片方はそれを使う
   * ============================================================ */
  const CG = (function cordiGroups() {
    const CGV = 1;
    if (window.__cordiGroups && window.__cordiGroups.v >= CGV) return window.__cordiGroups;
    const LS = 'cordi.groups.v1';
    const EVT = 'cordi-groups-change';
    let S = { groups: {}, items: {}, custom: [] };
    const load = () => {
      try {
        const o = JSON.parse(localStorage.getItem(LS) || 'null');
        if (o && typeof o === 'object') S = { groups: o.groups || {}, items: o.items || {}, custom: Array.isArray(o.custom) ? o.custom : [] };
      } catch (e) { /* noop */ }
    };
    load();
    const fire = () => { try { window.dispatchEvent(new CustomEvent(EVT)); } catch (e) { /* noop */ } };
    const save = () => { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { /* noop */ } fire(); };
    window.addEventListener('storage', (e) => { if (e.key === LS) { load(); fire(); } });
    /* 既定の「単行」のアイコン（本・線） */
    const STANDALONE_ICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#91918E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4.5h10.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h10.5"/><path d="M9 8.5h5"/></svg>');
    const keyOf = (sec) => (sec.standalone ? '__standalone__' : sec.sid ? 'p:' + sec.sid : 't:' + sec.name);
    const meta = (key) => S.groups[key] || {};
    const label = (key, def) => { const m = meta(key); return m.label || def; };
    const icon = (key, def) => { const m = meta(key); return m.icon !== undefined ? m.icon : (key === '__standalone__' && !def ? STANDALONE_ICON : def); };
    function setMeta(key, patch) {
      const m = Object.assign({}, S.groups[key] || {}, patch);
      Object.keys(m).forEach((k) => { if (m[k] === null || m[k] === undefined) delete m[k]; });
      if (Object.keys(m).length) S.groups[key] = m; else delete S.groups[key];
      const c = S.custom.find((x) => x.key === key);
      if (c && patch.label) c.label = patch.label;
      save();
    }
    function newGroup(name) {
      const key = 'c:' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      S.custom.push({ key, label: name });
      S.groups[key] = { label: name };
      save();
      return key;
    }
    function removeGroup(key) {
      S.custom = S.custom.filter((x) => x.key !== key);
      delete S.groups[key];
      Object.keys(S.items).forEach((id) => { if (S.items[id] === key) delete S.items[id]; });
      save();
    }
    const assigned = (id) => S.items[id] || null;
    function assign(id, key) { if (key) S.items[id] = key; else delete S.items[id]; save(); }
    const customLabel = (key) => { const c = S.custom.find((x) => x.key === key); return c ? label(key, c.label) : null; };
    /* 本を移した先に合わせて、セクションの並びを組み直す（sections: [{name, icon, sid, standalone, items:[{id,…}]}]）
       見出しの題名・アイコンの差し替えもここで（sec.key・sec.label・sec.icon を付ける） */
    function regroup(sections, standaloneName) {
      const out = sections.map((s) => Object.assign({}, s, { items: s.items.slice() }));
      out.forEach((s) => { s.key = keyOf(s); });
      const byKey = new Map(out.map((s) => [s.key, s]));
      for (const s of out) {
        for (const it of s.items.slice()) {
          const to = assigned(it.id);
          if (!to || to === s.key) continue;
          let dst = byKey.get(to);
          if (!dst) {
            const cl = customLabel(to);
            if (to === '__standalone__') dst = { name: standaloneName, icon: '', sid: '', standalone: true, items: [], key: to };
            else if (cl) dst = { name: cl, icon: '', sid: '', items: [], key: to, custom: true };
            else continue;   // 移した先のシリーズがこの一覧に無い時は動かさない
            byKey.set(to, dst);
            const si = out.findIndex((x) => x.standalone);
            if (si >= 0 && !dst.standalone) out.splice(si, 0, dst); else out.push(dst);
          }
          s.items.splice(s.items.indexOf(it), 1);
          dst.items.push(it);
        }
      }
      const res = out.filter((s) => s.items.length);
      for (const s of res) { s.label = label(s.key, s.name); s.icon = icon(s.key, s.icon || ''); }
      return res;
    }

    /* ---------- 編集パネル ---------- */
    const CSS_ID = 'cordi-groups-css';
    function css() {
      if (document.getElementById(CSS_ID)) return;
      const st = document.createElement('style');
      st.id = CSS_ID;
      st.textContent = `
.cg-pop{position:fixed;z-index:2147483602;width:300px;box-sizing:border-box;padding:12px;border-radius:12px;background:var(--c-bgPri,#fff);color:var(--c-texPri,#37352f);box-shadow:0 0 0 .5px rgba(15,15,15,.12),0 4px 12px rgba(15,15,15,.08),0 16px 40px rgba(15,15,15,.16);font:12px/1.45 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Segoe UI",sans-serif}
.cg-pop *{box-sizing:border-box}
.cg-pop .cg-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.cg-pop .cg-prev{flex:none;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--c-bacHov,rgba(55,53,47,.06));font-size:22px;line-height:1}
.cg-pop .cg-prev img{width:26px;height:26px;object-fit:contain}
.cg-pop .cg-name{flex:1;min-width:0;height:32px;padding:0 10px;border-radius:8px;border:0;outline:0;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:600 14px/1 "Baskerville","Hiragino Mincho ProN",serif}
.cg-pop .cg-name:focus{box-shadow:0 0 0 2px rgba(35,131,226,.45)}
.cg-pop .cg-tabs{display:flex;gap:2px;padding:2px;border-radius:8px;background:var(--c-bacHov,rgba(55,53,47,.06));margin-bottom:8px}
.cg-pop .cg-tabs button{flex:1;height:24px;border:0;border-radius:6px;background:none;color:var(--c-texSec,#787774);font:500 11px/1 inherit;cursor:pointer}
.cg-pop .cg-tabs button[data-on="1"]{background:var(--c-bgPri,#fff);color:inherit;box-shadow:0 1px 2px rgba(0,0,0,.1)}
.cg-pop .cg-pane{min-height:150px}
.cg-pop .cg-q,.cg-pop .cg-txt,.cg-pop .cg-url{width:100%;border:0;outline:0;border-radius:6px;padding:6px 8px;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:12px/1.4 inherit}
.cg-pop .cg-url{height:96px;resize:none;font-family:ui-monospace,Menlo,monospace;font-size:11px}
.cg-pop .cg-txt{font-size:20px;text-align:center;height:44px}
.cg-pop .cg-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;max-height:150px;overflow:auto;margin-top:6px}
.cg-pop .cg-grid button{aspect-ratio:1;border:0;border-radius:6px;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center}
.cg-pop .cg-grid button:hover{background:var(--c-bacHov,rgba(55,53,47,.08))}
.cg-pop .cg-grid img{width:20px;height:20px}
.cg-pop .cg-sw{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}
.cg-pop .cg-sw button{width:18px;height:18px;border-radius:5px;border:0;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.cg-pop .cg-sw button[data-on="1"]{box-shadow:0 0 0 2px var(--c-bgPri,#fff),0 0 0 3.5px #2383e2}
.cg-pop .cg-mut{color:var(--c-texSec,#787774);font-size:11px;margin-top:6px}
.cg-pop .cg-foot{display:flex;align-items:center;gap:6px;margin-top:12px;padding-top:10px;border-top:1px solid var(--c-borPri,rgba(55,53,47,.1))}
.cg-pop .cg-grow{flex:1}
.cg-pop .cg-btn{height:26px;padding:0 10px;border:0;border-radius:6px;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:500 11.5px/1 inherit;cursor:pointer}
.cg-pop .cg-ok{background:#2383e2;color:#fff}
.cg-pop .cg-del{background:none;color:#d44c47}
.cg-pop .cg-list{display:flex;flex-direction:column;gap:1px;max-height:260px;overflow:auto}
.cg-pop .cg-list button{display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border:0;border-radius:6px;background:none;color:inherit;font:inherit;text-align:start;cursor:pointer}
.cg-pop .cg-list button:hover{background:var(--c-bacHov,rgba(55,53,47,.08))}
.cg-pop .cg-list button[data-cur="1"]{font-weight:600}
.cg-pop .cg-list .cg-li{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:14px}
.cg-pop .cg-list .cg-li img{width:18px;height:18px;object-fit:contain}
.cg-pop .cg-h{font-size:11px;color:var(--c-texSec,#787774);margin:0 0 6px 2px}
`;
      (document.head || document.documentElement).appendChild(st);
    }
    const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const isUrl = (s) => /^(https?:|data:|\/)/.test(String(s || ''));
    const iconHtml = (s) => (!s ? '' : isUrl(s) ? '<img alt="" src="' + esc(s) + '">' : esc(s));
    function svgUrl(v) {
      v = String(v || '').trim();
      if (/^<svg[\s>]/i.test(v)) { if (!/xmlns=/.test(v)) v = v.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"'); return 'data:image/svg+xml,' + encodeURIComponent(v); }
      return isUrl(v) ? v : '';
    }
    let pop = null;
    function closePop() { if (pop) { pop.remove(); pop = null; } document.removeEventListener('pointerdown', outside, true); }
    function outside(e) { if (pop && !pop.contains(e.target)) closePop(); }
    function mount(el, anchor) {
      css(); closePop();
      pop = el;
      el.className = 'cg-pop';
      el.setAttribute('data-no-passthrough', '1');
      el.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); closePop(); } });
      for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) el.addEventListener(t, (e) => e.stopPropagation());
      document.body.appendChild(el);
      const r = anchor ? anchor.getBoundingClientRect() : { left: innerWidth / 2 - 150, bottom: 120 };
      const h = el.offsetHeight || 360;
      el.style.left = Math.max(8, Math.min(r.left, innerWidth - 308)) + 'px';
      el.style.top = Math.max(8, Math.min(r.bottom + 6, innerHeight - h - 8)) + 'px';
      setTimeout(() => document.addEventListener('pointerdown', outside, true), 0);
    }
    const LIBC = [['auto', '#37352F'], ['gray', '#9B9A97'], ['brown', '#64473A'], ['orange', '#D9730D'], ['yellow', '#DFAB01'], ['green', '#0F7B6C'], ['blue', '#0B6E99'], ['purple', '#6940A5'], ['pink', '#AD1A72'], ['red', '#E03E3E']];
    /* 見出しの編集: { key, name（元の題名）, icon（元のアイコン）, anchor } */
    function openEditor(o) {
      const m = meta(o.key);
      const cur = { label: m.label || '', icon: m.icon };
      const shownIcon = () => (cur.icon !== undefined ? cur.icon : icon(o.key, o.icon || ''));
      const el = document.createElement('div');
      const isCustom = o.key.startsWith('c:');
      el.innerHTML =
        '<div class="cg-top"><span class="cg-prev"></span><input class="cg-name" spellcheck="false" placeholder="' + esc(o.name) + '"></div>' +
        '<div class="cg-tabs"><button data-tab="lib">²⁹ ライブラリ</button><button data-tab="txt">絵文字・文字</button><button data-tab="url">SVG・画像</button></div>' +
        '<div class="cg-pane"></div>' +
        '<div class="cg-foot">' + (isCustom ? '<button class="cg-btn cg-del" data-a="del">グループを削除</button>' : '<button class="cg-btn" data-a="reset" title="題名とアイコンを Notion のものに戻す">元に戻す</button>') +
        '<button class="cg-btn" data-a="noicon">アイコンなし</button><span class="cg-grow"></span><button class="cg-btn" data-a="cancel">やめる</button><button class="cg-btn cg-ok" data-a="ok">完了</button></div>';
      const prev = el.querySelector('.cg-prev'), name = el.querySelector('.cg-name'), pane = el.querySelector('.cg-pane');
      name.value = cur.label || o.name;
      const sync = () => { prev.innerHTML = iconHtml(shownIcon()); };
      let libColor = 'auto';
      function tab(t) {
        el.querySelectorAll('.cg-tabs button').forEach((b) => b.setAttribute('data-on', b.dataset.tab === t ? '1' : '0'));
        if (t === 'lib') {
          pane.innerHTML = '<input class="cg-q" placeholder="英語の名前で探す（例: flask, book, star）" spellcheck="false"><div class="cg-sw">' + LIBC.map(([c, h]) => '<button data-c="' + c + '" style="background:' + h + '"' + (c === libColor ? ' data-on="1"' : '') + ' title="' + c + '"></button>').join('') + '</div><div class="cg-grid"></div><div class="cg-mut"></div>';
          lib('');
        } else if (t === 'txt') {
          pane.innerHTML = '<input class="cg-txt" maxlength="4" placeholder="📚"><div class="cg-mut">絵文字か 1〜2 文字</div>';
          const v = shownIcon(); pane.querySelector('.cg-txt').value = v && !isUrl(v) ? v : '';
        } else {
          pane.innerHTML = '<textarea class="cg-url" placeholder="<svg …>…</svg>／https://…／data:image/…" spellcheck="false"></textarea><div class="cg-mut">SVG はそのままの色で出ます</div>';
        }
      }
      function lib(q) {
        const grid = pane.querySelector('.cg-grid'), mut = pane.querySelector('.cg-mut');
        const L = window.__c29;
        if (!L || typeof L.ids !== 'function') { grid.innerHTML = ''; mut.textContent = '²⁹ Icon Library が動いていません（SVG・画像のタブで貼れます）'; return; }
        const k = q.trim().toLowerCase();
        let ids = []; try { ids = L.ids(); } catch (e) { /* noop */ }
        const hit = (k ? ids.filter((id) => id.toLowerCase().includes(k)) : ids).slice(0, 160);
        grid.innerHTML = hit.map((id) => { let u = ''; try { u = L.url(id, { color: libColor }); } catch (e) { /* noop */ } return u ? '<button data-ico="' + esc(id) + '" title="' + esc(id) + '"><img alt="" src="' + esc(u) + '"></button>' : ''; }).join('');
        mut.textContent = hit.length ? hit.length + ' 個' : '見つかりませんでした';
      }
      el.addEventListener('input', (e) => {
        const t = e.target;
        if (t === name) cur.label = t.value.trim() === o.name ? '' : t.value.trim();
        else if (t.matches('.cg-q')) lib(t.value);
        else if (t.matches('.cg-txt')) { cur.icon = t.value.trim() || undefined; sync(); }
        else if (t.matches('.cg-url')) { const u = svgUrl(t.value); if (u) { cur.icon = u; sync(); } }
      });
      el.addEventListener('click', (e) => {
        const t = e.target;
        const tb = t.closest('[data-tab]'); if (tb) return tab(tb.dataset.tab);
        const sw = t.closest('[data-c]'); if (sw) { libColor = sw.dataset.c; pane.querySelectorAll('.cg-sw button').forEach((b) => b.setAttribute('data-on', b === sw ? '1' : '0')); return lib((pane.querySelector('.cg-q') || {}).value || ''); }
        const ic = t.closest('[data-ico]'); if (ic) { try { cur.icon = window.__c29.url(ic.dataset.ico, { color: libColor }); } catch (err) { /* noop */ } return sync(); }
        const a = t.closest('[data-a]'); if (!a) return;
        const act = a.dataset.a;
        if (act === 'cancel') return closePop();
        if (act === 'noicon') { cur.icon = ''; return sync(); }
        if (act === 'reset') { delete S.groups[o.key]; save(); return closePop(); }
        if (act === 'del') { if (confirm('「' + (cur.label || o.name) + '」を削除します（中の本は元のグループへ戻ります）')) { removeGroup(o.key); closePop(); } return; }
        if (act === 'ok') commit();
      });
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === name) { e.preventDefault(); commit(); } });
      function commit() {
        const patch = { label: cur.label || null };
        if (cur.icon !== undefined) patch.icon = cur.icon;
        setMeta(o.key, patch);
        closePop();
      }
      mount(el, o.anchor);
      tab('lib'); sync();
      name.focus(); name.select();
    }
    /* 本の行き先: { id, title, sections: [{key, label, icon}], anchor } */
    function openMover(o) {
      const el = document.createElement('div');
      const cur = assigned(o.id);
      const keys = new Set(o.sections.map((s) => s.key));
      const extra = S.custom.filter((c) => !keys.has(c.key)).map((c) => ({ key: c.key, label: label(c.key, c.label), icon: icon(c.key, '') }));
      if (!keys.has('__standalone__')) extra.push({ key: '__standalone__', label: label('__standalone__', '単行'), icon: icon('__standalone__', '') });
      const row = (s) => '<button data-k="' + esc(s.key) + '"' + (s.key === cur ? ' data-cur="1"' : '') + '><span class="cg-li">' + iconHtml(s.icon) + '</span>' + esc(s.label) + '</button>';
      el.innerHTML = '<div class="cg-h"></div><div class="cg-list">' + o.sections.concat(extra).map(row).join('') +
        '<button data-a="new"><span class="cg-li">＋</span>新しいグループ…</button>' + (cur ? '<button data-a="clear"><span class="cg-li">↺</span>元のグループに戻す</button>' : '') + '</div>';
      el.querySelector('.cg-h').textContent = '「' + o.title + '」を移す';
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.k) { assign(o.id, b.dataset.k); return closePop(); }
        if (b.dataset.a === 'clear') { assign(o.id, null); return closePop(); }
        if (b.dataset.a === 'new') { const nm = prompt('新しいグループの名前', ''); if (nm && nm.trim()) { assign(o.id, newGroup(nm.trim())); } closePop(); }
      });
      mount(el, o.anchor);
    }
    const api = { v: CGV, keyOf, meta, label, icon, setMeta, newGroup, removeGroup, assign, assigned, regroup, openEditor, openMover, closePop, on: (fn) => window.addEventListener(EVT, fn), STANDALONE_ICON, dump: () => JSON.parse(JSON.stringify(S)) };
    window.__cordiGroups = api;
    return api;
  })();


  // ---------- 注入CSS（cordi13-* / data-cordi13-* の単一書き手） ----------
  function injectStyle() {
    const mine = document.getElementById(STYLE_ID);
    const css = [
      '/* Cordivestium Relation Show All v' + VERSION + ' — 13番 全件表示レイアウト */',
      '/* フックは data-cordi13-cols 属性（JSがwrapに付ける・深さに依存しない）。 */',
      '/* Relation Display CSS の row-gap/margin 保険は --cordi-relation-multi-gap 経由で 0 に寄せ、',
      '   行間は .cordi13-item の padding-bottom に一本化する（詳細度戦争をしない）。 */',
      '[data-cordi13-cols] {',
      '  --cordi-relation-multi-gap: 0px !important;',
      '  display: grid !important;',
      '  grid-template-columns: repeat(' + TUNING.COLS_RULES[0].cols + ', minmax(0, 1fr)) !important;',
      '  column-gap: 0 !important;',
      '  align-items: start !important;',
      '}',
      '.cordi13-item {',
      '  box-sizing: border-box !important;',
      '  padding-right: ' + TUNING.SEPARATOR_PAD + ' !important;',
      '  padding-bottom: ' + TUNING.ROW_GAP + ' !important;',
      '}',
      '.cordi13-item-sep {',
      '  border-left: 1px solid ' + TUNING.SEPARATOR_COLOR + ' !important;',
      '  padding-left: ' + TUNING.SEPARATOR_PAD + ' !important;',
      '}',
      '/* セクション見出し: wrap の直子で全幅。関係行の鎖（Relation Display CSS の双子）は壊さない。 */',
      '.cordi13-sec-head {',
      '  flex: 0 0 100% !important;',
    '  row-gap: 3px !important;',
      '  width: 100% !important;',
      '  min-width: 0 !important;',
      '  box-sizing: border-box !important;',
      '  grid-column: 1 / -1;',
      '  margin: 0 !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  flex-wrap: nowrap !important;',
      '  gap: ' + TUNING.SEC_HEAD_ICON_GAP + ' !important;',
      '  padding: ' + TUNING.SEC_HEAD_GAP_TOP + ' 0 ' + TUNING.SEC_HEAD_PAD_BOTTOM + ' 0 !important;',
      '  border-bottom: 1px solid ' + TUNING.SEPARATOR_COLOR + ' !important;',
      '  font-family: ' + TUNING.SEC_HEAD_FONT_FAMILY + ' !important;',
      '  font-size: ' + TUNING.SEC_HEAD_FONT_SIZE + ' !important;',
      '  font-weight: 700 !important;',
      '  line-height: ' + TUNING.SEC_HEAD_LINE_HEIGHT + ' !important;',
      '  color: var(--c-texSec, rgba(55,53,47,0.65)) !important;',
      '  cursor: pointer !important;',
      '}',
      '.cordi13-sec-head:hover > span:last-child { text-decoration: underline dotted; text-underline-offset: 3px; text-decoration-color: color-mix(in srgb, currentColor 40%, transparent); }',
      '.cordi13-sec-head:first-child { padding-top: 0 !important; }',
      '/* 見出しの下線 -> 最初の項目 の余白（v0.17.0）: margin-bottom は効かない環境が',
      '   あったので、実体のあるスペーサ要素で高さを取る。 */',
      '.cordi13-sec-gap {',
      '  flex: 0 0 100% !important;',
      '  width: 100% !important;',
      '  min-width: 0 !important;',
      '  grid-column: 1 / -1;',
      '  height: ' + TUNING.SEC_HEAD_BODY_GAP + ' !important;',
      '  min-height: ' + TUNING.SEC_HEAD_BODY_GAP + ' !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  border: 0 !important;',
      '  pointer-events: none !important;',
      '}',
      '/* セクション間の横区切り線: 全幅で見出しの下線より少し濃い1本。 */',
      '/* v1.48.0: 線を必ずセルの端まで（wrap と、それを包む要素を全幅に） */',
      '[data-cordi13-on] { width: 100% !important; min-width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }',
      '[data-testid="property-value"] :has(> [data-cordi13-on]), [data-testid="property-value"] :has(> * > [data-cordi13-on]) { width: 100% !important; min-width: 0 !important; max-width: 100% !important; }',
      '[data-cordi13-on] > :is(.cordi13-sec-head, .cordi13-sec-gap, .cordi13-sec-div) { grid-column: 1 / -1 !important; flex: 0 0 100% !important; width: 100% !important; justify-self: stretch !important; align-self: stretch !important; }',
      '.cordi13-sec-div {',
      '  flex: 0 0 100% !important;',
      '  width: 100% !important;',
      '  min-width: 0 !important;',
      '  box-sizing: border-box !important;',
      '  grid-column: 1 / -1;',
      '  height: 0 !important;',
      '  margin: 0 !important;',
      '  padding: ' + TUNING.SEC_DIV_PAD_TOP + ' 0 ' + TUNING.SEC_DIV_PAD_BOTTOM + ' 0 !important;',
      '  border-bottom: 1px solid ' + TUNING.SECTION_DIVIDER_COLOR + ' !important;',
      '}',
      ...(TUNING.HIDE_RELATION_POPUP ? [
        '/* 10超リレーションのホバーチップ（黒ポップアップ）を非表示: role=dialog かつ',
        '   inline で max-width:300px かつ .notion-record-icon 行入りの3条件でピンポイント。',
        '   ページプレビュー等の別ポップアップは inline の max-width:300px を持たないので掛からない。 */',
        'div[data-portal="true"] div[role="dialog"][style*="max-width: 300px"]:has(.notion-record-icon),',
        'div[data-portal="true"] div[role="dialog"][style*="max-width:300px"]:has(.notion-record-icon) {',
        '  display: none !important;',
        '}',
      ] : []),
      '/* セクション見出しのアイコン（シリーズページのアイコン・画像 or 絵文字） */',
      'img.cordi13-sec-icon {',
      '  width: ' + TUNING.SEC_HEAD_ICON_SIZE + ' !important;',
      '  height: ' + TUNING.SEC_HEAD_ICON_SIZE + ' !important;',
      '  border-radius: 3px !important;',
      '  object-fit: cover !important;',
      '  display: block !important;',
      '  flex: 0 0 auto !important;',
      '}',
      'span.cordi13-sec-icon {',
      '  flex: 0 0 auto !important;',
      '  font-size: ' + TUNING.SEC_HEAD_ICON_SIZE + ' !important;',
      '  line-height: 1 !important;',
      '}',
      '/* v0.28.0: リレーション編集の入口（セルにホバーすると右上に出る＋ボタン） */',
      '.cordi13-edit {',
      '  position: absolute !important; top: 0; right: 0;',
      '  width: 20px; height: 20px; line-height: 19px; text-align: center;',
      '  border-radius: 4px; font-size: 14px; font-weight: 400;',
      '  background: rgba(55,53,47,0.06); color: rgba(55,53,47,0.6);',
      '  cursor: pointer; opacity: 0; transition: opacity .12s;',
      '  z-index: 6; user-select: none;',
      '}',
      '[data-testid="property-value"]:hover .cordi13-edit { opacity: 1 !important; }',
      '.cordi13-edit:hover { background: rgba(55,53,47,0.16) !important; color: rgba(55,53,47,0.9); }',
      '.cordi13-title { cursor: pointer; }',
      ...(TUNING.ITEM_FONT ? [
        '/* v0.43.0: リレーション項目の書体をセクション見出しと同じ体系に揃える。',
        '   属性セレクタ4連で Notion 側の !important に勝たせる（区切り線と同じ手口）。',
        '   サイズ・太さは既定では触らない（行の高さや幅を変えないため）。 */',
        '[data-cordi13-on][data-cordi13-on][data-cordi13-on][data-cordi13-on] .cordi13-item .cordi13-title,',
        '[data-cordi13-on][data-cordi13-on][data-cordi13-on][data-cordi13-on] .cordi13-item .cordi13-title * {',
        '  font-family: ' + TUNING.ITEM_FONT_FAMILY + ' !important;',
        ...(TUNING.ITEM_FONT_SIZE ? ['  font-size: ' + TUNING.ITEM_FONT_SIZE + ' !important;'] : []),
        ...(TUNING.ITEM_FONT_WEIGHT ? ['  font-weight: ' + TUNING.ITEM_FONT_WEIGHT + ' !important;'] : []),
        ...(TUNING.ITEM_FONT_LINE_HEIGHT ? ['  line-height: ' + TUNING.ITEM_FONT_LINE_HEIGHT + ' !important;'] : []),
        '}',
      ] : []),
      '/* v0.44.0: 絵文字アイコンは書体の上書きを当てない */',
      '[data-cordi13-on][data-cordi13-on][data-cordi13-on][data-cordi13-on] .cordi13-item .cordi13-emoji {',
      '  font-family: initial !important;',
      '}',
      '/* v0.43.0: 見出し・余白・区切りは必ず全幅の行を取る（列に紛れ込んで線が浮くのを防ぐ） */',
      '[data-cordi13-cols] .cordi13-sec-head,',
      '[data-cordi13-cols] .cordi13-sec-gap,',
      '[data-cordi13-cols] .cordi13-sec-div {',
      '  grid-column: 1 / -1 !important;',
      '}',
    ].concat(TUNING.HOLD_UNTIL_READY ? [
      '/* v0.45.0: 再構築が終わるまで透明（素のチップ→並びへの組み替えを見せない）。HOLD_MAX_MS で必ず見える */',
      '.notion-table-view-cell [data-testid="property-value"] div[style*="flex-wrap: wrap"]:has(> div > div[style*="display: inline"] > .notion-record-icon):not([data-cordi13-done]):not([data-cordi13-fail]) {',
      '  opacity: 0;',
      '  animation: cordi13-hold-reveal 1ms linear ' + TUNING.HOLD_MAX_MS + 'ms forwards;',
      '}',
      '.notion-table-view-cell [data-testid="property-value"] [data-cordi13-done]:not([data-cordi13-pre]) {',
      '  animation: cordi13-hold-in ' + TUNING.HOLD_FADE_MS + 'ms ease-out both;',
      '}',
      '@keyframes cordi13-hold-reveal { to { opacity: 1; } }',
      '@keyframes cordi13-hold-in { from { opacity: 0; } to { opacity: 1; } }',
      '@media (prefers-reduced-motion: reduce) { .notion-table-view-cell [data-testid="property-value"] [data-cordi13-done] { animation: none; } }',
      '/* v0.46.0: 描画前に「不発」と分かったセルはフェードもしない（一度も消えない） */',
    ] : []).join('\n');
    if (mine) {
      // 内容が同じなら触らない（v0.12.0）: DevTools での一時調整が掃除のたびに消えないように。
      // TUNING を変えてスクリプトを更新すれば内容が変わるので、そのときだけ差し替わる。
      if (mine.textContent === css) return;
      mine.remove();
    }
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ---------- v0.46.0: 不発（ネイティブのまま）の記憶 ----------
  const NATIVE_LS = 'cordi13-native-v1';
  const NATIVE_MAX = 4000;
  let nativeSet = new Set();
  try { const a = JSON.parse(localStorage.getItem(NATIVE_LS) || 'null'); if (Array.isArray(a)) nativeSet = new Set(a.slice(-NATIVE_MAX)); } catch (e) { /* noop */ }
  let nativeSaveT = 0;
  function saveNativeSoon() {
    if (nativeSaveT) return;
    nativeSaveT = setTimeout(() => {
      nativeSaveT = 0;
      let arr = Array.from(nativeSet);
      if (arr.length > NATIVE_MAX) { arr = arr.slice(-NATIVE_MAX); nativeSet = new Set(arr); }
      try { localStorage.setItem(NATIVE_LS, JSON.stringify(arr)); } catch (e) { /* noop */ }
    }, 1500);
  }
  function hashStr(v) {
    let h = 2166136261;
    for (let i = 0; i < v.length; i++) { h ^= v.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  /* セルの中身の署名（行id＋チップ有無＋関係の題名の並び）。レイアウトは読まない */
  function sigOf(wrap) {
    try {
      const cell = wrap.closest('[data-testid="property-value"]');
      const id = cell ? (findBlockId(cell) || '') : '';
      const r = relKidsOf(wrap);
      const titles = r.rels.map((k) => chipTitleOf(k) || '').join('\u0001');
      const chip = r.others.some((k) => /^\+\s*\d+$/.test(chipText(k))) ? 1 : 0;
      return hashStr(id + '|' + chip + '|' + titles + '|' + r.rels.length);
    } catch (e) { return ''; }
  }
  function markNative(wrap, sig) {
    const s = sig || sigOf(wrap);
    if (!s) return;
    wrap.dataset.cordi13Done = '1';
    wrap.setAttribute('data-cordi13-skip', s);
    wrap.removeAttribute('data-cordi13-fail');
    if (!nativeSet.has(s)) { nativeSet.add(s); saveNativeSoon(); }
  }
  function forgetNative(wrap) {
    const s = wrap.getAttribute('data-cordi13-skip');
    if (s && nativeSet.delete(s)) saveNativeSoon();
    wrap.removeAttribute('data-cordi13-skip');
  }
  /* 描画前（MutationObserver のコールバック）: 追加された表のリレーションセルのうち、
     覚えている「不発」と同じ中身のものへ即印を付ける（透明にならない） */
  function prePaintNative(recs) {
    if (!nativeSet.size) return;
    for (const r of recs) {
      for (const n of r.addedNodes) {
        if (n.nodeType !== 1) continue;
        const inCell = n.closest && n.closest('.notion-table-view-cell');
        const scope = inCell || (n.querySelector && n.querySelector('.notion-table-view-cell') ? n : null);
        if (!scope) continue;
        const list = [];
        if (n.matches && n.matches('div[style*="flex-wrap: wrap"]')) list.push(n);
        const up = n.closest && n.closest('div[style*="flex-wrap: wrap"]');
        if (up) list.push(up);
        if (n.querySelectorAll) for (const w of n.querySelectorAll('div[style*="flex-wrap: wrap"]')) list.push(w);
        for (const w of list) {
          if (w.dataset.cordi13Done || !w.closest('.notion-table-view-cell')) continue;
          if (!relKidsOf(w).rels.length) continue;
          const s = sigOf(w);
          if (s && nativeSet.has(s)) { markNative(w, s); w.setAttribute('data-cordi13-pre', '1'); }
        }
      }
    }
  }

  // ---------- utils ----------
  function isRelKid(k) {
    return !!k.querySelector(':scope > div[style*="display: inline"] > .notion-record-icon');
  }
  function relKidsOf(wrap) {
    const kids = Array.from(wrap.children);
    return { rels: kids.filter(isRelKid), others: kids.filter((k) => !isRelKid(k)) };
  }
  function chipText(k) { return (k.textContent || '').replace(/\s+/g, ' ').trim(); }
  // チップの題名（span.notranslate を優先。無ければ全体のテキスト）
  function chipTitleOf(k) {
    const sp = k.querySelector('span.notranslate');
    const t = (sp ? sp.textContent : k.textContent) || '';
    return t.replace(/\s+/g, ' ').trim() || null;
  }
  function hasChipKid(wrap) {
    return relKidsOf(wrap).others.some((k) => /^\+\s*\d+$/.test(chipText(k)));
  }
  function findWrap(cell) {
    const wraps = cell.querySelectorAll('div[style*="flex-wrap: wrap"]');
    for (const w of wraps) if (relKidsOf(w).rels.length) return w;
    return null;
  }
  function findBlockId(el) {
    let c = el;
    for (let i = 0; i < 20 && c; i++) {
      const b = c.getAttribute && c.getAttribute('data-block-id');
      if (b) return b;
      c = c.parentElement;
    }
    return null;
  }

  // ---------- API（経路B） ----------
  async function apiFetch(requests) {
    const res = await fetch(location.origin + '/api/v3/syncRecordValues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ requests }),
    });
    if (!res.ok) { log('API HTTP ' + res.status); return null; }
    return res.json();
  }
  function extractNode(j, table, id) {
    const node = j && j.recordMap && j.recordMap[table] && j.recordMap[table][id];
    if (!node) return null;
    return node.value && node.value.value ? node.value.value : (node.value || null);
  }
  async function fetchBlock(id) {
    const j = await apiFetch([{ table: 'block', id, version: -1 }]);
    return j ? extractNode(j, 'block', id) : null;
  }
  async function fetchCollection(id) {
    const j = await apiFetch([{ table: 'collection', id, version: -1 }]);
    return j ? extractNode(j, 'collection', id) : null;
  }
  async function fetchBlocks(ids) {
    const map = new Map();
    for (let i = 0; i < ids.length; i += TUNING.API_BATCH) {
      const slice = ids.slice(i, i + TUNING.API_BATCH);
      const j = await apiFetch(slice.map((id) => ({ table: 'block', id, version: -1 })));
      if (!j) continue;
      const bm = j.recordMap && j.recordMap.block;
      if (bm) {
        for (const id2 of Object.keys(bm)) {
          const node = bm[id2];
          const v = node.value && node.value.value ? node.value.value : node.value;
          if (v) map.set(id2, v);
        }
      }
    }
    return map;
  }
  function parseRelIds(propValue) {
    const out = [];
    if (!Array.isArray(propValue)) return out;
    for (const seg of propValue) {
      if (Array.isArray(seg) && seg[0] === '‣' && Array.isArray(seg[1]) && seg[1][0] && seg[1][0][1]) {
        out.push(seg[1][0][1]);
      }
    }
    return out;
  }
  function recTitle(rec) {
    const t = rec.properties && rec.properties.title;
    if (Array.isArray(t)) {
      const s = t.map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : '')).join('');
      if (s.trim()) return s;
    }
    return null;
  }
  function colName(col) {
    try {
      const n = col && col.name;
      if (Array.isArray(n)) {
        const s = n.map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : '')).join('');
        if (s.trim()) return '「' + s.trim() + '」';
      }
    } catch (e) { /* 縮退 */ }
    return '';
  }
  // シリーズ値の解析: relation（‣ページ）/ select（["値"]）/ テキスト（装飾付き・複数セグメント含む）
  // のすべてに対応。‣ と セパレータ"," は値と見なさない。
  function parseSeriesValue(v) {
    if (!Array.isArray(v)) return null;
    const parts = [];
    for (const seg of v) {
      if (!Array.isArray(seg)) continue;
      if (seg[0] === '‣' && Array.isArray(seg[1]) && seg[1][0] && seg[1][0][1]) {
        return { kind: 'page', raw: seg[1][0][1] }; // relation（複数なら先頭を採用）
      }
      if (typeof seg[1] === 'string' && seg[1].trim() && seg[0] !== '‣' && seg[0] !== ',') {
        parts.push(seg[1].trim());
        continue;
      }
      const s0 = seg[0];
      if (typeof s0 === 'string' && s0 !== '‣' && s0 !== ',' && s0.trim() &&
          (seg.length === 1 || (seg.length === 2 && Array.isArray(seg[1])))) {
        parts.push(s0.trim()); // select / テキスト（装飾の有無を問わず）
      }
    }
    return parts.length ? { kind: 'text', raw: parts.join('') } : null;
  }

  // ---------- シリーズプロパティの特定（v0.8.0: 本側DB schema から探す・名前が無ければ relation を自動検出） ----------
  const seriesPropCache = new Map(); // コレクションID → {key,type,db} | null（プロパティ変更時はリロードで初期化）
  async function seriesPropInCollection(colId, ctx) {
    if (seriesPropCache.has(colId)) return seriesPropCache.get(colId);
    const col = await fetchCollection(colId);
    const schema = col && col.schema;
    if (!schema) {
      log('[series] コレクション(' + colId + ')の schema が取得できなかった');
      seriesPropCache.set(colId, null);
      return null;
    }
    const want = TUNING.SERIES_PROP_NAME.trim();
    const names = [];
    const relProps = []; // relation 型のプロパティ（key / 表示名）
    let found = null;
    let named = false;
    for (const [k, s] of Object.entries(schema)) {
      if (!s || !s.name) continue;
      names.push('"' + s.name + '"(' + (s.type || '?') + ')');
      if (s.type === 'relation') relProps.push({ key: k, name: s.name });
      if (!found && s.name.trim() === want && s.type !== 'title') { found = { key: k, type: s.type }; named = true; }
    }
    if (!found) {
      // 名前では見つからなかった → relation 型だけ自動検出。
      // 「いま展開中の関係そのもの」（Medias への逆参照）と値が空のものを外して、1本だけ残れば採用。
      const cands = [];
      for (const rp of relProps) {
        if (rp.key === ctx.excludeKey) continue;
        const sampleId = ctx.ids.find((id) => {
          const r = ctx.recs.get(id);
          return r && r.parent_id === colId && r.properties && Array.isArray(r.properties[rp.key]) && r.properties[rp.key].length;
        });
        if (!sampleId) continue;
        const r = ctx.recs.get(sampleId);
        const tid = parseRelIds(r.properties[rp.key])[0];
        let back = false;
        if (tid && ctx.mediasColId) {
          const tb = await fetchBlock(tid);
          back = !!(tb && tb.parent_table === 'collection' && tb.parent_id === ctx.mediasColId);
        }
        if (!back) cands.push(rp);
      }
      if (cands.length === 1) {
        found = { key: cands[0].key, type: 'relation' };
        log('[series] 「' + want + '」という名前が無いので、relation「' + cands[0].name + '」をシリーズとして自動使用（固定するなら SERIES_PROP_NAME を "' + cands[0].name + '" に）');
      } else if (cands.length === 0) {
        log('[series] DB' + (colName(col) || colId) + ' に「' + want + '」が無く、relation候補も無い → プロパティ一覧: ' + names.join(', '));
      } else {
        log('[series] 候補relationが複数: ' + cands.map((c) => '"' + c.name + '"').join(', ') +
          ' → SERIES_PROP_NAME を設定してください（全プロパティ: ' + names.join(', ') + '）');
      }
    }
    if (found) {
      found.db = colName(col) || colId;
      log('[series] DB' + found.db + ' のシリーズプロパティを使用: type=' + found.type + ' / key="' + found.key + '"' +
        (named ? '（名前一致）' : '（自動検出）'));
    }
    seriesPropCache.set(colId, found);
    return found;
  }
  async function findSeriesProp(recs, ids, row, excludeKey) {
    // (1) 本丸: 関係先ページ（本）の親コレクションの schema から探す
    const parents = [];
    for (const id of ids) {
      const r = recs.get(id);
      if (r && r.parent_table === 'collection' && r.parent_id && !parents.includes(r.parent_id)) {
        parents.push(r.parent_id);
      }
      if (parents.length >= 3) break; // 関係先が複数DBにまたがる場合の上限
    }
    const ctx = { recs, ids, mediasColId: row && row.parent_table === 'collection' ? row.parent_id : null, excludeKey: excludeKey || null };
    if (!parents.length) log('[series] 関係先ページの親コレクションを特定できなかった');
    for (const pid of parents) {
      const f = await seriesPropInCollection(pid, ctx);
      if (f) return f;
    }
    // (2) 保険: 行の親DB（Medias側）も見る
    if (ctx.mediasColId) {
      return await seriesPropInCollection(ctx.mediasColId, ctx);
    }
    return null;
  }

  // ---------- 再構築 ----------
  const busy = new WeakSet();
  const failedAt = new WeakMap();
  const seriesCache = new Map(); // シリーズページID → 題名（セルをまたいで再利用）
  const seriesIconCache = new Map(); // シリーズページID → アイコン（v0.14.0）

  function colsFor(items) {
    let maxLen = 0;
    for (const it of items) maxLen = Math.max(maxLen, (it.title || '').length);
    for (const rule of TUNING.COLS_RULES) {
      if (maxLen <= rule.maxTitleLen) return rule.cols;
    }
    return 1;
  }

  // ---- クリック前の位置を記憶 → 遷移後に復元（v0.22.0） ----
  // ピークの入口がフルロードである以上、読み込みは消せない。せめて「元の場所」に戻す。
  function scrollerOf(node) {
    let c = node;
    while (c && c !== document.body && c.nodeType === 1) {
      let oy = '';
      try { oy = getComputedStyle(c).overflowY || ''; } catch (e) { oy = ''; }
      if (c.scrollHeight > c.clientHeight + 4 && /auto|scroll|overlay/.test(oy)) {
        const cls = String(c.className || '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
        return { tag: c.tagName.toLowerCase(), cls: cls, top: Math.round(c.scrollTop), left: Math.round(c.scrollLeft) };
      }
      c = c.parentElement;
    }
    return null;
  }
  function saveView(node, id) {
    if (!TUNING.RESTORE_VIEW || !node) return;
    try {
      const s = scrollerOf(node);
      sessionStorage.setItem(TUNING.RESTORE_KEY, JSON.stringify({
        at: Date.now(), from: location.href, id: id || null,
        winY: Math.round(window.scrollY), scroller: s,
      }));
      log('[view] 位置を記憶: scrollTop=' + (s ? s.top + '（' + s.tag + '.' + s.cls.slice(0, 40) + '）' : 'なし') + ' / windowY=' + Math.round(window.scrollY));
    } catch (e) { /* noop */ }
  }
  let restoreDone = false;
  function restoreView() {
    if (!TUNING.RESTORE_VIEW || restoreDone) return;
    let rec = null;
    try { rec = JSON.parse(sessionStorage.getItem(TUNING.RESTORE_KEY) || 'null'); } catch (e) { rec = null; }
    if (!rec || !rec.at) return;
    if (Date.now() - rec.at > TUNING.RESTORE_MAX_AGE_MS) { log('[view] 記録が古いので復元しない'); return; }
    // 同じビューの続き（クエリに ?p= / &pm= が付いただけ）かどうかを確認
    const base = (u) => { try { const x = new URL(u); x.searchParams.delete('p'); x.searchParams.delete('pm'); x.searchParams.delete('v'); return x.toString(); } catch (e) { return u; } };
    if (base(rec.from) !== base(location.href)) { log('[view] 別のビューなので復元しない'); restoreDone = true; return; }
    const apply = () => {
      if (restoreDone) return;
      let ok = false;
      if (rec.scroller && rec.scroller.cls) {
        const sel = rec.scroller.tag + '.' + rec.scroller.cls;
        let cands = [];
        try { cands = Array.from(document.querySelectorAll(sel)); } catch (e) { cands = []; }
        for (const c of cands) {
          if (c.scrollHeight > c.clientHeight + 4) { c.scrollTop = rec.scroller.top; ok = true; break; }
        }
        if (!ok) { // クラスが変わっていた場合の保険: 同じタグの一番大きいスクロール領域
          for (const c of Array.from(document.querySelectorAll(rec.scroller.tag))) {
            if (c.scrollHeight > c.clientHeight + 40) { c.scrollTop = rec.scroller.top; ok = true; break; }
          }
        }
      }
      if (!ok && rec.winY) { window.scrollTo(0, rec.winY); ok = true; }
      if (ok) {
        restoreDone = true;
        log('[view] 位置を復元: ' + (rec.scroller ? 'scrollTop=' + rec.scroller.top : 'windowY=' + rec.winY));
        try { sessionStorage.removeItem(TUNING.RESTORE_KEY); } catch (e) { /* noop */ }
      }
    };
    TUNING.RESTORE_TRIES_MS.forEach((d) => setTimeout(apply, d));
  }

  // 項目クリックの遷移先（v0.18.0）。app.notion.com では素の /<ID> は解決されず
  // 「This page couldn't be found」になるため、アプリと同じ /p/<ID> 形式を使う。
  // いま開いているビューのURLに ?p=<ID>&pm=s を足して、同じタブでサイドピーク表示にする（v0.19.0）。
  // ネイティブのリレーションクリックと同じ「背後にDB・右にページ」の見え方になる。
  function peekUrl(id, pm) {
    const hex = String(id || '').replace(/-/g, '');
    const u = new URL(location.href);
    u.searchParams.set('p', hex);
    if (pm) u.searchParams.set('pm', pm);
    else u.searchParams.delete('pm');
    return u.toString();
  }
  // クリック時の遷移先を決める（CLICK_MODE / CLICK_NEW_TAB を反映）
  function clickTarget(id) {
    const mode = TUNING.CLICK_MODE;
    if (mode === 'page') return pageUrl(id);
    return peekUrl(id, mode === 'peek_center' ? null : 's');
  }

  // ---- リロードさせずにピークを開く試行（v0.20.0 / v0.21.0） ----
  // 本物のチップ（Reactの管理下のノード）を、押した時と同じ順番で踏ませる。
  // これが通ればネイティブと同じ経路＝リロードなしでピークが開く（URL組み立て不要）。
  let SYNTH = 0;  // v0.29.0: 合成クリック中フラグ（自分の余白クリック処理を止める）
  function clickViaNative(node) {
    const opts = { bubbles: true, cancelable: true, view: window, button: 0, buttons: 1, isPrimary: true, pointerId: 1 };
    SYNTH++;
    try {
      node.dispatchEvent(new PointerEvent('pointerdown', opts));
      node.dispatchEvent(new MouseEvent('mousedown', opts));
      node.dispatchEvent(new PointerEvent('pointerup', opts));
      node.dispatchEvent(new MouseEvent('mouseup', opts));
      node.dispatchEvent(new MouseEvent('click', opts));
      return true;
    } catch (e) {
      log('[click] native チップのクリック合成に失敗: ' + (e && e.message ? e.message : e));
      return false;
    } finally {
      // dispatchEvent は同期なので、ここまでに wrap のクリック処理は実行済み。
      SYNTH--;
    }
  }
  // 非表示の <a href=…> を置いて click を dispatch する。Notion はアプリ内リンクを
  // クライアントサイドでルーティングするので、これが拾われれば**リロードなしで**ピークが開く。
  function clickViaAnchor(url) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_self';
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    try {
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, button: 0, buttons: 0 }));
    } finally {
      a.remove();
    }
  }
  // history.pushState + popstate。SPAが popstate を拾えばリロードなしでルートだけ変わる。
  function clickViaHistory(url) {
    history.pushState(history.state, '', url);
    window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
  }
  // ピークの器が増えるのを待つポーリング（v0.23.0）
  function pollPeek(before, hex, from, done, limitMs) {
    const t0 = Date.now();
    const timer = setInterval(() => {
      const ok = !!peekOpened(before, hex) || location.href !== from;
      if (ok || Date.now() - t0 >= limitMs) {
        clearInterval(timer);
        done();
      }
    }, TUNING.PEEK_POLL_MS);
  }

  // anchor で踏ませ、反応が無ければフル遷移（v0.20.0 の 'auto' の中身）
  function tryAnchorThenNavigate(target) {
    const from = location.href;
    log('[click] anchor: アプリ内リンクとして踏ませる（リロードなし狙い） ' + target);
    clickViaAnchor(target);
    setTimeout(() => {
      if (location.href !== from) { log('[click] anchor が拾われた → リロードなしでピーク表示'); return; }
      log('[click] anchor は拾われなかった（' + TUNING.CLICK_FALLBACK_MS + 'ms 変化なし）→ フル遷移にフォールバック');
      location.assign(target);
    }, TUNING.CLICK_FALLBACK_MS);
  }
  // ---- ピーク（サイドピーク）の器が出たかどうかを唯一の成否判定にする（v0.23.0） ----
  // 実測: ネイティブのピークは URL を変えない（?p= も pm も付かない）ので、URL判定は誤りだった。
  function peekRenderers() {
    try {
      // v0.29.0: 非表示の残骸（閉じた後のDOMに残る器）を数えない。
      //   これまでは「クリック前から器=1件」となり、成功判定が常に成立して嘘をついていた。
      return Array.from(document.querySelectorAll('div.notion-peek-renderer, [role="region"][aria-label="Side Peek"]'))
        .filter((r) => {
          if (!r.isConnected) return false;
          let st = null;
          try { st = getComputedStyle(r); } catch (e) { st = null; }
          if (st && (st.display === 'none' || st.visibility === 'hidden')) return false;
          let rc = null;
          try { rc = r.getBoundingClientRect(); } catch (e) { rc = null; }
          if (rc && (rc.width < 40 || rc.height < 40)) return false;
          return true;
        });
    } catch (e) { return []; }
  }
  function peekCount() { return peekRenderers().length; }
  // 器の「中身」の指紋（別ページに差し替わったことを検出するため）
  function peekSig() {
    let sig = '';
    for (const r of peekRenderers()) {
      const h = r.innerHTML || '';
      const t = (r.textContent || '').replace(/\s+/g, ' ').slice(0, 120);
      sig += h.length + ':' + t + '|';
    }
    return sig;
  }
  // 器の中に「そのページ」が表示されているか（ID の出現で判定）
  function peekHasId(hex) {
    if (!hex) return false;
    for (const r of peekRenderers()) {
      const s = (r.innerHTML || '').replace(/-/g, '');
      if (s.indexOf(hex) >= 0) return true;
    }
    return false;
  }
  // クリック前の状態を取る
  function peekState() { return { nodes: peekRenderers(), n: peekCount(), sig: peekSig() }; }
  // クリック後に「ピークが開いた／切り替わった」と言えるか（4系統のOR・v0.24.0）
  function peekOpened(before, hex) {
    const now = peekRenderers();
    if (now.length > before.n) return '器が増えた(' + before.n + '→' + now.length + ')';
    for (const n of now) if (before.nodes.indexOf(n) < 0) return '新しい器ノード';
    if (peekSig() !== before.sig) return '器の中身が変わった';
    if (peekHasId(hex)) return 'IDが器の中に出現';
    return null;
  }
  // 元チップを踏む候補（本体 → その中の role=button → 親）
  function clickCandidates(n) {
    const out = [];
    if (!n) return out;
    out.push(n);
    if (!TUNING.CLICK_CANDIDATES_EXTRA) return out; // v0.25.0: 既定は元チップのみ（親を踏むとピッカーが開く）
    try {
      const b = n.querySelector('[role="button"]');
      if (b && b !== n) out.push(b);
    } catch (e) { /* noop */ }
    if (n.parentElement) out.push(n.parentElement);
    return out;
  }
  // リレーション編集ポップアップ（ピッカー）が開いているか（v0.25.0）
  function pickerDialogOpen() {
    try {
      for (const d of document.querySelectorAll('div[role="dialog"]')) {
        const t = (d.textContent || '');
        if (/selected|Link or create|ページを作成|選択中/i.test(t)) return d;
      }
    } catch (e) { /* noop */ }
    return null;
  }
  function closePickerPopup(force) {
    if (!TUNING.PICKER_GUARD) return false;
    const d = pickerDialogOpen();
    if (!d) return false;
    const sendEsc = () => {
      try {
        const opt = { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true };
        const cur = pickerDialogOpen() || d;
        cur.dispatchEvent(new KeyboardEvent('keydown', opt));
        cur.dispatchEvent(new KeyboardEvent('keyup', opt));
        document.dispatchEvent(new KeyboardEvent('keydown', opt));
      } catch (e) { /* noop */ }
    };
    sendEsc();
    if (force) setTimeout(sendEsc, 250);   // v0.30.0: 追撃（開く直後の1発では閉じないことがある）
    log('[edit] リレーション編集ポップアップを検出 → Esc を送った' + (force ? '（追撃つき）' : ''));
    return true;
  }
  // 最終保険: 実測で確定した形式（?p=<ID>&pm=s）で pushState + popstate（リロードなしを狙う・v0.25.0）
  function tryPushStateThenAnchor(target, hex, before, onFail) {
    const from = location.href;
    try {
      const u = new URL(location.href);
      u.searchParams.set('p', hex);
      u.searchParams.set('pm', 's');
      history.pushState(history.state, '', u.pathname + u.search);
      window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
      log('[click] pushState(?p=<ID>&pm=s) を投げた');
    } catch (e) {
      log('[click] pushState 失敗 ' + (e && e.message ? e.message : e));
    }
    setTimeout(() => {
      // 成否は「そのページがピークの中に見えているか」だけで判定する（v0.29.0 の方針を継続）
      if (peekHasId(hex)) { log('[click] ピークにこのページが表示された（リロードなし）'); return; }
      const why = peekOpened(before, hex);
      if (why && location.href !== from) { log('[click] ピークを検出（リロードなし）: ' + why); return; }
      log('[click] pushState ではピークが出なかった');
      if (typeof onFail === 'function') { onFail(); return; }
      if (TUNING.CLICK_FALLBACK) {
        log('[click] ピークURLへフル遷移（最終手段・位置はv0.22.0の復元が効きます）');
        location.assign(target);
      }
    }, 900);
  }
  // v0.30.0: 「ポップアップは余白クリック／＋ボタンのときだけ」を守るための後始末。
  //   項目クリックの最中に Notion 側が誘発した編集ポップアップが残っていたら閉じる。
  function ensureNoPicker() {
    setTimeout(() => {
      if (!pickerDialogOpen()) return;
      log('[edit] 項目クリックで出たポップアップを検出 → Esc で閉じる（開くのは余白クリックのときだけにするため）');
      closePickerPopup(true);
      setTimeout(() => {
        if (pickerDialogOpen()) log('[edit] ポップアップが閉じなかった（この場合は手動で Esc を押してください）');
      }, 700);
    }, 450);
  }

  // クリックの入口（nativeNode = 画面に出ていた本物のチップ・無い場合あり）
  function openItem(id, forceNewTab, nativeNode, node) {
    const mode = TUNING.CLICK_MODE;
    const target = clickTarget(id);
    closePickerPopup();   // ピッカーが開いていたら先に閉じる（v0.25.0）
    saveView(node, id);   // 遷移（プリロード）前に、いま見ている位置を記憶する（v0.22.0）
    ensureNoPicker();     // 項目クリックで出てしまった編集ポップアップを後始末する（v0.30.0）
    if (forceNewTab || TUNING.CLICK_NEW_TAB) { log('[click] 別タブで開く（修飾キー/TUNING）'); window.open(target, '_blank'); return; }

    if (mode === 'native') {
      const hex = String(id || '').replace(/-/g, '');
      if (peekHasId(hex)) { log('[click] 既にこのページのピークが開いている → 何もしない'); return; }
      const before = peekState();
      const from = location.href;
      // 元チップを合成クリックで踏む経路（v0.30.0: この中で最後まで判定する）
      const nativeAttempt = () => {
        if (!(nativeNode && TUNING.CLICK_NATIVE_REUSE && nativeNode.isConnected)) {
          log('[click] 元チップが無い → ピークURLへフル遷移（最終手段・位置はv0.22.0の復元が効きます）');
          if (TUNING.CLICK_FALLBACK) location.assign(target);
          else log('[click] CLICK_FALLBACK=false なので遷移しない');
          return;
        }
        const cands = clickCandidates(nativeNode);
        log('[click] native: 元チップを踏ませる（ピーク検出で判定） id=' + id + ' / 候補=' + cands.length + '件');
        let ci = 0;
        const tryNext = () => {
          if (location.href !== from) { log('[click] URLが変わった → 遷移した（フルロード）'); return; }
          if (peekHasId(hex)) { log('[click] ピークにこのページが表示されている → 成功（リロードなし）'); return; }
          const why = peekOpened(before, hex);
          if (why) { log('[click] ピークを検出（フルロードなし）: ' + why); return; }
          if (ci >= cands.length) {
            log('[click] 元チップ経路ではピークが出なかった（候補 ' + cands.length + ' 件・見えている器=' + peekCount() + '件）');
            if (TUNING.CLICK_FALLBACK) {
              log('[click] ピークURLへフル遷移（最終手段・位置はv0.22.0の復元が効きます）');
              location.assign(target);
            } else log('[click] CLICK_FALLBACK=false なので遷移しない');
            return;
          }
          const c = cands[ci++];
          closePickerPopup();
          log('[click] 候補 ' + ci + '/' + cands.length + ' を踏む: ' + (c.getAttribute && c.getAttribute('role') ? 'role=' + c.getAttribute('role') : (String(c.className || '').slice(0, 40) || c.tagName)));
          clickViaNative(c);
          pollPeek(before, hex, from, tryNext, TUNING.CLICK_FALLBACK_MS);
        };
        tryNext();
      };
      if (TUNING.CLICK_PRIMARY === 'pushstate') {
        // v0.30.0: 実測（2026-09-23 のログ）で pushState 経路はリロードなし・ポップアップなしで
        //   サイドピークが開くことを確認した。元チップの合成クリックは Notion 側の
        //   リレーション編集ポップアップを誘発するため、次点に落とす。
        log('[click] 第一経路: pushState（リロードなし・ポップアップなし） id=' + id);
        tryPushStateThenAnchor(target, hex, before, nativeAttempt);
        return;
      }
      nativeAttempt();
      return;
    }
    if (mode === 'anchor') { log('[click] anchor 方式で ' + target); clickViaAnchor(target); return; }
    if (mode === 'pushstate') { log('[click] pushState 方式で ' + target); clickViaHistory(target); return; }
    if (mode !== 'auto') { log('[click] フル遷移（' + mode + '）で ' + target); location.assign(target); return; }
    tryAnchorThenNavigate(target);
  }

  function pageUrl(id) {
    const hex = String(id || '').replace(/-/g, '');
    const mode = TUNING.PAGE_URL_MODE;
    if (mode === 'www') return 'https://www.notion.so/' + hex;
    if (mode === 'p') return location.origin + '/p/' + hex;
    if (mode === 'bare') return location.origin + '/' + hex;
    return (location.hostname === 'app.notion.com' ? location.origin + '/p/' : location.origin + '/') + hex;
  }

  // ---- リレーション編集ポップアップを開く入口（v0.28.0） ----
  // 実機の挙動: セルの「チップの無い余白」をクリックすると編集ポップアップが開く。
  //   ネイティブの「開く」ボタンが拾えるならそれを優先する。
  function makeEditBtn() {
    const d = document.createElement('div');
    d.className = 'cordi13-edit';
    d.setAttribute('role', 'button');
    d.setAttribute('title', 'リレーションを編集（ポップアップを開く）');
    d.textContent = TUNING.EDIT_BTN_LABEL;
    return d;
  }
  function openRelationEditor(wrap) {
    const cell = wrap.closest('[data-testid="property-value"]') || wrap;
    if (pickerDialogOpen()) { log('[edit] 既にポップアップが開いている'); return; }
    let btn = null;
    try {
      for (const b of cell.querySelectorAll('[role="button"], button, [aria-label]')) {
        if (String(b.className || '').indexOf('cordi13-') >= 0) continue;
        if (b === wrap) continue;
        const lab = (b.getAttribute('aria-label') || '') + ' ' + (b.getAttribute('title') || '');
        if (/open|edit|編集|開く|expand|展開/i.test(lab)) { btn = b; break; }
      }
    } catch (e) { /* noop */ }
    if (btn) { log('[edit] セルのネイティブ「開く」ボタンを踏む: ' + (btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.tagName)); clickViaNative(btn); }
    else { log('[edit] 余白クリックで開く（セル本体を踏む）'); clickViaNative(cell); }
    setTimeout(() => {
      if (pickerDialogOpen()) log('[edit] リレーション編集ポップアップを開いた');
      else log('[edit] ポップアップが開かなかった（このセルは余白クリックでは開かないタイプかもしれません）');
    }, 500);
  }

  /* v0.43.0: リレーション項目の書体を、Notion 側のどんな指定にも負けない形で当てる。
     インラインの !important はカスケードの最上位なので競合スタイルシートに勝つ。
     この要素はこのスクリプトが作ったもので React が作り直さないため、インラインで安全。 */
  function applyItemFont(node) {
    try {
      /* v1.47.0: ²⁶ Atelier の「リレーション › 書体」があればそれを使う（無ければ従来の書体） */
      const fam = 'var(--atelier-rel-font, ' + TUNING.ITEM_FONT_FAMILY + ')';
      node.style.setProperty('font-family', fam, 'important');
      if (TUNING.ITEM_FONT_SIZE) node.style.setProperty('font-size', TUNING.ITEM_FONT_SIZE, 'important');
      if (TUNING.ITEM_FONT_WEIGHT) node.style.setProperty('font-weight', TUNING.ITEM_FONT_WEIGHT, 'important');
      if (TUNING.ITEM_FONT_LINE_HEIGHT) node.style.setProperty('line-height', TUNING.ITEM_FONT_LINE_HEIGHT, 'important');
      for (const el of Array.from(node.querySelectorAll('*'))) {
        if (el.classList && el.classList.contains('cordi13-emoji')) continue;
        el.style.setProperty('font-family', fam, 'important');
      }
    } catch (e) { /* noop */ }
  }
  /* ============================================================
   *  v0.44.0: アイコンの自己修復
   * ============================================================
   *  初回のリロードでアイコンだけ出ない（2回目は出る）競合があった。
   *  原因は「レコードの書式（アイコンURL）がまだ来ていない」「雛形の画像がまだ読めていない」
   *  のどちらかで、旧版は前者のときにアイコン箱ごと消していた（＝全部消える）。
   *  ここでは、まだ描けていない項目だけを次の順で拾い直す:
   *    ① この項目の実データのアイコンURL  ② その項目の実物チップ（非表示で残してある）の画像
   *    ③ 同じセルで既に描けているアイコン
   *  どれも無い項目は空箱を残さない（＝アイコンが無いページ）。
   * ============================================================ */
  function iconSrcOf(node) {
    if (node.dataset && node.dataset.cordi13Icon) return node.dataset.cordi13Icon;
    const n = node.__cordi13Native;
    if (n && n.querySelector && node.__cordi13NativeExact) {
      const i = n.querySelector('.notion-record-icon img');
      if (i && i.getAttribute('src')) return i.getAttribute('src');
    }
    return '';
  }
  /* v0.47.0: page_icon の値 → 表示の種類。
       ・http(s): / data: / "/icons/…" … そのまま画像
       ・attachment:… … アップロード画像。Notion の画像経由の URL にする
       ・notion://… など他の形式 … ここでは描けない（実物チップの画像に任せる）
       ・それ以外 … 絵文字 */
  function resolveIcon(v, id) {
    const s = String(v || '').trim();
    if (!s) return { kind: 'none' };
    if (/^(https?:|data:|\/)/.test(s)) return { kind: 'url', src: s };
    if (/^attachment:/i.test(s)) return { kind: 'url', src: '/image/' + encodeURIComponent(s) + '?table=block&id=' + encodeURIComponent(id || '') + '&cache=v2' };
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return { kind: 'unknown' };
    return { kind: 'emoji', text: s };
  }
  const normTitle = (t) => String(t || '').replace(/[\s\u00a0]+/g, '').trim();

  /* v0.47.0: 別の項目の画像を予備に使わない（取り違えの原因）。
     描けていない項目は、その項目自身の控え（データ・題名一致の実物チップ）だけで読み直す */
  function repairIcons(wrap) {
    const items = Array.from(wrap.querySelectorAll('.cordi13-item'));
    if (!items.length) return null;
    let set = 0, hidden = 0, failed = 0, pending = 0;
    for (const it of items) {
      const box = it.querySelector('.notion-record-icon');
      if (!box || !box.querySelector('img')) continue;
      const i = box.querySelector('img');
      if (i.complete && i.naturalWidth > 0) continue;               // 描けている
      const cur = i.getAttribute('src') || '';
      if (cur && !i.complete) { pending += 1; continue; }           // 読み込み中は待つ（上書きしない）
      const cands = [];
      const own = iconSrcOf(it);
      if (own) cands.push(own);
      const n = it.__cordi13Native;
      const ni = (n && n.querySelector) ? n.querySelector('.notion-record-icon img') : null;
      if (ni && ni.getAttribute('src') && it.__cordi13NativeExact) cands.push(ni.getAttribute('src'));
      let next = '';
      for (const c of cands) { if (c && c !== cur) { next = c; break; } }
      if (next) {
        i.setAttribute('src', next);
        i.style.removeProperty('display');
        i.style.setProperty('opacity', '1', 'important');
        it.dataset.cordi13Icon = next;
        set += 1;
        continue;
      }
      if (!cur) {
        /* 控えが無い: 枠は残して中身だけ空（行の揃えを崩さない） */
        if (i.style.getPropertyValue('visibility') !== 'hidden') { i.style.setProperty('visibility', 'hidden', 'important'); hidden += 1; }
        continue;
      }
      if (i.complete) failed += 1; else pending += 1;                // 同じURLで失敗／まだ読込中
    }
    if ((set || hidden) && !wrap.__cordi13IconLogged) {
      wrap.__cordi13IconLogged = true;
      log('アイコン: 読み直し ' + set + ' 件 / 空箱 ' + hidden + ' 件' +
        (failed ? ' / 直せず ' + failed + ' 件（URLが無効の可能性）' : '') + (pending ? ' / 読込中 ' + pending + ' 件' : ''));
    }
    return { set: set, hidden: hidden, failed: failed, pending: pending };
  }

  /* v0.43.0: 「いま実際に効いている書体」を実測で確かめる（inspect から呼ぶ）。
     同じ文字列を 指定の書体 / serif / sans-serif で描いて幅を比べる。幅が sans-serif と同じなら
     指定の書体は存在しない＝効いていない、と断定できる。 */
  function probeFont() {
    try {
      const mk = (f) => {
        const el = document.createElement('span');
        el.setAttribute('aria-hidden', 'true');
        el.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;white-space:nowrap;font-size:14px;font-weight:400';
        el.style.fontFamily = f;
        el.textContent = 'あいうえおかきくけこアイウエオ漢字';
        (document.body || document.documentElement).appendChild(el);
        const w = Math.round(el.getBoundingClientRect().width);
        el.remove();
        return w;
      };
      const mine = mk(TUNING.ITEM_FONT_FAMILY);
      const serifW = mk('serif');
      const sansW = mk('sans-serif');
      const cand = [];
      try {
        for (const f of ['Cordivestium Group Header', 'Baskerville', 'Hiragino Mincho ProN', 'Yu Mincho']) {
          if (document.fonts && document.fonts.check) cand.push(f + '=' + (document.fonts.check('14px "' + f + '"') ? 'あり' : 'なし'));
        }
      } catch (e) { /* noop */ }
      return {
        判定: (mine !== sansW ? '指定の書体が効いています' : '効いていません（sans-serif と同じ幅）'),
        実測幅: '指定=' + mine + 'px / serif=' + serifW + 'px / sans-serif=' + sansW + 'px',
        候補: cand.join(' / ')
      };
    } catch (e) { return null; }
  }
  function makeItem(template, it, withSep, nativeNode, label) {
    const node = template.cloneNode(true);
    const iconEl = node.querySelector('.notion-record-icon');
    const img = node.querySelector('.notion-record-icon img');
    const span = node.querySelector('span.notranslate');
    if (span) {
      span.textContent = label || it.title || TUNING.FALLBACK_TITLE;
      span.classList.add('cordi13-title');
    }
    /* v0.38.0: 表示を短くしたとき（共通接頭辞の省略）は、元の題名を title 属性に残す */
    if (label && it.title) node.setAttribute('title', it.title);
    /* v0.44.0: アイコンの解決順を「データ → 実物チップ → 雛形」にした。
       旧版は実データが無いとアイコン箱ごと消していたため、初回のリロードで
       レコードの書式（format）がまだ来ていないとアイコンが全部消えていた。 */
    /* v0.47.0: 実物チップは「題名が一致した時だけ」この項目のものとみなす（並び順の当て推量は使わない） */
    const nativeExact = !!(nativeNode && nativeNode.querySelector && normTitle(chipTitleOf(nativeNode)) === normTitle(it.title));
    const nativeImg0 = nativeExact ? nativeNode.querySelector('.notion-record-icon img') : null;
    const nativeIconSrc = nativeImg0 ? (nativeImg0.getAttribute('src') || '') : '';
    const nativeEmoji = (nativeExact && !nativeImg0) ? String((nativeNode.querySelector('.notion-record-icon') || {}).textContent || '').trim() : '';
    const ri = resolveIcon(it.icon, it.id);
    let iconSrc = '';
    if (iconEl) {
      if (ri.kind === 'emoji' && TUNING.ICON_EMOJI) {
        /* 絵文字アイコン: img の src に入れると必ず壊れるので、文字として出す */
        const em = document.createElement('span');
        em.className = 'cordi13-emoji';
        em.textContent = ri.text;
        iconEl.textContent = '';
        iconEl.style.removeProperty('display');
        iconEl.appendChild(em);
      } else if (!nativeIconSrc && nativeEmoji && TUNING.ICON_EMOJI && ri.kind !== 'url') {
        /* データが描けない形式で、実物チップが絵文字のとき */
        const em = document.createElement('span');
        em.className = 'cordi13-emoji';
        em.textContent = nativeEmoji;
        iconEl.textContent = '';
        iconEl.style.removeProperty('display');
        iconEl.appendChild(em);
      } else {
        /* v0.47.0: 雛形（先頭チップ）の画像は使わない。この項目自身のデータ → 題名一致の実物チップ */
        iconSrc = ri.kind === 'url' ? ri.src : nativeIconSrc;
        if (img && iconSrc) {
          const cur = (img.getAttribute('src') || '').split('?')[0];
          const next = iconSrc.split('?')[0];
          if (cur !== next) img.setAttribute('src', iconSrc);
          try { img.loading = 'eager'; img.decoding = 'sync'; } catch (e) { /* noop */ }
          img.style.removeProperty('display');
          img.style.setProperty('opacity', '1', 'important');
          img.style.setProperty('transition', 'none', 'important');
          img.style.setProperty('visibility', 'visible', 'important');
        } else if (img) {
          img.removeAttribute('src');                                     // 雛形の画像を残さない
          img.removeAttribute('srcset');
          if (it.recOk && ri.kind === 'none') {
            iconEl.style.setProperty('display', 'none', 'important');     // 本当にアイコンが無いページ
          } else {
            img.style.setProperty('visibility', 'hidden', 'important');   // まだ分からない: 枠だけ残す
          }
        }
      }
    }
    if (iconSrc) node.dataset.cordi13Icon = iconSrc;   // v0.44.0: 修復で使う控え
    if (TUNING.ITEM_FONT) applyItemFont(node);   // v0.43.0: 書体を当てる
    node.classList.add('cordi13-item');
    if (withSep) node.classList.add('cordi13-item-sep');
    node.dataset.cordi13Id = it.id;
    if (nativeNode) node.__cordi13Native = nativeNode;
    node.__cordi13NativeExact = nativeExact;
    // 元チップは非表示にして残す（Reactの管理下のまま）→ native クリックで踏ませる
    node.addEventListener('click', (e) => {
      if (e.button !== 0) return;
      // v0.28.0: セルへ伝播させない。伝播すると Notion が「余白クリック」と解釈して
      //   リレーション編集ポップアップ（22 selected / Link or create a page…）が開いてしまう。
      e.preventDefault();
      e.stopPropagation();
      // 修飾キー付き / 中クリック相当は、ブラウザ標準どおり別タブで開く
      openItem(it.id, e.metaKey || e.ctrlKey || e.shiftKey || e.altKey, node.__cordi13Native || null, node);
    });
    return node;
  }

  function makeSecHead(name, icon, sec) {
    const d = document.createElement('div');
    d.className = 'cordi13-sec-head';
    /* v1.47.0: クリックで題名とアイコンを編集（元の題名・アイコンを控えておく） */
    if (sec) {
      d.dataset.cgKey = sec.key;
      d.__cg = { key: sec.key, name: sec.name, icon: sec.standalone ? '' : (sec.iconOrig || '') };
      d.title = 'クリックで題名とアイコンを編集';
    }
    if (TUNING.SEC_HEAD_ICON && icon) {
      const s = String(icon);
      let el;
      const r = resolveIcon(s, '');
      if (r.kind === 'unknown') { /* 描けない形式は出さない */ }
      else if (r.kind === 'url') {
        el = document.createElement('img');
        el.className = 'cordi13-sec-icon';
        el.setAttribute('src', r.src);
        el.setAttribute('alt', '');
      } else {
        el = document.createElement('span'); // 絵文字アイコン
        el.className = 'cordi13-sec-icon';
        el.textContent = s;
      }
      if (el) d.appendChild(el);
    }
    const t = document.createElement('span');
    t.textContent = name;
    d.appendChild(t);
    return d;
  }
  function makeSecDiv() {
    const d = document.createElement('div');
    d.className = 'cordi13-sec-div';
    return d;
  }
  // 見出しの下線 -> 最初の項目 の余白は、margin ではなく高さを持つ実体要素で取る（v0.17.0）。
  // margin は周囲の文脈で打ち消されることがあり、TUNING をいくら振っても見た目が動かなかった。
  function makeSecGap() {
    const d = document.createElement('div');
    d.className = 'cordi13-sec-gap';
    return d;
  }

  /* ============================================================
   *  v0.35.0: 1行パイプ表示の部品とCSS
   * ============================================================ */
  const PIPE_STYLE_ID = 'cordi13-pipe-style';
  const PIPE_CSS = [
    '.cordi13-pipe {',
    '  display: flex !important;',
    '  flex-direction: row !important;',
    '  flex-wrap: wrap !important;',     /* v0.39.0: 入りきらなければ折返す（題名を潰さない） */
    '  align-items: center !important;',
    '  flex: 0 0 100% !important;',      /* v0.38.0: 必ず1行ぶんを占める */
    '  width: 100% !important;',
    '  min-width: 0 !important;',
    '  gap: 0 !important;',
    '  overflow: visible !important;',  /* v0.39.0: 折返すので切らない（重ねない） */
    '}',
    '/* v0.39.0: PIPE_FIT=false のときだけ1行固定（見切れ許容） */',
    '[data-cordi13-nowrap] .cordi13-pipe {',
    '  flex-wrap: nowrap !important;',
    '  overflow: hidden !important;',
    '}',
    '.cordi13-pipe .cordi13-item {',
    '  display: inline-flex !important;',   /* v0.37.0: アイコンと文字を必ず同じ行に */
    '  align-items: center !important;',
    '  flex: 0 0 auto !important;',   /* v0.39.0: 縮めない＝潰さない（潰れるくらいなら折返す） */
    '  min-width: 0 !important;',
    '  max-width: 100% !important;',
    '  overflow: hidden !important;',
    '  white-space: nowrap !important;',
    '  margin: 0 !important;',
    '}',
    '.cordi13-pipe .cordi13-item * {',
    '  white-space: nowrap !important;',   /* v0.37.0: 文字がアイコンの下へ落ちるのを防ぐ */
    '}',
    '/* v0.38.0: アイコンと文字を1本の行に固定（雛形の display:inline を打ち消す） */',
    '.cordi13-pipe .cordi13-item > div {',
    '  display: flex !important;',
    '  align-items: center !important;',
    '  min-width: 0 !important;',
    '  margin: 0 !important;',
    '}',
    '.cordi13-pipe .cordi13-item .notion-record-icon {',
    '  flex: 0 0 auto !important;',
    '  margin-inline-end: 4px !important;', /* v0.37.0: アイコンと文字の間隔 */
    '}',
    '.cordi13-pipe .cordi13-item .cordi13-title {',
    '  display: block !important;',       /* v0.38.0: 省略記号(…)を効かせるにはブロック箱が要る */
    '  white-space: nowrap !important;',
    '  overflow: hidden !important;',
    '  text-overflow: ellipsis !important;',
    '  min-width: 0 !important;',
    '}',
    '.cordi13-pipe-sep {',
    '  flex: 0 0 auto !important;',
    '  width: 1px !important;',
    '  height: 14px !important;',        /* v0.36.0: stretch をやめて高さ固定 */
    '  align-self: center !important;',
    '  background: ' + TUNING.SECTION_DIVIDER_COLOR + ' !important;',
    '  margin: 0 ' + TUNING.PIPE_GAP_PX + 'px !important;',
    '}',
    '.cordi13-pipe-sep-text {',
    '  width: auto !important;',
    '  background: none !important;',
    '  opacity: 0.45 !important;',
    '  margin: 0 4px !important;',
    '}'
  ].join('\n');

  function ensurePipeStyle() {
    let s = document.getElementById(PIPE_STYLE_ID);
    if (s) return s;
    s = document.createElement('style');
    s.id = PIPE_STYLE_ID;
    s.textContent = PIPE_CSS;
    (document.head || document.documentElement).appendChild(s);
    return s;
  }
  function makePipeSep() {
    if (TUNING.PIPE_SEPARATOR === 'text') {
      const t = document.createElement('span');
      t.className = 'cordi13-pipe-sep cordi13-pipe-sep-text';
      t.textContent = TUNING.PIPE_SEPARATOR_TEXT;
      return t;
    }
    const d = document.createElement('span');
    d.className = 'cordi13-pipe-sep';
    return d;
  }

  /* v0.35.0: 再インストール無しでしきい値を変えて再判定する。
     例: __c13.tune({ MIN_ITEMS_GATE: 2 }) / __c13.tune({ GATE_MODE: 'legacy' })
         __c13.tune({ PIPE_SEPARATOR: 'text' }) / __c13.tune({ PIPE_ONELINE: false }) */
  function tune(patch) {
    if (!patch || typeof patch !== 'object') { console.log('[C13] 現在の設定', TUNING); return TUNING; }
    for (const k of Object.keys(patch)) {
      if (!(k in TUNING)) { console.warn('[C13] 未知のキー: ' + k); continue; }
      TUNING[k] = patch[k];
    }
    const n = cleanupInjected();
    try {
      document.querySelectorAll('[data-cordi13-pipe]').forEach((el) => el.removeAttribute('data-cordi13-pipe'));
    } catch (e) { /* noop */ }
    sweep();
    log('設定を更新して再判定しました（撤去 ' + n + ' 箇所）: ' + JSON.stringify(patch) + ' → __c13.report() で確認');
    return TUNING;
  }

  /* v0.38.0: セクション内の全項目に共通する接頭辞の長さを返す（2文字以上・
     どの項目も1文字以上残るときだけ）。見出し（シリーズ名）が同じ語を出しているので、
     パイプの値は「違い」だけ見えればよい（例「マスカレード・ホテル」→「ホテル」）。 */
  function commonPrefixTitles(items) {
    if (!TUNING.PIPE_STRIP_PREFIX || !items || items.length < 2) return 0;
    const titles = items.map((it) => String(it.title || ''));
    if (titles.some((t) => !t)) return 0;
    const first = titles[0];
    let n = 0;
    while (n < first.length) {
      const ch = first[n];
      if (!titles.every((t) => t.length > n + 1 && t[n] === ch)) break;  // 残り1文字は必ず残す
      n += 1;
    }
    return n >= 2 ? n : 0;
  }

  async function rebuildWrap(wrap, hasChip) {
    const cell = wrap.closest('[data-testid="property-value"]');
    if (!cell) return;
    const rowBlockId = findBlockId(cell);
    if (!rowBlockId) { log('block-id が取れないのでスキップ'); return; }

    const before = relKidsOf(wrap);
    const template = before.rels[0].cloneNode(true);
    // 画面に出ていた本物のチップを引けるようにする（v0.21.0 → v0.26.0 で収集を修正）
    // v0.26.0: 自分で非表示にした元チップ（data-cordi13-native="1"）も必ず対象に含める。
    //   表示中のチップだけを見ていたため、再構築のたびに自分で隠したチップを見失っていた。
    const norm = (s) => String(s || '').replace(/[\s\u00a0]+/g, '').trim();
    // ---- ネイティブチップの収集（v0.28.0 で作り直し）----
    // v0.26 の厳密条件（div[style*="display: inline"] 直下）はチップを取りこぼす。
    // 実測（v0.27.0）では 22件中10件しか引けず、引けない項目は anchor/pushState に落ちていた。
    // → 「.notion-record-icon を持つ wrap の直下要素」を広く拾い、並び順を本命の対応付けにする。
    const isChipLike = (k) => {
      if (!k || k.nodeType !== 1) return false;
      if (String(k.className || '').indexOf('cordi13-') >= 0) return false;
      if (!k.querySelector) return false;
      // アイコンが無いページもあるので、題名ノードでも可とする（v0.29.0）
      if (!k.querySelector('.notion-record-icon') && !k.querySelector('span.notranslate')) return false;
      const txt = (k.textContent || '').trim();
      if (!txt) return false;
      if (/^\+\s*\d+$/.test(txt)) return false;   // 「+N」はチップではない
      return true;
    };
    let nativeList = Array.from(wrap.children).filter(isChipLike);
    if (!nativeList.length) {
      // 入れ子になっている版のNotion向けの保険（1階層下まで見る）
      for (const c of Array.from(wrap.children)) {
        for (const g of Array.from(c.children)) if (isChipLike(g)) nativeList.push(g);
      }
    }
    const cacheMap = (wrap.__cordi13natives instanceof Map) ? wrap.__cordi13natives : new Map();
    const nativeByTitle = new Map();
    const nativeByNorm = new Map();
    for (const n of nativeList) {
      const t = chipTitleOf(n);
      if (t && !nativeByTitle.has(t)) nativeByTitle.set(t, n);
      if (t && !nativeByNorm.has(norm(t))) nativeByNorm.set(norm(t), n);
    }
    for (const [k, v] of cacheMap) {   // 前回の対応表（Reactが作り直しても引けるように）
      if (!v || !v.isConnected) continue;
      if (!nativeByTitle.has(k)) nativeByTitle.set(k, v);
      if (!nativeByNorm.has(norm(k))) nativeByNorm.set(norm(k), v);
    }
    wrap.__cordi13natives = nativeByTitle;
    log('[click] ネイティブチップ ' + nativeList.length + ' 件（wrap直下 ' + wrap.children.length +
      ' 要素）: ' + nativeList.slice(0, 24).map((n) => '"' + String(chipTitleOf(n) || '?').slice(0, 14) + '"').join(' '));
    // 対応付けの優先順: 題名一致 → 正規化一致 → 並び順（同じ関係リスト由来なので最も確実）。
    // v0.27.0 の教訓: `visible` / `uniq` はこの位置では未宣言（TDZ）。参照は「呼ばれた時」にだけ行う。
    let unmappedCount = 0;
    let __order = null;          // id → APIの並び順
    let __idxLogged = false;
    const resolveNative = (it) => {
      const exact = nativeByTitle.get(it.title);
      if (exact && exact.isConnected) return exact;
      const near = nativeByNorm.get(norm(it.title));
      if (near && near.isConnected) return near;
      if (!TUNING.CLICK_NATIVE_INDEX_FALLBACK || !nativeList.length) return null;
      if (__order === null) {
        __order = new Map();
        uniq.forEach((id, i2) => __order.set(id, i2));
      }
      const pick = (list, i2) => (i2 === undefined || i2 < 0 || !list[i2]) ? null : list[i2];
      let cand = null;
      if (nativeList.length === uniq.length) cand = pick(nativeList, __order.get(it.id));
      else if (nativeList.length === visible.length) cand = pick(nativeList, visible.indexOf(it));
      if (cand) {
        if (!__idxLogged) {
          __idxLogged = true;
          log('[click] 題名で引けないため並び順で対応（ネイティブ' + nativeList.length + '件 / 項目' + uniq.length + '件）');
        }
      } else if (it) {
        unmappedCount++;
        if (unmappedCount <= 8) {
          log('[click] 対応できず（この項目はピークに開けない）: "' + String(it.title || '?').slice(0, 22) + '"');
        }
      }
      return cand;
    };

    const row = await fetchBlock(rowBlockId);
    if (!row) return;
    // 処理中にセルの状態が変わったら中断（次回スキャンでやり直し）
    if (!wrap.isConnected || hasChipKid(wrap) !== hasChip) { log('セルが作り直されたので中断（次回スキャンでやり直し）'); return; }

    const props = row.properties || {};
    const groups = Object.entries(props)
      .map(([key, v]) => ({ key, ids: parseRelIds(v) }))
      .filter((g) => g.ids.length)
      .sort((a, b) => b.ids.length - a.ids.length);
    if (!groups.length) { log('API側に関係が無いのでスキップ'); markNative(wrap); return; }
    const group = groups[0];
    if (groups.length > 1) {
      log('関係プロパティが複数（' + groups.map((g) => g.key).join(', ') + '）→ 最大の ' + group.key + ' を使用');
    }

    const uniq = Array.from(new Set(group.ids));
    const recs = await fetchBlocks(uniq);
    if (!recs.size) { log('関係ページの取得に失敗（API応答なし）→ クールダウン後リトライ'); return; }
    if (!wrap.isConnected || hasChipKid(wrap) !== hasChip) { log('セルが作り直されたので中断（次回スキャンでやり直し）'); return; }

    // シリーズ解決（v0.7.0: 本側DBの schema から探す・無ければ Medias 側の保険）
    const seriesInfo = await findSeriesProp(recs, uniq, row, group.key);
    const seriesRef = new Map(); // 本ID → parseSeriesValue の結果
    const seriesPageIds = [];
    if (seriesInfo) {
      // 生値サンプルを1件（キー不在の検知用）
      for (const id of uniq) {
        const r = recs.get(id);
        if (!r || !r.properties) continue;
        if (!(seriesInfo.key in r.properties)) {
          log('[series] 注意: この関係先ページに key="' + seriesInfo.key + '" が存在しない（関係先が複数DBにまたがる可能性。キー一覧: ' +
            Object.keys(r.properties).join(', ') + '）');
        }
        break;
      }
      for (const id of uniq) {
        const r = recs.get(id);
        const v = r && r.properties ? r.properties[seriesInfo.key] : null;
        const parsed = parseSeriesValue(v);
        seriesRef.set(id, parsed);
        if (parsed && parsed.kind === 'page') seriesPageIds.push(parsed.raw);
      }
    }
    const seriesRecs = seriesPageIds.length
      ? await fetchBlocks(Array.from(new Set(seriesPageIds)))
      : new Map();

    const items = uniq.map((id) => {
      const rec = recs.get(id);
      let series = null;
      const ref = seriesRef.get(id);
      if (ref && ref.kind === 'page') {
        if (seriesCache.has(ref.raw)) series = seriesCache.get(ref.raw);
        else {
          const sr = seriesRecs.get(ref.raw);
          const t = sr ? recTitle(sr) : null;
          if (t) {
            seriesCache.set(ref.raw, t);
            seriesIconCache.set(ref.raw, (sr.format && sr.format.page_icon) ? sr.format.page_icon : null);
            series = t;
          }
        }
      } else if (ref && ref.kind === 'text') {
        series = ref.raw;
      }
      let seriesIcon = null;
      if (ref && ref.kind === 'page' && seriesIconCache.has(ref.raw)) seriesIcon = seriesIconCache.get(ref.raw);
      return {
        id,
        title: rec ? recTitle(rec) : null,
        icon: rec && rec.format && rec.format.page_icon,
        recOk: !!rec,
        series,
        seriesIcon,
        sid: ref && ref.kind === 'page' && series ? ref.raw : '',   // v1.47.0: グループの鍵（シリーズのページ）
      };
    });

    if (seriesInfo) {
      const setCount = items.filter((it) => it.series).length;
      log('[series] DB=' + seriesInfo.db + ' key="' + seriesInfo.key + '" type=' + seriesInfo.type +
        ' 設定済み ' + setCount + '/' + items.length +
        (setCount === 0 ? '  ← プロパティはあるが、このセルの本には未設定（全員「' + TUNING.STANDALONE_LABEL + '」になる）' : ''));
    }

    // ゴースト（無題ページ）の非表示: 表示レベルの除去。完全除去は Medias 側で削除。
    let visible = items;
    if (TUNING.HIDE_UNTITLED) {
      const ghosts = items.filter((it) => !it.title);
      if (ghosts.length && ghosts.length < items.length) {
        visible = items.filter((it) => it.title);
        log('無題ページ（ゴースト）を ' + ghosts.length + ' 件スキップ');
      }
    }
    if (!visible.length) { log('表示できる関係が無いのでスキップ'); markNative(wrap); return; }

    // ---- 発動ゲート（v0.31.0）: 判定の根拠を「文字数」から「件数」へ移した。
    //  ・+Nチップ付き（＝10件超でNotionが出す）は無条件で発動。
    //  ・チップ無しは「表示できる項目が MIN_ITEMS_GATE 件以上」なら発動（既定 2）。
    //    1件しか無いセルは、そもそも並べて見せる意味が無い。
    //    人名（作家）のような短い1件セルがここで落ちるので、文字数を見る必要が無くなる。
    //  ・USE_CHARS_GATE:true にすれば旧・文字数ゲートも併用（AND）。
    let maxLen = 0;
    let widest = 0;
    let fullSum = 0;
    let halfSum = 0;
    for (const it of visible) {
      const t = String(it.title || '');
      if (t.length > maxLen) maxLen = t.length;
      const m = charMetrics(t);
      fullSum += m.full;
      halfSum += m.half;
      if (m.equiv > widest) widest = m.equiv;
    }
    const equivSum = fullSum + halfSum * 0.5;   // 全角換算（合計）
    const hasSeriesDB = Boolean(seriesInfo && seriesInfo.type === 'relation');
    const countOk = visible.length >= TUNING.MIN_ITEMS_GATE;
    const widthOk = equivSum >= TUNING.MIN_WIDTH_EQUIV;
    const charsOk = TUNING.USE_CHARS_GATE ? maxLen >= TUNING.MIN_CHARS_GATE : true;
    const seriesOk = TUNING.REQUIRE_SERIES_DB ? hasSeriesDB : true;
    const mode = TUNING.GATE_MODE;
    const legacyOk = maxLen >= TUNING.MIN_CHARS_GATE;   // v0.30.0 と同一の判定
    let policyOk;
    if (mode === 'legacy') policyOk = legacyOk;
    else if (mode === 'width') policyOk = widthOk;
    else if (mode === 'both') policyOk = countOk && widthOk;
    else if (mode === 'either') policyOk = legacyOk || countOk || widthOk;   // v0.35.0: v0.30.0 の文字数判定を包含
    else policyOk = countOk;
    const gate = hasChip || (policyOk && charsOk && seriesOk);

    /* 判定の根拠を1行で（全角/半角/全角換算まで出す。閾値調整はこの行を見て決める） */
    log('[gate] チップ=' + (hasChip ? '有' : '無') + ' 件数=' + visible.length +
      ' 最長=' + maxLen + '字 全角=' + fullSum + ' 半角=' + halfSum +
      ' 全角換算=' + equivSum + '（最長項目 ' + widest + '）' +
      ' シリーズDB=' + (hasSeriesDB ? '有' : '無') +
      ' モード=' + mode + '（legacy:最長>=' + TUNING.MIN_CHARS_GATE + '字 / 件数>=' + TUNING.MIN_ITEMS_GATE + ' / 幅>=' + TUNING.MIN_WIDTH_EQUIV + '）' +
      ' → ' + (gate ? '発動' : '不発（ネイティブのまま：' +
        (!policyOk ? (mode === 'legacy' ? '最長題名 ' + maxLen + '字 < ' + TUNING.MIN_CHARS_GATE : mode === 'count' ? '件数 ' + visible.length + ' < ' + TUNING.MIN_ITEMS_GATE :
                      mode === 'width' ? '幅 ' + equivSum + ' < ' + TUNING.MIN_WIDTH_EQUIV :
                      '件数と幅の条件') : (!charsOk ? '文字数ゲート' : 'シリーズDB無し')) + '）'));

    /* 表に出すための記録（セル単位・上書き） */
    try {
      GATE_ROWS.set(wrap, {
        セル: String((visible[0] && visible[0].title) || (items[0] && items[0].title) || '').slice(0, 24),
        件数: visible.length,
        最長字数: maxLen,
        全角: fullSum,
        半角: halfSum,
        全角換算: equivSum,
        最長項目換算: widest,
        チップ: hasChip ? '有' : '無',
        シリーズDB: hasSeriesDB ? '有' : '無',
        モード: mode,
        判定: gate ? '発動' : '不発',
        理由: gate ? (hasChip ? 'チップ付き' : 'ポリシー') : 'しきい値未満'
      });
    } catch (e) { /* noop */ }
    if (!gate) {
      markNative(wrap); // v0.46.0: 不発済み＋中身の署名を記憶（同じ中身なら判定し直さない）
      return;
    }

    // グループ化（初出順・単行は最後）。セクションが1つでも再構築する（v0.6.0）。
    let sections = [];
    const byName = new Map();
    for (const it of visible) {
      const standalone = !it.series;
      const name = it.series || TUNING.STANDALONE_LABEL;
      if (!byName.has(name)) { const sec = { name, icon: standalone ? null : (it.seriesIcon || null), sid: standalone ? '' : (it.sid || ''), standalone, items: [] }; byName.set(name, sec); sections.push(sec); }
      byName.get(name).items.push(it);
    }
    const stIdx = sections.findIndex((s) => s.standalone);
    if (stIdx >= 0 && stIdx !== sections.length - 1) {
      const st = sections.splice(stIdx, 1)[0];
      sections.push(st);
    }
    /* v1.47.0: 本の移動・見出しの題名とアイコンの差し替え（²³ と共通の設定） */
    sections.forEach((sc) => { sc.iconOrig = sc.icon || ''; });
    sections = CG.regroup(sections, TUNING.STANDALONE_LABEL);
    const showHeaders = true; // 1セクションでも見出しを出す → 発動が必ず画面で確認できる

    // 列数: 最長題名で階段判定。グリッドは 10超かつ 2列以上のとき（それ以下は折返しのまま）。
    const cols = colsFor(visible);
        const usePipe = TUNING.PIPE_ONELINE && visible.length >= TUNING.PIPE_MIN_ITEMS &&
          visible.length <= TUNING.PIPE_MAX_ITEMS;   // v0.36.0: 多すぎるセルは1行に収まらないので従来の並びへ
    const useGrid = !usePipe && visible.length > TUNING.MULTI_THRESHOLD && cols >= 2;
    if (useGrid) {
      wrap.setAttribute('data-cordi13-cols', String(cols));
      wrap.style.setProperty('grid-template-columns', 'repeat(' + cols + ', minmax(0, 1fr))', 'important');
    } else {
      wrap.removeAttribute('data-cordi13-cols');
      wrap.style.removeProperty('grid-template-columns');
    }

    wrap.style.setProperty('position', 'relative', 'important');   // ＋ボタンの基準（v0.28.0）
    wrap.setAttribute('data-cordi13-on', '1');                     // v0.43.0: 書体CSSの詳細度アンカー
    const frag = document.createDocumentFragment();
    /* v0.35.0: 3件以上は「1行パイプ」表示（〇〇〇〇｜〇〇〇〇｜〇〇〇〇）。
       シリーズ見出しもグリッドも使わず、値だけを1行に並べて縦線で区切る。 */
    if (usePipe) {
      wrap.setAttribute('data-cordi13-pipe', '1');
      ensurePipeStyle();
      let made = 0;
      for (let si = 0; si < sections.length; si++) {
        const sec = sections[si];
        /* v0.37.0: 見出し（「単行」など）を必ず出す。消えると「本来は単行って出るのに出ない」になる。 */
        if (TUNING.PIPE_SHOW_HEADERS) { frag.appendChild(makeSecHead(sec.label, sec.icon, sec)); frag.appendChild(makeSecGap()); }
        const pipe = document.createElement('div');
        pipe.className = 'cordi13-pipe';
        /* v0.38.0: セクション内の共通接頭辞を落とす（見切れ対策。見出しが同じ語を出している） */
        const cut = commonPrefixTitles(sec.items);
        if (cut) {
          log('パイプ: 「' + sec.name + '」の共通接頭辞 ' + cut + ' 字を省略（例 "' +
            String(sec.items[0].title || '') + '" → "' + String(sec.items[0].title || '').slice(cut) + '"・元の題名はマウスを乗せると出ます）');
        }
        for (const it of sec.items) {
          if (pipe.childElementCount) pipe.appendChild(makePipeSep());
          const label = cut ? String(it.title || '').slice(cut) : null;
          pipe.appendChild(makeItem(template, it, false, resolveNative(it), label));
        }
        made += pipe.childElementCount;
        frag.appendChild(pipe);
        if (TUNING.PIPE_SHOW_HEADERS && TUNING.SECTION_DIVIDER && si < sections.length - 1) frag.appendChild(makeSecDiv());
      }
      if (!made) { log('パイプ表示にする項目が無いのでスキップ'); return; }
    } else {
      wrap.removeAttribute('data-cordi13-pipe');
      for (let si = 0; si < sections.length; si++) {
        const sec = sections[si];
        if (showHeaders) { frag.appendChild(makeSecHead(sec.label, sec.icon, sec)); frag.appendChild(makeSecGap()); }
        sec.items.forEach((it, i) => {
          frag.appendChild(makeItem(template, it, useGrid && i % cols > 0, resolveNative(it)));
        });
        if (showHeaders && TUNING.SECTION_DIVIDER && si < sections.length - 1) {
          frag.appendChild(makeSecDiv());
        }
      }
    }

    // 元のチップは消さずに非表示で残す（Reactの管理下に置いたままクリックを踏ませるため）。
    // 以前の版は wrap.textContent='' で消していたので、ネイティブのクリック経路が失われていた。
    for (const el of Array.from(wrap.children)) {
      if (el.classList && String(el.className).indexOf('cordi13-') === 0) { el.remove(); continue; }
      if (TUNING.CLICK_NATIVE_REUSE) {
        el.setAttribute('data-cordi13-native', '1');   // v0.26.0: 収集時に見失わないための印
        el.style.setProperty('display', 'none', 'important');
      }
      else el.remove();
    }
    frag.appendChild(makeEditBtn());
    wrap.appendChild(frag);
    /* v0.44.0: アイコンの自己修復を仕込む（初回描画で出ない競合への対策） */
    if (TUNING.ICON_REPAIR) {
      const runIcon = () => { try { repairIcons(wrap); } catch (e) { /* noop */ } };
      requestAnimationFrame(runIcon);
      TUNING.ICON_REPAIR_DELAYS_MS.forEach((d) => setTimeout(runIcon, d));
      try { window.addEventListener('load', runIcon, { once: true }); } catch (e) { /* noop */ }
    }
    /* v0.39.0: 折返しは CSS が自動でやる（項目は flex:0 0 auto なので縮まない＝題名が潰れない）。
       ここは「何行になったか」「それでも溢れているか」を測って報告するだけ。
       PIPE_FIT:false のときは1行固定（見切れ許容）へ切り替える。 */
    if (usePipe) {
      if (TUNING.PIPE_FIT) wrap.removeAttribute('data-cordi13-nowrap');
      else wrap.setAttribute('data-cordi13-nowrap', '1');
      requestAnimationFrame(() => {
        try {
          let wrappedLines = 0;
          for (const p of Array.from(wrap.querySelectorAll('.cordi13-pipe'))) {
            const items = Array.from(p.children).filter((c) => c.classList && c.classList.contains('cordi13-item'));
            const tops = new Set(items.map((c) => Math.round(c.getBoundingClientRect().top)));
            p.setAttribute('data-cordi13-lines', String(tops.size));
            if (tops.size > 1) wrappedLines += 1;
            /* 折返しても溢れるのは「1件だけで枠より長い」ときだけ（その項目のみ … で省略） */
            if (p.scrollWidth > p.clientWidth + 1) p.setAttribute('data-cordi13-overflow', '1');
            else p.removeAttribute('data-cordi13-overflow');
          }
          if (wrappedLines && !wrap.__cordi13FitLogged) {
            wrap.__cordi13FitLogged = true;
            log('パイプ: 幅が足りないので折返し（' + wrappedLines + ' 本）。題名は潰さず全部出しています');
          }
        } catch (e) { /* noop */ }
      });
    }
    // v0.28.0: 項目以外（見出し・区切り・余白・＋ボタン）のクリックを編集ポップアップに使う。
    //   項目のクリックは makeItem 側で stopPropagation しているので、ここには届かない。
    if (!wrap.__cordi13EditBound) {
      wrap.__cordi13EditBound = true;
      wrap.addEventListener('click', (e) => {
        if (SYNTH > 0) return;                       // 合成クリック（元チップ・セル本体）は無視
        const t = e.target;
        if (!t || !t.closest) return;
        if (t.closest('.cordi13-item')) return;                       // 項目 → ピークを開く
        const head = t.closest('.cordi13-sec-head');                  // v1.47.0: 見出し → 題名とアイコンの編集
        if (head && head.__cg) {
          e.preventDefault();
          e.stopPropagation();
          CG.openEditor({ key: head.__cg.key, name: head.__cg.name, icon: head.__cg.icon, anchor: head });
          return;
        }
        if (t.closest('[data-cordi13-native="1"]')) return;           // 元チップ
        if (t.closest('.notion-record-icon')) return;                 // アイコン
        const mine = String(t.className || '').indexOf('cordi13-') >= 0;  // 自分が作った見出し・区切り・＋
        const inCell = !!t.closest('[data-testid="property-value"]');
        if (!mine && t !== wrap && !inCell) return;
        e.preventDefault();
        e.stopPropagation();
        openRelationEditor(wrap);
      }, false);
    }
    wrap.dataset.cordi13Done = '1'; // 再処理防止（Reactが作り直せば自動でやり直す）
    forgetNative(wrap);             // v0.46.0: 発動したので「不発」の記憶から外す
    const secSummary = sections.map((s) => s.name + '(' + s.items.length + ')').join(' ');
    const layout = usePipe ? ('1行パイプ(' + visible.length + '件)') : (useGrid ? (cols + '列グリッド') : (cols >= 2 ? '折返し' : '縦積み'));
    if (TUNING.CLICK_MODE === 'native') {
      const covered = visible.filter((it) => !!resolveNative(it)).length;
      log('[click] 元チップ対応: ' + covered + '/' + visible.length + ' 件（ネイティブ' + nativeList.length +
        '件 / ネイティブ総数と全項目' + uniq.length + '件・未対応 ' + (visible.length - covered) + ' 件は pushState 方式）');
    }
    log('再構築: ' + visible.length + ' 件 / ' + layout +
      ' / セクション: ' + secSummary +
      '（' + (title0(recs, uniq) || '-') + ' ほか）');
  }
  function title0(recs, ids) {
    for (const id of ids) { const r = recs.get(id); if (r) { const t = recTitle(r); if (t) return t; } }
    return null;
  }

  // ---------- スキャン ----------
  /* ============================================================
   *  v0.34.0: 旧版が残した注入DOMの掃除
   * ============================================================
   *  ゲート判定を変えた／スクリプトを差し替えたとき、前の版が再構築したセルは
   *  data-cordi13-done が付いているため再判定されず、「もう通らないはずの
   *  セルに古い再構築結果が残る」ことがあった（＝消したはずの表示が残る）。
   *  起動時に一度、注入した中身を撤去して元チップを戻し、判定をやり直す。
   * ============================================================ */
  function cleanupInjected() {
    let n = 0;
    try {
      /* (1) 注入した中身（cordi13-*）を撤去し、再判定できるようにフラグを落とす */
      const wraps = document.querySelectorAll('[data-cordi13-cols], [data-cordi13-done], [data-cordi13-pipe]');
      for (const wrap of wraps) {
        for (const gone of Array.from(wrap.querySelectorAll('[class*="cordi13-"]'))) gone.remove();
        for (const ch of Array.from(wrap.children)) {
          if (ch.className && String(ch.className).indexOf('cordi13-') >= 0) ch.remove();
        }
        wrap.removeAttribute('data-cordi13-cols');
        wrap.removeAttribute('data-cordi13-pipe');
        if (wrap.dataset) delete wrap.dataset.cordi13Done;
        n += 1;
      }
      /* (2) 隠していた元チップを表示へ戻す */
      for (const el of document.querySelectorAll('[data-cordi13-native]')) {
        el.removeAttribute('data-cordi13-native');
        try {
          el.style.removeProperty('display');
          el.style.removeProperty('opacity');
          el.style.removeProperty('transition');
          el.style.removeProperty('pointer-events');
          for (const d of el.querySelectorAll('[style]')) {
            if (d.style.getPropertyValue('opacity')) d.style.removeProperty('opacity');
            if (d.style.getPropertyValue('transition')) d.style.removeProperty('transition');
          }
        } catch (e) { /* noop */ }
        n += 1;
      }
    } catch (e) { /* noop */ }
    return n;
  }

  /* ============================================================
   *  v0.38.0: 後から足されたネイティブチップを隠す
   * ============================================================
   *  React は関係セルを後から描き直すことがあり、自分の再構築の後ろに
   *  新しいネイティブチップを足す。v0.37 までは「処理済み(done)」のセルを
   *  スイープが素通りしていたため、その1個だけが隠されずに残り、
   *  「1行パイプの外側にチップが1個」に見えていた。
   *  → 処理済みのセルでも、自分の要素(cordi13-*)以外の子は毎回隠す（冪等）。
   * ============================================================ */
  function enforceNatives(wrap) {
    let n = 0;
    try {
      for (const ch of Array.from(wrap.children)) {
        if (ch.nodeType !== 1) continue;
        const cls = String(ch.className || '');
        if (cls.indexOf('cordi13-') === 0) continue;                 // 自分が作った要素
        if (!TUNING.CLICK_NATIVE_REUSE) { ch.remove(); n += 1; continue; }
        const already = ch.getAttribute('data-cordi13-native') === '1' &&
          ch.style.getPropertyValue('display') === 'none';
        if (already) continue;
        ch.setAttribute('data-cordi13-native', '1');
        ch.style.setProperty('display', 'none', 'important');
        n += 1;
      }
    } catch (e) { /* noop */ }
    return n;
  }

  function sweep() {
    injectStyle();
    const now = Date.now();
    let acted = 0;
    for (const cell of document.querySelectorAll('[data-testid="property-value"]')) {
      const wrap = findWrap(cell);
      if (!wrap) continue;
      if (wrap.dataset && wrap.dataset.cordi13Done) {
        // 処理済みでも、実体が消えていたら（Reactが中身だけ差し替えた）作り直す（v0.21.0）
        if (wrap.querySelector('.cordi13-item, .cordi13-sec-head, .cordi13-sec-gap')) {
          /* v0.38.0: 実体があっても、後から足されたネイティブチップは毎回隠す */
          if (enforceNatives(wrap)) {
            acted += 1;
            if (acted >= 10) break;
          }
          continue;
        }
        /* v0.46.0: 不発のセルは、中身が同じなら判定し直さない（消して出すのをやめる） */
        const skipSig = wrap.getAttribute('data-cordi13-skip');
        if (skipSig && skipSig === sigOf(wrap)) continue;
        wrap.removeAttribute('data-cordi13-skip');
        delete wrap.dataset.cordi13Done;
      }
      if (busy.has(wrap)) continue;
      const f = failedAt.get(wrap);
      if (typeof f === 'number' && now - f < TUNING.FAIL_COOLDOWN_MS) continue;
      busy.add(wrap);
      const chip = hasChipKid(wrap);
      rebuildWrap(wrap, chip)
        .catch((err) => { failedAt.set(wrap, Date.now()); log('失敗: ' + (err && err.message ? err.message : err)); })
        .finally(() => {
          busy.delete(wrap);
          /* v0.45.0: 仕上がらなかったセルは透明のまま残さない */
          try {
            if (wrap.dataset && !wrap.dataset.cordi13Done) wrap.setAttribute('data-cordi13-fail', '1');
            else wrap.removeAttribute('data-cordi13-fail');
          } catch (e) { /* noop */ }
        });
      if (++acted >= 10) break;                              // 1回の掃除で多くても10セル
    }
    return acted;
  }

  let timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      try { sweep(); } catch (err) { console.error(TAG, err); }
    }, TUNING.DEBOUNCE_MS);
  }

  function start() {
    if (window.__cordi13ActiveVersion && window.__cordi13ActiveVersion !== VERSION) {
      log('!! 注意: 別バージョン（v' + window.__cordi13ActiveVersion + '）の C13 スクリプトも同時に走ってます。Tampermonkey で旧版を無効化してください（CSS が競合して見た目が入れ替わります）');
    }
    window.__cordi13ActiveVersion = VERSION;
    if (TUNING.CLEANUP_ON_START) {
      const cleaned = cleanupInjected();
      if (cleaned) log('旧版の注入DOMを掃除して元に戻しました: ' + cleaned + ' 箇所（新しいゲートで判定し直します）');
    }
    TUNING.RESCAN_DELAYS_MS.forEach((d) => setTimeout(() => sweep(), d));
    restoreView();   // プリロード後の位置復元（v0.22.0）
    /* v1.47.0: 本を右クリック → グループへ移す。設定が変わったら組み直す */
    window.addEventListener('contextmenu', (e) => {
      const t = e.target;
      const item = t && t.closest ? t.closest('.cordi13-item') : null;
      if (!item || !item.dataset.cordi13Id) return;
      const wrap = item.closest('[data-cordi13-on]');
      if (!wrap) return;
      e.preventDefault();
      e.stopPropagation();
      const secs = Array.from(wrap.querySelectorAll('.cordi13-sec-head')).filter((h) => h.__cg).map((h) => {
        const img = h.querySelector('.cordi13-sec-icon');
        return { key: h.__cg.key, label: h.textContent.trim(), icon: img ? (img.getAttribute('src') || img.textContent || '') : '' };
      });
      const title = (item.querySelector('.cordi13-title') || item).textContent.trim();
      CG.openMover({ id: item.dataset.cordi13Id, title, sections: secs, anchor: item });
    }, true);
    let cgT = 0;
    CG.on(() => {
      clearTimeout(cgT);
      cgT = setTimeout(() => { try { cleanupInjected(); sweep(); } catch (err) { /* noop */ } }, 60);
    });
    const mo = new MutationObserver((recs) => {
      try { prePaintNative(recs); } catch (e) { /* noop */ }   // v0.46.0: 描画前に「不発」を付ける
      schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    log('クリック: ' + TUNING.CLICK_MODE + (TUNING.CLICK_NEW_TAB ? '・別タブ' : '・同じタブ') +
      '（成否はピークの器の出現で判定・フォールバック=' + (TUNING.CLICK_FALLBACK ? 'あり' : 'なし') + '）');
    /* チューニング用の窓口（読み取りのみ） */
    try {
      window.__c13 = {
        VERSION,
        TUNING,
        metrics: charMetrics,
        tune: tune,
        /* v0.38.0: 最初のパイプセルの実寸（見た目がおかしいときの1発診断） */
        inspect: function () {
          const wraps = Array.from(document.querySelectorAll('[data-cordi13-pipe], [data-cordi13-cols]'));
          if (!wraps.length) { console.log('[C13 v' + VERSION + '] 処理されたセルがまだありません'); return null; }
          const wrap = wraps[0];
          const pipe = wrap.querySelector('.cordi13-pipe');
          const r = pipe ? pipe.getBoundingClientRect() : null;
          const kids = [];
          if (pipe) {
            for (const ch of Array.from(pipe.children)) {
              const rc = ch.getBoundingClientRect();
              kids.push({
                種類: String(ch.className || ch.tagName).slice(0, 30),
                幅: Math.round(rc.width),
                左: Math.round(rc.left),
                上: Math.round(rc.top),
                文字: String(ch.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 18)
              });
            }
          }
          const info = {
            パイプのセル数: wraps.length,
            パイプ幅: r ? Math.round(r.width) : null,
            パイプ高さ: r ? Math.round(r.height) : null,
            行数: pipe ? (pipe.getAttribute('data-cordi13-lines') || '計測前') : null,
            項目フォント: (function () { const t = wrap.querySelector('.cordi13-title'); return t ? getComputedStyle(t).fontFamily : null; })(),
            項目の字: (function () { const t = wrap.querySelector('.cordi13-title'); return t ? (getComputedStyle(t).fontSize + ' / ' + getComputedStyle(t).fontWeight) : null; })(),
            見出しフォント: (function () { const h = wrap.querySelector('.cordi13-sec-head'); return h ? getComputedStyle(h).fontFamily : null; })(),
            題名: TUNING.PIPE_STRIP_PREFIX ? '共通接頭辞を落とす' : '全文を表示',
            アイコン: (function () {
              const its = Array.from(wrap.querySelectorAll('.cordi13-item'));
              let ok = 0, ng = 0;
              for (const it of its) {
                const i = it.querySelector('.notion-record-icon img');
                if (i && i.complete && i.naturalWidth > 0) ok += 1; else ng += 1;
              }
              return '描画 ' + ok + ' / 未描画 ' + ng + '（一覧は __c13.icons()）';
            })(),
            溢れ: pipe ? (pipe.hasAttribute('data-cordi13-overflow') ? 'あり（1件が枠より長い）' : 'なし') : null,
            見切れ: pipe ? (pipe.scrollWidth > pipe.clientWidth + 1 ? 'あり（必要 ' + pipe.scrollWidth + ' > 枠 ' + pipe.clientWidth + '）' : 'なし') : null,
            wrap直下: Array.from(wrap.children).map((c) => String(c.className || c.tagName).slice(0, 24)).join(' / '),
            設定: 'PIPE_STRIP_PREFIX=' + TUNING.PIPE_STRIP_PREFIX + ' / PIPE_FIT=' + TUNING.PIPE_FIT + ' / PIPE_SHOW_HEADERS=' + TUNING.PIPE_SHOW_HEADERS
          };
          try {
            const pf = probeFont();
            if (pf) { info.書体の判定 = pf.判定; info.書体の実測幅 = pf.実測幅; info.書体の候補 = pf.候補; }
          } catch (e) { /* noop */ }
          console.log('%c[C13 v' + VERSION + '] inspect（最初のセル）', 'background:#08a;color:#fff;padding:1px 6px;border-radius:3px;');
          console.dir(info);
          console.table(kids);
          return info;
        },
        /* v0.44.0: アイコンの実測一覧（出ないときの1発診断） */
        icons: function () {
          const rows = [];
          for (const w of document.querySelectorAll('[data-cordi13-cols], [data-cordi13-pipe]')) {
            for (const it of w.querySelectorAll('.cordi13-item')) {
              const box = it.querySelector('.notion-record-icon');
              const i = box ? box.querySelector('img') : null;
              const t = it.querySelector('.cordi13-title');
              rows.push({
                題名: String((t && t.textContent) || '').slice(0, 14),
                箱: box ? (String(box.getAttribute('style') || '').indexOf('display: none') >= 0 ? '隠れている' : '表示') : '無し',
                種類: box && box.querySelector('.cordi13-emoji') ? '絵文字' : (i ? '画像' : '無し'),
                読込: i ? (i.complete ? (i.naturalWidth > 0 ? '成功' : '失敗') : '未完了') : '-',
                実寸: i ? (i.naturalWidth + 'x' + i.naturalHeight) : '-',
                src: i ? String(i.getAttribute('src') || '').slice(0, 58) : '-'
              });
            }
          }
          if (!rows.length) { console.log('[C13] 対象セルがありません'); return rows; }
          console.table(rows);
          const bad = rows.filter((r) => r.種類 === '画像' && r.読込 !== '成功').length;
          console.log('[C13 v' + VERSION + '] アイコン: ' + (rows.length - bad) + ' / ' + rows.length + ' が描画済み' + (bad ? '（未描画 ' + bad + ' 件）' : ''));
          return rows;
        },
        reset: function () {
          const n = cleanupInjected();
          console.log('[C13 v' + VERSION + '] 注入DOMを掃除して元に戻しました: ' + n + ' 箇所。新しいゲートで判定し直します（数秒後に再構築されます）');
          TUNING.RESCAN_DELAYS_MS.forEach((d) => setTimeout(() => sweep(), d));
          return n;
        },
        report: function () {
          const rows = [];
          for (const [w, r] of GATE_ROWS) {
            if (!w || !w.isConnected) { GATE_ROWS.delete(w); continue; }
            rows.push(r);
          }
          if (!rows.length) {
            console.log('[C13 v' + VERSION + '] まだ実測がありません（セルが処理されると溜まります）');
            return rows;
          }
          console.table(rows);
          console.log('[C13 v' + VERSION + '] しきい値: 件数>=' + TUNING.MIN_ITEMS_GATE +
            ' / 全角換算>=' + TUNING.MIN_WIDTH_EQUIV + ' / モード=' + TUNING.GATE_MODE +
            ' / 文字数ゲート=' + (TUNING.USE_CHARS_GATE ? 'on' : 'off') +
            ' / Series必須=' + (TUNING.REQUIRE_SERIES_DB ? 'on' : 'off'));
          return rows;
        }
      };
    } catch (e) { /* noop */ }

    log('アイコン: ' + (TUNING.ICON_REPAIR ? '自己修復あり（' + TUNING.ICON_REPAIR_DELAYS_MS.join('/') + 'ms に確認）' : '自己修復なし') +
      ' / 実測は __c13.icons()');
    log('レイアウト: ' + (TUNING.PIPE_ONELINE ? '1行パイプあり' : '3件以上は全部この整列グリッド') +
      ' / 題名: ' + (TUNING.PIPE_STRIP_PREFIX ? '共通接頭辞を落とす' : '全文を表示') +
      ' / 書体: ' + (TUNING.ITEM_FONT ? TUNING.ITEM_FONT_FAMILY : '触らない') + '（実測は __c13.inspect()）');
    log('起動 v' + VERSION + '（チップ付きは無条件・チップ無しは ' + TUNING.GATE_MODE +
      ' モード: 件数>=' + TUNING.MIN_ITEMS_GATE + ' / 全角換算>=' + TUNING.MIN_WIDTH_EQUIV +
      (TUNING.USE_CHARS_GATE ? '・文字数 ' + TUNING.MIN_CHARS_GATE + '字併用' : '') +
      (TUNING.REQUIRE_SERIES_DB ? '・関係先DBにSeriesがある場合のみ' : '') +
      '・実測は __c13.report()' +
      '・シリーズは本側DBの「' + TUNING.SERIES_PROP_NAME + '」で自動グループ化・ゴーストは非表示' +
      (TUNING.HIDE_RELATION_POPUP ? '・+Nのホバーチップは非表示' : '') + '）');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();