import {
  buildFeatureFlagContext,
  evaluateAllFeatureFlags,
  evaluateFeatureFlag,
  type FeatureFlagContext,
} from "./feature-flag-evaluator";
import type {
  FeatureFlagEvaluation,
  FeatureFlagKey,
  FeatureFlagOverride,
} from "./feature-flag-types";

// The feature flag engine is the public entry point for flag decisions. It is
// pure: it takes stored overrides and returns deterministic evaluations.
export function evaluateFlags(
  overrides: FeatureFlagOverride[],
): FeatureFlagEvaluation[] {
  const context = buildFeatureFlagContext(overrides);
  return evaluateAllFeatureFlags(context);
}

export function evaluateFlag(
  key: FeatureFlagKey,
  overrides: FeatureFlagOverride[],
): FeatureFlagEvaluation {
  const context = buildFeatureFlagContext(overrides);
  return evaluateFeatureFlag(key, context);
}

// A convenience predicate. A flag is effectively enabled only when its
// evaluation resolves to allowed. Live flags never resolve to allowed in this
// phase.
export function isFlagEnabled(
  key: FeatureFlagKey,
  overrides: FeatureFlagOverride[],
): boolean {
  return evaluateFlag(key, overrides).enabled;
}

export function isDemoMode(overrides: FeatureFlagOverride[]): boolean {
  const context: FeatureFlagContext = buildFeatureFlagContext(overrides);
  return context.demoMode;
}
