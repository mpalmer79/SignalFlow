import type { ActionPolicyContext } from "@/lib/policy/action-policy-engine";
import { evaluateAction } from "@/lib/policy/action-policy-engine";
import type {
  ActionNode,
  ActionPlan,
  ActionStatus,
  ExecutionResult,
  ExecutionStep,
  WorkflowAuditEvent,
} from "@/lib/types/orchestrator";
import { ACTION_LABELS } from "@/lib/action-graph/action-node";
import { offsetToNode, orderedNodes } from "@/lib/action-graph/action-plan";
import { summarizeExecution } from "./execution-result";

// Walk the action plan, evaluate policy for each node, and record what would
// happen. Nothing is sent. The engine is deterministic and side effect free.
export function simulateExecution(
  plan: ActionPlan,
  context: ActionPolicyContext,
): ExecutionResult {
  const nodes = orderedNodes(plan);
  const steps: ExecutionStep[] = [];
  const audit: WorkflowAuditEvent[] = [];

  audit.push({
    type: "WORKFLOW_STARTED",
    actionType: null,
    detail: "Workflow simulation started.",
    offsetMinutes: 0,
  });

  let halted = false;

  nodes.forEach((node, index) => {
    const offset = offsetToNode(plan, node.id);

    if (halted) {
      steps.push(buildStep(node, index, offset, "skipped", "allowed", "Skipped after the workflow halted."));
      return;
    }

    const evaluation = evaluateAction(node.actionType, context);
    const label = ACTION_LABELS[node.actionType];

    if (evaluation.outcome === "blocked") {
      steps.push(
        buildStep(node, index, offset, "blocked", "blocked", evaluation.explanation),
      );
      audit.push({
        type: "ACTION_BLOCKED",
        actionType: node.actionType,
        detail: `${label} blocked: ${evaluation.explanation}`,
        offsetMinutes: offset,
      });
      // A pause action that resolves to blocked still halts the workflow.
      if (node.actionType === "PAUSE_OUTREACH") halted = true;
      return;
    }

    if (evaluation.outcome === "needs-review") {
      steps.push(
        buildStep(node, index, offset, "escalated", "needs-review", evaluation.explanation),
      );
      audit.push({
        type: "ESCALATION_CREATED",
        actionType: node.actionType,
        detail: `${label} routed to human review: ${evaluation.explanation}`,
        offsetMinutes: offset,
      });
      halted = true;
      return;
    }

    // Allowed.
    if (node.actionType === "PAUSE_OUTREACH") {
      steps.push(
        buildStep(node, index, offset, "executed", "allowed", "Outreach paused."),
      );
      audit.push({
        type: "ACTION_EXECUTED",
        actionType: node.actionType,
        detail: "Outreach paused.",
        offsetMinutes: offset,
      });
      halted = true;
      return;
    }

    audit.push({
      type: "ACTION_ALLOWED",
      actionType: node.actionType,
      detail: `${label} allowed: ${evaluation.explanation}`,
      offsetMinutes: offset,
    });
    steps.push(
      buildStep(node, index, offset, "executed", "allowed", `${label} executed in simulation.`),
    );
    audit.push({
      type: "ACTION_EXECUTED",
      actionType: node.actionType,
      detail: `${label} executed in simulation. Nothing was sent.`,
      offsetMinutes: offset,
    });
  });

  const result = summarizeExecution(steps, audit);

  audit.push({
    type: "WORKFLOW_COMPLETED",
    actionType: null,
    detail: `Workflow ${result.outcome}.`,
    offsetMinutes: steps[steps.length - 1]?.offsetMinutes ?? 0,
  });

  return { ...result, auditEvents: audit };
}

function buildStep(
  node: ActionNode,
  index: number,
  offset: number,
  status: ActionStatus,
  policyOutcome: ExecutionStep["policyOutcome"],
  reason: string,
): ExecutionStep {
  return {
    order: index + 1,
    offsetMinutes: offset,
    actionType: node.actionType,
    channel: node.channel,
    status,
    policyOutcome,
    reason,
  };
}
