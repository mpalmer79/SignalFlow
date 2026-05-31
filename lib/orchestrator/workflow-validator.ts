import type { ActionPlan, ValidationResult } from "@/lib/types/orchestrator";

// Validate the structure of an action plan before simulation. The checks are
// deterministic and catch malformed plans rather than policy concerns.
export function validateWorkflow(plan: ActionPlan): ValidationResult {
  const issues: string[] = [];

  if (plan.nodes.length === 0) {
    issues.push("Workflow has no actions.");
  }

  const ids = new Set(plan.nodes.map((node) => node.id));
  if (ids.size !== plan.nodes.length) {
    issues.push("Workflow contains duplicate action ids.");
  }

  for (const edge of plan.edges) {
    if (!ids.has(edge.from)) {
      issues.push(`Edge references unknown source node ${edge.from}.`);
    }
    if (!ids.has(edge.to)) {
      issues.push(`Edge references unknown target node ${edge.to}.`);
    }
    if (edge.kind === "wait" && (edge.waitMinutes ?? 0) <= 0) {
      issues.push("Wait edge must define a positive duration.");
    }
  }

  return { valid: issues.length === 0, issues };
}
