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
import { WorkflowOutcomeBadge } from "@/components/workflow/workflow-outcome-badge";
import { AttributionList } from "@/components/revenue/attribution-list";
import { MissedOpportunityList } from "@/components/revenue/missed-opportunity-list";
import { getCustomerProfile } from "@/lib/services/customer-service";

export const metadata: Metadata = { title: "Customer" };
export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await getCustomerProfile(params.id);

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline entries={timeline} />
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
