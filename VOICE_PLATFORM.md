# Voice AI Simulation Platform

Phase 9 introduces a complete simulated voice follow-up platform. It
demonstrates how an AI native revenue system would handle voice follow-up
without placing a single real call.

## Voice is simulated

This is the most important property of the platform. In Phase 9:

- No real voice calls are placed.
- No telephony provider is integrated or contacted.
- ElevenLabs, OpenAI Realtime, Twilio, Retell, and Vapi are named as future
  providers only. None are installed and none are called.
- There are no network calls, no secrets, no SMS, and no email.
- Every transcript is clearly labeled simulated.

Everything is deterministic and demo safe.

## What the platform answers

For any customer the platform can answer:

- When should a customer be called?
- Is voice contact allowed?
- Who needs to approve the call?
- What script should be used?
- What would the simulated conversation look like?
- What outcome would the call produce?
- How does the call affect revenue attribution?
- How is the call audited?

## Pipeline position

Phase 9 inserts a voice branch into the revenue pipeline:

```text
Signal
  to Intelligence
  to AI Recommendation
  to Human Review
  to Voice Plan
  to Voice Compliance Check
  to Simulated Call
  to Transcript
  to Call Outcome
  to Revenue Attribution
  to Audit Trail
```

A voice plan is only built once an AI recommendation exists. A call is only
simulated once the plan passes a deterministic compliance check.

## Module map

All voice modules are pure business logic. They do not import React, Prisma,
or Clerk, and they never call a provider.

```text
lib/voice/
  voice-provider-interface.ts    VoiceProvider interface and future provider list
  mock-voice-provider.ts         deterministic implementation (deterministic.voice.mock)
  voice-plan-engine.ts           builds a plan: purpose, priority, script, compliance, expected outcome
  voice-compliance-engine.ts     deterministic compliance checks and verdict
  voice-script-engine.ts         aggregates structured scripts by vertical
  voice-call-simulator.ts        deterministic simulated call result
  voice-transcript-generator.ts  deterministic, clearly simulated transcripts
  voice-outcome-engine.ts        maps a call into outcome, stage, and attribution
  voice-analytics.ts             pure aggregation helpers

lib/voice/scripts/
  automotive-voice-scripts.ts
  dental-voice-scripts.ts
  home-services-voice-scripts.ts
  legal-voice-scripts.ts
  insurance-voice-scripts.ts
```

Persistence and orchestration live outside the pure layer:

```text
lib/repositories/voice-repository.ts        org scoped persistence and aggregation
lib/repositories/voice-plan-repository.ts   focused plan exports
lib/repositories/voice-call-repository.ts   focused call exports
lib/repositories/voice-transcript-repository.ts
lib/repositories/voice-compliance-repository.ts
lib/repositories/voice-outcome-repository.ts
lib/services/voice-simulation-service.ts    builds and persists a plan and call
lib/services/voice-command-center-service.ts  voice operations aggregation
lib/services/voice-replay-service.ts        single call replay
```

## Voice provider abstraction

`VoiceProvider` describes the surface a real provider would implement:

```text
createCallPlan()
generateScript()
simulateCall()
generateTranscript()
classifyCallOutcome()
summarizeCall()
```

The only implementation today is `mockVoiceProvider`, identified as
`deterministic.voice.mock`. It produces identical output for identical input.
The abstraction is designed so a real provider could be added later behind the
same interface without changing callers.

## Call purposes

```text
LEAD_FOLLOW_UP
APPOINTMENT_CONFIRMATION
APPOINTMENT_RECOVERY
DORMANT_LEAD_REACTIVATION
SERVICE_REMINDER
ESTIMATE_FOLLOW_UP
CONSULTATION_SCHEDULING
RENEWAL_FOLLOW_UP
```

The plan engine maps an intelligence and recommendation context to one of these
deterministically.

## Call outcomes

```text
APPOINTMENT_SCHEDULED
CALLBACK_REQUESTED
CUSTOMER_INTERESTED
CUSTOMER_NOT_INTERESTED
NEEDS_HUMAN_FOLLOW_UP
NO_ANSWER
VOICEMAIL_LEFT
WRONG_NUMBER
COMPLIANCE_STOP
```

Outcomes are a pure function of intent, opportunity, engagement, consent, risk
flags, review status, vertical, and prior no-response count. There is no
randomness.

## Revenue integration

A simulated call maps into the existing Phase 4 outcome and attribution model.
An appointment scheduled becomes an APPOINTMENT_SCHEDULED outcome, advances the
opportunity stage, and records an INFLUENCED attribution. An interested
customer records an ASSISTED attribution. The Revenue Command Center and the
dashboard surface voice plans, simulated calls, appointments from voice, and
voice influenced revenue.

## Pages

```text
/app/voice-command-center                    voice operations overview
/app/voice-command-center/replay/[callId]    single call replay
```

Both require the VIEW_VOICE permission.

## Why providers remain mocked

The goal of Phase 9 is to prove the architecture and governance model for voice
without taking on a telephony dependency, cost, latency, secrets, or the risk
of placing a real call. A deterministic mock keeps the demo safe and
reproducible while leaving a clean seam for a real provider.

## Related documents

- VOICE_COMPLIANCE.md for the compliance checks and verdicts
- VOICE_SIMULATION.md for the call simulation and transcript model
- COMPLIANCE.md for the platform wide consent and compliance posture
- DATA_MODEL.md for the voice persistence entities
