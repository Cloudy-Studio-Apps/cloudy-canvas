import { untaggedRecord, type TokenRecord } from "@canvas";
import { createId } from "@shared/core";

/**
 * A copy of records that can live next to the originals in the same project: the ids of the
 * records `renew` picks (all by default), and of the modes of those that are axes, are replaced
 * by new ones wherever they appear, in aliases, expressions, bindings, mode keys and generators
 * included; every record comes back untagged (a library stores them without `libraryId`). Ids
 * are UUIDs, so replacing them in the JSON text can't touch anything else.
 */
export function copyLibraryRecords(
  records: readonly TokenRecord[],
  renew: (record: TokenRecord) => boolean = () => true,
): TokenRecord[] {
  const ids = new Set<string>();
  for (const record of records) {
    if (!renew(record)) continue;
    ids.add(record.id);
    if (record.kind === "axis") for (const mode of record.modes) ids.add(mode.id);
  }
  let json = JSON.stringify(records.map(untaggedRecord));
  for (const id of ids) json = json.replaceAll(id, createId());
  return JSON.parse(json) as TokenRecord[];
}
