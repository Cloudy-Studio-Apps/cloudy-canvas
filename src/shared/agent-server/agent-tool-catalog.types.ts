/** One tool the agent server offers, as the agent tools list shows it. */
export interface AgentToolInfo {
  name: string;
  description: string;
}

/** The tools of one product or plugin. */
export interface AgentToolSection {
  id: string;
  title: string;
  tools: readonly AgentToolInfo[];
}

/** Reads the tools agents see right now (plugin tools included). */
export type AgentToolCatalog = () => AgentToolSection[];
