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

## Phase 7: Live providers behind interfaces

- Implement AI provider adapters (OpenAI, Anthropic Claude, Google Gemini)
- Implement SMS and telephony adapters (Twilio)
- Implement email adapter (SendGrid)
- Implement voice synthesis adapter (ElevenLabs)
- Add provider configuration and credential handling
- Gate live sends behind explicit organization settings

## Phase 8: Live orchestration

- Real workflow execution with wait windows and fallbacks
- Quiet hours and rate limiting enforced at send time
- Human task queue with assignment and resolution
- Opt-out handling that halts active workflows immediately

## Phase 9: Outcomes intelligence

- Feedback loops that improve next best action from recorded outcomes
- Vertical-specific scoring refinements driven by outcome memory
- Predictive close probability and best time to contact
- Reporting and export of attribution and effectiveness

## Phase 10: Vertical expansion

- Promote additional packs from research and design to production
- Vertical-specific compliance rules and message libraries
- Pack marketplace structure for faster onboarding
