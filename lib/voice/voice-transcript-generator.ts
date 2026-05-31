import type {
  SimulatedCall,
  TranscriptLine,
  VoicePlan,
  VoicePlanInput,
  VoiceScript,
  VoiceTranscript,
} from "@/lib/types/voice";
import { VOICE_OUTCOME_LABELS } from "@/lib/types/voice";

// A deterministic customer response keyed by outcome. These are simulated and
// contain no advice of any kind.
const CUSTOMER_OPENERS: Record<string, string> = {
  APPOINTMENT_SCHEDULED: "Yes, I have been meaning to set something up.",
  CALLBACK_REQUESTED: "I am a little busy right now, can you call me later?",
  CUSTOMER_INTERESTED: "Yes, I was just looking into my options.",
  CUSTOMER_NOT_INTERESTED: "Thanks, but I am not interested right now.",
  NEEDS_HUMAN_FOLLOW_UP: "I have a specific question about my situation.",
  NO_ANSWER: "",
  VOICEMAIL_LEFT: "",
  WRONG_NUMBER: "I think you have the wrong number.",
  COMPLIANCE_STOP: "",
};

const CUSTOMER_CLOSERS: Record<string, string> = {
  APPOINTMENT_SCHEDULED: "That works for me, thank you.",
  CALLBACK_REQUESTED: "Sounds good, talk soon.",
  CUSTOMER_INTERESTED: "That would be helpful, thank you.",
  CUSTOMER_NOT_INTERESTED: "I appreciate the call.",
  NEEDS_HUMAN_FOLLOW_UP: "Yes, please have someone reach out.",
  NO_ANSWER: "",
  VOICEMAIL_LEFT: "",
  WRONG_NUMBER: "No problem.",
  COMPLIANCE_STOP: "",
};

// Generate a deterministic, clearly simulated transcript. For non-connected
// outcomes the transcript is short and reflects that the customer was not
// reached.
export function generateTranscript(
  plan: VoicePlan,
  script: VoiceScript,
  call: SimulatedCall,
  input: VoicePlanInput,
): VoiceTranscript {
  const lines: TranscriptLine[] = [];
  const name = input.customerName.split(" ")[0] ?? input.customerName;

  if (call.outcomeType === "COMPLIANCE_STOP") {
    lines.push({
      speaker: "agent",
      text: "This call was not placed because a compliance check blocked it.",
    });
    lines.push({
      speaker: "outcome",
      text: `Outcome: ${VOICE_OUTCOME_LABELS[call.outcomeType]}. ${plan.compliance.summary}`,
    });
    return {
      lines,
      summary: `Simulated call held back. ${plan.compliance.summary}`,
      simulated: true,
    };
  }

  if (call.outcomeType === "NO_ANSWER" || call.outcomeType === "WRONG_NUMBER") {
    lines.push({
      speaker: "agent",
      text: `${script.opening} ${script.reasonForCall}`,
    });
    if (call.outcomeType === "WRONG_NUMBER") {
      lines.push({
        speaker: "customer",
        text: CUSTOMER_OPENERS.WRONG_NUMBER,
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
      text: `Hi ${name}, this is a message from the demo team. ${script.reasonForCall} ${script.close}`,
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
    text: `Hi ${name}, ${lowerFirst(script.opening)} ${script.reasonForCall}`,
  });
  lines.push({
    speaker: "customer",
    text: CUSTOMER_OPENERS[call.outcomeType] ?? "Okay, go ahead.",
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
    text: CUSTOMER_CLOSERS[call.outcomeType] ?? "Thank you.",
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

function lowerFirst(text: string): string {
  return text.length > 0 ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

export function summarizeTranscript(transcript: VoiceTranscript): string {
  return transcript.summary;
}
