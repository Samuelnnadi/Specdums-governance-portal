// Baseline Dataset (18 Members as of 11 Sep 2026) & Initial Governance Records
window.INITIAL_PORTAL_DATA = {
  baselineDate: "2026-09-11",
  members: [
    { id: "MEM-01", name: "Member 01", email: "member01@example.org", shareCapital: 1500, duesPaid: 900, expectedDues: 900, monthsInArrears: 0, status: "Up to Date" },
    { id: "MEM-02", name: "Member 02", email: "member02@example.org", shareCapital: 1500, duesPaid: 900, expectedDues: 900, monthsInArrears: 0, status: "Up to Date" },
    { id: "MEM-03", name: "Member 03", email: "member03@example.org", shareCapital: 1500, duesPaid: 800, expectedDues: 900, monthsInArrears: 1, status: "1 Month Behind" },
    { id: "MEM-04", name: "Member 04", email: "member04@example.org", shareCapital: 1500, duesPaid: 600, expectedDues: 900, monthsInArrears: 3, status: "3+ Months Arrears" },
    { id: "MEM-05", name: "Member 05", email: "member05@example.org", shareCapital: 1200, duesPaid: 900, expectedDues: 900, monthsInArrears: 0, status: "Up to Date" },
    { id: "MEM-06", name: "Member 06", email: "member06@example.org", shareCapital: 1200, duesPaid: 700, expectedDues: 900, monthsInArrears: 2, status: "2 Months Behind" },
    { id: "MEM-07", name: "Member 07", email: "member07@example.org", shareCapital: 1200, duesPaid: 500, expectedDues: 900, monthsInArrears: 4, status: "3+ Months Arrears" },
    { id: "MEM-08", name: "Member 08", email: "member08@example.org", shareCapital: 1000, duesPaid: 900, expectedDues: 900, monthsInArrears: 0, status: "Up to Date" },
    { id: "MEM-09", name: "Member 09", email: "member09@example.org", shareCapital: 1000, duesPaid: 800, expectedDues: 900, monthsInArrears: 1, status: "1 Month Behind" },
    { id: "MEM-10", name: "Member 10", email: "member10@example.org", shareCapital: 1000, duesPaid: 600, expectedDues: 900, monthsInArrears: 3, status: "3+ Months Arrears" },
    { id: "MEM-11", name: "Member 11", email: "member11@example.org", shareCapital: 1000, duesPaid: 900, expectedDues: 900, monthsInArrears: 0, status: "Up to Date" },
    { id: "MEM-12", name: "Member 12", email: "member12@example.org", shareCapital: 1000, duesPaid: 700, expectedDues: 900, monthsInArrears: 2, status: "2 Months Behind" },
    { id: "MEM-13", name: "Member 13", email: "member13@example.org", shareCapital: 800, duesPaid: 900, expectedDues: 900, monthsInArrears: 0, status: "Up to Date" },
    { id: "MEM-14", name: "Member 14", email: "member14@example.org", shareCapital: 800, duesPaid: 550, expectedDues: 900, monthsInArrears: 3.5, status: "3+ Months Arrears" },
    { id: "MEM-15", name: "Member 15", email: "member15@example.org", shareCapital: 800, duesPaid: 800, expectedDues: 900, monthsInArrears: 1, status: "1 Month Behind" },
    { id: "MEM-16", name: "Member 16", email: "member16@example.org", shareCapital: 800, duesPaid: 900, expectedDues: 900, monthsInArrears: 0, status: "Up to Date" },
    { id: "MEM-17", name: "Member 17", email: "member17@example.org", shareCapital: 600, duesPaid: 600, expectedDues: 900, monthsInArrears: 3, status: "3+ Months Arrears" },
    { id: "MEM-18", name: "Member 18", email: "member18@example.org", shareCapital: 600, duesPaid: 900, expectedDues: 900, monthsInArrears: 0, status: "Up to Date" }
  ],

  minutes: [
    {
      id: "MIN-2026-09-11",
      meetingDate: "2026-09-11",
      meetingType: "General / Governance Review",
      chairConvener: "Governance Convener",
      attendeesSummary: "14 of 18 members present (quorum confirmed)",
      summaryNotes: "Reviewed the baseline financial ledger across all 18 members as of 11 Sep 2026, assessed monthly dues collection, and agreed on standardized arrears follow-up and documentation controls.",
      resolutionCode: "RES-2026-01",
      resolutionTitle: "Adoption of 11 Sep 2026 Baseline Ledger & 3-Month Arrears Notice Workflow",
      resolutionText: "RESOLVED that the financial baseline as of 11 September 2026 is adopted and members at or above 3 months in arrears shall receive formal reminder notices with a 14-day settlement window.",
      voteOutcome: "Carried Unanimously (14 For, 0 Against, 0 Abstain)",
      status: "Passed"
    }
  ],

  receipts: [
    {
      id: "RCP-2026-001",
      date: "2026-09-11",
      receiptRef: "GOV-ADMIN-01",
      vendor: "Portal Hosting & Governance Administration",
      category: "Governance & Admin",
      linkedProject: "Governance Portal & Ledger Rollout",
      amount: 120,
      paymentMethod: "Bank Transfer",
      recordedBy: "Governance Ledger",
      notes: "Initial administrative and documentation setup record."
    }
  ],

  projects: [
    {
      id: "PRJ-2026-01",
      name: "Property & Asset Acquisition Reserve",
      category: "Capital / Property",
      leadOwner: "Project & Finance Committee",
      targetBudget: 50000,
      spentToDate: 120,
      status: "In Progress",
      targetDate: "2027-06-30",
      description: "Ring-fenced capital accumulation and due-diligence reserve for strategic asset and property acquisition."
    },
    {
      id: "PRJ-2026-02",
      name: "Governance Portal & Financial Transparency System",
      category: "Operations & Systems",
      leadOwner: "Portal & Records Lead",
      targetBudget: 2500,
      spentToDate: 120,
      status: "Active",
      targetDate: "2026-12-15",
      description: "Modular web portal and spreadsheet synchronization for tracking capital, dues, minutes, receipts, projects, and charity contributions."
    }
  ],

  charityContributions: [
    {
      id: "CHR-2026-001",
      date: "2026-09-11",
      contributor: "Collective Member Contribution",
      initiative: "Community & Educational Support Fund",
      beneficiary: "Local Youth & Community Welfare",
      channel: "Group Allocation",
      amount: 450,
      status: "Disbursed",
      notes: "Baseline charitable contribution allocation recorded alongside 11 Sep 2026 governance review."
    }
  ]
};
