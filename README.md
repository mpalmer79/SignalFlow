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

Phase 0 (foundation), Phase 1 (persistence), and Phase 2 (customer intelligence) are complete. PostgreSQL is the source of truth, and a deterministic intelligence layer turns persisted signals into intent, opportunity, and engagement scores with recommended next best actions. There are still no live integrations, no authentication, no multi-tenancy, no outbound communication, and no external model calls. Every score and recommendation is computed locally.

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
  mock-data/         demo business data, used only by the seed script
  policy/            deterministic consent policy layer
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
