import type { CanvasElement, TokenStore } from "@canvas";

import type { ColorOptions } from "./option-tokens.types";

/** The option holding the variable a color option is bound to: `stickyColor` → `stickyColorToken`. */
export function tokenOption(option: string): string {
  return `${option}Token`;
}

/**
 * How picked colors restyle an element's color fields (`fields`: path → option). A field changes
 * only when its option is picked; with its token option picked too (the color bars always give
 * both), it's bound to that variable (the token sync then writes its color), or unbound for `null`
 * and given the color, even when it's the same.
 */
export function restyleColors(
  el: CanvasElement,
  options: object,
  fields: ColorOptions,
): Record<string, unknown> {
  const picked = options as Readonly<Record<string, unknown>>;
  const patch: Record<string, unknown> = {};
  let bindings: Record<string, string> | null = null;
  for (const [path, option] of Object.entries(fields)) {
    const color = picked[option];
    if (typeof color !== "string" || !color) continue;
    const key = tokenOption(option);
    const token = picked[key];
    if (key in picked) bindings ??= { ...el.bindings };
    // A bound field is written by the token sync, so a color picked in another mode can't unlink it.
    if (bindings && typeof token === "string") {
      bindings[path] = token;
      continue;
    }
    patch[path] = color;
    if (bindings) delete bindings[path];
  }
  if (bindings) patch.bindings = bindings;
  return patch;
}

/** The token options an element's bound colors give the bars when it's selected. */
export function colorTokenOptions(
  el: CanvasElement,
  fields: ColorOptions,
): Record<string, string | null> {
  const options: Record<string, string | null> = {};
  for (const [path, option] of Object.entries(fields)) {
    options[tokenOption(option)] = el.bindings?.[path] ?? null;
  }
  return options;
}

/**
 * The bindings a new element takes from the options it's made with (`{}` when none is bound); a
 * token left in the options by a variable deleted since is ignored.
 */
export function newColorBindings(
  options: object,
  fields: ColorOptions,
  store: TokenStore,
): Pick<CanvasElement, "bindings"> {
  const picked = options as Readonly<Record<string, unknown>>;
  const bindings: Record<string, string> = {};
  for (const [path, option] of Object.entries(fields)) {
    const token = picked[tokenOption(option)];
    if (typeof token === "string" && store.variable(token)) bindings[path] = token;
  }
  return Object.keys(bindings).length > 0 ? { bindings } : {};
}
