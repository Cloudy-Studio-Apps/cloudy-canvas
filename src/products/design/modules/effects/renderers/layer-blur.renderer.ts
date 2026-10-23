import type { EffectRenderer } from "@canvas";

import type { LayerBlurEffect } from "../effect.types";
import { localUniforms } from "./local-uniforms";
import { progressiveBlurShader } from "./progressive-blur.shader";

/**
 * The result so far blurred: evenly, or progressively from `start` to `end` (a sharp, a half and
 * a full blur mixed along the line).
 */
export const layerBlurRenderer: EffectRenderer<LayerBlurEffect> = {
  type: "layer-blur",
  stage: "filter",
  outset: (e, outset) => outset + e.radius,
  render(pass, e, current) {
    const full = pass.blur(current, pass.px(e.radius));
    if (!e.progressive) return full;
    const half = pass.blur(current, pass.px(e.radius / 2));
    progressiveBlurShader.set({
      ...localUniforms(pass),
      uStart: [e.start.x, e.start.y],
      uEnd: [e.end.x, e.end.y],
      uStartBlur: e.radius > 0 ? Math.min(e.startRadius / e.radius, 1) : 0,
    });
    progressiveBlurShader.bind({ uHalf: half, uFull: full });
    return pass.run(progressiveBlurShader, current);
  },
};
