"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEMO_SAFE_LABEL,
  EMPTY_STATE,
  STARTER_QUESTIONS,
} from "@/lib/project-assistant/knowledge";
import { getAssistantPanelView } from "@/lib/project-assistant/panel-state";
import type {
  AssistantAnswer,
  AssistantMessage,
  ConfidenceLevel,
} from "@/lib/project-assistant/types";

// The chat panel. Presentational and controlled: it receives the message list
// and reports user intent up to the controller. All answers are resolved from
// local knowledge by the controller, so this component makes no network call.

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  high: "Strong match",
  medium: "Good match",
  low: "Loose match",
};

function AnswerMeta({ answer }: { answer: AssistantAnswer }) {
  // Source chips: knowledge sources, plus any supporting document sources, kept
  // compact and de-duplicated. All point at local repository files only. Related
  // follow-up questions are rendered once, near the input, by the panel footer,
  // so they are not repeated here under every answer.
  const docSources = answer.docMatches.map((match) => match.source);
  const sources = Array.from(new Set([...answer.sources, ...docSources])).slice(0, 4);

  if (answer.isFallback && sources.length === 0) return null;

  return (
    <div className="mt-1.5 space-y-2">
      {!answer.isFallback ? (
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {CONFIDENCE_LABEL[answer.confidence]} from local knowledge
        </p>
      ) : null}

      {sources.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" aria-label="Sources in this repository">
          {sources.map((source) => (
            <span
              key={source}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              <FileText className="h-3 w-3" aria-hidden="true" />
              {source}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProjectAssistantPanel({
  messages,
  onClose,
  onAskText,
  onAskStarter,
}: {
  messages: AssistantMessage[];
  onClose: () => void;
  onAskText: (text: string) => void;
  onAskStarter: (entryId: string, label: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested starter questions belong to the empty state; related follow-ups
  // belong to an active chat. This view decides which set is shown, and the two
  // are never visible at the same time.
  const view = getAssistantPanelView(messages);

  // Move focus into the panel when it opens.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the latest message in view as the conversation grows.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  function submitDraft() {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    onAskText(trimmed);
    setDraft("");
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitDraft();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="SignalFlow project assistant"
      className="fixed inset-x-0 bottom-0 z-[95] flex h-[85vh] max-h-[640px] flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-xl motion-safe:animate-in motion-safe:slide-in-from-bottom-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:w-[400px] sm:rounded-2xl"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Project assistant</p>
            <p className="text-[11px] text-muted-foreground">{DEMO_SAFE_LABEL}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the project assistant"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
            {EMPTY_STATE}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col",
                message.role === "user" ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  message.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm border border-border bg-secondary/50 text-foreground",
                )}
              >
                {message.text}
              </div>
              {message.role === "assistant" && message.answer ? (
                <div className="max-w-[92%]">
                  <AnswerMeta answer={message.answer} />
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border p-3">
        {/* Empty state only: suggested starter questions. */}
        {view.showSuggestedQuestions ? (
          <div className="mb-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_QUESTIONS.map((starter) => (
                <button
                  key={starter.entryId}
                  type="button"
                  onClick={() => onAskStarter(starter.entryId, starter.label)}
                  className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-left text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {starter.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Active chat only: related follow-ups from the latest answer. Never
            shown together with the suggested questions above. */}
        {view.showRelatedQuestions ? (
          <div className="mb-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Related
            </p>
            <div className="flex flex-wrap gap-1.5">
              {view.relatedQuestions.map((related) => (
                <button
                  key={related.id}
                  type="button"
                  onClick={() => onAskText(related.label)}
                  className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-left text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {related.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            aria-label="Ask the project assistant a question"
            placeholder="Ask about SignalFlow"
            className="max-h-28 min-h-[40px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={submitDraft}
            disabled={draft.trim().length === 0}
            aria-label="Send question"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
