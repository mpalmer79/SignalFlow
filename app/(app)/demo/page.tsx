import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScenarioTimeline } from "@/components/scenario/scenario-timeline";
import { ScoreMeter } from "@/components/score-meter";
import { WorkflowOutcomeBadge } from "@/components/workflow/workflow-outcome-badge";
import { buttonVariants } from "@/components/ui/button";
import { getScenarioResult } from "@/lib/services/scenario-service";
import { attributionStyles } from "@/lib/config/outcome-status";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Demo Walkthrough" };

const STEP = "flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 font-mono text-xs text-primary";

export default function DemoPage() {
  const result = getScenarioResult("automotive-high-intent");

  if (!result) {
    return (
      <SectionHeading
        title="Demo walkthrough"
        description="The demo scenario is unavailable."
      />
    );
  }

  const { profile, workflow, assessment } = result;
  const attribution = assessment.attribution;

  return (
    <>
      <SectionHeading
        title="Product walkthrough"
        description="A guided tour of how SignalFlow turns a single customer signal into a revenue outcome. Everything here is deterministic and demo safe. Nothing is sent."
        actions={<Badge variant="warning">Demo mode</Badge>}
      />

      <Card>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Signal to revenue, in one view
            </h2>
            <p className="text-sm text-muted-foreground">
              SignalFlow is not a place to store contacts. It reads a customer
              signal, scores intent, builds a consent aware workflow, simulates
              execution, and measures the revenue outcome. This walkthrough
              follows one high intent automotive buyer through that path.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/scenarios" className={buttonVariants({ size: "sm" })}>
                Explore scenarios
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/executive-insights"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Executive insights
              </Link>
            </div>
          </div>
          <ScenarioTimeline steps={result.timeline} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={STEP}>1</span>
              What happened
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              {result.customer.name} submitted a trade appraisal and browsed
              inventory. SignalFlow captured these as structured signals and
              classified the intent.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="primary">Intent {profile.intentScore}</Badge>
              <Badge variant="success">Opportunity {profile.opportunityScore}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={STEP}>2</span>
              What SignalFlow decided
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              The action graph built a {workflow.title.toLowerCase()} and the
              policy layer checked consent on every action before simulating
              execution.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="muted">
                {workflow.execution.actionsExecuted} executed
              </Badge>
              <WorkflowOutcomeBadge outcome={workflow.execution.outcome} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className={STEP}>3</span>
            What outcome occurred
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            <ScoreMeter label="Intent" score={profile.intentScore} tone="intent" />
            <ScoreMeter
              label="Opportunity"
              score={profile.opportunityScore}
              tone="opportunity"
            />
            <ScoreMeter
              label="Engagement"
              score={profile.engagementScore}
              tone="engagement"
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm text-muted-foreground">
              The outcome engine recorded {assessment.outcomeEvents.length}{" "}
              outcome events and attributed revenue from the result.
            </p>
            {attribution ? (
              <div className="rounded-md border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={attributionStyles[attribution.attributionType].variant}
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
            ) : null}
            <Link
              href={`/scenarios/${result.definition.id}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open the full scenario
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
