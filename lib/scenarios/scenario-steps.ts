import type { ScenarioResult } from "@/lib/types/scenario";
import type { OutcomeType } from "@/lib/types/outcome";

// The seven step canonical lifecycle that the scenario guided demo walks. Each
// step corresponds to one frame in the 60-second story.
export type ScenarioStepKey =
  | "signal"
  | "intelligence"
  | "recommendation"
  | "policy"
  | "workflow"
  | "outcome"
  | "revenue";

export const SCENARIO_STEP_KEYS: ScenarioStepKey[] = [
  "signal",
  "intelligence",
  "recommendation",
  "policy",
  "workflow",
  "outcome",
  "revenue",
];

export interface ScenarioStep {
  key: ScenarioStepKey;
  index: number;
  total: number;
  label: string;
  headline: string;
  detail: string;
}

const LABELS: Record<ScenarioStepKey, string> = {
  signal: "Signal",
  intelligence: "Intelligence",
  recommendation: "Recommendation",
  policy: "Policy and consent",
  workflow: "Workflow",
  outcome: "Outcome",
  revenue: "Revenue",
};

const POSITIVE_OUTCOMES = new Set<OutcomeType>([
  "APPOINTMENT_SCHEDULED",
  "APPOINTMENT_CONFIRMED",
  "OPPORTUNITY_ADVANCED",
  "OPPORTUNITY_WON",
  "OPPORTUNITY_REACTIVATED",
  "CUSTOMER_REPLIED",
  "HUMAN_HANDOFF_COMPLETED",
]);

function fmt(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Build the seven step model from a deterministic scenario result. Pure: takes
// data, returns data. No React or Prisma.
export function buildScenarioSteps(result: ScenarioResult): ScenarioStep[] {
  const { profile, workflow, assessment, signals } = result;
  const topSignal = signals[0];
  const recommendation = profile.recommendedActions[0];
  const execution = workflow.execution;
  const attribution = assessment.attribution;
  const missed = assessment.missedOpportunity;

  const blocked = execution.actionsBlocked;
  const escalated = execution.actionsEscalated;
  const executed = execution.actionsExecuted;
  const positiveOutcomes = assessment.outcomeEvents.filter((event) =>
    POSITIVE_OUTCOMES.has(event.outcomeType),
  ).length;

  const policyHeadline =
    blocked > 0 || escalated > 0
      ? `Policy held ${blocked} action${blocked === 1 ? "" : "s"} and escalated ${escalated}`
      : "Policy cleared every action";
  const policyDetail =
    blocked > 0
      ? "Consent and quiet hours stopped the unsafe steps before they ran."
      : escalated > 0
        ? "Sensitive content routed to a human reviewer before execution."
        : "Every planned action passed consent, quiet hours, and vertical sensitivity checks.";

  const outcomeHeadline =
    positiveOutcomes > 0
      ? `${positiveOutcomes} positive outcome${positiveOutcomes === 1 ? "" : "s"} recorded`
      : missed
        ? `Missed opportunity recorded (${missed.severity})`
        : "Outcomes recorded";
  const outcomeDetail =
    assessment.outcomeEvents[0]?.reason ??
    "Each simulated step produced a deterministic outcome event.";

  const revenueHeadline = attribution
    ? `${attribution.attributionType} attribution: ${fmt(attribution.attributedAmount)}`
    : missed
      ? `No attribution. ${fmt(missed.estimatedValue)} at risk`
      : "No revenue attributed";
  const revenueDetail = attribution
    ? attribution.reason
    : missed
      ? missed.recommendedRecoveryAction
      : "This scenario did not produce revenue. The audit trail still records every decision.";

  return [
    {
      key: "signal",
      index: 0,
      total: SCENARIO_STEP_KEYS.length,
      label: LABELS.signal,
      headline: topSignal?.label ?? "Inbound signal received",
      detail:
        topSignal?.detail ??
        "An inbound revenue or risk event arrives from a channel the platform watches.",
    },
    {
      key: "intelligence",
      index: 1,
      total: SCENARIO_STEP_KEYS.length,
      label: LABELS.intelligence,
      headline: `Intent ${profile.intentScore}, opportunity ${profile.opportunityScore}, engagement ${profile.engagementScore}`,
      detail: `Priority ${profile.priority}. Intent level ${profile.intentLevel}. Scoring is deterministic from a centralized configuration.`,
    },
    {
      key: "recommendation",
      index: 2,
      total: SCENARIO_STEP_KEYS.length,
      label: LABELS.recommendation,
      headline: recommendation?.action ?? "Recommended action computed",
      detail:
        recommendation?.rationale ??
        "The recommendation engine selects a deterministic next best action from the intelligence profile.",
    },
    {
      key: "policy",
      index: 3,
      total: SCENARIO_STEP_KEYS.length,
      label: LABELS.policy,
      headline: policyHeadline,
      detail: policyDetail,
    },
    {
      key: "workflow",
      index: 4,
      total: SCENARIO_STEP_KEYS.length,
      label: LABELS.workflow,
      headline: `${executed} executed, ${blocked} blocked, ${escalated} escalated`,
      detail:
        execution.steps[0]?.reason ??
        "The workflow engine plans, evaluates, and simulates actions. Nothing is sent.",
    },
    {
      key: "outcome",
      index: 5,
      total: SCENARIO_STEP_KEYS.length,
      label: LABELS.outcome,
      headline: outcomeHeadline,
      detail: outcomeDetail,
    },
    {
      key: "revenue",
      index: 6,
      total: SCENARIO_STEP_KEYS.length,
      label: LABELS.revenue,
      headline: revenueHeadline,
      detail: revenueDetail,
    },
  ];
}

// Resolve a step key from a query string. Falls back to the first step when
// missing or unknown so the page is always renderable.
export function resolveStepKey(
  raw: string | string[] | undefined,
): ScenarioStepKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && (SCENARIO_STEP_KEYS as string[]).includes(value)) {
    return value as ScenarioStepKey;
  }
  return "signal";
}
