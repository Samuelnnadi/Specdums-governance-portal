// ============================================================================
// 8. TAB 4: CONTRIBUTION & CASH FLOW FORECASTING SIMULATOR
// ============================================================================
function updateForecast() {
    const ratePct = parseFloat(document.getElementById('slider-collection-rate').value) || 75.5;
    const recoveryPct = parseFloat(document.getElementById('slider-recovery-rate').value) || 50;
    const activeCount = parseInt(document.getElementById('slider-active-members').value, 10) || 15;
    const capRate = parseFloat(document.getElementById('input-cap-rate').value) || 200;
    const duesRate = parseFloat(document.getElementById('input-dues-rate').value) || 10;

    const computed = members.map(computeMemberMetrics);
    const currentArrears = computed.filter(m => m.status === 'active').reduce((s, m) => s + m.totalOwing26, 0);
    const recoveredCash = currentArrears * (recoveryPct / 100);

    const monthlyFull = activeCount * (capRate + duesRate);
    const monthlyModeled = monthlyFull * (ratePct / 100);

    const q4Inflows = monthlyModeled * 3;
    const q4Total = q4Inflows + recoveredCash;
    const y2027Full = monthlyFull * 12;
    const y2027Total = monthlyModeled * 12;
    const projectedEndCash = bankBalance + q4Total + y2027Total;

    document.getElementById('val-collection-rate').textContent = `${ratePct.toFixed(1)}%`;
    document.getElementById('val-recovery-rate').textContent = `${recoveryPct}% (${fmtGBP(recoveredCash)})`;
    document.getElementById('val-active-members').textContent = `${activeCount} Members`;

    document.getElementById('fc-q4-total').textContent = fmtGBP(q4Total);
    document.getElementById('fc-q4-sub').textContent = `${fmtGBP(q4Inflows)} Q4 run-rate + ${fmtGBP(recoveredCash)} recovery`;
    document.getElementById('fc-2027-total').textContent = fmtGBP(y2027Total);
    document.getElementById('fc-2027-sub').textContent = `vs ${fmtGBP(y2027Full)} at 100% collection`;
    document.getElementById('fc-bank-end').textContent = fmtGBP(projectedEndCash);

    const labels = ['Q4 2026', 'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027'];
    const modeledSeries = [q4Total, monthlyModeled * 3, monthlyModeled * 3, monthlyModeled * 3, monthlyModeled * 3];
    const targetSeries = [monthlyFull * 3 + currentArrears, monthlyFull * 3, monthlyFull * 3, monthlyFull * 3, monthlyFull * 3];
    let running = bankBalance;
    const cumulativeSeries = modeledSeries.map(v => {
        running += v;
        return Number(running.toFixed(2));
    });

    const canvas = document.getElementById('forecastChart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (forecastChartInstance) forecastChartInstance.destroy();

    forecastChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Modeled Quarterly Inflow (£)', data: modeledSeries, backgroundColor: '#059669', borderRadius: 6 },
                { label: '100% Target Potential (£)', data: targetSeries, backgroundColor: '#cbd5e1', borderRadius: 6 },
                { label: 'Cumulative Bank Reserve (£)', data: cumulativeSeries, type: 'line', borderColor: '#0F172A', backgroundColor: '#0F172A', tension: 0.3, yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true },
                y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });
}

function resetForecastSliders() {
    document.getElementById('slider-collection-rate').value = 75.485;
    document.getElementById('slider-recovery-rate').value = 50;
    document.getElementById('slider-active-members').value = 15;
    document.getElementById('input-cap-rate').value = 200;
    document.getElementById('input-dues-rate').value = 10;
    updateForecast();
}
