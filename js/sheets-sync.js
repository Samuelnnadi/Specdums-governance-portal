// Google Sheets / Apps Script Synchronization & Local Persistence Module
window.PortalSheetsSync = (function () {
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadLocalState(config, fallbackData) {
    try {
      const raw = localStorage.getItem(config.storageKeys.state);
      if (!raw) {
        return deepClone(fallbackData);
      }
      const parsed = JSON.parse(raw);
      return {
        baselineDate: parsed.baselineDate || fallbackData.baselineDate,
        members: Array.isArray(parsed.members) && parsed.members.length ? parsed.members : deepClone(fallbackData.members),
        minutes: Array.isArray(parsed.minutes) ? parsed.minutes : deepClone(fallbackData.minutes),
        receipts: Array.isArray(parsed.receipts) ? parsed.receipts : deepClone(fallbackData.receipts),
        projects: Array.isArray(parsed.projects) ? parsed.projects : deepClone(fallbackData.projects),
        charityContributions: Array.isArray(parsed.charityContributions)
          ? parsed.charityContributions
          : deepClone(fallbackData.charityContributions)
      };
    } catch (err) {
      console.warn("Failed to read local state:", err);
      return deepClone(fallbackData);
    }
  }

  function saveLocalState(config, state) {
    try {
      localStorage.setItem(config.storageKeys.state, JSON.stringify(state));
    } catch (err) {
      console.warn("Failed to save local state:", err);
    }
  }

  function resetToBaseline(config, fallbackData) {
    const fresh = deepClone(fallbackData);
    saveLocalState(config, fresh);
    return fresh;
  }

  async function pullFromAppsScript(config) {
    const url = (config.appsScriptUrl || "").trim();
    if (!url) {
      return {
        ok: false,
        mode: "local",
        message: "No Apps Script Web App URL configured yet. Using local/baseline data."
      };
    }

    const sep = url.includes("?") ? "&" : "?";
    const endpoint = `${url}${sep}action=getAll&_ts=${Date.now()}`;

    const response = await fetch(endpoint, { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from Apps Script`);
    }
    const payload = await response.json();
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid JSON response from Apps Script");
    }

    return {
      ok: true,
      mode: "remote",
      data: payload,
      message: "Synchronized latest data from Google Sheets."
    };
  }

  async function pushRecordToAppsScript(config, entityType, record) {
    const url = (config.appsScriptUrl || "").trim();
    if (!url) {
      return {
        ok: false,
        queued: false,
        message: "Saved locally. Add an Apps Script Web App URL in config.js to sync to Google Sheets."
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "upsert", entityType, record })
    });

    if (!response.ok) {
      throw new Error(`Sync POST failed with HTTP ${response.status}`);
    }

    return {
      ok: true,
      queued: false,
      message: "Saved locally and synced to Google Sheets."
    };
  }

  return {
    loadLocalState,
    saveLocalState,
    resetToBaseline,
    pullFromAppsScript,
    pushRecordToAppsScript
  };
})();
