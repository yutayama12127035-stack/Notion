// ==UserScript==
// @name         « No »　⁰⁰ _ Foundation
// @namespace    https://constellucentia.local/
// @version      0.1.0
// @description  Safe runtime foundation for Constellucentia on Notion Web.
// @author       Constellucentia
// @match        https://notion.so/*
// @match        https://*.notion.so/*
// @match        https://notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(() => {
  "use strict";

  /**
   * Constellucentia Runtime Foundation
   *
   * This file intentionally performs no feature-level DOM modifications.
   * It provides only lifecycle, cleanup, scheduling, and observation helpers
   * for later Constellucentia modules.
   */

  const NAME = "Constellucentia";
  const VERSION = "0.1.0";

  const RUNTIME_KEY = Symbol.for("constellucentia.runtime");
  const ROOT_MARKER = "data-constellucentia-runtime";

  const ALLOWED_HOSTS = Object.freeze([
    "notion.so",
    "notion.com",
    "notion.site",
  ]);

  const cleanupTasks = new Set();
  const scheduledTasks = new Map();
  const modules = new Map();

  let observerSequence = 0;
  let destroyed = false;

  /**
   * Return true only on approved Notion hosts.
   */
  function isAllowedHost(hostname = window.location.hostname) {
    return ALLOWED_HOSTS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  }

  /**
   * Report an isolated Constellucentia error.
   *
   * Errors are caught so that a failed customization does not stop
   * Notion's own JavaScript.
   */
  function reportError(scope, error) {
    try {
      console.error(`[${NAME}:${scope}]`, error);
    } catch {
      // Never allow diagnostics themselves to break the page.
    }
  }

  /**
   * Execute a function without propagating its error into Notion.
   */
  function safeCall(scope, callback, ...args) {
    try {
      return callback(...args);
    } catch (error) {
      reportError(scope, error);
      return undefined;
    }
  }

  /**
   * Register a cleanup function exactly once.
   *
   * The returned disposer is idempotent:
   * calling it repeatedly has no additional effect.
   */
  function trackCleanup(disposer) {
    if (typeof disposer !== "function") {
      return () => {};
    }

    let active = true;

    const trackedDisposer = () => {
      if (!active) {
        return;
      }

      active = false;
      cleanupTasks.delete(trackedDisposer);
      safeCall("cleanup", disposer);
    };

    cleanupTasks.add(trackedDisposer);
    return trackedDisposer;
  }

  /**
   * Schedule one task per key for the next animation frame.
   *
   * Repeated calls with the same key replace the pending callback instead
   * of creating additional frames. This prevents mutation bursts from
   * triggering repeated DOM work.
   */
  function schedule(key, callback) {
    if (destroyed || typeof callback !== "function") {
      return;
    }

    const taskKey = key ?? callback;
    const existingTask = scheduledTasks.get(taskKey);

    if (existingTask) {
      existingTask.callback = callback;
      return;
    }

    const task = {
      callback,
      frameId: 0,
    };

    task.frameId = window.requestAnimationFrame(() => {
      scheduledTasks.delete(taskKey);

      if (destroyed) {
        return;
      }

      safeCall(`schedule:${String(taskKey)}`, task.callback);
    });

    scheduledTasks.set(taskKey, task);
  }

  /**
   * Cancel a scheduled task by key.
   */
  function cancelScheduled(key) {
    const task = scheduledTasks.get(key);

    if (!task) {
      return;
    }

    window.cancelAnimationFrame(task.frameId);
    scheduledTasks.delete(key);
  }

  /**
   * Add an event listener with automatic runtime cleanup.
   */
  function listen(target, type, listener, options) {
    if (
      destroyed ||
      !target ||
      typeof target.addEventListener !== "function" ||
      typeof listener !== "function"
    ) {
      return () => {};
    }

    const guardedListener = (...args) => {
      safeCall(`event:${type}`, listener, ...args);
    };

    target.addEventListener(type, guardedListener, options);

    return trackCleanup(() => {
      target.removeEventListener(type, guardedListener, options);
    });
  }

  /**
   * Create a scoped and batched MutationObserver.
   *
   * Important:
   * - No observer is created until a feature explicitly calls this method.
   * - Mutation records are grouped into one animation-frame callback.
   * - The observer is automatically disconnected on runtime replacement.
   */
  function observe(target, callback, options = {}) {
    if (
      destroyed ||
      !(target instanceof Node) ||
      typeof callback !== "function"
    ) {
      return () => {};
    }

    const observerId = ++observerSequence;
    const scheduleKey = `observer:${observerId}`;

    const pendingRecords = [];

    const observer = new MutationObserver((records) => {
      pendingRecords.push(...records);

      schedule(scheduleKey, () => {
        if (pendingRecords.length === 0) {
          return;
        }

        const recordsToProcess = pendingRecords.splice(
          0,
          pendingRecords.length,
        );

        safeCall(scheduleKey, callback, recordsToProcess, observer);
      });
    });

    const normalizedOptions = {
      childList: options.childList ?? true,
      subtree: options.subtree ?? true,
      attributes: options.attributes ?? false,
      characterData: options.characterData ?? false,
      attributeFilter: options.attributeFilter,
      attributeOldValue: options.attributeOldValue ?? false,
      characterDataOldValue: options.characterDataOldValue ?? false,
    };

    observer.observe(target, normalizedOptions);

    return trackCleanup(() => {
      cancelScheduled(scheduleKey);
      pendingRecords.length = 0;
      observer.disconnect();
      observer.takeRecords();
    });
  }

  /**
   * Resolve after the initial document structure is available.
   */
  function ready() {
    if (document.readyState !== "loading") {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const stopListening = listen(
        document,
        "DOMContentLoaded",
        () => {
          stopListening();
          resolve();
        },
        { once: true },
      );
    });
  }

  /**
   * Register one feature module.
   *
   * A module name can be registered only once per runtime.
   * The initializer may return a cleanup function.
   */
  function registerModule(name, initializer) {
    if (
      destroyed ||
      typeof name !== "string" ||
      name.trim() === "" ||
      typeof initializer !== "function"
    ) {
      return () => {};
    }

    const moduleName = name.trim();

    if (modules.has(moduleName)) {
      return modules.get(moduleName).dispose;
    }

    const moduleCleanupTasks = new Set();

    const moduleContext = Object.freeze({
      name: moduleName,
      version: VERSION,
      ready,
      schedule: (key, callback) =>
        schedule(`${moduleName}:${String(key)}`, callback),
      cancelScheduled: (key) =>
        cancelScheduled(`${moduleName}:${String(key)}`),
      listen: (target, type, listener, options) => {
        const dispose = listen(target, type, listener, options);
        moduleCleanupTasks.add(dispose);
        return dispose;
      },
      observe: (target, callback, options) => {
        const dispose = observe(target, callback, options);
        moduleCleanupTasks.add(dispose);
        return dispose;
      },
      addCleanup: (disposer) => {
        const dispose = trackCleanup(disposer);
        moduleCleanupTasks.add(dispose);
        return dispose;
      },
    });

    const initializerResult = safeCall(
      `module:${moduleName}`,
      initializer,
      moduleContext,
    );

    if (typeof initializerResult === "function") {
      moduleCleanupTasks.add(trackCleanup(initializerResult));
    }

    const dispose = trackCleanup(() => {
      for (const task of [...moduleCleanupTasks].reverse()) {
        safeCall(`module:${moduleName}:cleanup`, task);
      }

      moduleCleanupTasks.clear();
      modules.delete(moduleName);
    });

    modules.set(moduleName, {
      name: moduleName,
      dispose,
    });

    return dispose;
  }

  /**
   * Mark the document without changing its visual presentation.
   */
  function markDocument() {
    const root = document.documentElement;

    if (!root) {
      return;
    }

    root.setAttribute(ROOT_MARKER, VERSION);
  }

  /**
   * Remove only the marker owned by this runtime version.
   */
  function unmarkDocument() {
    const root = document.documentElement;

    if (!root || root.getAttribute(ROOT_MARKER) !== VERSION) {
      return;
    }

    root.removeAttribute(ROOT_MARKER);
  }

  /**
   * Destroy every resource created through this runtime.
   *
   * This makes ScriptCat reinjection and development reloads safe.
   */
  function destroy(reason = "manual") {
    if (destroyed) {
      return;
    }

    destroyed = true;

    for (const task of scheduledTasks.values()) {
      window.cancelAnimationFrame(task.frameId);
    }

    scheduledTasks.clear();

    for (const dispose of [...cleanupTasks].reverse()) {
      safeCall(`destroy:${reason}`, dispose);
    }

    cleanupTasks.clear();
    modules.clear();
    unmarkDocument();

    if (window[RUNTIME_KEY] === runtime) {
      try {
        delete window[RUNTIME_KEY];
      } catch {
        // The page remains safe even if the property cannot be deleted.
      }
    }
  }

  /**
   * Return a read-only diagnostic snapshot.
   */
  function status() {
    return Object.freeze({
      name: NAME,
      version: VERSION,
      initialized: !destroyed,
      destroyed,
      hostname: window.location.hostname,
      moduleCount: modules.size,
      scheduledTaskCount: scheduledTasks.size,
      cleanupTaskCount: cleanupTasks.size,
      observerCount: observerSequence,
      markerInstalled:
        document.documentElement?.getAttribute(ROOT_MARKER) === VERSION,
    });
  }

  if (window.top !== window.self || !isAllowedHost()) {
    return;
  }

  /**
   * Stop a previous Constellucentia runtime before installing this one.
   */
  const previousRuntime = window[RUNTIME_KEY];

  if (
    previousRuntime &&
    typeof previousRuntime.destroy === "function"
  ) {
    safeCall("previous-runtime", () => {
      previousRuntime.destroy("runtime-replacement");
    });
  }

  const runtime = Object.freeze({
    name: NAME,
    version: VERSION,
    ready,
    schedule,
    cancelScheduled,
    listen,
    observe,
    registerModule,
    destroy,
    status,
  });

  try {
    Object.defineProperty(window, RUNTIME_KEY, {
      value: runtime,
      configurable: true,
      enumerable: false,
      writable: false,
    });
  } catch (error) {
    reportError("runtime-installation", error);
    return;
  }

  if (document.documentElement) {
    markDocument();
  } else {
    listen(document, "DOMContentLoaded", markDocument, { once: true });
  }

  /**
   * No feature module is registered in the foundation release.
   *
   * Future features must be added through registerModule().
   * Therefore this version starts no MutationObserver, timer, polling loop,
   * route hook, network request, or feature-level DOM scan.
   */
})();
