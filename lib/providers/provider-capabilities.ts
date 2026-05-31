// Phase 10 provider capability vocabulary. Pure and framework free.

export type ProviderCapability =
  | "TEXT_RECOMMENDATION"
  | "INTENT_CLASSIFICATION"
  | "EXPLANATION_GENERATION"
  | "VOICE_SYNTHESIS"
  | "REALTIME_VOICE"
  | "CALL_TRANSPORT"
  | "SMS_DELIVERY"
  | "EMAIL_DELIVERY"
  | "TRANSCRIPT_SUMMARY"
  | "CALL_OUTCOME_CLASSIFICATION";

export const CAPABILITY_LABELS: Record<ProviderCapability, string> = {
  TEXT_RECOMMENDATION: "Text recommendation",
  INTENT_CLASSIFICATION: "Intent classification",
  EXPLANATION_GENERATION: "Explanation generation",
  VOICE_SYNTHESIS: "Voice synthesis",
  REALTIME_VOICE: "Realtime voice",
  CALL_TRANSPORT: "Call transport",
  SMS_DELIVERY: "SMS delivery",
  EMAIL_DELIVERY: "Email delivery",
  TRANSCRIPT_SUMMARY: "Transcript summary",
  CALL_OUTCOME_CLASSIFICATION: "Call outcome classification",
};

export const ALL_CAPABILITIES = Object.keys(
  CAPABILITY_LABELS,
) as ProviderCapability[];

// The feature flag a capability depends on for live use. Used by readiness and
// selection so a capability can never be served live while its flag is off.
import type { FeatureFlagKey } from "@/lib/feature-flags/feature-flag-types";

export const CAPABILITY_LIVE_FLAG: Record<ProviderCapability, FeatureFlagKey> = {
  TEXT_RECOMMENDATION: "ENABLE_LIVE_AI",
  INTENT_CLASSIFICATION: "ENABLE_LIVE_AI",
  EXPLANATION_GENERATION: "ENABLE_LIVE_AI",
  VOICE_SYNTHESIS: "ENABLE_LIVE_VOICE",
  REALTIME_VOICE: "ENABLE_LIVE_VOICE",
  CALL_TRANSPORT: "ENABLE_LIVE_VOICE",
  SMS_DELIVERY: "ENABLE_LIVE_SMS",
  EMAIL_DELIVERY: "ENABLE_LIVE_EMAIL",
  TRANSCRIPT_SUMMARY: "ENABLE_LIVE_VOICE",
  CALL_OUTCOME_CLASSIFICATION: "ENABLE_LIVE_VOICE",
};
