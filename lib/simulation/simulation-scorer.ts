import type { EngineRunResult } from "./engine-runner";
import type {
  SimulationMetrics,
  SimulationOutcomeBreakdownRow,
} from "@/lib/types/simulation";

const APPOINTMENT_OUTCOMES = new Set([
  "APPOINTMENT_SCHEDULED",
  "APPOINTMENT_CONFIRMED",
]);

const POSITIVE_OUTCOMES = new Set([
  "OPPORTUNITY_WON",
  "OPPORTUNITY_ADVANCED",
  "OPPORTUNITY_REACTIVATED",
  "APPOINTMENT_SCHEDULED",
  "APPOINTMENT_CONFIRMED",
  "CUSTOMER_REPLIED",
  "HUMAN_HANDOFF_COMPLETED",
]);

// Aggregate a batch of engine runs into deterministic simulation metrics and an
// outcome breakdown. Pure reduction over already computed results.
export function scoreSimulation(runs: EngineRunResult[]): {
  metrics: SimulationMetrics;
  outcomeBreakdown: SimulationOutcomeBreakdownRow[];
} {
  const total = runs.length;
  const outcomeCounts = new Map<string, number>();

  let appointments = 0;
  let revenueInfluenced = 0;
  let missedValue = 0;
  let completed = 0;
  let policyBlocks = 0;
  let escalations = 0;
  let intentSum = 0;
  let opportunitySum = 0;
  let engagementSum = 0;
  let positiveRuns = 0;

  for (const run of runs) {
    intentSum += run.profile.intentScore;
    opportunitySum += run.profile.opportunityScore;
    engagementSum += run.profile.engagementScore;

    policyBlocks += run.workflow.execution.actionsBlocked;
    escalations += run.workflow.execution.actionsEscalated;
    if (run.workflow.execution.outcome === "completed") completed += 1;

    let runPositive = false;
    for (const event of run.assessment.outcomeEvents) {
      outcomeCounts.set(
        event.outcomeType,
        (outcomeCounts.get(event.outcomeType) ?? 0) + 1,
      );
      if (APPOINTMENT_OUTCOMES.has(event.outcomeType)) appointments += 1;
      if (POSITIVE_OUTCOMES.has(event.outcomeType)) runPositive = true;
    }
    if (runPositive) positiveRuns += 1;

    const attribution = run.assessment.attribution;
    if (attribution && attribution.attributionType !== "MISSED") {
      revenueInfluenced += attribution.attributedAmount;
    }
    if (run.assessment.missedOpportunity) {
      missedValue += run.assessment.missedOpportunity.estimatedValue;
    }
  }

  const metrics: SimulationMetrics = {
    customers: total,
    appointmentsGenerated: appointments,
    revenueInfluenced,
    missedOpportunityValue: missedValue,
    workflowCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    policyBlocks,
    escalations,
    averageIntentScore: total > 0 ? Math.round(intentSum / total) : 0,
    averageOpportunityScore: total > 0 ? Math.round(opportunitySum / total) : 0,
    averageEngagementScore: total > 0 ? Math.round(engagementSum / total) : 0,
    positiveOutcomeRate: total > 0 ? Math.round((positiveRuns / total) * 100) : 0,
  };

  const outcomeBreakdown = Array.from(outcomeCounts.entries())
    .map(([outcomeType, count]) => ({ outcomeType, count }))
    .sort((a, b) => b.count - a.count);

  return { metrics, outcomeBreakdown };
}
