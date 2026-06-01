import type { AIAggregate } from "@/lib/repositories/ai-repository";

// A single shared shape for headline KPIs that appear on multiple pages.
// Dashboard, Revenue Command Center, AI Center, and Executive Insights all
// read these values from the same derivation so they cannot drift apart.
export interface SharedHeadlineMetrics {
  // Reviewable totals.
  recommendations: number;
  approved: number;
  rejected: number;
  pendingReview: number;
  escalated: number;
  highRiskRecommendations: number;
  averageConfidence: number;
  // Approval rate is the share of reviewed recommendations (approved + rejected)
  // that were approved. This is the single source of truth and replaces the
  // earlier "approved / total" math which counted pending plans as not approved
  // and produced a different number on different pages.
  approvalRate: number;
  // Cross-domain headline values.
  activeSignals: number;
  customers: number;
  revenueInfluenced: number;
  missedRevenue: number;
}

// Pure derivation. Takes the raw aggregates from the repositories and returns
// the canonical headline metrics. No Prisma, no React, no network. Easy to test.
export function deriveSharedHeadlineMetrics(input: {
  ai: AIAggregate;
  signalCount: number;
  customerCount: number;
  revenueInfluenced: number;
  missedRevenue: number;
}): SharedHeadlineMetrics {
  const { ai } = input;
  const decided = ai.approved + ai.rejected;
  const approvalRate =
    decided > 0 ? Math.round((ai.approved / decided) * 100) : 0;
  return {
    recommendations: ai.total,
    approved: ai.approved,
    rejected: ai.rejected,
    pendingReview: ai.pendingReview,
    escalated: ai.escalated,
    highRiskRecommendations: ai.highRisk,
    averageConfidence: ai.averageConfidence,
    approvalRate,
    activeSignals: input.signalCount,
    customers: input.customerCount,
    revenueInfluenced: input.revenueInfluenced,
    missedRevenue: input.missedRevenue,
  };
}
