# Revenue Engine

The revenue engine is the Phase 4 layer that turns simulated workflow runs into measurable business outcomes. It answers which signals created opportunities, which workflows moved customers forward, which actions were effective, which were blocked, which customers stalled, and what revenue SignalFlow influenced.

Everything here is deterministic and demo safe. No revenue is real, no money moves, and nothing is sent. All values are estimates computed locally from seeded data and simple vertical rules.

## Pipeline

```text
Signal
  to Intelligence
  to Action Graph
  to Workflow Simulation
  to Outcome Events
  to Revenue Attribution
  to Outcome Memory
```

A workflow run is assessed once. The assessment produces outcome events, an optional stage transition, an optional revenue attribution, an effectiveness snapshot, and an optional missed opportunity estimate. All of these are persisted and surfaced in the UI.

## Outcome Engine

The Outcome Engine classifies a workflow run into deterministic outcome events. It reads the run outcome, executed and blocked actions, intent, opportunity, and engagement scores, consent, risk flags, and the opportunity stage.

Outcome types include CUSTOMER_REPLIED, EMAIL_OPENED, APPOINTMENT_SCHEDULED, APPOINTMENT_CONFIRMED, HUMAN_TASK_CREATED, HUMAN_HANDOFF_COMPLETED, OPPORTUNITY_ADVANCED, OPPORTUNITY_WON, OPPORTUNITY_LOST, OPPORTUNITY_DORMANT, OPPORTUNITY_REACTIVATED, NO_RESPONSE, ACTION_BLOCKED, and COMPLIANCE_STOP.

A compliance stop short circuits everything. An opted-out customer produces only a COMPLIANCE_STOP and no attribution.

## Stage Transition Engine

The Stage Transition Engine derives a single deterministic transition from the current stage and the outcome events. Examples: new to contact attempted when an action executes, contact attempted to engaged on a reply, engaged or appointment intent to appointment set on a booking, and dormant to reactivated on renewed engagement. Closed stages (won, lost, dormant) do not advance on a compliance stop. Transitions are persisted and the opportunity stage is updated to match.

## Revenue Attribution Engine

The Revenue Attribution Engine estimates influenced revenue from the outcomes and any stage movement. It resolves an opportunity value, falling back to a vertical default when none is set, then applies a deterministic factor per attribution type.

Attribution types and factors:

- RECOVERED: 0.5 of value, for reactivations, wins, and scheduled appointments
- INFLUENCED: 0.35, for forward movement or a reply
- ASSISTED: 0.2, for contact without stage movement
- PREVENTED_LOSS: 0.3, for a human handoff on a high value opportunity
- MISSED: full value, tracked separately as value not captured

Revenue influenced totals exclude MISSED, which represents value at risk rather than value moved.

## Workflow Effectiveness

Effectiveness scores a run on a 0 to 100 scale from a centralized configuration. The score starts at a baseline and adds or subtracts per outcome type, for example opportunity won adds 50, appointment scheduled adds 30, customer replied adds 15, action blocked subtracts 10, compliance stop subtracts 25, and no response subtracts 15. Policy friction counts blocked and escalated actions. Revenue influenced mirrors the attribution amount unless the attribution is missed.

## Missed Opportunity Engine

The Missed Opportunity Engine estimates value at risk when a workflow stalls. Reasons include missing consent, a blocked action with no response, high intent without a human follow-up, repeated no response, and dormant or lost opportunities. Each estimate carries a value, a severity (low, medium, high, critical), and a recommended recovery action. An opt-out is a hard stop, not a recoverable miss, so it produces no estimate.

## Outcome Memory

Outcome Memory summarizes the relationship between signals, actions, workflows, and revenue across all runs. It reports revenue influenced and average outcome score per vertical, the actions that move the most revenue, and the outcomes that appear most often. It is built by joining persisted attributions, effectiveness snapshots, and outcome events, then aggregating with a pure summarizer. There is no machine learning.

## Architecture

The engines in `lib/outcomes` and `lib/attribution` are pure. They contain no React and no Prisma. Persistence lives in the repositories, composition lives in the services, and pages only render. The seed runs the same engines the application uses, so persisted data matches what the engines would compute live.

```text
lib/outcomes/       outcome engine, classifier, memory, timeline, stage transitions, config
lib/attribution/    attribution engine, calculator, missed opportunity, effectiveness
lib/repositories/   outcome, attribution, stage transition, effectiveness, missed opportunity
lib/services/       outcome, revenue attribution, revenue engine
```

## Demo-safe limitations

- All revenue figures are estimates from seeded data and vertical rules, not booked revenue.
- Outcomes are deterministic heuristics, not observed customer behavior.
- Confidence values are fixed per rule, not probabilities from a model.
- Engagement and replies are inferred from seeded communication status, not real events.
- Outcomes are assessed once per run at seed time and are not recomputed live as data changes.
- No external providers are called, nothing is sent, and no real customer data is used.
