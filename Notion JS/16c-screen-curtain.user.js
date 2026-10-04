// ==UserScript==
// @name         16c Screen Curtain
// @namespace    c16
// @version      1.5.0
// @description  ページ読み込みとJS注入が完全に完了したタイミングで幕を開きます。v1.5.0: 幕（Stylus「16c 幕」v1.1.0）を不透明にしたのに合わせ、開く条件を厳しく — ①書体の読み込み完了（document.fonts）②⁰⁵ の整列完了（settled）③画面の静けさ 600ms を 2回連続、④開く直前に2フレーム待って最後の書き込みを描かせてから開く。
// @match        https://app.notion.com/*
// @match        https://www.notion.com/*
// @match        https://www.notion.so/*
// @match        https://notion.so/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(() => {
  'use strict';
  if (window.__c16cLoaded) return;
  window.__c16cLoaded = true;

  const de = document.documentElement;
  const t0 = Date.now();
  let done = false, lastAt = Date.now(), ok = 0, mo = null;

  de.setAttribute('data-c16c-open', '0');

  function lift(why) {
    if (done) return;
    done = true;
    try { mo && mo.disconnect(); } catch (e) {}
    mo = null;
    /* v1.5.0: 最後の書き込みを幕の下で描かせてから開く */
    const open = () => { de.setAttribute('data-c16c-open', '1'); de.setAttribute('data-c16c-why', why); };
    try { requestAnimationFrame(() => requestAnimationFrame(open)); } catch (e) { open(); }
  }
  
  try {
    mo = new MutationObserver(() => { lastAt = Date.now(); });
    mo.observe(de, { childList: true, subtree: true });
  } catch (e) {}

  // 読み込みイベント時にも最終更新時間をリセット
  window.addEventListener('DOMContentLoaded', () => { lastAt = Date.now(); });
  window.addEventListener('load', () => { lastAt = Date.now(); });

  function tick() {
    if (done) return;
    const now = Date.now(), el = now - t0, quiet = now - lastAt >= 600;
    const has16 = !!(window.__c16 && window.__c16.version);

    // 1. ページ自体の完全なロード完了（リソース全読み込み完了）
    const isPageLoaded = document.readyState === 'complete';

    // 2. Notion本体のDOMが描画されたかどうかの目安
    const notionApp = document.getElementById('notion-app');
    const isNotionRendered = notionApp && notionApp.childElementCount > 0;

    // 3. c16側の準備が完了しているか
    const isC16Settled = de.getAttribute('data-c16-settled') === '1';

    // 判定：ページとNotionが両方完了しており、かつc16があればそれも完了していること
    let ready = false;
    if (isPageLoaded && isNotionRendered) {
      ready = has16 ? isC16Settled : true;
    }

    /* v1.5.0: 書体・⁰⁵ の整列も待つ */
    const fontsOk = !document.fonts || document.fonts.status === 'loaded';
    let c05ok = true;
    try {
      const api = window.__constellucentiaFullDbBodyAlignment__;
      if (api && typeof api.settled === 'function') c05ok = !!api.settled();
    } catch (e) {}
    ok = (ready && quiet && fontsOk && c05ok) ? ok + 1 : 0;
    
    // 2回連続（安定して）条件を満たしたら開ける
    if (ok >= 2) return lift('fully-loaded-and-settled');
    
    // JS側の強制開放タイムアウト（CSS側より長めに設定）
    if (!has16 && el > 12000 && isPageLoaded) return lift('no-c16-but-loaded');
    if (el > 15000 && quiet) return lift('timeout-quiet');
    if (el > 20000) return lift('hard-timeout');
    
    setTimeout(tick, 150);
  }
  setTimeout(tick, 150);

  window.__c16c = () => ({
    version: '1.5.0', open: done, why: de.getAttribute('data-c16c-why'), ms: Date.now() - t0
  });
})();