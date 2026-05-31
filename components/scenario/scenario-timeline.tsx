import {
  Banknote,
  Bell,
  BrainCircuit,
  CheckCircle2,
  GitBranch,
  Target,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ScenarioTimelineStep } from "@/lib/types/scenario";

const stageIcon: Record<ScenarioTimelineStep["stage"], LucideIcon> = {
  "signal-created": Bell,
  "signal-classified": BrainCircuit,
  "opportunity-created": Target,
  "workflow-generated": Workflow,
  "actions-executed": GitBranch,
  "outcome-generated": CheckCircle2,
  "revenue-attributed": Banknote,
};

export function ScenarioTimeline({
  steps,
}: {
  steps: ScenarioTimelineStep[];
}) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const Icon = stageIcon[step.stage];
        return (
          <li key={step.stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              {index < steps.length - 1 ? (
                <span className="mt-1 h-full w-px flex-1 bg-border" />
              ) : null}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
