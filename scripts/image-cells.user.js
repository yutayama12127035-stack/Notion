// ==UserScript==
// @name         « No »　³⁴ _ Image Cells
// @namespace    https://cordivestium.local/image-cells
// @version      2.1.0
// @description  テーブルビューの画像（ファイルのプロパティ）を、ギャラリーのように大きく・くっきり。Notion は表の画像を高さ 24px・幅 100px の縮小版で出すが、セルの幅いっぱい（または決めた高さ）に広げ、表示の大きさ×画面の解像度に合わせた高解像度版（最大 3840px＝4K）に差し替える。読み込みが済んでから入れ替えるので、ちらつかない。複数の画像は並べて（列の数は指定可）。大きさ・角の丸み・間隔・合わせ方は ²⁶ Atelier「表のセル」から。⌥クリックで原寸の拡大表示。³¹ Atlas Views の代わり（Atlas は廃止）。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*
 * v2.0.0（2026-10-03）
 *   ・表紙のセルに乗せると、コメントのボタンが「白い帯」になって表紙の上を横いっぱいに覆っていた（²⁷ の画像）。
 *     原因はこのスクリプト: 画像を並べるために「セルの中身の直接の子」を全部 横いっぱいの格子（display: grid; width: 100%）にしていたが、
 *     Notion は乗せた時だけ、同じ段に「ボタンの段」（position: absolute の箱 ＞ .quickActionContainer）を差し込む。
 *     それまで格子にして横いっぱいに伸ばしていた。→ 格子にするのは画像の段だけ（absolute の箱・ボタンの段は除く）。
 *   ・ボタンの段そのものも、表紙を隠さないように: 右上の小さなすりガラスの粒（半透明）。粒に乗せた時だけはっきり出る。
 *     ³⁷ Lumière が無くても効く。
 * v1.0.0（2026-10-03）
 *   ・対象: 表ビューのセルの中の画像（/image/… の Notion 経由の画像・外部の画像 URL）。フルページの DB・インライン DB・ピークの中。
 *   ・大きく: 既定は「幅に合わせる」— 画像をセルの幅いっぱいに、縦横比はそのまま（高さの上限 --c34-maxh）。
 *            「高さをそろえる」— 決めた高さ（--c34-h）で横に並べる。
 *   ・くっきり（4K 化）: Notion の画像の URL の width=100 を、表示の幅×devicePixelRatio×1.5（400／800／1200／1600／2400／3840 の段階）に
 *            書き換えた版を裏で読み込み、読み終わってから差し替える。Notion が描き直して小さい版に戻しても、すぐ大きい版に戻す。
 *   ・⌥クリックで原寸（width なし＝元の画像）を画面いっぱいに。Esc・クリックで閉じる。ふつうのクリックは Notion のまま。
 *   ・値（²⁶ Atelier「表のセル」の「画像（³⁴）」・CSS 変数）:
 *       --c34-mode: fill（幅に合わせる）／ height（高さをそろえる）
 *       --c34-maxh 高さの上限（fill）・--c34-h 高さ（height）・--c34-cols 複数の時の列の数・--c34-gap 間隔・--c34-radius 角の丸み・
 *       --c34-fit cover／contain・--c34-shadow 影の濃さ（0〜1）
 *   ・コンソール: __c34.status() ／ __c34.set({ mode, maxh, h, cols, gap, radius, fit, shadow, max: 3840 }) ／ __c34.off()
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '2.1.0';
  const TAG = '[³⁴ v' + VERSION + ']';
  if (window.__c34 && window.__c34.version) { console.warn(TAG, '旧版が動いています'); return; }

  const LS = 'c34.prefs.v1';
  const P = { on: true, max: 3840 };
  try { Object.assign(P, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) { /* noop */ }
  const saveP = () => { try { localStorage.setItem(LS, JSON.stringify(P)); } catch (e) { /* noop */ } };
  const ST = { scans: 0, imgs: 0, upgraded: 0, failed: 0 };

  const CELL_IMG = '.notion-table-view-cell [data-testid="property-value"] img, .notion-table-view [role="cell"] [data-testid="property-value"] img';
  const STEPS = [400, 800, 1200, 1600, 2400, 3840];
  const isIcon = (img) => !!img.closest('.notion-record-icon, .cordi13-item, [data-cordi13-on]');

  /* ============================================================
   *  URL
   * ============================================================ */
  function hiUrl(src, px) {
    try {
      const u = new URL(src, location.href);
      if (u.origin === location.origin && /^\/image\//.test(u.pathname)) {
        const step = STEPS.find((s) => s >= px) || STEPS[STEPS.length - 1];
        u.searchParams.set('width', String(Math.min(P.max || 3840, step)));
        return u.pathname + u.search;
      }
      return src;   // 外部の画像は元のまま（もともと原寸）
    } catch (e) { return src; }
  }
  function fullUrl(src) {
    try { const u = new URL(src, location.href); if (u.origin === location.origin && /^\/image\//.test(u.pathname)) u.searchParams.delete('width'); return u.href; } catch (e) { return src; }
  }
  const widthOf = (src) => { const m = /[?&]width=(\d+)/.exec(src || ''); return m ? +m[1] : 0; };

  /* ============================================================
   *  画像を大きく・差し替え
   * ============================================================ */
  const cache = new Map();   // 高解像度 URL → 読み込み済みか
  function upgrade(img) {
    const cur = img.getAttribute('src') || '';
    if (!cur || cur.startsWith('data:')) return;
    const box = img.getBoundingClientRect();
    const need = Math.ceil(Math.max(box.width, box.height * 1.5, 120) * (window.devicePixelRatio || 1) * 1.5);
    const want = hiUrl(img.dataset.c34Orig || cur, need);
    if (want === cur || widthOf(cur) >= widthOf(want) && widthOf(cur)) { img.dataset.c34Hi = '1'; return; }
    if (!img.dataset.c34Orig || widthOf(cur) < widthOf(img.dataset.c34Orig || '') || !img.dataset.c34Hi) img.dataset.c34Orig = cur;
    const swap = () => {
      if (!img.isConnected) return;
      img.setAttribute('src', want);
      img.removeAttribute('srcset');
      img.dataset.c34Hi = '1';
      img.dataset.c34Src = want;
      ST.upgraded++;
    };
    if (cache.get(want) === true) { swap(); return; }
    if (cache.get(want) === 'loading') { setTimeout(() => upgrade(img), 300); return; }
    cache.set(want, 'loading');
    const pre = new Image();
    pre.decoding = 'async';
    pre.onload = () => { cache.set(want, true); swap(); };
    pre.onerror = () => { cache.set(want, false); ST.failed++; };
    pre.src = want;
  }
  function mark(img) {
    if (isIcon(img)) return;
    const pv = img.closest('[data-testid="property-value"]');
    if (!pv) return;
    const n = pv.querySelectorAll('img').length;
    pv.setAttribute('data-c34', n > 1 ? 'multi' : 'one');
    img.setAttribute('data-c34-img', '1');
    try { img.loading = 'eager'; img.decoding = 'async'; } catch (e) { /* noop */ }
    /* Notion が描き直して小さい版に戻したら、すぐ大きい版へ */
    if (img.dataset.c34Src && img.getAttribute('src') !== img.dataset.c34Src) {
      if (cache.get(img.dataset.c34Src) === true && widthOf(img.getAttribute('src')) < widthOf(img.dataset.c34Src)) { img.dataset.c34Orig = img.getAttribute('src'); img.setAttribute('src', img.dataset.c34Src); return; }
      delete img.dataset.c34Hi;
    }
    if (!img.dataset.c34Hi) {
      if (img.complete && img.naturalWidth) upgrade(img);
      else img.addEventListener('load', () => upgrade(img), { once: true });
    }
  }
  let resizeT = 0;
  function scan() {
    if (!P.on) return;
    ST.scans++;
    installCss();
    applyMode();
    const imgs = document.querySelectorAll(CELL_IMG);
    ST.imgs = imgs.length;
    for (const img of imgs) mark(img);
    /* 高さが変わった行を Notion に測り直させる */
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { try { window.dispatchEvent(new Event('resize')); } catch (e) { /* noop */ } }, 250);
  }
  /* 合わせ方は CSS 変数 --c34-mode（²⁶ Atelier から）→ html の印 */
  function applyMode() {
    const cs = getComputedStyle(document.documentElement);
    const mode = (P.mode || cs.getPropertyValue('--c34-mode') || 'fill').trim().replace(/["']/g, '') || 'fill';
    if (document.documentElement.getAttribute('data-c34-mode') !== mode) document.documentElement.setAttribute('data-c34-mode', mode);
  }
  function applyVars() {
    const r = document.documentElement.style;
    const map = { maxh: ['--c34-maxh', 'px'], h: ['--c34-h', 'px'], cols: ['--c34-cols', ''], gap: ['--c34-gap', 'px'], radius: ['--c34-radius', 'px'], fit: ['--c34-fit', ''], shadow: ['--c34-shadow', ''] };
    for (const [k, [v, u]] of Object.entries(map)) { if (P[k] !== undefined && P[k] !== '') r.setProperty(v, P[k] + u); else r.removeProperty(v); }
  }

  /* ============================================================
   *  CSS
   * ============================================================ */
  const B = ':not(#c34a):not(#c34b):not(#c34c)';
  function installCss() {
    if (document.getElementById('c34-css')) return;
    const st = document.createElement('style');
    st.id = 'c34-css';
    st.textContent = `
:root { --c34-maxh: 320px; --c34-h: 120px; --c34-cols: 2; --c34-gap: 6px; --c34-radius: 6px; --c34-fit: cover; --c34-shadow: .12; }
[data-c34]${B} { height: auto !important; overflow: visible !important; }
[data-c34] > div:not([style*="position: absolute"]):not(:has(> .quickActionContainer))${B} { display: grid !important; grid-template-columns: 1fr !important; gap: var(--c34-gap) !important; width: 100% !important; }
[data-c34="multi"] > div:not([style*="position: absolute"]):not(:has(> .quickActionContainer))${B} { grid-template-columns: repeat(var(--c34-cols), minmax(0, 1fr)) !important; }
/* v2.0.0: 乗せた時に Notion が差し込むボタンの段（コメントなど）— 表紙を隠さない右上の小さな粒 */
[data-c34] > div:is([style*="position: absolute"], :has(> .quickActionContainer))${B} { display: flex !important; justify-content: flex-end !important; width: auto !important; inset-inline: auto 0 !important; top: 4px !important; margin: 0 4px !important; pointer-events: none !important; }
[data-c34] .quickActionContainer${B} { width: auto !important; height: 22px !important; padding: 1px !important; gap: 0 !important; border-radius: 999px !important; background: color-mix(in srgb, var(--c-bacEle, #fff) 62%, transparent) !important; -webkit-backdrop-filter: blur(10px) saturate(1.4); backdrop-filter: blur(10px) saturate(1.4); box-shadow: 0 0 0 .5px rgba(15,15,15,.12), 0 2px 8px rgba(15,15,15,.12) !important; opacity: .55; transition: opacity .15s ease; }
[data-c34] .quickActionContainer:hover${B} { opacity: 1; background: var(--c-bacEle, #fff) !important; }
[data-c34] .quickActionContainer [role="button"]${B} { width: 20px !important; min-width: 20px !important; height: 20px !important; padding: 0 !important; border-radius: 999px !important; }
/* v2.1.0: 表紙のセルではボタンの段ごと出さない（コメントは表紙の上に要らない） */
[data-c34] > div:is([style*="position: absolute"], :has(> .quickActionContainer)):has(.quickActionContainer)${B} { display: none !important; }
[data-c34] .quickActionContainer svg${B} { width: 14px !important; height: 14px !important; }
img[data-c34-img]${B} { display: block !important; max-height: none !important; max-width: 100% !important; border-radius: var(--c34-radius) !important; box-shadow: 0 0 0 .5px rgba(15,15,15,calc(var(--c34-shadow) * .8)), 0 2px 8px rgba(15,15,15,var(--c34-shadow)) !important; background: var(--c-bacHov, rgba(55,53,47,.06)); image-rendering: auto; transition: opacity .2s ease; }
html[data-c34-mode="fill"] img[data-c34-img]${B} { width: 100% !important; height: auto !important; max-height: var(--c34-maxh) !important; object-fit: var(--c34-fit) !important; }
html[data-c34-mode="height"] [data-c34] > div${B} { display: flex !important; flex-wrap: wrap !important; }
html[data-c34-mode="height"] img[data-c34-img]${B} { height: var(--c34-h) !important; width: auto !important; object-fit: var(--c34-fit) !important; }
#c34-view { position: fixed; inset: 0; z-index: 2147483500; display: flex; align-items: center; justify-content: center; background: rgba(15,15,15,.86); cursor: zoom-out; }
#c34-view img { max-width: 96vw; max-height: 94vh; border-radius: 6px; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
#c34-view span { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,.7); font: 12px/1 -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif; }
`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ============================================================
   *  ⌥クリックで原寸
   * ============================================================ */
  function view(src) {
    const old = document.getElementById('c34-view'); if (old) old.remove();
    const v = document.createElement('div');
    v.id = 'c34-view';
    v.innerHTML = '<img alt=""><span>原寸の画像を読み込んでいます…</span>';
    const im = v.querySelector('img');
    im.onload = () => { v.querySelector('span').textContent = im.naturalWidth + ' × ' + im.naturalHeight + ' px　·　クリック／Esc で閉じる'; };
    im.src = fullUrl(src);
    const close = () => { v.remove(); window.removeEventListener('keydown', key, true); };
    const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
    v.addEventListener('click', close);
    window.addEventListener('keydown', key, true);
    document.body.appendChild(v);
  }
  for (const t of ['pointerdown', 'mousedown', 'click']) {
    window.addEventListener(t, (e) => {
      if (!e.altKey || e.button !== 0) return;
      const img = e.target instanceof Element && e.target.closest('img[data-c34-img]');
      if (!img) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (t === 'click') view(img.dataset.c34Orig || img.getAttribute('src'));
    }, true);
  }

  /* ============================================================
   *  起動
   * ============================================================ */
  let t = 0;
  const soon = () => { if (!t) t = requestAnimationFrame(() => { t = 0; scan(); }); };
  const mo = new MutationObserver((recs) => {
    for (const r of recs) {
      if (r.type === 'attributes') { if (r.target.tagName === 'IMG' && r.target.closest('.notion-table-view-cell, .notion-table-view')) { soon(); return; } continue; }
      for (const n of r.addedNodes) if (n.nodeType === 1 && (n.tagName === 'IMG' || n.querySelector && n.querySelector('img'))) { soon(); return; }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  document.addEventListener('atelier-change', () => { applyMode(); soon(); });
  window.addEventListener('resize', () => { clearTimeout(window.__c34rs); window.__c34rs = setTimeout(() => { for (const img of document.querySelectorAll('img[data-c34-img]')) { delete img.dataset.c34Hi; upgrade(img); } }, 400); });
  applyVars();
  setTimeout(scan, 300);

  window.__c34 = {
    version: VERSION,
    status: () => Object.assign({ prefs: Object.assign({}, P), mode: document.documentElement.getAttribute('data-c34-mode') }, ST),
    set(o) { Object.assign(P, o || {}); saveP(); applyVars(); applyMode(); scan(); return Object.assign({}, P); },
    off() { P.on = false; saveP(); mo.disconnect(); const s = document.getElementById('c34-css'); if (s) s.remove(); document.querySelectorAll('[data-c34],[data-c34-img]').forEach((el) => { el.removeAttribute('data-c34'); el.removeAttribute('data-c34-img'); }); return 'stopped（__c34.set({ on: true }) と再読み込みで戻ります）'; }
  };
})();
