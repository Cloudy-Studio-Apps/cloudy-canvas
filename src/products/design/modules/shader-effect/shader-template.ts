import { FILTER_HEADER } from "@canvas";

import { LOCAL_GLSL, NOISE_GLSL } from "../effects";

/** What the template puts before a shader's code, and what code can use. */
const PRELUDE = /* glsl */ `${FILTER_HEADER}
${LOCAL_GLSL}
${NOISE_GLSL}
uniform sampler2D uContent;
uniform sampler2D uBehind;
uniform float uScale;

vec4 current(vec2 uv) { return sampleIn(uTexture, uv); }
vec4 content(vec2 uv) { return sampleIn(uContent, uv); }
vec4 behind(vec2 uv) { return texture(uBehind, uv); }
`;

const MAIN = /* glsl */ `
void main() {
  finalColor = effect(texture(uTexture, vTextureCoord), vTextureCoord, localAt(vTextureCoord));
}
`;

/** Lines before the user's code, so compile errors point at their own lines. */
export const PRELUDE_LINES = PRELUDE.split("\n").length;

/**
 * A shader effect's full fragment shader: the template's inputs and helpers, the code (which
 * defines `vec4 effect(vec4 color, vec2 uv, vec2 local)` and declares its own uniforms), and the
 * `main` that calls it.
 */
export function shaderSource(code: string): string {
  return `${PRELUDE}\n${code}\n${MAIN}`;
}
