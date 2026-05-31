import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Sparkles,
  TrendingDown,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/metric-card";
import { getJourneyReplay } from "@/lib/services/revenue-command-center-service";
import type {
  JourneyKind,
  JourneyStep,
} from "@/lib/services/revenue-command-center-service";
import { guardPage } from "@/lib/auth/guard-page";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mission Replay",
};
export const dynamic = "force-dynamic";

const STEP_STYLES: Record<
  JourneyKind,
  { label: string; icon: LucideIcon; tone: string; ring: string }
> = {
  signal: {
    label: "Signal",
    icon: Bell,
    tone: "text-primary",
    ring: "bg-primary/15 text-primary",
  },
  intelligence: {
    label: "Intelligence",
    icon: BrainCircuit,
    tone: "text-primary",
    ring: "bg-primary/15 text-primary",
  },
  recommendation: {
    label: "Recommendation",
    icon: Sparkles,
    tone: "text-primary",
    ring: "bg-primary/15 text-primary",
  },
  review: {
    label: "Review",
    icon: ClipboardCheck,
    tone: "text-warning",
    ring: "bg-warning/15 text-warning",
  },
  workflow: {
    label: "Workflow",
    icon: Workflow,
    tone: "text-primary",
    ring: "bg-primary/15 text-primary",
  },
  outcome: {
    label: "Outcome",
    icon: CheckCircle2,
    tone: "text-success",
    ring: "bg-success/15 text-success",
  },
  attribution: {
    label: "Revenue",
    icon: Banknote,
    tone: "text-success",
    ring: "bg-success/15 text-success",
  },
  missed: {
    label: "Missed",
    icon: TrendingDown,
    tone: "text-warning",
    ring: "bg-warning/15 text-warning",
  },
};

export default async function MissionReplayPage({
  params,
}: {
  params: { customerId: string };
}) {
  const { context, denied } = await guardPage("VIEW_REVENUE");
  if (denied) return denied;

  const replay = await getJourneyReplay(context, params.customerId);
  if (!replay) {
    notFound();
  }

  const { customer, intelligence, steps, totalAttributed, positiveOutcomes } =
    replay;

  return (
    <>
      <Link
        href="/revenue-command-center"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to revenue command center
      </Link>

      <SectionHeading
        title={`${customer.name}: mission replay`}
        description="A deterministic, end to end replay of one customer's lifecycle. Nothing is sent and no revenue is real."
        actions={
          <Badge variant="muted" className="capitalize">
            {customer.vertical.replace("-", " ")}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Intent score"
          value={String(intelligence.intentScore)}
          hint={`Priority ${intelligence.priority}`}
          icon={BrainCircuit}
        />
        <MetricCard
          label="Recommendations"
          value={String(replay.recommendationCount)}
          hint={`${replay.workflowCount} workflow runs`}
          icon={Sparkles}
        />
        <MetricCard
          label="Positive outcomes"
          value={String(positiveOutcomes)}
          hint="Replied, advanced, won, or scheduled"
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Revenue attributed"
          value={formatCurrency(totalAttributed)}
          hint="Influenced, recovered, assisted"
          icon={Banknote}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mission timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {steps.length > 0 ? (
            <ol className="space-y-3">
              {steps.map((step) => (
                <ReplayRow key={`${step.order}-${step.kind}`} step={step} />
              ))}
            </ol>
          ) : (
            <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No lifecycle events recorded for this customer.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Continue the story</p>
            <p className="text-sm text-muted-foreground">
              Open the customer intelligence profile, the revenue engine story,
              or the AI center to dig deeper.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
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
            <Link
              href="/ai-center"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              AI center
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function ReplayRow({ step }: { step: JourneyStep }) {
  const style = STEP_STYLES[step.kind];
  const Icon = style.icon;
  const body = (
    <li className="flex items-start gap-3 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs ${style.ring}`}
      >
        {step.order}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Icon className={`h-4 w-4 ${style.tone}`} />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {style.label}
          </span>
          {step.badge ? (
            <Badge variant="muted" className="capitalize">
              {step.badge.replace(/-/g, " ").replace(/_/g, " ")}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm font-semibold">{step.title}</p>
        <p className="text-xs text-muted-foreground">{step.detail}</p>
        <p className="text-[11px] text-muted-foreground">
          {formatDateTime(step.occurredAt)}
        </p>
      </div>
    </li>
  );
  return step.href ? (
    <Link href={step.href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
