import type { ActionEdge, ActionNode, ActionPlan } from "@/lib/types/orchestrator";

// Assemble nodes and edges into an action plan. The order of nodes defines the
// linear walk used by the execution simulator.
export function createActionPlan(
  nodes: ActionNode[],
  edges: ActionEdge[],
): ActionPlan {
  return { nodes, edges };
}

// Return nodes in execution order by following edges from the first node. Falls
// back to the declared node order when the graph is not a simple chain.
export function orderedNodes(plan: ActionPlan): ActionNode[] {
  if (plan.nodes.length === 0) return [];

  const byId = new Map(plan.nodes.map((node) => [node.id, node]));
  const nextEdge = new Map(plan.edges.map((edge) => [edge.from, edge]));

  const targets = new Set(plan.edges.map((edge) => edge.to));
  const start = plan.nodes.find((node) => !targets.has(node.id)) ?? plan.nodes[0];

  const ordered: ActionNode[] = [];
  const visited = new Set<string>();
  let current: ActionNode | undefined = start;

  while (current && !visited.has(current.id)) {
    ordered.push(current);
    visited.add(current.id);
    const edge = nextEdge.get(current.id);
    current = edge ? byId.get(edge.to) : undefined;
  }

  // Include any nodes not reached by the chain, preserving declared order.
  for (const node of plan.nodes) {
    if (!visited.has(node.id)) ordered.push(node);
  }

  return ordered;
}

// Sum the wait durations along the chain to a given node, producing the offset
// in minutes used by the execution timeline.
export function offsetToNode(plan: ActionPlan, nodeId: string): number {
  let offset = 0;
  let cursor: string | undefined = firstNodeId(plan);

  while (cursor && cursor !== nodeId) {
    const edge: ActionEdge | undefined = plan.edges.find(
      (e) => e.from === cursor,
    );
    if (!edge) break;
    offset += edge.waitMinutes ?? 0;
    cursor = edge.to;
  }

  return offset;
}

function firstNodeId(plan: ActionPlan): string | undefined {
  const targets = new Set(plan.edges.map((edge) => edge.to));
  const start = plan.nodes.find((node) => !targets.has(node.id));
  return start?.id ?? plan.nodes[0]?.id;
}
