import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { IntentBadge, PriorityBadge } from "@/components/intelligence/score-badges";
import type { CustomerIntelligenceSummary } from "@/lib/services/intelligence-service";

export function IntelligenceTable({
  summaries,
}: {
  summaries: CustomerIntelligenceSummary[];
}) {
  if (summaries.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No customer intelligence available. Run the seed script to load demo data.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {summaries.map((summary) => (
        <Link key={summary.customerId} href={`/intelligence/${summary.customerId}`}>
          <Card className="transition-colors hover:border-primary/40">
            <CardContent className="grid gap-3 p-4 sm:grid-cols-12 sm:items-center">
              <div className="sm:col-span-4">
                <p className="text-sm font-medium">{summary.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  Top action: {summary.topAction}
                </p>
              </div>
              <div className="sm:col-span-3">
                <IntentBadge intent={summary.intentLevel} />
              </div>
              <ScoreCell label="Intent" value={summary.intentScore} />
              <ScoreCell label="Opp" value={summary.opportunityScore} />
              <ScoreCell label="Engage" value={summary.engagementScore} />
              <div className="sm:col-span-1 sm:text-right">
                <PriorityBadge priority={summary.priority} />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="sm:col-span-1">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
