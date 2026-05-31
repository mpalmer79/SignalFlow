import type { Customer, CustomerRiskFlag } from "@/lib/types/customer";
import type { Opportunity } from "@/lib/types/opportunity";
import type {
  ConsentSummary,
  IntelligenceRiskFlag,
  NormalizedSignal,
} from "@/lib/types/intelligence";

export interface RiskFlagInput {
  customer: Customer;
  signals: NormalizedSignal[];
  opportunities: Opportunity[];
  consentSummary: ConsentSummary;
  hasRecentResponse: boolean;
}

const SEVERITY_MAP: Record<CustomerRiskFlag["severity"], IntelligenceRiskFlag["severity"]> = {
  info: "info",
  warning: "warning",
  critical: "critical",
};

// Risk flags combine persisted customer flags with flags derived from the
// intelligence layer. Each flag carries a short note on how it influences
// recommendations.
export function deriveRiskFlags(
  input: RiskFlagInput,
): IntelligenceRiskFlag[] {
  const { customer, signals, opportunities, consentSummary, hasRecentResponse } =
    input;
  const flags: IntelligenceRiskFlag[] = [];

  for (const flag of customer.riskFlags) {
    flags.push({
      label: flag.label,
      severity: SEVERITY_MAP[flag.severity],
      influence:
        flag.severity === "critical"
          ? "Routes recommendations to human review"
          : "Adds caution to outreach decisions",
    });
  }

  if (customer.optedOut) {
    flags.push({
      label: "Customer opted out",
      severity: "critical",
      influence: "Pauses all outreach",
    });
  }

  if (consentSummary === "blocked" && !customer.optedOut) {
    flags.push({
      label: "Missing consent on preferred channel",
      severity: "warning",
      influence: "Blocks the preferred channel until consent is captured",
    });
  }

  const highValue = opportunities.some((opp) => opp.estimatedValue >= 20000);
  if (highValue) {
    flags.push({
      label: "High value opportunity",
      severity: "warning",
      influence: "Raises urgency and favors human escalation",
    });
  }

  if (signals.length >= 2 && !hasRecentResponse && !customer.optedOut) {
    flags.push({
      label: "Repeated no response",
      severity: "info",
      influence: "Lowers engagement and slows outreach cadence",
    });
  }

  return dedupeByLabel(flags);
}

function dedupeByLabel(flags: IntelligenceRiskFlag[]): IntelligenceRiskFlag[] {
  const seen = new Set<string>();
  return flags.filter((flag) => {
    const key = flag.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
