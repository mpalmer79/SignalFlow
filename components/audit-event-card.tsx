import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { auditOutcomeStyles } from "@/lib/config/status";
import { formatDateTime } from "@/lib/utils";
import type { AuditEvent } from "@/lib/types/audit";

export function AuditEventCard({ event }: { event: AuditEvent }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <code className="rounded bg-secondary px-2 py-1 font-mono text-xs text-primary">
            {event.type}
          </code>
          <StatusBadge status={auditOutcomeStyles[event.outcome]} />
        </div>

        <div className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Customer</span>
            <p className="text-foreground">{event.customerName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Signal</span>
            <p className="text-foreground">{event.signalId ?? "Not linked"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Policy decision</span>
            <p className="text-foreground">{event.policyDecision}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Action</span>
            <p className="text-foreground">{event.action}</p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {formatDateTime(event.occurredAt)}
        </p>
      </CardContent>
    </Card>
  );
}
