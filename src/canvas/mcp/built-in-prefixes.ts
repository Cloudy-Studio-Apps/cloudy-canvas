import type { ExtensionPoint, ModuleHost } from "@shared/core";

/**
 * The prefixes a plugin id may not take in one product: the id of every built-in module (whether
 * or not it adds agent tools; plugins' modules have no tier) and the topics the built-in
 * modules' groups on its tool point declare.
 */
export function builtInPrefixes<G extends { id: string; prefix?: string }>(
  modules: ModuleHost,
  point: ExtensionPoint<G>,
): Set<string> {
  const prefixes = new Set(modules.moduleIds().filter((id) => modules.tierOf(id) !== undefined));
  for (const group of modules.get(point)) {
    if (group.prefix === undefined) continue;
    // A plugin's group may declare a prefix too, but it is refused: it reserves nothing.
    const owner = modules.ownerOf(point, group.id);
    if (owner !== undefined && modules.tierOf(owner) !== undefined) prefixes.add(group.prefix);
  }
  return prefixes;
}
