# kanji-checker

PDF・Word 内の漢字が常用漢字かを判定し、表外字を指摘するツール。解析はすべてブラウザ内（クライアントサイド）で実行。
公開URL: https://edi-tool.github.io/kanji-checker/ （GitHub Pages）

## 実行コマンド

- プレビュー: `python -m http.server 8000`
- 整形: `npx prettier --write .`

## プロジェクト方針

- 極限の軽量化・高速化。JSライブラリは原則不使用（例外: PDF.js / Mammoth.js によるテキスト抽出）、ブラウザ標準機能優先。
- 判定データ（`kanji_data.js` / `jinmei-kanji-data.js`）は文化庁「常用漢字表（平成22年内閣告示）」計2,136字に基づく。改変時は出典との整合を必ず確認。
- ファイルを外部送信しない設計を崩さない。
- 軽微な修正での push 禁止。ローカルサーバーで検証し、複数修正を1コミットに集約（GitHub Actions 節約）。
- セッション終了時に `progress.md` を更新。
