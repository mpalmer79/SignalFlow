import type { FutureIntegration, ProviderResponse } from "./types";

// Phase 0 mock only. No email is sent.
// Planned integration: SendGrid.

export const emailProviderIntegrations: FutureIntegration[] = [
  { vendor: "SendGrid", status: "planned" },
];

export function sendEmail(to: string, subject: string): ProviderResponse {
  return {
    provider: "email.mock",
    mode: "mock",
    simulated: true,
    summary: `Simulated email to ${to} with subject "${subject}". No message was sent.`,
  };
}
