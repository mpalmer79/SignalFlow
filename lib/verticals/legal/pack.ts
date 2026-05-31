import type { VerticalPackConfig } from "@/lib/types/vertical-pack-config";

export const legalPack: VerticalPackConfig = {
  id: "legal-intake",
  name: "Legal Intake",
  tagline:
    "Consultation intake and qualification for consumer law practices, with careful advice boundaries.",
  objects: ["Consultation Request", "Case Intake", "Referral"],
  signalArchetypes: [
    {
      normalizedType: "CONSULTATION_REQUEST",
      label: "Consultation request",
      detail: "Prospective client requested an initial consultation.",
      recommendedChannel: "human",
      weight: 4,
    },
    {
      normalizedType: "NEW_LEAD",
      label: "Website intake",
      detail: "Prospective client submitted a website intake form.",
      recommendedChannel: "email",
      weight: 3,
    },
    {
      normalizedType: "EMAIL_CLICK",
      label: "Referral received",
      detail: "A partner referral opened and clicked the intake follow-up.",
      recommendedChannel: "email",
      weight: 2,
    },
  ],
  opportunityTypes: [
    { key: "consultation", title: "Initial consultation", minValue: 1200, maxValue: 4500 },
    { key: "case-retainer", title: "Case retainer", minValue: 3500, maxValue: 12000 },
  ],
  outcomes: ["Consultation Scheduled", "Case Accepted", "Case Declined"],
  recommendedActions: [
    "Intake qualification",
    "Consultation scheduling",
    "Document request",
    "Attorney handoff",
  ],
  scoring: { intentBias: 4, opportunityBias: 3, engagementBias: 1 },
  workflow: { primaryChannel: "human", fallbackChannel: "email", escalateHighValue: true },
  revenue: { averageDealValue: 3500, recoveryRate: 0.4, missRate: 0.28 },
  complianceSensitivity: "high",
};
