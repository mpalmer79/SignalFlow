import {
  findAllSignals,
  findSignalsByConsent,
} from "@/lib/repositories/signal-repository";
import type { RequestContext } from "@/lib/types/auth";
import type { Signal } from "@/lib/types/signal";

export async function listSignals(context: RequestContext): Promise<Signal[]> {
  return findAllSignals(context.organizationId);
}

export async function listFollowUpQueue(
  context: RequestContext,
  limit: number,
): Promise<Signal[]> {
  const granted = await findSignalsByConsent(context.organizationId, "granted");
  return granted.slice(0, limit);
}
