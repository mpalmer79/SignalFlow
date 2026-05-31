import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { CommunicationCard } from "@/components/communication-card";
import { Badge } from "@/components/ui/badge";
import { getCommunicationsByChannel } from "@/lib/services/communication-service";
import type { Channel } from "@/lib/types/consent";

export const metadata: Metadata = { title: "Communications" };
export const dynamic = "force-dynamic";

const channelLabels: Record<Channel, string> = {
  sms: "SMS",
  email: "Email",
  voice: "Voice",
  human: "Human task",
};

export default async function CommunicationsPage() {
  const groups = await getCommunicationsByChannel();

  return (
    <>
      <SectionHeading
        title="Communications"
        description="Simulated communication records across channels. No messages are sent in demo mode."
        actions={<Badge variant="warning">All records simulated</Badge>}
      />
      {groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.channel} className="space-y-3">
              <h2 className="text-sm font-semibold">
                {channelLabels[group.channel]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.communications.map((comm) => (
                  <CommunicationCard key={comm.id} communication={comm} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No communications found. Run the seed script to load demo data.
        </p>
      )}
    </>
  );
}
