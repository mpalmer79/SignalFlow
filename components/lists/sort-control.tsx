import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SortChoice {
  key: string;
  label: string;
}

// A small set of sort buttons rendered as links that update the URL. Active
// sort is highlighted and announced via aria-current.
export function SortControl({
  paramName = "sort",
  current,
  options,
  baseParams,
  pathname,
}: {
  paramName?: string;
  current: string;
  options: SortChoice[];
  baseParams: URLSearchParams;
  pathname: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Sort
      </span>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Sort">
        {options.map((option) => {
          const next = new URLSearchParams(baseParams);
          next.set(paramName, option.key);
          next.delete("page");
          const isActive = current === option.key;
          return (
            <Link
              key={option.key}
              href={`${pathname}?${next.toString()}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "inline-flex min-h-[32px] items-center rounded-md border px-2.5 py-1 text-xs",
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
