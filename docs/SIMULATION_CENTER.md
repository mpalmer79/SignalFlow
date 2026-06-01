# Simulation Center

The Simulation Center runs large multi-customer simulations across a vertical and aggregates the outcomes. It shows how SignalFlow performs at scale, not just on a single customer.

Everything is deterministic and demo safe. A seeded generator produces the population, the existing engines assess each customer, and the results are aggregated. No data is persisted, no external APIs are called, and nothing is sent.

## How it works

```text
Simulation config (vertical, count)
  to seeded population generator
  to per customer engine run (intelligence, workflow, outcome)
  to deterministic aggregation
  to simulation metrics
```

The population generator distributes customers across intent levels, consent states, and response behavior deterministically, so a run produces a believable mix of outcomes without randomness beyond the seed. Each generated customer flows through `buildIntelligenceProfile`, `runWorkflow`, and `assessOutcomes`, exactly like the scenario engine, then `scoreSimulation` reduces the results.

## Metrics

Each run reports:

- Customers generated
- Appointments generated
- Revenue influenced (gross influence estimate, excludes missed)
- Missed opportunity value
- Workflow completion rate
- Policy blocks and escalations
- Average intent, opportunity, and engagement scores
- Positive outcome rate

It also reports an outcome breakdown by type.

## Presets

The preset simulations live in `lib/simulation/simulation-library.ts`: 50 automotive leads, 100 dental recall patients, 75 HVAC estimates, 30 legal consultations, and 25 insurance renewals. Running all presets powers the industry comparison on the dashboard and the landing page.

## Architecture

The simulation engine, generator, and scorer are pure. They contain no React and no Prisma. Because runs are deterministic, the simulation detail pages are pre-rendered at build time.

## Demo-safe limitations

- All figures are estimates from the seeded generator and vertical rules, not booked revenue.
- Outcomes are deterministic heuristics, not observed behavior.
- Simulations run in memory and are not persisted.
- No external providers are called and nothing is sent.
