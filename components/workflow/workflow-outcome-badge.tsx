import { Badge } from "@/components/ui/badge";
import { workflowOutcomeStyles } from "@/lib/config/workflow-status";
import type { WorkflowOutcome } from "@/lib/types/orchestrator";

export function WorkflowOutcomeBadge({
  outcome,
}: {
  outcome: WorkflowOutcome;
}) {
  const style = workflowOutcomeStyles[outcome];
  return <Badge variant={style.variant}>{style.label}</Badge>;
}
