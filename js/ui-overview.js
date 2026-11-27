// ============================================================================
// 5. TAB 1: EXECUTIVE OVERVIEW & PUBLIC ARREARS DIRECTORY
// ============================================================================
function updateOverviewKPIs() {
    const computed = members.map(computeMemberMetrics);
    const active = computed.filter(m => m.status === 'active');

    const initialActive = INITIAL_MEMBERS.map(computeMemberMetrics).filter(m => m.status === 'active');
    const initialCapSum = initialActive.reduce((s, m) => s + m.cap26MonthlySum, 0);
    const initialDuesSum = initialActive.reduce((s, m) => s + m.dues26MonthlySum, 0);

    const currentCapSum = active.reduce((s, m) => s + m.cap26MonthlySum, 0);
    const currentDuesSum = active.reduce((s, m) => s + m.dues26MonthlySum, 0);

    const addedCap = currentCapSum - initialCapSum;
    const addedDues = currentDuesSum - initialDuesSum;

    const verifiedCap26 = 20350.00 + addedCap;
    const verifiedDues26 = 1050.00 + addedDues;
    const verifiedTotal26 = verifiedCap26 + verifiedDues26;
    const expectedTotal26 = 28350.00;
    const rate = ((verifiedTotal26 / expectedTotal26) * 100).toFixed(1);

    const capArrears = active.reduce((s, m) => s + m.capOwing26, 0);
    const duesArrears = active.reduce((s, m) => s + m.duesOwing26, 0);
    const totArrears = capArrears + duesArrears;
    const flaggedCount = active.filter(m => m.isEmailEligible).length;

    document.getElementById('kpi-active-members').textContent = active.length;
    document.getElementById('kpi-bank-balance').textContent = fmtGBP(bankBalance);
    document.getElementById('kpi-ytd-collected').textContent = fmtGBP(verifiedTotal26);
    document.getElementById('kpi-collection-rate').textContent = `${rate}%`;
    document.getElementById('kpi-progress-bar').style.width = `${Math.min(100, rate)}%`;
    document.getElementById('kpi-ytd-breakdown').textContent = `${fmtGBP(verifiedCap26)} Cap + ${fmtGBP(verifiedDues26)} Dues (of £28,350.00 exp.)`;

    document.getElementById('kpi-total-arrears').textContent = fmtGBP(totArrears);
    document.getElementById('kpi-flagged-count').textContent = `${flaggedCount} Flagged (3+ Mo)`;
    document.getElementById('kpi-arrears-split').textContent = `${fmtGBP(capArrears)} Cap + ${fmtGBP(duesArrears)} Dues`;
    document.getElementById('nav-email-badge').textContent = flaggedCount;
}

function setDirectoryFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-pill').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('ring-2', 'ring-offset-1', 'ring-slate-900');
        } else {
            btn.classList.remove('ring-2', 'ring-offset-1', 'ring-slate-900');
        }
    });
    renderDirectoryTable();
}

function renderDirectoryTable() {
    const search = document.getElementById('directory-search').value.toLowerCase().trim();
    const computed = members.map(computeMemberMetrics);

    const filtered = computed.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search) || m.whatsapp.toLowerCase().includes(search);
        if (!matchesSearch) return false;

        if (currentFilter === 'severe') return m.status === 'active' && m.monthsInArrears >= 3;
        if (currentFilter === 'moderate') return m.status === 'active' && m.monthsInArrears > 0 && m.monthsInArrears < 3;
        if (currentFilter === 'exited') return m.status === 'exited';
        return true;
    });

    const tbody = document.getElementById('directory-tbody');
    tbody.innerHTML = '';

    let sumCapPaid = 0, sumDuesPaid = 0, sumGrandPaid = 0, sumCapOwing = 0, sumDuesOwing = 0, sumTotOwing = 0;

    filtered.forEach(m => {
        sumCapPaid += m.totCapPaid;
        sumDuesPaid += m.totDuesPaid;
        sumGrandPaid += m.grandTotalPaid;
        sumCapOwing += m.capOwing26;
        sumDuesOwing += m.duesOwing26;
        sumTotOwing += m.totalOwing26;

        let statusBadge = '';
        if (m.status === 'exited') {
            statusBadge = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Exited / Archived</span>`;
        } else if (m.monthsInArrears >= 3) {
            statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                3-Mo Email Alert Eligible (${m.monthsInArrears}m)
            </span>`;
        } else if (m.monthsInArrears > 0) {
            statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Owing ${m.monthsInArrears} Mo${m.monthsInArrears > 1 ? 's' : ''}
            </span>`;
        } else {
            statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Up to Date
            </span>`;
        }

        const tr = document.createElement('tr');
        tr.className = `hover:bg-slate-50/90 cursor-pointer transition ${m.status === 'exited' ? 'bg-slate-50/40 text-slate-500' : ''}`;
        tr.onclick = () => openMemberModal(m.sno);

        tr.innerHTML = `
            <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                    <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">${m.sno}</span>
                    <div>
                        <div class="font-bold text-slate-900">${m.name}</div>
                        <div class="text-[11px] font-mono text-slate-400">${m.whatsapp}</div>
                    </div>
                </div>
            </td>
            <td class="py-3.5 px-3 font-mono text-slate-600">${m.status === 'active' ? '£210/mo' : '—'}</td>
            <td class="py-3.5 px-3 text-right font-mono font-medium text-slate-700">${fmtGBP(m.totCapPaid)}</td>
            <td class="py-3.5 px-3 text-right font-mono font-medium text-slate-700">${fmtGBP(m.totDuesPaid)}</td>
            <td class="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">${fmtGBP(m.grandTotalPaid)}</td>
            <td class="py-3.5 px-3 text-right font-mono bg-rose-50/30 ${m.capOwing26 > 0 ? 'text-rose-700 font-semibold' : 'text-slate-400'}">${fmtGBP(m.capOwing26)}</td>
            <td class="py-3.5 px-3 text-right font-mono bg-rose-50/30 ${m.duesOwing26 > 0 ? 'text-rose-700 font-semibold' : 'text-slate-400'}">${fmtGBP(m.duesOwing26)}</td>
            <td class="py-3.5 px-3 text-right font-mono bg-rose-50/50 ${m.totalOwing26 > 0 ? 'text-rose-700 font-extrabold' : 'text-slate-400'}">${fmtGBP(m.totalOwing26)}</td>
            <td class="py-3.5 px-3">
                <div class="font-semibold text-slate-800">${m.owingSince}</div>
                ${m.note ? `<div class="text-[10px] text-rose-600 font-medium max-w-[150px] truncate" title="${m.note}">${m.note}</div>` : ''}
            </td>
            <td class="py-3.5 px-4">${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('directory-tfoot').innerHTML = `
        <tr>
            <td class="py-3.5 px-4" colspan="2">FILTERED VIEW TOTAL (${filtered.length} Members)</td>
            <td class="py-3.5 px-3 text-right font-mono">${fmtGBP(sumCapPaid)}</td>
            <td class="py-3.5 px-3 text-right font-mono">${fmtGBP(sumDuesPaid)}</td>
            <td class="py-3.5 px-3 text-right font-mono text-emerald-400">${fmtGBP(sumGrandPaid)}</td>
            <td class="py-3.5 px-3 text-right font-mono text-rose-300">${fmtGBP(sumCapOwing)}</td>
            <td class="py-3.5 px-3 text-right font-mono text-rose-300">${fmtGBP(sumDuesOwing)}</td>
            <td class="py-3.5 px-3 text-right font-mono text-rose-400 font-extrabold">${fmtGBP(sumTotOwing)}</td>
            <td class="py-3.5 px-4" colspan="2"></td>
        </tr>
    `;
}

function openMemberModal(sno) {
    const raw = members.find(x => x.sno === sno);
    const m = computeMemberMetrics(raw);

    document.getElementById('modal-member-name').textContent = `${m.sno}. ${m.name}`;
    document.getElementById('modal-member-sub').textContent = `WhatsApp: ${m.whatsapp} • ${m.status === 'active' ? 'Active Shareholder (£200 Cap + £10 Dues/mo)' : m.exitReason}`;

    const modalLedgerBtn = document.getElementById('modal-ledger-btn');
    modalLedgerBtn.onclick = () => {
        closeMemberModal();
        document.getElementById('ledger-member-select').value = m.sno;
        renderIndividualLedger();
        switchTab('ledger');
    };

    const modalEmailBtn = document.getElementById('modal-email-btn');
    if (m.isEmailEligible) {
        modalEmailBtn.classList.remove('hidden');
        modalEmailBtn.onclick = () => {
            closeMemberModal();
            selectedEmailMemberSno = m.sno;
            renderEmailEngine();
            switchTab('emails');
        };
    } else {
        modalEmailBtn.classList.add('hidden');
    }

    const monthCells = MONTHS_2026.map((mon, idx) => {
        const c = m.cap26[idx];
        const d = m.dues26[idx];
        const isShort = m.status === 'active' && (c < 200 || d < 10);
        return `
            <div class="p-2.5 rounded-xl border ${isShort ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50/50 border-emerald-200'} text-center">
                <div class="font-bold text-slate-700 mb-1">${mon} 26</div>
                <div class="font-mono text-[11px] ${c < 200 && m.status === 'active' ? 'text-rose-700 font-bold' : 'text-emerald-700'}">Cap: £${c}</div>
                <div class="font-mono text-[11px] ${d < 10 && m.status === 'active' ? 'text-rose-700 font-bold' : 'text-slate-600'}">Due: £${d}</div>
            </div>
        `;
    }).join('');

    document.getElementById('modal-body').innerHTML = `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span class="text-[11px] text-slate-500 block">2024–2026 Total Paid</span>
                <span class="text-base font-extrabold font-mono text-emerald-700">${fmtGBP(m.grandTotalPaid)}</span>
            </div>
            <div class="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span class="text-[11px] text-rose-700 block">2026 Total Owing</span>
                <span class="text-base font-extrabold font-mono text-rose-700">${fmtGBP(m.totalOwing26)}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span class="text-[11px] text-slate-500 block">Owing Since</span>
                <span class="text-sm font-bold text-slate-900">${m.owingSince}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span class="text-[11px] text-slate-500 block">2026 Months in Arrears</span>
                <span class="text-sm font-bold text-slate-900">${m.monthsInArrears} Month(s)</span>
            </div>
        </div>

        ${m.note ? `<div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium">Note: ${m.note}</div>` : ''}

        <div>
            <h4 class="font-bold text-slate-800 mb-2">2026 Month-by-Month Payment Grid (Jan – Sep 2026)</h4>
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                ${monthCells}
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div class="font-bold text-slate-800 mb-1">2024 Historical Contributions</div>
                <div class="flex justify-between"><span>Capital Paid (2024):</span><span class="font-mono font-semibold">${fmtGBP(m.cap24)}</span></div>
                <div class="flex justify-between"><span>Monthly Dues Paid (2024):</span><span class="font-mono font-semibold">${fmtGBP(m.dues24)}</span></div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div class="font-bold text-slate-800 mb-1">2025 Historical + 2026 One-Offs</div>
                <div class="flex justify-between"><span>2025 Capital + £1k Levy:</span><span class="font-mono font-semibold">${fmtGBP(m.cap25 + m.levy25)}</span></div>
                <div class="flex justify-between"><span>2025 Dues / 2026 One-Off:</span><span class="font-mono font-semibold">${fmtGBP(m.dues25)} / ${fmtGBP(m.oneOff26)}</span></div>
            </div>
        </div>
    `;

    document.getElementById('member-modal').classList.remove('hidden');
}

function closeMemberModal() {
    document.getElementById('member-modal').classList.add('hidden');
}

function exportPublicBoardCSV() {
    const computed = members.map(computeMemberMetrics);
    const headers = ['S/No', 'Member Name', 'WhatsApp', 'Status', '24-26 Cap Paid', '24-26 Dues Paid', 'Grand Total Paid', '2026 Cap Owing', '2026 Dues Owing', 'Total 2026 Owing', 'Owing Since'];
    const rows = computed.map(m => [
        m.sno, `"${m.name}"`, `"${m.whatsapp}"`, m.status,
        m.totCapPaid.toFixed(2), m.totDuesPaid.toFixed(2), m.grandTotalPaid.toFixed(2),
        m.capOwing26.toFixed(2), m.duesOwing26.toFixed(2), m.totalOwing26.toFixed(2), `"${m.owingSince}"`
    ].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('
')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'SPECDUMS_Governance_Ledger_2026.csv';
    link.click();
    showToast('CSV Exported', 'Downloaded SPECDUMS_Governance_Ledger_2026.csv.');
}
