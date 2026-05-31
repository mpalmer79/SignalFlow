import type { Customer } from "@/lib/types/customer";
import type { Communication } from "@/lib/types/communication";
import type { Opportunity } from "@/lib/types/opportunity";
import type { OutcomeContext } from "@/lib/types/outcome";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { RequestContext } from "@/lib/types/auth";
import { assessOutcomes } from "@/lib/outcomes/outcome-engine";
import {
  findOutcomeEventsByCustomer,
  findOutcomeEventsByOpportunity,
} from "@/lib/repositories/outcome-repository";
import type { OutcomeEventRecord } from "@/lib/types/outcome-records";

const RESPONSE_STATUSES = new Set(["replied", "delivered"]);
const OPEN_STAGES_EXCLUDED = new Set(["won", "lost", "dormant"]);

export interface BuildContextInput {
  customer: Customer;
  profile: CustomerIntelligenceProfile;
  communications: Communication[];
  opportunities: Opportunity[];
  run: WorkflowRunRecord;
}

// Assemble the deterministic outcome context from persisted domain objects and
// a workflow run. Shared by the seed and the revenue engine service so the
// engine always sees the same shape.
export function buildOutcomeContext(input: BuildContextInput): OutcomeContext {
  const { customer, profile, communications, opportunities, run } = input;

  const executedActionTypes = run.actions
    .filter((a) => a.status === "executed")
    .map((a) => a.actionType);
  const blockedActionTypes = run.actions
    .filter((a) => a.status === "blocked")
    .map((a) => a.actionType);

  const attachedOpportunity =
    opportunities.find((opp) => !OPEN_STAGES_EXCLUDED.has(opp.stage)) ??
    opportunities[0] ??
    null;

  return {
    customerId: customer.id,
    customerName: customer.name,
    vertical: customer.vertical,
    optedOut: customer.optedOut,
    intentScore: profile.intentScore,
    opportunityScore: profile.opportunityScore,
    engagementScore: profile.engagementScore,
    consentSummary: profile.consentSummary,
    hasCriticalRisk: profile.riskFlags.some((f) => f.severity === "critical"),
    hasRecentResponse: communications.some((c) =>
      RESPONSE_STATUSES.has(c.status),
    ),
    workflowOutcome: run.outcome,
    actionsExecuted: run.actionsExecuted,
    actionsBlocked: run.actionsBlocked,
    actionsEscalated: run.actionsEscalated,
    executedActionTypes,
    blockedActionTypes,
    opportunity: attachedOpportunity
      ? {
          id: attachedOpportunity.id,
          title: attachedOpportunity.title,
          stage: attachedOpportunity.stage,
          estimatedValue: attachedOpportunity.estimatedValue,
        }
      : null,
  };
}

// Re-export the pure engine so callers compose through the service boundary.
export { assessOutcomes };

export async function listOutcomeEventsByCustomer(
  context: RequestContext,
  customerId: string,
): Promise<OutcomeEventRecord[]> {
  return findOutcomeEventsByCustomer(context.organizationId, customerId);
}

export async function listOutcomeEventsByOpportunity(
  context: RequestContext,
  opportunityId: string,
): Promise<OutcomeEventRecord[]> {
  return findOutcomeEventsByOpportunity(context.organizationId, opportunityId);
}
