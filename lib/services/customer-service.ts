import {
  findAllCustomers,
  findCustomerById,
} from "@/lib/repositories/customer-repository";
import { findSignalsByCustomer } from "@/lib/repositories/signal-repository";
import { findOpportunitiesByCustomer } from "@/lib/repositories/opportunity-repository";
import { findCommunicationsByCustomer } from "@/lib/repositories/communication-repository";
import { findAuditEventsByCustomer } from "@/lib/repositories/audit-repository";
import type { Customer } from "@/lib/types/customer";
import type { Signal } from "@/lib/types/signal";
import type { Opportunity } from "@/lib/types/opportunity";
import type { Communication } from "@/lib/types/communication";
import type { AuditEvent } from "@/lib/types/audit";

export interface CustomerTimelineEntry {
  id: string;
  kind: "signal" | "communication" | "audit" | "opportunity";
  title: string;
  detail: string;
  occurredAt: string;
}

export interface CustomerProfile {
  customer: Customer;
  signals: Signal[];
  opportunities: Opportunity[];
  communications: Communication[];
  auditEvents: AuditEvent[];
  timeline: CustomerTimelineEntry[];
}

export async function listCustomers(): Promise<Customer[]> {
  return findAllCustomers();
}

export async function getCustomerProfile(
  id: string,
): Promise<CustomerProfile | null> {
  const customer = await findCustomerById(id);
  if (!customer) return null;

  const [signals, opportunities, communications, auditEvents] =
    await Promise.all([
      findSignalsByCustomer(id),
      findOpportunitiesByCustomer(id),
      findCommunicationsByCustomer(id),
      findAuditEventsByCustomer(id),
    ]);

  const timeline = buildTimeline(
    signals,
    opportunities,
    communications,
    auditEvents,
  );

  return { customer, signals, opportunities, communications, auditEvents, timeline };
}

function buildTimeline(
  signals: Signal[],
  opportunities: Opportunity[],
  communications: Communication[],
  auditEvents: AuditEvent[],
): CustomerTimelineEntry[] {
  const entries: CustomerTimelineEntry[] = [
    ...signals.map(
      (signal): CustomerTimelineEntry => ({
        id: signal.id,
        kind: "signal",
        title: signal.label,
        detail: signal.detail,
        occurredAt: signal.receivedAt,
      }),
    ),
    ...communications.map(
      (comm): CustomerTimelineEntry => ({
        id: comm.id,
        kind: "communication",
        title: comm.subject,
        detail: comm.preview,
        occurredAt: comm.createdAt,
      }),
    ),
    ...auditEvents.map(
      (event): CustomerTimelineEntry => ({
        id: event.id,
        kind: "audit",
        title: event.type,
        detail: event.action,
        occurredAt: event.occurredAt,
      }),
    ),
    ...opportunities.map(
      (opp): CustomerTimelineEntry => ({
        id: opp.id,
        kind: "opportunity",
        title: opp.title,
        detail: `Stage: ${opp.stage}`,
        occurredAt: opp.updatedAt,
      }),
    ),
  ];

  return entries.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}
