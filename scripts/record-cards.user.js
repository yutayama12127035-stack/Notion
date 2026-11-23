// ==UserScript==
// @name         « No »　⁴² _ Record Cards
// @namespace    https://cordivestium.local/record-cards
// @version      1.4.0
// @description  v1.4.0: カードを大胆な形に（表紙が紙の上へ飛び出す・子午線と菱形・題字 26px と短い色の線・角丸 28）。つまみの置き場所をいつも淡く見せる（乗せると Notion の本物のつまみが同じ所に）。チェックボックスはつまみの下（カードの左の外）へ。グループの見出しは ³³ 203 に任せる。v1.3.0: カードの形を作り直した（左に表紙の台・切符のような切り取り線と半円の切り欠き・角丸 24・影を柔らかく。乗せると浮き、表紙が持ち上がり、台が明るくなる）。並べ替えのつまみ（⋮⋮）はカードの外（左）に出す。v1.2.0: スクロールしても標準の表に戻らない（見出し行・タブの段が仮想化で外れても、同じ表・同じビューのまま。表が描き直されても印を付け直す）。カード（レコード）を Notion のつまみで並べ替えられるように（つまみをカードの左上へ寄せる）。Books 以外の表のビューもカードに（³³ の索引帯の「カードで読む」・配置の窓の「カードをやめる」）。見た目をさらに整え（紙・題字・あらすじの筋・本の背の光・乗せた時の筋）、スクロールで入るカードがふわっと出る。v1.1.0: カードの配置を編集できるように（ドラッグで並べ替え・幅 1 列／横いっぱい・隠す・表紙の高さ・列の数・小見出し。ビューごとに覚える）。カードを 1 枚の紙に（角丸・淡い影・乗せると浮く・表紙は本のように）、出てくる時・並べ替えた時に動く。見出し行の台が残した 36px の余白・表紙の下の灰色の余り・題字のアイコンが字の上に乗るのを直す。表紙の無い行は表紙の場所に押せる枠。v1.0.0: フル DB の表のビューを、1 レコード 1 枚のカードで読む（³³ 198 までの「上下分割」をここへ移した）。値の編集は Notion のまま。対象は設定したビューだけ（既定は Medias の Books）。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://app.notion.com/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @noframes
// ==/UserScript==

/*
 * v1.4.0（2026-10-15・³³ 203.0.0 と組で。依頼主の 202 の実機の見え方への直し）
 *   「ホバー時にじゃないと消えるから…後はチェックボックスも修正…カードの形も見直し。もっと大胆に…グルーピング（Notion公式機能）がダサい…５枚目がひんと」（5 枚目 = Catalogus の上段）
 *   ・つまみ: Notion のつまみは乗せた時しか出ない（Notion が出し入れする）。→ 同じ所（カードの左の外）に、いつも淡い ⋮⋮ の目印（見た目だけ・押せない）。乗せると本物が重なる
 *   ・チェックボックス: カードの紙の左上（表紙の台の上）に出ていた。→ つまみの下（カードの左の外）へ translate（測って --c42-kx/ky。1 カード 1 度）
 *   ・カード: 切符の形をやめ、表紙が紙の上へ 24px 飛び出す形に。表紙と項目の境は Catalogus の子午線と同じ細線（上下は薄れる）、題字の高さに菱形。題字 26px・下に短い色の線と細線。
 *     紙は角丸 28・左上から淡い色。乗せると子午線が色づき、菱形が光る（新しい動き）
 *   ・グループの見出しの見た目は ³³ 203 へ（DB の全部のビューで同じにするため。⁴² の 16px・650 の指定は外した）
 * v1.3.0（2026-10-14・³³ 202.0.0 と組で。依頼主の 201 の実機の見え方への直し）
 *   「これを外に出せますか。あとは、カードの形がいまいち。これもガラッと変えてほしい。…とにかく見た目の見直しと描画の改善。後はアニメーション。」
 *   ・つまみ: 201 はカードの紙の左上（内側）に寄せていて、表紙と重なった。→ カードの左の外（紙の左端から 8px 外・上から 18px）へ。
 *     Notion の行のつまみは、もとからカードの左の外に出る物なので、寄せる量は小さくなる（見た目の位置だけ。並べ替えは Notion）
 *   ・カードの形: 紙 1 枚に表紙と項目を並べる形をやめ、「表紙の台 ＋ 切り取り線 ＋ 項目」の切符の形に。
 *     左は表紙の列の幅の台（淡い色の地・角丸 24 の左側）、台と項目の間に点線の切り取り線と、上下の半円の切り欠き。
 *     表紙の列が無いビューは、左に細い色の帯だけ（切り欠きは出さない）。題字 24px。小見出しは小さな大文字の札。あらすじの筋はやめ、行の間で読ませる
 *   ・動き（新しい物だけ）: 乗せると 3px 浮く・台が少し明るくなる・表紙が 6px 持ち上がる・切り取り線の点が濃くなる
 * v1.2.0（2026-10-14・³³ 201.0.0 と組で。依頼主の 200 の実機の見え方への直し）
 *   「スクロールするともとに戻る。グルーピングが関係している。入れ替えができない。アイテムの。…もっとおしゃれに。…Books以外にも使う場合にも対応。…今回はDBに注力して。DBのアニメーションとかも。」
 *   ・スクロールで戻る（収録: グループの終わりまで下げると標準の表になり、Notion の固定の見出し＝グループ名と列の見出しが出た。上へ戻すとカード）:
 *     200 は「本文の枠の最初の表で、見出し行のある物」を選び、見出し行・タブが無いと外していた。Notion は仮想化で、見えない所の見出し行やタブの段を外し、
 *     表の箱を描き直す（推定・本物の DOM は見ていない）。→ 今カードにしている表がまだあればそれ、無ければ行の多い表。見出し行は表の中 → Notion の固定の写し →
 *     このビューで前に読んだ列の形の順。タブが無い間は同じ表・同じ DB なら今のビューのまま。表が一瞬見えなくなっても 1.5 秒は外さない。
 *     同じ DB の表が 2 つ以上あればどれにも印。Notion の固定の写し（グループ名と列の見出し）はカードの間は見せない。何が起きたかは __c42.status().trail
 *   ・並べ替え: カードに乗せると、そのカードの行の Notion のつまみ（⋮⋮）を探し、カードの左上へ translate で寄せる（並べ替えは Notion のドラッグのまま。
 *     内部の API・合成のイベントは使わない）。見つからない時は、カードを掴もうとした時に 1 度だけ知らせる（__c42.status().grip）
 *   ・Books 以外: 合図 c42:add（今のビューを対象に足す）・c42:drop（外す）。³³ 201 の索引帯は、表のビューならどれでも「カードで読む」を出す。配置の窓に「カードをやめる」
 *   ・見た目: 紙（角丸 18・上が少し明るい・影を 2 段）、乗せると 2px 浮いて左に細い光の筋。題字 22px と、右へ消える細い区切り。小見出しは字の間を広く。
 *     長い字は左に淡い色の筋。表紙は本の背の光。表紙の無い枠は細い斜線。カードの間はグループの見出しを少し大きく
 *   ・動き（新しく足した物だけ）: スクロールで初めて描かれたカードが下からふわっと（前に見たカード・描き直しは動かさない）。乗せた時の浮き・筋。つまみの出。
 *     視差を減らす設定では動かさない
 *   ・色の合わせ: 強調の色は ³³ の --c194-acc（無ければ Notion の青）
 */
/*
 * v1.1.0（2026-10-13・³³ 200.0.0 と組で。依頼主の 199 の実機の見え方への直し）
 *   「不自然な余白がある。…レイアウト編集機能をつけないとダメだし、見た目がダサい。もっとアニメーションや表示をきちんとできるように」
 *   ・余白の原因（本物の DOM の写し・ソース・試験台で照合）:
 *       ① 列の見出し行は隠していたが、その外側の台（<div style="height: 36px;">）が残り、グループの見出しと最初のカードの間が 36px 空いていた
 *          （試験台では ³³ がその台に data-c194-hb を付けて隠していたので出ず、本物では付いていなかった）→ ⁴² が自分で台ごと畳む
 *       ② 表紙の画像の箱を高さ 260px に固定し、絵は contain で上に寄せていた。³⁴ が画像の箱に灰色の地（読み込み中の地）を敷くので、
 *          絵の下に灰色の余りが出ていた → 箱を絵の大きさそのものに（幅 = min(列の幅, 高さ × ³⁴ の縦横比 --c34-ar)・高さは比から）。灰色の地は敷かない
 *       ③ 表紙の無い行は、表紙の列に「COVERS」の字だけが浮いていた → カードの高さいっぱいの点線の枠（列のアイコンと名前・押すと Notion の画像の追加）
 *       ④ 題字: ²⁶ Atelier の題字の書体の指定（字の大きさ・行の高さ）が span に直接当たり、⁴² が値の箱に付けた大きさは効かず、アイコンだけ大きく
 *          字が下にずれていた → 字の大きさ・行の高さを span に（Atelier より強い指定）。書体（字の形）は Atelier のまま
 *   ・見た目: 1 レコード = 1 枚の紙（角丸 14px・細い縁・淡い影。乗せると影が深くなる）。題字は大きく太く、下に細い区切り。小見出しは小さな大文字と
 *     列のアイコン。表紙は本のように角を丸め影を落とし、カードに乗せると少し持ち上がる。長い字は行の間を広く
 *   ・動き（新しく足した物だけ。既存の transition・animation は変えていない）: カードにした時、見えている行が下から順にふわっと出る。
 *     配置を変えた時、セルが前の位置から今の位置へ滑る（FLIP・transform だけ）。表に戻した時は表がふっと出る。視差を減らす設定では動かさない
 *   ・配置の編集（³³ の索引帯の「配置」・ScriptCat のメニュー・__c42.edit()）: 右に小さな窓。カードの見取り図の札をドラッグで並べ替え、
 *     札の ⇔ で幅（1 列／横いっぱい）、− で隠す（隠した物は下の段から戻す）。表紙（なし・220・260・300）・列の数（自動・1〜4）・小見出し（出す・隠す）。
 *     変えるとその場でカードが動いて並び替わる。札に乗せると本物のカードのその項目が光る。編集の間はカードの値を押しても Notion は開かず、
 *     押した項目の札が選ばれる（閉じると元どおり）。Esc で閉じる。ビューごとに c42.cards の layouts へ（列は名前で覚える。名前を変えた列は新しい列として最後に）
 *   ・表の見つけ方: 見えている本文の枠（ピークの外で、画面に見えている面積がいちばん大きい枠）の、見えている表。199 の収録で、読み込みの間
 *     「表に戻す」のボタンが出ているのに見えている表は標準のままだった — Notion が持つもう 1 つの枠（見えていない方）の表にカードを付けていたと見た。
 *     枠が替わった時は前の表の印を外す。__c42.status() の frames に、枠が 2 つ以上あった数
 *   ・列の数（自動）: 幅から決めた数と、1 列の項目の数（2 以上）の小さい方。配置で選んだ数はそのまま
 * v1.0.0（2026-10-13・³³ 199.0.0 と組で。依頼主の 198 の実機の見え方への直し）
 *   ・³³ の C196（上下分割）をこのスクリプトへ移した。³³ はサイドバー・索引帯・星の罫線だけを受け持ち、カードの間は下の契約を読んで譲る
 *   ・段を跨がせない。[表紙] | 題字（横いっぱい）／短い項目（幅から列の数を決めて左から右・上から下）／長い字（1 つずつ横いっぱい）
 *   ・表紙は高さ 260px（220 / 300 に切り替え）。列の幅は高さ × 0.71。画像は縦横比のまま切り抜かない
 *   ・編集: 値の箱に最低の高さ（26px）を残し、空の値も押せる
 *   ・契約（html）: data-c194-split = カードにしているビュー ID（⁰⁵・¹³・²¹ は補正しない。196 からの契約のまま）・data-c42-want = カードにする予定のビュー ID
 *     （³³ は表の倍率をはじめから 100% にする）・data-c42-back = 対象だが「表に戻す」にしているビュー ID・data-c42-cols = 列の見出しを出している間・
 *     data-c42-edit = 配置の編集の窓を開いている間（v1.1.0）。data-c194-hold には自分の印「c42」を足し引きする（ほかの印は残す）。表の箱には data-c42-cards / data-c42-cols。
 *     ³³ の帯のボタンからは c42:cols・c42:back・c42:cards・c42:edit（detail なし。Console からは c42:cmd の detail に 'cols' などの字も可）。
 *     付け外しの後に c42:state と c194:rowlayout（src 'c42'）を出す
 *   ・設定は ScriptCat の c42.cards。壊れていたら上書きせず、既定で動かす（__c42.store.reset() で予備の c42.cards.broken へ移してから始め直せる）
 */
(function () {
  'use strict';
  const VERSION = '1.4.0';
  const TAG = '[⁴² Record Cards]';
  const root = document.documentElement;
  const pageWin = () => { try { return typeof unsafeWindow !== 'undefined' && unsafeWindow ? unsafeWindow : window; } catch (e) { return window; } };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const id32 = (s) => String(s || '').replace(/-/g, '').toLowerCase();
  const ID32 = /^[0-9a-f]{32}$/;
  const seen = new Set();
  const log = (key, msg) => { if (seen.has(key)) return; seen.add(key); console.info(TAG, msg); };
  const reduced = () => { try { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };

  /* ── 決まり（数値はここだけ） ── */
  const T = {
    covers: [220, 260, 300],   // 表紙の高さの上限（CSS px）。「ズームしなくても作者などの細かい文字が読める」大きさから選ぶ
    coverDef: 260,
    coverW: 0.71,              // 表紙の列の幅 ÷ 高さ（文庫 105×148mm の比。横長の絵は列の幅に収まるよう縮む）
    minCol: 168,               // 短い項目の 1 列の最小の幅
    maxCol: 4,                 // 短い項目の列の数の上限
    gap: 28,                   // 列の間
    padX: 26,                  // カードの左右の内側
    longMax: 60, longAvg: 28,  // 長い字の列: 60 字を超える行がある・平均 28 字を超える
    sample: 40,                // 列の役目を決める時に見る行の数
    safe: 2400,                // 当ててから、行の箱が重ならなくなるのを待つ上限（ms）
    holdCap: 1200,             // data-c194-hold の印の上限（ms）
    keys: 64,                  // 配置で覚える列の数の上限（1 ビュー）
    rise: 520, stagger: 45,    // カードにした時に行が出てくる時間・行ごとの遅れ（ms）
    flip: 420,                 // 配置を変えた時にセルが滑る時間（ms）
    fade: 260,                 // 表に戻した時に表がふっと出る時間（ms）
    inFor: 1100,               // 出てくる動きを当てておく時間（ms。この後に描かれた行は動かさない）
    grace: 1500,               // v1.2.0: カードの表が一瞬見えなくなっても外さずに待つ時間（ms）
  };
  const EASE = 'cubic-bezier(.2, .75, .2, 1)';
  const DEF_VIEW = '3e26c0ae968e803f98a8000cd021bc6a';   // Medias の Books（³³ 196〜198 の既定と同じ）

  /* ── 設定（ScriptCat の c42.cards）。壊れていたら上書きしない ── */
  const SK = 'c42.cards';
  const DEF = () => ({ schema: 'c42.cards', v: 1, on: true, cover: T.coverDef, targets: [{ db: '', view: DEF_VIEW }], off: {}, layouts: {} });
  const gmGet = (k) => { try { return typeof GM_getValue === 'function' ? GM_getValue(k, null) : null; } catch (e) { return null; } };
  const gmSet = (k, v) => { try { if (typeof GM_setValue !== 'function') return 'ScriptCat の保存場所が使えません'; GM_setValue(k, v); return ''; } catch (e) { return '保存できませんでした（' + (e && e.message) + '）'; } };
  const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
  const okName = (s) => typeof s === 'string' && s.length > 0 && s.length <= 90;
  /* v1.1.0: ビューごとの配置。order = 列の名前の並び・wide / hide = 名前 → 0 / 1（書いていない列は自動）・cols = 0（自動）〜4・cover = 無し（全体の値）／0（出さない）／220・260・300・labels */
  function checkLayout(L) {
    if (!isObj(L)) return '形';
    if (L.order != null && (!Array.isArray(L.order) || L.order.length > T.keys || !L.order.every(okName))) return 'order';
    for (const k of ['wide', 'hide']) {
      if (L[k] == null) continue;
      if (!isObj(L[k])) return k;
      const ks = Object.keys(L[k]);
      if (ks.length > T.keys || !ks.every(okName) || !ks.every((n) => L[k][n] === 0 || L[k][n] === 1)) return k;
    }
    if (L.cols != null && [0, 1, 2, 3, 4].indexOf(L.cols) < 0) return 'cols';
    if (L.cover != null && [0].concat(T.covers).indexOf(L.cover) < 0) return 'cover';
    if (L.labels != null && typeof L.labels !== 'boolean') return 'labels';
    return '';
  }
  function check(o) {
    if (!o || typeof o !== 'object' || o.schema !== 'c42.cards' || o.v !== 1) return 'schema・v が違います';
    if (!Array.isArray(o.targets) || o.targets.length > 200) return 'targets が配列ではありません';
    for (const t of o.targets) if (!t || !ID32.test(String(t.view || '')) || (t.db && !ID32.test(String(t.db)))) return 'targets の ID の形が違います';
    if (!o.off || typeof o.off !== 'object') return 'off がありません';
    if (typeof o.on !== 'boolean') return 'on がありません';
    if (o.layouts != null) {
      if (!isObj(o.layouts)) return 'layouts の形が違います';
      const ks = Object.keys(o.layouts);
      if (ks.length > 200) return 'layouts が多すぎます';
      for (const k of ks) {
        if (!ID32.test(k)) return 'layouts のビュー ID の形が違います';
        const w = checkLayout(o.layouts[k]);
        if (w) return 'layouts（' + k.slice(0, 8) + '…）の ' + w + ' の形が違います';
      }
    }
    return '';
  }
  const ST = { v: DEF(), broken: null };
  function load() {
    let raw = gmGet(SK);
    if (raw == null) { ST.v = DEF(); ST.broken = null; return; }
    let o = raw;
    if (typeof raw === 'string') { try { o = JSON.parse(raw); } catch (e) { o = null; } }
    const why = check(o);
    if (why) { ST.v = DEF(); ST.broken = { why, raw }; log('broken', '設定（' + SK + '）が読めないため、既定で動かします（保存されている物は上書きも削除もしていません。__c42.store.reset() で予備へ移して始め直せます）。'); return; }
    if (T.covers.indexOf(o.cover) < 0) o.cover = T.coverDef;
    if (!o.layouts) o.layouts = {};   // 1.0.0 の設定（layouts なし）はそのまま読める。書くのは次に保存する時
    ST.v = o; ST.broken = null;
  }
  function save() {
    if (ST.broken) return '設定（' + SK + '）が壊れているので書きません（' + ST.broken.why + '）。__c42.store.reset() で始め直せます';
    return gmSet(SK, JSON.stringify(ST.v));
  }
  load();

  /* ── 状態 ── */
  const S = { tv: null, all: [], cm: {}, trail: [], db: '', vid: '', on: false, css: '', cols: false, bad: {}, mem: {}, info: null, L: null, W: 0, why: '', chkT: 0, at: 0, n: 0, inT: 0, sc: null, ro: null };

  /* ── 契約（html の属性・印・合図） ── */
  function rt() { try { const r = pageWin()[Symbol.for('constellucentia.runtime')]; return r && r.contract && r.events ? r : null; } catch (e) { return null; } }
  function emit(type, detail) {
    const r = rt();
    if (r) { try { r.events.emit(type, detail); return; } catch (e) { /* 素の発火へ */ } }
    try { document.dispatchEvent(new CustomEvent(type, { detail })); } catch (e) { /* noop */ }
  }
  function attr(key, name, value) {
    const r = rt();
    if (r && key) { try { if (value == null) r.contract.remove(key, 'c42'); else r.contract.set(key, value, 'c42'); } catch (e) { /* 直接書く */ } }
    if (value == null) { if (root.hasAttribute(name)) root.removeAttribute(name); }
    else if (root.getAttribute(name) !== value) root.setAttribute(name, value);
  }
  /* data-c194-hold は ³³ と分け合う。自分の印「c42」だけを足し引きして、ほかの印は残す */
  const HOLD = { on: false, capT: 0, f: 0 };
  function holdSet(on) {
    const cur = (root.getAttribute('data-c194-hold') || '').split(/\s+/).filter(Boolean).filter((x) => x !== 'c42');
    if (on) cur.push('c42');
    attr('hold', 'data-c194-hold', cur.length ? cur.join(' ') : null);
    HOLD.on = on;
    clearTimeout(HOLD.capT); HOLD.capT = 0;
    if (on) HOLD.capT = setTimeout(() => holdSet(false), T.holdCap);
  }
  function holdPulse() {
    holdSet(true);
    cancelAnimationFrame(HOLD.f);
    HOLD.f = requestAnimationFrame(() => { HOLD.f = requestAnimationFrame(() => { HOLD.f = 0; holdSet(false); }); });
  }
  window.addEventListener('pagehide', () => { if (HOLD.on) holdSet(false); });

  /* ── 本文の表を見つける（フル DB のページの表だけ。ページの中の DB・ピークは対象外） ── */
  /* v1.1.0: 見えている本文の枠。読み込みの間、Notion は本文の枠を 2 つ持つことがあり（依頼主の 2026-10-13 の画面収録で公開の帯が 2 本並んだ）、
   *  最初の枠（見えていない方）の表にカードを付けて、見えている表は標準のままだった。ピークの外で、画面に見えている面積がいちばん大きい枠（同じなら後の物） */
  const FR = { max: 0 };
  function frame() {
    let one = null, list = null;
    for (const f of document.querySelectorAll('.notion-frame')) { if (f.closest('.notion-peek-renderer')) continue; if (!one) one = f; else (list || (list = [one])).push(f); }
    if (!list) return one;
    FR.max = Math.max(FR.max, list.length);
    let best = one, bs = -1;
    for (const f of list) {
      const r = f.getBoundingClientRect();
      const w = Math.min(r.right, innerWidth) - Math.max(r.left, 0), h = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      const sc = w > 0 && h > 0 && getComputedStyle(f).visibility !== 'hidden' ? w * h : 0;
      if (sc >= bs) { bs = sc; best = f; }
    }
    return best;
  }
  /* v1.2.0: 表の選び方。依頼主の 2026-10-14 の収録で、グループの終わりまでスクロールすると標準の表に戻り（索引帯も消え、Notion の固定の見出しが出た）、
   *  上へ戻すとカードに戻った。Notion は仮想化で、見えていない所の見出し行・タブの段を外したり、表の箱を描き直したりする。200 までは
   *  「最初の表で見出し行のある物」だけを選び、見出し行・タブが無いと外していた（推定。本物の DOM は見ていない）。今は:
   *   ・表の候補 = 本文の枠の中の見えている表（ページの中・ピーク・Notion の固定の写しは除く）。今カードにしている表がまだあればそれを、
   *     無ければ行（レコード）の多い物を選ぶ。見出し行は表の中 → Notion の固定の写し（.sticky-portal-target）→ 覚えている列の形 の順
   *   ・同じ DB の表が 2 つ以上あれば（グループごとに分かれた時）、どれにも印を付ける */
  const cands = (fr) => [...fr.querySelectorAll('.notion-table-view')].filter((tv) => !tv.closest('.notion-page-content, .notion-peek-renderer, .sticky-portal-target') && tv.getClientRects().length);
  const itemsOf = (tv) => tv.querySelectorAll('.notion-collection-item').length;
  function findTable() {
    const fr = frame();
    if (!fr) return { why: 'no-frame' };
    const list = cands(fr);
    if (!list.length) return { why: 'no-table', fr };
    let tv = S.tv && list.indexOf(S.tv) >= 0 ? S.tv : null;
    if (!tv) { let best = -1; for (const t of list) { const n = itemsOf(t) + (t.querySelector('.notion-table-view-header-row') ? 0.5 : 0); if (n > best) { best = n; tv = t; } } }
    let hr = tv.querySelector('.notion-table-view-header-row');
    let from = 'table';
    if (!hr) { const p = fr.querySelector('.sticky-portal-target .notion-table-view-header-row'); if (p) { hr = p; from = 'portal'; } }
    if (!hr) from = 'memory';
    const sc = tv.closest('.notion-scroller.vertical') || tv.closest('.notion-scroller') || fr.querySelector('.notion-scroller');
    const db = dbOf(tv);
    const all = list.filter((t) => t === tv || (db && dbOf(t) === db));
    return { tv, hr, from, fr, sc, all, H: (hr && hr.closest('.notion-scroller.horizontal')) || tv.closest('.notion-scroller.horizontal') || sc };
  }
  function dbOf(tv) {
    const b = tv.querySelector('.notion-collection_view_page-block[data-block-id]');
    const d = b ? id32(b.getAttribute('data-block-id')) : '';
    if (ID32.test(d)) return d;
    const m = location.pathname.match(/([0-9a-f]{32})(?:$|[/?#])/i) || location.pathname.match(/([0-9a-f]{32})/i);
    return m ? m[1].toLowerCase() : '';
  }
  const selTab = (fr) => fr && fr.querySelector('[role="tablist"] [role="tab"][aria-selected="true"]');
  /* v1.2.0: タブの段が外れている間（仮想化で）は、同じ表・同じ DB なら今のビューのまま（URL の v は、タブを押していないと付かない） */
  function viewOf(E) {
    const t = selTab(E.fr);
    const b = t && t.closest('[data-collection-view-id]');
    const v = b ? id32(b.getAttribute('data-collection-view-id')) : '';
    if (ID32.test(v)) return v;
    if (S.vid && (E.tv === S.tv || (S.db && dbOf(E.tv) === S.db))) { trail('tabs-missing'); return S.vid; }
    return id32(new URLSearchParams(location.search).get('v') || '');
  }
  const target = (db, vid) => ST.v.targets.find((t) => t.view === vid && (!t.db || !db || t.db === db)) || null;
  /* ³³ 198 までは自分で上下分割を当てる。一緒に動くと二重に組み替えるので、³³ が 199 より古い間はカードにしない（新旧を同時に有効にしない） */
  function partner() {
    try {
      const c = pageWin().__c33, v = c && c.version;
      const m = v ? String(v).match(/^(\d+)\./) : null;
      return m && +m[1] < 199 ? '³³ ' + v + ' が動いています。198 までの上下分割と重なるので、³³ を 199 以降にしてからカードにします' : '';
    } catch (e) { return ''; }
  }
  function wantOf(db, vid) {
    const t = vid ? target(db, vid) : null;
    if (!t) return { on: false, target: false, why: vid ? '' : 'ビュー ID が分かりません' };
    if (!ST.v.on) return { on: false, target: true, why: 'カードで読むを切っています' };
    const old = partner();
    if (old) { log('partner', old + '（__c42.status()）。'); return { on: false, target: true, why: old }; }
    if (ST.v.off[vid]) return { on: false, target: true, back: true, why: 'このビューは「表に戻す」にしています' };
    if (S.bad[vid]) return { on: false, target: true, why: S.bad[vid] };
    return { on: true, target: true, why: '' };
  }
  /* ³³ が表の倍率をはじめから 100% にできるように、カードにする予定のビューを公表する */
  function publishWant() {
    const list = ST.v.on ? ST.v.targets.map((t) => t.view).filter((v) => !ST.v.off[v] && !S.bad[v]) : [];
    const v = list.length ? list.join(' ') : null;
    if (v !== (root.getAttribute('data-c42-want'))) attr('', 'data-c42-want', v);
  }

  /* ── 列の形を読む（見出しのセルの名前・アイコン、行のセルの中身から列の役目） ── */
  const CB = ':is(.notion-table-view-row, .notion-table-view-row > *):has(> .notion-table-view-cell)';
  function headIcon(h) {
    const btn = h.querySelector('[data-popup-origin] [role="button"]') || h;
    const hidden = (el) => { for (let e = el; e && e !== h; e = e.parentElement) { const o = e.style ? e.style.opacity : ''; if (o !== '' && parseFloat(o) === 0) return true; } return false; };
    for (const el of btn.querySelectorAll('svg, [style*="mask"]')) {
      if (hidden(el)) continue;
      if (el.tagName.toLowerCase() === 'svg') {
        if (/dragHandle/i.test(el.getAttribute('class') || '')) continue;
        try {
          let s = el.outerHTML;
          if (s.length > 8000) continue;
          if (!/^<svg[^>]*\sxmlns=/.test(s)) s = s.replace(/^<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
          return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
        } catch (e) { continue; }
      }
      const u = getComputedStyle(el).webkitMaskImage || getComputedStyle(el).maskImage || '';
      if (/^url\(/.test(u)) return u;
    }
    return '';
  }
  function headName(h) {
    const btn = h.querySelector('[data-popup-origin] [role="button"]') || h.querySelector('[role="button"]') || h;
    return norm(btn.textContent).slice(0, 80);
  }
  const cbOf = (r) => (r.querySelector(':scope > .notion-table-view-cell') ? r : [...r.children].find((k) => k.querySelector(':scope > .notion-table-view-cell')) || null);
  const cellsOf = (r) => { const b = cbOf(r); return b ? [...b.children].filter((k) => k.classList.contains('notion-table-view-cell')) : []; };
  function readCols(E) {
    /* v1.2.0: 見出し行が無い間（仮想化で外れた・Notion の固定の写しにも無い）は、このビューで前に読んだ列の名前とアイコンを使う（行のセルの数が同じ時だけ） */
    let hcs = E.hr ? [...E.hr.querySelectorAll('.notion-table-view-header-cell')].filter((h) => h.closest('.notion-table-view-header-row') === E.hr) : [];
    const memo = S.vid && S.cm[S.vid];
    const all = [...E.tv.querySelectorAll('.notion-table-view-row')].filter((r) => !r.closest('.notion-table-view-header-row'));
    if (!hcs.length && memo) {
      const r0 = all.find((r) => cellsOf(r).length);
      if (!r0 || cellsOf(r0).length !== memo.cols.length) return { ok: false, why: '列の見出し行が見えず、行のセルの数も前と違います。標準の表のままです' };
      hcs = memo.cols.map(() => null);
    }
    if (!hcs.length) return { ok: false, why: '列の見出しのセルが見つかりません。標準の表のままです' };
    const rows = [];
    let skip = 0;
    for (const r of all) {
      if (rows.length >= T.sample) break;
      const cs = cellsOf(r);
      if (!cs.length || cs.length !== hcs.length || cs.length !== r.querySelectorAll('.notion-table-view-cell').length) { skip++; continue; }
      rows.push(cs);
    }
    if (!rows.length && skip) return { ok: false, why: '行のセルの形が列の見出し（' + hcs.length + ' 列）と合いません。標準の表のままです' };
    const cols = hcs[0] === null ? memo.cols.map((c) => Object.assign({}, c)) : hcs.map((h) => ({ name: headName(h), ic: headIcon(h) }));
    if (S.vid && hcs[0] !== null) S.cm[S.vid] = { cols: cols.map((c) => Object.assign({}, c)) };
    /* v1.1.0: 配置で覚えるための列の名前（同じ名前が 2 つあれば「名前 #2」。名前の無い列は「#3」） */
    const cnt = {};
    const keys = cols.map((c, i) => { const n = c.name || ('#' + (i + 1)); cnt[n] = (cnt[n] || 0) + 1; return cnt[n] > 1 ? n + ' #' + cnt[n] : n; });
    const N = hcs.length;
    const img = new Array(N).fill(0), ico = new Array(N).fill(0), pri = new Array(N).fill(0), seenN = new Array(N).fill(0), sum = new Array(N).fill(0), max = new Array(N).fill(0);
    for (const cs of rows) cs.forEach((k, i) => {
      if (k.hasAttribute('data-c12-primary') || k.querySelector('[data-c12-primary]')) pri[i]++;
      if (k.querySelector('[data-c34]') || [...k.querySelectorAll('img')].some((m) => !m.closest('.notion-record-icon'))) img[i]++;
      if (k.querySelector('.notion-record-icon[role="button"]')) ico[i]++;
      const t = norm(k.textContent || '').length;
      if (t) { seenN[i]++; sum[i] += t; if (t > max[i]) max[i] = t; }
    });
    let cover = -1, hb = 0;
    img.forEach((v, i) => { if (v > hb) { hb = v; cover = i; } });
    let title = -1, tb = 0;
    pri.forEach((v, i) => { if (i !== cover && v > tb && v >= rows.length * 0.5) { tb = v; title = i; } });
    if (title < 0) ico.forEach((v, i) => { if (i !== cover && v > tb && v >= rows.length * 0.5) { tb = v; title = i; } });
    /* v1.2.0: Books 以外の DB（題字の印もページのアイコンも無い）では、表のいちばん左の列を題字に（Notion の表は名前の列が左端にある形が既定） */
    if (title < 0 && rows.length) { const f = cover === 0 ? 1 : 0; if (f < N) title = f; }
    let long = [];
    for (let i = 0; i < N; i++) if (i !== cover && i !== title && (max[i] > T.longMax || (seenN[i] && sum[i] / seenN[i] > T.longAvg))) long.push(i);
    /* 仮想化で、表紙のある行や長い字の行が今は描かれていないだけのことがある。同じ列の並びなら、一度分かった役目はそのまま */
    const sig = cols.map((c) => c.name).join('\u0001');
    const m = S.mem[S.vid];
    if (m && m.sig === sig) {
      if (cover < 0 && m.cover >= 0) cover = m.cover;
      if (title < 0 && m.title >= 0 && m.title !== cover) title = m.title;
      for (const i of m.long) if (long.indexOf(i) < 0 && i !== cover && i !== title) long.push(i);
    }
    long = long.filter((i) => i !== cover && i !== title).sort((a, b) => a - b);
    if (S.vid) S.mem[S.vid] = { sig, cover, title, long: long.slice() };
    const shorts = [];
    for (let i = 0; i < N; i++) if (i !== cover && i !== title && long.indexOf(i) < 0) shorts.push(i);
    return { ok: true, cols, keys, cover, title, long, shorts, rows: rows.length, skip };
  }

  /* ── 組み方の計画: 列の数と、列ごとの置き場所（段を跨がせない）。v1.1.0: ビューの配置（並び・幅・隠す・表紙・列の数・小見出し）を読む ── */
  const layoutOf = (vid) => (vid && ST.v.layouts && ST.v.layouts[vid]) || {};
  const coverOf = (L) => (L.cover === 0 ? 0 : (T.covers.indexOf(L.cover) >= 0 ? L.cover : ST.v.cover));
  /* 置く: 横いっぱいの物は新しい段から 1 段を占め、ほかは左から右へ K 列で折り返す */
  function place(vis, wide, K, c0) {
    const pos = {};
    let r = 1, x = 0;
    for (const i of vis) {
      if (wide(i)) { if (x) { r++; x = 0; } pos[i] = [c0 + ' / -1', String(r)]; r++; }
      else { pos[i] = [(c0 + x) + ' / span 1', String(r)]; if (++x >= K) { x = 0; r++; } }
    }
    if (x) r++;
    return { pos, rows: Math.max(1, r - 1) };
  }
  function plan(info, W, over) {
    const L = Object.assign({}, layoutOf(S.vid), over || {});
    const keys = info.keys;
    const hideOf = (i) => !!(L.hide && L.hide[keys[i]] === 1);
    const wideOf = (i) => (L.wide && Object.prototype.hasOwnProperty.call(L.wide, keys[i]) ? L.wide[keys[i]] === 1 : (i === info.title || info.long.indexOf(i) >= 0));
    const ch = coverOf(L);
    const cv = info.cover >= 0 && ch > 0;
    const cw = Math.round(ch * T.coverW);
    const auto = [];
    if (info.title >= 0) auto.push(info.title);
    for (const i of info.shorts) auto.push(i);
    for (const i of info.long) auto.push(i);
    const at = new Map(keys.map((k, i) => [k, i]));
    const order = [];
    for (const k of (L.order || [])) { const i = at.get(k); if (i != null && i !== info.cover && order.indexOf(i) < 0) order.push(i); }
    for (const i of auto) if (order.indexOf(i) < 0) order.push(i);
    const vis = order.filter((i) => !hideOf(i));
    const hidden = order.filter(hideOf);
    const narrow = vis.filter((i) => !wideOf(i)).length;
    const A = Math.max(0, W - 2 * T.padX - 2 - (cv ? cw + T.gap : 0));
    const autoK = Math.floor((A + T.gap) / (T.minCol + T.gap));
    /* 自動の時は、1 列の項目の数より多くは割らない（2 つしか無いのに 4 つに割らない）。ただし 2 列までは残す（1 列の項目が 1 つだけでも横いっぱいにしない） */
    let K = L.cols >= 1 ? L.cols : Math.min(autoK, Math.max(2, narrow));
    K = Math.max(1, Math.min(T.maxCol, K));
    const c0 = cv ? 2 : 1;
    const P = place(vis, wideOf, K, c0);
    const cols = (cv ? 'var(--c42-cw) ' : '') + 'repeat(' + K + ', minmax(0, 1fr))';
    return { K, cw, ch, cv, c0, pos: P.pos, rows: P.rows, cols, order, vis, hidden, wideOf, labels: L.labels !== false, colsSet: L.cols >= 1 ? L.cols : 0, coverSet: L.cover == null ? null : L.cover };
  }

  /* ── CSS ── */
  const S42 = 'html' + ':not(#c42a):not(#c42b):not(#c42c):not(#c42d):not(#c42e):not(#c42f):not(#c42g):not(#c42h):not(#c42i):not(#c42j)';
  const TV = S42 + ' .notion-frame .notion-table-view[data-c42-cards]';
  const SERIF = 'var(--c164-serif, "EB Garamond", "Cormorant Garamond", Georgia, "Times New Roman", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif)';
  const INK2 = 'var(--c194-ink2, var(--c-texSec, rgba(55, 53, 47, .65)))';
  const cssStr = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\A ') + '"';
  const CELL = TV + ' ' + CB + ' > .notion-table-view-cell';
  const CELL_E = S42 + '[data-c42-edit] .notion-frame .notion-table-view[data-c42-cards] ' + CB + ' > .notion-table-view-cell';   // 配置の編集の間
  const BASE = `
/* ⁴² Record Cards ${VERSION}: カードの間だけ（表の箱の data-c42-cards）。色は Notion の変数から（明るい・暗いの両方） */
${TV} { --c42-paper: var(--c-bacEle, var(--c-bacPri, #fff)); --c42-edge: color-mix(in srgb, var(--c-texPri, #37352f) 11%, transparent); --c42-edge2: color-mix(in srgb, var(--c-texPri, #37352f) 22%, transparent);
  --c42-tint: color-mix(in srgb, var(--c-texPri, #37352f) 3%, transparent); --c42-acc: var(--c194-acc, #2383e2); --c42-sh: rgba(15, 15, 15, .16);
  --c42-ink: var(--c-texPri, #37352f); --c42-hi: color-mix(in srgb, #fff 7%, var(--c42-paper)); --c42-page: var(--c-bacPri, var(--c42-paper));
  --c42-pan: color-mix(in srgb, var(--c42-acc) 10%, transparent); --c42-pan2: color-mix(in srgb, var(--c-texPri, #37352f) 7%, var(--c42-paper)); --c42-mer: var(--c42-edge2); }
@property --c42-mer { syntax: "<color>"; inherits: true; initial-value: transparent; }
/* 列の見出しは隠す（「列の見出し」で出す）。v1.1.0: 見出し行の外側の台（<div style="height: 36px;">）ごと畳む — 残すとグループの見出しと最初のカードの間が 36px 空く */
${TV}:not([data-c42-cols]) .notion-table-view-header-row { display: none !important; }
${TV}:not([data-c42-cols]) div[style^="height: "]:has(> * .notion-table-view-header-row):not(:has(.notion-collection-item)) { display: none !important; }
${S42}[data-c194-split]:not([data-c42-cols]) .notion-frame .sticky-portal-target .notion-table-view-header-row { display: none !important; }
/* v1.2.0: Notion の固定の写し（スクロールした時に上に出るグループの見出しと列の見出し）も、カードの間は見せない（場所は残す） */
${S42}[data-c194-split]:not([data-c42-cols]) .notion-frame .sticky-portal-target > :has(.notion-table-view-header-row) { visibility: hidden !important; pointer-events: none !important; }
/* 行 = カードの外側（カードの間のすき間）。本物の行は直書きの flex: 0 0 fit-content（幅は flex-basis が決める） */
${TV} .notion-table-view-row { height: auto !important; min-height: 0 !important; max-height: none !important; width: var(--c42-w, auto) !important; max-width: none !important;
  flex: 0 0 var(--c42-w, auto) !important; box-sizing: border-box !important; padding: 40px 0 14px !important; border-bottom: 0 !important; background-image: none !important; }
/* 行の兄弟の空の箱 2 つ（Notion の行の下線）は幅 0（中身は空・消さない） */
${TV} .notion-collection-item > .notion-table-view-row ~ * { flex: 0 0 0px !important; width: 0 !important; min-width: 0 !important; overflow: hidden !important; border: 0 !important; }
${TV} .notion-table-view-row:not(:has(> .notion-table-view-cell)) > :not(:has(> .notion-table-view-cell)) { flex: 0 0 0px !important; width: 0 !important; min-width: 0 !important; overflow: hidden !important; }
/* セルの箱（行そのもの、または行の直下でセルを持つ箱）= 1 枚の紙。中は格子。チェックボックスの箱は 1 段目に幅 0 で（位置は Notion のまま） */
${TV} ${CB} { display: grid !important; grid-template-columns: minmax(0, 1fr) !important; grid-auto-flow: row !important; align-items: start !important; column-gap: ${T.gap}px !important; row-gap: 0 !important;
  flex: 1 1 auto !important; min-width: 0 !important; height: auto !important; min-height: 0 !important; max-height: none !important; box-sizing: border-box !important; position: relative !important; isolation: isolate !important;
  padding: 34px ${T.padX}px 16px !important; border-radius: 28px !important;
  background: radial-gradient(90% 120% at 0% 0%, var(--c42-pan), transparent 55%), var(--c42-paper) !important;
  box-shadow: 0 0 0 1px var(--c42-edge), 0 1px 1px rgba(15, 15, 15, .03), 0 22px 46px -32px var(--c42-sh), 0 60px 90px -66px var(--c42-sh) !important;
  transition: box-shadow .5s ${EASE}, transform .5s ${EASE} !important; }
${TV} ${CB}:hover { transform: translateY(-3px) !important; box-shadow: 0 0 0 1px var(--c42-edge2), 0 2px 4px rgba(15, 15, 15, .04), 0 30px 56px -32px rgba(15, 15, 15, .3), 0 70px 110px -64px rgba(15, 15, 15, .32) !important; }
/* v1.4.0 子午線: 表紙と項目の境の縦の細線（Orbit・Catalogus の子午線と同じ作り。上下は薄れて消える）。乗せると色づく */
${TV} ${CB}::before { content: "" !important; position: absolute !important; top: 22px; bottom: 22px; inset-inline-start: var(--c42-pw, 0px); width: 1px; z-index: 0; pointer-events: none;
  background: linear-gradient(180deg, transparent, var(--c42-mer) 18%, var(--c42-mer) 82%, transparent); transition: --c42-mer .5s ${EASE}; }
/* v1.4.0 子午線の上の菱形（題字の高さ。Catalogus の継ぎ目の菱形と同じ） */
${TV} ${CB}::after { content: "" !important; position: absolute !important; top: 47px; inset-inline-start: calc(var(--c42-pw, 0px) - 3.5px); width: 8px; height: 8px; z-index: 2; pointer-events: none;
  border-radius: 1.5px; transform: rotate(45deg); background: var(--c42-acc); opacity: .7; box-shadow: 0 0 0 3px var(--c42-paper); transition: opacity .4s ${EASE}, box-shadow .5s ${EASE}; }
${TV} ${CB}:hover { --c42-mer: color-mix(in srgb, var(--c42-acc) 60%, transparent); }
${TV} ${CB}:hover::after { opacity: 1; box-shadow: 0 0 0 3px var(--c42-paper), 0 0 12px 2px color-mix(in srgb, var(--c42-acc) 45%, transparent); }
${TV} ${CB} > :not(.notion-table-view-cell) { grid-column: 1 / -1 !important; grid-row: 1 !important; width: 0 !important; min-width: 0 !important; height: 0 !important; align-self: start !important; }
${CELL} { display: block !important; position: relative !important; z-index: 1 !important; grid-column: -2 / -1 !important; flex: none !important; width: auto !important; min-width: 0 !important;
  height: auto !important; min-height: 0 !important; max-height: none !important; padding: 0 !important; margin: 0 0 16px !important; border: 0 !important; overflow: hidden !important; white-space: normal !important; }
/* セルの最初の子は Notion の列の幅の箱（直書きの width）。カードの間は段の幅に合わせる */
${CELL} > div { width: auto !important; min-width: 0 !important; max-width: 100% !important; height: auto !important; }
/* 値の箱: 空でも押せるように最低の高さを残す（押すと Notion の編集）。字は小見出しの線にそろえる */
${CELL} [data-testid="property-value"] { min-height: 26px !important; height: auto !important; padding: 2px 0 !important; box-sizing: border-box !important; }
${CELL} * { max-height: none !important; -webkit-line-clamp: unset !important; line-clamp: none !important; white-space: normal !important; text-overflow: clip !important; }
/* 小見出し（実際のプロパティの名前とアイコン。大文字は表示だけ） */
${CELL}::before { content: ""; display: block; margin: 0 0 6px; padding-inline-start: 17px; box-sizing: border-box;
  font: 600 9px/14px ${SERIF}; letter-spacing: .24em; text-transform: uppercase; color: ${INK2}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
${CELL}::after { content: ""; position: absolute; left: 0; top: 1.5px; width: 11px; height: 11px; background-color: ${INK2}; opacity: .85;
  -webkit-mask: none center / contain no-repeat; mask: none center / contain no-repeat; pointer-events: none; }
/* v1.1.0 配置の編集の間: どのセルも点線で囲み、押すとその項目の札を選ぶ（Notion の編集は開かない） */
${CELL_E} { outline: 1px dashed color-mix(in srgb, var(--c42-acc) 42%, transparent) !important; outline-offset: 4px !important; border-radius: 3px !important; cursor: pointer !important; }
${CELL_E} * { cursor: pointer !important; }
/* v1.1.0 動き: カードにした時、見えている行が下から順にふわっと出る（当てた直後の短い間だけ。後から描かれた行は動かさない） */
/* 縦にだけ動かす（横に縮めると行の左端が動き、³³ が説明の左端を合わせる時に測る行の左が数 px ずれる） */
@keyframes c42-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes c42-pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--c42-acc) 45%, transparent); } 100% { box-shadow: 0 0 0 10px transparent; } }
${TV}[data-c42-in] .notion-collection-result-wrapper > .notion-collection-item { animation: c42-rise ${T.rise}ms ${EASE} both; }
${[2, 3, 4, 5, 6, 7, 8].map((n) => `${TV}[data-c42-in] .notion-collection-result-wrapper:nth-child(${n}) > .notion-collection-item { animation-delay: ${(n - 1) * T.stagger}ms; }`).join('\n')}
/* v1.2.0 スクロールで初めて描かれたカード（data-c42-new は ⁴² が 0.9 秒だけ付ける） */
${TV} .notion-collection-item[data-c42-new] { animation: c42-rise 560ms ${EASE} both; animation-delay: var(--c42-d, 0ms); }
/* v1.4.0: グループの見出しの見た目は ³³ 203 が DB ぜんぶに描く（Catalogus の作り）。⁴² からは外した */
/* v1.2.0 Notion の行のつまみ（⋮⋮）を寄せる（見た目の位置だけ。⁴² がカードに乗せた時に探して印を付ける）。v1.3.0: 寄せる先はカードの左の外 */
${S42}[data-c194-split] [data-c42-grip] { translate: var(--c42-gx, 0px) var(--c42-gy, 0px) !important; z-index: 96 !important; opacity: 1 !important; visibility: visible !important;
  border-radius: 6px !important; background-color: var(--c-bacEle, var(--c-bacPri, #fff)) !important; box-shadow: 0 0 0 1px color-mix(in srgb, var(--c-texPri, #37352f) 14%, transparent), 0 4px 12px -5px rgba(15, 15, 15, .3) !important;
  cursor: grab !important; animation: c42-grip .35s ${EASE} both; transition: box-shadow .25s ${EASE} !important; }
${S42}[data-c194-split] [data-c42-grip]:hover { box-shadow: 0 0 0 1px color-mix(in srgb, var(--c194-acc, #2383e2) 60%, transparent), 0 6px 16px -6px rgba(15, 15, 15, .35) !important; }
@keyframes c42-grip { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: none; } }
/* v1.4.0 つまみの置き場所の目印（カードの左の外・いつも見える淡い ⋮⋮）。乗せると Notion の本物のつまみが同じ所に来て、目印は消える。目印は押せない（見た目だけ） */
${TV} .notion-collection-item { position: relative; }
${TV} .notion-collection-item::after { content: ""; position: absolute; left: -26px; top: 58px; width: 18px; height: 24px; border-radius: 6px; pointer-events: none; z-index: 1;
  background: radial-gradient(circle, var(--c42-edge2) 1.3px, transparent 1.7px) 3px 4px / 6px 6px; box-shadow: inset 0 0 0 1px var(--c42-edge); opacity: .9; transition: opacity .25s ${EASE}; }
${TV} .notion-collection-item:hover::after { opacity: 0; }
/* v1.4.0 チェックボックスはつまみの下（カードの左の外）へ。位置は ⁴² が測って --c42-kx/ky に書く（見た目の位置だけ） */
${TV} [data-c42-chk] { translate: var(--c42-kx, 0px) var(--c42-ky, 0px) !important; overflow: visible !important; z-index: 3 !important; }
@media (prefers-reduced-motion: reduce) {
  ${TV}[data-c42-in] .notion-collection-result-wrapper > .notion-collection-item, ${TV} .notion-collection-item[data-c42-new], ${S42} [data-c42-grip] { animation: none !important; }
  ${TV} ${CB}, ${TV} ${CB}::before, ${TV} ${CB}::after, ${CELL} img { transition: none !important; }
  ${TV} ${CB}:hover { transform: none !important; }
}
`;
  function rules(info, P) {
    const Q = (k) => CELL + ':nth-child(' + (k + 1) + ' of .notion-table-view-cell)';
    const QH = (k) => TV + ' ' + CB + ':hover > .notion-table-view-cell:nth-child(' + (k + 1) + ' of .notion-table-view-cell)';
    const out = [];
    out.push(TV + ' { --c42-w: ' + S.W + 'px; --c42-cover: ' + (P.ch || ST.v.cover) + 'px; --c42-cw: ' + P.cw + 'px; --c42-pw: ' + (P.cv ? T.padX + P.cw + Math.round(T.gap / 2) : 0) + 'px; }');
    if (!P.cv) out.push(TV + ' ' + CB + '::before, ' + TV + ' ' + CB + '::after { content: none !important; }');   // v1.4.0: 表紙が無い時は子午線も菱形も無し
    out.push(TV + ' ' + CB + ' { grid-template-columns: ' + P.cols + ' !important; grid-template-rows: repeat(' + P.rows + ', auto) minmax(0, 1fr) !important; }');
    info.cols.forEach((c, k) => {
      if (k === info.cover) return;
      if (!P.labels || k === info.title) { out.push(Q(k) + '::before, ' + Q(k) + '::after { content: none !important; }'); return; }
      out.push(Q(k) + '::before { content: ' + cssStr(c.name) + '; }');
      out.push(c.ic ? Q(k) + '::after { -webkit-mask-image: ' + c.ic + '; mask-image: ' + c.ic + '; }' : Q(k) + '::after { content: none; } ' + Q(k) + '::before { padding-inline-start: 0; }');
    });
    for (const k of Object.keys(P.pos)) out.push(Q(+k) + ' { grid-column: ' + P.pos[k][0] + ' !important; grid-row: ' + P.pos[k][1] + ' !important; }');
    for (const k of P.hidden) out.push(Q(k) + ' { display: none !important; }');
    /* 長い字（あらすじなど）: 行の間を広く、左に淡い色の筋（引用のように） */
    for (const k of info.long) {
      out.push(Q(k) + ' [data-testid="property-value"], ' + Q(k) + ' [data-testid="property-value"] :is(div, span) { line-height: 1.85 !important; }');
      out.push(Q(k) + ' [data-testid="property-value"] { color: color-mix(in srgb, var(--c42-ink) 84%, transparent) !important; }');   // v1.3.0: 左の筋はやめ、行の間で読ませる
    }
    if (info.title >= 0) {
      const Tt = Q(info.title), PV = Tt + ' [data-testid="property-value"]';
      /* 題字: 大きく太く、下に細い区切り。字の大きさは span に（²⁶ Atelier の題字の指定が span に直接当たるため）。書体は Atelier のまま */
      /* 区切りの線は題字がいちばん上の時だけ（配置で下へ移した時は、ほかの項目と同じ間） */
      out.push(Tt + ' { overflow: visible !important; }' + (P.vis[0] === info.title ? ' ' + Tt + ' { padding-bottom: 14px !important; margin-bottom: 18px !important; border-bottom: 0 !important;'
        + ' background: linear-gradient(var(--c42-acc), var(--c42-acc)) 0 100% / 28px 2px no-repeat, linear-gradient(90deg, var(--c42-edge2), var(--c42-edge) 45%, transparent) 36px 100% / calc(100% - 36px) 1px no-repeat !important; }' : ''));
      out.push(PV + ' { font-size: 26px !important; line-height: 1.2 !important; min-height: 34px !important; padding: 0 !important; color: var(--c42-ink) !important; }');
      out.push(PV + ' span { font-size: inherit !important; line-height: inherit !important; font-weight: 700 !important; letter-spacing: .005em !important; }');
      /* 題字のアイコンと字を同じ高さに（Notion の箱は上ぞろえ。字の大きさが変わると字だけ下がっていた） */
      out.push(PV + ' > div:not([style*="absolute"]):not(:has(> .quickActionContainer)) { align-items: center !important; }');
      out.push(PV + ' .notion-record-icon { margin-top: 0 !important; margin-bottom: 0 !important; }');
      /* 1.4.0: アイコンの箱は字の行（26px × 1.2）の高さのまま上に寄っていたので、箱の中でも上下の真ん中に */
      out.push(PV + ' > div > div:has(> .notion-record-icon) { display: flex !important; align-items: center !important; }');
    }
    if (info.cover >= 0) {
      const C = Q(info.cover), CH = QH(info.cover), c = info.cols[info.cover];
      if (!P.cv) out.push(C + ' { display: none !important; }');
      else {
        out.push(C + ' { grid-column: 1 / 2 !important; grid-row: 1 / -1 !important; justify-self: stretch !important; align-self: start !important; margin: -58px 0 16px !important; overflow: visible !important; }');   // v1.4.0: 表紙は紙の上へ 24px 飛び出す
        /* 中の箱の幅は Notion のまま（width: 100% の包み）。auto にすると flex の中で空の時に幅 0 になり、表紙の無い行で押せなかった */
        out.push(C + ' :is(div, a, span) { min-width: 0 !important; max-width: 100% !important; height: auto !important; min-height: 0 !important; overflow: visible !important; }');
        out.push(C + ' [data-testid="property-value"] { padding: 0 !important; display: block !important; width: 100% !important; }');
        out.push(C + ' div:has(> img) { display: flex !important; flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; position: relative !important; }');
        /* 本の背の光（絵の左の細い帯。絵は変えない・押せる所も変えない） */
        out.push(C + ' div:has(> img):not(:has(> img ~ img))::after { content: ""; position: absolute; left: 0; top: 0; width: 12px; height: min(100%, var(--c42-cover)); border-radius: 3px 0 0 3px; pointer-events: none;'
          + ' background: linear-gradient(90deg, rgba(0, 0, 0, .16), rgba(255, 255, 255, .16) 45%, rgba(0, 0, 0, .04) 70%, transparent); transition: transform .45s ' + EASE + '; }');
        out.push(CH + ' div:has(> img):not(:has(> img ~ img))::after { transform: translateY(-6px); }');
        /* 表紙の箱 = 絵の大きさ（幅 = 列の幅と 高さ × ³⁴ の縦横比 の小さい方・高さは比から）。灰色の地（³⁴ の読み込み中の地）は敷かない。³⁴ の opacity の動きは残す */
        out.push(C + ' img { display: block !important; width: min(100%, calc(var(--c42-cover) * var(--c34-ar, ' + T.coverW + '))) !important; height: auto !important; max-width: 100% !important;'
          + ' max-height: var(--c42-cover) !important; aspect-ratio: auto var(--c34-ar, ' + T.coverW + ') !important; object-fit: contain !important; object-position: left top !important; background: none !important;'
          + ' border-radius: 3px 7px 7px 3px !important; transform-origin: 50% 100%; box-shadow: 0 0 0 1px rgba(15, 15, 15, .06), 0 3px 6px rgba(15, 15, 15, .1), 0 26px 40px -18px rgba(15, 15, 15, .5) !important;'
          + ' transition: opacity .2s ease, transform .45s ' + EASE + ', box-shadow .45s ' + EASE + ' !important; }');
        out.push(CH + ' img { transform: translateY(-6px) !important; box-shadow: 0 0 0 1px rgba(15, 15, 15, .06), 0 4px 8px rgba(15, 15, 15, .1), 0 22px 34px -14px rgba(15, 15, 15, .45) !important; }');
        out.push(C + ':has(img)::before, ' + C + ':has(img)::after { content: none !important; }');
        /* 表紙の無い行: カードの高さいっぱいの点線の枠（列のアイコンと名前。押すと Notion の画像の追加）。枠は値の箱そのもの */
        const E = C + ':not(:has(img))';
        out.push(E + ' { align-self: stretch !important; display: flex !important; flex-direction: column !important; min-height: 136px !important; }');
        out.push(E + ' > div, ' + E + ' .notion-page-block { flex: 1 1 auto !important; display: flex !important; height: auto !important; width: 100% !important; }');
        out.push(E + ' [data-testid="property-value"] { flex: 1 1 auto !important; min-height: 136px !important; box-sizing: border-box !important; border-radius: 3px 8px 8px 3px !important;'
          + ' border: 1px dashed var(--c42-edge2) !important; background: repeating-linear-gradient(135deg, var(--c42-tint) 0 7px, transparent 7px 14px) !important; transition: border-color .3s ' + EASE + ', background-color .3s ' + EASE + ' !important; }');
        out.push(CH + ':not(:has(img)) [data-testid="property-value"] { border-color: color-mix(in srgb, var(--c42-acc) 55%, transparent) !important; background: color-mix(in srgb, var(--c42-acc) 5%, transparent) !important; }');
        out.push(E + '::before { content: ' + cssStr(c.name) + ' !important; position: absolute !important; left: 0; right: 0; top: calc(50% + 12px); margin: 0 !important; padding: 0 6px !important; text-align: center; pointer-events: none; }');
        out.push(c.ic ? E + '::after { content: "" !important; left: 50% !important; top: 50% !important; width: 24px !important; height: 24px !important; transform: translate(-50%, -80%); opacity: .5 !important; -webkit-mask-image: ' + c.ic + '; mask-image: ' + c.ic + '; }' : E + '::after { content: none !important; }');
      }
    }
    return out.join('\n');
  }
  function css(id, text) {
    let st = document.getElementById(id);
    if (!text) { if (st) st.textContent = ''; return; }
    if (!st) { st = document.createElement('style'); st.id = id; (document.head || root).appendChild(st); }
    if (st.textContent !== text) st.textContent = text;
  }

  /* ── 幅: 行の左から、見えている本文の右まで（横に流さずに読める）。表の倍率の中では CSS px に直す ── */
  function widthOf(E) {
    const tv = E.tv;
    const r0 = tv.querySelector('.notion-table-view-row:not(.notion-table-view-header-row)');
    const pis = parseFloat(getComputedStyle(tv).paddingInlineStart) || 0, pie = parseFloat(getComputedStyle(tv).paddingInlineEnd) || 0;
    const x0 = r0 ? r0.getBoundingClientRect().left : tv.getBoundingClientRect().left + pis;
    const right = Math.min((E.H || E.sc).getBoundingClientRect().right, E.sc.getBoundingClientRect().right) - pie;
    const zf = tv.offsetWidth ? tv.getBoundingClientRect().width / tv.offsetWidth : 1;
    return Math.max(360, Math.round((right - x0) / (zf || 1)));
  }

  /* ── 動き（新しく足した物だけ） ── */
  /* 配置を変えた時: 見えているセルの位置を覚えて、変えた後の位置から前の位置へ transform で戻して滑らせる（FLIP。レイアウトは動かさない） */
  function flipCards(run) {
    const tv = S.tv;
    if (reduced() || !tv || !tv.isConnected || typeof Element.prototype.animate !== 'function') { run(); return; }
    const H = innerHeight;
    const inView = (r) => r.width > 0 && r.bottom > -60 && r.top < H + 60;
    const before = new Map();
    for (const c of tv.querySelectorAll('.notion-table-view-cell')) { const r = c.getBoundingClientRect(); if (inView(r)) before.set(c, r); if (before.size > 160) break; }
    run();
    const t = S.tv;
    if (!t) return;
    let n = 0;
    for (const c of t.querySelectorAll('.notion-table-view-cell')) {
      const b = c.getBoundingClientRect();
      if (!inView(b)) continue;
      if (++n > 160) break;
      const a = before.get(c);
      try {
        if (!a) c.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: T.flip, easing: EASE });
        else {
          const dx = a.left - b.left, dy = a.top - b.top;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
          c.animate([{ transform: 'translate(' + dx + 'px, ' + dy + 'px)' }, { transform: 'none' }], { duration: T.flip, easing: EASE });
        }
      } catch (e) { /* noop */ }
    }
  }
  function riseOn(tv) {
    if (reduced() || !tv) return;
    clearTimeout(S.inT);
    tv.setAttribute('data-c42-in', '');
    S.inT = setTimeout(() => { S.inT = 0; if (tv.isConnected) tv.removeAttribute('data-c42-in'); }, T.inFor);
  }
  function fadeIn(tv) {
    if (reduced() || !tv || !tv.isConnected || typeof tv.animate !== 'function') return;
    try { tv.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: T.fade, easing: EASE }); } catch (e) { /* noop */ }
  }

  /* ── 当てる・外す ── */
  function off(why) {
    const was = S.on;
    if (was) trail('off:' + (why || ''));
    S.lostAt = 0; S.all = [];
    for (const el of document.querySelectorAll('[data-c42-cards]')) { el.removeAttribute('data-c42-cards'); el.removeAttribute('data-c42-cols'); el.removeAttribute('data-c42-in'); }
    if (root.hasAttribute('data-c194-split')) { holdPulse(); attr('split', 'data-c194-split', null); }
    if (root.hasAttribute('data-c42-cols')) attr('', 'data-c42-cols', null);
    css('c42-view', ''); css('c42-hl', '');
    clearTimeout(S.chkT); S.chkT = 0;
    S.on = false; S.tv = null; S.css = ''; S.why = why || '';
    if (was) { emit('c42:state', { on: false, view: S.vid, why: S.why }); emit('c194:rowlayout', { src: 'c42', why: 'off' }); }
  }
  function backFlag(vid) { if ((root.getAttribute('data-c42-back') || null) !== (vid || null)) attr('', 'data-c42-back', vid || null); }
  /* v1.2.0: 見直しの記録（__c42.status().trail）。本物で何が起きて外れたかを、DOM を見られない時の手がかりにする */
  function trail(what) {
    const last = S.trail[S.trail.length - 1];
    const sc = S.sc ? Math.round(S.sc.scrollTop) : null;
    if (last && last.what === what) { last.n++; last.t = Math.round(performance.now()); last.top = sc; return; }
    S.trail.push({ t: Math.round(performance.now()), what, top: sc, n: 1 });
    if (S.trail.length > 24) S.trail.shift();
  }
  /* v1.2.0: カードにしている間に表が一瞬見えなくなった（仮想化・描き直し）時は、すぐには外さない（T.grace の間に戻れば何もしない） */
  function lost(why) {
    trail('lost:' + why);
    if (S.tv && S.tv.isConnected && S.tv.getClientRects().length) return true;   // 今の表がまだ見えている（別の判定だけが揺れた）
    if (!S.lostAt) S.lostAt = performance.now();
    if (performance.now() - S.lostAt < T.grace) { clearTimeout(S.lostT); S.lostT = setTimeout(soon, 160); return true; }
    return false;
  }
  function markAll(E, vid) {
    for (const el of document.querySelectorAll('[data-c42-cards]')) if (E.all.indexOf(el) < 0) { el.removeAttribute('data-c42-cards'); el.removeAttribute('data-c42-cols'); el.removeAttribute('data-c42-in'); }   // 前の表（見えなくなった枠の表）の印は外す
    for (const t of E.all) {
      if (!t.hasAttribute('data-c42-cards')) t.setAttribute('data-c42-cards', '');
      if (t.hasAttribute('data-c42-cols') !== S.cols) t.toggleAttribute('data-c42-cols', S.cols);
    }
    if ((root.getAttribute('data-c42-cols') || null) !== (S.cols ? vid : null)) { holdPulse(); attr('', 'data-c42-cols', S.cols ? vid : null); }
  }
  function sync() {
    S.n++;
    publishWant();
    const E = findTable();
    if (!E.tv) {
      if (S.on && lost(E.why)) { edSync(); return; }
      backFlag(null); if (S.on) off(E.why); else S.why = E.why; edSync(); return;
    }
    const db = dbOf(E.tv), vid = viewOf(E);
    if (vid !== S.vid) { S.cols = false; }
    S.db = db; S.vid = vid;
    const w = wantOf(db, vid);
    backFlag(w.back ? vid : null);
    if (!w.on) { if (S.on || E.tv.hasAttribute('data-c42-cards')) off(w.why); else S.why = w.why; edSync(); return; }
    const info = readCols(E);
    if (!info.ok) {
      if (S.on && S.info && E.tv === S.tv && lost('cols')) { markAll(E, vid); edSync(); return; }
      off(info.why); edSync(); return;
    }
    S.lostAt = 0;
    if (E.from !== 'table') trail('head:' + E.from);
    S.W = widthOf(E);
    const L = plan(info, S.W);
    const text = rules(info, L);
    const fresh = !S.on || S.tv !== E.tv || !E.tv.hasAttribute('data-c42-cards') || root.getAttribute('data-c194-split') !== vid;
    if (fresh || text !== S.css) {
      holdPulse();
      attr('split', 'data-c194-split', vid);   // 先に公表してから組み替える（⁰⁵ は自分の補正を外す）
      css('c42-view', text);
      S.css = text;
    }
    const was = S.tv;
    markAll(E, vid);
    S.tv = E.tv; S.all = E.all; S.info = info; S.L = L; S.why = '';
    if (S.ro && S.sc !== E.sc) { try { if (S.sc) S.ro.unobserve(S.sc); S.ro.observe(E.sc); } catch (e) { /* noop */ } S.sc = E.sc; }
    if (fresh) {
      /* 描き直しで表の箱だけが替わった時（同じビューのまま）は、出てくる動きを当て直さない（スクロールの途中でカードが出直さない） */
      const redraw = S.on && was && was !== E.tv && S.lastVid === vid;
      S.on = true; S.at = performance.now(); S.lastVid = vid;
      trail(redraw ? 'redraw' : 'on');
      for (const t of E.all) for (const it of t.querySelectorAll('.notion-collection-item')) { const id = it.getAttribute('data-block-id'); if (id) SEEN.add(id); }
      if (!redraw) riseOn(E.tv);
      emit('c42:state', { on: true, view: vid, cols: S.cols, edit: ED.open });
      emit('c194:rowlayout', { src: 'c42', why: redraw ? 'redraw' : 'cards' });
      overlap();
    }
    edSync();
  }
  /* 当てた後、行の箱が重なっていないか（Notion が行の高さを測り直して並べ直すか）を確かめる。重なったままなら標準の表へ戻して理由を残す */
  function overlap() {
    clearTimeout(S.chkT);
    const vid = S.vid, t0 = performance.now();
    const step = () => {
      S.chkT = 0;
      if (S.vid !== vid || !S.tv || !S.tv.isConnected || !S.tv.hasAttribute('data-c42-cards')) return;
      const its = [...S.tv.querySelectorAll('.notion-collection-item')].slice(0, 14);
      let bad = 0;
      for (let i = 0; i + 1 < its.length; i++) {
        const a = its[i].getBoundingClientRect(), b = its[i + 1].getBoundingClientRect();
        if (a.height > 0 && b.height > 0 && b.top >= a.top - 1 && a.bottom > b.top + 4.5) bad++;   // 本物の行の項目の箱は枠より 2px 高い（calc(100% + 2px)）
      }
      if (!bad) return;
      if (performance.now() - t0 > T.safe) {
        S.bad[vid] = '行の箱が重なりました（Notion が行の位置を測り直さない形）。標準の表に戻しました';
        log('overlap:' + vid, 'カード: 行の箱が重なったため、このビューは標準の表に戻しました（__c42.status() に理由）。');
        sync();
        return;
      }
      S.chkT = setTimeout(step, 300);
    };
    S.chkT = setTimeout(step, 300);
  }

  /* ═══ v1.1.0 配置の編集（右の小さな窓。⁴² の層＝ body の直下の shadow root。Notion の DOM には何も足さない） ═══ */
  const ED = { host: null, root: null, open: false, drag: null, sel: -1, hl: -1, closeT: 0, sig: '' };
  const ED_CSS = `
:host { all: initial; }
.pn { position: fixed; top: 72px; right: 18px; z-index: 2147483000; width: 340px; max-height: calc(100vh - 96px); overflow: auto; box-sizing: border-box; padding: 14px 14px 12px;
  border-radius: 14px; background: var(--p); color: var(--ink); box-shadow: 0 0 0 1px var(--edge), 0 2px 6px rgba(15,15,15,.06), 0 24px 56px -18px rgba(15,15,15,.34);
  font: 400 12.5px/1.45 ui-sans-serif, -apple-system, "Segoe UI", "Hiragino Sans", sans-serif; opacity: 0; transform: translateX(18px) scale(.985); transform-origin: 100% 0;
  transition: opacity .24s ease, transform .34s ${EASE}; }
.pn[data-in] { opacity: 1; transform: none; }
.pn:focus { outline: none; }
.pn[data-moving] { transition: opacity .24s ease; user-select: none; }
.pn[hidden] { display: none; }
:host([data-dark]) { --p: #252525; --ink: rgba(255,255,255,.88); --ink2: rgba(255,255,255,.52); --edge: rgba(255,255,255,.1); --edge2: rgba(255,255,255,.18); --tile: #2f2f2f; --tint: rgba(255,255,255,.05); }
:host(:not([data-dark])) { --p: #fff; --ink: #37352f; --ink2: rgba(55,53,47,.6); --edge: rgba(55,53,47,.12); --edge2: rgba(55,53,47,.22); --tile: #fbfbfa; --tint: rgba(55,53,47,.04); }
:host { --acc: #2383e2; }
.hd { display: flex; align-items: baseline; gap: 8px; margin: -4px -4px 10px; padding: 4px; border-radius: 8px; cursor: grab; touch-action: none; }
.pn[data-moving] .hd { cursor: grabbing; }
.tt { font: 600 11px/1.2 "EB Garamond", Georgia, "Hiragino Mincho ProN", serif; letter-spacing: .16em; text-transform: uppercase; }
.vn { flex: 1 1 auto; min-width: 0; color: var(--ink2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.x { all: unset; width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink2); font-size: 16px; line-height: 1; }
.x:hover { background: var(--tint); color: var(--ink); }
.lb { margin: 12px 0 6px; color: var(--ink2); font-size: 11px; }
.lb:first-of-type { margin-top: 0; }
.pv { position: relative; display: grid; gap: 6px; padding: 10px; border-radius: 10px; background: var(--tint); box-shadow: inset 0 0 0 1px var(--edge); }
.cv { grid-column: 1 / 2; grid-row: 1 / -1; min-height: 64px; border-radius: 3px 6px 6px 3px; background: linear-gradient(160deg, color-mix(in srgb, var(--acc) 22%, var(--tile)), var(--tile));
  box-shadow: 0 0 0 1px var(--edge), 0 6px 12px -8px rgba(15,15,15,.4); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 6px; box-sizing: border-box; color: var(--ink2); font-size: 10px; }
.tl { position: relative; display: flex; align-items: center; gap: 6px; min-width: 0; height: 30px; padding: 0 6px 0 7px; box-sizing: border-box; border-radius: 7px; background: var(--tile); color: var(--ink);
  box-shadow: 0 0 0 1px var(--edge), 0 1px 2px rgba(15,15,15,.05); cursor: grab; user-select: none; touch-action: none; outline: none;
  transition: box-shadow .2s ease, background-color .2s ease; animation: tin .36s ${EASE} both; animation-delay: calc(var(--i, 0) * 26ms); }
.tl[data-title] { font-weight: 650; }
.tl:hover, .tl:focus-visible, .tl[data-sel] { box-shadow: 0 0 0 1.5px var(--acc), 0 4px 12px -6px rgba(35,131,226,.5); }
.tl[data-drag] { cursor: grabbing; z-index: 3; box-shadow: 0 0 0 1.5px var(--acc), 0 14px 28px -10px rgba(15,15,15,.45); transition: none; animation: none; }
.tl[data-flash] { animation: pulse .7s ease-out; }
.ic { flex: none; width: 12px; height: 12px; background: currentColor; opacity: .6; -webkit-mask: var(--ic) center / contain no-repeat; mask: var(--ic) center / contain no-repeat; }
.nm { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tb { flex: none; display: inline-flex; gap: 2px; opacity: 0; transition: opacity .15s ease; }
.tl:hover .tb, .tl:focus-within .tb, .tl[data-sel] .tb { opacity: 1; }
.tb button { all: unset; width: 20px; height: 20px; border-radius: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink2); font-size: 12px; line-height: 1; }
.tb button:hover { background: var(--tint); color: var(--ink); }
.tb button[aria-pressed="true"] { color: var(--acc); }
.hid { display: flex; flex-wrap: wrap; gap: 6px; min-height: 30px; padding: 6px; border-radius: 9px; box-shadow: inset 0 0 0 1px var(--edge); box-sizing: border-box; transition: box-shadow .2s ease, background-color .2s ease; }
.hid[data-over] { box-shadow: inset 0 0 0 1.5px var(--acc); background: color-mix(in srgb, var(--acc) 6%, transparent); }
.hid:empty::before { content: attr(data-empty); color: var(--ink2); font-size: 11px; padding: 2px 4px; }
.chip { all: unset; display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 8px 0 6px; border-radius: 999px; background: var(--tile); box-shadow: 0 0 0 1px var(--edge); cursor: pointer; color: var(--ink2); font-size: 11.5px; animation: tin .3s ${EASE} both; }
.chip:hover, .chip:focus-visible { color: var(--ink); box-shadow: 0 0 0 1.5px var(--acc); }
.chip b { font-weight: 400; color: var(--acc); }
.op { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 8px 10px; margin-top: 12px; }
.op > span { color: var(--ink2); font-size: 11px; white-space: nowrap; }
.seg { display: flex; padding: 2px; border-radius: 8px; background: var(--tint); box-shadow: inset 0 0 0 1px var(--edge); }
.seg button { all: unset; flex: 1 1 0; height: 22px; border-radius: 6px; text-align: center; cursor: pointer; color: var(--ink2); font-size: 11.5px; line-height: 22px; transition: background-color .2s ease, color .2s ease, box-shadow .2s ease; }
.seg button:hover { color: var(--ink); }
.seg button[aria-pressed="true"] { background: var(--tile); color: var(--ink); box-shadow: 0 0 0 1px var(--edge2), 0 1px 3px rgba(15,15,15,.1); }
.ft { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
.rs { all: unset; height: 26px; padding: 0 10px; border-radius: 7px; cursor: pointer; color: var(--ink2); font-size: 11.5px; box-shadow: 0 0 0 1px var(--edge); }
.rs:hover { color: var(--ink); box-shadow: 0 0 0 1px var(--edge2); }
.msg { flex: 1 1 auto; min-width: 0; color: var(--ink2); font-size: 11px; }
.note { margin-top: 10px; color: var(--ink2); font-size: 10.5px; line-height: 1.5; }
button:focus-visible { outline: 1.5px solid var(--acc); outline-offset: 1px; }
@keyframes tin { from { opacity: 0; transform: translateY(5px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes pulse { 0% { box-shadow: 0 0 0 1.5px var(--acc), 0 0 0 0 rgba(35,131,226,.45); } 100% { box-shadow: 0 0 0 1.5px var(--acc), 0 0 0 10px rgba(35,131,226,0); } }
.toast { position: fixed; left: 50%; bottom: 28px; z-index: 2147483001; max-width: min(560px, calc(100vw - 48px)); box-sizing: border-box; padding: 11px 16px; border-radius: 12px;
  background: var(--p); color: var(--ink); box-shadow: 0 0 0 1px var(--edge), 0 18px 40px -16px rgba(15,15,15,.4); font: 400 12.5px/1.55 ui-sans-serif, -apple-system, "Segoe UI", "Hiragino Sans", sans-serif;
  opacity: 0; transform: translate(-50%, 10px); transition: opacity .3s ease, transform .4s ${EASE}; pointer-events: none; }
.toast[data-in] { opacity: 1; transform: translate(-50%, 0); }
.toast[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) { .pn, .tl, .chip, .seg button, .toast { transition: none !important; animation: none !important; } }
`;
  const ED_HTML = '<div class="pn" role="dialog" aria-label="カードの配置" tabindex="-1" hidden>'
    + '<div class="hd" title="ドラッグで窓を動かす"><span class="tt">Layout</span><span class="vn"></span><button type="button" class="x" aria-label="閉じる" title="閉じる（Esc）">×</button></div>'
    + '<div class="lb">並び・幅（札をドラッグで並べ替え。⇔ で幅、− で隠す）</div><div class="pv" role="list" aria-label="カードの項目"></div>'
    + '<div class="lb">隠している項目（押すと戻す。札をここへ落としても隠せます）</div><div class="hid" data-empty="なし"></div>'
    + '<div class="op"><span>表紙</span><div class="seg" data-k="cover"></div><span>列の数</span><div class="seg" data-k="cols"></div><span>小見出し</span><div class="seg" data-k="labels"></div></div>'
    + '<div class="ft"><button type="button" class="rs">自動の並びに戻す</button><button type="button" class="rs dr" title="このビューを標準の表に戻し、カードの対象から外します（配置の設定は残ります）">カードをやめる</button><span class="msg" aria-live="polite"></span></div>'
    + '<div class="note">開いている間は、カードを押しても値は開かず、その項目の札が選ばれます。札の上で ← → で並べ替え・W で幅・H で隠す。窓は上の帯をドラッグで動かせます（ダブルクリックで元の場所）。カード（レコード）の並べ替えは、窓を閉じてカードの左の外に出る Notion のつまみ（⋮⋮）で。</div></div>';
  function edRoot() {
    if (ED.host && ED.host.isConnected) return ED.root;
    if (!document.body) return null;
    try {
      const h = document.createElement('div');
      h.id = 'c42-ed';
      document.body.appendChild(h);
      const r = h.attachShadow({ mode: 'open' });
      r.innerHTML = '<style>' + ED_CSS + '</style>' + ED_HTML;
      ED.host = h; ED.root = r;
      edWire(r);
      return r;
    } catch (e) { log('ed', '配置の窓を作れませんでした（' + (e && e.message) + '）。'); return null; }
  }
  const darkNow = () => {
    try {
      const m = String(getComputedStyle(document.body).backgroundColor || '').match(/\d+(\.\d+)?/g);
      if (!m || m.length < 3) return false;
      const [r, g, b] = m.map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
    } catch (e) { return false; }
  };
  const edMsg = (t) => { const m = ED.root && ED.root.querySelector('.msg'); if (m) m.textContent = t || ''; };
  /* 配置を変える（そのビューの layouts へ。空になれば消す）。カードはその場で滑って並び替わる */
  function setLayout(patch, vid) {
    const v = vid || S.vid;
    if (!ID32.test(v || '')) return 'ビュー ID が分かりません';
    if (ST.broken) return save();
    const cur = Object.assign({}, ST.v.layouts[v] || {});
    for (const k of Object.keys(patch)) { if (patch[k] == null) delete cur[k]; else cur[k] = patch[k]; }
    for (const k of ['wide', 'hide']) if (cur[k] && !Object.keys(cur[k]).length) delete cur[k];
    const why = checkLayout(cur);
    if (why) return '配置の形が違います（' + why + '）';
    if (Object.keys(cur).length) ST.v.layouts[v] = cur; else delete ST.v.layouts[v];
    const err = save();
    flipCards(() => sync());
    return err || true;
  }
  /* 窓の位置: 見出しをドラッグで動かせる。位置はこのブラウザだけに覚える（無くても既定の右上で動く） */
  const POS_K = 'c42.ed.pos';
  function edPlace(pn, x, y) {
    if (x == null) { try { const o = JSON.parse(localStorage.getItem(POS_K) || 'null'); if (o && isFinite(o.x) && isFinite(o.y)) { x = o.x; y = o.y; } } catch (e) { /* 既定の位置 */ } }
    if (x == null) { pn.style.left = ''; pn.style.top = ''; pn.style.right = ''; return; }
    const w = pn.offsetWidth || 340, h = Math.min(pn.offsetHeight || 200, innerHeight - 24);
    x = Math.max(8, Math.min(innerWidth - w - 8, x)); y = Math.max(8, Math.min(innerHeight - Math.min(h, 120), y));
    pn.style.left = Math.round(x) + 'px'; pn.style.top = Math.round(y) + 'px'; pn.style.right = 'auto';
  }
  function edToggle(on) {
    const want = on == null ? !ED.open : !!on;
    if (want && !(S.on && S.info)) { edMsg(''); log('ed-off', '配置の編集は、カードにしているビューで開けます。'); return false; }
    const r = edRoot();
    if (!r) return false;
    const pn = r.querySelector('.pn');
    clearTimeout(ED.closeT);
    if (want) {
      ED.open = true;
      ED.host.toggleAttribute('data-dark', darkNow());
      root.setAttribute('data-c42-edit', '');
      pn.hidden = false;
      ED.sig = '';
      edRender();
      requestAnimationFrame(() => requestAnimationFrame(() => pn.setAttribute('data-in', '')));
      edPlace(pn);
      try { pn.focus({ preventScroll: true }); } catch (e) { /* noop */ }   // 札にはフォーカスを置かない（Tab で札へ）
    } else {
      ED.open = false; ED.drag = null; ED.sel = -1;
      root.removeAttribute('data-c42-edit');
      hl(-1);
      pn.removeAttribute('data-in');
      ED.closeT = setTimeout(() => { pn.hidden = true; }, reduced() ? 0 : 340);
    }
    emit('c42:state', { on: S.on, view: S.vid, cols: S.cols, edit: ED.open });
    return ED.open;
  }
  /* 札に乗せた・選んだ項目を、本物のカードで光らせる */
  function hl(k) {
    ED.hl = k;
    if (k < 0 || !S.on) { css('c42-hl', ''); return; }
    const Q = CELL_E + ':nth-child(' + (k + 1) + ' of .notion-table-view-cell)';
    css('c42-hl', Q + ' { outline: 2px solid var(--c42-acc) !important; outline-offset: 4px !important; background-color: color-mix(in srgb, var(--c42-acc) 5%, transparent) !important; }');
  }
  function edSync() { if (ED.open) { if (!S.on || !S.info) edToggle(false); else edRender(); } }
  /* 見取り図を描く。drag 中の仮の並び（tmp）があればそれで。札は同じ要素を使い回し、位置が変われば FLIP で滑らせる */
  function edRender(tmp) {
    const r = ED.root;
    if (!r || !ED.open || !S.info) return;
    const info = S.info;
    const P = tmp ? Object.assign({}, S.L, tmp) : S.L;
    const pn = r.querySelector('.pn'), pv = r.querySelector('.pv'), hid = r.querySelector('.hid');
    const tab = selTab(frame());
    r.querySelector('.vn').textContent = tab ? norm(tab.textContent).slice(0, 60) : '';
    const sig = [S.vid, P.cv, P.K, P.vis.join(','), P.hidden.join(','), P.vis.map((i) => (P.wideOf(i) ? 1 : 0)).join(''), info.keys.join('\u0001'), P.labels, P.colsSet, P.coverSet].join('|');
    if (sig === ED.sig && !tmp) { edSel(); return; }
    ED.sig = tmp ? '' : sig;
    const before = new Map();
    for (const t of pv.querySelectorAll('.tl')) before.set(t.dataset.k, t.getBoundingClientRect());
    pv.style.gridTemplateColumns = (P.cv ? '46px ' : '') + 'repeat(' + P.K + ', minmax(0, 1fr))';
    let cv = pv.querySelector('.cv');
    if (P.cv) { if (!cv) { cv = document.createElement('div'); cv.className = 'cv'; cv.setAttribute('aria-hidden', 'true'); pv.prepend(cv); } cv.textContent = P.ch + 'px'; }
    else if (cv) cv.remove();
    const pl = place(P.vis, P.wideOf, P.K, P.c0);
    const keep = new Set();
    P.vis.forEach((i, n) => {
      const key = String(i);
      keep.add(key);
      let t = pv.querySelector('.tl[data-k="' + key + '"]');
      if (!t) t = edTile(i, n);
      const c = info.cols[i];
      t.querySelector('.nm').textContent = c.name || info.keys[i];
      t.querySelector('.ic').style.setProperty('--ic', c.ic || 'none');
      t.querySelector('.ic').hidden = !c.ic;
      t.toggleAttribute('data-title', i === info.title);
      const w = P.wideOf(i);
      t.setAttribute('aria-label', (c.name || info.keys[i]) + (w ? '（横いっぱい）' : '（1 列）'));
      const wb = t.querySelector('.w');
      wb.setAttribute('aria-pressed', String(w));
      wb.title = w ? '1 列にする' : '横いっぱいにする';
      t.style.gridColumn = pl.pos[i][0];
      t.style.gridRow = pl.pos[i][1];
      if (t.parentElement !== pv) pv.appendChild(t);
    });
    for (const t of [...pv.querySelectorAll('.tl')]) if (!keep.has(t.dataset.k)) t.remove();
    if (cv) cv.style.gridRow = '1 / ' + (pl.rows + 1);
    /* 並びの順に DOM も並べる（Tab の移る順） */
    for (const i of P.vis) { const t = pv.querySelector('.tl[data-k="' + i + '"]'); if (t) pv.appendChild(t); }
    if (!reduced()) for (const t of pv.querySelectorAll('.tl')) {
      if (ED.drag && ED.drag.el === t) continue;
      const a = before.get(t.dataset.k);
      if (!a) continue;
      const b = t.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
      try { t.animate([{ transform: 'translate(' + dx + 'px, ' + dy + 'px)' }, { transform: 'none' }], { duration: 300, easing: EASE }); } catch (e) { /* noop */ }
    }
    /* 隠している項目 */
    hid.textContent = '';
    for (const i of P.hidden) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.dataset.k = String(i);
      b.title = '戻す';
      b.innerHTML = '<b>＋</b><span></span>';
      b.querySelector('span').textContent = info.cols[i].name || info.keys[i];
      hid.appendChild(b);
    }
    /* 表紙・列の数・小見出し */
    const seg = (k, items, cur) => {
      const s = r.querySelector('.seg[data-k="' + k + '"]');
      if (s.childElementCount !== items.length) { s.textContent = ''; for (const [v, t] of items) { const b = document.createElement('button'); b.type = 'button'; b.dataset.v = String(v); b.textContent = t; s.appendChild(b); } }
      for (const b of s.children) b.setAttribute('aria-pressed', String(b.dataset.v === String(cur)));
    };
    const covers = info.cover >= 0;
    r.querySelector('.seg[data-k="cover"]').hidden = !covers;
    r.querySelector('.op > span').hidden = !covers;
    seg('cover', [[0, 'なし']].concat(T.covers.map((c) => [c, String(c)])), P.cv ? P.ch : 0);
    seg('cols', [[0, '自動']].concat([1, 2, 3, 4].map((c) => [c, String(c)])), P.colsSet);
    seg('labels', [['1', '出す'], ['0', '隠す']], P.labels ? '1' : '0');
    pn.setAttribute('aria-label', 'カードの配置' + (tab ? '（' + norm(tab.textContent).slice(0, 40) + '）' : ''));
    edSel();
  }
  function edTile(i, n) {
    const t = document.createElement('div');
    t.className = 'tl'; t.tabIndex = 0; t.setAttribute('role', 'listitem'); t.dataset.k = String(i);
    t.style.setProperty('--i', String(n));
    t.innerHTML = '<i class="ic" aria-hidden="true"></i><span class="nm"></span><span class="tb"><button type="button" class="w" aria-label="幅を切り替える">⇔</button><button type="button" class="h" aria-label="隠す" title="隠す">−</button></span>';
    return t;
  }
  function edSel() {
    const r = ED.root;
    if (!r) return;
    for (const t of r.querySelectorAll('.tl')) t.toggleAttribute('data-sel', +t.dataset.k === ED.sel);
  }
  function edSelect(k, fromCard) {
    ED.sel = k;
    edSel();
    hl(k);
    const t = ED.root && ED.root.querySelector('.tl[data-k="' + k + '"]');
    if (t && fromCard) {
      try { t.focus({ preventScroll: false }); } catch (e) { /* noop */ }
      t.removeAttribute('data-flash'); void t.offsetWidth; t.setAttribute('data-flash', '');
      setTimeout(() => t.removeAttribute('data-flash'), 720);
    }
    if (!t && fromCard && S.L && S.L.hidden.indexOf(k) >= 0) edMsg('その項目は隠しています');
  }
  const keyOf = (i) => (S.info ? S.info.keys[i] : '');
  function edMove(k, d) {
    const P = S.L;
    const vis = P.vis.slice(), at = vis.indexOf(k);
    if (at < 0) return;
    const to = Math.max(0, Math.min(vis.length - 1, at + d));
    if (to === at) return;
    vis.splice(at, 1); vis.splice(to, 0, k);
    commitOrder(vis);
  }
  function commitOrder(vis) {
    const P = S.L;
    const order = vis.concat(P.hidden).map(keyOf);
    const e = setLayout({ order });
    edMsg(e === true ? '' : e);
  }
  function edWide(k) {
    const P = S.L, L = layoutOf(S.vid);
    const wide = Object.assign({}, L.wide || {});
    wide[keyOf(k)] = P.wideOf(k) ? 0 : 1;
    const e = setLayout({ wide });
    edMsg(e === true ? '' : e);
  }
  function edHide(k, h) {
    const L = layoutOf(S.vid);
    const hide = Object.assign({}, L.hide || {});
    if (h) hide[keyOf(k)] = 1; else delete hide[keyOf(k)];
    const e = setLayout({ hide });
    if (ED.sel === k && h) { ED.sel = -1; hl(-1); }
    edMsg(e === true ? '' : e);
  }
  function edWire(r) {
    const pn = r.querySelector('.pn'), pv = r.querySelector('.pv'), hid = r.querySelector('.hid');
    for (const t of ['pointerdown', 'mousedown', 'click', 'keydown', 'wheel']) pn.addEventListener(t, (e) => e.stopPropagation());
    r.querySelector('.x').addEventListener('click', () => edToggle(false));
    const hd = r.querySelector('.hd');
    let mv = null;
    hd.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('button')) return;
      const q = pn.getBoundingClientRect();
      mv = { dx: e.clientX - q.left, dy: e.clientY - q.top, id: e.pointerId };
      pn.setAttribute('data-moving', '');
      try { hd.setPointerCapture(e.pointerId); } catch (er) { /* noop */ }
    });
    hd.addEventListener('pointermove', (e) => { if (mv && e.pointerId === mv.id) edPlace(pn, e.clientX - mv.dx, e.clientY - mv.dy); });
    const stop = (e) => {
      if (!mv || e.pointerId !== mv.id) return;
      mv = null; pn.removeAttribute('data-moving');
      try { localStorage.setItem(POS_K, JSON.stringify({ x: parseFloat(pn.style.left) || 0, y: parseFloat(pn.style.top) || 0 })); } catch (er) { /* 覚えられなくても動く */ }
    };
    hd.addEventListener('pointerup', stop);
    hd.addEventListener('pointercancel', stop);
    hd.addEventListener('dblclick', () => { try { localStorage.removeItem(POS_K); } catch (er) { /* noop */ } edPlace(pn); });
    r.querySelector('.dr').addEventListener('click', () => cmd('drop'));
    r.querySelector('.rs:not(.dr)').addEventListener('click', () => {
      if (ST.broken) { edMsg(save()); return; }
      delete ST.v.layouts[S.vid];
      const err = save();
      flipCards(() => sync());
      edMsg(err || '自動の並びに戻しました');
    });
    r.querySelector('.seg[data-k="cover"]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const v = +b.dataset.v; const x = setLayout({ cover: v === ST.v.cover ? null : v }); edMsg(x === true ? '' : x); });
    r.querySelector('.seg[data-k="cols"]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const v = +b.dataset.v; const x = setLayout({ cols: v ? v : null }); edMsg(x === true ? '' : x); });
    r.querySelector('.seg[data-k="labels"]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const x = setLayout({ labels: b.dataset.v === '1' ? null : false }); edMsg(x === true ? '' : x); });
    hid.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) edHide(+b.dataset.k, false); });
    pv.addEventListener('click', (e) => {
      const t = e.target.closest('.tl');
      if (!t) return;
      const k = +t.dataset.k;
      if (e.target.closest('.w')) { edWide(k); return; }
      if (e.target.closest('.h')) { edHide(k, true); return; }
      if (ED.drag && ED.drag.moved) return;
      edSelect(ED.sel === k ? -1 : k);
    });
    pv.addEventListener('mouseover', (e) => { const t = e.target.closest('.tl'); if (t && !ED.drag) hl(+t.dataset.k); });
    pv.addEventListener('mouseleave', () => { if (!ED.drag) hl(ED.sel); });
    pv.addEventListener('keydown', (e) => {
      const t = e.target.closest('.tl');
      if (!t) return;
      const k = +t.dataset.k;
      const re = () => requestAnimationFrame(() => { const n = r.querySelector('.tl[data-k="' + k + '"]'); if (n) try { n.focus({ preventScroll: true }); } catch (er) { /* noop */ } });
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); edMove(k, -1); re(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); edMove(k, 1); re(); }
      else if (e.key === 'w' || e.key === 'W') { e.preventDefault(); edWide(k); re(); }
      else if (e.key === 'h' || e.key === 'H' || e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); edHide(k, true); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); edSelect(ED.sel === k ? -1 : k); }
    });
    /* ドラッグ: 押して 4px 動いたら持ち上げる。指の下の札の前後へ差し込み、離したら保存。隠している項目の段へ落とすと隠す */
    pv.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('.tl');
      if (!t || e.button !== 0 || e.target.closest('button')) return;
      ED.drag = { el: t, k: +t.dataset.k, x: e.clientX, y: e.clientY, moved: false, vis: S.L.vis.slice(), id: e.pointerId };
      try { t.setPointerCapture(e.pointerId); } catch (er) { /* noop */ }
    });
    pv.addEventListener('pointermove', (e) => {
      const d = ED.drag;
      if (!d || e.pointerId !== d.id) return;
      if (!d.moved) {
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return;
        d.moved = true; d.el.setAttribute('data-drag', ''); hl(d.k);
      }
      /* 差し込む場所: 指の下（無ければいちばん近い）札の、中心より前なら前・後なら後 */
      let best = null, bd = Infinity;
      for (const t of pv.querySelectorAll('.tl')) {
        if (t === d.el) continue;
        const q = t.getBoundingClientRect();
        const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
        const dist = Math.hypot((e.clientX - cx) / Math.max(1, q.width / 2), (e.clientY - cy) / Math.max(1, q.height / 2));
        if (dist < bd) { bd = dist; best = { t, after: (Math.abs(e.clientY - cy) < q.height / 2 ? e.clientX > cx : e.clientY > cy) }; }
      }
      const hq = hid.getBoundingClientRect();
      const overHid = e.clientX >= hq.left && e.clientX <= hq.right && e.clientY >= hq.top && e.clientY <= hq.bottom;
      hid.toggleAttribute('data-over', overHid);
      if (best && bd < 2.2 && !overHid) {
        const vis = d.vis.filter((i) => i !== d.k);
        let at = vis.indexOf(+best.t.dataset.k);
        if (best.after) at++;
        vis.splice(at, 0, d.k);
        if (vis.join(',') !== d.vis.join(',')) { d.vis = vis; edRender({ vis }); }
      }
      /* 持ち上げた札は指に付いてくる（並びが変わって元の場所が動いても、その差を transform で埋める） */
      d.el.style.transform = '';
      const q = d.el.getBoundingClientRect();
      if (d.ox == null) { d.ox = d.x - q.left; d.oy = d.y - q.top; }
      d.el.style.transform = 'translate(' + (e.clientX - d.ox - q.left) + 'px, ' + (e.clientY - d.oy - q.top) + 'px) scale(1.04)';
    });
    const end = (e) => {
      const d = ED.drag;
      if (!d || (e && e.pointerId !== d.id)) return;
      d.el.removeAttribute('data-drag');
      d.el.style.transform = '';
      const overHid = hid.hasAttribute('data-over');
      hid.removeAttribute('data-over');
      if (d.moved) {
        setTimeout(() => { if (ED.drag === d) ED.drag = null; }, 0);
        if (overHid && e && e.type === 'pointerup') edHide(d.k, true);
        else if (e && e.type === 'pointerup' && d.vis.join(',') !== S.L.vis.join(',')) commitOrder(d.vis);
        else { ED.sig = ''; edRender(); }
        hl(ED.sel);
      } else ED.drag = null;
    };
    pv.addEventListener('pointerup', end);
    pv.addEventListener('pointercancel', end);
  }
  /* 編集の間は、カードのセルを押しても Notion の編集は開かず、その項目の札を選ぶ（窓を閉じると元どおり） */
  const edBlock = (e) => {
    if (!ED.open || !S.tv) return;
    const t = e.target;
    if (!(t instanceof Element) || !S.tv.contains(t)) return;
    const cell = t.closest('.notion-table-view-cell');
    if (!cell || !S.tv.contains(cell) || cell.closest('.notion-table-view-header-row')) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if (e.type === 'click') { const k = cellsOf(cell.parentElement).indexOf(cell); if (k >= 0) edSelect(k, true); }
  };
  for (const t of ['pointerdown', 'mousedown', 'mouseup', 'click', 'dblclick']) document.addEventListener(t, edBlock, true);
  /* ═══ v1.2.0 カード（レコード）の並べ替え: Notion 自身の行のつまみを使う ═══
   *  依頼主「入れ替えができない。アイテムの。」。並べ替えは Notion の行のつまみ（⋮⋮）のドラッグでしかできない（内部の API は使わない）。
   *  標準の表ではつまみが行の左の外に出るが、カードの間はそこが Catalogus の陰や枠の外になり、掴めなかった（推定）。
   *  カードに乗せた時、そのカードの行のつまみを画面から探し（ドラッグの絵 dragHandle・aria-label の Drag・draggable）、見つかればカードの左の外（v1.2.0 は左上）へ
   *  translate で寄せる（Notion の DOM は動かさない・消さない・複製しない。位置の見た目だけ）。並べ替え・落とす先の判定は Notion のまま。
   *  見つからない時はカードを掴もうとした時に 1 度だけ知らせる（__c42.status().grip に数） */
  const GR = { item: null, el: null, t: 0, tries: 0, st: { found: 0, miss: 0, last: '' }, told: false, down: null };
  const GRIP_SEL = '[aria-label="Drag"], [aria-label="ドラッグ"], [draggable="true"], [role="button"]:has(> svg[class*="dragHandle"]), div:has(> svg[class*="dragHandle"])';
  const boxOf = (item) => { const r = item.querySelector('.notion-table-view-row'); return (r && cbOf(r)) || item; };
  function gripFind(item) {
    const r = item.getBoundingClientRect();
    let best = null, bd = Infinity;
    for (const el of document.querySelectorAll(GRIP_SEL)) {
      if (el.closest('.notion-table-view-header-row, .notion-table-view-header-cell, #c42-ed, #c33-n194, [role="tablist"], .notion-peek-renderer, .notion-sidebar-container')) continue;
      if (el.querySelector('.notion-collection-item') || el.closest('[data-c42-grip]') && el.closest('[data-c42-grip]') !== el) continue;
      const it = el.closest('.notion-collection-item');
      if (it && it !== item) continue;
      const q = el.getBoundingClientRect();
      if (q.width < 4 || q.height < 4 || q.width > 80 || q.height > 80) continue;
      const cy = q.top + q.height / 2;
      if (cy < r.top - 8 || cy > r.bottom + 8) continue;
      const d = Math.abs(q.left - r.left);
      if (d > 160) continue;
      if (d < bd) { bd = d; best = el; }
    }
    return best;
  }
  function gripFree() {
    clearTimeout(GR.t); GR.t = 0;
    if (GR.el) { GR.el.removeAttribute('data-c42-grip'); GR.el.style.removeProperty('--c42-gx'); GR.el.style.removeProperty('--c42-gy'); }
    GR.el = null; GR.item = null; GR.tries = 0;
  }
  /* v1.4.0 チェックボックス（セルではない子の中の小さな四角）を、つまみの下（カードの左の外）へ寄せる。1 つのカードにつき 1 度測る */
  function chkDock(item) {
    const box = boxOf(item);
    if (!box || box === item) return;
    for (const k of box.children) {
      if (k.classList.contains('notion-table-view-cell') || k.hasAttribute('data-c42-chk')) continue;
      let best = null;   // いちばん小さい四角（チェックボックスそのもの。外側の押せる箱ではなく）
      for (const e of [k, ...k.querySelectorAll('*')]) { const r = e.getBoundingClientRect(); if (r.width >= 10 && r.width <= 40 && r.height >= 10 && r.height <= 40 && (!best || r.width * r.height < best.width * best.height)) best = r; }
      if (!best) continue;
      const b = box.getBoundingClientRect();
      const kx = Math.round(b.left - 8 - 18 + (18 - best.width) / 2 - best.left), ky = Math.round(b.top + 18 + 24 + 10 - best.top);
      k.style.setProperty('--c42-kx', kx + 'px'); k.style.setProperty('--c42-ky', ky + 'px');
      k.setAttribute('data-c42-chk', '');
      GR.st.chk = (GR.st.chk || 0) + 1;
      return;
    }
  }
  function gripTry() {
    GR.t = 0;
    const item = GR.item;
    if (!item || !item.isConnected || !S.on) { gripFree(); return; }
    try { chkDock(item); } catch (e) { /* noop */ }
    const el = gripFind(item);
    if (!el) {
      if (++GR.tries < 8) { GR.t = setTimeout(gripTry, 90); return; }
      GR.st.miss++; GR.st.last = 'none'; return;
    }
    if (GR.el && GR.el !== el) { GR.el.removeAttribute('data-c42-grip'); GR.el.style.removeProperty('--c42-gx'); GR.el.style.removeProperty('--c42-gy'); }
    GR.el = el;
    el.style.removeProperty('--c42-gx'); el.style.removeProperty('--c42-gy');
    const q = el.getBoundingClientRect(), b = boxOf(item).getBoundingClientRect();
    const dx = Math.round(b.left - 8 - q.width - q.left), dy = Math.round(b.top + 18 - q.top);   // v1.3.0: カードの左の外
    el.style.setProperty('--c42-gx', dx + 'px'); el.style.setProperty('--c42-gy', dy + 'px');
    el.setAttribute('data-c42-grip', '');
    GR.st.found++; GR.st.last = (el.getAttribute('aria-label') || el.tagName.toLowerCase()) + ' ' + dx + ',' + dy;
  }
  document.addEventListener('pointermove', (e) => {
    if (!S.on || e.pointerType === 'touch' || ED.open || e.buttons) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (GR.el && (t === GR.el || GR.el.contains(t))) return;   // つまみの上
    const item = t.closest('.notion-collection-item');
    if (!item || !S.all.some((tv) => tv.contains(item))) {
      if (GR.item && !GR.t) { const it = GR.item; GR.t = setTimeout(() => { GR.t = 0; if (GR.item === it) gripFree(); }, 260); }
      return;
    }
    if (item === GR.item) return;
    gripFree();
    GR.item = item;
    GR.t = setTimeout(gripTry, 60);
  }, { capture: true, passive: true });
  /* カードを掴もうとした（押して動かした）のに、つまみが見つかっていない時: 1 度だけ知らせる */
  document.addEventListener('pointerdown', (e) => {
    GR.down = null;
    if (!S.on || ED.open || e.button !== 0 || GR.told) return;
    const t = e.target;
    if (!(t instanceof Element) || (GR.el && GR.el.contains(t))) return;
    const item = t.closest('.notion-collection-item');
    if (item && S.all.some((tv) => tv.contains(item))) GR.down = { x: e.clientX, y: e.clientY, item };
  }, true);
  document.addEventListener('pointermove', (e) => {
    const d = GR.down;
    if (!d || !e.buttons) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 14) return;
    GR.down = null;
    if (GR.el || GR.told) return;
    GR.told = true;
    toast('カードの並べ替えは、カードの左の外に出る Notion のつまみ（⋮⋮）を掴みます。このカードでは Notion のつまみが見つかりませんでした。「表に戻す」で並べ替えてから、カードに戻せます');
  }, { capture: true, passive: true });
  document.addEventListener('pointerup', () => { GR.down = null; }, true);
  /* 小さな知らせ（⁴² の層の下の真ん中・数秒で消える） */
  function toast(text) {
    const r = edRoot();
    if (!r) return;
    let el = r.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); r.appendChild(el); }
    el.textContent = text;
    if (ED.host) ED.host.toggleAttribute('data-dark', darkNow());
    el.hidden = false;
    requestAnimationFrame(() => el.setAttribute('data-in', ''));
    clearTimeout(el.__t);
    el.__t = setTimeout(() => { el.removeAttribute('data-in'); setTimeout(() => { el.hidden = true; }, 400); }, 7000);
  }

  /* ═══ v1.2.0 スクロールで入ってくるカード: 初めて描かれたカードだけ下からふわっと（仮想化で描き直された物・前に見た物は動かさない） ═══ */
  const SEEN = new Set();
  function reveal(items) {
    if (!S.on || reduced() || performance.now() - S.at < T.inFor) { for (const it of items) { const id = it.getAttribute('data-block-id'); if (id) SEEN.add(id); } return; }
    let n = 0;
    for (const it of items) {
      const id = it.getAttribute('data-block-id');
      if (!id || SEEN.has(id)) continue;
      SEEN.add(id);
      if (!S.all.some((tv) => tv.contains(it))) continue;
      const r = it.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      it.style.setProperty('--c42-d', Math.min(n++, 4) * 50 + 'ms');
      it.setAttribute('data-c42-new', '');
      setTimeout(() => { it.removeAttribute('data-c42-new'); it.style.removeProperty('--c42-d'); }, 900);
    }
  }

  document.addEventListener('keydown', (e) => { if (ED.open && e.key === 'Escape' && !e.isComposing) { e.preventDefault(); e.stopPropagation(); edToggle(false); } }, true);

  /* ── 見張り: 表の箱が入った・タブが替わった時は、見張りの同じ流れで（描かれる前に）当てる。ほかは 1 フレームにまとめる ── */
  let raf = 0;
  const soon = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; try { sync(); } catch (e) { log('sync:' + (e && e.message), 'カードの見直しで止まりました（' + (e && e.message) + '）。'); } }); };
  /* 行の箱が足された時（仮想化・スクロール）は、CSS がそのまま当たるので見直しは要らない。列の役目がまだ分かっていない時（表紙・題字・行が足りない）は
   *  次のフレームで、分かっている時は少し後に 1 回だけ（長い字の行が後から見えた時のため）。毎フレーム列を読み直さない */
  const hasTable = (n) => n.nodeType === 1 && (n.matches('.notion-table-view, [role="tablist"]') || !!n.querySelector('.notion-table-view, [role="tablist"]'));
  const hasItem = (n) => n.nodeType === 1 && (n.matches('.notion-collection-item') || !!n.querySelector('.notion-collection-item'));
  let lazyT = 0;
  const lazy = () => { clearTimeout(lazyT); lazyT = setTimeout(() => { lazyT = 0; soon(); }, 600); };
  let added = [], revRaf = 0;
  const mo = new MutationObserver((recs) => {
    let now = false, later = false, item = false;
    for (const r of recs) {
      if (r.type === 'attributes') { if (r.target.closest && r.target.closest('.notion-frame')) now = true; continue; }
      if (r.target && r.target.nodeType === 1 && r.target.closest && r.target.closest('#c42-ed')) continue;
      for (const n of r.addedNodes) { if (hasTable(n)) { now = true; break; } if (hasItem(n)) { item = true; if (S.on) added.push(...(n.matches('.notion-collection-item') ? [n] : n.querySelectorAll('.notion-collection-item'))); } }
      if (!now && r.removedNodes.length) later = true;
      if (now) break;
    }
    if (added.length && !revRaf) revRaf = requestAnimationFrame(() => { revRaf = 0; const a = added; added = []; try { reveal(a); } catch (e) { /* noop */ } });
    if (now) { try { sync(); } catch (e) { soon(); } return; }
    if (later) soon();
    if (item) { const i = S.info; if (!S.on || !i || i.rows < T.sample && (i.cover < 0 || i.title < 0 || !i.rows)) soon(); else lazy(); }
  });
  function watch() {
    if (!document.body) { setTimeout(watch, 200); return; }
    css('c42-css', BASE);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
    let lastW = 0;
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { const w = window.innerWidth; if (w !== lastW) { lastW = w; soon(); } }) : null;
    if (ro) ro.observe(root); else window.addEventListener('resize', soon);
    /* 本文の枠の幅が変わった時（³³ の Catalogus の開け閉め・Notion のサイドバー）も、カードの幅を測り直す */
    if (typeof ResizeObserver === 'function') {
      let scW = -1;
      S.ro = new ResizeObserver((es) => { const w = Math.round(es[0].contentRect.width); if (w !== scW) { scW = w; if (S.on) soon(); } });
    }
    document.addEventListener('c194:hold', () => { if (S.on) soon(); });
    let href = location.href;
    setInterval(() => { if (location.href !== href) { href = location.href; soon(); } }, 400);
    sync();
  }

  /* ── 操作（³³ の帯のボタン・ScriptCat のメニュー・Console） ── */
  function setCols(on) { S.cols = on == null ? !S.cols : !!on; sync(); return S.cols; }
  function back(b) {
    if (!S.vid || !target(S.db, S.vid)) return 'このビューはカードの対象ではありません';
    const tv = S.tv;
    if (b) ST.v.off[S.vid] = true; else { delete ST.v.off[S.vid]; delete S.bad[S.vid]; }
    S.cols = false;
    if (b && ED.open) edToggle(false);
    const err = save(); sync();
    if (b) fadeIn(tv);
    return err || true;
  }
  function add(db, view) {
    const v = id32(view == null ? S.vid : view), d = id32(db == null ? (view == null ? S.db : '') : db);
    if (!ID32.test(v) || (d && !ID32.test(d))) return 'ID の形（32 桁の 0-9a-f）が違います';
    if (ST.broken) return save();
    const t = ST.v.targets.find((x) => x.view === v);
    if (t) t.db = d; else ST.v.targets.push({ db: d, view: v });
    delete ST.v.off[v]; delete S.bad[v];
    const err = save(); sync();
    return err || true;
  }
  function remove(view) {
    const v = id32(view == null ? S.vid : view);
    if (ST.broken) return save();
    const n = ST.v.targets.length;
    ST.v.targets = ST.v.targets.filter((x) => x.view !== v);
    delete ST.v.off[v];
    if (ST.v.targets.length === n) return 'そのビューは対象にありません';
    const err = save(); sync();
    return err || true;
  }
  function setOn(b) { if (ST.broken) return save(); ST.v.on = !!b; const err = save(); sync(); return err || ST.v.on; }
  function setCover(px) {
    const n = Number(px);
    if (T.covers.indexOf(n) < 0) return '表紙の高さは ' + T.covers.join(' / ') + ' のどれかです';
    if (ST.broken) return save();
    ST.v.cover = n; const err = save(); flipCards(() => sync());
    return err || n;
  }
  function status() {
    const info = S.info, P = S.L;
    return {
      version: VERSION, on: ST.v.on, cover: ST.v.cover, covers: T.covers.slice(), store: SK, broken: ST.broken ? ST.broken.why : null,
      targets: ST.v.targets.map((t) => Object.assign({}, t)), off: Object.keys(ST.v.off), bad: Object.assign({}, S.bad), layouts: Object.keys(ST.v.layouts || {}),
      here: { db: S.db || null, view: S.vid || null, target: !!(S.vid && target(S.db, S.vid)), active: S.on, cols: S.cols, why: S.why,
        width: S.W, columns: P ? P.K : null, coverWidth: P ? P.cw : null, coverHeight: P ? P.ch : null,
        names: info ? info.cols.map((c) => c.name) : [], coverColumn: info ? info.cover : -1, titleColumn: info ? info.title : -1, longColumns: info ? info.long.slice() : [], rowsChecked: info ? info.rows : 0, rowsSkipped: info ? info.skip : 0,
        order: P && info ? P.vis.map((i) => info.keys[i]) : [], hidden: P && info ? P.hidden.map((i) => info.keys[i]) : [], wide: P && info ? P.vis.filter((i) => P.wideOf(i)).map((i) => info.keys[i]) : [],
        labels: P ? P.labels : null, layout: S.vid && ST.v.layouts[S.vid] ? JSON.parse(JSON.stringify(ST.v.layouts[S.vid])) : null, editing: ED.open },
      contract: { split: root.getAttribute('data-c194-split'), want: root.getAttribute('data-c42-want'), back: root.getAttribute('data-c42-back'), hold: root.getAttribute('data-c194-hold'), edit: root.hasAttribute('data-c42-edit') },
      syncs: S.n, frames: FR.max, tables: S.all.length, trail: S.trail.map((x) => Object.assign({}, x)), grip: Object.assign({}, GR.st),
    };
  }
  function reset() {
    const raw = gmGet(SK);
    if (raw != null) { const e = gmSet(SK + '.broken', typeof raw === 'string' ? raw : JSON.stringify(raw)); if (e) return e; }
    ST.v = DEF(); ST.broken = null;
    const err = save(); sync();
    return err || true;
  }
  /* ³³ の帯のボタンからは c42:cols・c42:back・c42:cards・c42:edit（detail なし。スクリプトの箱が違うと detail の中身が届かないことがあるため、名前で分ける） */
  /* v1.2.0: c42:add = 今のビューをカードの対象に足す（Books 以外の表のビューでも）・c42:drop = 対象から外す（標準の表に戻り、配置の設定は残す） */
  const cmd = (c) => {
    if (c === 'cols') setCols(); else if (c === 'back') back(true); else if (c === 'cards') back(false); else if (c === 'edit') edToggle();
    else if (c === 'add') { const r = add(); if (r !== true) toast(String(r)); }
    else if (c === 'drop') { if (ED.open) edToggle(false); const tv = S.tv; const r = remove(); if (r !== true) toast(String(r)); else fadeIn(tv); }
  };
  for (const c of ['cols', 'back', 'cards', 'edit', 'add', 'drop']) document.addEventListener('c42:' + c, () => cmd(c));
  document.addEventListener('c42:cmd', (e) => { let c = ''; try { c = typeof e.detail === 'string' ? e.detail : (e.detail && e.detail.cmd) || ''; } catch (er) { c = ''; } cmd(c); });
  const api = { version: VERSION, status, on: setOn, cover: setCover, cols: setCols, back, add, remove, edit: (on) => edToggle(on),
    layout: (patch, view) => (patch == null ? JSON.parse(JSON.stringify(layoutOf(view ? id32(view) : S.vid))) : setLayout(patch, view ? id32(view) : '')),
    sync: () => { sync(); return status(); }, store: { reset, raw: () => gmGet(SK) } };
  try { pageWin().__c42 = api; } catch (e) { /* noop */ }
  try { window.__c42 = api; } catch (e) { /* noop */ }
  if (typeof GM_registerMenuCommand === 'function') {
    try {
      GM_registerMenuCommand('⁴² カードで読む: 入・切', () => setOn(!ST.v.on));
      GM_registerMenuCommand('⁴² カードの配置を編集', () => edToggle());
      GM_registerMenuCommand('⁴² 表紙の高さを切り替える（' + T.covers.join(' / ') + 'px）', () => { const i = T.covers.indexOf(ST.v.cover); setCover(T.covers[(i + 1) % T.covers.length]); });
      GM_registerMenuCommand('⁴² このビューをカードの対象にする・外す', () => { if (S.vid && target(S.db, S.vid)) remove(); else add(); });
    } catch (e) { /* noop */ }
  }
  watch();
})();
