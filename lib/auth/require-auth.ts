import type { Permission, RequestContext } from "@/lib/types/auth";
import { hasPermission } from "./authorization";
import { resolveRequestContext } from "./auth-context";

export type PageAccess =
  | { status: "ok"; context: RequestContext }
  | { status: "unauthenticated" }
  | { status: "forbidden"; context: RequestContext };

// Resolve the request context and enforce a permission for a protected page.
// This is the server side authorization entry point. Pages render a clear
// state for each outcome rather than trusting any client provided role.
export async function requirePageAccess(
  permission: Permission,
): Promise<PageAccess> {
  const context = await resolveRequestContext();
  if (!context) {
    return { status: "unauthenticated" };
  }
  if (!hasPermission(context, permission)) {
    return { status: "forbidden", context };
  }
  return { status: "ok", context };
}

// Resolve the context for a protected page that needs identity but not a
// specific permission, for example the settings shell. Returns null when
// unauthenticated.
export async function requireContext(): Promise<RequestContext | null> {
  return resolveRequestContext();
}
