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
