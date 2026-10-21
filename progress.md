# 進捗: 常用漢字さん（kanji-checker）

## 2026-10-21 セッション（エージェント向け規則の一本化）

- `CLAUDE.md` と `AGENTS.md` に規則が別々に書かれ、内容がずれていた（Claude Code は `CLAUDE.md` があると `AGENTS.md` を自動では読まず、Codex は `CLAUDE.md` を読まない）。両方の規則を `AGENTS.md` に統合し、`CLAUDE.md` は `@AGENTS.md` の取り込みだけにした。
- org 共通の取り決めと検査は edi-tool/.github#1（`PRINCIPLES.md`・`templates/CLAUDE.template.md`・`tools/check-template-sync.mjs`）。

## 2026-10-13 セッション（判定精度の見直し）

先行データ・ツールの状況を確認して反映した（pdfjs-dist 6.4.299 / mammoth 1.13.0 が最新。textlint-rule-ja-joyo-or-jinmeiyo-kanji は 2022 年から更新なし）。

- **人名用漢字 863 → 864 字**: 2026-06-26 の戸籍法施行規則改正（令和8年法務省令第43号）で「勒」が追加されていた（2017 年の「渾」以来）。`jinmei-kanji-data.js` の末尾に追記。
  出典リポジトリ（vaiorabbit/everyday_use_kanji）は 863 字のままなので、今後の追加は法務省の発表で確認する。
- **常用漢字表の字体 4 字**: データは機器で使われる「填・剥・頬・叱」で持っており、表の字体「塡・剝・頰・𠮟」を表外字として検出していた。`joyoKanjiTableForms` を追加し、どちらも常用漢字として扱う（2,136 字のリスト自体は変えていない）。
- **部首用文字コードの自動置き換え**: PDF 由来の CJK 部首補助（⻑ U+2ED1・⺠ U+2EA0 など）を、Unicode の EquivalentUnifiedIdeograph.txt（18.0.0）の 114 対応で通常の漢字へ置き換える（`kanji-normalize.js`。教育漢字さんと同じ内容）。
  これまで `houseRules` に「⻑⺠」を 1 字ずつ登録していた運用は不要になり、`houseRules` は空にした（仕組みは残してある）。
- **踊り字・漢数字ゼロを対象外に**: 「々」「〻」「〇」は Unicode 上 Script=Han のため表外字として出ていた（「山々」「二〇二六年」で必ず検出）。`kanji-normalize.js` に `isNonKanjiHanMark` を追加し、判定から外す（教育漢字さんと同じ内容）。Editorial-Workspace の機械チェック（`tools/editool_bridge.cjs`）がこのリポジトリのデータと関数をそのまま読むので、`kanji_data.js`・`jinmei-kanji-data.js`・`kanji-normalize.js` のファイル名と`JOYO_KANJI_SET`・`isJinmeiyoKanji`・`normalizeKanjiText`・`compatIdeographBase`・`isNonKanjiHanMark` の名前は変えない（変えるときはブリッジも直す）。未push。
- **旧字体（互換漢字）を見逃さない**: 以前は NFKC 正規化で U+FA19「神」の旧字体などが常用漢字と同一視され、指摘されなかった。互換漢字は正規化せずに残し、「常用漢字「神」の旧字体・異体字」の印を付ける。
  人名用漢字の互換漢字 57 字にも、ここで初めて「人名用漢字」の印が付くようになった。
- **PDF**: PDF.js を 6.1.200 → 6.4.299。`cMapUrl` を指定していなかったため、フォントを埋め込んでいない日本語 PDF は文字を取り出せず「スキャン PDF の可能性」と表示されていた（公開版で再現、修正後は読めることをブラウザで確認）。
- **入力**: 文章の貼り付けと .txt の読み込みに対応。
- 判定は `Set` で照合（`JOYO_KANJI_SET`・`JINMEI_KANJI_SET`）。テスト 14 件。

### 注意点

- PDF.js のバージョンは `index.html` の 3 か所（import・worker・`PDFJS_CMAP_URL`）と README をそろえる。
- 旧字体の指摘は、これまで出なかった指摘が増える変更。固有名詞で意図した旧字体かどうかは利用者が判断する。

## 2026-10-01 セッション（保守）

- mammoth を 1.12.0 → 1.13.0 に更新（変更履歴付き Word の「移動」段落の読み取り改善。呼び出しは `await` のみで Promise 実装変更の影響なし）。
- CDN スクリプトに SRI（`integrity` sha384 + `crossorigin="anonymous"`）を付与。未公開原稿を扱うため、CDN 側が改ざんされた場合にブラウザが読み込みを拒否する。
  ハッシュは jsDelivr の配信ファイルから算出し、メタデータ API の sha256 と一致を確認。誤ったハッシュで遮断されること、変更履歴（挿入）を含む docx の本文抽出もブラウザで確認済み。
- **CDN の版を上げるときは `integrity` も必ず更新する**（古いハッシュのままだと読み込みが拒否され、Word 読込が動かなくなる）。
- GitHub Actions を Node 24 対応の最新メジャー版へ更新（Node 20 は 2026-09-23 にランナーから撤去）。

## 2026-09-24 セッション（SEO）

- `og:site_name`（edi-tool）を追加
- Search Console 確認ファイルを jekyll-sitemap の出力から除外（`_config.yml` の defaults）
- `<head>` の mammoth・漢字データ読み込みを `defer` 化（描画ブロック解消）。preconnect を実際の CDN（cdn.jsdelivr.net）に修正
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
