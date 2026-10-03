// ==UserScript==
// @name         « No »　³² _ Sheet Engine
// @namespace    https://cordivestium.local/sheet-engine
// @version      1.1.0
// @description  v1.1.0: ドラッグが効かなかったのを修正（■へ近づく途中で隣のセルに移って逃げていた・Notion が先に押下を受け取っていた・離した時に Notion がセルを開いていた）。Notion のテーブルビューに Excel の機能を。①フィルハンドル: セル右下の ■ を下（上）へドラッグすると連続データ（2026.01.01 → 2026.01.02…・1 → 2・Vol.1 → Vol.2・月 → 火・Jan → Feb）、⌥ を押しながらでコピー、■ のダブルクリックで最後の行まで ②元に戻す・「コピー／連続データ」の切り替え ③⇧クリックで範囲を選ぶと、右下に データの個数・合計・平均・最小・最大 ④⌃D で上のセル（範囲なら先頭）をコピー ⑤⌃; で今日の日付・⌃⇧; で今の時刻を入力。
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
 *   ・■ がつかめない／ドラッグが始まらない、を修正:
 *     ① ■ はセルの角の外側に半分はみ出していたため、近づく途中で右や下のセルに入ると ■ がそちらへ移っていた
 *        → ■ をセルの内側の角に置き、角の周り（14px）にいる間は今のセルのまま
 *     ② Notion は文書全体の入口（document の捕捉段階）で押下を受け取り、範囲選択・行のドラッグを始めていた
 *        → さらに手前（window の捕捉段階）で ■ の押下を受け止め、Notion には渡さない。ドラッグ中の動きも渡さない
 *     ③ 離した直後のクリックで Notion がセルの編集を開いていた → ドラッグの直後のクリックは止める
 *   ・列の見分け: 列見出しの印（class・role）が無い表でも、表の上端より上にある文字（同じ横位置）を見出しとして読む。
 *
 * v1.0.0（2026-10-03）
 *   ・フィルハンドル（オートフィル）
 *       テーブルのセルにカーソルを乗せると右下に小さな ■。つかんで同じ列を上下へ動かすと、範囲に青い枠と
 *       最後のセルに入る値の見本。離すと Notion の API（saveTransactions）で 1 回にまとめて書き込む。
 *       ⇧クリックで先に 2 つ以上のセルを選んでおくと、その差（2 日おき・5 ずつ など）で続ける（Excel と同じ）。
 *       ⌥ を押しながら離すとコピー。■ のダブルクリックで、表の最後の行まで連続データ。
 *   ・続け方（自動で見分ける）
 *       日付の文字: 2026.01.01／2026-01-01／2026/1/1／2026年1月1日／1/1・年月: 2026.01・後ろの曜日 (木) も直す
 *       日付のプロパティ: 日付を 1 日ずつ（終わりの日・時刻もずらす）
 *       数: 1／001／1.5／1,000・文字＋番号: Vol.1／第1話／No.01（最後の数を増やす）
 *       並び: 月火水… 月曜日… Sun Mon… Sunday… Jan… January… 1月〜12月 Q1〜Q4 子丑寅… 甲乙丙… 睦月…
 *       セレクト・チェック・リレーション・人など: コピー（Excel と同じ）
 *       数式・ロールアップ・作成日時などの読み取り専用の列には書かない
 *   ・書き込んだ後に小さな帯: 「元に戻す」「コピーにする／連続データにする」（Esc で閉じる）
 *   ・ステータスバー: ⇧クリックで同じ列の範囲を選ぶと、右下に 個数・数値の個数・合計・平均・最小・最大
 *   ・⌃D: 範囲があれば先頭の値を下へコピー、無ければ真上のセルの値をコピー（文字の編集中は何もしない）
 *   ・⌃; ／ ⌃⇧;: 文字の編集中に今日の日付（2026.10.03）／今の時刻（12:09）を入れる。書式は __c32.dateFormat('YYYY-MM-DD') で
 *   ・テーブルビューのみ（フルDB・インラインDB・ピークの中）。表示されていない行（スクロールの外）には届かない。
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '1.1.0';
  const TAG = '[³² v' + VERSION + ']';
  if (window.__c32 && window.__c32.version) { console.warn(TAG, '旧版 ' + window.__c32.version + ' が動いています'); return; }

  const CELL = '.notion-table-view-cell';
  const TABLE = '.notion-table-view';
  const HEADER = '.notion-table-view-header-cell, [role="columnheader"]';
  const PREF_KEY = 'c32.prefs';
  const P = { dateFmt: 'YYYY.MM.DD', timeFmt: 'HH:mm' };
  try { Object.assign(P, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) { /* noop */ }
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(P)); } catch (e) { /* noop */ } };
  const ST = { fills: 0, cells: 0, lastError: '' };

  /* ============================================================
   *  Notion の API
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
    let j;
    try { j = await apiPost('/api/v3/syncRecordValues', { requests: ids.map((id) => ({ table, id, version: -1 })) }); }
    catch (e) { j = await apiPost('/api/v3/syncRecordValues', { requests: ids.map((id) => ({ pointer: { table, id }, version: -1 })) }); }
    const map = new Map();
    const rm = (j && j.recordMap && j.recordMap[table]) || {};
    for (const id of ids) { const v = unwrap(rm[id]); if (v) map.set(id, v); }
    return map;
  }
  const SCHEMA = new Map();   // collectionId → schema
  async function schemaOf(collectionId) {
    if (SCHEMA.has(collectionId)) return SCHEMA.get(collectionId);
    const m = await getRecords('collection', [collectionId]);
    const c = m.get(collectionId);
    const sc = (c && c.schema) || null;
    if (sc) SCHEMA.set(collectionId, sc);
    return sc;
  }
  async function saveOps(ops, spaceId, tag) {
    if (!ops.length) return;
    await apiPost('/api/v3/saveTransactions', { requestId: uuid(), transactions: [{ id: uuid(), spaceId, debug: { userAction: tag || 'c32.fill' }, operations: ops }] }, spaceId);
  }

  /* ============================================================
   *  連続データ
   * ============================================================ */
  const LISTS = [
    ['日', '月', '火', '水', '木', '金', '土'],
    ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    ['睦月', '如月', '弥生', '卯月', '皐月', '水無月', '文月', '葉月', '長月', '神無月', '霜月', '師走'],
    ['Q1', 'Q2', 'Q3', 'Q4'],
    ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    ['春', '夏', '秋', '冬'],
    ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  ];
  const WD_JA = ['日', '月', '火', '水', '木', '金', '土'];
  const WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const pad = (n, w) => String(n).padStart(w, '0');
  const zw = (d) => (d.length >= 2 && d[0] === '0' ? d.length : 1);   // 0 で埋めていた時だけ桁をそろえる
  const zw2 = (a, b) => (a.length === 2 && b.length === 2 ? [2, 2] : [zw(a), zw(b)]);   // 年月日: 月日とも 2 桁なら 2 桁で書く

  /* 日付の文字（y・m・d の位置と区切り・桁を覚えて、同じ形で書き戻す） */
  const DATE_RES = [
    { re: /^(\d{4})([./-])(\d{1,2})\2(\d{1,2})(.*)$/, k: 'ymd', g: (m) => ({ y: +m[1], mo: +m[3], d: +m[4], sep: m[2], wm: zw2(m[3], m[4])[0], wd: zw2(m[3], m[4])[1], rest: m[5] }) },
    { re: /^(\d{4})年(\d{1,2})月(\d{1,2})日(.*)$/, k: 'ymdj', g: (m) => ({ y: +m[1], mo: +m[2], d: +m[3], wm: zw2(m[2], m[3])[0], wd: zw2(m[2], m[3])[1], rest: m[4] }) },
    { re: /^(\d{4})([./-])(\d{1,2})(\s*)$/, k: 'ym', g: (m) => ({ y: +m[1], mo: +m[3], d: 1, sep: m[2], wm: zw(m[3]), rest: m[4] }) },
    { re: /^(\d{4})年(\d{1,2})月(\s*)$/, k: 'ymj', g: (m) => ({ y: +m[1], mo: +m[2], d: 1, wm: zw(m[2]), rest: m[3] }) },
    { re: /^(\d{1,2})\/(\d{1,2})(.*)$/, k: 'md', g: (m) => ({ y: new Date().getFullYear(), mo: +m[1], d: +m[2], wm: zw(m[1]), wd: zw(m[2]), rest: m[3] }) }
  ];
  function parseDateStr(s) {
    for (const D of DATE_RES) {
      const m = D.re.exec(s);
      if (!m) continue;
      const o = D.g(m);
      if (o.mo < 1 || o.mo > 12 || o.d < 1 || o.d > 31) continue;
      /* 後ろの部分は「曜日」か空白だけ（それ以外の文字が続く時は日付として扱わない） */
      if (o.rest && !/^\s*([(（]\s*(日|月|火|水|木|金|土|Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s*[)）])?\s*$/.test(o.rest)) continue;
      o.k = D.k;
      o.t = Date.UTC(o.y, o.mo - 1, o.d);
      return o;
    }
    return null;
  }
  function fmtDateStr(o, t) {
    const dt = new Date(t);
    const y = dt.getUTCFullYear(), mo = dt.getUTCMonth() + 1, d = dt.getUTCDate();
    let s;
    if (o.k === 'ymd') s = y + o.sep + pad(mo, o.wm) + o.sep + pad(d, o.wd);
    else if (o.k === 'ymdj') s = y + '年' + pad(mo, o.wm) + '月' + pad(d, o.wd) + '日';
    else if (o.k === 'ym') s = y + o.sep + pad(mo, o.wm);
    else if (o.k === 'ymj') s = y + '年' + pad(mo, o.wm) + '月';
    else s = pad(mo, o.wm) + '/' + pad(d, o.wd);
    let rest = o.rest || '';
    if (rest) {
      const wd = dt.getUTCDay();
      rest = rest.replace(/(日|月|火|水|木|金|土)(?=\s*[)）])/, WD_JA[wd]).replace(/(Sun|Mon|Tue|Wed|Thu|Fri|Sat)(?=\s*[)）])/, WD_EN[wd]);
    }
    return s + rest;
  }
  const addMonths = (t, n) => { const d = new Date(t); const day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n); const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); d.setUTCDate(Math.min(day, last)); return d.getTime(); };
  const DAY = 86400000;
  /* 日付の並びの「歩幅」: { months } か { days } */
  function dateStep(ts, monthly) {
    if (ts.length < 2) return monthly ? { months: 1 } : { days: 1 };
    const a = new Date(ts[ts.length - 2]), b = new Date(ts[ts.length - 1]);
    if (monthly || a.getUTCDate() === b.getUTCDate()) {
      const months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
      if (months) return { months };
    }
    return { days: Math.round((ts[ts.length - 1] - ts[ts.length - 2]) / DAY) || 1 };
  }
  const stepT = (t, st, k) => (st.months ? addMonths(t, st.months * k) : t + st.days * k * DAY);

  const NUM_RE = /^([+-]?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?$/;
  function parseNum(s) {
    const m = NUM_RE.exec(String(s).trim());
    if (!m) return null;
    const ip = m[2];
    return { v: parseFloat(m[1] + ip.replace(/,/g, '') + (m[3] ? '.' + m[3] : '')), dec: m[3] ? m[3].length : 0, comma: ip.includes(','), zw: !ip.includes(',') && ip.length > 1 && ip[0] === '0' ? ip.length : 0 };
  }
  function fmtNum(o, v) {
    const neg = v < 0;
    let s = Math.abs(v).toFixed(o.dec);
    let [ip, fp] = s.split('.');
    if (o.zw) ip = ip.padStart(o.zw, '0');
    if (o.comma) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + ip + (fp ? '.' + fp : '');
  }
  /* 文字＋最後の数 */
  const TAIL_RE = /^(.*?)(\d+)(\D*)$/;

  /* srcs（元の文字の並び）から n 個の続きを作る。copy = コピー */
  function seriesText(srcs, n, copy) {
    const out = [];
    const cyc = () => { for (let i = 0; i < n; i++) out.push(srcs[i % srcs.length]); return out; };
    if (copy || !srcs.length) return cyc();
    /* 日付 */
    const ds = srcs.map(parseDateStr);
    if (ds.every((d) => d) && ds.every((d) => d.k === ds[0].k)) {
      const monthly = ds[0].k === 'ym' || ds[0].k === 'ymj';
      const st = dateStep(ds.map((d) => d.t), monthly);
      const last = ds[ds.length - 1];
      for (let i = 1; i <= n; i++) out.push(fmtDateStr(last, stepT(last.t, st, i)));
      return out;
    }
    /* 数 */
    const ns = srcs.map(parseNum);
    if (ns.every((x) => x)) {
      const step = ns.length >= 2 ? ns[ns.length - 1].v - ns[ns.length - 2].v : 1;
      const f = Object.assign({}, ns[ns.length - 1], { dec: Math.max(...ns.map((x) => x.dec)) });
      const last = ns[ns.length - 1].v;
      for (let i = 1; i <= n; i++) out.push(fmtNum(f, Math.round((last + step * i) * 1e9) / 1e9));
      return out;
    }
    /* 並び（曜日・月・干支…） */
    for (const L of LISTS) {
      const ix = srcs.map((s) => L.indexOf(s.trim()));
      if (ix.every((i) => i >= 0)) {
        const step = ix.length >= 2 ? ix[ix.length - 1] - ix[ix.length - 2] || 1 : 1;
        const last = ix[ix.length - 1];
        for (let i = 1; i <= n; i++) out.push(L[(((last + step * i) % L.length) + L.length) % L.length]);
        return out;
      }
    }
    /* 文字＋最後の数 */
    const ts = srcs.map((s) => TAIL_RE.exec(s));
    if (ts.every((m) => m) && ts.every((m) => m[1] === ts[0][1] && m[3] === ts[0][3])) {
      const vs = ts.map((m) => parseInt(m[2], 10));
      const step = vs.length >= 2 ? vs[vs.length - 1] - vs[vs.length - 2] || 1 : 1;
      const w = ts[ts.length - 1][2].length, zero = ts[ts.length - 1][2][0] === '0';
      const last = vs[vs.length - 1];
      for (let i = 1; i <= n; i++) {
        const v = Math.max(0, last + step * i);
        out.push(ts[0][1] + (zero ? pad(v, w) : String(v)) + ts[0][3]);
      }
      return out;
    }
    return cyc();
  }

  /* ============================================================
   *  プロパティの値（Notion の形）
   * ============================================================ */
  const RO = new Set(['formula', 'rollup', 'created_time', 'created_by', 'last_edited_time', 'last_edited_by', 'auto_increment_id', 'button', 'unique_id', 'verification', 'location']);
  const TEXTISH = new Set(['title', 'text', 'url', 'email', 'phone_number', 'number']);
  const plain = (v) => (v || []).map((s) => (s[0] === '‣' ? '' : String(s[0]))).join('');
  function dateAnn(v) {
    for (const seg of v || []) for (const a of (Array.isArray(seg[1]) ? seg[1] : [])) if (a[0] === 'd' && a[1]) return a[1];
    return null;
  }
  const isoToT = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; };
  const tToIso = (t) => { const d = new Date(t); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1, 2) + '-' + pad(d.getUTCDate(), 2); };
  /* 元の値（Notion の形）の並びから、n 個の続きの値（Notion の形）を作る */
  function seriesValues(type, srcVals, n, copy) {
    if (TEXTISH.has(type)) {
      const txt = seriesText(srcVals.map(plain), n, copy);
      return txt.map((t) => (t ? [[t]] : []));
    }
    if (type === 'date' && !copy) {
      const anns = srcVals.map(dateAnn);
      if (anns.every((a) => a && isoToT(a.start_date) != null)) {
        const ts = anns.map((a) => isoToT(a.start_date));
        const st = dateStep(ts, false);
        const last = anns[anns.length - 1], lt = ts[ts.length - 1];
        const span = last.end_date && isoToT(last.end_date) != null ? isoToT(last.end_date) - lt : null;
        const out = [];
        for (let i = 1; i <= n; i++) {
          const t = stepT(lt, st, i);
          const a = Object.assign({}, last, { start_date: tToIso(t) });
          if (span != null) a.end_date = tToIso(t + span);
          out.push([['‣', [['d', a]]]]);
        }
        return out;
      }
    }
    const out = [];
    for (let i = 0; i < n; i++) out.push(JSON.parse(JSON.stringify(srcVals[i % srcVals.length] || [])));
    return out;
  }

  /* ============================================================
   *  表の構造（画面から）
   * ============================================================ */
  const rowOf = (cell) => cell.closest('[data-block-id]');
  const rowId = (cell) => { const r = rowOf(cell); return r ? r.getAttribute('data-block-id') : ''; };
  function isDataCell(el) {
    if (!el || !el.matches || !el.matches(CELL)) return false;
    if (el.closest(HEADER) || el.closest('[role="dialog"]')) return false;
    const r = rowOf(el);
    return !!(r && el.closest(TABLE) && r.closest(TABLE));
  }
  function cellAtPoint(x, y) {
    for (const el of document.elementsFromPoint(x, y)) {
      if (el.closest && el.closest('#c32-ui')) continue;
      const c = el.closest && el.closest(CELL);
      if (c && isDataCell(c)) return c;
    }
    return null;
  }
  /* 同じ列のセル（DOM の順＝上から） */
  function columnCells(cell) {
    const table = cell.closest(TABLE);
    const r = cell.getBoundingClientRect(), cx = r.left + r.width / 2;
    const ci = cell.getAttribute('data-col-index');
    const out = [], seen = new Set();
    for (const c of table.querySelectorAll(CELL)) {
      if (!isDataCell(c)) continue;
      if (ci != null) { if (c.getAttribute('data-col-index') !== ci) continue; }
      else { const b = c.getBoundingClientRect(); if (cx < b.left || cx > b.right) continue; }
      const rid = rowId(c);
      if (!rid || seen.has(rid)) continue;
      seen.add(rid);
      out.push(c);
    }
    out.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    return out;
  }
  function headerTextOf(cell) {
    const table = cell.closest(TABLE);
    const r = cell.getBoundingClientRect(), cx = r.left + r.width / 2;
    let best = null, bd = Infinity;
    for (const h of table.querySelectorAll(HEADER)) {
      const b = h.getBoundingClientRect();
      if (!b.width) continue;
      const d = cx >= b.left && cx <= b.right ? 0 : Math.min(Math.abs(cx - b.left), Math.abs(cx - b.right));
      if (d < bd) { bd = d; best = h; }
    }
    if (best && bd < 4) return best.textContent.replace(/\s+/g, ' ').trim();
    /* 見出しの印が無い時: 一番上の行より上で、同じ横位置にある一番細い文字の入れ物 */
    const col = columnCells(cell);
    const top = col.length ? col[0].getBoundingClientRect().top : r.top;
    let pick = null, pw = Infinity;
    for (const el of table.querySelectorAll('div, span')) {
      if (el.closest(CELL)) continue;
      const b = el.getBoundingClientRect();
      if (!b.width || b.bottom > top + 1 || b.top < top - 80 || cx < b.left || cx > b.right) continue;
      const t = el.textContent.replace(/\s+/g, ' ').trim();
      if (!t || t.length > 60) continue;
      if (b.width < pw) { pw = b.width; pick = t; }
    }
    return pick || '';
  }
  const normName = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  /* 列 → プロパティ（見出しの名前 → 値の一致の順で決める） */
  async function propOf(cell, rec) {
    const sc = await schemaOf(rec.parent_id);
    if (!sc) throw new Error('DB の列の情報を読み取れませんでした');
    const h = normName(headerTextOf(cell));
    let ids = Object.keys(sc).filter((k) => normName(sc[k].name) === h);
    if (ids.length !== 1 && h) ids = Object.keys(sc).filter((k) => h.endsWith(normName(sc[k].name)) && normName(sc[k].name));
    if (ids.length !== 1) {
      const txt = cell.textContent.replace(/\s+/g, ' ').trim();
      const byVal = Object.keys(sc).filter((k) => txt && plain(rec.properties && rec.properties[k]).replace(/\s+/g, ' ').trim() === txt);
      if (byVal.length === 1) ids = byVal;
    }
    if (ids.length !== 1) throw new Error('どの列か分かりませんでした（見出し: ' + (h || '空') + '）');
    return { pid: ids[0], type: sc[ids[0]].type, name: sc[ids[0]].name };
  }

  /* ============================================================
   *  書き込み（フィル）と元に戻す
   * ============================================================ */
  let lastFill = null;
  async function fill(srcCells, dstCells, copy) {
    if (!dstCells.length) return;
    const srcIds = srcCells.map(rowId), dstIds = dstCells.map(rowId);
    const recs = await getRecords('block', [...new Set(srcIds.concat(dstIds))]);
    const r0 = recs.get(srcIds[0]);
    if (!r0) throw new Error('元のページを読み取れませんでした');
    const prop = await propOf(srcCells[0], r0);
    if (RO.has(prop.type)) throw new Error('「' + prop.name + '」は読み取り専用の列です');
    const srcVals = srcIds.map((id) => { const r = recs.get(id); return (r && r.properties && r.properties[prop.pid]) || []; });
    const vals = seriesValues(prop.type, srcVals, dstIds.length, copy);
    const spaceId = r0.space_id;
    const ops = [], undo = [];
    dstIds.forEach((id, i) => {
      const r = recs.get(id);
      if (!r) return;
      const ptr = { table: 'block', id, spaceId: r.space_id || spaceId };
      undo.push({ ptr, before: (r.properties && r.properties[prop.pid]) || null });
      ops.push({ pointer: ptr, path: ['properties', prop.pid], command: 'set', args: vals[i] });
      ops.push({ pointer: ptr, path: [], command: 'update', args: { last_edited_time: Date.now() } });
    });
    await saveOps(ops, spaceId, 'c32.fill');
    ST.fills++; ST.cells += undo.length;
    lastFill = { srcCells, dstCells, copy, undo, spaceId, prop };
    return { n: undo.length, prop, sample: vals.length ? plain(vals[vals.length - 1]) || (prop.type === 'date' ? (dateAnn(vals[vals.length - 1]) || {}).start_date : '') : '' };
  }
  async function undoFill() {
    const f = lastFill;
    if (!f) return false;
    const ops = [];
    for (const u of f.undo) {
      ops.push({ pointer: u.ptr, path: ['properties', f.prop.pid], command: 'set', args: u.before || [] });
      ops.push({ pointer: u.ptr, path: [], command: 'update', args: { last_edited_time: Date.now() } });
    }
    await saveOps(ops, f.spaceId, 'c32.undo');
    lastFill = null;
    return true;
  }
  /* 先読みの見本（画面の文字だけで計算・書き込みはしない） */
  function previewText(srcCells, n, copy) {
    const txt = srcCells.map((c) => c.textContent.replace(/\s+/g, ' ').trim());
    const v = seriesText(txt, n, copy);
    return v[v.length - 1] || '';
  }

  /* ============================================================
   *  画面（■・枠・見本・帯・ステータスバー）
   * ============================================================ */
  let ui = null, handle = null, box = null, tip = null, bar = null, stat = null;
  function installUi() {
    if (ui && ui.isConnected) return;
    ui = document.createElement('div');
    ui.id = 'c32-ui';
    ui.innerHTML = '<div class="c32-box"></div><div class="c32-sel"></div><div class="c32-handle" title="ドラッグで連続データ（⌥でコピー）・ダブルクリックで最後の行まで"></div><div class="c32-tip"></div><div class="c32-bar"></div><div class="c32-stat"></div>';
    document.body.appendChild(ui);
    handle = ui.querySelector('.c32-handle'); box = ui.querySelector('.c32-box'); tip = ui.querySelector('.c32-tip');
    bar = ui.querySelector('.c32-bar'); stat = ui.querySelector('.c32-stat');
    /* ■ の押下は window の捕捉段階で受け止める（Notion は document の捕捉段階で受け取るので、それより前） */
    for (const t of ['pointerdown', 'mousedown']) window.addEventListener(t, (e) => { if (e.target === handle) { e.preventDefault(); e.stopImmediatePropagation(); if (t === 'pointerdown') onHandleDown(e); } }, true);
    window.addEventListener('dblclick', (e) => { if (e.target === handle) { e.stopImmediatePropagation(); onHandleDbl(e); } }, true);
    bar.addEventListener('click', onBarClick);
    const st = document.createElement('style');
    st.id = 'c32-css';
    st.textContent = `
#c32-ui{position:fixed;inset:0;pointer-events:none;z-index:2147483000;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Segoe UI",sans-serif}
#c32-ui .c32-handle{position:fixed;width:8px;height:8px;margin:-9px 0 0 -9px;background:#2383e2;border:1.5px solid #fff;border-radius:1.5px;box-shadow:0 0 0 .5px rgba(35,131,226,.6);cursor:crosshair;pointer-events:auto;display:none}
#c32-ui .c32-handle[data-on="1"]{display:block}
#c32-ui .c32-handle:hover{transform:scale(1.3);box-shadow:0 0 0 3px rgba(35,131,226,.18)}
#c32-ui .c32-box{position:fixed;border:2px solid #2383e2;border-radius:2px;background:rgba(35,131,226,.06);display:none}
#c32-ui .c32-box[data-on="1"]{display:block}
#c32-ui .c32-box[data-mode="copy"]{border-style:dashed}
#c32-ui .c32-sel{position:fixed;border:1.5px solid rgba(35,131,226,.75);background:rgba(35,131,226,.08);border-radius:2px;display:none}
#c32-ui .c32-sel[data-on="1"]{display:block}
#c32-ui .c32-tip{position:fixed;padding:3px 8px;border-radius:6px;background:rgba(15,15,15,.88);color:#fff;white-space:nowrap;display:none;font-variant-numeric:tabular-nums}
#c32-ui .c32-tip[data-on="1"]{display:block}
#c32-ui .c32-bar{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);display:none;align-items:center;gap:4px;padding:5px 6px 5px 12px;border-radius:10px;background:var(--c-bgPri,#fff);color:var(--c-texPri,#37352f);box-shadow:0 0 0 .5px rgba(15,15,15,.12),0 8px 24px rgba(15,15,15,.16);pointer-events:auto}
#c32-ui .c32-bar[data-on="1"]{display:flex}
#c32-ui .c32-bar span{margin-right:6px;color:var(--c-texSec,#787774)}
#c32-ui .c32-bar button{height:24px;padding:0 10px;border:0;border-radius:6px;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:inherit;font-weight:500;cursor:pointer}
#c32-ui .c32-bar button:hover{background:rgba(35,131,226,.12)}
#c32-ui .c32-stat{position:fixed;right:18px;bottom:14px;display:none;gap:14px;padding:5px 12px;border-radius:8px;background:var(--c-bgPri,#fff);color:var(--c-texSec,#787774);box-shadow:0 0 0 .5px rgba(15,15,15,.12),0 4px 14px rgba(15,15,15,.12);font-variant-numeric:tabular-nums}
#c32-ui .c32-stat[data-on="1"]{display:flex}
#c32-ui .c32-stat b{color:var(--c-texPri,#37352f);font-weight:600;margin-left:4px}
html[data-c32-drag] , html[data-c32-drag] *{cursor:crosshair !important;user-select:none !important}
`;
    (document.head || document.documentElement).appendChild(st);
  }
  const on = (el, v) => { if (el) { if (v) el.setAttribute('data-on', '1'); else el.removeAttribute('data-on'); } };
  function place(el, r) { el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.width = r.width + 'px'; el.style.height = r.height + 'px'; }
  const union = (a, b) => { const l = Math.min(a.left, b.left), t = Math.min(a.top, b.top), rr = Math.max(a.right, b.right), bb = Math.max(a.bottom, b.bottom); return { left: l, top: t, width: rr - l, height: bb - t }; };

  /* ---- ■ を出すセル ---- */
  let hot = null;
  function showHandle(cell) {
    installUi();
    hot = cell;
    if (!cell) { on(handle, false); return; }
    const r = cell.getBoundingClientRect();
    handle.style.left = (r.right - 1) + 'px';
    handle.style.top = (r.bottom - 1) + 'px';
    on(handle, true);
  }
  let moveRaf = 0, lastXY = null;
  function onMouseMove(e) {
    if (drag) return;
    lastXY = [e.clientX, e.clientY];
    if (moveRaf) return;
    moveRaf = requestAnimationFrame(() => {
      moveRaf = 0;
      const [x, y] = lastXY;
      if (handle && handle.getAttribute('data-on') === '1') {
        const hr = handle.getBoundingClientRect();
        if (x >= hr.left - 6 && x <= hr.right + 6 && y >= hr.top - 6 && y <= hr.bottom + 6) return;
      }
      /* 角の周り（14px）にいる間は今のセルのまま（隣のセルに入っても ■ を動かさない） */
      if (hot && hot.isConnected) {
        const r = hot.getBoundingClientRect();
        if (x > r.right - 14 && x < r.right + 10 && y > r.bottom - 14 && y < r.bottom + 10) return;
      }
      const c = cellAtPoint(x, y);
      if (c !== hot) showHandle(c);
    });
  }
  window.addEventListener('scroll', () => { if (hot && !drag) showHandle(hot.isConnected ? hot : null); if (sel) drawSel(); }, true);

  /* ---- ドラッグ ---- */
  let drag = null;
  function srcRangeFor(cell) {
    /* ⇧クリックで選んだ範囲の中から始めたら、その範囲が元 */
    if (sel && sel.cells.includes(cell)) return sel.cells.slice();
    return [cell];
  }
  function onHandleDown(e) {
    if (e.button !== 0 || !hot) return;
    e.preventDefault(); e.stopPropagation();
    const col = columnCells(hot);
    const src = srcRangeFor(hot);
    drag = { col, src, start: hot, target: null, dir: 0, cells: [] };
    document.documentElement.setAttribute('data-c32-drag', '1');
    try { handle.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    window.addEventListener('pointermove', onDragMove, true);
    window.addEventListener('mousemove', blockMouse, true);
    window.addEventListener('pointerup', onDragUp, true);
    window.addEventListener('mouseup', blockMouse, true);
    window.addEventListener('keydown', onDragKey, true);
    window.addEventListener('keyup', onDragKey, true);
  }
  function computeDrag(x, y, alt) {
    const d = drag;
    const r0 = d.src[0].getBoundingClientRect();
    const cx = r0.left + r0.width / 2;
    let tgt = cellAtPoint(cx, y);
    if (!tgt || !d.col.includes(tgt)) {
      /* 表の外へ出た時は、一番近い行 */
      let best = null, bd = Infinity;
      for (const c of d.col) { const b = c.getBoundingClientRect(); const dd = y < b.top ? b.top - y : y > b.bottom ? y - b.bottom : 0; if (dd < bd) { bd = dd; best = c; } }
      tgt = best;
    }
    const iS = d.col.indexOf(d.src[0]), iE = d.col.indexOf(d.src[d.src.length - 1]), iT = d.col.indexOf(tgt);
    d.copy = !!alt;
    if (iT > iE) { d.dir = 1; d.cells = d.col.slice(iE + 1, iT + 1); }
    else if (iT < iS) { d.dir = -1; d.cells = d.col.slice(iT, iS).reverse(); }
    else { d.dir = 0; d.cells = []; }
    const a = d.dir < 0 ? tgt : d.src[0], b = d.dir > 0 ? tgt : d.src[d.src.length - 1];
    place(box, union(a.getBoundingClientRect(), b.getBoundingClientRect()));
    box.setAttribute('data-mode', d.copy ? 'copy' : 'series');
    on(box, true);
    if (d.cells.length) {
      const srcs = d.dir < 0 ? d.src.slice().reverse() : d.src;
      const pv = previewText(srcs, d.cells.length, d.copy);
      tip.textContent = (d.copy ? 'コピー: ' : '') + (pv || '（空）') + '　' + d.cells.length + ' 行';
      tip.style.left = (x + 14) + 'px'; tip.style.top = (y + 12) + 'px';
      on(tip, true);
    } else on(tip, false);
  }
  function onDragMove(e) { if (!drag) return; e.preventDefault(); e.stopImmediatePropagation(); drag.x = e.clientX; drag.y = e.clientY; drag.alt = e.altKey; computeDrag(e.clientX, e.clientY, e.altKey); }
  let suppressClickUntil = 0;
  function blockMouse(e) { e.preventDefault(); e.stopImmediatePropagation(); }
  window.addEventListener('click', (e) => { if (Date.now() < suppressClickUntil) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  function onDragKey(e) {
    if (!drag) return;
    if (e.key === 'Escape') { endDrag(); return; }
    if (e.key === 'Alt' && drag.y != null) computeDrag(drag.x, drag.y, e.type === 'keydown');
  }
  function endDrag() {
    window.removeEventListener('pointermove', onDragMove, true);
    window.removeEventListener('mousemove', blockMouse, true);
    window.removeEventListener('pointerup', onDragUp, true);
    window.removeEventListener('mouseup', blockMouse, true);
    suppressClickUntil = Date.now() + 400;
    window.removeEventListener('keydown', onDragKey, true);
    window.removeEventListener('keyup', onDragKey, true);
    document.documentElement.removeAttribute('data-c32-drag');
    on(box, false); on(tip, false);
    drag = null;
  }
  async function onDragUp(e) {
    const d = drag;
    if (!d) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (d.y == null) { endDrag(); return; }
    computeDrag(e.clientX, e.clientY, e.altKey);
    const cells = d.cells.slice(), srcs = d.dir < 0 ? d.src.slice().reverse() : d.src.slice(), copy = d.copy;
    endDrag();
    if (cells.length) run(srcs, cells, copy);
  }
  function onHandleDbl(e) {
    e.preventDefault(); e.stopPropagation();
    if (!hot) return;
    const col = columnCells(hot), src = srcRangeFor(hot);
    const iE = col.indexOf(src[src.length - 1]);
    const cells = col.slice(iE + 1);
    if (cells.length) run(src, cells, e.altKey);
  }
  async function run(srcs, cells, copy) {
    showBar('書き込み中…', false);
    try {
      const r = await fill(srcs, cells, copy);
      showBar((copy ? 'コピー' : '連続データ') + '：「' + r.prop.name + '」に ' + r.n + ' 行' + (r.sample ? '（最後: ' + r.sample + '）' : ''), true);
    } catch (err) {
      ST.lastError = String(err && err.message || err);
      console.warn(TAG, err);
      showBar('できませんでした: ' + ST.lastError, false);
    }
  }
  function showBar(msg, actions) {
    installUi();
    bar.innerHTML = '<span></span>' + (actions ? '<button data-a="undo">元に戻す</button><button data-a="flip">' + (lastFill && lastFill.copy ? '連続データにする' : 'コピーにする') + '</button>' : '') + '<button data-a="x" title="閉じる（Esc）">×</button>';
    bar.firstChild.textContent = msg;
    on(bar, true);
    clearTimeout(showBar.t);
    showBar.t = setTimeout(() => on(bar, false), actions ? 9000 : 4500);
  }
  async function onBarClick(e) {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const a = b.getAttribute('data-a');
    if (a === 'x') { on(bar, false); return; }
    const f = lastFill;
    if (!f) { on(bar, false); return; }
    try {
      if (a === 'undo') { await undoFill(); showBar('元に戻しました', false); }
      else if (a === 'flip') { await undoFill(); await run(f.srcCells, f.dstCells, !f.copy); }
    } catch (err) { showBar('できませんでした: ' + (err && err.message || err), false); }
  }

  /* ---- ⇧クリックの範囲・ステータスバー ---- */
  let anchor = null, sel = null;
  function onClickCell(e) {
    const t = e.target;
    if (!(t instanceof Element) || t.closest('#c32-ui')) return;
    const c = t.closest(CELL);
    if (!c || !isDataCell(c)) { if (!t.closest('[role="dialog"], .notion-overlay-container')) clearSel(); return; }
    if (e.shiftKey && anchor && anchor.isConnected && anchor !== c) {
      const col = columnCells(anchor);
      const i = col.indexOf(anchor), j = col.indexOf(c);
      if (i >= 0 && j >= 0) { sel = { cells: col.slice(Math.min(i, j), Math.max(i, j) + 1) }; drawSel(); updateStat(); return; }
    }
    anchor = c;
    clearSel();
  }
  function drawSel() {
    installUi();
    const s = ui.querySelector('.c32-sel');
    if (!sel || !sel.cells.length || !sel.cells[0].isConnected) { on(s, false); return; }
    place(s, union(sel.cells[0].getBoundingClientRect(), sel.cells[sel.cells.length - 1].getBoundingClientRect()));
    on(s, true);
  }
  function clearSel() { sel = null; if (ui) { on(ui.querySelector('.c32-sel'), false); on(stat, false); } }
  function updateStat() {
    installUi();
    if (!sel) { on(stat, false); return; }
    const txt = sel.cells.map((c) => c.textContent.replace(/\s+/g, ' ').trim());
    const nums = txt.map((t) => { const n = parseNum(t.replace(/[¥$€£%\s]/g, '')); return n ? n.v : null; }).filter((v) => v != null);
    const cnt = txt.filter((t) => t).length;
    const f = (v) => (Math.round(v * 1000) / 1000).toLocaleString();
    let h = '<span>データの個数<b>' + cnt + '</b></span>';
    if (nums.length) {
      const sum = nums.reduce((a, b) => a + b, 0);
      h += '<span>数値<b>' + nums.length + '</b></span><span>合計<b>' + f(sum) + '</b></span><span>平均<b>' + f(sum / nums.length) + '</b></span><span>最小<b>' + f(Math.min(...nums)) + '</b></span><span>最大<b>' + f(Math.max(...nums)) + '</b></span>';
    }
    stat.innerHTML = h;
    on(stat, true);
  }

  /* ---- キー ---- */
  function fmtNow(fmt, d) {
    return fmt.replace(/YYYY/g, d.getFullYear()).replace(/MM/g, pad(d.getMonth() + 1, 2)).replace(/DD/g, pad(d.getDate(), 2))
      .replace(/HH/g, pad(d.getHours(), 2)).replace(/mm/g, pad(d.getMinutes(), 2)).replace(/ss/g, pad(d.getSeconds(), 2));
  }
  function editing(t) { return t instanceof Element && (t.isContentEditable || t.matches('input, textarea')); }
  function onKey(e) {
    if (e.key === 'Escape' && bar && bar.getAttribute('data-on') === '1') { on(bar, false); }
    if (!e.ctrlKey || e.metaKey) return;
    /* ⌃; ／ ⌃⇧; */
    if (e.code === 'Semicolon' && editing(e.target)) {
      e.preventDefault(); e.stopImmediatePropagation();
      const s = fmtNow(e.shiftKey ? P.timeFmt : P.dateFmt, new Date());
      try { document.execCommand('insertText', false, s); } catch (err) { /* noop */ }
      return;
    }
    /* ⌃D（文字の編集中は Notion・OS の動きのまま） */
    if (e.code === 'KeyD' && !e.shiftKey && !e.altKey && !editing(e.target)) {
      let srcs = null, cells = null;
      if (sel && sel.cells.length >= 2) { srcs = [sel.cells[0]]; cells = sel.cells.slice(1); }
      else {
        const c = anchor && anchor.isConnected ? anchor : hot;
        if (!c) return;
        const col = columnCells(c), i = col.indexOf(c);
        if (i <= 0) return;
        srcs = [col[i - 1]]; cells = [c];
      }
      e.preventDefault(); e.stopImmediatePropagation();
      run(srcs, cells, true);
    }
  }

  /* ============================================================
   *  起動
   * ============================================================ */
  window.addEventListener('mousemove', onMouseMove, { passive: true, capture: true });
  window.addEventListener('click', onClickCell, true);
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', () => { if (hot) showHandle(hot.isConnected ? hot : null); if (sel) drawSel(); });

  window.__c32 = {
    version: VERSION,
    status: () => Object.assign({ prefs: Object.assign({}, P), selection: sel ? sel.cells.length : 0 }, ST),
    series: (srcs, n, copy) => seriesText(srcs, n || 5, copy),
    dateFormat(f) { if (f) { P.dateFmt = String(f); savePrefs(); } return P.dateFmt; },
    timeFormat(f) { if (f) { P.timeFmt = String(f); savePrefs(); } return P.timeFmt; },
    undo: undoFill,
    _values: seriesValues
  };
})();
