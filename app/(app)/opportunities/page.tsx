import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { OpportunityCard } from "@/components/opportunity-card";
import { Badge } from "@/components/ui/badge";
import { getPipeline } from "@/lib/services/opportunity-service";
import { opportunityStageStyles } from "@/lib/config/status";

export const metadata: Metadata = { title: "Opportunities" };
export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const pipeline = await getPipeline();

  return (
    <>
      <SectionHeading
        title="Opportunity pipeline"
        description="Revenue opportunities grouped by stage, served from the database. Intent scores and values are illustrative demo data."
      />
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {pipeline.map((column) => {
          const style = opportunityStageStyles[column.stage];
          return (
            <div key={column.stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{style.label}</span>
                <Badge variant="muted">{column.opportunities.length}</Badge>
              </div>
              <div className="space-y-3">
                {column.opportunities.length > 0 ? (
                  column.opportunities.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                  ))
                ) : (
                  <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    No opportunities
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
