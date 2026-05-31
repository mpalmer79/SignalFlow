import { prisma } from "@/lib/db/prisma";
import { mapCustomer } from "@/lib/db/mappers";
import type { Customer } from "@/lib/types/customer";

const customerInclude = {
  contactMethods: true,
  riskFlags: true,
  signals: { orderBy: { receivedAt: "desc" }, take: 5 },
  opportunities: { orderBy: { updatedAt: "desc" } },
} as const;

// Every query is scoped by organizationId. The organization id comes from the
// resolved server context, never from the client.
export async function findAllCustomers(
  organizationId: string,
): Promise<Customer[]> {
  const rows = await prisma.customer.findMany({
    where: { organizationId },
    include: customerInclude,
    orderBy: { name: "asc" },
  });
  return rows.map(mapCustomer);
}

export async function findCustomerById(
  organizationId: string,
  id: string,
): Promise<Customer | null> {
  const row = await prisma.customer.findFirst({
    where: { id, organizationId },
    include: customerInclude,
  });
  return row ? mapCustomer(row) : null;
}

export async function countCustomers(organizationId: string): Promise<number> {
  return prisma.customer.count({ where: { organizationId } });
}
