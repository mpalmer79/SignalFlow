import { findCustomerById } from "@/lib/repositories/customer-repository";
import { findSignalsByCustomer } from "@/lib/repositories/signal-repository";
import { findOpportunitiesByCustomer } from "@/lib/repositories/opportunity-repository";
import { findCommunicationsByCustomer } from "@/lib/repositories/communication-repository";
import {
  aggregateRecommendations,
  findAllRecommendations,
  findRecommendationDetail,
  findRecommendationsByCustomer,
  getRecommendationAnalytics,
  type AIAggregate,
} from "@/lib/repositories/ai-repository";
import { buildIntelligenceProfile } from "@/lib/intelligence/graph-summary";
import { generateRecommendation } from "@/lib/ai/ai-engine";
import { determineReviewRequirement } from "@/lib/review/review-engine";
import { validateRecommendation } from "@/lib/ai/ai-output-validator";
import type { RequestContext } from "@/lib/types/auth";
import type { AIRecommendation } from "@/lib/types/ai";
import type {
  AIRecommendationDetail,
  AIRecommendationRecord,
} from "@/lib/types/ai-records";

export interface AICenterView {
  recommendations: AIRecommendationRecord[];
  metrics: AIAggregate;
}

export async function getAICenter(
  context: RequestContext,
): Promise<AICenterView> {
  const [recommendations, metrics] = await Promise.all([
    findAllRecommendations(context.organizationId),
    aggregateRecommendations(context.organizationId),
  ]);
  return { recommendations, metrics };
}

export async function getRecommendationDetail(
  context: RequestContext,
  id: string,
): Promise<AIRecommendationDetail | null> {
  return findRecommendationDetail(context.organizationId, id);
}

export async function listRecommendationsByCustomer(
  context: RequestContext,
  customerId: string,
): Promise<AIRecommendationRecord[]> {
  return findRecommendationsByCustomer(context.organizationId, customerId);
}

export async function getAIMetrics(
  context: RequestContext,
): Promise<AIAggregate> {
  return aggregateRecommendations(context.organizationId);
}

export interface AIAnalytics {
  byVertical: { vertical: string; averageConfidence: number; count: number }[];
  byType: { recommendationType: string; total: number; approved: number }[];
}

export async function getAIAnalytics(
  context: RequestContext,
): Promise<AIAnalytics> {
  return getRecommendationAnalytics(context.organizationId);
}

// Build a live recommendation preview for a customer without persisting it.
// Used by the revenue engine and customer views to show what the AI would
// recommend. Deterministic and provider free.
export async function previewRecommendation(
  context: RequestContext,
  customerId: string,
): Promise<{ recommendation: AIRecommendation; requiresReview: boolean } | null> {
  const orgId = context.organizationId;
  const customer = await findCustomerById(orgId, customerId);
  if (!customer) return null;

  const [signals, opportunities, communications] = await Promise.all([
    findSignalsByCustomer(orgId, customerId),
    findOpportunitiesByCustomer(orgId, customerId),
    findCommunicationsByCustomer(orgId, customerId),
  ]);

  const profile = buildIntelligenceProfile({
    customer,
    signals,
    opportunities,
    communications,
  });

  const recommendation = generateRecommendation(profile);
  const validation = validateRecommendation(recommendation);
  if (!validation.valid) return null;

  const review = determineReviewRequirement(recommendation);
  return { recommendation, requiresReview: review.requiresReview };
}
