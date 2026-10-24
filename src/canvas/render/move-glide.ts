/** How elements an edit moved glide to their new place (`animateMoves`). */
export const MOVE_GLIDE = {
  durationMs: 280,
  /**
   * The most a glide advances in one drawn frame: when the app is busy, the glide slows down
   * instead of being over by the time a frame is drawn.
   */
  maxStepMs: 1000 / 30,
} as const;

/**
 * The share of the way still to go at `elapsed` ms (easeOutCubic: fast, then settling), or `null`
 * once the glide is over.
 */
export function moveGlideAt(elapsed: number): number | null {
  const t = elapsed / MOVE_GLIDE.durationMs;
  if (t >= 1) return null;
  return (1 - Math.max(0, t)) ** 3;
}
