import type { OpportunityInsight } from "@/lib/types/analytics";
import type { Opportunity } from "@/lib/types/opportunity";
import type { RevenueAttributionRecord } from "@/lib/types/outcome-records";

// Aggregate opportunities and attributions into per-vertical insights with a
// simple deterministic conversion rate. Pure reduction.
export function computeOpportunityInsights(
  opportunities: Opportunity[],
  attributions: RevenueAttributionRecord[],
): OpportunityInsight[] {
  const influencedByVertical = new Map<string, number>();
  const oppByVertical = new Map<string, number>();

  for (const opp of opportunities) {
    oppByVertical.set(opp.vertical, (oppByVertical.get(opp.vertical) ?? 0) + 1);
  }

  const influencedOppIds = new Set(
    attributions
      .filter((a) => a.attributionType !== "MISSED" && a.opportunityId)
      .map((a) => a.opportunityId as string),
  );

  for (const opp of opportunities) {
    if (influencedOppIds.has(opp.id)) {
      influencedByVertical.set(
        opp.vertical,
        (influencedByVertical.get(opp.vertical) ?? 0) + 1,
      );
    }
  }

  return Array.from(oppByVertical.entries())
    .map(([vertical, total]) => {
      const influenced = influencedByVertical.get(vertical) ?? 0;
      return {
        vertical,
        total,
        influenced,
        conversionRate: total > 0 ? Math.round((influenced / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.influenced - a.influenced);
}
