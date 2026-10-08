// ==UserScript==
// @name         16c Screen Curtain
// @namespace    c16
// @version      2.0.0
// @description  v2.0.0: 速く開く — 本文（ページ・DB）が描かれたら、短い静けさ（120ms）を待って開く。書体・各柱の整列・ページ全体の読み込み完了（readyState）は「少しだけ」待つ（最大 0.4 秒）。どんな時も 2.5 秒で必ず開く（以前は「600ms の静けさ 2 回」を待ち、12〜20 秒かかることがあった）。v1.5.0: 幕（³⁹「²³ Details」の 16c 幕）と対。
// @match        https://app.notion.com/*
// @match        https://www.notion.com/*
// @match        https://www.notion.so/*
// @match        https://notion.so/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/*
 * しくみ（v2.0.0）
 *   ① 本文が描かれた瞬間（.notion-frame の中にページか DB の中身がある）を「中身あり」とする
 *   ② 中身ありから、画面の変化が 120ms 止まったら開く。止まらなくても中身ありから 900ms で開く
 *   ③ 書体の読み込み・¹⁶ の並べ替え（settled）・⁰⁵ の整列（settled）は、中身ありから 400ms までは待つ（それ以上は待たない）
 *   ④ 保険: 始まりから 2.5 秒で必ず開く（CSS 側も 3 秒で開く）
 *   調整: localStorage['c16c.tune'] = '{"quiet":120,"maxAfter":900,"settle":400,"hard":2500}'
 */
(() => {
  'use strict';
  if (window.__c16cLoaded) return;
  window.__c16cLoaded = true;

  const VERSION = '2.0.0';
  const T = { quiet: 120, maxAfter: 900, settle: 400, hard: 2500 };
  try { const o = JSON.parse(localStorage.getItem('c16c.tune') || 'null'); if (o) for (const k of Object.keys(T)) if (isFinite(+o[k]) && +o[k] >= 0 && +o[k] <= 20000) T[k] = +o[k]; } catch (e) { /* noop */ }

  const t0 = performance.now();
  let done = false, lastAt = t0, contentAt = 0, mo = null, timer = 0;
  const de = () => document.documentElement;

  function mark() { if (de()) de().setAttribute('data-c16c-open', '0'); }
  if (de()) mark(); else { const w = new MutationObserver(() => { if (de()) { w.disconnect(); mark(); } }); w.observe(document, { childList: true }); }

  function lift(why) {
    if (done) return;
    done = true;
    try { mo && mo.disconnect(); } catch (e) { /* noop */ }
    clearTimeout(timer);
    const open = () => { if (!de()) return; de().setAttribute('data-c16c-open', '1'); de().setAttribute('data-c16c-why', why); de().setAttribute('data-c16c-ms', String(Math.round(performance.now() - t0))); };
    try { requestAnimationFrame(open); } catch (e) { open(); }
  }

  const CONTENT = '.notion-frame .notion-page-content, .notion-frame .notion-collection_view-block, .notion-frame .notion-table-view, .notion-frame .notion-board-view, .notion-frame .notion-gallery-view, .notion-frame .notion-list-view, .notion-frame .notion-calendar-view, .notion-frame .notion-timeline-view, .notion-frame [data-content-editable-root], .notion-login, .notion-onboarding';
  function hasContent() {
    try {
      if (document.querySelector(CONTENT)) return true;
      /* ホーム・設定など、ページの本文の形でない画面: 枠（.notion-frame / main）に中身が入っていれば 0.8 秒後から中身ありとする */
      if (performance.now() - t0 > 800) { const f = document.querySelector('.notion-frame, #notion-app main'); return !!(f && f.querySelector('h1, h2, [role="heading"], [role="grid"], [role="list"], a[href]')); }
      return false;
    } catch (e) { return false; }
  }
  function settledEnough() {
    const fontsOk = !document.fonts || document.fonts.status === 'loaded';
    let c16 = true, c05 = true;
    try { if (window.__c16 && window.__c16.version) c16 = de().getAttribute('data-c16-settled') === '1'; } catch (e) { /* noop */ }
    try { const api = window.__constellucentiaFullDbBodyAlignment__; if (api && typeof api.settled === 'function') c05 = !!api.settled(); } catch (e) { /* noop */ }
    return fontsOk && c16 && c05;
  }

  function tick() {
    timer = 0;
    if (done) return;
    const now = performance.now();
    if (now - t0 >= T.hard) return lift('hard-cap');
    if (!contentAt && hasContent()) contentAt = now;
    if (contentAt) {
      const after = now - contentAt;
      const quiet = now - lastAt >= T.quiet;
      if (after >= T.maxAfter) return lift('content-max');
      if (quiet && (settledEnough() || after >= T.settle)) return lift(settledEnough() ? 'content-settled' : 'content-quiet');
    }
    timer = setTimeout(tick, 40);
  }

  try {
    mo = new MutationObserver(() => { lastAt = performance.now(); });
    const start = () => { if (!de()) return; mo.observe(de(), { childList: true, subtree: true }); };
    if (de()) start(); else document.addEventListener('readystatechange', start, { once: true });
  } catch (e) { /* noop */ }
  timer = setTimeout(tick, 40);

  window.__c16c = () => ({ version: VERSION, open: done, why: de() && de().getAttribute('data-c16c-why'), ms: de() && de().getAttribute('data-c16c-ms'), tune: Object.assign({}, T) });
})();
