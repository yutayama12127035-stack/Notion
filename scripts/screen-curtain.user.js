// ==UserScript==
// @name         16c Screen Curtain
// @namespace    c16
// @version      3.0.0
// @description  v3.0.0: 「出来上がった画面だけ」を出す幕 — 時計ではなく各柱の「整いました」の合図で開く（本文が描けた・¹⁶ の並べ替えが落ち着いた・³³ の輪と検索窓が置けた・⁰⁵ の整列が済んだ・書体が届いた）。合図がそろったら 1〜2 コマ待って、静かにフェードで開く。前回まで来た合図は覚えておき（入れていない柱は待たない）、合図が来ない時も本文から 2.6 秒・開いてから 7 秒で必ず開く。v2.0.0 は「2.5 秒で必ず開く」だったため、読み込みに 4 秒かかる端末では整う前に開き、描き直しが見えていた。
// @match        https://app.notion.com/*
// @match        https://www.notion.com/*
// @match        https://www.notion.so/*
// @match        https://notion.so/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/*
 * しくみ（v3.0.0）
 *   幕そのもの（不透明な地の色）は ³⁹ Style Sheets の「16c 幕」の CSS。このスクリプトは「いつ開けるか」だけを決める。
 *
 *   開ける条件（すべて）
 *     ① 本文: .notion-frame の中にページか DB の中身がある（ログイン画面なども可）
 *     ② サイドバーが見えている時だけ:
 *          ¹⁶ … html[data-c16-ready] が付き、並べ替えと字下げが落ち着いた（data-c16-settled。来なければ ready から 0.7 秒）
 *          ³³ … html[data-c33-ready]（輪・検索窓・印が置けた）
 *        サイドバーを閉じている時は待たない
 *     ③ ⁰⁵ の整列が済んだ（__constellucentiaFullDbBodyAlignment__.settled()）
 *     ④ 書体が届いた（本文から最長 0.5 秒）
 *     ⑤ 条件がそろってから、画面の変化が 140ms 止まるのを待つ（最長 0.32 秒）→ 次のコマで開く
 *
 *   覚えておく: ¹⁶・³³ の合図を一度でも見たら localStorage['c16c.gates'] に記録し、次からは「起動が遅れても待つ」。
 *              サイドバーが見えていたのに来なかった合図は忘れる（その柱を外した時に毎回待たない）。
 *   保険: 本文が出てから 2.6 秒・ページを開いてから 7 秒で必ず開く。CSS 側も、このスクリプトが動いていれば 9 秒、
 *        動いていなければ 2.5 秒で必ず開く（html[data-c16c-open="0"] の有無で見分ける）。
 *   調整: localStorage['c16c.tune'] = '{"quiet":140,"tail":320,"fonts":500,"settleMax":2600,"hard":7000}'
 *   確かめる: __c16c() … 開いた理由・時間・合図ごとの時刻（ms）
 */
(() => {
  'use strict';
  if (window.__c16cLoaded) return;
  window.__c16cLoaded = true;

  const VERSION = '3.0.0';
  const T = { quiet: 140, tail: 320, fonts: 500, settleMax: 2600, hard: 7000, c16Grace: 700 };
  try { const o = JSON.parse(localStorage.getItem('c16c.tune') || 'null'); if (o) for (const k of Object.keys(T)) if (isFinite(+o[k]) && +o[k] >= 0 && +o[k] <= 30000) T[k] = +o[k]; } catch (e) { /* noop */ }
  const MEM_K = 'c16c.gates';
  let mem = {};
  try { mem = JSON.parse(localStorage.getItem(MEM_K) || '{}') || {}; } catch (e) { mem = {}; }

  const now = () => performance.now();   // ページを開いた時からの ms
  const t0 = now();
  const at = {};                           // 合図ごとの時刻（確かめる用）
  const seen = (k) => { if (!(k in at)) at[k] = Math.round(now()); };
  let done = false, lastAt = t0, gatesAt = 0, mo = null, timer = 0, c16ReadyAt = 0;
  const de = () => document.documentElement;
  const attr = (k) => { const d = de(); return d ? d.getAttribute(k) : null; };

  function mark() { if (de() && !de().hasAttribute('data-c16c-open')) de().setAttribute('data-c16c-open', '0'); }
  if (de()) mark(); else { const w = new MutationObserver(() => { if (de()) { w.disconnect(); mark(); } }); w.observe(document, { childList: true }); }

  function lift(why) {
    if (done) return;
    done = true;
    try { mo && mo.disconnect(); } catch (e) { /* noop */ }
    clearTimeout(timer);
    /* 覚える: 見えたサイドバーで合図が来た柱は「入っている」、来なかった柱は「外した」 */
    try {
      if ('side' in at) {
        mem.c16 = 'c16' in at ? 1 : 0;
        mem.c33 = 'c33' in at ? 1 : 0;
      }
      mem.side = 'side' in at ? 1 : 0;
      localStorage.setItem(MEM_K, JSON.stringify(mem));
      /* 幕の後でサイドバーが出てきた時も覚える（次からは、出るまで待つ） */
      if (!mem.side) [1200, 4000].forEach((ms) => setTimeout(() => { try { if (!mem.side && sideShown()) { mem.side = 1; localStorage.setItem(MEM_K, JSON.stringify(mem)); } } catch (e) { /* noop */ } }, ms));
    } catch (e) { /* noop */ }
    const open = () => {
      const d = de(); if (!d) return;
      d.setAttribute('data-c16c-why', why);
      d.setAttribute('data-c16c-ms', String(Math.round(now() - t0)));
      d.setAttribute('data-c16c-open', '1');
    };
    /* 2 コマ待つ: 最後の印（³⁹・Atelier・³³）が描かれたコマの次で開く */
    try { requestAnimationFrame(() => requestAnimationFrame(open)); } catch (e) { open(); }
  }

  const CONTENT = '.notion-frame .notion-page-content, .notion-frame .notion-collection_view-block, .notion-frame .notion-collection-view-body, .notion-frame .notion-table-view, .notion-frame .notion-board-view, .notion-frame .notion-gallery-view, .notion-frame .notion-list-view, .notion-frame .notion-calendar-view, .notion-frame .notion-timeline-view, .notion-frame [data-content-editable-root], .notion-login, .notion-onboarding';
  function hasContent() {
    try {
      if (document.querySelector(CONTENT)) return true;
      /* ホーム・設定など、ページの本文の形でない画面: 枠に中身が入っていれば 1 秒後から中身ありとする */
      if (now() > 1000) { const f = document.querySelector('.notion-frame, #notion-app main'); return !!(f && f.querySelector('h1, h2, [role="heading"], [role="grid"], [role="list"], a[href]')); }
      return false;
    } catch (e) { return false; }
  }
  /* サイドバーが画面に出ているか（閉じている・浮かぶ表示で隠れている時は、サイドバーの合図を待たない） */
  function sideShown() {
    const s = document.querySelector('nav.notion-sidebar-container, .notion-sidebar-container');
    if (!s) return null;   // まだ描かれていない
    const r = s.getBoundingClientRect();
    return r.width > 60 && r.right > 60 && r.height > 120;
  }
  function gates(t, contentAt) {
    const wait = [];
    /* サイドバー（前回出ていたのに、まだ描かれていない時は待つ。閉じてある時は待たない） */
    const ss = sideShown();
    if (ss === null && mem.side === 1) wait.push('side');
    if (ss) {
      seen('side');
      const c16on = !!(window.__c16 && window.__c16.version) || mem.c16 === 1 || attr('data-c16-ready') != null;
      if (c16on) {
        if (attr('data-c16-ready') === '1') {
          if (!c16ReadyAt) c16ReadyAt = t;
          if (attr('data-c16-settled') === '1' || t - c16ReadyAt >= T.c16Grace) seen('c16'); else wait.push('c16-settle');
        } else wait.push('c16');
      }
      const c33on = attr('data-c33-boot') != null || mem.c33 === 1;
      if (c33on) { if (attr('data-c33-ready') === '1') seen('c33'); else wait.push('c33'); }
    }
    /* ⁰⁵ の整列 */
    try { const api = window.__constellucentiaFullDbBodyAlignment__; if (api && typeof api.settled === 'function') { if (api.settled()) seen('c05'); else wait.push('c05'); } } catch (e) { /* noop */ }
    /* 書体 */
    if (!document.fonts || document.fonts.status === 'loaded' || t - contentAt >= T.fonts) seen('fonts'); else wait.push('fonts');
    return wait;
  }

  let contentAt = 0, lastWait = [];
  function tick() {
    timer = 0;
    if (done) return;
    const t = now();
    if (t >= T.hard) return lift('hard-cap');
    if (!contentAt && hasContent()) { contentAt = t; seen('content'); }
    if (contentAt) {
      if (t - contentAt >= T.settleMax) return lift('settle-max:' + lastWait.join('+'));
      lastWait = gates(t, contentAt);
      if (!lastWait.length) {
        if (!gatesAt) { gatesAt = t; seen('gates'); }
        if (t - lastAt >= T.quiet) return lift('ready');
        if (t - gatesAt >= T.tail) return lift('ready-busy');
      } else gatesAt = 0;
    }
    timer = setTimeout(tick, contentAt ? 30 : 50);
  }

  try {
    mo = new MutationObserver(() => { lastAt = now(); });
    const start = () => { if (!de()) return; mo.observe(de(), { childList: true, subtree: true }); };
    if (de()) start(); else document.addEventListener('readystatechange', start, { once: true });
  } catch (e) { /* noop */ }
  /* 合図の属性が付いた瞬間にも確かめる（30ms ごとの見回りを待たない） */
  try {
    const sig = new MutationObserver(() => { if (!done && contentAt) { clearTimeout(timer); tick(); } });
    const go = () => { if (!de()) return setTimeout(go, 10); sig.observe(de(), { attributes: true, attributeFilter: ['data-c16-ready', 'data-c16-settled', 'data-c33-ready'] }); };
    go();
  } catch (e) { /* noop */ }
  timer = setTimeout(tick, 50);

  window.__c16c = () => ({ version: VERSION, open: done, why: attr('data-c16c-why'), ms: attr('data-c16c-ms'), waiting: done ? [] : lastWait.slice(), at: Object.assign({}, at), remembered: Object.assign({}, mem), tune: Object.assign({}, T) });
})();
