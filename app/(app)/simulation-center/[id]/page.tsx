import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CalendarCheck,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { outcomeLabel, outcomeVariant } from "@/lib/config/outcome-status";
import {
  getSimulationResult,
  getSimulations,
} from "@/lib/services/simulation-service";
import { formatCurrency } from "@/lib/utils";
import type { OutcomeType } from "@/lib/types/outcome";

export const metadata: Metadata = { title: "Simulation" };

export function generateStaticParams() {
  return getSimulations().map((simulation) => ({ id: simulation.id }));
}

export default function SimulationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = getSimulationResult(params.id);

  if (!result) {
    notFound();
  }

  const { config, metrics, outcomeBreakdown } = result;

  return (
    <>
      <Link
        href="/simulation-center"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to simulation center
      </Link>

      <SectionHeading
        title={config.title}
        description={`${config.summary} All ${config.count} customers were generated and assessed deterministically.`}
        actions={
          <Badge variant="muted" className="capitalize">
            {config.vertical.replace("-", " ")}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Customers"
          value={String(metrics.customers)}
          hint="Generated for this run"
          icon={Users}
        />
        <MetricCard
          label="Appointments generated"
          value={String(metrics.appointmentsGenerated)}
          hint="Across the population"
          icon={CalendarCheck}
          tone="success"
        />
        <MetricCard
          label="Revenue influenced"
          value={formatCurrency(metrics.revenueInfluenced)}
          hint="Gross influence estimate"
          icon={Banknote}
          tone="success"
        />
        <MetricCard
          label="Missed opportunity value"
          value={formatCurrency(metrics.missedOpportunityValue)}
          hint="Value at risk"
          icon={TrendingDown}
          tone="warning"
        />
        <MetricCard
          label="Workflow completion rate"
          value={`${metrics.workflowCompletionRate}%`}
          hint="Runs completed in full"
          icon={TrendingUp}
        />
        <MetricCard
          label="Policy blocks"
          value={String(metrics.policyBlocks)}
          hint={`${metrics.escalations} escalations`}
          icon={ShieldAlert}
          tone="warning"
        />
        <MetricCard
          label="Average intent score"
          value={String(metrics.averageIntentScore)}
          hint="Across the population"
          icon={TrendingUp}
        />
        <MetricCard
          label="Average opportunity score"
          value={String(metrics.averageOpportunityScore)}
          hint="Across the population"
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outcome breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {outcomeBreakdown.map((row) => (
            <div
              key={row.outcomeType}
              className="flex items-center justify-between gap-3"
            >
              <Badge variant={outcomeVariant(row.outcomeType as OutcomeType)}>
                {outcomeLabel(row.outcomeType as OutcomeType)}
              </Badge>
              <span className="text-sm font-medium tabular-nums">
                {row.count}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
