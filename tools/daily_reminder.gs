/**
 * AICU 毎朝スケジュールリマインダー（Google Apps Script）
 *
 * 機能:
 * - 毎朝8:00にGmailで今日のタスク・直近スケジュールを通知
 * - スプレッドシートでタスク管理（追加・完了・期日変更）
 *
 * セットアップ:
 * 1. Google Spreadsheetを新規作成（または既存のものを使用）
 * 2. 拡張機能 → Apps Script → このコードを貼り付け
 * 3. setupReminder() を実行（シート作成 + トリガー設定）
 */

// ===== 設定 =====
const NOTIFY_EMAIL = 'maiko@aicu.ai';
const NOTIFY_HOUR = 8; // 通知時刻（時）

// ===== 初期セットアップ =====
function setupReminder() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ダッシュボードシート
  let dash = ss.getSheetByName('ダッシュボード');
  if (!dash) {
    dash = ss.insertSheet('ダッシュボード');
    dash.getRange('A1:F1').setValues([['期日', 'タスク', 'プロジェクト', '状態', '優先度', 'メモ']]);
    dash.getRange('A1:F1').setFontWeight('bold').setBackground('#E03E6B').setFontColor('#FFFFFF');

    // 初期データ投入
    const tasks = [
      // GENIAC
      ['2026-03-24', 'GENIAC-PRIZE取材（神田明神 12:00-19:40）', 'GENIAC', '📋 準備完了', '高', '名刺・スマホ充電・問い設計シート'],
      ['2026-03-24', 'GASメール送信ツール setupSheets実行', 'GENIAC', '⬜ 未実施', '高', '取材前に完了させる'],
      ['2026-03-24', '白井さんに確認：応募事実の掲載可否、特許出願数', 'GENIAC', '⬜ 未実施', '高', ''],
      ['2026-03-24', 'GENIAC お礼メール送信', 'GENIAC', '⬜ 取材後', '中', '取材当日夜'],
      // はるフェス
      ['2026-03-31', 'KamikAI原稿 先方承認取得', 'はるフェス', '⏳ チェック待ち', '中', ''],
      ['2026-03-31', 'Day3佐渡島記事4本 先方チェック', 'はるフェス', '⏳ チェック待ち', '中', '白井さん確認後に送付'],
      ['2026-03-31', 'note.comへの投稿準備', 'はるフェス', '⬜ 未着手', '中', ''],
      // Impress AI挑戦日記
      ['2026-03-24', '募集要項の最終版作成', 'Impress', '⬜ 未着手', '高', '募集開始目標日'],
      ['2026-03-24', '応募Googleフォーム作成', 'Impress', '⬜ 未着手', '高', '募集開始に必要'],
      ['2026-03-24', '学生募集開始（Cocona/CW投稿）', 'Impress', '⬜ 未着手', '高', '募集要項・フォーム完成後'],
      ['2026-03-31', '編集部へ企画書最終版送付', 'Impress', '⬜ 未着手', '中', 'MTG後の更新版'],
      ['2026-04-07', '契約締結', 'Impress', '⬜ 未着手', '中', ''],
      ['2026-04-07', '学生選考（書類・面談）', 'Impress', '⬜ 未着手', '中', '面談チェックシート使用'],
      ['2026-04-14', 'ライター決定・採用通知送付', 'Impress', '⬜ 未着手', '中', '採用通知テンプレート使用'],
      ['2026-04-21', 'キックオフ完了（学生への説明・ガイド配布）', 'Impress', '⬜ 未着手', '中', '執筆ガイド・週次フロー説明'],
      ['2026-04-30', '第1回記事公開', 'Impress', '⬜ 未着手', '低', ''],
      ['2026-05-21', '第4回記事公開（トライアル完了）', 'Impress', '⬜ 未着手', '低', ''],
      ['2026-05-26', '継続判断', 'Impress', '⬜ 未着手', '低', 'PV・エンゲージメント等で判断'],
    ];
    dash.getRange(2, 1, tasks.length, 6).setValues(tasks);

    // 列幅調整
    dash.setColumnWidth(1, 110);
    dash.setColumnWidth(2, 350);
    dash.setColumnWidth(3, 120);
    dash.setColumnWidth(4, 130);
    dash.setColumnWidth(5, 60);
    dash.setColumnWidth(6, 250);

    // 条件付き書式：期日が今日以前で未完了なら赤背景
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND(A2<=TODAY(), D2<>"✅ 完了")')
      .setBackground('#FFE0E0')
      .setRanges([dash.getRange('A2:F100')])
      .build();
    dash.setConditionalFormatRules([rule]);
  }

  // 毎日トリガー設定
  deleteTriggers_();
  ScriptApp.newTrigger('sendDailyReminder')
    .timeBased()
    .atHour(NOTIFY_HOUR)
    .everyDays(1)
    .create();

  SpreadsheetApp.getUi().alert(
    'セットアップ完了！\n\n' +
    '・「ダッシュボード」シートにタスクを入力\n' +
    '・毎朝' + NOTIFY_HOUR + '時にリマインドメールが届きます\n' +
    '・タスク完了時は状態を「✅ 完了」に変更\n\n' +
    '通知先: ' + NOTIFY_EMAIL
  );
}

// ===== 日次リマインドメール送信 =====
function sendDailyReminder() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('ダッシュボード');
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = Utilities.formatDate(today, 'Asia/Tokyo', 'yyyy-MM-dd');
  const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  let overdue = [];
  let todayTasks = [];
  let upcoming = [];
  let waiting = [];

  for (let i = 1; i < data.length; i++) {
    const [dateVal, task, project, status, priority, note] = data[i];
    if (!task || status === '✅ 完了') continue;

    const dueDate = new Date(dateVal);
    dueDate.setHours(0, 0, 0, 0);
    const dueDateStr = Utilities.formatDate(dueDate, 'Asia/Tokyo', 'yyyy-MM-dd');
    const entry = { task, project, status, priority, note, date: dueDateStr };

    if (status === '⏳ チェック待ち') {
      waiting.push(entry);
    } else if (dueDate < today) {
      overdue.push(entry);
    } else if (dueDateStr === todayStr) {
      todayTasks.push(entry);
    } else if (dueDate <= weekLater) {
      upcoming.push(entry);
    }
  }

  // メール本文組み立て
  let body = `おはようございます！\n今日は ${Utilities.formatDate(today, 'Asia/Tokyo', 'M月d日（E）')} です。\n\n`;

  if (overdue.length > 0) {
    body += '⚠ 期日超過\n';
    body += '─────────────\n';
    overdue.forEach(t => {
      body += `❗ [${t.date}] ${t.task}（${t.project}）\n`;
      if (t.note) body += `   → ${t.note}\n`;
    });
    body += '\n';
  }

  if (todayTasks.length > 0) {
    body += '📌 今日のタスク\n';
    body += '─────────────\n';
    todayTasks.forEach(t => {
      body += `・${t.task}（${t.project}）${t.priority === '高' ? ' ★重要' : ''}\n`;
      if (t.note) body += `  → ${t.note}\n`;
    });
    body += '\n';
  }

  if (waiting.length > 0) {
    body += '⏳ チェック待ち\n';
    body += '─────────────\n';
    waiting.forEach(t => {
      body += `・${t.task}（${t.project}）\n`;
    });
    body += '\n';
  }

  if (upcoming.length > 0) {
    body += '📅 今後1週間\n';
    body += '─────────────\n';
    upcoming.forEach(t => {
      body += `・[${t.date}] ${t.task}（${t.project}）\n`;
    });
    body += '\n';
  }

  if (overdue.length === 0 && todayTasks.length === 0 && waiting.length === 0 && upcoming.length === 0) {
    body += '今日は特にタスクがありません。\n\n';
  }

  body += '─────────────\n';
  body += `ダッシュボード: ${ss.getUrl()}\n`;
  body += `GitHub: https://github.com/mai-san447/mai-san447.github.io/blob/main/DASHBOARD.md\n`;

  // 件名
  let subject = `【AICU日報】${Utilities.formatDate(today, 'Asia/Tokyo', 'M/d')}`;
  if (overdue.length > 0) subject += ` ⚠期日超過${overdue.length}件`;
  if (todayTasks.length > 0) subject += ` 今日${todayTasks.length}件`;

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body, {
    name: 'AICU スケジュールbot',
  });
}

// ===== テスト送信 =====
function testReminder() {
  sendDailyReminder();
  SpreadsheetApp.getUi().alert('テストメールを送信しました。\n' + NOTIFY_EMAIL + ' を確認してください。');
}

// ===== タスク完了ヘルパー =====
function markComplete() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ダッシュボード');
  const row = sheet.getActiveRange().getRow();
  if (row < 2) { SpreadsheetApp.getUi().alert('タスク行を選択してください'); return; }
  sheet.getRange(row, 4).setValue('✅ 完了');
  SpreadsheetApp.getUi().alert('タスクを完了にしました');
}

// ===== メニュー =====
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('AICUリマインダー')
    .addItem('初期セットアップ', 'setupReminder')
    .addItem('テスト送信', 'testReminder')
    .addItem('選択タスクを完了', 'markComplete')
    .addToUi();
}

// ===== ユーティリティ =====
function deleteTriggers_() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendDailyReminder') {
      ScriptApp.deleteTrigger(t);
    }
  });
}
