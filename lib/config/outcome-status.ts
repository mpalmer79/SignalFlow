import type {
  AttributionType,
  MissedOpportunitySeverity,
  OutcomeType,
} from "@/lib/types/outcome";

type Variant = "success" | "danger" | "warning" | "primary" | "muted";

const POSITIVE: OutcomeType[] = [
  "OPPORTUNITY_WON",
  "OPPORTUNITY_ADVANCED",
  "OPPORTUNITY_REACTIVATED",
  "APPOINTMENT_SCHEDULED",
  "APPOINTMENT_CONFIRMED",
  "CUSTOMER_REPLIED",
  "HUMAN_HANDOFF_COMPLETED",
  "EMAIL_OPENED",
  "HUMAN_TASK_CREATED",
];

const NEGATIVE: OutcomeType[] = [
  "OPPORTUNITY_LOST",
  "OPPORTUNITY_DORMANT",
  "NO_RESPONSE",
  "ACTION_BLOCKED",
  "COMPLIANCE_STOP",
];

export function outcomeVariant(type: OutcomeType): Variant {
  if (POSITIVE.includes(type)) return "success";
  if (NEGATIVE.includes(type)) return "danger";
  return "muted";
}

export function outcomeLabel(type: OutcomeType): string {
  return type
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const attributionStyles: Record<
  AttributionType,
  { label: string; variant: Variant }
> = {
  RECOVERED: { label: "Recovered", variant: "success" },
  INFLUENCED: { label: "Influenced", variant: "primary" },
  ASSISTED: { label: "Assisted", variant: "muted" },
  PREVENTED_LOSS: { label: "Prevented loss", variant: "warning" },
  MISSED: { label: "Missed", variant: "danger" },
};

export const severityStyles: Record<
  MissedOpportunitySeverity,
  { label: string; variant: Variant }
> = {
  low: { label: "Low", variant: "muted" },
  medium: { label: "Medium", variant: "primary" },
  high: { label: "High", variant: "warning" },
  critical: { label: "Critical", variant: "danger" },
};
