import {
  isInternalMock,
  providersForCapability,
  type ProviderDefinition,
} from "./provider-registry";
import type { ProviderCapability } from "./provider-capabilities";
import { CAPABILITY_LIVE_FLAG } from "./provider-capabilities";
import type { FeatureFlagEvaluation } from "@/lib/feature-flags/feature-flag-types";

export type SelectionResultType = "mock-selected" | "live-selected" | "none-available";

export interface ProviderSelection {
  capability: ProviderCapability;
  result: SelectionResultType;
  selectedProviderKey: string | null;
  selectedProviderName: string | null;
  candidateKeys: string[];
  reason: string;
}

// The internal mock provider that serves each capability category.
function mockForCapability(capability: ProviderCapability): ProviderDefinition | null {
  const candidates = providersForCapability(capability).filter(isInternalMock);
  return candidates[0] ?? null;
}

// Deterministic provider selection. While demo mode is active (the governing
// live flag is blocked), the engine always selects the internal mock provider.
// It never selects a live provider in this phase.
export function selectProvider(
  capability: ProviderCapability,
  flagByKey: Map<string, FeatureFlagEvaluation>,
): ProviderSelection {
  const candidates = providersForCapability(capability);
  const candidateKeys = candidates.map((provider) => provider.providerKey);
  const flagKey = CAPABILITY_LIVE_FLAG[capability];
  const flag = flagByKey.get(flagKey);
  const liveAllowed = flag?.state === "allowed";

  const mock = mockForCapability(capability);

  if (!liveAllowed) {
    if (mock) {
      return {
        capability,
        result: "mock-selected",
        selectedProviderKey: mock.providerKey,
        selectedProviderName: mock.displayName,
        candidateKeys,
        reason: `Live providers are disabled for ${flagKey}. Demo mode is active, so the internal mock provider is selected.`,
      };
    }
    return {
      capability,
      result: "none-available",
      selectedProviderKey: null,
      selectedProviderName: null,
      candidateKeys,
      reason: "No internal mock provider serves this capability.",
    };
  }

  // This branch is unreachable in this phase because live flags never resolve
  // to allowed. It is written for forward readiness only and still prefers a
  // configured live provider if one were ever permitted.
  const live = candidates.find(
    (provider) => !isInternalMock(provider) && provider.liveUseAllowed,
  );
  if (live) {
    return {
      capability,
      result: "live-selected",
      selectedProviderKey: live.providerKey,
      selectedProviderName: live.displayName,
      candidateKeys,
      reason: `Live use is permitted and ${live.displayName} is configured.`,
    };
  }

  if (mock) {
    return {
      capability,
      result: "mock-selected",
      selectedProviderKey: mock.providerKey,
      selectedProviderName: mock.displayName,
      candidateKeys,
      reason: "No live provider is configured. The internal mock provider is selected.",
    };
  }

  return {
    capability,
    result: "none-available",
    selectedProviderKey: null,
    selectedProviderName: null,
    candidateKeys,
    reason: "No provider serves this capability.",
  };
}
