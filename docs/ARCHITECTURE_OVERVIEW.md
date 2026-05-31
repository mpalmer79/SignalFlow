# Architecture Overview

Text-based diagrams of how SignalFlow is structured. Everything here is
deterministic and demo safe. No diagram describes a live integration.

## Signal to revenue lifecycle

The core story the platform tells, end to end.

```text
Signal received
  to Intelligence built (intent, opportunity, engagement scored)
  to AI recommendation generated (confidence and explanation)
  to Human review (approve, reject, escalate)
  to Workflow planned and simulated (consent and policy enforced)
  to Voice plan and simulated call (optional voice branch)
  to Outcome recorded
  to Revenue attributed
  to Audit trail
```

## Service and repository architecture

Strict layering keeps domain logic pure and data access organization scoped.

```text
Page (presentation, React server components)
  calls
Service (business logic, composition, request context)
  calls
Repository (organization scoped, the only layer that touches Prisma)
  calls
Prisma
  to PostgreSQL

Pure engines (no React, no Prisma, no auth client):
  intelligence, scoring, signals, action-graph, orchestrator, execution,
  outcomes, attribution, analytics, ai, review, voice, providers, feature-flags
Services call engines with plain data. Engines return plain data.
```

Rules enforced across the codebase:

```text
Pages must not import repositories.
Engines must not import React, Prisma, or the auth client.
Repositories always filter by organizationId.
Services resolve the request context and pass organization scope down.
```

## AI governance lifecycle

How a recommendation is produced and governed.

```text
Intelligence profile
  to AI engine (deterministic mock provider)
  to Recommendation (type, confidence score, confidence tier)
  to Explanation (reasoning factors, supporting signals, risk considerations)
  to Review engine (does it require human review, and why)
  to Review queue (pending, approved, rejected, needs revision, escalated)
  to Audit events (created, explanation generated, review required, completed)
```

A recommendation never becomes an action automatically. Human review is the
gate.

## Voice simulation lifecycle

How a simulated voice follow-up is planned, gated, and recorded.

```text
Intelligence profile and approved recommendation
  to Voice plan engine (purpose, priority, script, expected outcome)
  to Voice compliance engine (allowed, blocked, needs review)
  to Allowed only: simulated call
       to Transcript generator (clearly labeled simulated)
       to Voice outcome engine (outcome, stage transition, attribution)
  to Blocked or needs review: no call is simulated
  to Audit events (plan created, compliance result, call simulated, outcome)
```

No call is placed. No telephony provider is contacted. A blocked or needs
review plan never produces a completed call.

## Provider governance lifecycle

How providers are described, gated, and kept safely disabled.

```text
Provider registry (definitions only, placeholder secret names)
  to Capability matrix (which provider serves which capability)
  to Feature flag evaluation (live flags blocked in demo mode)
  to Provider selection engine (always the internal mock in demo mode)
  to Provider readiness (live ready requires flags, config, secrets,
       compliance approval, sandbox validation; never reached in demo mode)
  to Provider sandbox (deterministic illustration, no network call)
  to Provider audit events (selected, blocked by flag, blocked by compliance,
       sandbox run, readiness checked, flag evaluated, flag updated)
```

No SDK is installed. No provider API is called. No secret is stored.

## Multi-tenant data isolation

Every business record belongs to an organization, and access is scoped server
side.

```text
Request
  to Resolve request context (user, organization, role, source)
  to Authorization check (role to permission map, server side)
  to Service call carrying organizationId
  to Repository query filtered by organizationId
  to PostgreSQL rows for that organization only

Detail lookups require both the record id and the organizationId.
A demo fallback context resolves to the demo organization owner when no
authentication provider is configured.
```
