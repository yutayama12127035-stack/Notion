// ==UserScript==
// @name         « No »　³⁸ _ Scholar
// @namespace    https://cordivestium.local/scholar
// @version      21.0.0
// @description  v21.0.0: Notion の「数式を編集」に Cordivestium の関数（標準報酬月額・年齢・和暦…）とマクロを統合（Notion の数式として書き込む）。Notion を「学び」と「計算」に強くする柱（²⁶ Atelier ＝文字、³⁷ Lumière ＝見た目 と並ぶ三本柱の一つ）。【計算】Excel と同じ書き方の数式（SUM・AVERAGEIFS・VLOOKUP・XLOOKUP・INDEX/MATCH・TEXT・DATEDIF・FILTER・SORT・UNIQUE など 180 余りの関数、A1 参照・範囲・列の名前での参照）で、表のビューを丸ごと写した「シート」（⌃⌥E）を開き、計算の列・集計・条件付き書式（色の段階・データバー・印）をつけ、結果を Notion のプロパティへ書き戻せる。マクロ（手順を組んで、どの行がどう変わるかを確かめてから一括で書き込み・元に戻せる。JavaScript でも書ける）。【学び】赤シート（赤い文字を隠す・⌃⌥K）、穴埋め（色を付けた語を隠す）、DB を単語帳にして間隔反復（忘れかけた頃にもう一度）、ポモドーロと学習記録（日ごとの時間・草のような記録）、続きから読む、選んだ式をその場で計算（⌃⌥=）。上の帯の Σ で学び・計算・記録の小窓（⌃⌥Q）。v11: 社労士（試験までの日数・基準点チェッカー・○×演習・選択式ドリル・法律上の年齢や期間の計算）・語学（読み上げ・書き取り）・用語に乗せて意味・読書／推し／ニュースの記録。
// @match        https://www.notion.so/*
// @match        https://*.notion.so/*
// @match        https://www.notion.com/*
// @match        https://*.notion.com/*
// @match        https://*.notion.site/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @noframes
// ==/UserScript==

/*
 * v11.0.0（2026-10-03）
 *   ・上の帯（Share の左）に Σ（期限の来たカードの数つき）。小窓: 試験まで何日（既定は社労士試験＝8 月の第 4 日曜日）・今日の学習・続けた日数・
 *     今日の復習／覚える（単語帳・○×・選択式ドリル・赤シート・穴埋め・用語）／試験（基準点チェッカー）／語学（読み上げ・書き取り）／
 *     記録（読書・推し・ニュース・学習の草）／計算（シート・選んだ式・ポモドーロ）。DB の道具の段（フィルタの左）にも Σ。
 *   ・社労士: ○×演習（肢別。過去問の DB の 問い・正解・解説・科目・年度 を選ぶ。苦手だけ・まだ解いていない・科目でしぼる。間違いは単語帳へ）、
 *     選択式ドリル（このページの赤字・太字・数字＋単位を空欄に、20 の選択肢から。数字は 2 倍・半分などの紛らわしい選択肢も作る）、
 *     基準点チェッカー（選択式 8 科目・択一式 7 科目。総得点と科目ごとの基準点。基準は変えられる）、
 *     式: HYOJUN（標準報酬月額・等級。健保 50 等級／厚年 32 等級）・NENREI（法律上の年齢）・TASSHIBI（○歳に達した日）・
 *     KIKAN（民法の期間の末日。初日不算入・応当日の前日・月末）・SOUSHITSU（資格喪失日）・SHIKEN（試験までの日数）。
 *   ・語学: 読み上げ（選んだ文字／今の段落。言語は自動）・書き取り（聞いて打つ → 抜けた字・余分な字を色で）。
 *   ・用語に乗せて意味: DB のビューを用語集に。本文は書き換えず（CSS の Highlight で点線の印だけ）、乗せると意味。社労士の用語（約 150 語）も科目つきで。
 *   ・記録: 読書（今年の冊数と目標・見込み・月ごと・評価・著者・最近）／推し（今月・今年の出費・月ごと・推しごと・種類・もうすぐの記念日）／
 *     ニュース（今週・今月・月ごと・媒体・テーマ・社労士に関わる記事・新しい順）。日付の列が無ければ作った日で数える。
 *   ・キーの重なりを直した: 赤シート ⌃⌥R → ⌃⌥K（⌃⌥R は ²⁶ の縦書き）、パネル ⌃⌥S → 上の帯の Σ・⌃⌥Q（⌃⌥S は ²⁶ の設定）。読み上げ ⌃⌥T。
 *   ・UI の書体（--cordi-ui）を三本柱でそろえた。
 * ============================================================
 *  ³⁸ Scholar v1.0.0（2026-10-03）
 * ============================================================
 *  計算（Excel のように）
 *    ⌃⌥E  … いま見ている表のビューを「シート」で開く（全行。画面に描かれていない行も API で読む）
 *            ・列 A, B, C … ＝ ビューのプロパティ（並びもビューと同じ）。行 1, 2, 3 … ＝ ビューの行
 *            ・計算の列（例 =[@Seq.]*10+[@No.]）を足せる。[@列名] はその行の値、[列名] は列全体
 *            ・下の「メモ」の段は自由なセル（=SUM(C:C) ／ =AVERAGEIFS([No.],[Series],"ガリレオ") …）
 *            ・条件付き書式: 色の段階・データバー・印（▲▼●）・条件に合うセルに色。Notion の表のセルにも同じ色がつく
 *            ・セルを書き換える／計算の列の結果をプロパティへ書き戻す（書く前に一覧で確かめる・元に戻せる）
 *            ・TSV（Excel・スプレッドシートに貼れる）／CSV で書き出し、貼り付けで一括入力
 *    マクロ … 手順（値を入れる・連番・置き換え・日付をずらす・別の列へ写す・タグを足す/外す …）を組んで保存。
 *            条件（=AND([@Status]="済",[@No.]>3)）で行を選べる。実行前に「どの行がどう変わるか」を表で確かめ、
 *            実行後は元に戻せる（直近 30 回）。JavaScript のマクロも書ける（rows・set・get）。
 *    ⌃⌥=  … 本文で選んだ式（1+2*3、=SUM(1,2,3) など）を計算して、後ろに「= 7」を足す
 *  学び
 *    ⌃⌥R  … 赤シート: 赤・橙の文字を隠す（乗せると見える／クリックで開いたまま）
 *    ⌃⌥H  … 穴埋め: 選んだ色の背景で塗った語を空欄にする。トグルは閉じたまま「問い」に
 *    単語帳 … DB のビューを単語帳にして間隔反復（SM-2）。表と裏の列を選ぶだけ。覚え具合はこの端末に保存
 *            （Notion のプロパティに「次の日」「間隔」を書き戻すこともできる）
 *    ポモドーロ … 25 分＋5 分（変えられる）。どのページで何分学んだかを記録し、日ごとの草（ヒートマップ）に
 *    続きから … 長いページをどこまで読んだかを覚え、次に開いた時に「続きから」
 *  コンソール: __c38.status() ／ __c38.eval('=SUM(1,2,3)') ／ __c38.sheet() ／ __c38.study.redsheet(true)
 * ============================================================
 */

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const VERSION = '21.0.0';
  const TAG = '[³⁸ Scholar v' + VERSION + ']';
  if (window.__c38 && window.__c38.version) { console.warn(TAG, '旧版が動いています'); return; }

  /* ============================================================
   *  1. 数式エンジン（Excel と同じ書き方）
   *     値: 数（日付は Excel と同じ通し番号 1900 方式）・文字・真偽・エラー・配列（範囲）
   * ============================================================ */
  const ENGINE = (() => {
    class FErr { constructor(code, msg) { this.code = code; this.msg = msg || ''; } toString() { return this.code; } }
    const E = {
      DIV0: () => new FErr('#DIV/0!', '0 で割りました'), VALUE: (m) => new FErr('#VALUE!', m || '値の種類が合いません'),
      NAME: (m) => new FErr('#NAME?', m || '知らない名前です'), REF: (m) => new FErr('#REF!', m || '参照先がありません'),
      NA: (m) => new FErr('#N/A', m || '見つかりません'), NUM: (m) => new FErr('#NUM!', m || '数として扱えません'),
      NULL: () => new FErr('#NULL!'), SPILL: () => new FErr('#SPILL!'), CALC: (m) => new FErr('#CALC!', m || '')
    };
    const isErr = (v) => v instanceof FErr;
    /* ---------- 日付（Excel の通し番号） ---------- */
    const EPOCH = Date.UTC(1899, 11, 30);
    const DAYMS = 86400000;
    const toSerial = (d) => (d.getTime() - d.getTimezoneOffset() * 60000 - EPOCH) / DAYMS;
    const fromSerial = (n) => { const t = EPOCH + n * DAYMS; const d = new Date(t); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()); };
    const ymdSerial = (y, m, d) => (Date.UTC(y, m - 1, d) - EPOCH) / DAYMS;
    const serialParts = (n) => { const d = new Date(EPOCH + Math.floor(n) * DAYMS); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay() }; };
    /* 文字 → 日付（2026-10-03・2026/10/3・2026.10.03・2026年10月3日・10/3・時刻つき） */
    function parseDate(s) {
      s = String(s).trim();
      let m = /^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
      if (m) return ymdSerial(+m[1], +m[2], +m[3]) + ((+m[4] || 0) * 3600 + (+m[5] || 0) * 60 + (+m[6] || 0)) / 86400;
      m = /^(\d{4})[-/.年](\d{1,2})月?$/.exec(s);
      if (m) return ymdSerial(+m[1], +m[2], 1);
      m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s);
      if (m) return ((+m[1]) * 3600 + (+m[2]) * 60 + (+m[3] || 0)) / 86400;
      return null;
    }
    /* ---------- 型の変換 ---------- */
    const ZEN = (s) => String(s).replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/　/g, ' ');
    function num(v) {
      if (isErr(v)) return v;
      if (typeof v === 'number') return v;
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (v == null || v === '') return 0;
      if (Array.isArray(v)) return num(first(v));
      const s = ZEN(String(v)).trim().replace(/,/g, '');
      if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?%?$/i.test(s)) return s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s);
      const d = parseDate(s);
      if (d != null) return d;
      return E.VALUE('「' + String(v).slice(0, 20) + '」は数ではありません');
    }
    function str(v) {
      if (isErr(v)) return v;
      if (v == null) return '';
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (typeof v === 'number') return fmtNum(v);
      if (Array.isArray(v)) return str(first(v));
      return String(v);
    }
    function bool(v) {
      if (isErr(v)) return v;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v !== 0;
      if (v == null || v === '') return false;
      if (Array.isArray(v)) return bool(first(v));
      const s = String(v).toUpperCase();
      if (s === 'TRUE' || s === 'YES' || s === '✓' || s === 'はい') return true;
      if (s === 'FALSE' || s === 'NO' || s === 'いいえ' || s === '') return false;
      return E.VALUE();
    }
    const fmtNum = (n) => { if (!isFinite(n)) return n > 0 ? '∞' : n < 0 ? '-∞' : '#NUM!'; const r = Math.round(n * 1e10) / 1e10; return String(r); };
    function first(a) { while (Array.isArray(a)) a = a.length ? (Array.isArray(a[0]) ? a[0][0] : a[0]) : null; return a; }
    /* 引数を平らに（範囲・配列はほどく。空のセルは除く） */
    function flat(args, keepText) {
      const out = [];
      const walk = (v, fromRange) => {
        if (Array.isArray(v)) { for (const x of v) walk(x, true); return; }
        if (fromRange && (v == null || v === '')) return;
        if (fromRange && !keepText && (typeof v === 'string' || typeof v === 'boolean')) return;
        out.push(v);
      };
      for (const a of args) walk(a, false);
      return out;
    }
    const nums = (args) => { const out = []; for (const v of flat(args)) { if (isErr(v)) return v; const n = num(v); if (isErr(n)) return n; out.push(n); } return out; };
    const grid = (v) => (Array.isArray(v) ? (Array.isArray(v[0]) ? v : v.map((x) => [x])) : [[v]]);
    const cells = (v) => grid(v).flat();
    /* ---------- 条件（COUNTIF などの ">=3"・"*ガリ*"） ---------- */
    function crit(c) {
      if (typeof c === 'number' || typeof c === 'boolean') return (v) => (typeof c === 'number' ? (typeof v === 'number' || (typeof v === 'string' && v !== '' && !isNaN(+v))) && num(v) === c : v === c);
      const s = String(c == null ? '' : c);
      const m = /^(<=|>=|<>|=|<|>)?(.*)$/s.exec(s);
      const op = m[1] || '=', rhs = m[2];
      const rn = rhs !== '' && !isNaN(+ZEN(rhs)) ? +ZEN(rhs) : null;
      const rd = rn == null ? parseDate(rhs) : null;
      const wild = /[*?]/.test(rhs) && (op === '=' || op === '<>');
      const re = wild ? new RegExp('^' + rhs.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/~\*/g, '\u0001').replace(/~\?/g, '\u0002').replace(/\*/g, '.*').replace(/\?/g, '.').replace(/\u0001/g, '\\*').replace(/\u0002/g, '\\?') + '$', 'i') : null;
      return (v) => {
        if (isErr(v)) return false;
        if (rn != null || rd != null) {
          const target = rn != null ? rn : rd;
          if (v === '' || v == null) return op === '<>';
          const x = num(v); if (isErr(x)) return op === '<>';
          return op === '=' ? x === target : op === '<>' ? x !== target : op === '<' ? x < target : op === '>' ? x > target : op === '<=' ? x <= target : x >= target;
        }
        const a = str(v).toLowerCase(), b = rhs.toLowerCase();
        if (re) return op === '=' ? re.test(str(v)) : !re.test(str(v));
        if (op === '=') return rhs === '' ? (v == null || v === '') : a === b;
        if (op === '<>') return rhs === '' ? !(v == null || v === '') : a !== b;
        return op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b;
      };
    }
    /* ---------- 書式（TEXT） ---------- */
    const WD_J = ['日', '月', '火', '水', '木', '金', '土'], WD_E = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], WD_EL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MO_E = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], MO_EL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    function textFmt(v, f) {
      f = String(f);
      if (/[yYdDhHsS]|m{3,}|aaa|ddd/.test(f) || (/m/.test(f) && /[yd]/i.test(f))) {
        const n = num(v); if (isErr(n)) return n;
        const p = serialParts(n);
        const frac = n - Math.floor(n), secs = Math.round(frac * 86400), H = Math.floor(secs / 3600), Mi = Math.floor(secs / 60) % 60, Se = secs % 60;
        const hasTime = /h/i.test(f);
        return f.replace(/yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d|aaaa|aaa|hh|h|ss|s|ggge|e/gi, (t) => {
          const k = t.toLowerCase();
          switch (k) {
            case 'yyyy': return String(p.y); case 'yy': return String(p.y).slice(-2);
            case 'e': return String(p.y - 2018); case 'ggge': return '令和' + (p.y - 2018);
            case 'mmmm': return MO_EL[p.m - 1]; case 'mmm': return MO_E[p.m - 1];
            case 'mm': return hasTime && /h.*mm|mm.*s/i.test(f) && t === t ? (/:/.test(f) ? String(Mi).padStart(2, '0') : String(p.m).padStart(2, '0')) : String(p.m).padStart(2, '0');
            case 'm': return String(p.m);
            case 'dddd': return WD_EL[p.wd]; case 'ddd': return WD_E[p.wd];
            case 'dd': return String(p.d).padStart(2, '0'); case 'd': return String(p.d);
            case 'aaaa': return WD_J[p.wd] + '曜日'; case 'aaa': return WD_J[p.wd];
            case 'hh': return String(H).padStart(2, '0'); case 'h': return String(H);
            case 'ss': return String(Se).padStart(2, '0'); case 's': return String(Se);
            default: return t;
          }
        });
      }
      const n = num(v); if (isErr(n)) return str(v);
      const pct = /%$/.test(f);
      const x = pct ? n * 100 : n;
      const m = /([#0,]*)(?:\.([0#]+))?/.exec(f.replace(/[^#0,.]/g, '')) || [];
      const dec = (m[2] || '').length;
      const comma = /,/.test(m[1] || '');
      let s = Math.abs(x).toFixed(dec);
      if (comma) { const [i, d] = s.split('.'); s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : ''); }
      const minInt = ((m[1] || '').match(/0/g) || []).length;
      if (minInt > 1) { const [i, d] = s.split('.'); s = i.padStart(minInt, '0') + (d ? '.' + d : ''); }
      const pre = f.replace(/[#0,.%].*$/, ''), post = f.replace(/^.*[#0,.]/, '').replace(/^%/, '');
      return (x < 0 ? '-' : '') + pre.replace(/"/g, '') + s + (pct ? '%' : '') + post.replace(/"/g, '');
    }

    /* ---------- 字句 ---------- */
    function lex(src) {
      const T = [];
      let i = 0;
      const s = src;
      while (i < s.length) {
        const c = s[i];
        if (/\s/.test(c)) { i++; continue; }
        if (c === '"') { let j = i + 1, v = ''; while (j < s.length) { if (s[j] === '"') { if (s[j + 1] === '"') { v += '"'; j += 2; continue; } break; } v += s[j++]; } T.push({ t: 'str', v }); i = j + 1; continue; }
        if (c === '「') { let j = i + 1, v = ''; while (j < s.length && s[j] !== '」') v += s[j++]; T.push({ t: 'str', v }); i = j + 1; continue; }
        if (c === '[') {   // [列名] [@列名] [#行]
          let j = i + 1, v = '', depth = 1;
          while (j < s.length && depth) { if (s[j] === '[') depth++; else if (s[j] === ']') { depth--; if (!depth) break; } v += s[j++]; }
          T.push({ t: 'col', v: v.trim() }); i = j + 1; continue;
        }
        if (c === "'") { let j = i + 1, v = ''; while (j < s.length && s[j] !== "'") v += s[j++]; i = j + 1; if (s[i] === '!') { i++; T.push({ t: 'sheet', v }); } else T.push({ t: 'name', v }); continue; }
        let m = /^(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?)%?/i.exec(s.slice(i));
        if (m && !/^[A-Za-z]/.test(s.slice(i + m[0].length)) || (m && /^\d+\.?\d*e/i.test(m[0]))) { const raw = m[0]; T.push({ t: 'num', v: raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw) }); i += raw.length; continue; }
        m = /^\$?([A-Za-z]{1,3})\$?(\d+)(?::\$?([A-Za-z]{1,3})\$?(\d+))?(?![A-Za-z0-9_(])/.exec(s.slice(i));
        if (m) { T.push({ t: 'ref', c1: colNum(m[1]), r1: +m[2], c2: m[3] ? colNum(m[3]) : null, r2: m[4] ? +m[4] : null }); i += m[0].length; continue; }
        m = /^\$?([A-Za-z]{1,3}):\$?([A-Za-z]{1,3})(?![A-Za-z0-9_(])/.exec(s.slice(i));
        if (m) { T.push({ t: 'ref', c1: colNum(m[1]), r1: 1, c2: colNum(m[2]), r2: Infinity }); i += m[0].length; continue; }
        m = /^[A-Za-z_\u3040-\u30ff\u3400-\u9fff][A-Za-z0-9_.\u3040-\u30ff\u3400-\u9fff]*/.exec(s.slice(i));
        if (m) { if (s[i + m[0].length] === '!') { T.push({ t: 'sheet', v: m[0] }); i += m[0].length + 1; continue; } T.push({ t: 'name', v: m[0] }); i += m[0].length; continue; }
        m = /^(<>|<=|>=|[-+*/^&=<>(),:;%{}])/.exec(s.slice(i));
        if (m) { T.push({ t: 'op', v: m[0] === ';' ? ',' : m[0] }); i += m[0].length; continue; }
        if (/[＋－＊／＝＜＞（），]/.test(c)) { T.push({ t: 'op', v: ZEN(c) }); i++; continue; }
        throw new Error('読めない文字「' + c + '」（' + (i + 1) + ' 文字目）');
      }
      return T;
    }
    function colNum(s) { let n = 0; for (const ch of s.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n; }
    function colName(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
    /* ---------- 構文（優先順位つき） ---------- */
    const PREC = { '=': 1, '<>': 1, '<': 1, '>': 1, '<=': 1, '>=': 1, '&': 2, '+': 3, '-': 3, '*': 4, '/': 4, '^': 5 };
    function parse(src) {
      const T = lex(src.replace(/^\s*=/, ''));
      let p = 0;
      const peek = () => T[p], next = () => T[p++];
      const expect = (v) => { const t = next(); if (!t || t.v !== v) throw new Error('「' + v + '」が足りません'); };
      function primary() {
        const t = next();
        if (!t) throw new Error('式が途中で終わっています');
        if (t.t === 'num') return { k: 'num', v: t.v };
        if (t.t === 'str') return { k: 'str', v: t.v };
        if (t.t === 'col') return { k: 'col', v: t.v };
        if (t.t === 'ref') return { k: 'ref', ...t };
        if (t.t === 'sheet') { const r = next(); if (!r || r.t !== 'ref') throw new Error('シート名の後にセルの場所を'); return { k: 'ref', sheet: t.v, ...r }; }
        if (t.t === 'op' && t.v === '(') { const e = expr(0); expect(')'); return e; }
        if (t.t === 'op' && t.v === '{') {   // 配列 {1,2;3,4}
          const rows = [[]];
          while (peek() && peek().v !== '}') { const e = expr(0); rows[rows.length - 1].push(e); if (peek() && peek().v === ',') next(); }
          expect('}');
          return { k: 'arr', rows };
        }
        if (t.t === 'op' && (t.v === '-' || t.v === '+')) { const e = unary(); return t.v === '-' ? { k: 'neg', e } : e; }
        if (t.t === 'name') {
          const up = t.v.toUpperCase();
          if (peek() && peek().v === '(') {
            next();
            const args = [];
            if (peek() && peek().v !== ')') { do { if (peek() && (peek().v === ',' || peek().v === ')')) args.push({ k: 'empty' }); else args.push(expr(0)); } while (peek() && peek().v === ',' && next()); }
            expect(')');
            return { k: 'call', f: up, args };
          }
          if (up === 'TRUE' || up === 'FALSE') return { k: 'bool', v: up === 'TRUE' };
          return { k: 'name', v: t.v };
        }
        throw new Error('ここに「' + (t.v != null ? t.v : t.t) + '」は置けません');
      }
      function unary() { const t = peek(); if (t && t.t === 'op' && (t.v === '-' || t.v === '+')) { next(); const e = unary(); return t.v === '-' ? { k: 'neg', e } : e; } return postfix(primary()); }
      function postfix(e) { while (peek() && peek().v === '%') { next(); e = { k: 'pct', e }; } return e; }
      function expr(minP) {
        let left = unary();
        for (;;) {
          const t = peek();
          if (!t || t.t !== 'op' || !(t.v in PREC) || PREC[t.v] < minP) break;
          next();
          const right = expr(t.v === '^' ? PREC[t.v] : PREC[t.v] + 1);
          left = { k: 'bin', op: t.v, a: left, b: right };
        }
        return left;
      }
      const ast = expr(0);
      if (p < T.length) throw new Error('「' + (T[p].v != null ? T[p].v : T[p].t) + '」から先が読めません');
      return ast;
    }

    /* ---------- 評価 ---------- */
    const lift2 = (a, b, f) => {
      if (Array.isArray(a) || Array.isArray(b)) {
        const A = grid(a), Bg = grid(b);
        const R = Math.max(A.length, Bg.length), C = Math.max(A[0].length, Bg[0].length);
        const out = [];
        for (let i = 0; i < R; i++) { const row = []; for (let j = 0; j < C; j++) { const x = (A[i] || A[0])[j] !== undefined ? (A[i] || A[0])[j] : (A[i] || A[0])[0]; const y = (Bg[i] || Bg[0])[j] !== undefined ? (Bg[i] || Bg[0])[j] : (Bg[i] || Bg[0])[0]; row.push(f(x, y)); } out.push(row); }
        return out;
      }
      return f(a, b);
    };
    function binop(op, a, b) {
      return lift2(a, b, (x, y) => {
        if (isErr(x)) return x; if (isErr(y)) return y;
        if (op === '&') return str(x) + str(y);
        if (op === '=' || op === '<>' || op === '<' || op === '>' || op === '<=' || op === '>=') {
          let r;
          const bothNum = (typeof x === 'number' || x === '' || x == null) && (typeof y === 'number' || y === '' || y == null);
          if (bothNum) { const p = x == null || x === '' ? 0 : x, q = y == null || y === '' ? 0 : y; r = p < q ? -1 : p > q ? 1 : 0; }
          else if (typeof x === 'boolean' || typeof y === 'boolean') { const p = typeof x === 'boolean' ? +x + 10 : typeof x === 'string' ? 5 : 0, q = typeof y === 'boolean' ? +y + 10 : typeof y === 'string' ? 5 : 0; r = p < q ? -1 : p > q ? 1 : 0; }
          else if (typeof x === 'number' && typeof y === 'string') r = -1;
          else if (typeof x === 'string' && typeof y === 'number') r = 1;
          else { const p = str(x).toLowerCase(), q = str(y).toLowerCase(); r = p < q ? -1 : p > q ? 1 : 0; }
          return op === '=' ? r === 0 : op === '<>' ? r !== 0 : op === '<' ? r < 0 : op === '>' ? r > 0 : op === '<=' ? r <= 0 : r >= 0;
        }
        const p = num(x), q = num(y);
        if (isErr(p)) return p; if (isErr(q)) return q;
        switch (op) {
          case '+': return p + q; case '-': return p - q; case '*': return p * q;
          case '/': return q === 0 ? E.DIV0() : p / q;
          case '^': { const r = Math.pow(p, q); return isFinite(r) ? r : E.NUM(); }
          default: return E.VALUE();
        }
      });
    }
    function evaluate(ast, ctx) {
      switch (ast.k) {
        case 'num': case 'str': case 'bool': return ast.v;
        case 'empty': return null;
        case 'neg': { const v = evaluate(ast.e, ctx); return Array.isArray(v) ? grid(v).map((r) => r.map((x) => { const n = num(x); return isErr(n) ? n : -n; })) : (isErr(num(v)) ? num(v) : -num(v)); }
        case 'pct': { const v = num(evaluate(ast.e, ctx)); return isErr(v) ? v : v / 100; }
        case 'bin': return binop(ast.op, evaluate(ast.a, ctx), evaluate(ast.b, ctx));
        case 'arr': return ast.rows.map((r) => r.map((e) => evaluate(e, ctx)));
        case 'ref': return ctx.ref ? ctx.ref(ast) : E.REF();
        case 'col': return ctx.col ? ctx.col(ast.v) : E.REF('列の名前は表の中だけで使えます');
        case 'name': {
          if (ctx.names && ast.v in ctx.names) return ctx.names[ast.v];
          if (ctx.col) { const v = ctx.col(ast.v, true); if (v !== undefined) return v; }
          return E.NAME('「' + ast.v + '」という名前はありません');
        }
        case 'call': {
          if (ast.f === 'LET') {   // LET(名前, 値, …, 式)
            const names = Object.assign({}, ctx.names || {});
            const c2 = Object.assign({}, ctx, { names });
            for (let i = 0; i + 1 < ast.args.length; i += 2) names[ast.args[i].v] = evaluate(ast.args[i + 1], c2);
            return evaluate(ast.args[ast.args.length - 1], c2);
          }
          if (ast.f === 'LAMBDA') return { lambda: ast.args.slice(0, -1).map((a) => a.v), body: ast.args[ast.args.length - 1], ctx };
          const fn = FN[ast.f];
          if (!fn) return E.NAME('「' + ast.f + '」という関数はありません');
          if (fn.lazy) return fn(ast.args, ctx);
          const args = ast.args.map((a) => evaluate(a, ctx));
          try { return fn(...args); } catch (e) { return E.VALUE(e && e.message); }
        }
        default: return E.VALUE();
      }
    }
    const callLambda = (lam, vals) => { if (!lam || !lam.lambda) return E.VALUE('LAMBDA ではありません'); const names = Object.assign({}, lam.ctx.names || {}); lam.lambda.forEach((n, i) => { names[n] = vals[i]; }); return evaluate(lam.body, Object.assign({}, lam.ctx, { names })); };

    /* ---------- 関数 ---------- */
    const FN = {};
    const def = (names, f, lazy) => { for (const n of names.split(' ')) { FN[n] = f; if (lazy) f.lazy = true; } };
    const wrapNum = (f) => (...a) => { const xs = a.map(num); for (const x of xs) if (isErr(x)) return x; const r = f(...xs); return typeof r === 'number' && !isFinite(r) ? E.NUM() : r; };
    const mapA = (v, f) => (Array.isArray(v) ? grid(v).map((r) => r.map(f)) : f(v));
    /* 数学 */
    def('SUM', (...a) => { const n = nums(a); return isErr(n) ? n : n.reduce((x, y) => x + y, 0); });
    def('PRODUCT', (...a) => { const n = nums(a); return isErr(n) ? n : n.reduce((x, y) => x * y, 1); });
    def('AVERAGE', (...a) => { const n = nums(a); return isErr(n) ? n : n.length ? n.reduce((x, y) => x + y, 0) / n.length : E.DIV0(); });
    def('AVERAGEA', (...a) => { const v = flat(a, true).map((x) => (typeof x === 'string' ? 0 : num(x))); return v.length ? v.reduce((x, y) => x + y, 0) / v.length : E.DIV0(); });
    def('MIN', (...a) => { const n = nums(a); return isErr(n) ? n : n.length ? Math.min(...n) : 0; });
    def('MAX', (...a) => { const n = nums(a); return isErr(n) ? n : n.length ? Math.max(...n) : 0; });
    def('COUNT', (...a) => flat(a, true).filter((v) => typeof v === 'number' || (typeof v === 'string' && v !== '' && !isErr(num(v)) && /\d/.test(v) && !/[^\d.,\-+%/年月日:\s]/.test(v))).length);
    def('COUNTA', (...a) => flat(a, true).filter((v) => v != null && v !== '').length);
    def('COUNTBLANK', (r) => cells(r).filter((v) => v == null || v === '').length);
    def('ABS', wrapNum(Math.abs)); def('SQRT', wrapNum((x) => (x < 0 ? NaN : Math.sqrt(x)))); def('EXP', wrapNum(Math.exp));
    def('LN', wrapNum((x) => (x <= 0 ? NaN : Math.log(x)))); def('LOG10', wrapNum((x) => (x <= 0 ? NaN : Math.log10(x))));
    def('LOG', wrapNum((x, b) => (x <= 0 ? NaN : Math.log(x) / Math.log(b || 10))));
    def('POWER', wrapNum((x, y) => Math.pow(x, y))); def('SIGN', wrapNum(Math.sign)); def('INT', wrapNum(Math.floor));
    def('MOD', wrapNum((x, y) => (y === 0 ? NaN : x - y * Math.floor(x / y))));
    def('QUOTIENT', wrapNum((x, y) => (y === 0 ? NaN : Math.trunc(x / y))));
    const rnd = (x, d, mode) => { const k = Math.pow(10, d || 0); const v = x * k; const r = mode === 'up' ? Math.sign(v) * Math.ceil(Math.abs(v) - 1e-9) : mode === 'down' ? Math.trunc(v) : Math.sign(v) * Math.round(Math.abs(v) + 1e-9); return r / k; };
    def('ROUND', wrapNum((x, d) => rnd(x, d))); def('ROUNDUP', wrapNum((x, d) => rnd(x, d, 'up'))); def('ROUNDDOWN TRUNC', wrapNum((x, d) => rnd(x, d, 'down')));
    def('CEILING CEILING.MATH', wrapNum((x, s) => { s = s || 1; return Math.ceil(x / s) * s; })); def('FLOOR FLOOR.MATH', wrapNum((x, s) => { s = s || 1; return Math.floor(x / s) * s; }));
    def('MROUND', wrapNum((x, m) => Math.round(x / m) * m)); def('EVEN', wrapNum((x) => { const c = Math.ceil(Math.abs(x)); return Math.sign(x || 1) * (c % 2 ? c + 1 : c); })); def('ODD', wrapNum((x) => { const c = Math.ceil(Math.abs(x)); return Math.sign(x || 1) * (c % 2 ? c : c + 1); }));
    def('PI', () => Math.PI); def('RAND', () => Math.random()); def('RANDBETWEEN', wrapNum((a, b) => Math.floor(a + Math.random() * (b - a + 1))));
    def('SIN', wrapNum(Math.sin)); def('COS', wrapNum(Math.cos)); def('TAN', wrapNum(Math.tan)); def('ASIN', wrapNum(Math.asin)); def('ACOS', wrapNum(Math.acos)); def('ATAN', wrapNum(Math.atan)); def('ATAN2', wrapNum((x, y) => Math.atan2(y, x)));
    def('RADIANS', wrapNum((d) => d * Math.PI / 180)); def('DEGREES', wrapNum((r) => r * 180 / Math.PI));
    def('FACT', wrapNum((n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }));
    def('COMBIN', wrapNum((n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }));
    def('PERMUT', wrapNum((n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; }));
    def('GCD', (...a) => { const n = nums(a); if (isErr(n)) return n; const g = (x, y) => (y ? g(y, x % y) : x); return n.map(Math.floor).reduce(g); });
    def('LCM', (...a) => { const n = nums(a); if (isErr(n)) return n; const g = (x, y) => (y ? g(y, x % y) : x); return n.map(Math.floor).reduce((x, y) => x * y / g(x, y)); });
    def('SUMSQ', (...a) => { const n = nums(a); return isErr(n) ? n : n.reduce((x, y) => x + y * y, 0); });
    def('SUMPRODUCT', (...a) => { const gs = a.map(cells); const L = gs[0].length; let s = 0; for (let i = 0; i < L; i++) { let p = 1; for (const g of gs) { const v = num(g[i] == null || g[i] === '' ? 0 : g[i]); p *= isErr(v) ? 0 : v; } s += p; } return s; });
    /* 条件つき集計 */
    const pairs = (a) => { const out = []; for (let i = 0; i < a.length; i += 2) out.push([cells(a[i]), crit(a[i + 1])]); return out; };
    const matchAll = (ps, i) => ps.every(([r, c]) => c(r[i]));
    def('COUNTIF', (r, c) => cells(r).filter(crit(c)).length);
    def('COUNTIFS', (...a) => { const ps = pairs(a); const L = ps[0][0].length; let n = 0; for (let i = 0; i < L; i++) if (matchAll(ps, i)) n++; return n; });
    def('SUMIF', (r, c, s) => { const R = cells(r), S = s ? cells(s) : R, f = crit(c); let t = 0; R.forEach((v, i) => { if (f(v)) { const x = num(S[i] == null || S[i] === '' ? 0 : S[i]); if (!isErr(x)) t += x; } }); return t; });
    def('SUMIFS', (s, ...a) => { const S = cells(s), ps = pairs(a); let t = 0; S.forEach((v, i) => { if (matchAll(ps, i)) { const x = num(v == null || v === '' ? 0 : v); if (!isErr(x)) t += x; } }); return t; });
    def('AVERAGEIF', (r, c, s) => { const R = cells(r), S = s ? cells(s) : R, f = crit(c); const v = []; R.forEach((x, i) => { if (f(x)) { const n = num(S[i]); if (!isErr(n) && S[i] !== '' && S[i] != null) v.push(n); } }); return v.length ? v.reduce((p, q) => p + q, 0) / v.length : E.DIV0(); });
    def('AVERAGEIFS', (s, ...a) => { const S = cells(s), ps = pairs(a); const v = []; S.forEach((x, i) => { if (matchAll(ps, i)) { const n = num(x); if (!isErr(n) && x !== '' && x != null) v.push(n); } }); return v.length ? v.reduce((p, q) => p + q, 0) / v.length : E.DIV0(); });
    def('MAXIFS', (s, ...a) => { const S = cells(s), ps = pairs(a); const v = S.filter((x, i) => matchAll(ps, i)).map(num).filter((x) => !isErr(x)); return v.length ? Math.max(...v) : 0; });
    def('MINIFS', (s, ...a) => { const S = cells(s), ps = pairs(a); const v = S.filter((x, i) => matchAll(ps, i)).map(num).filter((x) => !isErr(x)); return v.length ? Math.min(...v) : 0; });
    /* 統計 */
    const sorted = (a) => { const n = nums(a); return isErr(n) ? n : n.slice().sort((x, y) => x - y); };
    def('MEDIAN', (...a) => { const s = sorted(a); if (isErr(s)) return s; if (!s.length) return E.NUM(); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; });
    def('MODE MODE.SNGL', (...a) => { const n = nums(a); if (isErr(n)) return n; const c = new Map(); let best = null, bc = 1; for (const x of n) { const k = (c.get(x) || 0) + 1; c.set(x, k); if (k > bc) { bc = k; best = x; } } return best == null ? E.NA() : best; });
    const variance = (n, pop) => { const m = n.reduce((x, y) => x + y, 0) / n.length; return n.reduce((s, x) => s + (x - m) * (x - m), 0) / (n.length - (pop ? 0 : 1)); };
    def('VAR VAR.S', (...a) => { const n = nums(a); return isErr(n) ? n : n.length < 2 ? E.DIV0() : variance(n); });
    def('VARP VAR.P', (...a) => { const n = nums(a); return isErr(n) ? n : !n.length ? E.DIV0() : variance(n, true); });
    def('STDEV STDEV.S', (...a) => { const n = nums(a); return isErr(n) ? n : n.length < 2 ? E.DIV0() : Math.sqrt(variance(n)); });
    def('STDEVP STDEV.P', (...a) => { const n = nums(a); return isErr(n) ? n : !n.length ? E.DIV0() : Math.sqrt(variance(n, true)); });
    def('LARGE', (r, k) => { const s = sorted([r]); if (isErr(s)) return s; k = num(k); return k >= 1 && k <= s.length ? s[s.length - k] : E.NUM(); });
    def('SMALL', (r, k) => { const s = sorted([r]); if (isErr(s)) return s; k = num(k); return k >= 1 && k <= s.length ? s[k - 1] : E.NUM(); });
    def('RANK RANK.EQ', (x, r, ord) => { const s = sorted([r]); if (isErr(s)) return s; x = num(x); const i = num(ord) ? s.indexOf(x) : s.length - 1 - s.lastIndexOf(x); return s.includes(x) ? i + 1 : E.NA(); });
    const pctl = (s, p) => { if (!s.length) return E.NUM(); const h = (s.length - 1) * p, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] !== undefined ? s[lo + 1] : s[lo]) - s[lo]); };
    def('PERCENTILE PERCENTILE.INC', (r, p) => { const s = sorted([r]); return isErr(s) ? s : pctl(s, num(p)); });
    def('QUARTILE QUARTILE.INC', (r, q) => { const s = sorted([r]); return isErr(s) ? s : pctl(s, num(q) / 4); });
    def('PERCENTRANK PERCENTRANK.INC', (r, x) => { const s = sorted([r]); if (isErr(s)) return s; x = num(x); const below = s.filter((v) => v < x).length; return Math.floor(below / (s.length - 1) * 1000) / 1000; });
    def('CORREL', (a, b) => { const x = cells(a).map(num), y = cells(b).map(num); const n = Math.min(x.length, y.length); const mx = x.slice(0, n).reduce((p, q) => p + q, 0) / n, my = y.slice(0, n).reduce((p, q) => p + q, 0) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxy / Math.sqrt(sxx * syy); });
    def('SLOPE', (ys, xs) => { const y = cells(ys).map(num), x = cells(xs).map(num); const n = Math.min(x.length, y.length); const mx = x.reduce((p, q) => p + q, 0) / n, my = y.reduce((p, q) => p + q, 0) / n; let a = 0, b = 0; for (let i = 0; i < n; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; } return a / b; });
    def('INTERCEPT', (ys, xs) => { const y = cells(ys).map(num), x = cells(xs).map(num); const sl = FN.SLOPE(ys, xs); return y.reduce((p, q) => p + q, 0) / y.length - sl * x.reduce((p, q) => p + q, 0) / x.length; });
    def('FORECAST FORECAST.LINEAR', (x, ys, xs) => FN.INTERCEPT(ys, xs) + FN.SLOPE(ys, xs) * num(x));
    def('GEOMEAN', (...a) => { const n = nums(a); return isErr(n) ? n : Math.pow(n.reduce((x, y) => x * y, 1), 1 / n.length); });
    def('HARMEAN', (...a) => { const n = nums(a); return isErr(n) ? n : n.length / n.reduce((x, y) => x + 1 / y, 0); });
    def('STANDARDIZE', wrapNum((x, m, s) => (x - m) / s));
    def('DEVSQ', (...a) => { const n = nums(a); if (isErr(n)) return n; const m = n.reduce((x, y) => x + y, 0) / n.length; return n.reduce((s, x) => s + (x - m) ** 2, 0); });
    /* 偏差値（日本の学習向け）: HENSACHI(点, 範囲) */
    def('HENSACHI', (x, r) => { const n = nums([r]); if (isErr(n)) return n; const m = n.reduce((p, q) => p + q, 0) / n.length; const sd = Math.sqrt(variance(n, true)); return sd ? 50 + 10 * (num(x) - m) / sd : 50; });
    /* 論理 */
    def('IF', (args, ctx) => { const c = bool(evaluate(args[0], ctx)); if (isErr(c)) return c; return c ? (args[1] ? evaluate(args[1], ctx) : true) : (args[2] ? evaluate(args[2], ctx) : false); }, true);
    def('IFS', (args, ctx) => { for (let i = 0; i + 1 < args.length; i += 2) { const c = bool(evaluate(args[i], ctx)); if (isErr(c)) return c; if (c) return evaluate(args[i + 1], ctx); } return E.NA('どの条件にも合いません'); }, true);
    def('IFERROR', (args, ctx) => { const v = evaluate(args[0], ctx); return isErr(v) ? evaluate(args[1], ctx) : v; }, true);
    def('IFNA', (args, ctx) => { const v = evaluate(args[0], ctx); return isErr(v) && v.code === '#N/A' ? evaluate(args[1], ctx) : v; }, true);
    def('SWITCH', (args, ctx) => { const v = evaluate(args[0], ctx); for (let i = 1; i + 1 < args.length; i += 2) { if (binop('=', v, evaluate(args[i], ctx)) === true) return evaluate(args[i + 1], ctx); } return args.length % 2 === 0 ? evaluate(args[args.length - 1], ctx) : E.NA(); }, true);
    def('AND', (...a) => { const v = flat(a, true).filter((x) => x !== '' && x != null).map(bool); for (const x of v) if (isErr(x)) return x; return v.every(Boolean); });
    def('OR', (...a) => { const v = flat(a, true).filter((x) => x !== '' && x != null).map(bool); for (const x of v) if (isErr(x)) return x; return v.some(Boolean); });
    def('XOR', (...a) => flat(a, true).map(bool).filter(Boolean).length % 2 === 1);
    def('NOT', (v) => { const b = bool(v); return isErr(b) ? b : !b; });
    def('CHOOSE', (args, ctx) => { const i = num(evaluate(args[0], ctx)); return i >= 1 && i < args.length ? evaluate(args[Math.floor(i)], ctx) : E.VALUE(); }, true);
    def('ISBLANK', (v) => v == null || v === ''); def('ISNUMBER', (v) => typeof v === 'number'); def('ISTEXT', (v) => typeof v === 'string' && v !== '');
    def('ISNONTEXT', (v) => typeof v !== 'string' || v === ''); def('ISLOGICAL', (v) => typeof v === 'boolean'); def('ISERROR', (v) => isErr(v)); def('ISERR', (v) => isErr(v) && v.code !== '#N/A'); def('ISNA', (v) => isErr(v) && v.code === '#N/A');
    def('ISEVEN', (v) => num(v) % 2 === 0); def('ISODD', (v) => Math.abs(num(v) % 2) === 1);
    def('NA', () => E.NA()); def('N', (v) => (typeof v === 'number' ? v : typeof v === 'boolean' ? +v : 0)); def('T', (v) => (typeof v === 'string' ? v : ''));
    def('ERROR.TYPE', (v) => (isErr(v) ? ['#NULL!', '#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A'].indexOf(v.code) + 1 : E.NA()));
    /* 文字 */
    def('CONCAT CONCATENATE', (...a) => flat(a, true).map(str).join(''));
    def('TEXTJOIN', (d, ign, ...a) => flat(a, true).filter((v) => !(bool(ign) && (v == null || v === ''))).map(str).join(str(d)));
    def('LEFT', (s, n) => str(s).slice(0, n == null ? 1 : num(n))); def('RIGHT', (s, n) => { s = str(s); n = n == null ? 1 : num(n); return n ? s.slice(-n) : ''; });
    def('MID', (s, a, n) => str(s).substr(num(a) - 1, num(n))); def('LEN', (s) => [...str(s)].length); def('LENB', (s) => [...str(s)].reduce((t, c) => t + (/[^\x00-\xff]/.test(c) ? 2 : 1), 0));
    def('UPPER', (s) => str(s).toUpperCase()); def('LOWER', (s) => str(s).toLowerCase());
    def('PROPER', (s) => str(s).toLowerCase().replace(/(^|[^a-z])([a-z])/g, (m, p, c) => p + c.toUpperCase()));
    def('TRIM', (s) => str(s).replace(/[ \u3000]+/g, ' ').trim()); def('CLEAN', (s) => str(s).replace(/[\x00-\x1f]/g, ''));
    def('SUBSTITUTE', (s, a, b, n) => { s = str(s); a = str(a); b = str(b); if (!a) return s; if (n == null) return s.split(a).join(b); let k = 0; return s.replace(new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (m) => (++k === num(n) ? b : m)); });
    def('REPLACE', (s, a, n, t) => { s = str(s); return s.slice(0, num(a) - 1) + str(t) + s.slice(num(a) - 1 + num(n)); });
    def('FIND', (f, s, a) => { const i = str(s).indexOf(str(f), (a ? num(a) : 1) - 1); return i < 0 ? E.VALUE('見つかりません') : i + 1; });
    def('SEARCH', (f, s, a) => { const re = new RegExp(str(f).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.'), 'i'); const sub = str(s).slice((a ? num(a) : 1) - 1); const m = re.exec(sub); return m ? m.index + (a ? num(a) : 1) : E.VALUE('見つかりません'); });
    def('REPT', (s, n) => str(s).repeat(Math.max(0, num(n)))); def('EXACT', (a, b) => str(a) === str(b));
    def('VALUE NUMBERVALUE', (s) => num(s)); def('TEXT', (v, f) => textFmt(v, str(f))); def('FIXED', (v, d, nc) => textFmt(v, (bool(nc) ? '0' : '#,##0') + (num(d == null ? 2 : d) > 0 ? '.' + '0'.repeat(num(d == null ? 2 : d)) : '')));
    def('CHAR UNICHAR', (n) => String.fromCodePoint(num(n))); def('CODE UNICODE', (s) => str(s).codePointAt(0) || E.VALUE());
    def('ASC', (s) => str(s).replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/　/g, ' '));
    def('JIS', (s) => str(s).replace(/[!-~]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)).replace(/ /g, '　'));
    def('HIRAGANA', (s) => str(s).replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60)));
    def('KATAKANA', (s) => str(s).replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60)));
    def('TEXTBEFORE', (s, d, n) => { s = str(s); d = str(d); const parts = s.split(d); n = n == null ? 1 : num(n); return parts.length > n ? parts.slice(0, n).join(d) : E.NA(); });
    def('TEXTAFTER', (s, d, n) => { s = str(s); d = str(d); const parts = s.split(d); n = n == null ? 1 : num(n); return parts.length > n ? parts.slice(n).join(d) : E.NA(); });
    def('TEXTSPLIT', (s, d) => [str(s).split(str(d))]);
    def('REGEXMATCH', (s, re) => { try { return new RegExp(str(re)).test(str(s)); } catch (e) { return E.VALUE('正規表現が正しくありません'); } });
    def('REGEXEXTRACT', (s, re) => { try { const m = new RegExp(str(re)).exec(str(s)); return m ? (m[1] !== undefined ? m[1] : m[0]) : E.NA(); } catch (e) { return E.VALUE(); } });
    def('REGEXREPLACE', (s, re, t) => { try { return str(s).replace(new RegExp(str(re), 'g'), str(t)); } catch (e) { return E.VALUE(); } });
    def('WORDCOUNT', (s) => (str(s).match(/[\u3040-\u30ff\u3400-\u9fff]|[A-Za-z0-9']+/g) || []).length);
    def('READTIME', (s) => Math.max(1, Math.round([...str(s)].length / 500)));
    /* 日付 */
    const today = () => Math.floor(toSerial(new Date()));
    def('TODAY', today); def('NOW', () => toSerial(new Date()));
    def('DATE', wrapNum((y, m, d) => ymdSerial(y, m, d))); def('TIME', wrapNum((h, m, s) => (h * 3600 + m * 60 + s) / 86400));
    def('YEAR', (v) => { const n = num(v); return isErr(n) ? n : serialParts(n).y; }); def('MONTH', (v) => { const n = num(v); return isErr(n) ? n : serialParts(n).m; }); def('DAY', (v) => { const n = num(v); return isErr(n) ? n : serialParts(n).d; });
    def('HOUR', (v) => Math.floor(((num(v) % 1) * 24) + 1e-9)); def('MINUTE', (v) => Math.floor(((num(v) * 1440) % 60) + 1e-9)); def('SECOND', (v) => Math.round((num(v) * 86400) % 60));
    def('WEEKDAY', (v, t) => { const wd = serialParts(num(v)).wd; t = t == null ? 1 : num(t); return t === 2 ? (wd + 6) % 7 + 1 : t === 3 ? (wd + 6) % 7 : wd + 1; });
    def('WEEKNUM', (v, t) => { const n = num(v), p = serialParts(n); const jan1 = ymdSerial(p.y, 1, 1); const w1 = serialParts(jan1).wd; const off = (num(t || 1) === 2) ? (w1 + 6) % 7 : w1; return Math.floor((n - jan1 + off) / 7) + 1; });
    def('ISOWEEKNUM', (v) => { const d = new Date(EPOCH + Math.floor(num(v)) * DAYMS); const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / DAYMS + 1) / 7); });
    def('EDATE', (v, m) => { const p = serialParts(num(v)); const d = new Date(Date.UTC(p.y, p.m - 1 + num(m), 1)); const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); return ymdSerial(d.getUTCFullYear(), d.getUTCMonth() + 1, Math.min(p.d, last)); });
    def('EOMONTH', (v, m) => { const p = serialParts(num(v)); return (Date.UTC(p.y, p.m + num(m), 0) - EPOCH) / DAYMS; });
    def('DAYS', (b, a) => Math.floor(num(b)) - Math.floor(num(a)));
    def('DATEDIF', (a, b, u) => { a = num(a); b = num(b); if (a > b) return E.NUM(); const pa = serialParts(a), pb = serialParts(b); u = str(u).toUpperCase(); const months = (pb.y - pa.y) * 12 + pb.m - pa.m - (pb.d < pa.d ? 1 : 0); if (u === 'Y') return Math.floor(months / 12); if (u === 'M') return months; if (u === 'D') return Math.floor(b) - Math.floor(a); if (u === 'YM') return months % 12; if (u === 'MD') { let d = pb.d - pa.d; if (d < 0) d += new Date(Date.UTC(pb.y, pb.m - 1, 0)).getUTCDate(); return d; } if (u === 'YD') { const ya = ymdSerial(pb.y, pa.m, pa.d); return Math.floor(b) - (ya > b ? ymdSerial(pb.y - 1, pa.m, pa.d) : ya); } return E.NUM(); });
    const HOL = new Set();
    const isWork = (n, hol) => { const wd = serialParts(n).wd; return wd !== 0 && wd !== 6 && !hol.has(Math.floor(n)); };
    def('NETWORKDAYS', (a, b, h) => { a = Math.floor(num(a)); b = Math.floor(num(b)); const hol = new Set(h ? cells(h).map((x) => Math.floor(num(x))) : HOL); let n = 0; const s = Math.sign(b - a) || 1; for (let d = a; s > 0 ? d <= b : d >= b; d += s) if (isWork(d, hol)) n += s; return n; });
    def('WORKDAY', (a, k, h) => { let d = Math.floor(num(a)); k = num(k); const hol = new Set(h ? cells(h).map((x) => Math.floor(num(x))) : HOL); const s = Math.sign(k) || 1; let n = Math.abs(k); while (n > 0) { d += s; if (isWork(d, hol)) n--; } return d; });
    def('DATEVALUE', (s) => { const d = parseDate(str(s)); return d == null ? E.VALUE('日付として読めません') : Math.floor(d); });
    def('TIMEVALUE', (s) => { const d = parseDate(str(s)); return d == null ? E.VALUE() : d % 1; });
    def('YEARFRAC', (a, b) => Math.abs(num(b) - num(a)) / 365);
    def('AGE', (birth, at) => FN.DATEDIF(birth, at == null ? today() : at, 'Y'));
    def('WAREKI', (v) => { const p = serialParts(num(v)); const eras = [[2019, 5, 1, '令和'], [1989, 1, 8, '平成'], [1926, 12, 25, '昭和'], [1912, 7, 30, '大正'], [1868, 1, 25, '明治']]; for (const [y, m, d, n] of eras) if (num(v) >= ymdSerial(y, m, d)) { const k = p.y - y + 1; return n + (k === 1 ? '元' : k) + '年' + p.m + '月' + p.d + '日'; } return p.y + '年'; });
    /* 検索・参照 */
    const exactOrApprox = (arr, key, mode) => {
      if (mode === 0 || mode === false) { const f = crit(typeof key === 'string' && /[*?]/.test(key) ? key : key); for (let i = 0; i < arr.length; i++) if (typeof key === 'string' ? f(arr[i]) || str(arr[i]).toLowerCase() === key.toLowerCase() : num(arr[i]) === num(key) || arr[i] === key) return i; return -1; }
      let best = -1; for (let i = 0; i < arr.length; i++) { const c = binop('<=', arr[i], key); if (c === true) best = i; else if (mode !== -2) break; } return best;
    };
    def('VLOOKUP', (key, tbl, col, approx) => { const G = grid(tbl); const i = exactOrApprox(G.map((r) => r[0]), key, approx == null ? 1 : bool(approx) ? 1 : 0); return i < 0 ? E.NA() : (G[i][num(col) - 1] !== undefined ? G[i][num(col) - 1] : E.REF()); });
    def('HLOOKUP', (key, tbl, row, approx) => { const G = grid(tbl); const i = exactOrApprox(G[0], key, approx == null ? 1 : bool(approx) ? 1 : 0); return i < 0 ? E.NA() : (G[num(row) - 1] ? G[num(row) - 1][i] : E.REF()); });
    def('XLOOKUP', (key, look, ret, ifnf, mode, search) => { const L = cells(look), G = grid(ret); const vert = G.length === L.length || G.length > 1; const m = mode == null ? 0 : num(mode); let idx = -1; const order = num(search || 1) === -1 ? [...L.keys()].reverse() : [...L.keys()]; for (const i of order) { if (m === 2 ? crit(key)(L[i]) : binop('=', L[i], key) === true) { idx = i; break; } } if (idx < 0 && (m === -1 || m === 1)) { let bi = -1; for (const i of order) { const lo = binop(m === -1 ? '<' : '>', L[i], key) === true; if (lo && (bi < 0 || binop(m === -1 ? '>' : '<', L[i], L[bi]) === true)) bi = i; } idx = bi; } if (idx < 0) return ifnf !== undefined && ifnf !== null ? ifnf : E.NA(); return vert ? (G[idx].length === 1 ? G[idx][0] : [G[idx]]) : G.map((r) => [r[idx]]); });
    def('MATCH XMATCH', (key, arr, mode) => { const A = cells(arr); const m = mode == null ? 1 : num(mode); if (m === 0) { const i = exactOrApprox(A, key, 0); return i < 0 ? E.NA() : i + 1; } if (m === 1) { const i = exactOrApprox(A, key, 1); return i < 0 ? E.NA() : i + 1; } let best = -1; A.forEach((v, i) => { if (binop('>=', v, key) === true) best = i; }); return best < 0 ? E.NA() : best + 1; });
    def('INDEX', (arr, r, c) => { const G = grid(arr); r = num(r || 0); c = num(c || 0); if (G.length === 1 && c === 0 && r) { c = r; r = 1; } if (!r) return G.map((row) => [row[c - 1]]); if (!c) return [G[r - 1]]; const v = (G[r - 1] || [])[c - 1]; return v === undefined ? E.REF() : v; });
    def('LOOKUP', (key, look, ret) => { const L = cells(look), R = ret ? cells(ret) : L; const i = exactOrApprox(L, key, 1); return i < 0 ? E.NA() : R[i]; });
    def('ROWS', (a) => grid(a).length); def('COLUMNS', (a) => grid(a)[0].length);
    def('TRANSPOSE', (a) => { const G = grid(a); return G[0].map((_, j) => G.map((r) => r[j])); });
    def('FILTER', (arr, inc, empty) => { const G = grid(arr), I = cells(inc); const out = G.filter((_, i) => bool(I[i]) === true); return out.length ? out : (empty !== undefined ? empty : E.CALC('合う行がありません')); });
    def('SORT', (arr, idx, ord) => { const G = grid(arr).slice(); const k = num(idx || 1) - 1, o = num(ord || 1); G.sort((a, b) => { const c = binop('<', a[k], b[k]) === true ? -1 : binop('>', a[k], b[k]) === true ? 1 : 0; return c * o; }); return G; });
    def('SORTBY', (arr, by, ord) => { const G = grid(arr), K = cells(by), o = num(ord || 1); return G.map((r, i) => [r, K[i]]).sort((a, b) => (binop('<', a[1], b[1]) === true ? -1 : binop('>', a[1], b[1]) === true ? 1 : 0) * o).map((x) => x[0]); });
    def('UNIQUE', (arr) => { const seen = new Set(); return grid(arr).filter((r) => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; }); });
    def('SEQUENCE', (r, c, s, st) => { r = num(r); c = num(c || 1); s = num(s == null ? 1 : s); st = num(st == null ? 1 : st); const out = []; let v = s; for (let i = 0; i < r; i++) { const row = []; for (let j = 0; j < c; j++) { row.push(v); v += st; } out.push(row); } return out; });
    def('TAKE', (a, r) => { const G = grid(a); r = num(r); return r >= 0 ? G.slice(0, r) : G.slice(r); }); def('DROP', (a, r) => { const G = grid(a); r = num(r); return r >= 0 ? G.slice(r) : G.slice(0, r); });
    def('VSTACK', (...a) => a.flatMap(grid)); def('HSTACK', (...a) => { const gs = a.map(grid); return gs[0].map((_, i) => gs.flatMap((g) => g[i] || [])); });
    def('TOCOL', (a) => cells(a).map((x) => [x])); def('TOROW', (a) => [cells(a)]);
    def('MAP', (...a) => { const lam = a[a.length - 1]; const G = grid(a[0]); return G.map((r, i) => r.map((x, j) => callLambda(lam, a.slice(0, -1).map((g) => grid(g)[i][j])))); });
    def('REDUCE', (init, arr, lam) => cells(arr).reduce((acc, x) => callLambda(lam, [acc, x]), init));
    def('BYROW', (arr, lam) => grid(arr).map((r) => [callLambda(lam, [[r]])])); def('BYCOL', (arr, lam) => [grid(arr)[0].map((_, j) => callLambda(lam, [grid(arr).map((r) => [r[j]])]))]);
    /* お金・その他 */
    def('PMT', wrapNum((r, n, pv, fv, t) => { fv = fv || 0; t = t || 0; if (!r) return -(pv + fv) / n; const p = Math.pow(1 + r, n); return -(r * (pv * p + fv)) / ((1 + r * t) * (p - 1)); }));
    def('FV', wrapNum((r, n, pmt, pv, t) => { pv = pv || 0; t = t || 0; if (!r) return -(pv + pmt * n); const p = Math.pow(1 + r, n); return -(pv * p + pmt * (1 + r * t) * (p - 1) / r); }));
    def('PV', wrapNum((r, n, pmt, fv, t) => { fv = fv || 0; t = t || 0; if (!r) return -(fv + pmt * n); const p = Math.pow(1 + r, n); return -(fv + pmt * (1 + r * t) * (p - 1) / r) / p; }));
    def('NPV', (r, ...a) => { r = num(r); const n = nums(a); return isErr(n) ? n : n.reduce((s, x, i) => s + x / Math.pow(1 + r, i + 1), 0); });
    def('IRR', (a, g) => { const n = cells(a).map(num); let r = g == null ? 0.1 : num(g); for (let k = 0; k < 60; k++) { let f = 0, d = 0; n.forEach((x, i) => { f += x / Math.pow(1 + r, i); d -= i * x / Math.pow(1 + r, i + 1); }); const nr = r - f / d; if (Math.abs(nr - r) < 1e-10) return nr; r = nr; } return E.NUM(); });
    def('CONVERT', (v, from, to) => { const U = { m: 1, cm: 0.01, mm: 0.001, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344, g: 1, kg: 1000, mg: 0.001, lbm: 453.59237, ozm: 28.349523125, l: 1, ml: 0.001, gal: 3.785411784, hr: 3600, mn: 60, sec: 1, day: 86400 }; const f = str(from), t = str(to); if (f === 'C' && t === 'F') return num(v) * 9 / 5 + 32; if (f === 'F' && t === 'C') return (num(v) - 32) * 5 / 9; if (!(f in U) || !(t in U)) return E.NA(); return num(v) * U[f] / U[t]; });
    def('BIN2DEC', (s) => parseInt(str(s), 2)); def('DEC2BIN', (n) => (num(n) >>> 0).toString(2)); def('HEX2DEC', (s) => parseInt(str(s), 16)); def('DEC2HEX', (n) => num(n).toString(16).toUpperCase());
    def('ROMAN', (n) => { n = num(n); const R = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, r] of R) while (n >= v) { s += r; n -= v; } return s; });
    def('KANJI', (n) => { n = Math.floor(num(n)); if (!n) return '〇'; const D = '〇一二三四五六七八九', U = ['', '十', '百', '千'], B = ['', '万', '億', '兆']; let s = '', i = 0; while (n > 0) { const c = n % 10000; if (c) { let t = ''; const d = String(c).padStart(4, '0'); for (let k = 0; k < 4; k++) { const x = +d[k]; if (x) t += (x === 1 && k < 3 ? '' : D[x]) + U[3 - k]; } s = t + B[i] + s; } n = Math.floor(n / 10000); i++; } return s; });
    def('HYPERLINK', (u, t) => (t == null ? str(u) : str(t)));
    def('ROW', () => E.VALUE('ROW は表の中で [#行] を使ってください')); def('COLUMN', () => E.VALUE());

    /* ---------- 外向き ---------- */
    function run(src, ctx) {
      if (src == null) return '';
      const s = String(src);
      if (!/^\s*=/.test(s)) { const n = num(s); return s.trim() === '' ? '' : isErr(n) ? s : n; }
      let ast;
      try { ast = parse(s); } catch (e) { return new FErr('#ERROR', e.message); }
      try { return evaluate(ast, ctx || {}); } catch (e) { return new FErr('#ERROR', e.message); }
    }
    const show = (v, fmt) => {
      if (isErr(v)) return v.code;
      if (Array.isArray(v)) return show(first(v), fmt);
      if (v == null) return '';
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (typeof v === 'number' && fmt) return textFmt(v, fmt);
      if (typeof v === 'number') return fmtNum(v);
      return String(v);
    };
    return { run, parse, evaluate, show, FN, E, FErr, isErr, num, str, bool, grid, cells, toSerial, fromSerial, ymdSerial, serialParts, parseDate, textFmt, colName, colNum, crit };
  })();

  /* ============================================================
   *  2. 保存（ScriptCat の保存領域が本命。無ければ localStorage）
   * ============================================================ */
  const HAS_GM = typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
  const store = {
    get(k, d) {
      let v = null;
      if (HAS_GM) { try { v = GM_getValue(k, null); if (typeof v === 'string') v = JSON.parse(v); } catch (e) { v = null; } }
      if (v == null) { try { v = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { v = null; } }
      return v == null ? d : v;
    },
    set(k, v) {
      const j = JSON.stringify(v);
      if (HAS_GM) { try { GM_setValue(k, j); } catch (e) { /* noop */ } }
      try { localStorage.setItem(k, j); } catch (e) { /* noop */ }
    }
  };
  const K = { prefs: 'c38.prefs', sheets: 'c38.sheets', macros: 'c38.macros', undo: 'c38.undo', srs: 'c38.srs', decks: 'c38.decks', log: 'c38.studylog', read: 'c38.reading' };
  const P = Object.assign({ redColors: ['red', 'orange'], clozeColor: 'yellow', pomo: 25, brk: 5, longBrk: 15, goal: 120, resume: true, cfToNotion: true }, store.get(K.prefs, {}));
  const saveP = () => store.set(K.prefs, P);
  const ST = { queries: 0, writes: 0, lastError: '', route: '' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const dash = (h) => { h = String(h || '').replace(/-/g, ''); return h.length === 32 ? h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20) : h; };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));

  /* ============================================================
   *  3. Notion の API（読み・書き）
   * ============================================================ */
  function activeUser() { const m = /(?:^|;\s*)notion_user_id=([^;]+)/.exec(document.cookie || ''); return m ? decodeURIComponent(m[1]) : ''; }
  async function post(path, body, spaceId) {
    const headers = { 'Content-Type': 'application/json' };
    const u = activeUser(); if (u) headers['x-notion-active-user-header'] = u;
    if (spaceId) headers['x-notion-space-id'] = spaceId;
    const r = await fetch(location.origin + path, { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(body) });
    const t = await r.text();
    if (!r.ok) { const e = new Error('HTTP ' + r.status + ' ' + t.slice(0, 160)); e.status = r.status; throw e; }
    return t ? JSON.parse(t) : {};
  }
  const unwrap = (n) => (n ? (n.value && n.value.value ? n.value.value : n.value || null) : null);
  let RV = null;   // 通った読み取りの経路
  async function records(table, ids) {
    const out = new Map();
    ids = [...new Set(ids.filter(Boolean))];
    for (let i = 0; i < ids.length; i += 100) {
      const part = ids.slice(i, i + 100);
      const tries = RV === 'legacy' ? ['legacy', 'main'] : ['main', 'legacy'];
      let j = null;
      for (const k of tries) {
        try {
          j = k === 'main' ? await post('/api/v3/syncRecordValuesMain', { requests: part.map((id) => ({ pointer: { table, id }, version: -1 })) })
            : await post('/api/v3/syncRecordValues', { requests: part.map((id) => ({ table, id, version: -1 })) });
          RV = k; break;
        } catch (e) { j = null; }
      }
      const rm = (j && j.recordMap && j.recordMap[table]) || {};
      for (const id of part) { const v = unwrap(rm[id]); if (v) out.set(id, v); }
    }
    return out;
  }
  /* 書き込み: 今の Notion が使う saveTransactionsFanout（だめなら旧 saveTransactions） */
  async function saveOps(ops, spaceId, tag) {
    if (!ops.length) return;
    for (let i = 0; i < ops.length; i += 300) {
      const part = ops.slice(i, i + 300);
      const body = () => ({ requestId: uid(), transactions: [{ id: uid(), spaceId, debug: { userAction: tag || 'c38' }, operations: part }] });
      try { await post('/api/v3/saveTransactionsFanout', body(), spaceId); ST.route = 'fanout'; }
      catch (e) {
        if (!/HTTP (404|405|400)/.test(String(e && e.message))) throw e;
        await post('/api/v3/saveTransactions', body(), spaceId); ST.route = 'legacy';
      }
      ST.writes += part.length;
    }
  }

  /* ============================================================
   *  4. ビュー（いま見ている DB の表）を丸ごと読む
   * ============================================================ */
  const VIEW_SEL = '.notion-table-view, .notion-board-view, .notion-gallery-view, .notion-list-view, .notion-calendar-view, .notion-timeline-view';
  let lastViewEl = null;
  document.addEventListener('mousemove', (e) => { const v = e.target && e.target.closest && e.target.closest(VIEW_SEL); if (v) lastViewEl = v; }, { passive: true, capture: true });
  function findView(el) {
    const v = (el && el.closest && el.closest(VIEW_SEL)) || (lastViewEl && lastViewEl.isConnected ? lastViewEl : null) || document.querySelector('.notion-frame :is(' + VIEW_SEL + ')') || document.querySelector(VIEW_SEL);
    if (!v) return null;
    const inline = v.closest('.notion-collection_view-block');
    let blockId = inline ? inline.getAttribute('data-block-id') : null;
    if (!blockId) { const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname); blockId = m ? dash(m[1]) : null; }
    if (!blockId) { const b = v.querySelector('.notion-collection_view_page-block[data-block-id]') || document.querySelector('.notion-collection_view_page-block[data-block-id]'); blockId = b && b.getAttribute('data-block-id'); }
    let viewId = '';
    const scope = inline || document.querySelector('.notion-frame') || document;
    const tabs = [...scope.querySelectorAll('.notion-collection-view-tab-button[data-collection-view-id]')].filter((t) => !inline || t.closest('.notion-collection_view-block') === inline);
    const sel = tabs.find((t) => t.querySelector('[aria-selected="true"]') || /background: var\(--c-bacTer\)|rgba\(55, 53, 47, 0.08\)/.test(t.innerHTML.slice(0, 600)));
    if (!inline) { const q = new URLSearchParams(location.search).get('v'); if (q) viewId = dash(q); }
    if (!viewId && sel) viewId = sel.getAttribute('data-collection-view-id');
    if (!viewId && tabs.length === 1) viewId = tabs[0].getAttribute('data-collection-view-id');
    return { el: v, blockId, viewId, inline: !!inline };
  }
  /* プロパティの値 → 数式の値 */
  const plainRT = (v) => (Array.isArray(v) ? v.map((s) => (Array.isArray(s) ? (s[0] === '‣' ? '' : String(s[0])) : '')).join('') : v == null ? '' : String(v));
  const mentions = (v, kind) => { const out = []; if (!Array.isArray(v)) return out; for (const s of v) if (Array.isArray(s) && Array.isArray(s[1])) for (const f of s[1]) if (Array.isArray(f) && f[0] === kind && f[1]) out.push(f[1]); return out; };
  function dateSerial(d) {
    if (!d || !d.start_date) return '';
    const s = d.start_date + (d.start_time ? ' ' + d.start_time : '');
    const n = ENGINE.parseDate(s);
    return n == null ? s : n;
  }
  function cacheVal(c) {
    if (!c) return '';
    if (c.type === 'array') return (c.values || []).map((x) => { const v = cacheVal(x); return typeof v === 'number' ? ENGINE.show(v) : v; }).filter((x) => x !== '').join('、');
    if (c.type === 'number') return typeof c.value === 'number' ? c.value : +c.value;
    if (c.type === 'checkbox' || c.type === 'boolean') return !!c.value;
    if (c.type === 'date') return dateSerial(c.value || {});
    if (Array.isArray(c.value)) { const d = mentions(c.value, 'd')[0]; if (d) return dateSerial(d); return plainRT(c.value); }
    return c.value == null ? '' : c.value;
  }
  /* 1 列ぶんの読み方（表示用の文字と、数式で使う値） */
  function readProp(rec, pid, def, ctx) {
    const props = (rec && rec.properties) || {};
    const v = props[pid];
    switch (def.type) {
      case 'title': case 'text': case 'url': case 'email': case 'phone_number': return plainRT(v);
      case 'number': { const s = plainRT(v); if (s === '') return ''; const n = parseFloat(s); return isNaN(n) ? s : n; }
      case 'checkbox': return plainRT(v) === 'Yes';
      case 'select': case 'status': return plainRT(v);
      case 'multi_select': return plainRT(v).split(',').map(norm).filter(Boolean).join(', ');
      case 'date': { const d = mentions(v, 'd')[0]; return d ? dateSerial(d) : ''; }
      case 'person': return mentions(v, 'u').map((u) => ctx.user(u)).join('、');
      case 'relation': return mentions(v, 'p').map((p) => ctx.title(p)).join('、');
      case 'created_time': return rec.created_time ? ENGINE.toSerial(new Date(rec.created_time)) : '';
      case 'last_edited_time': return rec.last_edited_time ? ENGINE.toSerial(new Date(rec.last_edited_time)) : '';
      case 'created_by': return ctx.user(rec.created_by_id);
      case 'last_edited_by': return ctx.user(rec.last_edited_by_id);
      case 'file': return (Array.isArray(v) ? v.map((s) => s[0]).join('、') : '');
      case 'formula': case 'rollup': { const c = ctx.cache(rec.id, pid); return c === undefined ? '' : c; }
      case 'auto_increment_id': case 'unique_id': return plainRT(v) || (ctx.cache(rec.id, pid) || '');
      default: return plainRT(v);
    }
  }
  const WRITABLE = new Set(['title', 'text', 'number', 'select', 'status', 'multi_select', 'checkbox', 'date', 'url', 'email', 'phone_number']);
  /* 数式の値 → Notion のプロパティの値（書き戻す時） */
  function toNotion(val, def) {
    if (ENGINE.isErr(val)) throw new Error(val.code + ' は書き込めません');
    if (Array.isArray(val)) val = ENGINE.cells(val)[0];
    switch (def.type) {
      case 'number': { if (val === '' || val == null) return []; const n = ENGINE.num(val); if (ENGINE.isErr(n)) throw new Error('「' + val + '」は数ではありません'); return [[String(Math.round(n * 1e10) / 1e10)]]; }
      case 'checkbox': { const b = ENGINE.bool(val); return [[b === true ? 'Yes' : 'No']]; }
      case 'date': {
        if (val === '' || val == null) return [];
        const n = typeof val === 'number' ? val : ENGINE.num(val);
        if (ENGINE.isErr(n)) throw new Error('「' + val + '」は日付ではありません');
        const p = ENGINE.serialParts(n);
        const d = { type: 'date', start_date: p.y + '-' + String(p.m).padStart(2, '0') + '-' + String(p.d).padStart(2, '0') };
        const frac = n - Math.floor(n);
        if (frac > 1e-6) { const secs = Math.round(frac * 86400); d.type = 'datetime'; d.start_time = String(Math.floor(secs / 3600)).padStart(2, '0') + ':' + String(Math.floor(secs / 60) % 60).padStart(2, '0'); }
        return [['‣', [['d', d]]]];
      }
      case 'select': case 'status': { const s = ENGINE.str(val); if (!s) return []; const ok = (def.options || []).some((o) => o.value === s) || (def.groups && true); if (!ok && def.type === 'status') throw new Error('ステータス「' + s + '」がありません'); return [[s]]; }
      case 'multi_select': { const s = ENGINE.str(val); return s ? [[s.split(/[,、]/).map(norm).filter(Boolean).join(',')]] : []; }
      default: { const s = typeof val === 'number' ? ENGINE.show(val) : ENGINE.str(val); return s === '' ? [] : [[s]]; }
    }
  }
  /* セレクトに無い選択肢を書く時は、選択肢を足す操作も一緒に */
  function optionOps(def, pid, collId, spaceId, vals) {
    if (def.type !== 'select' && def.type !== 'multi_select') return [];
    const have = new Set((def.options || []).map((o) => o.value));
    const add = new Set();
    for (const v of vals) { const s = plainRT(v); for (const x of (def.type === 'multi_select' ? s.split(',') : [s])) if (x && !have.has(x)) add.add(x); }
    if (!add.size) return [];
    const COLORS = ['default', 'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];
    const opts = (def.options || []).concat([...add].map((v, i) => ({ id: uid(), value: v, color: COLORS[(have.size + i) % COLORS.length] })));
    def.options = opts;
    return [{ pointer: { table: 'collection', id: collId, spaceId }, path: ['schema', pid, 'options'], command: 'set', args: opts }];
  }

  /* ビューを全部読む: { viewId, collId, spaceId, schema, cols:[{pid,name,type,def}], rows:[{id, rec, group, vals}] } */
  async function loadView(v, opts) {
    opts = opts || {};
    ST.queries++;
    const body = { collectionView: { id: v.viewId }, collectionViewBlock: { id: v.blockId }, clientType: 'notion_app', userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo', isFullScreen: !v.inline, isMobile: false };
    let j = await post('/api/v3/queryCollection?src=c38', body);
    const anyMore = (r) => { const red = r && r.result && r.result.reducerResults; if (!red) return false; for (const x of Object.values(red)) { if (x.hasMore) return true; if (x.blockResults) for (const b of Object.values(x.blockResults)) if (b.hasMore) return true; } return false; };
    if (anyMore(j) && j.compiledRequest) {
      /* 全件が来なかった（グループごとの件数の上限）→ 上限を大きくして取り直す */
      const cr = JSON.parse(JSON.stringify(j.compiledRequest));
      const red = cr.loader && cr.loader.reducers;
      if (red) for (const r of Object.values(red)) { if ('limit' in r) r.limit = Math.max(r.limit, 1000); if (r.blockResults) r.blockResults.defaultLimit = 5000; }
      try { const j2 = await post('/api/v3/queryCollection?src=c38-all', cr); if (j2 && j2.result) { j2.recordMap = Object.assign({}, j.recordMap, j2.recordMap); j = j2; } } catch (e) { ST.lastError = 'all: ' + e.message; }
    }
    const rm = j.recordMap || {};
    const red = (j.result && j.result.reducerResults) || {};
    /* 行の順（グループがあればグループの順） */
    const order = [];
    const groupOf = new Map();
    for (const x of Object.values(red)) {
      if (x.type === 'groups' && x.results) {
        for (const g of x.results) {
          if (g.visible === false) continue;
          const val = g.value || {};
          const key = (val.type || '') + ':' + (val.value && typeof val.value === 'object' ? (val.value.id || JSON.stringify(val.value)) : (val.value == null ? '' : val.value));
          const br = x.blockResults && (x.blockResults[key] || Object.entries(x.blockResults).find(([k2]) => k2.endsWith(':' + (val.value && val.value.id)))?.[1]);
          for (const id of (br && br.blockIds) || []) { order.push(id); if (!groupOf.has(id)) groupOf.set(id, val); }
        }
      } else if (x.blockIds) for (const id of x.blockIds) order.push(id);
    }
    const blocks = rm.block || {};
    /* recordMap.collection には関係先の DB も入っている → このビューの DB は compiledRequest.source か、ビューの block から */
    let collId = (j.compiledRequest && j.compiledRequest.source && j.compiledRequest.source.id) || '';
    if (!collId) { const b = unwrap(blocks[v.blockId]); collId = b && (b.collection_id || (b.format && b.format.collection_pointer && b.format.collection_pointer.id)); }
    const coll = collId ? unwrap((rm.collection || {})[collId]) : null;
    let schema = coll && coll.schema;
    if (!schema) {
      const b = unwrap(blocks[v.blockId]) || (await records('block', [v.blockId])).get(v.blockId);
      collId = b && (b.collection_id || (b.format && b.format.collection_pointer && b.format.collection_pointer.id));
      const c = collId && (await records('collection', [collId])).get(collId);
      schema = c && c.schema;
    }
    if (!schema) throw new Error('この DB の項目を読めませんでした');
    const viewRec = (await records('collection_view', [v.viewId])).get(v.viewId);
    const tp = viewRec && viewRec.format && (viewRec.format.table_properties || viewRec.format.gallery_properties || viewRec.format.board_properties || viewRec.format.list_properties);
    let pids = Array.isArray(tp) ? tp.filter((x) => x && x.visible !== false && schema[x.property]).map((x) => x.property) : [];
    if (!Object.keys(schema).some((k) => schema[k].type === 'title')) schema = Object.assign({ title: { name: (Array.isArray(tp) && tp.find((x) => x && x.property === 'title') && 'Name') || 'Name', type: 'title' } }, schema);   // 項目の定義に題字が無い DB もある
    const titleKey = Object.keys(schema).find((k) => schema[k].type === 'title') || 'title';
    if (!pids.includes(titleKey) && schema[titleKey]) pids.unshift(titleKey);
    pids = pids.filter((k) => schema[k]);
    if (opts.allProps) for (const k of Object.keys(schema)) if (!pids.includes(k)) pids.push(k);
    const widths = {};
    if (Array.isArray(tp)) for (const x of tp) if (x && x.width) widths[x.property] = x.width;
    const cols = pids.map((pid) => ({ pid, name: schema[pid].name || pid, type: schema[pid].type, def: schema[pid], width: widths[pid] }));
    /* 人・リレーションの名前 */
    const recOf = (id) => unwrap(blocks[id]);
    const relIds = new Set(), userIds = new Set();
    const rowsRaw = [...new Set(order)].map(recOf).filter(Boolean);
    for (const r of rowsRaw) for (const c of cols) {
      const val = r.properties && r.properties[c.pid];
      if (c.type === 'relation') mentions(val, 'p').forEach((x) => relIds.add(x));
      if (c.type === 'person') mentions(val, 'u').forEach((x) => userIds.add(x));
      if (c.type === 'created_by') userIds.add(r.created_by_id); if (c.type === 'last_edited_by') userIds.add(r.last_edited_by_id);
    }
    const need = [...relIds].filter((id) => !blocks[id]);
    const relRecs = need.length ? await records('block', need) : new Map();
    const users = userIds.size ? await records('notion_user', [...userIds]) : new Map();
    const prc = j.propertyResultCache || {};
    const ctx = {
      title: (id) => { const b = recOf(id) || relRecs.get(id); return b ? plainRT(b.properties && b.properties.title) || '無題' : '…'; },
      user: (id) => { const u = users.get(id) || unwrap((rm.notion_user || {})[id]); return u ? (u.name || [u.given_name, u.family_name].filter(Boolean).join(' ') || u.email || '?') : ''; },
      cache: (rid, pid) => { const row = prc[rid]; if (!row) return undefined; const k = Object.keys(row).find((x) => x.split(':')[0] === pid); return k ? cacheVal(row[k]) : undefined; }
    };
    const rows = [...new Set(order)].map((id) => {
      const rec = recOf(id);
      if (!rec) return null;
      return { id, rec, group: groupOf.get(id) || null, vals: cols.map((c) => readProp(rec, c.pid, c.def, ctx)) };
    }).filter(Boolean);
    const spaceId = (rowsRaw[0] && rowsRaw[0].space_id) || (coll && coll.space_id) || '';
    return { view: v, viewRec, viewName: (viewRec && viewRec.name) || '', collId, spaceId, schema, cols, rows, ctx, more: anyMore(j) };
  }

  /* ============================================================
   *  5. シート（⌃⌥E）— ビューを丸ごと写した表計算
   *     1 行目 ＝ 列の名前（Excel の表と同じ）。2 行目から ＝ ビューの行。
   *     列 A, B, C … ＝ ビューのプロパティ、その右に計算の列。
   *     [@列名] ＝ その行の値、[列名] ＝ 列全体、A2・B2:B9・C:C ＝ セルの場所、メモ!A1 ＝ メモのセル
   * ============================================================ */
  const SHEETS = store.get(K.sheets, {});   // viewId → { calc:[{name, f, fmt}], cf:[...], agg:{col: 'sum'}, memo:{ 'A1': '=…' }, fmt:{} }
  const saveSheets = () => store.set(K.sheets, SHEETS);
  const sheetCfg = (vid) => (SHEETS[vid] = Object.assign({ calc: [], cf: [], agg: {}, memo: {}, fmt: {} }, SHEETS[vid] || {}));
  let SH = null;   // 開いているシート { data, cfg, el, sel, … }

  /* セルの値（計算の列は遅延評価・循環を検出） */
  function makeModel(data, cfg) {
    const nCols = data.cols.length;
    const calc = cfg.calc;
    const W = nCols + calc.length;
    const H = data.rows.length + 1;
    const cache = new Map();
    const busy = new Set();
    const colIndex = (name) => {
      const n = norm(name).toLowerCase();
      let i = data.cols.findIndex((c) => norm(c.name).toLowerCase() === n);
      if (i < 0) { const j = calc.findIndex((c) => norm(c.name).toLowerCase() === n); if (j >= 0) i = nCols + j; }
      if (i < 0) i = data.cols.findIndex((c) => norm(c.name).toLowerCase().replace(/[.\s]/g, '') === n.replace(/[.\s]/g, ''));
      return i;
    };
    function cell(r, c) {   // r: 1 始まり（1 = 見出し）, c: 1 始まり
      if (r === 1) return c <= nCols ? data.cols[c - 1].name : (calc[c - nCols - 1] || {}).name || '';
      const row = data.rows[r - 2];
      if (!row) return '';
      if (c <= nCols) return row.vals[c - 1];
      const k = r + ':' + c;
      if (cache.has(k)) return cache.get(k);
      if (busy.has(k)) return ENGINE.E.REF('計算が循環しています');
      const def = calc[c - nCols - 1];
      if (!def) return '';
      busy.add(k);
      const v = ENGINE.run(def.f, ctxFor(r));
      busy.delete(k);
      cache.set(k, v);
      return v;
    }
    function range(ref, rowNow) {
      if (ref.sheet && /^(メモ|memo)$/i.test(ref.sheet)) return memoRange(ref);
      const r1 = ref.r1, r2 = ref.r2 == null ? ref.r1 : Math.min(ref.r2, H), c1 = ref.c1, c2 = ref.c2 == null ? ref.c1 : Math.min(ref.c2, W);
      if (ref.r2 == null && ref.c2 == null) return cell(r1, c1);
      const out = [];
      for (let r = r1; r <= r2; r++) { const row = []; for (let c = c1; c <= c2; c++) row.push(cell(r, c)); out.push(row); }
      return out;
    }
    const memoCache = new Map(), memoBusy = new Set();
    function memoCell(r, c) {
      const k = ENGINE.colName(c) + r;
      if (memoCache.has(k)) return memoCache.get(k);
      if (memoBusy.has(k)) return ENGINE.E.REF('循環');
      const src = cfg.memo[k];
      if (src == null || src === '') return '';
      memoBusy.add(k);
      const v = ENGINE.run(src, memoCtx());
      memoBusy.delete(k);
      memoCache.set(k, v);
      return v;
    }
    function memoRange(ref) {
      if (ref.r2 == null && ref.c2 == null) return memoCell(ref.r1, ref.c1);
      const out = []; const r2 = ref.r2 === Infinity ? 200 : ref.r2, c2 = ref.c2 == null ? ref.c1 : ref.c2;
      for (let r = ref.r1; r <= r2; r++) { const row = []; for (let c = ref.c1; c <= c2; c++) row.push(memoCell(r, c)); out.push(row); }
      return out;
    }
    function colValues(i) { const out = []; for (let r = 2; r <= H; r++) out.push([cell(r, i + 1)]); return out; }
    function ctxFor(r) {
      return {
        ref: (ref) => (ref.sheet && /^(メモ|memo)$/i.test(ref.sheet) ? memoRange(ref) : range(ref, r)),
        col: (name, soft) => {
          const at = name.startsWith('@'); const nm = at ? name.slice(1) : name;
          if (nm === '#行' || nm === '#row') return r - 1;
          if (nm === '#id') return (data.rows[r - 2] || {}).id || '';
          if (nm === '#グループ' || nm === '#group') { const g = (data.rows[r - 2] || {}).group; return g ? groupLabel(g, data) : ''; }
          const i = colIndex(nm);
          if (i < 0) return soft ? undefined : ENGINE.E.REF('「' + nm + '」という列はありません');
          return at ? cell(r, i + 1) : colValues(i);
        }
      };
    }
    function memoCtx() {
      return {
        ref: (ref) => (ref.sheet && !/^(メモ|memo)$/i.test(ref.sheet) ? range(ref) : memoRange(ref)),
        col: (name, soft) => { const nm = name.replace(/^@/, ''); const i = colIndex(nm); if (i < 0) return soft ? undefined : ENGINE.E.REF('「' + nm + '」という列はありません'); return colValues(i); }
      };
    }
    return { W, H, nCols, cell, range, colIndex, colValues, ctxFor, memoCell, memoCtx, reset: () => { cache.clear(); memoCache.clear(); } };
  }
  function groupLabel(g, data) {
    if (!g) return '';
    const v = g.value;
    if (v && typeof v === 'object' && v.id) return data.ctx.title(v.id);
    if (v && typeof v === 'object' && v.start_date) return v.start_date;
    return v == null ? '（なし）' : String(v);
  }

  /* ---------- 表示 ---------- */
  const SHEET_CSS = `
#s38-sheet { position: fixed; inset: 18px; z-index: 2147483300; display: flex; flex-direction: column; border-radius: 14px; overflow: hidden;
  background: var(--lm-raised, var(--c-bacEle, #fff)); color: var(--lm-ink, var(--c-texPri, #2c2c2b));
  box-shadow: 0 30px 80px rgba(0,0,0,.3), 0 0 0 1px var(--lm-line, rgba(0,0,0,.1)); font: 13px/1.4 var(--cordi-ui, var(--cordi-ui-fallback, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif));
  animation: s38-in .22s cubic-bezier(.2,.8,.2,1); }
@keyframes s38-in { from { opacity: 0; transform: scale(.985) translateY(8px); } to { opacity: 1; transform: none; } }
#s38-sheet * { box-sizing: border-box; }
#s38-sheet .hd { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--lm-line-soft, rgba(0,0,0,.08)); flex-wrap: wrap; }
#s38-sheet .hd .tt { font: 600 17px/1.2 "Cormorant Garamond", "Hoefler Text", Georgia, serif; letter-spacing: .03em; margin-inline-end: 6px; }
#s38-sheet .hd .sub { color: var(--lm-mute, #888); font-size: 12px; margin-inline-end: auto; }
#s38-sheet .b { border: 1px solid var(--lm-line, rgba(0,0,0,.12)); background: var(--lm-sheet, #fff); color: inherit; border-radius: 8px; padding: 5px 10px; font: inherit; font-size: 12.5px; cursor: pointer; white-space: nowrap; }
#s38-sheet .b:hover { border-color: var(--lm-accent, #2783de); }
#s38-sheet .b.pri { background: var(--lm-accent, #2783de); color: var(--lm-on-accent, #fff); border-color: transparent; }
#s38-sheet .fx { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-bottom: 1px solid var(--lm-line-soft, rgba(0,0,0,.08)); }
#s38-sheet .fx .nm { width: 86px; text-align: center; font: 12px ui-monospace, Menlo, monospace; color: var(--lm-mute, #888); border: 1px solid var(--lm-line, rgba(0,0,0,.12)); border-radius: 6px; padding: 4px; }
#s38-sheet .fx i { font: italic 600 14px Georgia, serif; color: var(--lm-accent, #2783de); }
#s38-sheet .fx input { flex: 1; font: 13px ui-monospace, Menlo, "Hiragino Sans", monospace; border: 1px solid var(--lm-line, rgba(0,0,0,.12)); border-radius: 6px; padding: 5px 8px; background: var(--lm-sheet, #fff); color: inherit; }
#s38-sheet .fx .msg { color: var(--lm-mute, #888); font-size: 12px; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#s38-sheet .grid { flex: 1; overflow: auto; position: relative; outline: none; background: var(--lm-sheet, #fff); }
#s38-sheet .gin { position: relative; }
#s38-sheet .c { position: absolute; height: 28px; padding: 5px 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  border-right: 1px solid var(--lm-line-hair, rgba(0,0,0,.05)); border-bottom: 1px solid var(--lm-line-hair, rgba(0,0,0,.06)); cursor: cell; }
#s38-sheet .c.n { text-align: right; font-variant-numeric: tabular-nums; }
#s38-sheet .c.err { color: #c0392b; }
#s38-sheet .c.calc { background: color-mix(in srgb, var(--lm-accent, #2783de) 5%, transparent); }
#s38-sheet .c.ro { color: color-mix(in srgb, currentColor 78%, transparent); }
#s38-sheet .h { z-index: 3; height: 30px; background: var(--lm-tint, #f7f6f3); font-weight: 600; font-size: 12px; color: var(--lm-mute, #777); }
#s38-sheet .h .tag { font-weight: 400; font-size: 10px; opacity: .7; margin-inline-start: 4px; }
#s38-sheet .h.calc { color: var(--lm-accent, #2783de); }
#s38-sheet .rn { z-index: 2; width: 46px; text-align: right; color: var(--lm-mute, #999); background: var(--lm-tint, #f7f6f3); font-size: 11px; cursor: default; }
#s38-sheet .corner { z-index: 4; background: var(--lm-tint, #f7f6f3); }
#s38-sheet .gl { position: absolute; z-index: 1; font-size: 11px; font-weight: 700; letter-spacing: .06em; color: var(--lm-accent, #2783de); padding: 6px 8px 0 54px; height: 26px; border-bottom: 1px solid var(--lm-line-soft, rgba(0,0,0,.08)); background: color-mix(in srgb, var(--lm-accent, #2783de) 4%, var(--lm-sheet, #fff)); }
#s38-sheet .selbox { position: absolute; z-index: 5; pointer-events: none; border: 2px solid var(--lm-accent, #2783de); background: color-mix(in srgb, var(--lm-accent, #2783de) 8%, transparent); border-radius: 2px; }
#s38-sheet .ed { position: absolute; z-index: 6; height: 28px; font: inherit; border: 2px solid var(--lm-accent, #2783de); padding: 4px 6px; background: var(--lm-raised, #fff); color: inherit; outline: none; box-shadow: 0 6px 18px rgba(0,0,0,.18); }
#s38-sheet .ft { display: flex; align-items: center; gap: 14px; padding: 6px 14px; border-top: 1px solid var(--lm-line-soft, rgba(0,0,0,.08)); color: var(--lm-mute, #888); font-size: 12px; }
#s38-sheet .ft .tabs { display: flex; gap: 4px; margin-inline-end: auto; }
#s38-sheet .ft .tabs button { border: 0; background: transparent; color: inherit; padding: 4px 10px; border-radius: 6px; cursor: pointer; font: inherit; }
#s38-sheet .ft .tabs button.on { background: var(--lm-accent-soft, rgba(39,131,222,.1)); color: var(--lm-ink, #222); font-weight: 600; }
#s38-sheet .ft b { color: var(--lm-ink, #333); font-weight: 600; font-variant-numeric: tabular-nums; }
#s38-sheet .bar { position: absolute; left: 0; top: 4px; bottom: 4px; border-radius: 3px; opacity: .55; pointer-events: none; }
#s38-sheet .cf-ic { margin-inline-end: 4px; }
.s38-dlg { position: fixed; z-index: 2147483400; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(720px, 92vw); max-height: 86vh; overflow: auto; border-radius: 14px; padding: 18px 20px;
  background: var(--lm-raised, var(--c-bacEle, #fff)); color: var(--lm-ink, var(--c-texPri, #2c2c2b)); box-shadow: 0 30px 80px rgba(0,0,0,.35), 0 0 0 1px var(--lm-line, rgba(0,0,0,.1));
  font: 13px/1.55 var(--cordi-ui, var(--cordi-ui-fallback, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif)); }
.s38-dlg h3 { margin: 0 0 4px; font: 600 18px/1.3 "Cormorant Garamond", Georgia, serif; }
.s38-dlg p.d { margin: 0 0 12px; color: var(--lm-mute, #888); font-size: 12.5px; }
.s38-dlg label.r { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
.s38-dlg label.r > span:first-child { width: 120px; flex: none; color: var(--lm-mute, #777); font-size: 12.5px; }
.s38-dlg input[type=text], .s38-dlg input[type=number], .s38-dlg select, .s38-dlg textarea { flex: 1; font: inherit; border: 1px solid var(--lm-line, rgba(0,0,0,.14)); border-radius: 8px; padding: 6px 8px; background: var(--lm-sheet, #fff); color: inherit; }
.s38-dlg textarea { width: 100%; min-height: 160px; font: 12.5px/1.5 ui-monospace, Menlo, monospace; }
.s38-dlg .btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px; }
.s38-dlg .b { border: 1px solid var(--lm-line, rgba(0,0,0,.12)); background: var(--lm-sheet, #fff); color: inherit; border-radius: 8px; padding: 6px 12px; font: inherit; cursor: pointer; }
.s38-dlg .b.pri { background: var(--lm-accent, #2783de); color: var(--lm-on-accent, #fff); border-color: transparent; }
.s38-dlg table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin-top: 8px; }
.s38-dlg td, .s38-dlg th { padding: 5px 8px; border-bottom: 1px solid var(--lm-line-hair, rgba(0,0,0,.06)); text-align: left; vertical-align: top; }
.s38-dlg th { color: var(--lm-mute, #888); font-weight: 600; font-size: 11.5px; }
.s38-dlg td.old { color: var(--lm-mute, #999); text-decoration: line-through; text-decoration-color: rgba(192,57,43,.5); }
.s38-dlg td.new { color: var(--lm-accent-ink, #1f5fbf); font-weight: 600; }
.s38-dlg .chip { display: inline-block; padding: 1px 8px; border-radius: 999px; background: var(--lm-accent-soft, rgba(39,131,222,.1)); font-size: 11.5px; margin: 2px; }
.s38-dlg .step { border: 1px solid var(--lm-line, rgba(0,0,0,.1)); border-radius: 10px; padding: 8px 10px; margin: 8px 0; }
.s38-dlg .step .sh { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.s38-dlg .step .sh .x { margin-inline-start: auto; }
.s38-veil { position: fixed; inset: 0; z-index: 2147483390; background: rgba(0,0,0,.18); }
#s38-toast { position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%); z-index: 2147483500; padding: 9px 16px; border-radius: 999px; background: var(--lm-ink, #222); color: var(--lm-bg, #fff);
  font: 12.5px/1.4 var(--cordi-ui, var(--cordi-ui-fallback, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif)); box-shadow: 0 10px 28px rgba(0,0,0,.25); transition: opacity .25s; pointer-events: auto; display: flex; gap: 10px; align-items: center; }
#s38-toast button { border: 0; background: rgba(255,255,255,.18); color: inherit; border-radius: 999px; padding: 3px 10px; cursor: pointer; font: inherit; }`;
  function css() { addCss(); if (document.getElementById('s38-css')) return; const st = document.createElement('style'); st.id = 's38-css'; st.textContent = SHEET_CSS; document.head.appendChild(st); }
  function toast(msg, act) {
    let t = document.getElementById('s38-toast');
    if (!t) { t = document.createElement('div'); t.id = 's38-toast'; document.body.appendChild(t); }
    t.innerHTML = '<span></span>'; t.firstChild.textContent = msg;
    if (act) { const b = document.createElement('button'); b.textContent = act[0]; b.onclick = () => { t.style.opacity = '0'; act[1](); }; t.appendChild(b); }
    t.style.opacity = '1';
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.style.opacity = '0'; }, act ? 7000 : 2600);
  }
  const NUMERIC = new Set(['number', 'date', 'created_time', 'last_edited_time']);
  function fmtCell(v, col, cfg) {
    if (ENGINE.isErr(v)) return v.code;
    const f = (cfg.fmt || {})[col.key];
    if (f) return ENGINE.textFmt(v, f);
    if (col.type === 'date' || col.type === 'created_time' || col.type === 'last_edited_time') {
      if (typeof v === 'number') return ENGINE.textFmt(v, v % 1 ? 'yyyy-mm-dd hh:mm' : 'yyyy-mm-dd');
    }
    if (typeof v === 'boolean') return v ? '✓' : '';
    return ENGINE.show(v);
  }

  async function openSheet(viewEl, given) {
    css();
    if (SH) closeSheet();
    const v = given || findView(viewEl);
    if (!v || !v.viewId) { toast('DB のビューが見つかりません（表の上で ⌃⌥E）'); return; }
    toast('シートを開いています…');
    let data;
    try { data = await loadView(v); } catch (e) { toast('読めませんでした: ' + e.message); ST.lastError = e.message; return; }
    const cfg = sheetCfg(v.viewId);
    const el = document.createElement('div');
    el.id = 's38-sheet';
    el.innerHTML = `<div class="hd"><span class="tt">Scholar Sheet</span><span class="sub"></span>
      <button class="b" data-a="calc" title="Excel の数式で列を足す">＋ 計算の列</button>
      <button class="b" data-a="cf" title="色の段階・データバー・印">条件付き書式</button>
      <button class="b" data-a="write" title="計算の列の結果を Notion のプロパティへ">書き戻す</button>
      <button class="b" data-a="macro">マクロ</button>
      <button class="b" data-a="tsv" title="Excel・スプレッドシートに貼れる形で写す">TSV を写す</button>
      <button class="b" data-a="csv">CSV</button>
      <button class="b" data-a="reload">読み直す</button>
      <button class="b" data-a="help">？</button>
      <button class="b" data-a="close">閉じる（Esc）</button></div>
      <div class="fx"><span class="nm">A1</span><i>fx</i><input spellcheck="false" placeholder="セルを選ぶと値・式が出ます。計算の列の見出しを選ぶと式を直せます"><span class="msg"></span></div>
      <div class="grid" tabindex="0"><div class="gin"></div></div>
      <div class="ft"><div class="tabs"><button data-tab="data" class="on">データ</button><button data-tab="memo">メモ</button></div><span class="stat"></span></div>`;
    document.body.appendChild(el);
    SH = { data, cfg, el, v, tab: 'data', sel: { r1: 2, c1: 1, r2: 2, c2: 1 }, model: null, colW: [], colX: [] };
    rebuild();
    el.querySelector('.hd .sub').textContent = (data.viewName ? data.viewName + '・' : '') + data.rows.length + ' 行・' + data.cols.length + ' 列' + (data.more ? '（一部）' : '');
    el.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => sheetAction(b.dataset.a); });
    el.querySelectorAll('.ft .tabs button').forEach((b) => { b.onclick = () => { SH.tab = b.dataset.tab; el.querySelectorAll('.ft .tabs button').forEach((x) => x.classList.toggle('on', x === b)); SH.sel = { r1: 2, c1: 1, r2: 2, c2: 1 }; rebuild(); }; });
    const grid = el.querySelector('.grid');
    grid.addEventListener('scroll', () => paint(), { passive: true });
    grid.addEventListener('mousedown', gridDown);
    grid.addEventListener('dblclick', (e) => { const p = hit(e); if (p) startEdit(p.r, p.c); });
    grid.addEventListener('keydown', gridKey);
    grid.addEventListener('copy', (e) => { e.preventDefault(); e.clipboardData.setData('text/plain', selTSV()); toast('写しました（' + selCount() + ' セル）'); });
    grid.addEventListener('paste', (e) => { e.preventDefault(); pasteTSV(e.clipboardData.getData('text/plain')); });
    const fx = el.querySelector('.fx input');
    fx.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commitFx(fx.value); grid.focus(); } else if (e.key === 'Escape') { showSel(); grid.focus(); } });
    grid.focus();
    applyCfToNotion();
  }
  function closeSheet() { if (!SH) return; SH.el.remove(); document.querySelectorAll('.s38-dlg, .s38-veil').forEach((x) => x.remove()); SH = null; }
  function rebuild() {
    SH.model = makeModel(SH.data, SH.cfg);
    const m = SH.model;
    const W = SH.tab === 'data' ? m.W : Math.max(12, ...Object.keys(SH.cfg.memo).map((k) => ENGINE.colNum(k.replace(/\d+$/, ''))));
    SH.colW = [];
    for (let c = 1; c <= W; c++) {
      if (SH.tab !== 'data') { SH.colW.push(120); continue; }
      const col = colMeta(c);
      SH.colW.push(Math.max(70, Math.min(320, col.width ? col.width * 0.8 : col.type === 'title' ? 220 : col.calc ? 140 : NUMERIC.has(col.type) || col.type === 'checkbox' ? 96 : 150)));
    }
    SH.colX = [46];
    for (const w of SH.colW) SH.colX.push(SH.colX[SH.colX.length - 1] + w);
    SH.rowsY = null;
    /* グループの帯（データの時だけ）: グループが変わる行の上に 26px の帯 */
    if (SH.tab === 'data') {
      const y = [30];
      let prev = null;
      SH.bands = [];
      SH.data.rows.forEach((row, i) => {
        const key = row.group ? JSON.stringify(row.group.value) : null;
        if (key !== prev && row.group) { SH.bands.push({ y: y[y.length - 1], label: groupLabel(row.group, SH.data) }); y[y.length - 1] += 26; }
        prev = key;
        y.push(y[y.length - 1] + 28);
      });
      SH.rowsY = y;   // rowsY[i] = データ i 行目（0 始まり）の上端
    } else SH.bands = [];
    paint(true);
  }
  function colMeta(c) {
    const m = SH.model;
    if (c <= m.nCols) { const col = SH.data.cols[c - 1]; return { key: col.pid, name: col.name, type: col.type, def: col.def, width: col.width, ro: !WRITABLE.has(col.type) }; }
    const cd = SH.cfg.calc[c - m.nCols - 1] || {};
    return { key: 'calc:' + cd.name, name: cd.name, type: 'calc', calc: true, ro: true, f: cd.f };
  }
  const rowTop = (r) => (SH.tab === 'data' ? (r === 1 ? 0 : SH.rowsY[r - 2]) : (r - 1) * 28 + 30 - 28 * (r > 0 ? 0 : 0));
  const rowsCount = () => (SH.tab === 'data' ? SH.model.H : 200);
  function paint(full) {
    if (!SH) return;
    const grid = SH.el.querySelector('.grid'), gin = SH.el.querySelector('.gin');
    const m = SH.model;
    const H = rowsCount(), W = SH.colW.length;
    const totalH = SH.tab === 'data' ? SH.rowsY[SH.rowsY.length - 1] + 40 : 30 + 200 * 28;
    gin.style.height = totalH + 'px'; gin.style.width = (SH.colX[SH.colX.length - 1] + 40) + 'px';
    const top = grid.scrollTop - 200, bot = grid.scrollTop + grid.clientHeight + 200;
    const sT = grid.scrollTop, sL = grid.scrollLeft;   // 見出しの段と行番号は、スクロールに合わせて自分で動かす（固定の代わり）
    let h = '<div class="c corner" style="left:' + sL + 'px;top:' + sT + 'px;width:46px;height:30px"></div>';
    /* 見出し */
    for (let c = 1; c <= W; c++) {
      const meta = SH.tab === 'data' ? colMeta(c) : { name: '' };
      h += '<div class="c h' + (meta.calc ? ' calc' : '') + '" data-r="1" data-c="' + c + '" style="left:' + SH.colX[c - 1] + 'px;top:' + sT + 'px;width:' + SH.colW[c - 1] + 'px;height:30px" title="' + esc(meta.f || meta.name) + '">' + ENGINE.colName(c) + ' ' + esc(SH.tab === 'data' ? meta.name : '') + (SH.tab === 'data' && !meta.calc ? '<span class="tag">' + esc(TYPE_JA[meta.type] || meta.type) + '</span>' : '') + '</div>';
    }
    /* 帯 */
    for (const b of SH.bands) if (b.y + 26 > top && b.y < bot) h += '<div class="gl" style="left:0;top:' + b.y + 'px;width:' + SH.colX[SH.colX.length - 1] + 'px">' + esc(b.label) + '</div>';
    /* 行 */
    const cf = SH.tab === 'data' ? cfPrepare() : null;
    for (let r = 2; r <= H; r++) {
      const y = SH.tab === 'data' ? SH.rowsY[r - 2] : 30 + (r - 2) * 28;
      if (y + 28 < top) continue;
      if (y > bot) break;
      h += '<div class="c rn" style="left:' + sL + 'px;top:' + y + 'px;height:28px">' + r + '</div>';
      for (let c = 1; c <= W; c++) {
        let v, meta, cls = 'c';
        if (SH.tab === 'data') { v = m.cell(r, c); meta = colMeta(c); if (meta.calc) cls += ' calc'; else if (meta.ro) cls += ' ro'; }
        else { v = m.memoCell(r - 1, c); meta = { type: 'memo', key: 'memo' }; }
        const err = ENGINE.isErr(v);
        if (err) cls += ' err';
        if (typeof v === 'number' || (meta.type === 'number')) cls += ' n';
        let style = 'left:' + SH.colX[c - 1] + 'px;top:' + y + 'px;width:' + SH.colW[c - 1] + 'px';
        let pre = '', bar = '';
        if (cf) { const d = cf(r, c, v); if (d) { if (d.bg) style += ';background:' + d.bg; if (d.color) style += ';color:' + d.color; if (d.bold) style += ';font-weight:700'; if (d.icon) pre = '<span class="cf-ic" style="color:' + d.iconColor + '">' + d.icon + '</span>'; if (d.bar != null) bar = '<span class="bar" style="width:' + (d.bar * 100).toFixed(1) + '%;background:' + d.barColor + '"></span>'; } }
        const txt = SH.tab === 'data' ? fmtCell(v, meta, SH.cfg) : (err ? v.code : ENGINE.show(v));
        h += '<div class="' + cls + '" data-r="' + r + '" data-c="' + c + '" style="' + style + '" title="' + esc(err ? v.code + '：' + v.msg : txt) + '">' + bar + pre + esc(txt) + '</div>';
      }
    }
    gin.innerHTML = h;
    drawSel();
    if (full) showSel();
  }
  const TYPE_JA = { title: '題字', text: '文字', number: '数', select: '選択', status: '状態', multi_select: '複数選択', checkbox: '✓', date: '日付', person: '人', relation: '関係', formula: '式', rollup: '集計', url: 'URL', email: 'メール', phone_number: '電話', created_time: '作成日', last_edited_time: '更新日', created_by: '作成者', last_edited_by: '更新者', file: 'ファイル', calc: '計算' };
  function cellRect(r, c) {
    const x = SH.colX[c - 1], w = SH.colW[c - 1];
    const y = r === 1 ? 0 : (SH.tab === 'data' ? SH.rowsY[r - 2] : 30 + (r - 2) * 28);
    return { x, y, w, h: r === 1 ? 30 : 28 };
  }
  function drawSel() {
    const gin = SH.el.querySelector('.gin');
    let b = gin.querySelector('.selbox');
    if (!b) { b = document.createElement('div'); b.className = 'selbox'; gin.appendChild(b); }
    const s = normSel();
    const a = cellRect(s.r1, s.c1), z = cellRect(s.r2, s.c2);
    b.style.left = a.x + 'px'; b.style.top = a.y + 'px'; b.style.width = (z.x + z.w - a.x) + 'px'; b.style.height = (z.y + z.h - a.y) + 'px';
  }
  const normSel = () => { const s = SH.sel; return { r1: Math.min(s.r1, s.r2), r2: Math.max(s.r1, s.r2), c1: Math.min(s.c1, s.c2), c2: Math.max(s.c1, s.c2) }; };
  const selCount = () => { const s = normSel(); return (s.r2 - s.r1 + 1) * (s.c2 - s.c1 + 1); };
  function showSel() {
    if (!SH) return;
    const s = SH.sel, m = SH.model;
    const nm = ENGINE.colName(s.c1) + s.r1 + (s.r1 !== s.r2 || s.c1 !== s.c2 ? ':' + ENGINE.colName(s.c2) + s.r2 : '');
    SH.el.querySelector('.fx .nm').textContent = (SH.tab === 'memo' ? 'メモ!' : '') + nm;
    const fx = SH.el.querySelector('.fx input'), msg = SH.el.querySelector('.fx .msg');
    msg.textContent = '';
    if (SH.tab === 'memo') { fx.value = SH.cfg.memo[ENGINE.colName(s.c1) + (s.r1 - 1)] || ''; }
    else {
      const meta = colMeta(s.c1);
      if (s.r1 === 1 && meta.calc) { fx.value = meta.f; msg.textContent = '計算の列「' + meta.name + '」の式（Enter で直す）'; }
      else {
        const v = m.cell(s.r1, s.c1);
        fx.value = ENGINE.isErr(v) ? v.code : (meta.type === 'date' && typeof v === 'number' ? ENGINE.textFmt(v, 'yyyy-mm-dd') : ENGINE.show(v));
        if (ENGINE.isErr(v)) msg.textContent = v.msg;
        else if (s.r1 > 1 && meta.ro) msg.textContent = meta.calc ? '計算の結果（書き戻すには「書き戻す」）' : '読み取り専用の列';
      }
    }
    /* ステータス: 個数・合計・平均・最小・最大 */
    const vals = [];
    for (let r = Math.min(s.r1, s.r2); r <= Math.max(s.r1, s.r2); r++) for (let c = Math.min(s.c1, s.c2); c <= Math.max(s.c1, s.c2); c++) { if (r === 1 && SH.tab === 'data') continue; vals.push(SH.tab === 'data' ? m.cell(r, c) : m.memoCell(r - 1, c)); }
    const ns = vals.filter((x) => typeof x === 'number');
    const st = SH.el.querySelector('.ft .stat');
    st.innerHTML = vals.length > 1 ? '個数 <b>' + vals.filter((x) => x !== '' && x != null).length + '</b>' + (ns.length ? '　合計 <b>' + ENGINE.show(ns.reduce((a, b) => a + b, 0)) + '</b>　平均 <b>' + ENGINE.show(Math.round(ns.reduce((a, b) => a + b, 0) / ns.length * 1000) / 1000) + '</b>　最小 <b>' + ENGINE.show(Math.min(...ns)) + '</b>　最大 <b>' + ENGINE.show(Math.max(...ns)) + '</b>' : '') : (SH.tab === 'data' ? SH.data.rows.length + ' 行' : 'メモ: 自由なセル。=SUM(データ!C:C) のようにデータを参照できます');
  }
  function hit(e) {
    const t = e.target.closest && e.target.closest('[data-r]');
    if (!t) return null;
    return { r: +t.dataset.r, c: +t.dataset.c };
  }
  function gridDown(e) {
    if (e.target.classList.contains('ed')) return;
    const p = hit(e);
    if (!p) return;
    e.preventDefault();
    SH.el.querySelector('.grid').focus();
    if (e.shiftKey) { SH.sel.r2 = p.r; SH.sel.c2 = p.c; }
    else SH.sel = { r1: p.r, c1: p.c, r2: p.r, c2: p.c };
    drawSel(); showSel();
    const mv = (ev) => { const q = hit(ev); if (q) { SH.sel.r2 = q.r; SH.sel.c2 = q.c; drawSel(); showSel(); } };
    const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
  }
  function gridKey(e) {
    if (!SH || e.target.classList.contains('ed')) return;
    const s = SH.sel, W = SH.colW.length, H = rowsCount();
    const mv = (dr, dc) => { e.preventDefault(); const r = Math.max(1, Math.min(H, (e.shiftKey ? s.r2 : s.r1) + dr)), c = Math.max(1, Math.min(W, (e.shiftKey ? s.c2 : s.c1) + dc)); if (e.shiftKey) { s.r2 = r; s.c2 = c; } else SH.sel = { r1: r, c1: c, r2: r, c2: c }; drawSel(); showSel(); scrollInto(r, c); };
    if (e.key === 'ArrowDown') mv(1, 0); else if (e.key === 'ArrowUp') mv(-1, 0); else if (e.key === 'ArrowLeft') mv(0, -1); else if (e.key === 'ArrowRight' || e.key === 'Tab') mv(0, 1);
    else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); startEdit(s.r1, s.c1); }
    else if (e.key === 'Escape') { e.preventDefault(); closeSheet(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && !e.metaKey) { e.preventDefault(); clearSel(); }
    else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); SH.sel = { r1: 2, c1: 1, r2: H, c2: W }; drawSel(); showSel(); }
    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) { startEdit(s.r1, s.c1, e.key); e.preventDefault(); }
  }
  function scrollInto(r, c) {
    const g = SH.el.querySelector('.grid'), rc = cellRect(r, c);
    if (rc.y < g.scrollTop + 30) g.scrollTop = rc.y - 30; else if (rc.y + rc.h > g.scrollTop + g.clientHeight) g.scrollTop = rc.y + rc.h - g.clientHeight;
    if (rc.x < g.scrollLeft + 46) g.scrollLeft = rc.x - 46; else if (rc.x + rc.w > g.scrollLeft + g.clientWidth) g.scrollLeft = rc.x + rc.w - g.clientWidth;
  }
  function startEdit(r, c, first) {
    if (SH.tab === 'data') {
      const meta = colMeta(c);
      if (r === 1 && meta.calc) { SH.el.querySelector('.fx input').focus(); return; }
      if (r === 1) return;
      if (meta.ro) { toast(meta.calc ? '計算の列は式で決まります（見出しを選んで式を直す）' : '「' + meta.name + '」は読み取り専用の列です'); return; }
    }
    const gin = SH.el.querySelector('.gin');
    const rc = cellRect(r, c);
    const ed = document.createElement('input');
    ed.className = 'ed';
    ed.style.left = rc.x + 'px'; ed.style.top = rc.y + 'px'; ed.style.width = Math.max(rc.w, 160) + 'px';
    const cur = SH.tab === 'data' ? SH.model.cell(r, c) : (SH.cfg.memo[ENGINE.colName(c) + (r - 1)] || '');
    const meta = SH.tab === 'data' ? colMeta(c) : null;
    ed.value = first != null ? first : (SH.tab === 'data' ? (meta.type === 'date' && typeof cur === 'number' ? ENGINE.textFmt(cur, 'yyyy-mm-dd') : typeof cur === 'boolean' ? (cur ? 'TRUE' : 'FALSE') : ENGINE.show(cur)) : cur);
    gin.appendChild(ed);
    ed.focus();
    if (first == null) ed.select();
    let done = false;
    const finish = (ok) => { if (done) return; done = true; const val = ed.value; ed.remove(); SH.el.querySelector('.grid').focus(); if (ok) commitCell(r, c, val); };
    ed.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); finish(true); gridKey({ key: 'ArrowDown', preventDefault() {}, shiftKey: false, target: SH.el.querySelector('.grid') }); } else if (e.key === 'Escape') { e.preventDefault(); finish(false); } else if (e.key === 'Tab') { e.preventDefault(); finish(true); } e.stopPropagation(); });
    ed.addEventListener('blur', () => finish(true));
  }
  function commitFx(val) {
    const s = SH.sel;
    if (SH.tab === 'memo') { commitCell(s.r1, s.c1, val); return; }
    const meta = colMeta(s.c1);
    if (s.r1 === 1 && meta.calc) {
      const cd = SH.cfg.calc[s.c1 - SH.model.nCols - 1];
      cd.f = val.startsWith('=') ? val : '=' + val;
      saveSheets(); rebuild(); applyCfToNotion(); return;
    }
    commitCell(s.r1, s.c1, val);
  }
  /* 値をセルへ（データ: Notion へ書く／メモ: 保存するだけ） */
  async function commitCell(r, c, raw) {
    if (SH.tab === 'memo') { const k = ENGINE.colName(c) + (r - 1); if (raw === '') delete SH.cfg.memo[k]; else SH.cfg.memo[k] = raw; saveSheets(); SH.model.reset(); paint(); showSel(); return; }
    const meta = colMeta(c);
    if (meta.ro || r < 2) return;
    const row = SH.data.rows[r - 2];
    let val = raw;
    if (/^=/.test(raw)) val = ENGINE.run(raw, SH.model.ctxFor(r));   // 式を打ったら、その結果を書く（Excel の「値として貼り付け」）
    else if (meta.type === 'number' || meta.type === 'date') { val = raw.trim() === '' ? '' : ENGINE.num(raw); }
    else if (meta.type === 'checkbox') val = ENGINE.bool(raw);
    await writeCells([{ row, col: SH.data.cols[c - 1], val }], '「' + meta.name + '」を書き換え');
  }
  async function clearSel() {
    if (SH.tab === 'memo') { const s = normSel(); for (let r = s.r1; r <= s.r2; r++) for (let c = s.c1; c <= s.c2; c++) delete SH.cfg.memo[ENGINE.colName(c) + (r - 1)]; saveSheets(); SH.model.reset(); paint(); return; }
    const s = normSel(); const list = [];
    for (let r = Math.max(2, s.r1); r <= s.r2; r++) for (let c = s.c1; c <= s.c2; c++) { const meta = colMeta(c); if (!meta.ro) list.push({ row: SH.data.rows[r - 2], col: SH.data.cols[c - 1], val: '' }); }
    if (!list.length) return;
    if (list.length > 5 && !confirm(list.length + ' 個のセルを空にします（Notion に書き込みます）。よろしいですか？')) return;
    await writeCells(list, '空にする');
  }
  /* ---------- 書き込み（まとめて 1 回・元に戻せる） ---------- */
  const UNDO = store.get(K.undo, []);
  async function writeCells(list, label, opts) {
    opts = opts || {};
    const data = SH ? SH.data : opts.data;
    const ops = [], undo = [];
    for (const it of list) {
      const def = it.col.def;
      let args;
      try { args = toNotion(it.val, def); } catch (e) { toast(e.message); return false; }
      const ptr = { table: 'block', id: it.row.id, spaceId: it.row.rec.space_id || data.spaceId };
      ops.push(...optionOps(def, it.col.pid, data.collId, data.spaceId, [args]));
      undo.push({ ptr, pid: it.col.pid, before: (it.row.rec.properties && it.row.rec.properties[it.col.pid]) || [] });
      ops.push({ pointer: ptr, path: ['properties', it.col.pid], command: 'set', args });
      ops.push({ pointer: ptr, path: [], command: 'update', args: { last_edited_time: Date.now() } });
      it.row.rec.properties = it.row.rec.properties || {};
      it.row.rec.properties[it.col.pid] = args;
      const ci = data.cols.indexOf(it.col);
      if (ci >= 0) it.row.vals[ci] = readProp(it.row.rec, it.col.pid, it.col.def, data.ctx);
    }
    try { await saveOps(ops, data.spaceId, 'c38.write'); }
    catch (e) { toast('書き込めませんでした: ' + e.message); ST.lastError = e.message; return false; }
    UNDO.unshift({ at: Date.now(), label, spaceId: data.spaceId, items: undo });
    if (UNDO.length > 30) UNDO.length = 30;
    store.set(K.undo, UNDO);
    if (SH) { SH.model.reset(); paint(); showSel(); applyCfToNotion(); }
    toast(label + '：' + undo.length + ' か所を書き込みました', ['元に戻す', () => undoLast()]);
    return true;
  }
  async function undoLast(idx) {
    const u = UNDO[idx || 0];
    if (!u) { toast('元に戻せるものがありません'); return; }
    const ops = [];
    for (const it of u.items) {
      ops.push({ pointer: it.ptr, path: ['properties', it.pid], command: 'set', args: it.before });
      ops.push({ pointer: it.ptr, path: [], command: 'update', args: { last_edited_time: Date.now() } });
    }
    try { await saveOps(ops, u.spaceId, 'c38.undo'); } catch (e) { toast('戻せませんでした: ' + e.message); return; }
    UNDO.splice(idx || 0, 1); store.set(K.undo, UNDO);
    toast('「' + u.label + '」を元に戻しました');
    if (SH) sheetAction('reload');
  }
  /* ---------- TSV・CSV ---------- */
  function selTSV(all) {
    const s = all ? { r1: 1, c1: 1, r2: rowsCount(), c2: SH.colW.length } : normSel();
    const lines = [];
    for (let r = s.r1; r <= s.r2; r++) {
      const cols = [];
      for (let c = s.c1; c <= s.c2; c++) { const v = SH.tab === 'data' ? SH.model.cell(r, c) : SH.model.memoCell(r - 1, c); cols.push(String(SH.tab === 'data' && r > 1 ? fmtCell(v, colMeta(c), SH.cfg) : ENGINE.show(v)).replace(/[\t\n]/g, ' ')); }
      lines.push(cols.join('\t'));
    }
    return lines.join('\n');
  }
  function toCSV() {
    const q = (s) => (/[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s);
    return selTSV(true).split('\n').map((l) => l.split('\t').map(q).join(',')).join('\r\n');
  }
  async function pasteTSV(text) {
    if (!text) return;
    const rows = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map((l) => l.split('\t'));
    const s = normSel();
    if (SH.tab === 'memo') { rows.forEach((row, i) => row.forEach((v, j) => { const k = ENGINE.colName(s.c1 + j) + (s.r1 - 1 + i); if (v === '') delete SH.cfg.memo[k]; else SH.cfg.memo[k] = v; })); saveSheets(); SH.model.reset(); paint(); return; }
    const list = [];
    let skipped = 0;
    rows.forEach((row, i) => row.forEach((v, j) => {
      const r = s.r1 + i, c = s.c1 + j;
      if (r < 2 || r > SH.model.H || c > SH.model.nCols) { skipped++; return; }
      const meta = colMeta(c);
      if (meta.ro) { skipped++; return; }
      let val = v;
      if (meta.type === 'number' || meta.type === 'date') val = v.trim() === '' ? '' : ENGINE.num(v);
      else if (meta.type === 'checkbox') val = ENGINE.bool(v);
      list.push({ row: SH.data.rows[r - 2], col: SH.data.cols[c - 1], val });
    }));
    if (!list.length) { toast('貼れるセルがありません（読み取り専用の列・表の外）'); return; }
    if (!confirm(list.length + ' 個のセルに貼り付けます（Notion に書き込みます）' + (skipped ? '。書けないセル ' + skipped + ' 個は飛ばします' : '') + '。よろしいですか？')) return;
    await writeCells(list, '貼り付け');
  }
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: type || 'text/csv' }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ============================================================
   *  6. 条件付き書式（シートと、Notion の表のセルの両方に）
   *     規則: { col: 列の名前, kind: 'scale' | 'bar' | 'icons' | 'rule', from, mid, to, color, f, bold, text }
   * ============================================================ */
  function cfStats(colIdx) {
    const vals = SH.model.colValues(colIdx).map((r) => r[0]).filter((v) => typeof v === 'number');
    if (!vals.length) return null;
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }
  const lerpHex = (a, b, t) => { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); const ch = (v, s) => (v >> s) & 255; const m = (s) => Math.round(ch(x, s) + (ch(y, s) - ch(x, s)) * t); return 'rgb(' + m(16) + ',' + m(8) + ',' + m(0) + ')'; };
  function cfPrepare() {
    const rules = (SH.cfg.cf || []).map((r) => {
      const ci = SH.model.colIndex(r.col);
      if (ci < 0) return null;
      const st = (r.kind === 'scale' || r.kind === 'bar' || r.kind === 'icons') ? cfStats(ci) : null;
      return Object.assign({}, r, { ci, st });
    }).filter(Boolean);
    if (!rules.length) return null;
    return (row, c, v) => {
      let out = null;
      for (const r of rules) {
        if (r.ci !== c - 1) continue;
        if (r.kind === 'rule') {
          const ok = ENGINE.bool(ENGINE.run(r.f, SH.model.ctxFor(row)));
          if (ok === true) out = Object.assign(out || {}, { bg: r.color + '33', color: r.text || undefined, bold: !!r.bold });
        } else if (typeof v === 'number' && r.st) {
          const t = r.st.max === r.st.min ? 1 : (v - r.st.min) / (r.st.max - r.st.min);
          if (r.kind === 'scale') { const mid = r.mid || null; const col = mid ? (t < 0.5 ? lerpHex(r.from, mid, t * 2) : lerpHex(mid, r.to, (t - 0.5) * 2)) : lerpHex(r.from, r.to, t); out = Object.assign(out || {}, { bg: col.replace('rgb', 'rgba').replace(')', ',.38)') }); }
          if (r.kind === 'bar') out = Object.assign(out || {}, { bar: Math.max(0.02, t), barColor: r.color });
          if (r.kind === 'icons') { const k = t >= 0.67 ? 0 : t >= 0.33 ? 1 : 2; out = Object.assign(out || {}, { icon: ['▲', '●', '▼'][k], iconColor: ['#2e9d6a', '#d9a33a', '#c0392b'][k] }); }
        }
      }
      return out;
    };
  }
  /* Notion の表にも同じ色（行の id ＋ 列の位置で CSS を書く。仮想スクロールで行が作り直されても効く） */
  function applyCfToNotion() {
    if (!SH || !P.cfToNotion) return;
    const st = document.getElementById('s38-cf') || Object.assign(document.createElement('style'), { id: 's38-cf' });
    if (!st.parentNode) document.head.appendChild(st);
    const cf = cfPrepare();
    const all = SHEETS.__cfcss || {};
    if (!cf) { delete all[SH.v.viewId]; }
    else {
      let css = '';
      const m = SH.model;
      const nC = SH.data.cols.length;
      SH.data.rows.forEach((row, i) => {
        for (let c = 1; c <= nC; c++) {
          const d = cf(i + 2, c, m.cell(i + 2, c));
          if (!d) continue;
          const sel = '.notion-collection-item[data-block-id="' + row.id + '"] .notion-table-view-cell[data-col-index="' + (c - 1) + '"]';
          if (d.bg) css += sel + '{background:' + d.bg + ' !important;}';
          if (d.bar != null) css += sel + '{background:linear-gradient(90deg,' + d.barColor + '55 ' + (d.bar * 100).toFixed(1) + '%,transparent ' + (d.bar * 100).toFixed(1) + '%) !important;}';
          if (d.icon) css += sel + ' [data-testid="property-value"]::before{content:"' + d.icon + '";color:' + d.iconColor + ';margin-inline-end:4px;}';
          if (d.color) css += sel + ' *{color:' + d.color + ' !important;}';
          if (d.bold) css += sel + ' *{font-weight:700 !important;}';
        }
      });
      all[SH.v.viewId] = css;
    }
    SHEETS.__cfcss = all; saveSheets();
    st.textContent = Object.values(all).join('\n');
  }
  function restoreCf() {
    const all = SHEETS.__cfcss;
    if (!all || !Object.keys(all).length || !P.cfToNotion) return;
    let st = document.getElementById('s38-cf');
    if (!st) { st = document.createElement('style'); st.id = 's38-cf'; document.head.appendChild(st); }
    st.textContent = Object.values(all).join('\n');
  }

  /* ============================================================
   *  7. シートのボタン
   * ============================================================ */
  function dialog(html, onMount) {
    const veil = document.createElement('div'); veil.className = 's38-veil';
    const d = document.createElement('div'); d.className = 's38-dlg'; d.innerHTML = html;
    document.body.append(veil, d);
    const close = () => { veil.remove(); d.remove(); };
    veil.onclick = close;
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    if (onMount) onMount(d, close);
    const f = d.querySelector('input, textarea, select'); if (f) f.focus();
    return { d, close };
  }
  const colOptions = (onlyWritable, includeCalc) => {
    let o = SH.data.cols.filter((c) => !onlyWritable || WRITABLE.has(c.type)).map((c) => '<option value="' + esc(c.name) + '">' + esc(c.name) + '（' + (TYPE_JA[c.type] || c.type) + '）</option>').join('');
    if (includeCalc) o += SH.cfg.calc.map((c) => '<option value="' + esc(c.name) + '">' + esc(c.name) + '（計算）</option>').join('');
    return o;
  };
  async function sheetAction(a) {
    if (!SH) return;
    if (a === 'close') return closeSheet();
    if (a === 'reload') { const keep = SH.sel; const v = SH.v; closeSheet(); await openSheet(null, v); if (SH) { SH.sel = keep; drawSel(); showSel(); } return; }
    if (a === 'tsv') { const t = selCount() > 1 ? selTSV() : selTSV(true); try { await navigator.clipboard.writeText(t); toast('TSV を写しました（Excel・スプレッドシートにそのまま貼れます）'); } catch (e) { download('sheet.tsv', t, 'text/tab-separated-values'); } return; }
    if (a === 'csv') { download((SH.data.viewName || 'notion') + '.csv', toCSV()); return; }
    if (a === 'help') return helpDialog();
    if (a === 'macro') return macroDialog();
    if (a === 'calc') {
      dialog(`<h3>計算の列を足す</h3><p class="d">Excel と同じ書き方。<b>[@列名]</b> はその行の値、<b>[列名]</b> は列全体、<b>A2</b>・<b>C:C</b> はセルの場所。例: <code>=[@Seq.]*100+[@No.]</code>／<code>=IF([@No.]="","未","済")</code>／<code>=COUNTIF([Series],[@Series])</code>（同じシリーズの冊数）／<code>=RANK([@No.],[No.])</code></p>
        <label class="r"><span>列の名前</span><input type="text" data-k="name" value="計算${SH.cfg.calc.length + 1}"></label>
        <label class="r"><span>式</span><input type="text" data-k="f" value="=" spellcheck="false"></label>
        <label class="r"><span>表示の形</span><input type="text" data-k="fmt" placeholder="空 = そのまま／0.0／#,##0／yyyy-mm-dd／0%"></label>
        <p class="d" data-k="pv">見本: </p>
        <div class="btns"><button class="b" data-x>やめる</button><button class="b pri" data-ok>足す</button></div>`, (d, close) => {
        const f = d.querySelector('[data-k="f"]'), pv = d.querySelector('[data-k="pv"]');
        const prev = () => { const v = ENGINE.run(f.value, SH.model.ctxFor(2)); pv.textContent = '見本（1 行目）: ' + (ENGINE.isErr(v) ? v.code + ' ' + v.msg : ENGINE.show(v)); };
        f.addEventListener('input', prev); prev();
        d.querySelector('[data-x]').onclick = close;
        d.querySelector('[data-ok]').onclick = () => {
          const name = norm(d.querySelector('[data-k="name"]').value) || '計算';
          if (SH.model.colIndex(name) >= 0) { alert('同じ名前の列があります'); return; }
          SH.cfg.calc.push({ name, f: f.value.startsWith('=') ? f.value : '=' + f.value });
          const fm = d.querySelector('[data-k="fmt"]').value.trim(); if (fm) SH.cfg.fmt['calc:' + name] = fm;
          saveSheets(); close(); rebuild();
        };
      });
      return;
    }
    if (a === 'cf') {
      const list = () => (SH.cfg.cf || []).map((r, i) => '<div class="step"><div class="sh">' + esc(r.col) + '：' + ({ scale: '色の段階', bar: 'データバー', icons: '印（▲●▼）', rule: '条件に合えば色' }[r.kind]) + (r.f ? ' <code>' + esc(r.f) + '</code>' : '') + '<button class="b x" data-del="' + i + '">消す</button></div></div>').join('') || '<p class="d">まだありません</p>';
      dialog(`<h3>条件付き書式</h3><p class="d">シートと Notion の表のセルの両方に色がつきます（表のセルの色は、この端末のこのブラウザだけ）。</p><div data-list>${list()}</div>
        <label class="r"><span>列</span><select data-k="col">${colOptions(false, true)}</select></label>
        <label class="r"><span>種類</span><select data-k="kind"><option value="scale">色の段階（小さい→大きい）</option><option value="bar">データバー</option><option value="icons">印 ▲●▼（上・中・下の 3 分の 1）</option><option value="rule">条件に合うセルに色</option></select></label>
        <label class="r"><span>色</span><input type="color" data-k="from" value="#f8d7da"> → <input type="color" data-k="to" value="#c9ecd8"><input type="color" data-k="color" value="#2783de"></label>
        <label class="r"><span>条件（種類が「条件」の時）</span><input type="text" data-k="f" placeholder='例 =[@No.]>=3／=ISBLANK([@Synopsis])／=[@Series]="ガリレオ"'></label>
        <div class="btns"><button class="b" data-x>閉じる</button><button class="b pri" data-ok>足す</button></div>`, (d, close) => {
        const wireDel = () => d.querySelectorAll('[data-del]').forEach((b) => { b.onclick = () => { SH.cfg.cf.splice(+b.dataset.del, 1); saveSheets(); d.querySelector('[data-list]').innerHTML = list(); wireDel(); paint(); applyCfToNotion(); }; });
        wireDel();
        d.querySelector('[data-x]').onclick = close;
        d.querySelector('[data-ok]').onclick = () => {
          const g = (k) => d.querySelector('[data-k="' + k + '"]').value;
          const r = { col: g('col'), kind: g('kind'), from: g('from'), to: g('to'), color: g('color') };
          if (r.kind === 'rule') { r.f = g('f').startsWith('=') ? g('f') : '=' + g('f'); if (r.f === '=') { alert('条件を書いてください'); return; } }
          SH.cfg.cf = SH.cfg.cf || []; SH.cfg.cf.push(r); saveSheets();
          d.querySelector('[data-list]').innerHTML = list(); wireDel(); paint(); applyCfToNotion();
        };
      });
      return;
    }
    if (a === 'write') {
      if (!SH.cfg.calc.length) { toast('先に「＋ 計算の列」で列を作ってください'); return; }
      dialog(`<h3>計算の結果を Notion へ書き戻す</h3><p class="d">計算の列の値を、選んだプロパティへ書き込みます（Excel の「値として貼り付け」）。書く前に一覧で確かめられ、あとから元に戻せます。</p>
        <label class="r"><span>計算の列</span><select data-k="from">${SH.cfg.calc.map((c) => '<option>' + esc(c.name) + '</option>').join('')}</select></label>
        <label class="r"><span>書き込む先</span><select data-k="to">${colOptions(true)}</select></label>
        <label class="r"><span>対象の行</span><input type="text" data-k="if" placeholder="空 = すべて／例 =ISBLANK([@No.])（空の行だけ）"></label>
        <div data-pv></div>
        <div class="btns"><button class="b" data-x>やめる</button><button class="b" data-pre>一覧を作る</button><button class="b pri" data-ok disabled>書き込む</button></div>`, (d, close) => {
        let plan = null;
        d.querySelector('[data-x]').onclick = close;
        d.querySelector('[data-pre]').onclick = () => {
          const from = d.querySelector('[data-k="from"]').value, to = d.querySelector('[data-k="to"]').value, cond = d.querySelector('[data-k="if"]').value.trim();
          const fi = SH.model.colIndex(from), ti = SH.model.colIndex(to);
          const col = SH.data.cols[ti];
          plan = [];
          SH.data.rows.forEach((row, i) => {
            const r = i + 2;
            if (cond && ENGINE.bool(ENGINE.run(cond.startsWith('=') ? cond : '=' + cond, SH.model.ctxFor(r))) !== true) return;
            const nv = SH.model.cell(r, fi + 1), ov = SH.model.cell(r, ti + 1);
            if (ENGINE.isErr(nv)) return;
            if (ENGINE.show(nv) === ENGINE.show(ov)) return;
            plan.push({ row, col, val: nv, old: ov });
          });
          d.querySelector('[data-pv]').innerHTML = plan.length ? '<table><tr><th>行</th><th>いま</th><th>書き込む値</th></tr>' + plan.slice(0, 200).map((p) => '<tr><td>' + esc(plainRT(p.row.rec.properties && p.row.rec.properties.title) || p.row.id.slice(0, 8)) + '</td><td class="old">' + esc(ENGINE.show(p.old)) + '</td><td class="new">' + esc(ENGINE.show(p.val)) + '</td></tr>').join('') + '</table>' + (plan.length > 200 ? '<p class="d">ほか ' + (plan.length - 200) + ' 行</p>' : '') : '<p class="d">変わる行はありません</p>';
          d.querySelector('[data-ok]').disabled = !plan.length;
          d.querySelector('[data-ok]').textContent = plan.length + ' 行に書き込む';
        };
        d.querySelector('[data-ok]').onclick = async () => { if (!plan || !plan.length) return; close(); await writeCells(plan, '書き戻し'); };
      });
    }
  }
  function helpDialog() {
    const names = Object.keys(ENGINE.FN).sort();
    dialog(`<h3>Scholar Sheet の使い方</h3>
      <p class="d">表のビューを丸ごと写した表計算です。<b>1 行目は列の名前</b>、2 行目からがビューの行（グループの順）。列 A, B, C … はビューの列の並びのまま、その右が計算の列。</p>
      <table>
        <tr><th>操作</th><th></th></tr>
        <tr><td>選ぶ</td><td>クリック・ドラッグ・⇧＋矢印・⌘A。下に個数・合計・平均・最小・最大</td></tr>
        <tr><td>書き換える</td><td>Enter／ダブルクリック／そのまま打つ。Notion に書き込まれ、帯の「元に戻す」で戻せる。=式 を打つと結果の値を書く</td></tr>
        <tr><td>写す・貼る</td><td>⌘C で TSV（Excel にそのまま）、⌘V で Excel から貼り付け（確かめてから書き込む）。Delete で空に</td></tr>
        <tr><td>参照</td><td>[@列名] その行・[列名] 列全体・A2・B2:D9・C:C・メモ!A1・[#行]・[#グループ]</td></tr>
        <tr><td>メモ</td><td>下の「メモ」は自由なセル。=SUMIFS([No.],[Series],"ガリレオ") のような集計を置いておける（ビューごとに保存）</td></tr>
      </table>
      <p class="d" style="margin-top:12px">使える関数（${names.length}）: ${names.map((n) => '<span class="chip">' + n + '</span>').join('')}</p>
      <div class="btns"><button class="b pri" data-x>閉じる</button></div>`, (d, close) => { d.querySelector('[data-x]').onclick = close; });
  }

  /* ============================================================
   *  8. マクロ — 手順を組んで、確かめてから一括で書き込む
   *     手順: set（値を入れる）/ number（連番）/ replace（置き換え）/ shift（日付をずらす）/ copy（列を写す）/
   *           clear（空にする）/ tagAdd・tagDel（マルチセレクトの札を足す・外す）/ js（JavaScript）
   *     どの手順にも「対象の行」（=式。空ならすべて）。列は名前で指すので、同じ名前の列があるどの DB でも使える
   * ============================================================ */
  let MACROS = store.get(K.macros, []);
  const saveMacros = () => store.set(K.macros, MACROS);
  const STEP_KINDS = {
    set: { l: '値を入れる', d: '式の結果を列に入れる（例 =[@Seq.]*10、="済"、=TODAY()）', f: ['col', 'expr', 'if'] },
    number: { l: '連番を振る', d: 'いまの並び（グループの順）で 1, 2, 3 …。グループごとに振り直すこともできる', f: ['col', 'start', 'step', 'pergroup', 'if'] },
    replace: { l: '置き換え', d: '文字を探して置き換える（/…/ で正規表現）', f: ['col', 'find', 'repl', 'if'] },
    shift: { l: '日付をずらす', d: '日付の列を N 日（月）ずらす', f: ['col', 'days', 'months', 'if'] },
    copy: { l: '別の列へ写す', d: '列 A の値を列 B へ', f: ['src', 'col', 'if'] },
    clear: { l: '空にする', d: '条件に合う行の列を空に', f: ['col', 'if'] },
    tagAdd: { l: '札を足す', d: 'マルチセレクトに札を足す', f: ['col', 'tag', 'if'] },
    tagDel: { l: '札を外す', d: 'マルチセレクトから札を外す', f: ['col', 'tag', 'if'] },
    js: { l: 'JavaScript', d: 'rows（行の一覧）を使って自由に。r.get("列名")・r.set("列名", 値)・r.title・r.group。ENGINE.run("=式") も使える', f: ['code'] }
  };
  /* 手順を順に当てて「変更の一覧」を作る（書き込みはまだ） */
  function planMacro(m, data) {
    const work = data.rows.map((row) => ({ row, vals: row.vals.slice(), changed: new Map() }));
    const model = makeModel(Object.assign({}, data, { rows: work.map((w) => ({ id: w.row.id, rec: w.row.rec, group: w.row.group, vals: w.vals })) }), { calc: [], cf: [], agg: {}, memo: {}, fmt: {} });
    const colOf = (name) => { const i = model.colIndex(name); if (i < 0 || i >= data.cols.length) throw new Error('「' + name + '」という列はありません'); return i; };
    const setV = (w, ci, v) => { const col = data.cols[ci]; if (!WRITABLE.has(col.type)) throw new Error('「' + col.name + '」は書き込めない列です'); w.vals[ci] = v; w.changed.set(ci, v); };
    const passes = (st, i) => { if (!st.if || !st.if.trim() || st.if.trim() === '=') return true; model.reset(); return ENGINE.bool(ENGINE.run(st.if.startsWith('=') ? st.if : '=' + st.if, model.ctxFor(i + 2))) === true; };
    const log = [];
    for (const st of m.steps) {
      if (st.kind === 'js') {
        const rows = work.map((w, i) => ({
          id: w.row.id, title: plainRT(w.row.rec.properties && w.row.rec.properties.title), group: groupLabel(w.row.group, data), index: i,
          get: (name) => w.vals[colOf(name)],
          set: (name, v) => setV(w, colOf(name), v)
        }));
        const fn = new Function('rows', 'ENGINE', 'log', 'cols', '"use strict";\n' + (st.code || ''));
        fn(rows, ENGINE, (...a) => log.push(a.join(' ')), data.cols.map((c) => c.name));
        continue;
      }
      const ci = st.col ? colOf(st.col) : -1;
      let n = +st.start || 1, lastG = null;
      work.forEach((w, i) => {
        if (st.kind === 'number' && st.pergroup) { const g = JSON.stringify(w.row.group && w.row.group.value); if (g !== lastG) { n = +st.start || 1; lastG = g; } }
        if (!passes(st, i)) return;
        model.reset();
        const cur = w.vals[ci];
        switch (st.kind) {
          case 'set': setV(w, ci, ENGINE.run(st.expr && st.expr.startsWith('=') ? st.expr : '=' + JSON.stringify(st.expr || ''), model.ctxFor(i + 2))); break;
          case 'number': setV(w, ci, n); n += +st.step || 1; break;
          case 'replace': { const s0 = ENGINE.str(cur); const re = /^\/(.*)\/([gimsu]*)$/.exec(st.find || ''); const out = re ? s0.replace(new RegExp(re[1], re[2].includes('g') ? re[2] : re[2] + 'g'), st.repl || '') : s0.split(st.find || '\u0000').join(st.repl || ''); if (out !== s0) setV(w, ci, out); break; }
          case 'shift': if (typeof cur === 'number') { let v = cur + (+st.days || 0); if (+st.months) v = ENGINE.FN.EDATE(v, +st.months) + (v % 1); setV(w, ci, v); } break;
          case 'copy': setV(w, ci, w.vals[colOf(st.src)]); break;
          case 'clear': if (cur !== '' && cur != null) setV(w, ci, ''); break;
          case 'tagAdd': case 'tagDel': { const tags = ENGINE.str(cur).split(',').map(norm).filter(Boolean); const t = norm(st.tag); const has = tags.includes(t); if (st.kind === 'tagAdd' && !has) setV(w, ci, tags.concat(t).join(', ')); if (st.kind === 'tagDel' && has) setV(w, ci, tags.filter((x) => x !== t).join(', ')); break; }
          default: break;
        }
      });
    }
    const changes = [];
    work.forEach((w) => { for (const [ci, v] of w.changed) { if (ENGINE.show(v) === ENGINE.show(w.row.vals[ci])) continue; changes.push({ row: w.row, col: data.cols[ci], val: v, old: w.row.vals[ci] }); } });
    return { changes, log };
  }
  function macroDialog() {
    const ensure = () => { if (!MACROS.length) MACROS.push({ id: uid(), name: '新しいマクロ', steps: [{ kind: 'number', col: '', start: 1, step: 1 }] }); };
    ensure();
    let cur = MACROS[0];
    const fieldHtml = (st, i) => {
      const k = STEP_KINDS[st.kind];
      const inp = (f, l, ph, type) => '<label class="r"><span>' + l + '</span><input type="' + (type || 'text') + '" data-s="' + i + '" data-f="' + f + '" value="' + esc(st[f] == null ? '' : st[f]) + '" placeholder="' + esc(ph || '') + '" spellcheck="false"></label>';
      const sel = (f, l) => '<label class="r"><span>' + l + '</span><select data-s="' + i + '" data-f="' + f + '">' + '<option value=""></option>' + (SH ? SH.data.cols : []).map((c) => '<option' + (st[f] === c.name ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select></label>';
      let h = '';
      for (const f of k.f) {
        if (f === 'col') h += sel('col', '列');
        else if (f === 'src') h += sel('src', '写す元の列');
        else if (f === 'expr') h += inp('expr', '値（式）', '=[@Seq.]*10　／　="済"　／　=TODAY()');
        else if (f === 'if') h += inp('if', '対象の行', '空 = すべて／=ISBLANK([@No.])／=[@Series]="ガリレオ"');
        else if (f === 'start') h += inp('start', '始まり', '1', 'number');
        else if (f === 'step') h += inp('step', '増やし方', '1', 'number');
        else if (f === 'pergroup') h += '<label class="r"><span>グループごと</span><input type="checkbox" data-s="' + i + '" data-f="pergroup"' + (st.pergroup ? ' checked' : '') + '> グループが変わったら 1 から</label>';
        else if (f === 'find') h += inp('find', '探す', '例 （上） ／ /\\s+/');
        else if (f === 'repl') h += inp('repl', '置き換え', '');
        else if (f === 'days') h += inp('days', '日', '7', 'number');
        else if (f === 'months') h += inp('months', '月', '0', 'number');
        else if (f === 'tag') h += inp('tag', '札', '例 読了');
        else if (f === 'code') h += '<textarea data-s="' + i + '" data-f="code" spellcheck="false" placeholder="// 例: シリーズの中で巻数（No.）が空なら、前の巻＋1\nlet last = {};\nfor (const r of rows) {\n  const s = r.get(\'Series\');\n  if (r.get(\'No.\') === \'\') r.set(\'No.\', (last[s] || 0) + 1);\n  last[s] = r.get(\'No.\') || last[s];\n}">' + esc(st.code || '') + '</textarea>';
      }
      return h;
    };
    const render = (d) => {
      d.querySelector('[data-body]').innerHTML =
        '<label class="r"><span>マクロ</span><select data-m>' + MACROS.map((m) => '<option value="' + m.id + '"' + (m === cur ? ' selected' : '') + '>' + esc(m.name) + '</option>').join('') + '</select><button class="b" data-new>新しく</button><button class="b" data-dup>写す</button><button class="b" data-delm>消す</button></label>' +
        '<label class="r"><span>名前</span><input type="text" data-name value="' + esc(cur.name) + '"></label>' +
        cur.steps.map((st, i) => '<div class="step"><div class="sh">' + (i + 1) + '. <select data-kind="' + i + '">' + Object.entries(STEP_KINDS).map(([k, v]) => '<option value="' + k + '"' + (k === st.kind ? ' selected' : '') + '>' + v.l + '</option>').join('') + '</select><span class="d" style="font-weight:400;color:var(--lm-mute,#888);font-size:12px">' + esc(STEP_KINDS[st.kind].d) + '</span><button class="b x" data-up="' + i + '">↑</button><button class="b" data-rm="' + i + '">×</button></div>' + fieldHtml(st, i) + '</div>').join('') +
        '<button class="b" data-add>＋ 手順を足す</button><div data-pv></div>' +
        '<div class="step"><div class="sh">元に戻す（直近 ' + UNDO.length + ' 回）</div>' + (UNDO.slice(0, 8).map((u, i) => '<div style="display:flex;gap:8px;align-items:center;margin-top:4px"><span style="flex:1">' + esc(new Date(u.at).toLocaleString()) + '　' + esc(u.label) + '（' + u.items.length + ' か所）</span><button class="b" data-undo="' + i + '">戻す</button></div>').join('') || '<p class="d">まだありません</p>') + '</div>';
      wire(d);
    };
    const wire = (d) => {
      const q = (s) => d.querySelectorAll(s);
      q('[data-m]').forEach((x) => { x.onchange = () => { cur = MACROS.find((m) => m.id === x.value); render(d); }; });
      q('[data-new]').forEach((x) => { x.onclick = () => { cur = { id: uid(), name: 'マクロ ' + (MACROS.length + 1), steps: [{ kind: 'set' }] }; MACROS.push(cur); saveMacros(); render(d); }; });
      q('[data-dup]').forEach((x) => { x.onclick = () => { cur = JSON.parse(JSON.stringify(cur)); cur.id = uid(); cur.name += ' の写し'; MACROS.push(cur); saveMacros(); render(d); }; });
      q('[data-delm]').forEach((x) => { x.onclick = () => { if (!confirm('「' + cur.name + '」を消しますか？')) return; MACROS = MACROS.filter((m) => m !== cur); ensure(); cur = MACROS[0]; saveMacros(); render(d); }; });
      q('[data-name]').forEach((x) => { x.oninput = () => { cur.name = x.value; saveMacros(); }; });
      q('[data-kind]').forEach((x) => { x.onchange = () => { cur.steps[+x.dataset.kind] = { kind: x.value }; saveMacros(); render(d); }; });
      q('[data-f]').forEach((x) => { const ev = x.type === 'checkbox' || x.tagName === 'SELECT' ? 'change' : 'input'; x.addEventListener(ev, () => { cur.steps[+x.dataset.s][x.dataset.f] = x.type === 'checkbox' ? x.checked : x.value; saveMacros(); }); });
      q('[data-add]').forEach((x) => { x.onclick = () => { cur.steps.push({ kind: 'set' }); saveMacros(); render(d); }; });
      q('[data-rm]').forEach((x) => { x.onclick = () => { cur.steps.splice(+x.dataset.rm, 1); saveMacros(); render(d); }; });
      q('[data-up]').forEach((x) => { x.onclick = () => { const i = +x.dataset.up; if (i > 0) { const t = cur.steps[i - 1]; cur.steps[i - 1] = cur.steps[i]; cur.steps[i] = t; saveMacros(); render(d); } }; });
      q('[data-undo]').forEach((x) => { x.onclick = () => { undoLast(+x.dataset.undo); setTimeout(() => render(d), 600); }; });
    };
    dialog(`<h3>マクロ</h3><p class="d">手順を上から順に、いまのビューの全行へ当てます。「確かめる」でどの行がどう変わるかを一覧にし、よければ「実行」で一括書き込み（あとから戻せます）。⌃⌥1〜9 で上から 9 つまでを直接実行（確かめの一覧が出ます）。</p><div data-body></div>
      <div class="btns"><button class="b" data-x>閉じる</button><button class="b" data-pre>確かめる</button><button class="b pri" data-run disabled>実行</button></div>`, (d, close) => {
      render(d);
      let plan = null;
      d.querySelector('[data-x]').onclick = close;
      d.querySelector('[data-pre]').onclick = () => {
        if (!SH) { toast('先にシート（⌃⌥E）を開いてください'); return; }
        try { plan = planMacro(cur, SH.data); }
        catch (e) { d.querySelector('[data-pv]').innerHTML = '<p class="d" style="color:#c0392b">止まりました: ' + esc(e.message) + '</p>'; plan = null; d.querySelector('[data-run]').disabled = true; return; }
        d.querySelector('[data-pv]').innerHTML = (plan.log.length ? '<pre style="font-size:11.5px;white-space:pre-wrap">' + esc(plan.log.join('\n')) + '</pre>' : '') + (plan.changes.length ? '<table><tr><th>行</th><th>列</th><th>いま</th><th>新しい値</th></tr>' + plan.changes.slice(0, 300).map((p) => '<tr><td>' + esc(plainRT(p.row.rec.properties && p.row.rec.properties.title) || p.row.id.slice(0, 8)) + '</td><td>' + esc(p.col.name) + '</td><td class="old">' + esc(fmtCell(p.old, p.col, SH.cfg)) + '</td><td class="new">' + esc(fmtCell(p.val, p.col, SH.cfg)) + '</td></tr>').join('') + '</table>' : '<p class="d">変わる所はありません</p>');
        d.querySelector('[data-run]').disabled = !plan.changes.length;
        d.querySelector('[data-run]').textContent = plan.changes.length ? plan.changes.length + ' か所を書き込む' : '実行';
      };
      d.querySelector('[data-run]').onclick = async () => { if (!plan || !plan.changes.length) return; close(); await writeCells(plan.changes, 'マクロ「' + cur.name + '」'); };
    });
  }
  async function runMacroByIndex(i) {
    const m = MACROS[i];
    if (!m) return;
    if (!SH) await openSheet(null);
    if (!SH) return;
    let plan;
    try { plan = planMacro(m, SH.data); } catch (e) { toast('マクロ「' + m.name + '」: ' + e.message); return; }
    if (!plan.changes.length) { toast('マクロ「' + m.name + '」: 変わる所はありません'); return; }
    if (!confirm('マクロ「' + m.name + '」: ' + plan.changes.length + ' か所を書き込みます。\n\n' + plan.changes.slice(0, 8).map((p) => '・' + (plainRT(p.row.rec.properties && p.row.rec.properties.title) || '') + '　' + p.col.name + '：' + ENGINE.show(p.old) + ' → ' + ENGINE.show(p.val)).join('\n') + (plan.changes.length > 8 ? '\n…' : ''))) return;
    await writeCells(plan.changes, 'マクロ「' + m.name + '」');
  }

  /* ============================================================
   *  9. 学び — 赤シート・穴埋め
   *     Notion の文字色・背景色は style の変数で書かれている（color: var(--c-redTex…)・background: var(--c-yelBac…)）
   * ============================================================ */
  const NC = { red: 'red', orange: 'ora', yellow: 'yel', green: 'gre', blue: 'blu', purple: 'pur', pink: 'pin', brown: 'bro', gray: 'gra' };
  const STUDY = { red: false, cloze: false };
  function studyCss() {
    let st = document.getElementById('s38-study');
    if (!st) { st = document.createElement('style'); st.id = 's38-study'; document.head.appendChild(st); }
    const leaf = ':is(.notion-page-content, .notion-peek-renderer) [data-content-editable-leaf]';
    let css = '';
    if (STUDY.red) {
      const sels = P.redColors.map((c) => leaf + ' [style*="--c-' + NC[c] + 'Tex"]:not([data-s38-open])').join(',\n');
      css += sels + ` { color: transparent !important; background: linear-gradient(rgba(214, 40, 40, .55), rgba(214, 40, 40, .55)) !important; border-radius: 3px; transition: color .15s, background .15s; cursor: help; -webkit-text-fill-color: transparent; }\n`;
      css += P.redColors.map((c) => leaf + ' [style*="--c-' + NC[c] + 'Tex"]:not([data-s38-open]):hover').join(',\n') + ' { color: inherit !important; -webkit-text-fill-color: currentColor; background: rgba(214, 40, 40, .12) !important; }\n';
      css += 'html[data-s38-red] .notion-frame::after { content: "赤シート"; position: fixed; right: 18px; top: 52px; z-index: 50; padding: 3px 10px; border-radius: 999px; background: rgba(214,40,40,.9); color: #fff; font: 600 11px/1.6 -apple-system, "Hiragino Sans", sans-serif; letter-spacing: .1em; pointer-events: none; }\n';
    }
    if (STUDY.cloze) {
      const c = NC[P.clozeColor] || 'yel';
      css += leaf + ' [style*="--c-' + c + 'Bac"]:not([data-s38-open]) { color: transparent !important; -webkit-text-fill-color: transparent; background: none !important; border-bottom: 2px solid var(--lm-accent, #2783de); padding: 0 .4em; cursor: help; }\n';
      css += leaf + ' [style*="--c-' + c + 'Bac"]:not([data-s38-open]):hover { color: inherit !important; -webkit-text-fill-color: currentColor; background: color-mix(in srgb, var(--lm-accent, #2783de) 10%, transparent) !important; }\n';
      css += leaf + ' [style*="--c-' + c + 'Bac"][data-s38-open] { outline: 1px dashed var(--lm-accent, #2783de); outline-offset: 1px; }\n';
    }
    st.textContent = css;
    document.documentElement.toggleAttribute('data-s38-red', STUDY.red);
  }
  /* ⌥クリックで 1 つだけ開いたままに（ふつうのクリックは Notion の編集のまま） */
  document.addEventListener('click', (e) => {
    if (!(STUDY.red || STUDY.cloze) || !e.altKey) return;
    const t = e.target.closest && e.target.closest('[data-content-editable-leaf] [style*="Tex"], [data-content-editable-leaf] [style*="Bac"]');
    if (!t) return;
    e.preventDefault(); e.stopPropagation();
    t.toggleAttribute('data-s38-open');
  }, true);
  function setRed(on) { STUDY.red = on == null ? !STUDY.red : !!on; studyCss(); toast(STUDY.red ? '赤シート：' + P.redColors.map((c) => ({ red: '赤', orange: '橙', pink: '桃', purple: '紫', blue: '青', green: '緑', brown: '茶', yellow: '黄', gray: '灰' }[c])).join('・') + 'の文字を隠しました（乗せると見える・⌥クリックで開いたまま）' : '赤シート：外しました'); }
  function setCloze(on) { STUDY.cloze = on == null ? !STUDY.cloze : !!on; studyCss(); toast(STUDY.cloze ? '穴埋め：背景の色を塗った語を空欄にしました' : '穴埋め：戻しました'); }

  /* ============================================================
   *  10. 学び — 単語帳（DB のビューを単語帳にして間隔反復 SM-2）
   * ============================================================ */
  let DECKS = store.get(K.decks, []);
  let SRS = store.get(K.srs, {});
  const saveDecks = () => store.set(K.decks, DECKS);
  const saveSrs = () => store.set(K.srs, SRS);
  const dayNum = (d) => Math.floor(((d || new Date()).getTime() - (d || new Date()).getTimezoneOffset() * 60000) / 86400000);
  function sm2(card, q) {   // q: 0 もう一度 / 1 難しい / 2 できた / 3 簡単
    const c = Object.assign({ ef: 2.5, iv: 0, reps: 0, lapses: 0, due: dayNum() }, card || {});
    const grade = [1, 3, 4, 5][q];
    if (grade < 3) { c.reps = 0; c.iv = 0; c.lapses++; c.due = dayNum(); c.again = true; }
    else {
      c.again = false;
      c.reps++;
      c.iv = c.reps === 1 ? (q === 3 ? 4 : 1) : c.reps === 2 ? (q === 3 ? 8 : 6) : Math.round(c.iv * c.ef * (q === 1 ? 0.8 : q === 3 ? 1.3 : 1));
      c.iv = Math.max(1, c.iv);
      c.due = dayNum() + c.iv;
    }
    c.ef = Math.max(1.3, c.ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
    c.last = Date.now();
    return c;
  }
  async function deckDialog() {
    css();
    const v = findView();
    dialog(`<h3>単語帳</h3><p class="d">DB のビューを単語帳にします。表に出す列（問い）と裏に出す列（答え）を選ぶだけ。覚え具合はこの端末に保存され、忘れかけた頃にもう一度出ます（間隔反復）。</p><div data-list></div>
      <div class="step"><div class="sh">いま見ているビューから作る</div>
      <label class="r"><span>名前</span><input type="text" data-k="name" placeholder="例 英単語・歴史の年号"></label>
      <label class="r"><span>表（問い）</span><select data-k="front"></select></label>
      <label class="r"><span>裏（答え）</span><select data-k="back"></select></label>
      <label class="r"><span>裏に添える</span><select data-k="extra"><option value="">なし</option></select></label>
      <label class="r"><span>1 日の新しいカード</span><input type="number" data-k="newPer" value="20"></label>
      <div class="btns"><button class="b pri" data-make>作る</button></div></div>
      <div class="btns"><button class="b" data-x>閉じる</button></div>`, async (d, close) => {
      d.querySelector('[data-x]').onclick = close;
      const renderList = () => {
        const today = dayNum();
        d.querySelector('[data-list]').innerHTML = DECKS.length ? DECKS.map((k, i) => { const cards = Object.entries(SRS).filter(([id]) => id.startsWith(k.id + ':')); const due = cards.filter(([, c]) => c.due <= today).length; return '<div class="step"><div class="sh">' + esc(k.name) + '<span class="chip">復習 ' + due + '</span><span class="chip">覚えた ' + cards.filter(([, c]) => c.iv >= 21).length + '</span><button class="b x pri" data-go="' + i + '">はじめる</button><button class="b" data-del="' + i + '">消す</button></div><p class="d">表: ' + esc(k.front) + '　裏: ' + esc(k.back) + (k.extra ? '・' + esc(k.extra) : '') + '</p></div>'; }).join('') : '<p class="d">まだありません</p>';
        d.querySelectorAll('[data-go]').forEach((b) => { b.onclick = () => { close(); review(DECKS[+b.dataset.go]); }; });
        d.querySelectorAll('[data-del]').forEach((b) => { b.onclick = () => { if (!confirm('単語帳を消しますか？（覚え具合も消えます）')) return; const k = DECKS[+b.dataset.del]; for (const id of Object.keys(SRS)) if (id.startsWith(k.id + ':')) delete SRS[id]; DECKS.splice(+b.dataset.del, 1); saveDecks(); saveSrs(); renderList(); }; });
      };
      renderList();
      if (!v || !v.viewId) { d.querySelector('[data-make]').disabled = true; return; }
      let data;
      try { data = await loadView(v); } catch (e) { toast(e.message); return; }
      const opts = data.cols.map((c) => '<option>' + esc(c.name) + '</option>').join('');
      d.querySelector('[data-k="front"]').innerHTML = opts;
      d.querySelector('[data-k="back"]').innerHTML = opts;
      d.querySelector('[data-k="back"]').selectedIndex = Math.min(1, data.cols.length - 1);
      d.querySelector('[data-k="extra"]').innerHTML += opts;
      d.querySelector('[data-k="name"]').value = data.viewName || 'カード';
      d.querySelector('[data-make]').onclick = () => {
        const g = (k) => d.querySelector('[data-k="' + k + '"]').value;
        DECKS.push({ id: uid().slice(0, 8), name: g('name') || 'カード', view: { blockId: v.blockId, viewId: v.viewId, inline: v.inline }, front: g('front'), back: g('back'), extra: g('extra'), newPer: +g('newPer') || 20 });
        saveDecks(); renderList();
      };
    });
  }
  const REVIEW_CSS = `
#s38-rev { position: fixed; inset: 0; z-index: 2147483350; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px;
  background: color-mix(in srgb, var(--lm-bg, #f4f2ee) 92%, transparent); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  font: 15px/1.6 var(--cordi-ui, var(--cordi-ui-fallback, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif)); font-feature-settings: "palt" 1; color: var(--lm-ink, #2c2c2b); }
#s38-rev .top { position: absolute; top: 18px; left: 24px; right: 24px; display: flex; align-items: center; gap: 12px; color: var(--lm-mute, #888); font-size: 13px; }
#s38-rev .top .pg { flex: 1; height: 4px; border-radius: 4px; background: var(--lm-line, rgba(0,0,0,.08)); overflow: hidden; }
#s38-rev .top .pg i { display: block; height: 100%; background: var(--lm-accent, #2783de); transition: width .3s; }
#s38-rev .card { width: min(620px, 88vw); min-height: 300px; perspective: 1400px; cursor: pointer; }
#s38-rev .in { position: relative; width: 100%; min-height: 300px; }
#s38-rev .face { position: absolute; inset: 0; border-radius: 18px; padding: 36px 40px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
  background: var(--lm-raised, #fff); box-shadow: 0 24px 60px rgba(0,0,0,.14), 0 0 0 1px var(--lm-line, rgba(0,0,0,.08)); }
#s38-rev .face { transition: transform .32s cubic-bezier(.2,.8,.2,1), opacity .28s; }
#s38-rev .face.b { transform: rotateY(-90deg); opacity: 0; }
#s38-rev .card.flip .face.f { transform: rotateY(90deg); opacity: 0; }
#s38-rev .card.flip .face.b { transform: none; opacity: 1; }
#s38-rev .face .q { font-size: 30px; font-weight: 600; line-height: 1.35; word-break: break-word; }
#s38-rev .face .a { font-size: 22px; line-height: 1.5; word-break: break-word; }
#s38-rev .face .x { margin-top: 14px; color: var(--lm-mute, #888); font-size: 14px; max-height: 120px; overflow: auto; }
#s38-rev .face small { position: absolute; top: 14px; left: 18px; color: var(--lm-mute, #999); font-size: 11px; letter-spacing: .14em; }
#s38-rev .btns { display: flex; gap: 10px; opacity: 0; transition: opacity .2s; pointer-events: none; }
#s38-rev .btns.on { opacity: 1; pointer-events: auto; }
#s38-rev .btns button { min-width: 108px; border: 1px solid var(--lm-line, rgba(0,0,0,.12)); background: var(--lm-raised, #fff); color: inherit; border-radius: 12px; padding: 9px 14px; cursor: pointer; font: inherit; font-size: 14px; }
#s38-rev .btns button small { display: block; color: var(--lm-mute, #999); font-size: 11px; }
#s38-rev .btns button:hover { border-color: var(--lm-accent, #2783de); }
#s38-rev .hint { color: var(--lm-mute, #999); font-size: 12px; }
#s38-rev .done { text-align: center; }
#s38-rev .done b { display: block; font: 600 30px/1.3 "Cormorant Garamond", Georgia, serif; margin-bottom: 8px; }`;
  async function review(deck) {
    css();
    if (!document.getElementById('s38-rev-css')) { const st = document.createElement('style'); st.id = 's38-rev-css'; st.textContent = REVIEW_CSS; document.head.appendChild(st); }
    let data;
    try { toast('単語帳を読んでいます…'); data = await loadView(deck.view); } catch (e) { toast('読めませんでした: ' + e.message); return; }
    const fi = data.cols.findIndex((c) => c.name === deck.front), bi = data.cols.findIndex((c) => c.name === deck.back), xi = deck.extra ? data.cols.findIndex((c) => c.name === deck.extra) : -1;
    if (fi < 0 || bi < 0) { toast('表・裏の列が見つかりません（列の名前が変わった？）'); return; }
    const today = dayNum();
    const key = (row) => deck.id + ':' + row.id;
    const due = data.rows.filter((r) => SRS[key(r)] && SRS[key(r)].due <= today);
    const newOnes = data.rows.filter((r) => !SRS[key(r)]).slice(0, deck.newPer || 20);
    let queue = due.concat(newOnes).filter((r) => ENGINE.show(r.vals[fi]) !== '');
    for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [queue[i], queue[j]] = [queue[j], queue[i]]; }
    const total = queue.length;
    let done = 0, flipped = false, right = 0;
    const el = document.createElement('div'); el.id = 's38-rev';
    document.body.appendChild(el);
    const started = Date.now();
    const end = () => { el.remove(); document.removeEventListener('keydown', key2, true); logStudy(Math.round((Date.now() - started) / 60000), 'review', done); };
    const show = (v, col) => esc(fmtCell(v, col, { fmt: {} }));
    const draw = () => {
      if (!queue.length) {
        el.innerHTML = '<div class="done"><b>おつかれさまでした</b>' + done + ' 枚・できた ' + right + ' 枚（' + (done ? Math.round(right / done * 100) : 0) + '%）<div class="hint" style="margin-top:12px">次の復習は明日以降。Esc で閉じる</div></div>';
        return;
      }
      const r = queue[0];
      const c = SRS[key(r)];
      flipped = false;
      el.innerHTML = '<div class="top"><span>' + esc(deck.name) + '</span><span class="pg"><i style="width:' + (total ? done / total * 100 : 0) + '%"></i></span><span>' + done + ' / ' + total + '</span><span>' + (c ? '復習' : '新しい') + '</span><button class="b" data-q style="border:0;background:transparent;color:inherit;cursor:pointer">✕</button></div>' +
        '<div class="card"><div class="in"><div class="face f"><small>問い</small><div class="q">' + show(r.vals[fi], data.cols[fi]) + '</div></div>' +
        '<div class="face b"><small>答え</small><div class="a">' + show(r.vals[bi], data.cols[bi]) + '</div>' + (xi >= 0 ? '<div class="x">' + show(r.vals[xi], data.cols[xi]) + '</div>' : '') + '</div></div></div>' +
        '<div class="btns">' + [['もう一度', '1'], ['難しい', '2'], ['できた', '3'], ['簡単', '4']].map(([l, k], q) => '<button data-g="' + q + '">' + l + '<small>' + k + '・' + nextLabel(c, q) + '</small></button>').join('') + '</div><div class="hint">スペースで裏返す・1〜4 で答える・Esc で終わる</div>';
      el.querySelector('.card').onclick = flip;
      el.querySelector('[data-q]').onclick = end;
      el.querySelectorAll('[data-g]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); grade(+b.dataset.g); }; });
    };
    const nextLabel = (c, q) => { const n = sm2(c, q); return n.again ? 'すぐ' : n.iv + ' 日後'; };
    const flip = () => { flipped = !flipped; el.querySelector('.card').classList.toggle('flip', flipped); el.querySelector('.btns').classList.toggle('on', flipped); };
    const grade = (q) => {
      if (!flipped) { flip(); return; }
      const r = queue.shift();
      const n = sm2(SRS[key(r)], q);
      SRS[key(r)] = n; saveSrs();
      done++; if (q >= 2) right++;
      if (n.again) queue.splice(Math.min(queue.length, 3), 0, r);
      draw();
    };
    const key2 = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); end(); return; }
      if (e.key === ' ') { e.preventDefault(); flip(); return; }
      if (/^[1-4]$/.test(e.key)) { e.preventDefault(); grade(+e.key - 1); }
    };
    document.addEventListener('keydown', key2, true);
    draw();
  }

  /* ============================================================
   *  11. 学び — ポモドーロと学習記録
   * ============================================================ */
  let LOG = store.get(K.log, {});   // 'YYYY-MM-DD' → { min, reviews, pages: { pageId: min } }
  const saveLog = () => store.set(K.log, LOG);
  const ymd = (d) => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const pageId = () => { const m = /([0-9a-f]{32})(?:[?#]|$)/i.exec(location.pathname); return m ? m[1].toLowerCase() : ''; };
  function logStudy(min, kind, n) {
    const k = ymd();
    const e = LOG[k] || (LOG[k] = { min: 0, reviews: 0, pages: {} });
    if (kind === 'review') e.reviews += n || 0;
    if (min > 0) { e.min += min; const p = pageId(); if (p) e.pages[p] = (e.pages[p] || 0) + min; }
    saveLog();
  }
  const POMO = { on: false, phase: 'work', left: 0, t: 0, count: 0, el: null, startedAt: 0 };
  const POMO_CSS = `
#s38-pomo { position: fixed; left: 18px; bottom: 18px; z-index: 2147483200; display: flex; align-items: center; gap: 10px; padding: 8px 12px 8px 8px; border-radius: 999px;
  background: var(--lm-raised, #fff); color: var(--lm-ink, #2c2c2b); box-shadow: 0 10px 30px rgba(0,0,0,.16), 0 0 0 1px var(--lm-line, rgba(0,0,0,.08)); font: 13px/1.2 var(--cordi-ui, var(--cordi-ui-fallback, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif)); user-select: none; }
#s38-pomo svg { width: 38px; height: 38px; transform: rotate(-90deg); }
#s38-pomo .t { font: 600 17px/1 ui-monospace, Menlo, monospace; font-variant-numeric: tabular-nums; min-width: 54px; }
#s38-pomo .ph { font-size: 11px; color: var(--lm-mute, #888); }
#s38-pomo button { border: 0; background: transparent; color: inherit; cursor: pointer; font-size: 15px; padding: 2px 4px; border-radius: 6px; }
#s38-pomo button:hover { background: var(--lm-hover, rgba(0,0,0,.05)); }`;
  function beep() { try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, a.currentTime); g.gain.exponentialRampToValueAtTime(0.2, a.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.6); o.start(); o.stop(a.currentTime + 0.65); } catch (e) { /* noop */ } }
  function pomoStart(phase) {
    if (!document.getElementById('s38-pomo-css')) { const st = document.createElement('style'); st.id = 's38-pomo-css'; st.textContent = POMO_CSS; document.head.appendChild(st); }
    POMO.phase = phase || 'work';
    POMO.total = (POMO.phase === 'work' ? P.pomo : POMO.phase === 'long' ? P.longBrk : P.brk) * 60;
    POMO.left = POMO.total; POMO.on = true; POMO.startedAt = Date.now();
    if (!POMO.el) {
      POMO.el = document.createElement('div'); POMO.el.id = 's38-pomo';
      POMO.el.innerHTML = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="var(--lm-line, rgba(0,0,0,.1))" stroke-width="4"/><circle class="arc" cx="20" cy="20" r="16" fill="none" stroke="var(--lm-accent, #2783de)" stroke-width="4" stroke-linecap="round" stroke-dasharray="100.5" stroke-dashoffset="0"/></svg><div><div class="t"></div><div class="ph"></div></div><button data-p title="止める／続ける">⏯</button><button data-s title="次へ">⏭</button><button data-x title="終わる">✕</button>';
      document.body.appendChild(POMO.el);
      POMO.el.querySelector('[data-p]').onclick = () => { POMO.on = !POMO.on; drawPomo(); };
      POMO.el.querySelector('[data-s]').onclick = () => pomoNext(true);
      POMO.el.querySelector('[data-x]').onclick = pomoStop;
    }
    clearInterval(POMO.t);
    POMO.t = setInterval(() => { if (!POMO.on) return; POMO.left--; if (POMO.phase === 'work' && POMO.left % 60 === 0) logStudy(1); if (POMO.left <= 0) pomoNext(); drawPomo(); }, 1000);
    drawPomo();
  }
  function pomoNext(skip) {
    if (POMO.phase === 'work') { POMO.count++; if (!skip) { beep(); notify('休憩しましょう', P.pomo + ' 分おつかれさまでした'); } pomoStart(POMO.count % 4 === 0 ? 'long' : 'break'); }
    else { if (!skip) { beep(); notify('はじめましょう', '次の ' + P.pomo + ' 分'); } pomoStart('work'); }
  }
  function pomoStop() { clearInterval(POMO.t); if (POMO.el) POMO.el.remove(); POMO.el = null; POMO.on = false; }
  function drawPomo() {
    if (!POMO.el) return;
    const m = Math.floor(POMO.left / 60), s = POMO.left % 60;
    POMO.el.querySelector('.t').textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    POMO.el.querySelector('.ph').textContent = (POMO.phase === 'work' ? '集中' : POMO.phase === 'long' ? '長い休憩' : '休憩') + (POMO.on ? '' : '（止めています）') + '・今日 ' + ((LOG[ymd()] || {}).min || 0) + ' 分';
    POMO.el.querySelector('.arc').setAttribute('stroke-dashoffset', String(100.5 * (1 - POMO.left / POMO.total)));
    POMO.el.querySelector('.arc').setAttribute('stroke', POMO.phase === 'work' ? 'var(--lm-accent, #2783de)' : 'var(--lm-accent2, #2e9d6a)');
  }
  function notify(t, b) { try { if (window.Notification && Notification.permission === 'granted') new Notification(t, { body: b }); else toast(t + '：' + b); } catch (e) { toast(t); } }
  /* 草（ヒートマップ）: 直近 20 週 */
  function heatmap() {
    const days = 20 * 7;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - days + 1 - start.getDay() + 0);
    let h = '<div style="display:grid;grid-template-rows:repeat(7,12px);grid-auto-flow:column;grid-auto-columns:12px;gap:3px">';
    const max = Math.max(30, ...Object.values(LOG).map((e) => e.min + e.reviews));
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const e = LOG[ymd(d)]; const v = e ? e.min + e.reviews : 0;
      const a = v ? 0.18 + 0.82 * Math.min(1, v / max) : 0;
      h += '<span title="' + ymd(d) + '　' + (e ? e.min + ' 分・カード ' + e.reviews + ' 枚' : 'なし') + '" style="border-radius:3px;background:' + (a ? 'color-mix(in srgb, var(--lm-accent, #2e9d6a) ' + Math.round(a * 100) + '%, transparent)' : 'var(--lm-line, rgba(0,0,0,.07))') + '"></span>';
    }
    h += '</div>';
    const week = Object.entries(LOG).filter(([k]) => (today - new Date(k)) / 86400000 < 7).reduce((s, [, e]) => s + e.min, 0);
    let streak = 0; for (let d = new Date(today); LOG[ymd(d)] && (LOG[ymd(d)].min || LOG[ymd(d)].reviews); d.setDate(d.getDate() - 1)) streak++;
    return { html: h, week, streak, today: (LOG[ymd()] || {}).min || 0 };
  }

  /* ============================================================
   *  12. 続きから読む・選んだ式を計算
   * ============================================================ */
  let READ = store.get(K.read, {});
  let readT = 0, readScroller = null;
  function readingWatch() {
    if (!P.resume) return;
    const sc = document.querySelector('.notion-frame .notion-scroller.vertical');
    if (!sc || sc === readScroller) return;
    readScroller = sc;
    const pid = pageId();
    sc.addEventListener('scroll', () => {
      clearTimeout(readT);
      readT = setTimeout(() => {
        const max = sc.scrollHeight - sc.clientHeight; if (max < 1200) return;
        READ[pid] = { r: sc.scrollTop / max, at: Date.now() };
        const ks = Object.keys(READ); if (ks.length > 500) delete READ[ks[0]];
        store.set(K.read, READ);
      }, 600);
    }, { passive: true });
    const saved = READ[pid];
    if (saved && saved.r > 0.12 && saved.r < 0.97) setTimeout(() => { if (sc.scrollTop < 50) toast('前回は ' + Math.round(saved.r * 100) + '% まで読んでいました', ['続きから', () => { sc.scrollTo({ top: saved.r * (sc.scrollHeight - sc.clientHeight), behavior: 'smooth' }); }]); }, 1200);
  }
  function evalSelection() {
    const sel = window.getSelection();
    const txt = sel ? String(sel).trim() : '';
    if (!txt) { toast('式を選んでから ⌃⌥=（例 1200*1.1、=SUM(3,4,5)、=DATEDIF("2026/4/1",TODAY(),"D")）'); return; }
    const src = txt.startsWith('=') ? txt : '=' + txt.replace(/×/g, '*').replace(/÷/g, '/').replace(/＝\s*$/, '').replace(/=\s*$/, '');
    const v = ENGINE.run(src, {});
    if (ENGINE.isErr(v)) { toast('計算できませんでした: ' + v.code + ' ' + v.msg); return; }
    const out = ' = ' + (typeof v === 'number' ? Number(Math.round(v * 1e10) / 1e10).toLocaleString('ja-JP', { maximumFractionDigits: 10 }) : ENGINE.show(v));
    try {
      const r = sel.getRangeAt(0); r.collapse(false); sel.removeAllRanges(); sel.addRange(r);
      if (!document.execCommand('insertText', false, out)) throw new Error('x');
    } catch (e) { try { navigator.clipboard.writeText(out.slice(3)); } catch (e2) { /* noop */ } toast('結果' + out + '（写しました）'); }
  }

  /* ============================================================
   *  13. パネル（⌃⌥S）
   * ============================================================ */
  function panel() {
    css();
    const hm = heatmap();
    const today = dayNum();
    dialog(`<h3>Scholar <span style="font-size:12px;color:var(--lm-mute,#888);font-family:-apple-system,sans-serif">学び と 計算 · ³⁸ v${VERSION}</span></h3>
      <div class="step"><div class="sh">学習の記録<span class="chip">今日 ${hm.today} 分</span><span class="chip">今週 ${hm.week} 分</span><span class="chip">${hm.streak} 日続けて</span></div><div style="margin-top:8px;overflow:auto">${hm.html}</div></div>
      <div class="step"><div class="sh">計算</div>
        <div class="btns" style="justify-content:flex-start;flex-wrap:wrap"><button class="b pri" data-a="sheet">いまの表をシートで開く（⌃⌥E）</button><button class="b" data-a="macro">マクロ</button><button class="b" data-a="calc">式を計算（選んで ⌃⌥=）</button></div>
        ${MACROS.length ? '<p class="d" style="margin-top:8px">マクロ: ' + MACROS.slice(0, 9).map((m, i) => '<span class="chip">⌃⌥' + (i + 1) + ' ' + esc(m.name) + '</span>').join('') + '</p>' : ''}
        <label class="r"><span>条件付き書式</span><input type="checkbox" data-p="cfToNotion"${P.cfToNotion ? ' checked' : ''}> Notion の表のセルにも色をつける</label></div>
      <div class="step"><div class="sh">学び</div>
        <div class="btns" style="justify-content:flex-start;flex-wrap:wrap">
          <button class="b${STUDY.red ? ' pri' : ''}" data-a="red">赤シート（⌃⌥R）</button>
          <button class="b${STUDY.cloze ? ' pri' : ''}" data-a="cloze">穴埋め（⌃⌥H）</button>
          <button class="b" data-a="deck">単語帳</button>
          <button class="b" data-a="pomo">ポモドーロ ${P.pomo} 分</button></div>
        ${DECKS.length ? '<p class="d" style="margin-top:8px">' + DECKS.map((k, i) => { const due = Object.entries(SRS).filter(([id, c]) => id.startsWith(k.id + ':') && c.due <= today).length; return '<button class="b" data-rev="' + i + '">' + esc(k.name) + '（復習 ' + due + '）</button> '; }).join('') + '</p>' : ''}
        <label class="r"><span>赤シートで隠す色</span>${Object.keys(NC).map((c) => '<label style="white-space:nowrap"><input type="checkbox" data-red="' + c + '"' + (P.redColors.includes(c) ? ' checked' : '') + '> ' + { red: '赤', orange: '橙', yellow: '黄', green: '緑', blue: '青', purple: '紫', pink: '桃', brown: '茶', gray: '灰' }[c] + '</label>').join(' ')}</label>
        <label class="r"><span>穴埋めにする背景</span><select data-p="clozeColor">${Object.keys(NC).map((c) => '<option value="' + c + '"' + (P.clozeColor === c ? ' selected' : '') + '>' + { red: '赤', orange: '橙', yellow: '黄', green: '緑', blue: '青', purple: '紫', pink: '桃', brown: '茶', gray: '灰' }[c] + 'の背景</option>').join('')}</select></label>
        <label class="r"><span>ポモドーロ</span><input type="number" data-p="pomo" value="${P.pomo}" style="max-width:70px"> 分　休憩 <input type="number" data-p="brk" value="${P.brk}" style="max-width:60px"> 分　4 回ごとに <input type="number" data-p="longBrk" value="${P.longBrk}" style="max-width:60px"> 分</label>
        <label class="r"><span>続きから読む</span><input type="checkbox" data-p="resume"${P.resume ? ' checked' : ''}> 長いページを開いた時に、前回の場所を教える</label></div>
      <div class="btns"><button class="b" data-x>閉じる</button></div>`, (d, close) => {
      d.querySelector('[data-x]').onclick = close;
      d.querySelectorAll('[data-a]').forEach((b) => {
        b.onclick = () => {
          const a = b.dataset.a; close();
          if (a === 'sheet') openSheet(null); else if (a === 'macro') { if (SH) macroDialog(); else openSheet(null).then(() => SH && macroDialog()); }
          else if (a === 'calc') evalSelection(); else if (a === 'red') setRed(); else if (a === 'cloze') setCloze(); else if (a === 'deck') deckDialog();
          else if (a === 'pomo') { if (window.Notification && Notification.permission === 'default') Notification.requestPermission(); pomoStart('work'); }
        };
      });
      d.querySelectorAll('[data-rev]').forEach((b) => { b.onclick = () => { close(); review(DECKS[+b.dataset.rev]); }; });
      d.querySelectorAll('[data-p]').forEach((x) => { x.addEventListener('change', () => { const k = x.dataset.p; P[k] = x.type === 'checkbox' ? x.checked : x.type === 'number' ? +x.value : x.value; saveP(); if (k === 'clozeColor') studyCss(); if (k === 'cfToNotion') { if (!P.cfToNotion) { const st = document.getElementById('s38-cf'); if (st) st.textContent = ''; } else restoreCf(); } }); });
      d.querySelectorAll('[data-red]').forEach((x) => { x.addEventListener('change', () => { const c = x.dataset.red; P.redColors = P.redColors.filter((y) => y !== c); if (x.checked) P.redColors.push(c); saveP(); studyCss(); }); });
    });
  }

  /* ============================================================
   *  15. v11.0.0 — 学びを「社労士」「語学」「記録」まで
   * ============================================================ */
  const K2 = { quiz: 'c38.quiz', quizMaps: 'c38.quizmaps', gloss: 'c38.gloss', ledgers: 'c38.ledgers', anniv: 'c38.anniv', drill: 'c38.drill' };
  P.exam = Object.assign({ name: '社会保険労務士試験', date: '', on: true }, P.exam || {});
  P.tts = Object.assign({ rate: 1, lang: 'auto' }, P.tts || {});
  P.gloss = Object.assign({ on: true, kw: false }, P.gloss || {});
  P.readGoal = P.readGoal || 50;
  P.pass = Object.assign({ selTotal: 24, selEach: 3, mcTotal: 44, mcEach: 4 }, P.pass || {});

  /* ---------- 社労士の科目（選択式 8・択一式 7） ---------- */
  const SR = {
    sel: [['rk', '労働基準法・労働安全衛生法'], ['rs', '労働者災害補償保険法'], ['ko', '雇用保険法'], ['ri', '労務管理その他の労働に関する一般常識'], ['si', '社会保険に関する一般常識'], ['ke', '健康保険法'], ['kn', '厚生年金保険法'], ['ko2', '国民年金法']],
    mc: [['rk', '労働基準法・労働安全衛生法'], ['rs', '労災保険法（徴収法を含む）'], ['ko', '雇用保険法（徴収法を含む）'], ['ip', '労務管理その他の労働・社会保険に関する一般常識'], ['ke', '健康保険法'], ['kn', '厚生年金保険法'], ['ko2', '国民年金法']],
    /* 用語を光らせる（科目の手がかり）。乗せると「どの科目の言葉か」 */
    kw: {
      '労基・安衛': ['労働基準法', '労働契約', '解雇予告', '平均賃金', '休業手当', '時間外労働', '36協定', '三六協定', '変形労働時間制', '年次有給休暇', '就業規則', '労働安全衛生法', '安全衛生委員会', '産業医', '衛生管理者', 'ストレスチェック', '健康診断', '割増賃金', '法定労働時間', '休憩', '休日'],
      '労災': ['労災保険', '業務災害', '通勤災害', '療養補償給付', '休業補償給付', '障害補償給付', '遺族補償給付', '傷病補償年金', '介護補償給付', '二次健康診断', '特別加入', '給付基礎日額', 'メリット制'],
      '雇用': ['雇用保険', '基本手当', '被保険者期間', '所定給付日数', '算定基礎期間', '特定受給資格者', '高年齢求職者給付金', '育児休業給付', '介護休業給付', '教育訓練給付', '就業促進手当', '失業の認定', '受給期間'],
      '徴収': ['労働保険料', '概算保険料', '確定保険料', '一般保険料', '印紙保険料', '年度更新', '労働保険事務組合', '延納'],
      '一般常識': ['労働組合法', '労働契約法', '最低賃金法', '男女雇用機会均等法', '育児・介護休業法', 'パートタイム・有期雇用労働法', '労働者派遣法', '職業安定法', '高年齢者雇用安定法', '障害者雇用促進法', '労働施策総合推進法', '社会保険労務士法', '確定給付企業年金法', '確定拠出年金法', '介護保険法', '国民健康保険法', '高齢者医療確保法', '船員保険法', '児童手当法'],
      '健保': ['健康保険', '標準報酬月額', '標準賞与額', '傷病手当金', '出産手当金', '出産育児一時金', '高額療養費', '療養の給付', '入院時食事療養費', '任意継続被保険者', '被扶養者', '埋葬料', '保険外併用療養費', '訪問看護療養費'],
      '厚年': ['厚生年金保険', '老齢厚生年金', '障害厚生年金', '遺族厚生年金', '在職老齢年金', '加給年金額', '報酬比例部分', '中高齢寡婦加算', '離婚時の年金分割', '3号分割', '特別支給の老齢厚生年金', '平均標準報酬額'],
      '国年': ['国民年金', '老齢基礎年金', '障害基礎年金', '遺族基礎年金', '付加年金', '寡婦年金', '死亡一時金', '保険料免除', '学生納付特例', '第1号被保険者', '第2号被保険者', '第3号被保険者', '振替加算', '受給資格期間', '保険料納付済期間', '合算対象期間', '繰上げ', '繰下げ']
    }
  };
  /* 試験の日: 8 月の第 4 日曜日（例年）。設定で変えられる */
  function examDate() {
    if (P.exam.date && /^\d{4}-\d{2}-\d{2}$/.test(P.exam.date)) { const [y, m, d] = P.exam.date.split('-').map(Number); return new Date(y, m - 1, d); }
    const now = new Date(); now.setHours(0, 0, 0, 0);
    for (let y = now.getFullYear(); y < now.getFullYear() + 3; y++) {
      const d = new Date(y, 7, 1); const first = (7 - d.getDay()) % 7; const fourth = new Date(y, 7, 1 + first + 21);
      if (fourth >= now) return fourth;
    }
    return null;
  }
  const daysUntil = (d) => { if (!d) return null; const a = new Date(); a.setHours(0, 0, 0, 0); return Math.round((d - a) / 86400000); };

  /* ---------- 社労士の計算（Excel の式に足す） ---------- */
  (() => {
    const F = ENGINE.FN, num = ENGINE.num, isErr = ENGINE.isErr, E = ENGINE.E, sp = ENGINE.serialParts, ymd2 = ENGINE.ymdSerial;
    const todayS = () => { const d = new Date(); return ymd2(d.getFullYear(), d.getMonth() + 1, d.getDate()); };
    /* 健康保険の標準報酬月額（50 等級）。境目は「以上〜未満」 */
    const KENPO = [[58000, 0], [68000, 63000], [78000, 73000], [88000, 83000], [98000, 93000], [104000, 101000], [110000, 107000], [118000, 114000], [126000, 122000], [134000, 130000], [142000, 138000], [150000, 146000], [160000, 155000], [170000, 165000], [180000, 175000], [190000, 185000], [200000, 195000], [220000, 210000], [240000, 230000], [260000, 250000], [280000, 270000], [300000, 290000], [320000, 310000], [340000, 330000], [360000, 350000], [380000, 370000], [410000, 395000], [440000, 425000], [470000, 455000], [500000, 485000], [530000, 515000], [560000, 545000], [590000, 575000], [620000, 605000], [650000, 635000], [680000, 665000], [710000, 695000], [750000, 730000], [790000, 770000], [830000, 810000], [880000, 855000], [930000, 905000], [980000, 955000], [1030000, 1005000], [1090000, 1055000], [1150000, 1115000], [1210000, 1175000], [1270000, 1235000], [1330000, 1295000], [1390000, 1355000]];
    const kenpoGrade = (w) => { let g = 1; for (let i = 0; i < KENPO.length; i++) if (w >= KENPO[i][1]) g = i + 1; return g; };
    /* HYOJUN(報酬月額, ["健保"|"厚年"], ["等級"]) → 標準報酬月額（または等級） */
    F.HYOJUN = (w, kind, what) => {
      w = num(w); if (isErr(w)) return w;
      const k = String(kind == null ? '健保' : kind);
      let g = kenpoGrade(w), v = KENPO[g - 1][0];
      if (/厚|年金|kn/i.test(k)) { g = Math.max(1, Math.min(32, g - 3)); v = KENPO[g + 2][0]; }
      return /等級|grade/i.test(String(what || '')) ? g : v;
    };
    /* NENREI(生年月日, [その日]) → 法律上の年齢（年齢計算ニ関スル法律: 誕生日の前日の終わりに 1 つ増える） */
    F.NENREI = (b, at) => {
      b = num(b); at = at == null ? todayS() : num(at); if (isErr(b)) return b; if (isErr(at)) return at;
      const x = sp(b), y = sp(at + 1);   // 前日に加齢 → その日の翌日で数えるのと同じ
      let a = y.y - x.y; if (y.m < x.m || (y.m === x.m && y.d < x.d)) a--;
      return a;
    };
    /* TASSHIBI(生年月日, 年齢) → その年齢に「達した日」（＝誕生日の前日）。例 60 歳に達した日 */
    F.TASSHIBI = (b, n) => { b = num(b); n = num(n); if (isErr(b)) return b; if (isErr(n)) return n; const x = sp(b); return ymd2(x.y + n, x.m, x.d) - 1; };
    /* KIKAN(起算の出来事の日, 長さ, "日"|"週"|"月"|"年", [初日を入れる]) → 期間の末日（民法 140〜143 条: 初日不算入・応当日の前日・応当日が無ければ月末） */
    F.KIKAN = (s, n, unit, first) => {
      s = num(s); n = num(n); if (isErr(s)) return s; if (isErr(n)) return n;
      const u = String(unit == null ? '日' : unit);
      const start = first === true || /TRUE|1|入/.test(String(first || '')) ? Math.floor(s) : Math.floor(s) + 1;   // 起算日
      if (/日|d/i.test(u) && !/月|年/.test(u)) return start + n - 1;
      if (/週|w/i.test(u)) return start + n * 7 - 1;
      const p = sp(start), months = /年|y/i.test(u) ? n * 12 : n;
      let y = p.y, m = p.m + months; y += Math.floor((m - 1) / 12); m = ((m - 1) % 12) + 1;
      const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
      if (p.d > last) return ymd2(y, m, last);   // 応当日が無い → その月の末日
      return ymd2(y, m, p.d) - 1;                // 応当日の前日
    };
    /* SOUSHITSU(退職日) → 資格喪失日（翌日）。SHIKEN() → 試験までの日数 */
    F.SOUSHITSU = (d) => { d = num(d); return isErr(d) ? d : Math.floor(d) + 1; };
    F.SHIKEN = () => { const d = examDate(); return d ? daysUntil(d) : E.NA(); };
    F['標準報酬'] = F.HYOJUN; F['年齢'] = F.NENREI; F['達した日'] = F.TASSHIBI; F['期間末日'] = F.KIKAN;
  })();

  /* ============================================================
   *  15.1 上の帯の Σ と小窓（三本柱の共通の形 — ³⁷ Lumière と同じ CSS）
   * ============================================================ */
  const CORDI_UI = 'var(--cordi-ui, var(--cordi-ui-fallback, -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", sans-serif))';
  const POP_CSS = `
:root { --cordi-ui-fallback: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Segoe UI", sans-serif; }
#cordi-dock { display: inline-flex; align-items: center; gap: 1px; margin-inline: 2px 6px; flex: none; height: 28px; }
#cordi-dock .cd-b { order: var(--cd-o, 5); width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--c-icoSec, #91918e); border: 0; background: transparent; padding: 0; position: relative; }
#cordi-dock .cd-b:hover { background: var(--ca-bacIntTra, rgba(55,53,47,.06)); color: var(--c-icoPri, #37352f); }
#cordi-dock .cd-b[aria-expanded="true"] { background: var(--ca-bacIntTra, rgba(55,53,47,.08)); color: var(--c-texPri, #37352f); }
#cordi-dock .cd-b svg { width: 18px; height: 18px; display: block; }
#cordi-dock .cd-b .cd-badge { position: absolute; top: 1px; right: 0; min-width: 13px; height: 13px; padding: 0 3px; border-radius: 999px; font: 600 8.5px/13px ${CORDI_UI}; text-align: center; background: var(--lm-accent, var(--c-bluIcoAccPri, #2383e2)); color: #fff; box-shadow: 0 0 0 1.5px var(--c-bacPri, #fff); }
#cordi-dock .cd-b .cd-badge:empty { display: none; }
.cordi-pop { position: fixed; z-index: 2147483100; width: 320px; max-height: min(78vh, 680px); overflow: auto; overscroll-behavior: contain; box-sizing: border-box; padding: 6px; border-radius: 12px; background: var(--c-bacEle, #fff); color: var(--c-texPri, #37352f);
  box-shadow: var(--c-shaOutLg, 0 0 0 1px rgba(15,15,15,.05), 0 3px 6px rgba(15,15,15,.1), 0 9px 24px rgba(15,15,15,.2)); font: 13.5px/1.4 ${CORDI_UI}; font-feature-settings: "palt" 1; -webkit-font-smoothing: antialiased; animation: cordi-pop-in .14s cubic-bezier(.2,.8,.2,1); }
@keyframes cordi-pop-in { from { opacity: 0; transform: translateY(-3px) scale(.985); } to { opacity: 1; transform: none; } }
.cordi-pop * { box-sizing: border-box; }
.cordi-pop .cp-hd { display: flex; align-items: baseline; gap: 8px; padding: 8px 10px 6px; }
.cordi-pop .cp-hd b { font: 600 15px/1.1 var(--cordi-ui-display, "Cordivestium Group Header", "Baskerville", "Cormorant Garamond", "Hiragino Mincho ProN", Georgia, serif); letter-spacing: .03em; }
.cordi-pop .cp-hd span { color: var(--c-texSec, #787774); font-size: 11.5px; }
.cordi-pop .cp-hd i { margin-inline-start: auto; font-style: normal; font-size: 10.5px; color: var(--c-texTer, #a5a29a); }
.cordi-pop .cp-sec { padding: 10px 10px 4px; font-size: 11px; font-weight: 600; color: var(--c-texSec, #787774); letter-spacing: .02em; }
.cordi-pop .cp-div { height: 1px; margin: 6px 4px; background: var(--ca-borSecTra, rgba(55,53,47,.09)); }
.cordi-pop .cp-i { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 30px; padding: 4px 10px; border: 0; background: none; color: inherit; font: inherit; text-align: left; border-radius: 7px; cursor: pointer; }
.cordi-pop .cp-i:hover { background: var(--ca-bacIntTra, rgba(55,53,47,.06)); }
.cordi-pop .cp-i .ic { width: 20px; height: 20px; flex: none; display: flex; align-items: center; justify-content: center; color: var(--c-icoPri, #37352f); font-size: 15px; }
.cordi-pop .cp-i .ic svg { width: 18px; height: 18px; }
.cordi-pop .cp-i .lb { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cordi-pop .cp-i .lb small { display: block; font-size: 11px; color: var(--c-texSec, #787774); white-space: normal; line-height: 1.35; margin-top: 1px; }
.cordi-pop .cp-i .k { font-size: 11px; color: var(--c-texTer, #a5a29a); white-space: nowrap; font-variant-numeric: tabular-nums; }
.cordi-pop .cp-sw { flex: none; width: 28px; height: 16px; border-radius: 999px; background: var(--ca-borPriTra, rgba(55,53,47,.16)); position: relative; transition: background-color .18s; }
.cordi-pop .cp-sw::after { content: ""; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: transform .18s cubic-bezier(.2,.8,.2,1); }
.cordi-pop .cp-sw.on { background: var(--lm-accent, var(--c-bluIcoAccPri, #2383e2)); }
.cordi-pop .cp-sw.on::after { transform: translateX(12px); }
.cordi-pop .cp-note { padding: 4px 12px 8px; font-size: 11.5px; color: var(--c-texSec, #787774); line-height: 1.55; }
.cordi-pop .s38-hero { margin: 4px 6px 6px; padding: 12px 14px; border-radius: 10px; background: color-mix(in srgb, var(--lm-accent, #2383e2) 8%, transparent); display: flex; align-items: center; gap: 14px; }
.cordi-pop .s38-hero .n { font: 600 30px/1 ${CORDI_UI}; font-variant-numeric: tabular-nums; letter-spacing: -.01em; color: var(--c-texPri, #37352f); }
.cordi-pop .s38-hero .n small { font-size: 13px; font-weight: 500; margin-left: 2px; }
.cordi-pop .s38-hero .t { font-size: 12px; color: var(--c-texSec, #787774); line-height: 1.45; }
.cordi-pop .s38-hero .t b { color: var(--c-texPri, #37352f); font-weight: 600; }
.cordi-pop .s38-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 0 6px 6px; }
.cordi-pop .s38-tiles div { padding: 8px 10px; border-radius: 9px; background: var(--ca-bacSecTra, rgba(55,53,47,.035)); }
.cordi-pop .s38-tiles b { display: block; font: 600 17px/1.1 ${CORDI_UI}; font-variant-numeric: tabular-nums; }
.cordi-pop .s38-tiles span { font-size: 10.5px; color: var(--c-texSec, #787774); }
.cordi-pop .s38-bar { height: 4px; border-radius: 4px; background: var(--ca-borSecTra, rgba(55,53,47,.09)); overflow: hidden; margin-top: 6px; }
.cordi-pop .s38-bar i { display: block; height: 100%; border-radius: 4px; background: var(--lm-accent, #2383e2); }`;
  function popCss() { if (!document.getElementById('s38-pop-css')) { const st = document.createElement('style'); st.id = 's38-pop-css'; st.textContent = POP_CSS; document.head.appendChild(st); } }
  function dock() {
    popCss();
    const more = document.querySelector('.notion-topbar-more-button'), share = document.querySelector('.notion-topbar-share-menu');
    const anchor = share || more;
    const bar = document.querySelector('.notion-topbar-action-buttons') || (anchor && anchor.parentElement);
    if (!bar) return null;
    let d = document.getElementById('cordi-dock');
    if (!d) { d = document.createElement('div'); d.id = 'cordi-dock'; }
    let ref = anchor; while (ref && ref.parentElement !== bar) ref = ref.parentElement;
    if (d.parentElement !== bar || (ref && d.nextElementSibling !== ref)) bar.insertBefore(d, ref || bar.firstChild);
    let b = document.getElementById('cordi-b-s38');
    if (!b) {
      b = document.createElement('button'); b.id = 'cordi-b-s38'; b.className = 'cd-b'; b.type = 'button'; b.style.setProperty('--cd-o', '4');
      b.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5H5.5l5 5.5-5 5.5h9"/></svg><span class="cd-badge"></span>';
      b.title = 'Scholar — 学び・計算・記録';
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); popOpen(b); });
    }
    if (b.parentElement !== d) d.appendChild(b);
    b.querySelector('.cd-badge').textContent = dueCount() ? String(Math.min(99, dueCount())) : '';
    return b;
  }
  function dueCount() { const t = dayNum(); let n = 0; for (const k of Object.keys(SRS)) if (SRS[k].due <= t) n++; return n; }
  let pop = null, popB = null;
  function popClose() { if (pop) pop.remove(); pop = null; if (popB) popB.setAttribute('aria-expanded', 'false'); popB = null; }
  document.addEventListener('cordi:closepops', (e) => { if (e.detail !== 's38') popClose(); });
  const ICO = {
    sheet: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="4" width="14" height="12" rx="2"/><path d="M3 8h14M3 12h14M8 4v12"/></svg>',
    card: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="5" y="3.5" width="11" height="13" rx="2"/><path d="M3.5 6v9.5a1.5 1.5 0 0 0 1.5 1.5h8"/></svg>',
    ox: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="6.5" cy="10" r="3.5"/><path d="M12 6.5l7 7M19 6.5l-7 7" transform="translate(-1.5 0)"/></svg>',
    blank: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M3 6h5M12 6h5M3 10h2M9 10h8M3 14h9"/><rect x="8" y="4.5" width="4" height="3" rx=".8" fill="currentColor" stroke="none" opacity=".35"/></svg>',
    red: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="14" height="10" rx="2" fill="#d94a3a" fill-opacity=".22"/><path d="M6 10h8"/></svg>',
    gauge: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M3.5 13.5a6.5 6.5 0 1 1 13 0"/><path d="M10 13.5l3-4"/></svg>',
    speak: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h2.5L10 5v10l-3.5-3H4z"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5.5a6.5 6.5 0 0 1 0 9"/></svg>',
    pen: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16l1-3.5L13.5 4l2.5 2.5L7.5 15z"/><path d="M4 16h12" opacity=".4"/></svg>',
    book: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M10 5.5c-1.8-1.3-4-1.6-6.5-1.2v11c2.5-.4 4.7-.1 6.5 1.2 1.8-1.3 4-1.6 6.5-1.2v-11c-2.5-.4-4.7-.1-6.5 1.2z"/><path d="M10 5.5v11"/></svg>',
    heart: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M10 16s-6-3.6-6-8a3.2 3.2 0 0 1 6-1.6A3.2 3.2 0 0 1 16 8c0 4.4-6 8-6 8z"/></svg>',
    news: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="4" width="14" height="12" rx="2"/><path d="M6 7.5h8M6 10.5h3M11.5 10.5h2.5M6 13h8" stroke-linecap="round"/></svg>',
    dict: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M4 15.5V5a1.5 1.5 0 0 1 1.5-1.5H16v10H5.5A1.5 1.5 0 0 0 4 15a1.5 1.5 0 0 0 1.5 1.5H16"/><path d="M8 7h5M8 9.5h3"/></svg>',
    timer: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="10" cy="11" r="6"/><path d="M10 8v3l2 1.5M8 2.8h4"/></svg>',
    fx: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M9 4.5c-1.6 0-2.2.9-2.5 2.6L5 15.5M4 9h5M11 9l4.5 5M15.5 9L11 14"/></svg>',
    gear: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="10" cy="10" r="2.6"/><path d="M10 2.8v2M10 15.2v2M17.2 10h-2M4.8 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3L4.9 4.9" stroke-linecap="round"/></svg>',
    chart: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M4 16V9M8.5 16V5M13 16v-5M17 16V7.5"/></svg>'
  };
  function popHtml() {
    const hm = heatmap(), ex = examDate(), dn = daysUntil(ex), due = dueCount();
    const today = hm.today, goal = P.goal || 120;
    const sw = (v) => '<span class="cp-sw' + (v ? ' on' : '') + '"></span>';
    const it = (a, ic, label, sub, k, right) => '<button class="cp-i" data-s="' + a + '"><span class="ic">' + (ICO[ic] || ic) + '</span><span class="lb">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + (right != null ? right : k ? '<span class="k">' + k + '</span>' : '') + '</button>';
    let h = '<div class="cp-hd"><b>Scholar</b><span>学び・計算・記録</span><i>³⁸ v' + VERSION + '</i></div>';
    if (P.exam.on && dn != null) h += '<div class="s38-hero" data-s="examcfg" title="押すと試験の名前・日を変えられます"><div class="n">' + (dn >= 0 ? dn : 0) + '<small>日</small></div><div class="t"><b>' + esc(P.exam.name) + '</b> まで<br>' + ex.getFullYear() + '年' + (ex.getMonth() + 1) + '月' + ex.getDate() + '日（' + '日月火水木金土'[ex.getDay()] + '）' + (dn > 0 ? '・あと ' + Math.ceil(dn / 7) + ' 週' : '') + '</div></div>';
    h += '<div class="s38-tiles"><div><b>' + today + '<small style="font-size:11px">分</small></b><span>今日の学習</span><div class="s38-bar"><i style="width:' + Math.min(100, today / goal * 100).toFixed(0) + '%"></i></div></div><div><b>' + hm.streak + '<small style="font-size:11px">日</small></b><span>続けて</span></div><div><b>' + due + '<small style="font-size:11px">枚</small></b><span>今日の復習</span></div></div>';
    const ann = annivSoon();
    if (ann.length) h += '<div class="cp-note">もうすぐ: ' + ann.slice(0, 3).map((a) => '<b>' + esc(a.name) + '</b> ' + esc(a.what) + (a.days === 0 ? '（今日！）' : ' まで ' + a.days + ' 日')).join('　') + '</div>';
    h += '<div class="cp-sec">覚える</div>';
    h += it('review', 'card', '単語帳を復習', due ? '期限の来たカード ' + due + ' 枚' : DECKS.length ? '今日の分は済みました' : 'DB のビューから単語帳を作る', '', due ? '<span class="k">' + due + '</span>' : null);
    h += it('quiz', 'ox', '○×で解く（肢別）', '過去問の DB を ○×演習に。間違えたものは単語帳へ', '');
    h += it('drill', 'blank', '選択式ドリル', 'このページの赤字・太字・数字を空欄にして選択肢から選ぶ', '');
    h += it('red', 'red', '赤シート', '赤い文字を隠す', '⌃⌥K', '<span class="k">⌃⌥K</span>' + sw(STUDY.red));
    h += it('cloze', 'blank', '穴埋め', '色を付けた背景の語を空欄に', '', '<span class="k">⌃⌥H</span>' + sw(STUDY.cloze));
    h += it('gloss', 'dict', '用語に乗せて意味を出す', GLOSS.terms.length ? '用語集 ' + GLOSS.terms.length + ' 語' + (P.gloss.kw ? '・社労士の用語も光らせる' : '') : '用語集の DB を選ぶ（乗せると意味が出る）', '', sw(P.gloss.on && (GLOSS.terms.length || P.gloss.kw)));
    h += '<div class="cp-sec">試験</div>';
    h += it('pass', 'gauge', '基準点チェッカー', '選択式・択一式の点を入れて、合否と足りない科目を見る', '');
    h += '<div class="cp-sec">語学・読む</div>';
    h += it('speak', 'speak', '読み上げる', '選んだ文字（無ければ今の段落から）', '⌃⌥T');
    h += it('dictation', 'pen', '書き取り', '選んだ文を聞いて打ち込み、違いを見る', '');
    h += '<div class="cp-sec">記録</div>';
    h += it('ledger:read', 'book', '読書の記録', ledgerHint('read'), '');
    h += it('ledger:oshi', 'heart', '推しの記録', ledgerHint('oshi'), '');
    h += it('ledger:news', 'news', 'ニュースのクリップ', ledgerHint('news'), '');
    h += it('log', 'chart', '学習の記録（草）', '今週 ' + hm.week + ' 分', '');
    h += '<div class="cp-sec">計算</div>';
    h += it('sheet', 'sheet', 'いまの表をシートで開く', 'Excel の式・計算の列・条件付き書式・書き戻し', '⌃⌥E');
    h += it('calc', 'fx', '選んだ式を計算', '=KIKAN(…)・=HYOJUN(…) など社労士の計算も', '⌃⌥=');
    h += it('pomo', 'timer', POMO.el ? 'ポモドーロを止める' : 'ポモドーロ ' + P.pomo + ' 分', '', '');
    h += '<div class="cp-div"></div>' + it('panel', 'gear', 'Scholar の設定…', '赤シートの色・ポモドーロ・試験の日・マクロ', '');
    return h;
  }
  function popOpen(btn) {
    if (pop && popB === btn) { popClose(); return; }
    popClose(); document.dispatchEvent(new CustomEvent('cordi:closepops', { detail: 's38' }));
    popCss();
    pop = document.createElement('div'); pop.className = 'cordi-pop'; pop.id = 's38-pop';
    popB = btn; btn.setAttribute && btn.setAttribute('aria-expanded', 'true');
    document.body.appendChild(pop);
    const draw = () => { pop.innerHTML = popHtml(); const r = btn.getBoundingClientRect(); pop.style.top = Math.min(innerHeight - pop.offsetHeight - 8, r.bottom + 6) + 'px'; pop.style.left = Math.max(8, Math.min(innerWidth - pop.offsetWidth - 8, r.right - pop.offsetWidth + 4)) + 'px'; };
    draw(); pop.__draw = draw;
    pop.addEventListener('click', (e) => { const el = e.target.closest('[data-s]'); if (!el) return; const a = el.dataset.s; const keep = /^(red|cloze|gloss)$/.test(a); if (!keep) popClose(); act(a); if (keep && pop) draw(); });
    setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!pop) { document.removeEventListener('pointerdown', off, true); return; } if (pop.contains(e.target) || btn.contains(e.target)) return; document.removeEventListener('pointerdown', off, true); popClose(); }, true), 0);
  }
  function act(a, arg) {
    if (a === 'review') { const t = dayNum(); const d = DECKS.find((k) => Object.entries(SRS).some(([id, c]) => id.startsWith(k.id + ':') && c.due <= t)) || DECKS[0]; if (d && dueCount()) review(d); else deckDialog(); }
    else if (a === 'quiz') quizStart();
    else if (a === 'drill') drillStart();
    else if (a === 'red') setRed();
    else if (a === 'cloze') setCloze();
    else if (a === 'gloss') glossToggle();
    else if (a === 'pass') passDialog();
    else if (a === 'speak') speak(arg);
    else if (a === 'dictation') dictation(arg);
    else if (a.startsWith('ledger:')) ledgerOpen(a.slice(7));
    else if (a === 'log') panel();
    else if (a === 'sheet') openSheet(null);
    else if (a === 'calc') evalSelection();
    else if (a === 'pomo') { if (POMO.el) pomoStop(); else { if (window.Notification && Notification.permission === 'default') Notification.requestPermission(); pomoStart('work'); } }
    else if (a === 'panel') panel();
    else if (a === 'examcfg') examDialog();
  }
  /* ほかの柱・Atelier の ⋯ メニューから */
  document.addEventListener('cordi:run', (e) => {
    let d = e.detail; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { d = { id: d }; } }
    if (!d || !d.id || !/^s38\./.test(d.id)) return;
    const a = d.id.slice(4);
    if (a === 'pop') { const b = document.getElementById('cordi-b-s38') || dock(); if (b) popOpen(b); return; }
    act(a, d.text);
  });
  document.addEventListener('cordi:tools?', announce);
  function announce() {
    document.dispatchEvent(new CustomEvent('cordi:tools', { detail: JSON.stringify({ pillar: 's38', name: 'Scholar', tools: [
      { id: 's38.pop', label: '学び・計算・記録', hint: dueCount() ? '復習 ' + dueCount() + ' 枚' : '' },
      { id: 's38.speak', label: '読み上げる', sel: true }, { id: 's38.calc', label: '選んだ式を計算', sel: true }, { id: 's38.dictation', label: '書き取り', sel: true },
      { id: 's38.drill', label: '選択式ドリル' }, { id: 's38.red', label: '赤シート' }
    ] }) }));
  }

  /* ============================================================
   *  15.2 試験の日・基準点チェッカー
   * ============================================================ */
  function examDialog() {
    css();
    const ex = examDate();
    dialog(`<h3>試験</h3><p class="d">試験までの日数を Scholar の小窓に出します。空欄なら「8 月の第 4 日曜日」（社労士試験の例年の日）。</p>
      <label class="r"><span>名前</span><input type="text" data-k="name" value="${esc(P.exam.name)}"></label>
      <label class="r"><span>日</span><input type="date" data-k="date" value="${esc(P.exam.date || '')}" placeholder="${ex ? ymd(ex) : ''}"></label>
      <label class="r"><span>小窓に出す</span><input type="checkbox" data-k="on"${P.exam.on ? ' checked' : ''}></label>
      <label class="r"><span>1 日の目標</span><input type="number" data-k="goal" value="${P.goal || 120}" style="max-width:80px"> 分</label>
      <div class="btns"><button class="b pri" data-ok>保存</button><button class="b" data-x>閉じる</button></div>`, (d, close) => {
      d.querySelector('[data-x]').onclick = close;
      d.querySelector('[data-ok]').onclick = () => { const g = (k) => d.querySelector('[data-k="' + k + '"]'); P.exam.name = g('name').value.trim() || '試験'; P.exam.date = g('date').value; P.exam.on = g('on').checked; P.goal = +g('goal').value || 120; saveP(); close(); toast('保存しました'); };
    });
  }
  function passDialog() {
    css();
    const S0 = store.get('c38.passScores', { sel: {}, mc: {} });
    const row = (kind, [id, nm], max) => '<tr><td>' + esc(nm) + '</td><td><input type="number" min="0" max="' + max + '" data-' + kind + '="' + id + '" value="' + (S0[kind][id] != null ? S0[kind][id] : '') + '" style="width:64px"> / ' + max + '</td><td class="st" data-st-' + kind + '="' + id + '"></td></tr>';
    dialog(`<h3>基準点チェッカー</h3><p class="d">本試験・模試の点を入れると、総得点と科目ごとの基準点を同時に確かめます。基準点は年ごとに変わります（救済もある）— 発表に合わせて下の値を変えてください。</p>
      <div class="step"><div class="sh">選択式（各 5 点）</div><table class="s38-pt">${SR.sel.map((s) => row('sel', s, 5)).join('')}</table></div>
      <div class="step"><div class="sh">択一式（各 10 点）</div><table class="s38-pt">${SR.mc.map((s) => row('mc', s, 10)).join('')}</table></div>
      <div class="step"><div class="sh">合格の基準</div>
        <label class="r"><span>選択式</span>総得点 <input type="number" data-pass="selTotal" value="${P.pass.selTotal}" style="width:60px"> 点以上・各 <input type="number" data-pass="selEach" value="${P.pass.selEach}" style="width:50px"> 点以上</label>
        <label class="r"><span>択一式</span>総得点 <input type="number" data-pass="mcTotal" value="${P.pass.mcTotal}" style="width:60px"> 点以上・各 <input type="number" data-pass="mcEach" value="${P.pass.mcEach}" style="width:50px"> 点以上</label></div>
      <div class="step s38-verdict"></div>
      <div class="btns"><button class="b" data-x>閉じる</button></div>`, (d, close) => {
      d.querySelector('[data-x]').onclick = close;
      const upd = () => {
        for (const x of d.querySelectorAll('[data-pass]')) P.pass[x.dataset.pass] = +x.value || 0;
        saveP();
        const sc = { sel: {}, mc: {} };
        let tot = { sel: 0, mc: 0 }, filled = { sel: 0, mc: 0 }; const low = { sel: [], mc: [] };
        for (const kind of ['sel', 'mc']) for (const [id, nm] of SR[kind]) {
          const x = d.querySelector('[data-' + kind + '="' + id + '"]'); const v = x.value === '' ? null : +x.value;
          sc[kind][id] = v;
          const st = d.querySelector('[data-st-' + kind + '="' + id + '"]');
          if (v == null) { st.textContent = ''; continue; }
          filled[kind]++; tot[kind] += v;
          const need = kind === 'sel' ? P.pass.selEach : P.pass.mcEach;
          st.innerHTML = v >= need ? '<span class="ok">✓ 基準点</span>' : '<span class="ng">▲ あと ' + (need - v) + ' 点</span>';
          if (v < need) low[kind].push(nm.replace(/（.*$/, ''));
        }
        store.set('c38.passScores', sc);
        const okSel = tot.sel >= P.pass.selTotal && !low.sel.length, okMc = tot.mc >= P.pass.mcTotal && !low.mc.length;
        const v = d.querySelector('.s38-verdict');
        if (!filled.sel && !filled.mc) { v.innerHTML = '<p class="d">点を入れると、ここに結果が出ます。</p>'; return; }
        const line = (k, ok, t, need) => '<div class="vl ' + (ok ? 'ok' : 'ng') + '"><b>' + k + '</b> ' + t + ' 点 / 基準 ' + need + ' 点 — ' + (ok ? '基準を満たしています' : (t < need ? '総得点が ' + (need - t) + ' 点足りません' : '') + (low[k === '選択式' ? 'sel' : 'mc'].length ? '　足りない科目: ' + low[k === '選択式' ? 'sel' : 'mc'].join('・') : '')) + '</div>';
        v.innerHTML = line('選択式', okSel, tot.sel, P.pass.selTotal) + line('択一式', okMc, tot.mc, P.pass.mcTotal) + '<div class="big ' + (okSel && okMc ? 'ok' : 'ng') + '">' + (okSel && okMc ? '合格ライン' : 'もう一歩') + '</div>';
      };
      d.querySelectorAll('input').forEach((x) => x.addEventListener('input', upd));
      upd();
    });
  }

  /* ============================================================
   *  15.3 ○×演習（肢別）— 過去問の DB から
   *       列: 問い（文）・正解（○×・はい/いいえ・チェック・正/誤）・解説・科目・年度（どれも名前から推定、選び直せる）
   * ============================================================ */
  let QUIZ = store.get(K2.quiz, {});        // 'blockId:rowId' → { n, ok, last, wrong }
  let QMAPS = store.get(K2.quizMaps, {});   // viewId → { q, a, x, subj, year }
  const truthy = (v) => { if (v === true) return true; if (v === false) return false; const s = String(v == null ? '' : ENGINE.show(v)).trim(); if (/^(○|〇|◯|o|O|true|TRUE|正|正しい|はい|yes|1|適切)$/.test(s)) return true; if (/^(×|✕|x|X|false|FALSE|誤|誤り|いいえ|no|0|不適切)$/.test(s)) return false; return null; };
  function guessCol(cols, re, types) { const c = cols.find((x) => re.test(x.name) && (!types || types.includes(x.type))) || (types ? cols.find((x) => types.includes(x.type) && re.test(x.name)) : null); return c ? c.name : ''; }
  async function quizStart() {
    css();
    const v = findView();
    if (!v || !v.viewId) { toast('過去問の DB（表のビュー）を開いてから選んでください'); return; }
    let data; try { toast('問題を読んでいます…'); data = await loadView(v, { allProps: true }); } catch (e) { toast('読めませんでした: ' + e.message); return; }
    const cols = data.cols;
    const m0 = QMAPS[v.viewId] || {
      q: guessCol(cols, /問題|問い|設問|肢|question|本文/i) || (cols.find((c) => c.type === 'title') || cols[0]).name,
      a: guessCol(cols, /正解|答え|正誤|○×|答|answer/i), x: guessCol(cols, /解説|説明|根拠|explanation|メモ/i),
      subj: guessCol(cols, /科目|分野|subject|法/i, ['select', 'multi_select', 'text', 'status']), year: guessCol(cols, /年度|年|year|回/i)
    };
    const opt = (sel) => '<option value="">（なし）</option>' + cols.map((c) => '<option' + (c.name === sel ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('');
    const subjects = [...new Set(data.rows.map((r) => { const i = cols.findIndex((c) => c.name === m0.subj); return i >= 0 ? ENGINE.show(r.vals[i]) : ''; }).filter(Boolean))];
    dialog(`<h3>○×で解く</h3><p class="d">「${esc(data.viewName || 'このビュー')}」${data.rows.length} 問。列を確かめて始めます（次からは同じ設定）。間違えた問いは、自動で単語帳「○×の間違い」に入ります。</p>
      <label class="r"><span>問い</span><select data-m="q">${opt(m0.q)}</select></label>
      <label class="r"><span>正解（○×）</span><select data-m="a">${opt(m0.a)}</select></label>
      <label class="r"><span>解説</span><select data-m="x">${opt(m0.x)}</select></label>
      <label class="r"><span>科目</span><select data-m="subj">${opt(m0.subj)}</select></label>
      <label class="r"><span>年度</span><select data-m="year">${opt(m0.year)}</select></label>
      <label class="r"><span>出す問い</span><select data-o="which"><option value="all">すべて（順番をまぜる）</option><option value="weak">苦手（前に間違えた・正答率 70% 未満）</option><option value="new">まだ解いていない</option></select></label>
      ${subjects.length ? '<label class="r"><span>科目をしぼる</span><select data-o="subj"><option value="">すべて</option>' + subjects.map((s) => '<option>' + esc(s) + '</option>').join('') + '</select></label>' : ''}
      <label class="r"><span>問いの数</span><input type="number" data-o="n" value="20" style="max-width:80px"></label>
      <div class="btns"><button class="b pri" data-go>はじめる</button><button class="b" data-x>閉じる</button></div>`, (d, close) => {
      d.querySelector('[data-x]').onclick = close;
      d.querySelector('[data-go]').onclick = () => {
        const m = {}; d.querySelectorAll('[data-m]').forEach((s) => { m[s.dataset.m] = s.value; });
        if (!m.q || !m.a) { toast('問いと正解の列を選んでください'); return; }
        QMAPS[v.viewId] = m; store.set(K2.quizMaps, QMAPS);
        const o = { which: d.querySelector('[data-o="which"]').value, subj: (d.querySelector('[data-o="subj"]') || {}).value || '', n: +d.querySelector('[data-o="n"]').value || 20 };
        close(); quizRun(v, data, m, o);
      };
    });
  }
  const QUIZ_CSS = `
#s38-quiz { position: fixed; inset: 0; z-index: 2147483350; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px;
  background: color-mix(in srgb, var(--lm-bg, #f4f2ee) 94%, transparent); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); color: var(--lm-ink, #2c2c2b); font: 15px/1.75 ${CORDI_UI}; font-feature-settings: "palt" 1; }
#s38-quiz .top { position: absolute; top: 16px; left: 24px; right: 24px; display: flex; align-items: center; gap: 12px; color: var(--lm-mute, #888); font-size: 12.5px; }
#s38-quiz .top .pg { flex: 1; height: 4px; border-radius: 4px; background: var(--lm-line, rgba(0,0,0,.08)); overflow: hidden; }
#s38-quiz .top .pg i { display: block; height: 100%; background: var(--lm-accent, #2783de); transition: width .3s; }
#s38-quiz .top button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; padding: 4px 8px; border-radius: 6px; }
#s38-quiz .top button:hover { background: var(--lm-hover, rgba(0,0,0,.05)); }
#s38-quiz .qcard { width: min(720px, 92vw); border-radius: 18px; padding: 28px 34px; background: var(--lm-raised, #fff); box-shadow: 0 24px 60px rgba(0,0,0,.12), 0 0 0 1px var(--lm-line, rgba(0,0,0,.08)); }
#s38-quiz .meta { display: flex; gap: 8px; margin-bottom: 10px; font-size: 11.5px; color: var(--lm-mute, #888); }
#s38-quiz .meta span { padding: 1px 8px; border-radius: 999px; background: var(--lm-hover, rgba(0,0,0,.05)); }
#s38-quiz .q { font-size: 17px; line-height: 1.85; white-space: pre-wrap; word-break: break-word; }
#s38-quiz .ans { display: flex; gap: 14px; }
#s38-quiz .ans button { width: 128px; height: 64px; border-radius: 16px; border: 1px solid var(--lm-line, rgba(0,0,0,.12)); background: var(--lm-raised, #fff); color: inherit; font: 600 30px/1 ${CORDI_UI}; cursor: pointer; transition: transform .12s, border-color .12s; }
#s38-quiz .ans button:hover { transform: translateY(-2px); border-color: var(--lm-accent, #2783de); }
#s38-quiz .ans button small { display: block; font-size: 10.5px; font-weight: 500; color: var(--lm-mute, #999); margin-top: 3px; }
#s38-quiz .res { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--lm-line, rgba(0,0,0,.08)); }
#s38-quiz .res .v { font-weight: 700; font-size: 16px; }
#s38-quiz .res .v.ok { color: #2e8b57; } #s38-quiz .res .v.ng { color: #c4453a; }
#s38-quiz .res .x { margin-top: 6px; color: var(--lm-mute, #666); font-size: 14px; white-space: pre-wrap; max-height: 34vh; overflow: auto; }
#s38-quiz .hint { color: var(--lm-mute, #999); font-size: 12px; }
#s38-quiz .done { width: min(560px, 92vw); text-align: center; }
#s38-quiz .done b { display: block; font: 600 30px/1.3 var(--cordi-ui-display, "Cormorant Garamond", Georgia, serif); margin-bottom: 8px; }
#s38-quiz .done table { margin: 14px auto 0; border-collapse: collapse; font-size: 13px; }
#s38-quiz .done td { padding: 4px 10px; border-bottom: 1px solid var(--lm-line, rgba(0,0,0,.06)); text-align: left; }
#s38-quiz .done td.n { text-align: right; font-variant-numeric: tabular-nums; }`;
  function quizRun(v, data, m, o) {
    if (!document.getElementById('s38-quiz-css')) { const st = document.createElement('style'); st.id = 's38-quiz-css'; st.textContent = QUIZ_CSS; document.head.appendChild(st); }
    const ci = (n) => data.cols.findIndex((c) => c.name === n);
    const iq = ci(m.q), ia = ci(m.a), ix = ci(m.x), is = ci(m.subj), iy = ci(m.year);
    const key = (r) => v.blockId + ':' + r.id;
    let pool = data.rows.filter((r) => ENGINE.show(r.vals[iq]).trim() && truthy(r.vals[ia]) != null);
    if (o.subj && is >= 0) pool = pool.filter((r) => ENGINE.show(r.vals[is]) === o.subj);
    if (o.which === 'weak') pool = pool.filter((r) => { const h = QUIZ[key(r)]; return h && (h.wrong || h.ok / h.n < 0.7); });
    if (o.which === 'new') pool = pool.filter((r) => !QUIZ[key(r)]);
    if (!pool.length) { toast(o.which === 'weak' ? '苦手な問いはまだありません' : '出せる問いがありません（正解の列が ○×・正誤になっているか確かめてください）'); return; }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const queue = pool.slice(0, Math.max(1, o.n));
    const total = queue.length, started = Date.now();
    let idx = 0, right = 0, answered = false;
    const bySubj = {};
    const el = document.createElement('div'); el.id = 's38-quiz'; document.body.appendChild(el);
    const end = () => { el.remove(); document.removeEventListener('keydown', key2, true); logStudy(Math.round((Date.now() - started) / 60000), 'review', idx); };
    const draw = () => {
      if (idx >= total) {
        const rows = Object.entries(bySubj).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);
        el.innerHTML = '<div class="done"><b>' + right + ' / ' + total + '</b>正答率 ' + Math.round(right / total * 100) + '%・' + Math.max(1, Math.round((Date.now() - started) / 60000)) + ' 分' +
          (rows.length > 1 ? '<table>' + rows.map(([s, x]) => '<tr><td>' + esc(s) + '</td><td class="n">' + x.ok + ' / ' + x.n + '</td><td class="n">' + Math.round(x.ok / x.n * 100) + '%</td></tr>').join('') + '</table>' : '') +
          '<div class="hint" style="margin-top:14px">間違えた問いは単語帳「○×の間違い」に入りました。Esc で閉じる</div><div style="margin-top:14px"><button class="b pri" data-again style="border:0;border-radius:10px;padding:8px 16px;background:var(--lm-accent,#2783de);color:#fff;font:inherit;cursor:pointer">苦手だけもう一度</button></div></div>';
        el.querySelector('[data-again]').onclick = () => { end(); quizRun(v, data, m, Object.assign({}, o, { which: 'weak' })); };
        return;
      }
      const r = queue[idx]; answered = false;
      const h = QUIZ[key(r)];
      el.innerHTML = '<div class="top"><span>○×演習</span><span class="pg"><i style="width:' + (idx / total * 100) + '%"></i></span><span>' + (idx + 1) + ' / ' + total + '・正解 ' + right + '</span><button data-q>やめる（Esc）</button></div>' +
        '<div class="qcard"><div class="meta">' + (is >= 0 && ENGINE.show(r.vals[is]) ? '<span>' + esc(ENGINE.show(r.vals[is])) + '</span>' : '') + (iy >= 0 && ENGINE.show(r.vals[iy]) ? '<span>' + esc(ENGINE.show(r.vals[iy])) + '</span>' : '') + (h ? '<span>前回まで ' + h.ok + '/' + h.n + '</span>' : '<span>はじめて</span>') + '</div>' +
        '<div class="q">' + esc(ENGINE.show(r.vals[iq])) + '</div><div class="res" hidden></div></div>' +
        '<div class="ans"><button data-a="1">○<small>O ／ ←</small></button><button data-a="0">×<small>X ／ →</small></button></div><div class="hint">答えると正誤と解説。Enter・Space で次へ。S で読み上げ</div>';
      el.querySelector('[data-q]').onclick = end;
      el.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => answer(b.dataset.a === '1'); });
    };
    const answer = (yes) => {
      if (answered) { idx++; draw(); return; }
      answered = true;
      const r = queue[idx], corr = truthy(r.vals[ia]), ok = yes === corr;
      if (ok) right++;
      const k = key(r), hh = QUIZ[k] || { n: 0, ok: 0 };
      hh.n++; if (ok) hh.ok++; hh.wrong = !ok; hh.last = Date.now(); QUIZ[k] = hh; store.set(K2.quiz, QUIZ);
      const s = is >= 0 ? ENGINE.show(r.vals[is]) || '（科目なし）' : 'すべて';
      const b = bySubj[s] || (bySubj[s] = { n: 0, ok: 0 }); b.n++; if (ok) b.ok++;
      if (!ok) wrongToDeck(v, data, m, r, corr);
      const res = el.querySelector('.res'); res.hidden = false;
      res.innerHTML = '<div class="v ' + (ok ? 'ok' : 'ng') + '">' + (ok ? '正解' : '不正解') + '　正しくは「' + (corr ? '○' : '×') + '」</div>' + (ix >= 0 && ENGINE.show(r.vals[ix]) ? '<div class="x">' + esc(ENGINE.show(r.vals[ix])) + '</div>' : '');
      el.querySelector('.ans').innerHTML = '<button data-n style="width:200px;font-size:15px">次へ（Enter）</button>';
      el.querySelector('[data-n]').onclick = () => { idx++; draw(); };
    };
    const key2 = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); end(); return; }
      if (!answered && /^(o|O|ArrowLeft|1)$/.test(e.key)) { e.preventDefault(); answer(true); }
      else if (!answered && /^(x|X|ArrowRight|2)$/.test(e.key)) { e.preventDefault(); answer(false); }
      else if (answered && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); idx++; draw(); }
      else if (e.key === 's' || e.key === 'S') { e.preventDefault(); const r = queue[idx]; if (r) speak(ENGINE.show(r.vals[iq])); }
    };
    document.addEventListener('keydown', key2, true);
    draw();
  }
  /* 間違えた ○× を単語帳へ（表: 問い ／ 裏: 正解と解説） */
  function wrongToDeck(v, data, m, r, corr) {
    let d = DECKS.find((k) => k.id === 'oxwrong' && k.view.viewId === v.viewId);
    if (!d) { d = { id: 'oxwrong', name: '○×の間違い', view: { blockId: v.blockId, viewId: v.viewId, inline: v.inline }, front: m.q, back: m.a, extra: m.x, newPer: 0 }; DECKS.push(d); saveDecks(); }
    SRS['oxwrong:' + r.id] = Object.assign(sm2(SRS['oxwrong:' + r.id], 0), { due: dayNum() + 1 });
    saveSrs();
  }

  /* ============================================================
   *  15.4 選択式ドリル — このページの「赤字・太字・数字」を空欄にして、選択肢から選ぶ（本試験の選択式の形）
   * ============================================================ */
  const NUM_RE = /(\d+(?:\.\d+)?\s*(?:日|か月|ヵ月|カ月|箇月|月|年|週|時間|分の\d+|分|%|％|割|人|歳|回|円|万円|等級))/g;
  function drillStart() {
    css();
    const root = document.querySelector('.notion-frame .notion-page-content') || document.querySelector('.notion-page-content');
    if (!root) { toast('本文のあるページで使ってください'); return; }
    const cfg = store.get(K2.drill, { red: true, bold: true, num: true, n: 5 });
    dialog(`<h3>選択式ドリル</h3><p class="d">このページの段落から問題を作ります。空欄にするもの:</p>
      <label class="r"><span>赤・橙の文字</span><input type="checkbox" data-c="red"${cfg.red ? ' checked' : ''}></label>
      <label class="r"><span>太字</span><input type="checkbox" data-c="bold"${cfg.bold ? ' checked' : ''}></label>
      <label class="r"><span>数字＋単位</span><input type="checkbox" data-c="num"${cfg.num ? ' checked' : ''}>（30 日・2 分の 1・3 年・60 歳 など。社労士の「数字」対策）</label>
      <label class="r"><span>空欄の数（1 問）</span><input type="number" data-c="n" value="${cfg.n}" style="max-width:70px">（本試験は 5 つ・選択肢 20）</label>
      <div class="btns"><button class="b pri" data-go>作る</button><button class="b" data-x>閉じる</button></div>`, (d, close) => {
      d.querySelector('[data-x]').onclick = close;
      d.querySelector('[data-go]').onclick = () => {
        d.querySelectorAll('[data-c]').forEach((x) => { cfg[x.dataset.c] = x.type === 'checkbox' ? x.checked : +x.value; });
        store.set(K2.drill, cfg); close(); drillRun(root, cfg);
      };
    });
  }
  function drillRun(root, cfg) {
    /* 段落ごとに、空欄の候補（文字の位置）を集める */
    const paras = [];
    for (const blk of root.querySelectorAll('[data-block-id] [data-content-editable-leaf], [data-block-id] .notranslate[contenteditable], .notion-text-block, .notion-bulleted_list-block, .notion-numbered_list-block, .notion-callout-block, .notion-quote-block, .notion-toggle-block')) {
      if (blk.closest('.s38-drill')) continue;
      const leaf = blk.matches('[data-content-editable-leaf], [contenteditable]') ? blk : blk.querySelector('[data-content-editable-leaf], [contenteditable]');
      if (!leaf || paras.some((p) => p.el === leaf)) continue;
      const text = leaf.textContent || ''; if (text.trim().length < 12) continue;
      const marks = [];
      for (const sp of leaf.querySelectorAll('span, b, strong')) {
        const st = sp.getAttribute('style') || '';
        const isRed = cfg.red && /--c-(red|ora)Tex|color:\s*(rgb\(2[0-5]\d,\s*[4-9]\d|#d|#e|#c[4-9])|red|orange/i.test(st + ' ' + (sp.className || ''));
        const isBold = cfg.bold && (sp.tagName === 'B' || sp.tagName === 'STRONG' || /font-weight:\s*(600|700|bold)/.test(st));
        if (!isRed && !isBold) continue;
        const t = norm(sp.textContent); if (!t || t.length > 30) continue;
        marks.push(t);
      }
      if (cfg.num) { let m; NUM_RE.lastIndex = 0; while ((m = NUM_RE.exec(text))) marks.push(m[1].replace(/\s+/g, '')); }
      let uniq = [...new Set(marks)].filter((t) => text.replace(/\s+/g, '').includes(t.replace(/\s+/g, '')));
      uniq = uniq.filter((t) => !uniq.some((u) => u !== t && u.includes(t)));   // 「30日」と「30日前」→ 長い方だけ
      if (uniq.length) paras.push({ el: leaf, text: text.replace(/\s+/g, ' ').trim(), marks: uniq });
    }
    if (!paras.length) { toast('空欄にできる語が見つかりませんでした（赤字・太字・数字のある段落で）'); return; }
    /* 空欄を n 個ずつに分けて問題に（段落をまたいでよい） */
    const blanks = [];
    for (const p of paras) for (const t of p.marks) blanks.push({ p, t });
    for (let i = blanks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [blanks[i], blanks[j]] = [blanks[j], blanks[i]]; }
    const n = Math.max(1, Math.min(10, cfg.n || 5));
    const pick = blanks.slice(0, n);
    const allAns = [...new Set(blanks.map((b) => b.t))];
    /* 選択肢: 正解＋ほかの空欄の語＋数字の言い換え（30 日 → 14 日・60 日 など）で 20 個まで */
    const distract = new Set(allAns);
    for (const b of pick) { const m = /^(\d+(?:\.\d+)?)(.*)$/.exec(b.t); if (m) for (const k of [0.5, 2, 1.5, 3, 0.25]) { const x = Math.round(+m[1] * k * 10) / 10; if (x > 0 && x !== +m[1]) distract.add(x + m[2]); } }
    const opts = [...distract]; for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    const choices = [...new Set(pick.map((b) => b.t).concat(opts))].slice(0, Math.max(pick.length, 20));
    choices.sort(() => Math.random() - 0.5);
    const lab = 'ABCDEFGHIJ';
    /* 問題文: 選んだ空欄を含む段落を順に、空欄を ［A］ に */
    const usedParas = [...new Set(pick.map((b) => b.p))];
    let qhtml = '';
    usedParas.forEach((p) => {
      let t = esc(p.text);
      pick.forEach((b, i) => { if (b.p !== p) return; const e2 = esc(b.t); const at = t.indexOf(e2); if (at >= 0) t = t.slice(0, at) + '<span class="bl" data-bl="' + i + '">［' + lab[i] + '］</span>' + t.slice(at + e2.length); });
      qhtml += '<p>' + t + '</p>';
    });
    css();
    dialog(`<h3>選択式ドリル</h3><div class="s38-drill"><div class="qt">${qhtml}</div>
      <div class="ch">${choices.map((c, i) => '<button class="c" data-c="' + i + '"><i>' + (i + 1) + '</i>' + esc(c) + '</button>').join('')}</div>
      <div class="sl">${pick.map((b, i) => '<span>［' + lab[i] + '］<select data-sl="' + i + '"><option value="">—</option>' + choices.map((c, j) => '<option value="' + j + '">' + (j + 1) + ' ' + esc(c) + '</option>').join('') + '</select></span>').join('')}</div>
      <div class="vd"></div></div>
      <div class="btns"><button class="b pri" data-chk>答え合わせ</button><button class="b" data-re>別の問題</button><button class="b" data-x>閉じる</button></div>`, (d, close) => {
      d.classList.add('wide');
      d.querySelector('[data-x]').onclick = close;
      d.querySelector('[data-re]').onclick = () => { close(); drillRun(root, cfg); };
      let cur = 0;
      d.querySelectorAll('.bl').forEach((b) => { b.onclick = () => { cur = +b.dataset.bl; d.querySelector('[data-sl="' + cur + '"]').focus(); }; });
      d.querySelectorAll('.c').forEach((b) => { b.onclick = () => { const s = d.querySelector('[data-sl="' + cur + '"]'); s.value = b.dataset.c; s.dispatchEvent(new Event('change')); cur = Math.min(pick.length - 1, cur + 1); }; });
      d.querySelectorAll('[data-sl]').forEach((s) => { s.addEventListener('change', () => { const i = +s.dataset.sl; const bl = d.querySelector('.bl[data-bl="' + i + '"]'); if (bl) bl.textContent = '［' + lab[i] + (s.value ? '：' + choices[+s.value] : '') + '］'; }); });
      d.querySelector('[data-chk]').onclick = () => {
        let ok = 0;
        pick.forEach((b, i) => { const s = d.querySelector('[data-sl="' + i + '"]'); const good = s.value !== '' && choices[+s.value] === b.t; if (good) ok++; const bl = d.querySelector('.bl[data-bl="' + i + '"]'); if (bl) { bl.classList.toggle('ok', good); bl.classList.toggle('ng', !good); bl.textContent = '［' + lab[i] + '：' + b.t + '］'; } });
        d.querySelector('.vd').innerHTML = '<b>' + ok + ' / ' + pick.length + '</b>　' + (ok >= Math.ceil(pick.length * 0.6) ? '基準点（3/5）に届いています' : '基準点まであと ' + (Math.ceil(pick.length * 0.6) - ok)) ;
        logStudy(1, 'review', pick.length);
      };
    });
  }

  /* ============================================================
   *  15.5 語学 — 読み上げ・書き取り（ブラウザの音声合成。外へは何も送らない）
   * ============================================================ */
  const langOf = (t) => (P.tts.lang && P.tts.lang !== 'auto' ? P.tts.lang : /[぀-ヿ]/.test(t) ? 'ja-JP' : /[가-힯]/.test(t) ? 'ko-KR' : /[一-鿿]/.test(t) ? 'zh-CN' : /[àâçéèêëîïôûùüÿœ]/i.test(t) ? 'fr-FR' : /[äöüß]/i.test(t) ? 'de-DE' : /[ñ¿¡áíóú]/i.test(t) ? 'es-ES' : 'en-US');
  function selText() { const s = window.getSelection(); return s ? String(s).trim() : ''; }
  function curParagraph() {
    const s = window.getSelection(); const n = s && s.anchorNode; const el = n && (n.nodeType === 1 ? n : n.parentElement);
    const b = el && el.closest && el.closest('[data-block-id]');
    return b ? norm(b.textContent) : '';
  }
  function speak(text, opt) {
    if (!('speechSynthesis' in window)) { toast('このブラウザは読み上げに対応していません'); return; }
    const t = String(text || selText() || curParagraph() || '').slice(0, 4000);
    if (!t) { toast('読み上げる文字を選んでください'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = (opt && opt.lang) || langOf(t);
    u.rate = (opt && opt.rate) || P.tts.rate || 1;
    const vs = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.replace('_', '-').startsWith(u.lang.slice(0, 2)));
    const best = vs.find((v) => /Enhanced|Premium|Natural|Siri|Kyoko|Otoya|Samantha|Google/i.test(v.name)) || vs[0];
    if (best) u.voice = best;
    speechSynthesis.speak(u);
    if (!opt || !opt.quiet) toast('読み上げ（' + u.lang + '・' + u.rate + ' 倍）', ['止める', () => speechSynthesis.cancel()]);
  }
  function dictation(text) {
    const t = String(text || selText() || '').trim();
    if (!t) { toast('書き取りにする文を選んでから'); return; }
    css();
    dialog(`<h3>書き取り</h3><p class="d">文を聞いて、聞こえた通りに打ち込みます（${esc(langOf(t))}）。何度でも聞けます。</p>
      <div class="btns" style="justify-content:flex-start"><button class="b pri" data-play>▶ 聞く</button><button class="b" data-slow>▶ ゆっくり</button></div>
      <textarea class="s38-dt" rows="4" placeholder="ここに打つ"></textarea>
      <div class="s38-diff"></div>
      <div class="btns"><button class="b pri" data-chk>答え合わせ</button><button class="b" data-x>閉じる</button></div>`, (d, close) => {
      d.querySelector('[data-x]').onclick = () => { speechSynthesis.cancel(); close(); };
      d.querySelector('[data-play]').onclick = () => speak(t, { quiet: true });
      d.querySelector('[data-slow]').onclick = () => speak(t, { quiet: true, rate: 0.7 });
      d.querySelector('[data-chk]').onclick = () => {
        const a = d.querySelector('.s38-dt').value;
        const { html, score } = diffChars(t, a);
        d.querySelector('.s38-diff').innerHTML = '<div class="sc">一致 ' + score + '%</div><div class="df">' + html + '</div>';
        logStudy(1);
      };
      setTimeout(() => speak(t, { quiet: true }), 200);
    });
  }
  /* 文字ごとの違い（LCS）: 合っている字・抜けた字・余分な字 */
  function diffChars(ref, got) {
    const n0 = (s) => s.replace(/\s+/g, ' ').trim();
    const a = [...n0(ref)], b = [...n0(got)];
    const cmp = (x, y) => x.toLowerCase() === y.toLowerCase() || (/[.,!?;:、。！？]/.test(x) && /[.,!?;:、。！？]/.test(y));
    const L = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
    for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) L[i][j] = cmp(a[i], b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0, h = '';
    while (i < a.length && j < b.length) {
      if (cmp(a[i], b[j])) { h += esc(a[i]); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) { h += '<del title="抜けた字">' + esc(a[i]) + '</del>'; i++; }
      else { h += '<ins title="余分な字">' + esc(b[j]) + '</ins>'; j++; }
    }
    while (i < a.length) h += '<del>' + esc(a[i++]) + '</del>';
    while (j < b.length) h += '<ins>' + esc(b[j++]) + '</ins>';
    return { html: h, score: a.length ? Math.round(L[0][0] / Math.max(a.length, b.length) * 100) : 0 };
  }

  /* ============================================================
   *  15.6 用語に乗せて意味を出す — 本文は一切書き換えない（CSS の Highlight で印だけ付ける）
   *       用語集: DB のビュー（用語・意味・読み）を選ぶ。社労士の用語（科目の手がかり）も光らせられる
   * ============================================================ */
  const GLOSS = { terms: store.get(K2.gloss, { terms: [] }).terms || [], view: store.get(K2.gloss, {}).view || null, ranges: [], t: 0, tip: null };
  const HL_OK = typeof Highlight === 'function' && window.CSS && CSS.highlights;
  function glossCss() {
    if (document.getElementById('s38-gloss-css')) return;
    const st = document.createElement('style'); st.id = 's38-gloss-css';
    st.textContent = `::highlight(s38-gloss) { text-decoration: underline dotted color-mix(in srgb, var(--lm-accent, #2783de) 70%, transparent); text-decoration-thickness: 1.5px; text-underline-offset: 3px; }
::highlight(s38-kw) { background-color: color-mix(in srgb, var(--lm-accent2, #e8b04a) 16%, transparent); }
#s38-gtip { position: fixed; z-index: 2147483300; max-width: 340px; padding: 10px 13px; border-radius: 11px; pointer-events: none; background: var(--c-bacEle, #fff); color: var(--c-texPri, #333);
  box-shadow: var(--c-shaOutMd, 0 8px 28px rgba(0,0,0,.16)); font: 13px/1.6 ${CORDI_UI}; font-feature-settings: "palt" 1; opacity: 0; transform: translateY(3px); transition: opacity .14s, transform .14s; }
#s38-gtip.on { opacity: 1; transform: none; }
#s38-gtip b { display: block; font-size: 14px; margin-bottom: 2px; }
#s38-gtip small { color: var(--c-texSec, #888); margin-left: 6px; font-weight: 400; }
#s38-gtip .tg { display: inline-block; margin-top: 4px; padding: 0 7px; border-radius: 999px; font-size: 11px; background: color-mix(in srgb, var(--lm-accent2, #e8b04a) 20%, transparent); }`;
    document.head.appendChild(st);
  }
  function glossTerms() {
    const out = [];
    if (P.gloss.on) for (const t of GLOSS.terms) if (t.term && t.term.length >= 2) out.push({ term: t.term, mean: t.mean, read: t.read, kind: 'g' });
    if (P.gloss.kw) for (const [subj, list] of Object.entries(SR.kw)) for (const w of list) out.push({ term: w, mean: '', subj, kind: 'k' });
    out.sort((a, b) => b.term.length - a.term.length);
    return out;
  }
  function glossScan() {
    if (!HL_OK) return;
    const terms = glossTerms();
    if (!terms.length) { CSS.highlights.delete('s38-gloss'); CSS.highlights.delete('s38-kw'); GLOSS.ranges = []; return; }
    glossCss();
    const root = document.querySelector('.notion-frame .notion-page-content') || document.querySelector('.notion-peek-renderer .notion-page-content');
    const ranges = [], hg = new Highlight(), hk = new Highlight();
    if (root) {
      const esc2 = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(terms.map((t) => esc2(t.term)).join('|'), 'g');
      const byTerm = new Map(terms.map((t) => [t.term, t]));
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let nd, count = 0;
      while ((nd = w.nextNode()) && count < 3000) {
        const s = nd.nodeValue; if (!s || s.length < 2) continue;
        re.lastIndex = 0; let m;
        while ((m = re.exec(s))) { const r = new Range(); r.setStart(nd, m.index); r.setEnd(nd, m.index + m[0].length); const t = byTerm.get(m[0]); ranges.push({ r, t }); (t.kind === 'g' ? hg : hk).add(r); count++; }
      }
    }
    CSS.highlights.set('s38-gloss', hg); CSS.highlights.set('s38-kw', hk);
    GLOSS.ranges = ranges;
  }
  const glossSoon = () => { clearTimeout(GLOSS.t); GLOSS.t = setTimeout(glossScan, 500); };
  function glossHover(e) {
    if (!GLOSS.ranges.length) return;
    let hitR = null;
    const pos = document.caretPositionFromPoint ? document.caretPositionFromPoint(e.clientX, e.clientY) : null;
    const cr = pos ? null : document.caretRangeFromPoint && document.caretRangeFromPoint(e.clientX, e.clientY);
    const node = pos ? pos.offsetNode : cr && cr.startContainer, off = pos ? pos.offset : cr && cr.startOffset;
    if (node && node.nodeType === 3) for (const x of GLOSS.ranges) if (x.r.startContainer === node && off >= x.r.startOffset && off <= x.r.endOffset) { const rr = x.r.getBoundingClientRect(); if (e.clientX >= rr.left - 2 && e.clientX <= rr.right + 2 && e.clientY >= rr.top - 2 && e.clientY <= rr.bottom + 2) { hitR = x; break; } }
    let tip = document.getElementById('s38-gtip');
    if (!hitR) { if (tip) tip.classList.remove('on'); return; }
    if (!tip) { tip = document.createElement('div'); tip.id = 's38-gtip'; document.body.appendChild(tip); }
    const t = hitR.t;
    tip.innerHTML = '<b>' + esc(t.term) + (t.read ? '<small>' + esc(t.read) + '</small>' : '') + '</b>' + (t.mean ? esc(t.mean) : '') + (t.subj ? '<span class="tg">社労士・' + esc(t.subj) + '</span>' : '');
    const rr = hitR.r.getBoundingClientRect();
    tip.classList.add('on');
    tip.style.left = Math.max(8, Math.min(innerWidth - tip.offsetWidth - 8, rr.left)) + 'px';
    tip.style.top = (rr.bottom + 8 + tip.offsetHeight > innerHeight ? rr.top - tip.offsetHeight - 8 : rr.bottom + 8) + 'px';
  }
  let ghT = 0;
  document.addEventListener('mousemove', (e) => { if (!GLOSS.ranges.length) return; cancelAnimationFrame(ghT); ghT = requestAnimationFrame(() => glossHover(e)); }, { passive: true });
  async function glossToggle() {
    if (!HL_OK) { toast('このブラウザは「文字に印を付ける」機能（CSS Highlight）に対応していません'); return; }
    css();
    dialog(`<h3>用語に乗せて意味を出す</h3><p class="d">本文の中の用語に点線を付け、乗せると意味が出ます。本文は書き換えません（印だけ）。用語集は DB のビュー（用語・意味・読み）から読みます。</p>
      <label class="r"><span>用語集を使う</span><input type="checkbox" data-g="on"${P.gloss.on ? ' checked' : ''}> いま ${GLOSS.terms.length} 語${GLOSS.view ? '' : '（まだ用語集がありません）'}</label>
      <label class="r"><span>社労士の用語</span><input type="checkbox" data-g="kw"${P.gloss.kw ? ' checked' : ''}> 法律・給付の名前を淡く塗り、乗せると科目を出す（${Object.values(SR.kw).reduce((s, l) => s + l.length, 0)} 語）</label>
      <div class="step"><div class="sh">いま見ている DB のビューを用語集にする</div><p class="d">用語の列・意味の列を選んでください。</p>
        <label class="r"><span>用語</span><select data-m="term"></select></label><label class="r"><span>意味</span><select data-m="mean"></select></label><label class="r"><span>読み</span><select data-m="read"></select></label>
        <div class="btns" style="justify-content:flex-start"><button class="b" data-load>このビューを用語集に</button>${GLOSS.view ? '<button class="b" data-re>用語集を読み直す</button>' : ''}</div></div>
      <div class="btns"><button class="b" data-x>閉じる</button></div>`, async (d, close) => {
      d.querySelector('[data-x]').onclick = close;
      d.querySelectorAll('[data-g]').forEach((x) => x.addEventListener('change', () => { P.gloss[x.dataset.g] = x.checked; saveP(); glossScan(); }));
      const re = d.querySelector('[data-re]'); if (re) re.onclick = async () => { await glossLoad(GLOSS.view); close(); };
      const v = findView();
      if (!v || !v.viewId) { d.querySelector('[data-load]').disabled = true; return; }
      let data; try { data = await loadView(v); } catch (e) { return; }
      const opt = (re2) => { const g = guessCol(data.cols, re2); return '<option value="">（なし）</option>' + data.cols.map((c) => '<option' + (c.name === g ? ' selected' : '') + '>' + esc(c.name) + '</option>').join(''); };
      d.querySelector('[data-m="term"]').innerHTML = opt(/用語|語|単語|term|word|名前|Name/i);
      d.querySelector('[data-m="mean"]').innerHTML = opt(/意味|説明|定義|訳|meaning|definition/i);
      d.querySelector('[data-m="read"]').innerHTML = opt(/読み|よみ|発音|reading/i);
      if (!d.querySelector('[data-m="term"]').value) d.querySelector('[data-m="term"]').selectedIndex = 1;
      d.querySelector('[data-load]').onclick = async () => {
        const m = {}; d.querySelectorAll('[data-m]').forEach((s) => { m[s.dataset.m] = s.value; });
        await glossLoad({ blockId: v.blockId, viewId: v.viewId, inline: v.inline, map: m }, data); close();
      };
    });
  }
  async function glossLoad(view, data) {
    try { data = data || await loadView(view); } catch (e) { toast('用語集を読めませんでした: ' + e.message); return; }
    const ci = (n) => data.cols.findIndex((c) => c.name === n);
    const it = ci(view.map.term), im = ci(view.map.mean), ir = ci(view.map.read);
    GLOSS.terms = data.rows.map((r) => ({ term: norm(ENGINE.show(r.vals[it])), mean: im >= 0 ? norm(ENGINE.show(r.vals[im])).slice(0, 400) : '', read: ir >= 0 ? norm(ENGINE.show(r.vals[ir])) : '' })).filter((t) => t.term);
    GLOSS.view = view; store.set(K2.gloss, { view, terms: GLOSS.terms, at: Date.now() });
    P.gloss.on = true; saveP(); glossScan();
    toast('用語集: ' + GLOSS.terms.length + ' 語');
  }

  /* ============================================================
   *  15.7 記録 — 読書・推し・ニュース（DB のビューを選ぶと、数・月ごと・評価・タグ・出費・記念日を一枚に）
   * ============================================================ */
  let LEDGERS = store.get(K2.ledgers, {});   // kind → { view, map, name, at }
  const KIND = {
    read: { name: '読書の記録', hint: '読んだ本の DB', date: /読了|読んだ|日付|日|date|終了/i, rating: /評価|★|星|rating|点/i, num: /ページ|頁|pages?/i, who: /著者|作者|author/i, tag: /ジャンル|タグ|分類|tag/i, status: /状態|ステータス|状況|status/i },
    oshi: { name: '推しの記録', hint: '推し活（イベント・グッズ・視聴）の DB', date: /日付|日|開催|購入|発売|date/i, num: /金額|円|価格|費|出費|price|amount|cost/i, who: /推し|メンバー|キャラ|人|oshi|名前/i, tag: /種類|分類|タグ|カテゴリ|tag|ジャンル/i, birthday: /誕生|記念|birthday|anniversary|デビュー/i, rating: /評価|★|満足/i },
    news: { name: 'ニュースのクリップ', hint: 'クリップした記事の DB', date: /日付|掲載|公開|クリップ|日|date/i, who: /媒体|出典|ソース|source|新聞|サイト|メディア/i, tag: /タグ|分類|カテゴリ|科目|tag|テーマ/i, url: /URL|リンク|link/i, rating: /重要|★|優先/i }
  };
  function ledgerHint(k) { const L = LEDGERS[k]; return L ? (L.name || KIND[k].name) + (L.count != null ? '・' + L.count + ' 件' : '') : KIND[k].hint + 'を選ぶ'; }
  function autoMap(kind, cols) {
    const K3 = KIND[kind], f = (re, types) => (re ? guessCol(cols, re, types) : '');
    return { date: f(K3.date, ['date', 'created_time', 'last_edited_time']) || (cols.find((c) => c.type === 'date') || cols.find((c) => c.type === 'created_time') || {}).name || '',
      rating: f(K3.rating, ['number', 'select', 'status', 'text']), num: f(K3.num, ['number', 'formula', 'rollup']), who: f(K3.who), tag: f(K3.tag, ['multi_select', 'select', 'status', 'relation']),
      status: f(K3.status, ['status', 'select']), birthday: f(K3.birthday, ['date']), url: f(K3.url, ['url', 'text']) || (cols.find((c) => c.type === 'url') || {}).name || '' };
  }
  async function ledgerOpen(kind) {
    css();
    const L = LEDGERS[kind];
    const v = findView();
    if (!L) {
      if (!v || !v.viewId) { toast(KIND[kind].hint + 'のビューを開いてから選んでください（以後はどこからでも開けます）'); return; }
      return ledgerSetup(kind, v);
    }
    let data; try { toast('記録を読んでいます…'); data = await loadView(L.view, { allProps: true }); } catch (e) { toast('読めませんでした: ' + e.message); return; }
    L.count = data.rows.length; L.at = Date.now(); store.set(K2.ledgers, LEDGERS);
    if (kind === 'oshi') annivCache(data, L.map);
    ledgerDash(kind, L, data, v);
  }
  async function ledgerSetup(kind, v) {
    let data; try { data = await loadView(v, { allProps: true }); } catch (e) { toast('読めませんでした: ' + e.message); return; }
    const m = autoMap(kind, data.cols);
    const fields = { date: '日付', rating: '評価', num: kind === 'oshi' ? '金額' : 'ページ数', who: kind === 'read' ? '著者' : kind === 'oshi' ? '推し' : '媒体', tag: kind === 'news' ? 'タグ・科目' : 'ジャンル・種類', status: '状態', birthday: '誕生日・記念日', url: 'URL' };
    const use = { read: ['date', 'rating', 'num', 'who', 'tag', 'status'], oshi: ['date', 'num', 'who', 'tag', 'birthday', 'rating'], news: ['date', 'who', 'tag', 'url', 'rating'] }[kind];
    const opt = (sel) => '<option value="">（なし）</option>' + data.cols.map((c) => '<option' + (c.name === sel ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('');
    dialog(`<h3>${esc(KIND[kind].name)}</h3><p class="d">「${esc(data.viewName || 'このビュー')}」（${data.rows.length} 件）を${esc(KIND[kind].name)}にします。列を確かめてください。</p>
      ${use.map((k) => '<label class="r"><span>' + fields[k] + '</span><select data-m="' + k + '">' + opt(m[k]) + '</select></label>').join('')}
      ${kind === 'read' ? '<label class="r"><span>今年の目標</span><input type="number" data-goal value="' + P.readGoal + '" style="max-width:80px"> 冊</label>' : ''}
      <div class="btns"><button class="b pri" data-ok>これで作る</button><button class="b" data-x>閉じる</button></div>`, (d, close) => {
      d.querySelector('[data-x]').onclick = close;
      d.querySelector('[data-ok]').onclick = () => {
        const mm = {}; d.querySelectorAll('[data-m]').forEach((s) => { mm[s.dataset.m] = s.value; });
        const g = d.querySelector('[data-goal]'); if (g) { P.readGoal = +g.value || 50; saveP(); }
        LEDGERS[kind] = { view: { blockId: v.blockId, viewId: v.viewId, inline: v.inline }, map: mm, name: data.viewName || KIND[kind].name, count: data.rows.length, at: Date.now() };
        store.set(K2.ledgers, LEDGERS); close();
        if (kind === 'oshi') annivCache(data, mm);
        ledgerDash(kind, LEDGERS[kind], data, v);
      };
    });
  }
  /* 縦棒（月ごと）— 一系列・アクセント色・角丸 4px・棒の間 2px・乗せると値 */
  function barsSvg(items, unit) {
    const W = 560, H = 132, pad = 18, n = items.length, max = Math.max(1, ...items.map((x) => x.v));
    const bw = (W - pad * 2) / n;
    let s = '<svg viewBox="0 0 ' + W + ' ' + (H + 22) + '" class="s38-bars" role="img" aria-label="月ごとの' + esc(unit) + '">';
    s += '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + H + '" y2="' + H + '" class="ax"/>';
    items.forEach((x, i) => {
      const h = x.v ? Math.max(3, (x.v / max) * (H - 18)) : 0, X = pad + i * bw + 1, w = Math.max(2, bw - 2);
      s += '<g class="bk" data-tip="' + esc(x.l + '　' + (unit === '円' ? x.v.toLocaleString('ja-JP') : x.v) + ' ' + unit) + '"><rect x="' + X + '" y="0" width="' + w + '" height="' + H + '" class="hit"/>';
      if (h) s += '<path d="M' + X + ',' + H + 'V' + (H - h + 4) + 'q0,-4 4,-4h' + (w - 8) + 'q4,0 4,4V' + H + 'z" class="b' + (x.cur ? ' cur' : '') + '"/>';
      s += '</g>';
      if (n <= 12 || i % 2 === 0) s += '<text x="' + (X + w / 2) + '" y="' + (H + 15) + '" class="lb">' + esc(x.s) + '</text>';
    });
    const top = items.reduce((a, b) => (b.v > a.v ? b : a), items[0]);
    if (top && top.v) { const i = items.indexOf(top), X = pad + i * bw + bw / 2, h = (top.v / max) * (H - 18); s += '<text x="' + X + '" y="' + (H - h - 5) + '" class="vl">' + (unit === '円' ? '¥' + top.v.toLocaleString('ja-JP') : top.v) + '</text>'; }
    return s + '</svg>';
  }
  function hbar(rows, unit) {
    if (!rows.length) return '<div class="s38-hb"><div class="r" style="display:block;color:var(--lm-mute,#999)">（この列がまだありません）</div></div>';
    const max = Math.max(1, ...rows.map((r) => r[1]));
    return '<div class="s38-hb">' + rows.map(([k, v]) => '<div class="r" data-tip="' + esc(k + '　' + (unit === '円' ? v.toLocaleString('ja-JP') : v) + ' ' + unit) + '"><span class="k">' + esc(k) + '</span><span class="t"><i style="width:' + (v / max * 100).toFixed(1) + '%"></i></span><span class="v">' + (unit === '円' ? '¥' + v.toLocaleString('ja-JP') : v) + '</span></div>').join('') + '</div>';
  }
  function ledgerDash(kind, L, data, v) {
    const ci = (n) => (n ? data.cols.findIndex((c) => c.name === n) : -1);
    const m = L.map, id = ci(m.date), ir = ci(m.rating), inum = ci(m.num), iw = ci(m.who), it = ci(m.tag), ist = ci(m.status), ib = ci(m.birthday);
    const now = new Date(), Y = now.getFullYear(), M = now.getMonth() + 1;
    const rows = data.rows.map((r) => {
      let dv = id >= 0 ? r.vals[id] : null;
      if (typeof dv !== 'number' && r.rec && r.rec.created_time) dv = ENGINE.toSerial(new Date(r.rec.created_time));   // 日付の列が無い・空 → 作った日
      const ds = typeof dv === 'number' ? ENGINE.serialParts(dv) : null;
      const title = ENGINE.show(r.vals[data.cols.findIndex((c) => c.type === 'title')] || '') || '無題';
      const split = (i) => (i >= 0 ? String(ENGINE.show(r.vals[i]) || '').split(/[、,]\s*/).map((s) => s.trim()).filter(Boolean) : []);
      const rt = ir >= 0 ? r.vals[ir] : null; const rating = typeof rt === 'number' ? rt : rt ? (String(ENGINE.show(rt)).match(/★/g) || []).length || (parseFloat(ENGINE.show(rt)) || null) : null;
      return { r, title, d: ds, n: inum >= 0 && typeof r.vals[inum] === 'number' ? r.vals[inum] : (inum >= 0 ? parseFloat(String(ENGINE.show(r.vals[inum])).replace(/[^\d.-]/g, '')) || 0 : 0), who: split(iw), tags: split(it), rating, status: ist >= 0 ? ENGINE.show(r.vals[ist]) : '', bday: ib >= 0 && typeof r.vals[ib] === 'number' ? ENGINE.serialParts(r.vals[ib]) : null };
    });
    const dated = rows.filter((x) => x.d);
    const months = [];
    for (let k = 11; k >= 0; k--) { const d = new Date(Y, M - 1 - k, 1); months.push({ y: d.getFullYear(), m: d.getMonth() + 1 }); }
    const sumBy = (fn) => months.map((mo) => ({ s: mo.m + '月', l: mo.y + '年' + mo.m + '月', cur: mo.y === Y && mo.m === M, v: dated.filter((x) => x.d.y === mo.y && x.d.m === mo.m).reduce((a, x) => a + fn(x), 0) }));
    const thisYear = dated.filter((x) => x.d.y === Y), thisMonth = thisYear.filter((x) => x.d.m === M);
    const count = (list, key) => { const c = new Map(); for (const x of list) for (const k of x[key]) c.set(k, (c.get(k) || 0) + 1); return [...c.entries()].sort((a, b) => b[1] - a[1]); };
    const tiles = (arr) => '<div class="s38-kpi">' + arr.map(([v2, l, s]) => '<div><b>' + v2 + '</b><span>' + l + '</span>' + (s ? '<small>' + s + '</small>' : '') + '</div>').join('') + '</div>';
    let h = '<h3>' + esc(KIND[kind].name) + ' <span class="sub">' + esc(L.name || '') + '・' + rows.length + ' 件</span></h3>';
    if (kind === 'read') {
      const done = rows.filter((x) => !x.status || /読了|済|done|読んだ|完/i.test(x.status));
      const yDone = done.filter((x) => x.d && x.d.y === Y);
      const doy = Math.floor((now - new Date(Y, 0, 1)) / 86400000) + 1;
      const pace = yDone.length / doy * 365;
      const pagesY = yDone.reduce((a, x) => a + (x.n || 0), 0);
      h += tiles([[yDone.length + ' / ' + P.readGoal, '今年 読んだ（冊）', '見込み ' + Math.round(pace) + ' 冊' + (pace >= P.readGoal ? '・目標に届くペース' : '・あと月 ' + Math.max(0, Math.ceil((P.readGoal - yDone.length) / Math.max(1, 12 - M + 1))) + ' 冊')], [thisMonth.length, '今月'], [pagesY ? pagesY.toLocaleString('ja-JP') : '—', '今年のページ'], [rows.filter((x) => /読書中|読んでる|reading|途中/i.test(x.status)).length || '—', '読んでいる']]);
      h += '<div class="s38-goal"><i style="width:' + Math.min(100, yDone.length / P.readGoal * 100).toFixed(1) + '%"></i><span style="left:' + Math.min(100, doy / 365 * 100).toFixed(1) + '%" title="今日の位置"></span></div>';
      h += '<div class="sec">月ごとに読んだ冊数（直近 12 か月）</div>' + barsSvg(sumBy(() => 1), '冊');
      const rts = rows.filter((x) => x.rating);
      if (rts.length) { const hist = [5, 4, 3, 2, 1].map((k) => ['★'.repeat(k), rts.filter((x) => Math.round(x.rating) === k).length]); h += '<div class="cols"><div><div class="sec">評価（平均 ' + (rts.reduce((a, x) => a + x.rating, 0) / rts.length).toFixed(2) + '）</div>' + hbar(hist, '冊') + '</div>'; }
      else h += '<div class="cols"><div></div>';
      h += '<div><div class="sec">よく読む' + (iw >= 0 ? '著者' : 'ジャンル') + '</div>' + hbar(count(rows, iw >= 0 ? 'who' : 'tags').slice(0, 6), '冊') + '</div></div>';
      h += '<div class="sec">最近読んだ</div><ul class="s38-recent">' + dated.slice().sort((a, b) => (b.d.y - a.d.y) || (b.d.m - a.d.m) || (b.d.d - a.d.d)).slice(0, 6).map((x) => '<li><span>' + x.d.y + '.' + x.d.m + '.' + x.d.d + '</span>' + esc(x.title) + (x.rating ? '<em>' + '★'.repeat(Math.round(x.rating)) + '</em>' : '') + '</li>').join('') + '</ul>';
    } else if (kind === 'oshi') {
      const yen = (n) => '¥' + Math.round(n).toLocaleString('ja-JP');
      const spentY = thisYear.reduce((a, x) => a + (x.n || 0), 0), spentM = thisMonth.reduce((a, x) => a + (x.n || 0), 0);
      const avg = sumBy((x) => x.n || 0).slice(0, 11).reduce((a, x) => a + x.v, 0) / 11;
      h += tiles([[yen(spentM), '今月の推し活', avg ? '月平均 ' + yen(avg) : ''], [yen(spentY), '今年'], [thisYear.length, '今年の記録'], [annivSoon()[0] ? annivSoon()[0].days + '日' : '—', annivSoon()[0] ? annivSoon()[0].name + ' ' + annivSoon()[0].what + 'まで' : '次の記念日']]);
      h += '<div class="sec">月ごとの出費（直近 12 か月）</div>' + barsSvg(sumBy((x) => x.n || 0), '円');
      const byWho = new Map(); for (const x of thisYear) for (const w of (x.who.length ? x.who : ['（未設定）'])) byWho.set(w, (byWho.get(w) || 0) + (x.n || 0) / Math.max(1, x.who.length));
      h += '<div class="cols"><div><div class="sec">推しごと（今年・円）</div>' + hbar([...byWho.entries()].map(([k, v2]) => [k, Math.round(v2)]).sort((a, b) => b[1] - a[1]).slice(0, 6), '円') + '</div>';
      h += '<div><div class="sec">種類（今年・件）</div>' + hbar(count(thisYear, 'tags').slice(0, 6), '件') + '</div></div>';
      const an = annivSoon();
      if (an.length) h += '<div class="sec">もうすぐ</div><ul class="s38-recent">' + an.slice(0, 6).map((a) => '<li><span>' + (a.days === 0 ? '今日' : 'あと ' + a.days + ' 日') + '</span>' + esc(a.name) + '　' + esc(a.what) + '</li>').join('') + '</ul>';
    } else {
      const week = dated.filter((x) => { const d = new Date(x.d.y, x.d.m - 1, x.d.d); return (now - d) / 86400000 < 7; });
      const kwHit = rows.filter((x) => Object.values(SR.kw).some((l) => l.some((w) => x.title.includes(w))));
      h += tiles([[week.length, '今週クリップ'], [thisMonth.length, '今月'], [count(rows, 'who').length, '媒体の数'], [kwHit.length, '社労士に関わる記事', '題名に法律・給付の名前']]);
      h += '<div class="sec">月ごとのクリップ（直近 12 か月）</div>' + barsSvg(sumBy(() => 1), '件');
      h += '<div class="cols"><div><div class="sec">媒体</div>' + hbar(count(rows, 'who').slice(0, 6), '件') + '</div><div><div class="sec">テーマ・タグ</div>' + hbar(count(rows, 'tags').slice(0, 6), '件') + '</div></div>';
      h += '<div class="sec">新しい順</div><ul class="s38-recent">' + dated.slice().sort((a, b) => (b.d.y - a.d.y) || (b.d.m - a.d.m) || (b.d.d - a.d.d)).slice(0, 8).map((x) => '<li><span>' + x.d.m + '/' + x.d.d + '</span>' + esc(x.title) + (x.who[0] ? '<em>' + esc(x.who[0]) + '</em>' : '') + '</li>').join('') + '</ul>';
    }
    h += '<div class="btns"><button class="b" data-tbl>表で見る（シート）</button><button class="b" data-re>列を選び直す</button><button class="b" data-x>閉じる</button></div>';
    dialog(h, (d, close) => {
      d.classList.add('wide', 's38-dash');
      d.querySelector('[data-x]').onclick = close;
      d.querySelector('[data-re]').onclick = () => { close(); delete LEDGERS[kind]; store.set(K2.ledgers, LEDGERS); if (v && v.viewId) ledgerSetup(kind, v); else toast('記録の DB のビューを開いてから、もう一度選んでください'); };
      d.querySelector('[data-tbl]').onclick = () => { close(); openSheet(null); };
      d.querySelectorAll('[data-tip]').forEach((g) => { g.setAttribute('title', g.getAttribute('data-tip')); });
    });
  }
  /* 推しの記念日（誕生日の列）— 次に来る日までの日数。小窓の「もうすぐ」に出す */
  function annivCache(data, m) {
    const ib = m.birthday ? data.cols.findIndex((c) => c.name === m.birthday) : -1;
    if (ib < 0) return;
    const iw = m.who ? data.cols.findIndex((c) => c.name === m.who) : -1;
    const ti = data.cols.findIndex((c) => c.type === 'title');
    const list = [];
    for (const r of data.rows) { const v = r.vals[ib]; if (typeof v !== 'number') continue; const p = ENGINE.serialParts(v); list.push({ name: norm(ENGINE.show(iw >= 0 ? r.vals[iw] : r.vals[ti])) || '推し', what: /誕生|birth/i.test(m.birthday) ? '誕生日' : m.birthday, m: p.m, d: p.d }); }
    store.set(K2.anniv, list.slice(0, 200));
  }
  function annivSoon() {
    const list = store.get(K2.anniv, []), t = new Date(); t.setHours(0, 0, 0, 0);
    return list.map((a) => { let d = new Date(t.getFullYear(), a.m - 1, a.d); if (d < t) d = new Date(t.getFullYear() + 1, a.m - 1, a.d); return Object.assign({}, a, { days: Math.round((d - t) / 86400000) }); }).filter((a) => a.days <= 60).sort((a, b) => a.days - b.days);
  }


  /* ============================================================
   *  15.8 DB の道具の段（フィルタ・並べ替え・検索の並び）に Σ — その DB で使える学び・計算・記録
   * ============================================================ */
  function dbBars() {
    for (const f of document.querySelectorAll('.notion-collection-filter, .notion-frame [role="button"][aria-label="Search"]')) {
      const row = f.closest('div[style*="justify-content: end"]') || f.closest('div[style*="justify-content: flex-end"]');
      if (!row || row.querySelector(':scope > .s38-dbb')) continue;
      const b = document.createElement('div'); b.className = 's38-dbb'; b.setAttribute('role', 'button'); b.tabIndex = 0;
      b.title = 'Scholar — この DB をシート・単語帳・○×演習・記録に';
      b.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5H5.5l5 5.5-5 5.5h9"/></svg>';
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); dbPop(b); });
      row.insertBefore(b, row.firstChild);
    }
  }
  function dbPop(b) {
    const blk = b.closest('.notion-collection_view-block, .notion-collection_view_page-block') || document.querySelector('.notion-frame');
    const v = blk && blk.querySelector(VIEW_SEL); if (v) lastViewEl = v;
    popClose(); document.dispatchEvent(new CustomEvent('cordi:closepops', { detail: 's38' }));
    popCss();
    pop = document.createElement('div'); pop.className = 'cordi-pop'; pop.id = 's38-pop'; popB = b;
    const it = (a, ic, l, sub) => '<button class="cp-i" data-s="' + a + '"><span class="ic">' + ICO[ic] + '</span><span class="lb">' + l + (sub ? '<small>' + sub + '</small>' : '') + '</span></button>';
    pop.innerHTML = '<div class="cp-hd"><b>Scholar</b><span>この DB で</span></div>' +
      it('sheet', 'sheet', 'シートで開く', 'Excel の式・計算の列・条件付き書式・書き戻し・マクロ') +
      it('deck', 'card', '単語帳にする', '表と裏の列を選ぶだけ。忘れかけた頃にもう一度') +
      it('quiz', 'ox', '○×で解く', '過去問の DB を肢別演習に') +
      it('glossmk', 'dict', '用語集にする', '本文の用語に乗せると意味が出る') +
      '<div class="cp-div"></div>' + it('ledger:read', 'book', '読書の記録にする', '') + it('ledger:oshi', 'heart', '推しの記録にする', '') + it('ledger:news', 'news', 'ニュースのクリップにする', '');
    document.body.appendChild(pop);
    const r = b.getBoundingClientRect();
    pop.style.top = Math.min(innerHeight - pop.offsetHeight - 8, r.bottom + 6) + 'px';
    pop.style.left = Math.max(8, Math.min(innerWidth - pop.offsetWidth - 8, r.right - pop.offsetWidth)) + 'px';
    pop.addEventListener('click', (e) => {
      const el = e.target.closest('[data-s]'); if (!el) return; const a = el.dataset.s; popClose();
      if (a === 'deck') deckDialog(); else if (a === 'glossmk') glossToggle();
      else if (a.startsWith('ledger:')) { const k = a.slice(7); const vv = findView(); if (vv && vv.viewId) ledgerSetup(k, vv); } else act(a);
    });
    setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!pop) { document.removeEventListener('pointerdown', off, true); return; } if (pop.contains(e.target) || b.contains(e.target)) return; document.removeEventListener('pointerdown', off, true); popClose(); }, true), 0);
  }

  /* ---------- 追加の見た目（ダイアログ・ドリル・記録） ---------- */
  const ADD_CSS = `
.s38-dlg.wide { width: min(760px, 94vw) !important; max-width: none !important; }
.s38-dbb { width: 28px; height: 28px; flex: none; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--c-icoSec, #91918e); }
.s38-dbb:hover { background: var(--ca-bacIntTra, rgba(55,53,47,.06)); color: var(--c-icoPri, #37352f); }
.s38-dbb svg { width: 16px; height: 16px; }
.s38-pt { width: 100%; border-collapse: collapse; font-size: 13px; }
.s38-pt td { padding: 4px 6px; border-bottom: 1px solid var(--lm-line-hair, rgba(0,0,0,.05)); }
.s38-pt td:first-child { width: 58%; }
.s38-pt .ok { color: #2e8b57; } .s38-pt .ng { color: #c4453a; }
.s38-verdict .vl { padding: 6px 10px; border-radius: 8px; margin: 4px 0; font-size: 13px; }
.s38-verdict .vl.ok { background: rgba(46,139,87,.08); } .s38-verdict .vl.ng { background: rgba(196,69,58,.08); }
.s38-verdict .big { margin-top: 8px; font: 600 20px/1.3 var(--cordi-ui-display, "Cormorant Garamond", Georgia, serif); text-align: center; }
.s38-verdict .big.ok { color: #2e8b57; } .s38-verdict .big.ng { color: #c4453a; }
.s38-drill .qt { font-size: 15px; line-height: 2; padding: 10px 14px; border-radius: 10px; background: var(--lm-tint, rgba(0,0,0,.025)); max-height: 38vh; overflow: auto; }
.s38-drill .qt p { margin: 0 0 10px; }
.s38-drill .bl { display: inline-block; min-width: 3em; padding: 0 6px; margin: 0 2px; border-radius: 6px; background: color-mix(in srgb, var(--lm-accent, #2783de) 12%, transparent); color: var(--lm-accent-ink, #1d5fa8); font-weight: 600; cursor: pointer; line-height: 1.6; }
.s38-drill .bl.ok { background: rgba(46,139,87,.14); color: #2e8b57; } .s38-drill .bl.ng { background: rgba(196,69,58,.14); color: #c4453a; }
.s38-drill .ch { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; margin: 12px 0; }
.s38-drill .c { text-align: left; border: 1px solid var(--lm-line, rgba(0,0,0,.1)); background: var(--lm-raised, #fff); border-radius: 8px; padding: 6px 8px; cursor: pointer; font: inherit; font-size: 13px; color: inherit; }
.s38-drill .c:hover { border-color: var(--lm-accent, #2783de); }
.s38-drill .c i { font-style: normal; display: inline-block; min-width: 1.6em; color: var(--lm-mute, #999); font-variant-numeric: tabular-nums; }
.s38-drill .sl { display: flex; flex-wrap: wrap; gap: 8px; }
.s38-drill .sl select { max-width: 200px; }
.s38-drill .vd { margin-top: 10px; font-size: 14px; }
.s38-dt { width: 100% !important; height: auto !important; margin-top: 10px; font: 15px/1.6 ${CORDI_UI} !important; padding: 10px; border-radius: 10px; border: 1px solid var(--lm-line, rgba(0,0,0,.12)); background: var(--lm-sheet, #fff); color: inherit; box-sizing: border-box; }
.s38-diff { margin-top: 10px; } .s38-diff .sc { font-weight: 700; margin-bottom: 4px; }
.s38-diff .df { font-size: 15px; line-height: 1.9; padding: 8px 12px; border-radius: 10px; background: var(--lm-tint, rgba(0,0,0,.025)); }
.s38-diff del { color: #c4453a; text-decoration: none; background: rgba(196,69,58,.12); border-radius: 3px; }
.s38-diff ins { color: #7a5a00; text-decoration: line-through; background: rgba(232,176,74,.18); border-radius: 3px; }
.s38-dash h3 .sub { font: 400 12px/1 ${CORDI_UI}; color: var(--lm-mute, #888); margin-left: 6px; }
.s38-kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 6px 0 10px; }
.s38-kpi div { padding: 10px 12px; border-radius: 12px; background: var(--lm-tint, rgba(0,0,0,.03)); }
.s38-kpi b { display: block; font: 600 22px/1.15 ${CORDI_UI}; font-variant-numeric: tabular-nums; letter-spacing: -.01em; color: var(--lm-ink, #2c2c2b); }
.s38-kpi span { font-size: 11.5px; color: var(--lm-mute, #888); } .s38-kpi small { display: block; font-size: 10.5px; color: var(--lm-mute, #999); margin-top: 2px; }
.s38-goal { position: relative; height: 6px; border-radius: 6px; background: var(--lm-line, rgba(0,0,0,.08)); margin: 2px 0 12px; }
.s38-goal i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 6px; background: var(--lm-accent, #2783de); }
.s38-goal span { position: absolute; top: -3px; width: 2px; height: 12px; background: var(--lm-ink, #333); opacity: .45; border-radius: 1px; }
.s38-dash .sec { margin: 12px 0 4px; font-size: 11.5px; font-weight: 600; color: var(--lm-mute, #888); letter-spacing: .02em; }
.s38-bars { width: 100%; height: auto; display: block; }
.s38-bars .ax { stroke: var(--lm-line, rgba(0,0,0,.12)); stroke-width: 1; }
.s38-bars .b { fill: color-mix(in srgb, var(--lm-accent, #2783de) 55%, transparent); transition: fill .12s; }
.s38-bars .b.cur { fill: var(--lm-accent, #2783de); }
.s38-bars .bk:hover .b { fill: var(--lm-accent, #2783de); }
.s38-bars .hit { fill: transparent; }
.s38-bars .lb { font: 10px ${CORDI_UI}; fill: var(--lm-mute, #888); text-anchor: middle; }
.s38-bars .vl { font: 600 10.5px ${CORDI_UI}; fill: var(--lm-ink, #333); text-anchor: middle; font-variant-numeric: tabular-nums; }
.s38-dash .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.s38-hb .r { display: grid; grid-template-columns: minmax(0, 7em) 1fr auto; align-items: center; gap: 8px; padding: 3px 0; font-size: 12.5px; }
.s38-hb .k { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.s38-hb .t { height: 8px; border-radius: 4px; background: var(--lm-line-hair, rgba(0,0,0,.05)); overflow: hidden; }
.s38-hb .t i { display: block; height: 100%; border-radius: 4px; background: var(--lm-accent, #2783de); }
.s38-hb .v { font-variant-numeric: tabular-nums; color: var(--lm-mute, #777); font-size: 12px; }
.s38-recent { list-style: none; margin: 0; padding: 0; font-size: 13px; }
.s38-recent li { display: flex; gap: 10px; padding: 5px 2px; border-bottom: 1px solid var(--lm-line-hair, rgba(0,0,0,.05)); }
.s38-recent li span { flex: none; width: 6.5em; color: var(--lm-mute, #999); font-variant-numeric: tabular-nums; font-size: 12px; }
.s38-recent li em { margin-left: auto; font-style: normal; color: var(--lm-mute, #999); font-size: 12px; white-space: nowrap; }`;
  function addCss() { if (!document.getElementById('s38-add-css')) { const st = document.createElement('style'); st.id = 's38-add-css'; st.textContent = ADD_CSS; document.head.appendChild(st); } }

  /* ============================================================
   *  14. 動かす
   * ============================================================ */
  window.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey && e.altKey) || e.metaKey) return;
    const k = e.code;
    const hit = (f) => { e.preventDefault(); e.stopPropagation(); f(); };
    if (k === 'KeyE') hit(() => openSheet(null));
    else if (k === 'KeyK') hit(() => setRed());          // v11: ⌃⌥R は ²⁶ Atelier の縦書きリーダーと重なっていた
    else if (k === 'KeyT') hit(() => speak());
    else if (k === 'KeyQ') hit(() => { const b = dock(); if (b) popOpen(b); else panel(); });   // v11: ⌃⌥S は ²⁶ Atelier の設定と重なっていた
    else if (k === 'KeyH') hit(() => setCloze());
    else if (k === 'Equal' || e.key === '=') hit(evalSelection);
    else if (/^Digit[1-9]$/.test(k)) hit(() => runMacroByIndex(+k.slice(5) - 1));
  }, true);
  let lastHref = '';
  setInterval(() => { if (location.href !== lastHref) { lastHref = location.href; readScroller = null; } readingWatch(); }, 1000);
  restoreCf();
  /* v11: 上の帯の Σ・用語の印・ほかの柱への知らせ */
  try { document.documentElement.setAttribute('data-cordi-s38', VERSION); } catch (e) { /* noop */ }   // ²⁶ の ⋯ メニューが「入っている柱」を知る印
  const bootUi = () => {
    dock(); announce();
    addCss();
    let dbT = 0;
    new MutationObserver(() => { const b = document.getElementById('cordi-b-s38'); if (!b || !b.isConnected) dock(); glossSoon(); if (!dbT) dbT = setTimeout(() => { dbT = 0; dbBars(); }, 250); }).observe(document.body, { childList: true, subtree: true });
    dbBars();
    setInterval(() => { const b = document.getElementById('cordi-b-s38'); if (b) { const n = dueCount(); b.querySelector('.cd-badge').textContent = n ? String(Math.min(99, n)) : ''; } }, 60000);
    glossSoon();
  };
  if (document.body) bootUi(); else document.addEventListener('DOMContentLoaded', bootUi, { once: true });

  /* ============================================================
   *  16. v12: Notion の数式エディタに組み込む（関数とマクロ）
   *    Notion の数式は Notion の中で計算される → 独自の関数そのものは足せない。
   *    → 「Edit formula」の左の一覧に、Notion の一覧と同じ形の段（Cordivestium）を足し、選ぶと
   *      同じ計算をする「Notion の数式」をその場に書き込む（＝マクロ）。書き込んだ式は Notion の式なので、
   *      ほかの端末・スクリプトの無い所でも、そのまま Notion がいつも計算する。
   *    ・右の説明の欄も Notion と同じ形（名前・説明・例）。プロパティを選ぶ欄つき。
   *    ・入力中の語でしぼる（Notion の一覧と同じく）。
   *    ・自分のマクロ: 今の式を名前を付けて保存 → 次からこの段に出る。
   * ============================================================ */
  const FX_KEY = 'c38.fxmacros';
  let FXU = store.get(FX_KEY, []);
  const KENPO_T = [[58000, 0], [68000, 63000], [78000, 73000], [88000, 83000], [98000, 93000], [104000, 101000], [110000, 107000], [118000, 114000], [126000, 122000], [134000, 130000], [142000, 138000], [150000, 146000], [160000, 155000], [170000, 165000], [180000, 175000], [190000, 185000], [200000, 195000], [220000, 210000], [240000, 230000], [260000, 250000], [280000, 270000], [300000, 290000], [320000, 310000], [340000, 330000], [360000, 350000], [380000, 370000], [410000, 395000], [440000, 425000], [470000, 455000], [500000, 485000], [530000, 515000], [560000, 545000], [590000, 575000], [620000, 605000], [650000, 635000], [680000, 665000], [710000, 695000], [750000, 730000], [790000, 770000], [830000, 810000], [880000, 855000], [930000, 905000], [980000, 955000], [1030000, 1005000], [1090000, 1055000], [1150000, 1115000], [1210000, 1175000], [1270000, 1235000], [1330000, 1295000], [1390000, 1355000]];
  function fxHyojun(x, kind, grade) {
    const rows = kind === 'kn' ? KENPO_T.slice(3, 35) : KENPO_T;
    const parts = [];
    for (let i = 0; i < rows.length - 1; i++) parts.push('w < ' + rows[i + 1][1] + ', ' + (grade ? i + 1 : rows[i][0]));
    parts.push(String(grade ? rows.length : rows[rows.length - 1][0]));
    return 'lets(w, ' + x + ', ifs(' + parts.join(', ') + '))';
  }
  const ymdOf = (d) => d ? d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') : '';
  /* 引数: d = 日付のプロパティ, n = 数のプロパティか数, k = 数（そのまま）, s = 選ぶ */
  const FXB = [
    { id: 'HYOJUN', name: '標準報酬月額', en: 'HYOJUN', cat: '社労士', ret: 'number', args: [['報酬月額', 'n'], ['制度', 's', [['kp', '健康保険（50 等級）'], ['kn', '厚生年金（32 等級）']]]],
      desc: '報酬月額から、標準報酬月額を出す（以上〜未満で等級を決める）。表は令和 2 年 9 月からの現行のもの。', ex: ['標準報酬月額(prop("報酬")) → 300000'],
      f: (a) => fxHyojun(a[0], a[1], false) },
    { id: 'TOUKYU', name: '標準報酬の等級', en: 'TOUKYU', cat: '社労士', ret: 'number', args: [['報酬月額', 'n'], ['制度', 's', [['kp', '健康保険（50 等級）'], ['kn', '厚生年金（32 等級）']]]],
      desc: '報酬月額から、標準報酬の等級（健保 1〜50・厚年 1〜32）を出す。', ex: ['等級(prop("報酬")) → 22'], f: (a) => fxHyojun(a[0], a[1], true) },
    { id: 'NENREI', name: '年齢（法律上）', en: 'NENREI', cat: '社労士', ret: 'number', args: [['生年月日', 'd']],
      desc: '「年齢計算ニ関スル法律」の数え方で、今日の年齢。誕生日の前日が終わる時に 1 つ増える。', ex: ['年齢(prop("生年月日")) → 34'],
      f: (a) => 'dateBetween(dateAdd(today(), 1, "days"), ' + a[0] + ', "years")' },
    { id: 'TASSHIBI', name: '○歳に達した日', en: 'TASSHIBI', cat: '社労士', ret: 'date', args: [['生年月日', 'd'], ['年齢', 'k', 60]],
      desc: 'その年齢に「達した日」（＝誕生日の前日）。60 歳・65 歳・70 歳・75 歳の手続きの日に。', ex: ['達した日(prop("生年月日"), 65)'],
      f: (a) => 'dateSubtract(dateAdd(' + a[0] + ', ' + a[1] + ', "years"), 1, "days")' },
    { id: 'KIKAN', name: '期間の末日（民法）', en: 'KIKAN', cat: '社労士', ret: 'date', args: [['出来事の日', 'd'], ['長さ', 'k', 2], ['単位', 's', [['years', '年'], ['months', '月'], ['weeks', '週'], ['days', '日']]]],
      desc: '民法 140〜143 条: 初日は数えず、応当日の前日で終わる。応当日が無い月は月末。時効・申請の期限の確かめに。', ex: ['期間末日(prop("退職日"), 2, "年")'],
      f: (a) => 'dateAdd(' + a[0] + ', ' + a[1] + ', "' + a[2] + '")' },
    { id: 'SOUSHITSU', name: '資格喪失日', en: 'SOUSHITSU', cat: '社労士', ret: 'date', args: [['退職日・死亡日', 'd']],
      desc: '被保険者の資格を失う日（その翌日）。', ex: ['資格喪失日(prop("退職日"))'], f: (a) => 'dateAdd(' + a[0] + ', 1, "days")' },
    { id: 'SHIKEN', name: '試験まであと', en: 'SHIKEN', cat: '社労士', ret: 'number', args: [],
      desc: '社労士試験の日（Scholar の設定。既定は 8 月の第 4 日曜日）まで、あと何日。', ex: ['試験まで() → 322'],
      f: () => 'dateBetween(parseDate("' + ymdOf(examDate()) + '"), today(), "days")' },
    { id: 'WAREKI', name: '和暦', en: 'WAREKI', cat: '暮らし', ret: 'text', args: [['日付', 'd']],
      desc: '日付の年を、令和・平成・昭和で（元年も）。', ex: ['和暦(prop("日付")) → 令和8年'],
      f: (a) => 'lets(y, year(' + a[0] + '), ifs(y >= 2019, "令和" + if(y == 2019, "元", format(y - 2018)), y >= 1989, "平成" + if(y == 1989, "元", format(y - 1988)), "昭和" + format(y - 1925)) + "年")' },
    { id: 'YOUBI', name: '曜日', en: 'YOUBI', cat: '暮らし', ret: 'text', args: [['日付', 'd']],
      desc: '日付の曜日を 1 文字で（月〜日）。', ex: ['曜日(prop("日付")) → 土'],
      f: (a) => 'substring("月火水木金土日", day(' + a[0] + ') - 1, day(' + a[0] + '))' },
    { id: 'KEIKA', name: '経過日数', en: 'KEIKA', cat: '暮らし', ret: 'number', args: [['日付', 'd']],
      desc: 'その日から今日まで何日たったか。', ex: ['経過日数(prop("始めた日"))'], f: (a) => 'dateBetween(today(), ' + a[0] + ', "days")' },
    { id: 'NOKORI', name: '残り日数', en: 'NOKORI', cat: '暮らし', ret: 'number', args: [['期限', 'd']],
      desc: '今日から期限まで、あと何日（過ぎたら負の数）。', ex: ['残り日数(prop("期限"))'], f: (a) => 'dateBetween(' + a[0] + ', today(), "days")' },
    { id: 'KINENBI', name: '次の記念日まで', en: 'KINENBI', cat: '推し・記録', ret: 'number', args: [['記念日・誕生日', 'd']],
      desc: '毎年の記念日（推しの誕生日・デビュー日など）の、次の日まであと何日。', ex: ['次の記念日まで(prop("誕生日")) → 41'],
      f: (a) => 'lets(b, ' + a[0] + ', n, dateAdd(b, year(today()) - year(b), "years"), nx, if(n < today(), dateAdd(n, 1, "years"), n), dateBetween(nx, today(), "days"))' },
    { id: 'BAR', name: '進み具合の棒', en: 'BAR', cat: '推し・記録', ret: 'text', args: [['今', 'n'], ['全体', 'n']],
      desc: '読んだページ・進んだ量を、■□ の棒と % で（読書記録・学習の進み）。', ex: ['進み具合(prop("読んだ"), prop("全ページ")) → ■■■■■■□□□□ 62%'],
      f: (a) => 'lets(r, min(1, max(0, ' + a[0] + ' / ' + a[1] + ')), repeat("■", round(r * 10)) + repeat("□", 10 - round(r * 10)) + " " + format(round(r * 100)) + "%")' },
    { id: 'ZEIKOMI', name: '税込', en: 'ZEIKOMI', cat: '推し・記録', ret: 'number', args: [['税抜の金額', 'n'], ['税率', 's', [['1.1', '10%'], ['1.08', '8%（軽減）']]]],
      desc: '税抜の金額から税込（1 円未満は切り捨て）。推し活の出費の記録に。', ex: ['税込(prop("金額")) → 3300'], f: (a) => 'floor(' + a[0] + ' * ' + a[1] + ')' }
  ];
  const FX_ICO = {
    number: '<svg viewBox="0 0 20 20" style="width:16px;height:100%;display:block;fill:var(--c-icoSec);flex-shrink:0"><path d="M8.848 3.085c.34.06.567.384.507.724l-.61 3.466h3.42l.65-3.683a.625.625 0 0 1 1.23.216l-.61 3.467h2.435a.625.625 0 1 1 0 1.25h-2.655l-.52 2.95h2.435a.625.625 0 0 1 0 1.25h-2.655l-.65 3.684a.625.625 0 0 1-1.23-.217l.61-3.467h-3.42l-.65 3.684a.625.625 0 0 1-1.23-.217l.61-3.467H4.13a.625.625 0 1 1 0-1.25h2.605l.52-2.95H4.87a.625.625 0 0 1 0-1.25h2.605l.65-3.683a.625.625 0 0 1 .723-.507m2.578 8.39.52-2.95H8.523l-.52 2.95z"/></svg>',
    date: '<svg viewBox="0 0 20 20" style="width:16px;height:100%;display:block;fill:var(--c-icoSec);flex-shrink:0"><path d="M5.25 3.125A2.125 2.125 0 0 0 3.125 5.25v9.5c0 1.174.951 2.125 2.125 2.125h9.5a2.125 2.125 0 0 0 2.125-2.125v-9.5a2.125 2.125 0 0 0-2.125-2.125zm-.875 3.69h11.25v7.935a.875.875 0 0 1-.875.875h-9.5a.875.875 0 0 1-.875-.875z"/></svg>',
    text: '<svg viewBox="0 0 20 20" style="width:16px;height:100%;display:block;fill:var(--c-icoSec);flex-shrink:0"><path d="M2.9 4.375a.625.625 0 0 0 0 1.25h14.2a.625.625 0 1 0 0-1.25zm0 3.333a.625.625 0 0 0 0 1.25h14.2a.625.625 0 0 0 0-1.25zM2.275 15c0-.345.28-.625.625-.625H10a.625.625 0 1 1 0 1.25H2.9A.625.625 0 0 1 2.275 15m.625-3.958a.625.625 0 1 0 0 1.25h14.2a.625.625 0 0 0 0-1.25z"/></svg>',
    macro: '<svg viewBox="0 0 20 20" style="width:16px;height:100%;display:block;fill:var(--c-icoSec);flex-shrink:0"><path d="M11.633 1.812c.263.096.43.354.41.632l-.392 5.51h3.099a.625.625 0 0 1 .506.992l-6.18 8.54a.625.625 0 0 1-1.13-.412l.402-5.5H5.25a.625.625 0 0 1-.507-.99l6.17-8.55a.625.625 0 0 1 .72-.222m-5.161 8.513H9.02a.625.625 0 0 1 .623.67l-.29 3.976 4.173-5.766H10.98a.625.625 0 0 1-.623-.67l.284-3.987z"/></svg>',
    plus: '<svg viewBox="0 0 20 20" style="width:16px;height:100%;display:block;fill:var(--c-icoSec);flex-shrink:0"><path d="M10 3.4a.66.66 0 0 1 .66.66v5.28h5.28a.66.66 0 0 1 0 1.32h-5.28v5.28a.66.66 0 0 1-1.32 0v-5.28H4.06a.66.66 0 0 1 0-1.32h5.28V4.06A.66.66 0 0 1 10 3.4"/></svg>'
  };
  const fxCss = () => {
    if (document.getElementById('c38-fx-css')) return;
    const st = document.createElement('style'); st.id = 'c38-fx-css';
    st.textContent = `
.c38-fx-it[data-act] { background: rgb(from var(--ca-bacIntTra) r g b / calc(alpha * 1)); }
.c38-fx-desc { position: absolute; inset: 0; z-index: 3; background: var(--c-popBac, #fff); display: flex; flex-direction: column; font-size: 12px; gap: 8px; overflow: auto; padding: 12px 14px; text-wrap: wrap; }
.c38-fx-desc .h { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.c38-fx-desc .h small { font-weight: 400; color: var(--c-texTer); font-size: 11px; margin-inline-start: auto; }
.c38-fx-desc .d { color: var(--c-texSec); line-height: 1.55; }
.c38-fx-desc code { font-family: monospace; white-space: pre-wrap; font-size: 11px; border-radius: 5px; border: 1px solid var(--c-borSec); margin: 0 -4px; padding: 6px; opacity: .95; display: block; word-break: break-all; }
.c38-fx-desc .args { display: grid; grid-template-columns: max-content 1fr; gap: 6px 10px; align-items: center; }
.c38-fx-desc .args label { color: var(--c-texSec); }
.c38-fx-desc select, .c38-fx-desc input { font: inherit; font-size: 12px; height: 26px; border-radius: 6px; border: 0; padding: 0 6px; background: var(--ca-bacSecTra, rgba(55,53,47,.06)); color: var(--c-texPri); box-shadow: var(--ca-borPriTra) 0 0 0 1px; min-width: 0; }
.c38-fx-desc .bt { display: flex; gap: 6px; margin-top: 2px; }
.c38-fx-desc button { font: inherit; font-size: 12px; font-weight: 500; height: 28px; padding: 0 12px; border-radius: 6px; border: 0; cursor: pointer; background: var(--ca-bacSecTra, rgba(55,53,47,.06)); color: var(--c-texPri); }
.c38-fx-desc button.pri { background: var(--c-intBlu, #2383e2); color: #fff; }
.c38-fx-x { margin-inline-start: auto; opacity: 0; font-size: 13px; padding: 0 4px; color: var(--c-texTer); cursor: pointer; }
.c38-fx-it:hover .c38-fx-x { opacity: 1; }`;
    document.head.appendChild(st);
  };
  /* 数式のエディタ（等幅の入力欄）と、左の一覧を見つける */
  function fxFind(dlg) {
    const ed = [...dlg.querySelectorAll('[contenteditable="true"][role="textbox"]')].find((e) => /SFMono|monospace/i.test(e.getAttribute('style') || ''));
    const menu = dlg.querySelector('[role="menu"]');
    if (!ed || !menu) return null;
    const pane = menu.closest('div[style*="position: relative"]');
    const desc = pane && pane.nextElementSibling;
    return { ed, menu, desc };
  }
  /* 今の式を Notion の式の文字に（プロパティの札は prop("名前") に戻す） */
  function fxSerialize(ed) {
    let out = '';
    const walk = (n) => {
      if (n.nodeType === 3) { out += n.nodeValue; return; }
      if (n.nodeType !== 1) return;
      if (n.classList.contains('notion-text-mention-token')) { out += 'prop("' + norm(n.textContent).replace(/"/g, '\\"') + '")'; return; }
      for (const c of n.childNodes) walk(c);
    };
    walk(ed);
    return out.replace(/ /g, ' ').trim();
  }
  function fxProps(menu) {
    /* 一覧の最初の段（Properties）の名前 = この DB のプロパティ */
    const sec = [...menu.children].find((s) => !s.hasAttribute('data-c38-fx') && /^(Properties|プロパティ)/.test(norm((s.firstElementChild || {}).textContent)));
    return sec ? [...sec.querySelectorAll('[role="menuitem"]')].map((m) => norm(m.textContent)).filter(Boolean) : [];
  }
  function fxInsert(ed, code) {
    ed.focus();
    const sel = getSelection();
    if (!sel.rangeCount || !ed.contains(sel.anchorNode)) { const r = document.createRange(); r.selectNodeContents(ed); r.collapse(false); sel.removeAllRanges(); sel.addRange(r); }
    const before = fxSerialize(ed);
    let ok = false;
    try { ok = document.execCommand('insertText', false, code); } catch (e) { ok = false; }
    setTimeout(() => {
      if (!ok || fxSerialize(ed) === before) {
        try { navigator.clipboard.writeText(code); } catch (e) { /* noop */ }
        toast('式をクリップボードに写しました。数式の欄で ⌘V で貼ってください');
      }
    }, 60);
  }
  function fxDescHtml(m, props, user) {
    const opt = (list, cur) => list.map(([v, l]) => '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(l) + '</option>').join('');
    const pick = (want) => props.find((p) => p.includes(want)) || props[0] || '';
    let args = '';
    (m.args || []).forEach(([l, t, x], i) => {
      let c;
      if (t === 's') c = '<select data-a="' + i + '">' + opt(x) + '</select>';
      else if (t === 'k') c = '<input data-a="' + i + '" value="' + esc(x == null ? '' : x) + '" inputmode="decimal">';
      else c = '<select data-a="' + i + '">' + opt(props.map((p) => ['prop:' + p, p]), 'prop:' + pick(l.slice(0, 2))) + (t === 'n' ? '<option value="num">数を入れる…</option>' : '') + '</select>';
      args += '<label>' + esc(l) + '</label>' + c;
    });
    return '<div class="h">' + (FX_ICO[m.ret] || FX_ICO.macro) + esc(m.name) + '<small>' + esc(user ? '自分のマクロ' : 'Cordivestium · ' + m.cat) + '</small></div>' +
      '<div class="d">' + esc(m.desc || '') + '</div>' +
      (args ? '<div class="args">' + args + '</div>' : '') +
      '<div class="bt"><button class="pri" data-go>式を書き込む</button>' + (user ? '<button data-del>このマクロを消す</button>' : '') + '</div>' +
      (m.ex || []).map((e) => '<code>' + esc(e) + '</code>').join('') +
      '<div class="d" style="font-size:11px">書き込むのは Notion の数式そのもの（' + esc(m.en || '') + ' の中身を Notion の関数で書いたもの）。保存すれば、この印の無い端末でも Notion がそのまま計算します。</div>';
  }
  function fxArgs(m, box) {
    return (m.args || []).map(([l, t], i) => {
      const el = box.querySelector('[data-a="' + i + '"]');
      let v = el ? el.value : '';
      if (t === 'k') return String(+v || 0);
      if (t === 's') return v;
      if (v === 'num') { const n = prompt(l + '（数）', '0'); return String(+n || 0); }
      return v.startsWith('prop:') ? 'prop("' + v.slice(5).replace(/"/g, '\\"') + '")' : '0';
    });
  }
  function fxInject(dlg) {
    const F = fxFind(dlg);
    if (!F) return;
    const { ed, menu, desc } = F;
    const q = ((fxSerialize(ed).match(/[\p{L}\p{N}_]+$/u) || [''])[0]).toLowerCase();
    let sec = menu.querySelector(':scope > [data-c38-fx]');
    const tplSec = [...menu.children].find((s) => !s.hasAttribute('data-c38-fx') && s.querySelector('[role="menuitem"]'));
    if (!tplSec) return;
    const list = FXB.map((m) => ({ m, user: false })).concat(FXU.map((m) => ({ m: Object.assign({ ret: 'macro', cat: 'マクロ', args: [] }, m), user: true })));
    const hit = (m) => !q || [m.name, m.en, m.cat].some((x) => String(x || '').toLowerCase().includes(q));
    const shown = list.filter((x) => hit(x.m));
    const sig = q + '|' + shown.map((x) => x.m.id || x.m.name).join(',');
    if (sec && sec.__sig === sig) { if (menu.firstElementChild !== sec && !q) menu.insertBefore(sec, menu.firstElementChild); return; }
    if (sec) sec.remove();
    if (!shown.length && q) return;
    fxCss();
    sec = tplSec.cloneNode(false);
    sec.setAttribute('data-c38-fx', '1');
    sec.__sig = sig;
    const head = tplSec.firstElementChild.cloneNode(true);
    head.querySelectorAll('[role="status"], [contenteditable="false"]').forEach((x) => x.remove());
    const ht = head.querySelector('.xamitd3') || head.firstElementChild || head;
    ht.textContent = 'Cordivestium';
    sec.appendChild(head);
    const tplIt = tplSec.querySelector('[role="menuitem"]');
    const mk = (label, ico, fn, user) => {
      const it = tplIt.cloneNode(true);
      it.removeAttribute('id'); it.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id'));
      it.classList.add('c38-fx-it');
      it.style.background = '';
      const icw = it.querySelector('svg') && it.querySelector('svg').parentElement;
      if (icw) icw.innerHTML = ico;
      const pres = it.querySelector('[role="presentation"]');
      if (pres) pres.innerHTML = '<span style="color: var(--c-texPri);">' + esc(label) + '</span><span style="color: var(--c-texTer);">()</span>';
      const tail = it.querySelector('.xvc5jky');
      if (tail && user) tail.innerHTML = '<span class="c38-fx-x" title="消す">×</span>';
      it.addEventListener('mouseenter', () => fxShow(dlg, fn, user));
      it.addEventListener('mousedown', (e) => e.preventDefault());
      it.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fxShow(dlg, fn, user, true); });
      return it;
    };
    for (const { m, user } of shown) sec.appendChild(mk(m.name, FX_ICO[m.ret] || FX_ICO.macro, m, user));
    if (!q) {
      const save = mk('いまの式をマクロに', FX_ICO.plus, null, false);
      const pres = save.querySelector('[role="presentation"]'); if (pres) pres.innerHTML = '<span style="color: var(--c-texSec);">＋ いまの式をマクロとして保存</span>';
      save.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        const code = fxSerialize(ed);
        if (!code) { toast('式が空です'); return; }
        const name = prompt('マクロの名前（この段に出ます）', '');
        if (!name) return;
        FXU = FXU.filter((x) => x.name !== name).concat([{ id: 'u' + Date.now().toString(36), name, en: 'MACRO', code, desc: '自分で保存した式。', ex: [code.length > 120 ? code.slice(0, 120) + '…' : code] }]);
        store.set(FX_KEY, FXU); toast('マクロ「' + name + '」を保存しました'); sec.__sig = ''; fxInject(dlg);
      };
      sec.appendChild(save);
    }
    menu.insertBefore(sec, menu.firstElementChild);
    sec.addEventListener('mouseleave', () => { if (!dlg.__fxPin) fxHide(dlg); });
  }
  function fxHide(dlg) { const o = dlg.querySelector('.c38-fx-desc'); if (o) o.remove(); dlg.__fxPin = false; }
  function fxShow(dlg, m, user, pin) {
    const F = fxFind(dlg); if (!F || !F.desc) return;
    if (dlg.__fxPin && !pin) return;
    if (!m) return;
    let o = dlg.querySelector('.c38-fx-desc');
    if (!o) { o = document.createElement('div'); o.className = 'c38-fx-desc'; if (getComputedStyle(F.desc).position === 'static') F.desc.style.position = 'relative'; F.desc.appendChild(o); }
    o.innerHTML = fxDescHtml(m, fxProps(F.menu), user);
    dlg.__fxPin = !!pin;
    o.querySelector('[data-go]').onclick = () => {
      const code = user ? m.code : m.f(fxArgs(m, o));
      fxInsert(F.ed, code); fxHide(dlg);
    };
    const del = o.querySelector('[data-del]');
    if (del) del.onclick = () => { FXU = FXU.filter((x) => x.id !== m.id); store.set(FX_KEY, FXU); fxHide(dlg); const s = dlg.querySelector('[data-c38-fx]'); if (s) { s.__sig = ''; } fxInject(dlg); toast('マクロ「' + m.name + '」を消しました'); };
    o.addEventListener('mousedown', (e) => { if (!/SELECT|INPUT|OPTION/.test(e.target.tagName)) e.preventDefault(); });
  }
  let fxT = 0;
  function fxScan() {
    for (const dlg of document.querySelectorAll('[role="dialog"]')) {
      if (!dlg.querySelector('[role="menu"]')) continue;
      try { fxInject(dlg); } catch (e) { ST.lastError = 'fx: ' + (e && e.message); }
    }
  }
  const fxBoot = () => {
    new MutationObserver(() => { if (!fxT) fxT = setTimeout(() => { fxT = 0; fxScan(); }, 90); }).observe(document.body, { childList: true, subtree: true, characterData: true });
    document.addEventListener('pointerdown', (e) => { for (const dlg of document.querySelectorAll('[role="dialog"]')) if (dlg.__fxPin && !e.target.closest('.c38-fx-desc, .c38-fx-it')) fxHide(dlg); }, true);
  };
  if (document.body) fxBoot(); else document.addEventListener('DOMContentLoaded', fxBoot, { once: true });

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

  /* v22: Notion の「ビューの設定」の Cordivestium の段 — 表をシートで開く・条件付き書式 */
  const S_VSI = (d) => '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
  const S_TABLE = (c) => /^(Table|表|テーブル|List|リスト|Gallery|ギャラリー|Board|ボード)$/i.test(c.layout || '');
  const S_VS = cordiVS([
    { id: 'c38.sheet', where: 'section', order: 60, label: 'シートで開く', icon: S_VSI('M3.5 3.5h13v13h-13zM3.5 7.5h13M3.5 11.5h13M8 3.5v13M12.5 3.5v13'), show: S_TABLE,
      value: () => '⌃⌥E', onClick: (ctx) => { const v = ctx.view; document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true })); setTimeout(() => { try { openSheet(v); } catch (e) { toast('シートを開けませんでした'); } }, 120); } },
    { id: 'c38.cf', where: 'section', order: 61, label: '条件付き書式を表のセルにも', icon: S_VSI('M4 4h12v12H4zM4 10h12M10 4v12M5.5 5.5h3v3h-3z'), show: (c) => /^(Table|表|テーブル)$/i.test(c.layout || ''),
      toggle: () => !!P.cfToNotion, onClick: () => { P.cfToNotion = !P.cfToNotion; saveP(); if (!P.cfToNotion) { const st = document.getElementById('s38-cf'); if (st) st.textContent = ''; } else restoreCf(); } }
  ]);
  void S_VS;

  window.__c38 = {
    version: VERSION,
    eval: (f) => ENGINE.show(ENGINE.run(String(f).startsWith('=') ? f : '=' + f, {})),
    engine: ENGINE,
    sheet: () => openSheet(null),
    panel,
    macros: () => MACROS.map((m) => m.name),
    study: { redsheet: setRed, cloze: setCloze, pomodoro: () => pomoStart('work'), decks: deckDialog, log: () => LOG, quiz: quizStart, drill: drillStart, pass: passDialog, speak, dictation, gloss: glossToggle, ledger: ledgerOpen, exam: () => ({ date: examDate(), days: daysUntil(examDate()) }) },
    pop: () => { const b = dock(); if (b) popOpen(b); },
    fx: { list: () => FXB.map((m) => m.name), expand: (id, args) => { const m = FXB.find((x) => x.id === id); return m ? m.f(args || []) : ''; }, scan: fxScan },
    status: () => Object.assign({ prefs: Object.assign({}, P), decks: DECKS.length, macros: MACROS.length, undo: UNDO.length, sheetOpen: !!SH }, ST)
  };
})();
