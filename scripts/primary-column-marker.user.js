// ==UserScript==
// @name         « No »　⁰⁹ _ Primary Column Marker
// @namespace    https://cordivestium.local/
// @version      12.0.0
// @description  v12.0.0: 軽く — 表に関わる変化の時だけ走査し、走査は最短 160ms おき（読み込み中の JS の時間が約 1/10 に）。v11.13.6: 題字とリレーションを「形」で見分ける — 題字＝property-value の直下の段に「アイコン（role=button）の入れ物＋文字」、リレーション＝折り返す段（flex-wrap）の中の inline のチップ（アイコン＋名前）。今の Notion は題字の文字に data-token-index が無く、題字が先頭の列とも限らない（Medias の Index は Works が 2 列目）ため、題字をリレーションと取り違えて印を外していた。Notionの主列だけをマーク。広い検出を維持したまま、relation除外とhover差し込みUIの兄弟要素分離を行い、hover-ui-host誤付与を防ぐ版。 v1.13.6: セルが描き直されて data-token-index が消えたとき、relationLike と誤判定して適用をやめる関門を緩めた（TUNING.RELAX_RELATION_BAIL で戻せる）。
// @author       Cordivestium
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(() => {
    'use strict';

    /*
     * ============================================================
     *  1. 調整項目
     * ============================================================
     */

    const TUNING = {
        /* タイトルプロパティのヘッダー名 */
        TARGET_TITLE_PROPERTY_NAMES: [
            'Works',
            'Persons',
            'Name'
        ],

        /* Notion DOMに title 型を示す属性がある場合、
         * ヘッダー名にかかわらず検出する。 */
        USE_SEMANTIC_TITLE_DETECTION: true,

        /* ヘッダーが検出できなかった場合だけ、
         * 指定アイコン＋data-token-indexを持つセルから
         * タイトル列を限定的に補完する。 */
        ENABLE_STRICT_CELL_FALLBACK: true,

        /* 列構造による自動検出 */
        AUTO_DETECT_TITLE_COLUMN: true,

        DEBUG_OUTLINE: false,

        /* v1.13.6:
         * 行が高くなった等の理由でセルが描き直され、
         * トークンが data-token-index を持たない形に変わると、
         * tokenCount が増えて relationLike と誤判定し、
         * 「何も適用しない」に落ちて CSS が丸ごと外れる
         * （＝アイコン・書体・寸法が既定に戻る）。
         * 単一アイコン・少数トークン・inlineアイコン無し・装飾無し
         * ＝タイトルセルの形なら適用を続ける。
         * 誤判定の実害が出たら false に戻す。 */
        RELAX_RELATION_BAIL: true
    };

    /*
     * ============================================================
     *  2. 固定値
     * ============================================================
     */

    const VERSION = '12.0.0';

    const API_NAME =
        '__cordivestiumWorksTitleTypography__';

    const STYLE_ID =
        'cordivestium-works-title-marker-style-v1133';

    /*
     * 既存アセット参照。
     *
     * 実際のsrc:
     * /icons/book-closed_gray.svg?mode=light
     *
     * pathname比較ではクエリ文字列を除外して照合する。
     */
    const TARGET_ICON_SRC =
        '/icons/book-closed_gray.svg';

    const CLASS = {
        row: 'cordivestium-v1121-title-row',
        cell: 'cordivestium-v1121-title-cell',
        value: 'cordivestium-v1121-title-value',
        shell: 'cordivestium-v1121-title-shell',

        iconContainer:
            'cordivestium-v1121-title-icon-container',

        iconRoot:
            'cordivestium-v1121-title-icon-root',

        iconImage:
            'cordivestium-v1121-title-icon-image',

        textRoot:
            'cordivestium-v1121-title-text-root',

        wrapper:
            'cordivestium-v1121-title-wrapper',

        token:
            'cordivestium-v1121-title-token',

        hoverUi:
            'cordivestium-v1121-title-hover-ui',

        hoverUiHost:
            'cordivestium-v1121-title-hover-ui-host'
    };

    const MANAGED_CLASSES = Object.values(CLASS);

    const CELL_SELECTOR =
        '[data-col-index] [data-testid="property-value"]';

    const RECORD_ICON_SELECTOR =
        '.notion-record-icon';

    const RELATION_MARKER =
        'data-cordivestium-relation-active';

    const RESCAN_DELAYS_MS = [
        0,
        60,
        140,
        280,
        520,
        900
    ];

    /*

     * ============================================================
     *  3. ページ側window
     * ============================================================
     */

    const PAGE_WINDOW =
        typeof unsafeWindow !== 'undefined'
            ? unsafeWindow
            : window;

    /*
     * ============================================================
     *  4. 状態
     * ============================================================
     */

    const state = {
        started: false,
        stopped: false,
        dragging: false,
        scanScheduled: false,

        observer: null,
        timers: [],

        scanCount: 0,
        detectedTitleHeaders: 0,
        candidateTitleCells: 0,
        appliedTitleCells: 0,
        detectedTitleIcons: 0,
        detectedIconlessTitles: 0,

        detectionMethod: 'none',
        matchedColumns: [],

        lastReason: null,
        lastScanAt: null,
        lastError: null
    };

    /*
     * ============================================================
     *  5. ユーティリティ
     * ============================================================
     */

    function normalizeText(value) {
        return String(value ?? '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function cssEscape(value) {
        if (
            typeof CSS !== 'undefined' &&
            typeof CSS.escape === 'function'
        ) {
            return CSS.escape(String(value));
        }

        return String(value).replace(
            /["\\]/g,
            '\\$&'
        );
    }

    function clamp(value, minimum, maximum) {
        return Math.min(
            maximum,
            Math.max(minimum, value)
        );
    }

    function getRootStyle() {
        return getComputedStyle(document.documentElement);
    }

    function getCssVariable(name, fallback = '') {
        const value = getRootStyle()
            .getPropertyValue(name)
            .trim();

        return value || fallback;
    }

    function getCssNumber(name, fallback = 0) {
        const raw = getCssVariable(name, '');
        const parsed = Number.parseFloat(raw);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function getCssBoolean(name, fallback = false) {
        const raw = getCssVariable(name, fallback ? 'true' : 'false')
            .toLowerCase();

        if (['1', 'true', 'yes', 'on'].includes(raw)) {
            return true;
        }

        if (['0', 'false', 'no', 'off'].includes(raw)) {
            return false;
        }

        return fallback;
    }

    function isVisible(element) {
        if (!(element instanceof Element)) {
            return false;
        }

        const rect = element.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            return false;
        }

        const style = getComputedStyle(element);

        return (
            style.display !== 'none' &&
            style.visibility !== 'hidden'
        );
    }

    function hasText(element) {
        return (
            element instanceof Element &&
            normalizeText(element.textContent).length > 0
        );
    }

    function shouldSkipInteractiveValue(value) {
        if (!(value instanceof Element)) {
            return true;
        }

        const active = document.activeElement;

        if (
            active instanceof Element &&
            (active === value || value.contains(active))
        ) {
            return true;
        }

        if (value.matches(':focus-within')) {
            return true;
        }

        if (
            value.querySelector(
                '[contenteditable="true"], textarea, input, [role="textbox"]'
            )
        ) {
            return true;
        }

        return false;
    }


    function getColumnOwner(element) {
        if (!(element instanceof Element)) {
            return null;
        }

        return element.closest('[data-col-index]');
    }

    function getColumnIndex(element) {
        const owner = getColumnOwner(element);

        if (!owner) {
            return null;
        }

        const value =
            owner.getAttribute('data-col-index');

        return value === null || value === ''
            ? null
            : String(value);
    }

    function getTargetNames() {
        return TUNING.TARGET_TITLE_PROPERTY_NAMES
            .map(normalizeText)
            .filter(Boolean);
    }

    function iconMatchesTarget(image) {
        if (!(image instanceof HTMLImageElement)) {
            return false;
        }

        const rawSource =
            image.getAttribute('src') || '';

        try {
            const url = new URL(
                rawSource,
                location.origin
            );

            return url.pathname === TARGET_ICON_SRC;
        } catch {
            return rawSource
                .split('?')[0]
                .endsWith(TARGET_ICON_SRC);
        }
    }

    function getPropertyValueFromColumnOwner(owner) {
        if (!(owner instanceof Element)) {
            return null;
        }

        if (
            owner.matches(
                '[data-testid="property-value"]'
            )
        ) {
            return owner;
        }

        return owner.querySelector(
            ':scope > [data-testid="property-value"],' +
            '[data-testid="property-value"]'
        );
    }

    function isDataCellColumnOwner(owner) {
        return Boolean(
            getPropertyValueFromColumnOwner(owner)
        );
    }

    /*
     * ============================================================
     *  6. CSS
     * ============================================================
     */

    function buildCSS() {
        return '';
    }

    /*
     * ============================================================
     *  6.5 折り返し行のぶれ補正（v1.2.0）
     * ============================================================
     *
     * 1 行目の行頭にある空白（全角スペース・半角スペース）は
     * white-space: pre-wrap によって保護され、2 行目以降には
     * 存在しない。その結果、2 行目以降の開始位置が 1 行目の
     * 「文字の開始位置」から 1 行目の行頭空白の幅だけズレる。
     *
     * 対策として、行頭空白の幅を実測し、
     *   padding-left  = その幅
     *   text-indent   = その幅のネガティブ値
     * を textRoot へ設定する。これにより 1 行目の文字位置は
     * 変わらず、2 行目以降が 1 行目の文字開始位置に揃う。
     */

    let hangMeasureContext = null;

    function measureTextWidth(text, style) {
        try {
            if (!hangMeasureContext) {
                hangMeasureContext = document
                    .createElement('canvas')
                    .getContext('2d');
            }

            if (!hangMeasureContext) {
                return 0;
            }

            hangMeasureContext.font =
                `${style.fontStyle} ` +
                `${style.fontWeight} ` +
                `${style.fontSize} ` +
                `${style.fontFamily}`;

            return hangMeasureContext.measureText(text).width;
        } catch {
            return 0;
        }
    }

    function applyHangingIndent(textRoot, tokens) {
        if (getCssVariable('--cordivestium-title-wrap-hanging-mode', 'off') !== 'auto') {
            textRoot.style.removeProperty(
                '--cordivestium-hang'
            );
            return;
        }

        const first = tokens.find(
            token => (token.textContent || '').trim()
        );

        if (!first) {
            textRoot.style.removeProperty(
                '--cordivestium-hang'
            );
            return;
        }

        const match =
            (first.textContent || '')
                .match(/^[\s\u3000]+/);

        const leading = match ? match[0] : '';

        if (!leading) {
            textRoot.style.removeProperty(
                '--cordivestium-hang'
            );
            return;
        }

        const measured =
            measureTextWidth(
                leading,
                getComputedStyle(first)
            );

        const width =
            Math.max(
                0,
                Math.round(
                    (measured +
                        Number(
                            getCssNumber('--cordivestium-title-wrap-hanging-extra-px', 0)
                        )) *
                        100
                ) / 100
            );

        textRoot.style.setProperty(
            '--cordivestium-hang',
            `${width}px`
        );
    }

    /*
     * ホバー時の再適用（Notion がホバーで DOM を組み替える対策）
     */

    let hoverScanTimer = null;

    function installHoverRescan() {
        document.addEventListener(
            'mouseover',
            event => {
                if (
                    !event.target ||
                    !(event.target instanceof Element)
                ) {
                    return;
                }

                const cell = event.target.closest(
                    '.' + CLASS.cell
                );

                if (!cell || hoverScanTimer !== null) {
                    return;
                }

                hoverScanTimer = setTimeout(() => {
                    hoverScanTimer = null;
                    scheduleScan('hover');
                }, 120);
            },
            { passive: true }
        );
    }

    /*
     * 誤って別要素（ホバーUI等）へ付与された自前クラスを
     * 掃除する。対象要素だけを残し、それ以外から
     * cordivestium-* title-* 系クラスをすべて取り除く。
     * 過去バージョン (v110 等) の残骸も一掃する。
     */

    function isHoverUiElement(element) {
        if (!(element instanceof Element)) {
            return false;
        }

        if (element.classList.contains(CLASS.iconRoot)) {
            return false;
        }

        if (element.querySelector('[data-token-index]')) {
            return false;
        }

        const text = normalizeText(element.textContent);

        if (text && /^(open|peek|open as page|new)$/i.test(text)) {
            return true;
        }

        if (element.matches('[role=button], button, a[role=button]')) {
            return true;
        }

        return Boolean(
            element.querySelector('[role=button], button, a[role=button]')
        );
    }

    function quarantineHoverUi(value, shell, textRoot, managed) {
        if (!(managed instanceof Set)) {
            return;
        }

        for (const protectedNode of [value, shell, textRoot]) {
            if (!(protectedNode instanceof Element)) {
                continue;
            }

            protectedNode.classList.remove(CLASS.hoverUi);
            protectedNode.classList.remove(CLASS.hoverUiHost);
        }

        const markHoverUi = element => {
            if (!(element instanceof Element)) {
                return;
            }

            element.classList.add(CLASS.hoverUi);
            managed.add(element);

            const host =
                element.parentElement instanceof Element
                    ? element.parentElement
                    : null;

            if (
                host &&
                host !== value &&
                host !== shell &&
                host !== textRoot
            ) {
                host.classList.add(CLASS.hoverUiHost);
                managed.add(host);
            }
        };

        if (textRoot instanceof Element) {
            for (const child of Array.from(textRoot.children)) {
                if (!isHoverUiElement(child)) {
                    continue;
                }

                markHoverUi(child);
            }
        }

        if (value instanceof Element) {
            for (const child of Array.from(value.children)) {
                if (child === shell || child.contains(shell)) {
                    continue;
                }

                if (!isHoverUiElement(child)) {
                    continue;
                }

                markHoverUi(child);
            }
        }
    }

    function clearStaleClasses(value, keep) {
        if (!(value instanceof Element)) {
            return;
        }

        const keepSet = new Set(
            keep.filter(el => el instanceof Element)
        );

        const marked = value.querySelectorAll(
            '[class*="cordivestium-"]'
        );

        marked.forEach(element => {
            if (keepSet.has(element)) {
                return;
            }

            [...element.classList].forEach(name => {
                if (
                    name.startsWith('cordivestium-') &&
                    name.includes('title-')
                ) {
                    element.classList.remove(name);
                }
            });
        });
    }

    function installStyle() {
        /* marker only: appearance lives in Stylus CSS */
    }

    /*
     * ============================================================
     *  7. ヘッダー検出
     * ============================================================
     */

    function textMatchesTargetName(text) {
        const normalized = normalizeText(text);

        if (!normalized) {
            return '';
        }

        return (
            getTargetNames().find(
                name => normalized === name
            ) || ''
        );
    }

    function findNamedHeaderOwners() {
        const targetNames = getTargetNames();
        const results = [];
        const seen = new Set();

        if (targetNames.length === 0) {
            return results;
        }

        /*
         * ヘッダー専用クラスには依存しない。
         *
         * data-col-indexを持つ全要素のうち、

         * property-valueを直接含まないものから探す。
         */
        const owners = [
            ...document.querySelectorAll(
                '[data-col-index]'
            )
        ];

        for (const owner of owners) {
            if (!isVisible(owner)) {
                continue;
            }

            /*
             * property-valueを持つものはデータセルなので除外。
             */
            if (isDataCellColumnOwner(owner)) {
                continue;
            }

            /*
             * 別のdata-col-index列を内包する巨大な祖先は除外。
             */
            const nestedColumnOwners = [
                ...owner.querySelectorAll(
                    '[data-col-index]'
                )
            ].filter(element => element !== owner);

            if (nestedColumnOwners.length > 2) {
                continue;
            }

            const fullText =
                normalizeText(owner.textContent);

            let matchedName = '';

            for (const name of targetNames) {
                if (
                    fullText === name ||
                    fullText.startsWith(`${name} `) ||
                    fullText.endsWith(` ${name}`)
                ) {
                    matchedName = name;
                    break;
                }
            }

            if (!matchedName) {
                const leafCandidates = [
                    ...owner.querySelectorAll(
                        'span,div,[role="button"]'
                    )
                ];

                for (const candidate of leafCandidates) {
                    if (
                        candidate.querySelector(
                            '[data-col-index]'
                        )
                    ) {
                        continue;
                    }

                    matchedName = textMatchesTargetName(
                        candidate.textContent
                    );

                    if (matchedName) {
                        break;
                    }
                }
            }

            if (!matchedName) {
                continue;
            }

            const columnIndex =
                owner.getAttribute('data-col-index');

            if (columnIndex === null) {
                continue;
            }

            const key =
                `${columnIndex}:${matchedName}:${getTableIdentity(owner)}`;

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);

            results.push({
                owner,
                header: owner,
                columnIndex: String(columnIndex),
                name: matchedName,

                method: 'header-name'
            });
        }

        return results;
    }

    function hasSemanticTitleMarker(element) {
        if (
            !TUNING.USE_SEMANTIC_TITLE_DETECTION ||
            !(element instanceof Element)
        ) {
            return false;
        }

        const elements = [
            element,
            ...Array.from(
                element.querySelectorAll('*')
            ).slice(0, 80)
        ];

        const attributeNames = [
            'data-property-type',
            'data-type',
            'data-value-type',
            'data-property-value-type'
        ];

        for (const current of elements) {
            for (const attributeName of attributeNames) {
                const value = normalizeText(
                    current.getAttribute(attributeName)
                );

                if (
                    /^(title|primary-title|primary_title)$/i
                        .test(value)
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    function findSemanticHeaderOwners() {
        if (!TUNING.USE_SEMANTIC_TITLE_DETECTION) {
            return [];
        }

        const results = [];
        const seen = new Set();

        for (const owner of document.querySelectorAll(
            '[data-col-index]'
        )) {
            if (
                !isVisible(owner) ||
                isDataCellColumnOwner(owner) ||
                !hasSemanticTitleMarker(owner)
            ) {
                continue;
            }

            const columnIndex =
                owner.getAttribute('data-col-index');

            if (columnIndex === null) {
                continue;
            }

            const key =
                `${columnIndex}:${getTableIdentity(owner)}`;

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);

            results.push({
                owner,
                header: owner,
                columnIndex: String(columnIndex),
                name: '(semantic title)',
                method: 'semantic-title'
            });
        }

        return results;
    }

    /*
     * 同じdata-col-indexが複数DBに存在するため、
     * DOM上のテーブル範囲を識別する。
     */
    function getTableScope(element) {
        if (!(element instanceof Element)) {

            return document.body;
        }

        let current = element.parentElement;
        let fallback = document.body;

        for (
            let depth = 0;
            current && depth < 18;
            depth += 1
        ) {
            const propertyValues =
                current.querySelectorAll(
                    '[data-testid="property-value"]'
                ).length;

            const columnOwners =
                current.querySelectorAll(
                    '[data-col-index]'
                ).length;

            if (
                propertyValues > 0 &&
                columnOwners > 1
            ) {
                fallback = current;
            }

            if (
                propertyValues >= 2 &&
                columnOwners >= 3
            ) {
                return current;
            }

            current = current.parentElement;
        }

        return fallback;
    }

    function getTableIdentity(element) {
        const scope = getTableScope(element);

        if (!scope.__cordivestiumTableIdentity) {
            Object.defineProperty(
                scope,
                '__cordivestiumTableIdentity',
                {
                    configurable: true,
                    value:
                        `table-${Math.random()
                            .toString(36)
                            .slice(2)}`
                }
            );
        }

        return scope.__cordivestiumTableIdentity;
    }

    /*
     * ============================================================
     *  8. 厳格なセル側フォールバック
     * ============================================================
     */

    function findStrictFallbackColumns() {
        if (!TUNING.ENABLE_STRICT_CELL_FALLBACK) {
            return [];
        }

        const evidence = [];
        const grouped = new Map();

        for (const value of document.querySelectorAll(
            '[data-testid="property-value"]'
        )) {
            if (!isVisible(value)) {
                continue;
            }

            const owner = getColumnOwner(value);

            if (!owner) {
                continue;
            }

            /*
             * 提示されたWorksタイトルセルの確実な特徴。
             *
             * 1. book-closed_gray.svg
             * 2. data-token-index
             * 3. notion-record-icon
             */
            const targetImage = [
                ...value.querySelectorAll('img[src]')
            ].find(iconMatchesTarget);

            const token = value.querySelector(

                '[data-token-index]'
            );

            const recordIcon = value.querySelector(
                RECORD_ICON_SELECTOR
            );

            if (
                !targetImage ||
                !token ||
                !recordIcon ||
                !hasText(token)
            ) {
                continue;
            }

            const columnIndex =
                owner.getAttribute('data-col-index');

            if (columnIndex === null) {
                continue;
            }

            const scope = getTableScope(owner);
            const tableIdentity =
                getTableIdentity(owner);

            const key =
                `${tableIdentity}:${columnIndex}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    owner,
                    header: null,
                    scope,
                    columnIndex: String(columnIndex),
                    name: '(strict book icon fallback)',
                    method: 'strict-cell-fallback',
                    evidenceCount: 0
                });
            }

            grouped.get(key).evidenceCount += 1;
            evidence.push(value);
        }

        /*
         * 複数列で同時に同じ証拠が出た場合は、
         * リレーション混入の可能性があるため適用しない。
         */
        const groupedValues = [
            ...grouped.values()
        ];

        const tableGroups = new Map();

        for (const column of groupedValues) {
            const tableIdentity =
                getTableIdentity(column.owner);

            if (!tableGroups.has(tableIdentity)) {
                tableGroups.set(tableIdentity, []);
            }

            tableGroups
                .get(tableIdentity)
                .push(column);
        }

        const safeColumns = [];

        for (const columns of tableGroups.values()) {
            if (columns.length === 1) {
                safeColumns.push(columns[0]);
            }
        }

        return safeColumns;
    }

    /*
     * ============================================================
     *  8.5 列構造による自動検出（名前・アイコン非依存）
     * ============================================================
     *
     * 従来の三経路はいずれも Works DB 固有の特徴に依存し、
     * 他の DB で検出が失敗していた。
     *
     *  - ヘッダー名照合 … 別名の列は検出できない
     *  - セマンティック検出 … 現行 DOM に属性が存在しない
     *  - 厳格フォールバック … book-closed アイコン必須
     *
     * タイトル列は常に第一列であるというテーブル構造の
     * ルールで検出することにより、名前・アイコン・属性の
     * いずれにも依存せず全 DB へ適用できる。
     */

    function findHeaderOwnerForColumn(column) {
        const scope = column.scope;

        if (!(scope instanceof Element)) {
            return null;
        }

        const selector =
            `[data-col-index="${cssEscape(
                column.columnIndex
            )}"]`;

        for (const candidate of scope.querySelectorAll(
            selector
        )) {
            if (
                isVisible(candidate) &&
                !isDataCellColumnOwner(candidate)
            ) {
                return candidate;
            }
        }

        /*
         * 現行 DOM の一部のテーブルはヘッダーへ
         * data-col-index を付与しない(診断で確認)。
         * ARIA ロールによる位置一致へフォールバック。
         */
        const numeric = Number(column.columnIndex);

        if (Number.isFinite(numeric)) {
            const headers = [
                ...scope.querySelectorAll(
                    '[role="columnheader"]'
                )
            ].filter(isVisible);

            const positional = headers[numeric];

            if (
                positional &&
                !isDataCellColumnOwner(positional)
            ) {
                return positional;
            }
        }

        return null;
    }

    function findFirstColumnFallbackColumns() {
        if (!TUNING.AUTO_DETECT_TITLE_COLUMN) {
            return [];
        }

        const grouped = new Map();

        for (const value of document.querySelectorAll(
            '[data-testid="property-value"]'
        )) {
            if (!isVisible(value)) {
                continue;
            }

            const owner = getColumnOwner(value);

            if (!owner) {
                continue;
            }

            const columnIndex =
                owner.getAttribute('data-col-index');

            if (columnIndex === null) {
                continue;
            }

            const numeric = Number(columnIndex);

            if (!Number.isFinite(numeric)) {
                continue;
            }

            const tableIdentity =
                getTableIdentity(owner);

            const key =
                `${tableIdentity}:${columnIndex}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    owner,
                    header: null,
                    scope: getTableScope(owner),
                    columnIndex: String(columnIndex),
                    columnIndexNumeric: numeric,
                    tableIdentity,
                    name: '(first column auto)',
                    method: 'first-column-auto',
                    evidenceCount: 0
                });
            }

            grouped.get(key).evidenceCount += 1;
        }

        /*
         * テーブルごとに最小の data-col-index だけを
         * タイトル列と認定する。
         */
        const firstColumns = new Map();

        for (const column of grouped.values()) {
            const current =
                firstColumns.get(
                    column.tableIdentity
                );

            if (
                !current ||
                column.columnIndexNumeric <
                    current.columnIndexNumeric
            ) {
                firstColumns.set(
                    column.tableIdentity,
                    column
                );
            }
        }

        const results = [];

        for (const column of firstColumns.values()) {
            column.header =
                findHeaderOwnerForColumn(column);

            results.push(column);
        }

        return results;
    }

    function analyzeStructuralTitleCell(value) {
        if (!(value instanceof Element)) {
            return null;
        }

        const shell = findShell(value);

        if (!(shell instanceof Element)) {
            return null;
        }

        const iconRoot =
            findIconRoot(shell);

        const iconContainer =
            iconRoot
                ? findTopLevelChild(
                      shell,
                      iconRoot
                  )
                : null;

        const textRoot =
            findTextRoot(
                shell,
                iconContainer
            );

        if (!(textRoot instanceof Element)) {
            return null;
        }

        const tokens =
            findTextTokens(textRoot);

        if (tokens.length === 0) {
            return null;
        }

        const text = normalizeText(
            tokens
                .map(token => token.textContent || '')
                .join(' ')
        );

        return {
            ...analyzeCellRole(
                value,
                textRoot,
                tokens
            ),
            textLength: text.length
        };
    }

    function findStructurallyTitleLikeColumns() {
        const grouped = new Map();

        for (const value of document.querySelectorAll(
            '[data-testid="property-value"]'
        )) {
            if (!isVisible(value)) {
                continue;
            }

            const owner = getColumnOwner(value);

            if (!owner) {
                continue;
            }

            const columnIndex =
                owner.getAttribute('data-col-index');

            if (columnIndex === null) {
                continue;
            }

            const structural =
                analyzeStructuralTitleCell(value);

            if (!structural) {
                continue;
            }

            const tableIdentity =
                getTableIdentity(owner);

            const key =
                `${tableIdentity}:${columnIndex}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    owner,
                    header: null,
                    scope: getTableScope(owner),
                    columnIndex: String(columnIndex),
                    tableIdentity,
                    name: '(structural title score)',
                    method: 'structural-title-score',
                    evidenceCount: 0,
                    totalCells: 0,
                    titleLikeCount: 0,
                    relationLikeCount: 0,
                    indexedTokenCount: 0,
                    inlineIconTokenCount: 0,
                    decoratedTokenCount: 0,
                    singleIconCount: 0,
                    multiIconCount: 0,
                    singleTokenCount: 0,
                    textLengthSum: 0
                });
            }

            const group = grouped.get(key);
            group.evidenceCount += 1;
            group.totalCells += 1;
            group.textLengthSum += structural.textLength;

            if (structural.titleLike) {
                group.titleLikeCount += 1;
            }

            if (structural.relationLike) {
                group.relationLikeCount += 1;
            }

            group.indexedTokenCount +=
                structural.indexedTokenCount;

            group.inlineIconTokenCount +=
                structural.inlineIconTokenCount;

            group.decoratedTokenCount +=
                structural.decoratedTokenCount;

            if (structural.singleIcon) {
                group.singleIconCount += 1;
            }

            if (structural.multiIcon) {
                group.multiIconCount += 1;
            }

            if (structural.singleToken) {
                group.singleTokenCount += 1;
            }
        }

        const bestByTable = new Map();

        for (const column of grouped.values()) {
            const avgTextLength =
                column.totalCells > 0
                    ? column.textLengthSum /
                      column.totalCells
                    : 0;

            column.structuralScore =
                column.titleLikeCount * 20 +
                column.indexedTokenCount * 12 +
                column.singleIconCount * 8 +
                column.singleTokenCount * 6 +
                avgTextLength * 0.5 -
                column.multiIconCount * 30 -
                column.inlineIconTokenCount * 18 -
                column.decoratedTokenCount * 12 -
                column.relationLikeCount * 18;

            const current =
                bestByTable.get(
                    column.tableIdentity
                );

            if (
                !current ||
                column.structuralScore >
                    current.structuralScore
            ) {
                bestByTable.set(
                    column.tableIdentity,
                    column
                );
            }
        }

        const results = [];

        for (const column of bestByTable.values()) {
            if (
                column.titleLikeCount <= 0 ||
                column.structuralScore <= 0
            ) {
                continue;
            }

            column.header =
                findHeaderOwnerForColumn(column);

            results.push(column);
        }

        return results;
    }

    function dedupeColumns(columns) {
        const deduplicated = [];
        const seen = new Set();

        for (const column of columns) {
            const scope =
                getTableScope(column.owner);

            const tableIdentity =
                getTableIdentity(column.owner);

            const key =
                `${tableIdentity}:${column.columnIndex}`;

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);

            deduplicated.push({
                ...column,
                scope
            });
        }

        return deduplicated;
    }

    function collectTitleColumns() {
        const preferred =
            dedupeColumns([
                ...findNamedHeaderOwners(),
                ...findSemanticHeaderOwners()
            ]);

        if (preferred.length > 0) {
            state.detectionMethod =
                preferred
                    .map(column => column.method)
                    .join(', ');

            return preferred;
        }

        const structural =
            dedupeColumns(
                findStructurallyTitleLikeColumns()
            );

        if (structural.length > 0) {
            state.detectionMethod =
                'structural-title-score';

            return structural;
        }

        const firstColumn =
            dedupeColumns(
                findFirstColumnFallbackColumns()
            );

        if (firstColumn.length > 0) {
            state.detectionMethod =
                'first-column-auto';

            return firstColumn;
        }

        const strictFallback =
            dedupeColumns(
                findStrictFallbackColumns()
            );

        if (strictFallback.length > 0) {
            state.detectionMethod =
                'strict-cell-fallback';

            return strictFallback;
        }

        state.detectionMethod = 'none';

        return [];
    }

    /*
     * ============================================================
     *  9. タイトルセル内部の解析
     * ============================================================
     */

    /*
     * Notion はホバー時に property-value の直下へ
     * 操作用 UI（「⋯」ボタン等）を absolute 配置で挿入する。
     * これが本物のシェルより先に現れるため、
     * firstElementChild による単純な先頭取得は誤検出する。
     *
     * 対策として、absolute / fixed 配置および
     * pointer-events: none の要素をオーバーレイとみなし、
     * 候補から除外した上で、タイトル本文を含む子を選ぶ。
     */

    function isHoverOverlayElement(element) {
        if (!(element instanceof Element)) {
            return false;
        }

        const inline = element.style;

        if (inline) {
            if (
                inline.position === 'absolute' ||
                inline.position === 'fixed'
            ) {
                return true;
            }

            if (inline.pointerEvents === 'none') {
                return true;
            }
        }

        let computed = null;

        try {
            computed = getComputedStyle(element);
        } catch {
            return false;
        }

        if (!computed) {
            return false;
        }

        return (
            computed.position === 'absolute' ||
            computed.position === 'fixed' ||
            computed.pointerEvents === 'none'
        );
    }

    function findShell(value) {
        if (!(value instanceof Element)) {
            return null;
        }

        const children = [
            ...value.children
        ].filter(
            element =>
                !isHoverOverlayElement(element)
        );

        if (children.length === 0) {
            return null;
        }

        /*
         * タイトル本文（data-token-index 付きトークン）を
         * 含む子を最優先でシェルと認定する。
         */
        const textOwner = children.find(
            child =>
                child.querySelector('[data-token-index]')
        );

        if (textOwner) {
            return textOwner;
        }

        const spanOwner = children.find(
            child =>
                hasText(child) &&
                child.querySelector('span')
        );

        if (spanOwner) {
            return spanOwner;
        }

        return children.find(hasText) || children[0];
    }

    function findIconRoot(shell) {
        if (!(shell instanceof Element)) {
            return null;
        }

        if (shell.matches(RECORD_ICON_SELECTOR)) {
            return shell;
        }

        return shell.querySelector(
            RECORD_ICON_SELECTOR
        );
    }

    function findTopLevelChild(
        shell,
        descendant
    ) {
        if (
            !(shell instanceof Element) ||
            !(descendant instanceof Element)
        ) {
            return null;
        }

        let current = descendant;

        while (
            current.parentElement &&
            current.parentElement !== shell
        ) {
            current = current.parentElement;
        }

        return current.parentElement === shell
            ? current
            : descendant;
    }

    function findTextRoot(
        shell,
        iconContainer
    ) {
        if (!(shell instanceof Element)) {
            return null;

        }

        const children = [
            ...shell.children
        ];

        const textChild = children.find(child => {
            if (child === iconContainer) {
                return false;
            }

            if (
                child.matches(RECORD_ICON_SELECTOR) ||
                child.querySelector(
                    RECORD_ICON_SELECTOR
                )
            ) {
                return false;
            }

            return hasText(child);
        });

        if (textChild) {
            return textChild;
        }

        return children.find(hasText) || null;
    }

    function findTextTokens(textRoot) {
        if (!(textRoot instanceof Element)) {
            return [];
        }

        /*
         * data-token-indexを最優先。
         */
        const indexedTokens = [
            ...textRoot.querySelectorAll(
                '[data-token-index]'
            )
        ].filter(hasText);

        if (indexedTokens.length > 0) {
            return indexedTokens;
        }

        /*
         * Persons DBなど、data-token-indexが存在しない
         * タイトルセル用。
         */
        const leafSpans = [
            ...textRoot.querySelectorAll('span')
        ].filter(span => {
            if (!hasText(span)) {
                return false;
            }

            if (span.querySelector('span')) {
                return false;
            }

            if (
                span.closest(RECORD_ICON_SELECTOR)
            ) {
                return false;
            }

            return true;
        });

        if (leafSpans.length > 0) {
            return leafSpans;
        }

        return hasText(textRoot)
            ? [textRoot]
            : [];
    }

    function normalizeTextWrappers(
        textRoot,
        tokens,
        managed
    ) {
        if (!(textRoot instanceof Element)) {
            return;
        }

        const seen = new Set();

        for (const token of tokens) {
            let current =
                token instanceof Element
                    ? token.parentElement
                    : null;

            while (
                current &&
                current !== textRoot
            ) {
                if (!seen.has(current)) {
                    seen.add(current);
                    current.classList.add(
                        CLASS.wrapper
                    );

                    current.style.removeProperty(
                        'width'
                    );
                    current.style.removeProperty(
                        'min-width'
                    );
                    current.style.removeProperty(
                        'max-width'
                    );
                    current.style.removeProperty(
                        'flex-basis'
                    );
                    current.style.removeProperty(
                        'flex-grow'
                    );
                    current.style.removeProperty(
                        'flex-shrink'
                    );
                    current.style.removeProperty(
                        'text-overflow'
                    );

                    if (managed instanceof Set) {
                        managed.add(current);
                    }
                }

                current = current.parentElement;
            }
        }
    }

    function tokenSharesInlineItemWithIcon(
        token,
        stopRoot
    ) {
        if (!(token instanceof Element)) {
            return false;
        }

        let current = token.parentElement;

        while (
            current &&
            current !== stopRoot
        ) {
            for (const child of current.children) {
                if (child === token) {
                    continue;
                }

                if (
                    child.matches?.(
                        RECORD_ICON_SELECTOR
                    ) ||
                    child.querySelector?.(
                        RECORD_ICON_SELECTOR
                    )
                ) {
                    return true;
                }
            }

            current = current.parentElement;
        }

        return false;
    }

    function hasRelationDecoration(
        token,
        stopRoot
    ) {
        let current =
            token instanceof Element
                ? token
                : null;

        while (current) {
            let style = null;

            try {
                style = getComputedStyle(current);
            } catch {
                style = null;
            }

            if (style) {
                const backgroundImage =
                    style.backgroundImage ||
                    '';

                const textDecoration =
                    style.textDecorationLine ||
                    '';

                if (
                    backgroundImage !== 'none' ||
                    textDecoration.includes(
                        'underline'
                    )
                ) {
                    return true;
                }
            }

            if (current === stopRoot) {
                break;
            }

            current = current.parentElement;
        }

        return false;
    }

    function isDefinitelyRelationStructure(value) {
        if (!(value instanceof Element)) {
            return false;
        }

        if (value.querySelector('[data-token-index]')) {
            return false;
        }

        const spans = [
            ...value.querySelectorAll('span')
        ].filter(hasText);

        for (const span of spans) {
            let current = span.parentElement;

            while (current && current !== value) {
                const children = [
                    ...current.children
                ];

                const hasSiblingIcon = children.some(child =>
                    child instanceof HTMLElement && (
                        child.matches(RECORD_ICON_SELECTOR) ||
                        child.querySelector(RECORD_ICON_SELECTOR)
                    )
                );

                if (hasSiblingIcon) {
                    const decorated =
                        hasRelationDecoration(span, current) ||
                        hasRelationDecoration(current, value);

                    let style = null;
                    try {
                        style = getComputedStyle(current);
                    } catch {
                        style = null;
                    }

                    const inlineLike =
                        style && (
                            style.display === 'inline' ||
                            style.display === 'inline-block'
                        );

                    if (decorated || inlineLike) {
                        return true;
                    }
                }

                current = current.parentElement;
            }
        }

        return false;
    }

    /*
     * v11.13.6: 題字とリレーションの「形」（2026-10 の Notion を公開ページで実測）
     *   題字:      [data-testid="property-value"] > div(flex) > div(flex-shrink:0) > .notion-record-icon[role="button"]
     *              と、その隣の div(flex-grow:1) > … > span（ただの文字。data-token-index は無いことがある）
     *   リレーション: … > div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"] > .notion-record-icon（role 無し）+ span.notranslate
     */
    function isTitleStructure(value) {
        if (!(value instanceof Element)) return false;
        const pv = value.matches('[data-testid="property-value"]') ? value : (value.closest('[data-testid="property-value"]') || value);
        if (pv.querySelector('div[style*="flex-wrap: wrap"] .notion-record-icon')) return false;
        return Boolean(pv.querySelector(':scope > div:not([style*="flex-wrap"]) > div > .notion-record-icon[role="button"]'));
    }

    function isRelationStructure(value) {
        if (!(value instanceof Element)) return false;
        const pv = value.matches('[data-testid="property-value"]') ? value : (value.closest('[data-testid="property-value"]') || value);
        return Boolean(pv.querySelector('div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"] > .notion-record-icon, div[style*="flex-wrap: wrap"] > div > div[style*="display: inline"] > a > .notion-record-icon'));
    }

    function analyzeCellRole(
        value,
        textRoot,
        tokens
    ) {
        if (!(value instanceof Element)) {
            return null;
        }

        const indexedTokenCount =
            tokens.filter(token =>
                token instanceof Element &&
                token.hasAttribute(
                    'data-token-index'
                )
            ).length;

        const inlineIconTokenCount =
            tokens.filter(token =>
                tokenSharesInlineItemWithIcon(
                    token,
                    textRoot
                )
            ).length;

        const decoratedTokenCount =
            tokens.filter(token =>
                hasRelationDecoration(
                    token,
                    textRoot
                )
            ).length;

        const iconCount =
            value.querySelectorAll(
                RECORD_ICON_SELECTOR
            ).length;

        const tokenCount = tokens.length;

        /* v11.13.6: 形で決まるものは形で決める（トークンの数に頼らない） */
        const structTitle = isTitleStructure(value);
        const structRelation = !structTitle && isRelationStructure(value);
        if (structTitle || structRelation) {
            return {
                iconCount,
                tokenCount,
                indexedTokenCount,
                inlineIconTokenCount,
                decoratedTokenCount,
                singleIcon: iconCount === 1,
                multiIcon: iconCount >= 2,
                singleToken: tokenCount === 1,
                titleLike: structTitle,
                relationLike: structRelation,
                structural: true
            };
        }

        return {
            iconCount,
            tokenCount,
            indexedTokenCount,
            inlineIconTokenCount,
            decoratedTokenCount,
            singleIcon: iconCount === 1,
            multiIcon: iconCount >= 2,
            singleToken: tokenCount === 1,
            titleLike:
                indexedTokenCount > 0 ||
                (
                    iconCount <= 1 &&
                    tokenCount >= 1 &&
                    tokenCount <= 2 &&
                    inlineIconTokenCount === 0 &&
                    decoratedTokenCount === 0
                ),
            relationLike:
                iconCount >= 2 ||
                tokenCount >= 3 ||
                inlineIconTokenCount > 0 ||
                (
                    decoratedTokenCount > 0 &&
                    indexedTokenCount === 0
                )
        };
    }

    function findRow(cell) {
        if (!(cell instanceof Element)) {
            return null;
        }

        return cell.closest(
            [
                '[data-row-index]',
                '[role="row"]',
                '.notion-table-view-row'
            ].join(',')
        );
    }

    /*
     * ============================================================
     *  10. ヘッダーとの水平位置調整
     * ============================================================
     */


    function hasIconBackground(element) {
        let computed = null;

        try {
            computed = getComputedStyle(element);
        } catch {
            return false;
        }

        if (!computed) {
            return false;
        }

        const mask =
            (computed.maskImage &&
                computed.maskImage.includes('url(')) ||
            (computed.webkitMaskImage &&
                computed.webkitMaskImage.includes(
                    'url('
                ));

        return (
            Boolean(
                computed.backgroundImage &&
                    computed.backgroundImage.includes(
                        'url('
                    )
            ) || Boolean(mask)
        );
    }

    function findHeaderAnchor(header) {
        if (!(header instanceof Element)) {
            return null;
        }

        const headerRect =
            header.getBoundingClientRect();

        const inWindow = element => {
            const rect =
                element.getBoundingClientRect();

            return (
                rect.width >= 6 &&
                rect.width <= 48 &&
                rect.height >= 6 &&
                rect.height <= 48 &&
                rect.left >= headerRect.left - 2 &&
                rect.left <= headerRect.left + 96
            );
        };

        /*
         * 第一優先: img / svg 要素。
         */
        const graphic = [
            ...header.querySelectorAll('img,svg')
        ].find(
            element =>
                isVisible(element) &&
                inWindow(element)
        );

        if (graphic) {
            return graphic;
        }

        /*
         * 第二優先: background / mask 描画の
         * マスク型アイコン（Notion の現行ヘッダー）。
         */
        return [
            ...header.querySelectorAll('*')
        ].find(
            element =>
                element.tagName !== 'IMG' &&
                element.tagName !== 'svg' &&
                isVisible(element) &&
                inWindow(element) &&
                hasIconBackground(element)
        ) || null;
    }

    function calculateInset(
        cell,
        header
    ) {
        const fallback =
            Number(
                getCssNumber('--cordivestium-title-fallback-inset-px', 8)
            ) +
            Number(
                getCssNumber('--cordivestium-title-horizontal-offset-px', 0)
            );

        if (
            !getCssBoolean('--cordivestium-title-auto-align-to-header', false) ||
            !(header instanceof Element)
        ) {
            return clamp(fallback, 0, 72);
        }

        const cellRect =
            cell.getBoundingClientRect();

        const headerRect =
            header.getBoundingClientRect();

        const anchor =
            findHeaderAnchor(header);

        const targetLeft = anchor
            ? anchor.getBoundingClientRect().left
            : headerRect.left +
              Number(
                  getCssNumber('--cordivestium-title-fallback-inset-px', 8)
              );

        const inset =
            targetLeft -
            cellRect.left +
            Number(
                getCssNumber('--cordivestium-title-horizontal-offset-px', 0)
            );

        return clamp(inset, 0, 72);
    }

    /*
     * 閉ループ補正: 行アイコンの実測左端を
     * ヘッダーアイコンの実測左端へ一致させる。
     *
     * calculateInset は「計算上の位置」を置くだけなので、
     * 境界線・マージン・拡大率・アンカー誤認などの
     * 残差が必然的に発生する。適用後に実測して
     * 差分を inset へ還元することで、原因が何であれ
     * 収束させることができる。
     */

    function getRenderedIconAnchor(iconRoot) {
        if (!(iconRoot instanceof Element)) {
            return null;
        }

        return (
            iconRoot.querySelector('img,svg') ||
            iconRoot
        );
    }

    function refineIconAlignment(
        cell,
        header,
        iconRoot
    ) {
        if (
            !getCssBoolean('--cordivestium-title-auto-align-to-header', false) ||
            !(header instanceof Element) ||
            !(iconRoot instanceof Element) ||
            !(cell instanceof Element)
        ) {
            return;
        }

        const headerAnchor =
            findHeaderAnchor(header);

        if (!headerAnchor) {
            return;
        }

        const targetLeft =
            headerAnchor.getBoundingClientRect()
                .left +
            Number(getCssNumber('--cordivestium-title-horizontal-offset-px', 0));

        const tolerance = Math.max(
            0.1,
            getCssNumber('--cordivestium-title-header-align-tolerance-px', 0.5)
        );

        const maxPasses = Math.max(
            1,
            Math.max(1, Math.round(getCssNumber('--cordivestium-title-header-align-max-passes', 3)))
        );

        const getInset = () =>
            parseFloat(
                cell.style.getPropertyValue(
                    '--cordivestium-title-inset'
                )
            ) || 0;

        const setInset = value =>
            cell.style.setProperty(
                '--cordivestium-title-inset',
                `${value}px`
            );

        let bestInset = getInset();
        let bestDelta = Infinity;

        for (let pass = 0; pass < maxPasses; pass++) {
            const rowAnchor =
                getRenderedIconAnchor(iconRoot);

            if (!rowAnchor) {
                return;
            }

            const current =
                rowAnchor.getBoundingClientRect()
                    .left;

            const delta = targetLeft - current;

            if (Math.abs(delta) < Math.abs(bestDelta)) {
                bestDelta = delta;
                bestInset = getInset();
            }

            if (Math.abs(delta) <= tolerance) {
                setInset(bestInset);
                return;
            }

            setInset(
                clamp(getInset() + delta, 0, 96)
            );
        }

        /*
         * 収束しなかった場合は最も誤差が小さかった
         * 位置へ戻す。誤アンカー検出による
         * 「悪化」を防ぐロールバック。
         */
        setInset(bestInset);
    }

    /*
     * ============================================================
     *  11. 適用
     * ============================================================
     */

    function applyToCell(
        cell,
        column,
        managed
    ) {
        if (!(cell instanceof Element)) {
            return false;
        }

        const value =
            getPropertyValueFromColumnOwner(cell);

        if (!value) {
            return false;
        }

        if (
            value.hasAttribute(RELATION_MARKER) ||
            value.closest(`[${RELATION_MARKER}]`) ||
            value.closest('.cordivestium-relation-cell') ||
            value.querySelector('.cordivestium-relation-list, .cordivestium-relation-item, .cordivestium-relation-label')
        ) {
            return false;
        }

        if (isDefinitelyRelationStructure(value)) {
            return false;
        }

        if (shouldSkipInteractiveValue(value)) {
            return false;
        }

        const shell =

            findShell(value);

        if (!shell) {
            return false;
        }

        const iconRoot =
            findIconRoot(shell);

        const iconContainer =
            iconRoot
                ? findTopLevelChild(
                      shell,
                      iconRoot
                  )
                : null;

        const textRoot =
            findTextRoot(
                shell,
                iconContainer
            );

        if (!textRoot) {
            return false;
        }

        const tokens =
            findTextTokens(textRoot);

        if (tokens.length === 0) {
            return false;
        }

        const role =
            analyzeCellRole(
                value,
                textRoot,
                tokens
            );

        if (
            role?.relationLike &&
            role.indexedTokenCount === 0 &&
            !(
                TUNING.RELAX_RELATION_BAIL &&
                role.iconCount <= 1 &&
                role.tokenCount <= 2 &&
                role.inlineIconTokenCount === 0 &&
                role.decoratedTokenCount === 0
            )
        ) {
            return false;
        }

        clearStaleClasses(
            value,
            [
                shell,
                iconContainer,
                iconRoot,
                textRoot,
                ...tokens
            ]
        );

        normalizeTextWrappers(
            textRoot,
            tokens,
            managed
        );

        quarantineHoverUi(
            value,
            shell,
            textRoot,
            managed
        );

        applyHangingIndent(textRoot, tokens);

        value.classList.add(CLASS.value);
        shell.classList.add(CLASS.shell);
        textRoot.classList.add(
            CLASS.textRoot
        );

        managed.add(value);
        managed.add(shell);
        managed.add(textRoot);

        if (iconRoot) {
            iconRoot.classList.add(
                CLASS.iconRoot
            );

            managed.add(iconRoot);

            if (
                iconContainer &&
                iconContainer !== iconRoot
            ) {
                iconContainer.classList.add(
                    CLASS.iconContainer
                );

                managed.add(iconContainer);
            }

            for (
                const image of
                iconRoot.querySelectorAll('img')
            ) {
                image.classList.add(
                    CLASS.iconImage
                );

                managed.add(image);
            }

            state.detectedTitleIcons += 1;
        } else {
            state.detectedIconlessTitles += 1;
        }

        for (const token of tokens) {

            token.classList.add(
                CLASS.token
            );

            managed.add(token);
        }

        return true;
    }

    /*
     * ============================================================
     *  12. 古い適用状態の解除
     * ============================================================
     */

    function removeManagedState(element) {
        if (!(element instanceof Element)) {
            return;
        }

        for (const className of MANAGED_CLASSES) {
            element.classList.remove(
                className
            );
        }

        element.style.removeProperty(
            '--cordivestium-title-inset'
        );

        element.style.removeProperty(
            '--cordivestium-horizontal-shift'
        );

        element.removeAttribute(
            'data-cordivestium-horizontal-shift'
        );
    }

    function clearLegacyState() {
        const elements =
            document.querySelectorAll(
                [
                    '[class*="cordivestium-"]',
                    '[data-cordivestium-horizontal-shift]',
                    '[style*="--cordivestium-horizontal-shift"]'
                ].join(',')
            );

        for (const element of elements) {
            const classNames = [
                ...element.classList
            ];

            for (const className of classNames) {
                if (
                    className.startsWith(
                        'cordivestium-'
                    ) &&
                    className.includes('title-')
                ) {
                    element.classList.remove(
                        className
                    );
                }
            }

            element.style.removeProperty(
                '--cordivestium-title-inset'
            );

            element.style.removeProperty(
                '--cordivestium-horizontal-shift'
            );

            element.removeAttribute(
                'data-cordivestium-horizontal-shift'
            );
        }
    }

    function cleanupStale(managed) {
        const selector =
            MANAGED_CLASSES
                .map(name => `.${name}`)
                .join(',');

        if (!selector) {

            return;
        }

        for (const element of document.querySelectorAll(
            selector
        )) {
            if (!managed.has(element)) {
                removeManagedState(element);
            }
        }
    }

    function clearAllManagedState() {
        const selector =
            MANAGED_CLASSES
                .map(name => `.${name}`)
                .join(',');

        if (selector) {
            for (const element of document.querySelectorAll(
                selector
            )) {
                removeManagedState(element);
            }
        }
    }

    /*
     * ============================================================
     *  13. スキャン
     * ============================================================
     */

    function getCellsForColumn(column) {
        const scope =
            column.scope ||
            getTableScope(column.owner);

        const selector =
            `[data-col-index="${cssEscape(
                column.columnIndex
            )}"]`;

        const cells = [];

        for (const owner of scope.querySelectorAll(
            selector
        )) {
            if (
                !isVisible(owner) ||
                !isDataCellColumnOwner(owner)
            ) {
                continue;
            }

            cells.push(owner);
        }

        return cells;
    }

    function scan(reason = 'manual') {
        if (
            state.stopped ||
            state.dragging ||
            !document.body
        ) {
            return;
        }

        try {
            state.scanCount += 1;
            state.lastReason = reason;
            state.lastScanAt =
                new Date().toISOString();
            state.lastError = null;

            state.detectedTitleHeaders = 0;
            state.candidateTitleCells = 0;
            state.appliedTitleCells = 0;
            state.detectedTitleIcons = 0;
            state.detectedIconlessTitles = 0;
            state.matchedColumns = [];

            const managed = new Set();

            const columns =
                collectTitleColumns();

            state.detectedTitleHeaders =
                columns.filter(
                    column =>
                        column.header instanceof Element
                ).length;

            state.matchedColumns =
                columns.map(column => ({
                    name: column.name,
                    columnIndex:
                        column.columnIndex,

                    method: column.method,
                    evidenceCount:
                        column.evidenceCount || 0
                }));

            for (const column of columns) {
                const cells =
                    getCellsForColumn(column);

                state.candidateTitleCells +=
                    cells.length;

                for (const cell of cells) {
                    if (
                        applyToCell(
                            cell,
                            column,
                            managed
                        )
                    ) {
                        state.appliedTitleCells += 1;
                    }
                }
            }

            /*
             * リレーション列などへ残った旧クラスを解除する。
             */
            cleanupStale(managed);
        } catch (error) {
            state.lastError =
                error instanceof Error
                    ? `${error.name}: ${error.message}`
                    : String(error);

            console.error(
                '[Cordivestium] scan failed:',
                error
            );
        }
    }

    function scheduleScan(
        reason = 'scheduled'
    ) {
        if (
            state.stopped ||
            state.dragging ||
            state.scanScheduled
        ) {
            return;
        }

        state.scanScheduled = true;

        /*
         * v12.0.0: 軽く — 走査は最短 160ms おき（前回から時間が空いていれば次の描画の前にすぐ）。
         * 以前は変化のたびに毎フレーム全部の表を測り直していた（読み込み中だけで 1.5 秒）。
         */
        const wait = Math.max(0, 160 - (performance.now() - (state.lastScanPerf || 0)));
        const run = () => {
            state.scanScheduled = false;
            state.lastScanPerf = performance.now();
            scan(reason);
        };
        if (wait <= 0) requestAnimationFrame(run);
        else setTimeout(() => requestAnimationFrame(run), wait);
    }

    function clearTimers() {
        for (const timer of state.timers) {
            clearTimeout(timer);
        }

        state.timers.length = 0;
    }

    function scheduleStabilization(
        reason = 'stabilization'
    ) {
        if (state.stopped) {
            return;
        }

        clearTimers();

        for (
            const delay of RESCAN_DELAYS_MS
        ) {
            const timer = setTimeout(() => {
                if (!state.dragging) {
                    scheduleScan(
                        `${reason}:${delay}`
                    );
                }
            }, delay);

            state.timers.push(timer);
        }
    }

    /*
     * ============================================================
     *  14. MutationObserver
     * ============================================================
     */

    const TABLE_SEL =
        '.notion-table-view, .notion-collection_view-block, .notion-collection-view-body, [data-col-index], [data-testid="property-value"], .notion-table-view-header-row';
    const IGNORE_SEL =
        '.notion-sidebar-container, .notion-topbar, .notion-overlay-container:not(:has(.notion-table-view)), [id^="c33"], [id^="c16"], .m9, .c26-ui, [data-constellucentia-root]';

    function touchesTable(node) {
        if (!(node instanceof Element)) {
            return false;
        }
        return node.matches(TABLE_SEL) || !!node.querySelector(TABLE_SEL);
    }

    function isTableMutation(mutation) {
        const target =
            mutation.target instanceof Element
                ? mutation.target
                : mutation.target && mutation.target.parentElement;

        if (!target) {
            return false;
        }
        if (target.closest(IGNORE_SEL)) {
            return false;
        }
        if (mutation.type === 'characterData') {
            return !!target.closest('.notion-table-view-header-row, [data-col-index], [role="columnheader"]');
        }
        if (target.closest(TABLE_SEL)) {
            return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
        }
        for (const n of mutation.addedNodes) {
            if (touchesTable(n)) return true;
        }
        for (const n of mutation.removedNodes) {
            if (touchesTable(n)) return true;
        }
        return false;
    }

    function installObserver() {

        if (state.observer) {
            state.observer.disconnect();
        }

        state.observer =
            new MutationObserver(mutations => {
                if (
                    state.stopped ||
                    state.dragging
                ) {
                    return;
                }

                /*
                 * v12.0.0: 表（DB のビュー）に関わる変化だけを見る。
                 * サイドバー・上の帯・入力中の本文・他の柱の小窓などの変化では走査しない。
                 */
                const needsScan =
                    mutations.some(isTableMutation);

                if (needsScan) {
                    scheduleScan('mutation');
                }
            });

        state.observer.observe(
            document.body,
            {
                subtree: true,
                childList: true,
                characterData: true

                /*
                 * attributesは監視しない。
                 * 自身のclass/style変更による循環を防止。
                 */
            }
        );
    }

    /*
     * ============================================================
     *  15. 並べ替え・リサイズ
     * ============================================================
     */

    function isTableInteraction(target) {
        return (
            target instanceof Element &&
            Boolean(
                target.closest(
                    [
                        '[data-col-index]',
                        '[data-testid="property-value"]',
                        '.notion-table-view'
                    ].join(',')
                )
            )
        );
    }

    function onPointerDown(event) {
        if (!isTableInteraction(event.target)) {
            return;
        }

        state.dragging = true;
        clearTimers();
    }

    function finishInteraction(reason) {
        state.dragging = false;
        scheduleStabilization(reason);
    }

    function onPointerUp() {
        if (state.dragging) {
            finishInteraction('pointerup');
        }
    }

    function onDragEnd() {
        finishInteraction('dragend');
    }

    function onDrop() {
        finishInteraction('drop');

    }

    function onResize() {
        scheduleStabilization('resize');
    }

    function onVisibilityChange() {
        if (!document.hidden) {
            scheduleStabilization(
                'visibilitychange'
            );
        }
    }

    function onFocusIn(event) {
        if (isTableInteraction(event.target)) {
            scheduleStabilization('focusin');
        }
    }

    function onFocusOut(event) {
        if (isTableInteraction(event.target)) {
            scheduleStabilization('focusout');
        }
    }

    function installEvents() {
        document.addEventListener(
            'pointerdown',
            onPointerDown,
            true
        );

        document.addEventListener(
            'pointerup',
            onPointerUp,
            true
        );

        document.addEventListener(
            'pointercancel',
            onPointerUp,
            true
        );

        document.addEventListener(
            'dragend',
            onDragEnd,
            true
        );

        document.addEventListener(
            'drop',
            onDrop,
            true
        );

        window.addEventListener(
            'resize',
            onResize,
            { passive: true }
        );

        document.addEventListener(
            'visibilitychange',
            onVisibilityChange
        );

        document.addEventListener(
            'focusin',
            onFocusIn,
            true
        );

        document.addEventListener(
            'focusout',
            onFocusOut,
            true
        );
    }

    function removeEvents() {
        document.removeEventListener(
            'pointerdown',
            onPointerDown,
            true
        );

        document.removeEventListener(
            'pointerup',
            onPointerUp,
            true
        );

        document.removeEventListener(
            'pointercancel',
            onPointerUp,
            true
        );

        document.removeEventListener(
            'dragend',
            onDragEnd,
            true
        );

        document.removeEventListener(
            'drop',
            onDrop,
            true
        );

        window.removeEventListener(
            'resize',
            onResize
        );

        document.removeEventListener(
            'visibilitychange',
            onVisibilityChange
        );

        document.removeEventListener(
            'focusin',
            onFocusIn,
            true
        );

        document.removeEventListener(
            'focusout',
            onFocusOut,
            true
        );
    }

    /*

     * ============================================================
     *  16. 公開API
     * ============================================================
     */

    function getStatus() {
        return {
            version: VERSION,
            started: state.started,
            stopped: state.stopped,
            dragging: state.dragging,

            scanCount: state.scanCount,
            lastReason: state.lastReason,
            lastScanAt: state.lastScanAt,
            lastError: state.lastError,

            detectionMethod:
                state.detectionMethod,

            detectedTitleHeaders:
                state.detectedTitleHeaders,

            candidateTitleCells:
                state.candidateTitleCells,

            appliedTitleCells:
                state.appliedTitleCells,

            detectedTitleIcons:
                state.detectedTitleIcons,

            detectedIconlessTitles:
                state.detectedIconlessTitles,

            matchedColumns: [
                ...state.matchedColumns
            ],

            targetIconSource:
                `${TARGET_ICON_SRC}?mode=light`,

            tuning: {
                ...TUNING,

                TARGET_TITLE_PROPERTY_NAMES: [
                    ...TUNING
                        .TARGET_TITLE_PROPERTY_NAMES
                ]
            }
        };
    }

    function status() {
        const result = getStatus();

        console.table({
            version: result.version,
            started: result.started,
            detectionMethod:
                result.detectionMethod,
            detectedTitleHeaders:
                result.detectedTitleHeaders,
            candidateTitleCells:
                result.candidateTitleCells,
            appliedTitleCells:
                result.appliedTitleCells,
            detectedTitleIcons:
                result.detectedTitleIcons,
            scanCount:
                result.scanCount,
            lastError:
                result.lastError || ''
        });

        console.log(
            '[Cordivestium] matchedColumns:',
            result.matchedColumns
        );

        return result;
    }

    function refresh() {
        installStyle();
        scheduleStabilization(
            'manual-refresh'
        );

        return getStatus();
    }

    function reconcile() {
        clearAllManagedState();
        installStyle();
        scheduleStabilization(
            'manual-reconcile'
        );

        return getStatus();

    }

    function preview(changes = {}) {
        if (
            !changes ||
            typeof changes !== 'object' ||
            Array.isArray(changes)
        ) {
            throw new TypeError(
                'preview()にはオブジェクトを渡してください。'
            );
        }

        for (
            const [key, value] of
            Object.entries(changes)
        ) {
            if (!(key in TUNING)) {
                console.warn(
                    `[Cordivestium] 未定義項目: ${key}`
                );

                continue;
            }

            if (
                key ===
                'TARGET_TITLE_PROPERTY_NAMES'
            ) {
                if (!Array.isArray(value)) {
                    throw new TypeError(
                        `${key}は配列で指定してください。`
                    );
                }

                TUNING[key] =
                    value
                        .map(normalizeText)
                        .filter(Boolean);

                continue;
            }

            TUNING[key] = value;
        }

        installStyle();
        reconcile();

        return getStatus();
    }

    function stop() {
        state.stopped = true;
        state.dragging = false;

        clearTimers();

        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }

        removeEvents();
        clearAllManagedState();

        document
            .getElementById(STYLE_ID)
            ?.remove();

        console.info(
            '[Cordivestium] stopped.'
        );

        return getStatus();
    }

    const API = {
        version: VERSION,
        status,
        refresh,
        reconcile,
        preview,
        stop,
        getStatus
    };

    /*
     * Userscript側とNotionページ側の両方へ公開。
     */
    window[API_NAME] = API;

    try {
        PAGE_WINDOW[API_NAME] = API;
    } catch (error) {
        console.error(
            '[Cordivestium] API export failed:',
            error
        );
    }


    /*
     * ページ側に関数を直接渡せない環境でも、
     * 起動確認用の情報を残す。
     */
    try {
        PAGE_WINDOW
            .document
            .documentElement
            .dataset
            .cordivestiumWorksTypographyVersion =
                VERSION;
    } catch {
        // 何もしない
    }

    /*
     * ============================================================
     *  17. 起動
     * ============================================================
     */

    function start() {
        if (
            state.started ||
            state.stopped
        ) {
            return;
        }

        if (
            !document.head ||
            !document.body
        ) {
            setTimeout(start, 100);
            return;
        }

        try {
            clearLegacyState();
            installStyle();
            installObserver();
            installEvents();
            installHoverRescan();

            state.started = true;

            scheduleStabilization(
                'startup'
            );

            console.info(
                `[Cordivestium] ` +
                `Works Title Typography v${VERSION} started.`
            );
        } catch (error) {
            state.lastError =
                error instanceof Error
                    ? `${error.name}: ${error.message}`
                    : String(error);

            console.error(
                '[Cordivestium] startup failed:',
                error
            );
        }
    }

    start();
})();
