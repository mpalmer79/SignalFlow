import type { ScenarioDefinition, ScenarioResult } from "@/lib/types/scenario";
import { scenarioLibrary, getScenarioDefinition } from "./scenario-library";
import { runScenario } from "./scenario-engine";

export function listScenarios(): ScenarioDefinition[] {
  return scenarioLibrary;
}

export function runScenarioById(id: string): ScenarioResult | null {
  const definition = getScenarioDefinition(id);
  if (!definition) return null;
  return runScenario(definition);
}
