# kanji-checker

PDF・Word 内の表外漢字（常用漢字外）を検出するブラウザツール。公開URL: https://edi-tool.github.io/kanji-checker/
詳しい方針は CLAUDE.md、共通方針は [edi-tool 開発原則](https://github.com/edi-tool/.github/blob/main/PRINCIPLES.md)。

## 実行コマンド

- プレビュー: `python -m http.server 8000`
- テスト: `npm test`（Node.js 22 以上、依存なし）
- HTML 静的チェック: `npm run check`

## 守ること

- ファイルを外部送信しない。送信は「誤検知を報告」の 1 か所だけ（テストで固定）。増やす場合は README「データの扱い」を更新する。
- `kanji_data.js` / `jinmei-kanji-data.js` を変えたら、出典と照合し、テストの字数と README を同時に更新する。
- `scripts/check-static.mjs` と `tests/helpers.js` は edi-tool/.github の templates からのコピー。直すときは原本も直す。
- 軽微な修正での push 禁止。複数修正をまとめてから push する。
