import type { VoiceProvider } from "./voice-provider-interface";
import { buildVoicePlan } from "./voice-plan-engine";
import { getVoiceScript } from "./voice-script-engine";
import {
  classifyCallOutcome,
  simulateVoiceCall,
} from "./voice-call-simulator";
import {
  generateTranscript,
  summarizeTranscript,
} from "./voice-transcript-generator";

// The deterministic mock voice provider. It is the only implementation in
// Phase 9. It stands in for ElevenLabs, OpenAI Realtime, Twilio, Retell, and
// Vapi until those are integrated in a later phase. It makes no network calls
// and places no real calls.
export const mockVoiceProvider: VoiceProvider = {
  name: "deterministic.voice.mock",
  createCallPlan(input) {
    return buildVoicePlan(input);
  },
  generateScript(scriptType) {
    return getVoiceScript(scriptType);
  },
  simulateCall(plan, input) {
    return simulateVoiceCall(plan, input);
  },
  generateTranscript(plan, script, call, input) {
    return generateTranscript(plan, script, call, input);
  },
  classifyCallOutcome(call) {
    return classifyCallOutcome(call);
  },
  summarizeCall(transcript) {
    return summarizeTranscript(transcript);
  },
};
