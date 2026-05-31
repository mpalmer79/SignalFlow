import type { AIProvider } from "./provider-interface";
import type {
  AIConfidence,
  AIExplanationData,
  AIRecommendationInput,
  AIRecommendationType,
} from "@/lib/types/ai";
import { decideRecommendation, RECOMMENDATION_LABELS } from "./ai-decision";
import { generateExplanation } from "./ai-explanation";
import { scoreConfidence } from "./ai-confidence";

// The deterministic mock provider. It implements the full AIProvider interface
// with fixed logic and no network calls. It is the only provider in Phase 7,
// and it stands in for OpenAI, Anthropic, Gemini, and Azure OpenAI until those
// are integrated in a later phase.
export const mockAIProvider: AIProvider = {
  name: "deterministic.mock",

  generateRecommendation(input: AIRecommendationInput): {
    recommendationType: AIRecommendationType;
    recommendationLabel: string;
  } {
    const recommendationType = decideRecommendation(input);
    return {
      recommendationType,
      recommendationLabel: RECOMMENDATION_LABELS[recommendationType],
    };
  },

  classifyIntent(input: AIRecommendationInput): string {
    return input.intentLevel;
  },

  generateExplanation(
    input: AIRecommendationInput,
    recommendationLabel: string,
  ): AIExplanationData {
    return generateExplanation(input, recommendationLabel);
  },

  scoreConfidence(input: AIRecommendationInput): AIConfidence {
    return scoreConfidence(input);
  },

  summarizeOpportunity(input: AIRecommendationInput): string {
    return `${input.customerName} in ${input.vertical.replace("-", " ")} shows ${input.intentLevel.toLowerCase()} with an opportunity score of ${input.opportunityScore}.`;
  },
};
