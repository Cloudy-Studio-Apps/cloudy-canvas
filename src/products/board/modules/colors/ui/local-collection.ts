import { libraryIdOf, type CollectionRecord, type DocumentTokens } from "@canvas";

/**
 * The collection a new color goes into: the board's first own collection (a library's colors are
 * never the place for it), or a new one named "Colors".
 */
export function localCollection(tokens: DocumentTokens): CollectionRecord {
  return (
    tokens
      .store()
      .collections()
      .find((collection) => libraryIdOf(collection) === undefined) ??
    tokens.createCollection("Colors")
  );
}
