import type { Metadata } from "next";
import { Bell, PhoneCall, ShieldAlert, Target } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { SignalCard } from "@/components/signal-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { AuditEventCard } from "@/components/audit-event-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { communicationStatusStyles } from "@/lib/config/status";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const {
    metrics,
    followUpQueue,
    highIntentOpportunities,
    blockedActions,
    voiceQueue,
    recentAudit,
    verticalPacks,
  } = await getDashboardData();

  return (
    <>
      <SectionHeading
        title="Revenue command center"
        description="A live view of signals, consent-aware actions, and pipeline movement. Data is served from the database in demo mode."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active signals"
          value={String(metrics.totalSignals)}
          hint="Across all verticals"
          icon={Bell}
        />
        <MetricCard
          label="High-intent opportunities"
          value={String(metrics.highIntentCount)}
          hint="Intent score 60 and above"
          icon={Target}
          tone="success"
        />
        <MetricCard
          label="Consent blocked actions"
          value={String(metrics.blockedActions)}
          hint="Held by the policy layer"
          icon={ShieldAlert}
          tone="warning"
        />
        <MetricCard
          label="Voice follow-ups queued"
          value={String(metrics.voiceQueueCount)}
          hint="Simulated calls only"
          icon={PhoneCall}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Follow-up queue</h2>
          {followUpQueue.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {followUpQueue.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          ) : (
            <EmptyState message="No follow-up ready signals." />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold">High-intent opportunities</h2>
          {highIntentOpportunities.length > 0 ? (
            <div className="space-y-4">
              {highIntentOpportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <EmptyState message="No high-intent opportunities yet." />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Consent blocked actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockedActions.length > 0 ? (
              blockedActions.map((comm) => (
                <div
                  key={comm.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {comm.customerName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {comm.subject}
                    </p>
                  </div>
                  <StatusBadge status={communicationStatusStyles[comm.status]} />
                </div>
              ))
            ) : (
              <EmptyState message="No blocked actions." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulated voice follow-up queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {voiceQueue.length > 0 ? (
              voiceQueue.map((comm) => (
                <div
                  key={comm.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{comm.customerName}</p>
                    <StatusBadge
                      status={communicationStatusStyles[comm.status]}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {comm.preview}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState message="No voice follow-ups queued." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vertical pack status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {verticalPacks.slice(0, 6).map((pack) => (
              <div
                key={pack.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm">{pack.name}</span>
                <Badge
                  variant={pack.phaseStatus === "mvp-focus" ? "success" : "muted"}
                >
                  {pack.phaseStatus === "mvp-focus"
                    ? "MVP focus"
                    : pack.phaseStatus.replace("-", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent audit activity</h2>
          {recentAudit.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              Updated {formatRelativeTime(recentAudit[0].occurredAt)}
            </span>
          ) : null}
        </div>
        {recentAudit.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {recentAudit.map((event) => (
              <AuditEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState message="No audit activity recorded." />
        )}
      </div>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
      {message}
    </p>
  );
}
