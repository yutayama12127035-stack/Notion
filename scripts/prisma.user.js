// ==UserScript==
// @name         « No »　⁴⁰ _ Prisma
// @namespace    https://cordivestium.local/prisma
// @version      1.0.0
// @description  v1.0.0: 数のプロパティを「見てわかる数」に — 進み具合のバー・輪・星・点数・色の濃さ。「読んだページ ÷ 総ページ数」のような 2 つの数の組も名前から見つけて割合のバーに（読書の進み具合・映画の採点・勉強の進捗）。新しいビューを 2 つ: 表のまま表紙が並ぶ「テーブルギャラリー」と、ボードの列の中がギャラリーになる「ギャラリーボード」。設定は Notion の「ビューの設定」と、表の上の道具の段の ◇ から。見た目だけで、Notion のデータは変えない。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://*.notion.site/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/*
 * ⁴⁰ Prisma（プリズマ）— 数と表紙に光を通す柱
 *
 * v1.0.0（2026-10-09）
 *   ■ 数の見せ方（表のセル・ボード／ギャラリーのカード）
 *     ・バー … 進み具合。0〜1 なら %、0〜100 なら %、ほかの数で割る「割合」も（128 / 300p → 43%）
 *     ・輪   … 同じ値を小さな輪で
 *     ・星   … 評価。満点は自動（列の最大が 5 以下なら 5、10 以下なら 10、それより上は 100）。半端な星も描く
 *     ・点数 … 映画の採点のように、値で色が変わる札（赤 → 黄 → 緑）
 *     ・色の濃さ … 列の中で大きいほど濃く（数字はそのまま）
 *     ・そのまま … 何もしない
 *     自動（何も選んでいない時）は名前で見分ける:
 *       「進捗・達成・％・progress」→ バー ／「評価・スコア・点数・rating・星」→ 星
 *       「読んだ・読了・視聴・解いた・current…」と「総・全・目標・〜数・total…」の組 → 割合のバー（単位 p・話・問 … も名前から）
 *       Notion の「表示形式: バー／リング」を選んである数は、Notion のまま（上書きしない）
 *     動き: 初めて出る時にバーが伸び、輪が回り、星がきらめく。100% になったら ✓ が弾んで、バーに光が走る
 *   ■ テーブルギャラリー（表のビュー）
 *     表のまま、題名のセルの左に表紙。表紙の元は自動（ページのカバー → 画像のファイルのプロパティ（Covers・表紙…）→ アイコン）。
 *     画像が無い行は、色のタイルに頭文字。表紙に乗せると大きなのぞき窓、押すとページを開く。大きさ（小・中・大）と形（縦長・横長・正方形）
 *   ■ ギャラリーボード（ボードのビュー）
 *     ボードの列の中が、ギャラリーのような表紙のカードの格子に（1 列に 1〜3 枚）。カードは乗せると少し浮く
 *   ■ 設定: Notion の「ビューの設定」の Cordivestium の段（数の見せ方・テーブルギャラリー・ギャラリーボード）と、
 *     表の上の道具の段の ◇（フィルター・並べ替えの並び）
 *   ・コンソール: __c40.status() ／ __c40.set({ gauges, cards, peek, tb, anim }) ／ __c40.view(viewEl, { tg, gb, size, shape, src, cols }) ／ __c40.num(cid, pid, { s, of, max })
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '1.0.0';
  const TAG = '[⁴⁰ Prisma v' + VERSION + ']';
  if (window.__c40 && window.__c40.version) { console.warn(TAG, '旧版が動いています'); return; }

  const LS_P = 'c40.prefs.v1', LS_N = 'c40.num.v1', LS_V = 'c40.views.v1';
  const P = { on: true, gauges: true, cards: true, fam: true, peek: true, tb: true, anim: true, refresh: 30000 };
  let NUM = {}, VIEWS = {};
  try { Object.assign(P, JSON.parse(localStorage.getItem(LS_P) || '{}')); } catch (e) { /* noop */ }
  try { NUM = JSON.parse(localStorage.getItem(LS_N) || '{}') || {}; } catch (e) { NUM = {}; }
  try { VIEWS = JSON.parse(localStorage.getItem(LS_V) || '{}') || {}; } catch (e) { VIEWS = {}; }
  const save = (k, o) => { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) { /* noop */ } };
  const ST = { runs: 0, cells: 0, cards: 0, thumbs: 0, covers: 0, api: 0, lastError: '' };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp01 = (x) => (x > 1 ? 1 : x < 0 || !isFinite(x) ? 0 : x);
  const dash = (id) => {
    const h = String(id || '').replace(/-/g, '');
    return h.length === 32 ? h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20) : String(id || '');
  };
  const plain = (v) => (Array.isArray(v) ? v.map((s) => (Array.isArray(s) && typeof s[0] === 'string' ? (s[0] === '‣' ? '' : s[0]) : '')).join('') : '');

  /* ============================================================
   *  API（³⁶ Sub Groups と同じ読み方。syncRecordValues → 通らない所は syncRecordValuesMain）
   * ============================================================ */
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
   *  ビュー・行
   * ============================================================ */
  const VIEW_SEL = '.notion-table-view, .notion-board-view, .notion-gallery-view';
  const kindOf = (v) => (v.classList.contains('notion-table-view') ? 'table' : v.classList.contains('notion-board-view') ? 'board' : v.classList.contains('notion-gallery-view') ? 'gallery' : v.classList.contains('notion-list-view') ? 'list' : 'other');
  function blockOf(view) {
    const up = view.closest('.notion-collection_view-block, .notion-collection_view_page-block');
    if (up && up.getAttribute('data-block-id')) return up.getAttribute('data-block-id');
    const dn = view.querySelector('.notion-collection_view-block[data-block-id], .notion-collection_view_page-block[data-block-id]');
    if (dn) return dn.getAttribute('data-block-id');
    const pg = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname);
    return pg ? dash(pg[1]) : null;
  }
  function keyOf(view, bid) {
    const full = !view.closest('.notion-collection_view-block') && view.closest('.notion-frame, main, #notion-app');
    const v = new URLSearchParams(location.search).get('v');
    if (full && v && !view.closest('.notion-peek-renderer')) return bid + '|' + v;
    const host = view.closest('.notion-collection_view-block') || view.parentElement;
    const tab = host && host.querySelector('.notion-collection-view-tab-button[aria-selected="true"], [role="tab"][aria-selected="true"]');
    return bid + '|' + kindOf(view) + '|' + norm(tab ? tab.textContent : '');
  }
  const vcOf = (view) => { const bid = view && blockOf(view); return bid ? VIEWS[keyOf(view, bid)] || {} : {}; };
  function setView(key, o) {
    const c = Object.assign({}, VIEWS[key] || {}, o);
    for (const k of Object.keys(c)) if (c[k] === '' || c[k] == null || c[k] === false) delete c[k];
    if (Object.keys(c).length) VIEWS[key] = c; else delete VIEWS[key];
    save(LS_V, VIEWS);
    soon(0);
  }
  function setNum(cid, pid, o) {
    const m = NUM[cid] || (NUM[cid] = {});
    const c = Object.assign({}, m[pid] || {}, o);
    for (const k of Object.keys(c)) if (c[k] === '' || c[k] == null || (k === 's' && c[k] === 'auto')) delete c[k];
    if (Object.keys(c).length) m[pid] = c; else delete m[pid];
    if (!Object.keys(m).length) delete NUM[cid];
    save(LS_N, NUM);
    soon(0);
  }

  /* ============================================================
   *  数: 見分け方・割合・ゲージの値
   * ============================================================ */
  const isNumeric = (d) => !!d && (d.type === 'number' || d.type === 'rollup' || (d.type === 'formula' && !(d.formula && d.formula.result_type && d.formula.result_type !== 'number')));
  const RE = {
    prog: /進捗|進み|達成|消化|完了率|割合|progress|percent|completion|[%％]|率$/i,
    score: /評価|スコア|score|rating|点数|得点|採点|星|★|おすすめ|満足|推し度|好き度|^rate$/i,
    numer: /読んだ|読了|既読|現在|いま|今の|進んだ|済|完了|視聴|見た|解いた|やった|聴いた|done|read|current|watched|finished/i,
    denom: /総|全|合計|最大|目標|予定|total|max|goal|^all|数$|count$/i
  };
  const UNITS = [[/ページ|page|頁/i, 'p'], [/話|episode/i, '話'], [/問|question/i, '問'], [/章|chapter/i, '章'], [/時間|hour/i, 'h'], [/冊|book/i, '冊'], [/巻|volume/i, '巻'], [/回/, '回']];
  const unitOf = (name) => { for (const [re, u] of UNITS) if (re.test(name)) return u; return ''; };
  const numList = (schema) => Object.entries(schema || {}).filter(([, d]) => isNumeric(d)).map(([pid, d]) => ({ pid, name: d.name || '', def: d }));
  function denOf(n, nums) {
    if (!RE.numer.test(n.name) || /率$|[%％]|percent|progress/i.test(n.name)) return null;   // 「完了率」などは割合そのもの
    const u = unitOf(n.name);
    const cands = nums.filter((d) => d.pid !== n.pid && RE.denom.test(d.name) && !RE.numer.test(d.name) && !RE.score.test(d.name));
    return cands.find((d) => u && unitOf(d.name) === u) || (cands.length === 1 ? cands[0] : null);
  }
  function autoCfg(n, nums) {
    const sa = n.def.show_as;
    if (sa && sa.type && sa.type !== 'number') return null;   // Notion の「表示形式: バー／リング」を選んである数は Notion のまま
    const den = denOf(n, nums);
    if (den) return { s: 'bar', of: den.pid, u: unitOf(n.name) || unitOf(den.name) };
    if (RE.score.test(n.name)) return { s: 'stars' };
    if (RE.prog.test(n.name)) return { s: 'bar' };
    return null;
  }
  function cfgOf(cid, n, nums) {
    const u = (NUM[cid] || {})[n.pid] || {};
    if (u.s === 'plain') return null;
    const a = autoCfg(n, nums);
    const base = !u.s ? a : { s: u.s, of: a && a.of, u: a && a.u };
    if (!base) return null;
    const c = Object.assign({}, base);
    if (u.of) c.of = u.of === '-' ? '' : u.of;
    if (u.max) c.max = +u.max;
    if (!c.u) c.u = unitOf(n.name);
    return c;
  }
  /* 文字 → 数（1,234 ／ ¥1,234 ／ 43% ／ 全角） */
  function parseNum(t) {
    t = String(t || '').replace(/[０-９．－]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[\s,，]/g, '');
    const m = /-?\d+(?:\.\d+)?/.exec(t);
    return m ? { v: parseFloat(m[0]), pct: /[%％]/.test(t) } : null;
  }
  const fmt = (n) => { const a = Math.abs(n); return String(a >= 100 || Number.isInteger(n) ? Math.round(n * 10) / 10 : Math.round(n * 100) / 100); };
  function gauge(c, x, den, colMax) {
    const v = x.v;
    if (c.s === 'stars' || c.s === 'score') {
      const max = c.max || (x.pct ? 100 : colMax <= 5 ? 5 : colMax <= 10 ? 10 : 100);
      return { p: max ? v / max : 0, main: fmt(v) + (x.pct ? '%' : ''), sub: '/' + max, max };
    }
    if (den != null) {
      const p = den > 0 ? v / den : 0;
      return { p, main: Math.round(p * 100) + '%', sub: fmt(v) + '/' + fmt(den) + (c.u || ''), ratio: true };
    }
    const max = c.max || (x.pct ? 100 : colMax <= 1 ? 1 : colMax <= 100 ? 100 : colMax);   // 100 を超える列は、列の最大を満点に
    const p = max ? v / max : 0;
    return { p, main: max === 1 || max === 100 ? Math.round(p * 100) + '%' : fmt(v), sub: max === 1 || max === 100 ? '' : '/' + fmt(max) };
  }
  const colorOf = (p) => (p >= 1 ? 'var(--c40-done)' : p >= 0.67 ? 'var(--c40-hi)' : p >= 0.34 ? 'var(--c40-mid)' : 'var(--c40-lo)');
  const STYLE_L = { bar: 'バー', ring: '輪', stars: '星', score: '点数', heat: '色の濃さ', plain: 'そのまま' };

  function gHTML(c, g) {
    const sub = g.sub ? '<small>' + esc(g.sub) + '</small>' : '';
    if (c.s === 'ring') return '<span class="c40-rg"></span><b>' + esc(g.main) + '</b>' + sub;
    if (c.s === 'stars') return '<span class="c40-st">★★★★★</span><b>' + esc(g.main) + '</b>' + (g.max !== 5 ? sub : '');
    if (c.s === 'score') return '<b class="c40-sc">' + esc(g.main) + '<small>' + esc(g.sub) + '</small></b>';
    return '<span class="c40-tr"><i></i></span><b>' + esc(g.main) + '</b>' + sub;
  }
  /* host（表のセル・カードの段）に 1 つのゲージ。値だけ変わった時は中身を作り直さない（バーがなめらかに動く） */
  function paint(host, c, g, i) {
    let el = host.querySelector(':scope > .c40-g');
    const sig = c.s + '|' + g.main + '|' + g.sub + '|' + g.p.toFixed(3);
    if (el && el.__sig === sig) return el;
    if (!el) { el = document.createElement('span'); el.className = 'c40-g'; el.setAttribute('aria-hidden', 'true'); host.appendChild(el); }
    const p = clamp01(g.p);
    el.style.setProperty('--p', p.toFixed(4));
    el.style.setProperty('--c', colorOf(g.p));
    el.style.setProperty('--i', String((i || 0) % 16));
    if (c.s === 'score') el.style.setProperty('--h', String(Math.round(p * 125)));
    el.toggleAttribute('data-done', g.p >= 1 && c.s !== 'score');
    if (el.__s === c.s && el.__sub === !!g.sub) {
      const b = el.querySelector('b'); const s = el.querySelector('small');
      if (c.s === 'score') { if (b) b.innerHTML = esc(g.main) + '<small>' + esc(g.sub) + '</small>'; }
      else { if (b) b.textContent = g.main; if (s) s.textContent = g.sub; }
    } else {
      el.setAttribute('data-s', c.s);
      el.innerHTML = gHTML(c, g);
    }
    el.__s = c.s; el.__sub = !!g.sub; el.__sig = sig;
    return el;
  }
  function unpaint(cell) {
    const g = cell.querySelector(':scope > .c40-g'); if (g) g.remove();
    cell.removeAttribute('data-c40-g'); cell.removeAttribute('data-c40-heat'); cell.style.removeProperty('--c40-p');
  }

  /* ============================================================
   *  表: 見出しの名前 → プロパティ
   * ============================================================ */
  function headerNames(view) {
    const hs = view.querySelectorAll('.notion-table-view-header-cell');
    if (!hs.length) return null;
    let row = hs[0].parentElement;
    while (row && row !== view && row.querySelectorAll('.notion-table-view-header-cell').length < 2) row = row.parentElement;
    const list = row && row !== view ? [...row.querySelectorAll('.notion-table-view-header-cell')] : [hs[0]];
    return list.map((h) => norm((h.firstElementChild || h).textContent));
  }
  const pvOf = (cell) => cell.querySelector('[data-testid="property-value"]');
  function cellNum(cell) {
    const pv = pvOf(cell);
    const t = pv && pv.textContent;
    return t && t.trim() ? parseNum(t) : null;
  }
  const rowIdOf = (el) => { const r = el.closest('.notion-collection-item[data-block-id], [data-block-id].notion-page-block'); return r ? r.getAttribute('data-block-id') : null; };
  const SEEN = new Map();   // 'cid:pid' → { max, min }（見えている行が変わっても満点がぶれないよう覚える）
  function colStats(k, vals) {
    const o = SEEN.get(k) || { max: -Infinity, min: Infinity };
    for (const v of vals) { if (v > o.max) o.max = v; if (v < o.min) o.min = v; }
    SEEN.set(k, o);
    return o;
  }

  async function doTable(view, coll, vc, pass) {
    const names = headerNames(view);
    if (!names) return;
    const schema = coll.schema;
    const byName = new Map();
    for (const [pid, d] of Object.entries(schema)) byName.set(d.name, byName.has(d.name) ? null : pid);
    const cols = names.map((n) => byName.get(n) || null);
    const nums = numList(schema);
    if (P.gauges) {
      const later = [];
      for (let ci = 0; ci < cols.length; ci++) {
        const pid = cols[ci];
        if (!pid || !isNumeric(schema[pid])) continue;
        const n = nums.find((x) => x.pid === pid);
        const c = cfgOf(coll.cid, n, nums);
        if (!c) continue;
        const cells = [...view.querySelectorAll('.notion-table-view-cell[data-col-index="' + ci + '"]')];
        const xs = cells.map(cellNum);
        const stt = colStats(coll.cid + ':' + pid, xs.filter(Boolean).map((x) => x.v));
        const denCi = c.of ? cols.indexOf(c.of) : -1;
        cells.forEach((cell, k) => {
          let x = xs[k];
          const i = +cell.getAttribute('data-row-index') || 0;
          if (c.s === 'heat') {
            if (!x) return;
            const p = stt.max > stt.min ? (x.v - stt.min) / (stt.max - stt.min) : 1;
            const old = cell.querySelector(':scope > .c40-g'); if (old) old.remove();
            cell.removeAttribute('data-c40-g');
            cell.setAttribute('data-c40-heat', '');
            cell.style.setProperty('--c40-p', p.toFixed(3));
            cell.__c40pass = pass;
            return;
          }
          let den = null;
          if (c.of) {
            if (denCi >= 0) {
              const row = cell.closest('.notion-table-view-row') || cell.parentElement;
              const dc = row && row.querySelector('.notion-table-view-cell[data-col-index="' + denCi + '"]');
              const dx = dc && cellNum(dc);
              den = dx ? dx.v : null;
            } else { const id = rowIdOf(cell); if (id) later.push({ cell, c, x, id, i, stt }); return; }
            if (den == null) return;          // 割る数が空の行は Notion のまま
            if (!x) x = { v: 0, pct: false };   // まだ 0（読み始めていない本など）
          }
          if (!x) return;
          cell.setAttribute('data-c40-g', c.s);
          cell.removeAttribute('data-c40-heat');
          paint(cell, c, gauge(c, x, den, stt.max), i);
          cell.__c40pass = pass;
          ST.cells++;
        });
      }
      /* 割る数が表に出ていない時は、行の値を API で読む */
      if (later.length) {
        const recs = await records('block', [...new Set(later.map((l) => l.id))], P.refresh);
        for (const l of later) {
          const r = recs.get(l.id);
          const dx = r && parseNum(plain((r.properties || {})[l.c.of]));
          if (!dx) continue;
          const x = l.x || { v: 0, pct: false };
          if (!l.cell.isConnected) continue;
          l.cell.setAttribute('data-c40-g', l.c.s);
          paint(l.cell, l.c, gauge(l.c, x, dx ? dx.v : null, l.stt.max), l.i);
          l.cell.__c40pass = pass;
        }
      }
    }
    for (const cell of view.querySelectorAll('.notion-table-view-cell[data-c40-g], .notion-table-view-cell[data-c40-heat]')) if (cell.__c40pass !== pass) unpaint(cell);
    if (vc.tg) await doTG(view, coll, vc, cols, pass); else clearTG(view);
    await doFam(view, coll, vc, cols, pass);
  }

  /* ============================================================
   *  表紙（テーブルギャラリー・ギャラリーボード）
   * ============================================================ */
  const COVER_RE = /cover|表紙|カバー|ポスター|poster|画像|image|img|thumb|サムネ|ジャケ|写真|photo|picture|art/i;
  function imgOf(r, schema, src) {
    const f = r.format || {};
    const fromFile = (pid) => {
      const v = (r.properties || {})[pid];
      if (!Array.isArray(v)) return '';
      for (const s of v) if (Array.isArray(s) && Array.isArray(s[1])) for (const fm of s[1]) if (Array.isArray(fm) && fm[0] === 'a' && fm[1]) return fm[1];
      return '';
    };
    if (src && !/^(auto|cover|icon)$/.test(src)) { const u = fromFile(src); if (u) return { url: u, kind: 'file' }; }
    else if (src !== 'icon') {
      if (f.page_cover) return { url: f.page_cover, kind: 'cover', pos: f.page_cover_position };
      if (src !== 'cover') {
        const files = Object.entries(schema || {}).filter(([, d]) => d.type === 'file').sort((a, b) => (COVER_RE.test(b[1].name) ? 1 : 0) - (COVER_RE.test(a[1].name) ? 1 : 0));
        for (const [pid] of files) { const u = fromFile(pid); if (u) return { url: u, kind: 'file' }; }
      }
    }
    return f.page_icon ? { icon: f.page_icon } : null;
  }
  function srcUrl(u, r, w) {
    if (!u) return '';
    if (/^\//.test(u)) return u;
    if (/^attachment:/.test(u) || /secure\.notion-static\.com|prod-files-secure|file\.notion\.so|notionusercontent/.test(u)) {
      return '/image/' + encodeURIComponent(u) + '?table=block&id=' + r.id + (r.space_id ? '&spaceId=' + r.space_id : '') + '&width=' + (w || 480) + '&userId=&cache=v2';
    }
    return /^https?:/.test(u) ? u : '';
  }
  const hueOf = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) % 360; return h; };
  function phHTML(r, icon) {
    const title = norm(plain(r.properties && r.properties.title));
    let inner;
    if (icon && /^(\/|https?:|attachment:)/.test(icon)) inner = '<img alt="" src="' + esc(srcUrl(icon, r, 120)) + '">';
    else if (icon) inner = '<span class="c40-em">' + esc(icon) + '</span>';
    else inner = esc([...title][0] || '・');
    return '<span class="c40-ph" style="--hue:' + hueOf(r.id || title) + '">' + inner + '</span>';
  }
  function fillPic(box, r, im, w) {
    const key = im ? im.url || im.icon : '';
    if (box.__k === key) return false;
    box.__k = key; box.__bad = false;
    box.textContent = '';
    if (im && im.url) {
      const img = document.createElement('img');
      img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'same-origin';
      if (im.kind === 'cover' && im.pos != null && isFinite(+im.pos)) img.style.objectPosition = 'center ' + Math.round((1 - +im.pos) * 100) + '%';
      img.onerror = () => { box.__bad = true; ST.imgErr = String(img.src).slice(0, 300); box.innerHTML = phHTML(r, ''); };
      img.src = srcUrl(im.url, r, w);
      box.appendChild(img);
    } else box.innerHTML = phHTML(r, im && im.icon);
    return true;
  }
  /* 行・カードを開く（Notion の「開く」ボタン → 無ければページへ） */
  function openRow(el, id) {
    const row = el.closest('.notion-collection-item') || el;
    const b = row.querySelector('[aria-label="Open in side peek"], [aria-label="サイドピークで開く"], [aria-label="Open"], [aria-label="開く"]')
      || [...row.querySelectorAll('[role="button"]')].find((x) => /^(open|開く)$/i.test(norm(x.textContent)));
    if (b) { b.click(); return; }
    const a = row.querySelector('a[href]');
    if (a) { a.click(); return; }
    if (id) location.assign('/' + id.replace(/-/g, ''));
  }
  /* のぞき窓（表紙に乗せると大きく） */
  let peekT = 0;
  function peek(th, r, im) {
    clearTimeout(peekT);
    if (!P.peek || !im || !im.url || th.__bad) return;
    peekT = setTimeout(() => {
      if (!th.isConnected || !th.matches(':hover')) return;
      unpeek();
      const q = th.getBoundingClientRect();
      const ar = th.closest('[data-c40-tg]') ? getComputedStyle(th.closest('[data-c40-tg]')).getPropertyValue('--c40-ar') || '1' : '1';
      const d = document.createElement('div');
      d.id = 'c40-peek';
      d.innerHTML = '<div class="pk-img"></div><div class="pk-t"></div>';
      d.style.setProperty('--ar', ar.trim() || '1');
      d.querySelector('.pk-img').style.backgroundImage = 'url("' + srcUrl(im.url, r, 640).replace(/"/g, '%22') + '")';
      d.querySelector('.pk-t').textContent = norm(plain(r.properties && r.properties.title)) || '無題';
      document.body.appendChild(d);
      const w = d.offsetWidth, h = d.offsetHeight;
      let x = q.right + 12, y = q.top + q.height / 2 - h / 2;
      if (x + w > innerWidth - 8) x = Math.max(8, q.left - w - 12);
      y = Math.max(8, Math.min(innerHeight - h - 8, y));
      d.style.left = x + 'px'; d.style.top = y + 'px';
    }, 280);
  }
  function unpeek() { clearTimeout(peekT); const d = document.getElementById('c40-peek'); if (d) d.remove(); }

  const TG_SIZE = { s: 40, m: 60, l: 92 };
  const AR = { poster: 2 / 3, wide: 16 / 10, square: 1 };
  async function doTG(view, coll, vc, cols, pass) {
    const ti = cols.indexOf('title');
    if (ti < 0) return clearTG(view);
    const rows = [...view.querySelectorAll('.notion-collection-item[data-block-id]')].filter((r) => r.querySelector(':scope > .notion-table-view-row'));
    const ids = rows.map((r) => r.getAttribute('data-block-id'));
    const recs = ids.length ? await records('block', ids, 60000) : new Map();
    /* 形: 自動なら、画像の元に合わせる（ファイルのプロパティ＝本やポスター → 縦長、ページのカバー → 横長、アイコンだけ → 正方形） */
    let shape = vc.shape || 'auto';
    const ims = new Map();
    for (const id of ids) { const r = recs.get(id); if (r) ims.set(id, imgOf(r, coll.schema, vc.src || 'auto')); }
    if (shape === 'auto') {
      const k = { file: 0, cover: 0, none: 0 };
      for (const im of ims.values()) k[im && im.url ? im.kind : 'none']++;
      shape = k.file >= k.cover && k.file > 0 ? 'poster' : k.cover > 0 ? 'wide' : 'square';
    }
    const h = TG_SIZE[vc.size || 'm'] || 60;
    const ar = AR[shape] || 1;
    view.setAttribute('data-c40-tg', vc.size || 'm');
    view.style.setProperty('--c40-th', h + 'px');
    view.style.setProperty('--c40-tw', Math.round(h * ar) + 'px');
    view.style.setProperty('--c40-ar', String(ar));
    rows.forEach((row, k) => {
      const id = ids[k]; const r = recs.get(id);
      const cell = row.querySelector('.notion-table-view-cell[data-col-index="' + ti + '"]');
      if (!cell || !r) return;
      let th = cell.querySelector(':scope > .c40-th');
      if (!th) {
        th = document.createElement('span');
        th.className = 'c40-th';
        th.setAttribute('contenteditable', 'false');
        th.setAttribute('role', 'button');
        th.title = 'ページを開く';
        th.addEventListener('mousedown', (e) => { e.stopPropagation(); e.preventDefault(); });
        th.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); unpeek(); openRow(th, th.__id); });
        th.addEventListener('pointerenter', () => peek(th, th.__r, th.__im));
        th.addEventListener('pointerleave', unpeek);
        cell.appendChild(th);
      }
      th.__id = id; th.__r = r; th.__im = ims.get(id);
      if (fillPic(th, r, th.__im, Math.round(h * 2.4))) ST.thumbs++;
      cell.setAttribute('data-c40-th', '');
      cell.__c40tg = pass;
    });
    for (const cell of view.querySelectorAll('.notion-table-view-cell[data-c40-th]')) if (cell.__c40tg !== pass) { const t = cell.querySelector(':scope > .c40-th'); if (t) t.remove(); cell.removeAttribute('data-c40-th'); }
  }
  function clearTG(view) {
    if (!view.hasAttribute('data-c40-tg')) return;
    view.removeAttribute('data-c40-tg');
    for (const v of ['--c40-th', '--c40-tw', '--c40-ar']) view.style.removeProperty(v);
    for (const cell of view.querySelectorAll('[data-c40-th]')) { const t = cell.querySelector(':scope > .c40-th'); if (t) t.remove(); cell.removeAttribute('data-c40-th'); }
  }

  /* ============================================================
   *  カード（ボード・ギャラリー）: 数の段と、ギャラリーボードの表紙
   * ============================================================ */
  const GB_W = { 1: 280, 2: 380, 3: 520 };
  async function doCards(view, coll, vc, kind, pass) {
    const items = [...view.querySelectorAll('.notion-collection-item[data-block-id]')];
    const gb = kind === 'board' && !!vc.gb;
    const nums = numList(coll.schema).filter((n) => n.def.type === 'number');
    const gcs = P.gauges && P.cards ? nums.map((n) => ({ n, c: cfgOf(coll.cid, n, nums) })).filter((x) => x.c && x.c.s !== 'heat').slice(0, 3) : [];
    if (gb) markGB(view, vc); else clearGB(view);
    if (!items.length || (!gb && !gcs.length)) { cleanCards(view, pass); await famCards(view, coll, vc, items, pass); return; }
    const ids = items.map((it) => it.getAttribute('data-block-id'));
    const recs = await records('block', ids, P.refresh);
    const stats = gcs.map((g) => colStats(coll.cid + ':' + g.n.pid, ids.map((id) => { const r = recs.get(id); const x = r && parseNum(plain((r.properties || {})[g.n.pid])); return x ? x.v : null; }).filter((v) => v != null)));
    let shape = vc.shape || 'auto';
    if (gb && shape === 'auto') {
      const k = { file: 0, cover: 0 };
      for (const id of ids) { const r = recs.get(id); const im = r && imgOf(r, coll.schema, vc.src || 'auto'); if (im && im.url) k[im.kind]++; }
      shape = k.file >= k.cover && k.file > 0 ? 'poster' : 'wide';
      view.style.setProperty('--c40-ar', String(AR[shape] || 1.6));
    } else if (gb) view.style.setProperty('--c40-ar', String(AR[shape] || 1.6));
    items.forEach((it, k) => {
      const r = recs.get(ids[k]);
      if (!r || !it.isConnected) return;
      const a = it.querySelector('a[href]') || it.querySelector(':scope > div[role="presentation"]');
      if (!a) return;
      /* 数の段 */
      if (gcs.length) {
        const slots = [];
        gcs.forEach((g, j) => {
          const x = parseNum(plain((r.properties || {})[g.n.pid]));
          const dx = g.c.of ? parseNum(plain((r.properties || {})[g.c.of])) : null;
          if (g.c.of ? !dx : !x) return;
          slots.push({ g, gg: gauge(g.c, x || { v: 0 }, g.c.of ? (dx ? dx.v : null) : null, stats[j].max) });
        });
        let strip = a.querySelector(':scope > .c40-strip');
        if (slots.length) {
          if (!strip) { strip = document.createElement('div'); strip.className = 'c40-strip'; strip.setAttribute('contenteditable', 'false'); a.appendChild(strip); }
          const sig = slots.map((s) => s.g.n.pid).join(',');
          if (strip.__sig !== sig) { strip.textContent = ''; for (const s of slots) { const sl = document.createElement('span'); sl.className = 'c40-sl'; sl.innerHTML = '<em></em>'; sl.firstChild.textContent = s.g.n.name; strip.appendChild(sl); } strip.__sig = sig; }
          slots.forEach((s, j) => paint(strip.children[j], s.g.c, s.gg, k));
          strip.__pass = pass;
          ST.cards++;
        } else if (strip) strip.remove();
      }
      /* ギャラリーボードの表紙（Notion のカードの表紙が出ていない時だけ） */
      if (gb) {
        const pre = a.firstElementChild && a.firstElementChild.firstElementChild;
        const native = a.firstElementChild && [...a.firstElementChild.querySelectorAll('img')].some((im) => !im.closest('.c40-cov'));
        let cv = it.querySelector('.c40-cov');
        if (native || !pre) { if (cv) cv.remove(); }
        else {
          if (!cv) { cv = document.createElement('span'); cv.className = 'c40-cov'; cv.setAttribute('contenteditable', 'false'); }
          if (cv.parentElement !== pre) pre.appendChild(cv);
          if (fillPic(cv, r, imgOf(r, coll.schema, vc.src || 'auto'), 520)) ST.covers++;
          cv.__pass = pass;
        }
      }
    });
    cleanCards(view, pass);
    await famCards(view, coll, vc, items, pass);
  }
  function cleanCards(view, pass) {
    for (const s of view.querySelectorAll('.c40-strip')) if (s.__pass !== pass) s.remove();
    for (const c of view.querySelectorAll('.c40-cov')) if (c.__pass !== pass) c.remove();
  }
  /* ボードの列の見出し（列の段とは別の入れ物）も同じ幅に */
  function markGB(view, vc) {
    const cols = Math.max(1, Math.min(3, +vc.cols || 2));
    view.setAttribute('data-c40-gb', String(cols));
    view.style.setProperty('--c40-gc', String(cols));
    view.style.setProperty('--c40-gw', (GB_W[cols] || 380) + 'px');
    for (const h of view.querySelectorAll('div[style*="box-sizing: content-box"][style*="flex-shrink: 0"]')) if (!h.closest('.notion-board-group') && !h.hasAttribute('data-c40-gbh')) h.setAttribute('data-c40-gbh', '');
  }
  function clearGB(view) {
    if (!view.hasAttribute('data-c40-gb')) return;
    view.removeAttribute('data-c40-gb');
    for (const v of ['--c40-gc', '--c40-gw', '--c40-ar']) view.style.removeProperty(v);
    for (const h of view.querySelectorAll('[data-c40-gbh]')) h.removeAttribute('data-c40-gbh');
    for (const c of view.querySelectorAll('.c40-cov')) c.remove();
  }

  /* ============================================================
   *  サブアイテム（親アイテム・サブアイテム）
   *    トグルを開かなくても「子がいくつ・どこまで済んだか」が見え、子の一覧を小窓で一気に見られる。
   *    ・表: 親の行の題名の下に「⤷ 5  ▰▰▱ 3/5」の札（子の数・済んだ数）。乗せる／押すと子の一覧の小窓（押すと開く）
   *    ・ボード／ギャラリー: カードの下に子の札と、子のカードには「↰ 親の名前」
   *    ・道具の段の ◇ › サブアイテム: 全部ひらく／全部とじる（Notion のトグルを順に押す）
   *    済んだかどうか: ステータス（Complete の組）→ チェックボックス → 「状態」などのセレクトの「完了・読了・済」
   * ============================================================ */
  const KID_RE = /sub-?items?|サブアイテム|子アイテム|サブタスク|子タスク|children|subtasks?|^子$/i;
  const PAR_RE = /parent|親/i;
  const FAM = new Map();   // cid → { kid, par } | null
  function famOf(coll) {
    if (FAM.has(coll.cid)) return FAM.get(coll.cid);
    const self = Object.entries(coll.schema).filter(([, d]) => d.type === 'relation' && d.collection_id === coll.cid);
    let kid = self.find(([, d]) => KID_RE.test(d.name));
    let par = self.find(([, d]) => PAR_RE.test(d.name) && !KID_RE.test(d.name));
    if (!kid && par && par[1].property) kid = self.find(([pid]) => pid === par[1].property);
    if (!par && kid && kid[1].property) par = self.find(([pid]) => pid === kid[1].property);
    const out = kid ? { kid: kid[0], par: par ? par[0] : null } : null;
    FAM.set(coll.cid, out);
    return out;
  }
  const pageIds = (v) => {
    const out = [];
    if (Array.isArray(v)) for (const s of v) if (Array.isArray(s) && Array.isArray(s[1])) for (const f of s[1]) if (Array.isArray(f) && f[0] === 'p' && f[1]) out.push(f[1]);
    return out;
  };
  const DONE_RE = /完了|済|読了|視聴済|done|complete|finished|closed/i;
  function doneOf(r, schema) {
    const props = r.properties || {};
    const ent = Object.entries(schema);
    const st = ent.find(([, d]) => d.type === 'status');
    if (st) {
      const name = plain(props[st[0]]);
      const op = (st[1].options || []).find((o) => o.value === name);
      const g = op && (st[1].groups || []).find((x) => (x.optionIds || []).includes(op.id));
      return g ? (/complete|done|完了/i.test(g.name) ? 1 : 0) : DONE_RE.test(name) ? 1 : 0;
    }
    const cb = ent.find(([, d]) => d.type === 'checkbox');
    if (cb) return plain(props[cb[0]]) === 'Yes' ? 1 : 0;
    const sel = ent.find(([, d]) => d.type === 'select' && /状態|ステータス|status|進捗|state/i.test(d.name));
    if (sel) return DONE_RE.test(plain(props[sel[0]])) ? 1 : 0;
    return null;
  }
  function stateOf(r, schema) {
    const props = r.properties || {};
    const st = Object.entries(schema).find(([, d]) => d.type === 'status' || (d.type === 'select' && /状態|ステータス|status|進捗|state/i.test(d.name)));
    return st ? plain(props[st[0]]) : '';
  }
  function famStat(ids, kr, schema) {
    const ds = ids.map((k) => { const r = kr.get(k); return r ? doneOf(r, schema) : null; }).filter((d) => d != null);
    const done = ds.filter(Boolean).length;
    return { n: ids.length, done, counted: ds.length, p: ds.length ? done / ds.length : null };
  }
  const FAM_ICO = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2.5v6.5a2 2 0 0 0 2 2h6.5"/><path d="M10 8.5l2.5 2.5L10 13.5"/></svg>';
  function famHTML(s) {
    let h = '<span class="fi">' + FAM_ICO + '</span><b>' + s.n + '</b>';
    if (s.counted) h += '<span class="fb"><i style="width:' + Math.round(s.p * 100) + '%"></i></span><small>' + s.done + '/' + s.counted + '</small>';
    return h;
  }
  /* 子の一覧の小窓 */
  let famT = 0;
  function closeFamPop() { clearTimeout(famT); const d = document.getElementById('c40-fpop'); if (d) d.remove(); }
  function openPage(id) {
    const el = document.querySelector('.notion-collection-item[data-block-id="' + id + '"]');
    if (el) return openRow(el, id);
    const u = new URL(location.href);
    u.searchParams.set('p', id.replace(/-/g, '')); u.searchParams.set('pm', 's');
    try { history.pushState(history.state, '', u.toString()); dispatchEvent(new PopStateEvent('popstate', { state: history.state })); } catch (e) { location.assign(u.toString()); }
  }
  async function famPop(anchor, ids, schema, title, pin) {
    closeFamPop();
    const d = document.createElement('div');
    d.id = 'c40-fpop';
    d.setAttribute('data-no-passthrough', '1');
    if (pin) d.setAttribute('data-pin', '');
    d.innerHTML = '<div class="fh"><span class="fi">' + FAM_ICO + '</span><span class="ft"></span><span class="fs"></span></div><div class="fl"><div class="fe">読み込み中…</div></div>';
    d.querySelector('.ft').textContent = title;
    for (const ev of ['pointerdown', 'mousedown', 'click']) d.addEventListener(ev, (e) => e.stopPropagation());
    d.addEventListener('pointerleave', () => { if (!d.hasAttribute('data-pin')) famT = setTimeout(closeFamPop, 250); });
    d.addEventListener('pointerenter', () => clearTimeout(famT));
    document.body.appendChild(d);
    const place = () => {
      const q = anchor.getBoundingClientRect();
      const w = d.offsetWidth, h = d.offsetHeight;
      let x = Math.max(8, Math.min(innerWidth - w - 8, q.left));
      let y = q.bottom + 6;
      if (y + h > innerHeight - 8) y = Math.max(8, q.top - h - 6);
      d.style.left = x + 'px'; d.style.top = y + 'px';
    };
    place();
    const kr = await records('block', ids, P.refresh);
    if (!d.isConnected) return;
    const s = famStat(ids, kr, schema);
    d.querySelector('.fs').textContent = s.counted ? s.done + ' / ' + s.counted + ' 済' : ids.length + ' 件';
    d.style.setProperty('--p', String(s.p == null ? 0 : s.p));
    const fl = d.querySelector('.fl');
    fl.textContent = '';
    ids.forEach((id, i) => {
      const r = kr.get(id);
      const row = document.createElement('div');
      row.className = 'fk';
      row.style.setProperty('--i', String(i % 12));
      const ic = r && r.format && r.format.page_icon;
      const icHTML = ic ? (/^(\/|https?:|attachment:)/.test(ic) ? '<img alt="" src="' + esc(srcUrl(ic, r, 64)) + '">' : esc(ic)) : '<span class="fdot"></span>';
      const dn = r ? doneOf(r, schema) : null;
      const stt = r ? stateOf(r, schema) : '';
      row.innerHTML = '<span class="fki">' + icHTML + '</span><span class="fkt"></span>' + (stt ? '<span class="fks"></span>' : '') + (dn != null ? '<span class="fkd" data-d="' + dn + '">' + (dn ? '✓' : '') + '</span>' : '');
      row.querySelector('.fkt').textContent = r ? norm(plain(r.properties && r.properties.title)) || '無題' : '…';
      if (stt) row.querySelector('.fks').textContent = stt;
      if (dn) row.setAttribute('data-done', '');
      row.addEventListener('click', () => { closeFamPop(); openPage(id); });
      fl.appendChild(row);
    });
    if (!ids.length) fl.innerHTML = '<div class="fe">子アイテムはありません</div>';
    place();
  }
  function famBadge(host, s, ids, schema, title, cls) {
    let b = host.querySelector(':scope > .' + cls);
    const sig = s.n + ':' + s.done + '/' + s.counted + ':' + ids.join(',');
    if (b && b.__sig === sig) return b;
    if (!b) {
      b = document.createElement('span');
      b.className = cls;
      b.setAttribute('role', 'button');
      b.setAttribute('contenteditable', 'false');
      b.addEventListener('mousedown', (e) => { e.stopPropagation(); e.preventDefault(); });
      b.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); const p = document.getElementById('c40-fpop'); if (p && p.__for === b && p.hasAttribute('data-pin')) { closeFamPop(); return; } famPop(b, b.__ids, b.__schema, b.__title, true).then(() => { const q = document.getElementById('c40-fpop'); if (q) q.__for = b; }); });
      b.addEventListener('pointerenter', () => { clearTimeout(famT); famT = setTimeout(() => { if (b.matches(':hover') && !document.querySelector('#c40-fpop[data-pin]')) famPop(b, b.__ids, b.__schema, b.__title, false).then(() => { const q = document.getElementById('c40-fpop'); if (q) q.__for = b; }); }, 380); });
      b.addEventListener('pointerleave', () => { clearTimeout(famT); const p = document.getElementById('c40-fpop'); if (p && !p.hasAttribute('data-pin')) famT = setTimeout(closeFamPop, 300); });
      host.appendChild(b);
    }
    b.__ids = ids; b.__schema = schema; b.__title = title; b.__sig = sig;
    b.innerHTML = famHTML(s);
    b.toggleAttribute('data-done', s.counted > 0 && s.done === s.counted);
    b.title = '子アイテム ' + s.n + ' 件' + (s.counted ? '（済 ' + s.done + '）' : '') + ' — 乗せると一覧・押すと固定';
    return b;
  }
  async function doFam(view, coll, vc, cols, pass) {
    const fam = famOf(coll);
    const ti = cols.indexOf('title');
    if (!fam || !P.fam || vc.fam === 0 || ti < 0) { clearFam(view); return; }
    const rows = [...view.querySelectorAll('.notion-collection-item[data-block-id]')].filter((r) => r.querySelector(':scope > .notion-table-view-row'));
    const ids = rows.map((r) => r.getAttribute('data-block-id'));
    if (!ids.length) return;
    const recs = await records('block', ids, P.refresh);
    const kids = new Set();
    for (const id of ids) { const r = recs.get(id); if (r) pageIds((r.properties || {})[fam.kid]).forEach((k) => kids.add(k)); }
    const kr = kids.size ? await records('block', [...kids], P.refresh) : new Map();
    const reads = [];
    rows.forEach((row, n) => {
      const r = recs.get(ids[n]);
      const cell = row.querySelector('.notion-table-view-cell[data-col-index="' + ti + '"]');
      if (!r || !cell) return;
      const k = pageIds((r.properties || {})[fam.kid]);
      if (!k.length) return;
      const b = famBadge(cell, famStat(k, kr, coll.schema), k, coll.schema, norm(plain(r.properties && r.properties.title)) || '無題', 'c40-fam');
      cell.setAttribute('data-c40-fam', '');
      cell.__c40fam = pass;
      reads.push({ cell, b });
    });
    for (const cell of view.querySelectorAll('.notion-table-view-cell[data-c40-fam]')) if (cell.__c40fam !== pass) { const b = cell.querySelector(':scope > .c40-fam'); if (b) b.remove(); cell.removeAttribute('data-c40-fam'); }
    /* 札を題名の頭にそろえる（入れ子の字下げに付いていく）— 読んでから書く */
    if (reads.length) requestAnimationFrame(() => {
      const xs = reads.map(({ cell }) => { const t = cell.querySelector('[data-testid="property-value"] span[style*="font-weight"], [data-testid="property-value"] [data-content-editable-leaf]') || pvOf(cell); const a = t && t.getBoundingClientRect(), c = cell.getBoundingClientRect(); return a ? Math.max(6, Math.round(a.left - c.left)) : 8; });
      reads.forEach(({ b }, i) => { b.style.insetInlineStart = xs[i] + 'px'; });
    });
  }
  function clearFam(view) {
    for (const cell of view.querySelectorAll('[data-c40-fam]')) { const b = cell.querySelector(':scope > .c40-fam'); if (b) b.remove(); cell.removeAttribute('data-c40-fam'); }
  }
  async function famCards(view, coll, vc, items, pass) {
    const fam = famOf(coll);
    if (!fam || !P.fam || vc.fam === 0 || !items.length) { for (const k of view.querySelectorAll('.c40-kin')) k.remove(); return; }
    const ids = items.map((it) => it.getAttribute('data-block-id'));
    const recs = await records('block', ids, P.refresh);
    const more = new Set();
    for (const id of ids) { const r = recs.get(id); if (!r) continue; pageIds((r.properties || {})[fam.kid]).forEach((k) => more.add(k)); if (fam.par) pageIds((r.properties || {})[fam.par]).forEach((k) => more.add(k)); }
    const kr = more.size ? await records('block', [...more], P.refresh) : new Map();
    items.forEach((it, n) => {
      const r = recs.get(ids[n]);
      const a = it.querySelector('a[href]') || it.querySelector(':scope > div[role="presentation"]');
      if (!r || !a) return;
      const k = pageIds((r.properties || {})[fam.kid]);
      const pa = fam.par ? pageIds((r.properties || {})[fam.par])[0] : null;
      let kin = a.querySelector(':scope > .c40-kin');
      if (!k.length && !pa) { if (kin) kin.remove(); return; }
      if (!kin) { kin = document.createElement('div'); kin.className = 'c40-kin'; kin.setAttribute('contenteditable', 'false'); a.appendChild(kin); }
      const sig = k.join(',') + '|' + pa;
      if (kin.__sig !== sig) {
        kin.textContent = '';
        if (pa) { const pr = kr.get(pa); const c = document.createElement('span'); c.className = 'c40-kp'; c.textContent = '↰ ' + (pr ? norm(plain(pr.properties && pr.properties.title)) || '無題' : '親'); kin.appendChild(c); }
        kin.__sig = sig;
      }
      if (k.length) famBadge(kin, famStat(k, kr, coll.schema), k, coll.schema, norm(plain(r.properties && r.properties.title)) || '無題', 'c40-fam');
      else { const b = kin.querySelector('.c40-fam'); if (b) b.remove(); }
      kin.__pass = pass;
    });
    for (const k of view.querySelectorAll('.c40-kin')) if (k.__pass !== pass) k.remove();
  }
  /* 全部ひらく／とじる（Notion のサブアイテムのトグルを順に押す。開いた先に孫のトグルが出たら、もう 2 回まで） */
  function toggleAll(view, open) {
    let n = 0;
    const once = () => {
      const ts = [...view.querySelectorAll('.notion-table-view-cell [role="button"][aria-expanded="' + (open ? 'false' : 'true') + '"], .notion-list-view [role="button"][aria-expanded="' + (open ? 'false' : 'true') + '"]')]
        .filter((t) => !t.closest('.c40-fam, .notion-table-view-header-cell') && t.querySelector('svg') && /arrow|triangle|chevron|caret/i.test(t.querySelector('svg').getAttribute('class') || ''));
      (open ? ts : ts.reverse()).forEach((t) => { try { t.click(); n++; } catch (e) { /* noop */ } });
      return ts.length;
    };
    once();
    if (open) { setTimeout(once, 450); setTimeout(once, 1000); }
    return n;
  }

  /* ============================================================
   *  道具の段の ◇ と、その小窓
   * ============================================================ */
  const ICO = {
    prism: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M9.6 3.4 3.6 15.4h12z"/><path d="M1.4 11.2l5.3-1.4"/><path class="r1" d="M12.4 8.9l5.8-2.3"/><path class="r2" d="M12.9 10.3l5.6.2"/><path class="r3" d="M12.6 11.7l5.1 2.4"/></svg>',
    num: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><path d="M3.5 14.5h13"/><path d="M5 11.5V9M8.5 11.5V6.5M12 11.5V8M15.5 11.5V4.5"/></svg>',
    tg: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"><rect x="3" y="3.5" width="4.2" height="5.2" rx="1"/><rect x="3" y="11.3" width="4.2" height="5.2" rx="1"/><path d="M9.6 5h7.4M9.6 7.4h5M9.6 12.8h7.4M9.6 15.2h5" stroke-linecap="round"/></svg>',
    gb: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"><rect x="2.6" y="3" width="6.4" height="5" rx="1.2"/><rect x="2.6" y="9.6" width="6.4" height="7.4" rx="1.2"/><rect x="11" y="3" width="6.4" height="7.4" rx="1.2"/><rect x="11" y="12" width="6.4" height="5" rx="1.2"/></svg>'
  };
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
  function tbBtn(view, kind, vc) {
    const row = P.tb ? toolbarOf(view) : null;
    let el = view.__c40tb;
    if (!row) { if (el) { el.remove(); view.__c40tb = null; } return; }
    if (!el || !el.isConnected && row.querySelector(':scope > .c40-tb')) el = row.querySelector(':scope > .c40-tb') || el;
    if (!el) {
      el = document.createElement('div');
      el.className = 'c40-tb';
      el.setAttribute('role', 'button'); el.tabIndex = 0;
      el.setAttribute('contenteditable', 'false');
      el.innerHTML = '<span class="c40-bi">' + ICO.prism + '</span><span class="c40-bl"></span>';
      el.addEventListener('mousedown', (e) => e.stopPropagation(), true);
      el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const v = el.__view; if (v && v.isConnected) pop(el, '⁴⁰ Prisma — 数と表紙', (api) => buildMenu(api, v)); });
      view.__c40tb = el;
    }
    el.__view = view;
    if (el.parentElement !== row) {
      const c36 = row.querySelector(':scope > .c36-tb');
      row.insertBefore(el, c36 ? c36.nextSibling : row.firstChild);
    }
    const label = kind === 'table' && vc.tg ? 'テーブルギャラリー' : kind === 'board' && vc.gb ? 'ギャラリーボード' : '';
    const lb = el.querySelector('.c40-bl'); if (lb.textContent !== label) lb.textContent = label;
    el.toggleAttribute('data-on', !!label);
    el.title = 'Prisma — 数の見せ方' + (kind === 'table' ? '・テーブルギャラリー' : kind === 'board' ? '・ギャラリーボード' : '');
  }
  /* 小窓（ビューの設定の小メニューと同じ部品の形 — sec / note / div / item / clear / close） */
  function mkApi(bd, close) {
    return {
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
      close,
      body: bd
    };
  }
  function closePop() { const m = document.getElementById('c40-pop'); if (m) m.remove(); }
  function pop(anchor, title, build) {
    closePop();
    const m = document.createElement('div');
    m.id = 'c40-pop';
    m.setAttribute('data-no-passthrough', '1');
    m.innerHTML = '<div class="cvs-hd"><div class="cvs-ttl"></div></div><div class="cvs-bd"></div>';
    m.querySelector('.cvs-ttl').textContent = title;
    for (const ev of ['pointerdown', 'mousedown', 'click', 'keydown']) m.addEventListener(ev, (e) => e.stopPropagation());
    document.body.appendChild(m);
    const q = anchor.getBoundingClientRect();
    const w = Math.min(320, innerWidth - 16);
    m.style.width = w + 'px';
    m.style.left = Math.max(8, Math.min(innerWidth - w - 8, q.right - w)) + 'px';
    m.style.top = Math.min(q.bottom + 6, innerHeight - 160) + 'px';
    m.style.maxHeight = Math.max(160, innerHeight - q.bottom - 20) + 'px';
    build(mkApi(m.querySelector('.cvs-bd'), closePop));
  }
  document.addEventListener('pointerdown', (e) => { const m = document.getElementById('c40-pop'); if (m && !m.contains(e.target) && !(e.target.closest && e.target.closest('.c40-tb'))) closePop(); }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.getElementById('c40-pop')) { e.stopPropagation(); closePop(); } }, true);
  document.addEventListener('pointerdown', (e) => { const f = document.getElementById('c40-fpop'); if (f && !f.contains(e.target) && !(e.target.closest && e.target.closest('.c40-fam'))) closeFamPop(); }, true);

  async function buildMenu(api, view, only) {
    const kind = kindOf(view);
    const bid = blockOf(view);
    if (!bid) { api.note('このビューの DB が見つかりませんでした'); return; }
    const wait = api.note('読み込み中…');
    const coll = await collOf(bid);
    wait.remove();
    if (!coll) { api.note('DB の情報を読めませんでした（共有されていない DB など）'); return; }
    const key = keyOf(view, bid);
    const vc = VIEWS[key] || {};
    const again = () => { api.clear(); buildMenu(api, view, only); };
    const nameOf = (pid) => (coll.schema[pid] ? coll.schema[pid].name : '?');
    const nums = numList(coll.schema);
    const files = Object.entries(coll.schema).filter(([, d]) => d.type === 'file');
    const srcSel = () => api.item('表紙の元', { mark: '◩', select: { options: [['auto', '自動'], ['cover', 'ページのカバー'], ...files.map(([pid, d]) => [pid, d.name]), ['icon', 'アイコンだけ']], value: vc.src || 'auto', onChange: (v) => { setView(key, { src: v === 'auto' ? '' : v }); } } });
    if (only !== 'num') {
      if (kind === 'table') {
        api.sec('テーブルギャラリー — 表のまま、表紙が並ぶ');
        api.item(vc.tg ? '使っている（押すとやめる）' : '使う', { mark: ICO.tg, on: !!vc.tg, click: () => { setView(key, { tg: !vc.tg }); again(); } });
        if (vc.tg) {
          api.item('大きさ', { mark: '⤢', select: { options: [['s', '小'], ['m', '中'], ['l', '大']], value: vc.size || 'm', onChange: (v) => setView(key, { size: v === 'm' ? '' : v }) } });
          api.item('形', { mark: '▭', select: { options: [['auto', '自動'], ['poster', '縦長（本・ポスター）'], ['wide', '横長（カバー）'], ['square', '正方形']], value: vc.shape || 'auto', onChange: (v) => setView(key, { shape: v === 'auto' ? '' : v }) } });
          srcSel();
          api.note('表紙に乗せると大きく見え、押すとページを開きます。');
        }
      } else if (kind === 'board') {
        api.sec('ギャラリーボード — ボードの列の中をギャラリーに');
        api.item(vc.gb ? '使っている（押すとやめる）' : '使う', { mark: ICO.gb, on: !!vc.gb, click: () => { setView(key, { gb: !vc.gb }); again(); } });
        if (vc.gb) {
          api.item('1 列に並べる枚数', { mark: '▦', select: { options: [['1', '1 枚（大きく）'], ['2', '2 枚'], ['3', '3 枚']], value: String(vc.cols || 2), onChange: (v) => setView(key, { cols: v === '2' ? '' : +v }) } });
          api.item('形', { mark: '▭', select: { options: [['auto', '自動'], ['poster', '縦長'], ['wide', '横長'], ['square', '正方形']], value: vc.shape || 'auto', onChange: (v) => setView(key, { shape: v === 'auto' ? '' : v }) } });
          srcSel();
          api.note('Notion のカードに表紙（Card preview）が出ている時は、そちらをそのまま使います。');
        }
      }
      if (only === 'view') return;
      api.div();
    }
    if (!only) {
      const fam = famOf(coll);
      api.sec('サブアイテム — 子の数と進み具合');
      if (!fam) api.note('この DB にはサブアイテムがありません（Notion の「⋯ › サブアイテム」を有効にすると、親の行に子の札が出ます）。');
      else {
        api.item(vc.fam === 0 ? '親の札を出す' : '親の札を出している（押すとやめる）', { mark: FAM_ICO, on: vc.fam !== 0, click: () => { setView(key, { fam: vc.fam === 0 ? '' : 0 }); again(); } });
        if (kind === 'table') {
          api.item('全部ひらく', { mark: '▾', click: () => { toggleAll(view, true); api.close(); } });
          api.item('全部とじる', { mark: '▸', click: () => { toggleAll(view, false); api.close(); } });
        }
        api.note('子: ' + nameOf(fam.kid) + (fam.par ? '・親: ' + nameOf(fam.par) : '') + '。札に乗せると子の一覧、押すと固定。済んだかは ステータス → チェックボックス → 「状態」のセレクト で数えます。');
      }
      api.div();
    }
    api.sec('数の見せ方');
    if (!nums.length) { api.note('この DB には数のプロパティ（数値・数式・ロールアップ）がありません。'); return; }
    for (const n of nums) {
      const u = (NUM[coll.cid] || {})[n.pid] || {};
      const a = autoCfg(n, nums);
      const native = n.def.show_as && n.def.show_as.type && n.def.show_as.type !== 'number';
      const autoL = '自動（' + (a ? STYLE_L[a.s] + (a.of ? '÷' + nameOf(a.of) : '') : native ? 'Notion のまま' : 'そのまま') + '）';
      api.item(n.name, { mark: n.def.type === 'number' ? '#' : n.def.type === 'formula' ? 'ƒ' : '↗', select: { options: [['auto', autoL], ['bar', 'バー'], ['ring', '輪'], ['stars', '星'], ['score', '点数'], ['heat', '色の濃さ'], ['plain', 'そのまま']], value: u.s || 'auto', onChange: (v) => { setNum(coll.cid, n.pid, { s: v }); again(); } } });
      const eff = cfgOf(coll.cid, n, nums);
      if (eff && (eff.s === 'bar' || eff.s === 'ring')) {
        api.item('　÷ 何に対して', { select: { options: [['', '自動' + (a && a.of ? '（' + nameOf(a.of) + '）' : '')], ['-', '割らない'], ...nums.filter((x) => x.pid !== n.pid).map((x) => [x.pid, x.name])], value: u.of || '', onChange: (v) => { setNum(coll.cid, n.pid, { of: v }); again(); } } });
      }
      if (eff && eff.s !== 'heat' && !eff.of) {
        api.item('　満点', { select: { options: [['', '自動'], ['1', '1'], ['5', '5'], ['10', '10'], ['100', '100']], value: String(u.max || ''), onChange: (v) => { setNum(coll.cid, n.pid, { max: v ? +v : '' }); again(); } } });
      }
    }
    api.note('自動は名前で見分けます —「進捗・達成・％」→ バー、「評価・スコア・点数」→ 星、「読んだページ」と「総ページ数」のような組 → 割合のバー。Notion の表示形式（バー・リング）を選んである数は Notion のまま。');
  }

  /* ============================================================
   *  Cordivestium × 「ビューの設定」
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
  const VS = cordiVS([
    {
      id: 'c40-tg', where: 'section', order: 40, icon: ICO.tg, label: 'テーブルギャラリー',
      show: (ctx) => !!(ctx.view && kindOf(ctx.view) === 'table'),
      value: (ctx) => { const vc = vcOf(ctx.view); return vc.tg ? 'オン' : 'オフ'; },
      onClick: (ctx) => VS.sub(ctx, 'テーブルギャラリー — ⁴⁰ Prisma', (api) => buildMenu(api, ctx.view, 'view'))
    },
    {
      id: 'c40-gb', where: 'section', order: 41, icon: ICO.gb, label: 'ギャラリーボード',
      show: (ctx) => !!(ctx.view && kindOf(ctx.view) === 'board'),
      value: (ctx) => { const vc = vcOf(ctx.view); return vc.gb ? 'オン' : 'オフ'; },
      onClick: (ctx) => VS.sub(ctx, 'ギャラリーボード — ⁴⁰ Prisma', (api) => buildMenu(api, ctx.view, 'view'))
    },
    {
      id: 'c40-num', where: 'section', order: 42, icon: ICO.num, label: '数の見せ方',
      show: (ctx) => !!(ctx.view && /^(table|board|gallery)$/.test(kindOf(ctx.view))),
      value: () => 'Prisma',
      onClick: (ctx) => VS.sub(ctx, '数の見せ方 — ⁴⁰ Prisma', (api) => buildMenu(api, ctx.view, 'num'))
    }
  ]);

  /* ============================================================
   *  見た目
   * ============================================================ */
  const CSS_TEXT = `
@property --c40-a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@property --c40-sp { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
:root { --c40-lo: var(--c-oraIcoAccPri, #d9730d); --c40-mid: var(--c-yelIcoAccPri, #cb912f); --c40-hi: var(--c-bluIcoAccPri, #2383e2); --c40-done: var(--c-greIcoAccPri, #2b9a66); --c40-star: #f2b01e; }
.c40-g { --c: var(--c40-hi); position: absolute; inset: 0 0 auto 0; height: 36px; z-index: 1; display: flex; align-items: center; gap: 6px; padding: 0 8px; box-sizing: border-box; pointer-events: none; container-type: inline-size;
  font: 500 12.5px/1 var(--cordi-ui, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Segoe UI", sans-serif); color: var(--c-texPri, #37352f); }
.notion-table-view-cell[data-c40-g] > div > [data-testid="property-value"] > * { opacity: 0 !important; }
.c40-g b { flex: none; font-weight: 650; font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
.c40-g small { flex: none; color: var(--c-texTer, rgba(55,53,47,.5)); font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums; }
.c40-g .c40-tr { position: relative; flex: 1 1 auto; min-width: 26px; height: 6px; border-radius: 99px; overflow: hidden; background: var(--ca-graBacSecTra, rgba(135,131,120,.18)); }
.c40-g .c40-tr i { position: absolute; inset: 0 auto 0 0; width: calc(var(--p) * 100%); border-radius: inherit; background: linear-gradient(90deg, color-mix(in srgb, var(--c) 62%, #fff), var(--c)); transition: width .6s cubic-bezier(.2,.9,.2,1), background .4s; animation: c40-grow .95s cubic-bezier(.2,.9,.2,1) backwards; animation-delay: calc(var(--i, 0) * 28ms); }
@keyframes c40-grow { from { width: 0; } }
.c40-g[data-done] .c40-tr i::after { content: ""; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.75) 50%, transparent 70%) no-repeat; background-size: 220% 100%; animation: c40-shine 1.4s ease 1s 1 both; }
@keyframes c40-shine { from { background-position: 130% 0; } to { background-position: -130% 0; } }
.c40-g[data-done] > b::after { content: "✓"; display: inline-block; margin-inline-start: 3px; color: var(--c40-done); animation: c40-pop .55s cubic-bezier(.3,1.7,.5,1) .95s backwards; }
@keyframes c40-pop { from { transform: scale(0) rotate(-45deg); opacity: 0; } }
.c40-g .c40-rg { --c40-a: calc(var(--p) * 360deg); flex: none; width: 18px; height: 18px; border-radius: 50%; background: conic-gradient(var(--c) var(--c40-a), var(--ca-graBacSecTra, rgba(135,131,120,.22)) 0);
  -webkit-mask: radial-gradient(circle, transparent 5.2px, #000 5.7px); mask: radial-gradient(circle, transparent 5.2px, #000 5.7px); transition: --c40-a .6s cubic-bezier(.2,.9,.2,1); animation: c40-ring 1s cubic-bezier(.2,.9,.2,1) backwards; animation-delay: calc(var(--i, 0) * 28ms); }
@keyframes c40-ring { from { --c40-a: 0deg; transform: rotate(-90deg); } }
.c40-g[data-done] .c40-rg { box-shadow: 0 0 0 2px color-mix(in srgb, var(--c40-done) 25%, transparent); }
.c40-g .c40-st { --c40-sp: calc(var(--p) * 100%); flex: none; font-size: 13.5px; letter-spacing: 1px; line-height: 1; color: transparent; -webkit-background-clip: text; background-clip: text;
  background-image: linear-gradient(90deg, var(--c40-star) var(--c40-sp), var(--ca-graBacSecTra, rgba(135,131,120,.28)) var(--c40-sp)); transition: --c40-sp .6s; animation: c40-stars 1s cubic-bezier(.2,.9,.2,1) backwards; animation-delay: calc(var(--i, 0) * 28ms); }
@keyframes c40-stars { from { --c40-sp: 0%; } }
.c40-g[data-done] .c40-st { filter: drop-shadow(0 0 3px rgba(242,176,30,.55)); animation: c40-stars 1s cubic-bezier(.2,.9,.2,1) backwards, c40-twinkle 1.8s ease-in-out 1s 2; }
@keyframes c40-twinkle { 50% { filter: drop-shadow(0 0 7px rgba(242,176,30,.9)) brightness(1.15); } }
.c40-g[data-s="stars"] > b { color: var(--c-texSec, rgba(55,53,47,.7)); font-weight: 600; }
.c40-g .c40-sc { display: inline-flex; align-items: baseline; gap: 1px; padding: 3px 8px 3px 9px; border-radius: 99px; font-size: 13px; font-weight: 760; color: hsl(var(--h, 60) 62% 33%); background: hsl(var(--h, 60) 72% 48% / .15);
  box-shadow: inset 0 0 0 1px hsl(var(--h, 60) 60% 45% / .26); animation: c40-pop .5s cubic-bezier(.3,1.7,.5,1) backwards; animation-delay: calc(var(--i, 0) * 28ms); }
.c40-g .c40-sc small { font-size: 10px; font-weight: 600; color: inherit; opacity: .6; }
body.dark .c40-g .c40-sc, .dark .c40-g .c40-sc { color: hsl(var(--h, 60) 70% 72%); background: hsl(var(--h, 60) 60% 50% / .2); }
.notion-table-view-cell[data-c40-heat] > div { background: color-mix(in srgb, var(--c40-hi) calc(var(--c40-p, 0) * 36%), transparent); transition: background .4s; }
@container (max-width: 132px) { .c40-g small { display: none; } }
@container (max-width: 74px) { .c40-g .c40-tr { display: none; } }
/* カードの数の段 */
.c40-strip { display: flex; flex-direction: column; gap: 3px; padding: 0 10px 9px; pointer-events: none; }
.c40-strip .c40-sl { position: relative; display: flex; align-items: center; gap: 6px; min-width: 0; height: 18px; }
.c40-strip .c40-sl > em { flex: none; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: normal 500 11px/18px var(--cordi-ui, ui-sans-serif, -apple-system, "Hiragino Sans", sans-serif); color: var(--c-texTer, rgba(55,53,47,.5)); }
.c40-strip .c40-g { position: relative; inset: auto; height: 18px; padding: 0; flex: 1 1 auto; min-width: 0; }
/* テーブルギャラリー */
.notion-table-view[data-c40-tg] .notion-table-view-cell[data-c40-th] > div > [data-testid="property-value"] { padding-inline-start: calc(var(--c40-tw) + 18px) !important; min-height: calc(var(--c40-th) + 16px) !important; display: flex !important; flex-direction: column; justify-content: center; }
.notion-table-view[data-c40-tg] .notion-table-view-cell[data-c40-th] [data-testid="property-value"] span[style*="font-weight: 500"] { font-size: 15px; font-weight: 650 !important; letter-spacing: .01em; }
.notion-table-view[data-c40-tg] .notion-collection-item:hover > .notion-table-view-row { background: color-mix(in srgb, var(--c40-hi) 4%, transparent); }
.c40-th { position: absolute; z-index: 2; inset-inline-start: 9px; top: 50%; width: var(--c40-tw); height: var(--c40-th); margin-top: calc(var(--c40-th) / -2); border-radius: 7px; overflow: hidden; cursor: pointer;
  background: var(--c-bacSec, #f7f6f3); box-shadow: 0 1px 2px rgba(15,15,15,.1), 0 0 0 1px rgba(15,15,15,.06); transition: transform .32s cubic-bezier(.2,.9,.3,1.25), box-shadow .3s; animation: c40-thin .5s cubic-bezier(.2,.9,.2,1) backwards; }
.c40-th img, .c40-cov img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .6s cubic-bezier(.2,.9,.2,1); }
.notion-collection-item:hover .c40-th { transform: scale(1.06) rotate(-1.4deg); box-shadow: 0 8px 20px rgba(15,15,15,.2), 0 0 0 1px rgba(15,15,15,.06); }
.c40-th:hover img { transform: scale(1.08); }
@keyframes c40-thin { from { opacity: 0; transform: translateY(6px) scale(.9); } }
.c40-ph { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font: 700 calc(var(--c40-th, 60px) * .4)/1 var(--cordi-ui, ui-sans-serif, -apple-system, "Hiragino Sans", sans-serif); color: #fff;
  background: linear-gradient(135deg, hsl(var(--hue) 68% 66%), hsl(calc(var(--hue) + 38) 62% 50%)); text-shadow: 0 1px 2px rgba(0,0,0,.15); }
.c40-ph img { width: 54%; height: 54%; object-fit: contain; filter: drop-shadow(0 1px 1px rgba(0,0,0,.15)); }
.c40-ph .c40-em { font-size: 1.15em; }
#c40-peek { position: fixed; z-index: 2147483000; width: 240px; border-radius: 14px; overflow: hidden; pointer-events: none; background: var(--c-bacPri, #fff); color: var(--c-texPri, #37352f);
  box-shadow: 0 18px 50px rgba(15,15,15,.28), 0 0 0 1px rgba(15,15,15,.08); animation: c40-peekin .24s cubic-bezier(.2,.9,.3,1.2); }
#c40-peek .pk-img { aspect-ratio: var(--ar, 1); max-height: 340px; background: var(--c-bacSec, #f1f1ef) center / cover no-repeat; }
#c40-peek .pk-t { padding: 9px 12px 11px; font: 600 13.5px/1.45 var(--cordi-ui, ui-sans-serif, -apple-system, "Hiragino Sans", sans-serif); }
@keyframes c40-peekin { from { opacity: 0; transform: translateX(-8px) scale(.94); } }
/* ギャラリーボード */
.notion-board-view[data-c40-gb] .notion-board-group { width: var(--c40-gw) !important; display: grid !important; grid-template-columns: repeat(var(--c40-gc, 2), minmax(0, 1fr)); column-gap: 10px; align-content: start; }
.notion-board-view[data-c40-gb] .notion-board-group > :not(.notion-collection-item) { grid-column: 1 / -1; }
.notion-board-view[data-c40-gb] [data-c40-gbh] { width: var(--c40-gw) !important; }
.notion-board-view[data-c40-gb] .notion-collection-item > div[role="presentation"] { margin-bottom: 10px !important; border-radius: 12px !important; transition: transform .3s cubic-bezier(.2,.9,.3,1.2), box-shadow .3s !important; }
.notion-board-view[data-c40-gb] .notion-collection-item:hover > div[role="presentation"] { transform: translateY(-3px) rotate(-.5deg); box-shadow: 0 12px 26px rgba(15,15,15,.16), 0 0 0 1px var(--ca-borSecTra, rgba(55,53,47,.1)) !important; }
.notion-board-view[data-c40-gb] .notion-collection-item:nth-child(even):hover > div[role="presentation"] { transform: translateY(-3px) rotate(.5deg); }
.c40-cov { display: block; position: relative; width: 100%; aspect-ratio: var(--c40-ar, 1.6); overflow: hidden; background: var(--c-bacSec, #f7f6f3); --c40-th: 90px; }
.c40-cov::after { content: ""; position: absolute; inset: auto 0 0 0; height: 1px; background: var(--ca-borSecTra, rgba(55,53,47,.09)); }
.notion-collection-item:hover .c40-cov img { transform: scale(1.05); }
.notion-board-view[data-c40-gb="1"] .c40-cov { --c40-th: 140px; }
/* サブアイテム: 親の札・子の一覧 */
.notion-table-view-cell[data-c40-fam] > div > [data-testid="property-value"] { padding-bottom: 32px !important; }
.c40-fam { position: absolute; z-index: 2; bottom: 8px; inset-inline-start: 8px; display: inline-flex; align-items: center; gap: 5px; height: 20px; padding: 0 7px 0 5px; border-radius: 99px; cursor: pointer; user-select: none;
  font: 600 11.5px/20px var(--cordi-ui, ui-sans-serif, -apple-system, "Hiragino Sans", sans-serif); color: var(--c-texSec, rgba(55,53,47,.7)); background: var(--c-bacSec, rgba(242,241,238,.9));
  box-shadow: inset 0 0 0 1px var(--ca-borSecTra, rgba(55,53,47,.1)); transition: transform .25s cubic-bezier(.3,1.6,.5,1), background .2s, color .2s; animation: c40-pop .45s cubic-bezier(.3,1.7,.5,1) backwards; }
.c40-fam:hover { transform: translateY(-1px) scale(1.05); color: var(--c40-hi); background: color-mix(in srgb, var(--c40-hi) 10%, var(--c-bacPri, #fff)); }
.c40-fam .fi { display: inline-flex; color: var(--c-icoSec, rgba(55,53,47,.45)); }
.c40-fam .fb { position: relative; width: 34px; height: 5px; border-radius: 99px; overflow: hidden; background: var(--ca-graBacSecTra, rgba(135,131,120,.2)); }
.c40-fam .fb i { position: absolute; inset: 0 auto 0 0; border-radius: inherit; background: var(--c40-hi); transition: width .5s cubic-bezier(.2,.9,.2,1); animation: c40-grow .9s cubic-bezier(.2,.9,.2,1) .15s backwards; }
.c40-fam small { font-size: 10.5px; font-weight: 600; color: var(--c-texTer, rgba(55,53,47,.5)); font-variant-numeric: tabular-nums; }
.c40-fam[data-done] .fb i { background: var(--c40-done); }
.c40-fam[data-done] small::after { content: " ✓"; color: var(--c40-done); }
.c40-kin { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; padding: 0 10px 9px; }
.c40-kin .c40-fam { position: relative; inset: auto; bottom: auto; }
.c40-kin .c40-kp { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 500 11px/18px var(--cordi-ui, ui-sans-serif, -apple-system, "Hiragino Sans", sans-serif); color: var(--c-texTer, rgba(55,53,47,.5)); }
#c40-fpop { position: fixed; z-index: 2147483000; width: 300px; max-height: min(420px, 70vh); display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; background: var(--c-popBac, var(--c-bacPri, #fff)); color: var(--c-texPri, #37352f);
  box-shadow: 0 14px 40px rgba(15,15,15,.22), 0 0 0 1px rgba(15,15,15,.07); font: 13.5px/1.4 var(--cordi-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif); animation: c40-fpin .2s cubic-bezier(.2,.9,.3,1.2); transform-origin: top left; }
#c40-fpop[data-pin] { box-shadow: 0 14px 40px rgba(15,15,15,.22), 0 0 0 1.5px color-mix(in srgb, var(--c40-hi) 45%, transparent); }
@keyframes c40-fpin { from { opacity: 0; transform: translateY(-4px) scale(.96); } }
#c40-fpop .fh { position: relative; display: flex; align-items: center; gap: 6px; padding: 10px 12px 9px; font-weight: 650; border-bottom: 1px solid var(--ca-borSecTra, rgba(55,53,47,.08)); }
#c40-fpop .fh::after { content: ""; position: absolute; inset: auto 0 -1px 0; height: 2px; width: calc(var(--p, 0) * 100%); background: var(--c40-done); transition: width .6s cubic-bezier(.2,.9,.2,1); }
#c40-fpop .fh .fi { display: inline-flex; color: var(--c40-hi); }
#c40-fpop .ft { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c40-fpop .fs { flex: none; font-size: 11.5px; font-weight: 600; color: var(--c-texTer, rgba(55,53,47,.5)); }
#c40-fpop .fl { overflow: auto; padding: 4px; }
#c40-fpop .fe { padding: 10px; color: var(--c-texTer, rgba(55,53,47,.5)); font-size: 12px; }
#c40-fpop .fk { display: flex; align-items: center; gap: 8px; min-height: 30px; padding: 3px 8px; border-radius: 7px; cursor: pointer; animation: c40-fkin .32s cubic-bezier(.2,.9,.3,1.2) backwards; animation-delay: calc(var(--i, 0) * 22ms); }
@keyframes c40-fkin { from { opacity: 0; transform: translateX(-6px); } }
#c40-fpop .fk:hover { background: var(--ca-butHovBac, rgba(55,53,47,.06)); }
#c40-fpop .fki { flex: none; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; }
#c40-fpop .fki img { width: 18px; height: 18px; object-fit: cover; border-radius: 3px; }
#c40-fpop .fdot { width: 6px; height: 6px; border-radius: 50%; background: var(--c-icoSec, rgba(55,53,47,.35)); }
#c40-fpop .fkt { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c40-fpop .fk[data-done] .fkt { color: var(--c-texTer, rgba(55,53,47,.5)); text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--c40-done) 60%, transparent); }
#c40-fpop .fks { flex: none; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 6px; border-radius: 4px; font-size: 11.5px; background: var(--c-bacSec, rgba(242,241,238,.9)); color: var(--c-texSec, rgba(55,53,47,.7)); }
#c40-fpop .fkd { flex: none; width: 16px; height: 16px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; box-shadow: inset 0 0 0 1.5px var(--c-icoSec, rgba(55,53,47,.3)); }
#c40-fpop .fkd[data-d="1"] { background: var(--c40-done); box-shadow: none; animation: c40-pop .4s cubic-bezier(.3,1.7,.5,1) backwards; animation-delay: calc(var(--i, 0) * 22ms + .15s); }
/* 道具の段の ◇ */
.c40-tb { display: inline-flex; align-items: center; gap: 5px; height: 28px; margin-inline-end: 2px; padding: 0 6px; border-radius: 6px; flex: none; cursor: pointer; user-select: none;
  font: 500 13px/28px var(--cordi-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif); color: var(--c-icoSec, rgba(55,53,47,.55)); transition: background .15s ease, color .15s ease; }
.c40-tb:hover { background: var(--c-bacHov, rgba(55,53,47,.08)); color: var(--c-texPri, #37352f); }
.c40-tb[data-on] { color: var(--c-bluTex, #2383e2); }
.c40-tb .c40-bi { width: 18px; height: 18px; display: inline-flex; } .c40-tb .c40-bi svg { width: 18px; height: 18px; overflow: visible; }
.c40-tb .c40-bi .r1, .c40-tb .c40-bi .r2, .c40-tb .c40-bi .r3 { transition: stroke .3s, transform .35s cubic-bezier(.3,1.6,.5,1); transform-origin: 12.6px 10.3px; }
.c40-tb:hover .c40-bi .r1, .c40-tb[data-on] .c40-bi .r1 { stroke: #e5484d; transform: rotate(-6deg); }
.c40-tb:hover .c40-bi .r2, .c40-tb[data-on] .c40-bi .r2 { stroke: #f2b01e; }
.c40-tb:hover .c40-bi .r3, .c40-tb[data-on] .c40-bi .r3 { stroke: #2383e2; transform: rotate(6deg); }
.c40-tb .c40-bl:empty { display: none; }
.c40-tb .c40-bl { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#c40-pop { position: fixed; z-index: 2147483000; display: flex; flex-direction: column; overflow: hidden; background: var(--c-popBac, var(--c-bacPri, #fff)); color: var(--c-texPri, #37352f); border-radius: 10px;
  box-shadow: var(--c-shaOutMd, 0 0 0 1px rgba(15,15,15,.05), 0 3px 6px rgba(15,15,15,.1), 0 9px 24px rgba(15,15,15,.2)); font: 14px/1.4 var(--cordi-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif); animation: c40-popin .16s ease-out; }
@keyframes c40-popin { from { opacity: 0; transform: translateY(-4px) scale(.98); } }
#c40-pop .cvs-hd { display: flex; align-items: center; height: 36px; padding: 10px 14px 4px; flex: none; }
#c40-pop .cvs-ttl { color: var(--c-texSec, rgba(55,53,47,.65)); font-size: 12px; font-weight: 500; }
#c40-pop .cvs-bd { overflow: auto; padding: 2px 0 8px; }
#c40-pop .cvs-sec { padding: 10px 14px 4px; color: var(--c-texSec, rgba(55,53,47,.65)); font-size: 12px; font-weight: 500; }
#c40-pop .cvs-it { display: flex; align-items: center; gap: 8px; min-height: 30px; margin: 0 4px; padding: 0 8px; border-radius: 6px; cursor: pointer; user-select: none; }
#c40-pop .cvs-it:hover { background: var(--ca-butHovBac, rgba(55,53,47,.06)); }
#c40-pop .cvs-mk { width: 20px; display: flex; align-items: center; justify-content: center; color: var(--c-icoSec, rgba(55,53,47,.45)); flex: none; font-size: 13px; }
#c40-pop .cvs-mk svg { width: 18px; height: 18px; }
#c40-pop .cvs-lb { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#c40-pop .cvs-ck { flex: none; }
#c40-pop select { font: inherit; font-size: 13px; color: var(--c-texSec, rgba(55,53,47,.65)); background: transparent; border: 0; max-width: 150px; cursor: pointer; }
#c40-pop .cvs-note { padding: 4px 14px 2px; color: var(--c-texTer, rgba(55,53,47,.45)); font-size: 12px; line-height: 1.5; }
#c40-pop .cvs-div { height: 1px; margin: 6px 0; background: var(--ca-borPriTra, rgba(55,53,47,.09)); }
#cordi-vs-sub .cvs-mk svg { width: 18px; height: 18px; }
html[data-c40-calm] .c40-g *, html[data-c40-calm] .c40-th, html[data-c40-calm] .c40-cov img { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .c40-g *, .c40-th, .c40-fam, .c40-fam *, #c40-peek, #c40-pop, #c40-fpop, #c40-fpop * { animation: none !important; transition: none !important; } }
`;
  function css() {
    let st = document.getElementById('c40-css');
    if (!st) { st = document.createElement('style'); st.id = 'c40-css'; st.textContent = CSS_TEXT; (document.head || document.documentElement).appendChild(st); }
    document.documentElement.toggleAttribute('data-c40-calm', !P.anim);
  }

  /* ============================================================
   *  走らせる
   * ============================================================ */
  let running = false, again = false, passN = 0;
  async function doView(view, pass) {
    const kind = kindOf(view);
    const bid = blockOf(view);
    if (!bid) return;
    const coll = await collOf(bid);
    if (!coll || !view.isConnected) return;
    const vc = VIEWS[keyOf(view, bid)] || {};
    tbBtn(view, kind, vc);
    if (kind === 'table') await doTable(view, coll, vc, pass);
    else await doCards(view, coll, vc, kind, pass);
  }
  function clearAll() {
    for (const v of document.querySelectorAll(VIEW_SEL)) {
      clearTG(v); clearGB(v); cleanCards(v, -1); clearFam(v);
      for (const k of v.querySelectorAll('.c40-kin')) k.remove();
      for (const c of v.querySelectorAll('[data-c40-g], [data-c40-heat]')) unpaint(c);
      if (v.__c40tb) { v.__c40tb.remove(); v.__c40tb = null; }
    }
  }
  async function run() {
    if (running) { again = true; return; }
    running = true; ST.runs++;
    try {
      css();
      if (!P.on) { clearAll(); return; }
      const views = [...document.querySelectorAll(VIEW_SEL)];
      await Promise.all(views.map((v) => doView(v, ++passN).catch((e) => { ST.lastError = String(e && e.stack || e).slice(0, 400); })));
    } finally {
      running = false;
      if (again) { again = false; soon(40); }
    }
  }
  let qt = 0;
  function soon(ms) { if (qt) return; qt = setTimeout(() => { qt = 0; run(); }, ms == null ? 40 : ms); }
  const ours = (n) => n.nodeType === 1 && (/(^|\s)c40-/.test(n.className && n.className.baseVal == null ? n.className : '') || /^c40-/.test(n.id) || n.hasAttribute('data-cordi-vs-row') || n.hasAttribute('data-cordi-vs-sec') || n.id === 'cordi-vs-sub');
  const MINE = '.c40-g, .c40-strip, .c40-th, .c40-cov, .c40-tb, .c40-fam, .c40-kin, #c40-pop, #c40-peek, #c40-fpop, #cordi-vs-sub';
  const RELEVANT = '.notion-table-view-cell, .notion-collection-item, .notion-table-view, .notion-board-view, .notion-gallery-view, .notion-collection-view-body, .notion-table-view-header-cell, .notion-board-group';
  function boot() {
    css();
    new MutationObserver((ms) => {
      for (const m of ms) {
        const tg = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (tg && tg.closest(MINE)) continue;
        if (m.type === 'characterData') {
          const p = m.target.parentElement;
          if (p && p.closest('.notion-table-view-cell, .notion-collection-item') && !p.closest('.c40-g, .c40-strip')) { soon(); return; }
          continue;
        }
        let hit = false;
        for (const n of m.addedNodes) { if (n.nodeType === 1 && !ours(n) && (n.matches(RELEVANT) || n.querySelector(RELEVANT) || n.closest(RELEVANT) || (P.tb && (n.matches(TOOL_SEL) || n.querySelector(TOOL_SEL))))) { hit = true; break; } }
        if (!hit && m.removedNodes.length && m.target.closest && m.target.closest('.notion-table-view-cell, .notion-collection-item') && ![...m.removedNodes].every(ours)) hit = true;
        if (hit) { soon(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    let href = location.href;
    setInterval(() => { if (location.href !== href) { href = location.href; unpeek(); closePop(); closeFamPop(); soon(0); } }, 500);
    setInterval(() => { if (document.visibilityState === 'visible' && document.querySelector(VIEW_SEL)) run(); }, Math.max(8000, P.refresh));
    soon(0);
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot, { once: true });

  window.__c40 = {
    version: VERSION,
    status: () => Object.assign({ prefs: Object.assign({}, P), num: JSON.parse(JSON.stringify(NUM)), views: Object.assign({}, VIEWS), dbs: [...document.querySelectorAll(VIEW_SEL)].map((v) => ({ kind: kindOf(v), block: blockOf(v), key: blockOf(v) && keyOf(v, blockOf(v)) })) }, ST),
    set(o) { Object.assign(P, o || {}); save(LS_P, P); clearAll(); soon(0); return Object.assign({}, P); },
    view(v, o) { v = typeof v === 'string' ? document.querySelector(v) : v || document.querySelector(VIEW_SEL); if (!v) return null; const k = keyOf(v, blockOf(v)); setView(k, o || {}); return VIEWS[k] || {}; },
    async num(cid, pid, o) { if (!cid) { const v = document.querySelector(VIEW_SEL); const c = v && await collOf(blockOf(v)); cid = c && c.cid; } if (cid) setNum(cid, pid, o || {}); return NUM[cid] || {}; },
    async schema(v) { v = v || document.querySelector(VIEW_SEL); const c = v && await collOf(blockOf(v)); return c ? { cid: c.cid, nums: numList(c.schema).map((n) => ({ pid: n.pid, name: n.name, type: n.def.type, auto: autoCfg(n, numList(c.schema)) })) } : null; },
    run
  };
})();
