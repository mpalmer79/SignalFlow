import type { Channel } from "./consent";

// The action vocabulary executed by the orchestrator. These are simulated only.
export type ActionType =
  | "SEND_SMS"
  | "SEND_EMAIL"
  | "PLACE_VOICE_CALL"
  | "CREATE_TASK"
  | "ASSIGN_OWNER"
  | "BOOK_APPOINTMENT"
  | "ESCALATE_MANAGER"
  | "REVIEW_OPPORTUNITY"
  | "PAUSE_OUTREACH"
  | "CLOSE_OPPORTUNITY";

export type PolicyOutcome = "allowed" | "blocked" | "needs-review";

export type ActionStatus =
  | "planned"
  | "executed"
  | "blocked"
  | "skipped"
  | "escalated";

export interface PolicyEvaluation {
  outcome: PolicyOutcome;
  reason: string;
  explanation: string;
}

// A single node in the action graph. Carries both the plan time intent and the
// policy decision that governs whether it may run.
export interface ActionNode {
  id: string;
  actionType: ActionType;
  channel: Channel | null;
  reason: string;
  status: ActionStatus;
  allowed: boolean;
  blockedReason: string | null;
  recommendedAt: string;
}

export type EdgeKind = "then" | "wait" | "fallback" | "escalate";

// A directed relationship between two action nodes.
export interface ActionEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  waitMinutes?: number;
  label: string;
}

export interface ActionPlan {
  nodes: ActionNode[];
  edges: ActionEdge[];
}

export type WorkflowOutcome =
  | "completed"
  | "partially-completed"
  | "blocked"
  | "escalated"
  | "paused"
  | "failed-validation";

export interface ExecutionStep {
  order: number;
  offsetMinutes: number;
  actionType: ActionType;
  channel: Channel | null;
  status: ActionStatus;
  policyOutcome: PolicyOutcome;
  reason: string;
}

export interface WorkflowAuditEvent {
  type: WorkflowAuditType;
  actionType: ActionType | null;
  detail: string;
  offsetMinutes: number;
}

export type WorkflowAuditType =
  | "WORKFLOW_CREATED"
  | "WORKFLOW_STARTED"
  | "ACTION_ALLOWED"
  | "ACTION_BLOCKED"
  | "ACTION_EXECUTED"
  | "ESCALATION_CREATED"
  | "WORKFLOW_COMPLETED";

export interface ExecutionResult {
  outcome: WorkflowOutcome;
  steps: ExecutionStep[];
  auditEvents: WorkflowAuditEvent[];
  actionsExecuted: number;
  actionsBlocked: number;
  actionsEscalated: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

// The full result of building and simulating a workflow for one customer.
export interface WorkflowPlan {
  customerId: string;
  customerName: string;
  title: string;
  trigger: string;
  plan: ActionPlan;
  validation: ValidationResult;
  execution: ExecutionResult;
}
