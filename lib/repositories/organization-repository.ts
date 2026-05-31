import { prisma } from "@/lib/db/prisma";
import type { Role, MembershipStatus } from "@/lib/types/auth";

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  industry: string;
}

export interface MemberRecord {
  userId: string;
  userName: string;
  userEmail: string;
  role: Role;
  status: MembershipStatus;
}

export const DEMO_ORG_SLUG = "signalflow-demo";

export async function findOrganizationBySlug(
  slug: string,
): Promise<OrganizationRecord | null> {
  const row = await prisma.organization.findUnique({ where: { slug } });
  return row
    ? { id: row.id, name: row.name, slug: row.slug, industry: row.industry }
    : null;
}

export async function findOrganizationById(
  id: string,
): Promise<OrganizationRecord | null> {
  const row = await prisma.organization.findUnique({ where: { id } });
  return row
    ? { id: row.id, name: row.name, slug: row.slug, industry: row.industry }
    : null;
}

// Resolve a membership for a Clerk user. Returns the first active membership,
// used to establish organization context for an authenticated session.
export async function findMembershipByClerkUserId(clerkUserId: string): Promise<{
  organization: OrganizationRecord;
  member: MemberRecord;
} | null> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: { organization: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
  if (!user || user.memberships.length === 0) return null;

  const membership = user.memberships[0];
  return {
    organization: {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      industry: membership.organization.industry,
    },
    member: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: membership.role as Role,
      status: membership.status as MembershipStatus,
    },
  };
}

export async function listMembers(
  organizationId: string,
): Promise<MemberRecord[]> {
  const rows = await prisma.membership.findMany({
    where: { organizationId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => ({
    userId: row.userId,
    userName: row.user.name,
    userEmail: row.user.email,
    role: row.role as Role,
    status: row.status as MembershipStatus,
  }));
}
