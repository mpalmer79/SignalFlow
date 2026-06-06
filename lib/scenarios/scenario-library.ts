import type { ScenarioDefinition } from "@/lib/types/scenario";

// The curated set of launchable scenarios shown in the Scenario Builder. Each
// is a deterministic archetype across the supported verticals.
export const scenarioLibrary: ScenarioDefinition[] = [
  {
    id: "automotive-high-intent",
    title: "Automotive high intent buyer",
    vertical: "automotive",
    summary:
      "A shopper submits a trade appraisal and browses inventory with SMS consent on record.",
    intentLevel: "high",
    consentState: "granted",
    optedOut: false,
    hasResponse: true,
    signalKeys: ["TRADE_REQUEST", "VEHICLE_VIEW", "NEW_LEAD"],
  },
  {
    id: "automotive-lost-lead",
    title: "Automotive lost lead recovery",
    vertical: "automotive",
    summary:
      "A dormant lead with a missed sales call and no recent response, at risk of being lost.",
    intentLevel: "low",
    consentState: "unknown",
    optedOut: false,
    hasResponse: false,
    signalKeys: ["MISSED_CALL"],
  },
  {
    id: "dental-recall",
    title: "Dental recall campaign",
    vertical: "dental",
    summary:
      "A patient overdue for a cleaning with email consent, primed for reactivation.",
    intentLevel: "medium",
    consentState: "granted",
    optedOut: false,
    hasResponse: true,
    signalKeys: ["DENTAL_RECALL", "EMAIL_CLICK"],
  },
  {
    id: "home-services-estimate",
    title: "HVAC estimate request",
    vertical: "home-services",
    summary:
      "A homeowner requests a system replacement estimate with full consent.",
    intentLevel: "high",
    consentState: "granted",
    optedOut: false,
    hasResponse: true,
    signalKeys: ["ESTIMATE_REQUEST"],
  },
  {
    id: "legal-consultation",
    title: "Legal consultation lead",
    vertical: "legal-intake",
    summary:
      "A prospective client requests a consultation, routed to a human with advice boundaries.",
    intentLevel: "high",
    consentState: "unknown",
    optedOut: false,
    hasResponse: false,
    signalKeys: ["CONSULTATION_REQUEST"],
  },
  {
    id: "insurance-renewal",
    title: "Insurance renewal opportunity",
    vertical: "insurance",
    summary:
      "A policyholder with an approaching renewal and a recent coverage inquiry.",
    intentLevel: "medium",
    consentState: "granted",
    optedOut: false,
    hasResponse: true,
    signalKeys: ["SERVICE_DUE", "EMAIL_CLICK"],
  },
  {
    id: "insurance-book-expansion",
    title: "Life agency book expansion",
    vertical: "insurance",
    summary:
      "An existing policyholder with a coverage gap, primed for a cross-sell review and a referral follow-up.",
    intentLevel: "medium",
    consentState: "granted",
    optedOut: false,
    hasResponse: true,
    signalKeys: ["SERVICE_DUE", "EMAIL_CLICK", "NEW_LEAD"],
  },
  {
    id: "automotive-opt-out",
    title: "Compliance stop after opt-out",
    vertical: "automotive",
    summary:
      "A customer who replied STOP, demonstrating the consent stop path end to end.",
    intentLevel: "medium",
    consentState: "revoked",
    optedOut: true,
    hasResponse: false,
    signalKeys: ["MISSED_CALL"],
  },
];

export function getScenarioDefinition(
  id: string,
): ScenarioDefinition | undefined {
  return scenarioLibrary.find((scenario) => scenario.id === id);
}
