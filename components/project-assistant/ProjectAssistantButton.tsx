"use client";

import { forwardRef } from "react";
import { MessageCircle } from "lucide-react";

// The floating launcher for the project assistant. Fixed to the bottom-right,
// thumb friendly on mobile, and out of the way of the centered homepage CTAs
// and the top navigation. It sits below the KPI drill-down dialog z-index so it
// never covers a modal.
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
      className="fixed bottom-4 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:scale-100 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
});
