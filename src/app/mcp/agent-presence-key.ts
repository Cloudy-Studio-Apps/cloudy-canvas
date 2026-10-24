import type { McpMessageContext } from "@shared/core";

/**
 * Which collaborator a message is from: its MCP session, or its User-Agent for clients that keep
 * none. Presence, workspaces and undo notes are all keyed by it.
 */
export function presenceKey({ session, userAgent }: McpMessageContext): string {
  return session ?? `agent:${userAgent ?? "unknown"}`;
}
