import { prisma } from "@/lib/db/prisma";
import { mapVerticalPack } from "@/lib/db/mappers";
import type { VerticalPack } from "@/lib/types/vertical-pack";

const PHASE_ORDER: Record<string, number> = {
  mvp_focus: 0,
  in_design: 1,
  planned: 2,
  research: 3,
};

export async function findAllVerticalPacks(): Promise<VerticalPack[]> {
  const rows = await prisma.verticalPack.findMany();
  return rows
    .map(mapVerticalPack)
    .sort((a, b) => {
      const order =
        (PHASE_ORDER[a.phaseStatus.replace(/-/g, "_")] ?? 9) -
        (PHASE_ORDER[b.phaseStatus.replace(/-/g, "_")] ?? 9);
      return order !== 0 ? order : a.name.localeCompare(b.name);
    });
}
