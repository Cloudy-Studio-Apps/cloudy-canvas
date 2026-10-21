import type { JsonSchema } from "@shared/core";

export type ToolArgs = Record<string, unknown>;

/**
 * A tool agents can call over MCP. Protocol-agnostic: the app adapts it (see `shared/core/mcp`).
 * `H` is what the tool can reach beyond its arguments, given by the product (e.g. the open board).
 */
export interface AgentTool<H = unknown> {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  /**
   * Returns a string, a `ToolImage` (from `@shared/core`) or a JSON value; throws with a message
   * the agent can act on.
   */
  run(host: H, args: ToolArgs): unknown;
}
