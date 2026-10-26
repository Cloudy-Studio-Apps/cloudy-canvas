import { tokenName, type CanvasElement, type TokenStore } from "@canvas";

/** A shape's colors linked to board colors, for agents: field → `Collection/name`. */
export function boundColors(
  store: TokenStore,
  el: CanvasElement,
): { colors?: Record<string, string> } {
  const entries = Object.entries(el.bindings ?? {});
  if (entries.length === 0) return {};
  return { colors: Object.fromEntries(entries.map(([path, id]) => [path, tokenName(store, id)])) };
}
