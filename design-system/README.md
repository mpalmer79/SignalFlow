# SignalFlow Design System

A light, enterprise-grade B2B SaaS design system for **SignalFlow**, an AI-native
revenue operating system that turns customer signals into governed, auditable,
revenue-generating actions.

> **Demo-safe positioning (preserve everywhere).** SignalFlow is a deterministic
> portfolio product. It sends **no live SMS, email, or voice**, makes **no AI
> provider calls**, and uses **no real customer data**. Every output is produced
> by deterministic engines and internal mock providers. Any design made with this
> system must keep that framing, use words like *simulated*, *deterministic*,
> *governed*, and *demo-safe*, never implied live sending.

> **Status.** These files are design-system and prototype artifacts. They are not
> yet wired into the production Next.js app. Use `handoff/DESIGN_HANDOFF.md` as the
> implementation guide for Claude Code.

---

## 1. What SignalFlow is

SignalFlow reads customer signals, builds a deterministic **customer intelligence
graph**, generates **governed AI recommendations** with confidence and a full
explanation, routes them through a **human review queue**, **simulates**
multi-channel and voice follow-up behind a consent and compliance policy layer,
and then **attributes the revenue outcome**, all on a multi-tenant,
organization-scoped foundation.

The one-line pitch from the product: *"A CRM is a system of record. SignalFlow is a
system of action."* It does not wait for a person to remember to follow up; it
reads signals, applies policy, and orchestrates the next best action with consent
and compliance at the center.

### The signal-to-revenue pipeline (the core mental model)

```
Signal  →  Intelligence  →  AI Recommendation  →  Human Review  →  Workflow  →  Revenue
 (cyan)      (indigo)            (blue)              (amber)        (teal)      (green)
```

This six-stage pipeline is the spine of the whole product. The design system gives
it a fixed color sequence (see `foundations/colors_and_type.css` → `--pipe-*`) so it can be
drawn consistently in heroes, dashboards, and diagrams.

### Core surfaces (what people actually look at)

- **Marketing / landing page**, the 60-second explainer and demo entry point.
- **Dashboard ("Revenue command center overview")**, metric cards, top-intent
  customers, workflow/revenue/AI/voice summaries, follow-up queue, audit feed.
- **Revenue Command Center**, one screen that walks a single customer from signal
  to revenue, with a mission-replay timeline.
- **AI Center + Review Queue**, explainable recommendations with confidence,
  rationale, and approve / reject human governance.
- **Voice Command Center**, simulated voice follow-up with a compliance gate.
- **Provider Management + Sandbox**, provider registry, feature flags, readiness
  checks (everything safely disabled).
- **Executive Insights**, revenue leaks and performance for leaders.

---

## 2. Sources

This system was built by reading the SignalFlow codebase directly. The reader is
encouraged to explore these to build higher-fidelity designs:

- **GitHub:** https://github.com/mpalmer79/SignalFlow (Next.js App Router +
  TypeScript + Tailwind + Prisma/PostgreSQL; shadcn-style component library;
  Lucide icon set).
  - Tokens read from `app/globals.css` and `tailwind.config.ts`.
  - Component vocabulary read from `components/ui/*`, `components/*-card.tsx`,
    `components/sidebar.tsx`, `components/header.tsx`, `components/metric-card.tsx`.
  - Navigation + copy read from `lib/config/navigation.ts`, `app/page.tsx`,
    `app/(app)/dashboard/page.tsx`, and the repo `README.md`.
  - Deep docs worth reading: `docs/ARCHITECTURE_OVERVIEW.md`,
    `docs/DEMO_WALKTHROUGH.md`, `docs/AI_PLATFORM.md`, `docs/REVENUE_COMMAND_CENTER.md`,
    `docs/VOICE_PLATFORM.md`, `docs/PORTFOLIO_SUMMARY.md`.

> **This is a redesign, not a clone.** The shipped product ships a *dark* navy
> theme. This design system deliberately re-skins it as a **light** enterprise
> platform (off-white canvas, deep-navy ink, confident blue) per the brief, while
> keeping the same information architecture, component set, and demo-safe framing.

---

## 3. CONTENT FUNDAMENTALS, how SignalFlow writes

The product copy is **calm, technical, and credibility-first**. It sounds like a
staff engineer explaining a serious platform to a hiring manager, not a hype-y
startup landing page.

- **Voice & person.** Third-person product voice ("SignalFlow reads signals,
  applies policy..."). Rarely "you," never "we/our." The product is the subject.
- **Tone.** Declarative and confident, never breathless. States what the system
  *does*, then immediately qualifies it as *simulated / deterministic*. Trust is
  the brand: almost every capability claim is paired with a governance or
  safety caveat.
- **Casing.** Sentence case everywhere, headings, buttons, nav. Title Case is
  reserved for proper product-surface names ("Revenue Command Center", "AI Center",
  "Review Queue", "Voice Command Center"). Buttons read as sentence-case verbs:
  *"Open dashboard"*, *"Run the 60-second demo"*, *"Launch command center"*,
  *"Enter the platform"*.
- **Numbers.** Concrete and deterministic, "Intent score 60 and above", "0 to 100",
  "Confidence below 50". Currency via a `formatCurrency` helper. Always tabular.
- **Vocabulary (use these exact terms).** signal, customer intelligence graph,
  intent / opportunity / engagement score, next best action, action graph,
  consent-aware, policy layer, quiet hours, recommendation, confidence, explanation,
  human review queue, orchestration, workflow, outcome, revenue attribution,
  influenced revenue, revenue leak, vertical pack, scenario, simulation, provider,
  feature flag, readiness, audit event, organization-scoped, deterministic, demo-safe.
- **The safety sentence.** A recurring reassurance, reworded to context:
  *"Deterministic demo. No live outbound communication, no external model calls,
  and no real customer data."* Ship a version of this on any hero, dashboard banner,
  or simulation screen.
- **Emoji.** None. Ever. This is an enterprise governance product, emoji read as
  unserious. Meaning is carried by Lucide icons and color, not emoji or unicode glyphs.
- **Example specimens.**
  - Hero H1: *"Turn customer signals into timely, consent-aware revenue actions."*
  - Section H2: *"Not just another CRM"* / *"Core platform pillars"*
  - Body: *"A CRM is a system of record. SignalFlow is a system of action. It does
    not wait for someone to remember to follow up."*
  - Metric label + hint: *"Consent blocked actions"* → *"Held by the policy layer"*.
  - Banner: *"Demo-safe by design, SignalFlow sends no live SMS, email, or voice."*

---

## 4. VISUAL FOUNDATIONS

The redesign target: **polished, light, credible enterprise SaaS**, Linear/Stripe/
Vercel-adjacent restraint, not flashy. Serious by default; color used as signal,
not decoration.

- **Color vibe.** Off-white canvas (`#F7F9FC`), white surfaces, **deep-navy ink**
  (`#0B1B36`) for text, and a confident **blue-600 primary** (`#2563EB`). A
  **signal-cyan** accent (`#0EA5E9`) ties to the "signal" motif. Status greens/
  ambers/reds are muted and paired with tinted backgrounds, never neon. The shipped
  product is dark; we invert to light and keep navy only for occasional contrast
  panels (CTA bands, the marketing footer, hero device chrome).
- **Backgrounds.** Predominantly flat light fills. Subtle texture only: a faint
  **dot/line grid backdrop** (carried over from the product's `.grid-backdrop`) at
  very low opacity behind heroes, and a soft radial blue glow behind the hero
  headline. **No** heavy gradients, **no** purple/violet, **no** photographic
  backgrounds. Imagery is the product UI itself (dashboard mockups), not stock photos.
- **Typography.** `Geist` (sans) for everything, `Geist Mono` for data, scores,
  IDs, and code. Headings are 600 weight with tight negative tracking
  (`-0.02em`). Body is 400, line-height ~1.55, `text-wrap: pretty`. Metrics are
  tabular-nums. *(The shipped repo uses system fonts; Geist is an enterprise
  upgrade, see Caveats.)*
- **Spacing.** 4px base scale. Generous: cards use 20–24px padding, sections breathe
  with 48–96px vertical rhythm. Dense data tables tighten to 12px. The brief
  explicitly asks for **better spacing** vs the cramped original.
- **Corner radii.** Soft but not pill-y: cards `12px`, buttons/inputs `8px`,
  small chips `6px`, badges/avatars fully round. Carried from the product's
  `--radius: 0.75rem`.
- **Cards.** The hero of the system. White surface, `1px` hairline border
  (`#E5EAF1`), `12px` radius, and a **soft layered shadow** (`--shadow-sm`).
  On hover, interactive cards lift (`--shadow-card-hover`) and the border warms to
  blue (`border → primary/40`), mirroring the product's `hover:border-primary/40`.
  Stronger hierarchy than the original: clear title row, body, and a footer/meta row.
- **Shadows / elevation.** A light-theme shadow ramp (`--shadow-xs → --shadow-xl`)
  built from low-opacity navy. Used sparingly, most depth comes from borders and
  background steps (`canvas → surface → subtle → inset`), not heavy shadow.
- **Borders & dividers.** Hairline `#E5EAF1` is the workhorse; `#CBD5E1` for
  stronger separation. Borders do most of the structural work in this light system.
- **Buttons.** Primary = solid blue, white text, subtle shadow, darkens on hover,
  presses 0.5px down. Secondary = white with a `#CBD5E1` border. Ghost = transparent,
  slate fill on hover. All `8px` radius, 40px tall (44px hit target on touch).
- **Hover states.** Backgrounds shift up one step (`#F1F5F9`), borders warm to blue,
  links underline, cards lift. Subtle and fast.
- **Press states.** Slight darken + 0.5px downward nudge. No bounce.
- **Animation.** Restrained and functional. 120–180ms ease transitions on color,
  border, and shadow; meters/bars animate width on mount. **No** bounces, **no**
  parallax, **no** decorative motion. Enterprise calm.
- **Transparency & blur.** Sparingly: the app header uses `backdrop-blur` over a
  translucent white (`bg-background/80`), carried from the product. Tint chips use
  ~10–15% color over white. No glassmorphism beyond the sticky header.
- **Meters & data viz.** Score/confidence meters are thin (8px) rounded tracks on
  `--bg-inset` with a solid fill colored by tone (intent=blue, opportunity=green,
  engagement=amber). Pipeline visuals use the fixed `--pipe-*` sequence. Keep viz
  flat, labeled, and tabular, no 3D, no gradient fills.
- **Layout rules.** App shell = fixed 256px left sidebar + sticky 64px top header +
  scrolling content on `#F7F9FC`. Marketing = centered `max-w-6xl` (1152px) column.
  Content density is moderate; let cards breathe.

---

## 5. ICONOGRAPHY

- **System: [Lucide](https://lucide.dev).** This is the product's actual icon set
  (imported throughout the codebase) and the system standard. Stroke icons,
  ~1.75–2px stroke, rounded caps/joins, 24px grid. In-app they render at 16–20px
  in slate (`--fg-2`/`--fg-3`) or tinted brand color inside a rounded tile.
  Use Lucide via CDN: `https://unpkg.com/lucide@latest` (see UI kits for the exact
  init). **Do not** substitute another icon family or hand-draw icons.
- **Icon tiles.** A recurring motif: an icon in a `40×40` rounded-`10px` tile with a
  ~10–15% tinted background and matching-color stroke (e.g. `bg-primary/10 text-primary`).
  Tone the tile to the metric's status (blue / green / amber / red).
- **Brand mark.** SignalFlow's identity is a **broadcast / signal-wave glyph**
  (the product uses Lucide's `Radio` icon as its logo). The system ships a refined
  lockup in `brand/logo-lockups/`:
  - `logo-mark.svg`, blue rounded tile + white signal waves (app icon / favicon).
  - `logo-full.svg`, mark + "Signal**Flow**" wordmark in navy (light backgrounds).
  - `logo-full-white.svg`, for navy / dark CTA bands and the marketing footer.
- **Frequently used Lucide glyphs** (from the codebase): `Radio` (brand),
  `Radar` (command center), `Bell` (signals), `BrainCircuit` (intelligence),
  `Sparkles` (AI), `ShieldCheck`/`ShieldAlert` (consent/policy), `GitBranch`
  (action graph), `Workflow` (orchestration), `PhoneCall` (voice), `Target`
  (opportunities), `Users` (customers), `Gauge` (executive insights), `Plug`
  (providers), `ClipboardCheck` (review queue), `TrendingUp`/`TrendingDown`,
  `Banknote`, `ArrowRight`.
- **Emoji / unicode icons.** Never used.

---

## 6. Index, what's in this system

This folder (`design-system/`) is self-contained. `PULL_REQUEST.md` lives one level
up at the repo root and is not part of the system itself.

```
design-system/
  README.md                ← you are here: product context, content + visual rules
  SKILL.md                 ← Agent Skills manifest (for use in Claude Code)

  foundations/
    colors_and_type.css    ← all design tokens (color, type, spacing, radius,
                              shadow) + semantic type classes + .sf-* primitives

  brand/
    logo-lockups/
      logo-mark.svg        ← signal-wave app mark (blue tile)
      logo-full.svg        ← full lockup, navy (light backgrounds)
      logo-full-white.svg  ← full lockup, white (navy backgrounds)
    icons/                 ← iconography note (the system uses Lucide via CDN)

  preview-cards/           ← Design System tab cards, grouped
    type/  colors/  spacing/  components/  brand/

  ui-kits/
    app/                   ← the light product app shell (dashboard, command
                              center, AI center, review queue), index.html + JSX
    marketing/             ← the redesigned light landing page, index.html + JSX

  handoff/
    DESIGN_HANDOFF.md      ← implementation guide for wiring this into the app
```

Each UI kit has its own `README.md`. Start a real design by opening the relevant
`ui-kits/*/index.html`, copying the components you need, and pulling tokens from
`foundations/colors_and_type.css`.

---

## 7. Caveats & substitutions

- **Light re-skin of a dark product.** The shipped SignalFlow is dark navy; this
  system intentionally reinterprets it as light per the brief. The IA, components,
  copy, and demo-safe framing are faithful; the *palette* is new.
- **Font substitution.** The repo ships system fonts only (`ui-sans-serif`,
  `ui-monospace`). This system standardizes on **Geist / Geist Mono** (Google Fonts,
  OFL) as a credible enterprise face. If you'd prefer to stay system-native, or use
  a licensed brand face, swap the `@import` and `--font-sans`/`--font-mono` in
  `foundations/colors_and_type.css`.
- **Logo.** No dedicated logo asset existed in the repo (it used the Lucide `Radio`
  glyph). The lockups in `brand/logo-lockups/` are a faithful, minimal
  interpretation of that signal-wave identity, replace with an official mark if one
  exists.
