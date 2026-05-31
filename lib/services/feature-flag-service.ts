import {
  findFeatureFlagOverrides,
  upsertFeatureFlag,
} from "@/lib/repositories/feature-flag-repository";
import { recordProviderAuditEvents } from "@/lib/repositories/provider-audit-repository";
import { evaluateFlags, isDemoMode } from "@/lib/feature-flags/feature-flag-engine";
import type {
  FeatureFlagEvaluation,
  FeatureFlagKey,
} from "@/lib/feature-flags/feature-flag-types";
import type { RequestContext } from "@/lib/types/auth";

export interface FeatureFlagView {
  flags: FeatureFlagEvaluation[];
  demoMode: boolean;
}

// Evaluate all feature flags for the calling organization. Pure evaluation on
// top of stored overrides.
export async function getFeatureFlags(
  context: RequestContext,
): Promise<FeatureFlagView> {
  const overrides = await findFeatureFlagOverrides(context.organizationId);
  return {
    flags: evaluateFlags(overrides),
    demoMode: isDemoMode(overrides),
  };
}

// Build a keyed map for engines that need flag lookups.
export async function getFeatureFlagMap(
  context: RequestContext,
): Promise<Map<string, FeatureFlagEvaluation>> {
  const { flags } = await getFeatureFlags(context);
  return new Map(flags.map((flag) => [flag.key, flag]));
}

// Update a feature flag override and record the change. Live flags can be
// stored as requested, but the evaluator still locks them off while demo mode
// is active, so this never enables live use in this phase.
export async function updateFeatureFlag(
  context: RequestContext,
  flagKey: FeatureFlagKey,
  enabled: boolean,
  reason: string,
): Promise<FeatureFlagView> {
  await upsertFeatureFlag({
    organizationId: context.organizationId,
    flagKey,
    enabled,
    reason,
  });
  await recordProviderAuditEvents(context.organizationId, [
    {
      providerKey: "platform",
      action: "FEATURE_FLAG_UPDATED",
      result: "recorded",
      reason: `${flagKey} set to ${enabled ? "enabled" : "disabled"}. ${reason}`,
    },
  ]);
  return getFeatureFlags(context);
}
