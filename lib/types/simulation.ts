import type { VerticalId } from "./vertical-pack";

export interface SimulationConfig {
  id: string;
  title: string;
  vertical: VerticalId;
  count: number;
  summary: string;
}

export interface SimulationMetrics {
  customers: number;
  appointmentsGenerated: number;
  revenueInfluenced: number;
  missedOpportunityValue: number;
  workflowCompletionRate: number;
  policyBlocks: number;
  escalations: number;
  averageIntentScore: number;
  averageOpportunityScore: number;
  averageEngagementScore: number;
  positiveOutcomeRate: number;
}

export interface SimulationOutcomeBreakdownRow {
  outcomeType: string;
  count: number;
}

export interface SimulationResult {
  config: SimulationConfig;
  metrics: SimulationMetrics;
  outcomeBreakdown: SimulationOutcomeBreakdownRow[];
}
