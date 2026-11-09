import type { McpTool } from "./mcp-tool.types";

/**
 * Agent tools a module adds to its product, made when the agent server starts. `H` is what they
 * reach (the product's host), `C` what they're made with (e.g. the composed kinds).
 */
export interface McpToolGroup<H, C> {
  id: string;
  /**
   * The topic its tools' names start with (`shapes` → `shapes_create`). Only core modules' and
   * the shared groups declare one (core ones must); a feature's tools take its module id, a
   * plugin's its plugin id.
   */
  prefix?: string;
  tools(context: C): McpTool<H>[];
}
