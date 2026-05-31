import type {
  AIConfidence,
  AIRecommendationInput,
  ConfidenceTier,
} from "@/lib/types/ai";

// Deterministic confidence scoring. The score is a weighted blend of the
// intelligence scores, adjusted by consent, risk, and signal volume. No
// randomness and no model output.

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function tierForScore(score: number): ConfidenceTier {
  if (score >= 85) return "Very High";
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

export function scoreConfidence(input: AIRecommendationInput): AIConfidence {
  // Base blend favors intent and opportunity, with engagement as support.
  let score =
    input.intentScore * 0.45 +
    input.opportunityScore * 0.35 +
    input.engagementScore * 0.2;

  // More corroborating signals raise confidence, up to a cap.
  score += Math.min(input.signalCount, 4) * 2;

  // Consent and opt-out reduce confidence in an outreach recommendation.
  if (input.optedOut) {
    score -= 35;
  } else if (input.consentSummary === "blocked") {
    score -= 20;
  } else if (input.consentSummary === "review") {
    score -= 8;
  }

  // Risk flags lower confidence, weighted by severity.
  for (const flag of input.riskFlags) {
    score -= flag.severity === "critical" ? 18 : flag.severity === "warning" ? 8 : 3;
  }

  const finalScore = clamp(score);
  return { score: finalScore, tier: tierForScore(finalScore) };
}
