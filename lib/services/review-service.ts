import {
  findAllRecommendations,
  recordReviewDecision,
} from "@/lib/repositories/ai-repository";
import { groupByReviewState } from "@/lib/review/review-queue";
import type { RequestContext } from "@/lib/types/auth";
import type { ReviewDecision, ReviewState } from "@/lib/types/ai";
import type { AIRecommendationRecord } from "@/lib/types/ai-records";

export interface ReviewQueueGroup {
  state: ReviewState;
  items: AIRecommendationRecord[];
}

export interface ReviewQueueView {
  groups: ReviewQueueGroup[];
  pendingCount: number;
}

// The review queue groups recommendations by review state. AI recommendations
// never become actions automatically; this queue is the human gate.
export async function getReviewQueue(
  context: RequestContext,
): Promise<ReviewQueueView> {
  const all = await findAllRecommendations(context.organizationId);
  const groups = groupByReviewState(all);
  const pendingCount = all.filter(
    (item) =>
      item.reviewState === "pending-review" ||
      item.reviewState === "needs-revision" ||
      item.reviewState === "escalated",
  ).length;
  return { groups, pendingCount };
}

// Record a reviewer decision. The reviewer identity comes from the resolved
// server context, never the client.
export async function submitReviewDecision(
  context: RequestContext,
  recommendationId: string,
  decision: ReviewDecision,
  notes: string,
): Promise<void> {
  await recordReviewDecision({
    organizationId: context.organizationId,
    recommendationId,
    reviewerId: context.userId,
    reviewerName: context.userName,
    decision,
    notes,
  });
}
