import type { ExecutionStep } from "@/lib/types/orchestrator";
import { ACTION_LABELS } from "@/lib/action-graph/action-node";

export interface TimelineRow {
  clock: string;
  action: string;
  result: string;
  reason: string;
}

// Render execution steps as a human readable timeline. The clock starts at a
// fixed demo time and advances by each step offset, so the timeline is stable.
const START_HOUR = 9;

export function buildExecutionTimeline(steps: ExecutionStep[]): TimelineRow[] {
  return steps.map((step) => ({
    clock: formatClock(step.offsetMinutes),
    action: ACTION_LABELS[step.actionType],
    result: resultLabel(step.status),
    reason: step.reason,
  }));
}

function formatClock(offsetMinutes: number): string {
  const total = START_HOUR * 60 + offsetMinutes;
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function resultLabel(status: ExecutionStep["status"]): string {
  switch (status) {
    case "executed":
      return "Executed";
    case "blocked":
      return "Blocked";
    case "escalated":
      return "Escalated";
    case "skipped":
      return "Skipped";
    case "planned":
      return "Planned";
  }
}
