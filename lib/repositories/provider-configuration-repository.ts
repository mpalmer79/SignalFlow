import type {
  ProviderCategoryEnum,
  ProviderStatusEnum,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  ProviderCategory,
  ProviderStatus,
} from "@/lib/providers/provider-registry";

export interface ProviderConfigurationRecord {
  id: string;
  providerKey: string;
  category: ProviderCategory;
  status: ProviderStatus;
  sandboxEnabled: boolean;
  liveEnabled: boolean;
  complianceApproved: boolean;
  configuredAt: string | null;
  createdAt: string;
}

function statusFromDb(status: ProviderStatusEnum): ProviderStatus {
  return status.replace(/_/g, "-") as ProviderStatus;
}
function statusToDb(status: ProviderStatus): ProviderStatusEnum {
  return status.replace(/-/g, "_") as ProviderStatusEnum;
}

export async function findProviderConfigurations(
  organizationId: string,
): Promise<ProviderConfigurationRecord[]> {
  const rows = await prisma.providerConfiguration.findMany({
    where: { organizationId },
    orderBy: { providerKey: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    providerKey: row.providerKey,
    category: row.category as ProviderCategory,
    status: statusFromDb(row.status),
    sandboxEnabled: row.sandboxEnabled,
    liveEnabled: row.liveEnabled,
    complianceApproved: row.complianceApproved,
    configuredAt: row.configuredAt ? row.configuredAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  }));
}

// Upsert a provider configuration. No secrets are ever stored; only flags that
// describe sandbox and live enablement and compliance approval.
export async function upsertProviderConfiguration(input: {
  organizationId: string;
  providerKey: string;
  category: ProviderCategory;
  status: ProviderStatus;
  sandboxEnabled: boolean;
  liveEnabled: boolean;
  complianceApproved: boolean;
}): Promise<void> {
  await prisma.providerConfiguration.upsert({
    where: {
      organizationId_providerKey: {
        organizationId: input.organizationId,
        providerKey: input.providerKey,
      },
    },
    create: {
      organizationId: input.organizationId,
      providerKey: input.providerKey,
      category: input.category as ProviderCategoryEnum,
      status: statusToDb(input.status),
      sandboxEnabled: input.sandboxEnabled,
      liveEnabled: input.liveEnabled,
      complianceApproved: input.complianceApproved,
      configuredAt: new Date(),
    },
    update: {
      status: statusToDb(input.status),
      sandboxEnabled: input.sandboxEnabled,
      liveEnabled: input.liveEnabled,
      complianceApproved: input.complianceApproved,
      configuredAt: new Date(),
    },
  });
}
