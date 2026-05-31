import {
  getProvider,
  isInternalMock,
  type ProviderDefinition,
} from "./provider-registry";
import type { ProviderCapability } from "./provider-capabilities";
import { CAPABILITY_LIVE_FLAG } from "./provider-capabilities";
import type { FeatureFlagEvaluation } from "@/lib/feature-flags/feature-flag-types";

// The readiness verdict for a provider and capability.
export type ReadinessStatus = "live-ready" | "sandbox-ready" | "not-ready";

export interface ReadinessResult {
  providerKey: string;
  capability: ProviderCapability;
  status: ReadinessStatus;
  missingRequirements: string[];
}

export interface ReadinessInput {
  // The stored configuration flags for the provider, if any.
  configured: boolean;
  sandboxEnabled: boolean;
  liveEnabled: boolean;
  complianceApproved: boolean;
  // The evaluated feature flags, keyed for lookup.
  flagByKey: Map<string, FeatureFlagEvaluation>;
}

// Determine readiness deterministically. In this phase no external provider is
// ever live-ready: the governing feature flag is blocked while demo mode is
// active, and live use additionally requires configuration, documented
// secrets, and compliance approval. Internal mock providers are sandbox-ready.
export function checkReadiness(
  providerKey: string,
  capability: ProviderCapability,
  input: ReadinessInput,
): ReadinessResult {
  const provider = getProvider(providerKey);
  if (!provider) {
    return {
      providerKey,
      capability,
      status: "not-ready",
      missingRequirements: ["Unknown provider"],
    };
  }

  if (!provider.capabilities.includes(capability)) {
    return {
      providerKey,
      capability,
      status: "not-ready",
      missingRequirements: ["Provider does not expose this capability"],
    };
  }

  const flagKey = CAPABILITY_LIVE_FLAG[capability];
  const flag = input.flagByKey.get(flagKey);
  const missing: string[] = [];

  // Gather every unmet live requirement.
  if (!flag || flag.state !== "allowed") {
    missing.push(`Feature flag ${flagKey} is not allowed`);
  }
  if (!provider.liveUseAllowed) {
    missing.push("Live use is not allowed for this provider");
  }
  if (!input.configured) {
    missing.push("Provider is not configured");
  }
  if (provider.requiredSecrets.length > 0) {
    missing.push(
      `Documented secrets required: ${provider.requiredSecrets.join(", ")}`,
    );
  }
  if (!input.complianceApproved) {
    missing.push("Compliance approval is required");
  }
  if (!input.liveEnabled) {
    missing.push("Live use is not enabled in configuration");
  }

  if (missing.length === 0) {
    return {
      providerKey,
      capability,
      status: "live-ready",
      missingRequirements: [],
    };
  }

  // An internal mock with the sandbox available and enabled is sandbox-ready,
  // which is the highest state reachable in this phase.
  if (isInternalMock(provider) && provider.sandboxAvailable) {
    return {
      providerKey,
      capability,
      status: "sandbox-ready",
      missingRequirements: missing,
    };
  }

  // External providers that can be sandboxed are still only sandbox-ready when
  // the sandbox is enabled; otherwise not ready.
  if (provider.sandboxAvailable && input.sandboxEnabled) {
    return {
      providerKey,
      capability,
      status: "sandbox-ready",
      missingRequirements: missing,
    };
  }

  return {
    providerKey,
    capability,
    status: "not-ready",
    missingRequirements: missing,
  };
}

export function readinessForProvider(
  provider: ProviderDefinition,
  input: ReadinessInput,
): ReadinessResult[] {
  return provider.capabilities.map((capability) =>
    checkReadiness(provider.providerKey, capability, input),
  );
}
