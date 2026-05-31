# Prompt Library

The prompt library is a structured, versionable collection of prompt templates
prepared for future AI provider integrations. The templates are data only. They
are never sent anywhere in Phase 7 because no provider is integrated and no
network calls are made.

## Purpose

When a real provider is added later, these templates give each vertical a
starting point for recommendation, classification, and summarization prompts.
Storing them as structured data now means provider integration becomes a matter
of selecting a template and a provider, not authoring prompts from scratch.

## Structure

Each template follows the `PromptTemplate` interface in `lib/types/prompt.ts`:

```text
id           stable identifier
vertical     which vertical pack the prompt serves
title        human readable name
intent       what the prompt is meant to produce
template     the structured prompt text with placeholders
inputs       the named placeholders the template expects
notes        guidance for a future integrator
```

Templates live in `lib/prompts/` and are aggregated by
`lib/ai/ai-prompt-library.ts`, which exposes `getPromptsForVertical` and
`getPromptById`.

## Coverage

```text
lib/prompts/automotive-prompts.ts     for example Automotive Follow-Up
lib/prompts/dental-prompts.ts         for example Dental Recall
lib/prompts/home-services-prompts.ts  for example HVAC Estimate
lib/prompts/legal-prompts.ts          for example Legal Intake
lib/prompts/insurance-prompts.ts      for example Insurance Renewal
```

## Safety

The library contains no secrets, no API keys, and no provider client code. The
placeholders are filled from deterministic intelligence data, not from real
customer records. Because nothing is sent to a provider, the templates cannot
leak data or incur cost. They exist purely to make the eventual provider
integration fast and consistent.

## Related documents

- AI_PLATFORM.md for the provider abstraction
- PROVIDERS.md for the provider posture
