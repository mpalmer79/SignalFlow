import type { FutureIntegration, ProviderResponse } from "./types";

// Phase 0 mock only. No network calls are made.
// Planned integrations may include OpenAI, Anthropic Claude, and Google Gemini.

export const aiProviderIntegrations: FutureIntegration[] = [
  { vendor: "OpenAI", status: "planned" },
  { vendor: "Anthropic Claude", status: "planned" },
  { vendor: "Google Gemini", status: "planned" },
];

export interface DraftMessageInput {
  customerName: string;
  channel: string;
  intent: string;
}

export function draftMessage(input: DraftMessageInput): ProviderResponse {
  return {
    provider: "ai.mock",
    mode: "mock",
    simulated: true,
    summary: `Drafted a ${input.channel} message for ${input.customerName} addressing ${input.intent}.`,
  };
}

export function classifyIntent(text: string): ProviderResponse {
  return {
    provider: "ai.mock",
    mode: "mock",
    simulated: true,
    summary: `Classified intent from input of ${text.length} characters as purchase intent.`,
  };
}
