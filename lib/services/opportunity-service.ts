import {
  findAllOpportunities,
  findOpportunityById,
  countOpportunitiesByStage,
} from "@/lib/repositories/opportunity-repository";
import { findTransitionsByOpportunity } from "@/lib/repositories/stage-transition-repository";
import { findOutcomeEventsByOpportunity } from "@/lib/repositories/outcome-repository";
import { findAttributionsByOpportunity } from "@/lib/repositories/attribution-repository";
import { findMissedByOpportunity } from "@/lib/repositories/missed-opportunity-repository";
import type { RequestContext } from "@/lib/types/auth";
import type { Opportunity, OpportunityStage } from "@/lib/types/opportunity";
import type {
  MissedOpportunityRecord,
  OutcomeEventRecord,
  RevenueAttributionRecord,
  StageTransitionRecord,
} from "@/lib/types/outcome-records";

const STAGE_ORDER: OpportunityStage[] = [
  "new",
  "contact-attempted",
  "engaged",
  "appointment-set",
  "needs-human-review",
  "won",
  "lost",
  "dormant",
  "reactivated",
];

export interface PipelineColumn {
  stage: OpportunityStage;
  opportunities: Opportunity[];
}

export async function listOpportunities(
  context: RequestContext,
): Promise<Opportunity[]> {
  return findAllOpportunities(context.organizationId);
}

export async function getPipeline(
  context: RequestContext,
): Promise<PipelineColumn[]> {
  const all = await findAllOpportunities(context.organizationId);
  return STAGE_ORDER.map((stage) => ({
    stage,
    opportunities: all.filter((opp) => opp.stage === stage),
  }));
}

export async function listHighIntentOpportunities(
  context: RequestContext,
  minScore: number,
  limit: number,
): Promise<Opportunity[]> {
  const all = await findAllOpportunities(context.organizationId);
  return all
    .filter((opp) => opp.intentScore >= minScore && opp.stage !== "lost")
    .sort((a, b) => b.intentScore - a.intentScore)
    .slice(0, limit);
}

export interface OpportunityDetail {
  opportunity: Opportunity;
  transitions: StageTransitionRecord[];
  outcomeEvents: OutcomeEventRecord[];
  attributions: RevenueAttributionRecord[];
  missed: MissedOpportunityRecord[];
}

export async function getOpportunityDetail(
  context: RequestContext,
  id: string,
): Promise<OpportunityDetail | null> {
  const orgId = context.organizationId;
  const opportunity = await findOpportunityById(orgId, id);
  if (!opportunity) return null;

  const [transitions, outcomeEvents, attributions, missed] = await Promise.all([
    findTransitionsByOpportunity(orgId, id),
    findOutcomeEventsByOpportunity(orgId, id),
    findAttributionsByOpportunity(orgId, id),
    findMissedByOpportunity(orgId, id),
  ]);

  return { opportunity, transitions, outcomeEvents, attributions, missed };
}

export async function getStageCounts(
  context: RequestContext,
): Promise<Record<OpportunityStage, number>> {
  const grouped = await countOpportunitiesByStage(context.organizationId);
  const counts = Object.fromEntries(
    STAGE_ORDER.map((stage) => [stage, 0]),
  ) as Record<OpportunityStage, number>;
  for (const entry of grouped) {
    const stage = entry.stage.replace(/_/g, "-") as OpportunityStage;
    counts[stage] = entry.count;
  }
  return counts;
}
