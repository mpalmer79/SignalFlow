// Pure list control helpers. They operate on plain arrays of records and use
// only data, never DOM or framework code. URL-driven page components apply
// these helpers to filter, sort, and paginate server-rendered lists without a
// new client state system. Easy to test.

export interface PaginationInput {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Parse a positive integer from a query string parameter. Returns the fallback
// when the value is missing, not a number, or out of range.
export function parsePositiveInt(
  raw: string | string[] | undefined,
  fallback: number,
  min = 1,
  max = 10000,
): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const intValue = Math.floor(parsed);
  if (intValue < min) return fallback;
  if (intValue > max) return max;
  return intValue;
}

// Read a single string value from a query string parameter, normalized to lower
// case for stable matching.
export function readParam(
  raw: string | string[] | undefined,
): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  return value.trim().toLowerCase();
}

// Apply a case insensitive substring search across a set of fields on each
// record. Records that match any of the listed fields are kept.
export function filterBySearch<T>(
  items: T[],
  query: string | null,
  fields: Array<(item: T) => string | null | undefined>,
): T[] {
  if (!query) return items;
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return items;
  return items.filter((item) =>
    fields.some((read) => {
      const value = read(item);
      return typeof value === "string"
        ? value.toLowerCase().includes(needle)
        : false;
    }),
  );
}

// Apply a single facet filter. A null or "all" facet keeps every record.
export function filterByFacet<T>(
  items: T[],
  facet: string | null,
  read: (item: T) => string | null | undefined,
): T[] {
  if (!facet || facet === "all") return items;
  return items.filter((item) => {
    const value = read(item);
    return typeof value === "string"
      ? value.toLowerCase() === facet
      : false;
  });
}

export interface SortOption<T> {
  key: string;
  label: string;
  compare: (a: T, b: T) => number;
}

// Apply a named sort option. An unknown key falls back to the first option,
// which represents the default sort.
export function applySort<T>(
  items: T[],
  sortKey: string | null,
  options: SortOption<T>[],
): T[] {
  if (options.length === 0) return items;
  const selected = options.find((option) => option.key === sortKey) ?? options[0];
  return items.slice().sort(selected.compare);
}

// Paginate. Returns the slice plus complete pagination metadata. Pages are
// clamped to a valid range so a user cannot navigate past the last page.
export function paginate<T>(
  items: T[],
  { page, pageSize }: PaginationInput,
): PaginationResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const start = (clampedPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: clampedPage,
    pageSize,
    total,
    totalPages,
    hasPrevious: clampedPage > 1,
    hasNext: clampedPage < totalPages,
  };
}
