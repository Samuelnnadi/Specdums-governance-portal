// ============================================================================
// 4. LIVE GOOGLE SHEETS & APPS SCRIPT SYNCHRONIZATION
// ============================================================================
function updateSyncStatusUI(connected, statusLabel, detailText) {
    isLiveSheetConnected = connected;
    const badge = document.getElementById('sheet-mode-badge');
    const dot = document.getElementById('sheet-mode-dot');
    const text = document.getElementById('sheet-mode-text');
    const lastSync = document.getElementById('sheet-last-sync');

    text.textContent = statusLabel;
    if (detailText) {
        lastSync.textContent = detailText;
    }

    if (connected) {
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
        dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
    } else {
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30';
        dot.className = 'w-2 h-2 rounded-full bg-amber-400';
    }
}

function parseNum(val, fallback = 0) {
    if (val === null || val === undefined || val === '') return fallback;
    const cleaned = String(val).replace(/[£$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
        } else {
            cur += ch;
        }
    }
    result.push(cur.trim());
    return result;
}

function distributeMonthlyFromYTD(ytdTotal, unitAmount, monthCount, fallbackArr) {
    if (ytdTotal === undefined || ytdTotal === null || ytdTotal === '') {
        return fallbackArr.slice();
    }
    let remaining = parseNum(ytdTotal, 0);
    const arr = [];
    for (let i = 0; i < monthCount; i++) {
        const paid = Math.max(0, Math.min(unitAmount, remaining));
        arr.push(paid);
        remaining -= paid;
    }
    return arr;
}

function applyRemoteSheetPayload(payload) {
    const list = Array.isArray(payload?.members) ? payload.members : payload?.membersLedger;
    if (!Array.isArray(list) || list.length === 0) {
        throw new Error('Empty or invalid sheet rows');
    }

    const mergedMembers = INITIAL_MEMBERS.map(base => {
        const match = list.find(r => {
            const rowId = r.sno ?? r.Member_ID ?? r.memberId;
            const rowName = r.name ?? r.Full_Name ?? r.fullName;
            return (rowId && parseInt(rowId, 10) === base.sno) ||
                (rowName && String(rowName).trim().toLowerCase() === base.name.toLowerCase());
        });
        if (!match) return JSON.parse(JSON.stringify(base));

        const rawCap26Ytd = match.Cap_2026_YTD ?? match.cap26YTD ?? match.cap2026Ytd;
        const rawDues26Ytd = match.Dues_2026_YTD ?? match.dues26YTD ?? match.dues2026Ytd;

        const cap26 = Array.isArray(match.cap26) && match.cap26.length >= 9
            ? match.cap26.slice(0, 9).map(v => parseNum(v, 0))
            : distributeMonthlyFromYTD(rawCap26Ytd, 200, 9, base.cap26);

        const dues26 = Array.isArray(match.dues26) && match.dues26.length >= 9
            ? match.dues26.slice(0, 9).map(v => parseNum(v, 0))
            : distributeMonthlyFromYTD(rawDues26Ytd, 10, 9, base.dues26);

        const rawStatus = String(match.Status ?? match.status ?? base.status).toLowerCase();
        const mappedStatus = rawStatus.includes('exit') ? 'exited' : 'active';

        return {
            ...base,
            name: (match.Full_Name ?? match.name) ? String(match.Full_Name ?? match.name).trim() : base.name,
            whatsapp: (match.WhatsApp_Number ?? match.whatsapp) ? String(match.WhatsApp_Number ?? match.whatsapp).trim() : base.whatsapp,
            status: mappedStatus,
            cap24: (match.Cap_2024 ?? match.cap24) !== undefined ? parseNum(match.Cap_2024 ?? match.cap24, base.cap24) : base.cap24,
            cap25: (match.Cap_2025 ?? match.cap25) !== undefined ? parseNum(match.Cap_2025 ?? match.cap25, base.cap25) : base.cap25,
            levy25: (match.Levy_2025 ?? match.levy25) !== undefined ? parseNum(match.Levy_2025 ?? match.levy25, base.levy25) : base.levy25,
            cap26,
            oneOff26: (match.OneOff_2026 ?? match.oneOff26) !== undefined ? parseNum(match.OneOff_2026 ?? match.oneOff26, base.oneOff26) : base.oneOff26,
            dues24: (match.Dues_2024 ?? match.dues24) !== undefined ? parseNum(match.Dues_2024 ?? match.dues24, base.dues24) : base.dues24,
            dues25: (match.Dues_2025 ?? match.dues25) !== undefined ? parseNum(match.Dues_2025 ?? match.dues25, base.dues25) : base.dues25,
            dues26
        };
    });

    members = mergedMembers;
    if (payload.bankBalance !== undefined && !Number.isNaN(parseFloat(payload.bankBalance))) {
        bankBalance = parseFloat(payload.bankBalance);
    }
    refreshAllViews();
}

function fetchVisualizationJSONP(sheetName = '') {
    return new Promise((resolve, reject) => {
        const cbName = 'specdumsGvizCb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${cbName}${sheetParam}`;
        const script = document.createElement('script');
        let settled = false;

        const cleanup = () => {
            if (script.parentNode) script.parentNode.removeChild(script);
            delete window[cbName];
        };

        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                cleanup();
                reject(new Error('Google Visualization request timed out'));
            }
        }, 7000);

        window[cbName] = (data) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            cleanup();
            if (!data || data.status === 'error' || !data.table) {
                reject(new Error('Google Sheet access denied or empty table'));
                return;
            }
            const cols = (data.table.cols || []).map(c => (c.label || '').trim());
            const rows = (data.table.rows || []).map(r =>
                (r.c || []).map(cell => (cell ? (cell.v !== null && cell.v !== undefined ? cell.v : '') : ''))
            );
            resolve({ cols, rows });
        };

        script.onerror = () => {
            if (!settled) {
                settled = true;
                clearTimeout(timeout);
                cleanup();
                reject(new Error('Network or permissions error loading Google Sheet'));
            }
        };

        script.src = url;
        document.body.appendChild(script);
    });
}

function mapTabularRowsToPayload(cols, rows) {
    if (!rows || rows.length === 0) return null;
    const parsedMembers = [];
    let detectedBankBalance;

    rows.forEach(cells => {
        const firstCell = String(cells[0] || '').trim();
        const secondCell = String(cells[1] || '').trim();
        if (/bank\s*balance/i.test(firstCell) || /bank\s*balance/i.test(secondCell)) {
            detectedBankBalance = parseNum(cells[1] || cells[2]);
            return;
        }
        const sno = parseInt(firstCell, 10);
        const name = secondCell;
        if (!sno || !name || isNaN(sno)) return;

        if (cells.length >= 20) {
            parsedMembers.push({
                sno,
                name,
                whatsapp: cells[2] || '',
                status: String(cells[3] || 'active').toLowerCase(),
                cap24: cells[4],
                cap25: cells[5],
                levy25: cells[6],
                cap26: cells.slice(7, 16),
                oneOff26: cells[16],
                dues24: cells[17],
                dues25: cells[18],
                dues26: cells.slice(19, 28)
            });
        }
    });

    if (parsedMembers.length === 0) return null;
    return { members: parsedMembers, bankBalance: detectedBankBalance };
}

async function syncFromGoogleSheet(silent = false) {
    const btn = document.getElementById('sync-now-btn');
    const spinner = document.getElementById('sync-spinner');
    if (btn) btn.disabled = true;
    if (spinner) spinner.classList.add('animate-spin');

    try {
        let payload = null;

        if (APPS_SCRIPT_WEBAPP_URL) {
            const res = await fetch(APPS_SCRIPT_WEBAPP_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error('Apps Script endpoint returned HTTP ' + res.status);
            payload = await res.json();
        } else {
            try {
                const gviz = await fetchVisualizationJSONP();
                payload = mapTabularRowsToPayload(gviz.cols, gviz.rows);
            } catch (_) {
                const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;
                const csvRes = await fetch(csvUrl, { cache: 'no-store' });
                if (!csvRes.ok) throw new Error('Sheet not publicly shared or unreachable');
                const csvText = await csvRes.text();
                if (/^\s*<!doctype html/i.test(csvText) || /accounts\.google\.com/i.test(csvText)) {
                    throw new Error('Sheet requires "Anyone with the link can view" permission');
                }
                const lines = csvText.split(/?
/).filter(l => l.trim().length > 0);
                const parsedRows = lines.slice(1).map(parseCSVLine);
                payload = mapTabularRowsToPayload([], parsedRows);
            }
        }

        const memberRows = Array.isArray(payload?.members) ? payload.members : payload?.membersLedger;
        if (!Array.isArray(memberRows) || memberRows.length === 0) {
            throw new Error('No member rows found in sheet payload');
        }

        applyRemoteSheetPayload({ ...payload, members: memberRows });
        const stamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        updateSyncStatusUI(true, 'Live Google Sheet Connected', `Synced live at ${stamp}`);
        if (!silent) {
            showToast('Live Google Sheet Synced', `Updated ledger from SPECDUMS Google Sheet at ${stamp}.`);
        }
    } catch (err) {
        const stamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        updateSyncStatusUI(false, 'Verified Sheet Snapshot', `Snapshot active (checked ${stamp}) • Click Publish & Share Guide`);
        if (!silent) {
            showToast('Using Verified Sheet Snapshot', 'Live sheet feed unavailable or awaiting public view permission; showing verified audit data.', 'warning');
        }
    } finally {
        if (btn) btn.disabled = false;
        if (spinner) spinner.classList.remove('animate-spin');
    }
}
