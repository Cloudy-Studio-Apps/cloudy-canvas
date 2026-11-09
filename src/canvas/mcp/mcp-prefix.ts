import type { McpPrefixResult, McpToolOwner } from "./mcp-prefix.types";

/**
 * The prefix of a group's tools: a plugin's id (refused when the group declares its own prefix or
 * the id is a built-in prefix in `reserved`), else the group's declared topic (`group.prefix`,
 * which only core modules may declare) or its module's id. A feature module that declares a
 * prefix throws, naming it.
 */
export function mcpPrefixFor(
  group: { id: string; prefix?: string },
  owner: McpToolOwner,
  reserved: ReadonlySet<string>,
): McpPrefixResult {
  const { moduleId, pluginId } = owner;
  if (pluginId !== undefined) {
    if (group.prefix !== undefined) {
      return {
        refused: `The plugin's tool group "${group.id}" declares the prefix "${group.prefix}"; a plugin's tools take its id.`,
      };
    }
    if (reserved.has(pluginId)) {
      return { refused: `The plugin id "${pluginId}" is a built-in prefix.` };
    }
    return { prefix: pluginId };
  }
  if (group.prefix === undefined) return { prefix: moduleId };
  if (owner.tier !== "core") {
    throw new Error(
      `The module "${moduleId}" declares the prefix "${group.prefix}" on its MCP tool group "${group.id}"; only core modules may, a feature's tools take its module id.`,
    );
  }
  return { prefix: group.prefix };
}
