import { findCustomerById } from "@/lib/repositories/customer-repository";
import { findSignalsByCustomer } from "@/lib/repositories/signal-repository";
import { findOpportunitiesByCustomer } from "@/lib/repositories/opportunity-repository";
import { findCommunicationsByCustomer } from "@/lib/repositories/communication-repository";
import { findWorkflowRunsByCustomer } from "@/lib/repositories/workflow-repository";
import { findOutcomeEventsByCustomer } from "@/lib/repositories/outcome-repository";
import { findAttributionsByCustomer } from "@/lib/repositories/attribution-repository";
import { findMissedByCustomer } from "@/lib/repositories/missed-opportunity-repository";
import { findEffectivenessByRun } from "@/lib/repositories/workflow-effectiveness-repository";
import { getAttributionTotals } from "@/lib/repositories/attribution-repository";
import { getMissedTotals } from "@/lib/repositories/missed-opportunity-repository";
import {
  getEffectivenessTotals,
  type EffectivenessTotals,
} from "@/lib/repositories/workflow-effectiveness-repository";
import { countReactivations } from "@/lib/repositories/stage-transition-repository";
import { buildIntelligenceProfile } from "@/lib/intelligence/graph-summary";
import { summarizeOutcomeMemory } from "@/lib/outcomes/outcome-memory";
import type { OutcomeMemorySummary } from "@/lib/outcomes/outcome-memory";
import { findAllCustomers } from "@/lib/repositories/customer-repository";
import { findAllAttributions } from "@/lib/repositories/attribution-repository";
import type { Signal } from "@/lib/types/signal";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";
import type {
  MissedOpportunityRecord,
  OutcomeEventRecord,
  RevenueAttributionRecord,
  WorkflowEffectivenessRecord,
} from "@/lib/types/outcome-records";

// The full signal to revenue story for one customer, used by the Revenue
// Engine page.
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
  customerId: string,
): Promise<RevenueStory | null> {
  const customer = await findCustomerById(customerId);
  if (!customer) return null;

  const [signals, opportunities, communications, runs, outcomeEvents, attributions, missed] =
    await Promise.all([
      findSignalsByCustomer(customerId),
      findOpportunitiesByCustomer(customerId),
      findCommunicationsByCustomer(customerId),
      findWorkflowRunsByCustomer(customerId),
      findOutcomeEventsByCustomer(customerId),
      findAttributionsByCustomer(customerId),
      findMissedByCustomer(customerId),
    ]);

  const profile = buildIntelligenceProfile({
    customer,
    signals,
    opportunities,
    communications,
  });

  const run = runs[0] ?? null;
  const effectiveness = run ? await findEffectivenessByRun(run.id) : null;

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

export async function getRevenueOverview(): Promise<RevenueOverview> {
  const [
    attributionTotals,
    missedTotals,
    effectiveness,
    reactivations,
    attributions,
    memory,
  ] = await Promise.all([
    getAttributionTotals(),
    getMissedTotals(),
    getEffectivenessTotals(),
    countReactivations(),
    findAllAttributions(),
    buildOutcomeMemory(),
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

// Build outcome memory by joining attributions, effectiveness, and outcome
// events per workflow run into the pure memory summarizer.
async function buildOutcomeMemory(): Promise<OutcomeMemorySummary> {
  const customers = await findAllCustomers();
  const inputs = [];

  for (const customer of customers) {
    const [runs, attributions, outcomeEvents] = await Promise.all([
      findWorkflowRunsByCustomer(customer.id),
      findAttributionsByCustomer(customer.id),
      findOutcomeEventsByCustomer(customer.id),
    ]);

    for (const run of runs) {
      const runAttribution = attributions.find(
        (a) => a.workflowRunId === run.id,
      );
      const effectiveness = await findEffectivenessByRun(run.id);
      const runOutcomes = outcomeEvents.filter(
        (o) => o.workflowRunId === run.id,
      );

      inputs.push({
        vertical: customer.vertical,
        outcomeTypes: runOutcomes.map((o) => o.outcomeType),
        attributionType: runAttribution?.attributionType ?? null,
        attributedAmount: runAttribution?.attributedAmount ?? 0,
        outcomeScore: effectiveness?.outcomeScore ?? 0,
        executedActionTypes: run.actions
          .filter((a) => a.status === "executed")
          .map((a) => a.actionType),
      });
    }
  }

  return summarizeOutcomeMemory(inputs);
}
