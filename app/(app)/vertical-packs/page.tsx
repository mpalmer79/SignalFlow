import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { VerticalPackCard } from "@/components/vertical-pack-card";
import { verticalPacks } from "@/lib/mock-data/vertical-packs";

export const metadata: Metadata = { title: "Vertical Packs" };

export default function VerticalPacksPage() {
  return (
    <>
      <SectionHeading
        title="Vertical packs"
        description="Industry packs extend the core with specific signals, actions, and compliance handling. Automotive is the initial MVP focus."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {verticalPacks.map((pack) => (
          <VerticalPackCard key={pack.id} pack={pack} />
        ))}
      </div>
    </>
  );
}
