// ==UserScript==
// @name         « No »　⁰¹ _ Workspace Footer Actions Placement
// @namespace    https://constellucentia.local/workspace-settings-placement
// @version      1.5.1
// @description  Places workspace actions directly above Log out without moving React-managed nodes.
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @run-at       document-idle
// @grant        none
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


  const VERSION = "1.5.1";

  const RUNTIME_KEY =
    "__constellucentiaWorkspaceSettingsPlacement__";

  const PORTAL_ID =
    "constellucentia-workspace-footer-actions-portal";

  const STYLE_ID =
    "constellucentia-workspace-footer-actions-style";

  const SOURCE_ATTRIBUTE =
    "data-constellucentia-footer-action-source";

  const CLONE_ATTRIBUTE =
    "data-constellucentia-footer-action-clone";

  const SPACER_ATTRIBUTE =
    "data-constellucentia-footer-actions-spacer";

  const DIVIDER_ATTRIBUTE =
    "data-constellucentia-footer-divider";

  const ROW_HEIGHT = 28;
  const ROW_COUNT = 4;
  const DIVIDER_SPACE = 8;

  const RESERVED_HEIGHT =
    ROW_HEIGHT * ROW_COUNT + DIVIDER_SPACE;

  const ACTIONS = [
    {
      key: "upgrade",

      labels: [
        "Upgrade",
        "アップグレード"
      ]
    },

    {
      key: "settings",

      labels: [
        "Settings",
        "設定"
      ]
    },

    {
      key: "add-members",

      /*
       * Notion内部がInvite members表記でも、
       * クローンの表示だけAdd membersへ統一する。
       */
      displayLabel: "Add members",

      labels: [
        "Add members",
        "Add member",
        "Invite members",
        "Invite member",
        "メンバーを追加",
        "メンバーを追加する",
        "メンバーを招待",
        "メンバーを招待する"
      ]
    },

    {
      key: "add-account",

      labels: [
        "Add account",
        "アカウントを追加"
      ]
    }
  ];

  const LOGOUT_LABELS = [
    "Log out",
    "Logout",
    "ログアウト"
  ];

  const state = {
    version: VERSION,
    startedAt: new Date().toISOString(),

    scans: 0,
    applications: 0,
    cloneBuilds: 0,
    positionUpdates: 0,
    proxyClicks: 0,

    lastRunAt: null,
    lastAction: null,
    lastError: null,
    lastResult: "starting",

    dialog: null,
    logout: null,

    spacer: null,
    spacerOriginalStyle: null,

    sources: new Map(),
    clones: new Map(),

    observer: null,
    scheduled: false,
    destroyed: false
  };

  /*
   * 旧バージョンが存在する場合は停止する。
   */
  const oldRuntime =
    window[RUNTIME_KEY];

  if (
    oldRuntime &&
    typeof oldRuntime.destroy === "function"
  ) {
    try {
      oldRuntime.destroy();
    } catch (_) {
      // 独立クリーンアップを続行する。
    }
  }

  cleanupLegacyArtifacts();
  installStyle();

  /*
   * React管理DOMの外側にポータルを作る。
   */
  const portal =
    document.createElement("div");

  portal.id = PORTAL_ID;

  portal.setAttribute(
    "aria-hidden",
    "false"
  );

  portal.hidden = true;

  document.documentElement.appendChild(
    portal
  );

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchesLabel(
    text,
    labels
  ) {
    const normalized =
      normalizeText(text);

    return labels.some((label) => {
      return normalized === label;
    });
  }

  function isInsidePortal(element) {
    return Boolean(
      element &&
      element.closest &&
      element.closest(`#${PORTAL_ID}`)
    );
  }

  function getClickableElements(root) {
    return Array.from(
      root.querySelectorAll(
        [
          "button",
          '[role="button"]',
          '[role="menuitem"]',
          "a[href]",
          '[tabindex="0"]'
        ].join(",")
      )
    ).filter((element) => {
      return !isInsidePortal(element);
    });
  }

  function findAction(
    root,
    labels
  ) {
    const candidates =
      getClickableElements(root)
        .filter((element) => {
          return matchesLabel(
            element.textContent,
            labels
          );
        })
        .sort((a, b) => {
          const aLength =
            normalizeText(
              a.textContent
            ).length;

          const bLength =
            normalizeText(
              b.textContent
            ).length;

          return aLength - bLength;
        });

    return candidates[0] || null;
  }

  function findWorkspaceDialog() {
    const dialogs = Array.from(
      document.querySelectorAll(
        '[role="dialog"]'
      )
    );

    return (
      dialogs.find((dialog) => {
        return Boolean(
          findAction(
            dialog,
            LOGOUT_LABELS
          )
        );
      }) || null
    );
  }

  function findSpacer(
    dialog,
    logout
  ) {
    const footers = Array.from(
      dialog.querySelectorAll("footer")
    ).filter((footer) => {
      return !footer.contains(logout);
    });

    if (!footers.length) {
      return null;
    }

    const logoutRect =
      logout.getBoundingClientRect();

    const eligible =
      footers.filter((footer) => {
        const rect =
          footer.getBoundingClientRect();

        return (
          rect.top <= logoutRect.top ||
          rect.height === 0
        );
      });

    return (
      eligible[eligible.length - 1] ||
      footers[footers.length - 1] ||
      null
    );
  }

  function markDividers(dialog) {
    const separators = Array.from(
      dialog.querySelectorAll(
        '[role="separator"]'
      )
    );

    for (const separator of separators) {
      const parent =
        separator.parentElement;

      const wrapper =
        parent?.parentElement;

      if (!wrapper) {
        continue;
      }

      const parentStyle =
        parent?.getAttribute(
          "style"
        ) || "";

      const wrapperStyle =
        wrapper.getAttribute(
          "style"
        ) || "";

      const isTargetDivider =
        parentStyle.includes(
          "padding: 8px 0"
        ) ||
        wrapperStyle.includes(
          "padding: 8px 0"
        );

      if (isTargetDivider) {
        wrapper.setAttribute(
          DIVIDER_ATTRIBUTE,
          "true"
        );
      }
    }
  }

  function sanitizeClone(clone) {
    const elements = [
      clone,
      ...clone.querySelectorAll("*")
    ];

    for (const element of elements) {
      for (
        const attribute
        of Array.from(element.attributes)
      ) {
        if (
          attribute.name === "id" ||
          attribute.name.startsWith(
            "data-constellucentia-"
          )
        ) {
          element.removeAttribute(
            attribute.name
          );
        }
      }
    }

    clone.removeAttribute(
      "aria-controls"
    );

    clone.removeAttribute(
      "aria-expanded"
    );

    clone.setAttribute(
      "tabindex",
      "0"
    );
  }

  /*
   * DOM構造は変更せず、該当するテキストノードだけ置換する。
   *
   * これによりAdd membersも、Upgrade・Settings・Add accountと
   * 同じNotion本来の余白・アイコン位置・文字位置を維持する。
   */
  function replaceCloneLabel(
    clone,
    definition
  ) {
    if (!definition.displayLabel) {
      return;
    }

    const walker =
      document.createTreeWalker(
        clone,
        NodeFilter.SHOW_TEXT
      );

    let currentNode =
      walker.nextNode();

    while (currentNode) {
      if (
        matchesLabel(
          currentNode.nodeValue,
          definition.labels
        )
      ) {
        currentNode.nodeValue =
          definition.displayLabel;

        return;
      }

      currentNode =
        walker.nextNode();
    }
  }

  function restoreCloneAppearance(
    clone
  ) {
    clone.style.setProperty(
      "display",
      "flex",
      "important"
    );

    clone.style.setProperty(
      "align-items",
      "center",
      "important"
    );

    clone.style.setProperty(
      "width",
      "100%",
      "important"
    );

    clone.style.setProperty(
      "height",
      `${ROW_HEIGHT}px`,
      "important"
    );

    clone.style.setProperty(
      "min-height",
      `${ROW_HEIGHT}px`,
      "important"
    );

    clone.style.setProperty(
      "max-height",
      `${ROW_HEIGHT}px`,
      "important"
    );

    clone.style.setProperty(
      "visibility",
      "visible",
      "important"
    );

    clone.style.setProperty(
      "opacity",
      "1",
      "important"
    );

    clone.style.setProperty(
      "pointer-events",
      "auto",
      "important"
    );

    const descendants =
      clone.querySelectorAll("*");

    for (const element of descendants) {
      element.style.setProperty(
        "visibility",
        "visible",
        "important"
      );

      element.style.setProperty(
        "opacity",
        "1",
        "important"
      );
    }
  }

  function buildClones(
    dialog,
    sources
  ) {
    portal.replaceChildren();

    state.sources.clear();
    state.clones.clear();

    for (const definition of ACTIONS) {
      const source =
        sources.get(
          definition.key
        );

      if (!source) {
        continue;
      }

      /*
       * 元要素は移動せず、
       * React管理DOM内に残す。
       */
      source.setAttribute(
        SOURCE_ATTRIBUTE,
        definition.key
      );

      /*
       * Notion本来のDOM構造をそのまま複製する。
       */
      const clone =
        source.cloneNode(true);

      sanitizeClone(clone);

      /*
       * Invite membersの場合のみ、
       * テキストをAdd membersへ変更する。
       */
      replaceCloneLabel(
        clone,
        definition
      );

      clone.setAttribute(
        CLONE_ATTRIBUTE,
        definition.key
      );

      clone.setAttribute(
        "data-constellucentia-action-key",
        definition.key
      );

      restoreCloneAppearance(clone);

      portal.appendChild(clone);

      state.sources.set(
        definition.key,
        source
      );

      state.clones.set(
        definition.key,
        clone
      );
    }

    state.cloneBuilds += 1;

    markDividers(dialog);
  }

  function reserveFooter(
    dialog,
    logout
  ) {
    const spacer =
      findSpacer(
        dialog,
        logout
      );

    if (!spacer) {
      state.spacer = null;
      return false;
    }

    if (state.spacer !== spacer) {
      state.spacer = spacer;

      state.spacerOriginalStyle =
        spacer.getAttribute(
          "style"
        );
    }

    spacer.setAttribute(
      SPACER_ATTRIBUTE,
      "true"
    );

    spacer.style.setProperty(
      "display",
      "block",
      "important"
    );

    spacer.style.setProperty(
      "height",
      `${RESERVED_HEIGHT}px`,
      "important"
    );

    spacer.style.setProperty(
      "min-height",
      `${RESERVED_HEIGHT}px`,
      "important"
    );

    spacer.style.setProperty(
      "max-height",
      `${RESERVED_HEIGHT}px`,
      "important"
    );

    spacer.style.setProperty(
      "flex",
      `0 0 ${RESERVED_HEIGHT}px`,
      "important"
    );

    return true;
  }

  function positionPortal() {
    const logout =
      state.logout;

    if (
      !logout ||
      !logout.isConnected ||
      state.clones.size !==
        ACTIONS.length
    ) {
      portal.hidden = true;
      return false;
    }

    const rect =
      logout.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      portal.hidden = true;
      return false;
    }

    portal.style.setProperty(
      "--constellucentia-portal-left",
      `${rect.left}px`
    );

    portal.style.setProperty(
      "--constellucentia-portal-top",
      `${rect.top - RESERVED_HEIGHT}px`
    );

    portal.style.setProperty(
      "--constellucentia-portal-width",
      `${rect.width}px`
    );

    portal.style.setProperty(
      "--constellucentia-portal-height",
      `${RESERVED_HEIGHT}px`
    );

    portal.hidden = false;

    state.positionUpdates += 1;

    return true;
  }

  function sameSourceSet(sources) {
    if (
      state.sources.size !==
      ACTIONS.length
    ) {
      return false;
    }

    return ACTIONS.every(
      (definition) => {
        return (
          state.sources.get(
            definition.key
          ) ===
          sources.get(
            definition.key
          )
        );
      }
    );
  }

  function apply() {
    state.scans += 1;

    state.lastRunAt =
      new Date().toISOString();

    const dialog =
      findWorkspaceDialog();

    if (!dialog) {
      portal.hidden = true;

      state.dialog = null;
      state.logout = null;

      state.lastResult =
        "workspace-menu-not-open";

      return;
    }

    const logout =
      findAction(
        dialog,
        LOGOUT_LABELS
      );

    const sources =
      new Map();

    for (const definition of ACTIONS) {
      sources.set(
        definition.key,
        findAction(
          dialog,
          definition.labels
        )
      );
    }

    const allFound =
      Boolean(logout) &&
      ACTIONS.every(
        (definition) => {
          return Boolean(
            sources.get(
              definition.key
            )
          );
        }
      );

    if (!allFound) {
      portal.hidden = true;

      state.lastResult =
        "waiting-for-actions";

      return;
    }

    state.dialog = dialog;
    state.logout = logout;

    const needsRebuild =
      !sameSourceSet(sources) ||
      state.clones.size !==
        ACTIONS.length;

    if (needsRebuild) {
      buildClones(
        dialog,
        sources
      );
    }

    const spacerReserved =
      reserveFooter(
        dialog,
        logout
      );

    const positioned =
      positionPortal();

    state.applications += 1;

    if (positioned) {
      state.lastResult =
        "actions-positioned-above-logout";
    } else if (spacerReserved) {
      state.lastResult =
        "waiting-for-logout-geometry";
    } else {
      state.lastResult =
        "footer-spacer-not-found";
    }
  }

  function scheduleApply() {
    if (
      state.scheduled ||
      state.destroyed
    ) {
      return;
    }

    state.scheduled = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        state.scheduled = false;

        try {
          apply();
        } catch (error) {
          state.lastError =
            String(
              error?.stack ||
              error?.message ||
              error
            );

          state.lastResult =
            "application-error";
        }
      });
    });
  }

  function findCloneFromEvent(
    event
  ) {
    const target =
      event.target;

    if (
      !(target instanceof Element)
    ) {
      return null;
    }

    return target.closest(
      `[${CLONE_ATTRIBUTE}]`
    );
  }

  /*
   * クローンのクリックを
   * React管理DOM内の元要素へ転送する。
   */
  function forwardCloneAction(
    event
  ) {
    const clone =
      findCloneFromEvent(event);

    if (!clone) {
      return;
    }

    const key =
      clone.getAttribute(
        CLONE_ATTRIBUTE
      );

    const source =
      state.sources.get(key);

    event.preventDefault();
    event.stopImmediatePropagation();

    if (
      !source ||
      !source.isConnected
    ) {
      state.lastResult =
        "proxy-source-disconnected";

      scheduleApply();
      return;
    }

    state.proxyClicks += 1;
    state.lastAction = key;

    state.lastResult =
      `proxy-click:${key}`;

    source.click();
  }

  /*
   * ポータル操作がNotionのoutside-click判定に
   * 渡らないようにする。
   */
  function blockClonePointerEvent(
    event
  ) {
    if (
      !findCloneFromEvent(event)
    ) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function handleCloneKeydown(
    event
  ) {
    if (
      event.key !== "Enter" &&
      event.key !== " "
    ) {
      return;
    }

    forwardCloneAction(event);
  }

  function cleanupLegacyArtifacts() {
    const legacyIds = [
      "constellucentia-settings-footer-style",
      "constellucentia-settings-footer-portal",
      "constellucentia-workspace-footer-actions-style",
      "constellucentia-workspace-footer-actions-portal",
      "constellucentia-native-footer-actions-style"
    ];

    for (const id of legacyIds) {
      document
        .getElementById(id)
        ?.remove();
    }

    const legacyAttributes = [
      "data-constellucentia-settings-source",
      "data-constellucentia-settings-clone",
      "data-constellucentia-footer-action-source",
      "data-constellucentia-footer-action-clone",
      "data-constellucentia-footer-actions-spacer",
      "data-constellucentia-footer-divider",
      "data-constellucentia-positioned-action",
      "data-constellucentia-original-divider"
    ];

    for (
      const attribute
      of legacyAttributes
    ) {
      const elements =
        document.querySelectorAll(
          `[${attribute}]`
        );

      for (const element of elements) {
        element.removeAttribute(
          attribute
        );
      }
    }
  }

  function installStyle() {
    document
      .getElementById(STYLE_ID)
      ?.remove();

    const style =
      document.createElement("style");

    style.id = STYLE_ID;

    style.textContent = `
      /*
       * 元要素はReact DOM内に残し、
       * display:noneではなく画面外へ退避する。
       */
      [${SOURCE_ATTRIBUTE}] {
        position: fixed !important;

        left: -10000px !important;
        top: -10000px !important;

        width: 1px !important;
        height: 1px !important;

        min-width: 1px !important;
        min-height: 1px !important;

        max-width: 1px !important;
        max-height: 1px !important;

        margin: 0 !important;
        padding: 0 !important;

        opacity: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /*
       * Notion本来の余分な区切り線と余白を消す。
       */
      [${DIVIDER_ATTRIBUTE}="true"] {
        display: none !important;

        width: 0 !important;
        height: 0 !important;

        min-height: 0 !important;
        max-height: 0 !important;

        padding: 0 !important;
        margin: 0 !important;
        border: 0 !important;

        overflow: hidden !important;
      }

      /*
       * 4項目を表示する独立ポータル。
       */
      #${PORTAL_ID} {
        position: fixed !important;

        left:
          var(--constellucentia-portal-left)
          !important;

        top:
          var(--constellucentia-portal-top)
          !important;

        width:
          var(--constellucentia-portal-width)
          !important;

        height:
          var(--constellucentia-portal-height)
          !important;

        box-sizing: border-box !important;

        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-end !important;

        padding-top:
          ${DIVIDER_SPACE}px !important;

        border-top:
          1px solid
          var(
            --c-borSec,
            rgba(55, 53, 47, 0.16)
          )
          !important;

        background:
          var(
            --c-bgPri,
            rgb(255, 255, 255)
          )
          !important;

        color:
          var(
            --c-fgPri,
            rgb(32, 31, 30)
          )
          !important;

        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        overflow: hidden !important;

        z-index: 2147483646 !important;
      }

      #${PORTAL_ID}[hidden] {
        display: none !important;
      }

      /*
       * 全項目に同一のルート寸法を適用する。
       * 内部の余白・アイコン位置はNotion本来の構造へ任せる。
       */
      #${PORTAL_ID}
      [${CLONE_ATTRIBUTE}] {
        box-sizing: border-box !important;

        display: flex !important;
        align-items: center !important;

        flex:
          0 0 ${ROW_HEIGHT}px !important;

        width: 100% !important;

        height: ${ROW_HEIGHT}px !important;
        min-height: ${ROW_HEIGHT}px !important;
        max-height: ${ROW_HEIGHT}px !important;

        margin: 0 !important;

        font-size: 11px !important;
        font-weight: 700 !important;

        cursor: pointer !important;

        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      #${PORTAL_ID}
      [${CLONE_ATTRIBUTE}] span,
      #${PORTAL_ID}
      [${CLONE_ATTRIBUTE}] div {
        font-size: 11px !important;
        font-weight: 700 !important;

        visibility: visible !important;
        opacity: 1 !important;
      }

      /*
       * SVGと画像アイコンの寸法を統一する。
       * 内部コンテナの構造は変更しない。
       */
      #${PORTAL_ID}
      [${CLONE_ATTRIBUTE}] svg,
      #${PORTAL_ID}
      [${CLONE_ATTRIBUTE}]
      img[src*="/icons/"] {
        width: 18px !important;
        height: 18px !important;

        min-width: 18px !important;
        max-width: 18px !important;

        visibility: visible !important;
        opacity: 1 !important;
      }

      #${PORTAL_ID}
      [${CLONE_ATTRIBUTE}]:hover {
        background:
          var(
            --c-bgSec,
            rgba(55, 53, 47, 0.08)
          )
          !important;
      }
    `;

    document.documentElement.appendChild(
      style
    );
  }

  function restoreCurrentElements() {
    for (
      const source
      of state.sources.values()
    ) {
      source?.removeAttribute(
        SOURCE_ATTRIBUTE
      );
    }

    if (state.spacer) {
      state.spacer.removeAttribute(
        SPACER_ATTRIBUTE
      );

      if (
        state.spacerOriginalStyle === null
      ) {
        state.spacer.removeAttribute(
          "style"
        );
      } else {
        state.spacer.setAttribute(
          "style",
          state.spacerOriginalStyle
        );
      }
    }

    document
      .querySelectorAll(
        `[${DIVIDER_ATTRIBUTE}]`
      )
      .forEach((element) => {
        element.removeAttribute(
          DIVIDER_ATTRIBUTE
        );
      });
  }

  function destroy() {
    if (state.destroyed) {
      return;
    }

    state.destroyed = true;

    state.observer?.disconnect();

    window.removeEventListener(
      "pointerdown",
      blockClonePointerEvent,
      true
    );

    window.removeEventListener(
      "mousedown",
      blockClonePointerEvent,
      true
    );

    window.removeEventListener(
      "click",
      forwardCloneAction,
      true
    );

    window.removeEventListener(
      "keydown",
      handleCloneKeydown,
      true
    );

    window.removeEventListener(
      "resize",
      scheduleApply,
      true
    );

    window.removeEventListener(
      "scroll",
      scheduleApply,
      true
    );

    restoreCurrentElements();

    portal.remove();

    document
      .getElementById(STYLE_ID)
      ?.remove();

    state.lastResult =
      "destroyed";
  }

  function status() {
    const dialog =
      findWorkspaceDialog();

    const found = {};

    for (const definition of ACTIONS) {
      found[definition.key] =
        dialog
          ? Number(
              Boolean(
                findAction(
                  dialog,
                  definition.labels
                )
              )
            )
          : 0;
    }

    const logoutFound =
      dialog
        ? Number(
            Boolean(
              findAction(
                dialog,
                LOGOUT_LABELS
              )
            )
          )
        : 0;

    return {
      version: VERSION,

      startedAt:
        state.startedAt,

      scans:
        state.scans,

      applications:
        state.applications,

      cloneBuilds:
        state.cloneBuilds,

      positionUpdates:
        state.positionUpdates,

      proxyClicks:
        state.proxyClicks,

      matchingDialogs:
        document.querySelectorAll(
          '[role="dialog"]'
        ).length,

      upgradeFound:
        found.upgrade || 0,

      settingsFound:
        found.settings || 0,

      addMembersFound:
        found["add-members"] || 0,

      addAccountFound:
        found["add-account"] || 0,

      logoutFound,

      sourceCount:
        state.sources.size,

      sourceKeys:
        Array.from(
          state.sources.keys()
        ),

      cloneCount:
        state.clones.size,

      cloneKeys:
        Array.from(
          state.clones.keys()
        ),

      spacerFound:
        Number(
          Boolean(state.spacer)
        ),

      reservedHeight:
        state.spacer
          ? RESERVED_HEIGHT
          : 0,

      dialogConnected:
        Boolean(
          state.dialog?.isConnected
        ),

      spacerConnected:
        Boolean(
          state.spacer?.isConnected
        ),

      portalConnected:
        portal.isConnected,

      portalVisible:
        portal.isConnected &&
        !portal.hidden,

      addMembersCloneText:
        normalizeText(
          state.clones
            .get("add-members")
            ?.textContent
        ) || null,

      lastRunAt:
        state.lastRunAt,

      lastAction:
        state.lastAction,

      lastError:
        state.lastError,

      lastResult:
        state.lastResult,

      destroyed:
        state.destroyed
    };
  }

  window.addEventListener(
    "pointerdown",
    blockClonePointerEvent,
    true
  );

  window.addEventListener(
    "mousedown",
    blockClonePointerEvent,
    true
  );

  window.addEventListener(
    "click",
    forwardCloneAction,
    true
  );

  window.addEventListener(
    "keydown",
    handleCloneKeydown,
    true
  );

  window.addEventListener(
    "resize",
    scheduleApply,
    true
  );

  window.addEventListener(
    "scroll",
    scheduleApply,
    true
  );

  state.observer =
    new MutationObserver(
      scheduleApply
    );

  state.observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );

  window[RUNTIME_KEY] = {
    version: VERSION,
    status,
    refresh: scheduleApply,
    destroy
  };

  scheduleApply();
})();
