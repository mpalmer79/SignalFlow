import {
  findAllOpportunities,
  countOpportunitiesByStage,
} from "@/lib/repositories/opportunity-repository";
import type { Opportunity, OpportunityStage } from "@/lib/types/opportunity";

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

export async function listOpportunities(): Promise<Opportunity[]> {
  return findAllOpportunities();
}

export async function getPipeline(): Promise<PipelineColumn[]> {
  const all = await findAllOpportunities();
  return STAGE_ORDER.map((stage) => ({
    stage,
    opportunities: all.filter((opp) => opp.stage === stage),
  }));
}

export async function listHighIntentOpportunities(
  minScore: number,
  limit: number,
): Promise<Opportunity[]> {
  const all = await findAllOpportunities();
  return all
    .filter((opp) => opp.intentScore >= minScore && opp.stage !== "lost")
    .sort((a, b) => b.intentScore - a.intentScore)
    .slice(0, limit);
}

export async function getStageCounts(): Promise<
  Record<OpportunityStage, number>
> {
  const grouped = await countOpportunitiesByStage();
  const counts = Object.fromEntries(
    STAGE_ORDER.map((stage) => [stage, 0]),
  ) as Record<OpportunityStage, number>;
  for (const entry of grouped) {
    const stage = entry.stage.replace(/_/g, "-") as OpportunityStage;
    counts[stage] = entry.count;
  }
  return counts;
}
