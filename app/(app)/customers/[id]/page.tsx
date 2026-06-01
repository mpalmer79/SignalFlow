import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { CustomerCard } from "@/components/customer-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { Timeline } from "@/components/timeline";
import { ScoreMeter } from "@/components/score-meter";
import {
  IntentBadge,
  PriorityBadge,
} from "@/components/intelligence/score-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkflowOutcomeBadge } from "@/components/workflow/workflow-outcome-badge";
import { AttributionList } from "@/components/revenue/attribution-list";
import { MissedOpportunityList } from "@/components/revenue/missed-opportunity-list";
import { FilterChipGroup } from "@/components/lists/filter-chip-group";
import {
  getCustomerProfile,
  type TimelineKind,
} from "@/lib/services/customer-service";
import { guardPage } from "@/lib/auth/guard-page";
import { readParam } from "@/lib/lists/list-helpers";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Customer" };
export const dynamic = "force-dynamic";

// Map a UI timeline group to the set of TimelineKind values it contains. The
// raw kinds are kept on entries so the existing icon and label mapping in the
// Timeline component keeps working.
const TIMELINE_GROUPS: Record<string, TimelineKind[]> = {
  all: [
    "signal",
    "communication",
    "audit",
    "opportunity",
    "detected-opportunity",
    "recommendation",
    "risk",
    "workflow",
    "outcome",
    "attribution",
    "missed-opportunity",
  ],
  business: ["signal", "opportunity", "detected-opportunity", "communication"],
  audit: ["audit"],
  ai: ["recommendation", "risk"],
  workflow: ["workflow"],
  revenue: ["outcome", "attribution", "missed-opportunity"],
};

function consentSummaryLabel(channels: { consent: string }[]): {
  label: string;
  variant: "success" | "warning" | "danger" | "muted";
} {
  if (channels.length === 0) return { label: "No channels", variant: "muted" };
  const states = channels.map((channel) => channel.consent);
  if (states.every((state) => state === "granted"))
    return { label: "Consent granted", variant: "success" };
  if (states.some((state) => state === "denied" || state === "revoked"))
    return { label: "Consent blocked", variant: "danger" };
  return { label: "Needs review", variant: "warning" };
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const { context, denied } = await guardPage("VIEW_CUSTOMERS");
  if (denied) return denied;

  const profile = await getCustomerProfile(context, params.id);

  if (!profile) {
    notFound();
  }

  const {
    customer,
    opportunities,
    timeline,
    intelligence,
    workflowRuns,
    attributions,
    missed,
  } = profile;

  const tab = readParam(searchParams?.tab) ?? "all";
  const visibleKinds = new Set(TIMELINE_GROUPS[tab] ?? TIMELINE_GROUPS.all);
  const visibleTimeline = timeline.filter((entry) =>
    visibleKinds.has(entry.kind),
  );

  const consent = consentSummaryLabel(customer.channels);
  const totalAttributed = attributions
    .filter((attribution) => attribution.attributionType !== "MISSED")
    .reduce((sum, attribution) => sum + attribution.attributedAmount, 0);
  const totalMissed = missed.reduce(
    (sum, item) => sum + item.estimatedValue,
    0,
  );

  const baseHref = `/customers/${customer.id}`;
  const baseParams = new URLSearchParams();

  return (
    <>
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to customers
      </Link>

      <SectionHeading
        title={customer.name}
        description="Customer intelligence record with a unified activity timeline served from the database."
      />

      {/* Persistent summary header. On large screens it sticks to the top of the
          main scroll area so the score and consent context stays visible while
          the reviewer scrolls the timeline. */}
      <Card className="lg:sticky lg:top-2 lg:z-10">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Vertical
            </p>
            <p className="text-sm font-semibold capitalize">
              {customer.vertical.replace("-", " ")}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Scores
            </p>
            <p className="text-sm font-semibold">
              Intent {intelligence.intentScore} ; Opp {intelligence.opportunityScore} ; Eng {intelligence.engagementScore}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Consent
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={consent.variant}>{consent.label}</Badge>
              {customer.optedOut ? (
                <Badge variant="danger">Opted out</Badge>
              ) : null}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Revenue impact
            </p>
            <p className="text-sm font-semibold">
              {formatCurrency(totalAttributed)} attributed
              {totalMissed > 0 ? `, ${formatCurrency(totalMissed)} at risk` : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                Activity timeline
                <span className="text-[11px] font-normal text-muted-foreground">
                  {visibleTimeline.length} of {timeline.length} events
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FilterChipGroup
                paramName="tab"
                current={tab}
                baseParams={baseParams}
                pathname={baseHref}
                label="Filter events"
                options={[
                  { label: "All", value: "all" },
                  { label: "Business", value: "business" },
                  { label: "Audit", value: "audit" },
                  { label: "AI and review", value: "ai" },
                  { label: "Workflow", value: "workflow" },
                  { label: "Revenue", value: "revenue" },
                ]}
              />
              {visibleTimeline.length > 0 ? (
                <Timeline entries={visibleTimeline} />
              ) : (
                <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No events in this category.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <CustomerCard customer={customer} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                Intelligence
                <Link
                  href={`/intelligence/${customer.id}`}
                  className="inline-flex items-center gap-1 text-xs font-normal text-primary hover:underline"
                >
                  Full profile
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScoreMeter
                label="Intent"
                score={intelligence.intentScore}
                tone="intent"
              />
              <ScoreMeter
                label="Opportunity"
                score={intelligence.opportunityScore}
                tone="opportunity"
              />
              <ScoreMeter
                label="Engagement"
                score={intelligence.engagementScore}
                tone="engagement"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <PriorityBadge priority={intelligence.priority} />
                <IntentBadge intent={intelligence.intentLevel} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow runs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {workflowRuns.length > 0 ? (
                workflowRuns.map((run) => (
                  <Link
                    key={run.id}
                    href={`/orchestrator/${run.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{run.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.actionsExecuted} executed, {run.actionsBlocked} blocked
                      </p>
                    </div>
                    <WorkflowOutcomeBadge outcome={run.outcome} />
                  </Link>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No workflow runs for this customer.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                Revenue impact
                <Link
                  href={`/revenue-engine/${customer.id}`}
                  className="inline-flex items-center gap-1 text-xs font-normal text-primary hover:underline"
                >
                  Full story
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Attribution
                </p>
                <AttributionList attributions={attributions} />
              </div>
              {missed.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Missed opportunity
                  </p>
                  <MissedOpportunityList missed={missed} />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Opportunities</h2>
            {opportunities.length > 0 ? (
              opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No opportunities for this customer.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
