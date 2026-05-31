import type { FutureIntegration, ProviderResponse } from "./types";

// Phase 0 mock only. No SMS is sent.
// Planned integration: Twilio.

export const smsProviderIntegrations: FutureIntegration[] = [
  { vendor: "Twilio", status: "planned" },
];

export function sendSms(to: string, body: string): ProviderResponse {
  return {
    provider: "sms.mock",
    mode: "mock",
    simulated: true,
    summary: `Simulated SMS to ${to} with ${body.length} characters. No message was sent.`,
  };
}
