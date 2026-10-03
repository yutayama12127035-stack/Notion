// ==UserScript==
// @name         « No »　³¹ _ Atlas Views
// @namespace    https://cordivestium.local/atlas-views
// @version      2.1.0
// @description  v2.1.0: Atlas のタイルが押せない・押しても何も見えなかったのを修正（押下を Notion より先に受け止める・ビューの本体を広く探し、見つからなければ DB の画面に重ねて出す・新しいビューが作れない時は今のビューを Atlas で表示）。v2.0.0: 「Add a new view」に Atlas が出なかったのを修正。見ていて楽しいビューを追加 — シアター（映画ポスターの壁）・レコード（ジャケットと盤）・ポラロイド（写真の壁）・星図（グループを星座に）。Notion に無い新しいビュー「Atlas」。「Add a new view」の空いている枠に Atlas を追加。書架（背表紙が棚に並ぶ・縦書き・グループごとの棚）／年表（日付で年・月ごとの縦のタイムライン）／集計（Excel のピボット: 2 つのプロパティのクロス集計・合計・押すと一覧）を切り替えて使える。ビューのフィルター・並べ替えはそのまま効く。本・ページを押すとサイドピークで開く。既存のビューも ⌃⌥V で Atlas に切り替え／戻す。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*
 * v2.1.0（2026-10-03）
 *   ・タイルが押せなかった: Notion は document の捕捉段階で押下を取り、写したタイルには React の処理が無いので止まっていた
 *     → window の捕捉段階（Notion より手前）で受け止める
 *   ・見えなかった: 表の本体を .notion-collection-view-body だけで探していた（今の Notion には無いことがある）
 *     → 表・ボード・ギャラリー・リスト…の本体を広く探す。見つからなければ DB の画面に重ねて出す
 *   ・新しいビューが 3 秒で現れない時は、メニューを閉じて今のビューを Atlas で表示（「表に戻す」／⌃⌥V で戻る）
 *
 * v2.0.0（2026-10-03）
 *   ・「Add a new view」に Atlas が出なかった: メニューの中身は後から描かれるのに、足された要素の文字だけで探していた／
 *     タイルを role 属性で探していた（Notion のタイルには role が無い）。
 *     → 画面に出ているメニュー全体から「Table」「Form」の文字を探し、その共通の親（格子）と、Form のタイルを写して Atlas を作る。
 *   ・ビューを 4 つ追加（全部で 7 つ）:
 *       シアター: 映画のポスターの壁。ページのカバー画像（無ければファイルのプロパティの画像、それも無ければ色とアイコン）を
 *                 2:3 のポスターに。乗せると浮き上がって光る。グループごとに「上映の列」。
 *       レコード: 正方形のジャケットから盤が少しのぞく。乗せると盤が滑り出て回る。
 *       ポラロイド: 少し傾いた写真が壁に留めてある。乗せるとまっすぐになって手前へ。
 *       星図: 夜空にグループを星座として並べ、ページを星に（線で結ぶ）。乗せると名前、押すと開く。
 *
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
  const VERSION = '2.1.0';
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
    const body = () => ({ requestId: uuid(), transactions: [{ id: uuid(), spaceId: v.space_id, debug: { userAction: 'c31.renameView' }, operations: [{ pointer: { table: 'collection_view', id: vid, spaceId: v.space_id }, path: ['name'], command: 'set', args: name }] }] });
    try { await apiPost('/api/v3/saveTransactionsFanout', body(), v.space_id); } catch (e) { await apiPost('/api/v3/saveTransactions', body(), v.space_id); }
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
    const seg = [['shelf', '書架'], ['theater', 'シアター'], ['vinyl', 'レコード'], ['polaroid', 'ポラロイド'], ['stars', '星図'], ['chron', '年表'], ['pivot', '集計']].map(([k, l]) => '<button data-lay="' + k + '"' + (c.layout === k ? ' data-on="1"' : '') + '>' + l + '</button>').join('');
    let opts = '';
    if (['theater', 'vinyl', 'polaroid', 'stars'].includes(c.layout)) opts = '<label>' + (c.layout === 'stars' ? '星座' : 'グループ') + '<select data-k="group">' + propOptions(D, GROUPABLE, c.group, [['', '分けない']]) + '</select></label>';
    else if (c.layout === 'shelf') opts = '<label>棚<select data-k="group">' + propOptions(D, GROUPABLE, c.group, [['', '分けない']]) + '</select></label>';
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

  /* ============================================================
   *  v2.0.0  シアター・レコード・ポラロイド・星図
   * ============================================================ */
  function imgUrl(u, id) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^attachment:/i.test(u) || /secure\.notion-static\.com|prod-files-secure|amazonaws\.com/.test(u)) return '/image/' + encodeURIComponent(u) + '?table=block&id=' + encodeURIComponent(id || '') + '&cache=v2';
    if (u.startsWith('/')) return u;
    if (/^(https?:|data:)/.test(u)) return u;
    return '';
  }
  /* その行の絵: カバー → ファイルのプロパティの最初の画像 */
  function pictureOf(r, D) {
    const cov = r.format && r.format.page_cover;
    if (cov) { const u = imgUrl(cov, r.id); if (u) return { src: u, y: r.format.page_cover_position != null ? Math.round((1 - r.format.page_cover_position) * 100) : 50 }; }
    for (const [pid, sc] of Object.entries(D.schema)) {
      if (sc.type !== 'file') continue;
      for (const seg of (r.properties && r.properties[pid]) || []) for (const a of (Array.isArray(seg[1]) ? seg[1] : [])) if (a[0] === 'a' && a[1]) { const u = imgUrl(a[1], r.id); if (u && /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(String(a[1]))) return { src: u, y: 50 }; }
    }
    return null;
  }
  function grouped(vid, D) {
    const c = conf(vid);
    const groups = new Map();
    for (const r of D.rows) for (const g of groupsOf(r, c.group, D)) {
      if (!groups.has(g.key)) groups.set(g.key, Object.assign({ rows: [] }, g));
      groups.get(g.key).rows.push(r);
    }
    return [...groups.values()].sort((a, b) => (a.key === '' ? 1 : b.key === '' ? -1 : 0));
  }
  const groupHead = (vid, g) => (conf(vid).group ? '<div class="c31-gh">' + iconHtml(g.icon, 'c31-gico') + '<span class="c31-gt">' + esc(g.label || '（なし）') + '</span><span class="c31-gc">' + g.rows.length + '</span></div>' : '');
  const linkOpen = (r, cls, style, inner) => '<a class="' + cls + '" data-id="' + esc(r.id) + '" href="/' + esc(r.id.replace(/-/g, '')) + '" title="' + esc(titleOf(r) || '（無題）') + '"' + (style ? ' style="' + style + '"' : '') + '>' + inner + '</a>';
  const tone = (k) => SPINES[hash(k) % SPINES.length];
  function art(r, D, key) {
    const pic = pictureOf(r, D);
    if (pic) return { style: '--img:url(&quot;' + esc(pic.src) + '&quot;);--iy:' + pic.y + '%', has: true };
    const c1 = tone(key || r.id), c2 = SPINES[(hash(r.id) + 5) % SPINES.length];
    return { style: '--g1:' + c1 + ';--g2:' + c2, has: false };
  }
  function renderTheater(vid, D) {
    return grouped(vid, D).map((g) => '<section class="c31-row">' + groupHead(vid, g) + '<div class="c31-theater">' + g.rows.map((r) => {
      const a = art(r, D, g.key), t = titleOf(r) || '（無題）';
      return linkOpen(r, 'c31-poster' + (a.has ? ' c31-hasimg' : ''), a.style,
        '<span class="c31-pimg">' + (a.has ? '' : iconHtml(rowIcon(r), 'c31-picon') + '<span class="c31-ptitle-in">' + esc(t) + '</span>') + '</span><span class="c31-pcap"><b>' + esc(t) + '</b>' + (g.label && conf(vid).group ? '<small>' + esc(g.label) + '</small>' : '') + '</span>');
    }).join('') + '</div></section>').join('') || '<div class="c31-empty">ページがありません</div>';
  }
  function renderVinyl(vid, D) {
    return grouped(vid, D).map((g) => '<section class="c31-row">' + groupHead(vid, g) + '<div class="c31-crate">' + g.rows.map((r) => {
      const a = art(r, D, g.key), t = titleOf(r) || '（無題）';
      const label = tone(r.id);
      return linkOpen(r, 'c31-record' + (a.has ? ' c31-hasimg' : ''), a.style + ';--lab:' + label,
        '<span class="c31-disc"><i></i></span><span class="c31-sleeve">' + (a.has ? '' : iconHtml(rowIcon(r), 'c31-picon') + '<span class="c31-stitle2">' + esc(t) + '</span>') + '</span><span class="c31-rcap">' + esc(t) + '</span>');
    }).join('') + '</div></section>').join('') || '<div class="c31-empty">ページがありません</div>';
  }
  function renderPolaroid(vid, D) {
    return grouped(vid, D).map((g) => '<section class="c31-row">' + groupHead(vid, g) + '<div class="c31-wall">' + g.rows.map((r) => {
      const a = art(r, D, g.key), t = titleOf(r) || '（無題）';
      const rot = ((hash(r.id) % 9) - 4) * 0.9;
      return linkOpen(r, 'c31-polaroid' + (a.has ? ' c31-hasimg' : ''), a.style + ';--rot:' + rot.toFixed(1) + 'deg',
        '<span class="c31-pin"></span><span class="c31-photo">' + (a.has ? '' : iconHtml(rowIcon(r), 'c31-picon')) + '</span><span class="c31-hand">' + esc(t) + '</span>');
    }).join('') + '</div></section>').join('') || '<div class="c31-empty">ページがありません</div>';
  }
  function renderStars(vid, D) {
    const gs = grouped(vid, D);
    const W = 1000, cols = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(gs.length)))), cellW = W / cols, cellH = 320;
    const rows = Math.ceil(gs.length / cols), H = Math.max(360, rows * cellH);
    let svg = '<svg class="c31-sky" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">';
    /* 背景の小さな星 */
    for (let i = 0; i < 140; i++) { const h = hash('bg' + i); svg += '<circle cx="' + (h % W) + '" cy="' + ((h >>> 10) % H) + '" r="' + ((h % 3) * 0.35 + 0.35).toFixed(2) + '" fill="#fff" opacity="' + (0.15 + (h % 5) / 12).toFixed(2) + '"/>'; }
    gs.forEach((g, gi) => {
      const cx = (gi % cols) * cellW + cellW / 2, cy = Math.floor(gi / cols) * cellH + cellH / 2 + 10;
      const pts = g.rows.map((r, i) => {
        const h = hash(r.id + g.key), ang = (i / Math.max(1, g.rows.length)) * Math.PI * 2 + (h % 100) / 60, rad = 30 + (h % 90) * (g.rows.length > 1 ? 1 : 0);
        return { r, x: cx + Math.cos(ang) * rad * 1.25, y: cy + Math.sin(ang) * rad * 0.85, s: 2.2 + (h % 4) * 0.8 };
      });
      if (pts.length > 1) svg += '<polyline class="c31-cline" points="' + pts.map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ') + (pts.length > 2 ? ' ' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1) : '') + '"/>';
      for (const p of pts) {
        const t = titleOf(p.r) || '（無題）';
        svg += '<a class="c31-star" data-id="' + esc(p.r.id) + '" href="/' + esc(p.r.id.replace(/-/g, '')) + '"><title>' + esc(t) + '</title><circle class="c31-glow" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (p.s * 3).toFixed(1) + '"/><circle class="c31-core" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + p.s.toFixed(1) + '"/><text x="' + (p.x + p.s + 5).toFixed(1) + '" y="' + (p.y + 4).toFixed(1) + '">' + esc(t.length > 18 ? t.slice(0, 17) + '…' : t) + '</text></a>';
      }
      svg += '<text class="c31-cname" x="' + cx.toFixed(1) + '" y="' + (cy + cellH / 2 - 26).toFixed(1) + '" text-anchor="middle">' + esc(g.label || (conf(vid).group ? '（なし）' : 'すべて')) + '<tspan dx="8" class="c31-ccount">' + g.rows.length + '</tspan></text>';
    });
    return '<div class="c31-skyw">' + svg + '</svg></div>';
  }

  function draw() {
    const vid = currentViewId();
    if (!host || !data || dataFor !== vid) return;
    pickDefaults(conf(vid), data);
    const c = conf(vid);
    const R = { chron: renderChron, pivot: renderPivot, theater: renderTheater, vinyl: renderVinyl, polaroid: renderPolaroid, stars: renderStars };
    const body = (R[c.layout] || renderShelf)(vid, data);
    host.innerHTML = toolbar(vid, data) + '<div class="c31-body" data-lay="' + c.layout + '">' + body + '</div>';
    ST.renders++;
  }
  function message(t) { if (host) host.innerHTML = '<div class="c31-bar"><span class="c31-brand">✦ Atlas</span><span class="c31-grow"></span><button class="c31-btn" data-a="off">表に戻す</button></div><div class="c31-empty">' + esc(t) + '</div>'; }

  /* ---- 置き場所（表の本体の代わり） ----
     v2.1.0: Notion のビューの本体は class 名が版で変わるので候補を広く探す。見つからない時は
     DB の画面の上に重ねて出す（どの版でも必ず見える）。 */
  const BODY_SELS = ['.notion-collection-view-body', '.notion-table-view', '.notion-board-view', '.notion-gallery-view', '.notion-list-view', '.notion-calendar-view', '.notion-timeline-view', '.notion-feed-view', '.notion-chart-view', '.notion-map-view'];
  function mainFrame() { return document.querySelector('main .notion-frame, .notion-frame') || null; }
  function frameBody() {
    const frame = mainFrame();
    if (!frame) return null;
    for (const sel of BODY_SELS) {
      for (const el of frame.querySelectorAll(sel)) {
        if (el.closest('#c31-view') || el.closest('.notion-peek-renderer')) continue;
        /* 一番外側（本体の中の入れ子は避ける） */
        let top = el;
        for (let p = el.parentElement; p && p !== frame; p = p.parentElement) if (BODY_SELS.some((x) => p.matches(x))) top = p;
        return top;
      }
    }
    return null;
  }
  let hidden = null;
  function hideBody(el) {
    if (hidden && hidden !== el) hidden.removeAttribute('data-c31-hidden');
    hidden = el;
    if (el) el.setAttribute('data-c31-hidden', '1');
  }
  function placeFloat() {
    if (!host || !host.classList.contains('c31-float')) return;
    const f = mainFrame();
    const r = f ? f.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight };
    host.style.left = r.left + 'px'; host.style.top = (r.top + 44) + 'px'; host.style.width = r.width + 'px'; host.style.height = Math.max(200, r.height - 44) + 'px';
  }
  async function ensure() {
    const vid = currentViewId();
    const on = !!(vid && VIEWS[vid] && VIEWS[vid].on);
    document.documentElement.toggleAttribute('data-c31-on', on);
    if (!on) { if (host) { host.remove(); host = null; } hideBody(null); return; }
    installCss();
    if (!host) { host = document.createElement('div'); host.id = 'c31-view'; host.addEventListener('click', onHostClick); host.addEventListener('change', onHostChange); }
    const body = frameBody();
    if (body) {
      host.classList.remove('c31-float');
      ['left', 'top', 'width', 'height'].forEach((k) => host.style.removeProperty(k));
      if (host.nextElementSibling !== body || !host.isConnected) body.parentElement.insertBefore(host, body);
      hideBody(body);
    } else {
      /* 本体が見つからない → 重ねて出す */
      host.classList.add('c31-float');
      if (host.parentElement !== document.body) document.body.appendChild(host);
      placeFloat();
    }
    if (dataFor !== vid && !loading) {
      loading = true;
      message('読み込んでいます…');
      try { data = await loadData(vid); dataFor = vid; ST.lastCount = data.rows.length; draw(); }
      catch (e) { ST.lastError = String(e && e.message || e); console.warn(TAG, e); message('読み込めませんでした: ' + ST.lastError); dataFor = vid; data = null; }
      finally { loading = false; }
    } else if (data && dataFor === vid && !host.querySelector('.c31-body')) draw();
  }
  window.addEventListener('resize', () => placeFloat());
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
  /* v2.0.0: 文字が label そのものの一番内側の要素 */
  function leafOf(root, label) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) if (n.nodeValue.trim() === label && !(n.parentElement && n.parentElement.closest('[data-c31-tile]'))) return n.parentElement;
    return null;
  }
  const firstLeaf = (root, labels) => { for (const l of labels) { const e = leafOf(root, l); if (e) return e; } return null; };
  function decorateMenu(root) {
    if (!root || root.querySelector('[data-c31-tile]')) return false;
    if (!/Add a new view|新しいビュー|ビューを追加/.test(root.textContent || '')) return false;
    const lt = firstLeaf(root, ['Table', 'テーブル']);
    const lf = firstLeaf(root, ['Form', 'フォーム']) || firstLeaf(root, ['Calendar', 'カレンダー']);
    if (!lt || !lf) return false;
    let grid = lf.parentElement;
    while (grid && grid !== root && !grid.contains(lt)) grid = grid.parentElement;
    if (!grid) return false;
    const tileOfLeaf = (leaf) => { let el = leaf; while (el && el.parentElement !== grid) el = el.parentElement; return el; };
    const table = tileOfLeaf(lt), last = tileOfLeaf(lf);
    if (!table || !last || table === last) return false;
    const tile = last.cloneNode(true);
    tile.setAttribute('data-c31-tile', '1');
    tile.removeAttribute('id');
    tile.title = 'Atlas — 書架・シアター・レコード・ポラロイド・星図・年表・集計（Cordivestium）';
    const svgEl = tile.querySelector('svg');
    if (svgEl) { const span = document.createElement('span'); span.innerHTML = ATLAS_SVG; const ns = span.firstChild; ns.setAttribute('class', svgEl.getAttribute('class') || ''); ns.setAttribute('style', svgEl.getAttribute('style') || ''); svgEl.replaceWith(ns); }
    tile.removeAttribute('data-c31-tile');
    const lab = leafOf(tile, 'Form') || leafOf(tile, 'フォーム') || leafOf(tile, 'Calendar') || leafOf(tile, 'カレンダー');
    if (lab) lab.textContent = 'Atlas';
    tile.setAttribute('data-c31-tile', '1');
    tile.__c31table = table;
    last.parentElement.insertBefore(tile, last.nextSibling);
    return true;
  }
  function scanMenus() {
    for (const el of document.querySelectorAll('.notion-overlay-container, [role="dialog"], [role="menu"], [data-overlay]')) {
      if (el.closest('#c31-view')) continue;
      try { if (decorateMenu(el)) return; } catch (e) { ST.lastError = String(e && e.message || e); }
    }
  }
  /* v2.1.0: タイルの押下は window の捕捉段階で受け止める（Notion は document の捕捉段階で押下を受け取り、
     写したタイルには React の処理が無いので、そこで止まって何も起きなかった） */
  let tileBusy = false;
  for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    window.addEventListener(t, (e) => {
      const tile = e.target instanceof Element && e.target.closest('[data-c31-tile]');
      if (!tile || e.__c31) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (t === 'click' && !tileBusy) { tileBusy = true; createAtlas(tile.__c31table).finally(() => { tileBusy = false; }); }
    }, true);
  }
  function closeMenus() {
    const o = { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true, cancelable: true };
    (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', o));
    document.dispatchEvent(new KeyboardEvent('keydown', o));
  }
  function toast(msg) {
    let t = document.getElementById('c31-toast');
    if (!t) { t = document.createElement('div'); t.id = 'c31-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.style.opacity = '0'; }, 4200);
  }
  function press(el) {
    const r = el.getBoundingClientRect();
    const o = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0 };
    for (const [C, t] of [[PointerEvent, 'pointerdown'], [MouseEvent, 'mousedown'], [PointerEvent, 'pointerup'], [MouseEvent, 'mouseup'], [MouseEvent, 'click']]) { const ev = new C(t, o); ev.__c31 = true; el.dispatchEvent(ev); }
  }
  async function createAtlas(tableTile) {
    const before = currentViewId();
    if (tableTile && tableTile.isConnected) press(tableTile);
    const t0 = Date.now();
    while (Date.now() - t0 < 3000) {
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
    /* 新しいビューが作れなかった → 今のビューを Atlas で見せる（⌃⌥V・「表に戻す」で戻る） */
    closeMenus();
    if (!before) { toast('Atlas は ?v= のあるフルページの DB で使えます'); return null; }
    VIEWS[before] = Object.assign({ layout: 'shelf' }, VIEWS[before] || {}, { on: true });
    saveViews();
    setTimeout(() => ensure(), 120);
    toast('このビューを Atlas で表示しています（「表に戻す」か ⌃⌥V で元に戻ります）');
    return before;
  }

  /* ============================================================
   *  CSS
   * ============================================================ */
  function installCss() {
    if (document.getElementById('c31-css')) return;
    const st = document.createElement('style');
    st.id = 'c31-css';
    st.textContent = `
html[data-c31-on] [data-c31-hidden] { display: none !important; }
#c31-view.c31-float { position: fixed; z-index: 90; overflow: auto; padding: 4px 96px 64px; background: var(--c-bgPri, #fff); }
#c31-toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 2147483000; padding: 9px 16px; border-radius: 8px; background: rgba(15,15,15,.88); color: #fff; font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif; pointer-events: none; opacity: 0; transition: opacity .2s; }
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
.c31-seg { flex-wrap: wrap; }
.c31-row { margin: 0 0 34px; }
/* シアター */
.c31-theater { display: grid; grid-template-columns: repeat(auto-fill, minmax(138px, 1fr)); gap: 22px 18px; }
.c31-poster { display: flex; flex-direction: column; gap: 8px; }
.c31-pimg { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; aspect-ratio: 2 / 3; border-radius: 6px; overflow: hidden; background: var(--img) center var(--iy, 50%) / cover no-repeat, linear-gradient(160deg, var(--g1, #5B6B7A), var(--g2, #2b2f36)); box-shadow: 0 1px 2px rgba(0,0,0,.18), 0 6px 18px -8px rgba(0,0,0,.45); transition: transform .22s cubic-bezier(.2,0,0,1), box-shadow .22s; color: #fbf8f1; }
.c31-poster:not(.c31-hasimg) .c31-pimg { background: radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.18), transparent 60%), linear-gradient(160deg, var(--g1), var(--g2)); }
.c31-pimg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,.12), transparent 30%, transparent 70%, rgba(0,0,0,.25)); pointer-events: none; }
.c31-poster:hover .c31-pimg { transform: translateY(-6px) scale(1.02); box-shadow: 0 2px 4px rgba(0,0,0,.2), 0 18px 34px -12px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.08); }
.c31-picon { width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; filter: drop-shadow(0 2px 4px rgba(0,0,0,.3)); }
.c31-picon img { width: 34px; height: 34px; object-fit: contain; filter: brightness(0) invert(1); }
.c31-ptitle-in { padding: 0 12px; text-align: center; font-size: 14px; line-height: 1.5; letter-spacing: .08em; text-shadow: 0 1px 2px rgba(0,0,0,.3); }
.c31-pcap { display: flex; flex-direction: column; gap: 2px; padding: 0 2px; }
.c31-pcap b { font-size: 12.5px; font-weight: 600; letter-spacing: .03em; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.c31-pcap small { font: 11px/1.3 -apple-system, sans-serif; color: var(--c-texTer, #9b9a97); }
/* レコード */
.c31-crate { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 26px 30px; padding-right: 24px; }
.c31-record { position: relative; display: block; aspect-ratio: 1; margin-bottom: 26px; }
.c31-sleeve { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-radius: 3px; background: var(--img) center var(--iy, 50%) / cover no-repeat, linear-gradient(135deg, var(--g1, #5B6B7A), var(--g2, #2b2f36)); box-shadow: 0 1px 2px rgba(0,0,0,.2), 0 8px 20px -10px rgba(0,0,0,.5); color: #fbf8f1; overflow: hidden; }
.c31-record:not(.c31-hasimg) .c31-sleeve { background: repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 2px, transparent 2px 6px), linear-gradient(135deg, var(--g1), var(--g2)); }
.c31-stitle2 { padding: 0 14px; text-align: center; font-size: 13px; letter-spacing: .1em; line-height: 1.5; }
.c31-disc { position: absolute; z-index: 1; top: 4%; left: 4%; width: 92%; height: 92%; border-radius: 50%; background: radial-gradient(circle, var(--lab) 0 17%, #111 17.5% 19%, transparent 19.5%), repeating-radial-gradient(circle, #1a1a1a 0 1.5px, #262626 1.5px 3px); box-shadow: 0 4px 12px rgba(0,0,0,.35); transform: translateX(18%); transition: transform .45s cubic-bezier(.2,0,0,1); }
.c31-disc i { position: absolute; left: 50%; top: 50%; width: 5%; height: 5%; margin: -2.5% 0 0 -2.5%; border-radius: 50%; background: #e9e5dc; }
.c31-disc::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 30deg, transparent 0 10%, rgba(255,255,255,.12) 14%, transparent 20% 60%, rgba(255,255,255,.08) 64%, transparent 70%); }
.c31-record:hover .c31-disc { transform: translateX(46%) rotate(200deg); }
.c31-rcap { position: absolute; left: 0; right: 0; top: calc(100% + 8px); font-size: 12.5px; font-weight: 600; letter-spacing: .03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* ポラロイド */
.c31-wall { display: flex; flex-wrap: wrap; gap: 26px 22px; padding: 10px 4px; }
.c31-polaroid { position: relative; display: flex; flex-direction: column; width: 168px; padding: 10px 10px 0; background: #fdfcf9; box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 8px 18px -10px rgba(0,0,0,.35); transform: rotate(var(--rot)); transition: transform .2s cubic-bezier(.2,0,0,1), box-shadow .2s; color: #37352f; }
.c31-polaroid:hover { transform: rotate(0) translateY(-4px) scale(1.04); box-shadow: 0 2px 4px rgba(0,0,0,.14), 0 18px 30px -12px rgba(0,0,0,.4); z-index: 3; }
.c31-photo { display: flex; align-items: center; justify-content: center; aspect-ratio: 1; background: var(--img) center var(--iy, 50%) / cover no-repeat, linear-gradient(135deg, var(--g1, #5B6B7A), var(--g2, #2b2f36)); filter: saturate(.92) contrast(1.02); }
.c31-polaroid:not(.c31-hasimg) .c31-photo { background: radial-gradient(90% 70% at 30% 20%, rgba(255,255,255,.22), transparent 60%), linear-gradient(135deg, var(--g1), var(--g2)); }
.c31-hand { min-height: 46px; display: flex; align-items: center; justify-content: center; padding: 6px 4px 8px; text-align: center; font-family: "Klee", "Klee Medium", "Hiragino Mincho ProN", serif; font-size: 13px; line-height: 1.35; letter-spacing: .04em; }
.c31-pin { position: absolute; z-index: 2; top: -6px; left: 50%; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #f4b6a8, #c4553f 60%, #8f3424); box-shadow: 0 2px 3px rgba(0,0,0,.3); }
/* 星図 */
.c31-skyw { border-radius: 14px; overflow: hidden; background: radial-gradient(120% 90% at 30% 10%, #1d2a4d 0%, #0c1326 55%, #070b17 100%); box-shadow: inset 0 0 0 1px rgba(255,255,255,.04); }
.c31-sky { display: block; width: 100%; height: auto; }
.c31-sky .c31-cline { fill: none; stroke: rgba(170,190,255,.32); stroke-width: 1; }
.c31-sky .c31-glow { fill: rgba(190,210,255,.12); transition: fill .2s; }
.c31-sky .c31-core { fill: #f3f1ea; filter: drop-shadow(0 0 3px rgba(200,215,255,.9)); }
.c31-sky text { fill: rgba(230,234,245,.0); font: 12px "Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", serif; letter-spacing: .06em; transition: fill .2s; pointer-events: none; }
.c31-sky .c31-star:hover .c31-glow { fill: rgba(190,210,255,.35); }
.c31-sky .c31-star:hover text, .c31-skyw:hover .c31-star text { fill: rgba(230,234,245,.75); }
.c31-sky .c31-star { cursor: pointer; }
.c31-sky .c31-cname { fill: rgba(220,226,245,.85); font-size: 15px; letter-spacing: .14em; }
.c31-sky .c31-ccount { fill: rgba(220,226,245,.45); font-size: 11px; }
`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ============================================================
   *  起動
   * ============================================================ */
  let lastHref = location.href, tick = 0;
  let menuT = 0;
  const mo = new MutationObserver(() => {
    if (!menuT) menuT = requestAnimationFrame(() => { menuT = 0; scanMenus(); });
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
