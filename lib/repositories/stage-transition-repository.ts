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
  organizationId: string,
  opportunityId: string,
): Promise<StageTransitionRecord[]> {
  const rows = await prisma.stageTransition.findMany({
    where: { organizationId, opportunityId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapRow);
}

export async function countReactivations(
  organizationId: string,
): Promise<number> {
  return prisma.stageTransition.count({
    where: { organizationId, toStage: "reactivated" },
  });
}

export async function countTransitions(
  organizationId: string,
): Promise<number> {
  return prisma.stageTransition.count({ where: { organizationId } });
}
