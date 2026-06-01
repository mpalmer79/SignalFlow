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

## Tenancy entities (Phase 6)

### Organization

A tenant. Fields: id, name, slug (unique), industry, timestamps. Has many memberships and many business records.

### User

An authenticated or demo user. Fields: id, optional clerkUserId (unique), email (unique), name, timestamps. A user may exist without a Clerk account, which supports demo users. Has many memberships.

### Membership

Links a user to an organization with a role. Fields: id, userId, organizationId, role, status, timestamps. Unique on (userId, organizationId), indexed on organizationId. Role is one of OWNER, ADMIN, MANAGER, SALES_USER, SERVICE_USER, MARKETING_USER, COMPLIANCE_REVIEWER, VIEWER. Status is ACTIVE, INVITED, or SUSPENDED.

## Organization scoping (Phase 6)

Every business model carries an organizationId with an index and a foreign key relation to Organization with onDelete Cascade: Customer, ContactMethod, ConsentRecord, Signal, Opportunity, Communication, AuditEvent, PolicyDecision, RiskFlag, WorkflowRun, WorkflowAction, WorkflowResult, OutcomeEvent, RevenueAttribution, StageTransition, WorkflowEffectivenessSnapshot, and MissedOpportunityEstimate. VerticalPack is intentionally global shared configuration and is not organization scoped. AuditEvent customerId is nullable so organization lifecycle events (membership and authorization) can be recorded without a customer.

The Phase 6 migration is backfill safe: it inserts the demo organization, adds organizationId as nullable, backfills existing rows, then enforces NOT NULL. A follow up migration adds the foreign key relations. See MULTI_TENANCY.md and AUTHORIZATION.md for the access model.

## Phase 7 AI entities

Phase 7 adds three organization scoped AI entities. Every record carries an
organizationId and cascades on organization delete. Domain enums use hyphens and
Prisma enums use underscores, with converters in the AI repository.

### AIRecommendation

```text
id                stable identifier
organizationId    owning organization
customerId        customer the recommendation is about
opportunityId     related opportunity, optional
recommendationType one of the deterministic recommendation types
recommendationLabel human readable action label
confidence        integer score from 0 to 100
confidenceTier    Very High, High, Moderate, or Low
provider          producing provider, deterministic.mock today
status            lifecycle status (draft to archived)
reviewState       pending_review, approved, rejected, needs_revision, escalated
createdAt         creation timestamp
```

### AIExplanation

```text
id                stable identifier
organizationId    owning organization
recommendationId  the explained recommendation
explanation       the recommended action statement
reasoningFactors  ordered reasoning factors
supportingSignals signals that support the recommendation
riskConsiderations risks a reviewer should weigh
createdAt         creation timestamp
```

### AIReviewDecision

```text
id                stable identifier
organizationId    owning organization
recommendationId  the reviewed recommendation
reviewerId        reviewer identity from server context
reviewerName      reviewer display name
decision          approved, rejected, needs-revision, or escalated
notes             reviewer notes
createdAt         decision timestamp
```

### Enums

```text
AIRecommendationStatus   draft, generated, pending_review, approved, rejected, executed, archived
AIReviewState            pending_review, approved, rejected, needs_revision, escalated
AIReviewDecisionType     approved, rejected, needs_revision, escalated
```

### Audit event types

```text
AI_RECOMMENDATION_CREATED
AI_RECOMMENDATION_APPROVED
AI_RECOMMENDATION_REJECTED
AI_EXPLANATION_GENERATED
AI_REVIEW_REQUIRED
AI_REVIEW_COMPLETED
```

## Phase 9 voice entities

Phase 9 adds five organization scoped voice entities. Voice is fully simulated:
these records describe simulated calls and never a real one. Domain enums use
hyphens and Prisma enums use underscores, with converters in the voice
repository.

### VoicePlan

```text
id                stable identifier
organizationId    owning organization
customerId        customer the plan is for
opportunityId     related opportunity, optional
recommendationId  the AI recommendation that justified the plan, optional
purpose           the call purpose (lead follow-up, appointment recovery, and so on)
priority          immediate, high, standard, or low
scriptType        the recommended vertical script
status            planned, blocked, needs_review, ready, simulated, or archived
complianceStatus  allowed, blocked, or needs_review
blockedReason     the blocked reason, when blocked
expectedOutcome   the deterministic expected call outcome
requiresApproval  whether a human must approve before the call
createdAt         creation timestamp
```

### VoiceCall

```text
id                stable identifier
organizationId    owning organization
voicePlanId       the plan that produced the call (unique)
customerId        customer
opportunityId     related opportunity, optional
status            pending, simulated, blocked, no_answer, or completed
connected         whether the simulated call connected
durationSeconds   deterministic simulated duration
startedAt         start timestamp
completedAt       completion timestamp
```

### VoiceTranscript

```text
id                stable identifier
organizationId    owning organization
voiceCallId       the call the transcript belongs to (unique)
transcript        the simulated transcript lines, serialized
summary           a short summary
createdAt         creation timestamp
```

### VoiceComplianceDecision

```text
id                stable identifier
organizationId    owning organization
voicePlanId       the plan the decision applies to (unique)
decision          allowed, blocked, or needs_review
reason            the deterministic reason
createdAt         creation timestamp
```

### VoiceCallOutcome

```text
id                stable identifier
organizationId    owning organization
voiceCallId       the call the outcome belongs to (unique)
customerId        customer
opportunityId     related opportunity, optional
outcomeType       the deterministic call outcome
outcomeReason     a short reason
attributedAmount  revenue attributed from the simulated call
createdAt         creation timestamp
```

### Voice audit event types

```text
VOICE_PLAN_CREATED
VOICE_COMPLIANCE_ALLOWED
VOICE_COMPLIANCE_BLOCKED
VOICE_COMPLIANCE_NEEDS_REVIEW
VOICE_CALL_SIMULATED
VOICE_TRANSCRIPT_CREATED
VOICE_OUTCOME_CREATED
VOICE_REVENUE_ATTRIBUTED
```

## Phase 10 provider governance entities

Phase 10 adds four organization scoped entities for provider governance. No
entity stores a secret. Required secrets are documented in the provider
registry as placeholder names only. Domain enums use hyphens and Prisma enums
use underscores, with converters in the repositories.

### ProviderConfiguration

```text
id                 stable identifier
organizationId     owning organization
providerKey        registry provider key
category           AI_TEXT, AI_VOICE, TELEPHONY, SMS, EMAIL, or INTERNAL_MOCK
status             mocked, future_ready, disabled, or blocked
sandboxEnabled     whether sandbox simulation is enabled
liveEnabled        whether live use is enabled, always false in this phase
complianceApproved whether compliance has approved live use, false in this phase
configuredAt       when the configuration was set, optional
createdAt          creation timestamp
updatedAt          update timestamp
```

Unique on (organizationId, providerKey). No API key or secret field exists.

### FeatureFlag

```text
id                 stable identifier
organizationId     owning organization
flagKey            registry flag key
enabled            the stored requested value
reason             why the value was set
createdAt          creation timestamp
updatedAt          update timestamp
```

Unique on (organizationId, flagKey). The evaluator applies the deterministic
policy on top of the stored value; live flags are locked off in demo mode.

### ProviderAuditEvent

```text
id                 stable identifier
organizationId     owning organization
providerKey        the provider or platform the event concerns
action             PROVIDER_SELECTED, PROVIDER_BLOCKED_BY_FLAG, and so on
result             allowed, blocked, simulated, or recorded
reason             a short reason
createdAt          creation timestamp
```

### ProviderReadinessCheck

```text
id                  stable identifier
organizationId      owning organization
providerKey         registry provider key
capability          the capability checked
status              live_ready, sandbox_ready, or not_ready
missingRequirements the unmet live requirements
createdAt           creation timestamp
```

### Provider audit event types

```text
PROVIDER_SELECTED
PROVIDER_BLOCKED_BY_FLAG
PROVIDER_BLOCKED_BY_COMPLIANCE
PROVIDER_SANDBOX_RUN
PROVIDER_READINESS_CHECKED
FEATURE_FLAG_EVALUATED
FEATURE_FLAG_UPDATED
```

## Phase 12 integrity and history changes

Soft delete. Customer carries a deletedAt marker. A customer is never hard
deleted in normal operation; setting deletedAt removes it from active views
while preserving every outcome, attribution, AI, voice, and audit record. The
cascade relations on history tables therefore only fire on a genuine hard purge
such as organization teardown.

Audit durability. AuditEvent uses onDelete SetNull on its customer, signal,
opportunity, and workflow run relations, so an audit row survives even a hard
delete of the entity it references.

Voice foreign keys. VoicePlan.recommendationId now has a real relation to
AIRecommendation with onDelete SetNull, and VoicePlan.opportunityId uses
SetNull. VoiceCallOutcome.customerId and VoiceCallOutcome.opportunityId remain
denormalized strings copied from the parent VoiceCall by the writer. This is an
intentional denormalization: the outcome row is always created together with its
call inside one persistence path, and the denormalized ids serve the analytics
read path without an extra join. They are indexed for that path.

Indexes. Composite (organizationId, time) indexes were added to Signal,
Communication, WorkflowRun, OutcomeEvent, RevenueAttribution, ProviderAuditEvent,
AIRecommendation, VoicePlan, and VoiceCall for the recent-per-organization query
pattern, plus indexes on the optional foreign keys VoicePlan.opportunityId,
VoicePlan.recommendationId, VoiceCall.opportunityId, and
VoiceCallOutcome.opportunityId.

Voice review fields. VoicePlan carries reviewedBy, reviewedAt, and reviewNotes
to record a human review decision on a needs-review plan.
