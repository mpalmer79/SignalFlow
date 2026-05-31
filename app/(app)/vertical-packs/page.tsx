import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { VerticalPackCard } from "@/components/vertical-pack-card";
import { listVerticalPacks } from "@/lib/services/vertical-pack-service";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "Vertical Packs" };
export const dynamic = "force-dynamic";

export default async function VerticalPacksPage() {
  const { denied } = await guardPage("VIEW_VERTICAL_PACKS");
  if (denied) return denied;

  const packs = await listVerticalPacks();

  return (
    <>
      <SectionHeading
        title="Vertical packs"
        description="Industry packs extend the core with specific signals, actions, and compliance handling. Automotive is the initial MVP focus."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {packs.map((pack) => (
          <VerticalPackCard key={pack.id} pack={pack} />
        ))}
      </div>
    </>
  );
}
