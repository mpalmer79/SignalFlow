import type {
  VoiceCallOutcomeType,
  VoiceComplianceStatus,
} from "@/lib/types/voice";

// Pure aggregation helpers for voice analytics. These operate on plain shapes
// so they can be unit reasoned without Prisma.

export interface VoicePlanLike {
  complianceStatus: VoiceComplianceStatus;
  requiresApproval: boolean;
}

export interface VoiceOutcomeLike {
  outcomeType: VoiceCallOutcomeType;
  attributedAmount: number;
}

export interface VoiceComplianceBreakdown {
  allowed: number;
  blocked: number;
  needsReview: number;
}

export function summarizeCompliance(
  plans: VoicePlanLike[],
): VoiceComplianceBreakdown {
  return plans.reduce<VoiceComplianceBreakdown>(
    (acc, plan) => {
      if (plan.complianceStatus === "allowed") acc.allowed += 1;
      else if (plan.complianceStatus === "blocked") acc.blocked += 1;
      else acc.needsReview += 1;
      return acc;
    },
    { allowed: 0, blocked: 0, needsReview: 0 },
  );
}

const POSITIVE_OUTCOMES: VoiceCallOutcomeType[] = [
  "APPOINTMENT_SCHEDULED",
  "CUSTOMER_INTERESTED",
  "CALLBACK_REQUESTED",
];

export interface VoiceOutcomeSummary {
  appointments: number;
  positive: number;
  total: number;
  influencedRevenue: number;
}

export function summarizeOutcomes(
  outcomes: VoiceOutcomeLike[],
): VoiceOutcomeSummary {
  return outcomes.reduce<VoiceOutcomeSummary>(
    (acc, outcome) => {
      acc.total += 1;
      acc.influencedRevenue += outcome.attributedAmount;
      if (outcome.outcomeType === "APPOINTMENT_SCHEDULED") acc.appointments += 1;
      if (POSITIVE_OUTCOMES.includes(outcome.outcomeType)) acc.positive += 1;
      return acc;
    },
    { appointments: 0, positive: 0, total: 0, influencedRevenue: 0 },
  );
}
