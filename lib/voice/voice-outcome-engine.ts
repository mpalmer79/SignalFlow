import type { OpportunityStage } from "@/lib/types/opportunity";
import type {
  AttributionType,
  OutcomeType,
} from "@/lib/types/outcome";
import type {
  SimulatedCall,
  VoiceCallOutcomeType,
  VoicePlanInput,
} from "@/lib/types/voice";

// The deterministic translation of a simulated voice call into the existing
// outcome, stage, and attribution vocabulary. This keeps voice outcomes
// consistent with the Phase 4 revenue architecture. Pure logic, no Prisma.

export interface VoiceOutcomeResult {
  outcomeType: OutcomeType;
  outcomeReason: string;
  confidence: number;
  stageTransition: {
    fromStage: OpportunityStage;
    toStage: OpportunityStage;
    reason: string;
  } | null;
  attribution: {
    attributedAmount: number;
    attributionType: AttributionType;
    reason: string;
    confidence: number;
  } | null;
}

// Map a voice call outcome to the shared outcome vocabulary.
const OUTCOME_MAP: Record<VoiceCallOutcomeType, OutcomeType> = {
  APPOINTMENT_SCHEDULED: "APPOINTMENT_SCHEDULED",
  CALLBACK_REQUESTED: "CUSTOMER_REPLIED",
  CUSTOMER_INTERESTED: "OPPORTUNITY_ADVANCED",
  CUSTOMER_NOT_INTERESTED: "NO_RESPONSE",
  NEEDS_HUMAN_FOLLOW_UP: "HUMAN_TASK_CREATED",
  NO_ANSWER: "NO_RESPONSE",
  VOICEMAIL_LEFT: "NO_RESPONSE",
  WRONG_NUMBER: "NO_RESPONSE",
  COMPLIANCE_STOP: "COMPLIANCE_STOP",
};

// Confidence in the mapped outcome, by call outcome.
const OUTCOME_CONFIDENCE: Record<VoiceCallOutcomeType, number> = {
  APPOINTMENT_SCHEDULED: 92,
  CALLBACK_REQUESTED: 70,
  CUSTOMER_INTERESTED: 78,
  CUSTOMER_NOT_INTERESTED: 64,
  NEEDS_HUMAN_FOLLOW_UP: 72,
  NO_ANSWER: 55,
  VOICEMAIL_LEFT: 50,
  WRONG_NUMBER: 60,
  COMPLIANCE_STOP: 88,
};

// Convert a simulated call into outcome, stage transition, and attribution.
// The opportunity stage transition is only proposed when a current stage is
// supplied by the caller (the service that owns persistence).
export function assessVoiceOutcome(args: {
  call: SimulatedCall;
  input: VoicePlanInput;
  currentStage: OpportunityStage | null;
}): VoiceOutcomeResult {
  const { call, input, currentStage } = args;
  const outcomeType = OUTCOME_MAP[call.outcomeType];
  const confidence = OUTCOME_CONFIDENCE[call.outcomeType];

  let stageTransition: VoiceOutcomeResult["stageTransition"] = null;
  let attribution: VoiceOutcomeResult["attribution"] = null;

  if (currentStage) {
    if (call.outcomeType === "APPOINTMENT_SCHEDULED") {
      stageTransition = {
        fromStage: currentStage,
        toStage: "appointment-set",
        reason: "Simulated voice call scheduled an appointment.",
      };
    } else if (call.outcomeType === "CUSTOMER_INTERESTED") {
      stageTransition = {
        fromStage: currentStage,
        toStage: "engaged",
        reason: "Simulated voice call advanced the opportunity to engaged.",
      };
    } else if (currentStage === "dormant" && call.connected) {
      stageTransition = {
        fromStage: currentStage,
        toStage: "reactivated",
        reason: "Simulated voice call reactivated a dormant opportunity.",
      };
    }
  }

  // Attribution mirrors the Phase 4 model. Voice influence is a fraction of the
  // estimated value, scaled by the strength of the outcome.
  const value = input.estimatedValue;
  if (value > 0) {
    if (call.outcomeType === "APPOINTMENT_SCHEDULED") {
      attribution = {
        attributedAmount: Math.round(value * 0.35),
        attributionType: "INFLUENCED",
        reason: "Simulated voice call scheduled an appointment.",
        confidence,
      };
    } else if (call.outcomeType === "CUSTOMER_INTERESTED") {
      attribution = {
        attributedAmount: Math.round(value * 0.2),
        attributionType: "ASSISTED",
        reason: "Simulated voice call advanced the opportunity.",
        confidence,
      };
    } else if (
      call.outcomeType === "CALLBACK_REQUESTED" ||
      call.outcomeType === "NEEDS_HUMAN_FOLLOW_UP"
    ) {
      attribution = {
        attributedAmount: Math.round(value * 0.1),
        attributionType: "ASSISTED",
        reason: "Simulated voice call kept the opportunity active.",
        confidence,
      };
    }
  }

  return {
    outcomeType,
    outcomeReason: call.outcomeReason,
    confidence,
    stageTransition,
    attribution,
  };
}
