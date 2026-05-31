import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { IntelligenceProfile } from "@/components/intelligence/intelligence-profile";
import { WorkflowPlanView } from "@/components/workflow/workflow-plan-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCustomerIntelligence } from "@/lib/services/intelligence-service";
import { getWorkflowPreview } from "@/lib/services/workflow-service";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "Customer Intelligence" };
export const dynamic = "force-dynamic";

export default async function CustomerIntelligencePage({
  params,
}: {
  params: { id: string };
}) {
  const { context, denied } = await guardPage("VIEW_INTELLIGENCE");
  if (denied) return denied;

  const [intelligence, workflow] = await Promise.all([
    getCustomerIntelligence(context, params.id),
    getWorkflowPreview(context, params.id),
  ]);

  if (!intelligence) {
    notFound();
  }

  const { profile, graph } = intelligence;

  return (
    <>
      <Link
        href="/intelligence"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to intelligence
      </Link>

      <SectionHeading
        title={profile.customer.name}
        description={`Customer intelligence profile for the ${profile.vertical.replace("-", " ")} vertical. Prefers ${profile.preferredChannel}.`}
      />

      <IntelligenceProfile profile={profile} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Normalized signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.normalizedSignals.length > 0 ? (
              profile.normalizedSignals.map((signal) => (
                <div
                  key={signal.signalId}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {signal.rawLabel}
                    </p>
                    <code className="font-mono text-xs text-primary">
                      {signal.normalizedType}
                    </code>
                  </div>
                  <Badge variant="muted">+{signal.intentContribution}</Badge>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No signals recorded for this customer.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intelligence graph</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              {graph.nodes.length} nodes and {graph.edges.length} relationships
              connect this customer to signals, opportunities, communications,
              and risk flags.
            </p>
            <ul className="space-y-1.5">
              {graph.edges.map((edge, index) => {
                const target = graph.nodes.find((n) => n.id === edge.to);
                return (
                  <li
                    key={`${edge.to}-${index}`}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Badge variant="outline">{edge.relation}</Badge>
                    <span className="truncate text-muted-foreground">
                      {target?.type}: {target?.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      {workflow ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold">Recommended workflow</h2>
            <p className="text-xs text-muted-foreground">
              The action plan SignalFlow would run for this customer, with policy
              decisions and a simulated execution. Nothing is sent.
            </p>
          </div>
          <WorkflowPlanView plan={workflow.plan} />
        </div>
      ) : null}
    </>
  );
}
