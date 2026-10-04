// ==UserScript==
// @name         « No »　¹⁵ _ Primary Column Tagger
// @namespace    cordivestium
// @version      1.2.0
// @description  v1.2.0: スクロールやタブ切替で新しく描かれたセルへ、覚えている題字列の印を描画前（MutationObserver のコールバック）に同期で付ける → ¹⁷ の題字の書体が「素→整形」と切り替わる瞬間を見せない。表が作り直されてもビュー（ページ＋?v=）ごとの記憶で即付く。document-start 起動。題字列のセルに data-c12-primary="1" を付ける補助。v1.1.0: 表ごとに題字列を決める（サイドピーク等で表が2つ並んでも混ざらない）。リレーションの形のセルには付けない。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/* =============================================================================
   « No »　¹⁵ _ Primary Column Tagger ─ v1.1.0
   -----------------------------------------------------------------------------
   v1.0.0 → v1.1.0（サイドピークで題字・Date が崩れる件）:
     v1.0.0 はページ全体で「⁰⁹の印が一番多い列番号」を1つだけ選び、
     ページ全体のその番号のセルへ印を付けていました。
     サイドピークを開くと表が2つになり（メイン: Works=3 / ピーク: Works=1）、
     ピーク側が多いと "1" が選ばれ、メインの Date 列（リレーション）に
     題字の救済CSSが当たり、本物の題字列（3）から印が外れていました。

     v1.1.0 では:
       ・⁰⁹の印を「表ごと」に数え、表ごとに題字列を決める
       ・「前回の列を維持」も表ごとに覚える
       ・リレーションの形（icon + span.notranslate の inline 項目）のセルには
         絶対に印を付けない（保険）
       ・@match を ⁰⁹ と同じ3ドメインにそろえた

   方針（不変）:
     ・スタイルは一切注入しません（属性を付けるだけ）
     ・CSS側は [data-c12-primary] だけを見ます

   確認方法（DevTools コンソール）:
     __c12t.state()    … 表ごとの題字列 index・タグ数・根拠
     __c12t.refresh()  … その場で測り直す
   ============================================================================= */

(() => {
  'use strict';

  const VERSION = '1.2.0';
  const MARK = 'data-c12-primary';
  const MARKED = '.cordivestium-v1121-title-value';
  const CELL = '.notion-table-view-cell[data-col-index]';
  const TABLE_ROOT = '.notion-table-view';

  /* リレーション1件の形（Relation CSS v0.3.0 と同じ見分け方） */
  const RELATION_PROBE =
    'div[style*="display: inline"] > .notion-record-icon + span.notranslate:not([data-token-index])';
  const RELATION_MARKERS =
    '[data-cordivestium-relation-active], .cordivestium-relation-cell, .cordivestium-relation-list';

  const memory = new Map();          /* 表 → 前回の題字列 index */
  /* v1.2.0: ビュー（ページid＋?v=）→ 題字列 index。表の要素が作り直されても引き継ぐ */
  const LS_VIEW = 'c15-primary-by-view-v1';
  let byView = {};
  try { const o = JSON.parse(localStorage.getItem(LS_VIEW) || 'null'); if (o && typeof o === 'object') byView = o; } catch (e) { /* noop */ }
  let saveT = 0;
  function saveViewSoon() {
    if (saveT) return;
    saveT = setTimeout(() => {
      saveT = 0;
      const keys = Object.keys(byView);
      if (keys.length > 300) for (const k of keys.slice(0, keys.length - 300)) delete byView[k];
      try { localStorage.setItem(LS_VIEW, JSON.stringify(byView)); } catch (e) { /* noop */ }
    }, 1000);
  }
  function viewKey() {
    const m = location.pathname.match(/([0-9a-f]{32})(?:[^0-9a-f]|$)/i);
    let v = '';
    try { v = new URLSearchParams(location.search).get('v') || ''; } catch (e) { /* noop */ }
    return (m ? m[1].toLowerCase() : location.pathname) + '|' + v;
  }
  const rootCache = new WeakMap();   /* 行 → 表（構造判定のときだけ使う） */
  let lastSummary = [];
  let lastCleared = 0;
  let timer = 0;

  function esc(value) {
    if (window.CSS && typeof CSS.escape === 'function') return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, '\\$&');
  }

  function indexOf(cell) {
    return String(cell.getAttribute('data-col-index'));
  }

  function sameIndexSelector(index) {
    return '.notion-table-view-cell[data-col-index="' + esc(index) + '"]';
  }

  function isVisibleCell(cell) {
    return cell.getBoundingClientRect().width > 15;
  }

  function isRelationCell(cell) {
    return Boolean(
      cell.querySelector(RELATION_PROBE) ||
      cell.matches(RELATION_MARKERS) ||
      cell.querySelector(RELATION_MARKERS)
    );
  }

  /* セルが属する「表」を決める。
     ① .notion-table-view があればそれ
     ② 無ければ、同じ列番号のセルを2つ以上含む最初の祖先（＝その表の行の入れ物） */
  function rootOf(cell) {
    const direct = cell.closest(TABLE_ROOT);
    if (direct) return direct;

    const row = cell.parentElement;
    if (!row) return document.body;

    const cached = rootCache.get(row);
    if (cached && cached.isConnected && cached.contains(cell)) return cached;

    const selector = sameIndexSelector(indexOf(cell));
    let current = row.parentElement;
    let found = null;

    for (let depth = 0; current && current !== document.body && depth < 20; depth += 1) {
      if (current.querySelectorAll(selector).length >= 2) {
        found = current;
        break;
      }
      current = current.parentElement;
    }

    const root = found || row;
    rootCache.set(row, root);
    return root;
  }

  function describe(root) {
    return {
      method: root.matches(TABLE_ROOT) ? 'notion-table-view' : 'structural',
      inPeek: Boolean(root.closest('.notion-peek-renderer, [class*="peek"]'))
    };
  }

  /* その表のその列が題字列らしいか（ページアイコンがあり、リレーションの形ではない） */
  function columnLooksLikeTitle(root, index) {
    if (index === null || !root || !root.isConnected) return false;
    for (const cell of root.querySelectorAll(sameIndexSelector(index))) {
      if (cell.querySelector('.notion-record-icon') && !isRelationCell(cell)) return true;
    }
    return false;
  }

  function apply() {
    /* 1. ⁰⁹の印を表ごとに数える */
    const tallies = new Map();
    document.querySelectorAll(MARKED).forEach(element => {
      const cell = element.closest(CELL);
      if (!cell) return;
      const root = rootOf(cell);
      let tally = tallies.get(root);
      if (!tally) {
        tally = new Map();
        tallies.set(root, tally);
      }
      const key = indexOf(cell);
      tally.set(key, (tally.get(key) || 0) + 1);
    });

    /* 2. 消えた表の記憶を捨てる */
    memory.forEach((_, root) => {
      if (!root.isConnected) memory.delete(root);
    });

    /* 3. 表ごとの題字列を決める */
    const plan = new Map();

    tallies.forEach((tally, root) => {
      let best = null;
      let bestCount = -1;
      tally.forEach((count, key) => {
        if (count > bestCount) {
          bestCount = count;
          best = key;
        }
      });
      plan.set(root, { index: best, reason: '⁰⁹の印から（' + bestCount + '件）' });
      memory.set(root, best);
      /* v1.2.0: メインの表（ピーク・インラインDB以外）はビューごとにも覚える */
      if (root.matches(TABLE_ROOT) && !root.closest('.notion-peek-renderer, .notion-collection_view-block')) {
        const k = viewKey();
        if (byView[k] !== best) { byView[k] = best; saveViewSoon(); }
      }
    });

    memory.forEach((index, root) => {
      if (plan.has(root)) return;
      if (columnLooksLikeTitle(root, index)) {
        plan.set(root, { index, reason: '前回の列indexを維持（⁰⁹の印が一時的に無し）' });
      }
    });

    /* 4. 表の中だけに印を付ける */
    const keep = new Set();
    const summary = [];

    plan.forEach(({ index, reason }, root) => {
      let tagged = 0;
      let skippedRelation = 0;

      root.querySelectorAll(sameIndexSelector(index)).forEach(cell => {
        if (!isVisibleCell(cell)) return;
        if (isRelationCell(cell)) {
          skippedRelation += 1;
          return;
        }
        if (cell.getAttribute(MARK) !== '1') cell.setAttribute(MARK, '1');
        keep.add(cell);
        tagged += 1;
      });

      summary.push({ ...describe(root), index, tagged, skippedRelation, reason });
    });

    /* 5. それ以外の古い印は外す */
    let cleared = 0;
    document.querySelectorAll('[' + MARK + ']').forEach(element => {
      if (!keep.has(element)) {
        element.removeAttribute(MARK);
        cleared += 1;
      }
    });

    lastSummary = summary;
    lastCleared = cleared;
    return { version: VERSION, tables: summary, cleared };
  }

  /* v1.2.0: 描画前の同期付与（レイアウトを読まない）。
     追加された要素の中の「覚えている列番号」のセルにだけ印を付ける。外すのは従来どおり apply() */
  function syncTag(recs) {
    let memoRoot = null, memoIdx;
    for (const r of recs) {
      for (const n of r.addedNodes) {
        if (n.nodeType !== 1) continue;
        const c = n.closest ? n.closest(CELL) : null;
        const cells = c ? [c] : (n.querySelectorAll ? n.querySelectorAll(CELL) : []);
        for (const cell of cells) {
          if (cell.getAttribute(MARK) === '1') continue;
          const root = cell.closest(TABLE_ROOT);
          if (!root) continue;
          let idx;
          if (root === memoRoot) idx = memoIdx;
          else {
            idx = memory.get(root);
            if (idx === undefined && !root.closest('.notion-peek-renderer, .notion-collection_view-block')) idx = byView[viewKey()];
            memoRoot = root; memoIdx = idx;
          }
          if (idx === undefined || idx === null) continue;
          if (indexOf(cell) !== String(idx)) continue;
          if (isRelationCell(cell)) continue;
          cell.setAttribute(MARK, '1');
        }
      }
    }
  }

  function schedule() {
    if (timer) return;
    timer = window.setTimeout(() => {
      timer = 0;
      try {
        apply();
      } catch (error) {
        console.warn('[Cordivestium] ¹⁵ tagger error', error);
      }
    }, 60);
  }

  window.__c12t = {
    version: VERSION,
    state() {
      const tags = {};
      document.querySelectorAll('[' + MARK + ']').forEach(element => {
        const key = String(element.getAttribute('data-col-index'));
        tags[key] = (tags[key] || 0) + 1;
      });
      const result = {
        version: VERSION,
        tables: lastSummary,
        lastCleared,
        tags,
        marks: document.querySelectorAll(MARKED).length
      };
      console.table(lastSummary);
      return result;
    },
    refresh() {
      return apply();
    }
  };

  try {
    new MutationObserver((recs) => {
      try { syncTag(recs); } catch (e) { /* noop */ }
      schedule();
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (error) {
    /* 監視できない環境でも interval が働きます */
  }

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true, capture: true });
  window.setInterval(schedule, 3000);

  apply();
  window.setTimeout(schedule, 400);
  window.setTimeout(schedule, 1500);

  console.log('[Cordivestium] Primary Column Tagger v' + VERSION + ' started. « No »');
})();