import type { OpportunityStage } from "./opportunity";
import type { VerticalId } from "./vertical-pack";

// Deterministic outcome vocabulary produced by the Outcome Engine.
export type OutcomeType =
  | "CUSTOMER_REPLIED"
  | "EMAIL_OPENED"
  | "APPOINTMENT_SCHEDULED"
  | "APPOINTMENT_CONFIRMED"
  | "HUMAN_TASK_CREATED"
  | "HUMAN_HANDOFF_COMPLETED"
  | "OPPORTUNITY_ADVANCED"
  | "OPPORTUNITY_WON"
  | "OPPORTUNITY_LOST"
  | "OPPORTUNITY_DORMANT"
  | "OPPORTUNITY_REACTIVATED"
  | "NO_RESPONSE"
  | "ACTION_BLOCKED"
  | "COMPLIANCE_STOP";

export interface OutcomeEvent {
  outcomeType: OutcomeType;
  reason: string;
  confidence: number;
  actionType: string | null;
}

export type AttributionType =
  | "INFLUENCED"
  | "ASSISTED"
  | "RECOVERED"
  | "PREVENTED_LOSS"
  | "MISSED";

export interface RevenueAttribution {
  attributedAmount: number;
  attributionType: AttributionType;
  reason: string;
  confidence: number;
}

export interface StageTransition {
  fromStage: OpportunityStage;
  toStage: OpportunityStage;
  reason: string;
  triggeredBy: string;
}

export interface WorkflowEffectiveness {
  completionStatus: string;
  actionsExecuted: number;
  actionsBlocked: number;
  actionsEscalated: number;
  outcomeScore: number;
  revenueInfluenced: number;
  policyFriction: number;
}

export type MissedOpportunitySeverity = "low" | "medium" | "high" | "critical";

export interface MissedOpportunity {
  estimatedValue: number;
  reason: string;
  severity: MissedOpportunitySeverity;
  recommendedRecoveryAction: string;
}

// The deterministic input the outcome and attribution engines consume. It is
// assembled from persisted domain objects with no framework or Prisma concern.
export interface OutcomeContext {
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  optedOut: boolean;
  intentScore: number;
  opportunityScore: number;
  engagementScore: number;
  consentSummary: "allowed" | "blocked" | "review";
  hasCriticalRisk: boolean;
  hasRecentResponse: boolean;
  workflowOutcome: string;
  actionsExecuted: number;
  actionsBlocked: number;
  actionsEscalated: number;
  executedActionTypes: string[];
  blockedActionTypes: string[];
  opportunity: {
    id: string;
    title: string;
    stage: OpportunityStage;
    estimatedValue: number;
  } | null;
}

// The full deterministic outcome assessment for one workflow run.
export interface OutcomeAssessment {
  outcomeEvents: OutcomeEvent[];
  stageTransition: StageTransition | null;
  attribution: RevenueAttribution | null;
  effectiveness: WorkflowEffectiveness;
  missedOpportunity: MissedOpportunity | null;
}
