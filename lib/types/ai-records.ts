import type { VerticalId } from "./vertical-pack";
import type {
  AIRecommendationType,
  ConfidenceTier,
  RecommendationStatus,
  ReviewDecision,
  ReviewState,
} from "./ai";

// Persisted AI record shapes returned by the repository layer.

export interface AIRecommendationRecord {
  id: string;
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  opportunityId: string | null;
  recommendationType: AIRecommendationType;
  recommendationLabel: string;
  confidence: number;
  confidenceTier: ConfidenceTier;
  provider: string;
  status: RecommendationStatus;
  reviewState: ReviewState;
  createdAt: string;
}

export interface AIExplanationRecord {
  id: string;
  recommendationId: string;
  explanation: string;
  reasoningFactors: string[];
  supportingSignals: string[];
  riskConsiderations: string[];
}

export interface AIReviewDecisionRecord {
  id: string;
  recommendationId: string;
  reviewerName: string;
  decision: ReviewDecision;
  notes: string;
  createdAt: string;
}

export interface AIRecommendationDetail {
  recommendation: AIRecommendationRecord;
  explanation: AIExplanationRecord | null;
  reviewDecisions: AIReviewDecisionRecord[];
}
