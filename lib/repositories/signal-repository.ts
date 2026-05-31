import { prisma } from "@/lib/db/prisma";
import { mapSignalWithCustomer } from "@/lib/db/mappers";
import type { Signal } from "@/lib/types/signal";
import type { ConsentState } from "@/lib/types/consent";

const withCustomer = {
  customer: { select: { name: true, verticalId: true } },
} as const;

export async function findAllSignals(): Promise<Signal[]> {
  const rows = await prisma.signal.findMany({
    include: withCustomer,
    orderBy: { receivedAt: "desc" },
  });
  return rows.map(mapSignalWithCustomer);
}

export async function findSignalsByCustomer(
  customerId: string,
): Promise<Signal[]> {
  const rows = await prisma.signal.findMany({
    where: { customerId },
    include: withCustomer,
    orderBy: { receivedAt: "desc" },
  });
  return rows.map(mapSignalWithCustomer);
}

export async function findSignalsByConsent(
  consentStatus: ConsentState,
): Promise<Signal[]> {
  const rows = await prisma.signal.findMany({
    where: { consentStatus },
    include: withCustomer,
    orderBy: { receivedAt: "desc" },
  });
  return rows.map(mapSignalWithCustomer);
}

export async function countSignals(): Promise<number> {
  return prisma.signal.count();
}
