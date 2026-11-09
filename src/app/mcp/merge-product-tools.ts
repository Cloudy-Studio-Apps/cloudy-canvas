import { sameSchema, type CollectedMcpTool, type RefusedMcpTool } from "@canvas";
import type { AgentHost } from "@board";
import type { DesignAgentHost } from "@design";
import type { AgentCallHost } from "./agent-server-definition.types";
import type { ProductTool } from "./agent-tool-dispatch.types";

/**
 * The tools the server lists, one per full name: the app tools (`app`, plus every product tool
 * with `scope: "app"`), then the products' tools. The same name in both products is one shared
 * tool when both take the same `inputSchema`; with different ones it's an error naming both
 * modules. An app tool may not share its name with any other tool. An error throws for a built-in
 * tool and leaves a plugin's tool out, added to `refused`.
 */
export function mergeProductTools(
  board: readonly CollectedMcpTool<AgentHost>[],
  design: readonly CollectedMcpTool<DesignAgentHost>[],
  app: readonly CollectedMcpTool<AgentCallHost>[],
  refused: RefusedMcpTool[],
): ProductTool[] {
  const merged = new Map<string, ProductTool>();
  const leaveOut = (tool: CollectedMcpTool<unknown>, reason: string) => {
    if (tool.pluginId === undefined) {
      throw new Error(
        `The module "${tool.moduleId}" adds an MCP tool that can't be served: ${reason}`,
      );
    }
    refused.push({ name: tool.name, pluginId: tool.pluginId, reason });
  };
  const addApp = (tool: CollectedMcpTool<AgentCallHost>) => {
    const other = merged.get(tool.name);
    if (other) return leaveOut(tool, takenBy(tool.name, other));
    merged.set(tool.name, { name: tool.name, app: tool });
  };
  const isApp = (tool: CollectedMcpTool<unknown>) => tool.tool.scope === "app";

  for (const tool of app) addApp(tool);
  for (const tool of board) if (isApp(tool)) addApp(tool);
  for (const tool of design) if (isApp(tool)) addApp(tool);

  for (const tool of board) {
    if (isApp(tool)) continue;
    const other = merged.get(tool.name);
    if (other) leaveOut(tool, takenBy(tool.name, other));
    else merged.set(tool.name, { name: tool.name, board: tool });
  }
  for (const tool of design) {
    if (isApp(tool)) continue;
    const other = merged.get(tool.name);
    if (!other) merged.set(tool.name, { name: tool.name, design: tool });
    else if (!other.board) leaveOut(tool, takenBy(tool.name, other));
    else if (!sameSchema(other.board.tool.inputSchema, tool.tool.inputSchema)) {
      leaveOut(
        tool,
        `"${tool.name}" is a tool of boards (module "${other.board.moduleId}") and of designs ` +
          `(module "${tool.moduleId}") with different inputSchemas; a tool of both products ` +
          `takes the same arguments in both.`,
      );
    } else other.design = tool;
  }
  return [...merged.values()];
}

/** The implementation whose description and schema the server lists. */
export function listedTool(tool: ProductTool): CollectedMcpTool<unknown> {
  const listed = tool.app ?? tool.board ?? tool.design;
  if (!listed) throw new Error(`The MCP tool "${tool.name}" has no implementation.`);
  return listed;
}

/** Every implementation of the tool (one, or both products' for a shared tool). */
export function toolImplementations(tool: ProductTool): CollectedMcpTool<unknown>[] {
  return [tool.app, tool.board, tool.design].filter((each) => each !== undefined);
}

/** Why a name is taken: by which module, or modules for a shared tool. */
function takenBy(name: string, other: ProductTool): string {
  const modules = toolImplementations(other).map((tool) => `"${tool.moduleId}"`);
  const of = modules.length > 1 ? "the modules" : "the module";
  return `"${name}" is the name of a tool of ${of} ${modules.join(" and ")}.`;
}
