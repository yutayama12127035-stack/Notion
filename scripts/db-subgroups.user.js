// ==UserScript==
// @name         « No »　³⁶ _ Sub Groups
// @namespace    https://cordivestium.local/sub-groups
// @version      14.0.0
// @description  v14.0.0: 「⊞ サブグループ」をビューの先頭（メインのグループより上）から、Notion の道具の段（フィルター・並べ替えの並び）の左端へ。サブグループを「表の続き」でなく色の帯の段に（帯の見出し・件数の札・チェックの進み具合・★平均・行の左の色の線・段の間のすき間）。データベースの「グループ」（Group by）を、ボードビュー以外（表・リスト・ギャラリー）でもサブグループに分ける。Notion の標準ではサブグループはボードだけ。グループの中を、もう 1 つのプロパティ（セレクト・ステータス・マルチセレクト・チェックボックス・日付・人・リレーション・テキスト・数値など）の値ごとに見出しを付けて並べ分け、見出しのクリックで畳む。ビューごとに覚える。グループ分けしていないビューでも使える（ビュー全体をサブグループに分ける）。見た目だけで、Notion のデータや並び順は変えない。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/*
 * v14.0.0（2026-10-09）— 「サブグループ」がメインのグループより上に出ていた・表の続きに見えていた、を作り直し
 *   ・「⊞ サブグループ」はビューの先頭（＝メインのグループの見出しより上）に差し込んでいた → Notion の上の道具の段
 *     （フィルター・並べ替え・検索の並び）の左端に、同じ形のボタンとして置く。使っている間はプロパティの名前も出す
 *   ・サブグループを「表の延長」でなく「段」に: 色の帯の見出し（色の札・アイコン・件数）、行の左に色の線、段の間にすき間。
 *     見出しに小さな集計 — チェック（読了など）があれば「✓ 3/10」と細い進み具合、評価・点数・score などの数があれば「★ 平均」
 *   ・見出しを開く／畳む時の小さな動き
 * v13.0.0（2026-10-04）
 *   ・Notion の「ビューの設定」（View settings）の「Group」のすぐ下に「サブグループ」の行。押すと Notion と同じ形の小メニューで
 *     プロパティ・並び・畳む／開く・グループごとの設定（このグループはサブグループにしない／このグループだけ別のプロパティで）。
 *   ・グループごとの設定: グループの見出し（▼ の右の名前）で見分けて覚える。
 *   ・左上の「⊞ サブグループ」を Notion のボタンの形に（アイコン＋今のプロパティ）。
 * v2.0.0（2026-10-03）
 *   ・本物の Notion で確かめた結果、表のグループの中身は「見えている行だけ描く」作り（行は絶対位置・translateY）で、
 *     v1 の並べ替え（CSS の order）が効かなかった → 行の位置を CSS（!important）で上書きし、見出しを絶対位置で差し込む。
 *     並べ替えた先で行が描かれず空かないよう、サブグループを使っている間だけ Notion に行を広く描かせる（document-start で動く）。
 *   ・今の Notion の API（syncRecordValuesMain）にも対応（旧 syncRecordValues が 403 の所）。
 * v1.1.0（2026-10-03）
 *   ・リレーション（Series・Synopsis など）で分けた時、関係先が 1 つなら、そのページのアイコンを見出しに出す。
 * v1.0.0（2026-10-03）
 *   ・Notion のグループ（ビューの設定 › Group）は、表・リスト・ギャラリーでも使えるが、サブグループ（Sub-group）はボードだけ。
 *     → グループの中の行（カード）を、選んだプロパティの値ごとに並べ替え、値ごとに見出し（▾ 値 · 件数）を差し込む。
 *   ・仕組み: 行の data-block-id から、API（syncRecordValues）で行の値を読む（プロパティが画面に出ていなくてよい）。
 *     行を動かさず、グループの入れ物を flex（ギャラリーは grid のまま）にして CSS の order で並べる（React の行には触らない）。
 *     「+ New」「Load more」などは、いつもどおりグループの最後。
 *   ・使い方:
 *       グループ分けしたビューの左上に「⊞ サブグループ」— 押すとプロパティを選ぶ。
 *       グループ分けしていないビュー・小窓を出したくない時: ビューの上にマウスを置いて ⌃⌥G。
 *       見出しのクリックで畳む／開く。見出しの右クリックでメニュー（プロパティの変更・逆順・すべて畳む／開く・やめる）。
 *   ・並び: セレクト・ステータスは Notion の選択肢の順、それ以外は名前順（数は数の順）。値の無い行は最後の「（なし）」。
 *     マルチセレクト・リレーション・人で値が複数の行は、その組み合わせ（A・B）の見出しへ。
 *   ・ボードビューは Notion にサブグループがあるので触らない。
 *   ・コンソール: __c36.status() ／ __c36.set({ bar, hotkey }) ／ __c36.clear()
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '14.0.0';
  const TAG = '[³⁶ v' + VERSION + ']';
  if (window.__c36 && window.__c36.version) { console.warn(TAG, '旧版が動いています'); return; }

  /* v2.0.0: 本物の Notion の表は「見えている行だけ描く」（TanStack Virtual・行は絶対位置）。
     並べ替えると、Notion が描いていない行の場所が空く → サブグループを使っている間だけ、行を描く範囲を広げる
     （スクロールの入れ物の高さを ResizeObserver に大きめに伝える）。document-start で ResizeObserver を包む。 */
  const INF = { on: false, extra: 6000, regs: new Set() };
  try {
    const RO0 = window.ResizeObserver;
    if (RO0 && !RO0.__c36) {
      const isScroller = (t) => t && t.classList && t.classList.contains('notion-scroller');
      const fake = (t, e) => {
        const r = e ? null : t.getBoundingClientRect();
        const b = e && e.borderBoxSize && e.borderBoxSize[0];
        const w = b ? b.inlineSize : e ? e.contentRect.width : r.width;
        const h = b ? b.blockSize : e ? e.contentRect.height : r.height;
        const box = [{ inlineSize: w, blockSize: h + INF.extra }];
        return { target: t, contentRect: e ? e.contentRect : r, borderBoxSize: box, contentBoxSize: box, devicePixelContentBoxSize: e ? e.devicePixelContentBoxSize : box };
      };
      const RO = class extends RO0 {
        constructor(cb) {
          const wrap = (entries, obs) => cb(INF.on ? entries.map((e) => (isScroller(e.target) ? fake(e.target, e) : e)) : entries, obs);
          super(wrap);
          this.__c36cb = wrap; this.__c36cb0 = cb; this.__c36t = new Set();
        }
        observe(t, o) { if (isScroller(t)) { this.__c36t.add(t); INF.regs.add(this); } return super.observe(t, o); }
        unobserve(t) { this.__c36t.delete(t); return super.unobserve(t); }
        disconnect() { this.__c36t.clear(); INF.regs.delete(this); return super.disconnect(); }
      };
      RO.__c36 = true;
      window.ResizeObserver = RO;
    }
  } catch (e) { /* noop */ }
  /* 範囲を広げる／戻す（Notion の仮想スクロールに測り直させる） */
  function inflate(on) {
    if (INF.on === on) return;
    INF.on = on;
    for (const o of INF.regs) for (const t of o.__c36t) {
      if (!t.isConnected) continue;
      try { o.__c36cb0([on ? (() => { const r = t.getBoundingClientRect(); const box = [{ inlineSize: r.width, blockSize: r.height + INF.extra }]; return { target: t, contentRect: r, borderBoxSize: box, contentBoxSize: box }; })() : (() => { const r = t.getBoundingClientRect(); const box = [{ inlineSize: r.width, blockSize: r.height }]; return { target: t, contentRect: r, borderBoxSize: box, contentBoxSize: box }; })()], o); } catch (e) { /* noop */ }
    }
  }

  const LS_P = 'c36.prefs.v1';
  const LS_V = 'c36.views.v1';
  const P = { on: true, bar: true, hotkey: true, refresh: 20000 };
  let VIEWS = {};   // key → { prop, rev, closed: {value: 1} }
  try { Object.assign(P, JSON.parse(localStorage.getItem(LS_P) || '{}')); } catch (e) { /* noop */ }
  try { VIEWS = JSON.parse(localStorage.getItem(LS_V) || '{}') || {}; } catch (e) { VIEWS = {}; }
  const saveP = () => { try { localStorage.setItem(LS_P, JSON.stringify(P)); } catch (e) { /* noop */ } };
  const saveV = () => { try { localStorage.setItem(LS_V, JSON.stringify(VIEWS)); } catch (e) { /* noop */ } };
  /* v13: グループごとの設定 cfg.groups = { 見出しの名前: 'off' | プロパティの id }。cfg.prop が空でも、どれかのグループに指定があれば動く */
  const active = (c) => !!(c && (c.prop || (c.groups && Object.values(c.groups).some((v) => v && v !== 'off'))));
  const effProp = (c, g) => { const o = c && c.groups && g ? c.groups[g] : ''; if (o === 'off') return ''; return o || (c && c.prop) || ''; };
  const ST = { scans: 0, views: 0, bodies: 0, rows: 0, heads: 0, api: 0, lastError: '' };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const dash = (id) => {
    const h = String(id || '').replace(/-/g, '');
    return h.length === 32 ? h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20) : String(id || '');
  };

  /* ============================================================
   *  API（syncRecordValues）
   * ============================================================ */
  /* v-API: 旧 /api/v3/syncRecordValues が通らない環境（公開ページなど・HTTP 403）では、今の Notion が使う
     syncRecordValuesMain（pointer 形式）に切り替える。一度通った方を覚える */
  let API_EP = null;
  async function apiPostRV(requests) {
    const send = (ep, reqs) => fetch(location.origin + '/api/v3/' + ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ requests: reqs }) });
    const asPointer = requests.map((r) => (r.pointer ? r : { pointer: { table: r.table, id: r.id }, version: r.version == null ? -1 : r.version }));
    const order = API_EP === 'main' ? ['main', 'legacy'] : ['legacy', 'main'];
    let last = null;
    for (const k of order) {
      try {
        const res = k === 'main' ? await send('syncRecordValuesMain', asPointer) : await send('syncRecordValues', requests);
        if (res.ok) { API_EP = k; return res.json(); }
        last = res;
      } catch (e) { last = e; }
    }
    return { __fail: last && last.status ? last.status : String(last) };
  }
  async function api(reqs) {
    ST.api++;
    const j = await apiPostRV(reqs.map((r) => ({ table: r.table, id: r.id, version: -1 })));
    const out = new Map();
    for (const r of reqs) {
      const n = j && j.recordMap && j.recordMap[r.table] && j.recordMap[r.table][r.id];
      const v = n && (n.value && n.value.value ? n.value.value : n.value);
      if (v) out.set(r.table + ':' + r.id, v);
    }
    return out;
  }
  const REC = new Map();       // 'table:id' → { v, at }
  const PENDING = new Map();
  async function records(table, ids, maxAge) {
    const now = Date.now();
    const need = ids.filter((id) => { const c = REC.get(table + ':' + id); return !c || (maxAge != null && now - c.at > maxAge); });
    const jobs = [];
    for (let i = 0; i < need.length; i += 80) {
      const slice = need.slice(i, i + 80).filter((id) => !PENDING.has(table + ':' + id));
      if (!slice.length) continue;
      const pr = api(slice.map((id) => ({ table, id }))).then((m) => {
        const at = Date.now();
        for (const id of slice) { PENDING.delete(table + ':' + id); const v = m.get(table + ':' + id); if (v) REC.set(table + ':' + id, { v, at }); }
      });
      for (const id of slice) PENDING.set(table + ':' + id, pr);
      jobs.push(pr);
    }
    for (const id of ids) { const p = PENDING.get(table + ':' + id); if (p && !jobs.includes(p)) jobs.push(p); }
    await Promise.all(jobs);
    const out = new Map();
    for (const id of ids) { const c = REC.get(table + ':' + id); if (c) out.set(id, c.v); }
    return out;
  }
  const rec = (table, id) => { const c = REC.get(table + ':' + id); return c ? c.v : null; };

  /* ビューの DB（collection）と、その項目の定義 */
  const COLL = new Map();   // blockId → Promise<{ cid, schema }>
  function collOf(blockId) {
    if (COLL.has(blockId)) return COLL.get(blockId);
    const pr = (async () => {
      const b = (await records('block', [blockId])).get(blockId);
      if (!b) return null;
      const cid = b.collection_id || (b.format && b.format.collection_pointer && b.format.collection_pointer.id);
      if (!cid) return null;
      const c = (await records('collection', [cid])).get(cid);
      if (!c || !c.schema) return null;
      return { cid, schema: c.schema, viewIds: b.view_ids || [] };
    })().catch((e) => { ST.lastError = String(e); return null; });
    COLL.set(blockId, pr);
    pr.then((x) => { if (!x) setTimeout(() => COLL.delete(blockId), 15000); });
    return pr;
  }

  /* ============================================================
   *  値の読み取り（プロパティの種類ごと）
   * ============================================================ */
  const USABLE = new Set(['select', 'status', 'multi_select', 'checkbox', 'date', 'person', 'relation', 'text', 'title', 'number', 'url', 'email', 'phone_number', 'created_time', 'last_edited_time', 'created_by', 'last_edited_by']);
  const TYPE_MARK = { select: '◉', status: '◐', multi_select: '☰', checkbox: '☑', date: '◷', person: '☺', relation: '↗', text: '¶', title: 'Aa', number: '#', url: '⌁', email: '@', phone_number: '☎', created_time: '◷', last_edited_time: '◷', created_by: '☺', last_edited_by: '☺' };
  const plain = (v) => (Array.isArray(v) ? v.map((s) => (Array.isArray(s) && typeof s[0] === 'string' ? (s[0] === '‣' ? '' : s[0]) : '')).join('') : '');
  const mentions = (v, kind) => {
    const out = [];
    if (!Array.isArray(v)) return out;
    for (const s of v) if (Array.isArray(s) && Array.isArray(s[1])) for (const f of s[1]) if (Array.isArray(f) && f[0] === kind && f[1]) out.push(f[1]);
    return out;
  };
  const month = (d) => { const m = /^(\d{4})-(\d{2})/.exec(d || ''); return m ? m[1] + '-' + m[2] : ''; };
  const msMonth = (ms) => { if (!ms) return ''; const d = new Date(ms); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
  /* 行 → 見出しの値（文字列。'' は「なし」）。名前の解決が要るもの（人・リレーション）は ids を返す */
  function rawValue(row, pid, def) {
    const props = row.properties || {};
    const v = props[pid];
    switch (def.type) {
      case 'select': case 'status': return { keys: [plain(v)] };
      case 'multi_select': return { keys: plain(v).split(',').map(norm).filter(Boolean) };
      case 'checkbox': return { keys: [plain(v) === 'Yes' ? '✓' : '✗'] };
      case 'number': return { keys: [norm(plain(v))], num: true };
      case 'date': {
        const d = mentions(v, 'd')[0];
        return { keys: [d ? month(d.start_date) : ''] };
      }
      case 'created_time': return { keys: [msMonth(row.created_time)] };
      case 'last_edited_time': return { keys: [msMonth(row.last_edited_time)] };
      case 'person': return { users: mentions(v, 'u') };
      case 'created_by': return { users: [row.created_by_id].filter(Boolean) };
      case 'last_edited_by': return { users: [row.last_edited_by_id].filter(Boolean) };
      case 'relation': return { pages: mentions(v, 'p') };
      default: return { keys: [norm(plain(v)).slice(0, 80)] };
    }
  }
  async function valuesOf(ids, pid, def) {
    const rows = await records('block', ids, P.refresh);
    const raw = new Map();
    const users = new Set(), pages = new Set();
    for (const id of ids) {
      const r = rows.get(id);
      if (!r) continue;
      const x = rawValue(r, pid, def);
      raw.set(id, x);
      (x.users || []).forEach((u) => users.add(u));
      (x.pages || []).forEach((p) => pages.add(p));
    }
    if (users.size) await records('notion_user', [...users]);
    if (pages.size) await records('block', [...pages]);
    const out = new Map();
    for (const [id, x] of raw) {
      let keys = x.keys;
      if (x.users) keys = x.users.map((u) => { const n = rec('notion_user', u); return n ? (n.name || n.given_name || n.email || '?') : '…'; });
      let icon = null;
      if (x.pages) {
        keys = x.pages.map((p) => { const b = rec('block', p); return b ? norm(plain(b.properties && b.properties.title)) || '無題' : '…'; });
        /* 関係先が 1 つなら、そのページのアイコンを見出しに（シリーズなど） */
        if (x.pages.length === 1) { const b = rec('block', x.pages[0]); const pi = b && b.format && b.format.page_icon; if (pi) icon = { v: pi, id: x.pages[0] }; }
      }
      keys = (keys || []).filter(Boolean);
      out.set(id, { key: keys.join('・'), num: !!x.num, icon });
    }
    return out;
  }

  /* ============================================================
   *  画面: ビュー・グループの入れ物・行
   * ============================================================ */
  const VIEW_SEL = '.notion-table-view, .notion-gallery-view, .notion-list-view';
  const kindOf = (v) => (v.classList.contains('notion-table-view') ? 'table' : v.classList.contains('notion-gallery-view') ? 'gallery' : 'list');
  function blockOf(view) {
    const up = view.closest('.notion-collection_view-block, .notion-collection_view_page-block');
    if (up && up.getAttribute('data-block-id')) return up.getAttribute('data-block-id');
    const dn = view.querySelector('.notion-collection_view-block[data-block-id], .notion-collection_view_page-block[data-block-id]');
    if (dn) return dn.getAttribute('data-block-id');
    const pg = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname);
    return pg ? dash(pg[1]) : null;
  }
  function keyOf(view, bid) {
    const full = !view.closest('.notion-collection_view-block') && !!document.querySelector('.notion-frame') && view.closest('.notion-frame');
    const v = new URLSearchParams(location.search).get('v');
    if (full && v && !view.closest('.notion-peek-renderer')) return bid + '|' + v;
    /* インライン DB: 選んでいるビューのタブの名前で見分ける */
    const host = view.closest('.notion-collection_view-block') || view.parentElement;
    const tab = host && host.querySelector('.notion-collection-view-tab-button[aria-selected="true"], [role="tab"][aria-selected="true"]');
    return bid + '|' + kindOf(view) + '|' + norm(tab ? tab.textContent : '');
  }
  function rowsOf(view) {
    const set = new Set();
    for (const el of view.querySelectorAll('.notion-collection-item[data-block-id], .notion-table-view-row')) {
      let r = el;
      if (!r.getAttribute('data-block-id')) { const up = r.parentElement && r.parentElement.closest('[data-block-id]'); if (up && view.contains(up) && up !== view && !up.matches('.notion-collection_view-block, .notion-collection_view_page-block')) r = up; else continue; }
      if (r.matches('.notion-collection_view-block, .notion-collection_view_page-block')) continue;
      if (r.closest('.c36-sh')) continue;
      set.add(r);
    }
    /* 入れ子（行の中の行）は外側だけ */
    return [...set].filter((r) => ![...set].some((o) => o !== r && o.contains(r)));
  }
  /* 行 → 「グループの入れ物の直接の子」。同じ深さで切る（1 件だけのグループでも正しく） */
  function unitsOf(view, rows) {
    const inSet = new Set(rows);
    const countIn = (el) => { let n = 0; for (const r of rows) if (el.contains(r)) { n++; if (n > 1) break; } return n; };
    const ks = new Map();
    for (const r of rows) {
      let u = r, k = 0;
      while (u.parentElement && u.parentElement !== view && countIn(u.parentElement) === 1) { u = u.parentElement; k++; }
      if (u.parentElement && u.parentElement !== view && countIn(u.parentElement) > 1) ks.set(k, (ks.get(k) || 0) + 1);
    }
    let K = 0, best = -1;
    for (const [k, n] of ks) if (n > best) { best = n; K = k; }
    const units = [];
    for (const r of rows) {
      let u = r;
      for (let i = 0; i < K && u.parentElement && u.parentElement !== view; i++) u = u.parentElement;
      units.push({ row: r, unit: u, id: r.getAttribute('data-block-id') });
    }
    void inSet;
    const bodies = new Map();
    for (const x of units) {
      const b = x.unit.parentElement;
      if (!b) continue;
      if (!bodies.has(b)) bodies.set(b, []);
      bodies.get(b).push(x);
    }
    return bodies;
  }

  /* v13: グループ（Notion の Group by）の見出し — ▼（aria-expanded のボタン）とその右の名前 */
  const TOG = '[role="button"][aria-expanded]';
  const isGroupTog = (t) => !!(t.querySelector('svg[class*="arrowCaret"], svg[class*="triangle"]') && !t.closest('.notion-collection-item, .notion-table-view-row, .c36-sh, .notion-overlay-container'));
  function togName(t) {
    const row = t.parentElement;
    if (!row) return '';
    const w = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) { if (t.contains(n) || !n.nodeValue.trim()) continue; return norm(n.parentElement.textContent); }
    return '';
  }
  function groupOf(body, view) {
    let child = body, g = body.parentElement;
    while (g && g !== view && !(g.matches && g.matches(VIEW_SEL))) {
      for (const c of g.children) {
        if (c === child) break;
        const t = c.matches(TOG) ? c : c.querySelector(TOG);
        if (t && isGroupTog(t)) return togName(t);
      }
      child = g; g = g.parentElement;
    }
    return '';
  }
  function groupNames(view) {
    const out = [];
    for (const t of view.querySelectorAll(TOG)) { if (!isGroupTog(t)) continue; const n = togName(t); if (n && !out.includes(n)) out.push(n); }
    return out;
  }

  /* ============================================================
   *  並べ分け
   * ============================================================ */
  function sortKeys(keys, def, cfg, nums) {
    const opts = (def.options || []).map((o) => o.value);
    const ix = (k) => { const i = opts.indexOf(k); return i < 0 ? 1e6 : i; };
    const arr = [...keys];
    arr.sort((a, b) => {
      if (!a !== !b) return a ? -1 : 1;                  // 「なし」は最後
      if (def.type === 'select' || def.type === 'status') { const d = ix(a) - ix(b); if (d) return d; }
      if (def.type === 'checkbox') return a === '✓' ? -1 : 1;
      if (nums) { const d = parseFloat(a) - parseFloat(b); if (!isNaN(d) && d) return d; }
      return a.localeCompare(b, 'ja', { numeric: true });
    });
    if (cfg.rev) { const empty = arr.filter((k) => !k); const rest = arr.filter((k) => k).reverse(); return rest.concat(empty); }
    return arr;
  }
  const COLORS = { default: 'rgba(206,205,202,.5)', gray: 'rgba(155,154,151,.4)', brown: 'rgba(140,46,0,.2)', orange: 'rgba(245,93,0,.2)', yellow: 'rgba(233,168,0,.2)', green: 'rgba(0,135,107,.2)', blue: 'rgba(0,120,223,.2)', purple: 'rgba(103,36,222,.2)', pink: 'rgba(221,0,129,.2)', red: 'rgba(255,0,26,.2)' };
  function chipColor(def, k) {
    const o = (def.options || []).find((x) => x.value === k);
    return o ? (COLORS[o.color] || COLORS.default) : '';
  }
  function iconEl(ic) {
    if (!ic) return null;
    const v = String(ic.v || '').trim();
    const sp = document.createElement('span'); sp.className = 'c36-ic';
    if (/^(https?:|data:|\/)/.test(v) || /^attachment:/i.test(v)) {
      const im = document.createElement('img');
      im.src = /^attachment:/i.test(v) ? '/image/' + encodeURIComponent(v) + '?table=block&id=' + encodeURIComponent(ic.id) + '&cache=v2' : v;
      im.alt = ''; im.referrerPolicy = 'same-origin';
      sp.appendChild(im);
    } else if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return null;
    else sp.textContent = v;
    return sp;
  }
  /* v14: 見出しの小さな集計 — チェック（読了など）と、評価・点数の平均。値は行の記録（API の控え）から読むだけ */
  const SCORE_RE = /score|rating|評価|点数|得点|スコア|星|★|おすすめ度|満足/i;
  function statOf(coll, list) {
    if (!coll || !coll.schema) return null;
    let cb = '', num = '';
    for (const [pid, d] of Object.entries(coll.schema)) { if (!cb && d.type === 'checkbox') cb = pid; if (!num && d.type === 'number' && SCORE_RE.test(d.name || '')) num = pid; }
    if (!cb && !num) return null;
    let done = 0, sum = 0, cnt = 0;
    for (const x of list) { const r = rec('block', x.id); const p = (r && r.properties) || {}; if (cb && plain(p[cb]) === 'Yes') done++; if (num) { const v = parseFloat(plain(p[num])); if (isFinite(v)) { sum += v; cnt++; } } }
    return { cb: cb ? coll.schema[cb].name : '', done, n: list.length, num: num && cnt ? coll.schema[num].name : '', avg: cnt ? sum / cnt : 0 };
  }
  function makeHead(view, kind, cfg, def, k, n, closed, ic, st) {
    const h = document.createElement('div');
    h.className = 'c36-sh';
    h.setAttribute('data-c36-kind', kind);
    h.setAttribute('contenteditable', 'false');
    h.toggleAttribute('data-closed', !!closed);
    h.__c36 = { view, k };
    const tg = document.createElement('span'); tg.className = 'c36-tg'; tg.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M4.5 6l3.5 4 3.5-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const lb = document.createElement('span'); lb.className = 'c36-lb'; lb.textContent = k || '（' + (def.name || '') + ' なし）';
    const bg = chipColor(def, k);
    if (bg && k) { lb.classList.add('c36-chip'); lb.style.background = bg; }
    h.style.setProperty('--c36-tint', bg && k ? bg : 'var(--c36-accent)');
    const ct = document.createElement('span'); ct.className = 'c36-ct'; ct.textContent = n + ' 件';
    const ie = k ? iconEl(ic) : null;
    if (ie) h.append(tg, ie, lb, ct); else h.append(tg, lb, ct);
    if (st) {
      const box = document.createElement('span'); box.className = 'c36-stat';
      if (st.cb) { const s = document.createElement('span'); s.className = 'c36-done'; s.title = st.cb + '：' + st.done + ' / ' + st.n; s.innerHTML = '<i><b style="width:' + Math.round(st.n ? st.done / st.n * 100 : 0) + '%"></b></i>'; s.append('✓ ' + st.done + '/' + st.n); box.appendChild(s); }
      if (st.num) { const s = document.createElement('span'); s.className = 'c36-avg'; s.title = st.num + 'の平均'; s.textContent = '★ ' + (Math.round(st.avg * 10) / 10); box.appendChild(s); }
      h.appendChild(box);
    }
    return h;
  }
  const SIG = new WeakMap();   // body → 署名（同じなら描き直さない）
  async function applyView(view) {
    const kind = kindOf(view);
    const bid = blockOf(view);
    if (!bid) return;
    const key = keyOf(view, bid);
    view.setAttribute('data-c36-key', key);
    const cfg = VIEWS[key];
    const rows = rowsOf(view);
    const bodies = rows.length ? unitsOf(view, rows) : new Map();
    const grouped = bodies.size > 1;
    bar(view, kind, key, grouped || active(cfg));
    if (!active(cfg)) { clearView(view); return; }
    const coll = await collOf(bid);
    if (!coll) return;
    /* グループごとに使うプロパティ（v13） */
    const gOf = new Map(), need = new Set();
    for (const [body] of bodies) { const g = grouped ? groupOf(body, view) : ''; gOf.set(body, g); const pid = effProp(cfg, g); if (pid && coll.schema[pid]) need.add(pid); }
    const ids = rows.map((r) => r.getAttribute('data-block-id')).filter(Boolean);
    const VALS = new Map();
    for (const pid of need) VALS.set(pid, await valuesOf(ids, pid, coll.schema[pid]));
    if (!view.isConnected) return;
    ST.views++;
    const live = new Set();
    for (const [body, units] of bodies) {
      const pid = effProp(cfg, gOf.get(body));
      const def = pid && coll.schema[pid];
      if (!def) { if (body.hasAttribute('data-c36-body')) clearBody(body); continue; }
      const vals = VALS.get(pid);
      ST.bodies++; ST.rows += units.length;
      live.add(body);
      const groups = new Map();
      const icons = new Map();
      let nums = true;
      for (const x of units) {
        const v = vals.get(x.id);
        const k = v ? v.key : '';
        if (v && !v.num) nums = false;
        if (v && v.icon && !icons.has(k)) icons.set(k, v.icon);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(x);
      }
      const order = sortKeys(groups.keys(), def, cfg, nums);
      const closed = cfg.closed || {};
      const stats = new Map(); for (const k of order) stats.set(k, statOf(coll, groups.get(k)));
      const stSig = order.map((k) => { const s = stats.get(k); return s ? s.done + '/' + Math.round(s.avg * 10) : ''; }).join(',');
      const sig = key + '#' + pid + '#' + (cfg.rev ? 1 : 0) + '#' + order.map((k) => k + ':' + (icons.get(k) ? String(icons.get(k).v).slice(0, 40) : '') + ':' + (closed[k] ? 'c' : 'o') + ':' + groups.get(k).map((x) => x.id).join(',')).join('|');
      const units0 = new Set(units.map((x) => x.unit));
      if (units[0].unit.classList.contains('notion-collection-result-wrapper')) { layoutVirtual(view, kind, cfg, def, body, order, groups, icons, closed, sig + '#' + stSig, stats); continue; }
      /* 入れ物の作り（flex／grid）をそろえる */
      const cs = getComputedStyle(body);
      if (!/grid/.test(cs.display)) {
        if (!/flex/.test(cs.display) || cs.flexDirection !== 'column') body.setAttribute('data-c36-body', kind === 'table' ? 'tcol' : 'col');
      } else body.setAttribute('data-c36-body', 'grid');
      /* 行より前の子（見出しの段など）は先頭、後ろの子（+ New・Load more・計算の段）は最後 */
      let seen = false;
      for (const ch of body.children) {
        if (ch.classList.contains('c36-sh')) continue;
        if (units0.has(ch)) { seen = true; continue; }
        ch.style.setProperty('order', seen ? '1000000' : '-1', 'important');
        ch.setAttribute('data-c36-o', '1');
      }
      if (SIG.get(body) === sig + '#' + stSig && body.querySelector(':scope > .c36-sh')) {
        /* 署名が同じでも Notion が行の style を描き直すことがあるので order だけ当て直す */
        let o = 0;
        for (const k of order) { o += 1; for (const x of groups.get(k)) { o += 1; if (x.unit.style.order !== String(o)) x.unit.style.setProperty('order', String(o), 'important'); } }
        continue;
      }
      SIG.set(body, sig + '#' + stSig);
      for (const old of body.querySelectorAll(':scope > .c36-sh')) old.remove();
      let o = 0;
      for (const k of order) {
        const list = groups.get(k);
        const isClosed = !!closed[k];
        o += 1;
        const h = makeHead(view, kind, cfg, def, k, list.length, isClosed, icons.get(k), stats.get(k));
        const tint = h.style.getPropertyValue('--c36-tint');
        h.style.setProperty('order', String(o), 'important');
        body.appendChild(h);
        ST.heads++;
        for (const x of list) {
          o += 1;
          x.unit.style.setProperty('order', String(o), 'important');
          x.unit.setAttribute('data-c36-u', '1');
          x.unit.style.setProperty('--c36-tint', tint);   // v14: 行の左の色の線
          x.unit.toggleAttribute('data-c36-hide', isClosed);
        }
      }
    }
    /* もう無い入れ物の後始末 */
    for (const b of view.querySelectorAll('[data-c36-body]')) if (!live.has(b)) clearBody(b);
  }
  /* v2.0.0: 仮想スクロールの入れ物（行は position:absolute + translateY）。
     行の位置は Notion が style に毎回書くので、CSS（!important）で上書きする。見出しは入れ物の中に絶対位置で置く */
  const VB = new WeakMap(); let VBN = 0;
  const VCSS = new Map();   // 番号 → CSS
  const HEAD_H = 42, GAP_H = 12;   // v14: 見出しの帯の高さ・段の間のすき間
  function vcssFlush() {
    let st = document.getElementById('c36-vcss');
    if (!st) { st = document.createElement('style'); st.id = 'c36-vcss'; (document.head || document.documentElement).appendChild(st); }
    const t = [...VCSS.values()].join('\n');
    if (st.textContent !== t) st.textContent = t;
  }
  const RSO = typeof ResizeObserver === 'function' ? new ResizeObserver(() => soon()) : null;
  function layoutVirtual(view, kind, cfg, def, body, order, groups, icons, closed, sig, stats) {
    let n = VB.get(body);
    if (!n) { n = ++VBN; VB.set(body, n); }
    body.setAttribute('data-c36-body', 'virt');
    body.setAttribute('data-c36-b', String(n));
    const hs = [];
    for (const k of order) for (const x of groups.get(k)) { hs.push(x.unit.offsetHeight); if (RSO && !x.unit.__c36ro) { x.unit.__c36ro = 1; RSO.observe(x.unit); } }
    const fsig = sig + '#' + hs.join(',');
    if (SIG.get(body) === fsig && body.querySelector(':scope > .c36-sh') && VCSS.has(n)) return;
    SIG.set(body, fsig);
    for (const old of body.querySelectorAll(':scope > .c36-sh, :scope > .c36-line')) old.remove();
    const sel = '[data-c36-b="' + n + '"]';
    const rules = [];
    let y = 0, first = true;
    for (const k of order) {
      const list = groups.get(k);
      const isClosed = !!closed[k];
      if (!first) y += GAP_H;
      first = false;
      const h = makeHead(view, kind, cfg, def, k, list.length, isClosed, icons.get(k), stats && stats.get(k));
      h.classList.add('c36-vh');
      h.style.transform = 'translateY(' + y + 'px)';
      body.appendChild(h);
      ST.heads++;
      y += HEAD_H;
      const y0 = y;
      for (const x of list) {
        const i = x.unit.getAttribute('data-index');
        const one = sel + ' > .notion-collection-result-wrapper[data-index="' + i + '"]';
        if (isClosed) { rules.push(one + '{display:none !important;}'); continue; }
        rules.push(one + '{transform:translateY(' + y + 'px) !important;}');
        y += x.unit.offsetHeight;
      }
      /* 行の左の色の線（この段の行の高さだけ） */
      if (!isClosed && y > y0) { const ln = document.createElement('div'); ln.className = 'c36-line'; ln.setAttribute('contenteditable', 'false'); ln.style.transform = 'translateY(' + y0 + 'px)'; ln.style.height = (y - y0) + 'px'; ln.style.setProperty('--c36-tint', h.style.getPropertyValue('--c36-tint')); body.appendChild(ln); }
    }
    rules.push(sel + '{height:' + Math.max(y, 0) + 'px !important;}');
    VCSS.set(n, rules.join('\n'));
    vcssFlush();
  }
  function clearBody(b) {
    const n = VB.get(b);
    if (n && VCSS.has(n)) { VCSS.delete(n); vcssFlush(); }
    b.removeAttribute('data-c36-b');
    b.removeAttribute('data-c36-body');
    SIG.delete(b);
    for (const h of b.querySelectorAll(':scope > .c36-sh, :scope > .c36-line')) h.remove();
    for (const u of b.querySelectorAll(':scope > [data-c36-u], :scope > [data-c36-o]')) {
      u.style.removeProperty('order'); u.style.removeProperty('--c36-tint'); u.removeAttribute('data-c36-u'); u.removeAttribute('data-c36-o'); u.removeAttribute('data-c36-hide');
    }
  }
  function clearView(view) {
    for (const b of view.querySelectorAll('[data-c36-body]')) clearBody(b);
  }

  /* v14: 「⊞ サブグループ」は Notion の上の道具の段（フィルター・並べ替え・検索）の左端に。見つからない時は出さない（ビューの設定から使える） */
  const TOOL_SEL = ['Filter', 'フィルター', 'Sort', '並べ替え', 'Search', '検索'].map((l) => '[role="button"][aria-label="' + l + '"]').join(', ');
  function toolbarOf(view) {
    let host = view;
    for (let i = 0; i < 9 && host && host !== document.body; i++, host = host.parentElement) {
      const btn = host.querySelector(TOOL_SEL);
      if (!btn) continue;
      for (let row = btn.parentElement, j = 0; row && row !== host.parentElement && j < 7; row = row.parentElement, j++) {
        const st = row.getAttribute('style') || '';
        if (/display:\s*flex/.test(st) && /justify-content:\s*(flex-)?end/.test(st)) return row;
      }
      return btn.parentElement && btn.parentElement.parentElement;
    }
    return null;
  }
  function bar(view, kind, key, show) {
    for (const old of view.querySelectorAll(':scope > .c36-bar')) old.remove();   // v13 までの置き場所（ビューの先頭）は使わない
    const row = P.bar && show ? toolbarOf(view) : null;
    let el = view.__c36tb;
    if (!row) { if (el) { el.remove(); view.__c36tb = null; } return; }
    const cfg = VIEWS[key];
    const on = active(cfg);
    const label = on ? (cfg.prop ? cfg.name || '' : 'グループごと') : '';
    if (!el) {
      el = row.querySelector(':scope > .c36-tb') || document.createElement('div');
      el.className = 'c36-tb';
      el.setAttribute('role', 'button'); el.tabIndex = 0;
      el.setAttribute('contenteditable', 'false');
      el.innerHTML = '<span class="c36-bi">' + SUB_ICO + '</span><span class="c36-bl"></span>';
      el.addEventListener('mousedown', (e) => e.stopPropagation(), true);
      el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openMenu(el.__view || view, el); });
      view.__c36tb = el;
    }
    el.__view = view;
    if (el.parentElement !== row) row.insertBefore(el, row.firstChild);
    const lb = el.querySelector('.c36-bl'); if (lb && lb.textContent !== label) lb.textContent = label;
    el.title = on ? 'サブグループ：' + label + '（押すと変える）' : 'サブグループ — グループの中をさらに分ける（ボード以外でも）';
    el.toggleAttribute('data-on', on);
    el.setAttribute('data-c36-kind', kind);
  }

  /* ============================================================
   *  Cordivestium × Notion の「ビューの設定」（View settings）
   *  — ³⁶ ³⁷ ³⁸ に同じ部品が入っていて、どれか 1 本だけでも動く。段は Notion の行を写して作るので、見た目は Notion のまま。
   *    ・where: 'afterGroup' … Notion の「Group」のすぐ下（サブグループ）
   *    ・where: 'section'    … 「Data source settings」の前に Cordivestium の段を 1 つ作り、その中へ
   *    行の右は 値（文字＋›）か スイッチ。押すと onClick（小窓は vsSub で Notion の小メニューと同じ形に）
   * ============================================================ */
  function cordiVS(rows) {
    const HEAD_RE = /^(View settings|ビューの設定|ビュー設定|表示設定)$/;
    const GROUP_RE = /^(Group|グループ|グループ化)$/;
    const LAYOUT_RE = /^(Layout|レイアウト)$/;
    const DS_RE = /^(Data source settings|データソースの設定|データソース設定|データベースの設定)$/;
    const SW_CSS_ID = 'cordi-vs-css';
    let lastView = null;
    const VIEW_Q = '.notion-table-view, .notion-board-view, .notion-gallery-view, .notion-list-view, .notion-calendar-view, .notion-timeline-view';
    document.addEventListener('pointerdown', (e) => {
      const t = e.target; if (!t || !t.closest) return;
      if (t.closest('.notion-overlay-container')) return;
      const blk = t.closest('.notion-collection_view-block, .notion-peek-renderer, .notion-frame');
      if (!blk) return;
      const inl = t.closest('.notion-collection_view-block');
      const v = inl ? inl.querySelector(VIEW_Q) : blk.querySelector(VIEW_Q);
      if (v) lastView = v;
    }, true);
    const viewNow = () => (lastView && lastView.isConnected ? lastView : document.querySelector('.notion-frame ' + VIEW_Q.split(', ').join(', .notion-frame ')));
    const txt = (el) => String(el && el.textContent || '').replace(/\s+/g, ' ').trim();
    function css() {
      if (document.getElementById(SW_CSS_ID)) return;
      const st = document.createElement('style'); st.id = SW_CSS_ID;
      st.textContent = `
[data-cordi-vs-row] .cvs-sw { position: relative; width: 26px; height: 14px; border-radius: 44px; background: var(--ca-graBacSecTra, rgba(135,131,120,.3)); transition: background .2s; flex: none; margin-inline-start: 6px; }
[data-cordi-vs-row] .cvs-sw::after { content: ""; position: absolute; top: 2px; left: 2px; width: 10px; height: 10px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(15,15,15,.2); transition: transform .2s ease-out; }
[data-cordi-vs-row][data-on] .cvs-sw { background: var(--c-intBlu, #2383e2); }
[data-cordi-vs-row][data-on] .cvs-sw::after { transform: translateX(12px); }
[data-cordi-vs-row] .cvs-ico { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
[data-cordi-vs-row] .cvs-ico svg { width: 18px; height: 18px; display: block; }
#cordi-vs-sub { position: fixed; z-index: 2147483000; display: flex; flex-direction: column; overflow: hidden; background: var(--c-popBac, var(--c-bacPri, #fff)); color: var(--c-texPri, #37352f); border-radius: 10px; box-shadow: var(--c-shaOutMd, 0 0 0 1px rgba(15,15,15,.05), 0 3px 6px rgba(15,15,15,.1), 0 9px 24px rgba(15,15,15,.2)); font-size: 14px; animation: cvs-in .14s ease-out; }
@keyframes cvs-in { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: none; } }
#cordi-vs-sub .cvs-hd { display: flex; align-items: center; gap: 6px; height: 42px; padding: 14px 12px 6px 10px; flex: none; }
#cordi-vs-sub .cvs-back { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; color: var(--c-icoSec, rgba(55,53,47,.45)); }
#cordi-vs-sub .cvs-back:hover { background: var(--ca-butHovBac, rgba(55,53,47,.06)); }
#cordi-vs-sub .cvs-ttl { color: var(--c-texSec, rgba(55,53,47,.65)); font-size: 12px; line-height: 16px; font-weight: 500; flex: 1; }
#cordi-vs-sub .cvs-bd { overflow: auto; padding: 4px 0 8px; flex: 1; }
#cordi-vs-sub .cvs-sec { padding: 10px 14px 4px; color: var(--c-texSec, rgba(55,53,47,.65)); font-size: 12px; font-weight: 500; }
#cordi-vs-sub .cvs-it { display: flex; align-items: center; gap: 8px; min-height: 30px; margin: 0 4px; padding: 0 8px; border-radius: 6px; cursor: pointer; user-select: none; }
#cordi-vs-sub .cvs-it:hover { background: var(--ca-butHovBac, rgba(55,53,47,.06)); }
#cordi-vs-sub .cvs-it .cvs-mk { width: 20px; display: flex; align-items: center; justify-content: center; color: var(--c-icoSec, rgba(55,53,47,.45)); flex: none; font-size: 13px; }
#cordi-vs-sub .cvs-it .cvs-lb { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#cordi-vs-sub .cvs-it .cvs-ck { color: var(--c-texPri, #37352f); flex: none; }
#cordi-vs-sub .cvs-it select { font: inherit; font-size: 13px; color: var(--c-texSec, rgba(55,53,47,.65)); background: transparent; border: 0; max-width: 130px; cursor: pointer; }
#cordi-vs-sub .cvs-note { padding: 4px 14px 2px; color: var(--c-texTer, rgba(55,53,47,.45)); font-size: 12px; line-height: 1.5; }
#cordi-vs-sub .cvs-div { height: 1px; margin: 6px 0; background: var(--ca-borPriTra, rgba(55,53,47,.09)); }
`;
      (document.head || document.documentElement).appendChild(st);
    }
    function panels() {
      const out = [];
      for (const h of document.querySelectorAll('.notion-overlay-container div[style*="font-size: 12px"]')) {
        if (h.children.length || !HEAD_RE.test(txt(h))) continue;
        let p = h.parentElement;
        while (p && p.parentElement && !p.querySelector('[role="menuitem"]')) p = p.parentElement;
        if (p) out.push(p);
      }
      return out;
    }
    const itemLabel = (mi) => txt(mi.querySelector('[role="presentation"]'));
    function ctxOf(panel) {
      const items = [...panel.querySelectorAll('[role="menuitem"]')].filter((m) => !m.closest('[data-cordi-vs-row]'));
      const lay = items.find((m) => LAYOUT_RE.test(itemLabel(m)));
      const grp = items.find((m) => GROUP_RE.test(itemLabel(m)));
      const layout = lay ? txt(lay.querySelector('div[style*="color: var(--c-texTer)"]')) : '';
      return { panel, items, grp, layout, view: viewNow(), grouped: !!(grp && txt(grp.querySelector('div[style*="color: var(--c-texTer)"]')) && !/^(None|なし)$/i.test(txt(grp.querySelector('div[style*="color: var(--c-texTer)"]')))) };
    }
    function makeRow(tpl, r) {
      const row = tpl.cloneNode(true);
      row.removeAttribute('tabindex');
      row.setAttribute('data-cordi-vs-row', r.id);
      row.setAttribute('data-cordi-order', String(r.order || 50));
      for (const x of row.querySelectorAll('[data-popup-origin]')) x.removeAttribute('data-popup-origin');
      const ico = row.querySelector(':scope > div > div:first-child');
      if (ico) ico.innerHTML = '<span class="cvs-ico">' + (r.icon || '') + '</span>';
      const lb = row.querySelector('[role="presentation"]');
      if (lb) lb.textContent = r.label;
      row.addEventListener('pointerdown', (e) => { e.stopPropagation(); }, true);
      row.addEventListener('mousedown', (e) => { e.stopPropagation(); }, true);
      row.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const panel = panels().find((p) => p.contains(row)); if (!panel) return; try { r.onClick(ctxOf(panel), row); } catch (er) { console.warn('[cordi-vs]', er); } setTimeout(() => upd(row, r, ctxOf(panel)), 30); }, true);
      return row;
    }
    function upd(row, r, ctx) {
      const right = row.querySelector('div[style*="color: var(--c-texTer)"]');
      if (!right) return;
      const valBox = right.firstElementChild;
      const chev = right.querySelector('svg');
      if (r.toggle) {
        const on = !!r.toggle(ctx);
        row.toggleAttribute('data-on', on);
        if (valBox) valBox.textContent = '';
        if (chev) chev.style.display = 'none';
        let sw = right.querySelector('.cvs-sw');
        if (!sw) { sw = document.createElement('span'); sw.className = 'cvs-sw'; right.appendChild(sw); }
      } else if (valBox) {
        const v = r.value ? r.value(ctx) : '';
        if (valBox.textContent !== (v || '')) valBox.textContent = v || '';
      }
    }
    function section(panel, ctx) {
      let sec = panel.querySelector('[data-cordi-vs-sec]');
      if (sec) return sec;
      const dsh = [...panel.querySelectorAll('div')].find((d) => !d.children.length && DS_RE.test(txt(d)));
      const block2 = dsh && dsh.closest('div[style*="margin-top"]');
      const block1 = ctx.grp && ctx.grp.parentElement;
      if (!block1) return null;
      sec = block2 ? block2.cloneNode(false) : document.createElement('div');
      sec.setAttribute('data-cordi-vs-sec', '1');
      if (!block2) sec.style.marginTop = '4px';
      const dv = block2 && block2.firstElementChild && !txt(block2.firstElementChild) ? block2.firstElementChild.cloneNode(true) : null;
      if (dv) sec.appendChild(dv); else { const d = document.createElement('div'); d.style.cssText = 'height:1px;margin:0 12px 4px;background:var(--ca-borPriTra)'; sec.appendChild(d); }
      const hrow = dsh ? dsh.parentElement.cloneNode(false) : document.createElement('div');
      if (!dsh) hrow.style.cssText = 'padding:4px 14px 2px';
      const ht = dsh ? dsh.cloneNode(false) : document.createElement('div');
      if (!dsh) ht.style.cssText = 'color:var(--c-texSec);font-size:12px;font-weight:500;line-height:16px';
      ht.textContent = 'Cordivestium';
      hrow.appendChild(ht);
      sec.appendChild(hrow);
      if (block2 && block2.parentElement) block2.parentElement.insertBefore(sec, block2);
      else block1.parentElement.insertBefore(sec, block1.nextSibling);
      return sec;
    }
    function place(parent, row, before) {
      const o = +row.getAttribute('data-cordi-order');
      const sibs = [...parent.querySelectorAll(':scope > [data-cordi-vs-row]')];
      const nxt = sibs.find((s) => s !== row && +s.getAttribute('data-cordi-order') > o);
      if (nxt) parent.insertBefore(row, nxt); else if (before) parent.insertBefore(row, before); else parent.appendChild(row);
    }
    function scan() {
      /* 前の画面（小メニューに替わった時など）に残った段を片づける（自分の行と、空の段だけ） */
      const ps = panels();
      const mine = new Set(rows.map((r) => r.id));
      for (const el of document.querySelectorAll('[data-cordi-vs-row]')) if (mine.has(el.getAttribute('data-cordi-vs-row')) && !ps.some((p) => p.contains(el))) el.remove();
      for (const el of document.querySelectorAll('[data-cordi-vs-sec]')) if (!ps.some((p) => p.contains(el)) || !el.querySelector('[data-cordi-vs-row]')) el.remove();
      if (!ps.length) { closeSub(true); return; }
      css();
      for (const panel of ps) {
        const ctx = ctxOf(panel);
        if (!ctx.grp) continue;
        for (const r of rows) {
          const show = r.show ? !!r.show(ctx) : true;
          let row = panel.querySelector('[data-cordi-vs-row="' + r.id + '"]');
          if (!show) { if (row) row.remove(); continue; }
          if (!row) {
            row = makeRow(ctx.grp, r);
            if (r.where === 'afterGroup') { ctx.grp.parentElement.insertBefore(row, ctx.grp.nextSibling); }
            else { const sec = section(panel, ctx); if (!sec) continue; place(sec, row); }
          }
          upd(row, r, ctx);
        }
      }
    }
    let qt = 0;
    const soon = () => { if (!qt) qt = setTimeout(() => { qt = 0; try { scan(); } catch (e) { /* noop */ } }, 90); };
    const start = () => {
      new MutationObserver((ms) => {
        for (const m of ms) { if (m.target.closest && m.target.closest('#cordi-vs-sub')) continue; if (m.target.closest && m.target.closest('.notion-overlay-container')) { soon(); return; } for (const n of m.addedNodes) if (n.nodeType === 1 && (n.classList.contains('notion-overlay-container') || n.querySelector && n.querySelector('.notion-overlay-container'))) { soon(); return; } }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
    /* 小メニュー（Notion のビューの設定と同じ場所・同じ形。← で戻る・外を押すと閉じる） */
    let sub = null;
    function closeSub(all) { if (sub) { sub.remove(); sub = null; } void all; }
    function vsSub(ctx, title, build) {
      closeSub();
      css();
      const r = ctx.panel.getBoundingClientRect();
      sub = document.createElement('div');
      sub.id = 'cordi-vs-sub';
      sub.setAttribute('data-no-passthrough', '1');
      sub.style.left = r.left + 'px'; sub.style.top = r.top + 'px'; sub.style.width = r.width + 'px'; sub.style.height = r.height + 'px';
      sub.innerHTML = '<div class="cvs-hd"><div class="cvs-back" title="戻る"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M9.278 3.238a.625.625 0 0 1 .884.884L6.284 8l3.878 3.878a.625.625 0 0 1-.884.884l-4.32-4.32a.625.625 0 0 1 0-.884z"/></svg></div><div class="cvs-ttl"></div></div><div class="cvs-bd"></div>';
      sub.querySelector('.cvs-ttl').textContent = title;
      const bd = sub.querySelector('.cvs-bd');
      const api = {
        sec(t) { const d = document.createElement('div'); d.className = 'cvs-sec'; d.textContent = t; bd.appendChild(d); return d; },
        note(t) { const d = document.createElement('div'); d.className = 'cvs-note'; d.textContent = t; bd.appendChild(d); return d; },
        div() { const d = document.createElement('div'); d.className = 'cvs-div'; bd.appendChild(d); },
        item(label, o) {
          o = o || {};
          const d = document.createElement('div'); d.className = 'cvs-it';
          d.innerHTML = '<span class="cvs-mk"></span><span class="cvs-lb"></span>';
          d.querySelector('.cvs-mk').innerHTML = o.mark || '';
          d.querySelector('.cvs-lb').textContent = label;
          if (o.on) d.insertAdjacentHTML('beforeend', '<svg class="cvs-ck" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.98 3.92a.625.625 0 0 1 .1.88l-6 7.5a.625.625 0 0 1-.93.05l-3-3a.625.625 0 0 1 .88-.88l2.51 2.5 5.56-6.95a.625.625 0 0 1 .88-.1"/></svg>');
          if (o.select) {
            const s = document.createElement('select');
            for (const [v, l] of o.select.options) { const op = document.createElement('option'); op.value = v; op.textContent = l; if (v === o.select.value) op.selected = true; s.appendChild(op); }
            s.addEventListener('change', () => o.select.onChange(s.value));
            s.addEventListener('click', (e) => e.stopPropagation());
            d.appendChild(s);
          }
          if (o.click) d.addEventListener('click', () => o.click());
          bd.appendChild(d); return d;
        },
        clear() { bd.textContent = ''; },
        close: closeSub,
        body: bd
      };
      sub.querySelector('.cvs-back').addEventListener('click', () => closeSub());
      for (const ev of ['pointerdown', 'mousedown', 'click', 'keydown']) sub.addEventListener(ev, (e) => e.stopPropagation());
      document.body.appendChild(sub);
      build(api);
      const off = (e) => { if (!sub) { document.removeEventListener('pointerdown', off, true); return; } if (!sub.contains(e.target)) { closeSub(); document.removeEventListener('pointerdown', off, true); } };
      setTimeout(() => document.addEventListener('pointerdown', off, true), 0);
      const kd = (e) => { if (e.key === 'Escape' && sub) { e.stopPropagation(); closeSub(); document.removeEventListener('keydown', kd, true); } };
      document.addEventListener('keydown', kd, true);
      const follow = () => { if (!sub) return; if (!ctx.panel.isConnected) { closeSub(); return; } const q = ctx.panel.getBoundingClientRect(); sub.style.left = q.left + 'px'; sub.style.top = q.top + 'px'; sub.style.height = q.height + 'px'; requestAnimationFrame(follow); };
      requestAnimationFrame(follow);
      return api;
    }
    return { scan, sub: vsSub, view: viewNow, close: closeSub };
  }

  /* ============================================================
   *  メニュー
   * ============================================================ */
  function closeMenu() { const m = document.getElementById('c36-menu'); if (m) m.remove(); }
  /* v13: 種類ごとのアイコン（Notion のプロパティのアイコンに近い線画） */
  const PICO = {
    select: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 3.2l2.2 2.8H5.8z', status: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 4v8a4 4 0 0 0 0-8z',
    multi_select: 'M3 4.5h10M3 8h10M3 11.5h6', checkbox: 'M3.5 3.5h9v9h-9zM5.5 8l2 2 3.5-4', date: 'M3 4h10v9H3zM3 6.5h10M6 2.5v3M10 2.5v3',
    person: 'M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3.5 13.5a4.5 4.5 0 0 1 9 0', relation: 'M5 11l6-6M6 5h5v5', text: 'M3 4h10M3 7h10M3 10h7M3 13h5',
    title: 'M3 12.5L6.5 3.5h1L11 12.5M4.3 9.5h5.4M12 8.5h2M13 7.5v6', number: 'M5.5 3l-1 10M11.5 3l-1 10M3 6h10M2.5 10h10', url: 'M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.5.5M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.5-.5',
    email: 'M2.5 4h11v8h-11zM2.5 4.5L8 9l5.5-4.5', phone_number: 'M4 2.5h2l1 3-1.5 1a7 7 0 0 0 4 4l1-1.5 3 1v2a1.5 1.5 0 0 1-1.5 1.5A10 10 0 0 1 2.5 4 1.5 1.5 0 0 1 4 2.5z',
    created_time: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5v3l2 1.5', last_edited_time: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5v3l2 1.5',
    created_by: 'M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3.5 13.5a4.5 4.5 0 0 1 9 0', last_edited_by: 'M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3.5 13.5a4.5 4.5 0 0 1 9 0',
    none: 'M3.5 3.5l9 9M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z', rev: 'M5 3v10M5 13l-2-2M5 13l2-2M11 13V3M11 3L9 5M11 3l2 2', fold: 'M4 6l4 4 4-4', open: 'M6 4l4 4-4 4', grp: 'M2.5 3.5h11M4.5 7h9M4.5 10.5h9M2.5 7h.01M2.5 10.5h.01'
  };
  const pico = (k) => '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="' + (PICO[k] || PICO.text) + '"/></svg>';
  const SUB_ICO = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3.9 3a.55.55 0 0 0 0 1.1h12.2a.55.55 0 1 0 0-1.1zM5.4 7a.55.55 0 0 0 0 1.1h10.7a.55.55 0 1 0 0-1.1zm2 4a.55.55 0 0 0 0 1.1h8.7a.55.55 0 1 0 0-1.1zm0 4a.55.55 0 0 0 0 1.1h8.7a.55.55 0 1 0 0-1.1zM4.6 9.9V12a1.6 1.6 0 0 0 1.6 1.6h.4v-1.1h-.4a.5.5 0 0 1-.5-.5V9.9z"/></svg>';
  /* 中身（ビューの設定の小メニューと、左上のボタンの小窓で同じもの） */
  async function buildMenu(api, view) {
    const bid = blockOf(view);
    if (!bid) { api.note('このビューの DB が見つかりませんでした'); return; }
    const key = view.getAttribute('data-c36-key') || keyOf(view, bid);
    const cfg = VIEWS[key] || {};
    const wait = api.note('読み込み中…');
    const coll = await collOf(bid);
    wait.remove();
    if (!coll) { api.note('この DB の項目を読めませんでした（少し待ってもう一度）'); return; }
    const redraw = () => { api.clear(); buildMenu(api, view); };
    const set = (o) => {
      const c = Object.assign({}, VIEWS[key] || {}, o);
      if (!active(c)) delete VIEWS[key]; else VIEWS[key] = c;
      saveV(); clearView(view); run(); redraw();
    };
    const props = Object.entries(coll.schema).filter(([, d]) => USABLE.has(d.type)).sort((a, b) => (a[1].type === 'title' ? -1 : b[1].type === 'title' ? 1 : 0));
    api.sec('プロパティで分ける');
    api.item('なし', { mark: pico('none'), on: !cfg.prop, click: () => set({ prop: '', name: '' }) });
    for (const [pid, d] of props) api.item(d.name || pid, { mark: pico(d.type), on: cfg.prop === pid, click: () => set({ prop: pid, name: d.name || pid, closed: cfg.prop === pid ? cfg.closed : {} }) });
    const groups = groupNames(view);
    if (groups.length > 1) {
      api.div();
      api.sec('グループごと');
      api.note('このグループはサブグループにしない・このグループだけ別のプロパティで分ける、を選べます。');
      const opts = [['', cfg.prop ? '全体と同じ（' + (cfg.name || '') + '）' : '全体と同じ（なし）'], ['off', 'しない']].concat(props.map(([pid, d]) => [pid, d.name || pid]));
      for (const g of groups) {
        const cur = (cfg.groups && cfg.groups[g]) || '';
        api.item(g, { mark: pico('grp'), select: { options: opts, value: cur, onChange: (v) => { const gs = Object.assign({}, cfg.groups || {}); if (v) gs[g] = v; else delete gs[g]; set({ groups: gs }); } } });
      }
    }
    if (active(cfg)) {
      api.div();
      api.sec('並びと表示');
      api.item('逆の順に並べる', { mark: pico('rev'), on: !!cfg.rev, click: () => set({ rev: !cfg.rev }) });
      api.item('すべて畳む', { mark: pico('fold'), click: () => { const closed = {}; for (const h of view.querySelectorAll('.c36-sh')) closed[h.__c36.k] = 1; set({ closed }); } });
      api.item('すべて開く', { mark: pico('open'), click: () => set({ closed: {} }) });
      api.item('やめる（このビューの設定を消す）', { mark: pico('none'), click: () => { delete VIEWS[key]; saveV(); clearView(view); run(); redraw(); } });
    }
  }
  /* 左上のボタン・見出しの右クリック・⌃⌥G で出る小窓（中身は上と同じ） */
  function openMenu(view, anchor, at) {
    closeMenu();
    const m = document.createElement('div');
    m.id = 'c36-menu';
    m.innerHTML = '<div class="c36-mh">サブグループ</div><div class="c36-ml"></div>';
    document.body.appendChild(m);
    const r = anchor ? anchor.getBoundingClientRect() : { left: at.x, bottom: at.y };
    m.style.left = Math.max(8, Math.min(innerWidth - 300, r.left)) + 'px';
    m.style.top = Math.min(innerHeight - 160, r.bottom + 4) + 'px';
    const bd = m.querySelector('.c36-ml');
    const add = (cls, t) => { const d = document.createElement('div'); d.className = cls; if (t != null) d.textContent = t; bd.appendChild(d); return d; };
    const api = {
      sec: (t) => add('c36-mh', t),
      note: (t) => add('c36-note', t),
      div: () => add('c36-sep'),
      clear: () => { bd.textContent = ''; },
      close: closeMenu,
      item(label, o) {
        o = o || {};
        const b = add('c36-mi' + (o.on ? ' on' : ''));
        const s = document.createElement('span'); s.className = 'c36-mk'; s.innerHTML = o.mark || '';
        const t = document.createElement('span'); t.className = 'c36-mt'; t.textContent = label;
        b.append(s, t);
        if (o.select) {
          const sel = document.createElement('select');
          for (const [v, l] of o.select.options) { const op = document.createElement('option'); op.value = v; op.textContent = l; if (v === o.select.value) op.selected = true; sel.appendChild(op); }
          sel.addEventListener('change', () => o.select.onChange(sel.value));
          sel.addEventListener('click', (e) => e.stopPropagation());
          b.appendChild(sel);
        }
        if (o.click) b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); o.click(); });
        return b;
      }
    };
    buildMenu(api, view);
  }
  /* v13: Notion の「ビューの設定」の「Group」の下に「サブグループ」 */
  const VS = cordiVS([{
    id: 'c36.sub', where: 'afterGroup', order: 1, label: 'サブグループ', icon: SUB_ICO,
    show: (ctx) => P.on && !/^(Board|ボード|Calendar|カレンダー|Timeline|タイムライン|Chart|チャート|Feed|フィード|Map|マップ|Form|フォーム)$/i.test(ctx.layout || '') && !!ctx.view,
    value: (ctx) => { const v = ctx.view; if (!v) return ''; const bid = blockOf(v); const c = bid && VIEWS[v.getAttribute('data-c36-key') || keyOf(v, bid)]; if (!active(c)) return 'なし'; const n = c.groups ? Object.values(c.groups).filter((x) => x).length : 0; return (c.prop ? c.name || '' : 'グループごと') + (n ? '・個別 ' + n : ''); },
    onClick: (ctx) => { const v = ctx.view; if (!v) return; VS.sub(ctx, 'サブグループ', (api) => buildMenu(api, v)); }
  }]);
  document.addEventListener('mousedown', (e) => { const m = document.getElementById('c36-menu'); if (m && !m.contains(e.target) && !(e.target.closest && e.target.closest('.c36-bar, .c36-tb'))) closeMenu(); }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); }, true);

  /* 見出し: クリックで畳む、右クリックでメニュー */
  document.addEventListener('click', (e) => {
    const h = e.target.closest && e.target.closest('.c36-sh');
    if (!h || !h.__c36) return;
    e.preventDefault(); e.stopPropagation();
    const { view, k } = h.__c36;
    const key = view.getAttribute('data-c36-key');
    const cfg = VIEWS[key];
    if (!cfg) return;
    cfg.closed = cfg.closed || {};
    if (cfg.closed[k]) delete cfg.closed[k]; else cfg.closed[k] = 1;
    h.toggleAttribute('data-closed', !!cfg.closed[k]);   // v14: 矢印をその場で回す
    saveV(); run();
  }, true);
  document.addEventListener('mousedown', (e) => { if (e.target.closest && e.target.closest('.c36-sh')) e.stopPropagation(); }, true);
  document.addEventListener('contextmenu', (e) => {
    const h = e.target.closest && e.target.closest('.c36-sh');
    if (!h || !h.__c36) return;
    e.preventDefault(); e.stopPropagation();
    openMenu(h.__c36.view, null, { x: e.clientX, y: e.clientY });
  }, true);
  /* ⌃⌥G: マウスの下のビュー */
  let mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', (e) => { mouse = { x: e.clientX, y: e.clientY }; }, { passive: true, capture: true });
  window.addEventListener('keydown', (e) => {
    if (!P.hotkey || !(e.ctrlKey && e.altKey && !e.metaKey && e.code === 'KeyG')) return;
    const el = document.elementFromPoint(mouse.x, mouse.y);
    const view = (el && el.closest && el.closest(VIEW_SEL)) || document.querySelector('.notion-frame :is(' + VIEW_SEL + ')');
    if (!view) return;
    e.preventDefault(); e.stopPropagation();
    openMenu(view, null, { x: Math.max(20, mouse.x), y: Math.max(20, mouse.y) });
  }, true);

  /* ============================================================
   *  CSS
   * ============================================================ */
  function css() {
    if (document.getElementById('c36-css')) return;
    const st = document.createElement('style');
    st.id = 'c36-css';
    st.textContent = `
:root {
  --c36-font: inherit;
  --c36-size: 12.5px;
  --c36-weight: 600;
  --c36-color: var(--c-texSec, rgba(55,53,47,.75));
  --c36-count: var(--c-texTer, rgba(55,53,47,.45));
  --c36-line: var(--ca-borSecTra, rgba(55,53,47,.12));
  --c36-top: 10px;
  --c36-bottom: 4px;
  --c36-indent: 4px;
}
[data-c36-body="col"], [data-c36-body="tcol"] { display: flex !important; flex-direction: column !important; }
[data-c36-body="tcol"] { align-items: flex-start !important; }
[data-c36-body="tcol"] > * { min-width: 100%; }
[data-c36-hide] { display: none !important; }
/* v14: サブグループは「段」— 色の帯の見出し（表の行には見えない）＋行の左の色の線＋段の間のすき間 */
:root { --c36-accent: var(--lm-accent, #2783de); }
.c36-sh {
  --c36-tint: var(--c36-accent);
  display: flex; align-items: center; gap: 8px; box-sizing: border-box;
  margin: calc(var(--c36-top) + 4px) 0 6px; padding: 5px 12px 5px 8px;
  font-family: var(--cordi-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif); font-size: 13px; font-weight: 650; color: var(--c-texPri, #37352f);
  border-radius: 11px; cursor: pointer; user-select: none; line-height: 1.4;
  background: linear-gradient(90deg, color-mix(in srgb, var(--c36-tint) 16%, var(--c-bacPri, #fff)), color-mix(in srgb, var(--c36-tint) 4%, var(--c-bacPri, #fff)) 70%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c36-tint) 22%, transparent), inset 4px 0 0 var(--c36-tint);
  transition: box-shadow .2s ease, filter .2s ease; animation: c36HeadIn .4s cubic-bezier(.16,1,.3,1) both;
}
.c36-sh:hover { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c36-tint) 40%, transparent), inset 4px 0 0 var(--c36-tint), 0 6px 18px -12px color-mix(in srgb, var(--c36-tint) 70%, transparent); }
@keyframes c36HeadIn { from { opacity: 0; transform: translateY(4px); } }
[data-c36-body="virt"] > .c36-sh.c36-vh { animation: none; }
[data-c36-body="tcol"] > .c36-sh { position: sticky; inset-inline-start: 0; width: max-content; min-width: min(100%, 420px); }
[data-c36-body="virt"] > .c36-sh.c36-vh { position: absolute; top: 0; inset-inline-start: 0; width: min(100%, 760px); height: ${HEAD_H - 6}px; margin: 3px 0 0; padding-top: 0; padding-bottom: 0; padding-inline-start: 10px; z-index: 2; }
[data-c36-body="grid"] > .c36-sh { grid-column: 1 / -1; margin-bottom: 0; }
[data-c36-body] > [data-c36-u]:not([data-c36-body="grid"] > *) { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--c36-tint, transparent) 70%, transparent); }
[data-c36-body="virt"] > .c36-line { position: absolute; top: 0; inset-inline-start: 0; width: 3px; border-radius: 3px; z-index: 2; pointer-events: none; background: linear-gradient(var(--c36-tint), color-mix(in srgb, var(--c36-tint) 25%, transparent)); }
.c36-sh .c36-tg { width: 16px; height: 16px; display: inline-grid; place-items: center; flex: none; color: color-mix(in srgb, var(--c36-tint) 70%, var(--c-texSec, #787774)); transition: transform .25s cubic-bezier(.3,1.5,.5,1); }
.c36-sh[data-closed] .c36-tg { transform: rotate(-90deg); }
.c36-sh .c36-stat { margin-inline-start: auto; display: inline-flex; align-items: center; gap: 10px; font-size: 11.5px; font-weight: 600; color: var(--c-texSec, #787774); white-space: nowrap; }
.c36-sh .c36-done { display: inline-flex; align-items: center; gap: 6px; }
.c36-sh .c36-done i { display: inline-block; width: 42px; height: 5px; border-radius: 3px; overflow: hidden; background: color-mix(in srgb, var(--c36-tint) 18%, transparent); }
.c36-sh .c36-done b { display: block; height: 100%; border-radius: 3px; background: var(--c36-tint); animation: c36Fill .9s cubic-bezier(.16,1,.3,1) both; }
@keyframes c36Fill { from { width: 0 !important; } }
.c36-sh .c36-avg { color: #c98a10; }
@media (prefers-reduced-motion: reduce) { .c36-sh, .c36-sh .c36-done b { animation: none !important; } .c36-sh .c36-tg { transition: none; } }
/* v14: 上の道具の段（フィルター・並べ替えの並び）のボタン */
.c36-tb { display: inline-flex; align-items: center; gap: 5px; height: 28px; margin-inline-end: 2px; padding: 0 6px; border-radius: 6px; flex: none; cursor: pointer; user-select: none;
  font: 500 13px/28px var(--cordi-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif); color: var(--c-icoSec, rgba(55,53,47,.55)); transition: background .15s ease, color .15s ease; }
.c36-tb:hover { background: var(--c-bacHov, rgba(55,53,47,.08)); color: var(--c-texPri, #37352f); }
.c36-tb[data-on] { color: var(--c-bluTex, #2383e2); }
.c36-tb .c36-bi { width: 18px; height: 18px; display: inline-flex; } .c36-tb .c36-bi svg { width: 18px; height: 18px; }
.c36-tb .c36-bl:empty { display: none; }
.c36-tb .c36-bl { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c36-sh .c36-ic { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; flex: none; font-size: 14px; line-height: 1; }
.c36-sh .c36-ic img { width: 18px; height: 18px; object-fit: cover; border-radius: 3px; display: block; }
.c36-sh .c36-lb { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60ch; }
.c36-sh .c36-chip { padding: 0 6px; border-radius: 3px; font-weight: 500; color: var(--c-texPri, #37352f); }
.c36-sh .c36-ct { padding: 0 7px; border-radius: 999px; font-size: 11px; font-weight: 650; line-height: 18px; color: color-mix(in srgb, var(--c36-tint) 65%, var(--c-texSec, #787774)); background: color-mix(in srgb, var(--c36-tint) 14%, transparent); }
.c36-bar {
  display: inline-flex; align-items: center; gap: 4px; height: 24px; margin: 4px 0 2px; padding: 0 7px 0 5px; border-radius: 6px;
  font: 500 12.5px/24px var(--cordi-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif); color: var(--c-texSec, rgba(55,53,47,.65));
  cursor: pointer; user-select: none; position: sticky; inset-inline-start: 0; z-index: 3; width: max-content;
}
.c36-bar:hover { background: var(--c-bacHov, rgba(55,53,47,.08)); color: var(--c-texPri, #37352f); }
.c36-bar[data-on] { color: var(--c-bluTex, #2383e2); }
.c36-bar .c36-bi { width: 16px; height: 16px; display: inline-flex; } .c36-bar .c36-bi svg { width: 16px; height: 16px; }
#c36-menu .c36-note { padding: 2px 8px 6px; font-size: 12px; line-height: 1.5; color: rgba(120,119,116,1); }
#c36-menu .c36-mt { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#c36-menu .c36-mk svg { display: block; margin: 0 auto; }
#c36-menu select { font: inherit; font-size: 12.5px; max-width: 120px; border: 0; background: transparent; color: rgba(120,119,116,1); cursor: pointer; }
#c36-menu {
  position: fixed; z-index: 2147483000; width: 270px; max-height: 70vh; overflow: auto; padding: 6px; border-radius: 10px;
  background: var(--c-bacPri, #fff); color: var(--c-texPri, #37352f); box-shadow: 0 10px 38px rgba(15,15,15,.2), 0 0 0 1px rgba(15,15,15,.08);
  font: 13.5px/1.4 -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif;
}
#c36-menu .c36-mh { padding: 4px 8px 6px; font-size: 11.5px; font-weight: 600; color: rgba(120,119,116,1); }
#c36-menu .c36-mi { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 6px; cursor: pointer; }
#c36-menu .c36-mi:hover { background: rgba(55,53,47,.08); }
#c36-menu .c36-mi.on { color: #2383e2; font-weight: 600; }
#c36-menu .c36-mk { width: 18px; text-align: center; opacity: .75; flex: none; }
#c36-menu .c36-sep { height: 1px; margin: 4px 6px; background: rgba(55,53,47,.1); }
@media (prefers-color-scheme: dark) { #c36-menu { background: #252525; color: #e6e6e6; } #c36-menu .c36-mi:hover { background: rgba(255,255,255,.08); } }
`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ============================================================
   *  動かす
   * ============================================================ */
  let running = false, again = false;
  async function run() {
    if (!P.on) return;
    if (running) { again = true; return; }
    running = true;
    try {
      css();
      ST.scans++; ST.views = 0; ST.bodies = 0; ST.rows = 0; ST.heads = 0;
      /* サブグループを使っているビューがこの画面にあれば、Notion に行を広く描かせる */
      let need = false;
      for (const v of document.querySelectorAll(VIEW_SEL)) { const bid = blockOf(v); const c = bid && VIEWS[keyOf(v, bid)]; if (active(c)) { need = true; break; } }
      if (need !== INF.on) { inflate(need); ST.inflated = need; }
      for (const v of document.querySelectorAll(VIEW_SEL)) {
        if (v.closest('#c36-menu')) continue;
        try { await applyView(v); } catch (e) { ST.lastError = String(e && e.stack || e); }
      }
    } finally {
      running = false;
      if (again) { again = false; soon(); }
    }
  }
  let t = 0;
  const soon = () => { if (!t) t = setTimeout(() => { t = 0; run(); }, 250); };
  const ours = (n) => n.nodeType === 1 && (n.hasAttribute('data-cordi-vs-row') || n.hasAttribute('data-cordi-vs-sec') || n.id === 'cordi-vs-sub' || n.classList.contains('c36-sh') || n.classList.contains('c36-line') || n.classList.contains('c36-tb') || n.classList.contains('c36-bar') || n.id === 'c36-menu' || n.id === 'c36-css' || n.id === 'c36-vcss');
  function boot() {
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === 'childList') {
        if ([...m.addedNodes, ...m.removedNodes].every((n) => n.nodeType !== 1 || ours(n))) continue;
        if (m.target.closest && m.target.closest('#c36-menu, .c36-sh')) continue;
        soon(); return;
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
  let href = location.href;
  setInterval(() => {
    if (location.href !== href) { href = location.href; soon(); }
  }, 600);
  setInterval(() => { if (Object.values(VIEWS).some(active) && document.visibilityState === 'visible') run(); }, Math.max(5000, P.refresh));
  setTimeout(run, 600);
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot, { once: true });

  window.__c36 = {
    version: VERSION,
    status: () => Object.assign({ prefs: Object.assign({}, P), views: Object.assign({}, VIEWS) }, ST),
    set(o) { Object.assign(P, o || {}); saveP(); run(); return Object.assign({}, P); },
    clear() { VIEWS = {}; saveV(); for (const v of document.querySelectorAll(VIEW_SEL)) clearView(v); run(); },
    run
  };
})();
