/**
 * LEAP Growths Academy — Collaboration enquiry Web App
 *
 * Setup:
 * 1. Create a Google Sheet with this header row:
 *    Timestamp | Name | Organisation | Work Email | Phone | Estimated Group Size | College Challenges | HR/L&D Challenges
 * 2. Extensions → Apps Script, paste this file.
 * 3. Paste the spreadsheet ID below (from the Sheet URL).
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web app URL into js/site-config.js as GOOGLE_SCRIPT_URL.
 */

const SPREADSHEET_ID = "PASTE_YOUR_SPREADSHEET_ID_HERE";
const SHEET_NAME = "Sheet1";

const HEADERS = [
  "Timestamp",
  "Name",
  "Organisation",
  "Work Email",
  "Phone",
  "Estimated Group Size",
  "College Challenges",
  "HR/L&D Challenges"
];

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseBody(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      return e.parameter || {};
    }
  }
  return (e && e.parameter) || {};
}

function getSheet() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var currentHeaders = firstRow.join("|");
  var expectedHeaders = HEADERS.join("|");
  if (!firstRow[0] || currentHeaders !== expectedHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = parseBody(e);
    var sheet = getSheet();
    sheet.appendRow([
      new Date(),
      data.name || "",
      data.organisation || "",
      data.email || "",
      data.phone || "",
      data.groupSize || "",
      data.collegeChallenges || "",
      data.hrChallenges || ""
    ]);
    return jsonOutput({ result: "success" });
  } catch (error) {
    return jsonOutput({ result: "error", message: String(error) });
  }
}

function doGet() {
  return jsonOutput({ result: "ok" });
}
