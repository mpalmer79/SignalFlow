import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { severityStyles } from "@/lib/config/outcome-status";
import { formatCurrency } from "@/lib/utils";
import type { MissedOpportunityRecord } from "@/lib/types/outcome-records";

export function MissedOpportunityList({
  missed,
  showCustomer = false,
}: {
  missed: MissedOpportunityRecord[];
  showCustomer?: boolean;
}) {
  if (missed.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        No missed opportunities estimated.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {missed.map((item) => {
        const style = severityStyles[item.severity];
        return (
          <div
            key={item.id}
            className="rounded-md border border-border bg-secondary/30 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div className="min-w-0">
                  {showCustomer ? (
                    <p className="text-sm font-medium">{item.customerName}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                  <p className="mt-1 text-xs text-foreground">
                    Recovery: {item.recommendedRecoveryAction}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-semibold">
                  {formatCurrency(item.estimatedValue)}
                </span>
                <Badge variant={style.variant}>{style.label}</Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
