// Phase 10 feature flag types. Deterministic and framework free. No flag
// enables a live provider in this phase; every live flag defaults to disabled.

export type FeatureFlagKey =
  | "ENABLE_LIVE_AI"
  | "ENABLE_LIVE_VOICE"
  | "ENABLE_LIVE_SMS"
  | "ENABLE_LIVE_EMAIL"
  | "ENABLE_PROVIDER_SANDBOX"
  | "ENABLE_REALTIME_TRANSCRIPTS"
  | "ENABLE_EXTERNAL_WEBHOOKS"
  | "ENABLE_DEMO_MODE";

// The deterministic result of evaluating a flag in a given context.
export type FeatureFlagState =
  | "allowed"
  | "blocked"
  | "disabled"
  | "requires-configuration"
  | "requires-approval";

export interface FeatureFlagDefinition {
  key: FeatureFlagKey;
  label: string;
  description: string;
  // Whether the flag governs a live capability. Live flags are locked off in
  // this phase regardless of any stored value.
  governsLive: boolean;
  // The default value used when no organization override is stored.
  defaultEnabled: boolean;
}

// A stored organization override for a flag. enabled is the requested value;
// the evaluator decides whether it is honored.
export interface FeatureFlagOverride {
  key: FeatureFlagKey;
  enabled: boolean;
  reason: string;
}

export interface FeatureFlagEvaluation {
  key: FeatureFlagKey;
  label: string;
  state: FeatureFlagState;
  enabled: boolean;
  reason: string;
  governsLive: boolean;
}

export const FEATURE_FLAG_STATE_LABELS: Record<FeatureFlagState, string> = {
  allowed: "Allowed",
  blocked: "Blocked",
  disabled: "Disabled",
  "requires-configuration": "Requires configuration",
  "requires-approval": "Requires approval",
};
