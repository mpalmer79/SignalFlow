import type { OpportunityStage } from "@/lib/types/opportunity";
import type {
  OutcomeContext,
  OutcomeEvent,
  StageTransition,
} from "@/lib/types/outcome";

// Derive a single deterministic stage transition from the current opportunity
// stage and the outcome events. Returns null when no transition applies.
export function deriveStageTransition(
  context: OutcomeContext,
  outcomes: OutcomeEvent[],
): StageTransition | null {
  const opportunity = context.opportunity;
  if (!opportunity) return null;

  const from = opportunity.stage;
  const types = new Set(outcomes.map((o) => o.outcomeType));

  const to = nextStage(from, types, context);
  if (to === null || to === from) return null;

  return {
    fromStage: from,
    toStage: to,
    reason: transitionReason(from, to),
    triggeredBy: "workflow-run",
  };
}

function nextStage(
  from: OpportunityStage,
  types: Set<string>,
  context: OutcomeContext,
): OpportunityStage | null {
  // Compliance stop moves an active opportunity to dormant. Closed stages
  // (won, lost, dormant) do not transition.
  if (types.has("COMPLIANCE_STOP")) {
    const closed = from === "won" || from === "lost" || from === "dormant";
    return closed ? null : "dormant";
  }

  if (types.has("OPPORTUNITY_WON")) return "won";
  if (types.has("APPOINTMENT_SCHEDULED") || types.has("APPOINTMENT_CONFIRMED")) {
    return "appointment-set";
  }

  switch (from) {
    case "new":
      if (context.actionsExecuted > 0) return "contact-attempted";
      return null;
    case "contact-attempted":
      if (types.has("CUSTOMER_REPLIED")) return "engaged";
      if (types.has("NO_RESPONSE")) return "dormant";
      return null;
    case "engaged":
      if (types.has("HUMAN_HANDOFF_COMPLETED")) return "appointment-set";
      if (types.has("NO_RESPONSE")) return "dormant";
      return null;
    case "needs-human-review":
      if (types.has("HUMAN_HANDOFF_COMPLETED")) return "engaged";
      return null;
    case "dormant":
      if (context.actionsExecuted > 0 && types.has("CUSTOMER_REPLIED")) {
        return "reactivated";
      }
      return null;
    default:
      return null;
  }
}

function transitionReason(
  from: OpportunityStage,
  to: OpportunityStage,
): string {
  return `Advanced from ${from.replace(/-/g, " ")} to ${to.replace(/-/g, " ")} based on workflow outcomes.`;
}
