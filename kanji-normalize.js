/**
 * kanji-normalize.js
 * 判定前の文字の正規化（常用漢字さん・教育漢字さんで同じ内容を使う）。
 *
 * PDF は、見た目が同じでも「部首用の文字コード」で文字を持っていることがある
 * （例: 「長」が U+2ED1 ⻑、「民」が U+2EA0 ⺠）。そのまま判定すると表外字・配当外として
 * 誤検知されるため、通常の漢字（CJK 統合漢字）へ置き換えてから判定する。
 *
 * - 康熙部首（U+2F00〜2FD5）は Unicode 正規化（NFKC）で通常の漢字になる。
 * - CJK 部首補助（U+2E80〜2EF3）は NFKC ではほとんど変換されないため、下の対応表で置き換える。
 *   出典: Unicode Character Database「EquivalentUnifiedIdeograph-18.0.0.txt」（2026-02-03）
 *   https://www.unicode.org/Public/UCD/latest/ucd/EquivalentUnifiedIdeograph.txt
 */

// [部首補助の開始, 終了, 対応する統合漢字]（16 進）。出典の行をそのまま写したもの
const CJK_RADICAL_SUPPLEMENT_RANGES = [
  ["2E81", "2E81", "5382"], ["2E82", "2E82", "4E5B"], ["2E83", "2E83", "4E5A"], ["2E84", "2E84", "4E59"],
  ["2E85", "2E85", "4EBB"], ["2E86", "2E86", "5182"], ["2E87", "2E87", "20628"], ["2E88", "2E88", "5200"],
  ["2E89", "2E89", "5202"], ["2E8A", "2E8A", "535C"], ["2E8B", "2E8B", "353E"], ["2E8C", "2E8D", "5C0F"],
  ["2E8E", "2E8E", "5140"], ["2E8F", "2E8F", "5C23"], ["2E90", "2E90", "5C22"], ["2E91", "2E91", "21BC2"],
  ["2E92", "2E92", "5DF3"], ["2E93", "2E93", "5E7A"], ["2E94", "2E94", "5F51"], ["2E95", "2E95", "2B739"],
  ["2E96", "2E96", "5FC4"], ["2E97", "2E97", "5FC3"], ["2E98", "2E98", "624C"], ["2E99", "2E99", "6535"],
  ["2E9B", "2E9B", "65E1"], ["2E9C", "2E9C", "65E5"], ["2E9D", "2E9D", "6708"], ["2E9E", "2E9E", "6B7A"],
  ["2E9F", "2E9F", "6BCD"], ["2EA0", "2EA0", "6C11"], ["2EA1", "2EA1", "6C35"], ["2EA2", "2EA2", "6C3A"],
  ["2EA3", "2EA3", "706C"], ["2EA4", "2EA5", "722B"], ["2EA6", "2EA6", "4E2C"], ["2EA7", "2EA7", "725B"],
  ["2EA8", "2EA8", "72AD"], ["2EA9", "2EA9", "738B"], ["2EAA", "2EAA", "24D14"], ["2EAB", "2EAB", "76EE"],
  ["2EAC", "2EAC", "793A"], ["2EAD", "2EAD", "793B"], ["2EAE", "2EAE", "25AD7"], ["2EAF", "2EAF", "7CF9"],
  ["2EB0", "2EB0", "7E9F"], ["2EB1", "2EB1", "7F53"], ["2EB2", "2EB2", "7F52"], ["2EB3", "2EB3", "34C1"],
  ["2EB4", "2EB4", "5197"], ["2EB5", "2EB5", "2626B"], ["2EB6", "2EB6", "7F8A"], ["2EB7", "2EB7", "2634C"],
  ["2EB8", "2EB8", "2634B"], ["2EB9", "2EB9", "8002"], ["2EBA", "2EBA", "8080"], ["2EBB", "2EBB", "807F"],
  ["2EBC", "2EBC", "8089"], ["2EBD", "2EBD", "26951"], ["2EBE", "2EC0", "8279"], ["2EC1", "2EC1", "864E"],
  ["2EC2", "2EC2", "8864"], ["2EC3", "2EC3", "8980"], ["2EC4", "2EC4", "897F"], ["2EC5", "2EC5", "89C1"],
  ["2EC6", "2EC6", "89D2"], ["2EC7", "2EC7", "278B2"], ["2EC8", "2EC8", "8BA0"], ["2EC9", "2EC9", "8D1D"],
  ["2ECA", "2ECA", "27FB7"], ["2ECB", "2ECB", "8F66"], ["2ECC", "2ECE", "8FB6"], ["2ECF", "2ECF", "9091"],
  ["2ED0", "2ED0", "9485"], ["2ED1", "2ED1", "9577"], ["2ED2", "2ED2", "9578"], ["2ED3", "2ED3", "957F"],
  ["2ED4", "2ED4", "95E8"], ["2ED5", "2ED5", "28E0F"], ["2ED6", "2ED6", "961D"], ["2ED7", "2ED7", "96E8"],
  ["2ED8", "2ED8", "9752"], ["2ED9", "2ED9", "97E6"], ["2EDA", "2EDA", "9875"], ["2EDB", "2EDB", "98CE"],
  ["2EDC", "2EDC", "98DE"], ["2EDD", "2EDD", "98DF"], ["2EDE", "2EDE", "2967F"], ["2EDF", "2EDF", "98E0"],
  ["2EE0", "2EE0", "9963"], ["2EE1", "2EE1", "29810"], ["2EE2", "2EE2", "9A6C"], ["2EE3", "2EE3", "9AA8"],
  ["2EE4", "2EE4", "9B3C"], ["2EE5", "2EE5", "9C7C"], ["2EE6", "2EE6", "9E1F"], ["2EE7", "2EE7", "5364"],
  ["2EE8", "2EE8", "9EA6"], ["2EE9", "2EE9", "9EC4"], ["2EEA", "2EEA", "9EFE"], ["2EEB", "2EEB", "6589"],
  ["2EEC", "2EEC", "9F50"], ["2EED", "2EED", "6B6F"], ["2EEE", "2EEE", "9F7F"], ["2EEF", "2EEF", "7ADC"],
  ["2EF0", "2EF0", "9F99"], ["2EF1", "2EF1", "9F9C"], ["2EF2", "2EF2", "4E80"], ["2EF3", "2EF3", "9F9F"],
];

const CJK_RADICAL_TO_UNIFIED = new Map();
for (const [from, to, unified] of CJK_RADICAL_SUPPLEMENT_RANGES) {
  for (let cp = parseInt(from, 16); cp <= parseInt(to, 16); cp++) {
    CJK_RADICAL_TO_UNIFIED.set(String.fromCodePoint(cp), String.fromCodePoint(parseInt(unified, 16)));
  }
}

// CJK 互換漢字（旧字体・異体字を別の文字コードで持つもの。例: U+FA19「神」の旧字体）
const CJK_COMPAT_IDEOGRAPH = /[豈-﫿\u{2F800}-\u{2FA1F}]/u;
const NOT_CJK_COMPAT_RUN = /[^豈-﫿\u{2F800}-\u{2FA1F}]+/gu;

/**
 * 判定用にテキストを正規化する。
 * @param {string} text
 * @param {{keepCompat?: boolean}} [options] keepCompat: true なら互換漢字（旧字体など）を
 *   通常の字へ寄せずに残す。旧字体を「常用漢字と同じ」とみなしたくない場合に使う。
 * @returns {string}
 */
function normalizeKanjiText(text, options = {}) {
  const mapped = text.replace(/[⺀-⻳]/g, (ch) => CJK_RADICAL_TO_UNIFIED.get(ch) || ch);
  if (!options.keepCompat) return mapped.normalize("NFKC");
  return mapped.replace(NOT_CJK_COMPAT_RUN, (run) => run.normalize("NFKC"));
}

/**
 * 互換漢字なら、対応する通常の字を返す（例: 旧字体の「神」U+FA19 → 「神」U+795E）。
 * 互換漢字でない、または対応する字がない場合は null。
 * @param {string} char
 * @returns {string|null}
 */
function compatIdeographBase(char) {
  if (!CJK_COMPAT_IDEOGRAPH.test(char)) return null;
  const base = char.normalize("NFKC");
  return base !== char ? base : null;
}
