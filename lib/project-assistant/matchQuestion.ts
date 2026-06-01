import { FALLBACK_ANSWER, KNOWLEDGE } from "./knowledge";
import type { KnowledgeEntry, MatchResult } from "./types";

// Deterministic question matching. No model, no network. The same input always
// returns the same answer. Scoring is a simple weighted blend of phrase alias
// matches, phrase keyword matches, and single keyword token overlap.

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "do",
  "does",
  "did",
  "how",
  "what",
  "why",
  "who",
  "when",
  "where",
  "this",
  "that",
  "it",
  "in",
  "on",
  "of",
  "to",
  "and",
  "or",
  "for",
  "with",
  "i",
  "you",
  "me",
  "my",
  "can",
  "could",
  "would",
  "should",
  "tell",
  "about",
  "please",
  "show",
]);

const CONFIDENCE_THRESHOLD = 4;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}

export function scoreEntry(input: string, entry: KnowledgeEntry): number {
  const normalized = normalize(input);
  if (normalized.length === 0) return 0;
  const tokens = new Set(tokenize(input));
  let score = 0;

  for (const alias of entry.aliases) {
    if (normalized.includes(normalize(alias))) {
      score += 6;
    }
  }

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (normalizedKeyword.includes(" ")) {
      if (normalized.includes(normalizedKeyword)) score += 3;
    } else if (tokens.has(normalizedKeyword)) {
      score += 2;
    }
  }

  return score;
}

// Find the best matching entry. Ties resolve to the earlier entry in the
// knowledge array, keeping the result stable and deterministic.
export function matchQuestion(input: string): MatchResult {
  let best: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    const score = scoreEntry(input, entry);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }

  if (best === null || bestScore < CONFIDENCE_THRESHOLD) {
    return { entry: null, score: bestScore };
  }
  return { entry: best, score: bestScore };
}

// Resolve a free-text question to an answer string, falling back honestly when
// nothing clears the confidence threshold.
export function answerQuestion(input: string): string {
  const { entry } = matchQuestion(input);
  return entry ? entry.answer : FALLBACK_ANSWER;
}
