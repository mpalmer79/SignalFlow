import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { SignalCard } from "@/components/signal-card";
import { SearchInput } from "@/components/lists/search-input";
import { FilterChipGroup } from "@/components/lists/filter-chip-group";
import { SortControl } from "@/components/lists/sort-control";
import { PaginationControl } from "@/components/lists/pagination-control";
import { ResultCount } from "@/components/lists/result-count";
import { EmptyListState } from "@/components/lists/empty-list-state";
import { listSignals } from "@/lib/services/signal-service";
import { guardPage } from "@/lib/auth/guard-page";
import {
  applySort,
  filterByFacet,
  filterBySearch,
  paginate,
  parsePositiveInt,
  readParam,
  type SortOption,
} from "@/lib/lists/list-helpers";
import type { Signal } from "@/lib/types/signal";

export const metadata: Metadata = { title: "Signals" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;
const PATHNAME = "/signals";

const SORT_OPTIONS: SortOption<Signal>[] = [
  {
    key: "recent",
    label: "Most recent",
    compare: (a, b) =>
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  },
  {
    key: "priority",
    label: "Priority",
    compare: (a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
      return order[a.priority] - order[b.priority];
    },
  },
];

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { context, denied } = await guardPage("VIEW_SIGNALS");
  if (denied) return denied;

  const signals = await listSignals(context);

  const query = readParam(searchParams.q);
  const type = readParam(searchParams.type) ?? "all";
  const priority = readParam(searchParams.priority) ?? "all";
  const vertical = readParam(searchParams.vertical) ?? "all";
  const sortKey = readParam(searchParams.sort) ?? "recent";
  const page = parsePositiveInt(searchParams.page, 1);

  const base = new URLSearchParams();
  if (query) base.set("q", query);
  if (type !== "all") base.set("type", type);
  if (priority !== "all") base.set("priority", priority);
  if (vertical !== "all") base.set("vertical", vertical);
  if (sortKey !== "recent") base.set("sort", sortKey);

  const filtered = applySort(
    filterByFacet(
      filterByFacet(
        filterByFacet(
          filterBySearch(signals, query, [
            (s) => s.label,
            (s) => s.customerName,
            (s) => s.detail,
          ]),
          type,
          (s) => s.type,
        ),
        priority,
        (s) => s.priority,
      ),
      vertical,
      (s) => s.vertical,
    ),
    sortKey,
    SORT_OPTIONS,
  );

  const pagination = paginate(filtered, { page, pageSize: PAGE_SIZE });
  const hasFilters =
    Boolean(query) ||
    type !== "all" ||
    priority !== "all" ||
    vertical !== "all";

  // Top of page counts by normalized type for fast scanning.
  const countByType = new Map<string, number>();
  for (const signal of signals) {
    countByType.set(signal.type, (countByType.get(signal.type) ?? 0) + 1);
  }

  return (
    <>
      <SectionHeading
        title="Customer signals"
        description="Inbound events that indicate revenue intent or risk. Each signal carries a recommended next action and a consent status."
      />

      <div className="flex flex-wrap gap-2">
        {Array.from(countByType.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([signalType, count]) => (
            <span
              key={signalType}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/30 px-3 py-1 text-xs text-muted-foreground"
            >
              {signalType.replace(/-/g, " ")}
              <span className="font-mono text-[10px] tabular-nums text-foreground">
                {count}
              </span>
            </span>
          ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SearchInput placeholder="Search signals" label="Search signals" />
        <SortControl
          current={sortKey}
          options={SORT_OPTIONS.map(({ key, label }) => ({ key, label }))}
          baseParams={base}
          pathname={PATHNAME}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FilterChipGroup
          paramName="type"
          current={type}
          baseParams={base}
          pathname={PATHNAME}
          label="Signal type"
          options={[
            { label: "All", value: "all" },
            { label: "New lead", value: "new-lead" },
            { label: "Missed call", value: "missed-call" },
            { label: "Service due", value: "service-due" },
            { label: "Recall", value: "recall-opportunity" },
            { label: "Estimate", value: "estimate-request" },
            { label: "Consultation", value: "consultation-request" },
            { label: "Appointment cancel", value: "appointment-cancellation" },
            { label: "Email", value: "email-engagement" },
          ]}
        />
        <FilterChipGroup
          paramName="priority"
          current={priority}
          baseParams={base}
          pathname={PATHNAME}
          label="Priority"
          options={[
            { label: "All", value: "all" },
            { label: "Critical", value: "critical" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ]}
        />
        <FilterChipGroup
          paramName="vertical"
          current={vertical}
          baseParams={base}
          pathname={PATHNAME}
          label="Vertical"
          options={[
            { label: "All", value: "all" },
            { label: "Automotive", value: "automotive" },
            { label: "Dental", value: "dental" },
            { label: "Home services", value: "home-services" },
            { label: "Legal intake", value: "legal-intake" },
            { label: "Insurance", value: "insurance" },
            { label: "Medical", value: "medical" },
          ]}
        />
      </div>

      <ResultCount
        showing={pagination.items.length}
        total={pagination.total}
        label="signals"
        pathname={PATHNAME}
        hasFilters={hasFilters}
      />

      {pagination.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pagination.items.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      ) : (
        <EmptyListState
          message={
            hasFilters
              ? "No signals match these filters."
              : "No signals found. Run the seed script to load demo data."
          }
          hasFilters={hasFilters}
          pathname={PATHNAME}
        />
      )}

      <PaginationControl
        page={pagination.page}
        totalPages={pagination.totalPages}
        hasPrevious={pagination.hasPrevious}
        hasNext={pagination.hasNext}
        baseParams={base}
        pathname={PATHNAME}
      />
    </>
  );
}
