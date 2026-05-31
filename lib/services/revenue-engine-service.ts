import {
  findAllCustomers,
  findCustomerById,
} from "@/lib/repositories/customer-repository";
import { findSignalsByCustomer } from "@/lib/repositories/signal-repository";
import { findOpportunitiesByCustomer } from "@/lib/repositories/opportunity-repository";
import { findCommunicationsByCustomer } from "@/lib/repositories/communication-repository";
import {
  findAllWorkflowRuns,
  findWorkflowRunsByCustomer,
} from "@/lib/repositories/workflow-repository";
import {
  findAllOutcomeEvents,
  findOutcomeEventsByCustomer,
} from "@/lib/repositories/outcome-repository";
import {
  findAllAttributions,
  findAttributionsByCustomer,
  getAttributionTotals,
} from "@/lib/repositories/attribution-repository";
import { findMissedByCustomer, getMissedTotals } from "@/lib/repositories/missed-opportunity-repository";
import {
  findEffectivenessByRun,
  getEffectivenessTotals,
  type EffectivenessTotals,
} from "@/lib/repositories/workflow-effectiveness-repository";
import { countReactivations } from "@/lib/repositories/stage-transition-repository";
import { buildIntelligenceProfile } from "@/lib/intelligence/graph-summary";
import { summarizeOutcomeMemory } from "@/lib/outcomes/outcome-memory";
import { buildOutcomeMemoryInputs } from "@/lib/outcomes/outcome-memory-builder";
import type { OutcomeMemorySummary } from "@/lib/outcomes/outcome-memory";
import type { RequestContext } from "@/lib/types/auth";
import type { Signal } from "@/lib/types/signal";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";
import type {
  MissedOpportunityRecord,
  OutcomeEventRecord,
  RevenueAttributionRecord,
  WorkflowEffectivenessRecord,
} from "@/lib/types/outcome-records";

export interface RevenueStory {
  customerName: string;
  customerId: string;
  vertical: string;
  signals: Signal[];
  profile: CustomerIntelligenceProfile;
  run: WorkflowRunRecord | null;
  effectiveness: WorkflowEffectivenessRecord | null;
  outcomeEvents: OutcomeEventRecord[];
  attributions: RevenueAttributionRecord[];
  missed: MissedOpportunityRecord[];
}

export async function getRevenueStory(
  context: RequestContext,
  customerId: string,
): Promise<RevenueStory | null> {
  const orgId = context.organizationId;
  const customer = await findCustomerById(orgId, customerId);
  if (!customer) return null;

  const [signals, opportunities, communications, runs, outcomeEvents, attributions, missed] =
    await Promise.all([
      findSignalsByCustomer(orgId, customerId),
      findOpportunitiesByCustomer(orgId, customerId),
      findCommunicationsByCustomer(orgId, customerId),
      findWorkflowRunsByCustomer(orgId, customerId),
      findOutcomeEventsByCustomer(orgId, customerId),
      findAttributionsByCustomer(orgId, customerId),
      findMissedByCustomer(orgId, customerId),
    ]);

  const profile = buildIntelligenceProfile({
    customer,
    signals,
    opportunities,
    communications,
  });

  const run = runs[0] ?? null;
  const effectiveness = run
    ? await findEffectivenessByRun(orgId, run.id)
    : null;

  return {
    customerId: customer.id,
    customerName: customer.name,
    vertical: customer.vertical,
    signals,
    profile,
    run,
    effectiveness,
    outcomeEvents,
    attributions,
    missed,
  };
}

export interface RevenueOverviewMetrics {
  revenueInfluenced: number;
  recoveredOpportunities: number;
  missedEstimate: number;
  positiveWorkflows: number;
  totalWorkflows: number;
  customersReactivated: number;
  criticalMissed: number;
}

export interface RevenueOverview {
  metrics: RevenueOverviewMetrics;
  effectiveness: EffectivenessTotals;
  memory: OutcomeMemorySummary;
  topAttributions: RevenueAttributionRecord[];
}

export async function getRevenueOverview(
  context: RequestContext,
): Promise<RevenueOverview> {
  const orgId = context.organizationId;
  const [
    attributionTotals,
    missedTotals,
    effectiveness,
    reactivations,
    attributions,
    memory,
  ] = await Promise.all([
    getAttributionTotals(orgId),
    getMissedTotals(orgId),
    getEffectivenessTotals(orgId),
    countReactivations(orgId),
    findAllAttributions(orgId),
    buildOutcomeMemory(orgId),
  ]);

  return {
    metrics: {
      revenueInfluenced: attributionTotals.revenueInfluenced,
      recoveredOpportunities: attributionTotals.recoveredCount,
      missedEstimate: missedTotals.totalEstimated,
      positiveWorkflows: effectiveness.positiveRuns,
      totalWorkflows: effectiveness.totalRuns,
      customersReactivated: reactivations,
      criticalMissed: missedTotals.criticalCount,
    },
    effectiveness,
    memory,
    topAttributions: attributions.slice(0, 6),
  };
}

// Build outcome memory by joining workflow runs, attributions, and outcome
// events into the pure memory summarizer. Four bulk queries replace the
// previous per customer loop and its inner per run effectiveness query. The
// vertical memory summary does not consume the per run effectiveness score, so
// dropping that lookup removes the inner N+1 with no change to the output.
async function buildOutcomeMemory(
  organizationId: string,
): Promise<OutcomeMemorySummary> {
  const [customers, runs, attributions, outcomeEvents] = await Promise.all([
    findAllCustomers(organizationId),
    findAllWorkflowRuns(organizationId),
    findAllAttributions(organizationId),
    findAllOutcomeEvents(organizationId),
  ]);

  const verticalByCustomerId = new Map(
    customers.map((customer) => [customer.id, customer.vertical]),
  );
  const inputs = buildOutcomeMemoryInputs({
    runs,
    attributions,
    outcomeEvents,
    verticalByCustomerId,
  });

  return summarizeOutcomeMemory(inputs);
}
