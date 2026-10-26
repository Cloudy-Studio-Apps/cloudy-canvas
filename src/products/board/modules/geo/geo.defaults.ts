import type { GeoDefaults } from "./geo.types";

/** Geo element typography and outline, in world units. Sizes come from each variant. */
export const GEO_DEFAULTS = {
  fontSize: 16,
  padding: 12,
  strokeWidth: 2,
  /** Its color fields and the options that pick them. */
  colorOptions: { fill: "shapeFill", stroke: "shapeStroke" },
} as const satisfies GeoDefaults;
