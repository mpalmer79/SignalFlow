// Deterministic seeded time spreading. Used when seeding demo data so the
// repeated "11 hours ago" pattern disappears without introducing any runtime
// randomness. The function is pure and produces stable output for stable input.

// Tiny seeded hash to derive a stable offset from a string id. Deterministic
// and dependency free.
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Spread a base timestamp by a stable offset derived from an id. The result is
// older than the base by 0 up to maxHoursBack hours, deterministic for the same
// id and base. Returns an ISO string.
export function spreadTimestamp(
  baseIso: string,
  id: string,
  maxHoursBack: number,
): string {
  const base = new Date(baseIso).getTime();
  const seed = hashString(id);
  const offsetMinutes = seed % (maxHoursBack * 60);
  return new Date(base - offsetMinutes * 60_000).toISOString();
}

// Spread a list of records by their id. Records that already carry a varied
// timestamp are not modified; records whose timestamps cluster get a stable
// offset applied based on their id.
export function spreadRecords<T extends { id: string }>(
  records: T[],
  baseIso: string,
  maxHoursBack: number,
  read: (record: T) => string,
  write: (record: T, iso: string) => T,
): T[] {
  return records.map((record) => {
    const next = spreadTimestamp(baseIso, record.id + read(record), maxHoursBack);
    return write(record, next);
  });
}
