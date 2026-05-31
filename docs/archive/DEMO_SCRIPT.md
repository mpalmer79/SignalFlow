# Demo Script

This script guides a reviewer through SignalFlow in about five minutes. It demonstrates how signals become consent-aware actions without any live communication. Everything shown is mock data in demo mode.

## Before you start

```bash
npm install
npm run dev
```

Open http://localhost:3000. No secrets, database, or provider keys are required.

## Step 1: Landing page

Start on the landing page. Note the positioning line: turn customer signals into timely, consent-aware revenue actions. Read the system model card that shows signal to outcome. The point to make is that SignalFlow is a system of action, not a system of record.

## Step 2: Dashboard

Click Open dashboard. The dashboard is the revenue command center.

Point out:

- Active signals and high-intent opportunities at the top
- Consent blocked actions, which proves the policy layer is doing work
- The simulated voice follow-up queue, labeled as simulated
- Recent audit activity that links decisions to actions

Note the persistent demo banner at the top of the app.

## Step 3: Signals

Open Signals. Each card shows a signal type, customer, source, priority, a recommended next action, a consent status, and a timestamp.

Call out the new automotive lead for Marcus Holloway, who is interested in a Silverado, and the missed call for Ethan Brooks, who has opted out and therefore gets no outreach.

## Step 4: Customers

Open Customers. Show the customer intelligence record. Each customer has channels with per-channel consent, a preferred channel, recent signals, an active opportunity, a last action, and risk flags.

Point to Linda Vasquez in the medical vertical, flagged for protected health information, and Ethan Brooks, flagged as opted out.

## Step 5: Action graph

Open Action Graph. Walk the deterministic flow: new lead received, check consent, score intent, choose channel, generate message, queue follow-up, escalate if needed, track outcome.

Emphasize that consent is checked before anything else and that high-value or sensitive cases escalate to a human.

## Step 6: Orchestrator

Open Orchestrator. Show the simulated workflows:

- Immediate SMS after lead submission
- Email fallback after no reply
- Human task for a high-value lead
- Voice follow-up after consent approval
- Stop workflow after opt-out

The stop workflow shows that an opt-out halts every step.

## Step 7: Communications

Open Communications. Records are grouped by channel and clearly marked as simulated. Show the range of statuses, including delivered, replied, blocked, and escalated. Blocked and escalated records tie back to policy decisions.

## Step 8: Vertical packs

Open Vertical Packs. Show that Automotive is the MVP focus, while Dental, Medical, Home Services, Legal Intake, and Insurance are at earlier phases. Each pack lists key signals, key actions, and compliance sensitivity.

## Step 9: Audit

Open Audit. Each event connects a signal, a customer, a policy decision, an action, and an outcome. This is the explainability layer. Show the opt-out event and a policy blocked action.

## Step 10: Settings

Open Settings to show the configuration surface for later phases: organization, vertical pack, communication limits, consent rules, provider configuration, and demo mode. Note that demo mode is locked on for Phase 0.

## Closing point

In five minutes a reviewer should understand the problem, why generic CRMs fall short, how signals become actions, how consent and policy are enforced, and how the platform expands across verticals. No live message was ever sent.
