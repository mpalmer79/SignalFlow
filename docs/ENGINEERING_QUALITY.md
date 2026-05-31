# Engineering Quality

This document describes the engineering quality controls added in Phase 12. The
goal is to make the architecture guarantees that SignalFlow documents into
guarantees that are enforced automatically.

## Continuous integration

GitHub Actions runs on every push and pull request. The workflow runs, in
order: install, typecheck, lint, unit tests, the safety scan, the architecture
boundary check, Prisma schema validation, and the production build. A failure
in any step fails the pipeline. The workflow lives at
`.github/workflows/ci.yml`.

## Test strategy

Tests use Vitest and target the pure deterministic engines only. They import no
React, no Prisma, and no database, so they run in about a second with no
environment. The suites cover the highest-risk invariants:

- Feature flag evaluator: live flags are blocked in demo mode and never resolve
  to allowed.
- Provider selection: an internal mock provider is selected for every
  capability in demo mode, never an external provider.
- Provider readiness: no external provider is live ready; internal mocks are
  sandbox ready.
- Provider sandbox: a mock is selected and a blocked live reason is reported.
- Voice compliance: opt-out, missing consent, quiet hours, and repeated
  no-response block a call; sensitive verticals and unapproved recommendations
  require review; hard blocks take precedence over review.
- Voice simulation eligibility: only an allowed plan is eligible for
  simulation.
- AI confidence: deterministic, bounded to 0 to 100, lowered by opt-out.
- AI review: low confidence and high risk require review; rejected
  recommendations cannot proceed; lifecycle transitions cannot be skipped.
- Workflow validator: rejects empty, duplicate, and malformed plans.
- Revenue attribution: factors are fractions and attributed amounts never
  exceed the base value.

Run them with `npm run test`, watch with `npm run test:watch`, and measure
coverage with `npm run test:coverage`.

## Safety scan

`npm run scan:safety` runs `scripts/scan-safety.ts`. It fails the build if the
codebase contains attribution footers, Claude URLs, em dashes, real provider
secret environment names that are not documented placeholders, network calls
(`fetch(` or `axios`), or a banned provider SDK in `package.json`. The scan and
the quality checklist that document the banned strings are excluded so the scan
does not flag its own detection patterns.

## Architecture boundary check

`npm run check:architecture` runs `scripts/check-architecture-boundaries.ts`. It
fails the build if a page imports a repository directly, or if a pure engine
imports React, Prisma, the Prisma singleton, Clerk, `next/*`, a repository, or a
provider SDK. This converts the layering rules from convention into an enforced
invariant.

## Demo fallback production guard

The demo owner fallback is a development and review convenience. It is now
refused in production unless an operator explicitly opts in. See AUTHORIZATION.md
and MULTI_TENANCY.md for the rule.

## Remaining known debt

Tracked in `docs/TECHNICAL_DEBT_REGISTER.md`.
