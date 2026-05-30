import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { opportunityStageStyles } from "@/lib/config/status";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { Opportunity } from "@/lib/types/opportunity";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-tight">
              {opportunity.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {opportunity.customerName}
            </p>
          </div>
          <span className="text-sm font-semibold">
            {formatCurrency(opportunity.estimatedValue)}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Intent score</span>
            <span className="font-medium text-foreground">
              {opportunity.intentScore}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${opportunity.intentScore}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {opportunity.owner}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(opportunity.updatedAt)}
          </span>
        </div>

        <StatusBadge status={opportunityStageStyles[opportunity.stage]} />
      </CardContent>
    </Card>
  );
}
