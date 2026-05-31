import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IntentBadge } from "@/components/intelligence/score-badges";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { SignalExplorerRow } from "@/lib/services/intelligence-service";
import type { IntelligencePriority } from "@/lib/types/intelligence";

const priorityVariant: Record<
  IntelligencePriority,
  "danger" | "warning" | "muted"
> = {
  high: "danger",
  medium: "warning",
  low: "muted",
};

export function SignalExplorer({ rows }: { rows: SignalExplorerRow[] }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <Card key={row.signalId}>
          <CardContent className="grid gap-3 p-4 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Raw signal
              </p>
              <p className="text-sm font-medium">{row.rawLabel}</p>
              <p className="text-xs text-muted-foreground">
                {row.customerName} ({formatRelativeTime(row.receivedAt)})
              </p>
            </div>

            <div className="hidden justify-center lg:col-span-1 lg:flex">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Normalized
              </p>
              <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-primary">
                {row.normalizedType}
              </code>
            </div>

            <div className="lg:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Intent
              </p>
              <IntentBadge intent={row.intent} />
            </div>

            <div className="lg:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Priority
              </p>
              <Badge variant={priorityVariant[row.priority]}>
                {row.priority}
              </Badge>
            </div>

            <div className="lg:col-span-12">
              <p className="text-xs text-muted-foreground">
                Recommended: {row.recommendedAction}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
