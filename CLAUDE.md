# kanji-checker

PDF・Word 内の漢字が常用漢字かを判定し、表外字を指摘するツール。解析はすべてブラウザ内（クライアントサイド）で実行。
公開URL: https://edi-tool.github.io/kanji-checker/ （GitHub Pages）

## 実行コマンド

- プレビュー: `python -m http.server 8000`
- 整形: `npx prettier --write .`
- テスト: `npm test` / HTML 静的チェック: `npm run check`

## プロジェクト方針

- 極限の軽量化・高速化。JSライブラリは原則不使用（例外: PDF.js / Mammoth.js によるテキスト抽出）、ブラウザ標準機能優先。
- 判定データ（`kanji_data.js` / `jinmei-kanji-data.js`）は文化庁「常用漢字表（平成22年内閣告示）」計2,136字と、戸籍法施行規則 別表第二の人名用漢字 864字（2026年6月「勒」追加）に基づく。改変時は出典との整合を必ず確認。
- `kanji-normalize.js`（部首用文字コードの置き換え）は edu-kanji-checker と同じ内容。片方を直したらもう片方へもコピーする。
- PDF.js のバージョンは `index.html` 内の 3 か所（import・worker・`PDFJS_CMAP_URL`）と README をそろえる。
- ファイルを外部送信しない設計を崩さない。
- 軽微な修正での push 禁止。ローカルサーバーで検証し、複数修正を1コミットに集約（GitHub Actions 節約）。
- セッション終了時に `progress.md` を更新。
