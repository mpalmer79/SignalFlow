import Link from "next/link";

// A consistent empty state for filtered lists. When filters are active it
// offers a clear-filters link; otherwise it surfaces the supplied next action.
export function EmptyListState({
  message,
  hasFilters,
  pathname,
  action,
}: {
  message: string;
  hasFilters: boolean;
  pathname: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      <p>{message}</p>
      <div className="mt-2 text-xs">
        {hasFilters ? (
          <Link href={pathname} className="text-primary hover:underline">
            Clear filters
          </Link>
        ) : action ? (
          <Link href={action.href} className="text-primary hover:underline">
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
