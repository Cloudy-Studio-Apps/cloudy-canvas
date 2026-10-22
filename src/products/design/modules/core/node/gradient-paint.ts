import { defaultGradientTransform, type GradientType } from "@canvas";

import type { GradientPaint, Paint } from "./paint.types";

/** The color a gradient starts from when the paint it replaces has none (an image). */
const DEFAULT_GRADIENT_COLOR = "#D9D9D9";

const GRADIENT_TYPES: ReadonlySet<string> = new Set<GradientType>([
  "linear",
  "radial",
  "angular",
  "diamond",
]);

/** Whether the paint is a gradient. */
export function isGradientPaint(paint: Paint): paint is GradientPaint {
  return GRADIENT_TYPES.has(paint.type);
}

/**
 * A gradient of `type` replacing `from`, as Figma starts one: another gradient keeps its stops;
 * otherwise the paint's color (gray for an image) fades from full to none. The handles are the
 * type's default.
 */
export function gradientPaint(type: GradientType, from?: Paint): GradientPaint {
  const base = { opacity: from?.opacity ?? 1, visible: from?.visible ?? true };
  const transform = defaultGradientTransform(type);
  if (from && isGradientPaint(from)) return { ...from, ...base, type, transform };
  const color = from?.type === "solid" ? from.color : DEFAULT_GRADIENT_COLOR;
  return {
    type,
    stops: [
      { position: 0, color, opacity: 1 },
      { position: 1, color, opacity: 0 },
    ],
    transform,
    ...base,
  };
}
