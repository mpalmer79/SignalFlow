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

Requirements: Node.js 18.18 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

The app renders fully without any secrets, without a database, and without provider keys. An `.env.example` file lists placeholder variables for later phases. Copy it to `.env` only when you start building Phase 1 integrations.

Useful scripts:

```bash
npm run dev        # start the local dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # typescript without emit
```

## Project structure

```
app/                 Next.js App Router pages
  (app)/             product surface wrapped in the app shell
components/          reusable UI and domain components
  ui/                shadcn-style primitives
lib/
  config/            app and navigation configuration
  mock-data/         typed mock business data
  policy/            deterministic consent policy layer
  providers/         mock provider boundaries
  types/             explicit domain types
prisma/              Prisma schema for the Phase 1 persistence model
```

## Documentation

- ARCHITECTURE.md: system architecture and engineering principles
- MVP_SCOPE.md: Phase 0 scope and boundaries
- ROADMAP.md: phased delivery plan
- COMPLIANCE.md: consent and compliance design
- DATA_MODEL.md: domain model reference
- PROVIDERS.md: provider boundaries and mock strategy
- DEMO_SCRIPT.md: reviewer demo flow
