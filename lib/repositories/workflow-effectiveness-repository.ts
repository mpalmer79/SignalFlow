import { prisma } from "@/lib/db/prisma";
import type { WorkflowEffectivenessRecord } from "@/lib/types/outcome-records";

function mapRow(row: {
  id: string;
  workflowRunId: string;
  completionStatus: string;
  actionsExecuted: number;
  actionsBlocked: number;
  actionsEscalated: number;
  outcomeScore: number;
  revenueInfluenced: number;
  policyFriction: number;
  createdAt: Date;
}): WorkflowEffectivenessRecord {
  return {
    id: row.id,
    workflowRunId: row.workflowRunId,
    completionStatus: row.completionStatus,
    actionsExecuted: row.actionsExecuted,
    actionsBlocked: row.actionsBlocked,
    actionsEscalated: row.actionsEscalated,
    outcomeScore: row.outcomeScore,
    revenueInfluenced: row.revenueInfluenced,
    policyFriction: row.policyFriction,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findEffectivenessByRun(
  organizationId: string,
  workflowRunId: string,
): Promise<WorkflowEffectivenessRecord | null> {
  const row = await prisma.workflowEffectivenessSnapshot.findFirst({
    where: { organizationId, workflowRunId },
  });
  return row ? mapRow(row) : null;
}

export async function findAllEffectiveness(
  organizationId: string,
): Promise<WorkflowEffectivenessRecord[]> {
  const rows = await prisma.workflowEffectivenessSnapshot.findMany({
    where: { organizationId },
    orderBy: { outcomeScore: "desc" },
  });
  return rows.map(mapRow);
}

export interface EffectivenessTotals {
  positiveRuns: number;
  totalRuns: number;
  averageOutcomeScore: number;
}

// A run is positive when its outcome score clears the neutral baseline.
const POSITIVE_THRESHOLD = 50;

export async function getEffectivenessTotals(
  organizationId: string,
): Promise<EffectivenessTotals> {
  const [aggregate, positiveRuns] = await Promise.all([
    prisma.workflowEffectivenessSnapshot.aggregate({
      where: { organizationId },
      _count: { _all: true },
      _avg: { outcomeScore: true },
    }),
    prisma.workflowEffectivenessSnapshot.count({
      where: { organizationId, outcomeScore: { gte: POSITIVE_THRESHOLD } },
    }),
  ]);

  return {
    positiveRuns,
    totalRuns: aggregate._count._all,
    averageOutcomeScore: Math.round(aggregate._avg.outcomeScore ?? 0),
  };
}
