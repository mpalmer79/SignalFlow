import { recordProviderAuditEvents } from "@/lib/repositories/provider-audit-repository";
import { runSandbox, type SandboxResult } from "@/lib/providers/provider-sandbox";
import type { ProviderCapability } from "@/lib/providers/provider-capabilities";
import { getFeatureFlagMap } from "./feature-flag-service";
import type { RequestContext } from "@/lib/types/auth";

// The default sandbox scenarios shown on the provider sandbox page. Each is a
// deterministic illustration of what a provider request would look like. No
// network call is made.
const DEFAULT_SCENARIOS: { capability: ProviderCapability; inputSummary: string }[] = [
  {
    capability: "TEXT_RECOMMENDATION",
    inputSummary: "High intent automotive lead with a trade request and no risk flags.",
  },
  {
    capability: "INTENT_CLASSIFICATION",
    inputSummary: "Recent signals: trade request, two vehicle views, one email open.",
  },
  {
    capability: "VOICE_SYNTHESIS",
    inputSummary: "Dental recall script for an overdue cleaning.",
  },
  {
    capability: "CALL_TRANSPORT",
    inputSummary: "Outbound follow-up to a home services estimate lead.",
  },
  {
    capability: "SMS_DELIVERY",
    inputSummary: "Appointment confirmation for an insurance renewal.",
  },
  {
    capability: "EMAIL_DELIVERY",
    inputSummary: "Consultation scheduling note for a legal intake lead.",
  },
  {
    capability: "TRANSCRIPT_SUMMARY",
    inputSummary: "A five line simulated voice transcript ending in an appointment.",
  },
];

export interface ProviderSandboxView {
  results: SandboxResult[];
  demoSafe: true;
}

// Run the default sandbox scenarios and record a single audit event. Every
// result selects the internal mock provider and reports the blocked live
// reason, because demo mode is active.
export async function runProviderSandbox(
  context: RequestContext,
): Promise<ProviderSandboxView> {
  const flagMap = await getFeatureFlagMap(context);

  const results = DEFAULT_SCENARIOS.map((scenario) =>
    runSandbox(scenario, flagMap),
  );

  await recordProviderAuditEvents(
    context.organizationId,
    results.map((result) => ({
      providerKey: result.selectedProviderKey ?? "none",
      action: "PROVIDER_SANDBOX_RUN" as const,
      result: "simulated" as const,
      reason: `${result.capabilityLabel}: ${result.selectionReason}`,
    })),
  );

  return { results, demoSafe: true };
}
