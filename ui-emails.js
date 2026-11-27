// 3-Month Arrears Email Engine Tab Renderer
window.PortalUIEmails = (function () {
  function generateReminderDraft(member, index, config, isUnlocked, fmt) {
    const restrictFlag = Boolean(config.restrictIndividualMemberData);
    const recipientName = !restrictFlag || isUnlocked ? member.name : `Member #${String(index + 1).padStart(2, "0")}`;
    const recipientEmail = !restrictFlag || isUnlocked ? (member.email || "member@specdums.org") : "protected-member@specdums.org";

    const subject = `Notice of Account Arrears (${member.monthsInArrears} Months) - ${config.companyName}`;
    const body = [
      `Dear ${recipientName},`,
      ``,
      `This is a formal governance and financial reminder regarding your monthly dues account with ${config.companyName} (Baseline: ${config.baselineLabel}).`,
      ``,
      `Account Summary:`,
      `- Monthly Dues Paid: ${fmt(member.duesPaid)}`,
      `- Outstanding Arrears Balance: ${fmt(member.arrearsAmount)}`,
      `- Arrears Duration: ${member.monthsInArrears} month(s)`,
      ``,
      `Please arrange settlement of your overdue balance or contact the governance/finance team to agree a payment plan.`,
      ``,
      `Kind regards,`,
      `${config.companyName} Governance & Finance`
    ].join("\n");

    return { recipientName, recipientEmail, subject, body };
  }

  function render(container, state, summary, config, isUnlocked, helpers) {
    const { formatCurrency, escapeHtml } = helpers;
    const fmt = (n) => formatCurrency(n, config.currencySymbol);
    const eligible = summary.threeMonthArrearsMembers;

    const selectedId = document.getElementById("arrearsMemberSelect")?.value || (eligible[0] ? eligible[0].id : "");
    const selectedMember = eligible.find((m) => m.id === selectedId) || eligible[0] || null;
    const selectedIdx = selectedMember ? summary.enrichedMembers.findIndex((m) => m.id === selectedMember.id) : 0;

    const draft = selectedMember
      ? generateReminderDraft(selectedMember, selectedIdx, config, isUnlocked, fmt)
      : {
          recipientName: "N/A",
          recipientEmail: "",
          subject: `Arrears Notice - ${config.companyName}`,
          body: "No members are currently at or above 3 months in arrears."
        };

    const mailtoHref = selectedMember
      ? `mailto:${encodeURIComponent(draft.recipientEmail)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`
      : "#";

    const rowsHtml = eligible
      .map((m) => {
        const idx = summary.enrichedMembers.findIndex((item) => item.id === m.id);
        const label = !config.restrictIndividualMemberData || isUnlocked ? `${m.name} (${m.id})` : `Protected Member #${String(idx + 1).padStart(2, "0")}`;
        return `
          <tr>
            <td><strong>${escapeHtml(label)}</strong></td>
            <td class="num-right">${fmt(m.duesPaid)}</td>
            <td class="num-right">${fmt(m.arrearsAmount)}</td>
            <td><span class="badge badge-danger">${m.monthsInArrears} Months</span></td>
            <td class="no-print">
              <button type="button" class="btn btn-secondary btn-sm" data-select-arrears="${escapeHtml(m.id)}">Load Draft</button>
            </td>
          </tr>
        `;
      })
      .join("");

    container.innerHTML = `
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">3+ Months Arrears Queue (${eligible.length})</h3>
              <p class="card-subtitle">Members meeting the ${config.arrearsThresholdMonths}-month arrears reminder threshold</p>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th class="num-right">Dues Paid</th>
                  <th class="num-right">Arrears</th>
                  <th>Age</th>
                  <th class="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                ${
                  rowsHtml ||
                  `<tr><td colspan="5" class="empty-state">No members currently meet the 3+ months arrears threshold.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Reminder Email Composer</h3>
              <p class="card-subtitle">Generate, copy, or open in your default email client</p>
            </div>
          </div>

          <div class="form-group">
            <label for="arrearsMemberSelect">Select Member in 3+ Months Arrears</label>
            <select id="arrearsMemberSelect" class="form-select" ${eligible.length ? "" : "disabled"}>
              ${
                eligible.length
                  ? eligible
                      .map((m) => {
                        const idx = summary.enrichedMembers.findIndex((item) => item.id === m.id);
                        const lbl = !config.restrictIndividualMemberData || isUnlocked ? `${m.name} (${fmt(m.arrearsAmount)})` : `Protected Member #${String(idx + 1).padStart(2, "0")} (${fmt(m.arrearsAmount)})`;
                        return `<option value="${escapeHtml(m.id)}" ${selectedMember && m.id === m.id ? "selected" : ""}>${escapeHtml(lbl)}</option>`;
                      })
                      .join("")
                  : `<option value="">None eligible</option>`
              }
            </select>
          </div>

          <div class="form-group">
            <label for="emailSubjectInput">Subject Line</label>
            <input id="emailSubjectInput" type="text" class="form-control" value="${escapeHtml(draft.subject)}" />
          </div>

          <div class="form-group">
            <label for="emailBodyTextarea">Message Body</label>
            <textarea id="emailBodyTextarea" class="form-textarea" style="min-height: 190px;">${escapeHtml(draft.body)}</textarea>
          </div>

          <div class="toolbar-group no-print">
            <button type="button" class="btn btn-primary" id="copyEmailDraftBtn" ${selectedMember ? "" : "disabled"}>Copy Email Draft</button>
            <a class="btn btn-secondary" href="${mailtoHref}" ${selectedMember ? "" : 'onclick="return false;"'}>Open Mail App</a>
          </div>
        </div>
      </div>
    `;
  }

  return { render };
})();
