import { findAllAuditEvents } from "@/lib/repositories/audit-repository";
import type { AuditEvent } from "@/lib/types/audit";

export async function listAuditEvents(): Promise<AuditEvent[]> {
  return findAllAuditEvents();
}
