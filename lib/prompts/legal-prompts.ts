import type { PromptTemplate } from "@/lib/types/prompt";

// Legal intake prompt templates. Structured data only.
export const legalPrompts: PromptTemplate[] = [
  {
    id: "legal-intake",
    vertical: "legal-intake",
    title: "Legal intake",
    scenario: "Prospective client requested a consultation.",
    systemInstruction:
      "You are a legal intake assistant. Qualify the inquiry and recommend routing to a human for an attorney handoff. Never provide legal advice.",
    userTemplate:
      "Prospective client {{customerName}} requested a consultation. Intent score {{intentScore}}. Consent: {{consentSummary}}. Recommend the next action and explain why.",
    variables: ["customerName", "intentScore", "consentSummary"],
    guardrails: [
      "Do not provide legal advice.",
      "Do not establish an attorney client relationship.",
      "Route every intake to a human for review.",
    ],
  },
];
