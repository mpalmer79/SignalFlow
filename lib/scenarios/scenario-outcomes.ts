import type {
  ScenarioResult,
  ScenarioTimelineStep,
} from "@/lib/types/scenario";
import { outcomeLabel } from "@/lib/config/outcome-status";

// Build the storytelling timeline for a scenario result. Each step explains
// what happened and why, from signal to revenue.
export function buildScenarioTimeline(
  result: Omit<ScenarioResult, "timeline">,
): ScenarioTimelineStep[] {
  const { signals, opportunity, profile, workflow, assessment } = result;
  const topSignal = signals[0];

  const steps: ScenarioTimelineStep[] = [];

  steps.push({
    stage: "signal-created",
    title: "Signal created",
    detail: topSignal
      ? `${topSignal.label} from ${topSignal.source.replace("-", " ")}.`
      : "A customer signal entered the system.",
  });

  steps.push({
    stage: "signal-classified",
    title: "Signal classified",
    detail: `Intent classified as ${profile.intentLevel} with an intent score of ${profile.intentScore}.`,
  });

  steps.push({
    stage: "opportunity-created",
    title: "Opportunity identified",
    detail: `${opportunity.title} with an opportunity score of ${profile.opportunityScore}.`,
  });

  steps.push({
    stage: "workflow-generated",
    title: "Workflow generated",
    detail: `${workflow.title}. ${workflow.plan.nodes.length} actions planned.`,
  });

  steps.push({
    stage: "actions-executed",
    title: "Actions executed",
    detail: `${workflow.execution.actionsExecuted} executed, ${workflow.execution.actionsBlocked} blocked, ${workflow.execution.actionsEscalated} escalated. Nothing was sent.`,
  });

  const primaryOutcome = assessment.outcomeEvents[0];
  steps.push({
    stage: "outcome-generated",
    title: "Outcome generated",
    detail: primaryOutcome
      ? `${outcomeLabel(primaryOutcome.outcomeType)}: ${primaryOutcome.reason}`
      : "No outcome events were produced.",
  });

  steps.push({
    stage: "revenue-attributed",
    title: "Revenue attributed",
    detail: assessment.attribution
      ? `${assessment.attribution.attributionType} attribution of ${assessment.attribution.attributedAmount} gross influence.`
      : assessment.missedOpportunity
        ? `No revenue captured. Estimated ${assessment.missedOpportunity.estimatedValue} at risk.`
        : "No revenue attribution for this scenario.",
  });

  return steps;
}
