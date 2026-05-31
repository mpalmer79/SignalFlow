# Roadmap

SignalFlow is delivered in phases. Each phase keeps the domain model stable while adding capability. The early phases prioritize a safe, reviewable foundation before any live behavior.

## Phase 0: Foundation (complete)

- Application shell, landing page, and design direction
- Typed mock data and explicit domain types
- Deterministic consent policy layer
- Mock provider boundaries
- Documentation set
- No live integrations, no persistence, no secrets

## Phase 1: Persistence (complete)

- Prisma schema and PostgreSQL as the source of truth
- Repository layer that owns all Prisma access
- Service layer that owns business logic and composition
- Seed script that loads the Phase 0 business examples
- Dynamic dashboard with metrics calculated from the database
- Customer intelligence timeline served from persistence
- Opportunity pipeline, audit trail, and communications served from persistence
- Persisted consent records and policy decisions
- Empty, loading, and not found states with graceful failure handling
- No authentication, no multi-tenancy, no live integrations, no secrets

## Phase 2: Customer intelligence (complete)

- Signal Engine that normalizes, classifies, prioritizes, and enriches signals
- Deterministic intent classification and a centralized scoring configuration
- Intent, opportunity, and engagement scoring on a 0 to 100 scale
- Opportunity Detection Engine with deterministic confidence
- Next Best Action engine driven by scores, consent, and risk flags
- Customer Intelligence Graph built from in-memory TypeScript objects
- Customer Intelligence page and Signal Explorer
- Dashboard intelligence sections and enriched customer timelines
- Risk flag system that influences recommendations
- No external model calls, no authentication, no live integrations, no secrets

## Phase 3: Action graph and orchestration (complete)

- Action Graph with typed action nodes and edges
- Policy Evaluation Layer returning allowed, blocked, or needs review per action
- Workflow Engine that builds, validates, evaluates, and simulates workflows
- Deterministic Execution Simulator that emits workflow audit events
- Persisted workflow runs, actions, and results
- Execution timeline with a stable demo clock
- Upgraded Action Graph and Orchestrator pages, with a workflow run detail page
- Dashboard workflow metrics, intelligence workflow preview, and enriched timelines
- No outbound communication, no scheduling infrastructure, no external model calls

## Phase 4: Outcome memory and revenue attribution (complete)

- Outcome Engine that classifies workflow runs into deterministic outcome events
- Stage Transition Engine that advances opportunities and persists transitions
- Revenue Attribution Engine with influenced, assisted, recovered, prevented loss, and missed types
- Missed Opportunity Engine with value estimates, severity, and recovery actions
- Workflow Effectiveness scoring from a centralized configuration
- Outcome Memory summaries across signals, actions, and verticals
- Flagship Revenue Engine page and opportunity outcome history
- Dashboard revenue metrics and revenue enriched customer timelines
- New audit events for outcome and attribution activity
- No external model calls, no live communication, no secrets

## Phase 5: Industry simulation environment (complete)

- Formal vertical pack framework with automotive, dental, home services, legal, and insurance packs
- Deterministic synthetic data generator shared by scenarios and simulations
- Scenario Builder that launches complete end to end industry scenarios
- Simulation Center that runs large multi-customer simulations and aggregates outcomes
- Executive Insights with revenue leak detection, workflow analytics, and opportunity analytics
- Revenue Leak Engine that classifies and ranks where revenue is lost
- Guided product walkthrough, upgraded landing page, and upgraded dashboard
- Expanded seed data with generated populations across every vertical
- No external model calls, no live communication, no secrets

## Phase 6: Access and authentication (complete)

- Clerk as an optional authentication provider with a demo auth fallback
- Organization, User, and Membership models with roles and membership statuses
- organizationId, an index, and a foreign key relation to Organization on every business model
- Backfill safe migration that works against an empty or a non-empty database
- Organization scoped repositories with no cross organization business data
- Deterministic, server side role based access control and permission checks
- Protected routes with clear unauthenticated and forbidden states
- Seeded demo organization, demo users, and memberships
- Settings page and header showing organization, role, and demo status
- No AI model calls, no outbound communication, no secrets

## Phase 7: AI Platform Layer (complete)

Phase 7 introduces an AI native architecture without introducing AI
dependencies. The platform is deterministic and provider free. No provider is
integrated, no network calls are made, and no secrets are required.

Delivered in Phase 7:

- AI provider abstraction with a deterministic mock implementation
- AI recommendation engine, confidence engine, and explanation engine
- Output validation for generated recommendations
- Human review queue, review engine, and review decision state machine
- Recommendation lifecycle with persisted state transitions
- AI persistence models: AIRecommendation, AIExplanation, AIReviewDecision
- Six AI audit event types covering creation, explanation, and review
- Structured prompt library across all vertical packs
- AI Center page and Review Queue page with permissions and navigation
- Dashboard AI metrics and executive insight AI governance metrics
- Revenue engine visibility of the recommendation to revenue path
- Documentation: AI_PLATFORM.md, REVIEW_QUEUE.md, PROMPT_LIBRARY.md

The pipeline now reads Signal to Intelligence to AI Recommendation to Human
Review to Workflow to Outcome.

## Phase 8: Revenue Command Center (complete)

Phase 8 adds a flagship product experience called the Revenue Command Center.
It collapses signals, intelligence, AI recommendations, human review,
workflows, outcomes, and revenue attribution into a single narrative page, and
adds a mission replay route that walks any seeded customer's lifecycle as an
ordered timeline.

Delivered in Phase 8:

- A flagship page at /app/revenue-command-center
- A mission replay at /app/revenue-command-center/replay/[customerId]
- A single aggregating service: revenue-command-center-service.ts
- Revenue funnel with counts and conversion percentages
- Customer journey explorer
- AI recommendation stream, workflow activity, outcome feed, and revenue
  attribution leaderboards
- Top revenue verticals, missed revenue, and recent audit activity
- Promotion in primary navigation, on the landing page, and on the dashboard
- REVENUE_COMMAND_CENTER.md documentation

No new providers, no live communication, no secrets, and no architecture
rewrites. All data is derived from persistence.

### Phase 8 hardening pass (complete)

A polish pass over the Revenue Command Center and Mission Replay:

- Stronger page hierarchy with eight clearly labeled sections, each with a
  short subhead
- Hero summary with a dynamic one sentence narrative and six headline metrics
- Revenue lifecycle row of seven stage cards with live counts and explanations
- Featured customer journey card with eight composed tiles, selected
  deterministically from the customer with the richest activity
- Mission replay customer context card and "What this proves" callout
- Graceful empty states with next action links throughout
- Mobile friendly grids that stack on small screens
- README, REVENUE_COMMAND_CENTER, and ROADMAP updates including a recommended
  demo path

Validated locally: TypeScript clean, ESLint clean, no em dashes, no pages
importing repositories, Prisma schema validates.

## Phase 9: Voice AI Simulation Platform (complete)

Phase 9 adds a complete simulated voice follow-up platform. Voice is fully
simulated. No telephony provider is integrated, no calls are placed, no network
calls are made, and no secrets are required.

Delivered in Phase 9:

- Voice provider abstraction with a deterministic mock implementation
- Voice plan engine, voice compliance engine, and voice script engine
- Call simulator, transcript generator, and voice outcome engine
- Voice persistence: voice plans, calls, transcripts, compliance decisions,
  and call outcomes, all organization scoped
- Eight voice audit event types
- A voice command center and a voice replay page
- Voice metrics on the dashboard and voice visibility on the revenue command
  center
- Seeded voice plans across every vertical with a spread of allowed, blocked,
  and needs-review states and a range of call outcomes
- VOICE_PLATFORM, VOICE_COMPLIANCE, and VOICE_SIMULATION documentation

The pipeline now branches into voice: AI Recommendation to Human Review to
Voice Plan to Voice Compliance Check to Simulated Call to Transcript to Call
Outcome to Revenue Attribution to Audit Trail.

### Phase 9 hardening pass (complete)

A safety and demo readiness pass over the Voice AI Simulation Platform:

- Corrected the simulation eligibility check so needs-review plans are no
  longer simulated as completed; only allowed plans produce a call,
  transcript, or outcome
- Tightened transcript opening to remove the duplicated greeting and added
  deterministic per-vertical customer line variants for believability
- Added a clear simulated banner to the voice command center and the voice
  replay page
- Surfaced voice plans needing review on the AI review queue page so the two
  governance flows share one home
- Tightened dashboard voice metric labels and hints to clearly say simulated
- Verified that every voice repository query carries an organizationId in its
  where clause and that detail lookups require id and organizationId
- Reseeded and confirmed the invariant: zero calls exist on blocked or
  needs-review plans
- Documentation updates across VOICE_PLATFORM, VOICE_COMPLIANCE,
  VOICE_SIMULATION, and ROADMAP

Validated locally: typecheck, lint, prisma validate, prisma migrate status,
prisma db seed, and next build all pass.

## Phase 10: Provider Readiness and Feature Flag Architecture (complete)

Phase 10 adds a provider governance layer that can describe, configure, gate,
audit, and simulate providers safely. It does not enable any real provider. No
SDK is installed, no API is called, no network request is made, and no secret
is stored.

Delivered in Phase 10:

- A provider registry covering OpenAI, Anthropic Claude, Google Gemini, Azure
  OpenAI, ElevenLabs, OpenAI Realtime, Twilio, Retell, Vapi, SendGrid, and four
  internal mock providers
- A capability matrix across ten capabilities
- A deterministic feature flag framework where every live flag defaults to
  disabled and is locked off in demo mode
- Provider configuration, feature flag, provider audit, and provider readiness
  models, all organization scoped, with no secret fields
- A provider readiness engine, a provider selection engine that always chooses
  the internal mock provider in demo mode, and a provider sandbox
- Eight provider audit event types
- A provider management page and a provider sandbox page, a dashboard provider
  status card, and a settings provider readiness section
- PROVIDER_MANAGEMENT, FEATURE_FLAGS, and PROVIDER_SANDBOX documentation

No real provider is enabled. Every live provider remains disabled and only
internal mock providers are active.

### Phase 10 hardening pass (complete)

A safety review of the provider governance layer:

- Confirmed no provider persistence field stores a secret; required secrets are
  placeholder names only, and no secret entry form exists
- Confirmed every live feature flag is disabled by default and locked off in
  demo mode, so the evaluator can never return allowed for a live flag
- Confirmed no external provider can reach live ready, verified by a database
  check of zero live-ready readiness checks and zero external live-enabled configs
- Confirmed the provider sandbox always selects an internal mock provider and
  makes no network call
- Confirmed provider routes are protected server side and provider audit events
  are organization scoped
- Added hardening notes to PROVIDER_MANAGEMENT, FEATURE_FLAGS, and PROVIDER_SANDBOX

## Phase 11: Portfolio Launch Readiness (complete)

Phase 11 turns SignalFlow into a polished, portfolio-ready project. It adds no
new product domain.

Delivered in Phase 11:

- A portfolio-grade README with positioning, demo path, architecture overview,
  tech stack, demo-safe boundaries, and a recruiter summary
- docs/ARCHITECTURE_OVERVIEW.md with text diagrams for every lifecycle
- docs/DEMO_WALKTHROUGH.md with a step by step reviewer path
- docs/TECHNICAL_HIGHLIGHTS.md with a staff-level breakdown
- docs/PORTFOLIO_SUMMARY.md, docs/RESUME_BULLETS.md, docs/LINKEDIN_LAUNCH_DRAFT.md
- docs/SCREENSHOT_CHECKLIST.md and docs/REPO_QUALITY_CHECKLIST.md
- Targeted landing page and navigation polish that supports the demo path

## Phase 12: Future options

These remain deterministic and gated. None are required for the platform to be
reviewed, and real provider integration stays behind the existing feature flag,
compliance approval, and readiness gates.

- Full repository audit and test coverage expansion
- Production deployment hardening
- Visual design system pass
- Real provider integration behind hard gates, implementing adapters behind the
  existing AIProvider and VoiceProvider interfaces and wiring a secret manager
- Live orchestration with wait windows, quiet hours, and rate limiting once
  providers are gated and approved
- Outcomes intelligence with feedback loops and predictive scoring
- Vertical expansion of additional packs
