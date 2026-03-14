# EMKO / Morune - プロフィールサイト

## 公開URL
https://mai-san447.github.io/

## リポジトリ
https://github.com/mai-san447/mai-san447.github.io

## サイト構成

```
maisan-447.github.io/
├── index.html          ... メインページ（単一ファイル構成）
├── README.md           ... このファイル
└── doc/
    ├── setup-log.md    ... 環境セットアップ記録
    ├── work-report-2026-03-06.md  ... 初回構築の作業報告
    └── work-report-2026-03-14.md  ... lit.link同期・リデザインの作業報告
```

## 技術仕様

| 項目 | 内容 |
|------|------|
| ホスティング | GitHub Pages（mainブランチ直下） |
| 構成 | HTML + CSS + JS（単一ファイル） |
| フォント | Noto Sans JP（Google Fonts） |
| アイコン | インラインSVG（外部依存なし） |
| レスポンシブ | 対応（768px / 480pxブレイクポイント） |
| OGP | 設定済み |

## セクション構成

| セクション | 内容 |
|-----------|------|
| Header | ロゴ + ナビゲーション（sticky） |
| Hero | キャッチコピー + 書籍カバー画像 |
| Works | 書籍2点（画像カード）+ストア・SoundCloud・Instagram・研究・受賞（アイコン付きカード） |
| Profile | アバター + 経歴 + 専門タグ |
| Links | 各プラットフォームへのリンク（SVGアイコン+ブランドカラー） |
| Contact | Instagram DM / X への導線 |

## デザイン仕様（v7 現行）

- **スタイル**: クリーン・コーポレート風（白ベース、ボーダー区切り、余白重視）
- **フォント**: Noto Sans JPのみ（400/500/700）
- **配色**: 白背景 + #333テキスト + #e0e0e0ボーダー + 各サービスのブランドカラー（アイコン背景）
- **アニメーション**: なし（シンプルなhoverのみ）
- **レスポンシブ**: モバイル対応（ハンバーガーメニュー、1カラムフォールバック）

## 更新手順

### コンテンツ更新（テキスト・リンク修正）

```bash
# 1. ローカルで index.html を編集
# 2. ブラウザで確認（ダブルクリックで開く）
# 3. コミット＆プッシュ
cd "C:\Users\mn547\OneDrive\ドキュメント\GitHub\maisan-447.github.io"
git add index.html
git commit -m "Update: 変更内容を記載"
git push
# 4. 数分で https://mai-san447.github.io/ に反映
```

### lit.linkとの同期

1. https://lit.link/morune の内容を確認
2. 新しいリンクがあれば index.html の以下2箇所に追加:
   - **Worksセクション**: `works-grid` 内に `grid-card` を追加
   - **Linksセクション**: `links-grid` 内に `link-card` を追加
3. 削除されたリンクがあれば該当箇所を削除

### リンクカード追加テンプレート（Works）

```html
<a href="【URL】" target="_blank" rel="noopener" class="grid-card">
    <div class="grid-card-icon 【色クラス】">
        <!-- SVGアイコンをここに -->
    </div>
    <div class="grid-card-text">
        <div class="grid-card-tag">【カテゴリ】</div>
        <div class="grid-card-title">【タイトル】</div>
        <div class="grid-card-desc">【説明】</div>
    </div>
</a>
```

アイコン色クラス: `ico-shop`（緑）/ `ico-music`（橙）/ `ico-gallery`（ピンク）/ `ico-research`（青）/ `ico-award`（黄）

### リンクカード追加テンプレート（Links）

```html
<a href="【URL】" target="_blank" rel="noopener" class="link-card">
    <div class="link-card-icon 【色クラス】">
        <!-- SVGアイコンをここに -->
    </div>
    <span class="link-card-name">【表示名】</span>
    <span class="link-card-arrow">&rarr;</span>
</a>
```

## デザイン変遷

| バージョン | デザイン | 備考 |
|-----------|---------|------|
| v1 | シンプルHTML | 初期 |
| v2 | lit.linkベースのリンクツリー風 | シンプルすぎる |
| v3 | ベージュ背景 + Worksカード | — |
| v4 | ダーク + Bento Grid | 地味 |
| v5 | ホワイト × カラフル・ポップ | AIっぽい |
| v6 | エディトリアル・雑誌風 | AIっぽい |
| **v7（現行）** | **クリーン + SVGアイコン** | **採用** |

## 情報ソース

| ソース | URL | 用途 |
|--------|-----|------|
| lit.link | https://lit.link/morune | リンク一覧・プロフィール文 |
| note | https://note.com/mizuhana_aoi | 記事・プロフィール画像 |
| 技術書典 | https://techbookfest.org/product/6T2GqQjWR3yTbEMGCv24tX | 書籍情報・表紙画像 |
| MORUNE Store | https://morune.store | 商品情報 |
