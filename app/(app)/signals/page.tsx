import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { SignalCard } from "@/components/signal-card";
import { listSignals } from "@/lib/services/signal-service";

export const metadata: Metadata = { title: "Signals" };
export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const signals = await listSignals();

  return (
    <>
      <SectionHeading
        title="Customer signals"
        description="Inbound events that indicate revenue intent or risk. Each signal carries a recommended next action and a consent status."
      />
      {signals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No signals found. Run the seed script to load demo data.
        </p>
      )}
    </>
  );
}
