import { prisma } from "@/lib/db/prisma";
import { mapSignalWithCustomer } from "@/lib/db/mappers";
import type { Signal } from "@/lib/types/signal";
import type { ConsentState } from "@/lib/types/consent";

const withCustomer = {
  customer: { select: { name: true, verticalId: true } },
} as const;

export async function findAllSignals(
  organizationId: string,
): Promise<Signal[]> {
  const rows = await prisma.signal.findMany({
    where: { organizationId },
    include: withCustomer,
    orderBy: { receivedAt: "desc" },
  });
  return rows.map(mapSignalWithCustomer);
}

export async function findSignalsByCustomer(
  organizationId: string,
  customerId: string,
): Promise<Signal[]> {
  const rows = await prisma.signal.findMany({
    where: { organizationId, customerId },
    include: withCustomer,
    orderBy: { receivedAt: "desc" },
  });
  return rows.map(mapSignalWithCustomer);
}

export async function findSignalsByConsent(
  organizationId: string,
  consentStatus: ConsentState,
): Promise<Signal[]> {
  const rows = await prisma.signal.findMany({
    where: { organizationId, consentStatus },
    include: withCustomer,
    orderBy: { receivedAt: "desc" },
  });
  return rows.map(mapSignalWithCustomer);
}

export async function countSignals(organizationId: string): Promise<number> {
  return prisma.signal.count({ where: { organizationId } });
}
