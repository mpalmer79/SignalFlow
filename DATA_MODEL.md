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

## Workflow entities (Phase 3)

### Workflow run

A persisted, simulated workflow plan for one customer.

- id, customer reference, optional opportunity reference
- title, trigger, and the intent, opportunity, and engagement scores that drove it
- outcome (completed, partially completed, blocked, escalated, paused, failed validation)
- counts of executed, blocked, and escalated actions
- has many workflow actions and one workflow result

### Workflow action

A single action within a run, with order, action type, channel, status, policy outcome, offset minutes, and reason.

### Workflow result

A summary row for a run, with the outcome and a text summary.

## Outcome and revenue entities (Phase 4)

### Outcome event

A deterministic outcome produced from a workflow run.

- id, customer reference, optional opportunity and workflow run references
- outcome type (for example APPOINTMENT_SCHEDULED, NO_RESPONSE, COMPLIANCE_STOP)
- reason, confidence, and the action type that produced it
- occurred timestamp

### Revenue attribution

An estimate of influenced revenue from a run.

- id, customer reference, optional opportunity and workflow run references
- attributed amount and attribution type (influenced, assisted, recovered, prevented loss, missed)
- reason, confidence, and created timestamp

### Stage transition

A recorded movement of an opportunity between stages.

- id, opportunity reference, from stage, to stage, reason, triggered by, created timestamp

### Workflow effectiveness snapshot

A per-run effectiveness score.

- id, workflow run reference (unique)
- completion status, executed, blocked, and escalated counts
- outcome score (0 to 100), revenue influenced, policy friction, created timestamp

### Missed opportunity estimate

An estimate of revenue at risk.

- id, customer reference, optional opportunity reference
- estimated value, missed reason, severity (low, medium, high, critical)
- recommended recovery action, created timestamp

## Phase 4 relationships

- A workflow run has many outcome events and revenue attributions, and one effectiveness snapshot.
- An opportunity has many stage transitions, outcome events, attributions, and missed opportunity estimates.
- A customer has many outcome events, attributions, and missed opportunity estimates.
- Outcome and attribution activity also produces audit events for traceability.
