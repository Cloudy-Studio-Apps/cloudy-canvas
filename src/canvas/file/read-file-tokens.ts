import { CanvasDocument } from "../document";
import { ElementKinds } from "../elements/element.kinds";
import { migrateCollectionModes, type TokenRecord } from "../tokens";
import { decodeCanvasFile } from "./canvas-file";
import type { CanvasFileKind } from "./read-file-tokens.types";

/**
 * The variables, styles, collections and modes of a canvas file of `kind`, read without opening
 * it in an editor (tokens from before mode axes brought up to date in memory). Elements aren't
 * read, so any product's kinds will do (none by default). Throws for files of another kind.
 */
export function readFileTokens(
  bytes: Uint8Array,
  kind: CanvasFileKind,
  kinds: ElementKinds = new ElementKinds(),
): TokenRecord[] {
  const update = decodeCanvasFile(kind.magic, bytes, kind.noun);
  const records = CanvasDocument.fromUpdate(kinds, update).tokenRecords();
  const migration = migrateCollectionModes(records);
  if (!migration) return records;
  const replaced = new Map(migration.records.map((r) => [r.id, r]));
  return [
    ...records.map((r) => replaced.get(r.id) ?? r),
    ...migration.records.filter((r) => !records.some((o) => o.id === r.id)),
  ];
}

/** The magic a canvas file starts with (`"CCDS"`, `"CCBD"`), or `null` for other bytes. */
export function canvasFileMagic(bytes: Uint8Array): string | null {
  if (bytes.length < 8) return null;
  const magic = String.fromCharCode(...bytes.subarray(0, 4));
  return /^CC[A-Z]{2}$/.test(magic) ? magic : null;
}
