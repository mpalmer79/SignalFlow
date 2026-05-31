import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreMeter } from "@/components/score-meter";
import {
  confidenceTierStyles,
  reviewStateStyles,
} from "@/lib/config/ai-status";
import type {
  AIExplanationRecord,
  AIRecommendationRecord,
} from "@/lib/types/ai-records";

// The explanation panel makes a recommendation fully explainable: the action,
// the confidence, the reasoning factors, the supporting signals, and the risk
// considerations.
export function ExplanationPanel({
  recommendation,
  explanation,
}: {
  recommendation: AIRecommendationRecord;
  explanation: AIExplanationRecord | null;
}) {
  const tier = confidenceTierStyles[recommendation.confidenceTier];
  const review = reviewStateStyles[recommendation.reviewState];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-semibold">
            {recommendation.recommendationLabel}
          </p>
          <ScoreMeter
            label="Confidence"
            score={recommendation.confidence}
            tone="intent"
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant={tier.variant}>{tier.label}</Badge>
            <Badge variant={review.variant}>{review.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Provider: {recommendation.provider}
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Why</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {explanation ? (
            <>
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Reasoning factors
                </p>
                {explanation.reasoningFactors.map((factor, index) => (
                  <p key={index} className="text-sm text-foreground">
                    {factor}
                  </p>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Supporting signals
                  </p>
                  {explanation.supportingSignals.length > 0 ? (
                    explanation.supportingSignals.map((signal, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        {signal}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">None.</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Risk considerations
                  </p>
                  {explanation.riskConsiderations.map((risk, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {risk}
                    </p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No explanation recorded.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
