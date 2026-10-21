import type { GeoKind } from "./shapes.types";
import type { Size } from "../geometry.types";

/** Size of a shape placed with a click, per kind. */
export const GEO_DEFAULT_SIZES: Record<GeoKind, Size> = {
  rectangle: { w: 160, h: 100 },
  rounded: { w: 160, h: 100 },
  ellipse: { w: 120, h: 120 },
  diamond: { w: 140, h: 120 },
  triangle: { w: 130, h: 120 },
  parallelogram: { w: 170, h: 100 },
  cylinder: { w: 120, h: 140 },
  star: { w: 130, h: 130 },
};

/** Every kind, in the order the shape picker shows them. */
export const GEO_KINDS: readonly GeoKind[] = [
  "rectangle",
  "rounded",
  "ellipse",
  "diamond",
  "triangle",
  "parallelogram",
  "cylinder",
  "star",
];
