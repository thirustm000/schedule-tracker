// ─────────────────────────────────────────────────────────────────────────────
// Monthly Calendar – Google Apps Script Web App
// Paste into Extensions > Apps Script, then deploy:
//   Execute as: Me  |  Who has access: Anyone
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_NAME = 'Events';
const API_KEY    = 'mango-jack-banana';
const COLUMNS    = ['id', 'title', 'date', 'timestamp', 'category', 'priority', 'isCompleted'];

// ─────────────────────────────────────────────────────────────────────────────
// All requests go through doGet (avoids browser CORS preflight issues).
// Params: key, action (list|add|toggle|delete), id?, event? (JSON string)
// ─────────────────────────────────────────────────────────────────────────────
function doGet(e) {
  const p = e.parameter;

  if ((p.key || '') !== API_KEY) {
    return jsonOut({ error: 'Unauthorized' });
  }

  const action = p.action || 'list';
  const sheet  = getSheet();

  // ── LIST ─────────────────────────────────────────────────────────────────
  if (action === 'list') {
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return jsonOut([]);

    const headers = rows[0].map(h => String(h).trim());
    const events  = rows.slice(1)
      .filter(row => row[0] !== '')
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i]; });
        obj.isCompleted = obj.isCompleted === true || String(obj.isCompleted).toUpperCase() === 'TRUE';
        return obj;
      });
    return jsonOut(events);
  }

  // ── ADD ──────────────────────────────────────────────────────────────────
  if (action === 'add') {
    let event;
    try { event = JSON.parse(p.event || '{}'); } catch (_) {
      return jsonOut({ error: 'Invalid event JSON' });
    }
    if (!event.id || !event.title || !event.date) {
      return jsonOut({ error: 'Missing required event fields' });
    }
    ensureHeaders(sheet);
    sheet.appendRow([
      event.id,
      event.title,
      event.date,
      event.timestamp  || '',
      event.category   || 'Other',
      event.priority   || 'Medium',
      false,
    ]);
    return jsonOut({ success: true });
  }

  // ── TOGGLE ───────────────────────────────────────────────────────────────
  if (action === 'toggle') {
    const rowIdx = findRowById(sheet, p.id);
    if (rowIdx === -1) return jsonOut({ error: 'Event not found' });

    const col     = COLUMNS.indexOf('isCompleted') + 1; // 1-based
    const current = sheet.getRange(rowIdx, col).getValue();
    const next    = !(current === true || String(current).toUpperCase() === 'TRUE');
    sheet.getRange(rowIdx, col).setValue(next);
    return jsonOut({ success: true, isCompleted: next });
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (action === 'delete') {
    const rowIdx = findRowById(sheet, p.id);
    if (rowIdx === -1) return jsonOut({ error: 'Event not found' });
    sheet.deleteRow(rowIdx);
    return jsonOut({ success: true });
  }

  return jsonOut({ error: `Unknown action: ${action}` });
}

// Keep doPost stub so old deploys don't break
function doPost(e) {
  return doGet(e);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    const hdr = sheet.getRange(1, 1, 1, COLUMNS.length);
    hdr.setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff');
    sheet.setColumnWidth(1, 200);
  }
  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  }
}

function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1;
  }
  return -1;
}

function jsonOut(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
