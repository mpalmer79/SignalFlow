import { getProvider } from "./provider-registry";
import type { ProviderCapability } from "./provider-capabilities";
import { CAPABILITY_LABELS, CAPABILITY_LIVE_FLAG } from "./provider-capabilities";
import { selectProvider } from "./provider-selection-engine";
import type { FeatureFlagEvaluation } from "@/lib/feature-flags/feature-flag-types";

// A deterministic sandbox simulation. It shows what would happen if a provider
// were selected for a capability, without making any network call. The output
// is illustrative text, never a real provider response.
export interface SandboxRequest {
  capability: ProviderCapability;
  inputSummary: string;
}

export interface SandboxResult {
  capability: ProviderCapability;
  capabilityLabel: string;
  selectedProviderKey: string | null;
  selectedProviderName: string | null;
  selectionReason: string;
  inputSummary: string;
  outputSummary: string;
  blockedLiveReason: string;
  liveRequirements: string[];
}

// Build a deterministic illustrative output per capability. These strings make
// the sandbox readable; they are not provider responses.
function illustrativeOutput(
  capability: ProviderCapability,
  providerName: string,
): string {
  switch (capability) {
    case "TEXT_RECOMMENDATION":
      return `${providerName} would return a recommended next action with a confidence score. In demo mode the deterministic engine returns: Immediate human follow-up, confidence 84.`;
    case "INTENT_CLASSIFICATION":
      return `${providerName} would classify intent from recent signals. In demo mode the deterministic classifier returns: Purchase Intent.`;
    case "EXPLANATION_GENERATION":
      return `${providerName} would generate a natural language rationale. In demo mode the deterministic engine returns a structured explanation with reasoning factors and risk considerations.`;
    case "VOICE_SYNTHESIS":
      return `${providerName} would synthesize audio from a script. In demo mode no audio is produced; a simulated transcript is generated instead.`;
    case "REALTIME_VOICE":
      return `${providerName} would host a realtime voice session. In demo mode the call is fully simulated and no session is opened.`;
    case "CALL_TRANSPORT":
      return `${providerName} would place a call over the telephone network. In demo mode no call is placed; the outcome is simulated deterministically.`;
    case "SMS_DELIVERY":
      return `${providerName} would deliver an SMS. In demo mode nothing is sent; the message is recorded as a simulated communication.`;
    case "EMAIL_DELIVERY":
      return `${providerName} would deliver an email. In demo mode nothing is sent; the message is recorded as a simulated communication.`;
    case "TRANSCRIPT_SUMMARY":
      return `${providerName} would summarize a transcript. In demo mode the deterministic generator returns the existing simulated summary.`;
    case "CALL_OUTCOME_CLASSIFICATION":
      return `${providerName} would classify a call outcome. In demo mode the deterministic engine returns the simulated outcome.`;
    default:
      return `${providerName} would serve this capability. In demo mode a deterministic mock response is returned.`;
  }
}

// Run a sandbox simulation deterministically. The selection engine always
// chooses the internal mock provider in this phase, so the blocked live reason
// is always populated.
export function runSandbox(
  request: SandboxRequest,
  flagByKey: Map<string, FeatureFlagEvaluation>,
): SandboxResult {
  const selection = selectProvider(request.capability, flagByKey);
  const providerName = selection.selectedProviderName ?? "No provider";
  const flagKey = CAPABILITY_LIVE_FLAG[request.capability];
  const flag = flagByKey.get(flagKey);

  // The live provider that would be the first external candidate, for context.
  const liveCandidateKey = selection.candidateKeys.find((key) => {
    const provider = getProvider(key);
    return provider ? provider.category !== "INTERNAL_MOCK" : false;
  });
  const liveCandidate = liveCandidateKey ? getProvider(liveCandidateKey) : null;

  const liveRequirements = liveCandidate
    ? [
        `Enable feature flag ${flagKey}`,
        "Turn off demo mode",
        liveCandidate.requiredSecrets.length > 0
          ? `Document secrets: ${liveCandidate.requiredSecrets.join(", ")}`
          : "No secrets documented",
        "Obtain compliance approval",
        "Pass sandbox validation",
        "Explicitly allow live use",
      ]
    : [
        `Enable feature flag ${flagKey}`,
        "Turn off demo mode",
        "Obtain compliance approval",
      ];

  return {
    capability: request.capability,
    capabilityLabel: CAPABILITY_LABELS[request.capability],
    selectedProviderKey: selection.selectedProviderKey,
    selectedProviderName: selection.selectedProviderName,
    selectionReason: selection.reason,
    inputSummary: request.inputSummary,
    outputSummary: illustrativeOutput(request.capability, providerName),
    blockedLiveReason:
      flag && flag.state === "blocked"
        ? `Live execution is blocked because ${flagKey} resolves to blocked while demo mode is active.`
        : `Live execution is not available because ${flagKey} is not allowed.`,
    liveRequirements,
  };
}
