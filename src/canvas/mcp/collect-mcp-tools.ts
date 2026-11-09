import type { CollectedMcpTools } from "./collect-mcp-tools.types";
import type { McpToolGroup } from "./mcp-tool-group.types";
import { checkMcpToolName, mcpToolName } from "./mcp-tool-name";
import { mcpPrefixFor } from "./mcp-prefix";
import type { McpToolOwner } from "./mcp-prefix.types";

/**
 * The tools of one product's groups, in order, each named `<prefix>_<local name>` (`mcpPrefixFor`).
 * A name that's invalid or taken by an earlier tool throws for a built-in module (naming both
 * modules) and refuses a plugin's tool, as does a plugin id in `reserved` (the built-in prefixes).
 */
export function collectMcpTools<H, C>(
  groups: readonly McpToolGroup<H, C>[],
  context: C,
  ownerOf: (group: McpToolGroup<H, C>) => McpToolOwner,
  reserved: ReadonlySet<string>,
): CollectedMcpTools<H> {
  const result: CollectedMcpTools<H> = { tools: [], refused: [] };
  /** Full name → the module whose tool has it. */
  const taken = new Map<string, string>();

  for (const group of groups) {
    const owner = ownerOf(group);
    const { moduleId, pluginId } = owner;
    const prefix = mcpPrefixFor(group, owner, reserved);
    const tools = group.tools(context);
    if ("refused" in prefix) {
      // Only plugins are refused (built-ins throw), so `pluginId` is set.
      for (const tool of tools) {
        result.refused.push({
          name: mcpToolName(pluginId ?? moduleId, tool.name),
          pluginId: pluginId ?? moduleId,
          reason: prefix.refused,
        });
      }
      continue;
    }

    for (const tool of tools) {
      const name = mcpToolName(prefix.prefix, tool.name);
      const other = taken.get(name);
      const reason =
        checkMcpToolName(name) ??
        (other === undefined ? null : `"${name}" is the name of a tool of the module "${other}".`);
      if (reason !== null) {
        if (pluginId === undefined) {
          throw new Error(
            `The module "${moduleId}" adds an MCP tool that can't be served: ${reason}`,
          );
        }
        result.refused.push({ name, pluginId, reason });
        continue;
      }
      taken.set(name, moduleId);
      result.tools.push({ name, tool, moduleId, ...(pluginId !== undefined ? { pluginId } : {}) });
    }
  }
  return result;
}
