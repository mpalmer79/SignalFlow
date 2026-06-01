"use client";

import { forwardRef } from "react";
import { MessageCircle } from "lucide-react";

// The floating launcher for the project assistant. One button holds a short
// text label and the chat bubble so they read as a single launcher unit. Fixed
// to the bottom-right, thumb friendly on mobile, and out of the way of the
// centered homepage CTAs and the top navigation. It sits below the KPI
// drill-down dialog z-index so it never covers a modal.
//
// Accessibility: the button carries the accessible name through aria-label, so
// it is a single tab stop. The visible label is decorative and marked
// aria-hidden to avoid duplicate screen reader text. The label is hidden on the
// smallest screens so the launcher never overflows or covers content.
export const ProjectAssistantButton = forwardRef<
  HTMLButtonElement,
  { onClick: () => void }
>(function ProjectAssistantButton({ onClick }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Open the SignalFlow project assistant"
      aria-haspopup="dialog"
      className="group fixed bottom-4 right-4 z-[90] flex max-w-[calc(100vw-2rem)] items-center gap-2.5 focus-visible:outline-none sm:bottom-6 sm:right-6"
    >
      <span
        aria-hidden="true"
        className="hidden items-center whitespace-nowrap rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-md transition-colors group-hover:border-primary/40 group-focus-visible:ring-2 group-focus-visible:ring-ring sm:inline-flex"
      >
        Curious about this project?
      </span>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:group-hover:scale-100">
        <MessageCircle className="h-6 w-6" />
      </span>
    </button>
  );
});
