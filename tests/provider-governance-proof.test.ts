import { describe, it, expect } from "vitest";
import { selectProvider } from "@/lib/providers/provider-selection-engine";
import {
  PROVIDER_REGISTRY,
  getProvider,
  isInternalMock,
} from "@/lib/providers/provider-registry";
import { ALL_CAPABILITIES } from "@/lib/providers/provider-capabilities";
import { flagMap } from "./factories";

// Provider safety proof. The registry intentionally ships future-ready external
// provider definitions so the governance surface is real, yet in demo mode the
// selection engine only ever resolves internal mock providers. This proves the
// demo-safety contract: external providers are described, never selected.

function demoFlags() {
  return flagMap([
    ["ENABLE_LIVE_AI", { state: "blocked" }],
    ["ENABLE_LIVE_VOICE", { state: "blocked" }],
    ["ENABLE_LIVE_SMS", { state: "blocked" }],
    ["ENABLE_LIVE_EMAIL", { state: "blocked" }],
  ]);
}

const NAMED_EXTERNAL_PROVIDERS = [
  "openai",
  "anthropic",
  "gemini",
  "elevenlabs",
  "twilio",
  "sendgrid",
];

describe("provider governance", () => {
  it("ships the named external providers as future-ready, not internal mocks", () => {
    for (const key of NAMED_EXTERNAL_PROVIDERS) {
      const provider = getProvider(key);
      expect(provider, `expected ${key} in the registry`).not.toBeNull();
      expect(provider && isInternalMock(provider)).toBe(false);
    }
  });

  it("selects only internal mock providers in demo mode", () => {
    const flags = demoFlags();
    for (const capability of ALL_CAPABILITIES) {
      const selection = selectProvider(capability, flags);
      const provider = PROVIDER_REGISTRY.find(
        (p) => p.providerKey === selection.selectedProviderKey,
      );
      expect(provider, `no provider for ${capability}`).toBeDefined();
      expect(provider && isInternalMock(provider)).toBe(true);
    }
  });

  it("never resolves a named external provider in demo mode", () => {
    const flags = demoFlags();
    for (const capability of ALL_CAPABILITIES) {
      const selection = selectProvider(capability, flags);
      expect(NAMED_EXTERNAL_PROVIDERS).not.toContain(
        selection.selectedProviderKey,
      );
    }
  });
});
