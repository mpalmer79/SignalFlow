import type {
  AIExplanationData,
  AIRecommendationInput,
  ReasoningFactor,
} from "@/lib/types/ai";

// Deterministic explanation generation. Every recommendation is explainable:
// it lists the reasoning factors, the supporting signals, and the risk
// considerations that produced it. No model output is involved.

export function generateExplanation(
  input: AIRecommendationInput,
  recommendationLabel: string,
): AIExplanationData {
  const reasoningFactors = buildReasoningFactors(input);
  const riskConsiderations = buildRiskConsiderations(input);

  return {
    recommendation: recommendationLabel,
    reasoningFactors,
    supportingSignals: input.supportingSignals.slice(0, 5),
    riskConsiderations,
  };
}

function buildReasoningFactors(
  input: AIRecommendationInput,
): ReasoningFactor[] {
  const factors: ReasoningFactor[] = [];

  if (input.intentScore >= 70) {
    factors.push({
      label: "High intent",
      detail: `Intent score of ${input.intentScore} indicates strong buying signals.`,
      weight: input.intentScore,
    });
  } else if (input.intentScore >= 40) {
    factors.push({
      label: "Moderate intent",
      detail: `Intent score of ${input.intentScore} indicates developing interest.`,
      weight: input.intentScore,
    });
  } else {
    factors.push({
      label: "Early stage intent",
      detail: `Intent score of ${input.intentScore} indicates an early stage lead.`,
      weight: input.intentScore,
    });
  }

  if (input.opportunityScore >= 70) {
    factors.push({
      label: "High opportunity value",
      detail: `Opportunity score of ${input.opportunityScore} reflects strong revenue potential.`,
      weight: input.opportunityScore,
    });
  }

  if (input.engagementScore >= 60) {
    factors.push({
      label: "Active engagement",
      detail: `Engagement score of ${input.engagementScore} shows the customer is responsive.`,
      weight: input.engagementScore,
    });
  }

  if (input.signalCount >= 2) {
    factors.push({
      label: "Multiple signals",
      detail: `${input.signalCount} signals corroborate the recommendation.`,
      weight: Math.min(input.signalCount * 10, 100),
    });
  }

  if (input.consentSummary === "allowed") {
    factors.push({
      label: "Consent present",
      detail: "Consent is on record for the preferred channel.",
      weight: 60,
    });
  }

  return factors.sort((a, b) => b.weight - a.weight);
}

function buildRiskConsiderations(input: AIRecommendationInput): string[] {
  const considerations: string[] = [];

  if (input.optedOut) {
    considerations.push("Customer opted out, so outreach is paused.");
  }
  if (input.consentSummary === "blocked" && !input.optedOut) {
    considerations.push(
      "Consent is missing on the preferred channel, which blocks automated outreach.",
    );
  }
  if (input.consentSummary === "review") {
    considerations.push("Consent state needs review before outreach.");
  }
  for (const flag of input.riskFlags) {
    considerations.push(`${flag.label} (${flag.severity}).`);
  }
  if (considerations.length === 0) {
    considerations.push("No risk flags or consent blocks apply.");
  }

  return considerations;
}
