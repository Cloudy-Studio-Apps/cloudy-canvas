import type { FileType } from "@shared/core";

/** An open tab as agents see it: never its content. */
export interface AgentTab {
  name: string;
  type: FileType;
  /** The calling agent works in it. */
  mine: boolean;
  /** The names of the agents and people in it, as its button shows them. */
  collaborators: string[];
}

/** A file a name could mean. */
export interface AgentFileMatch {
  name: string;
  type: FileType;
  /** The name of the project it's in, `null` for a file in none. */
  project: string | null;
  path: string;
}

/** Several files (or tabs) match a name: nothing changed, the agent asks the user. */
export interface AgentFileCandidates {
  candidates: AgentFileMatch[];
}

/** A project a new file's name could belong to: nothing was created, the agent asks the user. */
export interface AgentProjectChoice {
  matchingProjects: { id: string; name: string }[];
}

/** A file to open: by its storage id (`list_recent_*`) or by its name. */
export type AgentFileRef = { id: string } | { name: string };

/** What a new file is made with. */
export interface AgentNewFile {
  name?: string;
  /** A project's id, or `"none"` for a draft. */
  project?: string;
}

/** What the tab tools reach, for the calling agent (see `app/mcp/tabs`). */
export interface TabsAgentHost {
  tabs(): Promise<AgentTab[]>;
  /** Moves the agent to the open tab with that name. */
  switchTab(name: string): Promise<AgentTab | AgentFileCandidates>;
}
