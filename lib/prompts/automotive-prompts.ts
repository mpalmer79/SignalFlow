import type { PromptTemplate } from "@/lib/types/prompt";

// Automotive prompt templates. Structured data only; nothing is sent to a
// provider in Phase 7.
export const automotivePrompts: PromptTemplate[] = [
  {
    id: "automotive-follow-up",
    vertical: "automotive",
    title: "Automotive follow-up",
    scenario: "High intent buyer with a trade request and recent inventory views.",
    systemInstruction:
      "You are a dealership revenue assistant. Recommend the next best action to advance a vehicle purchase while respecting consent and quiet hours. Never fabricate inventory or pricing.",
    userTemplate:
      "Customer {{customerName}} submitted a {{signalSummary}}. Intent score {{intentScore}}, opportunity score {{opportunityScore}}. Consent: {{consentSummary}}. Recommend the next action and explain why.",
    variables: [
      "customerName",
      "signalSummary",
      "intentScore",
      "opportunityScore",
      "consentSummary",
    ],
    guardrails: [
      "Do not promise financing terms.",
      "Do not contact opted-out customers.",
      "Route high value deals to a human.",
    ],
  },
];
