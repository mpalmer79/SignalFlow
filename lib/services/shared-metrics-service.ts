import {
  aggregateRecommendations,
  type AIAggregate,
} from "@/lib/repositories/ai-repository";
import { countSignals } from "@/lib/repositories/signal-repository";
import { countCustomers } from "@/lib/repositories/customer-repository";
import {
  getAttributionTotals,
} from "@/lib/repositories/attribution-repository";
import { getMissedTotals } from "@/lib/repositories/missed-opportunity-repository";
import {
  deriveSharedHeadlineMetrics,
  type SharedHeadlineMetrics,
} from "@/lib/metrics/shared-metrics";
import type { RequestContext } from "@/lib/types/auth";

// One canonical source of the shared KPI numbers. Dashboard, Revenue Command
// Center, AI Center, and Executive Insights all call this so they cannot drift
// out of sync. Issues a small set of parallel queries; no extra work over the
// previous per-page aggregations.
export async function getSharedHeadlineMetrics(
  context: RequestContext,
): Promise<SharedHeadlineMetrics> {
  const orgId = context.organizationId;
  const [ai, signalCount, customerCount, attribution, missed] = await Promise.all([
    aggregateRecommendations(orgId),
    countSignals(orgId),
    countCustomers(orgId),
    getAttributionTotals(orgId),
    getMissedTotals(orgId),
  ]);

  return deriveSharedHeadlineMetrics({
    ai,
    signalCount,
    customerCount,
    revenueInfluenced: attribution.revenueInfluenced,
    missedRevenue: missed.totalEstimated,
  });
}

// Re-export for callers that already have an AIAggregate but want the canonical
// derivation (used when an existing service already loaded the AI aggregate).
export function buildSharedHeadlineMetrics(input: {
  ai: AIAggregate;
  signalCount: number;
  customerCount: number;
  revenueInfluenced: number;
  missedRevenue: number;
}): SharedHeadlineMetrics {
  return deriveSharedHeadlineMetrics(input);
}
