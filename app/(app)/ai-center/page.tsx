import type { Metadata } from "next";
import { Sparkles, ShieldQuestion, CheckCircle2, Gauge } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { RecommendationCard } from "@/components/ai/recommendation-card";
import { SearchInput } from "@/components/lists/search-input";
import { FilterChipGroup } from "@/components/lists/filter-chip-group";
import { SortControl } from "@/components/lists/sort-control";
import { PaginationControl } from "@/components/lists/pagination-control";
import { ResultCount } from "@/components/lists/result-count";
import { EmptyListState } from "@/components/lists/empty-list-state";
import { getAICenter } from "@/lib/services/ai-service";
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
import type { AIRecommendationRecord } from "@/lib/types/ai-records";

export const metadata: Metadata = { title: "AI Center" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;
const PATHNAME = "/ai-center";

const SORT_OPTIONS: SortOption<AIRecommendationRecord>[] = [
  {
    key: "recent",
    label: "Most recent",
    compare: (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  },
  {
    key: "confidence-desc",
    label: "Highest confidence",
    compare: (a, b) => b.confidence - a.confidence,
  },
  {
    key: "confidence-asc",
    label: "Lowest confidence",
    compare: (a, b) => a.confidence - b.confidence,
  },
];

function confidenceBand(score: number): string {
  if (score >= 85) return "very-high";
  if (score >= 70) return "high";
  if (score >= 50) return "moderate";
  return "low";
}

export default async function AICenterPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { context, denied } = await guardPage("VIEW_AI_RECOMMENDATIONS");
  if (denied) return denied;

  const { recommendations, metrics } = await getAICenter(context);

  // Parse URL query.
  const query = readParam(searchParams.q);
  const status = readParam(searchParams.status) ?? "all";
  const vertical = readParam(searchParams.vertical) ?? "all";
  const type = readParam(searchParams.type) ?? "all";
  const band = readParam(searchParams.band) ?? "all";
  const sortKey = readParam(searchParams.sort) ?? "recent";
  const page = parsePositiveInt(searchParams.page, 1);

  const base = new URLSearchParams();
  if (query) base.set("q", query);
  if (status !== "all") base.set("status", status);
  if (vertical !== "all") base.set("vertical", vertical);
  if (type !== "all") base.set("type", type);
  if (band !== "all") base.set("band", band);
  if (sortKey !== "recent") base.set("sort", sortKey);

  // Apply filters.
  const filtered = applySort(
    filterByFacet(
      filterByFacet(
        filterByFacet(
          filterByFacet(
            filterBySearch(recommendations, query, [
              (r) => r.customerName,
              (r) => r.recommendationLabel,
            ]),
            status,
            (r) => r.reviewState,
          ),
          vertical,
          (r) => r.vertical,
        ),
        type,
        (r) => r.recommendationType,
      ),
      band,
      (r) => confidenceBand(r.confidence),
    ),
    sortKey,
    SORT_OPTIONS,
  );

  const pagination = paginate(filtered, { page, pageSize: PAGE_SIZE });
  const hasFilters =
    Boolean(query) ||
    status !== "all" ||
    vertical !== "all" ||
    type !== "all" ||
    band !== "all";

  // Build facet counts from the raw list so users see how many records each
  // value has, not just the filter labels.
  const countBy = <K extends string>(
    read: (r: AIRecommendationRecord) => K,
    value: K,
  ): number => recommendations.filter((r) => read(r) === value).length;

  return (
    <>
      <SectionHeading
        title="AI recommendation center"
        description="Every recommendation is generated deterministically, scored for confidence, fully explained, and governed by human review."
        actions={<Badge variant="warning">Deterministic, provider free</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Recommendations generated"
          value={String(metrics.total)}
          hint="Across all customers"
          icon={Sparkles}
        />
        <MetricCard
          label="Pending review"
          value={String(metrics.pendingReview)}
          hint="Awaiting a human decision"
          icon={ShieldQuestion}
          tone="warning"
        />
        <MetricCard
          label="Average confidence"
          value={String(metrics.averageConfidence)}
          hint="0 to 100"
          icon={Gauge}
        />
        <MetricCard
          label="Approved"
          value={String(metrics.approved)}
          hint={`${metrics.highRisk} high risk`}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SearchInput
            placeholder="Search by customer or recommendation"
            label="Search recommendations"
          />
          <SortControl
            current={sortKey}
            options={SORT_OPTIONS.map(({ key, label }) => ({ key, label }))}
            baseParams={base}
            pathname={PATHNAME}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FilterChipGroup
            paramName="status"
            current={status}
            baseParams={base}
            pathname={PATHNAME}
            label="Review state"
            options={[
              { label: "All", value: "all" },
              { label: "Pending", value: "pending-review", count: countBy((r) => r.reviewState, "pending-review") },
              { label: "Approved", value: "approved", count: countBy((r) => r.reviewState, "approved") },
              { label: "Rejected", value: "rejected", count: countBy((r) => r.reviewState, "rejected") },
              { label: "Escalated", value: "escalated", count: countBy((r) => r.reviewState, "escalated") },
            ]}
          />
          <FilterChipGroup
            paramName="band"
            current={band}
            baseParams={base}
            pathname={PATHNAME}
            label="Confidence band"
            options={[
              { label: "All", value: "all" },
              { label: "Very high", value: "very-high" },
              { label: "High", value: "high" },
              { label: "Moderate", value: "moderate" },
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
          <FilterChipGroup
            paramName="type"
            current={type}
            baseParams={base}
            pathname={PATHNAME}
            label="Recommendation type"
            options={[
              { label: "All", value: "all" },
              { label: "Immediate", value: "IMMEDIATE_HUMAN_FOLLOW_UP" },
              { label: "Appointment", value: "APPOINTMENT_OUTREACH" },
              { label: "Reactivation", value: "REACTIVATION_OUTREACH" },
              { label: "Nurture", value: "NURTURE_SEQUENCE" },
              { label: "Human review", value: "HUMAN_REVIEW" },
              { label: "Pause", value: "PAUSE_OUTREACH" },
            ]}
          />
        </div>

        <ResultCount
          showing={pagination.items.length}
          total={pagination.total}
          label="recommendations"
          pathname={PATHNAME}
          hasFilters={hasFilters}
        />

        {pagination.items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pagination.items.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                href={`/ai-center/${recommendation.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyListState
            message={
              hasFilters
                ? "No recommendations match these filters."
                : "No recommendations found. Run the seed script to generate demo data."
            }
            hasFilters={hasFilters}
            pathname={PATHNAME}
            action={{ href: "/scenarios/automotive-high-intent", label: "Run the 60-second demo" }}
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
      </div>
    </>
  );
}
