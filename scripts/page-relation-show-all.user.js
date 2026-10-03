// ==UserScript==
// @name         « No »　²³ _ Page Relation Show All
// @namespace    https://cordivestium.local/page-relation-show-all
// @version      2.9.0
// @description  v2.9.0: サブグループ — グループの中を、グループごとに好きな名前で分けられる（例: 学園 → アクション・何段でも）。見出しを右クリック → 名前と入れる本。本を右クリックでもサブグループへ。題名とアイコンは ✎（サブグループは見出しのクリック）。¹⁴ と共通の設定。v2.8.0: グループ（シリーズ）見出しの題名とアイコンを個別に変えられるように — 見出しにカーソルを乗せると右に ✎（または見出しを右クリック）で編集パネル（²⁹ Icon Library・絵文字・SVG／画像・アイコンなし・元に戻す）。見出しのクリックは従来どおり畳む／開く。シリーズの無い本の「単行」にも既定のアイコン（本）と見出しを付け、題名・アイコンを変えられる。本を右クリックで好きなグループへ移せる（自分で作ったグループも可・Notion のデータは書き換えない）。設定は ¹⁴ Relation Show All と共通。v1.8.0: 誤作動の防止 — ほかの画面（²⁶ のテキストパネル・Notion のメニューやダイアログ・入力欄など）が上に重なっている所を押した時は、その下の見出し・本を拾わない（パネル越しに畳んだり本を開いたりしていた）。v1.7.0: ①1列になったグループ（長い題名のグループ）が見出しクリックで畳めなかった不具合を修正（1列の指定が畳む指定より強かった）。②既定値を運用中の値へ（文字 11px・行の高さ 3.25・アイコン 20px・アイコンと文字 10px・見出しの文字 13px・アイコンと見出し 10px）。行の高さは 4 まで、アイコンと文字は 24px まで広げた。v1.6.0: シリーズ見出しのアイコン（例: ガリレオのフラスコ）の大きさと、アイコンと文字の間を編集パネルで変えられるように（見出しのアイコン 8〜40px・0 = 見出しの文字に合わせる自動）。v1.5.0: 長い題名のグループは1列 — グループの中で一番長い題名が「1列にする長さ」（既定 16字・全角1／半角0.5で数える）以上なら、そのグループだけ1列で題名を省略せずに出す（例:「お隣の天使様にいつの間にか駄目人間にされていた件 − 1」）。0 で無効。編集パネルに項目を追加。v1.4.0: ①グループ（シリーズ）とグループの間隔を編集パネルの上の方に「グループの間」として置き、0〜80px で変えられるように（Notion 側の余白指定に負けない書き方に変更） ②見出しの下の線は点線に固定し、線の編集項目はパネルから外した（コンソールの __c23.set では引き続き変更可）。v1.3.0: 見出しの下の区切り線を編集できるように — 長さ（区画の幅に対する %）・太さ（0 で消す）・濃さ・線と本の間、をパネルとコンソールで。v1.2.0: 見出しクリックで畳めなかった件を作り直し — ①開閉の状態を区画の要素の属性ではなく <head> の専用 <style> に持つ（Notion の編集領域の中は一切書き換えない＝戻されない・描き直しに影響されない） ②押した位置の真下を elementsFromPoint で調べて見出しを見つける（Notion の透明な重なりに押しが吸われても拾う） ③pointerdown / mousedown / pointerup / mouseup / click のうち最初に届いたもので1回だけ開閉。▾（トグル記号）は廃止。v1.1.0: シリーズ見出し（文字・アイコン・件数・▾ のどこでも）をクリックすると畳む／開く。押した瞬間に Notion がブロック選択で区画を描き直し、クリックが見出しに届かず畳めないことがあったのを修正（押した瞬間を ²³ が受け止め、Notion へは渡さない）。Alt（⌥）＋クリックで全見出しをまとめて畳む／開く。▾ の向きで状態を表示。ページを開いた時の「リレーションの区画」（例: 東野圭吾 → Tactus の作品一覧。Notion は10件＋「17 more…」しか出さない）を、¹⁴ Relation Show All と同じ考え方で「全件・シリーズごとの見出し付き」に並べ直す。狭い幅（サイドピーク）向けに、列数は幅から自動（格子）／1列／流し込みを選べる。文字・アイコン・列幅・行間・見出し・題名の省略などを、区画の右上の ⚙ から専用の編集パネルで変えられる（localStorage に保存）。一度表示した区画は記憶し、Notion が描き直した瞬間（描画前）に同じ中身で出す。Notion の元の一覧は消さずに隠すだけ（「リンク」「新規」はそのまま使える）。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/*
 * v2.8.0（2026-10-03）
 *   ・見出しの編集: 見出しにカーソルを乗せると右端に ✎ → 題名とアイコンの編集パネル（見出しの右クリックでも）。
 *     見出しのクリックは今までどおり畳む／開く（⌥で全部）。畳んだ状態は元の題名で覚えるので、題名を変えても保たれる。
 *   ・「単行」: 既定で本のアイコン。単行しか無い区画でも見出しを出す（旧版は単行だけの時は見出しを出さなかった）。
 *   ・本を右クリック → 「◯◯を移す」（一覧のグループ・自分で作ったグループ・単行／元に戻す／新しいグループ）。
 *   ・設定は ¹⁴ Relation Show All v1.47.0 と共通（localStorage「cordi.groups.v1」）。
 *
 * しくみ
 *   ① 見つけ方（構造だけ）
 *        [role="menu"] の中に [aria-label="Editable title"] の行がある
 *        ＝ページのリレーション区画の一覧。その2段上に見出し（[role="cell"][aria-haspopup="dialog"]）があり、
 *        見出しの文字がプロパティ名（例: Tactus）。ページidは区画を包む [data-block-id]。
 *        表（DB）の中・ダイアログの中は対象外（表は ¹⁴ の担当）。
 *   ② 中身（API: /api/v3/syncRecordValues。¹⁴ と同じ経路）
 *        ページ → 親DBの schema でプロパティ名から key → 関係先ページ全件 → 関係先DBの「Series」
 *        → シリーズページの題名・アイコン → シリーズごとの見出しで並べる（シリーズ無しは「単行」で最後）
 *   ③ 描画を見せない
 *        作った中身はページ×プロパティごとに localStorage に記憶。Notion が区画を描き直した瞬間
 *        （MutationObserver のコールバック＝描画前）に記憶から同じ中身を出す。
 *        裏で API を読み直し、変わっていた時だけ差し替える。
 *        記憶が無い初回だけは、Notion の元の一覧のまま待って、出来たら短いフェードで差し替える。
 *   ④ 見せ方の編集
 *        区画にカーソルを置くと右上に ⚙。パネルで並べ方・文字・アイコン・列幅・行間・見出し・省略などを変更。
 *        「この区画では使わない」でプロパティ名ごとに元の一覧へ戻せる。
 *   ⑥ v1.2.0: 見出しの開閉を作り直し
 *        ・状態は <head> の <style id="c23-fold"> に「この見出しの中身を隠す」規則として書く。
 *          区画（Notion の編集領域の中）の属性は書き換えない
 *        ・押した位置の真下の要素を document.elementsFromPoint で調べる（重なりに吸われても拾う）
 *        ・どの種類のイベントが Notion に止められても、最初に届いたもので開閉（同じ操作では1回だけ）
 *        ・▾（トグル記号）は付けない
 *   ⑤ v1.1.0: 見出しの開閉
 *        見出しのどこを押しても畳む／開く（状態はプロパティ名×シリーズ名で保存）。⌥（Alt）＋押すと全見出しをまとめて。
 *        押した瞬間（pointerdown）を文書全体の入口で受け止めて Notion へ渡さない。旧版は Notion が押した瞬間に
 *        区画を描き直し（ブロック選択）、²³ も描画前に同じ中身で出し直すため、クリックが元の見出しに届かなかった。
 *        本・⚙ も同じ入口で受け止める（描き直しに巻き込まれない）。
 *        コンソール: __c23.set({ FONT_SIZE: 12 }) / __c23.reset() / __c23.refresh() / __c23.status()
 */

(() => {
  'use strict';

  const VERSION = '2.9.0';
  const API = '__c23';
  const TAG = '[²³ v' + VERSION + ']';
  if (window[API] && window[API].version) return;

  /* ============================================================
   *  グループの編集（¹⁴ Relation Show All と ²³ Page Relation Show All で共通・同じ保存先）
   *   ・見出しの題名とアイコンを、グループごとに変える（Notion のデータは書き換えない・このブラウザだけ）
   *   ・シリーズの無い本（単行）にもアイコンと題名を付けられる
   *   ・本を好きなグループへ移す（自分で作ったグループも可）
   *   window.__cordiGroups を先に起きた方が作り、もう片方はそれを使う
   * ============================================================ */
  const CG = (function cordiGroups() {
    const CGV = 2;   // v2: サブグループ（グループの中に、グループごとに好きなだけ）
    if (window.__cordiGroups && window.__cordiGroups.v >= CGV) return window.__cordiGroups;
    const LS = 'cordi.groups.v1';
    const EVT = 'cordi-groups-change';
    let S = { groups: {}, items: {}, custom: [], subs: {}, sub: {} };
    const load = () => {
      try {
        const o = JSON.parse(localStorage.getItem(LS) || 'null');
        if (o && typeof o === 'object') S = { groups: o.groups || {}, items: o.items || {}, custom: Array.isArray(o.custom) ? o.custom : [], subs: o.subs || {}, sub: o.sub || {} };
      } catch (e) { /* noop */ }
    };
    load();
    const fire = () => { try { window.dispatchEvent(new CustomEvent(EVT)); } catch (e) { /* noop */ } };
    const save = () => { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { /* noop */ } fire(); };
    window.addEventListener('storage', (e) => { if (e.key === LS) { load(); fire(); } });
    /* 既定の「単行」のアイコン（本・線） */
    const STANDALONE_ICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#91918E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4.5h10.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h10.5"/><path d="M9 8.5h5"/></svg>');
    const keyOf = (sec) => (sec.standalone ? '__standalone__' : sec.sid ? 'p:' + sec.sid : 't:' + sec.name);
    const meta = (key) => S.groups[key] || {};
    const label = (key, def) => { const m = meta(key); return m.label || def; };
    const icon = (key, def) => { const m = meta(key); return m.icon !== undefined ? m.icon : (key === '__standalone__' && !def ? STANDALONE_ICON : def); };
    function setMeta(key, patch) {
      const m = Object.assign({}, S.groups[key] || {}, patch);
      Object.keys(m).forEach((k) => { if (m[k] === null || m[k] === undefined) delete m[k]; });
      if (Object.keys(m).length) S.groups[key] = m; else delete S.groups[key];
      const c = S.custom.find((x) => x.key === key);
      if (c && patch.label) c.label = patch.label;
      save();
    }
    function newGroup(name) {
      const key = 'c:' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      S.custom.push({ key, label: name });
      S.groups[key] = { label: name };
      save();
      return key;
    }
    function removeGroup(key) {
      S.custom = S.custom.filter((x) => x.key !== key);
      delete S.groups[key];
      Object.keys(S.items).forEach((id) => { if (S.items[id] === key) delete S.items[id]; });
      save();
    }
    const assigned = (id) => S.items[id] || null;
    function assign(id, key) { if (key) S.items[id] = key; else delete S.items[id]; delete S.sub[id]; save(); }
    /* ---------- v2: サブグループ ----------
       S.subs[親のキー] = [{ key: 's:…', label }]（親はグループでもサブグループでもよい＝何段でも）
       S.sub[本の id] = サブグループのキー。グループごとに別々の分け方ができる（一律ではない） */
    const parentOf = (key) => { for (const p in S.subs) if ((S.subs[p] || []).some((x) => x.key === key)) return p; return null; };
    const rootOf = (key) => { let k = key, g = 0; while (k && k.startsWith('s:') && g++ < 30) k = parentOf(k); return k; };
    const subOf = (id) => S.sub[id] || null;
    function newSub(parent, name) {
      const key = 's:' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      (S.subs[parent] = S.subs[parent] || []).push({ key, label: name });
      S.groups[key] = { label: name };
      save();
      return key;
    }
    function removeSub(key) {
      const par = parentOf(key);
      const kill = (k) => { (S.subs[k] || []).forEach((x) => kill(x.key)); delete S.subs[k]; delete S.groups[k]; Object.keys(S.sub).forEach((id) => { if (S.sub[id] === k) { if (par && par.startsWith('s:')) S.sub[id] = par; else delete S.sub[id]; } }); };
      if (par) S.subs[par] = (S.subs[par] || []).filter((x) => x.key !== key);
      kill(key);
      save();
    }
    function assignSub(id, key) { if (key) S.sub[id] = key; else delete S.sub[id]; save(); }
    function assignSubMany(ids, key) { ids.forEach((id) => { if (key) S.sub[id] = key; else delete S.sub[id]; }); save(); }
    const subTree = (parent, depth) => (S.subs[parent] || []).map((x) => ({ key: x.key, label: label(x.key, x.label), icon: icon(x.key, ''), depth: depth || 1, children: subTree(x.key, (depth || 1) + 1) }));
    const flatTree = (t, out) => { out = out || []; for (const n of t) { out.push(n); flatTree(n.children, out); } return out; };
    function moveSub(key, dir) {
      const par = parentOf(key); if (!par) return;
      const L = S.subs[par], i = L.findIndex((x) => x.key === key), j = i + dir;
      if (i < 0 || j < 0 || j >= L.length) return;
      [L[i], L[j]] = [L[j], L[i]]; save();
    }
    const customLabel = (key) => { const c = S.custom.find((x) => x.key === key); return c ? label(key, c.label) : null; };
    /* 本を移した先に合わせて、セクションの並びを組み直す（sections: [{name, icon, sid, standalone, items:[{id,…}]}]）
       見出しの題名・アイコンの差し替えもここで（sec.key・sec.label・sec.icon を付ける） */
    function regroup(sections, standaloneName) {
      const out = sections.map((s) => Object.assign({}, s, { items: s.items.slice() }));
      out.forEach((s) => { s.key = keyOf(s); });
      const byKey = new Map(out.map((s) => [s.key, s]));
      for (const s of out) {
        for (const it of s.items.slice()) {
          const to = assigned(it.id);
          if (!to || to === s.key) continue;
          let dst = byKey.get(to);
          if (!dst) {
            const cl = customLabel(to);
            if (to === '__standalone__') dst = { name: standaloneName, icon: '', sid: '', standalone: true, items: [], key: to };
            else if (cl) dst = { name: cl, icon: '', sid: '', items: [], key: to, custom: true };
            else continue;   // 移した先のシリーズがこの一覧に無い時は動かさない
            byKey.set(to, dst);
            const si = out.findIndex((x) => x.standalone);
            if (si >= 0 && !dst.standalone) out.splice(si, 0, dst); else out.push(dst);
          }
          s.items.splice(s.items.indexOf(it), 1);
          dst.items.push(it);
        }
      }
      const res = out.filter((s) => s.items.length);
      for (const s of res) { s.label = label(s.key, s.name); s.icon = icon(s.key, s.icon || ''); }
      /* v2: サブグループに分ける（s.direct = どのサブグループにも入っていない本、s.subs = 木。空の枝は出さない） */
      for (const s of res) {
        const map = new Map();
        const build = (parent, depth) => (S.subs[parent] || []).map((x) => { const n = { key: x.key, name: x.label, label: label(x.key, x.label), icon: icon(x.key, ''), depth, items: [], subs: null }; map.set(x.key, n); n.subs = build(x.key, depth + 1); return n; });
        const tree = build(s.key, 1);
        s.direct = [];
        for (const it of s.items) { const n = map.get(S.sub[it.id]); if (n) n.items.push(it); else s.direct.push(it); }
        const prune = (L) => L.filter((n) => { n.subs = prune(n.subs); n.count = n.items.length + n.subs.reduce((a, c) => a + c.count, 0); return n.count > 0; });
        s.subs = prune(tree);
      }
      return res;
    }

    /* ---------- 編集パネル ---------- */
    const CSS_ID = 'cordi-groups-css';
    function css() {
      if (document.getElementById(CSS_ID)) return;
      const st = document.createElement('style');
      st.id = CSS_ID;
      st.textContent = `
.cg-pop{position:fixed;z-index:2147483602;width:300px;box-sizing:border-box;padding:12px;border-radius:12px;background:var(--c-bgPri,#fff);color:var(--c-texPri,#37352f);box-shadow:0 0 0 .5px rgba(15,15,15,.12),0 4px 12px rgba(15,15,15,.08),0 16px 40px rgba(15,15,15,.16);font:12px/1.45 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Segoe UI",sans-serif}
.cg-pop *{box-sizing:border-box}
.cg-pop .cg-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.cg-pop .cg-prev{flex:none;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--c-bacHov,rgba(55,53,47,.06));font-size:22px;line-height:1}
.cg-pop .cg-prev img{width:26px;height:26px;object-fit:contain}
.cg-pop .cg-name{flex:1;min-width:0;height:32px;padding:0 10px;border-radius:8px;border:0;outline:0;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:600 14px/1 "Baskerville","Hiragino Mincho ProN",serif}
.cg-pop .cg-name:focus{box-shadow:0 0 0 2px rgba(35,131,226,.45)}
.cg-pop .cg-tabs{display:flex;gap:2px;padding:2px;border-radius:8px;background:var(--c-bacHov,rgba(55,53,47,.06));margin-bottom:8px}
.cg-pop .cg-tabs button{flex:1;height:24px;border:0;border-radius:6px;background:none;color:var(--c-texSec,#787774);font:500 11px/1 inherit;cursor:pointer}
.cg-pop .cg-tabs button[data-on="1"]{background:var(--c-bgPri,#fff);color:inherit;box-shadow:0 1px 2px rgba(0,0,0,.1)}
.cg-pop .cg-pane{min-height:150px}
.cg-pop .cg-q,.cg-pop .cg-txt,.cg-pop .cg-url{width:100%;border:0;outline:0;border-radius:6px;padding:6px 8px;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:12px/1.4 inherit}
.cg-pop .cg-url{height:96px;resize:none;font-family:ui-monospace,Menlo,monospace;font-size:11px}
.cg-pop .cg-txt{font-size:20px;text-align:center;height:44px}
.cg-pop .cg-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;max-height:150px;overflow:auto;margin-top:6px}
.cg-pop .cg-grid button{aspect-ratio:1;border:0;border-radius:6px;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center}
.cg-pop .cg-grid button:hover{background:var(--c-bacHov,rgba(55,53,47,.08))}
.cg-pop .cg-grid img{width:20px;height:20px}
.cg-pop .cg-sw{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}
.cg-pop .cg-sw button{width:18px;height:18px;border-radius:5px;border:0;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.cg-pop .cg-sw button[data-on="1"]{box-shadow:0 0 0 2px var(--c-bgPri,#fff),0 0 0 3.5px #2383e2}
.cg-pop .cg-mut{color:var(--c-texSec,#787774);font-size:11px;margin-top:6px}
.cg-pop .cg-foot{display:flex;align-items:center;gap:6px;margin-top:12px;padding-top:10px;border-top:1px solid var(--c-borPri,rgba(55,53,47,.1))}
.cg-pop .cg-grow{flex:1}
.cg-pop .cg-btn{white-space:nowrap;flex:none;height:26px;padding:0 10px;border:0;border-radius:6px;background:var(--c-bacHov,rgba(55,53,47,.06));color:inherit;font:500 11.5px/1 inherit;cursor:pointer}
.cg-pop .cg-ok{background:#2383e2;color:#fff}
.cg-pop .cg-del{background:none;color:#d44c47}
.cg-pop .cg-list{display:flex;flex-direction:column;gap:1px;max-height:260px;overflow:auto}
.cg-pop .cg-list button{display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border:0;border-radius:6px;background:none;color:inherit;font:inherit;text-align:start;cursor:pointer}
.cg-pop .cg-list button:hover{background:var(--c-bacHov,rgba(55,53,47,.08))}
.cg-pop .cg-list button[data-cur="1"]{font-weight:600}
.cg-pop .cg-list .cg-li{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:14px}
.cg-pop .cg-list .cg-li img{width:18px;height:18px;object-fit:contain}
.cg-pop .cg-h{font-size:11px;color:var(--c-texSec,#787774);margin:0 0 6px 2px}
`;
      (document.head || document.documentElement).appendChild(st);
    }
    const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const isUrl = (s) => /^(https?:|data:|\/)/.test(String(s || ''));
    const iconHtml = (s) => (!s ? '' : isUrl(s) ? '<img alt="" src="' + esc(s) + '">' : esc(s));
    function svgUrl(v) {
      v = String(v || '').trim();
      if (/^<svg[\s>]/i.test(v)) { if (!/xmlns=/.test(v)) v = v.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"'); return 'data:image/svg+xml,' + encodeURIComponent(v); }
      return isUrl(v) ? v : '';
    }
    let pop = null;
    function closePop() { if (pop) { pop.remove(); pop = null; } document.removeEventListener('pointerdown', outside, true); }
    function outside(e) { if (pop && !pop.contains(e.target)) closePop(); }
    function mount(el, anchor) {
      css(); closePop();
      pop = el;
      el.className = 'cg-pop';
      el.setAttribute('data-no-passthrough', '1');
      el.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); closePop(); } });
      for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) el.addEventListener(t, (e) => e.stopPropagation());
      document.body.appendChild(el);
      const r = anchor ? anchor.getBoundingClientRect() : { left: innerWidth / 2 - 150, bottom: 120 };
      const h = el.offsetHeight || 360;
      el.style.left = Math.max(8, Math.min(r.left, innerWidth - 308)) + 'px';
      el.style.top = Math.max(8, Math.min(r.bottom + 6, innerHeight - h - 8)) + 'px';
      setTimeout(() => document.addEventListener('pointerdown', outside, true), 0);
    }
    const LIBC = [['auto', '#37352F'], ['gray', '#9B9A97'], ['brown', '#64473A'], ['orange', '#D9730D'], ['yellow', '#DFAB01'], ['green', '#0F7B6C'], ['blue', '#0B6E99'], ['purple', '#6940A5'], ['pink', '#AD1A72'], ['red', '#E03E3E']];
    /* 見出しの編集: { key, name（元の題名）, icon（元のアイコン）, anchor } */
    function openEditor(o) {
      const m = meta(o.key);
      const cur = { label: m.label || '', icon: m.icon };
      const shownIcon = () => (cur.icon !== undefined ? cur.icon : icon(o.key, o.icon || ''));
      const el = document.createElement('div');
      const isCustom = o.key.startsWith('c:') || o.key.startsWith('s:');
      el.innerHTML =
        '<div class="cg-top"><span class="cg-prev"></span><input class="cg-name" spellcheck="false" placeholder="' + esc(o.name) + '"></div>' +
        '<div class="cg-tabs"><button data-tab="lib">²⁹ ライブラリ</button><button data-tab="txt">絵文字・文字</button><button data-tab="url">SVG・画像</button></div>' +
        '<div class="cg-pane"></div>' +
        '<div class="cg-foot">' + (isCustom ? '<button class="cg-btn cg-del" data-a="del">グループを削除</button>' : '<button class="cg-btn" data-a="reset" title="題名とアイコンを Notion のものに戻す">元に戻す</button>') +
        '<button class="cg-btn" data-a="noicon">アイコンなし</button><span class="cg-grow"></span><button class="cg-btn" data-a="cancel">やめる</button><button class="cg-btn cg-ok" data-a="ok">完了</button></div>';
      const prev = el.querySelector('.cg-prev'), name = el.querySelector('.cg-name'), pane = el.querySelector('.cg-pane');
      name.value = cur.label || o.name;
      const sync = () => { prev.innerHTML = iconHtml(shownIcon()); };
      let libColor = 'auto';
      function tab(t) {
        el.querySelectorAll('.cg-tabs button').forEach((b) => b.setAttribute('data-on', b.dataset.tab === t ? '1' : '0'));
        if (t === 'lib') {
          pane.innerHTML = '<input class="cg-q" placeholder="英語の名前で探す（例: flask, book, star）" spellcheck="false"><div class="cg-sw">' + LIBC.map(([c, h]) => '<button data-c="' + c + '" style="background:' + h + '"' + (c === libColor ? ' data-on="1"' : '') + ' title="' + c + '"></button>').join('') + '</div><div class="cg-grid"></div><div class="cg-mut"></div>';
          lib('');
        } else if (t === 'txt') {
          pane.innerHTML = '<input class="cg-txt" maxlength="4" placeholder="📚"><div class="cg-mut">絵文字か 1〜2 文字</div>';
          const v = shownIcon(); pane.querySelector('.cg-txt').value = v && !isUrl(v) ? v : '';
        } else {
          pane.innerHTML = '<textarea class="cg-url" placeholder="<svg …>…</svg>／https://…／data:image/…" spellcheck="false"></textarea><div class="cg-mut">SVG はそのままの色で出ます</div>';
        }
      }
      function lib(q) {
        const grid = pane.querySelector('.cg-grid'), mut = pane.querySelector('.cg-mut');
        const L = window.__c29;
        if (!L || typeof L.ids !== 'function') { grid.innerHTML = ''; mut.textContent = '²⁹ Icon Library が動いていません（SVG・画像のタブで貼れます）'; return; }
        const k = q.trim().toLowerCase();
        let ids = []; try { ids = L.ids(); } catch (e) { /* noop */ }
        const hit = (k ? ids.filter((id) => id.toLowerCase().includes(k)) : ids).slice(0, 160);
        grid.innerHTML = hit.map((id) => { let u = ''; try { u = L.url(id, { color: libColor }); } catch (e) { /* noop */ } return u ? '<button data-ico="' + esc(id) + '" title="' + esc(id) + '"><img alt="" src="' + esc(u) + '"></button>' : ''; }).join('');
        mut.textContent = hit.length ? hit.length + ' 個' : '見つかりませんでした';
      }
      el.addEventListener('input', (e) => {
        const t = e.target;
        if (t === name) cur.label = t.value.trim() === o.name ? '' : t.value.trim();
        else if (t.matches('.cg-q')) lib(t.value);
        else if (t.matches('.cg-txt')) { cur.icon = t.value.trim() || undefined; sync(); }
        else if (t.matches('.cg-url')) { const u = svgUrl(t.value); if (u) { cur.icon = u; sync(); } }
      });
      el.addEventListener('click', (e) => {
        const t = e.target;
        const tb = t.closest('[data-tab]'); if (tb) return tab(tb.dataset.tab);
        const sw = t.closest('[data-c]'); if (sw) { libColor = sw.dataset.c; pane.querySelectorAll('.cg-sw button').forEach((b) => b.setAttribute('data-on', b === sw ? '1' : '0')); return lib((pane.querySelector('.cg-q') || {}).value || ''); }
        const ic = t.closest('[data-ico]'); if (ic) { try { cur.icon = window.__c29.url(ic.dataset.ico, { color: libColor }); } catch (err) { /* noop */ } return sync(); }
        const a = t.closest('[data-a]'); if (!a) return;
        const act = a.dataset.a;
        if (act === 'cancel') return closePop();
        if (act === 'noicon') { cur.icon = ''; return sync(); }
        if (act === 'reset') { delete S.groups[o.key]; save(); return closePop(); }
        if (act === 'del') { if (confirm('「' + (cur.label || o.name) + '」を削除します（中の本は元のグループへ戻ります）')) { if (o.key.startsWith('s:')) removeSub(o.key); else removeGroup(o.key); closePop(); } return; }
        if (act === 'ok') commit();
      });
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === name) { e.preventDefault(); commit(); } });
      function commit() {
        const patch = { label: cur.label || null };
        if (cur.icon !== undefined) patch.icon = cur.icon;
        setMeta(o.key, patch);
        closePop();
      }
      mount(el, o.anchor);
      tab('lib'); sync();
      name.focus(); name.select();
    }
    /* 本の行き先: { id, title, sections: [{key, label, icon}], anchor } */
    function openMover(o) {
      const el = document.createElement('div');
      const cur = assigned(o.id);
      const keys = new Set(o.sections.map((s) => s.key));
      const extra = S.custom.filter((c) => !keys.has(c.key)).map((c) => ({ key: c.key, label: label(c.key, c.label), icon: icon(c.key, '') }));
      if (!keys.has('__standalone__')) extra.push({ key: '__standalone__', label: label('__standalone__', '単行'), icon: icon('__standalone__', '') });
      const row = (s) => '<button data-k="' + esc(s.key) + '"' + (s.key === cur ? ' data-cur="1"' : '') + '><span class="cg-li">' + iconHtml(s.icon) + '</span>' + esc(s.label) + '</button>';
      /* v2: いまのグループの中のサブグループ（何段でも・字下げで表す） */
      const g = o.group || '';
      const csub = subOf(o.id);
      const fl = g ? flatTree(subTree(g)) : [];
      const srow = (n) => '<button data-s="' + esc(n.key) + '"' + (n.key === csub ? ' data-cur="1"' : '') + ' style="padding-inline-start:' + (8 + n.depth * 14) + 'px"><span class="cg-li">' + (n.icon ? iconHtml(n.icon) : '└') + '</span>' + esc(n.label) + '</button>';
      const gl = g ? label(g, o.groupName || '') : '';
      const subHtml = g ? '<div class="cg-h" style="margin-top:10px">「' + esc(gl) + '」の中のサブグループ</div><div class="cg-list">' + fl.map(srow).join('') +
        '<button data-a="newsub"><span class="cg-li">＋</span>新しいサブグループ…' + (csub ? '（「' + esc(label(csub, '')) + '」の中にも作れます）' : '') + '</button>' +
        (csub ? '<button data-a="clearsub"><span class="cg-li">↺</span>サブグループから外す</button>' : '') + '</div>' : '';
      el.innerHTML = '<div class="cg-h"></div><div class="cg-list">' + o.sections.concat(extra).map(row).join('') +
        '<button data-a="new"><span class="cg-li">＋</span>新しいグループ…</button>' + (cur ? '<button data-a="clear"><span class="cg-li">↺</span>元のグループに戻す</button>' : '') + '</div>' + subHtml;
      el.querySelector('.cg-h').textContent = '「' + o.title + '」を移す';
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.k) { assign(o.id, b.dataset.k); return closePop(); }
        if (b.dataset.a === 'clear') { assign(o.id, null); return closePop(); }
        if (b.dataset.a === 'new') { const nm = prompt('新しいグループの名前', ''); if (nm && nm.trim()) { assign(o.id, newGroup(nm.trim())); } closePop(); }
        if (b.dataset.s) { assignSub(o.id, b.dataset.s); return closePop(); }
        if (b.dataset.a === 'clearsub') { assignSub(o.id, null); return closePop(); }
        if (b.dataset.a === 'newsub') {
          let par = g;
          if (csub && confirm('「' + label(csub, '') + '」の中に作りますか？\n（キャンセル＝「' + gl + '」の直下に作る）')) par = csub;
          const nm = prompt('新しいサブグループの名前（例: アクション）', ''); if (nm && nm.trim()) assignSub(o.id, newSub(par, nm.trim()));
          closePop();
        }
      });
      mount(el, o.anchor);
    }
    /* v2: 見出しを右クリック → このグループ（サブグループ）の中の分け方を決める
       { key, name, items: [{id, title}], anchor }：名前を付けて、入れる本にチェック */
    function openSubMenu(o) {
      const el = document.createElement('div');
      const kids = subTree(o.key);
      const fl = flatTree(kids);
      const lbl = label(o.key, o.name || '');
      const row = (n) => '<div style="display:flex;align-items:center;gap:2px"><button data-ed="' + esc(n.key) + '" style="flex:1;padding-inline-start:' + (8 + (n.depth - 1) * 14) + 'px"><span class="cg-li">' + (n.icon ? iconHtml(n.icon) : '└') + '</span>' + esc(n.label) + '</button>' +
        '<button data-up="' + esc(n.key) + '" title="上へ" style="width:24px;justify-content:center;padding:0">↑</button><button data-dn="' + esc(n.key) + '" title="下へ" style="width:24px;justify-content:center;padding:0">↓</button></div>';
      el.innerHTML = '<div class="cg-h">「' + esc(lbl) + '」のサブグループ</div><div class="cg-list">' + (fl.length ? fl.map(row).join('') : '<div class="cg-mut" style="margin:0 2px 6px">まだありません。グループの中を、好きな名前で分けられます（例: 学園 → アクション）</div>') + '</div>' +
        '<div class="cg-h" style="margin-top:10px">新しいサブグループ</div><input class="cg-q cg-sn" placeholder="名前（例: アクション）" spellcheck="false">' +
        (fl.length ? '<select class="cg-q cg-sp" style="margin-top:6px"><option value="">「' + esc(lbl) + '」の直下に作る</option>' + fl.map((n) => '<option value="' + esc(n.key) + '">' + '　'.repeat(n.depth) + esc(n.label) + ' の中に作る</option>').join('') + '</select>' : '') +
        '<div class="cg-mut">入れる本</div><div class="cg-list cg-pick" style="max-height:180px">' + (o.items || []).map((it) => '<label style="display:flex;align-items:center;gap:8px;height:26px;padding:0 8px;border-radius:6px;cursor:pointer"><input type="checkbox" value="' + esc(it.id) + '">' + esc(it.title || '（無題）') + '</label>').join('') + '</div>' +
        '<div class="cg-foot"><span class="cg-mut" style="margin:0;font-size:10.5px">本の右クリックでも入れられます</span><span class="cg-grow"></span><button class="cg-btn" data-a="cancel">閉じる</button><button class="cg-btn cg-ok" data-a="mk">作る</button></div>';
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.ed) { const n = fl.find((x) => x.key === b.dataset.ed); closePop(); return openEditor({ key: n.key, name: n.label, icon: '', anchor: o.anchor }); }
        if (b.dataset.up || b.dataset.dn) { moveSub(b.dataset.up || b.dataset.dn, b.dataset.up ? -1 : 1); closePop(); return openSubMenu(o); }
        if (b.dataset.a === 'cancel') return closePop();
        if (b.dataset.a === 'mk') {
          const nm = el.querySelector('.cg-sn').value.trim();
          if (!nm) { el.querySelector('.cg-sn').focus(); return; }
          const sp = el.querySelector('.cg-sp');
          const key = newSub(sp && sp.value ? sp.value : o.key, nm);
          const ids = [...el.querySelectorAll('.cg-pick input:checked')].map((x) => x.value);
          if (ids.length) assignSubMany(ids, key);
          closePop();
        }
      });
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('.cg-sn')) { e.preventDefault(); el.querySelector('[data-a="mk"]').click(); } });
      mount(el, o.anchor);
      setTimeout(() => { const i = el.querySelector('.cg-sn'); if (i) i.focus(); }, 0);
    }
    const api = { v: CGV, parentOf, rootOf, subOf, newSub, removeSub, assignSub, assignSubMany, subTree, moveSub, openSubMenu, keyOf, meta, label, icon, setMeta, newGroup, removeGroup, assign, assigned, regroup, openEditor, openMover, closePop, on: (fn) => window.addEventListener(EVT, fn), STANDALONE_ICON, dump: () => JSON.parse(JSON.stringify(S)) };
    window.__cordiGroups = api;
    return api;
  })();


  /* ============================================================
   *  見せ方（パネルで変えられる値）
   * ============================================================ */
  const DEFAULTS = {
    LAYOUT: 'grid',          // grid = 幅から列数を自動 / list = 1列 / flow = 流し込み
    FONT_MODE: 'serif',      // serif = ¹⁴ と同じ明朝 / notion = Notion の書体
    FONT_SIZE: 11,           // px
    LINE_HEIGHT: 3.25,
    ICON_SIZE: 20,           // px
    ICON_GAP: 10,            // px
    MIN_COL: 140,            // px（grid の1列の最小幅。狭い幅では自動で1列になる）
    ROW_GAP: 3,              // px
    COL_GAP: 14,             // px
    TITLE_WRAP: true,        // 長い題名を折り返す（false = 1行で省略）
    SHORTEN: true,           // 見出しの中で全員に共通する頭を「…」に縮める
    SHORTEN_MIN: 8,          // 共通の頭がこの文字数以上の時だけ縮める
    ONE_COL_LEN: 16,         // グループの一番長い題名がこの長さ以上なら、そのグループは1列（全角1・半角0.5。0 = 無効）
    SEC_HEADS: true,         // シリーズの見出し
    SEC_HEAD_SIZE: 13,       // px
    SEC_ICON_SIZE: 0,        // px（見出しのアイコン。0 = 見出しの文字の大きさ＋3px の自動）
    SEC_ICON_GAP: 10,        // px（見出しのアイコンと文字の間）
    SEC_COUNT: true,         // 見出しに件数
    SEC_GAP: 20,             // px（グループとグループの間）
    RULE_WIDTH: 100,         // %（見出しの下の区切り線の長さ。区画の幅に対する割合）
    RULE_THICK: 1,           // px（区切り線の太さ。0 で線なし）
    RULE_ALPHA: 28,          // %（区切り線の濃さ。文字色を何%混ぜるか。16 ≒ Notion の区切り線）
    RULE_GAP: 6,             // px（区切り線と本の一覧の間）
    RULE_PAD: 3,             // px（見出しの文字と区切り線の間）
    RULE_STYLE: 'dotted',    // 区切り線: dotted = 点線 / dashed = 破線 / solid = 実線
    HIDE_UNTITLED: true      // 題名の無いページを出さない
  };
  const RANGES = {
    FONT_SIZE: [9, 20], LINE_HEIGHT: [1.1, 4], ICON_SIZE: [10, 32], ICON_GAP: [0, 24],
    MIN_COL: [80, 360], ROW_GAP: [0, 20], COL_GAP: [0, 40], SHORTEN_MIN: [3, 30], ONE_COL_LEN: [0, 60],
    SEC_HEAD_SIZE: [8, 18], SEC_GAP: [0, 80], SEC_ICON_SIZE: [0, 40], SEC_ICON_GAP: [0, 20],
    RULE_WIDTH: [5, 100], RULE_THICK: [0, 4], RULE_ALPHA: [0, 100], RULE_GAP: [0, 30], RULE_PAD: [0, 16]
  };
  /* 見せ方以外の設定（コンソールの __c23.set で変更可） */
  const CONFIG = {
    SERIES_PROP_NAME: 'Series',
    STANDALONE_LABEL: '単行',
    SERIF_FAMILY: '"Cordivestium Group Header", "Baskerville", "Hiragino Mincho ProN", "Yu Mincho", serif',
    FADE_MS: 160,
    API_BATCH: 50,
    MODEL_MAX: 80            // 記憶する区画の数
  };

  const LS_TUNE = 'c23-tuning-v1';
  const LS_FOLD = 'c23-fold-v1';
  const LS_OFF = 'c23-off-props-v1';
  const LS_MODEL = 'c23-model-v1';

  const T = { ...DEFAULTS };
  const readLS = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* noop */ } };
  (function loadTune() {
    const o = readLS(LS_TUNE, null);
    if (!o || typeof o !== 'object') return;
    for (const k of Object.keys(DEFAULTS)) if (k in o) T[k] = sanitize(k, o[k]);
  })();
  function sanitize(k, v) {
    const d = DEFAULTS[k];
    if (typeof d === 'boolean') return !!v;
    if (typeof d === 'number') {
      const n = Number(v);
      if (!isFinite(n)) return d;
      const r = RANGES[k];
      return r ? Math.min(r[1], Math.max(r[0], n)) : n;
    }
    if (k === 'LAYOUT') return ['grid', 'list', 'flow'].includes(v) ? v : d;
    if (k === 'FONT_MODE') return ['serif', 'notion'].includes(v) ? v : d;
    if (k === 'RULE_STYLE') return ['dotted', 'dashed', 'solid'].includes(v) ? v : d;
    return v;
  }
  let FOLD = readLS(LS_FOLD, {});
  if (!FOLD || typeof FOLD !== 'object') FOLD = {};
  let OFF = readLS(LS_OFF, []);
  if (!Array.isArray(OFF)) OFF = [];
  let MODELS = readLS(LS_MODEL, {});
  if (!MODELS || typeof MODELS !== 'object') MODELS = {};

  let saveModelT = 0;
  function saveModelsSoon() {
    if (saveModelT) return;
    saveModelT = setTimeout(() => {
      saveModelT = 0;
      const keys = Object.keys(MODELS).sort((a, b) => (MODELS[a].at || 0) - (MODELS[b].at || 0));
      while (keys.length > CONFIG.MODEL_MAX) delete MODELS[keys.shift()];
      writeLS(LS_MODEL, MODELS);
    }, 800);
  }

  /* ============================================================
   *  API（¹⁴ と同じ経路）
   * ============================================================ */
  async function apiFetch(requests) {
    const res = await fetch(location.origin + '/api/v3/syncRecordValues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ requests })
    });
    if (!res.ok) throw new Error('API HTTP ' + res.status);
    return res.json();
  }
  function extractNode(j, table, id) {
    const node = j && j.recordMap && j.recordMap[table] && j.recordMap[table][id];
    if (!node) return null;
    return node.value && node.value.value ? node.value.value : (node.value || null);
  }
  async function fetchOne(table, id) {
    const j = await apiFetch([{ table, id, version: -1 }]);
    return extractNode(j, table, id);
  }
  async function fetchBlocks(ids) {
    const map = new Map();
    for (let i = 0; i < ids.length; i += CONFIG.API_BATCH) {
      const slice = ids.slice(i, i + CONFIG.API_BATCH);
      const j = await apiFetch(slice.map((id) => ({ table: 'block', id, version: -1 })));
      for (const id of slice) { const v = extractNode(j, 'block', id); if (v) map.set(id, v); }
    }
    return map;
  }
  const colCache = new Map();
  async function fetchCollection(id) {
    if (colCache.has(id)) return colCache.get(id);
    const c = await fetchOne('collection', id);
    colCache.set(id, c);
    return c;
  }
  function parseRelIds(v) {
    const out = [];
    if (!Array.isArray(v)) return out;
    for (const seg of v) {
      if (Array.isArray(seg) && seg[0] === '‣' && Array.isArray(seg[1]) && seg[1][0] && seg[1][0][1]) out.push(seg[1][0][1]);
    }
    return out;
  }
  function textOf(v) {
    if (!Array.isArray(v)) return '';
    return v.map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' && seg[0] !== '‣' ? seg[0] : '')).join('').trim();
  }
  const recTitle = (rec) => textOf(rec && rec.properties && rec.properties.title) || null;
  function seriesOf(v) {
    if (!Array.isArray(v)) return null;
    const ids = parseRelIds(v);
    if (ids.length) return { kind: 'page', raw: ids[0] };
    const t = v.map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' && seg[0] !== '‣' && seg[0] !== ',' ? seg[0] : '')).join('').trim();
    return t ? { kind: 'text', raw: t } : null;
  }
  const schemaName = (s) => String((s && s.name) || '').trim();

  /* page_icon → 表示の種類（¹⁴ v0.47.0 と同じ扱い） */
  function resolveIcon(v, id) {
    const s = String(v || '').trim();
    if (!s) return null;
    if (/^(https?:|data:|\/)/.test(s)) return { src: s };
    if (/^attachment:/i.test(s)) return { src: '/image/' + encodeURIComponent(s) + '?table=block&id=' + encodeURIComponent(id || '') + '&cache=v2' };
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return null;
    return { emoji: s };
  }

  /* ページ × プロパティ名 → 並べる中身 */
  async function buildModel(pageId, propName) {
    const page = await fetchOne('block', pageId);
    if (!page) throw new Error('ページが取れません');
    let key = null;
    if (page.parent_table === 'collection' && page.parent_id) {
      const col = await fetchCollection(page.parent_id);
      const schema = (col && col.schema) || {};
      for (const [k, s] of Object.entries(schema)) {
        if (s && s.type === 'relation' && schemaName(s) === propName) { key = k; break; }
      }
    }
    if (!key) throw new Error('プロパティ「' + propName + '」が見つかりません');
    const ids = Array.from(new Set(parseRelIds((page.properties || {})[key])));
    const recs = ids.length ? await fetchBlocks(ids) : new Map();

    /* 関係先DBのシリーズ */
    let sKey = null;
    const parent = (() => { for (const id of ids) { const r = recs.get(id); if (r && r.parent_table === 'collection') return r.parent_id; } return null; })();
    if (parent) {
      const col = await fetchCollection(parent);
      const schema = (col && col.schema) || {};
      for (const [k, s] of Object.entries(schema)) {
        if (s && s.type !== 'title' && schemaName(s) === CONFIG.SERIES_PROP_NAME) { sKey = k; break; }
      }
    }
    const refs = new Map();
    const sPages = [];
    if (sKey) {
      for (const id of ids) {
        const r = recs.get(id);
        const ref = r && r.properties ? seriesOf(r.properties[sKey]) : null;
        if (ref) { refs.set(id, ref); if (ref.kind === 'page') sPages.push(ref.raw); }
      }
    }
    const sRecs = sPages.length ? await fetchBlocks(Array.from(new Set(sPages))) : new Map();

    const sections = [];
    const byName = new Map();
    let standalone = null;
    for (const id of ids) {
      const r = recs.get(id);
      if (!r || r.alive === false) continue;
      const title = recTitle(r);
      if (!title && T.HIDE_UNTITLED) continue;
      const item = { id, title: title || 'New page', icon: (r.format && r.format.page_icon) || '' };
      const ref = refs.get(id);
      let name = null, icon = '', sid = '';
      if (ref && ref.kind === 'page') {
        const sr = sRecs.get(ref.raw);
        name = sr ? recTitle(sr) : null;
        icon = (sr && sr.format && sr.format.page_icon) || '';
        sid = ref.raw;
      } else if (ref && ref.kind === 'text') name = ref.raw;
      if (!name) {
        if (!standalone) standalone = { name: CONFIG.STANDALONE_LABEL, icon: '', sid: '', items: [], standalone: true };
        standalone.items.push(item);
        continue;
      }
      let sec = byName.get(name);
      if (!sec) { sec = { name, icon, sid, items: [] }; byName.set(name, sec); sections.push(sec); }
      sec.items.push(item);
    }
    if (standalone) sections.push(standalone);
    return { v: 1, at: Date.now(), total: sections.reduce((n, s) => n + s.items.length, 0), sections };
  }

  /* ============================================================
   *  区画を見つける（構造だけ・レイアウトは読まない）
   * ============================================================ */
  const ROW_SEL = '[aria-label="Editable title"]';
  const EXCLUDE = '.notion-table-view, .notion-board-view, .notion-gallery-view, .notion-list-view, .notion-timeline-view, .notion-calendar-view, .notion-sidebar-container';
  function sectionOf(menu) {
    if (!menu.querySelector(ROW_SEL)) return null;
    if (menu.closest(EXCLUDE)) return null;
    let sec = menu.parentElement;
    for (let i = 0; sec && i < 4; i++, sec = sec.parentElement) {
      const cell = sec.querySelector('[role="cell"][aria-haspopup="dialog"]');
      if (cell && !menu.contains(cell)) {
        const nameEl = cell.querySelector('div[style*="text-overflow"]');
        const propName = nameEl ? String(nameEl.textContent || '').trim() : '';
        const blk = sec.closest('[data-block-id]');
        const pageId = blk ? blk.getAttribute('data-block-id') : '';
        if (!propName || !pageId) return null;
        return { sec, menu, propName, pageId, key: pageId + '|' + propName };
      }
    }
    return null;
  }
  function nativeSig(menu) {
    const titles = Array.from(menu.querySelectorAll(ROW_SEL + ' .notranslate')).map((n) => String(n.textContent || '').trim());
    const more = menu.nextElementSibling;
    const m = more && /(\d+)\s*more/i.exec(String(more.textContent || ''));
    return (m ? m[1] : '0') + '#' + titles.join('|');
  }

  /* ============================================================
   *  描画
   * ============================================================ */
  const hexOf = (id) => String(id || '').replace(/-/g, '');
  const pageUrl = (id) => (location.hostname === 'app.notion.com' ? location.origin + '/p/' : location.origin + '/') + hexOf(id);

  /* 表示上の長さ（全角1・半角0.5） */
  function textLen(t) {
    let n = 0;
    for (const ch of String(t || '')) n += /[\u0000-\u00ff\uff61-\uff9f]/.test(ch) ? 0.5 : 1;
    return n;
  }
  function shortenFor(items) {
    if (!T.SHORTEN || items.length < 2) return 0;
    let p = items[0].title;
    for (const it of items) {
      let i = 0;
      while (i < p.length && i < it.title.length && p[i] === it.title[i]) i++;
      p = p.slice(0, i);
      if (!p) return 0;
    }
    /* 全員が同じ題名・または残りが空になる項目がある時は縮めない */
    if (items.some((it) => it.title.length <= p.length)) return 0;
    /* 区切り（空白・中黒・ダッシュ・括弧など）の直後で切る。無ければそのまま */
    const m = /[\s　・:：\-–—(（「『]/;
    let cut = p.length;
    for (let i = p.length - 1; i >= 0; i--) { if (m.test(p[i])) { cut = i + 1; break; } }
    if (cut < T.SHORTEN_MIN) return 0;
    return cut;
  }

  function iconNode(icon, id, cls) {
    const r = resolveIcon(icon, id);
    const box = document.createElement('span');
    box.className = cls;
    if (r && r.src) {
      const img = document.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.referrerPolicy = 'same-origin';
      img.src = r.src;
      box.appendChild(img);
    } else if (r && r.emoji) {
      const e = document.createElement('span');
      e.className = 'c23-emo';
      e.textContent = r.emoji;
      box.appendChild(e);
    }
    return box;
  }

  function openItem(e, id) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // 別タブ等は <a> の既定動作
    e.preventDefault();
    e.stopPropagation();
    try {
      const u = new URL(location.href);
      u.searchParams.set('p', hexOf(id));
      u.searchParams.set('pm', 's');
      history.pushState(history.state, '', u.pathname + u.search);
      window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
    } catch (err) {
      location.href = pageUrl(id);
    }
  }

  function render(info, model, quiet) {
    const box = document.createElement('div');
    box.className = 'c23';
    box.setAttribute('data-c23-key', info.key);
    box.setAttribute('data-layout', T.LAYOUT);
    box.setAttribute('data-wrap', T.TITLE_WRAP ? '1' : '0');
    if (quiet) box.setAttribute('data-quiet', '1');

    const gear = document.createElement('button');
    gear.type = 'button';
    gear.className = 'c23-gear';
    gear.title = '見せ方の編集（' + info.propName + '）';
    gear.textContent = '⚙';
    box.appendChild(gear);
    box.__c23info = info;

    /* v2.8.0: 本の移動・見出しの題名とアイコンの差し替え（¹⁴ と共通の設定）。単行だけでも見出しを出す */
    const sections = CG.regroup(model.sections.map((x) => Object.assign({}, x, { iconOrig: x.icon || '' })), CONFIG.STANDALONE_LABEL);
    const showHeads = T.SEC_HEADS;
    for (const s of sections) {
      const sec = document.createElement('div');
      sec.className = 'c23-sec';
      const foldKey = info.propName + '|' + s.name;
      sec.setAttribute('data-k', foldHash(foldKey));
      /* v1.5.0: 長い題名のグループは1列（題名は省略しない） */
      const single = T.ONE_COL_LEN > 0 && s.items.some((it) => textLen(it.title) >= T.ONE_COL_LEN);
      if (single) sec.setAttribute('data-single', '1');
      if (showHeads) {
        const h = document.createElement('div');
        h.className = 'c23-head';
        h.setAttribute('role', 'button');
        h.setAttribute('data-fold-key', foldKey);
        h.title = 'クリックで畳む／開く（⌥＋クリックで全部）';
        h.tabIndex = 0;
        if (s.icon) h.appendChild(iconNode(s.icon, s.sid, 'c23-hico'));
        const t = document.createElement('span');
        t.className = 'c23-head-t';
        t.textContent = s.label || s.name;
        h.appendChild(t);
        h.__cg = { key: s.key, name: s.name, icon: s.standalone ? '' : (s.iconOrig || '') };
        if (T.SEC_COUNT) {
          const c = document.createElement('span');
          c.className = 'c23-cnt';
          c.textContent = String(s.items.length);
          h.appendChild(c);
        }
        const ed = document.createElement('span');
        ed.className = 'c23-hedit';
        ed.title = '題名とアイコンを編集';
        ed.textContent = '✎';
        h.appendChild(ed);
        sec.appendChild(h);
      }
      if (showHeads) sec.querySelector('.c23-head').__items = s.items.map((x) => ({ id: x.id, title: x.title }));
      const fill = (list, items, cut) => { for (const it of items) {
        const a = document.createElement('a');
        a.className = 'c23-item';
        a.href = pageUrl(it.id);
        a.title = it.title;
        a.setAttribute('data-id', it.id);
        a.appendChild(iconNode(it.icon, it.id, 'c23-ico'));
        const t = document.createElement('span');
        t.className = 'c23-t';
        if (cut) {
          const d = document.createElement('span');
          d.className = 'c23-dim';
          d.textContent = '…';
          t.appendChild(d);
          t.appendChild(document.createTextNode(it.title.slice(cut)));
        } else t.textContent = it.title;
        a.appendChild(t);
        list.appendChild(a);
      } };
      const list = document.createElement('div');
      list.className = 'c23-items';
      fill(list, s.direct || s.items, single ? 0 : shortenFor(s.direct || s.items));
      if (list.childElementCount) sec.appendChild(list);
      /* v2.9.0: サブグループ（¹⁴ と共通の設定・グループごとに好きな分け方・何段でも） */
      const all = (n) => n.items.concat(...n.subs.map(all));
      const putSubs = (subs) => { for (const n of subs || []) {
        const sb = document.createElement('div');
        sb.className = 'c23-sub'; sb.setAttribute('data-depth', String(n.depth)); sb.style.setProperty('--c23-sd', String(n.depth));
        const sh = document.createElement('div');
        sh.className = 'c23-subhead'; sh.title = 'クリック: 題名とアイコン／右クリック: この中をさらに分ける';
        if (n.icon) sh.appendChild(iconNode(n.icon, '', 'c23-hico'));
        const st = document.createElement('span'); st.className = 'c23-head-t'; st.textContent = n.label; sh.appendChild(st);
        if (T.SEC_COUNT) { const c = document.createElement('span'); c.className = 'c23-cnt'; c.textContent = String(n.count); sh.appendChild(c); }
        sh.__cg = { key: n.key, name: n.name, icon: '' }; sh.__items = all(n).map((x) => ({ id: x.id, title: x.title }));
        sb.appendChild(sh);
        if (n.items.length) { const l2 = document.createElement('div'); l2.className = 'c23-items'; fill(l2, n.items, 0); sb.appendChild(l2); }
        sec.appendChild(sb);
        putSubs(n.subs);
      } };
      putSubs(s.subs);
      box.appendChild(sec);
    }
    return box;
  }

  /* 区画へ差し込む（元の一覧は CSS で隠すだけ） */
  function mount(info, model, quiet) {
    const old = info.menu.parentElement && info.menu.parentElement.querySelector(':scope > .c23');
    const box = render(info, model, quiet);
    if (old) old.replaceWith(box);
    else info.menu.parentElement.insertBefore(box, info.menu);
    if (info.sec.getAttribute('data-c23-on') !== '1') info.sec.setAttribute('data-c23-on', '1');
    boxSig.set(box, model.at);
    return box;
  }
  function unmount(info) {
    const old = info.menu.parentElement && info.menu.parentElement.querySelector(':scope > .c23');
    if (old) old.remove();
    info.sec.removeAttribute('data-c23-on');
  }
  const boxSig = new WeakMap();

  /* ============================================================
   *  処理
   * ============================================================ */
  const inflight = new Map();          // key → Promise
  const fetchedAt = new Map();         // key → この画面で読み直した時刻
  const lastError = new Map();
  const stats = { mounts: 0, fromMemory: 0, fetched: 0, errors: 0 };

  function handle(info) {
    if (OFF.includes(info.propName)) { unmount(info); return; }
    const cached = MODELS[info.key];
    const sig = nativeSig(info.menu);
    const box = info.menu.parentElement && info.menu.parentElement.querySelector(':scope > .c23');
    const inPlace = box && box.nextElementSibling === info.menu;

    if (cached && cached.model) {
      if (!inPlace || boxSig.get(box) !== cached.model.at) {
        mount(info, cached.model, true);                 // 記憶から・描画前・フェード無し
        stats.fromMemory += 1;
      } else if (info.sec.getAttribute('data-c23-on') !== '1') info.sec.setAttribute('data-c23-on', '1');
    }
    /* 読み直し: この画面でまだ・元の一覧の中身が記憶と違う */
    const stale = !cached || cached.sig !== sig || !fetchedAt.has(info.key);
    if (stale && !inflight.has(info.key)) refresh(info, sig, !cached);
  }

  function refresh(info, sig, first) {
    const p = buildModel(info.pageId, info.propName)
      .then((model) => {
        stats.fetched += 1;
        fetchedAt.set(info.key, Date.now());
        lastError.delete(info.key);
        const prev = MODELS[info.key];
        const same = prev && prev.model && JSON.stringify(prev.model.sections) === JSON.stringify(model.sections);
        if (same) { prev.sig = sig; prev.at = Date.now(); saveModelsSoon(); return; }
        MODELS[info.key] = { sig, at: Date.now(), model };
        saveModelsSoon();
        /* 今の区画（作り直されているかもしれない）へ */
        for (const inf of findAll()) {
          if (inf.key !== info.key || OFF.includes(inf.propName)) continue;
          mount(inf, model, false);                      // 初回・変更時は短いフェード
          stats.mounts += 1;
        }
      })
      .catch((e) => {
        stats.errors += 1;
        lastError.set(info.key, String(e && e.message ? e.message : e));
        fetchedAt.set(info.key, Date.now());             // 失敗しても連打しない（元の一覧のまま）
      })
      .finally(() => inflight.delete(info.key));
    inflight.set(info.key, p);
    return p;
  }

  function findAll() {
    const out = [];
    for (const menu of document.querySelectorAll('[role="menu"]')) {
      const info = sectionOf(menu);
      if (info) out.push(info);
    }
    return out;
  }
  function scan() {
    for (const info of findAll()) {
      try { handle(info); } catch (e) { stats.errors += 1; }
    }
  }
  function rerenderAll() {
    for (const info of findAll()) {
      if (OFF.includes(info.propName)) { unmount(info); continue; }
      const c = MODELS[info.key];
      if (c && c.model) mount(info, c.model, true);
    }
  }

  /* ============================================================
   *  CSS
   * ============================================================ */
  const STYLE_ID = 'c23-style';
  const VARS_ID = 'c23-vars';
  function writeVars() {
    let st = document.getElementById(VARS_ID);
    if (!st) { st = document.createElement('style'); st.id = VARS_ID; (document.head || document.documentElement).appendChild(st); }
    const css = ':root{' +
      '--c23-ff:' + (T.FONT_MODE === 'serif' ? CONFIG.SERIF_FAMILY : 'inherit') + ';' +
      '--c23-fs:' + T.FONT_SIZE + 'px;--c23-lh:' + T.LINE_HEIGHT + ';' +
      '--c23-ico:' + T.ICON_SIZE + 'px;--c23-icogap:' + T.ICON_GAP + 'px;' +
      '--c23-mincol:' + T.MIN_COL + 'px;--c23-rowgap:' + T.ROW_GAP + 'px;--c23-colgap:' + T.COL_GAP + 'px;' +
      '--c23-hs:' + T.SEC_HEAD_SIZE + 'px;--c23-hico:' + (T.SEC_ICON_SIZE > 0 ? T.SEC_ICON_SIZE + 'px' : 'calc(' + T.SEC_HEAD_SIZE + 'px + 3px)') + ';--c23-hgap:' + T.SEC_ICON_GAP + 'px;--c23-secgap:' + T.SEC_GAP + 'px;--c23-fade:' + CONFIG.FADE_MS + 'ms;' +
      '--c23-rule-w:' + T.RULE_WIDTH + '%;--c23-rule-t:' + T.RULE_THICK + 'px;--c23-rule-a:' + T.RULE_ALPHA + '%;' +
      '--c23-rule-gap:' + T.RULE_GAP + 'px;--c23-rule-pad:' + T.RULE_PAD + 'px;--c23-rule-s:' + T.RULE_STYLE + ';}';
    if (st.textContent !== css) st.textContent = css;
  }
  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = `
/* 元の一覧と「N more…」は隠すだけ（リンク・新規はそのまま） */
[data-c23-on="1"] [role="menu"]:has([aria-label="Editable title"]) { display: none !important; }
[data-c23-on="1"] [role="menu"]:has([aria-label="Editable title"]) + [role="button"] { display: none !important; }

.c23 {
  position: relative; box-sizing: border-box; width: 100%;
  padding: 2px 6px 8px 6px;
  font-family: var(--c23-ff); font-size: var(--c23-fs); line-height: var(--c23-lh);
  color: var(--c-texPri, rgb(55,53,47));
  animation: c23-in var(--c23-fade) ease-out both;
}
.c23[data-quiet="1"] { animation: none; }
@keyframes c23-in { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .c23 { animation: none; } }

.c23 > .c23-sec { margin: 0 !important; padding-bottom: 0 !important; }
/* v1.4.0: グループとグループの間（Notion 側の余白指定に負けないよう padding で・!important） */
.c23 > .c23-sec ~ .c23-sec { padding-top: var(--c23-secgap) !important; }
.c23-head {
  display: flex; align-items: center; gap: 6px; min-width: 0;
  font-size: var(--c23-hs); line-height: 1.6; font-weight: 600;
  color: var(--c-texSec, rgba(55,53,47,.65));
  position: relative;
  padding: 0 24px var(--c23-rule-pad) 2px; margin-bottom: var(--c23-rule-gap);
  cursor: pointer; user-select: none;
}
/* v1.3.0: 区切り線（長さ・太さ・濃さを変えられる） */
.c23-head::after {
  content: ""; position: absolute; left: 0; bottom: 0;
  width: var(--c23-rule-w); height: 0;
  border-bottom: var(--c23-rule-t) var(--c23-rule-s, dotted) color-mix(in srgb, var(--c-texPri, rgb(55,53,47)) var(--c23-rule-a), transparent);
  pointer-events: none;
}
.c23-head:focus-visible { outline: 2px solid rgba(35,131,226,.5); outline-offset: 1px; border-radius: 3px; }
.c23-head-t { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c23-cnt { margin-inline-start: auto; font-weight: 400; opacity: .6; font-variant-numeric: tabular-nums; }
/* v2.8.0: 見出しの編集ボタン（カーソルを乗せた時だけ） */
.c23-hedit { position: absolute; right: 2px; top: 50%; transform: translateY(calc(-50% - var(--c23-rule-pad) / 2)); width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 11px; font-weight: 400; opacity: 0; transition: opacity .12s; cursor: pointer; }
.c23-head:hover .c23-hedit { opacity: .55; }
.c23-head .c23-hedit:hover { opacity: 1; background: var(--c-bacHov, rgba(55,53,47,.08)); }
.c23-hico { flex: 0 0 auto; width: var(--c23-hico) !important; height: var(--c23-hico) !important; min-width: var(--c23-hico) !important; margin-inline-end: calc(var(--c23-hgap) - 6px); display: inline-flex; align-items: center; justify-content: center; }
.c23-hico .c23-emo { font-size: calc(var(--c23-hico) * .9) !important; }
.c23-hico img { width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; object-fit: contain; display: block; }
/* 畳んだ見出しの規則は <style id="c23-fold"> に書く（v1.2.0） */

.c23[data-layout="grid"] .c23-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--c23-mincol), 100%), 1fr));
  column-gap: var(--c23-colgap); row-gap: var(--c23-rowgap);
}
/* v1.5.0: 長い題名のグループは1列 */
.c23 .c23-sec[data-single="1"] > .c23-items { display: flex !important; flex-direction: column !important; row-gap: var(--c23-rowgap); }
.c23 .c23-sec[data-single="1"] .c23-t { white-space: normal !important; overflow: visible !important; text-overflow: clip !important; }
.c23 .c23-sub { margin: var(--c23-sub-top, 6px) 0 0 calc(var(--c23-sd, 1) * var(--c23-sub-indent, 14px)); }
.c23 .c23-subhead { display: flex; align-items: center; gap: 6px; margin: 0 0 var(--c23-sub-body, 4px); padding-bottom: 2px; font-size: .92em; font-weight: 600; color: var(--c-texSec, rgba(55,53,47,.65)); border-bottom: 1px dotted var(--c-borPri, rgba(55,53,47,.16)); cursor: pointer; }
.c23 .c23-subhead .c23-hico { width: 15px; height: 15px; }
.c23 .c23-subhead:hover .c23-head-t { text-decoration: underline dotted; text-underline-offset: 3px; }
.c23[data-layout="list"] .c23-items { display: flex; flex-direction: column; row-gap: var(--c23-rowgap); }
.c23[data-layout="flow"] .c23-items { display: flex; flex-wrap: wrap; column-gap: var(--c23-colgap); row-gap: var(--c23-rowgap); }

.c23-item {
  display: flex; align-items: flex-start; gap: var(--c23-icogap); min-width: 0;
  padding: 1px 3px; border-radius: 4px;
  color: inherit !important; text-decoration: none !important; cursor: pointer;
}
.c23-item:hover { background: var(--c-bacHov, rgba(55,53,47,.06)); }
.c23-ico {
  flex: 0 0 var(--c23-ico); width: var(--c23-ico);
  height: calc(var(--c23-fs) * var(--c23-lh));
  display: inline-flex; align-items: center; justify-content: center;
}
.c23-ico img { width: var(--c23-ico); height: var(--c23-ico); object-fit: contain; display: block; }
.c23-emo, .c23-hico .c23-emo { font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif; font-size: calc(var(--c23-ico) * .9); line-height: 1; }
.c23-t { min-width: 0; overflow-wrap: anywhere; }
.c23[data-wrap="0"] .c23-t { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.c23-dim { opacity: .5; margin-inline-end: 1px; }

.c23-gear {
  position: absolute; top: 0; right: 2px; z-index: 1;
  width: 20px; height: 20px; padding: 0; border: 0; border-radius: 4px;
  background: transparent; color: var(--c-icoSec, rgba(55,53,47,.45));
  font: 13px/20px ui-sans-serif, -apple-system, sans-serif; cursor: pointer;
  opacity: 0; transition: opacity .12s;
}
[data-c23-on="1"]:hover .c23-gear, .c23-gear:focus-visible { opacity: .8; }
.c23-gear:hover { background: var(--c-bacHov, rgba(55,53,47,.08)); opacity: 1; }

/* 見せ方の編集パネル */
.c23-panel {
  position: fixed; z-index: 2147482000; width: 280px; max-height: min(80vh, 560px); overflow: auto;
  box-sizing: border-box; padding: 10px 12px 12px;
  background: var(--c-bacPri, #fff); color: var(--c-texPri, rgb(55,53,47));
  border-radius: 8px; box-shadow: 0 8px 28px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.06);
  font: 12px/1.4 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.c23-panel h4 { margin: 0 0 8px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.c23-panel h4 span { opacity: .55; font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c23-row { display: grid; grid-template-columns: 96px 1fr 40px; align-items: center; gap: 6px; margin: 4px 0; }
.c23-row label { opacity: .75; }
.c23-row input[type="range"] { width: 100%; }
.c23-row select { width: 100%; font: inherit; }
.c23-row output { text-align: right; opacity: .7; font-variant-numeric: tabular-nums; }
.c23-chk { display: flex; align-items: center; gap: 6px; margin: 5px 0; }
.c23-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.c23-btns button { font: inherit; padding: 3px 8px; border-radius: 5px; border: 1px solid rgba(55,53,47,.18); background: transparent; color: inherit; cursor: pointer; }
.c23-btns button:hover { background: var(--c-bacHov, rgba(55,53,47,.06)); }
`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ============================================================
   *  見せ方の編集パネル
   * ============================================================ */
  const SPEC = [
    { k: 'LAYOUT', label: '並べ方', type: 'select', opts: [['grid', '格子（幅から列数）'], ['list', '1列'], ['flow', '流し込み']] },
    { k: 'SEC_GAP', label: 'グループの間', type: 'range', step: 1, unit: 'px' },
    { k: 'FONT_MODE', label: '書体', type: 'select', opts: [['serif', '明朝（¹⁴ と同じ）'], ['notion', 'Notion の書体']] },
    { k: 'FONT_SIZE', label: '文字の大きさ', type: 'range', step: 0.5, unit: 'px' },
    { k: 'LINE_HEIGHT', label: '行の高さ', type: 'range', step: 0.05, unit: '' },
    { k: 'ICON_SIZE', label: 'アイコン', type: 'range', step: 1, unit: 'px' },
    { k: 'ICON_GAP', label: 'アイコンと文字', type: 'range', step: 1, unit: 'px' },
    { k: 'MIN_COL', label: '列の最小幅', type: 'range', step: 5, unit: 'px' },
    { k: 'ONE_COL_LEN', label: '1列にする長さ', type: 'range', step: 1, unit: '字' },
    { k: 'ROW_GAP', label: '行の間', type: 'range', step: 1, unit: 'px' },
    { k: 'COL_GAP', label: '列の間', type: 'range', step: 1, unit: 'px' },
    { k: 'SEC_HEAD_SIZE', label: '見出しの文字', type: 'range', step: 0.5, unit: 'px' },
    { k: 'SEC_ICON_SIZE', label: '見出しのアイコン', type: 'range', step: 1, unit: 'px' },
    { k: 'SEC_ICON_GAP', label: 'アイコンと見出し', type: 'range', step: 1, unit: 'px' },
    { k: 'SHORTEN_MIN', label: '省く最小文字数', type: 'range', step: 1, unit: '' },
    { k: 'TITLE_WRAP', label: '長い題名を折り返す', type: 'check' },
    { k: 'SHORTEN', label: '共通の頭を「…」に縮める', type: 'check' },
    { k: 'SEC_HEADS', label: 'シリーズの見出し', type: 'check' },
    { k: 'SEC_COUNT', label: '見出しに件数', type: 'check' },
    { k: 'HIDE_UNTITLED', label: '題名の無いページを隠す', type: 'check' }
  ];
  const STRUCTURAL = new Set(['ONE_COL_LEN', 'LAYOUT', 'TITLE_WRAP', 'SHORTEN', 'SHORTEN_MIN', 'SEC_HEADS', 'SEC_COUNT']);
  let panel = null, panelInfo = null;

  function setTune(k, v, live) {
    T[k] = sanitize(k, v);
    writeLS(LS_TUNE, T);
    writeVars();
    if (k === 'HIDE_UNTITLED') { fetchedAt.clear(); scan(); return; }   // 中身が変わるので読み直し
    if (STRUCTURAL.has(k) || !live) rerenderAll();
  }

  function closePanel() {
    if (panel) panel.remove();
    panel = null; panelInfo = null;
    document.removeEventListener('pointerdown', onOutside, true);
    document.removeEventListener('keydown', onEsc, true);
  }
  function onOutside(e) { if (panel && !panel.contains(e.target) && !(e.target.closest && e.target.closest('.c23-gear'))) closePanel(); }
  function onEsc(e) { if (e.key === 'Escape') closePanel(); }

  function openPanel(anchor, info) {
    if (panel && panelInfo && panelInfo.key === info.key) { closePanel(); return; }
    closePanel();
    panelInfo = info;
    panel = document.createElement('div');
    panel.className = 'c23-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '見せ方の編集');
    const h = document.createElement('h4');
    h.textContent = '見せ方の編集';
    const sub = document.createElement('span');
    sub.textContent = info.propName;
    h.appendChild(sub);
    panel.appendChild(h);

    for (const sp of SPEC) {
      if (sp.type === 'check') {
        const row = document.createElement('label');
        row.className = 'c23-chk';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!T[sp.k];
        cb.addEventListener('change', () => setTune(sp.k, cb.checked, false));
        row.appendChild(cb);
        row.appendChild(document.createTextNode(sp.label));
        panel.appendChild(row);
        continue;
      }
      const row = document.createElement('div');
      row.className = 'c23-row';
      const lb = document.createElement('label');
      lb.textContent = sp.label;
      row.appendChild(lb);
      if (sp.type === 'select') {
        const sel = document.createElement('select');
        for (const [v, t] of sp.opts) { const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); }
        sel.value = T[sp.k];
        sel.addEventListener('change', () => setTune(sp.k, sel.value, false));
        row.appendChild(sel);
        row.appendChild(document.createElement('span'));
      } else {
        const r = RANGES[sp.k];
        const inp = document.createElement('input');
        inp.type = 'range'; inp.min = r[0]; inp.max = r[1]; inp.step = sp.step; inp.value = T[sp.k];
        const out = document.createElement('output');
        out.textContent = T[sp.k] + sp.unit;
        inp.addEventListener('input', () => { out.textContent = inp.value + sp.unit; setTune(sp.k, inp.value, true); });
        row.appendChild(inp);
        row.appendChild(out);
      }
      panel.appendChild(row);
    }

    const btns = document.createElement('div');
    btns.className = 'c23-btns';
    const mk = (t, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.addEventListener('click', fn); btns.appendChild(b); };
    mk('既定に戻す', () => { reset(); const a = anchor; closePanel(); openPanel(a, info); });
    mk('読み直す', () => { delete MODELS[info.key]; fetchedAt.delete(info.key); saveModelsSoon(); scan(); });
    mk('この区画では使わない', () => {
      if (!OFF.includes(info.propName)) OFF.push(info.propName);
      writeLS(LS_OFF, OFF);
      closePanel();
      rerenderAll();
      console.info(TAG + ' 「' + info.propName + '」は元の一覧に戻しました。戻すには __c23.use("' + info.propName + '")');
    });
    mk('閉じる', closePanel);
    panel.appendChild(btns);

    document.body.appendChild(panel);
    const r = anchor.getBoundingClientRect();
    const w = panel.offsetWidth, hgt = panel.offsetHeight;
    let left = Math.min(window.innerWidth - w - 8, Math.max(8, r.right - w));
    let top = r.bottom + 6;
    if (top + hgt > window.innerHeight - 8) top = Math.max(8, r.top - hgt - 6);
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    setTimeout(() => {
      document.addEventListener('pointerdown', onOutside, true);
      document.addEventListener('keydown', onEsc, true);
    }, 0);
  }

  function reset() {
    Object.assign(T, DEFAULTS);
    try { localStorage.removeItem(LS_TUNE); } catch (e) { /* noop */ }
    writeVars();
    rerenderAll();
    return { ...T };
  }

  /* ============================================================
   *  v1.1.0: 操作は文書全体の入口で受け止める（Notion の描き直しに巻き込まれない）
   * ============================================================ */
  /* 開閉の状態 → <head> の専用 <style>（区画の中は書き換えない） */
  const FOLD_STYLE_ID = 'c23-fold';
  function foldHash(key) {
    let h = 2166136261;
    const v = String(key);
    for (let i = 0; i < v.length; i++) { h ^= v.charCodeAt(i); h = Math.imul(h, 16777619); }
    return 'k' + (h >>> 0).toString(36);
  }
  function writeFoldCss() {
    let st = document.getElementById(FOLD_STYLE_ID);
    if (!st) { st = document.createElement('style'); st.id = FOLD_STYLE_ID; (document.head || document.documentElement).appendChild(st); }
    const rules = [];
    for (const k of Object.keys(FOLD)) {
      if (!FOLD[k]) continue;
      const h = foldHash(k);
      /* v1.7.0: 1列のグループ（.c23 .c23-sec[data-single] > .c23-items）より強い指定にする */
      rules.push('html body .c23 .c23-sec.c23-sec[data-k="' + h + '"] > :is(.c23-items, .c23-sub).c23-items{display:none !important;}');
      rules.push('html body .c23 .c23-sec.c23-sec[data-k="' + h + '"] > .c23-sub{display:none !important;}');
      rules.push('html body .c23 .c23-sec.c23-sec[data-k="' + h + '"] > .c23-head.c23-head{margin-bottom:0 !important;}');
    }
    const css = rules.join('\n');
    if (st.textContent !== css) st.textContent = css;
  }
  const isFolded = (key) => !!FOLD[key];
  function toggleHead(head, all) {
    const key = head.getAttribute('data-fold-key');
    if (!key) return;
    const fold = !isFolded(key);
    let keys = [key];
    if (all) {
      const box = head.closest('.c23');
      if (box) keys = Array.from(box.querySelectorAll('.c23-head[data-fold-key]')).map((h) => h.getAttribute('data-fold-key'));
    }
    for (const k of keys) { if (fold) FOLD[k] = true; else delete FOLD[k]; }
    writeFoldCss();
    writeLS(LS_FOLD, FOLD);
    stats.toggles = (stats.toggles || 0) + 1;
  }

  const FOREIGN_UI = '[data-no-passthrough], .c26-ui, .c26-panel, [role="dialog"], [role="menu"], [role="listbox"], [role="tooltip"], [role="alertdialog"], input, textarea, select';
  function isForeignUi(t) {
    const el = t && t.nodeType === 1 ? t : (t && t.parentElement);
    if (!el || !el.closest) return false;
    if (el.closest('.c23')) return false;
    return !!el.closest(FOREIGN_UI);
  }
  /* 押した位置の真下から ²³ の要素を探す（重なりに吸われても拾う） */
  function hitOf(e) {
    const pick = (el) => {
      if (!el || el.nodeType !== 1 || !el.closest) return null;
      const box = el.closest('.c23');
      if (!box) return null;
      return { box, head: el.closest('.c23-head'), edit: el.closest('.c23-hedit'), gear: el.closest('.c23-gear'), item: el.closest('.c23-item') };
    };
    let h = pick(e.target);
    if (h) return h;
    /* 上に別の画面（²⁶ のパネル・各種ポップアップ・メニュー・ダイアログ）がある時は、その下を拾わない＝誤作動しない */
    if (isForeignUi(e.target)) return null;
    if (typeof e.clientX !== 'number' || !document.querySelector('.c23')) return null;
    try {
      for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
        h = pick(el);
        if (h) return h;
        if (el.closest && el.closest('.c23-panel')) return null;
      }
    } catch (err) { /* noop */ }
    return null;
  }

  /* 1回の操作で1回だけ（最初に届いたイベントで） */
  let gesture = { at: 0, key: '', done: false };
  function onAny(e) {
    if (typeof e.button === 'number' && e.button !== 0) return;
    const h = hitOf(e);
    if (!h) return;
    const down = e.type === 'pointerdown' || e.type === 'mousedown';
    /* Notion へは渡さない（ブロック選択・ドラッグ・編集ポップアップを起こさない） */
    e.stopPropagation();
    if (h.head || h.gear || down) {
      if (e.cancelable && (h.head || h.gear || e.type === 'click' || down)) {
        /* 本は mousedown の既定（フォーカス）だけ止め、click は openItem が決める */
        if (!(h.item && e.type === 'click')) e.preventDefault();
      }
    }
    const now = performance.now();
    /* v2.8.0: ✎ → 題名とアイコンの編集（畳まない） */
    if (h.edit && h.head) {
      if (e.type === 'click' && h.head.__cg) CG.openEditor({ key: h.head.__cg.key, name: h.head.__cg.name, icon: h.head.__cg.icon, anchor: h.head });
      return;
    }
    if (h.head) {
      const key = h.head.getAttribute('data-fold-key') || '';
      if (down && (now - gesture.at > 350 || gesture.key !== key)) gesture = { at: now, key, done: false };
      if (!down && (now - gesture.at > 1500 || gesture.key !== key)) gesture = { at: now, key, done: false };
      if (!gesture.done) { gesture.done = true; toggleHead(h.head, e.altKey); }
      return;
    }
    if (e.type !== 'click') return;
    if (h.gear) { openPanel(h.gear, h.box.__c23info); return; }
    if (h.item) openItem(e, h.item.getAttribute('data-id'));
  }
  function onKeyCap(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target;
    if (!t || t.nodeType !== 1 || !t.closest) return;
    const head = t.closest('.c23-head');
    if (!head) return;
    e.preventDefault();
    e.stopPropagation();
    toggleHead(head, e.altKey);
  }
  for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    window.addEventListener(type, onAny, true);
    document.addEventListener(type, onAny, true);   // window で誰かに止められた時の予備（同じ操作は1回だけ）
  }
  window.addEventListener('keydown', onKeyCap, true);
  /* v2.8.0: 見出しの右クリック → 編集・本の右クリック → グループへ移す */
  window.addEventListener('contextmenu', (e) => {
    const t = e.target;
    const el = t && t.nodeType === 1 ? t : t && t.parentElement;
    if (!el || !el.closest) return;
    const head = el.closest('.c23 .c23-head, .c23 .c23-subhead');
    const item = el.closest('.c23 .c23-item');
    if (!head && !item) return;
    e.preventDefault();
    e.stopPropagation();
    /* v2.9.0: 見出しの右クリック → この中のサブグループ（題名とアイコンは ✎ ／サブグループの見出しはクリック） */
    if (head && head.__cg) { if (CG.openSubMenu) CG.openSubMenu({ key: head.__cg.key, name: (head.querySelector('.c23-head-t') || head).textContent.trim(), items: head.__items || [], anchor: head }); else CG.openEditor({ key: head.__cg.key, name: head.__cg.name, icon: head.__cg.icon, anchor: head }); return; }
    const gsec = item.closest('.c23-sec'), gh = gsec && gsec.querySelector(':scope > .c23-head');
    const box = item.closest('.c23');
    const secs = Array.from(box.querySelectorAll('.c23-head')).filter((h) => h.__cg).map((h) => {
      const img = h.querySelector('.c23-hico img'), emo = h.querySelector('.c23-hico .c23-emo');
      return { key: h.__cg.key, label: (h.querySelector('.c23-head-t') || h).textContent.trim(), icon: img ? img.getAttribute('src') : emo ? emo.textContent : '' };
    });
    CG.openMover({ id: item.getAttribute('data-id'), title: item.title || item.textContent.trim(), sections: secs, anchor: item, group: gh && gh.__cg ? gh.__cg.key : '', groupName: gh ? (gh.querySelector('.c23-head-t') || gh).textContent.trim() : '' });
  }, true);
  /* v2.9.0: サブグループの見出しのクリック → 題名とアイコン */
  window.addEventListener('click', (e) => {
    const t = e.target, el = t && t.nodeType === 1 ? t : t && t.parentElement;
    const sh = el && el.closest ? el.closest('.c23 .c23-subhead') : null;
    if (!sh || !sh.__cg) return;
    e.preventDefault(); e.stopPropagation();
    CG.openEditor({ key: sh.__cg.key, name: sh.__cg.name, icon: '', anchor: sh });
  }, true);
  CG.on(() => { try { rerenderAll(); } catch (err) { stats.errors += 1; } });

  /* ============================================================
   *  見張り（描画前に同期で出す）
   * ============================================================ */
  const mo = new MutationObserver((recs) => {
    let hit = false;
    for (const r of recs) {
      const t = r.target;
      if (t && t.nodeType === 1 && (t.closest('.c23, .c23-panel') || t.id === VARS_ID || t.id === STYLE_ID)) continue;
      if (r.addedNodes.length || r.removedNodes.length) { hit = true; break; }
    }
    if (!hit) return;
    try { scan(); } catch (e) { stats.errors += 1; }
  });

  function start() {
    installStyle();
    writeVars();
    writeFoldCss();
    mo.observe(document.documentElement, { childList: true, subtree: true });
    scan();
  }
  if (document.head || document.documentElement) start();

  /* ============================================================
   *  コンソール
   * ============================================================ */
  window[API] = {
    version: VERSION,
    set: (patch) => {
      if (patch && typeof patch === 'object') {
        for (const k of Object.keys(patch)) {
          if (k in DEFAULTS) { T[k] = sanitize(k, patch[k]); continue; }
          if (k in CONFIG) { CONFIG[k] = patch[k]; continue; }
          console.warn(TAG + ' 未知のキー: ' + k);
        }
        writeLS(LS_TUNE, T);
        writeVars();
        fetchedAt.clear();
        rerenderAll();
        scan();
      }
      return { ...T, ...CONFIG };
    },
    reset,
    refresh: () => { MODELS = {}; writeLS(LS_MODEL, MODELS); fetchedAt.clear(); scan(); return '読み直します'; },
    use: (propName) => { OFF = OFF.filter((p) => p !== propName); writeLS(LS_OFF, OFF); scan(); return OFF; },
    off: (propName) => { if (!OFF.includes(propName)) OFF.push(propName); writeLS(LS_OFF, OFF); rerenderAll(); return OFF; },
    status: () => ({
      version: VERSION,
      sections: findAll().map((i) => ({ page: i.pageId, prop: i.propName, on: i.sec.getAttribute('data-c23-on') === '1', memory: !!MODELS[i.key], error: lastError.get(i.key) || '' })),
      ...stats, tuning: { ...T }, off: OFF.slice()
    })
  };
  console.info(TAG + ' ページのリレーション区画を全件表示にします。区画の右上 ⚙ で見せ方を編集 / __c23.status()');
})();