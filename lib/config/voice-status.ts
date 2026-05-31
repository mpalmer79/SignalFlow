import type {
  VoiceCallOutcomeType,
  VoiceCallPriority,
  VoiceComplianceStatus,
} from "@/lib/types/voice";

type Variant = "success" | "danger" | "warning" | "primary" | "muted";

export const voiceComplianceStyles: Record<
  VoiceComplianceStatus,
  { label: string; variant: Variant }
> = {
  allowed: { label: "Allowed", variant: "success" },
  blocked: { label: "Blocked", variant: "danger" },
  "needs-review": { label: "Needs review", variant: "warning" },
};

export const voicePriorityStyles: Record<
  VoiceCallPriority,
  { label: string; variant: Variant }
> = {
  immediate: { label: "Immediate", variant: "danger" },
  high: { label: "High", variant: "warning" },
  standard: { label: "Standard", variant: "primary" },
  low: { label: "Low", variant: "muted" },
};

const POSITIVE: VoiceCallOutcomeType[] = [
  "APPOINTMENT_SCHEDULED",
  "CUSTOMER_INTERESTED",
  "CALLBACK_REQUESTED",
];

const NEGATIVE: VoiceCallOutcomeType[] = [
  "CUSTOMER_NOT_INTERESTED",
  "WRONG_NUMBER",
  "COMPLIANCE_STOP",
];

export function voiceOutcomeVariant(type: VoiceCallOutcomeType): Variant {
  if (POSITIVE.includes(type)) return "success";
  if (NEGATIVE.includes(type)) return "danger";
  return "muted";
}
