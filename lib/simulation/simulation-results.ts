import type { SimulationConfig, SimulationResult } from "@/lib/types/simulation";
import { simulationLibrary, getSimulationConfig } from "./simulation-library";
import { runSimulation } from "./simulation-engine";

export function listSimulations(): SimulationConfig[] {
  return simulationLibrary;
}

export function runSimulationById(id: string): SimulationResult | null {
  const config = getSimulationConfig(id);
  if (!config) return null;
  return runSimulation(config);
}

// Run every preset simulation. Used for cross-industry comparison views.
export function runAllSimulations(): SimulationResult[] {
  return simulationLibrary.map(runSimulation);
}
