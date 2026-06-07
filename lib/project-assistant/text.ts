// Shared deterministic text helpers for the project assistant. No model, no
// network. Normalization preserves important technical terms such as openai,
// twilio, sendgrid, voice, sms, email, provider, crm, tenant, prisma, ci, and
// test because they survive as plain alphanumeric tokens.

export const STOPWORDS = new Set([
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

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}

export function uniqueTokens(text: string): Set<string> {
  return new Set(tokenize(text));
}

// Split an answer into sentences for deterministic de-duplication during
// multi-entry composition.
export function sentenceSplit(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}
