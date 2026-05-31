import { findAllVerticalPacks } from "@/lib/repositories/vertical-pack-repository";
import type { VerticalPack } from "@/lib/types/vertical-pack";

export async function listVerticalPacks(): Promise<VerticalPack[]> {
  return findAllVerticalPacks();
}
