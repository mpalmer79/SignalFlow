import type { Customer } from "@/lib/types/customer";
import type { Communication } from "@/lib/types/communication";
import type { Opportunity } from "@/lib/types/opportunity";
import type { Signal } from "@/lib/types/signal";
import type { WorkflowPlan } from "@/lib/types/orchestrator";
import { buildIntelligenceProfile } from "@/lib/intelligence/graph-summary";
import { runWorkflow } from "./workflow-engine";

export interface WorkflowRunnerInput {
  customer: Customer;
  signals: Signal[];
  opportunities: Opportunity[];
  communications: Communication[];
}

export interface PlannedWorkflow {
  plan: WorkflowPlan;
  intentScore: number;
  opportunityScore: number;
  engagementScore: number;
}

// Convenience entry that builds the intelligence profile and runs the workflow
// in one call. Used by services and the seed script. No IO is performed here.
export function planWorkflowForCustomer(
  input: WorkflowRunnerInput,
): WorkflowPlan {
  return planWorkflowWithScores(input).plan;
}

// Variant that also returns the scores that drove the plan, so callers that
// persist the run can store accurate intelligence scores.
export function planWorkflowWithScores(
  input: WorkflowRunnerInput,
): PlannedWorkflow {
  const profile = buildIntelligenceProfile({
    customer: input.customer,
    signals: input.signals,
    opportunities: input.opportunities,
    communications: input.communications,
  });

  return {
    plan: runWorkflow({ customer: input.customer, profile }),
    intentScore: profile.intentScore,
    opportunityScore: profile.opportunityScore,
    engagementScore: profile.engagementScore,
  };
}
