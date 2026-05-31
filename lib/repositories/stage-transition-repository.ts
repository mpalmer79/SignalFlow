import type { OpportunityStage as DbStage } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { OpportunityStage } from "@/lib/types/opportunity";
import type { StageTransitionRecord } from "@/lib/types/outcome-records";

function stageFromDb(stage: DbStage): OpportunityStage {
  return stage.replace(/_/g, "-") as OpportunityStage;
}

function mapRow(row: {
  id: string;
  opportunityId: string;
  fromStage: DbStage;
  toStage: DbStage;
  reason: string;
  triggeredBy: string;
  createdAt: Date;
}): StageTransitionRecord {
  return {
    id: row.id,
    opportunityId: row.opportunityId,
    fromStage: stageFromDb(row.fromStage),
    toStage: stageFromDb(row.toStage),
    reason: row.reason,
    triggeredBy: row.triggeredBy,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findTransitionsByOpportunity(
  opportunityId: string,
): Promise<StageTransitionRecord[]> {
  const rows = await prisma.stageTransition.findMany({
    where: { opportunityId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapRow);
}

export async function countReactivations(): Promise<number> {
  return prisma.stageTransition.count({ where: { toStage: "reactivated" } });
}

export async function countTransitions(): Promise<number> {
  return prisma.stageTransition.count();
}
