import { nKeysBetween } from "@canvas";

/**
 * Indexes that put items in the given order after `after`, moving as few as can be: `current` is
 * each item's index now (`null` for a new one). The longest run already in order (and after
 * `after`) keeps its indexes (`null` in the result); the others get keys between their kept
 * neighbours.
 */
export function orderKeys(after: string, current: readonly (string | null)[]): (string | null)[] {
  // Longest strictly increasing run of the indexes past `after` (patience sorting).
  const tails: number[] = [];
  const previous: number[] = new Array(current.length).fill(-1);
  current.forEach((index, i) => {
    if (index === null || index <= after) return;
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((current[tails[mid] as number] as string) < index) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) previous[i] = tails[lo - 1] as number;
    tails[lo] = i;
  });
  const keep = new Set<number>();
  for (let i = tails[tails.length - 1] ?? -1; i >= 0; i = previous[i] as number) keep.add(i);

  const out: (string | null)[] = new Array(current.length).fill(null);
  let lower: string = after;
  let start = 0;
  for (let i = 0; i <= current.length; i++) {
    if (i < current.length && !keep.has(i)) continue;
    const upper = i < current.length ? (current[i] as string) : null;
    const keys = nKeysBetween(lower, upper, i - start);
    keys.forEach((key, n) => (out[start + n] = key));
    if (upper !== null) lower = upper;
    start = i + 1;
  }
  return out;
}
