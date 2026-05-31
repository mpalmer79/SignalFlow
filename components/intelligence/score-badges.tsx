import { Badge } from "@/components/ui/badge";
import type {
  ConsentSummary,
  IntelligencePriority,
  IntentClassification,
} from "@/lib/types/intelligence";

const priorityVariant: Record<
  IntelligencePriority,
  "danger" | "warning" | "muted"
> = {
  high: "danger",
  medium: "warning",
  low: "muted",
};

export function PriorityBadge({ priority }: { priority: IntelligencePriority }) {
  return (
    <Badge variant={priorityVariant[priority]}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
    </Badge>
  );
}

const intentVariant: Record<
  IntentClassification,
  "primary" | "success" | "warning" | "muted"
> = {
  "Purchase Intent": "success",
  "Appointment Intent": "success",
  Engaged: "primary",
  Interested: "primary",
  "Reactivation Opportunity": "warning",
  Researching: "muted",
  "Needs Human Review": "warning",
};

export function IntentBadge({ intent }: { intent: IntentClassification }) {
  return <Badge variant={intentVariant[intent]}>{intent}</Badge>;
}

const consentVariant: Record<
  ConsentSummary,
  { label: string; variant: "success" | "danger" | "warning" }
> = {
  allowed: { label: "Consent allowed", variant: "success" },
  blocked: { label: "Consent blocked", variant: "danger" },
  review: { label: "Consent review", variant: "warning" },
};

export function ConsentBadge({ summary }: { summary: ConsentSummary }) {
  const meta = consentVariant[summary];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
