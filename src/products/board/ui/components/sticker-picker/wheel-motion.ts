import type { CSSProperties } from "react";

/** A slight overshoot, so things pop rather than slide. */
const POP_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/** The wheel's opening: it grows out of the toolbar, then its stickers pop in around the ring. */
export const WHEEL_MOTION = {
  /** Classes of each animated piece (`tw-animate-css`); none with reduced motion. */
  wheelClass: "animate-in fade-in-0 zoom-in-75 slide-in-from-bottom-4 motion-reduce:animate-none",
  popClass: "animate-in fade-in-0 zoom-in-50 motion-reduce:animate-none",
  wheel: { durationMs: 220, delayMs: 0 },
  center: { durationMs: 260, delayMs: 60 },
  /** The first slot's timing; each next one starts `staggerMs` later. */
  slot: { durationMs: 280, delayMs: 90 },
  staggerMs: 30,
} as const;

/** Inline timing for an entrance; it stays hidden until its delay is over. */
export function popTiming(durationMs: number, delayMs: number): CSSProperties {
  return {
    animationDuration: `${durationMs}ms`,
    animationDelay: `${delayMs}ms`,
    animationTimingFunction: POP_EASE,
    animationFillMode: "both",
  };
}

/** Timing of the slot at `slot` on the ring. */
export function slotTiming(slot: number): CSSProperties {
  const { durationMs, delayMs } = WHEEL_MOTION.slot;
  return popTiming(durationMs, delayMs + slot * WHEEL_MOTION.staggerMs);
}
