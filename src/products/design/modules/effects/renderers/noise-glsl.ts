// Noise for shaders laid on a layer: fixed to its own coordinates, so it stays put as the layer
// moves and the canvas zooms.

export const NOISE_GLSL = /* glsl */ `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

/** Smooth value noise, 0–1. */
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
`;

/** `localAt(uv)`: a texture coordinate in the layer's own units (see `localUniforms`). */
export const LOCAL_GLSL = /* glsl */ `
uniform vec3 uLocalX;
uniform vec3 uLocalY;
uniform vec2 uSize;

vec2 localAt(vec2 uv) {
  vec3 p = vec3(uv, 1.0);
  return vec2(dot(uLocalX, p), dot(uLocalY, p));
}
`;

/** The uniforms `LOCAL_GLSL` declares. */
export const LOCAL_UNIFORMS = {
  uLocalX: { value: new Float32Array(3), type: "vec3<f32>" },
  uLocalY: { value: new Float32Array(3), type: "vec3<f32>" },
  uSize: { value: new Float32Array(2), type: "vec2<f32>" },
} as const;
