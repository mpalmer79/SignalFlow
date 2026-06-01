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

## Page hierarchy

The overview page is organized into clearly labeled sections, each with a
short subhead that answers "what am I seeing, why does it matter, what should
I click next":

1. Hero summary. A single-sentence narrative for today plus six headline
   metrics (signals, recommendations, revenue influenced, workflow runs,
   missed revenue, open opportunities), and a primary call to action that
   opens the featured mission replay.
2. Executive summary. Eight smaller stat cards with the headline totals.
3. Revenue lifecycle. Seven stage cards (signal, intelligence, recommendation,
   review, workflow, outcome, revenue) each carrying a live count and a one
   line explanation, followed by a revenue funnel with conversion percentages.
4. Customer journey. A featured journey card for the customer with the
   richest activity, showing latest signal, top opportunity, AI
   recommendation, human review decision, workflow run, outcome, revenue
   attribution, and risk and consent in one composed view. A smaller grid of
   other customers sits below.
5. AI governance. Recommendation stream cards linking to the AI center and
   the review queue.
6. Workflow execution. Recent workflow runs and the outcome feed.
7. Outcomes and attribution. Top revenue verticals and revenue attribution.
8. Revenue leaks. Top missed revenue with recovery actions.
9. Auditability. Recent audit events, including AI audit events from Phase 7.
10. Recommended demo path call to action and a related views strip.

Every section is fed by `getCommandCenterOverview`.

## Featured journey

`buildFeaturedJourney` in the service ranks customers by activity (AI
recommendations, workflow runs, recent signals) and picks the highest scoring
one. It then loads that customer's signals, top opportunity, top
recommendation with review decision, latest workflow run, latest outcome, top
attribution, top missed estimate, and totals. The page renders these as eight
small tiles inside a single card, with one button that opens the customer's
full mission replay. The selection is deterministic for a given seed.

## Recommended demo path

The page is designed to read top to bottom in 30 seconds:

1. Start at the hero summary. Read the one sentence narrative and the headline
   metrics.
2. Scan the revenue lifecycle row. Each stage shows what the system did and
   how many records it produced.
3. Open the featured mission replay. Watch the ordered timeline for the
   featured customer and read the "What this proves" card at the end.
4. Optional depth pass. Open the AI center, the review queue, or the revenue
   engine breakdown for a deeper look.

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

## Current limitations

- The featured journey is selected automatically from persistence; there is no
  in-page picker yet. The customer grid below the featured card provides
  manual selection.
- Empty state handling is informational only. The page does not write any
  seed data on its own.
- Aggregations are computed per request. They are fast on the seeded data set
  but a future phase should add caching for larger organizations.
- The mission timeline is a static, ordered list. Animated progression was
  considered but skipped to avoid adding an animation dependency.

## Why this matters

A traditional CRM dashboard reports what is stored. The Revenue Command Center
reports what the system decided, what a human approved, what executed, and
what it produced, in one narrative. That is the SignalFlow story, and Phase 8
makes it obvious without navigation.

## Voice follow-up (Phase 9)

Phase 9 adds a concise voice section to the command center. It shows voice
plans, simulated calls, appointments from voice, and voice influenced revenue,
all drawn from the voice aggregation in the service. The section links to the
voice command center for the full voice operations view. Voice is fully
simulated: no calls are placed and no provider is contacted. See
VOICE_PLATFORM.md for the design.
