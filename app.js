// Main Application Controller for SPECDUMS Limited Governance & Financial Ledger Portal
(function () {
  const config = window.PORTAL_CONFIG;
  const fallbackData = window.INITIAL_PORTAL_DATA;
  const calc = window.PortalCalculations;
  const sync = window.PortalSheetsSync;

  let state = sync.loadLocalState(config, fallbackData);
  let activeTab = "overview";
  let isUnlocked = false;
  let lastSyncText = `Baseline (${config.baselineLabel})`;
  let isRemoteSynced = false;

  try {
    isUnlocked = sessionStorage.getItem(config.storageKeys.unlocked) === "true";
  } catch (_) {
    isUnlocked = false;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3400);
  }

  function persistState() {
    sync.saveLocalState(config, state);
  }

  function setActiveTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      const isMatch = btn.dataset.tab === tabId;
      btn.classList.toggle("active", isMatch);
      btn.setAttribute("aria-selected", isMatch ? "true" : "false");
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabId}`);
    });
    renderAll();
  }

  function renderPrivacyBanner(summary) {
    const banner = document.getElementById("privacyBanner");
    if (!banner) return;
    const restrictFlag = Boolean(config.restrictIndividualMemberData);
    const unlockedView = !restrictFlag || isUnlocked;

    banner.classList.toggle("restricted", restrictFlag && !unlockedView);
    banner.innerHTML = `
      <div class="privacy-banner-text">
        <strong>Privacy &amp; Access Mode:</strong>
        ${
          unlockedView
            ? "Individual member records are unlocked in this browser session."
            : "Public summary mode active — aggregate figures are visible while individual member identities and personal balances are protected."
        }
      </div>
      <div class="toolbar-group no-print">
        ${
          restrictFlag && !unlockedView
            ? `<button type="button" class="btn btn-primary btn-sm" data-open-unlock="true">Unlock Member Details</button>`
            : restrictFlag && unlockedView
            ? `<button type="button" class="btn btn-secondary btn-sm" data-lock-records="true">Lock Member Details</button>`
            : ""
        }
      </div>
    `;
  }

  function renderSyncStatus() {
    const labelEl = document.getElementById("syncStatusText");
    const dotEl = document.getElementById("syncStatusDot");
    if (labelEl) labelEl.textContent = lastSyncText;
    if (dotEl) {
      dotEl.classList.toggle("live", isRemoteSynced);
      dotEl.classList.toggle("warn", !isRemoteSynced && Boolean(config.appsScriptUrl));
    }
  }

  function renderAll() {
    const summary = calc.summarizePortfolio(state, config);
    const helpers = {
      formatCurrency: calc.formatCurrency,
      buildCashFlowForecast: calc.buildCashFlowForecast,
      escapeHtml
    };

    renderSyncStatus();
    renderPrivacyBanner(summary);

    window.PortalUIOverview.render(
      document.getElementById("tab-overview"),
      state,
      summary,
      config,
      helpers
    );

    window.PortalUILedger.render(
      document.getElementById("tab-ledger"),
      state,
      summary,
      config,
      isUnlocked,
      helpers
    );

    window.PortalUIEmails.render(
      document.getElementById("tab-emails"),
      state,
      summary,
      config,
      isUnlocked,
      helpers
    );

    window.PortalUIForecast.render(
      document.getElementById("tab-forecast"),
      state,
      summary,
      config,
      helpers
    );

    window.PortalUIMinutes.render(
      document.getElementById("tab-minutes"),
      state,
      summary,
      config,
      helpers
    );

    window.PortalUIReceiptsProjects.render(
      document.getElementById("tab-receipts-projects"),
      state,
      summary,
      config,
      helpers
    );

    window.PortalUICharity.render(
      document.getElementById("tab-charity"),
      state,
      summary,
      config,
      isUnlocked,
      helpers
    );
  }

  function openPinModal() {
    const modal = document.getElementById("pinModal");
    const input = document.getElementById("pinModalInput");
    const err = document.getElementById("pinModalError");
    if (err) err.textContent = "";
    if (input) input.value = "";
    if (modal) {
      modal.classList.add("open");
      setTimeout(() => input && input.focus(), 50);
    }
  }

  function closePinModal() {
    const modal = document.getElementById("pinModal");
    if (modal) modal.classList.remove("open");
  }

  async function handleSyncClick() {
    lastSyncText = "Syncing...";
    renderSyncStatus();
    try {
      const res = await sync.pullFromAppsScript(config);
      if (res.ok && res.data) {
        state = {
          baselineDate: res.data.baselineDate || state.baselineDate,
          members: Array.isArray(res.data.members) && res.data.members.length ? res.data.members : state.members,
          minutes: Array.isArray(res.data.minutes) ? res.data.minutes : state.minutes,
          receipts: Array.isArray(res.data.receipts) ? res.data.receipts : state.receipts,
          projects: Array.isArray(res.data.projects) ? res.data.projects : state.projects,
          charityContributions: Array.isArray(res.data.charityContributions)
            ? res.data.charityContributions
            : state.charityContributions
        };
        persistState();
        isRemoteSynced = true;
        lastSyncText = "Synced with Google Sheets";
        showToast(res.message, "success");
      } else {
        isRemoteSynced = false;
        lastSyncText = "Local / Baseline Mode";
        showToast(res.message, "info");
      }
    } catch (err) {
      isRemoteSynced = false;
      lastSyncText = "Sync Error (Using Local Data)";
      showToast(`Sync issue: ${err.message}`, "error");
    }
    renderAll();
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `specdums-governance-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported governance snapshot JSON.", "success");
  }

  function handleResetBaseline() {
    if (!confirm("Reset local portal changes back to the 11 Sep 2026 baseline dataset?")) return;
    state = sync.resetToBaseline(config, fallbackData);
    isRemoteSynced = false;
    lastSyncText = `Reset to Baseline (${config.baselineLabel})`;
    renderAll();
    showToast("Reset to 11 Sep 2026 baseline.", "success");
  }

  // Event listeners
  document.addEventListener("click", (e) => {
    const target = e.target;

    const tabBtn = target.closest(".tab-btn");
    if (tabBtn && tabBtn.dataset.tab) {
      setActiveTab(tabBtn.dataset.tab);
      return;
    }

    const jumpBtn = target.closest("[data-jump-tab]");
    if (jumpBtn && jumpBtn.dataset.jumpTab) {
      setActiveTab(jumpBtn.dataset.jumpTab);
      return;
    }

    if (target.closest("[data-open-unlock]")) {
      openPinModal();
      return;
    }

    if (target.closest("[data-lock-records]")) {
      isUnlocked = false;
      try {
        sessionStorage.removeItem(config.storageKeys.unlocked);
      } catch (_) {}
      renderAll();
      showToast("Individual member records locked.", "info");
      return;
    }

    if (target.closest("#closePinModalBtn") || target.id === "pinModal") {
      if (target.id === "pinModal" || target.closest("#closePinModalBtn")) {
        closePinModal();
      }
      return;
    }

    if (target.closest("#syncNowBtn")) {
      handleSyncClick();
      return;
    }

    if (target.closest("#exportJsonBtn")) {
      handleExportJson();
      return;
    }

    if (target.closest("#resetBaselineBtn")) {
      handleResetBaseline();
      return;
    }

    if (target.closest("#printReportBtn")) {
      window.print();
      return;
    }

    const editMemberBtn = target.closest("[data-edit-member]");
    if (editMemberBtn) {
      const memberId = editMemberBtn.dataset.editMember;
      const member = state.members.find((m) => m.id === memberId);
      if (member) {
        window.PortalUILedger.renderEditor(
          document.getElementById("memberEditorPanel"),
          member,
          config,
          { escapeHtml }
        );
      }
      return;
    }

    if (target.closest("#closeMemberEditorBtn") || target.closest("#cancelMemberEditorBtn")) {
      const panel = document.getElementById("memberEditorPanel");
      if (panel) {
        panel.style.display = "none";
        panel.innerHTML = "";
      }
      return;
    }

    const selectArrearsBtn = target.closest("[data-select-arrears]");
    if (selectArrearsBtn) {
      const selectEl = document.getElementById("arrearsMemberSelect");
      if (selectEl) {
        selectEl.value = selectArrearsBtn.dataset.selectArrears;
        renderAll();
      }
      return;
    }

    if (target.closest("#copyEmailDraftBtn")) {
      const subj = document.getElementById("emailSubjectInput")?.value || "";
      const body = document.getElementById("emailBodyTextarea")?.value || "";
      const combined = `Subject: ${subj}

${body}`;
      navigator.clipboard?.writeText(combined).then(
        () => showToast("Arrears reminder email copied to clipboard.", "success"),
        () => showToast("Unable to copy automatically; select and copy manually.", "error")
      );
      return;
    }

    const delMinBtn = target.closest("[data-delete-minutes]");
    if (delMinBtn) {
      const id = delMinBtn.dataset.deleteMinutes;
      state.minutes = (state.minutes || []).filter((m) => m.id !== id);
      persistState();
      renderAll();
      showToast("Removed minutes/resolution entry.", "success");
      return;
    }

    const delRcpBtn = target.closest("[data-delete-receipt]");
    if (delRcpBtn) {
      const id = delRcpBtn.dataset.deleteReceipt;
      state.receipts = (state.receipts || []).filter((r) => r.id !== id);
      persistState();
      renderAll();
      showToast("Deleted receipt entry.", "success");
      return;
    }

    const delPrjBtn = target.closest("[data-delete-project]");
    if (delPrjBtn) {
      const id = delPrjBtn.dataset.deleteProject;
      state.projects = (state.projects || []).filter((p) => p.id !== id);
      persistState();
      renderAll();
      showToast("Removed project entry.", "success");
      return;
    }

    const delChrBtn = target.closest("[data-delete-charity]");
    if (delChrBtn) {
      const id = delChrBtn.dataset.deleteCharity;
      state.charityContributions = (state.charityContributions || []).filter((c) => c.id !== id);
      persistState();
      renderAll();
      showToast("Removed charity contribution entry.", "success");
      return;
    }
  });

  document.addEventListener("change", (e) => {
    if (
      e.target.id === "ledgerStatusFilter" ||
      e.target.id === "arrearsMemberSelect" ||
      e.target.classList.contains("forecast-input")
    ) {
      renderAll();
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "ledgerSearchInput" || e.target.id === "minutesSearchInput") {
      renderAll();
    }
  });

  document.addEventListener("submit", async (e) => {
    const form = e.target;

    if (form.id === "pinModalForm") {
      e.preventDefault();
      const inputVal = (document.getElementById("pinModalInput")?.value || "").trim();
      const errEl = document.getElementById("pinModalError");
      if (inputVal === String(config.memberAccessPin)) {
        isUnlocked = true;
        try {
          sessionStorage.setItem(config.storageKeys.unlocked, "true");
        } catch (_) {}
        closePinModal();
        renderAll();
        showToast("Individual member records unlocked.", "success");
      } else if (errEl) {
        errEl.textContent = "Incorrect access PIN. Please try again.";
      }
      return;
    }

    if (form.id === "memberEditForm") {
      e.preventDefault();
      const fd = new FormData(form);
      const memberId = fd.get("memberId");
      const idx = state.members.findIndex((m) => m.id === memberId);
      if (idx !== -1) {
        const updated = {
          ...state.members[idx],
          name: String(fd.get("name") || state.members[idx].name).trim(),
          email: String(fd.get("email") || "").trim(),
          shareCapital: Number(fd.get("shareCapital")) || 0,
          duesPaid: Number(fd.get("duesPaid")) || 0,
          expectedDues: Number(fd.get("expectedDues")) || 0,
          monthsInArrears: Number(fd.get("monthsInArrears")) || 0
        };
        const metrics = calc.computeMemberMetrics(updated, config.defaultMonthlyDues);
        updated.status = metrics.status;
        state.members[idx] = updated;
        persistState();
        renderAll();
        showToast(`Updated ${updated.name}.`, "success");
        try {
          await sync.pushRecordToAppsScript(config, "member", updated);
        } catch (_) {}
      }
      return;
    }

    if (form.id === "addMinutesForm") {
      e.preventDefault();
      const fd = new FormData(form);
      const record = {
        id: `MIN-${Date.now()}`,
        meetingDate: String(fd.get("meetingDate") || "").trim(),
        meetingType: String(fd.get("meetingType") || "General Meeting").trim(),
        chairConvener: String(fd.get("chairConvener") || "").trim(),
        resolutionCode: String(fd.get("resolutionCode") || "").trim(),
        attendeesSummary: String(fd.get("attendeesSummary") || "").trim(),
        summaryNotes: String(fd.get("summaryNotes") || "").trim(),
        resolutionTitle: String(fd.get("resolutionTitle") || "").trim(),
        resolutionText: String(fd.get("resolutionText") || "").trim(),
        voteOutcome: String(fd.get("voteOutcome") || "").trim(),
        status: String(fd.get("status") || "Passed").trim()
      };
      state.minutes.unshift(record);
      persistState();
      form.reset();
      renderAll();
      showToast("Saved meeting minutes and resolution.", "success");
      try {
        await sync.pushRecordToAppsScript(config, "minutes", record);
      } catch (_) {}
      return;
    }

    if (form.id === "addReceiptForm") {
      e.preventDefault();
      const fd = new FormData(form);
      const record = {
        id: `RCP-${Date.now()}`,
        date: String(fd.get("date") || "").trim(),
        receiptRef: String(fd.get("receiptRef") || "").trim(),
        vendor: String(fd.get("vendor") || "").trim(),
        amount: Number(fd.get("amount")) || 0,
        category: String(fd.get("category") || "General").trim(),
        linkedProject: String(fd.get("linkedProject") || "").trim(),
        notes: String(fd.get("notes") || "").trim()
      };
      state.receipts.unshift(record);
      persistState();
      form.reset();
      renderAll();
      showToast("Added receipt entry.", "success");
      try {
        await sync.pushRecordToAppsScript(config, "receipt", record);
      } catch (_) {}
      return;
    }

    if (form.id === "addProjectForm") {
      e.preventDefault();
      const fd = new FormData(form);
      const record = {
        id: `PRJ-${Date.now()}`,
        name: String(fd.get("name") || "").trim(),
        category: String(fd.get("category") || "Project").trim(),
        leadOwner: String(fd.get("leadOwner") || "").trim(),
        targetBudget: Number(fd.get("targetBudget")) || 0,
        spentToDate: Number(fd.get("spentToDate")) || 0,
        status: String(fd.get("status") || "Active").trim(),
        targetDate: String(fd.get("targetDate") || "").trim(),
        description: String(fd.get("description") || "").trim()
      };
      state.projects.push(record);
      persistState();
      form.reset();
      renderAll();
      showToast("Added project entry.", "success");
      try {
        await sync.pushRecordToAppsScript(config, "project", record);
      } catch (_) {}
      return;
    }

    if (form.id === "addCharityForm") {
      e.preventDefault();
      const fd = new FormData(form);
      const record = {
        id: `CHR-${Date.now()}`,
        date: String(fd.get("date") || "").trim(),
        amount: Number(fd.get("amount")) || 0,
        contributor: String(fd.get("contributor") || "").trim(),
        initiative: String(fd.get("initiative") || "").trim(),
        beneficiary: String(fd.get("beneficiary") || "").trim(),
        status: String(fd.get("status") || "Disbursed").trim(),
        notes: String(fd.get("notes") || "").trim()
      };
      state.charityContributions.unshift(record);
      persistState();
      form.reset();
      renderAll();
      showToast("Recorded charity contribution.", "success");
      try {
        await sync.pushRecordToAppsScript(config, "charity", record);
      } catch (_) {}
    }
  });

  // Initial render
  renderAll();
})();
