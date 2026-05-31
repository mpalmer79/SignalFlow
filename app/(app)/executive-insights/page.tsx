import type { Metadata } from "next";
import {
  Banknote,
  Crown,
  Droplets,
  Gauge,
  RotateCcw,
  Signal,
  TriangleAlert,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getExecutiveInsights } from "@/lib/services/analytics-service";
import { leakLabel } from "@/lib/analytics/revenue-leak-engine";
import { severityStyles, attributionStyles } from "@/lib/config/outcome-status";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Executive Insights" };
export const dynamic = "force-dynamic";

export default async function ExecutiveInsightsPage() {
  const insights = await getExecutiveInsights();
  const { summary } = insights;

  return (
    <>
      <SectionHeading
        title="Executive insights"
        description="A revenue leader view of what SignalFlow influenced, where revenue is leaking, and which workflows perform. All figures are deterministic demo estimates."
        actions={<Badge variant="warning">Demo estimates</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Revenue influenced"
          value={formatCurrency(summary.revenueInfluenced)}
          hint="Gross influence estimate"
          icon={Banknote}
          tone="success"
        />
        <MetricCard
          label="Recovered opportunities"
          value={String(summary.recoveredOpportunities)}
          hint="Workflows that recovered value"
          icon={RotateCcw}
          tone="success"
        />
        <MetricCard
          label="Reactivations"
          value={String(summary.topReactivationCount)}
          hint="Dormant to reactivated"
          icon={RotateCcw}
        />
        <MetricCard
          label="Policy friction"
          value={String(summary.policyFrictionScore)}
          hint="Blocked and escalated actions"
          icon={Gauge}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
              <Crown className="h-5 w-5" />
            </span>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Highest performing workflow
            </p>
            <p className="text-sm font-semibold">
              {summary.highestPerformingWorkflow}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Signal className="h-5 w-5" />
            </span>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Most valuable signal outcome
            </p>
            <p className="text-sm font-semibold">
              {summary.mostValuableSignalType}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Droplets className="h-5 w-5" />
            </span>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Largest revenue leak
            </p>
            <p className="text-sm font-semibold">{summary.largestRevenueLeak}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-warning" />
              Revenue leak detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.leaks.length > 0 ? (
              insights.leaks.map((leak) => (
                <div
                  key={leak.leakType}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {leakLabel(leak.leakType)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatCurrency(leak.estimatedImpact)}
                      </span>
                      <Badge variant={severityStyles[leak.severity].variant}>
                        {severityStyles[leak.severity].label}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {leak.count} affected. {leak.recoveryRecommendation}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No revenue leaks detected.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.workflowInsights.map((workflow) => (
              <div
                key={workflow.title}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {workflow.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {workflow.runs} runs, score {workflow.averageOutcomeScore}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(workflow.revenueInfluenced)}
                </span>
              </div>
            ))}
            {insights.mostExpensiveFailure ? (
              <p className="pt-1 text-xs text-muted-foreground">
                Most expensive failure: {insights.mostExpensiveFailure.title}.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Opportunity insights by vertical</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.opportunityInsights.map((row) => (
              <div
                key={row.vertical}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm capitalize">
                  {row.vertical.replace("-", " ")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {row.influenced} of {row.total} influenced ({row.conversionRate}%)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attribution mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.attributionInsights.map((row) => (
              <div
                key={row.type}
                className="flex items-center justify-between gap-3"
              >
                <Badge variant={attributionStyles[row.type].variant}>
                  {attributionStyles[row.type].label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {row.count} at {formatCurrency(row.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
