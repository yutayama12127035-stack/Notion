// ==UserScript==
// @name         « No »　³³ _ Sidebar Constellation
// @namespace    https://cordivestium.local/sidebar-constellation
// @version      24.2.0
// @description  v3.1.0: 段々が実物の Notion で効いていなかったのを作り直し — 本物のアイコンの位置を測り、アイコンの入れ物を直接ずらす（¹⁶・Stylus の字下げと取り合わない・毎回差を測るので必ず目標で止まる）。■のアイコン＝★の名前の 1 文字目、●＝■の名前の 1 文字目、▲＝●の名前の 1 文字目。v3.0.0: 階層を段々に（★グループ ＞ ■チームスペース ＞ ●フルDB ＞ ▲ビュー）。どの段もアイコンの左端が一つ上の段の名前の 1 文字目にそろう（実測）。チームスペースの灰色の箱も出さない。元の並べ方は __c33.set({ tree: false })。v2.2.0: 選択中・カーソルを乗せた時の灰色の箱（影）を出さない（__c33.set({ noBg: false }) で戻せる）。v2.1.0: 書体を 1 つにそろえた（ビューも行と同じ書体）・ビューに付けたアイコンを表示・ビューのアイコンの左端を上の DB の題名の 1 文字目にそろえる（実測）・アイコンの大きさ／文字との間／上下、文字の上下、行の高さ、ワークスペースの間隔などを全部 CSS 変数にし ²⁶ Atelier の「サイドバー」から調整できるように。今開いているページ・ビューを太字に。v1.1.0: 字下げが効いていなかった・ビューのアイコンが■になっていた・ビューが左端に崩れていたのを修正。線・選択時の背景と左の印をやめ、ワークスペースごとに間を空けて区分けを明確に。サイドバーの大幅な見直し。階層を ★グループ ／ ■ワークスペース ／ ●フルDB（ワークスペースと同じ段）／ ▲各種ビュー（DB の下）に組み直し、ビューの「•」をビューの種類のアイコン（表・ボード・ギャラリー・リスト・カレンダー・タイムライン・グラフ・フィード・地図・フォーム・Atlas）に。ワークスペースは小さな見出し、DB とページは明朝の行、ビューは細い導線つきの小さな行、選択中は左に色の印。¹⁶ Sidebar Workspace Grouper（v15.6.0 以降）と一緒に使う。Notion の要素は動かさず、印と CSS だけで描く。
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
 * v23.2.0（2026-10-03）— 輪（Orbit）の作り直し
 *   ・右が見切れる: 輪の幅だけ Notion の本体（#notion-app）を右へずらしていたが、Notion は本文の枠の幅を画面の幅から
 *     計算して固定で持っている → ずらした分（108px）だけ右端（Share・⋯）が画面の外へ出ていた。
 *     → 輪はサイドバーの「Home」の中（タブの段の下〜「New chat」の上）に置き、サイドバーの中身だけを輪の幅ずらす。本体は動かさない。
 *   ・ボタン: サイドバーの上の段（Home・Chat… の並びの右）に ◎（Orbit）。押すと輪の入切。しまっても、ここからいつでも戻せる。
 *     右クリック（または輪の下の ⋯）で設定: 名前を常に出す（広い輪）／「すべて」を輪に入れる／中身の無い大分類を隠す／項目の高さ。
 *   ・細い輪（58px）: アイコン＋短い名前＋件数の印。乗せて少し待つと広がって名前が全部出る（一覧の上に重なるだけ・一覧は動かない）。
 *   ・「すべて」: 輪の先頭に、全部の大分類を出す項目。
 *   ・段々の浅さ: 輪が出ている間は ★ が輪にあるので、■ チームスペースは ★ のアイコンの位置へ（★ の名前の下まで下げない）。
 *     どの段でも名前に 92px は残す（深い段で名前が見切れない）。
 *   ・書体: 輪・メニューは UI の書体（--cordi-ui ＝ ²⁶ Atelier の「UI の書体」。無ければ SF／ヒラギノ角ゴ）。
 * v13.2.0（2026-10-03）
 *   ・輪（Orbit）と横の窓: サイドバーの左に、★グループ（12 の大分類）を回す細い輪。スクロールで上へ上へと回り（終わりが無い）、
 *     選んだ大分類が一番上に来て、右の Notion のサイドバーにはその中のチームスペース・ページだけが出る（横の窓）。
 *     ¹⁶ の★見出しの文字クリック・⋯ › 横に開く でもここで開く。⌃⌥O で入切、⌃⌥↑↓ で前後へ。
 * v3.2.0（2026-10-03）
 *   ・実物で DB の行の名前がアイコンの下に潜り込んでいた。原因: Notion のアイコン（.notion-record-icon）にも notranslate が付いていて、
 *     アイコンを「名前」と取り違え、アイコンだけを動かしていた（名前は動かず、親の名前の位置もアイコンで測っていた）。
 *     → 名前はアイコンの外の notranslate。動かした結果、名前がアイコンに重なるなら元に戻す安全弁。書体の CSS もアイコンに当てない。
 * v3.1.0（2026-10-03）
 *   ・実物の Notion で段々にならなかった原因: ①■チームスペースの「アイコンの位置」を行の最初の子（行いっぱいの包み）で測っていた
 *     ②字下げを padding で付けていたが、¹⁶ Sidebar Workspace Grouper と Stylus も padding を !important で付けていて取り合い、
 *     効かないまま「ずらした量」だけが毎回足されていた。
 *   ・新しいやり方: 本物のアイコン（img・svg・.notion-record-icon）の左端を測り、目標（一つ上の段の名前の 1 文字目）との差を、
 *     アイコンの入れ物の margin-inline-start に足す（style に直接・!important）。毎回いまの位置から測るので、ほかの字下げが
 *     何であっても最後は目標で止まる。¹⁶ は html[data-c33-tree] の間、チームスペースと行の字下げの調整をしない。
 *
 * v3.0.0（2026-10-03）
 *   ・階層を段々に: ★グループ ＞ ■チームスペース ＞ ●フルDB・ページ ＞ ▲ビュー（v1 の「DB をチームスペースと同じ段」はやめた）。
 *     ■ のアイコンは ★ の名前の 1 文字目、● のアイコンは ■ の名前の 1 文字目（子ページは親の名前の 1 文字目）、▲ は ● の名前の 1 文字目。
 *     ずらしは --c33-team-shift／--c33-db-shift／--c33-view-shift（²⁶ Atelier「サイドバー」）。前の並べ方は __c33.set({ tree: false })。
 *   ・チームスペースの行の灰色の箱（選択中・乗せた時）も出さない。
 *
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
  const VERSION = '24.2.0';
  const TAG = '[³³ v' + VERSION + ']';
  if (window.__c33 && window.__c33.version) { console.warn(TAG, '旧版が動いています'); return; }

  const LS = 'c33.prefs.v1';
  const LS_DB = 'c33.db.v1';     // DB だと分かった行の名前（閉じていても DB の印を付ける）
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
  /* v3.2.0: Notion のアイコン（.notion-record-icon）にも notranslate が付いている → 名前の箱はアイコンの外の notranslate */
  const nameEl = (row) => [...row.querySelectorAll('.notranslate')].find((e) => !e.closest('.notion-record-icon, [role="img"]') && !e.querySelector('.notion-record-icon, img, svg') && norm(e.textContent)) || null;
  const nameOf = (row) => norm((nameEl(row) || row).textContent).slice(0, 120);

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
  /* v3.0.0: 段々（★グループ ＞ ■チームスペース ＞ ●DB・ページ ＞ ▲ビュー）。
     どの段も「アイコンの左端 ＝ 一つ上の段の名前の 1 文字目」になるよう、実測して字下げを決める。
     ずらしは --c33-team-shift／--c33-db-shift／--c33-view-shift（Atelier「サイドバー」）。 */
  const cssPx = (n) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)) || 0;
  /* v3.1.0: 実物の Notion で段々にならなかった（v3.0 は ①チームスペースの「アイコン」を行の最初の子（行いっぱいの包み）で測っていた
     ②字下げを padding で付けていたが、¹⁶ や Stylus の padding と取り合って効かず、ずれの記憶だけが増えていた）。
     → 本物のアイコン（img・svg・.notion-record-icon）の位置を測り、アイコンの入れ物（アイコンと文字を並べる段の、アイコン側の子）に
        margin-inline-start を直接（style・!important）付ける。毎回「今の位置 → 目標」の差を測ってから足すので、
        ほかのスクリプト・CSS がどんな字下げを付けていても、最後は必ず目標の位置に止まる（増え続けない）。 */
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
  /* アイコンを含み、文字を含まない、いちばん外側の入れ物（container の子孫） */
  function moverOf(container, icon, text) {
    let m = icon;
    while (m.parentElement && m.parentElement !== container && !(text && m.parentElement.contains(text))) m = m.parentElement;
    return m;
  }
  const MV = new WeakMap();
  /* v23.0.0: 段々が深すぎて名前が見切れないよう、名前に最低これだけの幅を残す（px）*/
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
    /* 安全弁: 動かした結果、名前がアイコンに重なる（＝名前がいっしょに動かない入れ物だった）なら元に戻す */
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
  function alignTree(team, btn, info) {
    requestAnimationFrame(() => {
      if (!btn.isConnected) return;
      /* ■ チームスペース: アイコン → ★グループ見出しの文字の 1 文字目 */
      const g = team.getAttribute('data-c16-g');
      /* v23.0.0: 輪（Orbit）が出ている間は ★ が輪に出ているので、■ は ★ の「アイコン」の位置へ（★ の名前の下まで下げない＝一段ぶん浅く） */
      const orbitOn = document.documentElement.hasAttribute('data-c33-orbit');
      /* v24.2.0: 輪で 1 つの大分類を選んでいる間は ★ の見出しを出さない（輪と二重になる）→ ■ は一覧の左端（★ の段の左＋14px）へ */
      const sec = g ? document.querySelector('#c16-root .c16-sec[data-c16-g="' + CSS.escape(g) + '"]') : null;
      const headHidden = orbitOn && document.documentElement.hasAttribute('data-c33-osel');
      const lbl = sec ? sec.querySelector(orbitOn ? '.c16-ico' : '.c16-lbl') : null;
      if (headHidden && sec && sec.getBoundingClientRect().width) place(btn, sec.getBoundingClientRect().left + 14 + cssPx('--c33-team-shift'));
      else if (lbl && lbl.getBoundingClientRect().width) place(btn, (orbitOn ? lbl.getBoundingClientRect().left : textLeft(lbl)) + cssPx('--c33-team-shift'));
      const teamText = textEl(btn) || btn;
      const tTeam = textLeft(teamText);
      /* ● 行・▲ ビュー: 上から順に、親の名前の 1 文字目へ（親を先に動かしてから子を測る） */
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
    document.documentElement.toggleAttribute('data-c33-tree', P.tree !== false);   // ¹⁶ はこの印がある間、チームスペース・行の字下げを測らない（取り合わない）
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
  const NT = '.notranslate:not(.notion-record-icon)';   // 名前の箱（アイコンの notranslate は除く）
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
/* v3.0.0: ■ チームスペースの字下げ（★グループの文字の下へ）・灰色の箱を出さない */
html[data-c33] ${SEL_TEAM}[data-c33-team][data-c33-tpad] ${SEL_TEAM_BTN}${B} { padding-inline-start: var(--c33-tpad) !important; }
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN}${B}:is(:hover, :focus, :focus-visible, [aria-selected="true"], [aria-current]),
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] ${SEL_TEAM_BTN} > div${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] .notion-outliner-team-header${B},
html[data-c33][data-c33-nobg] ${SEL_TEAM}[data-c33-team] .notion-outliner-team-header-container${B} { background: transparent !important; background-color: transparent !important; box-shadow: none !important; }
/* ● DB・ページ ／ ▲ ビュー: 字下げ */
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][data-c33-pad]${B} { padding-inline-start: var(--c33-pad) !important; }
/* ● 行: 書体は 1 つの変数にそろえる（文字の入れ物の中まで） */
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"])${B} { height: var(--c33-item-h) !important; min-height: var(--c33-item-h) !important; border-radius: var(--c33-radius) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) :is(${NT}, ${NT} *):not(.notion-record-icon *)${B} { font-family: var(--c33-item-font) !important; font-size: var(--c33-item-size) !important; font-weight: var(--c33-item-weight) !important; letter-spacing: var(--c33-item-track) !important; color: var(--c33-item-color) !important; }
html[data-c33] ${SEL_TEAM}[data-c33-team] :is([data-c33-kind="db"], [data-c33-kind="page"]) ${NT}${B} { transform: translateY(var(--c33-text-dy)); }
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
html[data-c33] ${SEL_TEAM}[data-c33-team] [data-c33-kind][data-c33-cur] :is(${NT}, ${NT} *, div:not(:has(*)), span:not(:has(*))):not(.notion-record-icon *)${B} { font-weight: var(--c33-cur-weight) !important; color: var(--c33-cur-color) !important; }
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

  /* ============================================================
   *  v13.0.0: 輪（Orbit）と横の窓
   *    ・サイドバーの左に細い「輪」: ★グループ（12 の大分類）を縦に並べ、スクロールで上へ上へと回る（終わりが無い）。
   *      選ぶと、その大分類が一番上に来て、右の Notion のサイドバー（＝横の窓）には、その中のチームスペース・ページだけが出る。
   *      以降の移動はこの窓の中で完結。12 個を全部並べてもスクロールしない。
   *    ・¹⁶ の★見出しの文字クリック・「⋯ › 横に開く」でも、ここで開く。
   *    ・⌃⌥O で入／切。⌃⌥↑↓ で前後の大分類へ。
   * ============================================================ */
  /* v24.2.0: 輪を出すのを既定に（前の版でしまっていても、この版で一度だけ出し直す。以降はしまえば覚える） */
  const OB_KEY = 'c33.orbit.v2';
  const OB = Object.assign({ on: true, sel: '', itemH: 54, pin: false, hideEmpty: false, all: true }, (() => { try { const v2 = localStorage.getItem(OB_KEY); if (v2) return JSON.parse(v2); const v1 = JSON.parse(localStorage.getItem('c33.orbit.v1') || '{}'); v1.on = true; return v1; } catch (e) { return {}; } })());
  delete OB.railW;
  const obSave = () => { try { localStorage.setItem(OB_KEY, JSON.stringify(OB)); } catch (e) { /* noop */ } };
  const RAIL_W = 58, RAIL_X = 184;
  let obEl = null, obHost = null, obOff = 0, obTarget = 0, obRaf = 0, obSnapT = 0, obSig = '', obExpT = 0;
  const ALL = '*';
  const ICON_ALL = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="black"><rect x="3" y="3" width="6" height="6" rx="1.8"/><rect x="11" y="3" width="6" height="6" rx="1.8"/><rect x="3" y="11" width="6" height="6" rx="1.8"/><rect x="11" y="11" width="6" height="6" rx="1.8"/></svg>') + '")';
  const ICON_ORBIT = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><ellipse cx="10" cy="10" rx="7.6" ry="3.4" transform="rotate(-28 10 10)"/><circle cx="10" cy="10" r="2.3" fill="currentColor" stroke="none"/><circle cx="15.9" cy="6.1" r="1.25" fill="currentColor" stroke="none"/></svg>';
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
    const shown = OB.hideEmpty ? gs.filter((g) => g.cnt !== '0' || g.gid === OB.sel) : gs;
    if (OB.all !== false && shown.length) shown.unshift({ gid: ALL, label: 'すべて', cnt: '', txt: '', mask: ICON_ALL, bgi: 'none', tint: '' });
    return shown;
  }
  /* 輪を置く場所: サイドバーの「Home」の中身（タブの段・下の「New chat」の段には掛けない）。無ければ一覧のスクロール枠の親 */
  function obFindHost() {
    const home = document.querySelector('.notion-sidebar-container [id^="sidebar-tabpanel-home"], .notion-sidebar [id^="sidebar-tabpanel-home"]');
    if (home) return home;
    const sc = document.querySelector('.notion-sidebar-container .notion-scroller, .notion-sidebar .notion-scroller');
    return sc ? sc.parentElement : null;
  }
  function obCss() {
    let st = document.getElementById('c33-orbit-css');
    if (!st) { st = document.createElement('style'); st.id = 'c33-orbit-css'; (document.head || document.documentElement).appendChild(st); }
    const sel = OB.sel && OB.sel !== ALL ? CSS.escape(OB.sel) : '';
    const de = document.documentElement;
    de.toggleAttribute('data-c33-orbit', !!OB.on);
    /* 広い輪は、サイドバーに十分な幅がある時だけ（狭いと一覧が潰れる）。狭い時は乗せた時だけ広がる */
    const hw = obHost ? obHost.getBoundingClientRect().width : 0;
    de.toggleAttribute('data-c33-orbit-pin', !!(OB.on && OB.pin && hw >= RAIL_X + 200));
    if (sel && OB.on) de.setAttribute('data-c33-osel', OB.sel); else de.removeAttribute('data-c33-osel');
    st.textContent = `
:root { --c33-rail-w: ${RAIL_W}px; --c33-rail-x: ${RAIL_X}px; --c33-ui: var(--cordi-ui, "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", sans-serif); }
/* 輪の入れ物: サイドバーの中だけで完結（Notion の本体はずらさない＝右が見切れない） */
html[data-c33-orbit] [data-c33-host] { position: relative !important; }
html[data-c33-orbit] [data-c33-host] > :not(#c33-orbit) { margin-inline-start: calc(var(--c33-rail-w) + var(--c33-rail-fix, 0px)) !important; min-width: 0 !important; }
html[data-c33-orbit][data-c33-orbit-pin] [data-c33-host] > :not(#c33-orbit) { margin-inline-start: calc(var(--c33-rail-x) + var(--c33-rail-fix, 0px)) !important; }
/* 1 つの大分類を選んでいる間は、★ の見出し（名前・件数・⋯）を出さない（左の輪で分かるので二重になる） */
html[data-c33-orbit][data-c33-osel] .notion-sidebar-container #c16-root .c16-sec > .c16-head { display: none !important; }
${sel ? `html[data-c33-orbit] .notion-sidebar-container #c16-root .c16-sec:not([data-c16-g="${sel}"]) { display: none !important; }
html[data-c33-orbit] .notion-sidebar-container ${SEL_TEAM}[data-c16-g]:not([data-c16-g="${sel}"]) { display: none !important; }
html[data-c33-orbit] .notion-sidebar-container [data-c16-arm]:not(:has(${SEL_TEAM}[data-c16-g="${sel}"])):has(${SEL_TEAM}) { display: none !important; }` : ''}
#c33-orbit { position: absolute; z-index: 6; left: 0; top: 0; bottom: 0; width: var(--c33-rail-w); display: flex; flex-direction: column; align-items: stretch;
  font-family: var(--c33-ui); font-size: 11px; line-height: 1.3; font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; color: var(--c-texSec, #777); user-select: none;
  background: color-mix(in srgb, var(--c-bacSec, #f7f6f3) 70%, var(--c-texPri, #000) 3%); box-shadow: inset -1px 0 0 var(--ca-borSecTra, rgba(0,0,0,.06));
  transition: width .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease, background-color .22s ease; overflow: hidden; contain: layout paint; }
#c33-orbit.exp, html[data-c33-orbit-pin] #c33-orbit { width: var(--c33-rail-x); }
#c33-orbit.exp:not(.pin) { background: color-mix(in srgb, var(--c-bacSec, #f7f6f3) 88%, transparent); -webkit-backdrop-filter: blur(14px) saturate(1.3); backdrop-filter: blur(14px) saturate(1.3);
  box-shadow: inset -1px 0 0 var(--ca-borSecTra, rgba(0,0,0,.06)), 10px 0 28px -12px rgba(15,15,15,.22); }
#c33-orbit .ob-wheel { position: relative; flex: 1; overflow: hidden; perspective: 640px;
  -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - 46px), transparent 100%); mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - 46px), transparent 100%); }
#c33-orbit .ob-it { position: absolute; left: 5px; right: 5px; top: 0; height: ${OB.itemH - 6}px; border-radius: 11px; display: grid; grid-template-columns: 1fr; grid-template-rows: 24px auto; justify-items: center; align-content: center; row-gap: 3px;
  cursor: pointer; transform-origin: 50% 0; will-change: transform, opacity; transition: background-color .15s ease, color .15s ease; }
#c33-orbit.exp .ob-it, html[data-c33-orbit-pin] #c33-orbit .ob-it { grid-template-columns: 26px 1fr auto; grid-template-rows: 1fr; justify-items: start; align-items: center; column-gap: 9px; padding: 0 10px 0 9px; }
#c33-orbit .ob-it:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-orbit .ob-it.top { color: var(--c-texPri, #222); }
#c33-orbit .ob-it.sel { background: color-mix(in srgb, var(--ob-tint, var(--lm-accent, #2783de)) 13%, transparent); color: var(--c-texPri, #222); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ob-tint, var(--lm-accent, #2783de)) 26%, transparent); }
#c33-orbit .ob-it.empty:not(.sel) { opacity: .42 !important; }
#c33-orbit .ob-ic { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 19px; line-height: 1; }
#c33-orbit .ob-lb { max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 9.5px; font-weight: 600; letter-spacing: .01em; text-align: center; }
#c33-orbit.exp .ob-lb, html[data-c33-orbit-pin] #c33-orbit .ob-lb { font-size: 12.5px; font-weight: 500; text-align: left; letter-spacing: .005em; }
#c33-orbit .ob-ct { position: absolute; top: 3px; left: calc(50% + 5px); min-width: 13px; height: 13px; padding: 0 3.5px; box-shadow: 0 0 0 1.5px var(--c-bacSec, #f7f6f3); border-radius: 999px; display: flex; align-items: center; justify-content: center;
  font: 600 9px/1 var(--c33-ui); font-variant-numeric: tabular-nums; background: color-mix(in srgb, var(--c-texPri, #000) 7%, transparent); color: var(--c-texSec, #777); }
#c33-orbit .ob-ct:empty { display: none; }
#c33-orbit.exp .ob-ct, html[data-c33-orbit-pin] #c33-orbit .ob-ct { position: static; box-shadow: none; }
#c33-orbit .ob-ft { display: flex; justify-content: center; gap: 2px; padding: 6px 0 8px; flex: none; }
#c33-orbit .ob-ft button { border: 0; background: transparent; color: inherit; cursor: pointer; width: 24px; height: 24px; border-radius: 7px; display: flex; align-items: center; justify-content: center; padding: 0; }
#c33-orbit .ob-ft button:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.06)); color: var(--c-texPri, #333); }
#c33-orbit .ob-ft svg { width: 14px; height: 14px; }
#c33-orbit .ob-empty { padding: 18px 6px; text-align: center; line-height: 1.6; font-size: 10px; }
/* サイドバーの上の段のボタン（輪の入切） */
#c33-orbit-btn { width: 32px; height: 32px; flex: none; border-radius: 999px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--c-icoSec, #91918e); transition: background-color .12s ease, color .12s ease; }
#c33-orbit-btn:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); color: var(--c-texPri, #333); }
#c33-orbit-btn[aria-pressed="true"] { color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); }
/* 輪のメニュー・案内 */
#c33-ob-menu { position: fixed; z-index: 2147483300; min-width: 220px; padding: 5px; border-radius: 12px; background: var(--c-bacEle, #fff); color: var(--c-texPri, #333);
  box-shadow: var(--c-shaOutMd, 0 8px 28px rgba(0,0,0,.16)), 0 0 0 1px var(--ca-borSecTra, rgba(0,0,0,.06)); font: 13px/1.35 var(--c33-ui); font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; }
#c33-ob-menu .om-h { padding: 6px 10px 4px; font-size: 11px; font-weight: 600; letter-spacing: .04em; color: var(--c-texTer, #999); }
#c33-ob-menu .om-i { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 10px; border: 0; background: none; color: inherit; font: inherit; text-align: left; border-radius: 8px; cursor: pointer; }
#c33-ob-menu .om-i:hover { background: var(--ca-bacIntTra, rgba(0,0,0,.05)); }
#c33-ob-menu .om-i .ck { width: 16px; text-align: center; color: var(--lm-accent, var(--c-bluTexAccPri, #2783de)); }
#c33-ob-menu .om-i .k { margin-left: auto; font-size: 11px; color: var(--c-texTer, #999); }
#c33-ob-menu hr { border: 0; height: 1px; background: var(--ca-borSecTra, rgba(0,0,0,.06)); margin: 4px 6px; }
#c33-ob-toast { position: fixed; z-index: 2147483300; left: 16px; bottom: 76px; max-width: 280px; padding: 10px 14px; border-radius: 12px; background: var(--c-bacEle, #fff); color: var(--c-texPri, #333);
  box-shadow: var(--c-shaOutMd, 0 8px 28px rgba(0,0,0,.16)); font: 12.5px/1.55 var(--c33-ui); font-feature-settings: "palt" 1; opacity: 0; transform: translateY(6px); transition: opacity .2s ease, transform .2s ease; pointer-events: none; }
#c33-ob-toast.on { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { #c33-orbit, #c33-orbit .ob-it { transition: none !important; } }`;
  }
  const obMod = (x, n) => ((x % n) + n) % n;
  /* 上の段（Home・Chat… の並び）にボタン — 輪をしまっても、ここからいつでも戻せる */
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
      b.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); obMenu(b); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); obToggle(); } });
    }
    if (b.parentElement !== row) row.appendChild(b);
    b.setAttribute('aria-pressed', OB.on ? 'true' : 'false');
    b.title = (OB.on ? '大分類の輪（Orbit）をしまう' : '大分類の輪（Orbit）を出す') + '　⌃⌥O ／ 右クリックで設定';
  }
  function obToast(msg) {
    let t = document.getElementById('c33-ob-toast');
    if (!t) { t = document.createElement('div'); t.id = 'c33-ob-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('on'));
    clearTimeout(t.__t); t.__t = setTimeout(() => t.classList.remove('on'), 3200);
  }
  function obMenu(anchor) {
    let m = document.getElementById('c33-ob-menu');
    if (m) { m.remove(); return; }
    m = document.createElement('div'); m.id = 'c33-ob-menu';
    const it = (k, label, on, key) => '<button class="om-i" data-k="' + k + '"><span class="ck">' + (on ? '✓' : '') + '</span><span>' + label + '</span>' + (key ? '<span class="k">' + key + '</span>' : '') + '</button>';
    m.innerHTML = '<div class="om-h">ORBIT — 大分類の輪</div>'
      + it('on', '輪を出す', OB.on, '⌃⌥O')
      + it('pin', '名前を常に出す（サイドバーが広い時）', OB.pin)
      + it('all', '「すべて」を輪に入れる', OB.all !== false)
      + it('hideEmpty', '中身の無い大分類を隠す', OB.hideEmpty)
      + '<hr>' + it('size', '項目の高さ: ' + (OB.itemH >= 60 ? 'ゆったり' : OB.itemH <= 46 ? '詰める' : 'ふつう'), false)
      + it('next', '次の大分類へ', false, '⌃⌥↓') + it('prev', '前の大分類へ', false, '⌃⌥↑');
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect();
    m.style.left = Math.min(innerWidth - 240, r.right + 6) + 'px';
    m.style.top = Math.min(innerHeight - m.offsetHeight - 8, Math.max(8, r.top)) + 'px';
    m.addEventListener('click', (e) => {
      const b = e.target.closest('.om-i'); if (!b) return;
      const k = b.dataset.k;
      if (k === 'on') obToggle();
      else if (k === 'next') obStep(1);
      else if (k === 'prev') obStep(-1);
      else if (k === 'size') { OB.itemH = OB.itemH >= 60 ? 44 : OB.itemH <= 46 ? 54 : 62; obSave(); obSig = ''; obBuild(); }
      else { OB[k] = k === 'all' ? OB.all === false : !OB[k]; obSave(); obSig = ''; obBuild(); }
      schedule(40);
      m.remove();
    });
    setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('pointerdown', off, true); } }, true), 0);
  }
  function obBuild() {
    obButton();
    const host = OB.on ? obFindHost() : null;
    if (!OB.on || !host) {
      if (obEl) { obEl.remove(); obEl = null; }
      if (obHost) { obHost.removeAttribute('data-c33-host'); obHost = null; }
      obCss(); return;
    }
    if (obHost !== host) { if (obHost) obHost.removeAttribute('data-c33-host'); obHost = host; }
    if (!host.hasAttribute('data-c33-host')) host.setAttribute('data-c33-host', '1');
    const gs = obGroups();
    const sig = gs.map((g) => g.gid + g.label + g.cnt + g.mask.slice(0, 40) + g.txt).join('|') + OB.sel + OB.itemH + OB.pin;
    if (!obEl) {
      obEl = document.createElement('div'); obEl.id = 'c33-orbit';
      obEl.innerHTML = '<div class="ob-wheel"></div><div class="ob-ft">'
        + '<button data-a="up" title="前の大分類（⌃⌥↑）"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4-4 4 4"/></svg></button>'
        + '<button data-a="down" title="次の大分類（⌃⌥↓）"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg></button>'
        + '<button data-a="menu" title="輪の設定"><svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg></button></div>';
      const wheel = obEl.querySelector('.ob-wheel');
      wheel.addEventListener('wheel', (e) => { e.preventDefault(); obTarget += e.deltaY / OB.itemH * 0.55; obAnim(); clearTimeout(obSnapT); obSnapT = setTimeout(() => { obTarget = Math.round(obTarget); obAnim(); }, 170); }, { passive: false });
      obEl.querySelector('[data-a="up"]').onclick = (e) => { e.stopPropagation(); obStep(-1); };
      obEl.querySelector('[data-a="down"]').onclick = (e) => { e.stopPropagation(); obStep(1); };
      obEl.querySelector('[data-a="menu"]').onclick = (e) => { e.stopPropagation(); obMenu(e.currentTarget); };
      obEl.addEventListener('contextmenu', (e) => { e.preventDefault(); obMenu(obEl); });
      /* 乗せて少し待つと広がって名前が出る（一覧の上に重ねるだけ・一覧は動かさない） */
      obEl.addEventListener('pointerenter', () => { clearTimeout(obExpT); obExpT = setTimeout(() => obEl && obEl.classList.add('exp'), 260); });
      obEl.addEventListener('pointerleave', () => { clearTimeout(obExpT); obEl && obEl.classList.remove('exp'); });
      obSig = '';
    }
    if (obEl.parentElement !== host || host.firstElementChild !== obEl) host.insertBefore(obEl, host.firstChild);
    const pinWas = document.documentElement.hasAttribute('data-c33-orbit-pin');
    obCss();
    obEl.classList.toggle('pin', document.documentElement.hasAttribute('data-c33-orbit-pin'));
    if (pinWas !== document.documentElement.hasAttribute('data-c33-orbit-pin')) schedule(40);
    if (sig === obSig) return;
    obSig = sig;
    const wheel = obEl.querySelector('.ob-wheel');
    if (!gs.length) { wheel.innerHTML = '<div class="ob-empty">¹⁶ の<br>グループが<br>まだ<br>ありません</div>'; return; }
    if (!OB.sel || !gs.some((g) => g.gid === OB.sel)) { OB.sel = gs[0].gid; obSave(); obCss(); }
    wheel.innerHTML = gs.map((g, i) => '<div class="ob-it" data-i="' + i + '" data-g="' + g.gid.replace(/"/g, '') + '" title="' + g.label.replace(/"/g, '&quot;') + (g.cnt ? '（' + g.cnt + '）' : '') + '"><span class="ob-ic"></span><span class="ob-lb"></span><span class="ob-ct"></span></div>').join('');
    wheel.querySelectorAll('.ob-it').forEach((it, i) => {
      const g = gs[i];
      const ic = it.querySelector('.ob-ic');
      if (g.txt) ic.textContent = g.txt;
      else if (g.mask && g.mask !== 'none') { ic.style.webkitMaskImage = g.mask; ic.style.maskImage = g.mask; ic.style.webkitMaskSize = ic.style.maskSize = '20px 20px'; ic.style.webkitMaskRepeat = ic.style.maskRepeat = 'no-repeat'; ic.style.webkitMaskPosition = ic.style.maskPosition = 'center'; ic.style.background = g.tint && !/rgba\(0, 0, 0, 0\)|transparent/.test(g.tint) ? g.tint : 'currentColor'; }
      else if (g.bgi && g.bgi !== 'none') { ic.style.background = g.bgi + ' center / 20px 20px no-repeat'; }
      if (g.tint && !/rgba\(0, 0, 0, 0\)|transparent/.test(g.tint)) it.style.setProperty('--ob-tint', g.tint);
      it.querySelector('.ob-lb').textContent = g.label;
      it.querySelector('.ob-ct').textContent = g.cnt && g.cnt !== '0' ? g.cnt : '';
      it.classList.toggle('empty', g.cnt === '0');
      it.onclick = (e) => { e.stopPropagation(); obSelect(g.gid); };
    });
    const si = gs.findIndex((g) => g.gid === OB.sel);
    if (!obEl.__init) { obOff = obTarget = Math.max(0, si); obEl.__init = 1; }
    obPaint();
  }
  function obPaint() {
    if (!obEl) return;
    const its = [...obEl.querySelectorAll('.ob-it')];
    const N = its.length; if (!N) return;
    const H = OB.itemH;
    its.forEach((it, i) => {
      let d = obMod(i - obOff, N);   // 0 = 一番上
      if (d > N - 0.6) d -= N;        // 上へ抜けていく途中
      const depth = Math.min(Math.abs(d), 6);
      const y = 6 + d * H;
      const sc = 1 - depth * 0.022, op = d < 0 ? Math.max(0, 1 + d * 1.6) : Math.max(0.3, 1 - depth * 0.09);
      const rot = d < 0 ? d * 42 : 0;
      it.style.transform = 'translateY(' + y.toFixed(1) + 'px) rotateX(' + (-rot).toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')';
      it.style.opacity = op.toFixed(3);
      it.style.zIndex = String(100 - Math.round(depth * 10));
      it.classList.toggle('top', Math.abs(d) < 0.5);
      it.classList.toggle('sel', it.dataset.g === OB.sel);
    });
  }
  function obAnim() {
    if (obRaf) return;
    const step = () => {
      const diff = obTarget - obOff;
      if (Math.abs(diff) < 0.002) { obOff = obTarget; obRaf = 0; obPaint(); return; }
      obOff += diff * 0.2;
      obPaint();
      obRaf = requestAnimationFrame(step);
    };
    obRaf = requestAnimationFrame(step);
  }
  /* 選んだ大分類を一番上へ（近い向きに回る）＋ サイドバーにはその中身だけ */
  function obSelect(gid) {
    const its = obEl ? [...obEl.querySelectorAll('.ob-it')] : [];
    const N = its.length;
    const i = its.findIndex((x) => x.dataset.g === gid);
    const changed = OB.sel !== gid;
    OB.sel = gid; obSave(); obCss();
    if (changed) { obResetMv(); setTimeout(() => schedule(0), 300); }
    if (i >= 0 && N) { const cur = obMod(Math.round(obTarget), N); let delta = i - cur; if (delta > N / 2) delta -= N; if (delta < -N / 2) delta += N; obTarget = Math.round(obTarget) + delta; obAnim(); }
    /* ¹⁶ で閉じていたら開く */
    if (gid !== ALL) {
      const head = document.querySelector('#c16-root .c16-sec[data-c16-g="' + CSS.escape(gid) + '"] .c16-head');
      if (head && head.getAttribute('aria-expanded') === 'false' && window.__c16 && window.__c16.toggle) window.__c16.toggle(gid);
    }
    const sc = obHost && obHost.querySelector('.notion-scroller');
    if (sc) sc.scrollTop = 0;
    obPaint();
    schedule(30);
  }
  function obStep(k) {
    const its = obEl ? [...obEl.querySelectorAll('.ob-it')] : [];
    if (!its.length) return;
    const i = its.findIndex((x) => x.dataset.g === OB.sel);
    obSelect(its[obMod(i + k, its.length)].dataset.g);
  }
  /* 輪の入切・大分類の切り替えの時は、前の状態で測った寄せ（margin）を一度すべて消して、測り直す（解除後に崩れたままにならない） */
  function obResetMv() {
    document.querySelectorAll('[data-c33-mv]').forEach((m) => { m.style.removeProperty('margin-inline-start'); m.removeAttribute('data-c33-mv'); MV.delete(m); });
    document.documentElement.style.removeProperty('--c33-rail-fix');
  }
  /* 被りの自己点検: 輪の右端より左に、一覧のアイコン・文字が潜っていたら、その分だけ一覧を右へ（最大 120px） */
  let obFixT = 0;
  function obFixSoon() { clearTimeout(obFixT); obFixT = setTimeout(obFix, 60); }
  function obFix() {
    const de = document.documentElement;
    if (!OB.on || !obEl || !obEl.isConnected || !obHost) { if (de.style.getPropertyValue('--c33-rail-fix')) de.style.removeProperty('--c33-rail-fix'); return; }
    const railRight = obEl.getBoundingClientRect().left + (de.hasAttribute('data-c33-orbit-pin') ? RAIL_X : RAIL_W);
    let min = Infinity;
    for (const ch of obHost.children) {
      if (ch === obEl) continue;
      for (const e of ch.querySelectorAll('.notion-record-icon, .c16-ico, .c16-lbl, svg, img')) {
        if (e.closest('#c33-orbit')) continue;
        const r = e.getBoundingClientRect();
        if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) continue;
        if (r.left < min) min = r.left;
      }
    }
    if (!isFinite(min)) return;
    const cur = parseFloat(de.style.getPropertyValue('--c33-rail-fix')) || 0;
    const want = Math.max(0, Math.min(120, cur + (railRight + 8 - min)));
    if (Math.abs(want - cur) >= 1 && (min < railRight + 6 || cur > 0)) { de.style.setProperty('--c33-rail-fix', want.toFixed(0) + 'px'); ST.railFix = want; }
  }
  function obToggle(v) {
    OB.on = v == null ? !OB.on : !!v; obSave(); obSig = ''; obResetMv(); obBuild(); schedule(30); setTimeout(() => schedule(0), 400);
    if (!OB.on) obToast('輪をしまいました。サイドバーの上の段の ◎（Orbit）を押すと、いつでも戻せます（⌃⌥O でも）。');
  }
  window.addEventListener('c16-open', (e) => { if (!OB.on || !e.detail) return; e.preventDefault(); obSelect(e.detail.gid); });
  window.addEventListener('c16-side', (e) => { if (!e.detail) return; if (!OB.on) obToggle(true); setTimeout(() => obSelect(e.detail.gid), 60); });
  window.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey && e.altKey) || e.metaKey) return;
    if (e.code === 'KeyO') { e.preventDefault(); obToggle(); }
    else if (OB.on && e.code === 'ArrowUp') { e.preventDefault(); obStep(-1); }
    else if (OB.on && e.code === 'ArrowDown') { e.preventDefault(); obStep(1); }
  }, true);
  /* 他の柱（²⁶ Atelier のメニュー・³⁷・³⁸ の上の段）から呼べるように */
  document.addEventListener('cordi:run', (e) => {
    const id = e.detail && e.detail.id;
    if (id === 'c33.orbit') obToggle();
    else if (id === 'c33.orbit.menu') { const b = document.getElementById('c33-orbit-btn'); if (b) obMenu(b); }
  });
  /* サイドバーが作り直されたら、すぐ（描画の前に）置き直す */
  const obMo = new MutationObserver(() => {
    if (!P.on) return;
    const ok = !OB.on || (obEl && obEl.isConnected && obHost && obHost.isConnected && obHost.hasAttribute('data-c33-host') && obEl.parentElement === obHost);
    if (!ok || !document.getElementById('c33-orbit-btn')) obBuild();
  });
  obMo.observe(document.documentElement, { childList: true, subtree: true });
  setInterval(() => { if (P.on) obBuild(); }, 1200);

  window.__c33 = {
    version: VERSION,
    status: () => Object.assign({ prefs: Object.assign({}, P), orbit: Object.assign({}, OB), knownDb: Object.keys(KNOWN_DB).length, viewTypes: VIEWTYPES.size }, ST),
    orbit: (o) => { if (o === true || o === false) obToggle(o); else if (o && typeof o === 'object') { Object.assign(OB, o); obSave(); obSig = ''; obBuild(); } return Object.assign({}, OB); },
    select: (gid) => obSelect(gid),
    set(o) { Object.assign(P, o || {}); saveP(); scan(); return Object.assign({}, P); },
    forgetDb() { KNOWN_DB = {}; saveDb(); scan(); return 'ok'; },
    off() {
      P.on = false; saveP(); mo.disconnect();
      document.documentElement.removeAttribute('data-c33');
      document.querySelectorAll('[data-c33-mv]').forEach((el) => { el.style.removeProperty('margin-inline-start'); el.removeAttribute('data-c33-mv'); });
      document.querySelectorAll('[data-c33-kind],[data-c33-team],[data-c33-vslot]').forEach((el) => { ['data-c33-kind', 'data-c33-team', 'data-c33-vslot', 'data-c33-vt', 'data-c33-lvl'].forEach((a) => el.removeAttribute(a)); ['--c33-pad', '--c33-guide', '--c33-tint'].forEach((v) => el.style.removeProperty(v)); });
      const s = document.getElementById('c33-css'); if (s) s.remove();
      return 'stopped（__c33.set({ on: true }) と再読み込みで戻ります）';
    }
  };
})();
