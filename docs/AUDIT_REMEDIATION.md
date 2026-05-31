# Audit Remediation

Phase 12 converts the principal engineer audit into concrete remediation. This
document records what was addressed and how.

## 1. Continuous integration

Added `.github/workflows/ci.yml` running typecheck, lint, tests, safety scan,
architecture check, Prisma validate, and build on push and pull request.

## 2. Test foundation

Added Vitest and 39 unit tests across feature flags, providers, voice
compliance, AI governance, the workflow validator, and revenue attribution.
Tests target pure engines and run with no database.

## 3. Demo owner production risk

The demo fallback now refuses to grant owner access in production unless
`ALLOW_DEMO_MODE=true` is set. Outside production it is unchanged, so local
development and review are not affected. Implemented in
`lib/auth/auth-context.ts` as `isDemoFallbackAllowed`.

## 4. Dead code removal

Deleted the superseded Phase 0 provider cluster (`ai-provider.mock.ts`,
`voice-provider.mock.ts`, `sms-provider.mock.ts`, `email-provider.mock.ts`,
`index.ts`, `types.ts`), the five zero-caller voice repository re-export shims,
three zero-caller services (`organization-service`, `revenue-attribution-service`,
`vertical-pack-config-service`), and the empty `lib/types/index.ts`. Verified
zero imports before deletion. Archived the historical root docs `PROVIDERS.md`,
`MVP_SCOPE.md`, and `DEMO_SCRIPT.md` to `docs/archive/`.

## 5. Architecture boundary enforcement

Added `scripts/check-architecture-boundaries.ts` and the `check:architecture`
script. It enforces that pages do not import repositories and that engines do
not import React, Prisma, Clerk, next, or provider SDKs.

## 6. Safety scan

Added `scripts/scan-safety.ts` and the `scan:safety` script. It fails on
attribution footers, Claude URLs, em dashes, real secret env names, network
calls, and banned provider SDKs in `package.json`.

## 7. Audit cascade deletion risk

Customers now carry a soft delete marker (`Customer.deletedAt`). A customer is
never hard deleted in normal operation, so outcome, attribution, AI, voice, and
audit history is preserved. The immutable audit log additionally uses
`onDelete: SetNull` on its customer, signal, opportunity, and workflow run
relations, so an audit row survives even a genuine hard delete. See
DATA_MODEL.md and COMPLIANCE.md.

## 8. Revenue Command Center N+1

`buildVerticalMemory` and `buildOutcomeMemory` previously issued one set of
queries per customer, plus a per run effectiveness query. They now issue four
bulk queries and join the records in memory through a pure helper,
`buildOutcomeMemoryInputs`. A query counter confirmed the vertical memory path
drops from several hundred queries to four.

## 9. Missing indexes

Added composite `(organizationId, time)` indexes to Signal, Communication,
WorkflowRun, OutcomeEvent, RevenueAttribution, ProviderAuditEvent,
AIRecommendation, VoicePlan, and VoiceCall, and indexes on the optional foreign
keys `VoicePlan.opportunityId`, `VoicePlan.recommendationId`,
`VoiceCall.opportunityId`, and `VoiceCallOutcome.opportunityId`.

## 10. Dangling foreign keys

`VoicePlan.recommendationId` now has a real relation to `AIRecommendation` with
`onDelete: SetNull`. `VoicePlan.opportunityId` uses `SetNull`.
`VoiceCallOutcome.customerId` and `VoiceCallOutcome.opportunityId` remain
denormalized strings copied from the parent call by the writer; this is
documented in DATA_MODEL.md as an intentional denormalization for the analytics
read path.

## 11. Voice review approval flow

Added a minimal compliance review flow. A reviewer with the
`REVIEW_AI_RECOMMENDATIONS` permission can approve or reject a needs-review
voice plan from the review queue. Approving sets the plan to allowed and ready,
which makes it eligible for simulation under the existing rules; it does not
place a call or trigger a simulation. The decision is recorded with an audit
event and is organization scoped. Implemented as a server action backed by
`submitVoiceReviewDecision` and `recordVoiceReviewDecision`.

## 12. Documentation

Added this document, `docs/ENGINEERING_QUALITY.md`, and
`docs/TECHNICAL_DEBT_REGISTER.md`. Updated README, ROADMAP, DATA_MODEL,
COMPLIANCE, AUTHORIZATION, MULTI_TENANCY, and the repo quality checklist.
