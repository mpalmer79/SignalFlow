import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { AIProvider } from "./provider-interface";
import type {
  AIRecommendation,
  AIRecommendationInput,
} from "@/lib/types/ai";
import { mockAIProvider } from "./mock-provider";

// Build the deterministic AI input from an intelligence profile. The AI layer
// consumes this shape only, so it never touches Prisma, React, or a provider.
export function buildRecommendationInput(
  profile: CustomerIntelligenceProfile,
): AIRecommendationInput {
  const topOpportunityValue = profile.openOpportunities.reduce(
    (max, opp) => Math.max(max, opp.estimatedValue),
    0,
  );

  return {
    customerId: profile.customer.id,
    customerName: profile.customer.name,
    vertical: profile.vertical,
    intentScore: profile.intentScore,
    opportunityScore: profile.opportunityScore,
    engagementScore: profile.engagementScore,
    intentLevel: profile.intentLevel,
    consentSummary: profile.consentSummary,
    optedOut: profile.customer.optedOut,
    signalCount: profile.normalizedSignals.length,
    riskFlags: profile.riskFlags.map((flag) => ({
      label: flag.label,
      severity: flag.severity,
    })),
    supportingSignals: profile.normalizedSignals.map((signal) => signal.rawLabel),
    estimatedValue: topOpportunityValue,
  };
}

// The AI Recommendation Engine. It composes a provider into a full
// recommendation: a typed action, a confidence score and tier, and a complete
// explanation. The provider defaults to the deterministic mock and can be
// swapped without changing this engine.
export function generateRecommendation(
  profile: CustomerIntelligenceProfile,
  provider: AIProvider = mockAIProvider,
): AIRecommendation {
  const input = buildRecommendationInput(profile);

  const { recommendationType, recommendationLabel } =
    provider.generateRecommendation(input);
  const confidence = provider.scoreConfidence(input);
  const explanation = provider.generateExplanation(input, recommendationLabel);

  return {
    customerId: input.customerId,
    customerName: input.customerName,
    vertical: input.vertical,
    recommendationType,
    recommendationLabel,
    confidence,
    explanation,
    provider: provider.name,
  };
}
