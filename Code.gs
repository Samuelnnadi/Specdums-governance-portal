// Optional Google Apps Script Web App template for SPECDUMS Limited Portal
// Deploy as Web App ("Execute as: Me", "Who has access: Anyone") and paste the URL into js/config.js.

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const payload = {
    baselineDate: "2026-09-11",
    members: readSheet_(ss, "Members"),
    minutes: readSheet_(ss, "MinutesResolutions"),
    receipts: readSheet_(ss, "Receipts"),
    projects: readSheet_(ss, "Projects"),
    charityContributions: readSheet_(ss, "CharityContributions")
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const body = JSON.parse(e.postData.contents || "{}");
  const type = body.entityType;
  const rec = body.record || {};

  const map = {
    member: "Members",
    minutes: "MinutesResolutions",
    receipt: "Receipts",
    project: "Projects",
    charity: "CharityContributions"
  };

  const sheetName = map[type];
  if (sheetName) {
    const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    sh.appendRow([new Date().toISOString(), rec.id || "", JSON.stringify(rec)]);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function readSheet_(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh) return [];
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i]; });
    return obj;
  });
}
