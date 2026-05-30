# Providers

SignalFlow isolates every external dependency behind a typed provider interface. In Phase 0 all providers are mocked. The mock implementations return deterministic responses and make no network calls. This keeps the app runnable without secrets and safe to demo.

The mock provider files live in `lib/providers`. Each file states the future integration it represents and exposes simple functions that return a typed, simulated response.

## AI provider

File: `lib/providers/ai-provider.mock.ts`

Responsibilities in later phases: intent classification and message drafting.

Planned integrations: OpenAI, Anthropic Claude, Google Gemini.

Phase 0 behavior: `classifyIntent` and `draftMessage` return deterministic summaries. No model is called.

## SMS provider

File: `lib/providers/sms-provider.mock.ts`

Responsibilities in later phases: outbound SMS delivery and delivery status.

Planned integration: Twilio.

Phase 0 behavior: `sendSms` returns a simulated result and sends nothing.

## Email provider

File: `lib/providers/email-provider.mock.ts`

Responsibilities in later phases: outbound email delivery and engagement events.

Planned integration: SendGrid.

Phase 0 behavior: `sendEmail` returns a simulated result and sends nothing.

## Voice provider

File: `lib/providers/voice-provider.mock.ts`

Responsibilities in later phases: voice script synthesis and call orchestration.

Planned integrations: ElevenLabs for voice synthesis and Twilio for telephony.

Phase 0 behavior: `queueVoiceCall` returns a simulated result and places no call.

## Telephony provider

Telephony is the call transport layer that sits beneath the voice provider. Planned integration: Twilio. In Phase 0 there is no telephony. Voice follow-ups appear only as simulated queue entries.

## Boundary rules

- Domain code depends on provider interfaces, never on a specific vendor.
- Swapping a vendor does not change domain types or UI.
- Provider credentials are read from environment variables in later phases and are never committed.
- Phase 0 ships no credentials and makes no provider calls.
