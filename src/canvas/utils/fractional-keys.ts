import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";

/**
 * A fractional key that sorts between `a` and `b` (`null` is an open end): elements' `index` and
 * variables' `order`. The engine owns the dependency, so modules and plugins use these.
 */
export function keyBetween(a: string | null, b: string | null): string {
  return generateKeyBetween(a, b);
}

/** `n` fractional keys in order between `a` and `b` (`null` is an open end). */
export function nKeysBetween(a: string | null, b: string | null, n: number): string[] {
  return generateNKeysBetween(a, b, n);
}
