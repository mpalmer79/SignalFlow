import type {
  MissedOpportunity,
  MissedOpportunitySeverity,
  OutcomeContext,
  OutcomeEvent,
} from "@/lib/types/outcome";
import { resolveOpportunityValue } from "./attribution-calculator";

// Estimate a missed opportunity when revenue is at risk of being lost. Returns
// null when the workflow is healthy. The estimate is deterministic.
export function estimateMissedOpportunity(
  context: OutcomeContext,
  outcomes: OutcomeEvent[],
): MissedOpportunity | null {
  const types = new Set(outcomes.map((o) => o.outcomeType));
  const value = resolveOpportunityValue(context);

  // Opt-out is a hard stop, not a recoverable miss, so no estimate is produced.
  if (types.has("COMPLIANCE_STOP")) {
    return null;
  }

  const reason = missReason(types, context);
  if (!reason) return null;

  const severity = severityFor(context, types);

  return {
    estimatedValue: value,
    reason,
    severity,
    recommendedRecoveryAction: recoveryAction(context),
  };
}

function missReason(
  types: Set<string>,
  context: OutcomeContext,
): string | null {
  if (context.consentSummary === "blocked" && types.has("ACTION_BLOCKED")) {
    return "Missing consent blocked the preferred channel.";
  }
  if (types.has("ACTION_BLOCKED") && types.has("NO_RESPONSE")) {
    return "A blocked action and no response left the opportunity stalled.";
  }
  if (
    context.intentScore >= 75 &&
    context.actionsExecuted > 0 &&
    !types.has("HUMAN_TASK_CREATED") &&
    !types.has("APPOINTMENT_SCHEDULED")
  ) {
    return "High intent did not receive a human follow-up.";
  }
  if (types.has("NO_RESPONSE")) {
    return "Repeated outreach produced no response.";
  }
  if (context.opportunity?.stage === "dormant") {
    return "The opportunity is dormant and at risk of being lost.";
  }
  if (context.opportunity?.stage === "lost") {
    return "The opportunity was lost and may be recoverable.";
  }
  return null;
}

function severityFor(
  context: OutcomeContext,
  types: Set<string>,
): MissedOpportunitySeverity {
  const value = resolveOpportunityValue(context);
  const highValue = value >= 5000;
  const highIntent = context.intentScore >= 75;

  if (highValue && (highIntent || types.has("ACTION_BLOCKED"))) {
    return "critical";
  }
  if (highValue || highIntent) return "high";
  if (types.has("ACTION_BLOCKED") || types.has("NO_RESPONSE")) return "medium";
  return "low";
}

function recoveryAction(context: OutcomeContext): string {
  if (context.consentSummary === "blocked") {
    return "Capture consent on an allowed channel before retrying.";
  }
  if (context.intentScore >= 75) {
    return "Assign a human owner for immediate follow-up.";
  }
  if (context.opportunity?.stage === "dormant") {
    return "Add the customer to a reactivation sequence.";
  }
  return "Schedule a follow-up touch on the preferred channel.";
}
