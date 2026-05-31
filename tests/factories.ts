import type { AIRecommendation, AIRecommendationInput } from "@/lib/types/ai";
import type { VoicePlanInput } from "@/lib/types/voice";
import type { FeatureFlagEvaluation } from "@/lib/feature-flags/feature-flag-types";

// Deterministic test fixtures for the pure engines. No randomness, no Prisma,
// no network.

export function aiInput(
  overrides: Partial<AIRecommendationInput> = {},
): AIRecommendationInput {
  return {
    customerId: "cust-1",
    customerName: "Test Customer",
    vertical: "automotive",
    intentScore: 80,
    opportunityScore: 70,
    engagementScore: 60,
    intentLevel: "Purchase Intent",
    consentSummary: "allowed",
    optedOut: false,
    signalCount: 3,
    riskFlags: [],
    supportingSignals: ["Trade request"],
    estimatedValue: 30000,
    ...overrides,
  };
}

export function aiRecommendation(
  overrides: Partial<AIRecommendation> = {},
): AIRecommendation {
  return {
    customerId: "cust-1",
    customerName: "Test Customer",
    vertical: "automotive",
    recommendationType: "IMMEDIATE_HUMAN_FOLLOW_UP",
    recommendationLabel: "Immediate human follow-up",
    confidence: { score: 90, tier: "Very High" },
    explanation: {
      recommendation: "Immediate human follow-up",
      reasoningFactors: [],
      supportingSignals: ["Trade request"],
      riskConsiderations: ["No risk flags."],
    },
    provider: "deterministic.mock",
    ...overrides,
  };
}

export function voiceInput(
  overrides: Partial<VoicePlanInput> = {},
): VoicePlanInput {
  return {
    customerId: "cust-1",
    customerName: "Test Customer",
    vertical: "automotive",
    intentScore: 80,
    opportunityScore: 70,
    engagementScore: 60,
    intentLevel: "Purchase Intent",
    consentSummary: "allowed",
    voiceConsent: true,
    optedOut: false,
    quietHours: false,
    signalCount: 3,
    noResponseCount: 0,
    riskFlags: [],
    topSignalLabel: "Trade request",
    estimatedValue: 30000,
    recommendationType: "IMMEDIATE_HUMAN_FOLLOW_UP",
    reviewApproved: true,
    ...overrides,
  };
}

// Build a flag map where a single live flag is forced to allowed, to exercise
// the forward ready branches of selection and readiness without ever enabling
// a live flag through the real evaluator.
export function flagMap(
  entries: Array<[string, Partial<FeatureFlagEvaluation>]>,
): Map<string, FeatureFlagEvaluation> {
  const map = new Map<string, FeatureFlagEvaluation>();
  for (const [key, value] of entries) {
    map.set(key, {
      key: key as FeatureFlagEvaluation["key"],
      label: key,
      state: "blocked",
      enabled: false,
      reason: "test",
      governsLive: true,
      ...value,
    });
  }
  return map;
}
