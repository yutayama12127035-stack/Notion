// ==UserScript==
// @name         « No »　⁴² _ Record Cards
// @namespace    https://cordivestium.local/record-cards
// @version      1.0.0
// @description  v1.0.0: フル DB の表のビューを、1 レコード 1 枚のカードで読む（³³ 198 までの「上下分割」をここへ移した）。表紙は左に大きく（高さ 220 / 260 / 300px）、題字と項目はその右に、項目が増えれば列を増やして並べ、長い字は全文で下に。値の編集は Notion のまま（空の値・表紙の無い行の表紙も押せる）。対象は設定したビューだけ（既定は Medias の Books）。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://app.notion.com/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @noframes
// ==/UserScript==

/*
 * v1.0.0（2026-10-13・³³ 199.0.0 と組で。依頼主の 198 の実機の見え方への直し）
 *   「見た目が崩れている。後はこれで編集ができるようにしてほしい。…表紙が小さいし、後はこれはプロパティが増えることを全く考慮してない。
 *    DBに関係しているから、３３のサイドバーからは外れるはず。表紙はきれいにズームしなくても見えるレベルで、作者などの細かい文字も識別できるレベル」
 *   ・³³ の C196（上下分割）をこのスクリプトへ移した。³³ はサイドバー・索引帯・星の罫線だけを受け持ち、カードの間は下の契約を読んで譲る
 *   ・崩れの原因: 198 は長い字（あらすじ）を右の段に置き、短い項目の段を縦に跨がせていた。あらすじが短い項目より高いと、跨いだ段が均等に伸び、
 *     項目の間が大きく開いていた（本物の DOM: 表紙の無い行でも 208px）。表紙の無い行は表紙の列が無く、行ごとに項目の位置が変わっていた
 *     → 段を跨がせない。[表紙] | 題字（横いっぱい）／短い項目（幅から列の数を決めて左から右・上から下）／長い字（1 つずつ横いっぱい）。
 *       最後に余りを受ける段を置き、表紙の方が高くても項目の間は開かない。どの行も同じ列の線（表紙の無い行も表紙の列の幅を空ける。枠は描かない）
 *   ・表紙: 高さ 260px（220 / 300 に切り替え）。列の幅は高さ × 0.71。画像は縦横比のまま切り抜かない。³⁴ の高解像度の画像をそのまま大きく出す
 *   ・編集: 値の箱に最低の高さ（26px）を残し、空の値も押せる（198 は 0 に詰めていて、空の値と表紙の無い行の表紙のセルが押せなかった）。
 *     表紙の無い行は、表紙の列の上に小見出しと空の値の箱（押すと Notion の画像の追加）。列の名前・アイコン・並べ替え・フィルターは ³³ の帯の「列の見出し」
 *   ・項目が増えた時: 短い項目の列の数 = 使える幅 ÷ (最小 168px ＋ 間 24px)、1〜4。長い字（60 字を超える行がある・平均 28 字を超える列）は下に 1 つずつ
 *   ・契約（html）: data-c194-split = カードにしているビュー ID（⁰⁵・¹³・²¹ は補正しない。196 からの契約のまま）・data-c42-want = カードにする予定のビュー ID
 *     （³³ は表の倍率をはじめから 100% にする）・data-c42-back = 対象だが「表に戻す」にしているビュー ID・data-c42-cols = 列の見出しを出している間。
 *     data-c194-hold には自分の印「c42」を足し引きする（ほかの印は残す）。表の箱には data-c42-cards / data-c42-cols。
 *     ³³ の帯のボタンからは c42:cols・c42:back・c42:cards（detail なし。Console からは c42:cmd の detail に 'cols' などの字も可）。付け外しの後に c42:state と c194:rowlayout（src 'c42'）を出す
 *   ・設定は ScriptCat の c42.cards（³³ の c33.split196 はスクリプトが違うので読めない。対象の既定は同じ Books のビュー）。壊れていたら上書きせず、
 *     既定で動かす（__c42.store.reset() で予備の c42.cards.broken へ移してから始め直せる）
 *   ・ScriptCat のメニュー: カードで読む（入・切）・表紙の高さ・このビューを対象にする／外す。Console: __c42.status() など
 */
(function () {
  'use strict';
  const VERSION = '1.0.0';
  const TAG = '[⁴² Record Cards]';
  const root = document.documentElement;
  const pageWin = () => { try { return typeof unsafeWindow !== 'undefined' && unsafeWindow ? unsafeWindow : window; } catch (e) { return window; } };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const id32 = (s) => String(s || '').replace(/-/g, '').toLowerCase();
  const ID32 = /^[0-9a-f]{32}$/;
  const seen = new Set();
  const log = (key, msg) => { if (seen.has(key)) return; seen.add(key); console.info(TAG, msg); };

  /* ── 決まり（数値はここだけ） ── */
  const T = {
    covers: [220, 260, 300],   // 表紙の高さの上限（CSS px）。「ズームしなくても作者などの細かい文字が読める」大きさから選ぶ
    coverDef: 260,
    coverW: 0.71,              // 表紙の列の幅 ÷ 高さ（文庫 105×148mm の比。横長の絵は列の幅に収まるよう縮む）
    minCol: 168,               // 短い項目の 1 列の最小の幅
    maxCol: 4,                 // 短い項目の列の数の上限
    gap: 24,                   // 列の間
    longMax: 60, longAvg: 28,  // 長い字の列: 60 字を超える行がある・平均 28 字を超える
    sample: 40,                // 列の役目を決める時に見る行の数
    safe: 2400,                // 当ててから、行の箱が重ならなくなるのを待つ上限（ms）
    holdCap: 1200,             // data-c194-hold の印の上限（ms）
  };
  const DEF_VIEW = '3e26c0ae968e803f98a8000cd021bc6a';   // Medias の Books（³³ 196〜198 の既定と同じ）

  /* ── 設定（ScriptCat の c42.cards）。壊れていたら上書きしない ── */
  const SK = 'c42.cards';
  const DEF = () => ({ schema: 'c42.cards', v: 1, on: true, cover: T.coverDef, targets: [{ db: '', view: DEF_VIEW }], off: {} });
  const gmGet = (k) => { try { return typeof GM_getValue === 'function' ? GM_getValue(k, null) : null; } catch (e) { return null; } };
  const gmSet = (k, v) => { try { if (typeof GM_setValue !== 'function') return 'ScriptCat の保存場所が使えません'; GM_setValue(k, v); return ''; } catch (e) { return '保存できませんでした（' + (e && e.message) + '）'; } };
  function check(o) {
    if (!o || typeof o !== 'object' || o.schema !== 'c42.cards' || o.v !== 1) return 'schema・v が違います';
    if (!Array.isArray(o.targets) || o.targets.length > 200) return 'targets が配列ではありません';
    for (const t of o.targets) if (!t || !ID32.test(String(t.view || '')) || (t.db && !ID32.test(String(t.db)))) return 'targets の ID の形が違います';
    if (!o.off || typeof o.off !== 'object') return 'off がありません';
    if (typeof o.on !== 'boolean') return 'on がありません';
    return '';
  }
  const ST = { v: DEF(), broken: null };
  function load() {
    let raw = gmGet(SK);
    if (raw == null) { ST.v = DEF(); ST.broken = null; return; }
    let o = raw;
    if (typeof raw === 'string') { try { o = JSON.parse(raw); } catch (e) { o = null; } }
    const why = check(o);
    if (why) { ST.v = DEF(); ST.broken = { why, raw }; log('broken', '設定（' + SK + '）が読めないため、既定で動かします（保存されている物は上書きも削除もしていません。__c42.store.reset() で予備へ移して始め直せます）。'); return; }
    if (T.covers.indexOf(o.cover) < 0) o.cover = T.coverDef;
    ST.v = o; ST.broken = null;
  }
  function save() {
    if (ST.broken) return '設定（' + SK + '）が壊れているので書きません（' + ST.broken.why + '）。__c42.store.reset() で始め直せます';
    return gmSet(SK, JSON.stringify(ST.v));
  }
  load();

  /* ── 状態 ── */
  const S = { tv: null, db: '', vid: '', on: false, css: '', vcss: '', cols: false, bad: {}, mem: {}, info: null, L: null, W: 0, why: '', chkT: 0, at: 0, n: 0, want: '', back: '' };
  const ICONS = new Map();

  /* ── 契約（html の属性・印・合図） ── */
  function rt() { try { const r = pageWin()[Symbol.for('constellucentia.runtime')]; return r && r.contract && r.events ? r : null; } catch (e) { return null; } }
  function emit(type, detail) {
    const r = rt();
    if (r) { try { r.events.emit(type, detail); return; } catch (e) { /* 素の発火へ */ } }
    try { document.dispatchEvent(new CustomEvent(type, { detail })); } catch (e) { /* noop */ }
  }
  function attr(key, name, value) {
    const r = rt();
    if (r && key) { try { if (value == null) r.contract.remove(key, 'c42'); else r.contract.set(key, value, 'c42'); } catch (e) { /* 直接書く */ } }
    if (value == null) { if (root.hasAttribute(name)) root.removeAttribute(name); }
    else if (root.getAttribute(name) !== value) root.setAttribute(name, value);
  }
  /* data-c194-hold は ³³ と分け合う。自分の印「c42」だけを足し引きして、ほかの印は残す */
  const HOLD = { on: false, capT: 0, f: 0 };
  function holdSet(on) {
    const cur = (root.getAttribute('data-c194-hold') || '').split(/\s+/).filter(Boolean).filter((x) => x !== 'c42');
    if (on) cur.push('c42');
    attr('hold', 'data-c194-hold', cur.length ? cur.join(' ') : null);
    HOLD.on = on;
    clearTimeout(HOLD.capT); HOLD.capT = 0;
    if (on) HOLD.capT = setTimeout(() => holdSet(false), T.holdCap);
  }
  function holdPulse() {
    holdSet(true);
    cancelAnimationFrame(HOLD.f);
    HOLD.f = requestAnimationFrame(() => { HOLD.f = requestAnimationFrame(() => { HOLD.f = 0; holdSet(false); }); });
  }
  window.addEventListener('pagehide', () => { if (HOLD.on) holdSet(false); });

  /* ── 本文の表を見つける（フル DB のページの表だけ。ページの中の DB・ピークは対象外） ── */
  const frame = () => document.querySelector('.notion-frame');
  function findTable() {
    const fr = frame();
    if (!fr) return { why: 'no-frame' };
    for (const tv of fr.querySelectorAll('.notion-table-view')) {
      if (tv.closest('.notion-page-content, .notion-peek-renderer, .sticky-portal-target')) continue;
      const hr = tv.querySelector('.notion-table-view-header-row');
      if (!hr) return { why: 'no-header', tv, fr };
      const sc = tv.closest('.notion-scroller.vertical') || tv.closest('.notion-scroller') || fr.querySelector('.notion-scroller');
      return { tv, hr, fr, sc, H: hr.closest('.notion-scroller.horizontal') || sc };
    }
    return { why: 'no-table', fr };
  }
  function dbOf(tv) {
    const b = tv.querySelector('.notion-collection_view_page-block[data-block-id]');
    const d = b ? id32(b.getAttribute('data-block-id')) : '';
    if (ID32.test(d)) return d;
    const m = location.pathname.match(/([0-9a-f]{32})(?:$|[/?#])/i) || location.pathname.match(/([0-9a-f]{32})/i);
    return m ? m[1].toLowerCase() : '';
  }
  function viewOf(E) {
    const t = E.fr && E.fr.querySelector('[role="tablist"] [role="tab"][aria-selected="true"]');
    const b = t && t.closest('[data-collection-view-id]');
    const v = b ? id32(b.getAttribute('data-collection-view-id')) : '';
    if (ID32.test(v)) return v;
    return id32(new URLSearchParams(location.search).get('v') || '');
  }
  const target = (db, vid) => ST.v.targets.find((t) => t.view === vid && (!t.db || !db || t.db === db)) || null;
  /* ³³ 198 までは自分で上下分割を当てる。一緒に動くと二重に組み替えるので、³³ が 199 より古い間はカードにしない（新旧を同時に有効にしない） */
  function partner() {
    try {
      const c = pageWin().__c33, v = c && c.version;
      const m = v ? String(v).match(/^(\d+)\./) : null;
      return m && +m[1] < 199 ? '³³ ' + v + ' が動いています。198 までの上下分割と重なるので、³³ を 199 以降にしてからカードにします' : '';
    } catch (e) { return ''; }
  }
  function wantOf(db, vid) {
    const t = vid ? target(db, vid) : null;
    if (!t) return { on: false, target: false, why: vid ? '' : 'ビュー ID が分かりません' };
    if (!ST.v.on) return { on: false, target: true, why: 'カードで読むを切っています' };
    const old = partner();
    if (old) { log('partner', old + '（__c42.status()）。'); return { on: false, target: true, why: old }; }
    if (ST.v.off[vid]) return { on: false, target: true, back: true, why: 'このビューは「表に戻す」にしています' };
    if (S.bad[vid]) return { on: false, target: true, why: S.bad[vid] };
    return { on: true, target: true, why: '' };
  }
  /* ³³ が表の倍率をはじめから 100% にできるように、カードにする予定のビューを公表する */
  function publishWant() {
    const list = ST.v.on ? ST.v.targets.map((t) => t.view).filter((v) => !ST.v.off[v] && !S.bad[v]) : [];
    const v = list.length ? list.join(' ') : null;
    if (v !== (root.getAttribute('data-c42-want'))) attr('', 'data-c42-want', v);
  }

  /* ── 列の形を読む（見出しのセルの名前・アイコン、行のセルの中身から列の役目） ── */
  const CB = ':is(.notion-table-view-row, .notion-table-view-row > *):has(> .notion-table-view-cell)';
  function headIcon(h) {
    const btn = h.querySelector('[data-popup-origin] [role="button"]') || h;
    const hidden = (el) => { for (let e = el; e && e !== h; e = e.parentElement) { const o = e.style ? e.style.opacity : ''; if (o !== '' && parseFloat(o) === 0) return true; } return false; };
    for (const el of btn.querySelectorAll('svg, [style*="mask"]')) {
      if (hidden(el)) continue;
      if (el.tagName.toLowerCase() === 'svg') {
        if (/dragHandle/i.test(el.getAttribute('class') || '')) continue;
        try {
          let s = el.outerHTML;
          if (s.length > 8000) continue;
          if (!/^<svg[^>]*\sxmlns=/.test(s)) s = s.replace(/^<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
          return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
        } catch (e) { continue; }
      }
      const u = getComputedStyle(el).webkitMaskImage || getComputedStyle(el).maskImage || '';
      if (/^url\(/.test(u)) return u;
    }
    return '';
  }
  function headName(h) {
    const btn = h.querySelector('[data-popup-origin] [role="button"]') || h.querySelector('[role="button"]') || h;
    return norm(btn.textContent).slice(0, 80);
  }
  const cbOf = (r) => (r.querySelector(':scope > .notion-table-view-cell') ? r : [...r.children].find((k) => k.querySelector(':scope > .notion-table-view-cell')) || null);
  const cellsOf = (r) => { const b = cbOf(r); return b ? [...b.children].filter((k) => k.classList.contains('notion-table-view-cell')) : []; };
  function readCols(E) {
    const hcs = [...E.hr.querySelectorAll('.notion-table-view-header-cell')].filter((h) => h.closest('.notion-table-view-header-row') === E.hr);
    if (!hcs.length) return { ok: false, why: '列の見出しのセルが見つかりません。標準の表のままです' };
    const all = [...E.tv.querySelectorAll('.notion-table-view-row')].filter((r) => !r.closest('.notion-table-view-header-row'));
    const rows = [];
    let skip = 0;
    for (const r of all) {
      if (rows.length >= T.sample) break;
      const cs = cellsOf(r);
      if (!cs.length || cs.length !== hcs.length || cs.length !== r.querySelectorAll('.notion-table-view-cell').length) { skip++; continue; }
      rows.push(cs);
    }
    if (!rows.length && skip) return { ok: false, why: '行のセルの形が列の見出し（' + hcs.length + ' 列）と合いません。標準の表のままです' };
    const cols = hcs.map((h) => ({ name: headName(h), ic: headIcon(h) }));
    const N = hcs.length;
    const img = new Array(N).fill(0), ico = new Array(N).fill(0), pri = new Array(N).fill(0), seenN = new Array(N).fill(0), sum = new Array(N).fill(0), max = new Array(N).fill(0);
    for (const cs of rows) cs.forEach((k, i) => {
      if (k.hasAttribute('data-c12-primary') || k.querySelector('[data-c12-primary]')) pri[i]++;
      if (k.querySelector('[data-c34]') || [...k.querySelectorAll('img')].some((m) => !m.closest('.notion-record-icon'))) img[i]++;
      if (k.querySelector('.notion-record-icon[role="button"]')) ico[i]++;
      const t = norm(k.textContent || '').length;
      if (t) { seenN[i]++; sum[i] += t; if (t > max[i]) max[i] = t; }
    });
    let cover = -1, hb = 0;
    img.forEach((v, i) => { if (v > hb) { hb = v; cover = i; } });
    let title = -1, tb = 0;
    pri.forEach((v, i) => { if (i !== cover && v > tb && v >= rows.length * 0.5) { tb = v; title = i; } });
    if (title < 0) ico.forEach((v, i) => { if (i !== cover && v > tb && v >= rows.length * 0.5) { tb = v; title = i; } });
    let long = [];
    for (let i = 0; i < N; i++) if (i !== cover && i !== title && (max[i] > T.longMax || (seenN[i] && sum[i] / seenN[i] > T.longAvg))) long.push(i);
    /* 仮想化で、表紙のある行や長い字の行が今は描かれていないだけのことがある。同じ列の並びなら、一度分かった役目はそのまま */
    const sig = cols.map((c) => c.name).join('\u0001');
    const m = S.mem[S.vid];
    if (m && m.sig === sig) {
      if (cover < 0 && m.cover >= 0) cover = m.cover;
      if (title < 0 && m.title >= 0 && m.title !== cover) title = m.title;
      for (const i of m.long) if (long.indexOf(i) < 0 && i !== cover && i !== title) long.push(i);
    }
    long = long.filter((i) => i !== cover && i !== title).sort((a, b) => a - b);
    if (S.vid) S.mem[S.vid] = { sig, cover, title, long: long.slice() };
    const shorts = [];
    for (let i = 0; i < N; i++) if (i !== cover && i !== title && long.indexOf(i) < 0) shorts.push(i);
    return { ok: true, cols, cover, title, long, shorts, rows: rows.length, skip };
  }

  /* ── 組み方の計画: 列の数と、列ごとの置き場所（段を跨がせない） ── */
  function plan(info, W) {
    const cv = info.cover >= 0;
    const cw = Math.round(ST.v.cover * T.coverW);
    const A = Math.max(0, W - (cv ? cw + T.gap : 0));
    let K = Math.floor((A + T.gap) / (T.minCol + T.gap));
    K = Math.max(1, Math.min(T.maxCol, K, Math.max(1, info.shorts.length)));
    const c0 = cv ? 2 : 1;                       // 項目の最初の列の線
    const pos = {};
    let r = 1;
    if (info.title >= 0) { pos[info.title] = [c0 + ' / -1', String(r)]; r++; }
    info.shorts.forEach((k, i) => { pos[k] = [(c0 + (i % K)) + ' / span 1', String(r + Math.floor(i / K))]; });
    r += Math.ceil(info.shorts.length / K);
    info.long.forEach((k) => { pos[k] = [c0 + ' / -1', String(r)]; r++; });
    const rows = Math.max(1, r - 1);
    const cols = (cv ? 'var(--c42-cw) ' : '') + 'repeat(' + K + ', minmax(0, 1fr))';
    return { K, cw, cv, c0, pos, rows, cols };
  }

  /* ── CSS ── */
  const S42 = 'html' + ':not(#c42a):not(#c42b):not(#c42c):not(#c42d):not(#c42e):not(#c42f):not(#c42g):not(#c42h):not(#c42i):not(#c42j)';
  const TV = S42 + ' .notion-frame .notion-table-view[data-c42-cards]';
  const SERIF = 'var(--c164-serif, "EB Garamond", "Cormorant Garamond", Georgia, "Times New Roman", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif)';
  const INK2 = 'var(--c194-ink2, var(--c-texSec, rgba(55, 53, 47, .65)))';
  const LINE = 'var(--c194-line, var(--ca-borSecTra, rgba(55, 53, 47, .13)))';
  const cssStr = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\A ') + '"';
  const BASE = `
/* ⁴² Record Cards: カードの間だけ（表の箱の data-c42-cards）。列の見出しは隠す（「列の見出し」で出す）。行と行の間は 1 本の横線 */
${TV}:not([data-c42-cols]) .notion-table-view-header-row { display: none !important; }
${S42}[data-c194-split]:not([data-c42-cols]) .notion-frame .sticky-portal-target .notion-table-view-header-row { display: none !important; }
${TV} .notion-table-view-row { height: auto !important; min-height: 0 !important; max-height: none !important; width: var(--c42-w, auto) !important; max-width: none !important;
  flex: 0 0 var(--c42-w, auto) !important; box-sizing: border-box !important; padding: 22px 0 20px !important; border-bottom: 1px solid ${LINE} !important; background-image: none !important; }
/* 本物の行は直書きの flex: 0 0 fit-content（幅は flex-basis が決める）。行の兄弟の空の箱 2 つ（Notion の行の下線）は幅 0（中身は空・消さない） */
${TV} .notion-collection-item > .notion-table-view-row ~ * { flex: 0 0 0px !important; width: 0 !important; min-width: 0 !important; overflow: hidden !important; border: 0 !important; }
${TV} .notion-table-view-row:not(:has(> .notion-table-view-cell)) > :not(:has(> .notion-table-view-cell)) { flex: 0 0 0px !important; width: 0 !important; min-width: 0 !important; overflow: hidden !important; }
/* セルの箱（行そのもの、または行の直下でセルを持つ箱）を格子に。チェックボックスの箱は 1 段目に幅 0 で（位置は Notion のまま） */
${TV} ${CB} { display: grid !important; grid-template-columns: minmax(0, 1fr) !important; grid-auto-flow: row !important; align-items: start !important; column-gap: ${T.gap}px !important; row-gap: 0 !important;
  flex: 1 1 auto !important; min-width: 0 !important; height: auto !important; min-height: 0 !important; max-height: none !important; }
${TV} ${CB} > :not(.notion-table-view-cell) { grid-column: 1 / -1 !important; grid-row: 1 !important; width: 0 !important; min-width: 0 !important; height: 0 !important; align-self: start !important; }
${TV} ${CB} > .notion-table-view-cell { display: block !important; position: relative !important; grid-column: -2 / -1 !important; flex: none !important; width: auto !important; min-width: 0 !important;
  height: auto !important; min-height: 0 !important; max-height: none !important; padding: 0 !important; margin: 0 0 14px !important; border: 0 !important; overflow: hidden !important; white-space: normal !important; }
/* セルの最初の子は Notion の列の幅の箱（直書きの width）。カードの間は段の幅に合わせる */
${TV} ${CB} > .notion-table-view-cell > div { width: auto !important; min-width: 0 !important; max-width: 100% !important; height: auto !important; }
/* 値の箱: 空でも押せるように最低の高さを残す（押すと Notion の編集）。字は小見出しの線にそろえる */
${TV} ${CB} > .notion-table-view-cell [data-testid="property-value"] { min-height: 26px !important; height: auto !important; padding: 2px 0 !important; box-sizing: border-box !important; }
${TV} ${CB} > .notion-table-view-cell * { max-height: none !important; -webkit-line-clamp: unset !important; line-clamp: none !important; white-space: normal !important; text-overflow: clip !important; }
/* 小見出し（実際のプロパティの名前とアイコン。大文字は表示だけ） */
${TV} ${CB} > .notion-table-view-cell::before { content: ""; display: block; margin: 0 0 3px; padding-inline-start: 18px; box-sizing: border-box;
  font: 600 10.5px/14px ${SERIF}; letter-spacing: .09em; text-transform: uppercase; color: ${INK2}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
${TV} ${CB} > .notion-table-view-cell::after { content: ""; position: absolute; left: 0; top: .5px; width: 13px; height: 13px; background-color: ${INK2};
  -webkit-mask: none center / contain no-repeat; mask: none center / contain no-repeat; pointer-events: none; }
`;
  function rules(info, L) {
    const Q = (k) => TV + ' ' + CB + ' > .notion-table-view-cell:nth-child(' + (k + 1) + ' of .notion-table-view-cell)';
    const out = [];
    out.push(TV + ' { --c42-w: ' + S.W + 'px; --c42-cover: ' + ST.v.cover + 'px; --c42-cw: ' + L.cw + 'px; }');
    out.push(TV + ' ' + CB + ' { grid-template-columns: ' + L.cols + ' !important; grid-template-rows: repeat(' + L.rows + ', auto) minmax(0, 1fr) !important; }');
    info.cols.forEach((c, k) => {
      out.push(Q(k) + '::before { content: ' + cssStr(c.name) + '; }');
      out.push(c.ic ? Q(k) + '::after { -webkit-mask-image: ' + c.ic + '; mask-image: ' + c.ic + '; }' : Q(k) + '::after { content: none; } ' + Q(k) + '::before { padding-inline-start: 0; }');
    });
    for (const k of Object.keys(L.pos)) out.push(Q(+k) + ' { grid-column: ' + L.pos[k][0] + ' !important; grid-row: ' + L.pos[k][1] + ' !important; }');
    if (info.title >= 0) {
      const Tt = Q(info.title);
      out.push(Tt + ' [data-testid="property-value"] { font-size: 18px !important; line-height: 1.4 !important; }');
      out.push(Tt + ' [data-testid="property-value"] span { font-weight: 600 !important; line-height: inherit !important; }');
      /* 題字のアイコンと字を同じ高さに（Notion の箱は上ぞろえ。字の行の高さが変わると字だけ下がっていた） */
      out.push(Tt + ' [data-testid="property-value"] > div:not([style*="absolute"]) { align-items: center !important; }');
    }
    if (info.cover >= 0) {
      const C = Q(info.cover);
      out.push(C + ' { grid-column: 1 / 2 !important; grid-row: 1 / -1 !important; justify-self: stretch !important; align-self: start !important; margin: 0 !important; }');
      out.push(C + ':has(img)::before, ' + C + '::after { content: none !important; }');
      out.push(C + ':not(:has(img))::before { padding-inline-start: 0 !important; }');
      /* 中の箱の幅は Notion のまま（width: 100% の包み）。auto にすると flex の中で空の時に幅 0 になり、表紙の無い行で押せなかった */
      out.push(C + ' :is(div, a, span) { min-width: 0 !important; max-width: 100% !important; height: auto !important; min-height: 0 !important; }');
      out.push(C + ' [data-testid="property-value"] { padding: 0 !important; display: block !important; width: 100% !important; }');
      out.push(C + ':not(:has(img)) [data-testid="property-value"] { min-height: 26px !important; }');
      out.push(C + ' div:has(> img) { display: flex !important; flex-direction: column !important; gap: 8px !important; }');
      out.push(C + ' img { display: block !important; width: auto !important; height: var(--c42-cover) !important; max-width: 100% !important; max-height: none !important; object-fit: contain !important; object-position: left top !important; aspect-ratio: auto var(--c34-ar, ' + T.coverW + ') !important; border-radius: 3px !important; box-shadow: 0 0 0 1px ' + LINE + ' !important; }');
    }
    return out.join('\n');
  }
  function css(id, text) {
    let st = document.getElementById(id);
    if (!text) { if (st) st.textContent = ''; return; }
    if (!st) { st = document.createElement('style'); st.id = id; (document.head || root).appendChild(st); }
    if (st.textContent !== text) st.textContent = text;
  }

  /* ── 幅: 行の左から、見えている本文の右まで（横に流さずに読める）。表の倍率の中では CSS px に直す ── */
  function widthOf(E) {
    const tv = E.tv;
    const r0 = tv.querySelector('.notion-table-view-row:not(.notion-table-view-header-row)');
    const pis = parseFloat(getComputedStyle(tv).paddingInlineStart) || 0, pie = parseFloat(getComputedStyle(tv).paddingInlineEnd) || 0;
    const x0 = r0 ? r0.getBoundingClientRect().left : tv.getBoundingClientRect().left + pis;
    const right = Math.min((E.H || E.sc).getBoundingClientRect().right, E.sc.getBoundingClientRect().right) - pie;
    const zf = tv.offsetWidth ? tv.getBoundingClientRect().width / tv.offsetWidth : 1;
    return Math.max(360, Math.round((right - x0) / (zf || 1)));
  }

  /* ── 当てる・外す ── */
  function off(why) {
    const was = S.on;
    for (const el of document.querySelectorAll('[data-c42-cards]')) { el.removeAttribute('data-c42-cards'); el.removeAttribute('data-c42-cols'); }
    if (root.hasAttribute('data-c194-split')) { holdPulse(); attr('split', 'data-c194-split', null); }
    if (root.hasAttribute('data-c42-cols')) attr('', 'data-c42-cols', null);
    css('c42-view', '');
    clearTimeout(S.chkT); S.chkT = 0;
    S.on = false; S.tv = null; S.css = ''; S.why = why || '';
    if (was) { emit('c42:state', { on: false, view: S.vid, why: S.why }); emit('c194:rowlayout', { src: 'c42', why: 'off' }); }
  }
  function backFlag(vid) { if ((root.getAttribute('data-c42-back') || null) !== (vid || null)) attr('', 'data-c42-back', vid || null); }
  function sync() {
    S.n++;
    publishWant();
    const E = findTable();
    if (!E.tv) { backFlag(null); if (S.on) off(E.why); else S.why = E.why; return; }
    const db = dbOf(E.tv), vid = viewOf(E);
    if (vid !== S.vid) { S.cols = false; }
    S.db = db; S.vid = vid;
    const w = wantOf(db, vid);
    backFlag(w.back ? vid : null);
    if (!w.on) { if (S.on || E.tv.hasAttribute('data-c42-cards')) off(w.why); else S.why = w.why; return; }
    const info = readCols(E);
    if (!info.ok) { off(info.why); return; }
    S.W = widthOf(E);
    const L = plan(info, S.W);
    const text = rules(info, L);
    const fresh = !S.on || S.tv !== E.tv || !E.tv.hasAttribute('data-c42-cards') || root.getAttribute('data-c194-split') !== vid;
    if (fresh || text !== S.css) {
      holdPulse();
      attr('split', 'data-c194-split', vid);   // 先に公表してから組み替える（⁰⁵ は自分の補正を外す）
      css('c42-view', text);
      S.css = text;
    }
    if (!E.tv.hasAttribute('data-c42-cards')) E.tv.setAttribute('data-c42-cards', '');
    if (E.tv.hasAttribute('data-c42-cols') !== S.cols) { holdPulse(); E.tv.toggleAttribute('data-c42-cols', S.cols); attr('', 'data-c42-cols', S.cols ? vid : null); }
    S.tv = E.tv; S.info = info; S.L = L; S.why = '';
    if (S.ro && S.sc !== E.sc) { try { if (S.sc) S.ro.unobserve(S.sc); S.ro.observe(E.sc); } catch (e) { /* noop */ } S.sc = E.sc; }
    if (fresh) {
      S.on = true; S.at = performance.now();
      emit('c42:state', { on: true, view: vid, cols: S.cols });
      emit('c194:rowlayout', { src: 'c42', why: 'cards' });
      overlap();
    }
  }
  /* 当てた後、行の箱が重なっていないか（Notion が行の高さを測り直して並べ直すか）を確かめる。重なったままなら標準の表へ戻して理由を残す */
  function overlap() {
    clearTimeout(S.chkT);
    const vid = S.vid, t0 = performance.now();
    const step = () => {
      S.chkT = 0;
      if (S.vid !== vid || !S.tv || !S.tv.isConnected || !S.tv.hasAttribute('data-c42-cards')) return;
      const its = [...S.tv.querySelectorAll('.notion-collection-item')].slice(0, 14);
      let bad = 0;
      for (let i = 0; i + 1 < its.length; i++) {
        const a = its[i].getBoundingClientRect(), b = its[i + 1].getBoundingClientRect();
        if (a.height > 0 && b.height > 0 && b.top >= a.top - 1 && a.bottom > b.top + 4.5) bad++;   // 本物の行の項目の箱は枠より 2px 高い（calc(100% + 2px)）
      }
      if (!bad) return;
      if (performance.now() - t0 > T.safe) {
        S.bad[vid] = '行の箱が重なりました（Notion が行の位置を測り直さない形）。標準の表に戻しました';
        log('overlap:' + vid, 'カード: 行の箱が重なったため、このビューは標準の表に戻しました（__c42.status() に理由）。');
        sync();
        return;
      }
      S.chkT = setTimeout(step, 300);
    };
    S.chkT = setTimeout(step, 300);
  }

  /* ── 見張り: 表の箱が入った・タブが替わった時は、見張りの同じ流れで（描かれる前に）当てる。ほかは 1 フレームにまとめる ── */
  let raf = 0;
  const soon = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; try { sync(); } catch (e) { log('sync:' + (e && e.message), 'カードの見直しで止まりました（' + (e && e.message) + '）。'); } }); };
  /* 行の箱が足された時（仮想化・スクロール）は、CSS がそのまま当たるので見直しは要らない。列の役目がまだ分かっていない時（表紙・題字・行が足りない）は
   *  次のフレームで、分かっている時は少し後に 1 回だけ（長い字の行が後から見えた時のため）。毎フレーム列を読み直さない */
  const hasTable = (n) => n.nodeType === 1 && (n.matches('.notion-table-view, [role="tablist"]') || !!n.querySelector('.notion-table-view, [role="tablist"]'));
  const hasItem = (n) => n.nodeType === 1 && (n.matches('.notion-collection-item') || !!n.querySelector('.notion-collection-item'));
  let lazyT = 0;
  const lazy = () => { clearTimeout(lazyT); lazyT = setTimeout(() => { lazyT = 0; soon(); }, 600); };
  const mo = new MutationObserver((recs) => {
    let now = false, later = false, item = false;
    for (const r of recs) {
      if (r.type === 'attributes') { if (r.target.closest && r.target.closest('.notion-frame')) now = true; continue; }
      for (const n of r.addedNodes) { if (hasTable(n)) { now = true; break; } if (!item && hasItem(n)) item = true; }
      if (!now && r.removedNodes.length) later = true;
      if (now) break;
    }
    if (now) { try { sync(); } catch (e) { soon(); } return; }
    if (later) soon();
    if (item) { const i = S.info; if (!S.on || !i || i.rows < T.sample && (i.cover < 0 || i.title < 0 || !i.rows)) soon(); else lazy(); }
  });
  function watch() {
    if (!document.body) { setTimeout(watch, 200); return; }
    css('c42-css', BASE);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
    let lastW = 0;
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { const w = window.innerWidth; if (w !== lastW) { lastW = w; soon(); } }) : null;
    if (ro) ro.observe(root); else window.addEventListener('resize', soon);
    /* 本文の枠の幅が変わった時（³³ の Catalogus の開け閉め・Notion のサイドバー）も、カードの幅を測り直す */
    if (typeof ResizeObserver === 'function') {
      let scW = -1;
      S.ro = new ResizeObserver((es) => { const w = Math.round(es[0].contentRect.width); if (w !== scW) { scW = w; if (S.on) soon(); } });
    }
    document.addEventListener('c194:hold', () => { if (S.on) soon(); });
    let href = location.href;
    setInterval(() => { if (location.href !== href) { href = location.href; soon(); } }, 400);
    sync();
  }

  /* ── 操作（³³ の帯のボタン・ScriptCat のメニュー・Console） ── */
  function setCols(on) { S.cols = on == null ? !S.cols : !!on; sync(); return S.cols; }
  function back(b) {
    if (!S.vid || !target(S.db, S.vid)) return 'このビューはカードの対象ではありません';
    if (b) ST.v.off[S.vid] = true; else { delete ST.v.off[S.vid]; delete S.bad[S.vid]; }
    S.cols = false;
    const err = save(); sync();
    return err || true;
  }
  function add(db, view) {
    const v = id32(view == null ? S.vid : view), d = id32(db == null ? (view == null ? S.db : '') : db);
    if (!ID32.test(v) || (d && !ID32.test(d))) return 'ID の形（32 桁の 0-9a-f）が違います';
    if (ST.broken) return save();
    const t = ST.v.targets.find((x) => x.view === v);
    if (t) t.db = d; else ST.v.targets.push({ db: d, view: v });
    const err = save(); sync();
    return err || true;
  }
  function remove(view) {
    const v = id32(view == null ? S.vid : view);
    if (ST.broken) return save();
    const n = ST.v.targets.length;
    ST.v.targets = ST.v.targets.filter((x) => x.view !== v);
    delete ST.v.off[v];
    if (ST.v.targets.length === n) return 'そのビューは対象にありません';
    const err = save(); sync();
    return err || true;
  }
  function setOn(b) { if (ST.broken) return save(); ST.v.on = !!b; const err = save(); sync(); return err || ST.v.on; }
  function setCover(px) {
    const n = Number(px);
    if (T.covers.indexOf(n) < 0) return '表紙の高さは ' + T.covers.join(' / ') + ' のどれかです';
    if (ST.broken) return save();
    ST.v.cover = n; const err = save(); sync();
    return err || n;
  }
  function status() {
    const info = S.info;
    return {
      version: VERSION, on: ST.v.on, cover: ST.v.cover, covers: T.covers.slice(), store: SK, broken: ST.broken ? ST.broken.why : null,
      targets: ST.v.targets.map((t) => Object.assign({}, t)), off: Object.keys(ST.v.off), bad: Object.assign({}, S.bad),
      here: { db: S.db || null, view: S.vid || null, target: !!(S.vid && target(S.db, S.vid)), active: S.on, cols: S.cols, why: S.why,
        width: S.W, columns: S.L ? S.L.K : null, coverWidth: S.L ? S.L.cw : null,
        names: info ? info.cols.map((c) => c.name) : [], coverColumn: info ? info.cover : -1, titleColumn: info ? info.title : -1, longColumns: info ? info.long.slice() : [], rowsChecked: info ? info.rows : 0, rowsSkipped: info ? info.skip : 0 },
      contract: { split: root.getAttribute('data-c194-split'), want: root.getAttribute('data-c42-want'), back: root.getAttribute('data-c42-back'), hold: root.getAttribute('data-c194-hold') },
      syncs: S.n,
    };
  }
  function reset() {
    const raw = gmGet(SK);
    if (raw != null) { const e = gmSet(SK + '.broken', typeof raw === 'string' ? raw : JSON.stringify(raw)); if (e) return e; }
    ST.v = DEF(); ST.broken = null;
    const err = save(); sync();
    return err || true;
  }
  /* ³³ の帯のボタンからは c42:cols・c42:back・c42:cards（detail なし。スクリプトの箱が違うと detail の中身が届かないことがあるため、名前で分ける） */
  const cmd = (c) => { if (c === 'cols') setCols(); else if (c === 'back') back(true); else if (c === 'cards') back(false); };
  for (const c of ['cols', 'back', 'cards']) document.addEventListener('c42:' + c, () => cmd(c));
  document.addEventListener('c42:cmd', (e) => { let c = ''; try { c = typeof e.detail === 'string' ? e.detail : (e.detail && e.detail.cmd) || ''; } catch (er) { c = ''; } cmd(c); });
  const api = { version: VERSION, status, on: setOn, cover: setCover, cols: setCols, back, add, remove, sync: () => { sync(); return status(); }, store: { reset, raw: () => gmGet(SK) } };
  try { pageWin().__c42 = api; } catch (e) { /* noop */ }
  try { window.__c42 = api; } catch (e) { /* noop */ }
  if (typeof GM_registerMenuCommand === 'function') {
    try {
      GM_registerMenuCommand('⁴² カードで読む: 入・切', () => setOn(!ST.v.on));
      GM_registerMenuCommand('⁴² 表紙の高さを切り替える（' + T.covers.join(' / ') + 'px）', () => { const i = T.covers.indexOf(ST.v.cover); setCover(T.covers[(i + 1) % T.covers.length]); });
      GM_registerMenuCommand('⁴² このビューをカードの対象にする・外す', () => { if (S.vid && target(S.db, S.vid)) remove(); else add(); });
    } catch (e) { /* noop */ }
  }
  watch();
})();
