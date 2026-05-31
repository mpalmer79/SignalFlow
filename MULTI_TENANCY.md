# Multi-Tenancy

SignalFlow is organization scoped. Every business record belongs to an organization, every business model has a foreign key relation to Organization, and every business repository query is filtered by the active organization. This document describes the tenancy model as implemented.

## Models

Three models hold tenancy:

- Organization: id, name, slug (unique), industry, timestamps. Has many memberships and many business records.
- User: id, optional clerkUserId (unique), email (unique), name, timestamps. A user can exist without a Clerk account, which supports demo users. Has many memberships.
- Membership: id, userId, organizationId, role, status, timestamps. Links a user to an organization with a role. Unique on (userId, organizationId), indexed on organizationId. Status is ACTIVE, INVITED, or SUSPENDED.

A user has many memberships, and an organization has many memberships. The active membership establishes the organization context and role for a session.

## Organization scoping

Every business model carries an organizationId, an index on it, and a relation to Organization with onDelete Cascade:

```text
Customer
ContactMethod
ConsentRecord
Signal
Opportunity
Communication
AuditEvent
PolicyDecision
RiskFlag
WorkflowRun
WorkflowAction
WorkflowResult
OutcomeEvent
RevenueAttribution
StageTransition
WorkflowEffectivenessSnapshot
MissedOpportunityEstimate
```

VerticalPack is intentionally global shared configuration, not tenant data, so it is not organization scoped. Deleting an organization cascades to all of its business records, which keeps the data model consistent.

## Repository enforcement

Every repository read, count, and aggregate function for business data takes an organizationId and filters on it. There is no repository function that returns cross organization business data. Detail lookups use findFirst with both the id and the organizationId, so a record from another organization is never returned even if its id is known.

The organization id always comes from the resolved server context. It is never accepted from the client, a query parameter, or a request body. The settings page reads members through a settings service rather than importing a repository directly, so the page to service to repository boundary is intact.

## Service layer

Services receive a RequestContext and pass its organization id to repositories. Engines remain pure and never see Clerk or the request context. The flow is:

```text
Authenticated user
  to organization context
  to role based access check
  to org scoped repositories
  to org isolated revenue data
```

## Migration safety

The Phase 6 migration is backfill safe. It creates the organization tables, inserts the demo organization, adds organizationId as nullable, backfills every existing business row to the demo organization, then enforces NOT NULL. It therefore succeeds against both an empty and a non-empty local database. A follow up migration adds the foreign key relations from every business model to Organization.

For local development, the recommended flow is a clean reset with seed:

```text
npx prisma migrate reset --force
```

This applies the full migration chain and reseeds a deterministic demo organization with all business data attached.

## Demo organization

The seed creates a single demo organization:

- Name: SignalFlow Demo Organization
- Slug: signalflow-demo
- Industry: Multi-Vertical Revenue Operations

It seeds six demo users with memberships across the role range: Owner, Manager, Sales, Marketing, Compliance, and Viewer. These users have no Clerk accounts. They exist so the members list and roles render and so the demo auth context resolves to a real organization. All seeded business data, including the generated populations across every vertical, is attached to this organization. The seed remains deterministic.

## Demo fallback and isolation

When Clerk is not configured, the demo context resolves to the demo organization owner. This is clearly labeled in the UI and is the only non-Clerk context path. It is not production authentication. Because the demo context still carries a real organization id, organization scoping is exercised exactly as it would be for a Clerk session. Cross organization isolation has been verified behaviorally: a record created in a second organization is not returned to the demo organization context.

## What remains mocked

Tenancy is real, but delivery is not. There are no AI provider calls, no SMS, email, or voice, and no outbound communication. Those remain disabled. Invitation flows are out of scope for this phase; members are seeded rather than invited.

## Demo fallback production guard (Phase 12)

The demo owner context is a development and review convenience. It is refused in
production unless ALLOW_DEMO_MODE is set to true, so a production deployment
without a configured authentication provider returns an unauthenticated state
rather than granting owner access to the seeded demo organization. See
AUTHORIZATION.md for the rule. Organization scoping is unchanged: every query
still filters by the organization id from the resolved server context.
