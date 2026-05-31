export type LeakType =
  | "NO_CONSENT"
  | "NO_HUMAN_FOLLOW_UP"
  | "DORMANT_OPPORTUNITY"
  | "REPEATED_NO_RESPONSE"
  | "MISSED_APPOINTMENT";

export type LeakSeverity = "low" | "medium" | "high" | "critical";

export interface RevenueLeak {
  leakType: LeakType;
  estimatedImpact: number;
  recoveryRecommendation: string;
  severity: LeakSeverity;
  count: number;
}

export interface ExecutiveSummary {
  revenueInfluenced: number;
  recoveredOpportunities: number;
  highestPerformingWorkflow: string;
  mostValuableSignalType: string;
  largestRevenueLeak: string;
  topReactivationCount: number;
  policyFrictionScore: number;
}

export interface WorkflowInsight {
  title: string;
  runs: number;
  averageOutcomeScore: number;
  revenueInfluenced: number;
}

export interface OpportunityInsight {
  vertical: string;
  total: number;
  influenced: number;
  conversionRate: number;
}
