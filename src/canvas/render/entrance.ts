/** How an element appears when `animateIn` plays: a quick pop with a small overshoot. */
const ENTRANCE = {
  durationMs: 320,
  /** Scale it starts from. */
  from: 0.35,
  /** Share of the animation it takes to fade in. */
  fade: 0.35,
  /** How far it overshoots before settling (easeOutBack). */
  overshoot: 2.2,
} as const;

/** The entrance's look at `elapsed` ms, or `null` once it's over. */
export function entranceAt(elapsed: number): { scale: number; alpha: number } | null {
  const t = elapsed / ENTRANCE.durationMs;
  if (t >= 1) return null;
  const p = Math.max(0, t);
  const c = ENTRANCE.overshoot;
  const eased = 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
  return {
    scale: ENTRANCE.from + (1 - ENTRANCE.from) * eased,
    alpha: Math.min(1, p / ENTRANCE.fade),
  };
}

/** How long a view built while a large page loads takes to fade in (`fadeInAt`). */
const FADE_IN_MS = 260;

/** A plain fade, for views appearing as a large page loads, or `null` once it's over. */
export function fadeInAt(elapsed: number): { scale: number; alpha: number } | null {
  const t = elapsed / FADE_IN_MS;
  if (t >= 1) return null;
  return { scale: 1, alpha: 1 - (1 - Math.max(0, t)) ** 2 };
}
