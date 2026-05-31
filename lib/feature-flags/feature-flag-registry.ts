import type {
  FeatureFlagDefinition,
  FeatureFlagKey,
} from "./feature-flag-types";

// The registry of all feature flags. Every flag that governs a live capability
// defaults to disabled. Demo mode defaults to enabled so the platform is
// reviewable out of the box.
export const FEATURE_FLAGS: FeatureFlagDefinition[] = [
  {
    key: "ENABLE_LIVE_AI",
    label: "Live AI",
    description:
      "Route AI recommendations to a live text provider instead of the internal mock.",
    governsLive: true,
    defaultEnabled: false,
  },
  {
    key: "ENABLE_LIVE_VOICE",
    label: "Live voice",
    description:
      "Place live voice calls through a telephony or voice provider instead of simulating them.",
    governsLive: true,
    defaultEnabled: false,
  },
  {
    key: "ENABLE_LIVE_SMS",
    label: "Live SMS",
    description: "Send live SMS through an SMS provider instead of simulating delivery.",
    governsLive: true,
    defaultEnabled: false,
  },
  {
    key: "ENABLE_LIVE_EMAIL",
    label: "Live email",
    description: "Send live email through an email provider instead of simulating delivery.",
    governsLive: true,
    defaultEnabled: false,
  },
  {
    key: "ENABLE_PROVIDER_SANDBOX",
    label: "Provider sandbox",
    description:
      "Allow sandbox simulations that show what a provider request would look like. No network calls are made.",
    governsLive: false,
    defaultEnabled: true,
  },
  {
    key: "ENABLE_REALTIME_TRANSCRIPTS",
    label: "Realtime transcripts",
    description:
      "Stream realtime transcripts from a live voice provider. Requires live voice.",
    governsLive: true,
    defaultEnabled: false,
  },
  {
    key: "ENABLE_EXTERNAL_WEBHOOKS",
    label: "External webhooks",
    description:
      "Deliver outbound webhooks to external systems. Disabled while the platform is network isolated.",
    governsLive: true,
    defaultEnabled: false,
  },
  {
    key: "ENABLE_DEMO_MODE",
    label: "Demo mode",
    description:
      "Keep the platform deterministic and demo safe. While enabled, all live providers are locked off.",
    governsLive: false,
    defaultEnabled: true,
  },
];

const FLAG_BY_KEY = new Map<FeatureFlagKey, FeatureFlagDefinition>(
  FEATURE_FLAGS.map((flag) => [flag.key, flag]),
);

export function getFeatureFlagDefinition(
  key: FeatureFlagKey,
): FeatureFlagDefinition {
  const flag = FLAG_BY_KEY.get(key);
  if (!flag) {
    throw new Error(`Unknown feature flag: ${key}`);
  }
  return flag;
}

export const ALL_FEATURE_FLAG_KEYS = FEATURE_FLAGS.map((flag) => flag.key);
