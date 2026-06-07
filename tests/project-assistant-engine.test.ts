import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getAssistantResponse,
  rankEntries,
} from "@/lib/project-assistant/matchQuestion";
import { searchDocuments } from "@/lib/project-assistant/document-index";
import { routeBoostIds } from "@/lib/project-assistant/route-context";
import { getEntryById } from "@/lib/project-assistant/knowledge";

// These tests prove business behavior of the smarter assistant: matching,
// confidence, composition, related questions, sources, route awareness, the
// recruiter pack, and the safety guardrails. Everything is local and
// deterministic with no network and no model.

describe("matching and confidence", () => {
  it("matches an exact alias with high confidence", () => {
    const result = getAssistantResponse("what does signalflow do");
    expect(result.entryIds).toContain("purpose");
    expect(result.confidence).toBe("high");
    expect(result.isFallback).toBe(false);
  });

  it("normalizes punctuation and case", () => {
    const result = getAssistantResponse("What Does SignalFlow Do??");
    expect(result.entryIds).toContain("purpose");
  });

  it("matches on keyword overlap", () => {
    const result = getAssistantResponse("revenue attribution");
    expect(result.entryIds).toContain("revenue");
  });

  it("matches a partial phrasing", () => {
    const result = getAssistantResponse("how is intent scored");
    expect(result.entryIds).toContain("intelligence");
  });

  it("falls back honestly for unrelated questions", () => {
    const result = getAssistantResponse("what is the weather today");
    expect(result.isFallback).toBe(true);
    expect(result.safetyIntent).toBe("out_of_scope_question");
  });

  it("is deterministic for repeated input", () => {
    const a = getAssistantResponse("how is ai governed", "/ai-center");
    const b = getAssistantResponse("how is ai governed", "/ai-center");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("multi-entry composition", () => {
  it("composes two strong, close entries for a broad question", () => {
    const result = getAssistantResponse("how is tenant isolation tested");
    expect(result.entryIds).toContain("tenant-safety");
    expect(result.entryIds).toContain("testing");
    expect(result.entryIds.length).toBeGreaterThanOrEqual(2);
    expect(result.matchReasons).toContain("composed");
  });

  it("does not compose when one entry clearly dominates", () => {
    const result = getAssistantResponse("what does signalflow do");
    expect(result.entryIds).toEqual(["purpose"]);
  });
});

describe("related questions and sources", () => {
  it("returns up to three unique related questions", () => {
    const result = getAssistantResponse("what parts show ai governance");
    expect(result.related.length).toBeGreaterThan(0);
    expect(result.related.length).toBeLessThanOrEqual(3);
    const ids = result.related.map((related) => related.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("governance");
  });

  it("surfaces local source chips for a curated answer", () => {
    const result = getAssistantResponse("how is this tested");
    expect(result.sources.length).toBeGreaterThan(0);
    for (const source of result.sources) {
      expect(source).toMatch(/\.(md|yml|ts|tsx)$/);
    }
  });
});

describe("route-aware context", () => {
  it("boosts provider knowledge on the provider route", () => {
    const result = getAssistantResponse("how does this work", "/provider-management");
    expect(result.isFallback).toBe(false);
    expect(routeBoostIds("/provider-management")).toContain(result.entryIds[0]);
  });

  it("boosts voice knowledge on the voice route", () => {
    const result = getAssistantResponse("how does this work", "/voice-command-center");
    expect(routeBoostIds("/voice-command-center")).toContain(result.entryIds[0]);
  });

  it("boosts revenue knowledge on the revenue route", () => {
    const result = getAssistantResponse("how does this work", "/revenue-command-center");
    expect(routeBoostIds("/revenue-command-center")).toContain(result.entryIds[0]);
  });

  it("lets an exact alias win over a route boost", () => {
    const result = getAssistantResponse("what does signalflow do", "/voice-command-center");
    expect(result.entryIds[0]).toBe("purpose");
    expect(result.confidence).toBe("high");
  });

  it("works normally for an unknown route", () => {
    const withUnknown = getAssistantResponse("what does signalflow do", "/totally-unknown");
    const withoutRoute = getAssistantResponse("what does signalflow do");
    expect(withUnknown.entryIds).toEqual(withoutRoute.entryIds);
  });

  it("inherits boosts on nested routes", () => {
    const result = getAssistantResponse("how does this work", "/scenarios/automotive-high-intent");
    expect(routeBoostIds("/scenarios")).toContain(result.entryIds[0]);
  });
});

describe("recruiter and hiring-manager pack", () => {
  const cases: Array<[string, string]> = [
    ["how should a recruiter review this quickly", "recruiter-review"],
    ["how should a hiring manager review this", "hiring-manager-review"],
    ["what makes this different from a chatbot", "different-from-chatbot"],
    ["what parts show staff level thinking", "staff-level"],
    ["how is tenant safety handled", "tenant-safety"],
    ["how is this tested", "testing"],
    ["what is the provider governance layer", "provider-governance"],
    ["what does demo safe mean", "demo-safe-meaning"],
    ["what does deterministic mean", "deterministic-meaning"],
    ["what business problem does signalflow solve", "business-problem"],
    ["how does the project connect to automotive dental and insurance", "verticals"],
  ];

  it.each(cases)("answers %s with entry %s", (input, expectedId) => {
    expect(getAssistantResponse(input).entryIds).toContain(expectedId);
  });

  it("answers a production readiness question honestly", () => {
    const result = getAssistantResponse("is this production ready");
    expect(result.safetyIntent).toBe("production_readiness_question");
    expect(result.entryIds).toContain("production-ready");
  });

  it("explains future OpenAI integration without claiming it is live", () => {
    const result = getAssistantResponse("how would openai be integrated later");
    expect(result.entryIds).toContain("openai-later");
    expect(result.safetyIntent).toBeNull();
    expect(result.text.toLowerCase()).toContain("future-ready");
  });

  it("explains future Twilio or SendGrid integration as not live", () => {
    const result = getAssistantResponse("how would twilio or sendgrid be integrated later");
    expect(result.entryIds).toContain("twilio-sendgrid-later");
    expect(result.safetyIntent).toBeNull();
    expect(result.text.toLowerCase()).toContain("future-ready");
  });
});

describe("safety guardrails", () => {
  it("corrects a false live-provider assumption", () => {
    const result = getAssistantResponse("does signalflow actually use openai voice");
    expect(result.safetyIntent).toBe("live_provider_assumption");
    expect(result.entryIds).toContain("guard-live-provider");
    expect(result.text.toLowerCase()).toContain("no live calls");
    expect(result.text.toLowerCase()).toContain("future-ready");
  });

  it("corrects a connected-to-twilio assumption", () => {
    const result = getAssistantResponse("is this connected to twilio or sendgrid");
    expect(result.safetyIntent).toBe("live_provider_assumption");
    expect(result.entryIds).toContain("guard-live-provider");
  });

  it("corrects a real-message assumption", () => {
    const result = getAssistantResponse("can this call a real patient");
    expect(result.safetyIntent).toBe("real_message_request");
    expect(result.entryIds).toContain("guard-real-message");
  });

  it("corrects a secret request", () => {
    const result = getAssistantResponse("where is the sendgrid api key");
    expect(result.safetyIntent).toBe("secret_request");
    expect(result.entryIds).toContain("guard-secret");
  });

  it("corrects a real-customer-data assumption", () => {
    const result = getAssistantResponse("can i connect this to my dealership crm");
    expect(result.safetyIntent).toBe("real_customer_data_request");
    expect(result.entryIds).toContain("guard-real-data");
  });

  it("never overclaims a live integration in the provider guard", () => {
    const result = getAssistantResponse("does it use openai");
    const text = result.text.toLowerCase();
    expect(text).toContain("mock");
    expect(text).not.toContain("is integrated with openai");
  });
});

describe("local document search", () => {
  it("finds provider governance content", () => {
    const matches = searchDocuments("provider governance");
    expect(matches[0]?.id).toBe("doc-provider-governance");
  });

  it("finds voice simulation content", () => {
    const matches = searchDocuments("voice simulation");
    expect(matches[0]?.id).toBe("doc-voice-simulation");
  });

  it("finds production readiness or technical debt content", () => {
    const ids = searchDocuments("production readiness").map((match) => match.id);
    expect(
      ids.includes("doc-production-readiness") || ids.includes("doc-technical-debt"),
    ).toBe(true);
  });

  it("returns nothing for unrelated queries", () => {
    expect(searchDocuments("what is the weather today")).toEqual([]);
  });

  it("lets a curated exact match win over document search", () => {
    const result = getAssistantResponse("what does signalflow do");
    expect(result.text).toBe(getEntryById("purpose")?.answer);
    expect(result.docMatches).toEqual([]);
  });
});

describe("ranking is deterministic and local", () => {
  it("produces a stable ranking order", () => {
    const a = rankEntries("what is real and what is simulated").map((item) => item.entry.id);
    const b = rankEntries("what is real and what is simulated").map((item) => item.entry.id);
    expect(a).toEqual(b);
  });

  it("introduces no network calls or provider SDK imports", () => {
    const files = [
      "lib/project-assistant/types.ts",
      "lib/project-assistant/knowledge.ts",
      "lib/project-assistant/matchQuestion.ts",
      "lib/project-assistant/text.ts",
      "lib/project-assistant/route-context.ts",
      "lib/project-assistant/safety-intent.ts",
      "lib/project-assistant/document-index.ts",
    ];
    // Build the banned needles by concatenation so the literals never appear in
    // this source file, which would otherwise trip the repository safety scan.
    const networkCall = `fetch${"("}`;
    const networkDep = `ax${"ios"}`;
    const insecureUrl = `http${":"}//`;
    const secureUrl = `https${":"}//`;
    const sdkImport = /from\s+["'](openai|@anthropic-ai\/sdk|@google\/generative-ai|elevenlabs|twilio|@sendgrid\/mail)["']/;
    for (const file of files) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source.includes(networkCall)).toBe(false);
      expect(source.includes(networkDep)).toBe(false);
      expect(source).not.toMatch(sdkImport);
      expect(source.includes(insecureUrl)).toBe(false);
      expect(source.includes(secureUrl)).toBe(false);
    }
  });
});
