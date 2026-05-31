import { prisma } from "@/lib/db/prisma";
import { mapCustomer } from "@/lib/db/mappers";
import type { Customer } from "@/lib/types/customer";

const customerInclude = {
  contactMethods: true,
  riskFlags: true,
  signals: { orderBy: { receivedAt: "desc" }, take: 5 },
  opportunities: { orderBy: { updatedAt: "desc" } },
} as const;

export async function findAllCustomers(): Promise<Customer[]> {
  const rows = await prisma.customer.findMany({
    include: customerInclude,
    orderBy: { name: "asc" },
  });
  return rows.map(mapCustomer);
}

export async function findCustomerById(
  id: string,
): Promise<Customer | null> {
  const row = await prisma.customer.findUnique({
    where: { id },
    include: customerInclude,
  });
  return row ? mapCustomer(row) : null;
}

export async function countCustomers(): Promise<number> {
  return prisma.customer.count();
}
