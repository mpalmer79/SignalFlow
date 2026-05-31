import type {
  ExecutionResult,
  ExecutionStep,
  WorkflowAuditEvent,
  WorkflowOutcome,
} from "@/lib/types/orchestrator";

// Derive the overall workflow outcome from the executed steps. The rules are
// fixed and deterministic.
export function deriveOutcome(steps: ExecutionStep[]): WorkflowOutcome {
  if (steps.length === 0) return "failed-validation";

  const executed = steps.filter((s) => s.status === "executed").length;
  const blocked = steps.filter((s) => s.status === "blocked").length;
  const escalated = steps.filter((s) => s.status === "escalated").length;

  if (steps.length === 1 && steps[0].actionType === "PAUSE_OUTREACH") {
    return "paused";
  }
  if (escalated > 0) return "escalated";
  if (executed === 0 && blocked > 0) return "blocked";
  if (blocked > 0) return "partially-completed";
  return "completed";
}

export function summarizeExecution(
  steps: ExecutionStep[],
  auditEvents: WorkflowAuditEvent[],
): ExecutionResult {
  return {
    outcome: deriveOutcome(steps),
    steps,
    auditEvents,
    actionsExecuted: steps.filter((s) => s.status === "executed").length,
    actionsBlocked: steps.filter((s) => s.status === "blocked").length,
    actionsEscalated: steps.filter((s) => s.status === "escalated").length,
  };
}
