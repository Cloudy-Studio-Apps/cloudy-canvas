import type { AgentTool } from "./agent-tool.types";
import type { AgentToolGroup } from "./agent-tool-group.types";

/**
 * The tools of the groups, in order. A tool whose name is in `taken` (or an earlier tool took) is
 * left out and passed to `onSkipped`; the names kept are added to `taken`, so several products'
 * tools can be collected into one server.
 */
export function collectAgentTools<H, C>(
  groups: readonly AgentToolGroup<H, C>[],
  context: C,
  onSkipped?: (tool: AgentTool<H>, group: AgentToolGroup<H, C>) => void,
  taken: Set<string> = new Set(),
): AgentTool<H>[] {
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
