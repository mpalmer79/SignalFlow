import { findAllWorkflowRuns } from "@/lib/repositories/workflow-repository";
import { findAllEffectiveness } from "@/lib/repositories/workflow-effectiveness-repository";
import { findAllMissedOpportunities } from "@/lib/repositories/missed-opportunity-repository";
import {
  findAllAttributions,
  getAttributionTotals,
} from "@/lib/repositories/attribution-repository";
import { findAllOpportunities } from "@/lib/repositories/opportunity-repository";
import { countReactivations } from "@/lib/repositories/stage-transition-repository";
import { getRevenueOverview } from "./revenue-engine-service";
import {
  aggregateRecommendations,
  getRecommendationAnalytics,
  type TypeApproval,
  type VerticalConfidence,
} from "@/lib/repositories/ai-repository";
import { detectRevenueLeaks } from "@/lib/analytics/revenue-leak-engine";
import { buildExecutiveSummary } from "@/lib/analytics/executive-summary";
import { computeWorkflowInsights } from "@/lib/analytics/workflow-insights";
import { computeOpportunityInsights } from "@/lib/analytics/opportunity-insights";
import { computeAttributionInsights } from "@/lib/analytics/attribution-insights";
import type { RequestContext } from "@/lib/types/auth";
import type {
  ExecutiveSummary,
  OpportunityInsight,
  RevenueLeak,
  WorkflowInsight,
} from "@/lib/types/analytics";
import type { AttributionInsight } from "@/lib/analytics/attribution-insights";

export interface AITrustedType {
  recommendationType: string;
  total: number;
  approvalRate: number;
}

export interface AIExecutiveInsights {
  total: number;
  averageConfidence: number;
  approvalRate: number;
  pendingReview: number;
  escalated: number;
  reviewBottleneck: number;
  mostTrustedType: AITrustedType | null;
  highestConfidenceVertical: VerticalConfidence | null;
  byType: TypeApproval[];
  byVertical: VerticalConfidence[];
}

export interface ExecutiveInsights {
  summary: ExecutiveSummary;
  leaks: RevenueLeak[];
  workflowInsights: WorkflowInsight[];
  bestWorkflow: WorkflowInsight | null;
  worstWorkflow: WorkflowInsight | null;
  mostExpensiveFailure: { title: string; missedValue: number } | null;
  opportunityInsights: OpportunityInsight[];
  attributionInsights: AttributionInsight[];
  ai: AIExecutiveInsights;
}

export async function getExecutiveInsights(
  context: RequestContext,
): Promise<ExecutiveInsights> {
  const orgId = context.organizationId;
  const [
    runs,
    effectiveness,
    missed,
    attributions,
    attributionTotals,
    opportunities,
    reactivations,
    overview,
    aiAggregate,
    aiAnalytics,
  ] = await Promise.all([
    findAllWorkflowRuns(orgId),
    findAllEffectiveness(orgId),
    findAllMissedOpportunities(orgId),
    findAllAttributions(orgId),
    getAttributionTotals(orgId),
    findAllOpportunities(orgId),
    countReactivations(orgId),
    getRevenueOverview(context),
    aggregateRecommendations(orgId),
    getRecommendationAnalytics(orgId),
  ]);

  const decidedRecommendations = aiAggregate.approved + aiAggregate.rejected;
  const ai: AIExecutiveInsights = {
    total: aiAggregate.total,
    averageConfidence: aiAggregate.averageConfidence,
    approvalRate:
      decidedRecommendations > 0
        ? Math.round((aiAggregate.approved / decidedRecommendations) * 100)
        : 0,
    pendingReview: aiAggregate.pendingReview,
    escalated: aiAggregate.escalated,
    reviewBottleneck: aiAggregate.pendingReview + aiAggregate.escalated,
    mostTrustedType:
      aiAnalytics.byType
        .filter((type) => type.total >= 3)
        .map((type) => ({
          recommendationType: type.recommendationType,
          total: type.total,
          approvalRate:
            type.total > 0
              ? Math.round((type.approved / type.total) * 100)
              : 0,
        }))
        .sort((a, b) => b.approvalRate - a.approvalRate)[0] ?? null,
    highestConfidenceVertical: aiAnalytics.byVertical[0] ?? null,
    byType: aiAnalytics.byType,
    byVertical: aiAnalytics.byVertical,
  };

  const leaks = detectRevenueLeaks(missed);
  const workflowResult = computeWorkflowInsights(runs, effectiveness);
  const opportunityInsights = computeOpportunityInsights(
    opportunities,
    attributions,
  );
  const attributionInsights = computeAttributionInsights(attributions);

  const policyFriction = effectiveness.reduce(
    (sum, e) => sum + e.policyFriction,
    0,
  );

  const summary = buildExecutiveSummary({
    revenueInfluenced: attributionTotals.revenueInfluenced,
    recoveredOpportunities: attributionTotals.recoveredCount,
    reactivations,
    policyFriction,
    topWorkflowTitle: workflowResult.bestWorkflow?.title ?? "Not enough data",
    memory: overview.memory,
    leaks,
  });

  return {
    summary,
    leaks,
    workflowInsights: workflowResult.byTitle,
    bestWorkflow: workflowResult.bestWorkflow,
    worstWorkflow: workflowResult.worstWorkflow,
    mostExpensiveFailure: workflowResult.mostExpensiveFailure,
    opportunityInsights,
    attributionInsights,
    ai,
  };
}

// Revenue leak summary for the dashboard, derived from persisted missed
// opportunities.
export async function getRevenueLeakSummary(
  context: RequestContext,
): Promise<RevenueLeak[]> {
  const missed = await findAllMissedOpportunities(context.organizationId);
  return detectRevenueLeaks(missed);
}
