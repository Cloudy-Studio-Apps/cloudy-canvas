/**
 * Page positions (0-based) as a reader sees them: one at a time, or with facing pages the first
 * alone (the cover) and then pairs, the last one alone when the count is even.
 */
export function brochureSpreads(count: number, facing: boolean): number[][] {
  const spreads: number[][] = [];
  if (!facing) {
    for (let i = 0; i < count; i++) spreads.push([i]);
    return spreads;
  }
  if (count > 0) spreads.push([0]);
  for (let i = 1; i < count; i += 2) spreads.push(i + 1 < count ? [i, i + 1] : [i]);
  return spreads;
}
