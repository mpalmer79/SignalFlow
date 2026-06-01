// Types for the local project assistant. Everything here is plain data so the
// assistant stays deterministic, client safe, and free of any external service.

export interface KnowledgeEntry {
  id: string;
  // A canonical phrasing of the question, used for reference and for the
  // starter chips that point at this entry.
  question: string;
  // The answer shown to the user. Curated, concise, and demo safe.
  answer: string;
  // Single word or short phrase match terms, all lowercase.
  keywords: string[];
  // Longer phrase aliases that, when found in the input, strongly indicate
  // this entry.
  aliases: string[];
}

export interface StarterQuestion {
  label: string;
  entryId: string;
}

export type AssistantRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  text: string;
}

export interface MatchResult {
  entry: KnowledgeEntry | null;
  score: number;
}
