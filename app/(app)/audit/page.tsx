import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { AuditEventCard } from "@/components/audit-event-card";
import { listAuditEvents } from "@/lib/services/audit-service";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "Audit" };
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const { context, denied } = await guardPage("VIEW_AUDIT");
  if (denied) return denied;

  const events = await listAuditEvents(context);

  return (
    <>
      <SectionHeading
        title="Audit trail"
        description="Every decision and action produces an audit event. Each entry connects a signal, a customer, a policy decision, an action, and an outcome."
      />
      {events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <AuditEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No audit events recorded. Run the seed script to load demo data.
        </p>
      )}
    </>
  );
}
