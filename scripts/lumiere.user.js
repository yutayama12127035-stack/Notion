// ==UserScript==
// @name         « No »　³⁷ _ Lumière
// @namespace    https://cordivestium.local/lumiere
// @version      13.0.0
// @description  v12.0.0: ボードを画面内で折り返す・縦の罫線・ホバーカードの作り直し・題字の Open ボタンの見切れを修正・表紙のセルのボタンを消す。Notion の「見た目」を厚くする柱（²⁶ Atelier ＝文字、³⁸ Scholar ＝学び・計算 と並ぶ三本柱の一つ）。Notion の配色変数（--c-bacPri など 742 個）を丸ごと差し替える配色（紙・羊皮紙・墨・夜の書斎・青磁・桜・美術館…明暗それぞれ）と、表を「Excel のマス目」から「誌面」に（縦線を消す・行を浮かせる・見出しを小さな大文字に）、ギャラリーを「表紙が主役」に（コメントのボタンが表紙を隠さない・浮き上がり・題名を表紙の上に）、ボードを「レーン」に、見出し・コールアウト・引用・トグル・コード・区切り線・箇条書き・チェックボックス・画像・ブックマーク・選択肢のチップ・上の帯・タブ・スクロールバー・選択の色・動き・読み進み具合・表紙の色から取るアクセント まで、モジュールごとに入切。⌃⌥V でパネル。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://*.notion.site/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @noframes
// ==/UserScript==

/*
 * v11.0.0（2026-10-03）
 *   ・カーテン: 開いた瞬間から配色の背景色の幕で隠し、本文が描かれ・書体が読み終わり・画面の変化が一息つくまで（各柱と ¹⁶ の並べ替えが済むまで）
 *     出さない。ページを移る時（リンク・サイドバー・パンくず）も本文の枠だけ隠して、出来上がってから出す。最長 3.2 秒・CSS だけの安全弁つき。
 *   ・上の帯（Share の左）に ◐。押すと Notion のメニューと同じ形の小窓: 配色（全部の見本）・明暗・このページだけ・推し色で配色を作る・
 *     カーテン・紙の質感・本文を一枚の紙に・集中モード・夜は自動で暗く・見本カード・ギャラリーの形。右下の「L」は既定で出さない。
 *   ・推し色: 一色と名前から、明・暗の配色を作って当てる（背景はその色をごく淡く、差し色は補色寄り）。
 *   ・コメントのボタン: アプリの表・ギャラリー・リストで乗せると出る「ボタンの段」（.quickActionContainer）を、どこでも右上の小さな粒に。
 *   ・UI の書体（--cordi-ui）と説明の札（title の代わり）を三本柱でそろえる。見本カードの題名は、画面で使っている書体（Atelier の題字・リレーション）。
 *   ・集中モードのキー ⌃⌥F → ⌃⌥B（⌃⌥F は ²⁶ Atelier のテキストのパネルと重なっていた）。
 * ============================================================
 *  ³⁷ Lumière v1.0.0（2026-10-03）
 * ============================================================
 *  考え方
 *    ・Notion は画面の色を CSS 変数で持っている（2026-10 の実物で 742 個: --c-bacPri 背景・--c-texPri 文字・
 *      --ca-borSecTra 線・--cd-colGalPreCarBac ギャラリーのカード・--cd-tabHeaRowColBac 表の見出しの段 …）。
 *      → 色は「変数を差し替える」のが一番確実で、Notion のどの画面（メニュー・ピーク・コメント）にも一貫して効く。
 *    ・形（角の丸み・影・余白・線）は、実物の構造（公開ページで実測）に当てたセレクターで上書きする。
 *    ・すべてモジュール。入切・強さはパネル（⌃⌥V）で。ページごとに別の配色も。
 *  三本柱
 *    ²⁶ Atelier … 文字（書体・大きさ・字間）。³⁷ Lumière … 見た目（色・形・質感・動き）。³⁸ Scholar … 学びと計算。
 *    書体は Atelier に任せる（Lumière は書体を当てない）。
 *  コンソール
 *    __c37.status() ／ __c37.theme('sumi') ／ __c37.set({ mods: { tables: false } }) ／ __c37.open() ／ __c37.reset()
 * ============================================================
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '13.0.0';
  const TAG = '[³⁷ Lumière v' + VERSION + ']';
  if (window.__c37 && window.__c37.version) { console.warn(TAG, '旧版が動いています'); return; }

  /* ============================================================
   *  1. 保存（ScriptCat の保存領域が本命。無ければ localStorage）
   * ============================================================ */
  const KEY = 'c37.lumiere.v1';
  const HAS_GM = typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
  function load() {
    let v = null;
    if (HAS_GM) { try { v = GM_getValue(KEY, null); if (typeof v === 'string') v = JSON.parse(v); } catch (e) { v = null; } }
    if (!v) { try { v = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { v = null; } }
    return v && typeof v === 'object' ? v : null;
  }
  let saveT = 0;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      const j = JSON.stringify(S);
      if (HAS_GM) { try { GM_setValue(KEY, j); } catch (e) { /* noop */ } }
      try { localStorage.setItem(KEY, j); } catch (e) { /* noop */ }
    }, 120);
  }

  /* ============================================================
   *  2. 色の計算
   * ============================================================ */
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function hex2rgb(h) {
    h = String(h || '').trim();
    let m = /^#?([0-9a-f]{3})$/i.exec(h);
    if (m) return m[1].split('').map((c) => parseInt(c + c, 16));
    m = /^#?([0-9a-f]{6})$/i.exec(h);
    if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
    m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(h);
    if (m) return [+m[1], +m[2], +m[3]];
    return [128, 128, 128];
  }
  const rgb2hex = (r) => '#' + r.map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
  function rgb2hsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h = 0, s = 0; const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }
  function hsl2rgb([h, s, l]) {
    h = ((h % 360) + 360) % 360 / 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
    if (!s) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  }
  const mix = (a, b, t) => { const x = hex2rgb(a), y = hex2rgb(b); return rgb2hex(x.map((v, i) => v + (y[i] - v) * t)); };
  const rgba = (c, a) => { const x = hex2rgb(c); return 'rgba(' + x.map(Math.round).join(',') + ',' + (+a).toFixed(3) + ')'; };
  const lum = (c) => { const x = hex2rgb(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * x[0] + 0.7152 * x[1] + 0.0722 * x[2]; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const isDark = (c) => lum(c) < 0.22;
  const shade = (c, dl) => { const h = rgb2hsl(hex2rgb(c)); h[2] = clamp(h[2] + dl, 0, 100); return rgb2hex(hsl2rgb(h)); };
  const sat = (c, ds) => { const h = rgb2hsl(hex2rgb(c)); h[1] = clamp(h[1] + ds, 0, 100); return rgb2hex(hsl2rgb(h)); };
  const hue = (c, dh) => { const h = rgb2hsl(hex2rgb(c)); h[0] += dh; return rgb2hex(hsl2rgb(h)); };
  /* 背景に対して読める文字色まで、明るさを動かす */
  function readable(fg, bg, min) {
    min = min || 4.5;
    let c = fg, i = 0;
    const dir = isDark(bg) ? 4 : -4;
    while (contrast(c, bg) < min && i++ < 30) c = shade(c, dir);
    return c;
  }

  /* ============================================================
   *  3. 配色の型（明・暗それぞれ）
   *     bg ページ / side サイドバー / sheet 本文の紙 / raised カード / ink 文字 / mute 薄い文字 / line 線 /
   *     accent アクセント / accent2 二色目 / tint 表の見出し・選択などの淡い面
   * ============================================================ */
  const THEMES = [
    { id: 'notion', name: 'Notion のまま', en: 'Default', desc: '色は変えない（形・質感のモジュールだけを使う）', none: true,
      light: { bg: '#ffffff', side: '#f9f8f7', sheet: '#ffffff', raised: '#ffffff', ink: '#2c2c2b', mute: '#7d7a75', line: '#e6e5e3', accent: '#2783de', accent2: '#9065b0', tint: '#f7f6f3' },
      dark: { bg: '#191919', side: '#202020', sheet: '#191919', raised: '#252525', ink: '#e6e6e4', mute: '#9b9a97', line: '#2f2f2f', accent: '#2783de', accent2: '#9065b0', tint: '#202020' } },
    { id: 'paper', name: '紙', en: 'Paper', desc: '生成りの上質紙に墨の文字。どの書体とも喧嘩しない基本',
      tex: 'paper', radius: 10,
      light: { bg: '#f4f0e8', side: '#ece6da', sheet: '#fbf9f4', raised: '#fffdf8', ink: '#2b2722', mute: '#857c70', line: '#e1d9cb', accent: '#a0522d', accent2: '#5b6b48', tint: '#f1ebdf' },
      dark: { bg: '#1c1a17', side: '#181613', sheet: '#22201c', raised: '#2a2723', ink: '#ece5d8', mute: '#a59a8a', line: '#3a3530', accent: '#d08a5c', accent2: '#9db083', tint: '#26231f' } },
    { id: 'vellum', name: '羊皮紙', en: 'Vellum', desc: '少し黄みの強い古い紙。金茶の差し色。蔵書・読書記録に',
      tex: 'vellum', radius: 8,
      light: { bg: '#efe4cc', side: '#e6d8bb', sheet: '#f8f0dc', raised: '#fbf5e6', ink: '#3b2f1e', mute: '#8a7656', line: '#dccaa4', accent: '#8c5a1c', accent2: '#6f3d38', tint: '#efe2c4' },
      dark: { bg: '#1e1912', side: '#19150f', sheet: '#251f17', raised: '#2d261c', ink: '#efe2c8', mute: '#ad9a78', line: '#3f3527', accent: '#d39b54', accent2: '#c27c74', tint: '#2a231a' } },
    { id: 'sumi', name: '墨', en: 'Sumi', desc: '白い和紙に墨と朱。余白の多い、凛とした和の誌面',
      tex: 'washi', radius: 4,
      light: { bg: '#f6f5f1', side: '#efede7', sheet: '#ffffff', raised: '#ffffff', ink: '#1f1e1c', mute: '#76736c', line: '#e4e1d9', accent: '#b8312f', accent2: '#2f4f4f', tint: '#f3f1ec' },
      dark: { bg: '#121212', side: '#0e0e0e', sheet: '#181817', raised: '#1f1f1d', ink: '#ecebe6', mute: '#9a978f', line: '#2c2b28', accent: '#e05a4f', accent2: '#79a3a3', tint: '#1c1c1a' } },
    { id: 'library', name: '夜の書斎', en: 'Midnight Library', desc: '深い紺に真鍮の灯り。暗い部屋で長く読む時に',
      tex: 'none', radius: 12,
      light: { bg: '#eef0f4', side: '#e3e7ee', sheet: '#f9fafc', raised: '#ffffff', ink: '#1c2435', mute: '#6b7488', line: '#d9dee8', accent: '#9a7425', accent2: '#3b5b92', tint: '#e9edf3' },
      dark: { bg: '#0f1626', side: '#0b111e', sheet: '#141c2e', raised: '#1a2337', ink: '#e7e3d6', mute: '#9aa3b6', line: '#26314a', accent: '#d6b061', accent2: '#7fa3dd', tint: '#18213a' } },
    { id: 'celadon', name: '青磁', en: 'Celadon', desc: '青磁の淡い緑青。静かで目に優しい。勉強・研究ノートに',
      tex: 'none', radius: 10,
      light: { bg: '#eef3f0', side: '#e2ebe6', sheet: '#f8fbf9', raised: '#ffffff', ink: '#1f2d28', mute: '#677a72', line: '#d3e0d9', accent: '#2f7d6b', accent2: '#7a6a9b', tint: '#e6efea' },
      dark: { bg: '#121a17', side: '#0e1512', sheet: '#16201c', raised: '#1c2823', ink: '#e1ebe6', mute: '#8fa69c', line: '#263630', accent: '#5dbfa5', accent2: '#ab9cd0', tint: '#18231f' } },
    { id: 'sakura', name: '桜', en: 'Sakura', desc: '薄紅と灰梅。柔らかく華やか。日記・趣味の記録に',
      tex: 'none', radius: 14,
      light: { bg: '#f9f1f2', side: '#f2e5e7', sheet: '#fffafa', raised: '#ffffff', ink: '#33262a', mute: '#8b7378', line: '#ecd9dc', accent: '#c4547a', accent2: '#6f7fb0', tint: '#f6e9eb' },
      dark: { bg: '#1c1517', side: '#171113', sheet: '#22191c', raised: '#2a1f23', ink: '#f1e4e7', mute: '#b3979e', line: '#3a2a2f', accent: '#e886a8', accent2: '#9fb0e0', tint: '#261c1f' } },
    { id: 'museum', name: '美術館', en: 'Museum', desc: '真っ白な壁に作品を掛けるように。影は深く、線は消す。ギャラリー向き',
      tex: 'none', radius: 2,
      light: { bg: '#f3f3f1', side: '#ebebe8', sheet: '#ffffff', raised: '#ffffff', ink: '#161616', mute: '#73736e', line: '#e3e3df', accent: '#a8873b', accent2: '#3d3d3d', tint: '#f2f2ef' },
      dark: { bg: '#0d0d0d', side: '#0a0a0a', sheet: '#141414', raised: '#1b1b1b', ink: '#efefec', mute: '#94948f', line: '#262626', accent: '#cfae62', accent2: '#bdbdbd', tint: '#181818' } },
    { id: 'botanical', name: '植物標本', en: 'Botanical', desc: '標本箱のような生成りと深緑。図鑑・コレクションに',
      tex: 'paper', radius: 8,
      light: { bg: '#eef0e6', side: '#e4e8d8', sheet: '#f9faf3', raised: '#fdfef8', ink: '#22291c', mute: '#6e7660', line: '#d8ddc8', accent: '#3f6b2a', accent2: '#9a5b2e', tint: '#e9ecdf' },
      dark: { bg: '#141811', side: '#10140d', sheet: '#191e15', raised: '#20261b', ink: '#e4ead8', mute: '#9aa58a', line: '#2c3426', accent: '#8dbf69', accent2: '#d79a6b', tint: '#1b2117' } },
    { id: 'blueprint', name: '青写真', en: 'Blueprint', desc: '方眼の入った設計図。数字と表が多い DB・計画に',
      tex: 'grid', radius: 6,
      light: { bg: '#edf2f8', side: '#e1e9f3', sheet: '#f8fbff', raised: '#ffffff', ink: '#13253d', mute: '#5f7390', line: '#d2deec', accent: '#1f5fbf', accent2: '#c2410c', tint: '#e6eef8' },
      dark: { bg: '#0b1a2e', side: '#081525', sheet: '#0f2038', raised: '#132745', ink: '#e1ecfb', mute: '#8ea7c8', line: '#1e3657', accent: '#6aa6ff', accent2: '#ff9466', tint: '#11233f' } },
    { id: 'mono', name: '活版', en: 'Letterpress', desc: '白と黒だけ。色を消して文字と余白だけで見せる',
      tex: 'none', radius: 0,
      light: { bg: '#fafafa', side: '#f2f2f2', sheet: '#ffffff', raised: '#ffffff', ink: '#111111', mute: '#6b6b6b', line: '#e2e2e2', accent: '#111111', accent2: '#6b6b6b', tint: '#f4f4f4' },
      dark: { bg: '#0a0a0a', side: '#060606', sheet: '#111111', raised: '#171717', ink: '#f2f2f2', mute: '#9a9a9a', line: '#262626', accent: '#f2f2f2', accent2: '#9a9a9a', tint: '#151515' } },
    { id: 'aurora', name: '極光', en: 'Aurora', desc: '紫から翠へ移る夜空。ダッシュボード・ホームに華を',
      tex: 'glow', radius: 16,
      light: { bg: '#f1f0f8', side: '#e7e5f3', sheet: '#fbfaff', raised: '#ffffff', ink: '#211d33', mute: '#6f6a88', line: '#dedbef', accent: '#6d4fd8', accent2: '#13a383', tint: '#ece9f8' },
      dark: { bg: '#0f0d1c', side: '#0b0916', sheet: '#151229', raised: '#1c1834', ink: '#ece9fb', mute: '#a29dc0', line: '#2a2546', accent: '#9d86ff', accent2: '#3fe0b8', tint: '#1a1631' } },
    { id: 'tea', name: '茶室', en: 'Tea Room', desc: '抹茶と焦茶、障子の白。落ち着いた和の書斎',
      tex: 'washi', radius: 6,
      light: { bg: '#f0eee4', side: '#e7e3d4', sheet: '#faf9f2', raised: '#fdfcf6', ink: '#2a2a1f', mute: '#76745f', line: '#dedac6', accent: '#5f7a2f', accent2: '#7a4b2a', tint: '#ebe8db' },
      dark: { bg: '#161610', side: '#12120d', sheet: '#1c1c15', raised: '#23231a', ink: '#e8e6d4', mute: '#a3a189', line: '#303022', accent: '#a5c46a', accent2: '#c48c62', tint: '#1f1f17' } }
  ];
  let THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t]));
  const allThemes = () => THEMES.concat((S && S.custom) || []);
  const reindexThemes = () => { THEME_BY_ID = Object.fromEntries(allThemes().map((t) => [t.id, t])); };

  /* ============================================================
   *  4. 設定（既定値）
   * ============================================================ */
  const MODS = [
    /* id, 組, 名前, 説明, 既定 */
    ['palette', '色と質感', '配色', 'Notion の色変数（背景・文字・線・影・アクセント）を、選んだ配色に丸ごと差し替える。メニュー・ピーク・コメントまで一貫して変わる', true],
    ['texture', '色と質感', '紙の質感', '背景に紙のざらつき・和紙の繊維・方眼・光のにじみ（配色ごとに決まった質感）', true],
    ['sheet', '色と質感', '本文を一枚の紙に', '本文の列を、背景から少し浮いた一枚の紙（角の丸み・影）にする。ページが「綴じた紙」に見える', false],
    ['header', '誌面', 'タイトルまわり', '表紙の下端を本文へ溶かす・アイコンに光輪・タイトルの下に細い飾り線・プロパティ欄をカードに', true],
    ['headings', '誌面', '見出し', '見出し 1〜3 に、アクセントの印（左の細い帯・下線・小さな飾り）。形はパネルで', true],
    ['callout', '誌面', 'コールアウト', '色面の箱を、左にアクセントの帯がある薄いガラスのカードに', true],
    ['quote', '誌面', '引用', '左の太線を細い線と大きな引用符に。本文より少し大きく、色を落として', true],
    ['toggle', '誌面', 'トグル', '開閉の三角を細い矢印に・開いた中身に左の細い線・開閉を滑らかに', true],
    ['code', '誌面', 'コード', 'コードの箱を、配色に合わせた落ち着いた面と細い枠に', true],
    ['divider', '誌面', '区切り線', '一本線を、飾り（❦）・グラデーション・点線などに', true],
    ['bullets', '誌面', '箇条書き・番号', '黒丸を、アクセント色の菱形・細い棒などに。番号を等幅の数字に', true],
    ['todo', '誌面', 'チェックボックス', '丸いチェック・済んだ項目は線を引いて薄く', true],
    ['media', '誌面', '画像・ブックマーク', '画像の角を丸めて影・キャプションを小さく・ブックマークを横長のカードに', true],
    ['tables', 'データベース', '表を誌面に', '「Excel のマス目」をやめる: 縦線を消す・横線を細く・見出しの段を小さな大文字に・行に乗せると左に印と淡い面・数は等幅で右', true],
    ['gallery', 'データベース', 'ギャラリーを表紙主役に', '表紙を大きく・角を丸め影・乗せると少し浮いて表紙がわずかに寄る。題名を表紙の上に重ねる形も', true],
    ['cardbar', 'データベース', 'カードのボタンを角へ', 'カードに乗せると出るボタン（コメント・編集・…）を、表紙を隠さない小さなガラスの粒にして右上へ', true],
    ['board', 'データベース', 'ボードをレーンに', '列を淡い面のレーンに・列の見出しを丸い札に・カードはギャラリーと同じ質感', true],
    ['list', 'データベース', 'リストビュー', '行の間を広げ、乗せた行に淡い面と左の印', true],
    ['chips', 'データベース', '選択肢のチップ', 'セレクト・マルチセレクト・ステータスの札を、丸い小石（点つき）・枠だけ・塗りから選ぶ', true],
    ['dbhead', 'データベース', 'DB の見出し・タブ', 'ビューのタブを、選択中だけ下に印のある切り替えに。グループの見出しを大きく', true],
    ['topbar', '画面', '上の帯', '上の帯（パンくず・共有）をすりガラスに', true],
    ['menus', '画面', 'メニュー・窓', 'メニュー・ポップアップ・ピークの窓の角と影を配色に合わせて深く', true],
    ['scrollbar', '画面', 'スクロールバー', '細く・配色に合わせた色に', true],
    ['selection', '画面', '選択とカーソル', '文字を選んだ時の色・入力の縦棒をアクセント色に', true],
    ['motion', '画面', '動き', 'ページを開いた時にふわっと出る・乗せた時の動きを滑らかに（「動きを減らす」設定の端末では止める）', true],
    ['progress', '画面', '読み進み具合', '画面の上端に、今どこまで読んだかの細い線', true],
    ['coverAccent', '画面', '表紙からアクセント', 'ページの表紙（またはアイコン）の色を読み取って、そのページのアクセント色にする', false],
    ['genCover', '誌面', '表紙の無いページに飾り', '表紙を付けていないページの上部に、配色から作った淡い模様（光のにじみ・波・方眼・紙片）を敷く。ページの題名から模様が決まるので、ページごとに少しずつ違う', true],
    ['dropcap', '誌面', '頭文字', '本文の最初の段落の 1 文字目を大きく（雑誌・本の章の始まりのように）', false],
    ['endmark', '誌面', '終わりの印', 'ページの最後に小さな飾り（❧）。どこで終わったかが分かる', true],
    ['iconTiles', 'データベース', 'アイコンを札に', '表の題字・ギャラリー・ボードのアイコンを、アクセントの淡い四角い札の上に載せる', false],
    ['stickyGlass', 'データベース', '貼り付く見出しをすりガラスに', '表の列見出し・グループ見出しがスクロールで上に貼り付いた時、背景の質感と馴染むすりガラスにする', true],
    ['calendar', 'データベース', 'カレンダー・タイムライン', '今日の印をアクセントの丸に・予定の札を角丸と影に', true],
    ['curtain', '画面', 'カーテン（読み込みを見せない）', '開いた時・ページを移る時に、Notion の読み込みと各柱の描き直しを配色の幕で隠し、出来上がった画面だけを出す（最長 3.2 秒・CSS だけの安全弁つき）', true],
    ['boardWrap', 'データベース', 'ボードを折り返す', 'ボードの列を横一列に並べず、画面の幅で折り返して段にする（見出しの段・カードの段・見出しの段…）。横にスクロールしなくても全部見える', true],
    ['hoverCard', 'データベース', 'ページの見本カード', 'リレーションのチップ・表の題字に乗せて少し待つと、そのページの表紙・アイコン・題名のカードがふわっと出る', true]
  ];
  const DEF = {
    v: 1,
    theme: 'paper',
    mode: 'auto',          // auto: Notion の明暗に合わせる / light / dark
    mods: Object.fromEntries(MODS.map((m) => [m[0], m[4]])),
    tune: {
      radius: '',          // 空 = 配色の値
      shadow: 1,           // 影の深さ 0〜2
      texture: 1,          // 質感の強さ 0〜2
      density: 1,          // 表・リストの行の高さ 0.8〜1.4
      accent: '',          // アクセントの上書き（#rrggbb）
      sheetWidth: '',      // 本文の紙の幅（空 = Notion のまま）
      tableStyle: 'editorial',   // editorial（誌面）/ ledger（罫線帳）/ cards（行を浮かせる）
      colLines: 'soft',          // v12: 縦の罫線（列の境目）none / hair / soft / strong
      lastColLine: true,         // v13: 最後の列の右の線（表の右端の縦線）
      boardCols: 0,              // v12: ボードを折り返す時の 1 段の列の数（0 = 画面の幅に合わせる）
      zebra: false,
      galleryTitle: 'below',     // below / overlay
      galleryLift: 1,
      chips: 'pebble',           // pebble / outline / solid / plain
      bullets: 'diamond',        // diamond / dot / dash / circle / notion
      divider: 'fleuron',        // fleuron / gradient / dots / double / notion
      heading: 'rule',           // rule（下線）/ bar（左の帯）/ ornament（飾り）/ plain
      calloutStyle: 'glass',     // glass / outline / notion
      motion: 1,
      galleryStyle: 'card',      // card / polaroid / frame（額装）/ shelf（本棚）/ flat
      coverPattern: 'auto',      // auto / mesh / waves / grid / confetti
      schedule: false,           // 夜は自動で暗く（mode が auto の時）
      nightFrom: 19, nightTo: 6,
      hoverDelay: 450,
      curtainMax: 3200,
      fab: false,                // 右下の丸いボタン（v11 から既定で出さない。上の帯の ◐ から）
      oshiColor: '#d4709a', oshiName: ''
    },
    custom: [],            // 自作の配色 [{ id, name, en, desc, light, dark, tex, radius }]
    pages: {},             // ページ id → 配色 id（このページだけ）
    accentCache: {}
  };
  let S = (() => {
    const v = load();
    const o = JSON.parse(JSON.stringify(DEF));
    if (v) {
      Object.assign(o, v);
      o.mods = Object.assign({}, DEF.mods, v.mods || {});
      o.tune = Object.assign({}, DEF.tune, v.tune || {});
      o.pages = v.pages || {};
      o.accentCache = v.accentCache || {};
      o.custom = Array.isArray(v.custom) ? v.custom : [];
    }
    return o;
  })();
  reindexThemes();
  const ST = { builds: 0, dark: false, theme: '', page: '', accent: '', lastError: '' };
  const on = (id) => !!S.mods[id];
  const T = (k) => S.tune[k];

  /* ============================================================
   *  5. 今のページ・明暗
   * ============================================================ */
  const pageId = () => { const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname) || /([0-9a-f]{32})/i.exec(location.pathname); return m ? m[1].toLowerCase() : ''; };
  const peekId = () => { try { const p = new URLSearchParams(location.search).get('p'); return p && /^[0-9a-f]{32}$/i.test(p) ? p.toLowerCase() : ''; } catch (e) { return ''; } };
  function notionDark() {
    const b = document.body, h = document.documentElement;
    if (b && (b.classList.contains('notion-dark-theme') || b.classList.contains('dark'))) return true;
    if (h && (h.classList.contains('notion-dark-theme') || h.classList.contains('dark'))) return true;
    if (b && b.classList.contains('notion-light-theme')) return false;
    try { return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) && !(b && b.classList.contains('notion-body') && getComputedStyle(b).getPropertyValue('--c-bacPri').trim() === '#fff'); } catch (e) { return false; }
  }
  /* 夜は自動で暗く（明るさが「Notion に合わせる」の時だけ。Notion が明るい時でも、この時間は暗い配色） */
  function nightNow() {
    if (!S.tune.schedule) return false;
    const h = new Date().getHours(), a = +S.tune.nightFrom, b = +S.tune.nightTo;
    return a > b ? (h >= a || h < b) : (h >= a && h < b);
  }
  function curTheme() {
    const id = S.pages[pageId()] || S.theme;
    return THEME_BY_ID[id] || THEME_BY_ID.paper;
  }
  function curPalette() {
    const th = curTheme();
    const dark = S.mode === 'dark' || (S.mode === 'auto' && (notionDark() || nightNow()));
    const p = Object.assign({}, dark ? th.dark : th.light);
    let acc = S.tune.accent && /^#[0-9a-f]{6}$/i.test(S.tune.accent) ? S.tune.accent : '';
    if (!acc && on('coverAccent')) { const c = S.accentCache[pageId()]; if (c) acc = dark ? shade(c, 12) : c; }
    if (acc) p.accent = readable(acc, p.sheet, 3);
    p.dark = dark;
    p.radius = S.tune.radius !== '' && S.tune.radius != null ? +S.tune.radius : (th.radius != null ? th.radius : 10);
    p.tex = th.tex || 'none';
    p.none = !!th.none;
    return p;
  }

  /* ============================================================
   *  6. Notion の色変数への差し替え
   *     （2026-10 の実物の :root, .notion-light-theme にある変数。暗い時は .notion-dark-theme も上書き）
   * ============================================================ */
  const ROOTS = 'html:root:root, html .notion-body.notion-body.notion-body, html .notion-light-theme.notion-light-theme.notion-light-theme, html .notion-dark-theme.notion-dark-theme.notion-dark-theme';
  function notionVars(p) {
    const ink = p.ink, bg = p.bg, sh = Math.max(0, +T('shadow') || 0);
    const shc = p.dark ? '0,0,0' : hex2rgb(mix(ink, '#000000', 0.4)).map(Math.round).join(',');
    const a = (x) => (x * sh * (p.dark ? 2.4 : 1)).toFixed(3);
    const V = {
      '--c-bacPri': p.bg, '--c-bacSec': p.side, '--c-bacTer': mix(p.side, ink, 0.05), '--c-bacEle': p.raised,
      '--c-texPri': ink, '--c-texSec': p.mute, '--c-texTer': mix(p.mute, bg, 0.3), '--c-texDis': mix(p.mute, bg, 0.5),
      '--c-borPri': p.line, '--c-borSec': mix(p.line, bg, 0.5),
      '--c-icoPri': mix(ink, bg, 0.05), '--c-icoSec': p.mute, '--c-icoTer': mix(p.mute, bg, 0.3),
      '--ca-borPriTra': rgba(ink, 0.12), '--ca-borSecTra': rgba(ink, 0.075), '--ca-bacIntTra': rgba(ink, 0.05),
      '--ca-bacSecTra': rgba(ink, 0.03), '--ca-bacTerTra': rgba(ink, 0.07), '--ca-texDisTra': rgba(ink, 0.3),
      '--cd-colGalPreCarBac': p.raised, '--cd-boaIteDefBac': p.raised, '--cd-tabHeaRowColBac': p.tint,
      '--cd-codBloBac': mix(p.sheet, ink, p.dark ? 0.06 : 0.035), '--cd-embPlaBac': mix(p.sheet, ink, 0.05),
      '--c-bluTexAccPri': p.accent, '--c-bluBacAccPri': p.accent, '--c-bluIcoAccPri': p.accent, '--c-bluBacAccSec': shade(p.accent, 8),
      '--c-bluTexSec': p.accent, '--c-bluTexPri': shade(p.accent, p.dark ? 15 : -15),
      '--cl-pilSelBacBlu': rgba(p.accent, 0.08), '--cl-pilSelBorBlu': rgba(p.accent, 0.4), '--cl-pilSelHovBorBlu': rgba(p.accent, 0.4), '--cl-pilSelPreBorBlu': rgba(p.accent, 0.4),
      '--cl-carHovBac': rgba(ink, 0.035), '--cl-carPreBac': rgba(ink, 0.06), '--cl-hovDisBac': rgba(ink, 0.03), '--cl-linDecCol': rgba(ink, 0.25),
      '--cl-pagTitPlaTexCol': rgba(ink, 0.18),
      '--c-shaBasSm': '0px 4px 12px 0px rgba(' + shc + ',' + a(0.04) + '), 0px 1px 2px 0px rgba(' + shc + ',' + a(0.03) + ')',
      '--c-shaBasMd': '0px 8px 18px 0px rgba(' + shc + ',' + a(0.06) + '), 0px 2px 6px 0px rgba(' + shc + ',' + a(0.04) + ')',
      '--c-shaBasLg': '0px 22px 34px 0px rgba(' + shc + ',' + a(0.09) + '), 0px 6px 10px 0px rgba(' + shc + ',' + a(0.05) + ')',
      '--c-shaOutSm': '0px 2px 4px 0px rgba(' + shc + ',' + a(0.05) + '), 0px 0px 0px 1px ' + rgba(ink, 0.08),
      '--c-shaOutMd': '0px 8px 18px 0px rgba(' + shc + ',' + a(0.07) + '), 0px 2px 6px 0px rgba(' + shc + ',' + a(0.05) + '), 0px 0px 0px 1px ' + rgba(ink, 0.08),
      '--c-shaOutLg': '0px 22px 34px 0px rgba(' + shc + ',' + a(0.1) + '), 0px 6px 10px 0px rgba(' + shc + ',' + a(0.06) + '), 0px 0px 0px 1px ' + rgba(ink, 0.08),
      '--c-shaOutScr': '0px 28px 56px 0px rgba(' + shc + ',' + a(0.26) + '), 0px 6px 14px 0px rgba(' + shc + ',' + a(0.14) + '), 0px 0px 0px 1px ' + rgba(ink, 0.08),
      '--c-shaBasScr': '0px 28px 56px 0px rgba(' + shc + ',' + a(0.26) + '), 0px 6px 14px 0px rgba(' + shc + ',' + a(0.14) + ')'
    };
    return V;
  }
  /* Lumière 自身の変数（モジュールの CSS が読む） */
  function lmVars(p) {
    const r = p.radius, ink = p.ink;
    return {
      '--lm-bg': p.bg, '--lm-side': p.side, '--lm-sheet': p.sheet, '--lm-raised': p.raised, '--lm-ink': ink, '--lm-mute': p.mute,
      '--lm-line': p.line, '--lm-line-soft': rgba(ink, 0.07), '--lm-line-hair': rgba(ink, 0.05),
      '--lm-accent': p.accent, '--lm-accent2': p.accent2, '--lm-accent-soft': rgba(p.accent, p.dark ? 0.16 : 0.09), '--lm-accent-line': rgba(p.accent, 0.45),
      '--lm-accent-ink': readable(p.accent, p.sheet, 4.5), '--lm-on-accent': isDark(p.accent) ? '#ffffff' : '#111111',
      '--lm-tint': p.tint, '--lm-hover': rgba(ink, p.dark ? 0.05 : 0.035), '--lm-press': rgba(ink, 0.07),
      '--lm-r': r + 'px', '--lm-r-sm': Math.max(0, Math.round(r * 0.55)) + 'px', '--lm-r-lg': Math.round(r * 1.4) + 'px',
      '--lm-shadow-card': 'var(--c-shaOutMd)', '--lm-shadow-lift': 'var(--c-shaOutLg)',
      '--lm-glass': p.dark ? 'rgba(20,20,22,.55)' : 'rgba(255,255,255,.62)', '--lm-glass-line': rgba(ink, 0.1),
      '--lm-density': String(+T('density') || 1), '--lm-motion': String(+T('motion') || 0)
    };
  }
  const declare = (vars) => Object.entries(vars).map(([k, v]) => '  ' + k + ': ' + v + ' !important;').join('\n');

  /* ============================================================
   *  7. 質感（背景の絵。SVG を data URI で。外から何も読まない）
   * ============================================================ */
  const svgUrl = (svg) => 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
  function texture(p) {
    const k = +T('texture'); if (!k || !on('texture')) return '';
    const ink = hex2rgb(p.ink).map((x) => (x / 255).toFixed(3));
    const al = (x) => (x * k * (p.dark ? 1.4 : 1)).toFixed(3);
    const noise = (freq, alpha, oct) => svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="' + (oct || 2) + '" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ' + ink[0] + ' 0 0 0 0 ' + ink[1] + ' 0 0 0 0 ' + ink[2] + ' 0 0 0 ' + alpha + ' 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>');
    switch (p.tex) {
      case 'paper': return noise('0.85', al(0.06), 3);
      case 'vellum': return noise('0.65', al(0.12), 3) + ', radial-gradient(ellipse at 50% 40%, transparent 55%, ' + rgba(mix(p.bg, '#5a3a10', 0.5), 0.12 * k) + ' 100%)';
      case 'washi': return svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.42" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 ' + ink[0] + ' 0 0 0 0 ' + ink[1] + ' 0 0 0 0 ' + ink[2] + ' 0 0 0 ' + al(0.1) + ' 0"/></filter><rect width="100%" height="100%" filter="url(#f)"/></svg>') + ', ' + noise('0.9', al(0.04), 2);
      case 'grid': return 'linear-gradient(' + rgba(p.accent, 0.07 * k) + ' 1px, transparent 1px), linear-gradient(90deg, ' + rgba(p.accent, 0.07 * k) + ' 1px, transparent 1px), linear-gradient(' + rgba(p.accent, 0.035 * k) + ' 1px, transparent 1px), linear-gradient(90deg, ' + rgba(p.accent, 0.035 * k) + ' 1px, transparent 1px)';
      case 'glow': return 'radial-gradient(60% 50% at 0% 0%, ' + rgba(p.accent, 0.13 * k) + ', transparent 70%), radial-gradient(50% 45% at 100% 10%, ' + rgba(p.accent2, 0.11 * k) + ', transparent 70%), radial-gradient(70% 60% at 50% 110%, ' + rgba(mix(p.accent, p.accent2, 0.5), 0.08 * k) + ', transparent 70%)';
      default: return '';
    }
  }
  const texSize = (p) => (p.tex === 'grid' ? '80px 80px, 80px 80px, 16px 16px, 16px 16px' : p.tex === 'glow' ? '100% 100%' : '');

  /* ============================================================
   *  8. モジュールの CSS
   *     セレクターは 2026-10 の実物（公開ページ）で確かめた形。
   *     B で詳しさを上げて、Notion の style 属性（インライン）より強くする時は !important。
   * ============================================================ */
  const B = ':not(#lm0):not(#lm1)';
  const SCOPE = ':is(.notion-frame, .notion-peek-renderer)';
  const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const NCOL = ['Gra', 'Bro', 'Ora', 'Yel', 'Gre', 'Blu', 'Pur', 'Pin', 'Red'];
  const palMain = (c) => (c === 'Gra' ? 'var(--cl-palGra300)' : 'var(--cd-pal' + c + '500)');
  const palSoft = (c) => 'var(--cl-pal' + c + '30)';

  const CSS = {};
  CSS.texture = (p) => {
    const tex = texture(p);
    if (!tex) return '';
    const size = texSize(p);
    return `
/* 紙の質感（背景の絵は SVG。外から何も読まない） */
html .notion-frame${B}, html .notion-peek-renderer > div${B} {
  background-color: var(--c-bacPri) !important;
  background-image: ${tex} !important;
  ${size ? 'background-size: ' + size + ' !important;' : ''}
  background-attachment: local;
}
html .notion-frame .notion-scroller${B} { background: transparent !important; }
html .notion-sidebar-container${B} { background-image: ${tex} !important; ${size ? 'background-size: ' + size + ' !important;' : ''} }`;
  };
  CSS.sheet = (p) => `
/* 本文を一枚の紙に（ふつうのページだけ。DB の全面ページは対象外） */
html .notion-frame .layout:has(.notion-page-content) > .layout-content${B} {
  background: var(--lm-sheet);
  border-radius: var(--lm-r-lg);
  box-shadow: var(--c-shaOutMd);
  margin-block: 18px 64px;
  padding-block: 28px 40px;
  outline: 1px solid var(--lm-line-hair);
  ${T('sheetWidth') ? 'max-width: ' + (+T('sheetWidth')) + 'px; margin-inline: auto;' : ''}
}
html .notion-frame .layout:has(.notion-page-content) .notion-page-content${B} { background: transparent !important; }`;

  CSS.header = () => `
/* 表紙の下端を本文へ溶かす */
html .notion-frame .layout-full img[style*="object-fit: cover"]:not(.notion-collection-item img)${B} {
  -webkit-mask-image: linear-gradient(to bottom, #000 62%, rgba(0,0,0,.55) 84%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 62%, rgba(0,0,0,.55) 84%, transparent 100%);
}
/* タイトルの下に細い飾り線（アクセント → 透明） */
html .notion-frame .notion-page-block:has(> h1[aria-roledescription="page title"])${B} { position: relative; }
html .notion-frame .notion-page-block:has(> h1[aria-roledescription="page title"])${B}::after {
  content: ''; display: block; height: 1px; margin-top: 14px; width: min(220px, 40%);
  background: linear-gradient(90deg, var(--lm-accent), transparent);
  opacity: .75;
}
/* ページのアイコン（タイトルの上の大きなアイコン）にうっすら光輪 */
html .notion-frame .layout-content .notion-record-icon[role="button"]:is([style*="height: 78px"], [style*="height: 72px"], [style*="height: 124px"])${B} {
  filter: drop-shadow(0 6px 14px ${'var(--lm-accent-soft)'});
}`;

  CSS.headings = () => {
    const st = T('heading');
    const H = (n) => 'html ' + SCOPE + ' .notion-' + n + '-block';
    const all = [H('header'), H('sub_header'), H('sub_sub_header')].map((x) => x + B).join(', ');
    if (st === 'plain') return '';
    if (st === 'bar') return `
${[H('header'), H('sub_header')].map((x) => x + B + ' > div').join(', ')} {
  border-inline-start: 3px solid var(--lm-accent); padding-inline-start: 12px !important; border-radius: 1px;
}
${H('sub_sub_header')}${B} > div { border-inline-start: 2px solid var(--lm-accent-line); padding-inline-start: 10px !important; }`;
    if (st === 'ornament') return `
${all} > div { position: relative; }
${H('header')}${B} > div::before { content: '❧'; position: absolute; inset-inline-start: -26px; top: 50%; transform: translateY(-50%); color: var(--lm-accent); font-size: .8em; opacity: .8; }
${H('sub_header')}${B} > div::before { content: '§'; position: absolute; inset-inline-start: -20px; top: 50%; transform: translateY(-50%); color: var(--lm-accent); font-size: .75em; opacity: .7; }`;
    return `
/* 見出し: 下に細い線、左端だけアクセント */
${H('header')}${B} > div, ${H('sub_header')}${B} > div {
  background-image: linear-gradient(90deg, var(--lm-accent) 0 36px, var(--lm-line-soft) 36px 100%);
  background-size: 100% 1px; background-repeat: no-repeat; background-position: 0 100%;
  padding-bottom: 6px !important;
}
${H('sub_sub_header')}${B} > div { background-image: linear-gradient(90deg, var(--lm-accent-line) 0 18px, transparent 18px); background-size: 100% 1px; background-repeat: no-repeat; background-position: 0 100%; padding-bottom: 3px !important; }`;
  };

  CSS.callout = () => {
    const st = T('calloutStyle');
    if (st === 'notion') return '';
    const base = 'html ' + SCOPE + ' .notion-callout-block [role="note"] > div';
    let css = `
/* コールアウト: 色面 → 薄いカード＋左の帯（色は元の色の系統を保つ） */
${base}${B} {
  background: ${st === 'outline' ? 'transparent' : 'linear-gradient(90deg, var(--lm-accent-soft), transparent 70%), var(--lm-raised)'} !important;
  border: 1px solid var(--lm-line-soft) !important;
  border-inline-start: 3px solid var(--lm-accent) !important;
  border-radius: var(--lm-r) !important;
  box-shadow: ${st === 'outline' ? 'none' : 'var(--c-shaBasSm)'};
}`;
    for (const c of NCOL) {
      css += `${base}[style*="--c-${c.toLowerCase()}Bac"]${B}, ${base}[style*="--c-${c}Bac"]${B} { border-inline-start-color: ${palMain(c)} !important; ${st === 'outline' ? '' : 'background: linear-gradient(90deg, ' + palSoft(c) + ', transparent 70%), var(--lm-raised) !important;'} }\n`;
    }
    return css;
  };

  CSS.quote = () => `
/* 引用: 細い線と大きな引用符 */
html ${SCOPE} .notion-quote-block${B} blockquote > div,
html ${SCOPE} .notion-quote-block${B} > div > div[style*="border-inline-start"],
html ${SCOPE} .notion-quote-block${B} > div > div[style*="border-left"] {
  border-inline-start: 1px solid var(--lm-accent-line) !important;
  padding-inline-start: 24px !important;
  position: relative;
  color: color-mix(in srgb, var(--lm-ink) 82%, var(--lm-mute));
  font-size: 1.06em;
}
html ${SCOPE} .notion-quote-block${B} blockquote > div::before,
html ${SCOPE} .notion-quote-block${B} > div > div[style*="border-inline-start"]::before {
  content: '“'; position: absolute; inset-inline-start: 6px; top: -.18em;
  font: 2.6em/1 Georgia, "Times New Roman", serif; color: var(--lm-accent); opacity: .35; pointer-events: none;
}`;

  CSS.toggle = () => `
/* トグル: 三角をアクセント色に、乗せると淡い面 */
html ${SCOPE} :is(.notion-toggle-block, [class*="toggle"]) .notion-list-item-box-left [role="button"]${B} svg { fill: var(--lm-accent) !important; opacity: .85; }
html ${SCOPE} :is(.notion-toggle-block, [class*="toggle"]) .notion-list-item-box-left [role="button"]${B}:hover { background: var(--lm-accent-soft) !important; }
html ${SCOPE} .notion-toggle-block${B} > div > div { border-radius: var(--lm-r-sm) !important; transition: background .2s; }`;

  CSS.code = () => `
html ${SCOPE} .notion-code-block${B} > div {
  border-radius: var(--lm-r) !important;
  box-shadow: inset 0 0 0 1px var(--lm-line-soft);
}`;

  CSS.divider = (p) => {
    const st = T('divider');
    const sep = 'html ' + SCOPE + ' .notion-divider-block [role="separator"]' + B;
    const box = 'html ' + SCOPE + ' .notion-divider-block' + B + ' > div';
    if (st === 'notion') return '';
    if (st === 'gradient') return `${sep} { background: linear-gradient(90deg, transparent, var(--lm-accent-line) 20%, var(--lm-accent) 50%, var(--lm-accent-line) 80%, transparent) !important; height: 1px !important; }`;
    if (st === 'dots') return `${sep} { background: radial-gradient(circle, var(--lm-mute) 1.1px, transparent 1.6px) center / 14px 4px repeat-x !important; height: 4px !important; opacity: .6; }`;
    if (st === 'double') return `${sep} { background: transparent !important; border-block: 1px solid var(--lm-line) !important; height: 4px !important; }`;
    return `
/* 区切り線: ❦ を真ん中に */
${box} { position: relative; height: 30px !important; }
${sep} { background: linear-gradient(90deg, transparent 0%, var(--lm-line) 22%, var(--lm-line) 44%, transparent 44%, transparent 56%, var(--lm-line) 56%, var(--lm-line) 78%, transparent 100%) !important; height: 1px !important; }
${box}::after { content: '❦'; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -56%); color: var(--lm-accent); font: 15px/1 Georgia, serif; opacity: .85; pointer-events: none; }`;
  };

  CSS.bullets = () => {
    const st = T('bullets');
    const glyph = { diamond: ['◆', '◇', '▪'], dot: ['•', '◦', '▪'], dash: ['—', '–', '·'], circle: ['○', '◦', '·'] }[st];
    let css = `
/* 番号: 等幅の数字・アクセント色 */
html ${SCOPE} .notion-numbered_list-block .notion-list-item-box-left${B} { font-variant-numeric: tabular-nums; color: var(--lm-accent-ink); }`;
    if (!glyph) return css;
    const L = 'html ' + SCOPE + ' .notion-bulleted_list-block';
    css += `
/* 箇条書きの印 */
${L} .notion-list-item-box-left${B} .pseudoBefore, ${L} .notion-list-item-box-left${B} > div { --pseudoBefore--content: "${glyph[0]}" !important; color: var(--lm-accent) !important; }
${L} ${L} .notion-list-item-box-left${B} .pseudoBefore, ${L} ${L} .notion-list-item-box-left${B} > div { --pseudoBefore--content: "${glyph[1]}" !important; }
${L} ${L} ${L} .notion-list-item-box-left${B} .pseudoBefore, ${L} ${L} ${L} .notion-list-item-box-left${B} > div { --pseudoBefore--content: "${glyph[2]}" !important; }
${st === 'diamond' ? L + ' .notion-list-item-box-left' + B + ' .pseudoBefore { font-size: .9em !important; transform: translateY(-.05em); }' : ''}`;
    return css;
  };

  CSS.todo = () => `
/* チェックボックス: 丸く・済んだら線を引いて薄く */
html ${SCOPE} .notion-to_do-block .notion-list-item-box-left${B} :is([role="checkbox"], .checkboxSquare, svg.checkboxSquare, div[style*="width: 16px"][style*="height: 16px"]) { border-radius: 50% !important; }
html ${SCOPE} .notion-to_do-block${B} [data-content-editable-leaf][style*="line-through"] { opacity: .5; text-decoration-color: var(--lm-accent-line) !important; transition: opacity .25s; }`;

  CSS.media = () => `
/* 画像: 角を丸めて影 */
html ${SCOPE} .notion-image-block${B} img { border-radius: var(--lm-r) !important; box-shadow: var(--c-shaBasMd); }
html ${SCOPE} .notion-image-block${B} figcaption, html ${SCOPE} .notion-image-block${B} [placeholder="Write a caption…"] { font-size: .86em; color: var(--lm-mute); text-align: center; }
/* ブックマーク・リンクのカード */
html ${SCOPE} :is(.notion-bookmark-block, .notion-link_preview-block)${B} [role="link"],
html ${SCOPE} :is(.notion-bookmark-block, .notion-link_preview-block)${B} a[href] {
  border-radius: var(--lm-r) !important; transition: box-shadow .2s, transform .2s;
}
html ${SCOPE} :is(.notion-bookmark-block, .notion-link_preview-block)${B} :is([role="link"], a[href]):hover { box-shadow: var(--c-shaOutMd) !important; transform: translateY(-1px); }
/* 埋め込み・ファイル */
html ${SCOPE} .notion-file-block${B} > div { border-radius: var(--lm-r-sm) !important; }`;

  CSS.tables = (p) => {
    const st = T('tableStyle');
    const d = +T('density') || 1;
    const TV = 'html ' + SCOPE + ' .notion-table-view';
    /* v12: 縦の罫線（列の境目）。誌面でも境目は残せる */
    const cl = T('colLines') || 'soft';
    const LV = { none: 'transparent', hair: 'var(--lm-line-hair)', soft: 'var(--lm-line-soft)', strong: 'var(--lm-line)' };
    const vl = cl === 'none' ? (st === 'ledger' ? LV.hair : LV.none) : LV[cl] || LV.soft;
    const vh = cl === 'none' ? (st === 'ledger' ? LV.soft : LV.none) : (cl === 'hair' ? LV.soft : LV.strong);
    let css = `
/* 表を誌面に: 縦のマス目を消し、横線を細く */
${TV} .notion-table-view-cell${B} { border-inline-end: 1px solid ${vl} !important; }
${TV} .notion-table-view-header-cell${B} { border-inline-end: 1px solid ${vh} !important; }
${TV} .notion-table-view-row${B} { border-bottom-color: ${st === 'cards' ? 'transparent' : 'var(--lm-line-hair)'} !important; position: relative; transition: background .15s; }
${TV} .notion-table-view-header-row${B} { border-bottom: 1px solid ${st === 'ledger' ? 'var(--lm-ink)' : 'var(--lm-line)'} !important; }
${TV} .notion-table-view-header-cell${B} { color: var(--lm-mute); }
${TV} .notion-table-view-header-cell${B} svg, ${TV} .notion-table-view-header-cell${B} [style*="mask"] { opacity: .55; }
/* 行に乗せると: 淡い面と左のアクセントの印 */
${TV} .notion-collection-item:hover > .notion-table-view-row${B} { background: var(--lm-hover); }
${TV} .notion-collection-item:hover > .notion-table-view-row${B}::before {
  content: ''; position: absolute; inset-inline-start: -8px; top: 22%; bottom: 22%; width: 2px; border-radius: 2px; background: var(--lm-accent); pointer-events: none;
}
/* 題字（その行のページ）を少しだけ強く */
${TV} [data-testid="property-value"] > div:not([style*="flex-wrap"]) > div > .notion-record-icon[role="button"]${B} { opacity: .9; }`;
    if (st === 'cards') css += `
/* 行を浮かせる */
${TV} .notion-collection-result-wrapper > .notion-collection-item > .notion-table-view-row${B} {
  background: var(--lm-raised); border-radius: var(--lm-r-sm); box-shadow: var(--c-shaOutSm); margin-block: 3px;
}
${TV} .notion-collection-item:hover > .notion-table-view-row${B} { box-shadow: var(--c-shaOutMd); }`;
    if (T('zebra')) css += `
${TV} .notion-collection-result-wrapper:nth-child(even) > .notion-collection-item > .notion-table-view-row${B} { background: color-mix(in srgb, var(--lm-tint) 70%, transparent); }`;
    if (d !== 1) css += `
${TV} .notion-table-view-cell [data-testid="property-value"]${B} { padding-top: ${(8 * d).toFixed(1)}px !important; padding-bottom: ${(8 * d).toFixed(1)}px !important; }`;
    return css;
  };

  CSS.gallery = () => {
    const lift = +T('galleryLift');
    const G = 'html ' + SCOPE + ' .notion-gallery-view .notion-collection-item';
    let css = `
/* ギャラリー: 表紙が主役のカード */
${G} > div[role="presentation"]${B} {
  border-radius: var(--lm-r-lg) !important;
  box-shadow: var(--c-shaOutSm) !important;
  transition: transform .28s cubic-bezier(.2,.8,.2,1), box-shadow .28s !important;
  background: var(--lm-raised) !important;
}
${G}:hover > div[role="presentation"]${B} { transform: translateY(${(-3 * lift).toFixed(1)}px); box-shadow: var(--c-shaOutLg) !important; }
${G} img[style*="object-fit"]${B} { transition: transform .6s cubic-bezier(.2,.8,.2,1); }
${G}:hover img[style*="object-fit"]${B} { transform: scale(${(1 + 0.035 * lift).toFixed(3)}); }
/* 題名の段: 表紙との間に細い線 */
${G} a > div:nth-child(2)${B} { border-top: 1px solid var(--lm-line-hair); }`;
    if (T('galleryTitle') === 'overlay') css += `
/* 題名を表紙の上に（表紙のあるカードだけ） */
${G} a:has(img[style*="object-fit"])${B} { position: relative; }
${G} a:has(img[style*="object-fit"])${B} > div:nth-child(2) {
  position: absolute !important; inset-inline: 0; bottom: 0; z-index: 2; border-top: 0;
  padding-top: 28px !important;
  background: linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.35) 60%, transparent) !important;
  color: #fff !important;
}
${G} a:has(img[style*="object-fit"])${B} > div:nth-child(2) * { color: #fff !important; text-shadow: 0 1px 2px rgba(0,0,0,.4); }`;
    return css;
  };

  CSS.cardbar = () => `
/* カードに乗せると出るボタン（コメント・編集・…）: 表紙を隠さない小さなガラスの粒にして右上へ */
html ${SCOPE} .notion-collection-item a > div:first-child > div[style*="position: absolute"]${B},
html ${SCOPE} .notion-collection-item a > div:first-child > div[style*="--c-whiButBac"]${B} {
  inset-inline-start: auto !important; left: auto !important;
  inset-inline-end: 8px !important; right: 8px !important;
  top: 8px !important; bottom: auto !important;
  width: auto !important; max-width: max-content !important; min-width: 0 !important;
  background: var(--lm-glass) !important;
  -webkit-backdrop-filter: blur(10px) saturate(1.4); backdrop-filter: blur(10px) saturate(1.4);
  border-radius: 999px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.12), inset 0 0 0 1px var(--lm-glass-line) !important;
  transform: scale(.86); transform-origin: top right;
  opacity: 0 !important; transition: opacity .18s ease !important;
}
html ${SCOPE} .notion-collection-item:hover a > div:first-child > div[style*="position: absolute"]${B},
html ${SCOPE} .notion-collection-item:hover a > div:first-child > div[style*="--c-whiButBac"]${B} { opacity: .92 !important; }
html ${SCOPE} .notion-collection-item a > div:first-child > div[style*="--c-whiButBac"]${B} [role="button"] { border: 0 !important; padding: 3px 6px !important; }
/* v11: アプリの表・ギャラリー・リストで乗せると出る「ボタンの段」（.quickActionContainer — コメントなど）。
   どの形のセル・カードでも、横いっぱいに伸ばさず右上の小さな粒に（³⁴ Image Cells が無くても） */
html ${SCOPE} div[style*="position: absolute"]:has(> .quickActionContainer)${B} { width: auto !important; inset-inline: auto 0 !important; display: flex !important; justify-content: flex-end !important; pointer-events: none !important; }
html ${SCOPE} .quickActionContainer${B} { width: auto !important; height: 22px !important; padding: 1px !important; border-radius: 999px !important; background: var(--lm-glass) !important;
  -webkit-backdrop-filter: blur(10px) saturate(1.4); backdrop-filter: blur(10px) saturate(1.4); box-shadow: 0 2px 8px rgba(0,0,0,.12), inset 0 0 0 1px var(--lm-glass-line) !important; opacity: .6; transition: opacity .15s ease; }
html ${SCOPE} .quickActionContainer:hover${B} { opacity: 1; }
html ${SCOPE} .quickActionContainer [role="button"]${B} { width: auto !important; min-width: 20px !important; height: 20px !important; padding: 0 3px !important; border-radius: 999px !important; gap: 0 !important; font-size: 0 !important; letter-spacing: 0 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }
html ${SCOPE} .quickActionContainer [role="button"] > :not(svg):not(:has(svg))${B} { display: none !important; }
html ${SCOPE} .quickActionContainer svg${B} { width: 14px !important; height: 14px !important; flex: none !important; }
html ${SCOPE} [data-testid="property-value"]:has(.quickActionContainer)${B} { overflow: visible !important; }
/* v12: 表紙（画像）のセルではコメントなどのボタンを出さない（表紙を隠さない） */
html ${SCOPE} [data-c34] div:has(> .quickActionContainer)${B} { display: none !important; }`;

  CSS.board = () => {
    const BV = 'html ' + SCOPE + ' .notion-board-view';
    return `
/* ボード: 列を淡いレーンに */
${BV} .notion-board-group${B} {
  background: color-mix(in srgb, var(--lm-tint) 82%, transparent);
  border-radius: var(--lm-r-lg); padding-top: 6px !important;
  box-shadow: inset 0 0 0 1px var(--lm-line-hair);
}
${BV} .notion-collection-item > div[role="presentation"]${B} {
  border-radius: var(--lm-r) !important; box-shadow: var(--c-shaOutSm) !important; background: var(--lm-raised) !important;
  transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s !important;
}
${BV} .notion-collection-item:hover > div[role="presentation"]${B} { transform: translateY(-2px); box-shadow: var(--c-shaOutMd) !important; }`;
  };

  CSS.list = () => `
html ${SCOPE} .notion-list-view .notion-collection-item${B} { border-radius: var(--lm-r-sm); transition: background .15s; position: relative; }
html ${SCOPE} .notion-list-view .notion-collection-item${B}:hover { background: var(--lm-hover); }
html ${SCOPE} .notion-list-view .notion-collection-item${B}:hover::before { content: ''; position: absolute; inset-inline-start: -6px; top: 25%; bottom: 25%; width: 2px; border-radius: 2px; background: var(--lm-accent); }`;

  CSS.chips = () => {
    const st = T('chips');
    if (st === 'plain') return '';
    /* セレクト・マルチセレクト・ステータスの札（Notion は色の変数を style に書いている: background: var(--c-yelBac…)） */
    const PILL = 'html :is(.notion-frame, .notion-peek-renderer, .notion-overlay-container) :is(.notion-table-view-cell, .notion-collection-item, [data-testid="property-value"], [role="option"], [role="menuitem"]) div[style*="border-radius"][style*="--c-"][style*="Bac"]:is([style*="height: 20px"], [style*="height: 18px"], [style*="height: 22px"]):not(:has(img, svg, .notion-record-icon))';
    let css = `
/* 選択肢のチップ */
${PILL}${B} {
  border-radius: 999px !important;
  padding-inline: 8px !important;
  ${st === 'outline' ? 'background: transparent !important; box-shadow: inset 0 0 0 1px var(--lm-line) !important;' : ''}
  ${st === 'solid' ? 'font-weight: 600 !important;' : ''}
}`;
    if (st === 'pebble' || st === 'outline') {
      for (const c of NCOL) css += `${PILL}[style*="--c-${c.toLowerCase()}"]${B}::before, ${PILL}[style*="--c-${c}"]${B}::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-inline-end: 5px; vertical-align: .08em; background: ${palMain(c)}; flex: none; }\n`;
      css += `${PILL}${B}::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-inline-end: 5px; vertical-align: .08em; background: var(--lm-mute); flex: none; }\n`;
    }
    return css;
  };

  CSS.dbhead = () => `
/* ビューのタブ: 選ばれたタブの下にアクセントの線 */
html ${SCOPE} .notion-collection-view-tab-button${B} { position: relative; }
html ${SCOPE} .notion-collection-view-tab-button${B}:has([aria-selected="true"])::after,
html ${SCOPE} .notion-collection-view-tab-button${B}:has(> div > [style*="background: var(--c-bacTer)"])::after {
  content: ''; position: absolute; inset-inline: 10px; bottom: -2px; height: 2px; border-radius: 2px; background: var(--lm-accent);
}`;

  CSS.topbar = () => `
html .notion-topbar${B}, html .notion-topbar-mobile${B} {
  background: color-mix(in srgb, var(--lm-bg) 72%, transparent) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.3); backdrop-filter: blur(14px) saturate(1.3);
  border-bottom: 1px solid var(--lm-line-hair);
}
html header:has(> .notion-topbar)${B} { background: transparent !important; }`;

  CSS.menus = () => `
/* メニュー・ポップアップ・ピーク */
html .notion-overlay-container [role="dialog"]${B}, html .notion-overlay-container [role="menu"]${B}, html .notion-overlay-container [role="listbox"]${B} {
  border-radius: var(--lm-r) !important;
}
html .notion-peek-renderer > div${B} { border-radius: var(--lm-r-lg) 0 0 var(--lm-r-lg) !important; }`;

  CSS.scrollbar = () => `
html${B} { scrollbar-color: color-mix(in srgb, var(--lm-ink) 22%, transparent) transparent; }
html ::-webkit-scrollbar${B} { width: 10px; height: 10px; }
html ::-webkit-scrollbar-thumb${B} { background: color-mix(in srgb, var(--lm-ink) 18%, transparent) !important; border-radius: 10px; border: 3px solid transparent; background-clip: content-box !important; }
html ::-webkit-scrollbar-thumb:hover${B} { background: color-mix(in srgb, var(--lm-accent) 55%, transparent) !important; background-clip: content-box !important; }
html ::-webkit-scrollbar-track${B}, html ::-webkit-scrollbar-corner${B} { background: transparent !important; }`;

  CSS.selection = () => `
html .notion-app-inner ::selection${B} { background: color-mix(in srgb, var(--lm-accent) 24%, transparent); }
html [contenteditable="true"]${B} { caret-color: var(--lm-accent); }
html :focus-visible${B} { outline-color: var(--lm-accent-line) !important; }`;

  CSS.motion = () => {
    if (reduce() || !+T('motion')) return '';
    const k = +T('motion');
    return `
@keyframes lm-in { from { opacity: 0; transform: translateY(${(6 * k).toFixed(1)}px); } to { opacity: 1; transform: none; } }
html .notion-frame .layout-content${B}, html .notion-peek-renderer .notion-page-content${B} { animation: lm-in ${(0.42 * k).toFixed(2)}s cubic-bezier(.2,.8,.2,1) both; }
html .notion-sidebar-container [role="treeitem"]${B}, html .notion-sidebar-container [data-inp-target]${B} { transition: background .18s ease, color .18s ease; }`;
  };

  /* ---- v1.0 追加: 誌面の飾り ---- */
  /* 表紙の無いページの上部に、配色とページ名から作った淡い模様 */
  function hashOf(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function coverArt(p, seed) {
    const pat = T('coverPattern') === 'auto' ? ['mesh', 'waves', 'grid', 'confetti'][seed % 4] : T('coverPattern');
    const r = (n) => ((seed >>> (n * 3)) % 97) / 97;
    const a = p.accent, b = p.accent2, k = p.dark ? 1.5 : 1;
    if (pat === 'waves') {
      const c1 = rgba(a, 0.16 * k), c2 = rgba(b, 0.12 * k);
      return svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="220" preserveAspectRatio="none" viewBox="0 0 1200 220"><path d="M0 ' + (90 + r(1) * 40) + ' C 300 ' + (20 + r(2) * 60) + ', 600 ' + (160 + r(3) * 40) + ', 1200 ' + (60 + r(4) * 40) + ' L1200 0 L0 0Z" fill="' + c1 + '"/><path d="M0 ' + (140 + r(5) * 40) + ' C 400 ' + (60 + r(6) * 60) + ', 800 ' + (200 - r(7) * 40) + ', 1200 ' + (110 + r(8) * 40) + ' L1200 0 L0 0Z" fill="' + c2 + '"/></svg>') + ' top / 100% 220px no-repeat';
    }
    if (pat === 'grid') return 'linear-gradient(to bottom, transparent 60%, var(--lm-bg)), linear-gradient(' + rgba(a, 0.09 * k) + ' 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, ' + rgba(a, 0.09 * k) + ' 1px, transparent 1px) 0 0 / 24px 24px';
    if (pat === 'confetti') {
      let dots = '';
      for (let i = 0; i < 26; i++) { const x = ((seed * (i + 3) * 7919) % 1200), y = ((seed * (i + 5) * 104729) % 200), sz = 3 + (i % 5) * 2, col = i % 3 ? rgba(a, 0.22 * k) : rgba(b, 0.2 * k), rot = (i * 37) % 180; dots += i % 2 ? '<circle cx="' + x + '" cy="' + y + '" r="' + (sz / 2) + '" fill="' + col + '"/>' : '<rect x="' + x + '" y="' + y + '" width="' + sz * 2 + '" height="' + sz + '" rx="1" fill="' + col + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>'; }
      return 'linear-gradient(to bottom, transparent 55%, var(--lm-bg)), ' + svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="220" viewBox="0 0 1200 220">' + dots + '</svg>') + ' top / 1200px 220px repeat-x';
    }
    return 'radial-gradient(60% 120% at ' + (10 + r(1) * 30).toFixed(0) + '% 0%, ' + rgba(a, 0.2 * k) + ', transparent 70%), radial-gradient(50% 110% at ' + (60 + r(2) * 35).toFixed(0) + '% 0%, ' + rgba(b, 0.16 * k) + ', transparent 70%)';
  }
  CSS.genCover = (p) => {
    const art = coverArt(p, hashOf(pageId() || location.pathname));
    return `
html .notion-frame .layout:has(.notion-page-content):not(:has(.layout-full img[style*="object-fit: cover"]))${B} {
  background: ${art};
  background-repeat: no-repeat;
  background-size: 100% 240px;
}`;
  };
  CSS.dropcap = () => `
html .notion-frame .notion-page-content > .notion-text-block:not(.notion-text-block ~ .notion-text-block)${B} [data-content-editable-leaf]::first-letter {
  float: left; font-size: 3.3em; line-height: .86; margin: .06em .1em 0 0; color: var(--lm-accent); font-weight: 600;
}`;
  CSS.endmark = () => `
html .notion-frame .layout:has(.notion-page-content) .notion-page-content${B}::after {
  content: '❧'; display: block; align-self: center; text-align: center; margin: 46px auto 10px; color: var(--lm-accent); opacity: .55; font: 18px/1 Georgia, serif;
}`;
  CSS.iconTiles = () => `
html ${SCOPE} [data-testid="property-value"] > div:not([style*="flex-wrap"]) > div > .notion-record-icon[role="button"]${B},
html ${SCOPE} :is(.notion-gallery-view, .notion-board-view) .notion-collection-item a .notion-record-icon${B} {
  background: var(--lm-accent-soft) !important; border-radius: 6px !important; box-shadow: inset 0 0 0 1px var(--lm-line-hair);
}`;
  CSS.stickyGlass = () => `
html .notion-frame .notion-table-view-header-row${B},
html .notion-frame .sticky-portal-target .notion-table-view-header-row${B},
html .notion-frame .notion-table-view div[style*="position: sticky"][style*="background: var(--c-bacPri)"]${B},
html .notion-frame .notion-board-view div[style*="position: absolute"][style*="background: var(--c-bacPri)"]${B} {
  background: color-mix(in srgb, var(--c-bacPri) 82%, transparent) !important;
  -webkit-backdrop-filter: blur(8px) saturate(1.2); backdrop-filter: blur(8px) saturate(1.2);
}`;
  CSS.calendar = () => `
html ${SCOPE} .notion-calendar-view [style*="background: var(--c-bluBacAccPri)"]${B},
html ${SCOPE} .notion-calendar-view [style*="background: rgb(235, 87, 87)"]${B} { background: var(--lm-accent) !important; box-shadow: 0 0 0 3px var(--lm-accent-soft); }
html ${SCOPE} .notion-calendar-view .notion-collection-item > div${B}, html ${SCOPE} .notion-timeline-view .notion-collection-item > div${B} {
  border-radius: var(--lm-r-sm) !important; box-shadow: var(--c-shaOutSm) !important;
}`;
  /* ギャラリーのカードの形（card は CSS.gallery の既定） */
  CSS.galleryStyle = () => {
    const st = T('galleryStyle');
    const G = 'html ' + SCOPE + ' .notion-gallery-view .notion-collection-item';
    if (st === 'polaroid') return `
${G} > div[role="presentation"]${B} { padding: 10px 10px 4px !important; border-radius: 3px !important; background: ${'#fdfcf8'} !important; box-shadow: 0 2px 6px rgba(0,0,0,.12), 0 14px 28px rgba(0,0,0,.08) !important; }
${G}:nth-child(3n+1) > div[role="presentation"]${B} { transform: rotate(-1.2deg); }
${G}:nth-child(3n+2) > div[role="presentation"]${B} { transform: rotate(.8deg); }
${G}:nth-child(3n) > div[role="presentation"]${B} { transform: rotate(-.4deg); }
${G}:hover > div[role="presentation"]${B} { transform: rotate(0) translateY(-4px) scale(1.02) !important; }
${G} img[style*="object-fit"]${B} { border-radius: 1px !important; }
${G} a > div:nth-child(2)${B} { border-top: 0 !important; color: #2b2722 !important; font-family: "Klee One", "Bradley Hand", "Segoe Print", cursive; }`;
    if (st === 'frame') return `
${G} > div[role="presentation"]${B} {
  border-radius: 0 !important; padding: 14px !important; background: var(--lm-sheet) !important;
  box-shadow: 0 0 0 1px var(--lm-line), 0 0 0 7px var(--lm-raised), 0 0 0 8px var(--lm-line), 0 18px 34px rgba(0,0,0,.14) !important;
  margin: 8px;
}
${G} img[style*="object-fit"]${B} { box-shadow: inset 0 0 0 1px rgba(0,0,0,.1); }
${G} a > div:nth-child(2)${B} { border-top: 0 !important; justify-content: center; text-align: center; font-size: .92em; letter-spacing: .06em; }`;
    if (st === 'shelf') return `
${G}${B} { perspective: 900px; }
${G} > div[role="presentation"]${B} { border-radius: 2px 6px 6px 2px !important; transform-origin: left center; box-shadow: inset 6px 0 8px -4px rgba(0,0,0,.35), 4px 6px 16px rgba(0,0,0,.18) !important; }
${G}:hover > div[role="presentation"]${B} { transform: rotateY(-14deg) translateY(-2px) !important; box-shadow: inset 6px 0 8px -4px rgba(0,0,0,.35), 14px 12px 28px rgba(0,0,0,.25) !important; }`;
    if (st === 'flat') return `
${G} > div[role="presentation"]${B} { box-shadow: none !important; border: 1px solid var(--lm-line) !important; }
${G}:hover > div[role="presentation"]${B} { transform: none !important; border-color: var(--lm-accent-line) !important; box-shadow: none !important; }`;
    return '';
  };
  /* 集中モード（⌃⌥F）: 上の帯を隠し、乗せていない段落を薄く */
  CSS.focus = () => `
html[data-lm-focus] .notion-topbar${B} { opacity: 0; transition: opacity .3s; }
html[data-lm-focus] .notion-topbar${B}:hover { opacity: 1; }
html[data-lm-focus] .notion-frame .notion-page-content > [data-block-id]${B} { opacity: .32; transition: opacity .35s ease; }
html[data-lm-focus] .notion-frame .notion-page-content > [data-block-id]${B}:is(:hover, :focus-within) { opacity: 1; }
html[data-lm-focus] .notion-sidebar-container${B} { opacity: .15; transition: opacity .3s; }
html[data-lm-focus] .notion-sidebar-container${B}:hover { opacity: 1; }`;

  /* ============================================================
   *  v12: ボードを折り返す
   *    Notion のボードは「見出しの段」と「列（カード）の段」が別の入れ物にある。
   *    → 二つの入れ物と、その間の入れ物を display: contents にして、ボード全体を 1 枚の格子にし、
   *      見出し k と列 k を、同じ桁・上下の段に置く（■■■■ / ●●●● / ■■■■ / ●●●●）。
   *      Notion の要素は動かさない（格子の位置を書くだけ）。並び順は CSS の order（¹⁴ の並べ替え）にも従う。
   * ============================================================ */
  CSS.boardWrap = () => `
html [data-lm-bw]${B} { display: grid !important; grid-template-columns: repeat(var(--lm-bw-cols, 3), var(--lm-bw-w, 288px)) !important; grid-auto-flow: row !important; align-items: start !important; justify-content: start !important; padding-bottom: 48px !important; position: relative !important; }
html [data-lm-bw] [data-lm-bw-c]${B} { display: contents !important; }
html [data-lm-bw] [data-lm-bw-x]${B} { display: none !important; }
html [data-lm-bw] [data-lm-bw-h]${B} { grid-row: var(--lm-r) !important; grid-column: var(--lm-c) !important; order: 0 !important; position: relative !important; height: 44px; align-self: end !important; }
html [data-lm-bw] [data-lm-bw-h]:not([data-lm-bw-first])${B} { margin-top: 22px !important; }
html [data-lm-bw] [data-lm-bw-g]${B} { grid-row: var(--lm-r) !important; grid-column: var(--lm-c) !important; order: 0 !important; margin-bottom: 4px !important; }
html [data-lm-bw] [data-lm-bw-n]${B} { grid-row: var(--lm-r) !important; grid-column: 1 / -1 !important; }
html [data-lm-bw-v]${B} { float: none !important; }
html [data-lm-bw-v] + div[style*="clear: both"]${B} { display: none !important; }`;
  const BW_ATTRS = ['data-lm-bw', 'data-lm-bw-c', 'data-lm-bw-x', 'data-lm-bw-h', 'data-lm-bw-g', 'data-lm-bw-n', 'data-lm-bw-first', 'data-lm-bw-v'];
  function bwClear(root) {
    (root || document).querySelectorAll(BW_ATTRS.map((a) => '[' + a + ']').join(',')).forEach((el) => {
      BW_ATTRS.forEach((a) => el.removeAttribute(a));
      ['--lm-r', '--lm-c', '--lm-bw-cols', '--lm-bw-w'].forEach((v) => el.style.removeProperty(v));
    });
  }
  function bwParts(bv) {
    const groups = [...bv.querySelectorAll('.notion-board-group')];
    if (groups.length < 2) return null;
    let heads = [...bv.querySelectorAll('div[style*="cursor: grab"]')].filter((h) => h.querySelector('[aria-label="More group options"]') && !h.closest('.notion-board-group'));
    let hc = heads[0] && heads[0].parentElement;
    if (hc) heads = [...hc.children].filter((c) => c.style && c.style.display === 'flex');
    else {
      /* 閲覧だけのボード（掴む所も ⋯ も無い）: 列の見出しのリンクの段から */
      const a = [...bv.querySelectorAll('a[href*="p="]')].find((x) => !x.closest('.notion-board-group'));
      let h = a;
      while (h && h.parentElement && h.parentElement !== bv && [...h.parentElement.children].filter((c) => c.style && c.style.display === 'flex').length < 2) h = h.parentElement;
      hc = h && h.parentElement;
      heads = hc ? [...hc.children].filter((c) => c.style && c.style.display === 'flex') : [];
    }
    const gc = groups[0].parentElement;
    if (!hc || !gc || heads.length !== groups.length) return null;
    /* 二つの入れ物の、いちばん近い共通の祖先＝格子にする箱 */
    let box = gc;
    while (box && !box.contains(hc)) box = box.parentElement;
    if (!box || !bv.contains(box)) return null;
    return { heads, groups, hc, gc, box };
  }
  let bwT = 0;
  function bwSoon(ms) { clearTimeout(bwT); bwT = setTimeout(bwRun, ms == null ? 120 : ms); }
  function bwRun() {
    if (!on('boardWrap')) { if (document.querySelector('[data-lm-bw]')) bwClear(); return; }
    for (const bv of document.querySelectorAll('.notion-board-view')) {
      if (bv.closest('.notion-peek-renderer') && bv.getBoundingClientRect().width < 500) continue;
      const P = bwParts(bv);
      if (!P) continue;
      const { heads, groups, hc, gc, box } = P;
      /* 見出し・列は DOM の順で対。並びは order（¹⁴ が書く）→ DOM の順 */
      const ordOf = (el, i) => { const o = parseFloat(el.style.order || getComputedStyle(el).order) || 0; return o * 10000 + i; };
      const pairs = heads.map((h, i) => ({ h, g: groups[i], k: ordOf(h, i) })).sort((a, b) => a.k - b.k);
      /* 1 段の列の数: 画面（横のスクロール枠）の幅に収まるだけ */
      const sc = bv.closest('.notion-scroller') || bv.parentElement;
      const bcs = getComputedStyle(bv);
      const avail = (sc ? sc.clientWidth : innerWidth) - (parseFloat(bcs.marginInlineStart) || 0) - (parseFloat(bcs.marginInlineEnd) || 0) - (parseFloat(bcs.paddingInlineStart) || 0) - 8;
      const gw = groups[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(groups[0]).marginInlineEnd) || 0) || 288;
      const cols = Math.max(1, +T('boardCols') || Math.floor(avail / gw));
      bv.setAttribute('data-lm-bw-v', '');
      box.setAttribute('data-lm-bw', '');
      if (box.style.getPropertyValue('--lm-bw-cols') !== String(cols)) box.style.setProperty('--lm-bw-cols', String(cols));
      if (box.style.getPropertyValue('--lm-bw-w') !== gw.toFixed(1) + 'px') box.style.setProperty('--lm-bw-w', gw.toFixed(1) + 'px');
      /* 間の入れ物を contents に。見出し・列以外の子（間の飾り・New group など）は外す／最後の段へ */
      const mid = new Set();
      for (const leaf of [hc, gc]) { let x = leaf; while (x && x !== box) { mid.add(x); x = x.parentElement; } }
      for (const m of mid) {
        if (!m.hasAttribute('data-lm-bw-c')) m.setAttribute('data-lm-bw-c', '');
        for (const ch of m.children) {
          if (mid.has(ch) || ch === box) continue;
          if (m === hc || m === gc) continue;
          if (/New group|新しいグループ|Load more|さらに読み込む/.test(ch.textContent || '')) { ch.setAttribute('data-lm-bw-n', ''); ch.style.setProperty('--lm-r', String(Math.ceil(pairs.length / cols) * 2 + 1)); }
          else if (!ch.hasAttribute('data-lm-bw-x')) ch.setAttribute('data-lm-bw-x', '');
        }
      }
      for (const ch of hc.children) if (!heads.includes(ch)) ch.setAttribute('data-lm-bw-x', '');
      const lastRow = String(Math.ceil(pairs.length / cols) * 2 + 1);
      for (const ch of box.children) if (!mid.has(ch) && /New group|新しいグループ|Load more|さらに読み込む/.test(ch.textContent || '')) { ch.setAttribute('data-lm-bw-n', ''); if (ch.style.getPropertyValue('--lm-r') !== lastRow) ch.style.setProperty('--lm-r', lastRow); }
      for (const ch of gc.children) if (!groups.includes(ch) && /New group|新しいグループ|Load more|さらに読み込む/.test(ch.textContent || '')) { ch.setAttribute('data-lm-bw-n', ''); if (ch.style.getPropertyValue('--lm-r') !== lastRow) ch.style.setProperty('--lm-r', lastRow); }
      pairs.forEach((p, k) => {
        const r = Math.floor(k / cols) * 2 + 1, c = (k % cols) + 1;
        p.h.setAttribute('data-lm-bw-h', ''); p.g.setAttribute('data-lm-bw-g', '');
        p.h.toggleAttribute('data-lm-bw-first', r === 1);
        if (p.h.style.getPropertyValue('--lm-r') !== String(r)) p.h.style.setProperty('--lm-r', String(r));
        if (p.h.style.getPropertyValue('--lm-c') !== String(c)) p.h.style.setProperty('--lm-c', String(c));
        if (p.g.style.getPropertyValue('--lm-r') !== String(r + 1)) p.g.style.setProperty('--lm-r', String(r + 1));
        if (p.g.style.getPropertyValue('--lm-c') !== String(c)) p.g.style.setProperty('--lm-c', String(c));
      });
    }
  }
  (function bwBoot() {
    if (!document.body) return document.addEventListener('DOMContentLoaded', bwBoot, { once: true });
    new MutationObserver((recs) => {
      for (const r of recs) { const t = r.target; if (t.nodeType === 1 && (t.closest('.notion-board-view') || t.querySelector && t.querySelector('.notion-board-view'))) { bwSoon(); return; } }
    }).observe(document.body, { childList: true, subtree: true });
    addEventListener('resize', () => bwSoon(160));
    setInterval(() => { if (on('boardWrap') && document.querySelector('.notion-board-view')) bwRun(); }, 1500);
    bwSoon(400);
  })();

  /* ページの見本カード */
  CSS.hoverCard = () => `
#lm-hc { position: fixed; z-index: 2147483400; width: 320px; border-radius: 14px; overflow: hidden; pointer-events: none;
  background: var(--lm-raised); color: var(--lm-ink); box-shadow: 0 1px 2px rgba(15,15,15,.06), 0 12px 32px -6px rgba(15,15,15,.22), 0 0 0 1px var(--lm-line-hair);
  opacity: 0; transform: translateY(6px) scale(.98); transform-origin: var(--hc-o, top left); transition: opacity .16s ease, transform .24s cubic-bezier(.2,.8,.2,1);
  font: 12.5px/1.5 var(--cordi-ui, var(--cordi-ui-fallback, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif)); font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; }
#lm-hc.on { opacity: 1; transform: none; }
#lm-hc .cv { height: 118px; background: var(--lm-tint) center / cover no-repeat; position: relative; }
#lm-hc .cv::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 55%, color-mix(in srgb, var(--lm-raised) 55%, transparent)); }
#lm-hc .cv.none { height: 10px; background: linear-gradient(90deg, var(--lm-accent-soft), transparent 80%); }
#lm-hc .cv.none::after { display: none; }
#lm-hc .hd { display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 12px; padding: 12px 16px 0; }
#lm-hc .cv:not(.none) + .hd { margin-top: -26px; position: relative; }
#lm-hc .ic { width: 42px; height: 42px; border-radius: 11px; background: var(--lm-raised); box-shadow: 0 0 0 1px var(--lm-line-hair), 0 2px 8px rgba(15,15,15,.1); display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden; }
#lm-hc .ic img { width: 30px; height: 30px; object-fit: contain; }
#lm-hc .ic.no { display: none; }
#lm-hc .hd .tt { min-width: 0; grid-column: 2; }
#lm-hc .ic.no + .tt { grid-column: 1 / -1; }
#lm-hc .tt b { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-family: var(--hc-ff, var(--cordi-ui-display, inherit)); font-size: 15.5px; font-weight: 600; line-height: 1.35; letter-spacing: .01em; }
#lm-hc .cv:not(.none) + .hd .tt { padding-top: 26px; }
#lm-hc .tt small { display: flex; gap: 6px; align-items: center; color: var(--lm-mute); margin-top: 2px; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#lm-hc .tt small i { font-style: normal; opacity: .5; }
#lm-hc .pr { display: grid; grid-template-columns: max-content 1fr; gap: 4px 12px; margin: 10px 16px 0; padding-top: 10px; border-top: 1px solid var(--lm-line-hair); font-size: 11.5px; }
#lm-hc .pr dt { color: var(--lm-mute); white-space: nowrap; max-width: 96px; overflow: hidden; text-overflow: ellipsis; }
#lm-hc .pr dd { margin: 0; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#lm-hc .ft { height: 14px; }`;

  CSS.progress = () => `
#lm-progress { position: fixed; inset-inline-start: 0; top: 0; height: 2px; width: 0; z-index: 2147483000; pointer-events: none;
  background: linear-gradient(90deg, var(--lm-accent), var(--lm-accent2)); box-shadow: 0 0 8px var(--lm-accent-soft); transition: width .12s linear, opacity .3s; }`;

  /* ============================================================
   *  9. 組み立て
   * ============================================================ */
  function build() {
    const p = curPalette();
    ST.builds++; ST.dark = p.dark; ST.theme = curTheme().id; ST.accent = p.accent;
    let css = '/* ³⁷ Lumière v' + VERSION + ' — ' + curTheme().name + (p.dark ? '（暗）' : '（明）') + ' */\n';
    css += ':root:root {\n' + declare(lmVars(p)) + '\n}\n';
    if (on('palette') && !p.none) css += ROOTS + ' {\n' + declare(notionVars(p)) + '\n}\n';
    for (const [id] of MODS) {
      if (id === 'palette' || !on(id) || !CSS[id] || (id === 'curtain' && c39Curtain())) continue;
      try { css += '\n/* ── ' + id + ' ── */' + CSS[id](p) + '\n'; } catch (e) { ST.lastError = id + ': ' + (e && e.message); }
    }
    try {
      if (on('gallery')) css += '\n/* ── galleryStyle ── */' + CSS.galleryStyle(p) + '\n';
      css += '\n/* ── focus（⌃⌥F）── */' + CSS.focus(p) + '\n';
      /* v13: 最後の列の右の線（「表を誌面に」を切っていても効く） */
      if (T('lastColLine') === false) css += '\n/* ── lastColLine ── */\nhtml .notion-table-view .notion-table-view-cell:last-child' + B + ', html .notion-table-view div:last-child > .notion-table-view-header-cell' + B + ' { border-inline-end-color: transparent !important; box-shadow: none !important; }\n';
    } catch (e) { ST.lastError = 'extra: ' + (e && e.message); }
    return css;
  }
  let lastCss = '';
  function apply() {
    try { bwSoon(60); } catch (e) { /* noop */ }
    if (!document.documentElement) { setTimeout(apply, 0); return; }   // document-start の最初の瞬間（html もまだ無い）
    let st = document.getElementById('lm-css');
    if (!st) {
      st = document.createElement('style'); st.id = 'lm-css';
      (document.head || document.documentElement).appendChild(st);
    } else if (st.parentNode && st.parentNode.lastElementChild !== st && document.head && st.parentNode === document.head) {
      document.head.appendChild(st);   // 後から入った CSS より後ろに
    }
    const css = build();
    if (css !== lastCss) { st.textContent = css; lastCss = css; }
    document.documentElement.setAttribute('data-lm', curTheme().id);
    document.documentElement.toggleAttribute('data-lm-dark', ST.dark);
    progressSetup();
    if (panel) panelSync();
  }

  /* ============================================================
   *  10. 読み進み具合（画面の上端の細い線）
   * ============================================================ */
  let progEl = null, progScroller = null;
  function progressSetup() {
    if (!on('progress')) { if (progEl) { progEl.remove(); progEl = null; } return; }
    if (!document.body) return;
    if (!progEl) { progEl = document.createElement('div'); progEl.id = 'lm-progress'; document.body.appendChild(progEl); }
    const sc = document.querySelector('.notion-frame .notion-scroller.vertical');
    if (sc !== progScroller) {
      if (progScroller) progScroller.removeEventListener('scroll', progress);
      progScroller = sc;
      if (sc) sc.addEventListener('scroll', progress, { passive: true });
    }
    progress();
  }
  function progress() {
    if (!progEl) return;
    const sc = progScroller;
    if (!sc) { progEl.style.width = '0'; return; }
    const max = sc.scrollHeight - sc.clientHeight;
    const r = max > 40 ? sc.scrollTop / max : 0;
    progEl.style.width = (r * 100).toFixed(2) + '%';
    progEl.style.opacity = r > 0.002 ? '1' : '0';
  }

  /* ============================================================
   *  11. 表紙（またはアイコン）の色からアクセント
   *      Notion の画像は同じ場所（/image/…）から来るので、canvas で色を読める。
   *      外部 URL の表紙は読めない（その時は何もしない）
   * ============================================================ */
  let accentBusy = '';
  function coverAccent() {
    if (!on('coverAccent')) return;
    const id = pageId();
    if (!id || S.accentCache[id] || accentBusy === id) return;
    const img = document.querySelector('.notion-frame .layout-full img[style*="object-fit: cover"]') || document.querySelector('.notion-frame .layout-content .notion-record-icon img');
    if (!img) return;
    accentBusy = id;
    const go = () => {
      try {
        const c = document.createElement('canvas'); const W = 40, H = 24; c.width = W; c.height = H;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, W, H);
        const d = x.getImageData(0, 0, W, H).data;
        /* 鮮やかで、明るすぎず暗すぎない画素を、色相の箱（20°ごと）で数え、鮮やかさで重みをつけて一番重い箱の平均色 */
        const box = new Map();
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 200) continue;
          const [h, sl, l] = rgb2hsl([d[i], d[i + 1], d[i + 2]]);
          if (sl < 22 || l < 18 || l > 82) continue;
          const k = Math.round(h / 20) % 18;
          const b = box.get(k) || { w: 0, n: 0, r: 0, g: 0, b: 0 };
          b.w += sl / 100; b.n += 1; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2];
          box.set(k, b);
        }
        let best = null;
        for (const b of box.values()) if (!best || b.w > best.w) best = b;
        if (best && best.n >= 6) {
          const hsl = rgb2hsl([best.r / best.n, best.g / best.n, best.b / best.n]);
          hsl[1] = clamp(hsl[1], 35, 70); hsl[2] = clamp(hsl[2], 34, 52);
          S.accentCache[id] = rgb2hex(hsl2rgb(hsl));
          const keys = Object.keys(S.accentCache); if (keys.length > 400) delete S.accentCache[keys[0]];
          save(); apply();
        }
      } catch (e) { ST.lastError = 'accent: ' + (e && e.message); }
      accentBusy = '';
    };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
  }

  /* ============================================================
   *  11b. ページの見本カード（リレーションのチップ・表の題字に乗せて待つ）
   *       記録は Notion の API（今の syncRecordValuesMain、だめなら旧 syncRecordValues）から読む
   * ============================================================ */
  let API_EP = null;
  async function apiRV(requests) {
    const send = (ep, reqs) => fetch(location.origin + '/api/v3/' + ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ requests: reqs }) });
    const ptr = requests.map((r) => ({ pointer: { table: r.table, id: r.id }, version: -1 }));
    for (const k of (API_EP === 'legacy' ? ['legacy', 'main'] : ['main', 'legacy'])) {
      try {
        const res = k === 'main' ? await send('syncRecordValuesMain', ptr) : await send('syncRecordValues', requests.map((r) => ({ table: r.table, id: r.id, version: -1 })));
        if (res.ok) { API_EP = k; return res.json(); }
      } catch (e) { /* 次へ */ }
    }
    return null;
  }
  const REC = new Map();
  async function block(id) {
    if (REC.has(id)) return REC.get(id);
    const pr = apiRV([{ table: 'block', id }]).then((j) => {
      const n = j && j.recordMap && j.recordMap.block && j.recordMap.block[id];
      return n ? (n.value && n.value.value ? n.value.value : n.value) : null;
    }).catch(() => null);
    REC.set(id, pr);
    return pr;
  }
  const COLL = new Map();
  function coll(id) {
    if (COLL.has(id)) return COLL.get(id);
    const pr = apiRV([{ table: 'collection', id }]).then((j) => { const n = j && j.recordMap && j.recordMap.collection && j.recordMap.collection[id]; return n ? (n.value && n.value.value ? n.value.value : n.value) : null; }).catch(() => null);
    COLL.set(id, pr); return pr;
  }
  const uuid = (h) => (h && h.length === 32 ? h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20) : h);
  function imgSrc(v, id, table) {
    const s = String(v || '');
    if (!s) return '';
    if (/^\/images\//.test(s) || /^\/icons\//.test(s) || /^data:image\//.test(s)) return s;
    if (/^https?:/.test(s) || /^attachment:/i.test(s)) return '/image/' + encodeURIComponent(s) + '?table=' + (table || 'block') + '&id=' + encodeURIComponent(id) + '&cache=v2&width=600';
    return '';
  }
  const plain = (v) => (Array.isArray(v) ? v.map((x) => (Array.isArray(x) && typeof x[0] === 'string' && x[0] !== '‣' ? x[0] : '')).join('') : '');
  let hcEl = null, hcT = 0, hcFor = null;
  function hcTarget(el) {
    if (!el || !el.closest) return null;
    if (el.closest('#lm-panel, #lm-hc')) return null;
    /* 素のリレーションのチップ・¹⁴ の項目・表の題字・ページへのリンク */
    const chip = el.closest('[data-testid="property-value"] div[style*="display: inline"]:has(> .notion-record-icon), .cordi13-item, .notion-page-block > a[href], a[href*="?p="], a.notion-link-token');
    if (chip) return chip;
    const t = el.closest('[data-testid="property-value"] > div:not([style*="flex-wrap"]):has(> div > .notion-record-icon[role="button"])');
    return t || null;
  }
  function idFrom(el) {
    const a = el.matches('a[href]') ? el : el.querySelector('a[href]');
    const h = a ? a.getAttribute('href') || '' : '';
    let m = /[?&]p=([0-9a-f]{32})/i.exec(h) || /([0-9a-f]{32})/i.exec(h);
    if (m) return uuid(m[1].toLowerCase());
    const b = el.closest('[data-block-id]');
    return b ? b.getAttribute('data-block-id') : '';
  }
  /* 編集できる表のリレーションのチップにはリンク先が書かれていない → 行の記録の中の関係（‣ p id）から、名前が同じページを探す */
  async function chipTarget(el) {
    const row = el.closest('.notion-collection-item[data-block-id], [data-block-id]');
    const rid = row && row.getAttribute('data-block-id');
    if (!rid) return '';
    const r = await block(rid);
    if (!r || !r.properties) return '';
    const want = (el.querySelector('span.notranslate') || el).textContent.replace(/\s+/g, ' ').trim();
    const ids = [];
    for (const v of Object.values(r.properties)) if (Array.isArray(v)) for (const seg of v) if (Array.isArray(seg) && seg[0] === '‣' && Array.isArray(seg[1])) for (const f of seg[1]) if (Array.isArray(f) && f[0] === 'p' && f[1]) ids.push(f[1]);
    if (!ids.length) return '';
    const j = await apiRV(ids.filter((id) => !REC.has(id)).slice(0, 80).map((id) => ({ table: 'block', id })));
    const bm = (j && j.recordMap && j.recordMap.block) || {};
    for (const id of Object.keys(bm)) { const n = bm[id]; REC.set(id, Promise.resolve(n && (n.value && n.value.value ? n.value.value : n.value))); }
    for (const id of ids) { const b = await block(id); if (b && plain(b.properties && b.properties.title).replace(/\s+/g, ' ').trim() === want) return id; }
    return '';
  }
  async function hcShow(el, x, y) {
    const isChip = el.matches('div[style*="display: inline"]') && !el.querySelector('a[href]');
    const id = isChip ? await chipTarget(el) : idFrom(el);
    if (hcFor !== el) return;
    if (!id) return;
    const r = await block(id);
    if (!r || hcFor !== el) return;
    if (!hcEl) { hcEl = document.createElement('div'); hcEl.id = 'lm-hc'; document.body.appendChild(hcEl); }
    /* 題名はいま画面で使っている書体（²⁶ Atelier が当てた題字・リレーションの書体）にそろえる */
    try { const tx = el.querySelector('span.notranslate, span') || el; hcEl.style.setProperty('--hc-ff', getComputedStyle(tx).fontFamily); } catch (e) { /* noop */ }
    const f = r.format || {};
    const cover = imgSrc(f.page_cover, id);
    const ic = f.page_icon || '';
    const icSrc = imgSrc(ic, id);
    const title = plain(r.properties && r.properties.title) || '無題';
    const when = r.last_edited_time ? new Date(r.last_edited_time) : null;
    /* v12: DB の行なら、DB の名前と、短いプロパティを 4 つまで（リレーションは件数） */
    let dbName = '', props = [];
    if (r.parent_table === 'collection' && r.parent_id) {
      const c = await coll(r.parent_id);
      if (hcFor !== el) return;
      if (c) {
        dbName = plain(c.name);
        const sch = c.schema || {};
        for (const [k, v] of Object.entries(r.properties || {})) {
          if (k === 'title' || !sch[k] || props.length >= 4) continue;
          const t = sch[k].type;
          let val = '';
          if (t === 'relation') { const n = (v || []).filter((x) => Array.isArray(x) && x[0] === '‣').length; val = n ? n + ' 件' : ''; }
          else if (t === 'date') { const d = (v || []).flatMap((x) => (Array.isArray(x) && x[1]) || []).find((x) => Array.isArray(x) && x[0] === 'd'); val = d && d[1] ? (d[1].start_date || '') + (d[1].end_date ? ' → ' + d[1].end_date : '') : ''; }
          else if (t === 'checkbox') val = plain(v) === 'Yes' ? '✓' : '';
          else if (t === 'file' || t === 'formula' || t === 'rollup' || t === 'button') val = '';
          else val = plain(v);
          val = String(val || '').replace(/\s+/g, ' ').trim();
          if (val) props.push([sch[k].name || '', val.length > 40 ? val.slice(0, 40) + '…' : val]);
        }
      }
    }
    const rel = (d) => { const s2 = (Date.now() - d.getTime()) / 1000; if (s2 < 3600) return Math.max(1, Math.round(s2 / 60)) + ' 分前'; if (s2 < 86400) return Math.round(s2 / 3600) + ' 時間前'; if (s2 < 86400 * 30) return Math.round(s2 / 86400) + ' 日前'; return d.toLocaleDateString(); };
    const icHtml = ic && (icSrc || !/^[a-z]+:/i.test(ic)) ? '<span class="ic">' + (icSrc ? '<img src="' + esc(icSrc) + '" alt="">' : esc(ic)) + '</span>' : '<span class="ic no"></span>';
    hcEl.innerHTML = '<div class="cv' + (cover ? '' : ' none') + '"' + (cover ? ' style="background-image:url(&quot;' + esc(cover) + '&quot;);background-position:center ' + Math.round((1 - (f.page_cover_position == null ? 0.5 : f.page_cover_position)) * 100) + '%"' : '') + '></div>' +
      '<div class="hd">' + icHtml + '<div class="tt"><b>' + esc(title) + '</b><small>' + (dbName ? '<span>' + esc(dbName) + '</span>' + (when ? '<i>·</i>' : '') : '') + (when ? '<span>' + rel(when) + 'に更新</span>' : '') + '</small></div></div>' +
      (props.length ? '<dl class="pr">' + props.map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>').join('') + '</dl>' : '') + '<div class="ft"></div>';
    const W = 320, H = hcEl.offsetHeight || 220;
    let left = x + 14, top = y + 18;
    if (left + W > innerWidth - 10) left = innerWidth - W - 10;
    if (top + H > innerHeight - 10) top = y - H - 14;
    hcEl.style.left = Math.max(8, left) + 'px'; hcEl.style.top = Math.max(8, top) + 'px';
    requestAnimationFrame(() => hcEl && hcEl.classList.add('on'));
  }
  function hcHide() { clearTimeout(hcT); hcFor = null; if (hcEl) hcEl.classList.remove('on'); }
  document.addEventListener('mouseover', (e) => {
    if (!on('hoverCard')) return;
    const t = hcTarget(e.target);
    if (t === hcFor) return;
    hcHide();
    if (!t) return;
    hcFor = t;
    const x = e.clientX, y = e.clientY;
    hcT = setTimeout(() => hcShow(t, x, y), Math.max(150, +T('hoverDelay') || 450));
  }, { passive: true, capture: true });
  document.addEventListener('mousedown', hcHide, true);
  document.addEventListener('scroll', hcHide, { passive: true, capture: true });

  /* 集中モード */
  function focusToggle(force) {
    const v = force != null ? force : !document.documentElement.hasAttribute('data-lm-focus');
    document.documentElement.toggleAttribute('data-lm-focus', v);
    toast(v ? '集中モード：入（⌃⌥B で戻す）' : '集中モード：切');
  }
  function toast(msg) {
    if (!document.body) return;
    let t = document.getElementById('lm-toast');
    if (!t) { t = document.createElement('div'); t.id = 'lm-toast'; t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483600;padding:8px 14px;border-radius:999px;background:var(--lm-ink);color:var(--lm-bg);font:12.5px/1.4 var(--cordi-ui,var(--cordi-ui-fallback,-apple-system,BlinkMacSystemFont,"Hiragino Sans",sans-serif));font-feature-settings:"palt" 1;box-shadow:0 8px 24px rgba(0,0,0,.2);transition:opacity .25s;pointer-events:none'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.style.opacity = '0'; }, 1800);
  }

  /* ============================================================
   *  12. パネル（⌃⌥V）
   * ============================================================ */
  let panel = null;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PANEL_CSS = `
#lm-panel { position: fixed; z-index: 2147483600; top: 14px; right: 14px; bottom: 14px; width: 392px; display: flex; flex-direction: column;
  background: var(--lm-raised); color: var(--lm-ink); border-radius: 16px; overflow: hidden;
  box-shadow: 0 30px 70px rgba(0,0,0,.28), 0 0 0 1px var(--lm-line);
  font: 13px/1.55 var(--cordi-ui, var(--cordi-ui-fallback, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif)); font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; animation: lm-pin .28s cubic-bezier(.2,.8,.2,1); }
@keyframes lm-pin { from { opacity: 0; transform: translateX(16px) scale(.985); } to { opacity: 1; transform: none; } }
#lm-panel * { box-sizing: border-box; }
#lm-panel .lm-hd { padding: 16px 18px 12px; border-bottom: 1px solid var(--lm-line-soft); display: flex; align-items: baseline; gap: 10px;
  background: linear-gradient(135deg, var(--lm-accent-soft), transparent 60%); }
#lm-panel .lm-hd b { font: 600 22px/1 "Cormorant Garamond", "Hoefler Text", Georgia, serif; letter-spacing: .04em; }
#lm-panel .lm-hd i { font-style: normal; color: var(--lm-mute); font-size: 11.5px; }
#lm-panel .lm-hd .lm-x { margin-inline-start: auto; border: 0; background: transparent; color: var(--lm-mute); font-size: 18px; cursor: pointer; border-radius: 8px; width: 28px; height: 28px; }
#lm-panel .lm-hd .lm-x:hover { background: var(--lm-hover); color: var(--lm-ink); }
#lm-panel .lm-tabs { display: flex; gap: 2px; padding: 8px 12px 0; border-bottom: 1px solid var(--lm-line-soft); }
#lm-panel .lm-tab { border: 0; background: transparent; color: var(--lm-mute); padding: 7px 10px 9px; cursor: pointer; font: inherit; font-weight: 600; position: relative; }
#lm-panel .lm-tab.on { color: var(--lm-ink); }
#lm-panel .lm-tab.on::after { content: ''; position: absolute; inset-inline: 8px; bottom: -1px; height: 2px; border-radius: 2px; background: var(--lm-accent); }
#lm-panel .lm-body { flex: 1; overflow: auto; padding: 14px 16px 24px; }
#lm-panel .lm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
#lm-panel .lm-th { border: 0; padding: 0; background: transparent; cursor: pointer; text-align: start; color: inherit; font: inherit; }
#lm-panel .lm-sw { height: 64px; border-radius: 10px; position: relative; overflow: hidden; box-shadow: 0 0 0 1px var(--lm-line); transition: transform .18s, box-shadow .18s; }
#lm-panel .lm-th:hover .lm-sw { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(0,0,0,.14), 0 0 0 1px var(--lm-line); }
#lm-panel .lm-th.on .lm-sw { box-shadow: 0 0 0 2px var(--lm-accent), 0 8px 18px rgba(0,0,0,.14); }
#lm-panel .lm-sw .s { position: absolute; inset: 10px 10px 10px 26px; border-radius: 5px; padding: 6px 7px; }
#lm-panel .lm-sw .s i { display: block; height: 3px; border-radius: 2px; margin-bottom: 4px; }
#lm-panel .lm-sw .a { position: absolute; left: 8px; top: 10px; width: 10px; height: 10px; border-radius: 50%; }
#lm-panel .lm-sw .a2 { position: absolute; left: 8px; top: 26px; width: 10px; height: 10px; border-radius: 50%; }
#lm-panel .lm-th .n { display: block; font-weight: 600; margin-top: 6px; font-size: 12.5px; }
#lm-panel .lm-th .e { display: block; color: var(--lm-mute); font-size: 10.5px; letter-spacing: .03em; }
#lm-panel .lm-sec { margin: 18px 0 8px; font-size: 11px; font-weight: 700; letter-spacing: .12em; color: var(--lm-mute); text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
#lm-panel .lm-sec::after { content: ''; flex: 1; height: 1px; background: var(--lm-line-soft); }
#lm-panel .lm-desc { color: var(--lm-mute); font-size: 12px; margin: 6px 0 2px; }
#lm-panel .lm-seg { display: inline-flex; background: var(--lm-hover); border-radius: 9px; padding: 2px; gap: 2px; }
#lm-panel .lm-seg button { border: 0; background: transparent; color: var(--lm-mute); padding: 5px 10px; border-radius: 7px; cursor: pointer; font: inherit; font-size: 12px; }
#lm-panel .lm-seg button.on { background: var(--lm-raised); color: var(--lm-ink); box-shadow: 0 1px 3px rgba(0,0,0,.12); font-weight: 600; }
#lm-panel .lm-row { display: flex; align-items: center; gap: 10px; padding: 9px 4px; border-bottom: 1px solid var(--lm-line-hair); }
#lm-panel .lm-row .t { flex: 1; min-width: 0; }
#lm-panel .lm-row .t b { display: block; font-weight: 600; font-size: 13px; }
#lm-panel .lm-row .t small { display: block; color: var(--lm-mute); font-size: 11.5px; line-height: 1.45; margin-top: 1px; }
#lm-panel .lm-sw2 { flex: none; width: 36px; height: 21px; border-radius: 999px; background: var(--lm-line); position: relative; cursor: pointer; border: 0; transition: background .2s; }
#lm-panel .lm-sw2::after { content: ''; position: absolute; top: 2px; left: 2px; width: 17px; height: 17px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .2s cubic-bezier(.2,.8,.2,1); }
#lm-panel .lm-sw2.on { background: var(--lm-accent); }
#lm-panel .lm-sw2.on::after { transform: translateX(15px); }
#lm-panel .lm-ctl { display: flex; align-items: center; gap: 10px; padding: 8px 4px; }
#lm-panel .lm-ctl label { width: 118px; flex: none; font-size: 12.5px; }
#lm-panel .lm-ctl input[type=range] { flex: 1; accent-color: var(--lm-accent); }
#lm-panel .lm-ctl output { width: 40px; text-align: end; color: var(--lm-mute); font-variant-numeric: tabular-nums; font-size: 12px; }
#lm-panel .lm-ctl select, #lm-panel .lm-ctl input[type=text] { flex: 1; font: inherit; font-size: 12.5px; color: var(--lm-ink); background: var(--lm-sheet); border: 1px solid var(--lm-line); border-radius: 8px; padding: 5px 8px; }
#lm-panel .lm-ctl input[type=color] { width: 34px; height: 26px; border: 1px solid var(--lm-line); border-radius: 7px; padding: 1px; background: var(--lm-sheet); }
#lm-panel .lm-btn { border: 1px solid var(--lm-line); background: var(--lm-sheet); color: var(--lm-ink); border-radius: 9px; padding: 6px 12px; cursor: pointer; font: inherit; font-size: 12.5px; }
#lm-panel .lm-btn:hover { border-color: var(--lm-accent-line); }
#lm-panel .lm-btn.pri { background: var(--lm-accent); color: var(--lm-on-accent); border-color: transparent; }
#lm-panel textarea { width: 100%; height: 120px; font: 11.5px/1.5 ui-monospace, Menlo, monospace; border: 1px solid var(--lm-line); border-radius: 9px; padding: 8px; background: var(--lm-sheet); color: var(--lm-ink); }
#lm-panel .lm-ft { padding: 10px 16px; border-top: 1px solid var(--lm-line-soft); display: flex; gap: 8px; align-items: center; color: var(--lm-mute); font-size: 11.5px; }
#lm-fab { position: fixed; z-index: 2147483500; right: 18px; bottom: 64px; width: 34px; height: 34px; border-radius: 50%; border: 0; cursor: pointer;
  background: var(--lm-raised); color: var(--lm-accent); box-shadow: 0 6px 18px rgba(0,0,0,.16), 0 0 0 1px var(--lm-line); font: 600 15px/34px "Cormorant Garamond", Georgia, serif; opacity: .0; transition: opacity .2s, transform .2s; }
html:hover #lm-fab { opacity: .55; }
#lm-fab:hover { opacity: 1 !important; transform: scale(1.06); }`;
  let tab = 'theme';
  function panelOpen() {
    if (panel) { panelClose(); return; }
    if (!document.getElementById('lm-panel-css')) { const st = document.createElement('style'); st.id = 'lm-panel-css'; st.textContent = PANEL_CSS; document.head.appendChild(st); }
    panel = document.createElement('div');
    panel.id = 'lm-panel';
    panel.innerHTML = '<div class="lm-hd"><b>Lumière</b><i>見た目 · ³⁷ v' + VERSION + '</i><button class="lm-x" title="閉じる（Esc）">×</button></div>' +
      '<div class="lm-tabs">' + [['theme', '配色'], ['make', '自作'], ['mods', 'モジュール'], ['tune', '細部'], ['data', '保存']].map(([k, l]) => '<button class="lm-tab" data-tab="' + k + '">' + l + '</button>').join('') + '</div>' +
      '<div class="lm-body"></div><div class="lm-ft"></div>';
    document.body.appendChild(panel);
    panel.querySelector('.lm-x').onclick = panelClose;
    panel.querySelectorAll('.lm-tab').forEach((b) => { b.onclick = () => { tab = b.dataset.tab; panelSync(true); }; });
    panelSync(true);
    setTimeout(() => document.addEventListener('pointerdown', panelOutside, true), 0);
  }
  /* 外（余白・別の要素）を押したら閉じる。ドックの小窓・色の選択は除く */
  function panelOutside(e) {
    const t = e.target;
    if (!panel || !t || !t.closest || panel.contains(t) || t.closest('#cordi-dock, .cordi-pop, [data-lm-keep]')) return;
    panelClose();
  }
  function panelClose() { document.removeEventListener('pointerdown', panelOutside, true); if (panel) panel.remove(); panel = null; }
  function swatch(th, dark) {
    const p = dark ? th.dark : th.light;
    return '<div class="lm-sw" style="background:' + p.bg + '"><span class="a" style="background:' + p.accent + '"></span><span class="a2" style="background:' + p.accent2 + '"></span>' +
      '<div class="s" style="background:' + p.sheet + ';box-shadow:0 1px 3px rgba(0,0,0,.12)"><i style="background:' + p.ink + ';width:70%"></i><i style="background:' + p.mute + ';width:90%;opacity:.6"></i><i style="background:' + p.mute + ';width:55%;opacity:.6"></i><i style="background:' + p.accent + ';width:30%"></i></div></div>';
  }
  /* 自作の配色: 5 色 → 明・暗の 10 色ずつ */
  function draftFrom(th) {
    const l = th.base || th.light;
    return { id: th.custom ? th.id : '', name: th.custom ? th.name : th.name + 'の写し', tex: th.tex || 'none', base: { bg: l.bg, sheet: l.sheet, ink: l.ink, accent: l.accent, accent2: l.accent2 } };
  }
  function deriveLight(b) {
    const ink = readable(b.ink, b.sheet, 7);
    return { bg: b.bg, side: mix(b.bg, ink, 0.045), sheet: b.sheet, raised: mix(b.sheet, '#ffffff', 0.5), ink, mute: readable(mix(ink, b.sheet, 0.45), b.sheet, 3.2),
      line: mix(b.bg, ink, 0.13), accent: readable(b.accent, b.sheet, 3), accent2: readable(b.accent2, b.sheet, 3), tint: mix(b.bg, ink, 0.035) };
  }
  function deriveDark(b) {
    const h = rgb2hsl(hex2rgb(b.bg));
    const bg = rgb2hex(hsl2rgb([h[0], Math.min(h[1], 30), 9]));
    const sheet = shade(bg, 3), raised = shade(bg, 6);
    const ink = readable(mix(b.bg, '#ffffff', 0.35), sheet, 9);
    return { bg, side: shade(bg, -2), sheet, raised, ink, mute: readable(mix(ink, sheet, 0.42), sheet, 3.5), line: mix(bg, ink, 0.14),
      accent: readable(shade(b.accent, 10), sheet, 3.5), accent2: readable(shade(b.accent2, 10), sheet, 3.5), tint: shade(bg, 2) };
  }
  const draftTheme = (d) => ({ id: d.id || 'my-' + Date.now().toString(36), name: d.name || '自作', en: 'Custom', desc: '自作の配色', custom: true, tex: d.tex, radius: 10, base: Object.assign({}, d.base), light: deriveLight(d.base), dark: deriveDark(d.base) });
  let tryTheme = null;
  function panelSync(full) {
    if (!panel) return;
    panel.querySelectorAll('.lm-tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    const body = panel.querySelector('.lm-body');
    const keep = body.scrollTop;
    if (!full && panel.__tab === tab && tab !== 'theme') { panel.querySelector('.lm-ft').textContent = footer(); return; }
    panel.__tab = tab;
    let h = '';
    const pid = pageId();
    if (tab === 'theme') {
      const dark = ST.dark;
      h += '<div class="lm-ctl"><label>明るさ</label><span class="lm-seg" data-k="mode">' + [['auto', 'Notion に合わせる'], ['light', '明'], ['dark', '暗']].map(([v, l]) => '<button data-v="' + v + '"' + (S.mode === v ? ' class="on"' : '') + '>' + l + '</button>').join('') + '</span></div>';
      h += '<div class="lm-sec">配色</div><div class="lm-grid">';
      const cur = curTheme().id;
      for (const th of allThemes()) h += '<button class="lm-th' + (th.id === cur ? ' on' : '') + '" data-th="' + th.id + '" title="' + esc(th.desc) + '">' + swatch(th, dark) + '<span class="n">' + esc(th.name) + '</span><span class="e">' + esc(th.en) + '</span></button>';
      h += '</div>';
      h += '<p class="lm-desc">' + esc(curTheme().desc) + '</p>';
      h += '<div class="lm-sec">このページだけ</div>';
      h += '<div class="lm-row"><div class="t"><b>このページは別の配色</b><small>' + (pid ? (S.pages[pid] ? '「' + esc((THEME_BY_ID[S.pages[pid]] || {}).name) + '」に固定中。上で選んだ配色はこのページにだけ当たる' : 'オンにすると、上で選ぶ配色がこのページだけに当たる') : 'ページを開いている時に使える') + '</small></div><button class="lm-sw2' + (S.pages[pid] ? ' on' : '') + '" data-page="1"' + (pid ? '' : ' disabled') + '></button></div>';
      h += '<div class="lm-ctl"><label>アクセント</label><input type="color" data-t="accent" value="' + esc(S.tune.accent || ST.accent || '#a0522d') + '"><button class="lm-btn" data-clear="accent">配色の色に戻す</button></div>';
    } else if (tab === 'make') {
      const d = panel.__draft || (panel.__draft = draftFrom(curTheme()));
      const col = (k, l) => '<div class="lm-ctl"><label>' + l + '</label><input type="color" data-dk="' + k + '" value="' + esc(d.base[k]) + '"><code style="font-size:11px;color:var(--lm-mute)">' + esc(d.base[k]) + '</code></div>';
      h += '<p class="lm-desc">5 つの色を決めるだけで、明るい版と暗い版（線・薄い文字・カード・影まで）を作ります。文字が読みにくい組み合わせは、自動で読める濃さまで寄せます。</p>';
      h += '<div class="lm-ctl"><label>名前</label><input type="text" data-dn value="' + esc(d.name) + '"></div>';
      h += col('bg', '背景') + col('sheet', '本文の紙') + col('ink', '文字') + col('accent', 'アクセント') + col('accent2', '二色目');
      h += '<div class="lm-ctl"><label>質感</label><select data-dtex>' + [['none', 'なし'], ['paper', '紙'], ['vellum', '羊皮紙'], ['washi', '和紙'], ['grid', '方眼'], ['glow', '光のにじみ']].map(([v, t]) => '<option value="' + v + '"' + (d.tex === v ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>';
      const th = draftTheme(d);
      const cr = (a, b) => contrast(a, b).toFixed(1);
      h += '<div class="lm-sec">見本</div><div class="lm-grid" style="grid-template-columns:1fr 1fr">' + ['light', 'dark'].map((m) => '<div><div class="lm-th">' + swatch(th, m === 'dark') + '</div><p class="lm-desc">' + (m === 'light' ? '明' : '暗') + '：文字 ' + cr(th[m].ink, th[m].sheet) + ' : 1／アクセント ' + cr(th[m].accent, th[m].sheet) + ' : 1</p></div>').join('') + '</div>';
      h += '<p class="lm-desc">読みやすさの目安：文字は 7 以上が理想（4.5 以上なら可）、アクセントは 3 以上。</p>';
      h += '<div style="display:flex;gap:8px;margin-top:10px"><button class="lm-btn pri" data-make="save">保存して使う</button><button class="lm-btn" data-make="try">試す（保存しない）</button><button class="lm-btn" data-make="from">いまの配色から</button></div>';
      if (S.custom.length) {
        h += '<div class="lm-sec">自作の配色</div>';
        for (const c of S.custom) h += '<div class="lm-row"><div class="t"><b>' + esc(c.name) + '</b><small>' + esc(c.id) + '</small></div><button class="lm-btn" data-use="' + esc(c.id) + '">使う</button><button class="lm-btn" data-edit="' + esc(c.id) + '">直す</button><button class="lm-btn" data-del="' + esc(c.id) + '">消す</button></div>';
      }
    } else if (tab === 'mods') {
      let g = '';
      for (const [id, grp, name, desc] of MODS) {
        if (grp !== g) { h += '<div class="lm-sec">' + esc(grp) + '</div>'; g = grp; }
        h += '<div class="lm-row"><div class="t"><b>' + esc(name) + '</b><small>' + esc(desc) + '</small></div><button class="lm-sw2' + (on(id) ? ' on' : '') + '" data-mod="' + id + '"></button></div>';
      }
    } else if (tab === 'tune') {
      const rng = (k, l, mn, mx, stp, unit) => '<div class="lm-ctl"><label>' + l + '</label><input type="range" data-t="' + k + '" min="' + mn + '" max="' + mx + '" step="' + stp + '" value="' + esc(S.tune[k] === '' ? (k === 'radius' ? curPalette().radius : mn) : S.tune[k]) + '"><output>' + esc(S.tune[k] === '' ? '既定' : S.tune[k] + (unit || '')) + '</output></div>';
      const sel = (k, l, opts) => '<div class="lm-ctl"><label>' + l + '</label><select data-t="' + k + '">' + opts.map(([v, t]) => '<option value="' + v + '"' + (String(S.tune[k]) === String(v) ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>';
      h += '<div class="lm-sec">形と質感</div>';
      h += rng('radius', '角の丸み', 0, 24, 1, 'px') + rng('shadow', '影の深さ', 0, 2, 0.05) + rng('texture', '質感の強さ', 0, 2, 0.05) + rng('motion', '動きの大きさ', 0, 2, 0.1);
      h += '<div class="lm-sec">表・ギャラリー</div>';
      h += sel('tableStyle', '表の形', [['editorial', '誌面（縦線なし・細い横線）'], ['ledger', '罫線帳（細い縦線・見出しに太線）'], ['cards', '行を浮かせる（1 行ずつカード）']]);
      h += sel('colLines', '縦の罫線（列の境目）', [['soft', 'ふつう'], ['hair', 'ごく細く淡く'], ['strong', 'はっきり'], ['none', '引かない']]);
      h += '<div class="lm-row"><div class="t"><b>最後の列の右の線</b><small>表の右端（いちばん右の列の右）の縦線</small></div><button class="lm-sw2' + (S.tune.lastColLine !== false ? ' on' : '') + '" data-tb="lastColLine"></button></div>';
      h += '<div class="lm-row"><div class="t"><b>表を縞にする</b><small>1 行おきに淡い面</small></div><button class="lm-sw2' + (S.tune.zebra ? ' on' : '') + '" data-tb="zebra"></button></div>';
      h += rng('density', '行の高さ', 0.6, 1.6, 0.05);
      h += sel('galleryStyle', 'ギャラリーの形', [['card', 'カード（浮き上がる）'], ['polaroid', 'ポラロイド（少し傾けて貼る）'], ['frame', '額装（白い余白と額縁）'], ['shelf', '本棚（乗せると表紙が開く）'], ['flat', '平ら（線だけ）']]);
      h += sel('galleryTitle', 'ギャラリーの題名', [['below', '表紙の下'], ['overlay', '表紙の上に重ねる']]);
      h += rng('galleryLift', '乗せた時の浮き', 0, 3, 0.1);
      h += sel('chips', '選択肢のチップ', [['pebble', '丸い小石（色の点つき）'], ['outline', '枠だけ（色の点つき）'], ['solid', '塗り（太字）'], ['plain', 'Notion のまま']]);
      h += '<div class="lm-sec">本文のブロック</div>';
      h += sel('heading', '見出し', [['rule', '下に細い線（左端だけアクセント）'], ['bar', '左に帯'], ['ornament', '飾り（❧ §）'], ['plain', 'Notion のまま']]);
      h += sel('calloutStyle', 'コールアウト', [['glass', '薄いカード＋左の帯'], ['outline', '枠だけ＋左の帯'], ['notion', 'Notion のまま']]);
      h += sel('divider', '区切り線', [['fleuron', '❦ を真ん中に'], ['gradient', 'グラデーション'], ['dots', '点線'], ['double', '二重線'], ['notion', 'Notion のまま']]);
      h += sel('bullets', '箇条書きの印', [['diamond', '◆ ◇ ▪'], ['dot', '• ◦ ▪'], ['dash', '— – ·'], ['circle', '○ ◦ ·'], ['notion', 'Notion のまま']]);
      h += sel('coverPattern', '表紙の無いページの模様', [['auto', 'ページごとに自動'], ['mesh', '光のにじみ'], ['waves', '波'], ['grid', '方眼'], ['confetti', '紙片']]);
      h += '<div class="lm-sec">時間</div>';
      h += '<div class="lm-row"><div class="t"><b>夜は自動で暗く</b><small>明るさが「Notion に合わせる」の時、下の時間は暗い配色にする</small></div><button class="lm-sw2' + (S.tune.schedule ? ' on' : '') + '" data-tb="schedule"></button></div>';
      h += rng('nightFrom', '暗くする時刻', 0, 23, 1, '時') + rng('nightTo', '明るくする時刻', 0, 23, 1, '時');
      h += rng('hoverDelay', '見本カードまでの待ち', 150, 1500, 50, 'ms');
      h += '<div class="lm-ctl"><label>本文の紙の幅</label><input type="text" data-t="sheetWidth" placeholder="例 860（空 = Notion のまま）" value="' + esc(S.tune.sheetWidth) + '"></div>';
    } else if (tab === 'data') {
      h += '<div class="lm-sec">書き出し・読み込み</div><p class="lm-desc">設定を文字にして別の端末へ。貼り付けて「読み込む」で戻せる。</p>';
      h += '<textarea class="lm-io">' + esc(JSON.stringify({ theme: S.theme, mode: S.mode, mods: S.mods, tune: S.tune, pages: S.pages }, null, 1)) + '</textarea>';
      h += '<div style="display:flex;gap:8px;margin-top:8px"><button class="lm-btn pri" data-io="load">読み込む</button><button class="lm-btn" data-io="copy">写す</button><button class="lm-btn" data-io="reset">はじめの設定に戻す</button></div>';
      h += '<div class="lm-sec">いまの状態</div><p class="lm-desc">' + esc(JSON.stringify({ theme: ST.theme, dark: ST.dark, accent: ST.accent, builds: ST.builds, error: ST.lastError || 'なし' })) + '</p>';
    }
    body.innerHTML = h;
    body.scrollTop = keep;
    panel.querySelector('.lm-ft').textContent = footer();
    wire(body);
  }
  const footer = () => curTheme().name + (ST.dark ? '・暗' : '・明') + (S.pages[pageId()] ? '・このページだけ' : '') + '　⌃⌥V で開閉';
  function setTheme(id) {
    const pid = pageId();
    if (pid && S.pages[pid]) S.pages[pid] = id; else S.theme = id;
    save(); apply(); panelSync(true);
  }
  function wire(body) {
    body.querySelectorAll('[data-th]').forEach((b) => { b.onclick = () => setTheme(b.dataset.th); });
    body.querySelectorAll('.lm-seg[data-k="mode"] button').forEach((b) => { b.onclick = () => { S.mode = b.dataset.v; save(); apply(); panelSync(true); }; });
    body.querySelectorAll('[data-dk]').forEach((el) => { el.addEventListener('input', () => { panel.__draft.base[el.dataset.dk] = el.value; const c = el.parentElement.querySelector('code'); if (c) c.textContent = el.value; clearTimeout(el.__t); el.__t = setTimeout(() => panelSync(true), 160); }); });
    body.querySelectorAll('[data-dn]').forEach((el) => { el.addEventListener('input', () => { panel.__draft.name = el.value; }); });
    body.querySelectorAll('[data-dtex]').forEach((el) => { el.addEventListener('change', () => { panel.__draft.tex = el.value; panelSync(true); }); });
    body.querySelectorAll('[data-make]').forEach((b) => {
      b.onclick = () => {
        const d = panel.__draft;
        if (b.dataset.make === 'from') { panel.__draft = draftFrom(curTheme()); panelSync(true); return; }
        const th = draftTheme(d);
        if (b.dataset.make === 'try') { tryTheme = th; THEME_BY_ID[th.id] = th; const keep = S.theme; S.theme = th.id; apply(); S.theme = keep; toast('試しに当てています（保存はしていません）'); return; }
        d.id = th.id;
        const i = S.custom.findIndex((c) => c.id === th.id);
        if (i >= 0) S.custom[i] = th; else S.custom.push(th);
        reindexThemes(); setTheme(th.id); toast('「' + th.name + '」を保存しました');
      };
    });
    body.querySelectorAll('[data-use]').forEach((b) => { b.onclick = () => setTheme(b.dataset.use); });
    body.querySelectorAll('[data-edit]').forEach((b) => { b.onclick = () => { const c = S.custom.find((x) => x.id === b.dataset.edit); if (c) { panel.__draft = draftFrom(c); panelSync(true); } }; });
    body.querySelectorAll('[data-del]').forEach((b) => { b.onclick = () => { if (!confirm('この配色を消しますか？')) return; S.custom = S.custom.filter((x) => x.id !== b.dataset.del); if (S.theme === b.dataset.del) S.theme = 'paper'; for (const k of Object.keys(S.pages)) if (S.pages[k] === b.dataset.del) delete S.pages[k]; reindexThemes(); save(); apply(); panelSync(true); }; });
    body.querySelectorAll('[data-mod]').forEach((b) => { b.onclick = () => { S.mods[b.dataset.mod] = !S.mods[b.dataset.mod]; b.classList.toggle('on', on(b.dataset.mod)); save(); apply(); if (b.dataset.mod === 'coverAccent') coverAccent(); }; });
    body.querySelectorAll('[data-tb]').forEach((b) => { b.onclick = () => { S.tune[b.dataset.tb] = !S.tune[b.dataset.tb]; b.classList.toggle('on', !!S.tune[b.dataset.tb]); save(); apply(); }; });
    body.querySelectorAll('[data-page]').forEach((b) => { b.onclick = () => { const pid = pageId(); if (!pid) return; if (S.pages[pid]) delete S.pages[pid]; else S.pages[pid] = curTheme().id; save(); apply(); panelSync(true); }; });
    body.querySelectorAll('[data-t]').forEach((el) => {
      const k = el.dataset.t;
      const fire = () => {
        let v = el.value;
        if (el.type === 'range') { v = +v; const o = el.parentElement.querySelector('output'); if (o) o.textContent = v + (k === 'radius' ? 'px' : ''); }
        if (k === 'sheetWidth') v = /^\d{3,4}$/.test(String(v).trim()) ? String(v).trim() : '';
        S.tune[k] = v; save(); apply();
      };
      el.addEventListener(el.type === 'range' || el.type === 'color' ? 'input' : 'change', fire);
    });
    body.querySelectorAll('[data-clear]').forEach((b) => { b.onclick = () => { S.tune[b.dataset.clear] = ''; save(); apply(); panelSync(true); }; });
    body.querySelectorAll('[data-io]').forEach((b) => {
      b.onclick = () => {
        const ta = body.querySelector('.lm-io');
        if (b.dataset.io === 'copy') { ta.select(); try { navigator.clipboard.writeText(ta.value); } catch (e) { document.execCommand('copy'); } b.textContent = '写しました'; return; }
        if (b.dataset.io === 'reset') { if (!confirm('Lumière の設定をはじめに戻します。よろしいですか？')) return; S = JSON.parse(JSON.stringify(DEF)); save(); apply(); panelSync(true); return; }
        try {
          const o = JSON.parse(ta.value);
          if (o.theme && THEME_BY_ID[o.theme]) S.theme = o.theme;
          if (o.mode) S.mode = o.mode;
          if (o.mods) Object.assign(S.mods, o.mods);
          if (o.tune) Object.assign(S.tune, o.tune);
          if (o.pages) S.pages = o.pages;
          save(); apply(); panelSync(true);
        } catch (e) { alert('読み込めませんでした: ' + e.message); }
      };
    });
  }
  function fab() {
    if (!S.tune.fab) { const old = document.getElementById('lm-fab'); if (old) old.remove(); return; }
    if (document.getElementById('lm-fab') || !document.body) return;
    if (!document.getElementById('lm-panel-css')) { const st = document.createElement('style'); st.id = 'lm-panel-css'; st.textContent = PANEL_CSS; document.head.appendChild(st); }
    const b = document.createElement('button');
    b.id = 'lm-fab'; b.textContent = 'L'; b.title = 'Lumière（⌃⌥V）';
    b.onclick = panelOpen;
    document.body.appendChild(b);
  }

  /* ============================================================
   *  12b. v11.0.0 — 三本柱を Notion の画面に溶け込ませる
   *       ・上の帯（Share の左）に、柱ごとの小さなボタン（²⁶ Aa ／ ³⁷ ◐ ／ ³⁸ Σ）。押すと Notion のメニューと同じ形の小窓
   *       ・どの柱が先に動いても、同じ「台」（#cordi-dock）に並ぶ（ほかの柱が無くても一人で動く）
   *       ・UI の書体（--cordi-ui）と、乗せた時の説明（title の代わりの小さな札）を三本柱でそろえる
   * ============================================================ */
  const CORDI_UI_DEFAULT = '"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Segoe UI", sans-serif';
  const CORDI_CSS = `
:root { --cordi-ui-fallback: ${CORDI_UI_DEFAULT}; }
#cordi-dock { display: inline-flex; align-items: center; gap: 1px; margin-inline: 2px 6px; flex: none; height: 28px; font-family: var(--cordi-ui, var(--cordi-ui-fallback)); }
#cordi-dock .cd-b { order: var(--cd-o, 5); width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--c-icoSec, #91918e);
  border: 0; background: transparent; padding: 0; transition: background-color 20ms ease-in, color .12s ease; position: relative; }
#cordi-dock .cd-b:hover { background: var(--ca-bacIntTra, rgba(55,53,47,.06)); color: var(--c-icoPri, #37352f); }
#cordi-dock .cd-b[aria-expanded="true"] { background: var(--ca-bacIntTra, rgba(55,53,47,.08)); color: var(--c-texPri, #37352f); }
#cordi-dock .cd-b svg { width: 18px; height: 18px; display: block; }
#cordi-dock .cd-b .cd-badge { position: absolute; top: 1px; right: 0; min-width: 13px; height: 13px; padding: 0 3px; border-radius: 999px; font: 600 8.5px/13px var(--cordi-ui, var(--cordi-ui-fallback)); text-align: center;
  background: var(--lm-accent, var(--c-bluIcoAccPri, #2383e2)); color: #fff; box-shadow: 0 0 0 1.5px var(--c-bacPri, #fff); font-variant-numeric: tabular-nums; }
#cordi-dock .cd-b .cd-badge:empty { display: none; }
.cordi-pop { position: fixed; z-index: 2147483100; width: 320px; max-height: min(78vh, 680px); overflow: auto; overscroll-behavior: contain; box-sizing: border-box; padding: 6px;
  border-radius: 12px; background: var(--c-bacEle, #fff); color: var(--c-texPri, #37352f);
  box-shadow: var(--c-shaOutLg, 0 0 0 1px rgba(15,15,15,.05), 0 3px 6px rgba(15,15,15,.1), 0 9px 24px rgba(15,15,15,.2));
  font: 13.5px/1.4 var(--cordi-ui, var(--cordi-ui-fallback)); font-feature-settings: "palt" 1; letter-spacing: .005em; -webkit-font-smoothing: antialiased; animation: cordi-pop-in .14s cubic-bezier(.2,.8,.2,1); }
@keyframes cordi-pop-in { from { opacity: 0; transform: translateY(-3px) scale(.985); } to { opacity: 1; transform: none; } }
.cordi-pop * { box-sizing: border-box; }
.cordi-pop .cp-hd { display: flex; align-items: baseline; gap: 8px; padding: 8px 10px 6px; }
.cordi-pop .cp-hd b { font: 600 15px/1.1 var(--cordi-ui-display, "Cordivestium Group Header", "Baskerville", "Cormorant Garamond", "Hiragino Mincho ProN", Georgia, serif); letter-spacing: .03em; }
.cordi-pop .cp-hd span { color: var(--c-texSec, #787774); font-size: 11.5px; }
.cordi-pop .cp-hd i { margin-inline-start: auto; font-style: normal; font-size: 10.5px; color: var(--c-texTer, #a5a29a); }
.cordi-pop .cp-sec { padding: 10px 10px 4px; font-size: 11px; font-weight: 600; color: var(--c-texSec, #787774); letter-spacing: .02em; }
.cordi-pop .cp-div { height: 1px; margin: 6px 4px; background: var(--ca-borSecTra, rgba(55,53,47,.09)); }
.cordi-pop .cp-i { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 30px; padding: 4px 10px; border: 0; background: none; color: inherit; font: inherit; text-align: left; border-radius: 7px; cursor: pointer; }
.cordi-pop .cp-i:hover, .cordi-pop .cp-i.kb { background: var(--ca-bacIntTra, rgba(55,53,47,.06)); }
.cordi-pop .cp-i .ic { width: 20px; height: 20px; flex: none; display: flex; align-items: center; justify-content: center; color: var(--c-icoPri, #37352f); font-size: 15px; }
.cordi-pop .cp-i .ic svg { width: 18px; height: 18px; }
.cordi-pop .cp-i .lb { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cordi-pop .cp-i .lb small { display: block; font-size: 11px; color: var(--c-texSec, #787774); white-space: normal; line-height: 1.35; margin-top: 1px; }
.cordi-pop .cp-i .k { font-size: 11px; color: var(--c-texTer, #a5a29a); font-variant-numeric: tabular-nums; white-space: nowrap; }
.cordi-pop .cp-sw { flex: none; width: 28px; height: 16px; border-radius: 999px; background: var(--ca-borPriTra, rgba(55,53,47,.16)); position: relative; transition: background-color .18s; }
.cordi-pop .cp-sw::after { content: ""; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: transform .18s cubic-bezier(.2,.8,.2,1); }
.cordi-pop .cp-sw.on { background: var(--lm-accent, var(--c-bluIcoAccPri, #2383e2)); }
.cordi-pop .cp-sw.on::after { transform: translateX(12px); }
.cordi-pop .cp-seg { display: flex; gap: 2px; margin: 2px 8px 6px; padding: 2px; border-radius: 8px; background: var(--ca-bacIntTra, rgba(55,53,47,.06)); }
.cordi-pop .cp-seg button { flex: 1; border: 0; background: transparent; color: var(--c-texSec, #787774); font: inherit; font-size: 12px; padding: 4px 6px; border-radius: 6px; cursor: pointer; white-space: nowrap; }
.cordi-pop .cp-seg button.on { background: var(--c-bacEle, #fff); color: var(--c-texPri, #37352f); box-shadow: 0 1px 2px rgba(0,0,0,.12); font-weight: 600; }
.cordi-pop .cp-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; padding: 4px 8px 8px; }
.cordi-pop .cp-th { border: 0; padding: 0; background: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; color: inherit; font: inherit; }
.cordi-pop .cp-th i { display: block; width: 100%; aspect-ratio: 1.25; border-radius: 8px; position: relative; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); transition: transform .15s; }
.cordi-pop .cp-th i::before { content: ""; position: absolute; inset: 22% 18% 20% 30%; border-radius: 3px; background: var(--s); box-shadow: 0 1px 2px rgba(0,0,0,.12); }
.cordi-pop .cp-th i::after { content: ""; position: absolute; left: 10%; top: 24%; width: 13%; aspect-ratio: 1; border-radius: 50%; background: var(--a); }
.cordi-pop .cp-th:hover i { transform: translateY(-1px); }
.cordi-pop .cp-th.on i { box-shadow: 0 0 0 2px var(--lm-accent, #2383e2); }
.cordi-pop .cp-th span { font-size: 10px; color: var(--c-texSec, #787774); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cordi-pop .cp-row { display: flex; align-items: center; gap: 8px; padding: 4px 10px 8px; }
.cordi-pop .cp-row input[type=color] { width: 30px; height: 26px; border: 0; padding: 0; background: none; cursor: pointer; }
.cordi-pop .cp-row input[type=text], .cordi-pop .cp-row input[type=date], .cordi-pop .cp-row input[type=number], .cordi-pop .cp-row select { flex: 1; min-width: 0; height: 28px; border: 0; border-radius: 6px; padding: 0 8px; font: inherit; font-size: 12.5px; color: inherit; background: var(--ca-bacSecTra, rgba(55,53,47,.04)); box-shadow: inset 0 0 0 1px var(--ca-borPriTra, rgba(55,53,47,.16)); outline: none; }
.cordi-pop .cp-btn { flex: none; height: 28px; padding: 0 12px; border: 0; border-radius: 6px; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; background: var(--lm-accent, var(--c-bluIcoAccPri, #2383e2)); color: #fff; }
.cordi-pop .cp-btn.ghost { background: transparent; color: inherit; box-shadow: inset 0 0 0 1px var(--ca-borPriTra, rgba(55,53,47,.16)); font-weight: 500; }
.cordi-pop .cp-note { padding: 4px 12px 8px; font-size: 11.5px; color: var(--c-texSec, #787774); line-height: 1.55; }
.cordi-tip { position: fixed; z-index: 2147483640; max-width: 280px; padding: 5px 9px; border-radius: 7px; pointer-events: none;
  background: color-mix(in srgb, var(--c-texPri, #1f1f1f) 92%, transparent); color: var(--c-bacPri, #fff);
  font: 500 11.5px/1.45 var(--cordi-ui, var(--cordi-ui-fallback)); font-feature-settings: "palt" 1; letter-spacing: .01em; -webkit-font-smoothing: antialiased;
  box-shadow: 0 4px 14px rgba(0,0,0,.18); opacity: 0; transform: translateY(2px); transition: opacity .12s ease, transform .12s ease; white-space: pre-line; }
.cordi-tip.on { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .cordi-pop, .cordi-tip { animation: none !important; transition: none !important; } }`;
  function cordiCss() {
    if (!document.getElementById('cordi-css')) { const st = document.createElement('style'); st.id = 'cordi-css'; st.textContent = CORDI_CSS; (document.head || document.documentElement).appendChild(st); }
  }
  /* 上の帯の「台」— Share の左。Notion が上の帯を作り直しても置き直す */
  function cordiDock() {
    const more = document.querySelector('.notion-topbar .notion-topbar-more-button, .notion-topbar-more-button');
    const share = document.querySelector('.notion-topbar .notion-topbar-share-menu, .notion-topbar-share-menu');
    const anchor = share || more;
    const bar = document.querySelector('.notion-topbar-action-buttons') || (anchor && anchor.parentElement);
    if (!bar) return null;
    let d = document.getElementById('cordi-dock');
    if (!d) { d = document.createElement('div'); d.id = 'cordi-dock'; }
    let ref = anchor; while (ref && ref.parentElement !== bar) ref = ref.parentElement;
    if (d.parentElement !== bar || (ref && d.nextElementSibling !== ref)) bar.insertBefore(d, ref || bar.firstChild);
    return d;
  }
  function dockButton(id, order, svg, tip, onClick) {
    cordiCss();
    const d = cordiDock(); if (!d) return null;
    let b = document.getElementById(id);
    if (!b) {
      b = document.createElement('button'); b.id = id; b.className = 'cd-b'; b.type = 'button';
      b.style.setProperty('--cd-o', String(order)); b.innerHTML = svg + '<span class="cd-badge"></span>';
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick(b); });
    }
    b.title = tip;
    if (b.parentElement !== d) d.appendChild(b);
    return b;
  }
  /* 小窓（Notion のメニューと同じ形）。ほかの柱の小窓は閉じる */
  let popEl = null, popBtn = null;
  function popClose() { if (popEl) popEl.remove(); popEl = null; if (popBtn) popBtn.setAttribute('aria-expanded', 'false'); popBtn = null; }
  document.addEventListener('cordi:closepops', (e) => { if (!e.detail || e.detail !== 'lm') popClose(); });
  function popOpen(btn, render) {
    if (popEl && popBtn === btn) { popClose(); return; }
    popClose();
    document.dispatchEvent(new CustomEvent('cordi:closepops', { detail: 'lm' }));
    cordiCss();
    popEl = document.createElement('div'); popEl.className = 'cordi-pop'; popEl.id = 'lm-pop';
    popBtn = btn; if (btn && btn.setAttribute) btn.setAttribute('aria-expanded', 'true');
    document.body.appendChild(popEl);
    const place = () => {
      if (!popEl) return;
      const r = btn.getBoundingClientRect ? btn.getBoundingClientRect() : { left: btn.x || 0, right: btn.x || 0, bottom: btn.y || 0, top: btn.y || 0 };
      popEl.style.top = Math.min(innerHeight - popEl.offsetHeight - 8, r.bottom + 6) + 'px';
      popEl.style.left = Math.max(8, Math.min(innerWidth - popEl.offsetWidth - 8, r.right - popEl.offsetWidth + 4)) + 'px';
    };
    const draw = () => { const sc = popEl.scrollTop; popEl.innerHTML = render(); popEl.scrollTop = sc; place(); };
    popEl.__draw = draw;
    draw();
    setTimeout(() => document.addEventListener('pointerdown', function off(e) {
      if (!popEl) { document.removeEventListener('pointerdown', off, true); return; }
      if (popEl.contains(e.target) || (popBtn && popBtn.contains && popBtn.contains(e.target))) return;
      document.removeEventListener('pointerdown', off, true); popClose();
    }, true), 0);
    return popEl;
  }
  /* 乗せた時の説明: 三本柱の UI の title を、そろえた書体の小さな札で出す（OS の吹き出しは書体を変えられない）。
     どれか一つの柱だけが受け持つ（html[data-cordi-tip]） */
  const TIP_SCOPE = '#cordi-dock, .cordi-pop, #c33-orbit, #c33-orbit-btn, #c33-ob-menu, #c26-menu, #c26-sub, .c26-ui, .c26-panel, #lm-panel, [id^="s38"], [class^="s38"], [class*=" s38-"], #c16-root, #c16-newspace, #c34-view';
  function tipsInstall() {
    const de = document.documentElement;
    if (!de || de.hasAttribute('data-cordi-tip')) return;
    de.setAttribute('data-cordi-tip', 'lm');
    let tipEl = null, tipFor = null, tipT = 0;
    const hide = () => { clearTimeout(tipT); if (tipFor && tipFor.dataset.cordiTip != null && !tipFor.getAttribute('title')) { tipFor.setAttribute('title', tipFor.dataset.cordiTip); delete tipFor.dataset.cordiTip; } tipFor = null; if (tipEl) tipEl.classList.remove('on'); };
    document.addEventListener('pointerover', (e) => {
      const t = e.target instanceof Element ? e.target.closest('[title], [data-cordi-tip]') : null;
      if (t === tipFor) return;
      hide();
      if (!t || !t.closest(TIP_SCOPE)) return;
      const txt = t.getAttribute('title') || t.dataset.cordiTip || '';
      if (!txt.trim()) return;
      t.dataset.cordiTip = txt; t.removeAttribute('title');   // OS の吹き出しを止める
      tipFor = t;
      tipT = setTimeout(() => {
        if (tipFor !== t || !t.isConnected) return;
        cordiCss();
        if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'cordi-tip'; document.body.appendChild(tipEl); }
        tipEl.textContent = txt;
        const r = t.getBoundingClientRect();
        tipEl.style.left = '0px'; tipEl.style.top = '0px';
        const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
        let top = r.bottom + 6; if (top + h > innerHeight - 6) top = r.top - h - 6;
        tipEl.style.left = Math.max(6, Math.min(innerWidth - w - 6, r.left + r.width / 2 - w / 2)) + 'px';
        tipEl.style.top = Math.max(6, top) + 'px';
        tipEl.classList.add('on');
      }, 380);
    }, true);
    document.addEventListener('pointerdown', hide, true);
    document.addEventListener('scroll', hide, { capture: true, passive: true });
    window.addEventListener('blur', hide);
  }

  /* ---------- ³⁷ のボタンと小窓 ---------- */
  const ICON_LM = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="10" cy="10" r="6.6"/><path d="M10 3.4a6.6 6.6 0 0 1 0 13.2z" fill="currentColor" stroke="none"/><circle cx="10" cy="10" r="2.1" fill="var(--c-bacPri, #fff)" stroke="none"/></svg>';
  const GSTYLES = [['card', 'カード'], ['polaroid', 'ポラロイド'], ['frame', '額装'], ['shelf', '本棚'], ['flat', '素']];
  function lmPopHtml() {
    const cur = curTheme().id, pid = pageId(), pageOnly = !!(pid && S.pages[pid]);
    const sw = (on2) => '<span class="cp-sw' + (on2 ? ' on' : '') + '"></span>';
    const tog = (k, label, sub, val) => '<button class="cp-i" data-lt="' + k + '"><span class="lb">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + sw(val) + '</button>';
    const p = curPalette();
    let h = '<div class="cp-hd"><b>Lumière</b><span>見た目 · ' + esc(curTheme().name) + (p.dark ? '（暗）' : '（明）') + '</span><i>³⁷ v' + VERSION + '</i></div>';
    h += '<div class="cp-grid">' + allThemes().map((t) => { const q = p.dark ? t.dark : t.light; return '<button class="cp-th' + (t.id === cur ? ' on' : '') + '" data-lth="' + esc(t.id) + '" title="' + esc(t.name + ' — ' + (t.desc || '')) + '"><i style="background:' + q.bg + ';--s:' + q.sheet + ';--a:' + q.accent + '"></i><span>' + esc(t.name) + '</span></button>'; }).join('') + '</div>';
    h += '<div class="cp-seg" data-lseg="mode">' + [['auto', 'Notion に合わせる'], ['light', '明'], ['dark', '暗']].map(([v, l]) => '<button data-v="' + v + '" class="' + (S.mode === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div>';
    h += tog('pageOnly', 'このページだけこの配色', pid ? '' : '（ページを開いている時だけ）', pageOnly);
    h += '<div class="cp-div"></div><div class="cp-sec">推し色で配色を作る</div>';
    h += '<div class="cp-row"><input type="color" class="lm-oshi-c" value="' + esc(S.tune.oshiColor || '#d4709a') + '"><input type="text" class="lm-oshi-n" placeholder="名前（例: 推しの名前）" value="' + esc(S.tune.oshiName || '') + '"><button class="cp-btn" data-la="oshi">作る</button></div>';
    h += '<div class="cp-div"></div><div class="cp-sec">見た目</div>';
    h += tog('curtain', 'カーテン', '読み込み・描き直しを見せず、出来上がった画面だけを出す', on('curtain'));
    h += tog('texture', '紙の質感', '', on('texture'));
    h += tog('sheet', '本文を一枚の紙に', '', on('sheet'));
    h += tog('focus', '集中モード', '本文以外を薄く（⌃⌥B）', document.documentElement.hasAttribute('data-lm-focus'));
    h += tog('schedule', '夜は自動で暗く', (S.tune.nightFrom || 19) + ' 時〜' + (S.tune.nightTo || 6) + ' 時', !!S.tune.schedule);
    h += tog('hoverCard', 'ページの見本カード', 'リレーション・題字に乗せると表紙つきのカード', on('hoverCard'));
    h += '<div class="cp-sec">表の縦の罫線</div><div class="cp-seg" data-lseg="colLines">' + [['none', 'なし'], ['hair', '淡く'], ['soft', 'ふつう'], ['strong', 'はっきり']].map(([v, l]) => '<button data-v="' + v + '" class="' + ((S.tune.colLines || 'soft') === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div>';
    h += '<div class="cp-sec">ギャラリーの形</div><div class="cp-seg" data-lseg="galleryStyle">' + GSTYLES.map(([v, l]) => '<button data-v="' + v + '" class="' + (S.tune.galleryStyle === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div>';
    h += '<div class="cp-div"></div>';
    h += '<button class="cp-i" data-la="panel"><span class="ic">' + ICON_LM + '</span><span class="lb">すべての設定…<small>配色の自作・モジュール 36 個・細部・保存</small></span><span class="k">⌃⌥V</span></button>';
    return h;
  }
  function lmPopClick(e) {
    const el = e.target.closest('[data-lth], [data-lt], [data-la], [data-lseg] button');
    if (!el || !popEl) return;
    if (el.dataset.lth) { setTheme(el.dataset.lth); }
    else if (el.dataset.lt) {
      const k = el.dataset.lt;
      if (k === 'focus') focusToggle();
      else if (k === 'schedule') { S.tune.schedule = !S.tune.schedule; save(); apply(); }
      else if (k === 'pageOnly') { const pid = pageId(); if (!pid) return; if (S.pages[pid]) delete S.pages[pid]; else S.pages[pid] = curTheme().id; save(); apply(); }
      else { S.mods[k] = !S.mods[k]; save(); apply(); }
    } else if (el.dataset.la === 'panel') { popClose(); panelOpen(); return; }
    else if (el.dataset.la === 'oshi') {
      const c = popEl.querySelector('.lm-oshi-c').value, n = popEl.querySelector('.lm-oshi-n').value.trim();
      S.tune.oshiColor = c; S.tune.oshiName = n;
      const th = oshiTheme(c, n);
      S.custom = (S.custom || []).filter((t) => t.id !== th.id).concat([th]); reindexThemes();
      setTheme(th.id); toast('推し色「' + th.name + '」の配色にしました');
    } else if (el.parentElement && el.parentElement.dataset.lseg) {
      const k = el.parentElement.dataset.lseg;
      if (k === 'mode') S.mode = el.dataset.v; else S.tune[k] = el.dataset.v;
      save(); apply();
    }
    if (popEl && popEl.__draw) popEl.__draw();
  }
  /* 推し色: 一色から、明・暗の配色を作る（背景はその色をごく淡く、差し色は補色寄りの二色目） */
  function oshiTheme(hex, name) {
    const h = rgb2hsl(hex2rgb(hex));
    const bg = rgb2hex(hsl2rgb([h[0], Math.min(40, h[1] * 0.45), 95.5]));
    const sheet = rgb2hex(hsl2rgb([h[0], Math.min(30, h[1] * 0.3), 98.6]));
    const ink = rgb2hex(hsl2rgb([h[0], Math.min(25, h[1] * 0.3), 15]));
    const accent2 = rgb2hex(hsl2rgb([(h[0] + 150) % 360, Math.min(55, h[1]), 42]));
    const id = 'oshi-' + hex.replace('#', '').toLowerCase();
    return draftTheme({ id, name: name ? name + 'の色' : '推し色 ' + hex, tex: 'none', base: { bg, sheet, ink, accent: hex, accent2 } });
  }
  function lmDock() {
    const b = dockButton('cordi-b-lm', 3, ICON_LM, 'Lumière — 配色・見た目（⌃⌥V）', (btn) => {
      const el = popOpen(btn, lmPopHtml);
      if (el) { el.addEventListener('click', lmPopClick); el.addEventListener('change', (e) => { if (e.target.matches('.lm-oshi-c')) { S.tune.oshiColor = e.target.value; save(); } }); }
    });
    return b;
  }
  /* Atelier の ⋯ メニュー・ほかの柱から呼ぶ（detail は文字列 JSON か {id}） */
  document.addEventListener('cordi:run', (e) => {
    let d = e.detail; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { d = { id: d }; } }
    if (!d || !d.id) return;
    if (d.id === 'lm.pop') { const b = document.getElementById('cordi-b-lm') || lmDock(); if (b) b.click(); else if (d.x != null) { const el = popOpen({ getBoundingClientRect: () => ({ left: d.x, right: d.x + 300, top: d.y, bottom: d.y }) }, lmPopHtml); if (el) el.addEventListener('click', lmPopClick); } }
    else if (d.id === 'lm.panel') panelOpen();
    else if (d.id === 'lm.focus') focusToggle();
    else if (d.id === 'lm.theme' && d.theme && THEME_BY_ID[d.theme]) setTheme(d.theme);
  });
  /* ほかの柱に「何ができるか」を知らせる（Atelier の ⋯ メニューが並べる） */
  function announce() {
    document.dispatchEvent(new CustomEvent('cordi:tools', { detail: JSON.stringify({ pillar: 'lm', name: 'Lumière', icon: ICON_LM, tools: [
      { id: 'lm.pop', label: '配色・見た目', hint: curTheme().name },
      { id: 'lm.focus', label: '集中モード', key: '⌃⌥B' },
      { id: 'lm.panel', label: 'Lumière の設定', key: '⌃⌥V' }
    ] }) }));
  }
  document.addEventListener('cordi:tools?', announce);

  /* ============================================================
   *  12c. カーテン — 読み込みも描き直しも見せない
   *    ・開いた瞬間（document-start）から、Notion の画面を配色の背景色の「幕」で隠す
   *    ・本文（ページ・DB）が描かれ、書体が読み終わり、画面の変化が一息ついたら（各柱・¹⁶ の並べ替えが済んだら）、幕を上げる
   *    ・ページを移る時（サイドバー・リンク・パンくずのクリック）も、本文の枠だけ一瞬隠して、出来上がってから出す
   *    ・どんな時も最長で上げる（JS が止まっても CSS だけで 4 秒後に出る安全弁）
   * ============================================================ */
  const CUR = { t0: performance.now(), done: false, navT: 0, quietT: 0, mo: null };
  CSS.curtain = () => `
html[data-lm-curtain] { background: var(--lm-bg, var(--c-bacPri, #fff)) !important; }
html[data-lm-curtain="boot"] #notion-app { opacity: 0; animation: lm-curtain-safe .01s linear ${Math.round((+T('curtainMax') || 3200) / 1000 + 0.8)}s forwards; }
html[data-lm-curtain="nav"] .notion-frame > :not(.notion-topbar):not(:has(.notion-topbar)), html[data-lm-curtain="nav"] .notion-frame .notion-scroller { opacity: 0 !important; transition: none !important; }
html[data-lm-curtain-up] #notion-app, html[data-lm-curtain-up] .notion-frame > *, html[data-lm-curtain-up] .notion-frame .notion-scroller { transition: opacity ${reduce() ? 0 : 0.2}s cubic-bezier(.2,0,0,1) !important; }
@keyframes lm-curtain-safe { to { opacity: 1; } }`;
  /* v13: ³⁹ Style Sheets で 16c の幕を出している時は、こちらの幕は出さない（幕が二重になって開くのが遅れる） */
  function c39Curtain() { try { return localStorage.getItem('c39.curtain') === '1'; } catch (e) { return false; } }
  function curtainBoot() {
    if (!on('curtain') || c39Curtain()) return;
    if (!document.documentElement) {   // document-start の最初の瞬間は <html> もまだ無い → できた瞬間に幕を掛ける
      const w = new MutationObserver(() => { if (document.documentElement) { w.disconnect(); apply(); curtainBoot(); } });
      w.observe(document, { childList: true });
      return;
    }
    document.documentElement.setAttribute('data-lm-curtain', 'boot');
    curtainWait('boot', +T('curtainMax') || 3200);
  }
  const CONTENT = '.notion-frame .notion-page-content, .notion-frame .notion-collection_view-block, .notion-frame .notion-collection-view-body, .notion-frame .notion-table-view, .notion-frame .notion-board-view, .notion-frame .notion-gallery-view, .notion-frame .notion-list-view, .notion-frame .notion-calendar-view, .notion-frame .notion-timeline-view, .notion-peek-renderer .notion-page-content, .notion-login, .notion-onboarding';
  function curtainWait(kind, max) {
    const start = performance.now();
    let last = performance.now(), fontsOk = false;
    try { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { fontsOk = true; }); } catch (e) { fontsOk = true; }
    if (CUR.mo) CUR.mo.disconnect();
    CUR.mo = new MutationObserver((recs) => {
      for (const r of recs) { const t = r.target; if (t.nodeType === 1 && (t.id === 'lm-progress' || (t.closest && t.closest('.cordi-tip, #lm-toast')))) continue; last = performance.now(); break; }
    });
    try { CUR.mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'data-c16-veil'] }); } catch (e) { /* noop */ }
    const check = () => {
      const now = performance.now();
      const de = document.documentElement;
      const ready = kind === 'nav' ? ((location.href !== CUR.from && !!document.querySelector(CONTENT)) || (now - start > 450 && location.href === CUR.from)) : !!document.querySelector(CONTENT);
      const quiet = now - last > (kind === 'nav' ? 110 : 170);
      const busy = de.hasAttribute('data-c16-veil');
      if ((ready && fontsOk && quiet && !busy) || now - start > max) { curtainUp(); return; }
      CUR.quietT = setTimeout(check, 40);
    };
    clearTimeout(CUR.quietT);
    CUR.quietT = setTimeout(check, kind === 'nav' ? 60 : 120);
  }
  function curtainUp() {
    const de = document.documentElement;
    if (CUR.mo) { CUR.mo.disconnect(); CUR.mo = null; }
    if (!de.hasAttribute('data-lm-curtain')) return;
    de.setAttribute('data-lm-curtain-up', '1');
    requestAnimationFrame(() => {
      de.removeAttribute('data-lm-curtain');
      setTimeout(() => de.removeAttribute('data-lm-curtain-up'), 260);
    });
  }
  /* ページを移る時: クリックの瞬間（Notion が描き変える前）に本文だけ隠す */
  document.addEventListener('click', (e) => {
    if (!on('curtain') || c39Curtain() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank' || a.closest('.cordi-pop, #lm-panel, [id^="s38"]')) return;
    let u; try { u = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
    if (/[?&]p=/.test(u.search) && u.pathname === location.pathname) return;   // ピーク（横の窓）は幕を掛けない
    const de = document.documentElement;
    if (de.getAttribute('data-lm-curtain') === 'boot') return;
    CUR.from = location.href;
    de.setAttribute('data-lm-curtain', 'nav');
    curtainWait('nav', 900);
  }, true);

  /* ============================================================
   *  Cordivestium × Notion の「ビューの設定」（View settings）
   *  — ³⁶ ³⁷ ³⁸ に同じ部品が入っていて、どれか 1 本だけでも動く。段は Notion の行を写して作るので、見た目は Notion のまま。
   *    ・where: 'afterGroup' … Notion の「Group」のすぐ下（サブグループ）
   *    ・where: 'section'    … 「Data source settings」の前に Cordivestium の段を 1 つ作り、その中へ
   *    行の右は 値（文字＋›）か スイッチ。押すと onClick（小窓は vsSub で Notion の小メニューと同じ形に）
   * ============================================================ */
  function cordiVS(rows) {
    const HEAD_RE = /^(View settings|ビューの設定|ビュー設定|表示設定)$/;
    const GROUP_RE = /^(Group|グループ|グループ化)$/;
    const LAYOUT_RE = /^(Layout|レイアウト)$/;
    const DS_RE = /^(Data source settings|データソースの設定|データソース設定|データベースの設定)$/;
    const SW_CSS_ID = 'cordi-vs-css';
    let lastView = null;
    const VIEW_Q = '.notion-table-view, .notion-board-view, .notion-gallery-view, .notion-list-view, .notion-calendar-view, .notion-timeline-view';
    document.addEventListener('pointerdown', (e) => {
      const t = e.target; if (!t || !t.closest) return;
      if (t.closest('.notion-overlay-container')) return;
      const blk = t.closest('.notion-collection_view-block, .notion-peek-renderer, .notion-frame');
      if (!blk) return;
      const inl = t.closest('.notion-collection_view-block');
      const v = inl ? inl.querySelector(VIEW_Q) : blk.querySelector(VIEW_Q);
      if (v) lastView = v;
    }, true);
    const viewNow = () => (lastView && lastView.isConnected ? lastView : document.querySelector('.notion-frame ' + VIEW_Q.split(', ').join(', .notion-frame ')));
    const txt = (el) => String(el && el.textContent || '').replace(/\s+/g, ' ').trim();
    function css() {
      if (document.getElementById(SW_CSS_ID)) return;
      const st = document.createElement('style'); st.id = SW_CSS_ID;
      st.textContent = `
[data-cordi-vs-row] .cvs-sw { position: relative; width: 26px; height: 14px; border-radius: 44px; background: var(--ca-graBacSecTra, rgba(135,131,120,.3)); transition: background .2s; flex: none; margin-inline-start: 6px; }
[data-cordi-vs-row] .cvs-sw::after { content: ""; position: absolute; top: 2px; left: 2px; width: 10px; height: 10px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(15,15,15,.2); transition: transform .2s ease-out; }
[data-cordi-vs-row][data-on] .cvs-sw { background: var(--c-intBlu, #2383e2); }
[data-cordi-vs-row][data-on] .cvs-sw::after { transform: translateX(12px); }
[data-cordi-vs-row] .cvs-ico { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
[data-cordi-vs-row] .cvs-ico svg { width: 18px; height: 18px; display: block; }
#cordi-vs-sub { position: fixed; z-index: 2147483000; display: flex; flex-direction: column; overflow: hidden; background: var(--c-popBac, var(--c-bacPri, #fff)); color: var(--c-texPri, #37352f); border-radius: 10px; box-shadow: var(--c-shaOutMd, 0 0 0 1px rgba(15,15,15,.05), 0 3px 6px rgba(15,15,15,.1), 0 9px 24px rgba(15,15,15,.2)); font-size: 14px; animation: cvs-in .14s ease-out; }
@keyframes cvs-in { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: none; } }
#cordi-vs-sub .cvs-hd { display: flex; align-items: center; gap: 6px; height: 42px; padding: 14px 12px 6px 10px; flex: none; }
#cordi-vs-sub .cvs-back { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; color: var(--c-icoSec, rgba(55,53,47,.45)); }
#cordi-vs-sub .cvs-back:hover { background: var(--ca-butHovBac, rgba(55,53,47,.06)); }
#cordi-vs-sub .cvs-ttl { color: var(--c-texSec, rgba(55,53,47,.65)); font-size: 12px; line-height: 16px; font-weight: 500; flex: 1; }
#cordi-vs-sub .cvs-bd { overflow: auto; padding: 4px 0 8px; flex: 1; }
#cordi-vs-sub .cvs-sec { padding: 10px 14px 4px; color: var(--c-texSec, rgba(55,53,47,.65)); font-size: 12px; font-weight: 500; }
#cordi-vs-sub .cvs-it { display: flex; align-items: center; gap: 8px; min-height: 30px; margin: 0 4px; padding: 0 8px; border-radius: 6px; cursor: pointer; user-select: none; }
#cordi-vs-sub .cvs-it:hover { background: var(--ca-butHovBac, rgba(55,53,47,.06)); }
#cordi-vs-sub .cvs-it .cvs-mk { width: 20px; display: flex; align-items: center; justify-content: center; color: var(--c-icoSec, rgba(55,53,47,.45)); flex: none; font-size: 13px; }
#cordi-vs-sub .cvs-it .cvs-lb { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#cordi-vs-sub .cvs-it .cvs-ck { color: var(--c-texPri, #37352f); flex: none; }
#cordi-vs-sub .cvs-it select { font: inherit; font-size: 13px; color: var(--c-texSec, rgba(55,53,47,.65)); background: transparent; border: 0; max-width: 130px; cursor: pointer; }
#cordi-vs-sub .cvs-note { padding: 4px 14px 2px; color: var(--c-texTer, rgba(55,53,47,.45)); font-size: 12px; line-height: 1.5; }
#cordi-vs-sub .cvs-div { height: 1px; margin: 6px 0; background: var(--ca-borPriTra, rgba(55,53,47,.09)); }
`;
      (document.head || document.documentElement).appendChild(st);
    }
    function panels() {
      const out = [];
      for (const h of document.querySelectorAll('.notion-overlay-container div[style*="font-size: 12px"]')) {
        if (h.children.length || !HEAD_RE.test(txt(h))) continue;
        let p = h.parentElement;
        while (p && p.parentElement && !p.querySelector('[role="menuitem"]')) p = p.parentElement;
        if (p) out.push(p);
      }
      return out;
    }
    const itemLabel = (mi) => txt(mi.querySelector('[role="presentation"]'));
    function ctxOf(panel) {
      const items = [...panel.querySelectorAll('[role="menuitem"]')].filter((m) => !m.closest('[data-cordi-vs-row]'));
      const lay = items.find((m) => LAYOUT_RE.test(itemLabel(m)));
      const grp = items.find((m) => GROUP_RE.test(itemLabel(m)));
      const layout = lay ? txt(lay.querySelector('div[style*="color: var(--c-texTer)"]')) : '';
      return { panel, items, grp, layout, view: viewNow(), grouped: !!(grp && txt(grp.querySelector('div[style*="color: var(--c-texTer)"]')) && !/^(None|なし)$/i.test(txt(grp.querySelector('div[style*="color: var(--c-texTer)"]')))) };
    }
    function makeRow(tpl, r) {
      const row = tpl.cloneNode(true);
      row.removeAttribute('tabindex');
      row.setAttribute('data-cordi-vs-row', r.id);
      row.setAttribute('data-cordi-order', String(r.order || 50));
      for (const x of row.querySelectorAll('[data-popup-origin]')) x.removeAttribute('data-popup-origin');
      const ico = row.querySelector(':scope > div > div:first-child');
      if (ico) ico.innerHTML = '<span class="cvs-ico">' + (r.icon || '') + '</span>';
      const lb = row.querySelector('[role="presentation"]');
      if (lb) lb.textContent = r.label;
      row.addEventListener('pointerdown', (e) => { e.stopPropagation(); }, true);
      row.addEventListener('mousedown', (e) => { e.stopPropagation(); }, true);
      row.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const panel = panels().find((p) => p.contains(row)); if (!panel) return; try { r.onClick(ctxOf(panel), row); } catch (er) { console.warn('[cordi-vs]', er); } setTimeout(() => upd(row, r, ctxOf(panel)), 30); }, true);
      return row;
    }
    function upd(row, r, ctx) {
      const right = row.querySelector('div[style*="color: var(--c-texTer)"]');
      if (!right) return;
      const valBox = right.firstElementChild;
      const chev = right.querySelector('svg');
      if (r.toggle) {
        const on = !!r.toggle(ctx);
        row.toggleAttribute('data-on', on);
        if (valBox) valBox.textContent = '';
        if (chev) chev.style.display = 'none';
        let sw = right.querySelector('.cvs-sw');
        if (!sw) { sw = document.createElement('span'); sw.className = 'cvs-sw'; right.appendChild(sw); }
      } else if (valBox) {
        const v = r.value ? r.value(ctx) : '';
        if (valBox.textContent !== (v || '')) valBox.textContent = v || '';
      }
    }
    function section(panel, ctx) {
      let sec = panel.querySelector('[data-cordi-vs-sec]');
      if (sec) return sec;
      const dsh = [...panel.querySelectorAll('div')].find((d) => !d.children.length && DS_RE.test(txt(d)));
      const block2 = dsh && dsh.closest('div[style*="margin-top"]');
      const block1 = ctx.grp && ctx.grp.parentElement;
      if (!block1) return null;
      sec = block2 ? block2.cloneNode(false) : document.createElement('div');
      sec.setAttribute('data-cordi-vs-sec', '1');
      if (!block2) sec.style.marginTop = '4px';
      const dv = block2 && block2.firstElementChild && !txt(block2.firstElementChild) ? block2.firstElementChild.cloneNode(true) : null;
      if (dv) sec.appendChild(dv); else { const d = document.createElement('div'); d.style.cssText = 'height:1px;margin:0 12px 4px;background:var(--ca-borPriTra)'; sec.appendChild(d); }
      const hrow = dsh ? dsh.parentElement.cloneNode(false) : document.createElement('div');
      if (!dsh) hrow.style.cssText = 'padding:4px 14px 2px';
      const ht = dsh ? dsh.cloneNode(false) : document.createElement('div');
      if (!dsh) ht.style.cssText = 'color:var(--c-texSec);font-size:12px;font-weight:500;line-height:16px';
      ht.textContent = 'Cordivestium';
      hrow.appendChild(ht);
      sec.appendChild(hrow);
      if (block2 && block2.parentElement) block2.parentElement.insertBefore(sec, block2);
      else block1.parentElement.insertBefore(sec, block1.nextSibling);
      return sec;
    }
    function place(parent, row, before) {
      const o = +row.getAttribute('data-cordi-order');
      const sibs = [...parent.querySelectorAll(':scope > [data-cordi-vs-row]')];
      const nxt = sibs.find((s) => s !== row && +s.getAttribute('data-cordi-order') > o);
      if (nxt) parent.insertBefore(row, nxt); else if (before) parent.insertBefore(row, before); else parent.appendChild(row);
    }
    function scan() {
      /* 前の画面（小メニューに替わった時など）に残った段を片づける（自分の行と、空の段だけ） */
      const ps = panels();
      const mine = new Set(rows.map((r) => r.id));
      for (const el of document.querySelectorAll('[data-cordi-vs-row]')) if (mine.has(el.getAttribute('data-cordi-vs-row')) && !ps.some((p) => p.contains(el))) el.remove();
      for (const el of document.querySelectorAll('[data-cordi-vs-sec]')) if (!ps.some((p) => p.contains(el)) || !el.querySelector('[data-cordi-vs-row]')) el.remove();
      if (!ps.length) { closeSub(true); return; }
      css();
      for (const panel of ps) {
        const ctx = ctxOf(panel);
        if (!ctx.grp) continue;
        for (const r of rows) {
          const show = r.show ? !!r.show(ctx) : true;
          let row = panel.querySelector('[data-cordi-vs-row="' + r.id + '"]');
          if (!show) { if (row) row.remove(); continue; }
          if (!row) {
            row = makeRow(ctx.grp, r);
            if (r.where === 'afterGroup') { ctx.grp.parentElement.insertBefore(row, ctx.grp.nextSibling); }
            else { const sec = section(panel, ctx); if (!sec) continue; place(sec, row); }
          }
          upd(row, r, ctx);
        }
      }
    }
    let qt = 0;
    const soon = () => { if (!qt) qt = setTimeout(() => { qt = 0; try { scan(); } catch (e) { /* noop */ } }, 90); };
    const start = () => {
      new MutationObserver((ms) => {
        for (const m of ms) { if (m.target.closest && m.target.closest('#cordi-vs-sub')) continue; if (m.target.closest && m.target.closest('.notion-overlay-container')) { soon(); return; } for (const n of m.addedNodes) if (n.nodeType === 1 && (n.classList.contains('notion-overlay-container') || n.querySelector && n.querySelector('.notion-overlay-container'))) { soon(); return; } }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
    /* 小メニュー（Notion のビューの設定と同じ場所・同じ形。← で戻る・外を押すと閉じる） */
    let sub = null;
    function closeSub(all) { if (sub) { sub.remove(); sub = null; } void all; }
    function vsSub(ctx, title, build) {
      closeSub();
      css();
      const r = ctx.panel.getBoundingClientRect();
      sub = document.createElement('div');
      sub.id = 'cordi-vs-sub';
      sub.setAttribute('data-no-passthrough', '1');
      sub.style.left = r.left + 'px'; sub.style.top = r.top + 'px'; sub.style.width = r.width + 'px'; sub.style.height = r.height + 'px';
      sub.innerHTML = '<div class="cvs-hd"><div class="cvs-back" title="戻る"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M9.278 3.238a.625.625 0 0 1 .884.884L6.284 8l3.878 3.878a.625.625 0 0 1-.884.884l-4.32-4.32a.625.625 0 0 1 0-.884z"/></svg></div><div class="cvs-ttl"></div></div><div class="cvs-bd"></div>';
      sub.querySelector('.cvs-ttl').textContent = title;
      const bd = sub.querySelector('.cvs-bd');
      const api = {
        sec(t) { const d = document.createElement('div'); d.className = 'cvs-sec'; d.textContent = t; bd.appendChild(d); return d; },
        note(t) { const d = document.createElement('div'); d.className = 'cvs-note'; d.textContent = t; bd.appendChild(d); return d; },
        div() { const d = document.createElement('div'); d.className = 'cvs-div'; bd.appendChild(d); },
        item(label, o) {
          o = o || {};
          const d = document.createElement('div'); d.className = 'cvs-it';
          d.innerHTML = '<span class="cvs-mk"></span><span class="cvs-lb"></span>';
          d.querySelector('.cvs-mk').innerHTML = o.mark || '';
          d.querySelector('.cvs-lb').textContent = label;
          if (o.on) d.insertAdjacentHTML('beforeend', '<svg class="cvs-ck" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.98 3.92a.625.625 0 0 1 .1.88l-6 7.5a.625.625 0 0 1-.93.05l-3-3a.625.625 0 0 1 .88-.88l2.51 2.5 5.56-6.95a.625.625 0 0 1 .88-.1"/></svg>');
          if (o.select) {
            const s = document.createElement('select');
            for (const [v, l] of o.select.options) { const op = document.createElement('option'); op.value = v; op.textContent = l; if (v === o.select.value) op.selected = true; s.appendChild(op); }
            s.addEventListener('change', () => o.select.onChange(s.value));
            s.addEventListener('click', (e) => e.stopPropagation());
            d.appendChild(s);
          }
          if (o.click) d.addEventListener('click', () => o.click());
          bd.appendChild(d); return d;
        },
        clear() { bd.textContent = ''; },
        close: closeSub,
        body: bd
      };
      sub.querySelector('.cvs-back').addEventListener('click', () => closeSub());
      for (const ev of ['pointerdown', 'mousedown', 'click', 'keydown']) sub.addEventListener(ev, (e) => e.stopPropagation());
      document.body.appendChild(sub);
      build(api);
      const off = (e) => { if (!sub) { document.removeEventListener('pointerdown', off, true); return; } if (!sub.contains(e.target)) { closeSub(); document.removeEventListener('pointerdown', off, true); } };
      setTimeout(() => document.addEventListener('pointerdown', off, true), 0);
      const kd = (e) => { if (e.key === 'Escape' && sub) { e.stopPropagation(); closeSub(); document.removeEventListener('keydown', kd, true); } };
      document.addEventListener('keydown', kd, true);
      const follow = () => { if (!sub) return; if (!ctx.panel.isConnected) { closeSub(); return; } const q = ctx.panel.getBoundingClientRect(); sub.style.left = q.left + 'px'; sub.style.top = q.top + 'px'; sub.style.height = q.height + 'px'; requestAnimationFrame(follow); };
      requestAnimationFrame(follow);
      return api;
    }
    return { scan, sub: vsSub, view: viewNow, close: closeSub };
  }

  /* v13: Notion の「ビューの設定」の Cordivestium の段 — 表・ボード・ギャラリーの見た目をその場で */
  const VSI = (d) => '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
  const IS_TABLE = (c) => /^(Table|表|テーブル)$/i.test(c.layout || '');
  const IS_BOARD = (c) => /^(Board|ボード)$/i.test(c.layout || '');
  const IS_GAL = (c) => /^(Gallery|ギャラリー)$/i.test(c.layout || '');
  const lmPick = (ctx, title, key, opts, after) => LM_VS.sub(ctx, title, (api) => {
    const draw = () => { api.clear(); for (const [v, l] of opts) api.item(l, { on: String(S.tune[key]) === String(v), click: () => { S.tune[key] = typeof S.tune[key] === 'number' ? +v : v; if (after) after(); save(); apply(); draw(); } }); };
    draw();
  });
  const TSTY = [['editorial', '誌面（細い横線）'], ['ledger', '罫線帳（見出しに太線）'], ['cards', '行を浮かせる']];
  const CLINES = [['none', 'なし'], ['hair', '淡く'], ['soft', 'ふつう'], ['strong', 'はっきり']];
  const LM_VS = cordiVS([
    { id: 'lm.tableStyle', where: 'section', order: 20, label: '表の見た目', icon: VSI('M3.5 4.5h13v11h-13zM3.5 8h13M8.5 4.5v11'), show: IS_TABLE,
      value: () => (on('tables') ? (TSTY.find((x) => x[0] === T('tableStyle')) || ['', ''])[1].replace(/（.*/, '') : 'Notion のまま'),
      onClick: (ctx) => lmPick(ctx, '表の見た目', 'tableStyle', TSTY, () => { S.mods.tables = true; }) },
    { id: 'lm.colLines', where: 'section', order: 21, label: '縦の罫線', icon: VSI('M6 4v12M10 4v12M14 4v12'), show: IS_TABLE,
      value: () => (CLINES.find((x) => x[0] === (T('colLines') || 'soft')) || ['', ''])[1],
      onClick: (ctx) => lmPick(ctx, '縦の罫線（列の境目）', 'colLines', CLINES, () => { S.mods.tables = true; }) },
    { id: 'lm.lastCol', where: 'section', order: 22, label: '最後の列の右の線', icon: VSI('M3.5 4.5h10M3.5 15.5h10M3.5 10h10M15.5 3.5v13'), show: IS_TABLE,
      toggle: () => T('lastColLine') !== false, onClick: () => { S.tune.lastColLine = T('lastColLine') === false; save(); apply(); } },
    { id: 'lm.zebra', where: 'section', order: 23, label: '縞にする（1 行おき）', icon: VSI('M3.5 5h13M3.5 10h13M3.5 15h13'), show: IS_TABLE,
      toggle: () => !!T('zebra'), onClick: () => { S.tune.zebra = !T('zebra'); S.mods.tables = true; save(); apply(); } },
    { id: 'lm.boardWrap', where: 'section', order: 30, label: 'ボードを折り返す', icon: VSI('M3.5 4h4v5h-4zM8.5 4h4v5h-4zM13.5 4h3v5h-3zM3.5 11h4v5h-4zM8.5 11h4v5h-4z'), show: IS_BOARD,
      toggle: () => on('boardWrap'), onClick: () => { S.mods.boardWrap = !on('boardWrap'); save(); apply(); } },
    { id: 'lm.boardCols', where: 'section', order: 31, label: '1 段の列の数', icon: VSI('M4 5h3v10H4zM8.5 5h3v10h-3zM13 5h3v10h-3z'), show: (c) => IS_BOARD(c) && on('boardWrap'),
      value: () => (+T('boardCols') ? T('boardCols') + ' 列' : '画面に合わせる'),
      onClick: (ctx) => lmPick(ctx, '1 段の列の数', 'boardCols', [[0, '画面の幅に合わせる'], [2, '2 列'], [3, '3 列'], [4, '4 列'], [5, '5 列'], [6, '6 列'], [8, '8 列']]) },
    { id: 'lm.galleryStyle', where: 'section', order: 40, label: 'ギャラリーの形', icon: VSI('M3.5 4h5.5v5.5H3.5zM11 4h5.5v5.5H11zM3.5 11.5h5.5V17H3.5zM11 11.5h5.5V17H11z'), show: IS_GAL,
      value: () => (on('gallery') ? (GSTYLES.find((x) => x[0] === T('galleryStyle')) || ['', ''])[1] : 'Notion のまま'),
      onClick: (ctx) => lmPick(ctx, 'ギャラリーの形', 'galleryStyle', GSTYLES, () => { S.mods.gallery = true; }) },
    { id: 'lm.galleryTitle', where: 'section', order: 41, label: '題名を表紙の上に', icon: VSI('M3.5 4h13v12h-13zM5.5 12.5h7'), show: IS_GAL,
      toggle: () => T('galleryTitle') === 'overlay', onClick: () => { S.tune.galleryTitle = T('galleryTitle') === 'overlay' ? 'below' : 'overlay'; S.mods.gallery = true; save(); apply(); } }
  ]);

  /* ============================================================
   *  13. 動かす
   * ============================================================ */
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && !e.metaKey && e.code === 'KeyV') { e.preventDefault(); e.stopPropagation(); panelOpen(); }
    else if (e.ctrlKey && e.altKey && !e.metaKey && e.code === 'KeyB') { e.preventDefault(); e.stopPropagation(); focusToggle(); }
    else if (e.key === 'Escape' && panel) panelClose();
  }, true);
  /* 明暗の切り替え（body の class）・ページの移動を見張る */
  let lastKey = '';
  function tick() {
    const k = (notionDark() ? 'd' : 'l') + '|' + pageId() + '|' + peekId();
    if (k !== lastKey) { lastKey = k; apply(); setTimeout(coverAccent, 900); announce(); }
    progressSetup();
  }
  apply();   // document-start: 最初の描画から色を当てる（白く光ってから変わるのを防ぐ）
  try { document.documentElement.setAttribute('data-cordi-lm', VERSION); } catch (e) { /* noop */ }   // ²⁶ の ⋯ メニューが「入っている柱」を知る印
  curtainBoot();   // v11: 出来上がるまで幕
  const boot = () => {
    document.documentElement.setAttribute('data-cordi-lm', VERSION);
    apply(); fab(); cordiCss(); tipsInstall(); lmDock(); announce();
    /* 上の帯は Notion がよく作り直す → すぐ置き直す */
    new MutationObserver(() => { if (!document.getElementById('cordi-b-lm') || !document.getElementById('cordi-b-lm').isConnected) lmDock(); }).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(() => tick()).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(() => { const st = document.getElementById('lm-css'); if (st && document.head && document.head.lastElementChild !== st) document.head.appendChild(st); }).observe(document.head, { childList: true });
    setInterval(tick, 700);
    setTimeout(coverAccent, 1500);
  };
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot, { once: true });

  window.__c37 = {
    version: VERSION,
    status: () => Object.assign({ theme: curTheme().id, mode: S.mode, mods: Object.assign({}, S.mods), tune: Object.assign({}, S.tune) }, ST),
    theme: (id) => { if (!THEME_BY_ID[id]) return Object.keys(THEME_BY_ID); setTheme(id); return id; },
    themes: () => THEMES.map((t) => t.id + ' — ' + t.name),
    set(o) { o = o || {}; if (o.mods) Object.assign(S.mods, o.mods); if (o.tune) Object.assign(S.tune, o.tune); if (o.mode) S.mode = o.mode; if (o.theme && THEME_BY_ID[o.theme]) S.theme = o.theme; save(); apply(); return __c37.status(); },
    open: panelOpen,
    css: () => lastCss,
    reset() { S = JSON.parse(JSON.stringify(DEF)); save(); apply(); }
  };
})();
