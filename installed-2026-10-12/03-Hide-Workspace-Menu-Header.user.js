// ==UserScript==
// @name         « No »　⁰³ _ Hide Workspace Menu Header
// @namespace    https://constellucentia.local/hide-workspace-menu-header
// @version      2.1.1
// @description  Hides the top summary in Notion's workspace menu across all workspaces.
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @grant        none
// @run-at       document-start
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


  const VERSION = "2.1.1";

  const RUNTIME_KEY =
    "__constellucentiaWorkspaceMenuHeader__";

  const STYLE_ID =
    "constellucentia-workspace-menu-header-style";

  const HEADER_ATTRIBUTE =
    "data-constellucentia-hide-workspace-menu-header";

  /*
   * 以前の同一スクリプトを停止する。
   */
  try {
    window[RUNTIME_KEY]?.destroy?.();
  } catch {
    // 旧インスタンスがない場合は何もしない
  }

  /*
   * 過去の誤った実装でワークスペース一覧に
   * 付けられた属性をすべて解除する。
   */
  document
    .querySelectorAll(
      [
        "[data-constellucentia-hide-current-workspace]",
        "[data-constellucentia-hide-current-workspace-wrapper]"
      ].join(",")
    )
    .forEach(element => {
      element.removeAttribute(
        "data-constellucentia-hide-current-workspace"
      );

      element.removeAttribute(
        "data-constellucentia-hide-current-workspace-wrapper"
      );
    });

  const state = {
    version: VERSION,
    startedAt: new Date().toISOString(),

    scans: 0,
    applications: 0,
    switches: 0,

    iconWrappers: 0,
    summaryCandidates: 0,
    markedHeaders: 0,

    currentWorkspace: null,
    previousWorkspace: null,

    lastRunAt: null,
    lastResult: "starting",
    lastError: null,

    destroyed: false
  };

  let observer = null;
  let primaryTimer = 0;
  let followUpTimer = 0;
  let finalTimer = 0;

  function normalizeText(value) {
    return String(value ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /*
   * 最上段だけを完全に畳むCSS。
   */
  function installStyle() {
    let style =
      document.getElementById(STYLE_ID);

    if (style) {
      return style;
    }

    style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      /*
       * ワークスペースメニュー最上段の
       * 「アイコン＋名前＋プラン情報」だけを非表示にする。
       */
      [${HEADER_ATTRIBUTE}="true"] {
        display: none !important;

        box-sizing: border-box !important;

        width: 0 !important;
        height: 0 !important;

        min-width: 0 !important;
        min-height: 0 !important;

        max-width: 0 !important;
        max-height: 0 !important;

        margin: 0 !important;
        padding: 0 !important;

        border: 0 !important;

        overflow: hidden !important;
        visibility: hidden !important;
        opacity: 0 !important;

        pointer-events: none !important;
      }
    `;

    (
      document.head ||
      document.documentElement
    ).appendChild(style);

    return style;
  }

  function removeOldIncorrectMarks() {
    document
      .querySelectorAll(
        [
          "[data-constellucentia-hide-current-workspace]",
          "[data-constellucentia-hide-current-workspace-wrapper]"
        ].join(",")
      )
      .forEach(element => {
        element.removeAttribute(
          "data-constellucentia-hide-current-workspace"
        );

        element.removeAttribute(
          "data-constellucentia-hide-current-workspace-wrapper"
        );
      });
  }

  /*
   * この要素を含むワークスペースメニュー本体を探す。
   */
  function findWorkspaceMenuRoot(element) {
    let candidate = element;

    for (
      let depth = 0;
      candidate && depth < 20;
      depth += 1
    ) {
      const text =
        normalizeText(candidate.textContent);

      const hasNewWorkspace =
        text.includes("New workspace") ||
        text.includes("新しいワークスペース") ||
        text.includes("ワークスペースを追加");

      const hasKnownFooterAction =
        text.includes("Add account") ||
        text.includes("アカウントを追加") ||
        Boolean(
          candidate.querySelector(
            [
              "[data-constellucentia-footer-action-source]",
              "[data-constellucentia-footer-action-clone]",
              "#constellucentia-workspace-footer-actions-portal"
            ].join(",")
          )
        );

      if (
        hasNewWorkspace &&
        hasKnownFooterAction
      ) {
        return candidate;
      }

      candidate =
        candidate.parentElement;
    }

    return null;
  }

  function extractDirectText(element) {
    if (!element) {
      return "";
    }

    return normalizeText(
      element.textContent
    );
  }

  function looksLikePlanInformation(text) {
    if (!text) {
      return false;
    }

    return (
      /(?:free|plus|business|enterprise)\s+plan/i
        .test(text) ||

      /\b\d+\s+members?\b/i
        .test(text) ||

      /(?:free|plus|business|enterprise).*(?:member|seat)/i
        .test(text) ||

      /プラン|メンバー|名のメンバー|ユーザー/i
        .test(text)
    );
  }

  /*
   * 提示された最上段の構造かどうかを判定する。
   *
   * workspace header
   * ├─ .notion-record-icon
   * └─ text container
   *    ├─ workspace name
   *    └─ plan/member information
   */
  function inspectSummaryRow(iconWrapper) {
    const row =
      iconWrapper.parentElement;

    if (!row) {
      return null;
    }

    /*
     * アイコンが行の最初の直接子であることを確認。
     * ワークスペース一覧内の深いアイコンを誤検出しない。
     */
    if (
      row.firstElementChild !==
      iconWrapper
    ) {
      return null;
    }

    const textContainer =
      iconWrapper.nextElementSibling;

    if (!textContainer) {
      return null;
    }

    const textRows = [
      ...textContainer.children
    ];

    if (textRows.length < 2) {
      return null;
    }

    const workspaceName =
      extractDirectText(textRows[0]);

    const subtitle =
      textRows
        .slice(1)
        .map(extractDirectText)
        .filter(Boolean)
        .join(" ");

    if (!workspaceName) {
      return null;
    }

    const rowStyle =
      row.getAttribute("style") || "";

    /*
     * 現在のNotionの最上段には、
     * padding-bottom: 4px と gap: 8px がある。
     *
     * 言語やプラン表記が変わった場合でも
     * この構造シグネチャで認識できる。
     */
    const hasSummaryStructure =
      rowStyle.includes(
        "padding-bottom: 4px"
      ) &&
      rowStyle.includes("gap: 8px");

    const hasPlanInformation =
      looksLikePlanInformation(
        subtitle
      );

    if (
      !hasSummaryStructure &&
      !hasPlanInformation
    ) {
      return null;
    }

    const menuRoot =
      findWorkspaceMenuRoot(row);

    if (!menuRoot) {
      return null;
    }

    return {
      row,
      menuRoot,
      workspaceName,
      subtitle
    };
  }

  /*
   * アイコンURLは一切限定しない。
   *
   * gem、電球、駒、植物、望遠鏡など、
   * どのワークスペースアイコンでも対象になる。
   */
  function findSummaryCandidates() {
    const iconWrappers = [
      ...document.querySelectorAll(
        ".notion-record-icon"
      )
    ];

    state.iconWrappers =
      iconWrappers.length;

    const candidates = [];

    for (
      const iconWrapper of
      iconWrappers
    ) {
      const candidate =
        inspectSummaryRow(
          iconWrapper
        );

      if (candidate) {
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  function removeStaleMarks(validRows) {
    document
      .querySelectorAll(
        `[${HEADER_ATTRIBUTE}="true"]`
      )
      .forEach(element => {
        if (!validRows.has(element)) {
          element.removeAttribute(
            HEADER_ATTRIBUTE
          );
        }
      });
  }

  function scan() {
    if (state.destroyed) {
      return;
    }

    state.scans += 1;
    state.lastRunAt =
      new Date().toISOString();
    state.lastError = null;

    try {
      installStyle();
      removeOldIncorrectMarks();

      const candidates =
        findSummaryCandidates();

      state.summaryCandidates =
        candidates.length;

      const validRows =
        new Set();

      let latestWorkspace = null;

      for (const candidate of candidates) {
        const {
          row,
          workspaceName
        } = candidate;

        validRows.add(row);
        latestWorkspace =
          workspaceName;

        if (
          row.getAttribute(
            HEADER_ATTRIBUTE
          ) !== "true"
        ) {
          row.setAttribute(
            HEADER_ATTRIBUTE,
            "true"
          );

          state.applications += 1;
        }
      }

      removeStaleMarks(validRows);

      const previousWorkspace =
        state.currentWorkspace;

      if (
        latestWorkspace &&
        previousWorkspace &&
        latestWorkspace !==
          previousWorkspace
      ) {
        state.previousWorkspace =
          previousWorkspace;

        state.switches += 1;
      }

      if (latestWorkspace) {
        state.currentWorkspace =
          latestWorkspace;
      }

      state.markedHeaders =
        document.querySelectorAll(
          `[${HEADER_ATTRIBUTE}="true"]`
        ).length;

      if (state.markedHeaders > 0) {
        state.lastResult =
          "workspace-menu-header-hidden";
      } else if (
        state.iconWrappers > 0
      ) {
        state.lastResult =
          "waiting-for-workspace-menu-summary";
      } else {
        state.lastResult =
          "waiting-for-workspace-menu";
      }
    } catch (error) {
      state.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      state.lastResult =
        "scan-error";
    }
  }

  /*
   * Notionの切り替え処理は非同期で数段階に分かれるため、
   * 直後・少し後・描画完了後の3回確認する。
   */
  function scheduleScan() {
    if (state.destroyed) {
      return;
    }

    window.clearTimeout(primaryTimer);
    window.clearTimeout(followUpTimer);
    window.clearTimeout(finalTimer);

    primaryTimer =
      window.setTimeout(
        scan,
        30
      );

    followUpTimer =
      window.setTimeout(
        scan,
        250
      );

    finalTimer =
      window.setTimeout(
        scan,
        800
      );
  }

  function handleInteraction() {
    scheduleScan();
  }

  function startObserver() {
    if (
      observer ||
      !document.documentElement
    ) {
      return;
    }

    observer =
      new MutationObserver(() => {
        scheduleScan();
      });

    observer.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true,
        characterData: true,

        /*
         * ワークスペース切り替え時の
         * アイコン・開閉状態変更も監視する。
         */
        attributes: true,
        attributeFilter: [
          "src",
          "aria-expanded",
          "aria-selected",
          "aria-checked"
        ]
      }
    );

    /*
     * ワークスペース選択直後の非同期描画に対応。
     */
    document.addEventListener(
      "click",
      handleInteraction,
      true
    );

    document.addEventListener(
      "pointerup",
      handleInteraction,
      true
    );

    window.addEventListener(
      "popstate",
      handleInteraction
    );
  }

  function stopObserver() {
    observer?.disconnect();
    observer = null;

    document.removeEventListener(
      "click",
      handleInteraction,
      true
    );

    document.removeEventListener(
      "pointerup",
      handleInteraction,
      true
    );

    window.removeEventListener(
      "popstate",
      handleInteraction
    );
  }

  function status() {
    const markedHeader =
      document.querySelector(
        `[${HEADER_ATTRIBUTE}="true"]`
      );

    return {
      ...state,

      styleInstalled:
        Boolean(
          document.getElementById(
            STYLE_ID
          )
        ),

      markedHeaders:
        document.querySelectorAll(
          `[${HEADER_ATTRIBUTE}="true"]`
        ).length,

      headerDisplay:
        markedHeader
          ? getComputedStyle(
              markedHeader
            ).display
          : null,

      headerText:
        markedHeader
          ? normalizeText(
              markedHeader.textContent
            )
          : null,

      oldIncorrectMarks:
        document.querySelectorAll(
          [
            "[data-constellucentia-hide-current-workspace]",
            "[data-constellucentia-hide-current-workspace-wrapper]"
          ].join(",")
        ).length
    };
  }

  function destroy() {
    state.destroyed = true;

    window.clearTimeout(primaryTimer);
    window.clearTimeout(followUpTimer);
    window.clearTimeout(finalTimer);

    primaryTimer = 0;
    followUpTimer = 0;
    finalTimer = 0;

    stopObserver();

    document
      .querySelectorAll(
        `[${HEADER_ATTRIBUTE}]`
      )
      .forEach(element => {
        element.removeAttribute(
          HEADER_ATTRIBUTE
        );
      });

    document
      .getElementById(STYLE_ID)
      ?.remove();

    state.markedHeaders = 0;
    state.lastResult = "destroyed";
  }

  window[RUNTIME_KEY] = {
    version: VERSION,
    scan,
    status,
    destroy
  };

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        installStyle();
        startObserver();
        scheduleScan();
      },
      { once: true }
    );
  } else {
    installStyle();
    startObserver();
    scheduleScan();
  }
})();
