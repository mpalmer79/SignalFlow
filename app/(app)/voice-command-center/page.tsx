import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarCheck,
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVoiceCommandCenter } from "@/lib/services/voice-command-center-service";
import { guardPage } from "@/lib/auth/guard-page";
import {
  voiceComplianceStyles,
  voiceOutcomeVariant,
  voicePriorityStyles,
} from "@/lib/config/voice-status";
import {
  VOICE_BLOCKED_REASON_LABELS,
  VOICE_OUTCOME_LABELS,
  VOICE_PURPOSE_LABELS,
} from "@/lib/types/voice";
import type { VoiceBlockedReason } from "@/lib/types/voice";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  filterByFacet,
  paginate,
  parsePositiveInt,
  readParam,
} from "@/lib/lists/list-helpers";
import { FilterChipGroup } from "@/components/lists/filter-chip-group";
import { PaginationControl } from "@/components/lists/pagination-control";
import { ResultCount } from "@/components/lists/result-count";

export const metadata: Metadata = { title: "Voice Command Center" };
export const dynamic = "force-dynamic";

interface VoiceCommandCenterPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const PAGE_SIZE = 12;

export default async function VoiceCommandCenterPage({
  searchParams = {},
}: VoiceCommandCenterPageProps) {
  const { context, denied } = await guardPage("VIEW_VOICE");
  if (denied) return denied;

  const { metrics, plans, calls, needingReview, blockedPlans } =
    await getVoiceCommandCenter(context);

  const complianceParam = readParam(searchParams.compliance) ?? "all";
  const verticalParam = readParam(searchParams.vertical) ?? "all";
  const page = parsePositiveInt(searchParams.page, 1);

  const baseParams = new URLSearchParams();
  if (complianceParam !== "all") baseParams.set("compliance", complianceParam);
  if (verticalParam !== "all") baseParams.set("vertical", verticalParam);

  const verticalCounts = new Map<string, number>();
  for (const plan of plans) {
    verticalCounts.set(plan.vertical, (verticalCounts.get(plan.vertical) ?? 0) + 1);
  }
  const verticalOptions = [
    { label: "All verticals", value: "all", count: plans.length },
    ...Array.from(verticalCounts.entries()).map(([id, count]) => ({
      label: id.replace("-", " "),
      value: id,
      count,
    })),
  ];

  const filteredPlans = filterByFacet(
    filterByFacet(plans, complianceParam, (p) => p.complianceStatus),
    verticalParam,
    (p) => p.vertical,
  );
  const pagedPlans = paginate(filteredPlans, { page, pageSize: PAGE_SIZE });

  return (
    <>
      <SectionHeading
        title="Voice command center"
        description="Simulated voice follow-up operations. Every plan passes a deterministic compliance check before a call is simulated."
        actions={<Badge variant="warning">Simulated, demo safe</Badge>}
      />

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-warning">
              Voice is fully simulated
            </p>
            <p className="text-sm text-warning/90">
              No calls are placed. No telephony provider is integrated and no
              network call is made. Every plan, transcript, outcome, and
              attribution shown below is generated deterministically from
              persisted demo data. Future providers may include ElevenLabs,
              OpenAI Realtime, Twilio, Retell, or Vapi, but none are integrated
              today.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Voice plans"
          value={String(metrics.totalPlans)}
          hint={`${metrics.allowed} allowed, ${metrics.blocked} blocked`}
          icon={PhoneCall}
        />
        <MetricCard
          label="Calls simulated"
          value={String(metrics.totalCalls)}
          hint="No live calls placed"
          icon={PhoneCall}
          tone="success"
        />
        <MetricCard
          label="Calls blocked"
          value={String(metrics.blocked)}
          hint="Held by voice compliance"
          icon={PhoneOff}
          tone="warning"
        />
        <MetricCard
          label="Needing review"
          value={String(metrics.needsReview)}
          hint="Awaiting human approval"
          icon={ShieldQuestion}
          tone="warning"
        />
        <MetricCard
          label="Appointments from voice"
          value={String(metrics.appointments)}
          hint={`${metrics.positiveOutcomes} positive outcomes`}
          icon={CalendarCheck}
          tone="success"
        />
        <MetricCard
          label="Voice influenced revenue"
          value={formatCurrency(metrics.influencedRevenue)}
          hint="Attributed from simulated calls"
          icon={Banknote}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldQuestion className="h-4 w-4 text-warning" />
              Calls needing human review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {needingReview.length > 0 ? (
              needingReview.slice(0, 6).map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {plan.customerName}
                    </span>
                    <Badge variant={voicePriorityStyles[plan.priority].variant}>
                      {voicePriorityStyles[plan.priority].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {VOICE_PURPOSE_LABELS[plan.purpose]} (
                    {plan.vertical.replace("-", " ")})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {plan.blockedReason
                      ? VOICE_BLOCKED_REASON_LABELS[
                          plan.blockedReason as VoiceBlockedReason
                        ]
                      : "Awaiting human approval"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyHint message="No calls awaiting review." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneOff className="h-4 w-4 text-danger" />
              Blocked call reasons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockedPlans.length > 0 ? (
              blockedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {plan.customerName}
                    </span>
                    <Badge variant="danger">
                      {plan.blockedReason
                        ? VOICE_BLOCKED_REASON_LABELS[
                            plan.blockedReason as VoiceBlockedReason
                          ]
                        : "Blocked"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {VOICE_PURPOSE_LABELS[plan.purpose]} (
                    {plan.vertical.replace("-", " ")})
                  </p>
                </div>
              ))
            ) : (
              <EmptyHint message="No blocked calls." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-primary" />
            Simulated calls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {calls.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {calls.map((call) => (
                <Link
                  key={call.id}
                  href={`/voice-command-center/replay/${call.id}`}
                  className="block rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {call.customerName}
                    </span>
                    {call.outcomeType ? (
                      <Badge variant={voiceOutcomeVariant(call.outcomeType)}>
                        {VOICE_OUTCOME_LABELS[call.outcomeType]}
                      </Badge>
                    ) : (
                      <Badge variant="muted">Pending</Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {VOICE_PURPOSE_LABELS[call.purpose]} (
                    {call.vertical.replace("-", " ")})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {call.connected
                      ? `Connected, ${call.durationSeconds}s`
                      : "Not connected"}{" "}
                    {formatRelativeTime(call.startedAt)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyHint message="No simulated calls yet. Run the seed script to generate demo data." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            Voice compliance legend
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs">
            <p className="font-medium">Missing voice consent</p>
            <p className="text-muted-foreground">
              No granted voice channel on file. The compliance engine blocks the
              call before any simulation runs.
            </p>
          </div>
          <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs">
            <p className="font-medium">Customer opted out</p>
            <p className="text-muted-foreground">
              The customer has opted out of all contact. The call is blocked and
              a compliance stop is recorded.
            </p>
          </div>
          <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs">
            <p className="font-medium">Quiet hours</p>
            <p className="text-muted-foreground">
              Calls outside permitted hours are blocked. The plan stays in the
              queue for a later run.
            </p>
          </div>
          <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs">
            <p className="font-medium">Needs review</p>
            <p className="text-muted-foreground">
              Sensitive verticals such as legal intake or medical, or
              unapproved AI recommendations, route to a human reviewer before
              the call can be simulated.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            Voice plans and compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FilterChipGroup
              label="Compliance"
              paramName="compliance"
              current={complianceParam}
              baseParams={baseParams}
              pathname="/voice-command-center"
              options={[
                { label: "All", value: "all", count: plans.length },
                {
                  label: "Allowed",
                  value: "allowed",
                  count: plans.filter((p) => p.complianceStatus === "allowed").length,
                },
                {
                  label: "Blocked",
                  value: "blocked",
                  count: plans.filter((p) => p.complianceStatus === "blocked").length,
                },
                {
                  label: "Needs review",
                  value: "needs-review",
                  count: plans.filter((p) => p.complianceStatus === "needs-review").length,
                },
              ]}
            />
            <FilterChipGroup
              label="Vertical"
              paramName="vertical"
              current={verticalParam}
              baseParams={baseParams}
              pathname="/voice-command-center"
              options={verticalOptions}
            />
          </div>
          <ResultCount
            showing={pagedPlans.items.length}
            total={pagedPlans.total}
            label="voice plans"
            pathname="/voice-command-center"
            hasFilters={complianceParam !== "all" || verticalParam !== "all"}
          />
          {pagedPlans.items.length > 0 ? (
            pagedPlans.items.map((plan) => {
              const compliance = voiceComplianceStyles[plan.complianceStatus];
              return (
                <div
                  key={plan.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {plan.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {VOICE_PURPOSE_LABELS[plan.purpose]} (
                      {plan.vertical.replace("-", " ")})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={voicePriorityStyles[plan.priority].variant}>
                      {voicePriorityStyles[plan.priority].label}
                    </Badge>
                    <Badge variant={compliance.variant}>
                      {compliance.label}
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyHint message="No voice plans match these filters." />
          )}
          <PaginationControl
            page={pagedPlans.page}
            totalPages={pagedPlans.totalPages}
            hasPrevious={pagedPlans.hasPrevious}
            hasNext={pagedPlans.hasNext}
            baseParams={baseParams}
            pathname="/voice-command-center"
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Related views:</span>
        <Link
          href="/revenue-command-center"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Revenue command center
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/review-queue"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Review queue
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/ai-center"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          AI center
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </>
  );
}

function EmptyHint({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
      {message}
    </p>
  );
}
