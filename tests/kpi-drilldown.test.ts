import { describe, it, expect } from "vitest";
import {
  buildKpiDrilldowns,
  splitTotal,
  type KpiDrilldownInput,
} from "@/lib/revenue/kpi-drilldown";

// The figures from the command center screenshots, used so the assertions read
// against known values.
const input: KpiDrilldownInput = {
  signals: 220,
  recommendations: 110,
  approvedRecommendations: 36,
  rejectedRecommendations: 31,
  pendingReview: 24,
  revenueInfluenced: 306650,
  workflowRuns: 110,
  positiveOutcomes: 61,
  missedOpportunityValue: 282381,
  criticalMissed: 7,
  openOpportunities: 74,
  customers: 110,
  reactivations: 4,
  recoveredOpportunities: 9,
  approvalRate: 54,
  completionRate: 55,
  lifecycleCounts: {
    signals: 220,
    intelligence: 110,
    recommendation: 110,
    review: 64,
    workflow: 110,
    outcome: 61,
    attribution: 94,
  },
};

function sumNumericRows(value: string): number {
  return Number(value.replace(/[^0-9.-]/g, ""));
}

describe("splitTotal", () => {
  it("splits a total into parts that sum exactly to the total", () => {
    expect(splitTotal(220, [30, 22, 18, 16, 14]).reduce((a, b) => a + b, 0)).toBe(
      220,
    );
    expect(splitTotal(7, [1, 1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(7);
    expect(splitTotal(0, [1, 2, 3])).toEqual([0, 0, 0]);
  });

  it("is deterministic", () => {
    expect(splitTotal(306650, [28, 24, 20, 16, 12])).toEqual(
      splitTotal(306650, [28, 24, 20, 16, 12]),
    );
  });

  it("returns one part per weight", () => {
    expect(splitTotal(100, [1, 1, 1])).toHaveLength(3);
  });
});

describe("buildKpiDrilldowns", () => {
  const groups = buildKpiDrilldowns(input);

  it("produces 6, 8, and 7 cards across the three sections", () => {
    expect(groups.today).toHaveLength(6);
    expect(groups.executive).toHaveLength(8);
    expect(groups.lifecycle).toHaveLength(7);
  });

  it("gives every card a unique id and a value matching the requested value", () => {
    const all = [...groups.today, ...groups.executive, ...groups.lifecycle];
    expect(new Set(all.map((k) => k.id)).size).toBe(all.length);
    expect(all.length).toBe(21);
    for (const kpi of all) {
      expect(kpi.value.length).toBeGreaterThan(0);
      expect(kpi.rows.length).toBeGreaterThan(0);
      expect(kpi.columns.length).toBeGreaterThanOrEqual(2);
      expect(kpi.demoNote.length).toBeGreaterThan(0);
    }
  });

  it("reconciles count breakdown rows to the headline value", () => {
    const checks: Array<[string, number]> = [
      ["today-signals", input.signals],
      ["today-open-opportunities", input.openOpportunities],
      ["exec-customers", input.customers],
      ["life-signals", input.lifecycleCounts.signals],
      ["life-review", input.lifecycleCounts.review],
      ["life-attribution", input.lifecycleCounts.attribution],
    ];
    const all = [...groups.today, ...groups.executive, ...groups.lifecycle];
    for (const [id, total] of checks) {
      const kpi = all.find((k) => k.id === id);
      expect(kpi, id).toBeDefined();
      const rowSum = kpi!.rows.reduce(
        (sum, row) => sum + sumNumericRows(row.value),
        0,
      );
      expect(rowSum, id).toBe(total);
    }
  });

  it("reconciles the revenue dollar breakdown to the influenced total", () => {
    const kpi = groups.today.find((k) => k.id === "today-revenue")!;
    const rowSum = kpi.rows.reduce(
      (sum, row) => sum + sumNumericRows(row.value),
      0,
    );
    expect(rowSum).toBe(input.revenueInfluenced);
  });

  it("limits reactivation examples to the headline count", () => {
    const kpi = groups.executive.find((k) => k.id === "exec-reactivations")!;
    expect(kpi.rows).toHaveLength(input.reactivations);
  });

  it("is deterministic for the same input", () => {
    expect(buildKpiDrilldowns(input)).toEqual(buildKpiDrilldowns(input));
  });
});
