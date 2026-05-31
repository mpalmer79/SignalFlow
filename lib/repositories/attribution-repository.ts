import type { AttributionType as DbAttributionType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AttributionType } from "@/lib/types/outcome";
import type { RevenueAttributionRecord } from "@/lib/types/outcome-records";

const withCustomerName = {
  customer: { select: { name: true } },
} as const;

function mapRow(row: {
  id: string;
  customerId: string;
  customer: { name: string };
  opportunityId: string | null;
  workflowRunId: string | null;
  attributedAmount: number;
  attributionType: DbAttributionType;
  attributionReason: string;
  confidence: number;
  createdAt: Date;
}): RevenueAttributionRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    opportunityId: row.opportunityId,
    workflowRunId: row.workflowRunId,
    attributedAmount: row.attributedAmount,
    attributionType: row.attributionType as AttributionType,
    reason: row.attributionReason,
    confidence: row.confidence,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findAllAttributions(
  organizationId: string,
): Promise<RevenueAttributionRecord[]> {
  const rows = await prisma.revenueAttribution.findMany({
    where: { organizationId },
    include: withCustomerName,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRow);
}

export async function findAttributionsByOpportunity(
  organizationId: string,
  opportunityId: string,
): Promise<RevenueAttributionRecord[]> {
  const rows = await prisma.revenueAttribution.findMany({
    where: { organizationId, opportunityId },
    include: withCustomerName,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRow);
}

export async function findAttributionsByCustomer(
  organizationId: string,
  customerId: string,
): Promise<RevenueAttributionRecord[]> {
  const rows = await prisma.revenueAttribution.findMany({
    where: { organizationId, customerId },
    include: withCustomerName,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRow);
}

export interface AttributionTotals {
  revenueInfluenced: number;
  recoveredCount: number;
  byType: { type: AttributionType; amount: number; count: number }[];
}

// Revenue influenced excludes MISSED, which represents value not captured.
export async function getAttributionTotals(
  organizationId: string,
): Promise<AttributionTotals> {
  const grouped = await prisma.revenueAttribution.groupBy({
    by: ["attributionType"],
    where: { organizationId },
    _sum: { attributedAmount: true },
    _count: { _all: true },
  });

  let revenueInfluenced = 0;
  let recoveredCount = 0;
  const byType = grouped.map((g) => {
    const amount = g._sum.attributedAmount ?? 0;
    const type = g.attributionType as AttributionType;
    if (type !== "MISSED") revenueInfluenced += amount;
    if (type === "RECOVERED") recoveredCount += g._count._all;
    return { type, amount, count: g._count._all };
  });

  return { revenueInfluenced, recoveredCount, byType };
}
