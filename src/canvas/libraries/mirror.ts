import type { CanvasDocument } from "../document";
import type { TokenRecord } from "../tokens/token.types";
import { deepEqual } from "../utils";
import { bakeRemoved } from "./bake-removed";
import type { LibraryDocument } from "./library-document";
import { libraryIdOf, taggedRecord } from "./library-tags";
import type { MirrorOptions, ReadLibraryAsset } from "./mirror.types";
import { writeUntracked } from "./untracked";

/**
 * Makes a file's copy of its project libraries match them, outside the undo history (the token
 * sync still updates the layers bound to what changed):
 *
 * - every record of these libraries is stored in the file with its library's id as `libraryId`,
 *   replacing the file's copy (the library wins);
 * - tagged records the libraries no longer have, or of libraries not in `libraries` (the file
 *   stopped using them, or the project deleted them), leave the file, baked into the layers using
 *   them first (`bakeRemoved`); those of the libraries in `options.keep` (used, but unreadable
 *   now) stay as they are;
 * - the bytes of library assets in `options.usedAssets` (the ids the file's layers show) that the
 *   file doesn't have are copied into its assets under the same ids. `readBytes` returns `null`
 *   for one it can't read (the caller says so), which is skipped.
 */
export async function mirrorLibraries(
  doc: CanvasDocument,
  libraries: readonly LibraryDocument[],
  readBytes: ReadLibraryAsset,
  options: MirrorOptions = {},
): Promise<void> {
  const keep = options.keep ?? new Set<string>();
  const assets = await missingAssets(doc, libraries, readBytes, options.usedAssets ?? new Set());
  if (options.cancelled?.()) return;

  // Read after the bytes arrive, so the newest library state is the one written.
  const wanted = new Map<string, TokenRecord>();
  for (const library of libraries) {
    for (const record of library.tokenRecords()) {
      wanted.set(record.id, taggedRecord(record, library.id));
    }
  }
  const puts = [...wanted.values()].filter(
    (record) => !deepEqual(doc.tokenRecord(record.id), record),
  );
  const removed = doc
    .tokenRecords()
    .filter((record) => {
      const libraryId = libraryIdOf(record);
      return libraryId !== undefined && !keep.has(libraryId) && !wanted.has(record.id);
    })
    .map((record) => record.id);
  if (puts.length === 0 && removed.length === 0 && assets.size === 0) return;

  writeUntracked(doc, () => {
    for (const [id, bytes] of assets) doc.addAsset(id, bytes);
    if (puts.length > 0) doc.setTokenRecords(puts);
    if (removed.length > 0) bakeRemoved(doc, removed);
  });
}

/** The bytes of the used library assets the file doesn't hold yet, by asset id. */
async function missingAssets(
  doc: CanvasDocument,
  libraries: readonly LibraryDocument[],
  readBytes: ReadLibraryAsset,
  usedAssets: ReadonlySet<string>,
): Promise<Map<string, Uint8Array>> {
  const wanted = libraries.flatMap((library) =>
    library
      .assets()
      .filter((asset) => usedAssets.has(asset.id) && !doc.hasAsset(asset.id))
      .map((asset) => ({ library, asset })),
  );
  const read = await Promise.all(wanted.map(({ library, asset }) => readBytes(library, asset)));
  const bytes = new Map<string, Uint8Array>();
  wanted.forEach(({ asset }, i) => {
    const data = read[i];
    if (data) bytes.set(asset.id, data);
  });
  return bytes;
}
