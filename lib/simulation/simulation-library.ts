import type { SimulationConfig } from "@/lib/types/simulation";

// Preset simulation runs shown in the Simulation Center.
export const simulationLibrary: SimulationConfig[] = [
  {
    id: "automotive-50",
    title: "50 automotive leads",
    vertical: "automotive",
    count: 50,
    summary: "A month of mixed dealership leads across sales and service.",
  },
  {
    id: "dental-100",
    title: "100 dental recall patients",
    vertical: "dental",
    count: 100,
    summary: "A recall campaign across a full patient base.",
  },
  {
    id: "home-services-75",
    title: "75 HVAC estimates",
    vertical: "home-services",
    count: 75,
    summary: "Seasonal estimate demand for a regional contractor.",
  },
  {
    id: "legal-30",
    title: "30 legal consultations",
    vertical: "legal-intake",
    count: 30,
    summary: "Consultation intake for a consumer law practice.",
  },
  {
    id: "insurance-25",
    title: "25 insurance renewals",
    vertical: "insurance",
    count: 25,
    summary: "An agency renewal cycle across personal lines.",
  },
];

export function getSimulationConfig(id: string): SimulationConfig | undefined {
  return simulationLibrary.find((config) => config.id === id);
}
