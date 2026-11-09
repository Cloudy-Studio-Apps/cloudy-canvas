import type { ExtensionPoint, ModuleHost } from "@shared/core";

import type { McpToolOwner } from "./mcp-prefix.types";

/**
 * Who contributed a group to a keyed tool point: its module, that module's tier and, through
 * `pluginOf`, the plugin it belongs to (a module without a tier is a plugin's whatever `pluginOf` says).
 */
export function mcpToolOwner<G extends { id: string }>(
  modules: ModuleHost,
  point: ExtensionPoint<G>,
  groupId: string,
  pluginOf: (moduleId: string) => string | undefined,
): McpToolOwner {
  const moduleId = modules.ownerOf(point, groupId);
  if (moduleId === undefined) {
    throw new Error(`The MCP tool group "${groupId}" has no module on "${point.id}".`);
  }
  const tier = modules.tierOf(moduleId);
  // Only built-in modules have a tier: anything without one is a plugin's, even when its plugin
  // isn't known (then it is named by the module), so it is refused and never throws.
  return {
    moduleId,
    tier,
    pluginId: pluginOf(moduleId) ?? (tier === undefined ? moduleId : undefined),
  };
}
