import { describe, it, expect } from "vitest";
import { deriveSharedHeadlineMetrics } from "@/lib/metrics/shared-metrics";

const baseAi = {
  total: 100,
  pendingReview: 30,
  approved: 50,
  rejected: 10,
  escalated: 5,
  averageConfidence: 72,
  highRisk: 8,
};

describe("deriveSharedHeadlineMetrics", () => {
  it("computes approval rate from reviewed recommendations only", () => {
    const result = deriveSharedHeadlineMetrics({
      ai: baseAi,
      signalCount: 200,
      customerCount: 110,
      revenueInfluenced: 50000,
      missedRevenue: 12000,
    });
    // 50 approved out of 60 decided is 83.
    expect(result.approvalRate).toBe(83);
    expect(result.recommendations).toBe(100);
    expect(result.activeSignals).toBe(200);
    expect(result.customers).toBe(110);
    expect(result.revenueInfluenced).toBe(50000);
    expect(result.missedRevenue).toBe(12000);
  });

  it("returns zero approval rate when nothing has been decided", () => {
    const result = deriveSharedHeadlineMetrics({
      ai: { ...baseAi, approved: 0, rejected: 0 },
      signalCount: 0,
      customerCount: 0,
      revenueInfluenced: 0,
      missedRevenue: 0,
    });
    expect(result.approvalRate).toBe(0);
  });

  it("does not let pending recommendations dilute approval rate", () => {
    // 50 approved, 10 rejected, 40 pending. Approval should still be 50 / 60.
    const result = deriveSharedHeadlineMetrics({
      ai: { ...baseAi, total: 100, pendingReview: 40 },
      signalCount: 0,
      customerCount: 0,
      revenueInfluenced: 0,
      missedRevenue: 0,
    });
    expect(result.approvalRate).toBe(83);
  });

  it("is deterministic for the same input", () => {
    const input = {
      ai: baseAi,
      signalCount: 1,
      customerCount: 1,
      revenueInfluenced: 1,
      missedRevenue: 1,
    };
    expect(deriveSharedHeadlineMetrics(input)).toEqual(
      deriveSharedHeadlineMetrics(input),
    );
  });
});
