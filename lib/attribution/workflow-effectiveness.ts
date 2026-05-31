import type {
  OutcomeContext,
  OutcomeEvent,
  RevenueAttribution,
  WorkflowEffectiveness,
} from "@/lib/types/outcome";
import {
  clampScore,
  OUTCOME_SCORE_BASELINE,
  OUTCOME_SCORE_WEIGHTS,
} from "@/lib/outcomes/outcome-config";

// Score how effective a workflow run was on a 0 to 100 scale, derived from its
// outcome events and execution counts. Policy friction captures how much the
// run was held back by blocks and escalations.
export function scoreWorkflowEffectiveness(
  context: OutcomeContext,
  outcomes: OutcomeEvent[],
  attribution: RevenueAttribution | null,
): WorkflowEffectiveness {
  let score = OUTCOME_SCORE_BASELINE;
  for (const event of outcomes) {
    score += OUTCOME_SCORE_WEIGHTS[event.outcomeType];
  }

  const policyFriction =
    context.actionsBlocked * 2 + context.actionsEscalated;

  const revenueInfluenced =
    attribution && attribution.attributionType !== "MISSED"
      ? attribution.attributedAmount
      : 0;

  return {
    completionStatus: context.workflowOutcome,
    actionsExecuted: context.actionsExecuted,
    actionsBlocked: context.actionsBlocked,
    actionsEscalated: context.actionsEscalated,
    outcomeScore: clampScore(score),
    revenueInfluenced,
    policyFriction,
  };
}
