import type {
  SimulatedCall,
  TranscriptLine,
  VoiceCallOutcomeType,
  VoicePlan,
  VoicePlanInput,
  VoiceScript,
  VoiceTranscript,
} from "@/lib/types/voice";
import { VOICE_OUTCOME_LABELS } from "@/lib/types/voice";
import type { VerticalId } from "@/lib/types/vertical-pack";

// A bank of deterministic customer responses, keyed by outcome and a vertical
// flavor so transcripts vary across verticals without any randomness. These
// are simulated lines: no actual conversation occurs.
const CUSTOMER_OPENERS: Record<
  VoiceCallOutcomeType,
  Partial<Record<VerticalId, string>> & { default: string }
> = {
  APPOINTMENT_SCHEDULED: {
    default: "Yes, I have been meaning to schedule something.",
    automotive: "Yes, I have been meaning to come in for a test drive.",
    dental: "Yes, I have been meaning to book my cleaning.",
    "home-services": "Yes, I have been waiting to schedule the visit.",
    "legal-intake": "Yes, I would like to book the consultation.",
    insurance: "Yes, I have been meaning to review my coverage.",
  },
  CALLBACK_REQUESTED: {
    default: "I am in the middle of something. Can you call me back later?",
    automotive: "I am at work right now. Can a specialist call me this evening?",
    dental: "I cannot talk now. Can the front desk call me this afternoon?",
    "home-services": "I am driving. Can someone call me back tonight?",
    "legal-intake": "Now is not a good time. Can intake call me back tomorrow?",
    insurance: "I am with a client. Can an agent call me back later today?",
  },
  CUSTOMER_INTERESTED: {
    default: "Yes, I was just looking into my options.",
    automotive: "Yes, I have been comparing payment and trade options.",
    dental: "Yes, I want to know what the next appointment would cover.",
    "home-services": "Yes, I have been comparing two estimates.",
    "legal-intake": "Yes, I am still trying to understand my next steps.",
    insurance: "Yes, I have been looking at coverage for the year.",
  },
  CUSTOMER_NOT_INTERESTED: {
    default: "Thank you, but I am not interested right now.",
    automotive: "Thanks, I bought elsewhere a while ago.",
    dental: "Thanks, I am seeing another provider now.",
    "home-services": "Thanks, the project is no longer happening.",
    "legal-intake": "Thanks, I resolved the matter on my own.",
    insurance: "Thanks, I renewed somewhere else.",
  },
  NEEDS_HUMAN_FOLLOW_UP: {
    default: "I have a specific question I would like to ask a person.",
    automotive: "I have a question about my trade value I want to ask a specialist.",
    dental: "I have a question about my chart I would like to ask the front desk.",
    "home-services": "I have a question about the estimate scope.",
    "legal-intake": "I have a specific question and would like to speak with intake.",
    insurance: "I have a question about my deductible I want to ask an agent.",
  },
  NO_ANSWER: { default: "" },
  VOICEMAIL_LEFT: { default: "" },
  WRONG_NUMBER: {
    default: "I think you have the wrong number.",
  },
  COMPLIANCE_STOP: { default: "" },
};

const CUSTOMER_CLOSERS: Record<
  VoiceCallOutcomeType,
  Partial<Record<VerticalId, string>> & { default: string }
> = {
  APPOINTMENT_SCHEDULED: {
    default: "That works for me. Please send a confirmation.",
    automotive: "Sounds good. I will plan to come in Saturday.",
    dental: "Great. I will see you next week.",
    "home-services": "Perfect. I will be home in the morning.",
    "legal-intake": "Thank you. I will be at the consultation on time.",
    insurance: "Thank you. I will look out for the renewal paperwork.",
  },
  CALLBACK_REQUESTED: {
    default: "Sounds good. Talk soon.",
  },
  CUSTOMER_INTERESTED: {
    default: "That would be helpful. Thank you.",
  },
  CUSTOMER_NOT_INTERESTED: {
    default: "I appreciate the call.",
  },
  NEEDS_HUMAN_FOLLOW_UP: {
    default: "Yes, please have someone reach out.",
  },
  NO_ANSWER: { default: "" },
  VOICEMAIL_LEFT: { default: "" },
  WRONG_NUMBER: {
    default: "No problem.",
  },
  COMPLIANCE_STOP: { default: "" },
};

function pickLine(
  bank: Record<VoiceCallOutcomeType, Partial<Record<VerticalId, string>> & { default: string }>,
  outcome: VoiceCallOutcomeType,
  vertical: VerticalId,
): string {
  const slot = bank[outcome];
  return slot[vertical] ?? slot.default;
}

// Strip a leading greeting so the script body can follow a personalized
// "Hi {name}," opener without producing "Hi Sarah, hi, this is..." on every
// connected call.
function dropLeadingHi(text: string): string {
  return text.replace(/^Hi[,!]?\s*/i, "");
}

// Generate a deterministic, clearly simulated transcript. Non-connected
// outcomes produce a shorter transcript that reflects the customer was not
// reached. A compliance stop produces a single agent line explaining the call
// was held back.
export function generateTranscript(
  plan: VoicePlan,
  script: VoiceScript,
  call: SimulatedCall,
  input: VoicePlanInput,
): VoiceTranscript {
  const lines: TranscriptLine[] = [];
  const name = input.customerName.split(" ")[0] ?? input.customerName;
  const vertical = input.vertical;

  if (call.outcomeType === "COMPLIANCE_STOP") {
    lines.push({
      speaker: "agent",
      text: "This is a simulated voice plan. No call was placed because a compliance check blocked it.",
    });
    lines.push({
      speaker: "outcome",
      text: `Outcome: ${VOICE_OUTCOME_LABELS[call.outcomeType]}. ${plan.compliance.summary}`,
    });
    return {
      lines,
      summary: `Simulated voice plan held back. ${plan.compliance.summary}`,
      simulated: true,
    };
  }

  if (call.outcomeType === "NO_ANSWER" || call.outcomeType === "WRONG_NUMBER") {
    lines.push({
      speaker: "agent",
      text: `Hi ${name}, ${dropLeadingHi(script.opening)} ${script.reasonForCall}`,
    });
    if (call.outcomeType === "WRONG_NUMBER") {
      lines.push({
        speaker: "customer",
        text: pickLine(CUSTOMER_OPENERS, "WRONG_NUMBER", vertical),
      });
    }
    lines.push({
      speaker: "outcome",
      text: `Outcome: ${VOICE_OUTCOME_LABELS[call.outcomeType]}. ${call.outcomeReason}`,
    });
    return {
      lines,
      summary: `Simulated call. ${call.outcomeReason}`,
      simulated: true,
    };
  }

  if (call.outcomeType === "VOICEMAIL_LEFT") {
    lines.push({
      speaker: "agent",
      text: `Hi ${name}, this is a simulated message from the demo team. ${script.reasonForCall} ${script.close}`,
    });
    lines.push({
      speaker: "outcome",
      text: `Outcome: ${VOICE_OUTCOME_LABELS[call.outcomeType]}. ${call.outcomeReason}`,
    });
    return {
      lines,
      summary: `Simulated voicemail. ${call.outcomeReason}`,
      simulated: true,
    };
  }

  // Connected conversation.
  lines.push({
    speaker: "agent",
    text: `Hi ${name}, ${dropLeadingHi(script.opening)} ${script.reasonForCall}`,
  });
  lines.push({
    speaker: "customer",
    text: pickLine(CUSTOMER_OPENERS, call.outcomeType, vertical),
  });
  lines.push({
    speaker: "agent",
    text:
      call.outcomeType === "NEEDS_HUMAN_FOLLOW_UP"
        ? script.humanHandoff
        : script.primaryQuestion,
  });
  lines.push({
    speaker: "customer",
    text: pickLine(CUSTOMER_CLOSERS, call.outcomeType, vertical),
  });
  lines.push({
    speaker: "outcome",
    text: `Outcome: ${VOICE_OUTCOME_LABELS[call.outcomeType]}. ${call.outcomeReason}`,
  });

  return {
    lines,
    summary: `Simulated call with ${input.customerName}. ${VOICE_OUTCOME_LABELS[call.outcomeType]}.`,
    simulated: true,
  };
}

export function summarizeTranscript(transcript: VoiceTranscript): string {
  return transcript.summary;
}
