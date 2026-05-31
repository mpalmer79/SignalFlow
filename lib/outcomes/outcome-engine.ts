import type { OutcomeAssessment, OutcomeContext } from "@/lib/types/outcome";
import { classifyOutcomes } from "./outcome-classifier";
import { deriveStageTransition } from "./stage-transition-engine";
import { attributeRevenue } from "@/lib/attribution/revenue-attribution-engine";
import { estimateMissedOpportunity } from "@/lib/attribution/missed-opportunity-engine";
import { scoreWorkflowEffectiveness } from "@/lib/attribution/workflow-effectiveness";

// The Outcome Engine composes the deterministic outcome, stage, attribution,
// effectiveness, and missed opportunity logic into one assessment for a single
// workflow run. It performs no IO and depends on no framework.
export function assessOutcomes(context: OutcomeContext): OutcomeAssessment {
  const outcomeEvents = classifyOutcomes(context);
  const stageTransition = deriveStageTransition(context, outcomeEvents);
  const attribution = attributeRevenue(context, outcomeEvents, stageTransition);
  const missedOpportunity = estimateMissedOpportunity(context, outcomeEvents);
  const effectiveness = scoreWorkflowEffectiveness(
    context,
    outcomeEvents,
    attribution,
  );

  return {
    outcomeEvents,
    stageTransition,
    attribution,
    effectiveness,
    missedOpportunity,
  };
}
