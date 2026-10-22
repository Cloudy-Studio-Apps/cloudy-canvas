import type { LineDefaults } from "./line.types";

export const LINE_DEFAULTS = {
  size: { w: 100, h: 0 },
  stroke: "#000000",
  arrow: { perWeight: 6, min: 8 },
  reach: 4,
} as const satisfies LineDefaults;
