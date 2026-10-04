// ==UserScript==
// @name         « No »　⁰⁷ _ Automatic Supersampled SVG Icon Renderer
// @namespace    https://constellucentia.local/automatic-supersampled-svg-icon-renderer
// @version      1.1.1
// @description  Automatically detects SVG icons displayed by Notion and renders high-resolution antialiased PNGs.
// @author       Constellucentia
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @connect      *
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
    "use strict";

    /* ── v2026-09-27 軽量化の番人（この1段だけ追加。本体の処理は1文字も変えていません）──
       このスクリプトの見張り（MutationObserver）に届く変化を、仕事の前にふるいます。
       ・入力中の文字の変化（編集中のブロックの中）→ 捨てる（1打鍵ごとの全画面走査を止める）
       ・¹⁶ の器の中の変化 → 捨てる（このスクリプトの担当外）
       ・サイドバーで行をつかんでいる間 → 溜めて、離したあとに1回だけ渡す
       ここで名前を上書きするのは、この関数の中だけです（他のスクリプトには影響しません）。 */
    const MutationObserver = (() => {
      const O = window.MutationObserver;
      const SKIP = '#c16-root, #c16-line, #c16-menu';
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


    if (window.top !== window.self) {
        return;
    }

    /* =========================================================
       基本設定
       ========================================================= */

    const VERSION = "1.1.1";

    /*
     * Notion上のアイコン枠。
     */
    const ICON_BOX_SIZE = 36;

    /*
     * CSS上の表示サイズ。
     */
    const ICON_DISPLAY_SIZE = 36;

    /*
     * 一時描画時のスーパーサンプリング倍率。
     *
     * 4 = 標準
     * 6 = 曲線・斜線をより滑らかにする
     */
    const SUPERSAMPLE_SCALE = 6;

    /*
     * 画面側devicePixelRatioの上限。
     */
    const MAX_DEVICE_PIXEL_RATIO = 3;

    /*
     * 最終PNGが保持する最低解像度倍率。
     *
     * 4の場合:
     * 36 CSS px × 4 = 144px PNG
     */
    const MIN_OUTPUT_SCALE = 4;

    /*
     * 高解像度Canvasを段階的に縮小する。
     */
    const USE_PROGRESSIVE_DOWNSAMPLING = true;

    /*
     * square capや強いmiterを持つSVGだけ、
     * round cap / round joinへ補正する。
     */
    const SMOOTH_HARSH_STROKES = true;

    /*
     * SVG位置補正。
     * 端数ではなく整数値を推奨。
     */
    const ICON_X = 0;
    const ICON_Y = 0;

    const SCAN_DELAY = 100;
    const REQUEST_TIMEOUT = 15_000;

    const ICON_BUTTON_SELECTOR =
        'div.notion-record-icon[role="button"][aria-label="Change page icon"]';

    const RUNTIME_KEY =
        "__constellucentiaAutomaticSupersampledSvgIconRenderer__";

    const APPLIED_ATTRIBUTE =
        "data-constellucentia-auto-svg-applied";

    const ORIGINAL_SOURCE_ATTRIBUTE =
        "data-constellucentia-auto-svg-original-source";

    const RENDER_KEY_ATTRIBUTE =
        "data-constellucentia-auto-svg-render-key";

    const SOURCE_TYPE_ATTRIBUTE =
        "data-constellucentia-auto-svg-source-type";

    const ERROR_ATTRIBUTE =
        "data-constellucentia-auto-svg-error";

    const PAGE_WINDOW =
        typeof unsafeWindow !== "undefined"
            ? unsafeWindow
            : window;

    /* =========================================================
       状態
       ========================================================= */

    let observer = null;
    let scanTimer = null;
    let scanRunning = false;
    let destroyed = false;

    let totalDetected = 0;
    let totalRendered = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    let lastScanAt = null;
    let lastResult = null;

    /*
     * SVG判定・描画結果をキャッシュする。
     */
    const resourceCache = new Map();
    const renderCache = new Map();
    const pendingCache = new Map();

    /* =========================================================
       旧ランタイム停止
       ========================================================= */

    const OLD_RUNTIME_KEYS = [
        "__constellucentiaUploadedIconEdgeClarifier__",
        "__constellucentiaUploadedIconSmoothRenderer__",
        "__constellucentiaFullDatabaseUploadedIconEnhancer__",
        "__constellucentiaFullDatabaseUploadedIconRenderer__",
        "__constellucentiaDirectSvgDatabaseIcon__",
        "__constellucentiaVestigiaDirectSvgIcon__",
        "__constellucentiaUniversalDirectSvgIconManager__",
        "__constellucentiaUniversalSupersampledSvgIconManager__",
        RUNTIME_KEY
    ];

    for (const key of OLD_RUNTIME_KEYS) {
        try {
            const runtime = PAGE_WINDOW[key];

            if (
                runtime &&
                typeof runtime.destroy === "function"
            ) {
                runtime.destroy();
            }
        } catch (error) {
            console.debug(
                `[Constellucentia] Could not stop ${key}:`,
                error
            );
        }
    }

    /* =========================================================
       汎用関数
       ========================================================= */

    function setImportantStyle(
        element,
        property,
        value
    ) {
        if (!element) {
            return;
        }

        element.style.setProperty(
            property,
            value,
            "important"
        );
    }

    function getEffectiveDPR() {
        return Math.max(
            1,
            Math.min(
                MAX_DEVICE_PIXEL_RATIO,
                window.devicePixelRatio || 1
            )
        );
    }

    /*
     * 最終PNGに使用する実効倍率。
     *
     * DPR 1〜3の環境でも最低4倍を保持する。
     */
    function getOutputScale() {
        return Math.max(
            MIN_OUTPUT_SCALE,
            getEffectiveDPR()
        );
    }

    function simpleHash(value) {
        let hash = 2166136261;

        for (
            let index = 0;
            index < value.length;
            index += 1
        ) {
            hash ^= value.charCodeAt(index);

            hash = Math.imul(
                hash,
                16777619
            );
        }

        return (
            hash >>> 0
        ).toString(16);
    }

    function createRenderKey(source) {
        return simpleHash(
            [
                VERSION,
                source,
                ICON_DISPLAY_SIZE,
                SUPERSAMPLE_SCALE,
                getEffectiveDPR(),
                getOutputScale(),
                MIN_OUTPUT_SCALE,
                USE_PROGRESSIVE_DOWNSAMPLING,
                SMOOTH_HARSH_STROKES
            ].join("|")
        );
    }

    function isGeneratedImage(source) {
        return (
            typeof source === "string" &&
            source.startsWith("data:image/png") &&
            source.length > 100
        );
    }

    function isSVGDataURI(source) {
        return /^data:image\/svg\+xml(?:;[^,]*)?,/i.test(
            source
        );
    }

    function isRemoteURL(source) {
        return /^https?:\/\//i.test(
            source
        );
    }

    function resolveSource(source) {
        if (!source) {
            return "";
        }

        if (
            source.startsWith("data:") ||
            source.startsWith("blob:")
        ) {
            return source;
        }

        try {
            return new URL(
                source,
                location.href
            ).href;
        } catch {
            return source;
        }
    }

    function getOriginalSource(image) {
        const storedSource =
            image.getAttribute(
                ORIGINAL_SOURCE_ATTRIBUTE
            ) || "";

        const currentAttributeSource =
            image.getAttribute("src") || "";

        const currentSource =
            image.currentSrc ||
            image.src ||
            currentAttributeSource ||
            "";

        const applied =
            image.getAttribute(
                APPLIED_ATTRIBUTE
            ) === "true";

        /*
         * このスクリプトが生成したPNGを表示している場合だけ、
         * 保存済みの元SVGへ戻る。
         */
        if (
            applied &&
            storedSource &&
            (
                isGeneratedImage(
                    currentAttributeSource
                ) ||
                isGeneratedImage(
                    currentSource
                )
            )
        ) {
            return resolveSource(
                storedSource
            );
        }

        /*
         * Notionがsrcを別の画像へ変更した場合は、
         * 新しいsrcを元画像として扱う。
         */
        if (
            currentAttributeSource &&
            !isGeneratedImage(
                currentAttributeSource
            )
        ) {
            return resolveSource(
                currentAttributeSource
            );
        }

        if (
            currentSource &&
            !isGeneratedImage(
                currentSource
            )
        ) {
            return resolveSource(
                currentSource
            );
        }

        return resolveSource(
            storedSource
        );
    }

    /* =========================================================
       SVG Data URI解析
       ========================================================= */

    function decodeBase64UTF8(base64Value) {
        const binary =
            atob(base64Value);

        const bytes =
            new Uint8Array(
                binary.length
            );

        for (
            let index = 0;
            index < binary.length;
            index += 1
        ) {
            bytes[index] =
                binary.charCodeAt(index);
        }

        return new TextDecoder(
            "utf-8"
        ).decode(bytes);
    }

    function decodeSVGDataURI(source) {
        const commaIndex =
            source.indexOf(",");

        if (commaIndex < 0) {
            throw new Error(
                "Invalid SVG Data URI."
            );
        }

        const metadata =
            source.slice(
                0,
                commaIndex
            );

        const payload =
            source.slice(
                commaIndex + 1
            );

        if (/;base64/i.test(metadata)) {
            return decodeBase64UTF8(
                payload
            );
        }

        try {
            return decodeURIComponent(
                payload
            );
        } catch {
            return payload;
        }
    }

    function looksLikeSVGText(text) {
        if (!text) {
            return false;
        }

        const normalized =
            String(text)
                .replace(/^\uFEFF/, "")
                .trim();

        return (
            normalized.startsWith("<svg") ||
            (
                normalized.startsWith("<?xml") &&
                /<svg[\s>]/i.test(normalized)
            ) ||
            /<svg[\s>]/i.test(
                normalized.slice(0, 2048)
            )
        );
    }

    /* =========================================================
       SVG最適化
       ========================================================= */

    function shouldSmoothHarshStrokes(svgText) {
        if (!SMOOTH_HARSH_STROKES) {
            return false;
        }

        return (
            /stroke-linecap\s*:\s*square/i.test(
                svgText
            ) ||
            /stroke-linecap\s*=\s*["']square["']/i.test(
                svgText
            ) ||
            /stroke-linejoin\s*:\s*miter/i.test(
                svgText
            ) ||
            /stroke-linejoin\s*=\s*["']miter["']/i.test(
                svgText
            ) ||
            /stroke-miterlimit\s*:\s*(?:[3-9]|\d{2,})/i.test(
                svgText
            ) ||
            /stroke-miterlimit\s*=\s*["'](?:[3-9]|\d{2,})["']/i.test(
                svgText
            )
        );
    }

    function optimizeSVGText(svgText) {
        const parser =
            new DOMParser();

        const svgDocument =
            parser.parseFromString(
                svgText,
                "image/svg+xml"
            );

        const parserError =
            svgDocument.querySelector(
                "parsererror"
            );

        if (parserError) {
            throw new Error(
                "SVGの構文を解析できませんでした。"
            );
        }

        const root =
            svgDocument.documentElement;

        if (
            root.localName.toLowerCase() !==
            "svg"
        ) {
            throw new Error(
                "取得したファイルはSVGではありません。"
            );
        }

        /*
         * 曲線・斜線を幾何学的精度優先で描画する。
         */
        root.setAttribute(
            "shape-rendering",
            "geometricPrecision"
        );

        root.setAttribute(
            "text-rendering",
            "geometricPrecision"
        );

        /*
         * Atlas stampのようにsquare capや強いmiterを持つ
         * SVGだけ、線端と接合部を穏やかにする。
         */
        if (
            shouldSmoothHarshStrokes(
                svgText
            )
        ) {
            const smoothingStyle =
                svgDocument.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "style"
                );

            smoothingStyle.setAttribute(
                "data-constellucentia-stroke-smoothing",
                "true"
            );

            smoothingStyle.textContent = `
                svg * {
                    stroke-linecap: round !important;
                    stroke-linejoin: round !important;
                    stroke-miterlimit: 2 !important;
                }
            `;

            root.appendChild(
                smoothingStyle
            );
        }

        /*
         * viewBoxがある場合、100%や未指定のwidth/heightを
         * viewBoxの寸法に置き換える。
         */
        const viewBox =
            root.getAttribute("viewBox");

        if (viewBox) {
            const values =
                viewBox
                    .trim()
                    .split(/[\s,]+/)
                    .map(Number);

            if (
                values.length === 4 &&
                values.every(
                    Number.isFinite
                )
            ) {
                const viewBoxWidth =
                    values[2];

                const viewBoxHeight =
                    values[3];

                const currentWidth =
                    root.getAttribute(
                        "width"
                    );

                const currentHeight =
                    root.getAttribute(
                        "height"
                    );

                if (
                    !currentWidth ||
                    currentWidth.includes("%")
                ) {
                    root.setAttribute(
                        "width",
                        String(
                            viewBoxWidth
                        )
                    );
                }

                if (
                    !currentHeight ||
                    currentHeight.includes("%")
                ) {
                    root.setAttribute(
                        "height",
                        String(
                            viewBoxHeight
                        )
                    );
                }
            }
        }

        /*
         * 外部スクリプトやイベント属性を除去する。
         */
        for (
            const script
            of root.querySelectorAll(
                "script"
            )
        ) {
            script.remove();
        }

        for (
            const element
            of root.querySelectorAll("*")
        ) {
            for (
                const attribute
                of Array.from(
                    element.attributes
                )
            ) {
                if (
                    /^on/i.test(
                        attribute.name
                    )
                ) {
                    element.removeAttribute(
                        attribute.name
                    );
                }
            }
        }

        const serializer =
            new XMLSerializer();

        return {
            svgText:
                serializer.serializeToString(
                    svgDocument
                ),

            harshStrokeSmoothingApplied:
                shouldSmoothHarshStrokes(
                    svgText
                )
        };
    }

    /* =========================================================
       リモート画像取得
       ========================================================= */

    function extractContentType(headers) {
        const match =
            String(headers || "").match(
                /^content-type:\s*([^;\r\n]+)/im
            );

        return match
            ? match[1].trim()
            : "";
    }

    function requestBlobWithGM(url) {
        return new Promise(
            (resolve, reject) => {
                if (
                    typeof GM_xmlhttpRequest !==
                    "function"
                ) {
                    reject(
                        new Error(
                            "GM_xmlhttpRequest is unavailable."
                        )
                    );
                    return;
                }

                GM_xmlhttpRequest({
                    method: "GET",

                    /*
                     * URL中のwidthやsizeは変更しない。
                     */
                    url,

                    responseType: "blob",

                    anonymous: false,
                    withCredentials: true,

                    timeout:
                        REQUEST_TIMEOUT,

                    headers: {
                        Accept:
                            "image/svg+xml,image/*,*/*;q=0.8"
                    },

                    onload(response) {
                        const status =
                            Number(
                                response.status
                            );

                        if (
                            status < 200 ||
                            status >= 300
                        ) {
                            reject(
                                new Error(
                                    `HTTP ${status}`
                                )
                            );
                            return;
                        }

                        const contentType =
                            extractContentType(
                                response.responseHeaders
                            );

                        let blob =
                            response.response;

                        if (
                            !(blob instanceof Blob)
                        ) {
                            blob =
                                new Blob(
                                    [blob],
                                    {
                                        type:
                                            contentType ||
                                            "application/octet-stream"
                                    }
                                );
                        }

                        resolve({
                            blob,

                            contentType:
                                blob.type ||
                                contentType,

                            loadingMethod:
                                "GM_xmlhttpRequest"
                        });
                    },

                    onerror(error) {
                        reject(
                            new Error(
                                `Network error: ${
                                    error?.error ||
                                    "unknown"
                                }`
                            )
                        );
                    },

                    ontimeout() {
                        reject(
                            new Error(
                                "Request timed out."
                            )
                        );
                    }
                });
            }
        );
    }

    async function requestBlobWithFetch(url) {
        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    credentials:
                        "include",
                    cache:
                        "force-cache"
                }
            );

        if (!response.ok) {
            throw new Error(
                `Fetch HTTP ${response.status}`
            );
        }

        const blob =
            await response.blob();

        return {
            blob,

            contentType:
                blob.type ||
                response.headers.get(
                    "content-type"
                ) ||
                "",

            loadingMethod:
                "fetch"
        };
    }

    async function requestRemoteResource(url) {
        const errors = [];

        /*
         * 同一オリジンなら通常のfetchを先に試す。
         */
        try {
            const parsedURL =
                new URL(url);

            if (
                parsedURL.origin ===
                location.origin
            ) {
                try {
                    return await requestBlobWithFetch(
                        url
                    );
                } catch (error) {
                    errors.push(
                        `fetch: ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`
                    );
                }
            }
        } catch {
            // URL解析失敗時は後段へ進む。
        }

        /*
         * ScriptCatの権限付き通信。
         */
        try {
            return await requestBlobWithGM(
                url
            );
        } catch (error) {
            errors.push(
                `GM: ${
                    error instanceof Error
                        ? error.message
                        : String(error)
                }`
            );
        }

        /*
         * GMで失敗した場合のfetchフォールバック。
         */
        try {
            return await requestBlobWithFetch(
                url
            );
        } catch (error) {
            errors.push(
                `fetch fallback: ${
                    error instanceof Error
                        ? error.message
                        : String(error)
                }`
            );
        }

        throw new Error(
            errors.join(" | ")
        );
    }

    /* =========================================================
       SVGリソース判定
       ========================================================= */

    async function inspectSVGResource(source) {
        if (
            resourceCache.has(
                source
            )
        ) {
            return resourceCache.get(
                source
            );
        }

        let result;

        if (isSVGDataURI(source)) {
            const decodedText =
                decodeSVGDataURI(
                    source
                );

            if (
                !looksLikeSVGText(
                    decodedText
                )
            ) {
                result = {
                    isSVG: false,
                    reason:
                        "invalid-svg-data-uri"
                };
            } else {
                const optimized =
                    optimizeSVGText(
                        decodedText
                    );

                result = {
                    isSVG: true,

                    svgText:
                        optimized.svgText,

                    harshStrokeSmoothingApplied:
                        optimized
                            .harshStrokeSmoothingApplied,

                    sourceType:
                        "svg-data-uri",

                    contentType:
                        "image/svg+xml",

                    loadingMethod:
                        "local-data-uri"
                };
            }

            resourceCache.set(
                source,
                result
            );

            return result;
        }

        if (!isRemoteURL(source)) {
            result = {
                isSVG: false,
                reason:
                    "unsupported-source"
            };

            resourceCache.set(
                source,
                result
            );

            return result;
        }

        const remote =
            await requestRemoteResource(
                source
            );

        /*
         * Content-Typeだけでなく本文も確認する。
         */
        const text =
            await remote.blob.text();

        const contentTypeSuggestsSVG =
            /(?:image\/svg\+xml|svg)/i.test(
                remote.contentType
            );

        const bodySuggestsSVG =
            looksLikeSVGText(
                text
            );

        if (
            !contentTypeSuggestsSVG &&
            !bodySuggestsSVG
        ) {
            result = {
                isSVG: false,

                reason:
                    "resource-is-not-svg",

                contentType:
                    remote.contentType,

                loadingMethod:
                    remote.loadingMethod
            };

            resourceCache.set(
                source,
                result
            );

            return result;
        }

        if (!bodySuggestsSVG) {
            result = {
                isSVG: false,

                reason:
                    "svg-content-unreadable",

                contentType:
                    remote.contentType,

                loadingMethod:
                    remote.loadingMethod
            };

            resourceCache.set(
                source,
                result
            );

            return result;
        }

        const optimized =
            optimizeSVGText(
                text
            );

        result = {
            isSVG: true,

            svgText:
                optimized.svgText,

            harshStrokeSmoothingApplied:
                optimized
                    .harshStrokeSmoothingApplied,

            sourceType:
                "remote-svg",

            contentType:
                remote.contentType ||
                "image/svg+xml",

            loadingMethod:
                remote.loadingMethod
        };

        resourceCache.set(
            source,
            result
        );

        return result;
    }

    /* =========================================================
       SVG読み込み
       ========================================================= */

    function loadSVGTextAsImage(svgText) {
        return new Promise(
            (resolve, reject) => {
                const svgBlob =
                    new Blob(
                        [svgText],
                        {
                            type:
                                "image/svg+xml;charset=utf-8"
                        }
                    );

                const objectURL =
                    URL.createObjectURL(
                        svgBlob
                    );

                const image =
                    new Image();

                let settled = false;

                const timeout =
                    window.setTimeout(
                        () => {
                            if (settled) {
                                return;
                            }

                            settled = true;

                            URL.revokeObjectURL(
                                objectURL
                            );

                            reject(
                                new Error(
                                    "SVG decoding timed out."
                                )
                            );
                        },
                        REQUEST_TIMEOUT
                    );

                image.decoding =
                    "async";

                image.onload = () => {
                    if (settled) {
                        return;
                    }

                    settled = true;
                    clearTimeout(timeout);

                    resolve({
                        image,
                        objectURL
                    });
                };

                image.onerror = () => {
                    if (settled) {
                        return;
                    }

                    settled = true;
                    clearTimeout(timeout);

                    URL.revokeObjectURL(
                        objectURL
                    );

                    reject(
                        new Error(
                            "SVG could not be decoded."
                        )
                    );
                };

                image.src =
                    objectURL;
            }
        );
    }

    /* =========================================================
       Canvas処理
       ========================================================= */

    function createCanvas(
        width,
        height
    ) {
        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            Math.max(
                1,
                Math.round(width)
            );

        canvas.height =
            Math.max(
                1,
                Math.round(height)
            );

        return canvas;
    }

    function configureContext(context) {
        context.imageSmoothingEnabled =
            true;

        context.imageSmoothingQuality =
            "high";

        context.globalCompositeOperation =
            "source-over";
    }

    function drawContained(
        context,
        image,
        width,
        height
    ) {
        const sourceWidth =
            image.naturalWidth ||
            image.width ||
            1;

        const sourceHeight =
            image.naturalHeight ||
            image.height ||
            1;

        const scale =
            Math.min(
                width / sourceWidth,
                height / sourceHeight
            );

        const drawWidth =
            sourceWidth * scale;

        const drawHeight =
            sourceHeight * scale;

        const drawX =
            (width - drawWidth) / 2;

        const drawY =
            (height - drawHeight) / 2;

        context.clearRect(
            0,
            0,
            width,
            height
        );

        context.drawImage(
            image,
            drawX,
            drawY,
            drawWidth,
            drawHeight
        );
    }

    function resizeCanvas(
        sourceCanvas,
        targetWidth,
        targetHeight
    ) {
        const targetCanvas =
            createCanvas(
                targetWidth,
                targetHeight
            );

        const context =
            targetCanvas.getContext(
                "2d",
                {
                    alpha: true
                }
            );

        if (!context) {
            throw new Error(
                "Canvas 2D context is unavailable."
            );
        }

        configureContext(
            context
        );

        context.clearRect(
            0,
            0,
            targetCanvas.width,
            targetCanvas.height
        );

        context.drawImage(
            sourceCanvas,
            0,
            0,
            sourceCanvas.width,
            sourceCanvas.height,
            0,
            0,
            targetCanvas.width,
            targetCanvas.height
        );

        return targetCanvas;
    }

    function progressiveDownsample(
        sourceCanvas,
        targetSize
    ) {
        let currentCanvas =
            sourceCanvas;

        while (
            currentCanvas.width >
                targetSize * 2 ||
            currentCanvas.height >
                targetSize * 2
        ) {
            const nextWidth =
                Math.max(
                    targetSize,
                    Math.round(
                        currentCanvas.width /
                        2
                    )
                );

            const nextHeight =
                Math.max(
                    targetSize,
                    Math.round(
                        currentCanvas.height /
                        2
                    )
                );

            currentCanvas =
                resizeCanvas(
                    currentCanvas,
                    nextWidth,
                    nextHeight
                );
        }

        if (
            currentCanvas.width !==
                targetSize ||
            currentCanvas.height !==
                targetSize
        ) {
            currentCanvas =
                resizeCanvas(
                    currentCanvas,
                    targetSize,
                    targetSize
                );
        }

        return currentCanvas;
    }

    /* =========================================================
       スーパーサンプリング
       ========================================================= */

    async function renderSVGSource(source) {
        const renderKey =
            createRenderKey(
                source
            );

        if (
            renderCache.has(
                renderKey
            )
        ) {
            return renderCache.get(
                renderKey
            );
        }

        if (
            pendingCache.has(
                renderKey
            )
        ) {
            return pendingCache.get(
                renderKey
            );
        }

        const promise =
            (async () => {
                const resource =
                    await inspectSVGResource(
                        source
                    );

                if (!resource.isSVG) {
                    return {
                        rendered: false,
                        isSVG: false,
                        renderKey,
                        resource
                    };
                }

                totalDetected += 1;

                const decoded =
                    await loadSVGTextAsImage(
                        resource.svgText
                    );

                try {
                    const dpr =
                        getEffectiveDPR();

                    const outputScale =
                        getOutputScale();

                    /*
                     * v1.1.0:
                     * DPR 2でも72pxへ落とさず、
                     * 最低144pxのPNGを保持する。
                     */
                    const outputPixelSize =
                        Math.max(
                            1,
                            Math.round(
                                ICON_DISPLAY_SIZE *
                                outputScale
                            )
                        );

                    const supersampledSize =
                        Math.max(
                            outputPixelSize,
                            Math.round(
                                outputPixelSize *
                                SUPERSAMPLE_SCALE
                            )
                        );

                    const largeCanvas =
                        createCanvas(
                            supersampledSize,
                            supersampledSize
                        );

                    const largeContext =
                        largeCanvas.getContext(
                            "2d",
                            {
                                alpha: true
                            }
                        );

                    if (!largeContext) {
                        throw new Error(
                            "Canvas 2D context is unavailable."
                        );
                    }

                    configureContext(
                        largeContext
                    );

                    drawContained(
                        largeContext,
                        decoded.image,
                        supersampledSize,
                        supersampledSize
                    );

                    const finalCanvas =
                        USE_PROGRESSIVE_DOWNSAMPLING
                            ? progressiveDownsample(
                                largeCanvas,
                                outputPixelSize
                            )
                            : resizeCanvas(
                                largeCanvas,
                                outputPixelSize,
                                outputPixelSize
                            );

                    const generatedURL =
                        finalCanvas.toDataURL(
                            "image/png"
                        );

                    const result = {
                        rendered: true,
                        isSVG: true,
                        renderKey,
                        generatedURL,

                        sourceType:
                            resource.sourceType,

                        contentType:
                            resource.contentType,

                        loadingMethod:
                            resource.loadingMethod,

                        harshStrokeSmoothingApplied:
                            Boolean(
                                resource
                                    .harshStrokeSmoothingApplied
                            ),

                        dpr,
                        outputScale,

                        sourceNaturalSize: {
                            width:
                                decoded.image
                                    .naturalWidth,

                            height:
                                decoded.image
                                    .naturalHeight
                        },

                        supersampledSize,
                        outputPixelSize
                    };

                    renderCache.set(
                        renderKey,
                        result
                    );

                    return result;
                } finally {
                    URL.revokeObjectURL(
                        decoded.objectURL
                    );
                }
            })();

        pendingCache.set(
            renderKey,
            promise
        );

        try {
            return await promise;
        } finally {
            pendingCache.delete(
                renderKey
            );
        }
    }

    /* =========================================================
       アイコンレイアウト
       ========================================================= */

    function prepareLayout(
        button,
        image
    ) {
        const boxSize =
            `${ICON_BOX_SIZE}px`;

        const displaySize =
            `${ICON_DISPLAY_SIZE}px`;

        setImportantStyle(
            button,
            "width",
            boxSize
        );

        setImportantStyle(
            button,
            "height",
            boxSize
        );

        setImportantStyle(
            button,
            "min-width",
            boxSize
        );

        setImportantStyle(
            button,
            "min-height",
            boxSize
        );

        setImportantStyle(
            button,
            "max-width",
            boxSize
        );

        setImportantStyle(
            button,
            "max-height",
            boxSize
        );

        setImportantStyle(
            button,
            "display",
            "flex"
        );

        setImportantStyle(
            button,
            "align-items",
            "center"
        );

        setImportantStyle(
            button,
            "justify-content",
            "center"
        );

        setImportantStyle(
            button,
            "overflow",
            "visible"
        );

        setImportantStyle(
            button,
            "transform",
            "none"
        );

        let wrapper =
            image.parentElement;

        while (
            wrapper &&
            wrapper !== button
        ) {
            setImportantStyle(
                wrapper,
                "width",
                boxSize
            );

            setImportantStyle(
                wrapper,
                "height",
                boxSize
            );

            setImportantStyle(
                wrapper,
                "display",
                "flex"
            );

            setImportantStyle(
                wrapper,
                "align-items",
                "center"
            );

            setImportantStyle(
                wrapper,
                "justify-content",
                "center"
            );

            setImportantStyle(
                wrapper,
                "overflow",
                "visible"
            );

            setImportantStyle(
                wrapper,
                "transform",
                "none"
            );

            wrapper =
                wrapper.parentElement;
        }

        setImportantStyle(
            image,
            "width",
            displaySize
        );

        setImportantStyle(
            image,
            "height",
            displaySize
        );

        setImportantStyle(
            image,
            "min-width",
            displaySize
        );

        setImportantStyle(
            image,
            "min-height",
            displaySize
        );

        setImportantStyle(
            image,
            "max-width",
            displaySize
        );

        setImportantStyle(
            image,
            "max-height",
            displaySize
        );

        setImportantStyle(
            image,
            "display",
            "block"
        );

        setImportantStyle(
            image,
            "object-fit",
            "contain"
        );

        setImportantStyle(
            image,
            "object-position",
            "center center"
        );

        setImportantStyle(
            image,
            "image-rendering",
            "auto"
        );

        setImportantStyle(
            image,
            "transform",
            "none"
        );

        setImportantStyle(
            image,
            "position",
            "relative"
        );

        setImportantStyle(
            image,
            "left",
            `${ICON_X}px`
        );

        setImportantStyle(
            image,
            "top",
            `${ICON_Y}px`
        );

        setImportantStyle(
            image,
            "filter",
            "none"
        );

        setImportantStyle(
            image,
            "opacity",
            "1"
        );

        setImportantStyle(
            image,
            "will-change",
            "auto"
        );

        setImportantStyle(
            image,
            "backface-visibility",
            "visible"
        );

        setImportantStyle(
            image,
            "border-radius",
            "0"
        );
    }

    /* =========================================================
       個別処理
       ========================================================= */

    async function processIcon(button) {
        const image =
            button.querySelector(
                "img"
            );

        if (!image) {
            return {
                rendered: false,
                reason:
                    "image-not-found"
            };
        }

        const source =
            getOriginalSource(
                image
            );

        if (!source) {
            return {
                rendered: false,
                reason:
                    "source-not-found"
            };
        }

        const expectedRenderKey =
            createRenderKey(
                source
            );

        const alreadyApplied =
            image.getAttribute(
                APPLIED_ATTRIBUTE
            ) === "true" &&
            image.getAttribute(
                RENDER_KEY_ATTRIBUTE
            ) === expectedRenderKey &&
            image.src.startsWith(
                "data:image/png"
            );

        if (alreadyApplied) {
            prepareLayout(
                button,
                image
            );

            return {
                rendered: true,
                newlyRendered: false,
                reason:
                    "already-rendered",
                renderKey:
                    expectedRenderKey
            };
        }

        const result =
            await renderSVGSource(
                source
            );

        if (!result.isSVG) {
            totalSkipped += 1;

            image.removeAttribute(
                ERROR_ATTRIBUTE
            );

            return {
                rendered: false,

                reason:
                    result.resource?.reason ||
                    "not-svg",

                contentType:
                    result.resource
                        ?.contentType ||
                    null
            };
        }

        if (!result.rendered) {
            return {
                rendered: false,
                reason:
                    "rendering-incomplete"
            };
        }

        image.setAttribute(
            ORIGINAL_SOURCE_ATTRIBUTE,
            source
        );

        image.removeAttribute(
            "srcset"
        );

        image.removeAttribute(
            "sizes"
        );

        image.src =
            result.generatedURL;

        image.setAttribute(
            APPLIED_ATTRIBUTE,
            "true"
        );

        image.setAttribute(
            RENDER_KEY_ATTRIBUTE,
            result.renderKey
        );

        image.setAttribute(
            SOURCE_TYPE_ATTRIBUTE,
            result.sourceType
        );

        image.removeAttribute(
            ERROR_ATTRIBUTE
        );

        image.alt = "";

        prepareLayout(
            button,
            image
        );

        totalRendered += 1;

        return {
            rendered: true,
            newlyRendered: true,

            sourceType:
                result.sourceType,

            contentType:
                result.contentType,

            loadingMethod:
                result.loadingMethod,

            harshStrokeSmoothingApplied:
                result
                    .harshStrokeSmoothingApplied,

            sourceNaturalSize:
                result.sourceNaturalSize,

            supersampledSize:
                result.supersampledSize,

            outputPixelSize:
                result.outputPixelSize,

            dpr:
                result.dpr,

            outputScale:
                result.outputScale
        };
    }

    /* =========================================================
       スキャン
       ========================================================= */

    async function scan() {
        if (
            destroyed ||
            scanRunning
        ) {
            return lastResult;
        }

        scanRunning = true;

        const buttons =
            Array.from(
                document.querySelectorAll(
                    ICON_BUTTON_SELECTOR
                )
            ).filter(button => {
                const rectangle =
                    button.getBoundingClientRect();

                return (
                    rectangle.width > 0 &&
                    rectangle.height > 0
                );
            });

        let rendered = 0;
        let newlyRendered = 0;
        let skipped = 0;
        let failed = 0;

        const results = [];

        try {
            for (const button of buttons) {
                try {
                    const result =
                        await processIcon(
                            button
                        );

                    results.push(
                        result
                    );

                    if (result.rendered) {
                        rendered += 1;

                        if (
                            result.newlyRendered
                        ) {
                            newlyRendered += 1;
                        }
                    } else {
                        skipped += 1;
                    }
                } catch (error) {
                    failed += 1;
                    totalFailed += 1;

                    const image =
                        button.querySelector(
                            "img"
                        );

                    const message =
                        error instanceof Error
                            ? error.message
                            : String(error);

                    if (image) {
                        image.setAttribute(
                            ERROR_ATTRIBUTE,
                            message
                        );
                    }

                    results.push({
                        rendered: false,
                        reason: "error",
                        error: message
                    });

                    console.error(
                        "[Constellucentia] Automatic SVG rendering failed:",
                        error
                    );
                }
            }

            lastScanAt =
                new Date().toISOString();

            lastResult = {
                iconsFound:
                    buttons.length,

                rendered,
                newlyRendered,
                skipped,
                failed,
                results
            };

            return lastResult;
        } finally {
            scanRunning = false;
        }
    }

    function scheduleScan() {
        if (destroyed) {
            return;
        }

        clearTimeout(
            scanTimer
        );

        scanTimer =
            window.setTimeout(
                scan,
                SCAN_DELAY
            );
    }

    function startObserver() {
        observer =
            new MutationObserver(
                mutations => {
                    for (
                        const mutation
                        of mutations
                    ) {
                        if (
                            mutation.type ===
                                "childList" ||
                            mutation.type ===
                                "attributes"
                        ) {
                            scheduleScan();
                            return;
                        }
                    }
                }
            );

        observer.observe(
            document.documentElement,
            {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: [
                    "src",
                    "srcset"
                ]
            }
        );

        window.addEventListener(
            "popstate",
            scheduleScan
        );

        window.addEventListener(
            "resize",
            scheduleScan
        );
    }

    /* =========================================================
       再描画
       ========================================================= */

    async function rerender() {
        resourceCache.clear();
        renderCache.clear();
        pendingCache.clear();

        const images =
            document.querySelectorAll(
                `img[${APPLIED_ATTRIBUTE}="true"]`
            );

        for (const image of images) {
            const originalSource =
                image.getAttribute(
                    ORIGINAL_SOURCE_ATTRIBUTE
                );

            if (originalSource) {
                image.src =
                    originalSource;
            }

            image.removeAttribute(
                APPLIED_ATTRIBUTE
            );

            image.removeAttribute(
                RENDER_KEY_ATTRIBUTE
            );

            image.removeAttribute(
                SOURCE_TYPE_ATTRIBUTE
            );

            image.removeAttribute(
                ERROR_ATTRIBUTE
            );
        }

        await new Promise(
            resolve => {
                requestAnimationFrame(
                    () => {
                        requestAnimationFrame(
                            resolve
                        );
                    }
                );
            }
        );

        return scan();
    }

    /* =========================================================
       状態確認
       ========================================================= */

    function status() {
        const buttons =
            Array.from(
                document.querySelectorAll(
                    ICON_BUTTON_SELECTOR
                )
            ).filter(button => {
                const rectangle =
                    button.getBoundingClientRect();

                return (
                    rectangle.width > 0 &&
                    rectangle.height > 0
                );
            });

        const icons =
            buttons.map(
                (button, index) => {
                    const image =
                        button.querySelector(
                            "img"
                        );

                    if (!image) {
                        return {
                            index,
                            imageFound: false
                        };
                    }

                    const computed =
                        getComputedStyle(
                            image
                        );

                    const originalSource =
                        image.getAttribute(
                            ORIGINAL_SOURCE_ATTRIBUTE
                        );

                    const renderKey =
                        image.getAttribute(
                            RENDER_KEY_ATTRIBUTE
                        );

                    const cachedRender =
                        renderKey
                            ? renderCache.get(
                                renderKey
                            )
                            : null;

                    return {
                        index,
                        imageFound: true,

                        applied:
                            image.getAttribute(
                                APPLIED_ATTRIBUTE
                            ) === "true",

                        detectedSourceType:
                            image.getAttribute(
                                SOURCE_TYPE_ATTRIBUTE
                            ),

                        error:
                            image.getAttribute(
                                ERROR_ATTRIBUTE
                            ),

                        originalSource:
                            originalSource
                                ? (
                                    originalSource.length >
                                    180
                                        ? originalSource.slice(
                                            0,
                                            180
                                        ) + "…"
                                        : originalSource
                                )
                                : null,

                        currentSourceType:
                            image.src.startsWith(
                                "data:image/png"
                            )
                                ? "supersampled-generated-png"
                                : image.src.startsWith(
                                    "data:image/svg+xml"
                                )
                                    ? "svg-data-uri"
                                    : "remote-source",

                        naturalSize: {
                            width:
                                image.naturalWidth,

                            height:
                                image.naturalHeight
                        },

                        displayedSize: {
                            width:
                                image
                                    .getBoundingClientRect()
                                    .width,

                            height:
                                image
                                    .getBoundingClientRect()
                                    .height
                        },

                        renderMetadata:
                            cachedRender
                                ? {
                                    outputScale:
                                        cachedRender
                                            .outputScale,

                                    outputPixelSize:
                                        cachedRender
                                            .outputPixelSize,

                                    supersampledSize:
                                        cachedRender
                                            .supersampledSize,

                                    dpr:
                                        cachedRender
                                            .dpr,

                                    harshStrokeSmoothingApplied:
                                        cachedRender
                                            .harshStrokeSmoothingApplied
                                }
                                : null,

                        computedStyle: {
                            width:
                                computed.width,

                            height:
                                computed.height,

                            imageRendering:
                                computed.imageRendering,

                            objectFit:
                                computed.objectFit,

                            transform:
                                computed.transform,

                            filter:
                                computed.filter,

                            opacity:
                                computed.opacity
                        }
                    };
                }
            );

        return {
            name:
                "Constellucentia — Automatic Supersampled SVG Icon Renderer",

            version:
                VERSION,

            configuration: {
                iconBoxSize:
                    `${ICON_BOX_SIZE}px`,

                iconDisplaySize:
                    `${ICON_DISPLAY_SIZE}px`,

                supersampleScale:
                    SUPERSAMPLE_SCALE,

                minimumOutputScale:
                    MIN_OUTPUT_SCALE,

                devicePixelRatio:
                    window.devicePixelRatio ||
                    1,

                effectiveDevicePixelRatio:
                    getEffectiveDPR(),

                effectiveOutputScale:
                    getOutputScale(),

                expectedOutputPixelSize:
                    Math.round(
                        ICON_DISPLAY_SIZE *
                        getOutputScale()
                    ),

                expectedSupersampledSize:
                    Math.round(
                        ICON_DISPLAY_SIZE *
                        getOutputScale() *
                        SUPERSAMPLE_SCALE
                    ),

                progressiveDownsampling:
                    USE_PROGRESSIVE_DOWNSAMPLING,

                smoothHarshStrokes:
                    SMOOTH_HARSH_STROKES,

                automaticDetection:
                    true,

                pageRegistration:
                    false,

                geometricPrecision:
                    true
            },

            totalDetected,
            totalRendered,
            totalSkipped,
            totalFailed,

            resourceCacheSize:
                resourceCache.size,

            renderCacheSize:
                renderCache.size,

            lastScanAt,
            lastResult,
            icons
        };
    }

    /* =========================================================
       停止
       ========================================================= */

    function destroy() {
        destroyed = true;

        clearTimeout(
            scanTimer
        );

        if (observer) {
            observer.disconnect();
            observer = null;
        }

        window.removeEventListener(
            "popstate",
            scheduleScan
        );

        window.removeEventListener(
            "resize",
            scheduleScan
        );

        resourceCache.clear();
        renderCache.clear();
        pendingCache.clear();

        if (
            PAGE_WINDOW[RUNTIME_KEY]
                ?.version === VERSION
        ) {
            delete PAGE_WINDOW[
                RUNTIME_KEY
            ];
        }

        console.info(
            "[Constellucentia] Automatic Supersampled SVG Icon Renderer stopped."
        );
    }

    /* =========================================================
       ScriptCatメニュー
       ========================================================= */

    GM_registerMenuCommand(
        "SVG｜高解像度で再検出・再描画",
        async () => {
            const result =
                await rerender();

            console.log(
                "[Constellucentia] High-resolution rerender result:",
                result
            );
        }
    );

    GM_registerMenuCommand(
        "SVG｜状態をコンソールへ表示",
        () => {
            console.log(
                status()
            );
        }
    );

    /* =========================================================
       公開API
       ========================================================= */

    PAGE_WINDOW[RUNTIME_KEY] = {
        version:
            VERSION,

        scan,
        rerender,
        status,
        destroy
    };

    /* =========================================================
       起動
       ========================================================= */

    startObserver();
    scan();

    console.info(
        `[Constellucentia] Automatic Supersampled SVG Icon Renderer v${VERSION} started.`,
        {
            automaticDetection:
                true,

            pageRegistration:
                false,

            displaySize:
                `${ICON_DISPLAY_SIZE}px`,

            supersampleScale:
                SUPERSAMPLE_SCALE,

            minimumOutputScale:
                MIN_OUTPUT_SCALE,

            devicePixelRatio:
                window.devicePixelRatio ||
                1,

            effectiveDevicePixelRatio:
                getEffectiveDPR(),

            effectiveOutputScale:
                getOutputScale(),

            expectedOutputPixelSize:
                Math.round(
                    ICON_DISPLAY_SIZE *
                    getOutputScale()
                ),

            expectedSupersampledSize:
                Math.round(
                    ICON_DISPLAY_SIZE *
                    getOutputScale() *
                    SUPERSAMPLE_SCALE
                ),

            smoothHarshStrokes:
                SMOOTH_HARSH_STROKES,

            geometricPrecision:
                true,

            progressiveDownsampling:
                USE_PROGRESSIVE_DOWNSAMPLING
        }
    );
})();
