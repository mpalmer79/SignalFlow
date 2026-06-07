import { describe, it, expect } from "vitest";
import { getAssistantPanelView } from "@/lib/project-assistant/panel-state";
import type {
  AssistantAnswer,
  AssistantMessage,
  RelatedQuestion,
} from "@/lib/project-assistant/types";

// The assistant panel must show suggested starter questions only in the empty
// state, and related follow-up questions only during an active chat. The two
// must never be visible at the same time. These tests pin that render decision.

function assistantAnswer(related: RelatedQuestion[]): AssistantAnswer {
  return {
    text: "An answer from local knowledge.",
    confidence: "high",
    entryIds: ["purpose"],
    matchReasons: ["alias"],
    sources: ["README.md"],
    related,
    safetyIntent: null,
    docMatches: [],
    isFallback: false,
  };
}

function userMessage(id: string, text: string): AssistantMessage {
  return { id, role: "user", text };
}

function assistantMessage(
  id: string,
  related: RelatedQuestion[],
): AssistantMessage {
  const answer = assistantAnswer(related);
  return { id, role: "assistant", text: answer.text, answer };
}

const RELATED: RelatedQuestion[] = [
  { id: "simulated", label: "What is real and what is simulated?" },
  { id: "governance", label: "What parts show AI governance?" },
];

describe("assistant panel render decision", () => {
  it("empty chat shows suggested questions", () => {
    const view = getAssistantPanelView([]);
    expect(view.hasStartedChat).toBe(false);
    expect(view.showSuggestedQuestions).toBe(true);
  });

  it("empty chat does not show related questions", () => {
    const view = getAssistantPanelView([]);
    expect(view.showRelatedQuestions).toBe(false);
    expect(view.relatedQuestions).toEqual([]);
  });

  it("active chat hides suggested questions", () => {
    const messages = [
      userMessage("u1", "what does signalflow do"),
      assistantMessage("a1", RELATED),
    ];
    const view = getAssistantPanelView(messages);
    expect(view.hasStartedChat).toBe(true);
    expect(view.showSuggestedQuestions).toBe(false);
  });

  it("active chat shows related questions when the latest answer has them", () => {
    const messages = [
      userMessage("u1", "what does signalflow do"),
      assistantMessage("a1", RELATED),
    ];
    const view = getAssistantPanelView(messages);
    expect(view.showRelatedQuestions).toBe(true);
    expect(view.relatedQuestions).toEqual(RELATED);
  });

  it("active chat hides related questions when the latest answer has none", () => {
    const messages = [
      userMessage("u1", "what is the weather today"),
      assistantMessage("a1", []),
    ];
    const view = getAssistantPanelView(messages);
    expect(view.showSuggestedQuestions).toBe(false);
    expect(view.showRelatedQuestions).toBe(false);
  });

  it("uses the most recent assistant response for related questions", () => {
    const earlier: RelatedQuestion[] = [{ id: "demo", label: "How does the demo work?" }];
    const messages = [
      userMessage("u1", "first"),
      assistantMessage("a1", earlier),
      userMessage("u2", "second"),
      assistantMessage("a2", RELATED),
    ];
    expect(getAssistantPanelView(messages).relatedQuestions).toEqual(RELATED);
  });

  it("never shows suggested and related at the same time", () => {
    const scenarios: AssistantMessage[][] = [
      [],
      [userMessage("u1", "q"), assistantMessage("a1", RELATED)],
      [userMessage("u1", "q"), assistantMessage("a1", [])],
      [
        userMessage("u1", "q1"),
        assistantMessage("a1", []),
        userMessage("u2", "q2"),
        assistantMessage("a2", RELATED),
      ],
    ];
    for (const messages of scenarios) {
      const view = getAssistantPanelView(messages);
      expect(view.showSuggestedQuestions && view.showRelatedQuestions).toBe(false);
    }
  });

  it("returns to suggested questions after a reset to an empty chat", () => {
    const active = getAssistantPanelView([
      userMessage("u1", "q"),
      assistantMessage("a1", RELATED),
    ]);
    expect(active.showSuggestedQuestions).toBe(false);

    const afterReset = getAssistantPanelView([]);
    expect(afterReset.showSuggestedQuestions).toBe(true);
    expect(afterReset.showRelatedQuestions).toBe(false);
  });
});
