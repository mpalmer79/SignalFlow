import { listMembers } from "@/lib/repositories/organization-repository";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import { isDemoContext } from "@/lib/auth/auth-context";
import { hasPermission } from "@/lib/auth/authorization";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";
import type { RequestContext, Permission } from "@/lib/types/auth";
import type { MemberRecord } from "@/lib/repositories/organization-repository";

export interface SettingsView {
  organizationName: string;
  organizationId: string;
  role: RequestContext["role"];
  isDemo: boolean;
  clerkConfigured: boolean;
  canManageSettings: boolean;
  members: MemberRecord[];
  rolePermissions: Permission[];
}

// Assemble the settings view model from the request context and persistence.
// The page calls this service so it never imports a repository directly. The
// organization id always comes from the resolved server context, never the
// client.
export async function getSettingsView(
  context: RequestContext,
): Promise<SettingsView> {
  return {
    organizationName: context.organizationName,
    organizationId: context.organizationId,
    role: context.role,
    isDemo: isDemoContext(context),
    clerkConfigured: isClerkConfigured(),
    canManageSettings: hasPermission(context, "MANAGE_SETTINGS"),
    members: await safeListMembers(context.organizationId),
    rolePermissions: ROLE_PERMISSIONS[context.role],
  };
}

// Members come from persistence. On a fresh database without seeded members
// this returns an empty list rather than failing.
async function safeListMembers(
  organizationId: string,
): Promise<MemberRecord[]> {
  try {
    return await listMembers(organizationId);
  } catch {
    return [];
  }
}
