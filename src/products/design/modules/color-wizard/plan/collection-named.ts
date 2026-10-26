import type { CollectionRecord, DocumentTokens } from "@canvas";

/** The collection with this name, made when there's none. */
export function collectionNamed(tokens: DocumentTokens, name: string): CollectionRecord {
  return (
    tokens
      .store()
      .collections()
      .find((c) => c.name === name) ?? tokens.createCollection(name)
  );
}
