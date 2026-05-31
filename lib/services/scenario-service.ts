import type { ScenarioDefinition, ScenarioResult } from "@/lib/types/scenario";
import { listScenarios, runScenarioById } from "@/lib/scenarios/scenario-runner";

export function getScenarios(): ScenarioDefinition[] {
  return listScenarios();
}

export function getScenarioResult(id: string): ScenarioResult | null {
  return runScenarioById(id);
}
