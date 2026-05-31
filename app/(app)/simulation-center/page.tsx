import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSimulations } from "@/lib/services/simulation-service";

export const metadata: Metadata = { title: "Simulation Center" };

export default function SimulationCenterPage() {
  const simulations = getSimulations();

  return (
    <>
      <SectionHeading
        title="Simulation center"
        description="Run large multi-customer simulations across a vertical. Each run generates a believable population and aggregates the outcomes deterministically. No data is persisted and nothing is sent."
        actions={<Badge variant="warning">Deterministic demo</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {simulations.map((simulation) => (
          <Link
            key={simulation.id}
            href={`/simulation-center/${simulation.id}`}
          >
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <FlaskConical className="h-5 w-5" />
                  </span>
                  <Badge variant="muted">{simulation.count} customers</Badge>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{simulation.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {simulation.summary}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  Run simulation
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
