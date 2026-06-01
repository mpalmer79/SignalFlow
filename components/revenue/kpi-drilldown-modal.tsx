"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { KpiChip, KpiDrilldown } from "@/lib/revenue/kpi-drilldown";
import { CHIP_CLASSES, FALLBACK_ICON, KPI_ICONS, toneTile } from "./kpi-shared";

function Chip({ chip }: { chip: KpiChip }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        CHIP_CLASSES[chip.tone],
      )}
    >
      {chip.label}
    </span>
  );
}

// One shared, accessible drill-down dialog reused by every KPI card. Closes on
// the top-right X, the bottom Close button, Escape, or a click on the backdrop.
// Focus is moved into the dialog on open, trapped while open, and restored to
// the trigger on close. Body scroll is locked with scrollbar compensation so
// opening the dialog does not shift the page.
export function KpiDrilldownModal({
  kpi,
  onClose,
}: {
  kpi: KpiDrilldown | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!kpi) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      restoreFocusRef.current?.focus?.();
    };
  }, [kpi, onClose]);

  if (!kpi) return null;
  if (typeof document === "undefined") return null;

  const Icon = KPI_ICONS[kpi.icon] ?? FALLBACK_ICON;
  const titleId = "kpi-drilldown-title";
  const descId = "kpi-drilldown-desc";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                toneTile(kpi.tone),
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {kpi.period}
              </p>
              <h2 id={titleId} className="truncate text-lg font-semibold">
                {kpi.title}
              </h2>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {kpi.value}
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <p id={descId} className="text-sm text-muted-foreground">
            {kpi.description}
          </p>

          {kpi.chips && kpi.chips.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {kpi.chips.map((chip) => (
                <Chip key={chip.label} chip={chip} />
              ))}
            </div>
          ) : null}

          <div className="mt-4 rounded-lg border border-border">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {kpi.columns[0]}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {kpi.columns[1]}
              </span>
            </div>
            <ul>
              {kpi.rows.map((row) => (
                <li
                  key={row.label}
                  className="flex items-start justify-between gap-3 border-b border-border px-3 py-2.5 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.label}</p>
                    {row.meta ? (
                      <p className="text-xs text-muted-foreground">{row.meta}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {row.chip ? <Chip chip={row.chip} /> : null}
                    <span className="text-sm font-semibold tabular-nums">
                      {row.value}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{kpi.demoNote}</p>
        </div>

        <div className="flex items-center justify-end border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
