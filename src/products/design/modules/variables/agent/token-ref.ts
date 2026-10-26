import type { StyleRecord, TokenStore, VariableRecord } from "@canvas";

/** A variable or a style by id or name; throws pointing at the listing tools. */
export function requireToken(store: TokenStore, ref: string): VariableRecord | StyleRecord {
  const token = store.find(ref) ?? store.findStyle(ref);
  if (!token) {
    throw new Error(`No variable or style "${ref}". Call list_variables or list_styles.`);
  }
  return token;
}

/** A token's name as agents read it: `Collection/path` for a variable, its name for a style. */
export function tokenName(store: TokenStore, id: string): string {
  const variable = store.variable(id);
  if (variable) {
    const collection = store.collection(variable.collectionId);
    return collection ? `${collection.name}/${variable.name}` : variable.name;
  }
  return store.style(id)?.name ?? id;
}
