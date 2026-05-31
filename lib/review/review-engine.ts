import type {
  AIRecommendation,
  ReviewState,
} from "@/lib/types/ai";

// Why a recommendation requires human review. Deterministic reasons only.
export type ReviewReason =
  | "CONFIDENCE_BELOW_THRESHOLD"
  | "COMPLIANCE_RISK"
  | "HIGH_VALUE_OPPORTUNITY"
  | "LEGAL_INTAKE"
  | "MEDICAL_SCENARIO"
  | "POLICY_CONFLICT";

export const REVIEW_REASON_LABELS: Record<ReviewReason, string> = {
  CONFIDENCE_BELOW_THRESHOLD: "Confidence below threshold",
  COMPLIANCE_RISK: "Compliance risk",
  HIGH_VALUE_OPPORTUNITY: "High value opportunity",
  LEGAL_INTAKE: "Legal intake",
  MEDICAL_SCENARIO: "Medical scenario",
  POLICY_CONFLICT: "Policy conflict",
};

export interface ReviewRequirement {
  requiresReview: boolean;
  reasons: ReviewReason[];
  recommendedState: ReviewState;
}

// Confidence at or above this needs no review on confidence grounds alone.
export const REVIEW_CONFIDENCE_THRESHOLD = 70;

// High value opportunities always route to a human for confirmation.
export const HIGH_VALUE_THRESHOLD = 10000;

// Determine whether a recommendation requires human review and why. A
// recommendation never becomes an action automatically: this is the gate.
export function determineReviewRequirement(
  recommendation: AIRecommendation,
): ReviewRequirement {
  const reasons: ReviewReason[] = [];

  if (recommendation.recommendationType === "HUMAN_REVIEW") {
    reasons.push("POLICY_CONFLICT");
  }

  if (recommendation.confidence.score < REVIEW_CONFIDENCE_THRESHOLD) {
    reasons.push("CONFIDENCE_BELOW_THRESHOLD");
  }

  const hasCriticalRisk = recommendation.explanation.riskConsiderations.some(
    (consideration) =>
      consideration.includes("(critical)") ||
      consideration.toLowerCase().includes("opted out") ||
      consideration.toLowerCase().includes("consent is missing"),
  );
  if (hasCriticalRisk) {
    reasons.push("COMPLIANCE_RISK");
  }

  if (recommendation.vertical === "legal-intake") {
    reasons.push("LEGAL_INTAKE");
  }
  if (recommendation.vertical === "medical") {
    reasons.push("MEDICAL_SCENARIO");
  }

  const requiresReview = reasons.length > 0;
  return {
    requiresReview,
    reasons,
    recommendedState: requiresReview ? "pending-review" : "approved",
  };
}
