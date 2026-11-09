import type { ExtensionPoint, ModuleHost } from "@shared/core";

/**
 * The prefixes a plugin id may not take on one product's tool point: the ids of the built-in
 * modules that contribute to it and the topics its groups declare.
 */
export function builtInPrefixes<G extends { id: string; prefix?: string }>(
  modules: ModuleHost,
  point: ExtensionPoint<G>,
): Set<string> {
  const prefixes = new Set<string>();
  for (const group of modules.get(point)) {
    if (group.prefix !== undefined) prefixes.add(group.prefix);
    const owner = modules.ownerOf(point, group.id);
    if (owner !== undefined && modules.tierOf(owner) !== undefined) prefixes.add(owner);
  }
  return prefixes;
}
