import type { TokenStore } from "./token-store";

/**
 * The library tag a new record of a collection takes: its collection's (`{ libraryId }`), or none
 * for the file's own. A collection's variables, generators and scales always share its source.
 */
export function collectionSource(store: TokenStore, collectionId: string): { libraryId?: string } {
  const libraryId = store.collection(collectionId)?.libraryId;
  return libraryId === undefined ? {} : { libraryId };
}
