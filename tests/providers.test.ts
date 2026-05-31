import { describe, it, expect } from "vitest";
import { selectProvider } from "@/lib/providers/provider-selection-engine";
import { checkReadiness } from "@/lib/providers/provider-readiness";
import { runSandbox } from "@/lib/providers/provider-sandbox";
import {
  PROVIDER_REGISTRY,
  isInternalMock,
} from "@/lib/providers/provider-registry";
import { ALL_CAPABILITIES } from "@/lib/providers/provider-capabilities";
import { flagMap } from "./factories";

// In demo mode every live flag resolves to blocked. We model that with a flag
// map whose entries are all blocked.
function demoFlags() {
  return flagMap([
    ["ENABLE_LIVE_AI", { state: "blocked" }],
    ["ENABLE_LIVE_VOICE", { state: "blocked" }],
    ["ENABLE_LIVE_SMS", { state: "blocked" }],
    ["ENABLE_LIVE_EMAIL", { state: "blocked" }],
  ]);
}

describe("provider selection engine", () => {
  it("selects an internal mock provider for every capability in demo mode", () => {
    const flags = demoFlags();
    for (const capability of ALL_CAPABILITIES) {
      const selection = selectProvider(capability, flags);
      expect(selection.result).toBe("mock-selected");
      const provider = PROVIDER_REGISTRY.find(
        (p) => p.providerKey === selection.selectedProviderKey,
      );
      expect(provider).toBeDefined();
      expect(provider && isInternalMock(provider)).toBe(true);
    }
  });

  it("never selects an external provider in demo mode", () => {
    const flags = demoFlags();
    for (const capability of ALL_CAPABILITIES) {
      const selection = selectProvider(capability, flags);
      expect(selection.result).not.toBe("live-selected");
    }
  });
});

describe("provider readiness engine", () => {
  const readinessInput = (configured: boolean) => ({
    configured,
    sandboxEnabled: true,
    liveEnabled: false,
    complianceApproved: false,
    flagByKey: demoFlags(),
  });

  it("never marks an external provider live-ready in demo mode", () => {
    for (const provider of PROVIDER_REGISTRY) {
      if (isInternalMock(provider)) continue;
      for (const capability of provider.capabilities) {
        const result = checkReadiness(
          provider.providerKey,
          capability,
          readinessInput(true),
        );
        expect(result.status).not.toBe("live-ready");
        expect(result.missingRequirements.length).toBeGreaterThan(0);
      }
    }
  });

  it("marks internal mock providers sandbox-ready", () => {
    const mock = PROVIDER_REGISTRY.find((p) => p.providerKey === "internal-mock-ai");
    expect(mock).toBeDefined();
    const result = checkReadiness(
      "internal-mock-ai",
      "TEXT_RECOMMENDATION",
      readinessInput(true),
    );
    expect(result.status).toBe("sandbox-ready");
  });
});

describe("provider sandbox", () => {
  it("always selects a mock provider and reports a blocked live reason", () => {
    const result = runSandbox(
      { capability: "VOICE_SYNTHESIS", inputSummary: "dental recall" },
      demoFlags(),
    );
    const provider = PROVIDER_REGISTRY.find(
      (p) => p.providerKey === result.selectedProviderKey,
    );
    expect(provider && isInternalMock(provider)).toBe(true);
    expect(result.blockedLiveReason.length).toBeGreaterThan(0);
    expect(result.liveRequirements.length).toBeGreaterThan(0);
  });
});
