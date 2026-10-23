import type { EffectRenderer } from "@canvas";

import type { GlassEffect } from "../effect.types";
import { glassShader } from "./glass.shader";

/**
 * Liquid glass: what's behind the layer frosted and bent at its edges (with rainbow fringes),
 * its rim lit from the light's side, under the layer inside its shape.
 */
export const glassRenderer: EffectRenderer<GlassEffect> = {
  type: "glass",
  stage: "backdrop",
  backdrop: true,
  outset: (_e, outset) => outset,
  margin: (e) => e.depth + e.frost,
  render(pass, e, current) {
    const field = pass.blur(pass.content, pass.px(Math.max(e.depth, 0.5)));
    const behind = pass.blur(pass.backdrop, pass.px(e.frost));
    const angle = (e.lightAngle * Math.PI) / 180;
    // Counterclockwise from the right, turned with the layer; screen y points down.
    const light = pass.offset(Math.cos(angle), -Math.sin(angle));
    const length = Math.hypot(light.x, light.y) || 1;
    glassShader.set({
      uBend: pass.px(e.depth) * Math.min(Math.max(e.refraction, 0), 1),
      uDispersion: Math.min(Math.max(e.dispersion, 0), 1),
      uLight: [light.x / length, light.y / length],
      uIntensity: Math.min(Math.max(e.lightIntensity, 0), 1),
      uSplay: e.splay,
    });
    glassShader.bind({ uContent: pass.content, uField: field, uBehind: behind });
    return pass.run(glassShader, current);
  },
};
