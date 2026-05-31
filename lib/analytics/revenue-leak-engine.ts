import type {
  LeakSeverity,
  LeakType,
  RevenueLeak,
} from "@/lib/types/analytics";
import type { MissedOpportunityRecord } from "@/lib/types/outcome-records";

// Classify a persisted missed opportunity reason into a leak type. Pure mapping.
function leakTypeForReason(reason: string): LeakType {
  const text = reason.toLowerCase();
  if (text.includes("consent")) return "NO_CONSENT";
  if (text.includes("human")) return "NO_HUMAN_FOLLOW_UP";
  if (text.includes("dormant")) return "DORMANT_OPPORTUNITY";
  if (text.includes("appointment")) return "MISSED_APPOINTMENT";
  return "REPEATED_NO_RESPONSE";
}

const RECOMMENDATIONS: Record<LeakType, string> = {
  NO_CONSENT: "Capture consent on an allowed channel before retrying.",
  NO_HUMAN_FOLLOW_UP: "Assign a human owner to high intent opportunities.",
  DORMANT_OPPORTUNITY: "Add dormant customers to a reactivation sequence.",
  REPEATED_NO_RESPONSE: "Vary channel and cadence after repeated silence.",
  MISSED_APPOINTMENT: "Send a rebooking offer with the next open slot.",
};

const SEVERITY_RANK: Record<LeakSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

// Aggregate persisted missed opportunities into revenue leaks grouped by type,
// with an estimated impact, a recovery recommendation, and the worst severity
// seen. Deterministic and framework free.
export function detectRevenueLeaks(
  missed: MissedOpportunityRecord[],
): RevenueLeak[] {
  const byType = new Map<
    LeakType,
    { impact: number; count: number; severity: LeakSeverity }
  >();

  for (const item of missed) {
    const leakType = leakTypeForReason(item.reason);
    const existing =
      byType.get(leakType) ?? { impact: 0, count: 0, severity: "low" as LeakSeverity };
    existing.impact += item.estimatedValue;
    existing.count += 1;
    if (SEVERITY_RANK[item.severity] > SEVERITY_RANK[existing.severity]) {
      existing.severity = item.severity;
    }
    byType.set(leakType, existing);
  }

  return Array.from(byType.entries())
    .map(([leakType, data]) => ({
      leakType,
      estimatedImpact: data.impact,
      recoveryRecommendation: RECOMMENDATIONS[leakType],
      severity: data.severity,
      count: data.count,
    }))
    .sort((a, b) => b.estimatedImpact - a.estimatedImpact);
}

const LEAK_LABELS: Record<LeakType, string> = {
  NO_CONSENT: "No consent",
  NO_HUMAN_FOLLOW_UP: "No human follow-up",
  DORMANT_OPPORTUNITY: "Dormant opportunity",
  REPEATED_NO_RESPONSE: "Repeated no response",
  MISSED_APPOINTMENT: "Missed appointment",
};

export function leakLabel(type: LeakType): string {
  return LEAK_LABELS[type];
}
