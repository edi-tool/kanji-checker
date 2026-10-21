# kanji-checker

PDF・Word 内の漢字が常用漢字かを判定し、表外字（常用漢字外）を指摘するブラウザツール。解析はすべてブラウザ内（クライアントサイド）で実行。
公開URL: https://edi-tool.github.io/kanji-checker/ （GitHub Pages）
共通方針は [edi-tool 開発原則](https://github.com/edi-tool/.github/blob/main/PRINCIPLES.md)。`CLAUDE.md` はこのファイルを取り込むだけなので、エージェント共通の規則はここに書く。

## 実行コマンド

- プレビュー: `python -m http.server 8000`
- 整形: `npx prettier --write .`
- テスト: `npm test`（Node.js 22 以上、依存なし）
- HTML 静的チェック: `npm run check`

## 守ること

- 極限の軽量化・高速化。JSライブラリは原則不使用（例外: PDF.js / Mammoth.js によるテキスト抽出）、ブラウザ標準機能優先。
- ファイルを外部送信しない。送信は「誤検知を報告」の 1 か所だけ（テストで固定）。増やす場合は README「データの扱い」を更新する。
- 判定データ（`kanji_data.js` / `jinmei-kanji-data.js`）は文化庁「常用漢字表（平成22年内閣告示）」計2,136字と、戸籍法施行規則 別表第二の人名用漢字 864字（2026年6月「勒」追加）に基づく。変えたら出典と照合し、テストの字数と README を同時に更新する。
- `kanji-normalize.js`（部首用文字コードの置き換え）は edu-kanji-checker と同じ内容。片方を直したらもう片方へもコピーする。
- PDF.js のバージョンは `index.html` 内の 3 か所（import・worker・`PDFJS_CMAP_URL`）と README をそろえる。
- `scripts/check-static.mjs` と `tests/helpers.js` は edi-tool/.github の templates からのコピー。直すときは原本も直す。
- 軽微な修正での push 禁止。ローカルサーバーで検証し、複数修正を1コミットに集約する（GitHub Actions 節約）。
- セッション終了時に `progress.md` を更新。
