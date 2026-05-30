import type { BadgeProps } from "@/components/ui/badge";
import type { CommunicationStatus } from "@/lib/types/communication";
import type { ConsentState } from "@/lib/types/consent";
import type { OpportunityStage } from "@/lib/types/opportunity";
import type { SignalPriority } from "@/lib/types/signal";
import type { AuditOutcome } from "@/lib/types/audit";
import type { PolicyDecision } from "@/lib/policy/policy-decisions";

type Variant = NonNullable<BadgeProps["variant"]>;

export interface StatusStyle {
  label: string;
  variant: Variant;
}

export const communicationStatusStyles: Record<CommunicationStatus, StatusStyle> = {
  drafted: { label: "Drafted", variant: "muted" },
  queued: { label: "Queued", variant: "primary" },
  sent: { label: "Sent", variant: "primary" },
  delivered: { label: "Delivered", variant: "success" },
  replied: { label: "Replied", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  blocked: { label: "Blocked", variant: "danger" },
  escalated: { label: "Escalated", variant: "warning" },
};

export const consentStateStyles: Record<ConsentState, StatusStyle> = {
  granted: { label: "Consent granted", variant: "success" },
  denied: { label: "Consent denied", variant: "danger" },
  unknown: { label: "Consent unknown", variant: "muted" },
  revoked: { label: "Consent revoked", variant: "danger" },
};

export const priorityStyles: Record<SignalPriority, StatusStyle> = {
  critical: { label: "Critical", variant: "danger" },
  high: { label: "High", variant: "warning" },
  medium: { label: "Medium", variant: "primary" },
  low: { label: "Low", variant: "muted" },
};

export const opportunityStageStyles: Record<OpportunityStage, StatusStyle> = {
  new: { label: "New", variant: "primary" },
  "contact-attempted": { label: "Contact Attempted", variant: "default" },
  engaged: { label: "Engaged", variant: "primary" },
  "appointment-set": { label: "Appointment Set", variant: "success" },
  "needs-human-review": { label: "Needs Human Review", variant: "warning" },
  won: { label: "Won", variant: "success" },
  lost: { label: "Lost", variant: "danger" },
  dormant: { label: "Dormant", variant: "muted" },
  reactivated: { label: "Reactivated", variant: "primary" },
};

export const policyDecisionStyles: Record<PolicyDecision, StatusStyle> = {
  allowed: { label: "Allowed", variant: "success" },
  blocked: { label: "Blocked", variant: "danger" },
  "needs-review": { label: "Needs Review", variant: "warning" },
};

export const auditOutcomeStyles: Record<AuditOutcome, StatusStyle> = {
  allowed: { label: "Allowed", variant: "success" },
  blocked: { label: "Blocked", variant: "danger" },
  review: { label: "Review", variant: "warning" },
  recorded: { label: "Recorded", variant: "muted" },
};
