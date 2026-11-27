// Financial & Governance Calculations Module
window.PortalCalculations = (function () {
  function formatCurrency(amount, symbol = "£") {
    const num = Number(amount) || 0;
    const absFormatted = Math.abs(num).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return num < 0 ? `-${symbol}${absFormatted}` : `${symbol}${absFormatted}`;
  }

  function computeMemberMetrics(member, monthlyDues = 100) {
    const shareCapital = Number(member.shareCapital) || 0;
    const duesPaid = Number(member.duesPaid) || 0;
    const expectedDues = Number(member.expectedDues) || 0;
    const arrearsAmount = Math.max(0, Number((expectedDues - duesPaid).toFixed(2)));
    const monthsInArrears =
      member.monthsInArrears !== undefined && member.monthsInArrears !== null && member.monthsInArrears !== ""
        ? Number(member.monthsInArrears)
        : monthlyDues > 0
        ? Number((arrearsAmount / monthlyDues).toFixed(1))
        : 0;

    let status = member.status;
    if (!status) {
      if (monthsInArrears >= 3) {
        status = "3+ Months Arrears";
      } else if (monthsInArrears > 0) {
        status = `${monthsInArrears} Month(s) Behind`;
      } else {
        status = "Up to Date";
      }
    }

    return {
      ...member,
      shareCapital,
      duesPaid,
      expectedDues,
      arrearsAmount,
      monthsInArrears,
      status,
      totalContribution: Number((shareCapital + duesPaid).toFixed(2)),
      isThreeMonthArrears: monthsInArrears >= 3
    };
  }

  function summarizePortfolio(state, config) {
    const monthlyDues = Number(config.defaultMonthlyDues) || 100;
    const threshold = Number(config.arrearsThresholdMonths) || 3;
    const enrichedMembers = (state.members || []).map((m) => computeMemberMetrics(m, monthlyDues));

    const totalMembers = enrichedMembers.length;
    const totalShareCapital = enrichedMembers.reduce((sum, m) => sum + m.shareCapital, 0);
    const totalDuesPaid = enrichedMembers.reduce((sum, m) => sum + m.duesPaid, 0);
    const totalExpectedDues = enrichedMembers.reduce((sum, m) => sum + m.expectedDues, 0);
    const totalArrears = enrichedMembers.reduce((sum, m) => sum + m.arrearsAmount, 0);
    const threeMonthArrearsMembers = enrichedMembers.filter((m) => m.monthsInArrears >= threshold);
    const upToDateMembers = enrichedMembers.filter((m) => m.arrearsAmount === 0);

    const totalReceipts = (state.receipts || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const totalCharity = (state.charityContributions || []).reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const totalProjectBudget = (state.projects || []).reduce((sum, p) => sum + (Number(p.targetBudget) || 0), 0);
    const totalProjectSpend = (state.projects || []).reduce((sum, p) => sum + (Number(p.spentToDate) || 0), 0);

    const grossInflows = totalShareCapital + totalDuesPaid;
    const netAvailableCash = Number((grossInflows - totalReceipts - totalCharity).toFixed(2));
    const collectionRate = totalExpectedDues > 0 ? Math.min(100, (totalDuesPaid / totalExpectedDues) * 100) : 100;

    return {
      enrichedMembers,
      totalMembers,
      upToDateCount: upToDateMembers.length,
      totalShareCapital,
      totalDuesPaid,
      totalExpectedDues,
      totalArrears,
      threeMonthArrearsMembers,
      threeMonthArrearsCount: threeMonthArrearsMembers.length,
      totalReceipts,
      totalCharity,
      totalProjectBudget,
      totalProjectSpend,
      grossInflows,
      netAvailableCash,
      collectionRate,
      minutesCount: (state.minutes || []).length,
      resolutionsCount: (state.minutes || []).filter((m) => m.resolutionTitle || m.resolutionText).length,
      projectsCount: (state.projects || []).length,
      charityCount: (state.charityContributions || []).length
    };
  }

  function buildCashFlowForecast(summary, monthsAhead = 6, monthlyDuesPerMember = 100, expectedCollectionRatio = 0.85, monthlyCharityAllocation = 150, monthlyAdminBurn = 100) {
    const rows = [];
    let runningCash = summary.netAvailableCash;
    const activeMembers = summary.totalMembers || 18;
    const grossMonthlyDuesPotential = activeMembers * monthlyDuesPerMember;

    for (let i = 1; i <= monthsAhead; i++) {
      const projectedDuesInflow = Number((grossMonthlyDuesPotential * expectedCollectionRatio).toFixed(2));
      const projectedCharityOutflow = Number(monthlyCharityAllocation.toFixed(2));
      const projectedAdminOutflow = Number(monthlyAdminBurn.toFixed(2));
      const netMonthlyChange = Number((projectedDuesInflow - projectedCharityOutflow - projectedAdminOutflow).toFixed(2));
      runningCash = Number((runningCash + netMonthlyChange).toFixed(2));

      rows.push({
        monthIndex: i,
        label: `Month +${i}`,
        projectedDuesInflow,
        projectedCharityOutflow,
        projectedAdminOutflow,
        netMonthlyChange,
        endingCash: runningCash
      });
    }

    return rows;
  }

  return {
    formatCurrency,
    computeMemberMetrics,
    summarizePortfolio,
    buildCashFlowForecast
  };
})();
