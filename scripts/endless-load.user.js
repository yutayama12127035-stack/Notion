// ==UserScript==
// @name         « No »　³⁵ _ Endless Load
// @namespace    https://cordivestium.local/endless-load
// @version      1.0.0
// @description  データベースの「Load more（さらに読み込む）」を、画面に近づいたら自動で押す。グループ分けしたビュー（グループごとの件数の上限）・ボードの列・ギャラリー・リスト・表・インライン DB・ピークの中で、スクロールし続ける限りいくらでも続きを表示。押す間隔を空けて Notion に負担をかけない。⌃⌥L で一時停止／再開。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*
 * v1.0.0（2026-10-03）
 *   ・Notion はビューの読み込み件数（10／25／50／100）やグループごとの件数で表示を区切り、続きは「Load more」を押さないと出ない。
 *     → そのボタンが画面の下端から 900px 以内に入ったら、自動で押す（同じボタンは 1.2 秒に 1 回まで）。読み込まれた分が画面に入れば
 *        また次の「Load more」が近づくので、スクロールし続ける限り無限に続く。
 *   ・見分け方: 文字が「Load more」「Load N more」「Show more」「さらに読み込む」「さらに表示」「もっと見る」などのボタン。
 *     データベースの中（.notion-frame・ピーク・インライン DB）だけ。メニューやコメントの「もっと見る」は押さない。
 *   ・⌃⌥L で一時停止／再開（右下に小さく表示）。コンソール: __c35.status() ／ __c35.set({ on, margin, gap })
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '1.0.0';
  const TAG = '[³⁵ v' + VERSION + ']';
  if (window.__c35 && window.__c35.version) { console.warn(TAG, '旧版が動いています'); return; }

  const LS = 'c35.prefs.v1';
  const P = { on: true, margin: 900, gap: 1200 };
  try { Object.assign(P, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) { /* noop */ }
  const saveP = () => { try { localStorage.setItem(LS, JSON.stringify(P)); } catch (e) { /* noop */ } };
  const ST = { clicks: 0, last: '' };

  const LABEL = /^(load\s+(\d+\s+)?more|show\s+more|load\s+more\s+results|さらに読み込む|さらに\d*件?読み込む|さらに表示|もっと見る|もっと読み込む|続きを読み込む)\b/i;
  const SCOPE = '.notion-frame, .notion-peek-renderer, .notion-collection_view-block, .notion-collection_view_page-block';
  const lastClick = new WeakMap();

  function candidates() {
    const out = [];
    for (const root of document.querySelectorAll('.notion-frame, .notion-peek-renderer')) {
      for (const el of root.querySelectorAll('[role="button"], button')) {
        if (el.closest('[role="menu"], [role="dialog"]:not(.notion-peek-renderer), .notion-overlay-container, .at-panel, #c26-menu')) continue;
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 40 || !LABEL.test(t)) continue;
        if (!el.closest(SCOPE)) continue;
        out.push(el);
      }
    }
    return out;
  }
  function press(el) {
    const r = el.getBoundingClientRect();
    const o = { bubbles: true, cancelable: true, view: window, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0 };
    for (const [C, t] of [[PointerEvent, 'pointerdown'], [MouseEvent, 'mousedown'], [PointerEvent, 'pointerup'], [MouseEvent, 'mouseup'], [MouseEvent, 'click']]) el.dispatchEvent(new C(t, o));
  }
  function tick() {
    if (!P.on) return;
    const now = Date.now();
    for (const el of candidates()) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.top > innerHeight + P.margin || r.bottom < -P.margin) continue;   // まだ遠い
      if (now - (lastClick.get(el) || 0) < P.gap) continue;
      lastClick.set(el, now);
      ST.clicks++; ST.last = (el.textContent || '').trim();
      press(el);
    }
  }
  let t = 0;
  const soon = () => { if (!t) t = setTimeout(() => { t = 0; tick(); }, 250); };
  new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('scroll', soon, true);
  window.addEventListener('resize', soon);
  setInterval(tick, 2000);
  setTimeout(tick, 600);

  /* ⌃⌥L 一時停止／再開 */
  function badge(msg) {
    let b = document.getElementById('c35-badge');
    if (!b) { b = document.createElement('div'); b.id = 'c35-badge'; b.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:2147483000;padding:7px 12px;border-radius:8px;background:rgba(15,15,15,.86);color:#fff;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans",sans-serif;pointer-events:none;transition:opacity .2s'; document.body.appendChild(b); }
    b.textContent = msg; b.style.opacity = '1';
    clearTimeout(badge.t); badge.t = setTimeout(() => { b.style.opacity = '0'; }, 2200);
  }
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && !e.metaKey && e.code === 'KeyL') { e.preventDefault(); e.stopPropagation(); P.on = !P.on; saveP(); badge(P.on ? '続きの自動読み込み：入' : '続きの自動読み込み：一時停止'); if (P.on) tick(); }
  }, true);

  window.__c35 = {
    version: VERSION,
    status: () => Object.assign({ prefs: Object.assign({}, P), waiting: candidates().length }, ST),
    set(o) { Object.assign(P, o || {}); saveP(); tick(); return Object.assign({}, P); }
  };
})();
