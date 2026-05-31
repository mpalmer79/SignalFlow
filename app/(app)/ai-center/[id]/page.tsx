import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExplanationPanel } from "@/components/ai/explanation-panel";
import { getRecommendationDetail } from "@/lib/services/ai-service";
import { guardPage } from "@/lib/auth/guard-page";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "AI Recommendation" };
export const dynamic = "force-dynamic";

export default async function RecommendationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { context, denied } = await guardPage("VIEW_AI_RECOMMENDATIONS");
  if (denied) return denied;

  const detail = await getRecommendationDetail(context, params.id);
  if (!detail) {
    notFound();
  }

  const { recommendation, explanation, reviewDecisions } = detail;

  return (
    <>
      <Link
        href="/ai-center"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to AI center
      </Link>

      <SectionHeading
        title={recommendation.recommendationLabel}
        description={`AI recommendation for ${recommendation.customerName}. Generated deterministically and governed by human review.`}
      />

      <ExplanationPanel
        recommendation={recommendation}
        explanation={explanation}
      />

      <Card>
        <CardHeader>
          <CardTitle>Review history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reviewDecisions.length > 0 ? (
            reviewDecisions.map((decision) => (
              <div
                key={decision.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize">
                    {decision.decision.replace("-", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {decision.notes}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium">{decision.reviewerName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDateTime(decision.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              No review decisions recorded. This recommendation is awaiting
              review.
            </p>
          )}
        </CardContent>
      </Card>

      <Badge variant="warning">
        Recommendations never become actions automatically. A human approves
        every recommendation before it can execute.
      </Badge>
    </>
  );
}
