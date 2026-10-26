import { gradientCss } from "@canvas";
import { isGradientPaint } from "../../node/gradient-paint";
import type { Paint } from "../../node/paint.types";

/** How a paint looks as a CSS background (pictures as a neutral gray). */
export function paintCss(paint: Paint): string {
  if (paint.type === "solid") {
    const alpha = Math.round(Math.max(0, Math.min(1, paint.opacity)) * 255);
    return `${paint.color}${alpha.toString(16).padStart(2, "0")}`;
  }
  if (isGradientPaint(paint)) return gradientCss(paint, { w: 1, h: 1 }, paint.opacity);
  return "var(--muted)";
}
