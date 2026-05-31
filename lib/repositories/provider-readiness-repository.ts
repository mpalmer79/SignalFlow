import type { ProviderReadinessStatusEnum } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { ProviderCapability } from "@/lib/providers/provider-capabilities";
import type { ReadinessStatus } from "@/lib/providers/provider-readiness";

export interface ProviderReadinessRecord {
  id: string;
  providerKey: string;
  capability: ProviderCapability;
  status: ReadinessStatus;
  missingRequirements: string[];
  createdAt: string;
}

function statusToDb(status: ReadinessStatus): ProviderReadinessStatusEnum {
  return status.replace(/-/g, "_") as ProviderReadinessStatusEnum;
}
function statusFromDb(status: ProviderReadinessStatusEnum): ReadinessStatus {
  return status.replace(/_/g, "-") as ReadinessStatus;
}

export async function findProviderReadinessChecks(
  organizationId: string,
): Promise<ProviderReadinessRecord[]> {
  const rows = await prisma.providerReadinessCheck.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    providerKey: row.providerKey,
    capability: row.capability as ProviderCapability,
    status: statusFromDb(row.status),
    missingRequirements: row.missingRequirements,
    createdAt: row.createdAt.toISOString(),
  }));
}

// Replace the stored readiness checks for an organization with a fresh set.
// Readiness is deterministic, so recomputing and replacing keeps the table
// consistent with the current registry and flags.
export async function replaceProviderReadinessChecks(
  organizationId: string,
  checks: {
    providerKey: string;
    capability: ProviderCapability;
    status: ReadinessStatus;
    missingRequirements: string[];
  }[],
): Promise<void> {
  await prisma.$transaction([
    prisma.providerReadinessCheck.deleteMany({ where: { organizationId } }),
    prisma.providerReadinessCheck.createMany({
      data: checks.map((check) => ({
        organizationId,
        providerKey: check.providerKey,
        capability: check.capability,
        status: statusToDb(check.status),
        missingRequirements: check.missingRequirements,
      })),
    }),
  ]);
}
