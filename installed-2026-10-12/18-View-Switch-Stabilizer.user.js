// ==UserScript==
// @name         « No »　¹⁸ _ View Switch Stabilizer
// @namespace    constellucentia
// @version      1.4.0
// @description  v1.4.0: ²¹ Render Veil が動いている時は手を出さない（幕の下で ⁰⁵ が正しい値を即書くので、押さえ込みは不要。押さえ込むと ⁰⁵ の実測に押さえ分が混ざり、幕が開いた後に動く原因になる）。DBビューのタブ切り替え直後に表が左へ跳ねて戻る動きを止める。新しい表が左にずれている間だけ translate で元の位置に留め（描画前に補正するので見た目は動かない）、余白が付き直った瞬間に手を離す。v1.1.0: 右向きのみ・表全体を1つで動かす。v1.2.0: 表が基準より右なら基準を更新。v1.3.0: 「0.9秒で受け入れ」を撤去（ずれが1〜2秒続くと途中で手を離して跳ねていた）→ 戻るまで補正し続け、見張りも延長（最長6秒）。__c18.why() でずれ中／戻った後の親要素と余白を比較。レイアウト・他スクリプトの余白には触れない。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
    'use strict';

    const VERSION = '1.4.0';
    const LS_KEY = 'c18-off';

    /* 切り替え後に見張る時間（ずれていなければここで終わる） */
    const WINDOW_MS = 2000;
    /* ずれが続いているときに見張りを延ばす上限（押してからの時間） */
    const HOLD_MAX_MS = 6000;
    /* これ以下のずれは無視（px） */
    const EPS = 0.5;
    /* これより大きい左ずれは補正しない（別のレイアウトとみなす） */
    const MAX_FIX = 64;

    const HEAD_SEL = '.notion-table-view-header-cell, [role="columnheader"]';
    const ROW_SEL = '.notion-table-view-row, .notion-collection-item, [role="row"]';
    const TRIGGER_SEL = '[role="tablist"] [role="tab"], [role="menuitem"]';
    const ATTR = 'data-c18-shift';

    let enabled = localStorage.getItem(LS_KEY) !== '1';
    let stable = null;       // 表の見出し1列目の「正しい位置」（枠からの距離）
    let until = 0;
    let holdLimit = 0;
    let rafId = 0;
    let mo = null;
    let shifted = [];        // translate を付けている要素
    let shift = 0;           // 付けている量
    let lastDx = 0;
    let holdStart = 0;
    const stats = { triggers: 0, fixes: 0, released: 0, rebased: 0, skipped: 0, timeout: 0 };
    const log = [];
    const diag = { ずれ中: null, 戻った後: null, 補正時間ms: null };
    let diagTaken = false;

    const frame = () => document.querySelector('.notion-frame');
    const r1 = v => Math.round(v * 10) / 10;

    function measure() {
        const f = frame();
        if (!f) return null;
        const head = [...f.querySelectorAll(HEAD_SEL)].find(h => h.getBoundingClientRect().width > 0);
        if (!head) return null;
        const hs = head.closest('.notion-scroller.horizontal');
        const rel = head.getBoundingClientRect().left + (hs ? hs.scrollLeft : 0) - f.getBoundingClientRect().left;
        return { head, rel };
    }

    /* 診断用：見出しからページ枠までの親要素と、付いている左余白 */
    function chain(el) {
        const out = [];
        const f = frame();
        let n = el;
        for (let i = 0; n && n !== f && i < 16; i++, n = n.parentElement) {
            let cls = '';
            try {
                cls = (typeof n.className === 'string' ? n.className.trim().split(/\s+/) : [])
                    .filter(c => /^notion|^cordivestium/.test(c)).slice(0, 2).join('.');
            } catch (e) {}
            let extra = '';
            try {
                const cs = getComputedStyle(n);
                const m = parseFloat(cs.marginInlineStart) || 0;
                const p = parseFloat(cs.paddingInlineStart) || 0;
                if (m) extra += ` [margin ${r1(m)}]`;
                if (p) extra += ` [padding ${r1(p)}]`;
                if (n.hasAttribute(ATTR)) extra += ' [¹⁸補正中]';
            } catch (e) {}
            out.push(n.nodeName.toLowerCase() + (cls ? '.' + cls : '') + extra);
        }
        return out;
    }

    /* タブ列やページ枠そのものは絶対に動かさない */
    function movable(el) {
        const f = frame();
        return el instanceof HTMLElement && !!f &&
            el !== f && !el.contains(f) && f.contains(el) &&
            !el.querySelector('[role="tablist"]') && !el.closest('[role="tablist"]');
    }

    /* 表全体（見出し＋行）を1つの要素として動かす。見つからないとき（描画途中）だけ共通の親の子を探す */
    function targetsFor(head) {
        const tv = head.closest('.notion-table-view');
        if (tv && movable(tv)) return [tv];

        const f = frame();
        const row = [...f.querySelectorAll(ROW_SEL)].find(r =>
            !r.contains(head) && !head.contains(r) && r.getBoundingClientRect().height > 0);
        let list;
        if (!row) {
            list = [head.parentElement];
        } else {
            let lca = head.parentElement;
            while (lca && !lca.contains(row)) lca = lca.parentElement;
            if (!lca || !f.contains(lca)) return [];
            const childOf = el => { let c = el; while (c && c.parentElement !== lca) c = c.parentElement; return c; };
            list = [...new Set([childOf(head), childOf(row)])];
        }
        return list.filter(movable);
    }

    function pushLog(entry) {
        if (log.length > 40) log.shift();
        log.push({ 時刻: new Date().toLocaleTimeString(), ...entry });
    }

    function clear() {
        for (const el of shifted) {
            if (!el.isConnected) continue;
            el.style.removeProperty('translate');
            el.removeAttribute(ATTR);
        }
        if (shifted.length) stats.released++;
        shifted = [];
        shift = 0;
    }

    function apply(els, dx) {
        const same = shifted.length === els.length && els.every((e, i) => e === shifted[i]);
        if (!same) clear();
        const v = `${r1(dx)}px 0px`;
        for (const el of els) {
            if (el.getAttribute(ATTR) === v) continue;   // 同じ値なら書かない（見張りの無限ループ防止）
            el.style.setProperty('translate', v, 'important');
            el.setAttribute(ATTR, v);
        }
        if (!same || shift !== dx) {
            stats.fixes++;
            pushLog({
                補正px: r1(dx),
                対象: els.length,
                要素: els.map(e => e.classList.contains('notion-table-view') ? '表全体' : '表全体(描画途中)').join('+')
            });
        }
        shifted = els;
        shift = dx;
    }

    function check() {
        if (!enabled || !stable) return;
        const m = measure();
        if (!m) return;
        const inside = shifted.some(el => el.isConnected && el.contains(m.head));
        const natural = m.rel - (inside ? shift : 0);
        const dx = stable.rel - natural;

        /* 元の位置に戻った → 手を離す */
        if (Math.abs(dx) <= EPS) {
            if (shifted.length) {
                const held = holdStart ? Math.round(performance.now() - holdStart) : null;
                clear();
                pushLog({ 補正px: '解除', 対象: 0, 要素: `元の位置に戻った（${held ?? '-'}ms 補正）` });
                if (diagTaken && !diag.戻った後) { diag.戻った後 = chain(m.head); diag.補正時間ms = held; }
            }
            holdStart = 0;
            return;
        }

        /* 表が基準より右 → 基準の方が古い。その場で更新（補正はしない） */
        if (dx < 0) {
            if (shifted.length) clear();
            stable = { rel: natural };
            stats.rebased++;
            pushLog({ 補正px: 'なし', 対象: 0, 要素: `基準を更新（+${r1(-dx)}px）` });
            lastDx = 0;
            holdStart = 0;
            return;
        }

        /* 大きすぎる左ずれ → 別のレイアウトとみなして触らない */
        if (dx > MAX_FIX) {
            if (shifted.length) clear();
            if (Math.abs(dx - lastDx) > EPS) {
                stats.skipped++;
                pushLog({ 補正px: 'なし', 対象: 0, 要素: `スキップ（ずれ ${r1(dx)}px）` });
            }
            lastDx = dx;
            return;
        }

        /* v1.3.0: 受け入れはしない。戻るまで補正し続ける */
        lastDx = dx;
        if (!holdStart) holdStart = performance.now();
        if (!diagTaken) { diagTaken = true; diag.ずれ中 = chain(m.head); diag.戻った後 = null; diag.補正時間ms = null; }

        /* 今動かしている要素が新しい表をまだ含んでいれば、そのまま使う（対象の入れ替わりを防ぐ） */
        const keep = shifted.length && shifted.every(el => el.isConnected) && shifted.some(el => el.contains(m.head));
        const els = keep ? shifted : targetsFor(m.head);
        if (els.length) apply(els, dx);
    }

    function stop() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        if (shifted.length) {
            stats.timeout++;
            pushLog({ 補正px: '解除', 対象: 0, 要素: `上限 ${HOLD_MAX_MS}ms で終了` });
        }
        clear();
        holdStart = 0;
        if (mo) { mo.disconnect(); mo = null; }
    }

    function loop() {
        check();
        const now = performance.now();
        /* ずれが続いている間は見張りを延ばす（上限つき） */
        if (now < until || (shifted.length && now < holdLimit)) rafId = requestAnimationFrame(loop);
        else stop();
    }

    /* v1.4.0: ²¹ Render Veil が有効なら任せる */
    function veilActive() {
        try { return !!(window.__c21 && typeof window.__c21.enabled === 'function' && window.__c21.enabled()); } catch (e) { return false; }
    }

    function start() {
        if (!enabled) return;
        if (veilActive()) { stats.skipped++; return; }
        const f = frame();
        if (!f) return;

        /* 落ち着いた状態（見張っていないとき）なら今の位置を基準にする */
        if (!rafId) {
            const m = measure();
            if (m) stable = { rel: m.rel };
        }
        if (!stable) return;

        stats.triggers++;
        const now = performance.now();
        until = now + WINDOW_MS;
        holdLimit = now + HOLD_MAX_MS;
        lastDx = 0;
        diagTaken = false;
        if (!mo) {
            /* 見張りは切り替え後だけ。描画前に補正するため MutationObserver を使う */
            mo = new MutationObserver(check);
            mo.observe(f, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class'] });
        }
        if (!rafId) rafId = requestAnimationFrame(loop);
    }

    document.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        if (e.target instanceof Element && e.target.closest(TRIGGER_SEL)) start();
    }, true);

    document.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element && e.target.closest(TRIGGER_SEL)) start();
    }, true);

    /* 画面幅が変わったら基準を捨てる（次の切り替えで取り直す） */
    window.addEventListener('resize', () => { if (!rafId) stable = null; }, { passive: true });

    window.__c18 = {
        version: VERSION,
        status: () => ({ version: VERSION, enabled, stable, shift, active: !!rafId, ...stats }),
        log: () => { console.table(log.length ? log : [{ 補正: 'まだありません' }]); return log.length; },
        clearLog: () => { log.length = 0; return 'ログを消しました'; },
        why: () => {
            if (!diag.ずれ中) { console.log('まだ記録がありません。タブを1回切り替えてから実行してください'); return null; }
            const a = diag.ずれ中, b = diag.戻った後 || [];
            const n = Math.max(a.length, b.length);
            const rows = [];
            for (let i = 0; i < n; i++) rows.push({ 段: i, ずれ中: a[i] || '', 戻った後: b[i] || '（未記録）', 違い: (a[i] || '') === (b[i] || '') ? '' : '★' });
            console.log(`最後に補正した切り替え：補正時間 ${diag.補正時間ms ?? '-'}ms（★が付いた段が、48px が外れていた理由）`);
            console.table(rows);
            return rows.length;
        },
        on: (v = true) => {
            enabled = !!v;
            localStorage.setItem(LS_KEY, enabled ? '0' : '1');
            if (!enabled) stop();
            return enabled ? 'ON' : 'OFF';
        }
    };

    console.info(`[¹⁸] View Switch Stabilizer v${VERSION} started`);
})();