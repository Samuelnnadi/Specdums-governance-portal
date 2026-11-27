// Executive Overview Tab Renderer
window.PortalUIOverview = (function () {
  function render(container, state, summary, config, helpers) {
    const { formatCurrency, escapeHtml } = helpers;
    const fmt = (n) => formatCurrency(n, config.currencySymbol);

    const projectProgressPct =
      summary.totalProjectBudget > 0
        ? Math.min(100, Math.round((summary.totalProjectSpend / summary.totalProjectBudget) * 100))
        : 0;

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Share Capital (18 Members)</div>
          <div class="kpi-value">${fmt(summary.totalShareCapital)}</div>
          <div class="kpi-sub">Baseline as of ${escapeHtml(config.baselineLabel)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Monthly Dues Collected</div>
          <div class="kpi-value">${fmt(summary.totalDuesPaid)}</div>
          <div class="kpi-sub">${summary.collectionRate.toFixed(1)}% of ${fmt(summary.totalExpectedDues)} expected</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Outstanding Dues Arrears</div>
          <div class="kpi-value">${fmt(summary.totalArrears)}</div>
          <div class="kpi-sub">${summary.threeMonthArrearsCount} member(s) at 3+ months arrears</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Net Available Cash</div>
          <div class="kpi-value">${fmt(summary.netAvailableCash)}</div>
          <div class="kpi-sub">After ${fmt(summary.totalReceipts)} receipts &amp; ${fmt(summary.totalCharity)} charity</div>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: 20px;">
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div>
              <h3 class="card-title">Minutes &amp; Resolutions</h3>
              <p class="card-subtitle">Governance record log</p>
            </div>
            <span class="badge badge-info">${summary.minutesCount} Record(s)</span>
          </div>
          <p class="kpi-sub" style="margin: 0 0 12px 0;">
            <strong>${summary.resolutionsCount}</strong> formal resolution(s) logged across recorded meetings.
          </p>
          <button type="button" class="btn btn-secondary btn-sm" data-jump-tab="minutes">Open Minutes &amp; Resolutions</button>
        </div>

        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div>
              <h3 class="card-title">Receipts &amp; Projects</h3>
              <p class="card-subtitle">Expense vouchers &amp; initiatives</p>
            </div>
            <span class="badge badge-neutral">${summary.projectsCount} Project(s)</span>
          </div>
          <p class="kpi-sub" style="margin: 0 0 8px 0;">
            Receipts Logged: <strong>${fmt(summary.totalReceipts)}</strong> (${(state.receipts || []).length} voucher(s))<br />
            Project Spend: <strong>${fmt(summary.totalProjectSpend)}</strong> / ${fmt(summary.totalProjectBudget)} budget
          </p>
          <div class="progress-track" style="margin-bottom: 12px;">
            <div class="progress-fill ${projectProgressPct >= 100 ? "complete" : ""}" style="width: ${projectProgressPct}%;"></div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" data-jump-tab="receipts-projects">Open Receipts &amp; Projects</button>
        </div>

        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div>
              <h3 class="card-title">Charity Contributions</h3>
              <p class="card-subtitle">Community &amp; welfare giving</p>
            </div>
            <span class="badge badge-success">${summary.charityCount} Entry(ies)</span>
          </div>
          <p class="kpi-sub" style="margin: 0 0 12px 0;">
            Total Charity Recorded: <strong>${fmt(summary.totalCharity)}</strong>
          </p>
          <button type="button" class="btn btn-secondary btn-sm" data-jump-tab="charity">Open Charity Contributions</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Governance &amp; Privacy Summary</h3>
            <p class="card-subtitle">Public summary metrics vs. protected individual member records</p>
          </div>
        </div>
        <p style="margin: 0 0 10px 0; color: var(--text-secondary);">
          This portal presents aggregate financial figures for <strong>${escapeHtml(config.companyName)}</strong> based on the
          <strong>${escapeHtml(config.baselineLabel)}</strong> baseline of <strong>${summary.totalMembers}</strong> members
          (<strong>${summary.upToDateCount}</strong> up to date).
        </p>
        <p style="margin: 0; color: var(--text-secondary);">
          Individual member names, contribution amounts, and arrears balances are
          ${config.restrictIndividualMemberData ? "protected unless unlocked via Member/Governance Access." : "visible in member mode."}
        </p>
      </div>
    `;
  }

  return { render };
})();
