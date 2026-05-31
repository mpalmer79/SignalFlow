import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreMeter } from "@/components/score-meter";
import {
  IntentBadge,
  PriorityBadge,
} from "@/components/intelligence/score-badges";
import { WorkflowOutcomeBadge } from "@/components/workflow/workflow-outcome-badge";
import { OutcomeEvents } from "@/components/revenue/outcome-events";
import { AttributionList } from "@/components/revenue/attribution-list";
import { MissedOpportunityList } from "@/components/revenue/missed-opportunity-list";
import { getRevenueStory } from "@/lib/services/revenue-engine-service";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Revenue Story" };
export const dynamic = "force-dynamic";

const STEP = "flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 font-mono text-xs text-primary";

export default async function RevenueStoryPage({
  params,
}: {
  params: { id: string };
}) {
  const story = await getRevenueStory(params.id);

  if (!story) {
    notFound();
  }

  const { profile, run, effectiveness } = story;
  const topSignal = story.signals[0];

  return (
    <>
      <Link
        href="/revenue-engine"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to revenue engine
      </Link>

      <SectionHeading
        title={`${story.customerName}: signal to revenue`}
        description="The full deterministic path from an inbound signal to a measured revenue outcome. Nothing is sent and no revenue is real."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={STEP}>1</span>
              Signal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topSignal ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">{topSignal.label}</p>
                <p className="text-xs text-muted-foreground">
                  {topSignal.detail}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  Source: {topSignal.source.replace("-", " ")}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No signals recorded.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={STEP}>2</span>
              Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
            <div className="flex flex-wrap gap-2 pt-1">
              <PriorityBadge priority={profile.priority} />
              <IntentBadge intent={profile.intentLevel} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className={STEP}>3</span>
            Workflow run
          </CardTitle>
        </CardHeader>
        <CardContent>
          {run ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{run.title}</p>
                  <p className="text-xs text-muted-foreground">{run.trigger}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="muted">{run.actionsExecuted} executed</Badge>
                  <Badge variant="muted">{run.actionsBlocked} blocked</Badge>
                  <WorkflowOutcomeBadge outcome={run.outcome} />
                </div>
              </div>
              <Link
                href={`/orchestrator/${run.id}`}
                className="text-xs text-primary hover:underline"
              >
                View full workflow run
              </Link>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No workflow run for this customer.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={STEP}>4</span>
              Outcome events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OutcomeEvents events={story.outcomeEvents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={STEP}>5</span>
              Revenue attribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttributionList attributions={story.attributions} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={STEP}>6</span>
              Workflow effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            {effectiveness ? (
              <div className="space-y-3">
                <ScoreMeter
                  label="Outcome score"
                  score={effectiveness.outcomeScore}
                  tone="opportunity"
                />
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Executed: {effectiveness.actionsExecuted}</span>
                  <span>Blocked: {effectiveness.actionsBlocked}</span>
                  <span>Escalated: {effectiveness.actionsEscalated}</span>
                  <span>Policy friction: {effectiveness.policyFriction}</span>
                </div>
                <p className="text-sm font-semibold">
                  Revenue influenced:{" "}
                  {formatCurrency(effectiveness.revenueInfluenced)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No effectiveness snapshot recorded.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={STEP}>7</span>
              Missed opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MissedOpportunityList missed={story.missed} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
