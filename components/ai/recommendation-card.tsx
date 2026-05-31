import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  confidenceTierStyles,
  reviewStateStyles,
} from "@/lib/config/ai-status";
import { formatRelativeTime } from "@/lib/utils";
import type { AIRecommendationRecord } from "@/lib/types/ai-records";

export function RecommendationCard({
  recommendation,
  href,
}: {
  recommendation: AIRecommendationRecord;
  href?: string;
}) {
  const tier = confidenceTierStyles[recommendation.confidenceTier];
  const review = reviewStateStyles[recommendation.reviewState];

  const body = (
    <Card className="h-full transition-colors hover:border-primary/40">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {recommendation.recommendationLabel}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {recommendation.customerName} ({recommendation.vertical.replace("-", " ")})
            </p>
          </div>
          <Badge variant={review.variant}>{review.label}</Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Confidence</span>
            <span className="font-medium text-foreground">
              {recommendation.confidence}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${recommendation.confidence}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={tier.variant}>{tier.label}</Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(recommendation.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
