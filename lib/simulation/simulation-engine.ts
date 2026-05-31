import type { SimulationConfig, SimulationResult } from "@/lib/types/simulation";
import { requireVerticalPackConfig } from "@/lib/verticals/registry";
import { generateCustomer, createRng, hashSeed } from "./synthetic-data";
import { runEnginesForCustomer, type EngineRunResult } from "./engine-runner";
import { scoreSimulation } from "./simulation-scorer";

// Deterministically distribute a population across intent levels, consent
// states, and response behavior, so a large run produces a believable mix of
// outcomes without any randomness beyond the seeded generator.
function profileFor(rng: () => number) {
  const intentRoll = rng();
  const intentLevel =
    intentRoll > 0.66 ? "high" : intentRoll > 0.33 ? "medium" : "low";

  const consentRoll = rng();
  const optedOut = consentRoll > 0.92;
  const consentState = optedOut
    ? ("revoked" as const)
    : consentRoll > 0.78
      ? ("unknown" as const)
      : ("granted" as const);

  const hasResponse = !optedOut && rng() > 0.45;

  return { intentLevel, consentState, optedOut, hasResponse } as const;
}

// Run a batch simulation for a vertical. Generates count customers, runs each
// through the engine stack, and aggregates the metrics. No IO, no randomness
// outside the seeded generator.
export function runSimulation(config: SimulationConfig): SimulationResult {
  const pack = requireVerticalPackConfig(config.vertical);
  const rng = createRng(hashSeed(`simulation:${config.id}`));

  const runs: EngineRunResult[] = [];
  for (let i = 0; i < config.count; i += 1) {
    const profile = profileFor(rng);
    const generated = generateCustomer({
      pack,
      index: i,
      seedKey: `simulation:${config.id}`,
      intentLevel: profile.intentLevel,
      consentState: profile.consentState,
      optedOut: profile.optedOut,
      hasResponse: profile.hasResponse,
    });
    runs.push(runEnginesForCustomer(generated));
  }

  const { metrics, outcomeBreakdown } = scoreSimulation(runs);
  return { config, metrics, outcomeBreakdown };
}
