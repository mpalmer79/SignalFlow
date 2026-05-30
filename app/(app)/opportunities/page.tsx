import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { OpportunityCard } from "@/components/opportunity-card";
import { Badge } from "@/components/ui/badge";
import { opportunities } from "@/lib/mock-data/opportunities";
import { opportunityStageStyles } from "@/lib/config/status";
import type { OpportunityStage } from "@/lib/types/opportunity";

export const metadata: Metadata = { title: "Opportunities" };

const stageOrder: OpportunityStage[] = [
  "new",
  "contact-attempted",
  "engaged",
  "appointment-set",
  "needs-human-review",
  "won",
  "lost",
  "dormant",
  "reactivated",
];

export default function OpportunitiesPage() {
  return (
    <>
      <SectionHeading
        title="Opportunity pipeline"
        description="Revenue opportunities grouped by stage. Intent scores and values are illustrative mock data."
      />
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {stageOrder.map((stage) => {
          const items = opportunities.filter((opp) => opp.stage === stage);
          const style = opportunityStageStyles[stage];
          return (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{style.label}</span>
                <Badge variant="muted">{items.length}</Badge>
              </div>
              <div className="space-y-3">
                {items.length > 0 ? (
                  items.map((opp) => (
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
