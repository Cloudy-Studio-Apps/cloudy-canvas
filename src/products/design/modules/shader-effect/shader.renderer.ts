import type { EffectRenderer } from "@canvas";

import { localUniforms, type ShaderEffect } from "../effects";
import { compileShaderCode } from "./shader-compile";
import { paramValue } from "./shader-params";

/**
 * A custom shader over the result so far: its code compiled once per text, its parameters set
 * from the effect (or their defaults). Code that doesn't compile leaves the layer as it was.
 */
export const shaderRenderer: EffectRenderer<ShaderEffect> = {
  type: "shader",
  stage: "filter",
  backdrop: true,
  // Only code that reads what's behind needs it copied.
  readsBackdrop: (e) => /\bbehind\s*\(/.test(e.code),
  outset: (_e, outset) => outset,
  render(pass, e, current) {
    const compiled = compileShaderCode(e.code);
    if (!compiled.ok) return current;
    const { shader, params } = compiled;
    shader.set({
      ...localUniforms(pass),
      uScale: pass.scale,
      ...Object.fromEntries(
        params.map((param) => {
          const value = paramValue(param, e.params[param.name]);
          return [param.name, param.type === "float" ? value[0]! : value];
        }),
      ),
    });
    shader.bind({ uContent: pass.content, uBehind: pass.backdrop });
    return pass.run(shader, current);
  },
};
