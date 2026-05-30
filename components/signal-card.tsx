import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { consentStateStyles, priorityStyles } from "@/lib/config/status";
import { formatRelativeTime } from "@/lib/utils";
import type { Signal } from "@/lib/types/signal";

const channelLabels: Record<string, string> = {
  sms: "SMS",
  email: "Email",
  voice: "Voice",
  human: "Human task",
};

export function SignalCard({ signal }: { signal: Signal }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{signal.label}</p>
            <p className="text-xs text-muted-foreground">
              {signal.customerName} via {signal.source}
            </p>
          </div>
          <StatusBadge status={priorityStyles[signal.priority]} />
        </div>

        <p className="text-sm text-muted-foreground">{signal.detail}</p>

        <div className="rounded-md border border-border bg-secondary/40 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Recommended next action
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{signal.recommendedAction}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Suggested channel: {channelLabels[signal.recommendedChannel]}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge status={consentStateStyles[signal.consentStatus]} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatRelativeTime(signal.receivedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
