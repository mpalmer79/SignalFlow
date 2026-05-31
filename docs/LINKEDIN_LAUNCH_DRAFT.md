# LinkedIn Launch Draft

Drafts for announcing SignalFlow. Replace the placeholders before posting. Do
not invent links.

```text
GitHub: [repo link]
Live Demo: [demo link]
```

## Short post

I just shipped SignalFlow, an AI-native revenue platform I built to explore how
an AI product should be governed, not just how it should be clever.

It turns customer signals into recommended actions, keeps a human in the loop
through a review queue, simulates voice and multi-channel follow-up behind a
compliance layer, and attributes the revenue outcome. It is fully deterministic
and demo safe: no live calls, no AI provider calls, no real data.

Built with TypeScript, Next.js, PostgreSQL, and Prisma.

GitHub: [repo link]
Live Demo: [demo link]

## Longer post

Over the last few weeks I built SignalFlow, a deterministic, demo-safe AI
revenue operating system, to answer a question I care about: how do you build
an AI product responsibly?

Most CRMs store a record and wait for a person to act. SignalFlow is built to
decide and act, with governance at the center. It reads customer signals,
builds an intelligence graph, generates an AI recommendation with a confidence
score and a full explanation, and then routes it through a human review queue.
Nothing becomes an action without a person approving it.

It also simulates voice follow-up behind a deterministic compliance engine that
enforces consent, opt-out, and quiet hours, and it includes a provider
governance layer with a registry, feature flags, and readiness checks that keep
every external provider safely disabled. No SDKs are installed, no network calls
are made, and no secrets are stored.

The architecture is the point: domain-driven design with strict page, service,
repository, and engine boundaries; organization-scoped multi-tenancy with
server-side role based access control; deterministic domain engines; and an
audit trail throughout.

Tech: TypeScript, Next.js App Router, PostgreSQL, Prisma, and optional Clerk
auth with a demo fallback.

It is a portfolio project, not a production service. There are no real users,
no live integrations, and no real data. That was a deliberate choice so the
focus stays on architecture and judgment.

I would love feedback from anyone working on AI platforms, revenue operations,
or multi-tenant SaaS.

GitHub: [repo link]
Live Demo: [demo link]

## Comment to add under the post

Happy to walk through the architecture or the demo path. The repo includes a
guided walkthrough, text-based architecture diagrams, and a technical
highlights document.

GitHub: [repo link]
Live Demo: [demo link]

## Hashtags

```text
#softwareengineering
#typescript
#nextjs
#postgresql
#prisma
#softwarearchitecture
#aiplatforms
#saas
#multitenancy
#portfolio
```
