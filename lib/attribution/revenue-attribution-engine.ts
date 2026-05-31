import type {
  AttributionType,
  OutcomeContext,
  OutcomeEvent,
  RevenueAttribution,
  StageTransition,
} from "@/lib/types/outcome";
import {
  applyAttributionFactor,
  resolveOpportunityValue,
} from "./attribution-calculator";

// Deterministically attribute influenced revenue from the workflow outcomes and
// any stage movement. Returns null when there is nothing to attribute, for
// example a paused workflow with no opportunity.
export function attributeRevenue(
  context: OutcomeContext,
  outcomes: OutcomeEvent[],
  transition: StageTransition | null,
): RevenueAttribution | null {
  if (!context.opportunity) return null;

  const types = new Set(outcomes.map((o) => o.outcomeType));

  // A compliance stop captures no revenue, so nothing is attributed.
  if (types.has("COMPLIANCE_STOP")) return null;

  const baseValue = resolveOpportunityValue(context);
  const decision = decideAttributionType(types, transition, context);
  if (!decision) return null;

  return {
    attributionType: decision.type,
    attributedAmount: applyAttributionFactor(decision.type, baseValue),
    reason: decision.reason,
    confidence: decision.confidence,
  };
}

interface AttributionDecision {
  type: AttributionType;
  reason: string;
  confidence: number;
}

function decideAttributionType(
  types: Set<string>,
  transition: StageTransition | null,
  context: OutcomeContext,
): AttributionDecision | null {
  // A reactivation of a dormant opportunity recovers revenue at risk.
  if (
    transition?.toStage === "reactivated" ||
    types.has("OPPORTUNITY_REACTIVATED")
  ) {
    return {
      type: "RECOVERED",
      reason: "A dormant opportunity was reactivated by the workflow.",
      confidence: 70,
    };
  }

  // Won opportunities and scheduled appointments recover or influence revenue.
  if (types.has("OPPORTUNITY_WON")) {
    return {
      type: "RECOVERED",
      reason: "The workflow contributed to a won opportunity.",
      confidence: 80,
    };
  }

  if (
    types.has("APPOINTMENT_SCHEDULED") ||
    types.has("APPOINTMENT_CONFIRMED")
  ) {
    return {
      type: "RECOVERED",
      reason: "The workflow scheduled an appointment that advances revenue.",
      confidence: 72,
    };
  }

  // Forward movement without a booking is influence.
  if (
    transition !== null ||
    types.has("OPPORTUNITY_ADVANCED") ||
    types.has("CUSTOMER_REPLIED")
  ) {
    return {
      type: "INFLUENCED",
      reason: "The workflow moved the opportunity forward.",
      confidence: 60,
    };
  }

  // A human handoff on a high value opportunity prevents a likely loss.
  if (
    types.has("HUMAN_TASK_CREATED") &&
    context.opportunityScore >= 70
  ) {
    return {
      type: "PREVENTED_LOSS",
      reason: "Routing to a human reduced the risk of losing the opportunity.",
      confidence: 55,
    };
  }

  // Executed outreach with no movement is assisted contact.
  if (context.actionsExecuted > 0) {
    return {
      type: "ASSISTED",
      reason: "The workflow made contact but did not yet move the stage.",
      confidence: 45,
    };
  }

  return null;
}
