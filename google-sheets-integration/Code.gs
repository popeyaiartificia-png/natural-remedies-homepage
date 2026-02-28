/**
 * ══════════════════════════════════════════════════════════════════
 *  Natural Remedies — Contact Form → Google Sheets Integration
 *  Google Apps Script  |  Paste this in script.google.com
 * ══════════════════════════════════════════════════════════════════
 *
 *  HOW TO DEPLOY (step-by-step at the bottom of this file)
 */

// ─── CONFIG ───────────────────────────────────────────────────────
const SHEET_NAME      = "Form Submissions";   // Tab name in your Google Sheet
const NOTIFY_EMAIL    = "your@email.com";      // Email to receive new lead alerts
const SEND_EMAIL_ALERT = true;                 // Set false to disable email alerts
// ──────────────────────────────────────────────────────────────────


/**
 * Handles POST requests from the contact form.
 * The form sends JSON; this script parses it and appends a row.
 */
function doPost(e) {

  try {
    // Parse incoming JSON body
    const raw  = e.postData ? e.postData.contents : "{}";
    const data = JSON.parse(raw);

    // Get or create the sheet
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(SHEET_NAME);

    // Auto-create sheet + header row if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      appendHeader(sheet);
    }

    // If sheet is brand new (only 1 row or empty), write headers
    if (sheet.getLastRow() === 0) {
      appendHeader(sheet);
    }

    // Build the row in the same order as the header
    const row = [
      new Date(),                           // Timestamp (server-side)
      data.firstName   || "",
      data.lastName    || "",
      data.email       || "",
      data.phone       || "",
      data.country     || "",
      data.role        || "",
      data.interest    || "",
      data.message     || "",
      data.submittedAt || "",               // Client-side timestamp
      data.source      || "Landing Page",
    ];

    sheet.appendRow(row);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, row.length);

    // ── Optional email alert ──────────────────────────────────────
    if (SEND_EMAIL_ALERT) {
      sendAlertEmail(data);
    }

    // Return success (no-cors mode won't read this, but useful for debugging)
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log error to Apps Script logger
    console.error("Form submission error:", err);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Handles GET requests — useful for testing the deployment URL in a browser.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Natural Remedies Form Endpoint is live." }))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Writes the header row to a fresh sheet.
 */
function appendHeader(sheet) {
  const headers = [
    "Timestamp (Server)",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Country",
    "Role",
    "Area of Interest",
    "Message",
    "Submitted At (Client)",
    "Source",
  ];

  sheet.appendRow(headers);

  // Style the header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0e4a28");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);
}


/**
 * Sends an email alert to NOTIFY_EMAIL when a new lead arrives.
 */
function sendAlertEmail(data) {
  const subject = `🌿 New Lead: ${data.firstName} ${data.lastName} — Natural Remedies`;

  const body = `
A new contact form submission has been received on naturalremedies.com.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CONTACT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name    : ${data.firstName} ${data.lastName}
Email   : ${data.email}
Phone   : ${data.phone || "Not provided"}
Country : ${data.country || "Not provided"}
Role    : ${data.role || "Not specified"}
Interest: ${data.interest || "General Enquiry"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.message || "(No message provided)"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source   : ${data.source || "Landing Page"}
Submitted: ${data.submittedAt || new Date().toISOString()}

View all submissions:
${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
  `.trim();

  MailApp.sendEmail({
    to:      NOTIFY_EMAIL,
    subject: subject,
    body:    body,
  });
}


/**
 * ══════════════════════════════════════════════════════════════════
 *  DEPLOYMENT STEPS  (read carefully — takes ~5 minutes)
 * ══════════════════════════════════════════════════════════════════
 *
 *  STEP 1 — Create a Google Sheet
 *  ─────────────────────────────
 *  • Go to sheets.google.com → create a new blank sheet
 *  • Name it anything (e.g. "NR Form Leads")
 *
 *  STEP 2 — Open Apps Script
 *  ──────────────────────────
 *  • In the Sheet: Extensions → Apps Script
 *  • Delete all existing code in the editor
 *  • Paste the entire contents of THIS file (Code.gs)
 *
 *  STEP 3 — Set your email
 *  ───────────────────────
 *  • Change NOTIFY_EMAIL at the top to your real email address
 *
 *  STEP 4 — Deploy as Web App
 *  ──────────────────────────
 *  • Click "Deploy" → "New Deployment"
 *  • Type: "Web App"
 *  • Description: "Natural Remedies Contact Form v1"
 *  • Execute as: "Me"
 *  • Who has access: "Anyone"   ← IMPORTANT: must be "Anyone"
 *  • Click "Deploy"
 *  • Click "Authorize access" → choose your Google account → Allow
 *  • COPY the Web App URL shown (looks like: https://script.google.com/macros/s/XXXX/exec)
 *
 *  STEP 5 — Paste URL into index.html
 *  ───────────────────────────────────
 *  • Open index.html in your editor
 *  • Find this line (near the bottom in the <script> section):
 *
 *      const SHEETS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
 *
 *  • Replace 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' with your copied URL
 *  • Save the file
 *
 *  STEP 6 — Test it
 *  ─────────────────
 *  • Open index.html in a browser
 *  • Fill out the contact form and submit
 *  • Check your Google Sheet — a new row should appear within seconds
 *  • Check your email — you should receive the alert
 *
 *  STEP 7 — Re-deploy after any code changes
 *  ──────────────────────────────────────────
 *  • If you edit Code.gs, you MUST deploy a NEW version:
 *    Deploy → Manage Deployments → Edit (pencil icon) → New Version → Deploy
 *  • The URL stays the same — you don't need to update index.html again
 *
 * ══════════════════════════════════════════════════════════════════
 */
