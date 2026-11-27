// Centralized Configuration for SPECDUMS Limited Governance & Financial Ledger Portal
window.PORTAL_CONFIG = {
  companyName: "SPECDUMS Limited",
  portalTitle: "SPECDUMS Limited Governance & Financial Ledger Portal",
  baselineDate: "2026-09-11",
  baselineLabel: "11 Sep 2026",
  currencySymbol: "£",
  defaultMonthlyDues: 100,
  arrearsThresholdMonths: 3,

  // Privacy & Member Access Control:
  // When restrictIndividualMemberData is true, individual member names,
  // personal contributions, and individual arrears are masked for public/guest
  // visitors unless unlocked via Member/Governance Access PIN.
  // Aggregate totals and summaries remain visible on public views.
  restrictIndividualMemberData: true,
  memberAccessPin: "2026",

  // Optional Google Sheets / Apps Script Web App integration
  // Paste your deployed Google Apps Script Web App URL below to enable live cloud sync.
  appsScriptUrl: "",
  googleSheetId: "",
  sheetTabs: {
    members: "Members",
    minutes: "MinutesResolutions",
    receipts: "Receipts",
    projects: "Projects",
    charity: "CharityContributions"
  },

  // LocalStorage keys for offline/browser persistence and drafts
  storageKeys: {
    state: "specdums_portal_state_v1",
    unlocked: "specdums_portal_unlocked_v1"
  }
};
