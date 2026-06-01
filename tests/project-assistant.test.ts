import { describe, it, expect } from "vitest";
import {
  FALLBACK_ANSWER,
  KNOWLEDGE,
  STARTER_QUESTIONS,
  getEntryById,
} from "@/lib/project-assistant/knowledge";
import {
  answerQuestion,
  matchQuestion,
} from "@/lib/project-assistant/matchQuestion";

describe("knowledge base", () => {
  it("has unique entry ids", () => {
    const ids = KNOWLEDGE.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("exposes five starter questions that each point at a real entry", () => {
    expect(STARTER_QUESTIONS).toHaveLength(5);
    for (const starter of STARTER_QUESTIONS) {
      expect(getEntryById(starter.entryId)).not.toBeNull();
    }
  });
});

describe("starter questions", () => {
  it("each starter label resolves to its own entry through matching", () => {
    for (const starter of STARTER_QUESTIONS) {
      const result = matchQuestion(starter.label);
      expect(result.entry?.id, starter.label).toBe(starter.entryId);
      expect(answerQuestion(starter.label)).toBe(
        getEntryById(starter.entryId)?.answer,
      );
    }
  });
});

describe("typed paraphrases", () => {
  const cases: Array<[string, string]> = [
    ["what does signalflow do", "purpose"],
    ["is anything real here", "simulated"],
    ["tell me about the 60 second demo", "demo"],
    ["how do the kpi cards work", "kpi-drilldown"],
    ["what files power the kpi cards", "kpi-implementation"],
    ["how is the ai governed", "governance"],
    ["is this connected to a real crm", "crm"],
    ["does it send real sms or email", "channels"],
    ["what is the tech stack", "architecture"],
    ["what colors and fonts are used", "design"],
    ["how is revenue attributed", "revenue"],
    ["does the chatbot call an api", "privacy"],
  ];

  it.each(cases)("maps %s to entry %s", (input, expectedId) => {
    expect(matchQuestion(input).entry?.id).toBe(expectedId);
  });
});

describe("out of scope and determinism", () => {
  it("falls back honestly for unrelated questions", () => {
    expect(answerQuestion("what is the weather today")).toBe(FALLBACK_ANSWER);
    expect(answerQuestion("hello")).toBe(FALLBACK_ANSWER);
    expect(answerQuestion("")).toBe(FALLBACK_ANSWER);
  });

  it("is deterministic for the same input", () => {
    expect(answerQuestion("what does signalflow do")).toBe(
      answerQuestion("what does signalflow do"),
    );
    expect(matchQuestion("kpi drill down modals").entry?.id).toBe(
      matchQuestion("kpi drill down modals").entry?.id,
    );
  });
});
