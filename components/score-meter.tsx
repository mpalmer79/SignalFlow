import { cn } from "@/lib/utils";

interface ScoreMeterProps {
  label: string;
  score: number;
  tone?: "intent" | "opportunity" | "engagement";
}

const toneStyles = {
  intent: "bg-primary",
  opportunity: "bg-success",
  engagement: "bg-warning",
} as const;

export function ScoreMeter({ label, score, tone = "intent" }: ScoreMeterProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full", toneStyles[tone])}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
