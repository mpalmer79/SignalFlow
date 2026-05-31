import { countSignals, findSignalsByCustomer } from "@/lib/repositories/signal-repository";
import { countCustomers, findAllCustomers, findCustomerById } from "@/lib/repositories/customer-repository";
import {
  countOpenOpportunities,
  findOpportunitiesByCustomer,
} from "@/lib/repositories/opportunity-repository";
import { findCommunicationsByCustomer } from "@/lib/repositories/communication-repository";
import {
  aggregateWorkflowMetrics,
  countWorkflowRuns,
  findAllWorkflowRuns,
  findWorkflowRunsByCustomer,
} from "@/lib/repositories/workflow-repository";
import {
  findOutcomeEventsByCustomer,
  findRecentOutcomeEvents,
} from "@/lib/repositories/outcome-repository";
import {
  findAllAttributions,
  findAttributionsByCustomer,
  getAttributionTotals,
} from "@/lib/repositories/attribution-repository";
import {
  findAllMissedOpportunities,
  getMissedTotals,
} from "@/lib/repositories/missed-opportunity-repository";
import { getEffectivenessTotals } from "@/lib/repositories/workflow-effectiveness-repository";
import { countReactivations } from "@/lib/repositories/stage-transition-repository";
import { findRecentAuditEvents } from "@/lib/repositories/audit-repository";
import {
  aggregateRecommendations,
  findAllRecommendations,
  findRecommendationDetail,
  findRecommendationsByCustomer,
} from "@/lib/repositories/ai-repository";
import { buildIntelligenceProfile } from "@/lib/intelligence/graph-summary";
import { summarizeOutcomeMemory } from "@/lib/outcomes/outcome-memory";
import { outcomeLabel } from "@/lib/config/outcome-status";
import type { RequestContext } from "@/lib/types/auth";
import type { Customer } from "@/lib/types/customer";
import type { AuditEvent } from "@/lib/types/audit";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";
import type {
  MissedOpportunityRecord,
  OutcomeEventRecord,
  RevenueAttributionRecord,
} from "@/lib/types/outcome-records";
import type { AIRecommendationRecord } from "@/lib/types/ai-records";

// Executive level totals for the command center hero. Every number is computed
// from persistence and scoped to the calling organization.
export interface CommandCenterSummary {
  customers: number;
  openOpportunities: number;
  signals: number;
  recommendations: number;
  approvedRecommendations: number;
  pendingReview: number;
  workflowRuns: number;
  positiveOutcomes: number;
  totalOutcomeRuns: number;
  revenueInfluenced: number;
  recoveredOpportunities: number;
  reactivations: number;
  missedOpportunityValue: number;
  criticalMissed: number;
}

// One stage of the revenue funnel. pctOfPrevious is the conversion from the
// previous stage; pctOfTop is conversion from the top of funnel.
export interface FunnelStage {
  key: string;
  label: string;
  hint: string;
  count: number;
  pctOfPrevious: number | null;
  pctOfTop: number | null;
}

export interface VerticalRevenueRow {
  vertical: string;
  revenueInfluenced: number;
  runs: number;
  positiveRuns: number;
}

// Aggregated payload for the Revenue Command Center landing page.
export interface CommandCenterOverview {
  summary: CommandCenterSummary;
  funnel: FunnelStage[];
  recentRecommendations: AIRecommendationRecord[];
  recentWorkflowRuns: WorkflowRunRecord[];
  recentOutcomes: OutcomeEventRecord[];
  recentAudit: AuditEvent[];
  topAttributions: RevenueAttributionRecord[];
  topMissed: MissedOpportunityRecord[];
  topVerticals: VerticalRevenueRow[];
  customers: Customer[];
}

// One ordered step in the customer mission replay. The kind drives the icon
// and color in the UI; the order field makes the timeline visually linear.
export type JourneyKind =
  | "signal"
  | "intelligence"
  | "recommendation"
  | "review"
  | "workflow"
  | "outcome"
  | "attribution"
  | "missed";

export interface JourneyStep {
  order: number;
  kind: JourneyKind;
  title: string;
  detail: string;
  badge?: string;
  occurredAt: string;
  href?: string;
}

export interface JourneyReplay {
  customer: Customer;
  intelligence: CustomerIntelligenceProfile;
  steps: JourneyStep[];
  totalAttributed: number;
  positiveOutcomes: number;
  recommendationCount: number;
  workflowCount: number;
}

// Build the command center overview. Aggregates are issued in parallel and
// trimmed to keep the page snappy. All access stays org scoped.
export async function getCommandCenterOverview(
  context: RequestContext,
): Promise<CommandCenterOverview> {
  const orgId = context.organizationId;

  const [
    customerCount,
    openOpps,
    signalCount,
    workflowAggregate,
    effectiveness,
    attributionTotals,
    missedTotals,
    reactivations,
    aiAggregate,
    recommendations,
    workflowRuns,
    outcomes,
    recentAudit,
    attributions,
    missed,
    customers,
  ] = await Promise.all([
    countCustomers(orgId),
    countOpenOpportunities(orgId),
    countSignals(orgId),
    aggregateWorkflowMetrics(orgId),
    getEffectivenessTotals(orgId),
    getAttributionTotals(orgId),
    getMissedTotals(orgId),
    countReactivations(orgId),
    aggregateRecommendations(orgId),
    findAllRecommendations(orgId),
    findAllWorkflowRuns(orgId),
    findRecentOutcomeEvents(orgId, 8),
    findRecentAuditEvents(orgId, 6),
    findAllAttributions(orgId),
    findAllMissedOpportunities(orgId),
    findAllCustomers(orgId),
  ]);

  const summary: CommandCenterSummary = {
    customers: customerCount,
    openOpportunities: openOpps,
    signals: signalCount,
    recommendations: aiAggregate.total,
    approvedRecommendations: aiAggregate.approved,
    pendingReview: aiAggregate.pendingReview,
    workflowRuns: workflowAggregate.totalRuns,
    positiveOutcomes: effectiveness.positiveRuns,
    totalOutcomeRuns: effectiveness.totalRuns,
    revenueInfluenced: attributionTotals.revenueInfluenced,
    recoveredOpportunities: attributionTotals.recoveredCount,
    reactivations,
    missedOpportunityValue: missedTotals.totalEstimated,
    criticalMissed: missedTotals.criticalCount,
  };

  const funnel: FunnelStage[] = buildFunnel(summary, attributions.length);

  const verticalMemory = await buildVerticalMemory(orgId);

  return {
    summary,
    funnel,
    recentRecommendations: recommendations.slice(0, 6),
    recentWorkflowRuns: workflowRuns.slice(0, 6),
    recentOutcomes: outcomes,
    recentAudit,
    topAttributions: attributions.slice(0, 6),
    topMissed: missed.slice(0, 5),
    topVerticals: verticalMemory,
    customers,
  };
}

// Compose the funnel from summary counts. The stages are intentionally fixed
// so the visualization stays stable across organizations.
function buildFunnel(
  summary: CommandCenterSummary,
  attributionCount: number,
): FunnelStage[] {
  const stages: Array<Omit<FunnelStage, "pctOfPrevious" | "pctOfTop">> = [
    {
      key: "signals",
      label: "Signals received",
      hint: "Inbound revenue and risk events.",
      count: summary.signals,
    },
    {
      key: "customers",
      label: "Customers in intelligence",
      hint: "Profiles built deterministically from signals.",
      count: summary.customers,
    },
    {
      key: "recommendations",
      label: "AI recommendations generated",
      hint: "Deterministic, provider free.",
      count: summary.recommendations,
    },
    {
      key: "approved",
      label: "Recommendations approved",
      hint: "Cleared by human review.",
      count: summary.approvedRecommendations,
    },
    {
      key: "workflows",
      label: "Workflow runs",
      hint: "Persisted simulations.",
      count: summary.workflowRuns,
    },
    {
      key: "positive",
      label: "Positive outcomes",
      hint: "Outcome score 50 and above.",
      count: summary.positiveOutcomes,
    },
    {
      key: "attribution",
      label: "Revenue attributions",
      hint: "Influenced and recovered records.",
      count: attributionCount,
    },
  ];

  const top = stages[0]?.count ?? 0;
  return stages.map((stage, index) => {
    const prev = index > 0 ? stages[index - 1].count : null;
    return {
      ...stage,
      pctOfPrevious:
        prev && prev > 0 ? Math.round((stage.count / prev) * 100) : null,
      pctOfTop: top > 0 ? Math.round((stage.count / top) * 100) : null,
    };
  });
}

// Outcome memory per vertical, used by the "top verticals" leaderboard.
async function buildVerticalMemory(
  organizationId: string,
): Promise<VerticalRevenueRow[]> {
  const customers = await findAllCustomers(organizationId);
  const inputs: Parameters<typeof summarizeOutcomeMemory>[0] = [];

  for (const customer of customers) {
    const [runs, attributions, outcomeEvents] = await Promise.all([
      findWorkflowRunsByCustomer(organizationId, customer.id),
      findAttributionsByCustomer(organizationId, customer.id),
      findOutcomeEventsByCustomer(organizationId, customer.id),
    ]);

    for (const run of runs) {
      const runAttribution = attributions.find(
        (a) => a.workflowRunId === run.id,
      );
      const runOutcomes = outcomeEvents.filter(
        (o) => o.workflowRunId === run.id,
      );
      inputs.push({
        vertical: customer.vertical,
        outcomeTypes: runOutcomes.map((o) => o.outcomeType),
        attributionType: runAttribution?.attributionType ?? null,
        attributedAmount: runAttribution?.attributedAmount ?? 0,
        outcomeScore: 0,
        executedActionTypes: run.actions
          .filter((a) => a.status === "executed")
          .map((a) => a.actionType),
      });
    }
  }

  const memory = summarizeOutcomeMemory(inputs);
  return memory.byVertical
    .slice()
    .sort((a, b) => b.revenueInfluenced - a.revenueInfluenced)
    .map((row) => ({
      vertical: row.vertical,
      revenueInfluenced: row.revenueInfluenced,
      runs: row.runs,
      positiveRuns: row.positiveRuns,
    }));
}

// Build the mission replay for a single customer. Steps are produced in
// chronological order so the page can render a linear timeline.
export async function getJourneyReplay(
  context: RequestContext,
  customerId: string,
): Promise<JourneyReplay | null> {
  const orgId = context.organizationId;
  const customer = await findCustomerById(orgId, customerId);
  if (!customer) return null;

  const [
    signals,
    opportunities,
    communications,
    workflowRuns,
    outcomes,
    attributions,
    recommendations,
  ] = await Promise.all([
    findSignalsByCustomer(orgId, customerId),
    findOpportunitiesByCustomer(orgId, customerId),
    findCommunicationsByCustomer(orgId, customerId),
    findWorkflowRunsByCustomer(orgId, customerId),
    findOutcomeEventsByCustomer(orgId, customerId),
    findAttributionsByCustomer(orgId, customerId),
    findRecommendationsByCustomer(orgId, customerId),
  ]);

  const intelligence = buildIntelligenceProfile({
    customer,
    signals,
    opportunities,
    communications,
  });

  const topRecommendation = recommendations[0] ?? null;
  const detail = topRecommendation
    ? await findRecommendationDetail(orgId, topRecommendation.id)
    : null;

  const latestSignalAt =
    signals[0]?.receivedAt ?? new Date().toISOString();
  const intelligenceAnchor = new Date(
    new Date(latestSignalAt).getTime() + 60 * 1000,
  ).toISOString();

  const steps: JourneyStep[] = [];

  signals
    .slice()
    .reverse()
    .forEach((signal) => {
      steps.push({
        order: 0,
        kind: "signal",
        title: signal.label,
        detail: signal.detail,
        badge: signal.priority,
        occurredAt: signal.receivedAt,
      });
    });

  steps.push({
    order: 0,
    kind: "intelligence",
    title: "Intelligence profile built",
    detail: `Intent ${intelligence.intentScore}, opportunity ${intelligence.opportunityScore}, engagement ${intelligence.engagementScore}.`,
    badge: intelligence.priority,
    occurredAt: intelligenceAnchor,
  });

  recommendations
    .slice()
    .reverse()
    .forEach((rec) => {
      steps.push({
        order: 0,
        kind: "recommendation",
        title: rec.recommendationLabel,
        detail: `Confidence ${rec.confidence} (${rec.confidenceTier}). Provider ${rec.provider}.`,
        badge: rec.reviewState,
        occurredAt: rec.createdAt,
        href: `/ai-center/${rec.id}`,
      });
    });

  if (detail && detail.reviewDecisions.length > 0) {
    detail.reviewDecisions
      .slice()
      .reverse()
      .forEach((decision) => {
        steps.push({
          order: 0,
          kind: "review",
          title: `Review decision: ${decision.decision.replace(/-/g, " ")}`,
          detail: `${decision.reviewerName}. ${decision.notes}`,
          badge: decision.decision,
          occurredAt: decision.createdAt,
        });
      });
  }

  workflowRuns
    .slice()
    .reverse()
    .forEach((run) => {
      steps.push({
        order: 0,
        kind: "workflow",
        title: run.title,
        detail: `${run.actionsExecuted} executed, ${run.actionsBlocked} blocked, outcome ${run.outcome.replace(/-/g, " ")}.`,
        badge: run.outcome,
        occurredAt: run.createdAt,
        href: `/orchestrator/${run.id}`,
      });
    });

  outcomes
    .slice()
    .reverse()
    .forEach((event) => {
      steps.push({
        order: 0,
        kind: "outcome",
        title: outcomeLabel(event.outcomeType),
        detail: event.reason,
        occurredAt: event.occurredAt,
      });
    });

  attributions
    .slice()
    .reverse()
    .forEach((attribution) => {
      steps.push({
        order: 0,
        kind: "attribution",
        title: `${attribution.attributionType} attribution`,
        detail: attribution.reason,
        occurredAt: attribution.createdAt,
      });
    });

  steps.sort(
    (a, b) =>
      new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );
  steps.forEach((step, index) => {
    step.order = index + 1;
  });

  const totalAttributed = attributions
    .filter((a) => a.attributionType !== "MISSED")
    .reduce((sum, a) => sum + a.attributedAmount, 0);
  const positiveOutcomes = outcomes.filter((o) =>
    ["APPOINTMENT_SCHEDULED", "OPPORTUNITY_ADVANCED", "OPPORTUNITY_WON", "OPPORTUNITY_REACTIVATED", "CUSTOMER_REPLIED"].includes(
      o.outcomeType,
    ),
  ).length;

  return {
    customer,
    intelligence,
    steps,
    totalAttributed,
    positiveOutcomes,
    recommendationCount: recommendations.length,
    workflowCount: workflowRuns.length,
  };
}

// Pick a default customer for the replay landing page when none is selected.
// Prefers customers with both a recommendation and a workflow run so the
// replay is fully populated.
export async function pickDefaultReplayCustomerId(
  context: RequestContext,
): Promise<string | null> {
  const customers = await findAllCustomers(context.organizationId);
  if (customers.length === 0) return null;

  for (const customer of customers) {
    const [recs, runs] = await Promise.all([
      findRecommendationsByCustomer(context.organizationId, customer.id),
      findWorkflowRunsByCustomer(context.organizationId, customer.id),
    ]);
    if (recs.length > 0 && runs.length > 0) return customer.id;
  }
  return customers[0].id;
}

// Re-export commonly used helpers so the page can import from one place.
export { countWorkflowRuns };
