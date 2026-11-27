// ============================================================================
// 7. TAB 3: 3-MONTH ARREARS AUTOMATED EMAIL ENGINE
// ============================================================================
function renderEmailEngine() {
    const computed = members.map(computeMemberMetrics);
    const flagged = computed
        .filter(m => m.status === 'active' && m.isEmailEligible)
        .sort((a, b) => b.totalOwing26 - a.totalOwing26);

    const totalQueueArrears = flagged.reduce((s, m) => s + m.totalOwing26, 0);
    document.getElementById('queue-total-owing').textContent = `Total Queue Arrears: ${fmtGBP(totalQueueArrears)}`;
    document.getElementById('batch-btn-label').textContent = `Send Batch Reminders (${flagged.length} Members)`;

    if (flagged.length > 0 && !flagged.some(f => f.sno === selectedEmailMemberSno)) {
        selectedEmailMemberSno = flagged[0].sno;
    }

    const listContainer = document.getElementById('email-queue-list');
    listContainer.innerHTML = '';

    if (flagged.length === 0) {
        listContainer.innerHTML = `<div class="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold">All active members are below the 3-month arrears threshold!</div>`;
        return;
    }

    flagged.forEach((m, idx) => {
        const isSelected = m.sno === selectedEmailMemberSno;
        const sentTime = dispatchedLogs[m.sno];

        const card = document.createElement('div');
        card.className = `p-4 rounded-2xl border cursor-pointer transition ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'}`;
        card.onclick = () => {
            selectedEmailMemberSno = m.sno;
            renderEmailEngine();
        };

        card.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'}">#${idx + 1} • ${m.monthsInArrears} Mos</span>
                        <h4 class="text-sm font-bold">${m.name}</h4>
                    </div>
                    <p class="text-[11px] font-mono mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}">
                        Owing ${fmtGBP(m.totalOwing26)} (${fmtGBP(m.capOwing26)} Cap + ${fmtGBP(m.duesOwing26)} Dues)
                    </p>
                    <p class="text-[11px] mt-0.5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}">
                        Since: <strong>${m.owingSince}</strong> ${m.sno === 17 ? '(+ £800 Jan–Apr 2024 Cap)' : ''}
                    </p>
                </div>
                <div class="text-right shrink-0">
                    ${sentTime
                        ? `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✓ Sent ${sentTime}</span>`
                        : `<span class="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-semibold ${isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}">Queued</span>`}
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });

    const activeMember = flagged.find(m => m.sno === selectedEmailMemberSno) || flagged[0];
    if (activeMember) {
        const emailSlug = activeMember.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
        document.getElementById('email-preview-to').textContent = `${activeMember.name} <${emailSlug}@member.specdums.co.uk> (${activeMember.whatsapp})`;
        document.getElementById('email-preview-subject').value = `ACTION REQUIRED: SPECDUMS Limited (IGWE BU IKE) — 3+ Months Contribution Arrears Notice (${fmtGBP(activeMember.totalOwing26)})`;

        const historicalNote = activeMember.sno === 17
            ? `
• Prior Period Note: £800.00 Capital shortfall from Jan–Apr 2024 remains on record.
`
            : '';

        document.getElementById('email-preview-body').value = `Dear ${activeMember.name},

Greetings from the Treasury & Governance Committee of SPECDUMS Limited (IGWE BU IKE).

In accordance with our shareholder governance policy, automated reminders are issued when a member's monthly contributions fall three (3) or more months into arrears. Our reconciled ledger as at 11 September 2026 indicates the following outstanding balance on your account:

------------------------------------------------------------------
MEMBER ARREARS SUMMARY (AS AT 11 SEPTEMBER 2026)
------------------------------------------------------------------
• Member Name:           ${activeMember.name}
• Arrears Commenced:     ${activeMember.owingSince} (${activeMember.monthsInArrears} months in arrears)
• 2026 Capital Owing:    ${fmtGBP(activeMember.capOwing26)} (Standard: £200.00/month)
• 2026 Monthly Dues:     ${fmtGBP(activeMember.duesOwing26)} (Standard: £10.00/month)
• TOTAL 2026 ARREARS:    ${fmtGBP(activeMember.totalOwing26)}
------------------------------------------------------------------${historicalNote}
Please arrange settlement of your outstanding arrears at your earliest convenience via direct transfer to the company bank account:

• Account Name:          SPECDUMS Limited
• Bank:                  Metro Bank UK
• Account Number:        53894909
• Payment Reference:     ${activeMember.name.split(' ').slice(-1)[0].toUpperCase()}-ARREARS26

If you have already made a recent transfer after 11 September 2026, kindly share your payment receipt on the executive WhatsApp line so the ledger can be updated immediately.

Thank you for your continued commitment to IGWE BU IKE.

Warm regards,

Treasury & Financial Governance Office
SPECDUMS Limited (IGWE BU IKE)`;

        const statusEl = document.getElementById('email-dispatch-status');
        if (dispatchedLogs[activeMember.sno]) {
            statusEl.innerHTML = `<span class="text-emerald-700 font-semibold">✓ Simulated email dispatched at ${dispatchedLogs[activeMember.sno]}</span>`;
        } else {
            statusEl.textContent = `Status: Ready for simulated SMTP dispatch to ${activeMember.name}`;
        }
    }
}

function sendSingleReminder() {
    const raw = members.find(x => x.sno === selectedEmailMemberSno);
    if (!raw) return;
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    dispatchedLogs[raw.sno] = now;
    renderEmailEngine();
    showToast('Reminder Dispatched (Demo)', `Automated 3-month arrears notice logged for ${raw.name} at ${now}.`);
}

function sendBatchReminders() {
    const computed = members.map(computeMemberMetrics);
    const flagged = computed.filter(m => m.status === 'active' && m.isEmailEligible);
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    flagged.forEach(m => {
        dispatchedLogs[m.sno] = now;
    });

    renderEmailEngine();
    showToast('Batch Dispatch Complete (Demo)', `Sent ${flagged.length} automated arrears reminders simultaneously at ${now}.`);
}

function copyEmailBody() {
    const textarea = document.getElementById('email-preview-body');
    navigator.clipboard?.writeText(textarea.value).catch(() => {
        textarea.select();
        document.execCommand('copy');
    });
    showToast('Copied to Clipboard', 'Email template copied for pasting into your mail client.');
}
