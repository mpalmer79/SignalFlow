import { Badge } from "@/components/ui/badge";
import { attributionStyles } from "@/lib/config/outcome-status";
import { formatCurrency } from "@/lib/utils";
import type { RevenueAttributionRecord } from "@/lib/types/outcome-records";

export function AttributionList({
  attributions,
}: {
  attributions: RevenueAttributionRecord[];
}) {
  if (attributions.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        No revenue attribution recorded.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {attributions.map((attribution) => {
        const style = attributionStyles[attribution.attributionType];
        return (
          <div
            key={attribution.id}
            className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant={style.variant}>{style.label}</Badge>
                <span className="text-sm font-semibold">
                  {formatCurrency(attribution.attributedAmount)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {attribution.reason}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {attribution.confidence}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
