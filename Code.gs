// ─────────────────────────────────────────────────────────────────────────────
// Monthly Calendar – Google Apps Script Web App
// Paste this entire file into Extensions > Apps Script in your Google Sheet,
// then deploy as a Web App:
//   Execute as: Me
//   Who has access: Anyone
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_NAME = 'Events';
const API_KEY    = 'mango-jack-banana';

// Column order must match this array exactly (A=1 … G=7)
const COLUMNS = ['id', 'title', 'date', 'timestamp', 'category', 'priority', 'isCompleted'];

// ─────────────────────────────────────────────────────────────────────────────
// GET  –  Returns all events as a JSON array
// URL:  ?key=mango-jack-banana
// ─────────────────────────────────────────────────────────────────────────────
function doGet(e) {
  if ((e.parameter.key || '') !== API_KEY) {
    return jsonOut({ error: 'Unauthorized' });
  }

  const sheet = getSheet();
  const rows  = sheet.getDataRange().getValues();

  if (rows.length <= 1) return jsonOut([]); // header-only or empty

  const headers = rows[0].map(h => String(h).trim());
  const events  = rows.slice(1)
    .filter(row => row[0] !== '') // skip blank rows
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      // Normalise boolean
      obj.isCompleted = obj.isCompleted === true || String(obj.isCompleted).toUpperCase() === 'TRUE';
      return obj;
    });

  return jsonOut(events);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST  –  Handles add / toggle / delete actions
// Body (JSON string):  { action, key, id?, event? }
// ─────────────────────────────────────────────────────────────────────────────
function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (_) {
    return jsonOut({ error: 'Invalid JSON body' });
  }

  if ((payload.key || '') !== API_KEY) {
    return jsonOut({ error: 'Unauthorized' });
  }

  const sheet = getSheet();
  ensureHeaders(sheet);

  const { action, id, event } = payload;

  // ── ADD ──────────────────────────────────────────────────────────────────
  if (action === 'add') {
    if (!event || !event.id || !event.title || !event.date) {
      return jsonOut({ error: 'Missing required event fields' });
    }
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
    const rowIdx = findRowById(sheet, id);
    if (rowIdx === -1) return jsonOut({ error: 'Event not found' });

    const isCompletedColIndex = COLUMNS.indexOf('isCompleted') + 1; // 1-based
    const current = sheet.getRange(rowIdx, isCompletedColIndex).getValue();
    const next    = !(current === true || String(current).toUpperCase() === 'TRUE');
    sheet.getRange(rowIdx, isCompletedColIndex).setValue(next);
    return jsonOut({ success: true, isCompleted: next });
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (action === 'delete') {
    const rowIdx = findRowById(sheet, id);
    if (rowIdx === -1) return jsonOut({ error: 'Event not found' });
    sheet.deleteRow(rowIdx);
    return jsonOut({ success: true });
  }

  return jsonOut({ error: `Unknown action: ${action}` });
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
    // Style header row
    const header = sheet.getRange(1, 1, 1, COLUMNS.length);
    header.setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff');
    sheet.setColumnWidth(1, 200); // id column
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
    if (String(data[i][0]) === String(id)) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

function jsonOut(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
