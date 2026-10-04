// ==UserScript==
// @name         « No »　⁰⁸ _ Full Database Description Right Edge Aligner
// @namespace    https://constellucentia.local/full-database-description-right-edge-aligner
// @version      1.5.6
// @description  Aligns the full database description to the blue-toggle-side outer edge and clears local clipping around the description only. v1.5.6: never targets normal-page body/title (stops jitter), and cleans up widths it wrote there before.
// @author       Constellucentia
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @grant        unsafeWindow
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
    "use strict";

    /* ── v2026-09-27 軽量化の番人（この1段だけ追加。本体の処理は1文字も変えていません）──
       このスクリプトの見張り（MutationObserver）に届く変化を、仕事の前にふるいます。
       ・入力中の文字の変化（編集中のブロックの中）→ 捨てる（1打鍵ごとの全画面走査を止める）
       ・サイドバー／¹⁶ の器の中の変化 → 捨てる（このスクリプトの担当外）
       ・サイドバーで行をつかんでいる間 → 溜めて、離したあとに1回だけ渡す
       ここで名前を上書きするのは、この関数の中だけです（他のスクリプトには影響しません）。 */
    const MutationObserver = (() => {
      const O = window.MutationObserver;
      const SKIP = '.notion-sidebar-container, .notion-sidebar, #c16-root, #c16-line, #c16-menu';
      const el = (n) => n && (n.nodeType === 1 ? n : n.parentElement);
      const inEdit = (e) => !!(e && e.closest('[contenteditable="true"]'));
      const textOnly = (list) => { for (const n of list) if (n.nodeType !== 3) return false; return true; };
      const drop = (r) => {
        const e = el(r.target);
        if (!e) return false;
        if (SKIP && e.closest(SKIP)) return true;
        if (r.type === 'characterData') return inEdit(e);
        if (r.type === 'childList' && inEdit(e) && textOnly(r.addedNodes) && textOnly(r.removedNodes)) return true;
        return false;
      };
      return class extends O {
        constructor(cb) {
          let pend = null, waitT = 0;
          const flush = (obs) => {
            waitT = 0;
            if (document.documentElement.hasAttribute('data-c16-dragging')) { waitT = setTimeout(() => flush(obs), 250); return; }
            const recs = pend; pend = null;
            if (recs && recs.length) cb.call(obs, recs, obs);
          };
          super(function (recs, obs) {
            const keep = [];
            for (const r of recs) if (!drop(r)) keep.push(r);
            if (!keep.length) return;
            if (document.documentElement.hasAttribute('data-c16-dragging')) {
              pend = (pend || []).concat(keep).slice(-200);
              if (!waitT) waitT = setTimeout(() => flush(obs), 250);
              return;
            }
            cb.call(obs, keep, obs);
          });
        }
      };
    })();


    if (window.top !== window.self) return;

    const VERSION = "1.5.6";
    const RUNTIME_KEY = "__constellucentiaFullDatabaseDescriptionRightEdgeAligner__";
    const DESCRIPTION_SELECTOR = [
        'div[contenteditable="true"]',
        '[data-content-editable-leaf="true"]',
        '[data-constellucentia-full-db-description-aligned="true"]'
    ].join(', ');

    const MARK_ATTRIBUTE = 'data-constellucentia-full-db-description-aligned';
    const RENDER_HOST_ATTRIBUTE = 'data-constellucentia-full-db-description-render-host';
    const LEGACY_TARGET_WIDTH_PROPERTY = '--constellucentia-full-db-description-target-width';
    const LEGACY_HOST_ATTRIBUTE = 'data-constellucentia-full-db-description-width-host';

    /*
     * v1.5.6: 対象にしてはいけない場所。
     * ・CONTAINS … これを「中に含む」要素は対象外（通常ページの編集領域全体など）
     * ・INSIDE   … これの「内側にある」要素は対象外（タイトル・通常ページ本文の段落）
     * フルDBの説明文はどちらにも当てはまらないので、従来どおり揃えられる。
     */
    const FORBIDDEN_CONTAINS_SELECTOR = 'h1, .notion-page-content';
    const FORBIDDEN_INSIDE_SELECTOR = 'h1, [role="heading"], .notion-page-content';

    const TARGET_RIGHT_INSET = 0;
    const TITLE_ROW_TRAILING_EXTRA_PX = 96;
    const MIN_DESCRIPTION_WIDTH = 240;
    const MAX_VIEWPORT_WIDTH_MULTIPLIER = 2.0;
    const SCAN_DELAY = 80;
    const RESCAN_DELAYS_MS = [0, 120, 360, 900];

    const PAGE_WINDOW = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    let observer = null;
    let scanTimer = null;
    let destroyed = false;
    let scanRunning = false;
    let totalAligned = 0;
    let totalCleaned = 0;
    let lastScanAt = null;
    let lastResult = null;
    let stabilizationTimers = [];
    let visibilityHandler = null;

    /* v1.5.6: このスクリプトが幅を書き込んだ要素の記録（後片付け用） */
    const touchedElements = new Set();

    try {
        const oldRuntime = PAGE_WINDOW[RUNTIME_KEY];
        if (oldRuntime && typeof oldRuntime.destroy === 'function') oldRuntime.destroy();
    } catch (error) {
        console.debug('[Constellucentia] Could not stop old description edge aligner:', error);
    }

    function isVisible(element) {
        if (!(element instanceof Element)) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) !== 0;
    }

    function normalizeText(text) {
        return String(text || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function getElementContentRight(element) {
        const rect = element.getBoundingClientRect();
        const clientRight = rect.left + element.clientLeft + element.clientWidth;
        return Math.min(clientRight, window.innerWidth);
    }

    function getElementOuterRight(element) {
        return Math.min(element.getBoundingClientRect().right, window.innerWidth);
    }

    function clearLegacyArtifacts() {
        document.querySelectorAll(`[${LEGACY_HOST_ATTRIBUTE}="true"]`).forEach((element) => {
            element.removeAttribute(LEGACY_HOST_ATTRIBUTE);
        });
        document.querySelectorAll(`[${RENDER_HOST_ATTRIBUTE}="true"]`).forEach((element) => {
            if (!(element instanceof HTMLElement)) return;
            element.removeAttribute(RENDER_HOST_ATTRIBUTE);
            element.style.removeProperty('overflow');
            element.style.removeProperty('max-width');
        });
        document.querySelectorAll(`[${MARK_ATTRIBUTE}="true"], [data-content-editable-leaf="true"]`).forEach((element) => {
            if (!(element instanceof HTMLElement)) return;
            element.style.removeProperty(LEGACY_TARGET_WIDTH_PROPERTY);
        });
    }

    /* v1.5.6: 通常ページの本文・タイトル、またはそれを含む器かどうか */
    function isForbiddenTarget(element) {
        if (!(element instanceof Element)) return false;
        try {
            if (element.matches(FORBIDDEN_INSIDE_SELECTOR)) return true;
            if (element.querySelector(FORBIDDEN_CONTAINS_SELECTOR)) return true;
            if (element.closest(FORBIDDEN_INSIDE_SELECTOR)) return true;
        } catch (error) {}
        return false;
    }

    function stripAppliedWidth(element) {
        element.style.removeProperty('width');
        element.style.removeProperty('max-width');
        element.style.removeProperty('min-width');
        element.style.removeProperty('box-sizing');
    }

    /*
     * v1.5.6: 過去に誤って書いた幅と印を片付ける。
     * ・印の付いた要素のうち、対象外の場所にあるもの
     * ・このスクリプトが幅を書いたが、今は対象外になったもの（⁰⁴ が印だけ外した場合も含む）
     * フルDBの正しい説明文には触らない。
     */
    function cleanupForbiddenTargets() {
        let cleaned = 0;
        for (const element of document.querySelectorAll(`[${MARK_ATTRIBUTE}="true"]`)) {
            if (!(element instanceof HTMLElement) || !isForbiddenTarget(element)) continue;
            element.removeAttribute(MARK_ATTRIBUTE);
            stripAppliedWidth(element);
            touchedElements.delete(element);
            cleaned += 1;
        }
        for (const element of [...touchedElements]) {
            if (!element.isConnected) { touchedElements.delete(element); continue; }
            if (!isForbiddenTarget(element)) continue;
            if (element.getAttribute(MARK_ATTRIBUTE) === 'true') element.removeAttribute(MARK_ATTRIBUTE);
            stripAppliedWidth(element);
            touchedElements.delete(element);
            cleaned += 1;
        }
        totalCleaned += cleaned;
        return cleaned;
    }

    function looksLikeDatabaseDescription(element) {
        if (!(element instanceof HTMLElement) || !isVisible(element)) return false;
        /* v1.5.6: 通常ページの本文・タイトル・編集領域全体は対象外（揺れの原因だった） */
        if (isForbiddenTarget(element)) return false;
        if (element.matches('h1,[role="heading"]') || element.closest('h1,[role="heading"]')) return false;
        if (element.closest(['[data-testid="property-value"]','[data-col-index]','[role="row"]','.notion-table-view','.notion-collection-item'].join(','))) return false;
        const text = normalizeText(element.textContent);
        if (text.length < 20) return false;
        const rect = element.getBoundingClientRect();
        return !(rect.width < 220 || rect.left > window.innerWidth * 0.5);
    }

    function getDescriptionCandidates() {
        const seen = new Set();
        const results = [];
        for (const element of document.querySelectorAll(DESCRIPTION_SELECTOR)) {
            if (!(element instanceof HTMLElement)) continue;
            const candidate = element.closest('[data-content-editable-leaf="true"]') || element;
            if (!(candidate instanceof HTMLElement) || seen.has(candidate)) continue;
            if (!looksLikeDatabaseDescription(candidate)) continue;
            seen.add(candidate);
            results.push(candidate);
        }
        return results;
    }

    function findTitleRowWidthHost(description) {
        let current = description instanceof Element ? description.parentElement : null;
        for (let depth = 0; current && depth < 10; depth += 1) {
            let sibling = current.previousElementSibling;
            while (sibling) {
                const title = sibling.querySelector('h1[contenteditable="true"], h1[data-content-editable-leaf="true"], .notion-collection_view_page-block h1');
                if (title && isVisible(title)) {
                    const widthHost = sibling.matches('div[style*="padding-inline-end"]') ? sibling : sibling.closest('div[style*="padding-inline-end"]') || sibling;
                    if (isVisible(widthHost)) return { element: widthHost, source: 'title-row-outer-edge' };
                }
                sibling = sibling.previousElementSibling;
            }
            current = current.parentElement;
        }
        return null;
    }

    function findNotionScroller(description) {
        const directScroller = description.closest('.notion-scroller');
        if (directScroller && isVisible(directScroller)) return { element: directScroller, source: 'notion-scroller' };
        let ancestor = description.parentElement;
        let fallback = null;
        for (let depth = 0; ancestor && depth < 14; depth += 1) {
            const rect = ancestor.getBoundingClientRect();
            const style = getComputedStyle(ancestor);
            const overflow = [style.overflow, style.overflowX, style.overflowY].join(' ');
            const scrollable = /(?:auto|scroll|overlay)/.test(overflow);
            const sufficientlyLarge = rect.width >= 500 && rect.height >= 300;
            if (scrollable && sufficientlyLarge && ancestor.contains(description)) {
                fallback = ancestor;
                break;
            }
            ancestor = ancestor.parentElement;
        }
        if (fallback) return { element: fallback, source: 'scrollable-ancestor' };
        return { element: document.documentElement, source: 'document-viewport' };
    }

    function calculateStableTargetRight(description) {
        const titleHostInfo = findTitleRowWidthHost(description);
        if (titleHostInfo) {
            const computed = getComputedStyle(titleHostInfo.element);
            const paddingInlineEnd = parseFloat(computed.paddingInlineEnd || '0') || 0;
            const hostRect = titleHostInfo.element.getBoundingClientRect();
            const hostOuterRight = getElementOuterRight(titleHostInfo.element);
            const hostContentRight = getElementContentRight(titleHostInfo.element);
            const titleRowRight = Math.max(hostOuterRight, hostContentRight);
            const safeRight = Math.min(window.innerWidth, titleRowRight);
            return {
                host: titleHostInfo.element,
                source: titleHostInfo.source,
                hostContentRight: safeRight,
                hostLeft: hostRect.left,
                targetRight: safeRight - TARGET_RIGHT_INSET,
                widthMode: paddingInlineEnd > 0 ? 'title-row-safe-right' : 'host-outer-width'
            };
        }
        const hostInfo = findNotionScroller(description);
        const host = hostInfo.element;
        const hostContentRight = getElementContentRight(host);
        return {
            host,
            source: hostInfo.source,
            hostContentRight,
            hostLeft: host.getBoundingClientRect().left,
            targetRight: hostContentRight - TARGET_RIGHT_INSET,
            widthMode: 'description-left-width'
        };
    }

    function computeTargetWidth(beforeRect, target) {
        return Math.round(target.targetRight - beforeRect.left);
    }

    function unclipDescriptionRenderPath(description) {
        let current = description.parentElement;
        for (let depth = 0; current && depth < 4; depth += 1) {
            /* v1.5.6: 通常ページの本文やタイトルを含む器の overflow / max-width は触らない */
            if (isForbiddenTarget(current)) break;
            const style = getComputedStyle(current);
            const clips = ['hidden', 'clip'].includes(style.overflow) || ['hidden', 'clip'].includes(style.overflowX) || ['hidden', 'clip'].includes(style.overflowY);
            const narrowMaxWidth = style.maxWidth && style.maxWidth !== 'none';
            if (clips || narrowMaxWidth) {
                current.setAttribute(RENDER_HOST_ATTRIBUTE, 'true');
                current.style.setProperty('overflow', 'visible', 'important');
                current.style.setProperty('max-width', 'none', 'important');
            }
            current = current.parentElement;
        }
    }

    function applyWidth(description, targetWidth) {
        const widthValue = `${targetWidth}px`;
        if (description.style.width !== widthValue) totalAligned += 1;
        description.style.removeProperty(LEGACY_TARGET_WIDTH_PROPERTY);
        description.style.setProperty('width', widthValue, 'important');
        description.style.setProperty('max-width', widthValue, 'important');
        description.style.setProperty('min-width', widthValue, 'important');
        description.style.setProperty('box-sizing', 'border-box', 'important');
        description.setAttribute(MARK_ATTRIBUTE, 'true');
        touchedElements.add(description);
    }

    function alignDescription(description) {
        if (!isVisible(description)) return { aligned: false, reason: 'description-not-visible' };
        const beforeRect = description.getBoundingClientRect();
        const target = calculateStableTargetRight(description);
        const targetWidth = computeTargetWidth(beforeRect, target);
        const maximumAllowedWidth = Math.round(window.innerWidth * MAX_VIEWPORT_WIDTH_MULTIPLIER);
        if (!Number.isFinite(targetWidth) || targetWidth < MIN_DESCRIPTION_WIDTH || targetWidth > maximumAllowedWidth) {
            return { aligned: false, reason: 'invalid-target-width', source: target.source, descriptionLeft: beforeRect.left, targetRight: target.targetRight, targetWidth, maximumAllowedWidth };
        }
        applyWidth(description, targetWidth);
        unclipDescriptionRenderPath(description);
        const afterRect = description.getBoundingClientRect();
        return {
            aligned: true,
            source: target.source,
            widthMode: target.widthMode,
            targetRightInset: TARGET_RIGHT_INSET,
            hostContentRight: target.hostContentRight,
            hostLeft: target.hostLeft,
            descriptionLeft: beforeRect.left,
            previousDescriptionRight: beforeRect.right,
            targetRight: target.targetRight,
            targetWidth,
            finalDescriptionRight: afterRect.right,
            finalDescriptionWidth: afterRect.width,
            rightEdgeDifference: Math.round((afterRect.right - target.targetRight) * 100) / 100
        };
    }

    function scan() {
        if (destroyed || scanRunning) return lastResult;
        scanRunning = true;
        try {
            clearLegacyArtifacts();
            const cleaned = cleanupForbiddenTargets();
            const descriptions = getDescriptionCandidates();
            const results = descriptions.map(alignDescription);
            const aligned = results.filter(result => result.aligned).length;
            const failed = results.length - aligned;
            lastScanAt = new Date().toISOString();
            lastResult = { descriptionsFound: descriptions.length, aligned, failed, cleaned, results };
            return lastResult;
        } finally {
            scanRunning = false;
        }
    }

    function scheduleScan() {
        if (destroyed) return;
        clearTimeout(scanTimer);
        scanTimer = window.setTimeout(scan, SCAN_DELAY);
    }

    function clearStabilizationTimers() {
        for (const timer of stabilizationTimers) clearTimeout(timer);
        stabilizationTimers = [];
    }

    function scheduleStabilization() {
        clearStabilizationTimers();
        for (const delay of RESCAN_DELAYS_MS) {
            const timer = window.setTimeout(scheduleScan, delay);
            stabilizationTimers.push(timer);
        }
    }

    function startObservers() {
        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                    scheduleScan();
                    return;
                }
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.addEventListener('resize', scheduleStabilization, { passive: true });
        window.addEventListener('popstate', scheduleStabilization);
        window.addEventListener('pageshow', scheduleStabilization, { passive: true });
        visibilityHandler = () => { if (!document.hidden) scheduleStabilization(); };
        document.addEventListener('visibilitychange', visibilityHandler);
    }

    function status() {
        const descriptions = getDescriptionCandidates();
        return {
            name: 'Constellucentia — Full Database Description Right Edge Aligner',
            version: VERSION,
            configuration: {
                hoverIndependent: true,
                newButtonDetection: false,
                normalPageExcluded: true,
                targetRightInset: `${TARGET_RIGHT_INSET}px`,
                titleRowTrailingExtraPx: `${TITLE_ROW_TRAILING_EXTRA_PX}px`,
                minimumDescriptionWidth: `${MIN_DESCRIPTION_WIDTH}px`
            },
            totalAligned,
            totalCleaned,
            lastScanAt,
            lastResult,
            descriptions: descriptions.map((description, index) => {
                const rect = description.getBoundingClientRect();
                const target = calculateStableTargetRight(description);
                return {
                    index,
                    source: target.source,
                    widthMode: target.widthMode,
                    width: description.style.width || null,
                    maxWidth: description.style.maxWidth || null,
                    minWidth: description.style.minWidth || null,
                    left: rect.left,
                    right: rect.right,
                    renderedWidth: rect.width,
                    hostLeft: target.hostLeft,
                    hostContentRight: target.hostContentRight,
                    targetRight: target.targetRight,
                    rightEdgeDifference: Math.round((rect.right - target.targetRight) * 100) / 100
                };
            })
        };
    }

    function realign() { return scan(); }

    function destroy() {
        destroyed = true;
        clearTimeout(scanTimer);
        clearStabilizationTimers();
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        window.removeEventListener('resize', scheduleStabilization);
        window.removeEventListener('popstate', scheduleStabilization);
        window.removeEventListener('pageshow', scheduleStabilization);
        if (visibilityHandler) {
            document.removeEventListener('visibilitychange', visibilityHandler);
            visibilityHandler = null;
        }
        clearLegacyArtifacts();
        for (const description of document.querySelectorAll(`[${MARK_ATTRIBUTE}="true"]`)) {
            description.style.removeProperty('width');
            description.style.removeProperty('max-width');
            description.style.removeProperty('min-width');
            description.style.removeProperty('box-sizing');
            description.removeAttribute(MARK_ATTRIBUTE);
        }
        for (const element of touchedElements) {
            if (element.isConnected) stripAppliedWidth(element);
        }
        touchedElements.clear();
        if (PAGE_WINDOW[RUNTIME_KEY]?.version === VERSION) delete PAGE_WINDOW[RUNTIME_KEY];
        console.info('[Constellucentia] Full Database Description Right Edge Aligner stopped.');
    }

    PAGE_WINDOW[RUNTIME_KEY] = { version: VERSION, scan, realign, status, destroy };
    startObservers();
    requestAnimationFrame(() => { requestAnimationFrame(() => { scheduleStabilization(); }); });
    console.info(`[Constellucentia] Full Database Description Right Edge Aligner v${VERSION} started.`, {
        hoverIndependent: true,
        newButtonDetection: false,
        normalPageExcluded: true,
        targetRightInset: `${TARGET_RIGHT_INSET}px`,
        titleRowTrailingExtraPx: `${TITLE_ROW_TRAILING_EXTRA_PX}px`
    });
})();
