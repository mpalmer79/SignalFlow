# Revenue Command Center

Phase 8 introduces a flagship product experience called the Revenue Command
Center. It is one screen that tells the complete SignalFlow story end to end
so a reviewer does not have to assemble it from many pages.

## Purpose

By Phase 7 SignalFlow contained signals, intelligence, AI recommendations, a
human review queue, workflows, outcomes, and revenue attribution, but each
lived on its own page. The Revenue Command Center collapses all of this into a
single narrative experience that answers, in under 30 seconds, what the system
did, why, and what it produced.

The lifecycle reads:

```text
Signal
  to Intelligence
  to AI Recommendation
  to Human Review
  to Workflow
  to Outcome
  to Revenue Attribution
```

## Audience

The page is designed for a VP of Sales, a COO, and a CTO. It is operational
and strategic, not a developer tool or admin panel. It uses cards, funnels,
and journey timelines, not raw tables.

## Routes

```text
/app/revenue-command-center                            Flagship overview
/app/revenue-command-center/replay/[customerId]        Mission replay
```

Both routes are protected and require the existing VIEW_REVENUE permission.
There are no new permissions in Phase 8.

## Overview sections

The overview page composes the following sections, each driven by persistence:

- Revenue lifecycle hero. A horizontal flow of the seven lifecycle stages so a
  reviewer sees the system shape in a single glance.
- Executive summary. Eight headline metrics: customers, signals,
  recommendations, workflow runs, revenue influenced, reactivations, missed
  opportunity value, and an AI approval rate.
- Revenue funnel. Counts and conversion percentages for signals, customer
  profiles, recommendations, approvals, workflow runs, positive outcomes, and
  revenue attribution records.
- Top revenue verticals. Revenue influenced and positive run share, by vertical
  pack.
- Customer journey explorer. A card grid of seeded customers, each opening the
  mission replay for that customer.
- AI recommendation stream. The most recent AI recommendations with their
  confidence and review state, each linking to the AI center detail page.
- Workflow activity. The most recent workflow runs with their outcome and
  action counts, each linking to the orchestrator detail page.
- Outcome feed. The most recent outcome events, color tagged by polarity.
- Revenue attribution and missed revenue leaderboards.
- Recent audit activity, including AI audit events from Phase 7.
- Mission replay launch card and footer links to executive insights, revenue
  engine, review queue, and simulation center.

## Mission replay

The mission replay route walks the full deterministic lifecycle for one
customer as an ordered timeline. Steps are sorted chronologically and labeled
by kind: signal, intelligence, recommendation, review, workflow, outcome, and
revenue. Each step carries a short title, a detail line, an optional badge,
and an absolute timestamp. Recommendation and workflow steps link out to their
detail pages so a reviewer can drill in without losing place.

The header includes four customer level metrics: intent score, recommendation
count, positive outcome count, and revenue attributed.

## Service and architecture

The page is supported by a single aggregating service:

```text
lib/services/revenue-command-center-service.ts
```

That service composes existing repositories in parallel:

- countSignals, countCustomers, countOpenOpportunities
- aggregateWorkflowMetrics, getEffectivenessTotals
- getAttributionTotals, getMissedTotals, countReactivations
- aggregateRecommendations, findAllRecommendations
- findAllWorkflowRuns, findRecentOutcomeEvents, findRecentAuditEvents
- findAllAttributions, findAllMissedOpportunities, findAllCustomers

The page calls the service. The service calls repositories. Repositories call
Prisma. AI and review engines are not imported by the page. No engine imports
React or Prisma. The architecture boundaries from earlier phases stay intact.

A small `findRecentOutcomeEvents` helper was added to the outcome repository
so the page can render an outcome feed without iterating every customer.

## Determinism and demo safety

Everything on the Revenue Command Center is computed from seeded persistence.
No new providers are added, no network calls are made, no live communication
is sent, and no secrets are required. The page itself does not depend on any
AI provider.

## Why this matters

A traditional CRM dashboard reports what is stored. The Revenue Command Center
reports what the system decided, what a human approved, what executed, and
what it produced, in one narrative. That is the SignalFlow story, and Phase 8
makes it obvious without navigation.
