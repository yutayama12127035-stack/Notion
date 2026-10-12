// ==UserScript==
// @name         « No »　⁰⁵ _ Full Database Body Alignment
// @namespace    https://constellucentia.local/full-database-body-alignment
// @version      3.7.0
// @noframes
// @description  フルDBのツールバーとDB本体の開始位置を、ページタイトル1文字目(T)へ揃える実測版。v3.7.0: 表・ツールバー・グループ見出しがタイトルの page-block の「外」にある今の Notion の構造に合わせ、記憶値の付与・床（仮の位置）・所属判定の範囲をメインの .notion-frame へ広げる（これまで記憶値が一度も付かず、作り直された表が元の位置＝左に出てから右へ動いていた）。床は 48px 固定ではなく、このページで覚えた表の値。v3.6.0: ①v3.5.0 より前に誤った手がかりで覚えた表の値を一度だけ捨てる ②記憶値で置いた要素は、最初の実測で 1px 以上違えば確認待ちなしですぐ直す（遅れて動くのを短く） ③²¹ Render Veil 向けに settled()（表・ツールバーがすべて整列済みで、書き込み予定もない）を出す。v3.5.0: ①表の実測は「列見出し」だけを手がかりにする（グループを全部閉じた時・スクロールで見出しが外れた時に別の手がかりへ切り替わり、表が左右に動いていた） ②グループ見出しの値を開/閉の状態ごとに記憶し、開閉の瞬間（描画前）に付け直す ③²¹ Render Veil が幕を下ろしている間は確認待ちなしで即書き・実測も早める ④書き込みの記録 log()。v3.4.0: ①フルDBページでは html に data-c05-full="1" を描画前に付ける（Stylus ²¹ Group Header Layout と ¹³ のグループ見出しが効くようになる） ②ずらし量を要素の style（Notion が書き換えると消える）ではなく属性＋専用スタイルシートで持つ → 「DBが左の元の位置へ戻り、カーソルを当てると戻る」を解消。v3.3.0: 「描画のたびに少しずれる」を除去 — ①値を画面の画素に丸める ②すでに値が付いている要素は 1px 以上の差を 2回続けて測った時だけ書き直す（0.25px の揺れで動かさない） ③¹⁸ が表を押さえている間は測らない ④ピン留め見出し（ポータル）にも記憶値を描画前に付ける。v3.2.0: 基準・属性名・変数名・CSS（床48px含む）・実測アルゴリズム・ジャンプガードは v3.1.0 と同一のまま「後から動く」を除去。①実測で確定した値をページごと・要素の構造位置ごとに記憶（localStorage）し、Notion が要素を作り直した瞬間（MutationObserver のコールバック＝描画前）に同じ値を同期で付ける → タブ切替・スクロールの2回目以降は最初のフレームから整列済み ②ポータル所有マークも描画前に同期（旧: 100ms＋アイドル待ち） ③グループ見出しは ¹² のクラスを待たず構造でも判定 ④一瞬見えない要素の属性は剥がさない（床48pxへの落下防止） ⑤ document-start 起動（再読み込みでも記憶値で初回から整列）。インラインDB・通常ページ・peek は従来どおり対象外。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

/*
 * v3.7.0（2026-09-30）
 *  ログ（__…__.log()）から分かったこと:
 *    ・「記憶値（描画前）」が一度も出ていない＝表・ツールバー・グループ見出しへの記憶値の付与が一度も成功していない
 *    ・表は毎回「実測（初回）48」＝作り直された表は床（48px）も当たらず、元の位置（左）で描かれていた
 *    ・グループ見出しは 48 と書いた直後に 0 へ書き直し
 *  原因: 今の Notion では、表・タブ・グループ見出しはタイトルを持つ page-block の「外」（兄弟側）にある。
 *        記憶値の付与（stamp）・床の CSS・settled() はすべて page-block の中だけを探していた。
 *        グループを閉じていて列見出しが無い表は測れない（v3.5.0）→ 表は左のまま → グループ見出しが 48 で
 *        埋め合わせ → 見出しが出て表が 48 動く → グループ見出しは二重になり 0 へ、という順で動いていた
 *  v3.7.0:
 *    ① 探す範囲（scope）をタイトルのあるメインの .notion-frame にする（peek・インラインDB・ピン留めの複製は従来どおり除外）
 *    ② 床の CSS をビュー本体に構造で当てる（html[data-c05-full="1"] のメイン枠の一番外のビュー）。
 *       値は 48px 固定ではなく、このページで覚えた表の値（:root の --c05-floor-table）
 *       → 作り直された表・列見出しの無い表も、最初のフレームから正しい位置
 *    ③ 記憶の保存先を v3 へ。表・グループ見出し・ピン留め見出しの値は壊れた状態で覚えたので捨てる（ツールバーは引き継ぐ）
 *    ④ フルDBページのメイン枠のビューは、横スクロールの枠の中でもインラインDB扱いしない
 */

/*
 * v3.6.0（2026-09-30）
 *  症状: タブ切替・グループを開いた時に、表が左から右へ動くのが見える
 *  v3.6.0:
 *    ① 記憶の保存先を v2 へ。v1 の「表」の値は v3.5.0 より前の誤った手がかり（1列目のセル・表そのもの）で
 *       覚えた可能性があるので捨てる（ツールバー・グループ見出し・ピン留め見出しの値は引き継ぐ）
 *    ② 記憶値で置いた要素（stamp）は、この画面で初めての実測が 1px 以上違えば確認待ち（400ms）をせずに直す
 *    ③ settled(): フルDBページで「見えている表・ツールバーがすべて整列済み」かつ「実測・確認待ちが無い」
 *       → ²¹ Render Veil はこれが true になるまで幕を開けない（新しい表が描かれる前に幕が開くのを防ぐ）
 */

/*
 * v3.5.0（2026-09-30）
 *  症状: グループを閉じると「ぴくっ」と動く／たまにスクロールでDBが左→右へ動く
 *  原因: 表の位置を測る手がかり（getTableAnchor）が、列見出しが無いと
 *        「1列目のセル」→「表そのもの」へと切り替わっていた。手がかりごとに内側の余白が違うので、
 *        ・グループを全部閉じる（列見出しが消える）
 *        ・長いグループをスクロールして列見出しが描画範囲から外れる（仮想化）
 *        と別の値を測り、表ごと書き直していた（見出しが戻ると元の値へ書き直す＝左→右）
 *  v3.5.0:
 *    ① 表ビューは列見出しだけで測る。見出しが無い・見えない時は測らない（今の値のまま）
 *       ボード・リスト等は従来の手がかり
 *    ② グループ見出しの記憶を開/閉ごとに持つ（known.groupBy）。aria-expanded の変化を
 *       MutationObserver で受け、描画前に状態に合った値を付け直す
 *    ③ html[data-c21-veil="cut"|"out"]（²¹ Render Veil の幕の最中）は見えないので確認待ちをせず即書く。
 *       実測の間引きも 40ms に縮める。__…__.busy() で「まだ書くかもしれない」を幕へ知らせる
 *    ④ __constellucentiaFullDbBodyAlignment__.log() で直近の書き込み（種類・前→後・理由）を表示
 */

/*
 * v3.4.0（2026-09-30）
 *  症状: ²¹ Group Header Layout（Stylus）が効かない／DBが左の元の位置へ戻り、カーソルを当てると戻る（stamps: 0）
 *  原因:
 *    ・²¹ と ¹³ のグループ見出しは html[data-c05-full="1"] を前提にしているが、付けるスクリプトが無かった
 *    ・ずらし量を要素の style（CSS変数）に書いていた。Notion が表やツールバーの style を書き直すと変数だけ消え、
 *      印（属性）は残るので transform: translateX(var(--…, 0px)) → 0px ＝ 元の位置へ戻る。
 *      印が残っているので記憶値の再付与（stamp）も走らず、カーソルで何かが変わって実測が走るまで戻らなかった
 *  v3.4.0:
 *    ① フルDBページの間だけ html[data-c05-full="1"]（描画前・MutationObserver のコールバックで同期）
 *    ② ずらし量は属性 data-constellucentia-full-db-body-shift / -sticky-shift に数値で持ち、
 *       値ごとの CSS 規則を専用 <style> に書く（style が書き換えられても位置は変わらない）
 *       CSS 変数も互換のため従来どおり書く（無くなっても属性側の規則が勝つ）
 */

/*
 * v3.3.0（2026-09-30）— 「描画のたびに少しずれる」の除去。判定・床48px・記憶の仕組みは v3.2.0 と同一。
 *  原因:
 *    ・基準（タイトル1文字目）を毎回測り直していた（window.scrollY は Notion では常に 0 → 毎回更新）
 *    ・実測値は 47.75 / 48.1 のような端数で揺れる → 0.25px 以上の差で毎回書き直し
 *      → タブ・グループ見出し・列見出しのアイコンが描画のたびに半端に動く
 *    ・¹⁸ が表を translate で押さえている間も測っていた（押さえ分を差し引かず誤った値を書く）
 *    ・ピン留めされた列見出し（ポータル）は記憶が無く、毎回 48px → 実測値へ動いていた
 *  v3.3.0:
 *    ① 値を画面の画素（1/devicePixelRatio）に丸める
 *    ② 値が付いている要素は「REWRITE_MIN_PX 以上の差」を「CONFIRM_RUNS 回続けて同じ値」で測った時だけ書き直す
 *       値が無い要素（初めての要素）は従来どおりすぐ書く
 *    ③ [data-c18-shift] がある間は実測しない（記憶値の付与だけ行う）
 *    ④ ピン留め見出しの値も記憶し、描画前に付ける
 */

/*
 * v3.2.0（2026-09-29）— 「後から動く」の除去。判定・数値・CSS は v3.1.0 と同一。
 *  旧版の動き: Notion が要素を作り直す（タブ切替・下スクロールの仮想化）
 *    → 新要素は属性なし → 床ルール(translate 48px)で描画（入れ子は 48+48 の瞬間あり）
 *    → 150ms 間引き＋スクロール静寂 最大1〜2秒 → 実測 → 正しい値へ移動 ＝「左→右」
 *  v3.2.0:
 *    ① 実測で確定した値を「ページid × 種類 × 構造位置」で記憶
 *         ツールバー: 先頭タブからの祖先の段数＋要素の署名（タグ.先頭class|選択子番号）
 *         ビュー本体: ビューclass＋page-block からの段数
 *         グループ見出し: 値1つ＋見出しブロックの署名（native class・開閉ボタンの有無）
 *    ② MutationObserver のコールバック（描画前に同期実行）で、属性の無い対象へ記憶値を即付与
 *       （レイアウトは読まない＝軽い・強制レイアウトなし）
 *    ③ ポータル所有マークも同じコールバックで同期判定（旧: 100ms＋requestIdleCallback）
 *    ④ cleanupStale は「見えている＆対象外」の要素だけ剥がす（一瞬の不可視で床へ落とさない）
 *    ⑤ 記憶は localStorage（最大200ページ）。再読み込みでも最初のフレームから整列
 *    実測（apply）は従来どおり走り、0.25px 以上の差がある時だけ書く＝記憶値の見直し役
 */

/*
 * v3.1.0（2026-09-27）— ツールバー探しをタブ起点に／1回の整列でタイトル探索1回／class 監視停止／サイドバー無視
 * v3.0.2（2026-09-27）— 裏タブ停止・間引き150ms・所有判定 requestIdleCallback・URL監視1500ms
 */

  const VERSION = "3.7.0";
  const RUNTIME_KEY = "__constellucentiaFullDbBodyAlignment__";
  const STYLE_ID = "constellucentia-full-db-body-alignment-style-v300";
  const ATTRIBUTE = "data-constellucentia-full-db-body-aligned";
  const TYPE_ATTRIBUTE = "data-constellucentia-full-db-body-type";
  const SHIFT_VARIABLE = "--constellucentia-full-db-body-shift";
  const PORTAL_HEADER_SHIFT_VARIABLE = "--constellucentia-full-db-portal-header-shift";
  const PORTAL_GROUP_SHIFT_VARIABLE = "--constellucentia-full-db-portal-group-shift";
  const STICKY_ATTRIBUTE = "data-constellucentia-full-db-body-sticky-aligned";
  const STICKY_TYPE_ATTRIBUTE = "data-constellucentia-full-db-body-sticky-type";
  const STICKY_SHIFT_VARIABLE = "--constellucentia-full-db-body-sticky-shift";
  /* v3.4.0: ずらし量を持つ属性（style が消されても残る） */
  const VAL_ATTR = "data-constellucentia-full-db-body-shift";
  const STICKY_VAL_ATTR = "data-constellucentia-full-db-body-sticky-shift";
  const FULL_FLAG = "data-c05-full";
  const SCAN_DELAY = 150;
  const SCROLL_QUIET_MS = 1000;
  const APPLY_MAX_WAIT_MS = 2000;
  const JUMP_GUARD = 160;
  const GUARD_CONFIRM_PX = 2;
  const GUARD_CONFIRM_TIMEOUT_MS = 4000;
  const EPSILON = 0.25;
  /* v3.3.0: 書き直しの条件（値がすでに付いている要素だけに効く） */
  const REWRITE_MIN_PX = 1;
  const CONFIRM_RUNS = 2;
  const CONFIRM_TOL_PX = 0.5;
  const CONFIRM_DELAY_MS = 400;
  const C18_HOLD_SEL = '[data-c18-shift]';
  const pendingRewrite = new WeakMap();
  function snapPx(v) {
    const d = Math.max(1, Math.min(4, window.devicePixelRatio || 1));
    return Math.round(v * d) / d;
  }
  /* 値がある要素の書き直し判定。true なら書く */
  /* v3.5.0: 幕（²¹ Render Veil）が下りている最中か */
  function veiled() {
    const v = document.documentElement.getAttribute('data-c21-veil');
    return v === 'cut' || v === 'out';
  }
  /* v3.5.0: 書き込みの記録 */
  const writeLog = [];
  function logWrite(element, type, before, after, why) {
    if (writeLog.length >= 60) writeLog.shift();
    writeLog.push({
      時刻: new Date().toLocaleTimeString(), 種類: type, 前: before, 後: after, 理由: why,
      幕: document.documentElement.getAttribute('data-c21-veil') || ''
    });
  }
  let scanPending = false;
  /* v3.6.0: 記憶値で置いた要素（まだこの画面で実測していない） */
  const fromMemory = new WeakSet();
  function shouldWrite(element, previousRaw, delta) {
    if (!previousRaw) { pendingRewrite.delete(element); fromMemory.delete(element); return true; }
    if (fromMemory.has(element)) {
      fromMemory.delete(element);
      if (Math.abs(delta - parseShiftValue(previousRaw)) >= REWRITE_MIN_PX) { pendingRewrite.delete(element); return true; }
      return false;
    }
    if (veiled() && Math.abs(delta - parseShiftValue(previousRaw)) >= EPSILON) { pendingRewrite.delete(element); return true; }
    const prev = parseShiftValue(previousRaw);
    if (Math.abs(delta - prev) < REWRITE_MIN_PX) { pendingRewrite.delete(element); return false; }
    const p = pendingRewrite.get(element);
    if (p && Math.abs(p.v - delta) <= CONFIRM_TOL_PX) p.n += 1;
    else pendingRewrite.set(element, { v: delta, n: 1 });
    const cur = pendingRewrite.get(element);
    if (cur.n < CONFIRM_RUNS) {
      clearTimeout(confirmTimer);
      confirmAt = Date.now();
      confirmTimer = window.setTimeout(apply, CONFIRM_DELAY_MS);
      return false;
    }
    pendingRewrite.delete(element);
    return true;
  }
  let confirmTimer = null;
  const confirmPending = () => {
    /* 確認待ちの要素があるか（WeakMap は数えられないので時刻で近似） */
    return confirmAt && (Date.now() - confirmAt) < CONFIRM_DELAY_MS + 100;
  };
  let confirmAt = 0;

  /* ============================================================
   *  v3.4.0: ずらし量の読み書き（属性＋値ごとの規則）
   * ============================================================ */
  const valAttrOf = (variable) => (variable === STICKY_SHIFT_VARIABLE ? STICKY_VAL_ATTR : VAL_ATTR);
  const valueSet = new Set();
  let valueStyleDirty = false;
  function valueRules() {
    const out = [];
    for (const v of valueSet) {
      const q = JSON.stringify(v);
      out.push(`[${ATTRIBUTE}="true"][${VAL_ATTR}=${q}]:not(.sticky-portal-target *):not(.notion-collection_view-block *) { transform: translateX(${v}px) !important; }`);
      out.push(`[${STICKY_ATTRIBUTE}="true"][${STICKY_VAL_ATTR}=${q}]:not(.sticky-portal-target *):not(.notion-collection_view-block *) { transform: translateX(${v}px) !important; }`);
    }
    return out.join('\n');
  }
  function flushValueStyle() {
    if (!valueStyleDirty) return;
    valueStyleDirty = false;
    let st = document.getElementById(STYLE_ID + '-values');
    if (!st) {
      st = document.createElement('style');
      st.id = STYLE_ID + '-values';
      (document.head || document.documentElement).appendChild(st);
    }
    const css = valueRules();
    if (st.textContent !== css) st.textContent = css;
  }
  function ensureValue(str) {
    if (valueSet.has(str)) return;
    if (valueSet.size > 300) {
      /* 使われていない値を捨てる */
      const used = new Set();
      document.querySelectorAll(`[${VAL_ATTR}], [${STICKY_VAL_ATTR}]`).forEach(el => {
        const a = el.getAttribute(VAL_ATTR); if (a) used.add(a);
        const b = el.getAttribute(STICKY_VAL_ATTR); if (b) used.add(b);
      });
      for (const v of [...valueSet]) if (!used.has(v)) valueSet.delete(v);
    }
    valueSet.add(str);
    valueStyleDirty = true;
    flushValueStyle();
  }
  /* 生の値（'48px' 形式・無ければ ''） */
  function readShift(el, variable) {
    const a = el.getAttribute(valAttrOf(variable));
    if (a !== null && a !== '') return `${a}px`;
    return el.style.getPropertyValue(variable);
  }
  function writeShift(el, variable, v) {
    const str = String(Math.round(Number(v) * 1000) / 1000);
    ensureValue(str);
    const attr = valAttrOf(variable);
    if (el.getAttribute(attr) !== str) el.setAttribute(attr, str);
    if (el.style.getPropertyValue(variable) !== `${str}px`) el.style.setProperty(variable, `${str}px`);
  }
  function clearShift(el, variable) {
    el.removeAttribute(valAttrOf(variable));
    el.style.removeProperty(variable);
  }
  const TRANSITION_QUIET_MS = 600;
  const PORTAL_OWNER_ATTRIBUTE = 'data-constellucentia-full-db-portal-owner';

  /* v3.2.0: 記憶 */
  const KNOWN_LS_KEY = 'constellucentia-full-db-body-known-v3';
  const KNOWN_LS_KEY_OLD = 'constellucentia-full-db-body-known-v2';
  const KNOWN_LS_KEY_OLDER = 'constellucentia-full-db-body-known-v1';
  const KNOWN_MAX_PAGES = 200;
  /* v3.2.0: ¹² のクラスが付く前のグループ見出し（ポータル内の判定用・構造） */
  const GROUP_STRUCT = '.notion-collection_view_page-block > [aria-expanded]';
  const GROUP_ANY = '.cordivestium-group-block, ' + GROUP_STRUCT;

  const TITLE_SELECTORS = [
    "h1[aria-roledescription='page title']",
    ".notion-collection_view_page-block h1[aria-roledescription='page title']"
  ];

  const TOOLBAR_ROOT_SELECTORS = [
    'div[contenteditable="false"]',
    '[data-content-editable-void="true"]',
    '.notion-scroller > div'
  ];

  const VIEW_SELECTORS = [
    '.notion-table-view',
    '.notion-board-view',
    '.notion-list-view',
    '.notion-gallery-view',
    '.notion-timeline-view',
    '.notion-calendar-view'
  ];

  const STICKY_SEL_INSET = 'div[style*="position: sticky"][style*="inset-inline-start"]';
  const STICKY_SEL_ANY = 'div[style*="position: sticky"]';

  function isInlineDatabaseElement(element) {
    if (!(element instanceof Element)) return false;

    /* v3.7.0: フルDBページのメイン枠にある要素は、横スクロールの枠の中でもインラインDB扱いしない */
    if (document.documentElement.getAttribute('data-c05-full') === '1' &&
        !element.closest('.sticky-portal-target, .notion-peek-renderer, .notion-collection_view-block') &&
        element.closest('.notion-frame')) {
      return false;
    }

    const titles = getVisibleTitles();
    const matchedTitle = findTitleForTarget(titles, element);
    const elementBlockId = getBlockId(element);
    const titleBlockId = getBlockId(matchedTitle);

    if (matchedTitle instanceof Element && elementBlockId && titleBlockId && elementBlockId === titleBlockId) {
      return false;
    }

    if (element.closest('.sticky-portal-target')) {
      const portalBlockId = getBlockId(element);
      if (portalBlockId) {
        const escaped = (window.CSS && typeof CSS.escape === 'function') ? CSS.escape(portalBlockId) : portalBlockId;
        if (document.querySelector(`.notion-collection_view-block [data-block-id="${escaped}"]`)) return true;
        if (document.querySelector(`.notion-collection_view_page-block [data-block-id="${escaped}"]`)) return false;
      }
      return false;
    }

    const pageBlock = element.closest('.notion-collection_view_page-block');
    if (pageBlock) return false;

    if (element.closest('.notion-collection_view-block')) return true;

    const scroller = element.closest('.notion-scroller');
    if (!scroller) return false;

    return !scroller.querySelector("h1[aria-roledescription='page title']");
  }

  function filterFullDbElements(elements) {
    return elements.filter((element) => !isInlineDatabaseElement(element));
  }

  const state = {
    version: VERSION,
    scans: 0,
    applications: 0,
    stamps: 0,
    lastResult: 'not-started',
    lastError: null,
    lastRunAt: null,
    destroyed: false
  };

  let observer = null;
  let resizeObserver = null;
  let scanTimer = null;
  let resizeTimer = null;
  let removeResizeListener = null;
  let removeScrollListener = null;
  let removeNavigationListener = null;
  let hrefTimer = 0;
  let scrollSettleTimer = null;
  let lastScrollActivityAt = 0;
  let firstDeferralAt = 0;
  const baselineTitleStartByKey = new Map();
  const lastDeltaByKey = new Map();
  let pendingGuard = null;

  let primaryPageBlockId = null;
  let stablePageBlockId = null;
  let candidatePageBlockId = null;
  let candidateSince = 0;
  let transitionQuietUntil = 0;

  /* ============================================================
   *  v3.2.0: 記憶（ページid → 種類 → 構造位置 → 値）
   * ============================================================ */
  function loadStore() {
    try {
      const o = JSON.parse(localStorage.getItem(KNOWN_LS_KEY) || 'null');
      if (o && o.pages && typeof o.pages === 'object') {
        return { pages: o.pages, order: Array.isArray(o.order) ? o.order : Object.keys(o.pages) };
      }
      /* v3.7.0: v2（または v1）から移す。ツールバー以外は捨てる */
      const old = JSON.parse(localStorage.getItem(KNOWN_LS_KEY_OLD) || localStorage.getItem(KNOWN_LS_KEY_OLDER) || 'null');
      if (old && old.pages && typeof old.pages === 'object') {
        for (const id of Object.keys(old.pages)) {
          const k = old.pages[id];
          if (!k || typeof k !== 'object') continue;
          k.table = {}; k.group = null; k.groupSig = null; k.groupBy = {}; k.header = null; k.tableLast = null;
        }
        const moved = { pages: old.pages, order: Array.isArray(old.order) ? old.order : Object.keys(old.pages) };
        try {
          localStorage.setItem(KNOWN_LS_KEY, JSON.stringify(moved));
          localStorage.removeItem(KNOWN_LS_KEY_OLD);
          localStorage.removeItem(KNOWN_LS_KEY_OLDER);
        } catch {}
        return moved;
      }
    } catch {}
    return { pages: {}, order: [] };
  }
  let store = loadStore();
  let saveTimer = 0;
  function saveStoreNow() {
    try { localStorage.setItem(KNOWN_LS_KEY, JSON.stringify(store)); } catch {}
  }
  function saveStoreSoon() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = 0; saveStoreNow(); }, 1000);
  }
  function knownFor(id) {
    let k = store.pages[id];
    if (!k || typeof k !== 'object') {
      k = { toolbar: {}, table: {}, group: null, groupSig: null, header: null };
      store.pages[id] = k;
    }
    if (!k.toolbar || typeof k.toolbar !== 'object') k.toolbar = {};
    if (!k.table || typeof k.table !== 'object') k.table = {};
    store.order = store.order.filter(x => x !== id);
    store.order.push(id);
    while (store.order.length > KNOWN_MAX_PAGES) delete store.pages[store.order.shift()];
    return k;
  }

  let known = null;
  let knownPageId = null;
  let pageBlockEl = null;
  let primaryTitleEl = null;
  const groupOfRoot = new WeakMap();

  function depthBetween(inner, outer) {
    let d = 0;
    for (let n = inner; n; n = n.parentElement) {
      if (n === outer) return d;
      d += 1;
    }
    return -1;
  }
  function toolbarSelIdx(el) {
    for (let i = 0; i < TOOLBAR_ROOT_SELECTORS.length; i++) {
      try { if (el.matches(TOOLBAR_ROOT_SELECTORS[i])) return i; } catch {}
    }
    return -1;
  }
  function elSig(el, selIdx) {
    return el.tagName + '.' + (el.classList[0] || '') + '|' + selIdx;
  }
  function viewClassOf(el) {
    for (const s of VIEW_SELECTORS) if (el.matches(s)) return s.slice(1);
    return null;
  }
  function nativeClass(el) {
    for (const c of el.classList) if (!c.startsWith('cordivestium')) return c;
    return '';
  }
  function groupSigOf(g) {
    return { cls: nativeClass(g), exp: !!g.querySelector(':scope > [aria-expanded]') };
  }
  function inPortalOrInline(el) {
    return !!el.closest('.sticky-portal-target, .notion-collection_view-block, .notion-peek-renderer');
  }
  /* v3.7.0: 探す範囲。表・タブ・グループ見出しは page-block の外にあるので、タイトルのあるメインの枠 */
  function scopeEl() {
    if (!pageBlockEl || !pageBlockEl.isConnected) return null;
    return (primaryTitleEl && primaryTitleEl.closest('.notion-frame')) || pageBlockEl.closest('.notion-frame') || document.body;
  }
  function firstFlowTab() {
    const sc = scopeEl();
    if (!sc) return null;
    for (const t of sc.querySelectorAll('.notion-collection-view-tab-button')) {
      if (!inPortalOrInline(t)) return t;
    }
    return null;
  }

  /* ページの把握（レイアウトを読まない・描画前に呼ばれる） */
  /* v3.4.0: フルDBページの間だけ html[data-c05-full="1"]（²¹ Group Header Layout・¹³ が読む） */
  function updateFullFlag() {
    const root = document.documentElement;
    const on = !!(pageBlockEl && pageBlockEl.isConnected);
    if (on) { if (root.getAttribute(FULL_FLAG) !== '1') root.setAttribute(FULL_FLAG, '1'); }
    else if (root.hasAttribute(FULL_FLAG)) root.removeAttribute(FULL_FLAG);
  }
  function syncPage() {
    syncPageInner();
    updateFullFlag();
  }
  function syncPageInner() {
    if (pageBlockEl && pageBlockEl.isConnected && primaryTitleEl && primaryTitleEl.isConnected && pageBlockEl.contains(primaryTitleEl)) return;
    if (primaryTitleEl && primaryTitleEl.isConnected && !pageBlockEl) {
      /* 通常ページのまま（タイトルは健在） */
      const pb0 = primaryTitleEl.closest('.notion-collection_view_page-block');
      if (!pb0) return;
    }
    primaryTitleEl = null;
    pageBlockEl = null;
    let t = null;
    for (const h of document.querySelectorAll(TITLE_SELECTORS[0])) {
      if (h.closest('.notion-peek-renderer')) continue;
      t = h;
      break;
    }
    if (!t) return;
    primaryTitleEl = t;
    const id = getBlockId(t);
    const pb = t.closest('.notion-collection_view_page-block');
    pageBlockEl = (pb && id && pb.getAttribute('data-block-id') === id) ? pb : null;
    if (id && id !== primaryPageBlockId) {
      primaryPageBlockId = id;
      updateFloorRule();
    }
    if (id && id !== knownPageId) {
      knownPageId = id;
      known = knownFor(id);
      writeFloorVar();
    }
  }

  function stampEl(el, attr, typeAttr, variable, type, v) {
    if (el.getAttribute(attr) === 'true') return 0;
    writeShift(el, variable, v);
    el.setAttribute(attr, 'true');
    el.setAttribute(typeAttr, type);
    fromMemory.add(el);
    logWrite(el, type, null, v, '記憶値（描画前）');
    return 1;
  }

  /* 記憶値を「属性の無い対象」へ即付与（描画前・レイアウトを読まない） */
  function stamp() {
    if (!known || !pageBlockEl || !pageBlockEl.isConnected) return 0;
    if (knownPageId !== primaryPageBlockId) return 0;
    const scope = scopeEl();
    if (!scope) return 0;
    let n = 0;

    /* ツールバー（先頭タブから祖先をたどり、記憶した段数・署名の要素だけ） */
    if (Object.keys(known.toolbar).length) {
      const tab = firstFlowTab();
      if (tab) {
        let d = 0;
        for (let el = tab.parentElement; el && el !== document.documentElement; el = el.parentElement) {
          d += 1;
          const rec = known.toolbar[d];
          if (!rec || typeof rec.v !== 'number') continue;
          const i = toolbarSelIdx(el);
          if (i < 0 || elSig(el, i) !== rec.sig) continue;
          if (el.closest('.sticky-portal-target')) continue;
          n += stampEl(el, ATTRIBUTE, TYPE_ATTRIBUTE, SHIFT_VARIABLE, 'toolbar', rec.v);
        }
      }
    }

    /* ビュー本体（ビューclass＋page-block からの段数） */
    if (Object.keys(known.table).length) {
      for (const sel of VIEW_SELECTORS) {
        for (const v of scope.querySelectorAll(sel)) {
          if (v.getAttribute(ATTRIBUTE) === 'true' || inPortalOrInline(v)) continue;
          if (viewClassOf(v) !== sel.slice(1)) continue;
          const val = known.table[sel.slice(1) + ':' + depthBetween(v, scope)];
          if (typeof val !== 'number') continue;
          n += stampEl(v, ATTRIBUTE, TYPE_ATTRIBUTE, SHIFT_VARIABLE, 'table', val);
        }
      }
    }

    /* グループ見出し（¹² のクラス、または記憶した署名の構造）
       v3.5.0: 開/閉ごとの記憶（groupBy）を優先。すでに値がある根でも、状態の記憶と 1px 以上違えば付け直す */
    const groupBy = (known.groupBy && typeof known.groupBy === 'object') ? known.groupBy : {};
    if (typeof known.group === 'number' || Object.keys(groupBy).length) {
      const cands = new Set(scope.querySelectorAll('.cordivestium-group-block'));
      const sig = known.groupSig;
      if (sig && sig.cls) {
        const esc = (window.CSS && CSS.escape) ? CSS.escape(sig.cls) : sig.cls;
        for (const g of scope.querySelectorAll('.' + esc)) {
          if (g === pageBlockEl) continue;
          if (sig.exp && !g.querySelector(':scope > [aria-expanded]')) continue;
          cands.add(g);
        }
      }
      const roots = [];
      for (const g of cands) {
        if (inPortalOrInline(g)) continue;
        const root = g.closest(STICKY_SEL_INSET) || g.closest(STICKY_SEL_ANY);
        if (!root || !scope.contains(root) || roots.includes(root)) continue;
        if (getBlockId(root) !== primaryPageBlockId) continue;   /* 実測側 alignStickyElement と同じ所属条件 */
        roots.push(root);
        if (!groupOfRoot.has(root)) groupOfRoot.set(root, g);
        rootState.set(root, groupStateOf(g));
      }
      for (const r of roots) {
        if (roots.some(o => o !== r && o.contains(r))) continue;                         /* 最外だけ */
        if (r.parentElement && r.parentElement.closest(`[${STICKY_ATTRIBUTE}="true"]`)) continue;
        const st = rootState.get(r);
        const want = (st && typeof groupBy[st] === 'number') ? groupBy[st] : known.group;
        if (typeof want !== 'number') continue;
        if (r.getAttribute(STICKY_ATTRIBUTE) === 'true') {
          const cur = parseShiftValue(readShift(r, STICKY_SHIFT_VARIABLE));
          if (Math.abs(cur - want) >= REWRITE_MIN_PX) {
            writeShift(r, STICKY_SHIFT_VARIABLE, want);
            logWrite(r, 'sticky-group', cur, want, '開閉の記憶（描画前）');
            n += 1;
          }
          continue;
        }
        n += stampEl(r, STICKY_ATTRIBUTE, STICKY_TYPE_ATTRIBUTE, STICKY_SHIFT_VARIABLE, 'sticky-group', want);
      }
    }

    /* v3.3.0: ピン留めの列見出し（ポータル）。所属はブロックidだけで判定（レイアウトは読まない） */
    if (typeof known.header === 'number') {
      for (const hr of document.querySelectorAll('.sticky-portal-target .notion-table-view-header-row')) {
        if (hr.closest('.notion-peek-renderer, .notion-collection_view-block')) continue;
        const root = getStickyPortalRoot(hr);
        if (!(root instanceof HTMLElement) || root.getAttribute(STICKY_ATTRIBUTE) === 'true') continue;
        if (getBlockId(root) !== primaryPageBlockId) continue;
        n += stampEl(root, STICKY_ATTRIBUTE, STICKY_TYPE_ATTRIBUTE, STICKY_SHIFT_VARIABLE, 'sticky-table-header', known.header);
      }
    }

    state.stamps += n;
    return n;
  }

  /* 実測で確定した値を記憶 */
  function recordToolbar(toolbar, anchor) {
    if (!known || knownPageId !== primaryPageBlockId) return;
    if (toolbar.getAttribute(ATTRIBUTE) !== 'true') return;
    if (!anchor || !anchor.matches('.notion-collection-view-tab-button') || anchor !== firstFlowTab()) return;
    const d = depthBetween(anchor, toolbar);
    if (d <= 0) return;
    const i = toolbarSelIdx(toolbar);
    if (i < 0) return;
    const v = round(parseShiftValue(readShift(toolbar, SHIFT_VARIABLE)));
    const sig = elSig(toolbar, i);
    const cur = known.toolbar[d];
    if (!cur || cur.v !== v || cur.sig !== sig) { known.toolbar[d] = { v, sig }; saveStoreSoon(); }
  }
  function recordTable(table) {
    if (!known || knownPageId !== primaryPageBlockId || !pageBlockEl) return;
    const scope = scopeEl();
    if (!scope || table.getAttribute(ATTRIBUTE) !== 'true' || !scope.contains(table) || inPortalOrInline(table)) return;
    const cls = viewClassOf(table);
    if (!cls) return;
    const key = cls + ':' + depthBetween(table, scope);
    const v = round(parseShiftValue(readShift(table, SHIFT_VARIABLE)));
    if (known.table[key] !== v) { known.table[key] = v; saveStoreSoon(); }
    /* 一番外のビューの値を床に使う */
    if (!(table.parentElement && table.parentElement.closest(VIEW_SELECTORS.join(','))) && known.tableLast !== v) {
      known.tableLast = v;
      saveStoreSoon();
      writeFloorVar();
    }
  }
  function recordHeader(root) {
    if (!known || knownPageId !== primaryPageBlockId) return;
    if (root.getAttribute(STICKY_ATTRIBUTE) !== 'true') return;
    const v = round(parseShiftValue(readShift(root, STICKY_SHIFT_VARIABLE)));
    if (known.header !== v) { known.header = v; saveStoreSoon(); }
  }
  const rootState = new WeakMap();
  function groupStateOf(g) {
    const t = g && g.querySelector(':scope > [aria-expanded]');
    return t ? t.getAttribute('aria-expanded') : null;
  }
  function recordGroup(root) {
    if (!known || knownPageId !== primaryPageBlockId) return;
    if (root.getAttribute(STICKY_ATTRIBUTE) !== 'true') return;
    const g = groupOfRoot.get(root);
    if (!g) return;
    const v = round(parseShiftValue(readShift(root, STICKY_SHIFT_VARIABLE)));
    const sig = groupSigOf(g);
    const cur = known.groupSig;
    if (known.group !== v || !cur || cur.cls !== sig.cls || cur.exp !== sig.exp) {
      known.group = v;
      known.groupSig = sig;
      saveStoreSoon();
    }
    const st = groupStateOf(g);
    if (st) {
      if (!known.groupBy || typeof known.groupBy !== 'object') known.groupBy = {};
      if (known.groupBy[st] !== v) { known.groupBy[st] = v; saveStoreSoon(); }
    }
  }

  /* ============================================================
   *  CSS（v3.1.0 と同一。ポータルのグループ判定に構造を追加しただけ）
   * ============================================================ */
  function installStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        [${ATTRIBUTE}="true"]:not(.sticky-portal-target *):not(.notion-collection_view-block *) {
          transform: translateX(var(${SHIFT_VARIABLE}, 0px)) !important;
        }

        [${STICKY_ATTRIBUTE}="true"]:not(.sticky-portal-target *):not(.notion-collection_view-block *) {
          transform: translateX(var(${STICKY_SHIFT_VARIABLE}, 0px)) !important;
        }

        /* ポータル内コピーはコンテナ変数1本で初回描画からshift済み。
           v3.2.0: グループ判定は ¹² のクラスに加えて構造（開閉ボタンを持つ page-block）でも行う
           （¹² のクラスが付くまでの間も同じ位置で描く）。 */
        .sticky-portal-target[${PORTAL_OWNER_ATTRIBUTE}="true"] > *:has(.notion-table-view-header-row):not(:has(${GROUP_ANY})):not(.notion-collection_view-block *) {
          transform: translateX(var(${PORTAL_HEADER_SHIFT_VARIABLE}, 48px));
        }

        .sticky-portal-target[${PORTAL_OWNER_ATTRIBUTE}="true"] > *:has(${GROUP_ANY}):not(:has(.notion-table-view-header-row)):not(.notion-collection_view-block *) {
          transform: translateX(var(${PORTAL_GROUP_SHIFT_VARIABLE}, 50px));
        }

        .sticky-portal-target[${PORTAL_OWNER_ATTRIBUTE}="true"] > *:has(${GROUP_ANY}):has(.notion-table-view-header-row):not(.notion-collection_view-block *) {
          transform: translateX(var(${PORTAL_HEADER_SHIFT_VARIABLE}, 48px));
        }

        /* v3.0.0: idレスポータル(通常ビューのピン帯)のヘッダーへ既定オン+48。 */
        .sticky-portal-target:not([${PORTAL_OWNER_ATTRIBUTE}="true"]):not(.notion-peek-renderer *):not(:has([data-block-id])) > *:has(.notion-table-view-header-row):not(:has(${GROUP_ANY})):not(.notion-collection_view-block *) {
          transform: translateX(var(${PORTAL_HEADER_SHIFT_VARIABLE}, 48px));
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }
    updateFloorRule();
  }

  // v2.6.0: フロー本体の定数フロア(+48px)。v3.2.0 では作り直された要素へ記憶値を描画前に
  // 付けるので、床が見えるのは「そのページで初めての要素」だけ。
  const VIEWS_IS = ':is(' + VIEW_SELECTORS.join(', ') + ')';
  /* v3.7.0: 床の値（このページで覚えた一番外の表の値。無ければ 48px） */
  function writeFloorVar() {
    let st = document.getElementById(STYLE_ID + '-floor-var');
    if (!st) {
      st = document.createElement('style');
      st.id = STYLE_ID + '-floor-var';
      (document.head || document.documentElement).appendChild(st);
    }
    const v = (known && typeof known.tableLast === 'number') ? known.tableLast : 48;
    const css = ':root { --c05-floor-table: ' + v + 'px; }';
    if (st.textContent !== css) st.textContent = css;
  }
  function updateFloorRule() {
    let floorStyle = document.getElementById(STYLE_ID + '-floor');
    if (!primaryPageBlockId) return;
    const rule = [
      '.notion-collection_view_page-block[data-block-id="' + primaryPageBlockId + '"] div[contenteditable="false"]:not([data-constellucentia-full-db-body-aligned="true"]):not(.notion-collection_view-block *):not(.sticky-portal-target *) { transform: none !important; translate: 48px 0 !important; }',
      '.notion-collection_view_page-block[data-block-id="' + primaryPageBlockId + '"] .notion-table-view:not([data-constellucentia-full-db-body-aligned="true"]):not(.notion-collection_view-block *):not(.sticky-portal-target *) { transform: none !important; translate: 48px 0 !important; }',
      /* v3.7.0: page-block の外にあるビュー本体（メイン枠・一番外のビューだけ）。値はこのページで覚えた表の値 */
      'html[data-c05-full="1"] .notion-frame:not(.notion-peek-renderer *) ' + VIEWS_IS + ':not(' + VIEWS_IS + ' *):not([data-constellucentia-full-db-body-aligned="true"]):not(.notion-collection_view-block *):not(.sticky-portal-target *):not(.notion-peek-renderer *) { transform: none !important; translate: var(--c05-floor-table, 48px) 0 !important; }',
    ].join('\n');
    if (!floorStyle) {
      floorStyle = document.createElement('style');
      floorStyle.id = STYLE_ID + '-floor';
      (document.head || document.documentElement).appendChild(floorStyle);
    }
    if (floorStyle.textContent !== rule) floorStyle.textContent = rule;
  }

  function isVisible(element) {
    if (!(element instanceof Element)) return false;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function round(value) {
    return Math.round(value * 1000) / 1000;
  }

  function parseShiftValue(rawValue) {
    const value = Number.parseFloat(rawValue || "0");
    return Number.isFinite(value) ? value : 0;
  }

  function getInlineStart(rect, direction) {
    if (direction === 'rtl') return window.innerWidth - rect.right;
    return rect.left;
  }

  function uniqueVisibleMatches(selectors) {
    const seen = new Set();
    const result = [];
    for (const selector of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        if (!(element instanceof Element) || seen.has(element) || !isVisible(element)) continue;
        seen.add(element);
        result.push(element);
      }
    }
    return result;
  }

  let titlesMemo = null;
  function getVisibleTitles() {
    if (titlesMemo) return titlesMemo;
    return uniqueVisibleMatches(TITLE_SELECTORS);
  }

  function getFirstCharacterRect(title) {
    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue || '';
      const index = text.search(/\S/u);
      if (index < 0) continue;
      try {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) return rect;
      } catch {}
    }
    return title.getBoundingClientRect();
  }

  function getTitleStart(title) {
    const direction = getComputedStyle(title).direction;
    const rect = getFirstCharacterRect(title);
    return getInlineStart(rect, direction);
  }

  function getBlockId(element) {
    if (!(element instanceof Element)) return null;
    const ownBlock = element.matches('[data-block-id]') ? element : null;
    const descendantBlock = element.querySelector('[data-block-id]');
    const ancestorBlock = element.closest('[data-block-id]');
    return ownBlock?.getAttribute('data-block-id') || descendantBlock?.getAttribute('data-block-id') || ancestorBlock?.getAttribute('data-block-id') || null;
  }

  function findTitleByBlockId(titles, blockId) {
    if (!blockId) return null;
    return titles.find(title => title.closest('[data-block-id]')?.getAttribute('data-block-id') === blockId) || null;
  }

  function findNearestTitle(titles, target) {
    const targetRect = target.getBoundingClientRect();
    const targetScroller = target.closest('.notion-scroller');
    const sameScrollerTitles = titles.filter(title => !targetScroller || title.closest('.notion-scroller') === targetScroller);
    const candidates = sameScrollerTitles.length ? sameScrollerTitles : titles;
    let bestTitle = null;
    let bestDistance = Infinity;
    for (const title of candidates) {
      const rect = title.getBoundingClientRect();
      if (rect.top > targetRect.top + 8) continue;
      const distance = Math.abs(targetRect.top - rect.bottom);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestTitle = title;
      }
    }
    return bestTitle || candidates[0] || null;
  }

  function findTitleForTarget(titles, target) {
    const blockId = getBlockId(target);
    return findTitleByBlockId(titles, blockId) || findNearestTitle(titles, target);
  }

  function getBaselineKey(target, type) {
    const blockId = getBlockId(target);
    return `${type}::${blockId || 'no-block-id'}`;
  }

  function shouldRefreshBaseline(title) {
    if (!(title instanceof Element)) return false;
    const rect = title.getBoundingClientRect();
    return window.scrollY === 0 && rect.top >= 0 && rect.bottom <= window.innerHeight;
  }

  function resolveBaselineTitleStart(title, target, type) {
    const key = getBaselineKey(target, type);
    const currentTitleStart = getTitleStart(title);
    if (!baselineTitleStartByKey.has(key) || shouldRefreshBaseline(title)) {
      baselineTitleStartByKey.set(key, round(currentTitleStart));
    }
    return baselineTitleStartByKey.get(key);
  }

  function getToolbars() {
    const cand = new Set();
    for (const tab of document.querySelectorAll('.notion-collection-view-tab, .notion-collection-view-tab-button, [role="tablist"]')) {
      for (let el = tab.parentElement; el && el !== document.documentElement; el = el.parentElement) {
        if (cand.has(el)) break;
        cand.add(el);
      }
    }
    if (!cand.size) return [];
    const ordered = [...cand].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
    const seen = new Set();
    const result = [];
    for (const selector of TOOLBAR_ROOT_SELECTORS) {
      for (const element of ordered) {
        if (seen.has(element) || !element.matches(selector) || !isVisible(element)) continue;
        seen.add(element);
        result.push(element);
      }
    }
    return filterFullDbElements(result);
  }

  function getToolbarAnchor(toolbar) {
    return toolbar.querySelector('.notion-collection-view-tab-button') ||
      toolbar.querySelector('.notion-collection-view-tab') ||
      toolbar.querySelector('[role="tablist"]') ||
      toolbar;
  }

  function getTables() {
    return filterFullDbElements(uniqueVisibleMatches(VIEW_SELECTORS));
  }

  function getStickyPortalRoot(element) {
    let current = element instanceof Element ? element.parentElement : null;
    let lastBeforePortal = null;
    while (current) {
      if (current.classList?.contains('sticky-portal-target')) return lastBeforePortal;
      lastBeforePortal = current;
      current = current.parentElement;
    }
    return null;
  }

  function getStickyGroupBlocks() {
    const seen = new Set();
    const results = [];
    for (const groupBlock of document.querySelectorAll('.cordivestium-group-block')) {
      if (!(groupBlock instanceof HTMLElement) || !isVisible(groupBlock) || isInlineDatabaseElement(groupBlock)) continue;
      const stickyRoot = groupBlock.closest(STICKY_SEL_INSET) ||
        groupBlock.closest(STICKY_SEL_ANY) ||
        null;
      if (!(stickyRoot instanceof HTMLElement) || seen.has(stickyRoot) || !isVisible(stickyRoot)) continue;
      const nested = results.some(existing => existing.contains(stickyRoot));
      if (nested) continue;
      seen.add(stickyRoot);
      results.push(stickyRoot);
      groupOfRoot.set(stickyRoot, groupBlock);   /* v3.2.0: 記憶用 */
    }
    return results;
  }

  function getStickyTableHeaders() {
    const seen = new Set();
    const results = [];
    for (const headerRow of document.querySelectorAll('.notion-table-view-header-row')) {
      if (!(headerRow instanceof HTMLElement) || !isVisible(headerRow) || isInlineDatabaseElement(headerRow)) continue;
      const stickyRoot = getStickyPortalRoot(headerRow);
      if (!(stickyRoot instanceof HTMLElement) || seen.has(stickyRoot) || !isVisible(stickyRoot)) continue;
      const nested = results.some(existing => existing.contains(stickyRoot));
      if (nested) continue;
      seen.add(stickyRoot);
      results.push(stickyRoot);
    }
    return results;
  }

  function getTableAnchor(table) {
    const headerButton = table.querySelector('.notion-table-view-header-row .notion-table-view-header-cell [role="button"]');
    if (headerButton) return headerButton;

    const headerCell = table.querySelector('.notion-table-view-header-row .notion-table-view-header-cell');
    if (headerCell) return headerCell;

    /* v3.5.0: 表ビューは列見出しが無ければ測らない（手がかりの切り替えで値が変わるのを防ぐ） */
    if (table.matches('.notion-table-view')) return null;

    const firstValue = table.querySelector('.notion-table-view-row .notion-table-view-cell[data-col-index="0"] [data-testid="property-value"]');
    if (firstValue) return firstValue;

    const firstCell = table.querySelector('.notion-table-view-row .notion-table-view-cell[data-col-index="0"]');
    if (firstCell) return firstCell;

    return table.querySelector('.notion-table-view-header-row') ||
      table.querySelector('.notion-table-view-empty-placeholder') ||
      table.querySelector('.notion-board-view-columns') ||
      table.querySelector('.notion-list-view-group') ||
      table.querySelector('.notion-list-view') ||
      table.querySelector('.notion-gallery-view') ||
      table.querySelector('.notion-timeline-view') ||
      table.querySelector('.notion-calendar-view') ||
      table.firstElementChild ||
      table;
  }

  function getStickyGroupAnchor(groupBlock) {
    return groupBlock.querySelector('.cordivestium-group-link') ||
      groupBlock.querySelector('.cordivestium-group-header') ||
      groupBlock.querySelector('.cordivestium-group-text') ||
      groupBlock;
  }

  function getStickyTableAnchor(headerRoot) {
    return headerRoot.querySelector('.notion-table-view-header-cell [role="button"]') ||
      headerRoot.querySelector('.notion-table-view-header-cell') ||
      headerRoot.querySelector('.notion-table-view-header-row') ||
      headerRoot;
  }

  function resetManagedAlignmentForMeasurement() {
    // 廃止: 現在の shift を差し引いて基準座標へ戻す「差引計算」のみ。
  }

  /* v3.2.0: 一瞬見えない要素（切替途中など）は剥がさない＝床48pxへ落とさない */
  function cleanupStale(keepSet, stickyKeepSet) {
    document.querySelectorAll(`[${ATTRIBUTE}]`).forEach(element => {
      if (keepSet.has(element)) return;
      if (!(element instanceof HTMLElement)) return;
      if (element.isConnected && !isVisible(element)) return;
      element.removeAttribute(ATTRIBUTE);
      element.removeAttribute(TYPE_ATTRIBUTE);
      clearShift(element, SHIFT_VARIABLE);
    });
    document.querySelectorAll(`[${STICKY_ATTRIBUTE}]`).forEach(element => {
      if (stickyKeepSet.has(element)) return;
      if (!(element instanceof HTMLElement)) return;
      if (element.isConnected && !isVisible(element)) return;
      element.removeAttribute(STICKY_ATTRIBUTE);
      element.removeAttribute(STICKY_TYPE_ATTRIBUTE);
      clearShift(element, STICKY_SHIFT_VARIABLE);
    });
  }

  function guardAccepts(guardKey, delta) {
    const now = Date.now();
    if (pendingGuard && pendingGuard.key === guardKey && now - pendingGuard.at > GUARD_CONFIRM_TIMEOUT_MS) {
      pendingGuard = null;
      lastDeltaByKey.set(guardKey, delta);
      return true;
    }
    if (pendingGuard && pendingGuard.key === guardKey) {
      if (Math.abs(delta - pendingGuard.delta) <= GUARD_CONFIRM_PX) {
        pendingGuard = null;
        lastDeltaByKey.set(guardKey, delta);
        return true;
      }
      pendingGuard = { key: guardKey, delta: delta, at: now };
      scheduleScan('guard-confirm');
      return false;
    }
    const previousDelta = lastDeltaByKey.get(guardKey);
    if (previousDelta !== undefined) {
      if (Math.abs(delta - previousDelta) > JUMP_GUARD) {
        pendingGuard = { key: guardKey, delta: delta, at: now };
        scheduleScan('guard-confirm');
        return false;
      }
      lastDeltaByKey.set(guardKey, delta);
      return true;
    }
    if (Math.abs(delta) > JUMP_GUARD) {
      pendingGuard = { key: guardKey, delta: delta, at: now };
      scheduleScan('guard-confirm');
      return false;
    }
    lastDeltaByKey.set(guardKey, delta);
    return true;
  }

  function floorShiftOf(element) {
    try {
      const t = getComputedStyle(element).translate;
      if (!t || t === 'none') return 0;
      return parseShiftValue(String(t).split(/\s+/)[0]);
    } catch { return 0; }
  }

  function alignElement({ element, anchor, title, type }) {
    if (!element || !anchor || !title) return null;
    if (!isVisible(element) || !isVisible(anchor) || !isVisible(title)) return null;

    if (primaryPageBlockId) {
      const owningPageBlock = element.closest('.notion-collection_view_page-block');
      const owningPageId = owningPageBlock?.getAttribute('data-block-id') || null;
      if (owningPageId && owningPageId !== primaryPageBlockId) return null;
    }

    /* v3.7.0: まだ印の無い要素は床（CSS の translate）で動いているので、その分を差し引く */
    const currentShift = element.getAttribute(ATTRIBUTE) === 'true'
      ? parseShiftValue(readShift(element, SHIFT_VARIABLE))
      : floorShiftOf(element);
    const direction = getComputedStyle(anchor).direction;
    const titleStart = resolveBaselineTitleStart(title, element, type);
    const anchorStart = getInlineStart(anchor.getBoundingClientRect(), direction) - currentShift;
    const delta = snapPx(round(titleStart - anchorStart));

    const guardKey = `body:${primaryPageBlockId || 'unknown'}:${type}`;
    if (!guardAccepts(guardKey, delta)) return null;

    const previousRaw = element.getAttribute(ATTRIBUTE) === 'true' ? readShift(element, SHIFT_VARIABLE) : '';
    if (shouldWrite(element, previousRaw, delta)) {
      if (!previousRaw || parseShiftValue(previousRaw) !== delta) logWrite(element, type, previousRaw ? parseShiftValue(previousRaw) : null, delta, previousRaw ? '実測（書き直し）' : '実測（初回）');
      writeShift(element, SHIFT_VARIABLE, delta);
    }
    if (element.getAttribute(ATTRIBUTE) !== 'true') element.setAttribute(ATTRIBUTE, 'true');
    if (element.getAttribute(TYPE_ATTRIBUTE) !== type) element.setAttribute(TYPE_ATTRIBUTE, type);

    return {
      titleStart: round(titleStart),
      anchorStart: round(anchorStart),
      delta
    };
  }

  function alignStickyElement({ element, anchor, title, type }) {
    if (!element || !anchor || !title) return null;
    if (!isVisible(element) || !isVisible(anchor) || !isVisible(title)) return null;

    if (primaryPageBlockId && getBlockId(element) !== primaryPageBlockId) return null;

    const currentShift = parseShiftValue(readShift(element, STICKY_SHIFT_VARIABLE));
    const direction = getComputedStyle(anchor).direction;
    const titleStart = resolveBaselineTitleStart(title, element, type);
    const anchorStart = getInlineStart(anchor.getBoundingClientRect(), direction) - currentShift;
    const delta = snapPx(round(titleStart - anchorStart));

    const stickyGuardKey = `sticky:${primaryPageBlockId || 'unknown'}:${type}`;
    if (!guardAccepts(stickyGuardKey, delta)) return null;

    const previousStickyRaw = element.getAttribute(STICKY_ATTRIBUTE) === 'true' ? readShift(element, STICKY_SHIFT_VARIABLE) : '';
    if (shouldWrite(element, previousStickyRaw, delta)) {
      if (!previousStickyRaw || parseShiftValue(previousStickyRaw) !== delta) logWrite(element, type, previousStickyRaw ? parseShiftValue(previousStickyRaw) : null, delta, previousStickyRaw ? '実測（書き直し）' : '実測（初回）');
      writeShift(element, STICKY_SHIFT_VARIABLE, delta);
    }
    if (element.getAttribute(STICKY_ATTRIBUTE) !== 'true') element.setAttribute(STICKY_ATTRIBUTE, 'true');
    if (element.getAttribute(STICKY_TYPE_ATTRIBUTE) !== type) element.setAttribute(STICKY_TYPE_ATTRIBUTE, type);

    return {
      titleStart: round(titleStart),
      anchorStart: round(anchorStart),
      delta
    };
  }

  function deferOrRun() {
    const now = Date.now();
    if (now - lastScrollActivityAt < SCROLL_QUIET_MS) {
      if (!firstDeferralAt) firstDeferralAt = now;
      if (now - firstDeferralAt < APPLY_MAX_WAIT_MS) return false;
    }
    firstDeferralAt = 0;
    return true;
  }

  function scheduleScan() {
    if (state.destroyed) return;
    clearTimeout(scanTimer);
    scanPending = true;
    scanTimer = window.setTimeout(apply, veiled() ? 40 : SCAN_DELAY);
  }

  function scheduleScrollApply() {
    if (state.destroyed) return;
    lastScrollActivityAt = Date.now();
    clearTimeout(scrollSettleTimer);
    scrollSettleTimer = window.setTimeout(() => {
      scrollSettleTimer = null;
      apply();
    }, SCROLL_QUIET_MS);
  }

  function confirmPageContext() {
    if (primaryPageBlockId === stablePageBlockId) {
      candidatePageBlockId = null;
      return;
    }
    if (primaryPageBlockId === candidatePageBlockId) {
      stablePageBlockId = primaryPageBlockId;
      candidatePageBlockId = null;
      lastDeltaByKey.clear();
      baselineTitleStartByKey.clear();
      pendingGuard = null;
      transitionQuietUntil = Date.now() + TRANSITION_QUIET_MS;
      document.querySelectorAll('.sticky-portal-target').forEach(portal => {
        if (portal instanceof HTMLElement) portal.removeAttribute(PORTAL_OWNER_ATTRIBUTE);
      });
      markPortalOwnership();   /* v3.2.0: 剥がした直後に同期で付け直す（描画の隙間を作らない） */
      return;
    }
    candidatePageBlockId = primaryPageBlockId;
    candidateSince = Date.now();
  }

  /* ポータル所有マーク: JSは所属の証明のみ（数値はCSS）。v3.2.0: 描画前に同期で呼ぶ。
     レイアウトは読まない（blockId の一致だけ）。 */
  function markPortalOwnership() {
    if (!primaryPageBlockId) {
      syncPage();
      if (!primaryPageBlockId) {
        const title = getVisibleTitles()[0] || null;
        if (title) primaryPageBlockId = getBlockId(title);
      }
    }
    if (!primaryPageBlockId) return;
    for (const portal of document.querySelectorAll('.sticky-portal-target')) {
      if (!(portal instanceof HTMLElement)) continue;
      if (portal.getAttribute(PORTAL_OWNER_ATTRIBUTE) === 'true') continue;
      let owned = null;
      for (const row of portal.querySelectorAll('.notion-table-view-header-row, .cordivestium-group-block, .notion-collection_view_page-block:has(> [aria-expanded])')) {
        const id = getBlockId(row);
        if (!id) continue;
        if (id === primaryPageBlockId) { owned = true; break; }
        owned = false;
      }
      if (owned === null) {
        if (portal.querySelector('[data-block-id]')) {
          portal.setAttribute(PORTAL_OWNER_ATTRIBUTE, 'false');
        }
        continue;
      }
      const v = owned ? 'true' : 'false';
      if (portal.getAttribute(PORTAL_OWNER_ATTRIBUTE) !== v) portal.setAttribute(PORTAL_OWNER_ATTRIBUTE, v);
    }
  }

  const OWNERSHIP_TOKEN_KEY = '__constellucentiaFullDbAlignOwnershipToken__';
  const ownershipToken = {};
  window[OWNERSHIP_TOKEN_KEY] = ownershipToken;

  /* 互換のため名前を残す（v3.2.0: 待たずに同期で実行） */
  function ownershipLoop() {
    if (state.destroyed || window[OWNERSHIP_TOKEN_KEY] !== ownershipToken) return;
    try { markPortalOwnership(); } catch {}
  }

  function apply() {
    scanPending = false;
    if (state.destroyed) return;
    if (!deferOrRun()) {
      scheduleScrollApply();
      return;
    }
    state.scans += 1;
    state.lastRunAt = new Date().toISOString();

    try {
      installStyle();
      resetManagedAlignmentForMeasurement();

      titlesMemo = null;
      const titles = getVisibleTitles();
      titlesMemo = titles;
      /* v3.5.0: タイトルが一瞬見えないだけで primaryPageBlockId を消さない（消すと描画前の記憶値付与が止まる） */
      const titleBlockId = getBlockId(titles[0] || null);
      if (titleBlockId) primaryPageBlockId = titleBlockId;

      if (!titleBlockId) {
        state.lastResult = 'page-title-not-found';
        scheduleScan();
        return;
      }

      syncPage();
      confirmPageContext();
      updateFloorRule();

      /* v3.3.0: ¹⁸ が表を押さえている間は測らない（押さえ分が実測に混ざる） */
      if (document.querySelector(C18_HOLD_SEL)) {
        state.lastResult = 'c18-holding';
        stamp();
        scheduleScan();
        return;
      }

      if (Date.now() < transitionQuietUntil) {
        state.lastResult = 'transition-quiet';
        stamp();
        scheduleScan();
        return;
      }

      const toolbars = getToolbars();
      const tables = getTables();
      const stickyGroups = getStickyGroupBlocks();
      const stickyHeaders = getStickyTableHeaders();
      const keep = new Set([...toolbars, ...tables]);
      const stickyKeep = new Set([...stickyGroups, ...stickyHeaders]);

      let aligned = 0;

      for (const toolbar of toolbars) {
        const title = findTitleForTarget(titles, toolbar);
        const anchor = getToolbarAnchor(toolbar);
        if (alignElement({ element: toolbar, anchor, title, type: 'toolbar' })) {
          aligned += 1;
          recordToolbar(toolbar, anchor);
        }
      }

      for (const table of tables) {
        const title = findTitleForTarget(titles, table);
        const anchor = getTableAnchor(table);
        if (alignElement({ element: table, anchor, title, type: 'table' })) {
          aligned += 1;
          recordTable(table);
        }
      }

      for (const stickyGroup of stickyGroups) {
        const title = findTitleForTarget(titles, stickyGroup);
        const anchor = getStickyGroupAnchor(stickyGroup);
        if (alignStickyElement({ element: stickyGroup, anchor, title, type: 'sticky-group' })) {
          aligned += 1;
          recordGroup(stickyGroup);
        }
      }

      for (const stickyHeader of stickyHeaders) {
        const title = findTitleForTarget(titles, stickyHeader);
        const anchor = getStickyTableAnchor(stickyHeader);
        if (alignStickyElement({ element: stickyHeader, anchor, title, type: 'sticky-table-header' })) {
          aligned += 1;
          recordHeader(stickyHeader);
        }
      }

      cleanupStale(keep, stickyKeep);
      state.applications += aligned > 0 ? 1 : 0;
      state.lastResult = aligned > 0 ? 'full-database-body-aligned' : 'body-found-but-not-aligned';
      state.lastError = null;
    } catch (error) {
      state.lastResult = 'alignment-error';
      state.lastError = String(error?.stack || error?.message || error);
    } finally {
      titlesMemo = null;
    }
  }

  function installResizeObserver() {
    if (resizeObserver || typeof ResizeObserver !== 'function') return;
    resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(scheduleScan, 80);
    });
    resizeObserver.observe(document.documentElement);
  }

  function installObserver() {
    if (observer) return;
    const IGNORE = '.notion-sidebar-container, #c16-root, #c16-line, #c16-menu';
    observer = new MutationObserver((recs) => {
      if (state.destroyed) return;
      let hit = false;
      for (const r of recs) {
        if (r.type === 'childList' && !r.addedNodes.length && !r.removedNodes.length) continue;
        const t = r.target && (r.target.nodeType === 1 ? r.target : r.target.parentElement);
        if (!t || t.closest(IGNORE)) continue;
        hit = true; break;
      }
      if (!hit) return;
      /* v3.2.0: ここは描画前。記憶値の付与と所有マークを同期で行う（レイアウトは読まない） */
      try {
        syncPage();
        stamp();
        markPortalOwnership();
      } catch (e) {
        state.lastError = String(e?.stack || e?.message || e);
      }
      if (document.hidden) return;
      scheduleScan();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-block-id', 'aria-selected', 'aria-expanded']
    });
    installResizeObserver();
    const onResize = () => scheduleScan();
    removeResizeListener = () => window.removeEventListener('resize', onResize);
    window.addEventListener('resize', onResize, { passive: true });

    const onScroll = (e) => {
      const t = e && e.target;
      if (t && t.nodeType === 1 && t.closest('.notion-sidebar-container')) return;
      scheduleScrollApply();
    };
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    removeScrollListener = () => {
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('scroll', onScroll);
    };

    const onNavigation = () => scheduleScan();
    window.addEventListener('popstate', onNavigation, { passive: true });
    window.addEventListener('hashchange', onNavigation, { passive: true });
    removeNavigationListener = () => {
      window.removeEventListener('popstate', onNavigation);
      window.removeEventListener('hashchange', onNavigation);
    };
    let lastHref = location.href;
    hrefTimer = window.setInterval(() => {
      if (document.hidden) return;
      if (location.href !== lastHref) {
        lastHref = location.href;
        scheduleScan();
      }
    }, 1500);
  }

  function destroy() {
    state.destroyed = true;
    clearTimeout(scanTimer);
    clearTimeout(confirmTimer);
    clearTimeout(resizeTimer);
    clearTimeout(scrollSettleTimer);
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = 0; saveStoreNow(); }
    clearInterval(hrefTimer);
    hrefTimer = 0;
    observer?.disconnect();
    resizeObserver?.disconnect();
    observer = null;
    resizeObserver = null;
    if (removeResizeListener) removeResizeListener();
    if (removeScrollListener) removeScrollListener();
    if (removeNavigationListener) removeNavigationListener();
    document.querySelectorAll(`[${ATTRIBUTE}]`).forEach(element => {
      if (!(element instanceof HTMLElement)) return;
      element.removeAttribute(ATTRIBUTE);
      element.removeAttribute(TYPE_ATTRIBUTE);
      clearShift(element, SHIFT_VARIABLE);
    });
    document.querySelectorAll(`[${STICKY_ATTRIBUTE}]`).forEach(element => {
      if (!(element instanceof HTMLElement)) return;
      element.removeAttribute(STICKY_ATTRIBUTE);
      element.removeAttribute(STICKY_TYPE_ATTRIBUTE);
      clearShift(element, STICKY_SHIFT_VARIABLE);
    });
    document.querySelectorAll('.sticky-portal-target').forEach(portal => {
      if (!(portal instanceof HTMLElement)) return;
      portal.style.removeProperty(PORTAL_HEADER_SHIFT_VARIABLE);
      portal.style.removeProperty(PORTAL_GROUP_SHIFT_VARIABLE);
      portal.removeAttribute(PORTAL_OWNER_ATTRIBUTE);
    });
    document.querySelectorAll('style[id^="constellucentia-full-db-body-alignment-style-"]').forEach(style => style.remove());
    document.documentElement.removeAttribute(FULL_FLAG);
  }

  const previous = window[RUNTIME_KEY];
  if (previous && typeof previous.destroy === 'function') {
    try { previous.destroy(); } catch {}
  }

  window[RUNTIME_KEY] = {
    version: VERSION,
    apply,
    scan: apply,
    destroy,
    stamp: () => { syncPage(); return stamp(); },
    known: () => ({ pageId: knownPageId, values: known ? JSON.parse(JSON.stringify(known)) : null }),
    resetKnown: (all) => {
      if (all) store = { pages: {}, order: [] };
      else if (knownPageId) delete store.pages[knownPageId];
      saveStoreNow();
      known = knownPageId ? knownFor(knownPageId) : null;
      scheduleScan();
      return all ? '全ページの記憶を消しました' : 'このページの記憶を消しました（次の実測で覚え直します）';
    },
    /* v3.5.0: 幕（²¹）向け — まだ書くかもしれない間は true */
    busy: () => !!(pageBlockEl && pageBlockEl.isConnected) &&
      state.lastResult !== 'page-title-not-found' &&
      (scanPending || !!confirmPending()),
    /* v3.6.0: 幕（²¹）向け。フルDBでなければ常に true */
    settled: () => {
      try {
        syncPage();
        if (!pageBlockEl || !pageBlockEl.isConnected) return true;
        if (state.lastResult === 'page-title-not-found') return true;
        if (scanPending || confirmPending()) return false;
        for (const sel of VIEW_SELECTORS) {
          for (const v of (scopeEl() || pageBlockEl).querySelectorAll(sel)) {
            if (inPortalOrInline(v)) continue;
            if (v.parentElement && v.parentElement.closest(VIEW_SELECTORS.join(','))) continue;   /* 入れ子は見ない */
            if (v.getAttribute(ATTRIBUTE) === 'true') continue;
            /* 列見出しの無い表（グループを全部閉じている等）は測れないので待たない */
            if (v.matches('.notion-table-view') && !v.querySelector('.notion-table-view-header-row')) continue;
            return false;
          }
        }
        const tab = firstFlowTab();
        if (tab && !tab.closest(`[${ATTRIBUTE}="true"]`)) return false;
        return true;
      } catch (e) { return true; }
    },
    log: () => { console.table(writeLog.length ? writeLog : [{ 記録: 'まだありません' }]); return writeLog.length; },
    getState: () => ({
      version: VERSION,
      target: null,
      scans: state.scans,
      applications: state.applications,
      stamps: state.stamps,
      lastResult: state.lastResult,
      lastError: state.lastError,
      lastRunAt: state.lastRunAt,
      primaryPageBlockId: primaryPageBlockId,
      stablePageBlockId: stablePageBlockId,
      fullDbPage: !!pageBlockEl,
      knownPages: store.order.length,
    }),
  };

  // v2.5.1: 起動時にポータル容器の毒変数(48/50以外)を掃除する。
  document.querySelectorAll('.sticky-portal-target').forEach(portal => {
    if (!(portal instanceof HTMLElement)) return;
    for (const varName of [PORTAL_HEADER_SHIFT_VARIABLE, PORTAL_GROUP_SHIFT_VARIABLE]) {
      const value = (portal.style.getPropertyValue(varName) || '').trim();
      if (value && value !== '48px' && value !== '50px') portal.style.removeProperty(varName);
    }
  });

  installStyle();
  document.querySelectorAll(`[${VAL_ATTR}], [${STICKY_VAL_ATTR}]`).forEach(el => {
    const a = el.getAttribute(VAL_ATTR); if (a) ensureValue(a);
    const b = el.getAttribute(STICKY_VAL_ATTR); if (b) ensureValue(b);
  });
  installObserver();
  try { syncPage(); stamp(); markPortalOwnership(); } catch {}
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !state.destroyed) { scheduleScan(); ownershipLoop(); }
  });
  window.addEventListener('pagehide', () => { if (saveTimer) { clearTimeout(saveTimer); saveTimer = 0; saveStoreNow(); } });
  requestAnimationFrame(() => requestAnimationFrame(apply));
})();