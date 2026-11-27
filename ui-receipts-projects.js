// Receipts & Projects Tab Renderer
window.PortalUIReceiptsProjects = (function () {
  function render(container, state, summary, config, helpers) {
    const { formatCurrency, escapeHtml } = helpers;
    const fmt = (n) => formatCurrency(n, config.currencySymbol);
    const receipts = Array.isArray(state.receipts) ? state.receipts : [];
    const projects = Array.isArray(state.projects) ? state.projects : [];
    const todayStr = new Date().toISOString().slice(0, 10);

    const receiptRows = receipts
      .map(
        (r) => `
          <tr>
            <td>${escapeHtml(r.date || "")}</td>
            <td><strong>${escapeHtml(r.receiptRef || r.id || "")}</strong></td>
            <td>${escapeHtml(r.vendor || "")}</td>
            <td><span class="badge badge-neutral">${escapeHtml(r.category || "General")}</span></td>
            <td>${escapeHtml(r.linkedProject || "-")}</td>
            <td class="num-right"><strong>${fmt(r.amount)}</strong></td>
            <td class="no-print">
              <button type="button" class="btn btn-secondary btn-sm" data-delete-receipt="${escapeHtml(r.id)}">Delete</button>
            </td>
          </tr>
        `
      )
      .join("");

    const projectCards = projects
      .map((p) => {
        const budget = Number(p.targetBudget) || 0;
        const spent = Number(p.spentToDate) || 0;
        const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
        const badgeClass =
          p.status === "Completed" ? "badge-success" : p.status === "Active" || p.status === "In Progress" ? "badge-info" : "badge-warning";

        return `
          <div class="record-item">
            <div class="record-item-header">
              <div>
                <h4 class="record-item-title">${escapeHtml(p.name)}</h4>
                <div class="record-meta">
                  Category: ${escapeHtml(p.category || "Project")} · Lead: ${escapeHtml(p.leadOwner || "Committee")} · Target Date: ${escapeHtml(p.targetDate || "TBD")}
                </div>
              </div>
              <div class="toolbar-group no-print">
                <span class="badge ${badgeClass}">${escapeHtml(p.status || "Active")}</span>
                <button type="button" class="btn btn-secondary btn-sm" data-delete-project="${escapeHtml(p.id)}">Remove</button>
              </div>
            </div>
            ${p.description ? `<p style="margin: 6px 0 10px 0; color: var(--text-secondary);">${escapeHtml(p.description)}</p>` : ""}
            <div style="display: flex; justify-content: space-between; font-size: 12.5px;">
              <span>Spent: <strong>${fmt(spent)}</strong></span>
              <span>Budget: <strong>${fmt(budget)}</strong> (${pct}%)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${pct >= 100 ? "complete" : ""}" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      })
      .join("");

    const projectOptions = projects
      .map((p) => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`)
      .join("");

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Receipts Logged</div>
          <div class="kpi-value">${fmt(summary.totalReceipts)}</div>
          <div class="kpi-sub">${receipts.length} receipt voucher(s)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Active Projects</div>
          <div class="kpi-value">${projects.length}</div>
          <div class="kpi-sub">Total Budget: ${fmt(summary.totalProjectBudget)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Project Spend to Date</div>
          <div class="kpi-value">${fmt(summary.totalProjectSpend)}</div>
          <div class="kpi-sub">Remaining Budget: ${fmt(Math.max(0, summary.totalProjectBudget - summary.totalProjectSpend))}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Add Expense Receipt</h3>
              <p class="card-subtitle">Log receipts/vouchers for auditing and cash flow tracking</p>
            </div>
          </div>

          <form id="addReceiptForm">
            <div class="form-grid">
              <div class="form-group">
                <label for="rcpDate">Receipt Date</label>
                <input id="rcpDate" name="date" type="date" class="form-control" value="${todayStr}" required />
              </div>
              <div class="form-group">
                <label for="rcpRef">Receipt / Voucher Ref</label>
                <input id="rcpRef" name="receiptRef" type="text" class="form-control" placeholder="e.g. RCP-2026-002" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="rcpVendor">Payee / Vendor</label>
                <input id="rcpVendor" name="vendor" type="text" class="form-control" placeholder="e.g. Venue / Contractor / Supplier" required />
              </div>
              <div class="form-group">
                <label for="rcpAmount">Amount (${escapeHtml(config.currencySymbol)})</label>
                <input id="rcpAmount" name="amount" type="number" step="0.01" min="0.01" class="form-control" placeholder="0.00" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="rcpCategory">Category</label>
                <select id="rcpCategory" name="category" class="form-select">
                  <option value="Governance & Admin">Governance &amp; Admin</option>
                  <option value="Project Expense">Project Expense</option>
                  <option value="Legal & Compliance">Legal &amp; Compliance</option>
                  <option value="Events & Operations">Events &amp; Operations</option>
                </select>
              </div>
              <div class="form-group">
                <label for="rcpProject">Linked Project (Optional)</label>
                <select id="rcpProject" name="linkedProject" class="form-select">
                  <option value="">General / Unassigned</option>
                  ${projectOptions}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="rcpNotes">Notes / Description</label>
              <input id="rcpNotes" name="notes" type="text" class="form-control" placeholder="Brief description of receipt item..." />
            </div>

            <button type="submit" class="btn btn-primary">Add Receipt</button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Add / Log Project</h3>
              <p class="card-subtitle">Track company initiatives, budgets, and progress</p>
            </div>
          </div>

          <form id="addProjectForm">
            <div class="form-group">
              <label for="prjName">Project Name</label>
              <input id="prjName" name="name" type="text" class="form-control" placeholder="e.g. Community Solar or Land Due Diligence" required />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="prjCategory">Category</label>
                <input id="prjCategory" name="category" type="text" class="form-control" value="Capital / Governance" required />
              </div>
              <div class="form-group">
                <label for="prjLead">Lead / Owner</label>
                <input id="prjLead" name="leadOwner" type="text" class="form-control" placeholder="e.g. Project Committee" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="prjBudget">Target Budget (${escapeHtml(config.currencySymbol)})</label>
                <input id="prjBudget" name="targetBudget" type="number" step="0.01" min="0" class="form-control" value="5000" required />
              </div>
              <div class="form-group">
                <label for="prjSpent">Spent to Date (${escapeHtml(config.currencySymbol)})</label>
                <input id="prjSpent" name="spentToDate" type="number" step="0.01" min="0" class="form-control" value="0" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="prjStatus">Status</label>
                <select id="prjStatus" name="status" class="form-select">
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planned">Planned</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div class="form-group">
                <label for="prjTargetDate">Target Date</label>
                <input id="prjTargetDate" name="targetDate" type="date" class="form-control" value="2027-03-31" />
              </div>
            </div>

            <div class="form-group">
              <label for="prjDesc">Project Scope / Notes</label>
              <textarea id="prjDesc" name="description" class="form-textarea" style="min-height: 72px;" placeholder="Key deliverables and milestones..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary">Add Project</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Receipts Register</h3>
            <p class="card-subtitle">All recorded receipts and vouchers</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ref</th>
                <th>Vendor / Payee</th>
                <th>Category</th>
                <th>Linked Project</th>
                <th class="num-right">Amount</th>
                <th class="no-print">Action</th>
              </tr>
            </thead>
            <tbody>
              ${
                receiptRows ||
                `<tr><td colspan="7" class="empty-state">No receipts recorded yet.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Projects Tracker</h3>
            <p class="card-subtitle">Budget utilization across active and planned projects</p>
          </div>
        </div>
        <div class="record-list">
          ${projectCards || `<div class="empty-state">No projects recorded yet.</div>`}
        </div>
      </div>
    `;
  }

  return { render };
})();
