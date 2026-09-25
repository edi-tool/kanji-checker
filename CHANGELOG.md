# Changelog

このプロジェクトの主な変更を記録します。形式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/)、
バージョンは [Semantic Versioning](https://semver.org/lang/ja/) に従います。
1.x 以前の履歴は、この CHANGELOG を作成した時点で Git の履歴からまとめ直したものです。

## [Unreleased]

## [1.4.0] - 2026-09-25

### Added

- テスト（`npm test`）と HTML 静的チェック（`npm run check`）、GitHub Actions の CI
- README に「データの扱い」（誤検知報告で送信される内容）・制限事項・関連ツールを追記

### Changed

- 開発用ファイル（CLAUDE.md・progress.md・tests など）を GitHub Pages の公開ビルドから除外

### Fixed

- ファイルから文字を取り出せなかったとき（画像化された PDF など）、「見つかりませんでした」と表示せず、読み取り失敗として知らせるように修正
- 人名用漢字データを出典どおり 863 字に修正（旧字体 57 字が保存時の Unicode 正規化で常用字形に置き換わり、858 字になっていた）。判定前に NFKC 正規化するため、表外字の検出結果は変わらない

## [1.3.0] - 2026-09-25

### Changed

- SEO：タイトルをキーワード先頭に、説明文と構造化データを拡充、og:site_name を追加
- スクリプトを defer で読み込み、表示を高速化

## [1.2.0] - 2026-09-24

### Added

- ドロップゾーン（クリック・ドラッグ＆ドロップ・キーボード操作）
- 集計表示、文脈の折りたたみ、PDF 解析の進行表示
- 結果の印刷、共有用 OGP 画像

## [1.1.1] - 2026-07-15

### Security

- PDF.js を脆弱性修正版へ更新

## [1.1.0] - 2026-04-16

### Added

- 人名用漢字の判別
- 誤検知の報告ボタン（Google Apps Script 経由でスプレッドシートに記録）
- ハウスルール（`houseRules`）による許容文字の追加

## [1.0.0] - 2026-04-14

- 初回公開：PDF・Word 内の表外漢字を前後の文脈つきで表示
