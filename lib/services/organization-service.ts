import {
  findOrganizationById,
  listMembers,
  type MemberRecord,
  type OrganizationRecord,
} from "@/lib/repositories/organization-repository";
import type { RequestContext } from "@/lib/types/auth";

// Organization reads scoped to the caller's own organization. The organization
// id always comes from the resolved server context, never the client, so a
// caller can only ever read its own organization.
export async function getCurrentOrganization(
  context: RequestContext,
): Promise<OrganizationRecord | null> {
  return findOrganizationById(context.organizationId);
}

export async function listOrganizationMembers(
  context: RequestContext,
): Promise<MemberRecord[]> {
  return listMembers(context.organizationId);
}
