import type { RectangleDefaults } from "./rectangle.types";

export const RECTANGLE_DEFAULTS = {
  size: { w: 100, h: 100 },
  fill: "#D9D9D9",
  cornerRadius: 0,
} as const satisfies RectangleDefaults;
