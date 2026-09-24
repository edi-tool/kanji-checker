# 進捗: 常用漢字さん（kanji-checker）

## 2026-09-24 セッション（SEO）

- meta description を具体化（対応形式・判定基準・用途を明記）
- `<title>`・`og:title` をキーワード先頭（「{機能名} | {ツール名}」）に変更
- 構造化データを `@graph` 化: WebApplication に `url`・`operatingSystem`・`offers`（無料）・`isPartOf`/`publisher` を追加し、BreadcrumbList を追加

## 2026-07-14 セッション

- **修正**: `<title>` 末尾の余分な「 | 」を削除。
- **デザイン統一**: `:root` に共通デザイントークンを導入し色を変数化。
  無効だった `noto-sans` 先頭のフォント指定を実効スタックへ。ファイル入力ホバーに淡橙背景を追加、
  文脈表示の等幅フォントを本文フォントへ。`:focus-visible`・`prefers-reduced-motion`・`theme-color` 追加。
- **SEO**: `og:image`（favicon）と `twitter:card` を追加（canonical/OGP/JSON-LD/sitemapは既存）。

## 2026-09-24 セッション（UI/デザイン改善）

- ファイル選択をドロップゾーンに（クリック・ドラッグ＆ドロップ・キーボード）。処理は `handleFile(file)` に集約。
- 結果冒頭に集計（表外漢字の字数・人名用字数・出現回数）と「検出漢字をコピー」。漢字ごとに出現回数バッジ。
- 文脈は先頭5件のみ表示し、残りは `<details>` で折りたたみ。PDF はページ単位の進行状況を表示。
- 報告ボタンの絵文字を外し `type="button"`。`og:title` を `<title>` と同形式に。カードを上寄せに。判定ロジックは変更なし。
- **共通**: 見出しの上に「edi-tool」（ハブへのリンク）、フッターに「← edi-tool ツール一覧」を追加。`--text-sub` を #6b6b6b に濃くし、文字用アクセント `--accent-text: #b35f00` を追加（WCAG AA）。

## 2026-09-24 セッション（第2弾: 印刷・OGP・改行）

- **印刷**: 集計行に「印刷」ボタン。印刷時は入力欄・ボタン・フッターを隠し、折りたたんだ文脈も `beforeprint` で開いて全件出す（`afterprint` で戻す）。
- **OGP**: 共有カード用の `ogp.png`（1200×630、Noto Sans JP で生成）を追加し、`og:image` をファビコンから差し替え、`twitter:card` を `summary_large_image` に。
- **改行**: body の `word-break: break-all` を `normal` + `overflow-wrap: anywhere` に変更。和文は従来どおり1字単位で折り返し、英単語（License、Word 等）は途中で割らない。

## 関連

- 組織ハブ: https://edi-tool.github.io/ （`edi-tool/edi-tool.github.io` リポジトリ）
