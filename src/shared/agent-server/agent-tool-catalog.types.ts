/** One tool the agent server offers, as the agent tools list shows it. */
export interface AgentToolInfo {
  name: string;
  description: string;
}

/**
 * The tools of one group. The built-in groups (`shared`, `board`, `design`) have no `title`: the
 * menu names them in the user's language; a plugin's section carries the plugin's name.
 */
export interface AgentToolSection {
  id: string;
  title?: string;
  tools: readonly AgentToolInfo[];
}

/** Reads the tools agents see right now (plugin tools included). */
export type AgentToolCatalog = () => AgentToolSection[];
