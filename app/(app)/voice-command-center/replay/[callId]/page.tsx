import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVoiceReplay } from "@/lib/services/voice-replay-service";
import { guardPage } from "@/lib/auth/guard-page";
import {
  voiceComplianceStyles,
  voiceOutcomeVariant,
  voicePriorityStyles,
} from "@/lib/config/voice-status";
import {
  VOICE_OUTCOME_LABELS,
  VOICE_PURPOSE_LABELS,
} from "@/lib/types/voice";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Voice Replay" };
export const dynamic = "force-dynamic";

const PROVES = [
  "Voice is fully simulated. No call was placed and no provider was contacted.",
  "Compliance is checked before any call. Consent, opt-out, and quiet hours are enforced deterministically.",
  "A blocked plan never produces a call. The blocked state is recorded and auditable.",
  "Connected calls map to the shared outcome and revenue attribution model used across SignalFlow.",
];

export default async function VoiceReplayPage({
  params,
}: {
  params: { callId: string };
}) {
  const { context, denied } = await guardPage("VIEW_VOICE");
  if (denied) return denied;

  const replay = await getVoiceReplay(context, params.callId);
  if (!replay) {
    notFound();
  }

  const { detail, voiceAudit } = replay;
  const { call, plan, compliance, transcript, outcome } = detail;
  const complianceStyle = voiceComplianceStyles[plan.complianceStatus];

  return (
    <>
      <Link
        href="/voice-command-center"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to voice command center
      </Link>

      <SectionHeading
        title={`${call.customerName}: voice replay`}
        description="A deterministic replay of one simulated voice follow-up. No call was placed and no provider was contacted."
        actions={
          <Badge variant="muted" className="capitalize">
            {call.vertical.replace("-", " ")}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Voice plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Purpose" value={VOICE_PURPOSE_LABELS[plan.purpose]} />
            <Row
              label="Priority"
              value={voicePriorityStyles[plan.priority].label}
            />
            <Row label="Script" value={plan.scriptType.replace(/_/g, " ")} />
            <Row
              label="Expected outcome"
              value={VOICE_OUTCOME_LABELS[plan.expectedOutcome]}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Compliance</span>
              <Badge variant={complianceStyle.variant}>
                {complianceStyle.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              Compliance decision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {compliance ? (
              <>
                <Badge variant={voiceComplianceStyles[compliance.decision].variant}>
                  {voiceComplianceStyles[compliance.decision].label}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {compliance.reason}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                No compliance decision recorded.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-primary" />
              Call result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {outcome ? (
              <>
                <Badge variant={voiceOutcomeVariant(outcome.outcomeType)}>
                  {VOICE_OUTCOME_LABELS[outcome.outcomeType]}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {outcome.outcomeReason}
                </p>
                <Row
                  label="Connected"
                  value={call.connected ? `Yes, ${call.durationSeconds}s` : "No"}
                />
                {outcome.attributedAmount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Revenue attributed
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <Banknote className="h-3.5 w-3.5 text-success" />
                      {formatCurrency(outcome.attributedAmount)}
                    </span>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                This call was blocked before it could be simulated.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>Simulated transcript</span>
            <Badge variant="warning">Simulated</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {transcript && transcript.lines.length > 0 ? (
            transcript.lines.map((line, index) => (
              <div key={index} className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {line.speaker === "agent"
                    ? "Agent"
                    : line.speaker === "customer"
                      ? "Customer"
                      : "Outcome"}
                </p>
                <p
                  className={
                    line.speaker === "outcome"
                      ? "text-sm font-medium"
                      : "text-sm text-foreground"
                  }
                >
                  {line.text}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              No transcript. This call did not proceed.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voice audit trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {voiceAudit.length > 0 ? (
            voiceAudit.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {event.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.action}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatDateTime(event.occurredAt)}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              No voice audit events recorded.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What this proves</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {PROVES.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-xs text-muted-foreground"
              >
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
}
