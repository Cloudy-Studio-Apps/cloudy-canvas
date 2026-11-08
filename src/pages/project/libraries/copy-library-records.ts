import { createId } from "@shared/core";
import type { TokenRecord } from "@canvas";

/**
 * A copy of a library's records that can live next to the original in the same files: every id
 * (records and the modes of axes) is replaced by a new one wherever it appears, in aliases,
 * expressions, bindings and generators included. Ids are UUIDs, so replacing them in the JSON
 * text can't touch anything else.
 */
export function copyLibraryRecords(records: readonly TokenRecord[]): TokenRecord[] {
  const ids = new Set<string>();
  for (const record of records) {
    ids.add(record.id);
    if (record.kind === "axis") for (const mode of record.modes) ids.add(mode.id);
  }
  let json = JSON.stringify(records);
  for (const id of ids) json = json.replaceAll(id, createId());
  return JSON.parse(json) as TokenRecord[];
}
