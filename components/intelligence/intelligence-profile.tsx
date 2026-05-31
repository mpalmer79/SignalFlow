import {
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreMeter } from "@/components/score-meter";
import {
  ConsentBadge,
  IntentBadge,
  PriorityBadge,
} from "@/components/intelligence/score-badges";
import type {
  CustomerIntelligenceProfile,
  IntelligenceRiskFlag,
} from "@/lib/types/intelligence";

const riskVariant: Record<
  IntelligenceRiskFlag["severity"],
  "muted" | "warning" | "danger"
> = {
  info: "muted",
  warning: "warning",
  critical: "danger",
};

const urgencyVariant = {
  immediate: "danger",
  high: "warning",
  standard: "primary",
  low: "muted",
} as const;

export function IntelligenceProfile({
  profile,
}: {
  profile: CustomerIntelligenceProfile;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreMeter
              label="Intent"
              score={profile.intentScore}
              tone="intent"
            />
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
              <ConsentBadge summary={profile.consentSummary} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recommended actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.recommendedActions.map((action, index) => (
              <div
                key={`${action.action}-${index}`}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{action.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.rationale}
                    </p>
                  </div>
                </div>
                <Badge variant={urgencyVariant[action.urgency]}>
                  {action.urgency}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success" />
              Detected opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.detectedOpportunities.length > 0 ? (
              profile.detectedOpportunities.map((opp) => (
                <div
                  key={`${opp.type}-${opp.sourceSignalId}`}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{opp.type}</p>
                    <Badge variant="success">{opp.confidence}% confidence</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {opp.reason}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-foreground">
                    <Target className="h-3 w-3 text-primary" />
                    {opp.recommendedAction}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No opportunities detected from current signals.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Risk indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.riskFlags.length > 0 ? (
              profile.riskFlags.map((flag) => (
                <div
                  key={flag.label}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{flag.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {flag.influence}
                    </p>
                  </div>
                  <Badge variant={riskVariant[flag.severity]}>
                    {flag.severity}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No active risk indicators.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
