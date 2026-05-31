# AI Platform

Phase 7 introduces the AI Platform Layer. It makes SignalFlow AI native in
architecture while remaining completely deterministic and provider free at
runtime. No AI provider is integrated, no network calls are made, and no
secrets are required.

The platform exists to answer five questions for any customer or opportunity:

- What would the AI recommend?
- Why did it recommend it?
- How confident is it?
- Would a human approve it?
- How is that recommendation audited?

## Pipeline position

The platform inserts two new stages into the revenue pipeline:

```text
Signal
  to Intelligence
  to AI Recommendation Layer
  to Human Review
  to Workflow
  to Outcome
```

AI recommendations never become actions automatically. Every recommendation is
generated deterministically, scored for confidence, explained in full, and
routed through human review before any workflow can act on it.

## Module map

All AI modules are pure business logic. They do not import React, Prisma, or
Clerk. They depend only on types and the deterministic intelligence profile.

```text
lib/ai/
  provider-interface.ts   AIProvider interface and future provider list
  mock-provider.ts        deterministic implementation (deterministic.mock)
  ai-engine.ts            builds input from an intelligence profile, runs a provider
  ai-decision.ts          deterministic recommendation decision rules
  ai-confidence.ts        weighted confidence scoring and tiering
  ai-explanation.ts       reasoning factors, supporting signals, risk considerations
  ai-output-validator.ts  validates a recommendation before persistence
  ai-prompt-library.ts    aggregates structured prompt templates

lib/review/
  review-engine.ts        determines whether human review is required and why
  review-decision.ts      review decision to lifecycle state machine
  review-queue.ts         grouping and labeling for the queue view

lib/prompts/
  automotive-prompts.ts
  dental-prompts.ts
  home-services-prompts.ts
  legal-prompts.ts
  insurance-prompts.ts
```

Persistence and orchestration live outside the pure layer:

```text
lib/repositories/ai-repository.ts   org scoped persistence and aggregation
lib/services/ai-service.ts          AI Center, metrics, analytics
lib/services/review-service.ts      review queue and decision submission
```

## Provider abstraction

`AIProvider` describes the surface a real provider would implement:

```text
generateRecommendation()
classifyIntent()
generateExplanation()
scoreConfidence()
summarizeOpportunity()
```

The only implementation today is `mockAIProvider`, identified as
`deterministic.mock`. It produces identical output for identical input. The
abstraction is designed so that OpenAI, Anthropic Claude, Google Gemini, or
Azure OpenAI could be added later behind the same interface without changing
callers. Those providers are listed in `FUTURE_PROVIDERS` and are not
integrated.

## Confidence model

Confidence is scored from 0 to 100 by `scoreConfidence`. It is a weighted blend
of the deterministic intelligence signals:

```text
intent score        weight 0.45
opportunity score   weight 0.35
engagement score    weight 0.20
signal count        small positive bonus
consent gaps        penalty
risk flags          penalty
```

The score maps to a tier:

```text
Very High   85 to 100
High        70 to 84
Moderate    50 to 69
Low         0 to 49
```

## Recommendation types

```text
IMMEDIATE_HUMAN_FOLLOW_UP
APPOINTMENT_OUTREACH
REACTIVATION_OUTREACH
NURTURE_SEQUENCE
HUMAN_REVIEW
PAUSE_OUTREACH
```

The decision rules in `ai-decision.ts` map intelligence signals to one of these
types deterministically. For example a trade request with high intent and no
risk flags yields `IMMEDIATE_HUMAN_FOLLOW_UP`, while an overdue dental recall
yields `APPOINTMENT_OUTREACH`.

## Recommendation lifecycle

```text
Draft
Generated
Pending Review
Approved
Rejected
Executed
Archived
```

State transitions are persisted and produce audit events. The review decision
state machine in `review-decision.ts` governs which transitions are allowed.

## Audit layer

Every AI activity is traceable through the existing audit log. Phase 7 adds six
audit event types:

```text
AI_RECOMMENDATION_CREATED
AI_RECOMMENDATION_APPROVED
AI_RECOMMENDATION_REJECTED
AI_EXPLANATION_GENERATED
AI_REVIEW_REQUIRED
AI_REVIEW_COMPLETED
```

## Why providers remain mocked

The goal of Phase 7 is to prove the architecture and governance model without
taking on AI dependencies, cost, latency, secrets, or data exposure. A
deterministic mock provider keeps the demo safe and reproducible while leaving a
clean seam for real providers. When a provider is integrated in a later phase,
it implements `AIProvider`, is selected by configuration, and inherits the same
confidence, explanation, review, and audit guarantees described here.

## Related documents

- REVIEW_QUEUE.md for the human review process
- PROMPT_LIBRARY.md for the structured prompt templates
- DATA_MODEL.md for the AI persistence entities
- AUTHORIZATION.md for the AI permissions and roles

## Provider governance (Phase 10)

Phase 10 adds a provider registry, a capability matrix, a deterministic feature
flag framework, and a provider selection engine around the AI provider
abstraction. The AI text capabilities (text recommendation, intent
classification, explanation generation) are governed by the ENABLE_LIVE_AI
feature flag. While demo mode is active that flag is locked off, so the
selection engine always chooses the internal mock AI provider. No AI provider
SDK is installed and no AI API is called. See PROVIDER_MANAGEMENT.md and
FEATURE_FLAGS.md.
