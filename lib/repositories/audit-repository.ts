import type { AuditEventType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { mapAuditEvent } from "@/lib/db/mappers";
import type { AuditEvent } from "@/lib/types/audit";

const withCustomer = {
  customer: { select: { name: true } },
} as const;

export async function findAllAuditEvents(
  organizationId: string,
): Promise<AuditEvent[]> {
  const rows = await prisma.auditEvent.findMany({
    where: { organizationId },
    include: withCustomer,
    orderBy: { occurredAt: "desc" },
  });
  return rows.map(mapAuditEvent);
}

export async function findRecentAuditEvents(
  organizationId: string,
  limit: number,
): Promise<AuditEvent[]> {
  const rows = await prisma.auditEvent.findMany({
    where: { organizationId },
    include: withCustomer,
    orderBy: { occurredAt: "desc" },
    take: limit,
  });
  return rows.map(mapAuditEvent);
}

export async function findAuditEventsByCustomer(
  organizationId: string,
  customerId: string,
): Promise<AuditEvent[]> {
  const rows = await prisma.auditEvent.findMany({
    where: { organizationId, customerId },
    include: withCustomer,
    orderBy: { occurredAt: "desc" },
  });
  return rows.map(mapAuditEvent);
}

export async function countAuditEvents(
  organizationId: string,
): Promise<number> {
  return prisma.auditEvent.count({ where: { organizationId } });
}

// Record an organization-scoped audit event that is not tied to a customer,
// such as authorization and membership lifecycle events.
export async function recordOrganizationAuditEvent(input: {
  organizationId: string;
  type: AuditEventType;
  action: string;
  policyDecision: string;
  outcome: "allowed" | "blocked" | "review" | "recorded";
}): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      organizationId: input.organizationId,
      type: input.type,
      customerId: null,
      policyDecision: input.policyDecision,
      action: input.action,
      outcome: input.outcome,
    },
  });
}
