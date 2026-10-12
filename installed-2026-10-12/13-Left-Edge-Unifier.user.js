// ==UserScript==
// @name         « No »　¹³ _ Left-Edge Unifier
// @namespace    constellucentia
// @version      19.3.0
// @description  v19.3.0: 題字とリレーションを形で見分ける（⁰⁹ の印を待たない）— 題字＝アイコン（role=button）の入れ物＋文字の段、リレーション＝折り返す段の中のチップ。題字が 2 列目以降の表（Medias の Index 等）で題字をリレーション列と取り違え、アイコンの入れ物に -1.6px の寄せを当ててアイコンが文字より下にずれていたのを修正。リレーション列の寄せはリレーションの形のセルだけに付ける。フルDBの本文セル左端の統一（インラインDB・ピーク・通常ページは対象外）。v9.3: 今の Notion では表・タブがタイトルの page-block の外にあるため、v9 の「page-block の中だけ」判定で本文・タブ・列見出しの処理が止まっていたのを修正（フルDBページ＝html[data-c05-full] のメイン枠なら対象）。v9.2: ⁰⁵ v3.4.0 が html[data-c05-full] を付けるようになり、グループ見出しの寄せが初めて効くため、効かないまま積み上がっていた値を一度だけ 0 に戻して測り直す。v9.1: 描画のたびのアイコンのずれを除去（列見出し1列目の印を最初のフレームから付ける・ピン留め見出しにも付ける／タブの道筋を複数記憶して上書き合戦をやめる／タブ・見出しの自動寄せは一度合ったら入室のたびに測り直さない）。① リレーション列 -1.6px（v9: 列ごと全行・描画前に印） ② タイトル列 ⁰⁹ のアイコン箱 margin +2px ③ 基準は「DBヘッダー1列目」（読むだけ）。タブのアイコン/文字を translate で寄せる（印は描画前に同期で付ける）。グループ見出しのアイコンは構造セレクタで translate（印なし）。文字は ¹² の gap。④ v9: 測り直しは静かな時だけ・2回一致・0.5px以上の差だけ（タブ切替・スクロール中は書かない）。⁰⁵ Layout Lock の値が変わったら追従。線の実測表は __c12.rows()。
// @match        *://www.notion.so/*
// @match        *://app.notion.so/*
// @match        *://www.notion.com/*
// @match        *://app.notion.com/*
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

/*
 * ============================================================
 *  v9.3.0（2026-09-30）
 *    inScope(): v9.0 で足した「.notion-collection_view_page-block の中だけ」は、表・タブが page-block の
 *    外にある今の構造では何も通さず、リレーション列 -1.6px・列見出しの印・タブのラインが効いていなかった。
 *    → フルDBページ（html[data-c05-full="1"]、⁰⁵ v3.4.0 以降が付ける）のメイン枠（.notion-frame）なら対象。
 *      従来の「page-block の中」も引き続き対象。peek・インラインDB（.notion-collection_view-block）は除外。
 * ============================================================
 *  v9.2.0（2026-09-30）
 *    ⁰⁵ v3.4.0 から html[data-c05-full="1"] が付く → グループ見出しアイコンの translate（構造セレクタ）が初めて効く。
 *    それまで効かないまま測り直しで積み上がった group-icon の値を一度だけ 0 に戻し、ラインを測り直す。
 * ============================================================
 *  v9.1.0（2026-09-30）— 「描画のたびにアイコンがずれる」をなくす
 * ============================================================
 *  v9.0.0 の問題:
 *    ・列見出し1列目の印（data-c12-headwrap: 左 4px）は ⁰⁹ の印が見つかるまで付かなかった（ready() の関門）
 *      → 見出しが作り直されるたび、最初の数フレームは印なしで描かれてから 4px 動く
 *    ・ピン留めされた列見出し（スクロールで上に貼り付く複製）には印が付かない → 貼り付いた瞬間に 4px 違う
 *    ・タブの道筋を 1 つしか覚えない → 形の違うタブ（選択中／アイコンなし等）を実測するたびに上書き
 *      → 次に描かれるタブは道筋が合わず、1フレーム素の位置で描かれてから動く（交互に繰り返す）
 *    ・ページに入るたび 5 秒後にタブの寄せを測り直し、0.5px 以上なら書き直す → 入室後に動く
 *    ・グループ見出しの寄せは効かないセレクタ（html[data-c05-full] はどこも付けていない）なのに
 *      測り直しで値だけが積み上がっていた
 *  v9.1.0:
 *    ① 列見出しの印は構造だけで即付ける（関門なし）。ピン留めの複製にも同じ印
 *    ② タブの道筋は最大 8 通り記憶し、描画前にすべて試す（上書きしない）
 *    ③ タブ・グループの寄せ（ライン）の自動測り直しは「まだ合わせたことが無い時」「窓の大きさ変更」
 *       「__c12.recalibrate()」だけ。初めて見るビューの測り直しはリレーション列だけを覚える
 *    ④ html[data-c05-full] が無い時はグループ見出しのラインを測らない（効かない値を積まない）
 *    ⑤ ¹⁸ が表を押さえている間（[data-c18-shift]）は測らない
 * ============================================================
 *  v9.0.0（2026-09-29）— 「後から動く」をなくす
 * ============================================================
 *  v8.3.0 の問題:
 *    ・印（headwrap / タブの data-c12-ln / リレーション列の inset）が rAF で付く
 *      → タブ切替・スクロールで要素が作り直されるたび、1フレーム素の位置で描かれてから動く
 *    ・線の自動整列が「変化のたび」「5秒ごと」に走り、0.3px 超で書き直す → 切替直後に動く
 *    ・リレーション列の -1.6px は各列の「先頭行1つ」にしか付かない → スクロールで行が替わると揺れる
 *    ・表の 48px ルールは存在しない class 名で書かれていた（効いていない／効くならインラインDB に当たる）→ 撤去
 *  v9.0.0:
 *    ① 印は MutationObserver のコールバック（描画前）で同期に付ける。レイアウトの読み取りはしない
 *       ・タブ: 一度実測した「アイコン側/文字側の子の位置（子番号の道筋）」を保存し、以後は道筋で直接付ける
 *       ・ヘッダー1列目: 構造だけで付ける
 *       ・リレーション列: ビュー（ページid＋?v=）ごとに列番号(data-col-index)を保存し、追加された行に即付ける
 *    ② グループ見出しのアイコンは構造セレクタで translate（¹² のクラスを待たない）
 *    ③ 測り直し（読む→書く）は静かな時だけ・2回一致・0.5px 以上の差だけ
 *       きっかけ: ページに入って 5 秒後 / ⁰⁵ の変数が変わった 0.9 秒後 / 窓の大きさ変更 / 初めて見るビュー
 *    ④ 起動は document-start で即（<style> と監視を最初のフレームから）
 * ============================================================
 *  v8.3.0（2026-09-27）— 基準点を「DBヘッダー1列目」に固定
 *  v8.1.0（2026-09-24）— タブは既定で触らない（padding 方式は既定 OFF のまま）
 *  v8.0.0（2026-09-23）— タブとグループ見出しを「ヘッダー線」へ
 *  v7.0.0（2026-09-23）— タイトル列（⁰⁹）: アイコン箱 margin -2px → +2px
 *  v6.0.0（2026-09-23）— リレーション列 -1.6px を詳細度 (0,5,0) で確実に適用
 * ============================================================
 */

(() => {
  'use strict';

  /* ── 軽量化の番人（サイドバー・編集中の文字だけの変化は捨てる／ドラッグ中は後回し）── */
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

  const VERSION = '9.3.0';
  const TAGW = '[C12-Unifier v' + VERSION + ']';
  const PREFIX = 'constellucentia-left-edge-unifier-';
  const STYLE_ID_BASE = PREFIX + 'style-v900-base';
  const STYLE_ID_BODY = PREFIX + 'style-v900-body';
  const r2 = (v) => Math.round(v * 100) / 100;
  const r1 = (v) => Math.round(v * 10) / 10;

  if (document.getElementById(STYLE_ID_BASE)) return;

  /* ============================================================
   *  数字（ここだけ見れば全部わかる）
   * ============================================================ */
  let msValue = -1.6;            // リレーション列に書く margin-left
  let titleMs = 2.0;             // タイトル列（⁰⁹）のアイコン箱 margin-inline-start
  let titleEnabled = true;
  let tabPad = 8.0;              // v8.1.0 の padding 方式（既定 OFF）
  let tabGap = 4.0;
  const msByName = new Map();
  const TOLERANCE_PX = 0.6;
  const MAX_MS_PX = 24;
  const HEADER_OFFSET = 8.0;
  const HEADER_INK_OFFSET = 6.4;
  let forced = false;

  /* 測り直しの条件 */
  const MIN_DRIFT = 0.5;         // これ未満の差は書かない
  const LN_TOL = 0.3;            // 2回の測定がこの範囲で一致した時だけ採用
  const SAMPLE_GAP_MS = 350;
  const QUIET_MUT_MS = 500;
  const QUIET_SCROLL_MS = 800;
  const QUIET_SWITCH_MS = 1200;
  const CAL_GIVEUP_MS = 12000;
  const ENTER_MS = 5000;         // ⁰⁵ の 4 秒の測り直しの後
  const C05_FOLLOW_MS = 900;
  const NEWVIEW_MS = 1500;
  const RESIZE_MS = 800;

  /* ライン（ヘッダー1列目を基準にした translate）— v8.3.0 の保存値をそのまま使う */
  const LS_LINES = 'c12-lines-v830';
  const LN_KEYS = ['tab-icon', 'tab-text', 'group-icon'];
  const LN_MAX = 16;
  const LN = { 'tab-icon': 0, 'tab-text': 0, 'group-icon': 0 };
  const lnTries = { 'tab-icon': 0, 'tab-text': 0, 'group-icon': 0 };
  let linesOn = true;
  let linesCal = false;          // v9.1: 一度合わせたら true（入室のたびには測り直さない）
  let lastLines = {};
  try {
    const o = JSON.parse(localStorage.getItem(LS_LINES) || 'null');
    if (o && typeof o === 'object') {
      linesOn = o.on !== false;
      linesCal = o.cal === true;
      if (o.dx && typeof o.dx === 'object') {
        for (const k of LN_KEYS) { const v = Number(o.dx[k]); if (isFinite(v) && Math.abs(v) <= LN_MAX) LN[k] = v; }
      }
    }
    localStorage.removeItem('c12-table-ms-v820');
  } catch (e) { /* noop */ }
  const saveLines = () => {
    try { localStorage.setItem(LS_LINES, JSON.stringify({ on: linesOn, dx: LN, cal: linesCal })); } catch (e) { /* noop */ }
  };
  /* v9.2: 一度だけ — 効いていなかったグループ見出しの値を捨てて測り直す */
  try {
    if (localStorage.getItem('c13-mig-v92') !== '1') {
      LN['group-icon'] = 0;
      linesCal = false;
      saveLines();
      localStorage.setItem('c13-mig-v92', '1');
    }
  } catch (e) { /* noop */ }

  /* v9: タブの「アイコン側/文字側」の子番号の道筋（一度実測したら保存） */
  const LS_TABPATH = 'c13-tabpath-v9';
  const LS_TABPATHS = 'c13-tabpaths-v91';   // v9.1: 形の違うタブごとに複数
  const TABPATH_MAX = 8;
  let TABPATHS = [];
  try {
    const o = JSON.parse(localStorage.getItem(LS_TABPATHS) || 'null');
    if (Array.isArray(o)) TABPATHS = o.filter((x) => x && Array.isArray(x.a) && Array.isArray(x.b)).slice(0, TABPATH_MAX);
    if (!TABPATHS.length) {
      const old = JSON.parse(localStorage.getItem(LS_TABPATH) || 'null');
      if (old && Array.isArray(old.a) && Array.isArray(old.b)) TABPATHS = [old];
    }
  } catch (e) { /* noop */ }
  const saveTabPaths = () => { try { localStorage.setItem(LS_TABPATHS, JSON.stringify(TABPATHS)); } catch (e) { /* noop */ } };
  const addTabPath = (pa, pb) => {
    const k = JSON.stringify([pa, pb]);
    if (TABPATHS.some((x) => JSON.stringify([x.a, x.b]) === k)) return;
    TABPATHS.unshift({ a: pa, b: pb });
    if (TABPATHS.length > TABPATH_MAX) TABPATHS.length = TABPATH_MAX;
    saveTabPaths();
  };

  /* v9: リレーション列の列番号（ビュー＝ページid＋?v= ごと） */
  const LS_REL = 'c13-relcols-v9';
  const REL_MAX = 300;
  let REL = { map: {}, order: [] };
  try {
    const o = JSON.parse(localStorage.getItem(LS_REL) || 'null');
    if (o && o.map && typeof o.map === 'object') REL = { map: o.map, order: Array.isArray(o.order) ? o.order : Object.keys(o.map) };
  } catch (e) { /* noop */ }
  const saveRel = () => { try { localStorage.setItem(LS_REL, JSON.stringify(REL)); } catch (e) { /* noop */ } };

  const SPEC = '[data-c12-inset][data-c12-inset][data-c12-inset][data-c12-inset]';
  const NOT_CORDI = ':not([class*="cordivestium"])';

  /* グループ見出しのアイコン（構造・²¹ と同じ前提。印を待たない） */
  const GROUP_ICON_SEL =
    'html[data-c05-full="1"] .notion-collection_view_page-block:has(> [role="button"][aria-expanded])' +
    ':not(.notion-collection_view-block *):not(.notion-peek-renderer *)' +
    ' > a[role="link"] > div:has(.notion-record-icon) > :is(.notion-record-icon, :has(.notion-record-icon))';

  /* ---------- 固定CSS ---------- */
  const CSS_BASE = `
.notion-collection-view-tab-button [role="tab"][data-c12-tab] {
  padding-left: var(--c12-tab-pad, 8px) !important;
}
.notion-collection-view-tab-button [role="tab"][data-c12-tab] > div[style*="mask"],
.notion-collection-view-tab-button [role="tab"][data-c12-tab] > div:first-child {
  margin-inline-end: var(--c12-tab-gap, 4px) !important;
}
[data-c12-headwrap] {
  padding-left: 4px !important;
}
[data-c12-headwrap] > div {
  gap: 4px !important;
}
/* ¹³ᵇ（Group Icon Ink Aligner）の translateX を打ち消す */
.cordivestium-group-icon [data-c13g-k][data-c13g-k][data-c13g-k] {
  transform: none !important;
}
`;

  /* ---------- 本文 + ライン ---------- */
  const cssBody = () => {
    const out = [];
    out.push('html:root {');
    out.push('  --c12-tab-pad: ' + tabPad + 'px !important;');
    out.push('  --c12-tab-gap: ' + tabGap + 'px !important;');
    out.push('}');
    out.push('.notion-table-view .notion-table-view-row ' + SPEC + NOT_CORDI + ' {');
    out.push('  margin-left: ' + msValue + 'px !important;');
    out.push('  margin-inline-start: ' + msValue + 'px !important;');
    out.push('  padding-left: 0 !important;');
    out.push('  padding-inline-start: 0 !important;');
    out.push('}');
    for (const [name, v] of Array.from(msByName.entries())) {
      out.push('.notion-table-view .notion-table-view-row ' + SPEC + '[data-c12-mskey="' + String(name).replace(/["\\]/g, '') + '"]' + NOT_CORDI + ' {');
      out.push('  margin-left: ' + v + 'px !important;');
      out.push('  margin-inline-start: ' + v + 'px !important;');
      out.push('}');
    }
    if (titleEnabled) {
      out.push('html:root { --cordivestium-title-icon-margin-inline-start: ' + titleMs + 'px !important; }');
      out.push('.notion-table-view .notion-table-view-row .cordivestium-v1121-title-icon-root {');
      out.push('  margin-inline-start: ' + titleMs + 'px !important;');
      out.push('  margin-left: ' + titleMs + 'px !important;');
      out.push('}');
    }
    out.push('.notion-table-view .notion-table-view-row [data-c12-inset] .notion-record-icon {');
    out.push('  padding-left: 0 !important;');
    out.push('  padding-right: 0 !important;');
    out.push('}');
    if (linesOn) {
      out.push('/* ヘッダー1列目を基準に translate（レイアウト不変） */');
      const sel = {
        'tab-icon': '.notion-collection-view-tab-button [role="tab"] [data-c12-ln="tab-icon"]',
        'tab-text': '.notion-collection-view-tab-button [role="tab"] [data-c12-ln="tab-text"]',
        'group-icon': GROUP_ICON_SEL
      };
      for (const k of LN_KEYS) {
        if (Math.abs(LN[k]) >= 0.05) out.push(sel[k] + ' { translate: ' + LN[k] + 'px 0 !important; }');
      }
    }
    return out.join('\n');
  };

  /* ============================================================
   *  旧版の後始末
   * ============================================================ */
  const LEGACY_ATTRS = ['data-c12-pad', 'data-c12-fix', 'data-c12-hc', 'data-c12-bc', 'data-c12-off', 'data-c12-kind', 'data-c12-col'];
  const MARK_ATTRS = ['data-c12-tab', 'data-c12-first-col', 'data-c12-headwrap', 'data-c12-inset', 'data-c12-mskey', 'data-c12-ln'];
  const CORDI_SEL = '[class*="cordivestium"]';

  function cleanLegacy() {
    let n = 0;
    try {
      for (const a of LEGACY_ATTRS) {
        for (const el of Array.from(document.querySelectorAll('[' + a + ']'))) { el.removeAttribute(a); n += 1; }
      }
      /* v8.3.0 のグループアイコンの印（v9 は構造セレクタ） */
      for (const el of Array.from(document.querySelectorAll('[data-c12-ln="group-icon"]'))) { el.removeAttribute('data-c12-ln'); n += 1; }
      for (const el of Array.from(document.querySelectorAll('[data-c12-inset],[data-c12-mskey],[data-c12-headwrap]'))) {
        if (!el.closest(CORDI_SEL)) continue;
        el.removeAttribute('data-c12-inset');
        el.removeAttribute('data-c12-mskey');
        el.removeAttribute('data-c12-headwrap');
        n += 1;
      }
      for (const s of Array.from(document.querySelectorAll('style[id^="' + PREFIX + '"]'))) {
        if (s.id === STYLE_ID_BASE || s.id === STYLE_ID_BODY) continue;
        s.remove();
        n += 1;
      }
    } catch (e) { /* noop */ }
    return n;
  }

  /* ============================================================
   *  読み取りの小道具
   * ============================================================ */
  const inScope = (el) => {
    if (el.closest('.notion-peek-renderer')) return false;
    const cb = el.closest('.notion-collection_view-block');
    if (cb && !cb.closest('.notion-collection_view_page-block')) return false;
    if (el.closest('.notion-collection_view_page-block')) return true;
    /* v9.3: 表・タブは page-block の外（メイン枠）にある */
    if (document.documentElement.getAttribute('data-c05-full') === '1' && el.closest('.notion-frame')) return true;
    return false;
    return true;
  };
  const views = () => Array.from(document.querySelectorAll('.notion-table-view')).filter(inScope);
  const headerRowOf = (view) => view.querySelector('.notion-table-view-header-row');
  const headerCellsOf = (view) => {
    const hr = headerRowOf(view);
    if (!hr || !visible(hr)) return [];
    return Array.from(hr.querySelectorAll('.notion-table-view-header-cell')).filter(visible);
  };
  const bodyRowsOf = (view) => Array.from(view.querySelectorAll('.notion-table-view-row'))
    .filter((r) => inScope(r) && visible(r) && !r.classList.contains('notion-table-view-header-row'));

  function visible(el) {
    if (!(el instanceof Element)) return false;
    const r = el.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return false;
    try {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden') return false;
      if (parseFloat(cs.opacity) === 0) return false;
    } catch (e) { /* noop */ }
    return true;
  }
  const isChrome = (el) => {
    try {
      if (el.matches('svg.dragHandleFillSmall,[class*="dragHandle"],[class*="drag-handle"]')) return true;
      if (el.closest('[class*="dragHandle"],[class*="drag-handle"]')) return true;
      const c = getComputedStyle(el).cursor;
      if (c === 'grab' || c === 'grabbing') return true;
      if (el.closest('[class*="hover"],[class*="Hover"]')) return true;
    } catch (e) { /* noop */ }
    return false;
  };
  const draws = (el) => {
    const t = el.tagName;
    if (t === 'IMG' || t === 'SVG') return true;
    try {
      const cs = getComputedStyle(el);
      const mask = (cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none');
      return Boolean(mask) || Boolean(cs.backgroundImage && cs.backgroundImage !== 'none');
    } catch (e) { return false; }
  };
  const leftmostInk = (root) => {
    if (!(root instanceof Element)) return null;
    const list = [root, ...root.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 6 || r.width > 48 || r.height < 6 || r.height > 48) return false;
      if (isChrome(el)) return false;
      return draws(el);
    }).sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    const el = list[0];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    let tf = 'none';
    try { tf = getComputedStyle(el).transform; } catch (e) { /* noop */ }
    let box = r2(r.left);
    try { if (tf && tf !== 'none' && el.parentElement) box = r2(el.parentElement.getBoundingClientRect().left); } catch (e) { /* noop */ }
    const cls = String(el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.');
    return { el, label: el.tagName.toLowerCase() + (cls ? '.' + cls : ''), left: r2(r.left), box, transformed: tf && tf !== 'none' };
  };
  const hostOf = (cell) => {
    const icon = cell.querySelector('.notion-record-icon');
    if (!icon) return null;
    const host = icon.parentElement;
    if (!host || host === cell || !cell.contains(host)) return null;
    if (host.classList.contains('notion-record-icon')) return null;
    if (cell.classList.contains('notion-record-icon')) return null;
    return host;
  };
  /* v19.3.0: 形で見分ける（2026-10 の Notion を実測）
       題字:       property-value > div(flex) > div(flex-shrink:0) > .notion-record-icon[role="button"]  ＋ 隣に文字
       リレーション: … div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"] > .notion-record-icon ＋ span.notranslate */
  const TITLE_SHAPE = '[data-testid="property-value"] > div:not([style*="flex-wrap"]) > div > .notion-record-icon[role="button"]';
  const REL_SHAPE = 'div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"] > .notion-record-icon';
  const isTitleShape = (cell) => { try { return !!cell.querySelector(TITLE_SHAPE) && !cell.querySelector(REL_SHAPE); } catch (e) { return false; } };
  const isRelShape = (cell) => { try { return !!cell.querySelector(REL_SHAPE); } catch (e) { return false; } };
  const isTitleCol = (cell) => {
    if (isTitleShape(cell)) return true;
    try {
      if (cell.querySelector('[class*="cordivestium"]')) return true;
      if (cell.closest('[class*="cordivestium"]')) return true;
      const pv = cell.closest('[data-testid="property-value"]');
      if (pv && pv.querySelector('[class*="cordivestium"]')) return true;
    } catch (e) { /* noop */ }
    return false;
  };
  const cordiPresent = () => {
    try { return Boolean(document.querySelector(CORDI_SEL)); } catch (e) { return false; }
  };
  /* 一度見つかったら true のまま（毎回の全体検索をしない） */
  let cordiSeen = false, cordiAt = 0;
  const ready = () => {
    if (forced || cordiSeen) return true;
    const n = Date.now();
    if (n - cordiAt < 1000) return false;
    cordiAt = n;
    cordiSeen = cordiPresent();
    return cordiSeen;
  };
  const bodyCellForColumn = (view, hCell) => {
    const hr = hCell.getBoundingClientRect();
    for (const row of bodyRowsOf(view)) {
      for (const c of Array.from(row.querySelectorAll('.notion-table-view-cell'))) {
        const r = c.getBoundingClientRect();
        if (r.left < hr.left - 3 || r.left >= hr.left + hr.width) continue;
        if (hostOf(c) && visible(c)) return c;
      }
    }
    return null;
  };
  const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const titleIconMargin = (cell) => {
    try {
      const el = cell.querySelector('.cordivestium-v1121-title-icon-root');
      if (!el) return null;
      return r2(num(getComputedStyle(el).marginInlineStart));
    } catch (e) { return null; }
  };

  /* ============================================================
   *  タブ / グループ見出し（実測）
   * ============================================================ */
  let autoTab = false;
  let tabEnabled = false;
  let autoGroup = true;
  let groupTries = 0;
  let tabTries = 0;
  let lastTabDiff = null;
  const TAB_MAX_PAD = 96;
  const clampPx = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const textLeftOf = (root) => {
    if (!(root instanceof Element)) return null;
    let best = null;
    for (const n of Array.from(root.querySelectorAll('*'))) {
      if (n.childElementCount !== 0) continue;
      if (!String(n.textContent || '').trim()) continue;
      const r = n.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0)) continue;
      if (isChrome(n)) continue;
      if (best === null || r.left < best) best = r2(r.left);
    }
    return best;
  };
  const textElOf = (root) => {
    if (!(root instanceof Element)) return null;
    let best = null, bl = null;
    for (const n of Array.from(root.querySelectorAll('*'))) {
      if (n.childElementCount !== 0) continue;
      if (!String(n.textContent || '').trim()) continue;
      const r = n.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0)) continue;
      if (isChrome(n)) continue;
      if (bl === null || r.left < bl) { bl = r.left; best = n; }
    }
    return best;
  };
  const firstVisible = (sel) => {
    for (const el of Array.from(document.querySelectorAll(sel))) {
      if (inScope(el) && visible(el)) return el;
    }
    return null;
  };
  const tabEl = () => firstVisible('.notion-collection-view-tab-button [role="tab"]');
  const groupHeaderEl = () => firstVisible('.cordivestium-group-header');
  const groupPadGap = (h) => {
    try {
      const cs = getComputedStyle(h);
      return { pad: r2(num(cs.paddingLeft)), gap: r2(num(cs.columnGap)) };
    } catch (e) { return { pad: null, gap: null }; }
  };
  const hScrolled = (el) => {
    let n = el;
    for (let i = 0; n && n !== document.body && i < 10; i += 1, n = n.parentElement) {
      if (n.scrollLeft > 0) return true;
    }
    return false;
  };

  function snapshot() {
    const view = views()[0];
    if (!view) return null;
    const h1 = headerCellsOf(view)[0] || null;
    const hInk = h1 ? leftmostInk(h1) : null;
    const hText = h1 ? textLeftOf(h1) : null;
    const bCell = h1 ? bodyCellForColumn(view, h1) : null;
    const X = bCell ? r2(bCell.getBoundingClientRect().left) : null;
    const out = [];
    const add = (name, inkRoot, textRoot, note) => {
      const i = inkRoot ? leftmostInk(inkRoot) : null;
      const t = textRoot ? textLeftOf(textRoot) : null;
      out.push({
        対象: name,
        見えink: i ? i.left : null,
        箱: i ? i.box : null,
        文字: t,
        'セル左端から': (i && X !== null) ? r2(i.left - X) : null,
        'ink-ヘッダー': (i && hInk) ? r2(i.left - hInk.left) : null,
        '文字-ヘッダー': (t !== null && hText !== null) ? r2(t - hText) : null,
        メモ: note || ''
      });
    };
    add('ヘッダー1列目(基準)', h1, h1, '基準点（読むだけ・書かない）');
    if (bCell) add(isTitleCol(bCell) ? '本文(タイトル列)' : '本文(リレーション列)', bCell, bCell, '');
    const tEl = tabEl();
    if (tEl) add('タブ(' + String(tEl.textContent || '').trim().slice(0, 12) + ')', tEl, tEl,
      'translate アイコン ' + LN['tab-icon'] + ' / 文字 ' + LN['tab-text']);
    const gEl = groupHeaderEl();
    if (gEl) {
      const gg = groupPadGap(gEl);
      add('グループ見出し', gEl, gEl, 'translate アイコン ' + LN['group-icon'] + '（構造セレクタ） / ¹² gap ' + gg.gap);
    }
    return out;
  }

  function rows() {
    const out = snapshot();
    if (!out) { console.log(TAGW + ' テーブルが見つかりません（DBのテーブルを開いてから __c12.rows()）'); return null; }
    console.log('%c' + TAGW + ' 線の実測（ヘッダー1列目を基準にした差。0 なら一致）', 'background:#08a;color:#fff;padding:1px 6px;border-radius:3px;');
    console.table(out);
    const bad = out.filter((r) => r.対象.indexOf('ヘッダー') !== 0 &&
      ((r['ink-ヘッダー'] !== null && Math.abs(r['ink-ヘッダー']) > TOLERANCE_PX) ||
        (r['文字-ヘッダー'] !== null && Math.abs(r['文字-ヘッダー']) > TOLERANCE_PX)));
    if (!bad.length) {
      console.log('%c' + TAGW + ' 本文・タブ・グループ見出しはヘッダー1列目と一致しています（差 ≤ ' + TOLERANCE_PX + 'px）',
        'background:#0a7;color:#fff;padding:1px 6px;border-radius:3px;');
      return out;
    }
    console.log(TAGW + ' まだずれています: ' + bad.map((r) => r.対象 + '(ink ' + r['ink-ヘッダー'] + ' / 文字 ' + r['文字-ヘッダー'] + ')').join(', '));
    console.log(TAGW + ' → 測り直しは静かな時だけ動きます。すぐ測るなら __c12.recalibrate()（状態: __c12.lineState()）');
    return out;
  }

  /* v8.1.0 の padding 方式（既定 OFF） */
  function autoAlignTab() {
    if (!autoTab) return null;
    const r = snapshot();
    if (!r) return null;
    const hdr = r.find((x) => x.対象.indexOf('ヘッダー') === 0);
    const tb = r.find((x) => x.対象.indexOf('タブ') === 0);
    if (!hdr || !tb || hdr.見えink === null || tb.見えink === null) return null;
    const dInk = r2(hdr.見えink - tb.見えink);
    const dText = (hdr.文字 !== null && tb.文字 !== null) ? r2(hdr.文字 - tb.文字) : null;
    if (Math.abs(dInk) <= TOLERANCE_PX && (dText === null || Math.abs(dText) <= TOLERANCE_PX)) {
      return { 一致: true, 左内側: tabPad, アイコン間隔: tabGap };
    }
    if (lastTabDiff !== null && Math.abs(dInk - lastTabDiff) <= 0.05) { tabTries = 8; }
    lastTabDiff = dInk;
    if (tabTries >= 8) {
      autoTab = false;
      tabPad = 8.0; tabGap = 4.0;
      applyBodyStyle();
      console.warn(TAGW + ' タブ（padding 方式）の自動整列を止め、既定へ戻しました');
      return { 一致: false, 左内側: tabPad, アイコン間隔: tabGap };
    }
    if (Math.abs(dInk) > 0.05) { tabTries += 1; tabPad = r1(clampPx(tabPad + dInk, 0, TAB_MAX_PAD)); }
    if (dText !== null && Math.abs(dText) > 0.05) tabGap = r1(clampPx(tabGap + dText - dInk, 0, TAB_MAX_PAD));
    applyBodyStyle();
    return { 一致: false, 左内側: tabPad, アイコン間隔: tabGap, 差: { ink: dInk, 文字: dText } };
  }

  /* ============================================================
   *  印付け — 同期（描画前・レイアウトを読まない）
   * ============================================================ */
  const TAB_SEL = '.notion-collection-view-tab-button [role="tab"]';
  const TAB_UNMARKED = TAB_SEL + ':not(:has([data-c12-ln="tab-text"]))';
  const childUnder = (anc, el) => { let n = el; while (n && n.parentElement !== anc) n = n.parentElement; return n; };
  const idxPath = (root, el) => {
    const p = [];
    for (let n = el; n && n !== root; n = n.parentElement) {
      const par = n.parentElement;
      if (!par) return null;
      p.unshift(Array.prototype.indexOf.call(par.children, n));
    }
    return p;
  };
  const follow = (root, p) => {
    let n = root;
    for (const i of p) { n = n && n.children[i]; if (!n) return null; }
    return n;
  };
  function setTabMarks(t, a, b) {
    t.querySelectorAll('[data-c12-ln]').forEach((e) => { if (e !== a && e !== b) e.removeAttribute('data-c12-ln'); });
    if (a.getAttribute('data-c12-ln') !== 'tab-icon') a.setAttribute('data-c12-ln', 'tab-icon');
    if (b.getAttribute('data-c12-ln') !== 'tab-text') b.setAttribute('data-c12-ln', 'tab-text');
  }
  function markTabByPath(t) {
    for (const P of TABPATHS) {
      const a = follow(t, P.a), b = follow(t, P.b);
      if (!a || !b || a === b || a.contains(b) || b.contains(a)) continue;
      if (!String(b.textContent || '').trim()) continue;
      if (!(a.matches('svg, img, div[style*="mask"]') || a.querySelector('svg, img, div[style*="mask"]'))) continue;
      setTabMarks(t, a, b);
      return true;
    }
    return false;
  }
  function markTabsSync() {
    if (!linesOn) return;
    for (const t of document.querySelectorAll(TAB_UNMARKED)) if (inScope(t)) markTabByPath(t);
  }

  /* v9.1: 構造だけで決める（⁰⁹ を待たない）。ピン留めの複製（ポータル）もフルDBページなら同じ印 */
  const FULLDB_SEL = 'html[data-c05-full="1"] .notion-frame, .notion-frame .notion-collection_view_page-block:has(> h1[aria-roledescription="page title"])';
  function headRows() {
    const out = [];
    for (const view of views()) { const hr = headerRowOf(view); if (hr) out.push(hr); }
    if (document.querySelector(FULLDB_SEL)) {
      for (const hr of document.querySelectorAll('.sticky-portal-target .notion-table-view-header-row')) {
        if (hr.closest('.notion-peek-renderer, .notion-collection_view-block')) continue;
        const portal = hr.closest('.sticky-portal-target');
        if (portal && portal.getAttribute('data-constellucentia-full-db-portal-owner') === 'false') continue;
        out.push(hr);
      }
    }
    return out;
  }
  function markHeads() {
    for (const hr of headRows()) {
      const first = hr.querySelector('.notion-table-view-header-cell');
      if (!first || first.closest(CORDI_SEL)) continue;
      if (!first.hasAttribute('data-c12-first-col')) first.setAttribute('data-c12-first-col', '1');
      const icon = first.querySelector('.notion-record-icon');
      const w = (icon && icon.parentElement && first.contains(icon.parentElement))
        ? icon.parentElement
        : (first.firstElementChild || null);
      if (w && w !== first && !w.closest(CORDI_SEL) && !w.hasAttribute('data-c12-headwrap')) w.setAttribute('data-c12-headwrap', '1');
    }
  }

  const viewKey = () => {
    const m = location.pathname.match(/([0-9a-f]{32})(?:[^0-9a-f]|$)/i);
    let v = '';
    try { v = new URLSearchParams(location.search).get('v') || ''; } catch (e) { /* noop */ }
    return (m ? m[1].toLowerCase() : location.pathname) + '|' + v;
  };
  const relByView = new WeakMap();
  const relTried = new WeakSet();
  const relMapFor = (view) => relByView.get(view) || REL.map[viewKey()] || null;
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  function markRelCell(cell, map) {
    const host = hostOf(cell);
    if (!host) return;
    if (host.closest(CORDI_SEL)) {
      if (host.hasAttribute('data-c12-inset')) { host.removeAttribute('data-c12-inset'); host.removeAttribute('data-c12-mskey'); }
      return;
    }
    const idx = cell.getAttribute('data-col-index');
    if (idx === null) return;                       // 列番号が無い環境は旧方式（calibrate が先頭行に付ける）
    if (own(map, idx) && !isTitleShape(cell)) {
      if (host.getAttribute('data-c12-inset') !== '1') host.setAttribute('data-c12-inset', '1');
      if (host.getAttribute('data-c12-mskey') !== map[idx]) host.setAttribute('data-c12-mskey', map[idx]);
    } else if (host.hasAttribute('data-c12-inset')) {
      host.removeAttribute('data-c12-inset');
      host.removeAttribute('data-c12-mskey');
    }
  }
  /* 追加された要素の中のセルだけ（描画前） */
  function markRelIn(root) {
    const c = root.closest('.notion-table-view-cell');
    const cells = c ? [c] : root.querySelectorAll('.notion-table-view-cell');
    if (!cells.length) return;
    const memo = new Map();
    for (const cell of cells) {
      const row = cell.closest('.notion-table-view-row');
      if (!row || row.classList.contains('notion-table-view-header-row')) continue;
      const view = cell.closest('.notion-table-view');
      if (!view) continue;
      let map = memo.get(view);
      if (map === undefined) { map = inScope(view) ? relMapFor(view) : null; memo.set(view, map); }
      if (map) markRelCell(cell, map);
    }
  }
  function markAllRel(view, map) {
    for (const cell of view.querySelectorAll('.notion-table-view-row .notion-table-view-cell')) {
      const row = cell.closest('.notion-table-view-row');
      if (!row || row.classList.contains('notion-table-view-header-row')) continue;
      markRelCell(cell, map);
    }
  }

  /* ============================================================
   *  印付け — 実測つき（静かな時・初回だけ）
   * ============================================================ */
  function markTab(t) {
    if (t.querySelector('[data-c12-ln="tab-icon"]') && t.querySelector('[data-c12-ln="tab-text"]')) return;
    if (markTabByPath(t)) return;
    const i = leftmostInk(t);
    const x = textElOf(t);
    if (!i || !x || i.el === t) return;
    let lca = i.el.parentElement;
    while (lca && !lca.contains(x)) lca = lca.parentElement;
    if (!lca || !t.contains(lca)) return;
    const a = childUnder(lca, i.el);
    const b = childUnder(lca, x);
    if (!a || !b || a === b) return;
    setTabMarks(t, a, b);
    const pa = idxPath(t, a), pb = idxPath(t, b);
    if (pa && pb) addTabPath(pa, pb);
  }
  function markLines() {
    if (!linesOn) return;
    for (const t of Array.from(document.querySelectorAll(TAB_UNMARKED))) if (inScope(t)) markTab(t);
  }

  function computeRel(view) {
    if (!(view.querySelector(CORDI_SEL) || forced)) return null;   // ⁰⁹ がこのビューに付くまで待つ（タイトル列の誤判定防止）
    const map = {};
    for (const hCell of headerCellsOf(view)) {
      const name = String(hCell.textContent || '').trim().slice(0, 20);
      const cell = bodyCellForColumn(view, hCell);
      if (!cell || isTitleCol(cell) || !isRelShape(cell)) continue;   // v19.3: リレーションの形の列だけ
      const host = hostOf(cell);
      if (!host || host.closest(CORDI_SEL)) continue;
      const idx = cell.getAttribute('data-col-index');
      if (idx === null) {                                          // 旧方式（列番号が無い時だけ）
        if (host.getAttribute('data-c12-inset') !== '1') host.setAttribute('data-c12-inset', '1');
        if (host.getAttribute('data-c12-mskey') !== name) host.setAttribute('data-c12-mskey', name);
        continue;
      }
      map[idx] = name;
    }
    relByView.set(view, map);
    const k = viewKey();
    if (JSON.stringify(REL.map[k] || null) !== JSON.stringify(map)) {
      REL.map[k] = map;
      REL.order = REL.order.filter((x) => x !== k);
      REL.order.push(k);
      while (REL.order.length > REL_MAX) delete REL.map[REL.order.shift()];
      saveRel();
    }
    return map;
  }

  /* 全体の掃除（5秒ごと・静かな時だけ・レイアウトを読まない） */
  function sweep() {
    document.querySelectorAll('[data-c12-inset]').forEach((el) => {
      if (el.closest(CORDI_SEL)) { el.removeAttribute('data-c12-inset'); el.removeAttribute('data-c12-mskey'); }
    });
    document.querySelectorAll(TAB_SEL).forEach((t) => {
      if (!tabEnabled) { if (t.hasAttribute('data-c12-tab')) t.removeAttribute('data-c12-tab'); return; }
      if (inScope(t) && !t.hasAttribute('data-c12-tab')) t.setAttribute('data-c12-tab', '1');
    });
    markTabsSync();
    markHeads();
  }

  function scan(full) {
    try {
      if (full) {
        document.querySelectorAll(MARK_ATTRS.map((a) => '[' + a + ']').join(',')).forEach((el) => {
          for (const a of MARK_ATTRS) el.removeAttribute(a);
        });
      }
      sweep();
      for (const view of views()) { const map = relMapFor(view); if (map) markAllRel(view, map); }
      markLines();
    } catch (e) { /* 監視継続 */ }
    return true;
  }

  /* ============================================================
   *  測り直し（静かな時だけ・2回一致・0.5px以上の差だけ書く）
   * ============================================================ */
  let lastMut = 0, lastScroll = 0, lastSwitch = 0;
  let calT = 0, calStart = 0, lastCal = null;
  let calLines = !linesCal;       // v9.1: この回の測り直しでラインも書くか
  const hasC05Full = () => document.documentElement.getAttribute('data-c05-full') === '1';

  function quiet() {
    const n = Date.now();
    return n - lastMut >= QUIET_MUT_MS &&
      n - lastScroll >= QUIET_SCROLL_MS &&
      n - lastSwitch >= QUIET_SWITCH_MS &&
      !document.hidden &&
      !document.documentElement.hasAttribute('data-c16-dragging') &&
      !document.querySelector('[data-c18-shift]');
  }
  function scheduleCal(delay, withLines) {
    if (withLines) calLines = true;
    clearTimeout(calT);
    calT = setTimeout(calTick, delay || 0);
  }
  function endCal(res) {
    calStart = 0;
    calLines = false;
    lastCal = Object.assign({ at: new Date().toISOString() }, res);
  }
  function lineDiffs() {
    const r = snapshot();
    if (!r) return null;
    const hdr = r.find((x) => x.対象.indexOf('ヘッダー') === 0);
    if (!hdr || hdr.見えink === null) return null;
    const tb = r.find((x) => x.対象.indexOf('タブ') === 0);
    const gp = r.find((x) => x.対象.indexOf('グループ') === 0);
    const d = {};
    const put = (k, t, c) => { if (t === null || c === null || t === undefined || c === undefined) return; d[k] = r2(t - c); };
    if (tb) { put('tab-icon', hdr.見えink, tb.見えink); put('tab-text', hdr.文字, tb.文字); }
    if (gp && hasC05Full()) { put('group-icon', hdr.見えink, gp.見えink); put('group-text', hdr.文字, gp.文字); }
    return d;
  }
  function commitLines(a, b) {
    if (!a || !b) return { 線: '測れない' };
    if (!calLines) return { 線: '合わせ済み（__c12.recalibrate() で測り直し）' };
    const agreed = {}, changed = {};
    for (const k of Object.keys(b)) if (typeof a[k] === 'number' && Math.abs(a[k] - b[k]) <= LN_TOL) agreed[k] = b[k];
    let wrote = false;
    if (linesOn) {
      for (const k of LN_KEYS) {
        if (!(k in agreed)) continue;
        const d = agreed[k];
        if (Math.abs(d) < MIN_DRIFT) { lnTries[k] = 0; continue; }
        if (lnTries[k] >= 6) continue;
        lnTries[k] += 1;
        const nv = r1(clampPx(LN[k] + d, -LN_MAX, LN_MAX));
        changed[k] = { 前: LN[k], 後: nv };
        LN[k] = nv;
        wrote = true;
      }
    }
    if (wrote) {
      saveLines();
      applyBodyStyle();
      console.log(TAGW + ' ヘッダー1列目へ寄せました: ' + JSON.stringify(LN) + '（差 ' + JSON.stringify(agreed) + '）');
    }
    /* グループ見出しの文字 → ¹²（単一書き手）の gap */
    if (autoGroup && hasC05Full() && ('group-text' in agreed) && Math.abs(agreed['group-text']) >= MIN_DRIFT) {
      const api = window.__cordivestiumGroupHeaderTypography__;
      if (!api || typeof api.set !== 'function') {
        autoGroup = false;
      } else if (groupTries >= 6) {
        autoGroup = false;
        console.warn(TAGW + ' グループ見出しの文字の自動整列を止めました（6回で一致せず）→ __c12.rows() の表を貼ってください');
      } else {
        const g = groupHeaderEl();
        const cur = g && groupPadGap(g);
        if (cur && cur.gap !== null) {
          groupTries += 1;
          const patch = { ICON_TEXT_GAP_PX: r2(clampPx(cur.gap + agreed['group-text'], 0, 32)) };
          api.set(patch);
          changed['group-text'] = patch;
        }
      }
    }
    lastLines = agreed;
    /* v9.1: 測れたキーが全部そろって差が小さければ「合わせ済み」 */
    if (!Object.keys(changed).length && ('tab-icon' in agreed || 'tab-text' in agreed) && !linesCal) {
      linesCal = true;
      saveLines();
    }
    return { 差: agreed, 変更: Object.keys(changed).length ? changed : 'なし（差 < ' + MIN_DRIFT + 'px）' };
  }
  function calTick() {
    calT = 0;
    if (!calStart) calStart = Date.now();
    if (Date.now() - calStart > CAL_GIVEUP_MS) return endCal({ 結果: 'give-up（静かにならない）' });
    if (!quiet()) { calT = setTimeout(calTick, 250); return; }
    const view = views()[0];
    if (!view) return endCal({ 結果: 'テーブルなし' });
    if (hScrolled(view)) { lastLines = { skip: '横スクロール中' }; return endCal({ 結果: '横スクロール中' }); }
    relTried.add(view);
    let rel = null;
    try { rel = computeRel(view); if (rel) markAllRel(view, rel); } catch (e) { /* noop */ }
    try { markLines(); markHeads(); } catch (e) { /* noop */ }
    try { autoAlignTab(); } catch (e) { /* noop */ }
    const a = lineDiffs();
    calT = setTimeout(() => {
      calT = 0;
      if (!quiet()) { calT = setTimeout(calTick, 250); return; }
      let res = {};
      try { res = commitLines(a, lineDiffs()); } catch (e) { res = { 線: 'エラー ' + e.message }; }
      endCal(Object.assign({ 結果: 'ok', リレーション列: rel }, res));
    }, SAMPLE_GAP_MS);
  }

  /* ============================================================
   *  グループ見出しの文字: ¹² に gap だけを渡す（手動）
   * ============================================================ */
  function groupApply(dryRun) {
    const g = groupHeaderEl();
    if (!g) { console.warn(TAGW + ' グループ見出しが見つかりません（グループ付きビューで実行してください）'); return null; }
    const api = window.__cordivestiumGroupHeaderTypography__;
    if (!api || typeof api.set !== 'function') {
      console.warn(TAGW + ' ¹² Group Header Typography v1.0.0（set() つき）が必要です');
      return null;
    }
    const r = snapshot();
    if (!r) return null;
    const hdr = r.find((x) => x.対象.indexOf('ヘッダー') === 0);
    const grp = r.find((x) => x.対象.indexOf('グループ') === 0);
    if (!hdr || !grp || hdr.文字 === null || grp.文字 === null) { console.warn(TAGW + ' 実測できないので渡せません'); return null; }
    const dText = r2(hdr.文字 - grp.文字);
    const cur = groupPadGap(g);
    if (cur.gap === null) return null;
    const patch = { ICON_TEXT_GAP_PX: r2(clampPx(cur.gap + dText, 0, 32)) };
    if (dryRun) return patch;
    api.set(patch);
    console.log(TAGW + ' ¹² に渡しました: ' + JSON.stringify(patch) + '（渡す前の文字の差: ' + dText + '）');
    return patch;
  }

  const setTab = (px) => {
    if (px === undefined) return tabPad;
    const v = Number(px);
    if (!isFinite(v)) return tabPad;
    tabPad = r1(clampPx(v, 0, TAB_MAX_PAD));
    tabEnabled = true; autoTab = true; tabTries = 0; lastTabDiff = null;
    applyBodyStyle(); scan(false);
    return tabPad;
  };
  const setTabGap = (px) => {
    if (px === undefined) return tabGap;
    const v = Number(px);
    if (!isFinite(v)) return tabGap;
    tabGap = r1(clampPx(v, 0, TAB_MAX_PAD));
    tabEnabled = true; autoTab = true;
    applyBodyStyle(); scan(false);
    return tabGap;
  };
  const auto = (on) => {
    autoTab = (on === undefined) ? !autoTab : !!on;
    autoGroup = autoTab;
    if (autoTab) { tabEnabled = true; tabTries = 0; lastTabDiff = null; groupTries = 0; }
    scan(false); scheduleCal(0);
    return autoTab;
  };
  const tabOff = () => { tabEnabled = false; autoTab = false; scan(false); return true; };

  const lines = (on) => {
    linesOn = (on === undefined) ? !linesOn : !!on;
    for (const k of LN_KEYS) lnTries[k] = 0;
    saveLines(); applyBodyStyle(); scan(false); scheduleCal(0, true);
    console.log(TAGW + ' ライン（ヘッダー1列目へ寄せる）= ' + (linesOn ? 'ON' : 'OFF（translate を外しました）'));
    return linesOn;
  };
  const lineReset = () => {
    for (const k of LN_KEYS) { LN[k] = 0; lnTries[k] = 0; }
    linesCal = false;
    saveLines(); applyBodyStyle(); scheduleCal(0, true);
    console.log(TAGW + ' ラインを 0 に戻しました。静かになったら測り直します');
    return { ...LN };
  };
  const lineState = () => ({ on: linesOn, 合わせ済み: linesCal, translate: { ...LN }, 試行: { ...lnTries }, 直近の差: lastLines, タブの道筋: TABPATHS, 直近の測り直し: lastCal });

  /* ============================================================
   *  実測（読み取りのみ・診断用）
   * ============================================================ */
  function measure() {
    const out = [];
    for (const view of views()) {
      const hCells = headerCellsOf(view);
      if (!hCells.length) continue;
      for (const hCell of hCells) {
        const name = String(hCell.textContent || '').trim().slice(0, 20);
        const hInk = leftmostInk(hCell);
        const cell = bodyCellForColumn(view, hCell);
        const base = {
          列名: name, 担当: '-',
          セル左端: cell ? r2(cell.getBoundingClientRect().left) : null,
          ヘッダーink: hInk ? hInk.left : null,
          ヘッダー箱: hInk ? hInk.box : null,
          'ヘッダー変形': hInk && hInk.transformed ? 'あり(scale等)' : '',
          本文ink: null, 差: null, 指示margin: null, 適用margin: null, 印: 'no'
        };
        if (!cell) { out.push(base); continue; }
        const title = isTitleCol(cell);
        const bInk = leftmostInk(cell);
        const host = hostOf(cell);
        const cs = host ? getComputedStyle(host) : null;
        const d = (hInk && bInk) ? r2(bInk.left - hInk.left) : null;
        const want = title ? (titleEnabled ? titleMs : null)
                           : ((host && host.hasAttribute('data-c12-inset')) ? msValue : null);
        const got = title ? titleIconMargin(cell) : (cs ? r2(num(cs.marginLeft)) : null);
        out.push(Object.assign(base, {
          担当: title ? (titleEnabled ? '本スクリプト(タイトル列)' : '⁰⁹(触らない)') : '本スクリプト',
          本文ink: bInk ? bInk.left : null,
          '本文箱': bInk ? bInk.box : null,
          差: d,
          'セルからの本文': bInk ? r2(bInk.left - base.セル左端) : null,
          'セルからのヘッダー': hInk ? r2(hInk.left - base.セル左端) : null,
          列番号: cell.getAttribute('data-col-index'),
          指示margin: want,
          適用margin: got,
          '効いてる?': (want === null || got === null) ? '-' : (Math.abs(got - want) <= 0.05 ? 'yes' : 'NO(他が上書き)'),
          印: title ? (titleEnabled ? 'title-fix' : 'no') : (host && host.hasAttribute('data-c12-inset') ? 'yes' : 'no')
        }));
      }
      break;
    }
    return out;
  }

  function check() {
    const rs = measure();
    if (!rs.length) { console.log(TAGW + ' テーブルビューのヘッダー/本文が見つかりません'); return null; }
    console.log('%c' + TAGW + ' 実測（読み取りのみ）', 'background:#08a;color:#fff;padding:1px 6px;border-radius:3px;');
    console.table(rs);
    const mine = rs.filter((r) => r.担当.indexOf('本スクリプト') === 0 && r.差 !== null);
    const bad = mine.filter((r) => Math.abs(r.差) > TOLERANCE_PX);
    console.log(TAGW + ' 本スクリプト担当: ' + (mine.length - bad.length) + '/' + mine.length + ' 列が一致' +
      (bad.length ? ' / 残り: ' + bad.map((b) => b.列名 + '(' + b.差 + ')').join(', ') : ''));
    return rs;
  }

  const PROPS = ['padding-left', 'padding-inline-start', 'margin-left', 'margin-inline-start', 'transform', 'translate', 'width'];

  function specificity(sel) {
    let a = 0, b = 0, c = 0;
    const s = String(sel).replace(/\\./g, '');
    const ids = s.match(/#[\w-]+/g); if (ids) a = ids.length * 100;
    const cls = s.match(/\.[\w-]+/g); const attrs = s.match(/\[[^\]]+\]/g); const pseudo = s.match(/:(?!:)([\w-]+)/g);
    b = (cls ? cls.length : 0) + (attrs ? attrs.length : 0) + (pseudo ? pseudo.length : 0);
    const els = s.replace(/\.[\w-]+/g, '').replace(/\[[^\]]+\]/g, '').replace(/#[\w-]+/g, '').replace(/:[^ >+~,)]+/g, '')
      .split(/[\s>+~,]+/).filter((t) => /^[a-zA-Z]/.test(t));
    c = els.length;
    return '(' + a / 100 + ',' + b + ',' + c + ')';
  }

  function matchedRules(el) {
    const out = [];
    const walk = (list, media) => {
      for (const r of Array.from(list || [])) {
        if (r.cssRules && r.conditionText !== undefined) { walk(r.cssRules, r.conditionText); continue; }
        if (!r.selectorText || !r.style) continue;
        const decls = PROPS.filter((p) => r.style.getPropertyValue(p))
          .map((p) => p + ':' + r.style.getPropertyValue(p) + (r.style.getPropertyPriority(p) ? ' !important' : ''));
        if (!decls.length) continue;
        let hitSel = null;
        for (const s of String(r.selectorText).split(',')) { try { if (el.matches(s.trim())) { hitSel = s.trim(); break; } } catch (e) { /* noop */ } }
        if (!hitSel) continue;
        const sheet = r.parentStyleSheet;
        let head = '';
        try { const node = sheet && sheet.ownerNode; head = node ? String(node.textContent || '').slice(0, 90).replace(/\s+/g, ' ') : ''; } catch (e) { /* noop */ }
        out.push({
          シート: sheet ? (sheet.href || (sheet.ownerNode && sheet.ownerNode.id) || '(id無しのstyle要素)') : '(不明)',
          詳細度: specificity(hitSel), メディア: media || '',
          セレクタ: hitSel.length > 110 ? hitSel.slice(0, 110) + '…' : hitSel,
          宣言: decls.join(' / '), 'シート冒頭': head
        });
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      let list = null;
      try { list = sheet.cssRules; } catch (e) { continue; }
      walk(list, '');
    }
    return out;
  }

  function why() {
    const out = {};
    for (const view of views()) {
      const hCells = headerCellsOf(view);
      if (!hCells.length) continue;
      for (const hCell of hCells) {
        const name = String(hCell.textContent || '').trim().slice(0, 20);
        const cell = bodyCellForColumn(view, hCell);
        if (!cell) continue;
        const host = hostOf(cell);
        if (!host) continue;
        const cs = getComputedStyle(host);
        out[name] = {
          種類: isTitleCol(cell) ? 'title(⁰⁹)' : 'rel',
          'data-c12-inset': host.getAttribute('data-c12-inset'),
          列番号: cell.getAttribute('data-col-index'),
          実際のmarginLeft: cs.marginLeft, 実際のpaddingLeft: cs.paddingLeft,
          実際のtranslate: cs.translate, 実際のtransform: cs.transform
        };
        console.dir(out[name]);
        console.table(matchedRules(host));
      }
      break;
    }
    return out;
  }

  function diagnose() {
    const rs = measure();
    if (!rs.length) return null;
    const mine = rs.filter((r) => r.担当.indexOf('本スクリプト') === 0 && r.差 !== null);
    if (mine.length) {
      console.log(TAGW + ' 診断[本文] ' + mine.map((r) => r.列名 + ': 差' + r.差 + '（効いてる?' + r['効いてる?'] + '）').join(' ｜ '));
    }
    return rs;
  }

  function align(passes) {
    const maxPasses = (typeof passes === 'number' && passes > 0) ? Math.min(4, Math.floor(passes)) : 2;
    for (let p = 0; p < maxPasses; p++) {
      const rs = measure().filter((r) => r.担当.indexOf('本スクリプト') === 0 && r.差 !== null && r.適用margin !== null);
      const bad = rs.filter((r) => Math.abs(r.差) > TOLERANCE_PX);
      if (!bad.length) break;
      let wrote = 0;
      for (const b of bad) {
        if (b.指示margin !== null && Math.abs(b.適用margin - b.指示margin) > 0.05) continue;
        const next = r1(Math.max(-MAX_MS_PX, Math.min(MAX_MS_PX, b.適用margin - b.差)));
        if (b.担当.indexOf('本スクリプト(タイトル') === 0) titleMs = next;
        else msByName.set(b.列名, next);
        wrote += 1;
      }
      if (!wrote) break;
      applyBodyStyle();
      scan(false);
    }
    return check();
  }

  /* ============================================================
   *  適用／巻き戻し
   * ============================================================ */
  function applyBodyStyle() {
    let s = document.getElementById(STYLE_ID_BODY);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID_BODY;
      (document.head || document.documentElement).appendChild(s);
    }
    const css = cssBody();
    if (s.textContent !== css) s.textContent = css;
    return s;
  }
  const bodyOff = () => { const s = document.getElementById(STYLE_ID_BODY); if (s) s.remove(); };
  const setAll = (px) => {
    const v = Number(px);
    if (!isFinite(v)) return msValue;
    msValue = r1(Math.max(-MAX_MS_PX, Math.min(MAX_MS_PX, v)));
    applyBodyStyle();
    return msValue;
  };
  const setCol = (name, px) => {
    const v = Number(px);
    if (!isFinite(v)) return null;
    msByName.set(String(name), r1(Math.max(-MAX_MS_PX, Math.min(MAX_MS_PX, v))));
    applyBodyStyle();
    return Object.fromEntries(msByName);
  };
  const resetAll = () => { msByName.clear(); msValue = -1.6; applyBodyStyle(); };
  const force = (on) => { forced = (on === undefined) ? true : !!on; scan(true); scheduleCal(0); return forced; };

  /* ============================================================
   *  監視（コールバック＝描画前に同期で印を付ける）
   * ============================================================ */
  let lastHref = '';
  function onNavigate() {
    for (const k of LN_KEYS) lnTries[k] = 0;
    groupTries = 0;
    autoGroup = true;
    scheduleCal(ENTER_MS, !linesCal);   // v9.1: 合わせ済みならリレーション列だけ
  }

  let raf = false;
  const soon = () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      raf = false;
      try {
        markLines();          // 道筋で付かなかったタブだけ（実測）→ 道筋を覚える
        markHeads();
        if (!calT && !calStart) {
          for (const view of views()) {
            if (relByView.has(view) || relTried.has(view) || REL.map[viewKey()]) continue;
            if (!(view.querySelector(CORDI_SEL) || forced)) continue;
            relTried.add(view);
            scheduleCal(NEWVIEW_MS);   // 初めて見るビューだけ
            break;
          }
        }
      } catch (e) { /* noop */ }
    });
  };

  const mo = new MutationObserver((recs) => {
    if (location.href !== lastHref) { lastHref = location.href; onNavigate(); }
    let heads = false, tabs = false, c05 = false, frameMut = false;
    for (const r of recs) {
      const t = r.target;
      if (t.nodeType === 1 && t.id === 'c05-lock-vars') { c05 = true; continue; }
      if (t.nodeType === 1 && t.nodeName === 'STYLE') continue;
      if (!frameMut && t.nodeType === 1 && t.closest('.notion-frame')) frameMut = true;
      for (const n of r.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.id === 'c05-lock-vars') { c05 = true; continue; }
        try {
          if (!tabs && (n.closest('.notion-collection-view-tab-button') || n.querySelector('.notion-collection-view-tab-button'))) tabs = true;
          if (!heads && (n.closest('.notion-table-view-header-row') || n.querySelector('.notion-table-view-header-row'))) heads = true;
          if (n.closest('.notion-table-view') || n.querySelector('.notion-table-view-cell')) markRelIn(n);
        } catch (e) { /* noop */ }
      }
    }
    if (frameMut) lastMut = Date.now();
    try {
      if (tabs) markTabsSync();
      if (heads) markHeads();
    } catch (e) { /* noop */ }
    if (c05) scheduleCal(C05_FOLLOW_MS, true);    // ⁰⁵ の値が変わったら、落ち着いてから追従
    soon();
  });

  /* ============================================================
   *  起動（document-start で即）
   * ============================================================ */
  const cleaned = cleanLegacy();
  const base = document.createElement('style');
  base.id = STYLE_ID_BASE;
  base.textContent = CSS_BASE;
  (document.head || document.documentElement).appendChild(base);
  applyBodyStyle();

  mo.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('scroll', (e) => {
    const t = e && e.target;
    if (t && t.nodeType === 1 && t.closest('.notion-sidebar-container')) return;
    lastScroll = Date.now();
  }, { capture: true, passive: true });
  document.addEventListener('pointerdown', (e) => {
    const t = e.target;
    if (t instanceof Element && t.closest('[role="tablist"] [role="tab"], [role="menuitem"]')) lastSwitch = Date.now();
  }, true);
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element && e.target.closest('[role="tablist"] [role="tab"]')) lastSwitch = Date.now();
  }, true);
  addEventListener('resize', () => {
    for (const k of LN_KEYS) lnTries[k] = 0;
    lastMut = Date.now();
    scheduleCal(RESIZE_MS, true);
  }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => scheduleCal(ENTER_MS, !linesCal));
  setInterval(() => {
    if (document.hidden || document.documentElement.hasAttribute('data-c16-dragging')) return;
    if (quiet()) { try { sweep(); } catch (e) { /* noop */ } }
  }, 5000);

  const onReady = () => {
    const n = cleanLegacy();
    try { sweep(); } catch (e) { /* noop */ }
    if (n) console.log(TAGW + ' 旧版が残した属性/スタイルを掃除: ' + n + ' 箇所');
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady, { once: true });
  else onReady();

  setTimeout(() => {
    if (document.documentElement.dataset.c13g || document.getElementById('c13g-style')) {
      console.warn(TAGW + ' ¹³ᵇ Group Icon Ink Aligner が動いています。誤った基準で押し出すので ScriptCat で無効にしてください（v9 側で打ち消しています）');
    }
  }, 3000);
  setTimeout(() => { if (!document.hidden) diagnose(); }, 7000);

  window.__c12 = {
    VERSION, HEADER_OFFSET, HEADER_INK_OFFSET,
    check, report: check, dump: () => JSON.stringify(measure()),
    diagnose, align, why, force,
    scan: (full) => scan(full !== false),
    setAll, setCol, resetAll,
    title: (on) => { titleEnabled = (on === undefined) ? !titleEnabled : !!on; applyBodyStyle(); return titleEnabled; },
    rows, lineRows: rows, snapshot,
    tab: setTab, tabGap: setTabGap, tabOff, auto,
    groupApply,
    lines, lineReset, lineState,
    recalibrate: () => { for (const k of LN_KEYS) lnTries[k] = 0; scheduleCal(0, true); return '静かになったら測り直します → __c12.lineState().直近の測り直し'; },
    relCols: () => ({ key: viewKey(), 保存: REL.map[viewKey()] || null }),
    relReset: () => { REL = { map: {}, order: [] }; saveRel(); scheduleCal(0); return 'リレーション列の保存を消しました'; },
    tabPathReset: () => { TABPATHS = []; try { localStorage.removeItem(LS_TABPATH); localStorage.removeItem(LS_TABPATHS); } catch (e) { /* noop */ } scan(true); return 'タブの道筋を消しました'; },
    on: applyBodyStyle, off: bodyOff, clean: cleanLegacy, css: cssBody, body: cssBody,
    rules: (sel) => { const el = document.querySelector(sel); return el ? matchedRules(el) : null; },
    state: () => ({
      リレーション列: msValue + 'px（列ごと全行・保存 ' + REL.order.length + ' ビュー）',
      列別: Object.fromEntries(msByName),
      タイトル列: (titleEnabled ? '上書き ' + titleMs + 'px' : 'OFF'),
      基準: 'DBヘッダー1列目（読むだけ）',
      タブの道筋: TABPATHS.length ? TABPATHS.length + ' 通り保存済み（描画前に付ける）' : '未学習（初回だけ実測）',
      ライン: (linesOn ? 'ON ' : 'OFF ') + JSON.stringify(LN) + (linesCal ? '（合わせ済み）' : '（未調整）'),
      グループ見出しの文字: '¹² の gap（自動 ' + (autoGroup ? 'ON' : 'OFF') + ' / 試行 ' + groupTries + '）',
      直近の測り直し: lastCal,
      強制: forced
    })
  };

  console.log('%c' + TAGW + ' 印は描画前に同期で付けます。測り直しは静かな時だけ。実測: __c12.rows() / 状態: __c12.state()',
    'background:#a07; color:#fff; padding:1px 6px; border-radius:3px;');
  if (cleaned) console.log(TAGW + ' 旧版が残した属性/スタイルを掃除: ' + cleaned + ' 箇所');
})();