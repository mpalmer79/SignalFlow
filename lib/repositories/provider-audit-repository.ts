import type { ProviderAuditResultEnum } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  ProviderAuditAction,
  ProviderAuditResult,
} from "@/lib/providers/provider-audit";

export interface ProviderAuditEventRecord {
  id: string;
  providerKey: string;
  action: ProviderAuditAction;
  result: ProviderAuditResult;
  reason: string;
  createdAt: string;
}

export async function findProviderAuditEvents(
  organizationId: string,
  limit = 20,
): Promise<ProviderAuditEventRecord[]> {
  const rows = await prisma.providerAuditEvent.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    providerKey: row.providerKey,
    action: row.action as ProviderAuditAction,
    result: row.result as ProviderAuditResult,
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function recordProviderAuditEvents(
  organizationId: string,
  events: {
    providerKey: string;
    action: ProviderAuditAction;
    result: ProviderAuditResult;
    reason: string;
  }[],
): Promise<void> {
  if (events.length === 0) return;
  await prisma.providerAuditEvent.createMany({
    data: events.map((event) => ({
      organizationId,
      providerKey: event.providerKey,
      action: event.action,
      result: event.result as ProviderAuditResultEnum,
      reason: event.reason,
    })),
  });
}
