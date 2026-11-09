import type { McpTool } from "../mcp-tool.types";

/**
 * The part of a tool both products serve under one name (a shared tool): its local name, its one
 * description and its `inputSchema`, which must be the same in both. Each product adds its `run`.
 */
export type SharedToolSpec = Pick<McpTool, "name" | "description" | "inputSchema">;
