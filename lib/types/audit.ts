export type AuditEventType =
  | "SIGNAL_RECEIVED"
  | "INTENT_CLASSIFIED"
  | "POLICY_ALLOWED_ACTION"
  | "POLICY_BLOCKED_ACTION"
  | "MESSAGE_DRAFTED"
  | "VOICE_CALL_QUEUED"
  | "HUMAN_TASK_CREATED"
  | "CUSTOMER_OPTED_OUT";

export type AuditOutcome = "allowed" | "blocked" | "review" | "recorded";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  customerId: string;
  customerName: string;
  signalId: string | null;
  policyDecision: string;
  action: string;
  outcome: AuditOutcome;
  occurredAt: string;
}
