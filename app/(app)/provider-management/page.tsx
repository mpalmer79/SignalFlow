import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Flag,
  Lock,
  Plug,
  ShieldCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProviderManagement } from "@/lib/services/provider-management-service";
import { guardPage } from "@/lib/auth/guard-page";
import {
  flagStateStyles,
  providerStatusStyles,
  readinessStyles,
} from "@/lib/config/provider-status";
import {
  PROVIDER_CATEGORY_LABELS,
  type ProviderCategory,
} from "@/lib/providers/provider-registry";
import {
  ALL_CAPABILITIES,
  CAPABILITY_LABELS,
} from "@/lib/providers/provider-capabilities";
import { PROVIDER_AUDIT_ACTION_LABELS } from "@/lib/providers/provider-audit";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Provider Management" };
export const dynamic = "force-dynamic";

export default async function ProviderManagementPage() {
  const { context, denied } = await guardPage("VIEW_PROVIDERS");
  if (denied) return denied;

  const { providers, auditEvents, flags, liveProvidersEnabled } =
    await getProviderManagement(context);

  const mockProviders = providers.filter(
    (row) => row.provider.category === "INTERNAL_MOCK",
  );
  const externalProviders = providers.filter(
    (row) => row.provider.category !== "INTERNAL_MOCK",
  );

  return (
    <>
      <SectionHeading
        title="Provider management"
        description="The provider governance layer. It describes which providers SignalFlow could support, what each exposes, and what would be required before live use. No provider SDK is installed and no network call is made."
        actions={<Badge variant="warning">Demo safe</Badge>}
      />

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-warning">
              All live providers are disabled
            </p>
            <p className="text-sm text-warning/90">
              Only internal mock providers are active. No secrets are stored, no
              SDK is installed, and no network call is made. Future providers may
              include OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI,
              ElevenLabs, Twilio, Retell, Vapi, and SendGrid, but none are
              integrated today.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Providers registered"
          value={String(providers.length)}
          hint={`${mockProviders.length} internal mock`}
          icon={Plug}
        />
        <MetricCard
          label="Live providers enabled"
          value={String(liveProvidersEnabled)}
          hint="Locked off in demo mode"
          icon={Lock}
          tone="warning"
        />
        <MetricCard
          label="Mock providers active"
          value={String(mockProviders.length)}
          hint="Deterministic, no network"
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Feature flags"
          value={String(flags.length)}
          hint={`${flags.filter((f) => f.governsLive).length} govern live use`}
          icon={Flag}
        />
      </div>

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Feature flags</h2>
          <p className="text-xs text-muted-foreground">
            Every flag that governs a live capability resolves to blocked while
            demo mode is active.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {flags.map((flag) => {
            const style = flagStateStyles[flag.state];
            return (
              <div
                key={flag.key}
                className="space-y-1 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{flag.label}</span>
                  <Badge variant={style.variant}>{style.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{flag.reason}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Capability matrix</h2>
          <p className="text-xs text-muted-foreground">
            Which providers expose which capabilities. Internal mock providers
            serve every capability in demo mode.
          </p>
        </div>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 font-medium text-muted-foreground">
                    Provider
                  </th>
                  {ALL_CAPABILITIES.map((capability) => (
                    <th
                      key={capability}
                      className="p-2 text-center font-medium text-muted-foreground"
                    >
                      {CAPABILITY_LABELS[capability]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {providers.map((row) => (
                  <tr
                    key={row.provider.providerKey}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="p-3 font-medium">
                      {row.provider.displayName}
                    </td>
                    {ALL_CAPABILITIES.map((capability) => (
                      <td key={capability} className="p-2 text-center">
                        {row.provider.capabilities.includes(capability) ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                        ) : (
                          <span className="text-muted-foreground">.</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Provider registry and readiness</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <ProviderList
            title="Internal mock providers"
            rows={mockProviders}
          />
          <ProviderList
            title="Future ready providers"
            rows={externalProviders}
          />
        </div>
      </section>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="space-y-2 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            What would it take to go live?
          </p>
          <p className="text-sm">
            Each external provider stays not live ready until every gate is
            satisfied: the governing feature flag is allowed, demo mode is off,
            the documented placeholder secrets are supplied through a real
            secret manager, compliance approval is granted, sandbox validation
            passes, and live use is explicitly enabled in the configuration.
            None of these are satisfied here by design, so the platform stays
            demo safe.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Provider audit trail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {auditEvents.length > 0 ? (
            auditEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {PROVIDER_AUDIT_ACTION_LABELS[event.action]}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.reason}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatRelativeTime(event.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              No provider audit events yet. Run the provider sandbox to generate
              activity.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Related views:</span>
        <Link
          href="/provider-sandbox"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Provider sandbox
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Settings
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </>
  );
}

function ProviderList({
  title,
  rows,
}: {
  title: string;
  rows: Awaited<
    ReturnType<typeof getProviderManagement>
  >["providers"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((row) => {
          const status = providerStatusStyles[row.provider.status];
          const readiness = readinessStyles[row.readiness];
          return (
            <div
              key={row.provider.providerKey}
              className="space-y-1 rounded-md border border-border bg-secondary/30 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {row.provider.displayName}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="muted">
                    {PROVIDER_CATEGORY_LABELS[
                      row.provider.category as ProviderCategory
                    ]}
                  </Badge>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <Badge variant={readiness.variant}>{readiness.label}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {row.provider.notes}
              </p>
              {row.provider.requiredSecrets.length > 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Would require: {row.provider.requiredSecrets.join(", ")}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  No secrets required.
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
