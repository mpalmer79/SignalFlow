# Provider Sandbox

The provider sandbox shows what would happen if a provider were selected for a
capability, without making any network call. It is deterministic and demo safe.

## No live execution

The sandbox never contacts a provider. It selects a provider through the
deterministic selection engine, which always chooses the internal mock provider
while demo mode is active, and returns an illustrative output summary. The
output strings are written for readability; they are not provider responses.

## What a sandbox run shows

For each capability the sandbox reports:

```text
Requested capability
Selected provider
Why the mock provider was selected
Input summary
Sandbox output summary
Blocked live execution reason
What live use would require
```

## Default scenarios

The provider sandbox page runs a fixed set of scenarios across text
recommendation, intent classification, voice synthesis, call transport, SMS
delivery, email delivery, and transcript summary. Each run records a
PROVIDER_SANDBOX_RUN audit event.

## Live requirements

Every sandbox result lists what live use would require: enabling the governing
feature flag, turning off demo mode, documenting the provider secrets through a
secret manager, obtaining compliance approval, passing sandbox validation, and
explicitly allowing live use. None of these are satisfied in this phase, so the
blocked live execution reason is always populated.

## Architecture

`lib/providers/provider-sandbox.ts` is pure and framework free. It composes the
selection engine and the capability metadata. The provider sandbox service
records audit events through the repository layer. The page calls the service,
never a repository directly.

## Related documents

- PROVIDER_MANAGEMENT.md for the registry and readiness
- FEATURE_FLAGS.md for the flag framework
