# Project assistant

The project assistant is the floating "Curious about this project?" launcher in
the bottom-right corner. It answers questions about SignalFlow from local
repository knowledge only. It is deliberately not a live AI model.

## What it does

- Answers questions about the project: what it does, what is real versus
  simulated, how it shows AI governance, how it is tested, provider safety, the
  architecture, the verticals, and how recruiters and hiring managers should
  review it.
- Matches a free-text question to curated knowledge with a deterministic
  scoring engine, and reports a confidence level.
- Composes two or three curated entries when a question is broad and
  cross-cutting, while preferring a single strong answer when the match is
  direct.
- Suggests up to three related follow-up questions after each answer.
- Shows compact source chips that point at local repository documents.
- Reads the current route only to improve answer relevance.
- Corrects questions that imply false live behavior, honestly and concisely.

## What powers it

- A curated, source-controlled knowledge base in `lib/project-assistant`.
- A deterministic lexical matching engine that scores exact aliases, alias
  substrings, keyword and phrase overlap, partial token matches, question-field
  overlap, a small route boost, and a safety-intent check.
- A small, source-controlled local document index of short, hand-authored
  summaries of repository docs, used to improve recall when curated knowledge is
  incomplete. It never replaces a strong curated answer.

## What it does not do

- No external API keys.
- No model provider.
- No network calls and no `fetch`.
- No provider SDKs.
- No embeddings service and no vector database.
- No runtime file system reads. The document index is bundled as plain data at
  development time, not read from disk in any request path.
- No real customer data and no secrets.

## Route-aware context

The assistant reads the current pathname only to rank answers. It never affects
authorization, provider selection, compliance, workflow execution, AI behavior,
or any business logic. A vague question on a specific page prefers that page's
knowledge, while a specific question still wins regardless of route. Unknown
routes work normally with no boost. The route to knowledge map lives in
`lib/project-assistant/route-context.ts`.

## Related questions and source chips

Related questions are derived deterministically from the matched entries, the
current route, and recruiter relevance, with duplicates removed and a cap of
three. Source chips list local repository files only, for example `README.md` or
`docs/PROOF_OF_WORK.md`. The assistant never references external websites as
sources.

## Safety guardrails

Some questions assume a live integration that does not exist. The assistant
detects these deterministically and corrects the assumption without overclaiming:

- A live provider assumption, for example "does it use OpenAI voice".
- A secret request, for example "where is the API key".
- A real customer data request, for example "can I connect my CRM".
- A real message request, for example "can it call a real patient".
- A production readiness question, answered with an honest readiness summary.

Questions framed as future work, for example "how would OpenAI be integrated
later", are treated as legitimate roadmap questions, not false premises.

## Deterministic behavior

The same question always produces the same answer. There is no randomness and no
model output. This makes the assistant testable, and the test suites in
`tests/project-assistant.test.ts` and `tests/project-assistant-engine.test.ts`
prove matching, confidence, composition, related questions, sources, route
awareness, the recruiter pack, the safety guardrails, and the document search.

## Limitations

- Matching is lexical, not semantic. A question phrased far from the curated
  wording can fall back honestly rather than guess. This is intentional, since
  an embeddings model would add a dependency the project deliberately avoids.
- Knowledge coverage is finite and curated. The assistant says so when a
  question is outside the project rather than inventing an answer.
