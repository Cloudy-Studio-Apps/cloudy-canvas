import { EffectShader, FILTER_HEADER } from "@canvas";

/**
 * Liquid glass over what's behind (`uBehind`, frosted): `uField` is the content's opacity
 * blurred by the glass's depth, so it rises from the edge inward; its slope is the surface's
 * normal. Near the edge, what's behind is read from further out (`uBend` CSS pixels at most),
 * each channel a little apart (`uDispersion`), and the rim facing `uLight` (a screen direction)
 * is lit (`uIntensity`, spread by `uSplay`). Laid under the input inside the content's shape.
 */
export const glassShader = new EffectShader(
  "glass",
  /* glsl */ `${FILTER_HEADER}
uniform sampler2D uContent;
uniform sampler2D uField;
uniform sampler2D uBehind;
uniform float uBend;
uniform float uDispersion;
uniform vec2 uLight;
uniform float uIntensity;
uniform float uSplay;

void main() {
  vec4 top = texture(uTexture, vTextureCoord);
  float shape = clamp(texture(uContent, vTextureCoord).a * 24.0, 0.0, 1.0);
  if (shape <= 0.0) {
    finalColor = top;
    return;
  }
  float field = texture(uField, vTextureCoord).a;
  vec2 dx = px(vec2(1.5, 0.0));
  vec2 dy = px(vec2(0.0, 1.5));
  vec2 slope = vec2(
    texture(uField, vTextureCoord + dx).a - texture(uField, vTextureCoord - dx).a,
    texture(uField, vTextureCoord + dy).a - texture(uField, vTextureCoord - dy).a
  );
  // Inward; flat in the middle, where the slope vanishes.
  vec2 inward = length(slope) > 1e-5 ? normalize(slope) : vec2(0.0);
  float edge = 1.0 - smoothstep(0.5, 1.0, field);
  vec2 bend = -inward * edge * edge * uBend;
  float spread = 1.0 + uDispersion * 0.6;
  vec3 behind = vec3(
    texture(uBehind, vTextureCoord + px(bend * spread)).r,
    texture(uBehind, vTextureCoord + px(bend)).g,
    texture(uBehind, vTextureCoord + px(bend / spread)).b
  );
  float facing = max(dot(-inward, uLight), 0.0);
  float rim = pow(edge, mix(6.0, 1.0, clamp(uSplay, 0.0, 1.0))) * facing * uIntensity;
  vec4 glass = vec4(min(behind + rim, vec3(1.0)), 1.0) * shape;
  finalColor = top + glass * (1.0 - top.a);
}`,
  {
    uBend: { value: 0, type: "f32" },
    uDispersion: { value: 0, type: "f32" },
    uLight: { value: new Float32Array(2), type: "vec2<f32>" },
    uIntensity: { value: 0, type: "f32" },
    uSplay: { value: 0.5, type: "f32" },
  },
  ["uContent", "uField", "uBehind"],
);
