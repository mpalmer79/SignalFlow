import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttributionList } from "@/components/revenue/attribution-list";
import { getRevenueOverview } from "@/lib/services/revenue-engine-service";
import { listCustomers } from "@/lib/services/customer-service";
import { guardPage } from "@/lib/auth/guard-page";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Revenue Engine" };
export const dynamic = "force-dynamic";

export default async function RevenueEnginePage() {
  const { context, denied } = await guardPage("VIEW_REVENUE");
  if (denied) return denied;

  const [overview, customers] = await Promise.all([
    getRevenueOverview(context),
    listCustomers(context),
  ]);

  const { metrics, memory } = overview;

  return (
    <>
      <SectionHeading
        title="Revenue engine"
        description="How customer signals become revenue outcomes. Every number is computed deterministically from persisted workflow runs. No revenue is real and nothing is sent."
        actions={<Badge variant="warning">Demo estimates</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Revenue influenced"
          value={formatCurrency(metrics.revenueInfluenced)}
          hint="Gross influence estimate"
          icon={Banknote}
          tone="success"
        />
        <MetricCard
          label="Recovered opportunities"
          value={String(metrics.recoveredOpportunities)}
          hint="Workflows that recovered value"
          icon={RotateCcw}
          tone="success"
        />
        <MetricCard
          label="Missed opportunity estimate"
          value={formatCurrency(metrics.missedEstimate)}
          hint={`${metrics.criticalMissed} critical`}
          icon={TrendingDown}
          tone="warning"
        />
        <MetricCard
          label="Positive workflows"
          value={`${metrics.positiveWorkflows} / ${metrics.totalWorkflows}`}
          hint="Outcome score 50 and above"
          icon={TrendingUp}
        />
        <MetricCard
          label="Customers reactivated"
          value={String(metrics.customersReactivated)}
          hint="Dormant to reactivated"
          icon={Sparkles}
          tone="success"
        />
        <MetricCard
          label="Average outcome score"
          value={String(overview.effectiveness.averageOutcomeScore)}
          hint="Across all workflow runs"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Outcome memory by vertical</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {memory.byVertical.map((vertical) => (
              <div
                key={vertical.vertical}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize">
                    {vertical.vertical.replace("-", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vertical.positiveRuns} of {vertical.runs} runs positive,
                    average score {vertical.averageOutcomeScore}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(vertical.revenueInfluenced)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions that move revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {memory.topActions.slice(0, 6).map((action) => (
              <div
                key={action.actionType}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm">{action.actionType}</span>
                <span className="text-xs text-muted-foreground">
                  {action.runs} runs, {formatCurrency(action.revenueInfluenced)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top revenue attribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AttributionList attributions={overview.topAttributions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signal to revenue stories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Open a customer to walk the full path from signal to intelligence
              to workflow to outcome and revenue.
            </p>
            {customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/revenue-engine/${customer.id}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
              >
                <span className="text-sm font-medium">{customer.name}</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
