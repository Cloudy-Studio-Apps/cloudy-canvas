import { AGENT_CLIENTS, GENERIC_AGENT_CLIENT } from "./agent-clients";
import type { AgentClient } from "./agent-clients.types";
import type { IdentifiedAgent } from "./identify-agent.types";

/** Colors for agents whose app has no brand color, or a second agent of the same app. */
const AGENT_COLORS = ["#2f7de1", "#c2410c", "#0f8a5f", "#9333ea", "#be185d", "#0e7490"];

/**
 * Names an agent by the name it connected with (MCP `clientInfo.name`), else its User-Agent:
 * a known app (Claude Code, Cursor, …) or a generic agent.
 */
export function identifyAgent(
  clientName: string | null,
  userAgent: string | null,
): IdentifiedAgent {
  for (const text of [clientName, userAgent]) {
    if (!text) continue;
    const client = AGENT_CLIENTS.find((candidate) => candidate.match?.test(text));
    if (client) return { client, name: client.label };
  }
  return { client: GENERIC_AGENT_CLIENT, name: clientName?.trim() || "Agent" };
}

/** An agent client by id, the generic one when it's unknown. */
export function agentClient(id: string): AgentClient {
  return AGENT_CLIENTS.find((client) => client.id === id) ?? GENERIC_AGENT_CLIENT;
}

/**
 * The color for an agent of `client`: its brand color unless another agent already uses it, then
 * the first free one of a fixed list.
 */
export function agentColor(client: AgentClient, taken: readonly string[]): string {
  const brand = "hex" in client.icon ? `#${client.icon.hex}` : null;
  if (brand && !taken.includes(brand)) return brand;
  const free = AGENT_COLORS.find((color) => !taken.includes(color));
  return free ?? AGENT_COLORS[taken.length % AGENT_COLORS.length] ?? "#2f7de1";
}

/** "Claude Code", then "Claude Code 2" while another agent already has the name. */
export function agentName(name: string, taken: readonly string[]): string {
  if (!taken.includes(name)) return name;
  let n = 2;
  while (taken.includes(`${name} ${n}`)) n++;
  return `${name} ${n}`;
}
