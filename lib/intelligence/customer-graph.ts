import type { CustomerGraph, CustomerIntelligenceProfile } from "@/lib/types/intelligence";
import { buildIntelligenceProfile, type IntelligenceInput } from "./graph-summary";
import { buildCustomerGraph } from "./graph-builder";

export interface CustomerIntelligence {
  profile: CustomerIntelligenceProfile;
  graph: CustomerGraph;
}

// Facade that produces both the intelligence profile and the relationship graph
// from a single set of persisted inputs.
export function buildCustomerIntelligence(
  input: IntelligenceInput,
): CustomerIntelligence {
  const profile = buildIntelligenceProfile(input);
  const graph = buildCustomerGraph({
    customer: input.customer,
    signals: profile.normalizedSignals,
    opportunities: input.opportunities,
    communications: input.communications,
    riskFlags: profile.riskFlags,
  });

  return { profile, graph };
}
