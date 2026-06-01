"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildDemoSummary,
  DEMO_REJECTED_OVERRIDES,
  DEMO_STAGES,
  type DemoChip,
  type DemoDecision,
  type DemoStage,
} from "@/lib/demo/sixty-second-demo";

const TICK_MS = 100;
const REVIEW_INDEX = DEMO_STAGES.findIndex((stage) => stage.id === "review");
const WORKFLOW_INDEX = DEMO_STAGES.findIndex((stage) => stage.id === "workflow");
const LAST_INDEX = DEMO_STAGES.length - 1;

// Merge the rejected path overrides onto a base stage so the alternate story
// stays data driven.
function resolveStage(stage: DemoStage, decision: DemoDecision | null): DemoStage {
  if (decision !== "rejected") return stage;
  const override = DEMO_REJECTED_OVERRIDES[stage.id];
  return override ? { ...stage, ...override } : stage;
}

export function SixtySecondDemoPlayer() {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [decision, setDecision] = useState<DemoDecision | null>(null);

  const baseStage = DEMO_STAGES[stageIndex];
  const stage = useMemo(
    () => resolveStage(baseStage, decision),
    [baseStage, decision],
  );

  const awaitingDecision = stage.interactive && decision === null;
  const isTerminal = stage.terminal;
  const autoAdvancing =
    isPlaying && !awaitingDecision && !isTerminal && stage.autoAdvanceMs > 0;

  // Tick the elapsed time while a stage is auto advancing.
  useEffect(() => {
    if (!autoAdvancing) return;
    const id = setInterval(() => {
      setElapsedMs((prev) => prev + TICK_MS);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [autoAdvancing, stageIndex]);

  // Advance to the next stage once the current stage has run its full time.
  useEffect(() => {
    if (!autoAdvancing) return;
    if (elapsedMs >= stage.autoAdvanceMs) {
      setStageIndex((index) => Math.min(index + 1, LAST_INDEX));
      setElapsedMs(0);
    }
  }, [autoAdvancing, elapsedMs, stage.autoAdvanceMs]);

  const goToStage = useCallback((index: number) => {
    setStageIndex(Math.max(0, Math.min(index, LAST_INDEX)));
    setElapsedMs(0);
  }, []);

  const handleRestart = useCallback(() => {
    setStageIndex(0);
    setElapsedMs(0);
    setDecision(null);
    setIsPlaying(true);
  }, []);

  const handleDecision = useCallback((next: DemoDecision) => {
    setDecision(next);
    setStageIndex(WORKFLOW_INDEX);
    setElapsedMs(0);
    setIsPlaying(true);
  }, []);

  const handlePrevious = useCallback(() => {
    goToStage(stageIndex - 1);
  }, [goToStage, stageIndex]);

  const handleNext = useCallback(() => {
    goToStage(stageIndex + 1);
  }, [goToStage, stageIndex]);

  const stageFraction =
    stage.autoAdvanceMs > 0
      ? Math.min(elapsedMs / stage.autoAdvanceMs, 1)
      : isTerminal || stageIndex > REVIEW_INDEX
        ? 1
        : 0;

  return (
    <div className="space-y-5">
      <ProgressRail
        activeIndex={stageIndex}
        fraction={stageFraction}
        onSelect={goToStage}
      />

      <Card>
        <CardContent className="space-y-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{stage.kicker}</Badge>
              <span className="text-sm font-semibold">{stage.label}</span>
              {decision ? (
                <Badge variant={decision === "approved" ? "success" : "warning"}>
                  {decision === "approved" ? "Approved path" : "Rejected path"}
                </Badge>
              ) : null}
            </div>
            <span
              className="text-[11px] uppercase tracking-wide text-muted-foreground"
              aria-live="polite"
            >
              {awaitingDecision
                ? "Waiting for your decision"
                : isTerminal
                  ? "Demo complete"
                  : isPlaying
                    ? "Playing"
                    : "Paused"}
            </span>
          </div>

          {isTerminal ? (
            <SummaryScreen
              decision={decision ?? "approved"}
              onRestart={handleRestart}
            />
          ) : (
            <StageBody stage={stage} />
          )}

          {awaitingDecision ? (
            <ReviewActions onDecision={handleDecision} />
          ) : null}
        </CardContent>
      </Card>

      <Controls
        isPlaying={isPlaying}
        isTerminal={isTerminal}
        awaitingDecision={awaitingDecision}
        canGoPrevious={stageIndex > 0}
        canGoNext={stageIndex < LAST_INDEX}
        onTogglePlay={() => setIsPlaying((value) => !value)}
        onRestart={handleRestart}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <p className="text-center text-[11px] text-muted-foreground">
        Deterministic demo. No live SMS, email, or voice. No external model
        calls. No real customer data.
      </p>
    </div>
  );
}

function ProgressRail({
  activeIndex,
  fraction,
  onSelect,
}: {
  activeIndex: number;
  fraction: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Demo stages">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {DEMO_STAGES.map((stage, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;
          const fillWidth = isComplete
            ? "100%"
            : isActive
              ? `${Math.round(fraction * 100)}%`
              : "0%";
          return (
            <li key={stage.id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Stage ${index + 1}: ${stage.label}`}
                className={cn(
                  "group w-full rounded-md border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-secondary/30 hover:border-primary/30",
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
                      isComplete
                        ? "bg-success/20 text-success"
                        : isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isComplete ? <Check className="h-2.5 w-2.5" /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      "truncate text-[11px] font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-100 ease-linear"
                    style={{ width: fillWidth }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StageBody({ stage }: { stage: DemoStage }) {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {stage.headline}
        </h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              What is happening
            </p>
            <p className="text-sm text-muted-foreground">{stage.whatHappening}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Why it matters
            </p>
            <p className="text-sm text-muted-foreground">{stage.whyItMatters}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-2">
        {stage.evidence.length > 0 ? (
          <ChipPanel
            title="Evidence"
            icon={<Sparkles className="h-3.5 w-3.5 text-primary" />}
            chips={stage.evidence}
          />
        ) : null}
        {stage.governance.length > 0 ? (
          <ChipPanel
            title="Governance"
            icon={<ShieldCheck className="h-3.5 w-3.5 text-success" />}
            chips={stage.governance}
            tone="success"
          />
        ) : null}
      </div>
    </div>
  );
}

function ChipPanel({
  title,
  icon,
  chips,
  tone = "primary",
}: {
  title: string;
  icon: React.ReactNode;
  chips: DemoChip[];
  tone?: "primary" | "success";
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <li
            key={chip.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs",
              tone === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-border bg-card text-foreground",
            )}
          >
            <span className="font-medium">{chip.label}</span>
            {chip.value ? (
              <span className="text-muted-foreground">{chip.value}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewActions({
  onDecision,
}: {
  onDecision: (decision: DemoDecision) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium">
        Approve the recommendation to continue, or reject to see the safe
        alternate path.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onDecision("approved")}
          className={cn(buttonVariants({ size: "sm" }))}
          aria-label="Approve the recommendation"
        >
          <Check className="h-4 w-4" />
          Approve
        </button>
        <button
          type="button"
          onClick={() => onDecision("rejected")}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          aria-label="Reject the recommendation"
        >
          <X className="h-4 w-4" />
          Reject
        </button>
      </div>
    </div>
  );
}

function SummaryScreen({
  decision,
  onRestart,
}: {
  decision: DemoDecision;
  onRestart: () => void;
}) {
  const summary = buildDemoSummary(decision);
  const metrics = [
    { label: "Influenced revenue", value: summary.influencedRevenue },
    { label: "Reviewed actions", value: summary.reviewedActions },
    { label: "High intent customers", value: summary.highIntentCustomers },
    { label: "Audit trail", value: summary.auditStatus },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            decision === "approved"
              ? "bg-success/15 text-success"
              : "bg-warning/15 text-warning",
          )}
        >
          <BadgeCheck className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {summary.outcomeLabel}
          </h2>
          <p className="text-sm text-muted-foreground">{summary.outcomeDetail}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border bg-secondary/30 p-4"
          >
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-1 text-lg font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          onClick={onRestart}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          <RotateCcw className="h-4 w-4" />
          Replay demo
        </button>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Open dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Controls({
  isPlaying,
  isTerminal,
  awaitingDecision,
  canGoPrevious,
  canGoNext,
  onTogglePlay,
  onRestart,
  onPrevious,
  onNext,
}: {
  isPlaying: boolean;
  isTerminal: boolean;
  awaitingDecision: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        aria-label="Previous stage"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <button
        type="button"
        onClick={onTogglePlay}
        disabled={isTerminal || awaitingDecision}
        className={cn(buttonVariants({ size: "sm" }))}
        aria-label={isPlaying ? "Pause the demo" : "Resume the demo"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {isPlaying ? "Pause" : "Resume"}
      </button>
      <button
        type="button"
        onClick={onRestart}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        aria-label="Restart the demo"
      >
        <RotateCcw className="h-4 w-4" />
        Restart
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        aria-label="Next stage"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
