import type { RequestContext } from "@/lib/types/auth";
import { isClerkConfigured } from "./clerk-config";
import {
  DEMO_ORG_SLUG,
  findMembershipByClerkUserId,
  findOrganizationBySlug,
} from "@/lib/repositories/organization-repository";

// A static demo context used when no demo organization is seeded yet. It keeps
// protected pages renderable even on a fresh database.
const STATIC_DEMO_CONTEXT: RequestContext = {
  userId: "demo-owner",
  userName: "Demo Owner",
  userEmail: "owner@signalflow.demo",
  organizationId: "demo-organization",
  organizationName: "SignalFlow Demo Organization",
  role: "OWNER",
  source: "demo",
};

// The demo owner fallback is a development and review convenience. It must
// never silently grant owner access on a production deployment that simply
// forgot to configure authentication. It is allowed only outside production,
// or when an operator explicitly opts in with ALLOW_DEMO_MODE=true.
export function isDemoFallbackAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ALLOW_DEMO_MODE === "true";
}

// Resolve the request context for the current server request. When Clerk is
// configured, the context comes from the authenticated session and the user
// membership. When Clerk is not configured and the demo fallback is allowed, a
// clearly labeled demo context is returned so the application stays reviewable.
//
// In production without Clerk configured and without an explicit
// ALLOW_DEMO_MODE opt in, this returns null so protected pages render a setup
// required state rather than granting owner access by accident. Returns null
// also when Clerk is configured and the user is signed in but has no
// provisioned membership.
export async function resolveRequestContext(): Promise<RequestContext | null> {
  if (isClerkConfigured()) {
    return resolveClerkContext();
  }
  if (!isDemoFallbackAllowed()) {
    return null;
  }
  return resolveDemoContext();
}

async function resolveClerkContext(): Promise<RequestContext | null> {
  // Import lazily so the module is never evaluated in demo mode.
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = auth();
  if (!userId) return null;

  const resolved = await findMembershipByClerkUserId(userId);
  if (!resolved) return null;

  return {
    userId: resolved.member.userId,
    userName: resolved.member.userName,
    userEmail: resolved.member.userEmail,
    organizationId: resolved.organization.id,
    organizationName: resolved.organization.name,
    role: resolved.member.role,
    source: "clerk",
  };
}

// The demo fallback resolves the seeded demo organization so org scoping uses a
// real organization id. If the demo organization is not seeded, the static
// context is returned.
async function resolveDemoContext(): Promise<RequestContext> {
  try {
    const org = await findOrganizationBySlug(DEMO_ORG_SLUG);
    if (!org) return STATIC_DEMO_CONTEXT;
    return {
      ...STATIC_DEMO_CONTEXT,
      organizationId: org.id,
      organizationName: org.name,
    };
  } catch {
    // The database may be unavailable in a pure static render. Fall back safely.
    return STATIC_DEMO_CONTEXT;
  }
}

export function isDemoContext(context: RequestContext): boolean {
  return context.source === "demo";
}
