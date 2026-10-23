import type { EffectShader } from "@canvas";

import type { ShaderParam } from "./shader-params.types";

/** Why a shader's code doesn't compile: the first error, on its 1-based line of the code. */
export interface ShaderError {
  line: number | null;
  message: string;
}

/** A shader's code compiled, or why it couldn't be. */
export type CompiledShader =
  | { ok: true; shader: EffectShader; params: ShaderParam[] }
  | { ok: false; error: ShaderError; params: ShaderParam[] };
