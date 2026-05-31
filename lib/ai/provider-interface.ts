import type {
  AIConfidence,
  AIExplanationData,
  AIRecommendationInput,
  AIRecommendationType,
} from "@/lib/types/ai";

// The provider abstraction every AI provider will implement. In Phase 7 only a
// deterministic mock provider exists. Future providers (OpenAI, Anthropic
// Claude, Google Gemini, Azure OpenAI) will conform to this interface so the
// recommendation engine never changes when a provider is added.
//
// No method here performs a network call. The mock provider returns fixed,
// deterministic output computed from the input.
export interface AIProvider {
  readonly name: string;
  generateRecommendation(input: AIRecommendationInput): {
    recommendationType: AIRecommendationType;
    recommendationLabel: string;
  };
  classifyIntent(input: AIRecommendationInput): string;
  generateExplanation(
    input: AIRecommendationInput,
    recommendationLabel: string,
  ): AIExplanationData;
  scoreConfidence(input: AIRecommendationInput): AIConfidence;
  summarizeOpportunity(input: AIRecommendationInput): string;
}

// Provider identity for the future integrations this abstraction prepares for.
export const FUTURE_PROVIDERS = [
  "OpenAI",
  "Anthropic Claude",
  "Google Gemini",
  "Azure OpenAI",
] as const;

export type FutureProvider = (typeof FUTURE_PROVIDERS)[number];
