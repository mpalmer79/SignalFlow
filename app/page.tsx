import Link from "next/link";
import {
  ArrowRight,
  Bell,
  FlaskConical,
  Gauge,
  GitBranch,
  Layers,
  PlayCircle,
  Radio,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { appConfig } from "@/lib/config/app";
import { listVerticalPacks } from "@/lib/services/vertical-pack-service";
import { getScenarios } from "@/lib/services/scenario-service";
import { getAllSimulationResults } from "@/lib/services/simulation-service";
import { formatCurrency } from "@/lib/utils";

const pillars = [
  {
    icon: Bell,
    title: "Customer signals",
    body: "Inbound events such as new leads, missed calls, cancellations, and recall opportunities are captured as structured signals.",
  },
  {
    icon: Layers,
    title: "Customer intelligence graph",
    body: "Every customer becomes a unified record of channels, consent, recent signals, opportunities, and risk flags.",
  },
  {
    icon: GitBranch,
    title: "Action graph",
    body: "A deterministic decision flow scores intent, checks consent, chooses a channel, and decides the next best action.",
  },
  {
    icon: ShieldCheck,
    title: "Consent-aware orchestration",
    body: "Every action passes a policy check for consent, quiet hours, and vertical sensitivity before anything is simulated.",
  },
  {
    icon: Workflow,
    title: "Multi-channel follow-up",
    body: "SMS, email, voice, and human tasks are coordinated as one workflow with clear stop conditions on opt-out.",
  },
  {
    icon: Radio,
    title: "Auditability and outcomes",
    body: "Every decision and action produces an audit event, connecting signals to policy decisions and revenue outcomes.",
  },
];

const crmGaps = [
  "Traditional CRMs store records but wait for a human to decide what happens next.",
  "Activity is logged after the fact instead of driving the next action in real time.",
  "Consent and compliance live in scattered fields rather than an enforced policy layer.",
  "Channels are siloed, so SMS, email, and voice rarely act as one coordinated follow-up.",
];

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const verticalPacks = await listVerticalPacks();
  const scenarios = getScenarios().slice(0, 6);
  const simulations = getAllSimulationResults();
  const totalInfluenced = simulations.reduce(
    (sum, sim) => sum + sim.metrics.revenueInfluenced,
    0,
  );
  const totalCustomers = simulations.reduce(
    (sum, sim) => sum + sim.metrics.customers,
    0,
  );
  const systemSteps = [
    "Signal received",
    "Intelligence updated",
    "Intent scored",
    "Consent checked",
    "Channel chosen",
    "Action orchestrated",
    "Outcome recorded",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" />
      <div className="pointer-events-none absolute inset-0 glow-radial" />

      <div className="relative">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Radio className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{appConfig.name}</p>
              <p className="text-[11px] text-muted-foreground">
                Revenue Operating System
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Open dashboard
          </Link>
        </header>

        <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center sm:pt-20">
          <Badge variant="primary" className="mx-auto">
            AI-native revenue platform
          </Badge>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Turn customer signals into timely, consent-aware revenue actions.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            {appConfig.name} is an {appConfig.subtitle.toLowerCase()}. It unifies
            customer signals, an intelligence graph, and a consent-aware action
            graph to drive multi-channel follow-up across voice, SMS, email, and
            human tasks.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className={buttonVariants({ size: "lg" })}
            >
              Explore the command center
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Watch the walkthrough
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Deterministic demo. No live outbound communication, no external model
            calls, and no real customer data.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                Not just another CRM
              </h2>
              <p className="text-sm text-muted-foreground">
                A CRM is a system of record. {appConfig.name} is a system of
                action. It does not wait for someone to remember to follow up. It
                reads signals, applies policy, and orchestrates the next best
                action while keeping consent and compliance at the center.
              </p>
              <ul className="space-y-2">
                {crmGaps.map((gap) => (
                  <li
                    key={gap}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                    {gap}
                  </li>
                ))}
              </ul>
            </div>

            <Card>
              <CardContent className="space-y-4 p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  SignalFlow system model
                </p>
                <ol className="space-y-2">
                  {systemSteps.map((step, index) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 font-mono text-xs text-primary">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-semibold tracking-tight">
            Core platform pillars
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Six durable concepts hold the platform together as integrations
            evolve from mocked to live.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title}>
                  <CardContent className="space-y-3 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-semibold">{pillar.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {pillar.body}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Vertical packs
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Industry packs extend the core with specific signals, actions, and
                compliance handling. Automotive is the initial MVP focus.
              </p>
            </div>
            <Link
              href="/vertical-packs"
              className="hidden text-sm text-primary hover:underline sm:block"
            >
              View all packs
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {verticalPacks.map((pack) => (
              <Card
                key={pack.id}
                className={
                  pack.phaseStatus === "mvp-focus" ? "border-primary/40" : ""
                }
              >
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{pack.name}</p>
                    {pack.phaseStatus === "mvp-focus" ? (
                      <Badge variant="success">MVP focus</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{pack.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Explore by industry
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Launch a complete, deterministic scenario and watch a customer
                signal become a revenue outcome. Pick an industry to begin.
              </p>
            </div>
            <Link
              href="/scenarios"
              className="hidden text-sm text-primary hover:underline sm:block"
            >
              All scenarios
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <Link key={scenario.id} href={`/scenarios/${scenario.id}`}>
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardContent className="flex h-full flex-col gap-2 p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <PlayCircle className="h-5 w-5" />
                      </span>
                      <Badge variant="muted" className="capitalize">
                        {scenario.vertical.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">{scenario.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {scenario.summary}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <p className="text-lg font-semibold">Simulation center</p>
                <p className="text-sm text-muted-foreground">
                  Run large multi-customer simulations across any vertical. In a
                  recent run, {totalCustomers} simulated customers produced
                  {" "}
                  {formatCurrency(totalInfluenced)} of influenced revenue,
                  computed deterministically with nothing sent.
                </p>
                <Link
                  href="/simulation-center"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Open the simulation center
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Gauge className="h-5 w-5" />
                </span>
                <p className="text-lg font-semibold">Executive insights</p>
                <p className="text-sm text-muted-foreground">
                  A revenue leader view of influenced revenue, recovered
                  opportunities, revenue leaks, and workflow performance. Built
                  for owners and managers, not just operators.
                </p>
                <Link
                  href="/executive-insights"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Open executive insights
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-semibold text-warning">
                    Demo-safe by design
                  </p>
                  <p className="text-sm text-warning/90">
                    SignalFlow sends no live SMS, email, or voice. Every scenario
                    and simulation is deterministic, with mock providers and no
                    real customer information.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className={buttonVariants({ size: "lg" })}
              >
                Enter the platform
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

        <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
          {appConfig.name}. {appConfig.subtitle}. Phase 0 foundation.
        </footer>
      </div>
    </div>
  );
}
