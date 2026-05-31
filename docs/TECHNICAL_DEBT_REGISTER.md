# Technical Debt Register

Tracked technical debt after the Phase 12 remediation. Items the remediation
closed are listed at the bottom for context.

## Open

| Item | Impact | Severity | Recommended fix | Effort |
|---|---|---|---|---|
| Dashboard issues 18 parallel queries including a few unbounded reads | Heavy flagship page at large org sizes | Medium | Precompute a dashboard snapshot or cache aggregates with revalidation | 1 day |
| No server-side caching anywhere | Every render recomputes aggregates | Medium | Add `unstable_cache` or a snapshot table for command center and dashboard | 1 to 2 days |
| Revenue Command Center page is large | Maintenance | Low | Split the page into section components | 0.5 day |
| `revenue-command-center-service` is large | Maintenance | Low | Split featured journey, funnel, vertical memory, and replay into modules | 0.5 day |
| Provider sandbox writes one audit row per scenario per visit | Audit log growth | Low | Batch or rate limit sandbox audit writes | 1 hour |
| No interactive provider or feature flag management UI | Read-only governance | Low | Add gated management actions, still locked off in demo mode | 1 to 2 days |
| `VoiceCallOutcome.customerId` and `opportunityId` are denormalized strings | Integrity relies on the writer | Low | Acceptable for the analytics read path; documented in DATA_MODEL.md | n/a |
| Coverage is focused on engines, not services or pages | Partial safety net | Medium | Add service-level tests with a test database in CI | 2 to 3 days |
| No security headers in `next.config.mjs` | Hardening | Low | Add CSP, HSTS, and Referrer-Policy headers | 1 hour |
| No Dependabot or dependency audit in CI | Supply chain | Low | Add Dependabot and an `npm audit` CI step | 30 min |

## Closed in Phase 12

- N+1 query pattern on the Revenue Command Center and Revenue Engine pages
- Audit and revenue history destroyed by customer deletion
- Demo owner fallback active in production by default
- Dead code: Phase 0 provider cluster, voice repository shims, unused services
- Missing composite and optional foreign key indexes
- Dangling `VoicePlan.recommendationId` foreign key
- No CI, no tests, no safety scan, no architecture boundary enforcement
- Missing voice review approval flow
