import type { Metadata } from "next";
import { Sparkles, ShieldQuestion, CheckCircle2, Gauge } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { RecommendationCard } from "@/components/ai/recommendation-card";
import { getAICenter } from "@/lib/services/ai-service";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "AI Center" };
export const dynamic = "force-dynamic";

export default async function AICenterPage() {
  const { context, denied } = await guardPage("VIEW_AI_RECOMMENDATIONS");
  if (denied) return denied;

  const { recommendations, metrics } = await getAICenter(context);

  return (
    <>
      <SectionHeading
        title="AI recommendation center"
        description="Every recommendation is generated deterministically, scored for confidence, fully explained, and governed by human review. No AI provider is called."
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
        <h2 className="text-sm font-semibold">Generated recommendations</h2>
        {recommendations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                href={`/ai-center/${recommendation.id}`}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No recommendations found. Run the seed script to generate demo data.
          </p>
        )}
      </div>
    </>
  );
}
