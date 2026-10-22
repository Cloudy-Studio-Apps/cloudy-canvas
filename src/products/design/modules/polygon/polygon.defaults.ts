import type { PolygonDefaults } from "./polygon.types";

export const POLYGON_DEFAULTS = {
  size: { w: 100, h: 100 },
  fill: "#D9D9D9",
  pointCount: 3,
  minPoints: 3,
  maxPoints: 60,
} as const satisfies PolygonDefaults;
