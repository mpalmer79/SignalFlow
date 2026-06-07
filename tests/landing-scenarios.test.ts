import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getScenarioDefinition } from "@/lib/scenarios/scenario-library";

// Landing scenario proof. The home page scenario showcase is a server component
// that cannot be imported into the node test environment, so this is a
// lightweight structural check: the three showcase cards must reference real
// scenario ids, the route hrefs must resolve to launchable scenarios, and the
// placeholder images they point at must exist on disk. This guards against a
// card silently linking to a 404 or a missing asset.

const ROOT = process.cwd();
const PAGE = readFileSync(join(ROOT, "app", "page.tsx"), "utf8");

const SHOWCASE = [
  {
    href: "/scenarios/automotive-high-intent",
    id: "automotive-high-intent",
    image: "/scenarios/automotive.jpg",
  },
  {
    href: "/scenarios/dental-recall",
    id: "dental-recall",
    image: "/scenarios/dental.jpg",
  },
  {
    href: "/scenarios/insurance-book-expansion",
    id: "insurance-book-expansion",
    image: "/scenarios/insurance.jpg",
  },
];

describe("landing scenario showcase", () => {
  it("links every card to a launchable scenario id", () => {
    for (const card of SHOWCASE) {
      expect(getScenarioDefinition(card.id), card.id).toBeDefined();
    }
  });

  it("references the expected route hrefs in the page", () => {
    for (const card of SHOWCASE) {
      expect(PAGE.includes(card.href), card.href).toBe(true);
    }
  });

  it("references the expected image paths in the page", () => {
    for (const card of SHOWCASE) {
      expect(PAGE.includes(card.image), card.image).toBe(true);
    }
  });

  it("ships the placeholder image assets the cards point at", () => {
    for (const card of SHOWCASE) {
      const file = join(ROOT, "public", card.image);
      expect(existsSync(file), file).toBe(true);
    }
  });
});
