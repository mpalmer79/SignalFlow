import type { VerticalId } from "@/lib/types/vertical-pack";
import type { VerticalPackConfig } from "@/lib/types/vertical-pack-config";
import {
  verticalPackConfigs,
  getVerticalPackConfig,
} from "@/lib/verticals/registry";

export function getVerticalPackConfigs(): VerticalPackConfig[] {
  return verticalPackConfigs;
}

export function getVerticalPackConfigById(
  id: VerticalId,
): VerticalPackConfig | undefined {
  return getVerticalPackConfig(id);
}
