// Charity Contributions Tab Renderer
window.PortalUICharity = (function () {
  function render(container, state, summary, config, isUnlocked, helpers) {
    const { formatCurrency, escapeHtml } = helpers;
    const fmt = (n) => formatCurrency(n, config.currencySymbol);
    const items = Array.isArray(state.charityContributions) ? state.charityContributions : [];
    const todayStr = new Date().toISOString().slice(0, 10);

    const canViewContributors = !config.restrictIndividualMemberData || isUnlocked;

    const rowsHtml = items
      .map((c, idx) => {
        const contributorLabel = canViewContributors
          ? c.contributor || "Member / Group"
          : c.contributor && c.contributor.toLowerCase().includes("collective")
          ? c.contributor
          : `Contributor #${String(idx + 1).padStart(2, "0")}`;

        return `
          <tr>
            <td>${escapeHtml(c.date || "")}</td>
            <td><strong>${escapeHtml(contributorLabel)}</strong></td>
            <td>${escapeHtml(c.initiative || "")}</td>
            <td>${escapeHtml(c.beneficiary || "")}</td>
            <td><span class="badge badge-success">${escapeHtml(c.status || "Recorded")}</span></td>
            <td class="num-right"><strong>${fmt(c.amount)}</strong></td>
            <td class="no-print">
              <button type="button" class="btn btn-secondary btn-sm" data-delete-charity="${escapeHtml(c.id)}">Remove</button>
            </td>
          </tr>
        `;
      })
      .join("");

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Charity Contributions</div>
          <div class="kpi-value">${fmt(summary.totalCharity)}</div>
          <div class="kpi-sub">Across ${items.length} recorded contribution(s)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Latest Contribution</div>
          <div class="kpi-value">${items.length ? fmt(items[items.length - 1].amount) : fmt(0)}</div>
          <div class="kpi-sub">${items.length ? escapeHtml(items[items.length - 1].initiative || "") : "No entries yet"}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Add Charity Contribution</h3>
              <p class="card-subtitle">Record charitable donations, community relief, and welfare allocations</p>
            </div>
          </div>

          <form id="addCharityForm">
            <div class="form-grid">
              <div class="form-group">
                <label for="chrDate">Contribution Date</label>
                <input id="chrDate" name="date" type="date" class="form-control" value="${todayStr}" required />
              </div>
              <div class="form-group">
                <label for="chrAmount">Amount (${escapeHtml(config.currencySymbol)})</label>
                <input id="chrAmount" name="amount" type="number" step="0.01" min="0.01" class="form-control" placeholder="0.00" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="chrContributor">Contributor / Source</label>
                <input id="chrContributor" name="contributor" type="text" class="form-control" placeholder="e.g. Collective Member Contribution or Member Name" required />
              </div>
              <div class="form-group">
                <label for="chrInitiative">Charity / Cause / Initiative</label>
                <input id="chrInitiative" name="initiative" type="text" class="form-control" placeholder="e.g. Back-to-School Support / Community Welfare" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="chrBeneficiary">Beneficiary / Recipient</label>
                <input id="chrBeneficiary" name="beneficiary" type="text" class="form-control" placeholder="e.g. Community / School / Charity Name" />
              </div>
              <div class="form-group">
                <label for="chrStatus">Status</label>
                <select id="chrStatus" name="status" class="form-select">
                  <option value="Disbursed">Disbursed</option>
                  <option value="Pledged">Pledged</option>
                  <option value="Pending Transfer">Pending Transfer</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="chrNotes">Notes</label>
              <input id="chrNotes" name="notes" type="text" class="form-control" placeholder="Reference or purpose notes..." />
            </div>

            <button type="submit" class="btn btn-primary">Add Charity Contribution</button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Charity Contributions Log</h3>
              <p class="card-subtitle">Transparent ledger of charitable support and donations</p>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Contributor</th>
                  <th>Initiative</th>
                  <th>Beneficiary</th>
                  <th>Status</th>
                  <th class="num-right">Amount</th>
                  <th class="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                ${
                  rowsHtml ||
                  `<tr><td colspan="7" class="empty-state">No charity contributions recorded yet.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  return { render };
})();
