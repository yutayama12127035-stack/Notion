// ==UserScript==
// @name         « No »　¹⁸ _ View Switch Stabilizer
// @namespace    constellucentia
// @version      1.5.0
// @description  v1.5.0: 切替 1 回を 1 件として数える（同じ切替のタブ・キー・メニューの重複は数えない）、切替ごとに「どうしたか」（押さえた／²¹ に任せた／³³ の索引帯に譲った／³³ の hold 中）を status().decisions に残す。³³ の索引帯（[data-c194-band]）の中のタブは ³³ に譲り（⁴¹ と同じ分岐）、³³ が本文の寸法を変えている間（html[data-c194-hold]）は押さえない・測らない。v1.4.0: ²¹ Render Veil が動いている時は手を出さない（幕の下で ⁰⁵ が正しい値を即書くので、押さえ込みは不要。押さえ込むと ⁰⁵ の実測に押さえ分が混ざり、幕が開いた後に動く原因になる）。DBビューのタブ切り替え直後に表が左へ跳ねて戻る動きを止める。新しい表が左にずれている間だけ translate で元の位置に留め（描画前に補正するので見た目は動かない）、余白が付き直った瞬間に手を離す。v1.1.0: 右向きのみ・表全体を1つで動かす。v1.2.0: 表が基準より右なら基準を更新。v1.3.0: 「0.9秒で受け入れ」を撤去（ずれが1〜2秒続くと途中で手を離して跳ねていた）→ 戻るまで補正し続け、見張りも延長（最長6秒）。__c18.why() でずれ中／戻った後の親要素と余白を比較。レイアウト・他スクリプトの余白には触れない。
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

    const VERSION = '1.5.0';

    /* ── v196: c194 契約（Foundation v0.2.0 があればその API。無ければ html の属性と素の dispatchEvent） ── */
    const C194 = (() => {
        const RT = Symbol.for('constellucentia.runtime');
        const rt = () => { try { const r = window[RT]; return r && r.contract && r.events ? r : null; } catch (e) { return null; } };
        const html = () => document.documentElement;
        const has = (key, attr) => { const r = rt(); if (r) { try { return r.contract.has(key); } catch (e) { /* 次へ */ } } const h = html(); return !!(h && h.hasAttribute(attr)); };
        return Object.freeze({
            hold: () => has('hold', 'data-c194-hold'),
            split: () => has('split', 'data-c194-split'),
            ready: () => has('ready', 'data-c194-ready'),
            on: () => has('on', 'data-c194-on'),
            emit(src, why) {
                const detail = { src: String(src), why: String(why || '') };
                const r = rt();
                if (r) { try { r.events.emit('c194:rowlayout', detail); return; } catch (e) { /* 素の発火へ */ } }
                try { document.dispatchEvent(new CustomEvent('c194:rowlayout', { detail })); } catch (e) { /* noop */ }
            },
            /* hold（または split）が外れた時に fn を 1 回呼ぶ。返り値で止められる */
            onRelease(fn, attrs) {
                const h = html(); if (!h || typeof MutationObserver !== 'function') return () => {};
                const names = attrs || ['data-c194-hold'];
                const on = () => names.some((a) => h.hasAttribute(a));
                let was = on();
                const mo = new MutationObserver(() => { const now = on(); if (was && !now) { try { fn(); } catch (e) { /* noop */ } } was = now; });
                mo.observe(h, { attributes: true, attributeFilter: names });
                return () => mo.disconnect();
            },
            report(name, info) { const r = rt(); if (r && r.inventory) { try { r.inventory.report(name, info); } catch (e) { /* noop */ } } }
        });
    })();
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
    /* v1.5.0: 切替ごとの判断（合計＝triggers）。same は「選ばれているタブを押しただけ」（切替ではないので triggers に数えない） */
    const decisions = { stabilize: 0, veil: 0, c194band: 0, c194hold: 0, unmeasured: 0 };
    let same = 0;
    let lastDecision = null;
    /* v1.5.0: 同じ切替の重複（pointerdown と keydown、³³ の押し直し、二度押し）を 1 件にまとめる */
    const DUP_MS = 400;
    let lastSwitch = null;   // { key, at, sel }
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
        /* v1.5.0: ³³ が本文の寸法を変えている間（html[data-c194-hold]）は測らない・書き換えない（今の押さえはそのまま） */
        if (C194.hold()) return;
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

    /* v1.5.0: 押したものの鍵（タブはビュー ID、無ければ要素そのもの）と、今選ばれているビュー */
    function keyOf(el) {
        const b = el && el.closest && el.closest('[data-collection-view-id]');
        return b ? b.getAttribute('data-collection-view-id') : el;
    }
    function selectedView() {
        const f = frame();
        const t = f && f.querySelector('[role="tablist"] [role="tab"][aria-selected="true"]');
        let v = '';
        try { v = new URL(location.href).searchParams.get('v') || ''; } catch (e) {}
        return String(t ? keyOf(t) : '') + '|' + v;
    }
    /* v1.5.0: 新しい切替なら数えて true。同じ切替の重複・選ばれているタブは false */
    function countSwitch(el) {
        const tab = el && el.closest ? el.closest('[role="tab"]') : null;
        if (tab && tab.getAttribute('aria-selected') === 'true') { same++; return false; }
        const now = performance.now();
        const key = keyOf(el);
        const sel = selectedView();
        /* 同じ切替とみなすもの: 同じタブを 400ms 以内（二度押し・Enter の後の押下）か、選ばれているビューが変わるまでに押し直した
           ／別のものでも、ビューがまだ変わっていない 400ms 以内（キーで決めた直後の ³³ の押し直しなど） */
        if (lastSwitch) {
            const dt = now - lastSwitch.at;
            const sameKey = lastSwitch.key === key;
            if ((sameKey && (dt < DUP_MS || (lastSwitch.sel === sel && dt < HOLD_MAX_MS))) || (!sameKey && dt < DUP_MS && lastSwitch.sel === sel)) return false;
        }
        lastSwitch = { key, at: now, sel };
        stats.triggers++;
        return true;
    }
    function decide(sw, why) {
        if (!sw) return;
        decisions[why]++;
        lastDecision = { 時刻: new Date().toLocaleTimeString(), 判断: why };
        if (why !== 'stabilize') pushLog({ 補正px: 'なし', 対象: 0, 要素: { veil: '²¹ Render Veil に任せた', c194band: '³³ の索引帯に譲った', c194hold: '³³ の hold 中', unmeasured: '測れない（見出しが無い）' }[why] || why });
    }

    function start(el) {
        if (!enabled) return;
        /* v1.5.0: 切替 1 回を 1 件として数える（判断は decisions に） */
        const sw = countSwitch(el);
        if (veilActive()) { stats.skipped++; decide(sw, 'veil'); return; }
        /* v1.5.0: ³³ の索引帯の中のタブは ³³ に譲る（⁴¹ Telescopium v1.0.1 と同じ分岐: [data-c194-band] があれば手を出さずに戻る） */
        if (el && el.closest && el.closest('[data-c194-band]')) { decide(sw, 'c194band'); return; }
        /* v1.5.0: ³³ が本文の寸法を変えている間は押さえない */
        if (C194.hold()) { decide(sw, 'c194hold'); return; }
        const f = frame();
        if (!f) { decide(sw, 'unmeasured'); return; }

        /* 落ち着いた状態（見張っていないとき）なら今の位置を基準にする */
        if (!rafId) {
            const m = measure();
            if (m) stable = { rel: m.rel };
        }
        if (!stable) { decide(sw, 'unmeasured'); return; }

        decide(sw, 'stabilize');
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
        if (e.target instanceof Element && e.target.closest(TRIGGER_SEL)) start(e.target.closest(TRIGGER_SEL));
    }, true);

    document.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element && e.target.closest(TRIGGER_SEL)) start(e.target.closest(TRIGGER_SEL));
    }, true);

    /* 画面幅が変わったら基準を捨てる（次の切り替えで取り直す） */
    window.addEventListener('resize', () => { if (!rafId) stable = null; }, { passive: true });

    window.__c18 = {
        version: VERSION,
        status: () => ({ version: VERSION, enabled, stable, shift, active: !!rafId, ...stats, decisions: { ...decisions }, same, lastDecision, c194hold: C194.hold() }),
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

    C194.report('c18', {
        version: VERSION,
        observers: ['.notion-frame MO（切替後の見張りの間だけ・childList・subtree・style/class）'],
        listeners: ['document pointerdown（capture）', 'document keydown（capture）', 'window resize'],
        timers: ['requestAnimationFrame の見張り（切替後 2 秒・ずれが続けば最長 6 秒）']
    });

    console.info(`[¹⁸] View Switch Stabilizer v${VERSION} started`);
})();