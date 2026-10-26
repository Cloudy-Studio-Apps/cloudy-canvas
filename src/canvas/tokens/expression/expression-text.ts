import type { TokenStore } from "../token-store";
import { ExpressionError } from "./expression-error";
import { mapExpressionRefs } from "./expression-refs";
import { tokenizeExpression } from "./tokenize-expression";

/**
 * A stored expression (references by id) as people read it: each reference the variable's path,
 * else `Collection/path`, whichever reads back as that same variable (`readExpression`); else its
 * id (a name with braces, or one another variable answers to first).
 */
export function formatExpression(store: TokenStore, text: string): string {
  return mapExpressionRefs(text, (id) => {
    const variable = store.variable(id);
    if (!variable) return id;
    const collection = store.collection(variable.collectionId);
    const names = [variable.name, ...(collection ? [`${collection.name}/${variable.name}`] : [])];
    return names.find((name) => !/[{}]/.test(name) && store.find(name)?.id === id) ?? id;
  });
}

/**
 * An expression as typed (references by id, `Collection/path` or a unique path) as it's stored,
 * references by id. Throws an `ExpressionError` for a reference no variable answers to.
 */
export function readExpression(store: TokenStore, text: string): string {
  for (const token of tokenizeExpression(text)) {
    if (token.kind === "ref" && !store.find(token.ref)) {
      throw new ExpressionError(`No variable named ${token.ref}`, token.at);
    }
  }
  return mapExpressionRefs(text, (ref) => store.find(ref)?.id ?? ref);
}
