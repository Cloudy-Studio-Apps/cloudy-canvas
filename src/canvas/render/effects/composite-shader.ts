import { BLEND_MODES } from "../../effects";
import type { BlendMode } from "../../effects";
import { EffectShader } from "./effect-shader";
import { FILTER_HEADER } from "./effect-glsl";

/** A blend mode's number in the composite shader. */
export function blendModeIndex(mode: BlendMode): number {
  return Math.max(0, BLEND_MODES.indexOf(mode));
}

/**
 * A scope's result composited with what's behind it (`uBackdrop`), as the W3C compositing spec
 * does: the blended color `B(Cb, Cs)` where the backdrop shows, the scope's own where it doesn't,
 * at its opacity times `uOpacity`. The output is drawn "over" the backdrop as usual, which gives
 * the blended result. Mode numbers follow `BLEND_MODES`; colors are premultiplied in and out.
 */
export const compositeShader = new EffectShader(
  "composite",
  /* glsl */ `${FILTER_HEADER}
uniform sampler2D uBackdrop;
uniform float uOpacity;
uniform float uMode;

float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }

vec3 clipColor(vec3 c) {
  float l = lum(c);
  float n = min(min(c.r, c.g), c.b);
  float x = max(max(c.r, c.g), c.b);
  if (n < 0.0) c = l + (c - l) * l / max(l - n, 1e-5);
  if (x > 1.0) c = l + (c - l) * (1.0 - l) / max(x - l, 1e-5);
  return c;
}

vec3 setLum(vec3 c, float l) { return clipColor(c + (l - lum(c))); }

float sat(vec3 c) { return max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b); }

vec3 setSat(vec3 c, float s) {
  float hi = max(max(c.r, c.g), c.b);
  float lo = min(min(c.r, c.g), c.b);
  return hi > lo ? (c - lo) * s / (hi - lo) : vec3(0.0);
}

float dodge(float b, float s) {
  if (b <= 0.0) return 0.0;
  if (s >= 1.0) return 1.0;
  return min(1.0, b / (1.0 - s));
}

float burn(float b, float s) {
  if (b >= 1.0) return 1.0;
  if (s <= 0.0) return 0.0;
  return 1.0 - min(1.0, (1.0 - b) / s);
}

float hardLight(float b, float s) {
  return s <= 0.5 ? b * 2.0 * s : b + (2.0 * s - 1.0) - b * (2.0 * s - 1.0);
}

float softLight(float b, float s) {
  if (s <= 0.5) return b - (1.0 - 2.0 * s) * b * (1.0 - b);
  float d = b <= 0.25 ? ((16.0 * b - 12.0) * b + 4.0) * b : sqrt(b);
  return b + (2.0 * s - 1.0) * (d - b);
}

float separable(int mode, float b, float s) {
  if (mode == 1) return min(b, s);
  if (mode == 2) return b * s;
  if (mode == 3) return max(0.0, b + s - 1.0);
  if (mode == 4) return burn(b, s);
  if (mode == 5) return max(b, s);
  if (mode == 6) return b + s - b * s;
  if (mode == 7) return min(1.0, b + s);
  if (mode == 8) return dodge(b, s);
  if (mode == 9) return hardLight(s, b);
  if (mode == 10) return softLight(b, s);
  if (mode == 11) return hardLight(b, s);
  if (mode == 12) return abs(b - s);
  if (mode == 13) return b + s - 2.0 * b * s;
  return s;
}

vec3 blend(int mode, vec3 b, vec3 s) {
  if (mode == 14) return setLum(setSat(s, sat(b)), lum(b));
  if (mode == 15) return setLum(setSat(b, sat(s)), lum(b));
  if (mode == 16) return setLum(s, lum(b));
  if (mode == 17) return setLum(b, lum(s));
  return vec3(separable(mode, b.r, s.r), separable(mode, b.g, s.g), separable(mode, b.b, s.b));
}

void main() {
  vec4 src = texture(uTexture, vTextureCoord);
  float a = src.a * uOpacity;
  if (src.a <= 0.0 || a <= 0.0) {
    finalColor = vec4(0.0);
    return;
  }
  vec3 cs = src.rgb / src.a;
  int mode = int(uMode + 0.5);
  vec3 color = cs;
  if (mode != 0) {
    vec4 dst = texture(uBackdrop, vTextureCoord);
    vec3 cb = dst.a > 0.0 ? dst.rgb / dst.a : vec3(0.0);
    color = (1.0 - dst.a) * cs + dst.a * clamp(blend(mode, cb, cs), 0.0, 1.0);
  }
  finalColor = vec4(color * a, a);
}`,
  {
    uOpacity: { value: 1, type: "f32" },
    uMode: { value: 0, type: "f32" },
  },
  ["uBackdrop"],
);
