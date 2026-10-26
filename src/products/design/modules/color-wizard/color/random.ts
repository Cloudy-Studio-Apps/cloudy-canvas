import type { Random } from "./color.types";

/** A seeded random source (mulberry32), so a seed always gives the same palette. */
export function seededRandom(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A number between `lo` and `hi`. */
export const between = (random: Random, lo: number, hi: number): number =>
  lo + random() * (hi - lo);

/** One of `items` (it must not be empty). */
export function pickOne<T>(random: Random, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)] as T;
}
