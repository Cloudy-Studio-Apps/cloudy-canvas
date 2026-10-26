import { resolveStyle } from "../resolve-style";
import { rawValue } from "../raw-value";
import { resolveVariable } from "../resolve-token";
import { styleLeafType } from "../style-bindings";
import { TokenStore } from "../token-store";
import type { StyleRecord, TokenRecord } from "../token.types";
import type { DtcgRefs } from "./dtcg/dtcg.types";

/** What style codecs read references with: the variable a reference names, and its value. */
export function styleRefs(
  records: readonly TokenRecord[],
  idOf: (reference: string) => string | null,
): DtcgRefs {
  const store = new TokenStore(records);
  return {
    id: idOf,
    value: (reference) => {
      const id = idOf(reference);
      return rawValue(id ? resolveVariable(store, id, {}) : null);
    },
  };
}

/**
 * Read styles made whole: bindings to a variable of another type than the part they bind are
 * dropped (as binding them by hand refuses), and bound parts take their variables' values.
 */
export function finishStyles(
  records: readonly TokenRecord[],
  styles: readonly StyleRecord[],
): StyleRecord[] {
  const store = new TokenStore([...records, ...styles]);
  return styles.map((style) => {
    const bindings = Object.fromEntries(
      Object.entries(style.bindings ?? {}).filter(
        ([path, id]) => store.variable(id)?.type === styleLeafType(style.value, path),
      ),
    );
    const kept: StyleRecord = { ...style };
    if (Object.keys(bindings).length > 0) kept.bindings = bindings;
    else delete kept.bindings;
    return { ...kept, value: resolveStyle(store, kept, {}) };
  });
}
