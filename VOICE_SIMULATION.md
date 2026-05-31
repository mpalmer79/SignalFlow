# Voice Simulation

This document describes how SignalFlow simulates a voice call and generates a
transcript. No real call is placed and no provider is contacted. Every output
is deterministic and clearly labeled simulated.

## Call simulation

`simulateVoiceCall` in `lib/voice/voice-call-simulator.ts` produces a call
result from a plan and its input. A blocked plan always yields a compliance
stop. Otherwise the outcome is a pure function of the input, computed by
`expectedOutcomeFor`:

```text
Opted out or no voice consent  to COMPLIANCE_STOP
Three or more prior no-answers to NO_ANSWER
High intent and high engagement to APPOINTMENT_SCHEDULED
Good intent and engagement      to CUSTOMER_INTERESTED
Moderate intent and engagement  to CALLBACK_REQUESTED
Very low engagement             to VOICEMAIL_LEFT
Low intent                      to CUSTOMER_NOT_INTERESTED
Otherwise                       to NEEDS_HUMAN_FOLLOW_UP
```

The call result records whether the call connected and a deterministic
duration derived from the outcome and engagement.

## Transcript generation

`generateTranscript` in `lib/voice/voice-transcript-generator.ts` produces a
short, structured, clearly simulated transcript. A connected call has:

```text
Agent opening and reason for call
Customer response
Agent follow-up or human handoff language
Customer close
Outcome line
```

Non-connected outcomes produce a shorter transcript. A compliance stop produces
a single agent line explaining the call was held back, followed by the outcome.
Every transcript carries a simulated flag.

The scripts are drawn from the vertical script library and contain no medical,
legal, or financial advice. Legal scripts explicitly state that the call is to
schedule a consultation, not to provide legal advice.

## Outcome mapping

`assessVoiceOutcome` in `lib/voice/voice-outcome-engine.ts` maps a call result
into the shared Phase 4 vocabulary:

```text
APPOINTMENT_SCHEDULED  to APPOINTMENT_SCHEDULED outcome, stage to appointment-set, INFLUENCED attribution
CUSTOMER_INTERESTED    to OPPORTUNITY_ADVANCED outcome, stage to engaged, ASSISTED attribution
CALLBACK_REQUESTED     to CUSTOMER_REPLIED outcome, ASSISTED attribution
NEEDS_HUMAN_FOLLOW_UP  to HUMAN_TASK_CREATED outcome, ASSISTED attribution
NO_ANSWER, VOICEMAIL, WRONG_NUMBER to NO_RESPONSE outcome
COMPLIANCE_STOP        to COMPLIANCE_STOP outcome
```

Attribution amounts are a fraction of the opportunity value, scaled by the
strength of the outcome. A dormant opportunity that connects is moved to
reactivated.

## Determinism and safety

There is no randomness anywhere in the simulation. The same customer, the same
recommendation, and the same conditions always produce the same plan, call,
transcript, outcome, and attribution. Nothing is sent, no provider is called,
and no secret is required.

## Seed coverage

The seed generates voice plans across every customer and every vertical,
producing a spread of allowed, blocked, and needs-review plans, and a range of
call outcomes including appointment scheduled, interested, callback requested,
human follow-up, voicemail, no answer, and compliance stop.
