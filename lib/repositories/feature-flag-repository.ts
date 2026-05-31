import { prisma } from "@/lib/db/prisma";
import type {
  FeatureFlagKey,
  FeatureFlagOverride,
} from "@/lib/feature-flags/feature-flag-types";

// Read the stored feature flag overrides for an organization. The evaluator
// applies the deterministic policy on top of these values.
export async function findFeatureFlagOverrides(
  organizationId: string,
): Promise<FeatureFlagOverride[]> {
  const rows = await prisma.featureFlag.findMany({
    where: { organizationId },
    orderBy: { flagKey: "asc" },
  });
  return rows.map((row) => ({
    key: row.flagKey as FeatureFlagKey,
    enabled: row.enabled,
    reason: row.reason,
  }));
}

// Upsert a single flag override for an organization.
export async function upsertFeatureFlag(input: {
  organizationId: string;
  flagKey: FeatureFlagKey;
  enabled: boolean;
  reason: string;
}): Promise<void> {
  await prisma.featureFlag.upsert({
    where: {
      organizationId_flagKey: {
        organizationId: input.organizationId,
        flagKey: input.flagKey,
      },
    },
    create: {
      organizationId: input.organizationId,
      flagKey: input.flagKey,
      enabled: input.enabled,
      reason: input.reason,
    },
    update: { enabled: input.enabled, reason: input.reason },
  });
}
