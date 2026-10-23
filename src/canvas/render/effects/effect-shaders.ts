import { EffectShader } from "./effect-shader";
import { FILTER_HEADER } from "./effect-glsl";

/** Taps a blur pass takes on each side at most; wider blurs space them out. */
export const MAX_BLUR_TAPS = 32;

/** Copies its input. */
export const copyShader = new EffectShader(
  "copy",
  /* glsl */ `${FILTER_HEADER}
void main() {
  finalColor = texture(uTexture, vTextureCoord);
}`,
  {},
);

/**
 * One direction of a Gaussian blur: `uStep` (CSS pixels between taps), `uTaps` on each side and
 * the deviation `uSigma` in taps. Outside the frame counts as transparent.
 */
export const blurShader = new EffectShader(
  "blur",
  /* glsl */ `${FILTER_HEADER}
uniform vec2 uStep;
uniform float uTaps;
uniform float uSigma;

void main() {
  vec4 sum = sampleIn(uTexture, vTextureCoord);
  float total = 1.0;
  vec2 step = px(uStep);
  for (int i = 1; i <= ${MAX_BLUR_TAPS}; i++) {
    float t = float(i);
    if (t > uTaps) break;
    float w = exp(-0.5 * t * t / (uSigma * uSigma));
    sum += (sampleIn(uTexture, vTextureCoord + step * t) + sampleIn(uTexture, vTextureCoord - step * t)) * w;
    total += 2.0 * w;
  }
  finalColor = sum / total;
}`,
  {
    uStep: { value: new Float32Array(2), type: "vec2<f32>" },
    uTaps: { value: 1, type: "f32" },
    uSigma: { value: 1, type: "f32" },
  },
);

/**
 * A shadow's shape: the input's opacity moved by `uOffset` (CSS pixels), grown (`uSpread` > 0)
 * or shrunk (< 0) round, turned inside out with `uInvert` (an inner shadow's), in `uColor`
 * (premultiplied).
 */
export const silhouetteShader = new EffectShader(
  "silhouette",
  /* glsl */ `${FILTER_HEADER}
uniform vec2 uOffset;
uniform float uSpread;
uniform float uInvert;
uniform vec4 uColor;

float alphaAt(vec2 uv) {
  float a = sampleIn(uTexture, uv).a;
  return uInvert > 0.5 ? 1.0 - a : a;
}

void main() {
  vec2 uv = vTextureCoord - px(uOffset);
  float a = alphaAt(uv);
  float reach = abs(uSpread);
  if (reach > 0.0) {
    // The most (growing) or least (shrinking) opacity within the spread, on rings round the point.
    bool grow = uSpread > 0.0;
    for (int ring = 1; ring <= 3; ring++) {
      float r = reach * float(ring) / 3.0;
      for (int k = 0; k < 16; k++) {
        float angle = 6.2831853 * (float(k) + 0.5 * float(ring)) / 16.0;
        float b = alphaAt(uv + px(vec2(cos(angle), sin(angle)) * r));
        a = grow ? max(a, b) : min(a, b);
      }
    }
  }
  finalColor = uColor * a;
}`,
  {
    uOffset: { value: new Float32Array(2), type: "vec2<f32>" },
    uSpread: { value: 0, type: "f32" },
    uInvert: { value: 0, type: "f32" },
    uColor: { value: new Float32Array(4), type: "vec4<f32>" },
  },
  [],
);

/**
 * Lays `uLayer` under the input (premultiplied "over"), cut where `uContent` is opaque unless
 * `uShowBehind` (a drop shadow behind a translucent layer).
 */
export const underShader = new EffectShader(
  "under",
  /* glsl */ `${FILTER_HEADER}
uniform sampler2D uLayer;
uniform sampler2D uContent;
uniform float uShowBehind;

void main() {
  vec4 top = texture(uTexture, vTextureCoord);
  vec4 under = texture(uLayer, vTextureCoord);
  if (uShowBehind < 0.5) under *= 1.0 - texture(uContent, vTextureCoord).a;
  finalColor = top + under * (1.0 - top.a);
}`,
  { uShowBehind: { value: 0, type: "f32" } },
  ["uLayer", "uContent"],
);

/**
 * Lays `uLayer` over the input inside `uContent`'s shape (premultiplied "atop"): an inner
 * shadow, noise. `uShape` > 0 makes the shape opaque wherever the content shows at all, so
 * translucent fills take it fully.
 */
export const atopShader = new EffectShader(
  "atop",
  /* glsl */ `${FILTER_HEADER}
uniform sampler2D uLayer;
uniform sampler2D uContent;
uniform float uShape;

void main() {
  vec4 base = texture(uTexture, vTextureCoord);
  float inside = texture(uContent, vTextureCoord).a;
  if (uShape > 0.5) inside = clamp(inside * 24.0, 0.0, 1.0);
  vec4 over = texture(uLayer, vTextureCoord) * inside;
  finalColor = over + base * (1.0 - over.a);
}`,
  { uShape: { value: 0, type: "f32" } },
  ["uLayer", "uContent"],
);

/**
 * Lays `uLayer` under the input inside `uContent`'s shape (opaque wherever the content shows at
 * all, so a translucent fill shows it fully): what's behind, blurred or refracted.
 */
export const shapeUnderShader = new EffectShader(
  "shape-under",
  /* glsl */ `${FILTER_HEADER}
uniform sampler2D uLayer;
uniform sampler2D uContent;

void main() {
  vec4 top = texture(uTexture, vTextureCoord);
  float shape = clamp(texture(uContent, vTextureCoord).a * 24.0, 0.0, 1.0);
  vec4 under = texture(uLayer, vTextureCoord) * shape;
  finalColor = top + under * (1.0 - top.a);
}`,
  {},
  ["uLayer", "uContent"],
);
