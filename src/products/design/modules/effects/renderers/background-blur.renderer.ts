import { shapeUnderShader, type EffectRenderer } from "@canvas";

import type { BackgroundBlurEffect } from "../effect.types";

/**
 * What's behind the layer blurred and laid under it inside its shape: it shows through the
 * layer's translucent fills (frosted glass), as in Figma.
 */
export const backgroundBlurRenderer: EffectRenderer<BackgroundBlurEffect> = {
  type: "background-blur",
  stage: "backdrop",
  backdrop: true,
  outset: (_e, outset) => outset,
  // What's behind is read round the shape too, so its edges blur in what's just outside it.
  margin: (e) => e.radius,
  render(pass, e, current) {
    const behind = pass.blur(pass.backdrop, pass.px(e.radius));
    shapeUnderShader.bind({ uLayer: behind, uContent: pass.content });
    return pass.run(shapeUnderShader, current);
  },
};
