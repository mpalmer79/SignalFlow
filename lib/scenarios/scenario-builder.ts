import type { ScenarioDefinition } from "@/lib/types/scenario";
import type { VerticalId } from "@/lib/types/vertical-pack";

export interface ScenarioBuilderInput {
  id: string;
  title: string;
  vertical: VerticalId;
  summary: string;
  intentLevel?: ScenarioDefinition["intentLevel"];
  consentState?: ScenarioDefinition["consentState"];
  optedOut?: boolean;
  hasResponse?: boolean;
  signalKeys?: string[];
}

// Build a scenario definition from partial input, applying sensible defaults.
// Used for composing custom scenarios deterministically.
export function buildScenarioDefinition(
  input: ScenarioBuilderInput,
): ScenarioDefinition {
  return {
    id: input.id,
    title: input.title,
    vertical: input.vertical,
    summary: input.summary,
    intentLevel: input.intentLevel ?? "medium",
    consentState: input.consentState ?? "granted",
    optedOut: input.optedOut ?? false,
    hasResponse: input.hasResponse ?? false,
    signalKeys: input.signalKeys ?? [],
  };
}
