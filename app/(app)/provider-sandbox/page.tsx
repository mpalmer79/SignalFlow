import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, SlidersHorizontal } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runProviderSandbox } from "@/lib/services/provider-sandbox-service";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "Provider Sandbox" };
export const dynamic = "force-dynamic";

export default async function ProviderSandboxPage() {
  const { context, denied } = await guardPage("RUN_PROVIDER_SANDBOX");
  if (denied) return denied;

  const { results } = await runProviderSandbox(context);

  return (
    <>
      <SectionHeading
        title="Provider sandbox"
        description="Deterministic simulations of what a provider request would look like for each capability. No network call is made and no provider is contacted. Every run selects the internal mock provider while demo mode is active."
        actions={<Badge variant="warning">Demo safe</Badge>}
      />

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-warning">
              Sandbox only. No live execution.
            </p>
            <p className="text-sm text-warning/90">
              These results are illustrative. They show the selected provider,
              why the mock was chosen, what a live provider would require, and a
              deterministic output summary. Nothing is sent and no provider API
              is called.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.capability}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  {result.capabilityLabel}
                </span>
                <Badge variant="primary">
                  {result.selectedProviderName ?? "No provider"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Field label="Requested capability" value={result.capabilityLabel} />
              <Field
                label="Selected provider"
                value={result.selectedProviderName ?? "None"}
              />
              <Field label="Why this provider" value={result.selectionReason} />
              <Field label="Input summary" value={result.inputSummary} />
              <Field label="Sandbox output" value={result.outputSummary} />
              <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
                <p className="text-xs font-medium text-warning">
                  Blocked live execution
                </p>
                <p className="text-xs text-warning/90">
                  {result.blockedLiveReason}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  What live use would require
                </p>
                <ul className="mt-1 space-y-1">
                  {result.liveRequirements.map((req) => (
                    <li
                      key={req}
                      className="flex gap-2 text-xs text-muted-foreground"
                    >
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Related views:</span>
        <Link
          href="/provider-management"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Provider management
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
