const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, load } = require('./helpers');

// 判定結果を renderResults の代わりに受け取る
function analyzer() {
  const out = {};
  const errorMsg = { textContent: '' };
  const api = load({
    files: ['kanji-normalize.js', 'kanji_data.js', 'jinmei-kanji-data.js'],
    functions: ['analyzeKanji', 'escapeHTML'],
    exports: ['joyoKanji', 'joyoKanjiTableForms', 'houseRules', 'JINMEI_KANJI_LIST', 'isJinmeiyoKanji', 'CJK_RADICAL_TO_UNIFIED', 'normalizeKanjiText'],
    globals: {
      renderResults: (r) => { out.results = r; },
      document: { getElementById: () => errorMsg },
    },
  });
  return { ...api, run: (text) => { api.analyzeKanji(text); return out.results; } };
}

test('常用漢字データは README の記載どおり 2,136 字で重複がない', () => {
  const { joyoKanji } = analyzer();
  const chars = Array.from(joyoKanji);
  assert.equal(chars.length, 2136);
  assert.equal(new Set(chars).size, 2136);
  assert.ok(chars.every((c) => /\p{Script=Han}/u.test(c)), '漢字以外の文字が含まれている');
});

test('人名用漢字データは 864 字（2026 年 6 月追加の「勒」を含む）で、互換漢字 57 字以外は常用漢字と重複しない', () => {
  const { JINMEI_KANJI_LIST, joyoKanji } = analyzer();
  assert.equal(JINMEI_KANJI_LIST.length, 864);
  assert.ok(JINMEI_KANJI_LIST.includes('勒'));
  const compat = JINMEI_KANJI_LIST.filter((c) => c.normalize('NFC') !== c);
  assert.equal(compat.length, 57, '互換漢字が正規化で失われていないか');
  const overlap = JINMEI_KANJI_LIST.filter((c) => c.normalize('NFC') === c && joyoKanji.includes(c));
  assert.equal(overlap.join(''), '');
});

test('常用漢字は検出せず、表外字だけを文脈つきで検出する', () => {
  const { run } = analyzer();
  const r = run('日本の学校で薔薇を育てる');
  assert.equal(Object.keys(r).sort().join(''), ['薇', '薔'].sort().join(''));
  assert.equal(r['薔'].count, 1);
  assert.ok([...r['薔'].contexts][0].includes('学校で薔薇を'));
});

test('踊り字「々」「〻」と漢数字のゼロ「〇」は表外字として検出しない', () => {
  const { run } = analyzer();
  assert.deepEqual(Object.keys(run('山々と人々、二〇二六年の薔薇〻')), ['薔', '薇']);
});

test('前後 15 文字を文脈として切り出す', () => {
  const { run } = analyzer();
  const pad = 'あ'.repeat(20);
  const ctx = [...run(`${pad}薔${pad}`)['薔'].contexts][0];
  assert.equal(ctx.length, 31);
});

test('人名用漢字には isJinmei が付く', () => {
  const { run } = analyzer();
  const r = run('丑年と薔薇');
  assert.equal(r['丑'].isJinmei, true);
  assert.equal(r['薔'].isJinmei, false);
});

test('常用漢字表の字体（塡・剝・頰・𠮟）も、機器で使われる字体（填・剥・頬・叱）も常用漢字として扱う', () => {
  const { run, joyoKanjiTableForms } = analyzer();
  assert.deepEqual(Array.from(joyoKanjiTableForms).map((c) => c.codePointAt(0).toString(16)), ['5861', '525d', '9830', '20b9f']);
  assert.equal(Object.keys(run('塡剝頰\u{20B9F}填剥頬叱')).length, 0);
});

test('PDF 由来の部首用文字コードは通常の漢字として判定する（表外字にしない）', () => {
  const { run, CJK_RADICAL_TO_UNIFIED } = analyzer();
  // U+2ED1 ⻑→長、U+2EA0 ⺠→民（CJK 部首補助）、U+2F00 ⼀→一（康熙部首）
  assert.equal(CJK_RADICAL_TO_UNIFIED.get('\u2ED1'), '長');
  assert.equal(CJK_RADICAL_TO_UNIFIED.get('\u2EA0'), '民');
  assert.equal(CJK_RADICAL_TO_UNIFIED.size, 114);
  assert.equal(Object.keys(run('\u2ED1\u2EA0\u2F00\u2ED8\u2EC4\u2EDD')).length, 0);
  // 対応先が常用漢字でない部首（⻤→鬼 は常用、⺾→艹 は表外）は対応先の字で指摘する
  assert.deepEqual(Object.keys(run('\u2EBE')), ['艹']);
});

test('常用漢字の旧字体（互換漢字）は見逃さず、対応する常用漢字つきで指摘する', () => {
  const { run } = analyzer();
  const r = run('\u{FA19}社と神社'); // U+FA19 は「神」の旧字体
  assert.deepEqual(Object.keys(r), ['\u{FA19}']);
  assert.equal(r['\u{FA19}'].variantOf, '神');
  assert.equal(r['\u{FA19}'].isJinmei, true);
  assert.equal(r['\u{FA19}'].count, 1);
  // 互換漢字でない表外字には付かない
  assert.equal(run('薔')['薔'].variantOf, null);
});

test('全角英数や合字は正規化しても、漢字の判定結果は変わらない', () => {
  const { run } = analyzer();
  assert.equal(Object.keys(run('ＡＢＣ１２３㈱')).length, 0);
});

test('ハウスルールに登録した文字は検出しない', () => {
  const { houseRules } = analyzer();
  assert.equal(typeof houseRules, 'string');
  const html = read('kanji_data.js');
  assert.match(html, /new Set\(joyoKanji \+ joyoKanjiTableForms \+ houseRules\)/);
});

test('漢字が 1 つもない文章では 0 件になる', () => {
  const { run } = analyzer();
  assert.equal(Object.keys(run('ひらがなとカタカナだけ')).length, 0);
});

test('escapeHTML は HTML の特殊文字を無害化する', () => {
  const { escapeHTML } = analyzer();
  assert.equal(escapeHTML(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('外部送信は誤検知報告（reportKanji）の 1 か所だけで、確認ダイアログを経由する', () => {
  const html = read('index.html');
  const fetches = [...html.matchAll(/\bfetch\(/g)];
  assert.equal(fetches.length, 1, 'fetch の呼び出しが増えている。README「データの扱い」を更新すること');
  const reportStart = html.indexOf('function reportKanji');
  assert.ok(fetches[0].index > reportStart);
  assert.ok(html.slice(reportStart, fetches[0].index).includes('window.confirm'));
  assert.doesNotMatch(html, /sendBeacon|XMLHttpRequest|WebSocket/);
});

// Word から文字を 1 字も取り出せなかった場合（画像だけの文書など）
async function handleEmpty(extra = {}) {
  const els = { errorMsg: { textContent: '' }, resultArea: { innerHTML: '' } };
  let analyzed = false;
  const api = load({
    functions: ['handleFile'],
    globals: {
      document: { getElementById: (id) => els[id] },
      mammoth: { extractRawText: async () => ({ value: '  \n' }) },
      analyzeKanji: () => { analyzed = true; },
      console,
      ...extra,
    },
  });
  await api.handleFile({ name: 'a.docx', type: '', arrayBuffer: async () => new ArrayBuffer(0) });
  return { els, analyzed };
}

test('文字を取り出せなかったときは「該当なし」と表示せず、読み取り失敗として知らせる', async () => {
  const { els, analyzed } = await handleEmpty();
  assert.equal(analyzed, false);
  assert.match(els.errorMsg.textContent, /テキストを取り出せませんでした/);
  assert.doesNotMatch(els.resultArea.innerHTML, /見つかりませんでした/);
});
