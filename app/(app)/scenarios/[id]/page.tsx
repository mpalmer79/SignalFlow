import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScenarioTimeline } from "@/components/scenario/scenario-timeline";
import { WorkflowPlanView } from "@/components/workflow/workflow-plan-view";
import { IntelligenceProfile } from "@/components/intelligence/intelligence-profile";
import { OutcomeEvents } from "@/components/revenue/outcome-events";
import { getScenarioResult, getScenarios } from "@/lib/services/scenario-service";
import { attributionStyles, severityStyles } from "@/lib/config/outcome-status";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Scenario" };

export function generateStaticParams() {
  return getScenarios().map((scenario) => ({ id: scenario.id }));
}

export default function ScenarioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = getScenarioResult(params.id);

  if (!result) {
    notFound();
  }

  const { definition, profile, workflow, assessment } = result;
  const attribution = assessment.attribution;
  const missed = assessment.missedOpportunity;

  // Map the scenario outcome events into the persisted record shape the shared
  // component expects.
  const outcomeRecords = assessment.outcomeEvents.map((event, index) => ({
    id: `${definition.id}-outcome-${index}`,
    customerId: result.customer.id,
    customerName: result.customer.name,
    opportunityId: result.opportunity.id,
    workflowRunId: null,
    outcomeType: event.outcomeType,
    reason: event.reason,
    confidence: event.confidence,
    occurredAt: result.customer.lastActionAt,
  }));

  return (
    <>
      <Link
        href="/scenarios"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to scenarios
      </Link>

      <SectionHeading
        title={definition.title}
        description={definition.summary}
        actions={
          <Badge variant="muted" className="capitalize">
            {definition.vertical.replace("-", " ")}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Scenario story</CardTitle>
          </CardHeader>
          <CardContent>
            <ScenarioTimeline steps={result.timeline} />
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <IntelligenceProfile profile={profile} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Workflow simulation</h2>
        <WorkflowPlanView plan={workflow} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Outcome events</CardTitle>
          </CardHeader>
          <CardContent>
            <OutcomeEvents events={outcomeRecords} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attribution ? (
              <div className="rounded-md border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant={attributionStyles[attribution.attributionType].variant}>
                    {attributionStyles[attribution.attributionType].label}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {formatCurrency(attribution.attributedAmount)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {attribution.reason}
                </p>
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No revenue attributed for this scenario.
              </p>
            )}

            {missed ? (
              <div className="rounded-md border border-border bg-secondary/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Missed opportunity</span>
                  <Badge variant={severityStyles[missed.severity].variant}>
                    {severityStyles[missed.severity].label}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {missed.reason} Estimated {formatCurrency(missed.estimatedValue)}.
                </p>
                <p className="mt-1 text-xs text-foreground">
                  Recovery: {missed.recommendedRecoveryAction}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
