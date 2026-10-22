import { IDENTITY_TRANSFORM, gradientCss, type Gradient } from "@canvas";

/** The gradient's stops left to right as CSS, whatever its type and placement. */
export function stopRampCss(gradient: Gradient): string {
  return gradientCss({ ...gradient, type: "linear", transform: IDENTITY_TRANSFORM });
}
