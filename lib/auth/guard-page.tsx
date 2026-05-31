import type { ReactElement } from "react";
import type { Permission, RequestContext } from "@/lib/types/auth";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { requirePageAccess } from "@/lib/auth/require-auth";
import {
  ForbiddenState,
  UnauthenticatedState,
} from "@/components/auth/access-states";

export type GuardResult =
  | { context: RequestContext; denied: null }
  | { context: null; denied: ReactElement };

// Resolve access for a protected page. Returns either the request context or a
// ready to render denied state. This keeps the server side authorization check
// consistent across every protected page.
export async function guardPage(permission: Permission): Promise<GuardResult> {
  const access = await requirePageAccess(permission);
  if (access.status === "unauthenticated") {
    return { context: null, denied: <UnauthenticatedState /> };
  }
  if (access.status === "forbidden") {
    return {
      context: null,
      denied: <ForbiddenState roleLabel={ROLE_LABELS[access.context.role]} />,
    };
  }
  return { context: access.context, denied: null };
}
