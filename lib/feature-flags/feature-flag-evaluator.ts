import {
  FEATURE_FLAGS,
  getFeatureFlagDefinition,
} from "./feature-flag-registry";
import type {
  FeatureFlagEvaluation,
  FeatureFlagKey,
  FeatureFlagOverride,
  FeatureFlagState,
} from "./feature-flag-types";

// The evaluation context. demoMode mirrors the ENABLE_DEMO_MODE flag and is
// resolved first so live flags can be locked off deterministically.
export interface FeatureFlagContext {
  demoMode: boolean;
  overrides: Map<FeatureFlagKey, FeatureFlagOverride>;
}

// Build the evaluation context from stored overrides. Demo mode defaults to
// enabled unless an override explicitly disables it.
export function buildFeatureFlagContext(
  overrides: FeatureFlagOverride[],
): FeatureFlagContext {
  const map = new Map<FeatureFlagKey, FeatureFlagOverride>();
  for (const override of overrides) {
    map.set(override.key, override);
  }
  const demoOverride = map.get("ENABLE_DEMO_MODE");
  const demoMode = demoOverride
    ? demoOverride.enabled
    : getFeatureFlagDefinition("ENABLE_DEMO_MODE").defaultEnabled;
  return { demoMode, overrides: map };
}

// Evaluate a single flag deterministically. Live flags are blocked while demo
// mode is active, regardless of any stored value, so the platform can never be
// flipped live by data alone in this phase.
export function evaluateFeatureFlag(
  key: FeatureFlagKey,
  context: FeatureFlagContext,
): FeatureFlagEvaluation {
  const definition = getFeatureFlagDefinition(key);
  const override = context.overrides.get(key);
  const requested = override ? override.enabled : definition.defaultEnabled;

  let state: FeatureFlagState;
  let enabled: boolean;
  let reason: string;

  if (definition.governsLive) {
    if (context.demoMode) {
      state = "blocked";
      enabled = false;
      reason =
        "Demo mode is active. Live capabilities are locked off platform wide.";
    } else if (!requested) {
      state = "disabled";
      enabled = false;
      reason = "The flag is disabled for this organization.";
    } else {
      // Even with demo mode off and the flag requested, live use still needs
      // configuration and approval, which are not available in this phase.
      state = "requires-approval";
      enabled = false;
      reason =
        "Live use requires provider configuration, documented secrets, and compliance approval, which are not available in this phase.";
    }
  } else {
    enabled = requested;
    state = requested ? "allowed" : "disabled";
    reason = override
      ? override.reason
      : requested
        ? "Enabled by default."
        : "Disabled by default.";
  }

  return {
    key,
    label: definition.label,
    state,
    enabled,
    reason,
    governsLive: definition.governsLive,
  };
}

// Evaluate every flag in the registry.
export function evaluateAllFeatureFlags(
  context: FeatureFlagContext,
): FeatureFlagEvaluation[] {
  return FEATURE_FLAGS.map((flag) => evaluateFeatureFlag(flag.key, context));
}
