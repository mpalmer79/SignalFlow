import type {
  SimulatedCall,
  VoiceCallOutcomeType,
  VoicePlan,
  VoicePlanInput,
  VoiceScript,
  VoiceScriptType,
  VoiceTranscript,
} from "@/lib/types/voice";

// The voice provider abstraction. In Phase 9 the only implementation is the
// deterministic mock. These methods describe the surface a future provider
// (ElevenLabs, OpenAI Realtime, Twilio, Retell, Vapi) would implement, without
// any of them being installed, called, or sent a network request.
export interface VoiceProvider {
  name: string;
  createCallPlan(input: VoicePlanInput): VoicePlan;
  generateScript(scriptType: VoiceScriptType, input: VoicePlanInput): VoiceScript;
  simulateCall(plan: VoicePlan, input: VoicePlanInput): SimulatedCall;
  generateTranscript(
    plan: VoicePlan,
    script: VoiceScript,
    call: SimulatedCall,
    input: VoicePlanInput,
  ): VoiceTranscript;
  classifyCallOutcome(call: SimulatedCall): VoiceCallOutcomeType;
  summarizeCall(transcript: VoiceTranscript): string;
}

// Providers that could be integrated in a later phase. Listed for readiness
// only. None are installed and none are called.
export const FUTURE_VOICE_PROVIDERS = [
  "ElevenLabs",
  "OpenAI Realtime",
  "Twilio",
  "Retell",
  "Vapi",
] as const;
