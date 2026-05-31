import type { OutcomeMemoryInput } from "./outcome-memory";
import type { VerticalId } from "@/lib/types/vertical-pack";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";
import type {
  OutcomeEventRecord,
  RevenueAttributionRecord,
} from "@/lib/types/outcome-records";

// Pure assembly of outcome memory inputs from bulk records. This replaces the
// previous per customer query loops: the service now fetches all runs, all
// attributions, and all outcome events for the organization in a few queries,
// and this function joins them in memory. Deterministic, no Prisma, no network.
export function buildOutcomeMemoryInputs(args: {
  runs: WorkflowRunRecord[];
  attributions: RevenueAttributionRecord[];
  outcomeEvents: OutcomeEventRecord[];
  verticalByCustomerId: Map<string, VerticalId>;
}): OutcomeMemoryInput[] {
  const { runs, attributions, outcomeEvents, verticalByCustomerId } = args;

  // First attribution per run mirrors the previous find based semantics.
  const attributionByRun = new Map<string, RevenueAttributionRecord>();
  for (const attribution of attributions) {
    if (attribution.workflowRunId && !attributionByRun.has(attribution.workflowRunId)) {
      attributionByRun.set(attribution.workflowRunId, attribution);
    }
  }

  const outcomeTypesByRun = new Map<string, OutcomeEventRecord["outcomeType"][]>();
  for (const event of outcomeEvents) {
    if (!event.workflowRunId) continue;
    const list = outcomeTypesByRun.get(event.workflowRunId) ?? [];
    list.push(event.outcomeType);
    outcomeTypesByRun.set(event.workflowRunId, list);
  }

  const inputs: OutcomeMemoryInput[] = [];
  for (const run of runs) {
    const vertical = verticalByCustomerId.get(run.customerId);
    if (!vertical) continue;
    const attribution = attributionByRun.get(run.id);
    inputs.push({
      vertical,
      outcomeTypes: outcomeTypesByRun.get(run.id) ?? [],
      attributionType: attribution?.attributionType ?? null,
      attributedAmount: attribution?.attributedAmount ?? 0,
      outcomeScore: 0,
      executedActionTypes: run.actions
        .filter((action) => action.status === "executed")
        .map((action) => action.actionType),
    });
  }
  return inputs;
}
