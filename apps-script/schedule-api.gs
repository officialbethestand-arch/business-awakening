/**
 * schedule-api.gs
 * ビジネスマン覚醒研修 — セミナー日程管理API
 *
 * 【使い方】
 * 1. このスクリプトをGoogleスプレッドシートのApps Scriptにコピー
 * 2. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」として公開
 *    - 実行ユーザー: 自分
 *    - アクセス: 全員（匿名を含む）
 * 3. 発行されたURLをscript.jsの SCHEDULE_API_URL に貼る
 * 4. スプレッドシートに日程を入力するだけでLPに自動反映される
 *
 * 【スプレッドシートの構成】
 * シート名「体験セミナー」:
 *   A列: 表示日付（長）  例: 2026年5月31日（日）
 *   B列: 表示日付（短）  例: 5月31日(日)
 *   C列: 時間            例: 14:00〜16:00
 *   D列: 形式            例: オンライン（Zoom）
 *   E列: フォームURL     例: https://docs.google.com/forms/...
 *   F列: 表示する        例: TRUE / FALSE（FALSEにすると非表示）
 *
 * シート名「本講座」:
 *   A列: 表示日付（長）  例: 2026年6月開始
 *   B列: スケジュール説明 例: 週末（土日）集中講義・1日5時間
 *   C列: フォームURL
 *   D列: 表示する        例: TRUE / FALSE
 */

const LINE_URL = 'https://lin.ee/wpIe0DA';

function doGet() {
  const result = buildScheduleJson();
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildScheduleJson() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── 体験セミナーシートを読み込む ──────────────────────
  const taikenSheet = ss.getSheetByName('体験セミナー');
  const taikenList  = [];

  if (taikenSheet) {
    const rows = taikenSheet.getDataRange().getValues();
    // 1行目はヘッダーなのでスキップ
    for (let i = 1; i < rows.length; i++) {
      const [dateLong, dateShort, time, format, formUrl, visible] = rows[i];
      if (!dateLong || visible === false || visible === 'FALSE') continue;
      taikenList.push({
        date_long:  String(dateLong),
        date_short: String(dateShort),
        time:       String(time),
        format:     String(format),
        form_url:   String(formUrl),
      });
    }
  }

  // ── 本講座シートを読み込む ────────────────────────────
  const mainSheet = ss.getSheetByName('本講座');
  const mainList  = [];

  if (mainSheet) {
    const rows = mainSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const [dateLong, schedule, formUrl, visible] = rows[i];
      if (!dateLong || visible === false || visible === 'FALSE') continue;
      mainList.push({
        date_long: String(dateLong),
        schedule:  String(schedule),
        form_url:  String(formUrl),
      });
    }
  }

  return {
    line_url:        LINE_URL,
    line_label:      'LINEで最新情報を受け取る',
    taiken_seminar:  taikenList,
    main_course:     mainList,
    updated_at:      new Date().toISOString(),
  };
}
