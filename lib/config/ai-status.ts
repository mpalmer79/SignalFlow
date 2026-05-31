import type { ConfidenceTier, ReviewState } from "@/lib/types/ai";

type Variant = "success" | "danger" | "warning" | "primary" | "muted";

export const confidenceTierStyles: Record<
  ConfidenceTier,
  { label: string; variant: Variant }
> = {
  "Very High": { label: "Very High", variant: "success" },
  High: { label: "High", variant: "primary" },
  Moderate: { label: "Moderate", variant: "warning" },
  Low: { label: "Low", variant: "danger" },
};

export const reviewStateStyles: Record<
  ReviewState,
  { label: string; variant: Variant }
> = {
  "pending-review": { label: "Pending review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  "needs-revision": { label: "Needs revision", variant: "warning" },
  escalated: { label: "Escalated", variant: "primary" },
};
