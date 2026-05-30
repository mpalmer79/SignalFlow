import { Mail, MessageSquare, Phone, UserCog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { consentStateStyles } from "@/lib/config/status";
import { formatRelativeTime } from "@/lib/utils";
import type { Customer } from "@/lib/types/customer";
import type { Channel } from "@/lib/types/consent";
import type { LucideIcon } from "lucide-react";

const channelIcon: Record<Channel, LucideIcon> = {
  sms: MessageSquare,
  email: Mail,
  voice: Phone,
  human: UserCog,
};

const riskVariant = {
  info: "muted",
  warning: "warning",
  critical: "danger",
} as const;

export function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{customer.name}</p>
            <p className="text-xs capitalize text-muted-foreground">
              {customer.vertical.replace("-", " ")}
            </p>
          </div>
          {customer.optedOut ? (
            <Badge variant="danger">Opted out</Badge>
          ) : (
            <Badge variant="muted">
              Prefers {customer.preferredChannel}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {customer.channels.map((channel) => {
            const Icon = channelIcon[channel.channel];
            return (
              <span
                key={channel.channel}
                className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="capitalize">{channel.channel}</span>
                <StatusBadge status={consentStateStyles[channel.consent]} />
              </span>
            );
          })}
        </div>

        <div className="grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <p className="font-medium uppercase tracking-wide text-muted-foreground">
              Recent signals
            </p>
            <ul className="mt-1 space-y-0.5 text-foreground">
              {customer.recentSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <div>
              <p className="font-medium uppercase tracking-wide text-muted-foreground">
                Active opportunity
              </p>
              <p className="mt-1 text-foreground">
                {customer.activeOpportunity ?? "None"}
              </p>
            </div>
            <div>
              <p className="font-medium uppercase tracking-wide text-muted-foreground">
                Last action
              </p>
              <p className="mt-1 text-foreground">
                {customer.lastAction} ({formatRelativeTime(customer.lastActionAt)})
              </p>
            </div>
          </div>
        </div>

        {customer.riskFlags.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            {customer.riskFlags.map((flag) => (
              <Badge key={flag.label} variant={riskVariant[flag.severity]}>
                {flag.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
