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
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
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
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils";

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

const PROVES = [
  {
    icon: BrainCircuit,
    title: "Deterministic intelligence",
    body: "The same signals always produce the same intelligence profile, recommendation, and confidence. No model variance.",
  },
  {
    icon: ClipboardCheck,
    title: "Human governance",
    body: "An AI recommendation never becomes an action automatically. A human approves, rejects, or escalates before any workflow runs.",
  },
  {
    icon: ShieldCheck,
    title: "Consent and policy enforced",
    body: "Every action is evaluated against consent, quiet hours, and vertical sensitivity before execution. Blocks and escalations are recorded.",
  },
  {
    icon: Banknote,
    title: "Revenue attribution by run",
    body: "Only executed workflows attribute revenue. The same run produces influenced, recovered, assisted, or prevented-loss attribution deterministically.",
  },
];

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

  const firstStep = steps[0];
  const lastStep = steps[steps.length - 1];

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
        description="A deterministic, end to end replay of one customer lifecycle. No live communication is sent and no revenue is real."
        actions={
          <Badge variant="muted" className="capitalize">
            {customer.vertical.replace("-", " ")}
          </Badge>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary" />
            Customer context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ContextRow
              label="Vertical pack"
              value={customer.vertical.replace("-", " ")}
              capitalize
            />
            <ContextRow
              label="Active opportunity"
              value={customer.activeOpportunity ?? "None tracked"}
            />
            <ContextRow
              label="Preferred channel"
              value={customer.preferredChannel}
              capitalize
            />
            <ContextRow
              label="Last action"
              value={customer.lastAction}
              hint={formatRelativeTime(customer.lastActionAt)}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant={customer.optedOut ? "danger" : "success"}>
              {customer.optedOut ? "Opted out" : "Consent on file"}
            </Badge>
            {customer.riskFlags.length > 0 ? (
              <Badge variant="warning">
                {customer.riskFlags.length} risk flag
                {customer.riskFlags.length === 1 ? "" : "s"}
              </Badge>
            ) : (
              <Badge variant="muted">No risk flags</Badge>
            )}
            {firstStep ? (
              <Badge variant="muted">
                Started {formatRelativeTime(firstStep.occurredAt)}
              </Badge>
            ) : null}
            {lastStep && lastStep !== firstStep ? (
              <Badge variant="muted">
                Last activity {formatRelativeTime(lastStep.occurredAt)}
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

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
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              <p>No lifecycle events recorded for this customer.</p>
              <Link
                href="/revenue-command-center"
                className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
              >
                Try another customer
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            What this proves
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {PROVES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="space-y-1 rounded-md border border-border bg-secondary/30 p-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.body}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Continue the story</p>
            <p className="text-sm text-muted-foreground">
              Open the customer intelligence profile, the revenue engine
              breakdown, or the AI center to dig deeper.
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

function ContextRow({
  label,
  value,
  hint,
  capitalize,
}: {
  label: string;
  value: string;
  hint?: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-sm font-medium ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </p>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
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
