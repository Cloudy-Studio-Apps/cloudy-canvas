import { setPathsPatch } from "./binding-path";
import { resolveVariable } from "./resolve-token";
import type { TokenStore } from "./token-store";
import { tokenValueFields } from "./token-value-fields";
import type { ModeContext, StyleRecord } from "./token.types";

/**
 * A style's value as a layer in `modes` sees it: each bound path set from its variable in those
 * modes (a color at `….color` also sets the sibling `opacity`). A variable that can't be resolved
 * leaves the stored value.
 */
export function resolveStyle(
  store: TokenStore,
  style: StyleRecord,
  modes: ModeContext,
): Record<string, unknown> {
  let value: Record<string, unknown> = style.value;
  for (const [path, variable] of Object.entries(style.bindings ?? {})) {
    const resolved = store.variable(variable) ? resolveVariable(store, variable, modes) : null;
    if (!resolved || resolved.type === "style") continue;
    const patch = setPathsPatch(value, tokenValueFields(value, path, resolved));
    if (patch) value = { ...value, ...patch };
  }
  return value;
}
