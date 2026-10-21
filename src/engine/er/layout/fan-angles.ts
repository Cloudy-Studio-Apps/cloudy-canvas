/** Angle kept free on each side of a line leaving the owner. */
const RESERVE = (28 * Math.PI) / 180;
/** Preferred angle between neighbouring attributes. */
const STEP = (38 * Math.PI) / 180;

/**
 * `count` directions spread over the free gaps between the blocked angles. Items go to gaps in
 * proportion to their size, and sit together in the middle of the gap rather than spread thin.
 */
export function fanAngles(count: number, blocked: readonly number[]): number[] {
  if (count === 0) return [];
  if (blocked.length === 0) {
    // Nothing to avoid: start at the top and go round.
    const step = Math.min(STEP * 1.4, (2 * Math.PI) / count);
    const start = -Math.PI / 2 - (step * (count - 1)) / 2;
    return Array.from({ length: count }, (_, i) => start + i * step);
  }
  const sorted = [...blocked].map(normalize).sort((a, b) => a - b);
  const gaps = sorted.map((a, i) => {
    const next = i + 1 < sorted.length ? sorted[i + 1]! : sorted[0]! + 2 * Math.PI;
    const start = a + RESERVE;
    return { start, size: Math.max(0, next - RESERVE - start) };
  });
  const counts = allocate(
    count,
    gaps.map((gap) => gap.size),
    gaps.map(upness),
  );
  const angles: number[] = [];
  gaps.forEach((gap, i) => {
    const n = counts[i] ?? 0;
    if (n === 0) return;
    const span = Math.min(gap.size, STEP * (n - 1));
    const first = gap.start + (gap.size - span) / 2;
    for (let k = 0; k < n; k++) angles.push(first + (n === 1 ? 0 : (span * k) / (n - 1)));
  });
  return angles;
}

/** How close a gap's middle is to straight up (1) rather than straight down (0). */
function upness(gap: { start: number; size: number }): number {
  return (1 - Math.sin(gap.start + gap.size / 2)) / 2;
}

/** Splits `count` items over weights by largest remainder; ties go to the higher `preference`. */
function allocate(
  count: number,
  weights: readonly number[],
  preference: readonly number[],
): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return weights.map((_, i) => (i === 0 ? count : 0));
  const exact = weights.map((w) => (count * w) / total);
  const counts = exact.map(Math.floor);
  let left = count - counts.reduce((a, b) => a + b, 0);
  const order = exact
    .map((value, i) => ({ i, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || (preference[b.i] ?? 0) - (preference[a.i] ?? 0));
  for (const { i } of order) {
    if (left <= 0) break;
    counts[i] = (counts[i] ?? 0) + 1;
    left--;
  }
  return counts;
}

function normalize(angle: number): number {
  const full = 2 * Math.PI;
  return ((angle % full) + full) % full;
}
