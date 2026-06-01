import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScenarioTimeline } from "@/components/scenario/scenario-timeline";
import { WorkflowPlanView } from "@/components/workflow/workflow-plan-view";
import { IntelligenceProfile } from "@/components/intelligence/intelligence-profile";
import { OutcomeEvents } from "@/components/revenue/outcome-events";
import { ScenarioStepControls } from "@/components/scenario/scenario-step-controls";
import { getScenarioResult } from "@/lib/services/scenario-service";
import {
  buildScenarioSteps,
  resolveStepKey,
  SCENARIO_STEP_KEYS,
} from "@/lib/scenarios/scenario-steps";
import { attributionStyles, severityStyles } from "@/lib/config/outcome-status";
import { guardPage } from "@/lib/auth/guard-page";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Scenario" };
export const dynamic = "force-dynamic";

const OPT_OUT_SCENARIO_ID = "automotive-opt-out";

export default async function ScenarioDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { step?: string };
}) {
  const { denied } = await guardPage("VIEW_SCENARIOS");
  if (denied) return denied;

  const result = getScenarioResult(params.id);
  if (!result) {
    notFound();
  }

  const { definition, profile, workflow, assessment } = result;
  const attribution = assessment.attribution;
  const missed = assessment.missedOpportunity;

  const steps = buildScenarioSteps(result);
  const stepKey = resolveStepKey(searchParams?.step);
  const stepIndex = SCENARIO_STEP_KEYS.indexOf(stepKey);
  const visible = steps.slice(0, stepIndex + 1);
  const isFinal = stepKey === "revenue";

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

  const showIntelligence = stepIndex >= 1;
  const showWorkflow = stepIndex >= 4;
  const showOutcome = stepIndex >= 5;
  const showRevenue = stepIndex >= 6;
  const isOptOutScenario = definition.id === OPT_OUT_SCENARIO_ID;

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
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Full scenario walkthrough</Badge>
            <Badge variant="muted" className="capitalize">
              {definition.vertical.replace("-", " ")}
            </Badge>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <ScenarioStepControls current={stepKey} scenarioId={definition.id} />
          <ol className="space-y-2">
            {visible.map((step) => (
              <li
                key={step.key}
                className={
                  step.key === stepKey
                    ? "rounded-md border border-primary/30 bg-primary/5 p-3"
                    : "rounded-md border border-border bg-secondary/30 p-3"
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Step {step.index + 1}: {step.label}
                  </p>
                  {step.key === stepKey ? (
                    <Badge variant="primary">Now</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm font-semibold">{step.headline}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </li>
            ))}
          </ol>
          {!isFinal ? (
            <p className="text-[11px] text-muted-foreground">
              Tap Next to advance the story. Tap Skip to revenue to jump to the
              final attribution.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {!isOptOutScenario ? (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">
                  Want to see the compliance stop story?
                </p>
                <p className="text-xs text-warning/90">
                  The opt-out scenario shows how the policy layer blocks
                  outreach and records a missed revenue estimate instead.
                </p>
              </div>
            </div>
            <Link
              href={`/scenarios/${OPT_OUT_SCENARIO_ID}`}
              className="inline-flex min-h-[40px] items-center gap-1 self-start rounded-md border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning/15 sm:self-auto"
            >
              Open compliance stop scenario
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      ) : null}

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
          {showIntelligence ? (
            <IntelligenceProfile profile={profile} />
          ) : (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                Advance the demo to reveal the intelligence profile, the
                recommendation, the workflow, and the revenue result.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showWorkflow ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold">Workflow simulation</h2>
          <WorkflowPlanView plan={workflow} />
        </div>
      ) : null}

      {showOutcome ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Outcome events</CardTitle>
            </CardHeader>
            <CardContent>
              <OutcomeEvents events={outcomeRecords} />
            </CardContent>
          </Card>

          {showRevenue ? (
            <Card>
              <CardHeader>
                <CardTitle>Revenue result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {attribution ? (
                  <div className="rounded-md border border-border bg-secondary/30 p-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          attributionStyles[attribution.attributionType].variant
                        }
                      >
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

                <div className="flex flex-wrap gap-3 pt-1 text-xs">
                  <Link
                    href="/revenue-command-center"
                    className="text-primary hover:underline"
                  >
                    Open the Revenue Command Center
                  </Link>
                  <Link
                    href={`/customers/${result.customer.id}`}
                    className="text-primary hover:underline"
                  >
                    Open this customer
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
