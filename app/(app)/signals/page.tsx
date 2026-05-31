import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { SignalCard } from "@/components/signal-card";
import { listSignals } from "@/lib/services/signal-service";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "Signals" };
export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const { context, denied } = await guardPage("VIEW_SIGNALS");
  if (denied) return denied;

  const signals = await listSignals(context);

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
