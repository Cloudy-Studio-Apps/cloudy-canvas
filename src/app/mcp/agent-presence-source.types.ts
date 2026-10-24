import type { Collaborator, McpObserver, PresenceSink } from "@shared/core";
import type { UndoNotes } from "./agent-undo-notes.types";
import type { PresenceFile } from "./presence-file.types";

export interface AgentPresenceSourceOptions {
  /** The board or design open in the window, with the user's engine. */
  openFile(): PresenceFile | null;
  sink: PresenceSink;
  /** The collaborator as the sink has it now. */
  read(id: string): Collaborator | undefined;
  /** Every collaborator the sink has now. */
  all(): Collaborator[];
  /** Where undone and redone steps are noted for the agent's next reply. */
  notes: UndoNotes;
}

/** Agents as collaborators: it hears the MCP server and writes their presence. */
export interface AgentPresenceSource extends McpObserver {
  /** The agent ended its session. */
  leave(id: string): void;
  /** Forgets agents silent for too long, with their workspaces. */
  prune(now: number): void;
}
