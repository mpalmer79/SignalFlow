import type { Customer } from "@/lib/types/customer";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { ActionPlan } from "@/lib/types/orchestrator";
import { buildActionGraph } from "@/lib/action-graph/action-graph-builder";

export interface WorkflowBuildContext {
  customer: Customer;
  profile: CustomerIntelligenceProfile;
}

export interface BuiltWorkflow {
  title: string;
  trigger: string;
  plan: ActionPlan;
}

// Build a workflow plan from a customer intelligence profile. The title and
// trigger summarize why the workflow exists.
export function buildWorkflow(context: WorkflowBuildContext): BuiltWorkflow {
  const { profile } = context;
  const plan = buildActionGraph(profile);

  const topSignal = profile.normalizedSignals[0]?.normalizedType ?? "NO_SIGNAL";
  const trigger = `Trigger: ${topSignal} (intent ${profile.intentScore}, opportunity ${profile.opportunityScore})`;

  return {
    title: workflowTitle(profile),
    trigger,
    plan,
  };
}

function workflowTitle(profile: CustomerIntelligenceProfile): string {
  if (profile.customer.optedOut) return "Opt-out stop workflow";
  switch (profile.intentLevel) {
    case "Purchase Intent":
      return "High intent purchase follow-up";
    case "Appointment Intent":
      return "Appointment booking follow-up";
    case "Reactivation Opportunity":
      return "Reactivation outreach";
    case "Needs Human Review":
      return "Human review workflow";
    default:
      return "Standard follow-up workflow";
  }
}
