# Executive Insights

Executive Insights is the revenue leader view of SignalFlow. It answers what the platform influenced, where revenue is leaking, and which workflows perform. It is built for business owners, managers, and revenue leaders rather than operators.

Everything is deterministic and demo safe. All figures are estimates computed from persisted data with no external model calls.

## What it shows

- Revenue influenced and recovered opportunities
- Reactivations and policy friction
- Highest performing workflow
- Most valuable signal outcome
- Largest revenue leak
- Revenue leak detection with estimated impact, severity, and a recovery recommendation
- Workflow performance with the best and worst workflow and the most expensive failure
- Opportunity insights by vertical with a conversion rate
- Attribution mix by type

## Revenue Leak Detection

The Revenue Leak Engine classifies persisted missed opportunities into leak types and aggregates their impact:

- No consent
- No human follow-up
- Dormant opportunity
- Repeated no response
- Missed appointment

Each leak carries an estimated impact, the count of affected opportunities, the worst severity seen, and a recovery recommendation. Leaks are ranked by impact so the largest is surfaced first.

## How it is built

The page composes pure analytics engines over persisted records:

- `detectRevenueLeaks` over missed opportunity records
- `computeWorkflowInsights` over workflow runs and effectiveness snapshots
- `computeOpportunityInsights` over opportunities and attributions
- `computeAttributionInsights` over attributions
- `buildExecutiveSummary` over the aggregated inputs and outcome memory

The analytics engines are pure. They contain no React and no Prisma. The analytics service fetches persisted records through repositories and feeds them to the engines, so the page never queries Prisma directly.

## Demo-safe limitations

- All revenue and leak figures are estimates, not booked revenue.
- The most expensive failure is a deterministic heuristic from blocked actions and outcome score.
- No external providers are called and nothing is sent.
