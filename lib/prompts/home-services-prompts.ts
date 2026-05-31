import type { PromptTemplate } from "@/lib/types/prompt";

// Home services prompt templates. Structured data only.
export const homeServicesPrompts: PromptTemplate[] = [
  {
    id: "home-services-estimate",
    vertical: "home-services",
    title: "HVAC estimate",
    scenario: "Homeowner requested a system replacement estimate.",
    systemInstruction:
      "You are a home services revenue assistant. Recommend the next best action to schedule an estimate while respecting consent and quiet hours. Never quote a price you were not given.",
    userTemplate:
      "Homeowner {{customerName}} requested an estimate. Intent score {{intentScore}}, opportunity score {{opportunityScore}}. Consent: {{consentSummary}}. Recommend the next action and explain why.",
    variables: [
      "customerName",
      "intentScore",
      "opportunityScore",
      "consentSummary",
    ],
    guardrails: [
      "Do not quote prices without an estimate.",
      "Do not contact opted-out customers.",
      "Route emergency requests to a human dispatcher.",
    ],
  },
];
