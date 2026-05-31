import type { AIRecommendation } from "@/lib/types/ai";

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

// Validate the structure and ranges of a generated recommendation before it is
// persisted or surfaced. This guards against malformed provider output, which
// matters once real providers are introduced. Deterministic and pure.
export function validateRecommendation(
  recommendation: AIRecommendation,
): ValidationResult {
  const issues: string[] = [];

  if (!recommendation.customerId) {
    issues.push("Recommendation is missing a customer id.");
  }
  if (!recommendation.recommendationLabel) {
    issues.push("Recommendation is missing a label.");
  }

  const score = recommendation.confidence.score;
  if (score < 0 || score > 100) {
    issues.push("Confidence score is out of the 0 to 100 range.");
  }

  if (recommendation.explanation.reasoningFactors.length === 0) {
    issues.push("Explanation has no reasoning factors.");
  }
  if (recommendation.explanation.recommendation !== recommendation.recommendationLabel) {
    issues.push("Explanation recommendation does not match the recommendation label.");
  }

  return { valid: issues.length === 0, issues };
}
