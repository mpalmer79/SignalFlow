import {
  findAllCustomers,
  findCustomerById,
} from "@/lib/repositories/customer-repository";
import { findSignalsByCustomer } from "@/lib/repositories/signal-repository";
import { findOpportunitiesByCustomer } from "@/lib/repositories/opportunity-repository";
import { findCommunicationsByCustomer } from "@/lib/repositories/communication-repository";
import {
  aggregateWorkflowMetrics,
  findAllWorkflowRuns,
  findWorkflowRunById,
  findWorkflowRunsByCustomer,
  type WorkflowAggregate,
} from "@/lib/repositories/workflow-repository";
import { planWorkflowForCustomer } from "@/lib/orchestrator/workflow-runner";
import { buildExecutionTimeline, type TimelineRow } from "@/lib/execution/execution-timeline";
import type { WorkflowPlan } from "@/lib/types/orchestrator";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";

export interface WorkflowPreview {
  plan: WorkflowPlan;
  timeline: TimelineRow[];
}

// Build a live workflow preview for a customer. This is the same deterministic
// plan that the seed persists, recomputed on demand for detail views.
export async function getWorkflowPreview(
  customerId: string,
): Promise<WorkflowPreview | null> {
  const customer = await findCustomerById(customerId);
  if (!customer) return null;

  const [signals, opportunities, communications] = await Promise.all([
    findSignalsByCustomer(customerId),
    findOpportunitiesByCustomer(customerId),
    findCommunicationsByCustomer(customerId),
  ]);

  const plan = planWorkflowForCustomer({
    customer,
    signals,
    opportunities,
    communications,
  });

  return { plan, timeline: buildExecutionTimeline(plan.execution.steps) };
}

// Build a live workflow preview for a showcase customer, used by the Action
// Graph page. Picks a customer whose plan exercises allowed and escalated
// actions so the page tells a complete story.
export async function getShowcaseWorkflow(): Promise<WorkflowPreview | null> {
  const customers = await findAllCustomers();
  const preferred =
    customers.find((c) => c.id === "cust-marcus-holloway") ?? customers[0];
  if (!preferred) return null;
  return getWorkflowPreview(preferred.id);
}

export async function listWorkflowRuns(): Promise<WorkflowRunRecord[]> {
  return findAllWorkflowRuns();
}

export async function listWorkflowRunsByCustomer(
  customerId: string,
): Promise<WorkflowRunRecord[]> {
  return findWorkflowRunsByCustomer(customerId);
}

export interface WorkflowRunDetail {
  run: WorkflowRunRecord;
  timeline: TimelineRow[];
}

export async function getWorkflowRunDetail(
  id: string,
): Promise<WorkflowRunDetail | null> {
  const run = await findWorkflowRunById(id);
  if (!run) return null;

  const timeline = buildExecutionTimeline(
    run.actions.map((action) => ({
      order: action.order,
      offsetMinutes: action.offsetMinutes,
      actionType: action.actionType,
      channel: action.channel,
      status: action.status,
      policyOutcome: action.policyOutcome,
      reason: action.reason,
    })),
  );

  return { run, timeline };
}

export interface WorkflowMetrics extends WorkflowAggregate {
  completionRate: number;
}

export async function getWorkflowMetrics(): Promise<WorkflowMetrics> {
  const aggregate = await aggregateWorkflowMetrics();
  const completionRate =
    aggregate.totalRuns > 0
      ? Math.round((aggregate.completedRuns / aggregate.totalRuns) * 100)
      : 0;
  return { ...aggregate, completionRate };
}
