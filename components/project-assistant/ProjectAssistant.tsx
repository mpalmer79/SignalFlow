"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getEntryById } from "@/lib/project-assistant/knowledge";
import { getAssistantResponse } from "@/lib/project-assistant/matchQuestion";
import type {
  AssistantAnswer,
  AssistantMessage,
} from "@/lib/project-assistant/types";
import { ProjectAssistantButton } from "./ProjectAssistantButton";
import { ProjectAssistantPanel } from "./ProjectAssistantPanel";

// The persistent project assistant. Mounted once in the root layout so it shows
// on every page. State is in memory only: nothing is persisted, and every
// answer comes from the local knowledge base with no network call. The current
// pathname is read only to improve answer relevance; it never affects any
// business logic.
export function ProjectAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const messageCounter = useRef(0);
  const pathname = usePathname();
  // Keep the latest route in a ref so the ask callbacks stay stable.
  const routeRef = useRef(pathname);
  routeRef.current = pathname;

  const nextId = useCallback((role: AssistantMessage["role"]) => {
    messageCounter.current += 1;
    return `${role}-${messageCounter.current}`;
  }, []);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Return focus to the launcher for keyboard users.
    window.setTimeout(() => buttonRef.current?.focus(), 0);
  }, []);

  const appendExchange = useCallback(
    (question: string, answer: AssistantAnswer) => {
      setMessages((prev) => [
        ...prev,
        { id: nextId("user"), role: "user", text: question },
        {
          id: nextId("assistant"),
          role: "assistant",
          text: answer.text,
          answer,
        },
      ]);
    },
    [nextId],
  );

  const askText = useCallback(
    (text: string) => {
      appendExchange(text, getAssistantResponse(text, routeRef.current));
    },
    [appendExchange],
  );

  const askStarter = useCallback(
    (entryId: string, label: string) => {
      // Use the canonical question for the matched entry so the structured
      // answer is stable, then fall back to free-text resolution.
      const entry = getEntryById(entryId);
      const query = entry ? entry.question : label;
      appendExchange(label, getAssistantResponse(query, routeRef.current));
    },
    [appendExchange],
  );

  // Escape closes the panel from anywhere while it is open.
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  return (
    <>
      {!isOpen ? (
        <ProjectAssistantButton ref={buttonRef} onClick={open} />
      ) : null}
      {isOpen ? (
        <ProjectAssistantPanel
          messages={messages}
          onClose={close}
          onAskText={askText}
          onAskStarter={askStarter}
        />
      ) : null}
    </>
  );
}
