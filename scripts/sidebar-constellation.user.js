// ==UserScript==
// @name         « No »　³³ _ Sidebar Constellation
// @namespace    https://cordivestium.local/sidebar-constellation
// @version      49.0.0
// @description  v49.0.0: B.U.R.I の AI を無料で使えるように（既定は Google Gemini の無料枠・Chrome 内蔵 AI も選べる・Claude は任意）。v48.0.0: 輪で選んだ大分類の中身が出ない（¹⁶ で畳んだまま）を修正・輪のスクロールの向きを逆に（設定で戻せる）・B.U.R.I が Notion 全体と Google を調べ、AI（Claude・鍵は自分の物）でまとめて話す。v38.0.0: 【完全版】UIロジックを1文字も削らず復元しUI崩壊を解決。数字バッジ被り修正。特権APIを用いた最高精度のGoogle検索（本・小説特化）とAIアニメーション、フローティングUI搭載。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://app.notion.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @connect      www.google.co.jp
// @connect      www.google.com
// @connect      api.anthropic.com
// @connect      generativelanguage.googleapis.com
// @noframes
// ==/UserScript==

/*
 * v49.0.0
 *   ・B.U.R.I の AI を「無料」で使えるように。「AI」で使う AI を選ぶ:
 *       Gemini（無料・既定）… aistudio.google.com で無料の鍵を作って貼るだけ。カード登録なし・使った分の請求なし（上限を超えたら少し待つだけ）
 *       Chrome 内蔵（無料・鍵なし）… 新しい Chrome の端末内 AI（Gemini Nano）。使えない端末では自動で抜粋モードへ
 *       Claude（有料・従量）… これまで通り
 *       使わない … 抜粋をつないで答える
 *   ・AI がつながらない・上限の時は、黙って抜粋モードで答える（止まらない）。
 * v48.0.0
 *   ・輪で大分類を選んでも右が真っ白 → ¹⁶ で畳まれた大分類だった。選んだら ¹⁶ で開き、CSS でも中身を出す。
 *   ・輪のスクロールの向きを逆に（指を上へ → 輪も上へ）。設定 › スクロールの向き で元に戻せる。
 *   ・B.U.R.I: 本棚（CSV）に加え、Notion 全体の検索（/api/v3/search）と Google 検索を合わせて答える。
 *     Anthropic の API キーを「AI」から入れると、Claude が両方を読んで要約して話す（出典に [N1][W2]）。鍵は GM_setValue にだけ保存。
 *   ・検索の見た目の CSS が入っていなかった（st → style の書き間違い）を修正。
 * v38.0.0
 *   ・UI崩壊の解決（Orbit回転・配置ロジックの完全復元）。
 *   ・Orbitの数字バッジ被りを解消（top: 4px; right: 6px; に独立配置）。
 *   ・Google検索エンジンの搭載（GM_xmlhttpRequestによる直接スクレイピング）。
 *   ・タイピングアニメーション、フローティングUI（⌃⌥B）の追加。プレースホルダー見切れ修正。
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '49.0.0';
  const TAG = '[³³ v' + VERSION + ']';
  if (window.__c33 && window.__c33.version) { console.warn(TAG, '旧版が動いています'); return; }

  const LS = 'c33.prefs.v1';
  const LS_DB = 'c33.db.v1';
  const P = { flat: true, scale: 0.8, viewIndent: 18, on: true, alignViews: true, viewShift: 0, noBg: true, tree: true };
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
   *  ビューの種類のアイコン（20×20・線 1.45）
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
  const VIEWTYPES = new Map();
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
      VIEWTYPES.set(dbId, ids.map((id) => {
        const v = vs.get(id);
        const type = atlas[id] && atlas[id].on ? 'atlas' : v ? (v.type || 'view') : 'view';
        return { id, type, icon: v ? viewIconOf(v) : '' };
      }));
      schedule(0);
      return VIEWTYPES.get(dbId);
    } catch (e) { ST.lastError = String(e && e.message || e); VIEWTYPES.set(dbId, []); return null; }
    finally { pending.delete(dbId); }
  }
  function viewIconOf(v) {
    const f = v.format || {};
    const cands = [f.view_icon, f.icon, v.icon, f.collection_view_icon];
    for (const [k, x] of Object.entries(f)) if (/icon/i.test(k) && typeof x === 'string') cands.push(x);
    for (const c of cands) if (typeof c === 'string' && c.trim() && !/^notion:\/\/custom_emoji/.test(c)) return c.trim();
    return '';
  }
  function iconUrl(ic) {
    if (/^https?:/.test(ic)) return ic;
    if (/^\//.test(ic)) return location.origin + ic;
    if (/^attachment:/.test(ic)) return location.origin + '/image/' + encodeURIComponent(ic) + '?table=collection_view&cache=v2';
    return '';
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
  const nameEl = (row) => [...row.querySelectorAll('.notranslate')].find((e) => !e.closest('.notion-record-icon, [role="img"]') && !e.querySelector('.notion-record-icon, img, svg') && norm(e.textContent)) || null;
  const nameOf = (row) => norm((nameEl(row) || row).textContent).slice(0, 120);

  /* ============================================================
   *  印を付ける
   * ============================================================ */
  const curView = () => (new URLSearchParams(location.search).get('v') || '').replace(/-/g, '').toLowerCase();
  function curPage() { const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname) || /([0-9a-f]{32})/i.exec(location.pathname); return m ? m[1].toLowerCase() : ''; }
  function alignViews(info) {
    requestAnimationFrame(() => {
      for (const x of info) {
        if (!x.view || !x.dbRow) continue;
        const t = nameEl(x.dbRow.r);
        if (!t || !x.slot.isConnected) continue;
        const tl = textLeft(t);
        const sl = x.slot.getBoundingClientRect().left + (parseFloat(getComputedStyle(x.slot).paddingLeft) || 0);
        const d = tl - sl + P.viewShift + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--c33-view-shift')) || 0);
        if (Math.abs(d) < 0.5) continue;
        const cur = parseFloat(getComputedStyle(x.r).paddingInlineStart) || 0;
        x.r.__c33dx = (x.r.__c33dx || 0) + d;
        setVar(x.r, '--c33-pad', Math.max(0, cur + d).toFixed(1) + 'px');
      }
    });
  }
  function textLeft(el) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      const i = n.nodeValue.search(/\S/);
      const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
      const r = rg.getBoundingClientRect();
      if (r.width || r.height) return r.left;
    }
    return el.getBoundingClientRect().left;
  }
  function scanTeam(team) {
    const btn = team.querySelector(SEL_TEAM_BTN);
    if (!btn) return;
    setAttr(team, 'data-c33-team', '1');
    const teamPad = parseFloat(getComputedStyle(btn).paddingInlineStart) || 8;
    const rows = rowsOf(team);
    if (!rows.length) { if (P.tree) alignTree(team, btn, []); return; }
    const info = rows.map((r) => ({ r, pad: padOf(r), slot: bulletSlot(r) }));
    const pagePads = info.filter((x) => !x.slot).map((x) => x.pad);
    const minPad = pagePads.length ? Math.min(...pagePads) : Math.min(...info.map((x) => x.pad));
    for (let i = 0; i < info.length; i++) {
      const x = info[i];
      if (!x.slot) continue;
      for (let j = i - 1; j >= 0; j--) {
        if (info[j].slot) continue;
        info[j].db = true; x.dbRow = info[j]; break;
      }
    }
    const teamKey = team.getAttribute('data-c16-k') || norm(btn.textContent);
    const viewIx = new Map();
    for (const x of info) {
      const { r } = x;
      if (x.slot) {
        const db = x.dbRow;
        const base = db ? db.newPad : teamPad;
        const pad = P.tree ? x.pad : base + P.viewIndent + (P.alignViews ? (r.__c33dx || 0) : 0);
        setAttr(r, 'data-c33-kind', 'view');
        setVar(r, '--c33-pad', pad.toFixed(1) + 'px');
        setAttr(r, 'data-c33-pad', '1');
        setAttr(x.slot, 'data-c33-vslot', '1');
        let type = typeFromName(nameOf(r)), rec = null;
        if (db && db.id) {
          const types = VIEWTYPES.get(db.id);
          const k = viewIx.get(db) || 0; viewIx.set(db, k + 1);
          if (types && types[k]) { rec = types[k]; type = TYPE_ALIAS[rec.type] || type; }
          else if (!types) viewTypesOf(db.id);
        }
        setAttr(r, 'data-c33-vt', type);
        const ic = rec && rec.icon;
        const u = ic ? iconUrl(ic) : '';
        if (u) { setAttr(x.slot, 'data-c33-vic', 'img'); setVar(x.slot, '--c33-vimg', 'url("' + u.replace(/"/g, '%22') + '")'); x.slot.removeAttribute('data-c33-vemo'); }
        else if (ic) { setAttr(x.slot, 'data-c33-vic', 'emoji'); setAttr(x.slot, 'data-c33-vemo', ic); }
        else { x.slot.removeAttribute('data-c33-vic'); x.slot.removeAttribute('data-c33-vemo'); }
        const cur = rec && curView() === rec.id.replace(/-/g, '');
        if (cur) setAttr(r, 'data-c33-cur', '1'); else if (r.hasAttribute('data-c33-cur')) r.removeAttribute('data-c33-cur');
        x.view = true;
        ST.views++;
        continue;
      }
      const name = nameOf(r);
      const level = Math.max(0, x.pad - minPad);
      x.newPad = P.tree ? x.pad : P.flat ? teamPad + level * P.scale : x.pad;
      setVar(r, '--c33-pad', x.newPad.toFixed(1) + 'px');
      setAttr(r, 'data-c33-pad', '1');
      x.id = idOf(r);
      const dbKey = teamKey + '|' + name;
      if (x.db) { if (!KNOWN_DB[dbKey]) { KNOWN_DB[dbKey] = 1; saveDb(); } }
      const isDb = x.db || !!KNOWN_DB[dbKey];
      setAttr(r, 'data-c33-kind', isDb ? 'db' : 'page');
      setAttr(r, 'data-c33-lvl', String(Math.round(level / 12)));
      if (x.id && curPage() === x.id.replace(/-/g, '')) setAttr(r, 'data-c33-cur', '1'); else if (r.hasAttribute('data-c33-cur')) r.removeAttribute('data-c33-cur');
      ST.rows++;
      if (isDb) ST.dbs++;
    }
    if (P.tree) alignTree(team, btn, info); else if (P.alignViews) alignViews(info);
  }
  const cssPx = (n) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)) || 0;
  function realIcon(el) {
    if (!el) return null;
    for (const nd of el.querySelectorAll('[data-c33-vslot], .notion-record-icon, [role="img"], img, svg')) {
      if (nd.closest('[class*="arrowChevron"]') || String(nd.getAttribute('class') || '').includes('arrowChevron')) continue;
      const r = nd.getBoundingClientRect();
      if (r.width >= 8 && r.width <= 34 && r.height >= 8) return nd;
    }
    return null;
  }
  function textEl(el) {
    return nameEl(el) || [...el.querySelectorAll('span, div')].find((e) => !e.closest('.notion-record-icon, [role="img"]') && !e.querySelector('svg, img, [data-c33-vslot], .notion-record-icon') && !e.matches('[data-c33-vslot]') && norm(e.textContent)) || null;
  }
  function moverOf(container, icon, text) {
    let m = icon;
    while (m.parentElement && m.parentElement !== container && !(text && m.parentElement.contains(text))) m = m.parentElement;
    return m;
  }
  const MV = new WeakMap();
  const MIN_NAME = 92;
  function place(container, target) {
    const icon = container.matches && container.matches('[data-c33-vslot]') ? container : realIcon(container);
    if (!icon) return null;
    const row = container.closest ? (container.closest(SEL_PAGE + ', ' + SEL_TEAM_BTN) || container) : container;
    const rr = row.getBoundingClientRect();
    if (rr.width > 60) target = Math.min(target, rr.right - MIN_NAME - icon.getBoundingClientRect().width - 10);
    const text = textEl(container);
    const m = icon === container ? container : moverOf(container, icon, text);
    const il = icon.getBoundingClientRect().left;
    const d = target - il;
    if (Math.abs(d) < 0.5) return 0;
    const cur = parseFloat(getComputedStyle(m).marginInlineStart) || 0;
    const nv = Math.max(-240, Math.min(320, cur + d));
    const prev = m.style.getPropertyValue('margin-inline-start'), prevP = m.style.getPropertyPriority('margin-inline-start');
    m.style.setProperty('margin-inline-start', nv.toFixed(1) + 'px', 'important');
    if (text && text !== icon && !icon.contains(text) && !text.contains(icon)) {
      const ir = icon.getBoundingClientRect();
      if (textLeft(text) < ir.right - 1) {
        if (prev) m.style.setProperty('margin-inline-start', prev, prevP); else m.style.removeProperty('margin-inline-start');
        ST.reverted = (ST.reverted || 0) + 1;
        return null;
      }
    }
    m.setAttribute('data-c33-mv', '1');
    MV.set(m, nv);
    return d;
  }
  const LS_STAR = 'c33.stardx.v1';
  let STAR_DX = null;
  try { const v = parseFloat(localStorage.getItem(LS_STAR)); if (isFinite(v)) STAR_DX = v; } catch (e) { /* noop */ }
  function alignTree(team, btn, info) {
    requestAnimationFrame(() => {
      if (!btn.isConnected) return;
      const de = document.documentElement;
      const g = team.getAttribute('data-c16-g');
      const orbitOn = de.hasAttribute('data-c33-orbit');
      const headHidden = orbitOn && de.hasAttribute('data-c33-osel');
      const tr = team.getBoundingClientRect();
      const sec = g ? document.querySelector('#c16-root .c16-sec[data-c16-g="' + CSS.escape(g) + '"]') : null;
      const lbl = sec && !headHidden ? sec.querySelector(orbitOn ? '.c16-ico' : '.c16-lbl') : null;
      const lr = lbl ? lbl.getBoundingClientRect() : null;
      if (lr && lr.width && tr.width) {
        const x = orbitOn ? lr.left : textLeft(lbl);
        if (orbitOn) {
          const dx = Math.round((x - tr.left) * 10) / 10;
          if (dx >= 0 && dx < 80 && dx !== STAR_DX) { STAR_DX = dx; try { localStorage.setItem(LS_STAR, String(dx)); } catch (e) { /* noop */ } }
        }
        place(btn, x + cssPx('--c33-team-shift'));
      } else if (headHidden && tr.width) {
        place(btn, tr.left + (STAR_DX != null ? STAR_DX : 8) + cssPx('--c33-team-shift'));
      }
      const teamText = textEl(btn) || btn;
      const tTeam = textLeft(teamText);
      const stack = [];
      for (const x of info) {
        if (!x.r.isConnected || !x.r.getBoundingClientRect().height) continue;
        if (x.slot) {
          const t = x.dbRow && textEl(x.dbRow.r);
          if (!t) continue;
          place(x.slot, textLeft(t) + P.viewShift + cssPx('--c33-view-shift'));
          continue;
        }
        while (stack.length && stack[stack.length - 1].pad >= x.pad) stack.pop();
        const parent = stack[stack.length - 1];
        const pt = parent ? textEl(parent.r) : null;
        place(x.r, (pt ? textLeft(pt) : tTeam) + cssPx('--c33-db-shift') + cssPx('--c33-icon-dx'));
        stack.push(x);
      }
      ST.aligned = (ST.aligned || 0) + 1;
      obFixSoon();
    });
  }
  function scan() {
    if (!P.on) return;
    ST.scans++; ST.rows = 0; ST.views = 0; ST.dbs = 0;
    document.documentElement.setAttribute('data-c33', P.flat ? 'flat' : 'nest');
    document.documentElement.toggleAttribute('data-c33-nobg', P.noBg !== false);
    document.documentElement.toggleAttribute('data-c33-tree', P.tree !== false);
    installCss();
    const scope = document.querySelector('nav.notion-sidebar-container, .notion-sidebar-container, .notion-sidebar');
    if (!scope) return;
    for (const t of scope.querySelectorAll(SEL_TEAM)) {
      if (t.closest('[role="dialog"]')) continue;
      try { scanTeam(t); } catch (e) { ST.lastError = String(e && e.stack || e); }
    }
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
   *  CSS（UI維持・バッジ被り修正）
   * ============================================================ */
  const B = ':not(#c33a):not(#c33b):not(#c33c)';
  const NT = '.notranslate:not(.notion-record-icon)';
  function installCss() {
    if (document.getElementById('c33-css')) return;
    const st = document.createElement('style');
    st.id = 'c33-css';
    const icons = Object.entries(VICON).map(([k, v]) => 'html[data-c33] [data-c33-kind="view"][data-c33-vt="' + k + '"] [data-c33-vslot]' + B + '::after{-webkit-mask-image:' + v + ' !important;mask-image:' + v + ' !important;}').join('\n');
    st.textContent = `
:root {
  --c33-serif: var(--c16-head-font, "Baskerville", "Hiragino Mincho ProN", "Yu Mincho", serif);
  --c33-item-font: var(--c33-serif);
  --c33-item-size: 13px;
  --c33-item-weight: 500;
  --c33-item-track: .02em;
  --c33-item-h: 28px;
  --c33-item-color: var(--c-texPri, #37352f);
  --c33-icon-size: 18px;
  --c33-icon-gap: 8px;
  --c33-icon-dx: 0px;
  --c33-icon-dy: 0px;
  --c33-text-dy: 0px;
  --c33-view-font: var(--c33-item-font);
  --c33-view-size: 12.5px;
  --c33-view-weight: 400;
  --c33-view-track: .02em;
  --c33-view-h: 26px;
  --c33-view-color: var(--c-texSec, #787774);
  --c33-vicon-size: 15px;
  --c33-vicon-gap: 7px;
  --c33-vicon-dy: 0px;
  --c33-vtext-dy: 0px;
  --c33-team-font: var(--c33-serif);
  --c33-team-size: 10.5px;
  --c33-team-weight: 600;
  --c33-team-track: .14em;
  --c33-team-color: var(--c-texSec, #787774);
  --c33-team-gap: 8px;
  --c33-team-after: 0px;
  --c33-cur-weight: 700;
  --c33-cur-color: var(--c-texPri, #37352f);
  --c33-radius: 6px;
}
html[data-c33] #c16-root .c16-cnt${B} { min-width: 18px; height: 16px; padding: 0 5px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: color-mix(in srgb, var(--c-texPri, #37352f) 6%, transparent); font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
html[data-c33] ${SEL_TEAM}[data-c33-team]${B} { margin-top: var(--c33-team-gap) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B} { margin-bottom: var(--c33-team-after) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B},
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN} :is(div, span):not(:has(svg, img))${B} { font-family: var(--c33-team-font) !important; font-size: var(--c33-team-size) !important; font-weight: var(--c33-team-weight) !important; letter-spacing: var(--c33-team-track) !important; text-transform: uppercase !important; color: var(--c33-team-color) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team][data-c33-tpad] ${SEL_TEAM_BTN}${B} { padding-inline-start: var(--c33-tpad) !important; }
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B}:is(:hover, :focus, :focus-visible, [aria-selected="true"], [aria-current]),
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN} > div${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] .notion-outliner-team-header${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] .notion-outliner-team-header-container${B} { background: transparent !important; background-color: transparent !important; box-shadow: none !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][data-c33-pad]${B} { padding-inline-start: var(--c33-pad) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"])${B} { height: var(--c33-item-h) !important; min-height: var(--c33-item-h) !important; border-radius: var(--c33-radius) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) :is(${NT}, ${NT} *):not(.notion-record-icon *)${B} { font-family: var(--c33-item-font) !important; font-size: var(--c33-item-size) !important; font-weight: var(--c33-item-weight) !important; letter-spacing: var(--c33-item-track) !important; color: var(--c33-item-color) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) ${NT}${B} { transform: translateY(var(--c33-text-dy)); }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) > :first-child${B} { min-width: var(--c33-icon-size) !important; margin-inline-end: var(--c33-icon-gap) !important; transform: translate(var(--c33-icon-dx), var(--c33-icon-dy)); }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) > :first-child .notion-record-icon${B} { width: var(--c33-icon-size) !important; height: var(--c33-icon-size) !important; font-size: calc(var(--c33-icon-size) * .86) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) > :first-child .notion-record-icon :is(img, svg, div[style*="mask"], span)${B} { width: var(--c33-icon-size) !important; height: var(--c33-icon-size) !important; max-width: none !important; max-height: none !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"]${B} { min-height: var(--c33-view-h) !important; height: var(--c33-view-h) !important; border-radius: var(--c33-radius) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"] :is(div, span):not([data-c33-vslot]):not(:has(svg, img))${B} { font-family: var(--c33-view-font) !important; font-size: var(--c33-view-size) !important; font-weight: var(--c33-view-weight) !important; letter-spacing: var(--c33-view-track) !important; color: var(--c33-view-color) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"] > :not([data-c33-vslot])${B} { transform: translateY(var(--c33-vtext-dy)); }
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]:hover${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] :is([role="treeitem"], a, [role="button"]):has(> [data-c33-kind])${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] :is([role="treeitem"], a, [role="button"]):has(> [data-c33-kind]):hover${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind] > :not(:first-child)${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] div:has(> [data-c33-kind]):not(:has(> [data-c33-kind] ~ [data-c33-kind]))${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] div:has(> [data-c33-kind]):not(:has(> [data-c33-kind] ~ [data-c33-kind])):hover${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B}::before,
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B}::after { background: transparent !important; background-color: transparent !important; box-shadow: none !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][data-c33-cur] :is(${NT}, ${NT} *, div:not(:has(*)), span:not(:has(*))):not(.notion-record-icon *)${B} { font-weight: var(--c33-cur-weight) !important; color: var(--c33-cur-color) !important; }
html[data-c33] [data-c33-vslot]${B} { position: relative; width: var(--c33-vicon-size) !important; min-width: var(--c33-vicon-size) !important; margin-inline-end: var(--c33-vicon-gap) !important; padding: 0 !important; }
html[data-c33] [data-c33-vslot]${B} > * { opacity: 0 !important; }
html[data-c33] [data-c33-vslot]${B}::after { content: ""; position: absolute; left: 0; top: 50%; width: var(--c33-vicon-size); height: var(--c33-vicon-size); transform: translateY(calc(-50% + var(--c33-vicon-dy))); background: currentColor; opacity: .78; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
html[data-c33] [data-c33-kind="view"][data-c33-vt] [data-c33-vslot][data-c33-vic="img"]${B}::after { background: var(--c33-vimg) center / contain no-repeat !important; -webkit-mask-image: none !important; mask-image: none !important; opacity: 1; }
html[data-c33] [data-c33-kind="view"][data-c33-vt] [data-c33-vslot][data-c33-vic="emoji"]${B}::after { content: attr(data-c33-vemo) !important; background: none !important; -webkit-mask-image: none !important; mask-image: none !important; opacity: 1; display: flex; align-items: center; justify-content: center; font-size: calc(var(--c33-vicon-size) * .9); line-height: 1; font-family: "Apple Color Emoji", "Segoe UI Emoji", sans-serif; }

/* B.U.R.I フローティング・アニメーション用CSS */
#c33-search-header.floating { left: 50% !important; transform: translateX(-50%) !important; width: 600px !important; max-width: 90vw !important; top: 15vh !important; box-shadow: var(--c-shaOutMd, 0 12px 36px rgba(0,0,0,.18)) !important; }
#c33-buri.floating { left: 50% !important; transform: translateX(-50%) !important; width: 600px !important; max-width: 90vw !important; top: calc(15vh + 46px) !important; max-height: 60vh !important; }
@keyframes buriPop { 0% { opacity: 0; transform: translateY(8px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
#c33-buri .cb-msg { animation: buriPop 0.25s ease-out forwards; }
.typewriter-cursor::after { content: "▌"; display: inline-block; vertical-align: bottom; animation: blink 1s step-start infinite; margin-left: 2px; color: var(--lm-accent, #2783de); }
@keyframes blink { 50% { opacity: 0; } }
.thinking-dots { display: inline-flex; gap: 4px; align-items: center; height: 16px; }
.thinking-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--c-texSec, #999); animation: bounce 1.4s infinite ease-in-out both; }
.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
${icons}
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
  document.addEventListener('atelier-change', () => schedule(60));
  schedule(300);
  setTimeout(() => schedule(0), 1500);

  /* ============================================================
   *  Orbit
   * ============================================================ */
  const OB_KEY = 'c33.orbit.v2';
  const OB = Object.assign({ on: true, sel: '', itemH: 54, pin: false, hideEmpty: false, spin: false, fix: 0, topDy: 0, full: true, tabs: true, ws: true, v: 0, wheelRev: true }, (() => { try { const v2 = localStorage.getItem(OB_KEY); if (v2) return JSON.parse(v2); const v1 = JSON.parse(localStorage.getItem('c33.orbit.v1') || '{}'); v1.on = true; return v1; } catch (e) { return {}; } })());
  delete OB.railW;
  delete OB.all;
  const obSave = () => { try { localStorage.setItem(OB_KEY, JSON.stringify(OB)); } catch (e) { /* noop */ } };
  if (OB.v !== 28) { OB.fix = 0; OB.topDy = 0; OB.v = 28; if (OB.full == null) OB.full = true; if (OB.tabs == null) OB.tabs = true; if (OB.ws == null) OB.ws = true; obSave(); }
  const RAIL_W = 58, RAIL_X = 184;
  let obEl = null, obHost = null, obOff = 0, obTarget = 0, obRaf = 0, obSnapT = 0, obSig = '', obExpT = 0;
  const ALL = '*';

  const ICON_ALL = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="black"><rect x="3" y="3" width="6" height="6" rx="1.8"/><rect x="11" y="3" width="6" height="6" rx="1.8"/><rect x="3" y="11" width="6" height="6" rx="1.8"/><rect x="11" y="11" width="6" height="6" rx="1.8"/></svg>') + '")';
  const ICON_ORBIT = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><ellipse cx="10" cy="10" rx="7.6" ry="3.4" transform="rotate(-28 10 10)"/><circle cx="10" cy="10" r="2.3" fill="currentColor" stroke="none"/><circle cx="15.9" cy="6.1" r="1.25" fill="currentColor" stroke="none"/></svg>';
  const ICON_GEAR = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="2.5"/><circle cx="10" cy="10" r="5.4"/><path d="M10 2.4v2.2M10 15.4v2.2M2.4 10h2.2M15.4 10h2.2M4.6 4.6l1.6 1.6M13.8 13.8l1.6 1.6M4.6 15.4l1.6-1.6M13.8 6.2l1.6-1.6"/></svg>';
  const ICON_PLUS = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10 4.5v11M4.5 10h11"/></svg>';
  const ICON_SLIDERS = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3.5 6h13M3.5 14h13"/><circle cx="7.5" cy="6" r="2" fill="var(--c-bacEle, #fff)"/><circle cx="12.5" cy="14" r="2" fill="var(--c-bacEle, #fff)"/></svg>';
  const ICON_UPDOWN = '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 8l3.5-3.5L13.5 8M6.5 12l3.5 3.5 3.5-3.5"/></svg>';

  const NSET = [
    { tab: 'user_settings', label: 'Preferences', ja: '表示・言語など' },
    { tab: 'notifications', label: 'Notifications', ja: '通知' },
    { tab: 'settings', label: 'General', ja: 'ワークスペース全般' },
    { tab: 'members', label: 'People', ja: 'メンバー' },
    { tab: 'teams', label: 'Teamspaces', ja: 'チームスペース' },
    { tab: 'public_pages', label: 'Public pages', ja: '公開ページ' }
  ];

  function obGroups() {
    const gs = [...document.querySelectorAll('#c16-root .c16-sec[data-c16-g]')].map((sec) => {
      const ico = sec.querySelector('.c16-ico');
      const cs = ico ? getComputedStyle(ico) : null;
      return {
        gid: sec.getAttribute('data-c16-g'),
        label: norm((sec.querySelector('.c16-lbl') || {}).textContent),
        cnt: norm((sec.querySelector('.c16-cnt') || {}).textContent),
        txt: ico && ico.getAttribute('data-c16-txt'),
        mask: cs ? ((m) => (m && m !== 'none') ? m : ((cs.getPropertyValue('--c16-ico') || cs.getPropertyValue('--c16-ico-fallback') || '').trim() || 'none'))(cs.webkitMaskImage || cs.maskImage) : 'none',
        bgi: cs ? cs.backgroundImage : 'none',
        tint: cs ? cs.backgroundColor : ''
      };
    }).filter((g) => g.gid && g.label);
    return OB.hideEmpty ? gs.filter((g) => g.cnt !== '0' || g.gid === OB.sel) : gs;
  }

  const obSide = () => document.querySelector('nav.notion-sidebar-container, .notion-sidebar-container, .notion-sidebar');
  const TAB_NAME = /^(home|chat|meetings?|inbox|search|ホーム|チャット|ミーティング|受信トレイ|受信箱|検索)/i;
  function obTabRow() {
    const side = obSide(); if (!side) return null;
    const tl = side.querySelector('[role="tablist"]');
    if (!tl) return null;
    const p = tl.parentElement;
    if (!p || p === side || p.querySelector('[id^="sidebar-tabpanel-"], .notion-scroller, ' + SEL_TEAM)) return tl;
    return p;
  }
  function obTabs() {
    const row = obTabRow(); if (!row) return [];
    const out = [];
    for (const el of row.querySelectorAll('[role="tab"], [role="button"], button')) {
      if (el.id === 'c33-orbit-btn' || el.closest('#c33-orbit-btn')) continue;
      if (out.some((x) => x.el.contains(el))) continue;
      const name = norm(el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent);
      if (!name) continue;
      const svg = el.querySelector('svg, img');
      out.push({ el, name: name.slice(0, 40), icon: svg ? svg.outerHTML : '', tab: el.getAttribute('role') === 'tab' || TAB_NAME.test(name), on: el.getAttribute('aria-selected') === 'true' });
    }
    return out;
  }
  function obPlusBtn() {
    const row = obTabRow(); if (!row) return null;
    return [...row.querySelectorAll('[role="button"], button')].find((el) => /チームスペース|teamspace|c16-(add|plus|new)/i.test((el.id || '') + ' ' + (el.className && el.className.baseVal == null ? el.className : '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.getAttribute('aria-label') || ''))) || null;
  }
  function obHomeTab() {
    const side = obSide(); if (!side) return null;
    return side.querySelector('[role="tab"][aria-controls^="sidebar-tabpanel-home"]') || (obTabs().find((t) => t.tab && /^(home|ホーム)/i.test(t.name)) || {}).el || null;
  }
  function obAtHome() {
    const t = obHomeTab();
    if (t && t.hasAttribute('aria-selected')) return t.getAttribute('aria-selected') === 'true';
    const side = obSide();
    const hp = side && side.querySelector('[id^="sidebar-tabpanel-home"]');
    return !hp || !!hp.getBoundingClientRect().height;
  }

  const obSwitcher = () => { const s = obSide(); return s ? s.querySelector('.notion-sidebar-switcher') : null; };
  function obWsRow() {
    const side = obSide(); if (!side) return null;
    const marked = side.querySelector('[data-c33-wsrow]');
    if (marked && marked.isConnected) return marked;
    const sw = obSwitcher(); if (!sw) return null;
    let row = sw;
    while (row.parentElement && row.parentElement !== side) {
      const p = row.parentElement;
      if (p.querySelector('[role="tablist"], [id^="sidebar-tabpanel-"], .notion-scroller, ' + SEL_TEAM)) break;
      if (p.getBoundingClientRect().height > 60) break;
      row = p;
    }
    if (row.querySelector('[role="tablist"], .notion-scroller')) return null;
    row.setAttribute('data-c33-wsrow', '1');
    return row;
  }
  function obWsInfo() {
    const sw = obSwitcher();
    if (!sw) return { name: 'Workspace', icon: '' };
    const nm = [...sw.querySelectorAll('.notranslate, div, span')].find((e) => !e.closest('.notion-record-icon') && !e.querySelector('svg, img, .notion-record-icon') && norm(e.textContent));
    const ic = sw.querySelector('.notion-record-icon, img');
    return { name: norm((nm || sw).textContent).slice(0, 60) || 'Workspace', icon: ic ? ic.outerHTML : '' };
  }
  const WS_HINT = [
    [/close|collapse|閉じる|たたむ/i, 'サイドバーを閉じる', '⌘\\'],
    [/new page|create|新規|新しいページ|作成/i, '新しいページ', '⌘N']
  ];
  function obWsBtns() {
    const row = obWsRow(); if (!row) return [];
    const sw = obSwitcher();
    const out = [];
    for (const el of row.querySelectorAll('[role="button"], button')) {
      if (sw && (sw === el || sw.contains(el) || el.contains(sw))) continue;
      if (out.some((x) => x.el.contains(el))) continue;
      const raw = norm(el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent);
      const h = WS_HINT.find(([re]) => re.test(raw));
      const svg = el.querySelector('svg');
      out.push({ el, name: h ? h[1] : (raw || 'ボタン'), key: h ? h[2] : '', icon: svg ? svg.outerHTML : '' });
    }
    return out;
  }
  function obMarkRows() {
    const tr = obTabRow();
    if (tr && !tr.hasAttribute('data-c33-tabrow')) tr.setAttribute('data-c33-tabrow', '1');
    obWsRow();
  }

  function obPress(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const o = { bubbles: true, cancelable: true, composed: true, view: window, button: 0, buttons: 1, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    const pe = { pointerId: 1, pointerType: 'mouse', isPrimary: true };
    try { el.dispatchEvent(new PointerEvent('pointerdown', Object.assign({}, pe, o))); } catch (e) { /* noop */ }
    el.dispatchEvent(new MouseEvent('mousedown', o));
    try { el.dispatchEvent(new PointerEvent('pointerup', Object.assign({}, pe, o, { buttons: 0 }))); } catch (e) { /* noop */ }
    el.dispatchEvent(new MouseEvent('mouseup', Object.assign({}, o, { buttons: 0 })));
    el.dispatchEvent(new MouseEvent('click', Object.assign({}, o, { buttons: 0 })));
    return true;
  }
  function obWait(fn, ms, step) {
    return new Promise((res) => {
      const t0 = Date.now();
      const tick = () => {
        let v = null;
        try { v = fn(); } catch (e) { v = null; }
        if (v) return res(v);
        if (Date.now() - t0 > (ms || 1500)) return res(null);
        setTimeout(tick, step || 50);
      };
      tick();
    });
  }
  async function obGoHome() {
    if (obAtHome()) return false;
    const t = obHomeTab();
    if (!t) return false;
    obPress(t);
    await obWait(obAtHome, 1200);
    return true;
  }
  const obDialog = () => { const t = document.querySelector('[role="dialog"] [id^="settings-tab-"][role="tab"]'); return t ? t.closest('[role="dialog"]') : null; };
  const obTarget0 = () => (document.activeElement && document.activeElement !== document.body ? document.activeElement : document.body);
  function obKey() {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const o = { key: ',', code: 'Comma', keyCode: 188, which: 188, metaKey: mac, ctrlKey: !mac, bubbles: true, cancelable: true, composed: true };
    const t = obTarget0();
    t.dispatchEvent(new KeyboardEvent('keydown', o));
    t.dispatchEvent(new KeyboardEvent('keyup', o));
  }
  function obEsc() {
    const o = { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true, composed: true };
    obTarget0().dispatchEvent(new KeyboardEvent('keydown', o));
  }
  const SET_ITEM = /^(settings|設定)(\s|$)|settings\s*&\s*members|設定とメンバー/i;
  function obMenuItem(re) {
    for (const el of document.querySelectorAll('[role="menuitem"], [role="option"], [role="dialog"] [role="button"], .notion-overlay-container [role="button"]')) {
      if (el.closest('#c33-ob-set, #c33-orbit')) continue;
      const tx = norm(el.getAttribute('aria-label') || el.textContent);
      if (re.test(tx) && el.getBoundingClientRect().width) return el;
    }
    return null;
  }

  let obSetBusy = false;
  async function obNotionSettings(tab) {
    if (obSetBusy) return false;
    obSetBusy = true;
    try {
      let d = obDialog();
      if (!d) {
        const sw = obSwitcher();
        if (sw) {
          obPress(sw);
          const it = await obWait(() => obMenuItem(SET_ITEM), 1200);
          if (it) { obPress(it); d = await obWait(obDialog, 1800); }
          else obEsc();
        }
      }
      if (!d) { obKey(); d = await obWait(obDialog, 1500); }
      if (!d) { obToast('Notion の設定を開けませんでした。⌘,（Windows は Ctrl+,）を押してみてください。'); return false; }
      if (tab) {
        const t = await obWait(() => document.getElementById('settings-tab-' + tab), 1200);
        if (t) obPress(t);
        else obToast('この画面は見つかりませんでした（権限やプランによっては出ません）。');
      }
      return true;
    } finally {
      obSetBusy = false;
    }
  }
  function obWsMenu() {
    if (!obPress(obSwitcher())) obToast('ワークスペースのメニューが見つかりませんでした。');
  }

  function obFindHost() {
    const side = obSide(); if (!side) return null;
    const home = side.querySelector('[id^="sidebar-tabpanel-home"]');
    if (OB.full !== false) {
      const sw = obSwitcher();
      const start = home || side.querySelector('.notion-scroller');
      if (sw && start) {
        let h = start.parentElement;
        while (h && h !== side && !h.contains(sw)) h = h.parentElement;
        if (h) return h;
      }
    }
    if (home) return home;
    const sc = side.querySelector('.notion-scroller');
    return sc ? sc.parentElement : null;
  }
  function obMarkShift(host) {
    if (!host) return;
    for (const ch of host.children) {
      if (ch.id === 'c33-orbit') continue;
      const p = getComputedStyle(ch).position;
      const flow = p !== 'absolute' && p !== 'fixed';
      if (flow && !ch.hasAttribute('data-c33-sh')) ch.setAttribute('data-c33-sh', '1');
      else if (!flow && ch.hasAttribute('data-c33-sh')) ch.removeAttribute('data-c33-sh');
    }
  }
  function obScroller() {
    const side = obSide(); if (!side) return null;
    const home = side.querySelector('[id^="sidebar-tabpanel-home"]');
    const sc = (home && home.querySelector('.notion-scroller')) || side.querySelector('.notion-scroller');
    if (!sc) return null;
    if (!sc.hasAttribute('data-c33-topfix')) {
      side.querySelectorAll('[data-c33-topfix]').forEach((el) => { if (el !== sc) el.removeAttribute('data-c33-topfix'); });
      sc.setAttribute('data-c33-topfix', '1');
    }
    return sc;
  }

  /* ============================================================
   *  Orbit用 CSS生成
   * ============================================================ */
  function obCss() {
    let st = document.getElementById('c33-orbit-css');
    if (!st) { st = document.createElement('style'); st.id = 'c33-orbit-css'; (document.head || document.documentElement).appendChild(st); }
    const sel = OB.sel && OB.sel !== ALL ? CSS.escape(OB.sel) : '';
    const de = document.documentElement;
    de.toggleAttribute('data-c33-orbit', !!OB.on);
    de.toggleAttribute('data-c33-otabs', !!(OB.on && OB.tabs !== false));
    de.toggleAttribute('data-c33-ows', !!(OB.on && OB.ws !== false));
    if (OB.on && OB.fix && !de.style.getPropertyValue('--c33-rail-fix')) de.style.setProperty('--c33-rail-fix', OB.fix + 'px');
    if (OB.on && OB.topDy && !de.style.getPropertyValue('--c33-top-dy')) de.style.setProperty('--c33-top-dy', OB.topDy + 'px');
    const hw = obHost ? obHost.getBoundingClientRect().width : 0;
    de.toggleAttribute('data-c33-orbit-pin', !!(OB.on && OB.pin && hw >= RAIL_X + 200));
    if (sel && OB.on) de.setAttribute('data-c33-osel', OB.sel); else de.removeAttribute('data-c33-osel');
    const itH = OB.itemH - 6;
    st.textContent = `
:root { --c33-rail-w: ${RAIL_W}px; --c33-rail-x: ${RAIL_X}px; --c33-ui: var(--cordi-ui, "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", sans-serif); }
html[data-c33-orbit] [data-c33-host] { position: relative !important; }
html[data-c33-orbit] [data-c33-host] > [data-c33-sh]:not(#c33-orbit) { margin-inline-start: calc(var(--c33-rail-w) + var(--c33-rail-fix, 0px)) !important; min-width: 0 !important; }
html[data-c33-orbit][data-c33-orbit-pin] [data-c33-host] > [data-c33-sh]:not(#c33-orbit) { margin-inline-start: calc(var(--c33-rail-x) + var(--c33-rail-fix, 0px)) !important; }
html[data-c33-otabs] [data-c33-tabrow]${B},
html[data-c33-ows] [data-c33-wsrow]${B} { height: 0 !important; min-height: 0 !important; max-height: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; margin-top: 0 !important; margin-bottom: 0 !important; border: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }
html[data-c33-orbit] [data-c33-topfix]${B} { margin-top: var(--c33-top-dy, 0px) !important; }
html[data-c33-orbit][data-c33-osel] .notion-sidebar-container #c16-root .c16-sec > .c16-head { display: none !important; }
html[data-c33-orbit][data-c33-osel] .notion-sidebar-container #c16-root .c16-sec${B} { margin-top: 0 !important; margin-bottom: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; min-height: 0 !important; border-top: 0 !important; border-bottom: 0 !important; }
${sel ? `html[data-c33-orbit] .notion-sidebar-container #c16-root .c16-sec:not([data-c16-g="${sel}"]) { display: none !important; }
html[data-c33-orbit] .notion-sidebar-container ${SEL_TEAM}[data-c16-g]:not([data-c16-g="${sel}"]) { display: none !important; }
/* v48: ¹⁶ で畳んだままの大分類でも、輪で選んだら中身を出す（右が真っ白にならない） */
html[data-c33-orbit] .notion-sidebar-container [data-c16-list="1"] > [data-c16-hide="1"]:has(${SEL_TEAM}[data-c16-g="${sel}"]) { display: flex !important; }
html[data-c33-orbit] .notion-sidebar-container [data-c16-arm]:not(:has(${SEL_TEAM}[data-c16-g="${sel}"])):has(${SEL_TEAM}) { display: none !important; }` : ''}
#c33-orbit { position: absolute; z-index: 6; left: 0; top: 0; bottom: 0; width: var(--c33-rail-w); display: flex; flex-direction: column; align-items: stretch;
  font-family: var(--c33-ui); font-size: 11px; line-height: 1.3; font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; color: var(--c-texSec, #777); user-select: none;
  background: color-mix(in srgb, var(--c-bacSec, #f7f6f3) 70%, var(--c-texPri, #000) 3%); box-shadow: inset -1px 0 0 var(--ca-borSecTra, rgba(0,0,0,.06));
  transition: width .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease, background-color .22s ease; overflow: hidden; contain: layout paint; }
#c33-orbit.exp, html[data-c33-orbit-pin] #c33-orbit { width: var(--c33-rail-x); }
#c33-orbit.exp:not(.pin) { background: color-mix(in srgb, var(--c-bacSec, #f7f6f3) 88%, transparent); -webkit-backdrop-filter: blur(14px) saturate(1.3); backdrop-filter: blur(14px) saturate(1.3);
  box-shadow: inset -1px 0 0 var(--ca-borSecTra, rgba(0,0,0,.06)), 10px 0 28px -12px rgba(15,15,15,.22); }
#c33-orbit .ob-all { position: relative; flex: none; margin: 6px 5px 5px; height: ${itH}px; border-radius: 11px; display: grid; grid-template-columns: 1fr; grid-template-rows: 24px auto; justify-items: center; align-content: center; row-gap: 3px;
  cursor: pointer; color: var(--c-texSec, #777); transition: background-color .15s ease, color .15s ease; }
#c33-orbit .ob-all::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: -3px; height: 1px; background: var(--ca-borSecTra, rgba(0,0,0,.07)); pointer-events: none; }
#c33-orbit.exp .ob-all, html[data-c33-orbit-pin] #c33-orbit .ob-all { grid-template-columns: 26px 1fr; grid-template-rows: 1fr; justify-items: start; align-items: center; column-gap: 9px; padding: 0 10px 0 9px; }
#c33-orbit .ob-all:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-orbit .ob-all.sel { background: color-mix(in srgb, var(--lm-accent, #2783de) 11%, transparent); color: var(--c-texPri, #222); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lm-accent, #2783de) 22%, transparent); }
#c33-orbit .ob-all .ob-ic { background: currentColor; -webkit-mask-image: ${ICON_ALL}; mask-image: ${ICON_ALL}; -webkit-mask-size: 20px 20px; mask-size: 20px 20px; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; }
#c33-orbit .ob-all .ob-lb { font-size: 9.5px; font-weight: 700; letter-spacing: .1em; }
#c33-orbit.exp .ob-all .ob-lb, html[data-c33-orbit-pin] #c33-orbit .ob-all .ob-lb { font-size: 12px; letter-spacing: .12em; }
#c33-orbit .ob-wheel { position: relative; flex: 1; overflow: hidden; perspective: 640px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 10px, #000 calc(100% - 46px), transparent 100%); mask-image: linear-gradient(to bottom, transparent 0, #000 10px, #000 calc(100% - 46px), transparent 100%); }
#c33-orbit .ob-it { position: absolute; left: 5px; right: 5px; top: 0; height: ${itH}px; border-radius: 11px; display: grid; grid-template-columns: 1fr; grid-template-rows: 24px auto; justify-items: center; align-content: center; row-gap: 3px;
  cursor: pointer; transform-origin: 50% 0; will-change: transform, opacity; transition: background-color .15s ease, color .15s ease; }
#c33-orbit.exp .ob-it, html[data-c33-orbit-pin] #c33-orbit .ob-it { grid-template-columns: 26px 1fr auto; grid-template-rows: 1fr; justify-items: start; align-items: center; column-gap: 9px; padding: 0 10px 0 9px; }
#c33-orbit .ob-it:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-orbit .ob-it.top { color: var(--c-texPri, #222); }
#c33-orbit .ob-it.sel { background: color-mix(in srgb, var(--ob-tint, var(--lm-accent, #2783de)) 13%, transparent); color: var(--c-texPri, #222); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ob-tint, var(--lm-accent, #2783de)) 26%, transparent); }
#c33-orbit .ob-it.empty:not(.sel) { opacity: .42 !important; }
#c33-orbit .ob-ic { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 19px; line-height: 1; }
#c33-orbit .ob-lb { max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 9.5px; font-weight: 600; letter-spacing: .01em; text-align: center; }
#c33-orbit:not(.exp):not(.pin) .ob-it .ob-lb[data-fit] { font-size: var(--ob-fs, 9.5px); text-overflow: clip; letter-spacing: 0; }
#c33-orbit:not(.exp):not(.pin) .ob-it .ob-lb[data-fit="2"] { white-space: normal; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-height: 1.08; hyphens: manual; -webkit-hyphens: manual; overflow-wrap: anywhere; }
#c33-orbit:not(.exp):not(.pin) .ob-it:has(.ob-lb[data-fit="2"]) { grid-template-rows: 22px auto; row-gap: 2px; }
#c33-orbit.exp .ob-it .ob-lb, html[data-c33-orbit-pin] #c33-orbit .ob-it .ob-lb { font-size: 12.5px; font-weight: 500; text-align: left; letter-spacing: .005em; }

/* ★完全修正版: 数字バッジの被り解消 (右上外側に完全独立配置) */
#c33-orbit .ob-ct { position: absolute; top: 4px; right: 6px; left: auto; min-width: 14px; height: 14px; padding: 0 4px; box-shadow: 0 0 0 1.5px var(--c-bacSec, #f7f6f3); border-radius: 999px; display: flex; align-items: center; justify-content: center; font: 600 9px/1 var(--c33-ui); font-variant-numeric: tabular-nums; background: color-mix(in srgb, var(--c-texPri, #000) 7%, transparent); color: var(--c-texSec, #777); z-index: 2; }
#c33-orbit .ob-ct:empty { display: none; }
#c33-orbit.exp .ob-ct, html[data-c33-orbit-pin] #c33-orbit .ob-ct { position: static; box-shadow: none; margin-left: auto; }

#c33-orbit .ob-ft { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 0 8px; flex: none; box-shadow: inset 0 1px 0 var(--ca-borSecTra, rgba(0,0,0,.06)); }
#c33-orbit .ob-ar { display: flex; justify-content: center; gap: 2px; }
#c33-orbit .ob-ft button { border: 0; background: transparent; color: inherit; cursor: pointer; width: 24px; height: 24px; border-radius: 7px; display: flex; align-items: center; justify-content: center; padding: 0; }
#c33-orbit .ob-ft button:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.06)); color: var(--c-texPri, #333); }
#c33-orbit .ob-ar svg { width: 14px; height: 14px; }
#c33-orbit .ob-ft .ob-set { position: relative; width: 36px; height: 32px; border-radius: 10px; }
#c33-orbit .ob-ft .ob-set svg { width: 18px; height: 18px; }
#c33-orbit .ob-ft .ob-set[aria-expanded="true"] { background: var(--ca-bacIntTra, rgba(0,0,0,.07)); color: var(--c-texPri, #333); }
#c33-orbit .ob-ft .ob-set[data-away]::after { content: ""; position: absolute; top: 5px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); box-shadow: 0 0 0 1.5px var(--c-bacSec, #f7f6f3); }
#c33-orbit .ob-empty { padding: 18px 6px; text-align: center; line-height: 1.6; font-size: 10px; }
#c33-orbit-btn { width: 32px; height: 32px; flex: none; border-radius: 999px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--c-icoSec, #91918e); transition: background-color .12s ease, color .12s ease; }
#c33-orbit-btn:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-orbit-btn[aria-pressed="true"] { color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); }
#c33-ob-set { position: fixed; z-index: 2147483300; width: 280px; max-height: calc(100vh - 16px); overflow-y: auto; padding: 6px; border-radius: 12px; background: var(--c-bacEle, #fff); color: var(--c-texPri, #333);
  box-shadow: var(--c-shaOutMd, 0 8px 28px rgba(0,0,0,.16)), 0 0 0 1px var(--ca-borSecTra, rgba(0,0,0,.06)); font: 13px/1.35 var(--c33-ui); font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; }
#c33-ob-set .os-h { padding: 8px 10px 4px; font-size: 11px; font-weight: 600; letter-spacing: .04em; color: var(--c-texTer, #999); }
#c33-ob-set hr { border: 0; height: 1px; background: var(--ca-borSecTra, rgba(0,0,0,.06)); margin: 5px 6px; }
#c33-ob-set button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 10px; border: 0; background: none; color: inherit; font: inherit; text-align: left; border-radius: 8px; cursor: pointer; }
#c33-ob-set button:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); }
#c33-ob-set .os-ws { padding: 8px 10px; }
#c33-ob-set .os-wi { width: 28px; height: 28px; flex: none; border-radius: 7px; display: flex; align-items: center; justify-content: center; overflow: hidden; font-weight: 600; background: var(--ca-bacIntTra, rgba(0,0,0,.05)); }
#c33-ob-set .os-wi :is(img, svg, .notion-record-icon) { width: 22px !important; height: 22px !important; max-width: none !important; }
#c33-ob-set .os-wn { flex: 1; min-width: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-ob-set .os-ic { width: 18px; height: 18px; flex: none; display: flex; align-items: center; justify-content: center; color: var(--c-icoSec, #91918e); }
#c33-ob-set .os-ic svg { width: 16px !important; height: 16px !important; fill: currentColor; }
#c33-ob-set .os-ic svg[fill="none"] { fill: none; }
#c33-ob-set .os-ck { color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); font-size: 13px; }
#c33-ob-set .os-t { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-ob-set small { display: block; font-size: 11px; font-weight: 400; color: var(--c-texTer, #999); overflow: hidden; text-overflow: ellipsis; }
#c33-ob-set .os-k { margin-left: auto; flex: none; font-size: 11px; color: var(--c-texTer, #999); display: flex; align-items: center; }
#c33-ob-set button.on { font-weight: 600; }
#c33-ob-set button.on .os-ic { color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); }
#c33-ob-set button.on::after { content: ""; width: 6px; height: 6px; border-radius: 50%; flex: none; background: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); }
#c33-ob-toast { position: fixed; z-index: 2147483300; left: 16px; bottom: 76px; max-width: 280px; padding: 10px 14px; border-radius: 12px; background: var(--c-bacEle, #fff); color: var(--c-texPri, #333);
  box-shadow: var(--c-shaOutMd, 0 8px 28px rgba(0,0,0,.16)); font: 12.5px/1.55 var(--c33-ui); font-feature-settings: "palt" 1; opacity: 0; transform: translateY(6px); transition: opacity .2s ease, transform .2s ease; pointer-events: none; }
#c33-ob-toast.on { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { #c33-orbit, #c33-orbit .ob-it, #c33-orbit .ob-all { transition: none !important; } }`;
  }

  /* ============================================================
   *  数学・ユーティリティ関数（これがないとOrbitが回転しません）
   * ============================================================ */
  const obMod = (x, n) => ((x % n) + n) % n;
  const obHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function obButton() {
    const tab = document.querySelector('.notion-sidebar-container [role="tablist"], .notion-sidebar [role="tablist"]');
    const row = tab && tab.parentElement;
    let b = document.getElementById('c33-orbit-btn');
    if (!row) return;
    if (!b) {
      b = document.createElement('div');
      b.id = 'c33-orbit-btn';
      b.setAttribute('role', 'button');
      b.tabIndex = 0;
      b.innerHTML = ICON_ORBIT;
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obToggle(); });
      b.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); obSettings(b); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obToggle(); } });
    }
    if (b.parentElement !== row) row.appendChild(b);
    b.setAttribute('aria-pressed', OB.on ? 'true' : 'false');
    b.title = (OB.on ? '大分類の輪（Orbit）をしまう' : '大分類の輪（Orbit）を出す') + ' ⌃⌥O ／ 右クリックで Settings';
  }
  function obToast(msg) {
    let t = document.getElementById('c33-ob-toast');
    if (!t) { t = document.createElement('div'); t.id = 'c33-ob-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('on'));
    clearTimeout(t.__t); t.__t = setTimeout(() => t.classList.remove('on'), 3200);
  }

  let obIx = 0;
  let obWheelEl = null, obAllEl = null, obSetBtn = null, obItemEls = [];
  let obRailW = 88;
  let obTopGid = '';
  let obLastFixT = 0, obLastDy = 0;
  let obSpaceEl = null, obSpaceKey = '', obCopies = [];
  let obLabelFont = 'inherit';
  let obDockSelection = false;
  const obStep = () => Math.max(30, OB.itemH || 54);
  const obFitCx = document.createElement('canvas').getContext('2d');

  function obFixSoon(ms) {
    clearTimeout(obSnapT);
    obSnapT = setTimeout(() => obFixLayout(false), ms == null ? 180 : ms);
  }

  function obIcPaint(el, g) {
    el.textContent = '';
    el.style.removeProperty('background-image');
    el.style.removeProperty('background-color');
    el.style.removeProperty('-webkit-mask-image');
    el.style.removeProperty('mask-image');
    if (g.txt) { el.textContent = g.txt; return; }
    if (g.mask && g.mask !== 'none') {
      el.style.backgroundColor = 'currentColor';
      el.style.webkitMaskImage = g.mask; el.style.maskImage = g.mask;
      el.style.webkitMaskSize = 'contain'; el.style.maskSize = 'contain';
      el.style.webkitMaskRepeat = 'no-repeat'; el.style.maskRepeat = 'no-repeat';
      el.style.webkitMaskPosition = 'center'; el.style.maskPosition = 'center';
      return;
    }
    if (g.bgi && g.bgi !== 'none') {
      el.style.backgroundImage = g.bgi;
      el.style.backgroundSize = 'contain';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
      return;
    }
    el.textContent = (g.label || '?').slice(0, 1);
  }

  function obRailWUpdate(gs) {
    const source = document.querySelector('#c16-root .c16-lbl') || obScroller() || obSide();
    const cs = source ? getComputedStyle(source) : null;
    obLabelFont = cs && cs.fontFamily ? cs.fontFamily : 'inherit';
    if (obEl) obEl.style.setProperty('font-family', obLabelFont, 'important');
    obFitCx.font = '600 9.5px ' + obLabelFont;
    obRailW = Math.max(76, ...gs.map(g => Math.ceil(obFitCx.measureText(g.label).width) + 18));
    document.documentElement.style.setProperty('--c33-rail-w', obRailW + 'px');
    if (obEl) obEl.style.setProperty('width', obRailW + 'px', 'important');
  }
  function obFitLabel(it, lb, name) {
    it.style.setProperty('--ob-fs', '9.5px');
    lb.setAttribute('data-fit', '1');
  }

  const ICON_SET2 = '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M3 3h14v3H3zm0 5.5h14v3H3zM3 14h14v3H3z"/><circle cx="7" cy="4.5" r="2.7"/><circle cx="13" cy="10" r="2.7"/><circle cx="8" cy="15.5" r="2.7"/></svg>';

  function obBuild() {
    const rail = document.createElement('div');
    rail.id = 'c33-orbit';
    rail.classList.remove('pin', 'exp');
    const all = document.createElement('div');
    all.className = 'ob-all';
    all.setAttribute('role', 'button'); all.tabIndex = 0;
    all.setAttribute('aria-label', 'ALL — 大分類の選択をやめる');
    const aic = document.createElement('div'); aic.className = 'ob-ic';
    const alb = document.createElement('div'); alb.className = 'ob-lb'; alb.textContent = 'ALL';
    all.append(aic, alb);
    all.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obSelect(''); });
    all.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obSelect(''); } });
    rail.appendChild(all); obAllEl = all;
    const wh = document.createElement('div'); wh.className = 'ob-wheel';
    wh.addEventListener('wheel', (e) => {
      e.preventDefault(); e.stopPropagation();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      /* v48: 向き — 指を上へ動かすと輪も上へ（逆にしたい時は 設定 › スクロールの向き） */
      if (d) { obNudge((OB.wheelRev !== false ? -1 : 1) * d * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? obStep() : 1)); }
    }, { passive: false });
    rail.appendChild(wh); obWheelEl = wh;
    const ft = document.createElement('div'); ft.className = 'ob-ft';
    const set = document.createElement('div');
    set.className = 'ob-set';
    set.setAttribute('role', 'button'); set.tabIndex = 0;
    set.setAttribute('aria-haspopup', 'menu'); set.setAttribute('aria-expanded', 'false');
    set.setAttribute('aria-label', 'Settings');
    const sic = document.createElement('div'); sic.className = 'ob-ic'; sic.innerHTML = ICON_SET2;
    const slb = document.createElement('div'); slb.className = 'ob-lb'; slb.textContent = 'Settings';
    set.append(sic, slb);
    set.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obSettings(set); });
    set.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); obSettings(set); });
    set.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obSettings(set); } });
    obSetBtn = set;
    ft.appendChild(set);
    rail.appendChild(ft);
    obEl = rail;
    obFill();
    return rail;
  }

  function obFill() {
    if (!obWheelEl) return;
    const gs = obGroups();
    const sig = gs.map((g) => g.gid + ':' + g.label).join('|');
    if (sig !== obSig) {
      obSig = sig;
      obRailWUpdate(gs);
      obCopies = [];
      obWheelEl.textContent = '';
      obItemEls = [];
      if (!gs.length) {
        const em = document.createElement('div'); em.className = 'ob-empty';
        em.textContent = '大分類（¹⁶ の★見出し）がまだありません。';
        obWheelEl.appendChild(em);
      }
      gs.forEach((g, i) => {
        const it = document.createElement('div');
        it.className = 'ob-it';
        it.__gid = g.gid;
        it.setAttribute('role', 'button'); it.tabIndex = 0;
        it.setAttribute('data-c33-gid', g.gid);
        it.setAttribute('aria-label', g.label + (g.cnt ? '（' + g.cnt + '）' : ''));
        if (g.cnt === '0') it.classList.add('empty');
        if (g.tint) it.style.setProperty('--ob-tint', g.tint);
        const ic = document.createElement('div'); ic.className = 'ob-ic'; obIcPaint(ic, g);
        const lb = document.createElement('div'); lb.className = 'ob-lb'; lb.textContent = g.label;
        obFitLabel(it, lb, g.label);
        it.append(ic, lb);
        if (g.cnt && g.cnt !== '0') { const ct = document.createElement('div'); ct.className = 'ob-ct'; ct.textContent = g.cnt; it.appendChild(ct); }
        it.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obJump(i); obSelect(g.gid); });
        it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obJump(i); obSelect(g.gid); } });
        obItemEls.push(it); obWheelEl.appendChild(it);
      });
      let ix = obItemEls.findIndex((el) => el.__gid === obTopGid);
      if (ix < 0) ix = gs.findIndex((g) => g.gid === OB.sel);
      obIx = ix >= 0 ? ix : 0;
      obTarget = obOff = obIx * obStep();
      obDockSelection = !!(obItemEls[obIx] && obItemEls[obIx].__gid === OB.sel);
    } else {
      obItemEls.forEach((el) => {
        const g = gs.find((x) => x.gid === el.__gid);
        if (!g) return;
        const ct = el.querySelector('.ob-ct');
        if (g.cnt && g.cnt !== '0') {
          if (ct) { if (ct.textContent !== g.cnt) ct.textContent = g.cnt; } else { const c = document.createElement('div'); c.className = 'ob-ct'; c.textContent = g.cnt; el.appendChild(c); }
          el.classList.remove('empty');
        } else { if (ct) ct.remove(); el.classList.add('empty'); }
        el.setAttribute('aria-label', g.label + (g.cnt ? '（' + g.cnt + '）' : ''));
      });
    }
    obLay();
  }

  function obLay() {
    if (!obWheelEl) return;
    const N = obItemEls.length, step = obStep();
    const H = obWheelEl.clientHeight || 0;
    if (!N) return;
    const cycle = N * step;
    obWheelEl.classList.toggle('ob-docked', obDockSelection && Math.abs(obTarget - obOff) < 0.001);
    const paint = (el, y, gid) => {
      const visible = y > -step && y < H + step;
      el.style.display = visible ? '' : 'none';
      el.style.transform = 'translateY(' + y.toFixed(3) + 'px)';
      el.style.opacity = '';
      el.style.zIndex = '1';
      el.classList.toggle('top', y >= 0 && y < step);
      el.classList.toggle('sel', !!OB.sel && gid === OB.sel);
    };
    const needed = [];
    obItemEls.forEach((el, k) => {
      const y = obMod(k * step - obOff + step, cycle) - step;
      paint(el, y, el.__gid);
      for (let yy = y + cycle; yy < H + step; yy += cycle) needed.push({ k, y: yy });
    });
    while (obCopies.length > needed.length) obCopies.pop().remove();
    needed.forEach((v, j) => {
      let el = obCopies[j];
      const src = obItemEls[v.k];
      if (!el || el.__gid !== src.__gid) {
        if (el) el.remove();
        el = src.cloneNode(true); el.__gid = src.__gid;
        el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); obJump(v.k); obSelect(src.__gid); });
        el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obJump(v.k); obSelect(src.__gid); } });
        obCopies[j] = el; obWheelEl.appendChild(el);
      }
      paint(el, v.y, src.__gid);
    });
    if (obAllEl) obAllEl.classList.toggle('sel', !OB.sel);
  }

  function obGlide() {
    if (obRaf) return;
    const tick = () => {
      const d = obTarget - obOff;
      if (Math.abs(d) < 0.5) { obOff = obTarget; obRaf = 0; obLay(); return; }
      obOff += d * 0.28;
      obLay();
      obRaf = requestAnimationFrame(tick);
    };
    obRaf = requestAnimationFrame(tick);
  }

  function obNudge(dpx) {
    if (!obItemEls.length) return;
    obDockSelection = false;
    obTarget += dpx;
    obIx = obMod(Math.round(obTarget / obStep()), obItemEls.length);
    obTopGid = obItemEls[obIx] ? obItemEls[obIx].__gid : '';
    obGlide();
  }

  function obRotate(d) { obNudge(d * obStep()); }

  function obJump(i) {
    if (!obItemEls.length) return;
    obIx = obMod(i, obItemEls.length);
    obTopGid = obItemEls[obIx] ? obItemEls[obIx].__gid : '';
    const cycle = obItemEls.length * obStep();
    obDockSelection = true;
    const goal = obIx * obStep();
    obTarget = obOff + obMod(goal - obOff + cycle / 2, cycle) - cycle / 2;
    obGlide();
  }

  /* v48: 選んだ大分類が ¹⁶ で畳まれていたら開く（¹⁶ は sandbox の外なので unsafeWindow から） */
  function obUnfold(gid) {
    if (!gid) return;
    const sec = document.querySelector('#c16-root .c16-sec[data-c16-g="' + CSS.escape(gid) + '"]');
    if (!sec || sec.getAttribute('data-c16-state') !== 'collapsed') return;
    try { const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window; if (W.__c16 && W.__c16.toggle) W.__c16.toggle(gid); } catch (e) { /* noop */ }
  }
  function obSelect(gid) {
    OB.sel = gid || '';
    obUnfold(OB.sel);
    obSave();
    obCss();
    schedule(0);
    obFixSoon(60);
    obPopClose();
  }

  function obFixSet() {
    obSave();
    const de = document.documentElement;
    if (OB.fix) de.style.setProperty('--c33-rail-fix', OB.fix + 'px');
    else de.style.removeProperty('--c33-rail-fix');
  }

  function obHostPick() { return obFindHost() || obSide(); }
  let obSidebarShown = null;
  function obSidebarVisible(side) {
    if (!side || !side.isConnected) return false;
    const r = side.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1 || r.right <= 1 || r.bottom <= 1 ||
        r.left >= window.innerWidth - 1 || r.top >= window.innerHeight - 1) return false;
    for (let el = side; el && el !== document.documentElement; el = el.parentElement) {
      const cs = getComputedStyle(el);
      if (el.hidden || el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('inert') ||
          cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse' ||
          (cs.opacity !== '' && Number(cs.opacity) === 0) || cs.contentVisibility === 'hidden') return false;
    }
    return true;
  }
  function obSyncSidebar() {
    if (!obEl) return false;
    const shown = !!OB.on && obSidebarVisible(obSide());
    if (shown !== obSidebarShown) {
      obSidebarShown = shown;
      if (shown) {
        obEl.style.removeProperty('display');
        obEl.style.removeProperty('pointer-events');
        obEl.removeAttribute('aria-hidden');
        obEl.removeAttribute('inert');
        obSpaceKey = ''; obAnchor(); obLay();
      } else {
        obEl.style.setProperty('display', 'none', 'important');
        obEl.style.setProperty('pointer-events', 'none', 'important');
        obEl.setAttribute('aria-hidden', 'true');
        obEl.setAttribute('inert', '');
        obPopClose();
      }
    }
    return shown;
  }
  function obWatchSidebar() {
    setInterval(obSyncSidebar, 100);
    let pending = false;
    const observer = new MutationObserver(records => {
      if (records.every(r => r.target === obEl || (obEl && obEl.contains(r.target)))) return;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; obSyncSidebar(); });
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true,
      attributeFilter: ['style', 'class', 'hidden', 'aria-hidden', 'inert'] });
    window.addEventListener('resize', obSyncSidebar);
    obSyncSidebar();
  }

  function obAnchor() {
    if (!obEl) return;
    const side = obSide(); if (!side) return;
    const r = side.getBoundingClientRect();
    for (const [k, v] of Object.entries({ left: r.left + 'px', top: r.top + 'px', height: r.height + 'px', width: obRailW + 'px' })) {
      if (obEl.style.getPropertyValue(k) !== v) obEl.style.setProperty(k, v, 'important');
    }
    obReserveSpace(side, r);
  }
  function obReserveSpace(side, r) {
    const sc = obScroller(); if (!sc) return;
    const key = [r.left, r.width, obRailW].join(':');
    if (sc === obSpaceEl && key === obSpaceKey) return;
    if (obSpaceEl) obSpaceEl.removeAttribute('data-c33-space');
    document.querySelectorAll('[data-c33-sh],[data-c33-host]').forEach(el => {
      el.removeAttribute('data-c33-sh'); el.removeAttribute('data-c33-host');
    });
    sc.removeAttribute('data-c33-space');
    const rect = sc.getBoundingClientRect();
    const baseMargin = parseFloat(getComputedStyle(sc).marginInlineStart) || 0;
    const delta = Math.max(0, Math.ceil(r.left + obRailW + 8 - rect.left));
    sc.style.setProperty('--c33-space-delta', delta + 'px');
    sc.style.setProperty('--c33-space-margin', (baseMargin + delta) + 'px');
    sc.setAttribute('data-c33-space', '1');
    obSpaceEl = sc; obSpaceKey = key;
  }

  function obToggle() { obApply(!OB.on); }
  function obApply(on, quiet) {
    OB.on = !!on; obSave();
    obCss();
    const de = document.documentElement;
    if (OB.on) {
      const host = obHostPick();
      if (!host) { if (!quiet) obToast('サイドバーが見つかりません。開くと置き直します。'); obButton(); return; }
      obHost = host;
      if (!obEl) obBuild();
      if (obEl.parentElement !== document.body) document.body.appendChild(obEl);
      obAnchor();
      obSidebarShown = null;
      obSyncSidebar();
      obMarkRows();
      obFill();
      obFixLayout(true);
      if (!quiet) obToast('大分類の輪を出しました（⌃⌥O でしまう・⌃⌥, で Settings）');
    } else {
      obSidebarShown = null;
      obSyncSidebar();
      if (obSpaceEl) obSpaceEl.removeAttribute('data-c33-space');
      obSpaceEl = null; obSpaceKey = '';
      de.style.removeProperty('--c33-rail-fix');
      de.style.removeProperty('--c33-top-dy');
      obLastDy = 0;
      document.querySelectorAll('[data-c33-sh]').forEach((el) => el.removeAttribute('data-c33-sh'));
      document.querySelectorAll('[data-c33-host]').forEach((el) => el.removeAttribute('data-c33-host'));
      document.querySelectorAll('[data-c33-tabrow]').forEach((el) => el.removeAttribute('data-c33-tabrow'));
      document.querySelectorAll('[data-c33-wsrow]').forEach((el) => el.removeAttribute('data-c33-wsrow'));
      document.querySelectorAll('[data-c33-topfix]').forEach((el) => el.removeAttribute('data-c33-topfix'));
      de.removeAttribute('data-c33-orbit-pin');
      obPopClose();
      if (!quiet) obToast('輪をしまいました（上の段の輪のぼたんで出し直せます）');
    }
    obButton();
  }

  function obFixLayout(force) {
    if (!OB.on || !obEl || !obSyncSidebar()) return;
    const now = Date.now();
    if (!force && obLastFixT && now - obLastFixT < 300) return;
    obLastFixT = now;
    const side = obSide(); if (!side) return;
    const host = obHostPick();
    if (!host) return;
    if (obHost !== host || obEl.parentElement !== document.body) {
      obHost = host;
      if (obEl.parentElement !== document.body) document.body.appendChild(obEl);
      obAnchor();
    }
    obMarkRows();
    document.documentElement.removeAttribute('data-c33-orbit-pin');
    obAnchor();
    const sc = obScroller();
    if (sc && obAllEl) {
      const de = document.documentElement;
      const cur = parseFloat(de.style.getPropertyValue('--c33-top-dy')) || 0;
      const ab = obAllEl.getBoundingClientRect().bottom;
      const st = sc.getBoundingClientRect().top - cur;
      const dy = Math.max(0, Math.round(ab - st + 6));
      if (Math.abs(dy - obLastDy) >= 1) {
        obLastDy = dy;
        de.style.setProperty('--c33-top-dy', dy + 'px');
        OB.topDy = dy; obSave();
      }
    }
    if (obSetBtn) obSetBtn.toggleAttribute('data-away', !obAtHome());
    obLay();
  }

  function obPopClose() {
    const pop = document.getElementById('c33-ob-set');
    if (pop) pop.style.display = 'none';
    if (obSetBtn) obSetBtn.setAttribute('aria-expanded', 'false');
  }
  function obPopRow(pop, o) {
    const b = document.createElement('button');
    if (o.on) b.classList.add('on');
    const ic = document.createElement('span'); ic.className = 'os-ic';
    if (o.ico) obIcPaint(ic, o.ico);
    const t = document.createElement('span'); t.className = 'os-t'; t.textContent = o.t;
    if (o.sub) { const sm = document.createElement('small'); sm.textContent = o.sub; t.appendChild(sm); }
    b.append(ic, t);
    if (o.key) { const k = document.createElement('span'); k.className = 'os-k'; k.textContent = o.key; b.appendChild(k); }
    else if (o.on) { const k = document.createElement('span'); k.className = 'os-ck'; k.textContent = '✓'; b.appendChild(k); }
    b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); o.fn(); });
    pop.appendChild(b);
    return b;
  }
  function obSettings(anchor) {
    let pop = document.getElementById('c33-ob-set');
    if (!pop) { pop = document.createElement('div'); pop.id = 'c33-ob-set'; pop.setAttribute('role', 'menu'); document.body.appendChild(pop); }
    pop.textContent = '';
    const H = (tx) => { const h = document.createElement('div'); h.className = 'os-h'; h.textContent = tx; pop.appendChild(h); };
    const HR = () => pop.appendChild(document.createElement('hr'));
    H('大分類');
    const gs = obGroups();
    obPopRow(pop, { t: 'ALL — 全部を出す', sub: gs.length ? gs.length + ' 分類' : '', on: !OB.sel, fn: () => { obSelect(''); } });
    gs.forEach((g) => obPopRow(pop, { t: g.label, sub: g.cnt ? g.cnt + ' 件' : '', ico: g, on: OB.sel === g.gid, fn: () => { obSelect(g.gid); } }));
    HR();
    H('輪（Orbit）');
    obPopRow(pop, { t: '輪をしまう／出す', sub: OB.on ? 'いま出ています' : 'いま閉じています', key: '⌃⌥O', fn: () => { obPopClose(); obToggle(); } });
    obPopRow(pop, { t: 'スクロールの向きを逆に', sub: OB.wheelRev !== false ? '指を上へ → 輪も上へ' : '指を上へ → 輪は下へ（Mac のナチュラルと同じ）', on: OB.wheelRev !== false, fn: () => { OB.wheelRev = OB.wheelRev === false; obSave(); obSettings(anchor); } });
    obPopRow(pop, { t: '上の段（Home など）を隠す', on: OB.tabs !== false, fn: () => { OB.tabs = OB.tabs === false; obSave(); obCss(); obSettings(anchor); } });
    obPopRow(pop, { t: 'ワークスペース名の段を隠す', on: OB.ws !== false, fn: () => { OB.ws = OB.ws === false; obSave(); obCss(); obSettings(anchor); } });
    obPopRow(pop, { t: '空の大分類', sub: OB.hideEmpty ? '0 の分類を出さない' : '0 は薄く出る', on: !!OB.hideEmpty, fn: () => { OB.hideEmpty = !OB.hideEmpty; obSave(); obSig = ''; obFill(); obSettings(anchor); } });
    const adjw = document.createElement('div');
    adjw.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 10px 6px;';
    const adjl = document.createElement('span'); adjl.style.cssText = 'flex:1;min-width:0;'; adjl.textContent = '右への寄せ（px）';
    const mkA = (lb, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = lb; b.style.cssText = 'width:auto;padding:2px 8px;flex:none;'; b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }); return b; };
    adjw.append(adjl,
      mkA('−', () => { OB.fix = Math.max(-20, (OB.fix || 0) - 2); obFixSet(); }),
      mkA('＋', () => { OB.fix = Math.min(60, (OB.fix || 0) + 2); obFixSet(); }),
      mkA('0', () => { OB.fix = 0; obFixSet(); }));
    pop.appendChild(adjw);
    HR();
    H('まわり');
    const wi = obWsInfo();
    const wb = document.createElement('button');
    const wic = document.createElement('span'); wic.className = 'os-wi';
    if (wi.icon) wic.innerHTML = wi.icon; else wic.textContent = (wi.name || '?').slice(0, 1);
    const wnm = document.createElement('span'); wnm.className = 'os-wn'; wnm.textContent = wi.name;
    const wkb = document.createElement('span'); wkb.className = 'os-ic'; wkb.textContent = '⇄';
    wb.append(wic, wnm, wkb);
    wb.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); obPopClose(); obWsMenu(); });
    pop.appendChild(wb);
    H('移動');
    obTabs().forEach(t => obPopRow(pop, { t: t.name, on: t.on, fn: () => { obPopClose(); obPress(t.el); } }));
    H('Notion の設定');
    NSET.forEach((n) => obPopRow(pop, { t: n.label, sub: n.ja, fn: () => { obPopClose(); obNotionSettings(n.tab); } }));
    HR();
    obPopRow(pop, { t: '³³ をしまう（一時オフ）', sub: '上の段の輪のぼたんで出し直せます', fn: () => { obPopClose(); obApply(false); } });
    pop.style.display = '';
    const an = anchor || obSetBtn || obEl || document.body;
    const r = an.getBoundingClientRect ? an.getBoundingClientRect() : { left: 0, right: 60, top: 100 };
    const pw = pop.offsetWidth || 280, ph = pop.offsetHeight || 320;
    let x = (r.right || 60) + 10;
    if (x + pw > window.innerWidth - 8) x = (r.left || 0) - pw - 10;
    x = Math.max(8, Math.min(window.innerWidth - pw - 8, x));
    const y = Math.max(8, Math.min(window.innerHeight - ph - 8, r.top || 100));
    pop.style.left = Math.round(x) + 'px';
    pop.style.top = Math.round(y) + 'px';
    if (obSetBtn && an === obSetBtn) obSetBtn.setAttribute('aria-expanded', 'true');
  }

  function obWire() {
    document.addEventListener('keydown', (e) => {
      const pop = document.getElementById('c33-ob-set');
      if (e.key === 'Escape' && pop && pop.style.display !== 'none') { e.preventDefault(); e.stopPropagation(); obPopClose(); return; }
      if (e.target && e.target.closest && e.target.closest('input, textarea, [contenteditable="true"]')) return;
      if (!((e.metaKey || e.ctrlKey) && e.altKey)) return;
      const k = (e.key || '').toLowerCase();
      if (k === 'o') { e.preventDefault(); e.stopPropagation(); obToggle(); }
      else if (e.code === 'Comma') { e.preventDefault(); e.stopPropagation(); obSettings(obSetBtn || obEl); }
      else if (OB.on && e.code === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); obRotate(-1); }
      else if (OB.on && e.code === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); obRotate(1); }
    }, true);
    document.addEventListener('pointerdown', (e) => {
      const pop = document.getElementById('c33-ob-set');
      if (!pop || pop.style.display === 'none') return;
      const t = e.target;
      if (pop.contains(t)) return;
      if (obSetBtn && obSetBtn.contains(t)) return;
      if (obEl && obEl.contains(t)) return;
      obPopClose();
    }, true);
    window.addEventListener('resize', () => { obSig = ''; obFill(); obFixSoon(120); });
  }

  function obBoot() {
    OB.pin = false; OB.full = true; OB.fix = 0; OB.topDy = 0; obSave();
    document.documentElement.style.removeProperty('--c33-rail-fix');
    document.documentElement.style.removeProperty('--c33-top-dy');
    obWire();
    obCss();
    obButton();
    obApply(OB.on !== false, true);
    obWatchSidebar();
    obFixSoon(400);
    [800, 2500].forEach((t) => setTimeout(() => obUnfold(OB.sel), t));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (obEl) { obRailWUpdate(obGroups()); obSpaceKey = ''; obAnchor(); } });
    setTimeout(() => { try { if (OB.on && (!obEl || !obEl.isConnected)) obApply(true, true); } catch (e) {} }, 1500);
    setInterval(() => {
      try {
        if (!OB.on) return;
        const h = obHostPick();
        if (!h) { obSyncSidebar(); return; }
        if (!obEl || !obEl.isConnected || obEl.parentElement !== document.body) { obApply(true, true); return; }
        obFill();
        obFixSoon(0);
      } catch (e) {}
    }, 2000);
  }

  /* ============================================================
   *  B.U.R.I ('-' 鰤)з の頭脳（本棚案内 + 最高精度 Google Web 検索）
   * ============================================================ */
  const BURI = (() => {
    const LS_BURI = 'c33.buri.v1';
    const LS_BURI_LEARN = 'c33.buri.learn.v1';
    const MAX_RECORDS = 10000, MAX_BYTES = 5 * 1024 * 1024, MAX_SAVE = 3.5 * 1024 * 1024, PAGE = 6;
    const FIELD = { title: 'タイトル', author: '著者', type: '種別', tags: '分類', synopsis: 'あらすじ', status: '状態', series: 'シリーズ', pron: '読み', seq: '巻', no: 'No.' };
    const FACET_JA = { author: '著者', series: 'シリーズ', tags: '分類', type: '種別' };
    const HEADERS = {
      title: ['title', 'name', '名前', 'タイトル', '作品名', 'works', 'work'],
      author: ['author', 'authors', '著者', '作者', 'creators', 'creator'],
      type: ['type', '媒体', '種別'],
      tags: ['tags', 'genre', 'ジャンル', 'タグ', '分類', 'grouping'],
      synopsis: ['synopsis', 'あらすじ', '説明'],
      url: ['url', 'リンク'],
      status: ['status', '状態', '読了'],
      series: ['series', 'シリーズ'],
      pron: ['pron', 'pron.', '読み'],
      seq: ['seq', 'seq.', '巻', '巻数', '順番'],
      no: ['no', 'no.', '番号']
    };
    const STATES = {
      '未読': ['未読', 'unread', 'not started', '未着手'],
      '読書中': ['読書中', 'reading', 'in progress', '進行中', '読みかけ'],
      '読了': ['読了', '既読', '完読', 'read', 'done', 'finished', '完了']
    };
    const ST_RE = [
      ['未読', /(未読|まだ読んでない|まだ読んでいない|読んでない|読んでいない|unread)/u],
      ['読書中', /(読書中|読んでる途中|読んでいる途中|読みかけ|reading)/u],
      ['読了', /(読了|既読|完読|読み終わった|読み終えた|読んだ|\bread\b)/u]
    ];
    const ALIAS = [['ライトノベル', 'ラノベ'], ['マンガ', '漫画', 'まんが', 'コミック'], ['小説', 'ノベル']];
    const RE = {
      greet: /^(こんにちは|こんばんは|おはよう(ございます)?|やあ|はじめまして|hello|hi|hey|ぶりさん|鰤さん|ぶり)$/u,
      thanks: /^(ありがとう(ございます)?|ありがと|サンキュー|thanks|thank you|助かった|たすかった)/u,
      help: /^(help|ヘルプ|使い方|つかいかた|何ができる|なにができる|できること|どう使う)/u,
      more: /^(他には|ほかには|他に|ほかに|他は|ほかは|もっと|まだある|続きを?見せて|つづき|次の候補|more)(ある|見せて|みせて|ない|は)?$/u,
      next: /(次の巻|つぎの巻|次巻|続編|の次|次は)/u,
      prev: /(前の巻|まえの巻|前巻|前作|ひとつ前|一つ前|の前)/u,
      syn: /(あらすじ|どんな話|どんなお話|内容|概要|ストーリー)/u,
      who: /(作者|著者|誰が書|だれが書|書いた人|作家は)/u,
      count: /(何冊|何件|なんさつ|なんけん|いくつ|何作|件数|冊数|全部で|合計)/u,
      rec: /(おすすめ|オススメ|お勧め|お薦め|何か読|なにか読|読みたい|よみたい|選んで|えらんで|ランダム|適当に|てきとうに)/u,
      all: /(全部|ぜんぶ|全巻|一覧|リスト|すべて|全て|順番|順に)/u,
      ref: /^(それ|その本|その作品|その|これ|この本|この|あれ|あの)/u
    };
    const STRIP = [
      /(について|に関して|ってなに|って何|とは)/gu,
      /(あらすじ|どんな話|どんなお話|内容|概要|ストーリー)/gu,
      /(作者|著者|誰が書いた|だれが書いた|誰が書|だれが書|書いた人|作家)/gu,
      /(何冊|何件|なんさつ|なんけん|いくつ|何作|件数|冊数|全部で|合計)/gu,
      /(おすすめ|オススメ|お勧め|お薦め|何か|なにか|読みたい|よみたい|選んで|えらんで|ランダム|適当に|てきとうに)/gu,
      /(全部|ぜんぶ|全巻|一覧|リスト|すべて|全て|順番|順に)/gu,
      /(次の巻|つぎの巻|次巻|続編|の次|次は|前の巻|まえの巻|前巻|前作|ひとつ前|一つ前|の前)/gu,
      /(探して|さがして|教えて|おしえて|見せて|みせて|出して|だして|ください|下さい|ちょうだい|ほしい|欲しい|知りたい|ありますか|あります|ある|ないかな|ない|かな|ですか|です|だっけ)/gu,
      /(の|な)?(本|書籍|作品)(?=$|\s|を|が|は|で|に|も|って|ある|ない)/gu
    ];

    const nz = (s) => String(s == null ? '' : s).normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim();
    const num = (s) => { const m = /-?\d+(?:\.\d+)?/.exec(nz(s)); return m ? parseFloat(m[0]) : NaN; };
    const uniq = (a) => [...new Set(a)];
    const splitList = (s, nl) => String(s || '').split(nl ? /[,;|、\n]+/u : /[,;|、]+/u).map((x) => x.replace(/\s+/gu, ' ').trim()).filter(Boolean);
    const trimP = (s) => { let p; do { p = s; s = s.replace(/^[\s ]*(の|を|が|は|で|に|も|と|や|って|から)+/u, '').replace(/(の|を|が|は|で|に|も|と|や|って|から|な)+[\s ]*$/u, '').trim(); } while (s !== p); return s; };

    let records = [], info = { mapping: [], fields: [], missing: [], warnings: [] };
    let TITLES = [], VOC = [], lastSrc = null, persisted = false;
    const ctx = { hits: [], shown: 0, label: '', last: null, ask: '' };
    const resetCtx = () => { ctx.hits = []; ctx.shown = 0; ctx.label = ''; ctx.last = null; ctx.ask = ''; };

    let userPref = { authors: {}, tags: {} };
    try { const o = JSON.parse(localStorage.getItem(LS_BURI_LEARN) || '{}'); if (o.authors) userPref = o; } catch(e) {}
    function savePref() { try { localStorage.setItem(LS_BURI_LEARN, JSON.stringify(userPref)); } catch(e) {} }
    function learnFacet(type, val) {
      if (!val) return;
      if (!userPref[type]) userPref[type] = {};
      userPref[type][val] = (userPref[type][val] || 0) + 1;
      savePref();
    }
    function getTopLearned(type) {
      return Object.entries(userPref[type] || {}).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    }

    function safeURL(raw) {
      try {
        const u = new URL(String(raw).trim());
        if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return '';
        if (!['notion.so', 'notion.site', 'notion.com'].some((h) => u.hostname === h || u.hostname.endsWith('.' + h))) return '';
        return u.href;
      } catch (e) { return ''; }
    }
    function relationValue(raw, key) {
      const links = []; let boundary = 0;
      const text = raw.replace(/\((https:\/\/[^\s()]+)\)/gu, (whole, url, offset) => {
        const safe = safeURL(url); if (!safe) return whole;
        const prefix = raw.slice(boundary, offset);
        const name = (key === 'synopsis' ? prefix : prefix.split(/[,;|、]+/u).pop()).replace(/\s+/gu, ' ').trim();
        if (!links.some((l) => l.url === safe)) links.push({ key, label: FIELD[key], name, url: safe });
        boundary = offset + whole.length; return '';
      });
      const display = links.length ? text.replace(/\s+/gu, ' ').replace(/\s+([,;|、])/gu, '$1') : text;
      return { text: display.trim(), links };
    }
    function parseCSV(text) {
      const rows = []; let row = [], value = '', mode = 'start';
      function cell() { row.push(value); value = ''; mode = 'start'; }
      function line() { cell(); if (row.some((v) => v.trim())) rows.push(row); row = []; if (rows.length > MAX_RECORDS + 1) throw new Error('上限は 10000 件です。'); }
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (mode === 'quoted') {
          if (c === '"') { if (text[i + 1] === '"') { value += '"'; i++; } else mode = 'closed'; }
          else value += c;
        } else if (c === ',') cell();
        else if (c === '\r' || c === '\n') { if (c === '\r' && text[i + 1] === '\n') i++; line(); }
        else if (mode === 'closed') throw new Error('CSV の引用符の後に、余計な文字があります。');
        else if (c === '"') { if (mode !== 'start') throw new Error('CSV の引用符の位置がおかしいです。'); mode = 'quoted'; }
        else { value += c; mode = 'plain'; }
      }
      if (mode === 'quoted') throw new Error('CSV の引用符が閉じていません。');
      if (value || row.length || mode !== 'start') line();
      if (!rows.length) throw new Error('CSV に見出しの行がありません。');
      const keys = rows.shift();
      const data = rows.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] == null ? '' : r[i]])));
      Object.defineProperty(data, '_headers', { value: keys });
      return data;
    }
    function describe(keys) {
      const mapping = [];
      for (const src of keys) for (const [key, names] of Object.entries(HEADERS)) if (names.includes(nz(src))) mapping.push({ source: src, key, label: FIELD[key] || '作品URL' });
      const fields = uniq(mapping.map((m) => m.key));
      const NOTE = {
        author: '著者の列が無いので、著者では探せません。',
        series: 'シリーズの列が無いので、「次の巻」は答えられません。',
        seq: '巻の番号（Seq.）の列が無いので、シリーズは題名の順に並べます。',
        tags: '分類（Grouping など）の列が無いので、ジャンルでは探せません。',
        synopsis: 'あらすじの列が無いので、あらすじは答えられません。',
        status: '状態（読了など）の列が無いので、おすすめは全部の中から選びます。',
        url: '作品ページの URL の列が無いので、カードからは Notion の純正検索へ渡します。'
      };
      const missing = ['author', 'series', 'seq', 'tags', 'synopsis', 'status', 'url'].filter((k) => !fields.includes(k));
      return { mapping, fields, missing, warnings: missing.map((k) => NOTE[k]) };
    }
    function parseImport(text, filename) {
      text = String(text == null ? '' : text).replace(/^\uFEFF/, '');
      if (new Blob([text]).size > MAX_BYTES) throw new Error('ファイルの上限は 5MB です。');
      if (!text.trim()) throw new Error('ファイルが空です。');
      const isJson = /\.json$/i.test(filename || '') || /^\s*[\[{]/.test(text);
      let rows = isJson ? JSON.parse(text) : parseCSV(text);
      if (isJson && rows && !Array.isArray(rows) && Array.isArray(rows.records)) rows = rows.records;
      if (!Array.isArray(rows)) throw new Error('JSON はレコードの配列（[ {...}, ... ]）にしてください。');
      if (rows.length > MAX_RECORDS) throw new Error('上限は 10000 件です。');
      if (!rows.length) throw new Error('本のデータが 1 件もありません。');
      const keys = new Set(rows._headers || []);
      const out = [], seenU = new Set(), seenN = new Set();
      let rejected = 0, dup = 0, unsafe = 0;
      for (const row of rows) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) { rejected++; continue; }
        Object.keys(row).forEach((k) => keys.add(k));
        const ent = Object.entries(row).map(([k, v]) => [nz(k), v]);
        const r = { _raw: {}, _relations: [] };
        for (const [key, names] of Object.entries(HEADERS)) {
          const vals = ent.filter(([k]) => names.includes(k)).map(([, v]) => v);
          let v = vals.find((x) => x != null && String(x).trim() !== '');
          if (v == null) v = '';
          if (Array.isArray(v)) v = v.map((x) => (x && typeof x === 'object' ? (x.name || x.title || '') : x)).filter((x) => x !== '' && x != null).join(', ');
          else if (typeof v === 'boolean') v = key === 'status' ? (v ? '読了' : '') : String(v);
          else if (typeof v === 'object') v = v.name || v.title || '';
          v = String(v);
          if (key === 'status' && /^(yes|true|はい|✓|✔)$/i.test(v.trim())) v = '読了';
          if (key === 'status' && /^(no|false|いいえ)$/i.test(v.trim())) v = '';
          r._raw[key] = v;
          r[key] = v.trim();
          if (['author', 'tags', 'series', 'synopsis', 'type'].includes(key)) { const rel = relationValue(r[key], key); r[key] = rel.text; r._relations.push(...rel.links); }
        }
        if (!r.title) { rejected++; continue; }
        const rawU = r.url; r.url = rawU ? safeURL(rawU) : ''; if (rawU && !r.url) unsafe++;
        const nk = nz(r.title) + '\u0000' + nz(r.author) + '\u0000' + nz(r.seq);
        if (r.url ? seenU.has(r.url) : seenN.has(nk)) { dup++; continue; }
        if (r.url) seenU.add(r.url); else seenN.add(nk);
        r._norm = {}; Object.keys(FIELD).forEach((k) => { r._norm[k] = nz(r[k]); });
        r._authorsD = splitList(r.author, true); r._authors = r._authorsD.map(nz);
        const grouping = ent.some(([k]) => k === 'grouping');
        r._catD = { type: splitList(r.type, true), tags: splitList(r.tags, !grouping) };
        r._categories = { type: r._catD.type.map(nz), tags: r._catD.tags.map(nz) };
        r._seq = num(r.seq); r._no = num(r.no);
        out.push(r);
      }
      if (!out.length) throw new Error('題名（Works / タイトル など）の列が見つからないか、すべて空です（題名なし ' + rejected + ' 件）。');
      return { records: out, rejected, dup, unsafe, info: describe([...keys]) };
    }
    function build() {
      const tmap = new Map();
      for (const r of records) { const k = r._norm.title; if (k.length < 2) continue; if (!tmap.has(k)) tmap.set(k, []); tmap.get(k).push(r); }
      TITLES = [...tmap].map(([k, rs]) => ({ k, rs })).sort((a, b) => b.k.length - a.k.length);
      const vm = new Map();
      const add = (f, d) => { const k = nz(d); if (k.length < 2) return; let v = vm.get(k); if (!v) vm.set(k, v = { k, d: String(d).trim(), fs: new Set() }); v.fs.add(f); };
      for (const r of records) {
        r._authorsD.forEach((a) => add('author', a));
        if (r.series) add('series', r.series);
        r._catD.tags.forEach((t) => add('tags', t));
        r._catD.type.forEach((t) => add('type', t));
      }
      VOC = [...vm.values()].sort((a, b) => b.k.length - a.k.length);
    }
    function importText(text, filename, fromSaved) {
      try {
        const p = parseImport(text, filename);
        records = p.records; info = p.info; build(); resetCtx();
        lastSrc = { text: String(text), name: filename || '' };
        let msg = records.length + ' 件を取り込みました（除外: 題名なし ' + p.rejected + ' 件・重複 ' + p.dup + ' 件' + (p.unsafe ? '・Notion 以外の URL ' + p.unsafe + ' 件はリンクを外しました' : '') + '）。';
        if (info.mapping.length) msg += '\n分かった列: ' + info.mapping.map((m) => m.source + '→' + m.label).join('、') + '。';
        if (info.warnings.length) msg += '\n' + info.warnings.join('\n');
        if (persisted && !fromSaved) { const s = save(); msg += '\n' + (s.ok ? '端末の保存も新しい本棚に置き換えました。' : s.message); }
        return { ok: true, count: records.length, message: msg, ...info };
      } catch (e) {
        return { ok: false, message: '取り込みに失敗しました。前の本棚はそのままです。' + String(e && e.message || e) };
      }
    }
    function save() {
      if (!lastSrc) return { ok: false, message: '保存する本棚がありません。先に取り込んでください。' };
      const size = new Blob([lastSrc.text]).size;
      if (size > MAX_SAVE) return { ok: false, message: '大きすぎて端末に保存できません（' + (size / 1048576).toFixed(1) + 'MB・上限 3.5MB）。この実行の間だけ使えます。' };
      try {
        localStorage.setItem(LS_BURI, JSON.stringify({ v: 1, name: lastSrc.name, text: lastSrc.text, t: Date.now() }));
        persisted = true;
        return { ok: true, message: 'この端末（このブラウザ）に保存しました。次からは自動で読み込みます。外には送っていません。' };
      } catch (e) { return { ok: false, message: '保存できませんでした（ブラウザの保存領域がいっぱいかもしれません）。' }; }
    }
    function forget() {
      try { localStorage.removeItem(LS_BURI); } catch (e) { /* noop */ }
      persisted = false;
      return { ok: true, message: '端末に保存していた本棚を消しました。いま読み込んでいる分は、再読み込みまで使えます。' };
    }
    function clear() {
      records = []; lastSrc = null; info = { mapping: [], fields: [], missing: [], warnings: [] }; build(); resetCtx();
      return { ok: true, message: persisted ? '本棚を外しました（端末の保存は残っています。消すなら「保存を消す」）。' : '本棚を外しました。' };
    }
    function restore() {
      try {
        const s = JSON.parse(localStorage.getItem(LS_BURI) || 'null');
        if (!s || !s.text) return false;
        const r = importText(s.text, s.name, true);
        persisted = !!r.ok;
        return r.ok;
      } catch (e) { return false; }
    }

    const inCat = (r, k) => r._categories.tags.includes(k) || r._categories.type.includes(k) || r._norm.tags.includes(k) || r._norm.type.includes(k);
    const termHit = (r, t) => [...t.fs].some((f) => f === 'author' ? r._authors.some((a) => a === t.k || a.includes(t.k)) : f === 'series' ? r._norm.series.includes(t.k) : inCat(r, t.k));
    const tokHit = (r, tk) => ['title', 'pron', 'author', 'series', 'tags', 'type'].some((k) => r._norm[k].includes(tk));
    const stHit = (r, k) => { const s = r._norm.status; return !!s && STATES[k].some((w) => /[^\x00-\x7f]/.test(w) ? s.includes(w) : s === w); };
    const cmpNum = (a, b) => (isNaN(a) ? 1e9 : a) - (isNaN(b) ? 1e9 : b);
    const bySeries = (a, b) => (a._norm.series || '\uffff').localeCompare(b._norm.series || '\uffff', 'ja') || cmpNum(a._seq, b._seq) || cmpNum(a._no, b._no) || a.title.localeCompare(b.title, 'ja');
    const commonSeries = (rs) => rs.length > 1 && rs[0].series && rs.every((r) => r._norm.series === rs[0]._norm.series) ? rs[0].series : '';
    function sortSmart(rs, tokens) {
      const score = (r) => tokens.reduce((s, tk) => s + (r._norm.title.startsWith(tk) ? 3 : r._norm.title.includes(tk) ? 2 : r._norm.pron.includes(tk) ? 1 : 0), 0);
      return rs.slice().sort((a, b) => score(b) - score(a) || bySeries(a, b));
    }
    function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

    const reply = (text, cards, chips, actions, query) => ({ text, cards: cards || [], chips: chips || [], actions: actions || [], query: query || '' });
    function chipsFor(r, hasMore, skip) {
      const c = [];
      if (hasMore) c.push({ label: '他には？', q: '他には' });
      if (r) {
        if (skip !== 'syn') c.push({ label: 'あらすじ', q: 'それのあらすじ' });
        if (r._norm.series) { c.push({ label: '次の巻は？', q: 'それの次の巻は' }); if (skip !== 'all') c.push({ label: 'シリーズ全部', q: r.series + ' 全部' }); }
        if (r._authorsD[0] && skip !== 'who') c.push({ label: r._authorsD[0] + 'の本', q: r._authorsD[0] + 'の本' });
      }
      return c.slice(0, 4);
    }
    
    function exChips() {
      const topAuthors = getTopLearned('authors');
      const topTags = getTopLearned('tags');
      const pick = (f) => { const vs = VOC.filter((v) => v.fs.has(f)); return vs.length ? vs[Math.floor(Math.random() * vs.length)].d : ''; };
      
      const a = topAuthors.length && Math.random() > 0.4 ? topAuthors[0] : pick('author');
      const s = pick('series');
      const t = topTags.length && Math.random() > 0.4 ? topTags[0] : pick('tags');
      
      const c = [];
      if (a) c.push({ label: a + 'の本ある？', q: a + 'の本ある' });
      if (s) c.push({ label: s + ' 全部', q: s + ' 全部' });
      if (t) c.push({ label: t + 'でおすすめは？', q: t + 'でおすすめは' });
      c.push({ label: '何冊ある？', q: '何冊ある' });
      return c;
    }
    
    function take() { const page = ctx.hits.slice(ctx.shown, ctx.shown + PAGE); ctx.shown += page.length; return page; }

    function list(rs, label, raw) {
      ctx.hits = rs; ctx.shown = 0; ctx.label = label;
      const page = take();
      ctx.last = rs.length === 1 ? rs[0] : null;
      const ser = commonSeries(rs);
      let text = (label ? label + 'で ' : '') + rs.length + ' 件見つかりました。';
      if (ser) text += 'シリーズ「' + ser + '」なので、巻の順に並べています。';
      if (rs.length > page.length) text += 'まず ' + page.length + ' 件です。';
      return reply(text, page, chipsFor(ctx.last, rs.length > ctx.shown, ser ? 'all' : ''));
    }
    function more() {
      if (!ctx.hits.length) return reply('まだ何も探していません。読みたい本の話をどうぞ。', [], exChips());
      if (ctx.shown >= ctx.hits.length) return reply('これで全部です（' + ctx.hits.length + ' 件）。', [], exChips().slice(0, 2));
      const from = ctx.shown, page = take();
      return reply((ctx.label ? ctx.label + 'の ' : '') + (from + 1) + '〜' + ctx.shown + ' 件目です（全 ' + ctx.hits.length + ' 件）。', page, ctx.shown < ctx.hits.length ? [{ label: '他には？', q: '他には' }] : []);
    }
    function recommend(pool0, label, raw) {
      const unread = pool0.filter((r) => !stHit(r, '読了'));
      const pool = unread.length ? unread : pool0;
      const picks = [], used = new Set(), seenSer = new Set();
      let moved = false;
      for (const r of shuffle(pool)) {
        let x = r;
        if (r._norm.series) {
          if (seenSer.has(r._norm.series)) continue;
          seenSer.add(r._norm.series);
          const first = records.filter((y) => y._norm.series === r._norm.series && !stHit(y, '読了')).sort(bySeries)[0];
          if (first && first !== r) { x = first; moved = true; }
        }
        if (used.has(x)) continue;
        used.add(x); picks.push(x);
        if (picks.length >= 3) break;
      }
      ctx.hits = picks; ctx.shown = picks.length; ctx.label = label; ctx.last = picks.length === 1 ? picks[0] : null;
      let text = (label ? label + 'なら' : '本棚の中から') + '、これはどうでしょう。';
      text += unread.length ? '（「読了」になっていないものから選びました' : '（全部読了になっていたので、その中から選びました';
      if (moved) text += '。シリーズものは、まだ読んでいない一番前の巻にしています';
      text += '。選び方はくじ引きです）';
      const chips = [{ label: 'ほかのおすすめ', q: raw }];
      if (picks.length === 1) chips.push(...chipsFor(picks[0], false));
      return reply(text, picks, chips.slice(0, 4));
    }
    function count(rs, has, label) {
      ctx.hits = rs.slice().sort(bySeries); ctx.shown = 0; ctx.label = label; ctx.last = null;
      let text;
      if (!has) {
        const tally = (fn) => { const m = new Map(); records.forEach((r) => { const k = fn(r); if (k) m.set(k, (m.get(k) || 0) + 1); }); return [...m].sort((a, b) => b[1] - a[1]); };
        const types = tally((r) => r._catD.type[0]).slice(0, 5);
        const sts = Object.keys(STATES).map((k) => [k, records.filter((r) => stHit(r, k)).length]).filter(([, n]) => n);
        text = '本棚には ' + records.length + ' 件あります。';
        if (types.length) text += '種別は ' + types.map(([k, n]) => k + ' ' + n).join('・') + (types.length === 5 ? ' など' : '') + '。';
        if (sts.length) text += '状態は ' + sts.map(([k, n]) => k + ' ' + n).join('・') + '。';
      } else text = label + 'は ' + rs.length + ' 件です。';
      return reply(text, [], rs.length ? [{ label: '一覧を見せて', q: '他には' }] : exChips().slice(0, 2));
    }
    function step(focus, dir) {
      const w = dir > 0 ? '次' : '前';
      if (!focus) {
        if (dir > 0 && ctx.hits.length > ctx.shown) return more();
        return reply('どの本の' + w + 'か分かりませんでした。題名といっしょに聞いてください（例:「予知夢の' + w + 'の巻は？」）。');
      }
      ctx.last = focus;
      if (!focus._norm.series) return reply('「' + focus.title + '」にはシリーズが登録されていないので、' + w + 'の巻が分かりません。', [focus], chipsFor(focus, false));
      const ser = records.filter((r) => r._norm.series === focus._norm.series).sort(bySeries);
      const t = ser[ser.indexOf(focus) + dir];
      const noSeq = isNaN(focus._seq) ? '（巻の番号 Seq. が未登録なので、題名の順で数えています）' : '';
      if (!t) return reply('「' + focus.title + '」が、シリーズ「' + focus.series + '」の' + (dir > 0 ? '最後' : '最初') + 'です（登録 ' + ser.length + ' 件の中で）。' + noSeq, [focus], [{ label: 'シリーズ全部', q: focus.series + ' 全部' }]);
      ctx.last = t; ctx.hits = [t]; ctx.shown = 1; ctx.label = '';
      return reply('「' + focus.title + '」の' + w + 'は、こちらです。' + noSeq, [t], chipsFor(t, false));
    }
    function synopsis(focus, cand, has) {
      if (!focus) {
        if (has && cand.length) focus = cand.slice().sort(bySeries)[0];
        else return reply('どの本のあらすじですか？題名を入れてください（例:「容疑者Xのあらすじ」）。');
      }
      ctx.last = focus; ctx.hits = [focus]; ctx.shown = 1;
      const others = has && cand.length > 1 ? '（ほかに ' + (cand.length - 1) + ' 件当てはまります。違う本なら、題名をもう少し長く入れてください）' : '';
      if (!focus.synopsis) return reply('「' + focus.title + '」のあらすじは登録されていません。' + others, [focus], chipsFor(focus, false, 'syn'));
      return reply('「' + focus.title + '」のあらすじです。\n' + focus.synopsis + (others ? '\n' + others : ''), [focus], chipsFor(focus, false, 'syn'));
    }
    function who(focus) {
      ctx.last = focus; ctx.hits = [focus]; ctx.shown = 1;
      return reply('「' + focus.title + '」の著者は、' + (focus.author || '未登録') + (focus.author ? ' です。' : 'です。'), [focus], chipsFor(focus, false, 'who').concat(focus._authorsD[0] ? [{ label: focus._authorsD[0] + 'の本', q: focus._authorsD[0] + 'の本' }] : []).slice(0, 4));
    }
    function help() {
      return reply('取り込んだ本棚の中から、話しかけられた本を探します。題名・著者・シリーズ・分類・読みで探せて、「全部」でシリーズを巻の順に、「おすすめ」で未読から選びます。「何冊ある？」「〇〇のあらすじ」「それの次の巻は？」「作者は？」「他には？」も通じます。', [], records.length ? exChips() : [], records.length ? [] : ['import']);
    }

    /* ============================================================
     *  v48: B.U.R.I の「調べて話す」— Notion 全体の検索＋Google 検索 → 要約して答える
     *   ・Notion: いま開いている Notion の検索（/api/v3/search。ログイン中の自分の権限で、自分のワークスペースだけ）
     *   ・Google: GM_xmlhttpRequest で検索結果のページを読む（題名・抜粋・URL）
     *   ・AI の鍵（Anthropic の API キー）があれば Claude が両方を読んで話す。無ければ抜粋をつないで答える
     *   ・鍵は ScriptCat の保存場所（GM_setValue）にだけ置く（Notion のページからは読めない）
     * ============================================================ */
    const gmGet = (k, d) => { try { return typeof GM_getValue === 'function' ? GM_getValue(k, d) : d; } catch (e) { return d; } };
    const gmSet = (k, v) => { try { if (typeof GM_setValue === 'function') GM_setValue(k, v); } catch (e) { /* noop */ } };
    const AI = { key: gmGet('c33.buri.key', ''), model: gmGet('c33.buri.model', 'claude-opus-5-5'), web: gmGet('c33.buri.web', true) !== false,
      gkey: gmGet('c33.buri.gkey', ''), gmodel: gmGet('c33.buri.gmodel', 'gemini-flash-latest'), provider: '' };
    /* v49: どの AI を使うか — gemini（無料・既定）/ chrome（無料・鍵なし）/ claude（有料）/ none（抜粋だけ） */
    AI.provider = gmGet('c33.buri.provider', '') || (AI.key ? 'claude' : 'gemini');
    const PROVIDERS = [['gemini', 'Google Gemini（無料枠・おすすめ）'], ['chrome', 'Chrome 内蔵 AI（無料・鍵なし・端末内）'], ['claude', 'Claude（有料・使った分だけ）'], ['none', '使わない（見つけた抜粋をつなぐだけ）']];
    const GEMINI_MODELS = [['gemini-flash-latest', 'Gemini Flash（既定・無料枠が広い）'], ['gemini-flash-lite-latest', 'Gemini Flash-Lite（いちばん軽い・回数に強い）'], ['gemini-pro-latest', 'Gemini Pro（賢いが無料枠は少なめ）']];
    const chromeLM = () => { try { const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window; return W.LanguageModel || (W.ai && W.ai.languageModel) || null; } catch (e) { return null; } };
    function aiOn() {
      if (AI.provider === 'gemini') return !!AI.gkey;
      if (AI.provider === 'claude') return !!AI.key;
      if (AI.provider === 'chrome') return !!chromeLM();
      return false;
    }
    const aiName = () => AI.provider === 'gemini' ? 'Gemini' : AI.provider === 'chrome' ? 'Chrome 内蔵 AI' : AI.provider === 'claude' ? 'Claude' : '';
    const AI_MODELS = [['claude-opus-5-5', 'Claude Opus 5.5（既定・いちばん賢い）'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5（速い）'], ['claude-haiku-4-5', 'Claude Haiku 4.5（いちばん安い）']];
    const aiHist = [];   // これまでの会話（文字だけ・後ろに足すだけ）
    function gmReq(o) {
      return new Promise((resolve) => {
        if (typeof GM_xmlhttpRequest !== 'function') { resolve({ status: 0, text: '', err: 'GM_xmlhttpRequest が使えません' }); return; }
        GM_xmlhttpRequest(Object.assign({ timeout: 90000 }, o, {
          onload: (r) => resolve({ status: r.status, text: r.responseText || '' }),
          onerror: () => resolve({ status: 0, text: '', err: '接続できませんでした' }),
          ontimeout: () => resolve({ status: 0, text: '', err: '時間切れ' })
        }));
      });
    }
    const stripTags = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    let spaceIdCache = '';
    async function spaceId() {
      if (spaceIdCache) return spaceIdCache;
      const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname) || /([0-9a-f]{32})/i.exec(location.href);
      if (m) {
        const id = m[1].replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
        try { const b = (await getRecords('block', [id])).get(id); if (b && b.space_id) return (spaceIdCache = b.space_id); } catch (e) { /* noop */ }
      }
      try {
        const r = await fetch(location.origin + '/api/v3/getSpaces', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const j = r.ok ? await r.json() : {};
        for (const u of Object.values(j || {})) { const sp = u && u.space && Object.keys(u.space)[0]; if (sp) return (spaceIdCache = sp); }
      } catch (e) { /* noop */ }
      return '';
    }
    async function notionSearch(q) {
      const sp = await spaceId();
      if (!sp) return [];
      const body = { type: 'BlocksInSpace', query: q, spaceId: sp, limit: 10, source: 'quick_find_input_change', sort: { field: 'relevance' },
        filters: { isDeletedOnly: false, excludeTemplates: true, navigableBlockContentOnly: true, requireEditPermissions: false, includePublicPagesWithoutExplicitAccess: false, ancestors: [], createdBy: [], editedBy: [], lastEditedTime: {}, createdTime: {}, inTeams: [] } };
      try {
        const headers = { 'Content-Type': 'application/json' };
        const u = activeUser(); if (u) headers['x-notion-active-user-header'] = u;
        const r = await fetch(location.origin + '/api/v3/search', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(body) });
        if (!r.ok) return [];
        const j = await r.json();
        const blocks = (j.recordMap && j.recordMap.block) || {};
        const out = [];
        for (const it of (j.results || []).slice(0, 8)) {
          const n = blocks[it.id]; const v = n && (n.value && n.value.value ? n.value.value : n.value);
          const t = stripTags((it.highlight && it.highlight.title) || (v && v.properties && v.properties.title ? v.properties.title.map((x) => x[0]).join('') : '')) || '無題';
          const tx = stripTags((it.highlight && it.highlight.text) || '');
          out.push({ title: t, snippet: tx, url: location.origin + '/' + String(it.id).replace(/-/g, '') });
        }
        return out;
      } catch (e) { return []; }
    }
    async function googleSearch(q) {
      if (!AI.web) return [];
      const r = await gmReq({ method: 'GET', url: 'https://www.google.co.jp/search?q=' + encodeURIComponent(q) + '&hl=ja&num=8', headers: { 'Accept-Language': 'ja,en;q=0.8' } });
      if (!r.text) return [];
      try {
        const doc = new DOMParser().parseFromString(r.text, 'text/html');
        const out = [], seen = new Set();
        const feat = doc.querySelector('.kno-rdesc span, .hgKElc, .LGOjhe');
        if (feat && feat.textContent.trim()) out.push({ title: '概要（Google）', snippet: feat.textContent.trim(), url: 'https://www.google.co.jp/search?q=' + encodeURIComponent(q) });
        for (const h3 of doc.querySelectorAll('a h3')) {
          const a = h3.closest('a'); let href = a && a.getAttribute('href') || '';
          const m = /[?&]q=([^&]+)/.exec(href); if (href.startsWith('/url') && m) href = decodeURIComponent(m[1]);
          if (!/^https?:/.test(href) || /google\./.test(new URL(href).hostname)) continue;
          if (seen.has(href)) continue; seen.add(href);
          let box = a; for (let i = 0; i < 6 && box.parentElement; i++) { box = box.parentElement; if (box.textContent.length > h3.textContent.length + 60) break; }
          const sn = (box.querySelector('.VwiC3b, [data-sncf], [style*="-webkit-line-clamp"]') || {}).textContent || box.textContent.replace(h3.textContent, '');
          out.push({ title: h3.textContent.trim(), snippet: String(sn).replace(/\s+/g, ' ').trim().slice(0, 300), url: href });
          if (out.length >= 6) break;
        }
        return out;
      } catch (e) { return []; }
    }
    const SYS = [
      'あなたは「B.U.R.I（ブリ）」。Notion のサイドバーに住む、本と調べものの相棒です。見た目は (\'-\' 鰤)з。',
      '話し方: やわらかい丁寧語。親しみはあるが、なれなれしすぎない。絵文字は使わない。',
      '答え方:',
      '・渡された「Notion の検索結果」「本棚」「Web の検索結果」だけを根拠に、質問に日本語で答える。',
      '・根拠の文には [N1] [W2] のように番号を付ける（N=Notion・本棚、W=Web）。',
      '・根拠に無いことは推測で埋めず、「手元の情報では分かりませんでした」と言う。',
      '・Notion（ユーザー自身の記録）と Web の情報が食い違う時は、両方を示す。',
      '・ふだんは 3〜8 文程度。一覧を求められたら箇条書き。最後に一言だけ、次に聞けそうなことを添えてもよい。'
    ].join('\n');
    function sourcesText(nh, wh, shelf) {
      let t = '';
      const sh = shelf.slice(0, 8).map((r, i) => '[N' + (i + 1) + '] 本棚: ' + r.title + (r.author ? '／著者 ' + r.author : '') + (r.series ? '／シリーズ ' + r.series + (r.seq ? '（' + r.seq + '）' : '') : '') + (r.status ? '／状態 ' + r.status : '') + (r.synopsis ? '／あらすじ ' + String(r.synopsis).slice(0, 200) : ''));
      const nn = nh.map((x, i) => '[N' + (sh.length + i + 1) + '] Notion: ' + x.title + (x.snippet ? '／' + x.snippet.slice(0, 240) : ''));
      const ww = wh.map((x, i) => '[W' + (i + 1) + '] ' + x.title + '／' + x.snippet + '（' + x.url + '）');
      t += '# Notion の検索結果・本棚\n' + (sh.concat(nn).join('\n') || '（なし）') + '\n\n# Web の検索結果\n' + (ww.join('\n') || '（なし・または Web 検索を切っている）');
      return t;
    }
    async function claude(question, ctxText) {
      const msgs = aiHist.slice(-8).concat([{ role: 'user', content: ctxText + '\n\n# 質問\n' + question }]);
      const r = await gmReq({
        method: 'POST', url: 'https://api.anthropic.com/v1/messages',
        headers: { 'content-type': 'application/json', 'x-api-key': AI.key, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'server-side-fallback-2026-07-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        data: JSON.stringify({ model: AI.model, max_tokens: 4000, system: SYS, messages: msgs, output_config: { effort: 'low' }, fallbacks: 'default' })
      });
      let j = null; try { j = JSON.parse(r.text); } catch (e) { /* noop */ }
      if (!j) return { err: r.err || ('応答を読めませんでした（' + r.status + '）') };
      if (j.type === 'error' || r.status >= 400) return { err: (j.error && j.error.message) || ('エラー ' + r.status) };
      if (j.stop_reason === 'refusal') return { err: 'この質問には答えられないと判断されました。' };
      const text = (j.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
      aiHist.push({ role: 'user', content: question }, { role: 'assistant', content: text || '（空の返事）' });
      return { text };
    }
    /* v49: Google Gemini（無料枠）— 鍵は aistudio.google.com で無料。請求先を登録しない限り課金されない */
    async function gemini(question, ctxText) {
      const contents = aiHist.slice(-8).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
        .concat([{ role: 'user', parts: [{ text: ctxText + '\n\n# 質問\n' + question }] }]);
      const r = await gmReq({
        method: 'POST', url: 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(AI.gmodel || 'gemini-flash-latest') + ':generateContent',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': AI.gkey },
        data: JSON.stringify({ systemInstruction: { parts: [{ text: SYS }] }, contents, generationConfig: { maxOutputTokens: 2048, temperature: 0.5 } })
      });
      let j = null; try { j = JSON.parse(r.text); } catch (e) { /* noop */ }
      if (r.status === 429) return { err: '無料枠の回数を使い切りました。1 分〜明日まで待つと戻ります（お金はかかりません）' };
      if (!j) return { err: r.err || ('応答を読めませんでした（' + r.status + '）') };
      if (j.error || r.status >= 400) return { err: (j.error && j.error.message) || ('エラー ' + r.status) };
      const c = (j.candidates || [])[0];
      const text = c && c.content && (c.content.parts || []).map((p) => p.text || '').join('').trim();
      if (!text) return { err: (j.promptFeedback && j.promptFeedback.blockReason) ? 'この質問には答えられないと判断されました。' : '空の返事でした' };
      aiHist.push({ role: 'user', content: question }, { role: 'assistant', content: text });
      return { text };
    }
    /* v49: Chrome 内蔵 AI（Prompt API / Gemini Nano）— 無料・鍵なし・端末の中だけで動く。読める量が少ないので根拠を短くして渡す */
    let chromeSess = null;
    async function chromeAI(question, ctxText) {
      const LM = chromeLM();
      if (!LM) return { err: 'この Chrome では内蔵 AI が使えません（新しい Chrome とある程度の性能の PC が要ります）' };
      try {
        const opt = { expectedInputs: [{ type: 'text', languages: ['ja', 'en'] }], expectedOutputs: [{ type: 'text', languages: ['ja'] }] };
        if (typeof LM.availability === 'function') {
          const av = await LM.availability(opt);
          if (av === 'unavailable') return { err: 'この端末では Chrome 内蔵 AI が使えません' };
        }
        if (!chromeSess) chromeSess = await LM.create(Object.assign({ initialPrompts: [{ role: 'system', content: SYS }] }, opt));
        const text = String(await chromeSess.prompt(String(ctxText).slice(0, 3500) + '\n\n# 質問\n' + question) || '').trim();
        if (!text) return { err: '空の返事でした' };
        aiHist.push({ role: 'user', content: question }, { role: 'assistant', content: text });
        return { text };
      } catch (e) {
        chromeSess = null;
        return { err: (e && e.message) || 'Chrome 内蔵 AI が動きませんでした（初回はモデルのダウンロード待ちのことがあります）' };
      }
    }
    async function askAI(question, ctxText) {
      if (AI.provider === 'gemini') return gemini(question, ctxText);
      if (AI.provider === 'chrome') return chromeAI(question, ctxText);
      if (AI.provider === 'claude') return claude(question, ctxText);
      return { err: 'AI を使わない設定です' };
    }
    function firstSentence(s) { const t = String(s || '').replace(/\s+/g, ' ').trim(); const m = /^(.{20,160}?[。．！？!?])/.exec(t); return m ? m[1] : t.slice(0, 120) + (t.length > 120 ? '…' : ''); }
    async function deep(raw, shelf, baseCards, baseChips) {
      const q = raw.replace(/(について)?(教えて|おしえて|知りたい|調べて|しらべて|って何|ってなに|とは|は\?|は？)/g, ' ').replace(/\s+/g, ' ').trim() || raw;
      const [nh, wh] = await Promise.all([notionSearch(q), googleSearch(q)]);
      const cards = (baseCards || []).slice();
      nh.slice(0, 4).forEach((x) => cards.push({ title: x.title, url: x.url, type: 'Notion のページ', linkLabel: 'Notion で開く' }));
      wh.slice(0, 3).forEach((x) => cards.push({ title: x.title, url: x.url, type: 'Web', linkLabel: 'Web で開く' }));
      if (!nh.length && !wh.length && !shelf.length) return reply('「' + q + '」は、Notion の中にも Web にも見つかりませんでした。言い方を変えて聞いてみてください。', [], exChips().slice(0, 2), ['notion'], q);
      if (aiOn()) {
        const r = await askAI(raw, sourcesText(nh, wh, shelf));
        if (r.text) return reply(r.text, cards, baseChips || [{ label: 'もっと詳しく', q: q + ' をもっと詳しく' }], ['notion'], q);
        return reply(aiName() + ' につながりませんでした（' + r.err + '）。かわりに見つけたものを並べます。\n\n' + plain(), cards, baseChips || [], ['notion'], q);
      }
      return reply(plain() + (AI.provider === 'none' ? '' : '\n\n（上の「AI」で無料の Gemini の鍵を入れると、これを読んでまとめて話せます）'), cards, baseChips || [], ['notion'], q);
      function plain() {
        let t = '';
        if (shelf.length) t += '本棚では ' + shelf.length + ' 件：' + shelf.slice(0, 5).map((r) => '「' + r.title + '」').join('・') + '。\n';
        if (nh.length) t += 'Notion では ' + nh.length + ' 件：' + nh.slice(0, 5).map((x) => '「' + x.title + '」').join('・') + '。\n';
        if (wh.length) t += '\nWeb ではこう書かれています。\n' + wh.slice(0, 3).map((x, i) => '・' + firstSentence(x.snippet) + ' [W' + (i + 1) + ']').join('\n');
        return t.trim();
      }
    }

    /* --- Google 検索エンジン (特権API使用・最高品質) --- */
    async function searchExternal(query) {
      return new Promise((resolve) => {
        if (typeof GM_xmlhttpRequest === 'undefined') {
          resolve(reply("ブラウザの制約でWeb検索ができませんでした（GM_xmlhttpRequestが未許可です）。", [], exChips().slice(0, 2), ['notion'], query));
          return;
        }
        
        // 【精度向上】本の情報を引っ張るために検索クエリを強力に補強
        const safeQuery = query + " (本 OR 小説 OR ライトノベル OR コミック OR 発売予定 OR 発売日 OR あらすじ OR 作者)";
        const url = "https://www.google.co.jp/search?q=" + encodeURIComponent(safeQuery) + "&hl=ja";
        
        GM_xmlhttpRequest({
          method: "GET",
          url: url,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          onload: function(res) {
            try {
              const doc = new DOMParser().parseFromString(res.responseText, "text/html");
              const results = [];
              const seen = new Set();
              
              // 強調スニペットがあれば優先
              const featured = doc.querySelector('.xpdopen, .ifM9O, .kno-rdesc, .LGOjhe');
              if (featured && featured.textContent.trim()) {
                 results.push({ title: "強調スニペット / 概要", snippet: featured.textContent.trim() });
                 seen.add(featured.textContent.trim().substring(0, 30));
              }

              const blocks = doc.querySelectorAll('div.g');
              for (const el of blocks) {
                const titleEl = el.querySelector('h3');
                if (!titleEl) continue;
                const title = titleEl.textContent.trim();
                
                const snipEl = el.querySelector('div[data-sncf="1"], div.VwiC3b, div[style*="-webkit-line-clamp"]');
                let snippet = snipEl ? snipEl.textContent.trim() : "";
                
                if (!snippet) {
                   const clone = el.cloneNode(true);
                   const h3 = clone.querySelector('h3');
                   if(h3) h3.remove();
                   snippet = clone.textContent.replace(/\s+/g, ' ').trim().substring(0, 150) + "...";
                }
                
                if (title && snippet.length > 20) {
                   const check = snippet.substring(0, 30);
                   if (!seen.has(check)) {
                      seen.add(check);
                      results.push({ title, snippet });
                   }
                }
                if (results.length >= 4) break;
              }

              if (results.length > 0) {
                let text = `本棚には見当たりませんでしたが、Googleの海を泳いで広く調べてきました。\n\n`;
                for(let i=0; i<results.length; i++) {
                  text += `【${results[i].title}】\n${results[i].snippet}\n\n`;
                }
                text += `以上が「${query}」に関する現在のWeb上の情報です。`;
                resolve(reply(text.trim(), [], exChips().slice(0, 2), ['notion'], query));
              } else {
                resolve(reply(`「${query}」についてGoogleの海も泳ぎましたが、本や小説に関する有力な情報は見つかりませんでした。`, [], exChips().slice(0, 2), ['notion'], query));
              }
            } catch (e) {
              resolve(reply('Webの海を泳いでいる途中で波に飲まれました...（解析エラー）', [], exChips().slice(0, 2), ['notion'], query));
            }
          },
          onerror: function() {
            resolve(reply('Webの海に出られませんでした（接続エラー）。', [], exChips().slice(0, 2), ['notion'], query));
          }
        });
      });
    }

    async function ask(input) {
      const raw = String(input == null ? '' : input).trim();
      const q0 = nz(raw).replace(/[?？!！。．.、,〜~…]+/gu, ' ').replace(/\s+/gu, ' ').trim();
      if (!q0) return reply('なにか聞いてください。たとえば「東野圭吾の本ある？」「ミステリーでおすすめは？」です。', [], records.length ? exChips() : []);
      if (RE.greet.test(q0)) return reply('こんにちは。本棚案内の B.U.R.I です。' + (records.length ? '取り込んだ ' + records.length + ' 件から探します。読みたい本の話をどうぞ。' : 'まずは本棚の CSV を取り込んでください。'), [], records.length ? exChips() : [], records.length ? [] : ['import']);
      if (RE.thanks.test(q0)) return reply('どういたしまして。また呼んでください。');
      if (RE.help.test(q0)) return help();
      if (!records.length && !RE.greet.test(q0)) return await deep(raw, [], [], null);
      if (!records.length) return reply('まだ本棚のデータを持っていません。Notion の本棚 DB を CSV で書き出して、「取り込む」から渡してください（外には送りません）。', [], [], ['import']);
      if (RE.more.test(q0)) return more();
      ctx.ask = raw;
      const it = { next: RE.next.test(q0), prev: RE.prev.test(q0), syn: RE.syn.test(q0), who: RE.who.test(q0), count: RE.count.test(q0), rec: RE.rec.test(q0), all: RE.all.test(q0) };
      if (it.next && it.prev) it.prev = false;

      let rest = ' ' + q0 + ' ';
      const tHits = [];
      for (const t of TITLES) if (rest.includes(t.k)) { tHits.push(...t.rs); rest = rest.split(t.k).join(' '); }
      it.ref = !tHits.length && RE.ref.test(q0);
      if (it.ref) rest = ' ' + rest.trim().replace(RE.ref, ' ') + ' ';
      
      const terms = [];
      for (const v of VOC) if (rest.includes(v.k)) { terms.push(v); rest = rest.split(v.k).join(' '); }
      
      const alias = [];
      for (const g of ALIAS) {
        const hit = g.find((w) => rest.includes(nz(w)));
        if (hit) { alias.push({ d: hit, ws: g.map(nz) }); g.forEach((w) => { rest = rest.split(nz(w)).join(' '); }); }
      }
      
      let status = '';
      for (const [k, re] of ST_RE) if (re.test(rest)) { status = k; rest = rest.replace(re, ' '); break; }
      
      for (const re of STRIP) rest = rest.replace(re, ' ');
      const tokens = rest.split(/[\s ]+/u).map(trimP).filter((t) => t && (t.length >= 2 || /[\p{Script=Han}a-z0-9]/u.test(t)));

      const has = !!(tHits.length || terms.length || alias.length || tokens.length || status);
      const groups = new Map();
      terms.forEach((t) => { const g = [...t.fs].sort().join('+'); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(t); });
      const pass = (r) => [...groups.values()].every((ts) => ts.some((t) => termHit(r, t)))
        && alias.every((a) => a.ws.some((w) => inCat(r, w)))
        && tokens.every((tk) => tokHit(r, tk))
        && (!status || stHit(r, status));
      let cand = (tHits.length ? uniq(tHits) : records).filter(pass);
      if (!cand.length && tHits.length && (terms.length || tokens.length)) cand = records.filter(pass);

      const parts = [];
      if (tHits.length) parts.push('「' + tHits[0].title + '」');
      terms.forEach((t) => {
        const facet = [...t.fs][0];
        if (facet === 'author') learnFacet('authors', t.d);
        if (facet === 'tags') learnFacet('tags', t.d);
        parts.push(FACET_JA[facet] + '「' + t.d + '」'); 
      });
      alias.forEach((a) => parts.push('「' + a.d + '」'));
      tokens.forEach((t) => parts.push('「' + t + '」'));
      if (status) parts.push('状態「' + status + '」');
      const label = parts.join('・');

      let focus = tHits.length ? tHits[0] : null;
      const askOne = it.next || it.prev || it.syn || it.who;
      if (!focus && (it.ref || (askOne && !has))) focus = ctx.last;
      if (!focus && askOne && has && cand.length === 1) focus = cand[0];

      if (it.next || it.prev) return step(focus, it.next ? 1 : -1);
      if (it.syn) return synopsis(focus, cand, has);
      if (it.who && focus && !terms.some((t) => t.fs.has('author'))) return who(focus);
      if (it.count) return count(cand, has, label);
      if (!has) {
        if (it.rec) return recommend(records, '', raw);
        if (it.all) return list(records.slice().sort(bySeries), 'すべて', raw);
        if (it.ref && ctx.last) return list([ctx.last], '', raw);
        return await deep(raw, [], [], null);
      }
      if (!cand.length) return await deep(raw, [], [], null);
      if (it.rec) return recommend(cand, label, raw);
      const lr = list(it.all || commonSeries(cand) ? cand.slice().sort(bySeries) : sortSmart(cand, tokens), label, raw);
      /* v48: 鍵があれば、本棚の答えに Notion・Web の情報も足して話す（一覧の操作「全部」「他には」はそのまま） */
      if (aiOn() && !it.all) return await deep(raw, cand.slice(0, 8), lr.cards, lr.chips);
      return lr;
    }

    function state() {
      return { count: records.length, imported: records.length > 0, persisted, name: lastSrc ? lastSrc.name : '', fields: info.fields, missing: info.missing, warnings: info.warnings, last: ctx.last ? ctx.last.title : '', hits: ctx.hits.length, shown: ctx.shown, sessionOnly: !persisted };
    }
    
    // 内部名を「ask」に統一し、外部公開名「answer」にマッピング
    return { ask, answer: ask, importText, save, forget, clear, restore, state, FIELD, isRead: (r) => stHit(r, '読了'), count: () => records.length, AI, AI_MODELS, PROVIDERS, GEMINI_MODELS, aiOn, aiName, chromeLM, gmSet, aiReset: () => { aiHist.length = 0; chromeSess = null; } };
  })();

  /* ============================================================
   *  B.U.R.I の画面（アニメーション＋Web検索＋フローティング対応版）
   * ============================================================ */
  function obSearchBoot() {
    ['c33-search-css', 'c33-search-header', 'c33-buri', 'c33-buri-file'].forEach((id) => { const e = document.getElementById(id); if (e) e.remove(); });
    const svgI = (p) => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
    const LENS = svgI('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>');
    const MENU = svgI('<path d="M4 6h16M4 12h16M4 18h16"/>');
    const AVATAR = "('-' 鰤)з";
    const nzq = (s) => String(s == null ? '' : s).normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim();
    const mk = (tag, cls, text, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    const setS = (el, k, v) => { if (el.style.getPropertyValue(k) !== v) el.style.setProperty(k, v, 'important'); };

    const style = document.createElement('style');
    style.id = 'c33-search-css';
    style.textContent = `
#c33-search-header { position: fixed; z-index: 1001; display: flex; gap: 6px; align-items: center; height: 36px; box-sizing: border-box; margin: 0; padding: 0; color: var(--c-texPri, #37352f); font: 12px/1.4 var(--c33-ui); border-radius: 18px; transition: box-shadow 0.2s ease, left 0.2s ease, top 0.2s ease, width 0.2s ease; }
#c33-search-header[hidden], #c33-buri[hidden] { display: none !important; }
#c33-search-header *, #c33-buri * { box-sizing: border-box; }
#c33-search-header .cs-field { display: flex; align-items: center; flex: 1 1 auto; min-width: 0; height: 36px; margin: 0; padding: 0 10px 0 4px; gap: 2px; border: 1px solid var(--ca-borSecTra, rgba(55,53,47,.14)); border-radius: 18px; background: var(--c-bacPri, #fff); cursor: text; }
#c33-search-header .cs-field:focus-within { border-color: color-mix(in srgb, var(--lm-accent, #2783de) 55%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lm-accent, #2783de) 16%, transparent); }
#c33-search-header .cs-go { flex: none; width: 28px; height: 28px; margin: 0; padding: 0; border: 0; border-radius: 14px; background: transparent; color: var(--c-icoSec, #91918e); display: flex; align-items: center; justify-content: center; cursor: pointer; }
#c33-search-header .cs-go:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-search-header input#c33-search-input { flex: 1 1 auto !important; min-width: 0 !important; width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; border: 0 !important; outline: 0 !important; background: transparent !important; box-shadow: none !important; color: inherit !important; font: inherit !important; -webkit-appearance: none; appearance: none; }
#c33-search-header input#c33-search-input::placeholder { color: var(--c-texTer, #a5a29a); opacity: 1; }
#c33-search-header .cs-close { flex: none; width: 32px; height: 32px; margin: 0; padding: 0; border: 0; border-radius: 16px; background: transparent; color: var(--c-icoSec, #91918e); display: flex; align-items: center; justify-content: center; cursor: pointer; }
#c33-search-header .cs-close:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-buri { position: fixed; z-index: 1002; display: flex; flex-direction: column; border-radius: 14px; overflow: hidden; background: var(--c-bacEle, #fff); color: var(--c-texPri, #37352f);
  box-shadow: var(--c-shaOutMd, 0 12px 36px rgba(0,0,0,.18)), 0 0 0 1px var(--ca-borSecTra, rgba(0,0,0,.06)); font: 12.5px/1.6 var(--c33-ui); font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; transition: left 0.2s ease, top 0.2s ease, width 0.2s ease; }
#c33-buri .cb-top { flex: none; display: flex; align-items: center; flex-wrap: wrap; gap: 4px 6px; padding: 8px 10px; border-bottom: 1px solid var(--ca-borSecTra, rgba(0,0,0,.06)); }
#c33-buri .cb-name { font-weight: 700; letter-spacing: .06em; }
#c33-buri .cb-state { flex: 1 1 120px; min-width: 0; font-size: 11px; color: var(--c-texTer, #999); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c33-buri .cb-tool { flex: none; margin: 0; padding: 2px 8px; border: 1px solid var(--ca-borSecTra, rgba(0,0,0,.1)); border-radius: 999px; background: transparent; color: inherit; font: 11px/1.5 var(--c33-ui); cursor: pointer; }
#c33-buri .cb-tool:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); }
#c33-buri .cb-x { border: 0; font-size: 14px; padding: 0 6px; }
#c33-buri .cb-log { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 10px; display: flex; flex-direction: column; gap: 10px; }
#c33-buri .cb-msg { display: flex; gap: 8px; align-items: flex-start; }
#c33-buri .cb-msg.me { justify-content: flex-end; }
#c33-buri .cb-av { flex: none; padding: 2px 7px; border-radius: 10px; font-size: 11px; white-space: nowrap; background: color-mix(in srgb, var(--lm-accent, #2783de) 10%, transparent); color: var(--c-texSec, #555); }
#c33-buri .cb-body { min-width: 0; max-width: 100%; display: flex; flex-direction: column; gap: 6px; }
#c33-buri .cb-msg.me .cb-body { align-items: flex-end; max-width: 85%; }
#c33-buri .cb-bub { padding: 7px 10px; border-radius: 12px; background: color-mix(in srgb, var(--c-texPri, #000) 5%, transparent); white-space: pre-wrap; overflow-wrap: anywhere; }
#c33-buri .cb-msg.me .cb-bub { background: color-mix(in srgb, var(--lm-accent, #2783de) 14%, transparent); }
#c33-buri .cb-card { display: flex; flex-direction: column; gap: 2px; padding: 7px 9px; border: 1px solid var(--ca-borSecTra, rgba(0,0,0,.08)); border-radius: 10px; background: var(--c-bacPri, #fff); }
#c33-buri .cb-card strong { font-size: 13px; overflow-wrap: anywhere; }
#c33-buri .cb-meta { font-size: 11px; color: var(--c-texSec, #787774); overflow-wrap: anywhere; }
#c33-buri .cb-st { align-self: flex-start; margin-top: 2px; padding: 0 7px; border-radius: 999px; font-size: 10.5px; background: color-mix(in srgb, var(--c-texPri, #000) 6%, transparent); }
#c33-buri .cb-st.done { background: color-mix(in srgb, #2e9e6a 16%, transparent); }
#c33-buri .cb-links { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 3px; }
#c33-buri .cb-links a, #c33-buri .cb-links button { margin: 0; padding: 0; border: 0; background: none; font: 11px/1.5 var(--c33-ui); color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); text-decoration: none; cursor: pointer; }
#c33-buri .cb-links a:hover, #c33-buri .cb-links button:hover { text-decoration: underline; }
#c33-buri .cb-chips { display: flex; flex-wrap: wrap; gap: 6px; }
#c33-buri .cb-chip { margin: 0; padding: 3px 10px; border: 1px solid color-mix(in srgb, var(--lm-accent, #2783de) 35%, transparent); border-radius: 999px; background: transparent; color: var(--c-texPri, #37352f); font: 11.5px/1.5 var(--c33-ui); cursor: pointer; }
#c33-buri .cb-chip:hover { background: color-mix(in srgb, var(--lm-accent, #2783de) 10%, transparent); }
#c33-buri .cb-chip.act { border-style: dashed; }
#c33-buri .cb-foot { flex: none; padding: 6px 10px; border-top: 1px solid var(--ca-borSecTra, rgba(0,0,0,.06)); font-size: 10.5px; color: var(--c-texTer, #999); }

/* --- アニメーション関連 --- */
#c33-search-header.floating { left: 50% !important; transform: translateX(-50%) !important; width: 600px !important; max-width: 90vw !important; top: 15vh !important; box-shadow: var(--c-shaOutMd, 0 12px 36px rgba(0,0,0,.18)) !important; }
#c33-buri.floating { left: 50% !important; transform: translateX(-50%) !important; width: 600px !important; max-width: 90vw !important; top: calc(15vh + 46px) !important; max-height: 60vh !important; }
@keyframes buriPop {
  0% { opacity: 0; transform: translateY(8px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
#c33-buri .cb-msg { animation: buriPop 0.25s ease-out forwards; }
.typewriter-cursor::after {
  content: "▌";
  display: inline-block;
  vertical-align: bottom;
  animation: blink 1s step-start infinite;
  margin-left: 2px;
  color: var(--lm-accent, #2783de);
}
@keyframes blink { 50% { opacity: 0; } }
.thinking-dots { display: inline-flex; gap: 4px; align-items: center; height: 16px; }
.thinking-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--c-texSec, #999); animation: bounce 1.4s infinite ease-in-out both; }
.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
`;
    (document.head || document.documentElement).appendChild(style);

    const header = mk('div');
    header.id = 'c33-search-header'; header.hidden = true; header.setAttribute('role', 'search');
    const field = mk('label', 'cs-field', null, header);
    const go = mk('button', 'cs-go', null, field); go.type = 'button'; go.innerHTML = LENS; go.setAttribute('aria-label', 'B.U.R.I に聞く');
    const input = mk('input', null, null, field);
    input.id = 'c33-search-input'; input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
    input.placeholder = 'B.U.R.I';
    input.setAttribute('aria-label', 'B.U.R.I'); input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-controls', 'c33-buri');
    
    const close = mk('button', 'cs-close', null, header); close.type = 'button'; close.innerHTML = MENU;
    close.setAttribute('aria-label', 'サイドバーを閉じる'); close.title = 'サイドバーを閉じる（⌘\\）';

    const panel = mk('div');
    panel.id = 'c33-buri'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', "B.U.R.I ('-' 鰤)з 本棚案内");
    const top = mk('div', 'cb-top', null, panel);
    mk('span', 'cb-name', 'B.U.R.I', top);
    const stateEl = mk('span', 'cb-state', '', top);
    const bImp = mk('button', 'cb-tool', '取り込む', top); bImp.type = 'button'; bImp.title = 'Notion の本棚 DB を書き出した CSV / JSON を渡す';
    const bSave = mk('button', 'cb-tool', '端末に保存', top); bSave.type = 'button'; bSave.title = '次からも自動で読み込む（このブラウザの中だけ）';
    const bForget = mk('button', 'cb-tool', '保存を消す', top); bForget.type = 'button';
    const bAI = mk('button', 'cb-tool', 'AI', top); bAI.type = 'button'; bAI.title = 'AI の鍵・モデル・Web 検索';
    const bX = mk('button', 'cb-tool cb-x', '×', top); bX.type = 'button'; bX.setAttribute('aria-label', '閉じる');
    const log = mk('div', 'cb-log', null, panel); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
    const foot = mk('div', 'cb-foot', '', panel);
    const footText = () => {
      const A = BURI.AI, on = BURI.aiOn();
      foot.textContent = !on ? '本棚・Notion 全体・Google を調べて答えます。「AI」で無料の Gemini（または Chrome 内蔵 AI）を選ぶと、まとめて話せるようになります。'
        : A.provider === 'gemini' ? '本棚・Notion・Google を調べ、Gemini（無料枠・' + A.gmodel + '）がまとめて話します。質問と抜粋が Google に送られます（無料枠では改善に使われることがあります）。'
        : A.provider === 'chrome' ? '本棚・Notion・Google を調べ、Chrome 内蔵 AI がこの端末の中でまとめて話します（無料・外へは送りません）。'
        : '本棚・Notion・Google を調べ、Claude（' + A.model + '・有料）がまとめて話します。質問と抜粋が Anthropic に送られます。';
    };
    footText();
    const file = mk('input'); file.id = 'c33-buri-file'; file.type = 'file'; file.accept = '.csv,.json,text/csv,application/json'; file.hidden = true;
    document.body.append(header, panel, file);

    let panelOpen = false, composing = false;
    let floatMode = false;

    function updState() {
      const s = BURI.state();
      stateEl.textContent = s.count ? '本棚 ' + s.count + ' 件・' + (s.persisted ? 'この端末に保存済み' : 'この実行の間だけ') : '本棚はまだ空です';
      bSave.hidden = !s.count || s.persisted;
      bForget.hidden = !s.persisted;
    }
    function trimLog() { while (log.children.length > 60) log.firstElementChild.remove(); }
    function scrollEnd() { requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; }); }
    function addUser(text) {
      const m = mk('div', 'cb-msg me', null, log);
      const b = mk('div', 'cb-body', null, m);
      mk('div', 'cb-bub', text, b);
      trimLog(); scrollEnd();
    }
    function card(r, parent) {
      const c = mk('div', 'cb-card', null, parent);
      mk('strong', null, r.title, c);
      const meta = [];
      if (r.author) meta.push('著者: ' + r.author);
      if (r.series) meta.push('シリーズ: ' + r.series + (r.seq ? '（' + r.seq + '）' : ''));
      if (r.tags) meta.push('分類: ' + r.tags);
      if (r.type) meta.push('種別: ' + r.type);
      if (r.pron) meta.push('読み: ' + r.pron);
      if (meta.length) mk('div', 'cb-meta', meta.join(' ／ '), c);
      if (r.status) mk('span', 'cb-st' + (BURI.isRead(r) ? ' done' : ''), r.status, c);
      const ln = mk('div', 'cb-links', null, c);
      if (r.url) { const a = mk('a', null, r.linkLabel || '作品ページを開く', ln); a.href = r.url; a.rel = 'noopener noreferrer'; if (!r.url.startsWith(location.origin)) a.target = '_blank'; }
      else { const b = mk('button', null, 'Notion で探す', ln); b.type = 'button'; b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openNative(r.title); }); }
      (r._relations || []).slice(0, 4).forEach((ref) => { const a = mk('a', null, ref.label + ': ' + (ref.name || '開く'), ln); a.href = ref.url; a.rel = 'noopener noreferrer'; });
    }
    
    async function addBuri(res) {
      const m = mk('div', 'cb-msg', null, log);
      mk('div', 'cb-av', AVATAR, m);
      const b = mk('div', 'cb-body', null, m);
      const bub = mk('div', 'cb-bub typewriter-cursor', '', b);
      
      const extras = mk('div', '', null, b);
      extras.style.display = 'none';
      
      (res.cards || []).forEach((r) => card(r, extras));
      const chips = res.chips || [], acts = res.actions || [];
      if (chips.length || acts.length) {
        const cw = mk('div', 'cb-chips', null, extras);
        chips.forEach((c) => { const x = mk('button', 'cb-chip', c.label, cw); x.type = 'button'; x.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); send(c.q); }); });
        acts.forEach((a) => {
          let lb = '', fn = null;
          if (a === 'import') { lb = '本棚を取り込む'; fn = () => file.click(); }
          else if (a === 'notion') { lb = 'Notion 全体で探す'; fn = () => openNative(res.query || ''); }
          else if (a && a.gid) { lb = '大分類「' + a.label + '」を開く'; fn = () => { const i = obItemEls.findIndex((el) => el.__gid === a.gid); if (i >= 0) obJump(i); obSelect(a.gid); }; }
          if (!fn) return;
          const x = mk('button', 'cb-chip act', lb, cw); x.type = 'button';
          x.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); });
        });
      }
      trimLog(); scrollEnd(); updState();
      
      const text = res.text || '';
      for (let i = 0; i < text.length; i++) {
        bub.textContent += text[i];
        if (i % 2 === 0) scrollEnd();
        await new Promise(r => setTimeout(r, 12));
      }
      bub.classList.remove('typewriter-cursor');
      extras.style.display = 'block'; 
      scrollEnd();
    }

    async function openPanel() {
      if (!panelOpen) {
        panelOpen = true;
        if (!log.children.length) {
           const res = await BURI.ask('こんにちは');
           addBuri(res);
        }
      }
      input.setAttribute('aria-expanded', 'true');
      updState(); layout();
    }
    function closePanel() {
      panelOpen = false; panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      if (floatMode) { floatMode = false; input.blur(); layout(); }
    }

    async function send(q) {
      q = String(q == null ? '' : q).trim();
      if (!q) { input.focus(); openPanel(); return; }
      openPanel();
      addUser(q);
      
      const thinkMsg = mk('div', 'cb-msg', null, log);
      mk('div', 'cb-av', AVATAR, thinkMsg);
      const thinkB = mk('div', 'cb-body', null, thinkMsg);
      const thinkBub = mk('div', 'cb-bub', '', thinkB);
      thinkBub.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div>';
      scrollEnd();

      let res;
      try { res = await BURI.ask(q); }
      catch (e) { res = { text: 'ごめんなさい、考えている途中で波に飲まれました。（' + String(e && e.message || e) + '）', cards: [], chips: [], actions: [] }; }
      
      thinkMsg.remove();
      
      const nq = nzq(q);
      const gs = obGroups().filter((g) => g.label && nzq(g.label).length >= 2 && nq.includes(nzq(g.label))).slice(0, 2);
      if (gs.length) res = Object.assign({}, res, { actions: (res.actions || []).concat(gs.map((g) => ({ gid: g.gid, label: g.label }))) });
      
      await addBuri(res);
    }
    function submit() {
      if (composing) return;
      const q = input.value;
      input.value = '';
      send(q);
    }

    function nativeInput() {
      for (const el of document.querySelectorAll('[data-search-container="true"] input, .notion-dialog[aria-label="Search Notion"] input, [role="dialog"] input[role="combobox"]')) {
        if (el.closest('#c33-search-header, #c33-buri')) continue;
        if (el.getBoundingClientRect().width) return el;
      }
      return null;
    }
    async function openNative(q) {
      closePanel();
      let inp = nativeInput();
      if (!inp) {
        const t = obTabs().find((x) => /^(search|検索)/i.test(x.name));
        if (t) obPress(t.el);
        else {
          const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
          document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', keyCode: 75, which: 75, metaKey: mac, ctrlKey: !mac, bubbles: true, cancelable: true, composed: true }));
        }
        inp = await obWait(nativeInput, 1600);
      }
      if (!inp) { obToast('Notion の検索を開けませんでした。⌘K（Windows は Ctrl+K）を押してみてください。'); return false; }
      if (q) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(inp, q);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
      inp.focus();
      return true;
    }

    function closeSidebar() {
      closePanel();
      const b = obWsBtns().find((x) => x.name === 'サイドバーを閉じる');
      if (b && obPress(b.el)) return;
      const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '\\', code: 'Backslash', keyCode: 220, which: 220, metaKey: mac, ctrlKey: !mac, bubbles: true, cancelable: true, composed: true }));
    }

    async function importFile(f) {
      openPanel();
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { addBuri({ text: '「' + f.name + '」は大きすぎます（上限 5MB）。', cards: [], chips: [], actions: [] }); return; }
      let text = '';
      try { text = await f.text(); }
      catch (e) { addBuri({ text: 'ファイルを読めませんでした。' + String(e && e.message || e), cards: [], chips: [], actions: [] }); return; }
      const r = BURI.importText(text, f.name);
      const g = r.ok ? await BURI.ask('こんにちは') : { chips: [] };
      addBuri({ text: r.message, cards: [], chips: g.chips || [], actions: r.ok ? [] : ['import'] });
    }

    function layout() {
      if (floatMode) {
        header.hidden = false;
        close.hidden = true;
        header.classList.add('floating');
        panel.classList.add('floating');
        if (!panelOpen) { panel.hidden = true; return; }
        panel.hidden = false;
        return;
      }
      header.classList.remove('floating');
      panel.classList.remove('floating');
      close.hidden = false;
      const side = obSide(), all = obAllEl;
      const show = !!(OB.on && obEl && obEl.isConnected && obEl.style.display !== 'none' && all && all.isConnected && obSidebarVisible(side));
      if (!show) { header.hidden = true; panel.hidden = true; return; }
      const sr = side.getBoundingClientRect(), ar = all.getBoundingClientRect();
      const x = Math.round((obEl.getBoundingClientRect().left || sr.left) + obRailW + 8);
      const w = Math.floor(sr.right - x - 8);
      if (w < 70 || !ar.height) { header.hidden = true; panel.hidden = true; return; }
      header.hidden = false;
      const y = Math.round(ar.top + (ar.height - 36) / 2);
      setS(header, 'left', x + 'px'); setS(header, 'top', y + 'px'); setS(header, 'width', w + 'px');
      if (!panelOpen) { panel.hidden = true; return; }
      panel.hidden = false;
      const pt = y + 36 + 6;
      const pw = Math.max(200, Math.min(Math.max(w, 340), window.innerWidth - x - 12));
      setS(panel, 'left', x + 'px'); setS(panel, 'top', pt + 'px'); setS(panel, 'width', pw + 'px');
      setS(panel, 'max-height', Math.max(180, Math.min(620, window.innerHeight - pt - 12)) + 'px');
    }

    input.addEventListener('compositionstart', () => { composing = true; });
    input.addEventListener('compositionend', () => { composing = false; });
    input.addEventListener('focus', openPanel);
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') { if (e.isComposing || composing || e.keyCode === 229) return; e.preventDefault(); submit(); }
      else if (e.key === 'Escape') { e.preventDefault(); closePanel(); input.blur(); }
    });
    go.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (input.value.trim()) submit(); else { input.focus(); openPanel(); } });
    close.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeSidebar(); });
    bImp.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); file.click(); });
    bSave.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const r = BURI.save(); addBuri({ text: r.message, cards: [], chips: [], actions: [] }); });
    bForget.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const r = BURI.forget(); addBuri({ text: r.message, cards: [], chips: [], actions: [] }); });
    bX.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closePanel(); });
    /* v48: AI の設定（鍵は ScriptCat の保存場所だけに置く） */
    bAI.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const A = BURI.AI;
      const m = mk('div', 'cb-msg', null, log);
      mk('div', 'cb-av', AVATAR, m);
      const b = mk('div', 'cb-body', null, m);
      const box = mk('div', 'cb-card', null, b);
      mk('strong', null, 'AI の設定', box);
      const css = 'width:100%;margin:2px 0 4px;padding:4px 6px;border:1px solid var(--ca-borSecTra);border-radius:6px;background:transparent;color:inherit;font:inherit';
      const pv = mk('select', null, null, box); pv.style.cssText = css;
      BURI.PROVIDERS.forEach(([v, l]) => { const o = mk('option', null, l, pv); o.value = v; if (v === A.provider) o.selected = true; });
      const note = mk('div', 'cb-meta', null, box);
      const link = mk('a', null, 'aistudio.google.com/apikey を開く（無料の鍵を作る）', box); link.href = 'https://aistudio.google.com/apikey'; link.target = '_blank'; link.rel = 'noopener'; link.style.cssText = 'font-size:11px;color:var(--lm-accent,#2783de)';
      const key = mk('input', null, null, box); key.type = 'password'; key.style.cssText = css;
      const sel = mk('select', null, null, box); sel.style.cssText = css;
      const wl = mk('label', 'cb-meta', null, box); const wc = mk('input', null, null, wl); wc.type = 'checkbox'; wc.checked = A.web; wl.append(' Google でも調べる（検索は無料）');
      const paint = () => {
        const p = pv.value;
        link.style.display = p === 'gemini' ? '' : 'none';
        key.style.display = sel.style.display = (p === 'gemini' || p === 'claude') ? '' : 'none';
        const has = p === 'gemini' ? A.gkey : A.key;
        key.value = ''; key.placeholder = has ? '入っています（替える時だけ入力）' : (p === 'gemini' ? 'AIza…' : 'sk-ant-…');
        sel.textContent = '';
        (p === 'claude' ? BURI.AI_MODELS : BURI.GEMINI_MODELS).forEach(([v, l]) => { const o = mk('option', null, l, sel); o.value = v; if (v === (p === 'claude' ? A.model : A.gmodel)) o.selected = true; });
        note.textContent = p === 'gemini' ? '無料です。Google アカウントで AI Studio を開き「API キーを作成」→ 下に貼るだけ。カード登録は不要で、請求先を登録しない限りお金はかかりません（使いすぎると少し待たされるだけ）。無料枠では、送った質問が Google の改善に使われることがあります。鍵はこの端末の ScriptCat の中だけに保存します。'
          : p === 'chrome' ? (BURI.chromeLM() ? '無料・鍵なし。この Chrome の中の AI（Gemini Nano）で答えます。外には送りません。初回はモデルのダウンロードで少し待つことがあります。読める量が少ないので、答えは短め・素朴です。' : 'この Chrome では内蔵 AI が見つかりません（新しい Chrome・空きディスク・ある程度の性能が要ります）。選んでおくと、使えない間は抜粋モードで答えます。')
          : p === 'claude' ? '有料（使った分だけ）。Anthropic の API キー（console.anthropic.com）。いちばん上手に話しますが、お金がかかります。'
          : 'AI は使いません。見つけた抜粋をつないで答えます（無料・外へ送るのは Google 検索の言葉だけ）。';
      };
      pv.addEventListener('change', paint); paint();
      const row = mk('div', 'cb-chips', null, box);
      const ok = mk('button', 'cb-chip', '保存', row); ok.type = 'button';
      const del = mk('button', 'cb-chip act', 'この鍵を消す', row); del.type = 'button';
      const rs = mk('button', 'cb-chip act', '会話を忘れる', row); rs.type = 'button';
      const say = (t) => addBuri({ text: t, cards: [], chips: [], actions: [] });
      ok.addEventListener('click', (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        const p = pv.value, k = key.value.trim();
        A.provider = p; BURI.gmSet('c33.buri.provider', p);
        if (p === 'gemini') { if (k) { A.gkey = k; BURI.gmSet('c33.buri.gkey', k); } A.gmodel = sel.value; BURI.gmSet('c33.buri.gmodel', A.gmodel); }
        if (p === 'claude') { if (k) { A.key = k; BURI.gmSet('c33.buri.key', k); } A.model = sel.value; BURI.gmSet('c33.buri.model', A.model); }
        A.web = wc.checked; BURI.gmSet('c33.buri.web', A.web); BURI.aiReset(); footText(); m.remove();
        say(BURI.aiOn() ? BURI.aiName() + ' で準備できました。なんでも聞いてください。たとえば「東野圭吾について教えて」。' : p === 'none' ? 'AI は使わずに、見つけたものをつないで答えます。' : '設定を保存しました（' + (p === 'chrome' ? 'この Chrome では内蔵 AI が見つからないので、しばらくは抜粋で答えます' : '鍵がまだ入っていません') + '）。');
      });
      del.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); if (pv.value === 'claude') { A.key = ''; BURI.gmSet('c33.buri.key', ''); } else { A.gkey = ''; BURI.gmSet('c33.buri.gkey', ''); } footText(); m.remove(); say('鍵を消しました。'); });
      rs.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); BURI.aiReset(); m.remove(); say('これまでの会話を忘れました。'); });
      scrollEnd();
    });
    file.addEventListener('change', () => { const f = file.files && file.files[0]; file.value = ''; importFile(f); });
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePanel(); } });
    document.addEventListener('pointerdown', (e) => {
      if (!panelOpen) return;
      const t = e.target;
      if (header.contains(t) || panel.contains(t)) return;
      closePanel();
    }, true);
    
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === 'KeyB') {
        e.preventDefault(); e.stopPropagation();
        floatMode = true;
        input.focus(); openPanel();
        layout();
      }
    }, true);
    
    window.addEventListener('resize', layout);
    setInterval(layout, 150);

    BURI.restore();
    updState();

    for (const name of ['off', 'on', 'toggle']) {
      const original = window.__c33[name];
      if (typeof original !== 'function') continue;
      window.__c33[name] = (...args) => { const v = original(...args); layout(); return v; };
    }
    window.__c33.buri = {
      ask(q) { send(q); return BURI.state(); },
      answer: (q) => BURI.ask(q),
      importText: (text, name) => { const r = BURI.importText(text, name); updState(); return r; },
      save: () => { const r = BURI.save(); updState(); return r; },
      forget: () => { const r = BURI.forget(); updState(); return r; },
      clear: () => { const r = BURI.clear(); updState(); return r; },
      state: () => BURI.state(),
      open() { input.focus(); openPanel(); return true; },
      close() { closePanel(); return true; }
    };
    layout();
  }

  /* v48: 窓口（v38 で消えていて B.U.R.I の起動が途中で止まっていた） */
  window.__c33 = { version: VERSION, on: () => obApply(true), off: () => obApply(false), toggle: () => obToggle(), select: (g) => obSelect(g), status: () => Object.assign({}, ST, { orbit: Object.assign({}, OB) }) };
  obBoot();
  obSearchBoot();
})();