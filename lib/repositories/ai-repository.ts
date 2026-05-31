import type {
  AIRecommendationStatus as DbStatus,
  AIReviewState as DbReviewState,
  AIReviewDecisionType as DbDecision,
  AuditEventType,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AIRecommendation, ReviewDecision, ReviewState } from "@/lib/types/ai";
import type { ReviewReason } from "@/lib/review/review-engine";
import { REVIEW_REASON_LABELS } from "@/lib/review/review-engine";
import { applyReviewDecision } from "@/lib/review/review-decision";
import type {
  AIRecommendationDetail,
  AIRecommendationRecord,
} from "@/lib/types/ai-records";
import type { VerticalId } from "@/lib/types/vertical-pack";
import type {
  AIRecommendationType,
  ConfidenceTier,
  RecommendationStatus,
} from "@/lib/types/ai";

// Domain statuses and states use hyphens; Prisma enums use underscores.
function statusToDb(status: RecommendationStatus): DbStatus {
  return status.replace(/-/g, "_") as DbStatus;
}
function statusFromDb(status: DbStatus): RecommendationStatus {
  return status.replace(/_/g, "-") as RecommendationStatus;
}
function reviewStateToDb(state: ReviewState): DbReviewState {
  return state.replace(/-/g, "_") as DbReviewState;
}
function reviewStateFromDb(state: DbReviewState): ReviewState {
  return state.replace(/_/g, "-") as ReviewState;
}
function decisionToDb(decision: ReviewDecision): DbDecision {
  return decision.replace(/-/g, "_") as DbDecision;
}
function decisionFromDb(decision: DbDecision): ReviewDecision {
  return decision.replace(/_/g, "-") as ReviewDecision;
}

export interface PersistRecommendationInput {
  organizationId: string;
  recommendation: AIRecommendation;
  opportunityId: string | null;
  status: RecommendationStatus;
  reviewState: ReviewState;
  reviewReasons: ReviewReason[];
}

// Persist a recommendation, its explanation, and the matching audit events in
// one place. Every record carries the organization id.
export async function persistRecommendation(
  input: PersistRecommendationInput,
): Promise<string> {
  const { organizationId, recommendation, opportunityId } = input;

  const created = await prisma.aIRecommendation.create({
    data: {
      organizationId,
      customerId: recommendation.customerId,
      opportunityId: opportunityId ?? undefined,
      recommendationType: recommendation.recommendationType,
      recommendationLabel: recommendation.recommendationLabel,
      confidence: recommendation.confidence.score,
      confidenceTier: recommendation.confidence.tier,
      provider: recommendation.provider,
      status: statusToDb(input.status),
      reviewState: reviewStateToDb(input.reviewState),
      explanation: {
        create: {
          organizationId,
          explanation: recommendation.explanation.recommendation,
          reasoningFactors: recommendation.explanation.reasoningFactors.map(
            (factor) => `${factor.label}: ${factor.detail}`,
          ),
          supportingSignals: recommendation.explanation.supportingSignals,
          riskConsiderations: recommendation.explanation.riskConsiderations,
        },
      },
    },
  });

  const auditData: Prisma.AuditEventCreateManyInput[] = [
    {
      organizationId,
      type: "AI_RECOMMENDATION_CREATED" as AuditEventType,
      customerId: recommendation.customerId,
      opportunityId: opportunityId ?? undefined,
      policyDecision: `Confidence ${recommendation.confidence.score} (${recommendation.confidence.tier})`,
      action: `Generated ${recommendation.recommendationLabel} for ${recommendation.customerName}.`,
      outcome: "recorded",
    },
    {
      organizationId,
      type: "AI_EXPLANATION_GENERATED" as AuditEventType,
      customerId: recommendation.customerId,
      opportunityId: opportunityId ?? undefined,
      policyDecision: "Explanation recorded",
      action: `Recorded ${recommendation.explanation.reasoningFactors.length} reasoning factors.`,
      outcome: "recorded",
    },
  ];

  if (input.reviewReasons.length > 0) {
    auditData.push({
      organizationId,
      type: "AI_REVIEW_REQUIRED" as AuditEventType,
      customerId: recommendation.customerId,
      opportunityId: opportunityId ?? undefined,
      policyDecision: "Human review required",
      action: `Review required: ${input.reviewReasons
        .map((reason) => REVIEW_REASON_LABELS[reason])
        .join(", ")}.`,
      outcome: "review",
    });
  }

  await prisma.auditEvent.createMany({ data: auditData });
  return created.id;
}

export interface RecordReviewInput {
  organizationId: string;
  recommendationId: string;
  reviewerId: string;
  reviewerName: string;
  decision: ReviewDecision;
  notes: string;
}

// Record a reviewer decision, transition the recommendation, and emit the
// review audit events. Scoped to the organization.
export async function recordReviewDecision(
  input: RecordReviewInput,
): Promise<void> {
  const { reviewState, recommendationStatus } = applyReviewDecision(
    input.decision,
  );

  const existing = await prisma.aIRecommendation.findFirst({
    where: { id: input.recommendationId, organizationId: input.organizationId },
    select: { customerId: true, opportunityId: true },
  });
  if (!existing) return;

  await prisma.aIReviewDecision.create({
    data: {
      organizationId: input.organizationId,
      recommendationId: input.recommendationId,
      reviewerId: input.reviewerId,
      reviewerName: input.reviewerName,
      decision: decisionToDb(input.decision),
      notes: input.notes,
    },
  });

  await prisma.aIRecommendation.updateMany({
    where: { id: input.recommendationId, organizationId: input.organizationId },
    data: {
      reviewState: reviewStateToDb(reviewState),
      status: statusToDb(recommendationStatus),
    },
  });

  const auditType: AuditEventType =
    input.decision === "approved"
      ? "AI_RECOMMENDATION_APPROVED"
      : input.decision === "rejected"
        ? "AI_RECOMMENDATION_REJECTED"
        : "AI_REVIEW_COMPLETED";

  await prisma.auditEvent.create({
    data: {
      organizationId: input.organizationId,
      type: auditType,
      customerId: existing.customerId,
      opportunityId: existing.opportunityId ?? undefined,
      policyDecision: `Review ${input.decision}`,
      action: `${input.reviewerName} recorded a ${input.decision} decision.`,
      outcome:
        input.decision === "approved"
          ? "allowed"
          : input.decision === "rejected"
            ? "blocked"
            : "review",
    },
  });
}

const recommendationInclude = {
  customer: { select: { name: true, verticalId: true } },
} satisfies Prisma.AIRecommendationInclude;

type RecRow = Prisma.AIRecommendationGetPayload<{
  include: typeof recommendationInclude;
}>;

function mapRecommendation(row: RecRow): AIRecommendationRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    vertical: row.customer.verticalId as VerticalId,
    opportunityId: row.opportunityId,
    recommendationType: row.recommendationType as AIRecommendationType,
    recommendationLabel: row.recommendationLabel,
    confidence: row.confidence,
    confidenceTier: row.confidenceTier as ConfidenceTier,
    provider: row.provider,
    status: statusFromDb(row.status),
    reviewState: reviewStateFromDb(row.reviewState),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findAllRecommendations(
  organizationId: string,
): Promise<AIRecommendationRecord[]> {
  const rows = await prisma.aIRecommendation.findMany({
    where: { organizationId },
    include: recommendationInclude,
    orderBy: [{ confidence: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(mapRecommendation);
}

export async function findRecommendationsByCustomer(
  organizationId: string,
  customerId: string,
): Promise<AIRecommendationRecord[]> {
  const rows = await prisma.aIRecommendation.findMany({
    where: { organizationId, customerId },
    include: recommendationInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRecommendation);
}

export async function findRecommendationDetail(
  organizationId: string,
  id: string,
): Promise<AIRecommendationDetail | null> {
  const row = await prisma.aIRecommendation.findFirst({
    where: { id, organizationId },
    include: {
      customer: { select: { name: true, verticalId: true } },
      explanation: true,
      reviewDecisions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!row) return null;

  return {
    recommendation: mapRecommendation(row),
    explanation: row.explanation
      ? {
          id: row.explanation.id,
          recommendationId: row.explanation.recommendationId,
          explanation: row.explanation.explanation,
          reasoningFactors: row.explanation.reasoningFactors,
          supportingSignals: row.explanation.supportingSignals,
          riskConsiderations: row.explanation.riskConsiderations,
        }
      : null,
    reviewDecisions: row.reviewDecisions.map((decision) => ({
      id: decision.id,
      recommendationId: decision.recommendationId,
      reviewerName: decision.reviewerName,
      decision: decisionFromDb(decision.decision),
      notes: decision.notes,
      createdAt: decision.createdAt.toISOString(),
    })),
  };
}

export interface AIAggregate {
  total: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  escalated: number;
  averageConfidence: number;
  highRisk: number;
}

export async function aggregateRecommendations(
  organizationId: string,
): Promise<AIAggregate> {
  const [grouped, avg, highRisk, total] = await Promise.all([
    prisma.aIRecommendation.groupBy({
      by: ["reviewState"],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.aIRecommendation.aggregate({
      where: { organizationId },
      _avg: { confidence: true },
    }),
    prisma.aIRecommendation.count({
      where: { organizationId, confidence: { lt: 50 } },
    }),
    prisma.aIRecommendation.count({ where: { organizationId } }),
  ]);

  const byState = (state: DbReviewState): number =>
    grouped.find((g) => g.reviewState === state)?._count._all ?? 0;

  return {
    total,
    pendingReview: byState("pending_review") + byState("needs_revision"),
    approved: byState("approved"),
    rejected: byState("rejected"),
    escalated: byState("escalated"),
    averageConfidence: Math.round(avg._avg.confidence ?? 0),
    highRisk,
  };
}

export interface VerticalConfidence {
  vertical: string;
  averageConfidence: number;
  count: number;
}

export interface TypeApproval {
  recommendationType: string;
  total: number;
  approved: number;
}

// Aggregations for executive insights: confidence by vertical and approval
// rate by recommendation type. Both are organization scoped.
export async function getRecommendationAnalytics(organizationId: string): Promise<{
  byVertical: VerticalConfidence[];
  byType: TypeApproval[];
}> {
  const rows = await prisma.aIRecommendation.findMany({
    where: { organizationId },
    include: { customer: { select: { verticalId: true } } },
  });

  const verticalMap = new Map<string, { sum: number; count: number }>();
  const typeMap = new Map<string, { total: number; approved: number }>();

  for (const row of rows) {
    const vertical = row.customer.verticalId;
    const v = verticalMap.get(vertical) ?? { sum: 0, count: 0 };
    v.sum += row.confidence;
    v.count += 1;
    verticalMap.set(vertical, v);

    const t = typeMap.get(row.recommendationType) ?? { total: 0, approved: 0 };
    t.total += 1;
    if (row.reviewState === "approved") t.approved += 1;
    typeMap.set(row.recommendationType, t);
  }

  const byVertical = Array.from(verticalMap.entries())
    .map(([vertical, data]) => ({
      vertical,
      averageConfidence: data.count > 0 ? Math.round(data.sum / data.count) : 0,
      count: data.count,
    }))
    .sort((a, b) => b.averageConfidence - a.averageConfidence);

  const byType = Array.from(typeMap.entries())
    .map(([recommendationType, data]) => ({
      recommendationType,
      total: data.total,
      approved: data.approved,
    }))
    .sort((a, b) => b.total - a.total);

  return { byVertical, byType };
}
