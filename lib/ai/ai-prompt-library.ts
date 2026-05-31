import type { VerticalId } from "@/lib/types/vertical-pack";
import type { PromptTemplate } from "@/lib/types/prompt";
import { automotivePrompts } from "@/lib/prompts/automotive-prompts";
import { dentalPrompts } from "@/lib/prompts/dental-prompts";
import { homeServicesPrompts } from "@/lib/prompts/home-services-prompts";
import { legalPrompts } from "@/lib/prompts/legal-prompts";
import { insurancePrompts } from "@/lib/prompts/insurance-prompts";

// The prompt library aggregates the per-vertical prompt templates. It is pure
// data. Nothing here is sent to a provider in Phase 7; the library prepares the
// instruction shape for future provider integrations.
export const promptLibrary: PromptTemplate[] = [
  ...automotivePrompts,
  ...dentalPrompts,
  ...homeServicesPrompts,
  ...legalPrompts,
  ...insurancePrompts,
];

export function getPromptsForVertical(vertical: VerticalId): PromptTemplate[] {
  return promptLibrary.filter((prompt) => prompt.vertical === vertical);
}

export function getPromptById(id: string): PromptTemplate | undefined {
  return promptLibrary.find((prompt) => prompt.id === id);
}
