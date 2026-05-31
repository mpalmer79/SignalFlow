import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getScenarios } from "@/lib/services/scenario-service";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "Scenarios" };
export const dynamic = "force-dynamic";

export default async function ScenariosPage() {
  const { denied } = await guardPage("VIEW_SCENARIOS");
  if (denied) return denied;

  const scenarios = getScenarios();

  return (
    <>
      <SectionHeading
        title="Scenario builder"
        description="Launch a complete, deterministic industry scenario. Each one generates a customer, signals, an intelligence profile, a workflow, policy decisions, outcomes, and revenue attribution. Nothing is sent."
        actions={<Badge variant="warning">Deterministic demo</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <Link key={scenario.id} href={`/scenarios/${scenario.id}`}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <PlayCircle className="h-5 w-5" />
                  </span>
                  <Badge variant="muted" className="capitalize">
                    {scenario.vertical.replace("-", " ")}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{scenario.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scenario.summary}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  Launch scenario
                  <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
