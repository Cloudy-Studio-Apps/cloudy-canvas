import { mapExpressionRefs, parseExpression, tokenizeExpression } from "../expression";

/**
 * A token file's worked-out number (`{space.base} * 2`, Tokens Studio's math, our DTCG
 * extension's `2 * 8`) as an expression of ours, each `{reference}` turned into a variable id
 * with `refOf`. `null` when it doesn't read or names a token not there.
 */
export function readExchangeExpression(
  value: unknown,
  refOf: (reference: string) => string | null,
): { expr: string } | null {
  if (typeof value !== "string") return null;
  try {
    parseExpression(value);
    const refs = tokenizeExpression(value).flatMap((t) => (t.kind === "ref" ? [t.ref] : []));
    if (refs.some((ref) => refOf(ref) === null)) return null;
  } catch {
    return null;
  }
  return { expr: mapExpressionRefs(value.trim(), (ref) => refOf(ref) ?? ref) };
}
