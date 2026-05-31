import type { OpportunityStage as DbOpportunityStage } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { mapOpportunity } from "@/lib/db/mappers";
import type { Opportunity } from "@/lib/types/opportunity";

const withCustomer = {
  customer: { select: { name: true, verticalId: true } },
} as const;

export async function findAllOpportunities(): Promise<Opportunity[]> {
  const rows = await prisma.opportunity.findMany({
    include: withCustomer,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapOpportunity);
}

export async function findOpportunitiesByCustomer(
  customerId: string,
): Promise<Opportunity[]> {
  const rows = await prisma.opportunity.findMany({
    where: { customerId },
    include: withCustomer,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapOpportunity);
}

export interface StageCount {
  stage: DbOpportunityStage;
  count: number;
}

export async function countOpportunitiesByStage(): Promise<StageCount[]> {
  const grouped = await prisma.opportunity.groupBy({
    by: ["stage"],
    _count: { _all: true },
  });
  return grouped.map((entry) => ({
    stage: entry.stage,
    count: entry._count._all,
  }));
}

export async function countOpenOpportunities(): Promise<number> {
  return prisma.opportunity.count({
    where: { stage: { notIn: ["won", "lost", "dormant"] } },
  });
}
