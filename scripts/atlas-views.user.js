// ==UserScript==
// @name         « No »　³¹ _ Atlas Views
// @namespace    https://cordivestium.local/atlas-views
// @version      1.0.0
// @description  Notion に無い新しいビュー「Atlas」。「Add a new view」の空いている枠に Atlas を追加。書架（背表紙が棚に並ぶ・縦書き・グループごとの棚）／年表（日付で年・月ごとの縦のタイムライン）／集計（Excel のピボット: 2 つのプロパティのクロス集計・合計・押すと一覧）を切り替えて使える。ビューのフィルター・並べ替えはそのまま効く。本・ページを押すとサイドピークで開く。既存のビューも ⌃⌥V で Atlas に切り替え／戻す。
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
 *   ・作り方: 「Add a new view」→ Atlas。中では Notion の「Table」を作り、その表ビューを Atlas として描く
 *     （名前は「Atlas」に。Notion 側のデータ・プロパティは何も変えない。Atlas をやめれば元の表に戻る）。
 *     既存のビューは、そのビューを開いて ⌃⌥V で Atlas ⇄ 元の見た目。
 *   ・書架（Shelf）: ページを背表紙に。題名は縦書き、背の高さは題名の長さ、色はグループ（またはアイコン）から。
 *     グループ（Series などのリレーション・セレクト・テキスト）ごとに棚を分け、棚の見出しにアイコンと件数。
 *   ・年表（Chronicle）: 日付のプロパティ（無ければ作成日時）で 年 → 月 に分け、縦の線に沿って並べる。
 *     右に添える情報（セレクト・リレーションなど）を選べる。
 *   ・集計（Pivot）: 行と列にプロパティを選ぶと件数のクロス集計（行・列の合計付き）。数を押すとそのページの一覧。
 *     数値のプロパティを選ぶと件数の代わりに合計。
 *   ・データ: ビューのフィルター・並べ替え（query2）を付けて queryCollection で読む（最大 1000 件）。
 *     Notion の見た目（色・書体・余白）に合わせ、題名は明朝（Serif）。
 *   ・設定（どのプロパティで分けるか など）はビューごとにこのブラウザへ保存。
 *   ・フルページの DB（URL に ?v= があるビュー）で動く。インライン DB は対象外。
 *   ・コンソール: __c31.status() ／ __c31.toggle() ／ __c31.refresh()
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '1.0.0';
  const TAG = '[³¹ v' + VERSION + ']';
  if (window.__c31 && window.__c31.version) { console.warn(TAG, '旧版が動いています'); return; }

  const LS_VIEWS = 'c31.views.v1';   // { viewId: { layout, group, date, side, rows, cols, val } }
  let VIEWS = {};
  try { VIEWS = JSON.parse(localStorage.getItem(LS_VIEWS) || '{}') || {}; } catch (e) { VIEWS = {}; }
  const saveViews = () => { try { localStorage.setItem(LS_VIEWS, JSON.stringify(VIEWS)); } catch (e) { /* noop */ } };
  const ST = { renders: 0, lastError: '', lastCount: 0 };

  /* ============================================================
   *  API
   * ============================================================ */
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
  function activeUser() { const m = /(?:^|;\s*)notion_user_id=([^;]+)/.exec(document.cookie || ''); return m ? decodeURIComponent(m[1]) : ''; }
  async function apiPost(path, body, spaceId) {
    const headers = { 'Content-Type': 'application/json' };
    const u = activeUser();
    if (u) headers['x-notion-active-user-header'] = u;
    if (spaceId) headers['x-notion-space-id'] = spaceId;
    const r = await fetch(location.origin + path, { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(body) });
    const t = await r.text();
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 160));
    return t ? JSON.parse(t) : {};
  }
  const unwrap = (node) => (node ? (node.value && node.value.value ? node.value.value : node.value || null) : null);
  async function getRecords(table, ids) {
    ids = [...new Set(ids.filter(Boolean))];
    const map = new Map();
    for (let i = 0; i < ids.length; i += 80) {
      const part = ids.slice(i, i + 80);
      let j;
      try { j = await apiPost('/api/v3/syncRecordValues', { requests: part.map((id) => ({ table, id, version: -1 })) }); }
      catch (e) { j = await apiPost('/api/v3/syncRecordValues', { requests: part.map((id) => ({ pointer: { table, id }, version: -1 })) }); }
      const rm = (j && j.recordMap && j.recordMap[table]) || {};
      for (const id of part) { const v = unwrap(rm[id]); if (v) map.set(id, v); }
    }
    return map;
  }
  const dash = (id) => (/^[0-9a-f]{32}$/i.test(id) ? id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5') : id);
  function currentViewId() { const v = new URLSearchParams(location.search).get('v'); return v ? dash(v) : ''; }
  async function loadData(vid) {
    const vm = await getRecords('collection_view', [vid]);
    const view = vm.get(vid);
    if (!view) throw new Error('ビューを読み取れませんでした');
    const spaceId = view.space_id;
    let cid = view.format && view.format.collection_pointer && view.format.collection_pointer.id;
    if (!cid && view.parent_id) {
      const bm = await getRecords('block', [view.parent_id]);
      const b = bm.get(view.parent_id);
      cid = b && (b.collection_id || (b.format && b.format.collection_pointer && b.format.collection_pointer.id));
    }
    if (!cid) throw new Error('DB を見つけられませんでした');
    const cm = await getRecords('collection', [cid]);
    const col = cm.get(cid);
    const schema = (col && col.schema) || {};
    const q = view.query2 || {};
    const loader = { type: 'reducer', reducers: { collection_group_results: { type: 'results', limit: 1000 } }, sort: q.sort || [], searchQuery: '', userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo' };
    if (q.filter) loader.filter = q.filter;
    let j;
    try { j = await apiPost('/api/v3/queryCollection?src=c31', { source: { type: 'collection', id: cid, spaceId }, collectionView: { id: vid, spaceId }, loader }, spaceId); }
    catch (e) { j = await apiPost('/api/v3/queryCollection?src=c31', { collection: { id: cid, spaceId }, collectionView: { id: vid, spaceId }, loader }, spaceId); }
    const res = (j && j.result && j.result.reducerResults && j.result.reducerResults.collection_group_results) || {};
    const ids = res.blockIds || (j && j.result && j.result.blockIds) || [];
    const rmb = (j && j.recordMap && j.recordMap.block) || {};
    const rows = [];
    const missing = [];
    for (const id of ids) { const v = unwrap(rmb[id]); if (v) rows.push(v); else missing.push(id); }
    if (missing.length) { const more = await getRecords('block', missing); for (const id of missing) { const v = more.get(id); if (v) rows.push(v); } rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); }
    /* リレーションの先の題名 */
    const relIds = new Set();
    for (const r of rows) for (const [pid, sc] of Object.entries(schema)) if (sc.type === 'relation') relIds2(r.properties && r.properties[pid]).forEach((x) => relIds.add(x));
    const rel = relIds.size ? await getRecords('block', [...relIds]) : new Map();
    return { view, schema, rows, rel, spaceId, cid };
  }
  function relIds2(v) {
    const out = [];
    for (const seg of v || []) for (const a of (Array.isArray(seg[1]) ? seg[1] : [])) if (a[0] === 'p' && a[1]) out.push(a[1]);
    return out;
  }
  async function renameView(vid, name) {
    const vm = await getRecords('collection_view', [vid]);
    const v = vm.get(vid);
    if (!v) return;
    await apiPost('/api/v3/saveTransactions', { requestId: uuid(), transactions: [{ id: uuid(), spaceId: v.space_id, debug: { userAction: 'c31.renameView' }, operations: [{ pointer: { table: 'collection_view', id: vid, spaceId: v.space_id }, path: ['name'], command: 'set', args: name }] }] }, v.space_id);
  }

  /* ============================================================
   *  値
   * ============================================================ */
  const plain = (v) => (v || []).map((s) => (s[0] === '‣' ? '' : String(s[0]))).join('');
  const titleOf = (r) => plain(r && r.properties && r.properties.title).trim();
  function dateOf(v) { for (const seg of v || []) for (const a of (Array.isArray(seg[1]) ? seg[1] : [])) if (a[0] === 'd' && a[1]) return a[1].start_date || ''; return ''; }
  function iconSrc(icon, id) {
    const s = String(icon || '').trim();
    if (!s) return null;
    if (/^(https?:|data:|\/)/.test(s)) return { src: s };
    if (/^attachment:/i.test(s)) return { src: '/image/' + encodeURIComponent(s) + '?table=block&id=' + encodeURIComponent(id || '') + '&cache=v2' };
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return null;
    return { emoji: s };
  }
  /* 分ける値（複数あり得る）: [{ key, label, icon }] */
  function groupsOf(r, pid, D) {
    if (!pid) return [{ key: '', label: '', icon: null }];
    const sc = D.schema[pid];
    if (pid === '__created') return [{ key: (new Date(r.created_time).getFullYear()) + '', label: String(new Date(r.created_time).getFullYear()), icon: null }];
    if (!sc) return [{ key: '', label: '', icon: null }];
    const v = r.properties && r.properties[pid];
    if (sc.type === 'relation') {
      const ids = relIds2(v);
      if (!ids.length) return [{ key: '', label: '', icon: null }];
      return ids.map((id) => { const t = D.rel.get(id); return { key: id, label: (t && titleOf(t)) || '（無題）', icon: t && t.format && t.format.page_icon ? iconSrc(t.format.page_icon, id) : null }; });
    }
    if (sc.type === 'multi_select') {
      const names = plain(v).split(',').map((x) => x.trim()).filter(Boolean);
      return names.length ? names.map((n) => ({ key: n, label: n, icon: null, color: optColor(sc, n) })) : [{ key: '', label: '', icon: null }];
    }
    if (sc.type === 'select' || sc.type === 'status') { const n = plain(v).trim(); return [{ key: n, label: n, icon: null, color: optColor(sc, n) }]; }
    if (sc.type === 'checkbox') { const y = plain(v) === 'Yes'; return [{ key: y ? 'Yes' : 'No', label: y ? '✓' : '—', icon: null }]; }
    if (sc.type === 'date') { const d = dateOf(v); return [{ key: d.slice(0, 4), label: d.slice(0, 4), icon: null }]; }
    const t = plain(v).trim();
    return [{ key: t, label: t, icon: null }];
  }
  function optColor(sc, name) { const o = (sc.options || []).find((x) => x.value === name); return o ? o.color : ''; }
  function numOf(r, pid) { const n = parseFloat(plain(r.properties && r.properties[pid]).replace(/,/g, '')); return isFinite(n) ? n : null; }
  const PALETTE = { default: '#8E8B86', gray: '#8E8B86', brown: '#9F6B53', orange: '#D9730D', yellow: '#CB912F', green: '#448361', blue: '#337EA9', purple: '#9065B0', pink: '#C14C8A', red: '#D44C47' };
  const SPINES = ['#5B6B7A', '#7A5C4F', '#4F6B5A', '#6B5B7A', '#7A6B4F', '#4F5F7A', '#7A4F5C', '#5C7A72', '#8A6E52', '#56627D', '#6E7A55', '#7D5A6E'];
  const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const iconHtml = (ic, cls) => (!ic ? '' : ic.src ? '<span class="' + cls + '"><img alt="" src="' + esc(ic.src) + '"></span>' : '<span class="' + cls + ' c31-emo">' + esc(ic.emoji) + '</span>');
  const rowIcon = (r) => (r.format && r.format.page_icon ? iconSrc(r.format.page_icon, r.id) : null);

  /* ============================================================
   *  描画
   * ============================================================ */
  let host = null, data = null, dataFor = '', loading = false;
  const conf = (vid) => (VIEWS[vid] || (VIEWS[vid] = { layout: 'shelf' }));
  function pickDefaults(c, D) {
    const ids = Object.keys(D.schema);
    const by = (types, name) => ids.find((k) => types.includes(D.schema[k].type) && (!name || D.schema[k].name === name));
    if (c.group === undefined) c.group = by(['relation'], 'Series') || by(['select', 'status']) || by(['relation']) || by(['multi_select']) || '';
    if (c.date === undefined) c.date = by(['date']) || '__created';
    if (c.side === undefined) c.side = by(['relation'], 'Series') || by(['select', 'status']) || '';
    if (c.rows === undefined) c.rows = by(['select', 'status']) || by(['relation']) || '';
    if (c.cols === undefined) c.cols = ids.find((k) => k !== c.rows && ['select', 'status', 'relation', 'multi_select', 'checkbox'].includes(D.schema[k].type)) || '';
    if (c.val === undefined) c.val = '';
  }
  function propOptions(D, types, cur, extra) {
    const opts = Object.keys(D.schema).filter((k) => !types || types.includes(D.schema[k].type)).sort((a, b) => (a === 'title' ? -1 : b === 'title' ? 1 : D.schema[a].name.localeCompare(D.schema[b].name)));
    return (extra || []).map(([v, l]) => '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(l) + '</option>').join('') +
      opts.map((k) => '<option value="' + esc(k) + '"' + (k === cur ? ' selected' : '') + '>' + esc(D.schema[k].name) + '</option>').join('');
  }
  const GROUPABLE = ['relation', 'select', 'status', 'multi_select', 'checkbox', 'text', 'title', 'date', 'number', 'url'];
  function toolbar(vid, D) {
    const c = conf(vid);
    const seg = [['shelf', '書架'], ['chron', '年表'], ['pivot', '集計']].map(([k, l]) => '<button data-lay="' + k + '"' + (c.layout === k ? ' data-on="1"' : '') + '>' + l + '</button>').join('');
    let opts = '';
    if (c.layout === 'shelf') opts = '<label>棚<select data-k="group">' + propOptions(D, GROUPABLE, c.group, [['', '分けない']]) + '</select></label>';
    else if (c.layout === 'chron') opts = '<label>日付<select data-k="date">' + propOptions(D, ['date'], c.date, [['__created', '作成日時']]) + '</select></label><label>添える<select data-k="side">' + propOptions(D, GROUPABLE, c.side, [['', 'なし']]) + '</select></label>';
    else opts = '<label>行<select data-k="rows">' + propOptions(D, GROUPABLE, c.rows, [['', '—']]) + '</select></label><label>列<select data-k="cols">' + propOptions(D, GROUPABLE, c.cols, [['', '—']]) + '</select></label><label>値<select data-k="val">' + propOptions(D, ['number'], c.val, [['', '件数']]) + '</select></label>';
    return '<div class="c31-bar"><span class="c31-brand">✦ Atlas</span><div class="c31-seg">' + seg + '</div><div class="c31-opts">' + opts + '</div><span class="c31-grow"></span><span class="c31-cnt">' + D.rows.length + ' 件</span><button class="c31-btn" data-a="refresh" title="読み直す">↻</button><button class="c31-btn" data-a="off" title="この表を元の見た目に戻す（⌃⌥V）">表に戻す</button></div>';
  }
  function renderShelf(vid, D) {
    const c = conf(vid);
    const groups = new Map();
    for (const r of D.rows) for (const g of groupsOf(r, c.group, D)) {
      if (!groups.has(g.key)) groups.set(g.key, Object.assign({ rows: [] }, g));
      groups.get(g.key).rows.push(r);
    }
    const list = [...groups.values()].sort((a, b) => (a.key === '' ? 1 : b.key === '' ? -1 : 0));
    return list.map((g) => {
      const tint = g.color ? PALETTE[g.color] || null : null;
      const spines = g.rows.map((r) => {
        const t = titleOf(r) || '（無題）';
        const len = [...t].reduce((n, ch) => n + (/[\u0000-ÿ]/.test(ch) ? 0.55 : 1), 0);
        const h = Math.max(118, Math.min(232, 74 + len * 13));
        const base = tint || SPINES[hash(g.key || t) % SPINES.length];
        const shade = 0.86 + (hash(r.id) % 14) / 100;
        return '<a class="c31-spine" data-id="' + esc(r.id) + '" href="/' + esc(r.id.replace(/-/g, '')) + '" title="' + esc(t) + '" style="--h:' + h + 'px;--c:' + base + ';--k:' + shade.toFixed(2) + '">' +
          iconHtml(rowIcon(r), 'c31-sico') + '<span class="c31-stitle">' + esc(t) + '</span><span class="c31-sband"></span></a>';
      }).join('');
      const head = c.group ? '<div class="c31-gh">' + iconHtml(g.icon, 'c31-gico') + '<span class="c31-gt">' + esc(g.label || '（なし）') + '</span><span class="c31-gc">' + g.rows.length + '</span></div>' : '';
      return '<section class="c31-shelfg">' + head + '<div class="c31-shelf">' + spines + '</div></section>';
    }).join('') || '<div class="c31-empty">ページがありません</div>';
  }
  function renderChron(vid, D) {
    const c = conf(vid);
    const items = D.rows.map((r) => {
      const d = c.date === '__created' ? new Date(r.created_time).toISOString().slice(0, 10) : dateOf(r.properties && r.properties[c.date]);
      return { r, d };
    });
    const dated = items.filter((x) => x.d).sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
    const undated = items.filter((x) => !x.d);
    let h = '<div class="c31-chron">', y = '', m = '';
    for (const x of dated) {
      const yy = x.d.slice(0, 4), mm = x.d.slice(5, 7);
      if (yy !== y) { if (y) h += '</div>'; y = yy; m = ''; h += '<div class="c31-year"><div class="c31-yh">' + yy + '</div>'; }
      if (mm !== m) { m = mm; h += '<div class="c31-mh">' + (+mm) + '<small>月</small></div>'; }
      const side = c.side ? groupsOf(x.r, c.side, D).filter((g) => g.label).map((g) => '<span class="c31-tag"' + (g.color ? ' style="--t:' + (PALETTE[g.color] || '#8E8B86') + '"' : '') + '>' + iconHtml(g.icon, 'c31-tico') + esc(g.label) + '</span>').join('') : '';
      h += '<a class="c31-ev" data-id="' + esc(x.r.id) + '" href="/' + esc(x.r.id.replace(/-/g, '')) + '"><span class="c31-dot"></span><span class="c31-day">' + x.d.slice(5).replace('-', '.') + '</span>' + iconHtml(rowIcon(x.r), 'c31-eico') + '<span class="c31-et">' + esc(titleOf(x.r) || '（無題）') + '</span><span class="c31-side">' + side + '</span></a>';
    }
    if (y) h += '</div>';
    if (undated.length) {
      h += '<div class="c31-year"><div class="c31-yh c31-dim">日付なし</div>' + undated.map((x) => '<a class="c31-ev" data-id="' + esc(x.r.id) + '" href="/' + esc(x.r.id.replace(/-/g, '')) + '"><span class="c31-dot"></span><span class="c31-day">—</span>' + iconHtml(rowIcon(x.r), 'c31-eico') + '<span class="c31-et">' + esc(titleOf(x.r) || '（無題）') + '</span></a>').join('') + '</div>';
    }
    return h + '</div>';
  }
  let pivotCells = new Map();
  function renderPivot(vid, D) {
    const c = conf(vid);
    pivotCells = new Map();
    const R = new Map(), C = new Map();
    const cell = (rk, ck) => { const k = rk + '\u0001' + ck; if (!pivotCells.has(k)) pivotCells.set(k, []); return pivotCells.get(k); };
    for (const r of D.rows) {
      const rs = groupsOf(r, c.rows, D), cs = groupsOf(r, c.cols, D);
      for (const a of rs) { if (!R.has(a.key)) R.set(a.key, a); for (const b of cs) { if (!C.has(b.key)) C.set(b.key, b); cell(a.key, b.key).push(r); } }
    }
    const sortG = (m) => [...m.values()].sort((a, b) => (a.key === '' ? 1 : b.key === '' ? -1 : String(a.label).localeCompare(String(b.label), 'ja', { numeric: true })));
    const rows = sortG(R), cols = sortG(C);
    const val = (list) => (c.val ? list.reduce((s, r) => s + (numOf(r, c.val) || 0), 0) : list.length);
    const fmt = (v) => (Math.round(v * 100) / 100).toLocaleString();
    const lab = (g) => iconHtml(g.icon, 'c31-pico') + esc(g.label || '（なし）');
    let h = '<div class="c31-pivotw"><table class="c31-pivot"><thead><tr><th class="c31-corner">' + esc((D.schema[c.rows] || {}).name || '') + ' ＼ ' + esc((D.schema[c.cols] || {}).name || '') + '</th>' + cols.map((g) => '<th>' + lab(g) + '</th>').join('') + '<th class="c31-tot">計</th></tr></thead><tbody>';
    const colTot = new Map();
    let all = [];
    for (const a of rows) {
      let rowList = [];
      h += '<tr><th>' + lab(a) + '</th>';
      for (const b of cols) {
        const list = pivotCells.get(a.key + '\u0001' + b.key) || [];
        rowList = rowList.concat(list);
        colTot.set(b.key, (colTot.get(b.key) || []).concat(list));
        const v = val(list);
        h += '<td' + (list.length ? ' data-pk="' + esc(a.key + '\u0001' + b.key) + '"' : '') + ' style="--a:' + Math.min(1, list.length / Math.max(1, D.rows.length / Math.max(1, rows.length))).toFixed(2) + '">' + (list.length ? fmt(v) : '') + '</td>';
      }
      const uniq = [...new Set(rowList)];
      all = all.concat(uniq);
      h += '<td class="c31-tot">' + fmt(val(uniq)) + '</td></tr>';
    }
    h += '</tbody><tfoot><tr><th>計</th>' + cols.map((b) => '<td class="c31-tot">' + fmt(val([...new Set(colTot.get(b.key) || [])])) + '</td>').join('') + '<td class="c31-tot c31-grand">' + fmt(val([...new Set(all)])) + '</td></tr></tfoot></table></div>';
    return h;
  }
  function draw() {
    const vid = currentViewId();
    if (!host || !data || dataFor !== vid) return;
    pickDefaults(conf(vid), data);
    const c = conf(vid);
    const body = c.layout === 'chron' ? renderChron(vid, data) : c.layout === 'pivot' ? renderPivot(vid, data) : renderShelf(vid, data);
    host.innerHTML = toolbar(vid, data) + '<div class="c31-body" data-lay="' + c.layout + '">' + body + '</div>';
    ST.renders++;
  }
  function message(t) { if (host) host.innerHTML = '<div class="c31-bar"><span class="c31-brand">✦ Atlas</span><span class="c31-grow"></span><button class="c31-btn" data-a="off">表に戻す</button></div><div class="c31-empty">' + esc(t) + '</div>'; }

  /* ---- 置き場所（表の本体の代わり） ---- */
  function frameBody() {
    const frame = document.querySelector('.notion-frame');
    if (!frame) return null;
    return frame.querySelector('.notion-collection-view-body') || null;
  }
  async function ensure() {
    const vid = currentViewId();
    const on = !!(vid && VIEWS[vid] && VIEWS[vid].on);
    document.documentElement.toggleAttribute('data-c31-on', on);
    if (!on) { if (host) { host.remove(); host = null; } return; }
    const body = frameBody();
    if (!body) return;
    installCss();
    if (!host) { host = document.createElement('div'); host.id = 'c31-view'; host.addEventListener('click', onHostClick); host.addEventListener('change', onHostChange); }
    if (host.nextElementSibling !== body || !host.isConnected) body.parentElement.insertBefore(host, body);
    if (dataFor !== vid && !loading) {
      loading = true;
      message('読み込んでいます…');
      try { data = await loadData(vid); dataFor = vid; ST.lastCount = data.rows.length; draw(); }
      catch (e) { ST.lastError = String(e && e.message || e); console.warn(TAG, e); message('読み込めませんでした: ' + ST.lastError); dataFor = vid; data = null; }
      finally { loading = false; }
    } else if (data && dataFor === vid && !host.querySelector('.c31-body')) draw();
  }
  function openPage(id) {
    const u = new URL(location.href);
    u.searchParams.set('p', id.replace(/-/g, ''));
    u.searchParams.set('pm', 's');
    history.pushState(history.state, '', u.toString());
    window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
  }
  function onHostClick(e) {
    const t = e.target;
    const a = t.closest('a[data-id]');
    if (a) { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); openPage(a.dataset.id); return; }
    const lay = t.closest('[data-lay]');
    if (lay && lay.tagName === 'BUTTON') { conf(currentViewId()).layout = lay.dataset.lay; saveViews(); draw(); return; }
    const pk = t.closest('[data-pk]');
    if (pk) { showList(pk, pivotCells.get(pk.dataset.pk) || []); return; }
    const b = t.closest('[data-a]');
    if (!b) return;
    if (b.dataset.a === 'refresh') { dataFor = ''; ensure(); }
    else if (b.dataset.a === 'off') toggle(false);
    else if (b.dataset.a === 'closelist') { const l = host.querySelector('.c31-list'); if (l) l.remove(); }
  }
  function onHostChange(e) {
    const s = e.target.closest('select[data-k]');
    if (!s) return;
    conf(currentViewId())[s.dataset.k] = s.value; saveViews(); draw();
  }
  function showList(td, list) {
    const old = host.querySelector('.c31-list'); if (old) old.remove();
    const box = document.createElement('div');
    box.className = 'c31-list';
    box.innerHTML = '<div class="c31-lh"><b>' + list.length + ' 件</b><button class="c31-btn" data-a="closelist">×</button></div>' + list.map((r) => '<a data-id="' + esc(r.id) + '" href="/' + esc(r.id.replace(/-/g, '')) + '">' + iconHtml(rowIcon(r), 'c31-eico') + '<span>' + esc(titleOf(r) || '（無題）') + '</span></a>').join('');
    host.appendChild(box);
    const hr = host.getBoundingClientRect(), r = td.getBoundingClientRect();
    box.style.left = Math.max(0, Math.min(r.left - hr.left, hr.width - 280)) + 'px';
    box.style.top = (r.bottom - hr.top + 4) + 'px';
  }
  function toggle(force) {
    const vid = currentViewId();
    if (!vid) return '?v= のあるビュー（フルページの DB）で使えます';
    const c = conf(vid);
    c.on = force === undefined ? !c.on : !!force;
    saveViews();
    if (!c.on) { dataFor = ''; data = null; }
    ensure();
    return c.on;
  }

  /* ============================================================
   *  「Add a new view」に Atlas を足す
   * ============================================================ */
  const NATIVE = ['Table', 'Board', 'Gallery', 'List', 'Chart', 'Dashboard', 'Timeline', 'Feed', 'Map', 'Calendar', 'Form', 'テーブル', 'ボード', 'ギャラリー', 'リスト', 'グラフ', 'タイムライン', 'カレンダー', 'フォーム'];
  const ATLAS_SVG = '<svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M3.2 16.6V4.4"/><path d="M5.8 16.6V6.2"/><path d="M8.4 16.6V3.6"/><path d="M11 16.6l2.6-11.2 2.6.6-2.6 11.2"/><path d="M2.2 16.8h15.6"/><path d="M15.6 2.2l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="currentColor" stroke="none"/></svg>';
  function tileOf(root, label) {
    for (const el of root.querySelectorAll('[role="button"], [role="menuitem"], [role="option"], button')) {
      if (el.closest('[data-c31-tile]')) continue;
      if (el.textContent.trim() === label) return el;
    }
    return null;
  }
  function decorateMenu(root) {
    if (root.querySelector('[data-c31-tile]')) return;
    const txt = root.textContent || '';
    if (!/Add a new view|新しいビュー|ビューを追加/.test(txt)) return;
    const table = tileOf(root, 'Table') || tileOf(root, 'テーブル');
    const last = tileOf(root, 'Form') || tileOf(root, 'フォーム') || tileOf(root, 'Calendar') || tileOf(root, 'カレンダー');
    if (!table || !last || !last.parentElement) return;
    const tile = last.cloneNode(true);
    tile.setAttribute('data-c31-tile', '1');
    tile.removeAttribute('id');
    tile.title = 'Atlas — 書架・年表・集計（Cordivestium）';
    /* 絵と文字を差し替え（形はそのまま＝Notion と同じ見た目） */
    const svg = tile.querySelector('svg');
    if (svg) { const span = document.createElement('span'); span.innerHTML = ATLAS_SVG; svg.replaceWith(span.firstChild); }
    const walker = document.createTreeWalker(tile, NodeFilter.SHOW_TEXT);
    let n; while ((n = walker.nextNode())) { if (n.nodeValue.trim()) { n.nodeValue = 'Atlas'; break; } }
    tile.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); createAtlas(table); }, true);
    for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup']) tile.addEventListener(t, (e) => e.stopPropagation(), true);
    last.parentElement.insertBefore(tile, last.nextSibling);
  }
  function press(el) {
    const r = el.getBoundingClientRect();
    const o = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0 };
    el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new MouseEvent('mousedown', o));
    el.dispatchEvent(new PointerEvent('pointerup', o)); el.dispatchEvent(new MouseEvent('mouseup', o));
    el.dispatchEvent(new MouseEvent('click', o));
  }
  async function createAtlas(tableTile) {
    const before = currentViewId();
    press(tableTile);
    const t0 = Date.now();
    while (Date.now() - t0 < 8000) {
      await new Promise((r) => setTimeout(r, 120));
      const v = currentViewId();
      if (v && v !== before) {
        VIEWS[v] = { on: true, layout: 'shelf' };
        saveViews();
        renameView(v, 'Atlas').catch((e) => console.warn(TAG, '名前を付けられませんでした', e));
        setTimeout(() => ensure(), 300);
        return v;
      }
    }
    console.warn(TAG, '新しいビューを見つけられませんでした（作られたビューを開いて ⌃⌥V で Atlas にできます）');
    return null;
  }

  /* ============================================================
   *  CSS
   * ============================================================ */
  function installCss() {
    if (document.getElementById('c31-css')) return;
    const st = document.createElement('style');
    st.id = 'c31-css';
    st.textContent = `
html[data-c31-on] .notion-frame .notion-collection-view-body { display: none !important; }
#c31-view { --serif: "Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", "Yu Mincho", serif; position: relative; padding: 4px 0 64px; color: var(--c-texPri, #37352f); font-family: var(--serif); }
#c31-view * { box-sizing: border-box; }
#c31-view a { color: inherit; text-decoration: none; }
.c31-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 6px 2px 14px; margin-bottom: 18px; border-bottom: 1px solid var(--ca-borPriTra, rgba(55,53,47,.12)); font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif; color: var(--c-texSec, #787774); }
.c31-brand { font-family: var(--serif); font-size: 13px; letter-spacing: .08em; color: var(--c-texPri, #37352f); }
.c31-seg { display: flex; gap: 2px; padding: 2px; border-radius: 8px; background: var(--c-bacHov, rgba(55,53,47,.06)); }
.c31-seg button { height: 24px; padding: 0 12px; border: 0; border-radius: 6px; background: none; color: inherit; font: 500 12px/1 inherit; cursor: pointer; }
.c31-seg button[data-on="1"] { background: var(--c-bgPri, #fff); color: var(--c-texPri, #37352f); box-shadow: 0 1px 2px rgba(0,0,0,.1); }
.c31-opts { display: flex; gap: 10px; align-items: center; }
.c31-opts label { display: flex; align-items: center; gap: 6px; }
.c31-opts select { height: 24px; max-width: 160px; border: 0; border-radius: 6px; padding: 0 6px; background: var(--c-bacHov, rgba(55,53,47,.06)); color: var(--c-texPri, #37352f); font: 12px/1 inherit; }
.c31-grow { flex: 1; }
.c31-cnt { font-variant-numeric: tabular-nums; }
.c31-btn { height: 24px; padding: 0 10px; border: 0; border-radius: 6px; background: var(--c-bacHov, rgba(55,53,47,.06)); color: inherit; font: 500 12px/1 inherit; cursor: pointer; }
.c31-btn:hover { background: var(--c-bacHov2, rgba(55,53,47,.1)); color: var(--c-texPri, #37352f); }
.c31-empty { padding: 48px 0; text-align: center; color: var(--c-texTer, #9b9a97); font-size: 13px; }
.c31-dim { color: var(--c-texTer, #9b9a97) !important; }
.c31-emo { font-family: "Apple Color Emoji", "Segoe UI Emoji", sans-serif; line-height: 1; }
/* 書架 */
.c31-shelfg { margin: 0 0 34px; }
.c31-gh { display: flex; align-items: center; gap: 10px; margin: 0 0 12px 2px; font-size: 13px; font-weight: 700; letter-spacing: .04em; color: var(--c-texSec, #787774); }
.c31-gico { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; }
.c31-gico img { width: 18px; height: 18px; object-fit: contain; }
.c31-gc { font: 400 11px/1 -apple-system, sans-serif; opacity: .6; font-variant-numeric: tabular-nums; }
.c31-shelf { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 3px; padding: 0 10px; min-height: 120px; position: relative; border-bottom: 7px solid color-mix(in srgb, var(--c-texPri, #37352f) 16%, transparent); box-shadow: 0 6px 10px -8px rgba(0,0,0,.35); border-radius: 0 0 2px 2px; row-gap: 18px; }
.c31-spine { position: relative; display: flex; flex-direction: column; align-items: center; width: 36px; height: var(--h); padding: 9px 0 10px; border-radius: 3px 3px 1px 1px; background: linear-gradient(90deg, rgba(0,0,0,.18), rgba(255,255,255,.10) 18%, rgba(255,255,255,0) 40%, rgba(0,0,0,.12)), var(--c); filter: brightness(var(--k)); color: #fbf8f1; box-shadow: inset 0 0 0 .5px rgba(0,0,0,.25); transition: transform .16s cubic-bezier(.2,0,0,1), box-shadow .16s; cursor: pointer; }
.c31-spine:hover { transform: translateY(-7px); box-shadow: inset 0 0 0 .5px rgba(0,0,0,.25), 0 8px 14px -6px rgba(0,0,0,.4); }
.c31-sico { flex: 0 0 auto; width: 18px; height: 18px; margin-bottom: 8px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,.88); font-size: 11px; }
.c31-sico img { width: 13px; height: 13px; object-fit: contain; }
.c31-stitle { flex: 1 1 auto; min-height: 0; overflow: hidden; writing-mode: vertical-rl; text-orientation: mixed; font-size: 12px; letter-spacing: .12em; line-height: 1.15; white-space: nowrap; text-overflow: ellipsis; text-shadow: 0 1px 0 rgba(0,0,0,.18); }
.c31-sband { position: absolute; left: 0; right: 0; bottom: 14px; height: 2px; background: rgba(255,255,255,.35); }
/* 年表 */
.c31-chron { position: relative; padding-left: 4px; }
.c31-year { position: relative; margin: 0 0 22px; padding-left: 96px; }
.c31-yh { position: absolute; left: 0; top: 0; width: 76px; text-align: right; font-size: 22px; font-weight: 500; letter-spacing: .06em; color: var(--c-texPri, #37352f); }
.c31-mh { margin: 8px 0 4px -14px; font-size: 12px; font-weight: 700; color: var(--c-texSec, #787774); }
.c31-mh small { font-size: 10px; margin-left: 1px; font-weight: 400; }
.c31-year::before { content: ""; position: absolute; left: 86px; top: 6px; bottom: -22px; width: 1px; background: var(--ca-borPriTra, rgba(55,53,47,.16)); }
.c31-ev { position: relative; display: flex; align-items: center; gap: 10px; min-height: 30px; padding: 3px 8px 3px 4px; border-radius: 6px; font-size: 13px; }
.c31-ev:hover { background: var(--c-bacHov, rgba(55,53,47,.06)); }
.c31-dot { position: absolute; left: -14px; width: 7px; height: 7px; border-radius: 50%; background: var(--c-bgPri, #fff); box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--c-texPri, #37352f) 45%, transparent); }
.c31-day { flex: 0 0 40px; font: 11px/1 -apple-system, sans-serif; color: var(--c-texTer, #9b9a97); font-variant-numeric: tabular-nums; }
.c31-eico { flex: 0 0 18px; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; }
.c31-eico img { width: 18px; height: 18px; object-fit: contain; }
.c31-et { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: .03em; }
.c31-side { flex: 0 1 auto; display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; }
.c31-tag { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 4px; font: 11px/1 -apple-system, sans-serif; color: var(--c-texSec, #787774); background: color-mix(in srgb, var(--t, #8E8B86) 14%, transparent); }
.c31-tico { width: 13px; height: 13px; display: inline-flex; font-size: 11px; }
.c31-tico img { width: 13px; height: 13px; object-fit: contain; }
/* 集計 */
.c31-pivotw { overflow-x: auto; }
.c31-pivot { border-collapse: separate; border-spacing: 0; font-size: 12.5px; min-width: 50%; }
.c31-pivot th, .c31-pivot td { padding: 7px 12px; border-bottom: 1px solid var(--ca-borPriTra, rgba(55,53,47,.1)); white-space: nowrap; }
.c31-pivot thead th { position: sticky; top: 0; background: var(--c-bgPri, #fff); font-weight: 600; color: var(--c-texSec, #787774); text-align: right; border-bottom: 1px solid color-mix(in srgb, var(--c-texPri, #37352f) 22%, transparent); }
.c31-pivot thead th.c31-corner { text-align: left; font-weight: 400; font-size: 11px; }
.c31-pivot tbody th, .c31-pivot tfoot th { text-align: left; font-weight: 600; color: var(--c-texPri, #37352f); }
.c31-pivot td { text-align: right; font: 12.5px/1 -apple-system, BlinkMacSystemFont, sans-serif; font-variant-numeric: tabular-nums; background: color-mix(in srgb, #2383e2 calc(var(--a, 0) * 16%), transparent); }
.c31-pivot td[data-pk] { cursor: pointer; }
.c31-pivot td[data-pk]:hover { box-shadow: inset 0 0 0 1.5px rgba(35,131,226,.6); }
.c31-pivot .c31-tot { font-weight: 600; background: var(--c-bacHov, rgba(55,53,47,.035)); }
.c31-pivot .c31-grand { color: #2383e2; }
.c31-pico { width: 15px; height: 15px; display: inline-flex; vertical-align: -3px; margin-right: 6px; font-size: 12px; }
.c31-pico img { width: 15px; height: 15px; object-fit: contain; }
.c31-list { position: absolute; z-index: 20; width: 280px; max-height: 320px; overflow: auto; padding: 6px; border-radius: 10px; background: var(--c-bgPri, #fff); box-shadow: 0 0 0 .5px rgba(15,15,15,.12), 0 10px 30px rgba(15,15,15,.16); font-size: 13px; }
.c31-list .c31-lh { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 6px; font: 12px/1 -apple-system, sans-serif; color: var(--c-texSec, #787774); }
.c31-list a { display: flex; align-items: center; gap: 8px; padding: 5px 6px; border-radius: 6px; }
.c31-list a:hover { background: var(--c-bacHov, rgba(55,53,47,.06)); }
`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ============================================================
   *  起動
   * ============================================================ */
  let lastHref = location.href, tick = 0;
  const mo = new MutationObserver((recs) => {
    for (const r of recs) for (const nd of r.addedNodes) {
      if (nd.nodeType !== 1) continue;
      if (nd.closest && nd.closest('#c31-view')) continue;
      const pop = nd.matches && (nd.matches('[role="dialog"], .notion-overlay-container, [data-overlay]') ? nd : nd.querySelector && nd.querySelector('[role="dialog"]'));
      if (pop || /Add a new view|新しいビュー/.test(nd.textContent || '')) { try { decorateMenu(pop || nd); } catch (e) { /* noop */ } }
    }
    if (!tick) tick = requestAnimationFrame(() => {
      tick = 0;
      if (location.href !== lastHref) { lastHref = location.href; const v = currentViewId(); if (v !== dataFor) { data = null; dataFor = ''; } }
      const vid = currentViewId();
      const want = !!(vid && VIEWS[vid] && VIEWS[vid].on);
      if (want || host) ensure();
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('popstate', () => setTimeout(ensure, 50));
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && !e.metaKey && e.code === 'KeyV') { e.preventDefault(); e.stopPropagation(); toggle(); }
  }, true);
  setTimeout(ensure, 600);

  window.__c31 = {
    version: VERSION,
    status: () => ({ view: currentViewId(), on: !!(VIEWS[currentViewId()] || {}).on, conf: VIEWS[currentViewId()] || null, ...ST }),
    toggle, refresh: () => { dataFor = ''; return ensure(); },
    _render: { renderShelf, renderChron, renderPivot, pickDefaults, conf, setData: (vid, D) => { data = D; dataFor = vid; } }
  };
})();
