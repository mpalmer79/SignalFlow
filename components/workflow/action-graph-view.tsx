import { ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ACTION_LABELS } from "@/lib/action-graph/action-node";
import { actionStatusStyles } from "@/lib/config/workflow-status";
import { orderedNodes } from "@/lib/action-graph/action-plan";
import type { ActionPlan } from "@/lib/types/orchestrator";

export function ActionGraphView({ plan }: { plan: ActionPlan }) {
  const nodes = orderedNodes(plan);

  return (
    <div className="mx-auto max-w-xl space-y-2">
      {nodes.map((node, index) => {
        const status = actionStatusStyles[node.status];
        const edge = plan.edges.find((e) => e.from === node.id);
        return (
          <div key={node.id}>
            <Card
              className={
                node.allowed ? "border-success/30" : "border-danger/30"
              }
            >
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {ACTION_LABELS[node.actionType]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {node.blockedReason ?? node.reason}
                    </p>
                  </div>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </CardContent>
            </Card>
            {index < nodes.length - 1 ? (
              <div className="flex flex-col items-center py-1 text-xs text-muted-foreground">
                <ArrowDown className="h-4 w-4" />
                {edge ? <span>{edge.label}</span> : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
