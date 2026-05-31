import type { SimulationConfig, SimulationResult } from "@/lib/types/simulation";
import {
  listSimulations,
  runSimulationById,
  runAllSimulations,
} from "@/lib/simulation/simulation-results";

export function getSimulations(): SimulationConfig[] {
  return listSimulations();
}

export function getSimulationResult(id: string): SimulationResult | null {
  return runSimulationById(id);
}

export function getAllSimulationResults(): SimulationResult[] {
  return runAllSimulations();
}
