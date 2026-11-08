import { resolveVariable, TokenStore, type TokenRecord } from "@canvas";
import type { LibraryColor } from "./library-colors.types";

/** A library's color variables in its order, with their default values (aliases followed). */
export function libraryColorList(records: readonly TokenRecord[]): LibraryColor[] {
  const store = new TokenStore(records);
  const colors: LibraryColor[] = [];
  for (const variable of store.variables()) {
    if (variable.type !== "color") continue;
    const value = resolveVariable(store, variable.id, {});
    if (value?.type === "color") {
      colors.push({ id: variable.id, name: variable.name, color: value.color });
    }
  }
  return colors;
}

/** The colors a library shows as its swatches, at most `max`, as `#RRGGBBAA`. */
export function libraryColors(records: readonly TokenRecord[], max = Infinity): string[] {
  return libraryColorList(records)
    .slice(0, max)
    .map((item) => item.color);
}
