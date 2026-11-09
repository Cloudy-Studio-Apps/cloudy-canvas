import type { TokenStore } from "./token-store";
import type { TokenRecord } from "./token.types";

/**
 * The library tag a new record of a collection takes: its collection's (`{ libraryId }`), or none
 * for the file's own. A collection's variables, generators and scales always share its source.
 */
export function collectionSource(store: TokenStore, collectionId: string): { libraryId?: string } {
  const libraryId = store.collection(collectionId)?.libraryId;
  return libraryId === undefined ? {} : { libraryId };
}

/** The record with the library tag `libraryId` (`undefined`: the file's own). */
export function withLibraryTag<R extends TokenRecord>(record: R, libraryId: string | undefined): R {
  if (record.libraryId === libraryId) return record;
  const copy = { ...record };
  if (libraryId === undefined) delete copy.libraryId;
  else copy.libraryId = libraryId;
  return copy;
}

/**
 * Records about to be written together (an import, a paste) with each variable, generator and
 * scale taking its collection's tag: the collection's among `records`, else the file's.
 */
export function withCollectionSources(
  records: readonly TokenRecord[],
  store: TokenStore,
): TokenRecord[] {
  const tags = new Map<string, string | undefined>();
  for (const record of records) {
    if (record.kind === "collection") tags.set(record.id, record.libraryId);
  }
  return records.map((record) => {
    if (!("collectionId" in record)) return record;
    const libraryId = tags.has(record.collectionId)
      ? tags.get(record.collectionId)
      : store.collection(record.collectionId)?.libraryId;
    return withLibraryTag(record, libraryId);
  });
}
