import type { SimulationResult } from "@/lib/types/simulation";

export interface SimulationStage {
  label: string;
  value: string;
}

// Summarize a simulation as a left to right funnel of stages, for display.
export function buildSimulationStages(
  result: SimulationResult,
): SimulationStage[] {
  const { metrics } = result;
  return [
    { label: "Customers", value: String(metrics.customers) },
    { label: "Avg intent", value: String(metrics.averageIntentScore) },
    { label: "Appointments", value: String(metrics.appointmentsGenerated) },
    {
      label: "Completion",
      value: `${metrics.workflowCompletionRate}%`,
    },
    { label: "Policy blocks", value: String(metrics.policyBlocks) },
    {
      label: "Positive rate",
      value: `${metrics.positiveOutcomeRate}%`,
    },
  ];
}
