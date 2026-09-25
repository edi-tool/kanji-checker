const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, load } = require('./helpers');

// 判定結果を renderResults の代わりに受け取る
function analyzer() {
  const out = {};
  const errorMsg = { textContent: '' };
  const api = load({
    files: ['kanji_data.js', 'jinmei-kanji-data.js'],
    functions: ['analyzeKanji', 'escapeHTML'],
    exports: ['joyoKanji', 'houseRules', 'JINMEI_KANJI_LIST', 'isJinmeiyoKanji'],
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

// 注意: jinmei-kanji-data.js の注記と法務省の告示は 863 字だが、現在のデータは 858 字（2026-09-25 時点）。
// 旧字体（逸・海・社 など互換漢字 50 字余り）が常用漢字の字形に正規化されて重複・消失しているとみられる。
// 出典と照合して直すまでは、意図しない増減を検出するため現状の字数を固定する。
test('人名用漢字データの字数が変わっていない（現状 858 字・出典は 863 字）', () => {
  const { JINMEI_KANJI_LIST } = analyzer();
  assert.equal(JINMEI_KANJI_LIST.length, 858);
});

test('常用漢字は検出せず、表外字だけを文脈つきで検出する', () => {
  const { run } = analyzer();
  const r = run('日本の学校で薔薇を育てる');
  assert.equal(Object.keys(r).sort().join(''), ['薇', '薔'].sort().join(''));
  assert.equal(r['薔'].count, 1);
  assert.ok([...r['薔'].contexts][0].includes('学校で薔薇を'));
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

test('ハウスルールの文字は検出しない', () => {
  const { run, houseRules } = analyzer();
  assert.ok(houseRules.length > 0);
  assert.equal(Object.keys(run(houseRules)).length, 0);
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
