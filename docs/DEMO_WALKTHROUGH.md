# Demo Walkthrough

This guide tells a reviewer exactly what to click and why it matters. The whole
path takes about ten minutes. Everything is deterministic and demo safe.

Before you start, seed the demo data with `npm run db:seed` and run the app
with `npm run dev`, then open http://localhost:3000.

## 1. Landing page

```text
Open:   /
Look at: the positioning, the not-just-a-CRM section, and the demo safe note.
Why:    it frames the product problem and sets expectations that everything is
        simulated.
Proves: clear product storytelling and an honest demo posture.
```

## 2. Revenue Command Center

```text
Open:   /revenue-command-center
Look at: the hero summary sentence, the executive metrics, the revenue
        lifecycle row, and the featured customer journey card.
Why:    it tells the full signal to revenue story on one screen.
Proves: data aggregation across many domains through a single service, with
        strict page to service to repository boundaries.
```

## 3. Mission Replay

```text
Open:   the featured mission replay from the command center, or
        /revenue-command-center/replay/[customerId]
Look at: the ordered timeline from signal to revenue, and the what this proves
        card.
Why:    it shows one customer lifecycle as a guided story.
Proves: deterministic reconstruction of a full lifecycle from persisted data.
```

## 4. AI Center

```text
Open:   /ai-center
Look at: recommendations with a confidence score, a confidence tier, and a full
        explanation with reasoning factors and risk considerations.
Why:    it shows AI output that is explainable rather than a black box.
Proves: a provider abstraction with a deterministic engine, and an explanation
        model, with no AI provider call.
```

## 5. Review Queue

```text
Open:   /review-queue
Look at: recommendations grouped by review state, and the simulated voice plans
        needing review card.
Why:    AI output does not become an action without a human decision.
Proves: a governance gate shared by AI recommendations and voice plans.
```

## 6. Voice Command Center

```text
Open:   /voice-command-center
Look at: the simulated banner, the compliance breakdown, plans needing review,
        blocked plans, and voice influenced revenue.
Why:    it shows a voice operations layer that never places a call.
Proves: a deterministic voice compliance engine and an honest simulated posture.
```

## 7. Voice Replay

```text
Open:   a call from the voice command center, or
        /voice-command-center/replay/[callId]
Look at: the customer context, the compliance decision, the simulated
        transcript, the outcome, and the audit trail.
Why:    it shows one simulated call end to end.
Proves: deterministic transcript generation and outcome to revenue mapping.
```

## 8. Provider Management

```text
Open:   /provider-management
Look at: the all live providers disabled banner, the capability matrix, the
        feature flags, the readiness states, and the provider audit trail.
Why:    it shows a provider governance layer with every external provider safely
        disabled.
Proves: a registry, a capability matrix, and readiness gates with no secrets and
        no SDKs.
```

## 9. Provider Sandbox

```text
Open:   /provider-sandbox
Look at: each capability showing the selected internal mock provider, why the
        mock was chosen, the blocked live reason, and what live use would require.
Why:    it shows what a provider request would look like without making one.
Proves: a deterministic selection engine and a sandbox that makes no network call.
```

## 10. Executive Insights

```text
Open:   /executive-insights
Look at: influenced revenue, recovered opportunities, revenue leaks, workflow
        performance, and AI governance metrics.
Why:    it shows a leadership view rather than an operator view.
Proves: analytics composed deterministically across the platform.
```

## Optional deeper stops

```text
/dashboard            the operator overview with a provider demo safe status card
/intelligence         per customer intelligence profiles
/revenue-engine       the revenue attribution breakdown
/simulation-center    large multi-customer simulations
/audit                the end to end audit trail
/settings             roles, permissions, and provider readiness
```
