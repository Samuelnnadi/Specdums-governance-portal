// ============================================================================
// 3. FINANCIAL CALCULATIONS & FORMATTING HELPERS
// ============================================================================
function fmtGBP(num) {
    return '£' + Number(num).toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function computeMemberMetrics(m) {
    const cap26MonthlySum = m.cap26.reduce((a, b) => a + b, 0);
    const dues26MonthlySum = m.dues26.reduce((a, b) => a + b, 0);

    const totCapPaid = m.cap24 + m.cap25 + m.levy25 + cap26MonthlySum + m.oneOff26;
    const totDuesPaid = m.dues24 + m.dues25 + dues26MonthlySum;
    const grandTotalPaid = totCapPaid + totDuesPaid;

    if (m.status === 'exited') {
        return {
            ...m,
            cap26MonthlySum,
            dues26MonthlySum,
            totCapPaid,
            totDuesPaid,
            grandTotalPaid,
            capOwing26: 0,
            duesOwing26: 0,
            totalOwing26: 0,
            monthsInArrears: 0,
            owingSince: 'N/A (Exited)',
            isEmailEligible: false
        };
    }

    const capOwing26 = Math.max(0, 1800 - cap26MonthlySum);
    const duesOwing26 = Math.max(0, 90 - dues26MonthlySum);
    const totalOwing26 = capOwing26 + duesOwing26;

    let monthsInArrears = 0;
    let firstOwingIdx = -1;
    for (let i = 0; i < 9; i++) {
        if (m.cap26[i] < 200 || m.dues26[i] < 10) {
            monthsInArrears++;
            if (firstOwingIdx === -1) firstOwingIdx = i;
        }
    }

    const owingSince = firstOwingIdx !== -1 ? `${MONTHS_2026[firstOwingIdx]} 2026` : 'Up to Date';
    const isEmailEligible = monthsInArrears >= 3;

    return {
        ...m,
        cap26MonthlySum,
        dues26MonthlySum,
        totCapPaid,
        totDuesPaid,
        grandTotalPaid,
        capOwing26,
        duesOwing26,
        totalOwing26,
        monthsInArrears,
        owingSince,
        isEmailEligible
    };
}
