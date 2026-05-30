import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { CustomerCard } from "@/components/customer-card";
import { customers } from "@/lib/mock-data/customers";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <>
      <SectionHeading
        title="Customer intelligence"
        description="A unified record for each customer, including channels, consent, recent signals, active opportunity, and risk flags."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </>
  );
}
