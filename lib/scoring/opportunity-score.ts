import type { Opportunity } from "@/lib/types/opportunity";
import type { NormalizedSignal } from "@/lib/types/intelligence";
import type { VerticalId } from "@/lib/types/vertical-pack";
import { clampScore, VERTICAL_OPPORTUNITY_BASE } from "./scoring-config";

// Signals that indicate stronger revenue potential nudge the opportunity score
// up from its vertical baseline.
const HIGH_VALUE_SIGNALS = new Set([
  "TRADE_REQUEST",
  "ESTIMATE_REQUEST",
  "APPOINTMENT_REQUEST",
  "CONSULTATION_REQUEST",
]);

export interface OpportunityScoreInput {
  vertical: VerticalId;
  signals: NormalizedSignal[];
  openOpportunities: Opportunity[];
}

// Opportunity score estimates business value deterministically from the
// vertical baseline, the presence of high-value signals, and any open
// opportunity value already on record.
export function calculateOpportunityScore(
  input: OpportunityScoreInput,
): number {
  const { vertical, signals, openOpportunities } = input;

  let score = VERTICAL_OPPORTUNITY_BASE[vertical];

  const hasHighValueSignal = signals.some((signal) =>
    HIGH_VALUE_SIGNALS.has(signal.normalizedType),
  );
  if (hasHighValueSignal) {
    score += 8;
  }

  const topValue = openOpportunities.reduce(
    (max, opp) => Math.max(max, opp.estimatedValue),
    0,
  );
  if (topValue >= 20000) {
    score += 6;
  } else if (topValue >= 2000) {
    score += 3;
  }

  if (openOpportunities.length === 0 && signals.length === 0) {
    score -= 20;
  }

  return clampScore(score);
}
