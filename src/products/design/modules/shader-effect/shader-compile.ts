import { EffectShader, LruCache } from "@canvas";

import { LOCAL_UNIFORMS } from "../effects";
import type { CompiledShader, ShaderError } from "./shader-compile.types";
import { shaderParams } from "./shader-params";
import { PRELUDE_LINES, shaderSource } from "./shader-template";
import { t } from "./shader-effect.i18n";

/** Compiled codes, by their text: every layer with the same code shares one shader. */
const compiled = new LruCache<string, CompiledShader>(64);
/** Shaders made so far, to name each apart (Pixi caches programs by name). */
let made = 0;

const UNIFORM_TYPES = {
  float: "f32",
  vec2: "vec2<f32>",
  vec3: "vec3<f32>",
  vec4: "vec4<f32>",
} as const;

/**
 * A shader effect's code compiled for drawing, or the first error it has. The code is checked
 * on a WebGL 2 context of its own first, so broken code shows an error instead of breaking the
 * canvas; a layer whose code fails is drawn without it.
 */
export function compileShaderCode(code: string): CompiledShader {
  return compiled.getOrSet(code, () => {
    const params = shaderParams(code);
    if (!code.includes("effect(")) {
      return {
        ok: false,
        params,
        error: { line: null, message: t("errors.noEffect") },
      };
    }
    const source = shaderSource(code);
    const error = checkSource(source);
    if (error) return { ok: false, params, error };
    const uniforms = Object.fromEntries(
      params.map((param) => [
        param.name,
        param.type === "float"
          ? { value: param.defaults[0] ?? 0, type: UNIFORM_TYPES.float }
          : { value: Float32Array.from(param.defaults), type: UNIFORM_TYPES[param.type] },
      ]),
    );
    const shader = new EffectShader(
      `shader-${++made}`,
      source,
      { ...LOCAL_UNIFORMS, uScale: { value: 1, type: "f32" }, ...uniforms },
      ["uContent", "uBehind"],
    );
    return { ok: true, shader, params };
  });
}

let context: WebGL2RenderingContext | null | undefined;

/** Compiles the source on a WebGL 2 context of its own; the first error, or `null`. */
function checkSource(source: string): ShaderError | null {
  if (context === undefined) {
    context =
      typeof document === "undefined"
        ? null
        : document.createElement("canvas").getContext("webgl2");
  }
  // Without WebGL 2 nothing can be checked (nor drawn); Pixi reports what fails.
  if (!context) return null;
  const gl = context;
  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!shader) return null;
  // Pixi adds the version and precision; the line offset below counts them.
  gl.shaderSource(shader, `#version 300 es\nprecision highp float;\n${source}`);
  gl.compileShader(shader);
  const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS) as boolean;
  const log = gl.getShaderInfoLog(shader) ?? "";
  gl.deleteShader(shader);
  if (ok) return null;
  const match = /ERROR:\s*\d+:(\d+):\s*(.*)/.exec(log);
  if (!match) return { line: null, message: log.trim() || t("errors.compile") };
  // The code starts after the two lines above, the prelude and the blank line between.
  const line = Number(match[1]) - 2 - PRELUDE_LINES;
  return { line: line >= 1 ? line : null, message: match[2]!.trim() };
}
