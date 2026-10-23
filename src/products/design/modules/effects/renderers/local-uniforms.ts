import type { EffectPass } from "@canvas";

/**
 * The pass's texture → layer map as two rows (`uLocalX`, `uLocalY`: dot them with (u, v, 1)), and
 * the layer's size (`uSize`), for shaders laid on the layer.
 */
export function localUniforms(pass: EffectPass): Record<string, number[]> {
  const [a, b, c, d, tx, ty] = pass.toLocal;
  return { uLocalX: [a, c, tx], uLocalY: [b, d, ty], uSize: [pass.box.w, pass.box.h] };
}
