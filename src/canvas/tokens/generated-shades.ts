import { DEFAULT_VALUE } from "./default-value";
import { resolveVariable } from "./resolve-token";
import { shadeRamp } from "./shade-ramp";
import type { GeneratorRecord } from "./shade-generator.types";
import type { TokenStore } from "./token-store";
import type { TokenValue, VariableRecord } from "./token.types";

/** A generator's base color now: its base variable's default (aliases followed), or its own. */
export function generatorBase(store: TokenStore, generator: GeneratorRecord): string | null {
  if (!generator.baseVar) return generator.baseColor;
  const value = resolveVariable(store, generator.baseVar, {});
  return value?.type === "color" ? value.color : null;
}

/**
 * The variables a generator writes: its shades named `group/step` in its collection, updating the
 * ones already there (its own, or hand-made ones it takes over) and making the rest with `make`.
 * It never touches its base variable or another generator's shades. The other modes of its axis
 * get the shades in reverse when `other` is `flip`; with `same` they keep the defaults.
 */
export function generatedShades(
  store: TokenStore,
  generator: GeneratorRecord,
  make: (name: string) => VariableRecord,
): VariableRecord[] {
  const base = generatorBase(store, generator);
  if (!base) return [];
  const shades = shadeRamp(base, generator);
  const axis = generator.axisId ? store.axis(generator.axisId) : undefined;
  const flip = generator.other === "flip" && axis !== undefined && axis.modes.length > 1;
  const out: VariableRecord[] = [];
  shades.forEach((shade, i) => {
    const name = generator.group ? `${generator.group}/${shade.name}` : shade.name;
    const existing = store.byPath(generator.collectionId, name);
    if (existing?.id === generator.baseVar) return;
    if (existing?.generatorId && existing.generatorId !== generator.id) return;
    const values: Record<string, TokenValue> = { [DEFAULT_VALUE]: { color: shade.color } };
    if (flip && axis) {
      const mirror = shades[shades.length - 1 - i];
      for (const mode of axis.modes.slice(1)) {
        if (mirror) values[mode.id] = { color: mirror.color };
      }
    }
    const record = existing ?? make(name);
    out.push({
      ...record,
      type: "color",
      values,
      axisId: flip && axis ? axis.id : (record.axisId ?? null),
      generatorId: generator.id,
    });
  });
  return out;
}
