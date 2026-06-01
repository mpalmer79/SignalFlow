# Technical Highlights

A staff-level breakdown of how SignalFlow is built and what it demonstrates.
Everything is deterministic and demo safe.

## Domain-driven architecture

The codebase is organized by domain, not by framework. Each domain owns its
types, its pure engine, its repository, and its service. The pure engines hold
the deterministic business logic and depend only on plain types. This keeps the
hard logic testable in isolation and free of framework concerns.

## Repository and service boundaries

The layering is enforced, not just suggested:

- Pages render and call services. Pages never import repositories.
- Services hold business logic, resolve the request context, and compose
  repositories and engines.
- Repositories are the only layer that touches Prisma, and every query is
  organization scoped.
- Engines are pure and import no React, no Prisma, and no auth client.

These boundaries are verified by repository scans, not left to convention.

## Organization-scoped multi-tenancy

Every business record carries an organizationId with a foreign key to the
organization and a cascade on delete. Repository queries filter by
organizationId, and detail lookups require both the record id and the
organization id, so a record from another organization cannot be read by id.
The request context that carries the organization is resolved server side.

## Deterministic intelligence layer

The signal engine normalizes raw events into a stable vocabulary, then scores
intent, opportunity, and engagement from a centralized scoring configuration.
Opportunity detection and next best action are rule based and deterministic, so
the same inputs always produce the same intelligence profile.

## Action graph and workflow engine

The action graph turns an intelligence profile into typed action nodes and
edges. The workflow engine builds, validates, evaluates, and simulates a plan.
A policy evaluation layer returns allowed, blocked, or needs review for every
action based on consent, quiet hours, and vertical sensitivity. Execution is
simulated and produces audit events. Nothing is sent.

## Outcome memory and revenue attribution

Simulated workflow runs are classified into outcome events, opportunities
advance through stage transitions, and revenue is attributed with influenced,
assisted, recovered, prevented loss, and missed types. An outcome memory
summary aggregates which signals, actions, and verticals produce the strongest
outcomes.

## AI recommendation governance

The AI layer is a provider abstraction with a deterministic mock
implementation. It produces a recommendation type, a confidence score and tier,
and a full explanation with reasoning factors, supporting signals, and risk
considerations. A review engine decides when human review is required, and a
review queue tracks the decision. No AI provider is called.

## Human review workflow

AI recommendations and sensitive voice plans never become actions
automatically. They route to a human review queue with explicit states and
reasons. Review status controls downstream eligibility, so a needs review item
is never reported as completed.

## Voice simulation

The voice platform plans a call, runs a deterministic compliance engine, and,
only when the plan is allowed, simulates the call and generates a clearly
labeled transcript. Outcomes map into the shared outcome and attribution model.
No call is placed and no telephony provider is contacted.

## Provider governance and feature flag safety model

A provider registry defines every provider with a category, capabilities,
placeholder secret names, and a status. A capability matrix maps providers to
capabilities. A deterministic feature flag framework gates live use, and every
live flag is locked off while demo mode is active. A readiness engine reports
honestly that no external provider is live ready, and a sandbox shows what a
request would look like without making one. No SDK is installed and no secret
is stored.

## Auditability

Every meaningful decision and action produces an audit event scoped to the
organization: signals, policy decisions, workflow actions, outcomes, attribution,
AI recommendation lifecycle, voice plan and call lifecycle, and provider
governance. The audit trail connects a customer and an opportunity to the
decisions made about them.

## Compliance-aware design

Consent is a first class concept with a per channel state. The policy layer and
the voice compliance engine enforce consent, opt-out, quiet hours, and vertical
sensitivity before anything is simulated. Provider governance adds compliance
approval as an explicit gate before any future live use.

## Technology choices

TypeScript end to end with Next.js App Router and React server components.
Tailwind with a small component library. PostgreSQL with Prisma as the source
of truth. Clerk as an optional authentication provider with a deterministic
demo fallback so the platform is fully reviewable without any keys.

## Responsive, device-aware reviewer experience

The frontend is responsive first, with a small device awareness layer on top.
Tailwind responsive classes drive every layout and work during server render
with no hydration risk. A pure, tested detection module classifies a device as
mobile, tablet, desktop, or unknown from a weak server user agent hint and a
reliable client refinement using viewport width, touch, and orientation. A
client provider exposes the profile and a data-device attribute for CSS
targeting, rendering unknown on the server and refining after mount to avoid
hydration mismatches. The result adds a tap-friendly mobile navigation menu
below the desktop breakpoint, a short reviewer banner on a few high value
pages, and reduced metric density on phones, without changing any product
logic. Device detection is used only for presentation, never for authorization,
business logic, AI behavior, provider selection, workflow execution, or
compliance. See docs/FRONTEND_DEVICE_EXPERIENCE.md.
