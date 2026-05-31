# Voice Compliance

Voice calls in SignalFlow do not proceed unless a deterministic compliance
check allows them. This document describes the checks, the verdicts, and how
they are recorded. Voice is fully simulated: a passing check authorizes a
simulated call, never a real one.

## When a call is allowed

`evaluateVoiceCompliance` in `lib/voice/voice-compliance-engine.ts` is pure and
deterministic. It runs a fixed set of checks and resolves a single verdict.

Hard checks. A failure on any of these blocks the call:

```text
Customer not opted out
Voice consent present
Quiet hours not active
Repeated no-response limit not reached
```

Soft checks. These do not block, but they require human review:

```text
Compliance sensitive vertical (legal intake, medical)
The underlying AI recommendation has not been approved by a human
A critical risk flag is present
```

## Verdicts

```text
allowed       all checks pass; a call may be simulated
blocked       a hard check failed; no call is simulated
needs-review  a soft check requires a human decision first
```

## Blocked reasons

```text
MISSING_VOICE_CONSENT
CUSTOMER_OPTED_OUT
QUIET_HOURS
COMPLIANCE_SENSITIVE
REPEATED_NO_RESPONSE
HUMAN_REVIEW_REQUIRED
```

The repeated no-response limit is three. A customer with three or more prior
no-response calls is held back so a human can decide whether to keep calling.

## Precedence

Hard blocks take precedence over review. If a customer has opted out and is
also in a sensitive vertical, the verdict is blocked, not needs-review. This
keeps the strongest protection in force.

## What proceeds to a call

Only an allowed plan proceeds to a simulated call. A blocked plan records its
compliance decision and a blocked reason, but never produces a call. A
needs-review plan is surfaced in the voice command center for a human to act
on; in the seed it is recorded with its review requirement.

## Audit trail

Every voice plan writes a `VOICE_PLAN_CREATED` audit event and one of:

```text
VOICE_COMPLIANCE_ALLOWED
VOICE_COMPLIANCE_BLOCKED
VOICE_COMPLIANCE_NEEDS_REVIEW
```

The decision, its reason, the customer, and the organization are all recorded.
The full set of voice audit events is visible on the voice replay page.

## Determinism

The compliance engine has no randomness. The same input always produces the
same verdict, reason, and checks, which keeps the demo reproducible and the
audit trail explainable.
