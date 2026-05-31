import type { VerticalPackConfig } from "@/lib/types/vertical-pack-config";

export const insurancePack: VerticalPackConfig = {
  id: "insurance",
  name: "Insurance",
  tagline:
    "Agency lead response and policy review prompts across personal and commercial lines.",
  objects: ["Quote Request", "Policy Review", "Renewal Opportunity"],
  signalArchetypes: [
    {
      normalizedType: "ESTIMATE_REQUEST",
      label: "Quote requested",
      detail: "Prospect requested an auto and home bundle quote.",
      recommendedChannel: "sms",
      weight: 4,
    },
    {
      normalizedType: "SERVICE_DUE",
      label: "Renewal approaching",
      detail: "An active policy renewal is due within two weeks.",
      recommendedChannel: "email",
      weight: 3,
    },
    {
      normalizedType: "EMAIL_CLICK",
      label: "Coverage inquiry",
      detail: "Policyholder opened and clicked a coverage review prompt.",
      recommendedChannel: "email",
      weight: 2,
    },
    {
      normalizedType: "MISSED_CALL",
      label: "Missed agent call",
      detail: "Policyholder missed a scheduled agent call.",
      recommendedChannel: "voice",
      weight: 2,
    },
  ],
  opportunityTypes: [
    { key: "new-policy", title: "New policy", minValue: 800, maxValue: 2600 },
    { key: "renewal", title: "Policy renewal", minValue: 600, maxValue: 1800 },
  ],
  outcomes: ["Policy Bound", "Renewal Completed", "Opportunity Lost"],
  recommendedActions: [
    "Quote follow-up",
    "Renewal reminder",
    "Coverage review scheduling",
    "Agent handoff",
  ],
  scoring: { intentBias: 3, opportunityBias: 2, engagementBias: 2 },
  workflow: { primaryChannel: "sms", fallbackChannel: "email", escalateHighValue: false },
  revenue: { averageDealValue: 1400, recoveryRate: 0.45, missRate: 0.25 },
  complianceSensitivity: "elevated",
};
