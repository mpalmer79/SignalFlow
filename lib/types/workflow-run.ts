import type { Channel } from "./consent";
import type {
  ActionStatus,
  ActionType,
  PolicyOutcome,
  WorkflowOutcome,
} from "./orchestrator";

export interface WorkflowRunAction {
  order: number;
  actionType: ActionType;
  channel: Channel | null;
  status: ActionStatus;
  policyOutcome: PolicyOutcome;
  offsetMinutes: number;
  reason: string;
}

export interface WorkflowRunRecord {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  trigger: string;
  intentScore: number;
  opportunityScore: number;
  engagementScore: number;
  outcome: WorkflowOutcome;
  actionsExecuted: number;
  actionsBlocked: number;
  actionsEscalated: number;
  actions: WorkflowRunAction[];
  createdAt: string;
}
