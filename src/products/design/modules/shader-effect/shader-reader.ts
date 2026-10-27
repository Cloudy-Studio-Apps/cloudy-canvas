import { effectReader } from "../effects";
import type { EffectReader } from "../core";
import { DEFAULT_SHADER_CODE } from "./shader-defaults";

const readFields = effectReader("shader");

/** How agents give a shader effect: its fields checked, and the starting code when none is given. */
export const readShaderEffect: EffectReader = (fields, at) => {
  const effect = readFields(fields, at);
  return effect.code ? effect : { ...effect, code: DEFAULT_SHADER_CODE };
};
