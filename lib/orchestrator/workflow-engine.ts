import type { Customer } from "@/lib/types/customer";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { ActionNode, WorkflowPlan } from "@/lib/types/orchestrator";
import { buildPolicyContext } from "@/lib/policy/action-policy-evaluator";
import { evaluateAction } from "@/lib/policy/action-policy-engine";
import { simulateExecution } from "@/lib/execution/simulated-execution-engine";
import { buildWorkflow } from "./workflow-builder";
import { validateWorkflow } from "./workflow-validator";

export interface WorkflowEngineInput {
  customer: Customer;
  profile: CustomerIntelligenceProfile;
}

// The workflow engine composes building, validation, policy annotation, and
// simulation into a single deterministic plan. It performs no IO.
export function runWorkflow(input: WorkflowEngineInput): WorkflowPlan {
  const { customer, profile } = input;

  const built = buildWorkflow({ customer, profile });
  const validation = validateWorkflow(built.plan);
  const policyContext = buildPolicyContext(customer, profile);

  // Annotate each node with its policy decision so the action graph view can
  // show allowed and blocked states without rerunning the simulation.
  const annotatedNodes: ActionNode[] = built.plan.nodes.map((node) => {
    const evaluation = evaluateAction(node.actionType, policyContext);
    const allowed = evaluation.outcome === "allowed";
    return {
      ...node,
      allowed,
      blockedReason: allowed ? null : evaluation.explanation,
      status: allowed
        ? "executed"
        : evaluation.outcome === "needs-review"
          ? "escalated"
          : "blocked",
    };
  });

  const annotatedPlan = { ...built.plan, nodes: annotatedNodes };

  const execution = validation.valid
    ? simulateExecution(annotatedPlan, policyContext)
    : {
        outcome: "failed-validation" as const,
        steps: [],
        auditEvents: [],
        actionsExecuted: 0,
        actionsBlocked: 0,
        actionsEscalated: 0,
      };

  return {
    customerId: customer.id,
    customerName: customer.name,
    title: built.title,
    trigger: built.trigger,
    plan: annotatedPlan,
    validation,
    execution,
  };
}
