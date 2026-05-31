import type { OpportunityStage as DbOpportunityStage } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { mapOpportunity } from "@/lib/db/mappers";
import type { Opportunity } from "@/lib/types/opportunity";

const withCustomer = {
  customer: { select: { name: true, verticalId: true } },
} as const;

export async function findAllOpportunities(
  organizationId: string,
): Promise<Opportunity[]> {
  const rows = await prisma.opportunity.findMany({
    where: { organizationId },
    include: withCustomer,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapOpportunity);
}

export async function findOpportunityById(
  organizationId: string,
  id: string,
): Promise<Opportunity | null> {
  const row = await prisma.opportunity.findFirst({
    where: { id, organizationId },
    include: withCustomer,
  });
  return row ? mapOpportunity(row) : null;
}

export async function findOpportunitiesByCustomer(
  organizationId: string,
  customerId: string,
): Promise<Opportunity[]> {
  const rows = await prisma.opportunity.findMany({
    where: { organizationId, customerId },
    include: withCustomer,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapOpportunity);
}

export interface StageCount {
  stage: DbOpportunityStage;
  count: number;
}

export async function countOpportunitiesByStage(
  organizationId: string,
): Promise<StageCount[]> {
  const grouped = await prisma.opportunity.groupBy({
    by: ["stage"],
    where: { organizationId },
    _count: { _all: true },
  });
  return grouped.map((entry) => ({
    stage: entry.stage,
    count: entry._count._all,
  }));
}

export async function countOpenOpportunities(
  organizationId: string,
): Promise<number> {
  return prisma.opportunity.count({
    where: { organizationId, stage: { notIn: ["won", "lost", "dormant"] } },
  });
}
