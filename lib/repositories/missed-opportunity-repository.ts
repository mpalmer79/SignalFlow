import type { MissedOpportunitySeverity as DbSeverity } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { MissedOpportunitySeverity } from "@/lib/types/outcome";
import type { MissedOpportunityRecord } from "@/lib/types/outcome-records";

const withCustomerName = {
  customer: { select: { name: true } },
} as const;

function mapRow(row: {
  id: string;
  customerId: string;
  customer: { name: string };
  opportunityId: string | null;
  estimatedValue: number;
  missedReason: string;
  severity: DbSeverity;
  recommendedRecoveryAction: string;
  createdAt: Date;
}): MissedOpportunityRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    opportunityId: row.opportunityId,
    estimatedValue: row.estimatedValue,
    reason: row.missedReason,
    severity: row.severity as MissedOpportunitySeverity,
    recommendedRecoveryAction: row.recommendedRecoveryAction,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findAllMissedOpportunities(): Promise<
  MissedOpportunityRecord[]
> {
  const rows = await prisma.missedOpportunityEstimate.findMany({
    include: withCustomerName,
    orderBy: { estimatedValue: "desc" },
  });
  return rows.map(mapRow);
}

export async function findMissedByCustomer(
  customerId: string,
): Promise<MissedOpportunityRecord[]> {
  const rows = await prisma.missedOpportunityEstimate.findMany({
    where: { customerId },
    include: withCustomerName,
    orderBy: { estimatedValue: "desc" },
  });
  return rows.map(mapRow);
}

export async function findMissedByOpportunity(
  opportunityId: string,
): Promise<MissedOpportunityRecord[]> {
  const rows = await prisma.missedOpportunityEstimate.findMany({
    where: { opportunityId },
    include: withCustomerName,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRow);
}

export interface MissedTotals {
  totalEstimated: number;
  count: number;
  criticalCount: number;
}

export async function getMissedTotals(): Promise<MissedTotals> {
  const [aggregate, criticalCount] = await Promise.all([
    prisma.missedOpportunityEstimate.aggregate({
      _sum: { estimatedValue: true },
      _count: { _all: true },
    }),
    prisma.missedOpportunityEstimate.count({ where: { severity: "critical" } }),
  ]);

  return {
    totalEstimated: aggregate._sum.estimatedValue ?? 0,
    count: aggregate._count._all,
    criticalCount,
  };
}
