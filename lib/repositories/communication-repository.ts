import type { Channel as DbChannel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { mapCommunication } from "@/lib/db/mappers";
import type { Communication } from "@/lib/types/communication";

const withCustomer = {
  customer: { select: { name: true } },
} as const;

export async function findAllCommunications(
  organizationId: string,
): Promise<Communication[]> {
  const rows = await prisma.communication.findMany({
    where: { organizationId },
    include: withCustomer,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCommunication);
}

export async function findCommunicationsByCustomer(
  organizationId: string,
  customerId: string,
): Promise<Communication[]> {
  const rows = await prisma.communication.findMany({
    where: { organizationId, customerId },
    include: withCustomer,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCommunication);
}

export async function findCommunicationsByChannel(
  organizationId: string,
  channel: DbChannel,
): Promise<Communication[]> {
  const rows = await prisma.communication.findMany({
    where: { organizationId, channel },
    include: withCustomer,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCommunication);
}

export async function countBlockedCommunications(
  organizationId: string,
): Promise<number> {
  return prisma.communication.count({
    where: { organizationId, status: { in: ["blocked", "escalated"] } },
  });
}

export async function countVoiceQueue(
  organizationId: string,
): Promise<number> {
  return prisma.communication.count({
    where: { organizationId, channel: "voice" },
  });
}
