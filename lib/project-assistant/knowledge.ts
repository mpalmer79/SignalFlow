import type { KnowledgeEntry, StarterQuestion } from "./types";

// The local knowledge base for the project assistant. Every answer is curated
// from this repository: README files, the design system docs, the demo and
// revenue command center copy, and the KPI drill-down implementation. There is
// no model, no network, and no external data. Answers stay demo safe and never
// imply real sending, real customers, or live integrations.

export const FALLBACK_ANSWER =
  "I can only answer questions about the SignalFlow project. I do not have that information in the local project knowledge. Try asking about what SignalFlow does, what is simulated, the 60-second demo, the Revenue Command Center KPI drill-downs, or how the project shows AI governance.";

export const DEMO_SAFE_LABEL = "Project assistant: local knowledge only.";

export const EMPTY_STATE =
  "Ask me about the SignalFlow project. I answer from local repository knowledge only: what the product does, what is simulated, the guided demo, the Revenue Command Center KPI drill-downs, AI governance, the architecture, and the design system. No external calls, no real customer data.";

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
  },
  {
    id: "simulated",
    question: "What is simulated in this demo?",
    answer:
      "Everything that would touch the outside world is simulated. There are no live SMS, email, or voice messages, no AI provider calls, no real CRM, and no real customer data. Signals, intelligence scores, AI recommendations, workflows, voice plans, outcomes, and revenue attribution are all produced by deterministic engines and internal mock providers, so the same inputs always produce the same outputs. Nothing is ever sent.",
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
      "is this real",
      "is anything real",
      "what is fake",
      "is this demo safe",
      "what is mocked",
    ],
  },
  {
    id: "demo",
    question: "How does the 60-second demo work?",
    answer:
      "The 60-second demo at /demo is a guided, deterministic walkthrough. It auto-advances through six stages every five seconds: signal detected, intent scored, governed recommendation, human review, simulated workflow, and revenue attribution. You can pause, resume, restart, step with Previous and Next, and pick a stage manually. The human review stage is interactive: approve to continue the high intent path, or reject to see the safe alternate path. Each stage change shows a soft transition. No data leaves the app.",
    keywords: ["demo", "60", "second", "walkthrough", "stages", "guided", "tour", "replay"],
    aliases: [
      "how does the 60 second demo work",
      "how does the demo work",
      "what is the 60 second demo",
      "tell me about the demo",
      "explain the demo",
      "sixty second demo",
    ],
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
  },
  {
    id: "kpi-implementation",
    question: "How are the KPI drill-downs built?",
    answer:
      "The KPI drill-downs are deterministic and data driven. lib/revenue/kpi-drilldown.ts builds 21 typed entries across the three sections from the same figures the cards show, and a splitTotal helper divides each headline value into breakdown rows that always sum back to it. components/revenue/kpi-card-grid.tsx renders each card as an accessible button with hover, focus ring, and a View details affordance. components/revenue/kpi-drilldown-modal.tsx is one shared dialog with a top-right close, a bottom Close button, Escape to close, backdrop click to close, focus trapping, and body scroll lock to avoid layout shift. It is responsive, becoming a bottom sheet on mobile.",
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
  },
  {
    id: "governance",
    question: "What parts of the project show AI governance?",
    answer:
      "AI governance runs through the whole flow. Recommendations are deterministic and arrive with a confidence score and a full explanation, plus consent, policy, and quiet-hours checks attached before anything can happen. A human review queue approves, rejects, or escalates, and the AI never acts on its own. A consent and compliance policy layer gates every simulated action, and an audit trail records each decision organization by organization. The Review Queue, the AI Center, the policy checks in the demo, and the evidence and governance chips on the KPI drill-downs all show this.",
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
  },
  {
    id: "crm",
    question: "Is this connected to a real CRM?",
    answer:
      "No. The project uses deterministic mock data only. CRM tasks, workflows, recommendations, and revenue attribution are simulated so the demo can show the product concept without sending real messages or touching real customer systems. Provider management lists where live integrations could plug in, but nothing is connected.",
    keywords: ["crm", "salesforce", "hubspot", "integration", "integrations", "connected", "provider", "providers"],
    aliases: [
      "is this connected to a real crm",
      "is there a real crm",
      "does it use a real crm",
      "are there real integrations",
      "is this connected to anything",
    ],
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
  },
  {
    id: "architecture",
    question: "How is the project built?",
    answer:
      "SignalFlow is a Next.js App Router app in TypeScript with Prisma and Tailwind. It follows a page to service to repository to Prisma layering, and the engines under lib are pure functions with no React, Prisma, or provider imports, which is what makes scenarios deterministic. It is multi-tenant and organization scoped. A safety scan and an architecture boundary check guard the demo-safe rules.",
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
  },
  {
    id: "design",
    question: "What is the design system?",
    answer:
      "SignalFlow uses a light enterprise design direction: an off-white canvas, deep-navy ink, the primary blue 2563EB, and Geist and Geist Mono typography, with selective navy accents for command-center depth. The homepage carries a soft ambient scroll wash. The design tokens and UI kits live under design-system, and the production app consumes the tokens through Tailwind.",
    keywords: ["design", "system", "color", "colors", "palette", "font", "fonts", "geist", "blue", "theme", "ui", "brand"],
    aliases: [
      "what is the design system",
      "what does it look like",
      "what colors are used",
      "what fonts",
      "tell me about the design",
      "what is the theme",
    ],
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
  },
  {
    id: "privacy",
    question: "Does the assistant use external services?",
    answer:
      "No. This assistant answers only from a local knowledge base bundled in the repository. It makes no network calls, uses no model provider, stores no data, and reads no real customer information. If a question is outside the project, it says so honestly.",
    keywords: ["assistant", "chatbot", "external", "api", "model", "openai", "anthropic", "gemini", "network", "privacy", "local"],
    aliases: [
      "does the assistant use external services",
      "how does the chatbot work",
      "does the chatbot call an api",
      "is the assistant ai",
      "what powers this chatbot",
    ],
  },
];

export const STARTER_QUESTIONS: StarterQuestion[] = [
  { label: "What does SignalFlow do?", entryId: "purpose" },
  { label: "What is simulated in this demo?", entryId: "simulated" },
  { label: "How does the 60-second demo work?", entryId: "demo" },
  {
    label: "How do the Revenue Command Center KPI drill-downs work?",
    entryId: "kpi-drilldown",
  },
  { label: "What parts of the project show AI governance?", entryId: "governance" },
];

export function getEntryById(id: string): KnowledgeEntry | null {
  return KNOWLEDGE.find((entry) => entry.id === id) ?? null;
}
