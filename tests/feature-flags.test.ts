import { describe, it, expect } from "vitest";
import {
  evaluateFlag,
  evaluateFlags,
  isDemoMode,
  isFlagEnabled,
} from "@/lib/feature-flags/feature-flag-engine";
import type { FeatureFlagOverride } from "@/lib/feature-flags/feature-flag-types";

const LIVE_FLAGS = [
  "ENABLE_LIVE_AI",
  "ENABLE_LIVE_VOICE",
  "ENABLE_LIVE_SMS",
  "ENABLE_LIVE_EMAIL",
  "ENABLE_REALTIME_TRANSCRIPTS",
  "ENABLE_EXTERNAL_WEBHOOKS",
] as const;

describe("feature flag evaluator", () => {
  it("defaults demo mode to enabled with no overrides", () => {
    expect(isDemoMode([])).toBe(true);
  });

  it("blocks every live flag while demo mode is active, even if requested", () => {
    for (const key of LIVE_FLAGS) {
      const overrides: FeatureFlagOverride[] = [
        { key, enabled: true, reason: "operator requested" },
      ];
      const result = evaluateFlag(key, overrides);
      expect(result.state).toBe("blocked");
      expect(result.enabled).toBe(false);
    }
  });

  it("never returns an enabled live flag in demo mode", () => {
    const requested: FeatureFlagOverride[] = LIVE_FLAGS.map((key) => ({
      key,
      enabled: true,
      reason: "requested",
    }));
    for (const flag of evaluateFlags(requested)) {
      if (flag.governsLive) {
        expect(flag.enabled).toBe(false);
      }
    }
  });

  it("downgrades a requested live flag to requires-approval only when demo mode is off", () => {
    const overrides: FeatureFlagOverride[] = [
      { key: "ENABLE_DEMO_MODE", enabled: false, reason: "off" },
      { key: "ENABLE_LIVE_AI", enabled: true, reason: "requested" },
    ];
    const result = evaluateFlag("ENABLE_LIVE_AI", overrides);
    expect(result.state).toBe("requires-approval");
    expect(result.enabled).toBe(false);
  });

  it("allows the sandbox flag, which does not govern live use", () => {
    expect(isFlagEnabled("ENABLE_PROVIDER_SANDBOX", [])).toBe(true);
  });
});
