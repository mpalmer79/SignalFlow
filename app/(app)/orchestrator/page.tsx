import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkflowOutcomeBadge } from "@/components/workflow/workflow-outcome-badge";
import {
  getWorkflowMetrics,
  listWorkflowRuns,
} from "@/lib/services/workflow-service";
import { guardPage } from "@/lib/auth/guard-page";
import { formatRelativeTime } from "@/lib/utils";
import { CheckCircle2, ShieldAlert, Workflow, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Orchestrator" };
export const dynamic = "force-dynamic";

export default async function OrchestratorPage() {
  const { context, denied } = await guardPage("VIEW_WORKFLOWS");
  if (denied) return denied;

  const [runs, metrics] = await Promise.all([
    listWorkflowRuns(context),
    getWorkflowMetrics(context),
  ]);

  return (
    <>
      <SectionHeading
        title="Follow-up orchestrator"
        description="Simulated workflow runs generated from customer intelligence. Every action passes policy evaluation. Nothing is sent."
        actions={<Badge variant="warning">Simulation only</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Workflow runs"
          value={String(metrics.totalRuns)}
          hint="Persisted simulations"
          icon={Workflow}
        />
        <MetricCard
          label="Actions executed"
          value={String(metrics.actionsExecuted)}
          hint="Simulated, nothing sent"
          icon={Zap}
          tone="success"
        />
        <MetricCard
          label="Actions blocked"
          value={String(metrics.actionsBlocked)}
          hint="Held by the policy layer"
          icon={ShieldAlert}
          tone="warning"
        />
        <MetricCard
          label="Completion rate"
          value={`${metrics.completionRate}%`}
          hint="Runs completed in full"
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Active workflow runs</h2>
        {runs.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {runs.map((run) => (
              <Link key={run.id} href={`/orchestrator/${run.id}`}>
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{run.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {run.customerName} ({formatRelativeTime(run.createdAt)})
                        </p>
                      </div>
                      <WorkflowOutcomeBadge outcome={run.outcome} />
                    </div>
                    <p className="text-xs text-muted-foreground">{run.trigger}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="muted">
                        {run.actionsExecuted} executed
                      </Badge>
                      <Badge variant="muted">
                        {run.actionsBlocked} blocked
                      </Badge>
                      <Badge variant="muted">
                        {run.actionsEscalated} escalated
                      </Badge>
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-primary">
                        View run
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No workflow runs found. Run the seed script to generate simulations.
          </p>
        )}
      </div>
    </>
  );
}
