import type {
  AuditEventType,
  Prisma,
  VoiceCallOutcomeEnum,
  VoiceCallStatusEnum,
  VoiceComplianceStatusEnum,
  VoicePlanStatusEnum,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  SimulatedCall,
  VoiceComplianceResult,
  VoicePlan,
  VoiceTranscript,
} from "@/lib/types/voice";
import type {
  VoiceCallDetail,
  VoiceCallOutcomeRecord,
  VoiceCallRecord,
  VoiceComplianceDecisionRecord,
  VoicePlanRecord,
  VoiceTranscriptRecord,
} from "@/lib/types/voice-records";
import type { VerticalId } from "@/lib/types/vertical-pack";
import type {
  TranscriptLine,
  VoiceCallOutcomeType,
  VoiceCallPriority,
  VoiceCallPurpose,
  VoiceCallStatus,
  VoiceComplianceStatus,
  VoicePlanStatus,
  VoiceScriptType,
} from "@/lib/types/voice";
import type { VoiceOutcomeResult } from "@/lib/voice/voice-outcome-engine";

// Domain enums use hyphens, Prisma enums use underscores.
function complianceToDb(status: VoiceComplianceStatus): VoiceComplianceStatusEnum {
  return status.replace(/-/g, "_") as VoiceComplianceStatusEnum;
}
function complianceFromDb(status: VoiceComplianceStatusEnum): VoiceComplianceStatus {
  return status.replace(/_/g, "-") as VoiceComplianceStatus;
}
function planStatusFromDb(status: VoicePlanStatusEnum): VoicePlanStatus {
  return status.replace(/_/g, "-") as VoicePlanStatus;
}
function callStatusFromDb(status: VoiceCallStatusEnum): VoiceCallStatus {
  return status.replace(/_/g, "-") as VoiceCallStatus;
}

// Map a compliance status to the matching plan status.
function planStatusFor(
  compliance: VoiceComplianceStatus,
  simulated: boolean,
): VoicePlanStatusEnum {
  if (compliance === "blocked") return "blocked";
  if (compliance === "needs-review") return "needs_review";
  return simulated ? "simulated" : "ready";
}

function callStatusFor(call: SimulatedCall): VoiceCallStatusEnum {
  if (call.outcomeType === "COMPLIANCE_STOP") return "blocked";
  if (call.outcomeType === "NO_ANSWER" || call.outcomeType === "WRONG_NUMBER") {
    return "no_answer";
  }
  return "completed";
}

const COMPLIANCE_AUDIT: Record<VoiceComplianceStatus, AuditEventType> = {
  allowed: "VOICE_COMPLIANCE_ALLOWED",
  blocked: "VOICE_COMPLIANCE_BLOCKED",
  "needs-review": "VOICE_COMPLIANCE_NEEDS_REVIEW",
};

export interface PersistVoicePlanInput {
  organizationId: string;
  plan: VoicePlan;
  compliance: VoiceComplianceResult;
  opportunityId: string | null;
  recommendationId: string | null;
  // When the plan is allowed, the simulated call and its results are provided
  // so the whole voice record is persisted in one place.
  simulation: {
    call: SimulatedCall;
    transcript: VoiceTranscript;
    outcome: VoiceOutcomeResult;
  } | null;
}

// Persist a voice plan, its compliance decision, and, when the call proceeded,
// the call, transcript, outcome, and matching audit events. Every record
// carries the organization id.
export async function persistVoicePlan(
  input: PersistVoicePlanInput,
): Promise<string> {
  const { organizationId, plan, compliance, opportunityId, recommendationId } =
    input;
  const simulated = input.simulation !== null;

  const created = await prisma.voicePlan.create({
    data: {
      organizationId,
      customerId: plan.customerId,
      opportunityId: opportunityId ?? undefined,
      recommendationId: recommendationId ?? undefined,
      purpose: plan.callPurpose,
      priority: plan.callPriority,
      scriptType: plan.recommendedScriptType,
      status: planStatusFor(compliance.status, simulated),
      complianceStatus: complianceToDb(compliance.status),
      blockedReason: compliance.blockedReason ?? undefined,
      expectedOutcome: plan.expectedOutcome,
      requiresApproval: plan.requiresApproval,
      complianceDecision: {
        create: {
          organizationId,
          decision: complianceToDb(compliance.status),
          reason: compliance.summary,
        },
      },
    },
  });

  const auditData: Prisma.AuditEventCreateManyInput[] = [
    {
      organizationId,
      type: "VOICE_PLAN_CREATED",
      customerId: plan.customerId,
      opportunityId: opportunityId ?? undefined,
      policyDecision: `Voice plan: ${plan.callPurpose}`,
      action: `Created a ${plan.callPriority} priority voice plan for ${plan.customerName}.`,
      outcome: "recorded",
    },
    {
      organizationId,
      type: COMPLIANCE_AUDIT[compliance.status],
      customerId: plan.customerId,
      opportunityId: opportunityId ?? undefined,
      policyDecision: `Voice compliance ${compliance.status}`,
      action: compliance.summary,
      outcome:
        compliance.status === "allowed"
          ? "allowed"
          : compliance.status === "blocked"
            ? "blocked"
            : "review",
    },
  ];

  if (input.simulation) {
    const { call, transcript, outcome } = input.simulation;
    const callRow = await prisma.voiceCall.create({
      data: {
        organizationId,
        voicePlanId: created.id,
        customerId: plan.customerId,
        opportunityId: opportunityId ?? undefined,
        status: callStatusFor(call),
        connected: call.connected,
        durationSeconds: call.durationSeconds,
        completedAt: new Date(),
        transcript: {
          create: {
            organizationId,
            transcript: JSON.stringify(transcript.lines),
            summary: transcript.summary,
          },
        },
        outcome: {
          create: {
            organizationId,
            customerId: plan.customerId,
            opportunityId: opportunityId ?? undefined,
            outcomeType: call.outcomeType as VoiceCallOutcomeEnum,
            outcomeReason: outcome.outcomeReason,
            attributedAmount: outcome.attribution?.attributedAmount ?? 0,
          },
        },
      },
    });

    auditData.push(
      {
        organizationId,
        type: "VOICE_CALL_SIMULATED",
        customerId: plan.customerId,
        opportunityId: opportunityId ?? undefined,
        workflowRunId: undefined,
        policyDecision: "Voice call simulated",
        action: `Simulated call for ${plan.customerName} produced ${call.outcomeType}.`,
        outcome: "recorded",
      },
      {
        organizationId,
        type: "VOICE_TRANSCRIPT_CREATED",
        customerId: plan.customerId,
        opportunityId: opportunityId ?? undefined,
        policyDecision: "Transcript recorded",
        action: `Recorded a simulated transcript with ${transcript.lines.length} lines.`,
        outcome: "recorded",
      },
      {
        organizationId,
        type: "VOICE_OUTCOME_CREATED",
        customerId: plan.customerId,
        opportunityId: opportunityId ?? undefined,
        policyDecision: `Outcome ${outcome.outcomeType}`,
        action: outcome.outcomeReason,
        outcome: "recorded",
      },
    );

    if (outcome.attribution && opportunityId) {
      auditData.push({
        organizationId,
        type: "VOICE_REVENUE_ATTRIBUTED",
        customerId: plan.customerId,
        opportunityId,
        policyDecision: `${outcome.attribution.attributionType} attribution`,
        action: `Attributed ${outcome.attribution.attributedAmount} from the simulated call. ${outcome.attribution.reason}`,
        outcome: "recorded",
      });
    }

    void callRow;
  }

  await prisma.auditEvent.createMany({ data: auditData });
  return created.id;
}

const planInclude = {
  customer: { select: { name: true, verticalId: true } },
} satisfies Prisma.VoicePlanInclude;

type PlanRow = Prisma.VoicePlanGetPayload<{ include: typeof planInclude }>;

function mapPlan(row: PlanRow): VoicePlanRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    vertical: row.customer.verticalId as VerticalId,
    opportunityId: row.opportunityId,
    recommendationId: row.recommendationId,
    purpose: row.purpose as VoiceCallPurpose,
    priority: row.priority as VoiceCallPriority,
    scriptType: row.scriptType as VoiceScriptType,
    status: planStatusFromDb(row.status),
    complianceStatus: complianceFromDb(row.complianceStatus),
    blockedReason: row.blockedReason,
    expectedOutcome: row.expectedOutcome as VoiceCallOutcomeType,
    requiresApproval: row.requiresApproval,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findAllVoicePlans(
  organizationId: string,
): Promise<VoicePlanRecord[]> {
  const rows = await prisma.voicePlan.findMany({
    where: { organizationId },
    include: planInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPlan);
}

const callInclude = {
  customer: { select: { name: true, verticalId: true } },
  voicePlan: { select: { purpose: true } },
  outcome: { select: { outcomeType: true } },
} satisfies Prisma.VoiceCallInclude;

type CallRow = Prisma.VoiceCallGetPayload<{ include: typeof callInclude }>;

function mapCall(row: CallRow): VoiceCallRecord {
  return {
    id: row.id,
    voicePlanId: row.voicePlanId,
    customerId: row.customerId,
    customerName: row.customer.name,
    vertical: row.customer.verticalId as VerticalId,
    opportunityId: row.opportunityId,
    status: callStatusFromDb(row.status),
    connected: row.connected,
    durationSeconds: row.durationSeconds,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    purpose: row.voicePlan.purpose as VoiceCallPurpose,
    outcomeType: (row.outcome?.outcomeType as VoiceCallOutcomeType) ?? null,
  };
}

export async function findAllVoiceCalls(
  organizationId: string,
): Promise<VoiceCallRecord[]> {
  const rows = await prisma.voiceCall.findMany({
    where: { organizationId },
    include: callInclude,
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapCall);
}

function parseLines(serialized: string): TranscriptLine[] {
  try {
    const parsed = JSON.parse(serialized) as TranscriptLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function findVoiceCallDetail(
  organizationId: string,
  callId: string,
): Promise<VoiceCallDetail | null> {
  const row = await prisma.voiceCall.findFirst({
    where: { id: callId, organizationId },
    include: {
      customer: { select: { name: true, verticalId: true } },
      voicePlan: {
        include: {
          customer: { select: { name: true, verticalId: true } },
          complianceDecision: true,
        },
      },
      transcript: true,
      outcome: true,
    },
  });
  if (!row) return null;

  const plan = mapPlan(row.voicePlan);
  const call: VoiceCallRecord = {
    id: row.id,
    voicePlanId: row.voicePlanId,
    customerId: row.customerId,
    customerName: row.customer.name,
    vertical: row.customer.verticalId as VerticalId,
    opportunityId: row.opportunityId,
    status: callStatusFromDb(row.status),
    connected: row.connected,
    durationSeconds: row.durationSeconds,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    purpose: row.voicePlan.purpose as VoiceCallPurpose,
    outcomeType: (row.outcome?.outcomeType as VoiceCallOutcomeType) ?? null,
  };

  const compliance: VoiceComplianceDecisionRecord | null = row.voicePlan
    .complianceDecision
    ? {
        id: row.voicePlan.complianceDecision.id,
        voicePlanId: row.voicePlan.complianceDecision.voicePlanId,
        decision: complianceFromDb(row.voicePlan.complianceDecision.decision),
        reason: row.voicePlan.complianceDecision.reason,
        createdAt: row.voicePlan.complianceDecision.createdAt.toISOString(),
      }
    : null;

  const transcript: VoiceTranscriptRecord | null = row.transcript
    ? {
        id: row.transcript.id,
        voiceCallId: row.transcript.voiceCallId,
        transcript: row.transcript.transcript,
        lines: parseLines(row.transcript.transcript),
        summary: row.transcript.summary,
        createdAt: row.transcript.createdAt.toISOString(),
      }
    : null;

  const outcome: VoiceCallOutcomeRecord | null = row.outcome
    ? {
        id: row.outcome.id,
        voiceCallId: row.outcome.voiceCallId,
        customerId: row.outcome.customerId,
        opportunityId: row.outcome.opportunityId,
        outcomeType: row.outcome.outcomeType as VoiceCallOutcomeType,
        outcomeReason: row.outcome.outcomeReason,
        attributedAmount: row.outcome.attributedAmount,
        createdAt: row.outcome.createdAt.toISOString(),
      }
    : null;

  return { call, plan, compliance, transcript, outcome };
}

export interface VoiceAggregate {
  totalPlans: number;
  allowed: number;
  blocked: number;
  needsReview: number;
  totalCalls: number;
  appointments: number;
  positiveOutcomes: number;
  influencedRevenue: number;
}

export async function aggregateVoice(
  organizationId: string,
): Promise<VoiceAggregate> {
  const [planGroups, callCount, outcomeGroups, revenue] = await Promise.all([
    prisma.voicePlan.groupBy({
      by: ["complianceStatus"],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.voiceCall.count({ where: { organizationId } }),
    prisma.voiceCallOutcome.groupBy({
      by: ["outcomeType"],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.voiceCallOutcome.aggregate({
      where: { organizationId },
      _sum: { attributedAmount: true },
    }),
  ]);

  const byCompliance = (status: VoiceComplianceStatusEnum): number =>
    planGroups.find((g) => g.complianceStatus === status)?._count._all ?? 0;

  const positiveSet = new Set<VoiceCallOutcomeEnum>([
    "APPOINTMENT_SCHEDULED",
    "CUSTOMER_INTERESTED",
    "CALLBACK_REQUESTED",
  ]);
  let appointments = 0;
  let positiveOutcomes = 0;
  for (const group of outcomeGroups) {
    if (group.outcomeType === "APPOINTMENT_SCHEDULED") {
      appointments += group._count._all;
    }
    if (positiveSet.has(group.outcomeType)) {
      positiveOutcomes += group._count._all;
    }
  }

  const totalPlans =
    byCompliance("allowed") + byCompliance("blocked") + byCompliance("needs_review");

  return {
    totalPlans,
    allowed: byCompliance("allowed"),
    blocked: byCompliance("blocked"),
    needsReview: byCompliance("needs_review"),
    totalCalls: callCount,
    appointments,
    positiveOutcomes,
    influencedRevenue: revenue._sum.attributedAmount ?? 0,
  };
}

// Plans that need a human decision before a call may proceed.
export async function findVoicePlansNeedingReview(
  organizationId: string,
): Promise<VoicePlanRecord[]> {
  const rows = await prisma.voicePlan.findMany({
    where: { organizationId, complianceStatus: "needs_review" },
    include: planInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPlan);
}

// Record a human review decision on a needs-review voice plan. Organization
// scoped: the update only applies to a plan in this organization that is
// currently in the needs-review state. Approving sets the plan to allowed and
// ready, which makes it eligible for simulation under the existing rules.
// Rejecting blocks it. No call is placed and no simulation is triggered here.
export async function recordVoiceReviewDecision(input: {
  organizationId: string;
  voicePlanId: string;
  approve: boolean;
  reviewerId: string;
  reviewerName: string;
  notes: string;
}): Promise<{ updated: boolean }> {
  const result = await prisma.voicePlan.updateMany({
    where: {
      id: input.voicePlanId,
      organizationId: input.organizationId,
      complianceStatus: "needs_review",
    },
    data: input.approve
      ? {
          complianceStatus: "allowed",
          status: "ready",
          requiresApproval: false,
          blockedReason: null,
          reviewedBy: input.reviewerName,
          reviewedAt: new Date(),
          reviewNotes: input.notes,
        }
      : {
          complianceStatus: "blocked",
          status: "blocked",
          blockedReason: "HUMAN_REVIEW_REQUIRED",
          reviewedBy: input.reviewerName,
          reviewedAt: new Date(),
          reviewNotes: input.notes,
        },
  });

  if (result.count === 0) return { updated: false };

  await prisma.voiceComplianceDecision.updateMany({
    where: { voicePlanId: input.voicePlanId, organizationId: input.organizationId },
    data: {
      decision: input.approve ? "allowed" : "blocked",
      reason: input.approve
        ? `Approved by ${input.reviewerName}. ${input.notes}`.trim()
        : `Rejected by ${input.reviewerName}. ${input.notes}`.trim(),
    },
  });

  await prisma.auditEvent.create({
    data: {
      organizationId: input.organizationId,
      type: input.approve ? "VOICE_COMPLIANCE_ALLOWED" : "VOICE_COMPLIANCE_BLOCKED",
      policyDecision: input.approve
        ? "Voice plan approved by human review"
        : "Voice plan rejected by human review",
      action: `${input.reviewerName} ${input.approve ? "approved" : "rejected"} a voice plan. ${input.notes}`.trim(),
      outcome: input.approve ? "allowed" : "blocked",
    },
  });

  return { updated: true };
}
