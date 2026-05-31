import type {
  OutcomeAssessment,
  OutcomeType,
} from "@/lib/types/outcome";

export type OutcomeTimelineKind =
  | "outcome"
  | "stage-transition"
  | "attribution"
  | "missed-opportunity"
  | "effectiveness";

export interface OutcomeTimelineRow {
  kind: OutcomeTimelineKind;
  title: string;
  detail: string;
}

// Flatten an outcome assessment into ordered timeline rows for display. Pure
// formatting over already computed values.
export function buildOutcomeTimeline(
  assessment: OutcomeAssessment,
): OutcomeTimelineRow[] {
  const rows: OutcomeTimelineRow[] = [];

  for (const event of assessment.outcomeEvents) {
    rows.push({
      kind: "outcome",
      title: outcomeLabel(event.outcomeType),
      detail: `${event.reason} (${event.confidence}% confidence)`,
    });
  }

  if (assessment.stageTransition) {
    const t = assessment.stageTransition;
    rows.push({
      kind: "stage-transition",
      title: `${stageLabel(t.fromStage)} to ${stageLabel(t.toStage)}`,
      detail: t.reason,
    });
  }

  if (assessment.attribution) {
    const a = assessment.attribution;
    rows.push({
      kind: "attribution",
      title: `${a.attributionType} attribution`,
      detail: `${a.reason} Estimated ${a.attributedAmount} gross influence.`,
    });
  }

  if (assessment.missedOpportunity) {
    const m = assessment.missedOpportunity;
    rows.push({
      kind: "missed-opportunity",
      title: `Missed opportunity (${m.severity})`,
      detail: `${m.reason} Estimated ${m.estimatedValue}. ${m.recommendedRecoveryAction}`,
    });
  }

  rows.push({
    kind: "effectiveness",
    title: `Effectiveness score ${assessment.effectiveness.outcomeScore}`,
    detail: `${assessment.effectiveness.actionsExecuted} executed, ${assessment.effectiveness.actionsBlocked} blocked, ${assessment.effectiveness.actionsEscalated} escalated.`,
  });

  return rows;
}

function outcomeLabel(type: OutcomeType): string {
  return type
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function stageLabel(stage: string): string {
  return stage.replace(/-/g, " ");
}
