import { prefersReducedMotion } from "@canvas";

import type { PrototypeDirection, PrototypeTransition } from "../../model";

/** The Gentle spring easing: it overshoots a little and settles. */
const SPRING = "cubic-bezier(.34, 1.56, .64, 1)";

/** Where things move, in % of their size: `left`, what comes in comes from the right. */
const VECTORS: Record<PrototypeDirection, readonly [number, number]> = {
  left: [100, 0],
  right: [-100, 0],
  up: [0, 100],
  down: [0, -100],
};

export const FADE_IN: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
export const FADE_OUT: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }];

/** A `translate()` along the direction, `k` times its vector (1: where a new screen comes from). */
export function shift(direction: PrototypeDirection, k = 1): string {
  const [x, y] = VECTORS[direction];
  return `translate(${x * k}%, ${y * k}%)`;
}

/** Keyframes with a transition's duration and easing, held at both ends (`fill: both`). */
export function play(el: HTMLElement, frames: Keyframe[], t: PrototypeTransition): Animation {
  return el.animate(frames, {
    duration: t.duration,
    easing: t.easing === "spring" ? SPRING : t.easing,
    fill: "both",
  });
}

/** Whether a transition shows at once: `instant`, no duration, or reduced motion. */
export function isInstant(t: PrototypeTransition): boolean {
  return t.animation === "instant" || t.duration <= 0 || prefersReducedMotion();
}

/** Waits for animations to end (a cancelled one counts as ended). */
export async function settle(animations: readonly Animation[]): Promise<void> {
  await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
}
