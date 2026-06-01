import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FilterChip {
  label: string;
  value: string;
  count?: number;
}

// A row of facet chips. Each chip is a link that updates a single query
// parameter, preserving the rest. The active chip is highlighted and announced
// to assistive tech via aria-current.
export function FilterChipGroup({
  paramName,
  current,
  options,
  baseParams,
  pathname,
  label,
}: {
  paramName: string;
  current: string;
  options: FilterChip[];
  baseParams: URLSearchParams;
  pathname: string;
  label: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((option) => {
          const next = new URLSearchParams(baseParams);
          if (option.value === "all") {
            next.delete(paramName);
          } else {
            next.set(paramName, option.value);
          }
          next.delete("page");
          const isActive = current === option.value;
          return (
            <Link
              key={option.value}
              href={`${pathname}?${next.toString()}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "inline-flex min-h-[32px] items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {option.label}
              {typeof option.count === "number" ? (
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {option.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
