import { Mail, MessageSquare, Phone, UserCog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { communicationStatusStyles } from "@/lib/config/status";
import { formatRelativeTime } from "@/lib/utils";
import type { Communication } from "@/lib/types/communication";
import type { Channel } from "@/lib/types/consent";
import type { LucideIcon } from "lucide-react";

const channelMeta: Record<Channel, { label: string; icon: LucideIcon }> = {
  sms: { label: "SMS", icon: MessageSquare },
  email: { label: "Email", icon: Mail },
  voice: { label: "Voice", icon: Phone },
  human: { label: "Human task", icon: UserCog },
};

export function CommunicationCard({
  communication,
}: {
  communication: Communication;
}) {
  const meta = channelMeta[communication.channel];
  const Icon = meta.icon;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium">{communication.subject}</p>
              <p className="text-xs text-muted-foreground">
                {meta.label} to {communication.customerName}
              </p>
            </div>
          </div>
          <StatusBadge
            status={communicationStatusStyles[communication.status]}
          />
        </div>

        <p className="text-sm text-muted-foreground">{communication.preview}</p>

        <div className="flex items-center justify-between">
          <Badge variant="muted">Simulated record</Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(communication.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
