import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  ComplianceSensitivity,
  PackPhaseStatus,
  VerticalPack,
} from "@/lib/types/vertical-pack";

const sensitivityStyles: Record<
  ComplianceSensitivity,
  { label: string; variant: "muted" | "warning" | "danger" }
> = {
  standard: { label: "Standard sensitivity", variant: "muted" },
  elevated: { label: "Elevated sensitivity", variant: "warning" },
  high: { label: "High sensitivity", variant: "danger" },
};

const phaseStyles: Record<
  PackPhaseStatus,
  { label: string; variant: "primary" | "success" | "muted" | "default" }
> = {
  "mvp-focus": { label: "MVP focus", variant: "success" },
  "in-design": { label: "In design", variant: "primary" },
  planned: { label: "Planned", variant: "default" },
  research: { label: "Research", variant: "muted" },
};

export function VerticalPackCard({ pack }: { pack: VerticalPack }) {
  const sensitivity = sensitivityStyles[pack.complianceSensitivity];
  const phase = phaseStyles[pack.phaseStatus];

  return (
    <Card className={pack.phaseStatus === "mvp-focus" ? "border-primary/40" : ""}>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{pack.name}</p>
            <p className="text-xs text-muted-foreground">{pack.summary}</p>
          </div>
          <Badge variant={phase.variant}>{phase.label}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Key signals
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-foreground">
              {pack.keySignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Key actions
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-foreground">
              {pack.keyActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <Badge variant={sensitivity.variant}>{sensitivity.label}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
