import { gradientCss, type Gradient } from "@canvas";

/** The gradient as CSS for a small square preview. */
export function gradientPreviewCss(gradient: Gradient, opacity = 1): string {
  return gradientCss(gradient, { w: 1, h: 1 }, opacity);
}
