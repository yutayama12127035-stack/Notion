// ==UserScript==
// @name         « No »　⁰⁴ _ Align Full DB Description
// @namespace    https://constellucentia.local/align-full-db-description
// @version      1.1.0
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


  /* ── v1.1.0（196）³³ の「このDBについて」と取り合わない ──
     ・[data-c194-about]（³³ が憲法と実務を並べる行）の中の説明文は揃えない（⁰⁸ 1.5.7 と同じ除外）。
       前にこのスクリプトが付けた印と字下げの変数は 1 回だけ外す。³³ を切るか「このDBについて」を切ると今までどおり揃える。
     ・³³ が本文の寸法を変えている間（html[data-c194-hold]）は測らず、外れた時に 1 回だけ測り直す。 */
  const VERSION = "1.1.0";

  const RUNTIME_KEY =
    "__constellucentiaFullDbDescriptionAlignment__";

  const STYLE_ID =
    "constellucentia-full-db-description-alignment-style";

  const MARK_ATTRIBUTE =
    "data-constellucentia-full-db-description-aligned";

  const PROPERTY_NAME =
    "--constellucentia-full-db-description-inset";

  /* v1.1.0: ³³ 194 の「このDBについて」の行（この中は ³³ が段組みと字の位置を決める） */
  const C194_ABOUT_SELECTOR =
    "[data-c194-about]";

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

    /* v1.1.0: 「このDBについて」の中で見送った説明文の数（直近）・印を外した回数・hold で見送った走査の回数 */
    c194AboutSkipped: 0,
    c194Released: 0,
    c194HoldDeferred: 0,

    destroyed: false
  };

  let mutationObserver = null;
  /* v1.1.0: [data-c194-about] の付け外し（属性なので childList の見張りには届かない）と、hold が外れた時 */
  let c194AboutObserver = null;
  let c194ReleaseStop = null;
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

      /*
       * v1.1.0: ³³ の「このDBについて」の中の説明文は対象外
       * （³³ が憲法と実務の 2 段に並べる。⁰⁸ 1.5.7 と同じ除外）。
       */
      if (
        element.closest(
          C194_ABOUT_SELECTOR
        )
      ) {
        state.c194AboutSkipped += 1;
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

  /*
   * v1.1.0: 「このDBについて」の中に残っている、このスクリプトの印と字下げの変数を外す。
   * 外すのはこのスクリプトの 2 つだけ（⁰⁸ の幅・³³ の印には触らない）。
   * 無ければ何も書かない（一度外せば、次からは何もしない）。
   */
  function releaseC194About() {
    document
      .querySelectorAll(
        `${C194_ABOUT_SELECTOR} [${MARK_ATTRIBUTE}], ${C194_ABOUT_SELECTOR} [style*="${PROPERTY_NAME}"]`
      )
      .forEach(description => {
        let released = false;

        if (
          description.hasAttribute(
            MARK_ATTRIBUTE
          )
        ) {
          description.removeAttribute(
            MARK_ATTRIBUTE
          );

          released = true;
        }

        if (
          description.style.getPropertyValue(
            PROPERTY_NAME
          )
        ) {
          description.style.removeProperty(
            PROPERTY_NAME
          );

          released = true;
        }

        if (released) {
          state.c194Released += 1;
        }
      });
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

    /*
     * v1.1.0: ³³ が本文の寸法を変えている間は測らない
     * （外れた時に c194ReleaseStop の見張りが 1 回だけ測り直す）。
     */
    if (C194.hold()) {
      state.c194HoldDeferred += 1;
      return;
    }

    state.scans += 1;
    state.lastRunAt =
      new Date().toISOString();
    state.lastError = null;

    try {
      installStyle();

      releaseC194About();

      state.c194AboutSkipped = 0;

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
        /*
         * v1.1.0: 「このDBについて」の行の題字は、説明が ³³ の物なので組を作らない
         * （下にある別の編集欄と取り違えないため）。
         */
        if (
          title.closest(
            C194_ABOUT_SELECTOR
          )
        ) {
          continue;
        }

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
        state.c194AboutSkipped > 0
      ) {
        state.lastResult =
          "c194-about-left-to-33";
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

    /*
     * v1.1.0: ³³ が「このDBについて」の印を付け外しした時も見直す
     * （印は属性なので上の見張りには届かない）。
     * hold が外れた時は 1 回だけ測り直す。
     */
    c194AboutObserver =
      new MutationObserver(() => {
        scheduleScan();
      });

    c194AboutObserver.observe(
      document.documentElement,
      {
        attributes: true,
        subtree: true,
        attributeFilter: [
          "data-c194-about"
        ]
      }
    );

    c194ReleaseStop =
      C194.onRelease(() => {
        scheduleScan(0);
      });

    C194.report("c04", {
      version: VERSION,
      observers: [
        "documentElement MO（childList・subtree・characterData）",
        "documentElement MO（属性 data-c194-about・subtree）",
        "html MO（属性 data-c194-hold・外れた時に 1 回）",
        "ResizeObserver（題字・説明文）"
      ],
      listeners: ["resize"],
      timers: ["scan 間引き 60ms", "verifyAlignment rAF"]
    });

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

    c194AboutObserver?.disconnect();
    c194AboutObserver = null;

    c194ReleaseStop?.();
    c194ReleaseStop = null;

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
