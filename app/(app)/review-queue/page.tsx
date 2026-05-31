import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { RecommendationCard } from "@/components/ai/recommendation-card";
import { getReviewQueue } from "@/lib/services/review-service";
import { reviewStateStyles } from "@/lib/config/ai-status";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "Review Queue" };
export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const { context, denied } = await guardPage("VIEW_AI_RECOMMENDATIONS");
  if (denied) return denied;

  const { groups, pendingCount } = await getReviewQueue(context);

  return (
    <>
      <SectionHeading
        title="Human review queue"
        description="AI recommendations do not become actions automatically. Each one is reviewed by a human. Recommendations are grouped by review state."
        actions={
          <Badge variant="warning">{pendingCount} awaiting review</Badge>
        }
      />

      {groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => {
            const style = reviewStateStyles[group.state];
            return (
              <section key={group.state} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">{style.label}</h2>
                  <Badge variant={style.variant}>{group.items.length}</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      href={`/ai-center/${recommendation.id}`}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No recommendations to review. Run the seed script to generate demo
          data.
        </p>
      )}
    </>
  );
}
