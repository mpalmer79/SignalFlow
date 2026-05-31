import type { VerticalId } from "@/lib/types/vertical-pack";

// A structured prompt template. Phase 7 stores prompts as data to prepare for
// future provider integrations. No prompt is sent anywhere; they document the
// intended instruction shape per scenario.
export interface PromptTemplate {
  id: string;
  vertical: VerticalId;
  title: string;
  scenario: string;
  systemInstruction: string;
  userTemplate: string;
  variables: string[];
  guardrails: string[];
}
