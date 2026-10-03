// ==UserScript==
// @name         « No »　¹⁶ _ Sidebar Workspace Grouper
// @namespace    https://cordivestium.local/sidebar-workspace-grouper
// @version      15.9.0
// @description  v15.9.0: チームスペース・ページの名前を、アイコン（notranslate が付いている）と取り違えないように。v15.8.0: ³³ Sidebar Constellation の段々が動いている間は、チームスペースと行の字下げの調整を ³³ に任せる（両方で測って取り合い、どちらも効かなかった）。v15.7.0: ★見出しの灰色の箱と下線を出さない（文字のクリックで編集はそのまま）。v15.6.0: ①紐づけたのに Unsorted に行く件を修正（チームスペースを名前の文字列だけで覚えていたため、読み取った名前が一瞬でも違うと「未知」として Unsorted に保存されていた／読み込み時に見出し名・旧ページ名と同じ名前を捨てていた → ID があれば ID で覚える・名前の揺れを吸収・未知のものは Unsorted に「表示」するだけで保存しない） ②★見出しの文字をクリックすると、題名とアイコン（²⁹ Icon Library・絵文字・SVG／画像・色）を編集できる。アイコン・余白をクリックすると従来どおり開閉 ③グループの追加・削除。v15.5.0: 読み込み後の描き直しを見せない — ①チームスペースが増えた・サイドバーが作り直された瞬間（描画前）に同期で並べる（旧: 次のタイマー／最長2秒の見回り待ちで、Notion の素の並びが一瞬見えていた） ②字下げの実測値を保存し、起動直後から同じ値で描く ③サイドバーが作り直された時だけ、並べ終わって字下げが整うまで一覧を透明にし、短いフェードで出す（初回は 16c の幕に任せる）。★見出し ▲チームスペース ■アイテム の3段。Notion の要素は動かさず、印と order と実測値だけを書く軽量版（Unsorted 追加版）
// @match        https://app.notion.com/*
// @match        https://www.notion.com/*
// @match        https://www.notion.so/*
// @match        https://notion.so/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/* =============================================================================
   v15.6.0（2026-10-03）— 紐づけが Unsorted に戻る件の修正＋見出しの編集
   -----------------------------------------------------------------------------
   ・原因（Unsorted に行く）:
     ① チームスペースを「ボタンの文字列」で覚えていた。起動直後の描きかけ・ホバー時の部品・
        改名などで文字列が少しでも違うと「未知」になり、DEFAULT_GID（Unsorted）へ push して保存していた。
        保存した後は、正しい名前に戻っても Unsorted 側の記録が残り、順番によってはそちらが勝つ。
     ② load() が「グループの見出し名と同じ名前」「旧版の pages に載っている名前」を毎回捨てていた。
        同じ名前のページ・チームスペースがあると、紐づけが読み込みのたびに消えていた。
   ・直し:
     ① チームスペースの ID（属性・リンク・アイコンの URL から読めた時）で覚える。名前の記録は ID へ自動で移す。
     ② 名前で覚える時も、空白・見えない文字・「Add new」などを落として比べ、近い名前（前方一致）の記録を引き継ぐ。
     ③ 未知のチームスペースは Unsorted に「表示」するだけで保存しない（手で移した時だけ保存）。
     ④ load() の名前の切り捨てをやめた（使われていない古い記録は単に当たらないだけで害がない）。
   ・★見出しの文字をクリック → 題名とアイコンの編集パネル（²⁹ Icon Library から／絵文字・文字／SVG・画像 URL／色）。
     アイコン・余白・件数のクリックは従来どおり開閉。⌥クリックのメニューと編集パネルからグループを追加・削除。
   ・__c16.rename(gid, 名前) ／ __c16.icon(gid, { icon, mode, tint }) ／ __c16.addGroup(名前) ／ __c16.removeGroup(gid)
   =============================================================================
   v15.5.0（2026-09-30）— 読み込み後の描き直しを見せない
   -----------------------------------------------------------------------------
   ・これまで: 一覧の中にチームスペースが足された時は setTimeout(0) の後で並べていた（描画の後）。
     サイドバーそのものが作り直された時（フローティング表示・開閉など）は、古い一覧だけを見張っていたので
     気づくのが 2秒ごとの見回り頼み → その間 Notion の素の並び・字下げが見えていた。
   ・v15.5.0:
     ① 一覧の見張り: チームスペースの増減は、その場（MutationObserver のコールバック＝描画前）で並べる
     ② ページ全体の見張り: 一覧が外れた／まだ無い時だけ、チームスペースが足されたらその場で並べる
        （一覧が健在な間は何もしないので軽い）
     ③ 字下げの実測値（見出し・チームスペース・アイテム）を localStorage に保存し、起動直後と
        作り直し直後から同じ値で描く。測り直しは差を詰めるだけ
     ④ サイドバーが作り直された時（初回以外）は html[data-c16-veil] で一覧を透明にし、
        並べ終わって字下げが整ったら（最長 VEIL_MAX_MS）フェードで出す。CSS はこのスクリプトが入れる
   =============================================================================
   v15.4.0（2026-09-27）— ユーザー要望による改修
   -----------------------------------------------------------------------------
   ・未分類のチームスペースを受け止める専用のグループ「Unsorted」を追加（id: g0）。
   ・未知のチームスペースが見つかった場合のデフォルトの受け皿（DEFAULT_GID）を
     g1（Ariadnenodus）から g0（Unsorted）に変更。
   =============================================================================
*/

(() => {
  'use strict';
  if (window.top !== window.self) return;

  const VERSION = '15.9.0';
  const TAG = '[¹⁶ v' + VERSION + ']';

  if (window.__c16 && window.__c16.version) {
    console.warn(TAG + ' 旧版 ' + window.__c16.version + ' が動いています。ScriptCat で旧版を無効にして再読み込みしてください。');
    return;
  }
  try {
    if (localStorage.getItem('c16.offCleared') !== VERSION) {
      localStorage.removeItem('c16:off');
      localStorage.removeItem('c16:pause');
      localStorage.setItem('c16.offCleared', VERSION);
    }
  } catch (e) {}

  /* ───── 席（この順が既定の並び。id は既存の保存と互換） ───── */
  const GROUPS = [
    { id: 'g1',  label: 'Ariadnenodus' }, { id: 'g2',  label: 'Hermesagitta' },
    { id: 'g3',  label: 'Athenasophia' }, { id: 'g4',  label: 'Orphelyrecho' },
    { id: 'g5',  label: 'Vulcanfornax' }, { id: 'g6',  label: 'Hypnosoneira' },
    { id: 'g7',  label: 'Asclepiophis' }, { id: 'g8',  label: 'Hermescarina' },
    { id: 'g9',  label: 'Hestiacaelia' }, { id: 'g10', label: 'Cliochronios' },
    { id: 'g11', label: 'Elpisphoenix' }, { id: 'g13', label: 'Plutusmoneta' },
    { id: 'g14', label: 'Caliocalamus' }, { id: 'g15', label: 'Daedalonorma' },
    { id: 'g16', label: 'Zephyrvolans' }, { id: 'g17', label: 'Demetermensa' },
    { id: 'g18', label: 'Clothopeplos' }, { id: 'g12', label: 'Atlasmetrica' },
    { id: 'g0',  label: 'Unsorted' } // 追加: 未分類用の席
  ];
  const GIDS = GROUPS.map(g => g.id);
  const LABEL = {}; GROUPS.forEach(g => { LABEL[g.id] = g.label; });
  const DEFAULT_GID = 'g0'; // 未知のものは強制的に g0 (Unsorted) に入れる
  const STORE_KEY = 'c16.v2.state';
  const PLAIN_KEY = 'c16.plainDrag';
  const SEL_TEAM = '.notion-outliner-team-container';
  const SEL_TEAM_BTN = '.notion-outliner-team[role="button"]';
  const SEL_PAGE = '[data-inp-target="sidebar-page-item"]';
  const CAL_STYLE_ID = 'c16-cal-css';
  const CAL_KEY = 'c16.cal.v1';             // v15.5: 字下げの保存
  const VEIL_STYLE_ID = 'c16-veil-css';     // v15.5: 作り直し時の幕
  const VEIL_MAX_MS = 500;
  const VEIL_IN_MS = 160;
  const PAD_RE = /padding-inline(?:-start)?:\s*([\d.]+)px|padding-left:\s*([\d.]+)px/;
  const DRAG_PX = 5;
  const NEWSPACE = true;
  const ICON = 'data:image/svg+xml,' + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='black'><path fill-rule='evenodd' d='" +
    'M9.674 2.075a.75.75 0 0 1 .652 0l7.25 3.5A.75.75 0 0 1 17 6.957V16.5h.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H3V6.957a.75.75 0 0 1-.576-1.382z' +
    "'/></svg>");

  /* v15.2: チームスペース行の普通のドラッグを ¹⁶ が引き受けるか（既定 on） */
  let PLAIN = true;
  try { PLAIN = localStorage.getItem(PLAIN_KEY) !== '0'; } catch (e) {}

  /* ───── 保存（v2 形式をそのまま読み書き） ───── */
  const S = { order: {}, collapsed: {}, gorder: GIDS.slice(), porder: {}, meta: {}, custom: [], alias: {} };
  GIDS.forEach(g => { S.order[g] = []; });
  let rawSaved = {};
  /* v15.6: 追加したグループを席に足す */
  function addSeat(id, label) {
    if (GIDS.includes(id)) return;
    GROUPS.push({ id, label }); GIDS.push(id); LABEL[id] = label;
    if (!S.order[id]) S.order[id] = [];
  }

  function load() {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) {}
    if (!o || typeof o !== 'object') return;
    rawSaved = o;
    /* v15.6: 追加したグループ・見出しの編集（題名・アイコン）・ID と名前の対応 */
    if (Array.isArray(o.custom)) o.custom.forEach(c => { if (c && typeof c.id === 'string' && /^c\d+$/.test(c.id)) { S.custom.push({ id: c.id, label: String(c.label || c.id) }); addSeat(c.id, String(c.label || c.id)); } });
    if (o.meta && typeof o.meta === 'object') S.meta = Object.assign({}, o.meta);
    if (o.alias && typeof o.alias === 'object') S.alias = Object.assign({}, o.alias);
    GIDS.forEach(g => { const m = S.meta[g]; if (m && typeof m.label === 'string' && m.label.trim()) LABEL[g] = m.label.trim(); });
    const seen = new Set();
    const take = k => typeof k === 'string' && k && !seen.has(k) && (seen.add(k), true);
    if (o.order && typeof o.order === 'object') {
      GIDS.forEach(g => { S.order[g] = (Array.isArray(o.order[g]) ? o.order[g] : []).filter(take); });
      (Array.isArray(o.order.__unassigned__) ? o.order.__unassigned__ : []).forEach(k => { if (take(k)) S.order[DEFAULT_GID].push(k); });
    }
    /* v15.6: 旧版はここで「見出し名・旧 pages と同じ名前」を捨てていた（同名のチームスペースの紐づけが毎回消える原因）。
       使われていない記録は当たらないだけなので、捨てない */
    if (o.collapsed && typeof o.collapsed === 'object') S.collapsed = Object.assign({}, o.collapsed);
    if (Array.isArray(o.gorder)) {
      const g2 = o.gorder.filter(id => GIDS.includes(id));
      GIDS.forEach(id => { if (!g2.includes(id)) g2.push(id); });
      S.gorder = Array.from(new Set(g2));
    }
    if (o.porder && typeof o.porder === 'object') S.porder = Object.assign({}, o.porder);
  }
  let saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(flush, 250); }
  function flush() {
    clearTimeout(saveT); saveT = 0;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(Object.assign({}, rawSaved, {
        v: 2, order: S.order, collapsed: S.collapsed, gorder: S.gorder, porder: S.porder,
        meta: S.meta, custom: S.custom, alias: S.alias
      })));
    } catch (e) {}
  }

  /* ───── 小道具 ───── */
  const setAttr = (el, k, v) => { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); };
  const setOrd = (el, n) => { if (!el) return; const v = String(n); if (el.style.order !== v) el.style.order = v; };
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const r1 = v => Math.round(v * 10) / 10;
  const r2 = v => Math.round(v * 100) / 100;
  const now = () => performance.now();
  let lastError = null, lastCal = null, offFlag = false, lastOverlap = null;

  const P = { apply: [0, 0], pages: [0, 0], cal: [0, 0], mo: [0, 0] };
  const tally = (k, t0) => { const p = P[k]; p[0]++; p[1] += now() - t0; };

  function sidebarScope() {
    return document.querySelector('nav.notion-sidebar-container, .notion-sidebar-container, .notion-sidebar') || document.body;
  }
  function teamBtn(t) { return t.querySelector(SEL_TEAM_BTN) || t.querySelector('[role="button"]'); }
  /* v15.6: 名前の揺れ（見えない文字・ホバーで出る部品の文字）を落とす */
  const JUNK_RE = /(^|\s)(Add new|Add a page|More options|More|Add page|新規追加|ページを追加|その他)(?=\s|$)/g;
  function teamName(t) {
    const b = teamBtn(t);
    let raw = '';
    if (b) {
      const lbl = b.querySelector('.notranslate:not(.notion-record-icon):not(.notion-record-icon *)');   // v15.9: アイコンにも notranslate が付いている
      raw = lbl && norm(lbl.textContent) ? lbl.textContent : b.textContent;
    } else raw = t.textContent;
    return norm(String(raw).replace(/[\u200b-\u200f\u2060\ufeff]/g, '')).replace(JUNK_RE, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
  }
  const squash = s => String(s || '').toLowerCase().replace(/[\s\u200b-\u200f\ufeff·•….\-_:|()（）［］\[\]]/g, '');
  /* v15.6: チームスペースの ID（読めた時だけ）。ページの行は見ない（中のページの ID を拾わない） */
  const UUID_RE = /[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i;
  function teamIdOf(t) {
    const b = teamBtn(t);
    const els = [t];
    if (b) { els.push(b); b.querySelectorAll('*').forEach(el => { if (!el.closest(SEL_PAGE)) els.push(el); }); }
    for (const el of els) {
      for (const a of el.attributes) {
        const n = a.name;
        if (n === 'style' || n === 'class' || n.startsWith('data-c16')) continue;
        if ((n === 'src' || n === 'href' || n === 'srcset') && !/team/i.test(a.value)) continue;
        if (!/(team|space|id|href|src)/i.test(n)) continue;
        const m = UUID_RE.exec(a.value);
        if (m) return m[0].replace(/-/g, '').toLowerCase();
      }
    }
    return '';
  }
  const shown = k => (k && k.startsWith('id:') ? (S.alias[k] || k.slice(3, 11)) : k);
  function pageName(row) { return norm((row.querySelector('.notranslate:not(.notion-record-icon):not(.notion-record-icon *)') || row).textContent).slice(0, 120); }
  function gidOf(key) { for (const g of GIDS) if (S.order[g].includes(key)) return g; return null; }

  /* v15.1: 入れ物に固定の高さ（style の height）があり、スクロール枠でないなら外す印 */
  function checkFixedHeight(el) {
    if (!el) return;
    const fixed = !!el.style.height && getComputedStyle(el).overflowY === 'visible';
    if (fixed) setAttr(el, 'data-c16-autoh', '1');
    else if (el.hasAttribute('data-c16-autoh')) el.removeAttribute('data-c16-autoh');
  }
  /* v15.1: arm〜チームスペースの間の枠に印（CSS が通常フローへ戻す） */
  function markChain(a, t) {
    for (let el = t.parentElement; el && el !== a; el = el.parentElement) setAttr(el, 'data-c16-chain', '1');
  }

  /* ───── 構造の把握 ───── */
  const L = { list: null, root: null, teams: [], byKey: new Map(), shared: [], temp: [] };
  /* v15.6: そのグループに並べる鍵（Unsorted には保存していない未知のものも足す） */
  const keysOf = gid => (gid === DEFAULT_GID && L.temp.length ? S.order[gid].concat(L.temp) : S.order[gid]);
  const HEAD = {};
  let mo = null, ro = null, roW = 0, pendingDragApply = false;
  const dirty = new Set();
  let doneTeams = new WeakSet(), dirtyAll = false;

  function resolve() {
    const scope = sidebarScope();
    const teams = [...scope.querySelectorAll(SEL_TEAM)]
      .filter(t => !t.closest('[role="dialog"],[data-popup-origin="true"],#c16-menu'));
    if (!teams.length) return null;
    let list = L.list;
    if (!list || !list.isConnected || !teams.every(t => list.contains(t))) {
      list = teams[0].parentElement;
      while (list && !teams.every(t => list.contains(t))) list = list.parentElement;
      if (!list) return null;
      if (L.list && L.list !== list) {
        ['data-c16-list', 'data-c16-cal', 'data-c16-autoh'].forEach(a => L.list.removeAttribute(a));
      }
      L.list = list;
      observeList(list);
      watchWidth(list);
    }
    L.teams = teams;
    return L;
  }
  function armOf(t, list) {
    let a = t;
    while (a.parentElement && a.parentElement !== list) a = a.parentElement;
    return a.parentElement === list ? a : null;
  }
  const hasSel = (nd, sel) => nd.matches(sel) || !!nd.querySelector(sel);

  function observeList(list) {
    if (mo) mo.disconnect();
    mo = new MutationObserver(onMutations);
    mo.observe(list, { childList: true, subtree: true });
  }
  function onMutations(recs) {
    const t0 = now();
    let structural = false, touched = null;
    for (const r of recs) {
      const tg = r.target;
      if (L.root && (tg === L.root || L.root.contains(tg))) continue;
      for (const nd of r.removedNodes) {
        if (nd instanceof Element && hasSel(nd, SEL_TEAM)) { structural = true; break; }
      }
      if (structural) break;
      for (const nd of r.addedNodes) {
        if (!(nd instanceof Element)) continue;
        if (hasSel(nd, SEL_TEAM)) { structural = true; break; }
        if (hasSel(nd, SEL_PAGE)) {
          const t = tg instanceof Element ? tg.closest(SEL_TEAM) : null;
          if (t && t.hasAttribute('data-c16-k')) (touched || (touched = new Set())).add(t);
        }
      }
      if (structural) break;
    }
    if (structural) {
      /* v15.5: 描画前にその場で並べる（旧: schedule(0) ＝描画の後） */
      if (drag) pendingDragApply = true; else { startGuard(); run(); if (settledDone) scheduleCalib(80); }
    } else if (touched) {
      if (drag) { touched.forEach(t => dirty.add(t)); pendingDragApply = true; }
      else {
        touched.forEach(t => {
          try { processPages(t, t.getAttribute('data-c16-k')); }
          catch (e) { lastError = String((e && e.stack) || e); }
        });
        if (calNeedPage) scheduleCalib(120);
      }
    }
    tally('mo', t0);
  }
  function watchWidth(list) {
    if (typeof ResizeObserver !== 'function') return;
    if (ro) ro.disconnect();
    roW = 0;
    ro = new ResizeObserver(ents => {
      const w = Math.round(ents[0].contentRect.width);
      if (roW && w !== roW) onResize();
      roW = w;
    });
    ro.observe(list);
  }

  function headHTML(gid) {
    return '<div class="c16-sec" data-c16-sec="' + gid + '" data-c16-g="' + gid + '">' +
      '<div class="c16-head" role="button" tabindex="0" aria-expanded="true">' +
      '<span class="c16-ico"></span><span class="c16-lbl" title="クリックで題名とアイコンを編集">' + escH(LABEL[gid]) + '</span><span class="c16-cnt"></span></div></div>';
  }
  const escH = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function ensureRoot(list) {
    if (!L.root) {
      const root = document.createElement('div');
      root.id = 'c16-root';
      root.setAttribute('data-c16-v', VERSION);
      root.innerHTML = GIDS.map(headHTML).join('');
      root.querySelectorAll('.c16-sec').forEach(sec => {
        HEAD[sec.getAttribute('data-c16-g')] = sec;
        sec.querySelector('.c16-ico').style.setProperty('--c16-ico-fallback', 'url("' + ICON + '")');
      });
      L.root = root;
    }
    /* v15.6: 後から足したグループの見出し */
    for (const gid of GIDS) {
      if (HEAD[gid] && L.root.contains(HEAD[gid])) continue;
      const tmp = document.createElement('div');
      tmp.innerHTML = headHTML(gid);
      const sec = tmp.firstElementChild;
      sec.querySelector('.c16-ico').style.setProperty('--c16-ico-fallback', 'url("' + ICON + '")');
      L.root.appendChild(sec);
      HEAD[gid] = sec;
    }
    applyMetaDom();
    if (L.root.parentElement !== list) list.appendChild(L.root);
    return L.root;
  }

  /* ───── アイテム（2段目の中身） ───── */
  function pageUnits(t) {
    const out = [], seen = new Set();
    for (const row of t.querySelectorAll(SEL_PAGE)) {
      let unit = row.closest('[role="treeitem"]');
      if (!unit || !t.contains(unit)) unit = row;
      if (seen.has(unit)) continue;
      const up = unit.parentElement && unit.parentElement.closest('[role="treeitem"]');
      if (up && t.contains(up)) continue;
      seen.add(unit);
      out.push({ unit, row, name: pageName(row) });
    }
    return out;
  }
  function tagRow(row) {
    setAttr(row, 'data-c16-tier', 'page');
    const m = PAD_RE.exec(row.getAttribute('style') || '');
    if (m) {
      const v = m[1] || m[2];
      if (row.getAttribute('data-c16-pb') !== v) { row.style.setProperty('--c16-pb', v + 'px'); row.setAttribute('data-c16-pb', v); }
    }
  }
  function orderPages(t, teamKey) {
    const ord = S.porder[teamKey];
    if (!Array.isArray(ord) || !ord.length) {
      for (const par of t.querySelectorAll('[data-c16-plist]')) {
        par.removeAttribute('data-c16-plist');
        par.removeAttribute('data-c16-autoh');
        for (const c of par.children) { c.style.removeProperty('order'); c.removeAttribute('data-c16-unit'); }
      }
      return;
    }
    const us = pageUnits(t);
    const byUnit = new Map(us.map(u => [u.unit, u]));
    const parents = new Set(us.map(u => u.unit.parentElement).filter(Boolean));
    parents.forEach(par => {
      setAttr(par, 'data-c16-plist', '1');
      checkFixedHeight(par);
      let seenPage = false, i = 0;
      for (const c of par.children) {
        const u = byUnit.get(c);
        if (u) {
          seenPage = true;
          setAttr(c, 'data-c16-unit', '1');
          const ix = ord.indexOf(u.name);
          setOrd(c, ix >= 0 ? ix + 1 : 500 + i);
        } else setOrd(c, seenPage ? 2000 + i : 0);
        i++;
      }
    });
  }
  function processPages(t, teamKey) {
    const t0 = now();
    const rows = t.querySelectorAll(SEL_PAGE);
    for (const row of rows) tagRow(row);
    orderPages(t, teamKey);
    doneTeams.add(t);
    tally('pages', t0);
    return rows.length;
  }

  function scrubOld(a, t) {
    [a, t, teamBtn(t)].forEach(el => {
      if (!el) return;
      ['order', 'display', 'max-height', 'overflow', 'opacity', 'padding-inline-start'].forEach(p => {
        if (el.style.getPropertyPriority(p) === 'important') el.style.removeProperty(p);
      });
      el.style.removeProperty('--c16-ord');
      el.removeAttribute('data-c16-fold'); el.removeAttribute('data-c16-hidden-by-gid');
    });
  }

  /* ───── 本体：印と順番を付けるだけ ───── */
  let firstApply = true, readyDone = false, settledDone = false, lastSig = '', lastPreSig = '', lastSharedSig = '';

  function apply(force) {
    const R = resolve();
    if (!R) return false;
    const list = R.list;
    const names = R.teams.map(teamName);
    const pre = R.teams.length + '#' + S.gorder.join(',') + '#' +
      GIDS.map(g => S.order[g].join(',')).join(';') + '#' +
      Object.keys(S.collapsed).sort().join(',') + '#' + names.join('|');
    if (!force && !dirty.size && pre === lastPreSig && L.root && L.root.isConnected && L.root.parentElement === list) return true;
    lastPreSig = pre;
    ensureRoot(list);
    setAttr(list, 'data-c16-list', '1');
    if (CAL.teamPad != null) setAttr(list, 'data-c16-cal', '1');   // v15.5: 保存値で最初のフレームから
    checkFixedHeight(list);

    const known = new Set();
    GIDS.forEach(g => S.order[g].forEach(k => known.add(k)));
    const byKey = new Map(), used = Object.create(null);
    let changed = false;
    /* v15.6: 記録の名前を別の鍵に付け替える（場所はそのまま） */
    const rekey = (from, to) => {
      if (S.porder[from] && !S.porder[to]) { S.porder[to] = S.porder[from]; delete S.porder[from]; }
      for (const g of GIDS) {
        const i = S.order[g].indexOf(from);
        if (i >= 0) { if (S.order[g].includes(to)) S.order[g].splice(i, 1); else S.order[g][i] = to; known.delete(from); known.add(to); changed = true; return true; }
      }
      return false;
    };
    const present = new Set();
    R.teams.forEach((t, i) => {
      const n = names[i] || '(無題)';
      const id = teamIdOf(t);
      let k;
      if (id) {
        k = 'id:' + id;
        if (!known.has(k) && !rekey(n, k)) {
          /* ID の読み方が変わった時: 同じ名前で覚えている、いま画面に居ない ID の記録を引き継ぐ */
          const old = [...known].find(kk => kk.startsWith('id:') && S.alias[kk] === n && !byKey.has(kk) && kk !== k);
          if (old) rekey(old, k);
        }
        if (S.alias[k] !== n) { S.alias[k] = n; changed = true; }
      } else {
        used[n] = (used[n] || 0) + 1;
        k = used[n] > 1 ? n + ' (' + used[n] + ')' : n;
      }
      setAttr(t, 'data-c16-k', k);
      setAttr(t, 'data-c16-tier', 'team');
      byKey.set(k, t);
      present.add(k);
    });
    /* v15.6: 名前の揺れの救済。未知の鍵に、いま画面に居ない近い名前の記録があれば引き継ぐ */
    for (const k of byKey.keys()) {
      if (known.has(k) || k.startsWith('id:')) continue;
      const q = squash(k);
      if (!q) continue;
      let hit = null;
      for (const kk of known) {
        if (present.has(kk) || kk.startsWith('id:')) continue;
        const qq = squash(kk);
        if (qq === q || (q.length >= 3 && qq.length >= 3 && (qq.startsWith(q) || q.startsWith(qq)))) { hit = kk; break; }
      }
      if (hit) rekey(hit, k);
    }
    L.byKey = byKey;
    /* v15.6: 未知のものは Unsorted に「表示」するだけ（保存しない） */
    L.temp = [...byKey.keys()].filter(k => !known.has(k));
    if (changed) save();

    let n = 1, sig = R.teams.length + '|';
    const seen = new Set(), shared = [];
    S.gorder.forEach((gid, gi) => {
      const sec = HEAD[gid];
      setOrd(sec, n++);
      setAttr(sec, 'data-c16-first', gi === 0 ? '1' : '0');
      const folded = !!S.collapsed[gid];
      let cnt = 0;
      for (const k of keysOf(gid)) {
        const t = byKey.get(k);
        if (!t) continue;
        const a = armOf(t, list);
        if (!a) continue;
        if (seen.has(a)) { shared.push(k); continue; }
        seen.add(a); cnt++;
        if (firstApply) scrubOld(a, t);
        setOrd(a, n++);
        setAttr(a, 'data-c16-arm', '1');
        markChain(a, t);
        setAttr(a, 'data-c16-hide', folded ? '1' : '0');
        setAttr(t, 'data-c16-g', gid);
        if (!folded && (dirtyAll || dirty.has(t) || !doneTeams.has(t))) processPages(t, k);
      }
      setAttr(sec, 'data-c16-state', folded ? 'collapsed' : 'open');
      setAttr(sec, 'data-c16-empty', cnt ? '0' : '1');
      setAttr(sec.firstElementChild, 'aria-expanded', folded ? 'false' : 'true');
      const c = sec.querySelector('.c16-cnt');
      if (c.textContent !== String(cnt)) c.textContent = String(cnt);
      sig += folded ? 'c' : 'o';
    });
    dirty.clear(); dirtyAll = false;
    L.shared = shared;
    const shSig = shared.join('|');
    if (shSig !== lastSharedSig) {
      lastSharedSig = shSig;
      if (shared.length) console.warn(TAG, '1つの行に複数のチームスペースが入っていて、個別に並べられません:', shared);
    }

    if (NEWSPACE) ensureNewSpace();
    firstApply = false;
    if (!readyDone) {
      readyDone = true;
      document.documentElement.setAttribute('data-c16-ready', '1');
      setTimeout(markSettled, 1500);
    }
    if (sig !== lastSig) { lastSig = sig; calPass = 0; scheduleCalib(80); }
    return true;
  }
  function run(force) {
    if (offFlag) return false;
    const t0 = now();
    try { return apply(force); }
    catch (e) { lastError = String((e && e.stack) || e); console.error(TAG, e); return false; }
    finally { tally('apply', t0); }
  }
  let schedT = 0, pendingHidden = false;
  function schedule(ms) {
    if (schedT || offFlag) return;
    if (drag) { pendingDragApply = true; return; }
    if (document.hidden) { pendingHidden = true; return; }
    schedT = setTimeout(() => {
      schedT = 0;
      const go = () => { if (drag) schedule(200); else run(); };
      if (ms == null && typeof window.requestIdleCallback === 'function') requestIdleCallback(go, { timeout: 500 });
      else go();
    }, ms == null ? 150 : ms);
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && pendingHidden) { pendingHidden = false; schedule(0); }
  });
  function markSettled() {
    if (settledDone) return;
    settledDone = true;
    document.documentElement.setAttribute('data-c16-settled', '1');
  }

  /* ───── v15.3: 検査（重なり＋幅・高さの潰れ）。操作の後に自動・__c16.verify() で手動 ───── */
  function verify(tag) {
    if (!L.list || !L.list.isConnected) return null;
    const listW = L.list.getBoundingClientRect().width;
    const items = [], seenEl = new Set();
    S.gorder.forEach(gid => {
      items.push({ name: '★' + LABEL[gid], el: HEAD[gid], arm: false });
      if (S.collapsed[gid]) return;
      for (const k of keysOf(gid)) {
        const t = L.byKey.get(k); if (!t) continue;
        const a = armOf(t, L.list);
        if (!a || seenEl.has(a)) continue;
        seenEl.add(a);
        items.push({ name: '▲' + shown(k), el: a, arm: true });
      }
    });
    const overlap = [], squashed = [];
    let prev = null;
    for (const it of items) {
      if (!it.el) continue;
      const r = it.el.getBoundingClientRect();
      if (it.arm && (r.height < 8 || (listW > 40 && r.width < listW * 0.6))) {
        squashed.push({ name: it.name, w: r1(r.width), h: r1(r.height), inline: (it.el.getAttribute('style') || '').slice(0, 200) });
      }
      if (!r.height) continue;
      if (prev && r.top < prev.bottom - 1) overlap.push({ upper: prev.name, lower: it.name, overlapPx: r1(prev.bottom - r.top), lowerEl: describe(it.el) });
      prev = { name: it.name, bottom: r.bottom };
    }
    lastOverlap = (overlap.length || squashed.length)
      ? { after: tag, at: new Date().toISOString(), overlap: overlap.slice(0, 6), squashed: squashed.slice(0, 6) }
      : null;
    if (lastOverlap) {
      console.warn(TAG, (overlap.length ? '重なり' + overlap.length + '件 ' : '') +
        (squashed.length ? '潰れ' + squashed.length + '件 ' : '') + 'を検出（' + tag + '）。¹⁸ が v22.3.0 か確認してください', lastOverlap);
    }
    return lastOverlap;
  }
  let verT = 0;
  function afterMove(tag) {
    clearTimeout(verT);
    verT = setTimeout(() => requestAnimationFrame(() => {
      try { verify(tag); } catch (e) { lastError = String((e && e.stack) || e); }
    }), 450);
  }

  /* ───── 字下げ：測って、専用 <style> に書く ───── */
  const CAL = { headX: 0, teamPad: null, pageD: 0 };
  let calStyle = null, calNeedPage = true;
  function writeCal() {
    const css =
      '#c16-root .c16-head{--c16-head-x:' + CAL.headX + 'px}\n' +
      (CAL.teamPad != null ? SEL_TEAM + '[data-c16-k] ' + SEL_TEAM_BTN + '{--c16-team-pad:' + CAL.teamPad + 'px}\n' : '') +
      SEL_PAGE + '[data-c16-pb]{--c16-page-d:' + CAL.pageD + 'px}';
    if (!calStyle || !calStyle.isConnected) {
      calStyle = document.getElementById(CAL_STYLE_ID) || document.createElement('style');
      calStyle.id = CAL_STYLE_ID;
      (document.head || document.documentElement).appendChild(calStyle);
    }
    if (calStyle.textContent !== css) calStyle.textContent = css;
    if (CAL.teamPad != null) setAttr(L.list, 'data-c16-cal', '1');
    /* v15.5: 保存（次回・作り直し直後から同じ値で描く） */
    try {
      const v = JSON.stringify(CAL);
      if (v !== savedCal) { localStorage.setItem(CAL_KEY, v); savedCal = v; }
    } catch (e) {}
  }
  let savedCal = '';
  function loadCal() {
    try {
      const o = JSON.parse(localStorage.getItem(CAL_KEY) || 'null');
      if (!o || typeof o !== 'object') return false;
      const ok = (v) => typeof v === 'number' && isFinite(v) && Math.abs(v) < 400;
      if (ok(o.headX)) CAL.headX = o.headX;
      if (ok(o.teamPad) && o.teamPad >= 0) CAL.teamPad = o.teamPad;
      if (ok(o.pageD)) CAL.pageD = o.pageD;
      savedCal = JSON.stringify(CAL);
      return true;
    } catch (e) { return false; }
  }

  /* ───── v15.5: 作り直し時の幕 ───── */
  let veilT = 0, veilOn = false;
  function installVeilCss() {
    if (document.getElementById(VEIL_STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = VEIL_STYLE_ID;
    st.textContent =
      'html[data-c16-veil="cut"] [data-c16-list="1"]{opacity:0 !important;transition:none !important;}\n' +
      'html[data-c16-veil="in"] [data-c16-list="1"]{opacity:1 !important;transition:opacity ' + VEIL_IN_MS + 'ms cubic-bezier(.2,0,0,1) !important;}\n' +
      '@media (prefers-reduced-motion: reduce){html[data-c16-veil] [data-c16-list="1"]{transition:none !important;}}';
    (document.head || document.documentElement).appendChild(st);
  }
  function veilCut() {
    installVeilCss();
    veilOn = true;
    document.documentElement.setAttribute('data-c16-veil', 'cut');
    clearTimeout(veilT);
    veilT = setTimeout(() => veilReveal('timeout'), VEIL_MAX_MS);
  }
  function veilReveal() {
    if (!veilOn) return;
    veilOn = false;
    clearTimeout(veilT);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const de = document.documentElement;
      if (veilOn) return;
      de.setAttribute('data-c16-veil', 'in');
      veilT = setTimeout(() => { if (!veilOn) de.removeAttribute('data-c16-veil'); }, VEIL_IN_MS + 60);
    }));
  }

  let calT = 0, calPass = 0, lastCalKey = '';
  function calKey() {
    const list = L.list; if (!list) return '';
    const h0 = HEAD[GIDS[0]];
    return list.clientWidth + 'x' + list.clientHeight + '@' + (h0 ? Math.round(h0.getBoundingClientRect().top) : '') +
      '#' + GIDS.map(g => S.collapsed[g] ? 'c' : 'o').join('');
  }
  function scheduleCalib(ms) {
    if (offFlag) return;
    clearTimeout(calT);
    calT = setTimeout(() => {
      const key = calKey();
      if (key === lastCalKey && calPass === 0 && !calNeedPage) { markSettled(); veilReveal(); return; }
      lastCalKey = key;
      if (typeof window.requestIdleCallback === 'function') requestIdleCallback(() => { if (!offFlag) calibrate(); }, { timeout: 400 });
      else calibrate();
    }, ms || 60);
  }
  function textLeft(el) {
    if (!el) return null;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let nd;
    while ((nd = w.nextNode())) {
      if (!/\S/.test(nd.nodeValue)) continue;
      const p = nd.parentElement;
      if (p && p.closest('.notion-record-icon')) continue;
      const rg = document.createRange();
      rg.selectNodeContents(nd);
      const r = rg.getBoundingClientRect();
      if (r.width) return r.left;
    }
    return null;
  }
  function iconLeft(el) {
    if (!el) return null;
    for (const nd of el.querySelectorAll('.notion-record-icon, [role="img"], img, svg')) {
      if (String(nd.getAttribute('class') || '').includes('arrowChevron') || nd.closest('[class*="arrowChevron"]')) continue;
      const r = nd.getBoundingClientRect();
      if (r.width >= 8 && r.width <= 32 && r.height >= 8) return r.left;
    }
    return null;
  }
  function calibrate() {
    const list = L.list, root = L.root;
    if (!list || !list.isConnected || !root || drag || offFlag) return;
    const t0 = now();
    const rs = getComputedStyle(document.documentElement);
    const px = (nm, d) => { const v = parseFloat(rs.getPropertyValue(nm)); return isFinite(v) ? v : d; };
    const box = px('--c16-ico-box', 26), size = px('--c16-ico-size', 24);
    const res = { at: new Date().toISOString(), pass: calPass };

    /* ★ 見出しのアイコン → 家のアイコン */
    let dHead = 0, lblL = null;
    const home = document.querySelector('[data-inp-target="sidebar-tab-home"] svg, #sidebar-tab-home svg');
    let head = null;
    for (const gid of S.gorder) { const h = HEAD[gid].firstElementChild; if (h.getBoundingClientRect().height) { head = h; break; } }
    if (head) {
      const ir = head.querySelector('.c16-ico').getBoundingClientRect();
      lblL = head.querySelector('.c16-lbl').getBoundingClientRect().left;
      if (home) {
        const hl = home.getBoundingClientRect().left;
        dHead = (hl + px('--c16-nudge-head', 0)) - (ir.left + (box - size) / 2);
        res.head = { home: r1(hl), ink: r1(ir.left + (box - size) / 2), d: r1(dHead) };
      }
      lblL += dHead;
    }

    /* ▲ チームスペースのアイコン → 見出しの文字（v15.3: 潰れた行では測らない）
       v15.8: ³³ Sidebar Constellation の段々（html[data-c33-tree]）が動いている間は ³³ に任せる（取り合うと止まらない） */
    const c33tree = document.documentElement.hasAttribute('data-c33-tree');
    let dTeam = 0, tBtn = null, newPad = null;
    const listW = list.getBoundingClientRect().width;
    for (const t of L.teams) {
      const b = teamBtn(t); if (!b) continue;
      const br = b.getBoundingClientRect();
      if (br.height && br.width > listW * 0.6) { tBtn = b; break; }
    }
    if (tBtn && lblL != null && !c33tree) {
      const il = iconLeft(tBtn);
      if (il != null) {
        const curPad = parseFloat(getComputedStyle(tBtn).paddingInlineStart) || 0;
        newPad = Math.max(0, curPad + (lblL + px('--c16-nudge-team', 0)) - il);
        dTeam = newPad - curPad;
        res.team = { icon: r1(il), target: r1(lblL), d: r1(dTeam), pad: r1(newPad) };
      }
    }

    /* ■ アイテムのアイコン → チームスペースの文字 */
    let newD = null, dPage = 0;
    for (const row of c33tree ? [] : list.querySelectorAll(SEL_PAGE + '[data-c16-pb]')) {
      if (!row.getBoundingClientRect().height) continue;
      const t = row.closest(SEL_TEAM);
      const tl = t ? textLeft(teamBtn(t)) : null;
      const il = iconLeft(row);
      if (tl == null || il == null) continue;
      dPage = (tl + dTeam + px('--c16-nudge-page', 0)) - il;
      newD = CAL.pageD + dPage;
      res.page = { icon: r1(il), target: r1(tl + dTeam), d: r1(dPage) };
      break;
    }

    if (Math.abs(dHead) > 0.3) CAL.headX = r1(CAL.headX + dHead);
    if (newPad != null && (CAL.teamPad == null || Math.abs(dTeam) > 0.3)) CAL.teamPad = r1(newPad);
    if (newD != null && Math.abs(dPage) > 0.3) CAL.pageD = r1(newD);
    calNeedPage = !res.page;
    writeCal();

    const worst = Math.max(Math.abs(dHead), Math.abs(dTeam), Math.abs(dPage));
    res.values = Object.assign({}, CAL);
    lastCal = res;
    tally('cal', t0);
    if (worst > 0.75 && calPass < 2) { calPass++; scheduleCalib(veilOn ? 60 : 220); }
    else { calPass = 0; markSettled(); veilReveal(); }
  }

  /* ───── 上段の「＋」 ───── */
  function ensureNewSpace() {
    const tab = document.querySelector('[data-inp-target="sidebar-tab-home"]');
    const bar = tab && tab.closest('[role="tablist"]');
    const row = bar && bar.parentElement;
    if (!row) return;
    let b = document.getElementById('c16-newspace');
    if (!b) {
      b = document.createElement('div');
      b.id = 'c16-newspace';
      b.className = 'c16-newspace';
      b.setAttribute('role', 'button');
      b.setAttribute('tabindex', '0');
      b.title = '新しいチームスペース';
      b.innerHTML = '<span class="c16-ns-ico"></span>';
      b.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const sc = sidebarScope();
        const m = sc.querySelector('.notion-outliner-team-header [aria-label="Open menu"]') || sc.querySelector('[aria-label="Open menu"]');
        if (m) m.click();
      });
    }
    if (b.parentElement !== row) row.appendChild(b);
  }

  /* ───── 操作 ───── */
  function toggleGroup(gid) {
    if (!LABEL[gid]) gid = GIDS.find(g => LABEL[g] === gid) || gid;
    if (!LABEL[gid]) return false;
    if (S.collapsed[gid]) delete S.collapsed[gid]; else S.collapsed[gid] = true;
    save(); run(true);
    if (!S.collapsed[gid]) afterMove('open');
    return !!S.collapsed[gid];
  }
  function moveGroup(gid, idx) {
    const a = S.gorder.slice(), from = a.indexOf(gid);
    if (from < 0) return;
    a.splice(from, 1);
    if (from < idx) idx--;
    a.splice(Math.max(0, Math.min(idx, a.length)), 0, gid);
    S.gorder = a; save(); run(true);
    afterMove('group');
  }
  function moveTeam(key, gid, before) {
    if (!key || !S.order[gid]) return;
    GIDS.forEach(g => { const i = S.order[g].indexOf(key); if (i >= 0) S.order[g].splice(i, 1); });
    const arr = S.order[gid], i = before ? arr.indexOf(before) : -1;
    if (i >= 0) arr.splice(i, 0, key); else arr.push(key);
    save(); run(true);
    afterMove('team');
  }
  function movePage(d, before) {
    const names = d.sibs.slice().sort((a, b) => a.r.top - b.r.top).map(u => u.name).filter(nm => nm !== d.name);
    const i = before ? names.indexOf(before) : -1;
    if (i >= 0) names.splice(i, 0, d.name); else names.push(d.name);
    S.porder[d.teamKey] = names;
    if (d.team) dirty.add(d.team);
    save(); run(true);
    afterMove('page');
  }

  /* ───── v15.6: 見出しの編集（題名・アイコン・色）＋グループの追加・削除 ───── */
  const META_STYLE_ID = 'c16-meta-css';
  const EDIT_STYLE_ID = 'c16-edit-css';
  const cssUrl = u => String(u).replace(/["\\\n\r]/g, c => (c === '"' ? '%22' : c === '\\' ? '%5C' : ''));
  function iconUrlOf(v) {
    v = String(v || '').trim();
    if (!v) return '';
    if (/^<svg[\s>]/i.test(v)) {
      if (!/xmlns=/.test(v)) v = v.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
      return 'data:image/svg+xml,' + encodeURIComponent(v);
    }
    if (/^(data:image\/|https?:\/\/|\/)/i.test(v)) return v;
    return '';
  }
  function writeMetaCss() {
    let css = '';
    for (const gid of GIDS) {
      const m = S.meta[gid];
      if (!m) continue;
      const sec = '#c16-root .c16-sec[data-c16-g="' + gid + '"]';
      if (m.icon && m.mode === 'mask') css += sec + '{--c16-ico:url("' + cssUrl(m.icon) + '") !important;}\n';
      if (m.icon && m.mode === 'img') css += sec + ' .c16-ico{-webkit-mask:none !important;mask:none !important;background:url("' + cssUrl(m.icon) + '") center / var(--c16-ico-size) var(--c16-ico-size) no-repeat !important;}\n';
      if (m.tint && /^#[0-9a-f]{3,8}$/i.test(m.tint)) css += sec + '{--c16-ico-tint:' + m.tint + ' !important;}\n';
    }
    let st = document.getElementById(META_STYLE_ID);
    if (!st) { st = document.createElement('style'); st.id = META_STYLE_ID; (document.head || document.documentElement).appendChild(st); }
    if (st.textContent !== css) st.textContent = css;
  }
  function applyMetaDom() {
    for (const gid of GIDS) {
      const sec = HEAD[gid];
      if (!sec) continue;
      const m = S.meta[gid] || {};
      const lbl = sec.querySelector('.c16-lbl');
      if (lbl && lbl.textContent !== LABEL[gid]) lbl.textContent = LABEL[gid];
      const ico = sec.querySelector('.c16-ico');
      if (ico) {
        if (m.mode === 'text' && m.icon) setAttr(ico, 'data-c16-txt', m.icon);
        else if (ico.hasAttribute('data-c16-txt')) ico.removeAttribute('data-c16-txt');
      }
    }
    writeMetaCss();
  }
  function installEditCss() {
    if (document.getElementById(EDIT_STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = EDIT_STYLE_ID;
    st.textContent = `
#c16-root .c16-lbl{flex:0 1 auto !important;cursor:text;text-decoration:none !important}
/* v15.7.0: ★見出しの灰色の箱（乗せた時・開いている時）と下線を出さない。文字のクリックで編集はそのまま */
#c16-root .c16-sec .c16-head:not(#c16x):not(#c16y),#c16-root .c16-sec .c16-head:not(#c16x):not(#c16y):is(:hover,:focus,:focus-visible,:active,[aria-expanded]){background:transparent !important;box-shadow:none !important;outline:none !important}
#c16-root .c16-sec:not(#c16x):not(#c16y){background:transparent !important;box-shadow:none !important}
#c16-root .c16-ico[data-c16-txt]{-webkit-mask:none !important;mask:none !important;background:none !important;display:flex;align-items:center;justify-content:center;font-size:calc(var(--c16-ico-size) * .78);line-height:1;color:var(--c16-ico-tint,currentColor)}
#c16-root .c16-ico[data-c16-txt]::before{content:attr(data-c16-txt)}
#c16-menu .c16-m-add{margin-top:4px;border-top:1px solid var(--c-borPri,rgba(55,53,47,.12)) !important;border-radius:0 0 4px 4px !important;opacity:.75}
#c16-edit{position:fixed;z-index:2147483602;width:300px;box-sizing:border-box;padding:12px;border-radius:12px;background:var(--c-bgPri,#fff);color:var(--c-texPri,#37352f);box-shadow:0 0 0 .5px rgba(15,15,15,.12),0 4px 12px rgba(15,15,15,.08),0 16px 40px rgba(15,15,15,.16);font:12px/1.45 var(--c16-head-font);display:none}
#c16-edit[data-on="1"]{display:block}
#c16-edit *{box-sizing:border-box}
#c16-edit .e-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
#c16-edit .e-prev{flex:none;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--c-bacHov,rgba(55,53,47,.06))}
#c16-edit .e-prev .c16-ico{display:block;width:26px;height:26px;background-color:var(--c16-ico-tint,var(--c-icoSec,currentColor));-webkit-mask:var(--c16-ico,var(--c16-ico-fallback)) center / 24px 24px no-repeat;mask:var(--c16-ico,var(--c16-ico-fallback)) center / 24px 24px no-repeat}
#c16-edit .e-name{flex:1;min-width:0;height:32px;padding:0 10px;border-radius:8px;border:0;outline:0;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:600 14px/1 var(--c16-head-font)}
#c16-edit .e-name:focus{box-shadow:0 0 0 2px color-mix(in srgb,var(--c16-drop-color,#2e7cd6) 55%,transparent)}
#c16-edit .e-tabs{display:flex;gap:2px;padding:2px;border-radius:8px;background:var(--c-bacHov,rgba(55,53,47,.06));margin-bottom:8px}
#c16-edit .e-tabs button{flex:1;height:24px;border:0;border-radius:6px;background:none;color:var(--c-texSec,#787774);font:500 11px/1 inherit;cursor:pointer}
#c16-edit .e-tabs button[data-on="1"]{background:var(--c-bgPri,#fff);color:inherit;box-shadow:0 1px 2px rgba(0,0,0,.1)}
#c16-edit .e-pane{min-height:150px}
#c16-edit .e-q,#c16-edit .e-txt,#c16-edit .e-url{width:100%;border:0;outline:0;border-radius:6px;padding:6px 8px;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:12px/1.4 inherit}
#c16-edit .e-url{height:96px;resize:none;font-family:ui-monospace,Menlo,monospace;font-size:11px}
#c16-edit .e-txt{font-size:20px;text-align:center;height:44px}
#c16-edit .e-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;max-height:150px;overflow:auto;margin-top:6px}
#c16-edit .e-grid button{aspect-ratio:1;border:0;border-radius:6px;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center}
#c16-edit .e-grid button:hover{background:var(--c-bacHov,rgba(55,53,47,.08))}
#c16-edit .e-grid img{width:20px;height:20px}
#c16-edit .e-mut{color:var(--c-texSec,#787774);font-size:11px;margin-top:6px}
#c16-edit .e-row{display:flex;align-items:center;gap:8px;margin-top:10px}
#c16-edit .e-row label{display:flex;align-items:center;gap:6px;color:var(--c-texSec,#787774)}
#c16-edit input[type=color]{width:26px;height:22px;padding:0;border:0;background:none;cursor:pointer}
#c16-edit .e-foot{display:flex;align-items:center;gap:6px;margin-top:12px;padding-top:10px;border-top:1px solid var(--c-borPri,rgba(55,53,47,.1))}
#c16-edit .e-foot .e-grow{flex:1}
#c16-edit .e-btn{height:26px;padding:0 10px;border:0;border-radius:6px;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:500 11.5px/1 inherit;cursor:pointer}
#c16-edit .e-btn:hover{filter:brightness(.97)}
#c16-edit .e-ok{background:var(--c16-drop-color,#2383e2);color:#fff}
#c16-edit .e-del{background:none;color:#d44c47}
`;
    (document.head || document.documentElement).appendChild(st);
  }
  let editEl = null, editGid = null, editSnap = null;
  function lib() { const w = window.__c29; return w && typeof w.ids === 'function' && typeof w.url === 'function' ? w : null; }
  function openEditor(gid, anchor) {
    installEditCss();
    if (editEl && editEl.getAttribute('data-on') === '1') { if (editGid === gid) return; closeEditor(true); }
    if (!editEl) {
      editEl = document.createElement('div');
      editEl.id = 'c16-edit';
      editEl.addEventListener('keydown', ev => {
        ev.stopPropagation();
        if (ev.key === 'Escape') { ev.preventDefault(); closeEditor(false); }
        if (ev.key === 'Enter' && ev.target.matches('.e-name, .e-txt')) { ev.preventDefault(); closeEditor(true); }
      });
      editEl.addEventListener('pointerdown', ev => ev.stopPropagation());
      editEl.addEventListener('input', onEditInput);
      editEl.addEventListener('click', onEditClick);
      document.body.appendChild(editEl);
    }
    editGid = gid;
    editSnap = { label: LABEL[gid], meta: S.meta[gid] ? Object.assign({}, S.meta[gid]) : null };
    const m = S.meta[gid] || {};
    const tab = m.mode === 'text' ? 'txt' : (m.mode === 'img' || (m.icon && !/^data:image\/svg/.test(m.icon))) ? 'url' : 'lib';
    const isCustom = S.custom.some(c => c.id === gid);
    editEl.innerHTML =
      '<div class="e-top"><span class="e-prev" data-c16-g="' + gid + '"><span class="c16-ico"></span></span><input class="e-name" spellcheck="false"></div>' +
      '<div class="e-tabs"><button data-tab="lib">²⁹ ライブラリ</button><button data-tab="txt">絵文字・文字</button><button data-tab="url">SVG・画像</button></div>' +
      '<div class="e-pane"></div>' +
      '<div class="e-row"><label>アイコンの色 <input type="color" class="e-tint"></label><button class="e-btn" data-a="tint0">既定の色</button><span class="e-grow" style="flex:1"></span><button class="e-btn" data-a="icon0" title="アイコンを最初の絵に戻す">絵を戻す</button></div>' +
      '<div class="e-foot">' + (isCustom ? '<button class="e-btn e-del" data-a="del">グループを削除</button>' : '<button class="e-btn" data-a="add">＋ グループを追加</button>') +
      '<span class="e-grow"></span><button class="e-btn" data-a="cancel">やめる</button><button class="e-btn e-ok" data-a="ok">完了</button></div>';
    editEl.querySelector('.e-name').value = LABEL[gid];
    editEl.querySelector('.e-tint').value = /^#[0-9a-f]{6}$/i.test(m.tint || '') ? m.tint : tintNow(gid);
    setTab(tab);
    syncPrev();
    editEl.setAttribute('data-on', '1');
    const r = (anchor || HEAD[gid]).getBoundingClientRect();
    const h = editEl.offsetHeight || 360;
    editEl.style.left = Math.max(8, Math.min(r.left, innerWidth - 308)) + 'px';
    editEl.style.top = Math.max(8, Math.min(r.bottom + 6, innerHeight - h - 8)) + 'px';
    const nm = editEl.querySelector('.e-name');
    nm.focus(); nm.select();
  }
  function tintNow(gid) {
    const sec = HEAD[gid]; if (!sec) return '#8c939e';
    const c = getComputedStyle(sec.querySelector('.c16-ico')).backgroundColor;
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c || '');
    return m ? '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join('') : '#8c939e';
  }
  function setTab(t) {
    editEl.querySelectorAll('.e-tabs button').forEach(b => setAttr(b, 'data-on', b.getAttribute('data-tab') === t ? '1' : '0'));
    const pane = editEl.querySelector('.e-pane');
    const m = S.meta[editGid] || {};
    if (t === 'lib') {
      pane.innerHTML = '<input class="e-q" placeholder="英語の名前で探す（例: star, book, heart）" spellcheck="false"><div class="e-grid"></div><div class="e-mut"></div>';
      fillLib('');
    } else if (t === 'txt') {
      pane.innerHTML = '<input class="e-txt" maxlength="4" placeholder="★"><div class="e-mut">絵文字か 1〜2 文字。色は「アイコンの色」で変わります（絵文字はそのままの色）。</div>';
      pane.querySelector('.e-txt').value = m.mode === 'text' ? m.icon || '' : '';
    } else {
      pane.innerHTML = '<textarea class="e-url" placeholder="<svg …>…</svg>／https://…／data:image/…" spellcheck="false"></textarea>' +
        '<label class="e-mut" style="display:flex;gap:6px;align-items:center"><input type="checkbox" class="e-raw"> 元の色のまま（色を付けない）</label>';
      pane.querySelector('.e-url').value = m.mode !== 'text' && m.icon && m.src ? m.src : '';
      pane.querySelector('.e-raw').checked = m.mode === 'img';
    }
  }
  function fillLib(q) {
    const grid = editEl.querySelector('.e-grid'), mut = editEl.querySelector('.e-mut');
    if (!grid) return;
    const L29 = lib();
    if (!L29) { grid.innerHTML = ''; mut.textContent = '²⁹ Icon Library が動いていません（SVG・画像のタブで貼ることもできます）'; return; }
    const k = q.trim().toLowerCase();
    let ids = [];
    try { ids = L29.ids(); } catch (e) { ids = []; }
    const hit = (k ? ids.filter(id => id.toLowerCase().includes(k)) : ids).slice(0, 160);
    grid.innerHTML = hit.map(id => { let u = ''; try { u = L29.url(id, { color: 'auto' }); } catch (e) {} return u ? '<button data-ico="' + escH(id) + '" title="' + escH(id) + '"><img alt="" src="' + escH(u) + '"></button>' : ''; }).join('');
    mut.textContent = hit.length ? hit.length + ' 個（押すと、その形を色付きで使います）' : '見つかりませんでした';
  }
  function setMeta(patch) {
    const m = Object.assign({}, S.meta[editGid] || {}, patch);
    Object.keys(m).forEach(k => { if (m[k] === null || m[k] === undefined || m[k] === '') delete m[k]; });
    if (Object.keys(m).length) S.meta[editGid] = m; else delete S.meta[editGid];
    applyMetaDom(); syncPrev();
  }
  function syncPrev() {
    if (!editEl) return;
    const prev = editEl.querySelector('.e-prev .c16-ico');
    const sec = HEAD[editGid];
    if (!prev || !sec) return;
    const src = sec.querySelector('.c16-ico'), cs = getComputedStyle(src);
    const m = S.meta[editGid] || {};
    prev.removeAttribute('style');
    prev.removeAttribute('data-c16-txt');
    prev.textContent = '';
    if (m.mode === 'text' && m.icon) {
      prev.style.cssText = '-webkit-mask:none;mask:none;background:none;display:flex;align-items:center;justify-content:center;font-size:20px;color:' + (m.tint || cs.backgroundColor);
      prev.textContent = m.icon;
    } else if (m.mode === 'img' && m.icon) {
      prev.style.cssText = '-webkit-mask:none;mask:none;background:url("' + cssUrl(m.icon) + '") center / 24px 24px no-repeat';
    } else {
      const ico = getComputedStyle(sec).getPropertyValue('--c16-ico').trim() || 'url("' + ICON + '")';
      prev.style.setProperty('-webkit-mask', ico + ' center / 24px 24px no-repeat');
      prev.style.setProperty('mask', ico + ' center / 24px 24px no-repeat');
      prev.style.backgroundColor = cs.backgroundColor;
    }
  }
  function onEditInput(ev) {
    const t = ev.target;
    if (t.matches('.e-name')) { const v = t.value.trim(); LABEL[editGid] = v || (GROUPS.find(g => g.id === editGid) || {}).label || editGid; applyMetaDom(); }
    else if (t.matches('.e-q')) fillLib(t.value);
    else if (t.matches('.e-txt')) setMeta(t.value.trim() ? { icon: t.value.trim(), mode: 'text', src: null } : { icon: null, mode: null });
    else if (t.matches('.e-url') || t.matches('.e-raw')) {
      const ta = editEl.querySelector('.e-url'), raw = editEl.querySelector('.e-raw').checked;
      const u = iconUrlOf(ta.value);
      if (u) setMeta({ icon: u, src: ta.value.trim().slice(0, 20000), mode: raw ? 'img' : 'mask' });
      else if (!ta.value.trim()) setMeta({ icon: null, src: null, mode: null });
    } else if (t.matches('.e-tint')) setMeta({ tint: t.value });
  }
  function onEditClick(ev) {
    const t = ev.target;
    const tb = t.closest('[data-tab]');
    if (tb) { setTab(tb.getAttribute('data-tab')); return; }
    const ic = t.closest('[data-ico]');
    if (ic) { const L29 = lib(); if (L29) { try { setMeta({ icon: L29.url(ic.getAttribute('data-ico'), { color: 'auto' }), mode: 'mask', src: null }); } catch (e) {} } return; }
    const a = t.closest('[data-a]');
    if (!a) return;
    const act = a.getAttribute('data-a');
    if (act === 'ok') closeEditor(true);
    else if (act === 'cancel') closeEditor(false);
    else if (act === 'tint0') { setMeta({ tint: null }); editEl.querySelector('.e-tint').value = tintNow(editGid); }
    else if (act === 'icon0') { setMeta({ icon: null, mode: null, src: null }); setTab('lib'); }
    else if (act === 'add') {
      const nm = prompt('新しいグループの名前', '');
      if (nm && nm.trim()) { closeEditor(true); const g = addGroup(nm.trim()); setTimeout(() => openEditor(g, HEAD[g]), 60); }
    } else if (act === 'del') {
      if (confirm('「' + LABEL[editGid] + '」を削除します。中のチームスペースは Unsorted へ移ります。')) { const g = editGid; closeEditor(true); removeGroup(g); }
    }
  }
  function closeEditor(keep) {
    if (!editEl || editEl.getAttribute('data-on') !== '1') return;
    editEl.removeAttribute('data-on');
    const gid = editGid;
    if (!keep && editSnap) {
      LABEL[gid] = editSnap.label;
      if (editSnap.meta) S.meta[gid] = editSnap.meta; else delete S.meta[gid];
    } else {
      const base = (GROUPS.find(g => g.id === gid) || {}).label;
      const m = Object.assign({}, S.meta[gid] || {});
      if (LABEL[gid] && LABEL[gid] !== base) m.label = LABEL[gid]; else delete m.label;
      if (Object.keys(m).length) S.meta[gid] = m; else delete S.meta[gid];
      const c = S.custom.find(x => x.id === gid);
      if (c) c.label = LABEL[gid];
    }
    applyMetaDom();
    editGid = null; editSnap = null;
    save(); lastPreSig = '';
  }
  function addGroup(label) {
    let n = 1;
    while (GIDS.includes('c' + n)) n++;
    const id = 'c' + n;
    S.custom.push({ id, label });
    addSeat(id, label);
    const i = S.gorder.indexOf(DEFAULT_GID);
    if (i >= 0) S.gorder.splice(i, 0, id); else S.gorder.push(id);
    save(); lastPreSig = ''; run(true); afterMove('group');
    return id;
  }
  function removeGroup(gid) {
    const ci = S.custom.findIndex(c => c.id === gid);
    if (ci < 0) return false;
    S.custom.splice(ci, 1);
    (S.order[gid] || []).forEach(k => { if (!S.order[DEFAULT_GID].includes(k)) S.order[DEFAULT_GID].push(k); });
    delete S.order[gid]; delete S.meta[gid]; delete S.collapsed[gid]; delete LABEL[gid];
    S.gorder = S.gorder.filter(g => g !== gid);
    const gi = GIDS.indexOf(gid); if (gi >= 0) GIDS.splice(gi, 1);
    const ri = GROUPS.findIndex(g => g.id === gid); if (ri >= 0) GROUPS.splice(ri, 1);
    if (HEAD[gid]) { HEAD[gid].remove(); delete HEAD[gid]; }
    save(); lastPreSig = ''; run(true); afterMove('group');
    return true;
  }
  window.addEventListener('pointerdown', ev => {
    if (editEl && editEl.getAttribute('data-on') === '1' && !(ev.target instanceof Element && (ev.target.closest('#c16-edit') || ev.target.closest('#c16-root .c16-lbl')))) closeEditor(true);
  }, true);

  /* ───── ドラッグ ───── */
  let drag = null, moveRaf = 0, suppressClick = 0, lineEl = null, menuEl = null;

  function regions() {
    const out = [];
    for (const gid of S.gorder) {
      const hr = HEAD[gid].getBoundingClientRect();
      if (!hr.height) continue;
      let bottom = hr.bottom;
      const arms = [];
      if (!S.collapsed[gid]) {
        for (const k of keysOf(gid)) {
          const t = L.byKey.get(k); if (!t) continue;
          const a = armOf(t, L.list); if (!a) continue;
          const r = a.getBoundingClientRect(); if (!r.height) continue;
          arms.push({ k, top: r.top, mid: r.top + Math.min(r.height, 30) / 2, bottom: r.bottom });
          if (r.bottom > bottom) bottom = r.bottom;
        }
      }
      out.push({ gid, top: hr.top, hb: hr.bottom, bottom, arms });
    }
    return out;
  }
  function hitGroup(d) {
    const rg = d.regs;
    if (!rg.length) return null;
    for (const g of rg) if (d.y < (g.top + g.bottom) / 2) return { index: S.gorder.indexOf(g.gid), y: g.top - 1 };
    return { index: S.gorder.length, y: rg[rg.length - 1].bottom };
  }
  function hitTeam(d) {
    const rg = d.regs;
    if (!rg.length) return null;
    let g = rg[0];
    for (const x of rg) if (d.y >= x.top) g = x;
    const arms = g.arms.filter(x => x.k !== d.key);
    for (const x of arms) if (d.y < x.mid) return { gid: g.gid, before: x.k, y: x.top - 1 };
    return { gid: g.gid, before: null, y: arms.length ? arms[arms.length - 1].bottom : g.hb };
  }
  function hitPage(d) {
    const sibs = d.sibs.filter(u => u.unit !== d.unit);
    if (!sibs.length) return null;
    for (const u of sibs) if (d.y < u.r.top + u.r.height / 2) return { before: u.name, y: u.r.top - 1 };
    return { before: null, y: sibs[sibs.length - 1].r.bottom };
  }
  function showLine(x, y, w) {
    if (!lineEl) { lineEl = document.createElement('div'); lineEl.id = 'c16-line'; document.body.appendChild(lineEl); }
    lineEl.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    const wv = w + 'px';
    if (lineEl.style.width !== wv) lineEl.style.width = wv;
    lineEl.setAttribute('data-on', '1');
  }
  function hideLine() { if (lineEl) lineEl.removeAttribute('data-on'); }

  function onDragScroll() {
    const d = drag;
    if (!d || !d.armed) return;
    d.stale = true;
    if (!moveRaf) moveRaf = requestAnimationFrame(() => { moveRaf = 0; if (drag) track(drag); });
  }
  function begin(e, d) {
    drag = d; d.x0 = e.clientX; d.y0 = e.clientY; d.y = e.clientY;
    d.armed = false; d.target = null; d.lastKey = null; d.overEl = null; d.stale = false;
    window.addEventListener('pointermove', onMove, { capture: true, passive: false });
    window.addEventListener('pointerup', onUp, { capture: true, passive: false });
    window.addEventListener('pointercancel', end, { capture: true, passive: false });
    window.addEventListener('scroll', onDragScroll, { capture: true, passive: true });
  }
  function prepare(d) {
    const lr = L.list.getBoundingClientRect();
    d.lx = lr.left + 4; d.lw = Math.max(40, lr.width - 8);
    if (d.mode === 'page') {
      d.sibs = pageUnits(d.team).map(u => Object.assign(u, { r: u.row.getBoundingClientRect() })).filter(u => u.r.height);
    } else d.regs = regions();
  }
  function track(d) {
    if (d.stale) { d.stale = false; prepare(d); d.lastKey = null; }
    const h = d.mode === 'group' ? hitGroup(d) : d.mode === 'team' ? hitTeam(d) : hitPage(d);
    d.target = h;
    const key = h ? (h.gid || '') + '|' + (h.index != null ? h.index : '') + '|' + (h.before || '') + '|' + Math.round(h.y) : '';
    if (key === d.lastKey) return;
    d.lastKey = key;
    if (!h) { if (d.overEl) { d.overEl.removeAttribute('data-c16-over'); d.overEl = null; } hideLine(); return; }
    showLine(d.lx, h.y, d.lw);
    let el = null;
    if (d.mode === 'group') el = HEAD[S.gorder[h.index]] || null;
    else if (d.mode === 'team') el = HEAD[h.gid] || null;
    if (el !== d.overEl) {
      if (d.overEl) d.overEl.removeAttribute('data-c16-over');
      if (el) el.setAttribute('data-c16-over', '1');
      d.overEl = el;
    }
  }
  function onMove(e) {
    const d = drag;
    if (!d) return;
    /* v15.2: 引き受けたドラッグ中は Notion に「動き」を渡さない（Notion のドラッグが始まらない） */
    if (d.soft) e.stopPropagation();
    if (!d.armed) {
      if (Math.abs(e.clientX - d.x0) + Math.abs(e.clientY - d.y0) < DRAG_PX) return;
      d.armed = true;
      if (d.soft) suppressClick = Date.now() + 1500;
      prepare(d);
      document.documentElement.setAttribute('data-c16-dragging', d.mode);
      if (d.el) d.el.setAttribute('data-c16-drag', '1');
    }
    e.preventDefault();
    d.y = e.clientY;
    if (!moveRaf) moveRaf = requestAnimationFrame(() => { moveRaf = 0; if (drag) track(drag); });
  }
  function onUp(e) {
    const d = drag;
    /* v15.3: 「離した」は Notion にも渡す（渡さないと Notion が掴んだままになる）。
       クリックの発火は suppressClick が止める */
    if (d && d.armed) { d.y = e.clientY; track(d); }
    end();
    if (!d) return;
    if (!d.armed) {
      if (d.mode === 'group') {
        /* v15.6: 文字をクリック → 編集。アイコン・余白・件数 → 開閉 */
        const lbl = e.target instanceof Element ? e.target.closest('#c16-root .c16-lbl') : null;
        if (lbl) openEditor(d.gid, lbl); else toggleGroup(d.gid);
      }
      else if (d.mode === 'team' && !d.soft) openMenu(d.key, e.clientX, e.clientY);
      return;
    }
    const h = d.target;
    if (!h) return;
    if (d.mode === 'group') moveGroup(d.gid, h.index);
    else if (d.mode === 'team') moveTeam(d.key, h.gid, h.before);
    else movePage(d, h.before);
  }
  function end() {
    const d = drag;
    drag = null;
    window.removeEventListener('pointermove', onMove, true);
    window.removeEventListener('pointerup', onUp, true);
    window.removeEventListener('pointercancel', end, true);
    window.removeEventListener('scroll', onDragScroll, true);
    if (moveRaf) { cancelAnimationFrame(moveRaf); moveRaf = 0; }
    hideLine();
    document.documentElement.removeAttribute('data-c16-dragging');
    if (d && d.el) d.el.removeAttribute('data-c16-drag');
    if (d && d.overEl) { d.overEl.removeAttribute('data-c16-over'); d.overEl = null; }
    if (pendingDragApply) { pendingDragApply = false; lastPreSig = ''; schedule(0); }
  }
  /* v15.3: 引き受けたドラッグ中だけ、互換の mousemove を Notion に渡さない（mouseup は渡す） */
  function onMouseGuard(e) {
    if (drag && drag.soft) e.stopPropagation();
  }

  /* v15.1: ¹⁶ のドラッグ中・⌥・見出し上では Notion 自身のドラッグを止める */
  function onNativeDragStart(e) {
    const tg = e.target;
    if (!(tg instanceof Node) || !L.list || !L.list.contains(tg)) return;
    if (drag || e.altKey || (L.root && L.root.contains(tg))) { e.preventDefault(); e.stopPropagation(); return; }
    /* v15.2: Notion のドラッグ中は CSS の transform 固定を外す */
    document.documentElement.setAttribute('data-c16-ndrag', '1');
  }
  /* v15.1: Notion 標準のドラッグの後は、並びを反映し直す */
  function onNativeDragEnd(e) {
    const had = document.documentElement.hasAttribute('data-c16-ndrag');
    document.documentElement.removeAttribute('data-c16-ndrag');
    const tg = e.target;
    if (!had && (!(tg instanceof Node) || !L.list || !L.list.contains(tg))) return;
    lastPreSig = ''; dirtyAll = true;
    setTimeout(() => schedule(0), 60);
    afterMove('native');
  }

  function openMenu(key, x, y) {
    if (!menuEl) {
      menuEl = document.createElement('div');
      menuEl.id = 'c16-menu';
      menuEl.addEventListener('click', ev => {
        if (ev.target.closest('[data-add]')) {
          const nm = prompt('新しいグループの名前', '');
          if (nm && nm.trim()) { const g = addGroup(nm.trim()); moveTeam(menuEl.getAttribute('data-k'), g, null); }
          closeMenu(); return;
        }
        const b = ev.target.closest('[data-gid]');
        if (!b) return;
        moveTeam(menuEl.getAttribute('data-k'), b.getAttribute('data-gid'), null);
        closeMenu();
      });
      document.body.appendChild(menuEl);
    }
    const cur = gidOf(key);
    menuEl.setAttribute('data-k', key);
    menuEl.innerHTML = '<div class="c16-m-title"></div>' + S.gorder.map(g =>
      '<button type="button" data-gid="' + g + '"' + (g === cur ? ' data-cur="1"' : '') + '>' + escH(LABEL[g]) + '</button>').join('') +
      '<button type="button" data-add="1" class="c16-m-add">＋ 新しいグループへ</button>';
    menuEl.firstChild.textContent = shown(key) + ' を移動';
    menuEl.setAttribute('data-on', '1');
    const mh = Math.min(window.innerHeight - 16, 40 + S.gorder.length * 26);
    menuEl.style.left = Math.max(8, Math.min(x, window.innerWidth - 220)) + 'px';
    menuEl.style.top = Math.max(8, Math.min(y, window.innerHeight - mh - 8)) + 'px';
  }
  function closeMenu() { if (menuEl) menuEl.removeAttribute('data-on'); }

  function onDown(e) {
    const tg = e.target;
    if (!(tg instanceof Element)) return;
    if (menuEl && menuEl.getAttribute('data-on') === '1' && !tg.closest('#c16-menu')) closeMenu();
    if (e.button !== 0 || drag) return;
    const head = tg.closest('#c16-root .c16-head');
    if (head) {
      e.preventDefault();
      begin(e, { mode: 'group', gid: head.parentElement.getAttribute('data-c16-g'), el: head.parentElement });
      return;
    }
    if (!L.list || !L.list.contains(tg) || (L.root && L.root.contains(tg))) return;
    const team = tg.closest(SEL_TEAM + '[data-c16-k]');
    if (!team) return;

    /* v15.2: ⌥なし＝チームスペース行そのものを掴んだときだけ ¹⁶ が引き受ける。
       押しただけ（クリック）は Notion に渡すので開閉はそのまま。行内の ⋯ ／＋ は対象外 */
    if (!e.altKey) {
      if (!PLAIN) return;
      const btn = teamBtn(team);
      if (!btn || !btn.contains(tg)) return;
      const inner = tg.closest('[role="button"], button');
      if (inner && inner !== btn) return;
      begin(e, { mode: 'team', soft: true, key: team.getAttribute('data-c16-k'), el: armOf(team, L.list) || team });
      return;
    }

    e.preventDefault(); e.stopPropagation();
    suppressClick = Date.now() + 1500;
    const row = tg.closest(SEL_PAGE);
    if (row && team.contains(row)) {
      const u = pageUnits(team).find(x => x.unit.contains(row));
      if (u) begin(e, { mode: 'page', team, teamKey: team.getAttribute('data-c16-k'), unit: u.unit, name: u.name, el: u.unit });
    } else {
      begin(e, { mode: 'team', key: team.getAttribute('data-c16-k'), el: armOf(team, L.list) || team });
    }
  }
  function onClick(e) {
    if (!suppressClick) return;
    if (Date.now() > suppressClick) { suppressClick = 0; return; }
    if (e.target instanceof Element && e.target.closest('#c16-menu')) return;
    e.preventDefault(); e.stopPropagation();
    suppressClick = 0;
  }
  function onKey(e) {
    if (e.key === 'Escape') { if (drag) end(); closeMenu(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element) {
      const head = e.target.closest('#c16-root .c16-head');
      if (head) { e.preventDefault(); toggleGroup(head.parentElement.getAttribute('data-c16-g')); }
    }
  }
  let resizeT = 0;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { calPass = 0; lastCalKey = ''; scheduleCalib(0); }, 250);
  }

  /* ───── 調査（__c16.probe）：行の位置の付け方を JSON で保存 ───── */
  function describe(el) {
    if (!el) return null;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      cls: String(el.getAttribute('class') || '').slice(0, 80),
      c16: [...el.attributes].filter(a => a.name.startsWith('data-c16')).map(a => a.name + '=' + a.value).join(' '),
      inline: (el.getAttribute('style') || '').slice(0, 200),
      position: cs.position, top: cs.top, transform: cs.transform, translate: cs.translate,
      display: cs.display, order: cs.order, width: cs.width, height: cs.height, overflowY: cs.overflowY,
      rect: { top: r1(r.top), width: r1(r.width), height: r1(r.height) }
    };
  }
  function probe() {
    const out = {
      version: VERSION, at: new Date().toISOString(), plainDrag: PLAIN,
      shared: L.shared.slice(), check: verify('probe'), list: describe(L.list), arms: []
    };
    for (const [k, t] of L.byKey) {
      const a = armOf(t, L.list);
      const chain = [];
      for (let el = t.parentElement; el && el !== a; el = el.parentElement) chain.push(describe(el));
      out.arms.push({ key: k, group: t.getAttribute('data-c16-g'), arm: describe(a), chain, team: describe(t) });
    }
    out.heads = S.gorder.map(g => ({ gid: g, label: LABEL[g], rect: describe(HEAD[g]).rect, order: HEAD[g].style.order }));
    const txt = JSON.stringify(out, null, 1);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
    a.download = 'c16-probe-' + Date.now() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return { arms: out.arms.length, problems: out.check ? out.check.overlap.length + out.check.squashed.length : 0, bytes: txt.length };
  }

  /* ───── 公開API・停止 ───── */
  function perf() {
    const o = {};
    for (const k in P) o[k] = { count: P[k][0], totalMs: r1(P[k][1]), avgMs: P[k][0] ? r2(P[k][1] / P[k][0]) : 0 };
    return o;
  }
  function status() {
    const counts = {};
    S.gorder.forEach(g => { counts[LABEL[g]] = keysOf(g).filter(k => L.byKey.has(k)).length; });
    return {
      version: VERSION, listFound: !!(L.list && L.list.isConnected), teams: L.teams.length,
      plainDrag: PLAIN, shared: L.shared.slice(), check: lastOverlap,
      calibration: lastCal, cal: Object.assign({}, CAL), collapsed: Object.keys(S.collapsed).map(g => LABEL[g]),
      counts, unsaved: L.temp.map(shown), perf: perf(), lastError
    };
  }
  function dl() {
    const txt = JSON.stringify({ status: status(), state: S }, null, 1);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
    a.download = 'c16-status-' + Date.now() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return txt.length;
  }
  let guard = 0;
  function off() {
    offFlag = true;
    clearInterval(guard); clearTimeout(schedT); clearTimeout(calT); clearTimeout(resizeT); clearTimeout(verT); flush();
    if (mo) mo.disconnect();
    if (ro) ro.disconnect();
    end();
    window.removeEventListener('pointerdown', onDown, true);
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('dragstart', onNativeDragStart, true);
    window.removeEventListener('dragend', onNativeDragEnd, true);
    window.removeEventListener('drop', onNativeDragEnd, true);
    window.removeEventListener('mousemove', onMouseGuard, true);
    document.querySelectorAll('[data-c16-arm], [data-c16-plist] > *').forEach(el => el.style.removeProperty('order'));
    [L.root, lineEl, menuEl, document.getElementById('c16-newspace'), calStyle].forEach(nd => { if (nd) nd.remove(); });
    const attrs = ['data-c16-list', 'data-c16-arm', 'data-c16-hide', 'data-c16-k', 'data-c16-g', 'data-c16-tier',
      'data-c16-plist', 'data-c16-pb', 'data-c16-cal', 'data-c16-drag', 'data-c16-over',
      'data-c16-chain', 'data-c16-unit', 'data-c16-autoh'];
    document.querySelectorAll('[data-c16-list],[data-c16-arm],[data-c16-k],[data-c16-tier],[data-c16-plist],[data-c16-chain],[data-c16-unit],[data-c16-autoh]').forEach(el => {
      attrs.forEach(a => el.removeAttribute(a));
      el.style.removeProperty('--c16-pb');
    });
    ['data-c16-ready', 'data-c16-settled', 'data-c16-dragging', 'data-c16-ndrag', 'data-c16-veil'].forEach(a => document.documentElement.removeAttribute(a));
    try { delete window.__c16; } catch (e) { window.__c16 = undefined; }
    return 'stopped';
  }

  window.__c16 = {
    version: VERSION, status, dl, off, perf, probe,
    verify() { return verify('manual') || 'OK（重なり・潰れなし）'; },
    plainDrag(on) {
      PLAIN = on !== false;
      try { localStorage.setItem(PLAIN_KEY, PLAIN ? '1' : '0'); } catch (e) {}
      return PLAIN ? 'on：チームスペース行の普通のドラッグは ¹⁶ が引き受けます' : 'off：v15.1 と同じ（⌥ドラッグのみ）';
    },
    resetPerf() { for (const k in P) { P[k][0] = 0; P[k][1] = 0; } return perf(); },
    force() { lastPreSig = ''; lastCalKey = ''; lastSig = ''; dirtyAll = true; doneTeams = new WeakSet(); run(true); return status(); },
    refresh() { lastSig = ''; run(); return status(); },
    recalibrate() { calPass = 0; calibrate(); return lastCal; },
    toggle: toggleGroup,
    rename(gid, label) { if (!LABEL[gid]) return false; LABEL[gid] = String(label); const base = (GROUPS.find(g => g.id === gid) || {}).label; const m = Object.assign({}, S.meta[gid] || {}); if (LABEL[gid] !== base) m.label = LABEL[gid]; else delete m.label; S.meta[gid] = m; const c = S.custom.find(x => x.id === gid); if (c) c.label = LABEL[gid]; applyMetaDom(); save(); return LABEL[gid]; },
    icon(gid, o) { if (!LABEL[gid]) return false; const m = Object.assign({}, S.meta[gid] || {}); if (o && o.icon !== undefined) { const u = o.mode === 'text' ? String(o.icon) : iconUrlOf(o.icon); if (u) { m.icon = u; m.mode = o.mode || 'mask'; } else { delete m.icon; delete m.mode; } } if (o && o.tint !== undefined) { if (o.tint) m.tint = o.tint; else delete m.tint; } S.meta[gid] = m; applyMetaDom(); save(); return m; },
    addGroup, removeGroup, edit(gid) { openEditor(gid, HEAD[gid]); },
    collapseAll(on) { GIDS.forEach(g => { if (on) S.collapsed[g] = true; else delete S.collapsed[g]; }); save(); run(true); if (!on) afterMove('open'); },
    move(name, gidOrLabel) { const g = LABEL[gidOrLabel] ? gidOrLabel : GIDS.find(x => LABEL[x] === gidOrLabel); moveTeam(name, g, null); return gidOf(name); },
    resetPages(team) {
      if (team) { delete S.porder[team]; const t = L.byKey.get(team); if (t) dirty.add(t); }
      else { S.porder = {}; dirtyAll = true; }
      save(); lastSig = ''; run(true);
    }
  };

  /* ───── 起動 ───── */
  load();
  document.querySelectorAll('#c16-root, .c16-sec[data-c16-headonly], #' + CAL_STYLE_ID).forEach(nd => nd.remove());
  calStyle = null;
  if (loadCal()) writeCal();   // v15.5: 保存した字下げで最初から描く

  /* v15.5: ページ全体の見張り。一覧が健在な間は即 return（軽い）。
     一覧が外れた／まだ無い時に、チームスペースが足されたらその場（描画前）で並べる */
  try {
    const docMo = new MutationObserver(recs => {
      if (offFlag || drag) return;
      if (L.list && L.list.isConnected && L.root && L.root.isConnected && L.root.parentElement === L.list) return;
      let hit = false;
      for (const r of recs) {
        for (const nd of r.addedNodes) {
          if (nd instanceof Element && hasSel(nd, SEL_TEAM)) { hit = true; break; }
        }
        if (hit) break;
      }
      if (!hit) return;
      const rebuilt = !!L.list && settledDone;
      if (rebuilt) veilCut();
      const ok = run(true);
      if (rebuilt) { calPass = 0; lastCalKey = ''; if (ok) scheduleCalib(30); else veilReveal(); }
      startGuard();
    });
    docMo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  } catch (e) { lastError = String((e && e.stack) || e); }
  window.addEventListener('pointerdown', onDown, { capture: true, passive: false });
  window.addEventListener('click', onClick, true);
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('dragstart', onNativeDragStart, true);
  window.addEventListener('dragend', onNativeDragEnd, true);
  window.addEventListener('drop', onNativeDragEnd, true);
  window.addEventListener('mousemove', onMouseGuard, true);
  window.addEventListener('beforeunload', flush);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => scheduleCalib(100));

  const bootAt = Date.now();
  (function bootTry(n) {
    if (offFlag || run()) return;
    if (Date.now() - bootAt < 30000) setTimeout(() => bootTry(n + 1), Math.min(400 * Math.pow(1.25, n), 1600));
  })(0);

  let guardIdle = 0;
  function guardTick() {
    if (document.hidden || drag || offFlag) return;
    if (!L.list || !L.list.isConnected || !L.root || !L.root.isConnected ||
        (NEWSPACE && !document.getElementById('c16-newspace'))) { guardIdle = 0; schedule(0); return; }
    if (++guardIdle >= 30) stopGuard();
  }
  function stopGuard() { if (guard) { clearInterval(guard); guard = null; } }
  function startGuard() { if (!guard && !offFlag) { guardIdle = 0; guard = setInterval(guardTick, 2000); } }
  startGuard();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) startGuard(); });
})();