import {
  AlertTriangle,
  Bell,
  GitBranch,
  MessageSquare,
  ScrollText,
  Sparkles,
  Wand2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { CustomerTimelineEntry } from "@/lib/services/customer-service";
import type { LucideIcon } from "lucide-react";

const kindMeta: Record<
  CustomerTimelineEntry["kind"],
  { label: string; icon: LucideIcon; tone: string }
> = {
  signal: { label: "Signal", icon: Bell, tone: "bg-primary/15 text-primary" },
  communication: {
    label: "Communication",
    icon: MessageSquare,
    tone: "bg-secondary text-secondary-foreground",
  },
  audit: {
    label: "Audit",
    icon: ScrollText,
    tone: "bg-muted text-muted-foreground",
  },
  opportunity: {
    label: "Opportunity",
    icon: GitBranch,
    tone: "bg-success/15 text-success",
  },
  "detected-opportunity": {
    label: "Detected opportunity",
    icon: Sparkles,
    tone: "bg-success/15 text-success",
  },
  recommendation: {
    label: "Recommendation",
    icon: Wand2,
    tone: "bg-primary/15 text-primary",
  },
  risk: {
    label: "Risk flag",
    icon: AlertTriangle,
    tone: "bg-warning/15 text-warning",
  },
};

export function Timeline({ entries }: { entries: CustomerTimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No timeline activity recorded for this customer.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {entries.map((entry) => {
        const meta = kindMeta[entry.kind];
        const Icon = meta.icon;
        return (
          <li key={`${entry.kind}-${entry.id}`} className="flex gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{entry.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(entry.occurredAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {meta.label}: {entry.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
