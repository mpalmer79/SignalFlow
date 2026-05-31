import type {
  ActionStatus,
  PolicyOutcome,
  WorkflowOutcome,
} from "@/lib/types/orchestrator";

type Variant = "success" | "danger" | "warning" | "primary" | "muted";

export const workflowOutcomeStyles: Record<
  WorkflowOutcome,
  { label: string; variant: Variant }
> = {
  completed: { label: "Completed", variant: "success" },
  "partially-completed": { label: "Partially completed", variant: "warning" },
  blocked: { label: "Blocked", variant: "danger" },
  escalated: { label: "Escalated", variant: "warning" },
  paused: { label: "Paused", variant: "muted" },
  "failed-validation": { label: "Failed validation", variant: "danger" },
};

export const actionStatusStyles: Record<
  ActionStatus,
  { label: string; variant: Variant }
> = {
  planned: { label: "Planned", variant: "muted" },
  executed: { label: "Executed", variant: "success" },
  blocked: { label: "Blocked", variant: "danger" },
  skipped: { label: "Skipped", variant: "muted" },
  escalated: { label: "Escalated", variant: "warning" },
};

export const policyOutcomeStyles: Record<
  PolicyOutcome,
  { label: string; variant: Variant }
> = {
  allowed: { label: "Allowed", variant: "success" },
  blocked: { label: "Blocked", variant: "danger" },
  "needs-review": { label: "Needs review", variant: "warning" },
};
