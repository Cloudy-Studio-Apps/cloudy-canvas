import type { McpTool } from "./mcp-tool.types";

/**
 * Agent tools a module adds to its product, made when the agent server starts. `H` is what they
 * reach (the product's host), `C` what they're made with (e.g. the composed kinds).
 */
export interface McpToolGroup<H, C> {
  id: string;
  /**
   * The topic its tools' names start with (`shapes` → `shapes_create`). Only core modules and the
   * shared groups may declare one; without it the tools take the module id, and a plugin's always
   * take its plugin id.
   */
  prefix?: string;
  tools(context: C): McpTool<H>[];
}
