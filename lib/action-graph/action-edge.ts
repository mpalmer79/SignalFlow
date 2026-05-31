import type { ActionEdge, EdgeKind } from "@/lib/types/orchestrator";

export interface ActionEdgeInput {
  from: string;
  to: string;
  kind: EdgeKind;
  waitMinutes?: number;
}

const EDGE_LABELS: Record<EdgeKind, string> = {
  then: "then",
  wait: "wait",
  fallback: "if no reply",
  escalate: "escalate",
};

// Create a typed edge between two action nodes. Wait edges carry a duration so
// the execution simulator can build an offset based timeline.
export function createActionEdge(input: ActionEdgeInput): ActionEdge {
  const label =
    input.kind === "wait" && input.waitMinutes
      ? `wait ${input.waitMinutes}m`
      : EDGE_LABELS[input.kind];

  return {
    from: input.from,
    to: input.to,
    kind: input.kind,
    waitMinutes: input.waitMinutes,
    label,
  };
}
