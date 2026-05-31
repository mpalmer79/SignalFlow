# Provider Management

Phase 10 introduces a provider governance layer. It describes which providers
SignalFlow could support, what each exposes, and what would be required before
live use. This phase does not enable any real provider.

## No real providers are enabled

This is the most important property of the layer:

- No provider SDK is installed.
- No provider API is called.
- No network call is made.
- No secret is stored. Required secrets are listed as placeholder names only,
  never as values.
- All live providers are disabled. Only internal mock providers are active.

Everything is deterministic and demo safe.

## What the layer answers

- Which providers could SignalFlow support?
- What capabilities does each provider expose?
- Is a capability enabled, demo only, blocked by a feature flag, or blocked by
  compliance?
- What would happen if a provider were selected?
- How is provider usage audited?
- What is required before live use?

## Provider registry

`lib/providers/provider-registry.ts` defines every provider. Each definition
carries a key, display name, category, status, capabilities, placeholder
required secrets, risk level, whether live use is allowed, whether a sandbox is
available, and notes.

Categories: AI_TEXT, AI_VOICE, TELEPHONY, SMS, EMAIL, INTERNAL_MOCK.

Statuses: mocked, future-ready, disabled, blocked.

Registered providers: OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI,
ElevenLabs, OpenAI Realtime, Twilio, Retell, Vapi, SendGrid, Internal Mock AI,
Internal Mock Voice, Internal Mock SMS, and Internal Mock Email. Every external
provider is future-ready at most and is never live in this phase.

## Capability matrix

`lib/providers/provider-capabilities.ts` defines the capability vocabulary:
TEXT_RECOMMENDATION, INTENT_CLASSIFICATION, EXPLANATION_GENERATION,
VOICE_SYNTHESIS, REALTIME_VOICE, CALL_TRANSPORT, SMS_DELIVERY, EMAIL_DELIVERY,
TRANSCRIPT_SUMMARY, and CALL_OUTCOME_CLASSIFICATION. The provider management
page renders a matrix of which providers serve which capabilities.

## Provider selection

`lib/providers/provider-selection-engine.ts` selects a provider for a
capability deterministically. While demo mode is active, the governing live
flag resolves to blocked, so the engine always selects the internal mock
provider. It never selects a live provider in this phase.

## Provider readiness

`lib/providers/provider-readiness.ts` computes readiness per provider and
capability. A provider is live-ready only if the governing feature flag is
allowed, the provider is configured, required secrets are documented,
compliance approval is present, sandbox validation has passed, and live use is
explicitly allowed. In this phase no external provider reaches live-ready.
Internal mock providers reach sandbox-ready, which is the highest reachable
state today.

## Provider audit trail

Provider decisions write audit events. Actions include PROVIDER_SELECTED,
PROVIDER_BLOCKED_BY_FLAG, PROVIDER_BLOCKED_BY_COMPLIANCE, PROVIDER_SANDBOX_RUN,
PROVIDER_READINESS_CHECKED, FEATURE_FLAG_EVALUATED, and FEATURE_FLAG_UPDATED.

## Pages

```text
/app/provider-management   registry, capability matrix, flags, readiness, audit
/app/provider-sandbox      deterministic provider request simulations
```

Provider management requires VIEW_PROVIDERS. The sandbox requires
RUN_PROVIDER_SANDBOX.

## How providers will be integrated later

A future phase implements adapters behind the existing provider interfaces,
gated by feature flags and provider configuration. Live use requires turning
off demo mode, enabling the governing flag, documenting and supplying secrets
through a secret manager, obtaining compliance approval, and passing sandbox
validation. None of that is wired in this phase, by design.

## Related documents

- FEATURE_FLAGS.md for the feature flag framework
- PROVIDER_SANDBOX.md for the sandbox model
- COMPLIANCE.md for the platform compliance posture
- DATA_MODEL.md for the provider persistence entities

## Phase 10 hardening (complete)

The provider governance layer has been safety reviewed:

- No SDK is installed and no provider API is called.
- No network call is made anywhere in the provider or feature flag engines.
- No secret is stored. Provider persistence has no apiKey, secret, token,
  credential, password, or privateKey field. Required secrets exist only as
  placeholder names in the registry.
- The app provides no form for entering a provider secret. The provider
  management and sandbox pages are read-only server components.
- Every live feature flag is disabled by default and is locked off while demo
  mode is active.
- No real provider can become live ready. A database check confirms zero
  live-ready readiness checks and zero external providers with live use enabled.
- Provider routes are protected server side by guardPage with the
  VIEW_PROVIDERS and RUN_PROVIDER_SANDBOX permissions, and by middleware.
- Provider decisions, readiness checks, sandbox runs, and feature flag changes
  are recorded as organization scoped provider audit events.

Internal mock providers are the only executable providers. Feature flags are
safety gates, not live toggles.
