import { resolveVariable, tokenGroupOf, type TokenStore } from "@canvas";

import type { ExistingPalette } from "./plan.types";

/**
 * The file's palette when shade generators made one: the collection with the most, and each
 * generator's group and base color as a role. `null` without generators.
 */
export function existingPalette(store: TokenStore): ExistingPalette | null {
  const generators = store.generators();
  if (!generators.length) return null;
  const counts = new Map<string, number>();
  for (const g of generators) counts.set(g.collectionId, (counts.get(g.collectionId) ?? 0) + 1);
  const [collectionId] = [...counts].sort((a, b) => b[1] - a[1])[0]!;
  const collection = store.collection(collectionId);
  if (!collection) return null;
  const roles = generators
    .filter((g) => g.collectionId === collectionId)
    .map((g) => {
      const base = g.baseVar ? resolveVariable(store, g.baseVar, {}) : null;
      const color = base?.type === "color" ? base.color : g.baseColor;
      return { name: g.group, hex: color.slice(0, 7).toUpperCase() };
    })
    .filter((r) => !tokenGroupOf(r.name));
  return { collectionId, collection: collection.name, roles };
}
