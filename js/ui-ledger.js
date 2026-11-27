// ============================================================================
// 6. TAB 2: INDIVIDUAL MEMBER LEDGER (2024–2026) & PAYMENT SIMULATOR
// ============================================================================
function populateLedgerDropdown() {
    const select = document.getElementById('ledger-member-select');
    const currentVal = select.value || "1";
    select.innerHTML = members.map(m => {
        const c = computeMemberMetrics(m);
        const tag = m.status === 'exited' ? '[EXITED]' : (c.totalOwing26 > 0 ? `[Owing ${fmtGBP(c.totalOwing26)}]` : '[Up to Date]');
        return `<option value="${m.sno}">${m.sno}. ${m.name} ${tag}</option>`;
    }).join('');
    select.value = currentVal;
}

function renderIndividualLedger() {
    const sno = parseInt(document.getElementById('ledger-member-select').value, 10);
    const raw = members.find(x => x.sno === sno);
    const m = computeMemberMetrics(raw);

    document.getElementById('ledger-member-meta').innerHTML = `
        <span class="font-mono font-semibold text-slate-700">${m.whatsapp}</span>
        <span>•</span>
        <span class="${m.status === 'active' ? 'text-emerald-700 font-semibold' : 'text-slate-500 font-semibold'}">
            ${m.status === 'active' ? 'Active Member (£200/mo Capital + £10/mo Dues)' : m.exitReason}
        </span>
    `;

    document.getElementById('ledger-summary-cards').innerHTML = `
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <span class="text-xs font-semibold text-slate-500 uppercase">Cumulative Capital (24–26)</span>
            <div class="text-2xl font-extrabold font-mono text-slate-900 mt-1">${fmtGBP(m.totCapPaid)}</div>
            <span class="text-[11px] text-slate-500 mt-1 block">Incl. 2025 Levy (${fmtGBP(m.levy25)}) & 2026 One-Off (${fmtGBP(m.oneOff26)})</span>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <span class="text-xs font-semibold text-slate-500 uppercase">Cumulative Dues (24–26)</span>
            <div class="text-2xl font-extrabold font-mono text-slate-900 mt-1">${fmtGBP(m.totDuesPaid)}</div>
            <span class="text-[11px] text-slate-500 mt-1 block">2024: ${fmtGBP(m.dues24)} • 2025: ${fmtGBP(m.dues25)} • 2026: ${fmtGBP(m.dues26MonthlySum)}</span>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200 bg-emerald-50/30">
            <span class="text-xs font-semibold text-emerald-800 uppercase">Grand Total Contributed</span>
            <div class="text-2xl font-extrabold font-mono text-emerald-700 mt-1">${fmtGBP(m.grandTotalPaid)}</div>
            <span class="text-[11px] text-emerald-700 mt-1 block">Verified 3-Year Total</span>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border ${m.totalOwing26 > 0 ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200'}">
            <span class="text-xs font-semibold ${m.totalOwing26 > 0 ? 'text-rose-700' : 'text-slate-500'} uppercase">2026 Total Owing</span>
            <div class="text-2xl font-extrabold font-mono ${m.totalOwing26 > 0 ? 'text-rose-600' : 'text-slate-900'} mt-1">${fmtGBP(m.totalOwing26)}</div>
            <span class="text-[11px] ${m.totalOwing26 > 0 ? 'text-rose-700 font-semibold' : 'text-slate-500'} mt-1 block">Since: ${m.owingSince} (${m.monthsInArrears} mos)</span>
        </div>
    `;

    const rows2026 = MONTHS_2026.map((mon, idx) => {
        const capPaid = m.cap26[idx];
        const duesPaid = m.dues26[idx];
        const expCap = m.status === 'active' ? 200 : 0;
        const expDues = m.status === 'active' ? 10 : 0;
        const capVar = capPaid - expCap;
        const duesVar = duesPaid - expDues;
        const rowOwing = Math.abs(Math.min(0, capVar)) + Math.abs(Math.min(0, duesVar));

        return `
            <tr class="border-b border-slate-100 ${rowOwing > 0 ? 'bg-rose-50/40' : ''}">
                <td class="py-3 px-4 font-semibold text-slate-800">${FULL_MONTHS[idx]} 2026</td>
                <td class="py-3 px-4 text-right font-mono text-slate-500">${fmtGBP(expCap)}</td>
                <td class="py-3 px-4 text-right font-mono font-semibold ${capPaid < expCap ? 'text-rose-700' : 'text-emerald-700'}">${fmtGBP(capPaid)}</td>
                <td class="py-3 px-4 text-right font-mono text-slate-500">${fmtGBP(expDues)}</td>
                <td class="py-3 px-4 text-right font-mono font-semibold ${duesPaid < expDues ? 'text-rose-700' : 'text-emerald-700'}">${fmtGBP(duesPaid)}</td>
                <td class="py-3 px-4 text-right font-mono font-bold ${rowOwing > 0 ? 'text-rose-600' : 'text-slate-400'}">${rowOwing > 0 ? '-' + fmtGBP(rowOwing) : '£0.00'}</td>
                <td class="py-3 px-4">
                    ${m.status === 'exited'
                        ? '<span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-500">Exited</span>'
                        : (rowOwing > 0
                            ? '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700">Arrears</span>'
                            : '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">Paid</span>')}
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('ledger-statement-container').innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900">2026 Monthly Statement (January – September 2026)</h3>
                <span class="text-xs font-mono text-slate-500">2026 One-Off Contribution: ${fmtGBP(m.oneOff26)}</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                            <th class="py-3 px-4">Period</th>
                            <th class="py-3 px-4 text-right">Cap Due</th>
                            <th class="py-3 px-4 text-right">Cap Paid</th>
                            <th class="py-3 px-4 text-right">Dues Req</th>
                            <th class="py-3 px-4 text-right">Dues Paid</th>
                            <th class="py-3 px-4 text-right">Monthly Arrears</th>
                            <th class="py-3 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>${rows2026}</tbody>
                </table>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-bold text-slate-900">2024 Annual Contribution Summary</h4>
                    <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">12 Months</span>
                </div>
                <div class="space-y-2 text-xs">
                    <div class="flex justify-between py-1.5 border-b border-slate-100">
                        <span class="text-slate-600">2024 Capital Contributions Paid:</span>
                        <span class="font-mono font-bold text-slate-900">${fmtGBP(m.cap24)}</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-slate-100">
                        <span class="text-slate-600">2024 Monthly Dues Paid:</span>
                        <span class="font-mono font-bold text-slate-900">${fmtGBP(m.dues24)}</span>
                    </div>
                    <div class="flex justify-between py-1.5 font-bold text-emerald-700">
                        <span>2024 Total Verified:</span>
                        <span class="font-mono">${fmtGBP(m.cap24 + m.dues24)}</span>
                    </div>
                    ${m.sno === 17 ? '<p class="text-[11px] text-rose-600 font-semibold pt-1">* Historical Audit Note: £800.00 shortfall from Jan–Apr 2024 capital.</p>' : ''}
                </div>
            </div>

            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-bold text-slate-900">2025 Annual Contribution & Levy Summary</h4>
                    <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">12 Months + Levy</span>
                </div>
                <div class="space-y-2 text-xs">
                    <div class="flex justify-between py-1.5 border-b border-slate-100">
                        <span class="text-slate-600">2025 Monthly Capital Paid:</span>
                        <span class="font-mono font-bold text-slate-900">${fmtGBP(m.cap25)}</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-slate-100">
                        <span class="text-slate-600">2025 Special One-Off Levy (£1,000 Std):</span>
                        <span class="font-mono font-bold text-slate-900">${fmtGBP(m.levy25)}</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-slate-100">
                        <span class="text-slate-600">2025 Monthly Dues Paid:</span>
                        <span class="font-mono font-bold text-slate-900">${fmtGBP(m.dues25)}</span>
                    </div>
                    <div class="flex justify-between py-1.5 font-bold text-emerald-700">
                        <span>2025 Total Verified:</span>
                        <span class="font-mono">${fmtGBP(m.cap25 + m.levy25 + m.dues25)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function simulateMemberPayment() {
    const sno = parseInt(document.getElementById('ledger-member-select').value, 10);
    const payType = document.getElementById('sim-pay-type').value;
    const monthIdx = parseInt(document.getElementById('sim-pay-month').value, 10);

    const member = members.find(x => x.sno === sno);
    if (!member || member.status === 'exited') {
        showToast('Action Restricted', 'Cannot log new 2026 payments for an exited/archived member.', 'warning');
        return;
    }

    let addedAmount = 0;
    if (payType === 'both' || payType === 'capital') {
        const diff = Math.max(0, 200 - member.cap26[monthIdx]);
        if (diff > 0) {
            member.cap26[monthIdx] = 200;
            addedAmount += diff;
        }
    }
    if (payType === 'both' || payType === 'dues') {
        const diff = Math.max(0, 10 - member.dues26[monthIdx]);
        if (diff > 0) {
            member.dues26[monthIdx] = 10;
            addedAmount += diff;
        }
    }

    if (addedAmount === 0) {
        showToast('Already Paid', `${member.name} has already paid the selected item for ${MONTHS_2026[monthIdx]} 2026.`, 'warning');
        return;
    }

    bankBalance += addedAmount;
    refreshAllViews();
    showToast('Simulated Payment Logged', `Recorded ${fmtGBP(addedAmount)} for ${member.name} (${MONTHS_2026[monthIdx]} 2026). All KPIs & arrears recalculated.`);
}
