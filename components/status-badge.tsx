import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { StatusStyle } from "@/lib/config/status";

interface StatusBadgeProps {
  status: StatusStyle;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={status.variant as BadgeProps["variant"]} className={className}>
      {status.label}
    </Badge>
  );
}
