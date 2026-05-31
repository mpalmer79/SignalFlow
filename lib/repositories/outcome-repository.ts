import type {
  ActionTypeEnum,
  AttributionType as DbAttributionType,
  MissedOpportunitySeverity as DbSeverity,
  OpportunityStage as DbStage,
  OutcomeEventType,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { OpportunityStage } from "@/lib/types/opportunity";
import type { OutcomeAssessment, OutcomeType } from "@/lib/types/outcome";
import type { OutcomeEventRecord } from "@/lib/types/outcome-records";

function stageToDb(stage: OpportunityStage): DbStage {
  return stage.replace(/-/g, "_") as DbStage;
}

const KNOWN_ACTION_TYPES = new Set<string>([
  "SEND_SMS",
  "SEND_EMAIL",
  "PLACE_VOICE_CALL",
  "CREATE_TASK",
  "ASSIGN_OWNER",
  "BOOK_APPOINTMENT",
  "ESCALATE_MANAGER",
  "REVIEW_OPPORTUNITY",
  "PAUSE_OUTREACH",
  "CLOSE_OPPORTUNITY",
]);

function actionTypeToDb(value: string | null): ActionTypeEnum | undefined {
  if (value && KNOWN_ACTION_TYPES.has(value)) return value as ActionTypeEnum;
  return undefined;
}

export interface PersistAssessmentInput {
  organizationId: string;
  customerId: string;
  opportunityId: string | null;
  workflowRunId: string;
  assessment: OutcomeAssessment;
}

// Persist a full outcome assessment: outcome events, an optional stage
// transition, an optional revenue attribution, the effectiveness snapshot, an
// optional missed opportunity, and the matching audit events. All in one place
// so the seed and services share a single writer.
export async function persistAssessment(
  input: PersistAssessmentInput,
): Promise<void> {
  const { organizationId, customerId, opportunityId, workflowRunId, assessment } =
    input;
  const auditData: Prisma.AuditEventCreateManyInput[] = [];

  if (assessment.outcomeEvents.length > 0) {
    await prisma.outcomeEvent.createMany({
      data: assessment.outcomeEvents.map((event) => ({
        organizationId,
        customerId,
        opportunityId: opportunityId ?? undefined,
        workflowRunId,
        outcomeType: event.outcomeType as OutcomeEventType,
        outcomeReason: event.reason,
        confidence: event.confidence,
        actionType: actionTypeToDb(event.actionType),
      })),
    });
    auditData.push({
      organizationId,
      type: "OUTCOME_EVENT_CREATED",
      customerId,
      opportunityId: opportunityId ?? undefined,
      workflowRunId,
      policyDecision: "Outcome recorded",
      action: `Recorded ${assessment.outcomeEvents.length} outcome events.`,
      outcome: "recorded",
    });
  }

  if (assessment.stageTransition && opportunityId) {
    const t = assessment.stageTransition;
    await prisma.stageTransition.create({
      data: {
        organizationId,
        opportunityId,
        fromStage: stageToDb(t.fromStage),
        toStage: stageToDb(t.toStage),
        reason: t.reason,
        triggeredBy: t.triggeredBy,
      },
    });
    // Move the opportunity to reflect the transition.
    await prisma.opportunity.updateMany({
      where: { id: opportunityId, organizationId },
      data: { stage: stageToDb(t.toStage) },
    });
    auditData.push({
      organizationId,
      type: "STAGE_TRANSITION_CREATED",
      customerId,
      opportunityId,
      workflowRunId,
      policyDecision: "Stage advanced",
      action: t.reason,
      outcome: "recorded",
    });
  }

  if (assessment.attribution) {
    const a = assessment.attribution;
    await prisma.revenueAttribution.create({
      data: {
        organizationId,
        customerId,
        opportunityId: opportunityId ?? undefined,
        workflowRunId,
        attributedAmount: a.attributedAmount,
        attributionType: a.attributionType as DbAttributionType,
        attributionReason: a.reason,
        confidence: a.confidence,
      },
    });
    auditData.push({
      organizationId,
      type: "REVENUE_ATTRIBUTED",
      customerId,
      opportunityId: opportunityId ?? undefined,
      workflowRunId,
      policyDecision: `${a.attributionType} attribution`,
      action: `Attributed ${a.attributedAmount} gross influence. ${a.reason}`,
      outcome: "recorded",
    });
  }

  await prisma.workflowEffectivenessSnapshot.create({
    data: {
      organizationId,
      workflowRunId,
      completionStatus: assessment.effectiveness.completionStatus,
      actionsExecuted: assessment.effectiveness.actionsExecuted,
      actionsBlocked: assessment.effectiveness.actionsBlocked,
      actionsEscalated: assessment.effectiveness.actionsEscalated,
      outcomeScore: assessment.effectiveness.outcomeScore,
      revenueInfluenced: assessment.effectiveness.revenueInfluenced,
      policyFriction: assessment.effectiveness.policyFriction,
    },
  });
  auditData.push({
    organizationId,
    type: "WORKFLOW_EFFECTIVENESS_SCORED",
    customerId,
    opportunityId: opportunityId ?? undefined,
    workflowRunId,
    policyDecision: "Effectiveness scored",
    action: `Outcome score ${assessment.effectiveness.outcomeScore} with ${assessment.effectiveness.revenueInfluenced} revenue influenced.`,
    outcome: "recorded",
  });

  if (assessment.missedOpportunity) {
    const m = assessment.missedOpportunity;
    await prisma.missedOpportunityEstimate.create({
      data: {
        organizationId,
        customerId,
        opportunityId: opportunityId ?? undefined,
        estimatedValue: m.estimatedValue,
        missedReason: m.reason,
        severity: m.severity as DbSeverity,
        recommendedRecoveryAction: m.recommendedRecoveryAction,
      },
    });
    auditData.push({
      organizationId,
      type: "MISSED_OPPORTUNITY_ESTIMATED",
      customerId,
      opportunityId: opportunityId ?? undefined,
      workflowRunId,
      policyDecision: `Missed opportunity (${m.severity})`,
      action: `${m.reason} Estimated ${m.estimatedValue}.`,
      outcome: "review",
    });
  }

  if (auditData.length > 0) {
    await prisma.auditEvent.createMany({ data: auditData });
  }
}

const withCustomerName = {
  customer: { select: { name: true } },
} as const;

export async function findOutcomeEventsByCustomer(
  organizationId: string,
  customerId: string,
): Promise<OutcomeEventRecord[]> {
  const rows = await prisma.outcomeEvent.findMany({
    where: { organizationId, customerId },
    include: withCustomerName,
    orderBy: { occurredAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    opportunityId: row.opportunityId,
    workflowRunId: row.workflowRunId,
    outcomeType: row.outcomeType as OutcomeType,
    reason: row.outcomeReason,
    confidence: row.confidence,
    occurredAt: row.occurredAt.toISOString(),
  }));
}

export async function findOutcomeEventsByOpportunity(
  organizationId: string,
  opportunityId: string,
): Promise<OutcomeEventRecord[]> {
  const rows = await prisma.outcomeEvent.findMany({
    where: { organizationId, opportunityId },
    include: withCustomerName,
    orderBy: { occurredAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    opportunityId: row.opportunityId,
    workflowRunId: row.workflowRunId,
    outcomeType: row.outcomeType as OutcomeType,
    reason: row.outcomeReason,
    confidence: row.confidence,
    occurredAt: row.occurredAt.toISOString(),
  }));
}

// All outcome events for an organization in one query. Used by the outcome
// memory aggregation, which joins runs, attributions, and outcomes in memory
// rather than issuing per customer queries.
export async function findAllOutcomeEvents(
  organizationId: string,
): Promise<OutcomeEventRecord[]> {
  const rows = await prisma.outcomeEvent.findMany({
    where: { organizationId },
    include: withCustomerName,
    orderBy: { occurredAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    opportunityId: row.opportunityId,
    workflowRunId: row.workflowRunId,
    outcomeType: row.outcomeType as OutcomeType,
    reason: row.outcomeReason,
    confidence: row.confidence,
    occurredAt: row.occurredAt.toISOString(),
  }));
}

export async function findRecentOutcomeEvents(
  organizationId: string,
  limit: number,
): Promise<OutcomeEventRecord[]> {
  const rows = await prisma.outcomeEvent.findMany({
    where: { organizationId },
    include: withCustomerName,
    orderBy: { occurredAt: "desc" },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    opportunityId: row.opportunityId,
    workflowRunId: row.workflowRunId,
    outcomeType: row.outcomeType as OutcomeType,
    reason: row.outcomeReason,
    confidence: row.confidence,
    occurredAt: row.occurredAt.toISOString(),
  }));
}
