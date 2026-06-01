import { describe, it, expect } from "vitest";
import {
  applySort,
  filterByFacet,
  filterBySearch,
  paginate,
  parsePositiveInt,
  readParam,
  type SortOption,
} from "@/lib/lists/list-helpers";

interface Record {
  id: string;
  name: string;
  vertical: string;
  score: number;
}

const records: Record[] = [
  { id: "1", name: "Acme Automotive", vertical: "automotive", score: 80 },
  { id: "2", name: "Bayside Dental", vertical: "dental", score: 60 },
  { id: "3", name: "Carter HVAC", vertical: "home-services", score: 70 },
  { id: "4", name: "Dawson Legal", vertical: "legal-intake", score: 40 },
  { id: "5", name: "Atlas Auto", vertical: "automotive", score: 90 },
];

describe("parsePositiveInt", () => {
  it("returns the fallback when missing or invalid", () => {
    expect(parsePositiveInt(undefined, 1)).toBe(1);
    expect(parsePositiveInt("", 1)).toBe(1);
    expect(parsePositiveInt("abc", 1)).toBe(1);
    expect(parsePositiveInt("-3", 1)).toBe(1);
    expect(parsePositiveInt("0", 1, 1)).toBe(1);
  });

  it("clamps to the max", () => {
    expect(parsePositiveInt("99999", 1, 1, 100)).toBe(100);
  });

  it("returns the integer value", () => {
    expect(parsePositiveInt("7", 1)).toBe(7);
  });
});

describe("readParam", () => {
  it("normalizes to lower case", () => {
    expect(readParam("AUTOMOTIVE")).toBe("automotive");
  });
  it("returns null for missing", () => {
    expect(readParam(undefined)).toBeNull();
    expect(readParam("")).toBeNull();
  });
});

describe("filterBySearch", () => {
  it("matches case-insensitively across fields", () => {
    const result = filterBySearch(records, "auto", [(r) => r.name]);
    expect(result.map((r) => r.id).sort()).toEqual(["1", "5"]);
  });
  it("keeps all when the query is empty", () => {
    expect(filterBySearch(records, null, [(r) => r.name])).toHaveLength(
      records.length,
    );
  });
});

describe("filterByFacet", () => {
  it("filters by exact value", () => {
    expect(
      filterByFacet(records, "automotive", (r) => r.vertical),
    ).toHaveLength(2);
  });
  it("keeps all on all or null", () => {
    expect(filterByFacet(records, "all", (r) => r.vertical)).toHaveLength(5);
    expect(filterByFacet(records, null, (r) => r.vertical)).toHaveLength(5);
  });
});

describe("applySort", () => {
  const sorts: SortOption<Record>[] = [
    { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
    { key: "score-desc", label: "Score", compare: (a, b) => b.score - a.score },
  ];

  it("uses the named sort", () => {
    const ids = applySort(records, "score-desc", sorts).map((r) => r.id);
    expect(ids[0]).toBe("5");
  });
  it("falls back to the first sort when key is unknown", () => {
    const ids = applySort(records, "unknown", sorts).map((r) => r.id);
    expect(ids[0]).toBe("1"); // sorted by name -> Acme Automotive (id 1) is first
  });
});

describe("paginate", () => {
  it("returns items in range and clamps the page", () => {
    const result = paginate(records, { page: 1, pageSize: 2 });
    expect(result.items).toHaveLength(2);
    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(false);
  });

  it("clamps over-shot pages to the last page", () => {
    const result = paginate(records, { page: 99, pageSize: 2 });
    expect(result.page).toBe(3);
    expect(result.items).toHaveLength(1);
    expect(result.hasNext).toBe(false);
  });

  it("handles an empty list", () => {
    const result = paginate([], { page: 1, pageSize: 5 });
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([]);
  });
});
