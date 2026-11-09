/**
 * Whether two JSON schemas (or any JSON values) are equal: objects by their keys whatever their
 * order, arrays item by item in order. A product's shared tool must take the same arguments in
 * both products, so the server compares their `inputSchema`s with this.
 */
export function sameSchema(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => sameSchema(item, b[index]))
    );
  }
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left).filter((key) => left[key] !== undefined);
  const otherKeys = Object.keys(right).filter((key) => right[key] !== undefined);
  return (
    keys.length === otherKeys.length &&
    keys.every((key) => Object.hasOwn(right, key) && sameSchema(left[key], right[key]))
  );
}
