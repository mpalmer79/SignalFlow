import type { Channel, ConsentState } from "@/lib/types/consent";
import type { Customer } from "@/lib/types/customer";
import type { CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import type { ActionPolicyContext } from "./action-policy-engine";

// Translate a persisted customer and their intelligence profile into the
// policy context the action policy engine consumes. This keeps the engine free
// of domain assembly concerns.
export function buildPolicyContext(
  customer: Customer,
  profile: CustomerIntelligenceProfile,
): ActionPolicyContext {
  const channelConsent: Record<Channel, ConsentState> = {
    sms: "unknown",
    email: "unknown",
    voice: "unknown",
    human: "granted",
  };

  for (const channel of customer.channels) {
    channelConsent[channel.channel] = channel.consent;
  }

  const medicalSensitive =
    customer.vertical === "medical" ||
    profile.riskFlags.some((flag) =>
      flag.label.toLowerCase().includes("protected health"),
    );

  const highValue = profile.riskFlags.some((flag) =>
    flag.label.toLowerCase().includes("high value"),
  );

  return {
    optedOut: customer.optedOut,
    channelConsent,
    medicalSensitive,
    // Quiet hours are not modeled in the seed data, so this stays false in the
    // demo. The engine still enforces it when set.
    withinQuietHours: false,
    highValue,
  };
}
