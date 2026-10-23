import { EffectShader, FILTER_HEADER } from "@canvas";

import { LOCAL_GLSL, LOCAL_UNIFORMS } from "./noise-glsl";

/**
 * Mixes the sharp result (`uTexture`), half (`uHalf`) and full blur (`uFull`) along a line in the
 * layer's box: no more than `uStartBlur` (as a share of the full blur) at `uStart`, all of it at
 * `uEnd`. `localAt` maps texture coordinates into the layer; `uSize` is its box.
 */
export const progressiveBlurShader = new EffectShader(
  "progressive-blur",
  /* glsl */ `${FILTER_HEADER}
uniform sampler2D uHalf;
uniform sampler2D uFull;
uniform vec2 uStart;
uniform vec2 uEnd;
uniform float uStartBlur;
${LOCAL_GLSL}

void main() {
  vec2 local = localAt(vTextureCoord) / max(uSize, vec2(1e-3));
  vec2 line = uEnd - uStart;
  float t = clamp(dot(local - uStart, line) / max(dot(line, line), 1e-6), 0.0, 1.0);
  float amount = mix(uStartBlur, 1.0, t);
  vec4 sharp = texture(uTexture, vTextureCoord);
  vec4 half_ = texture(uHalf, vTextureCoord);
  vec4 full = texture(uFull, vTextureCoord);
  finalColor = amount < 0.5 ? mix(sharp, half_, amount * 2.0) : mix(half_, full, amount * 2.0 - 1.0);
}`,
  {
    uStart: { value: new Float32Array(2), type: "vec2<f32>" },
    uEnd: { value: new Float32Array(2), type: "vec2<f32>" },
    uStartBlur: { value: 0, type: "f32" },
    ...LOCAL_UNIFORMS,
  },
  ["uHalf", "uFull"],
);
