import type { OutcomeType } from "@/lib/types/outcome";
import type { VerticalId } from "@/lib/types/vertical-pack";

// Centralized, deterministic scoring weights for the outcome and effectiveness
// engines. Tuning happens here so behavior stays predictable.

// Contribution of each outcome type to the 0 to 100 workflow outcome score.
export const OUTCOME_SCORE_WEIGHTS: Record<OutcomeType, number> = {
  OPPORTUNITY_WON: 50,
  APPOINTMENT_CONFIRMED: 35,
  APPOINTMENT_SCHEDULED: 30,
  OPPORTUNITY_ADVANCED: 25,
  OPPORTUNITY_REACTIVATED: 25,
  HUMAN_HANDOFF_COMPLETED: 20,
  CUSTOMER_REPLIED: 15,
  HUMAN_TASK_CREATED: 10,
  EMAIL_OPENED: 8,
  NO_RESPONSE: -15,
  ACTION_BLOCKED: -10,
  OPPORTUNITY_DORMANT: -20,
  OPPORTUNITY_LOST: -30,
  COMPLIANCE_STOP: -25,
};

export const OUTCOME_SCORE_BASELINE = 40;

// Fraction of opportunity value attributed by attribution type. These are
// deterministic gross influence estimates, not booked revenue.
export const ATTRIBUTION_FACTORS = {
  RECOVERED: 0.5,
  INFLUENCED: 0.35,
  ASSISTED: 0.2,
  PREVENTED_LOSS: 0.3,
  MISSED: 1,
} as const;

// Fallback opportunity values per vertical when an opportunity carries none.
export const VERTICAL_DEFAULT_VALUE: Record<VerticalId, number> = {
  automotive: 2500,
  dental: 180,
  medical: 320,
  "home-services": 900,
  "legal-intake": 1500,
  insurance: 600,
};

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
