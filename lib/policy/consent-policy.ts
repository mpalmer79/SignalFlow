import type { Channel, ConsentProfile } from "@/lib/types/consent";
import type { VerticalId } from "@/lib/types/vertical-pack";
import {
  POLICY_REASON_LABELS,
  type PolicyReason,
  type PolicyResult,
} from "./policy-decisions";

export interface PolicyContext {
  channel: Channel;
  consent: ConsentProfile;
  vertical: VerticalId;
  withinQuietHours?: boolean;
  messageIsMedicalSensitive?: boolean;
  highValueLead?: boolean;
}

const MISSING_CONSENT_REASON: Record<Channel, PolicyReason> = {
  sms: "missing-sms-consent",
  voice: "missing-voice-consent",
  email: "missing-email-consent",
  human: "human-review-required",
};

function result(
  decision: PolicyResult["decision"],
  reason: PolicyReason,
  channel: Channel,
  explanation: string,
): PolicyResult {
  return { decision, reason, channel, explanation };
}

export function evaluatePolicy(context: PolicyContext): PolicyResult {
  const { channel, consent, withinQuietHours, messageIsMedicalSensitive, highValueLead } =
    context;

  if (consent.optedOut) {
    return result(
      "blocked",
      "customer-opted-out",
      channel,
      "The customer opted out of outreach, so no action is permitted.",
    );
  }

  if (messageIsMedicalSensitive) {
    return result(
      "needs-review",
      "medical-sensitive-message",
      channel,
      "Medical sensitive content requires human review before any send.",
    );
  }

  if (channel === "human") {
    return result(
      "needs-review",
      "human-review-required",
      channel,
      "A human task is created for manual handling.",
    );
  }

  const channelConsent = consent.channels.find((c) => c.channel === channel);
  if (!channelConsent || channelConsent.state !== "granted") {
    const reason = MISSING_CONSENT_REASON[channel];
    return result(
      "blocked",
      reason,
      channel,
      `${POLICY_REASON_LABELS[reason]} blocks this channel until consent is captured.`,
    );
  }

  if (withinQuietHours) {
    return result(
      "blocked",
      "quiet-hours",
      channel,
      "The current time falls inside the customer quiet hours window.",
    );
  }

  if (highValueLead) {
    return result(
      "needs-review",
      "human-review-required",
      channel,
      "High value leads are routed to a human for confirmation before send.",
    );
  }

  return result(
    "allowed",
    "consent-present",
    channel,
    "Consent is present and no restriction applies, so the action is allowed.",
  );
}
