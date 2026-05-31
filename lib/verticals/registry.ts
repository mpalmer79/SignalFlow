import type { VerticalId } from "@/lib/types/vertical-pack";
import type { VerticalPackConfig } from "@/lib/types/vertical-pack-config";
import { automotivePack } from "./automotive/pack";
import { dentalPack } from "./dental/pack";
import { homeServicesPack } from "./home-services/pack";
import { legalPack } from "./legal/pack";
import { insurancePack } from "./insurance/pack";

// The vertical pack registry is the single source of truth for the formal pack
// configurations. Packs are pure data and drive the scenario and simulation
// engines.
export const verticalPackConfigs: VerticalPackConfig[] = [
  automotivePack,
  dentalPack,
  homeServicesPack,
  legalPack,
  insurancePack,
];

const byId = new Map<VerticalId, VerticalPackConfig>(
  verticalPackConfigs.map((pack) => [pack.id, pack]),
);

export function getVerticalPackConfig(
  id: VerticalId,
): VerticalPackConfig | undefined {
  return byId.get(id);
}

export function requireVerticalPackConfig(id: VerticalId): VerticalPackConfig {
  const pack = byId.get(id);
  if (!pack) {
    throw new Error(`Unknown vertical pack: ${id}`);
  }
  return pack;
}
