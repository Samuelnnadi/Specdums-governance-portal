// Cash Flow Forecasting Tab Renderer
window.PortalUIForecast = (function () {
  function render(container, state, summary, config, helpers) {
    const { formatCurrency, buildCashFlowForecast, escapeHtml } = helpers;
    const fmt = (n) => formatCurrency(n, config.currencySymbol);

    const monthsAhead = Number(document.getElementById("forecastMonthsInput")?.value) || 6;
    const duesPerMember = Number(document.getElementById("forecastDuesPerMemberInput")?.value) || config.defaultMonthlyDues || 100;
    const collectionRatioPct = Number(document.getElementById("forecastCollectionPctInput")?.value) || 85;
    const monthlyCharity = Number(document.getElementById("forecastCharityInput")?.value) || 150;
    const monthlyAdmin = Number(document.getElementById("forecastAdminInput")?.value) || 100;

    const forecastRows = buildCashFlowForecast(
      summary,
      Math.min(24, Math.max(1, monthsAhead)),
      duesPerMember,
      collectionRatioPct / 100,
      monthlyCharity,
      monthlyAdmin
    );

    const finalRow = forecastRows[forecastRows.length - 1];

    const rowsHtml = forecastRows
      .map(
        (r) => `
          <tr>
            <td><strong>${escapeHtml(r.label)}</strong></td>
            <td class="num-right">${fmt(r.projectedDuesInflow)}</td>
            <td class="num-right">-${fmt(r.projectedCharityOutflow)}</td>
            <td class="num-right">-${fmt(r.projectedAdminOutflow)}</td>
            <td class="num-right">${r.netMonthlyChange >= 0 ? "+" : ""}${fmt(r.netMonthlyChange)}</td>
            <td class="num-right"><strong>${fmt(r.endingCash)}</strong></td>
          </tr>
        `
      )
      .join("");

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Cash Flow Forecasting Model</h3>
            <p class="card-subtitle">Scenario projection starting from current Net Available Cash (${fmt(summary.netAvailableCash)})</p>
          </div>
          <span class="badge badge-info">Projected End Cash: ${finalRow ? fmt(finalRow.endingCash) : fmt(summary.netAvailableCash)}</span>
        </div>

        <div class="form-grid" style="margin-bottom: 16px;">
          <div class="form-group">
            <label for="forecastMonthsInput">Forecast Horizon (Months)</label>
            <input id="forecastMonthsInput" type="number" min="1" max="24" class="form-control forecast-input" value="${monthsAhead}" />
          </div>
          <div class="form-group">
            <label for="forecastDuesPerMemberInput">Monthly Dues / Member (${escapeHtml(config.currencySymbol)})</label>
            <input id="forecastDuesPerMemberInput" type="number" min="0" step="10" class="form-control forecast-input" value="${duesPerMember}" />
          </div>
          <div class="form-group">
            <label for="forecastCollectionPctInput">Expected Collection Rate (%)</label>
            <input id="forecastCollectionPctInput" type="number" min="0" max="100" step="5" class="form-control forecast-input" value="${collectionRatioPct}" />
          </div>
          <div class="form-group">
            <label for="forecastCharityInput">Monthly Charity Allocation (${escapeHtml(config.currencySymbol)})</label>
            <input id="forecastCharityInput" type="number" min="0" step="10" class="form-control forecast-input" value="${monthlyCharity}" />
          </div>
          <div class="form-group">
            <label for="forecastAdminInput">Monthly Admin / Operating Cost (${escapeHtml(config.currencySymbol)})</label>
            <input id="forecastAdminInput" type="number" min="0" step="10" class="form-control forecast-input" value="${monthlyAdmin}" />
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th class="num-right">Projected Dues Inflow</th>
                <th class="num-right">Charity Outflow</th>
                <th class="num-right">Admin Outflow</th>
                <th class="num-right">Net Monthly Cash</th>
                <th class="num-right">Projected Cash Balance</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  return { render };
})();
