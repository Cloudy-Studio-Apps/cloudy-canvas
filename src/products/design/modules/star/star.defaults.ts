import type { StarDefaults } from "./star.types";

export const STAR_DEFAULTS = {
  size: { w: 100, h: 100 },
  fill: "#D9D9D9",
  pointCount: 5,
  innerRadius: 0.382,
  minPoints: 3,
  maxPoints: 60,
} as const satisfies StarDefaults;
