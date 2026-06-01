import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  History,
  PhoneCall,
  ShieldAlert,
  ShieldQuestion,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileReviewerBanner } from "@/components/device/mobile-reviewer-banner";
import { KpiCardGrid } from "@/components/revenue/kpi-card-grid";
import { buildKpiDrilldowns } from "@/lib/revenue/kpi-drilldown";
import { getCommandCenterOverview } from "@/lib/services/revenue-command-center-service";
import type { FeaturedJourneySnapshot } from "@/lib/services/revenue-command-center-service";
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
    featuredJourney,
    voice,
  } = overview;

  const featuredCustomerIds = new Set<string>();
  if (featuredJourney) featuredCustomerIds.add(featuredJourney.customer.id);
  const otherCustomers = customers
    .filter((c) => !featuredCustomerIds.has(c.id))
    .slice(0, 6);

  const lifecycleCounts: Record<string, number> = {
    signals: summary.signals,
    intelligence: summary.customers,
    recommendation: summary.recommendations,
    review:
      summary.approvedRecommendations +
      summary.pendingReview,
    workflow: summary.workflowRuns,
    outcome: summary.positiveOutcomes,
    attribution: funnel.find((f) => f.key === "attribution")?.count ?? 0,
  };

  const completionRate =
    summary.totalOutcomeRuns > 0
      ? Math.round((summary.positiveOutcomes / summary.totalOutcomeRuns) * 100)
      : 0;
  // Canonical approval rate: share of reviewed recommendations approved. This
  // matches the shared metric layer and the executive insights page so the
  // value does not drift across the app.
  const decidedRecommendations =
    summary.approvedRecommendations + (summary.rejectedRecommendations ?? 0);
  const approvalRate =
    decidedRecommendations > 0
      ? Math.round(
          (summary.approvedRecommendations / decidedRecommendations) * 100,
        )
      : 0;

  // Deterministic drill-down data for every KPI card across the three sections.
  // Built from the same persistence derived figures the cards display so the
  // breakdown rows always reconcile to the headline value.
  const kpiGroups = buildKpiDrilldowns({
    signals: summary.signals,
    recommendations: summary.recommendations,
    approvedRecommendations: summary.approvedRecommendations,
    rejectedRecommendations: summary.rejectedRecommendations,
    pendingReview: summary.pendingReview,
    revenueInfluenced: summary.revenueInfluenced,
    workflowRuns: summary.workflowRuns,
    positiveOutcomes: summary.positiveOutcomes,
    missedOpportunityValue: summary.missedOpportunityValue,
    criticalMissed: summary.criticalMissed,
    openOpportunities: summary.openOpportunities,
    customers: summary.customers,
    reactivations: summary.reactivations,
    recoveredOpportunities: summary.recoveredOpportunities,
    approvalRate,
    completionRate,
    lifecycleCounts,
  });

  return (
    <>
      <SectionHeading
        title="Revenue command center"
        description="One screen that tells the SignalFlow story end to end: how customer signals become governed AI recommendations, human reviewed workflows, recorded outcomes, and attributed revenue. Every figure is derived from persistence."
        actions={
          <Badge variant="warning">Deterministic, demo safe</Badge>
        }
      />

      <MobileReviewerBanner
        cta={
          featuredJourney
            ? { href: featuredJourney.replayHref, label: "Open the featured mission replay" }
            : { href: "/dashboard", label: "Back to dashboard" }
        }
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Today on SignalFlow
              </p>
              <p className="max-w-3xl text-base font-medium sm:text-lg">
                SignalFlow analyzed{" "}
                <span className="font-semibold">{summary.signals}</span> signals,
                produced{" "}
                <span className="font-semibold">{summary.recommendations}</span>{" "}
                governed AI recommendations, ran{" "}
                <span className="font-semibold">{summary.workflowRuns}</span>{" "}
                workflows, and attributed{" "}
                <span className="font-semibold">
                  {formatCurrency(summary.revenueInfluenced)}
                </span>{" "}
                of revenue. Nothing was sent.
              </p>
            </div>
            {featuredJourney ? (
              <Link href={featuredJourney.replayHref} className="self-start">
                <Button>
                  Start mission replay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : null}
          </div>
          <KpiCardGrid variant="hero" items={kpiGroups.today} />
        </CardContent>
      </Card>

      <Section
        title="Executive summary"
        subhead="Headline totals served from persistence, organization scoped."
      >
        <KpiCardGrid variant="small" items={kpiGroups.executive} />
      </Section>

      <Section
        title="Revenue lifecycle"
        subhead="What the system did between an inbound signal and attributed revenue. Counts are live."
      >
        <KpiCardGrid variant="lifecycle" items={kpiGroups.lifecycle} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Revenue funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map((stage) => (
              <div key={stage.key} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{stage.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold tracking-tight">
                      {stage.count}
                    </span>
                    {stage.pctOfPrevious !== null ? (
                      <Badge variant="muted">
                        {stage.pctOfPrevious}% of previous
                      </Badge>
                    ) : null}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(stage.pctOfTop ?? 0, 4)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{stage.hint}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Customer journey"
        subhead="Pick a customer and walk the full deterministic story. The featured journey is selected automatically from the customer with the richest activity."
      >
        {featuredJourney ? (
          <FeaturedJourneyCard journey={featuredJourney} />
        ) : (
          <EmptyHint message="No customers available yet. Run the seed script to generate demo data." />
        )}

        {otherCustomers.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Explore another customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {otherCustomers.map((customer) => (
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
              {customers.length > otherCustomers.length + 1 ? (
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
        ) : null}
      </Section>

      <Section
        title="AI governance"
        subhead="Every recommendation is scored, explained, and gated by human review before any workflow runs."
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI recommendation stream
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRecommendations.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {recentRecommendations.map((rec) => {
                  const review = reviewStateStyles[rec.reviewState];
                  return (
                    <Link
                      key={rec.id}
                      href={`/ai-center/${rec.id}`}
                      className="block rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 text-sm font-medium">
                          {rec.recommendationLabel}
                        </span>
                        <Badge variant={review.variant}>{review.label}</Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {rec.customerName} ({rec.vertical.replace("-", " ")})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence {rec.confidence} ({rec.confidenceTier})
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyHint
                message="No AI recommendations yet."
                action={{ href: "/ai-center", label: "Open AI center" }}
              />
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <Link
                href="/ai-center"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Open AI center
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/review-queue"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Open review queue
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Workflow execution"
        subhead="Workflow runs are simulated only. Actions that pass policy are executed, others are blocked or escalated to a human."
      >
        <div className="grid gap-4 lg:grid-cols-2">
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
                <EmptyHint
                  message="No workflow runs yet."
                  action={{ href: "/orchestrator", label: "Open orchestrator" }}
                />
              )}
            </CardContent>
          </Card>

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
        </div>
      </Section>

      <Section
        title="Voice follow-up"
        subhead="Simulated voice operations. No calls are placed and no provider is contacted. Every plan passes a deterministic compliance check before a call is simulated."
      >
        <p className="rounded-md border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
          All AI and voice outputs are generated through internal mock providers
          in demo mode. Live providers are disabled. See provider management for
          readiness and feature flags.
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-primary" />
              Voice command center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SmallStat
                label="Voice plans"
                value={String(voice.totalPlans)}
                hint={`${voice.allowed} allowed, ${voice.blocked} blocked`}
                icon={PhoneCall}
              />
              <SmallStat
                label="Calls simulated"
                value={String(voice.totalCalls)}
                hint={`${voice.needsReview} need review`}
                icon={PhoneCall}
              />
              <SmallStat
                label="Appointments from voice"
                value={String(voice.appointments)}
                hint={`${voice.positiveOutcomes} positive outcomes`}
                icon={CheckCircle2}
                tone="success"
              />
              <SmallStat
                label="Voice influenced revenue"
                value={formatCurrency(voice.influencedRevenue)}
                hint="Attributed from simulated calls"
                icon={Banknote}
                tone="success"
              />
            </div>
            <Link
              href="/voice-command-center"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open voice command center
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Outcomes and attribution"
        subhead="Where revenue moved, by vertical pack and by attribution type."
      >
        <div className="grid gap-4 lg:grid-cols-2">
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
      </Section>

      <Section
        title="Revenue leaks"
        subhead="Value at risk, ranked by severity. Every record carries a recommended recovery action."
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              Top missed revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topMissed.length > 0 ? (
              topMissed.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {item.customerName}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.estimatedValue)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant={severityStyles[item.severity].variant}>
                      {severityStyles[item.severity].label}
                    </Badge>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {item.reason}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recovery: {item.recommendedRecoveryAction}
                  </p>
                </div>
              ))
            ) : (
              <EmptyHint message="No missed revenue tracked." />
            )}
            <Link
              href="/executive-insights"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open executive insights
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Auditability"
        subhead="An immutable trail of every signal, policy decision, AI recommendation, review decision, and workflow action."
      >
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
                  <p className="line-clamp-2 text-xs text-muted-foreground">
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
      </Section>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Recommended demo path</p>
            <p className="text-sm text-muted-foreground">
              Start at the hero summary. Read the lifecycle stages. Open the
              featured mission replay. Then dig into the AI center or revenue
              engine if the reviewer wants depth.
            </p>
          </div>
          {featuredJourney ? (
            <Link href={featuredJourney.replayHref}>
              <Button>
                Open featured mission replay
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Related views:</span>
        <Link
          href="/executive-insights"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Executive insights
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/revenue-engine"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Revenue engine
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/simulation-center"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Simulation center
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </>
  );
}

function Section({
  title,
  subhead,
  children,
}: {
  title: string;
  subhead: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="max-w-3xl text-xs text-muted-foreground">{subhead}</p>
      </div>
      {children}
    </section>
  );
}

function SmallStat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning";
}) {
  const ring =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "warning"
        ? "bg-warning/15 text-warning"
        : "bg-primary/15 text-primary";
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${ring}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  );
}

function FeaturedJourneyCard({ journey }: { journey: FeaturedJourneySnapshot }) {
  const {
    customer,
    topOpportunity,
    latestSignal,
    topRecommendation,
    reviewerName,
    reviewerDecision,
    latestWorkflowRun,
    positiveOutcomeCount,
    latestOutcome,
    topAttribution,
    attributedTotal,
    replayHref,
  } = journey;
  const review = topRecommendation
    ? reviewStateStyles[topRecommendation.reviewState]
    : null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Featured journey: {customer.name}
          </span>
          <Badge variant="muted" className="capitalize">
            {customer.vertical.replace("-", " ")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Selected automatically as the customer with the richest activity. Open
          the mission replay for the full ordered timeline.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <JourneyTile
            icon={Bell}
            label="Latest signal"
            primary={latestSignal?.label ?? "No signals recorded"}
            secondary={latestSignal?.detail ?? "Waiting for inbound activity."}
            tone="primary"
          />
          <JourneyTile
            icon={TrendingUp}
            label="Top opportunity"
            primary={topOpportunity?.title ?? "No opportunity tracked"}
            secondary={
              topOpportunity
                ? `Stage: ${topOpportunity.stage.replace(/-/g, " ")}. Intent ${topOpportunity.intentScore}.`
                : "Open opportunities will surface here."
            }
            tone="primary"
          />
          <JourneyTile
            icon={Sparkles}
            label="AI recommendation"
            primary={topRecommendation?.recommendationLabel ?? "No recommendation yet"}
            secondary={
              topRecommendation
                ? `Confidence ${topRecommendation.confidence} (${topRecommendation.confidenceTier}).`
                : "Generated deterministically; no provider call."
            }
            tone="primary"
            badge={review?.label}
            badgeVariant={review?.variant}
          />
          <JourneyTile
            icon={ClipboardCheck}
            label="Human review"
            primary={
              reviewerName && reviewerDecision
                ? `${reviewerName} ${reviewerDecision.replace(/-/g, " ")}`
                : "Awaiting human review"
            }
            secondary="No recommendation becomes an action without a human decision."
            tone="warning"
          />
          <JourneyTile
            icon={Workflow}
            label="Workflow run"
            primary={latestWorkflowRun?.title ?? "No workflow yet"}
            secondary={
              latestWorkflowRun
                ? `${latestWorkflowRun.actionsExecuted} executed, ${latestWorkflowRun.actionsBlocked} blocked.`
                : "Approved recommendations drive a simulated workflow."
            }
            tone="primary"
          />
          <JourneyTile
            icon={CheckCircle2}
            label="Outcome"
            primary={
              latestOutcome
                ? outcomeLabel(latestOutcome.outcomeType)
                : "No outcomes yet"
            }
            secondary={
              latestOutcome
                ? `${positiveOutcomeCount} positive across this customer.`
                : "Outcomes are classified deterministically per run."
            }
            tone="success"
          />
          <JourneyTile
            icon={Banknote}
            label="Revenue attributed"
            primary={formatCurrency(attributedTotal)}
            secondary={
              topAttribution
                ? `Top: ${attributionStyles[topAttribution.attributionType].label}. ${topAttribution.reason}`
                : "No revenue attributed to this customer yet."
            }
            tone="success"
          />
          <JourneyTile
            icon={ShieldAlert}
            label="Risk and consent"
            primary={
              customer.optedOut
                ? "Customer opted out"
                : customer.riskFlags.length > 0
                  ? `${customer.riskFlags.length} risk flag${customer.riskFlags.length === 1 ? "" : "s"}`
                  : "No risk flags"
            }
            secondary="Policy enforces consent and quiet hours before any action."
            tone={customer.optedOut || customer.riskFlags.length > 0 ? "warning" : "primary"}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Link href={replayHref}>
            <Button size="sm">
              Open mission replay
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link
            href={`/intelligence/${customer.id}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Intelligence profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/revenue-engine/${customer.id}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Revenue story
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function JourneyTile({
  icon: Icon,
  label,
  primary,
  secondary,
  tone,
  badge,
  badgeVariant,
}: {
  icon: LucideIcon;
  label: string;
  primary: string;
  secondary: string;
  tone: "primary" | "success" | "warning";
  badge?: string;
  badgeVariant?: "primary" | "success" | "warning" | "danger" | "muted" | "outline" | "default";
}) {
  const ring =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "warning"
        ? "bg-warning/15 text-warning"
        : "bg-primary/15 text-primary";
  return (
    <div className="space-y-1.5 rounded-md border border-border bg-secondary/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded ${ring}`}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          {label}
        </span>
        {badge ? <Badge variant={badgeVariant ?? "muted"}>{badge}</Badge> : null}
      </div>
      <p className="text-sm font-medium">{primary}</p>
      <p className="text-xs text-muted-foreground">{secondary}</p>
    </div>
  );
}

function EmptyHint({
  message,
  action,
}: {
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
      <p>{message}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
        >
          {action.label}
          <ArrowRight className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}
