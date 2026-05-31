import type { Communication } from "@/lib/types/communication";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { OutcomeAssessment, OutcomeContext } from "@/lib/types/outcome";
import type { WorkflowPlan } from "@/lib/types/orchestrator";
import { buildIntelligenceProfile } from "@/lib/intelligence/graph-summary";
import { runWorkflow } from "@/lib/orchestrator/workflow-engine";
import { assessOutcomes } from "@/lib/outcomes/outcome-engine";
import type { GeneratedCustomer } from "./synthetic-data";

export interface EngineRunResult {
  profile: CustomerIntelligenceProfile;
  workflow: WorkflowPlan;
  assessment: OutcomeAssessment;
}

const OPEN_STAGES_EXCLUDED = new Set(["won", "lost", "dormant"]);

// Run a single generated customer through the full deterministic engine stack:
// intelligence, workflow simulation, then outcome assessment. No persistence
// and no framework. This mirrors what the seed and services do, in memory.
export function runEnginesForCustomer(
  generated: GeneratedCustomer,
): EngineRunResult {
  const { customer, signals, opportunity, hasResponse } = generated;

  // A synthetic communication encodes whether the customer responded, which the
  // engagement and outcome engines read.
  const communications: Communication[] = hasResponse
    ? [
        {
          id: `${customer.id}-comm`,
          channel: customer.preferredChannel,
          customerId: customer.id,
          customerName: customer.name,
          subject: "Simulated reply",
          preview: "Customer engaged with the simulated outreach.",
          status: "replied",
          simulated: true,
          relatedSignalId: signals[0]?.id ?? null,
          createdAt: customer.lastActionAt,
        },
      ]
    : [];

  const profile = buildIntelligenceProfile({
    customer,
    signals,
    opportunities: [opportunity],
    communications,
  });

  const workflow = runWorkflow({ customer, profile });

  const context = buildContext({
    customer,
    profile,
    communications,
    opportunity,
    workflow,
  });

  const assessment = assessOutcomes(context);

  return { profile, workflow, assessment };
}

interface BuildContextArgs {
  customer: GeneratedCustomer["customer"];
  profile: CustomerIntelligenceProfile;
  communications: Communication[];
  opportunity: GeneratedCustomer["opportunity"];
  workflow: WorkflowPlan;
}

function buildContext(args: BuildContextArgs): OutcomeContext {
  const { customer, profile, communications, opportunity, workflow } = args;

  const executedActionTypes = workflow.execution.steps
    .filter((s) => s.status === "executed")
    .map((s) => s.actionType);
  const blockedActionTypes = workflow.execution.steps
    .filter((s) => s.status === "blocked")
    .map((s) => s.actionType);

  const attached = OPEN_STAGES_EXCLUDED.has(opportunity.stage)
    ? opportunity
    : opportunity;

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
    hasRecentResponse: communications.some((c) => c.status === "replied"),
    workflowOutcome: workflow.execution.outcome,
    actionsExecuted: workflow.execution.actionsExecuted,
    actionsBlocked: workflow.execution.actionsBlocked,
    actionsEscalated: workflow.execution.actionsEscalated,
    executedActionTypes,
    blockedActionTypes,
    opportunity: {
      id: attached.id,
      title: attached.title,
      stage: attached.stage,
      estimatedValue: attached.estimatedValue,
    },
  };
}
