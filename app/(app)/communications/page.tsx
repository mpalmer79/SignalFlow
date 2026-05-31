import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { CommunicationCard } from "@/components/communication-card";
import { Badge } from "@/components/ui/badge";
import { communications } from "@/lib/mock-data/communications";
import type { Channel } from "@/lib/types/consent";

export const metadata: Metadata = { title: "Communications" };

const channels: { id: Channel; label: string }[] = [
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
  { id: "voice", label: "Voice" },
  { id: "human", label: "Human task" },
];

export default function CommunicationsPage() {
  return (
    <>
      <SectionHeading
        title="Communications"
        description="Simulated communication records across channels. No messages are sent in Phase 0."
        actions={<Badge variant="warning">All records simulated</Badge>}
      />
      <div className="space-y-8">
        {channels.map((channel) => {
          const items = communications.filter(
            (comm) => comm.channel === channel.id,
          );
          if (items.length === 0) return null;
          return (
            <section key={channel.id} className="space-y-3">
              <h2 className="text-sm font-semibold">{channel.label}</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((comm) => (
                  <CommunicationCard key={comm.id} communication={comm} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
