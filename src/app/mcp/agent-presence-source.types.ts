import type { Collaborator, McpObserver, PresenceSink } from "@shared/core";
import type { UndoNotes } from "./agent-undo-notes.types";
import type { PresenceFile } from "./presence-file.types";

export interface AgentPresenceSourceOptions {
  /**
   * The file the agent's presence follows, with the user's engine: its tab's, or while it's
   * unbound the active tab's; `null` when that has no editor mounted.
   */
  fileFor(key: string): PresenceFile | null;
  /** Whether the agent is bound to a tab (an unbound one's calls leave no workspace behind). */
  isBound(key: string): boolean;
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
  /**
   * The agent's tab is ready for its call (`prepareAgentCall`): a call that started before its
   * file was there is watched from now on.
   */
  prepared(key: string): void;
  /** The agent leaves the file it's in (its session ended, or it moves to another tab). */
  leave(id: string): void;
  /** Forgets agents silent for too long, with their workspaces. */
  prune(now: number): void;
}
