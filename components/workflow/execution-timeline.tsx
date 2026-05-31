import { Card, CardContent } from "@/components/ui/card";
import type { TimelineRow } from "@/lib/execution/execution-timeline";

const resultTone: Record<string, string> = {
  Executed: "text-success",
  Blocked: "text-danger",
  Escalated: "text-warning",
  Skipped: "text-muted-foreground",
  Planned: "text-muted-foreground",
};

export function ExecutionTimeline({ rows }: { rows: TimelineRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        No execution steps were simulated.
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-center gap-3 px-4 py-3"
            >
              <span className="col-span-2 font-mono text-xs text-muted-foreground">
                {row.clock}
              </span>
              <span className="col-span-3 text-sm font-medium">
                {row.action}
              </span>
              <span
                className={`col-span-2 text-xs font-semibold ${resultTone[row.result] ?? "text-foreground"}`}
              >
                {row.result}
              </span>
              <span className="col-span-5 truncate text-xs text-muted-foreground">
                {row.reason}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
