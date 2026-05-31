import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { AuditEventCard } from "@/components/audit-event-card";
import { auditEvents } from "@/lib/mock-data/audit-events";

export const metadata: Metadata = { title: "Audit" };

export default function AuditPage() {
  const ordered = [...auditEvents].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  return (
    <>
      <SectionHeading
        title="Audit trail"
        description="Every decision and action produces an audit event. Each entry connects a signal, a customer, a policy decision, an action, and an outcome."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ordered.map((event) => (
          <AuditEventCard key={event.id} event={event} />
        ))}
      </div>
    </>
  );
}
