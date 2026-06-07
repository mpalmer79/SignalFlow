# Technical Debt Register

Tracked technical debt after the Phase 12 remediation and the later hardening
and proof pass. Items a pass closed are listed near the bottom for context.

This register separates two kinds of readiness on purpose:

- Portfolio readiness: the repo is a credible, verifiable, demo-safe
  architecture proof. The open items below are mostly Low severity polish.
- Production readiness: the repo is not a live production system. The items in
  the dedicated section near the end are the real gaps before that claim could
  be made.

## Open (portfolio polish)

| Item | Impact | Severity | Recommended fix | Effort |
|---|---|---|---|---|
| Dashboard issues 18 parallel queries including a few unbounded reads | Heavy flagship page at large org sizes | Medium | Precompute a dashboard snapshot or cache aggregates with revalidation | 1 day |
| No server-side caching anywhere | Every render recomputes aggregates | Medium | Add `unstable_cache` or a snapshot table for command center and dashboard | 1 to 2 days |
| Revenue Command Center page is large | Maintenance | Low | Split the page into section components. Deferred during the hardening pass to avoid behavior change on the flagship page in a proof-focused change set. See note below. | 0.5 day |
| `revenue-command-center-service` is large | Maintenance | Low | Split featured journey, funnel, vertical memory, and replay into modules. Deferred with the page split above to keep the hardening diff small and reviewable. | 0.5 day |
| Provider sandbox writes one audit row per scenario per visit | Audit log growth | Low | Batch or rate limit sandbox audit writes | 1 hour |
| No interactive provider or feature flag management UI | Read-only governance | Low | Add gated management actions, still locked off in demo mode | 1 to 2 days |
| `VoiceCallOutcome.customerId` and `opportunityId` are denormalized strings | Integrity relies on the writer | Low | Acceptable for the analytics read path; documented in DATA_MODEL.md | n/a |

Note on the Revenue Command Center split: the page is roughly 980 lines and the
service roughly 620 lines. Both are flagged Low severity. The hardening and
proof pass deliberately left them intact because a safe split needs careful,
behavior-preserving extraction and verification that is out of scope for a pass
focused on tests, headers, CI, and documentation. The split remains a good next
maintainability PR, done on its own so the diff is easy to review.

## Open (production readiness)

These are the honest gaps between a portfolio proof and a live product. None of
them are bugs. They are deliberate boundaries of a demo-safe build.

| Item | Impact | Severity | Recommended fix | Effort |
|---|---|---|---|---|
| Internal mock providers only, no live integrations | Nothing is actually sent or called | By design | Implement real provider adapters behind the existing feature-flag and readiness framework | Large |
| Coverage is focused on engines, services proven by composition tests only | No repository or full-page coverage | Medium | Add a test database in CI and cover services and repositories end to end | 2 to 3 days |
| No Content-Security-Policy header | Hardening | Low | Define a deployment-specific CSP with nonces wired through Next.js and the auth client, then test it against real rendering before enabling. A brittle CSP that breaks rendering is worse than none, so this is deferred rather than guessed | 0.5 to 1 day |
| CI dependency audit is non-blocking | Supply chain visibility without enforcement | Low | The current high and critical advisories are upstream framework issues fixed only by a major web framework upgrade. Upgrade the framework, then make the audit step blocking | 0.5 to 1 day |

## Closed in the hardening and proof pass

- No security headers in `next.config.mjs`: added X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, a restrictive Permissions-Policy, and
  Strict-Transport-Security. CSP is intentionally deferred and tracked above.
- No dependency audit in CI: added a non-blocking `npm audit` step scoped to
  production dependencies at high severity and above, plus a Dependabot config
  for weekly npm and github-actions updates.
- Service-level proof gap: added composition and behavior tests that prove
  tenant isolation, human review gating, provider governance in demo mode,
  revenue attribution categories, and landing scenario integrity, without
  requiring a live database.
- Reviewer proof gap: added docs/PROOF_OF_WORK.md, a direct statement of what is
  real, what is simulated, what is not integrated, and how to validate it.

## Closed in Phase 12

- N+1 query pattern on the Revenue Command Center and Revenue Engine pages
- Audit and revenue history destroyed by customer deletion
- Demo owner fallback active in production by default
- Dead code: Phase 0 provider cluster, voice repository shims, unused services
- Missing composite and optional foreign key indexes
- Dangling `VoicePlan.recommendationId` foreign key
- No CI, no tests, no safety scan, no architecture boundary enforcement
- Missing voice review approval flow
