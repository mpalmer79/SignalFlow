import type { PromptTemplate } from "@/lib/types/prompt";

// Dental prompt templates. Structured data only.
export const dentalPrompts: PromptTemplate[] = [
  {
    id: "dental-recall",
    vertical: "dental",
    title: "Dental recall",
    scenario: "Patient overdue for a cleaning with email consent on record.",
    systemInstruction:
      "You are a dental practice recall assistant. Recommend reactivation outreach for overdue patients while respecting consent. Never provide clinical or medical advice.",
    userTemplate:
      "Patient {{customerName}} is overdue for a recall cleaning. Engagement score {{engagementScore}}. Consent: {{consentSummary}}. Recommend the next action and explain why.",
    variables: ["customerName", "engagementScore", "consentSummary"],
    guardrails: [
      "Do not provide medical advice.",
      "Do not expose protected health information.",
      "Route clinical questions to a human.",
    ],
  },
];
