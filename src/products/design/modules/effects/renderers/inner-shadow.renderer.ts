import { atopShader, silhouetteShader, type EffectRenderer } from "@canvas";

import { premultiplied } from "../effect-color";
import type { InnerShadowEffect } from "../effect.types";

/**
 * An inner shadow: what's outside the content, moved, grown inward by its spread, blurred and
 * colored, laid over the result inside the content's shape.
 */
export const innerShadowRenderer: EffectRenderer<InnerShadowEffect> = {
  type: "inner-shadow",
  stage: "content",
  outset: (_e, outset) => outset,
  // Outside the shape is read as the shadow's source, so the texture reaches past it.
  margin: (e) => Math.hypot(e.x, e.y) + e.blur + Math.max(e.spread, 0),
  render(pass, e, current) {
    const offset = pass.offset(e.x, e.y);
    silhouetteShader.set({
      uOffset: [offset.x, offset.y],
      uSpread: pass.px(e.spread),
      uInvert: 1,
      uColor: premultiplied(e.color, e.opacity),
    });
    const shadow = pass.blur(pass.run(silhouetteShader, pass.content), pass.px(e.blur));
    atopShader.set({ uShape: 0 });
    atopShader.bind({ uLayer: shadow, uContent: pass.content });
    return pass.run(atopShader, current);
  },
};
