import type { WorkflowInsight } from "@/lib/types/analytics";
import type { WorkflowRunRecord } from "@/lib/types/workflow-run";
import type { WorkflowEffectivenessRecord } from "@/lib/types/outcome-records";

export interface WorkflowInsightsResult {
  byTitle: WorkflowInsight[];
  bestWorkflow: WorkflowInsight | null;
  worstWorkflow: WorkflowInsight | null;
  mostExpensiveFailure: { title: string; missedValue: number } | null;
}

// Aggregate workflow runs and their effectiveness snapshots into per-title
// insights, then identify the best, worst, and most expensive failures.
export function computeWorkflowInsights(
  runs: WorkflowRunRecord[],
  effectiveness: WorkflowEffectivenessRecord[],
): WorkflowInsightsResult {
  const effByRun = new Map(effectiveness.map((e) => [e.workflowRunId, e]));

  const byTitle = new Map<
    string,
    { runs: number; scoreSum: number; revenue: number }
  >();

  for (const run of runs) {
    const eff = effByRun.get(run.id);
    const entry =
      byTitle.get(run.title) ?? { runs: 0, scoreSum: 0, revenue: 0 };
    entry.runs += 1;
    entry.scoreSum += eff?.outcomeScore ?? 0;
    entry.revenue += eff?.revenueInfluenced ?? 0;
    byTitle.set(run.title, entry);
  }

  const insights: WorkflowInsight[] = Array.from(byTitle.entries())
    .map(([title, data]) => ({
      title,
      runs: data.runs,
      averageOutcomeScore: data.runs > 0 ? Math.round(data.scoreSum / data.runs) : 0,
      revenueInfluenced: data.revenue,
    }))
    .sort((a, b) => b.averageOutcomeScore - a.averageOutcomeScore);

  const bestWorkflow = insights[0] ?? null;
  const worstWorkflow = insights.length > 0 ? insights[insights.length - 1] : null;

  let mostExpensiveFailure: WorkflowInsightsResult["mostExpensiveFailure"] = null;
  for (const eff of effectiveness) {
    if (eff.outcomeScore < 40) {
      const run = runs.find((r) => r.id === eff.workflowRunId);
      const missedValue = eff.actionsBlocked * 1000 + (100 - eff.outcomeScore) * 50;
      if (!mostExpensiveFailure || missedValue > mostExpensiveFailure.missedValue) {
        mostExpensiveFailure = {
          title: run?.title ?? "Unknown workflow",
          missedValue,
        };
      }
    }
  }

  return { byTitle: insights, bestWorkflow, worstWorkflow, mostExpensiveFailure };
}
