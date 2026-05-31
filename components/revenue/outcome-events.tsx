import { Badge } from "@/components/ui/badge";
import { outcomeLabel, outcomeVariant } from "@/lib/config/outcome-status";
import type { OutcomeEventRecord } from "@/lib/types/outcome-records";

export function OutcomeEvents({
  events,
}: {
  events: OutcomeEventRecord[];
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        No outcome events recorded.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {outcomeLabel(event.outcomeType)}
            </p>
            <p className="text-xs text-muted-foreground">{event.reason}</p>
          </div>
          <Badge variant={outcomeVariant(event.outcomeType)}>
            {event.confidence}%
          </Badge>
        </div>
      ))}
    </div>
  );
}
