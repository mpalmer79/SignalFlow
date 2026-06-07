import type { KnowledgeEntry, StarterQuestion } from "./types";

// The local knowledge base for the project assistant. Every answer is curated
// from this repository: the README, the docs folder, and the implementation.
// There is no model, no network, and no external data. Answers stay demo safe
// and never imply real sending, real customers, or live integrations.

export const FALLBACK_ANSWER =
  "I can only answer questions about the SignalFlow project from local repository knowledge. I do not have that in my notes. Try asking what SignalFlow does, what is real versus simulated, how it shows AI governance, how it is tested, or how a hiring manager should review it.";

export const DEMO_SAFE_LABEL = "Local project knowledge only.";

export const FALLBACK_SOURCES = ["README.md", "docs/REVIEWER_EXPERIENCE.md"];

export const EMPTY_STATE =
  "Ask me about the SignalFlow project. I answer from local repository knowledge only: what the product does, what is real versus simulated, the guided demo, AI governance, provider safety, the architecture, testing, and how recruiters and hiring managers should review it. No external calls, no real customer data.";

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "purpose",
    question: "What does SignalFlow do?",
    answer:
      "SignalFlow is a demo-safe revenue operating system concept. It shows how customer signals can be captured, scored for intent, routed through governed AI recommendations, reviewed by a human, simulated into consent-aware follow-up, and tied to simulated revenue attribution. The framing is that a CRM is a system of record while SignalFlow is a system of action: it reads signals, applies policy, and orchestrates the next best action with consent and compliance at the center.",
    keywords: ["do", "purpose", "about", "product", "what", "signalflow", "goal"],
    aliases: [
      "what does signalflow do",
      "what is signalflow",
      "what does the project do",
      "what is this project",
      "what is the product",
      "explain signalflow",
    ],
    sources: ["README.md", "docs/PORTFOLIO_SUMMARY.md"],
    relatedIds: ["different-from-chatbot", "simulated", "business-problem"],
  },
  {
    id: "simulated",
    question: "What is real and what is simulated?",
    answer:
      "Everything that would touch the outside world is simulated. There are no live SMS, email, or voice messages, no AI provider calls, no real CRM, and no real customer data. Signals, intelligence scores, AI recommendations, workflows, voice plans, outcomes, and revenue attribution are all produced by deterministic engines and internal mock providers, so the same inputs always produce the same outputs. The architecture, data model, and governance are real, but nothing is ever sent.",
    keywords: [
      "simulated",
      "simulation",
      "fake",
      "mock",
      "real",
      "demo",
      "safe",
      "deterministic",
      "live",
    ],
    aliases: [
      "what is simulated",
      "what is simulated in this demo",
      "what is real and what is simulated",
      "is this real",
      "is anything real",
      "what is fake",
      "is this demo safe",
      "what is mocked",
    ],
    sources: ["docs/PROOF_OF_WORK.md", "README.md"],
    relatedIds: ["demo-safe-meaning", "channels", "guard-live-provider"],
  },
  {
    id: "demo",
    question: "How does the 60-second demo work?",
    answer:
      "The 60-second demo at /demo is a guided, deterministic walkthrough. It auto-advances through six stages every five seconds: signal detected, intent scored, governed recommendation, human review, simulated workflow, and revenue attribution. You can pause, resume, restart, step with Previous and Next, and pick a stage manually. The human review stage is interactive: approve to continue the high intent path, or reject to see the safe alternate path. No data leaves the app.",
    keywords: ["demo", "60", "second", "walkthrough", "stages", "guided", "tour", "replay"],
    aliases: [
      "how does the 60 second demo work",
      "how does the demo work",
      "what is the 60 second demo",
      "tell me about the demo",
      "explain the demo",
      "sixty second demo",
    ],
    sources: ["docs/REVIEWER_EXPERIENCE.md"],
    relatedIds: ["governance", "simulated", "verticals"],
  },
  {
    id: "kpi-drilldown",
    question: "How do the Revenue Command Center KPI drill-downs work?",
    answer:
      "On /revenue-command-center, every KPI card across the three sections (Today on SignalFlow, Executive summary, and Revenue lifecycle) is clickable and opens a drill-down modal. Each modal explains the selected metric and shows a breakdown that reconciles exactly to the displayed number or dollar value, because the breakdown rows are split from that value with a deterministic helper. The data is mock and demo safe, with a period label and a simulated-data note. There are no external calls and no real customer data.",
    keywords: [
      "kpi",
      "drill",
      "drilldown",
      "drill-down",
      "card",
      "cards",
      "modal",
      "modals",
      "metric",
      "metrics",
      "command",
      "center",
      "revenue",
      "breakdown",
    ],
    aliases: [
      "how do the revenue command center kpi drill-downs work",
      "how do the kpi drill downs work",
      "how do the kpi cards work",
      "what are the kpi drilldowns",
      "explain the kpi modals",
      "revenue command center cards",
      "kpi drill down",
    ],
    sources: ["docs/REVENUE_ENGINE.md"],
    relatedIds: ["kpi-implementation", "revenue"],
  },
  {
    id: "kpi-implementation",
    question: "How are the KPI drill-downs built?",
    answer:
      "The KPI drill-downs are deterministic and data driven. lib/revenue/kpi-drilldown.ts builds typed entries across the three sections from the same figures the cards show, and a splitTotal helper divides each headline value into breakdown rows that always sum back to it. components/revenue/kpi-card-grid.tsx renders each card as an accessible button with hover, focus ring, and a View details affordance. components/revenue/kpi-drilldown-modal.tsx is one shared dialog with a close button, Escape to close, backdrop click to close, focus trapping, and body scroll lock. It is responsive, becoming a bottom sheet on mobile.",
    keywords: [
      "kpi",
      "implementation",
      "built",
      "code",
      "splittotal",
      "reconcile",
      "accessibility",
      "modal",
      "grid",
      "file",
      "files",
    ],
    aliases: [
      "how are the kpi drill downs built",
      "how is the kpi drilldown implemented",
      "kpi drilldown code",
      "kpi accessibility",
      "what files power the kpi cards",
    ],
    sources: ["docs/ENGINEERING_QUALITY.md", "docs/REVENUE_ENGINE.md"],
    relatedIds: ["kpi-drilldown", "testing"],
  },
  {
    id: "governance",
    question: "What parts of the project show AI governance?",
    answer:
      "AI governance runs through the whole flow. Recommendations are deterministic and arrive with a confidence score and a full explanation, plus consent, policy, and quiet-hours checks attached before anything can happen. A human review queue approves, rejects, or escalates, and the AI never acts on its own. A consent and compliance policy layer gates every simulated action, and an audit trail records each decision organization by organization. The Review Queue, the AI Center, and the policy checks in the demo all show this.",
    keywords: [
      "governance",
      "governed",
      "review",
      "human",
      "consent",
      "policy",
      "compliance",
      "audit",
      "evidence",
      "ai",
      "explanation",
      "oversight",
    ],
    aliases: [
      "what parts of the project show ai governance",
      "how is ai governed",
      "ai governance",
      "how does human review work",
      "is the ai reviewed",
      "what governs the ai",
    ],
    sources: ["docs/AI_PLATFORM.md", "docs/REVIEW_QUEUE.md"],
    relatedIds: ["staff-level", "provider-governance", "simulated"],
  },
  {
    id: "crm",
    question: "Is this connected to a real CRM?",
    answer:
      "No. The project uses deterministic mock data only. CRM tasks, workflows, recommendations, and revenue attribution are simulated so the demo can show the product concept without sending real messages or touching real customer systems. Provider Management lists where live integrations could plug in, but nothing is connected.",
    keywords: ["crm", "salesforce", "hubspot", "integration", "integrations", "connected", "provider", "providers"],
    aliases: [
      "is this connected to a real crm",
      "is there a real crm",
      "does it use a real crm",
      "are there real integrations",
      "is this connected to anything",
    ],
    sources: ["docs/PROVIDER_MANAGEMENT.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["guard-real-data", "provider-governance", "channels"],
  },
  {
    id: "channels",
    question: "Does it send real SMS, email, or voice?",
    answer:
      "No. SMS, email, and voice are simulated only. The voice command center generates plans and transcripts deterministically and a compliance check runs before any call is simulated, but no call is placed and no provider is contacted. Nothing is ever sent to a real person.",
    keywords: ["sms", "email", "voice", "call", "calls", "text", "message", "send", "outbound", "twilio"],
    aliases: [
      "does it send real sms",
      "does it send email",
      "does it make calls",
      "is voice real",
      "are messages sent",
      "does it send messages",
    ],
    sources: ["docs/VOICE_PLATFORM.md", "docs/PROVIDER_MANAGEMENT.md"],
    relatedIds: ["guard-live-provider", "guard-real-message", "simulated"],
  },
  {
    id: "architecture",
    question: "How is the project built?",
    answer:
      "SignalFlow is a Next.js App Router app in TypeScript with Prisma and Tailwind. It follows a page to service to repository to Prisma layering, and the engines under lib are pure functions with no React, Prisma, or provider imports, which is what makes scenarios deterministic. It is multi-tenant and organization scoped. A safety scan and an architecture boundary check guard the demo-safe rules in CI.",
    keywords: [
      "architecture",
      "built",
      "stack",
      "tech",
      "nextjs",
      "next",
      "typescript",
      "prisma",
      "tailwind",
      "structure",
      "engineering",
      "layers",
    ],
    aliases: [
      "how is the project built",
      "what is the tech stack",
      "what technology is used",
      "how is it structured",
      "what is the architecture",
      "what framework",
    ],
    sources: ["docs/TECHNICAL_HIGHLIGHTS.md", "README.md"],
    relatedIds: ["staff-level", "testing", "tenant-safety"],
  },
  {
    id: "design",
    question: "What is the design system?",
    answer:
      "SignalFlow uses a light enterprise design direction: an off-white canvas, deep-navy ink, the primary blue 2563EB, and Geist and Geist Mono typography, with selective navy accents for command-center depth. The homepage carries a soft ambient scroll wash. The design tokens are consumed by the production app through Tailwind.",
    keywords: ["design", "system", "color", "colors", "palette", "font", "fonts", "geist", "blue", "theme", "ui", "brand"],
    aliases: [
      "what is the design system",
      "what does it look like",
      "what colors are used",
      "what fonts",
      "tell me about the design",
      "what is the theme",
    ],
    sources: ["README.md"],
    relatedIds: ["architecture"],
  },
  {
    id: "intelligence",
    question: "How are signals scored?",
    answer:
      "Signals feed a deterministic customer intelligence graph. Each customer gets intent, opportunity, and engagement scores computed from a centralized configuration, so the scoring is explainable rather than a black box. The scores drive priority and the next best action, and the evidence behind a score is shown alongside it.",
    keywords: ["score", "scored", "scoring", "intent", "intelligence", "graph", "opportunity", "engagement", "signals"],
    aliases: [
      "how are signals scored",
      "how does intent scoring work",
      "what is the intelligence graph",
      "how is intent calculated",
      "how does scoring work",
    ],
    sources: ["docs/AI_PLATFORM.md"],
    relatedIds: ["governance", "revenue"],
  },
  {
    id: "revenue",
    question: "How is revenue attributed?",
    answer:
      "Revenue attribution is simulated and deterministic. When a simulated workflow produces a positive outcome, the system attributes influenced revenue to the contributing opportunity with a source signal and an attribution note, and records it in the audit trail. The Revenue Command Center shows influenced, recovered, and missed revenue, all as demo estimates with no real money involved.",
    keywords: ["revenue", "attribution", "attributed", "influenced", "missed", "money", "dollars", "outcome", "recovered"],
    aliases: [
      "how is revenue attributed",
      "how does revenue attribution work",
      "is the revenue real",
      "what is influenced revenue",
      "how is revenue calculated",
    ],
    sources: ["docs/REVENUE_ENGINE.md"],
    relatedIds: ["kpi-drilldown", "governance"],
  },
  {
    id: "audience",
    question: "Who is this project for?",
    answer:
      "It is a portfolio project built to be understood quickly by reviewers, recruiters, and technical visitors. The recommended path is to run the 60-second demo, then explore the Revenue Command Center, AI Center, Review Queue, and Executive Insights. The docs include a reviewer experience guide for a fast tour.",
    keywords: ["who", "for", "audience", "reviewer", "reviewers", "recruiter", "recruiters", "portfolio", "visitor"],
    aliases: [
      "who is this project for",
      "who is this for",
      "who built this",
      "is this a portfolio project",
      "who is the audience",
    ],
    sources: ["docs/REVIEWER_EXPERIENCE.md", "docs/PORTFOLIO_SUMMARY.md"],
    relatedIds: ["recruiter-review", "hiring-manager-review", "roles-supported"],
  },
  {
    id: "privacy",
    question: "Does the assistant use external services?",
    answer:
      "No. This assistant answers only from a local knowledge base bundled in the repository. It makes no network calls, uses no model provider, runs no embeddings or vector database, stores no data, and reads no real customer information. If a question is outside the project, it says so honestly.",
    keywords: ["assistant", "chatbot", "external", "api", "model", "openai", "anthropic", "gemini", "network", "privacy", "local"],
    aliases: [
      "does the assistant use external services",
      "how does the chatbot work",
      "does the chatbot call an api",
      "is the assistant ai",
      "what powers this chatbot",
    ],
    sources: ["docs/PROJECT_ASSISTANT.md", "README.md"],
    relatedIds: ["guard-live-provider", "demo-safe-meaning"],
  },

  // Safety guard entries. These correct questions that imply false live
  // behavior. They are matched directly and also selected by the safety-intent
  // layer when a false premise is detected.
  {
    id: "guard-live-provider",
    question: "Does SignalFlow use live providers like OpenAI, Twilio, or SendGrid?",
    answer:
      "No. SignalFlow makes no live calls to any provider. OpenAI, Anthropic, Gemini, Azure OpenAI, OpenAI Realtime, ElevenLabs, Twilio, Retell, Vapi, and SendGrid appear in the provider registry as future-ready entries only. The active implementation uses internal deterministic mock providers for AI, voice, SMS, and email, so nothing is ever sent or called. Provider Management shows where a live integration would plug in behind feature flags and readiness checks.",
    keywords: [
      "openai",
      "anthropic",
      "gemini",
      "twilio",
      "sendgrid",
      "elevenlabs",
      "retell",
      "vapi",
      "realtime",
      "provider",
      "live",
      "integrate",
      "integrated",
      "connected",
      "api",
    ],
    aliases: [
      "does signalflow actually use openai voice",
      "does it use openai",
      "is this connected to twilio or sendgrid",
      "does it call openai",
      "how did you integrate openai",
      "does twilio send the sms",
      "is it connected to twilio",
      "does it use live providers",
      "does it really call a provider",
    ],
    sources: ["docs/PROVIDER_MANAGEMENT.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["provider-governance", "openai-later", "twilio-sendgrid-later"],
  },
  {
    id: "guard-secret",
    question: "Where are the provider API keys or secrets?",
    answer:
      "There are none. SignalFlow stores no provider keys, secrets, or credentials, and the safety scan fails the build if a real secret name appears in the code. Because every provider is simulated by internal mock providers, no key is needed to run the demo. In a future production build, live credentials would live in managed secret storage, gated by feature flags, readiness checks, compliance approval, and audit trails, never committed to the repository.",
    keywords: ["secret", "secrets", "key", "keys", "api", "token", "credential", "credentials", "env", "password"],
    aliases: [
      "where is the sendgrid api key",
      "where are the api keys",
      "where is the secret",
      "what is the api key",
      "where do i put my key",
      "where are the credentials",
    ],
    sources: ["docs/PROOF_OF_WORK.md", "docs/PROVIDER_MANAGEMENT.md"],
    relatedIds: ["guard-live-provider", "provider-governance", "before-production"],
  },
  {
    id: "guard-real-data",
    question: "Can I connect my real CRM or use real customer data?",
    answer:
      "No. SignalFlow uses deterministic synthetic data only and never touches real customer systems. You cannot connect a real CRM or load real customer records, because the demo is intentionally network isolated and demo safe. The data model and multi-tenant patterns are real, but every customer, signal, and opportunity is generated, so nothing private is ever stored or exposed.",
    keywords: ["real", "customer", "data", "crm", "leads", "records", "dealership", "store", "private"],
    aliases: [
      "can i enter my real crm data",
      "does it use real customer data",
      "can i connect this to my dealership crm",
      "does it store real leads",
      "can i connect my crm",
      "is the customer data real",
      "can i use real data",
    ],
    sources: ["docs/MULTI_TENANCY.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["tenant-safety", "simulated", "guard-real-message"],
  },
  {
    id: "guard-real-message",
    question: "Can it call, text, or email a real person?",
    answer:
      "No. SignalFlow places no real calls and sends no real SMS or email. Voice, SMS, and email are simulated by deterministic mock providers, and a compliance check runs before any voice call is simulated, but no message ever reaches a real person. The point is to show governed follow-up safely, not to contact anyone.",
    keywords: ["call", "calls", "text", "sms", "email", "message", "patient", "patients", "customers", "send", "outbound", "dial"],
    aliases: [
      "does it call customers",
      "can it text real leads",
      "can this email patients",
      "can this call a real patient",
      "does it call a real patient",
      "can it call a real person",
      "does it send real messages",
    ],
    sources: ["docs/VOICE_PLATFORM.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["channels", "governance", "simulated"],
  },

  // Recruiter and hiring-manager knowledge pack. Concise, professional, honest,
  // and never overclaiming live integration or production readiness.
  {
    id: "why-built",
    question: "Why did you build SignalFlow?",
    answer:
      "SignalFlow was built to show end to end AI application architecture, not just a UI. It demonstrates how a revenue team turns a customer signal into a governed, auditable action: signal capture, deterministic scoring, governed AI recommendations, human review, consent-aware follow-up, and revenue attribution. The goal was a production-shaped proof of work that is honest about being demo safe, with no live integrations.",
    keywords: ["why", "build", "built", "motivation", "reason", "goal"],
    aliases: [
      "why did you build signalflow",
      "why build this",
      "what was the motivation",
      "why does this exist",
      "why did you make this",
    ],
    sources: ["docs/PORTFOLIO_SUMMARY.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["business-problem", "different-from-chatbot", "staff-level"],
  },
  {
    id: "different-from-chatbot",
    question: "What makes this different from a chatbot?",
    answer:
      "A chatbot answers messages. SignalFlow models a whole revenue system: it captures customer signals, scores intent and opportunity, generates governed AI recommendations with confidence and explanations, routes sensitive decisions through human review, applies a consent and compliance policy layer, simulates multi-channel and voice follow-up, records outcomes, and attributes revenue, all with an audit trail and multi-tenant scoping. The intelligence is in the architecture and governance, not in a single chat reply.",
    keywords: ["different", "chatbot", "bot", "more", "than", "beyond", "unique", "difference"],
    aliases: [
      "what makes this different from a chatbot",
      "what makes signalflow different from a chatbot",
      "what makes this more than a chatbot",
      "how is this different from a chatbot",
      "is this just a chatbot",
      "why is this not a chatbot",
    ],
    sources: ["docs/TECHNICAL_HIGHLIGHTS.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["staff-level", "governance", "business-problem"],
  },
  {
    id: "staff-level",
    question: "What parts show staff-level thinking?",
    answer:
      "The staff-level signals are structural: enforced architecture boundaries checked in CI, pure deterministic engines with no framework imports, a provider governance layer with feature flags and readiness checks, human-in-the-loop review for sensitive actions, multi-tenant organization scoping, an end to end audit trail, a deterministic test suite, and an explicit, honest line between what is demo safe today and what production would require. The discipline is in the seams and the guardrails, not just the features.",
    keywords: ["staff", "senior", "level", "thinking", "engineering", "quality", "discipline", "seams"],
    aliases: [
      "what parts show staff level thinking",
      "how does this show staff level thinking",
      "what shows senior engineering",
      "how is this staff level",
      "what makes this senior level",
    ],
    sources: ["docs/TECHNICAL_HIGHLIGHTS.md", "docs/ENGINEERING_QUALITY.md"],
    relatedIds: ["architecture", "provider-governance", "testing"],
  },
  {
    id: "roles-supported",
    question: "What roles does this project support?",
    answer:
      "SignalFlow is strongest as evidence for roles in AI workflow systems, full-stack product engineering, solutions and implementation architecture, technical product work, and governed AI applications. It shows product thinking, domain modeling, deterministic AI simulation, human review governance, provider safety, multi-tenancy, and CI-backed quality.",
    keywords: ["role", "roles", "jobs", "position", "positions", "fit", "career"],
    aliases: [
      "what roles does this project support",
      "what jobs is this good for",
      "what roles is this for",
      "what positions does this fit",
      "who should hire from this",
    ],
    sources: ["docs/PORTFOLIO_SUMMARY.md", "README.md"],
    relatedIds: ["recruiter-review", "hiring-manager-review", "staff-level"],
  },
  {
    id: "production-ready",
    question: "What is production-ready and what is not?",
    answer:
      "Production-shaped and real: the TypeScript and Next.js application, the Prisma and PostgreSQL data model, the repository and service layering, the deterministic engines, multi-tenant scoping, the role based access model, the AI governance and human review workflows, the provider registry, the safety and architecture scans, the tests, and the CI pipeline. Not production: there are no live provider integrations, no real sending, no real customer data, and no live secrets. Those are deliberate demo-safe boundaries, not missing pieces of the architecture.",
    keywords: ["production", "ready", "complete", "mature", "deploy", "deployable"],
    aliases: [
      "what is production ready and what is not",
      "what is production ready",
      "is this production ready",
      "is it production ready",
      "what is not production ready",
      "how production ready is this",
    ],
    sources: ["docs/PROOF_OF_WORK.md", "docs/TECHNICAL_DEBT_REGISTER.md"],
    relatedIds: ["before-production", "limits", "demo-safe-meaning"],
  },
  {
    id: "before-production",
    question: "What would you add before production?",
    answer:
      "Before production I would implement real provider adapters behind the existing feature-flag and readiness framework, add a test database in CI to cover services and repositories end to end, add server-side caching or precomputed snapshots for the heavy dashboard reads, define and test a deployment-specific Content-Security-Policy, and upgrade the web framework to clear the current dependency advisories. The seams for all of this already exist, which is the point.",
    keywords: ["before", "production", "add", "next", "missing", "todo", "future", "improve", "roadmap"],
    aliases: [
      "what would you add before production",
      "what is needed for production",
      "what would you do next",
      "what is missing for production",
      "what comes before production",
    ],
    sources: ["docs/TECHNICAL_DEBT_REGISTER.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["production-ready", "openai-later", "limits"],
  },
  {
    id: "openai-later",
    question: "How would OpenAI be integrated later?",
    answer:
      "Later, an OpenAI adapter would sit behind the provider registry as one capability implementation, never called directly from a page or engine. It would be gated by a feature flag, pass a readiness check, require compliance approval, read its credentials from managed secret storage, and write an audit event for every call. Today that path is intentionally inactive and OpenAI is a future-ready registry entry, with deterministic mock providers doing the work.",
    keywords: ["openai", "integrate", "integration", "later", "future", "add", "gpt", "model", "adapter"],
    aliases: [
      "how would openai be integrated later",
      "how would you add openai",
      "how would you integrate openai",
      "how would openai work",
      "adding openai later",
      "how to add openai",
    ],
    sources: ["docs/PROVIDER_MANAGEMENT.md", "docs/AI_PLATFORM.md"],
    relatedIds: ["guard-live-provider", "provider-governance", "twilio-sendgrid-later"],
  },
  {
    id: "twilio-sendgrid-later",
    question: "How would Twilio or SendGrid be integrated later?",
    answer:
      "Twilio for SMS or voice and SendGrid for email would each be added as a provider adapter behind the registry, selected only when a live feature flag is enabled and a readiness check passes. Credentials would come from managed secret storage, every send would be audited, and the consent and compliance policy layer would still gate the action. Today both are future-ready registry entries and all SMS, voice, and email are handled by internal mock providers.",
    keywords: ["twilio", "sendgrid", "sms", "email", "voice", "integrate", "integration", "later", "future", "adapter"],
    aliases: [
      "how would twilio or sendgrid be integrated later",
      "how would you add twilio",
      "how would you integrate sendgrid",
      "adding twilio later",
      "how would twilio work",
      "how to add sendgrid",
    ],
    sources: ["docs/PROVIDER_MANAGEMENT.md", "docs/VOICE_PLATFORM.md"],
    relatedIds: ["guard-live-provider", "provider-governance", "openai-later"],
  },
  {
    id: "tenant-safety",
    question: "How is tenant safety handled?",
    answer:
      "Every data access is organization scoped. The organization id always comes from the resolved server context, never from the client, and a guard makes that requirement explicit so one tenant cannot read another tenant's data. Repositories own all database access and pages never query directly, which keeps the scoping in one place. There is a deterministic test that proves the organization context is required and preserved.",
    keywords: ["tenant", "tenancy", "multitenancy", "organization", "org", "isolation", "scope", "scoped"],
    aliases: [
      "how is tenant safety handled",
      "how is multi tenancy handled",
      "how is tenant isolation done",
      "how do you handle tenants",
      "how is organization scoping done",
      "is tenant data isolated",
    ],
    sources: ["docs/MULTI_TENANCY.md", "docs/AUTHORIZATION.md"],
    relatedIds: ["architecture", "testing", "staff-level"],
  },
  {
    id: "testing",
    question: "How is this tested?",
    answer:
      "SignalFlow uses a Vitest suite that proves business behavior, not snapshots: deterministic engine outputs, AI governance and review gating, provider selection in demo mode, revenue attribution categories, tenant isolation, and the project assistant. CI also runs typecheck, lint, a safety scan that bans SDKs and secrets, an architecture boundary check, a dependency audit, Prisma validation, and the production build on every push and pull request.",
    keywords: ["test", "tested", "testing", "tests", "vitest", "ci", "coverage", "quality", "pipeline"],
    aliases: [
      "how is this tested",
      "how do you test this",
      "what tests are there",
      "how is testing done",
      "what is the test suite",
      "how is ci set up",
    ],
    sources: ["docs/ENGINEERING_QUALITY.md", "README.md"],
    relatedIds: ["staff-level", "kpi-implementation", "provider-governance"],
  },
  {
    id: "hardest-decision",
    question: "What was the hardest technical decision?",
    answer:
      "The hardest decision was committing to strict determinism and demo safety instead of wiring a real model or provider for a quick effect. Keeping engines pure, enforcing layer boundaries in CI, and modeling providers as future-ready entries took more discipline, but it made the system explainable, testable, and honest. The payoff is that the same input always produces the same output and nothing can quietly call out to the network.",
    keywords: ["hardest", "difficult", "decision", "challenge", "tradeoff", "tradeoffs", "tough", "choice"],
    aliases: [
      "what was the hardest technical decision",
      "what was the hardest part",
      "what was the toughest decision",
      "what was a hard tradeoff",
      "what was challenging",
    ],
    sources: ["docs/TECHNICAL_HIGHLIGHTS.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["deterministic-meaning", "staff-level", "provider-governance"],
  },
  {
    id: "most-proud",
    question: "What part of the project are you most proud of?",
    answer:
      "The provider governance and safety story. External providers are fully modeled in a registry with feature flags and readiness checks, yet demo mode selects only internal mock providers, and a safety scan plus an architecture check enforce that mechanically in CI. It shows how to design for real integrations while staying completely safe to run, a pattern that holds up in enterprise systems.",
    keywords: ["proud", "favorite", "best", "highlight", "strongest", "like"],
    aliases: [
      "what part of the project are you most proud of",
      "what are you most proud of",
      "what is the best part",
      "what is your favorite part",
      "what is the strongest part",
    ],
    sources: ["docs/PROVIDER_MANAGEMENT.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["provider-governance", "staff-level", "governance"],
  },
  {
    id: "recruiter-review",
    question: "How should a recruiter review this quickly?",
    answer:
      "Start with docs/PROOF_OF_WORK.md for what is real versus simulated, then run the 60-second demo from the landing page, then skim docs/PORTFOLIO_SUMMARY.md and docs/TECHNICAL_HIGHLIGHTS.md. That path shows the product thinking, the governance, and the engineering quality in a few minutes without needing to read code.",
    keywords: ["recruiter", "review", "quick", "quickly", "fast", "skim", "start"],
    aliases: [
      "how should a recruiter review this quickly",
      "how should a recruiter review this",
      "how do i review this as a recruiter",
      "what should a recruiter look at",
      "recruiter quick review",
    ],
    sources: ["docs/REVIEWER_EXPERIENCE.md", "docs/PORTFOLIO_SUMMARY.md"],
    relatedIds: ["hiring-manager-review", "audience", "production-ready"],
  },
  {
    id: "hiring-manager-review",
    question: "How should a hiring manager review this?",
    answer:
      "Read the layering: pages call services, services compose logic, repositories own data access, and pure engines hold deterministic domain logic. Then run the architecture boundary check and the safety scan to see the guarantees are mechanical, look at the tests for proven behavior, and review the provider governance and human review flows. docs/TECHNICAL_DEBT_REGISTER.md shows an honest split between portfolio readiness and production readiness.",
    keywords: ["hiring", "manager", "review", "technical", "technically", "inspect", "evaluate", "deep"],
    aliases: [
      "how should a hiring manager review this",
      "how should a hiring manager review this technically",
      "how do i evaluate this technically",
      "what should a hiring manager inspect",
      "hiring manager technical review",
    ],
    sources: ["docs/TECHNICAL_HIGHLIGHTS.md", "docs/ENGINEERING_QUALITY.md"],
    relatedIds: ["recruiter-review", "staff-level", "testing"],
  },
  {
    id: "provider-governance",
    question: "What is the provider governance layer?",
    answer:
      "The provider governance layer is how SignalFlow models real integrations without enabling them. A registry describes every provider and its capabilities, feature flags decide whether a live path is even eligible, readiness checks verify configuration and compliance, and a selection engine resolves a provider for each capability. In demo mode every live flag is blocked, so the selection engine always returns an internal mock provider, and provider checks are recorded in the audit trail.",
    keywords: ["provider", "governance", "registry", "feature", "flag", "flags", "readiness", "selection", "capability", "capabilities"],
    aliases: [
      "what is the provider governance layer",
      "how does provider governance work",
      "what is provider governance",
      "how are providers governed",
      "what is the provider registry",
    ],
    sources: ["docs/PROVIDER_MANAGEMENT.md", "docs/PROVIDER_SANDBOX.md"],
    relatedIds: ["guard-live-provider", "openai-later", "most-proud"],
  },
  {
    id: "demo-safe-meaning",
    question: "What does demo-safe mean?",
    answer:
      "Demo safe means the project is built to run with no risk of real-world side effects. There are no live SMS, email, or voice, no AI provider calls, no provider SDKs installed, no outbound network calls, no real secrets, and no real customer data. Internal mock providers do the work, and repository scans verify these boundaries on every build.",
    keywords: ["demo", "safe", "safety", "sandbox", "isolated"],
    aliases: [
      "what does demo safe mean",
      "what is demo safe",
      "what does demo-safe mean",
      "define demo safe",
      "what do you mean by demo safe",
    ],
    sources: ["docs/PROOF_OF_WORK.md", "README.md"],
    relatedIds: ["simulated", "deterministic-meaning", "guard-live-provider"],
  },
  {
    id: "deterministic-meaning",
    question: "What does deterministic mean in this project?",
    answer:
      "Deterministic means the same input always produces the same output, with no randomness and no model calls. The domain engines are pure functions, synthetic data is generated from fixed seeds, and scoring, recommendations, workflows, and revenue attribution all follow fixed rules. That makes every scenario repeatable, explainable, and testable.",
    keywords: ["deterministic", "determinism", "repeatable", "random", "seed", "seeds"],
    aliases: [
      "what does deterministic mean in this project",
      "what does deterministic mean",
      "what is deterministic",
      "define deterministic",
      "why is it deterministic",
    ],
    sources: ["docs/PROOF_OF_WORK.md", "docs/TECHNICAL_HIGHLIGHTS.md"],
    relatedIds: ["demo-safe-meaning", "simulated", "intelligence"],
  },
  {
    id: "business-problem",
    question: "What business problem does SignalFlow solve?",
    answer:
      "Revenue teams lose money in the gap between a customer signal and an action. A trade-in request, a missed call, an overdue recall, or a policy review arrives, and nothing happens until a person remembers to follow up. SignalFlow shows how to close that gap with an AI-native workflow that detects intent, applies policy, routes sensitive decisions through human review, simulates follow-up, and attributes the outcome, while a traditional CRM mostly waits for a human.",
    keywords: ["business", "problem", "solve", "solves", "value", "gap"],
    aliases: [
      "what business problem does signalflow solve",
      "what problem does this solve",
      "what is the business problem",
      "why does this matter",
      "what problem does signalflow solve",
    ],
    sources: ["README.md", "docs/PORTFOLIO_SUMMARY.md"],
    relatedIds: ["purpose", "different-from-chatbot", "verticals"],
  },
  {
    id: "verticals",
    question: "How does the project connect to automotive, dental, and insurance?",
    answer:
      "Vertical packs adapt the same engines to different industries. Automotive retail turns trade-ins and inventory views into booked test drives, a dental office reactivates overdue recalls and converts treatment plans with elevated health-info sensitivity, and a local life insurance agency works referrals and expands coverage in an existing book. Each is a deterministic scenario that walks the full signal to revenue lifecycle for that vertical.",
    keywords: ["vertical", "verticals", "automotive", "dental", "insurance", "industry", "industries", "scenario", "scenarios", "pack"],
    aliases: [
      "how does the project connect to automotive dental and insurance",
      "what verticals are supported",
      "how does it work for automotive",
      "what industries does this cover",
      "how does it apply to dental or insurance",
    ],
    sources: ["docs/PORTFOLIO_SUMMARY.md", "docs/REVIEWER_EXPERIENCE.md"],
    relatedIds: ["purpose", "business-problem", "demo"],
  },
  {
    id: "limits",
    question: "What are the limits of the project?",
    answer:
      "The honest limits are deliberate. There are no live provider integrations, so nothing is actually sent or called. Test coverage focuses on the pure engines and service composition rather than a live database. There is no server-side caching yet for the heavier reads, and there is no Content-Security-Policy until it can be tested against a real deployment. These are tracked openly in the technical debt register, separated from true production readiness.",
    keywords: ["limit", "limits", "limitation", "limitations", "weakness", "weaknesses", "gaps", "constraints"],
    aliases: [
      "what are the limits of the project",
      "what are the limitations",
      "what are the weaknesses",
      "what does it not do",
      "what are the gaps",
      "what are the constraints",
    ],
    sources: ["docs/TECHNICAL_DEBT_REGISTER.md", "docs/PROOF_OF_WORK.md"],
    relatedIds: ["before-production", "production-ready", "demo-safe-meaning"],
  },
];

export const STARTER_QUESTIONS: StarterQuestion[] = [
  { label: "What does SignalFlow do?", entryId: "purpose" },
  { label: "What makes this different from a chatbot?", entryId: "different-from-chatbot" },
  { label: "What is real and what is simulated?", entryId: "simulated" },
  { label: "How should a hiring manager review this?", entryId: "hiring-manager-review" },
  { label: "What parts show AI governance?", entryId: "governance" },
];

export function getEntryById(id: string): KnowledgeEntry | null {
  return KNOWLEDGE.find((entry) => entry.id === id) ?? null;
}
