// Individual Member Ledger Tab Renderer (Privacy-Aware)
window.PortalUILedger = (function () {
  function maskMemberLabel(member, index, isUnlocked, restrictFlag) {
    if (!restrictFlag || isUnlocked) {
      return `${member.name} (${member.id})`;
    }
    return `Protected Member #${String(index + 1).padStart(2, "0")}`;
  }

  function maskCurrencyValue(amount, isUnlocked, restrictFlag, fmt) {
    if (!restrictFlag || isUnlocked) {
      return fmt(amount);
    }
    return "Restricted (PIN Required)";
  }

  function render(container, state, summary, config, isUnlocked, helpers) {
    const { formatCurrency, escapeHtml } = helpers;
    const fmt = (n) => formatCurrency(n, config.currencySymbol);
    const restrictFlag = Boolean(config.restrictIndividualMemberData);
    const canViewDetails = !restrictFlag || isUnlocked;

    const filterStatus = (document.getElementById("ledgerStatusFilter")?.value) || "all";
    const searchQuery = ((document.getElementById("ledgerSearchInput")?.value) || "").trim().toLowerCase();

    const filtered = summary.enrichedMembers
      .map((m, idx) => ({ member: m, originalIndex: idx }))
      .filter(({ member, originalIndex }) => {
        if (filterStatus === "arrears3" && !member.isThreeMonthArrears) return false;
        if (filterStatus === "behind" && member.arrearsAmount <= 0) return false;
        if (filterStatus === "uptodate" && member.arrearsAmount > 0) return false;

        if (searchQuery) {
          const visibleLabel = maskMemberLabel(member, originalIndex, isUnlocked, restrictFlag).toLowerCase();
          const matchesVisible = visibleLabel.includes(searchQuery) || member.status.toLowerCase().includes(searchQuery);
          const matchesReal =
            canViewDetails &&
            (member.name.toLowerCase().includes(searchQuery) ||
              member.id.toLowerCase().includes(searchQuery) ||
              (member.email || "").toLowerCase().includes(searchQuery));
          return matchesVisible || matchesReal;
        }
        return true;
      });

    const rowsHtml = filtered
      .map(({ member, originalIndex }) => {
        const displayLabel = maskMemberLabel(member, originalIndex, isUnlocked, restrictFlag);
        const statusBadge = member.isThreeMonthArrears
          ? `<span class="badge badge-danger">${escapeHtml(member.status)}</span>`
          : member.arrearsAmount > 0
          ? `<span class="badge badge-warning">${escapeHtml(member.status)}</span>`
          : `<span class="badge badge-success">Up to Date</span>`;

        const actionCell = canViewDetails
          ? `<button type="button" class="btn btn-secondary btn-sm" data-edit-member="${escapeHtml(member.id)}">Record Payment / Edit</button>`
          : `<button type="button" class="btn btn-secondary btn-sm" data-open-unlock="true">Unlock</button>`;

        return `
          <tr>
            <td><strong>${escapeHtml(displayLabel)}</strong></td>
            <td class="num-right">${escapeHtml(maskCurrencyValue(member.shareCapital, isUnlocked, restrictFlag, fmt))}</td>
            <td class="num-right">${escapeHtml(maskCurrencyValue(member.duesPaid, isUnlocked, restrictFlag, fmt))}</td>
            <td class="num-right">${escapeHtml(maskCurrencyValue(member.arrearsAmount, isUnlocked, restrictFlag, fmt))}</td>
            <td>${canViewDetails ? `${member.monthsInArrears} mo` : "Hidden"}</td>
            <td>${statusBadge}</td>
            <td class="no-print">${actionCell}</td>
          </tr>
        `;
      })
      .join("");

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Individual Member Ledger (${summary.totalMembers} Members)</h3>
            <p class="card-subtitle">
              ${
                canViewDetails
                  ? "Full individual member figures are currently unlocked in this session."
                  : "Individual member identities and figures are hidden for public/guest privacy. Unlock with Member/Governance PIN to view or update individual rows."
              }
            </p>
          </div>
          <div class="toolbar-group">
            ${
              restrictFlag && !isUnlocked
                ? `<button type="button" class="btn btn-primary btn-sm" data-open-unlock="true">Unlock Individual Records</button>`
                : restrictFlag && isUnlocked
                ? `<button type="button" class="btn btn-secondary btn-sm" data-lock-records="true">Lock Individual Records</button>`
                : ""
            }
          </div>
        </div>

        <div class="toolbar">
          <div class="toolbar-group">
            <input
              type="text"
              id="ledgerSearchInput"
              class="form-control"
              style="width: 240px;"
              placeholder="Search member or status..."
              value="${escapeHtml(searchQuery)}"
            />
            <select id="ledgerStatusFilter" class="form-select" style="width: 190px;">
              <option value="all" ${filterStatus === "all" ? "selected" : ""}>All Members (${summary.totalMembers})</option>
              <option value="arrears3" ${filterStatus === "arrears3" ? "selected" : ""}>3+ Months Arrears (${summary.threeMonthArrearsCount})</option>
              <option value="behind" ${filterStatus === "behind" ? "selected" : ""}>Any Arrears Balance</option>
              <option value="uptodate" ${filterStatus === "uptodate" ? "selected" : ""}>Up to Date (${summary.upToDateCount})</option>
            </select>
          </div>
          <div class="toolbar-group">
            <span class="kpi-sub">Total Arrears Pool: <strong>${fmt(summary.totalArrears)}</strong></span>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th class="num-right">Share Capital</th>
                <th class="num-right">Dues Paid</th>
                <th class="num-right">Arrears Balance</th>
                <th>Arrears Age</th>
                <th>Status</th>
                <th class="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                `<tr><td colspan="7" class="empty-state">No member rows match the selected filter.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>

      <div id="memberEditorPanel" class="card" style="display: none;"></div>
    `;
  }

  function renderEditor(panel, member, config, helpers) {
    if (!panel || !member) return;
    const { escapeHtml } = helpers;
    panel.style.display = "block";
    panel.innerHTML = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Update Member Record: ${escapeHtml(member.name)} (${escapeHtml(member.id)})</h3>
          <p class="card-subtitle">Adjust share capital, dues paid, or expected dues to recalculate arrears automatically.</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="closeMemberEditorBtn">Close</button>
      </div>
      <form id="memberEditForm">
        <input type="hidden" name="memberId" value="${escapeHtml(member.id)}" />
        <div class="form-grid">
          <div class="form-group">
            <label for="editMemberName">Member Label / Name</label>
            <input id="editMemberName" name="name" type="text" class="form-control" value="${escapeHtml(member.name)}" required />
          </div>
          <div class="form-group">
            <label for="editMemberEmail">Email Address</label>
            <input id="editMemberEmail" name="email" type="email" class="form-control" value="${escapeHtml(member.email || "")}" />
          </div>
          <div class="form-group">
            <label for="editShareCapital">Share Capital (${escapeHtml(config.currencySymbol)})</label>
            <input id="editShareCapital" name="shareCapital" type="number" step="0.01" min="0" class="form-control" value="${Number(member.shareCapital) || 0}" required />
          </div>
          <div class="form-group">
            <label for="editDuesPaid">Dues Paid (${escapeHtml(config.currencySymbol)})</label>
            <input id="editDuesPaid" name="duesPaid" type="number" step="0.01" min="0" class="form-control" value="${Number(member.duesPaid) || 0}" required />
          </div>
          <div class="form-group">
            <label for="editExpectedDues">Expected Dues to Date (${escapeHtml(config.currencySymbol)})</label>
            <input id="editExpectedDues" name="expectedDues" type="number" step="0.01" min="0" class="form-control" value="${Number(member.expectedDues) || 0}" required />
          </div>
          <div class="form-group">
            <label for="editMonthsArrears">Months in Arrears</label>
            <input id="editMonthsArrears" name="monthsInArrears" type="number" step="0.5" min="0" class="form-control" value="${Number(member.monthsInArrears) || 0}" required />
          </div>
        </div>
        <div class="toolbar-group">
          <button type="submit" class="btn btn-primary">Save Member Changes</button>
          <button type="button" class="btn btn-secondary" id="cancelMemberEditorBtn">Cancel</button>
        </div>
      </form>
    `;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return { render, renderEditor };
})();
