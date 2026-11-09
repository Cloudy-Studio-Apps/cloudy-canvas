import type { McpTool } from "./mcp-tool.types";

/** A tool as the server lists it: its full name and who added it. */
export interface CollectedMcpTool<H> {
  /** The full name, `<prefix>_<local name>`. */
  name: string;
  tool: McpTool<H>;
  /** The module that contributed its group. */
  moduleId: string;
  /** The plugin that module belongs to, if any. */
  pluginId?: string;
}

/** A plugin's tool that was left out, and why (in English). */
export interface RefusedMcpTool {
  /** The full name it would have had. */
  name: string;
  pluginId: string;
  reason: string;
}

/** What `collectMcpTools` found: the tools to serve and the plugins' tools left out. */
export interface CollectedMcpTools<H> {
  tools: CollectedMcpTool<H>[];
  refused: RefusedMcpTool[];
}
