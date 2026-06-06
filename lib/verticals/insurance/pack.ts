import type { VerticalPackConfig } from "@/lib/types/vertical-pack-config";

export const insurancePack: VerticalPackConfig = {
  id: "insurance",
  name: "Life Insurance Agency",
  tagline:
    "Local-agency growth across cold-call lists, referrals, and coverage expansion within the existing book of business.",
  objects: ["Referral Lead", "Coverage Review", "Cross-Sell Opportunity"],
  signalArchetypes: [
    {
      normalizedType: "NEW_LEAD",
      label: "Referral received",
      detail: "A current client referred a family member or colleague.",
      recommendedChannel: "voice",
      weight: 4,
    },
    {
      normalizedType: "SERVICE_DUE",
      label: "Coverage review due",
      detail: "An existing policyholder is due for an annual coverage and beneficiary review.",
      recommendedChannel: "email",
      weight: 3,
    },
    {
      normalizedType: "EMAIL_CLICK",
      label: "Coverage-gap interest",
      detail: "Client opened and clicked a life or disability coverage-gap prompt.",
      recommendedChannel: "email",
      weight: 2,
    },
    {
      normalizedType: "MISSED_CALL",
      label: "Missed agent call",
      detail: "A prospect from the cold-call list missed a scheduled agent call.",
      recommendedChannel: "voice",
      weight: 2,
    },
  ],
  opportunityTypes: [
    { key: "new-policy", title: "New life policy", minValue: 900, maxValue: 3200 },
    { key: "cross-sell", title: "Coverage expansion", minValue: 700, maxValue: 2400 },
  ],
  outcomes: ["Policy Bound", "Coverage Expanded", "Referral Converted", "Opportunity Lost"],
  recommendedActions: [
    "Referral follow-up call",
    "Annual coverage review scheduling",
    "Cross-sell prompt (disability, term-to-permanent, annuity)",
    "Beneficiary update outreach",
  ],
  scoring: { intentBias: 3, opportunityBias: 2, engagementBias: 2 },
  workflow: { primaryChannel: "voice", fallbackChannel: "email", escalateHighValue: true },
  revenue: { averageDealValue: 1600, recoveryRate: 0.4, missRate: 0.25 },
  complianceSensitivity: "elevated",
};
