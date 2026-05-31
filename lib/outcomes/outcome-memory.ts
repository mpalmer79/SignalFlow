import type {
  AttributionType,
  OutcomeType,
} from "@/lib/types/outcome";
import type { VerticalId } from "@/lib/types/vertical-pack";

// The Outcome Memory engine summarizes the relationship between signals,
// actions, workflows, and revenue outcomes across many runs. It is pure: it
// aggregates already computed records into deterministic summaries. Persistence
// and retrieval live in the service and repository layers.

export interface OutcomeMemoryInput {
  vertical: VerticalId;
  outcomeTypes: OutcomeType[];
  attributionType: AttributionType | null;
  attributedAmount: number;
  outcomeScore: number;
  executedActionTypes: string[];
}

export interface VerticalOutcomeSummary {
  vertical: VerticalId;
  runs: number;
  revenueInfluenced: number;
  averageOutcomeScore: number;
  positiveRuns: number;
}

export interface ActionEffect {
  actionType: string;
  runs: number;
  revenueInfluenced: number;
}

export interface OutcomeMemorySummary {
  byVertical: VerticalOutcomeSummary[];
  topActions: ActionEffect[];
  bestSignalConverters: { outcomeType: OutcomeType; count: number }[];
}

const POSITIVE_OUTCOMES = new Set<OutcomeType>([
  "OPPORTUNITY_WON",
  "OPPORTUNITY_ADVANCED",
  "OPPORTUNITY_REACTIVATED",
  "APPOINTMENT_SCHEDULED",
  "APPOINTMENT_CONFIRMED",
  "CUSTOMER_REPLIED",
  "HUMAN_HANDOFF_COMPLETED",
]);

// Build the deterministic outcome memory summary from a set of run inputs.
export function summarizeOutcomeMemory(
  inputs: OutcomeMemoryInput[],
): OutcomeMemorySummary {
  const verticalMap = new Map<VerticalId, VerticalOutcomeSummary>();
  const actionMap = new Map<string, ActionEffect>();
  const outcomeCounts = new Map<OutcomeType, number>();

  for (const input of inputs) {
    const isPositive = input.outcomeTypes.some((t) => POSITIVE_OUTCOMES.has(t));

    const vertical =
      verticalMap.get(input.vertical) ??
      {
        vertical: input.vertical,
        runs: 0,
        revenueInfluenced: 0,
        averageOutcomeScore: 0,
        positiveRuns: 0,
      };
    vertical.runs += 1;
    vertical.revenueInfluenced += revenueFor(input);
    // Reuse averageOutcomeScore as a running total until normalized below.
    vertical.averageOutcomeScore += input.outcomeScore;
    if (isPositive) vertical.positiveRuns += 1;
    verticalMap.set(input.vertical, vertical);

    for (const actionType of input.executedActionTypes) {
      const effect =
        actionMap.get(actionType) ??
        { actionType, runs: 0, revenueInfluenced: 0 };
      effect.runs += 1;
      effect.revenueInfluenced += revenueFor(input);
      actionMap.set(actionType, effect);
    }

    for (const outcomeType of input.outcomeTypes) {
      if (POSITIVE_OUTCOMES.has(outcomeType)) {
        outcomeCounts.set(outcomeType, (outcomeCounts.get(outcomeType) ?? 0) + 1);
      }
    }
  }

  const byVertical = Array.from(verticalMap.values())
    .map((v) => ({
      ...v,
      averageOutcomeScore: v.runs > 0 ? Math.round(v.averageOutcomeScore / v.runs) : 0,
    }))
    .sort((a, b) => b.revenueInfluenced - a.revenueInfluenced);

  const topActions = Array.from(actionMap.values()).sort(
    (a, b) => b.revenueInfluenced - a.revenueInfluenced,
  );

  const bestSignalConverters = Array.from(outcomeCounts.entries())
    .map(([outcomeType, count]) => ({ outcomeType, count }))
    .sort((a, b) => b.count - a.count);

  return { byVertical, topActions, bestSignalConverters };
}

function revenueFor(input: OutcomeMemoryInput): number {
  return input.attributionType && input.attributionType !== "MISSED"
    ? input.attributedAmount
    : 0;
}
