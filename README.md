# SignalFlow

AI-Powered Revenue Operating System

Turn customer signals into timely, consent-aware revenue actions.

## What SignalFlow is

SignalFlow is an AI-native revenue platform. It reads customer signals, maintains a customer intelligence graph, and uses a consent-aware action graph to orchestrate follow-up across voice, SMS, email, and human tasks. The goal is to move revenue work from a system of record to a system of action.

The platform is organized around durable concepts that stay stable as integrations evolve:

- Customer signals
- Customer intelligence graph
- Action graph
- Consent-aware orchestration
- Multi-channel follow-up
- Vertical packs
- Auditability
- Revenue outcomes

## Why it is not just another CRM

A CRM stores records and waits for a person to decide what happens next. SignalFlow is built to decide and act. It detects intent from signals, applies a policy layer for consent and compliance, chooses the right channel, drafts the message, and queues the follow-up. Every step produces an audit event, so the system stays explainable and accountable.

Key differences from a traditional CRM:

- Action first, not record first. Signals drive the next best action in real time.
- Consent is enforced by a policy layer, not scattered across fields.
- Channels work as one coordinated workflow rather than separate silos.
- Decisions and actions are auditable end to end.

## Current status

Phase 0 through Phase 6 are complete. PostgreSQL is the source of truth, a deterministic intelligence layer scores every customer, a workflow engine converts recommendations into governed simulated execution plans, an outcome engine turns those runs into measurable revenue outcomes, and a simulation environment lets a reviewer explore the platform across industries. Phase 6 adds multi-tenancy: organizations, users, memberships, role based access control, server side authorization, and organization scoped persistence, with Clerk as an optional authentication provider and a clearly labeled demo fallback. There are still no AI model calls, no outbound communication, and no provider integrations. Everything outside of optional authentication is deterministic and demo safe.

## Phase 6 scope

Phase 6 turns SignalFlow into a believable multi-tenant SaaS foundation, hardened to production readiness before the next feature phase.

Phase 6 includes:

- Organization, User, and Membership models with eight roles and three membership statuses
- An organizationId on every business model, with an index and a foreign key relation to Organization
- A backfill safe migration that succeeds against an empty or a non-empty local database
- A deterministic, server side authorization layer with a fixed role to permission map
- A request context resolved on the server, carrying user, organization, role, and source
- Clerk as an optional auth provider, wired through middleware, the root layout, and client sign-in and sign-up routes
- A demo auth context fallback so the app stays fully reviewable with no Clerk keys
- Protected application routes with server side permission checks and clear unauthenticated and forbidden states
- Organization scoped repositories, with pages reaching data only through services
- A seeded demo organization with six demo users across the role range
- A settings page showing organization profile, current auth context, members, roles and permissions, provider status, and security boundaries

Authentication is the only live infrastructure, and it is optional. See AUTHORIZATION.md and MULTI_TENANCY.md for the design.

### Clerk and demo fallback

When NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are set, Clerk middleware protects the app routes, the layout wraps the app in ClerkProvider, and the request context comes from the Clerk session and the user membership. When the keys are absent, the middleware is a pass through and a clearly labeled demo context resolves to the demo organization owner, so the application stays reviewable. Server side page guards and organization scoped repositories enforce access in both modes.

## Phase 5 scope

Phase 5 turns SignalFlow from a framework demonstration into a product demonstration. It adds a formal vertical pack framework, a scenario builder, a simulation center, executive insights, revenue leak detection, and a guided product walkthrough. A reviewer can explore the platform across industries in ten to fifteen minutes.

Phase 5 includes:

- A formal vertical pack framework with automotive, dental, home services, legal, and insurance packs
- A deterministic synthetic data generator shared by the scenario and simulation engines
- A Scenario Builder that launches complete end to end industry scenarios
- A Simulation Center that runs large multi-customer simulations and aggregates outcomes
- Executive Insights with revenue leak detection, workflow analytics, and opportunity analytics
- A Revenue Leak Engine that classifies and ranks where revenue is lost
- A guided product walkthrough at the demo route
- An upgraded landing page with an industry selector and simulation and executive previews
- An upgraded dashboard with top scenarios, industry comparison, and a revenue leak summary
- Expanded seed data with believable generated populations across every vertical

See VERTICAL_PACKS.md, SCENARIO_ENGINE.md, SIMULATION_CENTER.md, and EXECUTIVE_INSIGHTS.md for the design and demo-safe limitations.

## Phase 4 scope

Phase 4 introduces Outcome Memory and Revenue Attribution. Simulated workflow runs become measurable business outcomes: outcome events, stage transitions, revenue attribution, workflow effectiveness, and missed opportunity estimates. No revenue is real and nothing is sent.

Phase 4 includes:

- An Outcome Engine that classifies a workflow run into deterministic outcome events
- A Stage Transition Engine that advances opportunities and persists transitions
- A Revenue Attribution Engine with influenced, assisted, recovered, prevented loss, and missed types
- A Missed Opportunity Engine that estimates value at risk with a severity and a recovery action
- Workflow Effectiveness scoring on a 0 to 100 scale from a centralized configuration
- An Outcome Memory engine that summarizes which signals, actions, and verticals produce the strongest outcomes
- A flagship Revenue Engine page that walks signal to intelligence to workflow to outcome to revenue
- Dashboard revenue metrics, opportunity outcome history, and revenue enrichment in customer timelines
- New audit events for outcome, stage, attribution, missed opportunity, and effectiveness activity

See REVENUE_ENGINE.md for the full design and demo-safe limitations.

## Phase 3 scope

Phase 3 introduces the Action Graph and the Follow-Up Orchestrator. Recommendations become governed execution plans that pass policy evaluation and run through a deterministic execution simulator. Nothing is ever sent.

Phase 3 includes:

- An Action Graph that turns an intelligence profile into typed action nodes and edges
- A Policy Evaluation Layer that returns allowed, blocked, or needs review for every action
- A Workflow Engine that builds, validates, evaluates, and simulates workflows
- A deterministic Execution Simulator that walks the plan, executes allowed actions, skips blocked actions, and emits audit events
- Persisted workflow runs, actions, and results, with linked workflow audit events
- An execution timeline with a stable demo clock
- An upgraded Action Graph page that shows a live workflow plan, policy decisions, and execution
- An upgraded Orchestrator page that lists persisted runs, with a workflow run detail page
- Workflow metrics on the dashboard, a workflow preview on the intelligence detail page, and workflow activity in customer timelines and the audit trail

### Action Graph

The Action Graph is the decision layer between intelligence and execution. It determines the allowed actions, their order, escalation paths, stop conditions, and human handoff moments. Nodes carry an action type, reason, status, and policy decision. Edges carry the relationship, including wait durations.

### Workflow Engine and Execution Simulation

The Workflow Builder generates a plan from intent, opportunity, and engagement scores, consent, risk flags, and intent class. The Workflow Validator checks plan integrity. The Simulated Execution Engine walks the plan, evaluates policy per action, executes allowed actions, blocks or escalates the rest, and produces a typed outcome (completed, partially completed, blocked, escalated, paused, or failed validation) along with audit events. Nothing is sent and no scheduling or queue infrastructure is used.

### Policy Evaluation Layer

Every action is evaluated against a policy context derived from persisted consent and risk flags. Opt-out blocks all outreach, missing channel consent blocks that channel, medical sensitive content and high value leads route to human review, and stop actions are always permitted. Decisions are recorded as workflow audit events.

## Phase 2 scope

Phase 2 introduces the Customer Intelligence Graph and the Signal Engine. This is the layer that differentiates SignalFlow from a traditional CRM. All logic is deterministic and local.

Phase 2 includes:

- A Signal Engine that normalizes raw signals into a stable vocabulary, then enriches them with intent classification, priority, and a recommended action
- A deterministic intent classifier and a centralized scoring configuration
- Intent, opportunity, and engagement scoring on a 0 to 100 scale
- An Opportunity Detection Engine that surfaces revenue opportunities with deterministic confidence
- A Next Best Action engine that considers intent, opportunity, engagement, consent, and risk flags
- A Customer Intelligence Graph expressed with TypeScript objects, not a graph database
- A Customer Intelligence page with per-customer profiles, scores, recommendations, detected opportunities, and risk indicators
- A Signal Explorer that shows raw signal, normalized signal, intent, priority, and recommended action
- Dashboard intelligence sections: top intent customers, top revenue opportunities, recently detected opportunities, customers requiring attention, and customers at risk
- A risk flag system that influences recommendations
- Timeline enrichment that adds detected opportunities, recommendations, and risk flags

### Customer Intelligence Graph

The graph aggregates a customer's signals, opportunities, communications, consent, and risk flags into a single intelligence profile, and models their relationships as in-memory nodes and edges. It answers what happened, who it happened to, why it matters, how important it is, and what should happen next.

### Signal Engine

The Signal Engine normalizes persisted and free-form events into stable types such as `TRADE_REQUEST`, `VEHICLE_VIEW`, and `SERVICE_DUE`, then assigns intent and priority. Raw and normalized events are kept distinct so the transformation is visible in the Signal Explorer.

### Scoring system

All weights live in a single scoring configuration. Intent score sums recency-weighted signal contributions. Opportunity score anchors on a vertical baseline and adjusts for high-value signals and open opportunity value. Engagement score starts from a baseline and moves with positive and negative engagement signals, opt-out status, and silence.

### Opportunity detection

Detection rules map normalized signals to revenue opportunities (for example a trade request to a Vehicle Purchase Opportunity) with a fixed, deterministic confidence and a recommended action.

## Phase 1 scope

Phase 1 introduces persistence while keeping the application demo safe.

Phase 1 includes:

- A Prisma schema and PostgreSQL database as the source of truth
- A repository layer that owns all Prisma access
- A service layer that owns business logic and composition
- A seed script that loads the Phase 0 business examples into the database
- A dynamic dashboard with metrics calculated from the database
- A customer intelligence timeline that merges signals, communications, audit events, and opportunities
- An opportunity pipeline, audit trail, and communications view served from persistence
- Persisted consent records and policy decisions
- Empty, loading, and not found states, with graceful database failure handling

Pages never query Prisma directly. The flow is page to service to repository to Prisma to PostgreSQL.

## Phase 0 scope

Phase 0 is foundation only. It delivers a runnable, reviewable project that communicates the product vision without any live integrations.

Phase 0 includes:

- A professional application shell with sidebar, header, and demo banner
- A landing page that explains the product
- A dashboard with realistic mock business data
- Route structure for all major product domains
- Typed mock data and explicit domain types
- Mock provider boundaries for AI, SMS, email, and voice
- A deterministic consent policy layer
- Documentation for architecture, scope, compliance, providers, roadmap, and demo flow

Phase 0 does not include persistence, authentication, real provider calls, or production automation.

## Demo-safe limitations

Phase 0 runs in demo mode at all times:

- No live SMS, email, or voice
- No real telephony
- No calls to any AI or communication provider
- No medical or legal advice
- No real customer data
- Mock providers only, returning deterministic responses

These limits are visible in the app through a persistent demo banner and simulated record labels.

## Planned verticals

- Automotive (initial MVP focus)
- Dental
- Medical
- Home Services
- Legal Intake
- Insurance

Each vertical ships as a pack with its own signals, actions, and compliance sensitivity.

## Planned integrations

These are not active in Phase 0. They sit behind typed provider interfaces for later phases:

- AI: OpenAI, Anthropic Claude, Google Gemini
- Voice synthesis: ElevenLabs
- Telephony and SMS: Twilio
- Email: SendGrid

## Local development notes

Requirements: Node.js 18.18 or later and a local PostgreSQL instance.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database connection

Copy the example environment file and set `DATABASE_URL` to point at your local PostgreSQL database.

```bash
cp .env.example .env
```

The default value targets a local database named `signalflow`:

```
DATABASE_URL="postgresql://signalflow:signalflow@127.0.0.1:5432/signalflow?schema=public"
```

This value is a local development convenience, not a secret. The `.env` file is gitignored and no credentials are committed.

### 3. Apply migrations and generate the client

```bash
npm run db:migrate    # apply migrations and generate the Prisma client
```

### 4. Seed demo data

```bash
npm run db:seed       # load the demo business data
```

The application works immediately after seeding.

### 5. Run the app

```bash
npm run dev
```

Then open http://localhost:3000.

Useful scripts:

```bash
npm run dev          # start the local dev server
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
npm run typecheck    # typescript without emit
npm run db:generate  # generate the Prisma client
npm run db:migrate   # create and apply a migration in development
npm run db:reset     # drop, recreate, migrate, and reseed the database
npm run db:seed      # seed demo data
npm run db:studio    # open Prisma Studio
```

## Project structure

```
app/                 Next.js App Router pages
  (app)/             product surface wrapped in the app shell
components/          reusable UI and domain components
  ui/                shadcn-style primitives
lib/
  config/            app and navigation configuration
  db/                Prisma client singleton and row to domain mappers
  repositories/      data access, the only layer that talks to Prisma
  services/          business logic and composition over repositories
  intelligence/      customer intelligence graph and profile builder
  signals/           signal engine: normalize, classify, prioritize, enrich
  scoring/           intent, opportunity, and engagement scoring
  recommendations/   opportunity detection and next best action engines
  action-graph/      typed action nodes, edges, and graph builder
  orchestrator/      workflow builder, validator, engine, and runner
  execution/         simulated execution engine and execution timeline
  outcomes/          outcome engine, classifier, memory, and stage transitions
  attribution/       revenue attribution, missed opportunity, effectiveness
  verticals/         formal vertical pack configurations and registry
  scenarios/         scenario library, engine, builder, and runner
  simulation/        synthetic data generator, engine, scorer, and library
  analytics/         revenue leak, executive summary, and insight engines
  policy/            consent policy and action policy evaluation
  mock-data/         demo business data, used only by the seed script
  providers/         mock provider boundaries
  types/             explicit domain types
prisma/
  schema.prisma      database schema, the source of truth model
  migrations/        generated SQL migrations
  seed.ts            demo data seed script
```

### Architecture layers

```
Page (presentation)
  ->
Service (business logic)
  ->
Repository (data access)
  ->
Prisma
  ->
PostgreSQL
```

Repositories contain no UI or React code. Services contain business logic only. Pages handle presentation only and never import Prisma. Mock provider boundaries remain file based, and the Phase 0 mock data now serves only as the seed source.

## Documentation

- ARCHITECTURE.md: system architecture and engineering principles
- MVP_SCOPE.md: Phase 0 scope and boundaries
- ROADMAP.md: phased delivery plan
- COMPLIANCE.md: consent and compliance design
- DATA_MODEL.md: domain model reference
- PROVIDERS.md: provider boundaries and mock strategy
- DEMO_SCRIPT.md: reviewer demo flow
- REVENUE_ENGINE.md: outcome memory and revenue attribution design
- VERTICAL_PACKS.md: vertical pack framework and included packs
- SCENARIO_ENGINE.md: scenario builder and storytelling design
- SIMULATION_CENTER.md: large simulation design
- EXECUTIVE_INSIGHTS.md: executive view and revenue leak detection
- AUTHORIZATION.md: roles, permissions, route protection, and demo fallback
- MULTI_TENANCY.md: organization model, scoping, and migration safety

## Phase 7: AI Platform Layer

SignalFlow now includes an AI native architecture that remains completely
deterministic and provider free. The platform can answer what the AI would
recommend, why, how confident it is, whether a human would approve it, and how
the recommendation is audited. No AI provider is integrated, no network calls
are made, and no secrets are required.

Highlights:

- AI provider abstraction with a deterministic mock implementation
- Recommendation, confidence, and explanation engines
- Human review queue with a deterministic review engine and lifecycle
- Org scoped AI persistence and a full AI audit trail
- AI Center and Review Queue pages, plus dashboard and executive AI metrics

Documentation:

- AI_PLATFORM.md for the architecture and provider abstraction
- REVIEW_QUEUE.md for the human review process
- PROMPT_LIBRARY.md for the structured prompt templates
