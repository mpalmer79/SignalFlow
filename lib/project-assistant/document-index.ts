import type { DocChunk, DocMatch } from "./types";
import { normalize, tokenize } from "./text";

// A small, source-controlled index of bundled markdown knowledge. Each chunk is
// a short, hand-authored summary of a repository document, not a raw dump and
// not a long quote. The index is authored at development time and shipped as
// plain data, so there is no runtime file system read, no network call, no
// embeddings, and no vector database. It improves recall when curated knowledge
// is incomplete; it never replaces a strong curated answer.

export const DOC_CHUNKS: DocChunk[] = [
  {
    id: "doc-provider-governance",
    source: "docs/PROVIDER_MANAGEMENT.md",
    heading: "Provider governance",
    text: "External providers are modeled in a registry with capabilities, feature flags, and readiness checks. In demo mode every live flag is blocked, so the selection engine resolves an internal mock provider for every capability and records the check in the audit trail.",
    keywords: ["provider", "governance", "registry", "feature", "flag", "readiness", "mock", "selection", "capability"],
  },
  {
    id: "doc-provider-future",
    source: "docs/PROVIDER_MANAGEMENT.md",
    heading: "Future-ready providers",
    text: "OpenAI, Anthropic, Gemini, Azure OpenAI, OpenAI Realtime, ElevenLabs, Twilio, Retell, Vapi, and SendGrid are future-ready registry entries only. None of their SDKs are installed and none are called.",
    keywords: ["openai", "anthropic", "gemini", "twilio", "sendgrid", "elevenlabs", "retell", "vapi", "future", "ready", "sdk"],
  },
  {
    id: "doc-voice-simulation",
    source: "docs/VOICE_PLATFORM.md",
    heading: "Voice simulation",
    text: "Voice is simulated end to end. Plans, scripts, and transcripts are generated deterministically, a compliance check runs before any call is simulated, and no call is ever placed to a real person.",
    keywords: ["voice", "simulation", "transcript", "compliance", "call", "plan", "mock"],
  },
  {
    id: "doc-ai-governance",
    source: "docs/AI_PLATFORM.md",
    heading: "AI governance",
    text: "AI recommendations are deterministic and carry a confidence score and a full explanation. Sensitive recommendations are routed through a human review queue that can approve, reject, or escalate, and the AI never acts on its own.",
    keywords: ["ai", "governance", "recommendation", "confidence", "explanation", "review", "human", "approve", "reject"],
  },
  {
    id: "doc-human-review",
    source: "docs/REVIEW_QUEUE.md",
    heading: "Human review",
    text: "A needs-review recommendation or voice plan cannot be executed until a human approves it. The review state machine prevents skipping straight to executed.",
    keywords: ["review", "human", "approve", "reject", "escalate", "executed", "gate"],
  },
  {
    id: "doc-multitenancy",
    source: "docs/MULTI_TENANCY.md",
    heading: "Multi-tenancy",
    text: "Every data access is organization scoped. The organization id always comes from the resolved server context, never from the client, so one tenant cannot read another tenant's data.",
    keywords: ["tenant", "tenancy", "organization", "scope", "isolation", "context"],
  },
  {
    id: "doc-authorization",
    source: "docs/AUTHORIZATION.md",
    heading: "Authorization",
    text: "Access uses a role based model with an organization-scoped request context. Pages call services, and repositories own all database access, so scoping stays in one place.",
    keywords: ["authorization", "role", "rbac", "access", "context", "repository"],
  },
  {
    id: "doc-production-readiness",
    source: "docs/PROOF_OF_WORK.md",
    heading: "What remains before production",
    text: "Before production: real provider adapters behind the readiness framework, a CI test database for services and repositories, server-side caching for heavy reads, a tested Content-Security-Policy, and a framework upgrade to clear dependency advisories.",
    keywords: ["production", "readiness", "before", "caching", "csp", "adapters", "upgrade", "database"],
  },
  {
    id: "doc-technical-debt",
    source: "docs/TECHNICAL_DEBT_REGISTER.md",
    heading: "Technical debt",
    text: "The debt register separates portfolio readiness from production readiness. Open items include no live integrations, engine-focused test coverage, no server-side caching yet, and a deferred Content-Security-Policy.",
    keywords: ["debt", "limits", "limitations", "caching", "csp", "coverage", "readiness", "gaps"],
  },
  {
    id: "doc-demo-safety",
    source: "docs/PROOF_OF_WORK.md",
    heading: "Demo safety",
    text: "Demo safe means no live SMS, email, or voice, no AI provider calls, no provider SDKs, no outbound network calls, no real secrets, and no real customer data. Repository scans verify these boundaries on every build.",
    keywords: ["demo", "safe", "safety", "network", "secret", "sdk", "scan", "isolated"],
  },
  {
    id: "doc-determinism",
    source: "docs/TECHNICAL_HIGHLIGHTS.md",
    heading: "Determinism",
    text: "The domain engines are pure functions and synthetic data is seeded, so the same input always produces the same output with no randomness and no model calls.",
    keywords: ["deterministic", "determinism", "pure", "engine", "seed", "repeatable"],
  },
  {
    id: "doc-architecture",
    source: "docs/TECHNICAL_HIGHLIGHTS.md",
    heading: "Layered architecture",
    text: "Pages render and call services, services compose business logic, repositories own data access, and pure engines hold deterministic domain logic. An architecture boundary check enforces this in CI.",
    keywords: ["architecture", "layer", "page", "service", "repository", "engine", "boundary", "ci"],
  },
  {
    id: "doc-testing",
    source: "docs/ENGINEERING_QUALITY.md",
    heading: "Testing and CI",
    text: "A Vitest suite proves business behavior across engines and service composition. CI runs typecheck, lint, tests, a safety scan, an architecture check, a dependency audit, Prisma validation, and the build.",
    keywords: ["test", "testing", "vitest", "ci", "lint", "safety", "audit", "build", "quality"],
  },
  {
    id: "doc-revenue",
    source: "docs/REVENUE_ENGINE.md",
    heading: "Revenue attribution",
    text: "Revenue attribution is deterministic. A positive simulated outcome attributes influenced or recovered revenue to the contributing opportunity, recorded in the audit trail as a demo estimate with no real money.",
    keywords: ["revenue", "attribution", "influenced", "recovered", "outcome", "estimate", "kpi"],
  },
  {
    id: "doc-verticals",
    source: "docs/PORTFOLIO_SUMMARY.md",
    heading: "Vertical packs",
    text: "Vertical packs adapt the same engines to automotive retail, a dental office, and a local life insurance agency, each a deterministic scenario through the full signal to revenue lifecycle.",
    keywords: ["vertical", "automotive", "dental", "insurance", "scenario", "pack", "industry"],
  },
];

// Document frequency for each token, used for a deterministic rare-term boost.
const DOC_FREQUENCY: Map<string, number> = (() => {
  const frequency = new Map<string, number>();
  for (const chunk of DOC_CHUNKS) {
    const tokens = new Set([
      ...tokenize(chunk.heading),
      ...tokenize(chunk.text),
      ...chunk.keywords.map((keyword) => normalize(keyword)),
    ]);
    for (const token of tokens) {
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
  }
  return frequency;
})();

function chunkTokenSet(chunk: DocChunk): Set<string> {
  return new Set([
    ...tokenize(chunk.heading),
    ...tokenize(chunk.text),
    ...chunk.keywords.map((keyword) => normalize(keyword)),
  ]);
}

// Tokens derived from a pathname, for example /voice-command-center yields
// voice, command, center. Used for a small route relevance boost.
function routeTokens(route: string | null | undefined): Set<string> {
  if (!route) return new Set();
  return new Set(tokenize(route.replace(/[/-]/g, " ")));
}

const MIN_DOC_SCORE = 3;

// Deterministic lexical search over the bundled chunks. Scores exact phrase
// presence, keyword and token overlap, heading boosts, rare-term boosts, and a
// small route boost. Returns the top matches, capped, sorted by score then id.
export function searchDocuments(
  query: string,
  route?: string | null,
  limit = 3,
): DocMatch[] {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length === 0) return [];
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];
  const routeTokenSet = routeTokens(route);

  const scored = DOC_CHUNKS.map((chunk) => {
    const tokens = chunkTokenSet(chunk);
    const headingTokens = new Set(tokenize(chunk.heading));
    let score = 0;

    // Exact phrase presence in the chunk body or heading.
    const normalizedText = normalize(chunk.text);
    if (normalizedQuery.length >= 6 && normalizedText.includes(normalizedQuery)) {
      score += 5;
    }

    for (const token of new Set(queryTokens)) {
      if (tokens.has(token)) {
        score += 1;
        if (headingTokens.has(token)) score += 2;
        // Rare-term boost: tokens that appear in few chunks are more telling.
        const frequency = DOC_FREQUENCY.get(token) ?? 0;
        if (frequency > 0 && frequency <= 2) score += 2;
      }
      if (routeTokenSet.has(token) && tokens.has(token)) score += 1;
    }

    return { chunk, score };
  });

  return scored
    .filter((item) => item.score >= MIN_DOC_SCORE)
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id))
    .slice(0, limit)
    .map((item) => ({
      id: item.chunk.id,
      source: item.chunk.source,
      heading: item.chunk.heading,
      snippet: item.chunk.text,
      score: item.score,
    }));
}
