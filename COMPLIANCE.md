# Compliance

SignalFlow treats consent and compliance as core platform concerns, not afterthoughts. This document describes the design intent. In Phase 0 these rules are modeled in a deterministic policy layer and surfaced in the UI. No live communication occurs.

## Consent-aware design

Consent is a first-class concept. Each customer carries a consent profile with a state per channel: granted, denied, unknown, or revoked. Before any action is simulated, the policy layer evaluates consent and produces one of three decisions: allowed, blocked, or needs review. Every decision is recorded as an audit event.

A channel can only be used when consent for that channel is granted. Missing or unknown consent blocks the channel until consent is captured.

## SMS and voice restrictions

SMS and voice carry stricter handling than email:

- A channel requires explicit, current consent for that channel.
- Consent for one channel does not imply consent for another.
- Revoked consent blocks the channel immediately.
- Quiet hours apply to outbound SMS and voice.

In Phase 0 these restrictions are enforced in the policy layer and displayed in the UI. No SMS or voice traffic is generated.

## Opt-out handling

Opt-out is absolute and immediate within the model:

- A customer who opts out is blocked across all channels.
- Active workflows halt as soon as an opt-out is recorded.
- The opt-out produces an audit event for traceability.

The mock data includes a customer who replied STOP to demonstrate this path. Their outreach is shown as blocked, and their workflow is shown as halted.

## Quiet hours

Each consent profile carries a quiet hours window and time zone. Outbound SMS and voice are not permitted inside the quiet hours window. When an action falls inside quiet hours, the policy layer returns a blocked decision with a quiet hours reason.

## Healthcare limitations

The medical vertical carries the highest compliance sensitivity:

- Content that is medical sensitive is routed to human review rather than sent automatically.
- The platform does not provide medical advice.
- Protected health information is flagged and handled with elevated care.

In Phase 0 the medical examples are illustrative only. The mock data includes a cancelled appointment that is held for human review to demonstrate this path.

## Legal limitations

The legal intake vertical does not provide legal advice. Intake is qualified and routed to a human for attorney handoff. Advice boundaries are flagged on the relevant records.

## No live communication in Phase 0

Phase 0 sends nothing. There is no live SMS, email, voice, or telephony. All providers are mocked and return deterministic demo responses. All communication records are labeled as simulated. A persistent demo banner communicates these limits across the app.

## Access control and tenancy

From Phase 6, access is governed server side. Authorization is deterministic and based on a fixed role to permission map. Every protected page resolves a request context on the server and checks a permission before rendering. The organization id always comes from the resolved server context, never from the client, and every business repository query is scoped to the active organization, so no customer data crosses organization boundaries. Deleting an organization cascades to its business records.

Authentication uses Clerk and is optional. When Clerk is not configured, a clearly labeled demo auth context keeps the application reviewable. The demo context is never treated as production authentication.

This strengthens compliance: consent records, policy decisions, communications, and audit events are all organization scoped, so a compliance reviewer only ever sees their own organization. Outbound communication remains disabled for the same reasons as earlier phases. Phase 6 adds access and tenancy, not delivery, so there is still no live SMS, email, voice, or telephony, and no AI provider calls.

## Voice compliance (Phase 9)

Phase 9 adds a deterministic voice compliance engine. Voice is fully simulated:
a passing check authorizes a simulated call, never a real one. No telephony
provider is integrated and no call is placed.

Before any call is simulated, the voice compliance engine evaluates a fixed set
of checks and resolves one verdict: allowed, blocked, or needs review. Hard
checks block the call: customer opted out, missing voice consent, quiet hours
active, or the repeated no-response limit reached. Soft checks require human
review: a compliance sensitive vertical such as legal intake or medical, an
unapproved AI recommendation, or a critical risk flag. Hard blocks take
precedence over review.

A blocked plan never produces a call. Every plan records a compliance decision
and writes the matching audit event. See VOICE_COMPLIANCE.md for the full
design.
