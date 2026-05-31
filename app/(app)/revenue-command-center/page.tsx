import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  History,
  RotateCcw,
  ShieldQuestion,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCommandCenterOverview } from "@/lib/services/revenue-command-center-service";
import { guardPage } from "@/lib/auth/guard-page";
import {
  attributionStyles,
  outcomeLabel,
  outcomeVariant,
  severityStyles,
} from "@/lib/config/outcome-status";
import { reviewStateStyles } from "@/lib/config/ai-status";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Revenue Command Center",
};
export const dynamic = "force-dynamic";

const LIFECYCLE = [
  { label: "Signal", icon: Bell, tone: "text-primary" },
  { label: "Intelligence", icon: BrainCircuit, tone: "text-primary" },
  { label: "Recommendation", icon: Sparkles, tone: "text-primary" },
  { label: "Review", icon: ClipboardCheck, tone: "text-warning" },
  { label: "Workflow", icon: Workflow, tone: "text-primary" },
  { label: "Outcome", icon: CheckCircle2, tone: "text-success" },
  { label: "Revenue", icon: Banknote, tone: "text-success" },
];

export default async function RevenueCommandCenterPage() {
  const { context, denied } = await guardPage("VIEW_REVENUE");
  if (denied) return denied;

  const overview = await getCommandCenterOverview(context);
  const {
    summary,
    funnel,
    recentRecommendations,
    recentWorkflowRuns,
    recentOutcomes,
    recentAudit,
    topAttributions,
    topMissed,
    topVerticals,
    customers,
  } = overview;

  const featuredCustomers = customers.slice(0, 6);
  const completionRate =
    summary.totalOutcomeRuns > 0
      ? Math.round((summary.positiveOutcomes / summary.totalOutcomeRuns) * 100)
      : 0;
  const approvalRate =
    summary.recommendations > 0
      ? Math.round((summary.approvedRecommendations / summary.recommendations) * 100)
      : 0;

  return (
    <>
      <SectionHeading
        title="Revenue command center"
        description="One screen, one story. Signal to intelligence to AI recommendation to human review to workflow to outcome to revenue. Every figure is derived from persistence."
        actions={
          <Badge variant="warning">Deterministic, demo safe</Badge>
        }
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="space-y-4 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Revenue lifecycle
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {LIFECYCLE.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <Icon className={`h-4 w-4 ${step.tone}`} />
                    {step.label}
                  </span>
                  {index < LIFECYCLE.length - 1 ? (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            AI recommendations never become actions automatically. A human
            approves each one before a workflow runs, and only executed
            workflows attribute revenue.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Executive summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Customers in intelligence"
            value={String(summary.customers)}
            hint={`${summary.openOpportunities} open opportunities`}
            icon={Users}
          />
          <MetricCard
            label="Signals received"
            value={String(summary.signals)}
            hint="Persisted across all verticals"
            icon={Bell}
          />
          <MetricCard
            label="Recommendations generated"
            value={String(summary.recommendations)}
            hint={`${approvalRate}% approval, ${summary.pendingReview} pending`}
            icon={BrainCircuit}
          />
          <MetricCard
            label="Workflow runs"
            value={String(summary.workflowRuns)}
            hint={`${completionRate}% positive`}
            icon={Workflow}
            tone="success"
          />
          <MetricCard
            label="Revenue influenced"
            value={formatCurrency(summary.revenueInfluenced)}
            hint={`${summary.recoveredOpportunities} recovered`}
            icon={Banknote}
            tone="success"
          />
          <MetricCard
            label="Reactivations"
            value={String(summary.reactivations)}
            hint="Dormant to reactivated"
            icon={RotateCcw}
            tone="success"
          />
          <MetricCard
            label="Missed opportunity value"
            value={formatCurrency(summary.missedOpportunityValue)}
            hint={`${summary.criticalMissed} critical`}
            icon={TrendingDown}
            tone="warning"
          />
          <MetricCard
            label="Average AI confidence"
            value={`${
              summary.recommendations > 0
                ? Math.round(
                    (summary.approvedRecommendations /
                      Math.max(summary.recommendations, 1)) *
                      100,
                  )
                : 0
            }%`}
            hint="Approval as a confidence proxy"
            icon={Gauge}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Revenue funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map((stage) => (
              <div key={stage.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold tracking-tight">
                      {stage.count}
                    </span>
                    {stage.pctOfPrevious !== null ? (
                      <Badge variant="muted">
                        {stage.pctOfPrevious}% of prev
                      </Badge>
                    ) : null}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.max(stage.pctOfTop ?? 0, 4)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{stage.hint}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-success" />
              Top revenue verticals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topVerticals.length > 0 ? (
              topVerticals.map((row) => (
                <div
                  key={row.vertical}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium capitalize">
                      {row.vertical.replace("-", " ")}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(row.revenueInfluenced)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {row.positiveRuns} of {row.runs} workflow runs positive
                  </p>
                </div>
              ))
            ) : (
              <EmptyHint message="No vertical outcomes yet." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Customer journey explorer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Open any customer to replay the full lifecycle: signal, intelligence,
            recommendation, review, workflow, outcome, and revenue attribution.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCustomers.map((customer) => (
              <Link
                key={customer.id}
                href={`/revenue-command-center/replay/${customer.id}`}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {customer.name}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {customer.vertical.replace("-", " ")}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              </Link>
            ))}
          </div>
          {customers.length > featuredCustomers.length ? (
            <Link
              href="/customers"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              See all {customers.length} customers
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI recommendation stream
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRecommendations.length > 0 ? (
              recentRecommendations.map((rec) => {
                const review = reviewStateStyles[rec.reviewState];
                return (
                  <Link
                    key={rec.id}
                    href={`/ai-center/${rec.id}`}
                    className="block rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {rec.recommendationLabel}
                      </span>
                      <Badge variant={review.variant}>{review.label}</Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {rec.customerName} ({rec.vertical.replace("-", " ")})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confidence {rec.confidence} ({rec.confidenceTier})
                    </p>
                  </Link>
                );
              })
            ) : (
              <EmptyHint message="No recommendations yet." />
            )}
            <Link
              href="/ai-center"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open AI center
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-primary" />
              Workflow activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentWorkflowRuns.length > 0 ? (
              recentWorkflowRuns.map((run) => (
                <Link
                  key={run.id}
                  href={`/orchestrator/${run.id}`}
                  className="block rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {run.title}
                    </span>
                    <Badge variant="muted" className="capitalize">
                      {run.outcome.replace(/-/g, " ")}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {run.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {run.actionsExecuted} executed, {run.actionsBlocked}{" "}
                    blocked, {run.actionsEscalated} escalated
                  </p>
                </Link>
              ))
            ) : (
              <EmptyHint message="No workflow runs yet." />
            )}
            <Link
              href="/orchestrator"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open orchestrator
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Outcome feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOutcomes.length > 0 ? (
              recentOutcomes.map((event) => (
                <div
                  key={event.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {outcomeLabel(event.outcomeType)}
                    </span>
                    <Badge variant={outcomeVariant(event.outcomeType)}>
                      {event.confidence}%
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {event.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.reason}
                  </p>
                </div>
              ))
            ) : (
              <EmptyHint message="No outcomes recorded yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-success" />
              Revenue attribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topAttributions.length > 0 ? (
              topAttributions.map((attribution) => (
                <div
                  key={attribution.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {attribution.customerName}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(attribution.attributedAmount)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={attributionStyles[attribution.attributionType].variant}
                    >
                      {attributionStyles[attribution.attributionType].label}
                    </Badge>
                    <p className="truncate text-xs text-muted-foreground">
                      {attribution.reason}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyHint message="No attributions yet." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              Missed revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topMissed.length > 0 ? (
              topMissed.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {item.customerName}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.estimatedValue)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={severityStyles[item.severity].variant}>
                      {severityStyles[item.severity].label}
                    </Badge>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyHint message="No missed revenue tracked." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldQuestion className="h-4 w-4 text-warning" />
              Recent audit activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAudit.length > 0 ? (
              recentAudit.map((event) => (
                <div
                  key={event.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {event.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.occurredAt)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {event.action}
                  </p>
                </div>
              ))
            ) : (
              <EmptyHint message="No audit activity yet." />
            )}
            <Link
              href="/audit"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open audit trail
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Mission replay mode</p>
            <p className="text-sm text-muted-foreground">
              Pick a customer and watch the complete deterministic story play
              out, from inbound signal to recorded revenue.
            </p>
          </div>
          {featuredCustomers[0] ? (
            <Link
              href={`/revenue-command-center/replay/${featuredCustomers[0].id}`}
            >
              <Button>
                Start mission replay
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/executive-insights"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Executive insights
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/revenue-engine"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Revenue engine detail
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/review-queue"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Review queue
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/simulation-center"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Simulation center
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
}

function EmptyHint({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
      {message}
    </p>
  );
}
