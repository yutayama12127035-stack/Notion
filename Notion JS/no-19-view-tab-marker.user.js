// ==UserScript==
// @name         « No »　¹⁹ _ View Tab Marker
// @namespace    constellucentia
// @version      2.0.0
// @description  旧 ¹⁹ View Render Guard の置き換え。DBビューのタブに区切り線用の目印（data-c19-tab）を描画前に付けるだけ。旧版の「ずれを見つけたら resize を発火して全スクリプトに測り直させる回復処理」は、タブ切替バグの原因だったので削除（位置は ⁰⁵ Layout Lock が CSS で固定）。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '2.0.0';
  const LS_OFF = 'c19-off';
  const TAB_BTN = '.notion-collection-view-tab-button';
  const A_TAB = 'data-c19-tab';
  const A_LIST = 'data-c19-tablist';

  let enabled = localStorage.getItem(LS_OFF) !== '1';
  let marks = 0;

  function itemOf(btn, list) {
    let el = btn;
    while (el.parentElement && el.parentElement !== list) {
      const p = el.parentElement;
      if (p.querySelectorAll(TAB_BTN).length > 1) return el;
      el = p;
    }
    return el;
  }

  function mark() {
    if (!enabled) return;
    for (const list of document.querySelectorAll('[role="tablist"]')) {
      const btns = list.querySelectorAll(TAB_BTN);
      if (!btns.length) continue;
      if (!list.hasAttribute(A_LIST)) list.setAttribute(A_LIST, '1');
      const items = [];
      for (const b of btns) {
        const it = itemOf(b, list);
        if (!items.includes(it)) items.push(it);
      }
      items.forEach((it, i) => {
        const v = String(i);
        if (it.getAttribute(A_TAB) !== v) { it.setAttribute(A_TAB, v); marks++; }
      });
      for (const old of list.querySelectorAll('[' + A_TAB + ']')) {
        if (!items.includes(old)) old.removeAttribute(A_TAB);
      }
    }
  }
  function unmarkAll() {
    for (const el of document.querySelectorAll('[' + A_TAB + '], [' + A_LIST + ']')) {
      el.removeAttribute(A_TAB);
      el.removeAttribute(A_LIST);
    }
  }

  /* MutationObserver のコールバックは描画前に同期実行 → 区切り線がちらつかない */
  const mo = new MutationObserver(recs => {
    for (const r of recs) {
      if (r.addedNodes.length || r.removedNodes.length) { mark(); return; }
    }
  });
  const startObserver = () => { mo.observe(document.documentElement, { childList: true, subtree: true }); mark(); };
  if (enabled) startObserver();

  window.__c19 = {
    version: VERSION,
    status: () => ({ version: VERSION, enabled, marks, tablists: document.querySelectorAll('[' + A_LIST + ']').length }),
    on: (v = true) => {
      enabled = !!v;
      localStorage.setItem(LS_OFF, enabled ? '0' : '1');
      if (enabled) startObserver(); else { mo.disconnect(); unmarkAll(); }
      return enabled ? 'ON' : 'OFF（区切り線は ¹⁷ の予備セレクタで描かれます）';
    }
  };
})();
