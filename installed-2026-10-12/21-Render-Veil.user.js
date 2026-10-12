// ==UserScript==
// @name         « No »　²¹ _ Render Veil
// @namespace    constellucentia
// @version      1.2.0
// @description  v1.2.0: 速く — 幕の上限を短く（ビュー 1.5→0.7 秒・ページ 1.8→0.9 秒）、静けさの判定を 160→110ms に。ページを移る・タブを替える時の待ちが半分以下に。v1.1.1: Stylus ²² v1.1.0 と対（表が page-block の外にある今の構造に合わせた指定）。インラインDBのタブでは幕を下ろさない。v1.1.0: ①グループ開閉では幕を下ろさない（消えて出るのが目立つため。位置は ⁰⁵ v3.6.0 が描画前に合わせる） ②タブ切替・ページ移動は「新しい表が描かれ、⁰⁵ が整列し終わる（settled）」まで幕を開けない（データ待ちの静けさで早く開き、後から表が動いて見えていた） ③上限を延長（view 1.5秒／page 1.8秒）。初回の幕（16c Screen Curtain）が開いた後の「描き直し」を感じさせないための薄い幕。タブ切替・グループ開閉・ビュー切替（?v=）・ページ移動の瞬間だけ、DBの本体（ページ移動では本文全体）を一瞬で透明にし、Notion と各スクリプト（⁰⁵ など）の書き込みが静まってから短くフェードで戻す。見た目は html の属性（data-c21-veil / data-c21-veil-scope）だけで決まり、幕の見た目は Stylus「« No »　²² _ Render Veil」が描く。操作は妨げない。スクロールでは幕を下ろさない。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/*
 * しくみ
 *   ① きっかけ（描き直しが始まる前か、始まった瞬間＝描画前）に html[data-c21-veil] を付ける
 *        out … 押した瞬間（pointerdown）。70ms で透明へ（押した手応えとして自然）
 *        cut … URL が変わった瞬間（MutationObserver のコールバック＝描画前）。即透明
 *   ② 幕の間は DOM の変化を見張り、「QUIET_MS 変化なし」かつ ⁰⁵ が書き終わった（busy() が false）ら
 *        in … フェードで戻す（IN_MS）→ 属性を外す
 *      どんな時も MAX_*_MS で必ず戻す（固まらない）
 *   ③ 幕の最中、⁰⁵ v3.5.0 は確認待ちなしで正しい値を即書く（見えないので動きが見えない）
 *
 * 範囲（scope）
 *   view … タブ列より下（DBの本体・グループ見出し・ピン留め見出し）。タイトルとタブは動かさない
 *   page … 本文全体（.notion-frame）。サイドバーは対象外
 *
 * v1.1.0
 *   ・グループ開閉の幕は既定で OFF（GROUP_VEIL: 0）。__c21.set({ GROUP_VEIL: 1 }) で戻せる
 *   ・開ける条件に「切替が実際に起きた（新しいビュー要素 or ?v= の変化）」と「⁰⁵ settled()」を追加
 *     タブを押してからデータが届くまでの静けさで幕が開き、その後に表が描かれて動くのを防ぐ
 *
 * 調整: __c21.set({ IN_MS: 200 }) など（localStorage に保存）／ __c21.on(false) で停止／ __c21.status()
 */

(() => {
  'use strict';

  const VERSION = '1.2.0';
  const API = '__c21';
  const LS_OFF = 'c21-off';
  const LS_TUNE = 'c21-tuning-v1';
  const A = 'data-c21-veil';
  const S = 'data-c21-veil-scope';
  const de = document.documentElement;

  if (window[API] && window[API].version) return;

  const DEFAULTS = {
    OUT_MS: 70,          // 押した時に透明へ向かう時間
    IN_MS: 170,          // 戻る時のフェード
    QUIET_MS: 110,       // これだけ DOM が静かなら「描き終わった」（v1.2: 160→110）
    MIN_HOLD_MS: 90,     // 幕を下ろしてから最低これだけ待つ
    MAX_VIEW_MS: 700,    // view の上限（v1.2: 1500→700）
    MAX_PAGE_MS: 900,    // page の上限（v1.2: 1800→900）
    GROUP_VEIL: 0        // 1 = グループ開閉でも幕を下ろす
  };
  const T = { ...DEFAULTS };
  try {
    const o = JSON.parse(localStorage.getItem(LS_TUNE) || 'null');
    if (o && typeof o === 'object') for (const k of Object.keys(DEFAULTS)) {
      const v = Number(o[k]);
      if (isFinite(v) && v >= 0 && v <= 5000) T[k] = v;
    }
  } catch (e) { /* noop */ }

  let enabled = true;
  try { enabled = localStorage.getItem(LS_OFF) !== '1'; } catch (e) { /* noop */ }

  let phase = null;      // null | 'out' | 'cut' | 'in'
  let scope = null;      // 'view' | 'page'
  let startAt = 0;
  let lastMut = 0;
  let tickT = 0, inT = 0;
  let lastHref = location.href;
  const stats = { view: 0, page: 0, quiet: 0, timeout: 0 };
  const log = [];

  const now = () => performance.now();
  const curtainOpen = () => de.getAttribute('data-c16c-open') !== '0';   // 16c が無い時は開いている扱い
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  function writeVars() {
    de.style.setProperty('--c21-out', (reduced() ? 0 : T.OUT_MS) + 'ms');
    de.style.setProperty('--c21-in', (reduced() ? 0 : T.IN_MS) + 'ms');
  }

  function c05busy() {
    try {
      const api = window.__constellucentiaFullDbBodyAlignment__;
      if (api && typeof api.settled === 'function') return !api.settled();
      return !!(api && typeof api.busy === 'function' && api.busy());
    } catch (e) { return false; }
  }

  /* v1.1.0: 切替が実際に起きたか（タブを押した時の状態と比べる） */
  const VIEW_SEL = '.notion-table-view, .notion-board-view, .notion-list-view, .notion-gallery-view, .notion-timeline-view, .notion-calendar-view';
  let needSwitch = false, snapViews = null, snapV = null;
  function mainViews() {
    const out = [];
    for (const v of document.querySelectorAll('.notion-frame ' + VIEW_SEL.split(', ').join(', .notion-frame '))) {
      if (v.closest('.notion-peek-renderer, .notion-collection_view-block, .sticky-portal-target')) continue;
      if (v.parentElement && v.parentElement.closest(VIEW_SEL)) continue;
      out.push(v);
    }
    return out;
  }
  const curV = () => { try { return new URL(location.href).searchParams.get('v'); } catch (e) { return null; } };
  function switched() {
    if (!needSwitch) return true;
    if (curV() !== snapV) return true;
    for (const v of mainViews()) if (!snapViews.has(v)) return true;
    return false;
  }

  function begin(sc, cut, why, waitSwitch) {
    if (!enabled || !curtainOpen()) return;
    if (waitSwitch) { needSwitch = true; snapViews = new Set(mainViews()); snapV = curV(); }
    else if (!(phase === 'out' || phase === 'cut')) needSwitch = false;
    const active = phase === 'out' || phase === 'cut';
    /* page は view より強い。幕の最中の view は延長だけ */
    if (active && scope === 'page' && sc === 'view') { lastMut = now(); return; }
    clearTimeout(inT); inT = 0;
    scope = sc;
    phase = cut ? 'cut' : (active && phase === 'cut' ? 'cut' : 'out');
    writeVars();
    if (de.getAttribute(S) !== scope) de.setAttribute(S, scope);
    if (de.getAttribute(A) !== phase) de.setAttribute(A, phase);
    startAt = now();
    lastMut = startAt;
    stats[sc] += 1;
    if (log.length >= 40) log.shift();
    log.push({ 時刻: new Date().toLocaleTimeString(), 範囲: sc, 方法: phase, きっかけ: why });
    if (!tickT) tickT = setTimeout(tick, 30);
  }

  function tick() {
    tickT = 0;
    if (phase !== 'out' && phase !== 'cut') return;
    const t = now();
    const held = t - startAt;
    const max = scope === 'page' ? T.MAX_PAGE_MS : T.MAX_VIEW_MS;
    if (held >= max) return reveal('timeout');
    if (held >= Math.max(T.MIN_HOLD_MS, phase === 'out' ? T.OUT_MS : 0) && t - lastMut >= T.QUIET_MS && switched() && !c05busy()) return reveal('quiet');
    tickT = setTimeout(tick, 30);
  }

  function reveal(why) {
    stats[why] += 1;
    if (log.length) log[log.length - 1].戻し = why + '（' + Math.round(now() - startAt) + 'ms）';
    /* 最後の書き込みが幕の下で描かれてから戻す */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (phase !== 'out' && phase !== 'cut') return;
      phase = 'in';
      needSwitch = false;
      de.setAttribute(A, 'in');
      inT = setTimeout(() => {
        inT = 0;
        if (phase !== 'in') return;
        phase = null;
        de.removeAttribute(A);
        de.removeAttribute(S);
      }, T.IN_MS + 60);
    }));
  }

  /* ---------- きっかけ: 押した瞬間 ---------- */
  const inSidebar = (el) => !!el.closest('.notion-sidebar-container, .notion-sidebar, #c16-root');
  const inFrame = (el) => !!el.closest('.notion-frame');

  function onPointerDown(e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const t = e.target;
    if (!(t instanceof Element)) return;

    /* DBビューのタブ（選択中のタブは除く） */
    const tabBtn = t.closest('.notion-collection-view-tab-button, [role="tablist"] [role="tab"]');
    if (tabBtn && inFrame(tabBtn) && !inSidebar(tabBtn) && !tabBtn.closest('.notion-peek-renderer, .notion-collection_view-block')) {
      const tab = tabBtn.matches('[role="tab"]') ? tabBtn : tabBtn.querySelector('[role="tab"]');
      if (tab && tab.getAttribute('aria-selected') === 'true') return;
      begin('view', false, 'タブ', true);
      return;
    }

    /* グループ見出し（開閉ボタン・見出しリンク） */
    const g = t.closest('.notion-collection_view_page-block > [role="button"][aria-expanded], .notion-collection_view_page-block > a[role="link"]');
    if (g && inFrame(g) && !g.closest('.notion-peek-renderer, .notion-collection_view-block')) {
      const block = g.parentElement;
      if (block && block.querySelector(':scope > [role="button"][aria-expanded]')) {
        if (T.GROUP_VEIL) begin('view', false, 'グループ開閉');
        return;
      }
    }

    /* サイドバーのページリンク（別のページへ） */
    const a = t.closest('a[href]');
    if (a && inSidebar(a)) {
      try {
        const u = new URL(a.getAttribute('href'), location.href);
        if (u.origin === location.origin && u.pathname !== location.pathname) begin('page', false, 'サイドバー');
      } catch (e) { /* noop */ }
    }
  }
  function onKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest('[role="tablist"] [role="tab"]') && inFrame(t) && !inSidebar(t) && t.getAttribute('aria-selected') !== 'true') begin('view', false, 'タブ(キー)', true);
  }

  /* ---------- きっかけ: URL が変わった瞬間（描画前） ---------- */
  function checkHref() {
    const h = location.href;
    if (h === lastHref) return;
    let a, b;
    try { a = new URL(lastHref); b = new URL(h); } catch (e) { lastHref = h; return; }
    lastHref = h;
    if (a.pathname !== b.pathname) { begin('page', true, 'ページ移動'); return; }
    if (a.searchParams.get('v') !== b.searchParams.get('v')) {
      if (phase === 'out' || phase === 'cut') { lastMut = now(); return; }
      begin('view', true, 'ビュー切替(?v=)');
    }
  }
  try {
    for (const m of ['pushState', 'replaceState']) {
      const orig = history[m];
      if (typeof orig !== 'function') continue;
      history[m] = function () {
        const r = orig.apply(this, arguments);
        try { checkHref(); } catch (e) { /* noop */ }
        return r;
      };
    }
  } catch (e) { /* noop */ }
  addEventListener('popstate', () => { try { checkHref(); } catch (e) { /* noop */ } });

  /* ---------- 見張り（幕の最中だけ「静かさ」を測る） ---------- */
  const mo = new MutationObserver((recs) => {
    checkHref();
    if (phase !== 'out' && phase !== 'cut') return;
    for (const r of recs) {
      const t = r.target && (r.target.nodeType === 1 ? r.target : r.target.parentElement);
      if (!t || t === de) continue;
      if (inSidebar(t)) continue;
      if (t.nodeName === 'STYLE' || t.nodeName === 'HEAD') continue;
      lastMut = now();
      break;
    }
  });
  mo.observe(de, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: [
      'style', 'aria-expanded', 'aria-selected',
      'data-constellucentia-full-db-body-aligned', 'data-constellucentia-full-db-body-shift',
      'data-constellucentia-full-db-body-sticky-aligned', 'data-constellucentia-full-db-body-sticky-shift'
    ]
  });

  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('keydown', onKeyDown, true);
  writeVars();

  window[API] = {
    version: VERSION,
    status: () => ({ version: VERSION, enabled, phase, scope, tuning: { ...T }, ...stats }),
    log: () => { console.table(log.length ? log : [{ 記録: 'まだありません' }]); return log.length; },
    enabled: () => enabled,
    on: (v = true) => {
      enabled = !!v;
      try { localStorage.setItem(LS_OFF, enabled ? '0' : '1'); } catch (e) { /* noop */ }
      if (!enabled) { phase = null; de.removeAttribute(A); de.removeAttribute(S); }
      return enabled ? 'ON' : 'OFF';
    },
    set: (patch) => {
      if (patch && typeof patch === 'object') for (const k of Object.keys(patch)) {
        if (!(k in DEFAULTS)) { console.warn('[²¹] 未知のキー: ' + k); continue; }
        const v = Number(patch[k]);
        if (isFinite(v) && v >= 0 && v <= 5000) T[k] = v;
      }
      try { localStorage.setItem(LS_TUNE, JSON.stringify(T)); } catch (e) { /* noop */ }
      writeVars();
      return { ...T };
    },
    reset: () => { Object.assign(T, DEFAULTS); try { localStorage.removeItem(LS_TUNE); } catch (e) { /* noop */ } writeVars(); return { ...T }; },
    test: (sc = 'view') => { begin(sc === 'page' ? 'page' : 'view', false, '手動'); return 'ok'; }
  };
})();