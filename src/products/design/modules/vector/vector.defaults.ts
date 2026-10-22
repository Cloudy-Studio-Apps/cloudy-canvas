import type { VectorDefaults } from "./vector.types";

export const VECTOR_DEFAULTS = {
  size: { w: 0, h: 0 },
  stroke: "#000000",
  strokeWeight: 2,
  smoothing: 2.5,
  reach: 4,
} as const satisfies VectorDefaults;
