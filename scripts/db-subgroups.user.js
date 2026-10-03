// ==UserScript==
// @name         « No »　³⁶ _ Sub Groups
// @namespace    https://cordivestium.local/sub-groups
// @version      1.1.0
// @description  データベースの「グループ」（Group by）を、ボードビュー以外（表・リスト・ギャラリー）でもサブグループに分ける。Notion の標準ではサブグループはボードだけ。グループの中を、もう 1 つのプロパティ（セレクト・ステータス・マルチセレクト・チェックボックス・日付・人・リレーション・テキスト・数値など）の値ごとに見出しを付けて並べ分け、見出しのクリックで畳む。ビューごとに覚える。グループ分けしていないビューでも使える（ビュー全体をサブグループに分ける）。見た目だけで、Notion のデータや並び順は変えない。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*
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
  const VERSION = '1.1.0';
  const TAG = '[³⁶ v' + VERSION + ']';
  if (window.__c36 && window.__c36.version) { console.warn(TAG, '旧版が動いています'); return; }

  const LS_P = 'c36.prefs.v1';
  const LS_V = 'c36.views.v1';
  const P = { on: true, bar: true, hotkey: true, refresh: 20000 };
  let VIEWS = {};   // key → { prop, rev, closed: {value: 1} }
  try { Object.assign(P, JSON.parse(localStorage.getItem(LS_P) || '{}')); } catch (e) { /* noop */ }
  try { VIEWS = JSON.parse(localStorage.getItem(LS_V) || '{}') || {}; } catch (e) { VIEWS = {}; }
  const saveP = () => { try { localStorage.setItem(LS_P, JSON.stringify(P)); } catch (e) { /* noop */ } };
  const saveV = () => { try { localStorage.setItem(LS_V, JSON.stringify(VIEWS)); } catch (e) { /* noop */ } };
  const ST = { scans: 0, views: 0, bodies: 0, rows: 0, heads: 0, api: 0, lastError: '' };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const dash = (id) => {
    const h = String(id || '').replace(/-/g, '');
    return h.length === 32 ? h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20) : String(id || '');
  };

  /* ============================================================
   *  API（syncRecordValues）
   * ============================================================ */
  async function api(reqs) {
    ST.api++;
    const post = (requests) => fetch(location.origin + '/api/v3/syncRecordValues', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ requests })
    }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    let j = await post(reqs.map((r) => ({ table: r.table, id: r.id, version: -1 })));
    const got = (jj) => jj && jj.recordMap && reqs.some((r) => jj.recordMap[r.table] && jj.recordMap[r.table][r.id]);
    if (!got(j)) j = await post(reqs.map((r) => ({ pointer: { table: r.table, id: r.id }, version: -1 })));
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
  function makeHead(view, kind, cfg, def, k, n, closed, ic) {
    const h = document.createElement('div');
    h.className = 'c36-sh';
    h.setAttribute('data-c36-kind', kind);
    h.setAttribute('contenteditable', 'false');
    h.__c36 = { view, k };
    const tg = document.createElement('span'); tg.className = 'c36-tg'; tg.textContent = closed ? '▸' : '▾';
    const lb = document.createElement('span'); lb.className = 'c36-lb'; lb.textContent = k || '（' + (def.name || '') + ' なし）';
    const bg = chipColor(def, k);
    if (bg && k) { lb.classList.add('c36-chip'); lb.style.background = bg; }
    const ct = document.createElement('span'); ct.className = 'c36-ct'; ct.textContent = String(n);
    const ie = k ? iconEl(ic) : null;
    if (ie) h.append(tg, ie, lb, ct); else h.append(tg, lb, ct);
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
    bar(view, kind, key, grouped || !!(cfg && cfg.prop));
    if (!cfg || !cfg.prop) { clearView(view); return; }
    const coll = await collOf(bid);
    if (!coll) return;
    const def = coll.schema[cfg.prop];
    if (!def) { clearView(view); return; }
    const vals = await valuesOf(rows.map((r) => r.getAttribute('data-block-id')).filter(Boolean), cfg.prop, def);
    if (!view.isConnected) return;
    ST.views++;
    const live = new Set();
    for (const [body, units] of bodies) {
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
      const sig = key + '#' + cfg.prop + '#' + (cfg.rev ? 1 : 0) + '#' + order.map((k) => k + ':' + (icons.get(k) ? String(icons.get(k).v).slice(0, 40) : '') + ':' + (closed[k] ? 'c' : 'o') + ':' + groups.get(k).map((x) => x.id).join(',')).join('|');
      const units0 = new Set(units.map((x) => x.unit));
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
      if (SIG.get(body) === sig && body.querySelector(':scope > .c36-sh')) {
        /* 署名が同じでも Notion が行の style を描き直すことがあるので order だけ当て直す */
        let o = 0;
        for (const k of order) { o += 1; for (const x of groups.get(k)) { o += 1; if (x.unit.style.order !== String(o)) x.unit.style.setProperty('order', String(o), 'important'); } }
        continue;
      }
      SIG.set(body, sig);
      for (const old of body.querySelectorAll(':scope > .c36-sh')) old.remove();
      let o = 0;
      for (const k of order) {
        const list = groups.get(k);
        const isClosed = !!closed[k];
        o += 1;
        const h = makeHead(view, kind, cfg, def, k, list.length, isClosed, icons.get(k));
        h.style.setProperty('order', String(o), 'important');
        body.appendChild(h);
        ST.heads++;
        for (const x of list) {
          o += 1;
          x.unit.style.setProperty('order', String(o), 'important');
          x.unit.setAttribute('data-c36-u', '1');
          x.unit.toggleAttribute('data-c36-hide', isClosed);
        }
      }
    }
    /* もう無い入れ物の後始末 */
    for (const b of view.querySelectorAll('[data-c36-body]')) if (!live.has(b)) clearBody(b);
  }
  function clearBody(b) {
    b.removeAttribute('data-c36-body');
    SIG.delete(b);
    for (const h of b.querySelectorAll(':scope > .c36-sh')) h.remove();
    for (const u of b.querySelectorAll(':scope > [data-c36-u], :scope > [data-c36-o]')) {
      u.style.removeProperty('order'); u.removeAttribute('data-c36-u'); u.removeAttribute('data-c36-o'); u.removeAttribute('data-c36-hide');
    }
  }
  function clearView(view) {
    for (const b of view.querySelectorAll('[data-c36-body]')) clearBody(b);
  }

  /* 左上の「⊞ サブグループ」 */
  function bar(view, kind, key, show) {
    let el = view.querySelector(':scope > .c36-bar');
    if (!P.bar || !show) { if (el) el.remove(); return; }
    const cfg = VIEWS[key];
    const label = '⊞ サブグループ' + (cfg && cfg.prop ? '：' + (cfg.name || '') : '');
    if (!el) {
      el = document.createElement('div');
      el.className = 'c36-bar';
      el.setAttribute('contenteditable', 'false');
      el.addEventListener('mousedown', (e) => e.stopPropagation(), true);
      el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openMenu(view, el); });
      view.insertBefore(el, view.firstChild);
    }
    if (el.textContent !== label) el.textContent = label;
    el.toggleAttribute('data-on', !!(cfg && cfg.prop));
    el.setAttribute('data-c36-kind', kind);
  }

  /* ============================================================
   *  メニュー
   * ============================================================ */
  function closeMenu() { const m = document.getElementById('c36-menu'); if (m) m.remove(); }
  async function openMenu(view, anchor, at) {
    closeMenu();
    const bid = blockOf(view);
    if (!bid) return;
    const key = view.getAttribute('data-c36-key') || keyOf(view, bid);
    const cfg = VIEWS[key] || {};
    const m = document.createElement('div');
    m.id = 'c36-menu';
    m.innerHTML = '<div class="c36-mh">サブグループ</div><div class="c36-ml">読み込み中…</div>';
    document.body.appendChild(m);
    const r = anchor ? anchor.getBoundingClientRect() : { left: at.x, bottom: at.y };
    m.style.left = Math.max(8, Math.min(innerWidth - 300, r.left)) + 'px';
    m.style.top = Math.min(innerHeight - 120, r.bottom + 4) + 'px';
    const coll = await collOf(bid);
    if (!m.isConnected) return;
    const list = m.querySelector('.c36-ml');
    list.textContent = '';
    if (!coll) { list.textContent = 'この DB の項目を読めませんでした（少し待ってもう一度）'; return; }
    const item = (txt, mark, on, fn, cls) => {
      const b = document.createElement('div');
      b.className = 'c36-mi' + (on ? ' on' : '') + (cls ? ' ' + cls : '');
      const s = document.createElement('span'); s.className = 'c36-mk'; s.textContent = mark || '';
      const t = document.createElement('span'); t.textContent = txt;
      b.append(s, t);
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); });
      list.appendChild(b);
      return b;
    };
    const set = (o) => {
      const c = Object.assign({}, VIEWS[key] || {}, o);
      if (!c.prop) delete VIEWS[key]; else VIEWS[key] = c;
      saveV(); closeMenu(); clearView(view); run();
    };
    item('なし（サブグループをやめる）', '∅', !cfg.prop, () => set({ prop: '' }));
    const sep = () => { const d = document.createElement('div'); d.className = 'c36-sep'; list.appendChild(d); };
    sep();
    const props = Object.entries(coll.schema).filter(([, d]) => USABLE.has(d.type)).sort((a, b) => (a[1].type === 'title' ? -1 : b[1].type === 'title' ? 1 : 0));
    for (const [pid, d] of props) item(d.name || pid, TYPE_MARK[d.type] || '·', cfg.prop === pid, () => set({ prop: pid, name: d.name || pid, closed: cfg.prop === pid ? cfg.closed : {} }));
    if (cfg.prop) {
      sep();
      item('逆の順に並べる', cfg.rev ? '✓' : '', !!cfg.rev, () => set({ rev: !cfg.rev }));
      item('すべて畳む', '▸', false, () => {
        const closed = {};
        for (const h of view.querySelectorAll('.c36-sh')) closed[h.__c36.k] = 1;
        set({ closed });
      });
      item('すべて開く', '▾', false, () => set({ closed: {} }));
    }
  }
  document.addEventListener('mousedown', (e) => { const m = document.getElementById('c36-menu'); if (m && !m.contains(e.target) && !(e.target.closest && e.target.closest('.c36-bar'))) closeMenu(); }, true);
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
.c36-sh {
  display: flex; align-items: center; gap: 7px; box-sizing: border-box;
  margin: var(--c36-top) 0 var(--c36-bottom); padding: 3px 6px 4px var(--c36-indent);
  font-family: var(--c36-font); font-size: var(--c36-size); font-weight: var(--c36-weight); color: var(--c36-color);
  border-bottom: 1px solid var(--c36-line); cursor: pointer; user-select: none; line-height: 1.5;
}
.c36-sh:hover { background: var(--c-bacHov, rgba(55,53,47,.06)); }
[data-c36-body="tcol"] > .c36-sh { position: sticky; inset-inline-start: 0; width: max-content; min-width: min(100%, 320px); border-bottom: 0; box-shadow: inset 0 -1px 0 var(--c36-line); }
[data-c36-body="grid"] > .c36-sh { grid-column: 1 / -1; margin-bottom: 0; }
.c36-sh .c36-tg { width: 12px; font-size: 10px; opacity: .7; flex: none; }
.c36-sh .c36-ic { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; flex: none; font-size: 14px; line-height: 1; }
.c36-sh .c36-ic img { width: 18px; height: 18px; object-fit: cover; border-radius: 3px; display: block; }
.c36-sh .c36-lb { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60ch; }
.c36-sh .c36-chip { padding: 0 6px; border-radius: 3px; font-weight: 500; color: var(--c-texPri, #37352f); }
.c36-sh .c36-ct { color: var(--c36-count); font-weight: 400; }
.c36-bar {
  display: inline-flex; align-items: center; height: 22px; margin: 4px 0 2px; padding: 0 8px; border-radius: 5px;
  font: 500 12px/22px -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif; color: var(--c-texTer, rgba(55,53,47,.5));
  cursor: pointer; user-select: none; position: sticky; inset-inline-start: 0; z-index: 3; width: max-content;
}
.c36-bar:hover { background: var(--c-bacHov, rgba(55,53,47,.08)); color: var(--c-texPri, #37352f); }
.c36-bar[data-on] { color: var(--c-bluTex, #2383e2); }
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
    document.head.appendChild(st);
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
  const ours = (n) => n.nodeType === 1 && (n.classList.contains('c36-sh') || n.classList.contains('c36-bar') || n.id === 'c36-menu' || n.id === 'c36-css');
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
  setInterval(() => { if (Object.keys(VIEWS).length && document.visibilityState === 'visible') run(); }, Math.max(5000, P.refresh));
  setTimeout(run, 600);

  window.__c36 = {
    version: VERSION,
    status: () => Object.assign({ prefs: Object.assign({}, P), views: Object.assign({}, VIEWS) }, ST),
    set(o) { Object.assign(P, o || {}); saveP(); run(); return Object.assign({}, P); },
    clear() { VIEWS = {}; saveV(); for (const v of document.querySelectorAll(VIEW_SEL)) clearView(v); run(); },
    run
  };
})();
