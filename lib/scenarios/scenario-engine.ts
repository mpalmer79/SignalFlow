import type { ScenarioDefinition, ScenarioResult } from "@/lib/types/scenario";
import { requireVerticalPackConfig } from "@/lib/verticals/registry";
import { generateCustomer } from "@/lib/simulation/synthetic-data";
import { runEnginesForCustomer } from "@/lib/simulation/engine-runner";
import { buildScenarioTimeline } from "./scenario-outcomes";

// Run a scenario definition through the full deterministic stack. Generates a
// customer, signals, and opportunity, then runs intelligence, workflow, and
// outcome assessment, and assembles the storytelling timeline. No randomness
// beyond the seeded generator, no IO.
export function runScenario(definition: ScenarioDefinition): ScenarioResult {
  const pack = requireVerticalPackConfig(definition.vertical);

  const generated = generateCustomer({
    pack,
    index: 0,
    seedKey: `scenario:${definition.id}`,
    intentLevel: definition.intentLevel,
    consentState: definition.consentState,
    optedOut: definition.optedOut,
    hasResponse: definition.hasResponse,
    signalKeys: definition.signalKeys,
  });

  const { profile, workflow, assessment } = runEnginesForCustomer(generated);

  const base = {
    definition,
    customer: generated.customer,
    signals: generated.signals,
    opportunity: generated.opportunity,
    profile,
    workflow,
    assessment,
  };

  return { ...base, timeline: buildScenarioTimeline(base) };
}
