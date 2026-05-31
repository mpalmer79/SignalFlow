import { ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreMeter } from "@/components/score-meter";
import { WorkflowOutcomeBadge } from "./workflow-outcome-badge";
import { ExecutionTimeline } from "./execution-timeline";
import { ACTION_LABELS } from "@/lib/action-graph/action-node";
import {
  actionStatusStyles,
  policyOutcomeStyles,
} from "@/lib/config/workflow-status";
import type { TimelineRow } from "@/lib/execution/execution-timeline";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";

export function WorkflowRunView({
  run,
  timeline,
}: {
  run: WorkflowRunRecord;
  timeline: TimelineRow[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-sm font-semibold">{run.title}</p>
            <p className="text-xs text-muted-foreground">{run.trigger}</p>
          </div>
          <WorkflowOutcomeBadge outcome={run.outcome} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Driving scores
            </p>
            <ScoreMeter label="Intent" score={run.intentScore} tone="intent" />
            <ScoreMeter
              label="Opportunity"
              score={run.opportunityScore}
              tone="opportunity"
            />
            <ScoreMeter
              label="Engagement"
              score={run.engagementScore}
              tone="engagement"
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Action graph</h3>
          <div className="space-y-2">
            {run.actions.map((action, index) => {
              const status = actionStatusStyles[action.status];
              const policy = policyOutcomeStyles[action.policyOutcome];
              return (
                <div key={`${action.order}-${action.actionType}`}>
                  <Card
                    className={
                      action.status === "executed"
                        ? "border-success/30"
                        : action.status === "blocked"
                          ? "border-danger/30"
                          : "border-border"
                    }
                  >
                    <CardContent className="flex items-start justify-between gap-3 p-3">
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {String(action.order).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {ACTION_LABELS[action.actionType]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {action.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant={policy.variant}>{policy.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  {index < run.actions.length - 1 ? (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Execution timeline</h3>
        <ExecutionTimeline rows={timeline} />
      </div>
    </div>
  );
}
