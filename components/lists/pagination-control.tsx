import Link from "next/link";
import { cn } from "@/lib/utils";

// Previous and Next pagination links plus a page indicator. Stays server
// rendered. Buttons render as disabled spans when navigation would go out of
// range, so the same component reads cleanly with keyboard navigation.
export function PaginationControl({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  baseParams,
  pathname,
}: {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  baseParams: URLSearchParams;
  pathname: string;
}) {
  if (totalPages <= 1) return null;
  const previousParams = new URLSearchParams(baseParams);
  previousParams.set("page", String(Math.max(1, page - 1)));
  const nextParams = new URLSearchParams(baseParams);
  nextParams.set("page", String(Math.min(totalPages, page + 1)));

  const buttonClass =
    "inline-flex min-h-[36px] items-center rounded-md border border-border px-3 py-1.5 text-xs";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 pt-2"
    >
      {hasPrevious ? (
        <Link
          href={`${pathname}?${previousParams.toString()}`}
          className={cn(buttonClass, "hover:bg-accent")}
          aria-label="Previous page"
        >
          Previous
        </Link>
      ) : (
        <span
          className={cn(buttonClass, "opacity-50")}
          aria-disabled="true"
        >
          Previous
        </span>
      )}
      <span className="text-xs text-muted-foreground" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      {hasNext ? (
        <Link
          href={`${pathname}?${nextParams.toString()}`}
          className={cn(buttonClass, "hover:bg-accent")}
          aria-label="Next page"
        >
          Next
        </Link>
      ) : (
        <span
          className={cn(buttonClass, "opacity-50")}
          aria-disabled="true"
        >
          Next
        </span>
      )}
    </nav>
  );
}
