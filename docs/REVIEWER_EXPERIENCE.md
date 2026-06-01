# Reviewer experience

This document is the 60-second on-ramp for recruiters, hiring managers, and
technical reviewers. It exists so you can decide quickly whether SignalFlow is
worth a deeper look, and find the right entry points if it is.

## What SignalFlow is

A revenue operations platform for vertical small and medium businesses. It
ingests signals, scores intent and opportunity, recommends the next best action,
gates everything through a policy and consent layer, simulates voice and
workflow follow-up, records outcomes, and attributes revenue. The platform is
demo safe: no provider SDK is installed, no AI is called, no SMS or voice or
email is sent, and no secrets are stored.

## Run the 60-second demo

1. Open the landing page.
2. Click `Run the 60-second demo`.
3. Walk the seven step lifecycle on the scenario detail page:
   signal -> intelligence -> recommendation -> policy and consent -> workflow
   -> outcome -> revenue.
4. Use the step controls to step back, restart, or skip to revenue.
5. Open the linked compliance stop scenario to see the same engines refuse to
   act when consent is missing.

After the demo, the landing page offers `After the demo, explore` links into
the dashboard, revenue command center, AI center, review queue, voice command
center, provider management, and executive insights. Each of those views is
deterministic and reads from the database in demo mode.

## What is interesting under the hood

- **Page -> Service -> Repository -> Prisma architecture.** Pages never read
  Prisma directly. Services compose repositories. Engines under `lib/` are pure
  and have no React, Prisma, or Clerk imports.
- **Pure engines.** Scoring, recommendation, policy, voice compliance, outcome
  assessment, and revenue attribution all run as pure functions. That is why
  scenarios are deterministic.
- **Shared metric layer.** `lib/metrics/shared-metrics.ts` derives one set of
  headline KPIs for the dashboard, revenue command center, AI center, and
  executive insights. Approval rate is computed from reviewed recommendations
  only, so the same number renders the same way everywhere.
- **List controls.** `lib/lists/list-helpers.ts` plus the components under
  `components/lists/` provide search, facet filters, sort, pagination, and an
  empty state. Lists across the app share the same URL driven control set, so
  reviewers can deep link any view.
- **Scenario step model.** `lib/scenarios/scenario-steps.ts` produces the seven
  step lifecycle from a single scenario result, so the guided demo and the
  step controls stay in sync.
- **Deterministic time spread.** `lib/utils/deterministic-time.ts` produces a
  seeded offset from an id, so demo timestamps stay reproducible across runs
  while looking varied.

## Information architecture

- `/` landing page. Primary call to action runs the guided demo. Secondary
  links to deep views and to the how it is built section.
- `/scenarios/[id]` canonical guided demo with step controls.
- `/demo` thin redirect into the canonical scenario.
- `/dashboard` four to six hero KPIs and short list previews. Deeper views are
  one click away.
- `/revenue-command-center` lifecycle centerpiece with featured journey and
  clickable stages.
- `/ai-center` recommendations with search, status and confidence filters,
  sort, and pagination.
- `/review-queue` actionable triage. Pending decisions are expanded, resolved
  decisions are collapsed below.
- `/customers` list with search, vertical and consent filters, sort, and
  pagination.
- `/customers/[id]` sticky summary header with timeline filters.
- `/voice-command-center` simulated voice plans with a compliance legend,
  status and vertical filters, and pagination.
- `/provider-management` provider registry, capability matrix, and a What
  would it take to go live? callout.
- `/executive-insights` revenue leak detection, workflow performance,
  attribution mix, and AI governance.

## Demo safety

A persistent demo mode banner is rendered at the top of every authenticated
view. Each page that simulates an integration also explains what is simulated
in plain language. Nothing in the project calls an external service.

## How to read the code

- `app/` server rendered pages. Each page is a thin composition of a service
  call and presentational components.
- `lib/` pure engines, helpers, and types. No React, Prisma, or Clerk imports
  outside of services and repositories.
- `lib/services/` async glue. Services call repositories and return view
  models.
- `lib/repositories/` Prisma access. Always organization scoped.
- `prisma/` schema and seed.
- `components/` presentational React. Server components by default, client
  components only where required (forms and a few inputs).
- `tests/` Vitest suites for pure engines and helpers.

## Quality gates

- `npm run typecheck` strict TypeScript across the whole tree.
- `npm run lint` ESLint with the project rules.
- `npm test` Vitest suites including the shared metric layer, list helpers,
  scenario step model, and deterministic time helper.
- `npm run scan:safety` custom scan that blocks accidental provider integration
  and AI attribution from landing in the repository.
- `npm run check:architecture` boundary check that flags violations of the
  page service repository layering.
