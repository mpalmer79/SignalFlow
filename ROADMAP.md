# Roadmap

SignalFlow is delivered in phases. Each phase keeps the domain model stable while adding capability. The early phases prioritize a safe, reviewable foundation before any live behavior.

## Phase 0: Foundation (current)

- Application shell, landing page, and design direction
- Typed mock data and explicit domain types
- Deterministic consent policy layer
- Mock provider boundaries
- Documentation set
- No live integrations, no persistence, no secrets

## Phase 1: Persistence and access

- Wire Prisma with PostgreSQL using the existing schema
- Replace mock data reads with database queries behind the same types
- Add Clerk authentication and organization scoping
- Seed scripts that mirror the current mock data
- Keep all outbound communication mocked

## Phase 2: Live providers behind interfaces

- Implement AI provider adapters (OpenAI, Anthropic Claude, Google Gemini)
- Implement SMS and telephony adapters (Twilio)
- Implement email adapter (SendGrid)
- Implement voice synthesis adapter (ElevenLabs)
- Add provider configuration and credential handling
- Gate live sends behind explicit organization settings

## Phase 3: Orchestration engine

- Real workflow execution with wait windows and fallbacks
- Quiet hours and rate limiting enforced at send time
- Human task queue with assignment and resolution
- Opt-out handling that halts active workflows immediately

## Phase 4: Intelligence and outcomes

- Intent scoring models tuned per vertical
- Outcome tracking tied to revenue
- Reporting and analytics on signals, actions, and results
- Feedback loops that improve next best action

## Phase 5: Vertical expansion

- Promote additional packs from research and design to production
- Vertical-specific compliance rules and message libraries
- Pack marketplace structure for faster onboarding
