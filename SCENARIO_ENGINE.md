# Scenario Engine

The scenario engine turns a single curated archetype into a complete, deterministic end to end story: a customer, signals, an intelligence profile, an opportunity, a workflow, policy decisions, outcome events, and revenue attribution. It is the storytelling layer of SignalFlow.

Everything is deterministic and demo safe. There is no randomness beyond a seeded generator, no external APIs, no model calls, and nothing is sent.

## How it works

```text
Scenario definition
  to deterministic generator (synthetic customer, signals, opportunity)
  to intelligence profile
  to workflow simulation
  to outcome assessment
  to storytelling timeline
```

A `ScenarioDefinition` configures the generator: vertical, intent level, consent state, opt-out, whether the customer responded, and which signal archetypes to use. The generator in `lib/simulation/synthetic-data.ts` produces a believable customer and signal mix from the vertical pack, seeded by the scenario id so the same scenario always produces the same result.

The generated data then flows through the existing engines unchanged: `buildIntelligenceProfile`, `runWorkflow`, and `assessOutcomes`. The scenario engine adds nothing to the engines. It only feeds them deterministic synthetic input, which proves the engines work the same on generated data as on persisted data.

## Scenario timeline

Each scenario produces a seven step timeline that explains the path from signal to revenue:

```text
Signal created
Signal classified
Opportunity identified
Workflow generated
Actions executed
Outcome generated
Revenue attributed
```

## Library

The curated scenarios live in `lib/scenarios/scenario-library.ts` and cover the supported verticals, including a high intent buyer, a lost lead recovery, a dental recall, an HVAC estimate, a legal consultation, an insurance renewal, and an opt-out compliance stop. The compliance stop scenario demonstrates that an opted-out customer produces a stop and no revenue attribution.

## Architecture

The scenario engine and generator are pure. They contain no React and no Prisma. The Scenario Builder page renders scenario results, but it never persists anything and never calls a provider.
