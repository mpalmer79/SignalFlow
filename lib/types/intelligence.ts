import type { Channel, ConsentState } from "./consent";
import type { Customer } from "./customer";
import type { Opportunity } from "./opportunity";
import type { VerticalId } from "./vertical-pack";

// The normalized signal vocabulary used by the Signal Engine. Raw persisted
// signals and free-form events are mapped into these stable categories.
export type NormalizedSignalType =
  | "NEW_LEAD"
  | "MISSED_CALL"
  | "EMAIL_OPEN"
  | "EMAIL_CLICK"
  | "SMS_REPLY"
  | "APPOINTMENT_REQUEST"
  | "APPOINTMENT_CANCEL"
  | "TRADE_REQUEST"
  | "VEHICLE_VIEW"
  | "SERVICE_DUE"
  | "RECALL_NOTICE"
  | "DENTAL_RECALL"
  | "ESTIMATE_REQUEST"
  | "CONSULTATION_REQUEST";

// Deterministic intent classifications. No model output is involved.
export type IntentClassification =
  | "Researching"
  | "Interested"
  | "Engaged"
  | "Purchase Intent"
  | "Appointment Intent"
  | "Reactivation Opportunity"
  | "Needs Human Review";

export type IntelligencePriority = "high" | "medium" | "low";

export type ConsentSummary = "allowed" | "blocked" | "review";

export interface NormalizedSignal {
  signalId: string;
  rawLabel: string;
  rawDetail: string;
  normalizedType: NormalizedSignalType;
  intent: IntentClassification;
  priority: IntelligencePriority;
  intentContribution: number;
  recommendedAction: string;
  receivedAt: string;
}

export type DetectedOpportunityType =
  | "Vehicle Purchase Opportunity"
  | "Service Revenue Opportunity"
  | "Appointment Opportunity"
  | "Sales Opportunity"
  | "Reactivation Opportunity"
  | "Consultation Opportunity";

export interface DetectedOpportunity {
  type: DetectedOpportunityType;
  reason: string;
  confidence: number;
  recommendedAction: string;
  sourceSignalId: string;
}

export type NextBestActionType =
  | "Send SMS"
  | "Send Email"
  | "Create Task"
  | "Schedule Call"
  | "Escalate To Manager"
  | "Book Appointment"
  | "Review Opportunity"
  | "Pause Outreach";

export type ActionUrgency = "immediate" | "high" | "standard" | "low";

export interface NextBestAction {
  action: NextBestActionType;
  rationale: string;
  channel: Channel | null;
  urgency: ActionUrgency;
}

export type RiskFlagSeverity = "info" | "warning" | "critical";

export interface IntelligenceRiskFlag {
  label: string;
  severity: RiskFlagSeverity;
  influence: string;
}

export interface CustomerIntelligenceProfile {
  customer: Customer;
  vertical: VerticalId;
  intentScore: number;
  intentLevel: IntentClassification;
  opportunityScore: number;
  engagementScore: number;
  priority: IntelligencePriority;
  preferredChannel: Channel;
  preferredChannelConsent: ConsentState;
  consentSummary: ConsentSummary;
  normalizedSignals: NormalizedSignal[];
  detectedOpportunities: DetectedOpportunity[];
  recommendedActions: NextBestAction[];
  riskFlags: IntelligenceRiskFlag[];
  openOpportunities: Opportunity[];
}

// Lightweight in-memory graph. The graph is expressed with TypeScript objects,
// not a graph database.
export type GraphNodeType =
  | "customer"
  | "signal"
  | "opportunity"
  | "communication"
  | "risk";

export interface CustomerGraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
}

export type GraphRelation =
  | "submitted"
  | "associated-with"
  | "received"
  | "flagged-with"
  | "prefers";

export interface CustomerGraphEdge {
  from: string;
  to: string;
  relation: GraphRelation;
}

export interface CustomerGraph {
  customerId: string;
  customerName: string;
  nodes: CustomerGraphNode[];
  edges: CustomerGraphEdge[];
}
