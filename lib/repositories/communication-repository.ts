import type { Channel as DbChannel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { mapCommunication } from "@/lib/db/mappers";
import type { Communication } from "@/lib/types/communication";

const withCustomer = {
  customer: { select: { name: true } },
} as const;

export async function findAllCommunications(): Promise<Communication[]> {
  const rows = await prisma.communication.findMany({
    include: withCustomer,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCommunication);
}

export async function findCommunicationsByCustomer(
  customerId: string,
): Promise<Communication[]> {
  const rows = await prisma.communication.findMany({
    where: { customerId },
    include: withCustomer,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCommunication);
}

export async function findCommunicationsByChannel(
  channel: DbChannel,
): Promise<Communication[]> {
  const rows = await prisma.communication.findMany({
    where: { channel },
    include: withCustomer,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCommunication);
}

export async function countBlockedCommunications(): Promise<number> {
  return prisma.communication.count({
    where: { status: { in: ["blocked", "escalated"] } },
  });
}

export async function countVoiceQueue(): Promise<number> {
  return prisma.communication.count({
    where: { channel: "voice" },
  });
}
