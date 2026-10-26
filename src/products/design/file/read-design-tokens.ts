import {
  CanvasDocument,
  migrateCollectionModes,
  type ElementKinds,
  type TokenRecord,
} from "@canvas";

import { decodeDesignFile } from "./design-file";

/**
 * The variables, styles, collections and modes of a `.cdesign` file, read without opening it as
 * an editor (tokens from before mode axes brought up to date in memory). Throws for other files.
 */
export function readDesignTokens(bytes: Uint8Array, kinds: ElementKinds): TokenRecord[] {
  const records = CanvasDocument.fromUpdate(kinds, decodeDesignFile(bytes)).tokenRecords();
  const migration = migrateCollectionModes(records);
  if (!migration) return records;
  const replaced = new Map(migration.records.map((r) => [r.id, r]));
  return [
    ...records.map((r) => replaced.get(r.id) ?? r),
    ...migration.records.filter((r) => !records.some((o) => o.id === r.id)),
  ];
}
