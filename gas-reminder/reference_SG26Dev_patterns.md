# SG26Dev から学ぶ GAS設計パターン

白井先生が作った書籍進行管理API（SG26Dev）の設計パターンメモ。
自分のプロジェクトで再利用できる部分を抜粋。

## 1. WebAPI パターン（doGet）

GASをWebAPIとして公開し、パラメータで機能を切り替える。

```javascript
function doGet(e) {
  const action = e.parameter.action || 'progress';
  try {
    let result;
    switch (action) {
      case 'progress': result = getProgress(); break;
      case 'chapters': result = getChapterProgress(); break;
      default: result = { error: 'Unknown action' };
    }
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

function jsonResponse(data, status = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data, null, 2));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
```

**使い所:** スプレッドシートのデータを外部ダッシュボード（Vercel等）から参照したいとき。

## 2. 設定シート パターン（Settings）

設定値をコードにハードコードせず、Settingsシートで管理。

```javascript
const DEFAULT_SETTINGS = {
  DAIWARI_SHEET_NAME: 'SG26',
  TEMPLATE_DOC_ID: 'xxx',
  OUTPUT_FOLDER_ID: 'xxx',
  ASSIGNEE_EMAIL: 'aki@aicu.ai'
};

function getSettings() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Settings');
  if (!sheet) return DEFAULT_SETTINGS;

  const data = sheet.getDataRange().getValues();
  const settings = { ...DEFAULT_SETTINGS };
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    const value = String(data[i][1]).trim();
    if (key && value) settings[key] = value;
  }
  return settings;
}
```

**使い所:** メールアドレス・フォルダID・シート名など、環境ごとに変わる値を管理。

## 3. シート→JSON変換 パターン

ヘッダー行をキーにして、シートデータをJSONに変換。

```javascript
function sheetToJson(sheet) {
  const data = sheet.getDataRange().getValues();
  const HEADER_ROW = 4; // 5行目がヘッダー（0-indexed）
  const headers = data[HEADER_ROW];
  const rows = data.slice(HEADER_ROW + 1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      if (header) obj[normalizeHeader(header)] = row[i];
    });
    return obj;
  }).filter(row => row.chapter || row.section);
}
```

**使い所:** スプレッドシートのデータをプログラムで扱いやすくしたいとき。

## 4. ヘッダー正規化 パターン

日本語ヘッダーを英語キーにマッピング。

```javascript
function normalizeHeader(header) {
  const mapping = {
    'ページ': 'page',
    '章': 'chapter',
    'ステータス': 'status',
    '制作担当者': 'author',
    // ...
  };
  return mapping[header] || header;
}
```

**使い所:** 日本語シートをAPIで返すとき、英語キーの方が扱いやすい。

## 5. ステータス判定 パターン

表記揺れに対応したステータス判定。

```javascript
const STATUS = {
  DONE: ['完了', 'done', '済', '○', '◎'],
  WRITING: ['執筆中', 'writing', '進行中', '著者原稿執筆中'],
  REVIEW: ['レビュー中', 'review', '編集チェック待ち', '編集チェック中'],
  PENDING: ['未着手', 'pending', '開始前', '']
};

function isStatus(status, statusList) {
  const normalized = String(status).trim().toLowerCase();
  return statusList.some(s => normalized === s.toLowerCase());
}
```

**使い所:** 人が手入力するシートでは表記揺れが必ず起きる。配列で複数パターンを許容する。

## 6. テンプレートからドキュメント自動生成 パターン

```javascript
function createDraftDocument(chapter, section, title) {
  const settings = getSettings();
  const templateFile = DriveApp.getFileById(settings.TEMPLATE_DOC_ID);
  const folder = DriveApp.getFolderById(settings.OUTPUT_FOLDER_ID);
  const fileName = `[SG26]${chapter}-${section}${title}`;
  const newFile = templateFile.makeCopy(fileName, folder);
  return newFile;
}

function assignDocument(file, email) {
  file.addEditor(email);
}
```

**使い所:** 定型フォーマットの文書を大量に作るとき。命名規則も統一できる。

## 7. Drive API でコメント取得 パターン

```javascript
function fetchCommentsFromDriveAPI(fileId, resolvedFilter) {
  let pageToken = null;
  const comments = [];
  do {
    const response = Drive.Comments.list(fileId, {
      maxResults: 100,
      pageToken: pageToken,
      fields: 'items(commentId,content,status,author,createdDate,context,replies),nextPageToken'
    });
    // ... 処理
    pageToken = response.nextPageToken;
  } while (pageToken);
  return comments;
}
```

**前提:** GASエディタ → サービス → Drive API を追加が必要。
**使い所:** Google Docsのコメントを一括取得してレポートにしたいとき。

## 8. Docs API で提案（Suggestions）取得 パターン

```javascript
const doc = Docs.Documents.get(fileId, {
  suggestionsViewMode: 'SUGGESTIONS_INLINE'
});
// doc.body.content を走査して suggestedInsertionIds / suggestedDeletionIds を抽出
```

**前提:** GASエディタ → サービス → Google Docs API を追加が必要。
**使い所:** 提案モードの修正を一括確認したいとき。

## 9. ファイル構成（モジュール分割）

```
Code.gs          - メインAPI（doGet、ルーティング）
Comments.gs      - コメント取得モジュール
Suggestions.gs   - 提案取得モジュール
Daiwari.gs       - 台割データ管理（進捗計算）
Document.gs      - 原稿ドキュメント自動生成
Menu.gs          - スプレッドシートのカスタムメニュー
Settings.gs      - 設定管理
Setup.gs         - 初期セットアップ
```

**使い所:** GASが大きくなったら機能ごとにファイル分割。見通しが良くなる。

---

## 自分のプロジェクトで使えそうなもの

- [ ] WebAPI パターン → ハナサクの予約管理をAPI化？
- [ ] 設定シート → AICUリマインダーの設定を外出し
- [ ] シート→JSON → 任意のスプレッドシートをダッシュボード化
- [ ] ステータス判定 → 表記揺れ対応
- [ ] テンプレート自動生成 → 記事テンプレートの自動作成
