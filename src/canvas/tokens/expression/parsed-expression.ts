import { LruCache } from "../../utils";
import type { ExpressionNode } from "./expression.types";
import { parseExpression } from "./parse-expression";

/** Parsed expressions by text: resolving reads the same few texts over and over. */
const PARSED = new LruCache<string, ExpressionNode | false>(512);

/** An expression's tree, parsed once per text; `null` when it doesn't read. */
export function parsedExpression(text: string): ExpressionNode | null {
  return (
    PARSED.getOrSet(text, () => {
      try {
        return parseExpression(text);
      } catch {
        return false;
      }
    }) || null
  );
}
