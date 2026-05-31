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
  workflowRunId: string,
): Promise<WorkflowEffectivenessRecord | null> {
  const row = await prisma.workflowEffectivenessSnapshot.findUnique({
    where: { workflowRunId },
  });
  return row ? mapRow(row) : null;
}

export async function findAllEffectiveness(): Promise<
  WorkflowEffectivenessRecord[]
> {
  const rows = await prisma.workflowEffectivenessSnapshot.findMany({
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

export async function getEffectivenessTotals(): Promise<EffectivenessTotals> {
  const [aggregate, positiveRuns] = await Promise.all([
    prisma.workflowEffectivenessSnapshot.aggregate({
      _count: { _all: true },
      _avg: { outcomeScore: true },
    }),
    prisma.workflowEffectivenessSnapshot.count({
      where: { outcomeScore: { gte: POSITIVE_THRESHOLD } },
    }),
  ]);

  return {
    positiveRuns,
    totalRuns: aggregate._count._all,
    averageOutcomeScore: Math.round(aggregate._avg.outcomeScore ?? 0),
  };
}
