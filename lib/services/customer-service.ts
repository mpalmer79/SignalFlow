import {
  findAllCustomers,
  findCustomerById,
} from "@/lib/repositories/customer-repository";
import { findSignalsByCustomer } from "@/lib/repositories/signal-repository";
import { findOpportunitiesByCustomer } from "@/lib/repositories/opportunity-repository";
import { findCommunicationsByCustomer } from "@/lib/repositories/communication-repository";
import { findAuditEventsByCustomer } from "@/lib/repositories/audit-repository";
import { findWorkflowRunsByCustomer } from "@/lib/repositories/workflow-repository";
import { buildIntelligenceProfile } from "@/lib/intelligence/graph-summary";
import type { Customer } from "@/lib/types/customer";
import type { Signal } from "@/lib/types/signal";
import type { Opportunity } from "@/lib/types/opportunity";
import type { Communication } from "@/lib/types/communication";
import type { AuditEvent } from "@/lib/types/audit";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";

export type TimelineKind =
  | "signal"
  | "communication"
  | "audit"
  | "opportunity"
  | "detected-opportunity"
  | "recommendation"
  | "risk"
  | "workflow";

export interface CustomerTimelineEntry {
  id: string;
  kind: TimelineKind;
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
  workflowRuns: WorkflowRunRecord[];
  intelligence: CustomerIntelligenceProfile;
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

  const [signals, opportunities, communications, auditEvents, workflowRuns] =
    await Promise.all([
      findSignalsByCustomer(id),
      findOpportunitiesByCustomer(id),
      findCommunicationsByCustomer(id),
      findAuditEventsByCustomer(id),
      findWorkflowRunsByCustomer(id),
    ]);

  const intelligence = buildIntelligenceProfile({
    customer,
    signals,
    opportunities,
    communications,
  });

  const timeline = buildTimeline(
    signals,
    opportunities,
    communications,
    auditEvents,
    intelligence,
    workflowRuns,
  );

  return {
    customer,
    signals,
    opportunities,
    communications,
    auditEvents,
    workflowRuns,
    intelligence,
    timeline,
  };
}

// The timeline merges persisted activity with derived intelligence. Detected
// opportunities, recommendations, and risk flags are anchored to the most
// recent signal time so they surface alongside the activity that produced them.
function buildTimeline(
  signals: Signal[],
  opportunities: Opportunity[],
  communications: Communication[],
  auditEvents: AuditEvent[],
  intelligence: CustomerIntelligenceProfile,
  workflowRuns: WorkflowRunRecord[],
): CustomerTimelineEntry[] {
  const latestSignalAt =
    intelligence.normalizedSignals[0]?.receivedAt ??
    signals[0]?.receivedAt ??
    new Date().toISOString();

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
    ...intelligence.detectedOpportunities.map(
      (opp, index): CustomerTimelineEntry => ({
        id: `detected-${index}`,
        kind: "detected-opportunity",
        title: opp.type,
        detail: `${opp.reason} (${opp.confidence}% confidence)`,
        occurredAt: latestSignalAt,
      }),
    ),
    ...intelligence.recommendedActions.map(
      (action, index): CustomerTimelineEntry => ({
        id: `recommendation-${index}`,
        kind: "recommendation",
        title: action.action,
        detail: action.rationale,
        occurredAt: latestSignalAt,
      }),
    ),
    ...intelligence.riskFlags.map(
      (flag, index): CustomerTimelineEntry => ({
        id: `risk-${index}`,
        kind: "risk",
        title: flag.label,
        detail: flag.influence,
        occurredAt: latestSignalAt,
      }),
    ),
    ...workflowRuns.map(
      (run): CustomerTimelineEntry => ({
        id: run.id,
        kind: "workflow",
        title: run.title,
        detail: `Outcome: ${run.outcome.replace(/-/g, " ")} (${run.actionsExecuted} executed, ${run.actionsBlocked} blocked)`,
        occurredAt: run.createdAt,
      }),
    ),
  ];

  return entries.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}
