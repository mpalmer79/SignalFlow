# Authorization

SignalFlow uses deterministic, server-side, role-based access control. Authorization decisions come from a fixed role to permission map and are never derived from client provided data. This document describes the model as implemented.

## Identity and request context

Every protected page resolves a request context on the server before rendering. The context carries the user id, name, email, organization id, organization name, role, and a source flag of either clerk or demo. It is produced only in lib/auth/auth-context.ts. Services and repositories receive this context, or its organization id, and never read identity from the client.

## Clerk usage

Authentication is provided by Clerk and is optional. When NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are both set:

- The root layout wraps the app in ClerkProvider.
- middleware.ts protects the application routes and requires a signed in user.
- The request context is resolved from the Clerk session and the user membership.
- The sign-in and sign-up routes render the Clerk widgets on the client.

Clerk is never imported by the pure engines or by the authorization core. Only the auth context, middleware, root layout, auth provider, and the sign-in and sign-up routes reference Clerk.

## Demo auth fallback

When Clerk keys are absent, the application stays fully reviewable:

- The middleware is a pass through.
- The request context resolves to a clearly labeled demo context: Demo Owner with the OWNER role, scoped to the seeded demo organization.
- The header and the settings page label this as a demo auth context, so it is never mistaken for production authentication.

The demo fallback is isolated in lib/auth/auth-context.ts and is the only place that produces a non-Clerk context. Because the demo context still carries a real organization id, organization scoping is exercised exactly as it would be for a Clerk session.

## Roles

```text
OWNER
ADMIN
MANAGER
SALES_USER
SERVICE_USER
MARKETING_USER
COMPLIANCE_REVIEWER
VIEWER
```

## Permissions

```text
VIEW_DASHBOARD
VIEW_INTELLIGENCE
VIEW_CUSTOMERS
MANAGE_CUSTOMERS
VIEW_OPPORTUNITIES
VIEW_SIGNALS
VIEW_WORKFLOWS
VIEW_COMMUNICATIONS
VIEW_REVENUE
VIEW_EXECUTIVE_INSIGHTS
RUN_SIMULATION
VIEW_SCENARIOS
VIEW_VERTICAL_PACKS
VIEW_AUDIT
VIEW_COMPLIANCE
MANAGE_SETTINGS
```

## Role to permission mapping

- OWNER: all permissions, including the owner only MANAGE_SETTINGS.
- ADMIN: all permissions except owner only actions.
- MANAGER: dashboard, intelligence, customers and manage customers, opportunities, signals, workflows, communications, revenue, executive insights, simulations, scenarios, vertical packs.
- SALES_USER: dashboard, intelligence, customers and manage customers, opportunities, signals, communications, workflows.
- SERVICE_USER: dashboard, intelligence, customers and manage customers, opportunities, signals, communications.
- MARKETING_USER: dashboard, intelligence, scenarios, simulations, executive insights, revenue, vertical packs.
- COMPLIANCE_REVIEWER: dashboard, audit, compliance, communications, customers.
- VIEWER: read only dashboard, intelligence, customers, opportunities, signals, workflows, revenue, vertical packs.

The mapping lives in lib/auth/roles.ts and is consumed only through the pure hasPermission function in lib/auth/authorization.ts.

## Route protection

Each protected page calls guardPage(permission) at the top of the server component. The guard resolves the context and checks the permission. It returns one of three outcomes:

- ok: the page renders with the resolved context.
- unauthenticated: the page renders a sign-in required state. In demo mode this never occurs because the demo context is always resolved.
- forbidden: the page renders an access restricted state that names the current role.

Pages never trust a client provided role and never receive an organization id from the client. Defense in depth: the middleware blocks unauthenticated access at the edge when Clerk is configured, and the page guard plus organization scoped repositories enforce access on the server in both modes.

### Public and protected routes

Public routes, reachable without a session:

```text
/
/demo
/sign-in
/sign-up
```

The demo walkthrough renders a single deterministic scenario and reads no organization scoped data, so it stays public.

Protected routes, guarded by middleware and a page level permission check:

```text
/dashboard            VIEW_DASHBOARD
/intelligence         VIEW_INTELLIGENCE
/signals              VIEW_SIGNALS
/customers            VIEW_CUSTOMERS
/opportunities        VIEW_OPPORTUNITIES
/action-graph         VIEW_WORKFLOWS
/orchestrator         VIEW_WORKFLOWS
/revenue-engine       VIEW_REVENUE
/communications       VIEW_COMMUNICATIONS
/vertical-packs       VIEW_VERTICAL_PACKS
/audit                VIEW_AUDIT
/settings             VIEW_DASHBOARD
/executive-insights   VIEW_EXECUTIVE_INSIGHTS
/scenarios            VIEW_SCENARIOS
/simulation-center    RUN_SIMULATION
```

The scenarios and simulation center pages live inside the authenticated workspace shell. Even though their underlying engines are deterministic, they are protected so workspace navigation is consistent. The standalone /demo walkthrough remains the public preview.

## Audit

The audit event vocabulary includes authorization and membership lifecycle events: USER_CONTEXT_RESOLVED, ORGANIZATION_CONTEXT_RESOLVED, AUTHORIZATION_CHECK_PASSED, AUTHORIZATION_CHECK_FAILED, ROLE_ASSIGNED, and MEMBERSHIP_CREATED. These are used where meaningful, such as membership provisioning during seeding, rather than on every request.

## What remains mocked

Authentication is the only live infrastructure introduced, and it is optional. There are still no AI provider calls, no SMS, email, or voice, and no outbound communication. Those remain disabled because Phase 6 is about access and tenancy, not delivery.

## Demo fallback production guard (Phase 12)

The demo fallback resolves a clearly labeled owner context when no
authentication provider is configured, so the platform stays reviewable. To
prevent a production deployment that simply forgot to configure authentication
from granting owner access to anonymous visitors, the fallback is now refused in
production unless an operator explicitly opts in.

The rule, in `lib/auth/auth-context.ts`:

```text
if NODE_ENV is production and ALLOW_DEMO_MODE is not "true":
  do not use the demo owner fallback
  resolveRequestContext returns null
  protected pages render the unauthenticated state
```

Outside production the demo fallback is unchanged, so local development and
review are unaffected. With Clerk configured, the demo fallback is never used.
