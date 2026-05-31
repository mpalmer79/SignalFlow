import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  Bell,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { SignalCard } from "@/components/signal-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { AuditEventCard } from "@/components/audit-event-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import {
  IntentBadge,
  PriorityBadge,
} from "@/components/intelligence/score-badges";
import { communicationStatusStyles } from "@/lib/config/status";
import { severityStyles } from "@/lib/config/outcome-status";
import { leakLabel } from "@/lib/analytics/revenue-leak-engine";
import {
  getDashboardData,
  getShowcaseSummary,
} from "@/lib/services/dashboard-service";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const {
    metrics,
    followUpQueue,
    highIntentOpportunities,
    blockedActions,
    voiceQueue,
    recentAudit,
    verticalPacks,
    intelligence,
    workflow,
    revenue,
  } = await getDashboardData();

  const showcase = await getShowcaseSummary();

  return (
    <>
      <SectionHeading
        title="Revenue command center"
        description="A live view of signals, consent-aware actions, and pipeline movement. Data is served from the database in demo mode."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active signals"
          value={String(metrics.totalSignals)}
          hint="Across all verticals"
          icon={Bell}
        />
        <MetricCard
          label="High-intent opportunities"
          value={String(metrics.highIntentCount)}
          hint="Intent score 60 and above"
          icon={Target}
          tone="success"
        />
        <MetricCard
          label="Consent blocked actions"
          value={String(metrics.blockedActions)}
          hint="Held by the policy layer"
          icon={ShieldAlert}
          tone="warning"
        />
        <MetricCard
          label="Detected opportunities"
          value={String(metrics.detectedOpportunityCount)}
          hint="Found by the detection engine"
          icon={Sparkles}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Top intent customers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {intelligence.topIntent.map((s, index) => (
              <Link
                key={s.customerId}
                href={`/intelligence/${s.customerId}`}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  {s.customerName}
                </span>
                <Badge variant="primary">{s.intentScore}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-success" />
              Top revenue opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {intelligence.topOpportunities.map((s, index) => (
              <Link
                key={s.customerId}
                href={`/intelligence/${s.customerId}`}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  {s.customerName}
                </span>
                <Badge variant="success">{s.opportunityScore}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success" />
              Recently detected opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {intelligence.detectedOpportunities.length > 0 ? (
              intelligence.detectedOpportunities.map((opp) => (
                <Link
                  key={`${opp.customerId}-${opp.type}-${opp.sourceSignalId}`}
                  href={`/intelligence/${opp.customerId}`}
                  className="block rounded-md border border-border bg-secondary/30 p-2.5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {opp.type}
                    </span>
                    <Badge variant="success">{opp.confidence}%</Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {opp.customerName}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState message="No opportunities detected." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customers requiring attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {intelligence.needingAttention.length > 0 ? (
              intelligence.needingAttention.map((s) => (
                <Link
                  key={s.customerId}
                  href={`/intelligence/${s.customerId}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-2.5 transition-colors hover:border-primary/40"
                >
                  <span className="text-sm font-medium">{s.customerName}</span>
                  <div className="flex items-center gap-2">
                    <IntentBadge intent={s.intentLevel} />
                    <PriorityBadge priority={s.priority} />
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState message="No customers require attention." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers at risk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {intelligence.atRisk.length > 0 ? (
              intelligence.atRisk.map((s) => (
                <Link
                  key={s.customerId}
                  href={`/intelligence/${s.customerId}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-2.5 transition-colors hover:border-primary/40"
                >
                  <span className="text-sm font-medium">{s.customerName}</span>
                  <Badge variant="danger">
                    {s.riskCount} risk {s.riskCount === 1 ? "flag" : "flags"}
                  </Badge>
                </Link>
              ))
            ) : (
              <EmptyState message="No customers flagged at risk." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Workflow orchestration</h2>
          <Link
            href="/orchestrator"
            className="text-xs text-primary hover:underline"
          >
            View orchestrator
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Workflow runs"
            value={String(workflow.totalRuns)}
            hint="Persisted simulations"
            icon={Workflow}
          />
          <MetricCard
            label="Actions executed"
            value={String(workflow.actionsExecuted)}
            hint="Simulated, nothing sent"
            icon={Zap}
            tone="success"
          />
          <MetricCard
            label="Policy blocks"
            value={String(workflow.actionsBlocked)}
            hint="Actions held by policy"
            icon={ShieldAlert}
            tone="warning"
          />
          <MetricCard
            label="Completion rate"
            value={`${workflow.completionRate}%`}
            hint={`${workflow.actionsEscalated} escalations`}
            icon={CheckCircle2}
            tone="success"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Revenue outcomes</h2>
          <Link
            href="/revenue-engine"
            className="text-xs text-primary hover:underline"
          >
            View revenue engine
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Revenue influenced"
            value={formatCurrency(revenue.revenueInfluenced)}
            hint="Gross influence estimate"
            icon={Banknote}
            tone="success"
          />
          <MetricCard
            label="Recovered opportunities"
            value={String(revenue.recoveredOpportunities)}
            hint="Workflows that recovered value"
            icon={RotateCcw}
            tone="success"
          />
          <MetricCard
            label="Missed opportunity estimate"
            value={formatCurrency(revenue.missedEstimate)}
            hint={`${revenue.criticalMissed} critical`}
            icon={TrendingDown}
            tone="warning"
          />
          <MetricCard
            label="Workflows with positive outcomes"
            value={`${revenue.positiveWorkflows} / ${revenue.totalWorkflows}`}
            hint="Outcome score 50 and above"
            icon={TrendingUp}
          />
          <MetricCard
            label="Customers reactivated"
            value={String(revenue.customersReactivated)}
            hint="Dormant to reactivated"
            icon={Sparkles}
            tone="success"
          />
          <MetricCard
            label="Policy blocks with revenue impact"
            value={String(revenue.criticalMissed)}
            hint="Critical missed estimates"
            icon={ShieldAlert}
            tone="warning"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Industry simulation</h2>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/scenarios" className="text-primary hover:underline">
              Scenarios
            </Link>
            <Link
              href="/simulation-center"
              className="text-primary hover:underline"
            >
              Simulation center
            </Link>
            <Link
              href="/executive-insights"
              className="text-primary hover:underline"
            >
              Executive insights
            </Link>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {showcase.topScenarios.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/scenarios/${scenario.id}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-2.5 transition-colors hover:border-primary/40"
                >
                  <span className="truncate text-sm font-medium">
                    {scenario.title}
                  </span>
                  <Badge variant="muted" className="capitalize">
                    {scenario.vertical.replace("-", " ")}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Industry comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {showcase.industryComparison.map((row) => (
                <div
                  key={row.vertical}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm">{row.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(row.revenueInfluenced)} ({row.completionRate}%)
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue leak summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {showcase.revenueLeaks.length > 0 ? (
                showcase.revenueLeaks.map((leak) => (
                  <div
                    key={leak.leakType}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm">{leakLabel(leak.leakType)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(leak.estimatedImpact)}
                      </span>
                      <Badge variant={severityStyles[leak.severity].variant}>
                        {severityStyles[leak.severity].label}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No revenue leaks detected.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Follow-up queue</h2>
          {followUpQueue.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {followUpQueue.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          ) : (
            <EmptyState message="No follow-up ready signals." />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold">High-intent opportunities</h2>
          {highIntentOpportunities.length > 0 ? (
            <div className="space-y-4">
              {highIntentOpportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <EmptyState message="No high-intent opportunities yet." />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Consent blocked actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockedActions.length > 0 ? (
              blockedActions.map((comm) => (
                <div
                  key={comm.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {comm.customerName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {comm.subject}
                    </p>
                  </div>
                  <StatusBadge status={communicationStatusStyles[comm.status]} />
                </div>
              ))
            ) : (
              <EmptyState message="No blocked actions." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulated voice follow-up queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {voiceQueue.length > 0 ? (
              voiceQueue.map((comm) => (
                <div
                  key={comm.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{comm.customerName}</p>
                    <StatusBadge
                      status={communicationStatusStyles[comm.status]}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {comm.preview}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState message="No voice follow-ups queued." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vertical pack status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {verticalPacks.slice(0, 6).map((pack) => (
              <div
                key={pack.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm">{pack.name}</span>
                <Badge
                  variant={pack.phaseStatus === "mvp-focus" ? "success" : "muted"}
                >
                  {pack.phaseStatus === "mvp-focus"
                    ? "MVP focus"
                    : pack.phaseStatus.replace("-", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent audit activity</h2>
          {recentAudit.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              Updated {formatRelativeTime(recentAudit[0].occurredAt)}
            </span>
          ) : null}
        </div>
        {recentAudit.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {recentAudit.map((event) => (
              <AuditEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState message="No audit activity recorded." />
        )}
      </div>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
      {message}
    </p>
  );
}
