import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ACTION_LABELS } from "@/lib/action-graph/action-node";
import { policyOutcomeStyles } from "@/lib/config/workflow-status";
import { orderedNodes } from "@/lib/action-graph/action-plan";
import type { ActionPlan, PolicyOutcome } from "@/lib/types/orchestrator";

// Derive the policy outcome shown per node from its allowed and status fields.
function nodeOutcome(allowed: boolean, status: string): PolicyOutcome {
  if (allowed) return "allowed";
  if (status === "escalated") return "needs-review";
  return "blocked";
}

export function PolicyDecisions({ plan }: { plan: ActionPlan }) {
  const nodes = orderedNodes(plan);

  return (
    <div className="space-y-2">
      {nodes.map((node) => {
        const outcome = nodeOutcome(node.allowed, node.status);
        const style = policyOutcomeStyles[outcome];
        return (
          <Card key={node.id}>
            <CardContent className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {ACTION_LABELS[node.actionType]}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {node.blockedReason ?? "Consent present, action allowed."}
                </p>
              </div>
              <Badge variant={style.variant}>{style.label}</Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
