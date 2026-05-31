import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { SignalCard } from "@/components/signal-card";
import { signals } from "@/lib/mock-data/signals";

export const metadata: Metadata = { title: "Signals" };

export default function SignalsPage() {
  return (
    <>
      <SectionHeading
        title="Customer signals"
        description="Inbound events that indicate revenue intent or risk. Each signal carries a recommended next action and a consent status."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </>
  );
}
