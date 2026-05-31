# MVP Scope

## Phase 0 is foundation only

Phase 0 establishes a professional, reviewable, runnable foundation for SignalFlow. It does not deliver a working product with live behavior. It delivers the structure, design direction, typed data, domain boundaries, and documentation that later phases build on.

This is an important boundary. Nothing in Phase 0 performs a real action. Everything is mocked, typed, and demo safe.

## In scope for Phase 0

- Next.js App Router project with TypeScript and Tailwind CSS
- shadcn-style component primitives and reusable domain components
- A landing page that explains the product
- An application shell with sidebar, header, and a persistent demo banner
- A dashboard built from typed mock data
- Pages for signals, customers, opportunities, action graph, orchestrator, communications, vertical packs, audit, and settings
- Typed domain models for signals, customers, opportunities, communications, audit events, and vertical packs
- A deterministic consent policy layer
- Mock provider boundaries for AI, SMS, email, and voice
- A Prisma schema that documents the Phase 1 persistence model
- Documentation for architecture, scope, compliance, providers, roadmap, and demo flow

## Out of scope for Phase 0

- Live database connections or persistence
- Authentication and user management
- Real calls to any AI provider
- Real SMS, email, or voice delivery
- Real telephony
- Production automation or scheduling
- Billing or metering
- Any handling of real customer data

## Definition of done

Phase 0 is complete when the app builds, type checks, and lints cleanly, renders all major pages with realistic mock data, communicates demo-safe boundaries clearly, contains no secrets and no live integrations, and ships with the documentation listed above.
