import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { AIRecommendation } from "@/lib/types/ai";
import type { VerticalId } from "@/lib/types/vertical-pack";
import type {
  VoiceCallOutcomeType,
  VoiceCallPriority,
  VoiceCallPurpose,
  VoicePlan,
  VoicePlanInput,
  VoiceScriptType,
} from "@/lib/types/voice";
import { evaluateVoiceCompliance } from "./voice-compliance-engine";

// Build the deterministic voice plan input from an intelligence profile, the
// AI recommendation, and a small amount of derived context. The voice layer
// consumes this shape only, so it never touches Prisma, React, Clerk, or a
// provider.
export function buildVoicePlanInput(args: {
  profile: CustomerIntelligenceProfile;
  recommendation: AIRecommendation;
  reviewApproved: boolean;
  voiceConsent: boolean;
  quietHours: boolean;
  noResponseCount: number;
}): VoicePlanInput {
  const { profile, recommendation, reviewApproved, voiceConsent, quietHours, noResponseCount } =
    args;
  const topOpportunityValue = profile.openOpportunities.reduce(
    (max, opp) => Math.max(max, opp.estimatedValue),
    0,
  );

  return {
    customerId: profile.customer.id,
    customerName: profile.customer.name,
    vertical: profile.vertical,
    intentScore: profile.intentScore,
    opportunityScore: profile.opportunityScore,
    engagementScore: profile.engagementScore,
    intentLevel: profile.intentLevel,
    consentSummary: profile.consentSummary,
    voiceConsent,
    optedOut: profile.customer.optedOut,
    quietHours,
    signalCount: profile.normalizedSignals.length,
    noResponseCount,
    riskFlags: profile.riskFlags.map((flag) => ({
      label: flag.label,
      severity: flag.severity,
    })),
    topSignalLabel: profile.normalizedSignals[0]?.rawLabel ?? null,
    estimatedValue: topOpportunityValue,
    recommendationType: recommendation.recommendationType,
    reviewApproved,
  };
}

// Map an intelligence and recommendation context to a deterministic call
// purpose. The order of checks is fixed so the same input always yields the
// same purpose.
export function decideCallPurpose(input: VoicePlanInput): VoiceCallPurpose {
  if (input.recommendationType === "REACTIVATION_OUTREACH") {
    return "DORMANT_LEAD_REACTIVATION";
  }
  if (input.recommendationType === "APPOINTMENT_OUTREACH") {
    if (input.vertical === "dental" || input.vertical === "medical") {
      return "SERVICE_REMINDER";
    }
    if (input.engagementScore < 40) {
      return "APPOINTMENT_RECOVERY";
    }
    return "APPOINTMENT_CONFIRMATION";
  }

  switch (input.vertical) {
    case "home-services":
      return "ESTIMATE_FOLLOW_UP";
    case "legal-intake":
      return "CONSULTATION_SCHEDULING";
    case "insurance":
      return "RENEWAL_FOLLOW_UP";
    case "dental":
    case "medical":
      return "SERVICE_REMINDER";
    default:
      return "LEAD_FOLLOW_UP";
  }
}

function decideScriptType(vertical: VerticalId, purpose: VoiceCallPurpose): VoiceScriptType {
  switch (vertical) {
    case "automotive":
      return purpose === "DORMANT_LEAD_REACTIVATION"
        ? "AUTOMOTIVE_FOLLOW_UP"
        : "AUTOMOTIVE_TRADE";
    case "dental":
    case "medical":
      return "DENTAL_RECALL";
    case "home-services":
      return "HOME_SERVICES_ESTIMATE";
    case "legal-intake":
      return "LEGAL_CONSULTATION";
    case "insurance":
      return "INSURANCE_RENEWAL";
    default:
      return "GENERIC_FOLLOW_UP";
  }
}

function decidePriority(input: VoicePlanInput): VoiceCallPriority {
  if (input.intentScore >= 80 || input.estimatedValue >= 25000) return "immediate";
  if (input.intentScore >= 60) return "high";
  if (input.intentScore >= 35) return "standard";
  return "low";
}

// The deterministic expected outcome the plan anticipates, before the call is
// simulated. The simulator reproduces the same value from the same input.
export function expectedOutcomeFor(input: VoicePlanInput): VoiceCallOutcomeType {
  if (input.optedOut) return "COMPLIANCE_STOP";
  if (!input.voiceConsent) return "COMPLIANCE_STOP";
  if (input.noResponseCount >= 3) return "NO_ANSWER";

  const engagement = input.engagementScore;
  const intent = input.intentScore;

  if (intent >= 75 && engagement >= 55) return "APPOINTMENT_SCHEDULED";
  if (intent >= 60 && engagement >= 40) return "CUSTOMER_INTERESTED";
  if (intent >= 45 && engagement >= 30) return "CALLBACK_REQUESTED";
  if (engagement < 20) return "VOICEMAIL_LEFT";
  if (intent < 30) return "CUSTOMER_NOT_INTERESTED";
  return "NEEDS_HUMAN_FOLLOW_UP";
}

// The Voice Plan Engine. Composes purpose, priority, script type, compliance,
// and an expected outcome into a full deterministic plan.
export function buildVoicePlan(input: VoicePlanInput): VoicePlan {
  const callPurpose = decideCallPurpose(input);
  const compliance = evaluateVoiceCompliance(input);
  const recommendedScriptType = decideScriptType(input.vertical, callPurpose);
  const callPriority = decidePriority(input);

  // The expected outcome reflects compliance: a blocked call expects a
  // compliance stop regardless of intent.
  const expectedOutcome =
    compliance.status === "blocked"
      ? "COMPLIANCE_STOP"
      : expectedOutcomeFor(input);

  return {
    customerId: input.customerId,
    customerName: input.customerName,
    vertical: input.vertical,
    callPurpose,
    callPriority,
    recommendedScriptType,
    requiresApproval: compliance.status === "needs-review",
    compliance,
    expectedOutcome,
  };
}
