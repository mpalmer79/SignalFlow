import type { ReviewState } from "@/lib/types/ai";

// Display configuration for review queue states. Pure presentation-neutral
// metadata used by the UI layer.
export const REVIEW_STATE_LABELS: Record<ReviewState, string> = {
  "pending-review": "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  "needs-revision": "Needs revision",
  escalated: "Escalated",
};

export const REVIEW_STATE_ORDER: ReviewState[] = [
  "pending-review",
  "escalated",
  "needs-revision",
  "approved",
  "rejected",
];

// Group items that carry a review state into ordered buckets. Generic so it
// works over any record shape with a reviewState field.
export function groupByReviewState<T extends { reviewState: ReviewState }>(
  items: T[],
): { state: ReviewState; items: T[] }[] {
  return REVIEW_STATE_ORDER.map((state) => ({
    state,
    items: items.filter((item) => item.reviewState === state),
  })).filter((group) => group.items.length > 0);
}
