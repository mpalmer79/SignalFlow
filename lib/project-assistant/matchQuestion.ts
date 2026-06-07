import {
  FALLBACK_ANSWER,
  FALLBACK_SOURCES,
  KNOWLEDGE,
  getEntryById,
} from "./knowledge";
import type {
  AssistantAnswer,
  ConfidenceLevel,
  KnowledgeEntry,
  MatchResult,
  RelatedQuestion,
  ScoredEntry,
} from "./types";
import { normalize, sentenceSplit, tokenize, uniqueTokens } from "./text";
import { routeBoostIds } from "./route-context";
import { detectSafetyIntent, SAFETY_INTENT_ENTRY } from "./safety-intent";
import { searchDocuments } from "./document-index";

// Deterministic question matching. No model, no network. The same input always
// returns the same answer.

const CONFIDENCE_THRESHOLD = 4;
const ANSWER_THRESHOLD = 2;
const RECRUITER_RELATED = ["recruiter-review", "hiring-manager-review", "different-from-chatbot"];

// ---------------------------------------------------------------------------
// Legacy scoring API, preserved so existing callers and tests keep working.
// ---------------------------------------------------------------------------

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

export function answerQuestion(input: string): string {
  const { entry } = matchQuestion(input);
  return entry ? entry.answer : FALLBACK_ANSWER;
}

// ---------------------------------------------------------------------------
// Richer ranking engine. Adds exact alias, alias substring, phrase and keyword
// overlap, partial token match, question-field overlap, and a route boost. The
// legacy scorer above is untouched.
// ---------------------------------------------------------------------------

function richScore(
  input: string,
  entry: KnowledgeEntry,
  routeIds: string[],
): ScoredEntry {
  const normalized = normalize(input);
  const tokens = uniqueTokens(input);
  const reasons = new Set<string>();
  let score = 0;

  for (const alias of entry.aliases) {
    const normalizedAlias = normalize(alias);
    if (normalizedAlias.length === 0) continue;
    if (normalized === normalizedAlias) {
      score += 10;
      reasons.add("exact-alias");
    } else if (normalized.includes(normalizedAlias)) {
      score += 6;
      reasons.add("alias");
    }
  }

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (normalizedKeyword.includes(" ")) {
      if (normalized.includes(normalizedKeyword)) {
        score += 3;
        reasons.add("phrase");
      }
      continue;
    }
    if (tokens.has(normalizedKeyword)) {
      score += 2;
      reasons.add("keyword");
      continue;
    }
    // Partial token match for longer technical terms.
    for (const token of tokens) {
      if (
        token.length >= 4 &&
        normalizedKeyword.length >= 4 &&
        (token.startsWith(normalizedKeyword) || normalizedKeyword.startsWith(token))
      ) {
        score += 1;
        reasons.add("partial");
        break;
      }
    }
  }

  // Question-field overlap, capped so it cannot dominate an alias match.
  const questionTokens = uniqueTokens(entry.question);
  let overlap = 0;
  for (const token of tokens) {
    if (questionTokens.has(token)) overlap += 1;
  }
  if (overlap > 0) {
    score += Math.min(overlap, 3);
    reasons.add("question-overlap");
  }

  // Route boost is small so an exact or strong user intent always wins over it.
  if (routeIds.includes(entry.id)) {
    score += 2;
    reasons.add("route");
  }

  return { entry, score, reasons: Array.from(reasons) };
}

// Rank every entry for an input. Stable: ties resolve to the earlier entry in
// the knowledge array.
export function rankEntries(input: string, route?: string | null): ScoredEntry[] {
  const routeIds = routeBoostIds(route);
  return KNOWLEDGE.map((entry, index) => ({
    scored: richScore(input, entry, routeIds),
    index,
  }))
    .sort((a, b) => b.scored.score - a.scored.score || a.index - b.index)
    .map((item) => item.scored);
}

function confidenceFor(scored: ScoredEntry): ConfidenceLevel {
  if (scored.reasons.includes("exact-alias") || scored.score >= 6) return "high";
  if (scored.score >= CONFIDENCE_THRESHOLD) return "medium";
  return "low";
}

// Decide whether to compose multiple entries. Composition only happens for
// broad questions where a second entry is genuinely strong and close to the
// best, and never when the best is an exact alias match.
function shouldCompose(ranked: ScoredEntry[]): boolean {
  const [best, second] = ranked;
  if (!best || !second) return false;
  if (best.reasons.includes("exact-alias")) return false;
  if (second.score < CONFIDENCE_THRESHOLD) return false;
  if (best.score - second.score >= 3) return false;
  return true;
}

// Compose up to three answers concisely, keeping the first two sentences of
// each and removing repeated sentences.
function composeAnswers(entries: KnowledgeEntry[]): string {
  const seen = new Set<string>();
  const sentences: string[] = [];
  for (const entry of entries) {
    for (const sentence of sentenceSplit(entry.answer).slice(0, 2)) {
      const key = sentence.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      sentences.push(sentence);
    }
  }
  return sentences.join(" ");
}

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function buildRelated(
  primaryEntries: KnowledgeEntry[],
  route: string | null | undefined,
  answeredIds: string[],
): RelatedQuestion[] {
  const candidateIds = dedupe([
    ...primaryEntries.flatMap((entry) => entry.relatedIds ?? []),
    ...routeBoostIds(route),
    ...RECRUITER_RELATED,
  ]);

  const related: RelatedQuestion[] = [];
  for (const id of candidateIds) {
    if (answeredIds.includes(id)) continue;
    const entry = getEntryById(id);
    if (!entry) continue;
    related.push({ id: entry.id, label: entry.question });
    if (related.length >= 3) break;
  }
  return related;
}

function collectSources(primaryEntries: KnowledgeEntry[]): string[] {
  const sources = dedupe(primaryEntries.flatMap((entry) => entry.sources ?? []));
  return sources.slice(0, 4);
}

function buildAnswer(params: {
  text: string;
  confidence: ConfidenceLevel;
  primaryEntries: KnowledgeEntry[];
  reasons: string[];
  route: string | null | undefined;
  safetyIntent: AssistantAnswer["safetyIntent"];
  docMatches: AssistantAnswer["docMatches"];
  isFallback: boolean;
}): AssistantAnswer {
  const entryIds = params.primaryEntries.map((entry) => entry.id);
  const sources = params.isFallback
    ? FALLBACK_SOURCES
    : collectSources(params.primaryEntries);
  return {
    text: params.text,
    confidence: params.confidence,
    entryIds,
    matchReasons: dedupe(params.reasons),
    sources,
    related: buildRelated(params.primaryEntries, params.route, entryIds),
    safetyIntent: params.safetyIntent,
    docMatches: params.docMatches,
    isFallback: params.isFallback,
  };
}

// The primary entry point for the UI. Returns a structured answer with
// confidence, sources, related questions, an optional safety intent, and
// optional supporting document matches. Deterministic and fully local.
export function getAssistantResponse(
  input: string,
  route?: string | null,
): AssistantAnswer {
  const normalized = normalize(input);

  if (normalized.length === 0) {
    return buildAnswer({
      text: FALLBACK_ANSWER,
      confidence: "low",
      primaryEntries: [],
      reasons: [],
      route,
      safetyIntent: "out_of_scope_question",
      docMatches: [],
      isFallback: true,
    });
  }

  // Safety-intent correction takes precedence for false-premise questions.
  const safetyIntent = detectSafetyIntent(normalized);
  if (safetyIntent) {
    const mappedId = SAFETY_INTENT_ENTRY[safetyIntent];
    const entry = mappedId ? getEntryById(mappedId) : null;
    if (entry) {
      return buildAnswer({
        text: entry.answer,
        confidence: "high",
        primaryEntries: [entry],
        reasons: [`safety:${safetyIntent}`],
        route,
        safetyIntent,
        docMatches: [],
        isFallback: false,
      });
    }
  }

  const ranked = rankEntries(input, route);
  const best = ranked[0];

  if (!best || best.score < ANSWER_THRESHOLD) {
    return buildAnswer({
      text: FALLBACK_ANSWER,
      confidence: "low",
      primaryEntries: [],
      reasons: [],
      route,
      safetyIntent: "out_of_scope_question",
      docMatches: searchDocuments(input, route),
      isFallback: true,
    });
  }

  const confidence = confidenceFor(best);

  // Compose when the question is broad and a second entry is strong.
  if (shouldCompose(ranked)) {
    const composed: ScoredEntry[] = [best];
    for (const candidate of ranked.slice(1)) {
      if (composed.length >= 3) break;
      if (candidate.score < CONFIDENCE_THRESHOLD) break;
      if (best.score - candidate.score >= 3) break;
      composed.push(candidate);
    }
    const entries = composed.map((item) => item.entry);
    const reasons = composed.flatMap((item) => item.reasons);
    return buildAnswer({
      text: composeAnswers(entries),
      confidence,
      primaryEntries: entries,
      reasons: ["composed", ...reasons],
      route,
      safetyIntent: null,
      // Supporting docs only when curated confidence is not high.
      docMatches: confidence === "high" ? [] : searchDocuments(input, route),
      isFallback: false,
    });
  }

  return buildAnswer({
    text: best.entry.answer,
    confidence,
    primaryEntries: [best.entry],
    reasons: best.reasons,
    route,
    safetyIntent: null,
    docMatches: confidence === "high" ? [] : searchDocuments(input, route),
    isFallback: false,
  });
}
