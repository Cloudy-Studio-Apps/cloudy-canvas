import type { FileType, McpMessageContext } from "@shared/core";
import type { ToolArgs } from "@canvas";
import type { AgentServerOptions } from "./agent-server-definition.types";
import type { ProductTool } from "./agent-tool-dispatch.types";

/** What a product tool answers when the agent has no file tab bound or active. */
export const NO_FILE_OPEN = "No file is open: open one with file_open or create one with file_new.";

/** The products a tool works on: both for a shared tool, none for an app tool. */
export function toolProducts(tool: ProductTool): FileType[] {
  if (tool.app) return [];
  return [
    ...(tool.board ? (["board"] as const) : []),
    ...(tool.design ? (["design"] as const) : []),
  ];
}

/**
 * Runs one call of a listed tool: after `prepare` readied the agent's tab, an app tool runs on
 * the agent's host; a product tool runs the implementation of the product of the agent's tab
 * (`productFor`, read now), and fails with a message the agent can act on when there's no file
 * or the tab's product doesn't have the tool.
 */
export async function runAgentTool(
  tool: ProductTool,
  { hostFor, prepare, productFor }: AgentServerOptions,
  context: McpMessageContext,
  args: ToolArgs,
): Promise<unknown> {
  const end = await prepare?.(context);
  try {
    if (tool.app) return await tool.app.tool.run(hostFor(context), args);
    const product = productFor(context);
    if (product === null) throw new Error(NO_FILE_OPEN);
    const implementation = tool[product];
    if (!implementation) {
      const products = toolProducts(tool)
        .map((each) => `${each}s`)
        .join(" and ");
      throw new Error(
        `This tool works on ${products}; your tab holds a ${product}. Use tabs_switch or file_open.`,
      );
    }
    return await implementation.tool.run(hostFor(context), args);
  } finally {
    end?.();
  }
}
