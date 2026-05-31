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

## Phase 2: Access and authentication

- Add Clerk authentication and organization scoping
- Enforce organization-level data isolation in the repository layer
- Role-based access control aligned with the architecture document
- Protected routes and server-side authorization
- Keep all outbound communication mocked

## Phase 3: Live providers behind interfaces

- Implement AI provider adapters (OpenAI, Anthropic Claude, Google Gemini)
- Implement SMS and telephony adapters (Twilio)
- Implement email adapter (SendGrid)
- Implement voice synthesis adapter (ElevenLabs)
- Add provider configuration and credential handling
- Gate live sends behind explicit organization settings

## Phase 4: Orchestration engine

- Real workflow execution with wait windows and fallbacks
- Quiet hours and rate limiting enforced at send time
- Human task queue with assignment and resolution
- Opt-out handling that halts active workflows immediately

## Phase 5: Intelligence and outcomes

- Intent scoring models tuned per vertical
- Outcome tracking tied to revenue
- Reporting and analytics on signals, actions, and results
- Feedback loops that improve next best action

## Phase 6: Vertical expansion

- Promote additional packs from research and design to production
- Vertical-specific compliance rules and message libraries
- Pack marketplace structure for faster onboarding
