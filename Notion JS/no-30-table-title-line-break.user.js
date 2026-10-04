// ==UserScript==
// @name         « No »　³⁰ _ Table Title Line Break
// @namespace    https://cordivestium.local/table-title-linebreak
// @version      1.1.0
// @description  v1.1.0: ギャラリー・ボード・リストのカードが崩れる不具合を修正（カードにまで表のセル用の「高さを中身に・はみ出し表示」を当てていた。カードは改行の折り返しだけに）。テーブルビューでもタイトルを改行できるように（本来はギャラリービューでしかできない裏ワザ）。題字のセルを編集中に ⇧Enter または ⌥Enter（Excel と同じ）で改行。改行を含むタイトルは、テーブル・リストでも折り返して表示する。編集欄へ直接入れられない時は Notion の API でタイトルに改行を書き込む。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/*
 * v1.0.0（2026-10-03）
 *   ・なぜテーブルでは改行できないのか:
 *       Notion のデータ（タイトル）は改行文字を持てる（ギャラリーのカードで改行すると、そのまま保存される）。
 *       テーブルの題字セルは ①Enter／⇧Enter を「確定」として扱う ②表示が white-space: nowrap／normal なので
 *       改行文字があっても 1 行に潰れる、の 2 点で使えないだけ。
 *   ・入力: 題字セルの編集中に ⇧Enter または ⌥Enter → その位置に改行（選んだ文字があれば置き換え）。
 *       1) まず編集欄に「文字の入力」として改行を入れる（Notion の編集の流れにそのまま乗る＝元に戻す ⌘Z も効く）
 *       2) 入らなかった時だけ、編集を確定してから API（saveTransactions）でタイトルに改行を差し込む
 *          （書く前に Notion のデータと画面の文字が一致するのを確かめる＝打ったばかりの文字を消さない）
 *   ・表示: 改行を含むタイトルの文字だけに印（data-c30-nl）を付け、折り返して表示（ほかのセルには触らない）。
 *       行の高さは中身に合わせて伸びる。テーブル・リスト・インラインDB・ピークの中も同じ。
 *   ・設定（コンソール）: __c30.keys('shift' | 'alt' | 'both')・__c30.off()・__c30.status()
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '1.1.0';
  const TAG = '[³⁰ v' + VERSION + ']';
  if (window.__c30 && window.__c30.version) { console.warn(TAG, '旧版 ' + window.__c30.version + ' が動いています'); return; }

  const KEY_PREF = 'c30.keys';
  let KEYS = 'both';
  try { KEYS = localStorage.getItem(KEY_PREF) || 'both'; } catch (e) { /* noop */ }

  const CELL = '.notion-table-view-cell, .notion-list-item, .notion-collection-item';
  const LEAF = '[contenteditable="true"]';
  const STYLE_ID = 'c30-css';
  const ST = { inserted: 0, viaApi: 0, failed: 0, lastError: '' };

  /* ───── 表示 ───── */
  function installCss() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = `
html [data-c30-nl="1"]:not(#c30a):not(#c30b):not(#c30c) {
  white-space: pre-wrap !important;
  overflow-wrap: anywhere !important;
  word-break: normal !important;
  text-overflow: clip !important;
}
html [data-c30-cell="1"]:not(#c30a):not(#c30b) { height: auto !important; max-height: none !important; overflow: visible !important; }
html [data-c30-cell="1"] [data-c30-up="1"]:not(#c30a):not(#c30b) {
  white-space: normal !important; overflow: visible !important; text-overflow: clip !important;
  height: auto !important; max-height: none !important; align-items: flex-start !important;
}
html [data-c30-row="1"]:not(#c30a) { height: auto !important; min-height: 0 !important; }
`;
    (document.head || document.documentElement).appendChild(st);
  }
  const setAttr = (el, k, v) => { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); };
  /* 改行を含む文字の入れ物に印。セル・行にも印（高さを中身に合わせる） */
  function markNode(tn) {
    const el = tn.parentElement;
    if (!el || el.closest('#c30-none')) return;
    const cell = el.closest(CELL);
    if (!cell) return;
    if (el.isContentEditable && el.closest('[role="dialog"]')) return;
    setAttr(el, 'data-c30-nl', '1');
    /* v1.1.0: 高さ・はみ出しを変えるのは表のセルだけ。ギャラリー・ボード・リストのカードは折り返しだけ
       （カードにも印を付けていたため、カードの高さと切り抜きが外れて見た目が崩れていた） */
    const tcell = el.closest('.notion-table-view-cell');
    if (!tcell) return;
    setAttr(tcell, 'data-c30-cell', '1');
    for (let p = el.parentElement; p && p !== tcell; p = p.parentElement) setAttr(p, 'data-c30-up', '1');
    const row = tcell.closest('.notion-collection-item, .notion-table-view-row');
    if (row && row !== tcell) setAttr(row, 'data-c30-row', '1');
  }
  function unmark(el) {
    el.removeAttribute('data-c30-nl');
  }
  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    root.querySelectorAll('[data-c30-cell]:not(.notion-table-view-cell), [data-c30-up]:not(.notion-table-view-cell *), [data-c30-row]:not(:has(.notion-table-view-cell))').forEach((el) => ['data-c30-cell', 'data-c30-up', 'data-c30-row'].forEach((a) => el.removeAttribute(a)));
    if (!root.closest(CELL) && !root.querySelector(CELL)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) if (n.nodeValue.includes('\n') && n.nodeValue.trim()) markNode(n);
    root.querySelectorAll('[data-c30-nl]').forEach((el) => { if (!el.textContent.includes('\n')) unmark(el); });
  }
  let mo = null;
  function watch() {
    if (mo) return;
    mo = new MutationObserver((recs) => {
      for (const r of recs) {
        if (r.type === 'characterData') {
          const t = r.target;
          if (t.nodeValue && t.nodeValue.includes('\n')) markNode(t);
          else if (t.parentElement && t.parentElement.hasAttribute('data-c30-nl')) unmark(t.parentElement);
          continue;
        }
        for (const nd of r.addedNodes) {
          if (nd.nodeType === 3) { if (nd.nodeValue.includes('\n') && nd.nodeValue.trim()) markNode(nd); }
          else if (nd.nodeType === 1) scan(nd);
        }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    scan(document.body);
  }

  /* ───── Notion の API ───── */
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
  async function getBlock(id) {
    const j = await apiPost('/api/v3/syncRecordValues', { requests: [{ table: 'block', id, version: -1 }] }).catch(() =>
      apiPost('/api/v3/syncRecordValues', { requests: [{ pointer: { table: 'block', id }, version: -1 }] }));
    return unwrap(j && j.recordMap && j.recordMap.block && j.recordMap.block[id]);
  }
  const titleText = (title) => (title || []).map((s) => String(s[0])).join('');
  /* タイトルの [s, e) を str に置き換える（飾りは前の文字のものを引き継ぐ） */
  function spliceTitle(title, s, e, str) {
    const out = [];
    let pos = 0, done = false;
    for (const seg of title || []) {
      const text = String(seg[0]);
      const ann = seg[1];
      const a = pos, b = pos + text.length;
      pos = b;
      if (b < s || a > e || (done && a >= e)) { out.push(seg.slice()); continue; }
      const head = text.slice(0, Math.max(0, s - a));
      const tail = text.slice(Math.max(0, Math.min(text.length, e - a)));
      let mid = '';
      if (!done && s >= a && s <= b) { mid = str; done = true; }
      const t = head + mid + tail;
      if (t) out.push(ann ? [t, ann] : [t]);
    }
    if (!done) out.push([str]);
    return out;
  }

  /* ───── 入力 ───── */
  function isTitleCell(leaf) {
    const cell = leaf.closest('.notion-table-view-cell');
    if (!cell) return false;
    if (cell.matches('[data-c12-primary]') || cell.querySelector('.cordivestium-v1121-title-value')) return true;
    const ph = (leaf.getAttribute('placeholder') || leaf.getAttribute('aria-placeholder') || '');
    if (/untitled|無題|new page|新規ページ/i.test(ph)) return true;
    return !!cell.querySelector('.notion-record-icon') || !!cell.querySelector('a[href]');
  }
  function rowIdOf(el) {
    const row = el.closest('[data-block-id]');
    return row ? row.getAttribute('data-block-id') : '';
  }
  function caretOffsets(leaf) {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const r = sel.getRangeAt(0);
    if (!leaf.contains(r.startContainer) || !leaf.contains(r.endContainer)) return null;
    const pre = document.createRange();
    pre.selectNodeContents(leaf);
    pre.setEnd(r.startContainer, r.startOffset);
    const s = pre.toString().length;
    pre.setEnd(r.endContainer, r.endOffset);
    const e = pre.toString().length;
    return { s, e };
  }
  function keyMatch(e) {
    if (KEYS === 'none' || e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return false;
    if (e.metaKey || e.ctrlKey) return false;
    if (e.shiftKey && !e.altKey) return KEYS !== 'alt';
    if (e.altKey && !e.shiftKey) return KEYS !== 'shift';
    return false;
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function toast(msg) {
    let t = document.getElementById('c30-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'c30-toast';
      t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483647;padding:8px 14px;border-radius:8px;background:rgba(15,15,15,.88);color:#fff;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.2);pointer-events:none;transition:opacity .2s';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.style.opacity = '0'; }, 2600);
  }

  async function insertBreak(leaf) {
    const off = caretOffsets(leaf);
    if (!off) return;
    const before = leaf.textContent;
    /* 1) 編集欄にそのまま入れる */
    let ok = false;
    try { ok = document.execCommand('insertText', false, '\n'); } catch (e) { ok = false; }
    await sleep(60);
    const now = leaf.isConnected ? leaf.textContent : '';
    if (ok && now.length === before.length - (off.e - off.s) + 1 && now.charAt(off.s) === '\n') {
      ST.inserted++;
      const tn = [...leaf.childNodes].find((n) => n.nodeType === 3 && n.nodeValue.includes('\n'));
      if (tn) markNode(tn);
      return;
    }
    /* 2) API で差し込む */
    const id = rowIdOf(leaf);
    if (!id) { ST.failed++; toast('この行のページが分かりませんでした'); return; }
    const text = now && now !== before ? now : before;
    /* 編集を確定（Esc）してから書く */
    try { leaf.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true, cancelable: true })); } catch (e) { /* noop */ }
    try {
      let rec = null;
      for (let i = 0; i < 8; i++) {
        rec = await getBlock(id);
        if (rec && titleText(rec.properties && rec.properties.title) === before) break;
        await sleep(300);
      }
      if (!rec) throw new Error('ページを読み取れませんでした');
      const title = (rec.properties && rec.properties.title) || [];
      const cur = titleText(title);
      if (cur !== before && cur !== text) throw new Error('Notion への保存がまだ終わっていません（少し待ってもう一度）');
      const after = spliceTitle(title, off.s, off.e, '\n');
      const space = rec.space_id;
      const ptr = { table: 'block', id, spaceId: space };
      await apiPost('/api/v3/saveTransactions', {
        requestId: uuid(),
        transactions: [{ id: uuid(), spaceId: space, debug: { userAction: 'c30.titleLineBreak' }, operations: [
          { pointer: ptr, path: ['properties', 'title'], command: 'set', args: after },
          { pointer: ptr, path: [], command: 'update', args: { last_edited_time: Date.now() } }
        ] }]
      }, space);
      ST.viaApi++;
      toast('改行を入れました');
    } catch (e) {
      ST.failed++; ST.lastError = String(e && e.message || e);
      console.warn(TAG, e);
      toast('改行を入れられませんでした: ' + ST.lastError);
    }
  }

  function onKey(e) {
    if (!keyMatch(e)) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    const leaf = t.closest(LEAF);
    if (!leaf || !isTitleCell(leaf)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    insertBreak(leaf);
  }
  /* keyup / keypress でも Notion に Enter を渡さない（確定されないように） */
  function onKeyEcho(e) {
    if (!keyMatch(e)) return;
    const t = e.target;
    const leaf = t instanceof Element ? t.closest(LEAF) : null;
    if (leaf && isTitleCell(leaf)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }
  function onBeforeInput(e) {
    /* ⇧Enter が insertLineBreak として届いた時（キーの横取りに負けた場合）の保険 */
    if (e.inputType !== 'insertLineBreak' && e.inputType !== 'insertParagraph') return;
    const t = e.target;
    const leaf = t instanceof Element ? t.closest(LEAF) : null;
    if (!leaf || !isTitleCell(leaf)) return;
    if (!onBeforeInput.armed) return;
    e.preventDefault(); e.stopImmediatePropagation();
  }

  window.addEventListener('keydown', (e) => { onBeforeInput.armed = keyMatch(e); onKey(e); }, true);
  window.addEventListener('keypress', onKeyEcho, true);
  window.addEventListener('keyup', (e) => { onKeyEcho(e); onBeforeInput.armed = false; }, true);
  window.addEventListener('beforeinput', onBeforeInput, true);

  const boot = () => { installCss(); watch(); };
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot, { once: true });

  window.__c30 = {
    version: VERSION,
    status: () => Object.assign({ keys: KEYS, marked: document.querySelectorAll('[data-c30-nl]').length }, ST),
    keys(k) { if (['shift', 'alt', 'both'].includes(k)) { KEYS = k; try { localStorage.setItem(KEY_PREF, k); } catch (e) { /* noop */ } } return KEYS; },
    rescan() { scan(document.body); return document.querySelectorAll('[data-c30-nl]').length; },
    off() {
      if (mo) mo.disconnect();
      document.querySelectorAll('[data-c30-nl],[data-c30-cell],[data-c30-up],[data-c30-row]').forEach((el) => ['data-c30-nl', 'data-c30-cell', 'data-c30-up', 'data-c30-row'].forEach((a) => el.removeAttribute(a)));
      const st = document.getElementById(STYLE_ID); if (st) st.remove();
      KEYS = 'none';
      return 'stopped';
    },
    _spliceTitle: spliceTitle
  };
})();