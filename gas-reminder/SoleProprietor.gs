/**
 * 個人事業主タスク管理 & 朝ニュース配信（SoleProprietor.gs）
 *
 * 機能:
 * 1. 個人事業主マイルストーンをダッシュボードに追加
 * 2. 月次・四半期タスクの自動生成
 * 3. 毎朝の法律・補助金・個人事業主ニュース配信
 *
 * セットアップ:
 * 1. addSoleProprietorTasks() → マイルストーンをダッシュボードに追加
 * 2. setupMonthlyTrigger() → 毎月1日に月次タスクを自動追加
 * 3. setupNewsTrigger() → 毎朝7:30にニュースダイジェストを配信
 */

// ===== 個人事業主マイルストーン（年間スケジュール）をダッシュボードに追加 =====
function addSoleProprietorTasks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('ダッシュボード');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('先に setupReminder() を実行してダッシュボードを作成してください');
    return;
  }

  const tasks = [
    // ===== 開業手続き（2026年3月〜4月）=====
    ['2026-03-31', '開業届の提出（税務署）', '個人事業', '✅ 完了', '高', '提出済み'],
    ['2026-03-31', '青色申告承認申請書の提出', '個人事業', '✅ 完了', '高', '提出済み'],
    ['2026-03-31', '事業用口座の開設 or 専用口座の指定', '個人事業', '⬜ 未実施', '高', 'プライベートと分離。マネーフォワード連携'],
    ['2026-03-31', '個人事業開始届出書（都税事務所）', '個人事業', '⬜ 未実施', '中', '東京都の場合は都税事務所へ。開業届とは別'],
    ['2026-04-05', 'マネーフォワードに事業用口座を連携', '個人事業', '⬜ 未実施', '高', '自動仕訳の設定、勘定科目の初期設定も'],
    ['2026-04-05', '勤務先の就業規則で副業許可を確認', '個人事業', '⬜ 未実施', '高', ''],
    ['2026-04-10', 'LP特定商取引法に基づく表記を追加', '個人事業', '⬜ 未実施', '高', 'ハナサクLP。オンライン有料サービスに必須'],
    ['2026-04-10', 'プライバシーポリシーをLPに追加', '個人事業', '⬜ 未実施', '中', '顧客情報を扱うため'],
    ['2026-04-10', 'コーチング利用規約・キャンセルポリシー作成', '個人事業', '⬜ 未実施', '中', ''],

    // ===== 補助金・助成金（最新スケジュール）=====
    // --- 持続化補助金 第19回（最優先）---
    ['2026-03-25', '★ 商工会議所に相談予約（持続化補助金）', '補助金', '⬜ 未実施', '高', '事業支援計画書（様式4）の発行に必須。東京商工会議所 03-3283-7700'],
    ['2026-04-05', '持続化補助金 経営計画書の作成開始', '補助金', '⬜ 未実施', '高', '「経営計画書」+「補助事業計画書」。商工会議所で無料添削あり'],
    ['2026-04-16', '★ 事業支援計画書（様式4）発行受付締切', '補助金', '⬜ 未実施', '高', '商工会議所から発行。これがないと申請不可'],
    ['2026-04-30', '★★ 持続化補助金 第19回 申請締切 17:00', '補助金', '⬜ 未実施', '高', '上限50万円（創業枠なら200万円）。LP改善・広告費・名刺・チラシに使える'],

    // --- デジタル化・AI導入補助金（旧IT導入補助金）---
    ['2026-03-30', 'デジタル化・AI導入補助金 公募開始（確認）', '補助金', '⬜ 未実施', '中', '旧IT導入補助金。3/30 10:00〜申請受付開始'],
    ['2026-05-12', '★ デジタル化・AI導入補助金 1次締切 17:00', '補助金', '⬜ 未実施', '中', 'Stripe・予約システム・会計ソフト等。ただし開業1年以上が条件→2027年から申請可能'],

    // --- 東京都 創業サポート ---
    ['2026-04-10', '東京都 女性・若者・シニア創業サポート2.0 申込', '補助金', '⬜ 未実施', '高', '★最大2,000万円（女性枠）無利子融資。信金経由。随時受付。金利1%以下'],
    ['2026-04-15', 'ふくい女性財団 創業相談', '補助金', '⬜ 未実施', '中', '福井県の創業支援制度の確認'],
    ['2026-04-20', '日本政策金融公庫 新規開業資金の確認', '補助金', '⬜ 未実施', '中', '女性起業家支援枠あり。無担保・低利。最大7,200万円'],

    // --- 今後の公募予定 ---
    ['2026-09-30', '持続化補助金 第20回 公募要領チェック', '補助金', '⬜ 未実施', '低', '秋公募。9月下旬〜10月上旬に要領公開予定'],

    // ===== インボイス準備 =====
    ['2026-04-30', 'インボイス登録の要否を最終判断', 'インボイス', '⬜ 未実施', '中', '現状：AICU未要求・個人顧客は不要。B2B拡大時に再検討。e-Taxで即日登録可能'],
    ['2026-04-30', 'マネーフォワードで請求書テンプレート作成', 'インボイス', '⬜ 未実施', '中', '登録番号欄は空欄で準備。免税でも請求書は必要'],

    // ===== フリーランス新法対応 =====
    ['2026-04-15', 'AICU業務委託契約書の確認（フリーランス新法対応）', '法務', '⬜ 未実施', '中', '2024年11月施行。取引条件の書面明示・60日以内の報酬支払が義務化'],

    // ===== 節税・守り =====
    ['2026-04-30', '小規模企業共済の加入検討', '個人事業', '⬜ 未実施', '中', '月1,000〜70,000円。全額所得控除+退職金代わり'],
    ['2026-04-30', 'フリーランス協会 加入検討', '個人事業', '⬜ 未実施', '低', '年1万円。賠償責任保険+所得補償+法律相談付き'],

    // ===== 税務年間マイルストーン =====
    ['2026-06-01', '住民税通知の確認（普通徴収になっているか）', '税務', '⬜ 未実施', '高', '副業分が特別徴収だと勤務先にバレる可能性。確定申告時に普通徴収を選択'],
    ['2026-07-01', '予定納税の通知確認（該当する場合）', '税務', '⬜ 未実施', '中', '前年所得税15万円超で発生'],
    ['2026-08-31', '個人事業税の通知確認・納付', '税務', '⬜ 未実施', '中', '290万円超の事業所得に課税'],
    ['2026-12-31', '年末の経費精算・棚卸し', '税務', '⬜ 未実施', '高', '12月中に経費の漏れがないか確認'],
    ['2027-01-10', '確定申告の準備開始', '税務', '⬜ 未実施', '高', 'マネーフォワードで年間仕訳を確定'],
    ['2027-02-16', '★ 確定申告期間開始', '税務', '⬜ 未実施', '高', '青色65万円控除。e-Taxで電子申告'],
    ['2027-03-15', '★ 確定申告期限', '税務', '⬜ 未実施', '高', '遅延すると65万→10万に控除減額'],
  ];

  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, tasks.length, 6).setValues(tasks);

  // 期日でソート（ヘッダー除く）
  const totalRows = sheet.getLastRow();
  if (totalRows > 1) {
    sheet.getRange(2, 1, totalRows - 1, 6).sort({ column: 1, ascending: true });
  }

  SpreadsheetApp.getUi().alert(
    '個人事業主タスクを追加しました！\n\n' +
    `追加: ${tasks.length}件\n` +
    '・開業手続き: 9件\n' +
    '・補助金・助成金: 10件（持続化補助金・AI導入補助金・創業サポート融資）\n' +
    '・インボイス準備: 2件\n' +
    '・法務（フリーランス新法）: 1件\n' +
    '・節税・守り: 2件\n' +
    '・税務マイルストーン: 7件'
  );
}

// =====================================================
// 朝ニュース配信（法律・補助金・個人事業主向け）
// =====================================================

/**
 * ニュースソース定義
 * Google News RSS + 政府系RSS
 */
const NEWS_SOURCES_ = [
  // 補助金・助成金
  {
    name: '補助金ポータル',
    url: 'https://news.google.com/rss/search?q=%E8%A3%9C%E5%8A%A9%E9%87%91+%E5%80%8B%E4%BA%BA%E4%BA%8B%E6%A5%AD%E4%B8%BB&hl=ja&gl=JP&ceid=JP:ja',
    category: '💰 補助金・助成金'
  },
  // 個人事業主・フリーランス
  {
    name: '個人事業主ニュース',
    url: 'https://news.google.com/rss/search?q=%E5%80%8B%E4%BA%BA%E4%BA%8B%E6%A5%AD%E4%B8%BB+OR+%E3%83%95%E3%83%AA%E3%83%BC%E3%83%A9%E3%83%B3%E3%82%B9+%E6%B3%95%E5%BE%8B+OR+%E7%A8%8E%E5%88%B6+OR+%E5%88%B6%E5%BA%A6&hl=ja&gl=JP&ceid=JP:ja',
    category: '📋 個人事業主・法制度'
  },
  // 中小企業政策
  {
    name: '中小企業政策',
    url: 'https://news.google.com/rss/search?q=%E4%B8%AD%E5%B0%8F%E4%BC%81%E6%A5%AD%E5%BA%81+OR+%E7%B5%8C%E6%B8%88%E7%94%A3%E6%A5%AD%E7%9C%81+%E8%A3%9C%E5%8A%A9%E9%87%91+OR+%E6%94%AF%E6%8F%B4&hl=ja&gl=JP&ceid=JP:ja',
    category: '🏛️ 中小企業政策'
  },
  // 確定申告・税制
  {
    name: '税制・確定申告',
    url: 'https://news.google.com/rss/search?q=%E7%A2%BA%E5%AE%9A%E7%94%B3%E5%91%8A+OR+%E9%9D%92%E8%89%B2%E7%94%B3%E5%91%8A+OR+%E3%82%A4%E3%83%B3%E3%83%9C%E3%82%A4%E3%82%B9+OR+%E6%B6%88%E8%B2%BB%E7%A8%8E+%E5%80%8B%E4%BA%BA%E4%BA%8B%E6%A5%AD%E4%B8%BB&hl=ja&gl=JP&ceid=JP:ja',
    category: '🧾 税制・確定申告'
  },
  // コーチング・女性起業
  {
    name: 'コーチング・女性起業',
    url: 'https://news.google.com/rss/search?q=%E5%A5%B3%E6%80%A7%E8%B5%B7%E6%A5%AD+OR+%E3%82%B3%E3%83%BC%E3%83%81%E3%83%B3%E3%82%B0+%E5%89%B5%E6%A5%AD&hl=ja&gl=JP&ceid=JP:ja',
    category: '🌸 コーチング・女性起業'
  },
];

/**
 * RSSフィードを取得してパース
 */
function fetchRSS_(url, maxItems) {
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return [];

    const xml = XmlService.parse(response.getContentText());
    const root = xml.getRootElement();
    const channel = root.getChild('channel');
    if (!channel) return [];

    const items = channel.getChildren('item');
    const results = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (let i = 0; i < Math.min(items.length, maxItems * 2); i++) {
      const item = items[i];
      const title = item.getChildText('title') || '';
      const link = item.getChildText('link') || '';
      const pubDate = item.getChildText('pubDate') || '';
      const source = item.getChild('source');
      const sourceName = source ? source.getText() : '';

      // 24時間以内のニュースのみ
      const date = new Date(pubDate);
      if (date < oneDayAgo) continue;

      // 重複・ノイズ除去
      if (title.includes('PR TIMES') || title.includes('広告')) continue;

      results.push({
        title: title.replace(/ - .*$/, ''), // ソース名を除去
        link: link,
        source: sourceName,
        date: Utilities.formatDate(date, 'Asia/Tokyo', 'M/d HH:mm'),
      });

      if (results.length >= maxItems) break;
    }
    return results;
  } catch (e) {
    Logger.log('RSS fetch error: ' + url + ' - ' + e.message);
    return [];
  }
}

/**
 * 今日の補助金締切・マイルストーン情報を取得
 */
function getTodayMilestones_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('ダッシュボード');
  if (!sheet) return { today: [], thisWeek: [], overdue: [] };

  const data = sheet.getDataRange().getValues();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const result = { today: [], thisWeek: [], overdue: [] };
  const bizCategories = ['個人事業', '補助金', 'インボイス', '税務', '法務', '月次経理', '四半期'];

  for (let i = 1; i < data.length; i++) {
    const [dateVal, task, project, status] = data[i];
    if (!task || status === '✅ 完了') continue;
    if (!bizCategories.includes(project)) continue;

    const dueDate = new Date(dateVal);
    dueDate.setHours(0, 0, 0, 0);
    const dueDateStr = Utilities.formatDate(dueDate, 'Asia/Tokyo', 'yyyy-MM-dd');
    const todayStr = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy-MM-dd');
    const entry = `${task}（${project}）`;

    if (dueDate < now) {
      result.overdue.push(`❗ [${dueDateStr}] ${entry}`);
    } else if (dueDateStr === todayStr) {
      result.today.push(`📌 ${entry}`);
    } else if (dueDate <= weekLater) {
      result.thisWeek.push(`📅 [${dueDateStr}] ${entry}`);
    }
  }
  return result;
}

/**
 * 朝のニュースダイジェストメール送信
 */
function sendMorningNews() {
  const today = new Date();
  const dateStr = Utilities.formatDate(today, 'Asia/Tokyo', 'M月d日（E）');

  let body = `おはようございます！\n`;
  body += `${dateStr} の個人事業主ニュースダイジェストです。\n\n`;

  // --- タスク・マイルストーン情報 ---
  const milestones = getTodayMilestones_();

  if (milestones.overdue.length > 0) {
    body += '⚠ 期日超過（個人事業関連）\n';
    body += '━━━━━━━━━━━━━━━━━━━━\n';
    milestones.overdue.forEach(t => body += t + '\n');
    body += '\n';
  }

  if (milestones.today.length > 0) {
    body += '📌 今日の個人事業タスク\n';
    body += '━━━━━━━━━━━━━━━━━━━━\n';
    milestones.today.forEach(t => body += t + '\n');
    body += '\n';
  }

  if (milestones.thisWeek.length > 0) {
    body += '📅 今後1週間の個人事業タスク\n';
    body += '━━━━━━━━━━━━━━━━━━━━\n';
    milestones.thisWeek.forEach(t => body += t + '\n');
    body += '\n';
  }

  // --- ニュースフィード ---
  body += '\n';
  body += '📰 今日のニュース\n';
  body += '━━━━━━━━━━━━━━━━━━━━\n\n';

  let totalNews = 0;
  NEWS_SOURCES_.forEach(source => {
    const items = fetchRSS_(source.url, 3);
    if (items.length === 0) return;

    body += `${source.category}\n`;
    body += '──────────\n';
    items.forEach(item => {
      body += `・${item.title}\n`;
      body += `  ${item.link}\n`;
      if (item.source) body += `  （${item.source} ${item.date}）\n`;
    });
    body += '\n';
    totalNews += items.length;
  });

  if (totalNews === 0) {
    body += '直近24時間で該当するニュースはありませんでした。\n\n';
  }

  // --- 定期チェック用リンク集 ---
  body += '\n';
  body += '🔗 定期チェック用リンク\n';
  body += '━━━━━━━━━━━━━━━━━━━━\n';
  body += '・JNET21（中小企業向け補助金検索）: https://j-net21.smrj.go.jp/snavi/support/\n';
  body += '・ミラサポplus: https://mirasapo-plus.go.jp/\n';
  body += '・中小企業庁: https://www.chusho.meti.go.jp/\n';
  body += '・持続化補助金: https://r6.jizokukahojokin.info/\n';
  body += '・デジタル化・AI導入補助金: https://it-shien.smrj.go.jp/\n';
  body += '・東京都創業サポート2.0: https://sougyou-support.tokyo/\n';
  body += '・日本政策金融公庫: https://www.jfc.go.jp/\n';
  body += '・マネーフォワード確定申告: https://biz.moneyforward.com/tax_return/\n';

  // 件名
  let subject = `【個人事業ニュース】${Utilities.formatDate(today, 'Asia/Tokyo', 'M/d')}`;
  if (milestones.overdue.length > 0) subject += ` ⚠超過${milestones.overdue.length}件`;
  if (milestones.today.length > 0) subject += ` 今日${milestones.today.length}件`;

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body, {
    name: '個人事業ニュースbot',
  });
}

/**
 * ニュース配信テスト
 */
function testMorningNews() {
  sendMorningNews();
  SpreadsheetApp.getUi().alert('ニュースダイジェストを送信しました。\n' + NOTIFY_EMAIL + ' を確認してください。');
}

/**
 * ニュース配信トリガーのセットアップ（毎朝7:30）
 */
function setupNewsTrigger() {
  // 既存トリガー削除
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendMorningNews') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 毎朝7:30（日次リマインダーの30分前）
  ScriptApp.newTrigger('sendMorningNews')
    .timeBased()
    .atHour(7)
    .nearMinute(30)
    .everyDays(1)
    .create();

  SpreadsheetApp.getUi().alert(
    'ニュース配信を設定しました！\n\n' +
    '・毎朝7:30にニュースダイジェストが届きます\n' +
    '・補助金/個人事業主/税制/法律/女性起業のニュース\n' +
    '・ダッシュボードの個人事業タスクの期日アラート付き\n\n' +
    '（既存の8:00 AICU日報とは別メールです）'
  );
}

// ===== 月次タスク自動追加（毎月1日にトリガー実行）=====
function addMonthlyTasks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('ダッシュボード');
  if (!sheet) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  // 重複防止：今月分が既にあるかチェック
  const data = sheet.getDataRange().getValues();
  const alreadyExists = data.some(row =>
    row[2] === '月次経理' && String(row[0]).startsWith(monthStr)
  );
  if (alreadyExists) return;

  const day05 = `${monthStr}-05`;
  const day10 = `${monthStr}-10`;
  const day15 = `${monthStr}-15`;

  const monthlyTasks = [
    [day05, `${month}月 売上・経費の月次締め`, '月次経理', '⬜ 未実施', '高', 'マネーフォワードで仕訳確認・未分類の処理'],
    [day05, `${month}月 事業用口座の残高確認・資金繰りチェック`, '月次経理', '⬜ 未実施', '中', ''],
    [day10, `${month}月 請求書の発行（未発行分）`, '月次経理', '⬜ 未実施', '中', 'AICU業務委託分など'],
    [day10, `${month}月 レシート・領収書の整理`, '月次経理', '⬜ 未実施', '中', 'スマホ撮影→マネーフォワードにアップ'],
    [day15, `${month}月 顧客管理の更新（ハナサク）`, '月次経理', '⬜ 未実施', '低', '継続率・次回予約・LINE登録数'],
    [day15, `${month}月 不要サブスクの見直し`, '月次経理', '⬜ 未実施', '低', ''],
  ];

  // 四半期タスク（3月, 6月, 9月, 12月）
  if ([3, 6, 9, 12].includes(month)) {
    const day20 = `${monthStr}-20`;
    monthlyTasks.push(
      [day20, `Q${Math.ceil(month / 3)} 売上推移分析・事業計画進捗レビュー`, '四半期', '⬜ 未実施', '高', '目標との差分確認'],
      [day20, `Q${Math.ceil(month / 3)} 補助金・助成金の公募チェック`, '四半期', '⬜ 未実施', '中', 'JNET21・ミラサポplus等'],
      [day20, `Q${Math.ceil(month / 3)} マーケティング振り返り（LP流入・CVR）`, '四半期', '⬜ 未実施', '中', '']
    );
  }

  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, monthlyTasks.length, 6).setValues(monthlyTasks);

  // ソート
  const totalRows = sheet.getLastRow();
  if (totalRows > 1) {
    sheet.getRange(2, 1, totalRows - 1, 6).sort({ column: 1, ascending: true });
  }
}

// ===== 月次トリガーのセットアップ =====
function setupMonthlyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'addMonthlyTasks') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('addMonthlyTasks')
    .timeBased()
    .onMonthDay(1)
    .atHour(7)
    .create();

  addMonthlyTasks();

  SpreadsheetApp.getUi().alert(
    '月次タスク自動追加を設定しました！\n\n' +
    '・毎月1日 7:00に月次経理タスクが自動追加されます\n' +
    '・3/6/9/12月は四半期レビュータスクも追加\n' +
    '・重複防止機能付き'
  );
}

// ===== メニュー =====
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('AICUリマインダー')
    .addItem('初期セットアップ', 'setupReminder')
    .addItem('テスト送信（AICU日報）', 'testReminder')
    .addItem('選択タスクを完了', 'markComplete')
    .addSeparator()
    .addItem('個人事業主タスク追加', 'addSoleProprietorTasks')
    .addItem('月次自動タスク設定', 'setupMonthlyTrigger')
    .addSeparator()
    .addItem('ニュース配信設定', 'setupNewsTrigger')
    .addItem('テスト送信（ニュース）', 'testMorningNews')
    .addToUi();
}
