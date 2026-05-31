import { findAllAuditEvents } from "@/lib/repositories/audit-repository";
import type { RequestContext } from "@/lib/types/auth";
import type { AuditEvent } from "@/lib/types/audit";

export async function listAuditEvents(
  context: RequestContext,
): Promise<AuditEvent[]> {
  return findAllAuditEvents(context.organizationId);
}
