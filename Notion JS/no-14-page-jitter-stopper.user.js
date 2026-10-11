// ==UserScript==
// @name         « No »　¹⁴ _ Page Jitter Stopper
// @namespace    constellucentia
// @version      1.3.0
// @description  通常ページの左右ガクガクを止める（DBフルページ・サイドバーは対象外）。① スクロール枠 scrollbar-gutter: stable ② .layout の transition 停止 ③ ページタイトル(h1)の文字幅/左端/計算フォントを実測 ④ タイトルの計算フォントが往復したら、その場の値でタイトルだけ固定。v1.3.0: 通常ページの印は描画前に同期で付け外し（DBページへ移った時に gutter が残って幅が変わる不具合を修正）。書き手調査のフック・監視は調査モード（__c14.debug(true)）の時だけ。常時の計測ループは撤去・DBページでは計測しない。
// @match        *://www.notion.so/*
// @match        *://app.notion.so/*
// @match        *://www.notion.com/*
// @match        *://app.notion.com/*
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '1.3.0';
  const LS_KEY = 'c14-settings';
  const LS_DEBUG = 'c14-debug';
  const TAG = 'data-c14-page';
  const STYLE_ID = 'c14-style';
  const ROOT_SEL = '[data-content-editable-root="true"]';
  const PAGE_MARK = '.notion-page-content';
  const TITLE_SEL = 'h1[aria-roledescription="page title"]';
  const PAGE_TITLE_SEL = `.notion-scroller[${TAG}] ${TITLE_SEL}`;
  const LEAF_SEL = '[data-content-editable-leaf="true"]';
  const SELF = 'Page Jitter Stopper';
  const UNKNOWN = '(不明・DOM監視で検出)';
  const SHAKE_PX = 0.5, SHAKE_FLIPS = 3, WINDOW = 1000, SAMPLE_MS = 1500;
  const LOG_MAX = 60, FLOG_MAX = 400, REPORT_GAP = 5000;
  const FONT_RE = /font|letter-spacing|word-spacing|line-height/i;
  const PART_RE = /^\s*(font|letter-spacing|word-spacing|line-height|padding)/i;
  const PIN_PROPS = ['font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch',
    'letter-spacing', 'word-spacing', 'line-height', 'font-kerning', 'font-optical-sizing',
    'font-feature-settings', 'font-variation-settings', 'padding-inline-start', 'padding-inline-end'];
  const INLINE_PROPS = ['font', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch',
    'font-variant', 'font-kerning', 'font-synthesis', 'font-optical-sizing', 'font-size-adjust',
    'font-feature-settings', 'font-variation-settings', 'letter-spacing', 'word-spacing', 'line-height',
    'padding', 'padding-inline', 'padding-inline-start', 'padding-inline-end', 'padding-left', 'padding-right'];
  const INLINE_SET = new Set(INLINE_PROPS);

  /* v1.3.0: 書き手調査（フック・属性/シート監視・記録）は調査モードの時だけ */
  const DEBUG = (() => { try { return localStorage.getItem(LS_DEBUG) === '1'; } catch { return false; } })();

  // ---------- 設定 ----------
  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } })();
  const S = {
    enabled: saved.enabled !== false,
    gutter: saved.gutter !== false,
    noAnim: saved.noAnim !== false,
    pinMode: saved.pinMode === 'off' ? 'off' : 'auto',
    pin: null, pinHref: '', pinFail: false,
    shakes: 0, lastShake: null, lastReport: 0,
    log: [], flog: [], samples: [], probes: [], probeKey: '', watch: null,
    title: null, moTitle: null
  };
  const save = () => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ enabled: S.enabled, gutter: S.gutter, noAnim: S.noAnim, pinMode: S.pinMode })); } catch {}
  };
  const r1 = v => Math.round(v * 10) / 10;
  const short = (s, n = 90) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n) + '…' : s; };
  let busy = false;

  // ---------- CSS ----------
  let styleEl = null;
  function pinCss() {
    if (!S.pin) return '';
    const sel = `.notion-scroller[${TAG}] ${TITLE_SEL}:not(#c14-a):not(#c14-b)`;
    let body = '';
    for (const p of PIN_PROPS) { const v = S.pin.vals[p]; if (v) body += `${p}:${v} !important;`; }
    return `${sel}{${body}}\n`;
  }
  function buildCss() {
    if (!S.enabled) return '';
    let c = '';
    if (S.gutter) c += `.notion-scroller[${TAG}]{scrollbar-gutter:stable !important;}\n`;
    if (S.noAnim) {
      c += `${ROOT_SEL}[${TAG}] > .layout,\n` +
           `${ROOT_SEL}[${TAG}] > .layout > .layout-full > .content-editable-void-no-select{` +
           `transition-property:none !important;transition-duration:0s !important;}\n`;
    }
    c += pinCss();
    return c;
  }
  function writeStyle() {
    busy = true;
    try {
      if (!styleEl || !styleEl.isConnected) {
        const parent = document.head || document.documentElement;
        if (!parent) return;
        styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        parent.appendChild(styleEl);
      }
      const c = buildCss();
      if (styleEl.textContent !== c) styleEl.textContent = c;
    } finally { busy = false; }
  }

  // ---------- タイトルと関係する要素（通常ページのタイトルだけ） ----------
  let titleAt = 0;
  function curTitle(force) {
    if (S.title && S.title.isConnected && S.title.matches(PAGE_TITLE_SEL)) return S.title;
    const now = performance.now();
    if (!force && now - titleAt < 300) return null;
    titleAt = now;
    S.title = document.querySelector(PAGE_TITLE_SEL);
    return S.title;
  }
  function related(el) {
    if (!el || el.nodeType !== 1) return false;
    const t = curTitle();
    if (!t) return false;
    return el === t || t.contains(el) || el.contains(t);
  }

  // ---------- ラベル ----------
  function labelEl(el) {
    if (!el || el.nodeType !== 1) return '?';
    if (el === document.documentElement) return 'html';
    if (el === document.body) return 'body';
    if (el.matches(TITLE_SEL)) return 'ページタイトル(h1)';
    if (el.matches(ROOT_SEL)) return 'エディタ本体';
    if (el.matches(LEAF_SEL)) return 'テキスト行(' + short((el.textContent || '').trim(), 12) + ')';
    if (el.classList.contains('layout')) return 'layout';
    if (el.classList.contains('notion-scroller')) return 'スクロール枠';
    if (el.classList.contains('notion-frame')) return 'notion-frame';
    const cls = (typeof el.className === 'string' && el.className.trim()) ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return el.tagName.toLowerCase() + cls;
  }
  function labelRel(el) {
    const t = curTitle();
    if (el === t) return 'ページタイトル(h1)';
    if (t && t.contains(el)) return 'タイトル内 ' + labelEl(el);
    return '祖先 ' + labelEl(el);
  }
  function labelStyle(el) {
    if (el.id) return 'style#' + el.id;
    const cls = el.className ? '.' + String(el.className).split(/\s+/)[0] : '';
    return 'style' + cls + '（' + short((el.textContent || '').trim(), 30) + '）';
  }
  function sheetNodeLabel(n) { return n.nodeName === 'STYLE' ? labelStyle(n) : 'link ' + short(n.href, 60); }
  function sheetLabel(sh) {
    try { const o = sh.ownerNode; if (o) return sheetNodeLabel(o); } catch {}
    return '構築済みシート(adopted)';
  }
  const fontPart = txt => String(txt || '').split(';').map(s => s.trim()).filter(s => s && PART_RE.test(s.split(':')[0])).join('; ');
  function diffHint(a, b) {
    a = String(a || ''); b = String(b || '');
    let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return `${a.length}→${b.length}文字 …${b.slice(Math.max(0, i - 20), i + 60).replace(/\s+/g, ' ')}`;
  }

  // ---------- 書き手 ----------
  function whoWrote() {
    const lines = (new Error().stack || '').split('\n');
    for (let l of lines) {
      try { l = decodeURIComponent(l); } catch {}
      if (l.includes(SELF)) continue;
      const m = l.match(/([^\/\\@]*?\.user\.js)/);
      if (m) return m[1].replace(/^[^«]*(?=«)/, '').trim();
    }
    for (const l of lines) {
      if (l.includes(SELF)) continue;
      if (/notion\.(so|com)|_assets\//.test(l)) return 'Notion 本体';
    }
    return '不明';
  }

  // ---------- 記録（調査モードのみ） ----------
  function flog(row) {
    if (!DEBUG) return;
    S.flog.push(row);
    if (S.flog.length > FLOG_MAX) S.flog.splice(0, S.flog.length - FLOG_MAX);
  }
  function rec(kind, target, value, writer) {
    if (!DEBUG) return;
    flog({ 時刻ms: r1(performance.now()), 書き手: writer || whoWrote(), 対象: target, 種類: kind, 値: short(value), 直前: 0 });
    kick();
  }
  const recent = new WeakMap();
  function markRecent(el, name) {
    let m = recent.get(el); if (!m) { m = new Map(); recent.set(el, m); }
    m.set(name, performance.now());
  }
  function wasRecent(el, name) {
    const m = recent.get(el); const t = m && m.get(name);
    return t != null && performance.now() - t < 150;
  }

  // ---------- フック（調査モードのみ） ----------
  const CSD = CSSStyleDeclaration.prototype;
  const getPV = CSD.getPropertyValue;
  const owners = new WeakMap();
  const isInlineProp = p => INLINE_SET.has(p) || (p.startsWith('--') && /font|letter|typo|glyph|kern|weight|family/i.test(p));
  function declTarget(decl) {
    const el = owners.get(decl);
    if (el) return related(el) ? labelRel(el) : null;
    if (decl.parentRule) return 'CSSルール ' + short(decl.parentRule.selectorText || '', 50);
    return null;
  }
  function noteProp(decl, prop, v, kind) {
    if (busy || !S.enabled) return;
    try {
      prop = String(prop).trim();
      if (!prop.startsWith('--')) prop = prop.toLowerCase();
      if (!isInlineProp(prop)) return;
      const cur = String(getPV.call(decl, prop)).trim();
      const nv = v == null ? '' : String(v).trim();
      if (cur === nv) return;
      const label = declTarget(decl); if (!label) return;
      const el = owners.get(decl); if (el) markRecent(el, 'style');
      rec(kind, label, `${prop}: ${cur || '(なし)'} → ${nv || '(削除)'}`);
    } catch {}
  }
  function styleOf(node) {
    if (!node) return null;
    if (node.nodeName === 'STYLE') return node;
    if (node.nodeType === 3 && node.parentNode && node.parentNode.nodeName === 'STYLE') return node.parentNode;
    return null;
  }

  function installHooks() {
    const EP = Element.prototype, NP = Node.prototype;

    for (const proto of [HTMLElement.prototype, typeof SVGElement !== 'undefined' && SVGElement.prototype]) {
      try {
        if (!proto) continue;
        const d = Object.getOwnPropertyDescriptor(proto, 'style');
        if (!d || !d.get) continue;
        const g = d.get;
        Object.defineProperty(proto, 'style', { ...d, get() { const s = g.call(this); if (s && !owners.has(s)) owners.set(s, this); return s; } });
      } catch {}
    }
    try {
      const sp = CSD.setProperty, rp = CSD.removeProperty;
      CSD.setProperty = function (p, v, pri) { noteProp(this, p, v, 'setProperty'); return sp.call(this, p, v, pri); };
      CSD.removeProperty = function (p) { noteProp(this, p, '', 'removeProperty'); return rp.call(this, p); };
    } catch {}
    try {
      const probe = document.createElement('div').style;
      const camel = p => p.replace(/^-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      for (const dashed of INLINE_PROPS) {
        for (const name of [dashed, camel(dashed)]) {
          let o = Object.getPrototypeOf(probe), d = null, holder = null;
          while (o) { d = Object.getOwnPropertyDescriptor(o, name); if (d) { holder = o; break; } o = Object.getPrototypeOf(o); }
          if (!d || !d.set || d.set.__c14) continue;
          const s0 = d.set;
          const ns = function (v) { noteProp(this, dashed, v, 'style.' + name); return s0.call(this, v); };
          ns.__c14 = true;
          Object.defineProperty(holder, name, { ...d, set: ns });
        }
      }
    } catch {}
    try {
      const ctD = Object.getOwnPropertyDescriptor(CSD, 'cssText');
      if (ctD && ctD.set) {
        Object.defineProperty(CSD, 'cssText', {
          ...ctD,
          set(v) {
            if (!busy && S.enabled) {
              try {
                const label = declTarget(this);
                if (label) {
                  const a = fontPart(ctD.get.call(this)), b = fontPart(v);
                  if (a !== b) { const el = owners.get(this); if (el) markRecent(el, 'style'); rec('style.cssText', label, `${a || '(なし)'} → ${b || '(なし)'}`); }
                }
              } catch {}
            }
            return ctD.set.call(this, v);
          }
        });
      }
    } catch {}
    try {
      const sa = EP.setAttribute, ra = EP.removeAttribute, ta = EP.toggleAttribute;
      EP.setAttribute = function (n, v) {
        if (!busy && S.enabled) {
          try {
            if (related(this)) {
              const name = String(n).toLowerCase(), old = this.getAttribute(name), nv = String(v);
              if (old !== nv) {
                if (name === 'style') {
                  const a = fontPart(old), b = fontPart(nv);
                  if (a !== b) { markRecent(this, name); rec('setAttribute(style)', labelRel(this), `${a || '(なし)'} → ${b || '(なし)'}`); }
                } else { markRecent(this, name); rec(`setAttribute(${name})`, labelRel(this), `${short(old, 40)} → ${short(nv, 40)}`); }
              }
            }
          } catch {}
        }
        return sa.call(this, n, v);
      };
      EP.removeAttribute = function (n) {
        if (!busy && S.enabled) {
          try { const name = String(n).toLowerCase(); if (related(this) && this.hasAttribute(name)) { markRecent(this, name); rec(`removeAttribute(${name})`, labelRel(this), short(this.getAttribute(name), 60)); } } catch {}
        }
        return ra.call(this, n);
      };
      if (ta) EP.toggleAttribute = function (n) {
        if (!busy && S.enabled) { try { if (related(this)) { const name = String(n).toLowerCase(); markRecent(this, name); rec(`toggleAttribute(${name})`, labelRel(this), ''); } } catch {} }
        return ta.apply(this, arguments);
      };
    } catch {}
    try {
      const cnD = Object.getOwnPropertyDescriptor(EP, 'className');
      if (cnD && cnD.set) {
        Object.defineProperty(EP, 'className', {
          ...cnD,
          set(v) {
            try { if (!busy && S.enabled && related(this)) { const old = cnD.get.call(this); if (old !== String(v)) { markRecent(this, 'class'); rec('className', labelRel(this), `${short(old, 40)} → ${short(v, 40)}`); } } } catch {}
            return cnD.set.call(this, v);
          }
        });
      }
      const clD = Object.getOwnPropertyDescriptor(EP, 'classList');
      const tokOwner = new WeakMap();
      if (clD && clD.get) {
        Object.defineProperty(EP, 'classList', { ...clD, get() { const l = clD.get.call(this); if (l && !tokOwner.has(l)) tokOwner.set(l, this); return l; } });
      }
      const TP = DOMTokenList.prototype;
      const tAdd = TP.add, tRem = TP.remove, tTog = TP.toggle, tRep = TP.replace;
      const noteTok = (list, desc, changed) => {
        if (busy || !S.enabled || !changed) return;
        const el = tokOwner.get(list);
        if (!el || !related(el)) return;
        markRecent(el, 'class');
        rec('classList', labelRel(el), desc);
      };
      TP.add = function (...t) { try { noteTok(this, '+' + t.join(' +'), t.some(x => !this.contains(x))); } catch {} return tAdd.apply(this, t); };
      TP.remove = function (...t) { try { noteTok(this, '-' + t.join(' -'), t.some(x => this.contains(x))); } catch {} return tRem.apply(this, t); };
      TP.toggle = function (t, f) {
        try { const has = this.contains(t); const will = f === undefined ? !has : !!f; noteTok(this, (will ? '+' : '-') + t, will !== has); } catch {}
        return tTog.apply(this, arguments);
      };
      if (tRep) TP.replace = function (a, b) { try { noteTok(this, `${a} → ${b}`, this.contains(a)); } catch {} return tRep.apply(this, arguments); };
    } catch {}
    try {
      const tcD = Object.getOwnPropertyDescriptor(NP, 'textContent');
      const noteText = (node, v, kind) => {
        if (busy || !S.enabled) return;
        try {
          const st = styleOf(node);
          if (!st || st.id === STYLE_ID) return;
          const old = tcD.get.call(node) || '', nv = v == null ? '' : String(v);
          if (old === nv || (!FONT_RE.test(old) && !FONT_RE.test(nv))) return;
          markRecent(st, '#text');
          rec(kind, labelStyle(st), diffHint(old, nv));
        } catch {}
      };
      Object.defineProperty(NP, 'textContent', { ...tcD, set(v) { noteText(this, v, 'style.textContent'); return tcD.set.call(this, v); } });
      const ihD = Object.getOwnPropertyDescriptor(EP, 'innerHTML');
      if (ihD && ihD.set) Object.defineProperty(EP, 'innerHTML', { ...ihD, set(v) { if (this.nodeName === 'STYLE') noteText(

        this, v, 'style.innerHTML'); return ihD.set.call(this, v); } });
      const dD = Object.getOwnPropertyDescriptor(CharacterData.prototype, 'data');
      if (dD && dD.set) Object.defineProperty(CharacterData.prototype, 'data', { ...dD, set(v) { noteText(this, v, 'style 内テキスト.data'); return dD.set.call(this, v); } });
      const nvD = Object.getOwnPropertyDescriptor(NP, 'nodeValue');
      if (nvD && nvD.set) Object.defineProperty(NP, 'nodeValue', { ...nvD, set(v) { noteText(this, v, 'style 内テキスト.nodeValue'); return nvD.set.call(this, v); } });
    } catch {}
    try {
      const isSheetNode = n => n && n.nodeType === 1 && n.id !== STYLE_ID &&
        ((n.nodeName === 'STYLE' && FONT_RE.test(n.textContent || '')) || (n.nodeName === 'LINK' && /stylesheet/i.test(n.rel || '')));
      const noteIns = (parent, n) => {
        if (busy || !S.enabled || !n || typeof n !== 'object') return;
        try {
          if (n.nodeType === 11) { for (const c of n.childNodes) noteIns(parent, c); return; }
          if (isSheetNode(n)) { markRecent(n, '#present'); rec('シート追加', sheetNodeLabel(n), n.nodeName === 'STYLE' ? `${(n.textContent || '').length}文字` : ''); }
          else if (parent && parent.nodeName === 'STYLE' && parent.id !== STYLE_ID && n.nodeType === 3 && FONT_RE.test(n.data)) { markRecent(parent, '#text'); rec('style に文字追加', labelStyle(parent), short(n.data, 60)); }
        } catch {}
      };
      const noteRem = n => {
        if (busy || !S.enabled || !n || !n.isConnected) return;
        try { if (isSheetNode(n)) { markRecent(n, '#present'); rec('シート削除', sheetNodeLabel(n), ''); } } catch {}
      };
      const ac = NP.appendChild, ib = NP.insertBefore, rc = NP.removeChild, rm = EP.remove, ap = EP.append, pp = EP.prepend;
      NP.appendChild = function (n) { noteIns(this, n); return ac.call(this, n); };
      NP.insertBefore = function (n, r) { noteIns(this, n); return ib.call(this, n, r); };
      NP.removeChild = function (n) { noteRem(n); return rc.call(this, n); };
      EP.remove = function () { noteRem(this); return rm.call(this); };
      if (ap) EP.append = function (...ns) { for (const n of ns) noteIns(this, n); return ap.apply(this, ns); };
      if (pp) EP.prepend = function (...ns) { for (const n of ns) noteIns(this, n); return pp.apply(this, ns); };
    } catch {}
    try {
      const SP = CSSStyleSheet.prototype;
      const ir = SP.insertRule, dr = SP.deleteRule, rs = SP.replaceSync, rp = SP.replace;
      SP.insertRule = function (rule) {
        if (!busy && S.enabled) { try { if (FONT_RE.test(String(rule))) rec('insertRule', sheetLabel(this), rule); } catch {} }
        return ir.apply(this, arguments);
      };
      SP.deleteRule = function (i) {
        if (!busy && S.enabled) { try { const r = this.cssRules[i]; if (r && FONT_RE.test(r.cssText)) rec('deleteRule', sheetLabel(this), r.cssText); } catch {} }
        return dr.apply(this, arguments);
      };
      if (rs) SP.replaceSync = function (t) { if (!busy && S.enabled && FONT_RE.test(String(t))) rec('replaceSync', sheetLabel(this), `${String(t).length}文字`); return rs.apply(this, arguments); };
      if (rp) SP.replace = function (t) { if (!busy && S.enabled && FONT_RE.test(String(t))) rec('replace', sheetLabel(this), `${String(t).length}文字`); return rp.apply(this, arguments); };
    } catch {}
  }

  // ---------- DOM 監視（調査モードのみ） ----------
  const titleMO = new MutationObserver(recs => {
    for (const r of recs) {
      if (r.type !== 'attributes') continue;
      const el = r.target, name = r.attributeName;
      if (wasRecent(el, name)) continue;
      let ov = r.oldValue, nv = el.getAttribute(name);
      if (name === 'style') { ov = fontPart(ov); nv = fontPart(nv); if (ov === nv) continue; }
      if (ov === nv) continue;
      rec(`属性(${name})`, labelRel(el), `${short(ov || '(なし)', 40)} → ${short(nv || '(なし)', 40)}`, UNKNOWN);
    }
  });
  function attachTitle(t) {
    S.moTitle = t;
    if (!DEBUG) return;
    titleMO.disconnect();
    titleMO.observe(t, { attributes: true, attributeOldValue: true, subtree: true });
    for (let p = t.parentElement; p; p = p.parentElement) titleMO.observe(p, { attributes: true, attributeOldValue: true });
  }
  const sheetMO = new MutationObserver(recs => {
    for (const r of recs) {
      const st = styleOf(r.target);
      if (!st || st.id === STYLE_ID || wasRecent(st, '#text')) continue;
      rec('style の中身', labelStyle(st), short(st.textContent, 60), UNKNOWN);
    }
  });
  let sheetAttached = false;
  function attachSheets() {
    if (!DEBUG || sheetAttached || !document.head) return;
    sheetMO.observe(document.head, { childList: true, subtree: true, characterData: true });
    sheetAttached = true;
  }

  // ---------- 幅の記録（__c14.log()） ----------
  const lastW = new WeakMap();
  const ro = new ResizeObserver(ents => {
    const t = r1(performance.now());
    for (const e of ents) {
      const el = e.target;
      if (!el.isConnected || !el.hasAttribute(TAG)) continue;
      const w = r1(el.clientWidth), p = lastW.get(el);
      if (p === w) continue;
      lastW.set(el, w);
      if (p !== undefined) {
        S.log.push({ 時刻ms: t, 対象: labelEl(el), 種類: '幅(clientWidth)', 前: p, 後: w });
        if (S.log.length > LOG_MAX) S.log.splice(0, S.log.length - LOG_MAX);
        kick();
      }
    }
  });

  // ---------- v1.3.0: 通常ページの印（描画前に同期で付け外し） ----------
  const roots = new Set();
  function markSync() {
    busy = true;
    try {
      const want = new Set();
      for (const root of document.querySelectorAll(ROOT_SEL)) {
        if (!root.querySelector(PAGE_MARK)) continue;
        if (root.closest('.notion-collection_view_page-block, .notion-peek-renderer')) continue;
        want.add(root);
        const sc = root.closest('.notion-scroller');
        if (sc) want.add(sc);
      }
      for (const el of document.querySelectorAll(`[${TAG}]`)) {
        if (!want.has(el)) { el.removeAttribute(TAG); roots.delete(el); try { ro.unobserve(el); } catch {} }
      }
      for (const el of want) {
        if (!el.hasAttribute(TAG)) el.setAttribute(TAG, '1');
        if (el.matches(ROOT_SEL) && !roots.has(el)) {
          roots.add(el);
          lastW.set(el, r1(el.clientWidth));
          ro.observe(el);
          const sc = el.closest('.notion-scroller');
          if (sc) { lastW.set(sc, r1(sc.clientWidth)); ro.observe(sc); }
        }
      }
    } finally { busy = false; }
  }
  function scan() {
    markSync();
    const t = curTitle(true);
    if (t && t !== S.moTitle) { attachTitle(t); kick(); }
    attachSheets();
    checkHref();
    writeStyle();
  }
  let scanTimer = 0;
  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(() => { scanTimer = 0; try { scan(); } catch (e) { console.warn('[Cordivestium] ¹⁴ error', e); } }, 200);
  }

  // ---------- 実測（通常ページのみ・きっかけがある時だけ） ----------
  let sampleUntil = 0, rafId = 0;
  function kick(ms = SAMPLE_MS) {
    if (!S.watch && !mainRoot()) return;          // DBページでは測らない
    sampleUntil = Math.max(sampleUntil, performance.now() + ms);
    if (!rafId) rafId = requestAnimationFrame(tick);
  }
  function mainRoot() {
    for (const r of roots) {
      if (!r.isConnected) { roots.delete(r); continue; }
      const b = r.getBoundingClientRect();
      if (b.width > 2 && b.height > 2) return r;
    }
    return null;
  }
  function probes() {
    if (S.probes.length && S.probes.every(p => p.isConnected)) return S.probes;
    const list = [];
    const title = curTitle(true);
    if (title && title.textContent.trim()) list.push(title);
    const root = mainRoot();
    if (root) for (const l of root.querySelectorAll(LEAF_SEL)) { if (l !== title && l.textContent.trim()) { list.push(l); break; } }
    S.probes = list;
    return list;
  }
  function measureText(el) {
    const r = document.createRange();
    r.selectNodeContents(el);
    const b = r.getBoundingClientRect();
    const c = getComputedStyle(el);
    const vals = {};
    for (const p of PIN_PROPS) vals[p] = c.getPropertyValue(p);
    const sig = PIN_PROPS.map(p => vals[p]).join('|');
    const brief = `${short(vals['font-family'], 40)} / ${vals['font-size']} / ${vals['font-weight']} / 字間 ${vals['letter-spacing']} / 左余白 ${vals['padding-inline-start']}`;
    return { name: labelEl(el), isTitle: el.matches(TITLE_SEL), w: b.width, l: b.left, sig, vals, brief };
  }
  function flipsOf(arr, get) {
    let f = 0, dir = 0, lo = Infinity, hi = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      const v = get(arr[i]); if (v == null) continue;
      lo = Math.min(lo, v); hi = Math.max(hi, v);
      if (!i) continue;
      const pv = get(arr[i - 1]); if (pv == null) continue;
      const d = v - pv;
      if (Math.abs(d) < SHAKE_PX) continue;
      const s = Math.sign(d);
      if (dir && s !== dir) f++;
      dir = s;
    }
    return { flips: f, lo, hi, amp: hi === -Infinity ? 0 : hi - lo };
  }
  function fontChanges(arr, i, since = -Infinity) {
    let n = 0; const seen = new Set();
    for (let k = 0; k < arr.length; k++) {
      if (arr[k].t < since) continue;
      const p = arr[k].p[i]; if (!p) continue;
      seen.add(p.sig);
      if (k && arr[k - 1].p[i] && arr[k - 1].t >= since && arr[k - 1].p[i].sig !== p.sig) n++;
    }
    return { n, seen };
  }

  // ---------- 固定 ----------
  function candidates(arr, i) {
    const root = mainRoot();
    const def = root ? getComputedStyle(root).fontFamily : '';
    const m = new Map();
    for (const s of arr) {
      const p = s.p[i]; if (!p) continue;
      let c = m.get(p.sig);
      if (!c) { c = { sig: p.sig, vals: p.vals, brief: p.brief, frames: 0, custom: p.vals['font-family'] !== def }; m.set(p.sig, c); }
      c.frames++;
    }
    return [...m.values()].sort((a, b) => (b.custom - a.custom) || (b.frames - a.frames));
  }
  function setPin(list, idx) {
    const c = list[idx];
    S.pin = { sig: c.sig, vals: c.vals, brief: c.brief, list, idx, at: performance.now() };
    S.pinHref = location.href;
    S.pinFail = false;
    writeStyle();
  }
  function maybePin(arr, i) {
    if (S.pinMode !== 'auto' || S.pin || !S.enabled) return;
    const list = candidates(arr, i);
    if (list.length < 2) return;
    setPin(list, 0);
    console.warn(`[Cordivestium] ¹⁴ タイトルのフォント往復を検出 → 固定しました:\n  ${S.pin.brief}\n  もう一方: ${list[1].brief}\n  逆: __c14.pin('next') / やめる: __c14.pin('off')`);
  }
  function checkPin(arr, i, now) {
    if (!S.pin || S.pinFail || now - S.pin.at < WINDOW) return;
    if (fontChanges(arr, i, S.pin.at + 300).n >= SHAKE_FLIPS) {
      S.pinFail = true;
      console.warn('[Cordivestium] ¹⁴ 固定しても揺れが止まりません。__c14.debug(true) → リロード → __c14.who() の結果を送ってください。');
    }
  }
  function checkHref() {
    if (S.pin && location.href !== S.pinHref) { S.pin = null; S.pinFail = false; writeStyle(); }
  }

  function tick(now) {
    rafId = 0;
    checkHref();
    const root = mainRoot();
    if (!root && !S.watch) { S.samples.length = 0; return; }
    const ps = probes();
    const key = ps.map(labelEl).join('|');
    if (key !== S.probeKey) { S.probeKey = key; S.samples.length = 0; }
    const s = { t: now, x: root ? root.getBoundingClientRect().left : null, p: ps.map(measureText) };
    const arr = S.samples;
    const prev = arr[arr.length - 1];
    arr.push(s);
    while (arr.length && now - arr[0].t > WINDOW) arr.shift();

    if (DEBUG && prev) {
      for (let i = 0; i < s.p.length; i++) {
        const a = prev.p[i], b = s.p[i];
        if (!a || !b || a.sig === b.sig) continue;
        for (let k = S.flog.length - 1; k >= 0; k--) {
          const r = S.flog[k];
          if (r.時刻ms < prev.t - 1) break;
          if (String(r.種類).startsWith('結果')) continue;
          r.直前 = (r.直前 || 0) + 1;
        }
        flog({ 時刻ms: r1(now), 書き手: '—', 対象: b.name, 種類: '結果: 計算フォントが変化', 値: short(b.brief), 直前: 0 });
      }
    }

    const box = flipsOf(arr, a => a.x);
    if (box.flips >= SHAKE_FLIPS) report('本文の箱', r1(box.amp), box.flips);
    for (let i = 0; i < s.p.length; i++) {
      const w = flipsOf(arr, a => a.p[i] && a.p[i].w);
      const l = flipsOf(arr, a => a.p[i] && a.p[i].l);
      const fc = fontChanges(arr, i);
      if (w.flips >= SHAKE_FLIPS || l.flips >= SHAKE_FLIPS || (fc.n >= SHAKE_FLIPS && fc.seen.size >= 2)) {
        report(s.p[i].name, r1(Math.max(w.amp, l.amp)), Math.max(w.flips, l.flips, fc.n));
      }
      if (s.p[i].isTitle) {
        if (fc.n >= SHAKE_FLIPS && fc.seen.size >= 2) maybePin(arr, i);
        checkPin(arr, i, now);
      }
    }
    if (S.watch) { S.watch.rows.push(s); if (S.watch.rows.length > 1200) S.watch.rows.shift(); }
    if (performance.now() < sampleUntil || S.watch) rafId = requestAnimationFrame(tick);
  }
  function report(what, amp, flips) {
    const now = performance.now();
    S.shakes++;
    S.lastShake = { 対象: what, 振れ幅px: amp, 反転回数: flips, 時刻ms: r1(now) };
    if (now - S.lastReport < REPORT_GAP) return;
    S.lastReport = now;
    console.warn(`[Cordivestium] ¹⁴ 揺れを検出: ${what} / 振れ幅 ${amp}px / 1秒で ${flips} 回。` + (DEBUG ? '__c14.who() で確認できます。' : '書き手を調べるには __c14.debug(true) → リロード。'));
  }

  try {
    document.fonts.addEventListener('loadingdone', e => {
      const fam = [...(e.fontfaces || [])].map(f => f.family).join(', ');
      flog({ 時刻ms: r1(performance.now()), 書き手: 'ブラウザ(フォント読込)', 対象: 'document.fonts', 種類: 'loadingdone', 値: short(fam), 直前: 0 });
      kick();
    });
  } catch {}

  // ---------- 公開 API ----------
  function whoTable(sec) {
    const since = performance.now() - sec * 1000;
    const g = new Map();
    for (const r of S.flog) {
      if (r.時刻ms < since || String(r.種類).startsWith('結果')) continue;
      const k = r.書き手 + '\u0000' + r.対象 + '\u0000' + r.種類;
      let o = g.get(k);
      if (!o) { o = { 書き手: r.書き手, 対象: r.対象, 種類: r.種類, 回数: 0, 'フォント変化の直前': 0, 最後の値: '' }; g.set(k, o); }
      o.回数++;
      o['フォント変化の直前'] += r.直前 || 0;
      o.最後の値 = r.値;
    }
    return [...g.values()].sort((a, b) => (b['フォント変化の直前'] - a['フォント変化の直前']) || (b.回数 - a.回数));
  }
  const api = {
    version: VERSION,
    state() {
      const root = mainRoot();
      const sc = root && root.closest('.notion-scroller');
      return {
        version: VERSION, 調査モード: DEBUG,
        有効: S.enabled, スクロールバー欄固定: S.gutter, アニメ停止: S.noAnim,
        タイトル固定モード: S.pinMode, タイトル固定中: S.pin ? S.pin.brief : 'なし', 固定の失敗: S.pinFail,
        対象ページ: roots.size, 印の数: document.querySelectorAll(`[${TAG}]`).length,
        本文左端: root ? r1(root.getBoundingClientRect().left) : null,
        本文幅: root ? r1(root.clientWidth) : null,
        枠幅: sc ? r1(sc.clientWidth) : null,
        揺れ検出回数: S.shakes, 最後の揺れ: S.lastShake
      };
    },
    log(n = 30) { const rows = S.log.slice(-n); console.table(rows); return rows; },
    fonts(n = 40) { const rows = S.flog.slice(-n); console.table(rows.length ? rows : [{ 結果: DEBUG ? '記録なし' : '調査モード OFF（__c14.debug(true) → リロード）' }]); return rows; },
    who(sec = 10) { const rows = whoTable(sec); console.table(rows.length ? rows : [{ 結果: DEBUG ? 'この間の書き換えは記録されていません' : '調査モード OFF（__c14.debug(true) → リロード）' }]); return rows; },
    clear() { S.log.length = 0; S.flog.length = 0; S.shakes = 0; S.lastShake = null; return 'クリアしました'; },
    watch(sec = 5) {
      S.watch = { rows: [] };
      sampleUntil = performance.now() + sec * 1000;
      if (!rafId) rafId = requestAnimationFrame(tick);
      setTimeout(() => {
        const w = S.watch; S.watch = null;
        if (!w || !w.rows.length) { console.table([{ 結果: '測定できませんでした（通常ページが開いていない？）' }]); return; }
        const rows = w.rows, out = [];
        const box = flipsOf(rows, a => a.x);
        out.push({ 対象: '本文の箱(左端)', 最小: r1(box.lo), 最大: r1(box.hi), 振れ幅px: r1(box.amp), 反転: box.flips, 判定: box.flips >= SHAKE_FLIPS ? '揺れている' : '止まっている' });
        const n = Math.max(...rows.map(r => r.p.length));
        for (let i = 0; i < n; i++) {
          const any = rows.find(r => r.p[i]);
          const name = any ? any.p[i].name : '文字' + i;
          const wd = flipsOf(rows, a => a.p[i] && a.p[i].w);
          const lf = flipsOf(rows, a => a.p[i] && a.p[i].l);
          const fc = fontChanges(rows, i);
          const shaking = wd.flips >= SHAKE_FLIPS || lf.flips >= SHAKE_FLIPS || fc.n >= SHAKE_FLIPS;
          out.push({ 対象: name + ' 文字幅', 最小: r1(wd.lo), 最大: r1(wd.hi), 振れ幅px: r1(wd.amp), 反転: wd.flips, フォント変化: fc.n, 判定: shaking ? '揺れている' : '止まっている' });
          out.push({ 対象: name + ' 文字左端', 最小: r1(lf.lo), 最大: r1(lf.hi), 振れ幅px: r1(lf.amp), 反転: lf.flips, フォント変化: fc.n, 判定: shaking ? '揺れている' : '止まっている' });
        }
        console.table(out);
        if (DEBUG) console.table(whoTable(sec));
      }, sec * 1000);
      return `${sec} 秒観測します（結果は console に表で出ます）`;
    },
    pin(mode = 'auto') {
      if (mode === 'off') { S.pinMode = 'off'; S.pin = null; S.pinFail = false; }
      else if (mode === 'auto') { S.pinMode = 'auto'; }
      else if (mode === 'release') { S.pin = null; S.pinFail = false; }
      else if (mode === 'next') { if (S.pin && S.pin.list.length > 1) setPin(S.pin.list, (S.pin.idx + 1) % S.pin.list.length); }
      save(); writeStyle(); return this.state();
    },
    debug(v = true) {
      try { localStorage.setItem(LS_DEBUG, v ? '1' : '0'); } catch {}
      return '調査モード ' + (v ? 'ON' : 'OFF') + ' — リロードで反映';
    },
    on(v = true) { S.enabled = !!v; save(); writeStyle(); return this.state(); },
    gutter(v = true) { S.gutter = !!v; save(); writeStyle(); return this.state(); },
    anim(stop = true) { S.noAnim = !!stop; save(); writeStyle(); return this.state(); }
  };
  window.__c14 = api;

  // ---------- 起動 ----------
  if (DEBUG) installHooks();
  writeStyle();
  /* 印の付け外しはコールバック内で同期（描画前）。重い処理（タイトル探索など）は 200ms 後 */
  new MutationObserver(recs => {
    for (const r of recs) {
      if (r.addedNodes.length || r.removedNodes.length) {
        try { markSync(); } catch {}
        break;
      }
    }
    scheduleScan();
  }).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('resize', () => kick(), { passive: true });
  addEventListener('DOMContentLoaded', scheduleScan, { once: true });
  setInterval(() => { if (!document.hidden) scheduleScan(); }, 3000);
  scheduleScan();
  try { document.documentElement.dataset.c14 = VERSION; } catch {}
  console.log('[Cordivestium] Page Jitter Stopper v' + VERSION + ' started. « No »' + (DEBUG ? '（調査モード）' : ''));
})();
