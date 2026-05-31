import type { Permission, RequestContext, Role } from "@/lib/types/auth";
import { ROLE_PERMISSIONS } from "./roles";

// The deterministic authorization core. It is pure: it reads only the role to
// permission map and never touches Prisma, Clerk, or React.

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasPermission(
  context: RequestContext,
  permission: Permission,
): boolean {
  return roleHasPermission(context.role, permission);
}

// Thrown when a permission check fails. Callers translate this into a server
// side denied state rather than leaking details to the client.
export class AuthorizationError extends Error {
  constructor(public readonly permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "AuthorizationError";
  }
}
