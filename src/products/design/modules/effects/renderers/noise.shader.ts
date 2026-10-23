import { EffectShader, FILTER_HEADER } from "@canvas";

import { LOCAL_GLSL, LOCAL_UNIFORMS, NOISE_GLSL } from "./noise-glsl";

/**
 * Grain: square cells of `uGrain` layer units, each shown with chance `uDensity`, in `uColor`
 * (mono), `uColor` or `uSecond` (duo, `uMode` 1) or a color of its own (multi, `uMode` 2), at
 * `uOpacity`; premultiplied, to lay over the layer with `atopShader`.
 */
export const noiseShader = new EffectShader(
  "noise",
  /* glsl */ `${FILTER_HEADER}
${LOCAL_GLSL}
${NOISE_GLSL}
uniform float uGrain;
uniform float uDensity;
uniform float uMode;
uniform float uOpacity;
uniform vec3 uColor;
uniform vec3 uSecond;

void main() {
  vec2 cell = floor(localAt(vTextureCoord) / max(uGrain, 1e-3));
  if (hash(cell) >= uDensity) {
    finalColor = vec4(0.0);
    return;
  }
  vec3 color = uColor;
  if (uMode > 1.5) color = vec3(hash(cell + 1.3), hash(cell + 7.1), hash(cell + 3.7));
  else if (uMode > 0.5 && hash(cell + 11.0) < 0.5) color = uSecond;
  finalColor = vec4(color * uOpacity, uOpacity);
}`,
  {
    ...LOCAL_UNIFORMS,
    uGrain: { value: 1, type: "f32" },
    uDensity: { value: 0.5, type: "f32" },
    uMode: { value: 0, type: "f32" },
    uOpacity: { value: 0.25, type: "f32" },
    uColor: { value: new Float32Array(3), type: "vec3<f32>" },
    uSecond: { value: new Float32Array(3), type: "vec3<f32>" },
  },
);
