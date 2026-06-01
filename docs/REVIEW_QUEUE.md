# Human Review Queue

AI recommendations in SignalFlow do not become actions automatically. Every
recommendation passes through a human review queue. This document describes when
review is required, the states a recommendation moves through, and how decisions
are recorded and audited.

## Why review exists

A recommendation is a suggestion, not an action. Human review keeps a person
accountable for anything the system acts on, which is essential for regulated
verticals such as legal intake, insurance, and anything medical adjacent. It
also gives reviewers a place to catch low confidence or high risk suggestions
before they reach a customer.

## When review is required

`determineReviewRequirement` in `lib/review/review-engine.ts` is deterministic.
A recommendation requires review when any of these conditions hold:

```text
Confidence below threshold (REVIEW_CONFIDENCE_THRESHOLD = 70)
Compliance or consent risk present
High value opportunity (HIGH_VALUE_THRESHOLD = 10000)
Legal intake scenario
Medical related scenario
Policy conflict
```

Each matching condition is recorded as a review reason so the queue can show
exactly why a human was asked to look.

## Review states

```text
Pending Review
Approved
Rejected
Needs Revision
Escalated
```

A recommendation that does not trip any review condition can still be surfaced,
but anything that does is placed in Pending Review or Escalated depending on the
severity of the reasons.

## Decisions and transitions

Reviewers submit one of the following decisions:

```text
approved      to Approved, recommendation status Approved
rejected      to Rejected, recommendation status Rejected
needs-revision to Needs Revision
escalated     to Escalated
```

The allowed transitions are enforced by `canTransition` and the
`ALLOWED_TRANSITIONS` map in `lib/review/review-decision.ts`. Invalid
transitions are rejected rather than silently applied.

## Audit trail

Every decision writes an audit event:

```text
AI_REVIEW_REQUIRED      when a recommendation enters the queue
AI_RECOMMENDATION_APPROVED
AI_RECOMMENDATION_REJECTED
AI_REVIEW_COMPLETED     for needs-revision and escalated outcomes
```

Each event carries the organization id, the customer, the opportunity when
present, the reviewer, and the decision. The full review history for a
recommendation is visible on its detail page in the AI Center.

## Pages

```text
/app/review-queue   recommendations grouped by review state
/app/ai-center      all recommendations with confidence and review status
/app/ai-center/[id] full explanation and review history for one recommendation
```

## Permissions

```text
VIEW_AI_RECOMMENDATIONS    view the AI Center and review queue
REVIEW_AI_RECOMMENDATIONS  submit review decisions
```

Owners and Managers and Compliance Reviewers can submit decisions. Read only and
other roles can view. See AUTHORIZATION.md for the full role map.

## Determinism

The review engine is pure logic with no randomness. The same recommendation
always produces the same review requirement, reasons, and recommended state,
which keeps the demo reproducible and the audit trail explainable.
