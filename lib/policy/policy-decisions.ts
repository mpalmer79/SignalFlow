import type { Channel } from "@/lib/types/consent";

export type PolicyDecision = "allowed" | "blocked" | "needs-review";

export type PolicyReason =
  | "consent-present"
  | "missing-sms-consent"
  | "missing-voice-consent"
  | "missing-email-consent"
  | "customer-opted-out"
  | "quiet-hours"
  | "medical-sensitive-message"
  | "human-review-required";

export interface PolicyResult {
  decision: PolicyDecision;
  reason: PolicyReason;
  channel: Channel;
  explanation: string;
}

export const POLICY_REASON_LABELS: Record<PolicyReason, string> = {
  "consent-present": "Consent present",
  "missing-sms-consent": "Missing SMS consent",
  "missing-voice-consent": "Missing voice consent",
  "missing-email-consent": "Missing email consent",
  "customer-opted-out": "Customer opted out",
  "quiet-hours": "Quiet hours",
  "medical-sensitive-message": "Medical sensitive message",
  "human-review-required": "Human review required",
};

export const POLICY_DECISION_LABELS: Record<PolicyDecision, string> = {
  allowed: "Allowed",
  blocked: "Blocked",
  "needs-review": "Needs Review",
};
