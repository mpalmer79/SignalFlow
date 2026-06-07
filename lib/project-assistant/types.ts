// Types for the local project assistant. Everything here is plain data so the
// assistant stays deterministic, client safe, and free of any external service.
// There is no model, no network, no embeddings, and no vector database.

export type ConfidenceLevel = "high" | "medium" | "low";

// Deterministic safety intents. These flag questions that imply false live
// behavior so the assistant can correct the assumption honestly.
export type SafetyIntent =
  | "live_provider_assumption"
  | "secret_request"
  | "real_customer_data_request"
  | "real_message_request"
  | "production_readiness_question"
  | "out_of_scope_question";

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
  // Local source labels, for example README.md or docs/PROOF_OF_WORK.md. These
  // are repository documents only, never external websites.
  sources?: string[];
  // Ids of related entries, used to suggest deterministic follow-up questions.
  relatedIds?: string[];
}

export interface StarterQuestion {
  label: string;
  entryId: string;
}

export type AssistantRole = "user" | "assistant";

export interface RelatedQuestion {
  id: string;
  label: string;
}

// A small, source-controlled chunk of bundled markdown knowledge. Authored at
// development time, never read from disk at runtime, so there is no file system
// access in any request path.
export interface DocChunk {
  id: string;
  source: string;
  heading: string;
  text: string;
  keywords: string[];
}

export interface DocMatch {
  id: string;
  source: string;
  heading: string;
  snippet: string;
  score: number;
}

export interface ScoredEntry {
  entry: KnowledgeEntry;
  score: number;
  reasons: string[];
}

// The full structured answer the assistant returns. The UI renders the text
// plus the confidence, the source chips, and the related questions.
export interface AssistantAnswer {
  text: string;
  confidence: ConfidenceLevel;
  entryIds: string[];
  matchReasons: string[];
  sources: string[];
  related: RelatedQuestion[];
  safetyIntent: SafetyIntent | null;
  docMatches: DocMatch[];
  isFallback: boolean;
}

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  text: string;
  // Present on assistant messages so the UI can render chips and follow-ups.
  answer?: AssistantAnswer;
}

// Legacy result shape kept for backward compatibility with existing callers and
// tests.
export interface MatchResult {
  entry: KnowledgeEntry | null;
  score: number;
}
