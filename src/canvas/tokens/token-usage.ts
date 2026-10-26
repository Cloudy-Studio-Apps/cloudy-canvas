import type { BindingIndex } from "./binding-index";
import type { TokenStore } from "./token-store";
import type { TokenUsage } from "./token-usage.types";

/**
 * Where a variable or a style is used: by layers (directly or through styles), aliases, styles,
 * generators. `counts` leaves out layers that don't count as uses (a product's generated ones).
 */
export function tokenUsage(
  store: TokenStore,
  index: BindingIndex,
  id: string,
  counts: (elementId: string) => boolean = () => true,
): TokenUsage {
  const layers = [...index.boundTo(id)].filter(counts);
  const isVariable = store.variable(id) !== undefined;
  const styles = isVariable ? [...store.styleUsers(id)] : [];
  const direct = new Set(layers);
  const viaStyles = new Set<string>();
  for (const style of styles) {
    for (const el of index.boundTo(style)) if (!direct.has(el) && counts(el)) viaStyles.add(el);
  }
  const aliases = isVariable
    ? store
        .variables()
        .filter(
          (v) =>
            v.id !== id &&
            Object.values(v.values).some((value) => "alias" in value && value.alias === id),
        )
        .map((v) => v.id)
    : [];
  const generators = isVariable
    ? [...store.generators(), ...store.scales()].filter((g) => g.baseVar === id).map((g) => g.id)
    : [];
  return { layers, viaStyles: [...viaStyles], aliases, styles, generators };
}

/** Whether nothing uses it (no layer, alias, style or generator). */
export function isUnused(usage: TokenUsage): boolean {
  return (
    usage.layers.length === 0 &&
    usage.viaStyles.length === 0 &&
    usage.aliases.length === 0 &&
    usage.styles.length === 0 &&
    usage.generators.length === 0
  );
}

/** The variables and styles nothing uses, in the store's order (variables first). */
export function unusedTokens(
  store: TokenStore,
  index: BindingIndex,
  counts?: (elementId: string) => boolean,
): string[] {
  return [...store.variables(), ...store.styles()]
    .map((record) => record.id)
    .filter((id) => isUnused(tokenUsage(store, index, id, counts)));
}
