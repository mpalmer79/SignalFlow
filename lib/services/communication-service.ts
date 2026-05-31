import { findAllCommunications } from "@/lib/repositories/communication-repository";
import type { RequestContext } from "@/lib/types/auth";
import type { Communication } from "@/lib/types/communication";
import type { Channel } from "@/lib/types/consent";

export interface ChannelGroup {
  channel: Channel;
  communications: Communication[];
}

const CHANNEL_ORDER: Channel[] = ["sms", "email", "voice", "human"];

export async function listCommunications(
  context: RequestContext,
): Promise<Communication[]> {
  return findAllCommunications(context.organizationId);
}

export async function getCommunicationsByChannel(
  context: RequestContext,
): Promise<ChannelGroup[]> {
  const all = await findAllCommunications(context.organizationId);
  return CHANNEL_ORDER.map((channel) => ({
    channel,
    communications: all.filter((comm) => comm.channel === channel),
  })).filter((group) => group.communications.length > 0);
}
