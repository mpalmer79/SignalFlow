import type { VerticalId } from "./vertical-pack";

// The provider abstraction is deterministic in Phase 7. These types describe
// the shape future providers (OpenAI, Anthropic, Gemini, Azure OpenAI) will
// conform to, without any of them being integrated.

export type AIRecommendationType =
  | "IMMEDIATE_HUMAN_FOLLOW_UP"
  | "APPOINTMENT_OUTREACH"
  | "REACTIVATION_OUTREACH"
  | "NURTURE_SEQUENCE"
  | "HUMAN_REVIEW"
  | "PAUSE_OUTREACH";

export type ConfidenceTier = "Very High" | "High" | "Moderate" | "Low";

// The lifecycle a recommendation moves through, from generation to execution.
export type RecommendationStatus =
  | "draft"
  | "generated"
  | "pending-review"
  | "approved"
  | "rejected"
  | "executed"
  | "archived";

export type ReviewDecision =
  | "approved"
  | "rejected"
  | "needs-revision"
  | "escalated";

export type ReviewState =
  | "pending-review"
  | "approved"
  | "rejected"
  | "needs-revision"
  | "escalated";

// A single reasoning factor that supports a recommendation.
export interface ReasoningFactor {
  label: string;
  detail: string;
  weight: number;
}

export interface AIExplanationData {
  recommendation: string;
  reasoningFactors: ReasoningFactor[];
  supportingSignals: string[];
  riskConsiderations: string[];
}

export interface AIConfidence {
  score: number;
  tier: ConfidenceTier;
}

// The deterministic input the AI engine consumes. It is assembled from the
// intelligence profile, so the AI layer never touches Prisma or a provider.
export interface AIRecommendationInput {
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  intentScore: number;
  opportunityScore: number;
  engagementScore: number;
  intentLevel: string;
  consentSummary: "allowed" | "blocked" | "review";
  optedOut: boolean;
  signalCount: number;
  riskFlags: { label: string; severity: "info" | "warning" | "critical" }[];
  supportingSignals: string[];
  estimatedValue: number;
}

// The full deterministic recommendation produced by the AI engine.
export interface AIRecommendation {
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  recommendationType: AIRecommendationType;
  recommendationLabel: string;
  confidence: AIConfidence;
  explanation: AIExplanationData;
  provider: string;
}
