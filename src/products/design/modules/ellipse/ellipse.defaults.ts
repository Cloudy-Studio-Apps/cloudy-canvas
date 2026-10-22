import type { EllipseDefaults } from "./ellipse.types";

export const ELLIPSE_DEFAULTS = {
  size: { w: 100, h: 100 },
  fill: "#D9D9D9",
} as const satisfies EllipseDefaults;
