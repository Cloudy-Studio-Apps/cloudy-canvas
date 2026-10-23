import type { EffectRenderer } from "@canvas";

import type { TextureEffect } from "../effect.types";
import { localUniforms } from "./local-uniforms";
import { textureShader } from "./texture.shader";

/** The layer's edges and fills pushed about by noise fixed to the layer: paper, stone, chalk. */
export const textureRenderer: EffectRenderer<TextureEffect> = {
  type: "texture",
  stage: "content",
  outset: (e, outset) => (e.clipToShape ? outset : outset + e.radius),
  render(pass, e, current) {
    textureShader.set({
      ...localUniforms(pass),
      uGrain: Math.max(e.size, 0.01),
      uPush: pass.px(e.radius),
      uClip: e.clipToShape ? 1 : 0,
    });
    textureShader.bind({ uContent: pass.content });
    return pass.run(textureShader, current);
  },
};
