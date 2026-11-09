import type { ExtensionPoint, ModuleHost } from "@shared/core";

import type { McpToolOwner } from "./mcp-prefix.types";

/**
 * Who contributed a group to a keyed tool point: its module, that module's tier and, through
 * `pluginOf`, the plugin it belongs to.
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
  return { moduleId, tier: modules.tierOf(moduleId), pluginId: pluginOf(moduleId) };
}
