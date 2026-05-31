import { prisma } from "@/lib/db/prisma";
import { mapAuditEvent } from "@/lib/db/mappers";
import type { AuditEvent } from "@/lib/types/audit";

const withCustomer = {
  customer: { select: { name: true } },
} as const;

export async function findAllAuditEvents(): Promise<AuditEvent[]> {
  const rows = await prisma.auditEvent.findMany({
    include: withCustomer,
    orderBy: { occurredAt: "desc" },
  });
  return rows.map(mapAuditEvent);
}

export async function findRecentAuditEvents(
  limit: number,
): Promise<AuditEvent[]> {
  const rows = await prisma.auditEvent.findMany({
    include: withCustomer,
    orderBy: { occurredAt: "desc" },
    take: limit,
  });
  return rows.map(mapAuditEvent);
}

export async function findAuditEventsByCustomer(
  customerId: string,
): Promise<AuditEvent[]> {
  const rows = await prisma.auditEvent.findMany({
    where: { customerId },
    include: withCustomer,
    orderBy: { occurredAt: "desc" },
  });
  return rows.map(mapAuditEvent);
}

export async function countAuditEvents(): Promise<number> {
  return prisma.auditEvent.count();
}
