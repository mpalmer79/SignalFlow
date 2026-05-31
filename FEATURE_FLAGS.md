# Feature Flags

Phase 10 introduces a deterministic feature flag framework. Flags gate
provider capabilities. Every flag that governs a live capability defaults to
disabled and is locked off while demo mode is active.

## Flags

```text
ENABLE_LIVE_AI               governs live text providers
ENABLE_LIVE_VOICE            governs live voice and telephony providers
ENABLE_LIVE_SMS              governs live SMS delivery
ENABLE_LIVE_EMAIL            governs live email delivery
ENABLE_PROVIDER_SANDBOX      allows sandbox simulations, no network calls
ENABLE_REALTIME_TRANSCRIPTS  governs realtime transcript streaming
ENABLE_EXTERNAL_WEBHOOKS     governs outbound webhooks
ENABLE_DEMO_MODE             keeps the platform deterministic and demo safe
```

## Evaluation states

```text
allowed                  the capability may proceed
blocked                  locked off, for live flags while demo mode is active
disabled                 turned off for this organization
requires-configuration   not yet configured
requires-approval        needs compliance approval before it can be allowed
```

## Deterministic policy

`lib/feature-flags/feature-flag-evaluator.ts` resolves each flag. A flag that
governs live use is blocked while demo mode is active, regardless of any stored
value, so the platform cannot be flipped live by data alone in this phase. With
demo mode off and a live flag requested, the flag resolves to
requires-approval, because live use still needs configuration, documented
secrets, and compliance approval that are not available in this phase. Flags
that do not govern live use resolve to allowed or disabled from their stored or
default value.

## Organization scoping

Flag overrides are stored per organization in the FeatureFlag model and read
through the feature flag repository. The evaluator applies the deterministic
policy on top of the stored values. Demo mode defaults to enabled unless an
override explicitly disables it.

## Audit

Updating a flag writes a FEATURE_FLAG_UPDATED provider audit event. Evaluations
are deterministic and can be recomputed at any time.

## Defaults

All live flags default to disabled. ENABLE_PROVIDER_SANDBOX and
ENABLE_DEMO_MODE default to enabled so the platform is reviewable and demo safe
out of the box.
