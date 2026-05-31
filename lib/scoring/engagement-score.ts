import type { Customer } from "@/lib/types/customer";
import type { Opportunity } from "@/lib/types/opportunity";
import type { NormalizedSignal } from "@/lib/types/intelligence";
import {
  clampScore,
  ENGAGEMENT_BASELINE,
  ENGAGEMENT_LOST_OPPORTUNITY_PENALTY,
  ENGAGEMENT_NO_RESPONSE_PENALTY,
  ENGAGEMENT_OPT_OUT_PENALTY,
  ENGAGEMENT_SIGNAL_WEIGHTS,
} from "./scoring-config";

export interface EngagementInput {
  customer: Customer;
  signals: NormalizedSignal[];
  opportunities: Opportunity[];
  hasRecentResponse: boolean;
}

// Engagement score starts from a baseline and is adjusted by positive and
// negative signals, opt-out status, lost opportunities, and silence.
export function calculateEngagementScore(input: EngagementInput): number {
  const { customer, signals, opportunities, hasRecentResponse } = input;

  let score = ENGAGEMENT_BASELINE;

  for (const signal of signals) {
    score += ENGAGEMENT_SIGNAL_WEIGHTS[signal.normalizedType];
  }

  if (customer.optedOut) {
    score -= ENGAGEMENT_OPT_OUT_PENALTY;
  }

  const lostCount = opportunities.filter((opp) => opp.stage === "lost").length;
  score -= lostCount * ENGAGEMENT_LOST_OPPORTUNITY_PENALTY;

  if (!hasRecentResponse && signals.length > 0) {
    score -= ENGAGEMENT_NO_RESPONSE_PENALTY;
  }

  return clampScore(score);
}
