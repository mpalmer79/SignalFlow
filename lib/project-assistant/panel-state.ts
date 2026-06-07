import type { AssistantMessage, RelatedQuestion } from "./types";

// Pure render-decision logic for the assistant panel. Kept out of the React
// component so it can be tested deterministically. The rule is simple: suggested
// starter questions belong to the empty state only, and related follow-up
// questions belong to an active conversation only. The two are never shown at
// the same time.

export interface AssistantPanelView {
  // True once the user has sent at least one message.
  hasStartedChat: boolean;
  // Starter questions are shown only before the first user message.
  showSuggestedQuestions: boolean;
  // The related questions attached to the most recent assistant response.
  relatedQuestions: RelatedQuestion[];
  // Related questions are shown only after a chat has started and the latest
  // assistant response actually carries some.
  showRelatedQuestions: boolean;
}

// The related questions from the most recent assistant message, or an empty
// list when the latest response carries none (for example a fallback answer).
export function latestAssistantRelated(
  messages: AssistantMessage[],
): RelatedQuestion[] {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role === "assistant") {
      return message.answer?.related ?? [];
    }
  }
  return [];
}

export function getAssistantPanelView(
  messages: AssistantMessage[],
): AssistantPanelView {
  const hasStartedChat = messages.some((message) => message.role === "user");
  const relatedQuestions = latestAssistantRelated(messages);
  const showSuggestedQuestions = !hasStartedChat;
  const showRelatedQuestions = hasStartedChat && relatedQuestions.length > 0;
  return {
    hasStartedChat,
    showSuggestedQuestions,
    relatedQuestions,
    showRelatedQuestions,
  };
}
