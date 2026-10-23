import type { DesignEffect, DesignEffectType } from "./effect.types";

/**
 * A new shader effect's code: a vignette that shows what the code can use. `effect` gets the
 * layer's color at `uv` (premultiplied) and the point in the layer's own units; uniforms with an
 * `@range`, `@color` or `@point` note get controls in its editor.
 */
export const DEFAULT_SHADER_CODE = `// A layer's look, changed on the GPU. \`color\` is the layer at \`uv\` (premultiplied),
// \`local\` the point in the layer's own units (uSize is its size).
// Helpers: current(uv), content(uv), behind(uv), localAt(uv), px(v), hash(p), valueNoise(p).
uniform float uAmount; // @range 0 1 0.5

vec4 effect(vec4 color, vec2 uv, vec2 local) {
  vec2 middle = local / uSize - 0.5;
  float shade = 1.0 - uAmount * dot(middle, middle) * 2.0;
  return vec4(color.rgb * shade, color.a);
}
`;

/** What each new effect starts as (Figma's defaults where it has the effect). */
export const EFFECT_DEFAULTS = {
  "drop-shadow": {
    color: "#000000",
    opacity: 0.25,
    x: 0,
    y: 4,
    blur: 4,
    spread: 0,
    showBehind: false,
  },
  "inner-shadow": { color: "#000000", opacity: 0.25, x: 0, y: 4, blur: 4, spread: 0 },
  "layer-blur": {
    radius: 4,
    progressive: false,
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    startRadius: 0,
  },
  "background-blur": { radius: 4 },
  noise: {
    noiseType: "mono",
    color: "#000000",
    secondColor: "#ffffff",
    opacity: 0.25,
    size: 1,
    density: 0.5,
  },
  texture: { size: 4, radius: 2, clipToShape: true },
  glass: {
    lightAngle: 135,
    lightIntensity: 0.6,
    refraction: 0.5,
    depth: 16,
    dispersion: 0.25,
    frost: 2,
    splay: 0.5,
  },
  shader: { code: DEFAULT_SHADER_CODE, params: {} },
} satisfies {
  [T in DesignEffectType]: Omit<Extract<DesignEffect, { type: T }>, "id" | "type" | "visible">;
};
