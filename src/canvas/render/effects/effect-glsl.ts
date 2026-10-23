// GLSL pieces the effect shaders share.

/**
 * `sampleIn(tex, uv)`: a texel of a filter texture, transparent outside its frame (pooled
 * textures hold leftovers there). `px(v)`: CSS pixels as texture coordinates.
 */
export const SAMPLING_GLSL = /* glsl */ `
uniform highp vec4 uInputSize;
uniform highp vec4 uInputClamp;

vec4 sampleIn(sampler2D tex, vec2 uv) {
  if (uv.x < uInputClamp.x || uv.y < uInputClamp.y || uv.x > uInputClamp.z || uv.y > uInputClamp.w)
    return vec4(0.0);
  return texture(tex, uv);
}

vec2 px(vec2 v) {
  return v * uInputSize.zw;
}
`;

/** The fragment shader's header: what Pixi feeds every filter. */
export const FILTER_HEADER = /* glsl */ `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
${SAMPLING_GLSL}
`;
