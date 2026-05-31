import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionGraphView } from "./action-graph-view";
import { PolicyDecisions } from "./policy-decisions";
import { ExecutionTimeline } from "./execution-timeline";
import { WorkflowOutcomeBadge } from "./workflow-outcome-badge";
import { buildExecutionTimeline } from "@/lib/execution/execution-timeline";
import type { WorkflowPlan } from "@/lib/types/orchestrator";

export function WorkflowPlanView({ plan }: { plan: WorkflowPlan }) {
  const timeline = buildExecutionTimeline(plan.execution.steps);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-sm font-semibold">{plan.title}</p>
            <p className="text-xs text-muted-foreground">{plan.trigger}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">
              {plan.execution.actionsExecuted} executed
            </Badge>
            <Badge variant="muted">
              {plan.execution.actionsBlocked} blocked
            </Badge>
            <Badge variant="muted">
              {plan.execution.actionsEscalated} escalated
            </Badge>
            <WorkflowOutcomeBadge outcome={plan.execution.outcome} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Action graph</h3>
          <ActionGraphView plan={plan.plan} />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Policy decisions</h3>
          <PolicyDecisions plan={plan.plan} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Execution timeline</h3>
        <ExecutionTimeline rows={timeline} />
      </div>

      {!plan.validation.valid ? (
        <Card className="border-danger/40">
          <CardHeader>
            <CardTitle>Validation issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {plan.validation.issues.map((issue) => (
              <p key={issue} className="text-xs text-danger">
                {issue}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
