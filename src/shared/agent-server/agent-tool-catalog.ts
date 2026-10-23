import type { AgentToolCatalog, AgentToolSection } from "./agent-tool-catalog.types";

let catalog: AgentToolCatalog | null = null;

/** Called by the app, which knows the products' agent tools, so the agent menu can list them. */
export function setAgentToolCatalog(read: AgentToolCatalog): void {
  catalog = read;
}

/** The tools agents see, by product and plugin; empty until the app registers its catalog. */
export function readAgentToolCatalog(): AgentToolSection[] {
  return catalog?.() ?? [];
}
