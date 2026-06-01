import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Bell,
  BrainCircuit,
  ClipboardCheck,
  Clock,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Lock,
  PhoneCall,
  Radar,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  X,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { appConfig } from "@/lib/config/app";

// The marketing homepage, ported from design-system/ui-kits/marketing into the
// production app. Light enterprise direction: off-white canvas, deep-navy ink,
// #2563EB primary, Geist type, with the soft ambient scroll wash and selective
// navy accents for command-center depth. Deterministic and demo safe: no live
// communication, no external model calls, no real customer data.

const pillars = [
  {
    icon: Bell,
    tone: "blue" as const,
    title: "Customer signals",
    body: "New leads, missed calls, cancellations, and recall opportunities are captured as structured signals.",
  },
  {
    icon: BrainCircuit,
    tone: "indigo" as const,
    title: "Intelligence graph",
    body: "Every customer becomes a unified record of channels, consent, recent signals, opportunities, and risk.",
  },
  {
    icon: GitBranch,
    tone: "blue" as const,
    title: "Action graph",
    body: "A deterministic decision flow scores intent, checks consent, picks a channel, and chooses next best action.",
  },
  {
    icon: ShieldCheck,
    tone: "green" as const,
    title: "Consent-aware policy",
    body: "Every action passes a check for consent, quiet hours, and vertical sensitivity before anything is simulated.",
  },
  {
    icon: Sparkles,
    tone: "blue" as const,
    title: "Governed AI",
    body: "Recommendations carry a confidence score and a full explanation, routed through a human review queue.",
  },
  {
    icon: Banknote,
    tone: "green" as const,
    title: "Outcomes and attribution",
    body: "Decisions and actions produce audit events, connecting signals and policy to revenue outcomes.",
  },
];

const toneClasses: Record<string, string> = {
  blue: "bg-primary/10 text-primary",
  indigo: "bg-indigo-50 text-indigo-500",
  green: "bg-success/10 text-success",
};

const crmGaps = [
  "Traditional CRMs store records but wait for a human to decide what happens next.",
  "Activity is logged after the fact instead of driving the next action in real time.",
  "Consent and compliance live in scattered fields, not an enforced policy layer.",
  "Channels are siloed, so SMS, email, and voice rarely act as one coordinated follow-up.",
];

const systemModel = [
  "Signal received",
  "Intelligence updated",
  "Intent scored",
  "Consent checked",
  "Channel chosen",
  "Action orchestrated",
  "Outcome recorded",
];

const verticals = ["Automotive", "Insurance", "Healthcare", "Home Services"];

const pipeline = [
  { icon: Bell, color: "#0EA5E9", label: "Signal" },
  { icon: BrainCircuit, color: "#6366F1", label: "Intel" },
  { icon: Sparkles, color: "#2563EB", label: "AI" },
  { icon: ClipboardCheck, color: "#D97706", label: "Review" },
  { icon: Workflow, color: "#0891B2", label: "Flow" },
  { icon: Banknote, color: "#16A34A", label: "Revenue" },
];

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div className="marketing-wash relative min-h-screen">
      <div aria-hidden="true" className="marketing-top-fade" />
      <SiteNav />
      <Hero />
      <LogoStrip />
      <Pillars />
      <NotJustCRM />
      <CommandCenterBand />
      <SafetyStrip />
      <SiteFooter />
    </div>
  );
}

function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="Go to SignalFlow home"
          className="-m-1 rounded-md p-1 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo />
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          <a
            href="#platform"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Platform
          </a>
          <a
            href="#pipeline"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#crm"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Why not a CRM
          </a>
          <a
            href="#safety"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Demo safety
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden h-9 items-center rounded-md border border-border-strong bg-card px-4 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="relative overflow-hidden px-6 pb-14 pt-20">
      <div className="pointer-events-none absolute inset-0 hero-grid" />
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[760px] -translate-x-1/2 hero-glow" />
      <div className="relative mx-auto max-w-3xl text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[12.5px] font-semibold text-primary shadow-sm">
          <Radio className="h-3.5 w-3.5" />
          AI-native revenue platform
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-foreground sm:text-5xl">
          Turn customer signals into{" "}
          <span className="text-primary">governed revenue actions</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {appConfig.name} reads customer signals, scores intent, and
          orchestrates the next best action with consent, explanation, and human
          review at the center. A CRM records. {appConfig.name} acts.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/demo"
            className="inline-flex h-12 items-center gap-2 rounded-[9px] bg-primary px-6 text-[15px] font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            Run the 60-second demo
            <ArrowRight className="h-[17px] w-[17px]" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center rounded-[9px] border border-border-strong bg-card px-6 text-[15px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
          >
            Open dashboard
          </Link>
        </div>
        <p className="mt-[18px] text-[12.5px] text-muted-foreground/90">
          Deterministic demo. No live SMS, email, or voice. No external model
          calls. No real customer data.
        </p>
        <ProductMock />
      </div>
    </header>
  );
}

function ProductMock() {
  return (
    <div className="mx-auto mt-12 max-w-[1000px] overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xl">
      <div className="flex h-10 items-center gap-4 border-b border-border bg-secondary px-4">
        <div className="flex gap-[7px]">
          <span className="h-[11px] w-[11px] rounded-full bg-border-strong" />
          <span className="h-[11px] w-[11px] rounded-full bg-border-strong" />
          <span className="h-[11px] w-[11px] rounded-full bg-border-strong" />
        </div>
        <div className="flex h-6 max-w-[360px] flex-1 items-center gap-[7px] rounded-md border border-border bg-card px-2.5 font-mono text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          app.signalflow.io/dashboard
        </div>
      </div>
      <div className="grid min-h-[420px] grid-cols-1 sm:grid-cols-[188px_1fr]">
        <aside className="hidden border-r border-border bg-card p-3 sm:block">
          {[
            { icon: LayoutDashboard, label: "Dashboard", on: true },
            { icon: Radar, label: "Command Center", on: false },
            { icon: Sparkles, label: "AI Center", on: false },
            { icon: ClipboardCheck, label: "Review Queue", on: false },
            { icon: PhoneCall, label: "Voice", on: false },
            { icon: Gauge, label: "Executive", on: false },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-xs font-medium ${
                  item.on
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <ItemIcon className="h-[15px] w-[15px]" />
                {item.label}
              </div>
            );
          })}
        </aside>
        <div className="bg-background p-[18px]">
          <p className="text-[15px] font-semibold text-foreground">
            Revenue command center
          </p>
          <p className="mb-3.5 mt-0.5 font-mono text-[11.5px] text-muted-foreground">
            Deterministic view. Nothing sent.
          </p>
          <div className="mb-3.5 grid grid-cols-3 gap-2.5">
            {[
              { l: "Influenced", v: "$1.24M", d: "+18%", warn: false },
              { l: "High intent", v: "38", d: "+6", warn: false },
              { l: "In review", v: "7", d: "pending", warn: true },
            ].map((m) => (
              <div
                key={m.l}
                className="rounded-[10px] border border-border bg-card p-3"
              >
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {m.l}
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-foreground">
                  {m.v}
                </p>
                <p
                  className={`mt-[3px] flex items-center gap-[3px] text-[9.5px] ${
                    m.warn ? "text-warning" : "text-success"
                  }`}
                >
                  {m.warn ? (
                    <Clock className="h-[11px] w-[11px]" />
                  ) : (
                    <TrendingUp className="h-[11px] w-[11px]" />
                  )}
                  {m.d}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-[10px] border border-border bg-card p-4">
            <p className="mb-3.5 text-[11px] font-semibold text-muted-foreground">
              Signal to revenue pipeline
            </p>
            <div className="flex items-start">
              {pipeline.map((node, index) => {
                const NodeIcon = node.icon;
                return (
                  <div
                    key={node.label}
                    className="relative flex flex-1 flex-col items-center gap-[7px]"
                  >
                    {index < pipeline.length - 1 ? (
                      <span className="absolute left-1/2 top-4 -z-0 h-[2px] w-full bg-border-strong" />
                    ) : null}
                    <span
                      className="z-10 flex h-8 w-8 items-center justify-center rounded-[9px] text-white"
                      style={{ background: node.color }}
                    >
                      <NodeIcon className="h-[15px] w-[15px]" />
                    </span>
                    <span className="text-[9.5px] font-semibold text-foreground">
                      {node.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoStrip() {
  return (
    <div className="border-y border-border bg-card py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6">
        <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          Built for revenue teams in
        </span>
        {verticals.map((vertical) => (
          <span
            key={vertical}
            className="text-base font-bold tracking-tight text-muted-foreground/60"
          >
            {vertical}
          </span>
        ))}
      </div>
    </div>
  );
}

function Pillars() {
  return (
    <section id="platform" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-wide text-primary">
            Core platform
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
            Six durable concepts hold the platform together
          </h2>
          <p className="mt-4 text-pretty text-[17px] leading-relaxed text-muted-foreground">
            From signal to revenue, every stage is deterministic, explainable,
            and governed, so the platform can decide and act without losing the
            audit trail.
          </p>
        </div>
        <div className="mt-11 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const PillarIcon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-[14px] border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-card-hover"
              >
                <span
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[pillar.tone]}`}
                >
                  <PillarIcon className="h-[22px] w-[22px]" />
                </span>
                <h3 className="mb-[7px] text-base font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                  {pillar.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NotJustCRM() {
  return (
    <section
      id="crm"
      className="border-y border-border bg-card/60 px-6 py-20"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-wide text-primary">
            Not just another CRM
          </p>
          <h2 className="text-balance text-[34px] font-semibold leading-[1.14] tracking-tight text-foreground">
            A system of action, not a system of record
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {appConfig.name} does not wait for someone to remember to follow up.
            It reads signals, applies policy, and orchestrates the next best
            action while keeping consent and compliance at the center.
          </p>
          <ul className="mt-[22px] flex flex-col gap-3.5">
            {crmGaps.map((gap) => (
              <li
                key={gap}
                className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
              >
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] bg-danger/10 text-danger">
                  <X className="h-[13px] w-[13px]" />
                </span>
                {gap}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[18px] bg-foreground p-7 shadow-xl">
          <p className="mb-[18px] text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-300">
            {appConfig.name} system model
          </p>
          {systemModel.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-3.5 border-b border-white/10 py-[11px] last:border-b-0"
            >
              <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-sky-300/15 font-mono text-xs font-semibold text-sky-300">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-[#E8EEF8]">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommandCenterBand() {
  return (
    <section id="pipeline" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[22px] bg-foreground p-12 text-center sm:p-[52px]">
          <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[420px] w-[760px] -translate-x-1/2 opacity-50 hero-glow" />
          <div className="relative">
            <h2 className="text-balance text-[34px] font-semibold tracking-tight text-white">
              One screen, signal to revenue
            </h2>
            <p className="mx-auto mt-3.5 max-w-xl text-base leading-relaxed text-[#B6C2D6]">
              The Revenue Command Center walks a single customer from signal to
              intelligence to AI recommendation to human review to workflow to
              revenue, with a full mission replay.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/revenue-command-center"
                className="inline-flex h-12 items-center gap-2 rounded-[9px] bg-primary px-6 text-[15px] font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
              >
                Launch command center
                <ArrowRight className="h-[17px] w-[17px]" />
              </Link>
              <Link
                href="/scenarios/automotive-high-intent"
                className="inline-flex h-12 items-center rounded-[9px] border border-white/20 bg-white/[0.06] px-6 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
              >
                View the walkthrough
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SafetyStrip() {
  return (
    <section id="safety" className="px-6 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start gap-4 rounded-[14px] border border-warning/40 bg-warning/10 p-6 sm:flex-row sm:items-center">
          <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] border border-warning/40 bg-card text-warning">
            <ShieldCheck className="h-[21px] w-[21px]" />
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-warning">
              Demo-safe by design
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-warning/90">
              {appConfig.name} sends no live SMS, email, or voice, makes no
              external model calls, and uses no real customer data. Every
              scenario and simulation is deterministic with mock providers.
            </p>
          </div>
          <Link
            href="/provider-management"
            className="inline-flex h-9 items-center rounded-md border border-border-strong bg-card px-4 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
          >
            Read the safety boundaries
          </Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card py-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6">
        <div className="flex items-center gap-3">
          <LogoMark size={26} />
          <span className="text-[12.5px] text-muted-foreground">
            {appConfig.name}, {appConfig.subtitle}. Deterministic demo.
          </span>
        </div>
        <div className="flex gap-[22px]">
          <a
            href="#platform"
            className="text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Platform
          </a>
          <Link
            href="/docs/ARCHITECTURE.md"
            className="text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Architecture
          </Link>
          <Link
            href="/docs/AI_PLATFORM.md"
            className="text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            AI Platform
          </Link>
          <Link
            href="/docs/VOICE_PLATFORM.md"
            className="text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Voice Platform
          </Link>
        </div>
      </div>
    </footer>
  );
}
