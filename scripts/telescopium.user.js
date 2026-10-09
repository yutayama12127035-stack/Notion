// ==UserScript==
// @name         « No »　⁴¹ _ Telescopium
// @namespace    https://cordivestium.local/telescopium
// @version      1.0.0
// @description  v1.0.0: Nebius の本体 DB を「望遠鏡でのぞいた星空」に。視野 — 狭くなると Stella が細い列に縮み、長文の列が伸び縮みし、優先度の低い列から畳まれ（中身は題名の下に）、それでも足りなければ題名の列を残して横に流れる。ビューのタブは「他 N 件」に隠さず横に流れる帯に。焦点 — ◎（⌥L）で B.U.R.I レンズ。ふつうの言葉で話しかけると、合う行にピントが合い、合わない行は沈む（確実な条件は手元で、意味の条件は MoA で判定し ✦ と理由）。倍率 — つまむ（ピンチ）と星図 Planisphere へ。行の Notion アイコンがそのまま星になって飛び、リレーションで星座に。色 — 表紙の主な色を、サイドピークのにじみ・星の光暈・レンズの縦線にだけ使う。見た目だけで、Notion のデータもビューの設定も書き換えない。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://*.notion.site/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*
 * ⁴¹ Telescopium（テレスコピウム）— 本体 DB をのぞく望遠鏡
 *
 * v1.0.0（2026-10-09）
 *   望遠鏡の 4 つの調整を、本体 DB（全画面のデータベース）の 4 つの体験に割り当てる。
 *   ■ 視野（Field）… 見切れをなくす
 *     本文の横幅を見張り、表に要る横幅（題名 160 / 長文 200 / ほか 96 px を下限に）と比べて、1 段ずつ譲る。
 *       1 段: Stella が細い列（52px）に縮む（³³ Nebius がある時。ピン留め中は 2 段から）
 *       2 段: 長文の列が残りの幅に合わせて伸び縮みし、ほかの列も下限まで縮む。長文は 3 行まで、3 行目の終わりはフェード
 *       3 段: 優先度の低い列から畳む（右へ細くなって消える）。畳んだ列の上位 2 列は、題名の下に 11px のグレーで
 *       4 段: それでも溢れたら、題名の列を左に留めて横スクロール（続きのある側だけ淡いフェード）
 *       5 段: 題名＋1 列しか残らない時だけ、見出しの右に「星図で見る」（自動では切り替えない）
 *     広くなったら、24px 以上の余裕ができてから 1 段ずつ戻す。行に 0.4 秒乗せると、長文の全文と畳んだ列の値のカード。
 *     見出しの「＋N 列」から畳んだ列を一時的に呼び戻せる。見出しのつまみ（⠿）で列の優先度をドラッグで並べ替え（Nebius 側に保存）。
 *     ビューのタブは「他 N 件」に隠さず、左右にフェードの付いた横に流れる帯に（選んだタブは自動で見える所へ）。
 *   ■ 焦点（Focus）… B.U.R.I レンズ
 *     タブの行の右（検索の左）の ◎、または ⌥L（Alt+L）。「Wパパ、どの星を探す？」に話しかけて ⌘↵（Ctrl+↵）。
 *     B.U.R.I（³³ の AI）が文を「確実な条件」（Creators = 東野圭吾 など）と「意味の条件」（雰囲気が近い など）に分け、
 *     確実な条件はこの DB の行を読んで手元で、意味の条件は表題・長文・本文の冒頭を MoA で判定（理由は ✦ に）。
 *     合う行は左に 2px の線、合わない行は 28% に沈む。右端の目盛りで画面外の行へ、⌥↓ / ⌥↑ で次・前へ。
 *     条件はチップに（× で外す・押して直す）。「12 / 48」。☆ でプリセット（◎ の長押しで一覧）。畳んだ列が条件にあれば呼び戻す。
 *     AI がつながっていない時は、言葉を各列の値に照らす「ことばのレンズ」で絞る。
 *   ■ 倍率（Magnitude）… 星図 Planisphere
 *     表の上でつまむ（ピンチ ＝ Ctrl＋ホイール）か、レンズの「✦ 星図」。行の Notion アイコンが表の位置から星図へ飛ぶ（FLIP）。
 *     リレーションの相手は大きな星（28px）に、線は 1px のアクセント色。配置は力学で決めて DB ごとに覚える。
 *     ドラッグで動かし、ホイール・ピンチで倍率。星に乗せると隣の星だけが明るく、押すとサイドピーク（⌘ で新しいタブ）。
 *     Tab で星を順に、矢印でつながる隣へ、Enter で開く、Esc・ピンチアウト・「☰ 表」で表へ（その星の行を 0.6 秒光らせる）。
 *     200 個までは DOM と SVG、それより多い時は Canvas、1000 個を超えたら最も多くつながるリレーションでまとめる。
 *   ■ 色（Tint）… 表紙の主な色
 *     カバーか表紙のファイル（Covers など）を 32px に縮めて主な色を 1 つ。サイドピークの上端のにじみ（10%・160px）、
 *     星図の光暈、レンズの縦線にだけ使う（文字・アイコン・ページ全体は染めない）。
 *   ■ 守ること: Notion のデータ・プロパティ・ビューの設定は書き換えない。Notion のアイコンは置き換えも着色もしない。
 *     要素が見つからない時は、その機能だけ静かに休む（コンソールに 1 回だけ記録）。青はアクセント色に使わない。
 *   ・設定: Nebius の設定（³³ の ('-' 鰤)з パネルの ⚙）の「Telescopium」の段、または ◎ の長押し →「設定」
 *   ・コンソール: __c41.status() ／ __c41.set({ field, stella, lens, map, tint }) ／ __c41.lens('東野圭吾の作品') ／ __c41.map(true) ／ __c41.long(pid, true|false|null)
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '1.0.0';
  const TAG = '[⁴¹ Telescopium v' + VERSION + ']';
  if (window.__c41 && window.__c41.version) { console.warn(TAG, '旧版が動いています'); return; }

  /* ============================================================
   *  0. Notion の要素の探し方 — ここ 1 か所だけ（Notion の作りが変わったら、ここを直す）
   * ============================================================ */
  const SEL = {
    frame: '.notion-frame',
    dbPage: '.notion-collection_view_page-block',
    inlineDb: '.notion-collection_view-block',
    peek: '.notion-peek-renderer',
    table: '.notion-table-view',
    hscroll: '.notion-scroller.horizontal',
    headRow: '.notion-table-view-header-row',
    headCell: '.notion-table-view-header-cell',
    item: '.notion-collection-item[data-block-id]',
    cell: '.notion-table-view-cell',
    value: '[data-testid="property-value"]',
    icon: '.notion-record-icon',
    tablist: '[role="tablist"]',
    tabBtn: '.notion-collection-view-tab-button[data-collection-view-id]',
    tabOn: '[role="tab"][aria-selected="true"]',
    search: '[role="button"][aria-label="Search"], [role="button"][aria-label="検索"]',
    tool: ['Filter', 'フィルター', 'Sort', '並べ替え', 'Search', '検索'].map((l) => '[role="button"][aria-label="' + l + '"]').join(', '),
    sidebar: '.notion-sidebar-container',
    sideInner: '.notion-sidebar'
  };
  const MISS = new Set();
  function need(name, el) {
    if (!el && !MISS.has(name)) { MISS.add(name); try { console.info(TAG, 'Notion の要素が見つからないので、この機能だけ休みます:', name, '→', SEL[name]); } catch (e) { /* noop */ } }
    return el || null;
  }
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];

  /* ============================================================
   *  1. 道具
   * ============================================================ */
  let de = document.documentElement;   // 早く読み込まれた時は null のことがあるので、boot で取り直す
  const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const fold = (s) => norm(s).normalize('NFKC').toLowerCase().replace(/[\s・·\-‐－_]/g, '');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cssStr = (s) => String(s).replace(/["\\]/g, '\\$&');
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const dash = (id) => {
    const h = String(id || '').replace(/-/g, '');
    return h.length === 32 ? h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20) : String(id || '');
  };
  const id32 = (id) => String(id || '').replace(/-/g, '');
  const plain = (v) => (Array.isArray(v) ? v.map((s) => (Array.isArray(s) && typeof s[0] === 'string' ? (s[0] === '‣' ? '' : s[0]) : '')).join('') : '');
  const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  const MOD = IS_MAC ? '⌘' : 'Ctrl+';
  const ALT = IS_MAC ? '⌥' : 'Alt+';
  const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const calm = () => !!RM.matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const isDark = () => !!(document.body && document.body.classList.contains('dark')) || de.hasAttribute('data-atx-dark') || de.hasAttribute('data-c39-dark');
  function mk(tag, cls, text, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  const ST = { runs: 0, api: 0, level: 0, folded: 0, lens: 0, map: 0, tints: 0, lastError: '' };
  function oops(where, e) { ST.lastError = where + ': ' + String(e && e.stack || e).slice(0, 300); }
  function safe(where, fn) { return function (...a) { try { return fn.apply(this, a); } catch (e) { oops(where, e); return undefined; } }; }

  /* 保存（すべて Nebius の側 — この端末の localStorage。Notion には書かない） */
  const LS = { prefs: 'c41.prefs.v1', pri: 'c41.pri.v1', long: 'c41.long.v1', presets: 'c41.presets.v1', sky: 'c41.sky.v1', tint: 'c41.tint.v1', lines: 'c41.lines.v1', last: 'c41.last.v1' };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, o) => { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) { /* noop */ } };
  const P = Object.assign({ field: true, stella: true, lens: true, map: true, tint: true, key: { code: 'KeyL', alt: true, ctrl: false, meta: false, shift: false } }, load(LS.prefs, {}));
  const PRI = load(LS.pri, {});        // cid → [pid…]（高い順）
  const LONG = load(LS.long, {});      // cid → { pid: true | false }
  const PRESETS = load(LS.presets, {}); // cid → [{ name, text, plan }]
  const SKY = load(LS.sky, {});        // cid → { at, pos: { id: [x, y] } }
  const TINTC = load(LS.tint, {});     // 'pid|url' → '#rrggbb' | 0
  const LINES = load(LS.lines, {});    // cid → { pid: false }（線にしないリレーション）
  const LAST = load(LS.last, {});      // cid → 直前のレンズの文
  const savePrefs = () => save(LS.prefs, P);

  /* ============================================================
   *  2. Notion API（読むだけ）
   * ============================================================ */
  const val = (n) => n && (n.value && n.value.value ? n.value.value : n.value);
  let API_EP = null;
  async function apiPostRV(requests) {
    const send = (ep, reqs) => fetch(location.origin + '/api/v3/' + ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ requests: reqs }) });
    const asPointer = requests.map((r) => ({ pointer: { table: r.table, id: r.id }, version: -1 }));
    const order = API_EP === 'main' ? ['main', 'legacy'] : API_EP === 'legacy' ? ['legacy', 'main'] : ['main', 'legacy'];
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
  const REC = new Map();       // 'table:id' → { v, at }
  const PENDING = new Map();
  async function records(table, ids, maxAge) {
    ids = [...new Set(ids.filter(Boolean))];
    const now = Date.now();
    const want = ids.filter((id) => { const c = REC.get(table + ':' + id); return !c || (maxAge != null && now - c.at > maxAge); });
    const jobs = [];
    for (let i = 0; i < want.length; i += 80) {
      const slice = want.slice(i, i + 80).filter((id) => !PENDING.has(table + ':' + id));
      if (!slice.length) continue;
      ST.api++;
      const pr = apiPostRV(slice.map((id) => ({ table, id, version: -1 }))).then((j) => {
        const at = Date.now();
        for (const id of slice) {
          PENDING.delete(table + ':' + id);
          const v = val(j && j.recordMap && j.recordMap[table] && j.recordMap[table][id]);
          if (v) REC.set(table + ':' + id, { v, at });
        }
      }).catch(() => { for (const id of slice) PENDING.delete(table + ':' + id); });
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
  async function post(ep, body, signal) {
    ST.api++;
    const r = await fetch(location.origin + '/api/v3/' + ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(body), signal });
    if (!r.ok) throw new Error(ep + ' ' + r.status);
    return r.json();
  }

  /* DB（collection）と、その項目の定義 */
  const DBS = new Map();   // bid → Promise<db>
  function dbOf(bid) {
    if (DBS.has(bid)) return DBS.get(bid);
    const pr = (async () => {
      const b = (await records('block', [bid])).get(bid);
      if (!b) return null;
      const cid = b.collection_id || (b.format && b.format.collection_pointer && b.format.collection_pointer.id);
      if (!cid) return null;
      const c = (await records('collection', [cid])).get(cid);
      if (!c || !c.schema) return null;
      const rels = Object.values(c.schema).map((d) => d.type === 'relation' && d.collection_id).filter(Boolean);
      const rc = rels.length ? await records('collection', rels).catch(() => new Map()) : new Map();
      const relName = {};
      for (const [id, v] of rc) relName[id] = plain(v.name) || '';
      return { bid, cid, sp: b.space_id || c.space_id, schema: c.schema, name: plain(c.name) || '', viewIds: b.view_ids || [], relName };
    })().catch((e) => { oops('db', e); return null; });
    DBS.set(bid, pr);
    pr.then((x) => { if (!x) setTimeout(() => DBS.delete(bid), 15000); });
    return pr;
  }
  async function viewOf(vid) { return vid ? (await records('collection_view', [vid], 60000)).get(vid) || null : null; }

  /* 行をすべて（ビューのフィルター・並べ替えのまま）。同じ問いは 30 秒覚える。取り消せる */
  const TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo'; } catch (e) { return 'Asia/Tokyo'; } })();
  const QC = new Map();
  function queryAll(db, view, signal) {
    const k = db.cid + '|' + (view ? view.id : '');
    const c = QC.get(k);
    if (c && Date.now() - c.at < 30000) return c.p;
    const p = (async () => {
      const loader = { type: 'reducer', reducers: { results: { type: 'results', limit: 5000 } }, searchQuery: '', userTimeZone: TZ };
      /* ビューの絞り込みは 2 か所（query2.filter と、ビューの上に並ぶ property_filters）。両方を「かつ」で */
      const q2 = view && view.query2;
      const pf = ((view && view.format && view.format.property_filters) || []).map((x) => x && x.filter).filter(Boolean);
      const fl = (q2 && q2.filter && (q2.filter.filters || []).length ? [q2.filter] : []).concat(pf);
      if (fl.length) loader.filter = fl.length === 1 ? (fl[0].filters ? fl[0] : { operator: 'and', filters: fl }) : { operator: 'and', filters: fl };
      if (q2 && q2.sort) loader.sort = q2.sort;
      const cv = { id: view ? view.id : db.viewIds[0], spaceId: db.sp };
      let j;
      try { j = await post('queryCollection?src=c41', { source: { type: 'collection', id: db.cid, spaceId: db.sp }, collectionView: cv, loader }, signal); }
      catch (e) { if (signal && signal.aborted) throw e; j = await post('queryCollection', { collection: { id: db.cid, spaceId: db.sp }, collectionView: cv, loader }, signal); }
      const r = j && j.result;
      let ids = (r && r.reducerResults && r.reducerResults.results && r.reducerResults.results.blockIds) || (r && r.blockIds) || [];
      /* 並べ替えが無いビューは、手で並べた順（page_sort）が表の順 */
      if (!(q2 && q2.sort && q2.sort.length) && view && Array.isArray(view.page_sort) && view.page_sort.length) {
        const at = new Map(view.page_sort.map((id, i) => [id, i]));
        ids = ids.slice().sort((a, b) => (at.has(a) ? at.get(a) : 1e9) - (at.has(b) ? at.get(b) : 1e9));
      }
      const at = Date.now();
      for (const [id, n] of Object.entries((j && j.recordMap && j.recordMap.block) || {})) { const v = val(n); if (v) REC.set('block:' + id, { v, at }); }
      const miss = ids.filter((id) => !REC.has('block:' + id));
      if (miss.length) await records('block', miss);
      return ids;
    })();
    QC.set(k, { at: Date.now(), p });
    p.catch(() => QC.delete(k));
    return p;
  }

  /* 値を読む（行の記録から。数式・ロールアップは記録に無いので読めない） */
  function relIds(v) {
    const out = [];
    if (!Array.isArray(v)) return out;
    for (const s of v) {
      if (!Array.isArray(s) || !Array.isArray(s[1])) continue;
      for (const f of s[1]) if (Array.isArray(f) && f[0] === 'p' && f[1]) out.push(f[1]);
    }
    return out;
  }
  function dateOf(v) {
    if (!Array.isArray(v)) return null;
    for (const s of v) {
      if (!Array.isArray(s) || !Array.isArray(s[1])) continue;
      for (const f of s[1]) if (Array.isArray(f) && f[0] === 'd' && f[1] && f[1].start_date) return f[1].start_date;
    }
    return null;
  }
  const titleOf = (r) => (r ? plain((r.properties || {}).title) : '') || '';
  /* 1 行の値の形: { t: 文字, list: [値…], n: 数, d: 'YYYY-MM-DD', b: 真偽, ids: [リレーション先] } */
  function cellVal(r, pid, d) {
    const props = (r && r.properties) || {};
    const v = props[pid];
    const t = d.type;
    if (t === 'created_time') return { t: '', d: r.created_time ? new Date(r.created_time).toISOString().slice(0, 10) : null };
    if (t === 'last_edited_time') return { t: '', d: r.last_edited_time ? new Date(r.last_edited_time).toISOString().slice(0, 10) : null };
    if (t === 'relation') {
      const ids = relIds(v);
      const names = ids.map((id) => titleOf(rec('block', id)) || '').filter(Boolean);
      return { t: names.join(', '), list: names, ids };
    }
    if (t === 'date') { const dd = dateOf(v); return { t: dd || '', d: dd }; }
    if (t === 'checkbox') { const b = plain(v) === 'Yes'; return { t: b ? '✓' : '', b }; }
    if (t === 'number') { const s = plain(v); const n = parseFloat(String(s).replace(/,/g, '')); return { t: s, n: isFinite(n) ? n : null }; }
    if (t === 'multi_select') { const s = plain(v); const list = s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []; return { t: list.join(', '), list }; }
    if (t === 'file') { const s = plain(v); return { t: s, list: s ? s.split(',').map((x) => x.trim()) : [] }; }
    if (t === 'person' || t === 'created_by' || t === 'last_edited_by' || t === 'formula' || t === 'rollup') return { t: plain(v) || '', na: t === 'formula' || t === 'rollup' };
    const s = plain(v);
    return { t: s, list: s ? [s] : [] };
  }
  const TYPE_JA = { title: 'タイトル', text: 'テキスト', number: '数値', select: 'セレクト', multi_select: 'マルチセレクト', status: 'ステータス', date: '日付', person: 'ユーザー', file: 'ファイル', checkbox: 'チェックボックス', url: 'URL', email: 'メール', phone_number: '電話', formula: '数式', relation: 'リレーション', rollup: 'ロールアップ', created_time: '作成日時', created_by: '作成者', last_edited_time: '最終更新日時', last_edited_by: '最終更新者' };

  /* 本文の冒頭（意味の条件で読む） */
  async function heads(ids) {
    const kids = new Map();
    for (const id of ids) { const r = rec('block', id); const c = r && Array.isArray(r.content) ? r.content.slice(0, 2) : []; if (c.length) kids.set(id, c); }
    const all = [...kids.values()].flat();
    if (all.length) await records('block', all).catch(() => null);
    const out = new Map();
    for (const [id, c] of kids) out.set(id, c.map((k) => plain(((rec('block', k) || {}).properties || {}).title)).filter(Boolean).join(' ').slice(0, 160));
    return out;
  }

  /* ============================================================
   *  3. Nebius（³³）との連絡口 — JSON の CustomEvent（ScriptCat の別の世界からも届く）
   * ============================================================ */
  let busN = 0;
  const nebOn = () => de.hasAttribute('data-nebius');
  function neb(k, o, ms) {
    return new Promise((res) => {
      if (!nebOn()) { res(null); return; }
      const id = 'c41-' + (++busN) + '-' + Date.now().toString(36);
      let t = 0;
      const on = (ev) => {
        let m = null; try { m = JSON.parse(ev.detail); } catch (e) { return; }
        if (!m || m.id !== id) return;
        document.removeEventListener('nebius:res', on); clearTimeout(t); res(m);
      };
      document.addEventListener('nebius:res', on);
      t = setTimeout(() => { document.removeEventListener('nebius:res', on); res(null); }, ms || 90000);
      try { document.dispatchEvent(new CustomEvent('nebius:req', { detail: JSON.stringify(Object.assign({ id, k }, o || {})) })); } catch (e) { clearTimeout(t); res(null); }
    });
  }
  let NICK = 'Wパパ';
  async function nebStatus() {
    const s = await neb('status', {}, 2500);
    if (s && s.nick) NICK = String(s.nick);
    return s || { aiOn: false, team: 0 };
  }

  /* ============================================================
   *  4. いまの本体 DB（全画面のデータベース）
   * ============================================================ */
  let CTX = null;      // { key, bid, vid, table, tables, scroller, tabsRow, tablist, db, view }
  function vidNow(pg) {
    const v = new URLSearchParams(location.search).get('v');
    if (v && /^[0-9a-f-]{32,36}$/i.test(v)) return dash(v);
    const on = $(SEL.tabOn, pg || document);
    const tb = on && on.closest(SEL.tabBtn);
    return tb ? tb.getAttribute('data-collection-view-id') : '';
  }
  function findCtx() {
    const frame = $(SEL.frame);
    if (!frame) return null;
    const tables = $$(SEL.table, frame).filter((t) => !t.closest(SEL.inlineDb) && !t.closest(SEL.peek));
    if (!tables.length) return null;
    const pg = tables[0].closest(SEL.dbPage) || $(SEL.dbPage, frame);
    const bid = pg && pg.getAttribute('data-block-id');
    if (!bid) return null;
    const tablist = $(SEL.tablist, frame);
    const vid = vidNow(frame);
    const scroller = tables[0].closest(SEL.hscroll);
    return { bid, vid, key: id32(vid || bid).slice(0, 12), table: tables[0], tables, scroller: need('hscroll', scroller), tablist, tabsRow: tablist ? tablist.parentElement : null, frame };
  }
  /* 表の中で使う範囲（ビューが変わった瞬間に古い規則が外れるよう、html の印と組にする） */
  const scopeOf = (key, more) => 'html[data-tl-key="' + key + '"]' + (more || '') + ' ' + SEL.frame + ' ' + SEL.table + ':not(' + SEL.inlineDb + ' *):not(' + SEL.peek + ' *)';
  function styleEl(id) {
    let st = document.getElementById(id);
    if (!st) { st = document.createElement('style'); st.id = id; (document.head || de).appendChild(st); }
    return st;
  }
  function setCss(id, text) { const st = styleEl(id); if (st.textContent !== text) st.textContent = text; }

  /* ============================================================
   *  5. 視野（Field）— 狭ければ自分で畳まれる
   * ============================================================ */
  const MIN = { title: 160, long: 200, other: 96 };
  const FS = { key: '', cols: [], titleCi: -1, level: 0, plan: null, gain: 0, sbBefore: 0, gainPending: false, longAuto: {}, recall: new Set(), lensRecall: new Set(), tabX: 0, tabUser: false, sig: '' };
  const headRowOf = (table) => $(SEL.headRow, table);
  const headCellsOf = (table) => { const hr = headRowOf(table); return hr ? $$(SEL.headCell, hr) : []; };
  const cellOf = (item, ci) => item.querySelector(SEL.cell + '[data-col-index="' + ci + '"]');

  function mapCols(c) {
    const hcs = headCellsOf(c.table);
    if (!hcs.length) { need('headCell', null); return null; }
    const schema = c.db.schema;
    const byName = new Map();
    for (const [pid, d] of Object.entries(schema)) { const n = norm(d.name); byName.set(n, byName.has(n) ? null : pid); }
    const tp = ((c.view && c.view.format && c.view.format.table_properties) || []).filter((x) => x.visible !== false && schema[x.property]);
    return hcs.map((hc, ci) => {
      const name = norm((hc.firstElementChild && !hc.firstElementChild.classList.contains('tl-grip') ? hc.firstElementChild : hc).textContent);
      let pid = byName.get(name) || null;
      if (!pid && tp.length === hcs.length) pid = tp[ci].property;
      const d = pid ? schema[pid] : null;
      const nat = parseFloat(hc.style.width) || Math.round(hc.getBoundingClientRect().width) || 120;
      return { ci, pid: pid || '#' + ci, name: d ? d.name : name, type: d ? d.type : '', nat, title: pid === 'title', long: false };
    });
  }
  function isLong(c, col) {
    const m = LONG[c.db.cid];
    if (m && m[col.pid] != null) return !!m[col.pid];
    if (col.title || col.type !== 'text') return false;
    const k = c.db.cid + '|' + col.pid;
    if (FS.longAuto[k] != null) return FS.longAuto[k];
    const cells = $$(SEL.cell + '[data-col-index="' + col.ci + '"]', c.table).slice(0, 30);
    if (cells.length < 3) return false;
    const avg = cells.reduce((a, x) => a + norm(x.textContent).length, 0) / cells.length;
    FS.longAuto[k] = avg > 80;
    return FS.longAuto[k];
  }
  /* 優先度（高い順）: 保存があればその順、無ければ 題名 → ビューの並び → 長文は最後 */
  function priOf(c, cols) {
    const base = cols.slice().sort((a, b) => (b.title - a.title) || (a.long - b.long) || (a.ci - b.ci)).map((x) => x.pid);
    const out = [], seen = new Set();
    for (const pid of (PRI[c.db.cid] || [])) if (base.includes(pid) && !seen.has(pid)) { seen.add(pid); out.push(pid); }
    for (const pid of base) if (!seen.has(pid)) { seen.add(pid); out.push(pid); }
    const ti = out.indexOf('title');
    if (ti > 0) { out.splice(ti, 1); out.unshift('title'); }
    return out;
  }
  const minOf = (col) => Math.min(col.nat, col.title ? MIN.title : col.long ? MIN.long : MIN.other);
  const sideCan = () => {
    if (!P.stella || !nebOn() || !de.hasAttribute('data-c33-stella') || de.hasAttribute('data-neb-pinned')) return false;
    const sc = $(SEL.sidebar);
    return !!(sc && sc.getBoundingClientRect().width > 100);
  };
  function gainEst() {
    if (FS.gain > 0) return FS.gain;
    const sc = $(SEL.sidebar);
    const rail = parseFloat(getComputedStyle(de).getPropertyValue('--c33-rail-w')) || 88;
    return sc ? Math.max(0, Math.round(sc.getBoundingClientRect().width - rail - 52)) : 0;
  }

  function fieldPlan(c) {
    const cols = FS.cols;
    if (!cols.length || !c.scroller) return null;
    const hr = headRowOf(c.table);
    const inner = hr && hr.firstElementChild;
    if (!inner) return null;
    const sr = c.scroller.getBoundingClientRect();
    const ir = inner.getBoundingClientRect();
    const pad = Math.max(0, Math.round(ir.left - sr.left + c.scroller.scrollLeft));
    const cellsW = headCellsOf(c.table).reduce((a, h) => a + h.getBoundingClientRect().width, 0);
    /* 右端の「＋」「…」: 見出しの余り（＋ こちらのチップ）と、行の右の余りの大きい方 */
    const chips = hr.querySelector(':scope > .tl-hchips');
    const headTail = Math.max(0, Math.round(ir.width - cellsW)) + (chips ? Math.round(chips.getBoundingClientRect().width) + 6 : 0);
    const it = $(SEL.item, c.table);
    const rowTail = it && it.lastElementChild && it.children.length > 1 ? Math.round(it.lastElementChild.getBoundingClientRect().width) : 0;
    const extra = Math.max(headTail, rowTail);
    const W = c.scroller.clientWidth;
    const narrowNow = de.hasAttribute('data-neb-narrow');
    const can = !de.hasAttribute('data-neb-pinned') && (sideCan() || (narrowNow && P.stella));
    const gain = can ? (narrowNow ? FS.gain || gainEst() : gainEst()) : 0;
    const Wfull = W - (narrowNow ? gain : 0);
    const right = 16;
    const avail = (L) => (L >= 1 && can ? Wfull + gain : Wfull) - pad - extra - right;
    const R = new Set([...FS.recall, ...FS.lensRecall]);
    const pri = priOf(c, cols);
    const byPid = new Map(cols.map((x) => [x.pid, x]));
    const foldOrder = pri.slice().reverse().filter((pid) => pid !== 'title' && byPid.has(pid));
    const nonTitle = cols.filter((x) => !x.title).length;
    const keep = Math.max(1, cols.filter((x) => !x.title && R.has(x.pid)).length);
    const maxK = Math.max(0, nonTitle - keep);
    const foldList = (k) => foldOrder.filter((pid) => !R.has(pid)).slice(0, k);
    const natSum = cols.reduce((a, x) => a + x.nat, 0);
    const minSum = (k) => { const f = new Set(foldList(k)); return cols.reduce((a, x) => a + (f.has(x.pid) ? 0 : minOf(x)), 0); };
    const Ls = [0];
    if (can) Ls.push(1);
    Ls.push(2);
    for (let k = 1; k <= maxK; k++) Ls.push(2 + k);
    const needOf = (L) => (L <= 1 ? natSum : minSum(L - 2));
    const fits = (L, m) => needOf(L) + (m || 0) <= avail(L);
    let ti = Ls.findIndex((L) => fits(L));
    const over = ti < 0;
    if (ti < 0) ti = Ls.length - 1;
    let ci = Ls.indexOf(FS.level);
    if (ci < 0) ci = Ls.findIndex((L) => L >= FS.level), ci = ci < 0 ? Ls.length - 1 : ci;
    let ni = ti;
    if (ti < ci) { ni = ci; while (ni > ti && fits(Ls[ni - 1], 24)) ni--; }
    const L = Ls[ni];
    const k = Math.max(0, L - 2);
    const folded = new Set(foldList(k));
    const widths = new Map();
    if (L >= 2) {
      const A = Math.floor(avail(L));
      const vis = cols.filter((x) => !folded.has(x.pid));
      const longs = vis.filter((x) => x.long), others = vis.filter((x) => !x.long);
      const oNat = others.reduce((a, x) => a + x.nat, 0);
      if (longs.length && oNat + longs.length * MIN.long <= A) {
        for (const x of others) widths.set(x.ci, x.nat);
        const each = Math.floor((A - oNat) / longs.length);
        for (const x of longs) widths.set(x.ci, Math.max(MIN.long, each));
      } else {
        const lw = longs.length * MIN.long;
        const oMin = others.reduce((a, x) => a + minOf(x), 0);
        const span = others.reduce((a, x) => a + (x.nat - minOf(x)), 0);
        const t = span > 0 ? clamp((A - lw - oMin) / span, 0, 1) : 0;
        for (const x of longs) widths.set(x.ci, MIN.long);
        for (const x of others) widths.set(x.ci, Math.floor(minOf(x) + t * (x.nat - minOf(x))));
      }
    }
    /* 題名の下に出す、畳んだ列の上位 2 列（ファイル・チェックは中身が文字にならないので飛ばす） */
    const fv = pri.filter((pid) => folded.has(pid) && !['file', 'checkbox'].includes((byPid.get(pid) || {}).type)).slice(0, 2).map((pid) => byPid.get(pid).ci);
    const visNon = cols.filter((x) => !x.title && !folded.has(x.pid)).length;
    return {
      L, k, maxK, folded, widths, fv, pad, extra, over: over && ni === Ls.length - 1,
      narrow: L >= 1 && can, sticky: over && ni === Ls.length - 1 && L >= 2,
      chip: P.map && L >= 3 && visNon <= 1,
      longCis: L >= 2 ? cols.filter((x) => x.long && !folded.has(x.pid)).map((x) => x.ci) : [],
      pri
    };
  }

  function narrowSet(on) {
    const has = de.hasAttribute('data-neb-narrow');
    if (on === has) return;
    if (on) {
      const inner = $(SEL.sideInner), sc = $(SEL.sidebar);
      const w = inner ? Math.round(inner.getBoundingClientRect().width) : 0;
      if (w > 120) de.style.setProperty('--neb-full-w', w + 'px');
      FS.sbBefore = sc ? sc.getBoundingClientRect().width : 0;
      FS.gainPending = true;
      de.setAttribute('data-neb-narrow', '');
    } else {
      de.removeAttribute('data-neb-narrow');
      de.removeAttribute('data-neb-peek');
    }
  }
  /* 縮んだ後、実際に何 px 空いたかを測る（次の計算から使う） */
  function gainMeasure() {
    if (!FS.gainPending) return;
    const sc = $(SEL.sidebar);
    if (!sc || !de.hasAttribute('data-neb-narrow')) { FS.gainPending = false; return; }
    const now = sc.getBoundingClientRect().width;
    if (FS.sbBefore - now > 8) { FS.gain = Math.round(FS.sbBefore - now); FS.gainPending = false; }
  }

  function fieldCss(c, p) {
    const S = scopeOf(c.key);
    /* 見出しのセルは 1 つずつ包みに入っているので、包みの並び（見出しのセルを持つ包みだけを数える）で選ぶ */
    const HW = (ci) => S + ' :nth-child(' + (ci + 1) + ' of :has(> ' + SEL.headCell + '))';
    const HC = (ci) => HW(ci) + ', ' + HW(ci) + ' > ' + SEL.headCell;
    const BC = (ci) => S + ' ' + SEL.cell + '[data-col-index="' + ci + '"]';
    let css = S + ' ' + SEL.headCell + ' { position: relative; }\n';
    if (p) {
      for (const col of FS.cols) {
        if (p.folded.has(col.pid)) {
          css += HC(col.ci) + ', ' + BC(col.ci) + ' { width: 0 !important; min-width: 0 !important; max-width: 0 !important; opacity: 0 !important; border-inline-end-width: 0 !important; overflow: hidden !important; pointer-events: none !important; }\n';
          /* 中身は高さ 0 に（幅 0 の中で文字が 1 字ずつ折り返して、行が縦に伸びるのを防ぐ。文字は読めるまま） */
          css += BC(col.ci) + ' > div { width: 0 !important; min-width: 0 !important; max-height: 0 !important; overflow: hidden !important; }\n';
        } else if (p.widths.has(col.ci)) {
          const w = p.widths.get(col.ci);
          css += HC(col.ci) + ', ' + BC(col.ci) + ' { width: ' + w + 'px !important; min-width: ' + w + 'px !important; max-width: ' + w + 'px !important; }\n';
          css += BC(col.ci) + ' > div:first-child { width: ' + w + 'px !important; }\n';
        }
      }
      for (const ci of p.longCis) {
        css += BC(ci) + ' ' + SEL.value + ' { max-height: calc(1.5em * 3 + 16px) !important; overflow: hidden !important; white-space: normal !important; }\n';
        css += BC(ci) + ' ' + SEL.value + ' span { white-space: normal !important; text-overflow: clip !important; }\n';
        css += BC(ci) + ' ' + SEL.value + '[data-tl-clip] { -webkit-mask: linear-gradient(#000, #000) top / 100% calc(100% - 29px) no-repeat, linear-gradient(to right, #000 52%, transparent 94%) bottom / 100% 29px no-repeat; mask: linear-gradient(#000, #000) top / 100% calc(100% - 29px) no-repeat, linear-gradient(to right, #000 52%, transparent 94%) bottom / 100% 29px no-repeat; }\n';
      }
      if (p.L >= 2) {
        /* 列の幅の合計を持つ部品（行の追加の段・計算の段など）も、譲った幅にそろえる。右の余白も詰める */
        const nat = FS.cols.reduce((a, x) => a + x.nat, 0);
        const cur = FS.cols.reduce((a, x) => a + (p.folded.has(x.pid) ? 0 : p.widths.has(x.ci) ? p.widths.get(x.ci) : x.nat), 0);
        css += S + ' [style*="width: ' + nat + 'px"]:not(' + SEL.cell + '):not(' + SEL.headCell + '):not(' + SEL.item + ' *) { width: ' + cur + 'px !important; }\n';
        css += S + ' { padding-inline-end: 16px !important; }\n';
        css += S + ' [data-tl-ci] { transition: inherit; }\n';
        for (const col of FS.cols) {
          const X = S + ' [data-tl-ci="' + col.ci + '"]';
          if (p.folded.has(col.pid)) css += X + ' { width: 0 !important; min-width: 0 !important; max-width: 0 !important; opacity: 0 !important; overflow: hidden !important; border-inline-end-width: 0 !important; }\n';
          else if (p.widths.has(col.ci)) css += X + ' { width: ' + p.widths.get(col.ci) + 'px !important; min-width: 0 !important; max-width: ' + p.widths.get(col.ci) + 'px !important; }\n';
        }
      }
      if (p.sticky && FS.titleCi >= 0) {
        css += HC(FS.titleCi) + ', ' + BC(FS.titleCi) + ' { position: sticky !important; left: 0 !important; z-index: 4 !important; background: var(--c-bacPri, #fff) !important; box-shadow: 6px 0 10px -8px rgba(15,15,15,.18); }\n';
      }
    }
    css += scopeOf(c.key, '[data-tl-anim]') + ' :is(' + SEL.headCell + ', ' + SEL.cell + ', [data-tl-ci], :has(> ' + SEL.headCell + ')) { transition: width .2s cubic-bezier(.3,.7,.3,1), min-width .2s cubic-bezier(.3,.7,.3,1), max-width .2s cubic-bezier(.3,.7,.3,1), opacity .2s ease !important; }\n';
    setCss('tl-field-css', css);
  }

  let animT = 0;
  function fieldApply(c, p) {
    const prev = FS.plan;
    const changed = !prev || prev.L !== p.L || [...p.folded].join() !== [...prev.folded].join();
    if (changed && !calm() && prev) { de.setAttribute('data-tl-anim', ''); clearTimeout(animT); animT = setTimeout(() => de.removeAttribute('data-tl-anim'), 450); }
    FS.plan = p; FS.level = p.L;
    ST.level = p.L; ST.folded = p.folded.size;
    narrowSet(p.narrow);
    fieldCss(c, p);
    if (p.L >= 2) fieldExtras(c, true);
    hchips(c, p);
    grips(c);
    rowSoon();
    fadeSoon();
  }
  /* 列の幅の並びをそのまま持つ段（計算の段など。見出しと行のセル以外）を探して、列の番号を付ける */
  let extrasAt = 0;
  function fieldExtras(c, force) {
    if (!force && Date.now() - extrasAt < 1000) return;
    extrasAt = Date.now();
    const nat = FS.cols.map((x) => x.nat);
    if (nat.length < 2) return;
    for (const t of c.tables) {
      for (const el of t.querySelectorAll('div[style*="width: ' + nat[0] + 'px"]')) {
        if (el.matches(SEL.cell) || el.matches(SEL.headCell) || el.closest(SEL.item) || el.closest(SEL.headRow) || el.hasAttribute('data-tl-ci')) continue;
        const sib = [...el.parentElement.children];
        const i0 = sib.indexOf(el);
        let ok = true;
        for (let k = 1; k < nat.length; k++) { const e2 = sib[i0 + k]; if (!e2 || Math.abs((parseFloat(e2.style.width) || -1) - nat[k]) > 0.5) { ok = false; break; } }
        if (!ok) continue;
        for (let k = 0; k < nat.length; k++) sib[i0 + k].setAttribute('data-tl-ci', String(k));
      }
    }
  }
  function fieldOff() {
    setCss('tl-field-css', '');
    if (de.hasAttribute('data-neb-narrow')) narrowSet(false);
    for (const e of $$('.tl-hchips, .tl-grip, .tl-fv')) e.remove();
    for (const e of $$('[data-tl-clip]')) e.removeAttribute('data-tl-clip');
    for (const e of $$('[data-tl-ci]')) e.removeAttribute('data-tl-ci');
    FS.plan = null; FS.level = 0;
    fadeSoon();
  }
  function fieldCompute() {
    const c = CTX;
    if (!c || !c.db) return;
    gainMeasure();
    if (!P.field || MAP.on) { if (!P.field) fieldOff(); return; }
    const cols = mapCols(c);
    if (!cols) return;
    for (const col of cols) col.long = isLong(c, col);
    FS.cols = cols;
    FS.titleCi = (cols.find((x) => x.title) || { ci: -1 }).ci;
    const p = fieldPlan(c);
    if (!p) return;
    fieldApply(c, p);
  }

  /* 見出しの右端: 「＋N 列」と「星図で見る」 */
  function hchips(c, p) {
    const hr = headRowOf(c.table);
    let box = hr && hr.querySelector(':scope > .tl-hchips');
    const n = p ? p.folded.size : 0;
    const showMap = p && p.chip;
    if (!hr || (!n && !showMap)) { if (box) box.remove(); return; }
    if (!box) { box = mk('div', 'tl-hchips'); box.setAttribute('contenteditable', 'false'); hr.appendChild(box); }
    const sig = n + '|' + (showMap ? 1 : 0) + '|' + [...p.folded].join(',');
    if (box.__sig === sig) return;
    box.__sig = sig;
    box.textContent = '';
    if (n) {
      const b = mk('button', 'tl-chip tl-more', '＋' + n + '列', box);
      b.type = 'button';
      b.setAttribute('aria-haspopup', 'menu');
      b.title = '畳んだ列: ' + FS.cols.filter((x) => p.folded.has(x.pid)).map((x) => x.name).join('・');
      const open = (e) => { if (e) { e.preventDefault(); e.stopPropagation(); } foldMenu(b); };
      b.addEventListener('mouseenter', () => { clearTimeout(b.__t); b.__t = setTimeout(() => foldMenu(b), 260); });
      b.addEventListener('mouseleave', () => clearTimeout(b.__t));
      b.addEventListener('click', open);
      b.addEventListener('mousedown', (e) => e.stopPropagation(), true);
    }
    if (showMap) {
      const m = mk('button', 'tl-chip tl-tomap', null, box);
      m.type = 'button';
      m.innerHTML = '<span aria-hidden="true">✦</span> 星図で見る';
      m.addEventListener('mousedown', (e) => e.stopPropagation(), true);
      m.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); mapEnter(); });
    }
  }
  function foldMenu(anchor) {
    const p = FS.plan;
    if (!p) return;
    pop(anchor, '畳んだ列', (api) => {
      const folded = FS.cols.filter((x) => p.folded.has(x.pid));
      if (!folded.length) api.note('いまは畳んだ列はありません');
      for (const col of folded) api.item(col.name, { hint: '呼び戻す', on: () => { FS.recall.add(col.pid); fieldSoon(); return true; } });
      const back = FS.cols.filter((x) => FS.recall.has(x.pid));
      if (back.length) {
        api.div();
        api.sec('呼び戻し中');
        for (const col of back) api.item(col.name, { hint: '畳み直す', on: () => { FS.recall.delete(col.pid); fieldSoon(); return true; } });
      }
      api.div();
      api.note('呼び戻すと、優先度が最も低い列が代わりに畳まれます。見出しのつまみ ⠿ で優先度を並べ替えられます。');
    });
  }

  /* 見出しのつまみ（⠿）: ドラッグで優先度を並べ替え・押すと優先度の一覧 */
  function grips(c) {
    const p = FS.plan;
    const hcs = headCellsOf(c.table);
    hcs.forEach((hc, ci) => {
      const col = FS.cols[ci];
      let g = hc.querySelector(':scope > .tl-grip');
      if (!col || !P.field) { if (g) g.remove(); return; }
      if (!g) {
        g = mk('div', 'tl-grip');
        g.setAttribute('role', 'button');
        g.setAttribute('contenteditable', 'false');
        g.tabIndex = -1;
        g.innerHTML = '<i></i><b></b>';
        g.addEventListener('pointerdown', gripDown, true);
        g.addEventListener('mousedown', (e) => { e.stopPropagation(); }, true);
        g.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, true);
        hc.appendChild(g);
      }
      g.__pid = col.pid;
      const rank = p ? p.pri.indexOf(col.pid) + 1 : 0;
      const b = g.querySelector('b');
      if (b.textContent !== String(rank || '')) b.textContent = rank || '';
      g.title = col.name + ' — 優先度 ' + rank + '（ドラッグで並べ替え・押すと一覧）';
    });
  }
  let gdrag = null;
  function gripDown(e) {
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    const g = e.currentTarget;
    gdrag = { pid: g.__pid, x: e.clientX, y: e.clientY, moved: false, g, ghost: null, target: null };
    try { g.setPointerCapture(e.pointerId); } catch (er) { /* noop */ }
    g.addEventListener('pointermove', gripMove);
    g.addEventListener('pointerup', gripUp, { once: true });
    g.addEventListener('pointercancel', gripUp, { once: true });
  }
  function gripMove(e) {
    const d = gdrag;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
    if (!d.moved) {
      d.moved = true;
      const col = FS.cols.find((x) => x.pid === d.pid);
      d.ghost = mk('div', 'tl-ghost', '⠿ ' + (col ? col.name : ''), document.body);
      de.setAttribute('data-tl-grab', '');
    }
    d.ghost.style.transform = 'translate(' + (e.clientX + 10) + 'px,' + (e.clientY + 8) + 'px)';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const hc = el && el.closest && el.closest(SEL.headCell);
    const g = hc && hc.querySelector(':scope > .tl-grip');
    if (d.target && d.target !== hc) d.target.removeAttribute('data-tl-drop');
    d.target = g && g.__pid && g.__pid !== d.pid ? hc : null;
    if (d.target) d.target.setAttribute('data-tl-drop', '');
  }
  function gripUp() {
    const d = gdrag;
    gdrag = null;
    if (!d) return;
    d.g.removeEventListener('pointermove', gripMove);
    de.removeAttribute('data-tl-grab');
    if (d.ghost) d.ghost.remove();
    if (d.target) d.target.removeAttribute('data-tl-drop');
    if (!d.moved) { priMenu(d.g); return; }
    const tg = d.target && d.target.querySelector(':scope > .tl-grip');
    if (!tg || !CTX || !FS.plan) return;
    const list = FS.plan.pri.slice();
    const from = list.indexOf(d.pid);
    if (from < 0 || d.pid === 'title') return;
    list.splice(from, 1);
    let to = list.indexOf(tg.__pid);
    if (tg.__pid === 'title') to = 1;
    list.splice(Math.max(1, to), 0, d.pid);
    PRI[CTX.db.cid] = list;
    save(LS.pri, PRI);
    fieldSoon();
  }
  function priMenu(anchor) {
    if (!CTX || !FS.plan) return;
    pop(anchor, '列の優先度（上ほど残る）', (api) => priEditor(api.body(), () => api.close()));
  }
  /* 優先度の一覧（設定でも使う）: ↑↓ で並べ替え、長文の指定 */
  function priEditor(host, done) {
    const c = CTX;
    if (!c || !c.db || !FS.cols.length) { mk('div', 'tl-note', '全画面の DB の表を開くと、ここで列の優先度を並べ替えられます。', host); return; }
    const list = priOf(c, FS.cols);
    const byPid = new Map(FS.cols.map((x) => [x.pid, x]));
    const ul = mk('div', 'tl-pri', null, host);
    const draw = () => {
      ul.textContent = '';
      list.forEach((pid, i) => {
        const col = byPid.get(pid);
        if (!col) return;
        const r = mk('div', 'tl-pri-r', null, ul);
        mk('span', 'tl-pri-n', String(i + 1), r);
        mk('span', 'tl-pri-name', col.name + (col.title ? '（題名）' : ''), r);
        const lg = mk('button', 'tl-pri-lg' + (col.long ? ' on' : ''), '長文', r);
        lg.type = 'button';
        lg.title = '長文の列として扱う（自動の判定を上書き）';
        lg.disabled = col.title;
        lg.addEventListener('click', (e) => { e.preventDefault(); const m = LONG[c.db.cid] || (LONG[c.db.cid] = {}); m[pid] = !col.long; save(LS.long, LONG); col.long = !col.long; fieldSoon(); draw(); });
        const up = mk('button', 'tl-pri-b', '↑', r); up.type = 'button'; up.setAttribute('aria-label', col.name + ' を上へ');
        const dn = mk('button', 'tl-pri-b', '↓', r); dn.type = 'button'; dn.setAttribute('aria-label', col.name + ' を下へ');
        up.disabled = col.title || i <= 1; dn.disabled = col.title || i >= list.length - 1;
        up.addEventListener('click', (e) => { e.preventDefault(); list.splice(i, 1); list.splice(i - 1, 0, pid); commit(); });
        dn.addEventListener('click', (e) => { e.preventDefault(); list.splice(i, 1); list.splice(i + 1, 0, pid); commit(); });
      });
    };
    const commit = () => { PRI[c.db.cid] = list.slice(); save(LS.pri, PRI); fieldSoon(); draw(); };
    draw();
    const rs = mk('button', 'tl-link', '既定の順に戻す', host);
    rs.type = 'button';
    rs.addEventListener('click', (e) => { e.preventDefault(); delete PRI[c.db.cid]; delete LONG[c.db.cid]; save(LS.pri, PRI); save(LS.long, LONG); FS.longAuto = {}; fieldSoon(); if (done) done(); });
  }

  /* 行ごとのかけ直し（仮想化で行が作り直されるたびに。読む → 書くの順） */
  function cellText(item, ci) {
    const cl = cellOf(item, ci);
    return cl ? norm(cl.textContent).slice(0, 60) : '';
  }
  function textColOf(item) {
    if (FS.titleCi < 0) return null;
    const tc = cellOf(item, FS.titleCi);
    const pv = tc && tc.querySelector(SEL.value);
    if (!pv) return null;
    const f = pv.firstElementChild;
    return f && f.lastElementChild && !f.lastElementChild.classList.contains('tl-fv') ? f.lastElementChild : pv;
  }
  function rowPass() {
    const c = CTX;
    if (!c) return;
    const p = FS.plan;
    if (p && p.L >= 2) fieldExtras(c, false);
    const fvCols = p ? p.fv.map((ci) => FS.cols[ci]).filter(Boolean) : [];
    const jobs = [];
    for (const t of c.tables) {
      for (const it of t.querySelectorAll(SEL.item)) {
        const id = it.getAttribute('data-block-id');
        const tcol = textColOf(it);
        const fv = fvCols.map((col) => ({ name: col.name, v: cellText(it, col.ci) })).filter((x) => x.v);
        const clips = [];
        if (p) for (const ci of p.longCis) { const v = it.querySelector(SEL.cell + '[data-col-index="' + ci + '"] ' + SEL.value); if (v) clips.push([v, v.scrollHeight > v.clientHeight + 2]); }
        jobs.push({ it, id, tcol, fv, clips });
      }
    }
    for (const j of jobs) {
      for (const [v, on] of j.clips) if (v.hasAttribute('data-tl-clip') !== on) v.toggleAttribute('data-tl-clip', on);
      if (!j.tcol) continue;
      lensTags(j.it, j.id, j.tcol);
      let el = j.tcol.querySelector(':scope > .tl-fv');
      if (!j.fv.length) { if (el) el.remove(); continue; }
      const sig = j.fv.map((x) => x.name + '\u0001' + x.v).join('\u0002');
      if (!el) { el = mk('div', 'tl-fv'); el.setAttribute('contenteditable', 'false'); }
      if (el.parentElement !== j.tcol || el.nextSibling) j.tcol.appendChild(el);
      if (el.__sig !== sig) {
        el.__sig = sig;
        el.innerHTML = j.fv.map((x, i) => (i ? '<span aria-hidden="true"> · </span>' : '') + '<span class="tl-sr">' + esc(x.name) + ': </span>' + esc(x.v)).join('');
      }
    }
  }
  let rowRaf = 0;
  function rowSoon() { if (rowRaf) return; rowRaf = requestAnimationFrame(() => { rowRaf = 0; try { rowPass(); } catch (e) { oops('rows', e); } }); }

  /* 行に 0.4 秒: 長文の全文と、畳んだ列の値のカード（行の高さは変えない） */
  let hovIt = null, hovT = 0;
  function cardHide() { clearTimeout(hovT); const d = document.getElementById('tl-card'); if (d) d.remove(); }
  function onRowOver(e) {
    if (!CTX || !FS.plan || MAP.on) return;
    const it = e.target.closest && e.target.closest(SEL.item);
    if (it === hovIt) return;
    hovIt = it && CTX.tables.some((t) => t.contains(it)) ? it : null;
    cardHide();
    if (hovIt) { const me = hovIt; hovT = setTimeout(() => { if (hovIt === me) cardShow(me); }, 400); }
  }
  function cardShow(it) {
    const p = FS.plan;
    if (!p || !it.isConnected) return;
    const longCi = p.longCis.find((ci) => { const v = it.querySelector(SEL.cell + '[data-col-index="' + ci + '"] ' + SEL.value); return v && v.hasAttribute('data-tl-clip'); });
    const folded = FS.cols.filter((x) => p.folded.has(x.pid)).map((x) => ({ name: x.name, v: x.type === 'file' ? '' : norm((cellOf(it, x.ci) || {}).textContent || '') })).filter((x) => x.v);
    if (longCi == null && !folded.length) return;
    const anchor = longCi != null ? cellOf(it, longCi) : textColOf(it) || cellOf(it, FS.titleCi);
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const d = mk('div', 'tl-card', null, document.body);
    d.id = 'tl-card';
    d.setAttribute('role', 'tooltip');
    if (longCi != null) { const col = FS.cols[longCi]; mk('div', 'tl-card-h', col ? col.name : '', d); mk('div', 'tl-card-t', norm(cellOf(it, longCi).textContent), d); }
    if (folded.length) {
      const f = mk('div', 'tl-card-f', null, d);
      mk('div', 'tl-card-h', '畳んだ列', f);
      for (const x of folded) {
        if (x.v.length > 60) { const blk = mk('div', 'tl-card-lv', null, f); mk('div', 'k', x.name, blk); mk('div', 'v', x.v.slice(0, 600), blk); continue; }
        const row = mk('div', 'tl-card-kv', null, f); mk('span', 'k', x.name, row); mk('span', 'v', x.v.slice(0, 200), row);
      }
    }
    const w = clamp(r.width, 280, 520);
    const top = longCi != null ? r.top : r.bottom + 6;
    d.style.width = w + 'px';
    d.style.left = clamp(r.left, 8, innerWidth - w - 8) + 'px';
    d.style.top = Math.max(8, top) + 'px';
    const h = d.getBoundingClientRect().height;
    if (top + h > innerHeight - 8) d.style.top = Math.max(8, innerHeight - h - 8) + 'px';
  }

  /* 題名を左に留めた時の、左右の淡いフェード（続きのある側だけ） */
  let fadeRaf = 0;
  function fadeSoon() { if (fadeRaf) return; fadeRaf = requestAnimationFrame(() => { fadeRaf = 0; try { fadePass(); ticksPass(); } catch (e) { oops('fade', e); } }); }
  function fadePass() {
    const c = CTX;
    let l = document.getElementById('tl-fade-l'), r = document.getElementById('tl-fade-r');
    const on = c && c.scroller && FS.plan && FS.plan.sticky && !MAP.on;
    if (!on) { if (l) l.hidden = true; if (r) r.hidden = true; return; }
    if (!l) { l = mk('div', 'tl-fade', null, document.body); l.id = 'tl-fade-l'; }
    if (!r) { r = mk('div', 'tl-fade', null, document.body); r.id = 'tl-fade-r'; }
    const sr = c.scroller.getBoundingClientRect(), tr = c.table.getBoundingClientRect();
    const top = Math.max(sr.top, tr.top), bot = Math.min(sr.bottom, tr.bottom);
    const sc = c.scroller;
    const it = $(SEL.item, c.table);
    const tcell = it && cellOf(it, FS.titleCi);
    const lx = tcell ? Math.max(sr.left, tcell.getBoundingClientRect().right) : sr.left;
    const showL = sc.scrollLeft > 2, showR = sc.scrollLeft + sc.clientWidth < sc.scrollWidth - 2;
    l.hidden = !showL || bot - top < 20; r.hidden = !showR || bot - top < 20;
    Object.assign(l.style, { left: lx + 'px', top: top + 'px', height: (bot - top) + 'px' });
    Object.assign(r.style, { left: (sr.left + sc.clientWidth - 28) + 'px', top: top + 'px', height: (bot - top) + 'px' });
  }

  /* ビューのタブ: 「他 N 件」に隠さず、横に流れる帯（Notion に広い場所を見せて全部描かせ、元の枠で切り抜く） */
  const TAB_W = 4000;
  function tabsOff() { for (const r of $$('[data-tl-tabrow]')) r.removeAttribute('data-tl-tabrow'); for (const tl of $$('[data-tl-tabs]')) { tl.removeAttribute('data-tl-tabs'); tl.removeAttribute('data-tl-fl'); tl.removeAttribute('data-tl-fr'); tl.style.removeProperty('--tl-tabw'); tl.style.removeProperty('--tl-tx'); } }
  const TABW = new WeakSet();
  function tabsPass() {
    const c = CTX;
    const tl = c && c.tablist;
    if (c && c.db && !tl && ST.runs > 30) need('tablist', null);
    if (!tl || !P.field || !tl.isConnected) { tabsOff(); return; }
    const row = tl.parentElement, tool = tl.nextElementSibling, inner = tl.firstElementChild;
    if (!row || !inner) return;
    const rr = row.getBoundingClientRect();
    const ms = parseFloat(getComputedStyle(tl).marginInlineStart) || 0;
    /* 道具の段の中身の幅（包みは display: contents で幅 0 のことがあるので、ボタンの外枠から測る） */
    let toolW = 0;
    if (tool) {
      let x0 = Infinity, x1 = -Infinity;
      for (const k of tool.querySelectorAll('[role="button"], .tl-lensbtn, input')) { const r = k.getBoundingClientRect(); if (r.width < 1) continue; if (r.left < x0) x0 = r.left; if (r.right > x1) x1 = r.right; }
      toolW = (x1 > x0 ? x1 - x0 : 0) + (parseFloat(getComputedStyle(tool).paddingInlineEnd) || 0) + 10;
    }
    const w0 = Math.floor(rr.width - ms - toolW);
    if (w0 < 120) { tabsOff(); return; }
    if (!TABW.has(tl)) {
      TABW.add(tl);
      tl.addEventListener('wheel', onTabWheel, { passive: false });
      tl.addEventListener('focusin', () => { FS.tabUser = false; tabsSoon(); });
    }
    if (!tl.hasAttribute('data-tl-tabs')) tl.setAttribute('data-tl-tabs', '');
    if (!row.hasAttribute('data-tl-tabrow')) row.setAttribute('data-tl-tabrow', '');
    if (tl.style.getPropertyValue('--tl-tabw') !== w0 + 'px') tl.style.setProperty('--tl-tabw', w0 + 'px');
    const cw = inner.getBoundingClientRect().width;
    const max = Math.max(0, Math.ceil(cw - w0));
    FS.tabX = clamp(FS.tabX, 0, max);
    const on = document.activeElement && tl.contains(document.activeElement) ? document.activeElement.closest(SEL.tabBtn) || document.activeElement : tl.querySelector(SEL.tabOn);
    if (on && !FS.tabUser) {
      const r = on.getBoundingClientRect(), ir = inner.getBoundingClientRect();
      const x0 = r.left - ir.left;
      if (x0 < FS.tabX + 12 || x0 + r.width > FS.tabX + w0 - 12) FS.tabX = clamp(x0 + r.width / 2 - w0 / 2, 0, max);
    }
    if (tl.style.getPropertyValue('--tl-tx') !== (-FS.tabX) + 'px') tl.style.setProperty('--tl-tx', (-FS.tabX) + 'px');
    if (tl.hasAttribute('data-tl-fl') !== FS.tabX > 1) tl.toggleAttribute('data-tl-fl', FS.tabX > 1);
    if (tl.hasAttribute('data-tl-fr') !== FS.tabX < max - 1) tl.toggleAttribute('data-tl-fr', FS.tabX < max - 1);
    tl.__tlmax = max;
  }
  function onTabWheel(e) {
    const tl = e.currentTarget;
    if (!tl.hasAttribute('data-tl-tabs') || !(tl.__tlmax > 0)) return;
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!dx) return;
    e.preventDefault();
    FS.tabUser = true;
    FS.tabX = clamp(FS.tabX + dx, 0, tl.__tlmax);
    tl.setAttribute('data-tl-tabnow', '');
    clearTimeout(tl.__tlT);
    tl.__tlT = setTimeout(() => tl.removeAttribute('data-tl-tabnow'), 160);
    tl.style.setProperty('--tl-tx', (-FS.tabX) + 'px');
    tl.toggleAttribute('data-tl-fl', FS.tabX > 1);
    tl.toggleAttribute('data-tl-fr', FS.tabX < tl.__tlmax - 1);
  }
  /* 大きさが変わった時だけ測り直す（ResizeObserver の中ならレイアウトは済んでいて、読むのが安い） */
  let tabRO = null;
  const TABOBS = new WeakSet();
  function tabsWatch(tl) {
    if (!tl || TABOBS.has(tl) || typeof ResizeObserver !== 'function') return;
    TABOBS.add(tl);
    if (!tabRO) tabRO = new ResizeObserver(() => { try { tabsPass(); } catch (e) { oops('tabs', e); } });
    if (tl.parentElement) tabRO.observe(tl.parentElement);
    if (tl.firstElementChild) tabRO.observe(tl.firstElementChild);
    const tool = tl.nextElementSibling;
    if (tool) tabRO.observe(tool.firstElementChild || tool);
  }
  let tabsRaf = 0;
  function tabsSoon() { if (tabsRaf) return; tabsRaf = requestAnimationFrame(() => { tabsRaf = 0; try { tabsPass(); } catch (e) { oops('tabs', e); } }); }

  /* ============================================================
   *  6. 小さな部品（小窓・お知らせ・吹き出し）
   * ============================================================ */
  function closePop() { const m = document.getElementById('tl-pop'); if (m) m.remove(); }
  function pop(anchor, title, build) {
    closePop();
    const m = mk('div', 'tl-pop tl-ui', null, document.body);
    m.id = 'tl-pop';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-label', title);
    const hd = mk('div', 'tl-pop-h', title, m);
    void hd;
    const bd = mk('div', 'tl-pop-b', null, m);
    for (const ev of ['pointerdown', 'mousedown', 'click', 'keydown']) m.addEventListener(ev, (e) => e.stopPropagation());
    m.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closePop(); try { anchor.focus(); } catch (er) { /* noop */ } } });
    const q = anchor.getBoundingClientRect();
    const w = Math.min(320, innerWidth - 16);
    m.style.width = w + 'px';
    m.style.left = clamp(q.left, 8, innerWidth - w - 8) + 'px';
    m.style.top = Math.min(q.bottom + 6, innerHeight - 180) + 'px';
    m.style.maxHeight = Math.max(180, innerHeight - Math.min(q.bottom + 6, innerHeight - 180) - 12) + 'px';
    const api = {
      body: () => bd,
      close: closePop,
      sec(t) { mk('div', 'tl-pop-s', t, bd); },
      note(t) { mk('div', 'tl-note', t, bd); },
      div() { mk('div', 'tl-pop-d', null, bd); },
      item(label, o) {
        o = o || {};
        const b = mk('button', 'tl-pop-i', null, bd);
        b.type = 'button';
        mk('span', 'l', label, b);
        if (o.hint) mk('span', 'h', o.hint, b);
        b.addEventListener('click', (e) => { e.preventDefault(); const r = o.on && o.on(); if (r !== false) closePop(); });
        return b;
      }
    };
    build(api);
    const first = m.querySelector('button, input, textarea, [tabindex]');
    if (first) setTimeout(() => { try { first.focus({ preventScroll: true }); } catch (e) { /* noop */ } }, 0);
  }
  document.addEventListener('pointerdown', (e) => { const m = document.getElementById('tl-pop'); if (m && !m.contains(e.target) && !(e.target.closest && e.target.closest('.tl-more, .tl-grip, .tl-lensbtn'))) closePop(); }, true);
  let toastT = 0;
  function toast(t) {
    let d = document.getElementById('tl-toast');
    if (!d) { d = mk('div', 'tl-toast tl-ui', null, document.body); d.id = 'tl-toast'; d.setAttribute('role', 'status'); }
    d.textContent = t;
    d.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => d.classList.remove('on'), 2600);
  }
  function tipShow(el, text) {
    let d = document.getElementById('tl-tip');
    if (!d) { d = mk('div', 'tl-tip tl-ui', null, document.body); d.id = 'tl-tip'; d.setAttribute('role', 'tooltip'); }
    d.textContent = text;
    d.hidden = false;
    const r = el.getBoundingClientRect();
    const w = Math.min(300, d.getBoundingClientRect().width || 240);
    d.style.left = clamp(r.left + r.width / 2 - w / 2, 8, innerWidth - w - 8) + 'px';
    d.style.top = (r.bottom + 6 + 40 > innerHeight ? r.top - 40 : r.bottom + 6) + 'px';
  }
  function tipHide() { const d = document.getElementById('tl-tip'); if (d) d.hidden = true; }
  const FACE = '<span class="tl-face" aria-label="ぶり">(\'-\' 鰤)з</span>';
  const ICO = {
    lens: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="6.6"/><circle cx="10" cy="10" r="2.3"/></svg>',
    send: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12.5V3.5M4 7.2 8 3.3l4 3.9"/></svg>',
    x: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>'
  };

  /* ============================================================
   *  7. 焦点（Focus）— B.U.R.I レンズ
   * ============================================================ */
  const LZ = { bar: null, btn: null, ta: null, chips: null, ask: null, live: null, busy: false, ac: null, cur: null, mem: new Map(), pendingAsk: null, team: 0, tok: 0 };
  const lensKey = () => (CTX ? CTX.bid + '|' + (CTX.vid || '') : '');

  function lensBtnEnsure(c) {
    const row = c.tabsRow;
    let b = LZ.btn;
    if (!P.lens || !row) { if (b) b.remove(); return; }
    const s = $(SEL.search, row);
    const tool = row.lastElementChild && row.lastElementChild !== c.tablist ? (row.lastElementChild.firstElementChild || row.lastElementChild) : null;
    if (!s && !tool) { need('search', null); return; }
    if (!b) {
      b = mk('div', 'tl-lensbtn tl-ui');
      b.setAttribute('role', 'button');
      b.setAttribute('contenteditable', 'false');
      b.tabIndex = 0;
      b.setAttribute('aria-expanded', 'false');
      b.innerHTML = ICO.lens + '<span class="tl-sats" aria-hidden="true"></span>';
      let lp = 0, longed = false;
      b.addEventListener('pointerdown', (e) => { e.stopPropagation(); longed = false; clearTimeout(lp); lp = setTimeout(() => { longed = true; presetMenu(b); }, 500); }, true);
      b.addEventListener('pointerup', () => clearTimeout(lp));
      b.addEventListener('pointerleave', () => clearTimeout(lp));
      b.addEventListener('mousedown', (e) => e.stopPropagation(), true);
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (longed) { longed = false; return; } lensToggle(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lensToggle(); } else if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) { e.preventDefault(); presetMenu(b); } });
      b.addEventListener('contextmenu', (e) => { e.preventDefault(); presetMenu(b); });
      LZ.btn = b;
    }
    b.title = 'B.U.R.I レンズ（' + keyLabel() + '）— 長押しでプリセット';
    b.setAttribute('aria-label', 'B.U.R.I レンズ（' + keyLabel() + '）');
    let host = null, ref = null;
    const kids = (el) => { let n = 0; for (const k of el.children) if (k !== b) n++; return n; };
    if (s) {
      let w = s;
      while (w.parentElement && w.parentElement !== row && kids(w.parentElement) === 1 && !w.parentElement.contains(c.tablist)) w = w.parentElement;
      host = w.parentElement; ref = w;
    } else {
      host = tool && tool !== b ? tool : null;
      ref = host && host.firstChild === b ? b.nextSibling : host && host.firstChild;
    }
    if (!host || host === b || b.contains(host)) return;
    if (b.parentElement !== host || b.nextSibling !== ref) { host.insertBefore(b, ref); tabsSoon(); }
    b.classList.toggle('on', !!(LZ.cur && LZ.cur.hits));
  }
  const keyLabel = () => (P.key.ctrl ? (IS_MAC ? '⌃' : 'Ctrl+') : '') + (P.key.alt ? ALT : '') + (P.key.shift ? (IS_MAC ? '⇧' : 'Shift+') : '') + (P.key.meta ? (IS_MAC ? '⌘' : 'Win+') : '') + String(P.key.code || 'KeyL').replace(/^Key|^Digit/, '');

  function lensBarEnsure(c) {
    if (!LZ.bar) {
      const bar = mk('div', 'tl-lens tl-ui');
      bar.setAttribute('role', 'search');
      bar.setAttribute('aria-label', 'B.U.R.I レンズ');
      bar.setAttribute('contenteditable', 'false');
      bar.innerHTML = '<div class="tl-lens-in"><span class="tl-lens-ic">' + ICO.lens + '</span><textarea rows="1" spellcheck="false" aria-label="レンズに話しかける"></textarea>'
        + '<button type="button" class="tl-send" aria-label="ピントを合わせる">' + ICO.send + '</button>'
        + '<button type="button" class="tl-mapb" hidden>✦ 星図</button>'
        + '<button type="button" class="tl-x" aria-label="レンズを解除">' + ICO.x + '</button></div>'
        + '<div class="tl-hint"></div><div class="tl-ask" hidden></div><div class="tl-chips" role="list" aria-label="レンズの条件"></div><div class="tl-sr tl-live" aria-live="polite"></div>';
      for (const ev of ['pointerdown', 'mousedown', 'click', 'keydown', 'keyup', 'input', 'paste', 'copy', 'cut']) bar.addEventListener(ev, (e) => e.stopPropagation());
      LZ.bar = bar;
      LZ.ta = bar.querySelector('textarea');
      LZ.chips = bar.querySelector('.tl-chips');
      LZ.ask = bar.querySelector('.tl-ask');
      LZ.live = bar.querySelector('.tl-live');
      bar.querySelector('.tl-hint').textContent = MOD + '↵ でピントを合わせる · ↵ で改行 · esc 解除';
      bar.querySelector('.tl-send').title = '送信 ' + MOD + '↵';
      bar.querySelector('.tl-send').addEventListener('click', (e) => { e.preventDefault(); lensSend(); });
      bar.querySelector('.tl-x').addEventListener('click', (e) => { e.preventDefault(); lensRelease(); lensClose(); });
      bar.querySelector('.tl-mapb').addEventListener('click', (e) => { e.preventDefault(); MAP.on ? mapExit() : mapEnter(); });
      const ta = LZ.ta;
      let composing = false, compEnd = 0;
      ta.addEventListener('compositionstart', () => { composing = true; });
      ta.addEventListener('compositionend', () => { composing = false; compEnd = performance.now(); });
      ta.addEventListener('keydown', (e) => {
        if (e.isComposing || composing || e.keyCode === 229 || performance.now() - compEnd < 40) return;
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); lensSend(); return; }
        if (e.key === 'Escape') { e.preventDefault(); lensEsc(); return; }
        if (e.key === 'ArrowUp' && !ta.value && CTX && CTX.db && LAST[CTX.db.cid]) { e.preventDefault(); ta.value = LAST[CTX.db.cid]; lensGrow(); }
      });
      ta.addEventListener('input', lensGrow);
    }
    LZ.ta.placeholder = NICK + '、どの星を探す？';
    LZ.bar.querySelector('.tl-mapb').hidden = !P.map;
    LZ.bar.querySelector('.tl-mapb').textContent = MAP.on ? '☰ 表' : '✦ 星図';
    const row = c.tabsRow;
    if (row && row.parentElement && (LZ.bar.parentElement !== row.parentElement || LZ.bar.previousSibling !== row)) row.parentElement.insertBefore(LZ.bar, row.nextSibling);
  }
  function lensGrow() {
    const ta = LZ.ta;
    if (!ta) return;
    ta.style.height = 'auto';
    const lh = parseFloat(getComputedStyle(ta).lineHeight) || 21;
    ta.style.height = Math.min(ta.scrollHeight, lh * 4 + 6) + 'px';
  }
  function lensOpen(focus) {
    if (!CTX || !P.lens) return;
    lensBarEnsure(CTX);
    LZ.bar.classList.add('open');
    if (!calm()) { LZ.bar.classList.remove('grow'); void LZ.bar.offsetWidth; LZ.bar.classList.add('grow'); }
    if (LZ.btn) LZ.btn.setAttribute('aria-expanded', 'true');
    lensGrow();
    if (focus) setTimeout(() => { try { LZ.ta.focus({ preventScroll: true }); } catch (e) { /* noop */ } }, 0);
    tabsSoon(); fieldSoon();
  }
  function lensClose() {
    if (LZ.bar) LZ.bar.classList.remove('open');
    if (LZ.btn) { LZ.btn.setAttribute('aria-expanded', 'false'); try { LZ.btn.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
    fieldSoon();
  }
  function lensToggle() { if (LZ.bar && LZ.bar.classList.contains('open')) { if (document.activeElement === LZ.ta) lensClose(); else LZ.ta.focus(); } else lensOpen(true); }
  function lensEsc() {
    if (LZ.busy) { lensAbort(); lensBusy(false); return; }
    if (LZ.cur) { lensRelease(); return; }
    lensClose();
  }
  function shake(el) { if (!el || calm()) return; el.classList.remove('tl-shake'); void el.offsetWidth; el.classList.add('tl-shake'); }
  function lensSend() {
    const t = (LZ.ta.value || '').trim();
    if (!t) { shake(LZ.bar.querySelector('.tl-send')); return; }
    if (!CTX || !CTX.db) return;
    let text = t;
    if (LZ.pendingAsk) { text = LZ.pendingAsk.text + '\n（B.U.R.I の確認「' + LZ.pendingAsk.ask + '」への答え）' + t; LZ.pendingAsk = null; }
    LAST[CTX.db.cid] = t; save(LS.last, LAST);
    lensRun(text);
  }
  function lensAbort() { if (LZ.ac) { try { LZ.ac.abort(); } catch (e) { /* noop */ } } LZ.ac = null; LZ.tok++; }
  function lensBusy(on, n) {
    LZ.busy = on;
    const b = LZ.btn;
    if (LZ.bar) LZ.bar.classList.toggle('busy', on);
    if (!b) return;
    const sats = b.querySelector('.tl-sats');
    if (on) {
      b.classList.add('busy');
      sats.classList.remove('gather');
      sats.innerHTML = Array.from({ length: Math.max(1, n || 1) }, (_, i) => '<i style="--i:' + i + ';--n:' + Math.max(1, n || 1) + '"></i>').join('');
    } else if (b.classList.contains('busy')) {
      b.classList.remove('busy');
      sats.classList.add('gather');
      setTimeout(() => { if (!LZ.busy) { sats.innerHTML = ''; sats.classList.remove('gather'); } }, calm() ? 0 : 420);
    }
  }

  /* 文 → 条件（B.U.R.I）。確実な条件 conds・意味の条件 semantic・並べ替え sort・確認 ask */
  const PLAN_SYS = [
    'あなたは B.U.R.I の「レンズ」です。Notion のデータベースに向かって話しかけられた一文を、行を絞り込む条件に変えます。',
    '出力は JSON だけ: {"conds":[{"prop":"プロパティ名","op":"is|is_not|contains|not_contains|empty|not_empty|gt|gte|lt|lte|before|after|on","value":"値"}],"semantic":"","sort":null,"ask":""}',
    '・conds は「確実な条件」。prop は一覧にある名前をそのまま書く。選択肢があれば選択肢の表記に合わせる。リレーションは相手のページ名を value にする（op は contains）。',
    '・「雰囲気が似ている」「切ない話」「〇〇っぽい」のように、プロパティでは表せず中身を読まないと決められない部分だけを semantic に短く書く（なければ空）。',
    '・並べ替え（「多い順」「新しい順」など）を求められたら sort に {"prop":"名前","dir":"asc|desc"} を入れる。並べ替えだけなら conds は空でよい。',
    '・意味があいまいで、どのプロパティのことか決められない時だけ、ask に利用者への確認を一文で書く（例:「『最近の』は、追加日と公開日のどちらのこと？」）。それ以外は ask は空。',
    '・説明・前置き・コードの囲みは書かない。'
  ].join('\n');
  async function planAI(text, c) {
    const sch = c.db.schema;
    const lines = [];
    for (const [pid, d] of Object.entries(sch)) {
      let s = '- ' + d.name + '（' + (TYPE_JA[d.type] || d.type) + (pid === 'title' ? '・題名' : '');
      if (d.type === 'relation' && d.collection_id) s += ' → ' + (c.db.relName[d.collection_id] || '別の DB');
      s += '）';
      const opts = (d.options || []).map((o) => o.value).filter(Boolean);
      if (opts.length) s += ' 選択肢: ' + opts.slice(0, 30).join(' / ');
      lines.push(s);
    }
    const user = '# データベース: ' + (c.db.name || '(無題)') + '（ビュー: ' + (plain(c.view && c.view.name) || (c.view && c.view.name) || '') + '）\n# プロパティ\n' + lines.join('\n') + '\n\n# 話しかけられた一文\n' + text;
    const r = await neb('quick', { sys: PLAN_SYS, user, max: 700, raw: true }, 60000);
    if (!r || !r.text) return null;
    const m = /\{[\s\S]*\}/.exec(String(r.text).replace(/```(?:json)?/g, ''));
    if (!m) return null;
    try {
      const j = JSON.parse(m[0]);
      return { conds: Array.isArray(j.conds) ? j.conds.filter((x) => x && x.prop).map((x) => ({ prop: String(x.prop), op: String(x.op || 'contains'), value: Array.isArray(x.value) ? x.value.map(String) : x.value == null ? '' : String(x.value) })) : [], semantic: String(j.semantic || '').trim(), sort: j.sort && j.sort.prop ? { prop: String(j.sort.prop), dir: /desc/i.test(j.sort.dir) ? 'desc' : 'asc' } : null, ask: String(j.ask || '').trim(), by: r.name || '' };
    } catch (e) { return null; }
  }
  /* AI がつながっていない時の「ことばのレンズ」: 言葉を各列の値に照らす */
  const STOP = /^(の|と|が|を|に|で|は|も|や|へ|から|まで|より|作品|もの|こと|やつ|探して|さがして|見せて|みせて|教えて|おしえて|一覧|全部|ぜんぶ|ある|いる|ください|下さい|たい|ほしい|欲しい|について|関連|っぽい|みたいな|ような)$/;
  function planLocal(text, c, ids) {
    /* ひらがなの並び（助詞・語尾）と記号で区切り、漢字・カタカナ・英数の語だけを残す */
    const toks = String(text).normalize('NFKC').split(/[\p{Script=Hiragana}\s、。,.!?「」『』()\[\]"'“”‘’・:：/]+/u)
      .map((s) => s.replace(/(シリーズ|作品|系|関連|特集|一覧)$/u, '').trim())
      .filter((s) => s && (s.length >= 2 || /[A-Za-z0-9]/.test(s)) && !STOP.test(s));
    const conds = [];
    const sch = c.db.schema;
    for (const tk of toks.slice(0, 6)) {
      const want = fold(tk);
      if (!want) continue;
      let best = null, bestN = 0;
      for (const [pid, d] of Object.entries(sch)) {
        let n = 0;
        for (const id of ids) { const r = rec('block', id); if (r && fold(cellVal(r, pid, d).t).includes(want)) n++; }
        if (n > bestN) { bestN = n; best = d.name; }
      }
      conds.push({ prop: best || '*', op: 'contains', value: tk });
    }
    return { conds, semantic: '', sort: null, ask: '', local: true };
  }
  function propOf(c, name) {
    if (name === '*') return '*';
    const sch = c.db.schema;
    const n = norm(name), f = fold(name);
    for (const [pid, d] of Object.entries(sch)) if (norm(d.name) === n) return pid;
    for (const [pid, d] of Object.entries(sch)) if (fold(d.name) === f) return pid;
    for (const [pid, d] of Object.entries(sch)) if (f && (fold(d.name).includes(f) || f.includes(fold(d.name)))) return pid;
    return null;
  }
  const dnorm = (s) => { const m = /(\d{4})(?:[-/年.](\d{1,2}))?(?:[-/月.](\d{1,2}))?/.exec(String(s || '')); return m ? m[1] + (m[2] ? '-' + m[2].padStart(2, '0') : '') + (m[3] ? '-' + m[3].padStart(2, '0') : '') : ''; };
  function condTest(cond, v, type) {
    const op = cond.op || 'contains';
    if (op === 'empty') return !v.t && !(v.list && v.list.length) && v.n == null && !v.d && !v.b;
    if (op === 'not_empty') return !condTest({ op: 'empty' }, v, type);
    const vals = Array.isArray(cond.value) ? cond.value : [cond.value];
    const one = (raw) => {
      if (v.n != null && /^(gt|gte|lt|lte|is|is_not|eq)$/.test(op) && isFinite(parseFloat(raw))) {
        const x = parseFloat(raw);
        return op === 'gt' ? v.n > x : op === 'gte' ? v.n >= x : op === 'lt' ? v.n < x : op === 'lte' ? v.n <= x : op === 'is_not' ? v.n !== x : v.n === x;
      }
      if (v.d && /^(before|after|on|gt|gte|lt|lte|is)$/.test(op)) {
        const x = dnorm(raw);
        if (x) { const d = v.d.slice(0, x.length); return op === 'before' || op === 'lt' ? d < x : op === 'after' || op === 'gt' ? d > x : op === 'gte' ? d >= x : op === 'lte' ? d <= x : d === x; }
      }
      if (type === 'checkbox') { const yes = /^(true|yes|はい|済|✓|on|1|チェック|あり)/i.test(String(raw)); return op === 'is_not' ? v.b !== yes : !!v.b === yes; }
      const want = fold(raw);
      if (!want) return true;
      const items = (v.list && v.list.length ? v.list : [v.t]).map(fold);
      const hit = /^is/.test(op) ? items.some((x) => x === want || (want.length >= 2 && x.includes(want))) : items.join(' ').includes(want);
      return /not/.test(op) ? !hit : hit;
    };
    return /not/.test(op) ? vals.every(one) : vals.some(one);
  }
  function evalConds(c, conds, ids) {
    const sch = c.db.schema;
    const use = conds.map((x) => ({ x, pid: propOf(c, x.prop) })).filter((y) => y.pid && !y.x.off);
    for (const y of use) { const d = sch[y.pid]; y.x.na = !!(d && (d.type === 'formula' || d.type === 'rollup')); }
    return ids.filter((id) => {
      const r = rec('block', id);
      if (!r) return false;
      return use.every((y) => {
        if (y.x.na) return true;
        if (y.pid === '*') return Object.entries(sch).some(([pid, d]) => condTest(Object.assign({}, y.x, { op: 'contains' }), cellVal(r, pid, d), d.type));
        const d = sch[y.pid];
        return condTest(y.x, cellVal(r, y.pid, d), d.type);
      });
    });
  }
  /* 意味の条件: 表題・長文・本文の冒頭を読ませて、当てはまる行と理由（MoA なら多数決） */
  const JUDGE_SYS = (sem) => [
    'あなたは B.U.R.I の目利きです。データベースの行の一覧から、条件「' + sem + '」に当てはまる行だけを選びます。',
    '出力は JSON だけ: {"hits":[{"i":行の番号,"why":"そう判断した理由を日本語で 1 行（30 字以内）"}]}',
    '・当てはまらない行は入れない。迷う行は入れない。理由は具体的に（例:「天才と常識人のコンビが謎を解く構成が近い」）。'
  ].join('\n');
  async function judge(c, sem, ids, team, tok) {
    ids = ids.slice(0, 200);
    const sch = c.db.schema;
    const longPids = FS.cols.filter((x) => x.long).map((x) => x.pid).filter((p) => sch[p]);
    if (!longPids.length) for (const [pid, d] of Object.entries(sch)) if (d.type === 'text') { longPids.push(pid); break; }
    const hd = await heads(ids).catch(() => new Map());
    if (tok !== LZ.tok) return null;
    const line = (id, i) => {
      const r = rec('block', id) || {};
      const lt = longPids.map((p) => cellVal(r, p, sch[p]).t).filter(Boolean).join(' ').slice(0, 140);
      return (i + 1) + '. ' + (titleOf(r) || '(無題)') + (lt ? ' ／ ' + lt : '') + (hd.get(id) ? ' ／ 本文: ' + hd.get(id).slice(0, 100) : '');
    };
    const chunks = [];
    for (let i = 0; i < ids.length; i += 60) chunks.push(ids.slice(i, i + 60));
    const out = new Map();
    const one = async (chunk, base) => {
      const user = '# 条件\n' + sem + '\n\n# 行の一覧（番号. 題名 ／ 長文 ／ 本文の冒頭）\n' + chunk.map((id, i) => line(id, base + i)).join('\n');
      const parse = (t) => { const m = /\{[\s\S]*\}/.exec(String(t || '').replace(/```(?:json)?/g, '')); if (!m) return []; try { const j = JSON.parse(m[0]); return Array.isArray(j.hits) ? j.hits : []; } catch (e) { return []; } };
      if (team >= 2 && ids.length <= 60) {
        const r = await neb('multi', { sys: JUDGE_SYS(sem), user, max: 1400, n: Math.min(3, team) }, 120000);
        const lists = ((r && r.list) || []).filter((x) => x.text).map((x) => parse(x.text));
        const need2 = lists.length >= 2 ? Math.ceil(lists.length / 2) : 1;
        const votes = new Map();
        for (const L of lists) for (const h of L) { const k = +h.i; if (!k) continue; const o = votes.get(k) || { n: 0, why: '' }; o.n++; if (!o.why && h.why) o.why = String(h.why); votes.set(k, o); }
        for (const [k, o] of votes) if (o.n >= need2 && ids[k - 1]) out.set(ids[k - 1], o.why || '意味が近い');
      } else {
        const r = await neb('quick', { sys: JUDGE_SYS(sem), user, max: 1400, raw: true }, 90000);
        for (const h of parse(r && r.text)) { const k = +h.i; if (k && ids[k - 1]) out.set(ids[k - 1], String(h.why || '意味が近い')); }
      }
    };
    for (let i = 0; i < chunks.length; i += 2) {
      await Promise.all(chunks.slice(i, i + 2).map((ch, j) => one(ch, (i + j) * 60)));
      if (tok !== LZ.tok) return null;
    }
    return out;
  }
  function rankOf(c, sort, ids) {
    const pid = propOf(c, sort.prop);
    if (!pid || pid === '*') return null;
    const d = c.db.schema[pid];
    const key = (id) => { const v = cellVal(rec('block', id) || {}, pid, d); return v.n != null ? v.n : v.d || fold(v.t); };
    const s = ids.slice().sort((a, b) => { const x = key(a), y = key(b); const r = x === y ? 0 : x == null || x === '' ? 1 : y == null || y === '' ? -1 : x < y ? -1 : 1; return sort.dir === 'desc' ? -r : r; });
    return new Map(s.map((id, i) => [id, i + 1]));
  }

  async function lensRun(text, preset) {
    const c = CTX;
    if (!c || !c.db) return;
    lensAbort();
    const ac = new AbortController();
    LZ.ac = ac;
    const tok = LZ.tok;
    ST.lens++;
    lensAskShow('');
    const rowsP = queryAll(c.db, c.view, ac.signal).then(async (ids) => { await relLoad(c, ids); return ids; });
    const st = await nebStatus();
    LZ.team = st.aiOn ? Math.max(1, st.team || 1) : 0;
    lensBusy(true, LZ.team || 1);
    try {
      let plan = preset ? JSON.parse(JSON.stringify(preset)) : null;
      if (!plan && st.aiOn) plan = await planAI(text, c);
      if (tok !== LZ.tok) return;
      const ids = await rowsP;
      if (tok !== LZ.tok) return;
      if (!plan) plan = planLocal(text, c, ids);
      if (plan.ask && !(plan.conds || []).length && !plan.semantic) {
        LZ.pendingAsk = { text, ask: plan.ask };
        lensAskShow(plan.ask, true);
        lensBusy(false);
        return;
      }
      const state = { text, plan, total: ids.length, order: ids, hits: null, ranks: null, key: lensKey(), cid: c.db.cid };
      await lensEval(state, tok);
    } catch (e) {
      if (!ac.signal.aborted) { oops('lens', e); lensAskShow('うまく読めなかったよ。もう一度ためしてね。'); }
    } finally {
      if (tok === LZ.tok) lensBusy(false);
    }
  }
  async function relLoad(c, ids) {
    const rels = Object.entries(c.db.schema).filter(([, d]) => d.type === 'relation').map(([p]) => p);
    if (!rels.length) return;
    const tg = new Set();
    for (const id of ids) { const r = rec('block', id); if (!r) continue; for (const p of rels) for (const x of relIds((r.properties || {})[p])) tg.add(x); }
    if (tg.size) await records('block', [...tg]).catch(() => null);
  }
  /* 条件で数え直す（チップの × や書き直しの時も、ここから） */
  async function lensEval(state, tok) {
    const c = CTX;
    if (!c || !c.db) return;
    if (tok == null) { lensAbort(); tok = LZ.tok; }
    const plan = state.plan;
    const active = (plan.conds || []).filter((x) => !x.off);
    let ids = active.length ? evalConds(c, active, state.order) : state.order.slice();
    let why = new Map();
    if (plan.semantic && !plan.semOff) {
      if (state.sem && state.semFor === plan.semantic) why = state.sem;
      else if (LZ.team) {
        lensBusy(true, Math.min(3, LZ.team));
        const got = await judge(c, plan.semantic, ids, LZ.team, tok);
        if (tok !== LZ.tok || !got) return;
        why = got; state.sem = got; state.semFor = plan.semantic;
      }
      if (why.size || LZ.team) ids = ids.filter((id) => why.has(id));
    }
    state.ranks = plan.sort ? rankOf(c, plan.sort, ids) : null;
    const hits = new Map();
    for (const id of ids) hits.set(id, { why: why.get(id) || '', rank: state.ranks ? state.ranks.get(id) : 0 });
    state.hits = hits;
    LZ.cur = state;
    LZ.mem.set(state.key, state);
    lensRecallCols(c, plan);
    lensPaint(true);
    tintLens(state);
    const msg = state.total + '件中' + hits.size + '件にピントを合わせました';
    if (LZ.live) LZ.live.textContent = msg;
    if (plan.sort) lensAskShow('順位の小さな数字を付けたよ。並べ替えは Notion の並べ替えをお使いください。');
    else if (plan.local && LZ.team === 0) lensAskShow('AI がつながっていないので、言葉を各列の値に照らしたよ（' + FACE + ' の ⚙ で鍵を入れると、意味でも探せる）。', false, true);
    else lensAskShow('');
  }
  function lensAskShow(t, isQ, html) {
    const a = LZ.ask;
    if (!a) return;
    if (!t) { a.hidden = true; a.textContent = ''; return; }
    a.hidden = false;
    a.classList.toggle('q', !!isQ);
    if (html) a.innerHTML = t; else { a.innerHTML = isQ ? FACE + ' ' : ''; a.append(t); }
  }
  function lensRecallCols(c, plan) {
    const s = new Set();
    for (const x of (plan.conds || [])) { if (x.off) continue; const pid = propOf(c, x.prop); if (pid && pid !== '*') s.add(pid); }
    if (plan.sort) { const pid = propOf(c, plan.sort.prop); if (pid && pid !== '*') s.add(pid); }
    const k = [...s].sort().join();
    if (k !== [...FS.lensRecall].sort().join()) { FS.lensRecall = s; fieldSoon(); }
  }
  function lensRelease() {
    lensAbort();
    lensBusy(false);
    const was = LZ.cur;
    LZ.cur = null;
    if (was) LZ.mem.delete(was.key);
    LZ.pendingAsk = null;
    lensAskShow('');
    if (FS.lensRecall.size) { FS.lensRecall = new Set(); fieldSoon(); }
    if (was && !calm() && CTX) {
      const items = visItems().reverse();
      items.forEach((it, i) => it.style.setProperty('--tl-d', (i * 30) + 'ms'));
      de.setAttribute('data-tl-lensout', '');
      setTimeout(() => { de.removeAttribute('data-tl-lensout'); for (const it of items) it.style.removeProperty('--tl-d'); }, items.length * 30 + 420);
    }
    lensPaint(false);
    if (LZ.live && was) LZ.live.textContent = 'レンズを解除しました';
  }
  const visItems = () => {
    if (!CTX) return [];
    const out = [];
    for (const t of CTX.tables) for (const it of t.querySelectorAll(SEL.item)) { const r = it.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) out.push([r.top, it]); }
    return out.sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  };

  /* ピントの表現: 合わない行を 28%・彩度を落とす（ぼかしは使わない）。合う行は左に 2px の線 */
  function lensCss() {
    const c = CTX, st = LZ.cur;
    if (!c || !st || !st.hits || st.key !== lensKey()) { setCss('tl-lens-css', ''); de.removeAttribute('data-tl-lens'); return false; }
    const S = scopeOf(c.key);
    const ids = [...st.hits.keys()];
    const list = ids.length ? ids.map((id) => '[data-block-id="' + cssStr(id) + '"]').join(',') : '[data-tl-none]';
    let css = scopeOf(c.key, ':is([data-tl-lens], [data-tl-lensout])') + ' ' + SEL.item + ' { transition: opacity .3s ease, filter .3s ease; transition-delay: var(--tl-d, 0ms); }\n';
    css += scopeOf(c.key, '[data-tl-lens="1"]') + ' ' + SEL.item + ':not(:is(' + list + ')) { opacity: .28; filter: saturate(.18); }\n';
    css += scopeOf(c.key, '[data-tl-lens="all"]') + ' ' + SEL.item + ' { opacity: .28; filter: saturate(.18); transition-duration: .12s; transition-delay: 0ms; }\n';
    if (FS.titleCi >= 0) css += scopeOf(c.key, '[data-tl-lens="1"]') + ' ' + SEL.item + ':is(' + list + ') ' + SEL.cell + '[data-col-index="' + FS.titleCi + '"] { box-shadow: inset 2px 0 0 var(--tl-line, var(--tl-acc)); transition: box-shadow 1.2s ease; }\n';
    if (P.tint && st.tints) for (const [id, col] of st.tints) if (col && st.hits.has(id)) css += S + ' ' + SEL.item + '[data-block-id="' + cssStr(id) + '"] { --tl-line: ' + tune(col, 'line') + '; }\n';
    setCss('tl-lens-css', css);
    return true;
  }
  let wakeT = 0;
  function lensPaint(wake) {
    clearTimeout(wakeT);
    const on = lensCss();
    if (!on) { lensChips(); rowSoon(); fadeSoon(); if (LZ.btn) LZ.btn.classList.remove('on'); mapLens(); return; }
    if (LZ.btn) LZ.btn.classList.add('on');
    if (wake && !calm()) {
      de.setAttribute('data-tl-lens', 'all');
      wakeT = setTimeout(() => {
        const hits = LZ.cur && LZ.cur.hits;
        const items = visItems().filter((it) => hits && hits.has(it.getAttribute('data-block-id')));
        items.forEach((it, i) => it.style.setProperty('--tl-d', (i * 40) + 'ms'));
        de.setAttribute('data-tl-lens', '1');
        setTimeout(() => { for (const it of items) it.style.removeProperty('--tl-d'); }, items.length * 40 + 420);
      }, 140);
    } else de.setAttribute('data-tl-lens', '1');
    lensChips();
    rowSoon();
    fadeSoon();
    mapLens();
  }
  /* 表題の右の ✦（意味で選んだ行・理由は乗せると）と、並べ替えの順位 */
  function lensTags(it, id, tcol) {
    const st = LZ.cur;
    const h = st && st.hits && st.key === lensKey() ? st.hits.get(id) : null;
    let el = tcol.querySelector(':scope > .tl-tags');
    if (!h || (!h.why && !h.rank)) { if (el) el.remove(); return; }
    const sig = (h.rank || '') + '|' + (h.why || '');
    if (!el) { el = mk('span', 'tl-tags'); el.setAttribute('contenteditable', 'false'); }
    const fv = tcol.querySelector(':scope > .tl-fv');
    if (el.parentElement !== tcol || (fv ? el.nextSibling !== fv : el.nextSibling)) tcol.insertBefore(el, fv || null);
    if (el.__sig === sig) return;
    el.__sig = sig;
    el.innerHTML = (h.rank ? '<b class="tl-rank" aria-label="' + h.rank + '位">' + h.rank + '</b>' : '') + (h.why ? '<span class="tl-star" tabindex="0" role="note" aria-label="意味で選んだ理由: ' + esc(h.why) + '">✦</span>' : '');
    const s = el.querySelector('.tl-star');
    if (s) s.__why = h.why;
  }
  document.addEventListener('pointerover', (e) => { const s = e.target.closest && e.target.closest('.tl-star, .tl-mstar'); if (s && s.__why) tipShow(s, s.__why); else if (!(e.target.closest && e.target.closest('#tl-tip'))) tipHide(); }, true);
  document.addEventListener('focusin', (e) => { const s = e.target.closest && e.target.closest('.tl-star'); if (s && s.__why) tipShow(s, s.__why); }, true);

  /* 条件のチップ（× で外す・押して直す）と「12 / 48」・☆ */
  const OPS = { is: '=', contains: '=', is_not: '≠', not_contains: '≠', gt: '>', gte: '≥', lt: '<', lte: '≤', before: '<', after: '>', on: '=' };
  function condLabel(x) {
    const v = Array.isArray(x.value) ? x.value.join(' / ') : x.value;
    if (x.op === 'empty') return x.prop + ' が空';
    if (x.op === 'not_empty') return x.prop + ' が空でない';
    return (x.prop === '*' ? '言葉' : x.prop) + ' ' + (OPS[x.op] || '=') + ' ' + v;
  }
  function lensChips() {
    const box = LZ.chips;
    if (!box) return;
    box.textContent = '';
    const st = LZ.cur;
    if (!st || !st.hits || st.key !== lensKey()) return;
    const plan = st.plan;
    const chip = (label, kind, onEdit, onX, title) => {
      const g = mk('span', 'tl-c' + (kind ? ' ' + kind : ''), null, box);
      g.setAttribute('role', 'listitem');
      const b = mk('button', 'tl-c-v', label, g);
      b.type = 'button';
      if (title) b.title = title;
      if (onEdit) b.addEventListener('click', (e) => { e.preventDefault(); chipEdit(g, b, onEdit); });
      const x = mk('button', 'tl-c-x', '×', g);
      x.type = 'button';
      x.setAttribute('aria-label', label + ' を外す');
      x.addEventListener('click', (e) => { e.preventDefault(); onX(); });
    };
    (plan.conds || []).forEach((x) => {
      if (x.off) return;
      const na = x.na ? 'この列は計算の値（数式・ロールアップ）なので、レンズでは読めません' : '';
      chip(condLabel(x), x.na ? 'na' : '', (v) => { x.value = v; lensEval(st); }, () => { x.off = true; lensEval(st); }, na);
    });
    if (plan.semantic && !plan.semOff) chip('✦ ' + plan.semantic, 'sem', (v) => { plan.semantic = v; st.sem = null; lensEval(st); }, () => { plan.semOff = true; lensEval(st); }, '意味の条件（B.U.R.I が中身を読んで判定）');
    if (plan.sort) chip('↕ ' + plan.sort.prop + (plan.sort.dir === 'desc' ? ' 大きい順' : ' 小さい順'), 'sort', null, () => { plan.sort = null; lensEval(st); });
    const star = mk('button', 'tl-star-b', '☆', box);
    star.type = 'button';
    star.title = 'この条件をプリセットに入れる';
    star.setAttribute('aria-label', 'プリセットに保存');
    star.addEventListener('click', (e) => { e.preventDefault(); presetSave(st); star.textContent = '★'; });
    const n = mk('span', 'tl-count', st.hits.size + ' / ' + st.total, box);
    n.title = st.total + '件中' + st.hits.size + '件';
  }
  function chipEdit(g, b, commit) {
    const cur = b.textContent.replace(/^✦\s*/, '').replace(/^.*?\s[=≠><≤≥]\s/, '');
    const inp = mk('input', 'tl-c-in');
    inp.value = cur;
    inp.setAttribute('aria-label', '条件の値を直す（' + MOD + '↵ で決定・esc で取り消し）');
    g.replaceChild(inp, b);
    inp.focus(); inp.select();
    let done = false;
    let comp = false;
    inp.addEventListener('compositionstart', () => { comp = true; });
    inp.addEventListener('compositionend', () => { comp = false; });
    const fin = (ok) => { if (done) return; done = true; if (ok && inp.value.trim() && inp.value.trim() !== cur) commit(inp.value.trim()); else lensChips(); };
    inp.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.isComposing || comp || e.keyCode === 229) return;
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); fin(true); }
      else if (e.key === 'Escape') { e.preventDefault(); fin(false); }
    });
    inp.addEventListener('blur', () => fin(true));
  }
  function presetSave(st) {
    if (!st || !CTX || !CTX.db) return;
    const list = PRESETS[st.cid] || (PRESETS[st.cid] = []);
    const name = st.text.split('\n')[0].slice(0, 24);
    const plan = JSON.parse(JSON.stringify(st.plan));
    const i = list.findIndex((p) => p.name === name);
    if (i >= 0) list.splice(i, 1);
    list.unshift({ name, text: st.text, plan });
    if (list.length > 20) list.length = 20;
    save(LS.presets, PRESETS);
    toast('レンズのプリセットに入れました（◎ を長押しで一覧）');
  }
  function presetMenu(anchor) {
    const cid = CTX && CTX.db && CTX.db.cid;
    pop(anchor, 'B.U.R.I レンズ', (api) => {
      const list = (cid && PRESETS[cid]) || [];
      api.sec('プリセット');
      if (!list.length) api.note('レンズの条件の右の ☆ で、よく使う条件をここに入れられます。');
      for (const p of list) {
        const b = api.item(p.name, { hint: '', on: () => { lensOpen(false); if (LZ.ta) { LZ.ta.value = p.text; lensGrow(); } lensRun(p.text, p.plan); return true; } });
        const del = mk('span', 'tl-pop-del', '×', b);
        del.title = '消す';
        del.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const i = list.indexOf(p); if (i >= 0) list.splice(i, 1); save(LS.presets, PRESETS); b.remove(); });
      }
      api.div();
      if (LZ.cur) api.item('レンズを解除', { on: () => { lensRelease(); return true; } });
      if (P.map) api.item(MAP.on ? '☰ 表に戻る' : '✦ 星図で見る', { on: () => { MAP.on ? mapExit() : mapEnter(); return true; } });
      api.item('Telescopium の設定…', { on: () => { setTimeout(() => pop(anchor, 'Telescopium の設定', (a2) => settingsInto(a2.body())), 0); return true; } });
    });
  }

  /* 右端の目盛り（画面の外の合う行の位置）・⌥↓ / ⌥↑ */
  function hitYs() {
    const c = CTX, st = LZ.cur;
    if (!c || !c.scroller || !st || !st.hits) return [];
    const sc = c.scroller;
    const sr = sc.getBoundingClientRect(), tr = c.table.getBoundingClientRect();
    const top = tr.top - sr.top + sc.scrollTop, H = tr.height;
    const N = st.order.length || 1;
    const pos = new Map(st.order.map((id, i) => [id, i]));
    const out = [];
    for (const id of st.hits.keys()) {
      const it = c.table.querySelector(SEL.item + '[data-block-id="' + cssStr(id) + '"]');
      const y = it ? it.getBoundingClientRect().top - sr.top + sc.scrollTop : top + 36 + (H - 36) * ((pos.get(id) || 0) + 0.5) / N;
      out.push([id, y]);
    }
    return out.sort((a, b) => a[1] - b[1]);
  }
  function ticksPass() {
    const c = CTX, st = LZ.cur;
    let tk = document.getElementById('tl-ticks');
    if (!c || !c.scroller || !st || !st.hits || !st.hits.size || MAP.on || st.key !== lensKey()) { if (tk) tk.hidden = true; return; }
    if (!tk) {
      tk = mk('div', 'tl-ticks tl-ui', null, document.body);
      tk.id = 'tl-ticks';
      tk.setAttribute('aria-hidden', 'true');
      tk.addEventListener('click', (e) => { const i = e.target.closest('i[data-id]'); if (i) lensGo(i.getAttribute('data-id')); });
    }
    const sc = c.scroller, sr = sc.getBoundingClientRect();
    tk.hidden = false;
    Object.assign(tk.style, { left: (sr.left + sc.clientWidth - 10) + 'px', top: sr.top + 'px', height: sc.clientHeight + 'px' });
    const H = Math.max(1, sc.scrollHeight);
    const ys = hitYs();
    const sig = H + '|' + ys.map((x) => x[0].slice(0, 6) + Math.round(x[1] / 8)).join();
    if (tk.__sig === sig) return;
    tk.__sig = sig;
    tk.innerHTML = ys.map(([id, y]) => '<i data-id="' + esc(id) + '" style="top:' + (clamp(y / H, 0, 1) * 100).toFixed(2) + '%"></i>').join('');
  }
  function lensGo(id) {
    const c = CTX;
    if (!c || !c.scroller) return;
    const y = (hitYs().find((x) => x[0] === id) || [])[1];
    if (y == null) return;
    c.scroller.scrollTo({ top: Math.max(0, y - c.scroller.clientHeight * 0.35), behavior: calm() ? 'auto' : 'smooth' });
    let n = 0;
    const look = () => {
      const it = c.table.querySelector(SEL.item + '[data-block-id="' + cssStr(id) + '"]');
      if (it && Math.abs(it.getBoundingClientRect().top - (c.scroller.getBoundingClientRect().top + c.scroller.clientHeight * 0.35)) < c.scroller.clientHeight * 0.5) { flashRow(it); return; }
      if (++n < 24) setTimeout(look, 60);
    };
    setTimeout(look, calm() ? 30 : 260);
  }
  function lensStep(dir) {
    const c = CTX;
    if (!c || !c.scroller || !LZ.cur) return false;
    const ys = hitYs();
    if (!ys.length) return false;
    const now = c.scroller.scrollTop + c.scroller.clientHeight * 0.35;
    const t = dir > 0 ? ys.find((x) => x[1] > now + 8) || ys[0] : ys.slice().reverse().find((x) => x[1] < now - 8) || ys[ys.length - 1];
    lensGo(t[0]);
    return true;
  }
  function flashRow(it) {
    if (!it || !it.isConnected) return;
    const r = it.getBoundingClientRect();
    const d = mk('div', 'tl-flash tl-ui', null, document.body);
    Object.assign(d.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    setTimeout(() => d.remove(), calm() ? 600 : 700);
  }

  /* ============================================================
   *  8. 色（Tint）— 表紙の主な色を 1 つ（星 1 つの色）
   * ============================================================ */
  const COVER_RE = /cover|表紙|カバー|ポスター|poster|画像|image|img|thumb|サムネ|ジャケ|写真|photo|picture|art/i;
  function coverOf(r, schema) {
    const f = r.format || {};
    if (f.page_cover && /^(\/|https?:|attachment:)/.test(f.page_cover)) return f.page_cover;
    const files = Object.entries(schema || {}).filter(([, d]) => d.type === 'file').sort((a, b) => (COVER_RE.test(b[1].name) ? 1 : 0) - (COVER_RE.test(a[1].name) ? 1 : 0));
    for (const [pid] of files) {
      const v = (r.properties || {})[pid];
      if (!Array.isArray(v)) continue;
      for (const s of v) if (Array.isArray(s) && Array.isArray(s[1])) for (const fm of s[1]) if (Array.isArray(fm) && fm[0] === 'a' && fm[1]) return fm[1];
    }
    return '';
  }
  function srcUrl(u, r, w) {
    if (!u) return '';
    if (/^\//.test(u)) return u;
    if (/^attachment:/.test(u) || /secure\.notion-static\.com|prod-files-secure|file\.notion\.so|notionusercontent/.test(u)) return '/image/' + encodeURIComponent(u) + '?table=block&id=' + r.id + (r.space_id ? '&spaceId=' + r.space_id : '') + '&width=' + (w || 64) + '&userId=&cache=v2';
    return /^https?:/.test(u) ? u : '';
  }
  function loadImg(src, cors) {
    return new Promise((res, rej) => {
      const im = new Image();
      if (cors) im.crossOrigin = 'anonymous';
      im.decoding = 'async';
      im.referrerPolicy = 'same-origin';
      const t = setTimeout(() => rej(new Error('timeout')), 9000);
      im.onload = () => { clearTimeout(t); res(im); };
      im.onerror = () => { clearTimeout(t); rej(new Error('img')); };
      im.src = src;
    });
  }
  function domColor(img) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 32;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, 32, 32);
    const d = g.getImageData(0, 0, 32, 32).data;   // 読めない画像（別の場所から）は、ここで例外
    const B = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], gg = d[i + 1], b = d[i + 2];
      if (d[i + 3] < 128) continue;
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
      const l = (mx + mn) / 510;
      const s = mx === mn ? 0 : l > 0.5 ? (mx - mn) / (510 - mx - mn) : (mx - mn) / (mx + mn);
      if (l > 0.9 || l < 0.12 || s < 0.18) continue;
      const k = ((r >> 4) << 8) | ((gg >> 4) << 4) | (b >> 4);
      const o = B.get(k) || { n: 0, r: 0, g: 0, b: 0 };
      o.n++; o.r += r; o.g += gg; o.b += b;
      B.set(k, o);
    }
    let best = null;
    for (const o of B.values()) if (!best || o.n > best.n) best = o;
    if (!best || best.n < 6) return null;
    const hx = (v) => Math.round(v / best.n).toString(16).padStart(2, '0');
    return '#' + hx(best.r) + hx(best.g) + hx(best.b);
  }
  /* 明るすぎ・暗すぎを、使う場所に合わせて整える（文字やアイコンの読みやすさを守る） */
  function tune(hex, role) {
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
    if (!m) return 'var(--tl-acc)';
    const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) {
      const dd = mx - mn;
      s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn);
      h = mx === r ? ((g - b) / dd + (g < b ? 6 : 0)) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
      h *= 60;
    }
    const dark = isDark();
    if (role === 'line') { l = clamp(l, dark ? 0.55 : 0.38, dark ? 0.72 : 0.56); s = Math.max(s, 0.35); return 'hsl(' + Math.round(h) + ' ' + Math.round(s * 100) + '% ' + Math.round(l * 100) + '%)'; }
    if (role === 'halo') { l = clamp(l, 0.45, 0.7); s = Math.max(s, 0.4); return 'hsl(' + Math.round(h) + ' ' + Math.round(s * 100) + '% ' + Math.round(l * 100) + '% / .5)'; }
    l = clamp(l, 0.4, 0.7);
    return Math.round(h) + ' ' + Math.round(Math.max(s, 0.3) * 100) + '% ' + Math.round(l * 100) + '%';
  }
  const TPEND = new Map();
  let tintSaveT = 0;
  async function tintOf(id) {
    if (!P.tint || !id) return null;
    let r = rec('block', id);
    if (!r) r = (await records('block', [id]).catch(() => new Map())).get(id);
    if (!r) return null;
    let schema = CTX && CTX.db && r.parent_id === CTX.db.cid ? CTX.db.schema : null;
    if (!schema && r.parent_table === 'collection' && r.parent_id) { const c = (await records('collection', [r.parent_id]).catch(() => new Map())).get(r.parent_id); schema = c && c.schema; }
    const u = coverOf(r, schema);
    if (!u) return null;
    const key = id32(id) + '|' + u.slice(-48);
    if (key in TINTC) return TINTC[key] || null;
    if (TPEND.has(key)) return TPEND.get(key);
    const p = (async () => {
      let col = null;
      const src = srcUrl(u, r, 64);
      if (src) {
        try { col = domColor(await loadImg(src, false)); } catch (e) {
          try { col = domColor(await loadImg(src, true)); } catch (e2) { col = null; }
        }
      }
      TINTC[key] = col || 0;
      ST.tints++;
      clearTimeout(tintSaveT);
      tintSaveT = setTimeout(() => { const ks = Object.keys(TINTC); if (ks.length > 1500) for (const k of ks.slice(0, ks.length - 1200)) delete TINTC[k]; save(LS.tint, TINTC); }, 1500);
      return col;
    })();
    TPEND.set(key, p);
    p.finally(() => TPEND.delete(key));
    return p;
  }
  async function tintMany(ids, onEach) {
    const out = new Map();
    let i = 0;
    const work = async () => { while (i < ids.length) { const id = ids[i++]; const c = await tintOf(id).catch(() => null); out.set(id, c); if (onEach) onEach(id, c); } };
    await Promise.all([work(), work(), work(), work()]);
    return out;
  }
  async function tintLens(state) {
    if (!P.tint || !state.hits || !state.hits.size) return;
    const ids = [...state.hits.keys()].slice(0, 300);
    state.tints = await tintMany(ids);
    if (LZ.cur === state) lensCss();
  }
  /* サイドピークの上端に、表紙の色のごく淡いにじみ（10%・160px・0.4 秒） */
  let peekSig = '';
  /* サイドピークの入れ物は、閉じている時も空のまま置かれているので、中身があるかで見る */
  const peekOpen = () => { const pk = $(SEL.peek); return pk && pk.firstElementChild ? pk : null; };
  async function peekPass() {
    const pk = peekOpen();
    const pid = new URLSearchParams(location.search).get('p');
    const old = $$('[data-tl-tint]');
    if (!pk || !pid || !P.tint) { for (const e of old) e.removeAttribute('data-tl-tint'); peekSig = ''; return; }
    const host = pk.querySelector('.notion-scroller') || pk;
    if (peekSig === pid + '|' + (host.hasAttribute('data-tl-tint') ? 1 : 0) && host.hasAttribute('data-tl-tint')) return;
    peekSig = pid + '|0';
    const col = await tintOf(dash(pid)).catch(() => null);
    if (!col || !host.isConnected || new URLSearchParams(location.search).get('p') !== pid) { for (const e of old) e.removeAttribute('data-tl-tint'); return; }
    for (const e of old) if (e !== host) e.removeAttribute('data-tl-tint');
    host.style.setProperty('--tl-tint', tune(col, 'hsl'));
    host.setAttribute('data-tl-tint', '');
    peekSig = pid + '|1';
  }

  /* ============================================================
   *  9. 倍率（Magnitude）— 星図 Planisphere
   * ============================================================ */
  const MAP = { on: false, el: null, nodes: [], byId: new Map(), edges: [], adj: [], z: 1, tx: 0, ty: 0, W: 0, H: 0, mode: 'dom', hov: -1, foc: -1, k: 1, anim: 0, raf: 0, pinch: 0, pinchT: 0, cid: '', clu: false, tints: new Map(), imgs: new Map(), worker: null, gen: 0, lit: null };
  const ZMIN = 0.25, ZMAX = 3.2, ZLABEL = 1.4, ZEXPAND = 1.8;
  const DEFAULT_ICON = '<svg class="tl-defic" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 2.8h6.2l3.8 3.8v10a.9.9 0 0 1-.9.9H5.5a.9.9 0 0 1-.9-.9V3.7a.9.9 0 0 1 .9-.9Z" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M11.6 2.9v3.1a.7.7 0 0 0 .7.7h3.1M7.2 10.2h5.6M7.2 12.8h5.6M7.2 15.3h3.6" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/></svg>';
  const DEF_PATH = typeof Path2D === 'function' ? [new Path2D('M5.5 2.8h6.2l3.8 3.8v10a.9.9 0 0 1-.9.9H5.5a.9.9 0 0 1-.9-.9V3.7a.9.9 0 0 1 .9-.9Z'), new Path2D('M11.6 2.9v3.1a.7.7 0 0 0 .7.7h3.1M7.2 10.2h5.6M7.2 12.8h5.6M7.2 15.3h3.6')] : null;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function iconSrc(r) {
    const ic = r && r.format && r.format.page_icon;
    if (!ic) return { def: true };
    if (/^(\/|https?:|attachment:|data:image\/)/.test(ic)) {
      let u = ic;
      if (/^\/icons\//.test(u) && !/mode=/.test(u)) u += (u.includes('?') ? '&' : '?') + 'mode=' + (isDark() ? 'dark' : 'light');
      return { url: /^data:/.test(u) ? u : srcUrl(u, r, 64) || u };
    }
    if (/^notion:/.test(ic) || ic.length > 16 || /[:/]/.test(ic)) return { def: true };
    return { em: ic };
  }
  function iconHTML(r) {
    const s = iconSrc(r);
    if (s.url) return '<img alt="" draggable="false" referrerpolicy="same-origin" src="' + esc(s.url) + '">';
    if (s.em) return '<span class="em">' + esc(s.em) + '</span>';
    return DEFAULT_ICON;
  }

  /* 力学（つながった星は引き合い、すべての星は押し合う）— Worker でも、手元でも同じ関数 */
  function layoutRun(d, post) {
    var n = d.n, x = new Float32Array(d.x), y = new Float32Array(d.y), E = d.e, it = d.iters, L = d.len, w = d.w || null;
    var vx = new Float32Array(n), vy = new Float32Array(n), deg = new Float32Array(n), i, j, k, q, a, dx, dy, d2, dd, f;
    for (k = 0; k < E.length; k += 2) { deg[E[k]]++; deg[E[k + 1]]++; }
    var cell = L * 2.4, rep = L * L * 0.9, cc = cell * cell;
    for (var t = 0; t < it; t++) {
      var temp = d.temp * (1 - t / it) + 0.03;
      var grid = new Map();
      for (i = 0; i < n; i++) { var key = Math.floor(x[i] / cell) * 73856093 ^ Math.floor(y[i] / cell) * 19349663; a = grid.get(key); if (!a) { a = []; grid.set(key, a); } a.push(i); }
      var fx = new Float32Array(n), fy = new Float32Array(n);
      for (i = 0; i < n; i++) {
        var gx = Math.floor(x[i] / cell), gy = Math.floor(y[i] / cell);
        for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
          a = grid.get((gx + ox) * 73856093 ^ (gy + oy) * 19349663);
          if (!a) continue;
          for (q = 0; q < a.length; q++) {
            j = a[q]; if (j <= i) continue;
            dx = x[i] - x[j]; dy = y[i] - y[j]; d2 = dx * dx + dy * dy + 0.01;
            if (d2 > cc) continue;
            dd = Math.sqrt(d2); f = rep / d2 * (w ? Math.sqrt(w[i] * w[j]) : 1);
            fx[i] += dx / dd * f; fy[i] += dy / dd * f; fx[j] -= dx / dd * f; fy[j] -= dy / dd * f;
          }
        }
      }
      for (k = 0; k < E.length; k += 2) {
        i = E[k]; j = E[k + 1];
        dx = x[j] - x[i]; dy = y[j] - y[i]; dd = Math.sqrt(dx * dx + dy * dy) + 0.01;
        f = (dd - L) * 0.08;
        fx[i] += dx / dd * f; fy[i] += dy / dd * f; fx[j] -= dx / dd * f; fy[j] -= dy / dd * f;
      }
      for (i = 0; i < n; i++) { var gk = deg[i] ? 0.012 : 0.03; fx[i] -= x[i] * gk; fy[i] -= y[i] * gk; }
      var mx = L * (temp * 2 + 0.05);
      for (i = 0; i < n; i++) {
        vx[i] = (vx[i] + fx[i]) * 0.55; vy[i] = (vy[i] + fy[i]) * 0.55;
        var sp = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]);
        if (sp > mx) { vx[i] *= mx / sp; vy[i] *= mx / sp; }
        x[i] += vx[i]; y[i] += vy[i];
      }
      if (d.post && t % 12 === 11 && t < it - 1) post({ x: Array.from(x), y: Array.from(y), done: false });
    }
    post({ x: Array.from(x), y: Array.from(y), done: true });
  }
  function layoutStart(job, onTick) {
    const gen = ++MAP.gen;
    const got = (m) => { if (gen !== MAP.gen || !MAP.on) return; onTick(m); };
    let ok = false, timer = 0;
    const local = () => { if (ok) return; ok = true; clearTimeout(timer); if (MAP.worker) { try { MAP.worker.terminate(); } catch (e) { /* noop */ } MAP.worker = null; } setTimeout(() => { if (gen !== MAP.gen) return; layoutRun(Object.assign({}, job, { post: false }), got); }, 0); };
    try {
      if (MAP.worker) MAP.worker.terminate();
      const src = 'self.onmessage=function(e){(' + layoutRun.toString() + ')(e.data,function(m){self.postMessage(m)})}';
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const w = new Worker(url);
      MAP.worker = w;
      w.onmessage = (e) => { ok = true; clearTimeout(timer); got(e.data); if (e.data.done) { try { w.terminate(); } catch (er) { /* noop */ } if (MAP.worker === w) MAP.worker = null; URL.revokeObjectURL(url); } };
      w.onerror = () => { URL.revokeObjectURL(url); ok = false; local(); };
      timer = setTimeout(() => { if (!ok) local(); }, 1500);
      w.postMessage(job);
    } catch (e) { local(); }
  }

  /* 星図の場面: 行の星・リレーションの相手（大きな星）・線 */
  function sceneBuild(c, ids) {
    const sch = c.db.schema;
    const off = LINES[c.db.cid] || {};
    const relP = Object.entries(sch).filter(([p, d]) => d.type === 'relation' && off[p] !== false).map(([p]) => p);
    const rowSet = new Set(ids);
    const nodes = [], byId = new Map(), edges = [], seen = new Set(), cnt = {};
    const add = (id, kind) => { let n = byId.get(id); if (n) return n; n = { id, kind, i: nodes.length, deg: 0, x: 0, y: 0 }; nodes.push(n); byId.set(id, n); return n; };
    for (const id of ids) add(id, 'row');
    const links = [];
    for (const id of ids) {
      const r = rec('block', id);
      if (!r) continue;
      for (const p of relP) for (const t of relIds((r.properties || {})[p])) { links.push([id, t, p]); cnt[p] = (cnt[p] || 0) + 1; }
    }
    let clu = null;
    if (ids.length > (P.cluAt || 1000)) {
      const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
      clu = { prop: best ? best[0] : null, of: new Map() };
    }
    if (clu) {
      /* 1000 個を超えたら、最も多くつながるリレーションでまとめる（まとまり ＝ 1 つの大きな星。近づくと中の星が広がる） */
      nodes.length = 0; byId.clear();
      const first = new Map();
      for (const [a, t, p] of links) if (p === clu.prop && !first.has(a)) first.set(a, t);
      for (const id of ids) {
        const key = first.get(id) || '∅';
        let n = byId.get('clu:' + key);
        if (!n) { n = add('clu:' + key, 'clu'); n.hub = key === '∅' ? null : key; n.mem = []; }
        n.mem.push(id);
        clu.of.set(id, n);
      }
      for (const [a, t, p] of links) {
        if (p === clu.prop) continue;
        const A = clu.of.get(a);
        const B = rowSet.has(t) ? clu.of.get(t) : add(t, 'hub');
        if (!A || !B || A === B) continue;
        const k = Math.min(A.i, B.i) + '-' + Math.max(A.i, B.i);
        if (seen.has(k)) continue;
        seen.add(k); edges.push([A.i, B.i, p]); A.deg++; B.deg++;
      }
    } else {
      for (const [a, t, p] of links) {
        const A = byId.get(a);
        const B = rowSet.has(t) ? byId.get(t) : add(t, 'hub');
        if (!A || !B || A === B) continue;
        const k = Math.min(A.i, B.i) + '-' + Math.max(A.i, B.i);
        if (seen.has(k)) continue;
        seen.add(k); edges.push([A.i, B.i, p]); A.deg++; B.deg++;
      }
    }
    const adj = nodes.map(() => []);
    for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    return { nodes, byId, edges, adj, clu };
  }
  function seed(nodes, adj, saved) {
    const n = nodes.length;
    const R = 40 * Math.sqrt(n) + 40;
    let fresh = 0;
    nodes.forEach((nd, i) => {
      const s = saved && saved[nd.id];
      if (s) { nd.x = s[0]; nd.y = s[1]; return; }
      fresh++;
      const nb = adj[i].map((j) => saved && saved[nodes[j].id]).find(Boolean);
      if (nb) { nd.x = nb[0] + (Math.random() - 0.5) * 40; nd.y = nb[1] + (Math.random() - 0.5) * 40; return; }
      const a = i * 2.39996, r = R * Math.sqrt((i + 0.5) / n);
      nd.x = Math.cos(a) * r; nd.y = Math.sin(a) * r;
    });
    return fresh;
  }
  function mapSave() {
    if (!MAP.cid || !MAP.nodes.length) return;
    const pos = {};
    for (const n of MAP.nodes.slice(0, 4000)) pos[n.id] = [Math.round(n.x), Math.round(n.y)];
    SKY[MAP.cid] = { at: Date.now(), pos };
    const ks = Object.keys(SKY);
    if (ks.length > 12) { ks.sort((a, b) => (SKY[a].at || 0) - (SKY[b].at || 0)); for (const k of ks.slice(0, ks.length - 12)) delete SKY[k]; }
    save(LS.sky, SKY);
  }

  /* 画面上の位置（世界 → 画面）。行き来の途中は、出発点との間を補う */
  function disp(n) {
    const wx = n.x * MAP.z + MAP.tx, wy = n.y * MAP.z + MAP.ty;
    if (MAP.k >= 1 || n.ax == null) return [wx, wy, n.ba == null ? 1 : n.ba];
    const k = MAP.k;
    const bx = n.bx == null ? wx : n.bx, by = n.by == null ? wy : n.by;
    return [n.ax + (bx - n.ax) * k, n.ay + (by - n.ay) * k, n.aa + ((n.ba == null ? 1 : n.ba) - n.aa) * k];
  }
  function mapRect(c) {
    const sr = c.scroller.getBoundingClientRect();
    const above = LZ.bar && LZ.bar.classList.contains('open') && LZ.bar.isConnected ? LZ.bar : c.tabsRow;
    let top = sr.top;
    if (above) { const b = above.getBoundingClientRect().bottom + 2; if (b > top && b < sr.bottom - 160) top = b; }
    return { left: sr.left, top, width: c.scroller.clientWidth, height: sr.bottom - top };
  }
  function mapPlace() {
    if (!MAP.el || !CTX || !CTX.scroller) return;
    const r = mapRect(CTX);
    Object.assign(MAP.el.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    if (r.width !== MAP.W || r.height !== MAP.H) {
      MAP.tx += (r.width - MAP.W) / 2; MAP.ty += (r.height - MAP.H) / 2;
      MAP.W = r.width; MAP.H = r.height;
      if (MAP.mode === 'canvas') canvasSize();
    }
    mapDraw();
  }
  function fit() {
    const ns = MAP.nodes;
    if (!ns.length) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of ns) { if (n.x < x0) x0 = n.x; if (n.x > x1) x1 = n.x; if (n.y < y0) y0 = n.y; if (n.y > y1) y1 = n.y; }
    const bw = Math.max(60, x1 - x0), bh = Math.max(60, y1 - y0);
    MAP.z = clamp(Math.min((MAP.W - 90) / bw, (MAP.H - 90) / bh), ZMIN, 1.6);
    MAP.tx = MAP.W / 2 - (x0 + x1) / 2 * MAP.z;
    MAP.ty = MAP.H / 2 - (y0 + y1) / 2 * MAP.z;
  }

  async function mapEnter() {
    const c = CTX;
    if (!c || !c.db || !c.scroller || MAP.on || !P.map) return;
    MAP.on = true; ST.map++;
    cardHide(); closePop(); tipHide();
    /* 出発点: いま見えている行の Notion アイコン（画面の外の行は、表の上端か下端から） */
    const src = new Map();
    let vis = [];
    for (const it of visItems()) {
      const id = it.getAttribute('data-block-id');
      const tc = cellOf(it, FS.titleCi);
      const ic = tc && tc.querySelector(SEL.icon);
      const r = (ic || tc || it).getBoundingClientRect();
      src.set(id, { x: ic ? r.left + r.width / 2 : r.left + 18, y: r.top + r.height / 2 });
      vis.push(id);
    }
    const el = mk('div', 'tl-map tl-ui', null, document.body);
    el.id = 'tl-map';
    el.tabIndex = 0;
    el.setAttribute('role', 'application');
    el.setAttribute('aria-label', '星図 Planisphere — Tab で星を順に、矢印でつながる隣の星へ、Enter で開く、Esc で表に戻る');
    el.innerHTML = '<div class="tl-map-sky" aria-hidden="true"></div><div class="tl-map-wait" aria-hidden="true">星を集めています…</div>'
      + '<div class="tl-map-bar"><button type="button" class="tl-map-b" data-a="table">☰ 表</button><button type="button" class="tl-map-b" data-a="out" aria-label="引く">−</button><button type="button" class="tl-map-b" data-a="in" aria-label="寄る">＋</button><button type="button" class="tl-map-b" data-a="fit">全体</button></div>'
      + '<div class="tl-sr" aria-live="polite"></div>';
    MAP.el = el;
    const r0 = mapRect(c);
    MAP.W = r0.width; MAP.H = r0.height;
    Object.assign(el.style, { left: r0.left + 'px', top: r0.top + 'px', width: r0.width + 'px', height: r0.height + 'px' });
    mapWire(el);
    de.setAttribute('data-tl-map', '');
    if (LZ.bar) LZ.bar.querySelector('.tl-mapb').textContent = '☰ 表';
    fadeSoon();
    let ids;
    try { ids = await queryAll(c.db, c.view); await relLoad(c, ids); } catch (e) { oops('map', e); mapExit(null, true); return; }
    if (!MAP.on || MAP.el !== el) return;
    const sc = sceneBuild(c, ids);
    MAP.nodes = sc.nodes; MAP.byId = sc.byId; MAP.edges = sc.edges; MAP.adj = sc.adj; MAP.clu = !!sc.clu; MAP.cid = c.db.cid; MAP.order = ids;
    const hubIds = MAP.nodes.filter((n) => n.kind === 'hub').map((n) => n.id).concat(MAP.nodes.filter((n) => n.kind === 'clu' && n.hub).map((n) => n.hub));
    if (hubIds.length) await records('block', hubIds).catch(() => null);
    if (!MAP.on || MAP.el !== el) return;
    for (const n of MAP.nodes) {
      const r = n.kind === 'clu' ? (n.hub ? rec('block', n.hub) : null) : rec('block', n.id);
      n.title = n.kind === 'clu' ? (r ? titleOf(r) : '（なし）') + '（' + n.mem.length + '）' : titleOf(r) || '(無題)';
      n.r = r;
    }
    const saved = SKY[c.db.cid] && SKY[c.db.cid].pos;
    const fresh = seed(MAP.nodes, MAP.adj, saved);
    MAP.mode = MAP.clu || MAP.nodes.length > (P.canvasAt || 200) ? 'canvas' : 'dom';
    el.querySelector('.tl-map-wait').remove();
    if (MAP.mode === 'dom') domBuild(); else canvasBuild();
    fit();
    /* 星が飛ぶ（FLIP）: 行の位置 → 星の位置。表の文字や値はフェードで消える */
    const firstVis = vis.length ? ids.indexOf(vis[0]) : 0, lastVis = vis.length ? ids.indexOf(vis[vis.length - 1]) : 0;
    const er = el.getBoundingClientRect();
    for (const n of MAP.nodes) {
      n.bx = null; n.by = null; n.ba = 1;
      if (n.kind === 'row' && src.has(n.id)) { const s = src.get(n.id); n.ax = s.x - er.left; n.ay = s.y - er.top; n.aa = 1; }
      else if (n.kind === 'row' && !MAP.clu) { const i = ids.indexOf(n.id); n.ax = n.x * MAP.z + MAP.tx; n.ay = i < firstVis ? -10 : MAP.H + 10; n.aa = 0; }
      else { n.ax = n.x * MAP.z + MAP.tx; n.ay = n.y * MAP.z + MAP.ty; n.aa = 0; }
    }
    MAP.k = 0;
    MAP.user = false; MAP.fitAfter = false;
    if (fresh) {
      const job = { n: MAP.nodes.length, x: MAP.nodes.map((n) => n.x), y: MAP.nodes.map((n) => n.y), e: MAP.edges.flatMap((e) => [e[0], e[1]]), iters: fresh === MAP.nodes.length ? 320 : 140, len: 52, temp: fresh === MAP.nodes.length ? 1 : 0.35, post: !calm(), w: MAP.clu ? MAP.nodes.map((n) => n.kind === 'clu' ? Math.max(1, Math.sqrt(n.mem.length)) : 1) : null };
      layoutStart(job, (m) => {
        for (let i = 0; i < MAP.nodes.length; i++) { MAP.nodes[i].x = m.x[i]; MAP.nodes[i].y = m.y[i]; }
        if (m.done) { if (!MAP.user) { if (MAP.k >= 1) fitSoft(); else MAP.fitAfter = true; } mapSave(); }
        mapDraw();
      });
    }
    mapTints();
    mapLens();
    const live = el.querySelector('.tl-sr');
    if (live) live.textContent = '星図に切り替えました。星 ' + MAP.nodes.length + ' 個';
    flight(600, () => { try { el.focus({ preventScroll: true }); } catch (e) { /* noop */ } if (MAP.fitAfter && !MAP.user) { MAP.fitAfter = false; fitSoft(); } });
  }
  function fitSoft() {
    const z0 = MAP.z, tx0 = MAP.tx, ty0 = MAP.ty;
    fit();
    const z1 = MAP.z, tx1 = MAP.tx, ty1 = MAP.ty;
    if (calm()) { mapDraw(); return; }
    MAP.z = z0; MAP.tx = tx0; MAP.ty = ty0;
    const t0 = performance.now();
    const f = (now) => { const t = Math.min(1, (now - t0) / 500), e = ease(t); MAP.z = z0 + (z1 - z0) * e; MAP.tx = tx0 + (tx1 - tx0) * e; MAP.ty = ty0 + (ty1 - ty0) * e; mapDraw(); if (t < 1 && MAP.on) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  function flight(dur, done) {
    cancelAnimationFrame(MAP.anim);
    if (calm()) { MAP.k = 1; mapDraw(); if (done) done(); return; }
    const t0 = performance.now();
    const f = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      MAP.k = ease(t);
      mapDraw();
      if (t < 1) MAP.anim = requestAnimationFrame(f);
      else { MAP.anim = 0; MAP.k = 1; for (const n of MAP.nodes) { n.ax = null; } mapDraw(); if (done) done(); }
    };
    MAP.anim = requestAnimationFrame(f);
  }
  /* 表へ戻る（逆の動き）。特定の星から戻る時は、その行まで送って 0.6 秒光らせる */
  async function mapExit(targetId, now) {
    if (!MAP.on) return;
    const c = CTX, el = MAP.el;
    MAP.gen++;
    if (MAP.worker) { try { MAP.worker.terminate(); } catch (e) { /* noop */ } MAP.worker = null; }
    const finish = () => {
      if (el) el.remove();
      if (MAP.el === el) { MAP.el = null; MAP.on = false; MAP.nodes = []; MAP.edges = []; MAP.adj = []; MAP.byId = new Map(); MAP.hov = -1; MAP.foc = -1; }
      de.removeAttribute('data-tl-map');
      if (LZ.bar) LZ.bar.querySelector('.tl-mapb').textContent = '✦ 星図';
      fieldSoon(); fadeSoon(); rowSoon();
      if (targetId && c) { const it = c.table.querySelector(SEL.item + '[data-block-id="' + cssStr(targetId) + '"]'); if (it) flashRow(it); }
    };
    if (now || !c || !c.scroller || calm() || !el) { if (targetId && c) await scrollToRow(c, targetId); finish(); return; }
    if (targetId) await scrollToRow(c, targetId);
    const er = el.getBoundingClientRect();
    const dst = new Map();
    for (const it of visItems()) {
      const tc = cellOf(it, FS.titleCi);
      const ic = tc && tc.querySelector(SEL.icon);
      const r = (ic || tc || it).getBoundingClientRect();
      dst.set(it.getAttribute('data-block-id'), [ic ? r.left + r.width / 2 - er.left : r.left + 18 - er.left, r.top + r.height / 2 - er.top]);
    }
    for (const n of MAP.nodes) {
      const [x, y, a] = disp(n);
      n.ax = x; n.ay = y; n.aa = a;
      const d = dst.get(n.id);
      if (d) { n.bx = d[0]; n.by = d[1]; n.ba = 1; }
      else { n.bx = x; n.by = y < MAP.H / 2 ? -20 : MAP.H + 20; n.ba = 0; }
    }
    MAP.k = 0;
    el.classList.add('out');
    setTimeout(() => de.removeAttribute('data-tl-map'), 200);
    flight(600, finish);
  }
  async function scrollToRow(c, id) {
    const i = (MAP.order || []).indexOf(id);
    const sc = c.scroller;
    let it = c.table.querySelector(SEL.item + '[data-block-id="' + cssStr(id) + '"]');
    if (!it && i >= 0) {
      const sr = sc.getBoundingClientRect(), tr = c.table.getBoundingClientRect();
      const top = tr.top - sr.top + sc.scrollTop;
      sc.scrollTop = Math.max(0, top + 36 + (tr.height - 36) * (i + 0.5) / MAP.order.length - sc.clientHeight * 0.4);
      for (let k = 0; k < 10 && !(it = c.table.querySelector(SEL.item + '[data-block-id="' + cssStr(id) + '"]')); k++) await sleep(50);
    }
    if (it) { const r = it.getBoundingClientRect(), sr = sc.getBoundingClientRect(); if (r.top < sr.top + 60 || r.bottom > sr.bottom - 40) sc.scrollTop += r.top - sr.top - sc.clientHeight * 0.4; await sleep(60); }
  }

  /* ---- 描き方 1: DOM と SVG（200 個まで）。星は Notion のアイコンそのもの、光は後ろの層 ---- */
  function domBuild() {
    const el = MAP.el;
    const wrap = mk('div', 'tl-map-v', null, el);
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'tl-map-e');
    svg.setAttribute('aria-hidden', 'true');
    wrap.appendChild(svg);
    MAP.lines = MAP.edges.map(() => { const l = document.createElementNS(NS, 'line'); svg.appendChild(l); return l; });
    MAP.stars = MAP.nodes.map((n) => {
      const b = mk('button', 'tl-mstar ' + n.kind, null, wrap);
      b.type = 'button';
      b.tabIndex = 0;
      b.dataset.i = n.i;
      b.setAttribute('aria-label', n.title + (n.kind === 'hub' ? '（リレーションの相手・つながり ' + n.deg + '）' : '') );
      b.innerHTML = '<span class="halo"></span><span class="ic"></span><span class="lb"></span>';
      b.querySelector('.ic').innerHTML = iconHTML(n.r);
      b.querySelector('.lb').textContent = n.title;
      const img = b.querySelector('img');
      if (img) img.onerror = () => { b.querySelector('.ic').innerHTML = DEFAULT_ICON; };
      return b;
    });
  }
  function domDraw() {
    const lit = MAP.lit;
    const hv = MAP.hov >= 0 ? MAP.hov : MAP.foc;
    const nb = hv >= 0 ? new Set(MAP.adj[hv]) : null;
    MAP.el.toggleAttribute('data-hov', hv >= 0);
    MAP.el.classList.toggle('lbl', MAP.z >= ZLABEL);
    const pos = MAP.nodes.map(disp);
    MAP.stars.forEach((b, i) => {
      const p = pos[i];
      b.style.transform = 'translate(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px)';
      b.style.opacity = p[2] < 1 ? p[2].toFixed(3) : '';
      b.classList.toggle('hov', i === hv);
      b.classList.toggle('nb', !!(nb && nb.has(i)));
      b.classList.toggle('dim', !!(lit && !lit.has(i)));
    });
    const ea = MAP.k < 1 ? (MAP.el.classList.contains('out') ? 1 - MAP.k : MAP.k) : 1;
    MAP.edges.forEach((e, k) => {
      const l = MAP.lines[k], a = pos[e[0]], b = pos[e[1]];
      l.setAttribute('x1', a[0].toFixed(1)); l.setAttribute('y1', a[1].toFixed(1)); l.setAttribute('x2', b[0].toFixed(1)); l.setAttribute('y2', b[1].toFixed(1));
      const on = hv >= 0 && (e[0] === hv || e[1] === hv);
      const both = lit && lit.has(e[0]) && lit.has(e[1]);
      l.setAttribute('class', on ? 'nb' : both ? 'lit' : lit ? 'dim' : '');
      l.style.opacity = ea < 1 ? ea.toFixed(3) : '';
    });
  }

  /* ---- 描き方 2: Canvas（200 個より多い時）。画像は 1 度読んだら覚える ---- */
  function canvasBuild() {
    const cv = mk('canvas', 'tl-map-c', null, MAP.el);
    cv.setAttribute('aria-hidden', 'true');
    MAP.cv = cv;
    canvasSize();
  }
  function canvasSize() {
    const cv = MAP.cv;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(MAP.W * dpr); cv.height = Math.round(MAP.H * dpr);
    cv.style.width = MAP.W + 'px'; cv.style.height = MAP.H + 'px';
    MAP.dpr = dpr;
  }
  function imgFor(r) {
    const s = iconSrc(r);
    if (!s.url) return s;
    let c = MAP.imgs.get(s.url);
    if (!c) {
      c = { img: new Image(), ok: false, bad: false };
      c.img.referrerPolicy = 'same-origin';
      c.img.onload = () => { c.ok = true; mapDraw(); };
      c.img.onerror = () => { c.bad = true; };
      c.img.src = s.url;
      MAP.imgs.set(s.url, c);
    }
    return c.bad ? { def: true } : { im: c };
  }
  function cssVar(el, name, d) { const v = getComputedStyle(el).getPropertyValue(name).trim(); return v || d; }
  function canvasDraw() {
    const cv = MAP.cv, g = cv.getContext('2d');
    const dpr = MAP.dpr || 1;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, MAP.W, MAP.H);
    const acc = cssVar(MAP.el, '--tl-acc', '#3a9');
    const ink = cssVar(MAP.el, '--tl-ink', '#37352f');
    const ico = cssVar(MAP.el, '--tl-ico', '#91918e');
    const lit = MAP.lit;
    const hv = MAP.hov >= 0 ? MAP.hov : MAP.foc;
    const nb = hv >= 0 ? new Set(MAP.adj[hv]) : null;
    const pos = MAP.nodes.map(disp);
    const ea = MAP.k < 1 ? (MAP.el.classList.contains('out') ? 1 - MAP.k : MAP.k) : 1;
    g.lineWidth = 1;
    for (const e of MAP.edges) {
      const a = pos[e[0]], b = pos[e[1]];
      const on = hv >= 0 && (e[0] === hv || e[1] === hv);
      const both = lit && lit.has(e[0]) && lit.has(e[1]);
      g.globalAlpha = ea * (on ? 0.85 : both ? 0.55 : hv >= 0 || lit ? 0.08 : 0.3);
      g.strokeStyle = acc;
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    const expand = MAP.clu && MAP.z >= ZEXPAND;
    MAP.hit = [];
    MAP.nodes.forEach((n, i) => {
      const p = pos[i];
      if (p[0] < -60 || p[1] < -60 || p[0] > MAP.W + 60 || p[1] > MAP.H + 60) return;
      const big = n.kind !== 'row';
      const dim = (hv >= 0 && i !== hv && !(nb && nb.has(i))) || (lit && !lit.has(i));
      const a = p[2] * (dim ? 0.25 : 1);
      const sz = n.kind === 'clu' ? Math.min(44, 24 + Math.sqrt(n.mem.length) * 2) : big ? 28 : 20;
      g.globalAlpha = a;
      const halo = big ? sz * 1.3 : 18;
      const tint = n.kind === 'row' && P.tint ? MAP.tints.get(n.id) : null;
      const grd = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], halo);
      grd.addColorStop(0, tint ? tune(tint, 'halo') : acc);
      grd.addColorStop(1, 'transparent');
      g.globalAlpha = a * (big ? 0.38 : 0.3);
      g.fillStyle = grd;
      g.beginPath(); g.arc(p[0], p[1], halo, 0, Math.PI * 2); g.fill();
      g.globalAlpha = a;
      if (!(expand && n.kind === 'clu')) drawIcon(g, n.kind === 'clu' ? (n.hub ? rec('block', n.hub) : null) : n.r, p[0], p[1], sz, ico);
      if (i === MAP.foc) { g.globalAlpha = 1; g.strokeStyle = acc; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], sz * 0.75, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; }
      MAP.hit.push([i, p[0], p[1], sz / 2 + 4]);
      if (big || i === hv || i === MAP.foc || MAP.z >= ZLABEL) {
        g.globalAlpha = a * (big ? 0.95 : 0.85);
        g.fillStyle = ink;
        g.font = (big ? '600 12px' : '11px') + ' ' + UIFONT;
        g.textAlign = 'center';
        g.fillText(n.title.length > 22 ? n.title.slice(0, 21) + '…' : n.title, p[0], p[1] + sz / 2 + 13);
      }
      if (expand && n.kind === 'clu') {
        n.mem.forEach((id, k) => {
          const ang = k * 2.39996, rr = 10 * Math.sqrt(k + 1) * MAP.z;
          const mx = p[0] + Math.cos(ang) * rr, my = p[1] + Math.sin(ang) * rr;
          if (mx < -20 || my < -20 || mx > MAP.W + 20 || my > MAP.H + 20) return;
          g.globalAlpha = p[2] * (lit && !lit.has('m:' + id) ? 0.25 : 1);
          drawIcon(g, rec('block', id), mx, my, 16, ico);
          MAP.hit.push(['m:' + id, mx, my, 10]);
          if (MAP.z >= ZEXPAND + 0.8) { g.fillStyle = ink; g.font = '10px ' + UIFONT; g.textAlign = 'center'; g.fillText(titleOf(rec('block', id)).slice(0, 16), mx, my + 16); }
        });
      }
    });
    g.globalAlpha = 1;
  }
  const UIFONT = '"Inter", -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif';
  function drawIcon(g, r, x, y, sz, col) {
    const s = imgFor(r);
    if (s.im && s.im.ok) { g.drawImage(s.im.img, x - sz / 2, y - sz / 2, sz, sz); return; }
    if (s.em) { g.font = Math.round(sz * 0.86) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.em, x, y + 1); g.textBaseline = 'alphabetic'; return; }
    if (!DEF_PATH) return;
    g.save(); g.translate(x - sz / 2, y - sz / 2); g.scale(sz / 20, sz / 20);
    g.strokeStyle = col; g.lineWidth = 1.2; g.lineCap = 'round';
    g.stroke(DEF_PATH[0]); g.stroke(DEF_PATH[1]);
    g.restore();
  }
  function mapDraw() {
    if (!MAP.el || !MAP.nodes.length) return;
    if (MAP.raf) return;
    MAP.raf = requestAnimationFrame(() => {
      MAP.raf = 0;
      if (!MAP.el) return;
      try {
        if (MAP.mode === 'dom' && MAP.stars) domDraw(); else if (MAP.cv) canvasDraw();
        const sky = MAP.el.querySelector('.tl-map-sky');
        if (sky) sky.style.backgroundPosition = (MAP.tx * 0.06).toFixed(1) + 'px ' + (MAP.ty * 0.06).toFixed(1) + 'px, ' + (MAP.tx * 0.12).toFixed(1) + 'px ' + (MAP.ty * 0.12).toFixed(1) + 'px';
      } catch (e) { oops('mapDraw', e); }
    });
  }
  function nodeAt(x, y) {
    if (MAP.mode === 'dom') return -1;
    let best = -1, bd = Infinity;
    for (const h of MAP.hit || []) { const d = Math.hypot(h[1] - x, h[2] - y); if (d < h[3] && d < bd) { bd = d; best = h[0]; } }
    return best;
  }
  const idOfHit = (h) => (typeof h === 'string' ? h.slice(2) : MAP.nodes[h] ? (MAP.nodes[h].kind === 'clu' ? MAP.nodes[h].hub : MAP.nodes[h].id) : null);

  /* 星図の操作: ドラッグで動かす・ホイールやピンチで倍率・乗せると隣だけ明るく・押すとサイドピーク */
  function zoomAt(f, x, y) {
    const z = clamp(MAP.z * f, ZMIN, ZMAX);
    MAP.tx = x - (x - MAP.tx) * (z / MAP.z);
    MAP.ty = y - (y - MAP.ty) * (z / MAP.z);
    MAP.z = z;
    MAP.user = true;
    mapDraw();
  }
  function mapWire(el) {
    el.addEventListener('wheel', (e) => {
      e.preventDefault(); e.stopPropagation();
      const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (e.ctrlKey || e.metaKey) {
        if (e.deltaY < 0 && MAP.z >= ZMAX - 0.001) {
          MAP.pinch += -e.deltaY;
          clearTimeout(MAP.pinchT); MAP.pinchT = setTimeout(() => { MAP.pinch = 0; }, 350);
          if (MAP.pinch > 70) { MAP.pinch = 0; const h = MAP.mode === 'dom' ? domHit(e.target) : nodeAt(x, y); mapExit(h != null && h !== -1 ? idOfHit(h) : null); }
          return;
        }
        zoomAt(Math.exp(-e.deltaY * 0.012), x, y);
      } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { MAP.tx -= e.deltaX; MAP.user = true; mapDraw(); }
      else zoomAt(Math.exp(-e.deltaY * 0.0016), x, y);
    }, { passive: false });
    let drag = null;
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.tl-map-bar')) return;
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, tx: MAP.tx, ty: MAP.ty, moved: false, star: e.target.closest('.tl-mstar') };
      try { el.setPointerCapture(e.pointerId); } catch (er) { /* noop */ }
    });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) > 4) { drag.moved = true; el.classList.add('grab'); }
        if (drag.moved) { MAP.tx = drag.tx + dx; MAP.ty = drag.ty + dy; MAP.user = true; mapDraw(); return; }
      }
      const h = MAP.mode === 'dom' ? domHit(e.target) : nodeAt(e.clientX - r.left, e.clientY - r.top);
      const hi = typeof h === 'number' ? h : -1;
      if (hi !== MAP.hov) { MAP.hov = hi; mapDraw(); }
      el.style.cursor = h != null && h !== -1 ? 'pointer' : '';
    });
    const up = (e) => {
      const d = drag; drag = null;
      el.classList.remove('grab');
      if (!d || d.moved || e.type === 'pointercancel') return;
      const r = el.getBoundingClientRect();
      /* 押した時に掴んでいるので、離した時の的は星図そのもの。押した時の星を使う */
      const h = MAP.mode === 'dom' ? (d.star ? +d.star.dataset.i : -1) : nodeAt(e.clientX - r.left, e.clientY - r.top);
      if (h == null || h === -1) return;
      if (typeof h === 'number' && MAP.nodes[h] && MAP.nodes[h].kind === 'clu' && MAP.z < ZEXPAND) { const p = disp(MAP.nodes[h]); zoomAt(ZEXPAND / MAP.z + 0.05, p[0], p[1]); return; }
      openPage(idOfHit(h), e.metaKey || e.ctrlKey);
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', () => { if (MAP.hov !== -1) { MAP.hov = -1; mapDraw(); } });
    el.addEventListener('focusin', (e) => { const b = e.target.closest && e.target.closest('.tl-mstar'); if (b) { MAP.foc = +b.dataset.i; mapDraw(); } });
    el.querySelector('.tl-map-bar').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'table') mapExit();
      else if (a === 'in') zoomAt(1.35, MAP.W / 2, MAP.H / 2);
      else if (a === 'out') zoomAt(1 / 1.35, MAP.W / 2, MAP.H / 2);
      else if (a === 'fit') { MAP.user = false; fitSoft(); }
    });
    el.addEventListener('keydown', mapKey);
  }
  const domHit = (t) => { const b = t && t.closest && t.closest('.tl-mstar'); return b ? +b.dataset.i : -1; };
  function mapKey(e) {
    if (e.isComposing) return;
    const n = MAP.nodes.length;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); mapExit(MAP.foc >= 0 && MAP.nodes[MAP.foc] && MAP.nodes[MAP.foc].kind === 'row' ? MAP.nodes[MAP.foc].id : null); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAt(1.3, MAP.W / 2, MAP.H / 2); return; }
    if (e.key === '-') { e.preventDefault(); zoomAt(1 / 1.3, MAP.W / 2, MAP.H / 2); return; }
    if (!n) return;
    if (e.key === 'Tab' && MAP.mode === 'canvas') {
      e.preventDefault();
      MAP.foc = MAP.foc < 0 ? 0 : (MAP.foc + (e.shiftKey ? n - 1 : 1)) % n;
      ensureVisible(MAP.foc);
      announce(MAP.nodes[MAP.foc]);
      mapDraw();
      return;
    }
    const dirs = { ArrowRight: 0, ArrowDown: 90, ArrowLeft: 180, ArrowUp: 270 };
    if (e.key in dirs) {
      e.preventDefault();
      const cur = MAP.foc >= 0 ? MAP.foc : 0;
      const p = disp(MAP.nodes[cur]);
      const want = dirs[e.key] * Math.PI / 180;
      const cands = MAP.adj[cur].length ? MAP.adj[cur] : MAP.nodes.map((_, i) => i).filter((i) => i !== cur);
      let best = -1, bs = Infinity;
      for (const j of cands) {
        const q = disp(MAP.nodes[j]);
        const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
        let dA = Math.abs(((ang - want + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        if (dA > Math.PI / 2) continue;
        const sc = dA * 120 + Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.25;
        if (sc < bs) { bs = sc; best = j; }
      }
      if (best >= 0) {
        MAP.foc = best;
        ensureVisible(best);
        if (MAP.mode === 'dom' && MAP.stars[best]) MAP.stars[best].focus({ preventScroll: true });
        announce(MAP.nodes[best]);
        mapDraw();
      }
      return;
    }
    if (e.key === 'Enter' && MAP.foc >= 0) { e.preventDefault(); const nd = MAP.nodes[MAP.foc]; if (nd.kind === 'clu') { const p = disp(nd); zoomAt(ZEXPAND / MAP.z + 0.05, p[0], p[1]); } else openPage(nd.id, e.metaKey || e.ctrlKey); }
  }
  function ensureVisible(i) {
    const p = disp(MAP.nodes[i]);
    let dx = 0, dy = 0;
    if (p[0] < 60) dx = 60 - p[0]; else if (p[0] > MAP.W - 60) dx = MAP.W - 60 - p[0];
    if (p[1] < 60) dy = 60 - p[1]; else if (p[1] > MAP.H - 60) dy = MAP.H - 60 - p[1];
    MAP.tx += dx; MAP.ty += dy;
  }
  function announce(nd) {
    const live = MAP.el && MAP.el.querySelector('.tl-sr');
    if (live && nd) live.textContent = nd.title + (nd.kind === 'row' ? '' : '（つながり ' + nd.deg + '）');
  }
  /* 開く: 星図はすでにこの DB の中なので、サイドピークだけ（⌘ で新しいタブ） */
  function openPage(id, tab) {
    if (!id) return;
    if (tab) { window.open(location.origin + '/' + id32(id), '_blank', 'noopener'); return; }
    const u = new URL(location.href);
    u.searchParams.set('p', id32(id));
    u.searchParams.set('pm', 's');
    try {
      history.pushState(history.state, '', u.pathname + u.search + u.hash);
      window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
    } catch (e) { location.assign(u.href); return; }
    const t0 = Date.now();
    const tick = () => {
      if (peekOpen()) { setTimeout(peekPass, 250); return; }
      if (Date.now() - t0 > 2400) { if (location.pathname + location.search === u.pathname + u.search) location.assign(u.href); return; }
      setTimeout(tick, 120);
    };
    setTimeout(tick, 150);
  }
  /* 星図の中のレンズ: 合った星は明るいまま、ほかは沈む。合った星どうしの線は少し明るく */
  function mapLens() {
    if (!MAP.on || !MAP.nodes.length) return;
    const st = LZ.cur;
    if (!st || !st.hits || st.key !== lensKey()) { MAP.lit = null; mapDraw(); return; }
    const lit = new Set();
    MAP.nodes.forEach((n, i) => {
      if (n.kind === 'row' && st.hits.has(n.id)) lit.add(i);
      if (n.kind === 'clu') { for (const id of n.mem) if (st.hits.has(id)) { lit.add(i); lit.add('m:' + id); } }
    });
    MAP.edges.forEach(([a, b]) => { const A = MAP.nodes[a], B = MAP.nodes[b]; if (A.kind === 'row' && lit.has(a) && B.kind === 'hub') lit.add(b); if (B.kind === 'row' && lit.has(b) && A.kind === 'hub') lit.add(a); });
    MAP.lit = lit;
    mapDraw();
  }
  /* 星の後ろの光暈 ＝ 表紙の色（アイコンそのものは染めない） */
  async function mapTints() {
    if (!P.tint || !MAP.on) return;
    const rows = MAP.nodes.filter((n) => n.kind === 'row').slice(0, 300).map((n) => n.id);
    await tintMany(rows, (id, col) => {
      if (!MAP.on || !col) return;
      MAP.tints.set(id, col);
      if (MAP.mode === 'dom') { const n = MAP.byId.get(id); const b = n && MAP.stars && MAP.stars[n.i]; if (b) b.style.setProperty('--tl-halo', tune(col, 'halo')); }
      else mapDraw();
    });
  }
  /* 表の上でつまむ（ピンチ ＝ Ctrl＋ホイール）と星図へ。表の中だけ、ブラウザの拡大を止める */
  let pinchIn = 0, pinchInT = 0;
  function onWheelTable(e) {
    if (!(e.ctrlKey || e.metaKey) || MAP.on || !P.map || !CTX || !CTX.db) return;
    const t = e.target;
    if (!t || !t.closest || !CTX.tables.some((x) => x.contains(t))) return;
    e.preventDefault();
    if (e.deltaY <= 0) return;
    pinchIn += e.deltaY;
    clearTimeout(pinchInT);
    pinchInT = setTimeout(() => { pinchIn = 0; }, 350);
    if (pinchIn > 45) { pinchIn = 0; mapEnter(); }
  }

  /* ============================================================
   *  10. 設定（Nebius の設定の「Telescopium」の段・◎ の長押し →「設定」）
   * ============================================================ */
  function settingsInto(host) {
    const box = mk('div', 'tl-set', null, host);
    const tog = (label, k, note) => {
      const l = mk('label', 'tl-set-t', null, box);
      const c = mk('input', null, null, l);
      c.type = 'checkbox';
      c.checked = P[k] !== false;
      l.append(' ' + label);
      if (note) mk('span', 'tl-set-n', note, l);
      c.addEventListener('change', () => { P[k] = c.checked; savePrefs(); applyPrefs(); });
    };
    tog('視野の調整（狭い時に列を譲る・タブを横に流す）', 'field');
    tog('Stella を細い列に縮める（視野の 1 段目）', 'stella');
    tog('B.U.R.I レンズ（◎）', 'lens');
    tog('星図 Planisphere（つまむ・✦ 星図）', 'map');
    tog('表紙の色（サイドピークのにじみ・星の光暈・レンズの線）', 'tint');
    const kr = mk('div', 'tl-set-k', null, box);
    mk('span', null, 'レンズのショートカット ', kr);
    const kb = mk('button', 'tl-kbd', keyLabel(), kr);
    kb.type = 'button';
    kb.addEventListener('click', (e) => {
      e.preventDefault();
      kb.textContent = 'キーを押してください…';
      const once = (ev) => {
        if (/^(Shift|Control|Alt|Meta)/.test(ev.code || ev.key)) return;
        ev.preventDefault(); ev.stopPropagation();
        window.removeEventListener('keydown', once, true);
        if (ev.key === 'Escape') { kb.textContent = keyLabel(); return; }
        if (!ev.altKey && !ev.ctrlKey && !ev.metaKey) { kb.textContent = keyLabel(); toast('修飾キー（' + ALT.replace('+', '') + ' など）と一緒に押してください'); return; }
        P.key = { code: ev.code, alt: ev.altKey, ctrl: ev.ctrlKey, meta: ev.metaKey, shift: ev.shiftKey };
        savePrefs();
        kb.textContent = keyLabel();
        if (LZ.btn) LZ.btn.title = 'B.U.R.I レンズ（' + keyLabel() + '）— 長押しでプリセット';
      };
      window.addEventListener('keydown', once, true);
    });
    mk('div', 'tl-set-h', 'このフル DB の列の優先度と長文の列', box);
    priEditor(box);
    const c = CTX;
    if (c && c.db) {
      const rels = Object.entries(c.db.schema).filter(([, d]) => d.type === 'relation');
      if (rels.length) {
        mk('div', 'tl-set-h', '星図で線にするリレーション', box);
        const off = LINES[c.db.cid] || {};
        for (const [pid, d] of rels) {
          const l = mk('label', 'tl-set-t', null, box);
          const cb = mk('input', null, null, l);
          cb.type = 'checkbox';
          cb.checked = off[pid] !== false;
          l.append(' ' + d.name + (d.collection_id && c.db.relName[d.collection_id] ? ' → ' + c.db.relName[d.collection_id] : ''));
          cb.addEventListener('change', () => { const m = LINES[c.db.cid] || (LINES[c.db.cid] = {}); if (cb.checked) delete m[pid]; else m[pid] = false; save(LS.lines, LINES); if (SKY[c.db.cid]) { delete SKY[c.db.cid]; save(LS.sky, SKY); } });
        }
      }
    }
    mk('div', 'tl-note', '設定はこの端末の Nebius の側にだけ保存します。Notion のデータやビューの設定には書き込みません。', box);
  }
  document.addEventListener('nebius:settings', (e) => {
    const box = document.getElementById(String(e.detail || ''));
    if (!box) return;
    mk('h4', null, 'Telescopium（本体 DB）', box);
    try { settingsInto(box); } catch (er) { oops('settings', er); }
  });
  function applyPrefs() {
    if (!P.field) { fieldOff(); tabsOff(); } else { fieldSoon(); tabsSoon(); }
    if (!P.lens) { lensRelease(); lensClose(); if (LZ.btn) { LZ.btn.remove(); } if (LZ.bar) LZ.bar.remove(); }
    if (!P.map && MAP.on) mapExit(null, true);
    if (!P.tint) { for (const e of $$('[data-tl-tint]')) e.removeAttribute('data-tl-tint'); MAP.tints.clear(); if (LZ.cur) LZ.cur.tints = null; lensCss(); }
    tick();
  }

  /* ============================================================
   *  11. 見た目（1 か所）
   * ============================================================ */
  const CSS = `
@property --neb-h { syntax: '<number>'; inherits: true; initial-value: 190; }
@property --tl-ta { syntax: '<number>'; inherits: false; initial-value: 0; }
.tl-ui { --neb-h: var(--neb-ht, 190); transition: --neb-h 1.2s cubic-bezier(.4,0,.2,1); }
.tl-ui, html[data-tl-key] .notion-frame {
  --tl-acc: oklch(60% .13 var(--neb-h, var(--neb-ht, 190))); --tl-acc-ink: oklch(45% .12 var(--neb-h, var(--neb-ht, 190)));
  --tl-acc-soft: oklch(64% .12 var(--neb-h, var(--neb-ht, 190)) / .14); --tl-glow: oklch(72% .14 var(--neb-h, var(--neb-ht, 190)) / .55);
  --tl-bg: #fbfaf8; --tl-ink: var(--c-texPri, #37352f); --tl-mute: var(--c-texSec, #787774); --tl-faint: var(--c-texTer, #9b9a97);
  --tl-ico: var(--c-icoSec, #91918e); --tl-star: oklch(58% .07 var(--neb-h, var(--neb-ht, 190)) / .5);
  --tl-ui-font: var(--cordi-ui, "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", sans-serif);
}
:is(body.dark, html[data-atx-dark] body, html[data-c39-dark] body) :is(.tl-ui, .notion-frame) {
  --tl-acc: oklch(76% .12 var(--neb-h, var(--neb-ht, 190))); --tl-acc-ink: oklch(86% .09 var(--neb-h, var(--neb-ht, 190)));
  --tl-acc-soft: oklch(72% .12 var(--neb-h, var(--neb-ht, 190)) / .18); --tl-bg: #2b2a28; --tl-star: oklch(90% .04 var(--neb-h, var(--neb-ht, 190)) / .55);
}
.tl-sr { position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0 0 0 0) !important; white-space: nowrap !important; }
.tl-face { font-family: ui-monospace, "SF Mono", Menlo, Consolas, "Noto Sans Mono CJK JP", monospace; white-space: nowrap; }

/* ---- 視野: タブの帯 ---- */
[role="tablist"][data-tl-tabs] { flex: none !important; width: ${TAB_W}px !important; max-width: none !important; margin-inline-end: calc(var(--tl-tabw) - ${TAB_W}px) !important; clip-path: inset(-4px calc(${TAB_W}px - var(--tl-tabw)) -4px 0) !important; overflow: hidden !important;
  --tl-mfl: 0px; --tl-mfr: 0px; -webkit-mask-image: linear-gradient(to right, transparent 0, #000 var(--tl-mfl), #000 calc(var(--tl-tabw) - var(--tl-mfr)), transparent var(--tl-tabw)); mask-image: linear-gradient(to right, transparent 0, #000 var(--tl-mfl), #000 calc(var(--tl-tabw) - var(--tl-mfr)), transparent var(--tl-tabw)); }
[data-tl-tabrow] { overflow-x: clip !important; overflow-clip-margin: 4px; }
[role="tablist"][data-tl-tabs][data-tl-fl] { --tl-mfl: 28px; }
[role="tablist"][data-tl-tabs][data-tl-fr] { --tl-mfr: 28px; }
[role="tablist"][data-tl-tabs] > div:first-child { flex: none !important; transform: translateX(var(--tl-tx, 0px)); transition: transform .28s cubic-bezier(.3,.8,.3,1); }
[role="tablist"][data-tl-tabs][data-tl-tabnow] > div:first-child { transition: none; }

/* ---- 視野: 見出しのチップ・つまみ・畳んだ列の値・カード・フェード ---- */
.tl-hchips { display: inline-flex; align-items: center; gap: 6px; padding-inline: 8px 4px; flex: none; position: relative; z-index: 2; }
.tl-chip { all: unset; box-sizing: border-box; display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 9px; border-radius: 999px; font: 600 11.5px/1 var(--tl-ui-font); color: var(--tl-mute); background: rgba(55,53,47,.06); cursor: pointer; white-space: nowrap; transition: background .15s, color .15s; }
.tl-chip:hover, .tl-chip:focus-visible { background: rgba(55,53,47,.1); color: var(--tl-ink); }
.tl-chip.tl-tomap { color: var(--tl-acc-ink); background: var(--tl-acc-soft); }
.tl-grip { position: absolute; top: 1px; left: 50%; transform: translateX(-50%); width: 22px; height: 10px; border-radius: 4px; opacity: 0; cursor: grab; z-index: 3; display: flex; align-items: center; justify-content: center; transition: opacity .15s; touch-action: none; }
.tl-grip i { width: 12px; height: 4px; background: radial-gradient(circle, var(--tl-faint) 1px, transparent 1.4px) 0 0 / 4px 4px; opacity: .9; }
.tl-grip b { display: none; position: absolute; top: 10px; font: 700 9px/1 var(--tl-ui-font); color: var(--tl-acc-ink); }
${SEL.headCell}:hover > .tl-grip, .tl-grip:focus-visible { opacity: .75; }
html[data-tl-grab] .tl-grip { opacity: 1; }
html[data-tl-grab] .tl-grip b { display: block; }
html[data-tl-grab] ${SEL.headCell}[data-tl-drop] { box-shadow: inset 2px 0 0 var(--tl-acc); }
.tl-ghost { position: fixed; left: 0; top: 0; z-index: 99999; pointer-events: none; padding: 4px 9px; border-radius: 8px; background: var(--tl-bg); color: var(--tl-ink); font: 600 12px/1.2 var(--tl-ui-font); box-shadow: 0 8px 22px -10px rgba(15,15,15,.35); }
.tl-fv { display: block; margin-top: 2px; font: 400 11px/1.45 var(--tl-ui-font); color: var(--tl-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; pointer-events: none; }
.tl-card { position: fixed; z-index: 9990; box-sizing: border-box; padding: 12px 14px; border-radius: 10px; background: var(--tl-bg, #fbfaf8); color: var(--c-texPri, #37352f); box-shadow: 0 12px 32px -14px rgba(15,15,15,.24), 0 1px 3px rgba(15,15,15,.05); font: 13px/1.65 var(--tl-ui-font, sans-serif); max-height: 60vh; overflow: hidden; pointer-events: none; animation: tlFade .14s ease; }
:is(body.dark) .tl-card { background: #2b2a28; }
.tl-card-h { font: 600 11px/1.3 var(--tl-ui-font, sans-serif); color: var(--c-texTer, #9b9a97); margin-bottom: 4px; letter-spacing: .02em; }
.tl-card-t { white-space: pre-wrap; word-break: break-word; display: -webkit-box; -webkit-line-clamp: 16; -webkit-box-orient: vertical; overflow: hidden; }
.tl-card-f { margin-top: 10px; padding-top: 8px; box-shadow: inset 0 1px 0 rgba(55,53,47,.08); }
.tl-card-t + .tl-card-f { margin-top: 10px; }
.tl-card > .tl-card-f:first-child { margin-top: 0; padding-top: 0; box-shadow: none; }
.tl-card-kv { display: flex; gap: 10px; font-size: 12.5px; line-height: 1.55; }
.tl-card-kv .k { flex: none; min-width: 64px; color: var(--c-texSec, #787774); }
.tl-card-kv .v { min-width: 0; overflow-wrap: anywhere; }
.tl-card-lv { margin-top: 4px; font-size: 12.5px; line-height: 1.6; }
.tl-card-lv .k { color: var(--c-texSec, #787774); font-size: 11.5px; }
.tl-card-lv .v { display: -webkit-box; -webkit-line-clamp: 12; -webkit-box-orient: vertical; overflow: hidden; }
.tl-fade { position: fixed; z-index: 80; width: 28px; pointer-events: none; }
#tl-fade-l { background: linear-gradient(to right, var(--c-bacPri, #fff), transparent); }
#tl-fade-r { background: linear-gradient(to left, var(--c-bacPri, #fff), transparent); }

/* ---- 焦点: ◎・レンズの欄・チップ・目盛り ---- */
.tl-lensbtn { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-inline-end: 2px; border-radius: 6px; color: var(--tl-ico); cursor: pointer; flex: none; transition: background .15s, color .3s; user-select: none; }
.tl-lensbtn:hover, .tl-lensbtn:focus-visible, .tl-lensbtn[aria-expanded="true"] { background: rgba(55,53,47,.06); color: var(--tl-ink); outline: none; }
.tl-lensbtn.on { color: var(--tl-acc); }
.tl-lensbtn > svg { width: 18px; height: 18px; display: block; }
.tl-lensbtn.busy > svg { animation: tlPulse 1.2s ease-in-out infinite; }
.tl-sats { position: absolute; inset: 0; pointer-events: none; animation: tlOrbit 1.8s linear infinite; }
.tl-sats i { position: absolute; left: 50%; top: 50%; width: 3px; height: 3px; margin: -1.5px; border-radius: 50%; background: var(--tl-acc); transform: rotate(calc(360deg * var(--i) / var(--n))) translateX(12px); transition: transform .38s cubic-bezier(.5,0,.2,1), opacity .38s ease; }
.tl-sats.gather { animation-play-state: paused; }
.tl-sats.gather i { transform: rotate(calc(360deg * var(--i) / var(--n))) translateX(0); opacity: 0; }
.tl-lens { display: none; box-sizing: border-box; margin: 2px 8px 10px; padding: 8px 10px 7px 12px; border-radius: 12px; background: var(--tl-bg); color: var(--tl-ink); font: 14px/1.5 var(--tl-ui-font); position: relative; z-index: 3; }
:is(body.dark) .tl-lens { background: rgba(255,255,255,.045); }
.tl-lens.open { display: block; }
.tl-lens.grow { animation: tlLensIn .2s cubic-bezier(.2,.8,.2,1); }
.tl-lens-in { display: flex; align-items: flex-start; gap: 8px; padding-bottom: 3px; box-shadow: inset 0 -1.5px 0 transparent; transition: box-shadow .2s; }
.tl-lens:focus-within .tl-lens-in { box-shadow: inset 0 -1.5px 0 var(--tl-acc); }
.tl-lens-ic { flex: none; width: 18px; height: 18px; margin-top: 3px; color: var(--tl-acc); }
.tl-lens.busy .tl-lens-ic { animation: tlPulse 1.2s ease-in-out infinite; }
.tl-lens-ic svg { width: 18px; height: 18px; display: block; }
.tl-lens textarea { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; resize: none; padding: 1px 0; margin: 0; min-height: 24px; font: 14px/1.6 var(--tl-ui-font); color: var(--tl-ink); }
.tl-lens textarea::placeholder { color: var(--tl-faint); }
.tl-lens button { font-family: var(--tl-ui-font); }
.tl-send { flex: none; width: 26px; height: 26px; border: 0; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; background: var(--tl-acc); transition: background .2s, transform .15s; }
.tl-send svg { width: 14px; height: 14px; }
.tl-lens textarea:placeholder-shown ~ .tl-send { background: rgba(55,53,47,.16); }
.tl-mapb { flex: none; height: 26px; border: 0; padding: 0 9px; border-radius: 999px; font: 600 12px/1 var(--tl-ui-font) !important; color: var(--tl-acc-ink); background: var(--tl-acc-soft); cursor: pointer; white-space: nowrap; }
.tl-x { flex: none; width: 26px; height: 26px; border: 0; padding: 0; border-radius: 6px; background: none; color: var(--tl-faint); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.tl-x:hover { background: rgba(55,53,47,.06); color: var(--tl-ink); }
.tl-x svg { width: 14px; height: 14px; }
.tl-hint { margin-top: 4px; font: 11px/1.4 var(--tl-ui-font); color: var(--tl-faint); }
.tl-ask { margin-top: 6px; font: 12.5px/1.55 var(--tl-ui-font); color: var(--tl-mute); }
.tl-ask.q { color: var(--tl-ink); }
.tl-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 6px; }
.tl-chips:empty { display: none; }
.tl-c { display: inline-flex; align-items: center; height: 24px; border-radius: 999px; background: var(--tl-acc-soft); color: var(--tl-acc-ink); font: 600 12px/1 var(--tl-ui-font); overflow: hidden; }
.tl-c.sem { background: transparent; box-shadow: inset 0 0 0 1px var(--tl-acc-soft); }
.tl-c.na { background: rgba(55,53,47,.06); color: var(--tl-faint); }
.tl-c-v, .tl-c-x { all: unset; box-sizing: border-box; height: 100%; display: inline-flex; align-items: center; cursor: pointer; }
.tl-c-v { padding: 0 4px 0 10px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tl-c-x { padding: 0 9px 0 4px; opacity: .6; }
.tl-c-x:hover, .tl-c-x:focus-visible { opacity: 1; }
.tl-c-v:focus-visible, .tl-c-x:focus-visible { box-shadow: inset 0 0 0 2px var(--tl-acc); border-radius: 999px; }
.tl-c-in { all: unset; box-sizing: border-box; height: 100%; padding: 0 8px 0 10px; width: 160px; font: 600 12px/1 var(--tl-ui-font); color: var(--tl-ink); background: var(--tl-bg); box-shadow: inset 0 -1.5px 0 var(--tl-acc); }
.tl-star-b { all: unset; cursor: pointer; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; color: var(--tl-faint); font-size: 14px; }
.tl-star-b:hover, .tl-star-b:focus-visible { color: var(--tl-acc); background: rgba(55,53,47,.05); }
.tl-count { margin-inline-start: auto; font: 600 12px/1 var(--tl-ui-font); color: var(--tl-mute); font-variant-numeric: tabular-nums; }
.tl-tags { display: inline-flex; align-items: center; gap: 3px; margin-inline-start: 2px; vertical-align: 1px; }
.tl-rank { display: inline-flex; align-items: center; justify-content: center; min-width: 15px; height: 15px; padding: 0 3px; border-radius: 999px; background: var(--tl-acc-soft); color: var(--tl-acc-ink); font: 700 10px/1 var(--tl-ui-font); }
.tl-star { color: var(--tl-acc); font-size: 11px; cursor: help; outline: none; }
.tl-star:focus-visible { box-shadow: 0 0 0 2px var(--tl-acc-soft); border-radius: 3px; }
#tl-ticks { position: fixed; z-index: 85; width: 8px; pointer-events: none; }
#tl-ticks i { position: absolute; left: 1px; right: 1px; height: 3px; margin-top: -1.5px; border-radius: 2px; background: var(--tl-acc); opacity: .85; pointer-events: auto; cursor: pointer; }
#tl-ticks i:hover { opacity: 1; transform: scaleY(1.6); }
.tl-flash { position: fixed; z-index: 89; pointer-events: none; border-radius: 4px; animation: tlFlash .6s ease-out forwards; }
.tl-shake { animation: tlShake .32s ease; }

/* ---- 小窓・お知らせ・吹き出し ---- */
.tl-pop { position: fixed; z-index: 100000; box-sizing: border-box; overflow: auto; padding: 8px; border-radius: 12px; background: var(--tl-bg); color: var(--tl-ink); box-shadow: 0 14px 36px -14px rgba(15,15,15,.3), 0 1px 3px rgba(15,15,15,.06); font: 13px/1.5 var(--tl-ui-font); animation: tlFade .14s ease; }
.tl-pop-h { padding: 4px 8px 6px; font-weight: 650; font-size: 12px; color: var(--tl-mute); }
.tl-pop-s { padding: 6px 8px 2px; font-size: 11px; font-weight: 600; color: var(--tl-faint); }
.tl-pop-d { height: 1px; margin: 6px 4px; background: rgba(55,53,47,.08); }
.tl-pop-i { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 7px; cursor: pointer; }
.tl-pop-i:hover, .tl-pop-i:focus-visible { background: rgba(55,53,47,.06); }
.tl-pop-i .l { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tl-pop-i .h { font-size: 11px; color: var(--tl-faint); }
.tl-pop-del { padding: 0 4px; color: var(--tl-faint); }
.tl-note { padding: 4px 8px; font-size: 11.5px; line-height: 1.55; color: var(--c-texSec, #787774); }
.tl-link { all: unset; cursor: pointer; margin: 6px 8px; font-size: 12px; color: var(--tl-acc-ink); }
.tl-pri { display: flex; flex-direction: column; gap: 2px; margin: 4px 0; }
.tl-pri-r { display: flex; align-items: center; gap: 6px; padding: 3px 6px; border-radius: 6px; font-size: 12.5px; }
.tl-pri-r:hover { background: rgba(55,53,47,.04); }
.tl-pri-n { width: 16px; text-align: center; font-weight: 700; font-size: 11px; color: var(--tl-faint); }
.tl-pri-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tl-pri-b, .tl-pri-lg { all: unset; cursor: pointer; padding: 1px 6px; border-radius: 5px; font-size: 11.5px; color: var(--tl-mute); }
.tl-pri-b:hover:not(:disabled), .tl-pri-lg:hover:not(:disabled) { background: rgba(55,53,47,.08); }
.tl-pri-b:disabled, .tl-pri-lg:disabled { opacity: .3; cursor: default; }
.tl-pri-lg.on { color: var(--tl-acc-ink); background: var(--tl-acc-soft); }
.tl-set { display: flex; flex-direction: column; gap: 6px; font: 13px/1.5 var(--tl-ui-font, sans-serif); }
.tl-set-t { display: flex; align-items: baseline; gap: 6px; cursor: pointer; }
.tl-set-n { color: var(--c-texTer, #9b9a97); font-size: 11.5px; }
.tl-set-h { margin-top: 8px; font-size: 11.5px; font-weight: 600; color: var(--c-texSec, #787774); }
.tl-set-k { display: flex; align-items: center; gap: 6px; }
.tl-kbd { all: unset; cursor: pointer; padding: 2px 8px; border-radius: 6px; font: 600 12px/1.4 var(--tl-ui-font, sans-serif); background: rgba(55,53,47,.06); box-shadow: inset 0 -1px 0 rgba(55,53,47,.12); }
.tl-toast { position: fixed; left: 50%; bottom: 28px; z-index: 100001; transform: translate(-50%, 12px); opacity: 0; pointer-events: none; padding: 9px 14px; border-radius: 10px; background: var(--tl-bg); color: var(--tl-ink); box-shadow: 0 12px 30px -12px rgba(15,15,15,.3); font: 13px/1.4 var(--tl-ui-font); transition: opacity .2s, transform .2s; }
.tl-toast.on { opacity: 1; transform: translate(-50%, 0); }
.tl-tip { position: fixed; z-index: 100002; max-width: 300px; padding: 6px 10px; border-radius: 8px; background: var(--tl-bg); color: var(--tl-ink); box-shadow: 0 8px 22px -10px rgba(15,15,15,.3); font: 12px/1.5 var(--tl-ui-font); pointer-events: none; }

/* ---- 倍率: 星図 ---- */
html[data-tl-key] ${SEL.frame} ${SEL.table}:not(${SEL.inlineDb} *) { transition: opacity .3s ease; }
html[data-tl-map] ${SEL.frame} ${SEL.table}:not(${SEL.inlineDb} *) { opacity: 0 !important; pointer-events: none !important; }
.tl-map { position: fixed; z-index: 70; overflow: hidden; outline: none; background: var(--c-bacPri, #fff); color: var(--tl-ink); font-family: var(--tl-ui-font); touch-action: none; user-select: none; animation: tlFade .25s ease; }
.tl-map.out { animation: tlFadeOut .6s ease forwards; background: transparent; }
.tl-map.grab { cursor: grabbing; }
.tl-map-sky { position: absolute; inset: -40px; pointer-events: none; opacity: .75;
  background-image: radial-gradient(1px 1px at 23px 41px, var(--tl-star) 50%, transparent 52%), radial-gradient(1px 1px at 117px 13px, var(--tl-star) 50%, transparent 52%), radial-gradient(1.4px 1.4px at 71px 133px, var(--tl-star) 50%, transparent 52%), radial-gradient(1px 1px at 160px 96px, var(--tl-star) 50%, transparent 52%),
    radial-gradient(1px 1px at 41px 211px, var(--tl-star) 50%, transparent 52%), radial-gradient(1.2px 1.2px at 233px 57px, var(--tl-star) 50%, transparent 52%), radial-gradient(1px 1px at 197px 190px, var(--tl-star) 50%, transparent 52%);
  background-size: 190px 170px, 270px 250px; }
.tl-map-wait { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--tl-faint); font-size: 13px; }
.tl-map-v { position: absolute; inset: 0; overflow: hidden; }
.tl-map-e { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.tl-map-e line { stroke: var(--tl-acc); stroke-width: 1; stroke-opacity: .3; transition: stroke-opacity .2s; }
.tl-map-e line.nb { stroke-opacity: .85; }
.tl-map-e line.lit { stroke-opacity: .55; }
.tl-map-e line.dim { stroke-opacity: .07; }
.tl-map[data-hov] .tl-map-e line:not(.nb) { stroke-opacity: .07; }
.tl-map-c { position: absolute; left: 0; top: 0; }
.tl-mstar { all: unset; position: absolute; left: 0; top: 0; width: 0; height: 0; cursor: pointer; transition: opacity .2s; will-change: transform; }
.tl-mstar .halo { position: absolute; left: -18px; top: -18px; width: 36px; height: 36px; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, var(--tl-halo, var(--tl-glow)) 0%, transparent 68%); opacity: .6; transition: transform .2s, opacity .2s; }
.tl-mstar .ic { position: absolute; left: -10px; top: -10px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: var(--tl-ico); }
.tl-mstar .ic img { width: 100%; height: 100%; object-fit: cover; border-radius: 3px; display: block; }
.tl-mstar .ic .em { font-size: 17px; line-height: 1; }
.tl-mstar .ic .tl-defic { width: 100%; height: 100%; }
.tl-mstar .lb { position: absolute; top: 13px; left: 0; transform: translateX(-50%); white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; font-size: 11px; line-height: 1.3; color: var(--tl-ink); opacity: 0; pointer-events: none; text-shadow: 0 0 3px var(--c-bacPri, #fff), 0 0 6px var(--c-bacPri, #fff); transition: opacity .15s; }
.tl-mstar.hub .halo { left: -36px; top: -36px; width: 72px; height: 72px; opacity: .5; }
.tl-mstar.hub .ic { left: -14px; top: -14px; width: 28px; height: 28px; }
.tl-mstar.hub .ic .em { font-size: 24px; }
.tl-mstar.hub .lb { top: 18px; opacity: .95; font-weight: 600; font-size: 12px; }
.tl-map.lbl .tl-mstar .lb, .tl-mstar.hov .lb, .tl-mstar:focus-visible .lb, .tl-mstar.nb .lb { opacity: 1; }
.tl-mstar.hov .halo, .tl-mstar:focus-visible .halo { transform: scale(1.35); opacity: .9; }
.tl-mstar:focus-visible .ic { box-shadow: 0 0 0 2px var(--tl-acc); }
.tl-mstar.dim { opacity: .28; }
.tl-map[data-hov] .tl-mstar:not(.hov):not(.nb) { opacity: .22 !important; }
.tl-map-bar { position: absolute; right: 12px; bottom: 12px; display: flex; gap: 2px; padding: 4px; border-radius: 10px; background: var(--tl-bg); box-shadow: 0 8px 22px -12px rgba(15,15,15,.3); }
.tl-map-b { all: unset; cursor: pointer; padding: 4px 9px; border-radius: 7px; font: 600 12px/1.2 var(--tl-ui-font); color: var(--tl-mute); }
.tl-map-b:hover, .tl-map-b:focus-visible { background: rgba(55,53,47,.07); color: var(--tl-ink); }

/* ---- 色: サイドピークの上端のにじみ ---- */
[data-tl-tint] { background-image: linear-gradient(hsl(var(--tl-tint) / calc(var(--tl-ta) * .10)), transparent 160px) !important; background-repeat: no-repeat !important; background-attachment: local !important; animation: tlTa .4s ease forwards; }
:is(body.dark) [data-tl-tint] { background-image: linear-gradient(hsl(var(--tl-tint) / calc(var(--tl-ta) * .14)), transparent 160px) !important; }

@keyframes tlFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes tlFadeOut { 0% { opacity: 1; } 60% { opacity: 1; } 100% { opacity: 0; } }
@keyframes tlTa { from { --tl-ta: 0; } to { --tl-ta: 1; } }
@keyframes tlLensIn { from { opacity: 0; clip-path: inset(0 0 100% 0 round 12px); transform: translateY(-3px); } to { opacity: 1; clip-path: inset(0 0 0 0 round 12px); transform: none; } }
@keyframes tlOrbit { to { transform: rotate(360deg); } }
@keyframes tlPulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
@keyframes tlFlash { 0% { box-shadow: inset 0 0 0 999px oklch(64% .13 var(--neb-ht, 190) / .24); } 100% { box-shadow: inset 0 0 0 999px oklch(64% .13 var(--neb-ht, 190) / 0); } }
@keyframes tlShake { 0%, 100% { transform: none; } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
@media (prefers-reduced-motion: reduce) {
  .tl-lens.grow, .tl-sats, .tl-card, .tl-pop, .tl-map, .tl-shake, .tl-lensbtn.busy > svg, .tl-lens.busy .tl-lens-ic { animation: none !important; }
  .tl-flash { animation-duration: .01s !important; animation-delay: .59s !important; }
  [data-tl-tint] { animation: none !important; --tl-ta: 1; }
  [role="tablist"][data-tl-tabs] > div:first-child, .tl-sats i, .tl-mstar, .tl-mstar .halo { transition: none !important; }
  .tl-ui { transition: none !important; }
}
`;

  /* ============================================================
   *  12. 走らせる（監視はすべて requestAnimationFrame にまとめて 1 フレーム 1 回）
   * ============================================================ */
  let fieldRaf = 0;
  function fieldSoon() { if (fieldRaf) return; fieldRaf = requestAnimationFrame(() => { fieldRaf = 0; try { fieldCompute(); } catch (e) { oops('field', e); } }); }
  let ro = null;
  const RO_SEEN = new WeakSet();
  function observeCtx(c) {
    if (!c.scroller || RO_SEEN.has(c.scroller)) return;
    RO_SEEN.add(c.scroller);
    if (!ro) ro = new ResizeObserver(() => { fieldSoon(); if (MAP.on) mapPlace(); fadeSoon(); });
    ro.observe(c.scroller);
    let scrolling = 0;
    c.scroller.addEventListener('scroll', () => {
      cardHide(); tipHide();
      fadeSoon();
      clearTimeout(scrolling);
      scrolling = setTimeout(() => { scrolling = 0; }, 140);
    }, { passive: true });
  }
  function headSig(c) {
    const hcs = headCellsOf(c.table);
    let s = hcs.length + ':';
    for (const h of hcs) s += h.style.width + '/' + ((h.firstElementChild || h).textContent || '').length + ',';
    return s;
  }
  function ctxLeave() {
    if (MAP.on) mapExit(null, true);
    CTX = null;
    de.removeAttribute('data-tl-key');
    de.removeAttribute('data-tl-lens');
    fieldOff();
    tabsOff();
    setCss('tl-lens-css', '');
    cardHide();
    fadeSoon();
    if (LZ.bar) LZ.bar.classList.remove('open');
  }
  function afterCtx() {
    const c = CTX;
    if (!c || !c.db) return;
    observeCtx(c);
    lensBtnEnsure(c);
    if (LZ.bar && (LZ.bar.classList.contains('open') || LZ.bar.isConnected)) lensBarEnsure(c);
    const k = lensKey();
    if (LZ.cur && LZ.cur.key !== k) LZ.cur = null;
    if (!LZ.cur && LZ.mem.has(k)) { LZ.cur = LZ.mem.get(k); lensRecallCols(c, LZ.cur.plan); }
    else if (!LZ.cur && FS.lensRecall.size) FS.lensRecall = new Set();
    lensPaint(false);
    FS.sig = '';
    fieldSoon(); tabsSoon(); rowSoon();
  }
  function ctxSync() {
    const c = findCtx();
    if (!c) { if (CTX) ctxLeave(); return; }
    if (CTX && CTX.key === c.key && CTX.bid === c.bid) {
      /* 同じビュー: 要素の入れ替わりだけ受け取る */
      const moved = CTX.table !== c.table || CTX.tablist !== c.tablist || CTX.scroller !== c.scroller;
      Object.assign(CTX, { table: c.table, tables: c.tables, scroller: c.scroller, tablist: c.tablist, tabsRow: c.tabsRow, frame: c.frame });
      if (moved && CTX.db) afterCtx();
      return;
    }
    const prev = CTX;
    if (prev && MAP.on) mapExit(null, true);
    if (prev && prev.key !== c.key) { FS.recall = new Set(); FS.tabX = 0; FS.tabUser = false; FS.level = 0; FS.plan = null; }
    if (prev && prev.bid === c.bid && prev.db) c.db = prev.db;
    CTX = c;
    de.setAttribute('data-tl-key', c.key);
    const ready = (db) => {
      if (CTX !== c) return;
      c.db = db;
      if (!db) return;
      viewOf(c.vid || db.viewIds[0]).then((v) => { if (CTX !== c) return; c.view = v; if (!c.vid && v) c.vid = v.id; afterCtx(); }).catch(() => afterCtx());
    };
    if (c.db) ready(c.db); else dbOf(c.bid).then(ready);
  }
  let tickRaf = 0;
  function tick() {
    if (tickRaf) return;
    tickRaf = requestAnimationFrame(() => {
      tickRaf = 0;
      try {
        ST.runs++;
        ctxSync();
        const c = CTX;
        if (c && c.db) {
          lensBtnEnsure(c);
          if (LZ.bar && LZ.bar.classList.contains('open') && !LZ.bar.isConnected) lensBarEnsure(c);
          else if (LZ.bar && LZ.bar.classList.contains('open')) lensBarEnsure(c);
          const sig = headSig(c);
          if (sig !== FS.sig) { FS.sig = sig; fieldSoon(); }
          else if (FS.plan) { const hr = headRowOf(c.table); if (hr && ((FS.plan.folded.size || FS.plan.chip) && !hr.querySelector(':scope > .tl-hchips') || !hr.querySelector('.tl-grip'))) { hchips(c, FS.plan); grips(c); } }
          rowSoon();
          if (c.tablist && P.field && !TABOBS.has(c.tablist)) { tabsWatch(c.tablist); tabsSoon(); }
        }
        peekPass();
      } catch (e) { oops('tick', e); }
    });
  }
  const OURS = /(^|\s)tl-/;
  function oursNode(n) { return n.nodeType === 1 && ((typeof n.className === 'string' && OURS.test(n.className)) || /^tl-/.test(n.id || '')); }
  function boot() {
    de = document.documentElement;
    setCss('tl-css', CSS);
    new MutationObserver((ms) => {
      for (const m of ms) {
        const t = m.target;
        if (t.nodeType === 1 && t.closest && t.closest('.tl-ui, .tl-fv, .tl-tags, .tl-hchips, .tl-grip, #tl-map')) continue;
        let mine = true;
        for (const n of m.addedNodes) if (!oursNode(n)) { mine = false; break; }
        if (mine) for (const n of m.removedNodes) if (!oursNode(n)) { mine = false; break; }
        if (mine && (m.addedNodes.length || m.removedNodes.length)) {
          /* Notion が描き直しで私たちの部品を外した時は、かけ直す */
          if ([...m.removedNodes].some((n) => n === LZ.bar || n === LZ.btn)) { tick(); return; }
          continue;
        }
        /* ビューが変わった瞬間に古い規則が外れるよう、html の印だけはここで（描く前に）合わせる */
        const v = new URLSearchParams(location.search).get('v');
        if (v && CTX && id32(v).slice(0, 12) !== CTX.key && de.getAttribute('data-tl-key') === CTX.key) de.setAttribute('data-tl-key', id32(v).slice(0, 12));
        tick();
        return;
      }
    }).observe(document.body, { childList: true, subtree: true });
    let href = location.href;
    setInterval(() => { if (location.href !== href) { href = location.href; tick(); } }, 400);
    window.addEventListener('popstate', () => setTimeout(tick, 0));
    window.addEventListener('resize', () => { fieldSoon(); fadeSoon(); if (MAP.on) mapPlace(); });
    document.addEventListener('pointerover', safe('over', onRowOver), true);
    document.addEventListener('pointerout', (e) => { if (hovIt && !(e.relatedTarget && hovIt.contains(e.relatedTarget))) { hovIt = null; cardHide(); } }, true);
    document.addEventListener('wheel', safe('wheel', onWheelTable), { passive: false, capture: true });
    window.addEventListener('keydown', safe('key', (e) => {
      if (e.isComposing || e.keyCode === 229) return;
      const k = P.key || {};
      if (P.lens && CTX && CTX.db && e.code === (k.code || 'KeyL') && !!e.altKey === !!k.alt && !!e.ctrlKey === !!k.ctrl && !!e.metaKey === !!k.meta && !!e.shiftKey === !!k.shift) {
        e.preventDefault(); e.stopPropagation();
        if (LZ.bar && LZ.bar.classList.contains('open') && document.activeElement === LZ.ta) lensClose(); else lensOpen(true);
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && LZ.cur && CTX && !MAP.on) {
        const a = document.activeElement;
        const typing = a && a !== LZ.ta && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
        if (!typing && lensStep(e.key === 'ArrowDown' ? 1 : -1)) { e.preventDefault(); e.stopPropagation(); }
      }
    }), true);
    if (RM.addEventListener) RM.addEventListener('change', () => { fieldSoon(); });
    tick();
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot, { once: true });

  window.__c41 = {
    version: VERSION,
    status: () => Object.assign({}, ST, {
      key: CTX && CTX.key, db: CTX && CTX.db && CTX.db.name, view: CTX && CTX.view && CTX.view.name,
      cols: FS.cols.map((x) => ({ ci: x.ci, name: x.name, pid: x.pid, nat: x.nat, long: x.long, title: x.title })),
      plan: FS.plan && { L: FS.plan.L, k: FS.plan.k, maxK: FS.plan.maxK, folded: [...FS.plan.folded], widths: [...FS.plan.widths], fv: FS.plan.fv, sticky: FS.plan.sticky, chip: FS.plan.chip, narrow: FS.plan.narrow, pad: FS.plan.pad, extra: FS.plan.extra, pri: FS.plan.pri },
      lens: LZ.cur && { text: LZ.cur.text, plan: LZ.cur.plan, hits: LZ.cur.hits ? LZ.cur.hits.size : 0, total: LZ.cur.total },
      map: MAP.on ? { mode: MAP.mode, nodes: MAP.nodes.length, edges: MAP.edges.length, z: MAP.z, clu: MAP.clu } : null,
      missing: [...MISS], prefs: JSON.parse(JSON.stringify(P))
    }),
    set(o) { Object.assign(P, o || {}); savePrefs(); applyPrefs(); return JSON.parse(JSON.stringify(P)); },
    lens(text, plan) { if (!CTX) return false; lensOpen(false); if (LZ.ta) { LZ.ta.value = text || ''; lensGrow(); } lensRun(String(text || ''), plan || null); return true; },
    release: () => lensRelease(),
    map: (on) => (on === false ? mapExit() : mapEnter()),
    long(pid, v) { if (!CTX || !CTX.db) return null; const m = LONG[CTX.db.cid] || (LONG[CTX.db.cid] = {}); if (v == null) delete m[pid]; else m[pid] = !!v; save(LS.long, LONG); fieldSoon(); return m; },
    field: () => { fieldCompute(); return FS.plan; },
    tint: (id) => tintOf(id)
  };
})();
