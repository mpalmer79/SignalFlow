import {
  Banknote,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { ChipTone, KpiTone } from "@/lib/revenue/kpi-drilldown";

// Resolve the string icon keys carried by the drill-down data to Lucide glyphs.
// Keeping this on the client side means the server page never has to serialize
// component functions.
export const KPI_ICONS: Record<string, LucideIcon> = {
  Bell,
  BrainCircuit,
  Banknote,
  Workflow,
  TrendingDown,
  TrendingUp,
  Users,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ClipboardCheck,
};

export const FALLBACK_ICON: LucideIcon = Bell;

// Icon tile tint by KPI tone, matching the existing command center cards.
export function toneTile(tone: KpiTone): string {
  if (tone === "success") return "bg-success/15 text-success";
  if (tone === "warning") return "bg-warning/15 text-warning";
  return "bg-primary/15 text-primary";
}

export const CHIP_CLASSES: Record<ChipTone, string> = {
  neutral: "border-border bg-secondary text-secondary-foreground",
  info: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};
