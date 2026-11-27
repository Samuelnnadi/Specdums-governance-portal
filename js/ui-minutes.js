// Meeting Minutes & Resolutions Passed Tab Renderer
window.PortalUIMinutes = (function () {
  function render(container, state, summary, config, helpers) {
    const { escapeHtml } = helpers;
    const minutesList = Array.isArray(state.minutes) ? state.minutes : [];
    const search = ((document.getElementById("minutesSearchInput")?.value) || "").trim().toLowerCase();

    const filtered = minutesList.filter((item) => {
      if (!search) return true;
      const hay = [
        item.meetingDate,
        item.meetingType,
        item.chairConvener,
        item.summaryNotes,
        item.resolutionCode,
        item.resolutionTitle,
        item.resolutionText,
        item.voteOutcome,
        item.status
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(search);
    });

    const todayStr = new Date().toISOString().slice(0, 10);

    const listHtml = filtered
      .map(
        (m) => `
          <article class="record-item">
            <div class="record-item-header">
              <div>
                <h4 class="record-item-title">${escapeHtml(m.resolutionTitle || m.meetingType || "Meeting Minutes")}</h4>
                <div class="record-meta">
                  Date: <strong>${escapeHtml(m.meetingDate || "")}</strong> · Type: ${escapeHtml(m.meetingType || "General Meeting")} · Convener/Chair: ${escapeHtml(m.chairConvener || "Unspecified")}
                </div>
              </div>
              <div class="toolbar-group no-print">
                <span class="badge ${m.status === "Passed" ? "badge-success" : "badge-warning"}">${escapeHtml(m.status || "Recorded")}</span>
                <button type="button" class="btn btn-secondary btn-sm" data-delete-minutes="${escapeHtml(m.id)}">Remove</button>
              </div>
            </div>
            <p style="margin: 8px 0; color: var(--text-primary);">${escapeHtml(m.summaryNotes || "")}</p>
            ${
              m.attendeesSummary
                ? `<p class="kpi-sub" style="margin: 4px 0;"><strong>Attendance:</strong> ${escapeHtml(m.attendeesSummary)}</p>`
                : ""
            }
            ${
              m.resolutionCode || m.resolutionText
                ? `
                  <div class="resolution-box">
                    <div><strong>Resolution ${escapeHtml(m.resolutionCode || "")}:</strong> ${escapeHtml(m.resolutionText || "")}</div>
                    ${
                      m.voteOutcome
                        ? `<div class="kpi-sub" style="margin-top: 4px;"><strong>Vote Outcome:</strong> ${escapeHtml(m.voteOutcome)}</div>`
                        : ""
                    }
                  </div>
                `
                : ""
            }
          </article>
        `
      )
      .join("");

    container.innerHTML = `
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Record Meeting Minutes &amp; Resolution Passed</h3>
              <p class="card-subtitle">Log formal meeting notes, resolutions passed, and voting outcomes</p>
            </div>
          </div>

          <form id="addMinutesForm">
            <div class="form-grid">
              <div class="form-group">
                <label for="minMeetingDate">Meeting Date</label>
                <input id="minMeetingDate" name="meetingDate" type="date" class="form-control" value="${todayStr}" required />
              </div>
              <div class="form-group">
                <label for="minMeetingType">Meeting Type</label>
                <select id="minMeetingType" name="meetingType" class="form-select">
                  <option value="General / Governance Review">General / Governance Review</option>
                  <option value="Emergency General Meeting (EGM)">Emergency General Meeting (EGM)</option>
                  <option value="Annual General Meeting (AGM)">Annual General Meeting (AGM)</option>
                  <option value="Finance &amp; Project Committee">Finance &amp; Project Committee</option>
                </select>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="minChairConvener">Convener / Chair</label>
                <input id="minChairConvener" name="chairConvener" type="text" class="form-control" placeholder="e.g. Meeting Convener / Chair" required />
              </div>
              <div class="form-group">
                <label for="minResolutionCode">Resolution Reference</label>
                <input id="minResolutionCode" name="resolutionCode" type="text" class="form-control" placeholder="e.g. RES-2026-02" />
              </div>
            </div>

            <div class="form-group">
              <label for="minAttendees">Attendance &amp; Quorum Summary</label>
              <input id="minAttendees" name="attendeesSummary" type="text" class="form-control" placeholder="e.g. 15 of 18 members present; quorum met" />
            </div>

            <div class="form-group">
              <label for="minSummaryNotes">Meeting Minutes / Discussion Summary</label>
              <textarea id="minSummaryNotes" name="summaryNotes" class="form-textarea" placeholder="Summarize key points discussed, decisions, and action items..." required></textarea>
            </div>

            <div class="form-group">
              <label for="minResolutionTitle">Resolution Title (Passed)</label>
              <input id="minResolutionTitle" name="resolutionTitle" type="text" class="form-control" placeholder="e.g. Approval of Q4 Budget & Arrears Policy" required />
            </div>

            <div class="form-group">
              <label for="minResolutionText">Exact Resolution Wording Passed</label>
              <textarea id="minResolutionText" name="resolutionText" class="form-textarea" placeholder="RESOLVED that..." required></textarea>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="minVoteOutcome">Voting Result</label>
                <input id="minVoteOutcome" name="voteOutcome" type="text" class="form-control" placeholder="e.g. Carried Unanimously / 14 For, 1 Against" />
              </div>
              <div class="form-group">
                <label for="minStatus">Resolution Status</label>
                <select id="minStatus" name="status" class="form-select">
                  <option value="Passed">Passed</option>
                  <option value="Deferred">Deferred</option>
                  <option value="Not Passed">Not Passed</option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn-primary">Save Minutes &amp; Resolution</button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Minutes &amp; Resolutions Register (${filtered.length})</h3>
              <p class="card-subtitle">${summary.resolutionsCount} resolution(s) recorded across ${summary.minutesCount} meeting entry(ies)</p>
            </div>
          </div>

          <div class="toolbar">
            <input
              type="text"
              id="minutesSearchInput"
              class="form-control"
              placeholder="Search minutes, resolution code, or wording..."
              value="${escapeHtml(search)}"
            />
          </div>

          <div class="record-list">
            ${listHtml || `<div class="empty-state">No meeting minutes or resolutions match your filter.</div>`}
          </div>
        </div>
      </div>
    `;
  }

  return { render };
})();
