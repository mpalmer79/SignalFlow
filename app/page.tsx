import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Banknote,
  Bell,
  BrainCircuit,
  GitBranch,
  Radio,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { appConfig } from "@/lib/config/app";

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

const showcaseScenarios = [
  {
    id: "automotive-retail",
    vertical: "automotive",
    eyebrow: "Automotive retail",
    headline:
      "The trade-in request came in at 7pm. The sale shouldn't wait until morning.",
    narrative:
      "A shopper submits a trade appraisal and browses three trucks on your lot, then goes quiet. By the time a salesperson notices the lead the next day, they've already booked a test drive across town. SignalFlow reads the intent the moment it happens, confirms SMS consent is on file, and fires an instant, on-brand response with a test-drive offer - before the lead ever cools.",
    proofPoints: [
      {
        signal: "Trade appraisal + 3 inventory views",
        action: "Instant SMS lead response with test-drive slots",
        outcome: "Test drive booked, $52K vehicle sale attributed",
      },
      {
        signal: "Missed sales call, no reply in 5 days",
        action: "Governed recovery outreach with a service coupon",
        outcome: "Dormant lead reactivated, not lost to a competitor",
      },
    ],
    image: "/scenarios/automotive.jpg",
    imageAlt:
      "Salesperson handing keys to a customer on a modern dealership lot",
    href: "/scenarios/automotive-high-intent",
    accent: "blue" as const,
  },
  {
    id: "dental-office",
    vertical: "dental",
    eyebrow: "Dentist office",
    headline:
      "Twelve patients are overdue for a cleaning. Your front desk is on the phone with one of them.",
    narrative:
      "Recall lists rot in a spreadsheet while the schedule has open chairs. A patient opens your recall reminder twice and clicks the booking link - clear intent - but nobody follows up. SignalFlow scores that engagement, checks email consent and quiet hours, and routes a reactivation prompt. Because this is health information, the policy layer holds anything sensitive for human review before it's ever sent.",
    proofPoints: [
      {
        signal: "Recall overdue 60+ days, reminder opened twice",
        action: "Consent-checked reactivation with a booking link",
        outcome: "Cleaning scheduled, treatment-plan conversation opened",
      },
      {
        signal: "High-value treatment plan unaccepted",
        action: "Coordinator handoff, escalated for human review",
        outcome: "Plan accepted - revenue recovered, compliance intact",
      },
    ],
    image: "/scenarios/dental.jpg",
    imageAlt:
      "Dental hygienist greeting a patient in a bright, modern practice",
    href: "/scenarios/dental-recall",
    accent: "green" as const,
  },
  {
    id: "life-insurance-agency",
    vertical: "insurance",
    eyebrow: "Life insurance agency",
    headline:
      "Your best new policy this month is already a customer. You just haven't called them yet.",
    narrative:
      "A local life agent's growth lives in three places: cold-call lists that go stale, referrals that slip through the cracks, and a book of existing clients who are under-covered. SignalFlow watches the book for coverage gaps and life events, surfaces the warmest referral first, and prompts the next best conversation - a term-to-permanent review, an annuity rollover, a disability add-on - with every outreach gated by consent and the elevated sensitivity life insurance demands.",
    proofPoints: [
      {
        signal: "Existing client, coverage-gap review due",
        action: "Cross-sell prompt: add disability + review beneficiaries",
        outcome: "Second policy bound from the existing book",
      },
      {
        signal: "Referral submitted, no response in 4 days",
        action: "Consent-checked referral follow-up sequence",
        outcome: "Warm lead converted before it went cold",
      },
    ],
    image: "/scenarios/insurance.jpg",
    imageAlt:
      "Insurance agent reviewing coverage options with a couple at a local office",
    href: "/scenarios/insurance-book-expansion",
    accent: "blue" as const,
  },
];

const showcaseAccents = {
  blue: { bar: "bg-primary", cta: "bg-primary hover:bg-primary/90" },
  green: { bar: "bg-success", cta: "bg-success hover:bg-success/90" },
} as const;

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div className="marketing-wash relative min-h-screen">
      <div aria-hidden="true" className="marketing-top-fade" />
      <SiteNav />
      <Hero />
      <ScenarioShowcase />
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
            href="#scenarios"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Scenarios
          </a>
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
    <header className="relative overflow-hidden px-6 pb-12 pt-20">
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
      </div>
    </header>
  );
}

function ScenarioShowcase() {
  return (
    <section
      id="scenarios"
      aria-labelledby="scenarios-heading"
      className="relative"
    >
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-10 text-center sm:pt-14">
        <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-wide text-primary">
          Scenario library
        </p>
        <h2
          id="scenarios-heading"
          className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          See it work in your world, not in the abstract
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
          Three real-world stories, each one a signal turned into a governed
          action and a booked outcome. Scroll through, then drill into the full
          seven-step walkthrough.
        </p>
      </div>
      {showcaseScenarios.map((scenario, index) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          priority={index === 0}
        />
      ))}
    </section>
  );
}

function ScenarioCard({
  scenario,
  priority,
}: {
  scenario: (typeof showcaseScenarios)[number];
  priority: boolean;
}) {
  return (
    <>
      <DesktopScenarioCard scenario={scenario} priority={priority} />
      <MobileScenarioCard scenario={scenario} priority={priority} />
    </>
  );
}

function DesktopScenarioCard({
  scenario,
  priority,
}: {
  scenario: (typeof showcaseScenarios)[number];
  priority: boolean;
}) {
  const accent = showcaseAccents[scenario.accent];
  const headingId = `scenario-${scenario.id}-desktop-heading`;

  return (
    <article
      aria-labelledby={headingId}
      className="group relative hidden min-h-[90vh] items-center overflow-hidden lg:flex"
    >
      <Image
        src={scenario.image}
        alt={scenario.imageAlt}
        fill
        priority={priority}
        unoptimized
        sizes="100vw"
        className="object-cover object-center motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/10" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/28 to-transparent"
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <span
            aria-hidden="true"
            className={`mb-5 block h-1 w-12 rounded-full ${accent.bar}`}
          />
          <p className="text-[12.5px] font-semibold uppercase tracking-wide text-white/80">
            {scenario.eyebrow}
          </p>
          <h3
            id={headingId}
            className="mt-3 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl"
          >
            {scenario.headline}
          </h3>
          <p className="mt-5 text-pretty text-base font-medium leading-relaxed text-white sm:text-[17px]">
            {scenario.narrative}
          </p>

          <ProofPoints points={scenario.proofPoints} />

          <ScenarioActions scenario={scenario} />
        </div>
      </div>
    </article>
  );
}

function MobileScenarioCard({
  scenario,
  priority,
}: {
  scenario: (typeof showcaseScenarios)[number];
  priority: boolean;
}) {
  const accent = showcaseAccents[scenario.accent];
  const headingId = `scenario-${scenario.id}-mobile-heading`;

  return (
    <article
      aria-labelledby={headingId}
      className="mx-4 mb-8 overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-xl lg:hidden"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
        <Image
          src={scenario.image}
          alt={scenario.imageAlt}
          fill
          priority={priority}
          unoptimized
          sizes="100vw"
          className="object-cover object-left-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent"
        />
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-8">
        <span
          aria-hidden="true"
          className={`mb-5 block h-1 w-12 rounded-full ${accent.bar}`}
        />
        <p className="text-[12px] font-semibold uppercase tracking-wide text-white/70">
          {scenario.eyebrow}
        </p>
        <h3
          id={headingId}
          className="mt-3 text-balance text-2xl font-semibold leading-[1.08] tracking-tight text-white sm:text-3xl"
        >
          {scenario.headline}
        </h3>
        <p className="mt-5 text-pretty text-[15px] font-medium leading-relaxed text-white">
          {scenario.narrative}
        </p>

        <ProofPoints points={scenario.proofPoints} />

        <ScenarioActions scenario={scenario} />
      </div>
    </article>
  );
}

function ProofPoints({
  points,
}: {
  points: (typeof showcaseScenarios)[number]["proofPoints"];
}) {
  return (
    <ul className="mt-8 space-y-3">
      {points.map((point) => (
        <li
          key={point.signal}
          className="rounded-xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-sm"
        >
          <dl className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-white/75">
                Signal
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-white">
                {point.signal}
              </dd>
            </div>
            <ArrowRight
              aria-hidden="true"
              className="hidden h-4 w-4 shrink-0 text-white/40 sm:block"
            />
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-white/75">
                Action
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-white">
                {point.action}
              </dd>
            </div>
            <ArrowRight
              aria-hidden="true"
              className="hidden h-4 w-4 shrink-0 text-white/40 sm:block"
            />
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-white/75">
                Outcome
              </dt>
              <dd className="mt-0.5 text-sm font-semibold text-white">
                {point.outcome}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function ScenarioActions({
  scenario,
}: {
  scenario: (typeof showcaseScenarios)[number];
}) {
  const accent = showcaseAccents[scenario.accent];

  return (
    <div className="mt-9 flex flex-wrap items-center gap-3">
      <Link
        href={scenario.href}
        className={`inline-flex h-12 items-center gap-2 rounded-[9px] px-6 text-[15px] font-medium text-primary-foreground shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground ${accent.cta}`}
      >
        See how it works
        <ArrowRight className="h-[17px] w-[17px]" />
      </Link>
      <Link
        href="/demo"
        className="inline-flex h-12 items-center rounded-[9px] border border-white/25 bg-white/10 px-6 text-[15px] font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
      >
        Run the 60-second demo
      </Link>
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
              <span className="text-sm font-medium text-[#E8EEF8]">
                {step}
              </span>
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
