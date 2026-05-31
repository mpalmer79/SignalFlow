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
import type { RequestContext } from "@/lib/types/auth";
import type { WorkflowPlan } from "@/lib/types/orchestrator";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";

export interface WorkflowPreview {
  plan: WorkflowPlan;
  timeline: TimelineRow[];
}

// Build a live workflow preview for a customer. This is the same deterministic
// plan that the seed persists, recomputed on demand for detail views.
export async function getWorkflowPreview(
  context: RequestContext,
  customerId: string,
): Promise<WorkflowPreview | null> {
  const orgId = context.organizationId;
  const customer = await findCustomerById(orgId, customerId);
  if (!customer) return null;

  const [signals, opportunities, communications] = await Promise.all([
    findSignalsByCustomer(orgId, customerId),
    findOpportunitiesByCustomer(orgId, customerId),
    findCommunicationsByCustomer(orgId, customerId),
  ]);

  const plan = planWorkflowForCustomer({
    customer,
    signals,
    opportunities,
    communications,
  });

  return { plan, timeline: buildExecutionTimeline(plan.execution.steps) };
}

// Pick a showcase customer for the Action Graph page. Prefers a high intent
// automotive buyer when present, otherwise the first customer.
export async function getShowcaseWorkflow(
  context: RequestContext,
): Promise<WorkflowPreview | null> {
  const customers = await findAllCustomers(context.organizationId);
  const preferred =
    customers.find((c) => c.name.includes("Marcus")) ?? customers[0];
  if (!preferred) return null;
  return getWorkflowPreview(context, preferred.id);
}

export async function listWorkflowRuns(
  context: RequestContext,
): Promise<WorkflowRunRecord[]> {
  return findAllWorkflowRuns(context.organizationId);
}

export async function listWorkflowRunsByCustomer(
  context: RequestContext,
  customerId: string,
): Promise<WorkflowRunRecord[]> {
  return findWorkflowRunsByCustomer(context.organizationId, customerId);
}

export interface WorkflowRunDetail {
  run: WorkflowRunRecord;
  timeline: TimelineRow[];
}

export async function getWorkflowRunDetail(
  context: RequestContext,
  id: string,
): Promise<WorkflowRunDetail | null> {
  const run = await findWorkflowRunById(context.organizationId, id);
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

export async function getWorkflowMetrics(
  context: RequestContext,
): Promise<WorkflowMetrics> {
  const aggregate = await aggregateWorkflowMetrics(context.organizationId);
  const completionRate =
    aggregate.totalRuns > 0
      ? Math.round((aggregate.completedRuns / aggregate.totalRuns) * 100)
      : 0;
  return { ...aggregate, completionRate };
}
