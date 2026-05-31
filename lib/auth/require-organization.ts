import type { RequestContext } from "@/lib/types/auth";

// Guard that ensures a request context carries an organization. Every context
// in this model has one, but services use this to make the requirement explicit
// and to extract the organization id safely. The organization id is never taken
// from the client; it always comes from the resolved server context.
export function requireOrganizationId(context: RequestContext): string {
  if (!context.organizationId) {
    throw new Error("Request context is missing an organization");
  }
  return context.organizationId;
}
