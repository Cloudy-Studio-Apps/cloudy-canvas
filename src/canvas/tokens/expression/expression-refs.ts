import { parseExpression } from "./parse-expression";
import { tokenizeExpression } from "./tokenize-expression";

/** The references an expression's text names, each once, in order; none when it doesn't read. */
export function expressionRefs(text: string): string[] {
  try {
    parseExpression(text);
    const refs = tokenizeExpression(text).flatMap((t) => (t.kind === "ref" ? [t.ref] : []));
    return [...new Set(refs)];
  } catch {
    return [];
  }
}

/** The text with each `{reference}` rewritten by `map`; everything else stays as typed. */
export function mapExpressionRefs(text: string, map: (ref: string) => string): string {
  return text.replace(/\{([^}]*)\}/g, (_, ref: string) => `{${map(ref.trim())}}`);
}
