import type { ExecutiveSummary } from "@/lib/types/analytics";
import type { RevenueLeak } from "@/lib/types/analytics";
import type { OutcomeMemorySummary } from "@/lib/outcomes/outcome-memory";

export interface ExecutiveSummaryInput {
  revenueInfluenced: number;
  recoveredOpportunities: number;
  reactivations: number;
  policyFriction: number;
  topWorkflowTitle: string;
  memory: OutcomeMemorySummary;
  leaks: RevenueLeak[];
}

import { leakLabel } from "./revenue-leak-engine";

// Compose the executive summary from already aggregated inputs. Pure formatting
// over computed values.
export function buildExecutiveSummary(
  input: ExecutiveSummaryInput,
): ExecutiveSummary {
  const topSignal = input.memory.bestSignalConverters[0];
  const largestLeak = input.leaks[0];

  return {
    revenueInfluenced: input.revenueInfluenced,
    recoveredOpportunities: input.recoveredOpportunities,
    highestPerformingWorkflow: input.topWorkflowTitle,
    mostValuableSignalType: topSignal
      ? formatOutcome(topSignal.outcomeType)
      : "Not enough data",
    largestRevenueLeak: largestLeak
      ? `${leakLabel(largestLeak.leakType)} (${largestLeak.estimatedImpact})`
      : "None detected",
    topReactivationCount: input.reactivations,
    policyFrictionScore: input.policyFriction,
  };
}

function formatOutcome(type: string): string {
  return type
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
