import {
  findProviderConfigurations,
  type ProviderConfigurationRecord,
} from "@/lib/repositories/provider-configuration-repository";
import {
  findProviderAuditEvents,
  recordProviderAuditEvents,
  type ProviderAuditEventRecord,
} from "@/lib/repositories/provider-audit-repository";
import {
  findProviderReadinessChecks,
  replaceProviderReadinessChecks,
  type ProviderReadinessRecord,
} from "@/lib/repositories/provider-readiness-repository";
import {
  PROVIDER_REGISTRY,
  type ProviderDefinition,
} from "@/lib/providers/provider-registry";
import { ALL_CAPABILITIES } from "@/lib/providers/provider-capabilities";
import {
  checkReadiness,
  type ReadinessInput,
  type ReadinessStatus,
} from "@/lib/providers/provider-readiness";
import { getFeatureFlagMap } from "./feature-flag-service";
import type { RequestContext } from "@/lib/types/auth";
import type { FeatureFlagEvaluation } from "@/lib/feature-flags/feature-flag-types";

export interface ProviderRow {
  provider: ProviderDefinition;
  configuration: ProviderConfigurationRecord | null;
  readiness: ReadinessStatus;
}

export interface ProviderManagementView {
  providers: ProviderRow[];
  auditEvents: ProviderAuditEventRecord[];
  readinessChecks: ProviderReadinessRecord[];
  flags: FeatureFlagEvaluation[];
  liveProvidersEnabled: number;
}

function readinessInputFor(
  configuration: ProviderConfigurationRecord | null,
  flagByKey: Map<string, FeatureFlagEvaluation>,
): ReadinessInput {
  return {
    configured: configuration?.configuredAt != null,
    sandboxEnabled: configuration?.sandboxEnabled ?? true,
    liveEnabled: configuration?.liveEnabled ?? false,
    complianceApproved: configuration?.complianceApproved ?? false,
    flagByKey,
  };
}

// The coarse readiness for a provider is the best readiness across its
// capabilities. In this phase that is sandbox-ready at most for any provider.
function coarseReadiness(
  provider: ProviderDefinition,
  input: ReadinessInput,
): ReadinessStatus {
  let best: ReadinessStatus = "not-ready";
  for (const capability of provider.capabilities) {
    const result = checkReadiness(provider.providerKey, capability, input);
    if (result.status === "live-ready") return "live-ready";
    if (result.status === "sandbox-ready") best = "sandbox-ready";
  }
  return best;
}

export async function getProviderManagement(
  context: RequestContext,
): Promise<ProviderManagementView> {
  const orgId = context.organizationId;
  const [configurations, auditEvents, readinessChecks, flagMap] =
    await Promise.all([
      findProviderConfigurations(orgId),
      findProviderAuditEvents(orgId),
      findProviderReadinessChecks(orgId),
      getFeatureFlagMap(context),
    ]);

  const configByKey = new Map(
    configurations.map((config) => [config.providerKey, config]),
  );

  const providers: ProviderRow[] = PROVIDER_REGISTRY.map((provider) => {
    const configuration = configByKey.get(provider.providerKey) ?? null;
    const input = readinessInputFor(configuration, flagMap);
    return {
      provider,
      configuration,
      readiness: coarseReadiness(provider, input),
    };
  });

  const liveProvidersEnabled = providers.filter(
    (row) => row.readiness === "live-ready",
  ).length;

  return {
    providers,
    auditEvents,
    readinessChecks,
    flags: Array.from(flagMap.values()),
    liveProvidersEnabled,
  };
}

// Recompute and persist readiness checks for every provider capability, then
// record an audit event. Deterministic: the same flags and configuration
// always produce the same checks.
export async function refreshReadinessChecks(
  context: RequestContext,
): Promise<ProviderReadinessRecord[]> {
  const orgId = context.organizationId;
  const [configurations, flagMap] = await Promise.all([
    findProviderConfigurations(orgId),
    getFeatureFlagMap(context),
  ]);
  const configByKey = new Map(
    configurations.map((config) => [config.providerKey, config]),
  );

  const checks: {
    providerKey: string;
    capability: (typeof ALL_CAPABILITIES)[number];
    status: ReadinessStatus;
    missingRequirements: string[];
  }[] = [];

  for (const provider of PROVIDER_REGISTRY) {
    const configuration = configByKey.get(provider.providerKey) ?? null;
    const input = readinessInputFor(configuration, flagMap);
    for (const capability of provider.capabilities) {
      const result = checkReadiness(provider.providerKey, capability, input);
      checks.push({
        providerKey: provider.providerKey,
        capability,
        status: result.status,
        missingRequirements: result.missingRequirements,
      });
    }
  }

  await replaceProviderReadinessChecks(orgId, checks);
  await recordProviderAuditEvents(orgId, [
    {
      providerKey: "platform",
      action: "PROVIDER_READINESS_CHECKED",
      result: "recorded",
      reason: `Recomputed readiness for ${checks.length} provider capabilities. No provider is live ready in demo mode.`,
    },
  ]);

  return findProviderReadinessChecks(orgId);
}
