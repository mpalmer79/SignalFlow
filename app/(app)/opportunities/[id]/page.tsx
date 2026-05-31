import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { OutcomeEvents } from "@/components/revenue/outcome-events";
import { AttributionList } from "@/components/revenue/attribution-list";
import { MissedOpportunityList } from "@/components/revenue/missed-opportunity-list";
import { getOpportunityDetail } from "@/lib/services/opportunity-service";
import { guardPage } from "@/lib/auth/guard-page";
import { opportunityStageStyles } from "@/lib/config/status";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Opportunity" };
export const dynamic = "force-dynamic";

export default async function OpportunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { context, denied } = await guardPage("VIEW_OPPORTUNITIES");
  if (denied) return denied;

  const detail = await getOpportunityDetail(context, params.id);

  if (!detail) {
    notFound();
  }

  const { opportunity, transitions, outcomeEvents, attributions, missed } =
    detail;

  return (
    <>
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to pipeline
      </Link>

      <SectionHeading
        title={opportunity.title}
        description={`${opportunity.customerName} in the ${opportunity.vertical.replace("-", " ")} vertical.`}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {formatCurrency(opportunity.estimatedValue)}
            </span>
            <StatusBadge status={opportunityStageStyles[opportunity.stage]} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stage transition history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transitions.length > 0 ? (
              transitions.map((t) => (
                <div
                  key={t.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="capitalize">
                      {t.fromStage.replace("-", " ")}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium capitalize">
                      {t.toStage.replace("-", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.reason}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDateTime(t.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No stage transitions recorded.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outcome events</CardTitle>
          </CardHeader>
          <CardContent>
            <OutcomeEvents events={outcomeEvents} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue attribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AttributionList attributions={attributions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missed opportunity risk</CardTitle>
          </CardHeader>
          <CardContent>
            <MissedOpportunityList missed={missed} />
          </CardContent>
        </Card>
      </div>

      <Link
        href={`/revenue-engine/${opportunity.customerId}`}
        className="text-xs text-primary hover:underline"
      >
        View the full signal to revenue story
      </Link>
    </>
  );
}
