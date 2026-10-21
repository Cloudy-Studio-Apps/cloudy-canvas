import type { GeoKind } from "@engine";

export const GEO_KIND_LABELS: Record<GeoKind, string> = {
  rectangle: "Rectangle",
  rounded: "Rounded rectangle",
  ellipse: "Ellipse",
  diamond: "Diamond",
  triangle: "Triangle",
  parallelogram: "Parallelogram",
  cylinder: "Cylinder",
  star: "Star",
};
