import type { ProviderCapability } from "./provider-capabilities";

// Phase 10 provider registry. These are definitions only. No SDK is installed,
// no API is called, and no real credential is stored. Required secrets are
// listed as placeholder names so a future integration knows what it would need,
// never as values.

export type ProviderCategory =
  | "AI_TEXT"
  | "AI_VOICE"
  | "TELEPHONY"
  | "SMS"
  | "EMAIL"
  | "INTERNAL_MOCK";

export type ProviderStatus = "mocked" | "future-ready" | "disabled" | "blocked";

export type ProviderRiskLevel = "none" | "low" | "medium" | "high";

export interface ProviderDefinition {
  providerKey: string;
  displayName: string;
  category: ProviderCategory;
  status: ProviderStatus;
  capabilities: ProviderCapability[];
  // Placeholder secret names only. These document what a future integration
  // would require. No values are ever stored.
  requiredSecrets: string[];
  riskLevel: ProviderRiskLevel;
  liveUseAllowed: boolean;
  sandboxAvailable: boolean;
  notes: string;
}

export const PROVIDER_CATEGORY_LABELS: Record<ProviderCategory, string> = {
  AI_TEXT: "AI text",
  AI_VOICE: "AI voice",
  TELEPHONY: "Telephony",
  SMS: "SMS",
  EMAIL: "Email",
  INTERNAL_MOCK: "Internal mock",
};

export const PROVIDER_STATUS_LABELS: Record<ProviderStatus, string> = {
  mocked: "Mocked",
  "future-ready": "Future ready",
  disabled: "Disabled",
  blocked: "Blocked",
};

// Every external provider is future-ready at most, never live. Internal mock
// providers are the only ones marked mocked and the only ones with live
// sandbox simulation in demo mode.
export const PROVIDER_REGISTRY: ProviderDefinition[] = [
  {
    providerKey: "openai",
    displayName: "OpenAI",
    category: "AI_TEXT",
    status: "future-ready",
    capabilities: [
      "TEXT_RECOMMENDATION",
      "INTENT_CLASSIFICATION",
      "EXPLANATION_GENERATION",
    ],
    requiredSecrets: ["OPENAI_API_KEY_PLACEHOLDER"],
    riskLevel: "medium",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future text provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "anthropic",
    displayName: "Anthropic Claude",
    category: "AI_TEXT",
    status: "future-ready",
    capabilities: [
      "TEXT_RECOMMENDATION",
      "INTENT_CLASSIFICATION",
      "EXPLANATION_GENERATION",
      "TRANSCRIPT_SUMMARY",
    ],
    requiredSecrets: ["ANTHROPIC_API_KEY_PLACEHOLDER"],
    riskLevel: "medium",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future text provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "gemini",
    displayName: "Google Gemini",
    category: "AI_TEXT",
    status: "future-ready",
    capabilities: ["TEXT_RECOMMENDATION", "INTENT_CLASSIFICATION"],
    requiredSecrets: ["GEMINI_API_KEY_PLACEHOLDER"],
    riskLevel: "medium",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future text provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "azure-openai",
    displayName: "Azure OpenAI",
    category: "AI_TEXT",
    status: "future-ready",
    capabilities: [
      "TEXT_RECOMMENDATION",
      "INTENT_CLASSIFICATION",
      "EXPLANATION_GENERATION",
    ],
    requiredSecrets: [
      "AZURE_OPENAI_ENDPOINT_PLACEHOLDER",
      "AZURE_OPENAI_API_KEY_PLACEHOLDER",
    ],
    riskLevel: "medium",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future text provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "elevenlabs",
    displayName: "ElevenLabs",
    category: "AI_VOICE",
    status: "future-ready",
    capabilities: ["VOICE_SYNTHESIS"],
    requiredSecrets: ["ELEVENLABS_API_KEY_PLACEHOLDER"],
    riskLevel: "high",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future voice synthesis provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "openai-realtime",
    displayName: "OpenAI Realtime",
    category: "AI_VOICE",
    status: "future-ready",
    capabilities: ["REALTIME_VOICE", "VOICE_SYNTHESIS"],
    requiredSecrets: ["OPENAI_API_KEY_PLACEHOLDER"],
    riskLevel: "high",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future realtime voice provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "twilio",
    displayName: "Twilio",
    category: "TELEPHONY",
    status: "future-ready",
    capabilities: ["CALL_TRANSPORT", "SMS_DELIVERY"],
    requiredSecrets: [
      "TWILIO_ACCOUNT_SID_PLACEHOLDER",
      "TWILIO_AUTH_TOKEN_PLACEHOLDER",
    ],
    riskLevel: "high",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future telephony and SMS provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "retell",
    displayName: "Retell",
    category: "AI_VOICE",
    status: "future-ready",
    capabilities: ["REALTIME_VOICE", "CALL_TRANSPORT"],
    requiredSecrets: ["RETELL_API_KEY_PLACEHOLDER"],
    riskLevel: "high",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future realtime voice agent provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "vapi",
    displayName: "Vapi",
    category: "AI_VOICE",
    status: "future-ready",
    capabilities: ["REALTIME_VOICE", "CALL_TRANSPORT"],
    requiredSecrets: ["VAPI_API_KEY_PLACEHOLDER"],
    riskLevel: "high",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future realtime voice agent provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "sendgrid",
    displayName: "SendGrid",
    category: "EMAIL",
    status: "future-ready",
    capabilities: ["EMAIL_DELIVERY"],
    requiredSecrets: ["SENDGRID_API_KEY_PLACEHOLDER"],
    riskLevel: "medium",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Future email provider. Not integrated. No SDK installed.",
  },
  {
    providerKey: "internal-mock-ai",
    displayName: "Internal Mock AI",
    category: "INTERNAL_MOCK",
    status: "mocked",
    capabilities: [
      "TEXT_RECOMMENDATION",
      "INTENT_CLASSIFICATION",
      "EXPLANATION_GENERATION",
      "TRANSCRIPT_SUMMARY",
      "CALL_OUTCOME_CLASSIFICATION",
    ],
    requiredSecrets: [],
    riskLevel: "none",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes:
      "Deterministic mock used for all AI output in demo mode. No network calls.",
  },
  {
    providerKey: "internal-mock-voice",
    displayName: "Internal Mock Voice",
    category: "INTERNAL_MOCK",
    status: "mocked",
    capabilities: [
      "VOICE_SYNTHESIS",
      "REALTIME_VOICE",
      "CALL_TRANSPORT",
      "TRANSCRIPT_SUMMARY",
      "CALL_OUTCOME_CLASSIFICATION",
    ],
    requiredSecrets: [],
    riskLevel: "none",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes:
      "Deterministic mock used for all voice simulation in demo mode. No calls placed.",
  },
  {
    providerKey: "internal-mock-sms",
    displayName: "Internal Mock SMS",
    category: "INTERNAL_MOCK",
    status: "mocked",
    capabilities: ["SMS_DELIVERY"],
    requiredSecrets: [],
    riskLevel: "none",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Deterministic mock used for SMS simulation in demo mode. Nothing sent.",
  },
  {
    providerKey: "internal-mock-email",
    displayName: "Internal Mock Email",
    category: "INTERNAL_MOCK",
    status: "mocked",
    capabilities: ["EMAIL_DELIVERY"],
    requiredSecrets: [],
    riskLevel: "none",
    liveUseAllowed: false,
    sandboxAvailable: true,
    notes: "Deterministic mock used for email simulation in demo mode. Nothing sent.",
  },
];

const BY_KEY = new Map<string, ProviderDefinition>(
  PROVIDER_REGISTRY.map((provider) => [provider.providerKey, provider]),
);

export function getProvider(providerKey: string): ProviderDefinition | null {
  return BY_KEY.get(providerKey) ?? null;
}

export function providersForCapability(
  capability: ProviderCapability,
): ProviderDefinition[] {
  return PROVIDER_REGISTRY.filter((provider) =>
    provider.capabilities.includes(capability),
  );
}

export function isInternalMock(provider: ProviderDefinition): boolean {
  return provider.category === "INTERNAL_MOCK";
}
