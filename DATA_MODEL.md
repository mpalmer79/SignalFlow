# Data Model

This document describes the SignalFlow domain model. In Phase 0 the model is expressed as TypeScript types in `lib/types` and populated with typed mock data in `lib/mock-data`. The same model is mirrored in `prisma/schema.prisma` as the Phase 1 persistence target.

## Core entities

### Signal

An inbound event that indicates revenue intent or risk.

- id, type, label
- customer reference and vertical
- source (web form, phone, email, chat, third party, scheduler)
- priority (critical, high, medium, low)
- recommended action and recommended channel
- consent status at the time of the signal
- detail and received timestamp

### Customer

A unified intelligence record for a person or account.

- id, name, vertical
- channels with per-channel consent
- preferred channel
- opted out flag
- recent signals
- active opportunity
- last action and timestamp
- risk flags with severity

### Opportunity

A revenue opportunity tracked through stages.

- id, title, customer reference, vertical
- stage (new, contact attempted, engaged, appointment set, needs human review, won, lost, dormant, reactivated)
- intent score (0 to 100)
- estimated value
- owner and updated timestamp

### Communication

A simulated outbound or task record.

- id, channel (sms, email, voice, human)
- customer reference
- subject and preview
- status (drafted, queued, sent, delivered, replied, failed, blocked, escalated)
- simulated flag (always true in Phase 0)
- related signal reference and created timestamp

### Audit event

An immutable record of a decision or action.

- id, type (for example SIGNAL_RECEIVED, POLICY_BLOCKED_ACTION)
- customer reference and optional signal reference
- policy decision summary
- action and outcome (allowed, blocked, review, recorded)
- occurred timestamp

### Vertical pack

An industry configuration that extends the core.

- id, name, summary
- key signals and key actions
- compliance sensitivity (standard, elevated, high)
- phase status (mvp focus, in design, planned, research)

## Consent model

A consent profile holds a per-channel consent state, an opted out flag, and a quiet hours window with time zone. Consent state is one of granted, denied, unknown, or revoked.

## Relationships

- A customer has many signals, opportunities, communications, and audit events.
- A signal can lead to a communication and to audit events.
- A policy decision links a signal and a customer to an action and an outcome through audit events.

## Phase 1 alignment

`prisma/schema.prisma` encodes these entities with PostgreSQL enums and relations. The TypeScript types remain the source of truth for the UI, so the persistence layer can be introduced without changing the domain contract.
