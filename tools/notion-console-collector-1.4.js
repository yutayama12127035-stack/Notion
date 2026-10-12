/* ============================================================
   Next Notion 状態収集ツール v1.4（Console 貼り付け用・読み取り専用）
   v1.4（196 と一緒に）:
     ・³³ 196 がページ側に出す読み取りの口 __c33（status・next・hold・rows・star・find・inventory・rl・split.status）を直接読む
     ・契約の属性（html の data-c194-hold・data-c194-split・data-c194-ready・data-c194-on）と Foundation v0.2.0 の契約・合図の数・世代・inventory
     ・見出し行は Notion の写し（.sticky-portal-target）かどうかを付ける。行は見出し行を数えない
     ・観測 10 秒: ビューの切り替えの回数・hold 中の ⁰⁵ transform の変化・c194:rowlayout の発信元ごとの数・¹⁸ triggers と ²¹ timeout の増え方・
       切り替えの直後と 1 秒後の先頭 10 行（高さと y）の一致
     ・__CX.ids(): 全部のビューの ID（タブの data-collection-view-id）と名前・³³ が見ている DB ID・上下分割に足すための __c33.split.add(…) の行
   使い方:
     1. Notion で対象ページ（フルDBを開いた状態）を表示
     2. DevTools の Console にこの中身を丸ごと貼り付けて Enter
     3. notion-state-<日時>.json が保存される
     4. 実行後 10 秒以内にビュー切替を 1〜2 回行うこと
        （操作しないと観測値は 0 のままで判定に使えない）
     5. 10 秒後に notion-state-observed.json が自動保存される
     6. ID の追加収集は Console で __CX.ids() を実行 → notion-ids.json
        （DB ID・ビュー ID・表紙列の property id・先頭レコードの block id）
     再保存: __CX.save() ／ 内容確認: __CX.last ／ 観測: __CX.observed
   ※ ページの DOM・設定・データは一切変更しない
   ============================================================ */
(() => {
  "use strict";
  const out = { meta: {}, runtime: null, htmlAttrs: [], htmlDataset: {}, rootVars: {}, markers: {}, layout: {}, debugApis: {}, perf: {}, notes: [] };
  const safe = (fn, alt) => { try { const v = fn(); return v === undefined ? alt : v; } catch (e) { return "ERR:" + ((e && e.message) || e); } };
  const j = (v) => safe(() => JSON.parse(JSON.stringify(v)), "unserializable");
  const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }; };
  const q = (s) => document.querySelector(s);
  const qa = (s) => { try { return [...document.querySelectorAll(s)]; } catch (e) { return []; } };
  // 本文スクローラーの特定（サイドバー側 x:-260 を拾わない。x=100 の本文を取りこぼさない）
  const mainScroll = (dir) => {
    const f = q(".notion-frame");
    if (!f) return null;
    return [...f.querySelectorAll(".notion-scroller")].find((s) => {
      const r = s.getBoundingClientRect();
      if (r.x < 90) return false;
      const cls = String(s.className);
      return dir === "v" ? (r.height > 200 && /vertical/.test(cls)) : /horizontal/.test(cls);
    }) || null;
  };

  out.meta = {
    collectedAt: new Date().toISOString(),
    url: location.href,
    pageId: (location.pathname.match(/[0-9a-f]{32}/i) || [null])[0],
    viewId: safe(() => new URLSearchParams(location.search).get("v"), null),
    title: document.title,
    viewport: { w: innerWidth, h: innerHeight },
    devicePixelRatio: devicePixelRatio,
    themeColorScheme: safe(() => getComputedStyle(document.body).colorScheme, null),
    bodyBg: safe(() => getComputedStyle(document.body).backgroundColor, null),
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  };

  out.runtime = safe(() => { const r = window[Symbol.for("constellucentia.runtime")]; return r && r.status ? j(r.status()) : null; }, null);
  out.inventory = safe(() => { const r = window[Symbol.for("constellucentia.runtime")]; return r && r.inventory ? j(r.inventory.list()) : null; }, null);
  const H = document.documentElement;
  out.contract = { hold: H.getAttribute("data-c194-hold"), split: H.getAttribute("data-c194-split"), ready: H.getAttribute("data-c194-ready"), on: H.hasAttribute("data-c194-on") };
  out.htmlAttrs = [...document.documentElement.attributes].map(a => a.name).sort();
  out.htmlDataset = j(Object.assign({}, document.documentElement.dataset));

  const rs = document.documentElement.style, vars = {};
  for (let i = 0; i < rs.length; i++) { const p = rs[i]; if (p.startsWith("--")) vars[p] = rs.getPropertyValue(p).trim(); }
  out.rootVars = vars;

  const ATTRS = ["data-constellucentia-runtime","data-c33-ready","data-c33-boot","data-c33-cur","data-c33-kind","data-c33-team","data-c33-stella","data-c33-tree","data-c33-vslot","data-c16-ready","data-c16-settled","data-c16-state","data-c16-hide","data-c16c-open","data-c16c-ms","data-c18-shift","data-c19-tab","data-c21-veil","data-c21-veil-scope","data-c05-full","data-c12-ln","data-c12-primary","data-c12-tab","data-c12-first-col","data-c14-page","data-c194-on","data-c194-grid","data-c194-sticky","data-c194-hide","data-c194-about","data-c194-band","data-c194-bandrow","data-c194-tbl","data-c194-head","data-c194-sb","data-c194-sh","data-c194-hold","data-c194-row","data-c194-hot","data-c194-intro","data-c194-narrow","data-c34","data-c34-img","data-c36-body","data-tl-tabs","data-tl-tabrow","data-nebius","data-neb-narrow","data-neb-peek","data-neb-pinned","cordivestium-relation-active","data-col-index","data-c194-veil","data-c194-split","data-c194-ready","data-c196-split","data-c196-cols","data-c154-db","data-cordi13-on","data-cordi13-done","data-constellucentia-full-db-description-aligned"];
  const counts = {};
  for (const a of ATTRS) { let n = 0; try { n = qa("[" + a + "]").length; } catch (e) { n = -1; } if (n) counts[a] = n; }
  out.markers = counts;

  out.layout = {
    frame: rect(q(".notion-frame")),
    mainScroller: rect(mainScroll("v")),
    scrollerHorizontal: rect(mainScroll("h")),
    scrollTop: safe(() => { const s = mainScroll("v"); return s ? Math.round(s.scrollTop) : null; }, null),
    scrollLeft: safe(() => { const s = mainScroll("h"); return s ? Math.round(s.scrollLeft) : null; }, null),
    headerRows: qa(".notion-table-view-header-row").slice(0, 6).map(el => ({ r: rect(el), text: (el.textContent || "").trim().slice(0, 40), portal: !!el.closest(".sticky-portal-target"), inTableView: !!el.closest(".notion-table-view"), shown: getComputedStyle(el).display !== "none" })),
    columnHeaders: qa("[role=columnheader]").length,
    rows: qa(".notion-table-view-row").filter(el => !el.closest(".notion-table-view-header-row")).slice(0, 10).map(el => ({ h: Math.round(el.getBoundingClientRect().height * 10) / 10, y: Math.round(el.getBoundingClientRect().y * 10) / 10 })),
    tabs: qa(".notion-collection-view-tab-button").slice(0, 14).map(el => ({ t: (el.textContent || "").trim().slice(0, 20), r: rect(el) })),
    band: rect(q("[data-c194-band]")),
    about: rect(q("[data-c194-about]")),
    hiddenHeads: qa("[data-c194-hide]").slice(0, 3).map(el => ({ h: Math.round(el.getBoundingClientRect().height * 10) / 10 })),
    split: { on: !!q("[data-c196-split]"), view: H.getAttribute("data-c194-split") },
    sticky: { on: !!q(".notion-scroller[data-c194-sticky]"), scrollPaddingTop: safe(() => { const s = q(".notion-scroller[data-c194-sticky]"); return s ? getComputedStyle(s).scrollPaddingTop : null; }, null) },
    shift05: qa("[data-constellucentia-full-db-body-shift],[data-constellucentia-full-db-body-sticky-shift]").slice(0, 5).map(el => ({ attr: el.getAttribute("data-constellucentia-full-db-body-shift") ?? el.getAttribute("data-constellucentia-full-db-body-sticky-shift"), transform: safe(() => getComputedStyle(el).transform, null) })),
    c18: { active: !!q("[data-c18-shift]"), els: qa("[data-c18-shift]").length },
    coverCells: qa("[data-c34]").length, coverImgs: qa("img[data-c34-img]").length,
  };

  // 診断口の探索：列挙されない名前も拾うため getOwnPropertyNames を使う
  const PROBES = ["status", "settled", "busy", "log", "why", "rows", "next", "next194", "inventory", "state", "align", "selbg", "hscroll", "dbfit", "veil", "debug", "stats", "practice", "notes", "hold"];
  const apis = {};
  for (const k of Object.getOwnPropertyNames(window)) {
    if (!k.startsWith("__")) continue;
    let obj; try { obj = window[k]; } catch (e) { continue; }
    if (!obj || (typeof obj !== "object" && typeof obj !== "function")) continue;
    const rec = {};
    for (const p of PROBES) {
      if (typeof obj[p] === "function") rec[p] = safe(() => { const v = obj[p](); if (v === undefined) return "(no return)"; try { return JSON.parse(JSON.stringify(v)); } catch (e) { return String(v).slice(0, 300); } }, "ERR");
    }
    if (Object.keys(rec).length) apis[k] = rec;
  }
  out.debugApis = apis;
  // ³³ 196 の読み取りの口（ページ側の __c33）を直接読む。無ければ理由を残す
  out.c33 = safe(() => {
    const c = window.__c33;
    if (!c) return { missing: "window.__c33 がありません（³³ が 196 より前か、ScriptCat の箱の中だけにある）" };
    const call = (f) => safe(() => j(f()), "ERR");
    return { version: c.version, next: c.next ? call(c.next) : null, hold: c.hold ? call(c.hold) : null, rows: c.rows ? call(c.rows) : null, star: c.star ? call(c.star) : null, find: c.find ? call(c.find) : null, inventory: c.inventory ? call(c.inventory) : null, rl: c.rl ? call(c.rl) : null, split: c.split && c.split.status ? call(c.split.status) : null };
  }, null);

  out.perf = safe(() => ({ memory: performance.memory ? { usedJSHeapSize: performance.memory.usedJSHeapSize, totalJSHeapSize: performance.memory.totalJSHeapSize } : null, domNodes: document.getElementsByTagName("*").length }), {});

  // 時間観測：data-c194-hold の付け外しを MutationObserver で記録（短い hold も取りこぼさない）＋
  // ⁰⁵ transform の変化回数・c194:rowlayout の発信回数を 10 秒間観測 → notion-state-observed.json
  out.observation = { durationMs: 10000, holdEvents: [], transform05Changes: null, transform05ChangesDuringHold: null, rowlayoutFired: null, rowlayoutBySrc: {}, viewSwitches: 0, rowsStable: [], c18TriggersDelta: null, c21TimeoutDelta: null, note: "実行後10秒以内にビュー切替を1〜2回行うこと（操作しないと0のままで判定に使えない）。報告には『切替○回で transform 変化○回』を添える" };
  try {
    const t0 = performance.now();
    let n05 = 0, n05h = 0, nrow = 0, last05 = "";
    const st18 = () => safe(() => { const s = window.__c18 && window.__c18.status(); return s ? (s.triggers ?? (s.stats && s.stats.triggers)) : null; }, null);
    const st21 = () => safe(() => { const s = window.__c21 && window.__c21.status(); return s ? (s.timeout ?? (s.stats && s.stats.timeout)) : null; }, null);
    const c18a = st18(), c21a = st21();
    const onRow = (e) => { nrow++; const src = safe(() => (e.detail && e.detail.src) || "?", "?"); out.observation.rowlayoutBySrc[src] = (out.observation.rowlayoutBySrc[src] || 0) + 1; };
    document.addEventListener("c194:rowlayout", onRow, { passive: true });
    const rowsNow = () => qa(".notion-table-view-row").filter(el => !el.closest(".notion-table-view-header-row")).slice(0, 10).map(el => { const r = el.getBoundingClientRect(); return [Math.round(r.y * 10) / 10, Math.round(r.height * 10) / 10]; });
    let selLast = safe(() => { const t = q('.notion-frame [role="tablist"] [role="tab"][aria-selected="true"]'); return t ? (t.closest("[data-collection-view-id]") || t).getAttribute("data-collection-view-id") || (t.textContent || "").trim() : ""; }, "");
    const onSwitch = () => {
      out.observation.viewSwitches++;
      const rec = { t: Math.round(performance.now() - t0), at100: null, at1100: null, same: null };
      out.observation.rowsStable.push(rec);
      setTimeout(() => { rec.at100 = rowsNow(); }, 100);
      setTimeout(() => { rec.at1100 = rowsNow(); rec.same = JSON.stringify(rec.at100) === JSON.stringify(rec.at1100); }, 1100);
    };
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes" && m.attributeName === "data-c194-hold") {
          out.observation.holdEvents.push({ t: Math.round(performance.now() - t0), on: m.target.hasAttribute("data-c194-hold"), value: m.target.getAttribute("data-c194-hold"), tag: m.target.tagName.toLowerCase(), cls: String(m.target.className || "").slice(0, 60) });
        }
        if (m.type === "attributes" && m.attributeName === "aria-selected" && m.target.getAttribute("aria-selected") === "true") {
          const b = m.target.closest("[data-collection-view-id]");
          const key = b ? b.getAttribute("data-collection-view-id") : (m.target.textContent || "").trim();
          if (key && key !== selLast) { selLast = key; onSwitch(); }
        }
      }
    });
    mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["data-c194-hold", "aria-selected"] });
    const iv = setInterval(() => {
      const sh = (q(".notion-frame") ? [...q(".notion-frame").querySelectorAll("[data-constellucentia-full-db-body-shift],[data-constellucentia-full-db-body-sticky-shift]")][0] : null);
      const tf = sh ? (safe(() => getComputedStyle(sh).transform, null) || "") : "";
      const key = tf + "@" + Math.round((sh ? sh.getBoundingClientRect().x : 0) * 10) / 10;
      if (last05 && key !== last05) { n05++; if (document.documentElement.hasAttribute("data-c194-hold")) n05h++; }
      last05 = key;
      if (performance.now() - t0 >= 11500) {
        clearInterval(iv); mo.disconnect(); document.removeEventListener("c194:rowlayout", onRow);
        out.observation.transform05Changes = n05; out.observation.transform05ChangesDuringHold = n05h; out.observation.rowlayoutFired = nrow;
        const c18b = st18(), c21b = st21();
        out.observation.c18TriggersDelta = (typeof c18a === "number" && typeof c18b === "number") ? c18b - c18a : null;
        out.observation.c21TimeoutDelta = (typeof c21a === "number" && typeof c21b === "number") ? c21b - c21a : null;
        out.observation.summary = "切替 " + out.observation.viewSwitches + " 回で transform 変化 " + n05 + " 回（hold 中 " + n05h + " 回）・¹⁸ triggers +" + out.observation.c18TriggersDelta + "・²¹ timeout +" + out.observation.c21TimeoutDelta + "・行の一致 " + out.observation.rowsStable.filter(x => x.same).length + "/" + out.observation.rowsStable.length;
        out.c33After = safe(() => window.__c33 && window.__c33.hold ? j({ hold: window.__c33.hold(), rl: window.__c33.rl ? window.__c33.rl() : null }) : null, null);
        window.__CX.observed = j(out);
        try { const blob = new Blob([JSON.stringify(window.__CX.observed, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "notion-state-observed.json"; document.body.appendChild(a); a.click(); a.remove(); } catch (e) {}
      }
    }, 500);
  } catch (e) { out.notes.push("observation failed: " + e); }

  window.__CX = { last: out,
    save: () => { const name = "notion-state-" + new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19) + ".json"; const blob = new Blob([JSON.stringify(window.__CX.last, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); return name; },
    // ID 収集：__CX.ids() — 追加したい DB・ビューはこの JSON を依頼側に送るだけで、ID の追記だけで対象へ追加できる
    ids: () => {
      const o = { collectedAt: new Date().toISOString(), pageId: out.meta.pageId, viewId: out.meta.viewId, pageIdsInUrl: [], databases: [], views: [], headerCells: [], firstRecordBlockId: null, c33: null, splitAdd: null };
      safe(() => { const ids = new Set(); for (const m of String(location.href).matchAll(/[0-9a-f]{32}/gi)) ids.add(m[0]); o.pageIdsInUrl = [...ids]; }, null);
      safe(() => {
        for (const el of qa(".notion-collection_view-block,[data-collection-id],[data-block-id]")) {
          const rec = {};
          for (const a of ["data-block-id", "data-collection-id", "data-collection-view-id", "data-view-id"]) if (el.getAttribute(a)) rec[a.slice(5)] = el.getAttribute(a);
          if (Object.keys(rec).length && o.databases.length < 30) o.databases.push(rec);
        }
      }, null);
      safe(() => { o.views = qa(".notion-frame .notion-collection-view-tab-button").map(t => { const b = t.closest("[data-collection-view-id]") || t.querySelector("[data-collection-view-id]"); const tab = t.querySelector('[role="tab"]') || t.closest('[role="tab"]'); return { name: (t.textContent || "").trim().slice(0, 40), viewId: b ? String(b.getAttribute("data-collection-view-id")).replace(/-/g, "") : null, selected: !!(tab && tab.getAttribute("aria-selected") === "true") }; }); }, null);
      safe(() => { const n = window.__c33 && window.__c33.next ? window.__c33.next() : null; if (n) { o.c33 = { db: n.db, view: n.view, name: n.name }; if (n.db && n.view) o.splitAdd = "__c33.split.add('" + n.db + "', '" + n.view + "')"; } }, null);
      safe(() => { o.headerCells = qa(".notion-table-view-header-cell,[role=columnheader]").map(h => ({ name: (h.textContent || "").trim().slice(0, 24), id: h.getAttribute("data-col-id") || h.getAttribute("data-property-id") || null })); }, null);
      safe(() => { const row = q(".notion-table-view-row,[role=row]"); if (row) { const b = row.closest("[data-block-id]"); o.firstRecordBlockId = b ? b.getAttribute("data-block-id") : (row.getAttribute("data-block-id") || null); } }, null);
      safe(() => { const s = window.__c41 && window.__c41.status(); if (s && s.cols) o.properties = s.cols.map(c => ({ name: c.name, pid: c.pid, title: c.title })); }, null);
      window.__CX.lastIds = o;
      const blob = new Blob([JSON.stringify(o, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "notion-ids.json"; document.body.appendChild(a); a.click(); a.remove();
      return o;
    } };
  const name = window.__CX.save();
  console.log("%c[Next Notion 収集 v1.4] 保存: " + name + " ／ 10秒後: notion-state-observed.json ／ ID: __CX.ids() ／ 内容: __CX.last", "color:#b98a2f");
  return out;
})();
