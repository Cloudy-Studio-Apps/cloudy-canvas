/** Numbers closer than this are the same value (layouts round, resizes clamp), as variables use. */
const EPSILON = 1e-3;

const HEX = /^#[0-9a-f]{3,8}$/i;

/**
 * Whether a field already holds a value: numbers within `EPSILON`, colors in either case, the
 * rest by structure. A sync that compares this way writes nothing on its second pass.
 */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < EPSILON;
  if (typeof a === "string" && typeof b === "string") {
    return HEX.test(a) && HEX.test(b) && a.toUpperCase() === b.toUpperCase();
  }
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const x = a as Record<string, unknown>;
  const y = b as Record<string, unknown>;
  const keys = Object.keys(x).filter((key) => x[key] !== undefined);
  const other = Object.keys(y).filter((key) => y[key] !== undefined);
  return keys.length === other.length && keys.every((key) => sameValue(x[key], y[key]));
}
