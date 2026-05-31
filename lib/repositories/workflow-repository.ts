import type {
  ActionTypeEnum,
  Channel as DbChannel,
  PolicyDecisionType,
  Prisma,
  WorkflowActionStatus,
  WorkflowOutcomeType,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { Channel } from "@/lib/types/consent";
import type {
  ActionStatus,
  ActionType,
  PolicyOutcome,
  WorkflowOutcome,
  WorkflowPlan,
} from "@/lib/types/orchestrator";
import type {
  WorkflowRunAction,
  WorkflowRunRecord,
} from "@/lib/types/workflow-run";

// Domain outcomes use hyphens, Prisma uses underscores.
function outcomeToDb(outcome: WorkflowOutcome): WorkflowOutcomeType {
  return outcome.replace(/-/g, "_") as WorkflowOutcomeType;
}

function outcomeFromDb(outcome: WorkflowOutcomeType): WorkflowOutcome {
  return outcome.replace(/_/g, "-") as WorkflowOutcome;
}

const POLICY_TO_DB: Record<PolicyOutcome, PolicyDecisionType> = {
  allowed: "allowed",
  blocked: "blocked",
  "needs-review": "needs_review",
};

const POLICY_FROM_DB: Record<PolicyDecisionType, PolicyOutcome> = {
  allowed: "allowed",
  blocked: "blocked",
  needs_review: "needs-review",
};

export interface PersistWorkflowInput {
  plan: WorkflowPlan;
  opportunityId: string | null;
  intentScore: number;
  opportunityScore: number;
  engagementScore: number;
}

// Persist a simulated workflow plan as a run with its actions, a result row,
// and the generated audit events, in a single transaction.
export async function persistWorkflowRun(
  input: PersistWorkflowInput,
): Promise<string> {
  const { plan, opportunityId } = input;
  const { execution } = plan;

  const run = await prisma.workflowRun.create({
    data: {
      customerId: plan.customerId,
      opportunityId: opportunityId ?? undefined,
      title: plan.title,
      trigger: plan.trigger,
      intentScore: input.intentScore,
      opportunityScore: input.opportunityScore,
      engagementScore: input.engagementScore,
      outcome: outcomeToDb(execution.outcome),
      actionsExecuted: execution.actionsExecuted,
      actionsBlocked: execution.actionsBlocked,
      actionsEscalated: execution.actionsEscalated,
      actions: {
        create: execution.steps.map((step) => ({
          order: step.order,
          actionType: step.actionType as ActionTypeEnum,
          channel: (step.channel as DbChannel | null) ?? undefined,
          status: step.status as WorkflowActionStatus,
          policyOutcome: POLICY_TO_DB[step.policyOutcome],
          offsetMinutes: step.offsetMinutes,
          reason: step.reason,
        })),
      },
      result: {
        create: {
          outcome: outcomeToDb(execution.outcome),
          summary: `Workflow ${execution.outcome} with ${execution.actionsExecuted} executed and ${execution.actionsBlocked} blocked.`,
        },
      },
    },
  });

  // Persist workflow audit events linked to both the run and the customer.
  if (execution.auditEvents.length > 0) {
    await prisma.auditEvent.createMany({
      data: execution.auditEvents.map((event) => ({
        type: event.type,
        customerId: plan.customerId,
        opportunityId: opportunityId ?? undefined,
        workflowRunId: run.id,
        policyDecision: workflowPolicyLabel(event.type),
        action: event.detail,
        outcome: auditOutcomeFor(event.type),
        occurredAt: new Date(Date.now() + event.offsetMinutes * 60000),
      })),
    });
  }

  return run.id;
}

function workflowPolicyLabel(type: string): string {
  if (type === "ACTION_BLOCKED") return "Action blocked by policy";
  if (type === "ESCALATION_CREATED") return "Routed to human review";
  if (type === "ACTION_ALLOWED") return "Action allowed by policy";
  return "Workflow lifecycle";
}

function auditOutcomeFor(
  type: string,
): "allowed" | "blocked" | "review" | "recorded" {
  switch (type) {
    case "ACTION_ALLOWED":
    case "ACTION_EXECUTED":
      return "allowed";
    case "ACTION_BLOCKED":
      return "blocked";
    case "ESCALATION_CREATED":
      return "review";
    default:
      return "recorded";
  }
}

const runInclude = {
  customer: { select: { name: true } },
  actions: { orderBy: { order: "asc" } },
} satisfies Prisma.WorkflowRunInclude;

type RunRow = Prisma.WorkflowRunGetPayload<{ include: typeof runInclude }>;

function mapRun(row: RunRow): WorkflowRunRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    title: row.title,
    trigger: row.trigger,
    intentScore: row.intentScore,
    opportunityScore: row.opportunityScore,
    engagementScore: row.engagementScore,
    outcome: outcomeFromDb(row.outcome),
    actionsExecuted: row.actionsExecuted,
    actionsBlocked: row.actionsBlocked,
    actionsEscalated: row.actionsEscalated,
    actions: row.actions.map(
      (action): WorkflowRunAction => ({
        order: action.order,
        actionType: action.actionType as ActionType,
        channel: (action.channel as Channel | null) ?? null,
        status: action.status as ActionStatus,
        policyOutcome: POLICY_FROM_DB[action.policyOutcome],
        offsetMinutes: action.offsetMinutes,
        reason: action.reason,
      }),
    ),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findAllWorkflowRuns(): Promise<WorkflowRunRecord[]> {
  const rows = await prisma.workflowRun.findMany({
    include: runInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRun);
}

export async function findWorkflowRunById(
  id: string,
): Promise<WorkflowRunRecord | null> {
  const row = await prisma.workflowRun.findUnique({
    where: { id },
    include: runInclude,
  });
  return row ? mapRun(row) : null;
}

export async function findWorkflowRunsByCustomer(
  customerId: string,
): Promise<WorkflowRunRecord[]> {
  const rows = await prisma.workflowRun.findMany({
    where: { customerId },
    include: runInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRun);
}

export async function countWorkflowRuns(): Promise<number> {
  return prisma.workflowRun.count();
}

export interface WorkflowAggregate {
  totalRuns: number;
  actionsExecuted: number;
  actionsBlocked: number;
  actionsEscalated: number;
  completedRuns: number;
}

export async function aggregateWorkflowMetrics(): Promise<WorkflowAggregate> {
  const [totals, completedRuns] = await Promise.all([
    prisma.workflowRun.aggregate({
      _count: { _all: true },
      _sum: {
        actionsExecuted: true,
        actionsBlocked: true,
        actionsEscalated: true,
      },
    }),
    prisma.workflowRun.count({ where: { outcome: "completed" } }),
  ]);

  return {
    totalRuns: totals._count._all,
    actionsExecuted: totals._sum.actionsExecuted ?? 0,
    actionsBlocked: totals._sum.actionsBlocked ?? 0,
    actionsEscalated: totals._sum.actionsEscalated ?? 0,
    completedRuns,
  };
}

export async function deleteAllWorkflowRuns(): Promise<void> {
  await prisma.workflowRun.deleteMany();
}
