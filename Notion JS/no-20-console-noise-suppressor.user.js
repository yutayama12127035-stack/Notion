// ==UserScript==
// @name         « No »　²⁰ _ Console Noise Suppressor
// @namespace    https://cordivestium.local/console-noise-suppressor
// @version      3.0.0
// @description  家のスクリプトのログと、Notion自身の定例ノイズを捨てます。エラーは必ず通します。
// @match        https://app.notion.com/*
// @match        https://www.notion.com/*
// @match        https://www.notion.so/*
// @match        https://notion.so/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/* ── v3.0.0（2026-09-27）で直したところ ─────────────────────────────────────
   ① %c で始まる行がすり抜けていました。
      ¹³ や ⁰⁹ は console.log('%c' + '[C12-Unifier]' + ...) の形で出します。
      頭の印が '[' で始まらないため、v2 の判定（^\[...）に当たらず、
      コンソールに全部出たままでした。前処理で %c を落としてから判定します。
   ② Notion 自身の定例ノイズ（Statsig / OPFS / 広告 / Cookie / 読み込み失敗）も
      まとめて捨てます。
   ──────────────────────────────────────────────────────────────────────────
   残るもの: エラー（console.error）は必ず通します。
   見たいとき: __qn3.all(1) で全部通す / 集計は __qn3.report()
   ※ どうしても消せないもの: ブラウザ自身が出す行（スクリプト読み込み失敗・
     CSP違反・Cookie 警告）。これはページ内の JavaScript からは触れません。
   ────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';
  if (window.__qn3) return;

  /* 家のスクリプトの印（前処理で %c を落とした後の文字列の頭に当てます） */
  var HOUSE = /^\[?(Cordivestium|C12-Unifier|C13|C16|¹⁶|²⁴|²⁵|QN|Constellucentia|Nozzle|Resource Sentinel|« No »)/;

  /* Notion 自身の定例ノイズ（v3.0.0 で追加） */
  var NOISE = [
    /\[Statsig\]/,
    /FeatureFlagTransactionQueue/,
    /OPFS|sqlite3_vfs/,
    /PageLoader:/,
    /^ai\.completionActions/,
    /messageStore\.internals/,
    /UserActorMembership/,
    /_cioid/,
    /^Cookie /,
    /Cookie 警告/,
    /cloudfront\.net|doubleclick\.net|googleadservices|googletagmanager|google-analytics/,
    /aif-production\.html/,
    /分離された Cookie/
  ];

  var PASS = [];            /* 名指しで通す名前（部分一致） */
  var stats = {};
  var showAll = false;

  function head(args) {
    /* 先頭 2 つの文字列のうち、中身のあるほうを使う。%c は落とす */
    for (var i = 0; i < 2 && i < args.length; i++) {
      var v = args[i];
      if (typeof v === 'string' && v) return v.replace(/%c/g, '').replace(/^[\s\u3000]+/, '');
    }
    return '';
  }
  function why(a) {
    if (HOUSE.test(a)) return 'house';
    for (var i = 0; i < NOISE.length; i++) if (NOISE[i].test(a)) return 'notion';
    return '';
  }
  function shouldDrop(args) {
    if (showAll) return false;
    var a = head(args);
    if (!a) return false;
    var w = why(a);
    if (!w) return false;
    for (var i = 0; i < PASS.length; i++) if (a.indexOf(PASS[i]) >= 0) return false;
    var key = w + ':' + a.slice(0, 28);
    stats[key] = (stats[key] || 0) + 1;
    return true;
  }

  ['log', 'info', 'debug', 'warn', 'trace'].forEach(function (k) {
    var orig = console[k];
    if (typeof orig !== 'function') return;
    try {
      console[k] = function () {
        if (shouldDrop(arguments)) return;      /* 転送せず、そのまま捨てます */
        return orig.apply(console, arguments);
      };
    } catch (e) {}
  });

  window.__qn3 = {
    version: '3.0.0',
    report: function () {
      var rows = Object.keys(stats).map(function (k) { return { 印: k, 捨てた行数: stats[k] }; })
        .sort(function (a, b) { return b.捨てた行数 - a.捨てた行数; });
      var total = rows.reduce(function (n, r) { return n + r.捨てた行数; }, 0);
      try { if (console.table) console.table(rows); } catch (e) {}
      console.error('[QN v3] 捨てた合計 ' + total + ' 行 / 通している名前 ' + (PASS.join(', ') || '（なし）'));
      return rows;
    },
    pass: function (part) { if (PASS.indexOf(part) < 0) PASS.push(String(part)); console.log('[QN v3] 通します: ' + part); return PASS.slice(); },
    clear: function () { PASS.length = 0; return '通す名前を全部やめました'; },
    all: function (on) { showAll = !!on; return showAll ? '全部表示（__qn3.all(0) で戻ります）' : '元に戻しました'; }
  };
})();
