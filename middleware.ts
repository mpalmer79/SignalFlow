import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protected application routes. These require an authenticated session when
// Clerk is configured, and a permission check on every page in both modes.
//
// Intentionally public routes: the marketing home (/), the guided product
// walkthrough (/demo), and the auth routes (/sign-in, /sign-up). The demo
// walkthrough renders a single deterministic scenario and reads no organization
// scoped data, so it stays public.
//
// The scenarios and simulation center pages live inside the authenticated
// workspace shell and are protected here and by page guards, so they are not
// public even though their underlying engines are deterministic.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/intelligence",
  "/signals",
  "/customers",
  "/opportunities",
  "/action-graph",
  "/orchestrator",
  "/revenue-engine",
  "/communications",
  "/vertical-packs",
  "/audit",
  "/settings",
  "/executive-insights",
  "/scenarios",
  "/simulation-center",
  "/ai-center",
  "/review-queue",
];

export function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const isProtectedRoute = createRouteMatcher(
  PROTECTED_PREFIXES.map((prefix) => `${prefix}(.*)`),
);

const clerkHandler = clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }
});

// When Clerk is configured, protect the app routes with Clerk middleware. When
// it is not configured, the middleware is a pass through so the demo remains
// fully reviewable. Server side page guards still enforce authorization in both
// modes.
export default function middleware(request: NextRequest, event: unknown) {
  if (!clerkConfigured) {
    return NextResponse.next();
  }
  // The Clerk handler accepts the request and the fetch event.
  return (clerkHandler as unknown as (req: NextRequest, ev: unknown) => Response)(
    request,
    event,
  );
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
