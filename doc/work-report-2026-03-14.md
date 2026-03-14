# 作業報告書

## 日付
2026年3月14日

## 概要
lit.linkの更新内容をGitHub Pagesサイトに反映し、デザインをリニューアルした。

## 公開URL
https://mai-san447.github.io/

---

## 作業内容

### 1. lit.link同期（コンテンツ更新）

https://lit.link/morune の内容を確認し、新規リンク2件を追加。

| 追加項目 | URL | カテゴリ |
|---------|-----|---------|
| DHGS研究ノート | https://msl.dhw.ac.jp/wp-content/uploads/2025/12/DHUITNJOURNAL2025_P018.pdf | Research |
| SoraJam Tokyo受賞「TM2S」 | https://note.com/aicu/n/n96c0512032bf | Award |

追加箇所:
- Worksセクション（grid-card）
- Linksセクション（link-card）

### 2. デザインリニューアル（v6→v7）

ユーザーフィードバック「デザインがAIっぽい」を受け、2段階で改修。

#### v6→v7a（シンプル化）
- Playfair Display（セリフ体）を削除、Noto Sans JPのみに統一
- パララックス・スクロールアニメーション削除
- mix-blend-modeトップバー → 通常のstickyヘッダーに変更
- ベージュ配色 → 白+グレーに変更
- ダーク背景のLinksセクション → 白背景に変更

#### v7a→v7b（情報量追加）
ユーザーフィードバック「シンプルすぎる。アイコンがわかるようになっているといい」を受け改修。

- Worksの小カードにSVGアイコン+色つき背景を追加（ショッピングバッグ、音符、画像、論文、星）
- Linksの各項目にサービス別SVGアイコン+ブランドカラー背景を追加
  - Instagram: グラデーション背景
  - SoundCloud: オレンジ背景
  - X: 黒背景
  - note: 緑背景
  - 技術書典: 青背景
  - 研究ノート: 紫背景
  - SoraJam: 黄背景
- Profileセクションに薄グレー背景を追加
- Heroに薄グレー背景+画像にbox-shadowを追加
- 書籍カードにタグバッジ（背景付きラベル）を追加

### 3. 参考サイト
- https://www.yamacs.co.jp/ （クリーンな日本の企業サイトの方向性として参照）

---

## デザイン変遷（v6→v7）

| 段階 | 変更内容 | フィードバック |
|------|---------|-------------|
| v6 | エディトリアル・雑誌風 | AIっぽい |
| v7a | 白ベース・シンプル | シンプルすぎる |
| **v7b（現行）** | **白ベース+SVGアイコン+ブランドカラー** | **採用** |

## コミット

| ハッシュ | 内容 |
|---------|------|
| 1cf4571 | Redesign site: clean layout with SVG icons and lit.link sync |

## 技術的な変更点

| 項目 | 変更前（v6） | 変更後（v7） |
|------|------------|------------|
| フォント | Playfair Display + Noto Sans JP | Noto Sans JPのみ |
| アイコン | Unicode絵文字 | インラインSVG |
| アニメーション | IntersectionObserver + パララックス | hoverのみ |
| ナビバー | mix-blend-mode: difference | 通常のstickyヘッダー |
| 配色 | オフホワイト+テラコッタ+ダーク | 白+グレー+各ブランドカラー |
| Linksセクション | ダーク背景+3カラムグリッド | 白背景+2カラム+アイコンカード |
| JS行数 | 約20行 | 約3行 |

---

## 残課題・今後の検討事項
- [ ] お問い合わせ先を専用フォーム（Google Forms等）に変更するか検討
- [ ] MORUNE公式ストアの実際の商品画像をWorksカードに反映
- [ ] ファビコン設定
- [ ] Google Analytics等のアクセス解析導入
