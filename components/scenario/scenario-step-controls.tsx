import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, FastForward } from "lucide-react";
import { SCENARIO_STEP_KEYS, type ScenarioStepKey } from "@/lib/scenarios/scenario-steps";
import { cn } from "@/lib/utils";

// Server component step controls. They are simple links that change the step
// query parameter, so they need no client state and have no hydration cost. The
// progress indicator is announced to assistive tech.
export function ScenarioStepControls({
  current,
  scenarioId,
}: {
  current: ScenarioStepKey;
  scenarioId: string;
}) {
  const index = SCENARIO_STEP_KEYS.indexOf(current);
  const total = SCENARIO_STEP_KEYS.length;
  const prev = index > 0 ? SCENARIO_STEP_KEYS[index - 1] : null;
  const next = index < total - 1 ? SCENARIO_STEP_KEYS[index + 1] : null;
  const base = `/scenarios/${scenarioId}`;
  const stepHref = (key: ScenarioStepKey) => `${base}?step=${key}`;

  const buttonBase =
    "inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm";

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Guided demo controls"
      >
        {prev ? (
          <Link
            href={stepHref(prev)}
            className={cn(buttonBase, "hover:bg-accent")}
            aria-label="Previous step"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        ) : (
          <span className={cn(buttonBase, "opacity-50")} aria-disabled="true">
            <ArrowLeft className="h-4 w-4" />
            Back
          </span>
        )}
        {next ? (
          <Link
            href={stepHref(next)}
            className={cn(
              buttonBase,
              "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
            )}
            aria-label="Next step"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className={cn(buttonBase, "opacity-50")} aria-disabled="true">
            Next
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
        <Link
          href={base}
          className={cn(buttonBase, "hover:bg-accent")}
          aria-label="Restart guided demo"
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </Link>
        <Link
          href={stepHref("revenue")}
          className={cn(buttonBase, "hover:bg-accent")}
          aria-label="Skip to revenue result"
        >
          <FastForward className="h-4 w-4" />
          Skip to revenue
        </Link>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span>
            Step {index + 1} of {total}
          </span>
          <span className="font-mono">{Math.round(((index + 1) / total) * 100)}%</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Guided demo progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1" aria-hidden="true">
          {SCENARIO_STEP_KEYS.map((key, stepIndex) => (
            <Link
              key={key}
              href={stepHref(key)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
                stepIndex === index
                  ? "bg-primary/15 text-primary"
                  : stepIndex < index
                    ? "bg-secondary/40 text-muted-foreground"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {key.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
