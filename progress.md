# 進捗: 常用漢字さん（kanji-checker）

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

## 関連

- 組織ハブ: https://edi-tool.github.io/ （`edi-tool/edi-tool.github.io` リポジトリ）
