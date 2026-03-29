/**
 * Google Apps Script — RSVP to Google Sheets
 *
 * SETUP (5 minutes):
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 * 2. Name it "Akshar Birthday RSVPs" (or whatever you like)
 * 3. Add these headers in Row 1:
 *    A1: Timestamp | B1: Parent Name | C1: Kid Names | D1: Kids | E1: Adults | F1: Attending | G1: Message
 * 4. Go to Extensions > Apps Script
 * 5. Delete any existing code and paste EVERYTHING below this comment block
 * 6. Click Deploy > New Deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Click Deploy, authorize when prompted
 * 8. Copy the Web App URL
 * 9. Paste that URL into script.js where it says GOOGLE_SHEET_URL = ''
 *
 * That's it! Every RSVP will now appear as a new row in your sheet.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.parentName || '',
      data.kidNames || '',
      data.kidsCount || '',
      data.adultsCount || '',
      data.attending || '',
      data.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('RSVP endpoint is live!')
    .setMimeType(ContentService.MimeType.TEXT);
}
