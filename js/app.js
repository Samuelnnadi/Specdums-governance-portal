// ============================================================================
// 9. CORE NAVIGATION, MODALS, SECURITY & INITIALIZATION
// ============================================================================
function showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-slate-900 border-emerald-500 text-white',
        warning: 'bg-slate-900 border-amber-500 text-white',
        danger: 'bg-slate-900 border-rose-500 text-white'
    };
    const iconColors = {
        success: 'text-emerald-400',
        warning: 'text-amber-400',
        danger: 'text-rose-400'
    };
    toast.className = `pointer-events-auto border-l-4 ${colors[type]} rounded-xl p-4 shadow-xl transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `
        <div class="flex items-start gap-3">
            <svg class="w-5 h-5 ${iconColors[type]} shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1 text-xs">
                <p class="font-bold text-sm">${title}</p>
                <p class="text-slate-300 mt-0.5 leading-relaxed">${message}</p>
            </div>
        </div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    });
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 4200);
}

function switchTab(tabName) {
    const tabs = ['overview', 'ledger', 'emails', 'forecast'];
    tabs.forEach(t => {
        document.getElementById(`view-${t}`).classList.add('hidden');
        document.getElementById(`tab-btn-${t}`).classList.remove('tab-active');
    });
    document.getElementById(`view-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-btn-${tabName}`).classList.add('tab-active');

    if (tabName === 'forecast') {
        updateForecast();
    }
}

function openShareGuideModal() {
    document.getElementById('share-guide-modal').classList.remove('hidden');
}

function closeShareGuideModal() {
    document.getElementById('share-guide-modal').classList.add('hidden');
}

function lockApp() {
    document.getElementById('unlock-pin-input').value = '';
    document.getElementById('lock-overlay').classList.remove('hidden');
}

function unlockApp() {
    const pin = document.getElementById('unlock-pin-input').value.trim();
    if (pin === DEFAULT_GROUP_PIN) {
        document.getElementById('lock-overlay').classList.add('hidden');
        showToast('Portal Unlocked', 'Member PIN verified.');
    } else {
        showToast('Invalid PIN', 'Please enter the correct member portal PIN.', 'danger');
    }
}

function toggleAutoRefresh() {
    const enabled = document.getElementById('auto-refresh-toggle').checked;
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
    if (enabled) {
        autoRefreshTimer = setInterval(() => {
            syncFromGoogleSheet(true);
        }, 120000);
        showToast('Auto-Refresh Enabled', 'Will automatically check the Google Sheet every 2 minutes.');
    }
}

function resetDemoState() {
    members = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
    bankBalance = 5075.13;
    dispatchedLogs = {};
    resetForecastSliders();
    refreshAllViews();
    updateSyncStatusUI(false, 'Verified Sheet Snapshot', 'Last sync: 11 Sep 2026 (Baseline)');
    showToast('Audit Baseline Restored', 'All figures reset to verified 11 September 2026 Metro Bank & Ledger balances.');
}

function refreshAllViews() {
    updateOverviewKPIs();
    renderDirectoryTable();
    populateLedgerDropdown();
    renderIndividualLedger();
    renderEmailEngine();
    if (typeof updateForecast === 'function') updateForecast();
}

window.onload = function() {
    setDirectoryFilter('all');
    refreshAllViews();
    syncFromGoogleSheet(true);
};
