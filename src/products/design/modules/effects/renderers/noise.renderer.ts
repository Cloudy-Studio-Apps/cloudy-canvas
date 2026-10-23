import { atopShader, type EffectRenderer } from "@canvas";

import { rgb } from "../effect-color";
import type { NoiseEffect } from "../effect.types";
import { localUniforms } from "./local-uniforms";
import { noiseShader } from "./noise.shader";

const MODES = { mono: 0, duo: 1, multi: 2 } as const;

/** Grain laid over the layer inside its shape, fixed to the layer. */
export const noiseRenderer: EffectRenderer<NoiseEffect> = {
  type: "noise",
  stage: "content",
  outset: (_e, outset) => outset,
  render(pass, e, current) {
    noiseShader.set({
      ...localUniforms(pass),
      uGrain: Math.max(e.size, 0.01),
      uDensity: Math.min(Math.max(e.density, 0), 1),
      uMode: MODES[e.noiseType],
      uOpacity: Math.min(Math.max(e.opacity, 0), 1),
      uColor: rgb(e.color),
      uSecond: rgb(e.secondColor),
    });
    const grain = pass.run(noiseShader, current);
    atopShader.set({ uShape: 0 });
    atopShader.bind({ uLayer: grain, uContent: pass.content });
    return pass.run(atopShader, current);
  },
};
