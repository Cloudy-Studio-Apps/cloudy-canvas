import type { McpMessageContext } from "@shared/core";

/**
 * HTTP libraries an agent's scripts call the server with (curl, Python, …). Each script run starts
 * its own session, so these are told apart by User-Agent only: every run is the same agent.
 * shortcut: a real MCP client built on one of these libraries is grouped too; add an exception if
 * one shows up.
 */
const SCRIPT_USER_AGENT = /^(python-|curl\/|wget\/|go-http-client)|aiohttp|powershell/i;

/**
 * Which collaborator a message is from: its MCP session, or its User-Agent for clients that keep
 * none and for scripts. Presence, workspaces, tab bindings and undo notes are all keyed by it.
 */
export function presenceKey({ session, userAgent }: McpMessageContext): string {
  if (session && !(userAgent && SCRIPT_USER_AGENT.test(userAgent))) return session;
  return `agent:${userAgent ?? "unknown"}`;
}
