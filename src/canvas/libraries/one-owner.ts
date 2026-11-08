import type { TokenRecord } from "../tokens/token.types";
import type { LibraryDocument } from "./library-document";

/**
 * `records` to write to library `libraryId` without those another of `libraries` (the project's
 * loaded ones) holds already: one id lives in one library. `released` are ids leaving a library
 * in the same write (by library id), which no longer count as held there. Each one skipped is
 * reported with `console.warn`.
 */
export function withoutForeignRecords(
  records: readonly TokenRecord[],
  libraryId: string,
  libraries: readonly LibraryDocument[],
  released: ReadonlyMap<string, ReadonlySet<string>> = new Map(),
): TokenRecord[] {
  if (records.length === 0) return [];
  const owners = new Map<string, string>();
  for (const library of libraries) {
    if (library.id === libraryId) continue;
    const gone = released.get(library.id);
    for (const record of library.tokenRecords()) {
      if (!gone?.has(record.id)) owners.set(record.id, library.id);
    }
  }
  if (owners.size === 0) return [...records];
  return records.filter((record) => {
    const owner = owners.get(record.id);
    if (owner === undefined) return true;
    console.warn(
      `Library ${libraryId}: skipped ${record.kind} ${record.id}, which library ${owner} holds already`,
    );
    return false;
  });
}
