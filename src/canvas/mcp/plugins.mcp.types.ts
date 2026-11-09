/** An installed plugin, as agents see it. */
export interface AgentPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  state: "enabled" | "disabled" | "failed";
  error?: string;
  /** The full names of the agent tools it adds (when enabled). */
  tools: string[];
  /** Its agent tools that were left out, and why (a taken or invalid name, a reserved id). */
  refusedTools?: { name: string; reason: string }[];
}
