"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiDrilldown } from "@/lib/revenue/kpi-drilldown";
import { FALLBACK_ICON, KPI_ICONS, toneTile } from "./kpi-shared";
import { KpiDrilldownModal } from "./kpi-drilldown-modal";

type Variant = "hero" | "small" | "lifecycle";

const GRID_CLASS: Record<Variant, string> = {
  hero: "grid gap-3 sm:grid-cols-3",
  small: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
  lifecycle:
    "grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 xl:grid-cols-7",
};

// A grid of KPI cards that each open the shared drill-down dialog. The cards
// keep their existing visual treatment per section while reading as
// interactive: pointer cursor, hover border and lift, a focus ring, and a
// "View details" affordance.
export function KpiCardGrid({
  items,
  variant,
}: {
  items: KpiDrilldown[];
  variant: Variant;
}) {
  const [active, setActive] = useState<KpiDrilldown | null>(null);

  return (
    <>
      <div className={GRID_CLASS[variant]}>
        {items.map((item, index) => (
          <KpiCardButton
            key={item.id}
            item={item}
            variant={variant}
            index={index}
            total={items.length}
            onOpen={() => setActive(item)}
          />
        ))}
      </div>
      <KpiDrilldownModal kpi={active} onClose={() => setActive(null)} />
    </>
  );
}

const BUTTON_BASE =
  "group relative w-full cursor-pointer text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function ViewDetails({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium text-primary/80 transition-colors group-hover:text-primary",
        className,
      )}
    >
      <Maximize2 className="h-3 w-3" />
      View details
    </span>
  );
}

function KpiCardButton({
  item,
  variant,
  index,
  total,
  onOpen,
}: {
  item: KpiDrilldown;
  variant: Variant;
  index: number;
  total: number;
  onOpen: () => void;
}) {
  const Icon = KPI_ICONS[item.icon] ?? FALLBACK_ICON;
  const label = `View drill-down details for ${item.title}, ${item.value}`;

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={label}
        className={cn(
          BUTTON_BASE,
          "rounded-md border border-border bg-background p-3 hover:border-primary/40 hover:shadow-card-hover",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {item.title}
            </p>
            <p className="text-lg font-semibold tracking-tight">{item.value}</p>
            <p className="text-[11px] text-muted-foreground">{item.subtitle}</p>
          </div>
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              toneTile(item.tone),
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <ViewDetails className="mt-2" />
      </button>
    );
  }

  if (variant === "small") {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={label}
        className={cn(
          BUTTON_BASE,
          "rounded-lg border border-border bg-card p-4 shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {item.title}
            </p>
            <p className="text-xl font-semibold tracking-tight">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
          </div>
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              toneTile(item.tone),
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <ViewDetails className="mt-2.5" />
      </button>
    );
  }

  // lifecycle
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={label}
      className={cn(
        BUTTON_BASE,
        "h-full rounded-lg border border-border bg-card p-3 shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover sm:p-4",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            toneTile(item.tone),
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {index + 1} of {total}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
        {item.title}
      </p>
      <p className="text-xl font-semibold tracking-tight sm:text-2xl">
        {item.value}
      </p>
      <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
        {item.subtitle}
      </p>
      <ViewDetails className="mt-1.5 hidden sm:inline-flex" />
    </button>
  );
}
