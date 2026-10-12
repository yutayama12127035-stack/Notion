// ==UserScript==
// @name         « No »　⁰⁴ _ Align Full DB Description
// @namespace    https://constellucentia.local/align-full-db-description
// @version      1.0.1
// @description  Aligns a full database description with the first character of its title.
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


  const VERSION = "1.0.1";

  const RUNTIME_KEY =
    "__constellucentiaFullDbDescriptionAlignment__";

  const STYLE_ID =
    "constellucentia-full-db-description-alignment-style";

  const MARK_ATTRIBUTE =
    "data-constellucentia-full-db-description-aligned";

  const PROPERTY_NAME =
    "--constellucentia-full-db-description-inset";

  /*
   * 同じスクリプトの旧インスタンスを停止する。
   */
  try {
    window[RUNTIME_KEY]?.destroy?.();
  } catch {
    // 旧インスタンスがない場合は何もしない
  }

  const state = {
    version: VERSION,
    startedAt: new Date().toISOString(),

    scans: 0,
    applications: 0,
    realignments: 0,

    matchingTitles: 0,
    matchingDescriptions: 0,
    alignedDescriptions: 0,

    lastTitle: null,
    lastTitleX: null,
    lastDescriptionBoxX: null,
    lastDescriptionTextX: null,
    lastAppliedInset: null,
    lastAlignmentError: null,

    lastRunAt: null,
    lastResult: "starting",
    lastError: null,

    destroyed: false
  };

  let mutationObserver = null;
  let resizeObserver = null;
  let scanTimer = 0;
  let verificationFrame = 0;

  const observedElements = new Set();

  function normalizeText(value) {
    return String(value ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

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
       * JavaScriptが計測したタイトル先頭位置に、
       * 説明文の文字開始位置を合わせる。
       */
      [${MARK_ATTRIBUTE}="true"] {
        box-sizing: border-box !important;

        padding-inline-start:
          var(${PROPERTY_NAME}, 12px) !important;
      }
    `;

    (
      document.head ||
      document.documentElement
    ).appendChild(style);

    return style;
  }

  /*
   * h1の最初の可視文字を含むテキストノードを探す。
   */
  function findFirstTextPosition(root) {
    const walker =
      document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const value =
              String(node.nodeValue ?? "");

            if (/\S/.test(value)) {
              return NodeFilter.FILTER_ACCEPT;
            }

            return NodeFilter.FILTER_REJECT;
          }
        }
      );

    const textNode =
      walker.nextNode();

    if (!textNode) {
      return null;
    }

    const value =
      String(textNode.nodeValue ?? "");

    const firstCharacterIndex =
      value.search(/\S/);

    if (firstCharacterIndex < 0) {
      return null;
    }

    const range =
      document.createRange();

    range.setStart(
      textNode,
      firstCharacterIndex
    );

    range.setEnd(
      textNode,
      Math.min(
        firstCharacterIndex + 1,
        value.length
      )
    );

    const rectangles = [
      ...range.getClientRects()
    ];

    const rectangle =
      rectangles.find(rect => {
        return (
          rect.width > 0 ||
          rect.height > 0
        );
      });

    range.detach?.();

    if (!rectangle) {
      return null;
    }

    return {
      x: rectangle.left,
      top: rectangle.top,
      bottom: rectangle.bottom
    };
  }

  function getTitleCharacterX(title) {
    const characterPosition =
      findFirstTextPosition(title);

    if (characterPosition) {
      return characterPosition.x;
    }

    /*
     * タイトルが空のときの予備処理。
     */
    const rectangle =
      title.getBoundingClientRect();

    const computed =
      getComputedStyle(title);

    const paddingLeft =
      Number.parseFloat(
        computed.paddingLeft
      ) || 0;

    return rectangle.left + paddingLeft;
  }

  function isVisible(element) {
    const rectangle =
      element.getBoundingClientRect();

    if (
      rectangle.width <= 0 ||
      rectangle.height <= 0
    ) {
      return false;
    }

    const computed =
      getComputedStyle(element);

    return (
      computed.display !== "none" &&
      computed.visibility !== "hidden"
    );
  }

  function findTitles() {
    return [
      ...document.querySelectorAll(
        [
          "div.notion-collection_view_page-block",
          "div.notion-selectable.notion-collection_view_page-block"
        ].join(",")
      )
    ]
      .map(block => {
        return block.querySelector(
          ":scope > h1[aria-roledescription='page title']"
        );
      })
      .filter(Boolean)
      .filter(isVisible);
  }

  function findDescriptions() {
    return [
      ...document.querySelectorAll(
        [
          "div[contenteditable='true']",
          "div[data-content-editable-leaf='true']"
        ].join(",")
      )
    ].filter(element => {
      if (
        element.tagName.toLowerCase() !== "div"
      ) {
        return false;
      }

      if (
        element.getAttribute("role") !==
        "textbox"
      ) {
        return false;
      }

      if (
        element.getAttribute(
          "aria-multiline"
        ) !== "true"
      ) {
        return false;
      }

      if (
        element.getAttribute(
          "data-content-editable-leaf"
        ) !== "true"
      ) {
        return false;
      }

      /*
       * h1やタイトル内部の要素を除外する。
       */
      if (
        element.closest(
          "h1[aria-roledescription='page title']"
        )
      ) {
        return false;
      }

      const placeholder =
        normalizeText(
          element.getAttribute(
            "placeholder"
          )
        );

      const looksLikeDescription =
        placeholder ===
          "Add a description…" ||
        placeholder ===
          "Add a description..." ||
        placeholder ===
          "説明を追加…" ||
        placeholder ===
          "説明を追加...";

      /*
       * Notionがplaceholderを変更した場合でも、
       * タイトル直下の候補として扱えるようにする。
       */
      const hasEditableSignature =
        element.isContentEditable &&
        element.getAttribute(
          "aria-multiline"
        ) === "true";

      return (
        looksLikeDescription ||
        hasEditableSignature
      );
    }).filter(isVisible);
  }

  /*
   * タイトルの下にある最も近い説明文を選ぶ。
   */
  function findDescriptionForTitle(
    title,
    descriptions
  ) {
    const titleRectangle =
      title.getBoundingClientRect();

    const candidates =
      descriptions
        .map(description => {
          const rectangle =
            description.getBoundingClientRect();

          const verticalDistance =
            rectangle.top -
            titleRectangle.bottom;

          const horizontalDistance =
            Math.abs(
              rectangle.left -
              titleRectangle.left
            );

          return {
            description,
            rectangle,
            verticalDistance,
            horizontalDistance
          };
        })
        .filter(candidate => {
          /*
           * 説明文はタイトルのすぐ下にある。
           * 上側や極端に離れた編集欄は除外する。
           */
          return (
            candidate.verticalDistance >= -8 &&
            candidate.verticalDistance <= 500
          );
        })
        .sort((left, right) => {
          if (
            left.verticalDistance !==
            right.verticalDistance
          ) {
            return (
              left.verticalDistance -
              right.verticalDistance
            );
          }

          return (
            left.horizontalDistance -
            right.horizontalDistance
          );
        });

    return (
      candidates[0]?.description ||
      null
    );
  }

  function observeSize(element) {
    if (
      !resizeObserver ||
      observedElements.has(element)
    ) {
      return;
    }

    resizeObserver.observe(element);
    observedElements.add(element);
  }

  function calculateInset(
    title,
    description
  ) {
    const titleCharacterX =
      getTitleCharacterX(title);

    const descriptionRectangle =
      description.getBoundingClientRect();

    /*
     * 説明文要素の左端から、
     * タイトル先頭文字までの距離。
     */
    const rawInset =
      titleCharacterX -
      descriptionRectangle.left;

    /*
     * 小数点以下を保持することで、
     * ブラウザのサブピクセル配置にも対応する。
     */
    const inset =
      Math.max(
        0,
        Math.round(rawInset * 100) / 100
      );

    return {
      inset,
      titleCharacterX,
      descriptionBoxX:
        descriptionRectangle.left
    };
  }

  function alignPair(
    title,
    description
  ) {
    const {
      inset,
      titleCharacterX,
      descriptionBoxX
    } = calculateInset(
      title,
      description
    );

    const previousInset =
      Number.parseFloat(
        description.style.getPropertyValue(
          PROPERTY_NAME
        )
      );

    const hasPreviousInset =
      Number.isFinite(previousInset);

    const changed =
      !hasPreviousInset ||
      Math.abs(
        previousInset - inset
      ) >= 0.25;

    description.setAttribute(
      MARK_ATTRIBUTE,
      "true"
    );

    description.style.setProperty(
      PROPERTY_NAME,
      `${inset}px`
    );

    if (changed) {
      state.applications += 1;

      if (hasPreviousInset) {
        state.realignments += 1;
      }
    }

    observeSize(title);
    observeSize(description);

    state.lastTitle =
      normalizeText(
        title.textContent
      );

    state.lastTitleX =
      titleCharacterX;

    state.lastDescriptionBoxX =
      descriptionBoxX;

    state.lastAppliedInset =
      inset;
  }

  function removeStaleMarks(
    activeDescriptions
  ) {
    document
      .querySelectorAll(
        `[${MARK_ATTRIBUTE}="true"]`
      )
      .forEach(description => {
        if (
          !activeDescriptions.has(
            description
          )
        ) {
          description.removeAttribute(
            MARK_ATTRIBUTE
          );

          description.style.removeProperty(
            PROPERTY_NAME
          );
        }
      });
  }

  function verifyAlignment() {
    window.cancelAnimationFrame(
      verificationFrame
    );

    verificationFrame =
      window.requestAnimationFrame(() => {
        const description =
          document.querySelector(
            `[${MARK_ATTRIBUTE}="true"]`
          );

        if (!description) {
          state.lastDescriptionTextX =
            null;

          state.lastAlignmentError =
            null;

          return;
        }

        const rectangle =
          description.getBoundingClientRect();

        const computed =
          getComputedStyle(description);

        const paddingLeft =
          Number.parseFloat(
            computed.paddingLeft
          ) || 0;

        const descriptionTextX =
          rectangle.left + paddingLeft;

        state.lastDescriptionTextX =
          Math.round(
            descriptionTextX * 100
          ) / 100;

        if (
          Number.isFinite(
            state.lastTitleX
          )
        ) {
          state.lastAlignmentError =
            Math.round(
              (
                descriptionTextX -
                state.lastTitleX
              ) * 100
            ) / 100;
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

      const titles =
        findTitles();

      const descriptions =
        findDescriptions();

      state.matchingTitles =
        titles.length;

      state.matchingDescriptions =
        descriptions.length;

      const activeDescriptions =
        new Set();

      for (const title of titles) {
        const description =
          findDescriptionForTitle(
            title,
            descriptions
          );

        if (!description) {
          continue;
        }

        activeDescriptions.add(
          description
        );

        alignPair(
          title,
          description
        );
      }

      removeStaleMarks(
        activeDescriptions
      );

      state.alignedDescriptions =
        document.querySelectorAll(
          `[${MARK_ATTRIBUTE}="true"]`
        ).length;

      if (
        state.alignedDescriptions > 0
      ) {
        state.lastResult =
          "description-aligned-to-title";
      } else if (
        titles.length > 0
      ) {
        state.lastResult =
          "title-found-description-not-found";
      } else {
        state.lastResult =
          "waiting-for-full-database";
      }

      verifyAlignment();
    } catch (error) {
      state.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      state.lastResult =
        "scan-error";
    }
  }

  function scheduleScan(delay = 60) {
    if (state.destroyed) {
      return;
    }

    window.clearTimeout(scanTimer);

    scanTimer =
      window.setTimeout(() => {
        scanTimer = 0;
        scan();
      }, delay);
  }

  function startObservers() {
    if (!document.documentElement) {
      return;
    }

    mutationObserver =
      new MutationObserver(() => {
        scheduleScan();
      });

    mutationObserver.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true,
        characterData: true
      }
    );

    resizeObserver =
      new ResizeObserver(() => {
        scheduleScan();
      });

    window.addEventListener(
      "resize",
      handleResize
    );

    /*
     * ローカルフォントの読み込み完了後に
     * Cormorant Garamondの実座標を再測定する。
     */
    document.fonts?.ready
      ?.then(() => {
        scheduleScan(0);
      })
      .catch(() => {
        // Font Loading APIが利用できない場合は無視
      });
  }

  function handleResize() {
    scheduleScan();
  }

  function status() {
    const description =
      document.querySelector(
        `[${MARK_ATTRIBUTE}="true"]`
      );

    return {
      ...state,

      styleInstalled:
        Boolean(
          document.getElementById(
            STYLE_ID
          )
        ),

      alignedDescriptions:
        document.querySelectorAll(
          `[${MARK_ATTRIBUTE}="true"]`
        ).length,

      appliedInset:
        description
          ? getComputedStyle(
              description
            ).paddingInlineStart
          : null,

      descriptionText:
        description
          ? normalizeText(
              description.textContent
            )
          : null
    };
  }

  function destroy() {
    state.destroyed = true;

    window.clearTimeout(scanTimer);
    window.cancelAnimationFrame(
      verificationFrame
    );

    scanTimer = 0;
    verificationFrame = 0;

    mutationObserver?.disconnect();
    mutationObserver = null;

    resizeObserver?.disconnect();
    resizeObserver = null;

    observedElements.clear();

    window.removeEventListener(
      "resize",
      handleResize
    );

    document
      .querySelectorAll(
        `[${MARK_ATTRIBUTE}]`
      )
      .forEach(description => {
        description.removeAttribute(
          MARK_ATTRIBUTE
        );

        description.style.removeProperty(
          PROPERTY_NAME
        );
      });

    document
      .getElementById(STYLE_ID)
      ?.remove();

    state.alignedDescriptions = 0;
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
        startObservers();
        scheduleScan(0);
      },
      { once: true }
    );
  } else {
    installStyle();
    startObservers();
    scheduleScan(0);
  }
})();
