import { DEFAULT_SHADER_CODE } from "../effects";
import { t } from "./shader-effect.i18n";

/** Ready-made shaders to start from: what the code can do, each a few lines. */
export const SHADER_PRESETS: readonly { label: string; code: string }[] = [
  { label: t("presets.vignette"), code: DEFAULT_SHADER_CODE },
  {
    label: t("presets.chromaticAberration"),
    code: `// Red and blue pulled apart from the middle of the layer.
uniform float uAmount; // @range 0 12 3

vec4 effect(vec4 color, vec2 uv, vec2 local) {
  vec2 dir = normalize(local / uSize - 0.5 + 1e-5);
  vec2 shift = px(dir * uAmount * uScale);
  vec4 r = current(uv + shift);
  vec4 b = current(uv - shift);
  return vec4(r.r, color.g, b.b, max(color.a, max(r.a, b.a)));
}
`,
  },
  {
    label: t("presets.halftone"),
    code: `// Dots on a grid fixed to the layer, sized by how dark it is.
uniform float uCell; // @range 2 40 8
uniform vec3 uInk; // @color #111111

vec4 effect(vec4 color, vec2 uv, vec2 local) {
  vec2 cell = mod(local, uCell) / uCell - 0.5;
  float dark = 1.0 - dot(color.rgb, vec3(0.299, 0.587, 0.114)) / max(color.a, 1e-4);
  float dot_ = step(length(cell), sqrt(dark) * 0.7);
  return vec4(mix(vec3(1.0), uInk, dot_), 1.0) * color.a;
}
`,
  },
  {
    label: t("presets.pixelate"),
    code: `// Square blocks, in the layer's own units.
uniform float uBlock; // @range 1 64 8

vec4 effect(vec4 color, vec2 uv, vec2 local) {
  vec2 inBlock = mod(local, uBlock) - uBlock * 0.5;
  // Back to the block's middle, measured on screen.
  return current(uv - px(inBlock * uScale));
}
`,
  },
  {
    label: t("presets.ripple"),
    code: `// Waves across the layer.
uniform float uWaves; // @range 1 40 12
uniform float uStrength; // @range 0 12 3

vec4 effect(vec4 color, vec2 uv, vec2 local) {
  float wave = sin(local.y / uSize.y * uWaves * 6.2831853);
  return current(uv + px(vec2(wave * uStrength * uScale, 0.0)));
}
`,
  },
  {
    label: t("presets.duotone"),
    code: `// Dark parts in one color, light ones in another.
uniform vec3 uDark; // @color #1E1B4B
uniform vec3 uLight; // @color #F0ABFC

vec4 effect(vec4 color, vec2 uv, vec2 local) {
  vec3 straight = color.rgb / max(color.a, 1e-4);
  float light = dot(straight, vec3(0.299, 0.587, 0.114));
  return vec4(mix(uDark, uLight, light) * color.a, color.a);
}
`,
  },
];
