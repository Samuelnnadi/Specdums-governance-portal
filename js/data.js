// ============================================================================
// 2. VERIFIED BASELINE AUDIT DATA (AS AT 11 SEPTEMBER 2026)
// ============================================================================
const INITIAL_MEMBERS = [
    {
        sno: 1, name: "Mr Donatus Sunday Otuekere", whatsapp: "+33 652865959", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 150, 0, 0], oneOff26: 401.34,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 0, 0, 0],
        note: ""
    },
    {
        sno: 2, name: "Mr Elias Ngene Barnabas", whatsapp: "+44 7825882216", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 200, 0, 0], oneOff26: 400.00,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 0, 0],
        note: ""
    },
    {
        sno: 3, name: "Mr Chidubem Stanley Nwadike", whatsapp: "+44 7585528918", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 200, 200, 100], oneOff26: 100.00,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 10, 0],
        note: ""
    },
    {
        sno: 4, name: "Mr Nwabueze Odimokwu", whatsapp: "+234 8167749308", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 200, 0, 0], oneOff26: 127.65,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 0, 0],
        note: ""
    },
    {
        sno: 5, name: "Mr Emmanuel Iwuamadi", whatsapp: "+44 7448 697160", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 200, 200, 100], oneOff26: 1000.00,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 10, 0],
        note: ""
    },
    {
        sno: 6, name: "Mr Peter Udoka Obialor", whatsapp: "+44 7988383161", status: "exited",
        exitReason: "Exited (Share Transfer Aug 2026 - £3,200.00)",
        cap24: 2400, cap25: 1600, levy25: 0,
        cap26: [0, 0, 0, 0, 0, 0, 0, 0, 0], oneOff26: 0,
        dues24: 120, dues25: 80, dues26: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        note: "Exited via Share Transfer (11 Aug 2026)"
    },
    {
        sno: 7, name: "Dr Sabinus Okorocha", whatsapp: "+234 8063815132", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 200, 200, 0], oneOff26: 500.00,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 10, 0],
        note: ""
    },
    {
        sno: 8, name: "Mr James Chidi Otum", whatsapp: "+234 8039180423", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 0, 0, 0], oneOff26: 0,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 0, 0],
        note: ""
    },
    {
        sno: 9, name: "Dr Uchenna Chidi Anyanwagu", whatsapp: "N/A", status: "exited",
        exitReason: "Exited (Reimbursed 2024 - £1,000.00 Cap + £10.00 Dues)",
        cap24: 1000, cap25: 0, levy25: 0,
        cap26: [0, 0, 0, 0, 0, 0, 0, 0, 0], oneOff26: 0,
        dues24: 50, dues25: 0, dues26: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        note: "Exited & Reimbursed in 2024"
    },
    {
        sno: 10, name: "Mr Moses Eziefule", whatsapp: "+44 7853112945", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 200, 0, 0], oneOff26: 0,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 0, 0],
        note: ""
    },
    {
        sno: 11, name: "Mr Chukwudi Onyema Ajoku", whatsapp: "+234 7038036578", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 100, 0, 0], oneOff26: 0,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 0, 0, 0, 0, 0],
        note: ""
    },
    {
        sno: 12, name: "Mr Anthony Chiagozie Onyemefolu", whatsapp: "+44 7704538798", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 200, 200, 0], oneOff26: 0,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 0, 0, 0, 0],
        note: ""
    },
    {
        sno: 13, name: "Mr Afam Enwereson", whatsapp: "+44 7930748889", status: "exited",
        exitReason: "Exited (Reimbursed 2025 - £2,300 + £600 Cap + £10 Dues)",
        cap24: 2300, cap25: 600, levy25: 0,
        cap26: [0, 0, 0, 0, 0, 0, 0, 0, 0], oneOff26: 0,
        dues24: 120, dues25: 20, dues26: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        note: "Exited & Reimbursed in 2025"
    },
    {
        sno: 14, name: "Mr Anthony Olii", whatsapp: "+44 7983219491", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 200, 0, 0], oneOff26: 400.00,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 10, 0],
        note: ""
    },
    {
        sno: 15, name: "Mr Ugochukwu Maduabuchi", whatsapp: "+44 7305456802", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 200, 200, 0], oneOff26: 0,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 10, 0],
        note: ""
    },
    {
        sno: 16, name: "Mr Samuel Chukwuemeka Nnadi", whatsapp: "+44 7931198699", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 200, 200, 0, 0, 0], oneOff26: 0,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 10, 10],
        note: ""
    },
    {
        sno: 17, name: "Mr Somtobenna Jideekene Okeke", whatsapp: "+44 7727007792", status: "active",
        cap24: 1600, cap25: 2400, levy25: 1000,
        cap26: [0, 0, 0, 0, 0, 0, 0, 0, 0], oneOff26: 6.90,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 0, 0, 0],
        note: "Also carries £800.00 Jan–Apr 2024 capital shortfall"
    },
    {
        sno: 18, name: "Mr Kingsley Nnaemeka Azuka", whatsapp: "+1(929) 5226930", status: "active",
        cap24: 2400, cap25: 2400, levy25: 1000,
        cap26: [200, 200, 200, 200, 100, 200, 200, 200, 0], oneOff26: 9.25,
        dues24: 120, dues25: 120, dues26: [10, 10, 10, 10, 10, 10, 10, 0, 0],
        note: ""
    }
];

// Global Mutable Application State
let members = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
let bankBalance = 5075.13;
let currentFilter = 'all';
let selectedEmailMemberSno = 17;
let dispatchedLogs = {};
let forecastChartInstance = null;
let autoRefreshTimer = null;
let isLiveSheetConnected = false;
