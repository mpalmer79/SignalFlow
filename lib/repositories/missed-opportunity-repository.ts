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

export async function findAllMissedOpportunities(
  organizationId: string,
): Promise<MissedOpportunityRecord[]> {
  const rows = await prisma.missedOpportunityEstimate.findMany({
    where: { organizationId },
    include: withCustomerName,
    orderBy: { estimatedValue: "desc" },
  });
  return rows.map(mapRow);
}

export async function findMissedByCustomer(
  organizationId: string,
  customerId: string,
): Promise<MissedOpportunityRecord[]> {
  const rows = await prisma.missedOpportunityEstimate.findMany({
    where: { organizationId, customerId },
    include: withCustomerName,
    orderBy: { estimatedValue: "desc" },
  });
  return rows.map(mapRow);
}

export async function findMissedByOpportunity(
  organizationId: string,
  opportunityId: string,
): Promise<MissedOpportunityRecord[]> {
  const rows = await prisma.missedOpportunityEstimate.findMany({
    where: { organizationId, opportunityId },
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

export async function getMissedTotals(
  organizationId: string,
): Promise<MissedTotals> {
  const [aggregate, criticalCount] = await Promise.all([
    prisma.missedOpportunityEstimate.aggregate({
      where: { organizationId },
      _sum: { estimatedValue: true },
      _count: { _all: true },
    }),
    prisma.missedOpportunityEstimate.count({
      where: { organizationId, severity: "critical" },
    }),
  ]);

  return {
    totalEstimated: aggregate._sum.estimatedValue ?? 0,
    count: aggregate._count._all,
    criticalCount,
  };
}
