// ==UserScript==
// @name         « No »　¹⁹ _ View Tab Marker
// @namespace    constellucentia
// @version      2.1.0
// @description  v2.1.0: ³³ 194 の索引帯（タブの並び [data-c194-band]。CSS の order で回し、入りきらないタブは data-c194-off で隠す）の間だけ、目印の番号を「見えているタブの見た目の順」で付ける（先頭に見えるタブが 0＝区切り線なし。隠れたタブは後ろに続けて 0 にしない）。帯の付け外し・隠す印・並びの style（#c194-order）が変わった時も付け直す。帯が無い時は今までどおり DOM の順。旧 ¹⁹ View Render Guard の置き換え。DBビューのタブに区切り線用の目印（data-c19-tab）を描画前に付けるだけ。旧版の「ずれを見つけたら resize を発火して全スクリプトに測り直させる回復処理」は、タブ切替バグの原因だったので削除（位置は ⁰⁵ Layout Lock が CSS で固定）。
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

  const VERSION = '2.1.0';
  const LS_OFF = 'c19-off';
  const TAB_BTN = '.notion-collection-view-tab-button';
  const A_TAB = 'data-c19-tab';
  const A_LIST = 'data-c19-tablist';
  /* v2.1.0: ³³ 194 の索引帯の印（帯のタブの並び・各タブの箱・入りきらずに隠したタブ）。並びは <style id="c194-order"> の order */
  const A_BAND = 'data-c194-band';
  const A_IT = 'data-c194-it';
  const A_OFF = 'data-c194-off';

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

  /* v2.1.0: 帯の時だけ、見えているタブを見た目の順（計算後の order → DOM の順）に並べ直す。
     隠れているタブ（data-c194-off・display:none・visibility:hidden）はその後ろ（0 にしない＝先頭の区切り線を持たない。
     隠れていても番号の 0 / 0 以外が変わらないので、区切り線の幅で ³³ の「入りきるか」の判定が揺れない） */
  function visualOrder(items) {
    const rows = items.map((it, i) => {
      const box = it.closest('[' + A_IT + ']') || it;
      let order = 0, hidden = box.hasAttribute(A_OFF) || it.hasAttribute(A_OFF);
      try {
        const cs = getComputedStyle(box);
        order = parseFloat(cs.order) || 0;
        if (cs.display === 'none' || cs.visibility === 'hidden') hidden = true;
      } catch (e) { /* noop */ }
      return { it, i, order, hidden };
    });
    rows.sort((a, b) => (a.hidden - b.hidden) || (a.order - b.order) || (a.i - b.i));
    return rows.map((r) => r.it);
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
      /* v2.1.0: ³³ の索引帯の間は見た目の順。帯が無い時は今までどおり DOM の順 */
      const ordered = list.hasAttribute(A_BAND) ? visualOrder(items) : items;
      ordered.forEach((it, i) => {
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

  /* MutationObserver のコールバックは描画前に同期実行 → 区切り線がちらつかない
     v2.1.0: ³³ の索引帯の印（帯・タブの箱・隠す印）の付け外しも見る（属性なので childList では届かない）。
     並びの <style id="c194-order"> の書き換えは childList で届く */
  const mo = new MutationObserver(recs => {
    for (const r of recs) {
      if (r.type === 'attributes' || r.addedNodes.length || r.removedNodes.length) { mark(); return; }
    }
  });
  const startObserver = () => { mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: [A_BAND, A_IT, A_OFF] }); mark(); };
  if (enabled) startObserver();

  window.__c19 = {
    version: VERSION,
    status: () => ({ version: VERSION, enabled, marks, tablists: document.querySelectorAll('[' + A_LIST + ']').length, bands: document.querySelectorAll('[' + A_LIST + '][' + A_BAND + ']').length }),
    on: (v = true) => {
      enabled = !!v;
      localStorage.setItem(LS_OFF, enabled ? '0' : '1');
      if (enabled) startObserver(); else { mo.disconnect(); unmarkAll(); }
      return enabled ? 'ON' : 'OFF（区切り線は ¹⁷ の予備セレクタで描かれます）';
    }
  };
})();
