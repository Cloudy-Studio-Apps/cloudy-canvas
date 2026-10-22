import type { StrokeDefaults } from "./stroke.types";

/** Strokes are pens by default; the highlighter draws flat-ended and translucent. */
export const STROKE_DEFAULTS = {
  pen: "pen",
  pens: {
    pen: { thinning: 0.15, smoothing: 0.6, streamline: 0.45, caps: true, alpha: 1 },
    highlighter: { thinning: 0, smoothing: 0.7, streamline: 0.6, caps: false, alpha: 0.4 },
  },
  smoothTolerance: 2.5,
  smoothPasses: 2,
  maxSize: 64,
} as const satisfies StrokeDefaults;
