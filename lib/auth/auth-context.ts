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

// Resolve the request context for the current server request. When Clerk is
// configured, the context comes from the authenticated session and the user
// membership. When Clerk is not configured, a clearly labeled demo context is
// returned so the application stays reviewable. Returns null only when Clerk is
// configured and the user is signed in but has no provisioned membership.
export async function resolveRequestContext(): Promise<RequestContext | null> {
  if (isClerkConfigured()) {
    return resolveClerkContext();
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
