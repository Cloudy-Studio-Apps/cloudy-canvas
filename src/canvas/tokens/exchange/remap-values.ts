import { DEFAULT_VALUE } from "../default-value";
import type { TokenValue, VariableRecord } from "../token.types";
import { mapValueRefs } from "../value-refs";
import type { ValueRemap } from "./remap-values.types";

/**
 * A variable's axis and values in another set of records' terms: aliases and expressions'
 * references renamed by `idOf`, mode keys by `modeOf` (the default stands for `sourceBase`, its
 * axis's first mode where it comes from), and the target axis's first mode (`targetBaseOf`)
 * stored as the default. Used by token imports and by adding a file to a project.
 */
export function remapValues(
  v: VariableRecord,
  { idOf, modeOf, sourceBase, targetBaseOf }: ValueRemap,
): Pick<VariableRecord, "axisId" | "values"> {
  const remap = (value: TokenValue): TokenValue => mapValueRefs(value, idOf);
  const base = v.values[DEFAULT_VALUE];
  if (!v.axisId) return { axisId: null, values: base ? { [DEFAULT_VALUE]: remap(base) } : {} };
  const axisId = idOf(v.axisId);
  const targetBase =
    targetBaseOf(axisId) ?? (sourceBase === undefined ? undefined : modeOf(sourceBase));
  const values: Record<string, TokenValue> = {};
  // The default first, so an override landing on the target's base mode wins over it.
  const entries = Object.entries(v.values).sort(([a]) => (a === DEFAULT_VALUE ? -1 : 1));
  for (const [key, value] of entries) {
    const from = key === DEFAULT_VALUE ? sourceBase : key;
    const mode = from === undefined ? DEFAULT_VALUE : modeOf(from);
    values[mode === targetBase ? DEFAULT_VALUE : mode] = remap(value);
  }
  if (base && !(DEFAULT_VALUE in values)) values[DEFAULT_VALUE] = remap(base);
  return { axisId, values };
}
