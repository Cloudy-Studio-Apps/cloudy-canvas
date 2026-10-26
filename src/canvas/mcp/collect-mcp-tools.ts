import type { McpTool } from "./mcp-tool.types";
import type { McpToolGroup } from "./mcp-tool-group.types";

/**
 * The tools of the groups, in order. A tool whose name is in `taken` (or an earlier tool took) is
 * left out and passed to `onSkipped`; the names kept are added to `taken`, so several products'
 * tools can be collected into one server.
 */
export function collectMcpTools<H, C>(
  groups: readonly McpToolGroup<H, C>[],
  context: C,
  onSkipped?: (tool: McpTool<H>, group: McpToolGroup<H, C>) => void,
  taken: Set<string> = new Set(),
): McpTool<H>[] {
  return groups.flatMap((group) =>
    group.tools(context).filter((tool) => {
      if (taken.has(tool.name)) {
        onSkipped?.(tool, group);
        return false;
      }
      taken.add(tool.name);
      return true;
    }),
  );
}
