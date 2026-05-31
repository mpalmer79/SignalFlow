import type { FutureIntegration, ProviderResponse } from "./types";

// Phase 0 mock only. No call is placed.
// Planned integrations: ElevenLabs for voice synthesis and Twilio for telephony.

export const voiceProviderIntegrations: FutureIntegration[] = [
  { vendor: "ElevenLabs", status: "planned" },
  { vendor: "Twilio", status: "planned" },
];

export function queueVoiceCall(to: string, script: string): ProviderResponse {
  return {
    provider: "voice.mock",
    mode: "mock",
    simulated: true,
    summary: `Queued a simulated voice call to ${to} using a ${script.length} character script. No call was placed.`,
  };
}
