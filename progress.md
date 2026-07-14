# 進捗: 常用漢字さん（kanji-checker）

## 2026-07-14 セッション

- **修正**: `<title>` 末尾の余分な「 | 」を削除。
- **デザイン統一**: `:root` に共通デザイントークンを導入し色を変数化。
  無効だった `noto-sans` 先頭のフォント指定を実効スタックへ。ファイル入力ホバーに淡橙背景を追加、
  文脈表示の等幅フォントを本文フォントへ。`:focus-visible`・`prefers-reduced-motion`・`theme-color` 追加。
- **SEO**: `og:image`（favicon）と `twitter:card` を追加（canonical/OGP/JSON-LD/sitemapは既存）。

## 関連

- 組織ハブ: https://edi-tool.github.io/ （`edi-tool/edi-tool.github.io` リポジトリ）
