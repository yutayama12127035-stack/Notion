// ==UserScript==
// @name         « No »　³³ _ Sidebar Constellation
// @namespace    https://cordivestium.local/sidebar-constellation
// @version      1.0.0
// @description  サイドバーの大幅な見直し。階層を ★グループ ／ ■ワークスペース ／ ●フルDB（ワークスペースと同じ段）／ ▲各種ビュー（DB の下）に組み直し、ビューの「•」をビューの種類のアイコン（表・ボード・ギャラリー・リスト・カレンダー・タイムライン・グラフ・フィード・地図・フォーム・Atlas）に。ワークスペースは小さな見出し、DB とページは明朝の行、ビューは細い導線つきの小さな行、選択中は左に色の印。¹⁶ Sidebar Workspace Grouper（v15.6.0 以降）と一緒に使う。Notion の要素は動かさず、印と CSS だけで描く。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://app.notion.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*
 * v1.0.0（2026-10-03）
 *   ・階層
 *       旧: ★グループ ＞ ■ワークスペース ＞ ●フルDB（一段下）＞ •ビュー
 *       新: ★グループ ＞ ■ワークスペース（小さな見出し）
 *                       ●フルDB／ページ（ワークスペースと同じ左端）
 *                         ▲ビュー（DB の下に一段・種類のアイコン・細い導線）
 *       それより深いページは、元の入れ子の差をそのまま（少しだけ詰めて）残す。
 *       __c33.set({ flat: false }) で元の段（DB を一段下げる）に戻せる。
 *   ・ビューの種類: DB のページの view_ids を Notion の API で読み、並び順でビューの行と対応させる（読めない時は名前から推定）。
 *       ³¹ Atlas Views で作った「Atlas」は専用のアイコン。
 *   ・デザイン: ★グループ見出しは明朝・件数は小さな丸、グループの間に細い線。■ワークスペースは字間を空けた小さな見出し。
 *       ●行は明朝 13px・高さ 28px・角丸、選択中は左に 2px の色の印（グループの色）。▲ビューは 12px・導線つき。
 *       値は CSS 変数（--c33-*）。²⁶ Atelier の「サイドバー」から書体・大きさを変えられる。
 *   ・Notion の要素は動かさない（属性 data-c33-* と CSS 変数だけ）。¹⁶ の並べ替え・ドラッグはそのまま。
 *   ・コンソール: __c33.status() ／ __c33.set({ flat, scale }) ／ __c33.off()
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '1.0.0';
  const TAG = '[³³ v' + VERSION + ']';
  if (window.__c33 && window.__c33.version) { console.warn(TAG, '旧版が動いています'); return; }

  const LS = 'c33.prefs.v1';
  const LS_DB = 'c33.db.v1';     // DB だと分かった行の名前（閉じていても DB の印を付ける）
  const P = { flat: true, scale: 0.8, viewIndent: 18, on: true };
  try { Object.assign(P, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) { /* noop */ }
  const saveP = () => { try { localStorage.setItem(LS, JSON.stringify(P)); } catch (e) { /* noop */ } };
  let KNOWN_DB = {};
  try { KNOWN_DB = JSON.parse(localStorage.getItem(LS_DB) || '{}') || {}; } catch (e) { KNOWN_DB = {}; }
  const saveDb = () => { try { localStorage.setItem(LS_DB, JSON.stringify(KNOWN_DB)); } catch (e) { /* noop */ } };
  const ST = { scans: 0, rows: 0, views: 0, dbs: 0, lastError: '' };

  const SEL_TEAM = '.notion-outliner-team-container';
  const SEL_TEAM_BTN = '.notion-outliner-team[role="button"]';
  const SEL_PAGE = '[data-inp-target="sidebar-page-item"]';
  const PAD_RE = /padding-inline(?:-start)?:\s*([\d.]+)px|padding-left:\s*([\d.]+)px/;
  const UUID_RE = /[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i;
  const setAttr = (el, k, v) => { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); };
  const setVar = (el, k, v) => { if (el && el.style.getPropertyValue(k) !== v) el.style.setProperty(k, v); };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  /* ============================================================
   *  ビューの種類のアイコン（20×20・線 1.4）
   * ============================================================ */
  const svg = (d) => 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>') + '")';
  const VICON = {
    table: svg('<rect x="3" y="4" width="14" height="12" rx="2"/><path d="M3 8h14M3 12h14M8 8v8"/>'),
    board: svg('<rect x="3" y="4" width="4" height="12" rx="1.3"/><rect x="8.5" y="4" width="4" height="8" rx="1.3"/><rect x="14" y="4" width="3.2" height="10" rx="1.2"/>'),
    gallery: svg('<rect x="3" y="3.5" width="6" height="6" rx="1.5"/><rect x="11" y="3.5" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>'),
    list: svg('<path d="M7.5 5.5h9M7.5 10h9M7.5 14.5h9"/><circle cx="4" cy="5.5" r=".6" fill="black"/><circle cx="4" cy="10" r=".6" fill="black"/><circle cx="4" cy="14.5" r=".6" fill="black"/>'),
    calendar: svg('<rect x="3" y="4.5" width="14" height="12" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/><path d="M7 12h.01M10 12h.01M13 12h.01M7 14.5h.01M10 14.5h.01"/>'),
    timeline: svg('<path d="M3 5.5h7M6 10h9M4.5 14.5h6"/><path d="M3 2.8v14.4" stroke-opacity=".45"/>'),
    chart: svg('<path d="M10 3.2a6.8 6.8 0 1 0 6.8 6.8H10z"/><path d="M12.4 2.6a6.6 6.6 0 0 1 5 5h-5z"/>'),
    feed: svg('<rect x="4" y="3" width="12" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h3.5"/>'),
    map: svg('<path d="M3 5.5l4.5-2 5 2 4.5-2v11l-4.5 2-5-2-4.5 2z"/><path d="M7.5 3.5v11M12.5 5.5v11"/>'),
    form: svg('<rect x="4" y="3" width="12" height="14" rx="2"/><path d="M7 7h6M7 10.5h6"/><path d="M7 14h2.5"/>'),
    dashboard: svg('<rect x="3" y="3.5" width="6" height="7" rx="1.4"/><rect x="11" y="3.5" width="6" height="4" rx="1.4"/><rect x="11" y="9.5" width="6" height="7" rx="1.4"/><rect x="3" y="12.5" width="6" height="4" rx="1.4"/>'),
    atlas: svg('<path d="M4 16.5V5M6.6 16.5V7M9.2 16.5V4.2M11.6 16.5l2.4-10.5 2.4.6-2.4 10.4"/><path d="M3 16.8h14"/>'),
    view: svg('<path d="M10 3.2l6.8 3.6L10 10.4 3.2 6.8z"/><path d="M3.2 10.2L10 13.8l6.8-3.6"/><path d="M3.2 13.6L10 17.2l6.8-3.6"/>')
  };
  const NAME_HINT = [
    [/atlas|書架|年表|集計/i, 'atlas'], [/table|表|テーブル|一覧表/i, 'table'], [/board|ボード|かんばん|カンバン/i, 'board'], [/gallery|ギャラリー|カード/i, 'gallery'],
    [/list|リスト/i, 'list'], [/calendar|カレンダー|暦/i, 'calendar'], [/timeline|タイムライン|ガント/i, 'timeline'], [/chart|graph|グラフ|チャート/i, 'chart'],
    [/feed|フィード/i, 'feed'], [/map|地図|マップ/i, 'map'], [/form|フォーム/i, 'form'], [/dashboard|ダッシュボード/i, 'dashboard']
  ];
  const typeFromName = (n) => { for (const [re, t] of NAME_HINT) if (re.test(n)) return t; return 'view'; };

  /* ============================================================
   *  API（DB のビューの種類）
   * ============================================================ */
  function activeUser() { const m = /(?:^|;\s*)notion_user_id=([^;]+)/.exec(document.cookie || ''); return m ? decodeURIComponent(m[1]) : ''; }
  async function getRecords(table, ids) {
    const headers = { 'Content-Type': 'application/json' };
    const u = activeUser(); if (u) headers['x-notion-active-user-header'] = u;
    const r = await fetch(location.origin + '/api/v3/syncRecordValues', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify({ requests: ids.map((id) => ({ table, id, version: -1 })) }) });
    const j = r.ok ? await r.json() : {};
    const map = new Map(), rm = (j.recordMap && j.recordMap[table]) || {};
    for (const id of ids) { const n = rm[id]; const v = n ? (n.value && n.value.value ? n.value.value : n.value) : null; if (v) map.set(id, v); }
    return map;
  }
  const VIEWTYPES = new Map();   // dbId → [type…]（view_ids の順）
  const pending = new Set();
  async function viewTypesOf(dbId) {
    if (VIEWTYPES.has(dbId) || pending.has(dbId)) return VIEWTYPES.get(dbId) || null;
    pending.add(dbId);
    try {
      const b = (await getRecords('block', [dbId])).get(dbId);
      const ids = (b && b.view_ids) || [];
      if (!ids.length) { VIEWTYPES.set(dbId, []); return []; }
      const vs = await getRecords('collection_view', ids);
      let atlas = {};
      try { atlas = JSON.parse(localStorage.getItem('c31.views.v1') || '{}') || {}; } catch (e) { /* noop */ }
      VIEWTYPES.set(dbId, ids.map((id) => { const v = vs.get(id); if (atlas[id] && atlas[id].on) return 'atlas'; return v ? (v.type || 'view') : 'view'; }));
      schedule(0);
      return VIEWTYPES.get(dbId);
    } catch (e) { ST.lastError = String(e && e.message || e); VIEWTYPES.set(dbId, []); return null; }
    finally { pending.delete(dbId); }
  }
  const TYPE_ALIAS = { table: 'table', board: 'board', gallery: 'gallery', list: 'list', calendar: 'calendar', timeline: 'timeline', chart: 'chart', feed: 'feed', map: 'map', form: 'form', form_editor: 'form', dashboard: 'dashboard', reducer: 'chart', atlas: 'atlas' };

  /* ============================================================
   *  行の見分け
   * ============================================================ */
  function padOf(row) {
    const m = PAD_RE.exec(row.getAttribute('style') || '');
    if (m) return parseFloat(m[1] || m[2]);
    const pb = row.getAttribute('data-c16-pb');
    if (pb) return parseFloat(pb);
    return parseFloat(getComputedStyle(row).paddingInlineStart) || 0;
  }
  /* ビューの行: 左の小さな枠の中が「•」だけ */
  function bulletSlot(row) {
    const slot = row.firstElementChild;
    if (!slot) return null;
    const t = norm(slot.textContent);
    return t === '•' || t === '·' ? slot : null;
  }
  function rowsOf(team) {
    const out = [], seen = new Set();
    for (const el of team.querySelectorAll(SEL_PAGE + ', div[dir="ltr"][style*="padding-inline"]')) {
      if (seen.has(el)) continue;
      if (el.closest(SEL_TEAM_BTN)) continue;
      /* 入れ子になった同じ行の内側は飛ばす */
      const up = el.parentElement && el.parentElement.closest(SEL_PAGE);
      if (up && team.contains(up) && !el.matches(SEL_PAGE)) continue;
      const h = parseFloat(el.style.height || el.style.minHeight || '0');
      if (!el.matches(SEL_PAGE) && !(h >= 20 && h <= 40)) continue;
      seen.add(el);
      out.push(el);
    }
    return out;
  }
  function idOf(row) {
    const tree = row.closest('[role="treeitem"]') || row;
    const els = [row, tree, ...row.querySelectorAll('a[href], [data-block-id]')];
    for (const el of els) {
      for (const a of el.attributes || []) {
        if (a.name === 'style' || a.name === 'class') continue;
        if (!/(href|block|id|page)/i.test(a.name)) continue;
        const m = UUID_RE.exec(a.value);
        if (m) { const h = m[0].replace(/-/g, '').toLowerCase(); return h.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'); }
      }
    }
    return '';
  }
  const nameOf = (row) => norm((row.querySelector('.notranslate') || row).textContent).slice(0, 120);

  /* ============================================================
   *  印を付ける
   * ============================================================ */
  function scanTeam(team) {
    const btn = team.querySelector(SEL_TEAM_BTN);
    if (!btn) return;
    setAttr(team, 'data-c33-team', '1');
    const teamPad = parseFloat(getComputedStyle(btn).paddingInlineStart) || 8;
    const rows = rowsOf(team);
    if (!rows.length) return;
    const info = rows.map((r) => ({ r, pad: padOf(r), slot: bulletSlot(r) }));
    const pagePads = info.filter((x) => !x.slot).map((x) => x.pad);
    const minPad = pagePads.length ? Math.min(...pagePads) : Math.min(...info.map((x) => x.pad));
    /* ビューの行のすぐ上（左に浅い）のページ行が DB */
    for (let i = 0; i < info.length; i++) {
      const x = info[i];
      if (!x.slot) continue;
      for (let j = i - 1; j >= 0; j--) {
        if (!info[j].slot && info[j].pad < x.pad) { info[j].db = true; x.dbRow = info[j]; break; }
      }
    }
    const teamKey = team.getAttribute('data-c16-k') || norm(btn.textContent);
    let viewIx = new Map();
    for (const x of info) {
      const { r } = x;
      if (x.slot) {
        const db = x.dbRow;
        const base = db ? db.newPad : teamPad;
        const pad = base + P.viewIndent;
        setAttr(r, 'data-c33-kind', 'view');
        setVar(r, '--c33-pad', pad.toFixed(1) + 'px');
        setVar(r, '--c33-guide', (base + 9).toFixed(1) + 'px');
        setAttr(x.slot, 'data-c33-vslot', '1');
        let type = typeFromName(nameOf(r));
        if (db && db.id) {
          const types = VIEWTYPES.get(db.id);
          const k = viewIx.get(db) || 0; viewIx.set(db, k + 1);
          if (types && types[k]) type = TYPE_ALIAS[types[k]] || type;
          else if (!types) viewTypesOf(db.id);
        }
        setAttr(r, 'data-c33-vt', type);
        ST.views++;
        continue;
      }
      const name = nameOf(r);
      const level = Math.max(0, x.pad - minPad);
      x.newPad = P.flat ? teamPad + level * P.scale : x.pad;
      setVar(r, '--c33-pad', x.newPad.toFixed(1) + 'px');
      x.id = idOf(r);
      const dbKey = teamKey + '|' + name;
      if (x.db) { if (!KNOWN_DB[dbKey]) { KNOWN_DB[dbKey] = 1; saveDb(); } }
      const isDb = x.db || !!KNOWN_DB[dbKey];
      setAttr(r, 'data-c33-kind', isDb ? 'db' : 'page');
      setAttr(r, 'data-c33-lvl', String(Math.round(level / 12)));
      ST.rows++;
      if (isDb) ST.dbs++;
    }
  }
  function scan() {
    if (!P.on) return;
    ST.scans++; ST.rows = 0; ST.views = 0; ST.dbs = 0;
    document.documentElement.setAttribute('data-c33', P.flat ? 'flat' : 'nest');
    installCss();
    const scope = document.querySelector('nav.notion-sidebar-container, .notion-sidebar-container, .notion-sidebar');
    if (!scope) return;
    for (const t of scope.querySelectorAll(SEL_TEAM)) {
      if (t.closest('[role="dialog"]')) continue;
      try { scanTeam(t); } catch (e) { ST.lastError = String(e && e.stack || e); }
    }
    /* ★見出しに色の印（選択中の行の左の印に使う） */
    for (const sec of scope.querySelectorAll('#c16-root .c16-sec')) {
      const ico = sec.querySelector('.c16-ico');
      if (!ico) continue;
      const c = getComputedStyle(ico).backgroundColor;
      const g = sec.getAttribute('data-c16-g');
      if (c && g) for (const t of scope.querySelectorAll(SEL_TEAM + '[data-c16-g="' + g + '"]')) setVar(t, '--c33-tint', c);
    }
  }
  let schedT = 0;
  function schedule(ms) {
    if (schedT) return;
    schedT = setTimeout(() => { schedT = 0; requestAnimationFrame(scan); }, ms == null ? 80 : ms);
  }

  /* ============================================================
   *  CSS
   * ============================================================ */
  const B = ':not(#c33a):not(#c33b):not(#c33c)';
  function installCss() {
    if (document.getElementById('c33-css')) return;
    const st = document.createElement('style');
    st.id = 'c33-css';
    const icons = Object.entries(VICON).map(([k, v]) => 'html[data-c33] [data-c33-kind="view"][data-c33-vt="' + k + '"] [data-c33-vslot]::after{-webkit-mask-image:' + v + ';mask-image:' + v + ';}').join('\n');
    st.textContent = `
:root {
  --c33-serif: var(--c16-head-font, "Baskerville", "Hiragino Mincho ProN", "Yu Mincho", serif);
  --c33-item-font: var(--c33-serif);
  --c33-item-size: 13px;
  --c33-item-h: 28px;
  --c33-view-size: 12px;
  --c33-team-size: 10.5px;
  --c33-team-track: .14em;
  --c33-radius: 6px;
  --c33-hover: var(--c-bacHov, rgba(55,53,47,.06));
  --c33-active: color-mix(in srgb, var(--c33-tint, #2383e2) 9%, transparent);
  --c33-guide-c: color-mix(in srgb, var(--c-texPri, #37352f) 14%, transparent);
}
/* ★ グループ見出し */
html[data-c33] #c16-root .c16-head${B} { letter-spacing: .04em; border-radius: 8px; }
html[data-c33] #c16-root .c16-cnt${B} { min-width: 18px; height: 16px; padding: 0 5px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: color-mix(in srgb, var(--c-texPri, #37352f) 6%, transparent); font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
html[data-c33] #c16-root .c16-sec[data-c16-first="0"]${B} { position: relative; }
html[data-c33] #c16-root .c16-sec[data-c16-first="0"]${B}::before { content: ""; position: absolute; left: 6px; right: 10px; top: calc(var(--c16-gap-sections, 18px) / -2); height: 1px; background: linear-gradient(90deg, transparent, var(--c33-guide-c) 18%, var(--c33-guide-c) 82%, transparent); pointer-events: none; }
/* ■ ワークスペース（小さな見出し） */
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B} { min-height: 26px !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN} .notranslate${B} { font-family: var(--c33-serif) !important; font-size: var(--c33-team-size) !important; font-weight: 600 !important; letter-spacing: var(--c33-team-track) !important; text-transform: uppercase; color: var(--c-texSec, #787774) !important; }
/* ● DB・ページ */
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][data-c33-pad]${B} { padding-inline-start: var(--c33-pad) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="db"]${B},
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="page"]${B} { min-height: var(--c33-item-h) !important; border-radius: var(--c33-radius) !important; position: relative; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) .notranslate${B} { font-family: var(--c33-item-font) !important; font-size: var(--c33-item-size) !important; letter-spacing: .02em; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="db"] .notranslate${B} { font-weight: 600 !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][style*="bacIntTra"]${B} { background: var(--c33-active) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][style*="bacIntTra"]${B}::before { content: ""; position: absolute; left: 2px; top: 6px; bottom: 6px; width: 2px; border-radius: 2px; background: var(--c33-tint, #2383e2); }
/* ▲ ビュー */
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"]${B} { min-height: 24px !important; height: 26px !important; font-size: var(--c33-view-size) !important; color: var(--c-texSec, #787774) !important; border-radius: var(--c33-radius) !important; position: relative; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"]${B}::after { content: ""; position: absolute; left: var(--c33-guide, 18px); top: 0; bottom: 0; width: 1px; background: var(--c33-guide-c); pointer-events: none; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"][style*="bacIntTra"]${B} { color: var(--c-texPri, #37352f) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"][style*="bacIntTra"]${B}::after { background: var(--c33-tint, #2383e2); width: 2px; }
html[data-c33] [data-c33-vslot]${B} { position: relative; width: 16px !important; margin-inline-end: 7px !important; }
html[data-c33] [data-c33-vslot]${B} > * { opacity: 0 !important; }
html[data-c33] [data-c33-vslot]${B}::after { content: ""; position: absolute; inset: 50% auto auto 50%; width: 15px; height: 15px; transform: translate(-50%, -50%); background: currentColor; opacity: .78; -webkit-mask: none center / 15px 15px no-repeat; mask: none center / 15px 15px no-repeat; }
${icons}
@media (prefers-reduced-motion: no-preference) {
  html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B} { transition: background-color .12s ease; }
}
`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ============================================================
   *  起動
   * ============================================================ */
  const mo = new MutationObserver((recs) => {
    for (const r of recs) {
      const t = r.target;
      if (t.nodeType === 1 && t.closest && t.closest('.notion-sidebar-container, .notion-sidebar, nav')) { schedule(); return; }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule(120));
  schedule(300);
  setTimeout(() => schedule(0), 1500);

  window.__c33 = {
    version: VERSION,
    status: () => Object.assign({ prefs: Object.assign({}, P), knownDb: Object.keys(KNOWN_DB).length, viewTypes: VIEWTYPES.size }, ST),
    set(o) { Object.assign(P, o || {}); saveP(); scan(); return Object.assign({}, P); },
    forgetDb() { KNOWN_DB = {}; saveDb(); scan(); return 'ok'; },
    off() {
      P.on = false; saveP(); mo.disconnect();
      document.documentElement.removeAttribute('data-c33');
      document.querySelectorAll('[data-c33-kind],[data-c33-team],[data-c33-vslot]').forEach((el) => { ['data-c33-kind', 'data-c33-team', 'data-c33-vslot', 'data-c33-vt', 'data-c33-lvl'].forEach((a) => el.removeAttribute(a)); ['--c33-pad', '--c33-guide', '--c33-tint'].forEach((v) => el.style.removeProperty(v)); });
      const s = document.getElementById('c33-css'); if (s) s.remove();
      return 'stopped（__c33.set({ on: true }) と再読み込みで戻ります）';
    }
  };
})();
