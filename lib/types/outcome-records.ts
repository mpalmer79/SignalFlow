import type { OpportunityStage } from "./opportunity";
import type {
  AttributionType,
  MissedOpportunitySeverity,
  OutcomeType,
} from "./outcome";

// Domain shapes for persisted Phase 4 records, returned by the repository layer.

export interface OutcomeEventRecord {
  id: string;
  customerId: string;
  customerName: string;
  opportunityId: string | null;
  workflowRunId: string | null;
  outcomeType: OutcomeType;
  reason: string;
  confidence: number;
  occurredAt: string;
}

export interface RevenueAttributionRecord {
  id: string;
  customerId: string;
  customerName: string;
  opportunityId: string | null;
  workflowRunId: string | null;
  attributedAmount: number;
  attributionType: AttributionType;
  reason: string;
  confidence: number;
  createdAt: string;
}

export interface StageTransitionRecord {
  id: string;
  opportunityId: string;
  fromStage: OpportunityStage;
  toStage: OpportunityStage;
  reason: string;
  triggeredBy: string;
  createdAt: string;
}

export interface WorkflowEffectivenessRecord {
  id: string;
  workflowRunId: string;
  completionStatus: string;
  actionsExecuted: number;
  actionsBlocked: number;
  actionsEscalated: number;
  outcomeScore: number;
  revenueInfluenced: number;
  policyFriction: number;
  createdAt: string;
}

export interface MissedOpportunityRecord {
  id: string;
  customerId: string;
  customerName: string;
  opportunityId: string | null;
  estimatedValue: number;
  reason: string;
  severity: MissedOpportunitySeverity;
  recommendedRecoveryAction: string;
  createdAt: string;
}
