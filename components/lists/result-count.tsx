import Link from "next/link";

// Compact summary of how many records are shown and a clear-filters action
// when any filter or search is active.
export function ResultCount({
  showing,
  total,
  label,
  pathname,
  hasFilters,
}: {
  showing: number;
  total: number;
  label: string;
  pathname: string;
  hasFilters: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <span aria-live="polite">
        Showing {showing} of {total} {label}
      </span>
      {hasFilters ? (
        <Link
          href={pathname}
          className="text-primary hover:underline"
          aria-label="Clear all filters"
        >
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}
