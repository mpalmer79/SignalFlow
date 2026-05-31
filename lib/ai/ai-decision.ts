import type {
  AIRecommendationInput,
  AIRecommendationType,
} from "@/lib/types/ai";

// Deterministic recommendation decision. Maps an intelligence input to a single
// recommendation type and human readable label through fixed, ordered rules.
// This mirrors the deterministic next best action engine but frames the result
// as an AI recommendation, so the AI layer stays consistent with the rest of
// the platform.

export const RECOMMENDATION_LABELS: Record<AIRecommendationType, string> = {
  IMMEDIATE_HUMAN_FOLLOW_UP: "Immediate human follow-up",
  APPOINTMENT_OUTREACH: "Appointment outreach",
  REACTIVATION_OUTREACH: "Reactivation outreach",
  NURTURE_SEQUENCE: "Nurture sequence",
  HUMAN_REVIEW: "Human review",
  PAUSE_OUTREACH: "Pause outreach",
};

export function decideRecommendation(
  input: AIRecommendationInput,
): AIRecommendationType {
  // Opt-out is absolute.
  if (input.optedOut) {
    return "PAUSE_OUTREACH";
  }

  // A review intent or a critical risk routes to human review first.
  const hasCriticalRisk = input.riskFlags.some(
    (flag) => flag.severity === "critical",
  );
  if (input.intentLevel === "Needs Human Review" || hasCriticalRisk) {
    return "HUMAN_REVIEW";
  }

  // High intent and high opportunity value warrant immediate human contact.
  if (input.intentScore >= 80 && input.opportunityScore >= 75) {
    return "IMMEDIATE_HUMAN_FOLLOW_UP";
  }

  // Appointment intent leads to appointment outreach.
  if (input.intentLevel === "Appointment Intent") {
    return "APPOINTMENT_OUTREACH";
  }

  // Reactivation opportunities re-engage dormant customers.
  if (input.intentLevel === "Reactivation Opportunity") {
    return "REACTIVATION_OUTREACH";
  }

  // Purchase intent without the high value threshold still gets human contact.
  if (input.intentLevel === "Purchase Intent") {
    return "IMMEDIATE_HUMAN_FOLLOW_UP";
  }

  // Engaged or interested customers get appointment outreach when value is
  // present, otherwise a nurture sequence.
  if (
    (input.intentLevel === "Engaged" || input.intentLevel === "Interested") &&
    input.opportunityScore >= 60
  ) {
    return "APPOINTMENT_OUTREACH";
  }

  return "NURTURE_SEQUENCE";
}
