import {
  findAllSignals,
  findSignalsByConsent,
} from "@/lib/repositories/signal-repository";
import type { Signal } from "@/lib/types/signal";

export async function listSignals(): Promise<Signal[]> {
  return findAllSignals();
}

export async function listFollowUpQueue(limit: number): Promise<Signal[]> {
  const granted = await findSignalsByConsent("granted");
  return granted.slice(0, limit);
}
