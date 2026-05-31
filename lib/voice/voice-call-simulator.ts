import type {
  SimulatedCall,
  VoiceCallOutcomeType,
  VoicePlan,
  VoicePlanInput,
} from "@/lib/types/voice";
import { expectedOutcomeFor } from "./voice-plan-engine";

const NON_CONNECTED: VoiceCallOutcomeType[] = [
  "NO_ANSWER",
  "VOICEMAIL_LEFT",
  "WRONG_NUMBER",
  "COMPLIANCE_STOP",
];

// A short deterministic reason line for each outcome.
const OUTCOME_REASONS: Record<VoiceCallOutcomeType, string> = {
  APPOINTMENT_SCHEDULED:
    "Customer agreed to a time and an appointment was scheduled.",
  CALLBACK_REQUESTED: "Customer asked to be called back at a better time.",
  CUSTOMER_INTERESTED:
    "Customer expressed interest and asked for more information.",
  CUSTOMER_NOT_INTERESTED:
    "Customer indicated they are not interested at this time.",
  NEEDS_HUMAN_FOLLOW_UP:
    "Customer asked a question that a human specialist should handle.",
  NO_ANSWER: "The call was not answered.",
  VOICEMAIL_LEFT: "The call reached voicemail and a message was left.",
  WRONG_NUMBER: "The number on file did not reach the customer.",
  COMPLIANCE_STOP:
    "The call did not proceed because a compliance check blocked it.",
};

// A deterministic call duration derived from the outcome and engagement, so the
// same call always reports the same length.
function durationFor(
  outcome: VoiceCallOutcomeType,
  input: VoicePlanInput,
): number {
  if (NON_CONNECTED.includes(outcome)) {
    return outcome === "VOICEMAIL_LEFT" ? 25 : 0;
  }
  const base = 45;
  const engagementBonus = Math.round(input.engagementScore / 2);
  return base + engagementBonus;
}

// Simulate the call deterministically. A blocked plan always produces a
// compliance stop. Otherwise the outcome matches the plan's expected outcome,
// which itself is a pure function of the input.
export function simulateVoiceCall(
  plan: VoicePlan,
  input: VoicePlanInput,
): SimulatedCall {
  const outcomeType: VoiceCallOutcomeType =
    plan.compliance.status === "blocked"
      ? "COMPLIANCE_STOP"
      : expectedOutcomeFor(input);

  const connected = !NON_CONNECTED.includes(outcomeType);

  return {
    outcomeType,
    outcomeReason: OUTCOME_REASONS[outcomeType],
    connected,
    durationSeconds: durationFor(outcomeType, input),
  };
}

export function classifyCallOutcome(call: SimulatedCall): VoiceCallOutcomeType {
  return call.outcomeType;
}
