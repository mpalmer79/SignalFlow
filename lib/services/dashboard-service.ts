import { countSignals } from "@/lib/repositories/signal-repository";
import { countAuditEvents, findRecentAuditEvents } from "@/lib/repositories/audit-repository";
import {
  countBlockedCommunications,
  countVoiceQueue,
  findAllCommunications,
  findCommunicationsByChannel,
} from "@/lib/repositories/communication-repository";
import { countOpenOpportunities } from "@/lib/repositories/opportunity-repository";
import { findAllVerticalPacks } from "@/lib/repositories/vertical-pack-repository";
import { listFollowUpQueue } from "./signal-service";
import { listHighIntentOpportunities } from "./opportunity-service";
import {
  getIntelligenceOverview,
  type CustomerIntelligenceSummary,
  type DetectedOpportunitySummary,
} from "./intelligence-service";
import { getWorkflowMetrics, type WorkflowMetrics } from "./workflow-service";
import {
  getRevenueOverview,
  type RevenueOverviewMetrics,
} from "./revenue-engine-service";
import { getRevenueLeakSummary } from "./analytics-service";
import { listScenarios } from "@/lib/scenarios/scenario-runner";
import { runAllSimulations } from "@/lib/simulation/simulation-results";
import { verticalPackConfigs } from "@/lib/verticals/registry";
import type { Signal } from "@/lib/types/signal";
import type { Opportunity } from "@/lib/types/opportunity";
import type { Communication } from "@/lib/types/communication";
import type { AuditEvent } from "@/lib/types/audit";
import type { VerticalPack } from "@/lib/types/vertical-pack";
import type { RevenueLeak } from "@/lib/types/analytics";
import type { ScenarioDefinition } from "@/lib/types/scenario";

export interface DashboardMetrics {
  totalSignals: number;
  openOpportunities: number;
  highIntentCount: number;
  blockedActions: number;
  voiceQueueCount: number;
  auditEventCount: number;
  detectedOpportunityCount: number;
  atRiskCount: number;
}

export interface DashboardIntelligence {
  topIntent: CustomerIntelligenceSummary[];
  topOpportunities: CustomerIntelligenceSummary[];
  detectedOpportunities: DetectedOpportunitySummary[];
  needingAttention: CustomerIntelligenceSummary[];
  atRisk: CustomerIntelligenceSummary[];
}

export interface DashboardData {
  metrics: DashboardMetrics;
  followUpQueue: Signal[];
  highIntentOpportunities: Opportunity[];
  blockedActions: Communication[];
  voiceQueue: Communication[];
  recentAudit: AuditEvent[];
  verticalPacks: VerticalPack[];
  intelligence: DashboardIntelligence;
  workflow: WorkflowMetrics;
  revenue: RevenueOverviewMetrics;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    totalSignals,
    openOpportunities,
    blockedActionsCount,
    voiceQueueCount,
    auditEventCount,
    followUpQueue,
    highIntentOpportunities,
    allCommunications,
    voiceQueue,
    recentAudit,
    verticalPacks,
    overview,
    workflow,
    revenueOverview,
  ] = await Promise.all([
    countSignals(),
    countOpenOpportunities(),
    countBlockedCommunications(),
    countVoiceQueue(),
    countAuditEvents(),
    listFollowUpQueue(4),
    listHighIntentOpportunities(60, 3),
    findAllCommunications(),
    findCommunicationsByChannel("voice"),
    findRecentAuditEvents(4),
    findAllVerticalPacks(),
    getIntelligenceOverview(),
    getWorkflowMetrics(),
    getRevenueOverview(),
  ]);

  const blockedActions = allCommunications.filter(
    (comm) => comm.status === "blocked" || comm.status === "escalated",
  );

  return {
    metrics: {
      totalSignals,
      openOpportunities,
      highIntentCount: highIntentOpportunities.length,
      blockedActions: blockedActionsCount,
      voiceQueueCount,
      auditEventCount,
      detectedOpportunityCount: overview.detectedOpportunities.length,
      atRiskCount: overview.atRisk.length,
    },
    followUpQueue,
    highIntentOpportunities,
    blockedActions,
    voiceQueue,
    recentAudit,
    verticalPacks,
    intelligence: {
      topIntent: overview.topIntent,
      topOpportunities: overview.topOpportunities,
      detectedOpportunities: overview.detectedOpportunities.slice(0, 5),
      needingAttention: overview.needingAttention,
      atRisk: overview.atRisk,
    },
    workflow,
    revenue: revenueOverview.metrics,
  };
}

export interface ShowcaseVerticalRow {
  vertical: string;
  name: string;
  revenueInfluenced: number;
  completionRate: number;
  averageIntent: number;
}

export interface ShowcaseWorkflowRanking {
  title: string;
  averageOutcomeScore: number;
  revenueInfluenced: number;
}

export interface ShowcaseSummary {
  topScenarios: ScenarioDefinition[];
  verticalPacks: { id: string; name: string; tagline: string }[];
  revenueLeaks: RevenueLeak[];
  industryComparison: ShowcaseVerticalRow[];
}

// The Phase 5 showcase additions for the dashboard. Scenario and vertical data
// come from the pure libraries, simulations run in memory, and revenue leaks
// come from persistence.
export async function getShowcaseSummary(): Promise<ShowcaseSummary> {
  const revenueLeaks = await getRevenueLeakSummary();
  const simulations = runAllSimulations();

  const industryComparison: ShowcaseVerticalRow[] = simulations.map((sim) => {
    const pack = verticalPackConfigs.find((p) => p.id === sim.config.vertical);
    return {
      vertical: sim.config.vertical,
      name: pack?.name ?? sim.config.vertical,
      revenueInfluenced: sim.metrics.revenueInfluenced,
      completionRate: sim.metrics.workflowCompletionRate,
      averageIntent: sim.metrics.averageIntentScore,
    };
  });

  return {
    topScenarios: listScenarios().slice(0, 4),
    verticalPacks: verticalPackConfigs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      tagline: pack.tagline,
    })),
    revenueLeaks: revenueLeaks.slice(0, 4),
    industryComparison,
  };
}
