import type {
  RecommendationStatus,
  ReviewDecision,
  ReviewState,
} from "@/lib/types/ai";

// Map a reviewer decision to the resulting review state and recommendation
// status. Deterministic state machine.
export function applyReviewDecision(decision: ReviewDecision): {
  reviewState: ReviewState;
  recommendationStatus: RecommendationStatus;
} {
  switch (decision) {
    case "approved":
      return { reviewState: "approved", recommendationStatus: "approved" };
    case "rejected":
      return { reviewState: "rejected", recommendationStatus: "rejected" };
    case "needs-revision":
      return {
        reviewState: "needs-revision",
        recommendationStatus: "pending-review",
      };
    case "escalated":
      return {
        reviewState: "escalated",
        recommendationStatus: "pending-review",
      };
  }
}

// Valid lifecycle transitions. A recommendation cannot skip states.
const ALLOWED_TRANSITIONS: Record<RecommendationStatus, RecommendationStatus[]> =
  {
    draft: ["generated"],
    generated: ["pending-review", "approved"],
    "pending-review": ["approved", "rejected"],
    approved: ["executed", "archived"],
    rejected: ["archived"],
    executed: ["archived"],
    archived: [],
  };

export function canTransition(
  from: RecommendationStatus,
  to: RecommendationStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
