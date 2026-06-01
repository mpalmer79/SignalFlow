import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { CustomerCard } from "@/components/customer-card";
import { SearchInput } from "@/components/lists/search-input";
import { FilterChipGroup } from "@/components/lists/filter-chip-group";
import { SortControl } from "@/components/lists/sort-control";
import { PaginationControl } from "@/components/lists/pagination-control";
import { ResultCount } from "@/components/lists/result-count";
import { EmptyListState } from "@/components/lists/empty-list-state";
import { listCustomers } from "@/lib/services/customer-service";
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
import type { Customer } from "@/lib/types/customer";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const PATHNAME = "/customers";

function consentSummary(customer: Customer): string {
  if (customer.optedOut) return "opted-out";
  const states = customer.channels.map((channel) => channel.consent);
  if (states.every((state) => state === "granted")) return "granted";
  if (states.some((state) => state === "denied" || state === "revoked")) {
    return "blocked";
  }
  return "review";
}

const SORT_OPTIONS: SortOption<Customer>[] = [
  {
    key: "name",
    label: "Name",
    compare: (a, b) => a.name.localeCompare(b.name),
  },
  {
    key: "recent-activity",
    label: "Recent activity",
    compare: (a, b) =>
      new Date(b.lastActionAt).getTime() - new Date(a.lastActionAt).getTime(),
  },
];

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { context, denied } = await guardPage("VIEW_CUSTOMERS");
  if (denied) return denied;

  const customers = await listCustomers(context);

  const query = readParam(searchParams.q);
  const vertical = readParam(searchParams.vertical) ?? "all";
  const consent = readParam(searchParams.consent) ?? "all";
  const sortKey = readParam(searchParams.sort) ?? "name";
  const page = parsePositiveInt(searchParams.page, 1);

  const base = new URLSearchParams();
  if (query) base.set("q", query);
  if (vertical !== "all") base.set("vertical", vertical);
  if (consent !== "all") base.set("consent", consent);
  if (sortKey !== "name") base.set("sort", sortKey);

  const filtered = applySort(
    filterByFacet(
      filterByFacet(
        filterBySearch(customers, query, [(c) => c.name]),
        vertical,
        (c) => c.vertical,
      ),
      consent,
      (c) => consentSummary(c),
    ),
    sortKey,
    SORT_OPTIONS,
  );

  const pagination = paginate(filtered, { page, pageSize: PAGE_SIZE });
  const hasFilters =
    Boolean(query) || vertical !== "all" || consent !== "all";

  return (
    <>
      <SectionHeading
        title="Customer intelligence"
        description="A unified record for each customer, including channels, consent, recent signals, active opportunity, and risk flags."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SearchInput placeholder="Search customers by name" label="Search customers" />
        <SortControl
          current={sortKey}
          options={SORT_OPTIONS.map(({ key, label }) => ({ key, label }))}
          baseParams={base}
          pathname={PATHNAME}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
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
        <FilterChipGroup
          paramName="consent"
          current={consent}
          baseParams={base}
          pathname={PATHNAME}
          label="Consent state"
          options={[
            { label: "All", value: "all" },
            { label: "Granted", value: "granted" },
            { label: "Needs review", value: "review" },
            { label: "Blocked", value: "blocked" },
            { label: "Opted out", value: "opted-out" },
          ]}
        />
      </div>

      <ResultCount
        showing={pagination.items.length}
        total={pagination.total}
        label="customers"
        pathname={PATHNAME}
        hasFilters={hasFilters}
      />

      {pagination.items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pagination.items.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="group rounded-lg transition-colors hover:ring-2 hover:ring-primary/30"
              aria-label={`View profile for ${customer.name}`}
            >
              <CustomerCard customer={customer} />
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                View profile
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyListState
          message={
            hasFilters
              ? "No customers match these filters."
              : "No customers found. Run the seed script to load demo data."
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
