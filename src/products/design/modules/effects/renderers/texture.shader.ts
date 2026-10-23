import { EffectShader, FILTER_HEADER } from "@canvas";

import { LOCAL_GLSL, LOCAL_UNIFORMS, NOISE_GLSL } from "./noise-glsl";

/**
 * Roughness: the input read from places pushed by smooth noise (`uGrain` layer units across,
 * `uPush` CSS pixels far), cut back to `uContent`'s shape when `uClip`.
 */
export const textureShader = new EffectShader(
  "texture",
  /* glsl */ `${FILTER_HEADER}
${LOCAL_GLSL}
${NOISE_GLSL}
uniform sampler2D uContent;
uniform float uGrain;
uniform float uPush;
uniform float uClip;

void main() {
  vec2 p = localAt(vTextureCoord) / max(uGrain, 1e-3);
  vec2 push = vec2(valueNoise(p), valueNoise(p + vec2(17.3, 5.1))) * 2.0 - 1.0;
  vec4 color = sampleIn(uTexture, vTextureCoord + px(push * uPush));
  if (uClip > 0.5) color *= texture(uContent, vTextureCoord).a;
  finalColor = color;
}`,
  {
    ...LOCAL_UNIFORMS,
    uGrain: { value: 4, type: "f32" },
    uPush: { value: 2, type: "f32" },
    uClip: { value: 1, type: "f32" },
  },
  ["uContent"],
);
