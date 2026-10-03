// ==UserScript==
// @name         « No »　³³ _ Sidebar Constellation
// @namespace    https://cordivestium.local/sidebar-constellation
// @version      2.2.0
// @description  v2.2.0: 選択中・カーソルを乗せた時の灰色の箱（影）を出さない（__c33.set({ noBg: false }) で戻せる）。v2.1.0: 書体を 1 つにそろえた（ビューも行と同じ書体）・ビューに付けたアイコンを表示・ビューのアイコンの左端を上の DB の題名の 1 文字目にそろえる（実測）・アイコンの大きさ／文字との間／上下、文字の上下、行の高さ、ワークスペースの間隔などを全部 CSS 変数にし ²⁶ Atelier の「サイドバー」から調整できるように。今開いているページ・ビューを太字に。v1.1.0: 字下げが効いていなかった・ビューのアイコンが■になっていた・ビューが左端に崩れていたのを修正。線・選択時の背景と左の印をやめ、ワークスペースごとに間を空けて区分けを明確に。サイドバーの大幅な見直し。階層を ★グループ ／ ■ワークスペース ／ ●フルDB（ワークスペースと同じ段）／ ▲各種ビュー（DB の下）に組み直し、ビューの「•」をビューの種類のアイコン（表・ボード・ギャラリー・リスト・カレンダー・タイムライン・グラフ・フィード・地図・フォーム・Atlas）に。ワークスペースは小さな見出し、DB とページは明朝の行、ビューは細い導線つきの小さな行、選択中は左に色の印。¹⁶ Sidebar Workspace Grouper（v15.6.0 以降）と一緒に使う。Notion の要素は動かさず、印と CSS だけで描く。
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
 * v2.2.0（2026-10-03）
 *   ・選択中の行の灰色の箱が残っていた: Notion は背景を行そのものではなく、行を包む入れ物や行の中の帯に付けることがあり、
 *     前の版は行の style 属性（bacIntTra）しか見ていなかった → 行・包む入れ物・中の帯・疑似要素の背景と影を全部消す。
 *     選択中は太字だけで示す。戻すには __c33.set({ noBg: false })
 *
 * v2.1.0（2026-10-03）
 *   ・書体: DB・ページの行は明朝、ビューは Notion の素の書体、と混ざっていた → 全部 --c33-item-font（ビューは --c33-view-font＝既定で同じ）。
 *     太さも変数に（行 500・ビュー 400・選択中 700）
 *   ・ビューのアイコン: ビューに付けたアイコン（Notion のビュー設定）を読み、あればそれを出す（画像・絵文字）。無ければ種類のアイコン
 *   ・ビューのアイコンの左端 = 上の DB の題名の 1 文字目（文字の位置を実測して合わせる・大きさを変えても追従）
 *   ・調整できる値（²⁶ Atelier「サイドバー」）:
 *       行: 書体・大きさ・太さ・字間・色・行の高さ・アイコンの大きさ・アイコンと文字の間・アイコンの上下左右・文字の上下
 *       ビュー: 同じ一式＋アイコンの開始位置のずらし（--c33-view-shift）
 *       ワークスペース: 書体・大きさ・太さ・字間・色・上の間隔・下の間隔
 *       選択中: 太さ・色
 *   ・今開いているページ／ビューに印（data-c33-cur）を付けて太字に（Notion の選択の背景は出さない）
 *
 * v1.1.0（2026-10-03）
 *   ・字下げが一度も効いていなかった: CSS が data-c33-pad という属性を条件にしていたのに、JS は CSS 変数しか付けていなかった。
 *   ・ビューのアイコンが「■」: 土台の規則（強さ ID 3 つ分）が mask を none で打ち消し、種類ごとの絵の指定（弱い）が負けていた。
 *   ・ビューが左端に崩れる: Notion のビュー行の字下げは深さに関係なく 24px 固定。「左に浅い行が DB」という判定が外れていた
 *     → ビュー行のすぐ上のページ行を DB とみなし、DB の位置＋一段で描く。
 *   ・見た目: グループの間の線・ビューの導線・選択中の背景と左の印をやめた（ずらしているのが背景で見えていた）。
 *     選択中は文字を濃く太く。ワークスペース（■）は小さな見出しにして、ワークスペースごとに少し間を空ける。
 *
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
 *   ・デザイン: ★グループ見出しの件数は小さな丸。■ワークスペースは字間を空けた小さな見出し。●行は明朝 13px。▲ビューは 12px（v1.1.0 で線と選択の背景はやめた）。
 *       値は CSS 変数（--c33-*）。²⁶ Atelier の「サイドバー」から書体・大きさを変えられる。
 *   ・Notion の要素は動かさない（属性 data-c33-* と CSS 変数だけ）。¹⁶ の並べ替え・ドラッグはそのまま。
 *   ・コンソール: __c33.status() ／ __c33.set({ flat, scale }) ／ __c33.off()
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '2.2.0';
  const TAG = '[³³ v' + VERSION + ']';
  if (window.__c33 && window.__c33.version) { console.warn(TAG, '旧版が動いています'); return; }

  const LS = 'c33.prefs.v1';
  const LS_DB = 'c33.db.v1';     // DB だと分かった行の名前（閉じていても DB の印を付ける）
  const P = { flat: true, scale: 0.8, viewIndent: 18, on: true, alignViews: true, viewShift: 0, noBg: true };
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
  /* v2.1.0: ビューに付けたアイコン（Notion のビュー設定のアイコン）。形式の揺れに備えて icon を含む鍵を広く見る */
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
  const curView = () => (new URLSearchParams(location.search).get('v') || '').replace(/-/g, '').toLowerCase();
  function curPage() { const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname) || /([0-9a-f]{32})/i.exec(location.pathname); return m ? m[1].toLowerCase() : ''; }
  /* v2.1.0: ビューのアイコンの左端を、上の DB の題名の 1 文字目にそろえる（実測） */
  function alignViews(info) {
    requestAnimationFrame(() => {
      for (const x of info) {
        if (!x.view || !x.dbRow) continue;
        const t = x.dbRow.r.querySelector('.notranslate');
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
  /* 文字の 1 文字目の左端（入れ物の余白ではなく、実際の文字） */
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
    if (!rows.length) return;
    const info = rows.map((r) => ({ r, pad: padOf(r), slot: bulletSlot(r) }));
    const pagePads = info.filter((x) => !x.slot).map((x) => x.pad);
    const minPad = pagePads.length ? Math.min(...pagePads) : Math.min(...info.map((x) => x.pad));
    /* ビューの行のすぐ上（左に浅い）のページ行が DB */
    /* ビュー行のすぐ上（間にビュー行だけを挟む）のページ行が DB（Notion のビュー行の字下げは 24px 固定なので深さでは見ない） */
    for (let i = 0; i < info.length; i++) {
      const x = info[i];
      if (!x.slot) continue;
      for (let j = i - 1; j >= 0; j--) {
        if (info[j].slot) continue;
        info[j].db = true; x.dbRow = info[j]; break;
      }
    }
    const teamKey = team.getAttribute('data-c16-k') || norm(btn.textContent);
    let viewIx = new Map();
    for (const x of info) {
      const { r } = x;
      if (x.slot) {
        const db = x.dbRow;
        const base = db ? db.newPad : teamPad;
        const pad = base + P.viewIndent + (P.alignViews ? (r.__c33dx || 0) : 0);
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
        /* ビュー自身のアイコン（設定してあれば種類のアイコンより優先） */
        const ic = rec && rec.icon;
        const u = ic ? iconUrl(ic) : '';
        if (u) { setAttr(x.slot, 'data-c33-vic', 'img'); setVar(x.slot, '--c33-vimg', 'url("' + u.replace(/"/g, '%22') + '")'); x.slot.removeAttribute('data-c33-vemo'); }
        else if (ic) { setAttr(x.slot, 'data-c33-vic', 'emoji'); setAttr(x.slot, 'data-c33-vemo', ic); }
        else { x.slot.removeAttribute('data-c33-vic'); x.slot.removeAttribute('data-c33-vemo'); }
        /* 今開いているビュー */
        const cur = rec && curView() === rec.id.replace(/-/g, '');
        if (cur) setAttr(r, 'data-c33-cur', '1'); else if (r.hasAttribute('data-c33-cur')) r.removeAttribute('data-c33-cur');
        x.view = true;
        ST.views++;
        continue;
      }
      const name = nameOf(r);
      const level = Math.max(0, x.pad - minPad);
      x.newPad = P.flat ? teamPad + level * P.scale : x.pad;
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
    if (P.alignViews) alignViews(info);
  }
  function scan() {
    if (!P.on) return;
    ST.scans++; ST.rows = 0; ST.views = 0; ST.dbs = 0;
    document.documentElement.setAttribute('data-c33', P.flat ? 'flat' : 'nest');
    document.documentElement.toggleAttribute('data-c33-nobg', P.noBg !== false);
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
    const icons = Object.entries(VICON).map(([k, v]) => 'html[data-c33] [data-c33-kind="view"][data-c33-vt="' + k + '"] [data-c33-vslot]' + B + '::after{-webkit-mask-image:' + v + ' !important;mask-image:' + v + ' !important;}').join('\n');
    st.textContent = `
:root {
  --c33-serif: var(--c16-head-font, "Baskerville", "Hiragino Mincho ProN", "Yu Mincho", serif);
  /* ● DB・ページの行 */
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
  /* ▲ ビューの行（書体は行と同じ） */
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
  /* ■ ワークスペース */
  --c33-team-font: var(--c33-serif);
  --c33-team-size: 10.5px;
  --c33-team-weight: 600;
  --c33-team-track: .14em;
  --c33-team-color: var(--c-texSec, #787774);
  --c33-team-gap: 8px;
  --c33-team-after: 0px;
  /* 選択中 */
  --c33-cur-weight: 700;
  --c33-cur-color: var(--c-texPri, #37352f);
  --c33-radius: 6px;
}
/* ★ グループ見出し: 件数を小さな丸に */
html[data-c33] #c16-root .c16-cnt${B} { min-width: 18px; height: 16px; padding: 0 5px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: color-mix(in srgb, var(--c-texPri, #37352f) 6%, transparent); font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
/* ■ ワークスペース（小さな見出し）。ワークスペースごとに少し間を空ける */
html[data-c33] ${SEL_TEAM}[data-c33-team]${B} { margin-top: var(--c33-team-gap) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B} { margin-bottom: var(--c33-team-after) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B},
html[data-c33] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN} :is(div, span):not(:has(svg, img))${B} { font-family: var(--c33-team-font) !important; font-size: var(--c33-team-size) !important; font-weight: var(--c33-team-weight) !important; letter-spacing: var(--c33-team-track) !important; text-transform: uppercase !important; color: var(--c33-team-color) !important; }
/* ● DB・ページ ／ ▲ ビュー: 字下げ */
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][data-c33-pad]${B} { padding-inline-start: var(--c33-pad) !important; }
/* ● 行: 書体は 1 つの変数にそろえる（文字の入れ物の中まで） */
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"])${B} { height: var(--c33-item-h) !important; min-height: var(--c33-item-h) !important; border-radius: var(--c33-radius) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) :is(.notranslate, .notranslate *)${B} { font-family: var(--c33-item-font) !important; font-size: var(--c33-item-size) !important; font-weight: var(--c33-item-weight) !important; letter-spacing: var(--c33-item-track) !important; color: var(--c33-item-color) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) .notranslate${B} { transform: translateY(var(--c33-text-dy)); }
/* ● 行のアイコン: 大きさ・文字との間・位置 */
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) > :first-child${B} { min-width: var(--c33-icon-size) !important; margin-inline-end: var(--c33-icon-gap) !important; transform: translate(var(--c33-icon-dx), var(--c33-icon-dy)); }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) > :first-child .notion-record-icon${B} { width: var(--c33-icon-size) !important; height: var(--c33-icon-size) !important; font-size: calc(var(--c33-icon-size) * .86) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) > :first-child .notion-record-icon :is(img, svg, div[style*="mask"], span)${B} { width: var(--c33-icon-size) !important; height: var(--c33-icon-size) !important; max-width: none !important; max-height: none !important; }
/* ▲ ビュー: 行と同じ書体（小さめ・淡め） */
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"]${B} { min-height: var(--c33-view-h) !important; height: var(--c33-view-h) !important; border-radius: var(--c33-radius) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"] :is(div, span):not([data-c33-vslot]):not(:has(svg, img))${B} { font-family: var(--c33-view-font) !important; font-size: var(--c33-view-size) !important; font-weight: var(--c33-view-weight) !important; letter-spacing: var(--c33-view-track) !important; color: var(--c33-view-color) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind="view"] > :not([data-c33-vslot])${B} { transform: translateY(var(--c33-vtext-dy)); }
/* 選択中: 背景・影は出さず、文字を濃く太く（今開いているページ・ビュー） */
/* v2.2.0: 選択中・乗せた時の灰色の箱（影）を出さない — 行そのもの・行を包む入れ物・行の中の横いっぱいの帯、のどこに付いても消す */
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]:hover${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] :is([role="treeitem"], a, [role="button"]):has(> [data-c33-kind])${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] :is([role="treeitem"], a, [role="button"]):has(> [data-c33-kind]):hover${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind] > :not(:first-child)${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] div:has(> [data-c33-kind]):not(:has(> [data-c33-kind] ~ [data-c33-kind]))${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] div:has(> [data-c33-kind]):not(:has(> [data-c33-kind] ~ [data-c33-kind])):hover${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B}::before,
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] [data-c33-kind]${B}::after { background: transparent !important; background-color: transparent !important; box-shadow: none !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][data-c33-cur] :is(.notranslate, .notranslate *, div:not(:has(*)), span:not(:has(*)))${B} { font-weight: var(--c33-cur-weight) !important; color: var(--c33-cur-color) !important; }
/* ▲ ビューのアイコン（「•」の代わり）: 種類のアイコン、またはビューに付けたアイコン */
html[data-c33] [data-c33-vslot]${B} { position: relative; width: var(--c33-vicon-size) !important; min-width: var(--c33-vicon-size) !important; margin-inline-end: var(--c33-vicon-gap) !important; padding: 0 !important; }
html[data-c33] [data-c33-vslot]${B} > * { opacity: 0 !important; }
html[data-c33] [data-c33-vslot]${B}::after { content: ""; position: absolute; left: 0; top: 50%; width: var(--c33-vicon-size); height: var(--c33-vicon-size); transform: translateY(calc(-50% + var(--c33-vicon-dy))); background: currentColor; opacity: .78; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
html[data-c33] [data-c33-kind="view"][data-c33-vt] [data-c33-vslot][data-c33-vic="img"]${B}::after { background: var(--c33-vimg) center / contain no-repeat !important; -webkit-mask-image: none !important; mask-image: none !important; opacity: 1; }
html[data-c33] [data-c33-kind="view"][data-c33-vt] [data-c33-vslot][data-c33-vic="emoji"]${B}::after { content: attr(data-c33-vemo) !important; background: none !important; -webkit-mask-image: none !important; mask-image: none !important; opacity: 1; display: flex; align-items: center; justify-content: center; font-size: calc(var(--c33-vicon-size) * .9); line-height: 1; font-family: "Apple Color Emoji", "Segoe UI Emoji", sans-serif; }
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
  document.addEventListener('atelier-change', () => schedule(60));   // ²⁶ Atelier で大きさ・間隔を変えた時に揃え直す
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
