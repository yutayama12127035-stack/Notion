// ==UserScript==
// @name         « No »　⁰² _ Teamspace Title Toggle
// @namespace    https://constellucentia.local/teamspace-title-toggle
// @version      1.2.0
// @description  Forwards teamspace title clicks to Notion's original expand/collapse button without styling or DOM mutation.
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  const VERSION = "1.2.0";

  const RUNTIME_KEY =
    "__constellucentiaTeamspaceTitleToggle__";

  const TITLE_SELECTOR = [
    ".notion-outliner-team-container",
    'div[style*="color: var(--c-texAccPri)"]',
    '[style*="font-weight: 500"]',
    '[style*="font-size: 14px"]'
  ].join(" ");

  const CONTEXT_BUTTON_SELECTOR =
    ".notion-outliner-team-context-menu-button";

  const TOGGLE_ICON_SELECTOR =
    "svg.arrowChevronSingleDownFillSmall";

  const state = {
    version: VERSION,

    startedAt:
      new Date().toISOString(),

    titleClicks: 0,
    successfulForwards: 0,
    failedForwards: 0,

    lastTeamspace: null,
    lastResult: "ready",
    lastError: null,

    destroyed: false
  };

  const oldRuntime =
    window[RUNTIME_KEY];

  if (
    oldRuntime &&
    typeof oldRuntime.destroy === "function"
  ) {
    try {
      oldRuntime.destroy();
    } catch (_) {
      // 新しいリスナーを登録する。
    }
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findTitleFromEvent(event) {
    const path =
      typeof event.composedPath === "function"
        ? event.composedPath()
        : [];

    for (const item of path) {
      if (
        item instanceof Element &&
        item.matches(TITLE_SELECTOR)
      ) {
        return item;
      }
    }

    const target =
      event.target;

    if (
      !(target instanceof Element)
    ) {
      return null;
    }

    return target.closest(
      TITLE_SELECTOR
    );
  }

  function findToggleButton(root) {
    if (!root) {
      return null;
    }

    const toggleIcon =
      root.querySelector(
        TOGGLE_ICON_SELECTOR
      );

    const iconButton =
      toggleIcon?.closest(
        '[role="button"]'
      );

    if (iconButton) {
      return iconButton;
    }

    /*
     * SVGクラス変更時の補助判定。
     */
    const buttons = Array.from(
      root.querySelectorAll(
        '[role="button"][aria-label]'
      )
    );

    return (
      buttons.find((button) => {
        const label =
          normalizeText(
            button.getAttribute(
              "aria-label"
            )
          ).toLowerCase();

        return [
          "open",
          "close",
          "expand",
          "collapse",
          "開く",
          "閉じる",
          "展開",
          "折りたたむ"
        ].includes(label);
      }) || null
    );
  }

  function findTeamspaceRow(title) {
    let current =
      title.parentElement;

    let depth = 0;

    while (
      current &&
      current !== document.body &&
      current !== document.documentElement &&
      depth < 20
    ) {
      const contextButton =
        current.querySelector(
          CONTEXT_BUTTON_SELECTOR
        );

      const toggle =
        findToggleButton(current);

      if (
        contextButton &&
        toggle
      ) {
        return current;
      }

      current =
        current.parentElement;

      depth += 1;
    }

    return null;
  }

  function handleTitleClick(event) {
    const title =
      findTitleFromEvent(event);

    if (!title) {
      return;
    }

    state.titleClicks += 1;

    state.lastTeamspace =
      normalizeText(
        title.textContent
      );

    const row =
      findTeamspaceRow(title);

    if (!row) {
      state.failedForwards += 1;

      state.lastResult =
        "teamspace-row-not-found";

      return;
    }

    const toggle =
      findToggleButton(row);

    if (
      !toggle ||
      !toggle.isConnected
    ) {
      state.failedForwards += 1;

      state.lastResult =
        "toggle-button-not-found";

      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      toggle.click();

      state.successfulForwards += 1;

      state.lastResult =
        "title-click-forwarded";
    } catch (error) {
      state.failedForwards += 1;

      state.lastError =
        String(
          error?.stack ||
          error?.message ||
          error
        );

      state.lastResult =
        "toggle-click-failed";
    }
  }

  function destroy() {
    if (state.destroyed) {
      return;
    }

    state.destroyed = true;

    window.removeEventListener(
      "click",
      handleTitleClick,
      true
    );

    state.lastResult =
      "destroyed";
  }

  function status() {
    return {
      version: VERSION,

      startedAt:
        state.startedAt,

      matchingTitles:
        document.querySelectorAll(
          TITLE_SELECTOR
        ).length,

      contextButtons:
        document.querySelectorAll(
          CONTEXT_BUTTON_SELECTOR
        ).length,

      toggleIcons:
        document.querySelectorAll(
          TOGGLE_ICON_SELECTOR
        ).length,

      titleClicks:
        state.titleClicks,

      successfulForwards:
        state.successfulForwards,

      failedForwards:
        state.failedForwards,

      lastTeamspace:
        state.lastTeamspace,

      lastResult:
        state.lastResult,

      lastError:
        state.lastError,

      destroyed:
        state.destroyed
    };
  }

  window.addEventListener(
    "click",
    handleTitleClick,
    true
  );

  window[RUNTIME_KEY] = {
    version: VERSION,
    status,
    destroy
  };
})();
