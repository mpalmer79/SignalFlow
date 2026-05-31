import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { CustomerCard } from "@/components/customer-card";
import { listCustomers } from "@/lib/services/customer-service";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const { context, denied } = await guardPage("VIEW_CUSTOMERS");
  if (denied) return denied;

  const customers = await listCustomers(context);

  return (
    <>
      <SectionHeading
        title="Customer intelligence"
        description="A unified record for each customer, including channels, consent, recent signals, active opportunity, and risk flags."
      />
      {customers.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {customers.map((customer) => (
            <Link key={customer.id} href={`/customers/${customer.id}`}>
              <CustomerCard customer={customer} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No customers found. Run the seed script to load demo data.
        </p>
      )}
    </>
  );
}
