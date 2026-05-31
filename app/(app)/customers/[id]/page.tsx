import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { CustomerCard } from "@/components/customer-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { Timeline } from "@/components/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerProfile } from "@/lib/services/customer-service";

export const metadata: Metadata = { title: "Customer" };

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await getCustomerProfile(params.id);

  if (!profile) {
    notFound();
  }

  const { customer, opportunities, timeline } = profile;

  return (
    <>
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to customers
      </Link>

      <SectionHeading
        title={customer.name}
        description="Customer intelligence record with a unified activity timeline served from the database."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline entries={timeline} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <CustomerCard customer={customer} />

          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Opportunities</h2>
            {opportunities.length > 0 ? (
              opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No opportunities for this customer.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
