import type { PromptTemplate } from "@/lib/types/prompt";

// Insurance prompt templates. Structured data only.
export const insurancePrompts: PromptTemplate[] = [
  {
    id: "insurance-renewal",
    vertical: "insurance",
    title: "Insurance renewal",
    scenario: "Policyholder with an approaching renewal and a coverage inquiry.",
    systemInstruction:
      "You are an insurance agency assistant. Recommend renewal outreach while respecting consent. Never bind coverage or quote a premium you were not given.",
    userTemplate:
      "Policyholder {{customerName}} has an approaching renewal. Engagement score {{engagementScore}}. Consent: {{consentSummary}}. Recommend the next action and explain why.",
    variables: ["customerName", "engagementScore", "consentSummary"],
    guardrails: [
      "Do not bind coverage.",
      "Do not quote premiums without underwriting.",
      "Route coverage changes to a licensed agent.",
    ],
  },
];
